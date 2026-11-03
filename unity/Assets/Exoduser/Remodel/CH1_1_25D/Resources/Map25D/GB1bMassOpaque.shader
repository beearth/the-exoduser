Shader "EXODUSER/Map25D/GB1bMassOpaque" {
 Properties {_Color("Wall value",Color)=(.055,.055,.058,1)}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry+5"}
 Pass {Name "Forward" Tags {"LightMode"="UniversalForward"} ZWrite On Cull Back
 HLSLPROGRAM
 #pragma vertex MassVert
 #pragma fragment MassOpaque
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #include "GB1bMassCommon.hlsl"
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex MassVert
 #pragma fragment MassDepth
 #include "GB1bMassCommon.hlsl"
 ENDHLSL }
 Pass {Name "ShadowCaster" Tags {"LightMode"="ShadowCaster"} ZWrite On ZTest LEqual ColorMask 0
 HLSLPROGRAM
 #pragma vertex MassShadowVert
 #pragma fragment MassShadowFragment
 #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW
 #include "GB1bMassCommon.hlsl"
 ENDHLSL }
 }
}
