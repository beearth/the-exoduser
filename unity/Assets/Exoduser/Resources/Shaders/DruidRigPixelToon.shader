Shader "Exoduser/DruidRigPixelToon" {
 Properties { _DruidGlow("Unlit olive glow",Float)=0 _DruidGlowStrength("Glow pulse",Range(0,1))=1 _DruidEmission("Withered olive centre",Color)=(.698,.710,.486,1) _DruidGroundY("Arena plane",Float)=0 _DruidGroundClip("Sink plane enabled",Float)=0 _BaseMap("Albedo",2D)="white"{} _BaseColor("Tint",Color)=(1,1,1,1) _PaletteColor("Material plane",Color)=(.18,.205,.235,1) _SurfaceTag("Internal surface label",Float)=1 _MetallicPlane("Broad metal highlight",Float)=0 }
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
   float4 _BaseMap_ST;half4 _BaseColor,_PaletteColor;half _SurfaceTag,_MetallicPlane,_DruidGlow,_DruidGroundY,_DruidGroundClip,_DruidGlowStrength;half4 _DruidEmission;
   CBUFFER_END
   float4 _RigPixelMoonDirection,_RigPixelMoonColor,_RigPixelAmbient,_RigPixelPointPositions[4],_RigPixelPointColors[4];
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;half3 normal:TEXCOORD1;float2 uv:TEXCOORD2;};
   V Vert(A v){V o;VertexPositionInputs p=GetVertexPositionInputs(v.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.normal=TransformObjectToWorldNormal(v.normalOS);o.uv=TRANSFORM_TEX(v.uv,_BaseMap);return o;}
   half Band(half d){return floor(saturate(d)*3+.5h)/3;}
   half3 Irradiance(half3 direction,half3 color,half attenuation,half3 normal){color*=attenuation;half peak=max(color.r,max(color.g,color.b));half3 energy=color*(1.1h/(1+peak));return energy*(.12h+.88h*Band(dot(normal,direction)));}
   half3 MetalHighlight(half3 direction,half3 color,half attenuation,half3 normal,half3 view){
    color*=attenuation;half peak=max(color.r,max(color.g,color.b));half3 energy=color*(1.1h/(1+peak));
    half3 halfDirection=direction+view;half nh=saturate(dot(normal,halfDirection*rsqrt(max(.0001h,dot(halfDirection,halfDirection)))));
    return energy*(step(.90h,nh)*.04h+step(.97h,nh)*.08h);
   }
   half4 Frag(V i):SV_Target {
    if(_DruidGroundClip>.5)clip(i.world.y-_DruidGroundY);
    half4 albedo=SAMPLE_TEXTURE2D_BIAS(_BaseMap,sampler_BaseMap,i.uv,4)*_BaseColor;clip(albedo.a-.2h);albedo.rgb=_PaletteColor.rgb;
    half3 n=normalize(i.normal),view=GetWorldSpaceNormalizeViewDir(i.world);
    half3 metal=MetalHighlight(_RigPixelMoonDirection.xyz,_RigPixelMoonColor.rgb,1,n,view);
    half facing=saturate(dot(n,view));
    // B4: lens-side cool fill in the same 4-step cell ladder. A pose that turns away from the moon (charge, slam lean) keeps the skull face and horns out of the darkest cell.
    half3 diffuse=max(_RigPixelAmbient.rgb,half3(.38h,.39h,.43h))+Irradiance(_RigPixelMoonDirection.xyz,_RigPixelMoonColor.rgb,1,n)+half3(.20h,.215h,.25h)*(.35h+.65h*Band(facing));
    [unroll]for(int lightIndex=0;lightIndex<4;lightIndex++){
     float3 delta=_RigPixelPointPositions[lightIndex].xyz-i.world;float distance2=max(.01,dot(delta,delta));float range=max(.01,_RigPixelPointPositions[lightIndex].w);
     half fade=saturate(1-distance2/(range*range));half attenuation=fade*fade/(1+distance2);
     half3 direction=delta*rsqrt(distance2);
     diffuse+=Irradiance(direction,_RigPixelPointColors[lightIndex].rgb,attenuation,n);
     metal+=MetalHighlight(direction,_RigPixelPointColors[lightIndex].rgb,attenuation,n,view);
    }
    // Low-frequency material planes; the silhouette rim is applied after rendering, never on interior mesh facets.
    half3 color=albedo.rgb*min(diffuse,half3(1.35h,1.35h,1.35h))+metal*_MetallicPlane;color=max(color,half3(.05h,.048h,.055h)); // flat minimum, not a pattern
    // B4: view-space silhouette rim, independent of the moon direction, so it holds in every pose (the composite rim only lights the moon-facing edge). Two cell steps, cold silver, brighter than the arena floor.
    half fres=1-facing;half rimBand=step(.55h,fres)*.55h+step(.78h,fres)*.45h;color+=half3(.30h,.37h,.46h)*rimBand;
    if(_DruidGlow>.5)color=_DruidEmission.rgb*saturate(_DruidGlowStrength);
    return half4(color,_SurfaceTag);
   }
   ENDHLSL
  }
 }
}
