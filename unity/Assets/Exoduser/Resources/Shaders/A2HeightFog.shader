Shader "EXODUSER/A2HeightFog"
{
 Properties { _Color("숲 안개",Color)=(.13,.18,.21,1) _Density("낮은 안개 밀도",Float)=.045 _Falloff("높이 감쇠",Float)=.8 }
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
    half4 _Color;float _Density,_Falloff;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;};
   struct V {float4 positionCS:SV_POSITION;};
   V vert(A a){V o;o.positionCS=float4(a.positionOS.xy,0,1);return o;}
   half4 frag(V i):SV_Target
   {
    float2 uv=GetNormalizedScreenSpaceUV(i.positionCS);
    float depth=SampleSceneDepth(uv);
    float3 world=ComputeWorldSpacePosition(uv,depth,UNITY_MATRIX_I_VP);
    float3 delta=world-_WorldSpaceCameraPos;float distance=min(length(delta),80);
    float3 direction=normalize(delta);float dy=direction.y*_Falloff;
    float start=exp(clamp(-_WorldSpaceCameraPos.y*_Falloff,-16,8));
    float integral=abs(dy)<.001?distance*start:start*(1-exp(clamp(-distance*dy,-16,16)))/dy;
    float alpha=1-exp(-max(0,integral)*_Density);
    return half4(_Color.rgb,min(alpha,.42));
   }
   ENDHLSL
  }
 }
}
