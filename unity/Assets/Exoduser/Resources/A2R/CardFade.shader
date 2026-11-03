Shader "EXODUSER/A2R/CardFade" {Properties{_A2RWind("Root pinned wind",Vector)=(1,0,0,0) _Tint("Variation",Color)=(1,1,1,1) _MainTex("Web original",2D)="white"{} _NormalTex("Existing web normal",2D)="bump"{} _Emission("Existing self light",Float)=0} SubShader{Tags{"RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent"} Cull Off Pass {Tags{"LightMode"="UniversalForward"} ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
HLSLPROGRAM
#pragma target 3.5
#pragma vertex vert
#pragma fragment frag
#pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
#pragma multi_compile_fragment _ _SHADOWS_SOFT
#pragma multi_compile _ _ADDITIONAL_LIGHTS
#pragma multi_compile _ _CLUSTER_LIGHT_LOOP
#include "CardCommon.hlsl"
half4 frag(V i):SV_Target{return shade(i,true);}
ENDHLSL
} }}
