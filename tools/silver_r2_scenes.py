"""Scene-assisted atlas evidence plus real keyboard/mouse motion capture."""
from pathlib import Path
import base64,hashlib,json,time,subprocess
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

FREEZE="""()=>{window.__qaNativeRAF=window.__qaNativeRAF||requestAnimationFrame;window.__qaNativeNow=window.__qaNativeNow||performance.now.bind(performance);window.__qaNativeDate=window.__qaNativeDate||Date.now;window.requestAnimationFrame=()=>0;window._btFramePause=true;G.paused=false;OPT.sfxVol=0;OPT.bgmVol=0;try{BGM.setVol(0)}catch{};document.getAnimations().forEach(a=>a.pause());Object.defineProperty(performance,'now',{value:()=>90000,configurable:true});Date.now=()=>1793649600000;_now=1000;_gameTime=1000;_dtSp=0;G.t=60;G.shake=0;P.iframes=999999;P.s='idle';P._walkMoving=false;P.facing=Math.PI/2;G.cam.x=P.x;G.cam.y=P.y;}"""
RENDER="""()=>{__silverSeed(193754);_dtSp=0;_now=1000;G.frame=60;_fogGLTime=10;P.hp=P.mhp;P.iframes=0;G._intro=false;if(G._bonfire)G._bonfire.t=0;
if(ATMO_P){window.__qaAtmo=window.__qaAtmo||ATMO_P.slice();ATMO_P.set(window.__qaAtmo);}
if(_oriInited){window.__qaFireflies=window.__qaFireflies||structuredClone(_oriFireflies);_oriFireflies.forEach((f,i)=>Object.assign(f,window.__qaFireflies[i]));}
if(window._Web3DFrame)window._Web3DFrame();else draw();if(_useGL||_useGPU)_glFlush();if(typeof GL!=='undefined'&&GL)GL.finish();return {stage:G.stage,char:_charIdx,hp:P.hp,mhp:P.mhp,state:P.s,animation:P._sa.anim,frame:P._sa.f,direction:_playerSpriteDirection(P),physics:{x:P.x,y:P.y,r:P.r},r2:!!_atlasP_img._silverR2,rect:SpriteAnimator._fr(P._sa,_playerSpriteDirection(P))?.[P._sa.f],screen:{x:C.getBoundingClientRect().left+(P.x-G.cam.x)*(G._camZoom||1)+VW/2,y:C.getBoundingClientRect().top+(P.y-G.cam.y)*(G._camZoom||1)+VH/2}}}"""
POSE="""c=>{_harpActive=false;_dashActive=false;_harpLandT=0;_dashPhase=0;P.s='idle';P.st2=0;P._walkMoving=false;P._silvAttackStartedAt=0;P._sa.anim='__qa_reset';P._sa.f=0;P._sa.t=0;P.facing=c.angle??Math.PI/2;P._walkFacing=P.facing;
if(c.kind==='walk'){P._walkMoving=true;P._walkDist=(c.phase||0)*64+1;}
if(c.kind==='attack'){P.s='wSwing';P.st2=3;_startSilvertailAttackMotion('lmb');P._silvAttackStartedAt=89900;}
if(c.kind==='heavy'){P.s='gSlam1';P.st2=8;P._sa.anim='gSlam1';P._sa.f=2;}
if(c.kind==='shift'){P.facing=0;_dashVX=1;_dashVY=0;_harpTier=1;_dashTier=1;_dashActive=true;_dashPhase=2;_dashLeft=(_HARP_PULL_DUR[1]||7)/2;}
if(c.kind==='hurt'){P.s='stagger';P.st2=12;P._sa.anim='hurt';P._sa.f=1;}
}"""

