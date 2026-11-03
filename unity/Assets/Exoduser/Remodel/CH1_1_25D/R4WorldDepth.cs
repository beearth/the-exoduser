using UnityEngine;
using UnityEngine.Experimental.Rendering;
using UnityEngine.Rendering;
using UnityEngine.Rendering.RenderGraphModule;
using UnityEngine.Rendering.RenderGraphModule.Util;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // Copy the perspective world's linear eye depth before the orthographic actor camera
    // clears its own depth. The persistent texture survives the camera-stack boundary.
    public sealed class R4WorldDepth : ScriptableRendererFeature
    {
        public Material CopyMaterial;
        public static Camera Viewer;
        public static RTHandle Texture;
        Pass pass;
        public override void Create(){pass=new Pass(this);}
        public override void AddRenderPasses(ScriptableRenderer renderer,ref RenderingData data)
        {
            if(CopyMaterial==null||data.cameraData.renderType!=CameraRenderType.Base||data.cameraData.camera.cameraType==CameraType.Reflection||Viewer==null||data.cameraData.camera!=Viewer)return;
            pass.renderPassEvent=RenderPassEvent.AfterRenderingTransparents;
            pass.ConfigureInput(ScriptableRenderPassInput.Depth);
            renderer.EnqueuePass(pass);
        }
        protected override void Dispose(bool disposing){Texture?.Release();Texture=null;}
        sealed class Pass : ScriptableRenderPass
        {
            readonly R4WorldDepth owner;
            public Pass(R4WorldDepth feature){owner=feature;}
            public override void RecordRenderGraph(RenderGraph graph,ContextContainer context)
            {
                var resources=context.Get<UniversalResourceData>();
                var camera=context.Get<UniversalCameraData>();
                // In a camera stack the shader-read cameraDepthTexture can still be
                // the cleared placeholder. Preserve the base camera's attachment
                // before the overlay clears it. The isolated pipeline uses 1x MSAA.
                if(!resources.activeDepthTexture.IsValid())return;
                int w=camera.cameraTargetDescriptor.width,h=camera.cameraTargetDescriptor.height;
                if(Texture==null||Texture.rt.width!=w||Texture.rt.height!=h){Texture?.Release();Texture=RTHandles.Alloc(w,h,colorFormat:GraphicsFormat.R32_SFloat,filterMode:FilterMode.Point,name:"R4 perspective eye depth");}
                Shader.SetGlobalTexture("_R4WorldDepth",Texture.rt);
                var target=graph.ImportTexture(Texture);
                var args=new RenderGraphUtils.BlitMaterialParameters(resources.activeDepthTexture,target,owner.CopyMaterial,0);
                using(var builder=graph.AddBlitPass(args,passName:"R4 preserve perspective depth",returnBuilder:true))builder.AllowPassCulling(false);
            }
        }
    }
}
