Shader "Hidden/EXODUSER/TitleSignboard"
{
 Properties { _Plate("Background",2D)="black"{} _Hero("Silvertail",2D)="black"{} _Masks("Motion masks",2D)="black"{} _Hands("Hands",2D)="black"{} }
 SubShader { Cull Off ZWrite Off ZTest Always Pass { CGPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #pragma target 3.0
 #include "UnityCG.cginc"
 sampler2D _Plate,_Hero,_Masks,_Hands;
 float4 _Crop;float _Seconds;
 float band(float a,float b,float c,float d,float x){return smoothstep(a,b,x)*(1-smoothstep(c,d,x));}
 float4 sampleArt(sampler2D image,float2 p)
 {
  float4 c=tex2D(image,float2(p.x,1-p.y));
  #ifndef UNITY_COLORSPACE_GAMMA
  c.rgb=LinearToGammaSpace(c.rgb);
  #endif
  return c;
 }
 float4 over(float4 a,float4 b){return float4(lerp(a.rgb,b.rgb,b.a),1);}
 float4 hand(float2 p,float2 basePoint,float width,float cell,float phase)
 {
  float rise=.5+.5*sin(_Seconds*.48+phase),height=width*3.5555556*1.78;
  float2 q=(p-float2(basePoint.x-width*.5,basePoint.y-height*(.26+.74*rise)))/float2(width,height);
  if(q.x<0||q.x>1||q.y<0||q.y>1||p.y>basePoint.y)return 0;
  q.x+=sin(q.y*7+_Seconds*1.15+phase)*.018*(1-q.y);
  float4 c=sampleArt(_Hands,float2((clamp(q.x,0,1)+cell)/6,q.y));
  c.rgb*=float3(.75,.49,.43);c.a*=smoothstep(0,.016,basePoint.y-p.y)*(.36+.38*rise);return c;
 }
 float4 frag(v2f_img i):SV_Target
 {
  float2 screen=float2(i.uv.x,1-i.uv.y),p=(screen-_Crop.xy)/_Crop.zw;
  float3 mask=tex2D(_Masks,float2(p.x,1-p.y)).rgb;
  float2 moon=(p-float2(.416,.193))*float2(3.5555556,1);
  float disc=1-smoothstep(.116,.127,length(moon)),sky=mask.r*(1-disc);
  float2 q=p;float depth=band(0,.025,.32,.49,p.y);
  q.x+=sky*depth*(sin(_Seconds*.075+p.y*14)*.0038+sin(_Seconds*.123+p.y*29)*.0015+sin(_Seconds*.045+p.y*7)*.002);
  q.y+=sky*depth*sin(_Seconds*.095+p.x*18)*.0016;
  float river=mask.g;q.x+=river*sin(p.y*190-_Seconds*1.45+p.x*24)*.0008;
  q.y+=river*(sin(p.y*82-_Seconds*.72)*.0017+sin(p.x*170+_Seconds*.9)*.0005);
  float4 color=sampleArt(_Plate,q);float pulse=sin(_Seconds*.66)*.5+.5;
  float through=sin(p.x*29+p.y*13-_Seconds*.29)*sin(p.x*14-p.y*24+_Seconds*.17);
  color.rgb*=1+disc*(pulse-.5)*.11;
  color.rgb+=float3(.042,.005,.002)*sky*(.45+.55*through)*(1-smoothstep(.12,.74,length(moon)));
  color.rgb+=float3(.022,.003,.001)*mask.b*sin(_Seconds*.66+through*.4);
  float streak=pow(.5+.5*sin(p.y*410-_Seconds*1.8+sin(p.x*96)),12);
  color.rgb+=float3(.065,.014,.008)*river*streak*(.6+.4*sin(_Seconds*.8+p.y*30));
  color=over(color,hand(p,float2(.418,.908),.019,2,.3));
  color=over(color,hand(p,float2(.384,.964),.023,3,2.8));
  color=over(color,hand(p,float2(.451,.803),.0105,4,4.4));
  color=over(color,hand(p,float2(.441,.855),.014,1,1.7));
  color=over(color,hand(p,float2(.392,.918),.015,5,5.4));
  color=over(color,hand(p,float2(.457,.716),.007,0,3.9));
  float2 hp=p;
  float hair=band(.604,.622,.716,.742,p.x)*band(.145,.175,.335,.365,p.y);
  float cloth=band(.618,.645,.739,.769,p.x)*band(.435,.49,.79,.84,p.y);
  hp.x+=(hair*.0018+cloth*.0021)*sin(_Seconds*1.05+p.y*12);
  hp.y+=(hair*.0035+cloth*.003)*sin(_Seconds*.83+p.x*18);
  color=over(color,sampleArt(_Hero,hp));
  #ifndef UNITY_COLORSPACE_GAMMA
  color.rgb=GammaToLinearSpace(color.rgb);
  #endif
  return float4(color.rgb,1);
 }
 ENDCG } }
}
