Shader "Exoduser/RigPixelComposite" {
 Properties { _MainTex("Point RT",2D)="black"{} }
 SubShader {
  Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent" }
  Pass {
   Tags { "LightMode"="UniversalForward" }
   Blend One OneMinusSrcAlpha Cull Off ZWrite Off
   HLSLPROGRAM
   #pragma vertex Vert
   #pragma fragment Frag
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize;
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;half fog:TEXCOORD1;};
   V Vert(A v){V o;o.positionCS=TransformObjectToHClip(v.positionOS.xyz);o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 Frag(V i):SV_Target {
    half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv);
    if(c.a<.5h){float2 d=_MainTex_TexelSize.xy;half a=max(max(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(d.x,0)).a,SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv-float2(d.x,0)).a),max(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(0,d.y)).a,SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv-float2(0,d.y)).a));clip(a-.5h);c=half4(.035h,.025h,.035h,1);}
    c.rgb=MixFog(c.rgb,i.fog);return half4(c.rgb*c.a,c.a);
   }
   ENDHLSL
  }
 }
}
