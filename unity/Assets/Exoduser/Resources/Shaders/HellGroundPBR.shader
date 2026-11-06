Shader "EXODUSER/HellGroundPBR"
{
 Properties { _BaseMap("피부 컬러맵",2D)="white"{} _BaseColor("색",Color)=(1,1,1,1) _BumpMap("피부 노멀",2D)="bump"{} _RockMap("젖은 돌",2D)="white"{} _AshMap("탄화토",2D)="white"{} _RockNormal("돌 노멀",2D)="bump"{} _RockRough("돌 러프니스",2D)="white"{} _ForestMap("숲 낙엽/흙",2D)="white"{} _ForestNormal("숲 노멀",2D)="bump"{} _ForestRough("숲 러프니스",2D)="white"{} _ForestTextureMix("낙엽 혼합",Range(0,1))=0 _FullField("전체 숲 지면",Float)=0 _FieldSdf("원본 외곽 거리장",2D)="gray"{} _FieldCover("전투공간 지면 이끼",2D)="black"{} _FieldMoss("이끼",2D)="white"{} _FieldMossNormal("이끼 노멀",2D)="bump"{} _FieldMossRough("이끼 러프니스",2D)="white"{} _Cutoff("잘림",Float)=.5 _Smoothness("매끈함",Float)=.24 _Metallic("금속",Float)=0 _ForestBlend("A2 젖은 숲 바닥",Range(0,1))=0
 _SoilTextureMix("A2 스캔 지면 사용",Range(0,1))=0 _SoilMap("A2 숲 자갈흙",2D)="white"{} _SoilNormal("A2 자갈흙 노멀",2D)="bump"{} _SoilRough("A2 자갈흙 러프니스",2D)="white"{} _RootMap("A2 노출 뿌리흙",2D)="white"{} _RootNormal("A2 뿌리흙 노멀",2D)="bump"{} _RootRough("A2 뿌리흙 러프니스",2D)="white"{} }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
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
   #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
   #pragma multi_compile_fragment _ _DBUFFER_MRT1 _DBUFFER_MRT2 _DBUFFER_MRT3
   #pragma multi_compile_fog
   #pragma multi_compile_local_fragment _ _A2_CLEAN_GROUND
   #pragma multi_compile_local _ _A2_DEBUG_GROUND
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DBuffer.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
   TEXTURE2D(_RockMap);SAMPLER(sampler_RockMap);TEXTURE2D(_AshMap);SAMPLER(sampler_AshMap);
   TEXTURE2D(_RockNormal);SAMPLER(sampler_RockNormal);TEXTURE2D(_RockRough);SAMPLER(sampler_RockRough);
   TEXTURE2D(_ForestMap);SAMPLER(sampler_ForestMap);TEXTURE2D(_ForestNormal);SAMPLER(sampler_ForestNormal);TEXTURE2D(_ForestRough);SAMPLER(sampler_ForestRough);
   TEXTURE2D(_SoilMap);TEXTURE2D(_SoilNormal);TEXTURE2D(_SoilRough);TEXTURE2D(_RootMap);TEXTURE2D(_RootNormal);TEXTURE2D(_RootRough);
   #ifdef _A2_CLEAN_GROUND
   SAMPLER(sampler_SoilMap);   // 이 변형에서는 _ForestMap 표본이 모두 사라져 sampler_ForestMap을 쓸 수 없다.
   #endif
   TEXTURE2D(_FieldCover);SAMPLER(sampler_FieldCover);TEXTURE2D(_FieldSdf);SAMPLER(sampler_FieldSdf);TEXTURE2D(_FieldMoss);TEXTURE2D(_FieldMossNormal);TEXTURE2D(_FieldMossRough);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;half _Cutoff,_Smoothness,_Metallic,_ForestBlend,_ForestTextureMix,_SoilTextureMix,_FullField;
   CBUFFER_END
   #ifdef _A2_DEBUG_GROUND
   // --a2-debug-ground 전용 변형. 얼룩 원인 분리용 출력이며 기본 변형에는 컴파일되지 않는다. 값은 NativeGame.A2Clean.cs가 전역으로 넣는다.
   float _A2DebugGroundMode;
   #define A2_DEBUG_ATTR float4 color:COLOR;
   #define A2_DEBUG_VARY half4 color:TEXCOORD5;
   #define A2_DEBUG_COPY o.color=v.color;
   #else
   #define A2_DEBUG_ATTR
   #define A2_DEBUG_VARY
   #define A2_DEBUG_COPY
   #endif
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;A2_DEBUG_ATTR};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half fog:TEXCOORD4;A2_DEBUG_VARY};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w*GetOddNegativeScale());o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);A2_DEBUG_COPY return o;}
   half4 frag(V i):SV_Target
   {
    float2 tile=i.world.xz/6;float sweep=smoothstep(0,1,(sin(i.world.x*.7+i.world.z*.29)+sin(i.world.z*.51-i.world.x*.17)+2)*.25);
    half rock=.08+.26*sweep,ash=.06+.12*(1-sweep);
    half3 skin=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb;
    half3 stone=SAMPLE_TEXTURE2D(_RockMap,sampler_RockMap,tile).rgb*half3(.55,.56,.58);
    half3 soil=SAMPLE_TEXTURE2D(_AshMap,sampler_AshMap,tile).rgb*half3(.55,.56,.58);
    half3 a=skin*(1-rock-ash)+stone*rock+soil*ash;
    half3 forest=lerp(soil*.9,stone*.6,.28+.2*sweep)*half3(.75,.65,.48);
    a=lerp(a,forest,_ForestBlend);
    float2 leafUV=i.world.xz/2.1;
    float across=(i.world.x-43.2)*.913545458-(i.world.z+71.8)*.406736643;
    float2 soilUV=i.world.xz/3.2,rootUV=i.world.xz/2.5;
    float treeDistance=min(min(distance(i.world.xz,float2(34.8,-70.5)),distance(i.world.xz,float2(49,-64.8))),min(distance(i.world.xz,float2(53.3,-77)),distance(i.world.xz,float2(29.5,-64))));
    float soilMix=_ForestBlend*_SoilTextureMix;
    float rootMix=soilMix*max(.85*(1-smoothstep(2,5,treeDistance)),smoothstep(2,5,abs(across)))*(.45+.25*sweep);
    a=lerp(a,SAMPLE_TEXTURE2D(_SoilMap,sampler_ForestMap,soilUV).rgb*half3(.62,.55,.45),soilMix);
    a=lerp(a,SAMPLE_TEXTURE2D(_RootMap,sampler_ForestMap,rootUV).rgb*half3(.70,.63,.52),rootMix);
    float leafMix=_ForestBlend*_ForestTextureMix*lerp(.1,1,smoothstep(1.5,3.5,abs(across)))*(.25+.75*sweep);
    half3 leaf=SAMPLE_TEXTURE2D(_ForestMap,sampler_ForestMap,leafUV).rgb*half3(.42,.37,.26);
    a=lerp(a,leaf,leafMix);
    half3 ns=UnpackNormalScale(SAMPLE_TEXTURE2D(_BumpMap,sampler_BumpMap,i.uv),.45);
    half3 nr=UnpackNormalScale(SAMPLE_TEXTURE2D(_RockNormal,sampler_RockNormal,tile),.3);
    half3 nt=normalize(lerp(ns,nr,lerp(rock,1,_ForestBlend)));
    nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_ForestNormal,soilUV),.6),soilMix));
    nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_RootNormal,sampler_ForestNormal,rootUV),.7),rootMix));
    half3 leafN=UnpackNormalScale(SAMPLE_TEXTURE2D(_ForestNormal,sampler_ForestNormal,leafUV),.3);nt=normalize(lerp(nt,leafN,leafMix));
    float3 n=normalize(i.normal),t=normalize(i.tangent.xyz),b=cross(n,t)*i.tangent.w;
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(mul(nt,float3x3(t,b,n)));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    float mossMix=0;
    if(_FullField>.5)
    {
     float edge=(SAMPLE_TEXTURE2D(_FieldSdf,sampler_FieldSdf,float2(i.world.x/80,-i.world.z/80)).r-.5)*40;
     float macro=smoothstep(-.7,.7,sin(i.world.x*.27+sin(i.world.z*.23)*1.8)+sin(i.world.z*.36+i.world.x*.16)*.55);
     float fringe=1-smoothstep(.1,5,edge);
     float2 soilFine=i.world.xz/2.3;
     half3 dirt=SAMPLE_TEXTURE2D(_SoilMap,sampler_ForestMap,soilFine).rgb*half3(.55,.48,.36);
     half3 roots=SAMPLE_TEXTURE2D(_RootMap,sampler_ForestMap,i.world.xz/3.8).rgb*half3(.60,.48,.32);
     half3 leaves=SAMPLE_TEXTURE2D(_ForestMap,sampler_ForestMap,i.world.xz/1.8).rgb*half3(.47,.38,.24);
     half3 moss=SAMPLE_TEXTURE2D(_FieldMoss,sampler_ForestMap,i.world.xz/2.6).rgb*half3(.50,.56,.34);
     mossMix=SAMPLE_TEXTURE2D(_FieldCover,sampler_FieldCover,float2(i.world.x/80,-i.world.z/80)).r*(.48+.35*macro);
     a=lerp(dirt,roots,.3+.35*fringe);a=lerp(a,leaves,macro*.42);a=lerp(a,moss,mossMix);
     nt=normalize(lerp(UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_ForestMap,soilFine),.65),UnpackNormalScale(SAMPLE_TEXTURE2D(_RootNormal,sampler_ForestMap,i.world.xz/3.8),.65),.3+.35*fringe));
     nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_FieldMossNormal,sampler_ForestNormal,i.world.xz/2.6),.55),mossMix));
     input.normalWS=normalize(mul(nt,float3x3(t,b,n)));
     a*=lerp(.8,1.12,macro);
    }
    #ifdef _A2_CLEAN_GROUND
    // 출처: BRIEF_CLEAN_MAP_20261105 §1 M1. --a2-clean 전용 변형, 기본 변형에는 컴파일되지 않는다.
    // M1a: A2_ForestSoil(forest_ground_04, Poly Haven 폭 3.2m) 실척 타일. 3.2m÷1.152m/u≈2.78u(1u 환산: Mac 662fb36ff M0_M1_JUDGE §6).
    // 틴트 제거: 틴트가 원본 평균을 Adobe PBR Guide Part 2 비금속 하한(sRGB 50) 아래로 내렸다(CLEAN_MAP/M1_RETILE_SOURCES §3). 노멀 강도는 _FullField의 soilFine 값 그대로.
    {
     float2 cleanUV=i.world.xz/2.78;
     mossMix=0;
     a=SAMPLE_TEXTURE2D(_SoilMap,sampler_SoilMap,cleanUV).rgb;
     nt=UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_SoilMap,cleanUV),.65);
     input.normalWS=normalize(mul(nt,float3x3(t,b,n)));
    }
    #endif
    SurfaceData surface=(SurfaceData)0;surface.albedo=a;surface.alpha=1;surface.occlusion=1;surface.normalTS=nt;surface.specular=.04;
    half rough=SAMPLE_TEXTURE2D(_RockRough,sampler_RockRough,tile).r;surface.smoothness=lerp(.24,.50-.25*rough,rock);surface.metallic=0;
    surface.smoothness=lerp(surface.smoothness,.36-.16*rough,_ForestBlend);
    surface.smoothness=lerp(surface.smoothness,.14+.16*(1-SAMPLE_TEXTURE2D(_SoilRough,sampler_ForestRough,soilUV).r),soilMix);
    surface.smoothness=lerp(surface.smoothness,.12+.18*(1-SAMPLE_TEXTURE2D(_RootRough,sampler_ForestRough,rootUV).r),rootMix);
    half leafRough=SAMPLE_TEXTURE2D(_ForestRough,sampler_ForestRough,leafUV).r;surface.smoothness=lerp(surface.smoothness,.12+.18*(1-leafRough),leafMix);
    surface.smoothness=lerp(surface.smoothness,.22+.23*(1-SAMPLE_TEXTURE2D(_FieldMossRough,sampler_ForestRough,i.world.xz/2.6).r),mossMix);
    if(_FullField>.5)surface.smoothness=lerp(.44-.24*SAMPLE_TEXTURE2D(_SoilRough,sampler_ForestMap,i.world.xz/2.3).r,.24+.18*(1-SAMPLE_TEXTURE2D(_FieldMossRough,sampler_ForestMap,i.world.xz/2.6).r),mossMix);
    #ifdef _A2_CLEAN_GROUND
    surface.smoothness=.44-.24*SAMPLE_TEXTURE2D(_SoilRough,sampler_SoilMap,i.world.xz/2.78).r;
    #endif
    #if defined(_DBUFFER)
    ApplyDecalToSurfaceData(i.positionCS,surface,input);
    input.bakedGI=SampleSH(input.normalWS);
    #endif
    #ifdef _A2_DEBUG_GROUND
    // 1 worldNormal: 메시 정점 법선(노멀맵 전). 2 vertexColor. 3 shOnly: SampleSH(노멀맵 후)만, 알베도 흰색. 4 flatAmbient: 아래 PBR에 단색 앰비언트. 5 albedoOnly.
    // 1·2·3·5는 조명·안개를 건너뛰고 바로 출력한다. 4의 단색은 A2Ambient의 equator 값(A2Forest.cs).
    if(_A2DebugGroundMode>.5&&_A2DebugGroundMode<1.5)return half4(n*.5+.5,1);
    if(_A2DebugGroundMode>1.5&&_A2DebugGroundMode<2.5)return half4(i.color.rgb,1);
    if(_A2DebugGroundMode>2.5&&_A2DebugGroundMode<3.5)return half4(SampleSH(input.normalWS),1);
    if(_A2DebugGroundMode>3.5&&_A2DebugGroundMode<4.5)input.bakedGI=half3(.20,.19,.16);
    if(_A2DebugGroundMode>4.5)return half4(a,1);
    #endif
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return color;
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
