Shader "EXODUSER/HellHeightFog"
{
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" }
        Pass
        {
            ZWrite Off ZTest Always Cull Off
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
            float localFire(float3 p,float2 xz)
            {
                float d=distance(p,float3(xz.x,1.1,xz.y));return pow(saturate(1-d/4.7),2)*2.4;
            }
            half4 Frag(Varyings i):SV_Target
            {
                half4 source=SAMPLE_TEXTURE2D_X(_BlitTexture,sampler_LinearClamp,i.texcoord);float depth=SampleSceneDepth(i.texcoord);
                #if UNITY_REVERSED_Z
                if(depth<.0001)return source;
                #else
                if(depth>.9999)return source;
                depth=lerp(UNITY_NEAR_CLIP_VALUE,1,depth);
                #endif
                float3 end=ComputeWorldSpacePosition(i.texcoord,depth,UNITY_MATRIX_I_VP);float3 ray=end-_WorldSpaceCameraPos;float stepLength=length(ray)/16;float trans=1;float3 scatter=0;
                for(int j=0;j<16;j++)
                {
                    float3 p=_WorldSpaceCameraPos+ray*((j+.5)/16.0);
                    float density=.065*exp(-max(p.y-.4,0)*1.8);float a=1-exp(-density*stepLength);
                    float fire=localFire(p,float2(38,-73.2))+localFire(p,float2(43.6,-69.6))+localFire(p,float2(40,-62.4))+localFire(p,float2(44.8,-56.8))+localFire(p,float2(32.2,-61));
                    float3 light=float3(.06,.12,.16)+fire*float3(.6,.17,.025);scatter+=trans*a*light;trans*=1-a;
                }
                return half4(source.rgb*trans+scatter,source.a);
            }
            ENDHLSL
        }
    }
}
