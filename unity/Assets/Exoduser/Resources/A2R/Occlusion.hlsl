float4 _A2RTargets[8];int _A2RTargetCount;float _A2RAspect,_A2RFade;
float A2RFadeMask(float3 world,float4 positionCS)
{
    // Both points use the same GPU projection, including Metal's Y orientation.
    // No fragment-depth threshold: the mask boundary is strictly circular in screen space.
    float4 projected=TransformWorldToHClip(world);
    float2 ndc=projected.xy/projected.w;
    float fade=0;
    for(int k=0;k<min(8,_A2RTargetCount);k++)
    {
        float4 target=TransformWorldToHClip(_A2RTargets[k].xyz);
        if(target.w<=0)continue;
        float2 d=(ndc-target.xy/target.w)*float2(_A2RAspect,1)*.5;
        float radius=_A2RTargets[k].w;
        fade=max(fade,1-smoothstep(radius*.70,radius,length(d)));
    }
    return fade*saturate(_A2RFade);
}
