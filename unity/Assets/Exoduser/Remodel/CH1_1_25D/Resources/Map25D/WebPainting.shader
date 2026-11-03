Shader "EXODUSER/Map25D/WebPainting" {
 Properties {_SoilArt("Original web earth",2D)="black"{} _LitterArt("Original web litter",2D)="black"{} _ProjectionMode("0 ordinary 1 raised 2 flat copy",Float)=0 _MainTex("Approved web painting",2D)="white"{} _NormalTex("Smooth normal",2D)="bump"{} _WaterMask("Original liquid only",2D)="black"{} _WaterArt("Web wet surface",2D)="black"{} _WaterNormal("Wet surface normal",2D)="bump"{} _WaterSurface("Separate liquid painting",Float)=0 _SourcePlane("Web light anchor",Float)=0 _SourceRect("Web original rectangle",Vector)=(0,0,1,1) _SwayAnchor("Original plant root",Vector)=(0,0,0,0) _ZWrite("Stage card depth",Float)=1 _DepthBias("Bank overlap depth",Float)=0 _Sway("Root-fixed sway",Float)=0 _Ground("Terrain",Float)=1 _Emission("Original hot areas",Float)=0 _Base("Ambient painting",Float)=.22}
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest" "RenderType"="TransparentCutout"} Cull Off
 HLSLINCLUDE
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);TEXTURE2D(_NormalTex);SAMPLER(sampler_NormalTex);TEXTURE2D(_WaterMask);SAMPLER(sampler_WaterMask);
  TEXTURE2D(_SoilArt);SAMPLER(sampler_SoilArt);TEXTURE2D(_LitterArt);SAMPLER(sampler_LitterArt);TEXTURE2D(_WaterArt);SAMPLER(sampler_WaterArt);TEXTURE2D(_WaterNormal);SAMPLER(sampler_WaterNormal);
 CBUFFER_START(UnityPerMaterial)
  float _Sway,_Ground,_Emission,_Base,_WaterSurface,_SourcePlane,_ProjectionMode;float4 _SourceRect,_SwayAnchor;
 CBUFFER_END
  float4 _Map25DHero,_Map25DViewForward;
  TEXTURE2D(_Map25DWalkMask);SAMPLER(sampler_Map25DWalkMask);
  float3 GroundRay(float3 card){if(_Map25DViewForward.w>.5)return card-_Map25DViewForward.xyz*((card.y-.018)/min(-.0001,_Map25DViewForward.y));float3 dir=card-_WorldSpaceCameraPos;return _WorldSpaceCameraPos+dir*((.018-_WorldSpaceCameraPos.y)/min(-.0001,dir.y));}
  float WalkAtCard(float3 card){if(_Map25DViewForward.w<.5&&card.y>=_WorldSpaceCameraPos.y-.001)return 0;float3 ground=GroundRay(card);float2 uv=float2(ground.x/80,-ground.z/80);if(any(uv<0)||any(uv>1))return 0;return SAMPLE_TEXTURE2D(_Map25DWalkMask,sampler_Map25DWalkMask,uv).r;}
  float4 _Map25DWaterPath[8],_Map25DCampReflection,_Map25DPortalReflection;
  half3 ReflectedLight(float3 world,float4 source,half3 tint){float best=10000;float2 origin=source.xy,axis=float2(0,1);[unroll]for(int k=0;k<7;k++){float2 delta=_Map25DWaterPath[k+1].xy-_Map25DWaterPath[k].xy;float t=saturate(dot(source.xy-_Map25DWaterPath[k].xy,delta)/max(.001,dot(delta,delta)));float2 spot=_Map25DWaterPath[k].xy+delta*t;float d=dot(source.xy-spot,source.xy-spot);if(d<best){best=d;origin=spot;axis=normalize(delta+float2(.0001,0));}}float2 v=world.xz-origin;float along=dot(v,axis),side=dot(v,float2(-axis.y,axis.x));float width=.13+.035*abs(along),falloff=exp(-side*side/(width*width))*exp(-abs(along)*.36);float wave=.35+.65*pow(.5+.5*sin(world.x*7+world.z*4+_Time.y*.17),2);return tint*source.z*.015*falloff*wave;}
 struct A{float4 p:POSITION;float3 n:NORMAL;float4 t:TANGENT;float2 uv:TEXCOORD0;};
 struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;float2 uv:TEXCOORD1;float3 n:TEXCOORD2;float3 t:TEXCOORD3;float3 b:TEXCOORD4;float3 card:TEXCOORD5;};
  V vert(A i){V o;o.w=TransformObjectToWorld(i.p.xyz);float root=i.uv.y*i.uv.y;float wind=sin(_Time.y*.63+o.w.x*.36+o.w.z*.19)+.25*sin(_Time.y*1.07+o.w.z*.28);o.w.xz+=float2(1,.28)*_Sway*wind*root;float2 anchor=_SwayAnchor.w>.5?_SwayAnchor.xz:o.w.xz;float2 away=anchor-_Map25DHero.xz;float d=length(away),press=saturate(1-d/1.2);o.w.xz+=away/max(.05,d)*press*root*_Sway*3;o.w.y-=press*root*_Sway*1.2;o.card=o.w;o.p=TransformWorldToHClip(o.w);if(_ProjectionMode>1.5){float4 flat=TransformWorldToHClip(GroundRay(o.card));o.p.z=flat.z/max(.0001,flat.w)*o.p.w;}o.uv=i.uv;o.n=TransformObjectToWorldNormal(i.n);o.t=TransformObjectToWorldDir(i.t.xyz);o.b=cross(o.n,o.t)*i.t.w;return o;}
 ENDHLSL
  Pass {Tags {"LightMode"="UniversalForward"} ZWrite [_ZWrite] Blend SrcAlpha OneMinusSrcAlpha Offset 0, [_DepthBias]
 HLSLPROGRAM
 #pragma target 3.5
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
 #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
 #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
 #pragma multi_compile_fragment _ _SHADOWS_SOFT
 #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 half4 frag(V i):SV_Target{
  float water=SAMPLE_TEXTURE2D(_WaterMask,sampler_WaterMask,i.uv).r*_Ground;if(_WaterSurface>.5){float2 walkuv=float2(i.w.x/80,-i.w.z/80);clip(.5-SAMPLE_TEXTURE2D(_Map25DWalkMask,sampler_Map25DWalkMask,walkuv).r);}
  float2 drift=float2(sin(i.w.z*2.1+_Time.y*.32),cos(i.w.x*1.7-_Time.y*.21))*.0018*water;
  half4 a=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+drift);if(_ProjectionMode>.5){float walk=WalkAtCard(i.card);a.a*=_ProjectionMode>1.5?walk:1-walk;}clip(a.a-.025);a.rgb*=lerp(half3(1,1,1),half3(1.16,.62,.30),water);
  float2 wetUV=i.w.xz*.25+float2(_Time.y*.002,-_Time.y*.003);if(_WaterSurface>.5){half3 wet=SAMPLE_TEXTURE2D(_WaterArt,sampler_WaterArt,wetUV).rgb;float shallow=smoothstep(.08,.92,abs(i.uv.x*2-1));wet*=lerp(.30,.72,shallow);a.rgb=lerp(a.rgb,wet,water);}
  if(_Ground>.5&&_WaterSurface<.5){float2 p=float2(i.w.x,-i.w.z);float trailX=18.8+2.0*sin((p.y-40)*.27)+.6*sin(p.y*.43);float trail=1-smoothstep(1.2,4.3,abs(p.x-trailX));float field=.5+.24*sin(p.x*.44+p.y*.27)+.16*cos(p.x*.71-p.y*.39);half3 soil=SAMPLE_TEXTURE2D(_SoilArt,sampler_SoilArt,p*.125+float2(.06*sin(p.y*.2),0)).rgb;half3 litter=SAMPLE_TEXTURE2D(_LitterArt,sampler_LitterArt,float2(p.x*.087+p.y*.05,-p.x*.05+p.y*.087)).rgb*half3(.60,.61,.49);a.rgb=lerp(a.rgb,soil,trail*.72);a.rgb=lerp(a.rgb,litter,smoothstep(.38,.72,field)*(1-trail*.8)*.38);}
   half3 tn=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,i.uv).xyz*2-1;
  float3 n=normalize(i.t*tn.x+i.b*tn.y+i.n*max(.7,tn.z));
  float3 lightPosition=i.w;if(_SourcePlane>.5){lightPosition=float3(_SourceRect.x+(i.uv.x-.5)*_SourceRect.z,.018,_SourceRect.y+i.uv.y*_SourceRect.w);n=normalize(float3(tn.x*.35,max(.7,tn.z),-tn.y*.35));}if(_ProjectionMode>.5)lightPosition=GroundRay(i.card);if(_WaterSurface>.5){half3 wetNormal=SAMPLE_TEXTURE2D(_WaterNormal,sampler_WaterNormal,wetUV).xyz*2-1;n=normalize(lerp(n,float3(wetNormal.x*.3,1,wetNormal.y*.3),water));}
  if(water>.01)n=normalize(n+float3(sin(i.w.z*2.5+_Time.y*.32)*.035,0,cos(i.w.x*2-_Time.y*.24)*.035)*water);
  Light key=GetMainLight(TransformWorldToShadowCoord(lightPosition));
  float cloud=.94+.06*sin(i.w.x*.15+i.w.z*.12+_Time.y*.035);
  half3 illumination=half3(.88,.95,1.10)*_Base*cloud*(.64+.36*key.shadowAttenuation);
  illumination+=key.color*saturate(dot(n,key.direction))*key.shadowAttenuation*.25;
  half3 glint=0;InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);
  uint count=GetAdditionalLightsCount();
  LIGHT_LOOP_BEGIN(count)
   Light l=GetAdditionalLight(lightIndex,lightPosition,half4(1,1,1,1));
   illumination+=l.color*l.distanceAttenuation*l.shadowAttenuation*(.10+.75*saturate(dot(n,l.direction)));
   float3 v=GetWorldSpaceNormalizeViewDir(i.w);float spec=pow(saturate(dot(n,normalize(l.direction+v))),48);
   glint+=l.color*l.distanceAttenuation*l.shadowAttenuation*spec*.09*water;
  LIGHT_LOOP_END
  half3 hot=saturate((a.rgb-half3(.08,.025,.01))*half3(1.7,.4,.12))*_Emission;
   half3 color=a.rgb*illumination+glint+hot*a.rgb;if(_WaterSurface>.5)color+=water*(ReflectedLight(i.w,_Map25DCampReflection,half3(1,.35,.08))+ReflectedLight(i.w,_Map25DPortalReflection,half3(.8,.04,.025)));
  if(_WaterSurface>.5)a.a*=smoothstep(0,.075,i.uv.x)*smoothstep(0,.075,1-i.uv.x);return half4(color,a.a);
 }
 ENDHLSL }
 Pass {Name "ShadowCaster" Tags {"LightMode"="ShadowCaster"} ZWrite On ColorMask 0
 HLSLPROGRAM
 #pragma vertex shadowVert
 #pragma fragment shadowFrag
 #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"
 float3 _LightDirection;float3 _LightPosition;
 V shadowVert(A i){V o=vert(i);float3 dir=_LightDirection;
 #if _CASTING_PUNCTUAL_LIGHT_SHADOW
 dir=normalize(_LightPosition-o.w);
 #endif
 o.p=TransformWorldToHClip(ApplyShadowBias(o.w,o.n,dir));
 #if UNITY_REVERSED_Z
 o.p.z=min(o.p.z,o.p.w*UNITY_NEAR_CLIP_VALUE);
 #else
 o.p.z=max(o.p.z,o.p.w*UNITY_NEAR_CLIP_VALUE);
 #endif
 return o;}
 half4 shadowFrag(V i):SV_Target{clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-.2);return 0;}
 ENDHLSL }
 Pass {Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment depth
 half4 depth(V i):SV_Target{float alpha=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a;if(_WaterSurface>.5){float2 uv=float2(i.w.x/80,-i.w.z/80);clip(.5-SAMPLE_TEXTURE2D(_Map25DWalkMask,sampler_Map25DWalkMask,uv).r);alpha*=smoothstep(0,.075,i.uv.x)*smoothstep(0,.075,1-i.uv.x);}if(_ProjectionMode>.5){float walk=WalkAtCard(i.card);alpha*=_ProjectionMode>1.5?walk:1-walk;}clip(alpha-.025);return i.p.z;}
 ENDHLSL }
 }
}
