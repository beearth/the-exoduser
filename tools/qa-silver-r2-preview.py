"""Muted headless real-game evidence in an isolated worktree/profile/save root."""
from pathlib import Path
import argparse,hashlib,json,subprocess,urllib.parse,tempfile,shutil,time
from playwright.sync_api import sync_playwright

GIT='C:/Program Files/Git/cmd/git.exe'
ROOT=Path(__file__).resolve().parent.parent
SOURCE=Path('G:/exoduser-wt/latest-web')
FLAGS=getattr(subprocess,'CREATE_NO_WINDOW',0)
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);parser.add_argument('--port',type=int,default=3363);parser.add_argument('--baseline',default='78ebda580b9b5761583299bb5a80e463e63f4984');parser.add_argument('--default-only',action='store_true');parser.add_argument('--probe',action='store_true');parser.add_argument('--capture',action='store_true');args=parser.parse_args();assert args.out.is_absolute();args.out.mkdir(parents=True,exist_ok=True)
def git(*argv):return subprocess.check_output([GIT,'-c','safe.directory='+ROOT.as_posix(),'-C',str(ROOT),*argv],creationflags=FLAGS)
catalog={}
for item in git('ls-tree','-r','-z','HEAD').split(b'\0'):
    if not item:continue
    header,name=item.split(b'\t',1);mode,kind,oid=header.split();
    if kind==b'blob':catalog[name.decode('utf-8')]=oid.decode()
copied=[];unknown=set();page_errors=[];bad_responses=[];console_messages=[];pending={}
def materialize(route):
    url=urllib.parse.urlsplit(route.request.url)
    if url.hostname not in ['localhost','127.0.0.1'] or url.port!=args.port:route.continue_();return
    relative=urllib.parse.unquote(url.path).lstrip('/');dest=(ROOT/relative).resolve()
    if relative.startswith('api/') or not dest.is_relative_to(ROOT.resolve()):route.continue_();return
    if not dest.exists() and relative in catalog:
        candidate=SOURCE/relative;data=candidate.read_bytes() if candidate.is_file() else None
        if data is None or hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()!=catalog[relative]:data=git('show','HEAD:'+relative)
        assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==catalog[relative]
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);copied.append(relative)
    elif not dest.exists() and not relative.startswith('api/'):unknown.add(relative)
    route.continue_()

