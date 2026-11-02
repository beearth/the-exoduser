Shader "Hidden/EXODUSER/QA/GroundReceiverTriadBias"
{
    Properties
    {
        [PerRendererData] _MainTex ("Original art",2D)="white" {}
        _DstBlend ("Original destination blend",Float)=1
        _SourceMode ("Skill / Ki / sprite",Float)=0
        _Flat ("Flat tint",Float)=0
        _NormalBlend ("Normal alpha",Float)=0
        _Opacity ("Original opacity",Float)=1
        _SourceTint ("Original tint",Vector)=(1,1,1,1)
        _GroundRingRadius ("Original polygon ring",Float)=0
        _GroundRingWidth ("Original ring width",Float)=.03
    }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent" "DisableBatching"="True" }
        Pass
        {
            Tags { "LightMode"="ExoduserGroundProjection" }
            Cull Front ZWrite Off ZTest Always Blend One [_DstBlend]
            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
            TEXTURE2D_X_FLOAT(_ExoduserGroundDepth);
            TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);
            float _SourceMode,_Flat,_NormalBlend,_Opacity,_GroundRingRadius,_GroundRingWidth;
            half4 _SourceTint;float4 _GroundAnchor,_GroundUvU,_GroundUvV,_GroundUvRect;
            int _ExoduserGroundProbe,_QaEvidenceKind;
            struct Input { float3 positionOS:POSITION; };
            struct Output { float4 positionCS:SV_POSITION; };
            Output Vert(Input input) { Output o;o.positionCS=TransformObjectToHClip(input.positionOS);return o; }
            float Eye(float depth)
            {
                if(unity_OrthoParams.w>.5)
                {
                    #if UNITY_REVERSED_Z
                    return lerp(_ProjectionParams.z,_ProjectionParams.y,depth);
                    #else
                    return lerp(_ProjectionParams.y,_ProjectionParams.z,depth);
                    #endif
                }
                return LinearEyeDepth(depth,_ZBufferParams);
            }
            float4 Frag(Output input):SV_Target
            {
                // The camera and receiver are intermediate textures in the same
                // raster orientation. Match URP's projector reconstruction: load
                // raster pixels and invert the unmodified normalized position.
                uint2 pixel=uint2(input.positionCS.xy);
                float2 screen=input.positionCS.xy*_ScreenSize.zw;
                float scene=LoadSceneDepth(pixel);
                float receiver=LOAD_TEXTURE2D_X(_ExoduserGroundDepth,pixel).r;
                #if UNITY_REVERSED_Z
                clip(min(scene,receiver)-.0000001);
                #else
                clip(.9999999-max(scene,receiver));
                #endif
                float sceneEye=Eye(scene),receiverEye=Eye(receiver);
                clip(.02-abs(sceneEye-receiverEye));
                float depth=scene;
                #if !UNITY_REVERSED_Z
                depth=lerp(UNITY_NEAR_CLIP_VALUE,1,depth);
                #endif
                float3 world=ComputeWorldSpacePosition(screen,depth,UNITY_MATRIX_I_VP);
                float3 volume=TransformWorldToObject(world);
                clip(.50001-max(abs(volume.x),max(abs(volume.y),abs(volume.z))));
                float2 planar=world.xz-_GroundAnchor.xz;
                float2 uv=float2(dot(float3(planar,1),_GroundUvU.xyz),dot(float3(planar,1),_GroundUvV.xyz));
                float2 packed=_GroundUvRect.xy+uv*_GroundUvRect.zw;
                half4 color;float weight;float4 qaDerivative=0;
                if(_GroundRingRadius>0)
                {
                    const float step=6.28318530718/72;
                    float angle=(floor(atan2(planar.y,planar.x)/step)+.5)*step;
                    float distance=dot(planar,float2(cos(angle),sin(angle)))-_GroundRingRadius*cos(step*.5);
                    float stroke=saturate((_GroundRingWidth*.5-abs(distance))/max(fwidth(distance),.000001)+.5);
                    qaDerivative=float4(distance,fwidth(distance),stroke,0);
                    half a=_SourceTint.a*stroke;weight=a;color=half4(_SourceTint.rgb*a,_NormalBlend>.5?a:0);
                }
                else
                {
                    clip(min(min(uv.x,uv.y),min(1-uv.x,1-uv.y)));
                    qaDerivative=float4(ddx(packed),ddy(packed));
                    half4 p=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,packed);
                    if(_SourceMode>1.5) { color=p*_SourceTint;weight=color.a;color.rgb*=color.a; }
                    else if(_SourceMode>.5) { weight=p.a*_Opacity;color=half4(p.rgb*p.a*_Opacity,0); }
                    else { half a=p.a*_SourceTint.a;if(_Flat>.5)a*=max(p.r,max(p.g,p.b));weight=a;half3 rgb=_Flat>.5?half3(1,1,1):p.rgb;color=half4(rgb*_SourceTint.rgb*a,_NormalBlend>.5?a:0); }
                }
                if(weight<=0)discard;
                if(_QaEvidenceKind==6)return float4(_GlobalMipBias.xy,0,0);
                if(_QaEvidenceKind==0)return float4(world,weight);
                if(_QaEvidenceKind==1)return float4(packed,max(color.r,max(color.g,color.b)),weight);
                if(_QaEvidenceKind==2)return float4(sceneEye,receiverEye,abs(sceneEye-receiverEye),weight);
                if(_QaEvidenceKind==3)return color;
                if(_QaEvidenceKind==4)return qaDerivative;
                return float4(_GroundAnchor.x,_GroundAnchor.z,_GroundRingRadius,_GroundRingWidth);
            }
            ENDHLSL
        }
    }
}
