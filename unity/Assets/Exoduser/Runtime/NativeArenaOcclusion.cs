using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // A2R nearest-surface mask, isolated globals/material ownership for the arena.
    public sealed class NativeArenaOcclusion:IDisposable
    {
        sealed class Entry
        {
            public MeshRenderer body,fade;
            public Mesh mesh;
            public Material[] opaque;
            public float progress,hold;
        }
        readonly List<Entry> entries=new List<Entry>();
        readonly List<Material> owned=new List<Material>();
        readonly MaterialPropertyBlock block=new MaterialPropertyBlock();
        readonly Camera camera;
        RenderTexture nearest;
        bool active;
        public int Faded
        {
            get;
            private set;
        }
        public int Draws
        {
            get;
            private set;
        }
        public NativeArenaOcclusion(Transform root,Camera view)
        {
            camera=view;
            var opaque=Resources.Load<Shader>("ArenaOcclusion/LitOpaque");
            var fade=Resources.Load<Shader>("ArenaOcclusion/LitFade");
            if(opaque==null||fade==null)throw new InvalidOperationException("arena occlusion shader missing");
            var cache=new Dictionary<Material,Material[]>();
            var sources=root.GetComponentsInChildren<MeshRenderer>(true);
            foreach(var r in sources)
            {
                if(r.transform==root)continue;
                var filter=r.GetComponent<MeshFilter>();
                if(filter==null||filter.sharedMesh==null)continue;
                var a=r.sharedMaterials;
                var b=new Material[a.Length];
                for(int i=0;i<a.Length;i++)
                {
                    var old=a[i];
                    if(old==null)continue;
                    Material[] pair;
                    if(!cache.TryGetValue(old,out pair))
                    {
                        pair=new[]
                        {
                            new Material(opaque),new Material(fade)
                        };
                        foreach(var m in pair)
                        {
                            m.CopyPropertiesFromMaterial(old);
                            if(!old.HasProperty("_BaseMap")&&old.HasProperty("_MainTex"))m.SetTexture("_BaseMap",old.GetTexture("_MainTex"));
                            if(!old.HasProperty("_BaseColor")&&old.HasProperty("_Color"))m.SetColor("_BaseColor",old.GetColor("_Color"));
                            owned.Add(m);
                        }
                        pair[0].renderQueue=2460;
                        pair[1].renderQueue=3000;
                        cache[old]=pair;
                    }
                    a[i]=pair[0];
                    b[i]=pair[1];
                }
                r.sharedMaterials=a;
                var go=new GameObject("Arena nearest faded surface");
                go.transform.SetParent(r.transform,false);
                go.AddComponent<MeshFilter>().sharedMesh=filter.sharedMesh;
                var fr=go.AddComponent<MeshRenderer>();
                fr.sharedMaterials=b;
                fr.shadowCastingMode=ShadowCastingMode.Off;
                fr.enabled=false;
                entries.Add(new Entry
                {
                    body=r,fade=fr,mesh=filter.sharedMesh,opaque=a
                }
                );
            }
            EnsureTexture();
            RenderPipelineManager.beginCameraRendering+=NearestPass;
        }
        void EnsureTexture()
        {
            if(nearest!=null&&nearest.width==camera.pixelWidth&&nearest.height==camera.pixelHeight)return;
            if(nearest!=null)
            {
                nearest.Release();
                UnityEngine.Object.Destroy(nearest);
            }
            nearest=new RenderTexture(Mathf.Max(1,camera.pixelWidth),Mathf.Max(1,camera.pixelHeight),0,SystemInfo.SupportsBlendingOnRenderTextureFormat(RenderTextureFormat.RFloat)?RenderTextureFormat.RFloat:RenderTextureFormat.ARGBHalf)
            {
                name="Arena nearest surface",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp
            };
            nearest.Create();
        }
        public void SetActive(bool on)
        {
            active=on;
            if(!on)
            {
                Shader.SetGlobalFloat("_ArenaNearestReady",0);
                foreach(var e in entries)
                {
                    e.progress=0;
                    e.fade.enabled=false;
                }
            }
        }
        public void Step(Vector3 hero)
        {
            Step(hero,null);
        }
        // Hero and boss are tested independently: camera->target segment vs pillar bounds. Either one occluded fades the pillar.
        public void Step(Vector3 hero,Vector3? boss)
        {
            if(!active)return;
            var heroAim=hero+Vector3.up*.9f;
            var center=camera.WorldToViewportPoint(heroAim);
            Shader.SetGlobalMatrix("_ArenaViewportVP",camera.projectionMatrix*camera.worldToCameraMatrix);
            Shader.SetGlobalVector("_ArenaBattle",new Vector4(center.x,center.y,.225f,.20f));
            Vector3 bossAim=Vector3.zero,bossView=Vector3.zero;
            if(boss.HasValue)
            {
                bossAim=boss.Value+Vector3.up*1.4f;
                bossView=camera.WorldToViewportPoint(bossAim);
                Shader.SetGlobalVector("_ArenaBattleBoss",new Vector4(bossView.x,bossView.y,.225f,.20f));
            }
            else Shader.SetGlobalVector("_ArenaBattleBoss",Vector4.zero);
            Faded=0;
            foreach(var e in entries)
            {
                if(e.body==null)continue;
                bool alive=e.body.gameObject.activeInHierarchy;
                bool front=false,hit=false;
                if(alive)
                {
                    bool fh,hh;
                    Occludes(e.body.bounds,heroAim,center.z,hero.z,out fh,out hh);
                    front=fh;hit=hh;
                    if(boss.HasValue)
                    {
                        Occludes(e.body.bounds,bossAim,bossView.z,boss.Value.z,out fh,out hh);
                        front|=fh;hit|=hh;
                    }
                }
                if(hit)e.hold=Time.unscaledTime+.12f;
                e.progress=Mathf.MoveTowards(e.progress,hit||front&&Time.unscaledTime<e.hold?1:0,Time.unscaledDeltaTime/.2f);
                e.fade.enabled=e.progress>0;
                if(e.progress>0)Faded++;
                block.Clear();
                block.SetFloat("_ArenaFade",e.progress);
                block.SetFloat("_ArenaRearClip",front?1:0);
                e.body.SetPropertyBlock(block);
                e.fade.SetPropertyBlock(block);
            }
        }
        // front: pillar is in front of the target (old rule). hit: camera->target segment crosses the (padded) bounds.
        bool Occludes(Bounds b,Vector3 aim,float targetDepth,float targetZ,out bool front,out bool hit)
        {
            float depth;
            Project(b,out depth);
            front=b.center.z<targetZ+.1f&&depth<targetDepth;
            hit=false;
            if(!front)return false;
            var from=camera.transform.position;
            var d=aim-from;
            float len=d.magnitude;
            if(len<=.001f)return false;
            b.Expand(.3f);
            float t;
            hit=b.IntersectRay(new Ray(from,d/len),out t)&&t<=len;
            return hit;
        }
        Rect Project(Bounds b,out float depth)
        {
            float x0=float.PositiveInfinity,y0=x0,x1=float.NegativeInfinity,y1=x1;
            depth=float.PositiveInfinity;
            for(int n=0;n<8;n++)
            {
                var v=camera.WorldToViewportPoint(b.center+Vector3.Scale(b.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));
                if(v.z<=camera.nearClipPlane)return new Rect(0,0,1,1);
                depth=Mathf.Min(depth,v.z);
                x0=Mathf.Min(x0,v.x);
                x1=Mathf.Max(x1,v.x);
                y0=Mathf.Min(y0,v.y);
                y1=Mathf.Max(y1,v.y);
            }
            return Rect.MinMaxRect(x0,y0,x1,y1);
        }
        void NearestPass(ScriptableRenderContext context,Camera view)
        {
            if(view!=camera)return;
            Shader.SetGlobalFloat("_ArenaNearestReady",0);
            if(!active||Faded==0)return;
            EnsureTexture();
            var cmd=CommandBufferPool.Get("Arena foremost occluder");
            cmd.SetGlobalMatrix("_ArenaNearestVP",GL.GetGPUProjectionMatrix(camera.projectionMatrix,true)*camera.worldToCameraMatrix);
            cmd.SetGlobalMatrix("_ArenaNearestView",camera.worldToCameraMatrix);
            cmd.SetRenderTarget(nearest);
            cmd.SetViewport(new Rect(0,0,nearest.width,nearest.height));
            cmd.ClearRenderTarget(false,true,new Color(camera.farClipPlane,camera.farClipPlane,camera.farClipPlane,camera.farClipPlane));
            cmd.SetGlobalFloat("_ArenaDepthTolerance",nearest.format==RenderTextureFormat.RFloat?.002f:.02f);
            Draws=0;
            foreach(var e in entries)
            {
                if(e.progress<=0||!e.body.gameObject.activeInHierarchy)continue;
                for(int i=0;i<e.opaque.Length;i++)
                {
                    var m=e.opaque[i];
                    if(m==null)continue;
                    int pass=m.FindPass("A2RNearest");
                    if(pass<0)continue;
                    cmd.DrawMesh(e.mesh,e.body.localToWorldMatrix,m,i,pass);
                    Draws++;
                }
            }
            cmd.SetGlobalTexture("_ArenaNearestDepth",nearest);
            cmd.SetGlobalFloat("_ArenaNearestReady",1);
            context.ExecuteCommandBuffer(cmd);
            CommandBufferPool.Release(cmd);
        }
        public void Dispose()
        {
            RenderPipelineManager.beginCameraRendering-=NearestPass;
            Shader.SetGlobalFloat("_ArenaNearestReady",0);
            if(nearest!=null)
            {
                nearest.Release();
                UnityEngine.Object.Destroy(nearest);
            }
            foreach(var m in owned)UnityEngine.Object.Destroy(m);
        }
    }
}
