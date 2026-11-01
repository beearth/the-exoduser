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
  Font nanum;bool ready;Texture2D expTex;readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  string lvText,killText,matText;float lvT=-9,killT=-9,matT=-9;
  public float? ForcedPulseAge;   // verification only: freeze the count-pulse animation at this age
  public const float Width=216f,Height=153.39f,RightMargin=20f,Top=16f;
  public static readonly string[] Words={"레벨","경험치","지역 처치","악의"};
  static readonly string[] WordsEn={"Level","Experience","Area kills","Malice"};

  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;nanum=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
   expTex=new Texture2D(32,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)expTex.SetPixel(i,0,Color.Lerp(C(96,99,99,.55f),C(196,199,199,.85f),i/31f));expTex.Apply(false,true);
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  GUIStyle Style(int size,bool bold){
   long key=size*2L+(bold?1:0);
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=nanum,fontSize=size,fontStyle=FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  float Width_(string text,int size,bool bold,float ls){var st=Style(size,bold);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  // text-shadow: 0 1px 3px rgba(0,0,0,.95); letter-spacing applied per character (CSS adds it after every character).
  void Text(float x,float y,float h,string text,int size,bool bold,Color col,float ls,float dy=0,float opacity=1f){
   var st=Style(size,bold);float xx=x;
   foreach(char ch in text){
    string g=ch.ToString();float cw=st.CalcSize(new GUIContent(g)).x;
    st.normal.textColor=new Color(0,0,0,.55f*opacity*col.a);NativeSilverHellUi.Label(new Rect(xx,y+1+dy,60,h),g,st);
    st.normal.textColor=new Color(col.r,col.g,col.b,col.a*opacity);NativeSilverHellUi.Label(new Rect(xx,y+dy,60,h),g,st);xx+=cw+ls;
   }
  }
  void RightText(float right,float y,float h,string text,int size,bool bold,Color col,float ls,float pulseAge=-1f){
   float w=Width_(text,size,bold,ls);float dy=0,op=1f;Color c=col;
   if(pulseAge>=0&&pulseAge<.34f){
    float p=pulseAge/.34f;dy=p<.45f?Mathf.Lerp(1,-1,p/.45f):Mathf.Lerp(-1,0,(p-.45f)/.55f);op=Mathf.Lerp(.5f,1f,p);
    if(p<.45f)c=Color.Lerp(col,C(230,227,220),p/.45f);else c=Color.Lerp(C(230,227,220),col,(p-.45f)/.55f);
   }
   Text(right-w,y,h,text,size,bold,c,ls,dy,op);
  }
  static string Num(int n){return Math.Max(0,n).ToString("N0",CultureInfo.InvariantCulture);}
  float PulseAge(float t){return ForcedPulseAge.HasValue?ForcedPulseAge.Value:(t<0?-1f:Time.unscaledTime-t);}

  // hudWidth = the HUD design width (screen width / HUD scale); the panel sits 20px from the right edge, 16px from the top.
  public void Draw(float hudWidth,Info info){
   var matrix=GUI.matrix;GUI.matrix=NativeUiViewport.EdgeMatrix;hudWidth=NativeUiViewport.Edges.Width;
   Init();var W=info.english?WordsEn:Words;
   string lv=Num(info.level);
   string exp=Num(info.exp)+" / "+Num(info.maxExp);
   string kill=(info.areaKills.HasValue?Num(info.areaKills.Value):NotPorted)+" / "+(info.areaTotal.HasValue?Num(info.areaTotal.Value):NotPorted);
   string mat=Num(info.materials);
   if(lvText!=null&&lv!=lvText)lvT=Time.unscaledTime;if(killText!=null&&kill!=killText)killT=Time.unscaledTime;if(matText!=null&&mat!=matText)matT=Time.unscaledTime;
   lvText=lv;killText=kill;matText=mat;
   float x0=hudWidth-Width-RightMargin,y0=Top;var r=new Rect(x0,y0,Width,Height);
   NativeUiAudit.Region(r,"component","hud-objective","레벨/지역 처치 외곽");
   var oldColor=GUI.color;
   NativeSilverHellUi.Panel(r,12,0);GUI.color=oldColor;
   float L=x0+15,R=x0+201;   // content box x 1699..1885 in the web dump (panel x 1684)
   // 레벨 행: Hahmlet300 12/16px·은빛·자간.4px
   Text(L,y0+15.8f,16.8f,W[0],12,false,C(192,189,183),.4f);
   RightText(R,y0+13,22.39f,lv,16,true,C(242,240,236),.4f,PulseAge(lvT));
   // experience row
   Text(L,y0+38.55f,17.69f,W[1],13,false,C(192,189,183),0);
   RightText(R,y0+38.98f,16.8f,exp,12,false,C(217,214,208),0);
   // 은빛 분할선1px·경험치3px, 실제 진행률을 표시한다.
   Fill(new Rect(L,y0+68.39f,186,1),C(130,133,133,.48f));
   var bar=new Rect(L,y0+78.39f,186,3);Fill(bar,C(0,0,0,.5f));
   float pct=info.maxExp>0?Mathf.Clamp01((float)info.exp/info.maxExp):0;
   if(pct>0){var old=GUI.color;GUI.color=Color.white;NativeUiAudit.DrawTexture(new Rect(bar.x,bar.y,bar.width*pct,3),expTex);GUI.color=old;}
   Text(L,y0+91.55f,17.69f,W[2],13,false,C(192,189,183),0);
   RightText(R,y0+91.55f,17.69f,kill,13,false,C(226,223,217),0,PulseAge(killT));
   Text(L,y0+118.55f,17.69f,W[3],13,false,C(192,189,183),0);
   RightText(R-6,y0+118.55f,17.69f,mat,13,false,C(226,223,217),0,PulseAge(matT));GUI.matrix=matrix;
  }
 }
}
