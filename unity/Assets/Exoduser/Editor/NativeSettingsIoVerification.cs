using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

// Headless Editor entrypoint. It uses the production native settings codec/store and input adapter,
// but never creates NativeGame, Player, lobby, audio, camera or a character roster store.
public static class NativeSettingsIoVerification
{
 [Serializable] sealed class Receipt
 {
  public string phase,sourceSha,project,output,directory,primary,status,engine,product,identifier;
  public string[] args,checks;
  public bool passed;public int failures,actions,version;public long revision;
 }
 static string Arg(string[] args,string key){int i=Array.IndexOf(args,key);return i>=0&&i+1<args.Length?args[i+1]:"";}
 static bool Supported(string code){if(code==null)return true;KeyCode key;return NativeKeyBindInput.TryKey(code,out key)||code=="mouse0"||code=="mouse1"||code=="mouse2"||code=="mouse3"||code=="mouse4";}
 static void Check(bool ok,string label,ref int failures,System.Collections.Generic.List<string> checks){checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;}
 public static void Run()
 {
  var args=Environment.GetCommandLineArgs();string output=Arg(args,"-output"),phase=Arg(args,"-settings-io-phase"),sourceSha=Arg(args,"-sourceSha");
  // Reject before reading or creating any file. A caller must explicitly seed this dedicated QA namespace.
  if(Array.IndexOf(args,NativeSettingsStorageScope.FixtureArgument)<0||!Path.IsPathRooted(output)||!Path.IsPathRooted(Arg(args,"-receipt"))||(phase!="write"&&phase!="read"&&phase!="cinematic"))throw new ArgumentException("Explicit settings QA flag, absolute output/receipt and supported phase are required");
  output=Path.GetFullPath(output);var folder=new DirectoryInfo(output);
  if(folder.Parent==null||folder.Parent.Name!="_out"||!folder.Name.StartsWith("UNITY-MAC-A15A16-IO-",StringComparison.Ordinal)||Arg(args,"-receipt")!=Path.Combine(output,"editor-settings-"+phase+".json"))throw new ArgumentException("Output must be the dedicated _out/UNITY-MAC-A15A16-IO-* folder and receipt inside it");
  if(sourceSha.Length!=40)throw new ArgumentException("Source SHA required");
  string marker=Path.Combine(output,"qa-output.marker");if(!File.Exists(marker)||File.ReadAllText(marker)!="EXODUSER_MAC_SETTINGS_IO_V2\n")throw new ArgumentException("Isolated QA marker missing");
  string directory;NativeSettingsStoreStatus status;
  if(!NativeSettingsStorageScope.TryResolve(args,"/never-use-personal-root",out directory,out status)||directory!=Path.Combine(output,"native-settings-v1"))throw new InvalidOperationException("Settings QA scope mismatch");
  if(phase=="cinematic"){RunCinematic(args,output,sourceSha);return;}
  var checks=new System.Collections.Generic.List<string>();int failures=0;NativeSettingsSnapshot snapshot=null;
  var receipt=new Receipt{phase=phase,sourceSha=sourceSha,project=Path.GetFullPath(Path.Combine(Application.dataPath,"..")),output=output,directory=directory,primary=Path.Combine(directory,NativeSettingsStore.DataFileName),engine=Application.unityVersion,product=Application.productName,identifier=Application.identifier,args=args};
  try
  {
   var state=new NativeSettingsState(120);var store=new NativeSettingsStore(directory,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);
   Check(store.TryLoad(out snapshot,out status),"isolated native store loads",ref failures,checks);
   if(snapshot==null)throw new InvalidOperationException("No valid isolated snapshot");
   Check(snapshot.extra!=null&&snapshot.extra.ContainsKey("gpKeyMap")&&snapshot.extra["gpKeyMap"]=="{\"pad0\":{\"buttons\":[1,2]}}","gamepad JSON retained",ref failures,checks);
   Check(snapshot.sfxPercent==35&&snapshot.bgmPercent==45&&snapshot.frameCap==144&&snapshot.fullscreen,"four other settings unchanged",ref failures,checks);
   var bindings=new KeyBindings();NativeSettingsJsonCodec.ApplyBindings(snapshot,bindings,Supported);
   Check(bindings.Listed.Count==20&&KeyBindings.Actions.Length==20,"all 20 actions visible to adapter",ref failures,checks);
   for(int i=0;i<KeyBindings.Actions.Length;i++){
    string action=KeyBindings.Actions[i],expected=phase=="read"&&action=="up"?"KeyZ":KeyBindings.DefaultPrimaryOf(action);
    Check(bindings.Primary(action)==expected,"primary "+action,ref failures,checks);
    string alternate=phase=="read"&&action=="up"?"KeyX":phase=="read"&&action=="interact"?"KeyF":null;
    Check(bindings.Secondary(action)==alternate,"secondary "+action,ref failures,checks);
   }
   if(phase=="write"){
    Check(snapshot.version==1&&snapshot.revision==7&&status==NativeSettingsStoreStatus.Loaded,"v1 loaded with default bindings",ref failures,checks);
    string rejection;Check(bindings.TrySet("up","KeyZ",false,out rejection)&&bindings.TrySet("up","KeyX",true,out rejection)&&bindings.TrySet("interact","KeyF",true,out rejection),"native adapter accepts three remaps",ref failures,checks);
    Check(state.TryRestore(snapshot.sfxPercent,snapshot.bgmPercent,snapshot.frameCap),"state restored",ref failures,checks);
    Check(store.TrySave(state,snapshot.fullscreen,bindings,out status)&&status==NativeSettingsStoreStatus.Saved,"v2 atomic publish",ref failures,checks);
    string saved=File.ReadAllText(receipt.primary);var published=NativeSettingsJsonCodec.Decode(saved);
    Check(published.version==2&&published.revision==8&&published.binds.Length==20&&published.binds2.Length==20,"v2 payload and revision",ref failures,checks);
    Check(published.binds[0]=="KeyZ"&&published.binds2[0]=="KeyX"&&published.binds2[13]=="KeyF"&&published.extra["gpKeyMap"]==snapshot.extra["gpKeyMap"],"v2 bindings and gamepad persisted",ref failures,checks);
    snapshot=published;
   }else Check(snapshot.version==2&&snapshot.revision==8&&status==NativeSettingsStoreStatus.Loaded,"separate Unity process reloads v2",ref failures,checks);
  }catch(Exception e){failures++;checks.Add("FAIL exception "+e.GetType().Name+": "+e.Message);Debug.LogException(e);}
  receipt.checks=checks.ToArray();receipt.failures=failures;receipt.passed=failures==0;receipt.status=status.ToString();receipt.actions=KeyBindings.Actions.Length;receipt.version=snapshot==null?0:snapshot.version;receipt.revision=snapshot==null?0:snapshot.revision;
  File.WriteAllText(Arg(args,"-receipt"),JsonUtility.ToJson(receipt,true));Debug.Log("UNITY_SETTINGS_IO_"+phase.ToUpperInvariant()+" "+(receipt.passed?"PASS":"FAIL")+" "+checks.Count+" output="+output);
  EditorApplication.Exit(receipt.passed?0:2);
 }
 static void RunCinematic(string[] args,string output,string sourceSha)
 {
  var checks=new System.Collections.Generic.List<string>();int failures=0;NativeSettingsStoreStatus status=NativeSettingsStoreStatus.Missing;
  var receipt=new Receipt{phase="cinematic",sourceSha=sourceSha,project=Path.GetFullPath(Path.Combine(Application.dataPath,"..")),output=output,engine=Application.unityVersion,product=Application.productName,identifier=Application.identifier,args=args};
  try
  {
   var state=new NativeSettingsState(120);string pad="{\"pad0\":{\"buttons\":[1,2]}}";
   string missing=Path.Combine(output,"cinematic-missing"),v1=Path.Combine(output,"cinematic-v1"),v2=Path.Combine(output,"cinematic-v2-false"),invalid=Path.Combine(output,"cinematic-invalid");
   var firstStore=new NativeSettingsStore(missing,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);
   NativeSettingsSnapshot snapshot;Check(firstStore.TryLoad(out snapshot,out status)&&status==NativeSettingsStoreStatus.Missing&&snapshot.extra!=null&&!snapshot.extra.ContainsKey("cinSeen")&&!Directory.Exists(missing),"missing settings starts intro without a write",ref failures,checks);
   Directory.CreateDirectory(v1);string v1Path=Path.Combine(v1,NativeSettingsStore.DataFileName);
   File.WriteAllText(v1Path,"{\"schema\":\"exoduser.unity.settings\",\"version\":1,\"revision\":7,\"sfxPercent\":35,\"bgmPercent\":45,\"frameCap\":144,\"fullscreen\":false,\"gpKeyMap\":"+pad+"}");
   var store=new NativeSettingsStore(v1,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);
   Check(store.TryLoad(out snapshot,out status)&&status==NativeSettingsStoreStatus.Loaded&&snapshot.version==1&&!snapshot.extra.ContainsKey("cinSeen"),"v1 without marker starts intro",ref failures,checks);
   state.TryRestore(snapshot.sfxPercent,snapshot.bgmPercent,snapshot.frameCap);var bindings=new KeyBindings();string rejection;
   Check(bindings.TrySet("up","KeyZ",false,out rejection)&&bindings.TrySet("up","KeyX",true,out rejection),"isolated remaps accepted",ref failures,checks);
   Check(store.TrySave(state,false,bindings,false,out status)&&status==NativeSettingsStoreStatus.Saved,"ordinary v1 to v2 settings save leaves intro unseen",ref failures,checks);
   var before=NativeSettingsJsonCodec.Decode(File.ReadAllText(v1Path));
   Check(before.version==2&&before.revision==8&&!before.extra.ContainsKey("cinSeen")&&before.extra["gpKeyMap"]==pad&&before.binds[0]=="KeyZ"&&before.binds2[0]=="KeyX","v2 absent marker preserves bindings and gamepad JSON",ref failures,checks);
   Check(store.TrySave(state,false,bindings,true,out status)&&status==NativeSettingsStoreStatus.Saved,"completion atomically writes marker",ref failures,checks);
   var persisted=File.ReadAllText(v1Path);var complete=NativeSettingsJsonCodec.Decode(persisted);
   Check(complete.version==2&&complete.revision==9&&complete.extra["cinSeen"]=="true"&&persisted.Contains("\"cinSeen\":true")&&complete.extra["gpKeyMap"]==pad&&complete.binds[0]=="KeyZ"&&complete.binds2[0]=="KeyX","boolean marker roundtrip keeps v2 settings",ref failures,checks);
   var restarted=new NativeSettingsStore(v1,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,new NativeSettingsState(120),false);
   Check(restarted.TryLoad(out snapshot,out status)&&status==NativeSettingsStoreStatus.Loaded&&snapshot.extra["cinSeen"]=="true","separate store reload starts at lobby",ref failures,checks);
   var explicitFalse=NativeSettingsStore.Capture(state,false);explicitFalse.revision=1;explicitFalse.extra["cinSeen"]="false";explicitFalse.extra["gpKeyMap"]=pad;
   Directory.CreateDirectory(v2);File.WriteAllText(Path.Combine(v2,NativeSettingsStore.DataFileName),NativeSettingsJsonCodec.Encode(explicitFalse));
   var falseStore=new NativeSettingsStore(v2,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);
   Check(falseStore.TryLoad(out snapshot,out status)&&snapshot.extra["cinSeen"]=="false","v2 false marker starts intro",ref failures,checks);
   Check(falseStore.TrySave(state,false,bindings,false,out status)&&NativeSettingsJsonCodec.Decode(File.ReadAllText(Path.Combine(v2,NativeSettingsStore.DataFileName))).extra["cinSeen"]=="false","ordinary save preserves explicit false and unknown fields",ref failures,checks);
   var shortHold=new LobbyFlow();shortHold.HoldSkip(true,4.9);Check(shortHold.Page==LobbyPage.Title&&!NativeLobby.IntroCompletionWasEarned(LobbyPage.Title,shortHold.Page,true,false),"short hold leaves title and marker unchanged",ref failures,checks);
   shortHold.HoldSkip(true,.11);Check(shortHold.Page==LobbyPage.Lobby&&NativeLobby.IntroCompletionWasEarned(LobbyPage.Title,shortHold.Page,true,false),"five-second title hold earns marker",ref failures,checks);
   var world=new LobbyFlow();world.EnterGate();world.TickGate(16,0,false,0);Check(world.Page==LobbyPage.WorldIntro,"world intro reached after gate",ref failures,checks);
   world.FinishIntro();Check(NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,world.Page,false,false),"natural world completion earns marker",ref failures,checks);
   var errorWorld=new LobbyFlow();errorWorld.EnterGate();errorWorld.TickGate(16,0,false,0);errorWorld.FinishIntro();Check(!NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,errorWorld.Page,false,true),"video error alone never earns marker",ref failures,checks);
   var errorHold=new LobbyFlow();errorHold.EnterGate();errorHold.TickGate(16,0,false,0);errorHold.HoldSkip(true,5.01);Check(errorHold.Page==LobbyPage.Lobby&&NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,errorHold.Page,true,true),"explicit hold after video error earns marker",ref failures,checks);
   var gateHold=new LobbyFlow();gateHold.EnterGate();gateHold.HoldSkip(true,5.01);Check(gateHold.Page==LobbyPage.Lobby&&NativeLobby.IntroCompletionWasEarned(LobbyPage.Gate,gateHold.Page,true,false),"five-second gate hold earns marker",ref failures,checks);
   var lastCut=new LobbyFlow();lastCut.EnterGate();lastCut.TickGate(16,0,false,0);Check(lastCut.NextCut(109.30)<0,"last world cue reaches finish branch",ref failures,checks);
   lastCut.FinishIntro();Check(NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,lastCut.Page,false,false),"last cue completion earns marker",ref failures,checks);
   var manualError=new LobbyFlow();manualError.EnterGate();manualError.TickGate(16,0,false,0);manualError.FinishIntro();Check(NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,manualError.Page,false,true,true),"manual last cue after playback error earns marker",ref failures,checks);
   Check(!NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,LobbyPage.Lobby,false,true,false),"playback error callback alone leaves marker unseen",ref failures,checks);
   Check(complete.extra["cinSeen"]=="true"&&NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,LobbyPage.Lobby,false,true,true),"previously completed marker survives later error",ref failures,checks);
   var failedBytes=File.ReadAllBytes(v1Path);Check(!NativeLobby.IntroCompletionWasEarned(LobbyPage.WorldIntro,LobbyPage.Lobby,false,true)&&Convert.ToBase64String(failedBytes)==Convert.ToBase64String(File.ReadAllBytes(v1Path)),"later video error preserves completed settings",ref failures,checks);
   Directory.CreateDirectory(invalid);string invalidPath=Path.Combine(invalid,NativeSettingsStore.DataFileName);File.WriteAllText(invalidPath,"{broken");byte[] invalidBefore=File.ReadAllBytes(invalidPath);
   var rejected=new NativeSettingsStore(invalid,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);
   Check(!rejected.TryLoad(out snapshot,out status)&&status==NativeSettingsStoreStatus.InvalidData&&!rejected.TrySave(state,false,bindings,true,out status)&&status==NativeSettingsStoreStatus.NotLoaded&&Convert.ToBase64String(invalidBefore)==Convert.ToBase64String(File.ReadAllBytes(invalidPath)),"read failure cannot replace user settings with marker",ref failures,checks);
  }catch(Exception e){failures++;checks.Add("FAIL exception "+e.GetType().Name+": "+e.Message);Debug.LogException(e);}
  receipt.checks=checks.ToArray();receipt.failures=failures;receipt.passed=failures==0;receipt.status=status.ToString();
  File.WriteAllText(Arg(args,"-receipt"),JsonUtility.ToJson(receipt,true));Debug.Log("UNITY_SETTINGS_IO_CINEMATIC "+(receipt.passed?"PASS":"FAIL")+" "+checks.Count+" output="+output);
  EditorApplication.Exit(receipt.passed?0:2);
 }
}
