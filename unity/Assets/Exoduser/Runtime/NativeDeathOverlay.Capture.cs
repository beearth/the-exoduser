using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture death <dir>`: kills the Unity player state (Player.Hp = 0), reads the run numbers from the real Simulation, raises the
 // death overlay and captures the web animation timetable at fixed ages, plus the replay screen shape. NativeGame/NativeLobby are silenced, not modified.
 public static class NativeDeathOverlayCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="death")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("DeathOverlayCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Probe {public float age,fade,titleOpacity;}
  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,kills,expLoss,hpAfterKill,deathsTestValue,chapterTestValue,maxCombo;public string stateSource,petEvent,crow,cat,note;public Probe[] probes;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeDeathOverlay overlay;bool show,replay;float replayProgress,replaySeconds;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(overlay==null)return;GUI.depth=-1000;if(replay)overlay.DrawReplayShape(replayProgress,replaySeconds);else if(show)overlay.Draw();}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;
    // Real state change: the Unity player dies (Hp 0). The numbers shown come from the same Simulation the NativeGame patch reads.
    sim.Player.Hp=0;Check(sim.Player.Hp<=0,"Simulation.Player.Hp == 0 (death state)");
    var info=new NativeDeathOverlay.Info{kills=sim.Kills,chapter=0,expLoss=-1,maxCombo=-1,deaths=1,retryBoss=false,damageLog=null};
    overlay=new NativeDeathOverlay();overlay.PulseOffset=3.42f;overlay.ForcedAge=0;overlay.Show(info);show=true;
    Check(overlay.Active,"Show(info) activates the overlay");Check(overlay.EventId=="dd_first","first death picks dd_first ("+overlay.EventId+")");
    var ages=new[]{.012f,.716f,1.409f,1.983f,2.665f,3.907f,4.594f,5.129f,5.687f,6.501f};
    var probes=new List<Probe>();
    foreach(var age in ages){overlay.ForcedAge=age;probes.Add(new Probe{age=age,fade=overlay.DebugFade(age),titleOpacity=overlay.DebugTitleOpacity(age)});yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_death_t"+Mathf.RoundToInt(age*1000));}
    // second death >= 5 uses the repeat line (state: death count)
    var info2=info;info2.deaths=5;overlay.Show(info2);overlay.ForcedAge=3.9f;Check(overlay.EventId=="dd_repeat5","fifth death picks dd_repeat5 ("+overlay.EventId+")");
    yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_death_repeat5");
    overlay.Show(info);overlay.ForcedAge=3.907f;
    // replay screen shape
    show=false;replay=true;replayProgress=.4f;replaySeconds=3.2f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_deathreplay");replay=false;
    overlay.Hide();Check(!overlay.Active,"Hide() deactivates");
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,kills=info.kills,expLoss=info.expLoss,hpAfterKill=(int)sim.Player.Hp,deathsTestValue=info.deaths,chapterTestValue=info.chapter,maxCombo=info.maxCombo,
     stateSource="kills=Simulation.Kills, EXP loss = not ported (-1: Unity deducts no EXP on death), Player.Hp=0 set on the real Simulation; chapter/deaths are explicit test values (Unity has no chapter or death-count state); max combo = not ported (-1)",
     petEvent=overlay.EventId,crow=overlay.CrowLine,cat=overlay.CatLine,note="PulseOffset 3.42s aligns the title pulse phase with the web capture series; damage log null -> drawn as 미이식",probes=probes.ToArray(),checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"death-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}
