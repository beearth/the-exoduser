float4 _A2RHoles[33],_A2RHoleScreen;float _A2RHoleCount,_A2RHoleA,_A2RHoleB,_A2RHoleC;float _A2RFade;
float4x4 _A2RViewportVP,_A2RNearestVP,_A2RNearestView;float _A2RNearestReady,_A2RDepthTolerance;
TEXTURE2D(_A2RNearestDepth);SAMPLER(sampler_A2RNearestDepth);
float A2RHoleMask(float3 world){uint holeLo=(uint)(_A2RHoleA+.5)|((uint)(_A2RHoleB+.5)<<16);uint holeHi=(uint)(_A2RHoleC+.5);if((holeLo|holeHi)==0)return 0;float4 p=mul(_A2RViewportVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;float depth=-mul(_A2RNearestView,float4(world,1)).z;float mask=0;for(int i=0;i<min(33,(int)(_A2RHoleCount+.5));i++){bool enabled=i<32?((holeLo&(1u<<i))!=0):((holeHi&(1u<<(i-32)))!=0);if(!enabled||depth>=_A2RHoles[i].w-.02)continue;float d=length((uv-_A2RHoles[i].xy)*_A2RHoleScreen.xy)/max(1,_A2RHoles[i].z);mask=max(mask,1-smoothstep(.6,1,d));}return mask;}
void A2RKeepNearest(float3 world){if(_A2RNearestReady<.5)return;float4 p=mul(_A2RNearestVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;
#if UNITY_UV_STARTS_AT_TOP
uv.y=1-uv.y;
#endif
float nearest=SAMPLE_TEXTURE2D(_A2RNearestDepth,sampler_A2RNearestDepth,uv).r;float own=-mul(_A2RNearestView,float4(world,1)).z;clip(nearest+_A2RDepthTolerance-own);}
void A2RRejectRear(float3 world){if(A2RHoleMask(world)>.002)A2RKeepNearest(world);}
float A2RFadeMask(float3 world,float4 positionCS){return _A2RNearestReady>.5?A2RHoleMask(world)*saturate(_A2RFade):0;}
