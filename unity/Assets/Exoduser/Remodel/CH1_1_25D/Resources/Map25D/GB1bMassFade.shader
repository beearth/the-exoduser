Shader "EXODUSER/Map25D/GB1bMassFade" {
 Properties {_Color("Wall value",Color)=(.055,.055,.058,1)}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent"}
 Pass {Name "Continuous alpha and background blur" Tags {"LightMode"="UniversalForward"} Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Back
 HLSLPROGRAM
 #pragma vertex MassVert
 #pragma fragment MassFaded
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #include "GB1bMassCommon.hlsl"
 ENDHLSL }
 }
}
