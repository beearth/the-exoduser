using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-exp-capture <dir>` (D05): plays the real game (NativeGame stays enabled, HUD and level-up overlay are the live ones), kills ordinary enemies through
 // Simulation.HurtEnemy -> KillEnemy -> AddExperience until the level changes, and captures the HUD before / after at the window's 1x size. Receipt lists the real values.
 public static class NativeLevelExpCapture {
  const string Arg="--unity-exp-capture";
  public static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+1>=a.Length)return false;output=a[i+1];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("LevelExpCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Step {public int kills,level,exp,maxExp,statPoints,passivePoints,materials,combo;}
  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,levelUpEvents,eventLevels,eventStatPoints,eventPassivePoints;public Step before,afterKills,afterLevelUp;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;readonly List<string> checks=new List<string>(),files=new List<string>();int failures,events,eventLevels,eventSp,eventAp;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   static Step Snap(Simulation s){var p=s.Player;return new Step{kills=s.Kills,level=p.Level,exp=p.Experience,maxExp=p.MaxExperience,statPoints=p.StatPoints,passivePoints=p.PassivePoints,materials=s.Materials,combo=s.Combo};}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;
    for(int i=0;i<90;i++)yield return null;
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;sim.LevelledUp+=u=>{events++;eventLevels+=u.Levels;eventSp+=u.StatPoints;eventAp+=u.PassivePoints;};
    var before=Snap(sim);yield return Shot("d05_hud_before");
    // Real kills: ordinary etype0 enemies placed beside the player, killed by the simulation's own damage path.
    int needed=0;float dx=60;
    while(sim.Player.Level==before.level&&needed<200){
     var e=sim.SpawnNormalEnemy(sim.Player.X+dx,sim.Player.Y);if(e==null){dx=-dx+(dx>0?-8:8);continue;}
     sim.HurtEnemy(e,int.MaxValue,0);needed++;
    }
    var after=Snap(sim);
    Check(after.level>before.level,"killing "+needed+" ordinary enemies raised the level ("+before.level+" -> "+after.level+")");
    Check(after.kills==before.kills+needed,"kills counted by the simulation ("+after.kills+")");
    Check(events==1&&eventLevels==after.level-before.level,"one LevelledUp event with the gained levels");
    Check(after.statPoints==before.statPoints+3*(after.level-before.level),"SP +3 per level");
    Check(after.passivePoints==before.passivePoints+(after.level/2-before.level/2),"AP +1 per even level");
    Check(after.maxExp==LevelExp.MaxExperience(after.level),"max exp = web _calcMaxExp(level)");
    // overlay label peaks ~.56s after the trigger; HUD experience bar reads the same Player.Experience
    yield return new WaitForSecondsRealtime(.6f);
    yield return Shot("d05_hud_levelup");
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,levelUpEvents=events,eventLevels=eventLevels,eventStatPoints=eventSp,eventPassivePoints=eventAp,before=before,afterKills=after,afterLevelUp=Snap(sim),checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"exp-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;yield return null;}
  }
 }
}
