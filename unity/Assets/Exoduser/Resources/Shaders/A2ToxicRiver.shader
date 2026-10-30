Shader "EXODUSER/A2ToxicRiver"
{
 Properties { _BaseColor("탁한 녹황",Color)=(.40,.32,.035,1) _FoamColor("오염 거품",Color)=(.57,.52,.23,1) _Emission("은은한 자체발광",Range(0,.1))=.1 _PlanarReflection("실제 장면 반사",2D)="black"{} _PlanarStrength("실제 반사 활성",Float)=0 _ShoreField("수로 접촉거리",2D)="black"{} _ShoreBounds("거리장 영역",Vector)=(-30,-100,140,170) _ShoreReady("거리장 연결",Float)=0 }
 SubShader
 {
  // 물가 거품은 불투명 지형 깊이가 복사된 뒤 샘플한다. 표면은 불투명하게 쓰되 그리기 순서만 뒤로 둔다.
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent" }
  ZWrite On
  Pass
  {
   Name "독액 수면" Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
    #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   CBUFFER_START(UnityPerMaterial)
    half4 _BaseColor,_FoamColor;half _Emission,_PlanarStrength,_ShoreReady;float4 _ShoreBounds;float4x4 _PlanarVP;
   CBUFFER_END
   TEXTURE2D(_PlanarReflection);SAMPLER(sampler_PlanarReflection);
    TEXTURE2D(_ShoreField);SAMPLER(sampler_ShoreField);
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float4 screen:TEXCOORD1;half fog:TEXCOORD2;};
   V vert(A a){V o=(V)0;VertexPositionInputs p=GetVertexPositionInputs(a.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.screen=ComputeScreenPos(p.positionCS);o.fog=ComputeFogFactor(p.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    float2 p=i.world.xz;float t=_Time.y;
    // 저주파 두 흐름. 랜덤 점·디더링·고주파 노이즈 없음.
    float a=dot(p,float2(.74,.21))-t*.12,b=dot(p,float2(-.35,.57))+t*.08;
    float flow=sin(a+sin(b)*.4)*.5+.5;
     float3 n=normalize(float3(-cos(a)*.07,1,-cos(b)*.045));
    float2 screenUV=i.screen.xy/i.screen.w;
    float scene=LinearEyeDepth(SampleSceneDepth(screenUV),_ZBufferParams);
    float surface=-TransformWorldToView(i.world).z;
    float contact=1-smoothstep(.025,.28,max(0,scene-surface));
    float ribbon=sin(p.y*2.1+sin(p.x*1.4)*1.4-t*.18)*.5+.5;
     float distance=SAMPLE_TEXTURE2D(_ShoreField,sampler_ShoreField,(p-_ShoreBounds.xy)/_ShoreBounds.zw).r;
     float bank=(1-smoothstep(.04,.50,max(0,distance)))*_ShoreReady;
     float slick=pow(saturate(sin(p.x*.72+p.y*.36+t*.05)*.5+.5),16)*pow(saturate(sin(p.x*.22-p.y*.48-t*.1)*.5+.5),8);
     float foam=saturate(max(contact*.72,bank*.85)*smoothstep(.20,.8,ribbon)+slick*.16);
    InputData data=(InputData)0;data.positionWS=i.world;data.normalWS=n;data.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);data.shadowCoord=TransformWorldToShadowCoord(i.world);data.bakedGI=SampleSH(n);data.shadowMask=1;data.normalizedScreenSpaceUV=screenUV;
     SurfaceData s=(SurfaceData)0;s.albedo=lerp(_BaseColor.rgb*(.82+.24*flow),_FoamColor.rgb,foam);s.normalTS=float3(0,0,1);s.metallic=0;s.specular=.035;s.smoothness=lerp(.78,.22,foam);s.occlusion=1;s.alpha=1;s.emission=_BaseColor.rgb*_Emission;
    half4 c=UniversalFragmentPBR(data,s);
    float4 reflected=mul(_PlanarVP,float4(i.world,1));float2 reflectionUV=reflected.xy/reflected.w*.5+.5;
    reflectionUV+=n.xz*.12;
    float valid=step(0,reflectionUV.x)*step(reflectionUV.x,1)*step(0,reflectionUV.y)*step(reflectionUV.y,1);
    half3 reflectedColor=SAMPLE_TEXTURE2D(_PlanarReflection,sampler_PlanarReflection,reflectionUV).rgb;
     float fresnel=.48+.32*pow(1-saturate(dot(n,data.viewDirectionWS)),3);
    c.rgb=lerp(c.rgb,reflectedColor*half3(.85,.80,.42),_PlanarStrength*valid*fresnel*(1-foam));
    c.rgb=MixFog(c.rgb,i.fog);return c;
   }
   ENDHLSL
  }
 }
}
