Shader "Exoduser/RigPixelComposite" {
 Properties { _MainTex("Point RT",2D)="black"{} }
 SubShader {
  Tags { "RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest+20" "RenderType"="TransparentCutout" }
  Pass {
   Tags { "LightMode"="UniversalForward" }
   // 11-08: 영웅 판은 덮인 픽셀(알파 1)만 남기고 빈 곳은 clip -> 불투명 단계(AlphaTest)에서 깊이를 쓴다. 장면 깊이 텍스처에 영웅이 들어가야
   // 화면 높이 안개(A2HeightFog, SampleSceneDepth)가 영웅 뒤 먼 늪 깊이로 영웅을 칠하지 않는다(상체가 비쳐 보이던 결함)
   Blend One OneMinusSrcAlpha Cull Off ZWrite On
   HLSLPROGRAM
   #pragma vertex Vert
   #pragma fragment Frag
   #pragma target 3.5
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize,_RimDirection;half4 _RimColor;
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;half fog:TEXCOORD1;};
   V Vert(A v){V o;o.positionCS=TransformObjectToHClip(v.positionOS.xyz);o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half Difference(half3 a,half3 b){half3 delta=abs(a-b);return max(delta.r,max(delta.g,delta.b));}
   bool Consensus(half4 a,half4 b,half4 c){return min(a.a,min(b.a,c.a))>.5h&&Difference(a.rgb,b.rgb)<.035h&&Difference(a.rgb,c.rgb)<.035h;}
   half Luma(half3 c){return dot(c,half3(.2126h,.7152h,.0722h));}
   bool SamePlane(half tag,half4 neighbourSample){return abs(tag-neighbourSample.a)<.02h;}
   half3 PlaneMedian(half4 c,half4 l,half4 r,half4 u,half4 b,half4 ul,half4 ur,half4 bl,half4 br){
    half4 samples[9];
    samples[0]=half4(c.rgb,Luma(c.rgb));samples[1]=half4(l.rgb,Luma(l.rgb));samples[2]=half4(r.rgb,Luma(r.rgb));
    samples[3]=half4(u.rgb,Luma(u.rgb));samples[4]=half4(b.rgb,Luma(b.rgb));samples[5]=half4(ul.rgb,Luma(ul.rgb));
    samples[6]=half4(ur.rgb,Luma(ur.rgb));samples[7]=half4(bl.rgb,Luma(bl.rgb));samples[8]=half4(br.rgb,Luma(br.rgb));
    // Five ascending bubble passes place the middle sample at index four. Keep the sampled RGB together.
    [unroll]for(int iteration=0;iteration<5;iteration++){
     [unroll]for(int j=0;j<8-iteration;j++){
      if(samples[j].a>samples[j+1].a){half4 swap=samples[j];samples[j]=samples[j+1];samples[j+1]=swap;}
     }
    }
    return samples[4].rgb;
   }
   half4 SurfaceSample(float2 uv){return SAMPLE_TEXTURE2D_LOD(_MainTex,sampler_MainTex,uv,0);}
   half4 CleanCoverage(float2 uv){
    half4 c=SurfaceSample(uv);
    if(abs(c.a-.7h)>.02h)return c; // Only cape/cloth coverage. Keep face, hair and thin blade detail.
    float2 d=_MainTex_TexelSize.xy,adjacent=0;int neighbours=0;
    [unroll]for(int y=-1;y<=1;y++)[unroll]for(int x=-1;x<=1;x++){
     if(x!=0||y!=0){float2 offset=float2(x,y)*d;if(SurfaceSample(uv+offset).a>.5h){neighbours++;adjacent=offset;}}
    }
    if(neighbours==0)return 0;
    if(neighbours>1)return c;
    // A two-texel island has only the centre in its neighbour's 8-neighbourhood.
    // An endpoint joined to a longer tear/body has more support and is retained.
    int support=0;
    [unroll]for(int sy=-1;sy<=1;sy++)[unroll]for(int sx=-1;sx<=1;sx++){
     if(sx!=0||sy!=0)if(SurfaceSample(uv+adjacent+float2(sx,sy)*d).a>.5h)support++;
    }
    return support<=1?half4(0,0,0,0):c;
   }
   half4 Frag(V i):SV_Target {
    float2 d=_MainTex_TexelSize.xy;
    half4 c=CleanCoverage(i.uv);
    half4 l=CleanCoverage(i.uv-float2(d.x,0));
    half4 r=CleanCoverage(i.uv+float2(d.x,0));
    half4 u=CleanCoverage(i.uv+float2(0,d.y));
    half4 b=CleanCoverage(i.uv-float2(0,d.y));
    half count=step(.5h,l.a)+step(.5h,r.a)+step(.5h,u.a)+step(.5h,b.a);
    half3 average=(l.rgb*step(.5h,l.a)+r.rgb*step(.5h,r.a)+u.rgb*step(.5h,u.a)+b.rgb*step(.5h,b.a))/max(1,count);
    if(c.a<.5h){
     if(count>3.5h)c=half4(average,1); // close isolated alpha pinholes, retain connected cape tears
     else {clip(max(max(l.a,r.a),max(u.a,b.a))-.5h);return half4(MixFog(half3(.035h,.025h,.035h),i.fog),1);}
    }
    else {
     // Restrict the median to the interior of one broad material plane. Skin, hair, the blade and silhouettes keep their detail.
     if(c.a<.9h&&SamePlane(c.a,l)&&SamePlane(c.a,r)&&SamePlane(c.a,u)&&SamePlane(c.a,b)){
      half4 ul=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(-d.x,d.y));
      half4 ur=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+d);
      half4 bl=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv-d);
      half4 br=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+float2(d.x,-d.y));
      if(SamePlane(c.a,ul)&&SamePlane(c.a,ur)&&SamePlane(c.a,bl)&&SamePlane(c.a,br))c.rgb=PlaneMedian(c,l,r,u,b,ul,ur,bl,br);
     }
     half3 plane=c.rgb;
     if(Consensus(l,r,u))plane=(l.rgb+r.rgb+u.rgb)/3;
     else if(Consensus(l,r,b))plane=(l.rgb+r.rgb+b.rgb)/3;
     else if(Consensus(l,u,b))plane=(l.rgb+u.rgb+b.rgb)/3;
     else if(Consensus(r,u,b))plane=(r.rgb+u.rgb+b.rgb)/3;
     if(Difference(c.rgb,plane)>.045h)c.rgb=plane; // isolated light/dark texel only; a connected thin blade has no three-neighbour consensus
     float2 direction=_RimDirection.xy;half neighbour=abs(direction.x)>abs(direction.y)?(direction.x>0?r.a:l.a):(direction.y>0?u.a:b.a);
     if(neighbour<.5h&&count>=2)c.rgb+=_RimColor.rgb; // continuous moon-facing silhouette only
    }
    c.rgb=MixFog(c.rgb,i.fog);return half4(c.rgb,1); // surface labels never become visible transparency
   }
   ENDHLSL
  }
 }
}
