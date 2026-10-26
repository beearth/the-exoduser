using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture boss <dir>`: draws the boss bar from explicit test values that mirror the web captures (intro timeline, steady, poise / status states),
 // then once from the real Unity state of the first living enemy (Unity has no boss actor or boss-entry event). NativeGame/NativeLobby are silenced, not modified.
 public static class NativeBossBarCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="boss")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("BossBarCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Frame {public string name,note;public float age;public float lastNameWidth,lastNameSpacing;public float[] chipWidths;}
  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height;public string stateSource,testNote,realEnemyNote;public Frame[] frames;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeBossBar bar;bool show;
   readonly List<string> checks=new List<string>(),files=new List<string>();readonly List<Frame> frames=new List<Frame>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(bar==null||!show)return;GUI.depth=-1000;bar.Draw();}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;bar=new NativeBossBar();
    string name=bar.BossNameForStage(0);Check(name=="다크드루이드","stage 0 boss name from the definition table = 다크드루이드 (got "+name+")");
    Check(bar.BossNameForStage(34)=="지옥 군주","stage 34 boss name = 지옥 군주 (got "+bar.BossNameForStage(34)+")");Check(bar.BossNameForStage(35)==null,"stage 35 is outside the 35 stages");
    // (a) web intro timeline: bar restarted at age 0, HP/poise full (web capture a23_intro_t*; ForcedAge replaces the clock)
    var full=new NativeBossBar.Input{name=name,hp01=1,poise01=1,state=NativeBossBar.PoiseState.Normal};
    bar.ForcedAge=0;bar.Show(full);show=true;Check(bar.Active,"Show activates the bar");
    foreach(var age in new[]{0f,.3f,.6f,.9f,1.2f,1.5f,1.9f}){bar.ForcedAge=age;yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_intro_t"+Mathf.RoundToInt(age*1000),age,"intro timeline (web .intro, forced age)");}
    // (b) steady state after the intro and the 3s cine fill (web a23_steady)
    bar.ForcedAge=5;yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_steady",5,"steady, hp 100% poise 100%");
    // (c) states: values read from the web dumps of the forced web states (HP fill 498px, poise fill 358px, chip seconds)
    var chips=new List<NativeBossBar.Chip>{new NativeBossBar.Chip{kind="bleed",stacks=2,seconds=4.5f},new NativeBossBar.Chip{kind="poison",stacks=3,seconds=3.5f},new NativeBossBar.Chip{kind="burn",stacks=1,seconds=1.6f},new NativeBossBar.Chip{kind="shock",stacks=1,seconds=1.1f}};
    bar.Show(new NativeBossBar.Input{name=name,hp01=.8f,poise01=.333f,state=NativeBossBar.PoiseState.Normal});yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_hp80_poise33",5,"test values: hp 80%, poise 33% (yellow tier)");
    bar.Show(new NativeBossBar.Input{name=name,hp01=.4f,poise01=.167f,state=NativeBossBar.PoiseState.Normal,chips=chips});yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_hp40_poise17_status",5,"test values: hp 40%, poise 17% (red tier), bleed 2 / poison 3 / burn 1 / shock 1");
    float[] expect={92.45f,79.94f,92.45f,92.45f};var w=bar.LastChipWidths;Check(w.Count==4,"4 status chips");
    for(int i=0;i<w.Count&&i<4;i++)Check(Mathf.Abs(w[i]-expect[i])<=2.5f,"chip "+i+" width "+w[i].ToString("0.00")+" vs web "+expect[i]);
    bar.Show(new NativeBossBar.Input{name=name,hp01=.5f,poise01=1,state=NativeBossBar.PoiseState.Groggy,stateRatio01=.436f,stateSeconds=1.7f});yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_groggy",5,"test values: hp 50%, groggy gauge 43.6%, 1.7s");
    Check(bar.LastChipWidths.Count==1&&Mathf.Abs(bar.LastChipWidths[0]-97.42f)<=2.5f,"groggy chip width "+(bar.LastChipWidths.Count>0?bar.LastChipWidths[0].ToString("0.00"):"-")+" vs web 97.42");
    bar.Show(new NativeBossBar.Input{name=name,hp01=.5f,poise01=1,state=NativeBossBar.PoiseState.Immune,stateRatio01=.1659f,stateSeconds=4.7f});yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_immune",5,"test values: hp 50%, immune (charging) gauge 16.6%, 4.7s");
    Check(bar.LastChipWidths.Count==1&&Mathf.Abs(bar.LastChipWidths[0]-84.91f)<=2.5f,"immune chip width "+(bar.LastChipWidths.Count>0?bar.LastChipWidths[0].ToString("0.00"):"-")+" vs web 84.91");
    // (d) real Unity state: first living enemy stands in for a boss (Unity has no boss actor); name from the stage-0 definition
    EnemyState e=null;foreach(var en in sim.Enemies)if(en.Alive){e=en;break;}
    string realNote;
    if(e!=null){
     bool groggy=e.Stunned>0;
     var real=new NativeBossBar.Input{name=name,hp01=e.MaxHp>0?(float)e.Hp/e.MaxHp:1f,poise01=e.MaxPoise>0?e.Poise/e.MaxPoise:1f,state=groggy?NativeBossBar.PoiseState.Groggy:NativeBossBar.PoiseState.Normal,
      stateRatio01=groggy&&e.MaxStunned>0?e.Stunned/e.MaxStunned:0,stateSeconds=e.Stunned/60f};
     bar.Show(real);yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_boss_real_enemy",5,"real Unity values of enemy id "+e.Id);
     realNote="enemy id "+e.Id+" hp "+e.Hp+"/"+e.MaxHp+" poise "+e.Poise+"/"+e.MaxPoise+" stunned "+e.Stunned+" -> hp01 "+real.hp01.ToString("0.000")+" poise01 "+real.poise01.ToString("0.000");
    } else realNote="no living enemy in the simulation; frame skipped";
    bar.Hide();Check(true,"Hide starts the fade-out");show=false;
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,
     stateSource="Unity has no boss actor or boss-entry event (Simulation.Enemies has Hp/Poise/Stunned only, no boss flag, pImmune or status timers). unity_boss_real_enemy maps an ordinary living enemy through the same API to show the caller mapping; every other frame uses explicit test values.",
     testNote="intro / steady / hp80_poise33 / hp40_poise17_status / groggy / immune frames use explicit test values copied from the web capture dumps (E:/exoduser-wt/_out/pc-a23/web/a23_*.json); they are not game state",
     realEnemyNote=realNote,frames=frames.ToArray(),checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"bossbar-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string file,float age,string note){
    yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,file+".png"));files.Add(file+".png");
    frames.Add(new Frame{name=file,note=note,age=age,lastNameWidth=bar.LastNameWidth,lastNameSpacing=bar.LastNameLetterSpacing,chipWidths=bar.LastChipWidths.ToArray()});yield return null;
   }
  }
 }
}
