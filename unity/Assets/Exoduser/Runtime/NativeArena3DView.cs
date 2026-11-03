using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeArena3DView:IDisposable
    {
        readonly GameObject root;
        readonly Camera camera;
        readonly List<GameObject> pillars=new List<GameObject>();
        readonly List<Vector3> pillarScales=new List<Vector3>();
        readonly List<Vector3> pillarLast=new List<Vector3>();
        readonly List<Material> materials=new List<Material>();
        readonly Mesh mesh;
        NativeArenaOcclusion occlusion;
        GameObject treeA,treeB,stump,rock;
        BossArenaLayout layout;
        public static string PreparePhase
        {
            get;
            private set;
        }
        ="idle";
        public float ShaderWarmupMs
        {
            get;
            private set;
        }
        public float SyncCpuMs
        {
            get;
            private set;
        }
        public bool Ready
        {
            get;
            private set;
        }
        public float PrepareMs
        {
            get;
            private set;
        }
        public int MeshBuilds
        {
            get;
            private set;
        }
        public int Faded
        {
            get
            {
                return occlusion==null?0:occlusion.Faded;
            }
        }
        public int NearestDraws
        {
            get
            {
                return occlusion==null?0:occlusion.Draws;
            }
        }
        public BossArenaLayout Layout
        {
            get
            {
                return layout;
            }
        }
        public NativeArena3DView(Transform parent,BossArenaLayout arena,Camera viewer,Material fieldWater=null)
        {
            layout=arena;
            camera=viewer;
            sourceWater=fieldWater;
            root=new GameObject("RB1-8 forest arena");
            root.transform.SetParent(parent,false);
            root.SetActive(false);
            try
            {
            var plan=NativeArena3DPlan.Build(layout);
            var vertices=new Vector3[plan.Vertices.Count];
            var uv=new Vector2[vertices.Length];
            for(int i=0;i<vertices.Length;i++)
            {
                var v=plan.Vertices[i];
                vertices[i]=new Vector3(v.X,v.Y,v.Z);
                uv[i]=new Vector2(v.X/4,v.Z/4);
            }
            mesh=new Mesh
            {
                name="Arena sealed ground 4 vertices"
            };
            mesh.vertices=vertices;
            mesh.uv=uv;
            mesh.SetTriangles(plan.Triangles,0);
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();
            root.AddComponent<MeshFilter>().sharedMesh=mesh;
            var ground=root.AddComponent<MeshRenderer>();
            ground.sharedMaterial=CreateGroundMaterial();
            ground.receiveShadows=true;
            MeshBuilds=1;
            }
            catch { Dispose();throw; }
        }
        GameObject Asset(string name)
        {
            var asset=Resources.Load<GameObject>("Art/map/a2/r3/Models/"+name);
            if(asset==null)throw new InvalidOperationException("Arena forest missing "+name);
            return asset;
        }
        GameObject Place(GameObject asset,string name,Vector3 position,float yaw,float width,float height)
        {
            var go=UnityEngine.Object.Instantiate(asset,root.transform);
            go.name=name;
            go.transform.SetPositionAndRotation(position,Quaternion.Euler(0,yaw,0));
            var rs=go.GetComponentsInChildren<MeshRenderer>(true);
            if(rs.Length==0)throw new InvalidOperationException("Arena forest empty "+name);
            var b=rs[0].bounds;
            foreach(var r in rs)
            {
                b.Encapsulate(r.bounds);
                r.shadowCastingMode=ShadowCastingMode.On;
                r.receiveShadows=true;
            }
            if(b.size.y<=.0001f)throw new InvalidOperationException("Arena asset bounds invalid");
            var scale=go.transform.localScale;
            go.transform.localScale=Vector3.Scale(scale,new Vector3(width/Mathf.Max(.01f,b.size.x),height/b.size.y,width/Mathf.Max(.01f,b.size.z)));
            b=rs[0].bounds;
            foreach(var r in rs)b.Encapsulate(r.bounds);
            go.transform.position+=new Vector3(position.x-b.center.x,position.y-b.min.y-.04f,position.z-b.center.z);
            foreach(var c in go.GetComponentsInChildren<Collider>(true))
            {
                c.enabled=false;
                UnityEngine.Object.Destroy(c);
            }
            return go;
        }
        public IEnumerator Prewarm()
        {
            PreparePhase="arena-resources";
            _ = NativeArenaActorMetrics.HeroIdleWorld;
            _ = NativeArenaActorMetrics.BossIdleFraction;
            var timer=System.Diagnostics.Stopwatch.StartNew();
            treeA=Asset("RF3_Ancient_Tree_A");
            treeB=Asset("RF3_Ancient_Tree_B");
            stump=Asset("RF3_Root_Stump");
            rock=Asset("RF3_Moss_Rock_2");
            PrepareMs+=(float)timer.Elapsed.TotalMilliseconds;
            yield return null;
            int n=0;
            PreparePhase="forest-instances";
            foreach(var p in NativeArena3DPlan.Forest(layout))
            {
                timer.Restart();
                Place((n&1)==0?treeA:treeB,"Arena outer Tree",new Vector3(p.X,0,p.Z),p.Yaw,4.6f+(n%3)*.4f,p.Height);
                Place((n%3)==0?rock:stump,"Arena inner Root",new Vector3(p.X,0,p.Z+(p.South?2.7f:0)),p.Yaw+73,3.6f,p.South?.55f:1.5f+(n%3)*.3f);
                PrepareMs+=(float)timer.Elapsed.TotalMilliseconds;
                if(++n%4==0)yield return null;
            }
            timer.Restart();
            for(int i=0;i<DruidRemodelData.PillarCount;i++)
            {
                var go=Place(stump,"Arena Core pillar Stump",Vector3.zero,i*97,1.6f,3.2f);
                pillars.Add(go);
                pillarScales.Add(go.transform.localScale);
                pillarLast.Add(new Vector3(float.NaN,0,0));
                go.SetActive(false);
            }
            occlusion=new NativeArenaOcclusion(root.transform,camera);
            CreateTorches();
            CreateChannel();
            NativeGroundSkillProjection.RegisterReceiver(root.GetComponent<MeshFilter>());
            PrepareMs+=(float)timer.Elapsed.TotalMilliseconds;
            yield return null;
            // Compile the exact arena shader paths while the scene is loading, never in Sync/entry/exit.
            PreparePhase="shader-variants";
            timer.Restart();
            var variants=new ShaderVariantCollection();
            foreach(string resource in new[]
            {
                "ArenaOcclusion/LitOpaque","ArenaOcclusion/LitFade"
            }
            )
            {
                var s=Resources.Load<Shader>(resource);
                foreach(string[] keys in new[]
                {
                    new string[0],new[]
                    {
                        "_NORMALMAP"
                    },new[]
                    {
                        "_MAIN_LIGHT_SHADOWS"
                    },new[]
                    {
                        "_NORMALMAP","_MAIN_LIGHT_SHADOWS"
                    },new[]
                    {
                        "_MAIN_LIGHT_SHADOWS_CASCADE"
                    },new[]
                    {
                        "_NORMALMAP","_MAIN_LIGHT_SHADOWS_CASCADE"
                    }
                }
                )variants.Add(new ShaderVariantCollection.ShaderVariant(s,PassType.ScriptableRenderPipeline,keys));
            }
            foreach(var shader in new[]{groundMaterial.shader})
                foreach(var keys in new[]{new string[0],new[]{"_MAIN_LIGHT_SHADOWS"},new[]{"_MAIN_LIGHT_SHADOWS_CASCADE"}})
                    variants.Add(new ShaderVariantCollection.ShaderVariant(shader,PassType.ScriptableRenderPipeline,keys));
            variants.WarmUp();
            UnityEngine.Object.Destroy(variants);
            ShaderWarmupMs=(float)timer.Elapsed.TotalMilliseconds;
            PrepareMs+=ShaderWarmupMs;
            PreparePhase="ready";
            Ready=true;
            Debug.Log("[RB1-8] prewarm ready cpuMs="+PrepareMs+" meshBuilds="+MeshBuilds+" groundVertices=4 groves="+n+" pillars="+pillars.Count+" shaderWarmup=requested GPU verdict=Mac");
        }
        public bool Bind(BossArenaLayout arena)
        {
            if(!Ready||arena==null||arena.Stage!=layout.Stage||arena.Type!=layout.Type)return false;
            layout=arena;
            return true;
        }
        public void Sync(Simulation sim)
        {
            var timer=System.Diagnostics.Stopwatch.StartNew();
            var data=sim.DruidPillars;
            for(int i=0;i<pillars.Count;i++)
            {
                bool on=i<data.Count;
                pillars[i].SetActive(on);
                if(!on)continue;
                var p=data[i];
                var key=new Vector3((float)p.X,(float)p.Y,(float)p.R);
                if(pillarLast[i]==key)continue;
                pillarLast[i]=key;
                var go=pillars[i];
                go.transform.localScale=Vector3.Scale(pillarScales[i],new Vector3((float)p.R/80,1,(float)p.R/80));
                var rs=go.GetComponentsInChildren<MeshRenderer>();
                var b=rs[0].bounds;
                foreach(var r in rs)b.Encapsulate(r.bounds);
                go.transform.position+=new Vector3((float)p.X/100-b.center.x,-b.min.y-.04f,-(float)p.Y/100-b.center.z);
            }
            SyncCpuMs=(float)timer.Elapsed.TotalMilliseconds;
        }
        public void Late(Vector3 hero)
        {
            occlusion?.Step(hero);
            TorchLate();
        }
        public void SetActive(bool on)
        {
            root.SetActive(on&&Ready);
            occlusion?.SetActive(on&&Ready);
        }
        public void Dispose()
        {
            Ready=false;
            DisposeTorches();
            occlusion?.Dispose();
            root.SetActive(false);
            UnityEngine.Object.Destroy(root);
            UnityEngine.Object.Destroy(mesh);
            foreach(var m in materials)UnityEngine.Object.Destroy(m);
        }
    }
}
