// A2R GroundPainting response, arena-only continuous receiver (source 3967a7562).
Shader "EXODUSER/Arena8b/Ground"
{
 Properties
 {
  _PaintA("A2R ground 2,4",2D)="white"{} _PaintB("A2R ground 3,4",2D)="white"{}
  _NormalA("A2R normal A",2D)="bump"{} _NormalB("A2R normal B",2D)="bump"{}
  _MaskA("A2R water mask A",2D)="black"{} _MaskB("A2R water mask B",2D)="black"{}
  _Soil("A2 forest soil underpaint",2D)="white"{} _Roots("A2 exposed roots",2D)="white"{}
 }
 SubShader
 {
  Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
  Pass
  {
   Name "ArenaGround" Tags {"LightMode"="UniversalForward"} Cull Back ZWrite On
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_PaintA);SAMPLER(sampler_PaintA);TEXTURE2D(_PaintB);SAMPLER(sampler_PaintB);
   TEXTURE2D(_NormalA);SAMPLER(sampler_NormalA);TEXTURE2D(_NormalB);SAMPLER(sampler_NormalB);
   TEXTURE2D(_MaskA);SAMPLER(sampler_MaskA);TEXTURE2D(_MaskB);SAMPLER(sampler_MaskB);
   TEXTURE2D(_Soil);SAMPLER(sampler_Soil);TEXTURE2D(_Roots);SAMPLER(sampler_Roots);
   struct A {float4 p:POSITION;float3 n:NORMAL;};
   struct V {float4 p:SV_POSITION;float3 w:TEXCOORD0;half3 n:TEXCOORD1;half fog:TEXCOORD2;};
   V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.n=TransformObjectToWorldNormal(a.n);o.fog=ComputeFogFactor(o.p.z);return o;}
   half4 frag(V i):SV_Target
   {
    float2 world=float2(i.w.x,-i.w.z),cell=floor(world/10),uv=frac(world/10);
    // Rotation varies only per ten-metre patch; no pixel grain/dither is introduced.
    int turn=(int)abs(cell.x+cell.y*3)%4;
    if(turn==1)uv=float2(uv.y,1-uv.x);else if(turn==2)uv=1-uv;else if(turn==3)uv=float2(1-uv.y,uv.x);
    float blend=smoothstep(-.65,.65,sin(i.w.x*.137)+cos(i.w.z*.171));
    half4 painted=lerp(SAMPLE_TEXTURE2D(_PaintA,sampler_PaintA,uv),SAMPLE_TEXTURE2D(_PaintB,sampler_PaintB,uv),blend);half3 paint=painted.rgb;
    half3 normal=lerp(SAMPLE_TEXTURE2D(_NormalA,sampler_NormalA,uv).rgb,SAMPLE_TEXTURE2D(_NormalB,sampler_NormalB,uv).rgb,blend)*2-1;
    float water=lerp(SAMPLE_TEXTURE2D(_MaskA,sampler_MaskA,uv).r,SAMPLE_TEXTURE2D(_MaskB,sampler_MaskB,uv).r,blend);
    float2 edge=min(uv,1-uv);float coverage=smoothstep(.06,.20,min(edge.x,edge.y))*(1-smoothstep(.1,.9,water))*painted.a;
    half3 soil=SAMPLE_TEXTURE2D(_Soil,sampler_Soil,world*.20).rgb;
    half3 roots=SAMPLE_TEXTURE2D(_Roots,sampler_Roots,world*.12+float2(.27,.63)).rgb;
    float rootWeight=.12*smoothstep(.15,.85,.5+.5*sin(world.x*.23+sin(world.y*.17)));
    half3 albedo=lerp(lerp(soil,roots,rootWeight),paint,coverage);
    float2 detail=normal.xy;if(turn==1)detail=float2(-detail.y,detail.x);else if(turn==2)detail=-detail;else if(turn==3)detail=float2(detail.y,-detail.x);
    half3 n=normalize(i.n+half3(detail.x,0,-detail.y)*(.35*coverage));
    Light main=GetMainLight(TransformWorldToShadowCoord(i.w));
    half3 light=half3(.08,.075,.065)+main.color*saturate(dot(n,main.direction))*main.shadowAttenuation;
    InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);
    uint count=GetAdditionalLightsCount();
    LIGHT_LOOP_BEGIN(count)
     Light lamp=GetAdditionalLight(lightIndex,i.w);light+=lamp.color*lamp.distanceAttenuation*lamp.shadowAttenuation*saturate(dot(n,lamp.direction));
    LIGHT_LOOP_END
    half3 color=albedo*half3(1.10,1.03,.91)*min(light,half3(2.4,2.4,2.4));
    return half4(MixFog(color,i.fog),1);
   }
   ENDHLSL
  }
  Pass
  {
   Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask 0 Cull Back
   HLSLPROGRAM
   #pragma vertex vertDepth
   #pragma fragment fragDepth
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   float4 vertDepth(float4 positionOS:POSITION):SV_POSITION{return TransformObjectToHClip(positionOS.xyz);}
   half4 fragDepth():SV_Target{return 0;}
   ENDHLSL
  }
 }
}
