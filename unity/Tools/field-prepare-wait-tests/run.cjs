// Policy checks for "do not bounce back to the lobby while the 3D field is still assembling". No Unity: the real
// Runtime/NativeTransitionPrepare.cs and Core/ScreenTransitionFlow.cs are compiled with a small fake frame loop.
// Delay injection (20 s assembly, a 25 s single frame, stopped heartbeat) lives only here.
// usage: node run.cjs [unityRoot] [evidenceDir]
const fs=require('fs'),p=require('path'),cp=require('child_process');
const root=p.resolve(process.argv[2]||p.join(__dirname,'../..')).replaceAll('\\','/');
const evidence=p.resolve(process.argv[3]||'I:/EXODUSER-Storage/codex-takeover/field-prepare/tests').replaceAll('\\','/');
const work=evidence+'/work';fs.mkdirSync(work+'/temp',{recursive:true});
const runtime=root+'/Assets/Exoduser/Runtime';
const program=`using System;using System.Collections.Generic;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
static class P{
 static int checks,failures;static List<string> log=new List<string>();
 static void C(bool ok,string name,string detail=""){checks++;if(!ok)failures++;log.Add((ok?"PASS ":"FAIL ")+name+(detail.Length>0?" | "+detail:""));}
 // Mirrors NativeScreenTransition.Update: ready needs the swap done and no assembly in flight; the flow ticks only through Advance.
 sealed class Sim{
  public ScreenTransitionFlow flow=new ScreenTransitionFlow();public TransitionPrepareWatchdog dog=new TransitionPrepareWatchdog();public bool swapped;public string error;public double wall;public double failedAt=-1,doneAt=-1;public int frames;public bool fieldBound=true;public string recorded;public Action<string> onFail;
  public Func<bool> prepared=()=>true;public Func<string> problem=()=>null;public Func<bool> pending=()=>false;
  public Sim(bool reset=true){if(reset)NativeTransitionProgress.Reset();NativeTransitionProgress.NewTransition();flow.Begin(false);}
  public void Frame(double delta){
   frames++;wall+=delta;bool ready=false;string err=null;
   NativeTransitionProgress.ReleaseOrphan();
   try{ready=swapped&&prepared()&&!NativeTransitionProgress.Blocks(fieldBound,pending());if(swapped&&problem!=null)err=problem();if(swapped&&fieldBound&&string.IsNullOrEmpty(err))err=NativeTransitionProgress.Failure;}catch(Exception e){err=e.Message;}
   err=TransitionPrepareWatchdog.Advance(flow,dog,delta,ready,err,fieldBound&&NativeTransitionProgress.Active,fieldBound?NativeTransitionProgress.Beats:0);
   if(flow.Failed&&string.IsNullOrEmpty(err))err="prepare-failed";
   if(!string.IsNullOrEmpty(err)){bool first=string.IsNullOrEmpty(recorded);recorded=TransitionPrepareWatchdog.FirstReason(recorded,err);if(first&&fieldBound&&TransitionPrepareWatchdog.IsPrepareFailure(err)&&onFail!=null)onFail(err);}
   if(flow.NeedsSwap)swapped=true;
   if(flow.Failed&&failedAt<0){failedAt=wall;error=err;}
   if(!flow.Busy&&doneAt<0)doneAt=wall;
  }
  public bool Busy=>flow.Busy;
 }
 static void Main(){
  const double F=1.0/60;
  // 1. 20 s of assembly that keeps reporting, plus a 15 s single-frame hitch: must enter the field once, no fail.
  {var s=new Sim();double elapsed=0;bool begun=false,hit1=false;int step=0;int tk=0;
   while(s.Busy&&s.wall<120){
    double d=F;
    if(s.swapped&&!begun){tk=NativeTransitionProgress.Begin("test-field");begun=true;}
    if(begun&&NativeTransitionProgress.Active){elapsed+=F;if(!hit1&&step==3){d=15;elapsed+=15-F;hit1=true;}
     if(elapsed>=(step+1)*2.0&&step<10){NativeTransitionProgress.Report("step"+step,(step+1)/10f);step++;}
     if(elapsed>=20&&step>=10){NativeTransitionProgress.End(tk);}}
    s.Frame(d);}
   C(s.doneAt>0&&s.failedAt<0&&!s.flow.Failed,"20s assembly with reports: single transition reaches the field, no recover",s.error??"");
   C(s.doneAt>=20,"waited for the assembly (done at "+s.doneAt.ToString("F1")+"s)");
   C(NativeTransitionProgress.Fraction==1f&&!NativeTransitionProgress.Active,"progress ends at 1 and inactive");}
  // 2. 20 s delay as ONE unreported synchronous 20 s frame (the old failure shape) then continue: must not fail.
  {var s=new Sim();bool begun=false,hit=false;int tk=0;
   while(s.Busy&&s.wall<120){double d=F;
    if(s.swapped&&!begun){tk=NativeTransitionProgress.Begin("test-sync");begun=true;}
    if(begun&&!hit&&s.wall>2){d=20;hit=true;NativeTransitionProgress.End(tk);}
    s.Frame(d);}
   C(hit&&s.doneAt>0&&!s.flow.Failed,"one 20s frame no longer counts as failure",s.error??"");}
  // 3. Heartbeat stop: one report, then silence while frames keep running -> failure at the assembly limit.
  {var s=new Sim();bool begun=false;double stopAt=-1;
   while(s.Busy&&s.wall<120){
    if(s.swapped&&!begun){NativeTransitionProgress.Begin("test-hang");NativeTransitionProgress.Report("one",.1f);begun=true;stopAt=s.wall;}
    s.Frame(F);}
   double after=s.failedAt-stopAt;
   C(s.flow.Failed&&s.failedAt>0,"stopped heartbeat fails",s.error??"");
   C(after>=TransitionPrepareWatchdog.StallSecondsAssembly-.1&&after<=TransitionPrepareWatchdog.StallSecondsAssembly+.5,"stall limit is "+TransitionPrepareWatchdog.StallSecondsAssembly+"s of frame time",after.ToString("F2"));
   C(s.error!=null&&s.error.StartsWith("prepare-stalled"),"stall reason text",s.error??"");}
  // 4. Not an assembly, never ready (e.g. a media decoder that never delivers): old 12 s limit is kept.
  {var s=new Sim();s.prepared=()=>false;double sw=-1;
   while(s.Busy&&s.wall<120){s.Frame(F);if(s.swapped&&sw<0)sw=s.wall;}
   double after=s.failedAt-sw;
   C(s.flow.Failed&&after>=TransitionPrepareWatchdog.StallSecondsIdle-.1&&after<=TransitionPrepareWatchdog.StallSecondsIdle+.5,"non-assembly wait keeps the 12s limit",after.ToString("F2"));}
  // 5. Exception / decoder error fails immediately.
  {var s=new Sim();s.problem=()=>"decoder error";double sw=-1;
   while(s.Busy&&s.wall<120){s.Frame(F);if(s.swapped&&sw<0)sw=s.wall;}
   C(s.flow.Failed&&s.failedAt-sw<.2&&s.error=="decoder error","real error recovers at once",s.error??"");}
  {var s=new Sim();s.prepared=()=>throw new InvalidOperationException("boom");double sw=-1;
   while(s.Busy&&s.wall<120){s.Frame(F);if(s.swapped&&sw<0)sw=s.wall;}
   C(s.flow.Failed&&s.failedAt-sw<.2&&s.error=="boom","exception in prepared() recovers at once",s.error??"");}
  // 6. Plain fast transition is unchanged.
  {var s=new Sim();while(s.Busy&&s.wall<20)s.Frame(F);
   C(s.doneAt>0&&!s.flow.Failed&&s.doneAt>=1.0&&s.doneAt<=1.6,"no-assembly transition completes in about fade out + fade in",s.doneAt.ToString("F2"));}
  // 7. Reports are monotonic and a late small report cannot pull the bar back.
  {NativeTransitionProgress.Reset();NativeTransitionProgress.Begin("m");NativeTransitionProgress.Report("a",.5f);NativeTransitionProgress.Report("b",.2f);float f=NativeTransitionProgress.Fraction;NativeTransitionProgress.Report("c",2f);float g=NativeTransitionProgress.Fraction;
   C(f==.5f&&g==1f,"progress monotonic and clamped",f+" "+g);NativeTransitionProgress.Reset();}
  // 8. Watchdog counts clamped frame time: hitching frames without reports cannot reach the limit faster than the clamp allows.
  {var d=new TransitionPrepareWatchdog();d.Begin(0);bool fail=false;for(int i=0;i<10;i++){bool t=d.Tick(30,0,true);fail|=t&&d.Reason.StartsWith("prepare-stalled");}
   C(!fail&&d.Idle<=10*TransitionPrepareWatchdog.MaxFrame+1e-9,"30s frames count as at most "+TransitionPrepareWatchdog.MaxFrame+"s each",d.Idle.ToString("F2"));}
  // 9 (a). Nothing reports for 2 s after the swap (scene load / lighting), then a 21 s assembly: the transition waits for the field; play never opens first.
  {var s=new Sim();bool loaded=false,early=false;s.pending=()=>!loaded;int tk=0;double began=-1;int step=0;
   while(s.Busy&&s.wall<120){
    if(s.swapped&&began<0)began=s.wall+2;
    if(began>0&&!loaded&&s.wall>=began){
     if(tk==0){tk=NativeTransitionProgress.Begin("test-a2");}
     double el=s.wall-began;if(el>=(step+1)*2.0&&step<10){NativeTransitionProgress.Report("s"+step,(step+1)/10f);step++;}
     if(el>=21){NativeTransitionProgress.End(tk);loaded=true;}}
    s.Frame(F);
    if(!loaded&&s.flow.Phase==ScreenTransitionPhase.FadeIn)early=true;}
   C(!early,"(a) play screen never opened before the assembly finished");
   C(loaded&&s.doneAt>=began+21&&!s.flow.Failed,"(a) waited through the 2s silent gap and the 21s assembly",s.doneAt.ToString("F1")+" "+(s.recorded??""));}
  // 9 (b). Exception during assembly: the guard catches it, 3D fails, the transition opens in 2D with the reason recorded.
  {var s=new Sim();bool failed3d=false,loading3d=true,loaded=false;string why=null;s.pending=()=>!loaded&&!failed3d;int tk=0;bool started=false;System.Collections.IEnumerator run=null;bool finallyRan=false;
   System.Collections.IEnumerator Inner(){try{tk=NativeTransitionProgress.Begin("test-ex");yield return null;NativeTransitionProgress.Report("half",.3f);yield return null;throw new InvalidOperationException("half built");}finally{finallyRan=true;NativeTransitionProgress.End(tk);}}
   System.Collections.IEnumerator Outer(){yield return Inner();loaded=true;}
   NativeTransitionProgress.OwnerAlive=()=>loading3d;
   while(s.Busy&&s.wall<120){
    if(s.swapped&&!started){started=true;run=AssemblyGuard.Run(Outer(),e=>{why="assembly-exception: "+e.GetType().Name+": "+e.Message;NativeTransitionProgress.Fail(why);failed3d=true;loading3d=false;NativeTransitionProgress.Release();});}
    if(run!=null&&!failed3d&&!loaded){for(int k=0;k<30&&!failed3d&&!loaded;k++){if(!run.MoveNext())break;}}
    s.Frame(F);}
   NativeTransitionProgress.OwnerAlive=null;
   C(failed3d&&!loaded&&!loading3d,"(b) exception: r3Failed set, r3Loading cleared, half-built 3D not loaded");
   C(finallyRan,"(b) nested iterator finally ran (progress ended)");
   C(s.doneAt>0&&!NativeTransitionProgress.Active,"(b) transition still finishes (opens 2D), progress inactive");
   C(s.recorded!=null&&s.recorded.Contains("half built"),"(b) failure reason kept in the transition record",s.recorded??"");}
  // 9 (c). Reports never stop for 125 s: the absolute cap fails the preparation at 120 s.
  {var s=new Sim();bool begun=false;int tk=0;double t0=-1,nextReport=0;bool aborted=false;s.onFail=r=>{aborted=true;NativeTransitionProgress.Release();};
   while(s.Busy&&s.wall<130){
    if(s.swapped&&!begun){tk=NativeTransitionProgress.Begin("test-endless");begun=true;t0=s.wall;}
    if(begun&&NativeTransitionProgress.Active&&s.wall-t0>=nextReport){NativeTransitionProgress.Report("tick",.1f);nextReport+=1;}
    s.Frame(F);}
   double after=s.failedAt-t0;
   C(s.flow.Failed&&after>=119.5&&after<=121,"(c) hard cap at 120s although reports keep coming",after.ToString("F2"));
   C(s.recorded!=null&&s.recorded.StartsWith("prepare-hard-cap(120s)"),"(c) reason text",s.recorded??"");
   C(aborted&&!NativeTransitionProgress.Active&&s.doneAt>0,"(c) abort callback ran, progress cleared, black screen ended",s.doneAt.ToString("F1"));}
  // 9 (d). A stale Active (owner died, never ended) must not break the next transition; the dead owner's late End is ignored.
  {NativeTransitionProgress.Reset();int stale=NativeTransitionProgress.Begin("stuck");NativeTransitionProgress.OwnerAlive=()=>false;
   var s=new Sim(false);
   C(!NativeTransitionProgress.Active,"(d) stale Active cleared when the next transition begins");
   int fresh=NativeTransitionProgress.Begin("next");NativeTransitionProgress.End(stale);
   C(NativeTransitionProgress.Active,"(d) a stale End does not close another owner's stage");
   NativeTransitionProgress.End(fresh);NativeTransitionProgress.OwnerAlive=null;
   while(s.Busy&&s.wall<60)s.Frame(F);
   C(s.doneAt>=1.0&&s.doneAt<=1.8&&!s.flow.Failed,"(d) next transition completes normally",s.doneAt.ToString("F2")+" "+(s.recorded??""));
   var s2=new Sim();NativeTransitionProgress.Begin("stuck2");NativeTransitionProgress.OwnerAlive=()=>false;
   while(s2.Busy&&s2.wall<60)s2.Frame(F);NativeTransitionProgress.OwnerAlive=null;
   C(s2.doneAt>0&&!s2.flow.Failed,"(d) supervisor frees an Active left behind mid-transition",s2.doneAt.ToString("F2"));}
  // 9 (e). The first failure reason is kept; FadeIn frames cannot overwrite it with prepare-failed or a later problem text.
  {var s=new Sim();bool begun=false;s.problem=()=>s.flow.Failed?"late-problem":null;
   while(s.Busy&&s.wall<120){if(s.swapped&&!begun){NativeTransitionProgress.Begin("test-hang");NativeTransitionProgress.Report("one",.1f);begun=true;}
    s.Frame(F);}
   C(s.recorded!=null&&s.recorded.StartsWith("prepare-stalled"),"(e) first reason (stalled) preserved over later reasons",s.recorded??"");
   C(TransitionPrepareWatchdog.FirstReason("a","b")=="a"&&TransitionPrepareWatchdog.FirstReason(null,"b")=="b"&&TransitionPrepareWatchdog.FirstReason("","b")=="b","(e) FirstReason helper");}
  // 9 (f). Menu transitions never wait for the field.
  {var s=new Sim();s.fieldBound=false;s.pending=()=>true;NativeTransitionProgress.Begin("background");
   while(s.Busy&&s.wall<60)s.Frame(F);
   C(s.doneAt>=1.0&&s.doneAt<=1.8&&!s.flow.Failed&&!TransitionPrepareWatchdog.FieldBound("splash-menu")&&TransitionPrepareWatchdog.FieldBound("lobby-game")&&TransitionPrepareWatchdog.FieldBound("story-game"),"(f) non-field transitions ignore assembly and pending",s.doneAt.ToString("F2"));}
  foreach(var l in log)Console.WriteLine(l);
  Console.WriteLine("checks="+checks+" failures="+failures);Environment.Exit(failures==0?0:1);}
}
`;
fs.writeFileSync(work+'/Program.cs',program);
fs.writeFileSync(work+'/Prepare.csproj',`<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit><ImplicitUsings>disable</ImplicitUsings><Nullable>disable</Nullable></PropertyGroup><ItemGroup><Compile Include="Program.cs"/><Compile Include="${runtime}/NativeTransitionPrepare.cs"/><Compile Include="${runtime}/Core/ScreenTransitionFlow.cs"/></ItemGroup></Project>`);
fs.writeFileSync(work+'/NuGet.Config','<configuration><packageSources><clear/></packageSources></configuration>');
// NU1100 root cause (11-04): with no global.json the host picks SDK 10, which needs net8 ref packs from NuGet (sources are cleared).
// Pin an installed 8.0 SDK, whose bundled targeting pack builds net8.0 offline. EXO_DOTNET_SDK overrides the version.
fs.writeFileSync(work+'/global.json',JSON.stringify({sdk:{version:process.env.EXO_DOTNET_SDK||'8.0.301',rollForward:'latestFeature'}}));
const dotnet=process.env.EXO_DOTNET||'C:/Program Files/dotnet/dotnet.exe';
const env={...process.env,DOTNET_CLI_HOME:work+'/dotnet-home',DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_NOLOGO:'1',TEMP:work+'/temp',TMP:work+'/temp'};
let r=cp.spawnSync(dotnet,['build',work+'/Prepare.csproj','--verbosity','quiet','-p:UseSharedCompilation=false'],{env,cwd:work,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
fs.writeFileSync(evidence+'/build.log',(r.stdout||'')+(r.stderr||''));if(r.status!==0){console.log(r.stdout,r.stderr);process.exit(1);}
r=cp.spawnSync(dotnet,[work+'/bin/Debug/net8.0/Prepare.dll'],{env,cwd:work,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
fs.writeFileSync(evidence+'/result.txt',(r.stdout||'')+(r.stderr||''));console.log(r.stdout,r.stderr);process.exit(r.status===0?0:1);
