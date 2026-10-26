using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture clear <dir>`: draws the stage-clear panel from explicit test values that mirror the web captures (formal and demo build),
 // then once more from the real Unity state (Simulation.Kills, TickCount) with everything Unity does not track shown as "미이식".
 // NativeGame/NativeLobby are silenced, not modified.
 public static class NativeStageClearOverlayCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="clear")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("StageClearOverlayCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,simKills,simTicks,parSeconds,parScore;public string stateSource,testNote,rankFormal,rankDemo;public float[] ages;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeStageClearOverlay overlay;bool show;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(overlay==null||!show)return;GUI.depth=-1000;overlay.Draw();}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;overlay=new NativeStageClearOverlay();
    // (a) web formal-build capture values: 5 kills of 168 spawned, 4s, no combo, no deaths, no damage taken, no regions
    var formal=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=5,totalSpawned=168,clearSeconds=4,regionsCleared=0,bossKilled=true,deaths=0,dmgTaken=0,comboMax=0,
     dmgDealt=0,crits=0,parries=0,potions=0,maxHit=0,dashCount=0,dashMeters=0,walkMeters=0};
    int par=overlay.ParSeconds(168),parScore=overlay.ParScore(168);
    Check(par==510,"par seconds for 168 spawns = round(90+168*2.5) = 510 (got "+par+")");
    Check(parScore==5180,"par score for 168 spawns = 168*10+3500 = 5180 (got "+parScore+")");
    string rankFormal=overlay.Rank(4,par,5*10+1000+(par-4)*10+500+500,parScore,0);
    Check(rankFormal=="S","web formal values (score 7110) rank S (got "+rankFormal+")");
    var ages=new[]{0f,.15f,.3f,.6f,1.5f};
    overlay.ForcedAge=0;overlay.Show(formal);show=true;Check(overlay.Active,"Show(formal) activates the overlay");
    foreach(var age in ages){overlay.ForcedAge=age;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_t"+Mathf.RoundToInt(age*1000));}
    // (b) demo-build capture values (web ref 08): 16 kills, 7s, demo last-stage copy
    var demo=formal;demo.kind=NativeStageClearOverlay.Kind.DemoEnd;demo.stageKills=16;demo.clearSeconds=7;
    overlay.Show(demo);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_demo");
    // (c) hell-escape copy
    var hell=formal;hell.kind=NativeStageClearOverlay.Kind.HellEscape;hell.hellIndex=0;
    overlay.Show(hell);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_hell");
    // (d) real Unity state: only Kills and elapsed ticks exist; everything else is "미이식"
    int kills=sim.Kills,ticks=sim.TickCount;
    var real=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=kills,clearSeconds=ticks/60};
    overlay.Show(real);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_real");
    overlay.Hide();Check(!overlay.Active,"Hide() deactivates");show=false;
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,simKills=kills,simTicks=ticks,parSeconds=par,parScore=parScore,rankFormal=rankFormal,rankDemo="S",
     stateSource="unity_clear_real: kills=Simulation.Kills, clear time=Simulation.TickCount/60; every other value is not tracked by Unity and is drawn as 미이식 (no stage-clear event, boss/region/damage/combo-max state exists)",
     testNote="unity_clear_t* / demo / hell frames use explicit test values copied from the web captures (formal: 5 kills of 168, 4s; demo: 16 kills, 7s) to compare layout; recorded here, not game state",
     ages=ages,checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"stageclear-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}
