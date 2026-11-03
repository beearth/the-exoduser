Shader "EXODUSER/Map25D/WaterReflection" {
Properties {_MainTex("Flipped shore painting",2D)="black"{}}
SubShader {Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent-100" "RenderType"="Transparent"} Cull Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
Pass {HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _Map25DWaterPath[8];
struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;float3 w:TEXCOORD1;};
V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=a.uv;return o;}
half4 frag(V i):SV_Target{float nearest=100;[unroll]for(int k=0;k<7;k++){float4 a=_Map25DWaterPath[k],b=_Map25DWaterPath[k+1];float2 delta=b.xy-a.xy;float t=saturate(dot(i.w.xz-a.xy,delta)/max(.001,dot(delta,delta)));nearest=min(nearest,length(i.w.xz-lerp(a.xy,b.xy,t))-lerp(a.z,b.z,t)*.62);}float inside=1-smoothstep(-.3,0,nearest);float2 uv=float2(i.uv.x+.009*sin(i.uv.y*31+_Time.y*.38),1-i.uv.y);half4 tree=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv);float edge=smoothstep(0,.12,i.uv.x)*smoothstep(0,.12,1-i.uv.x)*smoothstep(0,.12,i.uv.y)*smoothstep(0,.12,1-i.uv.y);return half4(tree.rgb*half3(.20,.24,.19),tree.a*.20*edge*inside);}
ENDHLSL}
}}
