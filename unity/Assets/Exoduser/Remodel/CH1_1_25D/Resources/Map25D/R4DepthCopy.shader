Shader "Exoduser/Map25D/R4DepthCopy"
{
 SubShader { Tags {"RenderPipeline"="UniversalPipeline"} Pass {
 ZTest Always ZWrite Off Cull Off
 HLSLPROGRAM
 #pragma vertex Vert
 #pragma fragment Frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"
 float Frag(Varyings i):SV_Target {float raw=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_PointClamp,i.texcoord).r;return LinearEyeDepth(raw,_ZBufferParams);}
 ENDHLSL
 } }
}
