Shader "Hidden/EXODUSER/QA/GroundReceiverFullReference" {
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
            float4 _RingStroke[32];
            int _ReferenceMode;
            half4 _SourceTint;
            float _SourceMode,_Flat,_NormalBlend,_Opacity;
            half4 ReferenceColor(half4 p,out float weight) {
                half4 color;
                if(_SourceMode>1.5) { color=p*_SourceTint;weight=color.a;color.rgb*=color.a; }
                else if(_SourceMode>.5) { weight=p.a*_Opacity;color=half4(p.rgb*p.a*_Opacity,0); }
                else { half a=p.a*_SourceTint.a;if(_Flat>.5)a*=max(p.r,max(p.g,p.b));weight=a;half3 rgb=_Flat>.5?half3(1,1,1):p.rgb;color=half4(rgb*_SourceTint.rgb*a,_NormalBlend>.5?a:0); }
                return color;
            }
            struct Attributes { float4 vertex : POSITION; };
            struct Varyings { float4 position : SV_POSITION; };
            Varyings Vert(Attributes input) { Varyings output; output.position=UnityObjectToClipPos(input.vertex); return output; }
            float4 Frag(Varyings input) : SV_Target {
                int pixel=(int)floor(input.position.x);
                int index=_ReferenceMode==2?pixel/4:pixel;
                float2 uv=_SampleUvDx[index].xy;
                if(_ReferenceMode==6||_ReferenceMode==7) {
                    half a=_SourceTint.a*_RingStroke[index].x;
                    half4 color=half4(_SourceTint.rgb*a,_NormalBlend>.5?a:0);
                    if(_ReferenceMode==6)return color;
                    return float4(a,max(color.r,max(color.g,color.b)),0,1);
                }
                if(_ReferenceMode==0) return _ReferenceSource.SampleLevel(sampler_ReferenceSource,uv,0);
                if(_ReferenceMode==3||_ReferenceMode==4) {
                    half4 p=_ReferenceSource.SampleGrad(sampler_ReferenceSource,uv,_SampleUvDx[index].zw,_SampleDy[index].xy);
                    float weight;half4 color=ReferenceColor(p,weight);
                    if(_ReferenceMode==3)return float4(weight,max(color.r,max(color.g,color.b)),p.a,1);
                    return color;
                }
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
