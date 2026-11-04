Shader "EXODUSER/A2R/GroundPainting"
{
 Properties {_MainTex("C10 original paint",2D)="white"{} _NormalTex("Original normal",2D)="bump"{} _MaskTex("Original water mask",2D)="black"{} _WaterTex("Original water",2D)="white"{} _Water("Moat",Float)=0}
 SubShader
 {
  Tags {"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest+25" "RenderType"="Transparent"}
  Pass
  {
   Tags {"LightMode"="UniversalForward"} Cull Off ZWrite Off Offset -1,-1 Blend SrcAlpha OneMinusSrcAlpha
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
   #pragma multi_compile_fragment _ _LIGHT_COOKIES
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Nature.hlsl"
   TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);TEXTURE2D(_NormalTex);SAMPLER(sampler_NormalTex);TEXTURE2D(_MaskTex);SAMPLER(sampler_MaskTex);TEXTURE2D(_WaterTex);SAMPLER(sampler_WaterTex);
   CBUFFER_START(UnityPerMaterial)
   float _Water;
   CBUFFER_END
   float4 _A2RTerrainRect,_A2RTerrainHole;float _A2RTerrainSkin,_A2RHellRot;float4 _A2RCampPositionRange;half4 _A2RCampRadiance;float _A2RClean;
   struct A {float4 p:POSITION;float2 uv:TEXCOORD0;float3 n:NORMAL;float4 color:COLOR;};
   struct V {float4 p:SV_POSITION;float3 w:TEXCOORD0;float2 uv:TEXCOORD1;half3 n:TEXCOORD2;half alpha:TEXCOORD3;};
   V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=a.uv;o.n=TransformObjectToWorldNormal(a.n);o.alpha=_Water>.5?a.color.a:1;return o;}
   half4 frag(V i):SV_Target
   {
    half4 paint=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv);float water=SAMPLE_TEXTURE2D(_MaskTex,sampler_MaskTex,i.uv).r;
    float alpha=paint.a*i.alpha;
    if(_Water>.5){A2RWaterClip(i.w);half3 flow=SAMPLE_TEXTURE2D(_WaterTex,sampler_WaterTex,i.w.xz*.16+float2(_Time.y*.001,0)).rgb;paint.rgb=lerp(paint.rgb,flow*.6,water*.65);paint.rgb+=A2RWave(i.w.xz)*2;float ew=_A2RHellRot>.5?.30:.075;if(_A2RHellRot>.5){paint.rgb*=half3(.60,.56,.40);float e=1-smoothstep(0,.34,min(i.uv.x,1-i.uv.x));paint.rgb=lerp(paint.rgb,half3(.12,.07,.055),e*.85);}alpha*=smoothstep(0,ew,i.uv.x)*smoothstep(0,ew,1-i.uv.x);}
    else{if(_A2RClean>.5){float3 c0=paint.rgb;float lum0=dot(c0,float3(.299,.587,.114));float orange=smoothstep(.08,.22,c0.r-c0.b)*smoothstep(.03,.12,c0.r-c0.g)*step(c0.b,c0.g+.03);float purple=smoothstep(.03,.08,min(c0.r,c0.b)-c0.g);float2 cell=floor(i.w.xz*2.3);float h0=frac(sin(dot(cell,float2(12.9898,78.233)))*43758.5453);float3 mid=float3(.06,.045,.035);float3 kept=lerp(c0,float3(.050,.010,.008)*(.6+lum0*1.6),orange);kept=lerp(kept,lum0.xxx*float3(1.0,.9,.85),.4*purple);paint.rgb=kept;}alpha*=1-smoothstep(.1,.9,water);float2 edge=min(float2(i.w.x,-i.w.z),80-float2(i.w.x,-i.w.z));alpha*=smoothstep(0,.35,min(edge.x,edge.y));if(_A2RTerrainSkin>.5&&i.w.x>_A2RTerrainRect.x&&i.w.x<_A2RTerrainRect.z&&i.w.z>_A2RTerrainRect.y&&i.w.z<_A2RTerrainRect.w&&i.w.y>-.06&&!(i.w.x>_A2RTerrainHole.x&&i.w.x<_A2RTerrainHole.z&&i.w.z>_A2RTerrainHole.y&&i.w.z<_A2RTerrainHole.w))alpha=0;}
    clip(alpha-.005);half3 normal=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,i.uv).rgb*2-1;half3 n=normalize(i.n+half3(normal.x,0,-normal.y)*.35);Light main=GetMainLight(TransformWorldToShadowCoord(i.w),i.w,half4(1,1,1,1));half3 light=half3(.08,.075,.065)+main.color*saturate(dot(n,main.direction))*main.shadowAttenuation;
    InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);uint count=GetAdditionalLightsCount();LIGHT_LOOP_BEGIN(count)Light l=GetAdditionalLight(lightIndex,i.w,half4(1,1,1,1));light+=l.color*l.distanceAttenuation*l.shadowAttenuation*saturate(dot(n,l.direction));LIGHT_LOOP_END
    float3 toCamp=_A2RCampPositionRange.xyz-i.w;float d=length(toCamp);float pool=saturate(1-pow(d/max(.01,_A2RCampPositionRange.w),2));light+=_A2RCampRadiance.rgb*pool*pool*saturate(dot(n,normalize(toCamp)))/(1+d*d*.28);
    return half4(paint.rgb*half3(1.0,.96,.97)*min(light,half3(2.4,2.4,2.4)),alpha);
   }
   ENDHLSL
  }
 }
}
