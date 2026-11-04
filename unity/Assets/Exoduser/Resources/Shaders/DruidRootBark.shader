Shader "Exoduser/DruidRootBark"
{
 Properties { _BaseMap("Bark grain",2D)="white"{} }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Pass
  {
   Tags { "LightMode"="UniversalForwardOnly" }
   Cull Off ZWrite On
   HLSLPROGRAM
   #pragma vertex Vert
   #pragma fragment Frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);
   float4 _RigPixelMoonDirection,_RigPixelMoonColor,_RigPixelAmbient;
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 normal:TEXCOORD0;float2 uv:TEXCOORD1;};
   V Vert(A i){V o;o.positionCS=TransformObjectToHClip(i.positionOS.xyz);o.normal=TransformObjectToWorldNormal(i.normalOS);o.uv=i.uv;return o;}
   half4 Frag(V i):SV_Target
   {
    half4 grain=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,float2(frac(i.uv.x),i.uv.y));
    half facet=floor(saturate(dot(normalize(i.normal),_RigPixelMoonDirection.xyz))*3+.5h)/3;
    half3 bark=half3(.069,.040,.019)*(.8h+.8h*grain.a);
    half3 light=max(_RigPixelAmbient.rgb,half3(.4,.39,.36))+_RigPixelMoonColor.rgb*(.15h+.55h*facet);
    return half4(bark*light,.6h);
   }
   ENDHLSL
  }
 }
}
