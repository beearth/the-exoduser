#include "Wind.hlsl"
float _A2RNatureOn;int _A2RActorCount,_A2RPierCount,_A2RRippleCount;float4 _A2RActors[32],_A2RRipples[24],_A2RPiers[8];
TEXTURE2D(_A2RWaterDomain);SAMPLER(sampler_A2RWaterDomain);float _A2RWaterDomainReady;
void A2RWaterClip(float3 world){if(_A2RWaterDomainReady>.5)clip(SAMPLE_TEXTURE2D(_A2RWaterDomain,sampler_A2RWaterDomain,float2(world.x,-world.z)/80).r-.5);}
float3 A2RBend(float3 world,float root,float amplitude,float phase)
{
 if(_A2RNatureOn<.5||_A2RWindOff>.5||amplitude<=0)return world;
 root=saturate(root);root*=root;
 phase=A2RWindPhase(phase/6.2831853,TransformObjectToWorld(float3(0,0,0)));
 float wind=A2RWindWave(_Time.y,phase,A2RWindGust(_Time.y,world));
 world.xz+=float2(1,.28)*wind*amplitude*root;
 float2 push=0;for(int k=0;k<min(32,_A2RActorCount);k++){float2 away=world.xz-_A2RActors[k].xz;float d=length(away);push+=away/max(d,.05)*saturate(1-d/max(.1,_A2RActors[k].w))*root*amplitude*4;}world.xz+=push/max(1,length(push)/max(.001,amplitude*4));
 return world;
}
float A2RWave(float2 p)
{
 if(_A2RNatureOn<.5)return 0;float h=0;
 for(int k=0;k<min(24,_A2RRippleCount);k++){float4 r=_A2RRipples[k];float age=_Time.y-r.z;float d=length(p-r.xy);if(age<3.2&&d<2){float band=d-age*.48;h+=r.w*sin(band*21)*exp(-band*band*28)*exp(-age*.9)*saturate(age*4)*(1-smoothstep(2.6,3.2,age));}}
 for(int n=0;n<min(8,_A2RPierCount);n++){float d=length(p-_A2RPiers[n].xy);if(d<3)h+=sin(d*13-_Time.y*1.35+n)*exp(-d*1.7)*.005;}
 return h;
}
