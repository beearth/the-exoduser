Shader "Exoduser/DruidGroundBody"
{
 Properties { _MainTex("Texture",2D)="white"{} _EmitTex("Emission mask",2D)="black"{} _Tint("Tint",Color)=(1,1,1,.4) _Emission("Masked amber HDR",Float)=0 _Repeat("Tile along length",Float)=0 _MaskSafe("Core safe regions",Float)=0 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Transparent-20" "RenderType"="Transparent" }
  HLSLINCLUDE
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);TEXTURE2D(_EmitTex);SAMPLER(sampler_EmitTex);
   float4 _Tint,_Arena,_Boss;float _Emission,_Repeat,_MaskSafe,_SafeCount,_PillarCount,_Plane3D,_ProjectionEnabled;
   float4 _SafeZones[16],_Pillars[8];
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;float4 color:COLOR;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float2 uv:TEXCOORD1;float4 color:COLOR;};
   V Vert(A i){V o;o.world=TransformObjectToWorld(i.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.uv=i.uv;o.color=i.color;return o;}
   half4 Body(V i)
   {
    float2 core=(_Plane3D>.5?float2(i.world.x,-i.world.z):float2(i.world.x,-i.world.y))*100;
    if(_MaskSafe>.5)
    {
     clip(core.x-_Arena.x);clip(core.y-_Arena.y);clip(_Arena.z-core.x);clip(_Arena.w-core.y);
     for(int s=0;s<(int)_SafeCount;s++)clip(distance(core,_SafeZones[s].xy)-_SafeZones[s].z);
     float2 ray=core-_Boss.xy;float ray2=max(dot(ray,ray),1e-9);
     for(int p=0;p<(int)_PillarCount;p++)
     {
      float shadowT=dot(_Pillars[p].xy-_Boss.xy,ray)/ray2;
      if(shadowT > 0 && shadowT < 1 && distance(core,_Pillars[p].xy)>_Pillars[p].z)
       clip(distance(_Boss.xy+ray*shadowT,_Pillars[p].xy)-_Pillars[p].z);
     }
    }
    float2 uv=float2(_Repeat>.5?frac(i.uv.x):i.uv.x,saturate(i.uv.y));
    half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv)*_Tint*i.color;
    half mask=SAMPLE_TEXTURE2D(_EmitTex,sampler_EmitTex,uv).r;
    c.rgb+=half3(.403,.128,.023)*mask*_Emission; // linear #a8642a, sparse authored mask only
    c.a=min(c.a,.45h);return c;
   }
   half4 Projected(V i):SV_Target
   {
    clip(_ProjectionEnabled-.5);
    float scene=LinearEyeDepth(SampleSceneDepth(GetNormalizedScreenSpaceUV(i.positionCS)),_ZBufferParams);
    float own=-TransformWorldToView(i.world).z;clip(scene-own+.04);
    return Body(i);
   }
   half4 Fallback(V i):SV_Target {clip(.5-_ProjectionEnabled);return Body(i);}
  ENDHLSL
  // Shares the existing receiver pass and its transparent sorting. Body -8994 < telegraph -8985 < actors < bullets.
  Pass
  {
   Tags { "LightMode"="ExoduserGroundProjection" }
   Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Off ZTest Always
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex Vert
   #pragma fragment Projected
   ENDHLSL
  }
  Pass
  {
   Tags { "LightMode"="UniversalForward" }
   Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Off
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex Vert
   #pragma fragment Fallback
   ENDHLSL
  }
 }
}
