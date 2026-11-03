#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
#include "Occlusion.hlsl"
TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);TEXTURE2D(_NormalTex);SAMPLER(sampler_NormalTex);
CBUFFER_START(UnityPerMaterial)
float _Emission;half4 _Tint;
CBUFFER_END
struct A{float4 p:POSITION;float2 uv:TEXCOORD0;float3 n:NORMAL;float4 tangent:TANGENT;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;float3 w:TEXCOORD1;half3 n:TEXCOORD2;half3 t:TEXCOORD3;half3 b:TEXCOORD4;};
V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=a.uv;o.n=TransformObjectToWorldNormal(a.n);o.t=TransformObjectToWorldDir(a.tangent.xyz);o.b=cross(o.n,o.t)*a.tangent.w;return o;}
half4 shade(V i,bool fading){half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv)*_Tint;clip(c.a-.12);float f=A2RFadeMask(i.w,i.p);if(fading){clip(f-.002);A2RKeepNearest(i.w);}else {clip(.002-f);A2RRejectRear(i.w);}half3 normal=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,i.uv).rgb*2-1;half3 n=normalize(normal.x*i.t+normal.y*i.b+normal.z*i.n);Light l=GetMainLight(TransformWorldToShadowCoord(i.w));half3 light=half3(.08,.075,.065)+l.color*(.15+.85*saturate(dot(n,l.direction)))*l.shadowAttenuation;InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);uint count=GetAdditionalLightsCount();LIGHT_LOOP_BEGIN(count) Light a=GetAdditionalLight(lightIndex,i.w);light+=a.color*a.distanceAttenuation*a.shadowAttenuation*(.2+.8*saturate(dot(n,a.direction)));LIGHT_LOOP_END return half4(c.rgb*(min(light,half3(2.4,2.4,2.4))+_Emission),fading?c.a*lerp(1,.20,f):1);}