def wait_for_gameplay(page,r2=False):
    page.wait_for_function("typeof P!=='undefined'&&P&&typeof G!=='undefined'&&(G.on||_cutsceneState==='INTRO_CUTSCENE')&&_atlasP_img"+("&&_atlasP_img._silverR2===true" if r2 else ''),timeout=90000,polling=250)
    page.evaluate('()=>{P.hp=P.mhp;P.iframes=999999;}')
    # Both existing cutscene and guide expose Escape as their native skip.
    # The guide captures keydown even while a cutscene canvas covers it.
    for _ in range(6):
        state=page.evaluate("()=>({on:G.on,cut:_cutsceneState,guide:!!_introGuide})")
        print('entry',state,flush=True)
        if state['on'] and state['cut']!='INTRO_CUTSCENE' and not state['guide']:break
        page.keyboard.press('Escape');page.wait_for_timeout(1200)
    page.wait_for_function("G.on===true&&_cutsceneState!=='INTRO_CUTSCENE'&&!_introGuide",timeout=15000,polling=200)
    page.wait_for_timeout(1100)
    skip=page.get_by_role('button',name='연습 건너뛰기',exact=True)
    if skip.is_visible():
        skip.click();page.wait_for_timeout(300)
    page.evaluate('()=>{P.hp=P.mhp;P.iframes=999999;P.s="idle";updateHUD(false);updateHUD(true);}')
    page.evaluate("()=>{document.querySelectorAll('video').forEach(v=>v.pause());}")
    try:page.wait_for_load_state('networkidle',timeout=5000)
    except PlaywrightTimeoutError:
        # Existing BGM streams can keep networkidle pending indefinitely.
        # Graphics readiness is checked independently rather than treating a
        # muted audio stream as a missing world/character texture.
        print('networkidle pending; checking visible images and scene warmup',flush=True)
    page.wait_for_function("Array.from(document.images).every(i=>i.complete)&&_startSceneWarmState.status==='ready'&&P.mhp>0",timeout=20000,polling=200)
    page.wait_for_timeout(1000)
    print('playable',page.evaluate('()=>({hp:P.hp,mhp:P.mhp,char:_charIdx,atlas:!!_atlasP_img._silverR2,stage:G.stage})'),flush=True)

def default_parity(origin,out,legacy_object):
    origin.evaluate(FREEZE);origin.wait_for_timeout(150);origin.evaluate(FREEZE)
    origin.evaluate('()=>{P.hp=P.mhp;updateHUD(false);updateHUD(true);}')
    assert origin.evaluate('!SilvertailR2Preview.active&&!_atlasP_img._silverR2')
    assert origin.evaluate("performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/characters/silvertail_r2/')).length===0")
    # Same live scene, frozen clock/physics, exact HEAD renderer oracle. These
    # are the only two production deltas: inactive loader and draw scaling.
    for _ in range(20):origin.evaluate(RENDER)
    origin.screenshot(path=str(out/'default_after_1920.png'))
    for _ in range(3):origin.evaluate(RENDER)
    origin.screenshot(path=str(out/'default_control_repeat_1920.png'))
    control=int(np.any(np.array(Image.open(out/'default_after_1920.png'))!=np.array(Image.open(out/'default_control_repeat_1920.png')),axis=2).sum())
    origin.evaluate("source=>{window.__qaPatchedDraw=SpriteAnimator.draw;window.__qaLegacyAnimator=(new Function('return ('+source+')'))();SpriteAnimator.draw=window.__qaLegacyAnimator.draw;}",legacy_object)
    for _ in range(3):origin.evaluate(RENDER)
    origin.screenshot(path=str(out/'default_before_1920.png'))
    before=np.array(Image.open(out/'default_before_1920.png').convert('RGB'));after=np.array(Image.open(out/'default_after_1920.png').convert('RGB'));diff=np.any(before!=after,axis=2);different=int(diff.sum())
    Image.fromarray(np.where(diff[:,:,None],np.array([255,40,40],dtype='uint8'),np.array([0,0,0],dtype='uint8')).astype('uint8')).save(out/'default_pixel_diff_1920.png')
    (out/'default_pixel_parity.json').write_text(json.dumps(dict(different_pixels=different,unchanged_renderer_control_pixels=control,resolution=[1920,1080],method='same frozen real1-1 scene; exact HEAD SpriteAnimator.draw vs patched draw; fog time and render-side particles restored; spr absent; all other production deltas are inactive',new_atlas_requests=0,default_atlas_r2=False),ensure_ascii=False,indent=2),encoding='utf-8')
    print('parity',different,'control',control,flush=True)
    origin.evaluate('()=>{SpriteAnimator.draw=window.__qaPatchedDraw;}')
    return different,control