INIT="""(()=>{let seed=932651;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};window.__silverSeed=n=>{seed=n>>>0};localStorage.setItem('_charIdx','1');localStorage.setItem('hellcave_settings',JSON.stringify({opt:{sfxVol:0,bgmVol:0,voiceVol:0}}));})();"""
profile=Path(tempfile.mkdtemp(prefix='muted-silver-',dir=args.out));receipt={}
try:
    with sync_playwright() as pw:
        context=pw.chromium.launch_persistent_context(str(profile),headless=True,args=['--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist'],viewport={'width':1920,'height':1080},device_scale_factor=1)
        try:
            context.add_init_script(INIT);context.route('**/*',materialize);page=context.new_page();page.bring_to_front();cdp=context.new_cdp_session(page);cdp.send('Emulation.setFocusEmulationEnabled',{'enabled':True});page.on('pageerror',lambda e:page_errors.append(str(e)));page.on('response',lambda r:bad_responses.append([r.status,r.url]) if r.status>=400 else None)
            page.on('console',lambda m:console_messages.append([m.type,m.text[:500]]));page.on('request',lambda r:pending.update({r.url:time.time()}));page.on('requestfinished',lambda r:pending.pop(r.url,None));page.on('requestfailed',lambda r:pending.pop(r.url,None))
            started=time.time();query='' if args.default_only else '?spr=silver_r2';page.goto(f'http://127.0.0.1:{args.port}/game.html{query}',wait_until='domcontentloaded',timeout=90000)
            page.bring_to_front()
            if args.probe:
                page.wait_for_timeout(35000);page.screenshot(path=str(args.out/'diagnostic_1920.png'));diagnostic=page.evaluate("()=>({P:typeof P,G:typeof G,char:typeof _charIdx!=='undefined'?_charIdx:null,on:typeof G!=='undefined'?G.on:null,atlas:typeof _atlasP_img!=='undefined'&&_atlasP_img?{w:_atlasP_img.width,h:_atlasP_img.height,r2:!!_atlasP_img._silverR2}:null,preview:typeof SilvertailR2Preview!=='undefined'?SilvertailR2Preview.active:null,boot:document.body.innerText.slice(-350),webgl:typeof _useGL!=='undefined'?_useGL:null,resources:performance.getEntriesByType('resource').length})");(args.out/'diagnostic.json').write_text(json.dumps(dict(state=diagnostic,page_errors=page_errors,bad_responses=bad_responses,console=console_messages,pending={k:round(time.time()-v,1) for k,v in pending.items()},copied=len(copied),missing=sorted(unknown)),ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(diagnostic,ensure_ascii=False),flush=True)
                if not diagnostic['on']:raise RuntimeError('Finite boot diagnostic captured; inspect diagnostic.json before another gameplay run')
            print('visibility',page.evaluate("()=>({hidden:document.hidden,visibility:document.visibilityState,focus:document.hasFocus()})"),flush=True)
            try:
                from silver_r2_scenes import wait_for_gameplay
                wait_for_gameplay(page,r2=not args.default_only)
            except Exception:
                page.screenshot(path=str(args.out/'boot_failure_1920.png'));state=page.evaluate("()=>({hidden:document.hidden,visibility:document.visibilityState,focus:document.hasFocus(),on:G.on,stage:G.stage,warm:typeof _startSceneWarmState!=='undefined'?_startSceneWarmState:null,body:document.body.innerText.slice(-250)})");(args.out/'boot_failure.json').write_text(json.dumps(dict(state=state,page_errors=page_errors,console=console_messages,pending=list(pending)),ensure_ascii=False,indent=2),encoding='utf-8');raise
            page.evaluate("()=>{OPT.sfxVol=0;OPT.bgmVol=0;try{BGM.setVol(0)}catch{};P.iframes=999999;G.paused=true}")
            page.screenshot(path=str(args.out/'probe_1920.png'))
            if args.capture or args.default_only:
                from silver_r2_scenes import capture
                html=git('show',args.baseline+':game.html').decode('utf-8');begin=html.index('const SpriteAnimator=')+len('const SpriteAnimator=');end=html.index('// ── Atlas P',begin);legacy_object=html[begin:end].strip().removesuffix(';')
                if args.default_only:
                    from silver_r2_scenes import default_parity
                    different,control=default_parity(page,args.out,legacy_object);assert different==control==0,(different,control)
                else:capture(context,page,args.out,args.port,legacy_object)
            receipt=dict(boot_seconds=round(time.time()-started,2),state=page.evaluate("()=>({stage:G.stage,on:G.on,char:_charIdx,spriteR2:!!_atlasP_img._silverR2,P:{x:P.x,y:P.y,r:P.r},canvas:{w:C.width,h:C.height},viewport:{w:VW,h:VH},map:{w:G.mw,h:G.mh},atlas:{w:_atlasP_img.width,h:_atlasP_img.height},opt:{sfxVol:OPT.sfxVol,bgmVol:OPT.bgmVol}})"),page_errors=page_errors,bad_responses=bad_responses,materialized_verified_HEAD_assets=copied,missing=sorted(unknown))
        finally:context.close()
finally:
    assert profile.resolve().is_relative_to(args.out.resolve()) and profile.name.startswith('muted-silver-');shutil.rmtree(profile)
(args.out/('default_probe.json' if args.default_only else 'probe.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in receipt.items() if k not in ['materialized_verified_HEAD_assets']},ensure_ascii=False))
