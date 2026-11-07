Shader "EXODUSER/A2HeightFog"
{
 // 11-07 PoE2 1장 숲 방식: 바닥 위에만 얇게 깔리는 남색 층 안개. 먼 적(카메라 25~40m)을 지우지 않는다.
 // 카메라 거리 _Start(≥8m)부터 _End까지 선형으로 _MaxAlpha(≤.5)에 닿고, 지면 기준 높이 _Cutoff(7.5m) 위는 0. 월드 노이즈가 천천히 흐른다.
 Properties { _Color("숲 안개",Color)=(.07,.10,.14,1) _Start("시작 거리",Float)=8 _End("끝 거리",Float)=90 _MaxAlpha("최대 알파",Float)=.45 _Base("지면 기준 높이",Float)=0 _Cutoff("높이 컷오프",Float)=7.5 _Drift("흐름 속도",Float)=.1 }
 SubShader
 {
  Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+80"}
  Pass
  {
   ZTest Always ZWrite Off Cull Off Blend SrcAlpha OneMinusSrcAlpha
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   CBUFFER_START(UnityPerMaterial)
    half4 _Color;float _Start,_End,_MaxAlpha,_Base,_Cutoff,_Drift;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;};
   struct V {float4 positionCS:SV_POSITION;};
   V vert(A a){V o;o.positionCS=float4(a.positionOS.xy,0,1);return o;}
   float FogHash(float2 p){p=frac(p*float2(123.34,456.21));p+=dot(p,p+45.32);return frac(p.x*p.y);}
   float FogNoise(float2 p){float2 c=floor(p),f=frac(p);f=f*f*(3-2*f);
    return lerp(lerp(FogHash(c),FogHash(c+float2(1,0)),f.x),lerp(FogHash(c+float2(0,1)),FogHash(c+float2(1,1)),f.x),f.y);}
   half4 frag(V i):SV_Target
   {
    float2 uv=GetNormalizedScreenSpaceUV(i.positionCS);
    float depth=SampleSceneDepth(uv);
    float3 world=ComputeWorldSpacePosition(uv,depth,UNITY_MATRIX_I_VP);
    float distance=length(world-_WorldSpaceCameraPos);
    float ramp=saturate((distance-_Start)/max(1,_End-_Start));
    // 화면 위쪽 먼 하늘(깊이 없음)도 같은 끝값으로 덮는다. 높이는 맞은 점의 지면 위 높이로 본다.
    float height=world.y-_Base;
    float low=1-smoothstep(_Cutoff*.35,_Cutoff,height);
    float drift=lerp(.95,1.05,FogNoise(world.xz/14+_Time.y*_Drift*float2(.6,.25)));
    float alpha=min(_MaxAlpha,_MaxAlpha*ramp*low*drift);
    return half4(_Color.rgb,alpha);
   }
   ENDHLSL
  }
 }
}
