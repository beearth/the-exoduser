Shader "EXODUSER/GroundSkillReceiverDepth"
{
    Properties { _Bounded ("Registered support range", Float)=0 }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Geometry" }
        Pass
        {
            Tags { "LightMode"="ExoduserGroundReceiver" }
            ZWrite On ZTest LEqual Cull Off ColorMask 0
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            float _Bounded;
            struct Input { float3 positionOS:POSITION;float2 range:TEXCOORD1; };
            struct Output { float4 positionCS:SV_POSITION;float y:TEXCOORD0;float2 range:TEXCOORD1; };
            Output Vert(Input input) { Output o;float3 world=TransformObjectToWorld(input.positionOS);o.positionCS=TransformWorldToHClip(world);o.y=world.y;o.range=input.range;return o; }
            half4 Frag(Output input):SV_Target { if(_Bounded>.5) { clip(input.y-input.range.x);clip(input.range.y-input.y); }return 0; }
            ENDHLSL
        }
    }
}
