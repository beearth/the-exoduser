Shader "EXODUSER/Map25D/Painted"
{
 Properties {
 _MainTex("Painted color",2D)="white"{} _NormalTex("Luminance and edge normal",2D)="bump"{}
 _Color("Tint",Color)=(1,1,1,1) _Kind("0 card 1 floor 2 water 3 contact",Float)=0
 _Sway("Root anchored sway",Float)=0 _Cutoff("Alpha clip",Float)=.12
 _FloorTex("Global floor painting",2D)="black"{} _FloorNormal("Floor normal",2D)="bump"{}
 _PlanarReflection("Scene reflection",2D)="black"{} _PlanarStrength("Reflection",Float)=0
 _Frame("Peripheral frame",Float)=0 _Blur("Frame mip blur",Float)=0 _ZWrite("Depth write",Float)=1 _UVRect("UV crop",Vector)=(0,0,1,1)
  _GroundRect("World painting bounds",Vector)=(-10,24,60,36) _Emissive("Painted ember emission",Float)=0
  _Panel("Baked distant forest fill",Float)=0
  _DepthBias("Ground overlap depth units",Float)=0
 }
 SubShader {
 Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="TransparentCutout" "Queue"="AlphaTest"}
 Cull Off
 HLSLINCLUDE
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex); SAMPLER(sampler_MainTex); TEXTURE2D(_NormalTex); SAMPLER(sampler_NormalTex);
 TEXTURE2D(_FloorTex); SAMPLER(sampler_FloorTex); TEXTURE2D(_FloorNormal); SAMPLER(sampler_FloorNormal);
 TEXTURE2D(_PlanarReflection); SAMPLER(sampler_PlanarReflection);
 CBUFFER_START(UnityPerMaterial)
  float4 _Color; float _Kind,_Sway,_Cutoff,_PlanarStrength,_Frame,_Blur,_ZWrite,_Emissive,_Panel,_DepthBias;float4 _UVRect,_GroundRect; float4x4 _PlanarVP;
 CBUFFER_END
 float4 _Map25DHero;
 float4 _Map25DBubbles[8];
  float4 _Map25DCampReflection,_Map25DPortalReflection;
  float4 _Map25DMoonFill;
  float SoftNoise(float2 p){float2 b=floor(p),f=frac(p);f=f*f*(3-2*f);float4 h=frac(sin(float4(dot(b,float2(127.1,311.7)),dot(b+float2(1,0),float2(127.1,311.7)),dot(b+float2(0,1),float2(127.1,311.7)),dot(b+1,float2(127.1,311.7))))*43758.5453);return lerp(lerp(h.x,h.y,f.x),lerp(h.z,h.w,f.x),f.y);}
  half3 LightStreak(float3 w,float3 n,float4 source,half3 color){float2 axis=normalize(_WorldSpaceCameraPos.xz-source.xy),v=w.xz-source.xy;float along=dot(v,axis),side=dot(v,float2(-axis.y,axis.x));float width=.22+.04*abs(along);float streak=exp(-side*side/(width*width))*exp(-abs(along)*.24)*(1-smoothstep(6,12,abs(along)));float breakup=.20+.80*smoothstep(.38,.72,SoftNoise(w.xz*3.5+float2(0,_Time.y*.04)));return color*streak*breakup*source.z*.10;}
 struct A {float4 p:POSITION;float3 n:NORMAL;float4 tangent:TANGENT;float2 uv:TEXCOORD0;};
 struct V {float4 p:SV_POSITION;float2 uv:TEXCOORD0;float3 w:TEXCOORD1;float3 n:TEXCOORD2;float3 t:TEXCOORD3;float3 b:TEXCOORD4;};
 float3 Deform(float3 p,float2 uv){
  float root=uv.y*uv.y;
  float phase=dot(p.xz,float2(.71,.37));
  float wind=sin(_Time.y*.72+phase)+.28*sin(_Time.y*1.13+phase*1.7);
  p.xz+=float2(1,.28)*wind*_Sway*root;
  float2 away=p.xz-_Map25DHero.xz;float dist=length(away);
  p.xz+=away/max(dist,.05)*saturate(1-dist/1.2)*root*_Sway*5;
  return p;
 }
 V vert(A i){V o;o.w=Deform(TransformObjectToWorld(i.p.xyz),i.uv);o.p=TransformWorldToHClip(o.w);o.uv=i.uv;o.n=TransformObjectToWorldNormal(i.n);o.t=TransformObjectToWorldDir(i.tangent.xyz);o.b=cross(o.n,o.t)*i.tangent.w;return o;}
 ENDHLSL
 Pass {
  Tags {"LightMode"="UniversalForward"} ZWrite [_ZWrite] Blend SrcAlpha OneMinusSrcAlpha Offset 0, [_DepthBias]
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
 half4 frag(V i):SV_Target {
   if(_Kind>2.5&&_Kind<3.5){float2 p=i.uv*2-1;return half4(0,0,0,.40*pow(saturate(1-dot(p,p)),2));}
  float2 uv=i.uv;if(_Frame>.5)uv=_UVRect.xy+uv*_UVRect.zw;
  half4 albedo=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv);
  if(_Blur>.01)albedo=SAMPLE_TEXTURE2D_LOD(_MainTex,sampler_MainTex,uv,_Blur);
  half3 tn=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,uv).xyz*2-1;
  if(_Kind>.5&&_Kind<1.5){
   uv=float2((i.w.x-_GroundRect.x)/_GroundRect.z,1-(-i.w.z-_GroundRect.y)/_GroundRect.w);
   albedo=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv);
   tn=SAMPLE_TEXTURE2D(_NormalTex,sampler_NormalTex,uv).xyz*2-1;
   float fringe=smoothstep(0,.04,uv.x)*smoothstep(0,.04,1-uv.x)*smoothstep(0,.05,uv.y)*smoothstep(0,.05,1-uv.y);
   float2 outerUV=i.w.xz*float2(.075,-.075);half3 outer=SAMPLE_TEXTURE2D(_FloorTex,sampler_FloorTex,outerUV).rgb*.40;
   albedo.rgb=lerp(outer,albedo.rgb,fringe);tn=lerp(SAMPLE_TEXTURE2D(_FloorNormal,sampler_FloorNormal,outerUV).xyz*2-1,tn,fringe);albedo.a=1;
  }
   if(_Kind>3.5){float2 groundUV=float2((i.w.x-_GroundRect.x)/_GroundRect.z,1-(-i.w.z-_GroundRect.y)/_GroundRect.w);half3 groundColor=SAMPLE_TEXTURE2D(_FloorTex,sampler_FloorTex,groundUV).rgb;tn=lerp(half3(0,0,1),tn,albedo.a);albedo.rgb=lerp(groundColor,albedo.rgb*.65,albedo.a*.68);albedo.a=1;}
  clip(albedo.a-_Cutoff);albedo*=_Color;
   if(_Panel>.5)albedo.rgb*=albedo.a;
  float3 n=normalize(i.t*tn.x+i.b*tn.y+i.n*max(tn.z,.35));
  if(_Kind>1.5&&_Kind<2.5){
   float2 flow=i.w.xz*.65+float2(_Time.y*.018,_Time.y*.032);
   float noise=SoftNoise(flow),detail=SoftNoise(flow*2.3+4.6);
   n=normalize(float3((noise-.5)*.12,1,(detail-.5)*.10));
   float shallow=smoothstep(.42,1,abs(i.uv.x*2-1));
   albedo.rgb=lerp(half3(.006,.009,.004),half3(.085,.073,.028),shallow*.82);
   albedo.rgb*=.82+.28*noise;
   float bank=saturate(1-abs(i.uv.x*2-1));
   float foam=(1-smoothstep(.012,.11,bank))*smoothstep(.36,.72,SoftNoise(flow*1.6));
   albedo.rgb=lerp(albedo.rgb,half3(.14,.13,.072),foam*.38);
   float4 rp=mul(_PlanarVP,float4(i.w,1));float2 ruv=rp.xy/rp.w*.5+.5+n.xz*.018;
   half3 reflection=SAMPLE_TEXTURE2D(_PlanarReflection,sampler_PlanarReflection,ruv).rgb;
   albedo.rgb=lerp(albedo.rgb,reflection*half3(.65,.67,.48),_PlanarStrength*.32*bank);
   [unroll]for(int bubble=0;bubble<8;bubble++){
    float4 vent=_Map25DBubbles[bubble];float life=frac(_Time.y*.11+vent.z);float radius=vent.w*sin(life*3.14159265);
     float2 delta=i.w.xz-vent.xy;float angle=atan2(delta.y,delta.x);float d=length(delta);radius*=1+.08*sin(angle*3+_Time.y*.35)+.04*cos(angle*5-_Time.y*.2);float ring=(1-smoothstep(.018,.045,abs(d-radius)))*smoothstep(.05,.18,life)*(1-smoothstep(.72,1,life));
     albedo.rgb=lerp(albedo.rgb,half3(.18,.18,.085),ring*.22);
   }
  }
  Light key=GetMainLight(TransformWorldToShadowCoord(i.w));
  half cloud=.80+.20*smoothstep(-.5,.7,sin(i.w.x*.16+i.w.z*.12+_Time.y*.035)+.4*sin(i.w.z*.23-_Time.y*.026));
   half3 illumination=half3(.004,.007,.014)+half3(.11,.15,.17)*_Panel+key.color*(.08+.70*saturate(dot(n,key.direction)))*key.shadowAttenuation*cloud;
   if((_Kind>.5&&_Kind<1.5)||_Kind>3.5){float patch=.25+.75*smoothstep(-.55,.9,sin(i.w.x*.21+i.w.z*.13)+.45*cos(i.w.z*.29-i.w.x*.15));illumination+=_Map25DMoonFill.rgb*patch*cloud;}
  InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);
  uint count=GetAdditionalLightsCount();
  LIGHT_LOOP_BEGIN(count)
   Light l=GetAdditionalLight(lightIndex,i.w,half4(1,1,1,1));
   illumination+=l.color*l.distanceAttenuation*l.shadowAttenuation*(.15+.85*saturate(dot(n,l.direction)));
  LIGHT_LOOP_END
   half3 c=albedo.rgb*illumination;
   half hot=saturate((albedo.r-albedo.g*1.5-.015)*8);
   c+=albedo.rgb*hot*_Emissive;
    if(_Kind>1.5&&_Kind<2.5){float wave=SoftNoise(i.w.xz*.85+float2(_Time.y*.018,_Time.y*.032));c+=albedo.rgb*.24+half3(.003,.004,.002)*(.75+.25*wave);c+=LightStreak(i.w,n,_Map25DCampReflection,half3(1,.39,.10))+LightStreak(i.w,n,_Map25DPortalReflection,half3(.8,.055,.025));}
  // Smooth aerial perspective, deliberately free of grain and per-pixel random patterns.
   float dist=distance(_WorldSpaceCameraPos,i.w);float fog=saturate(1-exp(-max(0,dist-18)*.025));
   c=lerp(c,half3(.003,.008,.015),fog);
    if(_Frame>5.5){float2 screen=GetNormalizedScreenSpaceUV(i.p);float fade=smoothstep(0,.055,i.uv.x)*smoothstep(0,.055,1-i.uv.x)*smoothstep(0,.08,i.uv.y)*smoothstep(0,.05,1-i.uv.y)*smoothstep(.64,.94,1-screen.x);return half4(albedo.rgb*1.65+half3(.001,.002,.003),albedo.a*fade);}if(_Frame>4.5){float fade=smoothstep(0,.055,i.uv.x)*smoothstep(0,.055,1-i.uv.x)*smoothstep(0,.12,i.uv.y)*smoothstep(0,.05,1-i.uv.y);return half4(albedo.rgb*1.65+half3(.001,.003,.004),albedo.a*fade);}if(_Frame>.5){float2 screen=GetNormalizedScreenSpaceUV(i.p);float feather=smoothstep(0,.05,i.uv.x)*smoothstep(0,.05,1-i.uv.x)*smoothstep(0,.05,i.uv.y)*smoothstep(0,.05,1-i.uv.y);half3 frameColor=albedo.rgb*.28;if(_Frame>1.5){frameColor=(_Frame>3.5?half3(.003,.007,.009):half3(.001,.002,.003))+albedo.rgb*1.65;if(_Frame>2.5&&_Frame<3.5){float center=smoothstep(.25,.4,screen.x)*(1-smoothstep(.6,.75,screen.x));feather*=(1-smoothstep(.03,.22,screen.y))*(1-center*smoothstep(.08,.18,screen.y));}else feather*=smoothstep(.63,.91,screen.x);}return half4(frameColor,albedo.a*.92*feather);}
   return half4(c,_Kind<.5?albedo.a:1);
 }
 ENDHLSL
 }
 Pass {
 Name "ShadowCaster" Tags {"LightMode"="ShadowCaster"} ZWrite On ColorMask 0
 HLSLPROGRAM
 #pragma vertex shadowVert
 #pragma fragment shadowFrag
 #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"
 float3 _LightDirection;
 float3 _LightPosition;
 V shadowVert(A i){V o=vert(i);float3 n=TransformObjectToWorldNormal(i.n);float3 direction=_LightDirection;
 #if _CASTING_PUNCTUAL_LIGHT_SHADOW
 direction=normalize(_LightPosition-o.w);
 #endif
 o.p=TransformWorldToHClip(ApplyShadowBias(o.w,n,direction));
 #if UNITY_REVERSED_Z
 o.p.z=min(o.p.z,o.p.w*UNITY_NEAR_CLIP_VALUE);
 #else
 o.p.z=max(o.p.z,o.p.w*UNITY_NEAR_CLIP_VALUE);
 #endif
 return o;}
 half4 shadowFrag(V i):SV_Target {clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-_Cutoff);return 0;}
 ENDHLSL
 }
 Pass {
 Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask R
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment depthFrag
  half4 depthFrag(V i):SV_Target {if(_Kind<.5)clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-_Cutoff);return i.p.z;}
 ENDHLSL
 }
 Pass {
 Name "DepthNormalsOnly" Tags {"LightMode"="DepthNormalsOnly"} ZWrite On
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment normalsFrag
 #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT
 #include "Packages/com.unity.render-pipelines.core/ShaderLibrary/Packing.hlsl"
 half4 normalsFrag(V i):SV_Target {
  if(_Kind<.5)clip(SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv).a-_Cutoff);
  float3 n=normalize(i.n);
  #if defined(_GBUFFER_NORMALS_OCT)
  float2 oct=saturate(PackNormalOctQuadEncode(n)*.5+.5);return half4(PackFloat2To888(oct),0);
  #else
  return half4(n,0);
  #endif
 }
 ENDHLSL
 }
 }
}
