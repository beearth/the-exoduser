using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // 영웅을 가리는 3D 물체를 통째로 부드럽게 반투명으로 만든다. 표현 전용이고 Core·보행·충돌은 건드리지 않는다.
    // 원본 렌더러는 그림자만 남기고, 같은 메시의 복제본이 반투명 셰이더로 그린다. 디더링을 쓰지 않는다.
    // 나무와 거기 붙은 이끼·버섯은 한 묶음으로 처리한다. 바닥처럼 납작한 메시는 가림 판정에 넣지 않는다.
    [DefaultExecutionOrder(26000)]
    public sealed class A2SightFade:MonoBehaviour
    {
        const float MinHeight=.55f,MinUpright=.18f,FadeSeconds=.16f,HeroHeight=1.61f;
        const int MaxGroupSize=24;
        sealed class Member{public MeshRenderer body,clone;public ShadowCastingMode shadow;public bool cutout,blocks;}
        sealed class Group{public readonly List<Member> members=new List<Member>();public float amount;}
        static readonly int FadeId=Shader.PropertyToID("_A2Fade");
        readonly List<Group> groups=new List<Group>();
        MaterialPropertyBlock blockValue;
        // Initialize on use: Unity can construct components on the loading thread.
        MaterialPropertyBlock block { get { return blockValue ?? (blockValue=new MaterialPropertyBlock()); } }
        Camera viewer;Func<Vector3> hero;Shader shader;
        public int FadedCount{get;private set;}
        public int Candidates{get;private set;}

        public void Initialize(Camera camera,Func<Vector3> feet,GameObject[] sceneRoots)
        {
            viewer=camera;hero=feet;shader=Shader.Find("EXODUSER/A2SightFade");
            if(shader==null){Debug.LogError("[A2 가림] 셰이더 누락");enabled=false;return;}
            var byOwner=new Dictionary<Transform,List<Member>>();var seen=new HashSet<MeshRenderer>();
            foreach(var root in sceneRoots)if(root!=null)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
            {
                if(!seen.Add(r)||!r.enabled)continue;
                var member=MakeMember(r);if(member==null)continue;
                var owner=OwnerOf(r.transform);
                if(!byOwner.TryGetValue(owner,out var list)){list=new List<Member>();byOwner[owner]=list;}
                list.Add(member);
            }
            // 나무에 따로 붙인 이끼·버섯은 그 나무와 같은 묶음으로 옮긴다.
            var tall=new List<KeyValuePair<Member,List<Member>>>();
            foreach(var list in byOwner.Values)foreach(var m in list)if(m.blocks)tall.Add(new KeyValuePair<Member,List<Member>>(m,list));
            foreach(var list in byOwner.Values)
            {
                if(list.Exists(m=>m.blocks))continue;
                foreach(var small in list)
                {
                    var center=small.body.bounds.center;var size=small.body.bounds.size;
                    if(size.magnitude>4)continue;
                    foreach(var pair in tall)
                    {
                        var b=pair.Key.body.bounds;b.Expand(new Vector3(.6f,.6f,.6f));
                        if(b.Contains(center)){pair.Value.Add(small);break;}
                    }
                }
            }
            foreach(var list in byOwner.Values)
            {
                if(!list.Exists(m=>m.blocks))continue;
                if(list.Count>MaxGroupSize){foreach(var m in list)if(m.blocks){var one=new Group();one.members.Add(m);groups.Add(one);Candidates++;}continue;}
                var g=new Group();g.members.AddRange(list);groups.Add(g);Candidates+=list.Count;
            }
            Debug.Log("[A2 가림] 묶음 "+groups.Count+" 렌더러 "+Candidates);
        }

        Transform OwnerOf(Transform t)
        {
            var owner=t;
            for(var p=t;p!=null;p=p.parent){if(p.parent==transform)return p;owner=p;}
            return t;
        }

        static Member MakeMember(MeshRenderer r)
        {
            if(r.sharedMaterial==null||r.bounds.size.x>30||r.bounds.size.z>30||IsWalkSurface(r.transform))return null;
            if(r.name.EndsWith("_LOD1",StringComparison.Ordinal)||r.name.EndsWith("_LOD2",StringComparison.Ordinal))return null;
            var filter=r.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null)return null;
            string shaderName=r.sharedMaterial.shader!=null?r.sharedMaterial.shader.name:"";
            bool cutout=shaderName=="EXODUSER/A2HangingMoss";
            // 무늬 맵이 있는 소품만 복제본으로 그린다. 맵이 없으면 흰 판이 되므로 작은 장식은 숨기고 큰 것은 제외한다.
            bool noMap=!r.sharedMaterial.HasProperty("_BaseMap")||r.sharedMaterial.GetTexture("_BaseMap")==null;
            if(noMap){if(r.bounds.size.magnitude>4)return null;cutout=true;}
            if(shaderName=="EXODUSER/HellGroundPBR"||shaderName=="EXODUSER/A2RootSurface"||shaderName.StartsWith("EXODUSER/A2Toxic",StringComparison.Ordinal)||shaderName.StartsWith("EXODUSER/GroundSkill",StringComparison.Ordinal))return null;
            var size=r.bounds.size;
            bool blocks=!cutout&&size.y>=MinHeight&&size.y/Mathf.Max(.01f,Mathf.Max(size.x,size.z))>=MinUpright;
            return new Member{body=r,shadow=r.shadowCastingMode,cutout=cutout,blocks=blocks};
        }

        // 영웅이 위에 올라서는 다리는 대상이 아니다.
        static bool IsWalkSurface(Transform t)
        {
            for(;t!=null;t=t.parent)if(t.name.Contains("목교")||t.name.Contains("Bridge"))return true;
            return false;
        }

        void LateUpdate()
        {
            if(viewer==null||hero==null)return;
            var feet=hero();var head=feet+Vector3.up*HeroHeight;var mid=feet+Vector3.up*(HeroHeight*.5f);
            var eye=viewer.transform.position;int faded=0;float step=Time.unscaledDeltaTime/FadeSeconds;
            foreach(var g in groups)
            {
                bool hit=false;
                foreach(var m in g.members)
                {
                    if(m.body==null||!m.blocks)continue;
                    var b=m.body.bounds;
                    if(Covers(b,eye,feet)||Covers(b,eye,mid)||Covers(b,eye,head)){hit=true;break;}
                }
                if(!hit&&g.amount<=0)continue;
                g.amount=Mathf.MoveTowards(g.amount,hit?1:0,step);
                foreach(var m in g.members)if(m.body!=null)Apply(m,g.amount);
                if(g.amount>0)faded++;
            }
            FadedCount=faded;
        }

        static bool Covers(Bounds b,Vector3 eye,Vector3 target)
        {
            var dir=target-eye;float dist=dir.magnitude;
            return b.IntersectRay(new Ray(eye,dir/dist),out float enter)&&enter<dist-.15f;
        }

        void Apply(Member m,float amount)
        {
            // 알파 잘림 재질(늘어진 이끼)은 반투명 복제본으로 그리면 사각형이 보이므로 가릴 때 숨긴다.
            if(m.cutout){m.body.forceRenderingOff=amount>.5f;return;}
            bool on=amount>0;
            if(on&&m.clone==null)MakeClone(m);
            if(m.clone==null)return;
            if(m.clone.enabled!=on)
            {
                m.clone.enabled=on;
                m.body.shadowCastingMode=on?ShadowCastingMode.ShadowsOnly:m.shadow;
            }
            if(!on)return;
            m.body.GetPropertyBlock(block);block.SetFloat(FadeId,amount);m.clone.SetPropertyBlock(block);
        }

        void MakeClone(Member e)
        {
            var go=new GameObject("A2 가림 반투명");go.transform.SetParent(e.body.transform,false);go.layer=e.body.gameObject.layer;
            go.AddComponent<MeshFilter>().sharedMesh=e.body.GetComponent<MeshFilter>().sharedMesh;
            var clone=go.AddComponent<MeshRenderer>();
            // 스프라이트의 정렬 순서는 큐보다 먼저 적용된다. 액터 뒤에 그려야 깊이가 액터를 막지 않는다.
            clone.sortingOrder=short.MaxValue;clone.shadowCastingMode=ShadowCastingMode.Off;clone.receiveShadows=true;clone.lightProbeUsage=LightProbeUsage.Off;clone.reflectionProbeUsage=ReflectionProbeUsage.Off;
            var source=e.body.sharedMaterials;var mats=new Material[source.Length];
            for(int i=0;i<source.Length;i++)
            {
                var m=new Material(shader){name="A2 가림 반투명 재질"};var s=source[i];
                if(s!=null)
                {
                    if(s.HasProperty("_BaseMap")&&s.GetTexture("_BaseMap")!=null){m.SetTexture("_BaseMap",s.GetTexture("_BaseMap"));m.SetTextureScale("_BaseMap",s.GetTextureScale("_BaseMap"));m.SetTextureOffset("_BaseMap",s.GetTextureOffset("_BaseMap"));}
                    if(s.HasProperty("_BaseColor"))m.SetColor("_BaseColor",s.GetColor("_BaseColor"));
                    if(s.HasProperty("_BumpMap")&&s.GetTexture("_BumpMap")!=null)m.SetTexture("_BumpMap",s.GetTexture("_BumpMap"));
                }
                mats[i]=NativeGame.TrackRuntimeObject(m);
            }
            clone.sharedMaterials=mats;clone.enabled=false;e.clone=clone;
        }

        void OnDestroy()
        {
            foreach(var g in groups)foreach(var m in g.members)if(m.body!=null){m.body.shadowCastingMode=m.shadow;m.body.forceRenderingOff=false;}
        }
    }
}
