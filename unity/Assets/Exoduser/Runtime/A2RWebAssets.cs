using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(24000)]
    public sealed class A2RWebAssets : MonoBehaviour
    {
        [Serializable] public sealed class Card {public string id,kind,asset,variationAsset;public float x,y,sourceX,sourceY,width,height,footU,footV,emission,sway;}
        [Serializable] public sealed class Tile {public string asset;public int x,y;}
        [Serializable] public sealed class River {public float x,y,width;}
        [Serializable] sealed class Input {public Card[] cards;public Tile[] groundTiles;public River[] riverPoints;}
        [Serializable] public sealed class Item {public string id,kind,kept3D,variant;public float variationScale=1,variationYaw,variationValue=1;public bool mirrored,groundProjected;public float webX,webY,worldX,worldZ,groundY,footY,gapCm;public bool rayHit,added;}
        [Serializable] public sealed class KindCount {public string kind;public int source,added,duplicates;}
        [Serializable] public sealed class Receipt {public string source="a5c287157 C10 layout142 + R5 unique14 + foreground27; all64 ground paintings. Original drawX/footY and alpha-foot offset, no SourceMap intersection filter. Core/terrain/camera/actors unchanged.";public int sourceCards,added,duplicates,floating,groundTiles,moatRibbons;public List<KindCount> kinds=new List<KindCount>();public List<Item> items=new List<Item>();}
        public Vector3 CampFoot {get;private set;}
        public Transform VisualRoot {get{return visuals.transform;}}
        public Receipt Result=new Receipt();public bool Applied {get;private set;}
        sealed class CardPose {public Transform transform;public float yaw;}
        sealed class FloorPose {public Transform transform;public MeshFilter filter;public Mesh standing,projected;public Vector3 standingPosition,projectedPosition;}
        readonly List<FloorPose> floorCards=new List<FloorPose>();
        public int GroundProjectedCount {get{return floorCards.Count;}}
        readonly List<CardPose> cards=new List<CardPose>();readonly List<SpriteRenderer> originals=new List<SpriteRenderer>();readonly List<bool> originalEnabled=new List<bool>();
        Camera viewer;GameObject visuals;Material ground,water;Shader waterOriginal;bool waterSpecularOff;readonly Dictionary<string,Texture> originalTextures=new Dictionary<string,Texture>();A2ROcclusion occlusion;
        public void Initialize(Transform world,Camera camera,IEnumerable<SpriteRenderer> existing,Material soil,Material swamp,A2ROcclusion fade)
        {
            BuildWaterDomain();viewer=camera;ground=soil;water=swamp;waterOriginal=water.shader;waterSpecularOff=water.IsKeywordEnabled("_SPECULARHIGHLIGHTS_OFF");occlusion=fade;foreach(var sr in existing){originals.Add(sr);originalEnabled.Add(sr.enabled);}visuals=new GameObject("A2R existing web assets at original XY");visuals.transform.SetParent(world,true);
            foreach(var name in new[]{"A2 전체 필드 지면","A2 시작 목교"}){var target=world.Find(name);if(target==null)continue;foreach(var filter in target.GetComponentsInChildren<MeshFilter>()){if(filter.sharedMesh==null)continue;var query=new GameObject("A2R visual surface ray query");query.transform.SetParent(filter.transform,false);query.layer=28;query.AddComponent<MeshCollider>().sharedMesh=filter.sharedMesh;}}
            Physics.SyncTransforms();var input=JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);var sourceObjects=new List<Transform>();foreach(Transform child in world)sourceObjects.Add(child);
            Shader opaque=Resources.Load<Shader>("A2R/CardOpaque"),transparent=Resources.Load<Shader>("A2R/CardFade");if(opaque==null||transparent==null)throw new InvalidOperationException("A2R web card shaders missing");
            Result.sourceCards=input.cards.Length;Result.groundTiles=A2RGroundPainting.Build(visuals.transform,input.groundTiles,input.riverPoints,NativeGame.Instance.Map.CanMove,water);Result.moatRibbons=input.riverPoints!=null&&input.riverPoints.Length>1?1:0;
            foreach(var c in input.cards)
            {
                if(A2RClean.HellRot&&(c.kind=="vegetation"||c.kind=="m_fyellow"||c.asset.IndexOf("r3_bank",StringComparison.Ordinal)>=0||c.asset.IndexOf("r3_thicket",StringComparison.Ordinal)>=0))continue; // D2: general-forest vegetation cards off
                bool originalRoot=c.kind=="m_c1groot",floor=IsFloor(c.kind);
                var count=Result.kinds.Find(k=>k.kind==c.kind);if(count==null){count=new KindCount{kind=c.kind};Result.kinds.Add(count);}count.source++;
                var item=new Item{id=c.id,kind=c.kind,webX=c.x,webY=c.y,worldX=c.x/100,worldZ=-c.y/100};Result.items.Add(item);bool tree=c.kind.IndexOf("tree",StringComparison.OrdinalIgnoreCase)>=0||c.asset.IndexOf("r3_tree",StringComparison.OrdinalIgnoreCase)>=0;string semantic=tree?"Tree":c.kind.IndexOf("torch",StringComparison.OrdinalIgnoreCase)>=0?"Torch":c.kind.IndexOf("bridge",StringComparison.OrdinalIgnoreCase)>=0?"목교":"";
                if(semantic.Length>0){foreach(var obj in sourceObjects){if(obj.name.IndexOf(semantic,StringComparison.OrdinalIgnoreCase)<0&&!(tree&&(obj.name.Contains("거목")||obj.name.Contains("外곽"))))continue;var p=obj.position;if(Vector2.Distance(new Vector2(p.x,p.z),new Vector2(c.sourceX/100,-c.sourceY/100))<1.4f){item.kept3D=obj.name;break;}}}if(!string.IsNullOrEmpty(item.kept3D)){Result.duplicates++;count.duplicates++;continue;}
                RaycastHit hit;item.rayHit=Physics.Raycast(new Vector3(item.worldX,60,item.worldZ),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore);item.groundY=item.rayHit?hit.point.y:NativeRemodel3D.GroundY(item.worldX,item.worldZ);item.footY=item.groundY-.04f;item.gapCm=Mathf.Max(0,item.footY-item.groundY)*100;if(!item.rayHit||item.gapCm>3)Result.floating++;
                var root=new GameObject(c.id+" "+c.kind+" web XY");root.transform.SetParent(visuals.transform,false);root.transform.position=new Vector3(item.worldX,item.footY,item.worldZ);uint key=2166136261;foreach(char ch in c.id)key=(key^ch)*16777619;bool fern=c.kind=="vegetation";float scale=fern?.8f+(key%1001)/1000f*.4f:1;bool flip=fern&&(key&1)!=0;float yaw=fern?((key>>3)%1001)/1000f*34-17:0;root.transform.localScale=Vector3.one*scale;if(!floor)cards.Add(new CardPose{transform=root.transform,yaw=yaw});string art=fern&&!string.IsNullOrEmpty(c.variationAsset)?c.variationAsset:c.asset;item.variant=art;item.variationScale=scale;item.variationYaw=yaw;item.mirrored=flip;
                // A different fern painting has a different transparent bottom margin. Reuse its measured source pivot.
                var pivot=fern?(Array.Find(input.cards,source=>source.asset==art)??c):c;
                var mesh=WindMesh(c,pivot,flip);var body=root.AddComponent<MeshFilter>();body.sharedMesh=mesh;var renderer=root.AddComponent<MeshRenderer>();
                var a=new Material(opaque);a.SetTexture("_MainTex",Resources.Load<Texture2D>(art));a.SetTexture("_NormalTex",Resources.Load<Texture2D>(art+"_normal"));a.SetFloat("_Emission",c.emission);a.SetVector("_A2RWind",new Vector4(1/Mathf.Max(.1f,(1-pivot.footV)*c.height),(key%6283)*.001f,fern?c.height*scale*.15f:tree?Mathf.Clamp(c.sway,.05f,.09f):0,0));float value=fern?.92f+((key>>12)%1001)/1000f*.16f:1;float hue=fern?((key>>20)%1001)/1000f*.16f-.08f:0;item.variationValue=value;a.SetColor("_Tint",originalRoot?new Color(.82f,.76f,.58f,1):new Color(Mathf.Clamp(value*(1+hue*.5f),.92f,1.08f),value,Mathf.Clamp(value*(1-hue*.5f),.92f,1.08f),1));a.SetFloat("_Saturation",originalRoot?.45f:1);renderer.sharedMaterial=a;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;
                if(c.height<1)renderer.shadowCastingMode=ShadowCastingMode.Off;
                if(c.kind=="m_c1camp"&&A2RD3.On){a.SetFloat("_Saturation",.62f);a.SetColor("_Tint",new Color(.86f,.88f,.84f,1));if(A2RD4.On)a.SetFloat("_MossFix",1);} // D3: camp pink flesh / lime crates -> muted; green crates go moss-grey in CardCommon
                if(floor){var standingPosition=root.transform.position;item.webX=c.sourceX;item.webY=c.sourceY;item.worldX=c.sourceX/100;item.worldZ=-c.sourceY/100;item.groundY=FloorSurface(item.worldX,item.worldZ);item.footY=item.groundY+.028f;item.gapCm=2.8f;item.groundProjected=true;var position=new Vector3(item.worldX,item.footY,item.worldZ);var projected=FloorMesh(c,position);floorCards.Add(new FloorPose{transform=root.transform,filter=body,standing=mesh,projected=projected,standingPosition=standingPosition,projectedPosition=position});body.sharedMesh=projected;root.transform.position=position;a.SetVector("_A2RWind",Vector4.zero);a.renderQueue=2480;renderer.shadowCastingMode=ShadowCastingMode.Off;item.added=true;Result.added++;count.added++;continue;}
                var b=new Material(transparent);b.CopyPropertiesFromMaterial(a);b.renderQueue=3000;var copy=new GameObject("A2R card faded portion");copy.transform.SetParent(root.transform,false);copy.AddComponent<MeshFilter>().sharedMesh=mesh;var companion=copy.AddComponent<MeshRenderer>();companion.sharedMaterial=b;companion.shadowCastingMode=ShadowCastingMode.Off;occlusion.Register(renderer,companion,c.height>=1.1f,c.height>=1.1f);if(c.kind=="m_c1camp"){occlusion.ProtectLandmark(renderer);CampFoot=root.transform.position;}
                var ao=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(ao.GetComponent<Collider>());ao.name="A2R web foot AO";ao.transform.SetParent(visuals.transform,true);ao.transform.SetPositionAndRotation(new Vector3(item.worldX,item.groundY+.012f,item.worldZ),Quaternion.Euler(90,0,0));float width=Mathf.Clamp(c.width*(c.kind=="m_c1camp"&&A2RD3.On?.62f:.42f),.25f,c.kind=="m_c1camp"&&A2RD3.On?3.4f:2.3f);ao.transform.localScale=new Vector3(width,width*.40f,1);var ar=ao.GetComponent<MeshRenderer>();ar.sharedMaterial=new Material(Resources.Load<Shader>("Shaders/HD2DContact"));ar.sharedMaterial.SetFloat("_Opacity",.8f);ar.shadowCastingMode=ShadowCastingMode.Off;
                item.added=true;Result.added++;count.added++;
            }
            foreach(var key in new[]{"_ForestMap","_SoilMap","_RootMap"})originalTextures[key]=ground.GetTexture(key);if(!string.IsNullOrEmpty(A2RHumanSave.Root))System.IO.File.WriteAllText(System.IO.Path.Combine(A2RHumanSave.Root,"web-assets-receipt.json"),JsonUtility.ToJson(Result,true));Debug.Log("[A2R] Full C10 cards="+Result.sourceCards+" added="+Result.added+" duplicates="+Result.duplicates+" ground="+Result.groundTiles+" floating="+Result.floating);SetLook(false);
        }
        Texture2D waterDomain;
        static bool IsFloor(string kind){return kind=="m_c1groot"||kind=="m_c1gtoxicf"||kind=="m_c1pool"||kind=="pit_poison";}
        static float FloorSurface(float x,float z){return Mathf.Max(NativeRemodel3D.GroundY(x,z),-.45f);}
        static Mesh FloorMesh(Card c,Vector3 origin){const int n=32;var v=new List<Vector3>();var uv=new List<Vector2>();var indices=new List<int>();for(int y=0;y<=n;y++)for(int x=0;x<=n;x++){float u=x/(float)n,w=y/(float)n;float wx=origin.x+(u-.5f)*c.width,wz=origin.z+(w-.5f)*c.height;v.Add(new Vector3(wx,FloorSurface(wx,wz)+.028f,wz)-origin);uv.Add(new Vector2(u,w));}for(int y=0;y<n;y++)for(int x=0;x<n;x++){int a=y*(n+1)+x;indices.AddRange(new[]{a,a+n+1,a+1,a+1,a+n+1,a+n+2});}var mesh=new Mesh{name=c.id+" original web rectangle terrain projection"};mesh.SetVertices(v);mesh.SetUVs(0,uv);mesh.SetTriangles(indices,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();return mesh;}
        // QA-only geometry comparison; normal play always starts projected.
        public void SetFloorProjection(bool on){foreach(var p in floorCards){p.filter.sharedMesh=on?p.projected:p.standing;p.transform.SetPositionAndRotation(on?p.projectedPosition:p.standingPosition,on?Quaternion.identity:Quaternion.Euler(0,viewer.transform.eulerAngles.y,0));}}
        void BuildWaterDomain(){const int n=512;waterDomain=new Texture2D(n,n,TextureFormat.R8,false,true){name="A2R actual terrain below existing water plane",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var pixels=new byte[n*n];for(int y=0;y<n;y++)for(int x=0;x<n;x++){float wx=(x+.5f)*80/n,wz=-(y+.5f)*80/n;pixels[y*n+x]=NativeRemodel3D.Field.TerrainHeight(wx,wz)<-.46f?(byte)255:(byte)0;}waterDomain.SetPixelData(pixels,0);waterDomain.Apply(false,true);Shader.SetGlobalTexture("_A2RWaterDomain",waterDomain);Shader.SetGlobalFloat("_A2RWaterDomainReady",1);}
        void OnDestroy(){if(waterDomain!=null)Destroy(waterDomain);Shader.SetGlobalFloat("_A2RWaterDomainReady",0);}
        static Mesh WindMesh(Card c,Card pivot,bool flip)
        {
            var vertices=new List<Vector3>();var uv=new List<Vector2>();var triangles=new List<int>();var rows=new List<float>{0};if(pivot.footV>.0001f)rows.Add(pivot.footV);for(int y=1;y<=8;y++)rows.Add(pivot.footV+(1-pivot.footV)*y/8f);
            for(int y=0;y<rows.Count;y++)for(int x=0;x<=4;x++){float u=x/4f;vertices.Add(new Vector3((u-pivot.footU)*c.width*(flip?-1:1),(rows[y]-pivot.footV)*c.height,0));uv.Add(new Vector2(u,rows[y]));}
            for(int y=0;y+1<rows.Count;y++)for(int x=0;x<4;x++){int a=y*5+x;triangles.AddRange(new[]{a,a+5,a+1,a+1,a+5,a+6});}var mesh=new Mesh{name=c.id+" root-row pinned web card"};mesh.SetVertices(vertices);mesh.SetUVs(0,uv);mesh.SetTriangles(triangles,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();var bounds=mesh.bounds;bounds.Expand(new Vector3(1.2f,0,1.2f));mesh.bounds=bounds;return mesh;
        }
        // Same painted mesh/pivot/material as the in-game card; used only by the isolated r15 comparison stage.
        public GameObject CreateR15ReviewCard(Card c,Transform parent,float yaw)
        {
            if(!NativeQaSandbox.Active)throw new InvalidOperationException("R15 card review requires save isolation");
            var go=new GameObject("A2R r15 original painting "+c.id);go.transform.SetParent(parent,false);
            go.transform.rotation=Quaternion.Euler(0,yaw,0);go.AddComponent<MeshFilter>().sharedMesh=WindMesh(c,c,false);
            var material=new Material(Resources.Load<Shader>("A2R/CardOpaque"));material.SetTexture("_MainTex",Resources.Load<Texture2D>(c.asset));material.SetTexture("_NormalTex",Resources.Load<Texture2D>(c.asset+"_normal"));material.SetFloat("_Emission",c.emission);material.SetColor("_Tint",Color.white);material.SetFloat("_Saturation",1);material.SetVector("_A2RWind",Vector4.zero);
            var renderer=go.AddComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=c.height<1?ShadowCastingMode.Off:ShadowCastingMode.On;renderer.receiveShadows=true;return go;
        }
        public void SetLook(bool on)
        {
            Applied=on;visuals.SetActive(on);foreach(var p in originalTextures)ground.SetTexture(p.Key,on?Resources.Load<Texture2D>("A2R/C10/Art/"+(p.Key=="_ForestMap"?"r3_litter":p.Key=="_SoilMap"?"r3_soil":A2RClean.HellRot?"r3_soil":"r4_tex_mud")):p.Value);water.shader=on?Resources.Load<Shader>("A2R/ToxicRiver"):waterOriginal;water.SetFloat("_A2RWebMix",on?1:0);if(on||waterSpecularOff)water.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");else water.DisableKeyword("_SPECULARHIGHLIGHTS_OFF");if(on)water.SetTexture("_A2RWebTex",Resources.Load<Texture2D>("A2R/C10/Art/r3_water"));for(int i=0;i<originals.Count;i++)if(originals[i]!=null)originals[i].enabled=on?false:originalEnabled[i];
        }
        void LateUpdate(){if(!Applied)return;foreach(var sr in originals)if(sr!=null)sr.enabled=false;float yaw=viewer.transform.eulerAngles.y;foreach(var pose in cards)if(pose.transform!=null)pose.transform.rotation=Quaternion.Euler(0,yaw+pose.yaw,0);}
    }
}
