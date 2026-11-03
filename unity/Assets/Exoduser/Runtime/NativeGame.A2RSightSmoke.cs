using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class SightShot {public string id,occluder;public Vector2 core;public int width,heroSurfaces,projectileSurfaces,gpuPixels;public bool on;public List<string> surfaces;}
  [Serializable] sealed class SightReceipt {public string scope="Ordinary lobby/Core camp route, then accelerated original Core walking to real occluders. No player coordinate assignment. Enemy projectile is an explicitly seeded Core projectile fixture. 10s video uses real-time 60Hz Core walking.";public bool passed,noTeleport=true;public int walkTicks,walkBlocked;public List<SightShot> shots=new List<SightShot>();public List<float> times=new List<float>();public List<string> failures=new List<string>();}
  SightReceipt sight;Vector2 sightPoint;bool sightFound;
  IEnumerator A2RSightFind(Vector2 anchor,string filter)
  {
   sightFound=false;var now=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y);var offset=r3Cam.transform.position-now;var center=a2rLighting.Readability.HeroBounds.center-now;int count=0;
   for(int radius=0;radius<=18;radius++)for(int dy=-radius;dy<=radius;dy++)for(int dx=-radius;dx<=radius;dx++){
    if(Mathf.Max(Mathf.Abs(dx),Mathf.Abs(dy))!=radius)continue;var p=anchor+new Vector2(dx,dy)*40;if(!FullRunCanMove(p.x,p.y,Simulation.Player.Radius+5))continue;var ground=NativeRemodel3D.Point(p.x,p.y);var eye=ground+offset;var target=ground+center;string name;
    if(a2rOcclusion.IsSightBlockedFrom(eye,target,out name,filter)&&a2rOcclusion.IsSightBlockedFrom(eye,target+r3Cam.transform.right*.12f,out name,filter)&&a2rOcclusion.IsSightBlockedFrom(eye,target-r3Cam.transform.right*.12f,out name,filter)){if(A2RSightPath(new Vector2(Simulation.Player.X,Simulation.Player.Y),p).Count==0)continue;sightPoint=p;sightFound=true;yield break;}if(++count%32==0)yield return null;
   }
  }
  List<Vector2> A2RSightPath(Vector2 start,Vector2 goal){const int size=200;var previous=new int[size*size];for(int i=0;i<previous.Length;i++)previous[i]=-2;int source=Mathf.Clamp((int)(start.y/40),0,199)*size+Mathf.Clamp((int)(start.x/40),0,199),target=Mathf.Clamp((int)(goal.y/40),0,199)*size+Mathf.Clamp((int)(goal.x/40),0,199);var queue=new Queue<int>();queue.Enqueue(source);previous[source]=-1;float radius=Simulation.Player.Radius;while(queue.Count>0){int index=queue.Dequeue();if(index==target)break;int x=index%size,y=index/size;foreach(var dir in new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left}){int xx=x+dir.x,yy=y+dir.y;if(xx<0||yy<0||xx>=size||yy>=size)continue;int next=yy*size+xx;if(previous[next]!=-2||!FullRunCanMove(xx*40+20,yy*40+20,radius+6))continue;bool clear=true;for(int k=1;k<4;k++)if(!FullRunCanMove(x*40+20+dir.x*k*10,y*40+20+dir.y*k*10,radius+6))clear=false;if(!clear)continue;previous[next]=index;queue.Enqueue(next);}}var result=new List<Vector2>();if(previous[target]==-2)return result;for(int n=target;n>=0;n=previous[n])result.Add(new Vector2(n%size*40+20,n/size*40+20));result.Reverse();result.Add(goal);return result;}
  IEnumerator A2RSightWalk(Vector2 goal)
  {
   var route=A2RSightPath(new Vector2(Simulation.Player.X,Simulation.Player.Y),goal);if(route.Count==0){sight.failures.Add("Core route unavailable:"+goal);yield break;}int at=0,stall=0;float deadline=Time.realtimeSinceStartup+50;
   while(at<route.Count&&Time.realtimeSinceStartup<deadline){for(int n=0;n<40&&at<route.Count;n++){var p=Simulation.Player;var before=new Vector2(p.X,p.Y);if(Vector2.Distance(before,route[at])<5){at++;continue;}var move=(route[at]-before).normalized;p.Iframes=600;StepInput(move.x,move.y,route[at].x,route[at].y,false,false);sight.walkTicks++;if(Vector2.Distance(before,new Vector2(p.X,p.Y))<.01f){sight.walkBlocked++;if(++stall>120){sight.failures.Add("Sight Core route stalled state="+p.State+" pass="+FullRunCanMove(route[at].x,route[at].y,p.Radius)+" target="+route[at]);yield break;}}else stall=0;}UpdateViews();yield return null;}
   if(Vector2.Distance(new Vector2(Simulation.Player.X,Simulation.Player.Y),goal)>12)sight.failures.Add("Sight route did not arrive:"+goal);for(int i=0;i<18;i++){UpdateViews();yield return null;}
  }
  IEnumerator A2RSightPair(string id,string occluder,bool projectile=false)
  {
   foreach(int width in new[]{1920,3840}){yield return A2RNatureSize(width);foreach(bool on in new[]{false,true}){a2rOcclusion.SetMasksEnabled(on);yield return new WaitForSecondsRealtime(.36f);string name=id+"-"+width+"-"+(on?"on":"off");yield return A2RPlayShot(name);var shot=new SightShot{id=name,occluder=occluder,core=new Vector2(Simulation.Player.X,Simulation.Player.Y),width=width,on=on,heroSurfaces=a2rOcclusion.HeroSightSurfaces,projectileSurfaces=a2rOcclusion.ProjectileSightSurfaces,gpuPixels=on?a2rOcclusion.NearestCoveredPixels():0,surfaces=new List<string>(a2rOcclusion.HitNames)};sight.shots.Add(shot);if(on&&(shot.heroSurfaces==0||shot.gpuPixels==0))sight.failures.Add("Real tree hero occlusion not exercised:"+name);if(on&&projectile&&shot.projectileSurfaces==0)sight.failures.Add("Enemy projectile occlusion not exercised:"+name);}}
   a2rOcclusion.SetMasksEnabled(true);
  }
  IEnumerator A2RSightSmoke()
  {
   sight=new SightReceipt();bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;
   var anchors=new[]{new Vector2(1300,3820),new Vector2(4900,6300),new Vector2(1500,4300)};var filters=new[]{"m_ctree15","Hollow","外곽 -1"};
   for(int i=0;i<3;i++){
    yield return A2RNatureSize(1920);yield return A2RSightFind(anchors[i],filters[i]);if(!sightFound){sight.failures.Add("No legal real-tree sight point:"+(i+1));continue;}yield return A2RSightWalk(sightPoint);yield return new WaitForSecondsRealtime(.3f);yield return A2RSightPair("sight-"+(i+1),filters[i]);
    if(i==1&&Simulation.Druid!=null){Vector2 bolt=new Vector2(Simulation.Player.X,Simulation.Player.Y);bool found=false;for(int n=0;n<64&&!found;n++){float a=n*2.39996f;var p=bolt+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*(25+n*2);string name;if(Map.CanMove(p.x,p.y,0)&&a2rOcclusion.IsSightBlockedFrom(r3Cam.transform.position,NativeRemodel3D.Point(p.x,p.y)+Vector3.up*.35f,out name)){bolt=p;found=true;}}if(found){Simulation.Druid.SpawnProjectile(null,null,new ProjSpec{X=bolt.x,Y=bolt.y,Vx=.5,Vy=0,Dmg=0,Life=600,Ml=600,R=5,Sz=4,Col="#e6b48c",El=0,ParryClass="physical",Commit=true},false);for(int j=0;j<8;j++){UpdateViews();yield return null;}yield return A2RSightPair("sight-enemy-projectile","Core enemy projectile fixture",true);}else sight.failures.Add("No projectile sight point");}
    File.WriteAllText(Path.Combine(a2rPlayOutput,"sight-smoke.json"),JsonUtility.ToJson(sight,true));
   }
   yield return A2RSightVideo();Simulation.Config.EnemyAiEnabled=ai;sight.passed=sight.failures.Count==0&&sight.shots.Count>=16;a2rPlay.sightVerified=sight.passed;foreach(var f in sight.failures)a2rPlay.failures.Add(f);File.WriteAllText(Path.Combine(a2rPlayOutput,"sight-smoke.json"),JsonUtility.ToJson(sight,true));
  }
  IEnumerator A2RSightVideo()
  {
   yield return A2RNatureSize(1920);var now=new Vector2(Simulation.Player.X,Simulation.Player.Y);var start=WideLegal(now.x,now.y+400);var end=WideLegal(now.x,now.y-700);yield return A2RSightWalk(start);var route=A2RWalkPath(new Vector2(Simulation.Player.X,Simulation.Player.Y),end);if(route.Count==0){sight.failures.Add("Northbound video route unavailable");yield break;}int at=0,frame=0;string dir=Path.Combine(a2rPlayOutput,"motion-sight");Directory.CreateDirectory(dir);foreach(var p in Directory.GetFiles(dir,"frame-*.jpg"))File.Delete(p);var image=new Texture2D(1920,1080,TextureFormat.RGB24,false);float began=Time.realtimeSinceStartup,next=began,nextFrame=began;
   try{while(Time.realtimeSinceStartup-began<10){float time=Time.realtimeSinceStartup;int count=0;while(next<=time&&count++<8){var p=Simulation.Player;var point=new Vector2(p.X,p.Y);while(at<route.Count&&Vector2.Distance(point,route[at])<5)at++;var move=at<route.Count?(route[at]-point).normalized:Vector2.zero;p.Iframes=600;StepInput(move.x,move.y,point.x,point.y-100,false,false);next+=1/60f;}UpdateViews();if(time>=nextFrame){yield return new WaitForEndOfFrame();image.ReadPixels(new Rect(0,0,1920,1080),0,0);image.Apply();File.WriteAllBytes(Path.Combine(dir,"frame-"+(frame++).ToString("D4")+".jpg"),image.EncodeToJPG(90));sight.times.Add(Time.realtimeSinceStartup-began);nextFrame+=.1f;}yield return null;}}finally{Destroy(image);}if(frame<60)sight.failures.Add("Sight video incomplete");
  }
 }
}
