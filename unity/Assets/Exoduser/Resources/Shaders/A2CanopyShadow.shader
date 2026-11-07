Shader "EXODUSER/A2CanopyShadow"
{
 // 11-07 PoE2 black_shadowonly: 화면 밖 수관이 보이지 않은 채 바닥에 그림자만 드리운다(빛 웅덩이).
 // 렌더러는 ShadowsOnly로만 쓴다. 잎 덩어리는 월드 노이즈를 잘라 만든다(텍스처 없음, 잔점 없음: 덩어리 2~5m).
 Properties { _Scale("덩어리 크기 m",Float)=4.2 _Open("빈틈 비율",Range(0,1))=.42 _Seed("씨앗",Float)=0 }
 SubShader
 {
  Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="TransparentCutout" "Queue"="AlphaTest"}
  Pass
  {
   Name "ShadowCaster"
   Tags { "LightMode"="ShadowCaster" }
   Cull Off ZWrite On ColorMask 0
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"
   CBUFFER_START(UnityPerMaterial)
    float _Scale,_Open,_Seed;
   CBUFFER_END
   float3 _LightDirection;float3 _LightPosition;
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;};
   float CanopyHash(float2 p){p=frac(p*float2(123.34,456.21));p+=dot(p,p+45.32);return frac(p.x*p.y);}
   float CanopyNoise(float2 p){float2 c=floor(p),f=frac(p);f=f*f*(3-2*f);
    return lerp(lerp(CanopyHash(c),CanopyHash(c+float2(1,0)),f.x),lerp(CanopyHash(c+float2(0,1)),CanopyHash(c+float2(1,1)),f.x),f.y);}
   V vert(A v)
   {
    V o;float3 positionWS=TransformObjectToWorld(v.positionOS.xyz);float3 normalWS=TransformObjectToWorldNormal(v.normalOS);
    #if _CASTING_PUNCTUAL_LIGHT_SHADOW
     float3 lightDir=normalize(_LightPosition-positionWS);
    #else
     float3 lightDir=_LightDirection;
    #endif
    o.positionCS=TransformWorldToHClip(ApplyShadowBias(positionWS,normalWS,lightDir));
    #if UNITY_REVERSED_Z
     o.positionCS.z=min(o.positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #else
     o.positionCS.z=max(o.positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #endif
    o.world=positionWS;return o;
   }
   half4 frag(V i):SV_Target
   {
    float2 p=i.world.xz/_Scale+_Seed;
    // 도메인 왜곡으로 가지 모양 가장자리를 만든다. 큰 수관 덩어리 + 잎 무리 2옥타브만(작은 얼룩은 1x에서 잡음이 된다).
    p+=float2(CanopyNoise(p*.45+1.3),CanopyNoise(p*.45+9.4))*1.6-.8;
    float n=CanopyNoise(p)*.7+CanopyNoise(p*2.2+7.1)*.3;
    clip(n-_Open);
    return 0;
   }
   ENDHLSL
  }
 }
}
