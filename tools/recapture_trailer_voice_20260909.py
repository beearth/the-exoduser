"""Recapture V2 combat takes in an isolated, unsaved female-character browser.

Uses the installed Playwright Chrome and existing runtime recording/staging code.
Keeps original V2 sources; writes new video, actual AudioBuffer start events and QA.
"""
import base64
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp/trailer_voice_v21'
SOURCE = ROOT / 'tools/trailer_realtime_20260909.mjs'
INSTALL = SOURCE.read_text(encoding='utf-8').split('async function install(){return evaluate(`',1)[1].split('`);}',1)[0]
RESET = re.search(r'export const resetScene = `([\s\S]*?)`;', (ROOT/'tools/trailer_scenes_20260909.mjs').read_text(encoding='utf-8'))[1]

AUDIT = r"""(()=>{
 const r=window.__rt,a=actx();r.voiceAudit=[];
 const bufferKeys=new WeakMap();
 for(const k of Object.keys(_audioBuffers)){const b=_audioBuffers[k];if(!b)continue;const keys=bufferKeys.get(b)||[];keys.push(k);bufferKeys.set(b,keys);}
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(destination,...args){
   const value=connect.call(this,destination,...args);
   // The ultimate voice bypasses _comp; include its real output as well.
   if(destination===a.destination&&this!==_comp)connect.call(this,r.audio);
   return value;
 };
 const start=AudioBufferSourceNode.prototype.start;
 AudioBufferSourceNode.prototype.start=function(...args){
   if(r.active){let keys=bufferKeys.get(this.buffer);if(!keys){keys=Object.keys(_audioBuffers).filter(k=>_audioBuffers[k]===this.buffer);if(this.buffer)bufferKeys.set(this.buffer,keys);}
     r.voiceAudit.push({t:(performance.now()-r.start)/1000,keys,rate:this.playbackRate.value,charIdx:_charIdx});}
   return start.apply(this,args);
 };
 return true;
})()"""

def event(at,code): return {'at':at,'code':code}

