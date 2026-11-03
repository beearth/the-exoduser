Shader "EXODUSER/A2R/CardOpaque" {Properties{_Tint("Variation",Color)=(1,1,1,1) _MainTex("Web original",2D)="white"{} _NormalTex("Existing web normal",2D)="bump"{} _Emission("Existing self light",Float)=0} SubShader{Tags{"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest+10" "RenderType"="TransparentCutout"} Cull Off Pass {Tags{"LightMode"="UniversalForward"} ZWrite On
HLSLPROGRAM
#pragma target 3.5
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
#pragma target 3.5
#pragma vertex vert
#pragma fragment frag
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.12);return 0;}
ENDHLSL
} Pass {Name "DepthOnly" Tags{"LightMode"="DepthOnly"} ZWrite On ColorMask 0
HLSLPROGRAM
#pragma target 3.5
#pragma vertex vert
#pragma fragment frag
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.12);clip(.002-A2RFadeMask(i.w,i.p));A2RRejectRear(i.w);return 0;}
ENDHLSL
}
Pass {Name "A2RNearest" Tags{"LightMode"="A2RNearest"} ZWrite Off ZTest Always Cull Off Blend One One BlendOp Min
HLSLPROGRAM
#pragma target 3.5
#pragma vertex nearestVert
#pragma fragment nearestFrag
#include "CardCommon.hlsl"
V nearestVert(A a){V o=vert(a);o.p=mul(_A2RNearestVP,float4(o.w,1));return o;}
float4 nearestFrag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.12);return -mul(_A2RNearestView,float4(i.w,1)).z;}
ENDHLSL
} } }
