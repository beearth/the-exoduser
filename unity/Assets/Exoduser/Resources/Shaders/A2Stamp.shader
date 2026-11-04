Shader "EXODUSER/A2Stamp"
{
 Properties { _Gain("밝기",Range(0,8))=2.4 _Sway("맥동",Range(0,.2))=.035 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Cull Off
  HLSLINCLUDE
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  CBUFFER_START(UnityPerMaterial)
  half _Gain,_Sway;
  CBUFFER_END
  float3 StampWorld(float3 p,float2 uv){float t=_Time.y*.9+uv.y;float w=uv.x*uv.x*_Sway;p.x+=sin(t+p.z*.6)*w;p.z+=cos(t*.8+p.x*.5)*w;return p;}
  ENDHLSL
  Pass
  {
   Name "Forward" Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   struct A{float4 positionOS:POSITION;float3 normalOS:NORMAL;half4 color:COLOR;float2 uv:TEXCOORD0;};
   struct V{float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;half4 color:COLOR;float2 uv:TEXCOORD2;float fog:TEXCOORD3;};
   V vert(A v){V o;o.world=StampWorld(TransformObjectToWorld(v.positionOS.xyz),v.uv);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.color=v.color;o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i,bool front:SV_IsFrontFace):SV_Target
   {
    float3 n=normalize(front?i.normal:-i.normal);half3 c=i.color.rgb*i.color.rgb*_Gain*lerp(.38,1,saturate(i.uv.x*1.6));half peak=max(c.r,max(c.g,c.b));c*=min(1,.15/max(peak,.001));
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=n;input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);input.shadowCoord=TransformWorldToShadowCoord(i.world);input.fogCoord=i.fog;input.bakedGI=SampleSH(n);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=half4(1,1,1,1);
    SurfaceData s=(SurfaceData)0;s.albedo=c;s.alpha=1;s.occlusion=1;s.smoothness=i.color.a*.4;s.specular=.04;s.normalTS=half3(0,0,1);
    half4 r=UniversalFragmentBlinnPhong(input,s);r.rgb=MixFog(r.rgb,i.fog);return r;
   }
   ENDHLSL
  }
  Pass
  {
   Name "DepthOnly" Tags { "LightMode"="DepthOnly" } ZWrite On ColorMask R
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   struct A{float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   float4 vert(A v):SV_POSITION{return TransformWorldToHClip(StampWorld(TransformObjectToWorld(v.positionOS.xyz),v.uv));}
   half frag():SV_Target{return 0;}
   ENDHLSL
  }
 }
}