def capture(context,candidate,out,port,legacy_object):
    out=Path(out);records=[];errors=[];font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',14)
    candidate.evaluate(FREEZE);candidate.wait_for_timeout(150);candidate.evaluate(FREEZE)
    origin=context.new_page();origin.bring_to_front();context.new_cdp_session(origin).send('Emulation.setFocusEmulationEnabled',{'enabled':True});origin.on('pageerror',lambda e:errors.append(str(e)))
    requested=[];origin.on('request',lambda r:requested.append(r.url));origin.goto(f'http://127.0.0.1:{port}/game.html',wait_until='domcontentloaded',timeout=90000)
    wait_for_gameplay(origin)
    origin.wait_for_timeout(250);origin.evaluate(FREEZE);origin.wait_for_timeout(150);origin.evaluate(FREEZE)
    assert origin.evaluate('!SilvertailR2Preview.active&&!_atlasP_img._silverR2');assert not any('/assets/characters/silvertail_r2/' in url for url in requested)
    different,control=default_parity(origin,out,legacy_object)
    position=candidate.evaluate('()=>({x:P.x,y:P.y})')
    for page in [origin,candidate]:page.evaluate('p=>{P.x=p.x;P.y=p.y;G.cam.x=p.x;G.cam.y=p.y;G._camZoom=1;}',position)
    cases=[dict(name='idle',kind='idle')]
    for dr,angle in [('s',1.5707963268),('se',.7853981634),('e',0),('ne',-.7853981634),('n',-1.5707963268),('nw',-2.3561944902),('w',3.1415926536),('sw',2.3561944902)]:cases.append(dict(name='walk_'+dr,kind='walk',angle=angle,phase=2))
    cases += [dict(name='basic_attack',kind='attack'),dict(name='heavy_4pose',kind='heavy'),dict(name='shift',kind='shift'),dict(name='hurt',kind='hurt')]
    crops=[]
    for case in cases:
        pair=[]
        for label,page in [('original',origin),('r2',candidate)]:
            page.bring_to_front();page.evaluate(POSE,case)
            for _ in range(2):snapshot=page.evaluate(RENDER)
            filename=f'{label}_{case["name"]}_1920.png';page.screenshot(path=str(out/filename));im=Image.open(out/filename).convert('RGB');x,y=snapshot['screen']['x'],snapshot['screen']['y'];box=(round(x-72),round(y-94),round(x+72),round(y+82));crop=im.crop(box);crop.save(out/f'{label}_{case["name"]}_1x.png');pair.append(crop);records.append(dict(case=case,label=label,file=filename,snapshot=snapshot,scene_assisted=True))
        crops.append((case['name'],pair))
    board=Image.new('RGB',(144*2+80,len(crops)*210+55),'#24252b');d=ImageDraw.Draw(board);d.text((10,10),'실게임1-1 / 원본(플래그 없음) | r2 / 실제1x',font=font,fill='#dfd6c2')
    for i,(name,pair) in enumerate(crops):
        y=i*210+52;d.text((12,y),name,font=font,fill='#dfd6c2')
        for j,im in enumerate(pair):board.paste(im,(12+j*180,y+25))
    board.save(out/'ingame_r2_vs_original.png')
    # All four corrected north contact/pass poses through the actual renderer.
    board=Image.new('RGB',(576,230),'#24252b');d=ImageDraw.Draw(board)
    for phase in range(4):
        candidate.evaluate(POSE,dict(kind='walk',angle=-1.5707963268,phase=phase));snapshot=candidate.evaluate(RENDER);data=candidate.screenshot();from io import BytesIO
        im=Image.open(BytesIO(data));x,y=snapshot['screen']['x'],snapshot['screen']['y'];crop=im.crop((round(x-72),round(y-94),round(x+72),round(y+82)));board.paste(crop,(phase*144,35));d.text((phase*144+8,8),f'N / {phase} / 1x',font=font,fill='#dfd6c2')
    board.save(out/'north_walk_4poses_ingame_1x.png')
    (out/'scene_receipts.json').write_text(json.dumps(dict(cases=records,default_pixel_parity=different,errors=errors,scope='scene-assisted real renderer screenshots; separate motion clip uses live keyboard/mouse input'),ensure_ascii=False,indent=2),encoding='utf-8')
    assert not errors
    origin.close()
    candidate.evaluate(POSE,dict(kind='idle'))
    ratios=[]
    for w,h in [(1600,900),(1920,1080),(2560,1080),(3840,1080)]:
        candidate.set_viewport_size(dict(width=w,height=h));candidate.wait_for_timeout(200)
        for _ in range(2):snapshot=candidate.evaluate(RENDER)
        filename=f'r2_idle_{w}x{h}.png';candidate.screenshot(path=str(out/filename))
        ratios.append(dict(resolution=[w,h],file=filename,snapshot=snapshot,overflow=candidate.evaluate('document.documentElement.scrollWidth>innerWidth')))
    (out/'resolution_receipts.json').write_text(json.dumps(ratios,ensure_ascii=False,indent=2),encoding='utf-8')
    candidate.set_viewport_size(dict(width=1920,height=1080));candidate.wait_for_timeout(200);candidate.evaluate(RENDER)
    record_motion(context,candidate,out)
    assert different==0 and control==0,('unflagged pixel parity/control',different,control)

