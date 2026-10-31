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
 struct A{float4 p:POSITION;};struct V{float4 p:SV_POSITION;float3 w:TEXCOORD0;};
 V vert(A i){V o;o.w=TransformObjectToWorld(i.p.xyz);o.p=TransformWorldToHClip(o.w);return o;}
 half4 frag(V i):SV_Target {float2 p=i.w.xz;float wave=sin(p.x*.58+p.y*.31-_TrialTime*.32)+.4*sin(p.x*1.3-p.y*.55-_TrialTime*.5);float3 n=normalize(float3(-.04*cos(p.x*.58+p.y*.31-_TrialTime*.32),1,.025*cos(p.y*.55+_TrialTime*.5)));float fr=pow(1-saturate(dot(n,normalize(GetWorldSpaceViewDir(i.w)))),3);float ribbon=smoothstep(.90,1.0,sin(p.x*.42+p.y*.7+sin(p.y*.33)*1.2-_TrialTime*.28));half3 c=_Color.rgb*(.9+wave*.045)+float3(.15,.19,.20)*fr+float3(.09,.085,.025)*ribbon*.24;return half4(MixFog(c,ComputeFogFactor(TransformWorldToHClip(i.w).z)),1);}
 ENDHLSL
 }}}
