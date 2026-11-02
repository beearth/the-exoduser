Shader "Hidden/Exoduser/DifficultyCard" {
 Properties { _MainTex("Artwork",2D)="white" {} _Gray("Grayscale",Range(0,1))=1 _Brightness("Brightness",Float)=.62 _Contrast("Contrast",Float)=1.05 }
 SubShader { Cull Off ZWrite Off ZTest Always Pass { CGPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #include "UnityCG.cginc"
 sampler2D _MainTex;float _Gray,_Brightness,_Contrast;
 fixed4 frag(v2f_img i):SV_Target { fixed4 c=tex2D(_MainTex,i.uv);
 #ifndef UNITY_COLORSPACE_GAMMA
 c.rgb=LinearToGammaSpace(c.rgb);
 #endif
 float grey=dot(c.rgb,float3(.2126,.7152,.0722));c.rgb=saturate((lerp(c.rgb,grey,_Gray)*_Brightness-.5)*_Contrast+.5);
 #ifndef UNITY_COLORSPACE_GAMMA
 c.rgb=GammaToLinearSpace(c.rgb);
 #endif
 return c; }
 ENDCG } }
}
