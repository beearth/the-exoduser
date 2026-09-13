"""Validate cleaned art in the actual cutscene renderer without writing real saves."""
from pathlib import Path
import json, hashlib
from PIL import Image
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
O=R/'output/image_texture_cleanup_20260913';O.mkdir(parents=True,exist_ok=True)
names=[f'{i:02}.png' for i in range(21)]+['cin_nemesia_appear1.png']
paths=['assets/cutscene/images/'+n for n in names]+['img/lording/'+n+'.png' for n in ['1','2','3','rd4']]
asset_info=[]
for name in paths:
    with Image.open(R/name) as im:
        im.load();assert abs(im.width/im.height-16/9)<.01,(name,im.size)
        asset_info.append({'path':name,'width':im.width,'height':im.height,'bytes':(R/name).stat().st_size,'sha256':hashlib.sha256((R/name).read_bytes()).hexdigest()})
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=clean-shading-qa',wait_until='domcontentloaded')
    page.wait_for_function("typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'",timeout=60000)
    decoded=page.evaluate('''async names=>{
      const result=[];
      for(const name of names){const im=_getCutsceneImg(name);await im.decode();result.push({name,w:im.naturalWidth,h:im.naturalHeight,src:im.src});}
      return result;
    }''',names)
    assert all('20260913-clean-shading' in x['src'] and x['w']>0 for x in decoded)
    assert page.evaluate("typeof _cutGrain==='undefined'&&Object.values(INTRO_CUTSCENE_LINES).flat().every(l=>!('grain' in (l.vfx||{})))&&Object.values(PROLOGUE_LINES).flat().every(l=>!('grain' in (l.vfx||{})))")
    captures=[]
    for name in ['05.png','03.png','10.png','19.png']:
        page.evaluate('''name=>{OPT.lang='ko';_cutSeq='INTRO';_cutLineIdx=INTRO_CUTSCENE_LINES.ko.findIndex(l=>l.img===name);const ln=INTRO_CUTSCENE_LINES.ko[_cutLineIdx];_cutLineStartMs=performance.now()-(ln.text&&ln.speaker?20000:ln.dur*.5);_cutWaitInput=true;_renderIntroCutscene();}''',name)
        page.screenshot(path=str(O/f'game_{Path(name).stem}.png'))
        assert page.evaluate('_cutsceneGetLines()[_cutLineIdx].img')==name
        captures.append(name)
    # Exercise the existing next-cut input contract from the dialogue to the toy horse.
    page.evaluate("_cutLineIdx=INTRO_CUTSCENE_LINES.ko.findIndex(l=>l.id===5);_cutLineStartMs=performance.now()-20000;_cutWaitInput=true;_cutsceneAdvance()")
    assert page.evaluate('_cutsceneGetLines()[_cutLineIdx].id')==6
    loads=page.evaluate('''async ()=>{const result=[];for(const n of [1,2,3]){const im=new Image();im.src=_STAGE_TRANSITION_RD[n-1];await im.decode();result.push(im.src);}return result;}''')
    assert all('20260913-lobby-smooth1' in u for u in loads)
    page.evaluate("_cutsceneState='QA_PAUSED';_cutC.style.display='none';const el=document.getElementById('stageTransition');el.style.opacity='1';document.getElementById('stRndImg').src=_STAGE_TRANSITION_RD[2]")
    page.wait_for_function("document.getElementById('stRndImg').complete")
    page.wait_for_function("Number(getComputedStyle(document.getElementById('stageTransition')).opacity)>=.99")
    page.screenshot(path=str(O/'loading_cat.png'))
    # Execute the actual lobby background and image picker on an isolated document.
    lobby=browser.new_page()
    lobby.set_content('<base href="http://127.0.0.1:3333/">',wait_until='networkidle')
    source=(R/'index.html').read_text(encoding='utf-8')
    bg=next(line for line in source.splitlines() if line.startswith('(function(){const n=~~(Math.random()*19)'))
    lobby.evaluate(bg)
    lobby.wait_for_function("document.body.style.backgroundImage.includes('20260913-lobby-smooth1')")
    picker=source[source.index('const _RD_IMGS='):source.index('function showLoading(')]
    lobby_url=lobby.evaluate(picker+'\npickRandomLoadingImage();')
    assert '?v=20260913-lobby-smooth1' in lobby_url
    assert lobby.request.get('http://127.0.0.1:3333/img/lording/rd4.png?v=20260913-lobby-smooth1').ok
    assert not errors,errors
    browser.close()
(O/'qa.json').write_text(json.dumps({'status':'PASS','assets':asset_info,'decoded':decoded,'captures':captures,'page_errors':errors,'real_save_writes':False,'next_cut_id':6,'loading_urls':loads},ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: 26 files decode,22 runtime cutscene images,4 screenshots,grain removed,loading cache URLs,next-cut input; no real save writes.')
