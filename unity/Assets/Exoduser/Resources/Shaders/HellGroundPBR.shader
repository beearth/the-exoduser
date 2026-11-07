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
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DBuffer.hlsl"
   TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_BumpMap);SAMPLER(sampler_BumpMap);
   TEXTURE2D(_RockMap);SAMPLER(sampler_RockMap);TEXTURE2D(_AshMap);SAMPLER(sampler_AshMap);
   TEXTURE2D(_RockNormal);SAMPLER(sampler_RockNormal);TEXTURE2D(_RockRough);SAMPLER(sampler_RockRough);
   TEXTURE2D(_ForestMap);SAMPLER(sampler_ForestMap);TEXTURE2D(_ForestNormal);SAMPLER(sampler_ForestNormal);TEXTURE2D(_ForestRough);SAMPLER(sampler_ForestRough);
   TEXTURE2D(_SoilMap);TEXTURE2D(_SoilNormal);TEXTURE2D(_SoilRough);TEXTURE2D(_RootMap);TEXTURE2D(_RootNormal);TEXTURE2D(_RootRough);
   TEXTURE2D(_FieldCover);SAMPLER(sampler_FieldCover);TEXTURE2D(_FieldSdf);SAMPLER(sampler_FieldSdf);TEXTURE2D(_FieldMoss);TEXTURE2D(_FieldMossNormal);TEXTURE2D(_FieldMossRough);
   CBUFFER_START(UnityPerMaterial)
   float4 _BaseMap_ST;half4 _BaseColor;half _Cutoff,_Smoothness,_Metallic,_ForestBlend,_ForestTextureMix,_SoilTextureMix,_FullField;
   CBUFFER_END
   struct A {float4 positionOS:POSITION;float3 normalOS:NORMAL;float4 tangentOS:TANGENT;float2 uv:TEXCOORD0;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;float4 tangent:TEXCOORD2;float2 uv:TEXCOORD3;half fog:TEXCOORD4;};
   V vert(A v){V o;o.world=TransformObjectToWorld(v.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(v.normalOS);o.tangent=float4(TransformObjectToWorldDir(v.tangentOS.xyz),v.tangentOS.w*GetOddNegativeScale());o.uv=v.uv;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
   float FieldHash(float2 p){p=frac(p*float2(123.34,456.21));p+=dot(p,p+45.32);return frac(p.x*p.y);}
   float FieldNoise(float2 p){float2 c=floor(p),f=frac(p);f=f*f*(3-2*f);
    return lerp(lerp(FieldHash(c),FieldHash(c+float2(1,0)),f.x),lerp(FieldHash(c+float2(0,1)),FieldHash(c+float2(1,1)),f.x),f.y);}
   // 같은 텍스처를 UV×1과 UV×0.5로 섞어 반복 무늬를 지운다. 높이는 낮은 밉(약 8×8 텍셀 평균) 명도라 큰 붓 덩어리만 남는다.
   // 세 단: 큰 형태(밉4, 텍셀 약 8cm → .5m 이상 덩어리) + 중간 디테일(밉2.5, 10~30cm 돌·뿌리·이끼 결, 색 그대로 mid 비율)
   // + 고운 결(밉 바이어스 1.2, 명도만 ±40% 안에서 fine 비율). 자갈 한 알 크기 점은 고운 결 비율로 누른다(잡음 지수 .02~.03).
   half3 FieldLayer(TEXTURE2D_PARAM(tex,smp),float2 uv,half mid,half fine,out half height)
   {
    float2 uv2=uv*.5+.23;
    half3 broad=SAMPLE_TEXTURE2D_LOD(tex,smp,uv,4).rgb*.55+SAMPLE_TEXTURE2D_LOD(tex,smp,uv2,4).rgb*.45;
    half3 middle=SAMPLE_TEXTURE2D_LOD(tex,smp,uv,2.5).rgb*.55+SAMPLE_TEXTURE2D_LOD(tex,smp,uv2,2.5).rgb*.45;
    half3 near=SAMPLE_TEXTURE2D_BIAS(tex,smp,uv,1.2).rgb*.55+SAMPLE_TEXTURE2D_BIAS(tex,smp,uv2,1.2).rgb*.45;
    half3 col=broad+(middle-broad)*mid;
    half lb=max(dot(broad,half3(.299,.587,.114)),.03h),lm=max(dot(middle,half3(.299,.587,.114)),.03h),d=dot(near,half3(.299,.587,.114))-lm;
    height=saturate(lb*1.6+(lm-lb)*1.2+d*.5);
    return col*(1+clamp(d/lm,-.4h,.4h)*fine);
   }
   half3 FieldNormal(TEXTURE2D_PARAM(tex,smp),float2 uv,half scale)
   {
    half3 a=UnpackNormalScale(SAMPLE_TEXTURE2D_BIAS(tex,smp,uv,1.5),scale),b=UnpackNormalScale(SAMPLE_TEXTURE2D_BIAS(tex,smp,uv*.5+.23,1.5),scale);
    return normalize(half3(a.xy+b.xy,a.z*b.z));
   }
   // 높이 블렌딩: 마스크가 바뀌는 곳에서 높은 쪽 질감이 먼저 올라온다. 폭 .12는 화면에서 약 .3~.5m 경계.
   float HeightBlend(half baseH,half layerH,float mask){return smoothstep(-.12,.12,(mask-.5)*1.4+(layerH-baseH)*.6);}
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
    float fieldSmooth=0;
    if(_FullField>.5)
    {
     // 11-07 1-1 바닥 질감(리소스·PoE2 실측): 텍셀 190~205px/m(1024² 한 장을 5.0~5.4m마다), UV×1·×0.5 이중 스케일,
     // 높이 블렌딩(색 명도에서 뽑은 낮은 밉 높이, 경계 약 .3~.5m), 월드 노이즈 거시 마스크(약 10~14m, sin 무늬 대신), 색 변주 ±5%, 채도 .72배.
     float edge=(SAMPLE_TEXTURE2D(_FieldSdf,sampler_FieldSdf,float2(i.world.x/80,-i.world.z/80)).r-.5)*40;
     float2 wp=i.world.xz;
     float macro=smoothstep(.28,.72,FieldNoise(wp/13.0+float2(3.1,7.7))*.7+FieldNoise(wp/5.5+float2(11.3,2.9))*.3);
     float fringe=1-smoothstep(.1,5,edge);
     half hs,hr,hl,hm;
     half3 dirt=FieldLayer(_SoilMap,sampler_ForestMap,wp/5.0,.75,.14,hs)*half3(.60,.52,.41);
     half3 roots=FieldLayer(_RootMap,sampler_ForestMap,wp/5.0+.37,.85,.2,hr)*half3(.62,.52,.40);
     half3 leaves=FieldLayer(_ForestMap,sampler_ForestMap,wp/5.4+.61,.9,.28,hl)*half3(.58,.49,.36);
     half3 moss=FieldLayer(_FieldMoss,sampler_ForestMap,wp/5.2+.19,.8,.18,hm)*half3(.47,.53,.35);
     float cover=SAMPLE_TEXTURE2D(_FieldCover,sampler_FieldCover,float2(i.world.x/80,-i.world.z/80)).r;
     half h=hs;a=dirt;fieldSmooth=.30;
     float tr=HeightBlend(h,hr,.30+.35*fringe);a=lerp(a,roots,tr);h=lerp(h,hr,tr);fieldSmooth=lerp(fieldSmooth,.26,tr);
     float tl=HeightBlend(h,hl,macro*.48);a=lerp(a,leaves,tl);h=lerp(h,hl,tl);fieldSmooth=lerp(fieldSmooth,.22,tl);
     mossMix=HeightBlend(h,hm,cover*(.45+.35*macro));a=lerp(a,moss,mossMix);fieldSmooth=lerp(fieldSmooth,.28,mossMix);
     half3 nSoil=FieldNormal(_SoilNormal,sampler_ForestMap,wp/5.0,.3),nRoot=FieldNormal(_RootNormal,sampler_ForestMap,wp/5.0+.37,.45);
     nt=normalize(lerp(nSoil,nRoot,tr));
     nt=normalize(lerp(nt,FieldNormal(_ForestNormal,sampler_ForestNormal,wp/5.4+.61,.3),tl));
     nt=normalize(lerp(nt,FieldNormal(_FieldMossNormal,sampler_ForestNormal,wp/5.2+.19,.45),mossMix));
     input.normalWS=normalize(mul(nt,float3x3(t,b,n)));
     a*=lerp(.88,1.06,macro);
     a*=1+(half3(FieldNoise(wp/9.0+float2(1.7,4.2)),FieldNoise(wp/9.0+float2(8.3,.6)),FieldNoise(wp/9.0+float2(5.9,9.1)))-.5)*.10;
     half lum=dot(a,half3(.299,.587,.114));a=lerp(lum.xxx,a,.95);
    }
    SurfaceData surface=(SurfaceData)0;surface.albedo=a;surface.alpha=1;surface.occlusion=1;surface.normalTS=nt;surface.specular=.04;
    half rough=SAMPLE_TEXTURE2D(_RockRough,sampler_RockRough,tile).r;surface.smoothness=lerp(.24,.50-.25*rough,rock);surface.metallic=0;
    surface.smoothness=lerp(surface.smoothness,.36-.16*rough,_ForestBlend);
    surface.smoothness=lerp(surface.smoothness,.14+.16*(1-SAMPLE_TEXTURE2D(_SoilRough,sampler_ForestRough,soilUV).r),soilMix);
    surface.smoothness=lerp(surface.smoothness,.12+.18*(1-SAMPLE_TEXTURE2D(_RootRough,sampler_ForestRough,rootUV).r),rootMix);
    half leafRough=SAMPLE_TEXTURE2D(_ForestRough,sampler_ForestRough,leafUV).r;surface.smoothness=lerp(surface.smoothness,.12+.18*(1-leafRough),leafMix);
    surface.smoothness=lerp(surface.smoothness,.22+.23*(1-SAMPLE_TEXTURE2D(_FieldMossRough,sampler_ForestRough,i.world.xz/2.6).r),mossMix);
    if(_FullField>.5)surface.smoothness=fieldSmooth; // 재질마다 거칠기 한 값: 바닥 반짝이 점 제거
    #if defined(_DBUFFER)
    ApplyDecalToSurfaceData(i.positionCS,surface,input);
    input.bakedGI=SampleSH(input.normalWS);
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
