Shader "EXODUSER/HellEnvironmentLit"
{
 Properties { _BaseMap("CC0 돌 표면",2D)="white"{} _RoughMap("CC0 거칠기",2D)="white"{} _BumpMap("표면 노멀",2D)="bump"{} _Tint("재질 색",Color)=(.5,.5,.5,1) _Smoothness("매끈함",Range(0,1))=.2 _Scale("월드 타일",Float)=1.8 _BaseColor("깊이패스 색",Color)=(1,1,1,1) _Cutoff("깊이패스",Float)=.5 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Pass
  {
   Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_RoughMap);SAMPLER(sampler_RoughMap);TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
   CBUFFER_START(UnityPerMaterial)
   half4 _Tint,_BaseColor;float _Scale;half _Smoothness,_Cutoff;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;half fog:TEXCOORD2;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    float3 n=normalize(i.normal),w=pow(abs(n),4);w/=max(w.x+w.y+w.z,.001);float3 p=i.world/_Scale;
    half3 a=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,p.zy).rgb*w.x+SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,p.xz).rgb*w.y+SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,p.xy).rgb*w.z;
    half3 bump=UnpackNormalScale(SAMPLE_TEXTURE2D(_BumpMap,sampler_BumpMap,p.xz),.22);
    n=normalize(n+float3(bump.x,0,bump.y)*.22);
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=n;input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(n);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData surface=(SurfaceData)0;surface.albedo=a*_Tint.rgb;surface.alpha=1;surface.occlusion=1;surface.normalTS=half3(0,0,1);surface.specular=.04;surface.smoothness=_Smoothness*(1-SAMPLE_TEXTURE2D(_RoughMap,sampler_RoughMap,p.xz).r*.65);
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return color;
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
