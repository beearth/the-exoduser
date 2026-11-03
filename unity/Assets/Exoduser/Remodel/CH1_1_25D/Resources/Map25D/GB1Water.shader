Shader "EXODUSER/Map25D/GB1Water" {
 Properties {_Mask("Curved shore",2D)="black"{} _Color("Water value",Color)=(.12,.17,.145,1)}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest" "RenderType"="TransparentCutout"} Cull Off
 HLSLINCLUDE
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_Mask);SAMPLER(sampler_Mask);
 CBUFFER_START(UnityPerMaterial)
 half4 _Color;
 CBUFFER_END
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;float3 w:TEXCOORD1;};
 V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=a.uv;return o;}
 void Shore(V i){clip(SAMPLE_TEXTURE2D(_Mask,sampler_Mask,i.uv).r-.5);}
 ENDHLSL
 Pass {Name "Forward" Tags {"LightMode"="UniversalForward"} ZWrite On
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 half4 frag(V i):SV_Target{Shore(i);Light l=GetMainLight(TransformWorldToShadowCoord(i.w));return half4(_Color.rgb*(half3(.08,.08,.08)+l.color*(.18+.65*saturate(l.direction.y))*l.shadowAttenuation),1);}
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment depth
 half4 depth(V i):SV_Target{Shore(i);return i.p.z;}
 ENDHLSL }
 }
}
