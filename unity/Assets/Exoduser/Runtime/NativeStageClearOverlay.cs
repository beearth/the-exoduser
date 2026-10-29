using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web stage-clear panel (#stageClear, game.html markup 3203-3210, CSS 356-364, flow 41925-42035, result block _showClearResult 42059-42130) in the 1920x1080
 // 초기 웹 정의/공식은 보존한다. 일반 완료 화면은 실제 측정값만 공유 반응형 레이아웃에 표시한다.
 // 누락 통계의 내부 구현 문구와 초기 원본 재현은 명시적 --unity-ui-diagnostics에서만 그린다.
 public sealed class NativeStageClearOverlay {
  public enum Kind {Zone,HellEscape,DemoEnd}
  public struct Input {
   public Kind kind;public int hellIndex;public int? stageIndex;   // stageIndex: lets the build flavor turn the last stage's zone clear into the demo-end panel (web 42003)
   public int? clearSeconds,totalSpawned,stageKills,regionsCleared,deaths,dmgTaken,comboMax,dmgDealt,crits,parries,potions,maxHit,dashCount,dashMeters,walkMeters;
   public bool? bossKilled;
   public int? statPointsAwarded,statPointsBalance; // 완료 이벤트 틱의 실제 SP 변화/현재 보유량. 저장 스키마 아님
   public int? bestSeconds,bestScore;public string bestRank;   // previous best record; null = none (first clear: best = this run)
  }
  [Serializable] sealed class Tok {public string n;public float x,y,w,h,adv,pad,cy;}
  [Serializable] sealed class Variant {public string title,titleEn,sub,button,titleSuffix;public string[] names;}
  [Serializable] sealed class Labels {public string clearTime,par,score,newRecord,kills,regions,boss,timeBonus,noDeath,noHit,combo,deathPenalty,best;}
  [Serializable] sealed class Stats {public string kills,maxCombo,deaths,crits,parries,potions,dmgDealt,dmgTaken,maxHit,dash,walk,timeAttack,ok,miss,best,times;}
  [Serializable] sealed class Formula {public int parBase;public float parPerSpawn;public int parScoreBase,parScorePerSpawn,killScore,regionScore,bossScore,timeBonusPerSec,noDeathScore,noHitScore,comboScore,deathPenalty;}
  [Serializable] sealed class Timing {public float fade;}
  [Serializable] sealed class Defs {public Variant zone,hell,demo;public Labels labels;public Stats stats;public string[] badges;public Formula formula;public Timing timing;public Tok[] atlas;}
  const string NotPorted="미이식";
  readonly Defs defs;readonly Dictionary<string,Tok> tok=new Dictionary<string,Tok>();
  Texture2D atlas,radial,diamond,materialForge,materialIron;Font nanum,sansSemi,cinzelDec;bool ready;readonly Dictionary<(Font,int,bool),GUIStyle> styles=new Dictionary<(Font,int,bool),GUIStyle>();
  Input input;bool active;float start;public float? ForcedAge;public Action OnNext;
  public bool Active{get{return active;}}
  public Input CurrentInput{get{return input;}}
  public string LocaleCode="ko";public bool DiagnosticDetails=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-diagnostics")>=0;public int LayoutOverflowCount{get;private set;}
  readonly NativeStageClearPresentation.NextAction nextAction=new NativeStageClearPresentation.NextAction();
  bool keyboardReady;
  public NativeStageClearPresentation.Layout LastLayout{get;private set;}
  public Rect ButtonScreenRect{get{if(DiagnosticDetails){float ds=Mathf.Min(1f,Mathf.Min(Screen.width/1280f,Screen.height/900f));return new Rect((Screen.width-1920*ds)/2+850*ds,Screen.height-1080*ds+956*ds,220*ds,44*ds);}var l=NativeStageClearPresentation.Arrange(Screen.width,Screen.height,PresentationModel());return new Rect(l.Next.X,l.Next.Y,l.Next.Width,l.Next.Height);}}
  public bool RequestNext(){return nextAction.Request(active,Age,OnNext);}
  public Kind ShownKind{get{return input.kind;}}
  // B11: the "물약 N회" stat is G._sStats.potions = AutoPotionState.PotionsUsed (Unity value; null stays 미이식 for callers without a potion state)
  public static Input WithAutoPotion(Input input,Exoduser.UnityPort.Core.AutoPotionState potion){if(potion!=null)input.potions=potion.PotionsUsed;return input;}

  public NativeStageClearOverlay(){
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/stageclear_web").text);
   foreach(var t in defs.atlas)tok[t.n]=t;
  }
  float Now{get{return Time.unscaledTime;}}
  float Age{get{return ForcedAge.HasValue?ForcedAge.Value:Now-start;}}
  public void Show(Input value){
   // web: _DEMO_MODE && G.stage===_DEMO_LAST_STAGE -> demo-end sub/button (BuildFlavor holds the definition; full/ea keep the zone texts)
   if(value.kind==Kind.Zone&&value.stageIndex.HasValue&&BuildFlavor.Current.DemoEndAtStage(value.stageIndex.Value))value.kind=Kind.DemoEnd;
   input=value;active=true;start=Now;nextAction.Reset();keyboardReady=false;
  }
  public void Hide(){active=false;}

  // ---- web formulas (game.html 42015-42057) ----
  public int ParSeconds(int total){return (int)Math.Round(defs.formula.parBase+total*defs.formula.parPerSpawn,MidpointRounding.AwayFromZero);}
  public int ParScore(int total){return total*defs.formula.parScorePerSpawn+defs.formula.parScoreBase;}
  public string Rank(int clearSec,int parSec,int score,int parScore,int deaths){
   double ratio=parSec>0?(double)clearSec/parSec:9;int rp=0;
   rp+=ratio<=.7?3:ratio<=1.0?2:ratio<=1.5?1:0;rp+=score>=parScore?2:score>=parScore*.6?1:0;if(deaths==0)rp+=1;
   return rp>=6?"S":rp>=4?"A":rp>=3?"B":rp>=2?"C":"D";
  }
  struct Score {public int? kills,regions,boss,timeBonus,noDeath,noHit,combo,deathPen,total;}
  Score Compute(Input i,int? par){
   var f=defs.formula;var s=new Score();
   if(i.stageKills.HasValue)s.kills=i.stageKills.Value*f.killScore;
   if(i.regionsCleared.HasValue)s.regions=i.regionsCleared.Value*f.regionScore;
   if(i.bossKilled.HasValue)s.boss=i.bossKilled.Value?f.bossScore:0;
   if(i.clearSeconds.HasValue&&par.HasValue)s.timeBonus=Math.Max(0,par.Value-i.clearSeconds.Value)*f.timeBonusPerSec;
   if(i.deaths.HasValue){s.noDeath=i.deaths.Value==0?f.noDeathScore:0;s.deathPen=i.deaths.Value*f.deathPenalty;}
   if(i.dmgTaken.HasValue)s.noHit=i.dmgTaken.Value==0?f.noHitScore:0;
   if(i.comboMax.HasValue)s.combo=i.comboMax.Value*f.comboScore;
   if(s.kills.HasValue&&s.regions.HasValue&&s.boss.HasValue&&s.timeBonus.HasValue&&s.noDeath.HasValue&&s.noHit.HasValue&&s.combo.HasValue)
    s.total=Math.Max(0,s.kills.Value+s.regions.Value+s.boss.Value+s.timeBonus.Value+s.noDeath.Value+s.noHit.Value+s.combo.Value-s.deathPen.Value);
   return s;
  }

  // ---- resources / primitives ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;
   atlas=Resources.Load<Texture2D>("Art/ui/clear/clear_atlas");nanum=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
   sansSemi=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");cinzelDec=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold")??nanum;
   materialForge=Resources.Load<Texture2D>("Art/ui/forge/window_base");materialIron=Resources.Load<Texture2D>("Art/ui/inventory/iron_480");
   const int n=128;radial=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=(x+.5f)/n*2-1,dy=(y+.5f)/n*2-1;px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(dx*dx+dy*dy)));}
   radial.SetPixels(px);radial.Apply(false,true);
   // diamond (rotated square) mask, anti-aliased: |x|+|y| <= 1
   const int m=128;diamond=new Texture2D(m,m,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var dp=new Color[m*m];
   for(int y=0;y<m;y++)for(int x=0;x<m;x++){float u=(Mathf.Abs(x+.5f-m/2f)+Mathf.Abs(y+.5f-m/2f))/(m/2f);dp[y*m+x]=new Color(1,1,1,Mathf.Clamp01((1f-u)*m*.35f+.5f));}
   diamond.SetPixels(dp);diamond.Apply(false,true);
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y+1,1,r.height-2),c);Fill(new Rect(r.xMax-1,r.y+1,1,r.height-2),c);}
  Texture2D Gradient(Color a,Color b,bool horizontal){
   var t=new Texture2D(horizontal?32:1,horizontal?1:32,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)t.SetPixel(horizontal?i:0,horizontal?0:31-i,Color.Lerp(a,b,i/31f));t.Apply(false,true);return t;
  }
  readonly Dictionary<string,Texture2D> gradients=new Dictionary<string,Texture2D>();
  void Grad(Rect r,Color a,Color b,bool horizontal=false){
   string key=ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+(horizontal?"h":"v");
   if(!gradients.TryGetValue(key,out var t)){t=Gradient(a,b,horizontal);gradients[key]=t;}GUI.DrawTexture(r,t);
  }
  GUIStyle Style(Font f,int size,bool bold){
   var key=(f,size,bold);
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=f,fontSize=size,fontStyle=bold?FontStyle.Bold:FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  float Width(Font f,int size,string text,float ls,bool bold=false){var st=Style(f,size,bold);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  float Text(float x,float y,float h,string text,Font f,int size,Color c,float ls,bool bold=false,float shadow=0){
   var st=Style(f,size,bold);float w=0;
   foreach(char ch in text){
    var g=ch.ToString();float cw=st.CalcSize(new GUIContent(g)).x;
    if(shadow>0){st.normal.textColor=new Color(0,0,0,shadow*c.a);GUI.Label(new Rect(x+w,y+1,60,h),g,st);}
    st.normal.textColor=c;GUI.Label(new Rect(x+w,y,60,h),g,st);w+=cw+ls;
   }
   return w;
  }
  void CenterText(float cx,float y,float h,string text,Font f,int size,Color c,float ls,bool bold=false,float shadow=0){
   float w=Width(f,size,text,ls,bold);Text(cx-w/2f,y,h,text,f,size,c,ls,bold,shadow);
  }
  // Cinzel crops (web render): size key 9 / 13 / 17 / 20. Returns the advance sum (+ letter spacing).
  float CinzelWidth(int size,string text,float ls){float w=0;foreach(char ch in text){if(tok.TryGetValue("c"+size+":"+ch,out var t))w+=t.adv+ls;}return w;}
  float Cinzel(int size,string text,float x,float cy,Color c,float ls=0){
   var old=GUI.color;float w=0;
   foreach(char ch in text){
    if(!tok.TryGetValue("c"+size+":"+ch,out var t))continue;
    GUI.color=c;GUI.DrawTextureWithTexCoords(new Rect(x+w-t.pad,cy-t.cy,t.w,t.h),atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));w+=t.adv+ls;
   }
   GUI.color=old;return w;
  }
  void Glyph(string name,float x,float cy,Color c){
   if(!tok.TryGetValue(name,out var t))return;var old=GUI.color;GUI.color=c;GUI.DrawTextureWithTexCoords(new Rect(x-t.pad,cy-t.cy,t.w,t.h),atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));GUI.color=old;
  }
  float GlyphAdv(string name){return tok.TryGetValue(name,out var t)?t.adv:0;}
  static string Num(int n){return Math.Max(0,n).ToString("N0",CultureInfo.InvariantCulture);}
  static string MS(int sec){sec=Math.Max(0,sec);return (sec/60)+":"+(sec%60<10?"0":"")+(sec%60);}
  Color RankColor(string r){switch(r){case "S":return C(227,194,122);case "A":return C(169,200,164);case "B":return C(157,184,204);case "C":return C(194,182,169);default:return C(141,124,101);}}

  List<NativeStageClearMaterialLayout.Patch> materialPlanCache;float materialPlanHeight=-1;
  public bool MaterialReady{get{return materialForge!=null&&materialIron!=null&&materialForge.width==980&&materialForge.height==1056&&materialIron.width==480&&materialIron.height==480;}}
  public int MaterialPieces{get;private set;}public Rect MaterialFrameScreenRect{get;private set;}
  void DrawMaterial(List<NativeStageClearMaterialLayout.Patch> patches,bool button,bool hover,float alpha){var oldColor=GUI.color;foreach(var p in patches){if(p.Button!=button)continue;var t=p.Iron?materialIron:materialForge;float tint=p.Tint*(hover&&button?1.2f:1f);GUI.color=new Color(tint,tint,tint,alpha);GUI.DrawTextureWithTexCoords(new Rect(p.X,p.Y,p.W,p.H),t,new Rect(p.Sx/t.width,1-(p.Sy+p.Sh)/t.height,p.Sw/t.width,p.Sh/t.height));}GUI.color=oldColor;}

  // ---- window ----
  [Serializable] sealed class LocaleRow {public string code,title,hellTitle,sub,time,kills,reward,sp,regions,potions,deaths,score,next,demoSub,demoNext;}
  [Serializable] sealed class LocaleBundle {public LocaleRow[] entries;}
  readonly Dictionary<string,LocaleRow> localeRows=new Dictionary<string,LocaleRow>();Font japanese,latin;
  public bool AuditText;public int MissingGlyphs{get;private set;}public readonly List<string> VisibleTexts=new List<string>();
  string EffectiveLocale{get{string c=Exoduser.UnityPort.Core.LobbyLanguage.Normalize(LocaleCode);return c=="ar"?"en":c;}}
  LocaleRow CurrentLabels(){
   if(localeRows.Count==0){var asset=Resources.Load<TextAsset>("Data/stageclear_labels");if(asset!=null){var b=JsonUtility.FromJson<LocaleBundle>(asset.text);foreach(var e in b.entries)localeRows[e.code]=e;}}
   LocaleRow row;if(localeRows.TryGetValue(EffectiveLocale,out row))return row;if(localeRows.TryGetValue("en",out row))return row;
   return new LocaleRow{title="ZONE CLEARED",hellTitle="HELL ESCAPED",sub="Prepare, then continue",time="Clear time",kills="Kills",reward="Reward",sp="Stat points",regions="Regions cleared",potions="Potions",deaths="Deaths",score="Score",next="Return to lobby",demoSub="You conquered the Rotten Forest.",demoNext="End demo"};
  }
  Font BodyFont(){if(EffectiveLocale=="ja"){if(japanese==null)japanese=Resources.Load<Font>("Art/fonts/NotoSerifCJKjp-Regular");return japanese??nanum;}if(EffectiveLocale=="ko"||EffectiveLocale=="en")return nanum;if(latin==null)latin=Resources.Load<Font>("Art/fonts/NativeCaptionNotoSerif");return NativeA15SettingsLabels.FontForLocale(EffectiveLocale,latin??nanum);}
  public NativeStageClearPresentation.Model PresentationModel(){
   int? par=input.totalSpawned.HasValue?ParSeconds(input.totalSpawned.Value):(int?)null;var score=Compute(input,par);string rank=null;
   if(score.total.HasValue&&input.clearSeconds.HasValue&&par.HasValue&&input.deaths.HasValue&&input.totalSpawned.HasValue)rank=Rank(input.clearSeconds.Value,par.Value,score.total.Value,ParScore(input.totalSpawned.Value),input.deaths.Value);
   return NativeStageClearPresentation.Build(new NativeStageClearPresentation.Summary{Kills=input.stageKills,Total=input.totalSpawned,Seconds=input.clearSeconds,SpAwarded=input.statPointsAwarded,SpBalance=input.statPointsBalance,Regions=input.regionsCleared,Potions=input.potions,Deaths=input.deaths,Score=score.total,Rank=rank});
  }
  void Paint(Rect r,string text,Font f,int size,Color color,TextAnchor align=TextAnchor.MiddleCenter,bool bold=false){
   if(string.IsNullOrEmpty(text))return;if(AuditText){VisibleTexts.Add(text);foreach(char ch in text)if(!char.IsWhiteSpace(ch)&&!f.HasCharacter(ch))MissingGlyphs++;}GUIStyle s=null;int current=size;
   while(current>=12){s=Style(f,current,bold);s.wordWrap=true;s.alignment=align;if(s.CalcHeight(new GUIContent(text),r.width)<=r.height+.5f)break;current--;}
   if(s.CalcHeight(new GUIContent(text),r.width)>r.height+.5f)LayoutOverflowCount++;
   s.normal.textColor=new Color(0,0,0,color.a*.8f);GUI.Label(new Rect(r.x,r.y+1,r.width,r.height),text,s);s.normal.textColor=color;GUI.Label(r,text,s);
  }
  static string RowLabel(LocaleRow l,string key){switch(key){case "time":return l.time;case "kills":return l.kills;case "reward":return l.reward;case "sp":return l.sp;case "regions":return l.regions;case "potions":return l.potions;case "deaths":return l.deaths;default:return l.score;}}
  public void Draw(){
   if(!active)return;Init();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try{
    float a=Mathf.SmoothStep(0,1,Mathf.Clamp01(Age/defs.timing.fade));GUI.matrix=Matrix4x4.identity;GUI.color=Color.white;LayoutOverflowCount=0;MissingGlyphs=0;VisibleTexts.Clear();
    if(DiagnosticDetails){
     float ds=Mathf.Min(1f,Mathf.Min(Screen.width/1280f,Screen.height/900f));GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*ds)/2,Screen.height-1080*ds,0),Quaternion.identity,Vector3.one*ds);Layout(a);GUI.matrix=Matrix4x4.identity;
     Paint(new Rect(16,16,Mathf.Max(1,Screen.width-32),32),"진단 모드 · 원본 점수/통계 입력 상태",BodyFont(),16,C(255,190,120),TextAnchor.MiddleLeft);return;
    }
    var m=PresentationModel();var l=NativeStageClearPresentation.Arrange(Screen.width,Screen.height,m);LastLayout=l;var labels=CurrentLabels();var body=BodyFont();
    Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,.68f*a));
    GUI.matrix=Matrix4x4.TRS(new Vector3(l.Panel.X,l.Panel.Y,0),Quaternion.identity,Vector3.one*l.Scale);
    float materialButtonY=(l.Next.Y-l.Panel.Y)/l.Scale;
     if(materialPlanCache==null||materialPlanHeight!=l.LogicalHeight){materialPlanCache=NativeStageClearMaterialLayout.Plan(560,l.LogicalHeight,new NativeStageClearPresentation.Area(28,materialButtonY,504,56));materialPlanHeight=l.LogicalHeight;}var materialPlan=materialPlanCache;
     MaterialPieces=MaterialReady?materialPlan.Count:0;var materialBounds=l.ToScreen(-16,-16,592,l.LogicalHeight+32);MaterialFrameScreenRect=new Rect(materialBounds.X,materialBounds.Y,materialBounds.Width,materialBounds.Height);
     if(MaterialReady)DrawMaterial(materialPlan,false,false,a);
     else{GUI.color=new Color(1,1,1,a);Grad(new Rect(0,0,560,l.LogicalHeight),C(20,14,11,.96f),C(8,6,5,.98f));GUI.color=Color.white;Border(new Rect(0,0,560,l.LogicalHeight),C(128,109,78,.65f*a));}
     string title=input.kind==Kind.HellEscape?(EffectiveLocale=="ko"&&input.hellIndex>=0&&input.hellIndex<defs.hell.names.Length?defs.hell.names[input.hellIndex]+defs.hell.titleSuffix:labels.hellTitle):labels.title;
    string caption=input.kind==Kind.HellEscape?defs.hell.titleEn:defs.zone.titleEn;
     if(!string.Equals(caption,title,StringComparison.OrdinalIgnoreCase))Paint(new Rect(28,26,504,22),caption,cinzelDec,12,C(177,157,120,a));
    Paint(new Rect(28,55,504,56),title,body,34,C(236,222,197,a),TextAnchor.MiddleCenter,true);
    Paint(new Rect(40,115,480,38),input.kind==Kind.DemoEnd?labels.demoSub:labels.sub,body,16,C(187,174,153,a));
    int metricCount=Math.Max(1,m.Metrics.Count);float metricWidth=504f/metricCount;
    for(int k=0;k<m.Metrics.Count;k++){var metric=m.Metrics[k];float x=28+k*metricWidth;Paint(new Rect(x,169,metricWidth,24),RowLabel(labels,metric.Key),body,16,C(182,165,137,a));Paint(new Rect(x,198,metricWidth,58),metric.Value,cinzelDec,metric.Key=="time"?44:34,C(236,222,197,a),TextAnchor.MiddleCenter,true);}
    Fill(new Rect(28,267,504,1),C(128,109,78,.4f*a));
    if(m.Reward!=null){Paint(new Rect(40,l.RewardY+8,250,32),RowLabel(labels,m.Reward.Key),body,19,C(208,190,156,a),TextAnchor.MiddleLeft);Paint(new Rect(286,l.RewardY+3,234,48),m.Reward.Value,cinzelDec,34,C(227,194,122,a),TextAnchor.MiddleRight,true);}
    if(m.Score!=null){Paint(new Rect(40,l.ScoreY+2,240,38),labels.score,body,17,C(190,174,147,a),TextAnchor.MiddleLeft);Paint(new Rect(282,l.ScoreY+2,238,38),m.Score+"  ·  "+m.Rank,cinzelDec,24,C(227,194,122,a),TextAnchor.MiddleRight);}
    for(int k=0;k<m.Details.Count;k++){var row=m.Details[k];float y=l.DetailY+k*30;Paint(new Rect(40,y,350,28),RowLabel(labels,row.Key),body,16,C(181,168,146,a),TextAnchor.MiddleLeft);Paint(new Rect(410,y,110,28),row.Value,cinzelDec,18,C(221,208,184,a),TextAnchor.MiddleRight);}
    float nextY=(l.Next.Y-l.Panel.Y)/l.Scale;var buttonRect=new Rect(28,nextY,504,56);bool hover=buttonRect.Contains(Event.current.mousePosition);
    if(MaterialReady)DrawMaterial(materialPlan,true,hover,a);else{GUI.color=new Color(1,1,1,a);Grad(buttonRect,hover?C(95,44,32):C(73,33,25),C(29,12,9));GUI.color=Color.white;Border(buttonRect,C(164,111,73,a));}
     Paint(new Rect(46,nextY+4,468,48),input.kind==Kind.DemoEnd?labels.demoNext:labels.next,body,20,C(239,216,184,a),TextAnchor.MiddleCenter,true);
    if(!ExoInput.Key(KeyCode.Return)&&!ExoInput.Key(KeyCode.KeypadEnter)&&!ExoInput.Key(KeyCode.Space))keyboardReady=true;
    GUI.enabled=enabled&&Age>=.5f&&OnNext!=null;
    if(GUI.Button(buttonRect,GUIContent.none,GUIStyle.none))RequestNext();
    if(GUI.enabled&&keyboardReady&&Event.current.type==EventType.KeyDown&&(Event.current.keyCode==KeyCode.Return||Event.current.keyCode==KeyCode.KeypadEnter||Event.current.keyCode==KeyCode.Space)){Event.current.Use();RequestNext();}
   }finally{GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }

  void Layout(float a){
   var i=input;var v=i.kind==Kind.HellEscape?defs.hell:defs.zone;
   int? par=i.totalSpawned.HasValue?ParSeconds(i.totalSpawned.Value):(int?)null;
   var sc=Compute(i,par);
   // rows of the result grid (web order: 처치, 지역 정화, 보스 처치, 시간 보너스, [무사망], [무피격], 최대콤보, [사망 감점])
   var rows=new List<KeyValuePair<string,KeyValuePair<string,bool>>>();
   void Row(string label,int? value,bool neg=false){rows.Add(new KeyValuePair<string,KeyValuePair<string,bool>>(label,new KeyValuePair<string,bool>(value.HasValue?Num(value.Value):NotPorted,neg&&value.HasValue)));}
   var L=defs.labels;
   Row(L.kills,sc.kills);Row(L.regions,sc.regions);Row(L.boss,sc.boss);Row(L.timeBonus,sc.timeBonus);
   if(!i.deaths.HasValue||sc.noDeath.HasValue&&sc.noDeath.Value>0)Row(L.noDeath,sc.noDeath);
   if(!i.dmgTaken.HasValue||sc.noHit.HasValue&&sc.noHit.Value>0)Row(L.noHit,sc.noHit);
   Row(L.combo,sc.combo);
   if(sc.deathPen.HasValue&&sc.deathPen.Value>0)Row(L.deathPenalty,sc.deathPen,true);
   int gridRows=(rows.Count+1)/2;float gridH=gridRows*22+(gridRows-1)*2,resultH=1+12+1+10+68+11+gridH+9+27+12+1;
   var stats=BuildStats(i);int statLines=stats.Count;float statsH=statLines*17.952f;
   // bottom anchored: button 956..1000, stats above (margin 10), result above stats (margin 12), sub/title above the result
   float btnY=956,statsY=btnY-10-statsH,resultY=statsY-12-resultH,subY=resultY-28,enY=subY-21,titleY=enY-32;
   // ---- title (#clearTitle: Cinzel Decorative/Nanum 700 20.8px, ls .18em, side rules) ----
   string title=i.kind==Kind.HellEscape?(i.hellIndex>=0&&i.hellIndex<defs.hell.names.Length?defs.hell.names[i.hellIndex]:NotPorted)+defs.hell.titleSuffix:v.title;
   float lockW=i.kind==Kind.HellEscape?GlyphAdv("g:lock")+6:0;float tw=Width(nanum,21,title,3.744f,true)+lockW;
   float tx=960-tw/2f;
   if(lockW>0){Glyph("g:lock",tx,titleY+14,new Color(1,1,1,a));tx+=lockW;}
   Text(tx,titleY,28,title,nanum,21,C(230,214,185,.95f*a),3.744f,true,.95f*a);
   float boxL=960-(tw+72)/2f,boxR=960+(tw+72)/2f;
   GUI.color=new Color(1,1,1,a);Grad(new Rect(boxL,titleY+14.5f,28,1),C(164,147,115,0),C(164,147,115,.54f),true);Grad(new Rect(boxR-28,titleY+14.5f,28,1),C(164,147,115,.54f),C(164,147,115,0),true);GUI.color=Color.white;
   // ---- ZONE CLEARED (Cinzel 9.6px, ls .34em) ----
   string en=i.kind==Kind.HellEscape?defs.hell.titleEn:defs.zone.titleEn;float ew=CinzelWidth(9,en,3.264f);Cinzel(9,en,960-ew/2f,enY+6.5f,C(168,153,127,.72f*a),3.264f);
   // ---- sub (14.08px Nanum, ls .12em) ----
   string sub=i.kind==Kind.DemoEnd?(BuildFlavor.Current.DemoEndSub(false)??defs.demo.sub):v.sub;CenterText(960,subY,18,sub,nanum,14,C(199,187,172,.88f*a),1.6896f);
   // ---- result block ----
   DrawResult(resultY,resultH,a,i,sc,par,rows,gridRows);
   // ---- stats lines ----
   float y=statsY;foreach(var line in stats){DrawStatLine(960,y,line,a);y+=17.952f;}
   // ---- next button ----
   string btn=i.kind==Kind.DemoEnd?(BuildFlavor.Current.DemoEndButton(false)??defs.demo.button):v.button;DrawButton(new Rect(850,btnY,220,44),btn,a);
  }

  void DrawResult(float y,float h,float a,Input i,Score sc,int? par,List<KeyValuePair<string,KeyValuePair<string,bool>>> rows,int gridRows){
   var r=new Rect(776,y,368,h);
   // background gradient, 1px border rgba(102,94,80,.5), inset glow, drop shadow
   GUI.color=new Color(0,0,0,.35f*a);GUI.DrawTexture(new Rect(r.x-14,r.y-6,r.width+28,r.height+30),radial);GUI.color=Color.white;
   GUI.color=new Color(1,1,1,a);Grad(r,C(18,11,8,.92f),C(8,5,4,.94f));GUI.color=Color.white;
   Border(r,C(102,94,80,.5f*a));
   GUI.color=new Color(0,0,0,.30f*a);Fill(new Rect(r.x+1,r.y+1,r.width-2,14),new Color(0,0,0,.18f*a));GUI.color=Color.white;
   // divider
   GUI.color=new Color(1,1,1,a);Grad(new Rect(828,y+13,132,1),C(164,147,115,0),C(164,147,115,.5f),true);Grad(new Rect(960,y+13,132,1),C(164,147,115,.5f),C(164,147,115,0),true);GUI.color=Color.white;
   // crest (68x68) at x799, y+24: rotated squares + rank letter
   float cy0=y+24;bool rankOk=sc.total.HasValue&&i.clearSeconds.HasValue&&par.HasValue&&i.deaths.HasValue&&i.totalSpawned.HasValue;
   string rank=rankOk?Rank(i.clearSeconds.Value,par.Value,sc.total.Value,ParScore(i.totalSpawned.Value),i.deaths.Value):null;
   var rc=rank!=null?RankColor(rank):C(141,124,101);
   Diamond(new Vector2(833,cy0+34),35.355f,C(164,147,115,.6f*a),C(34,22,15,.92f*a),C(10,7,5,.95f*a));
   Diamond(new Vector2(833,cy0+34),28.284f,C(66,52,38,.85f*a),Color.clear,Color.clear);
   if(rank!=null){var st=Style(cinzelDec,30,false);st.normal.textColor=new Color(rc.r,rc.g,rc.b,a);float rw=st.CalcSize(new GUIContent(rank)).x;GUI.Label(new Rect(833-rw/2f,cy0+34-15,rw+8,30),rank,st);}
   else CenterText(833,cy0+34-9,18,NotPorted,nanum,11,C(141,124,101,a),0);
   // clear time + par, score
   var L=defs.labels;float tx=891,ty=y+30.5f;
   Text(tx,ty+6,16,L.clearTime,nanum,13,C(207,195,176,a),2.34f);float lw=Width(nanum,13,L.clearTime,2.34f);float vx=tx+lw+10;
   if(i.clearSeconds.HasValue)vx+=Cinzel(17,MS(i.clearSeconds.Value),vx,ty+12,C(230,214,185,a))+10;else vx+=Text(vx,ty+4,24,NotPorted,nanum,14,C(230,214,185,a),0)+10;
   if(par.HasValue)Text(vx,ty+6,15,L.par+" "+MS(par.Value),nanum,12,C(168,152,127,a),.96f);
   float sy=y+57.5f;Text(tx,sy+9,16,L.score,nanum,13,C(207,195,176,a),2.34f);float sx=tx+Width(nanum,13,L.score,2.34f)+10;
   if(sc.total.HasValue)Cinzel(20,Num(sc.total.Value),sx,sy+14,C(230,214,185,a),.624f);else Text(sx,sy+2,28,NotPorted,nanum,16,C(230,214,185,a),0);
   // grid (2 columns x gridRows, 22px rows, 2px gap, dotted divider)
   float gy=y+103;
   for(int k=0;k<rows.Count;k++){
    float rx=k%2==0?818.31f:974f;float ry=gy+(k/2)*24;float cw=127.69f;
    GUI.color=new Color(164/255f,147/255f,115/255f,.16f*a);for(float dx=0;dx<cw;dx+=3)GUI.DrawTexture(new Rect(rx+dx,ry+21,1,1),Texture2D.whiteTexture);GUI.color=Color.white;
    Text(rx,ry+1.5f,18,rows[k].Key,nanum,13,C(197,184,163,a),1.04f);
    var val=rows[k].Value;var vcol=val.Value?C(168,119,106,a):C(201,189,166,a);
    if(val.Key==NotPorted){float w=Width(nanum,13,NotPorted,0);Text(rx+cw-w,ry+1.5f,18,NotPorted,nanum,13,vcol,0);}
    else{string t=(val.Value?"−":"")+val.Key;float w=CinzelWidth(13,val.Key,0)+(val.Value?Width(nanum,13,"−",0):0);float x=rx+cw-w;if(val.Value)x+=Text(x,ry+1.5f,18,"−",nanum,13,vcol,0);Cinzel(13,val.Key,x,ry+10.5f,vcol);}
   }
   // best row: border-top, "베스트 m:ss · score · rank"
   float by=gy+(gridRows*22+(gridRows-1)*2)+9;
   Fill(new Rect(828,by,264,1),C(164,147,115,.22f*a));
   var parts=new List<KeyValuePair<string,string>>();
   int? bt=i.bestSeconds??i.clearSeconds;int? bs=i.bestScore??sc.total;string br=i.bestRank??rank;
   float bx=0;float total=Width(nanum,13,L.best,2.6f)+12;
   string bTime=bt.HasValue?MS(bt.Value):NotPorted,bScore=bs.HasValue?Num(bs.Value):NotPorted,bRank=br??NotPorted;
   float wTime=bt.HasValue?CinzelWidth(13,bTime,0):Width(nanum,13,bTime,0),wScore=bs.HasValue?CinzelWidth(13,bScore,0):Width(nanum,13,bScore,0),wRank=br!=null?Style(cinzelDec,13,false).CalcSize(new GUIContent(bRank)).x:Width(nanum,13,bRank,0);
   float dot=3.64f;total+=wTime+12+dot+12+wScore+12+dot+12+wRank;bx=960-total/2f;
   bx+=Text(bx,by+7,16,L.best,nanum,13,C(197,184,163,a),2.6f)+12;
   if(bt.HasValue)bx+=Cinzel(13,bTime,bx,by+16,C(201,189,166,a));else bx+=Text(bx,by+7,16,bTime,nanum,13,C(201,189,166,a),0);
   bx+=12;bx+=Text(bx,by+7,16,"·",nanum,13,C(164,147,115,.5f*a),0)+12;
   if(bs.HasValue)bx+=Cinzel(13,bScore,bx,by+16,C(201,189,166,a));else bx+=Text(bx,by+7,16,bScore,nanum,13,C(201,189,166,a),0);
   bx+=12;bx+=Text(bx,by+7,16,"·",nanum,13,C(164,147,115,.5f*a),0)+12;
   if(br!=null){var st=Style(cinzelDec,13,false);var c=RankColor(br);st.normal.textColor=new Color(c.r,c.g,c.b,a);GUI.Label(new Rect(bx,by+7,40,16),bRank,st);}else Text(bx,by+7,16,bRank,nanum,13,C(201,189,166,a),0);
  }
  void Diamond(Vector2 center,float half,Color border,Color fill1,Color fill2){
   float s=half*2;var rect=new Rect(center.x-half,center.y-half,s,s);var old=GUI.color;
   if(fill1.a>0){GUI.color=border;GUI.DrawTexture(rect,diamond);float inner=s-3f;GUI.color=Color.Lerp(fill1,fill2,.5f);GUI.DrawTexture(new Rect(center.x-inner/2,center.y-inner/2,inner,inner),diamond);}
   else{GUI.color=border;GUI.DrawTexture(rect,diamond);float inner=s-3f;GUI.color=new Color(10/255f,7/255f,5/255f,.95f*border.a);GUI.DrawTexture(new Rect(center.x-inner/2,center.y-inner/2,inner,inner),diamond);}
   GUI.color=old;
  }

  // ---- #clearStats: 10.88px Nanum, line-height 1.65, centred, values #bcab90, separators rgba(164,147,115,.45) ----
  struct Seg {public string text;public bool value;public bool sep;public bool badge;public Color? color;}
  List<List<Seg>> BuildStats(Input i){
   var S=defs.stats;var lines=new List<List<Seg>>();
   Seg T(string t){return new Seg{text=t};}Seg V(string t){return new Seg{text=t,value=true};}Seg D(){return new Seg{text="·",sep=true};}
   string P(int? n,string suffix=""){return n.HasValue?n.Value+suffix:NotPorted;}
   string Nn(int? n){return n.HasValue?Num(n.Value):NotPorted;}
   int? pct=i.stageKills.HasValue&&i.totalSpawned.HasValue&&i.totalSpawned.Value>0?(int)Math.Floor((double)i.stageKills.Value/i.totalSpawned.Value*100):(int?)null;
   var l1=new List<Seg>{T(S.kills+" "),V(i.stageKills.HasValue&&i.totalSpawned.HasValue?i.stageKills.Value+"/"+i.totalSpawned.Value:NotPorted)};
   if(pct.HasValue)l1.Add(T(" ("+pct.Value+"%)"));l1.Add(D());l1.Add(V(i.clearSeconds.HasValue?MS(i.clearSeconds.Value):NotPorted));l1.Add(D());l1.Add(T(S.maxCombo+" "));l1.Add(V(P(i.comboMax)));lines.Add(l1);
   lines.Add(new List<Seg>{T(S.deaths+" "),V(P(i.deaths,S.times)),D(),T(S.crits+" "),V(P(i.crits,S.times)),D(),T(S.parries+" "),V(P(i.parries,S.times)),D(),T(S.potions+" "),V(P(i.potions,S.times))});
   lines.Add(new List<Seg>{T(S.dmgDealt+" "),V(Nn(i.dmgDealt)),D(),T(S.dmgTaken+" "),V(Nn(i.dmgTaken)),D(),T(S.maxHit+" "),V(Nn(i.maxHit))});
   lines.Add(new List<Seg>{T(S.dash+" "),V(i.dashCount.HasValue&&i.dashMeters.HasValue?i.dashCount.Value+S.times+" ("+i.dashMeters.Value+"m)":NotPorted),D(),T(S.walk+" "),V(i.walkMeters.HasValue?i.walkMeters.Value+"m":NotPorted)});
   var ta=new List<Seg>();
   if(pct.HasValue)ta.Add(new Seg{text=S.timeAttack+" "+(pct.Value>=90?"✓ "+S.ok:"✗ "+S.miss),color=pct.Value>=90?C(169,200,164):C(141,124,101)});else ta.Add(new Seg{text=S.timeAttack+" "+NotPorted,color=C(141,124,101)});
   ta.Add(D());ta.Add(T(S.best+" "));ta.Add(V(i.bestSeconds.HasValue?MS(i.bestSeconds.Value):NotPorted));lines.Add(ta);
   // badges: only those Unity state can prove
   var badges=new List<string>();var B=defs.badges;
   if(i.deaths.HasValue&&i.deaths.Value==0)badges.Add(B[0]);
   if(pct.HasValue){if(pct.Value>=100)badges.Add(B[1]);else if(pct.Value>=90)badges.Add(B[2]);}
   if(i.comboMax.HasValue){if(i.comboMax.Value>=50)badges.Add(B[3]);else if(i.comboMax.Value>=20)badges.Add(B[4]);}
   if(i.parries.HasValue){if(i.parries.Value>=30)badges.Add(B[5]);else if(i.parries.Value>=10)badges.Add(B[6]);}
   if(i.clearSeconds.HasValue&&i.clearSeconds.Value<=180)badges.Add(B[7]);
   if(i.potions.HasValue&&i.potions.Value==0)badges.Add(B[8]);
   if(i.dmgTaken.HasValue&&i.dmgTaken.Value==0)badges.Add(B[9]);
   if(i.dashCount.HasValue&&i.dashCount.Value>=30)badges.Add(B[10]);
   if(i.crits.HasValue&&i.crits.Value>=50)badges.Add(B[11]);
   if(badges.Count>0){var bl=new List<Seg>();for(int k=0;k<badges.Count;k++){if(k>0)bl.Add(D());bl.Add(new Seg{text=badges[k],badge=true,color=C(179,157,114)});}lines.Add(bl);}
   return lines;
  }
  void DrawStatLine(float cx,float y,List<Seg> line,float a){
   const float ls=.4352f;var baseCol=C(154,138,114);var valCol=C(188,171,144);var sepCol=C(164,147,115,.45f);
   float total=0;var widths=new List<float>();
   foreach(var sg in line){float w=Width(nanum,11,sg.text,sg.badge?1.3056f:ls);widths.Add(w+(sg.sep?4f:0));}
   foreach(var w in widths)total+=w;float x=cx-total/2f;
   for(int k=0;k<line.Count;k++){
    var sg=line[k];Color col=sg.sep?sepCol:sg.color.HasValue?sg.color.Value:sg.value?valCol:baseCol;float lsK=sg.badge?1.3056f:ls;
    if(sg.sep)x+=2;
    // ✓ ✗ are glyph crops (symbol fallback in the web render)
    string t=sg.text;int gi=t.IndexOf('✓');if(gi<0)gi=t.IndexOf('✗');
    if(gi>=0){string pre=t.Substring(0,gi);x+=Text(x,y,18,pre,nanum,11,new Color(col.r,col.g,col.b,col.a*a),lsK);string gn="g:"+t[gi];Glyph(gn,x,y+9,new Color(col.r,col.g,col.b,col.a*a));x+=GlyphAdv(gn)+lsK;x+=Text(x,y,18,t.Substring(gi+1),nanum,11,new Color(col.r,col.g,col.b,col.a*a),lsK);}
    else x+=Text(x,y,18,t,nanum,11,new Color(col.r,col.g,col.b,col.a*a),lsK);
    if(sg.sep)x+=2;
   }
  }
  void DrawButton(Rect r,string label,float a){
   bool hover=GUI.enabled&&r.Contains(Event.current.mousePosition);float k=hover?1.18f:1f;
   // #nextBtn: gradient #4b211c -> #210e0b, 1px #895346, inset 2px #0b0d09 ring, drop shadow
   GUI.color=new Color(0,0,0,.5f*a);GUI.DrawTexture(new Rect(r.x-8,r.y-2,r.width+16,r.height+14),radial);GUI.color=Color.white;
   GUI.color=new Color(Mathf.Min(1,k),Mathf.Min(1,k),Mathf.Min(1,k),a);Grad(r,C(75,33,28),C(33,14,11));GUI.color=Color.white;
   Border(r,new Color(137/255f*k,83/255f*k,70/255f*k,a));
   var ring=new Color(11/255f,13/255f,9/255f,a);Border(new Rect(r.x+1,r.y+1,r.width-2,r.height-2),ring);Border(new Rect(r.x+2,r.y+2,r.width-4,r.height-4),ring);
   var col=C(232,194,168,a);var st=Style(sansSemi,14,false);
   // "▶" is a glyph crop; the rest is Noto Sans KR SemiBold 14px, ls .14em
   int gi=label.IndexOf('▶');string pre=gi>=0?label.Substring(0,gi):label;float adv=gi>=0?GlyphAdv("g:▶")+1.96f:0;
   float w=Width(sansSemi,14,pre,1.96f)+adv;float x=960-w/2f;
   x+=Text(x,r.y,r.height,pre,sansSemi,14,col,1.96f);if(gi>=0)Glyph("g:▶",x,r.y+22,col);
   if(GUI.Button(r,GUIContent.none,GUIStyle.none))RequestNext();
  }
 }
}
