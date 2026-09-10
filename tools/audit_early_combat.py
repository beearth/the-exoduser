"""Read production combat formulas in an isolated browser; never write real saves."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:
            route.fulfill(json={'ok': True, 'data': {'charIdx': 0}})
        elif route.request.method != 'GET':
            route.fulfill(json={'ok': True})
        else:
            route.continue_()
    page.route('**/api/**', api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=early-combat-qa', wait_until='domcontentloaded', timeout=60000)
    page.wait_for_function("typeof P!=='undefined'&&P&&G.map&&typeof hurtE==='function'", timeout=60000)
    report = page.evaluate('''()=>{
      window._btFramePause=true; G.paused=true; BGM.stop();
      const rand=Math.random; let seed=910; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      try {
        const pos={x:P.x,y:P.y};
        P=mkP(); Object.assign(P,pos); STATS={str:0,dex:0,int:0,vit:0,lck:0};
        PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0); UPGRADES={hp:0,atk:0,def:0,mp:0,st:0,spd:0}; _grit=0;
        for(const sl in INV.equipped) INV.equipped[sl]=null;
        for(const it of defaultItems()) INV.equipped[it.slot]=it;
        _eqAffixCache=null;_eqStatCache=null;Math.random=()=>.5;
        OPT.diff=5; G.stage=0; G._stageDiffOff=0; ens=[];
        const rows=[],kills=[];
        for(const lv of [1,5,10,20,30,50,100]) {
          P.lv=lv; recalcSt();applyStats();P.hp=P.mhp; P.mp=P.mmp; P.st=P.mst;
          for(const skillLv of [1,Math.max(1,Math.min(20,Math.floor(lv/5)+1))]) {
            if(skillLv===1&&rows.some(r=>r.lv===lv))continue;
            P.skills.kiSlash=skillLv;P.skills.fireball=skillLv;
            const ki=~~(meleeRef()*7*statStr()*pAtkMul()*_skMul('kiSlash'));
            const fire=~~(magicRef()*statInt()*pMagicMul()*_skMul('fireball')*_fuseMul('fireball'));
            const swing=~~((P.baseAtk+wp().atk+enhMulAtk(wp().enh||0)+15)*6*pAtkMul()*pMeleeMul());
            _fireXbow(P.x+100,P.y);const bow=pProjs.pop().dmg;
            const attacks={ki:{dmg:ki,el:0,opts:{poiseHit:true}},fire:{dmg:fire,el:EL.D,opts:{magic:true,proj:true}},fireSplash:{dmg:~~(fire*.6),el:EL.D,opts:{}},swing:{dmg:swing,el:0,opts:{}},bow:{dmg:bow,el:0,opts:{maxDist:1000}}};
            const e=mkEn(P.x,P.y,0,0,false,0,-1);
            if(!e)throw new Error('No spawn point');
            const actual={};
            for(const [key,a] of Object.entries(attacks)) {
              const target={...e,hp:1e9,mhp:1e9,eShield:1e9,eShieldMax:1e9,mods:[],kb:{x:0,y:0}};
              const before=target.hp+target.eShield;
              hurtE(target,a.dmg,undefined,true,a.opts,a.el);
              actual[key]=before-target.hp-target.eShield;
            }
            rows.push({lv,skillLv,ref:{melee:meleeRef(),magic:magicRef(),bow:bowRef()},raw:{ki,fire,swing,bow},hp:e.mhp,shield:e.eShield,actual,
              hits:{ki:Math.ceil(2*e.mhp/actual.ki),fire:Math.ceil(2*e.mhp/(actual.fire+actual.fireSplash)),swing:Math.ceil(2*e.mhp/actual.swing),bow:Math.ceil(2*e.mhp/actual.bow)},
              anglerHp:_fbHp(lv),fireDevilHp:_fdHp(lv),player:{hp:P.mhp,mp:P.mmp,st:P.mst}});
            if(lv===10&&skillLv===1){
              Math.random=()=>.999; // no criticals or random item drops during isolated kills
              for(const attack of ['ki','fire']){
                const victim=mkEn(P.x,P.y,0,0,false,0,-1);
                ens=[victim];_shDirty=true;shRebuild();
                G._fieldBosses=[];G._fieldBoss=null;G._fireDevils=[];G._worms=[];
                const trace=[];
                for(let n=0;n<30&&victim.hp>0;n++){
                  if(attack==='ki'){
                    for(const c of _crescents)c.active=false;
                    spawnCrescent(victim.x-14,victim.y,0,ki,0,1,0);updateCrescents(1);
                  }else{
                    hurtE(victim,fire,undefined,true,{magic:true,proj:true},EL.D);
                    _fireballExplode({x:victim.x,y:victim.y,dmg:fire,explDmg:~~(fire*.6),explR:100,el:EL.D,fireball:true});
                  }
                  trace.push({hp:victim.hp,shield:victim.eShield,alive:victim.alive});
                }
                kills.push({attack,casts:trace.length,dead:victim.hp<=0,trace});
              }
              ens=[];_shDirty=true;shRebuild();Math.random=()=>.5;
            }
          }
        }
        return {method:'Normal difficulty(index5), stage0, seeded(910) starter T0 white gear, no invested stats/passives/enhancements, non-critical direct hits; fire=direct+60% splash, poison/regen/misses excluded. Skill level alternatives are separate scenarios. Swing excludes the ST expenditure flat bonus and simultaneous ki projectile. Field monsters use their separate raw damage path. kills uses real crescent collision and direct hurtE+production fireball explosion; no travel time or AI.',gear:{weapon:wp(),helmet:hm(),bow:bw()},rows,kills};
      } finally {Math.random=rand;}
    }''')
    report['errors']=errors
    assert not errors, errors
    assert [(k['attack'],k['casts'],k['dead']) for k in report['kills']]==[('ki',2,True),('fire',3,True)],report['kills']
    out=ROOT/'output/qa/early_combat_20260910.json'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
    browser.close()
