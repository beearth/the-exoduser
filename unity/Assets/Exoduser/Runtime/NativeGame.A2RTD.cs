using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  // Track D proof: two 3840 field shots (bridge north, camp) with distant enemies, then a 10 s wind frame run at 1920. Run once with and once without --a2r-terrain-off.
  IEnumerator A2RTDProof(){
   bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;yield return A2RNatureSize(1920);A2RSetLook(true);a2rModels.SetLook(true);a2rModels.SetClean(true);a2rLighting.ApplyClean(true);
   yield return A2RNatureSize(3840);
   var names=new[]{"bridge-north","camp"};var poses=new[]{new Vector2(4320,6700),new Vector2(2450,4800)};
   for(int s=0;s<poses.Length;s++){yield return R18Pose(poses[s]);var p=new Vector2(Simulation.Player.X,Simulation.Player.Y);R19Spawn(p,6);for(int n=0;n<20;n++){UpdateViews();yield return null;}yield return A2RPlayShot("td-"+names[s]+"-3840");Simulation.Enemies.Clear();}
   yield return A2RNatureSize(1920);yield return R18Pose(poses[0]);R19Spawn(new Vector2(Simulation.Player.X,Simulation.Player.Y),6);for(int n=0;n<12;n++){UpdateViews();yield return null;}
   float t0=Time.realtimeSinceStartup;int frames=0;while(Time.realtimeSinceStartup-t0<10f){yield return A2RPlayShot("td-wind-"+frames.ToString("000"));frames++;}
   File.WriteAllText(Path.Combine(a2rPlayOutput,"td-report.json"),"{\"windFrames\":"+frames+",\"seconds\":"+(Time.realtimeSinceStartup-t0).ToString("F2",System.Globalization.CultureInfo.InvariantCulture)+",\"terrainDetails\":"+a2rModels.TerrainDetails+",\"plantsKept\":"+a2rModels.PlantsKept+"}");
   Simulation.Enemies.Clear();Simulation.Config.EnemyAiEnabled=ai;
  }
 }
}
