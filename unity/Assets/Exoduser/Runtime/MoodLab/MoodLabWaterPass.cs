using System;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.RenderGraphModule;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort.MoodLab
{
    // CX5: A2ToxicRiver's existing LightMode is ExoduserGroundWater, not UniversalForward.
    // Adapt the already-used native water RecordRenderGraph path to ONLY the lab camera/layer.
    // No renderer asset/feature list or NativeRemodel3D flags are modified.
    public sealed class MoodLabWaterPass : ScriptableRenderPass, IDisposable
    {
        readonly Camera camera;
        sealed class PassData { public RendererListHandle List; }
        public MoodLabWaterPass(Camera owner)
        {
            camera = owner; renderPassEvent = RenderPassEvent.BeforeRenderingTransparents;
            requiresIntermediateTexture = true; ConfigureInput(ScriptableRenderPassInput.Depth);
            RenderPipelineManager.beginCameraRendering += BeginCamera;
        }
        void BeginCamera(ScriptableRenderContext context, Camera candidate)
        {
            if (candidate == camera) CameraExtensions.GetUniversalAdditionalCameraData(camera).scriptableRenderer.EnqueuePass(this);
        }
        public override void RecordRenderGraph(RenderGraph graph, ContextContainer context)
        {
            var cam = context.Get<UniversalCameraData>();
            if (cam.camera != camera) return;
            var resources = context.Get<UniversalResourceData>();
            var rendering = context.Get<UniversalRenderingData>();
            var light = context.Get<UniversalLightData>();
            var settings = RenderingUtils.CreateDrawingSettings(new ShaderTagId("ExoduserGroundWater"), rendering, cam, light, SortingCriteria.CommonTransparent);
            settings.enableInstancing = false;
            var filtering = new FilteringSettings(RenderQueueRange.all, MoodLabScene.LayerMask);
            using (var builder = graph.AddRasterRenderPass<PassData>("MoodLab existing A2 water", out var data))
            {
                data.List = graph.CreateRendererList(new RendererListParams(rendering.cullResults, settings, filtering));
                builder.UseRendererList(data.List); builder.UseAllGlobalTextures(true);
                if (resources.cameraDepthTexture.IsValid()) builder.UseTexture(resources.cameraDepthTexture, AccessFlags.Read);
                builder.SetRenderAttachment(resources.activeColorTexture, 0, AccessFlags.ReadWrite);
                builder.SetRenderAttachmentDepth(resources.activeDepthTexture, AccessFlags.ReadWrite);
                builder.SetRenderFunc((PassData value, RasterGraphContext state) => state.cmd.DrawRendererList(value.List));
            }
        }
        public void Dispose() { RenderPipelineManager.beginCameraRendering -= BeginCamera; }
    }
}
