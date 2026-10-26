using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture flavor <dir> [--unity-build-flavor <full|demo|bic|ea>]`: draws the lobby build labels and the stage-clear panel for the flavor that
 // BuildFlavor resolves (command line > embedded build_flavor.json > full) and records every flavor's definition row in the receipt. The clear panel uses
 // explicit test values copied from the web formal capture (recorded in the receipt). NativeGame/NativeLobby are silenced, not modified.
 public static class NativeBuildFlavorCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="flavor")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("BuildFlavorCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Row {public string name,label,limits,loginKo,loginEn,demoEndSub,demoEndButton,entry,saveNamespace;public bool demoMode,packaged;public int levelCap,appId,depotId,port,affixBanned,fuseAllowed;}
  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height;public string flavor,source,commandLineValue,versionLine,clearVariant,testNote;public Row[] flavors;public string[] notPorted,checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeStageClearOverlay clear;bool showLobby,showClear;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){
    GUI.depth=-1000;float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var old=GUI.matrix;
    if(showLobby){
     GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
     var c=GUI.color;GUI.color=new Color(.063f,.051f,.055f);GUI.DrawTexture(new Rect(0,0,1920,1080),Texture2D.whiteTexture);GUI.color=c;
     NativeLobbyBuildLabels.Draw(913f);GUI.matrix=old;
    }
    if(showClear&&clear!=null)clear.Draw();
   }
   static Row RowOf(BuildFlavor f){return new Row{name=f.Name,label=f.Label,limits=f.Limits,loginKo=f.LoginHeading(false),loginEn=f.LoginHeading(true),demoEndSub=f.DemoEndAtStage(0)?f.DemoEndSub(false):"",demoEndButton=f.DemoEndAtStage(0)?f.DemoEndButton(false):"",entry=f.Entry,saveNamespace=f.SaveNamespace,demoMode=f.DemoMode,packaged=f.Packaged,levelCap=f.LevelCap,appId=f.AppId,depotId=f.DepotId,port=f.Port,affixBanned=f.AffixBanned.Length,fuseAllowed=f.FuseAllowed.Length};}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.063f,.051f,.055f);}
    Directory.CreateDirectory(dir);
    string source;string cmd=BuildFlavor.ResolveName(out source);var f=BuildFlavor.Current;string name=f.Name;
    var args=Environment.GetCommandLineArgs();int ai=Array.IndexOf(args,BuildFlavor.Argument);
    if(ai>=0&&ai+1<args.Length)Check(string.Equals(args[ai+1].Trim(),name,StringComparison.OrdinalIgnoreCase)||(args[ai+1]=="official"&&name=="full"),"command line "+args[ai+1]+" resolves to "+name);
    else Check(source!="command line","no command line value: flavor comes from "+source+" ("+name+")");
    Check(f.Label.Length>0&&f.Limits.Length>0,"flavor "+name+" has a lobby label and limits text ("+f.Label+" | "+f.Limits+")");
    bool demoLike=name=="demo"||name=="bic";
    Check(f.DemoEndAtStage(0)==demoLike,"demo-end panel at stage 0 only for demo/bic (this flavor: "+f.DemoEndAtStage(0)+")");Check(!f.DemoEndAtStage(1),"stage 1 never turns into the demo-end panel");
    Check((f.LevelCap==100)==demoLike&&f.DemoMode==demoLike,"level cap definition 100 only for demo/bic (definition only, no enforcement)");
    string v=BuildFlavor.VersionLine;Check(v.StartsWith("v")&&v.Contains(" · "),"version line has the web format ("+v+")");
    // lobby frame
    showLobby=true;yield return new WaitForSecondsRealtime(.3f);yield return Shot("unity_flavor_"+name+"_lobby");showLobby=false;
    // stage clear frame: web formal-capture test values, stage index 0 passed by the caller
    clear=new NativeStageClearOverlay();
    var input=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageIndex=0,stageKills=5,totalSpawned=168,clearSeconds=4,regionsCleared=0,bossKilled=true,deaths=0,dmgTaken=0,comboMax=0,dmgDealt=0,crits=0,parries=0,potions=0,maxHit=0,dashCount=0,dashMeters=0,walkMeters=0};
    clear.ForcedAge=1.5f;clear.Show(input);showClear=true;
    Check(clear.ShownKind==(demoLike?NativeStageClearOverlay.Kind.DemoEnd:NativeStageClearOverlay.Kind.Zone),"clear panel variant for "+name+" = "+clear.ShownKind);
    yield return new WaitForSecondsRealtime(.3f);yield return Shot("unity_flavor_"+name+"_clear");
    var input1=input;input1.stageIndex=1;clear.Show(input1);Check(clear.ShownKind==NativeStageClearOverlay.Kind.Zone,"stage 1 clear stays the zone panel in every flavor");
    clear.Hide();showClear=false;
    // every flavor's definition row (Override, then back)
    var rows=new List<Row>();foreach(BuildFlavor.Kind k in Enum.GetValues(typeof(BuildFlavor.Kind))){BuildFlavor.Override(k);rows.Add(RowOf(BuildFlavor.Current));}
    BuildFlavor.ResetOverride();Check(BuildFlavor.Current.Name==name,"after the override cycle the resolved flavor is back to "+name);
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,flavor=name,source=source,commandLineValue=cmd,versionLine=v,clearVariant=demoLike?"DemoEnd":"Zone",
     testNote="unity_flavor_*_clear uses explicit test values copied from the web formal capture (5 kills of 168, 4s, stage index 0) to compare the sub/button text; the lobby frame draws the labels on the lobby panel colour (the lobby video/art is not part of this check)",
     flavors=rows.ToArray(),notPorted=BuildFlavor.NotPorted,checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"flavor-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}
