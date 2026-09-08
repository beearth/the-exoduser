"""Starter/growth equipment output benchmark, not an autonomous player or TTK claim."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('captures/druid_finale_20260909');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?demo&bosstest=3',wait_until='networkidle')
    page.wait_for_function('typeof G!=="undefined"&&G._bossArena&&findBoss()&&document.getElementById("_btPanel")',timeout=60000)
    page.evaluate('''()=>{G.paused=true;document.getElementById('_btPanel').style.display='none';
      window._qaHurtE=hurtE;hurtE=function(e,...args){const old=e.hp+(e.eShield||0);const r=_qaHurtE(e,...args);if(e===window._qaBoss)window._qaDamage+=Math.max(0,old-e.hp-(e.eShield||0));return r;};
    }''')
    profiles=[]
    for lv,rarity in [(1,0),(30,1),(60,2)]:
        initial=page.evaluate('''([lv,rarity])=>{
          G.paused=true;window._btGod=false;P=mkP();P.lv=lv;STATS={str:0,dex:0,int:0,vit:0,lck:0};
          PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);UPGRADES={hp:0,atk:0,def:0,mp:0,st:0,spd:0};_grit=0;
          for(const sl in INV.equipped)INV.equipped[sl]=null;
          const rand=Math.random;let seed=909;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
          try{for(const it of defaultItems())INV.equipped[it.slot]=rarity?mkItem(it.slot,0,EL.P,rarity,it.wtype):it;}finally{Math.random=rand;}
          _eqAffixCache=null;_eqStatCache=null;recalcSt();applyStats();P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.shield=P.mshield;
          const e=mkEn(G.mw*T/2,G.mh*T/2,3,0,true,STG[3].be,0);ens=[e];G._bossRef=e;G._druidFinaleBoss=e;G._druidVictory=null;G.bossAlive=true;
          e._spawnT=0;e.reviveIframes=0;e.s='bossDruidRest';e.st2=99999;e.stunned=0;
          P.x=e.x+e.r+P.r+5;P.y=e.y;P.iframes=99999;
          G._worms=[];G._lavaPools=[];G._druidOrbs=[];projs.length=0;
          window._qaBoss=e;window._qaDamage=0;
          window._qaPin=setInterval(()=>{if(e.alive){e.s='bossDruidRest';e.st2=99999;e.x=G.mw*T/2;e.y=G.mh*T/2;e.kb={x:0,y:0};P.x=e.x+e.r+P.r+5;P.y=e.y;P.kb={x:0,y:0};}},16);
          G.paused=false;
          return {lv,rarity,tier:0,weapon:wp(),hp:P.mhp,st:P.mst,mp:P.mmp,melee:meleeRef(),antiRevive:_eqAffix('antiRevive'),speed:P.speed,bossHp:e.mhp,bossShield:e.eShield||0,bossRevPts:e._revPts};
        }''',[lv,rarity])
        page.wait_for_timeout(1000)
        target=page.evaluate('''()=>({x:VW/2+(_qaBoss.x-G.cam.x)*G._camZoom,y:VH/2+(_qaBoss.y-G.cam.y)*G._camZoom})''')
        page.mouse.move(target['x'],target['y']);page.mouse.down()
        start=page.evaluate('performance.now()')
        page.wait_for_timeout(12000)
        page.mouse.up()
        result=page.evaluate('''start=>{clearInterval(_qaPin);G.paused=true;return {seconds:(performance.now()-start)/1000,damage:_qaDamage,remainingSt:P.st,remainingMp:P.mp,deaths:_qaBoss.deaths||0,playerState:P.s};}''',start)
        result['dps']=result['damage']/result['seconds']
        result['first_life_output_seconds']=(initial['bossHp']+initial['bossShield'])/max(.01,result['dps'])
        profiles.append({'profile':initial,'result':result})
        print('PROFILE',lv,rarity,result,flush=True)
    # Same production formulas, seeded Monte Carlo; no changes to the game balance.
    source=Path('game.html').read_text(encoding='utf8')
    def expression(var):
        marker='const '+var+'=';a=source.index(marker)+len(marker);return source[a:source.index(';',a)]
    expressions={k:expression(k) for k in ['_revBase','_revCh','_rv2Base']}
    revival=page.evaluate('''expr=>{
      const immediate=new Function('e','_bSuppress','const G={stage:3};const _revBase='+expr._revBase+';return '+expr._revCh);
      const fallback=new Function('e','_rv2Sup','const G={stage:3};const _rv2Base='+expr._rv2Base+';return Math.max(0,_rv2Base-(e.deaths||0)*0.25-_rv2Sup);');
      let seed=909;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      return [0,.3,.6,1].map(suppress=>{const counts=[];
        for(let n=0;n<10000;n++){let pts=218,deaths=0,revives=0;while(pts>0&&deaths<30){deaths++;pts=Math.max(0,pts-10-(suppress>0?Math.floor(Math.min(5,suppress*10+2)):0));
          if(pts>0&&rand()<immediate({deaths},suppress)){revives++;continue;}
          if(pts>0&&rand()<fallback({deaths},suppress)){pts=Math.max(0,pts-10);revives++;continue;}break;}
          counts.push(revives);}
        counts.sort((a,b)=>a-b);return {suppress,mean:counts.reduce((a,b)=>a+b,0)/counts.length,p10:counts[1000],median:counts[5000],p90:counts[9000]};});
    }''',expressions)
    report={'method':'12s real LMB input; fixed passive boss, no player stat boost or resource refill; seeded T0 gear, auto level stats only; first-life output extrapolation is NOT encounter TTK. Revival model excludes full-HP and holyPrison cost bonuses.','profiles':profiles,'revival':revival,'errors':errors}
    (out/'balance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    assert not errors,errors
    print('REVIVAL',revival,flush=True)
    browser.close()
