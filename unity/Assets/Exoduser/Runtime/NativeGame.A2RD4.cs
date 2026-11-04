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
  // D4 wind measurement: fixed 30 fps game time (Time.captureFramerate), 3840x1080 1x JPG frames, wind ON then OFF at the same pose, no enemies.
  IEnumerator A2RD4Proof(){
   bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;yield return A2RNatureSize(1920);A2RSetLook(true);a2rModels.SetLook(true);a2rModels.SetClean(true);a2rLighting.ApplyClean(true);
   yield return A2RNatureSize(3840);
   var names=new[]{"bridge-north","camp"};var poses=new[]{new Vector2(4320,6700),new Vector2(2450,4800)};
   for(int s=0;s<poses.Length;s++){yield return R18Pose(poses[s]);var p=new Vector2(Simulation.Player.X,Simulation.Player.Y);R19Spawn(p,6);for(int n=0;n<20;n++){UpdateViews();yield return null;}yield return A2RPlayShot("d4-"+names[s]+"-3840");Simulation.Enemies.Clear();}
   // wind sequences at the bridge-north pose
   yield return R18Pose(poses[0]);for(int n=0;n<20;n++){UpdateViews();yield return null;}
   var report=new StringBuilder();report.Append("{\"diag\":\""+a2rModels.WindDiagnostics().Replace("\"","'")+"\"");
   const int frames=300;Time.captureFramerate=30;var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);
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
