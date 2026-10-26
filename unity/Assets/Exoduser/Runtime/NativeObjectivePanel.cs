using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web top-right objective panel #mmLvl (game.html markup 2576-2586, CSS 372-379 + 1008, values 60319-60330): level, experience text + bar,
 // "지역 처치" (area kills) and "악의" (malice). Layout numbers are the computed-style dump of the web panel at 1920x1080. All values are passed by the
 // caller from Unity state; a null value is drawn as "미이식" (Unity has no area-kill total, so the kill row is "N / 미이식").
 public sealed class NativeObjectivePanel {
  public struct Info {public int level,exp,maxExp,materials;public int? areaKills,areaTotal;public bool english;}
  const string NotPorted="미이식";
  Font nanum;bool ready;Texture2D bg,shadowTex,glowTex,expTex,topLine;readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  string lvText,killText,matText;float lvT=-9,killT=-9,matT=-9;
  public float? ForcedPulseAge;   // verification only: freeze the count-pulse animation at this age
  public const float Width=216f,Height=153.39f,RightMargin=20f,Top=16f;
  public static readonly string[] Words={"레벨","경험치","지역 처치","악의"};
  static readonly string[] WordsEn={"Level","Experience","Area kills","Malice"};

  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;nanum=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
   // linear-gradient(145deg, rgba(38,31,27,.96), rgba(13,14,17,.94) 46%, rgba(9,10,13,.93)) over the 216x153.39 box
   const int W=108,H=77;bg=new Texture2D(W,H,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   float ang=145*Mathf.Deg2Rad;Vector2 dir=new Vector2(Mathf.Sin(ang),-Mathf.Cos(ang));float len=Mathf.Abs(Width*dir.x)+Mathf.Abs(Height*dir.y);
   for(int y=0;y<H;y++)for(int x=0;x<W;x++){
    Vector2 p=new Vector2((x+.5f)/W*Width-Width/2,(y+.5f)/H*Height-Height/2);float t=Mathf.Clamp01(Vector2.Dot(p,dir)/len+.5f);
    Color c=t<.46f?Color.Lerp(C(38,31,27,.96f),C(13,14,17,.94f),t/.46f):Color.Lerp(C(13,14,17,.94f),C(9,10,13,.93f),(t-.46f)/.54f);
    bg.SetPixel(x,H-1-y,c);
   }
   bg.Apply(false,true);
   const int n=128;shadowTex=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=Mathf.Abs((x+.5f)/n*2-1),dy=Mathf.Abs((y+.5f)/n*2-1);float d=Mathf.Max(dx,dy);px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-d)*Mathf.Clamp01(1-d));}
   shadowTex.SetPixels(px);shadowTex.Apply(false,true);
   glowTex=new Texture2D(1,32,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)glowTex.SetPixel(0,31-i,new Color(177/255f,111/255f,53/255f,.055f*(1f-i/31f)));glowTex.Apply(false,true);
   // #mmLvl::before (computed style): absolute top 3px, left/right 12px (190px wide), 1px, linear-gradient(90deg, transparent, rgba(235,186,103,.64), transparent)
   topLine=new Texture2D(64,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<64;i++){float u=i/63f;float a=.64f*(1f-Mathf.Abs(u*2-1));topLine.SetPixel(i,0,new Color(235/255f,186/255f,103/255f,a));}topLine.Apply(false,true);
   expTex=new Texture2D(32,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)expTex.SetPixel(i,0,Color.Lerp(C(122,101,72,.55f),C(196,171,124,.85f),i/31f));expTex.Apply(false,true);
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  GUIStyle Style(int size,bool bold){
   long key=size*2L+(bold?1:0);
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=nanum,fontSize=size,fontStyle=bold?FontStyle.Bold:FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  float Width_(string text,int size,bool bold,float ls){var st=Style(size,bold);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  // text-shadow: 0 1px 3px rgba(0,0,0,.95); letter-spacing applied per character (CSS adds it after every character).
  void Text(float x,float y,float h,string text,int size,bool bold,Color col,float ls,float dy=0,float opacity=1f){
   var st=Style(size,bold);float xx=x;
   foreach(char ch in text){
    string g=ch.ToString();float cw=st.CalcSize(new GUIContent(g)).x;
    st.normal.textColor=new Color(0,0,0,.55f*opacity*col.a);GUI.Label(new Rect(xx,y+1+dy,60,h),g,st);
    st.normal.textColor=new Color(col.r,col.g,col.b,col.a*opacity);GUI.Label(new Rect(xx,y+dy,60,h),g,st);GUI.Label(new Rect(xx+.4f,y+dy,60,h),g,st);xx+=cw+ls;
   }
  }
  void RightText(float right,float y,float h,string text,int size,bool bold,Color col,float ls,float pulseAge=-1f){
   float w=Width_(text,size,bold,ls);float dy=0,op=1f;Color c=col;
   if(pulseAge>=0&&pulseAge<.34f){
    float p=pulseAge/.34f;dy=p<.45f?Mathf.Lerp(1,-1,p/.45f):Mathf.Lerp(-1,0,(p-.45f)/.55f);op=Mathf.Lerp(.5f,1f,p);
    if(p<.45f)c=Color.Lerp(col,C(216,196,157),p/.45f);else c=Color.Lerp(C(216,196,157),col,(p-.45f)/.55f);
   }
   Text(right-w,y,h,text,size,bold,c,ls,dy,op);
  }
  static string Num(int n){return Math.Max(0,n).ToString("N0",CultureInfo.InvariantCulture);}
  float PulseAge(float t){return ForcedPulseAge.HasValue?ForcedPulseAge.Value:(t<0?-1f:Time.unscaledTime-t);}

  // hudWidth = the HUD design width (screen width / HUD scale); the panel sits 20px from the right edge, 16px from the top.
  public void Draw(float hudWidth,Info info){
   Init();var W=info.english?WordsEn:Words;
   string lv=Num(info.level);
   string exp=Num(info.exp)+" / "+Num(info.maxExp);
   string kill=(info.areaKills.HasValue?Num(info.areaKills.Value):NotPorted)+" / "+(info.areaTotal.HasValue?Num(info.areaTotal.Value):NotPorted);
   string mat=Num(info.materials);
   if(lvText!=null&&lv!=lvText)lvT=Time.unscaledTime;if(killText!=null&&kill!=killText)killT=Time.unscaledTime;if(matText!=null&&mat!=matText)matT=Time.unscaledTime;
   lvText=lv;killText=kill;matText=mat;
   float x0=hudWidth-Width-RightMargin,y0=Top;var r=new Rect(x0,y0,Width,Height);
   var oldColor=GUI.color;
   // box-shadow 0 8px 26px rgba(0,0,0,.62) + filter drop-shadow(0 10px 24px .45), approximated by one soft quad
   GUI.color=new Color(0,0,0,.5f);GUI.DrawTexture(new Rect(r.x-18,r.y-10+9,r.width+36,r.height+36),shadowTex);
   GUI.color=Color.white;GUI.DrawTexture(r,bg);
   GUI.color=new Color(1,1,1,1);GUI.DrawTexture(new Rect(r.x+1,r.y+1,r.width-2,30),glowTex);   // inset 0 12px 18px rgba(177,111,53,.055)
   var bd=C(156,122,75,.68f);Fill(new Rect(r.x,r.y,r.width,1),bd);Fill(new Rect(r.x,r.yMax-1,r.width,1),bd);Fill(new Rect(r.x,r.y+1,1,r.height-2),bd);Fill(new Rect(r.xMax-1,r.y+1,1,r.height-2),bd);
   var ring=C(232,192,129,.075f);Fill(new Rect(r.x+1,r.y+1,r.width-2,1),ring);Fill(new Rect(r.x+1,r.yMax-2,r.width-2,1),ring);Fill(new Rect(r.x+1,r.y+2,1,r.height-4),ring);Fill(new Rect(r.xMax-2,r.y+2,1,r.height-4),ring);
   GUI.color=Color.white;GUI.DrawTexture(new Rect(x0+13,y0+4,190,1),topLine);
   GUI.color=oldColor;
   float L=x0+15,R=x0+201;   // content box x 1699..1885 in the web dump (panel x 1684)
   // rank row: label 12px #cbbd9f, value 16px bold #f2e6cb, ls .4px
   Text(L,y0+15.8f,16.8f,W[0],12,false,C(203,189,159),.4f);
   RightText(R,y0+13,22.39f,lv,16,true,C(242,230,203),.4f,PulseAge(lvT));
   // experience row
   Text(L,y0+38.55f,17.69f,W[1],13,false,C(203,189,159),0);
   RightText(R,y0+38.98f,16.8f,exp,12,false,C(223,207,170),0);
   // frame: 1px top border rgba(192,151,92,.48), bar 3px, rows
   Fill(new Rect(L,y0+68.39f,186,1),C(192,151,92,.48f));
   var bar=new Rect(L,y0+78.39f,186,3);Fill(bar,C(0,0,0,.5f));
   float pct=info.maxExp>0?Mathf.Clamp01((float)info.exp/info.maxExp):0;
   if(pct>0){var old=GUI.color;GUI.color=Color.white;GUI.DrawTexture(new Rect(bar.x,bar.y,bar.width*pct,3),expTex);GUI.color=old;}
   Text(L,y0+91.55f,17.69f,W[2],13,false,C(203,189,159),0);
   RightText(R,y0+91.55f,17.69f,kill,13,false,C(238,228,212),0,PulseAge(killT));
   Text(L,y0+118.55f,17.69f,W[3],13,false,C(203,189,159),0);
   RightText(R-6,y0+118.55f,17.69f,mat,13,false,C(238,228,212),0,PulseAge(matT));
  }
 }
}
