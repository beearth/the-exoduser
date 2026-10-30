Shader "EXODUSER/HellGroundPBR"
{
 Properties { _BaseMap("피부 컬러맵",2D)="white"{} _BaseColor("색",Color)=(1,1,1,1) _BumpMap("피부 노멀",2D)="bump"{} _RockMap("젖은 돌",2D)="white"{} _AshMap("탄화토",2D)="white"{} _RockNormal("돌 노멀",2D)="bump"{} _RockRough("돌 러프니스",2D)="white"{} _Cutoff("잘림",Float)=.5 _Smoothness("매끈함",Float)=.24 _Metallic("금속",Float)=0 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
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
   #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
   TEXTURE2D(_RockMap);SAMPLER(sampler_RockMap);TEXTURE2D(_AshMap);SAMPLER(sampler_AshMap);
   TEXTURE2D(_RockNormal);SAMPLER(sampler_RockNormal);TEXTURE2D(_RockRough);SAMPLER(sampler_RockRough);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;half _Cutoff,_Smoothness,_Metallic;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half fog:TEXCOORD4;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w*GetOddNegativeScale());o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    float2 tile=i.world.xz/6;float sweep=smoothstep(0,1,(sin(i.world.x*.7+i.world.z*.29)+sin(i.world.z*.51-i.world.x*.17)+2)*.25);
    half rock=.08+.26*sweep,ash=.06+.12*(1-sweep);
    half3 skin=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb;
    half3 stone=SAMPLE_TEXTURE2D(_RockMap,sampler_RockMap,tile).rgb*half3(.55,.56,.58);
    half3 soil=SAMPLE_TEXTURE2D(_AshMap,sampler_AshMap,tile).rgb*half3(.55,.56,.58);
    half3 a=skin*(1-rock-ash)+stone*rock+soil*ash;
    half3 ns=UnpackNormalScale(SAMPLE_TEXTURE2D(_BumpMap,sampler_BumpMap,i.uv),.45);
    half3 nr=UnpackNormalScale(SAMPLE_TEXTURE2D(_RockNormal,sampler_RockNormal,tile),.3);
    half3 nt=normalize(lerp(ns,nr,rock));float3 n=normalize(i.normal),t=normalize(i.tangent.xyz),b=cross(n,t)*i.tangent.w;
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(mul(nt,float3x3(t,b,n)));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData surface=(SurfaceData)0;surface.albedo=a;surface.alpha=1;surface.occlusion=1;surface.normalTS=nt;surface.specular=.04;
    half rough=SAMPLE_TEXTURE2D(_RockRough,sampler_RockRough,tile).r;surface.smoothness=lerp(.24,.50-.25*rough,rock);surface.metallic=0;
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return color;
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
