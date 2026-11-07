Shader "EXODUSER/A2CanopyShadow"
{
 // 11-07 PoE2 black_shadowonly: 화면 밖 수관이 보이지 않은 채 바닥에 그림자만 드리운다(빛 웅덩이).
 // 렌더러는 ShadowsOnly로만 쓴다. 카드 한 장 = 잎 덩어리 하나: 가장자리를 노이즈로 흔든 둥근 덩어리 × 잎 사이 구멍(약 .9m·.35m).
 // 경계는 그림자맵 텍셀 단위 4×4 Bayer 디더로 부분 투과시켜, 소프트 섀도(High 7×7 텐트)가 이를 평균해 넓은 반그림자로 만든다.
 // 디더 주기(그림자맵 4텍셀)는 텐트 폭보다 작아서 화면에는 점이 남지 않는다.
 Properties { _Leaf("잎 구멍 크기 m",Float)=.9 _Holes("구멍 비율",Range(0,1))=.38 _Soft("반그림자 폭",Range(.01,.5))=.22 _Seed("씨앗",Float)=0 }
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
    float _Leaf,_Holes,_Soft,_Seed;
   CBUFFER_END
   float3 _LightDirection;float3 _LightPosition;
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float2 uv:TEXCOORD1;};
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
    o.world=positionWS;o.uv=v.uv;return o;
   }
   static const float CanopyBayer[16]={0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5};
   float Bayer4(float2 p)
   {
    uint2 q=uint2(p)&3u;uint i=q.x+q.y*4u;
    return (CanopyBayer[i]+.5)/16;
   }
   half4 frag(V i):SV_Target
   {
    float2 w=i.world.xz+_Seed;
    // 덩어리 실루엣: 카드 중심에서의 거리를 큰 노이즈로 흔든다(가지 쪽으로 뻗은 불규칙 모양).
    float2 c=i.uv*2-1;float r=length(c)+(CanopyNoise(w/2.6)-.5)*.75+(CanopyNoise(w/1.1+4.2)-.5)*.3;
    float clump=1-smoothstep(.75-_Soft,.75+_Soft,r);
    // 잎 사이 구멍: 크기가 섞인 2옥타브(약 .9m·.35m). 구멍 경계도 같은 폭으로 부드럽게.
    float leaf=CanopyNoise(w/_Leaf)*.65+CanopyNoise(w/(_Leaf*.38)+9.1)*.35;
    float open=smoothstep(_Holes-_Soft*.6,_Holes+_Soft*.6,leaf);
    clip(clump*open-Bayer4(i.positionCS.xy));
    return 0;
   }
   ENDHLSL
  }
 }
}
