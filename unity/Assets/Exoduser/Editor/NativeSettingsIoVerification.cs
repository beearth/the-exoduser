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
  if(Array.IndexOf(args,NativeSettingsStorageScope.FixtureArgument)<0||!Path.IsPathRooted(output)||!Path.IsPathRooted(Arg(args,"-receipt"))||(phase!="write"&&phase!="read"))throw new ArgumentException("Explicit settings QA flag, absolute output/receipt and write/read phase are required");
  output=Path.GetFullPath(output);var folder=new DirectoryInfo(output);
  if(folder.Parent==null||folder.Parent.Name!="_out"||!folder.Name.StartsWith("UNITY-MAC-A15A16-IO-",StringComparison.Ordinal)||Arg(args,"-receipt")!=Path.Combine(output,"editor-settings-"+phase+".json"))throw new ArgumentException("Output must be the dedicated _out/UNITY-MAC-A15A16-IO-* folder and receipt inside it");
  if(sourceSha.Length!=40)throw new ArgumentException("Source SHA required");
  string marker=Path.Combine(output,"qa-output.marker");if(!File.Exists(marker)||File.ReadAllText(marker)!="EXODUSER_MAC_SETTINGS_IO_V2\n")throw new ArgumentException("Isolated QA marker missing");
  string directory;NativeSettingsStoreStatus status;
  if(!NativeSettingsStorageScope.TryResolve(args,"/never-use-personal-root",out directory,out status)||directory!=Path.Combine(output,"native-settings-v1"))throw new InvalidOperationException("Settings QA scope mismatch");
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
}
