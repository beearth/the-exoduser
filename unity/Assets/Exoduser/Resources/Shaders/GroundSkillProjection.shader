Shader "EXODUSER/GroundSkillProjection"
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
        _GroundVertexShape ("Vertex colour warning volume",Float)=0
        _GroundEdgeFeather ("Cell edge feather in original UV",Float)=0
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
            float _SourceMode,_Flat,_NormalBlend,_Opacity,_GroundRingRadius,_GroundRingWidth,_GroundVertexShape,_GroundEdgeFeather;
            half4 _SourceTint;float4 _GroundAnchor,_GroundUvU,_GroundUvV,_GroundUvRect;
            float4 _GroundShapeHeight;
            int _ExoduserGroundProbe;
            struct Input { float3 positionOS:POSITION;half4 color:COLOR;float4 triangleAB:TEXCOORD1;float2 triangleC:TEXCOORD2; };
            struct Output { float4 positionCS:SV_POSITION;half4 color:COLOR;float4 triangleAB:TEXCOORD1;float2 triangleC:TEXCOORD2; };
            Output Vert(Input input) { Output o;o.positionCS=TransformObjectToHClip(input.positionOS);o.color=input.color;o.triangleAB=input.triangleAB;o.triangleC=input.triangleC;return o; }
            float Side(float2 a,float2 b,float2 p) { float2 e=b-a,d=p-a;return e.x*d.y-e.y*d.x; }
            float CellEdgeCoverage(float2 uv,float feather) { return feather<=0?1:smoothstep(0,feather,min(min(uv.x,uv.y),min(1-uv.x,1-uv.y))); }
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
                clip(receiver-.0000001);
                #else
                clip(.9999999-receiver);
                #endif
                float sceneEye=Eye(scene),receiverEye=Eye(receiver);
                // Foreground props occlude the receiver; a transparent receiver
                // may be in front of the opaque bed. Reconstruct that receiver.
                clip(sceneEye+.02-receiverEye);
                float depth=receiver;
                #if !UNITY_REVERSED_Z
                depth=lerp(UNITY_NEAR_CLIP_VALUE,1,depth);
                #endif
                float3 world=ComputeWorldSpacePosition(screen,depth,UNITY_MATRIX_I_VP);
                float2 planar=world.xz-_GroundAnchor.xz;
                float2 uv=float2(dot(float3(planar,1),_GroundUvU.xyz),dot(float3(planar,1),_GroundUvV.xyz));
                float2 packed=_GroundUvRect.xy+uv*_GroundUvRect.zw;
                half4 color;float weight;
                if(_GroundVertexShape>.5)
                {
                    clip(world.y-_GroundShapeHeight.x);clip(_GroundShapeHeight.y-world.y);
                    float2 a=input.triangleAB.xy,b=input.triangleAB.zw,c=input.triangleC;
                    clip(min(Side(a,b,world.xz),min(Side(b,c,world.xz),Side(c,a,world.xz)))+.000001);
                    weight=input.color.a;color=half4(input.color.rgb*weight,weight);
                }
                else
                {
                    float3 volume=TransformWorldToObject(world);
                    clip(.50001-max(abs(volume.x),max(abs(volume.y),abs(volume.z))));
                if(_GroundRingRadius>0)
                {
                    const float step=6.28318530718/72;
                    float angle=(floor(atan2(planar.y,planar.x)/step)+.5)*step;
                    float distance=dot(planar,float2(cos(angle),sin(angle)))-_GroundRingRadius*cos(step*.5);
                    float stroke=saturate((_GroundRingWidth*.5-abs(distance))/max(fwidth(distance),.000001)+.5);
                    half a=_SourceTint.a*stroke;weight=a;color=half4(_SourceTint.rgb*a,_NormalBlend>.5?a:0);
                }
                else
                {
                    clip(min(min(uv.x,uv.y),min(1-uv.x,1-uv.y)));
                    half4 p=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,packed);
                    if(_SourceMode>1.5) { color=p*_SourceTint;weight=color.a;color.rgb*=color.a; }
                    else if(_SourceMode>.5) { weight=p.a*_Opacity;color=half4(p.rgb*p.a*_Opacity,0); }
                    else { half a=p.a*_SourceTint.a;if(_Flat>.5)a*=max(p.r,max(p.g,p.b));weight=a;half3 rgb=_Flat>.5?half3(1,1,1):p.rgb;color=half4(rgb*_SourceTint.rgb*a,_NormalBlend>.5?a:0); }
                    // The source slam atlas has opaque pixels cut by cell edges.
                    // Fade in original cell UV, never by receiver/bridge bounds.
                    float edge=CellEdgeCoverage(uv,_GroundEdgeFeather);weight*=edge;color*=edge;
                }
                }
                if(weight<=0)discard;
                if(_ExoduserGroundProbe==1)return float4(world,weight);
                if(_ExoduserGroundProbe==2)return float4(packed,max(color.r,max(color.g,color.b)),weight);
                if(_ExoduserGroundProbe==3)return float4(sceneEye,receiverEye,abs(sceneEye-receiverEye),weight);
                return color;
            }
            ENDHLSL
        }
    }
}
