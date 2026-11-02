Shader "Hidden/EXODUSER/QA/GroundReceiverSamplerReference" {
    Properties { _ReferenceSource("Actual source",2D)="white" {} }
    SubShader {
        Tags { "RenderType"="Opaque" }
        Pass {
            Cull Off ZWrite Off ZTest Always Blend Off
            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex Vert
            #pragma fragment Frag
            #include "UnityCG.cginc"
            Texture2D<float4> _ReferenceSource;
            SamplerState sampler_ReferenceSource;
            float4 _SampleUvDx[32]; // packed source UV, finite-difference dUV/dx
            float4 _SampleDy[32];   // finite-difference dUV/dy
            float4 _ReferenceSize;
            int _ReferenceMode;
            struct Attributes { float4 vertex : POSITION; };
            struct Varyings { float4 position : SV_POSITION; };
            Varyings Vert(Attributes input) { Varyings output; output.position=UnityObjectToClipPos(input.vertex); return output; }
            float4 Frag(Varyings input) : SV_Target {
                int pixel=(int)floor(input.position.x);
                int index=_ReferenceMode==2?pixel/4:pixel;
                float2 uv=_SampleUvDx[index].xy;
                if(_ReferenceMode==0) return _ReferenceSource.SampleLevel(sampler_ReferenceSource,uv,0);
                if(_ReferenceMode==1) return _ReferenceSource.SampleGrad(sampler_ReferenceSource,uv,_SampleUvDx[index].zw,_SampleDy[index].xy);
                int corner=pixel%4;
                int2 at=(int2)floor(uv*_ReferenceSize.xy-.5)+int2(corner%2,corner/2);
                at=clamp(at,int2(0,0),(int2)_ReferenceSize.xy-1);
                return _ReferenceSource.Load(int3(at,0));
            }
            ENDHLSL
        }
    }
    Fallback Off
}
