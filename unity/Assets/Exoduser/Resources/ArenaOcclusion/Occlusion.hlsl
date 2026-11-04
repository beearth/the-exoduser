float4 _ArenaTargets[128],_ArenaBattle,_ArenaBattleBoss;float4x4 _ArenaViewportVP;int _ArenaTargetCount;float _ArenaFade,_ArenaMaskBattle,_ArenaRearClip;
TEXTURE2D(_ArenaNearestDepth);SAMPLER(sampler_ArenaNearestDepth);float4x4 _ArenaNearestVP,_ArenaNearestView;float _ArenaNearestReady,_ArenaDepthTolerance;
float A2REllipse(float2 uv,float4 e){return e.z>0?1-smoothstep(.72,1,length((uv-e.xy)/e.zw)):0;}
float A2RBattleMask(float3 world){float4 p=mul(_ArenaViewportVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;return max(A2REllipse(uv,_ArenaBattle),A2REllipse(uv,_ArenaBattleBoss));}
void A2RKeepNearest(float3 world){if(_ArenaNearestReady<.5)return;float4 p=mul(_ArenaNearestVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;
#if UNITY_UV_STARTS_AT_TOP
uv.y=1-uv.y;
#endif
float nearest=SAMPLE_TEXTURE2D(_ArenaNearestDepth,sampler_ArenaNearestDepth,uv).r;float own=-mul(_ArenaNearestView,float4(world,1)).z;clip(nearest+_ArenaDepthTolerance-own);}
// Rear opaque trunks must also be removed. Otherwise they show through the nearest faded trunk.
// No nearest foreground coverage => the cleared far depth retains the original background.
void A2RRejectRear(float3 world){if(_ArenaRearClip>.5&&A2RBattleMask(world)>.002)A2RKeepNearest(world);}
float A2RFadeMask(float3 world,float4 positionCS)
{
    if(_ArenaFade<=0||_ArenaNearestReady<.5)return 0;
    // 20:40 supersedes target circles: outside the battle ellipse is fully opaque.
    return A2RBattleMask(world)*saturate(_ArenaFade);
}
