Shader "EXODUSER/A2HangingMoss"
{
 Properties { _BaseMap("수염이끼 사진",2D)="white"{} _BaseColor("회갈색 이끼",Color)=(.85,.79,.63,1) _Cutoff("사진 잘림",Range(0,1))=.32 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="TransparentCutout" "Queue"="AlphaTest" }
  Cull Off
  Pass
  {
   Name "Forward" Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;half _Cutoff;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float2 uv:TEXCOORD2;half fog:TEXCOORD3;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.uv=TRANSFORM_TEX(v.uv,_BaseMap);o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i,FRONT_FACE_TYPE face:FRONT_FACE_SEMANTIC):SV_Target
   {
    half4 photo=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv);clip(photo.a-_Cutoff);
    half luma=sqrt(saturate(dot(photo.rgb,half3(.2126,.7152,.0722))));half3 albedo=lerp(luma.xxx,photo.rgb,.18)*_BaseColor.rgb;
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(i.normal)*IS_FRONT_VFACE(face,1,-1);input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData surface=(SurfaceData)0;surface.albedo=albedo;surface.alpha=1;surface.occlusion=1;surface.normalTS=half3(0,0,1);surface.specular=.04;surface.smoothness=.15;
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return color;
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
 }
}
