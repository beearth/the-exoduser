Shader "EXODUSER/LightShaft"
{
    // RM-1 hell light shaft (LIGHT-HELL #b0281c, edge #5a1410): additive card, thin in the air and strongest where it meets the ground (uv.y 1 = ground). No sun disc.
    Properties { _Color ("Colour", Color) = (0.69, 0.157, 0.11, 1) _Intensity ("Intensity", Float) = 0.035 _Phase ("Phase", Float) = 0 }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent+20" }
        Pass
        {
            Name "Forward"
            Tags { "LightMode"="UniversalForward" }
            ZWrite Off Cull Off Blend SrcAlpha One
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            CBUFFER_START(UnityPerMaterial) half4 _Color; half _Intensity; half _Phase; CBUFFER_END
            struct Attributes { float4 positionOS:POSITION; float2 uv:TEXCOORD0; };
            struct Varyings { float4 positionCS:SV_POSITION; float2 uv:TEXCOORD0; };
            Varyings vert(Attributes v) { Varyings o; o.positionCS = TransformObjectToHClip(v.positionOS.xyz); o.uv = v.uv; return o; }
            half4 frag(Varyings i) : SV_Target
            {
                float across = pow(saturate(1.0 - pow(abs(i.uv.x * 2.0 - 1.0), 2.0)), 2.0);
                float along = smoothstep(0.0, 0.75, i.uv.y) * (1.0 - smoothstep(0.75, 1.0, i.uv.y));
                float flick = 0.88 + 0.12 * sin(_Time.y * 0.7 + _Phase + i.uv.x * 3.0);
                return half4(_Color.rgb, saturate(across * along * min(_Intensity, 0.05) * flick));
            }
            ENDHLSL
        }
    }
}
