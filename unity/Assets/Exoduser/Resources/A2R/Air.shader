Shader "EXODUSER/A2R/Air"
{
 Properties {_Kind("0 firefly 1 leaf 2 mist",Float)=0}
 SubShader {Tags{"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+50"}
 Pass {ZWrite Off Cull Off Blend SrcAlpha OneMinusSrcAlpha
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 CBUFFER_START(UnityPerMaterial)
 float _Kind;
 CBUFFER_END
 float4x4 _A2RViewportVP;
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;half4 color:COLOR;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;half4 color:COLOR;float viewY:TEXCOORD1;};
 V vert(A a){V o;float3 w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(w);float4 v=mul(_A2RViewportVP,float4(w,1));o.viewY=v.y/v.w*.5+.5;o.uv=a.uv;o.color=a.color;return o;}
 half4 frag(V i):SV_Target{float2 q=(i.uv-.5)*2;if(_Kind>1.5)q.y*=3.5;else if(_Kind>.5)q.x*=2;float edge=pow(saturate(1-dot(q,q)),2);float upper=1-smoothstep(.55,.72,i.viewY);float pulse=_Kind<.5?.65+.35*sin(_Time.y*1.1+i.p.x*.07):1;return half4(i.color.rgb,i.color.a*edge*upper*pulse);}
 ENDHLSL
 }}
}
