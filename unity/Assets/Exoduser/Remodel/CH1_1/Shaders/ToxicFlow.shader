Shader "EXODUSER/ToxicFlow"
{
    // RM-1 M_ToxicFlow: toxic river / pool surface (opaque, URP). Flow scroll along uv.y, floating scum streaks, weak self-glow (core L* <= 35), lit by main + additional lights (hell pool lights tint it).
    // Palette (art bible v2 s6): hue 40-65 deg, body #3a2e0a~#4a3a0c, never fluorescent green. Bubbles are the VFX layer (toxic_bubble_spawns.json); this shader only carries a faint blister pattern.
    Properties
    {
        _Deep ("Deep", Color) = (0.165, 0.125, 0.039, 1)
        _Body ("Body", Color) = (0.227, 0.180, 0.039, 1)
        _BodyHi ("Body hi", Color) = (0.290, 0.227, 0.047, 1)
        _Scum ("Scum", Color) = (0.353, 0.314, 0.125, 1)
        _Emit ("Emission", Color) = (0.30, 0.27, 0.07, 1)
        _EmitAmount ("Emission amount", Range(0,1)) = 0.28
        _Flow ("Flow speed", Float) = 0.22
        _Scale ("Noise scale", Float) = 2.1
        _Ambient ("Ambient lift", Range(0,1)) = 0.22
    }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry+10" }
        Pass
        {
            Name "Forward"
            Tags { "LightMode"="UniversalForward" }
            ZWrite On Cull Off
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
            #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
            #pragma multi_compile_fog
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            CBUFFER_START(UnityPerMaterial)
                half4 _Deep; half4 _Body; half4 _BodyHi; half4 _Scum; half4 _Emit; half _EmitAmount; float _Flow; float _Scale; half _Ambient;
            CBUFFER_END
            struct Attributes { float4 positionOS:POSITION; float2 uv:TEXCOORD0; };
            struct Varyings { float4 positionCS:SV_POSITION; float2 uv:TEXCOORD0; float3 positionWS:TEXCOORD1; half fog:TEXCOORD2; };
            float h21(float2 p) { p = frac(p * float2(123.34, 456.21)); p += dot(p, p + 45.32); return frac(p.x * p.y); }
            float vnoise(float2 p) { float2 i = floor(p), f = frac(p); f = f * f * (3.0 - 2.0 * f); return lerp(lerp(h21(i), h21(i + float2(1,0)), f.x), lerp(h21(i + float2(0,1)), h21(i + float2(1,1)), f.x), f.y); }
            float fbm(float2 p) { return vnoise(p) * 0.55 + vnoise(p * 2.03 + 7.1) * 0.30 + vnoise(p * 4.1 + 3.7) * 0.15; }
            Varyings vert(Attributes v)
            {
                Varyings o; o.positionWS = TransformObjectToWorld(v.positionOS.xyz); o.positionCS = TransformWorldToHClip(o.positionWS);
                o.uv = v.uv; o.fog = ComputeFogFactor(o.positionCS.z); return o;
            }
            half4 frag(Varyings i) : SV_Target
            {
                float t = _Time.y * _Flow;
                float2 p = i.uv * _Scale; p.y -= t;
                float body = fbm(p);
                float2 q = float2(p.x * 2.3 + 11.0, p.y * 0.7 - t * 0.6);       // long scum streaks drifting a bit slower than the body
                float streak = smoothstep(0.58, 0.82, fbm(q));
                float blister = smoothstep(0.80, 0.93, vnoise(p * 3.7 + 19.0));    // faint pale blisters (not the bubble VFX)
                half3 albedo = lerp(_Deep.rgb, lerp(_Body.rgb, _BodyHi.rgb, body), smoothstep(0.18, 0.62, body));
                albedo = lerp(albedo, _Scum.rgb, streak * 0.55);
                albedo += _Scum.rgb * blister * 0.25;
                float3 n = float3(0, 1, 0);
                Light m = GetMainLight(TransformWorldToShadowCoord(i.positionWS));
                half3 light = m.color * saturate(dot(n, m.direction)) * m.shadowAttenuation + SampleSH(n) + _Ambient;
                #if defined(_ADDITIONAL_LIGHTS)
                uint cnt = GetAdditionalLightsCount();
                for (uint li = 0u; li < cnt; li++) { Light l = GetAdditionalLight(li, i.positionWS); light += l.color * saturate(dot(n, l.direction) * 0.5 + 0.5) * l.distanceAttenuation; }
                #endif
                half3 col = albedo * light + _Emit.rgb * _EmitAmount * (0.55 + 0.45 * body) * (1.0 - streak * 0.5);
                col = MixFog(col, i.fog);
                return half4(col, 1);
            }
            ENDHLSL
        }
    }
}
