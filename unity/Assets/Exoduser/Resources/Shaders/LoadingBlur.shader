Shader "Hidden/EXODUSER/LoadingBlur" { Properties { _MainTex ("Source", 2D) = "white" {} } SubShader { Cull Off ZWrite Off ZTest Always Pass { CGPROGRAM
#pragma vertex vert_img
#pragma fragment frag
#include "UnityCG.cginc"
sampler2D _MainTex;float4 _MainTex_TexelSize;
fixed4 frag(v2f_img i):SV_Target {float3 c=0;float weight=0;for(int y=-3;y<=3;y++)for(int x=-3;x<=3;x++){float w=exp(-(x*x+y*y)/5.0);c+=tex2D(_MainTex,i.uv+float2(x,y)*_MainTex_TexelSize.xy*8).rgb*w;weight+=w;}return fixed4(c/weight,1);}
ENDCG } } }
