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
   TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize,_RimDirection;half4 _RimColor;
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;half fog:TEXCOORD1;};
   V Vert(A v){V o;o.positionCS=TransformObjectToHClip(v.positionOS.xyz);o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half Difference(half3 a,half3 b){half3 delta=abs(a-b);return max(delta.r,max(delta.g,delta.b));}
   bool Consensus(half4 a,half4 b,half4 c){return min(a.a,min(b.a,c.a))>.5h&&Difference(a.rgb,b.rgb)<.035h&&Difference(a.rgb,c.rgb)<.035h;}
   half4 Frag(V i):SV_Target {
    float2 d=_MainTex_TexelSize.xy;
    half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv);
    half4 l=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv-float2(d.x,0));
    half4 r=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(d.x,0));
    half4 u=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(0,d.y));
    half4 b=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv-float2(0,d.y));
    half count=step(.5h,l.a)+step(.5h,r.a)+step(.5h,u.a)+step(.5h,b.a);
    half3 average=(l.rgb*step(.5h,l.a)+r.rgb*step(.5h,r.a)+u.rgb*step(.5h,u.a)+b.rgb*step(.5h,b.a))/max(1,count);
    if(c.a<.5h){
     if(count>3.5h)c=half4(average,1); // close isolated alpha pinholes, retain connected cape tears
     else {clip(max(max(l.a,r.a),max(u.a,b.a))-.5h);return half4(MixFog(half3(.035h,.025h,.035h),i.fog),1);}
    }
    else {
     half3 plane=c.rgb;
     if(Consensus(l,r,u))plane=(l.rgb+r.rgb+u.rgb)/3;
     else if(Consensus(l,r,b))plane=(l.rgb+r.rgb+b.rgb)/3;
     else if(Consensus(l,u,b))plane=(l.rgb+u.rgb+b.rgb)/3;
     else if(Consensus(r,u,b))plane=(r.rgb+u.rgb+b.rgb)/3;
     if(Difference(c.rgb,plane)>.045h)c.rgb=plane; // isolated light/dark texel only; a connected thin blade has no three-neighbour consensus
     float2 direction=_RimDirection.xy;half neighbour=abs(direction.x)>abs(direction.y)?(direction.x>0?r.a:l.a):(direction.y>0?u.a:b.a);
     if(neighbour<.5h&&count>=2)c.rgb+=_RimColor.rgb; // continuous moon-facing silhouette only
    }
    c.rgb=MixFog(c.rgb,i.fog);return half4(c.rgb*c.a,c.a);
   }
   ENDHLSL
  }
 }
}
