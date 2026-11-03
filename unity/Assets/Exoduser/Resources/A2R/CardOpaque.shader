Shader "EXODUSER/A2R/CardOpaque" {Properties{_MainTex("Web original",2D)="white"{} _NormalTex("Existing web normal",2D)="bump"{} _Emission("Existing self light",Float)=0} SubShader{Tags{"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest+10" "RenderType"="TransparentCutout"} Cull Off Pass {Tags{"LightMode"="UniversalForward"} ZWrite On
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
#pragma multi_compile_fragment _ _SHADOWS_SOFT
#pragma multi_compile _ _ADDITIONAL_LIGHTS
#pragma multi_compile _ _CLUSTER_LIGHT_LOOP
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{return shade(i,false);}
ENDHLSL
}Pass {Name "ShadowCaster" Tags{"LightMode"="ShadowCaster"} ZWrite On ZTest LEqual ColorMask 0
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.12);return 0;}
ENDHLSL
} Pass {Name "DepthOnly" Tags{"LightMode"="DepthOnly"} ZWrite On ColorMask 0
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.12);clip(.002-A2RFadeMask(i.w,i.p));return 0;}
ENDHLSL
} }}
