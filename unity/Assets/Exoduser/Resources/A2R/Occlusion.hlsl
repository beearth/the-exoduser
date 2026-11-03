float4 _A2RTargets[128],_A2RBattle;float4x4 _A2RViewportVP;int _A2RTargetCount;float _A2RFade,_A2RMaskBattle;
TEXTURE2D(_A2RNearestDepth);SAMPLER(sampler_A2RNearestDepth);float4x4 _A2RNearestVP,_A2RNearestView;float _A2RNearestReady,_A2RDepthTolerance;
void A2RKeepNearest(float3 world){if(_A2RNearestReady<.5)return;float4 p=mul(_A2RNearestVP,float4(world,1));float2 uv=p.xy/p.w*.5+.5;
#if UNITY_UV_STARTS_AT_TOP
uv.y=1-uv.y;
#endif
float nearest=SAMPLE_TEXTURE2D(_A2RNearestDepth,sampler_A2RNearestDepth,uv).r;float own=-mul(_A2RNearestView,float4(world,1)).z;clip(nearest+_A2RDepthTolerance-own);}
float A2RFadeMask(float3 world,float4 positionCS)
{
    if(_A2RFade<=0)return 0;
    // Same CPU viewport VP as WorldToViewportPoint; independent of API/RenderTexture Y flips.
    float4 projected=mul(_A2RViewportVP,float4(world,1));
    float2 uv=projected.xy/projected.w*.5+.5;
    float fade=_A2RMaskBattle*(1-smoothstep(.70,1,length((uv-_A2RBattle.xy)/_A2RBattle.zw)));
    if(fade>=1)return saturate(_A2RFade);
    for(int k=0;k<min(128,_A2RTargetCount);k++)
    {
        float4 target=_A2RTargets[k];
        fade=max(fade,1-smoothstep(.70,1,length((uv-target.xy)/target.zw)));
    }
    return fade*saturate(_A2RFade);
}
