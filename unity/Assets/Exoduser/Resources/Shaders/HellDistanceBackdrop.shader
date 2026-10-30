Shader "EXODUSER/HellDistanceBackdrop"
{
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
        Pass
        {
            Tags { "LightMode"="UniversalForward" }
            Cull Off
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_fog
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            struct A { float4 positionOS:POSITION; };
            struct V { float4 positionCS:SV_POSITION; half fog:TEXCOORD0; };
            V vert(A i){V o;o.positionCS=TransformObjectToHClip(i.positionOS.xyz);o.fog=ComputeFogFactor(o.positionCS.z);return o;}
            half4 frag(V i):SV_Target{return half4(MixFog(half3(.018,.030,.045),i.fog),1);}
            ENDHLSL
        }
    }
}
