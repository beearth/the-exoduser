Shader "EXODUSER/HD2DTrial/SoftSurface" {
 Properties { _Color("Color",Color)=(0,0,0,.5) _Mode("0 shadow 1 fire 2 slash",Float)=0 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent+5" "RenderType"="Transparent"}
 Pass { Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Off
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 float4 _Color;float _Mode;float _TrialTime;
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A i){V o;o.p=TransformObjectToHClip(i.p.xyz);o.uv=i.uv;return o;}
 half4 frag(V i):SV_Target {float2 p=i.uv*2-1;float a=0;
 if(_Mode<.5)a=pow(saturate(1-dot(p,p)),2);
 else if(_Mode<1.5){p.x+=sin(p.y*6+_TrialTime*8)*.09*(p.y+1);a=smoothstep(.66,.2,abs(p.x)/(1.1-i.uv.y*.8))*smoothstep(1,.05,i.uv.y);}
 else {float r=length(p);float ang=atan2(p.y,p.x);a=smoothstep(.12,.02,abs(r-.7))*smoothstep(-1.9,-.5,ang)*smoothstep(2.5,1.4,ang);}
 return half4(_Color.rgb,_Color.a*a);}
 ENDHLSL
 }}}
