"""Isolated real-game VFX capture; blocks save writes and uses a disposable slot."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/vfx/level_up_gold_20260910'
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=level-up-vfx-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof P!=='undefined'&&P&&G.map&&_atlasPReady&&typeof _levelUpVfx!=='undefined'",timeout=60000)
    page.mouse.click(500,350)
    page.evaluate('''()=>{
      window._btFramePause=true;_cutsceneState=null;_cutC.style.display='none';
      G._cutsceneDone=true;G._intro=false;G.on=true;G.paused=false;BGM.stop();
      for(const id of ['intro','introDiff','introKeys','tutorial','loading','bootLoading']){const el=document.getElementById(id);if(el)el.style.display='none';}
      P.s='idle';P.hp=P.mhp;P.iframes=0;P.shield=0;P.lv=1;P.exp=0;P.maxExp=_calcMaxExp(1);
      ens.length=0;projs.length=0;pProjs.length=0;G.txts.length=0;G._fireZones=[];
      G._bonfire=null;G.shake=0;G.cam.x=P.x;G.cam.y=P.y;G._camZoom=1;
      window._vfxQaBefore={lv:P.lv,sp:P.sp||0,ap:P.ap||0};
    }''')
    page.wait_for_timeout(1200)
    before=page.screenshot(path=str(OUT/'before.png'))
    result=page.evaluate('''()=>{
      const sp=P.sp||0;P.sp=sp;const ap=P.ap||0;
      addExp(P.maxExp,true);
      return {level:P.lv,spGain:P.sp-sp,apGain:P.ap-ap,active:_levelUpVfx.active,backend:_useGL?'WebGL2':_useGPU?'WebGPU':'Canvas2D'};
    }''')
    assert result['level']==2 and result['spGain']==3 and result['apGain']==1 and result['active'],result
    samples=[]
    for t in [.08,.2,.45,.85,1.3,1.5]:
        sample=page.evaluate('''t=>{
          _levelUpVfx.update(t-_levelUpVfx.age,P,G.stage);
          const seen=[];const real=X.drawImage,fxDraw=_levelUpVfx.draw;let inEffect=false;
          _levelUpVfx.draw=function(...a){inEffect=true;try{return fxDraw.apply(this,a);}finally{inEffect=false;}};
          X.drawImage=function(...a){if(inEffect)seen.push({x:a[5],y:a[6],w:a[7],h:a[8]});return real.apply(this,a);};
          draw();if(_useGL||_useGPU)_glFlush();X.drawImage=real;_levelUpVfx.draw=fxDraw;
          return {time:t,active:_levelUpVfx.active,draws:seen.length,finite:seen.every(d=>Object.values(d).every(Number.isFinite))};
        }''',t)
        page.wait_for_timeout(60)
        page.screenshot(path=str(OUT/f'frame_{int(t*1000):04d}.png'))
        assert sample['finite'],sample
        if t<1.45:assert sample['draws']>0,sample
        else:assert sample['draws']==0 and not sample['active'],sample
        samples.append(sample)
    # Canvas fallback uses the same atlas, with no WebGL-only drawing operations.
    fallback=page.evaluate('''()=>{
      const canvas=document.createElement('canvas');canvas.width=480;canvas.height=420;
      const ctx=canvas.getContext('2d'),p={x:240,y:280,hp:100};
      const fx=LevelUpVfx.create();fx.trigger(p,0,1);fx.update(.15,p,0);
      fx.draw(ctx,p,0,false,false);fx.draw(ctx,p,0,true,false);
      const data=ctx.getImageData(0,0,480,420).data;let visible=0;
      for(let i=3;i<data.length;i+=4)if(data[i]>8)visible++;
      return {visible,data:canvas.toDataURL()};
    }''')
    import base64
    (OUT/'canvas_fallback.png').write_bytes(base64.b64decode(fallback.pop('data').split(',')[1]))
    assert fallback['visible']>1000,fallback
    # Frame-by-frame preview, running the actual effect over the actual game world.
    frames=OUT/'frames';frames.mkdir(exist_ok=True)
    page.evaluate("()=>{G.txts.length=0;_levelUpVfx.trigger(P,G.stage,1);}")
    for i in range(60):
        if i:page.evaluate("()=>_levelUpVfx.update(1/30,P,G.stage)")
        page.wait_for_timeout(35)
        page.screenshot(path=str(frames/f'{i:03d}.png'))
    report={'status':'PASS','runtime':result,'samples':samples,'canvas_fallback':fallback,'page_errors':errors,'real_save_writes':False}
    assert not errors,errors
    (OUT/'qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False),flush=True)
    browser.close()
