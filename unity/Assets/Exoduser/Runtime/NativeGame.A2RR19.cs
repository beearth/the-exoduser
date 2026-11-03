using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class R19Fg {public string model,card,paintingShot,modelShot;public Vector2 screen,core;public float height,scale;public bool inFrame;}
  [Serializable] sealed class R19Far {public string card,paintingShot,testShot,method="near-tree source LOD1 (25 percent triangles), flat forest-wall average tint, shadows off, original XY layout";public Color tint;public int models,distantEnemies,blockedSamples,totalSamples,inFrustum;public Vector4 rect;public Vector2 core;public Vector3 eye;public float pitch,fov;}
  [Serializable] sealed class R19Report {public string scope="r19: near trees enabled (fg_rot01 baked, fg_rot03 original, ctree13/14/17 baked, ctree16 original, sbone, sword_pile) with r16 silhouette scale; far allowlist stays empty; far LOD1 tint is an isolated one-spot test. Same camera 34deg 1x pairs. Not human or balance QA.";public List<R19Fg> foreground=new List<R19Fg>();public R19Far far=new R19Far();public int nearAllowed,plantsTotal,plantsKept,windFrames;public float windSeconds,treeWindX,plantWindX;public List<string> cleanShots=new List<string>();public List<int> cleanDistantEnemies=new List<int>();public List<string> failures=new List<string>();}
  int R19Spawn(Vector2 p,int want){int spawned=0;for(int n=0;n<180&&spawned<want;n++){float a=n*2.399963f;var at=p+new Vector2(Mathf.Cos(a)*(450+n%4*160),-850-Mathf.Abs(Mathf.Sin(a))*450);if(!Map.CanMove(at.x,at.y,25))continue;var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(at.x,at.y)+Vector3.up*.8f);if(v.z<=0||v.x<.1f||v.x>.9f||v.y<.5f||v.y>.92f)continue;if(Simulation.SpawnEnemy(at.x,at.y,n%4,null,false)!=null)spawned++;}return spawned;}
  static Color R19AverageColor(Texture texture){if(texture==null)return new Color(.16f,.2f,.15f,1);var rt=RenderTexture.GetTemporary(16,16,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB);var previous=RenderTexture.active;try{Graphics.Blit(texture,rt);RenderTexture.active=rt;var image=new Texture2D(16,16,TextureFormat.RGBA32,false);image.ReadPixels(new Rect(0,0,16,16),0,0);image.Apply();var px=image.GetPixels();Destroy(image);float r=0,g=0,b=0,w=0;foreach(var c in px){r+=c.r*c.a;g+=c.g*c.a;b+=c.b*c.a;w+=c.a;}if(w<=0)return new Color(.16f,.2f,.15f,1);return new Color(r/w,g/w,b/w,1);}finally{RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);}}
  static Rect R19ScreenRect(Camera camera,Bounds b){float x0=float.MaxValue,y0=float.MaxValue,x1=float.MinValue,y1=float.MinValue;for(int corner=0;corner<8;corner++){var v=camera.WorldToScreenPoint(b.center+Vector3.Scale(b.extents,new Vector3((corner&1)==0?-1:1,(corner&2)==0?-1:1,(corner&4)==0?-1:1)));x0=Mathf.Min(x0,v.x);x1=Mathf.Max(x1,v.x);y0=Mathf.Min(y0,v.y);y1=Mathf.Max(y1,v.y);}return Rect.MinMaxRect(x0,Screen.height-y1,x1,Screen.height-y0);}
  IEnumerator A2RR19Proof(){
   var report=new R19Report();bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;yield return A2RNatureSize(1920);A2RSetLook(true);a2rModels.SetLook(true);
   foreach(var item in a2rModels.Result.items)if(item.kind!="vegetation"&&item.kind!="forest_wall")report.nearAllowed++;
   // 1. Foreground trees: hero behind the tree so it crosses the front of the screen; same camera, painting | 3D.
   foreach(var model in new[]{"fg_rot01","fg_rot03"}){
    A2RProps3D.Placement chosen=null;Vector2 chosenPose=Vector2.zero;float bestOff=float.MaxValue;int tries=0;
    foreach(var item in a2rModels.Result.items){
     if(item.kind!="foreground_tree"||item.model!=model)continue;
     foreach(float off in new[]{-300f,-520f}){
      if(tries++>=24)break;yield return R18Pose(new Vector2(item.webX,item.webY+off));
      var v=r3Cam.WorldToScreenPoint(new Vector3(item.worldX,item.groundY+item.height*.5f,item.worldZ));float miss=v.z<=0?float.MaxValue:Mathf.Abs(v.x-960)+Mathf.Abs(v.y-540)*.5f;
      if(miss<bestOff){bestOff=miss;chosen=item;chosenPose=new Vector2(Simulation.Player.X,Simulation.Player.Y);}
      if(miss<420)break;
     }
     if(bestOff<420)break;
    }
    if(chosen==null){report.failures.Add("No placed foreground tree for "+model);continue;}
    yield return R18Pose(chosenPose);var sv=r3Cam.WorldToScreenPoint(new Vector3(chosen.worldX,chosen.groundY+chosen.height*.5f,chosen.worldZ));
    var row=new R19Fg{model=model,card=chosen.id,screen=new Vector2(sv.x,Screen.height-sv.y),core=new Vector2(Simulation.Player.X,Simulation.Player.Y),height=chosen.height,inFrame=sv.z>0&&sv.x>0&&sv.x<Screen.width&&sv.y>0&&sv.y<Screen.height};
    for(int look=0;look<2;look++){a2rModels.SetLook(look==1);for(int n=0;n<12;n++){UpdateViews();yield return null;}string id="r19-fg-"+model+"-1920-"+look;yield return A2RPlayShot(id);if(look==0)row.paintingShot=id;else row.modelShot=id;}
    a2rModels.SetLook(true);if(!row.inFrame)report.failures.Add("Foreground tree off screen "+model);report.foreground.Add(row);
   }
   // 2. One far forest-wall test: LOD1 silhouette with wall tint against the original wall painting.
   {
    var source=JsonUtility.FromJson<R15Source>(Resources.Load<TextAsset>("A2R/web-assets").text);
    yield return R18Pose(new Vector2(2200,4400));var p=new Vector2(Simulation.Player.X,Simulation.Player.Y);int spawned=R19Spawn(p,6);
    A2RWebAssets.Card chosenCard=null;Transform chosenRoot=null;float bestArea=0;Rect bestRect=Rect.zero;
    foreach(var item in a2rWeb.Result.items){if(!item.added||item.kind!="forest_wall")continue;var root=a2rWeb.VisualRoot.Find(item.id+" forest_wall web XY");if(root==null)continue;var rend=root.GetComponentInChildren<Renderer>();if(rend==null)continue;var rect=R19ScreenRect(r3Cam,rend.bounds);var clipped=Rect.MinMaxRect(Mathf.Max(0,rect.xMin),Mathf.Max(0,rect.yMin),Mathf.Min(Screen.width,rect.xMax),Mathf.Min(Screen.height,rect.yMax));float area=clipped.width>0&&clipped.height>0?clipped.width*clipped.height:0;if(area>bestArea){bestArea=area;chosenCard=Array.Find(source.cards,c=>c.id==item.id);chosenRoot=root;bestRect=clipped;}}
    if(chosenCard==null){report.failures.Add("No visible forest wall for far LOD1 test");}
    else{
     var far=report.far;far.card=chosenCard.id;far.rect=new Vector4(bestRect.xMin,bestRect.yMin,bestRect.width,bestRect.height);far.core=p;var rr=chosenRoot.GetComponentInChildren<Renderer>();Texture tex=null;var mat=rr.sharedMaterial;if(mat!=null){foreach(var prop in new[]{"_BaseMap","_MainTex"})if(tex==null&&mat.HasProperty(prop))tex=mat.GetTexture(prop);}far.tint=R19AverageColor(tex);
     var made=a2rModels.ForestLod1Test(chosenCard,far.tint);far.models=made.Count;foreach(var m in made)m.SetActive(false);
     for(int test=0;test<2;test++){
      foreach(var m in made)m.SetActive(test==1);chosenRoot.gameObject.SetActive(test==0);for(int n=0;n<14;n++){UpdateViews();yield return null;}
      string id="r19-far-"+(test==0?"painting":"lod1")+"-1920";yield return A2RPlayShot(id);if(test==0)far.paintingShot=id;else far.testShot=id;
      if(test==1){far.eye=r3Cam.transform.position;far.pitch=r3Cam.transform.eulerAngles.x;far.fov=r3Cam.fieldOfView;var rends=new List<MeshRenderer>();var planes=GeometryUtility.CalculateFrustumPlanes(r3Cam);foreach(var m in made)foreach(var r in m.GetComponentsInChildren<MeshRenderer>(false))if(r.enabled&&!r.name.Contains("portion")){rends.Add(r);if(GeometryUtility.TestPlanesAABB(planes,r.bounds))far.inFrustum++;}
       var query=new A2RSightQuery();try{foreach(var e in Simulation.Enemies){var center=NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f;var v=r3Cam.WorldToViewportPoint(center);if(!e.Alive||v.z<=0||v.x<=0||v.x>=1||v.y<=0||v.y>=1)continue;far.distantEnemies++;foreach(var offset in new[]{Vector3.zero,Vector3.up*.4f,Vector3.down*.35f,Vector3.right*.2f,Vector3.left*.2f}){far.totalSamples++;foreach(var r in rends){Vector3 hit;if(query.Hit(r,far.eye,center+offset,out hit)){far.blockedSamples++;break;}}}}}finally{query.Dispose();}
      }
     }
     chosenRoot.gameObject.SetActive(true);foreach(var m in made)Destroy(m);
     if(far.blockedSamples>0)report.failures.Add("Far LOD1 test blocks enemy samples "+far.blockedSamples+"/"+far.totalSamples);
    }
    Simulation.Enemies.Clear();
   }
   // 3. Sight-2: foreground tree hole OFF | ON, hero behind the registered 3D model.
   sight=new SightReceipt();a2rModels.SetLook(true);yield return A2RSightFind(new Vector2(1961,5800),"foreground_tree");
   if(!sightFound)sight.failures.Add("No legal foreground sight point");else{yield return A2RSightWalk(sightPoint);foreach(bool on in new[]{false,true}){a2rOcclusion.SetMasksEnabled(on);yield return new WaitForSecondsRealtime(.36f);string id="r19-sight-2-1920-"+(on?"on":"off");yield return A2RPlayShot(id);sight.shots.Add(new SightShot{id=id,occluder="foreground_tree",core=new Vector2(Simulation.Player.X,Simulation.Player.Y),width=1920,on=on,heroSurfaces=a2rOcclusion.HeroSightSurfaces,partialHeroSurfaces=a2rOcclusion.HeroPartialSurfaces,gpuPixels=on?a2rOcclusion.NearestCoveredPixels():0,surfaces=new List<string>(a2rOcclusion.HitNames)});if(on&&(a2rOcclusion.HeroSightSurfaces==0||a2rOcclusion.NearestCoveredPixels()==0))sight.failures.Add("Foreground sight not exercised");}}
   a2rOcclusion.SetMasksEnabled(true);sight.passed=sight.failures.Count==0&&sight.shots.Count==2;File.WriteAllText(Path.Combine(a2rPlayOutput,"r19-sight2.json"),JsonUtility.ToJson(sight,true));foreach(var f in sight.failures)report.failures.Add(f);
   // 4. Screen cleanup: 3840x1080 1x before (r18 values) | after, hero centred, far enemies kept.
   report.plantsTotal=a2rModels.PlantsTotal;report.plantsKept=a2rModels.PlantsKept;
   yield return A2RNatureSize(3840);
   {var names=new[]{"bridge-north","camp-southeast"};var poses=new[]{new Vector2(4320,6700),new Vector2(2450,4800)};
    for(int s2=0;s2<poses.Length;s2++){yield return R18Pose(poses[s2]);var p2=new Vector2(Simulation.Player.X,Simulation.Player.Y);R19Spawn(p2,6);
     for(int mode=0;mode<2;mode++){bool on=mode==1;a2rModels.SetClean(on);a2rLighting.ApplyClean(on);for(int n=0;n<16;n++){UpdateViews();yield return null;}
      string id="r19-clean-"+names[s2]+"-3840-"+mode;yield return A2RPlayShot(id);report.cleanShots.Add(id);int far=0;foreach(var e in Simulation.Enemies)if(e.Alive){var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1&&Vector2.Distance(p2,new Vector2(e.X,e.Y))>=800)far++;}report.cleanDistantEnemies.Add(far);}
     Simulation.Enemies.Clear();}
    a2rModels.SetClean(true);a2rLighting.ApplyClean(true);}
   yield return A2RNatureSize(1920);
   // 5. Ten-second wind clip (frames encoded outside), plant and tree wind amplitude.
   foreach(var item in a2rModels.Result.items){if(item.kind=="m_ctree15"){var tr=a2rModels.VisualRoot.Find(item.id+" "+item.kind+" "+item.model);if(tr!=null){foreach(var r in tr.GetComponentsInChildren<MeshRenderer>(true)){var m=r.sharedMaterial;if(m!=null&&m.HasProperty("_A2R3DWind")){report.treeWindX=m.GetVector("_A2R3DWind").x;break;}}}}if(item.kind=="vegetation"&&report.plantWindX==0){var pr=a2rModels.VisualRoot.Find(item.id+" "+item.kind+" "+item.model);if(pr!=null){foreach(var r in pr.GetComponentsInChildren<MeshRenderer>(true)){var m=r.sharedMaterial;if(m!=null&&m.HasProperty("_A2R3DWind")){report.plantWindX=m.GetVector("_A2R3DWind").x;break;}}}}}
   {A2RProps3D.Placement wp=null;foreach(var item in a2rModels.Result.items){if(item.kind!="vegetation")continue;var root=a2rModels.VisualRoot.Find(item.id+" "+item.kind+" "+item.model);if(root!=null&&root.gameObject.activeSelf){wp=item;break;}}
    if(wp==null)report.failures.Add("No kept plant for wind clip");else{yield return R18Pose(new Vector2(wp.webX,wp.webY+300));for(int n=0;n<12;n++){UpdateViews();yield return null;}float t0=Time.realtimeSinceStartup;int frames=0;while(Time.realtimeSinceStartup-t0<10f){yield return A2RPlayShot("r19-wind-"+frames.ToString("000"));frames++;}report.windFrames=frames;report.windSeconds=Time.realtimeSinceStartup-t0;}}
   Simulation.Config.EnemyAiEnabled=ai;foreach(var f in report.failures)a2rPlay.failures.Add(f);File.WriteAllText(Path.Combine(a2rPlayOutput,"r19-report.json"),JsonUtility.ToJson(report,true));
  }
 }
}
