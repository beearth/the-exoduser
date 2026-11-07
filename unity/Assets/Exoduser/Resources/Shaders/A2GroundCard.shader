Shader "EXODUSER/A2GroundCard"
{
 // 11-07 1-1 바닥 잔해 층(스프라이트 시트): 바닥 위 1cm 카드. 잔가지·솔잎·잔뿌리·낙엽 = 잘림값 기준 미분 선명화 알파 블렌드(_Clip 1, ZWrite 끔),
 // 이끼·젖은 흙 패치 = 알파 블렌드(_Clip 0, ZWrite 끔). 아틀라스는 우리 Blender 절차 메시를 위에서 구운 것(Color·Normal·Height).
 // 그림자는 받기만 한다(드리우지 않음). 접지 그림자는 A2GroundCardAO가 맡는다.
 Properties
 {
  _BaseMap("색(알파)",2D)="white"{} _BumpMap("노멀",2D)="bump"{} _HeightMap("높이",2D)="white"{}
  _Clip("알파 테스트",Float)=1 _Cutoff("잘림",Float)=.5 _Smooth("매끈함",Float)=.2 _Cavity("낮은 곳 어둡게",Float)=.25 _Alpha("불투명도",Float)=1
  [HideInInspector]_Src("src",Float)=1 [HideInInspector]_Dst("dst",Float)=0 [HideInInspector]_ZW("zwrite",Float)=1
 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="TransparentCutout" "Queue"="AlphaTest" "IgnoreProjector"="True" }
  Pass
  {
   Name "Forward" Tags { "LightMode"="UniversalForward" }
   Blend [_Src] [_Dst] ZWrite [_ZW] Cull Off
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);TEXTURE2D(_HeightMap);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half _Clip,_Cutoff,_Smooth,_Cavity,_Alpha,_Src,_Dst,_ZW;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;float4 color:COLOR;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half4 color:TEXCOORD4;half fog:TEXCOORD5;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w);o.uv=v.uv;o.color=v.color;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i,bool front:SV_IsFrontFace):SV_Target
   {
    half4 c=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv);
    half alpha=c.a*_Alpha*i.color.a;
    // 알파 테스트 계단(가는 가지가 점선으로 끊김) 대신 화면 미분 폭만큼 부드러운 경계. _Clip 1 = 잘림값 기준 선명화 + 블렌드.
    if(_Clip>.5){half w=max(fwidth(alpha),1e-3h);alpha=saturate((alpha-_Cutoff)/w+.5);clip(alpha-.02h);}
    half h=SAMPLE_TEXTURE2D(_HeightMap,sampler_BaseMap,i.uv).r;
    half3 albedo=c.rgb*i.color.rgb*lerp(1-_Cavity,1,saturate(h*3));
    half3 nt=UnpackNormal(SAMPLE_TEXTURE2D(_BumpMap,sampler_BaseMap,i.uv));
    float3 n=normalize(i.normal),t=normalize(i.tangent.xyz),b=cross(n,t)*i.tangent.w;
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(mul(nt,float3x3(t,b,n)));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData s=(SurfaceData)0;s.albedo=albedo;s.alpha=alpha;s.occlusion=1;s.normalTS=nt;s.specular=.04;s.smoothness=_Smooth;s.metallic=0;
    half4 col=UniversalFragmentPBR(input,s);col.rgb=MixFog(col.rgb,i.fog);return half4(col.rgb,alpha);
   }
   ENDHLSL
  }
 }
}
