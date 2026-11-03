Shader "Exoduser/Map25D/R4PixelActor"
{
 Properties { [PerRendererData] _MainTex("Atlas",2D)="white"{} _Color("Tint",Color)=(1,1,1,1) }
 SubShader {
 Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent"}
 Pass {
 Blend SrcAlpha OneMinusSrcAlpha
 ZTest Always ZWrite Off Cull Off
 HLSLPROGRAM
 #pragma vertex Vert
 #pragma fragment Frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);
 TEXTURE2D(_R4WorldDepth);SAMPLER(sampler_R4WorldDepth);
  float4 _AtlasRect,_LogicalSize,_Color,_ScreenRect,_RimDirections;float _ActorDepth,_Hero,_R4ActorGrid,_R4HeroOcclusion,_R4RimOff,_R4DepthDiagnostic;
 struct Attributes {float4 positionOS:POSITION;float2 uv:TEXCOORD0;float4 color:COLOR;};
 struct Varyings {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;float4 color:COLOR;};
 Varyings Vert(Attributes a){Varyings o;o.positionCS=TransformObjectToHClip(a.positionOS.xyz);o.uv=a.uv;o.color=a.color;return o;}
 half4 SampleActor(float2 uv){return SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,_AtlasRect.xy+uv*_AtlasRect.zw);}
 half4 Frag(Varyings i):SV_Target
 {
     float2 uv=(floor(i.uv*_LogicalSize.xy)+.5)/_LogicalSize.xy;
     if(_R4ActorGrid>.5){if(_Hero<.5)discard;float2 cell=floor(i.uv*_LogicalSize.xy);return half4(frac(float3(cell.x*.173+cell.y*.317,cell.x*.271+cell.y*.137,cell.x*.397+cell.y*.239))*.7+.15,1);}
      half4 c=SampleActor(uv)*i.color*_Color;clip(c.a-.02);
     float2 screenUV=i.positionCS.xy/_ScreenParams.xy;
     float depth=SAMPLE_TEXTURE2D(_R4WorldDepth,sampler_PointClamp,screenUV).r;
     // A camera-facing actor has constant eye depth; terrain behind its feet does not
     // cover it. Real foreground cards and solids closer than its plane do.
     bool hidden=depth>0&&depth<_ActorDepth-.11;
      if(_Hero>.5&&_R4HeroOcclusion<.5)hidden=false;
      if(_Hero>.5&&_R4DepthDiagnostic>.5)return half4(hidden?1:0,hidden?0:1,0,1);
     float2 cell=1/_LogicalSize.xy;
      float2 moonAxis=abs(_RimDirections.x)>=abs(_RimDirections.y)?float2(sign(_RimDirections.x),0):float2(0,sign(_RimDirections.y));
      float2 fireAxis=abs(_RimDirections.z)>=abs(_RimDirections.w)?float2(sign(_RimDirections.z),0):float2(0,sign(_RimDirections.w));
      float moonEdge=1-step(.10,SampleActor(uv+moonAxis*cell).a);
      float fireEdge=1-step(.10,SampleActor(uv+fireAxis*cell).a);
      float rim=step(.65,c.a)*moonEdge*(1-fireEdge);
      // CTO 05:00: one native texel, moon-facing surface only. No outside
      // alpha expansion, no all-around grey lerp, no warm-facing outline.
      if(hidden){if(_Hero<.5)discard;c.rgb*=.30;c.a*=.55;}
       if(_Hero>.5&&_R4RimOff<.5)c.rgb+=half3(.72,.76,.68)*(.025*rim);
     return c;
 }
 ENDHLSL
 } }
}
