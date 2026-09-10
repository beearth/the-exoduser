from pathlib import Path
import json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
O=R/'output/cinematic/nemesia_dialogue_20260910';O.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=nemesia-dialogue-qa',wait_until='domcontentloaded')
    page.wait_for_function("typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'",timeout=60000)
    page.evaluate("OPT.lang='ko';_cutSeq='INTRO';_cutLineIdx=INTRO_CUTSCENE_LINES.ko.findIndex(l=>l.id===5);_cutLineStartMs=performance.now()-20000;_cutWaitInput=true;_getCutsceneImg('03.png')")
    page.wait_for_function("_cutsceneImgCache['03.png'].complete&&_cutsceneImgCache['03.png'].naturalWidth>0")
    page.wait_for_timeout(200)
    result=page.evaluate('''()=>{
      const line=_cutsceneGetLines()[_cutLineIdx];
      const data=globalThis.ExoduserLocalizationData.stories;
      const translations=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.intro['5']]));
      const layout=[];
      for(const lang of ['ko',...Object.keys(data)]){
        OPT.lang=lang;const l=_cutsceneGetLines()[_cutLineIdx],cw=_cutC.width,ch=_cutC.height;
        _cutX.font=Math.max(13,ch*.018)+'px "Noto Sans KR",sans-serif';
        const rows=ExoduserI18n.wrapText(l.text,cw*.84,t=>_cutX.measureText(t).width,lang);
        const gap=Math.max(22,ch*.035),lh=Math.max(20,ch*.028),fs=Math.max(13,ch*.018);
        const h=Math.max(ch*.22,(gap+(rows.length-1)*lh+fs+Math.max(12,ch*.025))/.75);
        const bottom=ch-h+h*.25+gap+(rows.length-1)*lh+fs/2;
        layout.push({lang,rows:rows.length,bottom,height:ch,allText:rows.join('').replace(/\\s/g,'')===l.text.replace(/\\s/g,'')});
      }
      OPT.lang='ko';_renderIntroCutscene();
      return {text:line.text,id:line.id,image:line.img,nextImage:_cutsceneGetLines()[_cutLineIdx+1].img,waitForInput:_cutWaitInput,translations,layout};
    }''')
    assert result['text']=='그토록 피를 묻히고도, 네놈 안의 선의는 아직 남아 있구나.\n네가 구해야 할 이가 누구인지… 잊지는 않았겠지?\n아직도 너를 기다리고 있다.\n서둘러라. 너무 늦기 전에.'
    assert result['id']==5 and result['image']=='03.png' and result['nextImage']=='04.png' and result['waitForInput']
    for lang,text in result['translations'].items():
        assert text==json.loads((R/f'localization/character-story/{lang}.json').read_text(encoding='utf-8'))['intro']['5']
    assert len(result['translations'])==28 and all(l['allText'] and l['bottom']<l['height'] for l in result['layout'])
    page.screenshot(path=str(O/'korean_dialogue.png'))
    page.evaluate('_cutsceneAdvance()')
    assert page.evaluate('_cutsceneGetLines()[_cutLineIdx].id')==6
    assert not errors,errors
    (O/'qa.json').write_bytes(json.dumps({'status':'PASS','result':result,'page_errors':errors,'real_save_writes':False},ensure_ascii=False,indent=2).encode('utf-8'))
    print('PASS: approved Korean,28 translations,29 layouts,input wait,next wooden-horse cut');browser.close()
