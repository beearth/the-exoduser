using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(24200)]
    public sealed partial class A2RProps3D:MonoBehaviour
    {
        [Serializable] sealed class Catalog {public Record[] models;}
        [Serializable] sealed class Record {public string name,resource,source;public bool prepared;public float width,depth;public int lods,triangles;}
        [Serializable] sealed class Input {public A2RWebAssets.Card[] cards;}
        [Serializable] sealed class ModelScale {public string name;public float scale=1;}
        [Serializable] sealed class Allowlist {public string[] models;public ModelScale[] scales;}
        public static float ParseModelScale(string json,string name)
        {
            if(string.IsNullOrWhiteSpace(json))return 1;
            try{var data=JsonUtility.FromJson<Allowlist>(json);if(data!=null&&data.scales!=null)foreach(var item in data.scales)if(item!=null&&item.name==name&& !float.IsNaN(item.scale)&& !float.IsInfinity(item.scale))return Mathf.Clamp(item.scale,.6f,1);}catch(ArgumentException){}
            return 1;
        }
        public static HashSet<string> ParseAllowedModels(string json)
        {
            var result=new HashSet<string>(StringComparer.Ordinal);
            if(string.IsNullOrWhiteSpace(json))return result;
            try{var data=JsonUtility.FromJson<Allowlist>(json);if(data!=null&&data.models!=null)foreach(var name in data.models)if(!string.IsNullOrWhiteSpace(name))result.Add(name);}catch(ArgumentException){}
            return result;
        }
        public static void ApplyRenderBudget(GameObject root,float height,bool far)
        {
            foreach(var group in root.GetComponentsInChildren<LODGroup>(true))
            {
                var levels=group.GetLODs();
                // Imported source has three levels. After promotion two remain, so repeated calls are safe.
                if(levels.Length>=3){foreach(var renderer in levels[0].renderers)if(renderer!=null)renderer.gameObject.SetActive(false);}
                var visible=new List<Renderer[]>();for(int i=levels.Length>=3?1:0;i<levels.Length;i++){var renderers=Array.FindAll(levels[i].renderers,r=>r!=null);if(renderers.Length>0)visible.Add(renderers);}
                if(visible.Count==0)throw new InvalidOperationException("A2R model has no nonempty LOD "+root.name);
                var compact=new LOD[visible.Count];for(int i=0;i<compact.Length;i++)compact[i]=new LOD(i==compact.Length-1?.00001f:.18f,visible[i]);group.SetLODs(compact);group.RecalculateBounds();
            }
            if(far||height<1)foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))renderer.shadowCastingMode=ShadowCastingMode.Off;
        }
        [Serializable] public sealed class Placement {public string id,kind,model;public float webX,webY,worldX,worldZ,height,groundY,footY,gapCm,tilt;public bool rayHit;}
        [Serializable] public sealed class Receipt {public bool enabled;public string scope="r18: PASS9 plus supplied foliage7 at original web XY; far allowlist empty, original six forest walls retained. Baked near trees remain review-only. Unlisted kinds retain original paintings. Forest-wall replacement requires all repeating far species approved. Explicit isolated QA can review all models without editing the shipped allowlist. Core and game camera unchanged.";public int sourceCards,modelInstances,flatDecals,floating,standingCards,missing,omittedVegetation;public List<string> missingKinds=new List<string>();public List<Placement> items=new List<Placement>();}
        public Receipt Result=new Receipt();public bool Applied {get;private set;}public int RetainedCards {get;private set;}
        public static bool Enabled {get{return Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-3d-off")<0;}}
        readonly Dictionary<string,Record> records=new Dictionary<string,Record>();readonly Dictionary<string,GameObject> prefabs=new Dictionary<string,GameObject>();readonly Dictionary<string,List<Vector3>> feet=new Dictionary<string,List<Vector3>>();readonly List<GameObject> cards=new List<GameObject>();readonly List<GameObject> forestCards=new List<GameObject>(),forestModels=new List<GameObject>();
        GameObject visuals;Transform originalRoot;A2ROcclusion occlusion;
        HashSet<string> allowed;readonly Dictionary<string,float> scales=new Dictionary<string,float>();
        static readonly string[] ForestNames={"bnd0","bnd3","bnd5","bnd18","c1tree","ctree13","ctree14","ctree15","ctree16","ctree17","ctree18","ctree19","ctree20","fg_rot01","fg_rot03"};
        static uint Hash(string value){uint h=2166136261;foreach(char c in value)h=(h^c)*16777619;return h;}
        static bool Floor(string kind){return kind=="m_c1groot"||kind=="m_c1gtoxicf"||kind=="m_c1pool"||kind=="pit_poison";}
        public static string FoliageModelName(A2RWebAssets.Card c){string file=c.asset.Substring(c.asset.LastIndexOf('/')+1);return file.StartsWith("r3_fern_",StringComparison.Ordinal)?file.Substring(3):file.StartsWith("r4_brush_",StringComparison.Ordinal)?file.Substring(3):null;}
        public static float FoliageHeight(A2RWebAssets.Card c){return c.asset.Contains("r3_fern_")?(c.height>.7f?.54f:.40f):.45f;}
        // r19 clean: ferns low and flat (.32/.40 m, width <= .9 m), brush rounded and rising (xz .7, y 1.2, width <= 1.4 m).
        public static Vector3 FoliageCleanScale(string name,float unitWidth,float baseHeight)
        {
            if(name.StartsWith("fern",StringComparison.Ordinal)){float h=baseHeight>.45f?.40f:.32f;h=Mathf.Min(h,.9f/Mathf.Max(.01f,unitWidth));return Vector3.one*h;}
            float xz=Mathf.Min(baseHeight*.7f,1.4f/Mathf.Max(.01f,unitWidth));return new Vector3(xz,baseHeight*1.2f,xz);
        }
        sealed class Plant {public bool inField;public GameObject go,ao;public Vector3 clean,old,aoClean,aoOld;public bool keep;public List<Material> mats=new List<Material>();}
        readonly List<Plant> plants=new List<Plant>();GameObject lastAo;public int PlantsTotal {get{return plants.Count;}}public int PlantsKept {get;private set;}
        public static bool KeepPlantRule(float x,float z,List<Vector2> trees,Func<float,float,bool> walkable)
        {
            foreach(var t in trees)if((t.x-x)*(t.x-x)+(t.y-z)*(t.y-z)<9f)return true;
            if(walkable==null)return true;if(!walkable(x,z))return true;
            for(int i=0;i<8;i++){float a=i*Mathf.PI/4;if(!walkable(x+Mathf.Cos(a)*2f,z+Mathf.Sin(a)*2f))return true;}
            return false;
        }
        void RegisterPlant(GameObject go,string name,float baseHeight,float x,float z,List<Vector2> trees,Func<float,float,bool> walkable)
        {
            var p=new Plant{go=go,ao=lastAo,clean=go.transform.localScale,old=Vector3.one*baseHeight,keep=KeepPlantRule(x,z,trees,walkable),inField=TerrainEnabled&&InTerrainField(x,z)};var spec=records[name];
            p.aoClean=lastAo.transform.localScale;float ow=Mathf.Clamp(spec.width*baseHeight*.36f,.25f,2.5f);p.aoOld=new Vector3(ow,ow*.5f,1);float cw=Mathf.Clamp(spec.width*Mathf.Max(p.clean.x,p.clean.z)*.36f,.2f,2.5f);p.aoClean=new Vector3(cw,cw*.5f,1);
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in r.sharedMaterials)if(m!=null&&m.HasProperty("_A2R3DWind")&&!p.mats.Contains(m))p.mats.Add(m);plants.Add(p);if(p.keep)PlantsKept++;
        }
        // r19 cleanup: sparse plants (kept near trees and boundaries), clean silhouettes, wind amplitude = current height x .15. false restores the r18 values for the before|after proof.
        public void SetClean(bool on)
        {
            A2RClean.Set(on);foreach(var p in plants){bool show=(!on||p.keep)&&!(on&&p.inField);if(p.go!=null){p.go.SetActive(show);p.go.transform.localScale=on?p.clean:p.old;}if(p.ao!=null){p.ao.SetActive(show);p.ao.transform.localScale=on?p.aoClean:p.aoOld;}foreach(var m in p.mats)m.SetVector("_A2R3DWind",new Vector4((on?p.clean.y:p.old.y)*.15f,.18f,0,m.GetVector("_A2R3DWind").w));}if(terrainRoot!=null){terrainRoot.SetActive(on);foreach(Transform plant in terrainRoot.transform.Find("detail"))foreach(var r in plant.GetComponentsInChildren<MeshRenderer>(true)){var materials=r.sharedMaterials;for(int i=0;i<materials.Length;i++){var m=materials[i];if(m==null||!m.HasProperty("_A2R3DWind"))continue;var block=new MaterialPropertyBlock();r.GetPropertyBlock(block,i);block.SetVector("_A2R3DWind",new Vector4(plant.localScale.y*.15f,.18f,0,m.GetVector("_A2R3DWind").w));r.SetPropertyBlock(block,i);}}}
        }
        public static float FoliageYaw(string id){return (Hash(id)%1001)/1000f*50-25;}
        public static void ApplyFoliageBudget(GameObject root){foreach(var group in root.GetComponentsInChildren<LODGroup>(true)){var lods=group.GetLODs();for(int i=0;i<lods.Length;i++)lods[i].screenRelativeTransitionHeight=i==lods.Length-1?.00001f:i==0?.12f:.04f;group.SetLODs(lods);group.RecalculateBounds();}foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))r.shadowCastingMode=ShadowCastingMode.Off;}
        // D3: Tripo landmarks replace the cards at the same web anchor. Width-fit to the card silhouette (r16 rule: uniform scale), height capped at 1.15 x card.
        static string D3Landmark(A2RWebAssets.Card c)
        {
            switch(c.kind){case "m_penta_circle":return "r3_prop_16";case "m_c1altar":return "r3_prop_17";case "m_c1spod":return "r3_prop_10";case "boundary_tree":return c.id=="tree_19"?"r3_tree_19":c.id=="tree_24"?"r3_tree_24":null;}
            return null;
        }
        float LandmarkHeight(A2RWebAssets.Card c,string name){Record spec;if(!records.TryGetValue(name,out spec))return c.height;return Mathf.Min(c.width/Mathf.Max(.01f,spec.width),c.height*1.15f);}
        // Catalog scale range .8..1.25: the two field-entry flesh trees shrink to .8, the left foreground trunk shrinks to .8 and moves 1.5 m outward (web anchor moved only for this one, value logged in the receipt).
        static void D3Adjust(string id,string name,ref float x,ref float z,ref float h)
        {
            if(id=="foreground_24"){h*=.8f;x-=1.5f;}
            else if(name=="ctree14"||name=="ctree19"||name=="ctree20")h*=.8f;
        }
        // Repaint: Tripo albedo is darker than the original card; keep the flesh/tumour reds readable, trees stay charcoal. Sroot is lowered and darkened so it reads differently from the red ctree lumps.
        static void D3Look(GameObject model,string name)
        {
            Color tint=Color.white;bool any=true;
            if(name.StartsWith("r3_tree_",StringComparison.Ordinal))tint=new Color(.86f,.66f,.62f,1);
            else if(name.StartsWith("r3_prop_",StringComparison.Ordinal))tint=new Color(1.35f,.92f,.86f,1);
            else if(name=="flesh_root_a")tint=new Color(2.6f,1.05f,.95f,1);else if(name=="flesh_root_b")tint=new Color(1.7f,.98f,.92f,1);else if(name.StartsWith("sroot",StringComparison.Ordinal)){tint=new Color(.50f,.44f,.44f,1);model.transform.localScale=new Vector3(model.transform.localScale.x*1.2f,model.transform.localScale.y*.72f,model.transform.localScale.z*1.2f);}
            else any=false;
            if(!any)return;var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",tint);foreach(var r in model.GetComponentsInChildren<MeshRenderer>(true))r.SetPropertyBlock(block);
        }
        static string Name(A2RWebAssets.Card c,int index)
        {
            switch(c.kind){case "m_c1camp":return "camp";case "m_c1altar":return "altar";case "m_bone_arch":return "bone_arch";case "m_c1cocoon":return "cocoon";case "m_penta_circle":return "penta_full";case "m_hang_cage":return "hang_cage";case "m_sword_pile":return "sword_pile";case "m_skull_totem":return "skull_totem";case "m_c1tree":return "c1tree";case "m_c1sroot":return index%2==0?"sroot_a":"sroot_b";case "m_c1sbone":return "sbone";case "m_c1spod":return "spod";case "m_fyellow":return "fyellow";case "vegetation":{string path=string.IsNullOrEmpty(c.variationAsset)?c.asset:c.variationAsset;return path.Substring(path.LastIndexOf('/')+1);}case "foreground_tree":return c.asset.EndsWith("03",StringComparison.Ordinal)?"fg_rot03":"fg_rot01";case "boundary_tree":return new[]{"bnd0","bnd3","bnd5","bnd18"}[index%4];}
            return c.kind.StartsWith("m_ctree",StringComparison.Ordinal)?c.kind.Substring(2):null;
        }
        public void Initialize(Transform world,A2RWebAssets web,A2ROcclusion masks,bool reviewAll=false,Func<float,float,bool> walkable=null)
        {
            occlusion=masks;originalRoot=web.VisualRoot;visuals=new GameObject("A2R supplied 3D assets at web coordinates");visuals.transform.SetParent(world,false);var catalog=Resources.Load<TextAsset>("A2R/Models3D/catalog");if(catalog==null)throw new InvalidOperationException("A2R 3D catalog not imported");foreach(var r in JsonUtility.FromJson<Catalog>(catalog.text).models)records[r.name]=r;
            var list=Resources.Load<TextAsset>("A2R/Models3D/allowed-models");allowed=ParseAllowedModels(list!=null?list.text:null);foreach(var name in records.Keys)scales[name]=ParseModelScale(list!=null?list.text:null,name);
            if(reviewAll){if(!NativeQaSandbox.Active||Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r15-sheet")<0)throw new InvalidOperationException("R15 review override requires explicit isolated sheet run");foreach(var key in records.Keys)allowed.Add(key);}
            var input=JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);Result.sourceCards=input.cards.Length;int at=0;var treeSpots=new List<Vector2>();foreach(var t in input.cards)if(t.kind.StartsWith("m_ctree",StringComparison.Ordinal)||t.kind=="m_c1tree"||t.kind=="foreground_tree"||t.kind=="boundary_tree")treeSpots.Add(new Vector2(t.x/100,-t.y/100));
            foreach(var c in input.cards){if(Floor(c.kind))continue;var source=web.Result.items.Find(x=>x.id==c.id);if(source==null||!source.added)continue;var card=originalRoot.Find(c.id+" "+c.kind+" web XY");if(card==null)throw new InvalidOperationException("A2R card lookup "+c.id);
                if(c.kind=="vegetation"){string plant=FoliageModelName(c);if(plant==null||!allowed.Contains(plant)){RetainedCards++;continue;}cards.Add(card.gameObject);var plantObject=Place(c,plant,c.x/100,-c.y/100,FoliageHeight(c),c.id);RegisterPlant(plantObject,plant,FoliageHeight(c),c.x/100,-c.y/100,treeSpots,walkable);continue;}
                if((c.kind=="corpse"||c.kind=="m_fbones")&&!(A2RD4.On&&records.ContainsKey("corpse_a"))){RetainedCards++;continue;}
                if(c.kind=="forest_wall"){bool all=Array.TrueForAll(ForestNames,n=>allowed.Contains(n+"_far"));if(all){cards.Add(card.gameObject);forestCards.Add(card.gameObject);Forest(c);}else RetainedCards++;continue;}
                string name=Name(c,at++);if(A2RD3.On){string d3=D3Landmark(c);if(d3!=null&&records.ContainsKey(d3)){name=d3;allowed.Add(d3);}}bool d4prop=false;if(A2RD4.On){string d4=D4Prop(c);if(d4!=null&&records.ContainsKey(d4)){name=d4;allowed.Add(d4);d4prop=true;}}if(name==null||!allowed.Contains(name)){RetainedCards++;continue;}
                if(!records.ContainsKey(name)){Result.missing++;Result.missingKinds.Add(c.id+":"+c.kind);continue;}
                cards.Add(card.gameObject);float px3=c.x/100,pz3=-c.y/100,h3=name.StartsWith("r3_",StringComparison.Ordinal)?LandmarkHeight(c,name):c.height;if(A2RD3.On)D3Adjust(c.id,name,ref px3,ref pz3,ref h3);if(d4prop){h3=name.StartsWith("flesh_root",StringComparison.Ordinal)?LandmarkHeight(c,name):1f;if(!D4OffBand(ref px3,ref pz3,walkable)){Debug.Log("A2R_D4_PROP_SKIPPED "+c.id+" "+name);cards.RemoveAt(cards.Count-1);RetainedCards++;continue;}}var model=Place(c,name,px3,pz3,h3,c.id);if(model!=null&&A2RD3.On)D3Look(model,name);if(c.kind=="m_c1altar"&&model!=null&&!name.StartsWith("r3_",StringComparison.Ordinal))Rune(model,c);
            }
            if(Result.missing>0)throw new InvalidOperationException("A2R 3D unmapped kinds: "+string.Join(",",Result.missingKinds));d3Camp=web.CampFoot;BuildTerrainDress(world,treeSpots,walkable);SetLook(Enabled);SetClean(A2RClean.On);Debug.Log("A2R_3D_READY models="+Result.modelInstances+" flat="+Result.flatDecals+" standing="+Result.standingCards+" floating="+Result.floating);
        }
        GameObject Place(A2RWebAssets.Card c,string name,float x,float z,float height,string id)
        {
            float factor;if(scales.TryGetValue(name,out factor))height*=factor;
            Record spec;if(!records.TryGetValue(name,out spec))throw new InvalidOperationException("A2R model missing "+name);GameObject prefab;if(!prefabs.TryGetValue(name,out prefab)){prefab=Resources.Load<GameObject>(spec.resource);if(prefab==null)throw new InvalidOperationException("A2R prefab missing "+spec.resource);prefabs[name]=prefab;}
            var go=Instantiate(prefab,visuals.transform);go.name=id+" "+c.kind+" "+name;RaycastHit hit;bool ray=Physics.Raycast(new Vector3(x,60,z),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore);float ground=Mathf.Max(ray?hit.point.y:float.NegativeInfinity,NativeRemodel3D.GroundY(x,z));float step=.25f;var normal=new Vector3(NativeRemodel3D.GroundY(x-step,z)-NativeRemodel3D.GroundY(x+step,z),step*2,NativeRemodel3D.GroundY(x,z-step)-NativeRemodel3D.GroundY(x,z+step)).normalized;var tilt=Quaternion.RotateTowards(Quaternion.identity,Quaternion.FromToRotation(Vector3.up,normal),15);go.transform.SetPositionAndRotation(new Vector3(x,ground-.04f,z),tilt*Quaternion.Euler(0,(spec.prepared?180:0)+(c.kind=="vegetation"?FoliageYaw(id):0),0));go.transform.localScale=c.kind=="vegetation"?FoliageCleanScale(name,records[name].width,height):Vector3.one*height;
            List<Vector3> foot;if(!feet.TryGetValue(name,out foot)){var points=new List<Vector3>();float min=float.PositiveInfinity;foreach(var filter in prefab.GetComponentsInChildren<MeshFilter>(true)){if(filter.transform.parent!=null&&filter.transform.parent.name.Contains("LOD1")||filter.transform.parent!=null&&filter.transform.parent.name.Contains("LOD2"))continue;foreach(var v in filter.sharedMesh.vertices){var p=prefab.transform.InverseTransformPoint(filter.transform.TransformPoint(v));points.Add(p);min=Mathf.Min(min,p.y);}}foot=new List<Vector3>();foreach(var p in points)if(p.y<=min+.003f)foot.Add(p);if(foot.Count>48){var reduced=new List<Vector3>();for(int i=0;i<48;i++)reduced.Add(foot[i*foot.Count/48]);foot=reduced;}feet[name]=foot;}
            if(c.kind=="vegetation")ApplyFoliageBudget(go);else ApplyRenderBudget(go,height,name.EndsWith("_far",StringComparison.Ordinal));ConformBase(go);float gap=0,footY=float.PositiveInfinity;foreach(var filter in go.GetComponentsInChildren<MeshFilter>(false)){var source=prefab.transform.Find(RelativePath(go.transform,filter.transform));if(source==null)continue;var original=source.GetComponent<MeshFilter>().sharedMesh.vertices;var actual=filter.sharedMesh.vertices;for(int i=0;i<original.Length;i++){var rootPoint=prefab.transform.InverseTransformPoint(source.TransformPoint(original[i]));if(rootPoint.y>.003f)continue;var p=filter.transform.TransformPoint(actual[i]);footY=Mathf.Min(footY,p.y);gap=Mathf.Max(gap,p.y-SurfaceY(p.x,p.z)-.012f);}}var item=new Placement{id=id,kind=c.kind,model=name,webX=x*100,webY=-z*100,worldX=x,worldZ=z,height=height,groundY=ground,footY=float.IsPositiveInfinity(footY)?ground-.04f:footY,gapCm=gap*100,tilt=Quaternion.Angle(Quaternion.identity,tilt),rayHit=ray};Result.items.Add(item);Result.modelInstances++;if(!ray||item.gapCm>3)Result.floating++;occlusion.RegisterModel(go.transform,id+" "+c.kind);foreach(var renderer in go.GetComponentsInChildren<MeshRenderer>(true))foreach(var material in renderer.sharedMaterials)if(material!=null&&material.HasProperty("_A2R3DWind")){bool plant=c.kind=="vegetation",tree=c.kind.IndexOf("tree",StringComparison.OrdinalIgnoreCase)>=0||c.kind=="forest_wall";material.SetVector("_A2R3DWind",new Vector4(plant?go.transform.localScale.y*.15f:tree?.06f:c.kind=="m_c1camp"?.018f:0,plant?.18f:0,plant?0:1,material.GetVector("_A2R3DWind").w));var bounds=renderer.localBounds;var scale=renderer.transform.lossyScale;bounds.Expand(.6f/Mathf.Max(.001f,Mathf.Min(Mathf.Abs(scale.x),Mathf.Min(Mathf.Abs(scale.y),Mathf.Abs(scale.z)))));renderer.localBounds=bounds;}
            var shadow=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(shadow.GetComponent<Collider>());shadow.name="A2R 3D rooted foot AO";shadow.transform.SetParent(visuals.transform,false);shadow.transform.SetPositionAndRotation(new Vector3(x,ground+.018f,z),Quaternion.Euler(90,0,0));float width=Mathf.Clamp(spec.width*height*.36f,.25f,2.5f);shadow.transform.localScale=new Vector3(width,width*.5f,1);var sr=shadow.GetComponent<MeshRenderer>();sr.sharedMaterial=new Material(Resources.Load<Shader>("A2R/Contact"));sr.sharedMaterial.SetFloat("_Opacity",.9f);sr.shadowCastingMode=ShadowCastingMode.Off;lastAo=shadow;return go;
        }
        static string RelativePath(Transform root,Transform t){string p=t.name;while(t.parent!=root){t=t.parent;p=t.name+"/"+p;}return p;}
        static float SurfaceY(float x,float z){RaycastHit hit;return Mathf.Max(NativeRemodel3D.GroundY(x,z),Physics.Raycast(new Vector3(x,60,z),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore)?hit.point.y:float.NegativeInfinity);}
        // Warp only the bottom support band to the visible terrain. Source meshes, upper silhouette, foot XY and total placement stay unchanged.
        static void ConformBase(GameObject model){foreach(var filter in model.GetComponentsInChildren<MeshFilter>(true)){var original=filter.sharedMesh;var points=original.vertices;bool changed=false;for(int i=0;i<points.Length;i++){var world=filter.transform.TransformPoint(points[i]);var root=model.transform.InverseTransformPoint(world);if(root.y>.16f)continue;float weight=1-Mathf.SmoothStep(0,1,Mathf.Max(0,root.y)/.16f);var basePoint=model.transform.TransformPoint(new Vector3(root.x,0,root.z));world.y+=(SurfaceY(basePoint.x,basePoint.z)-.04f-basePoint.y)*weight;points[i]=filter.transform.InverseTransformPoint(world);changed=true;}if(!changed)continue;var mesh=Instantiate(original);mesh.name=original.name+" terrain rooted instance";mesh.vertices=points;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();var bounds=mesh.bounds;bounds.Expand(.35f);mesh.bounds=bounds;filter.sharedMesh=mesh;}}
        void Forest(A2RWebAssets.Card c)
        {
            var names=new[]{"bnd0","bnd3","bnd5","bnd18","c1tree","ctree13","ctree14","ctree15","ctree16","ctree17","ctree18","ctree19","ctree20","fg_rot01","fg_rot03"};uint key=Hash(c.id);float height=c.height*.72f;int count=Mathf.Max(3,Mathf.CeilToInt(c.width/Mathf.Max(.6f,height*.48f)));
            for(int row=0;row<2;row++)for(int i=0;i<count;i++){int type=(i*7+row*5+(int)(key%15))%15;float phase=((key+(uint)(i*131+row*73))%1001)/1000f;float x=c.x/100+((i+.5f)/count-.5f)*c.width+(phase-.5f)*.35f;float z=-c.y/100+row*.9f+(phase-.5f)*.55f;forestModels.Add(Place(c,names[type]+"_far",x,z,height*(.88f+phase*.22f),c.id+" forest "+row+"/"+i));}
        }
        // r19 isolated test only: forest-wall silhouette from near-tree source LOD1 (25%), flat wall tint, no registration, no receipts, no shadows.
        public List<GameObject> ForestLod1Test(A2RWebAssets.Card c,Color tint)
        {
            var made=new List<GameObject>();uint key=Hash(c.id);float height=c.height*.72f;int count=Mathf.Max(3,Mathf.CeilToInt(c.width/Mathf.Max(.6f,height*.48f)));
            for(int row=0;row<2;row++)for(int i=0;i<count;i++)
            {
                int type=(i*7+row*5+(int)(key%15))%15;float phase=((key+(uint)(i*131+row*73))%1001)/1000f;float x=c.x/100+((i+.5f)/count-.5f)*c.width+(phase-.5f)*.35f;float z=-c.y/100+row*.9f+(phase-.5f)*.55f;
                string name=ForestNames[type];Record spec;if(!records.TryGetValue(name,out spec))continue;var prefab=Resources.Load<GameObject>(spec.resource);if(prefab==null)continue;
                float h=height*(.88f+phase*.22f);float factor;if(scales.TryGetValue(name,out factor))h*=factor;
                var go=Instantiate(prefab,visuals.transform);go.name=c.id+" r19 far lod1 "+row+"/"+i;go.transform.SetPositionAndRotation(new Vector3(x,Mathf.Max(NativeRemodel3D.GroundY(x,z),-.45f)-.04f,z),Quaternion.Euler(0,spec.prepared?180:0,0));go.transform.localScale=Vector3.one*h;
                ApplyRenderBudget(go,h,true);foreach(var group in go.GetComponentsInChildren<LODGroup>(true))group.ForceLOD(0);
                foreach(var renderer in go.GetComponentsInChildren<MeshRenderer>(true)){var source=renderer.sharedMaterials;var copy=new Material[source.Length];for(int k=0;k<source.Length;k++){var m=new Material(source[k]);foreach(var tex in new[]{"_BaseMap","_BumpMap","_MetallicGlossMap","_OcclusionMap","_EmissionMap"})if(m.HasProperty(tex))m.SetTexture(tex,null);foreach(var key2 in new[]{"_NORMALMAP","_OCCLUSIONMAP","_METALLICSPECGLOSSMAP","_EMISSION","_ALPHATEST_ON"})m.DisableKeyword(key2);m.SetColor("_BaseColor",tint);copy[k]=m;}renderer.sharedMaterials=copy;}
                made.Add(go);
            }
            return made;
        }
        void Decal(A2RWebAssets.Card c)
        {
            const int n=24;var v=new List<Vector3>();var uv=new List<Vector2>();var tri=new List<int>();for(int y=0;y<=n;y++)for(int x=0;x<=n;x++){float u=x/(float)n,w=y/(float)n,wx=c.sourceX/100+(u-.5f)*c.width,wz=-c.sourceY/100+(w-.5f)*c.height;v.Add(new Vector3(wx,Mathf.Max(NativeRemodel3D.GroundY(wx,wz),-.45f)+.029f,wz));uv.Add(new Vector2(u,w));}for(int y=0;y<n;y++)for(int x=0;x<n;x++){int a=y*(n+1)+x;tri.AddRange(new[]{a,a+n+1,a+1,a+1,a+n+1,a+n+2});}var mesh=new Mesh{name=c.id+" source floor remains decal"};mesh.SetVertices(v);mesh.SetUVs(0,uv);mesh.SetTriangles(tri,0);mesh.RecalculateNormals();mesh.RecalculateTangents();var go=new GameObject("A2R flat remains "+c.id);go.transform.SetParent(visuals.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;var r=go.AddComponent<MeshRenderer>();var mat=new Material(Resources.Load<Shader>("A2R/CardOpaque")){renderQueue=2481};mat.SetTexture("_MainTex",Resources.Load<Texture2D>(c.asset));mat.SetTexture("_NormalTex",Resources.Load<Texture2D>(c.asset+"_normal"));r.sharedMaterial=mat;r.shadowCastingMode=ShadowCastingMode.Off;Result.flatDecals++;
        }
        void Rune(GameObject model,A2RWebAssets.Card c)
        {
            var colliders=new List<MeshCollider>();Bounds bounds=new Bounds();bool first=true;foreach(var r in model.GetComponentsInChildren<MeshRenderer>()){if(r.name=="A2R sight circle portion")continue;var filter=r.GetComponent<MeshFilter>();if(filter==null)continue;var collider=r.gameObject.AddComponent<MeshCollider>();collider.sharedMesh=filter.sharedMesh;collider.gameObject.layer=29;colliders.Add(collider);if(first){bounds=r.bounds;first=false;}else bounds.Encapsulate(r.bounds);}Physics.SyncTransforms();
            const int sides=48;var v=new List<Vector3>();var uv=new List<Vector2>();var tri=new List<int>();float radius=Mathf.Min(c.width*.3f,c.height*.4f);for(int i=0;i<=sides;i++){float a=i==0?0:(i-1)*Mathf.PI*2/sides,r=i==0?0:1;float x=model.transform.position.x+Mathf.Cos(a)*radius*r,z=model.transform.position.z+Mathf.Sin(a)*radius*r;var ray=new Ray(new Vector3(x,bounds.max.y+1,z),Vector3.down);float y=float.NegativeInfinity;foreach(var col in colliders){RaycastHit hit;if(col.Raycast(ray,out hit,100))y=Mathf.Max(y,hit.point.y);}if(float.IsNegativeInfinity(y))y=model.transform.position.y+c.height*.6f;v.Add(new Vector3(x,y+.018f,z));uv.Add(new Vector2(.5f+Mathf.Cos(a)*.26f*r,.5f+Mathf.Sin(a)*.26f*r));if(i>1)tri.AddRange(new[]{0,i,i-1});}tri.AddRange(new[]{0,1,sides});var mesh=new Mesh{name="Original altar rune top projection"};mesh.SetVertices(v);mesh.SetUVs(0,uv);mesh.SetTriangles(tri,0);mesh.RecalculateNormals();mesh.RecalculateTangents();var go=new GameObject("A2R original altar rune on 3D top");go.transform.SetParent(visuals.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.AddComponent<MeshRenderer>();var mat=new Material(Resources.Load<Shader>("A2R/CardOpaque")){renderQueue=2482};mat.SetTexture("_MainTex",Resources.Load<Texture2D>(c.asset));mat.SetFloat("_Emission",1.2f);renderer.sharedMaterial=mat;renderer.shadowCastingMode=ShadowCastingMode.Off;foreach(var collider in colliders){collider.gameObject.layer=0;Destroy(collider);}
        }
        bool forestLook=true;Camera forestCamera;Action<List<Vector4>> collectForestTargets;readonly List<Vector4> forestTargets=new List<Vector4>();public int CulledForestModels {get;private set;}
        public void SetForestReadability(Camera camera,Action<List<Vector4>> collect){forestCamera=camera;collectForestTargets=collect;}
        public static bool ForestBlocksTarget(Bounds bounds,Vector3 eye,Vector3 target){float near;return bounds.IntersectRay(new Ray(eye,target-eye),out near)&&near<Vector3.Distance(eye,target)-.02f;}
        void LateUpdate(){
            CulledForestModels=0;if(!Applied||!forestLook||forestCamera==null||collectForestTargets==null)return;forestTargets.Clear();collectForestTargets(forestTargets);var planes=GeometryUtility.CalculateFrustumPlanes(forestCamera);var eye=forestCamera.transform.position;
            foreach(var model in forestModels){if(model==null)continue;bool blocked=false;foreach(var renderer in model.GetComponentsInChildren<MeshRenderer>(true)){if(renderer.name.Contains("portion")||!renderer.enabled||!GeometryUtility.TestPlanesAABB(planes,renderer.bounds))continue;foreach(var target in forestTargets){var point=new Vector3(target.x,target.y,target.z);var view=forestCamera.WorldToViewportPoint(point);if(view.z<=0||view.x<0||view.x>1||view.y<0||view.y>1)continue;float radius=Mathf.Max(.5f,Mathf.Abs(target.w)*.5f);foreach(var offset in new[]{Vector3.zero,Vector3.up*radius,Vector3.down*radius,Vector3.right*radius,Vector3.left*radius})if(ForestBlocksTarget(renderer.bounds,eye,point+offset)){blocked=true;break;}if(blocked)break;}if(blocked)break;}if(blocked)CulledForestModels++;if(model.activeSelf==blocked)model.SetActive(!blocked);}
        }
        public void SetForestLook(bool on){forestLook=on;foreach(var model in forestModels)if(model!=null)model.SetActive(on);foreach(var card in forestCards)if(card!=null)card.SetActive(!on);}
        public Transform VisualRoot {get{return visuals.transform;}}
        public void SetLook(bool on){Applied=on;Result.enabled=on;if(visuals!=null)visuals.SetActive(on);foreach(var card in cards)if(card!=null)card.SetActive(!on);Result.standingCards=0;foreach(var card in cards)if(card!=null&&card.activeInHierarchy)Result.standingCards++;}
    }
}
