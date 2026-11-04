using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Web top-right objective panel #mmLvl (game.html markup 2576-2586, CSS 372-379 + 1008, values 60319-60330): level, experience text + bar,
 // "지역 처치" (area kills) and "악의" (malice). Layout numbers are the computed-style dump of the web panel at 1920x1080. All values are passed by the
 // caller from Unity state; null values keep the legacy fallback. Regional fields show the actual purification target, plus two persistent goal lines.
 public sealed class NativeObjectivePanel {
  public struct Info {public int level,exp,maxExp,materials;public int? areaKills,areaTotal;public bool english;public string locale;public NativeHellGateObjective gate;}
  const string NotPorted="미이식";
  Font nanum;bool ready;Texture2D expTex;readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  string lvText,killText,matText;float lvT=-9,killT=-9,matT=-9;
  public float? ForcedPulseAge;   // verification only: freeze the count-pulse animation at this age
  public bool GoalTextFits {get;private set;}=true;
  public const float MinimumLabelGap=16f;
  public float PanelWidth {get;private set;}=Width;
  public float OverflowHeight {get;private set;}
  public bool VerifyLabelLayout;
  [Serializable] public sealed class LabelMetric {public string locale,key;public float panelWidth,labelWidth,valueWidth,gap;public int fontSize;public bool wrapped,fits;}
  public LabelMetric[] LayoutAudit {get;private set;}
  public const float Width=216f,Height=153.39f,RightMargin=20f,Top=16f;
  public const float GoalWidth=480f,GoalHeight=68f,GoalGap=6f;
  public static Rect Bounds(float width,bool hasGoal,float actualWidth=Width,float extraHeight=0)=>new Rect(width-(hasGoal?Mathf.Max(GoalWidth,actualWidth):actualWidth)-RightMargin,Top,hasGoal?Mathf.Max(GoalWidth,actualWidth):actualWidth,Height+extraHeight+(hasGoal?GoalGap+GoalHeight:0));
  public static readonly string[] Words={"레벨","경험치","지역 처치","악의오브"};
  static readonly string[] WordsEn={"Level","Experience","Area kills","Orb of Malice"};
  static readonly Dictionary<string,string[]> wordLocales=new Dictionary<string,string[]>();
  public static string[] LabelsForLocale(string locale){
   string code=string.IsNullOrEmpty(locale)?"ko":locale;
   if(!wordLocales.TryGetValue(code,out var words)){words=new string[Words.Length];for(int i=0;i<words.Length;i++)words[i]=NativeDemoText.Get(Words[i],code,WordsEn[i]);wordLocales.Add(code,words);}
   return words;
  }

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
  float Width_(string text,int size,bool bold,float ls){var st=Style(size,bold);return NativeUiTextRun.Layout(text,ls,g=>st.CalcSize(new GUIContent(g)).x);}
  // text-shadow: 0 1px 3px rgba(0,0,0,.95); letter-spacing applied per character (CSS adds it after every character).
  void Text(float x,float y,float h,string text,int size,bool bold,Color col,float ls,float dy=0,float opacity=1f){
   var st=Style(size,bold);
   NativeUiTextRun.Layout(text,ls,g=>st.CalcSize(new GUIContent(g)).x,(offset,g)=>{
    var box=new Rect(x+offset,y+dy,ls==0?Mathf.Max(1,st.CalcSize(new GUIContent(g)).x):60,h);
    using(var paint=NativeUiAudit.GroupText(box,g)){
     st.normal.textColor=new Color(0,0,0,.55f*opacity*col.a);NativeSilverHellUi.Label(new Rect(box.x,box.y+1,box.width,box.height),g,st);
     st.normal.textColor=new Color(col.r,col.g,col.b,col.a*opacity);NativeSilverHellUi.Label(box,g,st);
    }
   });
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
  static int WordSize(int row,string locale)=>row==0?12:row==3&&locale=="en"?11:13;
  static float Prefix(int row)=>row==3?38:0;
  static float ValueInset(int row)=>row==3?6:0;
  internal static float LabelSpace(float panelWidth,float prefix,float valueWidth,float valueInset)=>panelWidth-30-prefix-valueInset-valueWidth-MinimumLabelGap;
  float LabelWidth(string text,int size,string locale,float spacing){
   return locale=="ko"||locale=="en"?Width_(text,size,false,spacing):NativeDemoText.Style(Style(size,false),text).CalcSize(new GUIContent(text)).x;
  }
  float WidthForLabels(string[] words,string[] values,string locale){
   float width=Width;
   for(int i=0;i<4;i++)width=Mathf.Max(width,30+Prefix(i)+ValueInset(i)+MinimumLabelGap+LabelWidth(words[i],WordSize(i,locale),locale,i==0?.4f:0)+Width_(values[i],i==0?16:i==1?12:13,false,i==0?.4f:0));
   return Mathf.Min(GoalWidth,width);
  }
  int FitWord(string text,int size,string locale,float spacing,float width){while(size>11&&LabelWidth(text,size,locale,spacing)>width)size--;return size;}
  LabelMetric[] MeasureRows(string[] words,string[] values,string locale,float width){
   var result=new LabelMetric[4];
   for(int i=0;i<4;i++){
    float valueWidth=Width_(values[i],i==0?16:i==1?12:13,false,i==0?.4f:0),space=LabelSpace(width,Prefix(i),valueWidth,ValueInset(i));
    int size=FitWord(words[i],WordSize(i,locale),locale,i==0?.4f:0,space);float labelWidth=LabelWidth(words[i],size,locale,i==0?.4f:0);bool wrap=labelWidth>space;
    result[i]=new LabelMetric{locale=locale,key=Words[i],panelWidth=width,labelWidth=Mathf.Min(space,labelWidth),valueWidth=valueWidth,fontSize=size,wrapped=wrap,gap=width-30-Prefix(i)-ValueInset(i)-valueWidth-Mathf.Min(space,labelWidth),fits=space>0};
   }
   return result;
  }
  void AuditAllLocales(){
   var rows=new List<LabelMetric>();var stress=new[]{"2,147,483,647","2,147,483,647 / 2,147,483,647","2,147,483,647 / 2,147,483,647","2,147,483,647"};
   for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);var words=LabelsForLocale(code);rows.AddRange(MeasureRows(words,stress,code,WidthForLabels(words,stress,code)));}
   LayoutAudit=rows.ToArray();
  }
  void Word(float x,float y,float h,string text,int size,Color color,float spacing,string locale,float width,bool wrap){
   if((locale=="ko"||locale=="en")&&!wrap){NativeUiAudit.BeginGroup(new Rect(x,y-2,width,h+4));try{Text(0,2,h,text,size,false,color,spacing);}finally{NativeUiAudit.EndGroup();}return;}
   var style=NativeDemoText.Style(Style(size,false),text);
   style.wordWrap=wrap;style.clipping=TextClipping.Clip;
   var box=new Rect(x,y-2,width,h+4);
   style.normal.textColor=new Color(0,0,0,.55f*color.a);NativeDemoText.Label(new Rect(box.x,box.y+1,box.width,box.height),text,style);
   style.normal.textColor=color;NativeDemoText.Label(box,text,style);
  }

  // hudWidth = the HUD design width (screen width / HUD scale); the panel sits 20px from the right edge, 16px from the top.
  public void Draw(float hudWidth,Info info){
   var matrix=GUI.matrix;GUI.matrix=NativeUiViewport.EdgeMatrix;hudWidth=NativeUiViewport.Edges.Width;
   Init();string locale=info.locale??(info.english?"en":"ko");var W=LabelsForLocale(locale);
   string lv=Num(info.level);
   string exp=Num(info.exp)+" / "+Num(info.maxExp);
   string kill=info.gate.Visible?Num(info.gate.Kills)+" / "+Num(info.gate.Required):(info.areaKills.HasValue?Num(info.areaKills.Value):NotPorted)+" / "+(info.areaTotal.HasValue?Num(info.areaTotal.Value):NotPorted);
   string mat=Num(info.materials);
   if(lvText!=null&&lv!=lvText)lvT=Time.unscaledTime;if(killText!=null&&kill!=killText)killT=Time.unscaledTime;if(matText!=null&&mat!=matText)matT=Time.unscaledTime;
   lvText=lv;killText=kill;matText=mat;
   if(VerifyLabelLayout&&LayoutAudit==null)AuditAllLocales();
   var values=new[]{lv,exp,kill,mat};PanelWidth=WidthForLabels(W,values,locale);var rows=MeasureRows(W,values,locale,PanelWidth);
   var extra=new float[5];var rowHeights=new[]{16.8f,17.69f,17.69f,17.69f};
   for(int i=0;i<4;i++){float added=0;if(rows[i].wrapped){float space=LabelSpace(PanelWidth,Prefix(i),rows[i].valueWidth,ValueInset(i));var st=NativeDemoText.Style(Style(rows[i].fontSize,false),W[i]);st.wordWrap=true;added=Mathf.Max(0,st.CalcHeight(new GUIContent(W[i]),space)-rowHeights[i]);}extra[i+1]=extra[i]+added;}
   OverflowHeight=extra[4];float x0=hudWidth-PanelWidth-RightMargin,y0=Top;var r=new Rect(x0,y0,PanelWidth,Height+OverflowHeight);
   NativeUiAudit.Region(r,"component","hud-objective","레벨/지역 처치 외곽");
   var oldColor=GUI.color;
   NativeSilverHellUi.Panel(r,12,0);GUI.color=oldColor;
   float L=x0+15,R=x0+PanelWidth-15;
   // 레벨 행: Hahmlet300 12/16px·은빛·자간.4px
   Word(L,y0+15.8f,16.8f+extra[1],W[0],rows[0].fontSize,C(192,189,183),.4f,locale,LabelSpace(PanelWidth,0,rows[0].valueWidth,0),rows[0].wrapped);
   RightText(R,y0+13,22.39f,lv,16,true,C(242,240,236),.4f,PulseAge(lvT));
   // experience row
   Word(L,y0+38.55f+extra[1],17.69f+extra[2]-extra[1],W[1],rows[1].fontSize,C(192,189,183),0,locale,LabelSpace(PanelWidth,0,rows[1].valueWidth,0),rows[1].wrapped);
   RightText(R,y0+38.98f+extra[1],16.8f,exp,12,false,C(217,214,208),0);
   // 은빛 분할선1px·경험치3px, 실제 진행률을 표시한다.
   Fill(new Rect(L,y0+68.39f+extra[2],PanelWidth-30,1),C(130,133,133,.48f));
   var bar=new Rect(L,y0+78.39f+extra[2],PanelWidth-30,3);Fill(bar,C(0,0,0,.5f));
   float pct=info.maxExp>0?Mathf.Clamp01((float)info.exp/info.maxExp):0;
   if(pct>0){var old=GUI.color;GUI.color=Color.white;NativeUiAudit.DrawTexture(new Rect(bar.x,bar.y,bar.width*pct,3),expTex);GUI.color=old;}
   Word(L,y0+91.55f+extra[2],17.69f+extra[3]-extra[2],W[2],rows[2].fontSize,C(192,189,183),0,locale,LabelSpace(PanelWidth,0,rows[2].valueWidth,0),rows[2].wrapped);
   RightText(R,y0+91.55f+extra[2],17.69f,kill,13,false,C(226,223,217),0,PulseAge(killT));
   var orbRect=new Rect(L,y0+111+extra[3],32,32);NativeCurrencyOrb.Draw(orbRect,info.materials);
   Word(L+38,y0+118.55f+extra[3],17.69f+extra[4]-extra[3],W[3],rows[3].fontSize,C(192,189,183),0,locale,LabelSpace(PanelWidth,38,rows[3].valueWidth,6),rows[3].wrapped);
   NativeCurrencyOrb.DrawFlights(orbRect,hudWidth,Screen.height*hudWidth/Screen.width);
   RightText(R-6,y0+118.55f+extra[3],17.69f,mat,13,false,C(226,223,217),0,PulseAge(matT));
   if(info.gate.Visible)DrawGoal(hudWidth,info);
   GUI.matrix=matrix;
  }
  void DrawGoal(float hudWidth,Info info){
   NativeHellGateLabels.Lines(info.gate,info.locale??(info.english?"en":"ko"),out string heading,out string detail);
   var box=new Rect(hudWidth-GoalWidth-RightMargin,Top+Height+OverflowHeight+GoalGap,GoalWidth,GoalHeight);
   NativeUiAudit.Region(box,"component","hud-hellgate-objective","지옥문 조건 두 줄");
   NativeSilverHellUi.Panel(box,12,0);
   Fill(new Rect(box.x+15,box.y+10,1,GoalHeight-20),C(183,166,129,.48f));
   GoalTextFits=GoalLine(new Rect(box.x+25,box.y+9,box.width-40,23),heading,C(226,223,217))&GoalLine(new Rect(box.x+25,box.y+34,box.width-40,23),detail,C(192,189,183));
  }
  bool GoalLine(Rect rect,string text,Color color){
   var style=new GUIStyle(Style(13,false)){font=NativeSilverHellUi.TextFont(nanum,text),clipping=TextClipping.Clip};
   while(style.fontSize>11&&style.CalcSize(new GUIContent(text)).x>rect.width)style.fontSize--;
   style.normal.textColor=new Color(0,0,0,.95f);NativeDemoText.Label(new Rect(rect.x,rect.y+1,rect.width,rect.height),text,style);
   style.normal.textColor=color;NativeDemoText.Label(rect,text,style);
   return style.CalcSize(new GUIContent(text)).x<=rect.width;
  }
 }
}
