"""Capture production CH1 cameras and audit the local living-detail renderer."""
import json
import sys
import io
import time
from PIL import Image
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('captures/ch1_living_detail_pass9_20260926') / ('before' if '--before' in sys.argv else 'after')
out.mkdir(parents=True, exist_ok=True)
errors, failed, boards = [], [], []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width':1280,'height':720},record_video_dir=str(out),record_video_size={'width':1280,'height':720})
    page = context.new_page()
    if '--before' in sys.argv:
        page.route('**/ch1-living-detail.js*',lambda route:route.fulfill(path='tmp/ch1-living-detail-pass8.js',content_type='text/javascript'))
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type=='error' else None)
    page.on('response', lambda r: failed.append(r.url) if r.status >= 400 else None)
    page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1', wait_until='domcontentloaded', timeout=90000)
    page.wait_for_function("typeof G!=='undefined' && G.map && typeof P!=='undefined'",timeout=90000)
    for _ in range(5):
        if page.evaluate("typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'"):
            page.keyboard.press('Escape')
        page.wait_for_timeout(400)
        if page.locator('#ikSkip').is_visible():
            page.locator('#ikSkip').evaluate('(button)=>button.click()')
    page.wait_for_load_state('networkidle',timeout=30000)
    page.wait_for_function('__ch1StartOuterQA().stats.drawnIds.length>0',timeout=30000)
    page.evaluate('closeAllPanels()')
    # Visual/input audit only: preserve enemy/VFX behavior, prevent death interrupting the camera tour.
    page.evaluate("window.__ch1QAHeal=setInterval(()=>{if(P&&P.hp>0)P.hp=P.mhp;},50)")
    for name, tx, ty in [('TISSUE_DETAIL',91,184),('START',100,180),('EARLY',100,157),('ARENA',100,120),('SIDE_L',49,151),('SIDE_R',151,136),('LANDMARK',83,80),('LATE',100,48),('EXIT',100,15),('TREE_DETAIL',102,97),('COCOON_DETAIL',47,56),('POOL_DETAIL',162,141),('AUTHORED_POOL',167,45)]:
        state=page.evaluate('''([x,y])=>{P.x=(x+.5)*T;P.y=(y+.5)*T;G.cam.x=P.x;G.cam.y=P.y;const top=document.elementFromPoint(640,360);return {tile:G.map[y][x],topElement:top?.outerHTML?.slice(0,500),objects:MAP_OBJS.filter(o=>Math.abs(o.x-P.x)<800&&Math.abs(o.y-P.y)<600).map(o=>({type:o.type,x:o.x,y:o.y}))}}''',[tx,ty])
        page.wait_for_timeout(1500)
        assert page.evaluate("P.hp>0&&P.s!=='fallen'&&P.s!=='dead'"), 'camera tour interrupted by player death'
        page.screenshot(path=str(out / (name+'.png')))
        if name in ['TISSUE_DETAIL','COCOON_DETAIL','AUTHORED_POOL','POOL_DETAIL']:
            frames, times = [], []
            for _ in range(24):
                times.append(time.monotonic())
                frames.append(Image.open(io.BytesIO(page.screenshot(clip={'x':400,'y':80,'width':480,'height':360}))).convert('RGB'))
                page.wait_for_timeout(250)
            durations=[round((b-a)*1000) for a,b in zip(times,times[1:])]
            frames[0].save(out/(name.lower()+'-closeup.gif'),save_all=True,append_images=frames[1:],duration=durations+[durations[-1]],loop=0)
        if name in ['START','TREE_DETAIL','COCOON_DETAIL','POOL_DETAIL']:
            page.wait_for_timeout(6000)
            page.screenshot(path=str(out / (name+'_motion.png')))
        boards.append({'name':name,**state})
    audit=page.evaluate('''()=>{
      if(!globalThis.Ch1LivingDetail)return null;
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
      const c=canvas.getContext('2d'),before=JSON.stringify(G.map),samples=[];
      c.translate(640-G.cam.x,360-G.cam.y);
      for(let i=0;i<120;i++){const t=performance.now();Ch1LivingDetail.draw(c,G,MAP_OBJS,i*50,1280,720);samples.push(performance.now()-t);}
      samples.sort((a,b)=>a-b);
      return {mapUnchanged:before===JSON.stringify(G.map),cpuP95:samples[114],cpuMax:samples[119]};
    }''')
    page.evaluate('P.x=100.5*T;P.y=180.5*T;G.cam.x=P.x;G.cam.y=P.y;closeAllPanels()')
    start=page.evaluate('({x:P.x,y:P.y})')
    for key in ['w','d','s','a']:
        page.keyboard.down(key);page.wait_for_timeout(650);page.keyboard.up(key)
    end=page.evaluate('({x:P.x,y:P.y})')
    page.mouse.move(880,300);page.mouse.down();page.wait_for_timeout(1200)
    page.keyboard.press('q');page.screenshot(path=str(out/'COMBAT.png'));page.mouse.up()
    frame_times=page.evaluate('''()=>new Promise(resolve=>{const times=[];let last=performance.now();function step(t){times.push(t-last);last=t;if(times.length<91)requestAnimationFrame(step);else{times.shift();times.sort((a,b)=>a-b);resolve({median:times[45],p95:times[85],samples:90});}}requestAnimationFrame(step);})''')
    sheet=Image.new('RGB',(1280,720),'#141216')
    for i,name in enumerate([b['name'] for b in boards]+['COMBAT']):
        shot=Image.open(out/(name+'.png')).convert('RGB');shot.thumbnail((320,180));sheet.paste(shot,((i%4)*320,(i//4)*180))
    sheet.save(out/'camera-board.jpg',quality=90)
    death_check=page.evaluate('''()=>{clearInterval(window.__ch1QAHeal);const buttonPresent=!!document.getElementById('deathReplayBtn');try{P._fallenCanRevive=false;P.s='fallen';G.paused=true;_fallenResolve();return {buttonPresent,shown:document.getElementById('death').classList.contains('on'),error:null};}catch(e){return {buttonPresent,error:String(e),stack:e.stack};}}''')
    result={'errors':errors,'httpErrors':failed,'cameras':boards,'detail':audit,'deathCheck':death_check,'inputQA':{'healthRefillMs':50,'start':start,'end':end,'frameTimesMs':frame_times},'outer':page.evaluate('__ch1StartOuterQA()')}
    (out/'runtime.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'errors':errors,'httpErrors':failed,'captures':str(out)},ensure_ascii=False))
    context.close()
    page.video.save_as(str(out / 'camera-tour.webm'))
    browser.close()
