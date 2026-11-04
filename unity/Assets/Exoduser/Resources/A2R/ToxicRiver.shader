Shader "EXODUSER/A2R/ToxicRiver"
{
 Properties { _SwampDressMode("Mud/debris presentation",Float)=0 [Enum(UnityEngine.Rendering.CullMode)] _SwampCull("Cull",Float)=2 [Enum(Off,0,On,1)] _SwampZWrite("Depth write",Float)=1 _A2RWebTex("Existing web poison paint",2D)="white"{} _A2RWebMix("Existing web paint enabled",Float)=0 _BaseColor("탁한 녹황",Color)=(.40,.32,.035,1) _FoamColor("오염 거품",Color)=(.57,.52,.23,1) _Emission("은은한 자체발광",Range(0,.1))=.1 _PlanarReflection("실제 장면 반사",2D)="black"{} _PlanarStrength("실제 반사 활성",Float)=0 _ShoreField("수로 접촉거리",2D)="black"{} _ShoreBounds("거리장 영역",Vector)=(-30,-100,140,170) _ShoreReady("거리장 연결",Float)=0 }
 SubShader
 {
  // 물가 거품은 불투명 지형 깊이가 복사된 뒤 샘플한다. 표면은 불투명하게 쓰되 그리기 순서만 뒤로 둔다.
  Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent" }
  ZWrite [_SwampZWrite]
  Cull [_SwampCull]
  Blend SrcAlpha OneMinusSrcAlpha
  Pass
  {
   Name "독액 수면" Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile_local_fragment _ _SPECULARHIGHLIGHTS_OFF
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
    #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   // Keep the explicit real planar reflection below; the default sky cubemap made dark poison blue-gray.
   #define _ENVIRONMENTREFLECTIONS_OFF 1
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
   #include "Nature.hlsl"
   CBUFFER_START(UnityPerMaterial)
    half _SwampDressMode;half _A2RWebMix;half4 _BaseColor,_FoamColor;half _Emission,_PlanarStrength,_ShoreReady;float4 _ShoreBounds;float4x4 _PlanarVP;
   CBUFFER_END
   float _A2RHellRot;float4 _A2RWaterFires[8];float4 _A2RWaterFireColors[8];int _A2RWaterFireCount;
   TEXTURE2D(_A2RWebTex);SAMPLER(sampler_A2RWebTex);
   TEXTURE2D(_PlanarReflection);SAMPLER(sampler_PlanarReflection);
    TEXTURE2D(_ShoreField);SAMPLER(sampler_ShoreField);
   float _A2RSwampOn;
   struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;half4 colour:COLOR;float3 normalOS:NORMAL;};
   struct V {float4 positionCS:SV_POSITION;float3 world:TEXCOORD0;float4 screen:TEXCOORD1;half fog:TEXCOORD2;half4 colour:TEXCOORD3;half3 normalWS:TEXCOORD4;};
   V vert(A a){V o=(V)0;VertexPositionInputs p=GetVertexPositionInputs(a.positionOS.xyz);o.positionCS=p.positionCS;o.world=p.positionWS;o.colour=a.colour;o.normalWS=TransformObjectToWorldNormal(a.normalOS);o.screen=ComputeScreenPos(p.positionCS);o.fog=ComputeFogFactor(p.positionCS.z);return o;}

   // Two analytic normal layers: metre-scale crests, no random noise/dither or sparkle.
   half4 SwampSurface(V i)
   {
    float2 p=i.world.xz;float t=_Time.y;
    float a=dot(p,float2(.81,.27))-t*.19;
    float b=dot(p,float2(-.32,.64))+t*.13+sin(a*.43)*.48;
    float2 slope=float2(.81,.27)*cos(a+sin(b)*.32)*.075+float2(-.32,.64)*cos(b)*.055;
    float ripple=A2RWave(p);slope+=float2(A2RWave(p+float2(.025,0))-ripple,A2RWave(p+float2(0,.025))-ripple)/.025;
    float3 n=normalize(float3(-slope.x,1,-slope.y));
    float2 uv=i.screen.xy/i.screen.w;
    float scene=LinearEyeDepth(SampleSceneDepth(uv),_ZBufferParams);
    float depth=max(0,scene+TransformWorldToView(i.world).z);
    float shore=SAMPLE_TEXTURE2D(_ShoreField,sampler_ShoreField,(p-_ShoreBounds.xy)/_ShoreBounds.zw).r;
    float wet=lerp(saturate(depth/.22),smoothstep(0,.8,max(0,shore)),_ShoreReady);
    float flow=.5+.5*sin(a*.61+sin(b*.72)*.65);
    float raft=smoothstep(.63,.89,sin(p.x*.59+p.y*.31-t*.033)*.5+.5);
    float folds=smoothstep(.56,.82,sin(p.x*.28-p.y*.71+t*.047+sin(a)*.42)*.5+.5);
    float oil=raft*folds*.34*wet;
    float scum=(1-smoothstep(.12,.9,max(0,shore)))*_ShoreReady;
    scum*=smoothstep(.36,.78,sin(b*.81+sin(a*.46))*.5+.5)*.38;
    half3 deep=lerp(half3(.016,.033,.021),half3(.061,.025,.020),flow);
    half3 colour=lerp(half3(.067,.046,.033),deep,wet);
    colour*=.40+1.00*(.5+.5*sin(a+sin(b)*.32));
    colour=lerp(colour,half3(.055,.064,.051),oil);
    colour=lerp(colour,half3(.093,.079,.055),scum);
    InputData data=(InputData)0;data.positionWS=i.world;data.normalWS=n;data.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    data.shadowCoord=TransformWorldToShadowCoord(i.world);data.bakedGI=SampleSH(n);data.shadowMask=1;data.normalizedScreenSpaceUV=uv;
    SurfaceData s=(SurfaceData)0;s.albedo=colour;s.normalTS=half3(0,0,1);s.metallic=0;s.specular=.025;
    s.smoothness=lerp(.66,.30,scum);s.occlusion=1;s.alpha=lerp(.88,1,wet);s.emission=0;
    half4 c=UniversalFragmentPBR(data,s);c.rgb*=.22;
    float4 reflected=mul(_PlanarVP,float4(i.world,1));float2 ru=reflected.xy/max(.0001,reflected.w)*.5+.5+n.xz*.075;
    float valid=step(.0001,reflected.w)*step(0,ru.x)*step(ru.x,1)*step(0,ru.y)*step(ru.y,1);
    half3 reflection=SAMPLE_TEXTURE2D(_PlanarReflection,sampler_PlanarReflection,ru).rgb;
    // Real scene reflection only; preserve the existing disabled sky-cubemap path and material keyword.
    float fresnel=.025+.13*pow(1-saturate(dot(n,data.viewDirectionWS)),4);
    c.rgb=lerp(c.rgb,min(reflection,half3(.6,.55,.46))*half3(.22,.20,.15),saturate(_PlanarStrength)*valid*fresnel*(1-scum));
    for(int k=0;k<min(8,_A2RWaterFireCount);k++)
    {
     float2 axis=_WorldSpaceCameraPos.xz-_A2RWaterFires[k].xz;axis/=max(length(axis),.01);
     float2 v=p-_A2RWaterFires[k].xz;float along=dot(v,axis),side=dot(v,float2(-axis.y,axis.x));
     float width=.24+abs(along)*.065;float streak=exp(-side*side/(width*width))*exp(-abs(along)*.42)*(1-smoothstep(4,8,abs(along)));
     float breakup=.55+.45*sin(a+b*.6)*sin(a+b*.6);
     c.rgb+=min(_A2RWaterFireColors[k].rgb,half3(5,2,.6))*streak*breakup*.04*wet*(1-scum);
    }
    c.rgb=MixFog(c.rgb,i.fog);return c;
   }
   half4 SwampDressing(V i)
   {
    InputData d=(InputData)0;d.positionWS=i.world;d.normalWS=NormalizeNormalPerPixel(i.normalWS);d.viewDirectionWS=GetWorldSpaceNormalizeViewDir(i.world);
    d.shadowCoord=TransformWorldToShadowCoord(i.world);d.bakedGI=SampleSH(d.normalWS);d.shadowMask=1;d.normalizedScreenSpaceUV=i.screen.xy/i.screen.w;
    SurfaceData s=(SurfaceData)0;s.albedo=i.colour.rgb;s.normalTS=half3(0,0,1);s.metallic=0;s.specular=.018;s.smoothness=.28;s.occlusion=1;s.alpha=i.colour.a;
    half4 c=UniversalFragmentPBR(d,s);c.rgb*=.18;c.rgb=MixFog(c.rgb,i.fog);return c;
   }

   half4 frag(V i):SV_Target
   {
    if(_SwampDressMode>.5)return SwampDressing(i);
    A2RWaterClip(i.world);if(_A2RSwampOn>.5)return SwampSurface(i);float2 p=i.world.xz;float t=_Time.y;float wave=A2RWave(p);float2 waveNormal=float2(A2RWave(p+float2(.025,0))-wave,A2RWave(p+float2(0,.025))-wave)/.025;
    // 저주파 두 흐름. 랜덤 점·디더링·고주파 노이즈 없음.
    float a=dot(p,float2(.74,.21))-t*.12,b=dot(p,float2(-.35,.57))+t*.08;
    float flow=sin(a+sin(b)*.4)*.5+.5;
     float3 n=normalize(float3(-cos(a)*.07-waveNormal.x,1,-cos(b)*.045-waveNormal.y));
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
     SurfaceData s=(SurfaceData)0;s.albedo=lerp(_BaseColor.rgb*(.35+.10*flow),_FoamColor.rgb*.32,foam);if(_A2RHellRot>.5){s.albedo*=half3(.66,.62,.50);float mud=(1-smoothstep(.06,1.1,max(0,distance)))*_ShoreReady;s.albedo=lerp(s.albedo,half3(.085,.050,.040),mud*.82);}half3 web=SAMPLE_TEXTURE2D(_A2RWebTex,sampler_A2RWebTex,i.world.xz*.16+float2(_Time.y*.001,0)).rgb;s.albedo=lerp(s.albedo,web*half3(.12,.105,.075),_A2RWebMix*.85);s.normalTS=float3(0,0,1);s.metallic=0;s.specular=.035;s.smoothness=lerp(.78,.22,foam);s.occlusion=1;s.alpha=1;s.emission=_BaseColor.rgb*min(_Emission,.015);
    half4 c=UniversalFragmentPBR(data,s);
    float4 reflected=mul(_PlanarVP,float4(i.world,1));float2 reflectionUV=reflected.xy/reflected.w*.5+.5;
    reflectionUV+=n.xz*.12;
    float valid=step(0,reflectionUV.x)*step(reflectionUV.x,1)*step(0,reflectionUV.y)*step(reflectionUV.y,1);
    half3 reflectedColor=SAMPLE_TEXTURE2D(_PlanarReflection,sampler_PlanarReflection,reflectionUV).rgb;
    half reflectedValue=dot(saturate(reflectedColor),half3(.2126,.7152,.0722));
     float fresnel=.12+.24*pow(1-saturate(dot(n,data.viewDirectionWS)),3);
    c.rgb=lerp(c.rgb,reflectedValue*half3(.15,.12,.065),_PlanarStrength*valid*fresnel*(1-foam));
    for(int k=0;k<min(8,_A2RWaterFireCount);k++){float2 axis=normalize(_WorldSpaceCameraPos.xz-_A2RWaterFires[k].xz);float2 v=p-_A2RWaterFires[k].xz;float along=dot(v,axis),side=dot(v,float2(-axis.y,axis.x));float width=.12+.05*abs(along);float streak=exp(-side*side/(width*width))*exp(-abs(along)*.35)*(1-smoothstep(5,8,abs(along)));float breakup=.4+.6*(sin(p.x*5+p.y*4-t*.3)*.5+.5);c.rgb+=_A2RWaterFireColors[k].rgb*streak*breakup*.09*(1-foam*.6);}
    c.rgb=MixFog(c.rgb,i.fog);return c;
   }
   ENDHLSL
  }
 }
}
