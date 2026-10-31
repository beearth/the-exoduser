using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web death screen (#death, game.html 3101 / CSS 646-663, shown by _fallenResolve 43851-43896) in the 1920x1080 design space:
 // full-screen still (cin_remember_wide), pulsing title, sub line, run info line, three buttons, two pet portraits with one speech line each,
 // damage log column. Definitions come from Data/death_web.json; every state value (kills, EXP loss, chapter, death count, combo, damage log)
 // is passed in by the caller from Unity, and a value Unity does not have is drawn as "미이식". The death replay (canvas recording) is shape only.
 public sealed class NativeDeathOverlay {
  public struct DmgEntry {public int amount;public string source;}
  public struct Info {
   public int kills;          // Simulation.Kills
   public int chapter;        // 0-based chapter index, -1 = unknown
   public int expLoss;        // EXP actually lost on death; -1 = Unity does not deduct EXP yet (shown as 미이식)
   public int maxCombo;       // -1 = Unity has no max-combo state
   public int deaths;         // deaths since the app started (web _ddDeaths)
   public bool retryBoss;     // web: boss arena finale shows "보스 재도전"
   public DmgEntry[] damageLog; // null = Unity has no damage log
  }
  [Serializable] sealed class Tok {public string n;public float x,y,w,h,adv,pad,cy;}
  [Serializable] sealed class PetLine {public string id,crow,cat;}
  [Serializable] sealed class InfoFmt {public string kills,exp,combo,sep;public string[] hell;}
  [Serializable] sealed class Timing {public float fade,titlePulse,titleMin,titleMax,lightAnim,petFade,petDelay,petRotate;}
  [Serializable] sealed class ReplayDef {public string label,skipText;}
  [Serializable] sealed class Defs {public string title,sub,retry,retryBoss,replay,lobby,dmgLogDead;public InfoFmt infoFormat;public Timing timing;public ReplayDef replayScreen;public PetLine[] petLines;public string[] petPool;public Tok[] atlas;}
  const string NotPorted="미이식";
  readonly Defs defs;readonly Dictionary<string,Tok> tok=new Dictionary<string,Tok>();readonly Dictionary<string,PetLine> lines=new Dictionary<string,PetLine>();
  Texture2D bg,crow,cat,atlas,radial;Font nanum,sans,sansBold;bool ready;
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  Info info;bool active;float start;string[] seq;int seqIdx;readonly System.Random rng=new System.Random(20261026);
  // Test hooks: deterministic clock and title pulse phase (web: animation runs from page load, so its phase is arbitrary).
  public float? ForcedAge;public float PulseOffset;
  public Action OnRetry,OnLobby;
  public bool Active{get{return active;}}
  public string CrowLine{get;private set;}
  public string CatLine{get;private set;}
  public string EventId{get;private set;}

  public NativeDeathOverlay(){
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/death_web").text);
   foreach(var t in defs.atlas)tok[t.n]=t;foreach(var l in defs.petLines)lines[l.id]=l;
  }
  float Now{get{return Time.unscaledTime;}}
  float Age{get{return ForcedAge.HasValue?ForcedAge.Value:Now-start;}}
  // Event pick (web _ddPickEvent 43795-43818): only the branches Unity state supports (death count, chapter). Boss / damage-source / combo branches need state Unity lacks.
  string PickEvent(){
   if(info.deaths<=1)return "dd_first";
   if(info.deaths>=10)return "dd_repeat10";
   if(info.deaths>=5)return "dd_repeat5";
   return "dd_ch"+Mathf.Clamp(info.chapter<0?0:info.chapter,0,6);
  }
  public void Show(Info value){
   info=value;active=true;start=Now;
   var list=new List<string>(defs.petPool);for(int i=list.Count-1;i>0;i--){int j=rng.Next(i+1);var t=list[i];list[i]=list[j];list[j]=t;}
   EventId=PickEvent();var s=new List<string>{EventId};s.AddRange(list);seq=s.ToArray();seqIdx=0;SetLine(0);
  }
  public void Hide(){active=false;}
  void SetLine(int i){var l=lines[seq[i%seq.Length]];CrowLine=l.crow;CatLine=l.cat;}

  // ---- resources ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;
   bg=Resources.Load<Texture2D>("Art/ui/death/cin_remember_wide");crow=Resources.Load<Texture2D>("Art/ui/death/crow_portrait");cat=Resources.Load<Texture2D>("Art/ui/death/cat_portrait");atlas=Resources.Load<Texture2D>("Art/ui/death/death_atlas");
   nanum=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");sans=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");sansBold=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Bold")??sans;
   const int n=128;radial=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=(x+.5f)/n*2-1,dy=(y+.5f)/n*2-1;px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(dx*dx+dy*dy)));}
   radial.SetPixels(px);radial.Apply(false,true);
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y+1,1,r.height-2),c);Fill(new Rect(r.xMax-1,r.y+1,1,r.height-2),c);}
  GUIStyle Style(Font f,int size,bool bold=false){
   long key=(((long)(f==nanum?1:f==sansBold?2:3)*1000+size)*2)+(bold?1:0);
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=f,fontSize=size,fontStyle=bold&&f==nanum?FontStyle.Bold:FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  // Browser ease-out for opacity (cubic-bezier(0,0,.58,1)) solved on x.
  static float EaseOut(float x){
   x=Mathf.Clamp01(x);float lo=0,hi=1,t=x;
   for(int i=0;i<24;i++){t=(lo+hi)/2;float bx=3*(1-t)*t*t*.58f+t*t*t;if(bx<x)lo=t;else hi=t;}
   return 3*(1-t)*t*t+t*t*t;
  }
  // Numeric probes for the capture receipt (compared with the web opacity series).
  public float DebugFade(float age){return EaseOut(age/defs.timing.fade);}
  public float DebugTitleOpacity(float age){return TitlePulse(age);}
  float TitlePulse(float age){
   var T=defs.timing;float ph=Mathf.Repeat(age+PulseOffset,T.titlePulse)/T.titlePulse;float seg=ph<.5f?ph*2:(1-ph)*2;float e=Mathf.SmoothStep(0,1,seg);
   return Mathf.Lerp(T.titleMin,T.titleMax,e);
  }

  // text: centred run list, letter-spaced, with optional shadow copies
  float Width(Font f,int size,string text,float ls,bool bold=false){var st=Style(f,size,bold);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  void PaintDeathGlyph(Rect box,string glyph,GUIStyle style,bool outline){bool previous=NativeUiAudit.DrawingTextShadow;string profile=NativeUiAudit.DrawingTextShadowProfile;try{if(outline){NativeUiAudit.DrawingTextShadow=true;NativeUiAudit.DrawingTextShadowProfile="death-black-outline";}NativeUiAudit.Label(box,glyph,style);}finally{NativeUiAudit.DrawingTextShadow=previous;NativeUiAudit.DrawingTextShadowProfile=profile;}}
  float Text(float x,float y,float h,string text,Font f,int size,Color c,float ls,float shadowAlpha=0,float shadowY=1,float shadowSpread=0,bool bold=false){
   var st=Style(f,size,bold);float w=0;
   foreach(char ch in text){
    var g=ch.ToString();float cw=st.CalcSize(new GUIContent(g)).x;
    if(shadowAlpha>0){
     st.normal.textColor=new Color(0,0,0,shadowAlpha*c.a);PaintDeathGlyph(new Rect(x+w,y+shadowY,60,h),g,st,shadowSpread>0);
     if(shadowSpread>0)foreach(var d in new[]{new Vector2(-1,0),new Vector2(1,0),new Vector2(0,-1),new Vector2(0,1)}){st.normal.textColor=new Color(0,0,0,shadowAlpha*.35f*c.a);PaintDeathGlyph(new Rect(x+w+d.x*shadowSpread,y+shadowY+d.y*shadowSpread,60,h),g,st,true);}
    }
    st.normal.textColor=c;PaintDeathGlyph(new Rect(x+w,y,60,h),g,st,false);w+=cw+ls;
   }
   return w;
  }
  void CenteredText(float cx,float y,float h,string text,Font f,int size,Color c,float ls,float shadowAlpha=0,float shadowSpread=0,bool bold=false){
   float w=Width(f,size,text,ls,bold);Text(cx-w/2f,y,h,text,f,size,c,ls,shadowAlpha,1,shadowSpread,bold);
  }
  void Sprite(Tok t,float x,float cy,Color c){
   var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTextureWithTexCoords(new Rect(x-t.pad,cy-t.cy,t.w,t.h),atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));GUI.color=old;
  }

  // ---- window ----
  public void Draw(){
   if(!active)return;Init();
   var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    float age=Age;float fade=EaseOut(age/defs.timing.fade);NativeUiViewport.FillScreen(new Color(0,0,0,fade));
    GUI.matrix=NativeUiViewport.Matrix;
    // background: "url(cin_remember_wide) center/cover" over the viewport; the dark radial gradient behind it is fully covered
    float sc=Mathf.Max(NativeUiSafeArea.DesignWidth/bg.width,NativeUiSafeArea.DesignHeight/bg.height);float iw=bg.width*sc,ih=bg.height*sc;
    GUI.color=new Color(1,1,1,fade);NativeUiAudit.DrawTexture(new Rect((NativeUiSafeArea.DesignWidth-iw)/2,(NativeUiSafeArea.DesignHeight-ih)/2,iw,ih),bg,ScaleMode.StretchToFill,false);
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    DrawLight(age,fade);
    DrawTexts(age,fade);
    DrawButtons(fade);
    DrawPets(age,fade);
    DrawDamageLog(fade);
    Rotate(age);
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
  void Rotate(float age){
   if(ForcedAge.HasValue)return;
   int idx=(int)(age/defs.timing.petRotate);if(idx!=seqIdx){seqIdx=idx;if(seqIdx>=seq.Length){seqIdx=0;}SetLine(seqIdx);}
  }
  void DrawLight(float age,float fade){
   // #death::before: 400px -> 40px radial glow, opacity 1 -> 0 over 4s (CSS ease), centred
   float p=Mathf.Clamp01(age/defs.timing.lightAnim);float e=EaseOut(p);float size=Mathf.Lerp(400,40,e);float op=1-e;
   GUI.color=new Color(180/255f,140/255f,100/255f,.08f*op*fade);NativeUiAudit.DrawTexture(new Rect(960-size/2,540-size/2,size,size),radial);GUI.color=Color.white;
  }
  void DrawTexts(float age,float fade){
   float pulse=TitlePulse(age);
   // .dt 45.44px Cinzel Decorative/Nanum 700, ls .14em, colour rgba(218,210,193,.94) x pulse opacity
   CenteredText(960,386,61,defs.title,nanum,45,C(218,210,193,.94f*fade*pulse),6.3616f,.95f*pulse*fade,3,true);
   // .ds sub
   CenteredText(960,457,25,defs.sub,nanum,20,C(198,184,158,.82f*fade),2.3424f,.95f*fade);
   DrawInfo(fade);
  }
  // #dInfo: "💀 N 처치 | 1장 — 썩은 숲 | EXP -N | 🔥 최대콤보 N" — Latin/digits/spaces are Cinzel crops, Hangul is Nanum, emoji are crops
  void DrawInfo(float fade){
   var I=defs.infoFormat;string hell=info.chapter>=0&&info.chapter<I.hell.Length?I.hell[info.chapter]:NotPorted;
   string combo=info.maxCombo>=0?info.maxCombo.ToString():NotPorted;
   string exp=info.expLoss>=0?I.exp+info.expLoss:I.exp.TrimEnd('-',' ')+" "+NotPorted;
   string text="💀 "+info.kills+" "+I.kills+I.sep+hell+I.sep+exp+I.sep+"🔥 "+I.combo+" "+combo;
   var parts=new List<KeyValuePair<Tok,string>>();
   for(int i=0;i<text.Length;i++){
    string ch;if(char.IsHighSurrogate(text[i])&&i+1<text.Length){ch=text.Substring(i,2);i++;}else ch=text[i].ToString();
    Tok t;
    if(tok.TryGetValue("e:"+ch,out t)||tok.TryGetValue("c:"+ch,out t))parts.Add(new KeyValuePair<Tok,string>(t,null));else parts.Add(new KeyValuePair<Tok,string>(null,ch));
   }
   const float ls=2.3296f;var col=C(174,151,111,.82f*fade);float total=0;
   foreach(var p in parts)total+=(p.Key!=null?p.Key.adv:Style(nanum,18).CalcSize(new GUIContent(p.Value)).x)+ls;
   float x=960-total/2f;
   foreach(var p in parts){
    if(p.Key!=null){Sprite(p.Key,x,500+13,p.Key.n.StartsWith("e:")?new Color(1,1,1,.82f*fade):col);x+=p.Key.adv+ls;}
    else{Text(x,500,26,p.Value,nanum,18,col,0,.95f*fade);x+=Style(nanum,18).CalcSize(new GUIContent(p.Value)).x+ls;}
   }
  }
  void DrawButtons(float fade){
   bool boss=info.retryBoss;string retry=boss?defs.retryBoss:defs.retry;
   Button(new Rect(0,554,0,44),retry,17,2.352f,C(218,210,193,.9f),C(8,6,5,.42f),C(141,124,96,.58f),true,fade,OnRetry);
   Button(new Rect(0,606,0,40),defs.replay,13,1.8368f,C(174,151,111,.78f),C(8,6,5,.42f),C(101,88,68,.48f),false,fade,null);   // replay: no recording in Unity (web disables it when empty)
   Button(new Rect(0,654,0,40),defs.lobby,13,1.8368f,C(174,151,111,.78f),C(8,6,5,.42f),C(101,88,68,.48f),true,fade,OnLobby);
  }
  void Button(Rect r,string label,int size,float ls,Color text,Color bg,Color border,bool hoverable,float fade,Action click){
   float tw=Width(nanum,size,label,ls,true);r.width=tw+74;r.x=960-r.width/2f;
   bool hover=hoverable&&GUI.enabled&&r.Contains(Event.current.mousePosition);
   if(hover){bg=C(79,53,34,.34f);border=C(183,166,129,.8f);text=C(232,223,202,.96f);}
   Fill(r,new Color(bg.r,bg.g,bg.b,bg.a*fade));Border(r,new Color(border.r,border.g,border.b,border.a*fade));
   Text(r.x+37,r.y,r.height,label,nanum,size,new Color(text.r,text.g,text.b,text.a*fade),ls,.95f*fade,1,0,true);
   if(NativeUiAudit.Button(r,GUIContent.none,GUIStyle.none)&&click!=null)click();
  }
  // Pet dialogue: portraits 720x480 at (231,580) and (969,580), one line each, fade .25s, rotates every 10s (opacity 0 -> swap after .2s -> 1)
  void DrawPets(float age,float fade){
   var T=defs.timing;float a;
   if(ForcedAge.HasValue)a=Mathf.Clamp01((age-T.petDelay)/T.petFade);
   else{float p=Mathf.Repeat(age,T.petRotate);bool first=age<T.petRotate;a=first?Mathf.Clamp01((age-T.petDelay)/T.petFade):(p<T.petDelay?1-p/T.petFade:Mathf.Clamp01((p-T.petDelay)/T.petFade));}
   a*=fade;if(a<=.002f)return;
   GUI.color=new Color(1,1,1,a);
   NativeUiAudit.DrawTexture(new Rect(231,580,720,480),crow,ScaleMode.StretchToFill,true);NativeUiAudit.DrawTexture(new Rect(969,580,720,480),cat,ScaleMode.StretchToFill,true);
   GUI.color=Color.white;
   PetText(new Rect(369,935.5f,459,76.5f),CrowLine,a);PetText(new Rect(1152,955,285,63),CatLine,a);
  }
  // 14.72px x 1.5 = 22.08px Malgun Gothic bold white, line-height 1.25, vertically centred, browser wrapping (breaks between Hangul syllables)
  void PetText(Rect box,string text,float a){
   const int size=22;const float lh=22.08f*1.25f;var st=Style(sansBold,size);var lines=Wrap(text,box.width,st);
   float y=box.y+(box.height-lines.Count*lh)/2f;
   foreach(var line in lines){
    st.normal.textColor=new Color(0,0,0,.95f*a);foreach(var d in new[]{new Vector2(0,1.5f),new Vector2(-2,0),new Vector2(2,0),new Vector2(0,-1),new Vector2(0,3)})PaintDeathGlyph(new Rect(box.x+d.x,y+d.y,box.width+8,lh),line,st,true);
    st.normal.textColor=new Color(1,1,1,a);PaintDeathGlyph(new Rect(box.x,y,box.width+8,lh),line,st,false);y+=lh;
   }
  }
  static bool Hangul(char c){return c>=0xAC00&&c<=0xD7A3;}
  static bool CanBreak(string t,int i){
   if(i<=0||i>=t.Length)return false;char l=t[i-1],r=t[i];
   if(l==' ')return true;if(r==' ')return false;
   if(")].,!?:;%·".IndexOf(r)>=0||"([{".IndexOf(l)>=0)return false;
   return Hangul(l)||Hangul(r);
  }
  List<string> Wrap(string text,float width,GUIStyle st){
   var res=new List<string>();int start=0;
   while(start<text.Length){
    int end=start,lastBreak=-1;
    for(int i=start+1;i<=text.Length;i++){
     // test the width first, then record i as a break opportunity (the earlier order never broke between Hangul syllables)
     if(st.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x>width&&lastBreak>start){end=lastBreak;break;}
     if(CanBreak(text,i)||i==text.Length)lastBreak=i;
     end=i;
    }
    if(end<=start)end=text.Length;
    res.Add(text.Substring(start,end-start).Trim());start=end;while(start<text.Length&&text[start]==' ')start++;
   }
   return res;
  }
  // #dDmgLog: right 24px, vertically centred, right aligned, 15.2px, line-height 2; last entry red 1.3rem 900, "맞아서 사망" footer. Unity has no damage log: "미이식".
  void DrawDamageLog(float fade){
   var st=Style(sans,15);
   if(info.damageLog==null){
    float w=st.CalcSize(new GUIContent(NotPorted)).x;st.normal.textColor=new Color(170/255f,136/255f,102/255f,fade);NativeUiAudit.Label(new Rect(1896-w,540-15,w+8,30),NotPorted,st);return;
   }
   int n=info.damageLog.Length;float lh=30.4f;float total=(n+(n>0?1.2f:0))*lh;float y=540-total/2f;
   for(int i=0;i<n;i++){
    bool last=i==n-1;string a="-"+info.damageLog[i].amount;string src=" "+info.damageLog[i].source;
    var big=Style(sansBold,last?21:15);var small=Style(sans,13);float wa=big.CalcSize(new GUIContent(a)).x,ws=small.CalcSize(new GUIContent(src)).x;
    float x=1896-wa-ws;big.normal.textColor=last?new Color(1,34/255f,34/255f,fade):new Color(204/255f,102/255f,68/255f,fade);NativeUiAudit.Label(new Rect(x,y,wa+8,lh),a,big);
    small.normal.textColor=new Color(136/255f,119/255f,102/255f,fade);NativeUiAudit.Label(new Rect(x+wa,y,ws+8,lh),src,small);y+=lh;
   }
   if(n>0){var f=Style(sans,13);string t=defs.dmgLogDead;float w=f.CalcSize(new GUIContent(t)).x;Fill(new Rect(1896-w,y+4,w,1),new Color(68/255f,34/255f,17/255f,fade));f.normal.textColor=new Color(136/255f,102/255f,68/255f,fade);NativeUiAudit.Label(new Rect(1896-w,y+6,w+8,lh),t,f);}
  }

  // ---- death replay screen (#deathReplay, CSS 649-656): shape only, there is no recording in Unity ----
  public void DrawReplayShape(float progress01,float remainingSeconds){
   Init();var old=GUI.matrix;var color=GUI.color;
   try {
    GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),Color.black);
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    // #drLabel: "☠ 사망 리플레이" 25.6px/700, ls .4em, #cc4444, glow
    var red=C(204,68,68);var skull=tok["g:☠"];string label=defs.replayScreen.label;
    float gap=10.24f+Width(sansBold,26," ",10.24f);float w=skull.adv+gap+Width(sansBold,26,label,10.24f);float x=960-w/2f;
    var glow=C(200,50,50,.08f);GUI.color=glow;NativeUiAudit.DrawTexture(new Rect(960-w/2-20,18-8,w+40,37+16),radial);GUI.color=Color.white;
    Sprite(skull,x,18+18.5f,red);x+=skull.adv+gap;Text(x,18,37,label,sansBold,26,red,10.24f,.8f,2,0,false);
    // #drTime: Courier New 17.6px, ls .1em, rgba(200,160,120,.8); fixed advance
    string time="-"+remainingSeconds.ToString("0.0")+"s  "+defs.replayScreen.skipText;float cw=10.56f+1.76f;float tw=0;foreach(char ch in time)tw+=Hangul(ch)?Width(nanum,18,ch.ToString(),1.76f):cw;
    float tx=960-tw/2f;foreach(char ch in time){if(Hangul(ch)){tx+=Text(tx,1020,24,ch.ToString(),nanum,18,C(200,160,120,.8f),1.76f,.8f);}else{Text(tx,1020,24,ch.ToString(),sans,18,C(200,160,120,.8f),0,.8f);tx+=cw;}}
    // #drBar: left 10%, width 80%, 4px, fill gradient #cc4444 -> #ff6644
    Fill(new Rect(192,1056,1536,4),C(100,60,40,.4f));
    float fw=1536*Mathf.Clamp01(progress01);var top=Gradient(C(204,68,68),C(255,102,68));NativeUiAudit.DrawTexture(new Rect(192,1056,fw,4),top);
   } finally {GUI.matrix=old;GUI.color=color;}
  }
  Texture2D grad;Color gradA,gradB;
  Texture2D Gradient(Color a,Color b){
   if(grad!=null&&gradA==a&&gradB==b)return grad;
   grad=new Texture2D(32,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)grad.SetPixel(i,0,Color.Lerp(a,b,i/31f));grad.Apply(false,true);gradA=a;gradB=b;return grad;
  }
 }
}
