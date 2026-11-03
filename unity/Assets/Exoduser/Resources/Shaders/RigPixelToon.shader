Shader "Exoduser/RigPixelToon" {
 Properties { _BaseMap("Albedo",2D)="white"{} _BaseColor("Tint",Color)=(1,1,1,1) }
 SubShader {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Pass {
   Tags { "LightMode"="UniversalForwardOnly" }
   Cull Back ZWrite On
   HLSLPROGRAM
   #pragma vertex Vert
   #pragma fragment Frag
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap); SAMPLER(sampler_BaseMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;half3 normal:TEXCOORD1;float2 uv:TEXCOORD2;};
   V Vert(A v){V o;VertexPositionInputs p=GetVertexPositionInputs(v.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.normal=TransformObjectToWorldNormal(v.normalOS);o.uv=TRANSFORM_TEX(v.uv,_BaseMap);return o;}
   half Band(half d){return floor(saturate(d)*3+.5h)/3;}
   half3 Irradiance(Light light,half3 normal){return light.color*(.12h+.88h*Band(dot(normal,light.direction)))*light.distanceAttenuation*light.shadowAttenuation;}
   half4 Frag(V i):SV_Target {
    half4 albedo=SAMPLE_TEXTURE2D_BIAS(_BaseMap,sampler_BaseMap,i.uv,1.5)*_BaseColor;clip(albedo.a-.2h);
    half3 n=normalize(i.normal);Light moon=GetMainLight(TransformWorldToShadowCoord(i.world));
    half3 diffuse=max(SampleSH(n),half3(.14h,.15h,.18h))+Irradiance(moon,n);
    InputData inputData=(InputData)0;inputData.positionWS=i.world;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);
    #if defined(_ADDITIONAL_LIGHTS) || USE_CLUSTER_LIGHT_LOOP
     #if USE_CLUSTER_LIGHT_LOOP
      for(uint lightIndex=0;lightIndex<min(URP_FP_DIRECTIONAL_LIGHTS_COUNT,MAX_VISIBLE_LIGHTS);lightIndex++){Light light=GetAdditionalLight(lightIndex,i.world);diffuse+=Irradiance(light,n);}
     #endif
     uint count=GetAdditionalLightsCount();
     LIGHT_LOOP_BEGIN(count)
      Light light=GetAdditionalLight(lightIndex,i.world);diffuse+=Irradiance(light,n);
     LIGHT_LOOP_END
    #endif
    half3 view=GetWorldSpaceNormalizeViewDir(i.world);
    half edge=step(.68h,1-saturate(dot(n,view)))*step(.2h,dot(n,moon.direction));
    // Large colour planes, four diffuse steps, moon-facing edge only; no normal-map speckle or dither.
    half3 color=albedo.rgb*min(diffuse,half3(1.5h,1.5h,1.5h))+moon.color*edge*.12h;
    return half4(color,1);
   }
   ENDHLSL
  }
 }
}
