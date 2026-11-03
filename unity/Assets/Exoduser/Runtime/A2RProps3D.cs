using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(24200)]
    public sealed class A2RProps3D:MonoBehaviour
    {
        [Serializable] sealed class Catalog {public Record[] models;}
        [Serializable] sealed class Record {public string name,resource,source;public bool prepared;public float width,depth;public int lods,triangles;}
        [Serializable] sealed class Input {public A2RWebAssets.Card[] cards;}
        [Serializable] public sealed class Placement {public string id,kind,model;public float webX,webY,worldX,worldZ,height,groundY,footY,gapCm,tilt;public bool rayHit;}
        [Serializable] public sealed class Receipt {public bool enabled;public string scope="Review candidate only. Source brush v3 is RETOUCH/unapproved. Core/camera/actor drawing/source paintings unchanged.";public int sourceCards,modelInstances,flatDecals,floating,standingCards,missing;public List<string> missingKinds=new List<string>();public List<Placement> items=new List<Placement>();}
        public Receipt Result=new Receipt();public bool Applied {get;private set;}
        public static bool Enabled {get{return Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-3d-off")<0;}}
        readonly Dictionary<string,Record> records=new Dictionary<string,Record>();readonly Dictionary<string,GameObject> prefabs=new Dictionary<string,GameObject>();readonly Dictionary<string,List<Vector3>> feet=new Dictionary<string,List<Vector3>>();readonly List<GameObject> cards=new List<GameObject>();
        GameObject visuals;Transform originalRoot;A2ROcclusion occlusion;
        static uint Hash(string value){uint h=2166136261;foreach(char c in value)h=(h^c)*16777619;return h;}
        static bool Floor(string kind){return kind=="m_c1groot"||kind=="m_c1gtoxicf"||kind=="m_c1pool"||kind=="pit_poison";}
        static string Name(A2RWebAssets.Card c,int index)
        {
            switch(c.kind){case "m_c1camp":return "camp";case "m_c1altar":return "altar";case "m_bone_arch":return "bone_arch";case "m_c1cocoon":return "cocoon";case "m_penta_circle":return "penta_full";case "m_hang_cage":return "hang_cage";case "m_sword_pile":return "sword_pile";case "m_skull_totem":return "skull_totem";case "m_c1tree":return "c1tree";case "m_c1sroot":return index%2==0?"sroot_a":"sroot_b";case "m_c1sbone":return "sbone";case "m_c1spod":return "spod";case "m_fyellow":return "fyellow";case "vegetation":{string path=string.IsNullOrEmpty(c.variationAsset)?c.asset:c.variationAsset;return path.Substring(path.LastIndexOf('/')+1);}case "foreground_tree":return c.asset.EndsWith("03",StringComparison.Ordinal)?"fg_rot03":"fg_rot01";case "boundary_tree":return new[]{"bnd0","bnd3","bnd5","bnd18"}[index%4];}
            return c.kind.StartsWith("m_ctree",StringComparison.Ordinal)?c.kind.Substring(2):null;
        }
        public void Initialize(Transform world,A2RWebAssets web,A2ROcclusion masks)
        {
            occlusion=masks;originalRoot=web.VisualRoot;visuals=new GameObject("A2R supplied 3D assets at web coordinates");visuals.transform.SetParent(world,false);var catalog=Resources.Load<TextAsset>("A2R/Models3D/catalog");if(catalog==null)throw new InvalidOperationException("A2R 3D catalog not imported");foreach(var r in JsonUtility.FromJson<Catalog>(catalog.text).models)records[r.name]=r;
            var input=JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);Result.sourceCards=input.cards.Length;int at=0;
            foreach(var c in input.cards){if(Floor(c.kind))continue;var source=web.Result.items.Find(x=>x.id==c.id);if(source==null||!source.added)continue;var card=originalRoot.Find(c.id+" "+c.kind+" web XY");if(card==null)throw new InvalidOperationException("A2R card lookup "+c.id);cards.Add(card.gameObject);
                if(c.kind=="corpse"||c.kind=="m_fbones"){Decal(c);continue;}
                if(c.kind=="forest_wall"){Forest(c);continue;}string name=Name(c,at++);if(name==null||!records.ContainsKey(name)){Result.missing++;Result.missingKinds.Add(c.id+":"+c.kind);continue;}var model=Place(c,name,c.x/100,-c.y/100,c.height,c.id);if(c.kind=="m_c1altar"&&model!=null)Rune(model,c);
            }
            if(Result.missing>0)throw new InvalidOperationException("A2R 3D unmapped kinds: "+string.Join(",",Result.missingKinds));SetLook(Enabled);Debug.Log("A2R_3D_READY models="+Result.modelInstances+" flat="+Result.flatDecals+" standing="+Result.standingCards+" floating="+Result.floating);
        }
        GameObject Place(A2RWebAssets.Card c,string name,float x,float z,float height,string id)
        {
            Record spec;if(!records.TryGetValue(name,out spec))throw new InvalidOperationException("A2R model missing "+name);GameObject prefab;if(!prefabs.TryGetValue(name,out prefab)){prefab=Resources.Load<GameObject>(spec.resource);if(prefab==null)throw new InvalidOperationException("A2R prefab missing "+spec.resource);prefabs[name]=prefab;}
            var go=Instantiate(prefab,visuals.transform);go.name=id+" "+c.kind+" "+name;RaycastHit hit;bool ray=Physics.Raycast(new Vector3(x,60,z),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore);float ground=Mathf.Max(ray?hit.point.y:float.NegativeInfinity,NativeRemodel3D.GroundY(x,z));float step=.25f;var normal=new Vector3(NativeRemodel3D.GroundY(x-step,z)-NativeRemodel3D.GroundY(x+step,z),step*2,NativeRemodel3D.GroundY(x,z-step)-NativeRemodel3D.GroundY(x,z+step)).normalized;var tilt=Quaternion.RotateTowards(Quaternion.identity,Quaternion.FromToRotation(Vector3.up,normal),15);go.transform.SetPositionAndRotation(new Vector3(x,ground-.04f,z),tilt*Quaternion.Euler(0,spec.prepared?180:0,0));go.transform.localScale=Vector3.one*height;
            List<Vector3> foot;if(!feet.TryGetValue(name,out foot)){var points=new List<Vector3>();float min=float.PositiveInfinity;foreach(var filter in prefab.GetComponentsInChildren<MeshFilter>(true)){if(filter.transform.parent!=null&&filter.transform.parent.name.Contains("LOD1")||filter.transform.parent!=null&&filter.transform.parent.name.Contains("LOD2"))continue;foreach(var v in filter.sharedMesh.vertices){var p=prefab.transform.InverseTransformPoint(filter.transform.TransformPoint(v));points.Add(p);min=Mathf.Min(min,p.y);}}foot=new List<Vector3>();foreach(var p in points)if(p.y<=min+.003f)foot.Add(p);if(foot.Count>48){var reduced=new List<Vector3>();for(int i=0;i<48;i++)reduced.Add(foot[i*foot.Count/48]);foot=reduced;}feet[name]=foot;}
            float gap=0,footY=float.PositiveInfinity;foreach(var v in foot){var p=go.transform.TransformPoint(v);footY=Mathf.Min(footY,p.y);gap=Mathf.Max(gap,p.y-NativeRemodel3D.GroundY(p.x,p.z)-.012f);}var item=new Placement{id=id,kind=c.kind,model=name,webX=x*100,webY=-z*100,worldX=x,worldZ=z,height=height,groundY=ground,footY=float.IsPositiveInfinity(footY)?ground-.04f:footY,gapCm=gap*100,tilt=Quaternion.Angle(Quaternion.identity,tilt),rayHit=ray};Result.items.Add(item);Result.modelInstances++;if(!ray||item.gapCm>3)Result.floating++;occlusion.RegisterModel(go.transform,id+" "+c.kind);
            var shadow=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(shadow.GetComponent<Collider>());shadow.name="A2R 3D rooted foot AO";shadow.transform.SetParent(visuals.transform,false);shadow.transform.SetPositionAndRotation(new Vector3(x,ground+.018f,z),Quaternion.Euler(90,0,0));float width=Mathf.Clamp(spec.width*height*.36f,.25f,2.5f);shadow.transform.localScale=new Vector3(width,width*.5f,1);var sr=shadow.GetComponent<MeshRenderer>();sr.sharedMaterial=new Material(Resources.Load<Shader>("A2R/Contact"));sr.sharedMaterial.SetFloat("_Opacity",.9f);sr.shadowCastingMode=ShadowCastingMode.Off;return go;
        }
        void Forest(A2RWebAssets.Card c)
        {
            var names=new[]{"bnd0","bnd3","bnd5","bnd18","c1tree","ctree13","ctree14","ctree15","ctree16","ctree17","ctree18","ctree19","ctree20","fg_rot01","fg_rot03"};uint key=Hash(c.id);float height=c.height*.72f;int count=Mathf.Max(3,Mathf.CeilToInt(c.width/Mathf.Max(.6f,height*.48f)));
            for(int row=0;row<2;row++)for(int i=0;i<count;i++){int type=(i*7+row*5+(int)(key%15))%15;float phase=((key+(uint)(i*131+row*73))%1001)/1000f;float x=c.x/100+((i+.5f)/count-.5f)*c.width+(phase-.5f)*.35f;float z=-c.y/100+row*.9f+(phase-.5f)*.55f;Place(c,names[type]+"_far",x,z,height*(.88f+phase*.22f),c.id+" forest "+row+"/"+i);}
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
        public void SetLook(bool on){Applied=on;Result.enabled=on;if(visuals!=null)visuals.SetActive(on);foreach(var card in cards)if(card!=null)card.SetActive(!on);if(originalRoot!=null)foreach(Transform child in originalRoot)if(child.name=="A2R web foot AO")child.gameObject.SetActive(!on);Result.standingCards=0;foreach(var card in cards)if(card!=null&&card.activeInHierarchy)Result.standingCards++;}
    }
}
