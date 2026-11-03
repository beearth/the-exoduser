Shader "EXODUSER/A2R/HeroReadability"
{
 Properties {_MainTex("Current hero atlas",2D)="white"{} _UVRect("Frame bounds",Vector)=(0,0,1,1)}
 SubShader {Tags{"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+960"}
 Pass {ZTest Always ZWrite Off Cull Off Blend SrcAlpha OneMinusSrcAlpha
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex);
 CBUFFER_START(UnityPerMaterial)
 float4 _MainTex_TexelSize,_UVRect;
 CBUFFER_END
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A a){V o;o.p=TransformObjectToHClip(a.p.xyz);o.uv=a.uv;return o;}
 float alpha(float2 uv){float inside=step(_UVRect.x,uv.x)*step(_UVRect.y,uv.y)*step(uv.x,_UVRect.z)*step(uv.y,_UVRect.w);return SAMPLE_TEXTURE2D(_MainTex,sampler_LinearClamp,uv).a*inside;}
 half4 frag(V i):SV_Target {float center=alpha(i.uv);float2 dx=ddx(i.uv)*1.5,dy=ddy(i.uv)*1.5;float side=max(alpha(i.uv+dx),max(alpha(i.uv-dy),alpha(i.uv+(dx-dy)*.707)));float edge=saturate(side-center)*(1-center);return half4(.76,.72,.61,.36*edge);}
 ENDHLSL
 }}
}