def record(page,name,seconds,events=(),**options):
    config=dict(name=name,seconds=seconds,events=list(events),protect=True,pan=None,rageHud=False,framing=None)
    config.update(options)
    page.evaluate("""config=>{
      window.__rtResult=null;const r=window.__rt;
      Object.assign(r,config);r.samples=[];r.voiceAudit=[];
      if(_charIdx!==1)throw Error('Female capture identity mismatch');
      const video=r.canvas.captureStream(60);
      const stream=new MediaStream([...video.getVideoTracks(),...r.audio.stream.getAudioTracks()]);
      const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:28000000,audioBitsPerSecond:256000});
      const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      recorder.onerror=e=>window.__rtResult={error:String(e.error)};
      recorder.onstop=async()=>{r.active=false;video.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunks,{type:recorder.mimeType});window.__rtBlob=new Uint8Array(await blob.arrayBuffer());
        window.__rtResult={bytes:blob.size,samples:r.samples,audio:r.voiceAudit,combat:r.combatAudit||[],skills:r.skillAudit||[],charIdx:_charIdx,seconds:(performance.now()-r.start)/1000};};
      r.start=performance.now();r.active=true;recorder.start();setTimeout(()=>recorder.stop(),config.seconds*1000);
    }""",config)
    page.wait_for_function('window.__rtResult!==null',timeout=(seconds+30)*1000)
    result=page.evaluate('window.__rtResult')
    if 'error' in result:raise RuntimeError(result['error'])
    with (OUT/(name+'.webm')).open('wb') as f:
        for offset in range(0,result['bytes'],524288):
            encoded=page.evaluate("o=>{const a=window.__rtBlob.subarray(o,o+524288);let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s)}",offset)
            f.write(base64.b64decode(encoded))
    result['config']=config
    (OUT/(name+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    forbidden=[]
    for item in result['audio']:
        forbidden.extend(k for k in item['keys'] if k.startswith('voice_') or k=='male_grunt' or k.startswith('player_hit') or k.startswith('player_dead') or k=='repentance')
    if forbidden:raise RuntimeError(f'Male/shared player voice in {name}: {forbidden}')
    frames=result['samples'];gaps=[(b['t']-a['t'])*1000 for a,b in zip(frames,frames[1:])]
    voices=[e for e in result['audio'] if any(k.startswith('silvertail_') for k in e['keys'])]
    summary={'name':name,'frames':len(frames),'maxFrameMs':max(gaps,default=0),'femaleVoices':len(voices),'maleVoices':forbidden,'first':frames[0] if frames else None,'last':frames[-1] if frames else None}
    print(json.dumps(summary,ensure_ascii=False),flush=True)
    return summary

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    summaries=[];errors=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True,args=['--autoplay-policy=no-user-gesture-required','--ignore-gpu-blocklist'])
        try:
            page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
            page.add_init_script("localStorage.setItem('_charIdx','1')")
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto('http://localhost:3333/game.html?testchar=1',wait_until='domcontentloaded',timeout=120000)
            page.wait_for_function("typeof G!=='undefined'&&G.on&&P.lv===500",timeout=180000)
            page.wait_for_load_state('networkidle',timeout=60000)
            page.evaluate("_dbReady=false;_charId=null;G.paused=true;OPT.fpsCap=60;OPT.sfxVol=85;OPT.bgmVol=0;OPT.lang='en';BGM.stop();")
            print('boot '+json.dumps(page.evaluate('({charIdx:_charIdx,atlasWidth:_atlasMask.width,atlasHeight:_atlasMask.height})')),flush=True)
            page.evaluate(INSTALL);page.evaluate(RESET)
            page.evaluate("async()=>{await actx().resume();await Promise.all(Object.keys(_sampleFiles).filter(k=>k.startsWith('silvertail_')).map(async k=>{if(!_audioBuffers[k])_audioBuffers[k]=await actx().decodeAudioData(await(await fetch(_sampleFiles[k])).arrayBuffer())}));}")
            page.evaluate(AUDIT)
            # Omit untranslated Korean gameplay labels from this recording only.
            page.evaluate("for(const name of ['fillText','strokeText']){const drawText=X[name];if(drawText)X[name]=function(text,...args){if(/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(String(text)))return;return drawText.call(this,text,...args);};}")
            def reset(count=0,level=35,radius=270):
                page.evaluate(f'__resetTake({count},{level},{radius});P.activeLMBSk="normal";_silvertailVoiceLastAt.clear();ultUnmute();')
                page.wait_for_timeout(700)
            reset(256,35,220);page.evaluate('G.paused=false;activateGiantSlam();')
            page.wait_for_timeout(3500)
            reset();page.evaluate('P.rage=0;G.paused=false;')
            rage=[]
            for i in range(5):
                t=1+i*1.05
                rage.extend([event(t,f"for(let i=0;i<3;i++){{const a={i}*.8+i*2.094;spawnProj({{x:P.x+Math.cos(a)*320,y:P.y+Math.sin(a)*320,vx:-Math.cos(a)*5,vy:-Math.sin(a)*5,el:EL.F,magic:true,fireMagic:true,dmg:12,r:8,sz:14,life:240,_commit:true}});}}"),event(t+.25,'K.KeyQ=true;'),event(t+.65,'K.KeyQ=false;')])
            rage.append(event(7.3,'G.paused=true;'))
            summaries.append(record(page,'rage_charge',8,rage))
            reset(256,35,220);page.evaluate('G.paused=false;')
            summaries.append(record(page,'rage_slam',8,[event(3.8,'activateGiantSlam();'),event(7.5,'G.paused=true;')]))
            reset(128,75,420);page.evaluate('G.paused=false;')
            fire=[]
            for i in range(6):
                t=1+i
                fire.extend([event(t,f"mouse.x=VW/2+{(-800 if i%2 else 800)};mouse.y=VH/2;dispatchEvent(new KeyboardEvent('keydown',{{code:'ShiftLeft',key:'Shift',bubbles:true}}));"),event(t+.055,"dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',key:'Shift',bubbles:true}));"),event(t+.12,'MB[2]=true;MBjust[2]=true;'),event(t+.42,'MB[2]=false;MBjust[2]=false;')])
            fire.extend([event(7.5,'_detonateAssaultFlames();'),event(10.4,'G.paused=true;')])
            summaries.append(record(page,'fire_stack_b',11,fire))
            reset(72,65,400);page.evaluate('G.paused=false;')
            summaries.append(record(page,'ice_orb',7,[event(1.5,'activateIceOrb();'),event(6.5,'G.paused=true;')]))
            reset(72,120,430);page.evaluate('G.paused=false;')
            summaries.append(record(page,'ancestor',7.5,[event(1,'activateAncestorSummon();'),event(7,'G.paused=true;')]))
            reset(120,80,390);page.evaluate('G.paused=false;')
            summaries.append(record(page,'blackhole',10,[event(1,"ULT_SLOT='lavaSummon';_dispatchSkillSlot(-1,'KeyZ');"),event(9.5,'G.paused=true;')]))
            reset();page.evaluate('_enterBossArena(true);')
            page.wait_for_timeout(4000)
            page.evaluate("G.paused=true;G.shake=0;const b=ens.find(e=>e.ib&&e.alive);if(!b)throw Error('Missing boss');P.x=b.x-550;P.y=b.y+130;P.iframes=999999;P.hp=P.mhp;P.mp=P.mmp;P._dead=false;G.cam.x=(P.x+b.x)/2;G.cam.y=(P.y+b.y)/2-60;_silvertailVoiceLastAt.clear();G.paused=false;")
            boss=[]
            for i in range(6):
                t=.6+i*1.9
                boss.extend([event(t,"K.KeyQ=true;mouse.x=VW*.75;mouse.y=VH*.4;"),event(t+.65,"K.KeyQ=false;MB[2]=true;MBjust[2]=true;"),event(t+1.05,'MB[2]=false;MBjust[2]=false;')])
            boss.append(event(13.5,'G.paused=true;'))
            summaries.append(record(page,'druid_boss_c',14,boss,framing='boss'))
        finally:
            browser.close()
    (OUT/'report.json').write_text(json.dumps({'takes':summaries,'pageErrors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
    if errors:raise RuntimeError(errors)

if __name__=='__main__':main()
