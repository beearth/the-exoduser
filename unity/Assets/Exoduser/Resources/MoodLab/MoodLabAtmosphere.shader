Shader "EXODUSER/MoodLab/Atmosphere"
{
    Properties
    {
        _FogTint("Fog tint", Color) = (.105,.145,.17,1)
        _RimColor("Rim tint", Color) = (0,0,0,1)
        _ProbeMask("Upper probe rim only", Float) = 0
        _HeightDensity("Height extinction", Float) = 0
        _HeightBase("Layer reference height", Float) = 0
        _HeightFalloff("Height falloff", Float) = 0
        _HeightLaneFloor("Lane density multiplier", Float) = 0
        _VolumeDensity("Smooth medium extinction", Float) = 0
        _VolumeFloor("Smooth medium floor", Float) = 0
        _Scatter("Directional scattering blend", Float) = 0
        _OpticalDepthCap("Extra optical depth cap", Float) = 0
        _RimPower("Fresnel power", Float) = 0
        _RimStrength("Rim strength", Float) = 0
        _Origin("Lab reference", Vector) = (0,0,0,0)
        _LinearFog("Existing linear fog range", Vector) = (19,62,0,0)
    }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent" }
        Pass
        {
            Tags { "LightMode"="UniversalForward" }
            Blend One OneMinusSrcAlpha
            ZWrite Off
            ZTest Equal
            Cull Back
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            CBUFFER_START(UnityPerMaterial)
                float4 _FogTint, _RimColor, _Origin, _LinearFog;
                float _ProbeMask, _HeightDensity, _HeightBase, _HeightFalloff, _HeightLaneFloor;
                float _VolumeDensity, _VolumeFloor, _Scatter, _OpticalDepthCap, _RimPower, _RimStrength;
            CBUFFER_END
            struct Attributes { float3 positionOS : POSITION; float3 normalOS : NORMAL; };
            struct Varyings { float4 positionCS : SV_POSITION; float3 world : TEXCOORD0; float3 normal : TEXCOORD1; };
            Varyings Vert(Attributes input)
            {
                Varyings output;
                output.world = TransformObjectToWorld(input.positionOS);
                output.positionCS = TransformWorldToHClip(output.world);
                output.normal = TransformObjectToWorldNormal(input.normalOS);
                return output;
            }
            half4 Frag(Varyings input) : SV_Target
            {
                float3 camera = GetCameraPositionWS();
                float3 ray = input.world-camera;
                float lengthWS = length(ray);
                float3 direction = ray/max(lengthWS, .0001);
                float integral = 0;
                // 저작 시험값, CX1 §3/§4.1 원칙 기준: 24 fixed midpoint samples, zero temporal/random sampling.
                // Height is clamped below the reference layer to avoid exponential growth underground.
                for (int s = 0; s < 24; s++)
                {
                    float3 p = camera+ray*((s+.5)/24.0)-_Origin.xyz;
                    // 저작 시험값, CX1 §3/§10 원칙 기준: lane center .25 in b, shoulders spread 2.2..6.2u.
                    float lateral = lerp(_HeightLaneFloor, 1, smoothstep(2.2,6.2,abs(p.x)));
                    float heightDensity = _HeightDensity*exp(-_HeightFalloff*max(p.y-_HeightBase,0))*lateral;
                    // 저작 시험값, CX1 §4.1/§10 원칙 기준: one continuous tilted lobe at local 6/8u,
                    // tilt .3/.1 and squared radii 16/64. No textures, noise, dithering or jitter.
                    float qx = p.x-6-p.y*.3, qz = p.z-8-p.y*.1;
                    float volumeDensity = _VolumeDensity*lerp(_VolumeFloor,1,exp(-qx*qx/16-qz*qz/64));
                    integral += heightDensity+volumeDensity;
                }
                float tau = min(_OpticalDepthCap, integral*lengthWS/24.0);
                float transmission = exp(-tau);
                // Artistic single-scattering surrogate, no light/shadow sampling, no multiple scattering.
                // 저작 시험값, CX1 §4.1 원칙 기준: fixed light direction/phase shape, no claimed physical phase law.
                float phase = .5+.5*pow(saturate(dot(direction,normalize(float3(-.4,.8,.3)))),4);
                float3 fog = _FogTint.rgb*lerp(1,phase,_Scatter)*(1-transmission);
                // CX1 §8: camera Fresnel masked to upper proxy body; flat box faces are not a pixel-width outline.
                float rim = pow(1-saturate(dot(normalize(input.normal),-direction)),max(_RimPower,.001));
                rim *= _ProbeMask*smoothstep(.75,1.15,input.world.y-_Origin.y)*_RimStrength;
                float eyeDepth = -TransformWorldToView(input.world).z;
                float linearT = saturate((_LinearFog.y-eyeDepth)/max(_LinearFog.y-_LinearFog.x,.001));
                return half4(fog+_RimColor.rgb*rim*transmission*linearT, 1-transmission);
            }
            ENDHLSL
        }
    }
}
