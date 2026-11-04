Shader "EXODUSER/A2SightFade"
{
 Properties { _BaseMap("색",2D)="white"{} _BaseColor("곱색",Color)=(1,1,1,1) _BumpMap("노멀",2D)="bump"{} _A2Fade("반투명 세기",Range(0,1))=0 _MinAlpha("최저 불투명도",Range(0,1))=.3 }
 SubShader
 {
  // 액터(Transparent 3000) 뒤에 그린다. 먼저 깊이를 써서 물체 안쪽 면이 겹쳐 보이지 않게 하고, 뒤쪽 액터는 이미 그려져 비친다.
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent+100" "IgnoreProjector"="True" }
  HLSLINCLUDE
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
  CBUFFER_START(UnityPerMaterial)
  float4 _BaseMap_ST;half4 _BaseColor;half _A2Fade,_MinAlpha;
  CBUFFER_END
  half SightAlpha(){return lerp(1,_MinAlpha,_A2Fade);}
  ENDHLSL
  Pass
  {
   Name "SightDepth" Tags { "LightMode"="SRPDefaultUnlit" }
   ZWrite On ColorMask 0 Cull Back
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   struct A{float4 positionOS:POSITION;};
   struct V{float4 positionCS:SV_POSITION;};
   V vert(A v){V o;o.positionCS=TransformObjectToHClip(v.positionOS.xyz);return o;}
   half4 frag(V i):SV_Target{return 0;}
   ENDHLSL
  }
  Pass
  {
   Name "SightColor" Tags { "LightMode"="UniversalForward" }
   ZWrite Off ZTest LEqual Cull Back Blend SrcAlpha OneMinusSrcAlpha
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   struct A{float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;};
   struct V{float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;float fog:TEXCOORD4;};
   V vert(A v)
   {
    V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);
    o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w);o.uv=TRANSFORM_TEX(v.uv,_BaseMap);o.fog=ComputeFogFactor(o.positionCS.z);return o;
   }
   half4 frag(V i):SV_Target
   {
    half alpha=SightAlpha();
    float3 n=normalize(i.normal),t=normalize(i.tangent.xyz),b=cross(n,t)*i.tangent.w;
    half3 nt=UnpackNormal(SAMPLE_TEXTURE2D(_BumpMap,sampler_BumpMap,i.uv));
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(mul(nt,float3x3(t,b,n)));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);input.shadowCoord=TransformWorldToShadowCoord(i.world);input.fogCoord=i.fog;input.bakedGI=SampleSH(n);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=half4(1,1,1,1);
    SurfaceData s=(SurfaceData)0;s.albedo=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb*_BaseColor.rgb;s.alpha=1;s.occlusion=1;s.smoothness=.15;s.metallic=0;s.normalTS=nt;
    half4 r=UniversalFragmentPBR(input,s);r.rgb=MixFog(r.rgb,i.fog);r.a=alpha;return r;
   }
   ENDHLSL
  }
 }
}
