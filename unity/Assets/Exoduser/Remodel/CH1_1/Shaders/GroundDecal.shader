Shader "EXODUSER/GroundDecal"
{
    // RM-1 decal quads (blood / root / bone / wet bank). Alpha-blended quads lying on the Terrain; swapped for URP DecalProjector once the Decal renderer feature lands in the shared URP assets.
    Properties { _MainTex ("Decal", 2D) = "white" {} _Tint ("Tint", Color) = (1,1,1,1) _Alpha ("Alpha", Range(0,1)) = 0.8 _Lit ("Light receive", Range(0,1)) = 0.8 }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent-10" }
        Pass
        {
            Name "Forward"
            Tags { "LightMode"="UniversalForward" }
            ZWrite Off Cull Off Blend SrcAlpha OneMinusSrcAlpha Offset -2, -2
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
            #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
            #pragma multi_compile_fog
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            TEXTURE2D(_MainTex); SAMPLER(sampler_MainTex);
            CBUFFER_START(UnityPerMaterial) float4 _MainTex_ST; half4 _Tint; half _Alpha; half _Lit; CBUFFER_END
            struct Attributes { float4 positionOS:POSITION; float2 uv:TEXCOORD0; half4 color:COLOR; };
            struct Varyings { float4 positionCS:SV_POSITION; float2 uv:TEXCOORD0; float3 positionWS:TEXCOORD1; half fog:TEXCOORD2; half4 color:COLOR; };
            Varyings vert(Attributes v) { Varyings o; o.positionWS = TransformObjectToWorld(v.positionOS.xyz); o.positionCS = TransformWorldToHClip(o.positionWS); o.uv = TRANSFORM_TEX(v.uv, _MainTex); o.fog = ComputeFogFactor(o.positionCS.z); o.color = v.color; return o; }
            half4 frag(Varyings i) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv);
                half3 n = half3(0, 1, 0);
                Light m = GetMainLight(TransformWorldToShadowCoord(i.positionWS));
                half3 light = m.color * saturate(dot(n, m.direction)) * m.shadowAttenuation + SampleSH(n) + 0.12;
                #if defined(_ADDITIONAL_LIGHTS)
                uint cnt = GetAdditionalLightsCount();
                for (uint li = 0u; li < cnt; li++) { Light l = GetAdditionalLight(li, i.positionWS); light += l.color * saturate(dot(n, l.direction) * 0.5 + 0.5) * l.distanceAttenuation; }
                #endif
                half3 col = tex.rgb * _Tint.rgb * i.color.rgb * lerp(1, light, _Lit);
                col = MixFog(col, i.fog);
                return half4(col, tex.a * _Alpha * i.color.a);
            }
            ENDHLSL
        }
    }
}
