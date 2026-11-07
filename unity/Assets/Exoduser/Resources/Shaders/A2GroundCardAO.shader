Shader "EXODUSER/A2GroundCardAO"
{
 // 11-07 바닥 잔해 카드 밑 접지 그림자: 같은 아틀라스 알파를 밉 바이어스로 흐려 곱하기로 어둡게 한다(바닥 위 .6cm, 카드보다 1.2배 크게).
 Properties { _BaseMap("색(알파)",2D)="white"{} _Strength("세기",Float)=.5 _Blur("밉 바이어스",Float)=2.5 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="AlphaTest-10" "IgnoreProjector"="True" }
  Pass
  {
   Name "Forward" Tags { "LightMode"="UniversalForward" }
   Blend DstColor Zero ZWrite Off Cull Off
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half _Strength,_Blur;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;};
   V vert(A v){V o;o.positionCS=TransformObjectToHClip(v.positionOS.xyz);o.uv=v.uv;return o;}
   half4 frag(V i):SV_Target
   {
    half a=SAMPLE_TEXTURE2D_BIAS(_BaseMap,sampler_BaseMap,i.uv,_Blur).a;
    return half4((1-saturate(a*1.6)*_Strength).xxx,1);
   }
   ENDHLSL
  }
 }
}
