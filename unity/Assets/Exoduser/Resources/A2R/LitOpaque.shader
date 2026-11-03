Shader "EXODUSER/A2R/LitOpaque"{Properties{_BaseMap("Albedo",2D)="white"{} _BaseColor("Color",Color)=(1,1,1,1) _Cutoff("Clip",Range(0,1))=.5 _Smoothness("Smoothness",Range(0,1))=.3 _Metallic("Metallic",Range(0,1))=0 _MetallicGlossMap("Metal",2D)="white"{} _BumpMap("Normal",2D)="bump"{} _BumpScale("Normal scale",Float)=1 _ParallaxMap("Height",2D)="black"{} _Parallax("Height scale",Range(0,.1))=.005 _OcclusionMap("AO",2D)="white"{} _OcclusionStrength("AO strength",Range(0,1))=1 _EmissionMap("Emission",2D)="white"{} [HDR]_EmissionColor("Emission color",Color)=(0,0,0,0) _DetailMask("Detail mask",2D)="white"{} _DetailAlbedoMap("Detail",2D)="linearGrey"{} _DetailNormalMap("Detail normal",2D)="bump"{} _DetailAlbedoMapScale("Detail scale",Float)=1 _DetailNormalMapScale("Detail normal scale",Float)=1 _SpecColor("Specular",Color)=(.2,.2,.2,1)}SubShader{Tags{"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest+10" "RenderType"="Opaque"}Cull Off Pass{Tags{"LightMode"="UniversalForward"}ZWrite On
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
#pragma multi_compile_fragment _ _SHADOWS_SOFT
#pragma multi_compile _ _ADDITIONAL_LIGHTS
#pragma multi_compile _ _CLUSTER_LIGHT_LOOP
#pragma multi_compile _ _NORMALMAP
#pragma multi_compile _ _METALLICSPECGLOSSMAP
#pragma multi_compile _ _ALPHATEST_ON
#pragma multi_compile _ _EMISSION
#include "LitCommon.hlsl"
half4 frag(V i):SV_Target{return shade(i,false);}
ENDHLSL
}UsePass "Universal Render Pipeline/Lit/ShadowCaster"
Pass{Name "DepthOnly" Tags{"LightMode"="DepthOnly"}ZWrite On ColorMask 0
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "LitCommon.hlsl"
half4 frag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).a*_BaseColor.a-.05);clip(.002-A2RFadeMask(i.w,i.p));return 0;}
ENDHLSL
} }}
