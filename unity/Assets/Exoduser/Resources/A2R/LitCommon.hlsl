#include "Packages/com.unity.render-pipelines.universal/Shaders/LitInput.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
#include "Occlusion.hlsl"
#include "Wind.hlsl"
float4 _A2R3DWind;float _A2R3DWindOn;float4 _A2RActors[32];int _A2RActorCount;
struct A{float4 color:COLOR;float4 p:POSITION;float2 uv:TEXCOORD0;float3 n:NORMAL;float4 tangent:TANGENT;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;float3 w:TEXCOORD1;half3 n:TEXCOORD2;half3 t:TEXCOORD3;half3 b:TEXCOORD4;};
V vert(A a)
{
 V o;
 bool moving=_A2R3DWindOn>.5&&_A2RWindOff<.5;
 // w is a conservative local size set by the importer, not a world-space scale.
 // Opposite normals each move <=1.5%, so the complete size grows <=3%.
 // Missing size is fail-closed: legacy shading colors must never inflate a prop.
 if(moving&&_A2R3DWind.w>0)
  a.p.xyz+=normalize(a.n)*(.015*_A2R3DWind.w*saturate(a.color.b)*A2RPulse(a.color.g,_Time.y));
 o.w=TransformObjectToWorld(a.p.xyz);
 if(moving)
 {
  float weight=saturate(a.color.r);
  float phase=A2RWindPhase(a.color.g,TransformObjectToWorld(float3(0,0,0)));
  float sway=A2RWindWave(_Time.y,phase,A2RWindGust(_Time.y,o.w))*_A2R3DWind.x*weight;
  o.w.xz+=float2(1,.28)*sway;
  float nearestActor=1.2;float2 bend=0;
  if(_A2R3DWind.y>0)for(int j=0;j<min(_A2RActorCount,32);j++)
  {
   float2 delta=o.w.xz-_A2RActors[j].xz;float d=length(delta);
   if(d<nearestActor){nearestActor=d;bend=delta/max(.1,d)*smoothstep(1.2,0,d)*weight*_A2R3DWind.y;}
  }
  o.w.xz+=bend;o.w.y-=length(bend)*.18;
 }
 o.p=TransformWorldToHClip(o.w);o.uv=TRANSFORM_TEX(a.uv,_BaseMap);o.n=TransformObjectToWorldNormal(a.n);o.t=TransformObjectToWorldDir(a.tangent.xyz);o.b=cross(o.n,o.t)*a.tangent.w;return o;
}
half4 shade(V i,bool fading,bool frontFace){SurfaceData surface;InitializeStandardLitSurfaceData(i.uv,surface);clip(surface.alpha-.05);float f=A2RFadeMask(i.w,i.p);if(fading){clip(f-.002);A2RKeepNearest(i.w);}else {clip(.002-f);A2RRejectRear(i.w);}InputData data=(InputData)0;data.positionWS=i.w;data.normalWS=normalize(surface.normalTS.x*i.t+surface.normalTS.y*i.b+surface.normalTS.z*i.n)*(frontFace?1:-1);data.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.w);data.shadowCoord=TransformWorldToShadowCoord(i.w);data.bakedGI=SampleSH(data.normalWS);data.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);data.shadowMask=half4(1,1,1,1);half4 color=UniversalFragmentPBR(data,surface);float distance=length(_WorldSpaceCameraPos-i.w);float air=saturate((distance-15)/50)*_A2R3DWindOn;color.rgb=lerp(color.rgb,color.rgb*half3(.97,.99,1.02),air);color.a=fading?surface.alpha*lerp(1,.10,f):1;return color;}
