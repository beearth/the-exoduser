float4 _A2RTargets[128],_A2RBattle;float4x4 _A2RViewportVP;int _A2RTargetCount;float _A2RFade,_A2RMaskBattle,_A2RRearClip;
TEXTURE2D(_A2RNearestDepth);SAMPLER(sampler_A2RNearestDepth);float4x4 _A2RNearestVP,_A2RNearestView;float _A2RNearestReady,_A2RDepthTolerance;
float A2RBattleMask(float3 world){float4 p=mul(_A2RViewportVP,float4(world,1));return 1-smoothstep(0,1,length((p.xy/p.w*.5+.5-_A2RBattle.xy)/_A2RBattle.zw));}
void A2RKeepNearest(float3 world){if(_A2RNearestReady<.5)return;float4 p=mul(_A2RNearestVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;
#if UNITY_UV_STARTS_AT_TOP
uv.y=1-uv.y;
#endif
float nearest=SAMPLE_TEXTURE2D(_A2RNearestDepth,sampler_A2RNearestDepth,uv).r;float own=-mul(_A2RNearestView,float4(world,1)).z;clip(nearest+_A2RDepthTolerance-own);}
// Rear opaque trunks must also be removed. Otherwise they show through the nearest faded trunk.
// No nearest foreground coverage => the cleared far depth retains the original background.
void A2RRejectRear(float3 world){if(_A2RRearClip>.5&&A2RBattleMask(world)>.002)A2RKeepNearest(world);}
float A2RFadeMask(float3 world,float4 positionCS)
{
    if(_A2RFade<=0||_A2RNearestReady<.5)return 0;
    // 20:40 supersedes target circles: outside the battle ellipse is fully opaque.
    return A2RBattleMask(world)*saturate(_A2RFade);
}
