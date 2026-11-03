Shader "EXODUSER/Map25D/Volume"
{
 Properties {_Lean("Shaft lean",Vector)=(.30,-.12,0,0) _Color("Scattering",Color)=(.18,.25,.34,.1) _Density("Density",Float)=.1 _Kind("0 height fog 1 shaft",Float)=0}
 SubShader {
 Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+20" "RenderType"="Transparent"}
 Pass {Cull Front ZWrite Off ZTest Always Blend SrcAlpha OneMinusSrcAlpha
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma target 3.5
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
 CBUFFER_START(UnityPerMaterial)
 float4 _Lean;half4 _Color;float _Density,_Kind;float4 _BoxMin,_BoxMax;
 CBUFFER_END
 struct A {float4 p:POSITION;};struct V {float4 p:SV_POSITION;float3 w:TEXCOORD0;};
 V vert(A i){V o;o.w=TransformObjectToWorld(i.p.xyz);o.p=TransformWorldToHClip(o.w);return o;}
 half4 frag(V i):SV_Target{
  float2 uv=GetNormalizedScreenSpaceUV(i.p);float depth=SampleSceneDepth(uv);
  #if !UNITY_REVERSED_Z
  depth=lerp(UNITY_NEAR_CLIP_VALUE,1,depth);
  #endif
  float3 hit=ComputeWorldSpacePosition(uv,depth,UNITY_MATRIX_I_VP),origin=_WorldSpaceCameraPos;
  float3 ray=normalize(i.w-origin);
  if(unity_OrthoParams.w>.5){
   #if UNITY_REVERSED_Z
   origin=ComputeWorldSpacePosition(uv,1,UNITY_MATRIX_I_VP);
   #else
   origin=ComputeWorldSpacePosition(uv,0,UNITY_MATRIX_I_VP);
   #endif
   ray=normalize(hit-origin);
  }
  float maxDistance=distance(hit,origin);
  float3 inv=rcp(ray+float3(.000001,.000001,.000001));
  float3 a=(_BoxMin.xyz-origin)*inv,b=(_BoxMax.xyz-origin)*inv;
  float3 lo=min(a,b),hi=max(a,b);float enter=max(0,max(lo.x,max(lo.y,lo.z))),leave=min(maxDistance,min(hi.x,min(hi.y,hi.z)));
  if(leave<=enter)return 0;
  float stepLength=(leave-enter)/24,sum=0;float3 extent=_BoxMax.xyz-_BoxMin.xyz;
  [unroll]for(int k=0;k<24;k++){
   float3 p=origin+ray*(enter+(k+.5)*stepLength);float3 q=(p-_BoxMin.xyz)/extent;
   float fringe=smoothstep(0,.12,q.x)*smoothstep(0,.12,1-q.x)*smoothstep(0,.12,q.z)*smoothstep(0,.12,1-q.z);
   float drift=.65+.23*sin(p.x*.24+p.z*.19+_Time.y*.045)+.12*cos(p.x*.43-p.z*.31-_Time.y*.035);
   float density=exp(-q.y*3.8)*fringe*drift;
   if(_Kind>.5){float2 axis=q.xz-.5+_Lean.xy*(q.y-.5);float r=length(axis);density=exp(-r*r*22)*smoothstep(0,.15,q.y)*smoothstep(0,.2,1-q.y)*fringe;}
   sum+=density*stepLength;
  }
  return half4(_Color.rgb,(1-exp(-sum*_Density))*_Color.a);
 }
 ENDHLSL
 }
 }
}
