Shader "EXODUSER/A2RootSurface"
{
 Properties { _BaseMap("피부 컬러맵",2D)="white"{} _BaseColor("색",Color)=(1,1,1,1) _BumpMap("피부 노멀",2D)="bump"{} _RockMap("젖은 돌",2D)="white"{} _AshMap("탄화토",2D)="white"{} _RockNormal("돌 노멀",2D)="bump"{} _RockRough("돌 러프니스",2D)="white"{} _ForestMap("숲 낙엽/흙",2D)="white"{} _ForestNormal("숲 노멀",2D)="bump"{} _ForestRough("숲 러프니스",2D)="white"{} _ForestTextureMix("낙엽 혼합",Range(0,1))=0 _FullField("전체 숲 지면",Float)=0 _FieldSdf("원본 외곽 거리장",2D)="gray"{} _FieldCover("전투공간 지면 이끼",2D)="black"{} _FieldMoss("이끼",2D)="white"{} _FieldMossNormal("이끼 노멀",2D)="bump"{} _FieldMossRough("이끼 러프니스",2D)="white"{} _Cutoff("잘림",Float)=.5 _Smoothness("매끈함",Float)=.24 _Metallic("금속",Float)=0 _ForestBlend("A2 젖은 숲 바닥",Range(0,1))=0
 _SoilTextureMix("A2 스캔 지면 사용",Range(0,1))=0 _SoilMap("A2 숲 자갈흙",2D)="white"{} _SoilNormal("A2 자갈흙 노멀",2D)="bump"{} _SoilRough("A2 자갈흙 러프니스",2D)="white"{} _RootMap("A2 노출 뿌리흙",2D)="white"{} _RootNormal("A2 뿌리흙 노멀",2D)="bump"{} _RootRough("A2 뿌리흙 러프니스",2D)="white"{} _ScanMap("스캔 수피",2D)="white"{} _ScanNormal("스캔 노멀",2D)="bump"{} _ScanARM("스캔 AO·러프니스·금속",2D)="white"{} _ScanColor("스캔 색",Color)=(.9,.85,.75,1) _Cull("뒷면 제거",Float)=2 }
 SubShader
 {
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
  Pass
  {
   Name "Forward" Tags { "LightMode"="UniversalForward" }
   Offset -1,-1
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
   #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
            #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
   TEXTURE2D(_RockMap);TEXTURE2D(_AshMap);
   TEXTURE2D(_RockNormal);TEXTURE2D(_RockRough);
   TEXTURE2D(_ForestMap);SAMPLER(sampler_ForestMap);TEXTURE2D(_ForestNormal);TEXTURE2D(_ForestRough);
   TEXTURE2D(_SoilMap);TEXTURE2D(_SoilNormal);TEXTURE2D(_SoilRough);TEXTURE2D(_RootMap);TEXTURE2D(_RootNormal);TEXTURE2D(_RootRough);
   TEXTURE2D(_ScanMap);SAMPLER(sampler_ScanMap);TEXTURE2D(_ScanNormal);TEXTURE2D(_ScanARM);
   TEXTURE2D(_FieldCover);SAMPLER(sampler_FieldCover);TEXTURE2D(_FieldSdf);TEXTURE2D(_FieldMoss);TEXTURE2D(_FieldMossNormal);TEXTURE2D(_FieldMossRough);
   CBUFFER_START(UnityPerMaterial)
   half4 _ScanColor;
   float4 _BaseMap_ST;half4 _BaseColor;half _Cutoff,_Smoothness,_Metallic,_ForestBlend,_ForestTextureMix,_SoilTextureMix,_FullField;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;half4 color:COLOR;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half fog:TEXCOORD4;half4 color:TEXCOORD5;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w*GetOddNegativeScale());o.uv=v.uv;o.color=v.color;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   half4 frag(V i):SV_Target
   {
    float2 tile=i.world.xz/6;float sweep=smoothstep(0,1,(sin(i.world.x*.7+i.world.z*.29)+sin(i.world.z*.51-i.world.x*.17)+2)*.25);
    half rock=.08+.26*sweep,ash=.06+.12*(1-sweep);
    half3 skin=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb;
    half3 stone=SAMPLE_TEXTURE2D(_RockMap,sampler_ForestMap,tile).rgb*half3(.55,.56,.58);
    half3 soil=SAMPLE_TEXTURE2D(_AshMap,sampler_ForestMap,tile).rgb*half3(.55,.56,.58);
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
    half3 nr=UnpackNormalScale(SAMPLE_TEXTURE2D(_RockNormal,sampler_ForestMap,tile),.3);
    half3 nt=normalize(lerp(ns,nr,lerp(rock,1,_ForestBlend)));
    nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_ForestMap,soilUV),.6),soilMix));
    nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_RootNormal,sampler_ForestMap,rootUV),.7),rootMix));
    half3 leafN=UnpackNormalScale(SAMPLE_TEXTURE2D(_ForestNormal,sampler_ForestMap,leafUV),.3);nt=normalize(lerp(nt,leafN,leafMix));
    float mossMix=0,wetness=0;
    if(_FullField>.5)
    {
     float edge=(SAMPLE_TEXTURE2D(_FieldSdf,sampler_FieldCover,float2(i.world.x/80,-i.world.z/80)).r-.5)*40;
     float macro=smoothstep(-.7,.7,sin(i.world.x*.11+sin(i.world.z*.09)*2)+cos(i.world.z*.13-i.world.x*.05)*.6);
     wetness=smoothstep(.32,.82,macro)*(1-.35*saturate(edge/5));
     float fringe=1-smoothstep(.1,5,edge);
     float2 soilFine=i.world.xz/2.3;
     half3 dirt=SAMPLE_TEXTURE2D(_SoilMap,sampler_ForestMap,soilFine).rgb*half3(.48,.39,.30);
     half3 roots=SAMPLE_TEXTURE2D(_RootMap,sampler_ForestMap,i.world.xz/3.8).rgb*half3(.45,.35,.26);
     half3 leaves=SAMPLE_TEXTURE2D(_ForestMap,sampler_ForestMap,i.world.xz/1.8).rgb*half3(.36,.29,.21);
     half3 moss=SAMPLE_TEXTURE2D(_FieldMoss,sampler_ForestMap,i.world.xz/2.6).rgb*half3(.31,.35,.23);
     mossMix=SAMPLE_TEXTURE2D(_FieldCover,sampler_FieldCover,float2(i.world.x/80,-i.world.z/80)).r*(.58+.22*macro);
     a=lerp(dirt,roots,.18+.22*fringe);a=lerp(a,leaves,(1-macro)*.22);a*=lerp(1,.60,wetness);a=lerp(a,moss,mossMix);
     nt=normalize(lerp(UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_ForestMap,soilFine),.65),UnpackNormalScale(SAMPLE_TEXTURE2D(_RootNormal,sampler_ForestMap,i.world.xz/3.8),.65),.18+.22*fringe));
     nt=normalize(lerp(nt,UnpackNormalScale(SAMPLE_TEXTURE2D(_FieldMossNormal,sampler_ForestMap,i.world.xz/2.6),.55),mossMix));
     a*=lerp(.88,1.06,macro);
    }
    
    float3 n=normalize(i.normal),t=normalize(float3(1,0,0)-n*n.x),b=-normalize(cross(n,t));
    float scanWeight=_FullField>.5?smoothstep(.25,1,i.color.r)*smoothstep(.12,.55,1-abs(n.y)):saturate(i.color.r);float3 scanT=normalize(i.tangent.xyz),scanB=cross(n,scanT)*i.tangent.w;
    half3 scanN=UnpackNormalScale(SAMPLE_TEXTURE2D(_ScanNormal,sampler_ScanMap,i.uv),.7);float3 scanWorld=normalize(mul(scanN,float3x3(scanT,scanB,n)));
    InputData input=(InputData)0;input.positionWS=i.world;input.normalWS=normalize(lerp(normalize(mul(nt,float3x3(t,b,n))),scanWorld,scanWeight));input.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    input.shadowCoord=TransformWorldToShadowCoord(i.world);input.bakedGI=SampleSH(input.normalWS);input.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);input.shadowMask=1;
    SurfaceData surface=(SurfaceData)0;surface.albedo=a;surface.alpha=1;surface.occlusion=1;surface.normalTS=nt;surface.specular=.04;
    half rough=SAMPLE_TEXTURE2D(_RockRough,sampler_ForestMap,tile).r;surface.smoothness=lerp(.24,.50-.25*rough,rock);surface.metallic=0;
    surface.smoothness=lerp(surface.smoothness,.36-.16*rough,_ForestBlend);
    surface.smoothness=lerp(surface.smoothness,.14+.16*(1-SAMPLE_TEXTURE2D(_SoilRough,sampler_ForestMap,soilUV).r),soilMix);
    surface.smoothness=lerp(surface.smoothness,.12+.18*(1-SAMPLE_TEXTURE2D(_RootRough,sampler_ForestMap,rootUV).r),rootMix);
    half leafRough=SAMPLE_TEXTURE2D(_ForestRough,sampler_ForestMap,leafUV).r;surface.smoothness=lerp(surface.smoothness,.12+.18*(1-leafRough),leafMix);
    surface.smoothness=lerp(surface.smoothness,.22+.23*(1-SAMPLE_TEXTURE2D(_FieldMossRough,sampler_ForestMap,i.world.xz/2.6).r),mossMix);
    if(_FullField>.5)surface.smoothness=lerp(lerp(.24-.10*SAMPLE_TEXTURE2D(_SoilRough,sampler_ForestMap,i.world.xz/2.3).r,.67,wetness),.18+.16*(1-SAMPLE_TEXTURE2D(_FieldMossRough,sampler_ForestMap,i.world.xz/2.6).r),mossMix);
    half3 scanARM=SAMPLE_TEXTURE2D(_ScanARM,sampler_ScanMap,i.uv).rgb;
    surface.albedo=lerp(surface.albedo,SAMPLE_TEXTURE2D(_ScanMap,sampler_ScanMap,i.uv).rgb*_ScanColor.rgb,scanWeight);surface.occlusion=lerp(1,scanARM.r,scanWeight);surface.smoothness=lerp(surface.smoothness,1-scanARM.g,scanWeight);
    half4 color=UniversalFragmentPBR(input,surface);color.rgb=MixFog(color.rgb,i.fog);return color;
   }
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
  UsePass "Universal Render Pipeline/Lit/DepthNormals"
 }
}
