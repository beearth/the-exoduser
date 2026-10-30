using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // A15: the web #settings window (quiet tier, ui-quiet-tier.css) in the 1920x1080 design space.
 // Geometry = getBoundingClientRect dump of the live web page (pages origin 96,256; columns 0/882 wide 818; rows 48 high).
 // Values: web OPT names via NativeOptionSet; FPS cap / SFX / BGM keep their native hosts.
 public sealed partial class NativePauseMenu
 {
  enum K { Heading, Range, Check, Select, Button, Card, Diag, Rule, Keys }
  sealed class It { public K k;public string id="";public OptionDef def;public Rect r;public bool nav;public int navIdx=-1;public string text="";public bool danger;public int index; }
  static readonly OptionDef DefFps=new OptionDef("optFps","fpsCap",1,OptionKind.Range,0,5,1,5,"fps");
  static readonly OptionDef DefSfx=new OptionDef("optSfx","sfxVol",2,OptionKind.Range,0,100,1,60,"pct");
  static readonly OptionDef DefBgm=new OptionDef("optBgm","bgmVol",2,OptionKind.Range,0,100,1,60,"pct");
  static readonly Color Bone=new Color32(217,214,208,255),Title=new Color32(222,219,213,255),Sub=new Color32(165,168,168,255),Dim=new Color32(129,132,132,255),Brass=new Color32(127,130,130,255);
  static readonly Color Line=new Color32(146,149,149,128),LineSoft=new Color32(146,149,149,46),LineTab=new Color32(146,149,149,77),BoxLine=new Color32(146,149,149,153),Danger=new Color32(176,40,28,255);
  const float PagesX=96,PagesY=256,PagesW=1728,PagesH=727;
  readonly Dictionary<int,List<It>> a15Items=new Dictionary<int,List<It>>();
  readonly Dictionary<string,GUIStyle> a15Styles=new Dictionary<string,GUIStyle>();
  string a15ItemsLocale="";Texture2D windowBase,checkTex;Font myeongjo,cinzel;
  float[] a15Scroll=new float[4];int openSelect=-1;float popupScroll;bool resetConfirm;
  PauseMenuCommand a15Command;
  public Action<string> OptionChanged;
  public Action<string> LanguagePicked;
  public Func<int,string> DiagLine;
  // QA hooks (capture / smoke).
  public int A15OpenSelectIndex{get{return openSelect;}}
  public void A15SetScrollForQa(float v){a15Scroll[tab]=v;}
  public void A15OpenSelectForQa(string id){var items=Items();for(int i=0;i<items.Count;i++)if(items[i].id==id){openSelect=i;popupScroll=0;}}
  public void OpenSettingsDirect(){navigation.Reset();openSelect=-1;resetConfirm=false;navigation.DirectSettings=true;ShowSettings();}
  public static int[] A15NavRows(){return new[]{21,28,3,3};}
  // ---- text / fonts ----
  Font FontFor(string locale)
  {
   if(myeongjo==null){myeongjo=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??font;cinzel=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold")??myeongjo;}
   string code=LobbyLanguage.Normalize(locale);
   if(code=="ja"){var jp=Resources.Load<Font>("Art/fonts/NotoSerifCJKjp-Regular");if(jp!=null)return jp;}
   if(code=="ko"||code=="en")return myeongjo;
   var regional=NativeA15SettingsLabels.FontForLocale(code,null);
   return regional??myeongjo;
  }
  string W(string key,string fallback=""){return NativeOptionText.Get(key,LocaleCode,fallback);}
  GUIStyle St(int size,FontStyle fs,Color c,TextAnchor a,bool display=false)
  {
   string key=size+"|"+fs+"|"+ColorUtility.ToHtmlStringRGBA(c)+"|"+a+"|"+display+"|"+LocaleCode;GUIStyle s;
   if(a15Styles.TryGetValue(key,out s))return s;
   s=new GUIStyle(GUI.skin.label){font=display?(cinzel??FontFor(LocaleCode)):FontFor(LocaleCode),fontSize=size,fontStyle=fs,alignment=a,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};
   s.normal.textColor=c;a15Styles[key]=s;return s;
  }
  void Txt(Rect r,string text,int size,Color c,TextAnchor a=TextAnchor.MiddleLeft,FontStyle fs=FontStyle.Normal,bool display=false){NativeSilverHellUi.Label(r,text,St(size,fs,c,a,display));}
  float TW(string text,int size,FontStyle fs,bool display=false){return St(size,fs,Color.white,TextAnchor.MiddleLeft,display).CalcSize(new GUIContent(text)).x;}
  // CSS letter-spacing: per-glyph for scripts that do not join (the web uses .08em on headings).
  void Spaced(Rect r,string text,int size,Color c,float spacing,FontStyle fs=FontStyle.Bold,bool display=false)
  {
   string code=LobbyLanguage.Normalize(LocaleCode);
   if(code=="th"||code=="ar"||spacing<=0){Txt(r,text,size,c,TextAnchor.MiddleLeft,fs,display);return;}
   float x=r.x;var st=St(size,fs,c,TextAnchor.MiddleLeft,display);
   foreach(char ch in text){string g=ch.ToString();NativeSilverHellUi.Label(new Rect(x,r.y,size*2,r.height),g,st);x+=st.CalcSize(new GUIContent(g)).x+spacing;}
  }
  // ---- primitives ----
  static void HLine(float x,float y,float w,Color c){Fill(new Rect(x,y,w,1),c);}
  static Texture2D diamondTex;
  // Filled diamond as a texture: GUIUtility.RotateAroundPivot is wrong under a scaled matrix inside a group.
  void Diamond(float cx,float cy,float size,Color c)
  {
   if(diamondTex==null){const int n=32;diamondTex=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
    for(int y=0;y<n;y++)for(int x=0;x<n;x++){float d=Mathf.Abs((x+.5f)/n-.5f)+Mathf.Abs((y+.5f)/n-.5f);px[y*n+x]=new Color(1,1,1,Mathf.Clamp01((.5f-d)*n*.7f));}
    diamondTex.SetPixels(px);diamondTex.Apply(false,true);}
   var oc=GUI.color;GUI.color=c;float h=size*1.42f;GUI.DrawTexture(new Rect(cx-h/2,cy-h/2,h,h),diamondTex);GUI.color=oc;
  }
  string FmtCap(int cap){return cap==0?W("v.unlimited","Unlimited"):cap.ToString();}
  int GetVal(OptionDef d)
  {
   if(d.Id=="optFps"){for(int i=0;i<NativeSettingsState.FrameCapCount;i++)if(NativeSettingsState.GetFrameCap(i)==settings.FrameCap)return i;return 5;}
   if(d.Id=="optSfx")return settings.SfxPercent;if(d.Id=="optBgm")return settings.BgmPercent;
   return settings.Options.Get(d.Key);
  }
  void SetVal(OptionDef d,int v)
  {
   v=d.Clamp(v);
   if(d.Id=="optFps"){int cap=NativeSettingsState.GetFrameCap(v);if(frameCapChanged!=null&&cap!=settings.FrameCap){settings.TrySetFrameCap(cap);frameCapChanged(cap);}return;}
   if(d.Id=="optSfx"){if(sfxChanged!=null&&v!=settings.SfxPercent){settings.SetSfxPercent(v);sfxChanged(settings.SfxPercent);}return;}
   if(d.Id=="optBgm"){if(bgmChanged!=null&&v!=settings.BgmPercent){settings.SetBgmPercent(v);bgmChanged(settings.BgmPercent);}return;}
   if(settings.Options.Get(d.Key)==v)return;
   settings.Options.Set(d.Key,v);if(OptionChanged!=null)OptionChanged(d.Key);
  }
  Color ValueColor(OptionDef d,int v)
  {
   if(d.Format=="rar"){Color[] c={new Color32(170,170,170,255),new Color32(68,204,68,255),new Color32(68,136,255,255),new Color32(187,68,255,255),new Color32(255,170,0,255)};return c[Mathf.Clamp(v,0,4)];}
   if((d.Format=="fuse"||d.Format=="enh")&&v>=0){Color[] c={new Color32(136,136,136,255),new Color32(68,204,68,255),new Color32(68,136,255,255),new Color32(204,68,255,255),new Color32(255,170,0,255)};return c[Mathf.Clamp(v,0,4)];}
   return Title;
  }
  string Fmt(OptionDef d,int v)
  {
   string[] list;
   switch(d.Format){
    case "pct":return v+"%";
    case "num":return v.ToString();
    case "fps":return FmtCap(NativeSettingsState.GetFrameCap(Mathf.Clamp(v,0,NativeSettingsState.FrameCapCount-1)));
    case "diff":list=NativeOptionText.List("v.diff",LocaleCode);return v<list.Length?list[v]:"";
    case "autopot":return "HP "+v+W("v.autoPot","% or below");
    case "rar":list=NativeOptionText.List("v.rar",LocaleCode);return v<list.Length?list[v]:"";
    case "minlv":{if(v==0)return W("v.off","Off");int l=v==7?1000:v*100;return v+W("v.minLv","T (@Lv+)").Replace("@",l.ToString());}
    case "fuse":return v<0?W("v.off","Off"):(v+1)+NativeOptionText.CountSuffix("v.fuse",LocaleCode);
    case "enh":return v<0?W("v.off","Off"):(v+1)+NativeOptionText.CountSuffix("v.enh",LocaleCode);
   }
   return v.ToString();
  }
  // ---- layout ----
  List<It> Items()
  {
   string locale=LobbyLanguage.Normalize(LocaleCode);
   if(locale!=a15ItemsLocale){a15Items.Clear();a15ItemsLocale=locale;}
   List<It> list;if(a15Items.TryGetValue(tab,out list))return list;
   list=BuildItems(tab);a15Items[tab]=list;return list;
  }
  It Add(List<It> l,K k,string id,Rect r,bool nav,string text="",OptionDef def=null,bool danger=false)
  {
   var it=new It{k=k,id=id,r=r,nav=nav,text=text,def=def,danger=danger};if(nav){int n=0;foreach(var o in l)if(o.nav)n++;it.navIdx=n;}l.Add(it);return it;
  }
  float BtnW(string text){return Mathf.Ceil(TW(text,16,FontStyle.Bold)*.9f+48);}
  OptionDef Def(string key){var d=NativeOptionSet.Find(key);return d;}
  void RowFor(List<It> l,OptionDef d,float x,float y,float w)
  {
   K kind=d.Kind==OptionKind.Range?K.Range:d.Kind==OptionKind.Check?K.Check:K.Select;
   Add(l,kind,d.Id,new Rect(x,y,w,48),true,"",d);
  }
  List<It> BuildItems(int t)
  {
   var l=new List<It>();
   if(t==0)
   {
    Add(l,K.Heading,"h.system",new Rect(0,10,818,31),false);Add(l,K.Heading,"h.char",new Rect(882,10,818,31),false);
    Add(l,K.Select,"optLang",new Rect(0,57,818,48),true);
    string fs=W("b.fullscreen","Fullscreen (F11)"),lobby=W("b.toLobbyBtn2","Character select (lobby)");
    float w1=BtnW(fs),w2=BtnW(lobby);
    Add(l,K.Button,"fullscreen",new Rect(0,129.5f,w1,40),true,fs);Add(l,K.Button,"lobby",new Rect(w1+12,129.5f,w2,40),true,lobby);
    Add(l,K.Heading,"h.preset",new Rect(0,201.8f,818,31),false);
    string[] pk={"saveP1","loadP1","saveP2","loadP2"};float px=0;
    foreach(string id in pk){string tx=W("b."+id,id);float w=BtnW(tx);Add(l,K.Button,id,new Rect(px,244.8f,w,40),true,tx);px+=w+12;}
    Add(l,K.Card,"char0",new Rect(882,53,220,242),true);Add(l,K.Card,"char1",new Rect(1118,53,220,242),true);
    Add(l,K.Heading,"h.gameopt",new Rect(0,317,1700,31),false);
    int i=0;foreach(var d in NativeOptionSet.All)if(d.Tab==0){RowFor(l,d,(i%2)*882,356+56*(i/2),818);i++;}
    Add(l,K.Rule,"red",new Rect(0,650,818,1),false);Add(l,K.Rule,"red",new Rect(882,650,818,1),false);
    string reset=W("b.resetBtn","Reset game"),quit=W("b.quitBtn","Quit game");
    Add(l,K.Button,"reset",new Rect(0,671,BtnW(reset),40),true,reset,null,true);Add(l,K.Button,"quit",new Rect(882,671,BtnW(quit),40),true,quit,null,true);
   }
   else if(t==1)
   {
    Add(l,K.Heading,"h.fx",new Rect(0,10,818,31),false);Add(l,K.Heading,"h.gfx",new Rect(882,10,818,31),false);
    OptionDef[] left={Def("shake"),Def("textScale"),Def("panelFit"),Def("parts"),DefFps,Def("resScale"),Def("irisSz"),Def("brightness"),Def("irisGlow")};
    for(int i=0;i<left.Length;i++)RowFor(l,left[i],0,47+48*i,818);
    string[] gf=NativeOptionText.List("b.gfx",LocaleCode);float gx=882;
    for(int i=0;i<5;i++){string tx=i<gf.Length?gf[i]:i.ToString();float w=Mathf.Max(76.4f,BtnW(tx)-4);Add(l,K.Button,"gfx"+i,new Rect(gx,63,w,40),true,tx).index=i;gx+=w+12;}
    string[] right={"bloom","trail","slash","postfx","deathFx","lighting","torch","atmos","ambPart","fog","grain","outline","showFps"};
    for(int i=0;i<right.Length;i++)RowFor(l,Def(right[i]),882+(i%2)*419,117+52*(i/2),399);
    Add(l,K.Heading,"h.diag",new Rect(0,501,1700,31),false);
    Add(l,K.Diag,"diag",new Rect(0,544,1494,108),false);
    Add(l,K.Button,"rediag",new Rect(1510,544,190,40),true,W("b.btnRedetect","Redetect"));
   }
   else if(t==2)
   {
    Add(l,K.Heading,"h.audio",new Rect(0,10,1700,29),false);
    RowFor(l,DefSfx,0,45,960);RowFor(l,DefBgm,0,93,960);
    Add(l,K.Select,"optBgmTrack",new Rect(0,141,960,48),true);
   }
   else
   {
    Add(l,K.Heading,"h.cursor",new Rect(0,10,1700,21),false);
    Add(l,K.Card,"cur0",new Rect(0,43,200,111),true);Add(l,K.Card,"cur1",new Rect(216,43,200,111),true);
    RowFor(l,Def("cursorSize"),0,168,960);
    Add(l,K.Heading,"h.keys",new Rect(0,216,1700,31),false);Add(l,K.Keys,"keys",new Rect(0,253,1700,0),false);
   }
   return l;
  }
  // ---- drawing ----
  PauseMenuCommand DrawA15Window(bool fullscreen)
  {
   a15Command=PauseMenuCommand.None;
   if(windowBase==null)windowBase=Resources.Load<Texture2D>("Art/ui/settings/window_base");
   Texture2D tex=windowBase;if(tex!=null)GUI.DrawTexture(new Rect(0,0,1920,1080),tex,ScaleMode.StretchToFill,true);
   NativePanelTabBar.Draw(NativePanelTabBar.Preset.Settings,"settings");
   // Title block: SETTINGS (Cinzel) over the serif title, hairline 120% of the title width.
   Spaced(new Rect(96,111,300,16),"SETTINGS",13,Sub,1.8f,FontStyle.Bold,true);
   string title=W("title",T("설정","Settings"));float tw=TW(title,40,FontStyle.Bold);
   Txt(new Rect(96,137,700,48),title,40,Title,TextAnchor.MiddleLeft,FontStyle.Bold);HLine(96,196,Mathf.Max(60,tw*1.2f),Line);
   // Tabs.
   bool navOn=GUI.enabled;if(keyList!=null&&keyList.Listening)GUI.enabled=false;
   string[] keys={"tab.game","tab.display","tab.audio","tab.controls"};string[] fb={T("게임","Game"),T("화면","Display"),T("사운드","Audio"),T("조작","Controls")};
   float x=96;
   for(int i=0;i<4;i++)
   {
    string s=W(keys[i],fb[i]);float w=TW(s,18,FontStyle.Bold)+4;var r=new Rect(x,213,w,42);bool sel=tab==i;
    PointAt(r,i);bool focus=navigation.Focused&&navigation.Cursor==i;
    Txt(new Rect(x+2,213+8,w,22),s,18,sel?Title:focus?Bone:Sub,TextAnchor.MiddleLeft,FontStyle.Bold);
    if(sel)Fill(new Rect(x,253,w,2),new Color32(176,40,28,255));else if(focus)Fill(new Rect(x,253,w,1),Line);
    if(NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none)){if(tab!=i){tab=i;openSelect=-1;}navigation.Fence();}
    x+=w+40;
   }
   HLine(96,255,1728,LineTab);
   GUI.enabled=navOn;
   var items=Items();
   var pages=new Rect(PagesX,PagesY,PagesW,PagesH);
   float contentH=ContentHeight(items),max=Mathf.Max(0,contentH-PagesH);
   Event e=Event.current;
   if(e.type==EventType.ScrollWheel&&pages.Contains(e.mousePosition)&&openSelect<0){a15Scroll[tab]=Mathf.Clamp(a15Scroll[tab]+e.delta.y*40f,0,max);e.Use();}
   a15Scroll[tab]=Mathf.Clamp(a15Scroll[tab],0,max);
   if(navigation.Focused&&navigation.Cursor>=4)EnsureVisible(items,max);
   float sy=a15Scroll[tab];
   bool popup=openSelect>=0;bool wasEnabled=GUI.enabled;if(popup)GUI.enabled=false;
   GUI.BeginGroup(pages);
   foreach(var it in items)DrawItem(it,sy,fullscreen);
   GUI.EndGroup();
   GUI.enabled=wasEnabled;
   if(max>0&&sy<max-1)Fill(new Rect(PagesX,PagesY+PagesH-24,PagesW,24),new Color32(16,19,19,200));
   // Footer: autosave note + close.
   HLine(96,983,1728,LineSoft);
   Txt(new Rect(96,1004,500,20),W("b.settingsAutoSaveLabel","✓ Settings saved automatically"),14,SettingsPersistenceProblem||!SettingsPersistenceEnabled?new Color32(127,130,130,255):new Color32(120,160,128,255));
   if(SettingsHostApplyPending||SettingsHostApplyFailed||SettingsPersistenceProblem||!SettingsPersistenceEnabled)Txt(new Rect(96,1022,1200,18),SettingsPersistenceNotice(),11,Dim);
   if(Time.unscaledTime<presetNoteUntil)Txt(new Rect(260,1004,600,20),presetNote,14,new Color32(120,200,150,255));
   var close=new Rect(1644,994,180,40);int closeIdx=navigation.Count-1;
   DrawButton(close,W("b.setClose",T("닫기 [ESC]","Close [ESC]")),false,false);PointAt(close,closeIdx);FocusBorder(close,closeIdx);
   if(!popup&&NativeSilverHellUi.Button(close,GUIContent.none,GUIStyle.none)&&!(keyList!=null&&keyList.Listening)){navigation.Fence();if(!navigation.BackPage())a15Command=PauseMenuCommand.Resume;}
   if(popup)DrawPopup(items,sy);
   return a15Command;
  }
  float ContentHeight(List<It> items)
  {
   float h=0;foreach(var it in items){float b=it.r.yMax;if(it.k==K.Keys){if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);b=it.r.y+keyList.ContentHeight;}if(b>h)h=b;}
   return h+12;
  }
  void EnsureVisible(List<It> items,float max)
  {
   int idx=navigation.Cursor-4;
   foreach(var it in items)if(it.nav&&it.navIdx==idx){float top=it.r.y,bottom=it.r.yMax;if(top-a15Scroll[tab]<0)a15Scroll[tab]=Mathf.Clamp(top-8,0,max);else if(bottom-a15Scroll[tab]>PagesH)a15Scroll[tab]=Mathf.Clamp(bottom-PagesH+8,0,max);}
  }
  void DrawButton(Rect r,string text,bool selected,bool danger)
  {
   bool hover=r.Contains(Event.current.mousePosition);
   NativeSilverHellUi.ActionPlate(r,false,selected||hover?1:0,hover&&ExoInput.Mouse(0),22,4);
   Txt(r,text,16,danger?new Color32(176,179,179,255):Bone,TextAnchor.MiddleCenter,FontStyle.Normal);
  }
  bool Clicked(Rect r){return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);}
  void DrawItem(It it,float sy,bool fullscreen)
  {
   var r=new Rect(it.r.x,it.r.y-sy,it.r.width,it.r.height);
   if(r.yMax<0||r.y>PagesH)return;
   int cursor=it.nav?4+it.navIdx:-1;
   switch(it.k)
   {
    case K.Heading:
    {
     string text=it.id=="h.audio"?W("h.audio",T("사운드","Audio")):W(it.id,"");
     Spaced(new Rect(r.x,r.y,r.width,21),text,15,Sub,1.2f,FontStyle.Bold);if(r.height>=29)HLine(r.x,r.y+r.height-1,r.width,Line);break;
    }
    case K.Rule:Fill(r,new Color32(110,32,26,255));break;
    case K.Range:DrawRange(it,r,cursor);break;
    case K.Check:DrawCheck(it,r,cursor);break;
    case K.Select:DrawSelectRow(it,r,cursor);break;
    case K.Button:DrawActionButton(it,r,cursor,fullscreen);break;
    case K.Card:DrawCard(it,r,cursor);break;
    case K.Diag:DrawDiag(r);break;
    case K.Keys:DrawKeys(it,sy);break;
   }
  }
  string RowName(It it)
  {
   if(it.id=="optLang")return "Language";
   string key="n."+it.id;
   if(it.id=="optBgmTrack")return W("n.optBgmTrack","BGM");
   if(it.id=="optCursor")return "";
   string fallback=it.def!=null?it.def.Key:it.id;
   return W(key,fallback);
  }
  void DrawRowFrame(It it,Rect r,int cursor,float nameW)
  {
   PointAt(r,cursor);
   HLine(r.x,r.y+47,r.width,LineSoft);
   Txt(new Rect(r.x,r.y+12,nameW,24),RowName(it),17,Bone);
   if(navigation.Focused&&cursor>=0&&navigation.Cursor==cursor)Border(new Rect(r.x-4,r.y-1,r.width+8,50),new Color32(230,227,220,255));
  }
  void DrawRange(It it,Rect r,int cursor)
  {
   var d=it.def;DrawRowFrame(it,r,cursor,230);
   int v=GetVal(d);float valW=112,ctlW=r.width-250-valW-20;if(r.width>900)ctlW=r.width-250-valW-20;
   var ctl=new Rect(r.x+250,r.y+13.5f,ctlW,20);
   Txt(new Rect(r.xMax-valW,r.y+13,valW,21),Fmt(d,v),15,ValueColor(d,v),TextAnchor.MiddleRight,FontStyle.Bold,false);
   float t=(v-d.Min)/(float)(d.Max-d.Min);
   Fill(new Rect(ctl.x,ctl.y+9.5f,ctl.width,1),new Color32(146,149,149,90));
   Diamond(ctl.x+4.5f+(ctl.width-9)*t,ctl.y+10,9,Brass);
   int id=GUIUtility.GetControlID(FocusType.Passive);Event e=Event.current;
   var hit=new Rect(ctl.x-4,ctl.y-6,ctl.width+8,32);
   if(e.type==EventType.MouseDown&&e.button==0&&hit.Contains(e.mousePosition)&&GUI.enabled){GUIUtility.hotControl=id;e.Use();SetFromMouse(d,ctl,e.mousePosition.x);navigation.Fence();navigation.PointAt(cursor);}
   else if(e.type==EventType.MouseDrag&&GUIUtility.hotControl==id){SetFromMouse(d,ctl,e.mousePosition.x);e.Use();}
   else if(e.type==EventType.MouseUp&&GUIUtility.hotControl==id){GUIUtility.hotControl=0;e.Use();}
  }
  void SetFromMouse(OptionDef d,Rect ctl,float mx)
  {
   float t=Mathf.Clamp01((mx-ctl.x-4.5f)/(ctl.width-9));SetVal(d,Mathf.RoundToInt(d.Min+t*(d.Max-d.Min)));
  }
  void DrawCheck(It it,Rect r,int cursor)
  {
   var d=it.def;DrawRowFrame(it,r,cursor,r.width-18-20);
   var box=new Rect(r.xMax-18,r.y+14.5f,18,18);bool on=GetVal(d)!=0;
   Fill(box,new Color32(10,13,13,255));Border(box,on?new Color32(217,214,208,200):BoxLine);
   if(on)Diamond(box.center.x,box.center.y,6,Brass);
   var hit=new Rect(r.x,r.y,r.width,47);
   if(Clicked(hit)){SetVal(d,on?0:1);navigation.Fence();navigation.PointAt(cursor);}
  }
  List<string> SelectLabels(It it,out int current,out List<string> values)
  {
   var labels=new List<string>();values=new List<string>();current=0;
   if(it.id=="optLang"){for(int i=0;i<LobbyLanguage.Count;i++){string c=LobbyLanguage.GetCode(i);values.Add(c);labels.Add(LobbyLanguage.GetDisplayName(c));if(c==LobbyLanguage.Normalize(LocaleCode))current=i;}}
   else if(it.id=="optAtmos"){var l=NativeOptionText.List("atmos",LocaleCode);for(int i=0;i<l.Length;i++){values.Add(i.ToString());labels.Add(l[i]);}current=Mathf.Clamp(settings.Options.Get("atmos"),0,Mathf.Max(0,l.Length-1));}
   else if(it.id=="optBgmTrack"){var v=NativeOptionText.List("bgm.values",LocaleCode);var l=NativeOptionText.List("bgm.labels",LocaleCode);for(int i=0;i<v.Length&&i<l.Length;i++){values.Add(v[i]);labels.Add(l[i]);if(v[i]==settings.Options.BgmTrack)current=i;}}
   return labels;
  }
  void ApplySelect(It it,int index,List<string> values)
  {
   if(index<0||index>=values.Count)return;
   if(it.id=="optLang"){if(LanguagePicked!=null)LanguagePicked(values[index]);}
   else if(it.id=="optAtmos"){settings.Options.Set("atmos",index);if(OptionChanged!=null)OptionChanged("atmos");}
   else if(it.id=="optBgmTrack"){settings.Options.BgmTrack=values[index];if(OptionChanged!=null)OptionChanged("bgmTrack");}
  }
  void DrawSelectRow(It it,Rect r,int cursor)
  {
   int current;List<string> values;var labels=SelectLabels(it,out current,out values);
   float selW=it.id=="optAtmos"?160:280;
   DrawRowFrame(it,r,cursor,r.width-selW-20);
   var box=new Rect(r.xMax-selW,r.y+4.5f,selW,38);
   Fill(box,new Color32(10,13,13,255));Border(box,Line);
   string label=current<labels.Count?labels[current]:"";
   Txt(new Rect(box.x+14,box.y,selW-48,38),label,16,Bone);
   float cx=box.xMax-17,cy=box.center.y;Fill(new Rect(cx-4,cy-1,2,2),Sub);Fill(new Rect(cx-2,cy+1,4,2),Sub);Fill(new Rect(cx+2,cy-1,2,2),Sub);
   if(Clicked(box)){openSelect=Items().IndexOf(it);popupScroll=Mathf.Max(0,current*34-100);navigation.Fence();navigation.PointAt(cursor);}
  }
  void DrawPopup(List<It> items,float sy)
  {
   if(openSelect<0||openSelect>=items.Count){openSelect=-1;return;}
   var it=items[openSelect];int current;List<string> values;var labels=SelectLabels(it,out current,out values);
   float selW=it.id=="optAtmos"?160:280;
   var box=new Rect(PagesX+it.r.xMax-selW,PagesY+it.r.y-sy+4.5f+38,selW,Mathf.Min(34*labels.Count+4,34*9+4));
   if(box.yMax>1070){box.y=PagesY+it.r.y-sy+4.5f-box.height;}
   Event e=Event.current;float max=Mathf.Max(0,34*labels.Count+4-box.height);
   if(e.type==EventType.ScrollWheel&&box.Contains(e.mousePosition)){popupScroll=Mathf.Clamp(popupScroll+e.delta.y*34f,0,max);e.Use();}
   popupScroll=Mathf.Clamp(popupScroll,0,max);
   Fill(box,new Color32(10,13,13,250));Border(box,BoxLine);
   GUI.BeginGroup(box);
   for(int i=0;i<labels.Count;i++)
   {
    var row=new Rect(2,2+i*34-popupScroll,box.width-4,34);if(row.yMax<0||row.y>box.height)continue;
    bool hover=row.Contains(e.mousePosition);
    if(i==current)Fill(row,new Color32(34,37,37,255));else if(hover)Fill(row,new Color32(27,30,30,255));
    Txt(new Rect(row.x+12,row.y,row.width-16,34),labels[i],15,i==current?Title:Bone);
    if(NativeSilverHellUi.Button(row,GUIContent.none,GUIStyle.none)){ApplySelect(it,i,values);openSelect=-1;navigation.Fence();}
   }
   GUI.EndGroup();
   if(e.type==EventType.MouseDown&&!box.Contains(e.mousePosition)){openSelect=-1;e.Use();}
   if(e.type==EventType.KeyDown&&e.keyCode==KeyCode.Escape){openSelect=-1;e.Use();}
  }
  void DrawActionButton(It it,Rect r,int cursor,bool fullscreen)
  {
   PointAt(r,cursor);
   bool selected=false;
   if(it.id.StartsWith("gfx",StringComparison.Ordinal))selected=settings.Options.DetectPreset()==it.index;
   if(it.id=="fullscreen")selected=fullscreen;
   string text=it.text;
   if(it.id=="reset"&&resetConfirm){text=W("b.resetYes",T("확인","Confirm"));}
   DrawButton(r,text,selected,it.danger);
   if(navigation.Focused&&cursor>=0&&navigation.Cursor==cursor)Border(new Rect(r.x-3,r.y-3,r.width+6,r.height+6),new Color32(230,227,220,255));
   if(Clicked(r)){navigation.Fence();navigation.PointAt(cursor);Activate(it,fullscreen);}
  }
  void Activate(It it,bool fullscreen)
  {
   switch(it.id)
   {
    case "fullscreen":if(fullscreenChanged!=null)fullscreenChanged(!fullscreen);break;
    case "lobby":a15Command=PauseMenuCommand.ReturnLobby;break;
    case "saveP1":SavePreset(0);break;case "saveP2":SavePreset(1);break;
    case "loadP1":LoadPreset(0);break;case "loadP2":LoadPreset(1);break;
    case "reset":if(resetConfirm){resetConfirm=false;a15Command=PauseMenuCommand.Restart;}else resetConfirm=true;break;
    case "quit":navigation.Open(PausePage.Quit);break;
    case "rediag":break;
    default:if(it.id.StartsWith("gfx",StringComparison.Ordinal)){settings.Options.ApplyPreset(it.index);if(OptionChanged!=null)OptionChanged("parts");}break;
   }
  }
  // Web _savePreset/_loadPreset: opt + the audio/FPS values in one JSON per slot.
  string PresetJson(){return "{\"opt\":"+settings.Options.Encode()+",\"sfxVol\":"+settings.SfxPercent+",\"bgmVol\":"+settings.BgmPercent+",\"fpsCap\":"+settings.FrameCap+"}";}
  void SavePreset(int slot){settings.Presets[slot]=PresetJson();if(OptionChanged!=null)OptionChanged("preset");presetNote=T("세팅"+(slot+1)+" 저장 완료!","Preset "+(slot+1)+" saved!");presetNoteUntil=Time.unscaledTime+2;}
  string presetNote="";float presetNoteUntil;
  void LoadPreset(int slot)
  {
   string json=settings.Presets[slot];if(string.IsNullOrEmpty(json))return;
   int at=json.IndexOf("\"opt\":",StringComparison.Ordinal);if(at<0)return;
   int start=json.IndexOf('{',at),end=json.IndexOf("},\"sfxVol\"",start,StringComparison.Ordinal);if(start<0||end<0)return;
   settings.Options.Decode(json.Substring(start,end-start+1));
   int sfx,bgm,cap;
   if(TryInt(json,"sfxVol",out sfx)&&sfxChanged!=null){settings.SetSfxPercent(sfx);sfxChanged(settings.SfxPercent);}
   if(TryInt(json,"bgmVol",out bgm)&&bgmChanged!=null){settings.SetBgmPercent(bgm);bgmChanged(settings.BgmPercent);}
   if(TryInt(json,"fpsCap",out cap)&&frameCapChanged!=null&&NativeSettingsState.IsFrameCapSupported(cap)){settings.TrySetFrameCap(cap);frameCapChanged(cap);}
   if(OptionChanged!=null)OptionChanged("preset");presetNote=T("세팅"+(slot+1)+" 불러옴","Preset "+(slot+1)+" loaded");presetNoteUntil=Time.unscaledTime+2;
  }
  static bool TryInt(string json,string key,out int value)
  {
   value=0;int at=json.IndexOf("\""+key+"\":",StringComparison.Ordinal);if(at<0)return false;at+=key.Length+3;int e=at;while(e<json.Length&&(char.IsDigit(json[e])||json[e]=='-'))e++;
   return int.TryParse(json.Substring(at,e-at),out value);
  }
  void DrawCard(It it,Rect r,int cursor)
  {
   PointAt(r,cursor);
   bool character=it.id.StartsWith("char",StringComparison.Ordinal);
   int idx=it.id.EndsWith("1",StringComparison.Ordinal)?1:0;
   bool sel=character?idx==CharacterIndex:settings.Options.Get("cursor")==idx;
   Fill(r,sel?new Color32(28,31,31,255):new Color32(15,18,18,255));Border(r,sel?new Color32(217,214,208,220):new Color32(146,149,149,70));
   if(character)
   {
    string[] parts=W("char."+idx,"").Split('\u0002');
    Texture2D sprite=Resources.Load<Texture2D>("Art/ui/settings/char_"+idx);
    if(sprite!=null){sprite.filterMode=FilterMode.Point;GUI.DrawTexture(new Rect(r.x+r.width/2-44,r.y+14,88,88),sprite,ScaleMode.ScaleToFit,true);}
    Txt(new Rect(r.x+8,r.y+118,r.width-16,24),parts.Length>0?parts[0]:"",16,sel?Title:Bone,TextAnchor.MiddleCenter,FontStyle.Bold);
    var desc=St(13,FontStyle.Normal,Dim,TextAnchor.UpperCenter);desc.wordWrap=true;
    NativeSilverHellUi.Label(new Rect(r.x+14,r.y+146,r.width-28,48),parts.Length>1?parts[1]:"",desc);
    if(sel&&parts.Length>2)Txt(new Rect(r.x+8,r.y+210,r.width-16,20),parts[2],13,Sub,TextAnchor.MiddleCenter);
   }
   else
   {
    string[] names=NativeOptionText.List("cursor",LocaleCode);
    Texture2D art=Resources.Load<Texture2D>("Art/ui/settings/cursor_"+idx);
    if(art!=null)GUI.DrawTexture(new Rect(r.center.x-24,r.y+14,48,48),art,ScaleMode.ScaleToFit,true);
    else Diamond(r.center.x,r.y+34,26,idx==0?new Color32(176,40,28,255):new Color32(120,86,190,255));
    Txt(new Rect(r.x+8,r.y+66,r.width-16,28),idx<names.Length?names[idx]:"",13,sel?Title:Bone,TextAnchor.MiddleCenter,FontStyle.Bold);
   }
   if(navigation.Focused&&cursor>=0&&navigation.Cursor==cursor)Border(new Rect(r.x-3,r.y-3,r.width+6,r.height+6),new Color32(230,227,220,255));
   if(!character&&Clicked(r)){settings.Options.Set("cursor",idx);if(OptionChanged!=null)OptionChanged("cursor");navigation.Fence();navigation.PointAt(cursor);}
  }
  public int CharacterIndex { get; set; }
  void DrawDiag(Rect r)
  {
   Fill(r,new Color32(10,13,13,180));Border(r,LineSoft);
   string[] labels={"GPU:",T("그래픽 API:","Graphics API:"),W("b.diagTier",T("성능 등급:","Performance tier:")),W("b.diagBench",T("벤치 FPS:","Bench FPS:"))};
   float[] xs={0,400,892,1188};float[] ws={388,480,288,288};
   for(int i=0;i<4;i++)
   {
    float x=r.x+16+xs[i];
    Txt(new Rect(x,r.y+14,ws[i],22),labels[i],14,Dim,TextAnchor.MiddleLeft,FontStyle.Normal,false);
    string value=DiagLine!=null?DiagLine(i):"";
    var st=St(i==0?15:i==1?15:18,FontStyle.Normal,i==2?new Color32(255,204,68,255):Bone,TextAnchor.UpperLeft);st.wordWrap=i<2;
    NativeSilverHellUi.Label(new Rect(x,r.y+40,ws[i],60),value,st);
   }
  }
  void DrawKeys(It it,float sy)
  {
   if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);
   keyList.English=English;keyList.LocaleCode=LocaleCode;
   if(SettingsPersistenceProblem){keyList.SaveNote="키 설정을 저장하지 못했습니다 · 이번 실행의 값은 유지됩니다";keyList.SaveNoteEn="Key bindings could not be saved · current session values remain";}
   else if(SettingsPersistenceEnabled){keyList.SaveNote="키 설정 변경은 이 PC에 자동 저장됩니다";keyList.SaveNoteEn="Key binding changes are saved on this PC";}
   else{keyList.SaveNote="검수 실행의 키 설정은 저장하지 않습니다";keyList.SaveNoteEn="Key bindings are not saved during this QA run";}
   TraceHitForQa("menu",new Rect(PagesX,PagesY,PagesW,PagesH),0);
   keyList.Draw(new Vector2(it.r.x,it.r.y-sy),new Rect(0,0,PagesW,PagesH));
   TraceHitForQa("group-after",new Rect(PagesX,PagesY,PagesW,PagesH),0);
  }
  void A15PopupKeys()
  {
   var items=Items();if(openSelect<0||openSelect>=items.Count){openSelect=-1;return;}
   var it=items[openSelect];int cur;List<string> values;SelectLabels(it,out cur,out values);
   if(ExoInput.KeyDown(KeyCode.Escape)||ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)){openSelect=-1;navigation.Fence();return;}
   if(ExoInput.KeyDown(KeyCode.UpArrow)&&cur>0){ApplySelect(it,cur-1,values);popupScroll=Mathf.Max(0,(cur-1)*34-100);}
   if(ExoInput.KeyDown(KeyCode.DownArrow)&&cur<values.Count-1){ApplySelect(it,cur+1,values);popupScroll=Mathf.Max(0,(cur+1)*34-100);}
  }
  // ---- keyboard rows (PauseNavigation row mode) ----
  void A15RowKey(PauseAction action,bool fullscreen)
  {
   var items=Items();int idx=navigation.Cursor-4;It it=null;foreach(var o in items)if(o.nav&&o.navIdx==idx)it=o;
   if(it==null)return;int dir=action==PauseAction.RowLeft?-1:action==PauseAction.RowRight?1:0;
   if(openSelect>=0)return;
   switch(it.k)
   {
    case K.Range:{var d=it.def;int step=d.Step>1?d.Step:1;if(dir!=0)SetVal(d,GetVal(d)+dir*step);break;}   // web _gpUIStep (13810): +(cur.step)||1 - a range without a step attribute (optSfx, optBgm, optShake, optIrisGlow ...) moves by 1
    case K.Check:if(dir!=0||action==PauseAction.RowAccept)SetVal(it.def,GetVal(it.def)!=0?0:1);break;
    case K.Select:{int cur;List<string> values;SelectLabels(it,out cur,out values);if(dir!=0)ApplySelect(it,Mathf.Clamp(cur+dir,0,values.Count-1),values);else if(action==PauseAction.RowAccept){openSelect=items.IndexOf(it);popupScroll=Mathf.Max(0,cur*34-100);}break;}
    case K.Button:case K.Card:if(action==PauseAction.RowAccept){if(it.k==K.Card&&it.id.StartsWith("cur",StringComparison.Ordinal)){settings.Options.Set("cursor",it.id.EndsWith("1",StringComparison.Ordinal)?1:0);if(OptionChanged!=null)OptionChanged("cursor");}else if(it.k==K.Button)Activate(it,fullscreen);}break;
   }
  }
 }
}
