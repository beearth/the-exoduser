// A2R GroundPainting response, arena-only continuous receiver (source 3967a7562).
Shader "EXODUSER/Arena8b/Ground"
{
 Properties
 {
  _PaintA("A2R ground 2,4",2D)="white"{} _PaintB("A2R ground 3,4",2D)="white"{}
  _NormalA("A2R normal A",2D)="bump"{} _NormalB("A2R normal B",2D)="bump"{}
  _MaskA("A2R water mask A",2D)="black"{} _MaskB("A2R water mask B",2D)="black"{}
  _Soil("A2 forest soil underpaint",2D)="white"{} _Roots("A2 exposed roots",2D)="white"{}
  _Tint("B1 ground tint (linear)",Color)=(.66,.56,.50,1) _Sat("B1 saturation keep",Range(0,1))=.62 _Flat("B2 low-frequency flatten",Range(0,1))=.45 _Dark("B3 sun scale on ground",Range(0,1))=1
  // Defaults reproduce the existing response. Candidates are Editor look-shot overrides only.
  _GroundAmbient("Ground-only fill (linear, no color conversion)",Vector)=(.08,.075,.065,1)
  _GroundShadowFloor("Ground-only shadow attenuation floor",Range(0,1))=0
  [HideInInspector] _LookDiagnostic("Editor: 1 shadow/Lambert, 2 receiver mask",Float)=0
 }
 SubShader
 {
  Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
  Pass
  {
   Name "ArenaGround" Tags {"LightMode"="UniversalForward"} Cull Back ZWrite On
   HLSLPROGRAM
   #pragma target 3.5
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
   #pragma multi_compile _ _ADDITIONAL_LIGHTS
   #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
   #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
   #pragma multi_compile_fog
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   TEXTURE2D(_PaintA);SAMPLER(sampler_PaintA);TEXTURE2D(_PaintB);SAMPLER(sampler_PaintB);
   TEXTURE2D(_NormalA);SAMPLER(sampler_NormalA);TEXTURE2D(_NormalB);SAMPLER(sampler_NormalB);
   TEXTURE2D(_MaskA);SAMPLER(sampler_MaskA);TEXTURE2D(_MaskB);SAMPLER(sampler_MaskB);
   TEXTURE2D(_Soil);SAMPLER(sampler_Soil);TEXTURE2D(_Roots);SAMPLER(sampler_Roots);
   CBUFFER_START(UnityPerMaterial)
   half4 _Tint,_GroundAmbient;half _Sat,_Flat,_Dark,_GroundShadowFloor,_LookDiagnostic;
   CBUFFER_END
   struct A {float4 p:POSITION;float3 n:NORMAL;};
   struct V {float4 p:SV_POSITION;float3 w:TEXCOORD0;half3 n:TEXCOORD1;half fog:TEXCOORD2;};
   V vert(A a){V o;o.w=TransformObjectToWorld(a.p.xyz);o.p=TransformWorldToHClip(o.w);o.n=TransformObjectToWorldNormal(a.n);o.fog=ComputeFogFactor(o.p.z);return o;}
   float2 TurnUv(int t,float2 u,float d){if(t==1)return float2(u.y,d-u.x);if(t==2)return d-u;if(t==3)return float2(d-u.y,u.x);return u;}
   float2 TurnDetail(int t,float2 v){if(t==1)return float2(-v.y,v.x);if(t==2)return -v;if(t==3)return float2(v.y,-v.x);return v;}
   // One painted-tile layer. p = tile-space position (1 unit = 1 tile). m = layer weight (0 at the tile seam).
   void GroundLayer(float2 p,float blend,int variant,out half3 paint,out float alpha,out float2 detail,out float water,out float m)
   {
    float2 cell=floor(p),uv=frac(p),dx=ddx(p),dy=ddy(p);
    int t=(int)abs(variant==0?cell.x+cell.y*3:cell.x*2+cell.y*5)%4;
    float2 e=min(uv,1-uv);m=smoothstep(.02,.22,min(e.x,e.y));
    uv=TurnUv(t,uv,1);dx=TurnUv(t,dx,0);dy=TurnUv(t,dy,0);
    half4 pa=SAMPLE_TEXTURE2D_GRAD(_PaintA,sampler_PaintA,uv,dx,dy),pb=SAMPLE_TEXTURE2D_GRAD(_PaintB,sampler_PaintB,uv,dx,dy);
    half4 painted=lerp(pa,pb,blend);paint=painted.rgb;alpha=painted.a;
    half3 na=SAMPLE_TEXTURE2D_GRAD(_NormalA,sampler_NormalA,uv,dx,dy).rgb,nb=SAMPLE_TEXTURE2D_GRAD(_NormalB,sampler_NormalB,uv,dx,dy).rgb;
    float2 nd=TurnDetail(t,(lerp(na,nb,blend)*2-1).xy);
    if(variant==1){float c=cos(.52),s=sin(.52);nd=float2(c*nd.x+s*nd.y,-s*nd.x+c*nd.y);}
    detail=nd;
    water=lerp(SAMPLE_TEXTURE2D_GRAD(_MaskA,sampler_MaskA,uv,dx,dy).r,SAMPLE_TEXTURE2D_GRAD(_MaskB,sampler_MaskB,uv,dx,dy).r,blend);
   }
   half4 frag(V i):SV_Target
   {
    float2 world=float2(i.w.x,-i.w.z);
    float blend=smoothstep(-.65,.65,sin(i.w.x*.137)+cos(i.w.z*.171));
    // Two painted-tile layers (10u grid, and a 13u grid rotated 0.52 rad + offset). Each layer's weight is 0 at its own tile
    // seam, and the other layer is full there, so no straight seam survives. Low-frequency sine noise (periods >= 45u)
    // picks the mix and the paint coverage. No pixel grain/dither is introduced.
    float cr=cos(.52),sr=sin(.52);
    float2 p1=world/10,p2=float2(cr*world.x-sr*world.y,sr*world.x+cr*world.y)/13+float2(3.7,8.1);
    half3 paint1,paint2;float a1,a2,wa1,wa2,m1,m2;float2 d1,d2;
    GroundLayer(p1,blend,0,paint1,a1,d1,wa1,m1);
    GroundLayer(p2,blend,1,paint2,a2,d2,wa2,m2);
    float2 q=world;
    float nMix=.5+.5*(sin(dot(q,float2(.0611,.0323))+1.3)+sin(dot(q,float2(-.0467,.0829))+.4)+sin(dot(q,float2(.0974,-.0531))+2.1))/3;
    float nCov=.5+.5*(sin(dot(q,float2(.0713,-.0419))+.9)+sin(dot(q,float2(.0389,.1093))+3.0)+sin(dot(q,float2(-.1013,-.0617))+1.7))/3;
    float mix2=.2+.6*smoothstep(.25,.75,nMix);
    m1*=1-mix2;m2*=mix2;
    float msum=m1+m2,inv=1/max(msum,1e-4);
    // Weights are already normalized (inv), so soil may only show where both seams cross (msum ~ 0); a wider ramp exposed the
    // lighter soil along the dominant layer's seams as repeating crosses (11-04 TmpGroundShot after 15f6bc96b).
    // Where both seams cross (msum ~ 0) blend the two layers evenly instead of showing soil.
    if(msum<.02){float k=(.02-msum)/.02*.01;m1+=k;m2+=k;msum=m1+m2;inv=1/msum;}
    float presence=1;
    half3 paint=(paint1*m1+paint2*m2)*inv;
    float alpha=(a1*m1+a2*m2)*inv;
    float water=(wa1*m1+wa2*m2)*inv;
    float2 detail=(d1*m1+d2*m2)*inv;
    float cov=lerp(.78,1,smoothstep(.2,.8,nCov));
    float coverage=presence*cov*(1-smoothstep(.1,.9,water))*alpha;
    half3 soil=SAMPLE_TEXTURE2D(_Soil,sampler_Soil,world*.20).rgb;
    half3 roots=SAMPLE_TEXTURE2D(_Roots,sampler_Roots,world*.12+float2(.27,.63)).rgb;
    float rootWeight=.12*smoothstep(.15,.85,.5+.5*sin(world.x*.23+sin(world.y*.17)));
    half3 albedo=lerp(lerp(soil,roots,rootWeight),paint,coverage);
    // B2: pull the high-frequency painted contrast toward the tile mean so no repeat pattern survives (no grain or dither is added).
    half3 meanC=lerp(SAMPLE_TEXTURE2D_LOD(_Soil,sampler_Soil,float2(.5,.5),9).rgb,SAMPLE_TEXTURE2D_LOD(_PaintA,sampler_PaintA,float2(.5,.5),9).rgb,.8);
    albedo=lerp(albedo,meanC,_Flat);
    // B1: 1-1 field ground is dark brown-red, saturation <= .30.
    half lum=dot(albedo,half3(.299,.587,.114));albedo=lerp(half3(lum,lum,lum),albedo,_Sat);
    half3 n=normalize(i.n+half3(detail.x,0,-detail.y)*(.35*coverage));
    Light main=GetMainLight(TransformWorldToShadowCoord(i.w));
    half lambert=saturate(dot(n,main.direction));
    // Diagnostic channels are linear, before tone/fog; the Editor disables post for this pass.
    if(_LookDiagnostic>1.5)return half4(1,1,1,1);
    if(_LookDiagnostic>.5)return half4(main.shadowAttenuation,lambert,1,1);
    half shadow=max(main.shadowAttenuation,_GroundShadowFloor);
    half3 light=_GroundAmbient.rgb+main.color*_Dark*lambert*shadow;
    InputData inputData=(InputData)0;inputData.positionWS=i.w;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.p);
    uint count=GetAdditionalLightsCount();
    LIGHT_LOOP_BEGIN(count)
     Light lamp=GetAdditionalLight(lightIndex,i.w);light+=lamp.color*lamp.distanceAttenuation*lamp.shadowAttenuation*saturate(dot(n,lamp.direction));
    LIGHT_LOOP_END
    half3 color=albedo*_Tint.rgb*min(light,half3(2.4,2.4,2.4));
    return half4(MixFog(color,i.fog),1);
   }
   ENDHLSL
  }
  Pass
  {
   Name "DepthOnly" Tags {"LightMode"="DepthOnly"} ZWrite On ColorMask 0 Cull Back
   HLSLPROGRAM
   #pragma vertex vertDepth
   #pragma fragment fragDepth
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   float4 vertDepth(float4 positionOS:POSITION):SV_POSITION{return TransformObjectToHClip(positionOS.xyz);}
   half4 fragDepth():SV_Target{return 0;}
   ENDHLSL
  }
 }
}
