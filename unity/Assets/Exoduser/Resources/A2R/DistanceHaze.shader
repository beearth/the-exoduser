Shader "EXODUSER/A2R/DistanceHaze"
{
 Properties {_Color("Distant earth haze",Color)=(.072,.066,.053,1) _Density("Density",Float)=.004 _Start("Clear near distance",Float)=22 _Maximum("Maximum opacity",Float)=.13}
 SubShader {Tags{"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+80"}
 Pass {ZTest Always ZWrite Off Cull Off Blend SrcAlpha OneMinusSrcAlpha
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
 CBUFFER_START(UnityPerMaterial)
 half4 _Color;float _Density,_Start,_Maximum;
 CBUFFER_END
 struct A{float4 p:POSITION;};struct V{float4 p:SV_POSITION;};
 V vert(A a){V o;o.p=float4(a.p.xy,0,1);return o;}
 half4 frag(V i):SV_Target {float2 uv=GetNormalizedScreenSpaceUV(i.p);float depth=SampleSceneDepth(uv);float3 world=ComputeWorldSpacePosition(uv,depth,UNITY_MATRIX_I_VP);float d=length(world-_WorldSpaceCameraPos);float alpha=min(_Maximum,1-exp(-max(0,d-_Start)*_Density));return half4(_Color.rgb,alpha);}
 ENDHLSL
 }}
}
