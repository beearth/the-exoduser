Shader "EXODUSER/A2R/FootLight"
{
 SubShader {Tags{"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+40"}
 Pass {ZWrite Off Cull Off Blend SrcAlpha One
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A a){V o;o.p=TransformObjectToHClip(a.p.xyz);o.uv=a.uv;return o;}
 half4 frag(V i):SV_Target{float d=length((i.uv-.5)*2);clip(1-d);return half4(.65,.24,.055,pow(saturate(1-d*d),3)*.095);}
 ENDHLSL
 }}
}
