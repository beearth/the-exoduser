Shader "Exoduser/RigPixelToon" {
 Properties { _BaseMap("Albedo",2D)="white"{} _BaseColor("Tint",Color)=(1,1,1,1) _PaletteColor("Material plane",Color)=(.18,.205,.235,1) }
 SubShader {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Pass {
   Tags { "LightMode"="UniversalForwardOnly" }
   Cull Back ZWrite On
   HLSLPROGRAM
   #pragma vertex Vert
   #pragma fragment Frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_BaseMap); SAMPLER(sampler_BaseMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor,_PaletteColor;
   CBUFFER_END
   float4 _RigPixelMoonDirection,_RigPixelMoonColor,_RigPixelAmbient,_RigPixelPointPositions[4],_RigPixelPointColors[4];
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;half3 normal:TEXCOORD1;float2 uv:TEXCOORD2;};
   V Vert(A v){V o;VertexPositionInputs p=GetVertexPositionInputs(v.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.normal=TransformObjectToWorldNormal(v.normalOS);o.uv=TRANSFORM_TEX(v.uv,_BaseMap);return o;}
   half Band(half d){return floor(saturate(d)*3+.5h)/3;}
   half3 Irradiance(half3 direction,half3 color,half attenuation,half3 normal){color*=attenuation;half peak=max(color.r,max(color.g,color.b));half3 energy=color*(1.1h/(1+peak));return energy*(.12h+.88h*Band(dot(normal,direction)));}
   half4 Frag(V i):SV_Target {
    half4 albedo=SAMPLE_TEXTURE2D_BIAS(_BaseMap,sampler_BaseMap,i.uv,4)*_BaseColor;clip(albedo.a-.2h);albedo.rgb=_PaletteColor.rgb;
    half3 n=normalize(i.normal);
    half3 diffuse=max(_RigPixelAmbient.rgb,half3(.24h,.25h,.28h))+Irradiance(_RigPixelMoonDirection.xyz,_RigPixelMoonColor.rgb,1,n);
    [unroll]for(int lightIndex=0;lightIndex<4;lightIndex++){
     float3 delta=_RigPixelPointPositions[lightIndex].xyz-i.world;float distance2=max(.01,dot(delta,delta));float range=max(.01,_RigPixelPointPositions[lightIndex].w);
     half fade=saturate(1-distance2/(range*range));half attenuation=fade*fade/(1+distance2);
     diffuse+=Irradiance(delta*rsqrt(distance2),_RigPixelPointColors[lightIndex].rgb,attenuation,n);
    }
    // Low-frequency material planes; the silhouette rim is applied after rendering, never on interior mesh facets.
    half3 color=albedo.rgb*min(diffuse,half3(1.35h,1.35h,1.35h));
    return half4(color,1);
   }
   ENDHLSL
  }
 }
}
