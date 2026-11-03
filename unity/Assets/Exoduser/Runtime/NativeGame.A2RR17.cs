using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class R17Kind {public string kind;public int standing,floor;public List<string> ids=new List<string>();}
  [Serializable] sealed class R17ForestFrame {public string id;public Vector2 core;public Vector3 eye;public float pitch,fov;public int farRenderers,inFrustum,distantEnemies,blockedSamples,totalSamples;}
  [Serializable] sealed class R17Report {public string scope="r17 same-package camp reflection toggle and 3D-off pair; far forest original XY, 34deg paired views; exact mesh rays at five enemy-body samples; standing cards count active original roots excluding terrain projections. Isolated baked/far sheet is separately labeled. Not human or balance QA.";public int materials,keywordFailures,standing,floor;public List<R17Kind> cards=new List<R17Kind>();public List<R17ForestFrame> forest=new List<R17ForestFrame>();}
  void R17Reflection(bool disabled){var seen=new HashSet<Material>();foreach(var r in a2rModels.VisualRoot.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in r.sharedMaterials){if(m==null||!m.shader.name.Contains("/Lit")||!seen.Add(m))continue;foreach(var key in new[]{"_SPECULARHIGHLIGHTS_OFF","_ENVIRONMENTREFLECTIONS_OFF"}){if(disabled)m.EnableKeyword(key);else m.DisableKeyword(key);}}}
  IEnumerator A2RR17Proof(){
   var report=new R17Report();yield return A2RNatureSize(1920);A2RSetLook(true);a2rModels.SetLook(true);
   bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;
   // Camp arrived by ordinary StepInput before this coroutine. Freeze Core within each visual pair.
   R17Reflection(false);for(int i=0;i<8;i++)yield return null;yield return R15Save("r17-camp-reflections-on");
   R17Reflection(true);for(int i=0;i<8;i++)yield return null;yield return R15Save("r17-camp-reflections-off");
   a2rModels.SetLook(false);for(int i=0;i<8;i++)yield return null;yield return R15Save("r17-camp-painting");
   a2rModels.SetLook(true);for(int i=0;i<8;i++)yield return null;yield return R15Save("r17-camp-model");
   var materials=new HashSet<Material>();foreach(var r in a2rModels.VisualRoot.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in r.sharedMaterials)if(m!=null&&m.shader.name.Contains("/Lit")&&materials.Add(m)){report.materials++;if(!m.IsKeywordEnabled("_SPECULARHIGHLIGHTS_OFF")||!m.IsKeywordEnabled("_ENVIRONMENTREFLECTIONS_OFF"))report.keywordFailures++;}
   foreach(var item in a2rWeb.Result.items){if(!item.added)continue;var card=a2rWeb.VisualRoot.Find(item.id+" "+item.kind+" web XY");if(card==null||!card.gameObject.activeInHierarchy)continue;var row=report.cards.Find(x=>x.kind==item.kind);if(row==null){row=new R17Kind{kind=item.kind};report.cards.Add(row);}row.ids.Add(item.id);if(item.groundProjected){row.floor++;report.floor++;}else{row.standing++;report.standing++;}}
   foreach(var pose in new[]{new Vector2(2050,4400),new Vector2(2200,4400),new Vector2(4320,7180)}){
    var p=WideLegal(pose.x,pose.y);Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;a2rPlay.visualPoseAssignments++;Simulation.Enemies.Clear();for(int i=0;i<12;i++){UpdateViews();yield return null;}
    int spawned=0;for(int n=0;n<180&&spawned<6;n++){float a=n*2.399963f;var at=p+new Vector2(Mathf.Cos(a)*(450+n%4*160),-850-Mathf.Abs(Mathf.Sin(a))*450);if(!Map.CanMove(at.x,at.y,25))continue;var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(at.x,at.y)+Vector3.up*.8f);if(v.z<=0||v.x<.1f||v.x>.9f||v.y<.5f||v.y>.92f)continue;if(Simulation.SpawnEnemy(at.x,at.y,n%4,null,false)!=null)spawned++;}
    for(int look=0;look<2;look++){
     a2rModels.SetForestLook(look==1);for(int i=0;i<12;i++){UpdateViews();yield return null;}var row=new R17ForestFrame{id="r17-forest-"+report.forest.Count,core=p,eye=r3Cam.transform.position,pitch=r3Cam.transform.eulerAngles.x,fov=r3Cam.fieldOfView};
     var far=new List<MeshRenderer>();var planes=GeometryUtility.CalculateFrustumPlanes(r3Cam);foreach(var r in a2rModels.VisualRoot.GetComponentsInChildren<MeshRenderer>(false))if(r.enabled&&R14Path(r.transform).Contains(" forest ")&&!r.name.Contains("portion")){row.farRenderers++;if(GeometryUtility.TestPlanesAABB(planes,r.bounds))row.inFrustum++;far.Add(r);}
     var query=new A2RSightQuery();try{foreach(var e in Simulation.Enemies){var center=NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f;var v=r3Cam.WorldToViewportPoint(center);if(!e.Alive||v.z<=0||v.x<=0||v.x>=1||v.y<=0||v.y>=1||Vector2.Distance(p,new Vector2(e.X,e.Y))<800)continue;row.distantEnemies++;foreach(var offset in new[]{Vector3.zero,Vector3.up*.4f,Vector3.down*.35f,Vector3.right*.2f,Vector3.left*.2f}){row.totalSamples++;foreach(var r in far){Vector3 hit;if(query.Hit(r,row.eye,center+offset,out hit)){row.blockedSamples++;break;}}}}}finally{query.Dispose();}
     yield return R15Save(row.id);report.forest.Add(row);if(row.blockedSamples>0||row.distantEnemies<3||Mathf.Abs(row.pitch-34)>.05f||look==1&&row.inFrustum==0)a2rPlay.failures.Add(row.id+": far forest/visibility failed");
    }
   }
   a2rModels.SetForestLook(true);File.WriteAllText(Path.Combine(a2rPlayOutput,"r17-report.json"),JsonUtility.ToJson(report,true));if(report.keywordFailures>0)a2rPlay.failures.Add("R17 model reflection keywords lost");
   yield return A2RR15Sheet();Simulation.Config.EnemyAiEnabled=ai;a2rPlay.visualFixture=report.scope;
  }
 }
}
