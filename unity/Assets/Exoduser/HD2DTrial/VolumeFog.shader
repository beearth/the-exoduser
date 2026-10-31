Shader "EXODUSER/HD2DTrial/VolumeFog" {
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent-10" "RenderType"="Transparent"}
 Pass { Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Off ZTest Always
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
 float4 _TrialCameraOrigin,_TrialCameraRight,_TrialCameraUp,_TrialCameraForward,_TrialOrtho;
 struct A{float4 p:POSITION;};struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;};
 V vert(A i){V o;o.w=TransformObjectToWorld(i.p.xyz);o.p=TransformWorldToHClip(o.w);return o;}
 half4 frag(V i):SV_Target {
 float2 uv=i.p.xy/_ScaledScreenParams.xy;float d=SampleSceneDepth(uv);
 #if !UNITY_REVERSED_Z
 d=lerp(UNITY_NEAR_CLIP_VALUE,1,d);
 #endif
 float eye=lerp(_ProjectionParams.z,_ProjectionParams.y,d);
 float3 ro=_TrialCameraOrigin.xyz+_TrialCameraRight.xyz*((uv.x-.5)*_TrialOrtho.x)+_TrialCameraUp.xyz*((uv.y-.5)*_TrialOrtho.y);
 float3 rd=_TrialCameraForward.xyz;float3 end=ro+rd*eye;
 float3 lo=float3(-45,-1,-18),hi=float3(45,15,75);float3 t0=(lo-ro)/rd,t1=(hi-ro)/rd;float3 mn=min(t0,t1),mx=max(t0,t1);float a=max(0,max(mn.x,max(mn.y,mn.z)));float b=min(length(end-ro),min(mx.x,min(mx.y,mx.z)));if(b<=a)return 0;
 float step=(b-a)/24;float density=0;float3 scatter=0;
 [unroll]for(int k=0;k<24;k++){float3 p=ro+rd*(a+(k+.5)*step);float low=exp(-max(p.y,0)*.85)*smoothstep(-3,24,p.z)*.035;float beam=exp(-pow((p.x+5-p.y*.32)*.55,2))*exp(-pow((p.z-8)*.16,2))*.02;float den=low+beam;scatter+=float3(.32,.43,.48)*den*step;density+=den*step;}
 return half4(scatter/max(density,.0001),1-exp(-density));
 }
 ENDHLSL
 }}}
