Shader "EXODUSER/A2R/Contact"
{
 Properties {_Opacity("Actor opacity",Float)=1}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent-20" "RenderType"="Transparent"}
 Pass {Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Off Offset -1,-1
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 CBUFFER_START(UnityPerMaterial)
 float _Opacity;
 CBUFFER_END
 float _A2RLegacyContact;
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A i){V o;o.p=TransformObjectToHClip(i.p.xyz);o.uv=i.uv;return o;}
 half4 frag(V i):SV_Target{float2 p=i.uv*2-1;float a=.58*_Opacity*pow(saturate(1-dot(p,p)),2);return half4(half3(.025,.03,.035)*_A2RLegacyContact,a);}
 ENDHLSL
 }}}
