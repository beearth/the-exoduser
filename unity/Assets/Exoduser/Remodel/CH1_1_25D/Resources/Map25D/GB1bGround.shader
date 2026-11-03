Shader "EXODUSER/Map25D/GB1bGround" {
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque"} 
 Pass {Name "Forward" Tags {"LightMode"="UniversalForward"}
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #pragma multi_compile _ _ADDITIONAL_LIGHTS
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 struct A{float4 p:POSITION;float3 n:NORMAL;half4 c:COLOR;};
 struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;half3 n:TEXCOORD1;half3 c:COLOR;};
 V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.n=TransformObjectToWorldNormal(a.n);o.c=a.c.rgb;return o;}
 half4 frag(V i):SV_Target {half3 n=normalize(i.n);Light l=GetMainLight(TransformWorldToShadowCoord(i.w));half3 light=half3(.08,.08,.08)+l.color*saturate(dot(n,l.direction))*l.shadowAttenuation;uint count=GetAdditionalLightsCount();for(uint k=0;k<count;k++){Light a=GetAdditionalLight(k,i.w);light+=a.color*saturate(dot(n,a.direction))*a.distanceAttenuation*a.shadowAttenuation;}return half4(i.c*light,1);}
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ColorMask 0
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 float4 vert(float4 p:POSITION):SV_POSITION{return TransformObjectToHClip(p.xyz);}
 half4 frag():SV_Target{return 0;}
 ENDHLSL }
 }
}
