Shader "Exoduser/CharacterSelectStagePreview/PBR"
{
 Properties {
  [MainTexture] _BaseMap("기존 PBR 색",2D)="white"{}
  [MainColor] _BaseColor("기존 재질 색",Color)=(1,1,1,1)
  _BumpMap("법선",2D)="bump"{} _BumpScale("법선 세기",Float)=1
  _MetallicGlossMap("금속·매끄러움",2D)="white"{} _Metallic("금속",Range(0,1))=0 _Smoothness("매끄러움",Range(0,1))=.4
  _SpecColor("스페큘러",Color)=(.2,.2,.2,1)
  _EmissionMap("발광 지도",2D)="white"{} _EmissionColor("발광",Color)=(0,0,0,0)
  _OcclusionMap("오클루전",2D)="white"{} _OcclusionStrength("오클루전 세기",Range(0,1))=1
  _Cutoff("알파 기준",Range(0,1))=.5 _Cull("면",Float)=0
  [HideInInspector] _Surface("__surface",Float)=0 [HideInInspector] _AlphaClip("__clip",Float)=0
 }
 SubShader {
  Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
  Pass {
   Name "검토 전용 PBR" Tags {"LightMode"="UniversalForward"} Cull [_Cull] ZWrite On
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile_local_fragment _ _NORMALMAP
   #pragma multi_compile_local_fragment _ _METALLICSPECGLOSSMAP
   #pragma multi_compile_local_fragment _ _EMISSION
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
   #define _ENVIRONMENTREFLECTIONS_OFF 1
   #include "Packages/com.unity.render-pipelines.universal/Shaders/LitInput.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   struct Attributes {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;};
   struct Varyings {float4 positionCS:SV_POSITION;float3 positionWS:TEXCOORD0;half3 normalWS:TEXCOORD1;half4 tangentWS:TEXCOORD2;float2 uv:TEXCOORD3;};
   Varyings vert(Attributes i) {Varyings o;VertexPositionInputs p=GetVertexPositionInputs(i.positionOS.xyz);VertexNormalInputs n=GetVertexNormalInputs(i.normalOS,i.tangentOS);o.positionCS=p.positionCS;o.positionWS=p.positionWS;o.normalWS=n.normalWS;o.tangentWS=half4(n.tangentWS,i.tangentOS.w*GetOddNegativeScale());o.uv=TRANSFORM_TEX(i.uv,_BaseMap);return o;}
   half4 frag(Varyings i):SV_Target {
    SurfaceData s;InitializeStandardLitSurfaceData(i.uv,s);InputData d=(InputData)0;
    half3 b=i.tangentWS.w*cross(i.normalWS,i.tangentWS.xyz);d.normalWS=NormalizeNormalPerPixel(TransformTangentToWorld(s.normalTS,half3x3(i.tangentWS.xyz,b,i.normalWS)));
    d.positionWS=i.positionWS;d.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.positionWS);d.shadowCoord=TransformWorldToShadowCoord(i.positionWS);d.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);d.shadowMask=half4(1,1,1,1);
    // 전투 씬의 전역 SH/sky 밝기를 복사하지 않는다. 실제 이 무대 광원과 낮은 국소 확산만 사용한다.
    d.bakedGI=half3(.012,.014,.018);d.vertexLighting=VertexLighting(i.positionWS,d.normalWS);
    return UniversalFragmentPBR(d,s);
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
