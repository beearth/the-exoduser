"""Check level labels and Humanity/Demon palettes in the actual game renderer."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/vfx/level_up_readability_20260910';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=level-up-identity-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof P!=='undefined'&&P&&G.map&&_atlasPReady&&typeof _levelUpVfx!=='undefined'",timeout=60000)
    page.mouse.click(500,350)
    page.evaluate('''()=>{
      window._btFramePause=true;_cutsceneState=null;_cutC.style.display='none';
      G._intro=false;G.on=true;G.paused=false;G._bonfire=null;G._fireZones=[];BGM.stop();
      for(const id of ['intro','introDiff','introKeys','tutorial','loading','bootLoading']){const el=document.getElementById(id);if(el)el.style.display='none';}
      P.s='idle';P.hp=P.mhp;P.iframes=0;P.shield=0;ens.length=0;projs.length=0;pProjs.length=0;
      G.cam.x=P.x;G.cam.y=P.y;G._camZoom=1;G.shake=0;
    }''')
    page.wait_for_timeout(1200)
    report=[]
    for human,demon,name,color in [(0,0,'human_gold','#ffe6a3'),(1,3,'demon_violet','#e5b4ff')]:
        result=page.evaluate('''({human,demon})=>{
          _levelUpVfx.update(4,P,G.stage);P.lv=11;P.exp=0;P.maxExp=_calcMaxExp(11);
          PASSIVES.pHuman=human;PASSIVES.pDemon=demon;G.txts.length=0;
          addExp(P.maxExp,true);_levelUpVfx.update(2.5,P,G.stage);
          const stamps=[],stampCtx={save(){},restore(){},drawImage(){stamps.push(this.globalAlpha);}};
          _levelUpVfx.draw(stampCtx,P,G.stage,false,false);_levelUpVfx.draw(stampCtx,P,G.stage,true,false);
          const labels=[],real=X.fillText,drawLabel=_levelUpVfx.drawLabel;let inLabel=false;
          _levelUpVfx.drawLabel=function(...a){inLabel=true;try{return drawLabel.apply(this,a);}finally{inLabel=false;}};
          X.fillText=function(text,x,y){if(inLabel)labels.push({text,x,y,color:X.fillStyle,alpha:X.globalAlpha});return real.apply(this,arguments);};
          draw();if(_useGL||_useGPU)_glFlush();X.fillText=real;_levelUpVfx.drawLabel=drawLabel;
          const glyphs=[..._txtUV.entries()].filter(([key])=>key.includes('\tLv. 12\t')).map(([key,uv])=>({key,h:uv.h,v1:uv.v1}));
          return {age:_levelUpVfx.age,stamps,level:P.lv,player:{x:P.x,y:P.y},labels,glyphs,backend:_useGL?'WebGL2':_useGPU?'WebGPU':'Canvas2D'};
        }''',{'human':human,'demon':demon})
        assert result['level']==12 and len(result['labels'])==5,result
        assert len(result['stamps'])>=2 and max(result['stamps'])>.03,result['stamps']
        assert result['glyphs'] and all(g['h']<60 and g['v1']<=1 for g in result['glyphs']),result['glyphs']
        label=result['labels'][-1]
        assert label['text']=='Lv. 12' and label['color']==color and label['alpha']==1,label
        assert label['y']<result['player']['y']-60 and label['x']==result['player']['x'],result
        page.wait_for_timeout(60);page.screenshot(path=str(OUT/f'{name}.png'))
        report.append({'mode':name,**result})
    expired=page.evaluate("()=>{_levelUpVfx.update(1.1,P,G.stage);return !_levelUpVfx.active;}")
    assert expired
    assert not errors,errors
    final={'status':'PASS','cases':report,'page_errors':errors,'real_save_writes':False}
    (OUT/'qa.json').write_text(json.dumps(final,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(final));browser.close()
