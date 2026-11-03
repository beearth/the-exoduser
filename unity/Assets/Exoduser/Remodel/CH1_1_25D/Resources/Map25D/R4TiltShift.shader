Shader "EXODUSER/Map25D/R4TiltShift" {
 Properties {_Enabled("Enabled",Float)=1 _Radius("Gaussian radius pixels",Float)=2.4}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline"} Pass {ZTest Always ZWrite Off Cull Off
 HLSLPROGRAM
 #pragma vertex Vert
 #pragma fragment Frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"
 float _Enabled,_Radius;
 half4 Frag(Varyings input):SV_Target {
  UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
  float2 uv=input.texcoord;half4 center=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv);
  float focus=smoothstep(.20,.45,abs(uv.y-.51))*saturate(_Enabled);if(focus<.001)return center;
  float2 delta=_Radius*focus/_ScreenParams.xy;
  half4 sum=center*4;
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv+float2(delta.x,0))*2;
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv-float2(delta.x,0))*2;
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv+float2(0,delta.y))*2;
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv-float2(0,delta.y))*2;
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv+delta);
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv-delta);
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv+float2(delta.x,-delta.y));
  sum+=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,uv+float2(-delta.x,delta.y));
  return sum/16;
 }
 ENDHLSL
 }}
}
