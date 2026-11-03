Shader "EXODUSER/Map25D/R5Ground" {
 Properties {_Soil("Web soil",2D)="white"{} _Litter("Web litter",2D)="white"{} _Mud("Web mud",2D)="white"{} _Normal("Paint normal",2D)="bump"{} _Control("Terrain layer weights",2D)="red"{} _Holes("Terrain surface",2D)="white"{} _LayerScale("Original Terrain Layer scales",Vector)=(7.5,5.5,11,0) _Tint("Painting tint",Color)=(.8,.8,.72,1)}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"} Cull Back
 HLSLINCLUDE
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_Soil);SAMPLER(sampler_Soil);TEXTURE2D(_Litter);SAMPLER(sampler_Litter);TEXTURE2D(_Mud);SAMPLER(sampler_Mud);TEXTURE2D(_Normal);SAMPLER(sampler_Normal);TEXTURE2D(_Control);SAMPLER(sampler_Control);TEXTURE2D(_Holes);SAMPLER(sampler_Holes);
 CBUFFER_START(UnityPerMaterial)
 float4 _LayerScale,_Tint;
 CBUFFER_END
 float _R4Density;
 float macroHash(float2 p){return frac(sin(dot(p,float2(127.1,311.7)))*43758.5453);}
 float macroNoise(float2 p){float2 q=floor(p),f=frac(p);f=f*f*(3-2*f);return lerp(lerp(macroHash(q),macroHash(q+float2(1,0)),f.x),lerp(macroHash(q+float2(0,1)),macroHash(q+1),f.x),f.y); }
 struct A{float4 p:POSITION;float3 n:NORMAL;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;float3 n:TEXCOORD1;float2 uv:TEXCOORD2;};
 V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.n=TransformObjectToWorldNormal(a.n);o.uv=a.uv;return o;}
 void SurfaceClip(V i){clip(SAMPLE_TEXTURE2D(_Holes,sampler_Holes,i.uv).r-.5);}
 ENDHLSL
 Pass {Name "Forward" Tags {"LightMode"="UniversalForward"} ZWrite On
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
 #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
 #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
 #pragma multi_compile_fragment _ _LIGHT_COOKIES
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 half4 frag(V i):SV_Target{SurfaceClip(i);if(_R4Density>.5)return half4(1,1,1,1);
 half3 weight=SAMPLE_TEXTURE2D(_Control,sampler_Control,i.uv).rgb;weight/=max(.001,dot(weight,half3(1,1,1)));
 float2 warp=float2(macroNoise(i.w.xz*.11),macroNoise(i.w.zx*.09+17))-.5;float2 soilUV=i.w.xz/_LayerScale.x+warp*.44;float2 leafUV=float2(i.w.x*.71-i.w.z*.70,i.w.x*.70+i.w.z*.71)/_LayerScale.y+warp*.28+float2(.249,.165),mudUV=i.w.xz/_LayerScale.z+warp*.36+float2(.125,.33);
  half3 soil=SAMPLE_TEXTURE2D(_Soil,sampler_Soil,soilUV).rgb;half3 broadSoil=SAMPLE_TEXTURE2D(_Soil,sampler_Soil,float2(-i.w.z,i.w.x)/19+warp*.2).rgb;soil=lerp(soil,broadSoil,smoothstep(.22,.80,macroNoise(i.w.xz*.13+9))*.58);half4 roots=SAMPLE_TEXTURE2D(_Mud,sampler_Mud,mudUV);half3 rootSoil=lerp(soil,roots.rgb,roots.a);
  half3 albedo=(soil*weight.r+SAMPLE_TEXTURE2D(_Litter,sampler_Litter,leafUV).rgb*weight.g+rootSoil*weight.b)*_Tint.rgb;
  albedo*=lerp(half3(.76,.82,.77),half3(1.17,1.08,.89),macroNoise(i.w.xz*.075+31));
  float shore=SAMPLE_TEXTURE2D(_Holes,sampler_Holes,i.uv).r;albedo*=lerp(.65,1,smoothstep(.5,1,shore));
 half3 normalPaint=SAMPLE_TEXTURE2D(_Normal,sampler_Normal,i.w.xz/7.5).xyz*2-1;float3 n=normalize(i.n+float3(normalPaint.x,0,normalPaint.y)*.20);
 Light key=GetMainLight(TransformWorldToShadowCoord(i.w));float cloud=.94+.06*sin(i.w.x*.15+i.w.z*.12+_Time.y*.035);
 half3 illumination=half3(.025,.055,.070)*.3+key.color*(.025+.90*saturate(dot(n,key.direction)))*key.shadowAttenuation*cloud;
 float3 view=GetWorldSpaceNormalizeViewDir(i.w);half3 glint=key.color*key.shadowAttenuation*pow(saturate(dot(n,normalize(key.direction+view))),48)*.007;
 InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);uint count=GetAdditionalLightsCount();
 LIGHT_LOOP_BEGIN(count)
 Light l=GetAdditionalLight(lightIndex,i.w,half4(1,1,1,1));illumination+=l.color*l.distanceAttenuation*l.shadowAttenuation*(.10+.75*saturate(dot(n,l.direction)));glint+=l.color*l.distanceAttenuation*l.shadowAttenuation*pow(saturate(dot(n,normalize(l.direction+view))),48)*weight.b*.012;
 LIGHT_LOOP_END
 return half4(albedo*illumination+glint,1);}
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment depth
 half4 depth(V i):SV_Target{SurfaceClip(i);return i.p.z;}
 ENDHLSL }
 }
}
