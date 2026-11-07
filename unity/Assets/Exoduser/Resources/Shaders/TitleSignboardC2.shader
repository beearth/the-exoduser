Shader "Hidden/EXODUSER/TitleSignboardC2"
{
 // 2026-11-07: 10-28 Kling title loop extended to 32:9 (3840x1080). Plain centered cover of the video; the C2 waterfall overlay is retired.
 Properties { _Plate("Title video / still",2D)="black"{} }
 SubShader { Cull Off ZWrite Off ZTest Always Pass { CGPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #pragma target 3.0
 #include "UnityCG.cginc"
 sampler2D _Plate;float4 _Crop;
 float4 art(sampler2D image,float2 p){float4 c=tex2D(image,float2(p.x,1-p.y));
 #ifndef UNITY_COLORSPACE_GAMMA
 c.rgb=LinearToGammaSpace(c.rgb);
 #endif
 return c;}
 float4 frag(v2f_img i):SV_Target
 {
  float2 screen=float2(i.uv.x,1-i.uv.y),p=(screen-_Crop.xy)/_Crop.zw;
  float3 color=art(_Plate,p).rgb;
 #ifndef UNITY_COLORSPACE_GAMMA
  color=GammaToLinearSpace(color);
 #endif
  return float4(color,1);
 }
 ENDCG } }
}
