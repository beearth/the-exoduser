using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
 // 2026-11-04: the drawn window is now the "안식은 없다" decision screen below (see "window"). The data side (event pick, pet lines, title pulse,
 // replay shape) still follows the web #death definitions so existing receipts keep working.
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
   public bool retryBoss;
   public bool inArena;       // died in a boss room: "다시 일어선다" returns to the field in front of the gate (RetryInsideArena)     // web: boss arena finale shows "보스 재도전"
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
  Texture2D atlas,radial;Font nanum,sans,sansBold;bool ready;
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
    var asset=Resources.Load<TextAsset>("Data/death_web");
    if(asset!=null)try{defs=JsonUtility.FromJson<Defs>(asset.text);}catch(ArgumentException e){Debug.LogError("[사망] 대사 자료 해석 실패: "+e.Message);}
    if(defs==null){Debug.LogError("[사망] 대사 자료 누락");defs=new Defs();}
    if(defs.atlas!=null)foreach(var t in defs.atlas)if(t!=null&&!string.IsNullOrEmpty(t.n))tok[t.n]=t;
    if(defs.petLines!=null)foreach(var l in defs.petLines)if(l!=null&&!string.IsNullOrEmpty(l.id))lines[l.id]=l;
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
   info=value;active=true;start=Now;BuildChoices();
   var list=new List<string>(defs.petPool??new string[0]);for(int i=list.Count-1;i>0;i--){int j=rng.Next(i+1);var t=list[i];list[i]=list[j];list[j]=t;}
   EventId=PickEvent();var s=new List<string>{EventId};s.AddRange(list);seq=s.ToArray();seqIdx=0;SetLine(0);
  }
  public void Hide(){active=false;}
  void SetLine(int i){PetLine l;if(seq==null||seq.Length==0||!lines.TryGetValue(seq[i%seq.Length]??"",out l)){CrowLine=CatLine="";return;}CrowLine=l.crow;CatLine=l.cat;}

  // ---- resources ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;
   atlas=Resources.Load<Texture2D>("Art/ui/death/death_atlas");   // replay screen glyphs
   splat=Resources.Load<Texture2D>("Art/ui/death/death_splatter");diamond=MakeDiamond();
   cinzel=Resources.Load<Font>("Art/fonts/Cinzel-400");hahmletLight=NativeSilverHellUi.Font();hahmlet=NativeSilverHellUi.Font(true);
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
  public float DebugFade(float age){return defs.timing!=null?EaseOut(age/defs.timing.fade):0;}
  public float DebugTitleOpacity(float age){return TitlePulse(age);}
  float TitlePulse(float age){
   var T=defs.timing;if(T==null)return 0;float ph=Mathf.Repeat(age+PulseOffset,T.titlePulse)/T.titlePulse;float seg=ph<.5f?ph*2:(1-ph)*2;float e=Mathf.SmoothStep(0,1,seg);
   return Mathf.Lerp(T.titleMin,T.titleMax,e);
  }

  // text: centred run list, letter-spaced, with optional shadow copies
  float Width(Font f,int size,string text,float ls,bool bold=false){var st=Style(f,size,bold);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  void PaintDeathGlyph(Rect box,string glyph,GUIStyle style,bool outline){bool previous=NativeUiAudit.DrawingTextShadow;string profile=NativeUiAudit.DrawingTextShadowProfile;try{if(outline){NativeUiAudit.DrawingTextShadow=true;NativeUiAudit.DrawingTextShadowProfile="death-black-outline";}NativeUiAudit.Label(box,glyph,style);}finally{NativeUiAudit.DrawingTextShadow=previous;NativeUiAudit.DrawingTextShadowProfile=profile;}}
  float Text(float x,float y,float h,string text,Font f,int size,Color c,float ls,float shadowAlpha=0,float shadowY=1,float shadowSpread=0,bool bold=false){
   var st=Style(f,size,bold);float w=0;
   foreach(char ch in text){
    var g=ch.ToString();float cw=st.CalcSize(new GUIContent(g)).x;
    using(var paint=NativeUiAudit.GroupText(new Rect(x+w,y,60,h),g)){
    if(shadowAlpha>0){
     st.normal.textColor=new Color(0,0,0,shadowAlpha*c.a);PaintDeathGlyph(new Rect(x+w,y+shadowY,60,h),g,st,shadowSpread>0);
     if(shadowSpread>0)foreach(var d in new[]{new Vector2(-1,0),new Vector2(1,0),new Vector2(0,-1),new Vector2(0,1)}){st.normal.textColor=new Color(0,0,0,shadowAlpha*.35f*c.a);PaintDeathGlyph(new Rect(x+w+d.x*shadowSpread,y+shadowY+d.y*shadowSpread,60,h),g,st,true);}
    }
    st.normal.textColor=c;PaintDeathGlyph(new Rect(x+w,y,60,h),g,st,false);
    }
    w+=cw+ls;
   }
   return w;
  }
  void Sprite(Tok t,float x,float cy,Color c){
   var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTextureWithTexCoords(new Rect(x-t.pad,cy-t.cy,t.w,t.h),atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));GUI.color=old;
  }

  // ---- window: "안식은 없다" death screen (2026-11-04) ----
  // UX taken from Phantom Blade Zero (black void, one statement, then a short decision) in Hell Gothic language, not its art:
  // 0~.45s black over the fallen filter; .3s blood-ink bloom; .5s "안식은 없다" (Hahmlet 300, bone) + crimson hairline + "THERE IS NO REST";
  // 2.0s the title rises and the question "포기할 것인가?" appears, options fade in one by one. Only the focused option shows its outcome line.
  // Options: boss room = 다시 일어선다 (field in front of the gate, full HP) / 처음부터 다시 / 포기한다; field = 다시 일어선다 (run restart) / 포기한다.
  public enum Choice{None,Rise,Restart,GiveUp}
  const float BlackIn=.45f,BloomAt=.3f,BloomDur=.6f,TitleAt=.5f,TitleDur=1f,LineAt=.9f,LineDur=.7f,CapAt=1.3f,CapDur=.6f,AskAt=2.0f,AskDur=.6f,OptAt=2.35f,OptStep=.12f,OptDur=.45f;
  const float BreathPeriod=5f,HairlineMin=460f;
  int focus;Texture2D splat,diamond;Font cinzel,hahmletLight,hahmlet;
  public Action OnRestart;
  Choice[] choices=new Choice[0];
  public bool ActionsReady{get{return active&&Age>=OptAt+OptStep*(choices.Length-1)+.2f;}}
  public int Focus{get{return focus;}}
  public int ChoiceCount{get{return choices.Length;}}
  public Choice FocusedChoice{get{return choices.Length>0?choices[Mathf.Clamp(focus,0,choices.Length-1)]:Choice.None;}}
  void BuildChoices(){choices=info.inArena?new[]{Choice.Rise,Choice.Restart,Choice.GiveUp}:new[]{Choice.Rise,Choice.GiveUp};focus=0;}
  // 11-04 D2: every decision-screen string comes from Data/death_decision_text.json (29 languages, No.4264~4272). ar draws as en (IMGUI has no RTL shaping).
  [Serializable] sealed class DecisionRow {public string code,title,caption,ask,rise,restart,giveUp,outArena,outRestart,outLobby;}
  [Serializable] sealed class DecisionBundle {public DecisionRow[] entries;}
  public string LocaleCode="ko";
  static DecisionBundle decisionBundle;
  static DecisionBundle Decisions(){
   if(decisionBundle==null){var asset=Resources.Load<TextAsset>("Data/death_decision_text");decisionBundle=asset!=null?JsonUtility.FromJson<DecisionBundle>(asset.text):null;if(decisionBundle==null||decisionBundle.entries==null)decisionBundle=new DecisionBundle{entries=new DecisionRow[0]};}
   return decisionBundle;
  }
  public static int DecisionRowCount{get{return Decisions().entries.Length;}}
  static DecisionRow DecisionFor(string locale){
   string code=Exoduser.UnityPort.Core.LobbyLanguage.Normalize(locale);if(code=="ar")code="en";DecisionRow en=null;
   foreach(var e in Decisions().entries){if(e.code==code)return e;if(e.code=="en")en=e;}
   return en??new DecisionRow{code="ko",title="안식은 없다",caption="THERE IS NO REST",ask="포기할 것인가?",rise="다시 일어선다",restart="처음부터 다시",giveUp="포기한다",outArena="보스방 앞에서 다시 일어선다. 체력을 모두 되찾는다.",outRestart="이번 여정을 처음부터 다시 시작한다.",outLobby="로비로 돌아간다."};
  }
  DecisionRow Tx{get{return DecisionFor(LocaleCode);}}
  string Label(Choice c){var t=Tx;return c==Choice.Rise?t.rise:c==Choice.Restart?t.restart:t.giveUp;}
  string Outcome(Choice c){var t=Tx;return c==Choice.Rise?(info.inArena?t.outArena:t.outRestart):c==Choice.Restart?t.outRestart:t.outLobby;}
  // Long languages (th, el, ru, de ...) shrink by whole point sizes until the run fits maxW at the widest tracking; no ellipsis, no wrap. Floor = 60% of the design size.
  readonly Dictionary<string,int> fitCache=new Dictionary<string,int>();
  int FitSize(string t,Font f,int size,float lsEm,float maxW,int floor=0){
   string key=(f!=null?f.name:"")+"|"+size+"|"+lsEm+"|"+maxW+"|"+floor+"|"+t;if(fitCache.TryGetValue(key,out var hit))return hit;
   int min=Mathf.Min(size,Mathf.Max(9,floor,Mathf.RoundToInt(size*.6f))),s=size;while(s>min&&SpacedWidth(t,f,s,s*lsEm)>maxW)s--;
   fitCache[key]=s;return s;
  }
  // Keyboard: ↑↓ / W S / Tab move, Enter / Space confirm. Nothing is accepted before every option is on screen.
  public Choice PollKeys(){
   if(!ActionsReady)return Choice.None;int n=choices.Length;
   if(ExoInput.KeyDown(KeyCode.UpArrow)||ExoInput.KeyDown(KeyCode.W))focus=(focus+n-1)%n;
   else if(ExoInput.KeyDown(KeyCode.DownArrow)||ExoInput.KeyDown(KeyCode.S)||ExoInput.KeyDown(KeyCode.Tab))focus=(focus+1)%n;
   else if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)||ExoInput.KeyDown(KeyCode.Space))return FocusedChoice;
   return Choice.None;
  }
  void Act(Choice c){if(c==Choice.Rise)OnRetry?.Invoke();else if(c==Choice.Restart)OnRestart?.Invoke();else if(c==Choice.GiveUp)OnLobby?.Invoke();}
  // Linear Player: GUI.color reaches the screen without sRGB decoding (measured 2026-11-03), so solid tints pass their linear value.
  static Color Lin(Color c){if(QualitySettings.activeColorSpace!=ColorSpace.Linear)return c;var l=new Color(c.r,c.g,c.b).linear;return new Color(l.r,l.g,l.b,c.a);}
  public void Draw(){
   if(!active)return;Init();
   var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    float age=Age;
    NativeUiViewport.FillScreen(new Color(0,0,0,EaseOut(age/BlackIn)));
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    float rise=EaseOut((age-AskAt)/AskDur);float ty=Mathf.Lerp(430,300,rise);   // title block centre line
    // blood-ink bloom behind the title (baked dark crimson, pre-linearised PNG)
    float bp=EaseOut((age-BloomAt)/BloomDur);
    // 11-04 lead review: once every option is on screen the blood-ink bloom breathes (period 5s, brightness +-5%, size +-1.5%) so the settled screen is not a still frame.
    // Driven by Age (ForcedAge in captures); title, options and focus never move. Amplitude eases in after the last option, so earlier frames are unchanged.
    float settle=Mathf.Clamp01((age-(OptAt+OptStep*Mathf.Max(0,choices.Length-1)+OptDur))/1.5f);float breath=Mathf.Sin((age-OptAt)*Mathf.PI*2/BreathPeriod)*settle;
    if(bp>0&&splat!=null){float w=Mathf.Lerp(560,640,bp)*(1+.015f*breath),h=w;GUI.color=new Color(1,1,1,.62f*bp*(1-.35f*rise)*(1+.05f*breath));NativeUiAudit.DrawTexture(new Rect(960-w/2,ty-h*.47f,w,h),splat,ScaleMode.StretchToFill,true);}
    GUI.color=Color.white;
    // title: tracking settles from .36em to .28em while it fades in
    float tp=EaseOut((age-TitleAt)/TitleDur);
    var tx=Tx;
    int ts=FitSize(tx.title,hahmletLight,68,.36f,1500);float tls=ts*Mathf.Lerp(.36f,.28f,tp);
    if(tp>0)Spaced(960,ty-48,96,tx.title,hahmletLight,ts,C(223,214,194,tp),tls);
    // crimson hairline grows from the centre; 460px minimum, widened to the title width for long languages (11-04 lead review)
    float lp=EaseOut((age-LineAt)/LineDur);
    if(lp>0){float lw=Mathf.Max(HairlineMin,SpacedWidth(tx.title,hahmletLight,ts,tls))*lp;Fill(new Rect(960-lw/2,ty+62,lw,1),Lin(C(194,26,16,.85f*lp)));Fill(new Rect(960-lw*.18f,ty+61,lw*.36f,3),Lin(C(194,26,16,.35f*lp)));}
    float cp=EaseOut((age-CapAt)/CapDur);
    if(cp>0){int cs=FitSize(tx.caption,cinzel,15,.42f,700);Spaced(960,ty+76,30,tx.caption,cinzel,cs,C(176,44,40,.9f*cp),cs*.42f);}
    // the decision
    float ap=EaseOut((age-AskAt)/AskDur);
    if(ap>0){int qs=FitSize(tx.ask,hahmlet,24,.12f,1200);Spaced(960,520,40,tx.ask,hahmlet,qs,C(230,227,220,ap),qs*.12f);}
    for(int i=0;i<choices.Length;i++){float op=EaseOut((age-OptAt-OptStep*i)/OptDur);if(op>0)DrawChoice(i,op);}
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
  void DrawChoice(int i,float a){
   const float rowH=58,top=600;float y=top+i*rowH;var c=choices[i];string label=Label(c);int size=FitSize(label,hahmlet,21,.16f,820);float ls=size*.16f;
   float w=SpacedWidth(label,hahmlet,size,ls);var r=new Rect(960-w/2-40,y,w+80,rowH-14);
   bool hover=GUI.enabled&&ActionsReady&&r.Contains(Event.current.mousePosition);if(hover)focus=i;bool on=focus==i&&ActionsReady;
   if(on){var dc=Lin(C(194,26,16,a));Diamond(new Vector2(960-w/2-22,y+(rowH-14)/2),dc);Diamond(new Vector2(960+w/2+22,y+(rowH-14)/2),dc);}
   Spaced(960,y,rowH-14,label,hahmlet,size,on?C(242,240,236,a):C(167,164,157,.82f*a),ls);
   // 11-04 lead review: outcome line 14 -> 16px (floor 14 so long languages never drop below the old size; width limit 1400 -> 1600).
   if(on){float oy=top+choices.Length*rowH+14;string oc=Outcome(c);int os=FitSize(oc,hahmlet,16,.06f,1600,14);Spaced(960,oy,28,oc,hahmlet,os,C(167,164,157,.9f*a),os*.06f);}
   if(ActionsReady&&NativeUiAudit.Button(r,GUIContent.none,GUIStyle.none))Act(c);
  }
  // 9x9 design-px diamond from a baked alpha texture (no matrix rotation, so it stays put under any GUI scale).
  void Diamond(Vector2 c,Color col){var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(new Rect(c.x-4.5f,c.y-4.5f,9,9),diamond,ScaleMode.StretchToFill,true);GUI.color=old;}
  static Texture2D MakeDiamond(){
   const int n=32;var t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float d=Mathf.Abs(x+.5f-n/2f)+Mathf.Abs(y+.5f-n/2f);px[y*n+x]=new Color(1,1,1,Mathf.Clamp01((n/2f-d)/1.2f));}
   t.SetPixels(px);t.Apply(false,true);return t;
  }
  GUIStyle spaced;
  float Adv(string t,int n){if(n==0)return 0;var bar=spaced.CalcSize(new GUIContent("|")).x;return spaced.CalcSize(new GUIContent(t.Substring(0,n)+"|")).x-bar;}
  // 11-04 lead review: per-char drawing dropped Thai vowel/tone marks (combining marks drawn apart from their base). Scripts that need joined shaping
  // (Thai·Lao·Khmer·Myanmar·Indic·Arabic) are drawn as one run without tracking; others are spaced per text element (base + its combining marks), never per char.
  static bool Joined(string t){foreach(var ch in t){int u=ch;if((u>=0x0900&&u<=0x0DFF)||(u>=0x0E00&&u<=0x0EFF)||(u>=0x1000&&u<=0x109F)||(u>=0x1780&&u<=0x17FF)||(u>=0x0600&&u<=0x06FF))return true;}return false;}
  static int[] Elements(string t){var list=new List<int>();var e=System.Globalization.StringInfo.ParseCombiningCharacters(t);list.AddRange(e);return list.ToArray();}
  float SpacedWidth(string t,Font f,int size,float ls){Prep(f,size,t);if(Joined(t))return Adv(t,t.Length);int n=Elements(t).Length;return Adv(t,t.Length)+ls*Math.Max(0,n-1);}
  void Prep(Font f,int size,string t){if(spaced==null)spaced=new GUIStyle(GUIStyle.none){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};spaced.font=NativeSilverHellUi.TextFont(f,t);spaced.fontSize=size;}
  // Centred, letter-spaced run: glyph x = prefix advance + i*ls. Text colour goes through NativeSilverHellUi.Label (Linear text correction).
  void Spaced(float cx,float y,float h,string t,Font f,int size,Color c,float ls){
   float w=SpacedWidth(t,f,size,ls),x0=cx-w/2;spaced.normal.textColor=c;
   if(Joined(t)){NativeSilverHellUi.Label(new Rect(x0,y,w+2,h),t,spaced);return;}
   var starts=Elements(t);
   for(int k=0;k<starts.Length;k++){int s=starts[k],len=(k+1<starts.Length?starts[k+1]:t.Length)-s;string g=t.Substring(s,len);if(string.IsNullOrWhiteSpace(g))continue;float gx=Adv(t,s),gw=Adv(t,s+len)-gx;NativeSilverHellUi.Label(new Rect(x0+gx+ls*k,y,gw+2,h),g,spaced);}
  }
  // 11-04 judge 6: the front title (NativeRevive death screen, fades out in 0.35s) must be gone before this title appears.
  // The decision screen satisfies it by timing: black fills over BlackIn and its title starts at TitleAt (>= TitleGateDelay), so no extra gate is multiplied in.
  public const float TitleGateDelay=.4f,TitleGateRise=.8f;
  public static float TitleGate(float age){return Mathf.SmoothStep(0,1,Mathf.Clamp01((age-TitleGateDelay)/TitleGateRise));}

  static bool Hangul(char c){return c>=0xAC00&&c<=0xD7A3;}

  // ---- death replay screen (#deathReplay, CSS 649-656): shape only, there is no recording in Unity ----
  public void DrawReplayShape(float progress01,float remainingSeconds){
    if(defs.replayScreen==null||!tok.ContainsKey("g:☠"))return;
    Init();if(atlas==null)return;var old=GUI.matrix;var color=GUI.color;
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
