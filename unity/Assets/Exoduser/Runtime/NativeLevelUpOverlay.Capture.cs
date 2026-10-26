using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture levelup <dir>`: raises the level-up overlay from a real Simulation.AddExperience level change (the same level-change
 // check the NativeGame patch uses) and captures the web animation timetable at fixed ages. NativeGame/NativeLobby are silenced, not modified.
 // The anchor (player position on screen) is an explicit test value taken from the web capture (06a), recorded in the receipt.
 public static class NativeLevelUpOverlayCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="levelup")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("LevelUpOverlayCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,levelBefore,levelAfter,statPointsBefore,statPointsAfter;public string levelSource,anchorNote;public float[] anchor;public float[] ages;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeLevelUpOverlay overlay;Vector2 anchor;bool show;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(overlay==null||!show)return;GUI.depth=-1000;overlay.Draw(anchor);}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;int before=sim.Player.Level,spBefore=sim.Player.StatPoints;
    // Real level change through the simulation's own experience path (+1 level): the level shown comes from here.
    sim.AddExperience(sim.Player.MaxExperience*3);
    int after=sim.Player.Level;Check(after>before,"Simulation.AddExperience raised the level ("+before+" -> "+after+")");
    overlay=new NativeLevelUpOverlay();anchor=new Vector2(972,694.6f);
    var ages=new[]{.002f,.56f,1.105f,1.65f,2.203f,2.765f,3.308f,3.883f};
    overlay.ForcedAge=0;overlay.Show(after);show=true;
    Check(overlay.Active&&overlay.Level==after,"Show(level) activates the overlay with the Unity level");
    foreach(var age in ages){overlay.ForcedAge=age;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_levelup_t"+Mathf.RoundToInt(age*1000));}
    overlay.ForcedAge=3.883f;yield return null;yield return null;Check(!overlay.Active,"overlay is inactive after label 3.5s + toast 2.5s");
    overlay.ForcedAge=0;overlay.Show(after,true);overlay.ForcedAge=.56f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_levelup_demonic_t560");
    overlay.Hide();show=false;
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,levelBefore=before,levelAfter=after,statPointsBefore=spBefore,statPointsAfter=sim.Player.StatPoints,
     levelSource="Simulation.Player.Level after Simulation.AddExperience (real Unity state)",anchorNote="test value: web 06a player screen position (972, 694.6); the NativeGame patch passes the real player screen position",
     anchor=new[]{anchor.x,anchor.y},ages=ages,checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"levelup-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}
