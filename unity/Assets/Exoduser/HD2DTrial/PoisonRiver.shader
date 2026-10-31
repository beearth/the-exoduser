Shader "EXODUSER/HD2DTrial/PoisonRiver" {
 Properties { _Color("Toxic olive",Color)=(.18,.20,.055,1) }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque"}
 Pass { Tags {"LightMode"="UniversalForward"} Cull Off
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile_fog
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 float4 _Color;float _TrialTime;
 struct A{float4 p:POSITION;float2 uv:TEXCOORD0;};struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;float2 uv:TEXCOORD1;};
 V vert(A i){V o;o.w=TransformObjectToWorld(i.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=i.uv;return o;}
 half4 frag(V i):SV_Target {float2 p=(i.uv-.5)*float2(120,180);
 float a=p.x*.61+sin(p.y*.37)*1.4-_TrialTime*.21;
 float b=p.y*.74+sin(p.x*.29)*1.7+_TrialTime*.17;
 float wave=sin(a)*cos(b);
 float3 n=normalize(float3(-.055*cos(a)*cos(b),1,.04*sin(a)*sin(b)));
 float3 v=normalize(GetWorldSpaceViewDir(i.w));Light l=GetMainLight();
 float fr=pow(1-saturate(dot(n,v)),3);
 float sheen=pow(saturate(dot(n,normalize(v+l.direction))),48);
 half3 c=_Color.rgb*(.72+wave*.32)+float3(.13,.18,.20)*fr+float3(.25,.28,.12)*sheen+float3(.025,.04,.008)*pow(saturate(wave),6);
 return half4(MixFog(c,ComputeFogFactor(TransformWorldToHClip(i.w).z)),1);}
 ENDHLSL
 }}}
