Shader "EXODUSER/HD2DTrial/TiltShift" {
 Properties { _MainTex("Scene",2D)="white"{} }
 SubShader { Pass { ZTest Always ZWrite Off Cull Off
 HLSLPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #include "UnityCG.cginc"
 sampler2D _MainTex;float4 _MainTex_TexelSize;
 fixed4 frag(v2f_img i):SV_Target {
 float f=smoothstep(.27,.03,i.uv.y)+smoothstep(.70,1,i.uv.y);
 float2 r=_MainTex_TexelSize.xy*f*5;
 float4 c=tex2D(_MainTex,i.uv)*.28;
 c+=(tex2D(_MainTex,i.uv+r*float2(1,0))+tex2D(_MainTex,i.uv-r*float2(1,0))+tex2D(_MainTex,i.uv+r*float2(0,1))+tex2D(_MainTex,i.uv-r*float2(0,1)))*.12;
 c+=(tex2D(_MainTex,i.uv+r)+tex2D(_MainTex,i.uv-r)+tex2D(_MainTex,i.uv+r*float2(1,-1))+tex2D(_MainTex,i.uv+r*float2(-1,1)))*.06;
 return float4(c.rgb,1);
 }
 ENDHLSL
 }}}
