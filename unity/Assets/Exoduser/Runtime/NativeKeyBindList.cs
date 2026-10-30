using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Web settings > controls > key-binding list (#keyBindList; game.html renderSettings 48703-48880, key handling 13185-13203, F5 48850, mouse capture 48856-48876;
 // CSS ui-foundation / ui-composed `#settings.panel .pbox #keyBindList`). 1736px wide two-column grid in the 1920x1080 design space, geometry measured from the web DOM
 // (E:/exoduser-wt/_out/pc-a16/web/*.json): tab row 44px, rows 854x53 (gap 4/28), main key 251.6x42, alternate key 201.3x42, delete 28x36, reset button 44px, wait hint.
 // The caller owns the 1920x1080 GUI matrix, the scroll offset and the clip: Draw(origin, visible) draws at `origin` (list top-left, scroll already applied) and ignores input
 // outside `visible`. State = shared KeyBindings (web key codes). Not ported: saving (Codex NativeSettingsStore has no key fields -> a "저장 미이식" line is drawn),
 // gamepad state (the pad tab keeps the web layout, assignable buttons show "미이식" and cannot be clicked), keyboard focus ring, 2px key corners, other languages than ko/en.
 public sealed class NativeKeyBindList {
  public enum Tab {Kbm,Pad}
  [Serializable] sealed class TabDef {public string id,ko,en;}
  [Serializable] sealed class TextsDef {public string alt,listenMain,listenAlt,hint,reset,resetDone,@fixed,padTitle,padReset,padGuide,chainConflictEn;}
  [Serializable] sealed class EnPair {public string ko,en;}
  [Serializable] sealed class PadRow {public int id;public string btn,act,code;public bool @fixed;}
  [Serializable] sealed class GuideRow {public string btn,act;}
  [Serializable] sealed class UiDefs {public TabDef[] tabs;public TextsDef texts;public EnPair[] en;public PadRow[] padRows;public GuideRow[] guide;}
  [Serializable] sealed class GlyphTok {public string id,text;public int x,y,w,h;public float adv,lineH;public bool tint;}
  [Serializable] sealed class GlyphFile {public int scale,atlasW,atlasH;public float origin;public GlyphTok[] glyphs;}

  // geometry (design px, relative to the list origin) — web DOM dump values
  public const float ListW=1736,ColW=854,ColGap=28,TabH=44,TabW=865,TabGap=6,RowsTop=62,RowPitch=57,RowH=53;
  public const float MainX=345.09f,MainW=251.61f,AltX=606.7f,AltW=201.3f,KeyH=42,DelX=818,DelW=28,DelH=36;
  public const float NameX=8,NameW=327.09f;
  public string SaveNote="저장 미이식 · 이번 실행에서만 유지",SaveNoteEn="Saving not ported · kept for this session only";

  readonly KeyBindings keys;readonly UiDefs ui;readonly GlyphFile gl;readonly Dictionary<string,string> en=new Dictionary<string,string>();readonly Dictionary<string,GlyphTok> glyph=new Dictionary<string,GlyphTok>();
  Texture2D plate,glyphTex;Font regular,semi,bold,serif,regionalFont;string regionalLocale;bool ready;readonly Dictionary<string,Texture2D> gradients=new Dictionary<string,Texture2D>();readonly Dictionary<(Font,int),GUIStyle> styles=new Dictionary<(Font,int),GUIStyle>();
  readonly HashSet<KeyCode> held=new HashSet<KeyCode>();
  string listenAction;bool listenAlt;float listenAt;string phText,notifText;float phUntil,notifUntil;
  Rect visible;Vector2 origin;float curA=1;
  public bool English;public string LocaleCode="ko";public Tab CurrentTab=Tab.Kbm;
  public KeyBindings Bindings{get{return keys;}}
  public bool Listening{get{return listenAction!=null;}}
  public int CaptureConsumedFrame{get;private set;}=-10;
  public string ListeningAction{get{return listenAction;}}
  public bool ListeningAlt{get{return listenAlt;}}
  public float ContentHeight{get;private set;}
  public float WebHeight{get;private set;}   // list height without the extra "saving not ported" line = the web #keyBindList height
  public int GlyphCount{get{return gl.glyphs.Length;}}
  // measurements for the capture check (design px, relative to the list origin)
  public readonly List<Rect> LastKeyRects=new List<Rect>();
  public float LastResetY;

  public NativeKeyBindList(KeyBindings bindings){
   keys=bindings;
   ui=JsonUtility.FromJson<UiDefs>(Resources.Load<TextAsset>("Data/keybind_ui_web").text);
   gl=JsonUtility.FromJson<GlyphFile>(Resources.Load<TextAsset>("Data/keybind_glyphs").text);
   foreach(var p in ui.en)en[p.ko]=p.en;foreach(var g in gl.glyphs)glyph[g.id]=g;
  }

  // ---- text ----
  string T(string ko){string v;string fallback=English&&en.TryGetValue(ko,out v)?v:ko;return NativeA15SettingsLabels.GetKeyByKo(ko,LocaleCode,fallback).Replace("⌨","").Replace("🎮","").Trim();}
  string L(string ko,string eng){return NativeA15SettingsLabels.GetKeyByKo(ko,LocaleCode,English?eng:ko).Replace("⌨","").Replace("🎮","").Trim();}

  // ---- state changes ----
  public void BeginListening(string action,bool alternate){held.Clear();listenAction=action;listenAlt=alternate;listenAt=Time.unscaledTime;}
  public bool CaptureApply(string code){return Listening&&Apply(code);}   // capture / test entry: as if this web key code had been pressed while waiting
  public void CancelListening(){listenAction=null;listenAlt=false;}
  public void ForceListeningAge(float seconds){listenAt=Time.unscaledTime-seconds;}
  void ShowPh(string text){phText=text;phUntil=Time.unscaledTime+.5f;}
  void ShowNotif(string text){notifText=text;notifUntil=Time.unscaledTime+1.5f;}
  public void ResetBindings(){keys.ResetAll();CancelListening();ShowNotif(T(ui.texts.resetDone));}
  bool Apply(string code){
   string rej;
   if(!keys.TrySet(listenAction,code,listenAlt,out rej))ShowPh(L(rej,rej==KeyBindings.RollKeyboardKo?KeyBindings.RollKeyboardEn:ui.texts.chainConflictEn));
   CancelListening();return true;
  }

  // ---- resources ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;
   plate=Resources.Load<Texture2D>("Art/ui/inventory/plate");glyphTex=Resources.Load<Texture2D>("Art/ui/keybind/keybind_glyphs");
   regular=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");semi=regular;bold=regular;
   serif=regular;
  }
  void Fill(Rect r,Color c){var old=GUI.color;GUI.color=new Color(c.r,c.g,c.b,c.a*curA);NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  void Border(Rect r,Color c,float top=1,float right=1,float bottom=1,float left=1){
   Fill(new Rect(r.x,r.y,r.width,top),c);Fill(new Rect(r.x,r.yMax-bottom,r.width,bottom),c);Fill(new Rect(r.x,r.y+top,left,r.height-top-bottom),c);Fill(new Rect(r.xMax-right,r.y+top,right,r.height-top-bottom),c);
  }
  void Grad(Rect r,Color a,Color b,bool horizontal=false){
   string key=ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+(horizontal?"h":"v");
   if(!gradients.TryGetValue(key,out var t)){
    t=new Texture2D(horizontal?32:1,horizontal?1:32,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
    for(int i=0;i<32;i++)t.SetPixel(horizontal?i:0,horizontal?0:31-i,Color.Lerp(a,b,i/31f));t.Apply(false,true);gradients[key]=t;
   }
   var old=GUI.color;GUI.color=new Color(1,1,1,curA);NativeUiAudit.DrawTexture(r,t);GUI.color=old;
  }
  GUIStyle Style(Font f,int px){
   var key=(f,px);
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=f,fontSize=px,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  static IEnumerable<string> Elements(string s){for(int i=0;i<s.Length;i++){if(char.IsHighSurrogate(s[i])&&i+1<s.Length){yield return s.Substring(i,2);i++;}else yield return s[i].ToString();}}
  // ctx: 1 tab label 14px (⌨ 🎮), 2 pad title 17.6px (🎮), 3 guide title 12.8px (🎮), 4 waiting text (⟨ ⟩), 5 delete (✕)
  string GlyphId(string g,int ctx){
   switch(ctx){
    case 1:return g=="⌨"?"kbd14":g=="🎮"?"pad14":null;
    case 2:return g=="🎮"?"pad17":null;
    case 3:return g=="🎮"?"pad12":null;
    case 4:return g=="⟨"?"lang":g=="⟩"?"rang":null;
    case 5:return g=="✕"?"cross":null;
   }
   return null;
  }
  Font LabelFont(string text,Font source){
   if(regionalLocale!=LocaleCode){regionalLocale=LocaleCode;regionalFont=NativeA15SettingsLabels.FontForLocale(LocaleCode,null);}
   if(regionalFont==null||string.IsNullOrEmpty(text))return source;
   foreach(char ch in text)if(ch>=0xAC00&&ch<=0xD7A3)return source; // native-only Korean copy keeps its original font
   return regionalFont;
  }
  // width of a run (css advance incl. letter spacing)
  float Width(string text,Font f,int px,float css,float ls,int ctx=0){
   f=LabelFont(text,f);var st=Style(f,px);float w=0;
   foreach(var g in Elements(text)){var id=GlyphId(g,ctx);if(id!=null&&glyph.TryGetValue(id,out var t)){w+=t.adv;continue;}w+=st.CalcSize(new GUIContent(g)).x*(css/px)+ls;}
   return w;
  }
  // draws a run with its vertical centre at cy; returns the advance
  float Run(float x,float cy,string text,Font f,int px,float css,float ls,Color col,float shadow=0,int ctx=0){
   f=LabelFont(text,f);var st=Style(f,px);float w=0;
   foreach(var g in Elements(text)){
    var id=GlyphId(g,ctx);
    if(id!=null&&glyph.TryGetValue(id,out var t)){
     if(shadow>0&&t.tint)DrawGlyph(t,x+w,cy+1,new Color(0,0,0,shadow*col.a),true);
     DrawGlyph(t,x+w,cy,col,t.tint);w+=t.adv;continue;
    }
    float adv=st.CalcSize(new GUIContent(g)).x*(css/px);
    if(g!=" "){
     if(shadow>0){st.normal.textColor=new Color(0,0,0,shadow*col.a*curA);NativeUiAudit.Label(new Rect(x+w,cy-16+1,60,32),g,st);}
     st.normal.textColor=NativeSilverHellUi.TextColor(new Color(col.r,col.g,col.b,col.a*curA));NativeUiAudit.Label(new Rect(x+w,cy-16,60,32),g,st);
    }
    w+=adv+ls;
   }
   return w;
  }
  float RunCentered(float cx,float cy,string text,Font f,int px,float css,float ls,Color col,float shadow=0,int ctx=0){float w=Width(text,f,px,css,ls,ctx);Run(cx-w/2f,cy,text,f,px,css,ls,col,shadow,ctx);return w;}
  void DrawGlyph(GlyphTok t,float x,float cy,Color c,bool tint){
   NativeUiAudit.Region(new Rect(x,cy-t.lineH/2,t.adv,t.lineH),"text",t.text,"키 글리프 아틀라스",tint&&c.r<.001f&&c.g<.001f&&c.b<.001f);
   float s=gl.scale;var r=new Rect(x-gl.origin,cy-t.lineH/2f-gl.origin,t.w/s,t.h/s);var old=GUI.color;
   GUI.color=tint?new Color(c.r,c.g,c.b,c.a*curA):new Color(1,1,1,curA);
   NativeUiAudit.DrawTextureWithTexCoords(r,glyphTex,new Rect((float)t.x/gl.atlasW,1f-(float)(t.y+t.h)/gl.atlasH,(float)t.w/gl.atlasW,(float)t.h/gl.atlasH));GUI.color=old;
  }

  // ---- input ----
  bool inView(Rect r){return r.Overlaps(visible);}
  bool Hover(Rect r){return Event.current.type!=EventType.Layout&&r.Contains(Event.current.mousePosition)&&visible.Contains(Event.current.mousePosition)&&!Listening;}
  bool Click(Rect r){
   var e=Event.current;
   if(e.type==EventType.MouseDown&&e.button==0&&!Listening&&r.Contains(e.mousePosition)&&visible.Contains(e.mousePosition)){e.Use();return true;}
   return false;
  }
  // key / mouse capture while a key is waiting (web keydown handler 13195-13203 + #bindOverlay mousedown)
  void HandleCapture(){
   var e=Event.current;
   if(e.type==EventType.KeyUp&&e.keyCode!=KeyCode.None){held.Remove(e.keyCode);return;}
   if(e.type==EventType.KeyDown&&e.keyCode!=KeyCode.None){
    bool repeat=!held.Add(e.keyCode);
    if(Listening){
     if(repeat){e.Use();return;}                                   // e.repeat -> ignored
     CaptureConsumedFrame=Time.frameCount;
     if(e.keyCode==KeyCode.Escape){CancelListening();e.Use();return;}  // ESC = cancel
     var code=NativeKeyBindInput.CodeFor(e.keyCode);if(code!=null)Apply(code);e.Use();return;
    }
    if(e.keyCode==KeyCode.F5&&!repeat){ResetBindings();e.Use();}      // F5 = reset while the list is shown
    return;
   }
   if(Listening&&e.type==EventType.MouseDown&&Time.unscaledTime-listenAt>=.12f){Apply("mouse"+NativeKeyBindInput.WebMouseButton(e.button));e.Use();}   // overlay is active 120ms after it opened
  }

  // ---- window ----
  // Draws the list. `o` = list top-left (scroll applied by the caller), `view` = visible region (same coordinates) for clipping/hit tests.
  public void Draw(Vector2 o,Rect view){
   Init();origin=o;visible=view;curA=1;LastKeyRects.Clear();
   HandleCapture();
   bool paint=Event.current.type==EventType.Repaint;
   float y;
   DrawTabs();
   if(CurrentTab==Tab.Kbm)y=DrawKbm();else y=DrawPad();
   if(Listening&&CurrentTab==Tab.Kbm){y+=4+6;if(paint)RunCentered(origin.x+ListW/2f,origin.y+y+9.5f,T(ui.texts.hint),serif,15,15.2f,1.52f,C(243,240,234));y+=19;}
   WebHeight=y;
   // "saving not ported": Unity settings schema has no key fields yet
   y+=10;if(paint)RunCentered(origin.x+ListW/2f,origin.y+y+8,L(SaveNote,SaveNoteEn),regular,12,11.52f,.3f,C(136,139,139));y+=16;
   ContentHeight=y;
  }

  Rect R(float x,float y,float w,float h){return new Rect(origin.x+x,origin.y+y,w,h);}

  // ---- quiet tier (ui-quiet-tier.css 2026-10-27): text-weight list, 818px columns / 64px gap, 56px rows, 34px key capsules ----
  public const float QListW=1700,QColW=818,QColGap=64,QRowsTop=57.5f,QRowPitch=56,QKeyH=34,QAltW=61.7f,QPad=8;
  static readonly Color QBone=new Color32(217,214,208,255),QTitle=new Color32(222,219,213,255),QDim=new Color32(129,132,132,255),QLine=new Color32(146,149,149,128),QLineSoft=new Color32(146,149,149,46);
  Font cinzelFont;
  Font KeyFont(string text){
   foreach(char ch in text)if(ch>127)return bold;
   return serif;
  }
  void DrawTabs(){
   bool paint=Event.current.type==EventType.Repaint;
   float x=0;
   for(int i=0;i<2;i++){
    var t=ui.tabs[i];string label=L(t.ko,t.en);float w=Mathf.Max(110,Width(label,semi,16,16f,0,1)+40);var r=R(x,12,w,40);x+=w+6;bool sel=(i==0)==(CurrentTab==Tab.Kbm);
    if(paint&&inView(r)){
     NativeSilverHellUi.ActionPlate(r,false,sel||Hover(r)?1:0,Hover(r)&&ExoInput.Mouse(0),22,2);
     RunCentered(r.center.x,r.center.y,label,semi,16,16f,0,QBone,0,1);
    }
    if(Click(r)){CurrentTab=i==0?Tab.Kbm:Tab.Pad;CancelListening();}
   }
  }

  // ---- keyboard & mouse tab ----
  float DrawKbm(){
   var rows=keys.Listed;int n=rows.Count;
   for(int i=0;i<n;i++){
    float rx=(i%2)*(QColW+QColGap),ry=QRowsTop+(i/2)*QRowPitch;DrawKbmRow(rows[i],rx,ry);
   }
   int rowCount=(n+1)/2;float resetY=QRowsTop+rowCount*QRowPitch+18.5f;LastResetY=resetY;
   string reset=T(ui.texts.reset);float rw=Mathf.Max(200,Width(reset,semi,16,16f,0)+48);
   DrawResetButton(R(0,resetY,rw,40),reset,true);
   return resetY+40;
  }

  void DrawActionName(Rect row,string name){
   Run(row.x+QPad,row.y+28,name,serif,17,17f,0,QBone);
  }
  void DrawKbmRow(string action,float rx,float ry){
   var row=R(rx,ry,QColW,QRowPitch);bool paint=Event.current.type==EventType.Repaint;
   bool mainL=Listening&&listenAction==action&&!listenAlt,altL=Listening&&listenAction==action&&listenAlt;string alt=keys.Secondary(action);
   string mainText=mainL?T(ui.texts.listenMain):NativeA15SettingsLabels.GetKeyByKo(KeyBindings.KeyName(keys.Primary(action),false),LocaleCode,KeyBindings.KeyName(keys.Primary(action),English));
   string altText=altL?T(ui.texts.listenAlt):(alt!=null?NativeA15SettingsLabels.GetKeyByKo(KeyBindings.KeyName(alt,false),LocaleCode,KeyBindings.KeyName(alt,English)):T(ui.texts.alt));
   float altW=Mathf.Max(QAltW,Width(altText,KeyFont(altText),14,14f,0)+26),altX=QColW-QPad-altW;
   float mainW=Mathf.Max(70,Width(mainText,KeyFont(mainText),14,14f,0)+26),mainX=altX-10-mainW;
   var mainR=R(rx+mainX,ry+11,mainW,QKeyH);var altR=R(rx+altX,ry+11,altW,QKeyH);
   var delR=new Rect(altR.xMax-22,altR.y,22,QKeyH);
   LastKeyRects.Add(mainR);LastKeyRects.Add(altR);
   if(paint&&inView(row)){
    if(mainL||altL){Grad(row,C(107,110,110,.18f),C(52,55,55,.086f),true);Fill(new Rect(row.x,row.y,3,row.height),C(152,155,155));}
    else if(Hover(row))Fill(row,C(116,119,119,.06f));
    Fill(new Rect(row.x,row.yMax-1,row.width,1),QLineSoft);
    DrawActionName(row,NativeA15SettingsLabels.GetKeyByKo(KeyBindings.Name(action,false),LocaleCode,KeyBindings.Name(action,English)));
    DrawKey(mainR,mainText,mainL,1f,false);
    DrawKey(altR,altText,altL,1f,alt==null&&!altL);
    if(alt!=null){var dc=Hover(delR)?C(176,179,179):C(136,139,139);RunCentered(delR.center.x,delR.center.y,"✕",regular,14,14f,0,dc,1f,5);}
   }
   if(alt!=null&&Click(delR))keys.ClearSecondary(action);
   else if(Click(mainR))BeginListening(action,false);
   else if(Click(altR))BeginListening(action,true);
  }

  // `.set-key` in the quiet tier: flat #0a0d0d capsule, 1px hairline, Cinzel 14px; the empty alternate slot is a dim ghost
  void DrawKey(Rect r,string text,bool listening,float opacity,bool ghost){
   float keep=curA;bool hover=Hover(r);
   var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*curA*(ghost?.38f:1));
   NativeSilverHellUi.ActionPlate(r,false,listening||hover?1:0,hover&&ExoInput.Mouse(0),12,0);GUI.color=color;
   Color txt=listening?C(243,240,234):ghost?QDim:QBone;
   Font f=ghost||text.Length>0&&text[0]>127?semi:KeyFont(text);
   RunCentered(r.center.x,r.center.y,text,f,14,14f,0,txt,0,4);
   curA=keep;
  }
  void DrawResetButton(Rect r,string text,bool enabled){
   if(Event.current.type!=EventType.Repaint){if(enabled&&Click(r))ResetBindings();return;}
   float keep=curA;if(!enabled)curA=keep*.48f;bool hover=enabled&&Hover(r);
   if(inView(r)){
    var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*curA);NativeSilverHellUi.ActionPlate(r,false,hover?1:0,hover&&ExoInput.Mouse(0),22,4);GUI.color=color;
    RunCentered(r.center.x,r.center.y,text,semi,16,16f,0,QBone);
   }
   curA=keep;
  }

  // ---- gamepad tab (web layout; values are Unity state, which has none -> 미이식) ----
  float DrawPad(){
   bool paint=Event.current.type==EventType.Repaint;
   // title (grid-column 1/-1, border-top 1px #333636, 17.6px, margin 20 0 10)
   var title=R(0,82,ListW,38);
   if(paint&&inView(title)){Fill(new Rect(title.x,title.y,title.width,1),C(51,54,54));RunCentered(title.center.x,title.y+1+12+12.5f,T(ui.texts.padTitle),regular,18,17.6f,1.76f,C(172,175,175),0,2);}
   var rows=ui.padRows;float top=134;
   for(int i=0;i<rows.Length;i++){
    float rx=(i%2)*(ColW+ColGap),ry=top+(i/2)*RowPitch;var p=rows[i];var row=R(rx,ry,ColW,RowH);
    if(paint&&inView(row)){
     if(Hover(row))Fill(row,C(116,119,119,.086f));
     Fill(new Rect(row.x,row.yMax-1,row.width,1),C(120,123,123,.11f));
     Run(row.x+NameX,row.y+26,p.btn,regular,15,15f,.6f,C(204,201,195));
     Run(row.x+168.23f,row.y+26.2f,T(p.act),regular,14,14f,0,C(193,190,184));
     var kr=R(rx+512.11f,ry+5,333.88f,KeyH);float keep=curA;curA=keep*.48f;
     DrawKeyPlain(kr,p.@fixed?T(ui.texts.@fixed):"미이식",.48f);curA=keep;
    }
   }
   float rowsEnd=top+((rows.Length+1)/2)*RowPitch;float resetY=rowsEnd+8;
   DrawResetButton(R(0,resetY,ListW,44),T(ui.texts.padReset),false);
   // note box: 1px #333636 border, rgba(0,0,0,.35), padding 10/14, title 12.8px bold, 2-column guide rows 11.52px (100px button label + text)
   float ny=resetY+44+18;var note=R(0,ny,ListW,299.66f);
   if(paint&&inView(note)){
    Fill(note,new Color(0,0,0,.35f));Border(note,C(51,54,54));
    Run(note.x+15,note.y+11+11.5f,T(ui.texts.padGuide),bold,13,12.8f,1.024f,C(172,175,175),0,3);
    for(int i=0;i<ui.guide.Length;i++){
     float gx=note.x+11+(i%2)*(849+16),gy=note.y+11+23.03f+6+(i/2)*20.72f+10.36f;var g=ui.guide[i];
     Run(gx,gy,g.btn,bold,12,11.52f,0,C(170,173,173));Run(gx+100,gy,T(g.act),regular,12,11.52f,0,C(136,139,139));
    }
   }
   return ny+299.66f;
  }
  // disabled key look (`.set-key` + disabled): no hover / click
  void DrawKeyPlain(Rect r,string text,float opacity){
   var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*curA);NativeSilverHellUi.ActionPlate(r,false,0,false,12,0);GUI.color=color;
   RunCentered(r.center.x,r.y+1+(r.height-4)/2f,text,bold,14,14f,.28f,QBone,1f);
  }

  // ---- floating messages (web #ph 500ms: 28.8px 900, #ffaa44 glow, centre ~y879; #notif 1.5s box at y777) ----
  // Web quirk kept: #ph (z 15) and #notif (z 22) sit under the settings window (elementFromPoint at their centre = #keyBindList), so neither message is visible while the
  // list is shown. ToastsVisible=false = web; true draws them anyway (recommended UX, owner decides).
  public bool ToastsVisible;
  public void DrawToasts(){
   Init();if(!ToastsVisible||Event.current.type!=EventType.Repaint)return;float now=Time.unscaledTime;curA=1;
   if(phText!=null&&now<phUntil){
    float cx=960,cy=859+20.5f;var c=C(243,240,234);
    for(int k=0;k<3;k++){float ox=(k-1)*1.2f;RunCentered(cx+ox,cy,phText,bold,29,28.8f,5.76f,new Color(c.r,c.g,c.b,.16f));}
    RunCentered(cx,cy,phText,bold,29,28.8f,5.76f,c,.9f);
   }
   if(notifText!=null&&now<notifUntil){
    float w=Width(notifText,regular,18,17.6f,0)+44+2;var r=new Rect(960-w/2f,777,w,43);Fill(r,new Color(0,0,0,.4f));Border(r,C(90,43,34));
    Run(r.x+23,r.center.y,notifText,regular,18,17.6f,0,C(239,208,168),1f);
   }
  }
 }
}
