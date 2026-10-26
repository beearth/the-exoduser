using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture area <dir>`: captures the area-title animation timetable (web hudAreaTitle) and the top-right objective panel.
 // Panel frames: `real` uses the live Simulation (level, experience, kills, materials; no area-kill total -> 미이식); `web_a`/`web_b` use explicit
 // test values copied from the web captures so the layout can be compared number for number (recorded in the receipt). NativeGame/NativeLobby are silenced, not modified.
 public static class NativeAreaTitleCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="area")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("AreaTitleCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Probe {public float ageMs,opacity,ty,blur,webOpacity,webTy,webBlur;}
  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,simLevel,simExp,simMaxExp,simKills,simMaterials;public string stateSource,testNote,krText,enText;public Probe[] probes;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeAreaTitle title;NativeObjectivePanel panel;NativeObjectivePanel.Info info;bool showTitle;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){
    if(panel==null)return;GUI.depth=-1000;
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var old=GUI.matrix;
    GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,Vector3.one*s);panel.Draw(Screen.width/s,info);GUI.matrix=old;
    if(showTitle)title.Draw();
   }
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;title=new NativeAreaTitle();panel=new NativeObjectivePanel();
    info=new NativeObjectivePanel.Info{level=sim.Player.Level,exp=sim.Player.Experience,maxExp=sim.Player.MaxExperience,materials=sim.Materials,areaKills=sim.Kills,areaTotal=null};
    // title timetable: same sample times as the web capture (Web Animations currentTime), caller value = Unity stage 0
    var ages=new[]{0f,60f,150f,300f,403f,1100f,2140f,2500f,2900f,3099f};
    var wOp=new[]{0f,.0445224f,.288511f,.864857f,1f,1f,.999998f,.706234f,.0886222f,2.04709e-06f};
    var wTy=new[]{-15f,-14.3322f,-10.6723f,-2.02714f,0f,0f,1.43296e-05f,2.05636f,6.37964f,6.99999f};
    var wBl=new[]{5f,4.77739f,3.55744f,.675715f,0f,0f,4.09418e-06f,.587533f,1.82276f,2f};
    var probes=new List<Probe>();title.ForcedAge=0;title.Show(0);showTitle=true;
    Check(title.Active,"Show(stage 0) activates the title");Check(title.KrText()=="제1구역 · 썩은 숲 1구역","Korean line = 제1구역 · 썩은 숲 1구역 (got "+title.KrText()+")");Check(title.EnText()=="THE ROTTEN FOREST","English line = THE ROTTEN FOREST (got "+title.EnText()+")");
    for(int i=0;i<ages.Length;i++){
     title.ForcedAge=ages[i]/1000f;title.Sample(ages[i]/1000f,out float op,out float ty,out float bl);
     probes.Add(new Probe{ageMs=ages[i],opacity=op,ty=ty,blur=bl,webOpacity=wOp[i],webTy=wTy[i],webBlur=wBl[i]});
     Check(Mathf.Abs(op-wOp[i])<.012f&&Mathf.Abs(ty-wTy[i])<.2f&&Mathf.Abs(bl-wBl[i])<.1f,"keyframe sample at "+ages[i]+"ms matches the web computed style (op "+op.ToString("0.000")+" ty "+ty.ToString("0.00")+" blur "+bl.ToString("0.00")+")");
     yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_area_t"+Mathf.RoundToInt(ages[i]));
    }
    // Hangul / English fallback: stage 10 (지옥의 겨울 1구역) and an out-of-table stage
    title.Show(10);title.ForcedAge=1.1f;Check(title.KrText()=="제11구역 · 지옥의 겨울 1구역","stage 10 Korean text from the table ("+title.KrText()+")");yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_area_stage10");
    title.Show(99);Check(title.KrText()=="미이식","stage outside the table is drawn as 미이식");
    title.Hide();showTitle=false;
    // panel frames
    yield return new WaitForSecondsRealtime(.2f);yield return Shot("unity_panel_real");
    info=new NativeObjectivePanel.Info{level=1,exp=0,maxExp=15,materials=1000,areaKills=0,areaTotal=32};yield return new WaitForSecondsRealtime(.5f);yield return Shot("unity_panel_web_a");
    info=new NativeObjectivePanel.Info{level=15,exp=1234,maxExp=2000,materials=12345,areaKills=7,areaTotal=32};yield return new WaitForSecondsRealtime(.25f);
    panel.ForcedPulseAge=.15f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_panel_pulse_t150");panel.ForcedPulseAge=null;yield return new WaitForSecondsRealtime(.5f);yield return Shot("unity_panel_web_b");
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,simLevel=sim.Player.Level,simExp=sim.Player.Experience,simMaxExp=sim.Player.MaxExperience,simKills=sim.Kills,simMaterials=sim.Materials,
     stateSource="unity_panel_real: level/exp/maxExp/materials/kills from the live Simulation; area-kill total is not tracked by Unity -> 미이식. Title stage index 0 = Unity's only stage (explicit value; NativeGame patch passes the same)",
     testNote="unity_panel_web_a/web_b use explicit test values from the web capture (a: Lv1 0/15 kills 0/32 materials 1000; b: Lv15 1,234/2,000 kills 7/32 materials 12,345) to compare layout; unity_panel_pulse_t150 freezes the count pulse at 150ms (ForcedPulseAge)",
     krText="제1구역 · 썩은 숲 1구역",enText="THE ROTTEN FOREST",probes=probes.ToArray(),checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"area-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}
