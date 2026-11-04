using System;
using System.Collections;
using System.IO;
using System.Text;
using UnityEngine;
namespace Exoduser.UnityPort {
 public static class A2RD4 {
  // D4: close-range hell-rot props, floor contrast, camp tint. --a2r-d4-off restores the D3 (f211ba2b3) look for the before|after proof.
  public static readonly bool On=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-d4-off")<0;
 }
 public sealed partial class NativeGame {
  IEnumerator A2RD5Diagnostic(){
   bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;yield return A2RNatureSize(3840);yield return R18Pose(a2rPlay.start);Shader.SetGlobalFloat("_A2RWindOff",1);Shader.SetGlobalFloat("_A2RD5",0);a2rModels.D5ShowGrowth(true);yield return A2RPlayShot("diag-entry-d4-static");Shader.SetGlobalFloat("_A2RD5",A2RD5.On?1:0);a2rModels.D5ShowGrowth(false);yield return A2RPlayShot("d5-entry-3840");yield return R18Pose(new Vector2(2450,4800));yield return D5EnsureRewardProof();
   Shader.SetGlobalFloat("_A2RWindOff",1);Shader.SetGlobalFloat("_A2RD5",0);a2rModels.D5ShowGrowth(true);yield return A2RPlayShot("diag-growth-before");var oldAo=a2rModels.D5Hide("ao");yield return A2RPlayShot("diag-camp-d4-no-ao");foreach(var go in oldAo)go.SetActive(true);Shader.SetGlobalFloat("_A2RD5",A2RD5.On?1:0);a2rModels.D5ShowGrowth(false);yield return A2RPlayShot("diag-growth-after");yield return A2RPlayShot("diag-camp-base");Shader.SetGlobalFloat("_A2RD5",0);yield return A2RPlayShot("diag-camp-d4-color");Shader.SetGlobalFloat("_A2RD5",A2RD5.On?1:0);
   var info=new StringBuilder();var targets=new[]{new Vector2(1845,455),new Vector2(2155,455),new Vector2(2300,455),new Vector2(2690,455),new Vector2(2865,455)};
   var renderers=UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None);
   foreach(var target in targets){info.AppendLine("pixel="+target);var candidates=new System.Collections.Generic.List<string>();foreach(var r in renderers){if(!r.enabled)continue;var p=r3Cam.WorldToScreenPoint(r.bounds.center);if(p.z<=0)continue;float d=Vector2.Distance(new Vector2(p.x,Screen.height-p.y),target);if(d>180)continue;string t=r.name;for(var parent=r.transform.parent;parent!=null;parent=parent.parent)t=parent.name+"/"+t;var sprite=r as SpriteRenderer;if(sprite!=null&&sprite.sprite!=null)t+=" sprite="+sprite.sprite.name+" spriteTexture="+sprite.sprite.texture.name;t+=" size="+r.bounds.size+" rotation="+r.transform.eulerAngles;foreach(var m in r.sharedMaterials)if(m!=null)t+=" shader="+m.shader.name+" tex="+(m.HasProperty("_BaseMap")&&m.GetTexture("_BaseMap")!=null?m.GetTexture("_BaseMap").name:m.HasProperty("_MainTex")&&m.GetTexture("_MainTex")!=null?m.GetTexture("_MainTex").name:"");candidates.Add(d.ToString("F1")+" "+t);}candidates.Sort(StringComparer.Ordinal);foreach(var t in candidates)info.AppendLine(t);}
   File.WriteAllText(Path.Combine(a2rPlayOutput,"dot-objects.txt"),info.ToString());
   foreach(var category in new[]{"ao","hellrot","d3","d4"}){var hidden=a2rModels.D5Hide(category);yield return A2RPlayShot("diag-camp-no-"+category);foreach(var go in hidden)go.SetActive(true);}
   a2rOcclusion.SetMasksEnabled(false);yield return A2RPlayShot("diag-camp-no-sight");a2rOcclusion.SetMasksEnabled(true);
   a2rModels.SetLook(false);yield return A2RPlayShot("diag-camp-no-3d");a2rModels.SetLook(true);
   yield return R18Pose(new Vector2(4320,6700));for(int n=0;n<20;n++){UpdateViews();yield return null;}
   yield return A2RPlayShot("diag-bridge-wind-off");Shader.SetGlobalFloat("_A2RWindOff",0);a2rModels.WindDiagnostics();a2rModels.D5VisibleWind(r3Cam,Path.Combine(a2rPlayOutput,"visible-wind.txt"));D5WriteCalibration();const int frames=60;Time.captureFramerate=30;var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);string dir=Path.Combine(a2rPlayOutput,"debug10");Directory.CreateDirectory(dir);
   for(int f=0;f<frames;f++){UpdateViews();yield return new WaitForEndOfFrame();image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(dir,"f"+f.ToString("000")+".jpg"),image.EncodeToJPG(92));}
   Time.captureFramerate=0;Destroy(image);Simulation.Config.EnemyAiEnabled=ai;
  }

  // D4 wind measurement: fixed 30 fps game time (Time.captureFramerate), 3840x1080 1x JPG frames, wind ON then OFF at the same pose, no enemies.
  IEnumerator A2RD4Proof(){
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-d5-diagnostic")>=0){yield return A2RD5Diagnostic();yield break;}
   bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;yield return A2RNatureSize(1920);A2RSetLook(true);a2rModels.SetLook(true);a2rModels.SetClean(true);a2rLighting.ApplyClean(true);
   yield return A2RNatureSize(3840);
   var names=new[]{"bridge-north","camp"};var poses=new[]{new Vector2(4320,6700),new Vector2(2450,4800)};
   for(int s=0;s<poses.Length;s++){yield return R18Pose(poses[s]);var p=new Vector2(Simulation.Player.X,Simulation.Player.Y);R19Spawn(p,6);for(int n=0;n<20;n++){UpdateViews();yield return null;}yield return A2RPlayShot("d4-"+names[s]+"-3840");Simulation.Enemies.Clear();}
   // wind sequences at the bridge-north pose
   yield return R18Pose(poses[0]);for(int n=0;n<20;n++){UpdateViews();yield return null;}
   var report=new StringBuilder();report.Append("{\"diag\":\""+a2rModels.WindDiagnostics().Replace("\"","'")+"\"");
   D5WriteCalibration();const int frames=300;Time.captureFramerate=30;var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);
   foreach(var mode in new[]{"on","off"}){
    Shader.SetGlobalFloat("_A2RWindOff",mode=="off"?1:0);string dir=Path.Combine(a2rPlayOutput,"wind-"+mode);Directory.CreateDirectory(dir);for(int n=0;n<6;n++){UpdateViews();yield return null;}
    for(int f=0;f<frames;f++){UpdateViews();yield return new WaitForEndOfFrame();image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(dir,"f"+f.ToString("000")+".jpg"),image.EncodeToJPG(92));}
    report.Append(",\""+mode+"Frames\":"+frames);
   }
   Time.captureFramerate=0;Destroy(image);Shader.SetGlobalFloat("_A2RWindOff",0);report.Append(",\"fps\":30,\"width\":"+Screen.width+",\"height\":"+Screen.height+"}");
   File.WriteAllText(Path.Combine(a2rPlayOutput,"d4-report.json"),report.ToString());
   Simulation.Enemies.Clear();Simulation.Config.EnemyAiEnabled=ai;
  }
 }
}