def record_motion(context,page,out):
    page.bring_to_front();page.evaluate("()=>{requestAnimationFrame=window.__qaNativeRAF;Object.defineProperty(performance,'now',{value:window.__qaNativeNow,configurable:true});Date.now=window.__qaNativeDate;window._btFramePause=false;_looping=false;_prevTs=0;_lastLoopTs=0;_acc=0;_harpActive=false;_dashActive=false;_harpLandT=0;G.on=true;P.hp=P.mhp;P.s='idle';P._walkMoving=false;P.iframes=999999;P.activeLMBSk='normal';_startLoop();}");page.wait_for_timeout(250)
    frame_dir=out/'motion_frames';frame_dir.mkdir(exist_ok=True);session=context.new_cdp_session(page);frames=[]
    def frame(event):
        p=frame_dir/f'{len(frames):05}.png';p.write_bytes(base64.b64decode(event['data']));frames.append(dict(file=p.name,timestamp=event['metadata']['timestamp']));session.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
    session.on('Page.screencastFrame',frame);session.send('Page.startScreencast',{'format':'png','maxWidth':1920,'maxHeight':1080,'everyNthFrame':1});start=time.monotonic();actions=[]
    def until(seconds):page.wait_for_timeout(max(1,(start+seconds-time.monotonic())*1000))
    def note(action):actions.append(dict(elapsed=round(time.monotonic()-start,3),action=action,state=page.evaluate('()=>({s:P.s,x:P.x,y:P.y,anim:P._sa.anim,f:P._sa.f,dir:_playerSpriteDirection(P),harp:_harpActive,dash:_dashActive})')))
    until(.6)
    for i,keys in enumerate([['s'],['s','d'],['d'],['w','d'],['w'],['w','a'],['a'],['s','a']]):
        for key in keys:page.keyboard.down(key)
        until(.6+(i+1)*.3);note('walk '+'+'.join(keys))
        for key in keys:page.keyboard.up(key)
    until(3.4);page.mouse.move(1260,540);page.mouse.down();until(3.7);note('LMB normal weapon');until(4.4);page.mouse.up();until(4.7);page.keyboard.down('e');until(4.76);note('E spin');until(4.82);page.keyboard.up('e');until(5.2)
    page.evaluate("()=>{const e=ens.find(e=>!e.dead&&!e.boss);if(e){e.x=P.x+170;e.y=P.y;e.hp=1e9;e.mhp=1e9;e.atk=1;}P.st=P.mst;_harpGauge=_HARP_GAUGE_MAX;}");page.mouse.move(1130,540);page.keyboard.down('Shift');until(5.3);note('Shift active');until(5.4);page.keyboard.up('Shift');until(6.8);note('Shift chain return')
    until(7.2);page.evaluate("()=>{P.hp=P.mhp;P.iframes=0;hurtP(1,{dot:true,shieldHit:true});P.s='stagger';P.st2=18;P._sa.anim='hurt';P._sa.f=1;P.iframes=999999;}");until(7.25);note('hurtP and scene-assisted stagger');until(10);session.send('Page.stopScreencast');session.detach();assert len(frames)>=8,('motion frames',len(frames))
    concat=frame_dir/'frames.ffconcat';lines=['ffconcat version 1.0'];first=frames[0]['timestamp']
    for i,item in enumerate(frames):
        elapsed=item['timestamp']-first
        if elapsed>=10:break
        end=min(10,frames[i+1]['timestamp']-first) if i+1<len(frames) else 10;duration=max(.001,end-elapsed);lines += ["file '"+item['file']+"'",f'duration {duration:.8f}']
    lines += ["file '"+frames[min(i,len(frames)-1)]['file']+"'"];concat.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    ffmpeg='C:/Users/심도진/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe';movie=out/'silvertail_r2_ingame_10s_silent.mp4';result=subprocess.run([ffmpeg,'-y','-v','error','-safe','0','-i',str(concat),'-an','-vf','tpad=stop_mode=clone:stop_duration=1','-frames:v','300','-r','30','-c:v','libx264rgb','-crf','0','-preset','ultrafast','-threads','2','-movflags','+faststart',str(movie)],capture_output=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0));assert result.returncode==0,result.stderr.decode(errors='replace')
    decoded=subprocess.run([ffmpeg,'-v','error','-i',str(movie),'-f','null','-'],capture_output=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0));assert decoded.returncode==0 and not decoded.stderr
    (out/'motion_receipt.json').write_text(json.dumps(dict(source='PNG Chrome screencast of live1-1 gameplay, no interpolation',frames=len(frames),actions=actions,seconds=10,audio_tracks=0,decode='PASS',scope='isolated demo character/invulnerability; Shift target positioned for controlled encounter; hurt includes forced stagger pose; not natural completion or FPS benchmark'),ensure_ascii=False,indent=2),encoding='utf-8')
