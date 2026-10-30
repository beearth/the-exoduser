Shader "EXODUSER/A2ToxicRiver"
{
 Properties { _BaseColor("탁한 녹황",Color)=(.075,.080,.023,1) _FoamColor("오염 거품",Color)=(.22,.24,.10,1) _Emission("은은한 자체발광",Range(0,.1))=.012 }
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
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   CBUFFER_START(UnityPerMaterial)
   half4 _BaseColor,_FoamColor;half _Emission;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float4 screen:TEXCOORD1;half fog:TEXCOORD2;};
   V vert(A a){V o=(V)0;VertexPositionInputs p=GetVertexPositionInputs(a.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.screen=ComputeScreenPos(p.positionCS);o.fog=ComputeFogFactor(p.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    float2 p=i.world.xz;float t=_Time.y;
    // 저주파 두 흐름. 랜덤 점·디더링·고주파 노이즈 없음.
    float a=dot(p,float2(.74,.21))-t*.12,b=dot(p,float2(-.35,.57))+t*.08;
    float flow=sin(a+sin(b)*.4)*.5+.5;
    float3 n=normalize(float3(-cos(a)*.035,1,-cos(b)*.025));
    float2 screenUV=i.screen.xy/i.screen.w;
    float scene=LinearEyeDepth(SampleSceneDepth(screenUV),_ZBufferParams);
    float surface=-TransformWorldToView(i.world).z;
    float contact=1-smoothstep(.025,.28,max(0,scene-surface));
    float ribbon=sin(p.y*2.1+sin(p.x*1.4)*1.4-t*.18)*.5+.5;
    float foam=contact*smoothstep(.28,.8,ribbon)*.72;
    InputData data=(InputData)0;data.positionWS=i.world;data.normalWS=n;data.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);data.shadowCoord=TransformWorldToShadowCoord(i.world);data.bakedGI=SampleSH(n);data.shadowMask=1;data.normalizedScreenSpaceUV=screenUV;
    SurfaceData s=(SurfaceData)0;s.albedo=lerp(_BaseColor.rgb*(.82+.24*flow),_FoamColor.rgb,foam);s.normalTS=float3(0,0,1);s.metallic=0;s.specular=.035;s.smoothness=lerp(.62,.16,foam);s.occlusion=1;s.alpha=1;s.emission=_BaseColor.rgb*_Emission;
    half4 c=UniversalFragmentPBR(data,s);c.rgb=MixFog(c.rgb,i.fog);return c;
   }
   ENDHLSL
  }
 }
}
