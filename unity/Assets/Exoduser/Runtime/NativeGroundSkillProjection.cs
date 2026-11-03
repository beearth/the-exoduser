using System;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Experimental.Rendering;
using UnityEngine.Rendering;
using UnityEngine.Rendering.RenderGraphModule;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // The visible surface is the actual receiver depth, not an interpolated CPU sheet.
    // Receiver proxies only participate in our depth pass; the original scene is untouched.
    public static class NativeGroundSkillProjection
    {
        // Internal render-list channel; actors/props retain their existing masks.
        public const uint ProjectionRenderingLayer = 1u << 30;
        public const uint WaterRenderingLayer = 1u << 31;
        sealed class Receiver
        {
            public MeshFilter Source, Filter; public MeshRenderer Owner, Draw;
            public Mesh SourceMesh, OwnedMesh; public GameObject Go; public bool Bounded,Water;
        }
        static readonly Dictionary<MeshFilter,Receiver> receivers=new Dictionary<MeshFilter,Receiver>();
        static readonly HashSet<MeshFilter> proxies=new HashSet<MeshFilter>();
        static readonly List<MeshRenderer> volumes=new List<MeshRenderer>();
        static readonly Dictionary<int,Material> blends=new Dictionary<int,Material>();
        static readonly HashSet<ScriptableRenderer> installed=new HashSet<ScriptableRenderer>();
        static readonly PropertyInfo featureList=typeof(ScriptableRenderer).GetProperty("rendererFeatures",BindingFlags.Instance|BindingFlags.NonPublic);
        static Material depthMaterial, probeMaterial;
        static readonly MaterialPropertyBlock receiverBlock=new MaterialPropertyBlock();
        static Mesh cube;
        static Camera camera;
        static RTHandle probe;
        static int probeMode;
        public static int ProbeSerial { get; private set; }
        public static Vector2Int FrameSize { get; private set; }
        public static int ReceiverCount { get { return receivers.Count; } }
        public static string Error { get; private set; }
        public static bool Available { get; private set; }
        public static int ActiveWaterCount { get; private set; }
        public static int ActiveVolumeCount
        {
            get { int count=0;foreach(var v in volumes)if(v!=null&&v.enabled&&v.gameObject.activeInHierarchy)count++;return count; }
        }
        public static bool IsProxy(MeshFilter filter) { return filter!=null&&proxies.Contains(filter); }
        public static void RegisterVolume(MeshRenderer renderer) { if(renderer!=null){renderer.renderingLayerMask=ProjectionRenderingLayer;if(!volumes.Contains(renderer))volumes.Add(renderer);} }
        public static void UnregisterVolume(MeshRenderer renderer) { volumes.Remove(renderer); }
        public static Material MaterialFor(int destinationBlend)
        {
            Material material;
            if(!blends.TryGetValue(destinationBlend,out material)||material==null)
            {
                var shader=Resources.Load<Shader>("Shaders/GroundSkillProjection");
                if(shader==null)throw new InvalidOperationException("Missing ground projection shader");
                material=new Material(shader) { name="Ground projection blend "+destinationBlend,hideFlags=HideFlags.DontSave };
                material.SetFloat("_DstBlend",destinationBlend);blends[destinationBlend]=material;
            }
            return material;
        }
        public static Mesh VolumeMesh
        {
            get
            {
                if(cube!=null)return cube;
                cube=new Mesh { name="Ground projection volume",hideFlags=HideFlags.DontSave };
                cube.vertices=new[]{new Vector3(-.5f,-.5f,-.5f),new Vector3(.5f,-.5f,-.5f),new Vector3(.5f,.5f,-.5f),new Vector3(-.5f,.5f,-.5f),new Vector3(-.5f,-.5f,.5f),new Vector3(.5f,-.5f,.5f),new Vector3(.5f,.5f,.5f),new Vector3(-.5f,.5f,.5f)};
                cube.triangles=new[]{0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5};cube.RecalculateBounds();
                cube.colors=new Color[8];cube.uv2=new Vector2[8];cube.uv3=new Vector2[8];
                return cube;
            }
        }
        public static void RegisterReceiver(MeshFilter source,float[] world=null,int[] indices=null,Func<float,float,float> terrain=null,bool deck=false,float ceiling=0)
        {
            if(source==null||source.sharedMesh==null||IsProxy(source))return;
            Receiver existing;if(receivers.TryGetValue(source,out existing))return;
            var owner=source.GetComponent<MeshRenderer>();if(owner==null)return;
            if(depthMaterial==null)depthMaterial=new Material(Resources.Load<Shader>("Shaders/GroundSkillReceiverDepth")) { hideFlags=HideFlags.DontSave };
            var go=new GameObject("Ground effect receiver depth") { hideFlags=HideFlags.DontSave };go.transform.SetParent(source.transform,false);go.layer=source.gameObject.layer;
            var filter=go.AddComponent<MeshFilter>();var draw=go.AddComponent<MeshRenderer>();
            draw.renderingLayerMask=ProjectionRenderingLayer;
            draw.sharedMaterial=depthMaterial;draw.shadowCastingMode=ShadowCastingMode.Off;draw.receiveShadows=false;draw.allowOcclusionWhenDynamic=false;
            var record=new Receiver { Source=source,Filter=filter,Owner=owner,Draw=draw,Go=go,SourceMesh=source.sharedMesh,Bounded=terrain!=null||deck };
            if(record.Bounded)
            {
                var original=source.sharedMesh;var points=original.vertices;var range=new Vector2[points.Length];
                for(int i=0;i<points.Length;i++)
                {
                    float x=world[i*3],z=world[i*3+2];float bed=terrain!=null?terrain(x,z):0;
                    range[i]=deck?new Vector2(-10000,ceiling):new Vector2(bed,bed+.9f);
                }
                var triangles=new List<int>();
                for(int i=0;i<indices.Length;i+=3)
                {
                    int a=indices[i],b=indices[i+1],c=indices[i+2];
                    if(deck)
                    {
                        float det=(world[b*3+2]-world[c*3+2])*(world[a*3]-world[c*3])+(world[c*3]-world[b*3])*(world[a*3+2]-world[c*3+2]);
                        if(Mathf.Abs(det)<.000001f||Mathf.Max(world[a*3+1],Mathf.Max(world[b*3+1],world[c*3+1]))>ceiling)continue;
                    }
                    else if(world[a*3+1]>range[a].y&&world[b*3+1]>range[b].y&&world[c*3+1]>range[c].y)continue;
                    triangles.Add(a);triangles.Add(b);triangles.Add(c);
                }
                var mesh=new Mesh { name="Explicit walkable receiver mask",indexFormat=points.Length>65535?IndexFormat.UInt32:IndexFormat.UInt16,hideFlags=HideFlags.DontSave };
                mesh.vertices=points;mesh.uv2=range;mesh.triangles=triangles.ToArray();
                var normals=original.normals;if(normals.Length==points.Length)mesh.normals=normals;else mesh.RecalculateNormals();
                mesh.RecalculateBounds();record.OwnedMesh=mesh;filter.sharedMesh=mesh;
                var block=new MaterialPropertyBlock();block.SetFloat("_Bounded",1);draw.SetPropertyBlock(block);
            }
            else filter.sharedMesh=source.sharedMesh;
            receivers.Add(source,record);proxies.Add(filter);
        }
        public static void RegisterWaterReceiver(MeshFilter source)
        {
            RegisterReceiver(source);Receiver record;
            if(source!=null&&receivers.TryGetValue(source,out record)){record.Water=true;if(record.Owner!=null)record.Owner.renderingLayerMask|=WaterRenderingLayer;}
        }
        public static void BeginFrame(Camera value)
        {
            camera=value;
            if(value==null)return;
            try
            {
                var renderer=value.GetUniversalAdditionalCameraData().scriptableRenderer;
                if(!installed.Contains(renderer))
                {
                    var list=featureList!=null?featureList.GetValue(renderer) as List<ScriptableRendererFeature>:null;
                    if(list==null)throw new InvalidOperationException("URP renderer feature list unavailable");
                    var feature=ScriptableObject.CreateInstance<ProjectionFeature>();feature.hideFlags=HideFlags.DontSave;feature.name="Actual ground skill projection";feature.Create();list.Add(feature);installed.Add(renderer);
                }
                Available=true;Error="";
            }
            catch(Exception exception) { Available=false;if(Error!=exception.Message)Debug.LogError("[Ground projection] "+exception.Message);Error=exception.Message; }
            ActiveWaterCount=0;var dead=new List<MeshFilter>();
            foreach(var item in receivers)
            {
                var record=item.Value;
                if(record.Source==null||record.Owner==null) { dead.Add(item.Key);continue; }
                record.Draw.enabled=record.Owner.enabled&&!record.Owner.forceRenderingOff&&record.Owner.gameObject.activeInHierarchy;
                if(record.Water&&record.Draw.enabled)ActiveWaterCount++;
                record.Draw.sharedMaterial=depthMaterial;
                record.Draw.GetPropertyBlock(receiverBlock);receiverBlock.SetFloat("_Bounded",record.Bounded?1:0);record.Draw.SetPropertyBlock(receiverBlock);
                if(!record.Bounded&&record.Filter.sharedMesh!=record.Source.sharedMesh)record.Filter.sharedMesh=record.Source.sharedMesh;
            }
            foreach(var key in dead)
            {
                var record=receivers[key];proxies.Remove(record.Filter);Release(record.OwnedMesh);Release(record.Go);receivers.Remove(key);
            }
        }
        public static void RequestProbe(RenderTexture target,int mode)
        {
            if(target==null||!target.IsCreated()||target.graphicsFormat!=GraphicsFormat.R32G32B32A32_SFloat||mode<1||mode>4||target.width!=FrameSize.x||target.height!=FrameSize.y)throw new ArgumentException("Ground probe requires a created RGBAFloat target matching FrameSize and mode 1..4");
            CancelProbe();probe=RTHandles.Alloc(target,false);probeMode=mode;
        }
        public static void CancelProbe() { if(probe!=null)probe.Release();probe=null;probeMode=0; }
        static void Release(UnityEngine.Object value) { if(value==null)return;if(Application.isPlaying)UnityEngine.Object.Destroy(value);else UnityEngine.Object.DestroyImmediate(value); }

        sealed class ProjectionFeature : ScriptableRendererFeature
        {
            ProjectionPass pass;
            public override void Create() { pass=new ProjectionPass(); }
            public override void AddRenderPasses(ScriptableRenderer renderer,ref RenderingData data)
            {
                if(NativeRemodel3D.Active&&data.cameraData.camera==camera&&(ActiveVolumeCount>0||ActiveWaterCount>0))renderer.EnqueuePass(pass);
            }
        }
        sealed class ProjectionPass : ScriptableRenderPass
        {
            static readonly int ReceiverDepth=Shader.PropertyToID("_ExoduserGroundDepth"),ProbeMode=Shader.PropertyToID("_ExoduserGroundProbe");
            static readonly ShaderTagId receiverTag=new ShaderTagId("ExoduserGroundReceiver"),projectionTag=new ShaderTagId("ExoduserGroundProjection");
            static readonly ShaderTagId waterTag=new ShaderTagId("ExoduserGroundWater");
            sealed class PassData { public RendererListHandle List;public int Probe; }
            public ProjectionPass() { renderPassEvent=RenderPassEvent.BeforeRenderingTransparents;requiresIntermediateTexture=true;ConfigureInput(ScriptableRenderPassInput.Depth); }
            RendererListHandle List(RenderGraph graph,UniversalRenderingData rendering,UniversalCameraData cam,UniversalLightData light,ShaderTagId tag,Material material=null,uint layer=ProjectionRenderingLayer)
            {
                var settings=RenderingUtils.CreateDrawingSettings(tag,rendering,cam,light,SortingCriteria.CommonTransparent);
                settings.enableInstancing=false;
                settings.overrideMaterial=material;settings.overrideMaterialPassIndex=0;
                var filtering=new FilteringSettings(RenderQueueRange.all){renderingLayerMask=layer};
                return graph.CreateRendererList(new RendererListParams(rendering.cullResults,settings,filtering));
            }
            public override void RecordRenderGraph(RenderGraph graph,ContextContainer context)
            {
                var resources=context.Get<UniversalResourceData>();var cam=context.Get<UniversalCameraData>();var rendering=context.Get<UniversalRenderingData>();var light=context.Get<UniversalLightData>();
                FrameSize=new Vector2Int(cam.cameraTargetDescriptor.width,cam.cameraTargetDescriptor.height);
                if(ActiveWaterCount>0)
                {
                    using(var builder=graph.AddRasterRenderPass<PassData>("Ground water before projected ink",out var data))
                    {
                        data.List=List(graph,rendering,cam,light,waterTag,null,WaterRenderingLayer);builder.UseRendererList(data.List);
                        builder.UseAllGlobalTextures(true);
                        if(resources.cameraDepthTexture.IsValid())builder.UseTexture(resources.cameraDepthTexture,AccessFlags.Read);
                        builder.SetRenderAttachment(resources.activeColorTexture,0,AccessFlags.ReadWrite);builder.SetRenderAttachmentDepth(resources.activeDepthTexture,AccessFlags.ReadWrite);
                        builder.SetRenderFunc((PassData value,RasterGraphContext state)=>state.cmd.DrawRendererList(value.List));
                    }
                }
                if(ActiveVolumeCount==0&&probe==null)return;
                var desc=cam.cameraTargetDescriptor;desc.msaaSamples=1;desc.graphicsFormat=GraphicsFormat.None;desc.depthStencilFormat=GraphicsFormat.D32_SFloat;
                var mask=UniversalRenderer.CreateRenderGraphTexture(graph,desc,"Ground receiver depth",true);
                using(var builder=graph.AddRasterRenderPass<PassData>("Ground receiver depth",out var data))
                {
                    data.List=List(graph,rendering,cam,light,receiverTag);builder.UseRendererList(data.List);builder.SetRenderAttachmentDepth(mask,AccessFlags.Write);
                    builder.SetGlobalTextureAfterPass(mask,ReceiverDepth);builder.AllowPassCulling(false);
                    builder.SetRenderFunc((PassData value,RasterGraphContext state)=>state.cmd.DrawRendererList(value.List));
                }
                using(var builder=graph.AddRasterRenderPass<PassData>("Ground skill projection",out var data))
                {
                    data.List=List(graph,rendering,cam,light,projectionTag);builder.UseRendererList(data.List);builder.UseTexture(mask,AccessFlags.Read);
                    if(resources.cameraDepthTexture.IsValid())builder.UseTexture(resources.cameraDepthTexture,AccessFlags.Read);
                    builder.SetRenderAttachment(resources.activeColorTexture,0,AccessFlags.ReadWrite);builder.AllowGlobalStateModification(true);
                    builder.SetRenderFunc((PassData value,RasterGraphContext state)=>{state.cmd.SetGlobalInt(ProbeMode,0);state.cmd.DrawRendererList(value.List);});
                }
                if(probe!=null&&probeMode>0)
                {
                    if(probe.rt.width!=FrameSize.x||probe.rt.height!=FrameSize.y) { Error="Ground probe resolution changed after request";return; }
                    if(probeMaterial==null)probeMaterial=new Material(Resources.Load<Shader>("Shaders/GroundSkillProjection")) { hideFlags=HideFlags.DontSave };
                    probeMaterial.SetFloat("_DstBlend",0);
                    using(var builder=graph.AddRasterRenderPass<PassData>("Ground projection float probe",out var data))
                    {
                        data.List=List(graph,rendering,cam,light,projectionTag,probeMaterial);data.Probe=probeMode;builder.UseRendererList(data.List);builder.UseTexture(mask,AccessFlags.Read);
                        if(resources.cameraDepthTexture.IsValid())builder.UseTexture(resources.cameraDepthTexture,AccessFlags.Read);
                        builder.SetRenderAttachment(graph.ImportTexture(probe,new ImportResourceParams { clearOnFirstUse=true,clearColor=Color.clear }),0,AccessFlags.Write);builder.AllowGlobalStateModification(true);builder.AllowPassCulling(false);
                        builder.SetRenderFunc((PassData value,RasterGraphContext state)=>{state.cmd.SetGlobalInt(ProbeMode,value.Probe);state.cmd.DrawRendererList(value.List);state.cmd.SetGlobalInt(ProbeMode,0);ProbeSerial++;});
                    }
                }
            }
        }
    }
}
