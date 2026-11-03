Shader "EXODUSER/Map25D/R5Water" {
 Properties {_MainTex("Web poison painting",2D)="white"{} _NormalTex("Web surface normal",2D)="bump"{} _PlanarReflection("Actual scene reflection",2D)="black"{} _PlanarStrength("Reflection ready",Float)=0}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry+10"} Cull Off
 HLSLINCLUDE
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);TEXTURE2D(_NormalTex);SAMPLER(sampler_NormalTex);TEXTURE2D(_PlanarReflection);SAMPLER(sampler_PlanarReflection);
 float4x4 _PlanarVP;float _PlanarStrength,_R4Density;
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;float2 uv:TEXCOORD1;};
 V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=a.uv;return o;}
 ENDHLSL
 Pass {Name "Forward" Tags {"LightMode"="UniversalForward"} ZWrite On
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 half4 frag(V i):SV_Target{
 if(_R4Density>.5)return half4(0,0,0,1);
 float2 drift=float2(_Time.y*.003,-_Time.y*.006);float2 uv=i.w.xz*.17+drift;
 half3 art=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv).rgb;
 float2 ripple=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,uv*1.4).xy*2-1;ripple+=float2(sin(i.w.z*2.3+_Time.y*.27),cos(i.w.x*1.8-_Time.y*.19))*.14;
 float3 n=normalize(float3(ripple.x*.18,1,ripple.y*.18));Light moon=GetMainLight(TransformWorldToShadowCoord(i.w));
 float shallow=smoothstep(.08,.82,length((i.uv-.5)*2));float artValue=dot(art,half3(.30,.50,.20));half3 color=lerp(half3(.014,.015,.009),half3(.087,.075,.035)*(.55+artValue),shallow*.58+.12);
 color*=half3(.10,.18,.18)+moon.color*(.12+.64*saturate(dot(n,moon.direction)))*moon.shadowAttenuation;
 float4 projection=mul(_PlanarVP,float4(i.w,1));float2 reflectedUV=projection.xy/max(.0001,projection.w)*.5+.5+ripple*.005;
 half3 reflected=SAMPLE_TEXTURE2D(_PlanarReflection,sampler_PlanarReflection,saturate(reflectedUV)).rgb;
 float fresnel=.06+.14*pow(1-saturate(dot(n,GetWorldSpaceNormalizeViewDir(i.w))),3);color=lerp(color,reflected,_PlanarStrength*fresnel);
 float glint=pow(saturate(dot(n,normalize(moon.direction+GetWorldSpaceNormalizeViewDir(i.w)))),72);color+=moon.color*glint*.035;
 color+=half3(.004,.004,.0015);return half4(color,1);}
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment depth
 half4 depth(V i):SV_Target{return i.p.z;}
 ENDHLSL }
 }
}
