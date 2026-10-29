using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort
{
    public sealed class HellFogFeature : FullScreenPassRendererFeature
    {
        public override void AddRenderPasses(ScriptableRenderer renderer,ref RenderingData data)
        {
            var game=NativeGame.Instance;
            if(NativeGame.HellAtmosphereEnabled&&game!=null&&data.cameraData.camera==game.Remodel3DCamera)base.AddRenderPasses(renderer,ref data);
        }
    }
}
