Shader "EXODUSER/Map25D/LivingCampFlame" {
 SubShader {Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+20" "RenderType"="Transparent"} Cull Off ZWrite Off Blend SrcAlpha One
 Pass {HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A a){V o;o.p=TransformObjectToHClip(a.p.xyz);o.uv=a.uv;return o;}
 half4 frag(V i):SV_Target{float h=i.uv.y,t=_Time.y;float axis=.5+.065*sin(t*2.1+h*7)+.025*sin(t*3.7-h*12);float w=.34*pow(saturate(1-h),.72)+.015;float x=abs(i.uv.x-axis)/w;float body=1-smoothstep(.40,1,x);body*=1-smoothstep(.74,1,h);float tongue=1-smoothstep(.16,.31,abs(i.uv.x-.35-.05*sin(t*2+h*9)));tongue*=1-smoothstep(.3,.87,h);float a=saturate(max(body,tongue*.5))*smoothstep(0,.06,h);clip(a-.015);float core=(1-smoothstep(.08,.42,abs(i.uv.x-axis)))*(1-smoothstep(.1,.65,h));half3 c=lerp(half3(1.5,.24,.035),half3(3.0,1.85,.58),core);return half4(c,a*.9);}
 ENDHLSL }
 }
}
