Shader "EXODUSER/A2TreeLit"
{
 // 11-07 PoE2 HeightGradientDarkenWS: 고목 윗부분을 지면 위 4.5m부터 3m 구간에 걸쳐 .75배까지 어둡게 한다.
 // 34° 카메라에서 앞 고목이 화면을 덮어도 바닥·캐릭터가 묻히지 않게 한다. URP Lit 재질의 맵·값을 그대로 받는다.
 // 매끈함은 .32 이하로 눌러 껍질의 반짝이 점을 없앤다(리소스 분석 9: 재질마다 거칠기 한 값).
 Properties
 {
  _BaseMap("색",2D)="white"{} _BaseColor("색 곱",Color)=(1,1,1,1) _BumpMap("노멀",2D)="bump"{} _BumpScale("노멀 세기",Float)=1
  _MetallicGlossMap("금속·매끈",2D)="white"{} _Metallic("금속",Float)=0 _Smoothness("매끈함",Float)=.2 _HasGloss("금속맵 있음",Float)=0
  _OcclusionMap("AO",2D)="white"{} _OcclusionStrength("AO 세기",Float)=1
  _DarkBase("지면 높이",Float)=0 _DarkStart("어둡게 시작 m",Float)=4.5 _DarkRange("구간 m",Float)=3 _DarkMin("최저 배수",Float)=.75 _SmoothMax("매끈함 상한",Float)=.32
  _Cutoff("잘림",Float)=.5
 }
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
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);TEXTURE2D(_MetallicGlossMap);TEXTURE2D(_OcclusionMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;half _BumpScale,_Metallic,_Smoothness,_HasGloss,_OcclusionStrength,_DarkStart,_DarkRange,_DarkMin,_SmoothMax,_Cutoff;
   CBUFFER_END
   float _DarkBase;
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half fog:TEXCOORD4;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w*GetOddNegativeScale());o.uv=TRANSFORM_TEX(v.uv,_BaseMap);o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    half4 baseMap=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv)*_BaseColor;
    half dark=lerp(1,_DarkMin,saturate((i.world.y-_DarkBase-_DarkStart)/max(.01,_DarkRange)));
    half4 gloss=SAMPLE_TEXTURE2D(_MetallicGlossMap,sampler_BaseMap,i.uv);
    half metallic=_HasGloss>.5?gloss.r*_Metallic:_Metallic;
    half smoothness=_HasGloss>.5?gloss.a*_Smoothness:_Smoothness;
    half3 nt=UnpackNormalScale(SAMPLE_TEXTURE2D(_BumpMap,sampler_BaseMap,i.uv),_BumpScale);
    float3 n=normalize(i.normal),t=normalize(i.tangent.xyz),b=cross(n,t)*i.tangent.w;
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(mul(nt,float3x3(t,b,n)));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData surface=(SurfaceData)0;surface.albedo=baseMap.rgb*dark;surface.alpha=1;surface.metallic=metallic;surface.specular=.04;
    surface.smoothness=min(smoothness,_SmoothMax)*dark;surface.normalTS=nt;
    surface.occlusion=lerp(1,SAMPLE_TEXTURE2D(_OcclusionMap,sampler_BaseMap,i.uv).g,_OcclusionStrength);
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return half4(color.rgb,1);
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
