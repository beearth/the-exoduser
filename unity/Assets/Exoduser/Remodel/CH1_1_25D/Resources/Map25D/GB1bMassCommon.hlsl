#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"
CBUFFER_START(UnityPerMaterial)
half4 _Color;
CBUFFER_END
float4 _GB1bEye,_GB1bHero;
struct MassA {float4 positionOS:POSITION;float3 normalOS:NORMAL;};
struct MassV {float4 positionCS:SV_POSITION;float3 positionWS:TEXCOORD0;half3 normalWS:TEXCOORD1;};
MassV MassVert(MassA a){MassV o;o.positionWS=TransformObjectToWorld(a.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.positionWS);o.normalWS=TransformObjectToWorldNormal(a.normalOS);return o;}
float MassFade(float3 p){float3 ray=_GB1bHero.xyz-_GB1bEye.xyz;float t=dot(p-_GB1bEye.xyz,ray)/max(.01,dot(ray,ray));float distanceToRay=length(p-(_GB1bEye.xyz+ray*t));return (1-smoothstep(1.15,3.1,distanceToRay))*smoothstep(0,.08,t)*(1-smoothstep(.98,1.08,t));}
half3 MassColor(MassV i){Light sun=GetMainLight(TransformWorldToShadowCoord(i.positionWS));half diffuse=saturate(dot(normalize(i.normalWS),sun.direction));return _Color.rgb*(half3(.12,.12,.12)+sun.color*(.16+.84*diffuse)*sun.shadowAttenuation);}
half4 MassOpaque(MassV i):SV_Target{clip(.02-MassFade(i.positionWS));return half4(MassColor(i),1);}
half4 MassDepth(MassV i):SV_Target{clip(.02-MassFade(i.positionWS));return 0;}
half4 MassFaded(MassV i):SV_Target{float fade=MassFade(i.positionWS);clip(fade-.02);float2 uv=GetNormalizedScreenSpaceUV(i.positionCS),d=_CameraOpaqueTexture_TexelSize.xy*2;half3 blurred=SampleSceneColor(uv)*.4;blurred+=(SampleSceneColor(uv+d)+SampleSceneColor(uv-d)+SampleSceneColor(uv+float2(d.x,-d.y))+SampleSceneColor(uv+float2(-d.x,d.y)))*.15;return half4(lerp(MassColor(i),blurred,fade*.55),lerp(1,.16,fade));}
float3 _LightDirection,_LightPosition;
float4 MassShadowVert(MassA a):SV_POSITION{float3 p=TransformObjectToWorld(a.positionOS.xyz),n=TransformObjectToWorldNormal(a.normalOS);float3 lightDirection=_LightDirection;
#if _CASTING_PUNCTUAL_LIGHT_SHADOW
lightDirection=normalize(_LightPosition-p);
#endif
float4 clipPosition=TransformWorldToHClip(ApplyShadowBias(p,n,lightDirection));
#if UNITY_REVERSED_Z
clipPosition.z=min(clipPosition.z,clipPosition.w*UNITY_NEAR_CLIP_VALUE);
#else
clipPosition.z=max(clipPosition.z,clipPosition.w*UNITY_NEAR_CLIP_VALUE);
#endif
return clipPosition;}
half4 MassShadowFragment():SV_Target{return 0;}
