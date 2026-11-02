Shader "Hidden/EXODUSER/TitleSignboardC2"
{
 Properties { _Plate("C2 video / still",2D)="black"{} _Near("Near fall mask",2D)="black"{} _Far("Far fall mask",2D)="black"{} _Flow("128x512 periodic flow",2D)="black"{} }
 SubShader { Cull Off ZWrite Off ZTest Always Pass { CGPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #pragma target 3.0
 #include "UnityCG.cginc"
 sampler2D _Plate,_Near,_Far,_Flow;float4 _Crop;float _Seconds,_Motion;
 float4 art(sampler2D image,float2 p){float4 c=tex2D(image,float2(p.x,1-p.y));
 #ifndef UNITY_COLORSPACE_GAMMA
 c.rgb=LinearToGammaSpace(c.rgb);
 #endif
 return c;}
 float3 blend(float3 c,float3 v,float alpha){return lerp(c,v,saturate(alpha));}
 float radial(float2 p,float2 center,float radius){return 1-saturate((length(p-center)-1)/(radius-1));}
 float3 waterfall(float3 color,float2 p,sampler2D mask,float4 box,float2 mouth,float2 contact,float speed)
 {
  float2 q=(p-box.xy)/box.zw;
  if(all(q>=0)&&all(q<=1)){
   float a=tex2D(mask,float2(q.x,1-q.y)).a;
   float y=p.y-box.y-fmod(_Seconds*speed,512);
   color=blend(color,art(_Flow,float2(q.x,frac(y/512))).rgb,a*.38);
  }
  color=blend(color,float3(119,26,23)/255,radial(p,mouth,26)*.15);
  for(int k=0;k<3;k++){
   float phase=frac(_Seconds*.55+k/3.0);float2 radii=float2(12+phase*43,2+phase*6);
   float distance=length((p-contact-float2(0,phase*7))/radii);
   float edge=abs(distance-1)*min(radii.x,radii.y);
   color=blend(color,float3(136,70,62)/255,(1-smoothstep(.1,1.2,edge))*(1-phase)*.12);
  }
  return blend(color,float3(146,105,98)/255,radial(p,contact-float2(0,5),43)*.09);
 }
 float4 frag(v2f_img i):SV_Target
 {
  float2 screen=float2(i.uv.x,1-i.uv.y),p=(screen-_Crop.xy)/_Crop.zw;
  float3 color=art(_Plate,p).rgb;float2 px=p*float2(2036,1016);
  if(_Motion>.5){color=waterfall(color,px,_Near,float4(696,498,66,259),float2(714,506),float2(735,747),100);color=waterfall(color,px,_Far,float4(951,548,78,218),float2(974,555),float2(1001,756),75);}
 #ifndef UNITY_COLORSPACE_GAMMA
  color=GammaToLinearSpace(color);
 #endif
  return float4(color,1);
 }
 ENDCG } }
}
