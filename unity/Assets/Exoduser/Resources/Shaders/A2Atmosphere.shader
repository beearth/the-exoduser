Shader "EXODUSER/A2Atmosphere"
{
 Properties { _Color("달빛 안개",Color)=(.42,.52,.64,.12) }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent" }
  Pass
  {
   Blend SrcAlpha OneMinusSrcAlpha
   ZWrite Off
   Cull Off
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   CBUFFER_START(UnityPerMaterial)
   half4 _Color;
   CBUFFER_END
   struct A {float4 vertex:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;float4 screen:TEXCOORD1;float eye:TEXCOORD2;};
   V vert(A a){V o;VertexPositionInputs p=GetVertexPositionInputs(a.vertex.xyz);o.positionCS=p.positionCS;o.uv=a.uv;o.screen=ComputeScreenPos(p.positionCS);o.eye=-TransformWorldToView(p.positionWS).z;return o;}
   half4 frag(V i):SV_Target{float edge=pow(saturate(1-abs(i.uv.x*2-1)),2);float ends=smoothstep(0,.12,i.uv.y)*(1-smoothstep(.75,1,i.uv.y));float depth=LinearEyeDepth(SampleSceneDepth(i.screen.xy/i.screen.w),_ZBufferParams);float fade=saturate((depth-i.eye)*1.3);return half4(_Color.rgb,_Color.a*edge*ends*fade);}
   ENDHLSL
  }
 }
}
