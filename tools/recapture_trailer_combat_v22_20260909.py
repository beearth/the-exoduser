"""Isolated, damage-enabled female skill montage with actual runtime VFX/audio."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import recapture_trailer_voice_20260909 as capture

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tmp/trailer_combat_v22'
capture.OUT=OUT
event=capture.event

SETUP=r"""(()=>{
 const r=__rt;r.combatAudit=[];r.skillAudit=[];
 const kind=p=>p.blackBean?'rainbow':p.blueBean?'blue':p.redBean?'red':p.fireMagic?'fire':p.waterBean?'water':String(p.el);
 const spawn=spawnProj;spawnProj=function(p){if(r.active)r.combatAudit.push({t:(performance.now()-r.start)/1000,event:'shot',kind:kind(p),x:p.x,y:p.y});return spawn.apply(this,arguments);};
 const hit=_hurtProjectilePlayer;_hurtProjectilePlayer=function(p,d,o){const hp=P.hp,iv=P.iframes;const v=hit.apply(this,arguments);if(r.active)r.combatAudit.push({t:(performance.now()-r.start)/1000,event:'contact',kind:kind(p),before:hp,after:P.hp,iframes:iv});return v;};
 const parry=doParry;doParry=function(d,x,y,q,el,m,kind){if(r.active)r.combatAudit.push({t:(performance.now()-r.start)/1000,event:'parry',kind,q:!!q,state:P.s});return parry.apply(this,arguments);};
 const prof=_addSkProf;_addSkProf=function(id){if(r.active&&!r.skillAudit.some(e=>e.skill===id&&e.event==='used'))r.skillAudit.push({t:(performance.now()-r.start)/1000,skill:id,event:'used'});return prof.apply(this,arguments);};
 const bs=fireBlackStar;fireBlackStar=function(){r.skillAudit.push({t:(performance.now()-r.start)/1000,skill:'blackStar',event:'release'});return bs.apply(this,arguments);};
 window.__cast=(id)=>{const slot=_isAreaSkillId(id)?5:_isRageBurstSkillId(id)?4:0;if(_skById(id)?.ult)ULT_SLOT=id;else SKILL_SLOTS[slot]=id;P.skills[id]=Math.max(1,P.skills[id]||0);const ok=_dispatchSkillSlot(_skById(id)?.ult?-1:slot,'Digit1');r.skillAudit.push({t:(performance.now()-r.start)/1000,skill:id,ok});};
 window.__wave=()=>{let n=0;for(const e of ens){if(!e.alive||n>=24)continue;const bean=['black','fire','water','red','special','normal'][n%6];e._projChargeBean=bean;e._projChargeCol={black:'#00aa00',fire:'#ff2e22',water:'#317cec',red:'#cc1100'}[bean]||ELC[e.el];e._projChargeT=60;n++;}r.skillAudit.push({t:(performance.now()-r.start)/1000,event:'enemyWindup',count:n});};
 window.__aim=(dx=230,dy=-60)=>{mouse.x=VW/2+dx;mouse.y=VH/2+dy;};
 window.__tap=(button)=>{MB[button]=true;MBjust[button]=true;};
 window.__release=()=>{for(let i=0;i<3;i++){MB[i]=false;MBjust[i]=false;}for(const k in K)K[k]=false;for(const k in KH)KH[k]=false;};
 window.__key=(code,down)=>dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code,bubbles:true}));
 return true;
})()"""

def cast(at,id):return event(at,f"__cast('{id}');")
def click(at,dx=230,dy=-60):return [event(at,f'__aim({dx},{dy});__tap(0);'),event(at+.12,'__release();')]
def wave(at):return event(at,'__wave();')
def take(name,seconds,count,events,setup='',level=35,radius=420,skills=()):
    return dict(name=name,seconds=seconds,count=count,events=sorted(events,key=lambda e:e['at']),setup=setup,level=level,radius=radius,skills=list(skills))

TAKES=[
 take('rainbow_parry',9,24,[wave(.3),event(1.25,"__key('KeyQ',true);"),event(1.65,"__key('KeyQ',false);"),wave(4.5),event(5.25,"__key('KeyQ',true);"),event(5.65,"__key('KeyQ',false);")],radius=380,skills=['detonate']),
 take('rage_slam',6,112,[cast(1.2,'giantSlam')],setup='P.rage=_rageMax();',radius=270,skills=['giantSlam']),
 take('blackstar',13,32,[cast(.5,'blackStar'),event(3,"__key('KeyQ',true);"),event(4.2,"__key('KeyQ',false);"),event(6.8,"__key('KeyQ',true);"),event(8,"__key('KeyQ',false);")],radius=500,skills=['blackStar']),
 take('blackhole',9,48,[wave(.2),cast(.8,'lavaSummon'),wave(2),wave(3.8)],radius=480,skills=['lavaSummon']),
 take('blades',8,72,[cast(.4,'maliceHunt'),cast(2.2,'venomBlade'),cast(4.2,'ltnChaser'),cast(6,'plagueBurst')],skills=['maliceHunt','venomBlade','ltnChaser','plagueBurst']),
 take('ice_orb',5.5,64,[cast(.7,'iceOrb')],skills=['iceOrb']),
 take('pillars',7,88,[cast(.5,'darkPillar'),cast(3.5,'skyCrusher')],setup="P._fused={pillarSpike:true};",radius=320,skills=['darkPillar','spikeTrap','pillarSpike','skyCrusher']),
 take('bone_storm',8,64,[cast(.3,'boneWall'),*click(.55),cast(2.4,'maliceStorm'),*click(2.7,-150,-100),cast(5,'iceStorm'),*click(5.25,250,30)],setup='P._bwStk=2;P._isStk=2;',skills=['boneWall','maliceStorm','iceStorm']),
 take('mortar',5,64,[cast(.5,'maliceMortar'),*click(.8)],skills=['maliceMortar']),
 take('domains',8,64,[cast(.3,'maliceDome'),cast(2,'holyDome'),cast(4,'holyPrison'),cast(6,'weakMag')],setup='P.skills.holyDome=5;P._hdCd=0;',skills=['maliceDome','holyDome','holyPrison','weakMag']),
 take('traps',7,64,[cast(.4,'spikeTrap'),cast(1.8,'thunderStake'),*click(2,-230,-50),cast(3,'thunderStake'),*click(3.2,230,-50),cast(4.7,'ghostXbowTurret')],skills=['spikeTrap','thunderStake','ghostXbowTurret']),
 take('scarecrow',8,32,[cast(.3,'voidScarecrow'),wave(.6),cast(3,'explodeScarecrow'),wave(3.2),cast(6,'explodeScarecrow')],skills=['voidScarecrow','explodeScarecrow']),
 take('ancestor',7,64,[cast(.5,'ancestorSummon'),event(4.5,'_recallAncestor();')],skills=['ancestorSummon']),
 take('ki_whirl',7,96,[event(.4,"P.activeLMBSk='kiSlash';__tap(0);"),event(2.8,"__release();P.s='idle';P.activeLMBSk='whirlwind';"),event(3,'__tap(0);'),event(6.5,'__release();')],radius=220,skills=['kiSlash','whirlwind']),
 take('magic_beams',9,96,[event(.3,"P.activeMagicSk='fireball';__tap(2);"),event(.6,'__release();'),event(1.8,"P.activeMagicSk='elemMissile';__tap(2);"),event(2.2,'__release();'),event(3.3,"P.activeMagicSk='fireBeam';__tap(2);"),event(3.7,'__release();'),event(4.6,"P.activeMagicSk='arcLaser';__tap(2);"),event(7.8,'__release();')],skills=['fireball','elemMissile','fireBeam','arcLaser']),
 take('mobility',7,96,[event(.4,"P.activeChargeSk='magicBlink';__aim(450,0);dispatchEvent(new KeyboardEvent('keydown',{code:'ShiftLeft',key:'Shift'}));"),event(.6,"dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',key:'Shift'}));"),event(1.6,'activateBladeDash(Math.PI);'),event(2.5,"P.activeMagicSk='blueShot';__aim(300,0);__tap(2);"),event(2.8,'__release();'),cast(5.6,'timeWarp')],skills=['magicBlink','bladeDash','blueShot','timeWarp']),
 take('fused_storm',6,112,[event(.5,'__tap(0);'),event(5.5,'__release();')],setup="P._fused={stormBeam:true};P.activeLMBSk='whirlwind';",skills=['stormBeam']),
 take('fused_slam',5,96,[cast(.7,'giantSlam2')],setup="P._fused={infernoSlam:true};P.skills.fireAura=5;P.rage=_rageMax();",radius=300,skills=['giantSlam2','infernoSlam','fireAura']),
 take('boss',10,0,[event(.5,"__key('KeyQ',true);"),event(1,"__key('KeyQ',false);"),cast(2,'giantSlam'),event(3,"__key('KeyX',true);"),event(3.2,"__key('KeyX',false);__tap(2);"),event(5,'__release();'),event(5.5,"__key('KeyQ',true);"),event(6.3,"__key('KeyQ',false);__tap(0);"),event(9,'__release();')],skills=['giantSlam']),
]

def boot(context,errors,take):
    page=context.new_page()
    page.add_init_script("localStorage.setItem('_charIdx','1')")
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda msg:errors.append(msg.text) if '[LOOP CRASH]' in msg.text else None)
    page.goto('http://localhost:3333/game.html?testchar=1',wait_until='domcontentloaded',timeout=120000)
    page.wait_for_function("typeof G!=='undefined'&&G.on&&P.lv===500",timeout=180000)
    page.wait_for_load_state('networkidle',timeout=60000)
    page.evaluate("_dbReady=false;_charId=null;G.paused=true;OPT.fpsCap=60;OPT.sfxVol=85;OPT.bgmVol=0;OPT.lang='en';BGM.stop();")
    page.evaluate(capture.INSTALL);page.evaluate(capture.RESET)
    page.evaluate("async()=>{await actx().resume();await Promise.all(Object.keys(_sampleFiles).filter(k=>k.startsWith('silvertail_')).map(async k=>{if(!_audioBuffers[k])_audioBuffers[k]=await actx().decodeAudioData(await(await fetch(_sampleFiles[k])).arrayBuffer())}));}")
    page.evaluate(capture.AUDIT);page.evaluate(SETUP)
    page.evaluate(r"for(const name of ['fillText','strokeText']){const drawText=X[name];if(drawText)X[name]=function(text,...args){if(/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(String(text)))return;return drawText.call(this,text,...args);};}")
    page.evaluate(f"__resetTake({take['count']},{take['level']},{take['radius']});P.activeLMBSk='normal';_silvertailVoiceLastAt.clear();ultUnmute();__aim();")
    page.evaluate("ens.forEach((e,i)=>{e._firstShot=false;e.projT=180+i*25;});BINDS.parry='KeyQ';__release();")
    page.evaluate(take['setup'] or 'true')
    if take['name']=='boss':
        page.evaluate('_enterBossArena(true);')
        page.wait_for_timeout(4000)
        page.evaluate("G.paused=true;G.shake=0;const b=ens.find(e=>e.ib&&e.alive);if(!b)throw Error('Missing boss');P.x=b.x-300;P.y=b.y+100;P.mhp=100000000;P.hp=P.mhp;P.iframes=0;P.mp=P.mmp;G.cam.x=(P.x+b.x)/2;G.cam.y=(P.y+b.y)/2-60;")
    page.wait_for_function("Object.values(_ch8Atlas[1].dirs).every(d=>d.ready&&d.img.naturalWidth>0)",timeout=60000)
    page.wait_for_timeout(700)
    return page

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--only',nargs='*');args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);summaries=[];errors=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True,args=['--autoplay-policy=no-user-gesture-required','--ignore-gpu-blocklist'])
        try:
            for item in TAKES:
                if args.only and item['name'] not in args.only:continue
                print('Preparing '+item['name'],flush=True)
                context=browser.new_context(viewport={'width':1920,'height':1080},device_scale_factor=1)
                page=boot(context,errors,item)
                try:
                    page.evaluate('G.paused=false;')
                    summary=capture.record(page,item['name'],item['seconds'],item['events'],framing='boss' if item['name']=='boss' else None)
                    if summary['last']['hp']<=0 or summary['last']['t']<item['seconds']-.4:raise RuntimeError('Player died or capture froze: '+item['name'])
                    summary['intendedSkills']=item['skills']
                    summaries.append(summary)
                    page.screenshot(path=str(OUT/(item['name']+'_end.png')))
                finally:context.close()
        finally:browser.close()
    (OUT/'report.json').write_text(json.dumps({'takes':summaries,'pageErrors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
    if errors:raise RuntimeError(errors)

if __name__=='__main__':main()
