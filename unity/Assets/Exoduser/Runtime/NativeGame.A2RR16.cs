using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  IEnumerator A2RR16Proof(){
   yield return A2RR15Sheet(); // same stored r15 stage, before supplementary map poses
   yield return A2RNatureSize(1920);bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;
   var receipt=new NightReceipt{mainSha="r16 same-build 3D off vs PASS11 allowlist"};var failures=new List<string>();
   var points=new[]{new Vector2(Map.Data.startX,Map.Data.startY),new Vector2(4320,7180),new Vector2(4320,7460),new Vector2(2200,4400),new Vector2(3640,7420)};
   var names=new[]{"start","bridge","swamps","distant-enemies","foreground"};
   for(int s=0;s<points.Length;s++){
    A2RSetLook(true);var p=WideLegal(points[s].x,points[s].y);Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;receipt.fixedPoseAssignments++;a2rPlay.visualPoseAssignments++;Simulation.Enemies.Clear();
    for(int i=0;i<12;i++){UpdateViews();yield return null;}int spawned=0;
    for(int n=0;n<180&&spawned<6;n++){float a=n*2.399963f;var at=p+new Vector2(Mathf.Cos(a)*(450+n%4*160),-850-Mathf.Abs(Mathf.Sin(a))*450);if(!Map.CanMove(at.x,at.y,25))continue;var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(at.x,at.y)+Vector3.up*.8f);if(v.z<=0||v.x<.1f||v.x>.9f||v.y<.5f||v.y>.92f)continue;if(Simulation.SpawnEnemy(at.x,at.y,n%4,null,false)!=null)spawned++;}
    Vector3 eye=Vector3.zero;float fov=0;
    for(int look=0;look<2;look++){
     a2rModels.SetLook(look==1);for(int n=0;n<12;n++){UpdateViews();yield return null;}
     string id="r16-"+names[s]+"-1920-"+look;yield return A2RPlayShot(id);int visible=0,far=0;
     foreach(var e in Simulation.Enemies)if(e.Alive){var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1){visible++;if(Vector2.Distance(p,new Vector2(e.X,e.Y))>=800)far++;}}
     if(look==0){eye=r3Cam.transform.position;fov=r3Cam.fieldOfView;}bool same=Vector3.Distance(eye,r3Cam.transform.position)<.001f&&Mathf.Abs(fov-r3Cam.fieldOfView)<.001f;
     receipt.frames.Add(new NightFrame{id=id,look=look==0?"A2R 3D off":"A2R PASS11 3D",core=p,eye=r3Cam.transform.position,pitch=r3Cam.transform.eulerAngles.x,fov=r3Cam.fieldOfView,width=Screen.width,height=Screen.height,visibleEnemies=visible,distantEnemies=far,cameraUnchanged=same});if(!same||Mathf.Abs(r3Cam.transform.eulerAngles.x-34)>.05f)failures.Add(id+": camera changed");if(s==3&&far<3)failures.Add(id+": fewer than three distant enemies");
    }
   }
   receipt.failures=failures.ToArray();receipt.passed=failures.Count==0&&receipt.frames.Count==10;File.WriteAllText(Path.Combine(a2rPlayOutput,"r16-scenes.json"),JsonUtility.ToJson(receipt,true));foreach(var f in failures)a2rPlay.failures.Add(f);
   sight=new SightReceipt();a2rModels.SetLook(true);yield return A2RSightFind(new Vector2(1300,3820),"m_ctree15");if(!sightFound)sight.failures.Add("No legal sight-1 point");else{yield return A2RSightWalk(sightPoint);foreach(bool on in new[]{false,true}){a2rOcclusion.SetMasksEnabled(on);yield return new WaitForSecondsRealtime(.36f);string id="r16-sight-1-1920-"+(on?"on":"off");yield return A2RPlayShot(id);sight.shots.Add(new SightShot{id=id,occluder="m_ctree15",core=new Vector2(Simulation.Player.X,Simulation.Player.Y),width=1920,on=on,heroSurfaces=a2rOcclusion.HeroSightSurfaces,partialHeroSurfaces=a2rOcclusion.HeroPartialSurfaces,gpuPixels=on?a2rOcclusion.NearestCoveredPixels():0,surfaces=new List<string>(a2rOcclusion.HitNames)});if(on&&(a2rOcclusion.HeroSightSurfaces==0||a2rOcclusion.NearestCoveredPixels()==0))sight.failures.Add("Sight-1 not exercised");}}
   a2rOcclusion.SetMasksEnabled(true);sight.passed=sight.failures.Count==0&&sight.shots.Count==2;foreach(var f in sight.failures)a2rPlay.failures.Add(f);a2rPlay.sightVerified=sight.passed;File.WriteAllText(Path.Combine(a2rPlayOutput,"r16-sight1.json"),JsonUtility.ToJson(sight,true));Simulation.Config.EnemyAiEnabled=ai;
   a2rPlay.visualFixture="r16: ordinary lobby/Core camp walk; exact r15 isolated PASS11 pair stage; then five labeled legal fixed map poses/seeded enemies and Core walk to sight1. No sight algorithm or Core rule changes.";
  }
 }
}
