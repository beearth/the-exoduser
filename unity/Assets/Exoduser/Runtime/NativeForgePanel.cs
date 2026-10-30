using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Web forge window (#forge, game.html renderForge 50516) in the 1920x1080 design space.
 // Static chrome (frame, crest, name plate, malice strip, list panel) is a still of the web window with every dynamic element hidden
 // (Art/ui/forge/window_base.png). Emoji / slot glyphs are 1x crops of the web render (Art/ui/forge/forge_glyphs.png, Data/forge_glyphs.json).
 // Definitions come from Data/forge_web.json; money, equipment, bag and player level are read from Unity at draw time, and anything Unity
 // does not have yet (relic bag, ...) is drawn as "미이식". Working: tab switch, AI-enhance chip select, scroll, close [G]/ESC.
 // Potion selection/craft reads Simulation.PotionState (B11); enhance / salvage / reroll / relic / general craft execution is shape only.
 public sealed partial class NativeForgePanel {
  public bool Open {get;private set;}
  public string Tab {get;private set;}="upgrade";
  public string SelectedChip {get;private set;}
  public float Scroll(string tab){return gridScroll.TryGetValue(tab,out var v)?v:0;}
  public float ListScroll {get{return listScroll;}}
  const string NotPorted="미이식";
  static readonly Rect WinRect=new Rect(470,12,980,1056);
  // padding box of #fgGrid (border 6px inside 732,382.4,688x581.6) and its content origin (+8 padding)
  static readonly Rect GridView=new Rect(738,388.4f,676,570);
  const float CX=746,CY=396.4f,CW=650;
  readonly ForgeDefs defs;readonly Dictionary<string,ForgeGlyph> glyphs=new Dictionary<string,ForgeGlyph>();
  readonly Dictionary<string,AffixDef> affixById=new Dictionary<string,AffixDef>();readonly Dictionary<string,string> unitById=new Dictionary<string,string>();
  readonly Dictionary<string,float> gridScroll=new Dictionary<string,float>();float listScroll;
  Font nm,nsk,nskSemi;Texture2D windowBase,plate,iron,atlas;bool ready;
  readonly Dictionary<string,Texture2D> procedural=new Dictionary<string,Texture2D>();
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  enum F {NM,Sans,SansSemi}
  // scrollbar drag state: which bar, mouse offset inside the thumb
  int dragBar;float dragOffset;

  public NativeForgePanel(){
   defs=JsonUtility.FromJson<ForgeDefs>(Resources.Load<TextAsset>("Data/forge_web").text);
   if(defs.tabs.Length!=6||defs.slots.Length!=17)throw new InvalidOperationException("Web forge definition mismatch");
   var gf=JsonUtility.FromJson<ForgeGlyphFile>(Resources.Load<TextAsset>("Data/forge_glyphs").text);
   foreach(var g in gf.glyphs)glyphs[Key(g.n)]=g;
   foreach(var a in AffixDefs.All){affixById[a.id]=a;if(!string.IsNullOrEmpty(a.unit))unitById[a.id]=a.unit;}   // shared table: Data/affix_defs_web.json
  }
  static string Key(string s){return s.Replace("️","");}
  public void SetOpen(bool value){Open=value;dragBar=0;}
  public void SelectTab(string id){foreach(var t in defs.tabs)if(t.id==id){Tab=id;listScroll=0;potionSelected=false;potionNotice=null;return;}}   // web: tab switch clears _forgeSel
  // Web: clicking the already selected equipment chip keeps it; selecting a chip fills the AI row.
  public void SelectChip(string slot){SelectedChip=slot;}
  public void HandleKeys(Action close){if(NativeKeyBindInput.Down("forge")||ExoInput.KeyDown(KeyCode.Escape))close();}   // A16: web BINDS.forge (ESC = fixed back key)

  // ---- resources / primitives ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  void Init(){
   if(ready)return;ready=true;
   nm=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");nsk=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");
   nskSemi=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??nsk;
   windowBase=Resources.Load<Texture2D>("Art/ui/forge/window_base");atlas=Resources.Load<Texture2D>("Art/ui/forge/forge_glyphs");
   plate=Resources.Load<Texture2D>("Art/ui/inventory/plate");iron=Resources.Load<Texture2D>("Art/ui/inventory/iron_320");
   if(iron!=null)iron.wrapMode=TextureWrapMode.Repeat;
  }
  // Inside a scrolling group every primitive subtracts `off` (group origin + scroll): callers keep using window coordinates.
  Vector2 off;
  Rect Off(Rect r){r.x-=off.x;r.y-=off.y;return r;}
  void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(Off(r),Texture2D.whiteTexture);GUI.color=old;}
  void Border(Rect r,Color c,float w=1){Fill(new Rect(r.x,r.y,r.width,w),c);Fill(new Rect(r.x,r.yMax-w,r.width,w),c);Fill(new Rect(r.x,r.y+w,w,r.height-2*w),c);Fill(new Rect(r.xMax-w,r.y+w,w,r.height-2*w),c);}
  bool Hit(Rect r){return NativeSilverHellUi.Button(Off(r),GUIContent.none,GUIStyle.none);}
  bool Over(Rect r){return GUI.enabled&&Off(r).Contains(Event.current.mousePosition);}
  Texture2D Gradient(Color a,Color b,float angle){
   string key="g"+ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+angle;
   if(procedural.TryGetValue(key,out var t))return t;
   const int n=32;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   float rad=angle*Mathf.Deg2Rad,dx=Mathf.Sin(rad),dy=-Mathf.Cos(rad),len=Mathf.Abs(dx)+Mathf.Abs(dy);var px=new Color[n*n];
   for(int iy=0;iy<n;iy++)for(int ix=0;ix<n;ix++){float sx=(ix+.5f)/n-.5f,sy=((n-1-iy)+.5f)/n-.5f;px[iy*n+ix]=Color.Lerp(a,b,Mathf.Clamp01(.5f+(sx*dx+sy*dy)/len));}
   t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
  }
  void Grad(Rect r,Color a,Color b,float angle=180f){NativeUiAudit.DrawTexture(Off(r),Gradient(a,b,angle));}
  void IronTile(Rect r,float size){if(iron==null)return;float w=r.width/size,h=r.height/size;NativeUiAudit.DrawTextureWithTexCoords(Off(r),iron,new Rect(.5f-w/2,.5f-h/2,w,h));}
  // CSS border-radius for the small controls: the four corner pixels are punched out by redrawing nothing; kept square (radius <= 6px).

  // ---- text ----
  GUIStyle Style(F f,int size,bool bold,bool italic){
   long key=(((long)f*1000+size)*2+(bold?1:0))*2+(italic?1:0);
   if(!styles.TryGetValue(key,out var s)){
    s=new GUIStyle(GUI.skin.label){font=f==F.NM?nm:f==F.Sans?nsk:nskSemi,fontSize=size,fontStyle=bold&&f==F.NM?(italic?FontStyle.BoldAndItalic:FontStyle.Bold):italic?FontStyle.Italic:FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
    styles[key]=s;
   }
   return s;
  }
  static int Px(float size){return Mathf.Max(1,Mathf.RoundToInt(size));}
  float Meas(string text,F f,float size,bool bold=false,float sp=0,bool italic=false){
   if(string.IsNullOrEmpty(text))return 0;var st=Style(f,Px(size),bold,italic);
   if(sp==0)return st.CalcSize(new GUIContent(text)).x;
   float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+sp;return w;
  }
  // Draws text in rect r (vertically centred). Returns the text width. anchor: Left / Center / Right.
  float Txt(Rect r,string text,F f,float size,Color c,bool bold=false,TextAnchor anchor=TextAnchor.MiddleLeft,float sp=0,float alpha=1f,Color? shadow=null,float shY=1f,bool italic=false){
   if(string.IsNullOrEmpty(text))return 0;
   var st=Style(f,Px(size),bold,italic);float total=Meas(text,f,size,bold,sp,italic);r=Off(r);float x=r.x;
   if(anchor==TextAnchor.MiddleCenter||anchor==TextAnchor.UpperCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
   for(int pass=shadow.HasValue?0:1;pass<2;pass++){
    var col=pass==0?new Color(shadow.Value.r,shadow.Value.g,shadow.Value.b,shadow.Value.a*alpha):new Color(c.r,c.g,c.b,c.a*alpha);
    st.normal.textColor=col;float px=x,oy=pass==0?shY:0;
    if(sp==0){NativeSilverHellUi.Label(new Rect(px,r.y+oy,total+16,r.height),text,st);continue;}
    foreach(char ch in text){var g=ch.ToString();NativeSilverHellUi.Label(new Rect(px,r.y+oy,60,r.height),g,st);px+=st.CalcSize(new GUIContent(g)).x+sp;}
   }
   return total;
  }
  // 1x crop sprite (web render). Returns the advance of "glyph + space" in that web context. tint white-mask sprites with c.
  float Spr(string name,float x,float lineTop,float alpha=1f,Color? tint=null){
   if(!glyphs.TryGetValue(Key(name),out var g))return 0;
   var old=GUI.color;GUI.color=tint.HasValue?new Color(tint.Value.r,tint.Value.g,tint.Value.b,tint.Value.a*alpha):new Color(1,1,1,alpha);
   NativeUiAudit.DrawTextureWithTexCoords(new Rect(x+g.ox-off.x,lineTop+g.oy-off.y,g.w,g.h),atlas,new Rect((float)g.x/atlas.width,1f-(float)(g.y+g.h)/atlas.height,(float)g.w/atlas.width,(float)g.h/atlas.height));
   GUI.color=old;return g.adv;
  }
  float Adv(string name){return glyphs.TryGetValue(Key(name),out var g)?g.adv:0;}
  // Width of the glyph alone (no trailing space), for glyphs that sit directly against text or alone in a box.
  float GlyphW(string name){return glyphs.TryGetValue(Key(name),out var g)?g.lw:0;}
  static string Commas(double v){return Math.Floor(v).ToString("N0",CultureInfo.InvariantCulture);}

  // ---- window ----
  public void Draw(Simulation sim,InventoryState inv,Action close){
   if(!Open)return;Init();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    GUI.matrix=Matrix4x4.identity;NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Gradient(C(0,0,0,.533f),C(0,0,0,.2f),90));
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    NativeUiAudit.DrawTexture(WinRect,windowBase,ScaleMode.StretchToFill,false);
    NativePanelTabBar.Draw(NativePanelTabBar.Preset.Forge,"forge");
    DrawHeader(sim);
    DrawLeftTabs();
    DrawContent(sim,inv);
    DrawClose(close);
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }

  void DrawHeader(Simulation sim){
   // 현행 웹 정적판에 제목 원문이 포함돼 있다. 중복 덧쓰기로 두꺼워지지 않게 원본을 그대로 표시한다.
   // #forgeMats: "악의: N" 14px 600 ls .08em
   Txt(new Rect(500,267,920,41),defs.matsLabel+": "+sim.Materials,F.SansSemi,14,C(211,208,202),false,TextAnchor.MiddleCenter,1.12f);
   // #forgeLore: 12px italic, opacity .85, emoji crops inline, centred
   float total=0;foreach(var run in defs.lore)total+=run.g!=null?GlyphW(run.g):Meas(run.t,F.NM,12,false,0,true);
   float x=732+(688-total)/2f;
   foreach(var run in defs.lore){
    if(run.g!=null){Spr(run.g,x,336,.85f);x+=GlyphW(run.g);}
    else x+=Txt(new Rect(x,336,Meas(run.t,F.NM,12,false,0,true)+8,20.4f),run.t,F.NM,12,C(165,168,168),false,TextAnchor.MiddleLeft,0,.85f,new Color(0,0,0,.9f),1f,true);
   }
  }

  void PlateFace(Rect r,bool active,bool leftBar){
   Fill(r,C(35,34,37));if(plate!=null)NativeUiAudit.DrawTexture(r,plate,ScaleMode.StretchToFill);
   if(active){Grad(r,C(87,23,12,.6f),C(38,9,7,.72f));if(leftBar)Fill(new Rect(r.x,r.y,3,r.height),C(127,130,130));else Fill(new Rect(r.x,r.yMax-2,r.width,2),C(127,130,130));}
   else Grad(r,C(21,20,23,.51f),C(11,10,12,.675f));
   if(!active&&Over(r))Fill(r,new Color(1,1,1,.05f));
  }
  void DrawLeftTabs(){
   for(int i=0;i<defs.tabs.Length;i++){
    var t=defs.tabs[i];var r=new Rect(500,518+46*i,216,40);bool act=Tab==t.id;
    PlateFace(r,act,true);
    // .fg-tab-txt 12.48px 700 ls .624, text-shadow 0 2px 4px rgba(0,0,0,.95)
    Txt(new Rect(512,r.y+11,192,18),t.label,F.NM,12.48f,act?C(244,230,203):C(194,191,185),true,TextAnchor.MiddleCenter,.624f,1f,new Color(0,0,0,.9f),2f);
    if(Hit(r)&&!act)SelectTab(t.id);
   }
  }
  void DrawClose(Action close){
   var r=new Rect(885,1004,150,36);PlateFace(r,false,false);
   Txt(r,defs.closeLabel,F.SansSemi,12,C(194,191,185),false,TextAnchor.MiddleCenter,.24f,1f,new Color(0,0,0,1),2f);
   if(Hit(r))close();
  }

  // ---- scrolling ----
  // Web scrollbar (#fgGrid and inner lists): 10px column, 12px arrow buttons, 6px pill thumb (#666969), arrows as small triangles.
  static readonly Color BarColor=new Color32(102,105,105,255);
  void ScrollBar(int id,Rect bar,float viewH,float contentH,ref float scroll){
   float max=Mathf.Max(0,contentH-viewH);scroll=Mathf.Clamp(scroll,0,max);if(max<=0)return;
   float track=bar.height-24,thumb=Mathf.Max(20,Mathf.Round(track*viewH/contentH)),room=track-thumb,top=bar.y+12+room*(scroll/max);
   var thumbRect=new Rect(bar.x+2,top,6,thumb);
   Fill(new Rect(thumbRect.x,thumbRect.y+1,6,thumb-2),BarColor);Fill(new Rect(thumbRect.x+1,thumbRect.y,4,thumb),BarColor);
   for(int i=0;i<4;i++){float w=i==0?2:i==1?4:6;Fill(new Rect(bar.x+5-w/2f,bar.y+3+i,w,1),BarColor);Fill(new Rect(bar.x+5-w/2f,bar.yMax-3-i-1,w,1),BarColor);}
   var e=Event.current;var mouse=e.mousePosition+off;
   if(e.type==EventType.MouseDown&&e.button==0&&bar.Contains(mouse)){
    if(thumbRect.Contains(mouse)){dragBar=id;dragOffset=mouse.y-thumbRect.y;}
    else if(mouse.y<bar.y+12)scroll=Mathf.Clamp(scroll-40,0,max);
    else if(mouse.y>bar.yMax-12)scroll=Mathf.Clamp(scroll+40,0,max);
    else scroll=Mathf.Clamp(scroll+(mouse.y<thumbRect.y?-1:1)*viewH,0,max);
    e.Use();
   }
   if(dragBar==id){
    if(e.type==EventType.MouseDrag){scroll=Mathf.Clamp((mouse.y-dragOffset-(bar.y+12))/room*max,0,max);e.Use();}
    if(e.type==EventType.MouseUp){dragBar=0;e.Use();}
   }
  }
  static bool Wheel(Rect view,ref float scroll,float contentH,float viewH){
   var e=Event.current;if(e.type!=EventType.ScrollWheel||!view.Contains(e.mousePosition))return false;
   float max=Mathf.Max(0,contentH-viewH);if(max<=0)return false;
   scroll=Mathf.Clamp(scroll+e.delta.y*33.3f,0,max);e.Use();return true;
  }

  void DrawContent(Simulation sim,InventoryState inv){
   float scroll=Scroll(Tab);listScroll=Tab=="salvage"||Tab=="reroll"?listScroll:0;
   // content height is computed by a dry layout pass (same code path, nothing drawn when dry)
   float contentH=ContentHeight(sim,inv);
   var innerRect=InnerListRect(sim,inv);
   // wheel: inner list first, then the panel
   if(innerRect.height>0&&Wheel(innerRect,ref listScroll,InnerListContent(sim,inv),innerRect.height)){}
   else Wheel(GridView,ref scroll,contentH,GridView.height);
   NativeUiAudit.BeginGroup(GridView);
   off=new Vector2(GridView.x,GridView.y+scroll);
   switch(Tab){
    case "upgrade":DrawUpgrade(sim,inv);break;
    case "potion":DrawPotion(sim);break;
    case "salvage":DrawSalvage(sim,inv);break;
    case "reroll":DrawReroll(sim,inv);break;
    case "crystal":DrawCrystal(sim);break;
    case "craft":DrawCraft(sim,inv);break;
   }
   off=Vector2.zero;NativeUiAudit.EndGroup();
   // panel scrollbar sits in the padding box column x 1404..1414
   ScrollBar(1,new Rect(1404,388.4f,10,570),GridView.height,contentH,ref scroll);
   gridScroll[Tab]=scroll;
   if(Tab=="potion")DrawPotionConfirm(sim);   // web #forgeConfirm sits below the grid, outside the scroll area
  }
  float ContentHeight(Simulation sim,InventoryState inv){
   switch(Tab){
    case "upgrade":{int n=0;foreach(var s in defs.slots)if(inv.GetEquipped(s.key)!=null)n++;
     if(n==0)return 0;float cardsTop=447.4f+(SelectedChip!=null&&inv.GetEquipped(SelectedChip)!=null?236:182)+8;return cardsTop+116*n-8-GridView.y+8;}
    case "craft":return 974.4f-GridView.y+8;
    default:return 0;
   }
  }
  Rect InnerListRect(Simulation sim,InventoryState inv){
   if(Tab=="salvage")return new Rect(746,549.4f,650,320);
   if(Tab=="reroll")return new Rect(746,433.4f,650,280);
   return new Rect(0,0,0,0);
  }
  float InnerListContent(Simulation sim,InventoryState inv){
   if(Tab=="salvage"){int rows=(inv.Bag.Count+1)/2;return rows==0?60:rows*72.8f+(rows-1)*4;}
   return defs.slots.Length*39-4+1;
  }
  Color RarityColor(int r){
   // RARITY_C of the web (#aaa, #44cc44, #4488ff, #bb44ff, #ffaa00, #8e55e9)
   switch(r){case 1:return C(68,204,68);case 2:return C(68,136,255);case 3:return C(187,68,255);case 4:return C(255,170,0);case 5:return C(142,85,233);default:return C(170,170,170);}
  }
  string DispName(InventoryItem it){
   string n=it.name;
   if(it.affixes!=null&&it.affixes.Length>0){
    foreach(var a in it.affixes)if(affixById.TryGetValue(a.id,out var d)&&d.type==0){n=d.name+" "+n;break;}
    foreach(var a in it.affixes)if(affixById.TryGetValue(a.id,out var d)&&d.type==1){n=n+" ["+d.name+"]";break;}
   }
   return n;
  }
  string AffixValue(InventoryAffix a){
   if(!unitById.TryGetValue(a.id,out var u))return a.value.ToString(CultureInfo.InvariantCulture);
   var ci=CultureInfo.InvariantCulture;
   if(u=="pct"||u=="prob")return (a.value>0?"+":"")+(int)(a.value*100)+"%";
   if(u=="dps")return a.value.ToString(ci)+"/s";
   if(u=="tick")return (a.value/60).ToString("0.00",ci)+"초";
   if(u=="atk")return "ATK×"+(int)(a.value*100)+"%";
   if(u=="hp")return (int)(a.value*100)+"%HP";
   return (a.value>0?"+":"")+a.value.ToString(ci);
  }
  int SlotIndex(string key){return Array.IndexOf(InventoryState.Slots,key);}
  string SvgGlyph(int slotIndex,int rarity){return "svg"+slotIndex+":"+(rarity==0?"#aaa":rarity==1?"#44cc44":rarity==2?"#4488ff":rarity==3?"#bb44ff":rarity==4?"#ffaa00":"#8e55e9");}
  ForgeSlotDef SlotDef(string key){foreach(var s in defs.slots)if(s.key==key)return s;return null;}
 }
}
