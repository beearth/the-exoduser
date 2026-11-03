using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(30000)] public sealed class A2RR15CameraLock:MonoBehaviour
    {
        public Vector3 position;public Quaternion rotation;
        void LateUpdate(){transform.SetPositionAndRotation(position,rotation);}
    }
    public sealed partial class NativeGame
    {
        [Serializable] sealed class R15Model {public string name,resource,source;public bool prepared;public int lods,triangles;}
        [Serializable] sealed class R15Catalog {public R15Model[] models;}
        [Serializable] sealed class R15Source {public A2RWebAssets.Card[] cards;}
        [Serializable] sealed class R15Row {public string name,cardId,asset,source,paintingShot,modelShot;public float height,actualHeight,cardHeight,cameraPitch,cameraDistance,cameraFov;public long sourceLod0,displayLod0,displayLod1;public Vector3 anchor,cameraPosition;public Vector2 heroScreen;public bool far,omittedVegetation,clipped;}
        [Serializable] sealed class R15Sheet {public string scope="Isolated QA stage after ordinary Core camp walking. Source paintings and supplied models at identical anchor, unchanged authored height, same 34 degree perspective and native 1x pixels within each pair. Camera translated along its unchanged view direction per model to keep hero and full silhouette visible. No visual PASS assigned; map lead decides. Far rows compare the source forest-wall painting to one repeating far tree; not one-for-one replacements.";public int defaultModels,retainedCards;public List<R15Row> rows=new List<R15Row>();}
        A2RWebAssets.Card R15Card(string name,A2RWebAssets.Card[] cards)
        {
            string key=name.EndsWith("_far",StringComparison.Ordinal)?"forest_wall":name=="camp"?"m_c1camp":name=="altar"?"m_c1altar":name=="bone_arch"?"m_bone_arch":name=="cocoon"?"m_c1cocoon":name=="penta_full"?"m_penta_circle":name=="hang_cage"?"m_hang_cage":name=="sword_pile"?"m_sword_pile":name=="skull_totem"?"m_skull_totem":name=="c1tree"?"m_c1tree":name.StartsWith("ctree",StringComparison.Ordinal)?"m_"+name:name.StartsWith("sroot",StringComparison.Ordinal)?"m_c1sroot":name=="sbone"?"m_c1sbone":name=="spod"?"m_c1spod":name=="fyellow"?"m_fyellow":name.StartsWith("fg_rot",StringComparison.Ordinal)?"foreground_tree":name.StartsWith("bnd",StringComparison.Ordinal)?"boundary_tree":"vegetation";
            string suffix=name.StartsWith("fg_rot",StringComparison.Ordinal)?name.Substring(6):name.StartsWith("bnd",StringComparison.Ordinal)&&!name.EndsWith("_far",StringComparison.Ordinal)?"r3_tree_"+name.Substring(3):name;
            var exact=Array.Find(cards,c=>c.kind==key&&c.asset.EndsWith(suffix,StringComparison.Ordinal));return exact??Array.Find(cards,c=>c.kind==key);
        }
        static long R15Triangles(Renderer[] renderers){long n=0;foreach(var r in renderers){var f=r.GetComponent<MeshFilter>();if(f==null||f.sharedMesh==null)continue;for(int i=0;i<f.sharedMesh.subMeshCount;i++)if(f.sharedMesh.GetTopology(i)==MeshTopology.Triangles)n+=(long)f.sharedMesh.GetIndexCount(i)/3;}return n;}
        IEnumerator R15Save(string id){yield return new WaitForEndOfFrame();var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(a2rPlayOutput,id+".png"),image.EncodeToPNG());Destroy(image);}
        IEnumerator A2RR15Sheet()
        {
            if(!NativeQaSandbox.Active)throw new InvalidOperationException("R15 sheet requires QA save isolation");
            yield return A2RNatureSize(1920);var report=new R15Sheet{defaultModels=a2rModels.Result.modelInstances,retainedCards=a2rModels.RetainedCards};
            if(report.defaultModels!=0||report.retainedCards==0)throw new InvalidOperationException("R15 default empty allowlist did not preserve paintings");
            bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;Simulation.Enemies.Clear();
            // Explicit review override exists only inside this sandboxed coroutine, after checking shipped defaults above.
            a2rModels.Initialize(a2Root.transform,a2rWeb,a2rOcclusion,true);A2RSetLook(true);
            var shadows=new Dictionary<MeshRenderer,ShadowCastingMode>();foreach(var r in a2Root.GetComponentsInChildren<MeshRenderer>(true)){if(!R14Path(r.transform).Contains("A2R supplied 3D")||r.name.Contains("portion")||r.name.Contains("AO"))continue;shadows[r]=r.shadowCastingMode;r.shadowCastingMode=ShadowCastingMode.On;}
            yield return A2RR14Performance();File.Copy(Path.Combine(a2rPlayOutput,"r14-performance.json"),Path.Combine(a2rPlayOutput,"r15-shadows-before.json"),true);
            foreach(var s in shadows)s.Key.shadowCastingMode=s.Value;
            yield return A2RR14Performance();File.Copy(Path.Combine(a2rPlayOutput,"r14-performance.json"),Path.Combine(a2rPlayOutput,"r15-shadows-after.json"),true);
            File.WriteAllText(Path.Combine(a2rPlayOutput,"r15-review-placement.json"),JsonUtility.ToJson(a2rModels.Result,true));
            a2rModels.SetLook(false);a2rWeb.VisualRoot.gameObject.SetActive(false);
            var hidden=new Dictionary<Renderer,bool>();foreach(var r in a2Root.GetComponentsInChildren<Renderer>(true)){string path=R14Path(r.transform),shader=r.sharedMaterial!=null?r.sharedMaterial.shader.name:"";if(path.Contains("地面")||path.Contains("地形")||path.Contains("지면")||path.Contains("흙에 이어진")||r.sharedMaterial==a2FieldSoil||r.sharedMaterial==a2Water||shader.Contains("GroundPainting")||shader.Contains("DistanceHaze")||shader.Contains("ToxicRiver"))continue;hidden[r]=r.enabled;r.enabled=false;}
            var catalog=JsonUtility.FromJson<R15Catalog>(Resources.Load<TextAsset>("A2R/Models3D/catalog").text);var source=JsonUtility.FromJson<R15Source>(Resources.Load<TextAsset>("A2R/web-assets").text);
            Vector3 baseCamera=r3Cam.transform.position;Quaternion cameraRotation=r3Cam.transform.rotation;float fov=r3Cam.fieldOfView;
            var cameraLock=r3Cam.gameObject.AddComponent<A2RR15CameraLock>();cameraLock.position=baseCamera;cameraLock.rotation=cameraRotation;
            // No UpdateViews in the stage loop: keep the real hero pose, camera, weather and Core frozen within a pair.
            foreach(var spec in catalog.models)
            {
                var card=R15Card(spec.name,source.cards);if(card==null)throw new InvalidOperationException("R15 missing painting for "+spec.name);
                var row=new R15Row{name=spec.name,cardId=card.id,asset=card.asset,source=spec.source,cardHeight=card.height,far=spec.name.EndsWith("_far",StringComparison.Ordinal),omittedVegetation=card.kind=="vegetation"};
                row.height=row.far?card.height*.72f:row.omittedVegetation?(spec.name.StartsWith("r3_fern",StringComparison.Ordinal)?.54f:.9f):card.height;
                var stage=new GameObject("A2R r15 isolated model pair");stage.transform.position=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y)+Vector3.right*3;
                row.anchor=stage.transform.position;var art=a2rWeb.CreateR15ReviewCard(card,stage.transform,r3Cam.transform.eulerAngles.y);art.transform.localPosition=Vector3.zero;
                var model=Instantiate(Resources.Load<GameObject>(spec.resource),stage.transform);model.transform.localPosition=Vector3.zero;model.transform.localRotation=Quaternion.Euler(0,spec.prepared?180:0,0);model.transform.localScale=Vector3.one*row.height;
                var group=model.GetComponent<LODGroup>();if(group!=null)row.sourceLod0=R15Triangles(group.GetLODs()[0].renderers);
                A2RProps3D.ApplyRenderBudget(model,row.height,row.far);if(group!=null){var lod=group.GetLODs();row.displayLod0=R15Triangles(lod[0].renderers);row.displayLod1=R15Triangles(lod[lod.Length-1].renderers);group.ForceLOD(0);}
                Bounds bounds=art.GetComponent<Renderer>().bounds;foreach(var r in model.GetComponentsInChildren<Renderer>())bounds.Encapsulate(r.bounds);row.actualHeight=0;float lo=float.PositiveInfinity,hi=float.NegativeInfinity;foreach(var mesh in model.GetComponentsInChildren<MeshFilter>())foreach(var vertex in mesh.sharedMesh.vertices){float y=mesh.transform.TransformPoint(vertex).y;lo=Mathf.Min(lo,y);hi=Mathf.Max(hi,y);}row.actualHeight=hi-lo;bounds.Encapsulate(a2rLighting.Readability.HeroBounds);
                var center=bounds.center;float radius=bounds.extents.magnitude;float distance=Mathf.Max(Vector3.Distance(baseCamera,center),radius/Mathf.Sin(fov*Mathf.Deg2Rad*.5f)*1.25f);
                cameraLock.position=center-cameraRotation*Vector3.forward*distance;cameraLock.rotation=cameraRotation;r3Cam.transform.SetPositionAndRotation(cameraLock.position,cameraRotation);r3Cam.fieldOfView=fov;row.cameraPosition=r3Cam.transform.position;row.cameraDistance=distance;row.cameraFov=fov;row.cameraPitch=r3Cam.transform.eulerAngles.x;
                var hero=r3Cam.WorldToScreenPoint(a2rLighting.Readability.HeroBounds.center);row.heroScreen=new Vector2(hero.x,1080-hero.y);
                model.SetActive(false);art.SetActive(true);for(int n=0;n<5;n++)yield return null;row.paintingShot="r15-"+spec.name+"-painting";yield return R15Save(row.paintingShot);
                art.SetActive(false);model.SetActive(true);for(int n=0;n<5;n++)yield return null;row.modelShot="r15-"+spec.name+"-model";yield return R15Save(row.modelShot);
                report.rows.Add(row);File.WriteAllText(Path.Combine(a2rPlayOutput,"r15-sheet.json"),JsonUtility.ToJson(report,true));stage.SetActive(false);Destroy(stage);
            }
            cameraLock.enabled=false;Destroy(cameraLock);r3Cam.transform.SetPositionAndRotation(baseCamera,cameraRotation);r3Cam.fieldOfView=fov;foreach(var r in hidden)r.Key.enabled=r.Value;a2rWeb.VisualRoot.gameObject.SetActive(true);Simulation.Config.EnemyAiEnabled=ai;
            a2rPlay.visualFixture="R15 isolated model review after ordinary walk, all 50 catalog rows including omitted vegetation and far forest. No PASS assigned; review override never changes default allowlist.";
        }
    }
}
