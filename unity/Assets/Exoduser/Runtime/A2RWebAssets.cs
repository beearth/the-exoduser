using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(24000)]
    public sealed class A2RWebAssets : MonoBehaviour
    {
        [Serializable] public sealed class Card {public string id,kind,asset;public float x,y,sourceX,sourceY,width,height,footU,footV,emission,sway;}
        [Serializable] public sealed class Tile {public string asset;public int x,y;}
        [Serializable] public sealed class River {public float x,y,width;}
        [Serializable] sealed class Input {public Card[] cards;public Tile[] groundTiles;public River[] riverPoints;}
        [Serializable] public sealed class Item {public string id,kind,kept3D;public float webX,webY,worldX,worldZ,groundY,footY,gapCm;public bool rayHit,added;}
        [Serializable] public sealed class KindCount {public string kind;public int source,added,duplicates;}
        [Serializable] public sealed class Receipt {public string source="a5c287157 C10 layout142 + R5 unique14 + foreground27; all64 ground paintings. Original drawX/footY and alpha-foot offset, no SourceMap intersection filter. Core/terrain/camera/actors unchanged.";public int sourceCards,added,duplicates,floating,groundTiles,moatRibbons;public List<KindCount> kinds=new List<KindCount>();public List<Item> items=new List<Item>();}
        public Receipt Result=new Receipt();public bool Applied {get;private set;}
        readonly List<Transform> cards=new List<Transform>();readonly List<SpriteRenderer> originals=new List<SpriteRenderer>();readonly List<bool> originalEnabled=new List<bool>();
        Camera viewer;GameObject visuals;Material ground,water;bool waterSpecularOff;readonly Dictionary<string,Texture> originalTextures=new Dictionary<string,Texture>();A2ROcclusion occlusion;
        public void Initialize(Transform world,Camera camera,IEnumerable<SpriteRenderer> existing,Material soil,Material swamp,A2ROcclusion fade)
        {
            viewer=camera;ground=soil;water=swamp;waterSpecularOff=water.IsKeywordEnabled("_SPECULARHIGHLIGHTS_OFF");occlusion=fade;foreach(var sr in existing){originals.Add(sr);originalEnabled.Add(sr.enabled);}visuals=new GameObject("A2R existing web assets at original XY");visuals.transform.SetParent(world,true);
            foreach(var name in new[]{"A2 전체 필드 지면","A2 시작 목교"}){var target=world.Find(name);if(target==null)continue;foreach(var filter in target.GetComponentsInChildren<MeshFilter>()){if(filter.sharedMesh==null)continue;var query=new GameObject("A2R visual surface ray query");query.transform.SetParent(filter.transform,false);query.layer=28;query.AddComponent<MeshCollider>().sharedMesh=filter.sharedMesh;}}
            Physics.SyncTransforms();var input=JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);var sourceObjects=new List<Transform>();foreach(Transform child in world)sourceObjects.Add(child);
            Shader opaque=Resources.Load<Shader>("A2R/CardOpaque"),transparent=Resources.Load<Shader>("A2R/CardFade");if(opaque==null||transparent==null)throw new InvalidOperationException("A2R web card shaders missing");
            Result.sourceCards=input.cards.Length;Result.groundTiles=A2RGroundPainting.Build(visuals.transform,input.groundTiles,input.riverPoints,NativeGame.Instance.Map.CanMove);Result.moatRibbons=input.riverPoints!=null&&input.riverPoints.Length>1?1:0;
            foreach(var c in input.cards)
            {
                var count=Result.kinds.Find(k=>k.kind==c.kind);if(count==null){count=new KindCount{kind=c.kind};Result.kinds.Add(count);}count.source++;
                var item=new Item{id=c.id,kind=c.kind,webX=c.x,webY=c.y,worldX=c.x/100,worldZ=-c.y/100};Result.items.Add(item);bool tree=c.kind.IndexOf("tree",StringComparison.OrdinalIgnoreCase)>=0||c.asset.IndexOf("r3_tree",StringComparison.OrdinalIgnoreCase)>=0;string semantic=tree?"Tree":c.kind.IndexOf("torch",StringComparison.OrdinalIgnoreCase)>=0?"Torch":c.kind.IndexOf("bridge",StringComparison.OrdinalIgnoreCase)>=0?"목교":"";
                if(semantic.Length>0){foreach(var obj in sourceObjects){if(obj.name.IndexOf(semantic,StringComparison.OrdinalIgnoreCase)<0&&!(tree&&(obj.name.Contains("거목")||obj.name.Contains("外곽"))))continue;var p=obj.position;if(Vector2.Distance(new Vector2(p.x,p.z),new Vector2(c.sourceX/100,-c.sourceY/100))<1.4f){item.kept3D=obj.name;break;}}}if(!string.IsNullOrEmpty(item.kept3D)){Result.duplicates++;count.duplicates++;continue;}
                RaycastHit hit;item.rayHit=Physics.Raycast(new Vector3(item.worldX,60,item.worldZ),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore);item.groundY=item.rayHit?hit.point.y:NativeRemodel3D.GroundY(item.worldX,item.worldZ);item.footY=item.groundY-.04f;item.gapCm=Mathf.Max(0,item.footY-item.groundY)*100;if(!item.rayHit||item.gapCm>3)Result.floating++;
                var root=new GameObject(c.id+" web XY");root.transform.SetParent(visuals.transform,false);root.transform.position=new Vector3(item.worldX,item.footY,item.worldZ);cards.Add(root.transform);
                var mesh=new Mesh{name=c.id+" opaque-foot pivot"};mesh.vertices=new[]{new Vector3(-c.footU*c.width,-c.footV*c.height,0),new Vector3((1-c.footU)*c.width,-c.footV*c.height,0),new Vector3(-c.footU*c.width,(1-c.footV)*c.height,0),new Vector3((1-c.footU)*c.width,(1-c.footV)*c.height,0)};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateNormals();mesh.RecalculateTangents();var body=root.AddComponent<MeshFilter>();body.sharedMesh=mesh;var renderer=root.AddComponent<MeshRenderer>();
                var a=new Material(opaque);a.SetTexture("_MainTex",Resources.Load<Texture2D>(c.asset));a.SetTexture("_NormalTex",Resources.Load<Texture2D>(c.asset+"_normal"));a.SetFloat("_Emission",c.emission);renderer.sharedMaterial=a;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;
                var b=new Material(transparent);b.CopyPropertiesFromMaterial(a);b.renderQueue=3000;var copy=new GameObject("A2R card faded portion");copy.transform.SetParent(root.transform,false);copy.AddComponent<MeshFilter>().sharedMesh=mesh;var companion=copy.AddComponent<MeshRenderer>();companion.sharedMaterial=b;companion.shadowCastingMode=ShadowCastingMode.Off;occlusion.Register(renderer,companion,c.width>1.2f||c.height>1.2f);if(c.kind=="m_c1camp")occlusion.ProtectLandmark(renderer);
                var ao=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(ao.GetComponent<Collider>());ao.name="A2R web foot AO";ao.transform.SetParent(visuals.transform,true);ao.transform.SetPositionAndRotation(new Vector3(item.worldX,item.groundY+.012f,item.worldZ),Quaternion.Euler(90,0,0));float width=Mathf.Clamp(c.width*.42f,.25f,2.3f);ao.transform.localScale=new Vector3(width,width*.40f,1);var ar=ao.GetComponent<MeshRenderer>();ar.sharedMaterial=new Material(Resources.Load<Shader>("Shaders/HD2DContact"));ar.sharedMaterial.SetFloat("_Opacity",.8f);ar.shadowCastingMode=ShadowCastingMode.Off;
                item.added=true;Result.added++;count.added++;
            }
            foreach(var key in new[]{"_ForestMap","_SoilMap","_RootMap"})originalTextures[key]=ground.GetTexture(key);if(!string.IsNullOrEmpty(A2RHumanSave.Root))System.IO.File.WriteAllText(System.IO.Path.Combine(A2RHumanSave.Root,"web-assets-receipt.json"),JsonUtility.ToJson(Result,true));Debug.Log("[A2R] Full C10 cards="+Result.sourceCards+" added="+Result.added+" duplicates="+Result.duplicates+" ground="+Result.groundTiles+" floating="+Result.floating);SetLook(false);
        }
        public void SetLook(bool on)
        {
            Applied=on;visuals.SetActive(on);foreach(var p in originalTextures)ground.SetTexture(p.Key,on?Resources.Load<Texture2D>("A2R/C10/Art/"+(p.Key=="_ForestMap"?"r3_litter":p.Key=="_SoilMap"?"r3_soil":"r4_tex_mud")):p.Value);water.SetFloat("_A2RWebMix",on?1:0);if(on||waterSpecularOff)water.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");else water.DisableKeyword("_SPECULARHIGHLIGHTS_OFF");if(on)water.SetTexture("_A2RWebTex",Resources.Load<Texture2D>("A2R/C10/Art/r3_water"));for(int i=0;i<originals.Count;i++)if(originals[i]!=null)originals[i].enabled=on?false:originalEnabled[i];
        }
        void LateUpdate(){if(!Applied)return;foreach(var sr in originals)if(sr!=null)sr.enabled=false;float yaw=viewer.transform.eulerAngles.y;foreach(var t in cards)if(t!=null)t.rotation=Quaternion.Euler(0,yaw,0);}
    }
}
