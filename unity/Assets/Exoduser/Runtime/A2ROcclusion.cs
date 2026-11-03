using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(26000)]
    public sealed class A2ROcclusion : MonoBehaviour
    {
        const int TargetCapacity=128;
        sealed class Entry {public Renderer body,fade;public Transform foot;public Material[] original;public float progress,holdUntil;public bool eligible,latched;}
        struct Target {public Vector4 circle;public float depth;public bool camp;}
        readonly List<Entry> entries=new List<Entry>();readonly MaterialPropertyBlock block=new MaterialPropertyBlock();
        readonly List<Vector4> combatWorld=new List<Vector4>();readonly List<Target> targets=new List<Target>();readonly Vector4[] localTargets=new Vector4[TargetCapacity];
        RenderTexture nearest;public int NearestDrawCalls {get;private set;}
        Renderer camp;Camera viewer;Func<Vector3> hero;Action<List<Vector4>> collectCombat;
        public bool Applied {get;private set;}public bool MasksEnabled {get;private set;}=true;
        public int VisibleTargets {get;private set;}public int FadedRenderers {get;private set;}public int PeakDroppedTargets {get;private set;}
        static bool IsSkillReceiver(Material material){return material!=null&&material.shader!=null&&material.shader.name.IndexOf("GroundSkillReceiver",StringComparison.Ordinal)>=0;}
        public void Initialize(Transform world,Camera camera,Func<Vector3> heroPosition)
        {
            viewer=camera;hero=heroPosition;RenderPipelineManager.beginCameraRendering+=NearestPass;Shader opaque=Resources.Load<Shader>("A2R/LitOpaque"),transparent=Resources.Load<Shader>("A2R/LitFade");if(opaque==null||transparent==null)throw new InvalidOperationException("A2R tree occlusion shaders missing");var cache=new Dictionary<Material,Material[]>();
            var candidates=new Dictionary<MeshRenderer,Transform>();foreach(Transform child in world)if(child.name.IndexOf("안개 원경",StringComparison.Ordinal)<0&&(child.name.IndexOf("Tree",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("거목",StringComparison.Ordinal)>=0||child.name.IndexOf("Stump",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("Log",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("목질",StringComparison.Ordinal)>=0||child.name.IndexOf("外곽",StringComparison.Ordinal)>=0))foreach(var renderer in child.GetComponentsInChildren<MeshRenderer>())candidates[renderer]=child;
            foreach(var candidate in candidates){var r=candidate.Key;var filter=r.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null)continue;var old=r.sharedMaterials;bool receiver=false;foreach(var material in old)if(IsSkillReceiver(material))receiver=true;if(receiver)continue;var a=new Material[old.Length];var b=new Material[old.Length];for(int i=0;i<old.Length;i++){if(old[i]==null)continue;Material[] pair;if(!cache.TryGetValue(old[i],out pair)){pair=new[]{new Material(opaque),new Material(transparent)};foreach(var m in pair){m.CopyPropertiesFromMaterial(old[i]);string map=old[i].HasProperty("_BaseMap")?"_BaseMap":old[i].HasProperty("_MainTex")?"_MainTex":null;if(map!=null){m.SetTexture("_BaseMap",old[i].GetTexture(map));m.SetTextureScale("_BaseMap",old[i].GetTextureScale(map));m.SetTextureOffset("_BaseMap",old[i].GetTextureOffset(map));}if(!old[i].HasProperty("_BaseColor")&&old[i].HasProperty("_Color"))m.SetColor("_BaseColor",old[i].GetColor("_Color"));}pair[0].renderQueue=2460;pair[1].renderQueue=3000;cache[old[i]]=pair;}a[i]=pair[0];b[i]=pair[1];}
                var go=new GameObject("A2R existing tree faded portion");go.transform.SetParent(r.transform,false);go.AddComponent<MeshFilter>().sharedMesh=filter.sharedMesh;var f=go.AddComponent<MeshRenderer>();f.sharedMaterials=b;f.shadowCastingMode=ShadowCastingMode.Off;f.enabled=false;entries.Add(new Entry{body=r,fade=f,foot=candidate.Value,original=old,eligible=true});r.sharedMaterials=a;
            }
            // Original materials are restored for the same-package baseline capture.
            SetLook(false);
        }
        void NearestPass(ScriptableRenderContext context,Camera camera)
        {
            if(camera!=viewer)return;Shader.SetGlobalFloat("_A2RNearestReady",0);if(!Applied||!MasksEnabled||FadedRenderers==0)return;
            int width=camera.pixelWidth,height=camera.pixelHeight;if(nearest==null||nearest.width!=width||nearest.height!=height){if(nearest!=null){nearest.Release();Destroy(nearest);}nearest=new RenderTexture(width,height,0,SystemInfo.SupportsBlendingOnRenderTextureFormat(RenderTextureFormat.RFloat)?RenderTextureFormat.RFloat:RenderTextureFormat.ARGBHalf){name="A2R nearest occluder surface",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp};nearest.Create();}
            var cmd=CommandBufferPool.Get("A2R nearest surface once");var vp=GL.GetGPUProjectionMatrix(camera.projectionMatrix,true)*camera.worldToCameraMatrix;cmd.SetGlobalMatrix("_A2RNearestVP",vp);cmd.SetGlobalMatrix("_A2RNearestView",camera.worldToCameraMatrix);cmd.SetRenderTarget(nearest);cmd.SetViewport(new Rect(0,0,width,height));cmd.ClearRenderTarget(false,true,new Color(camera.farClipPlane,camera.farClipPlane,camera.farClipPlane,camera.farClipPlane));cmd.SetGlobalFloat("_A2RDepthTolerance",nearest.format==RenderTextureFormat.RFloat?.002f:.02f);NearestDrawCalls=0;
            foreach(var e in entries){if(e.progress<=0||e.body==null||!e.body.enabled||!e.body.gameObject.activeInHierarchy)continue;var materials=e.body.sharedMaterials;for(int i=0;i<materials.Length;i++){var m=materials[i];if(m==null)continue;int pass=m.FindPass("A2RNearest");if(pass>=0){var filter=e.body.GetComponent<MeshFilter>();if(filter!=null&&filter.sharedMesh!=null){cmd.DrawMesh(filter.sharedMesh,e.body.localToWorldMatrix,m,i,pass);NearestDrawCalls++;}}}}
            cmd.SetGlobalTexture("_A2RNearestDepth",nearest);cmd.SetGlobalFloat("_A2RNearestReady",1);context.ExecuteCommandBuffer(cmd);CommandBufferPool.Release(cmd);
        }
        public int NearestCoveredPixels(){if(nearest==null)return 0;var old=RenderTexture.active;var sample=new Texture2D(nearest.width,nearest.height,TextureFormat.RGBAFloat,false,true);try{RenderTexture.active=nearest;sample.ReadPixels(new Rect(0,0,nearest.width,nearest.height),0,0);sample.Apply();var data=sample.GetRawTextureData<float>();int covered=0;for(int i=0;i<data.Length;i+=4)if(data[i]>0&&data[i]<viewer.farClipPlane-.1f)covered++;return covered;}finally{RenderTexture.active=old;Destroy(sample);}}
        void OnDestroy(){RenderPipelineManager.beginCameraRendering-=NearestPass;Shader.SetGlobalFloat("_A2RNearestReady",0);if(nearest!=null){nearest.Release();Destroy(nearest);}}
        public void Register(Renderer body,Renderer faded,bool eligible){entries.Add(new Entry{body=body,fade=faded,foot=body.transform,eligible=eligible});}
        public void ProtectLandmark(Renderer card){camp=card;}
        public void SetCombatSource(Action<List<Vector4>> source){collectCombat=source;}
        public void SetMasksEnabled(bool on){MasksEnabled=on;FadedRenderers=0;VisibleTargets=0;foreach(var e in entries){e.progress=0;e.holdUntil=0;e.latched=false;ClearMask(e.body);ClearMask(e.fade);}}
        public void SetLook(bool on)
        {
            Applied=on;foreach(var e in entries){if(e.original!=null){if(!on){var current=e.body.sharedMaterials;if(current.Length>0&&current[0]!=null&&current[0].shader.name.StartsWith("EXODUSER/A2R/",StringComparison.Ordinal))replacement[e.body]=current;e.body.sharedMaterials=e.original;}else{Material[] m;if(replacement.TryGetValue(e.body,out m))e.body.sharedMaterials=m;}}e.progress=0;e.holdUntil=0;e.latched=false;ClearMask(e.body);ClearMask(e.fade);if(e.fade!=null)e.fade.enabled=on;}
        }
        void ClearMask(Renderer renderer){if(renderer==null)return;renderer.GetPropertyBlock(block);block.SetFloat("_A2RFade",0);block.SetFloat("_A2RMaskBattle",0);block.SetInt("_A2RTargetCount",0);renderer.SetPropertyBlock(block);}
        readonly Dictionary<Renderer,Material[]> replacement=new Dictionary<Renderer,Material[]>();
        void LateUpdate()
        {
            if(!Applied||!MasksEnabled||viewer==null||hero==null)return;var heroFoot=hero();var heroViewport=viewer.WorldToViewportPoint(heroFoot+Vector3.up*.9f);targets.Clear();AddTarget(heroFoot+Vector3.up*.9f,.12f,false);
            if(camp!=null&&camp.enabled&&camp.gameObject.activeInHierarchy)AddTarget(camp.bounds.center,.18f,true);
            combatWorld.Clear();if(collectCombat!=null)collectCombat(combatWorld);foreach(var t in combatWorld)AddTarget(new Vector3(t.x,t.y,t.z),t.w,false);VisibleTargets=targets.Count;FadedRenderers=0;int dropped=0;
            // CPU viewport projection is used for BOTH fragment and target math, avoiding RT Y flips.
            Shader.SetGlobalMatrix("_A2RViewportVP",viewer.projectionMatrix*viewer.worldToCameraMatrix);
            Shader.SetGlobalVector("_A2RBattle",new Vector4(heroViewport.x,heroViewport.y,.225f,.20f));
            foreach(var e in entries)
            {
                // Core Y grows south; world z=-CoreY/100, so the camera side has SMALLER world z.
                if(e.body==null||e.fade==null||e.foot==null)continue;if(!e.body.enabled||!e.body.gameObject.activeInHierarchy){e.progress=0;e.latched=false;ClearMask(e.body);ClearMask(e.fade);continue;}float depth;var rect=ProjectBounds(e.body.bounds,out depth);bool south=e.foot.position.z<heroFoot.z+(e.latched?.10f:-.05f);float margin=e.latched?1.08f:1;int localCount=0;bool battle=false;
                if(e.eligible&&south&&rect.width>0)
                {
                    var lower=Rect.MinMaxRect(rect.xMin,rect.yMin,rect.xMax,Mathf.Min(rect.yMax,.60f));
                    battle=heroViewport.z>depth&&lower.height>0&&Intersects(lower,new Vector4(heroViewport.x,heroViewport.y,.225f,.20f),margin);
                    foreach(var t in targets)
                    {
                        if(t.camp&&e.original==null||t.depth<=depth||!Intersects(rect,t.circle,margin))continue;
                        // The fully faded ellipse interior already protects these circles; save slots.
                        float dx=(t.circle.x-heroViewport.x)/.225f,dy=(t.circle.y-heroViewport.y)/.20f;
                        if(battle&&Mathf.Sqrt(dx*dx+dy*dy)+Mathf.Max(t.circle.z/.225f,t.circle.w/.20f)<=.70f)continue;
                        if(localCount<TargetCapacity)localTargets[localCount++]=t.circle;else dropped++;
                    }
                }
                bool hit=battle||localCount>0;if(hit)e.holdUntil=Time.unscaledTime+.12f;else if(!south)e.holdUntil=0;
                e.latched=hit||Time.unscaledTime<e.holdUntil;e.progress=Mathf.MoveTowards(e.progress,e.latched?1:0,Time.unscaledDeltaTime/.2f);if(e.progress>0)FadedRenderers++;
                ApplyMask(e.body,localCount,battle,hit,e.progress);ApplyMask(e.fade,localCount,battle,hit,e.progress);
            }
            PeakDroppedTargets=Mathf.Max(PeakDroppedTargets,dropped);
        }
        void AddTarget(Vector3 world,float radius,bool landmark)
        {
            var v=viewer.WorldToViewportPoint(world);float rx=radius/viewer.aspect;if(v.z<=0||v.x< -rx||v.x>1+rx||v.y< -radius||v.y>1+radius)return;
            targets.Add(new Target{circle=new Vector4(v.x,v.y,radius/viewer.aspect,radius),depth=v.z,camp=landmark});
        }
        Rect ProjectBounds(Bounds bounds,out float depth)
        {
            float minX=1,minY=1,maxX=0,maxY=0;depth=float.PositiveInfinity;bool behind=false;
            for(int n=0;n<8;n++){var p=viewer.WorldToViewportPoint(bounds.center+Vector3.Scale(bounds.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));if(p.z<=viewer.nearClipPlane){behind=true;continue;}depth=Mathf.Min(depth,p.z);minX=Mathf.Min(minX,p.x);minY=Mathf.Min(minY,p.y);maxX=Mathf.Max(maxX,p.x);maxY=Mathf.Max(maxY,p.y);}
            if(float.IsPositiveInfinity(depth))return new Rect();if(behind)return new Rect(0,0,1,1);
            return Rect.MinMaxRect(Mathf.Clamp01(minX),Mathf.Clamp01(minY),Mathf.Clamp01(maxX),Mathf.Clamp01(maxY));
        }
        static bool Intersects(Rect rect,Vector4 ellipse,float margin)
        {
            float dx=(Mathf.Clamp(ellipse.x,rect.xMin,rect.xMax)-ellipse.x)/(ellipse.z*margin),dy=(Mathf.Clamp(ellipse.y,rect.yMin,rect.yMax)-ellipse.y)/(ellipse.w*margin);return dx*dx+dy*dy<=1;
        }
        void ApplyMask(Renderer renderer,int count,bool battle,bool update,float progress)
        {
            renderer.GetPropertyBlock(block);
            // Retain the last mask through the hysteresis hold and the 0.2s fade-out.
            if(update){if(count>0)block.SetVectorArray("_A2RTargets",localTargets);block.SetInt("_A2RTargetCount",count);block.SetFloat("_A2RMaskBattle",battle?1:0);}
            block.SetFloat("_A2RFade",progress);renderer.SetPropertyBlock(block);
        }
    }
}
