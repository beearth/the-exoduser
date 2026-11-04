using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Web stat window (stat-panel-ui.js / stat-panel-ui.css + growth-tree-*.css, #statPanel) in the 1920x1080 design space.
 // Definitions (tree positions, links, rank stars, names, descriptions, path classification, contribution formula text) come from
 // Resources/Data/stat_panel_web.json, extracted from the web runtime. State (invested levels, SP/AP, learned/pending, current/next numbers)
 // comes from the live Simulation.Growth transactional plan. The window frame, knight art and the
 // empty control shapes are one still of the web window; node frames/glyphs are stills of the web elements; everything dynamic is drawn here.
 [Serializable] public sealed class StatDefsEffect {public string ko,en,unit;public float per,@base,cap;}
 [Serializable] public sealed class StatDefsNode {
  public string key,kind,parent,path,glyph,nameKo,nameEn,descKo,descEn,statLabel,noteKo,noteEn;
  public float x,y;public bool major,uncapped;public int max;public StatDefsEffect[] effects;
 }
 [Serializable] public sealed class StatDefsPath {public string id,ko,en,glyph,color,hintKo,hintEn;public string[] keys;public int total;}
 [Serializable] public sealed class StatDefsStar {public string id,key;public int rank;public float x,y;}
 [Serializable] public sealed class StatDefsLink {public string from,to;}
 [Serializable] public sealed class StatDefsJoint {public string key,parent;public float x,y;}
 [Serializable] public sealed class StatDefsFile {
  public int[] costs;public StatDefsJoint[] joints;public StatDefsPath[] paths;public int totalNodes;public StatDefsNode[] nodes;public StatDefsStar[] stars;public StatDefsLink[] starLinks;
 }

 public sealed class NativeStatPanel {
  public bool Open {get;private set;}
  public string LocaleCode="ko";
  string L(string ko,string en=null){return NativeLocaleCatalog.Get("stat_panel_web",ko,LocaleCode,ko,en); }
  public bool TextInputActive {get{return Open&&searchFocused;}}
  const string SearchName="statSearch";
  Simulation sim;GrowthPlan plan;Action changed;int plannedSp,plannedAp,planChanges;
  public int PlannedValue(string key){return plan==null?0:plan.Draft.Value(key);}
  int LiveValue(string key){return sim==null?0:sim.Growth.Value(key);}
  void RefreshPlan(){if(sim==null)return;if(plan==null||!plan.Evaluate(sim.Growth,sim.Player.StatPoints,sim.Player.PassivePoints,out plannedSp,out plannedAp,out planChanges))plan=sim.Growth.CreatePlan();plan.Evaluate(sim.Growth,sim.Player.StatPoints,sim.Player.PassivePoints,out plannedSp,out plannedAp,out planChanges);}
  public bool PlanChange(string key,int amount){if(key=="pPierce"&&amount>0)return false;RefreshPlan();if(sim==null||!plan.Change(key,amount,sim.Growth,sim.Player.StatPoints,sim.Player.PassivePoints))return false;RefreshPlan();return true;}
  public bool ApplyPlan(){RefreshPlan();if(sim==null||!sim.ApplyGrowthPlan(plan))return false;plan=sim.Growth.CreatePlan();RefreshPlan();changed?.Invoke();return true;}
  public bool ReservePassive(string key,int amount){if(key=="pPierce")return false;if(sim==null||!sim.ReserveGrowthPassive(key,amount))return false;changed?.Invoke();return true;}
  public bool CancelReservation(int index){if(sim==null||!sim.Growth.CancelReservation(index))return false;changed?.Invoke();return true;}
  static readonly Rect Viewport=new Rect(283,148,1150,793),DetailRect=new Rect(1477,210,372,585.2f);
  static readonly Vector2 SceneCenter=new Vector2(500,400);
  readonly StatDefsFile defs;readonly Dictionary<string,StatDefsNode> nodeByKey=new Dictionary<string,StatDefsNode>();
  readonly Dictionary<string,Vector2> point=new Dictionary<string,Vector2>();readonly Dictionary<string,string> parentOf=new Dictionary<string,string>();
  readonly Dictionary<string,StatDefsPath> pathById=new Dictionary<string,StatDefsPath>();readonly Dictionary<string,StatDefsStar> starById=new Dictionary<string,StatDefsStar>();
  readonly Dictionary<string,Texture2D> textures=new Dictionary<string,Texture2D>(),procedural=new Dictionary<string,Texture2D>();
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  Font serif,cinzel,sans,sansSemi;Texture2D baseTex,plate,knightBackground,inspectorIron,innerRail;bool ready;GUIStyle searchStyle;
  // UI state (selection / filters / camera); no gameplay state lives here.
  string selected="pAtk",selectedStat,pathId="all",filter="all",search="";int selectedRank;
  float zoom=1,panX,panY,detailScroll;bool searchFocused,blurSearch,detailDrag;string hover,forcedHover;
  bool dragging,moved;Vector2 dragStart,panStart;string pressed;float detailContent;

  public NativeStatPanel(){
   defs=JsonUtility.FromJson<StatDefsFile>(Resources.Load<TextAsset>("Data/stat_panel_web").text);
   if(defs.nodes.Length!=31||defs.stars.Length!=260||defs.totalNodes!=265||defs.paths.Length!=6)throw new InvalidOperationException("Web stat tree definition mismatch");
   foreach(var n in defs.nodes){nodeByKey[n.key]=n;point[n.key]=new Vector2(n.x,n.y);parentOf[n.key]=n.parent;}
   foreach(var j in defs.joints){point[j.key]=new Vector2(j.x,j.y);parentOf[j.key]=j.parent;}
   foreach(var p in defs.paths)pathById[p.id]=p;foreach(var s in defs.stars){starById[s.id]=s;point[s.id]=new Vector2(s.x,s.y);}
  }
  public void SetOpen(bool value){Open=value;plan=null;if(value){searchFocused=false;blurSearch=true;}}
  public void BlurSearch(){blurSearch=true;searchFocused=false;}
  public void HandleKeys(Action close){
   if(searchFocused)return;
   if(NativeKeyBindInput.Down("stats"))close();   // A16: web BINDS.stats
  }

  // ---- resources / primitives ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  static Color HexColor(string hex){Color c;return ColorUtility.TryParseHtmlString(hex,out c)?c:Color.white;}
  Texture2D Tex(string name){Texture2D t;if(!textures.TryGetValue(name,out t)){t=Resources.Load<Texture2D>("Art/ui/stat/"+name);textures[name]=t;}return t;}
  void Init(){
   if(ready)return;ready=true;
   serif=NativeSilverHellUi.Font(true)??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");cinzel=serif;
   sans=serif;sansSemi=serif;
   inspectorIron=Resources.Load<Texture2D>("Art/ui/inventory/iron_320");if(inspectorIron!=null)inspectorIron.wrapMode=TextureWrapMode.Repeat;innerRail=Resources.Load<Texture2D>("Art/ui/silver_hell/inner_rail_iron_covenant");
   knightBackground=Tex("knight_background");baseTex=Tex("stat_base");plate=Resources.Load<Texture2D>("Art/ui/inventory/plate");
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Border(Rect r,Color c,float w=1){Fill(new Rect(r.x,r.y,r.width,w),c);Fill(new Rect(r.x,r.yMax-w,r.width,w),c);Fill(new Rect(r.x,r.y+w,w,r.height-2*w),c);Fill(new Rect(r.xMax-w,r.y+w,w,r.height-2*w),c);}
  Texture2D Make(string key,int n,Func<float,float,Color> f){
   Texture2D t;if(procedural.TryGetValue(key,out t))return t;
   t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++)px[y*n+x]=f((x+.5f)/n*2-1,(y+.5f)/n*2-1);
   t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
  }
  Texture2D Radial(){return Make("radial",128,(x,y)=>new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(x*x+y*y))));}
  Texture2D DiscTex(){return Make("disc",128,(x,y)=>new Color(1,1,1,Mathf.Clamp01((1f-Mathf.Sqrt(x*x+y*y))*64f+.5f)));}
  Texture2D DiamondTex(){return Make("diamond",128,(x,y)=>new Color(1,1,1,Mathf.Clamp01((1f-(Mathf.Abs(x)+Mathf.Abs(y)))*64f+.5f)));}
  Texture2D Gradient(Color a,Color b,float angle){
   string key="g"+ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+angle;Texture2D t;if(procedural.TryGetValue(key,out t))return t;
   const int n=32;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   float rad=angle*Mathf.Deg2Rad,dx=Mathf.Sin(rad),dy=-Mathf.Cos(rad),len=Mathf.Abs(dx)+Mathf.Abs(dy);var px=new Color[n*n];
   for(int iy=0;iy<n;iy++)for(int ix=0;ix<n;ix++){float sx=(ix+.5f)/n-.5f,sy=((n-1-iy)+.5f)/n-.5f;px[iy*n+ix]=Color.Lerp(a,b,Mathf.Clamp01(.5f+(sx*dx+sy*dy)/len));}
   t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
  }
  void Grad(Rect r,Color a,Color b,float angle=180f){NativeUiAudit.DrawTexture(r,Gradient(a,b,angle));}
  void Disc(Vector2 c,float r,Color col){var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(new Rect(c.x-r,c.y-r,r*2,r*2),DiscTex());GUI.color=old;}
  void Glow(Vector2 c,float r,Color col){var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(new Rect(c.x-r,c.y-r,r*2,r*2),Radial());GUI.color=old;}
  void Diamond(Vector2 c,float w,float h,Color col){var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(new Rect(c.x-w/2,c.y-h/2,w,h),DiamondTex());GUI.color=old;}
  // Straight segment of width w between two points (a rotated 1px quad; the rotation is applied locally so groups/scales stay correct).
  void Line(Vector2 a,Vector2 b,float w,Color col){
   var d=b-a;float len=d.magnitude;if(len<.01f)return;var old=GUI.matrix;
   GUI.matrix=old*Matrix4x4.TRS(new Vector3(a.x,a.y,0),Quaternion.Euler(0,0,Mathf.Atan2(d.y,d.x)*Mathf.Rad2Deg),Vector3.one);
   Fill(new Rect(0,-w/2f,len,w),col);GUI.matrix=old;
  }
  // Four-pointed star (web "✦"): two crossed diamonds.
  void Spark(Vector2 c,float size,Color col){Diamond(c,size*.46f,size,col);Diamond(c,size,size*.46f,col);}
  void Glyph(string key,Rect r,Color col){var t=Tex("glyph_"+key);if(t==null)return;var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(r,t,ScaleMode.StretchToFill);GUI.color=old;}

  // ---- text ----
  GUIStyle Style(Font f,int size,FontStyle fs){
   long key=(((long)(f==serif?1:f==cinzel?2:f==sansSemi?3:4))*1000+size)*4+(int)fs;GUIStyle s;
   if(!styles.TryGetValue(key,out s)){s=new GUIStyle(GUI.skin.label){font=f,fontSize=size,fontStyle=fs,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  float Width(Font f,float size,FontStyle fs,string text,float spacing){
   text=NativeLocaleCatalog.Text(text,null,LocaleCode);var st=Style(f,Mathf.RoundToInt(size),fs);if(spacing==0)return st.CalcSize(new GUIContent(text)).x;
   float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+spacing;return w;
  }
  void Text(Rect r,string text,Font f,float size,Color c,FontStyle fs=FontStyle.Normal,float spacing=0,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false){
   if(string.IsNullOrEmpty(text))return;
   text=NativeLocaleCatalog.Text(text,null,LocaleCode);
   var st=Style(f,Mathf.RoundToInt(size),fs);float total=Width(f,size,fs,text,spacing),x=r.x;
   if(anchor==TextAnchor.MiddleCenter||anchor==TextAnchor.UpperCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
   for(int pass=shadow?0:1;pass<2;pass++){
    st.normal.textColor=pass==0?new Color(0,0,0,.8f):c;float px=x,oy=pass==0?1.2f:0;
    if(spacing==0){NativeSilverHellUi.Label(new Rect(px,r.y+oy,Mathf.Max(r.width,total)+8,r.height),text,st);continue;}
    foreach(char ch in text){var g=ch.ToString();NativeSilverHellUi.Label(new Rect(px,r.y+oy,60,r.height),g,st);px+=st.CalcSize(new GUIContent(g)).x+spacing;}
   }
  }
  static bool Hangul(char c){return c>=0xAC00&&c<=0xD7A3;}
  static bool CanBreak(string t,int i){
   if(i<=0||i>=t.Length)return false;char l=t[i-1],r=t[i];
   if(l==' ')return true;if(r==' ')return false;
   if(")].,!?:;%·".IndexOf(r)>=0||"([{".IndexOf(l)>=0)return false;
   return Hangul(l)||Hangul(r);
  }
  // Greedy wrap with the browser's Korean break opportunities; returns the lines (fixed line height drawn by the caller).
  List<string> Wrap(string text,Font f,int size,float width){
   text=NativeLocaleCatalog.Text(text,null,LocaleCode);var lines=new List<string>();var st=Style(f,size,FontStyle.Normal);int start=0;
   while(start<text.Length){
    int end=start,lastBreak=-1;
    for(int i=start+1;i<=text.Length;i++){
     if(st.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x>width){end=lastBreak>start?lastBreak:Mathf.Max(start+1,i-1);break;}
     if(CanBreak(text,i)||i==text.Length)lastBreak=i;
     end=i;
    }
    if(end<=start)end=text.Length;
    lines.Add(text.Substring(start,end-start).Trim());start=end;while(start<text.Length&&text[start]==' ')start++;
   }
   return lines;
  }
  float Paragraph(Rect r,string text,Font f,int size,Color c,float lineHeight,TextAnchor anchor=TextAnchor.MiddleLeft){
   var lines=Wrap(text,f,size,r.width);for(int i=0;i<lines.Count;i++)Text(new Rect(r.x,r.y+i*lineHeight,r.width,lineHeight),lines[i],f,size,c,FontStyle.Normal,0,anchor);
   return lines.Count*lineHeight;
  }
  bool Hot(Rect r){return GUI.enabled&&r.Contains(Event.current.mousePosition);}
  bool Click(Rect r){return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);}

  // ---- definitions helpers ----
  StatDefsPath PathOfKey(string key){StatDefsNode n;return nodeByKey.TryGetValue(key,out n)&&pathById.ContainsKey(n.path)?pathById[n.path]:null;}
  string Name(StatDefsNode n){return L(n.nameKo,n.nameEn);}
  List<string> Route(string key){var route=new List<string>();string p;for(var k=key;!string.IsNullOrEmpty(k)&&point.ContainsKey(k);k=parentOf.TryGetValue(k,out p)?p:null)route.Insert(0,k);return route;}
  int RankCost(int rank){return rank>=0&&rank<defs.costs.Length?defs.costs[rank]:5;}
  bool Matches(StatDefsNode n){
   string q=search.Trim().ToLowerInvariant();if(q.Length==0)return true;
   var sb=new System.Text.StringBuilder();sb.Append(Name(n)).Append(' ').Append(n.nameKo).Append(' ').Append(n.nameEn).Append(' ').Append(n.descKo).Append(' ').Append(n.descEn).Append(' ').Append(n.key);
   foreach(var e in n.effects)sb.Append(' ').Append(L(e.ko,e.en)).Append(' ').Append(e.ko).Append(' ').Append(e.en);
   return sb.ToString().ToLowerInvariant().Contains(q);
  }
  // Same card rules as the web render(): path filter, search, and the learned/pending tabs. Unity has no invested levels, so those two tabs are empty.
  bool Visible(StatDefsNode n){
   if(pathId!="all"&&n.path!=pathId)return false;
   if(filter=="learned"&&PlannedValue(n.key)==0)return false;
   if(filter=="planned"&&PlannedValue(n.key)==LiveValue(n.key))return false;
   return Matches(n);
  }
  string SelectedKey{get{return selectedStat??selected;}}
  void SelectPath(string id){
   pathId=id;selectedStat=null;selectedRank=0;StatDefsPath p;
   if(pathById.TryGetValue(id,out p)&&Array.IndexOf(p.keys,selected)<0)selected=p.keys[0];
   detailScroll=0;
  }
  void SelectNode(string key,int rank){
   var n=nodeByKey[key];detailScroll=0;
   if(n.kind=="stat"){selectedStat=key;selectedRank=0;}else{selected=key;selectedStat=null;selectedRank=rank;}
  }
  void SetZoom(float z){zoom=Mathf.Clamp(z,1f,2.5f);if(zoom==1f){panX=panY=0;}}
  float Scale{get{return Mathf.Min((Viewport.width-12)/1000f,(Viewport.height-12)/800f)*zoom;}}
  float NodeScale{get{return Mathf.Max(1f,Mathf.Min(1.8f,32f/(48f*Scale)));}}
  // Scene point -> window coordinates (the web scene is centred in the viewport, then panned and scaled).
  Vector2 ToWin(Vector2 p){var s=Scale;return new Vector2(Viewport.center.x+panX+(p.x-SceneCenter.x)*s,Viewport.center.y+panY+(p.y-SceneCenter.y)*s);}
  void ClampPan(){var s=Scale;panX=Mathf.Clamp(panX,-500*s,500*s);panY=Mathf.Clamp(panY,-400*s,400*s);}

  // ---- window ----
  public void Draw(Action close){Draw(sim??new Simulation(new SimulationConfig()),changed,close);}
  public void Draw(Simulation live,Action onChanged,Action close){
   if(!Open)return;sim=live;changed=onChanged;RefreshPlan();Init();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),Color.black);
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    NativePanelTitle.Surface(new Rect(0,0,1920,1080));Fill(Viewport,C(6,11,9));
    if(knightBackground!=null)NativeUiAudit.DrawTexture(Viewport,knightBackground,ScaleMode.StretchToFill);
    ClampPan();
    HandleTreeInput();
    // The tree is drawn straight over the still and the still is then re-drawn around the viewport (IMGUI groups break rotated quads).
    DrawTree();CoverAround(new Rect(Viewport.x+1,Viewport.y+1,Viewport.width-2,Viewport.height-2));DrawPreview();
    DrawOutline();NativePanelTabBar.Draw(NativePanelTabBar.Preset.Stat,"statPanel",LocaleCode);
    DrawHeader();DrawLeft();DrawToolbar();DrawInspector();DrawFooter(close);
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }

  // Re-draws the window still in a rect (cuts off anything drawn there before).
  void CoverRect(Rect r){if(r.width<=0||r.height<=0)return;NativePanelTitle.Surface(r);}
  void DrawOutline(){foreach(var r in new[]{new Rect(0,0,1920,32),new Rect(0,1048,1920,32),new Rect(0,32,32,1016),new Rect(1888,32,32,1016)})NativeUiAudit.DrawTextureWithTexCoords(new Rect(12+r.x*.9875f,r.y,r.width*.9875f,r.height),baseTex,new Rect(r.x/1920,1-r.yMax/1080,r.width/1920,r.height/1080),false);Border(Viewport,C(74,77,77));}
  void CoverAround(Rect hole){
   CoverRect(new Rect(0,0,1920,hole.y));CoverRect(new Rect(0,hole.yMax,1920,1080-hole.yMax));
   CoverRect(new Rect(0,hole.y,hole.x,hole.height));CoverRect(new Rect(hole.xMax,hole.y,1920-hole.xMax,hole.height));
  }
  void DrawHeader(){
   string ap=plannedAp.ToString();float numberWidth=Width(sans,24,FontStyle.Normal,ap,0),walletWidth=26+71.25f+12+numberWidth+2;walletWidth=Mathf.Max(125.34f,walletWidth);
   NativePanelTitle.Draw(new Rect(47+(1826-walletWidth-16)/2-260,80,520,64),NativeLocaleCatalog.Text("성장의 각인",null,LocaleCode));
   var wallet=new Rect(1873-walletWidth,80,walletWidth,64);Grad(wallet,C(27,30,30,.81f),C(17,16,19,.93f));Border(wallet,C(85,88,88));Fill(new Rect(wallet.x+1,wallet.y+1,wallet.width-2,1),C(157,160,160,.13f));
   Text(new Rect(wallet.x+13,101.5f,71.25f,21),"계획 후 AP",sans,14,C(188,185,179));
   Text(new Rect(1860-numberWidth,97.6f,numberWidth,28.8f),ap,sans,24,C(202,199,193),FontStyle.Normal,0,TextAnchor.MiddleRight);
  }

  void DrawLeft(){
   Text(new Rect(47,151.4f,150,25.2f),"전투의 길",serif,18,C(204,201,195),FontStyle.Bold);
   // count: visible definition total (web "265 / 265" for the unfiltered tree); learned/pending numerators are state.
   int total=defs.totalNodes,shown=0;foreach(var n in defs.nodes)if(Visible(n))shown+=n.kind=="passive"?(filter=="learned"?PlannedValue(n.key):filter=="planned"?Math.Abs(PlannedValue(n.key)-LiveValue(n.key)):n.max):1;
   Text(new Rect(200.4f,156,66.6f,16),shown.ToString()+" / "+total,serif,14,C(188,185,179),FontStyle.Normal,0,TextAnchor.MiddleRight);
   // search box: shape is in the still; text input and placeholder are drawn here.
   var sr=new Rect(47,190,220,44);GUI.SetNextControlName(SearchName);
   if(searchStyle==null){
    searchStyle=new GUIStyle(GUI.skin.textField){font=sans,fontSize=16,alignment=TextAnchor.MiddleLeft,padding=new RectOffset(11,11,0,0),margin=new RectOffset(),border=new RectOffset(),clipping=TextClipping.Clip};
    searchStyle.normal.background=null;searchStyle.hover.background=null;searchStyle.active.background=null;searchStyle.focused.background=null;
    searchStyle.normal.textColor=searchStyle.hover.textColor=searchStyle.active.textColor=searchStyle.focused.textColor=C(219,216,210);
   }
   if(blurSearch){GUI.FocusControl(null);blurSearch=false;}
   Fill(sr,C(9,10,11));Border(sr,C(61,64,64));string next=NativeSilverHellUi.TextField(sr,search,60,searchStyle);if(next!=search){search=next;}
   searchFocused=GUI.GetNameOfFocusedControl()==SearchName;
   if(search.Length==0&&!searchFocused)Text(new Rect(59,190,200,44),"이름 · 효과 · 영문명 검색",sans,16,C(137,140,140));
   for(int i=0;i<7;i++){
    float y=244+85.17f*i;var r=new Rect(47,y,220,82.17f);StatDefsPath p=i==0?null:defs.paths[i-1];string id=p==null?"all":p.id;bool active=pathId==id;
    Color school=p!=null?HexColor(p.color):C(156,159,159);
    if(active){Grad(r,C(131,134,134,.2f),C(131,134,134,0f),90);Fill(new Rect(r.x,r.y,2,r.height),p!=null?school:C(156,159,159));}
    else if(Hot(r))Fill(r,new Color(1,1,1,.04f));
    if(p==null)Spark(new Vector2(67,y+41.08f),15,C(191,188,182));
    else{Glow(new Vector2(55,y+29),15,new Color(school.r,school.g,school.b,.16f));Glyph(p.glyph,new Rect(55,y+29,24,24),new Color(school.r,school.g,school.b,.75f));}
    Text(new Rect(89,y+29.89f,126,22.4f),p==null?L("전체","All"):L(p.ko,p.en),sans,16,active?C(255,240,217):C(216,213,207));
    int cnt=p==null?defs.totalNodes:p.total,learned=0;foreach(var node in defs.nodes)if(p==null||node.path==p.id)learned+=node.kind=="passive"?PlannedValue(node.key):PlannedValue(node.key)>0?1:0;Text(new Rect(162,y+31.08f,99,20),learned+" / "+cnt,serif,14,C(188,185,179),FontStyle.Normal,0,TextAnchor.MiddleRight);
    if(Click(r))SelectPath(id);
   }
   string hint=pathId=="all"?"6개의 길 · 서로 조합 가능한 26개 패시브":L(pathById[pathId].hintKo,pathById[pathId].hintEn);
   Paragraph(new Rect(47,896.2f,220,44.8f),hint,sans,14,C(188,185,179),22.4f);
   string[] fk={"all","learned","planned"},fl={"전체","습득","변경 중"};float[] fx={47,127.7f,208.4f},fw={39.5f,39.5f,58.6f};
   Color accent=pathId=="all"?C(156,159,159):HexColor(pathById[pathId].color);
   for(int i=0;i<3;i++){
    var r=new Rect(fx[i],847.2f,fw[i],38);bool on=filter==fk[i];
    Text(r,fl[i],sans,16,on?C(241,208,166):C(157,160,160),FontStyle.Normal,0,TextAnchor.MiddleCenter);
    if(on)Fill(new Rect(r.x,r.yMax-2,r.width,2),accent);
    if(Click(r)){filter=fk[i];}
   }
  }

  // ---- tree ----
  void HandleTreeInput(){
   var e=Event.current;var mp=e.mousePosition;
   if(e.type==EventType.ScrollWheel){
    if(Viewport.Contains(mp)){SetZoom(zoom+(e.delta.y<0?.15f:-.15f));e.Use();}
    else if(DetailRect.Contains(mp)){detailScroll=Mathf.Clamp(detailScroll+e.delta.y*14f,0,Mathf.Max(0,detailContent-DetailRect.height));e.Use();}
   } else if(e.type==EventType.MouseDown&&e.button==0&&Viewport.Contains(mp)){
    pressed=HitNode(mp);moved=false;
    if(pressed==null){dragging=true;dragStart=mp;panStart=new Vector2(panX,panY);}
    GUIUtility.keyboardControl=0;
    e.Use();
   } else if(e.type==EventType.MouseDrag&&dragging){
    var d=mp-dragStart;moved|=Mathf.Abs(d.x)+Mathf.Abs(d.y)>4;panX=panStart.x+d.x;panY=panStart.y+d.y;e.Use();
   } else if(e.type==EventType.MouseUp&&e.button==0){
    if(pressed!=null&&!dragging&&HitNode(mp)==pressed){
     int at=pressed.IndexOf('@');if(at>0)SelectNode(pressed.Substring(0,at),int.Parse(pressed.Substring(at+1)));else SelectNode(pressed,0);
    }
    pressed=null;dragging=false;
   }
  }
  // Topmost visible node or rank star under the mouse (selected node first, then stars, then nodes, like the web z-order).
  string HitNode(Vector2 mp){
   float sc=Scale,ns=NodeScale;string best=null;float bestD=1e9f;
   foreach(var st in defs.stars){
    if(!StarVisible(st))continue;var c=ToWin(new Vector2(st.x,st.y));float d=(mp-c).magnitude;if(d<=10*sc&&d<bestD){bestD=d;best=st.id;}
   }
   if(best!=null)return best;
   foreach(var n in defs.nodes){
    if(!Visible(n))continue;var c=ToWin(new Vector2(n.x,n.y));float rad=(n.major?27f:22f)*sc*ns,d=(mp-c).magnitude;if(d<=rad&&d<bestD){bestD=d;best=n.key;}
   }
   return best;
  }
  bool StarVisible(StatDefsStar s){var n=nodeByKey[s.key];return Visible(n)&&n.kind=="passive"&&(filter!="learned"||PlannedValue(n.key)>=s.rank)&&(filter!="planned"||((PlannedValue(n.key)>=s.rank)!=(LiveValue(n.key)>=s.rank)));}

  void DrawTree(){
   float sc=Scale,ns=NodeScale;var inner=new Rect(Viewport.x+1,Viewport.y+1,Viewport.width-2,Viewport.height-2);
   {
    hover=forcedHover??(!dragging&&Viewport.Contains(Event.current.mousePosition)?HitNode(Event.current.mousePosition):null);
    var route=new HashSet<string>(Route(SelectedKey));
    Color linkC=C(151,154,154,.72f),routeC=C(210,207,201,.72f);float lw=Mathf.Max(1f,1.35f*sc),rw=Mathf.Max(1.4f,2.5f*sc);
    // body links (parent -> node), then rank links
    foreach(var kv in parentOf){
     if(string.IsNullOrEmpty(kv.Value))continue;
     var a=ToWin(point[kv.Value]);var b=ToWin(point[kv.Key]);
     if(route.Contains(kv.Key)){Line(a,b,rw+5*sc,C(192,189,183,.18f));Line(a,b,rw,routeC);}
     else Line(a,b,lw,linkC);
    }
    foreach(var l in defs.starLinks){
     var st=starById[l.to];bool vis=StarVisible(st);var a=ToWin(point[l.from]);var b=ToWin(point[l.to]);
     bool onRoute=SelectedKey==st.key&&selectedStat==null&&st.rank<=Mathf.Max(1,selectedRank);
     if(!vis)Line(a,b,lw,C(151,154,154,.08f));else if(onRoute){Line(a,b,rw+4*sc,C(192,189,183,.18f));Line(a,b,rw,routeC);}else Line(a,b,lw,linkC);
    }
    if(hover!=null){
     // .growth-tree-links path.preview: dashed bone line along the hovered node's route (and its rank chain)
     string hk=hover;int hr=0;int hat=hover.IndexOf('@');if(hat>0){hk=hover.Substring(0,hat);hr=int.Parse(hover.Substring(hat+1));}
     var hroute=new HashSet<string>(Route(hk));var pc=C(227,224,218,.9f);float pw=Mathf.Max(1.4f,2.2f*sc);
     foreach(var kv in parentOf){if(string.IsNullOrEmpty(kv.Value)||!hroute.Contains(kv.Key))continue;DashLine(ToWin(point[kv.Value]),ToWin(point[kv.Key]),pw,pc,4*sc,4*sc);}
     foreach(var l in defs.starLinks){var st=starById[l.to];if(st.key==hk&&hr>0&&st.rank<=hr)DashLine(ToWin(point[l.from]),ToWin(point[l.to]),pw,pc,4*sc,4*sc);}
    }
    DrawOrigin(sc);
    foreach(var st in defs.stars)if(StarVisible(st))DrawStar(st,sc);
    StatDefsNode top=null;
    foreach(var n in defs.nodes){if(!Visible(n))continue;if(n.key==SelectedKey){top=n;continue;}DrawNode(n,false,sc,ns);}
    if(top!=null)DrawNode(top,true,sc,ns);
    bool anyVisible=false;foreach(var n in defs.nodes)if(Visible(n)){anyVisible=true;break;}
    if(!anyVisible){
     var box=new Rect(Viewport.center.x-130,Viewport.y+.45f*Viewport.height-41.5f,260,83);Fill(box,C(12,19,22,.93f));Border(box,C(82,85,85));
     Text(new Rect(box.x,box.y+14,box.width,25),"일치하는 패시브가 없습니다. 검색 또는",sans,14,C(168,171,171),FontStyle.Normal,0,TextAnchor.MiddleCenter);
     Text(new Rect(box.x,box.y+39,box.width,25),"필터를 바꿔보세요.",sans,14,C(168,171,171),FontStyle.Normal,0,TextAnchor.MiddleCenter);
    }
   }
  }
  void DashLine(Vector2 a,Vector2 b,float w,Color col,float dash,float gap){
   var d=b-a;float len=d.magnitude;if(len<.01f)return;var u=d/len;
   for(float t=0;t<len;t+=dash+gap)Line(a+u*t,a+u*Mathf.Min(len,t+dash),w,col);
  }
  void DrawOrigin(float sc){
   var c=ToWin(SceneCenter);float r=13.5f*sc;
   Glow(c,r+27*sc,C(205,202,196,.6f));Disc(c,r+4*sc,C(145,148,148,.18f));Disc(c,r,C(215,212,206));Disc(c,r-1,C(41,44,44));Spark(c,17*sc*.9f,C(231,228,222));
  }
  void DrawStar(StatDefsStar st,float sc){
   var c=ToWin(new Vector2(st.x,st.y));bool terminal=st.rank%10==0,sel=SelectedKey==st.key&&selectedStat==null&&selectedRank==st.rank;
   bool learned=PlannedValue(st.key)>=st.rank,pending=learned!=(LiveValue(st.key)>=st.rank);var fill=sel?C(249,222,163):learned?C(181,148,89):C(24,32,27);var edge=sel?C(255,241,207):pending?C(237,171,104):terminal?C(195,192,186):C(177,180,180);
   if(sel)Glow(c,18*sc,C(229,184,105,.55f));
   if(terminal){float d=17f*1.4142f*sc;Diamond(c,d+5*sc,d+5*sc,C(9,14,12,.85f));Diamond(c,d,d,edge);Diamond(c,d-2.2f*sc*1.4142f,d-2.2f*sc*1.4142f,fill);}
   else{float r=6.8f*sc;Disc(c,r+2.2f*sc,C(9,14,12,.85f));Disc(c,r,edge);Disc(c,r-1.3f*sc,fill);}
  }
  void DrawNode(StatDefsNode n,bool sel,float sc,float ns){
   var c=ToWin(new Vector2(n.x,n.y));bool stat=n.kind=="stat";float size=(n.major?54f:44f)*sc*ns;
   string frame="node_"+(stat?"stat":n.major?"major":"passive")+"_"+(sel?"selected":"base");var t=Tex(frame);
   // The frame stills are 140 css px wide at the web default scale (node = 33.66 / 41.31 css px).
   float f=size/(n.major?41.31f:33.66f);float sprite=140f*f*(n.major?1f:1f);
   if(t!=null)NativeUiAudit.DrawTexture(new Rect(c.x-sprite/2,c.y-sprite/2,sprite,sprite),t,ScaleMode.StretchToFill);
   float gs=size*.52f;Color gc=sel?C(229,226,220):C(201,198,192);
   if(stat){gc.a=.13f;Glyph(n.glyph,new Rect(c.x-gs/2,c.y-gs/2,gs,gs),gc);Text(new Rect(c.x-30*sc,c.y-10*sc,60*sc,20*sc),n.statLabel,serif,14*sc,C(217,214,208),FontStyle.Bold,0,TextAnchor.MiddleCenter,true);}
   else Glyph(n.glyph,new Rect(c.x-gs/2,c.y-gs/2,gs,gs),gc);
   // Web: zero badges appear only on selection/hover; allocated values remain visible.
   if(PlannedValue(n.key)==0&&!sel&&hover!=n.key)return;
   float bw=16.6f*sc,bh=18f*sc;var br=new Rect(c.x+size/2-bw+5*sc,c.y+size/2-bh+6*sc,bw,bh);
   Fill(br,C(18,25,27));Border(br,C(82,85,85),Mathf.Max(1,sc));Text(br,PlannedValue(n.key).ToString(),serif,14*sc,C(185,182,176),FontStyle.Normal,0,TextAnchor.MiddleCenter);
  }

  void DrawToolbar(){
   Text(new Rect(283,956.75f,131.08f,30.5f),"현재 전투 능력치 ↗",sans,15,C(177,180,180),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   var zoomBox=new Rect(1294.48f,952,138.52f,40);Grad(zoomBox,C(20,27,27,.95f),C(12,17,17,.95f));Border(zoomBox,C(65,68,68));
   var minus=new Rect(1297.48f,955,36,34);var reset=new Rect(1335.48f,955,56.52f,34);var plus=new Rect(1394,955,36,34);
   Text(minus,"−",serif,16,new Color(212/255f,186/255f,148/255f,zoom<=1f?.48f:1f),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   Text(reset,Mathf.RoundToInt(zoom*100)+"%",serif,16,C(192,189,183),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   Text(plus,"+",serif,16,new Color(212/255f,186/255f,148/255f,zoom>=2.5f?.48f:1f),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   if(Click(minus)&&zoom>1f)SetZoom(zoom-.25f);if(Click(reset))SetZoom(1f);if(Click(plus)&&zoom<2.5f)SetZoom(zoom+.25f);
  }

  // .growth-node-preview: name + rank, "현재 → 다음" and up to two contribution rows. Node/attribute hover shows state values (미이식);
  // a rank star shows the definition values of that rank (per-rank contribution table).
  string FmtEffect(StatDefsEffect e,string key,float level){
   float v=e.@base+e.per*Mathf.Max(0f,level);if(e.cap>=0)v=Mathf.Min(v,e.cap);
   if(key=="pDemon"&&e.unit=="s")v=Mathf.Max(100f,v);v=Mathf.Round(v*10000f)/10000f;
   if(e.unit=="×")return "×"+v.ToString("0.00");
   return v.ToString("#,0.####")+(e.unit=="s"?"초":e.unit);
  }
  void DrawPreview(){
   if(hover==null)return;
   string cluster=hover;int rank=0;int at=hover.IndexOf('@');if(at>0){cluster=hover.Substring(0,at);rank=int.Parse(hover.Substring(at+1));}
   var n=nodeByKey[cluster];bool stat=n.kind=="stat";
   string title=Name(n)+(rank>0?" · Lv. "+rank:"");
   string rankText=rank>0?rank+" / "+n.max:stat?PlannedValue(n.key)+" SP":PlannedValue(n.key)+" / "+n.max;
   int rows=Mathf.Min(2,n.effects.Length);float W=380,H=96+rows*37.4f;
   var c=ToWin(rank>0?point[hover]:new Vector2(n.x,n.y));
   float half=rank>0?10*Scale:(n.major?27f:22f)*Scale*NodeScale;
   float x=c.x+half+16;if(x+W>Viewport.xMax-12)x=c.x-half-W-16;float y=c.y-H/2;
   x=Mathf.Clamp(x,Viewport.x+12,Viewport.xMax-W-12);y=Mathf.Clamp(y,Viewport.y+12,Viewport.yMax-H-12);
   var box=new Rect(x,y,W,H);
   Fill(new Rect(x-8,y+6,W+16,H+14),C(0,0,0,.2f));Fill(new Rect(x-3,y+3,W+6,H+8),C(0,0,0,.2f));
   Fill(box,C(186,183,177));Fill(new Rect(x+2,y+2,W-4,H-4),C(18,25,21,.98f));
   Text(new Rect(x+18,y+16,300,30),title,serif,20,C(219,216,210),FontStyle.Bold);
   Text(new Rect(x+18,y+16,346,25.2f),rankText,serif,14,C(171,174,174),FontStyle.Normal,0,TextAnchor.MiddleRight);
   Text(new Rect(x+18,y+56,346,21),"현재 → 다음",sans,14,C(140,143,143),FontStyle.Normal,0,TextAnchor.MiddleRight);
   for(int i=0;i<rows;i++){
    float ry=y+81+i*37.4f;var e=n.effects[i];
    Fill(new Rect(x+18,ry,346,1),C(117,120,120,.17f));
    Text(new Rect(x+18,ry+6,200,26.4f),L(e.ko,e.en),sans,16,C(219,216,210));
    string val=rank>0?FmtEffect(e,n.key,rank-1)+" → "+FmtEffect(e,n.key,rank):FmtEffect(e,n.key,PlannedValue(n.key))+" → "+FmtEffect(e,n.key,Math.Min(GrowthState.Cap(n.key),(long)PlannedValue(n.key)+1));
    Text(new Rect(x+18,ry+8,346,22),val,serif,18,C(228,199,144),FontStyle.Normal,0,TextAnchor.MiddleRight);
   }
  }

  // ---- inspector ----
  void DrawInspector(){
   DrawInspectorSurface(new Rect(1453,148,420,845));if(innerRail!=null)NativeSilverHellUi.Slice(new Rect(1453,148,420,845),innerRail,innerRail.width*.04f,innerRail.height*.04f,6,6,false);
   bool isStat=selectedStat!=null;var n=nodeByKey[SelectedKey];var path=isStat?null:PathOfKey(n.key);
   var rect=DetailRect;var oldM=GUI.matrix;GUI.matrix=oldM*Matrix4x4.Translate(new Vector3(rect.x,rect.y,0));float y=10-detailScroll;
   try {
    float x0=3;float w=366;
    // hero: icon disc, category
    Color school=isStat?C(178,181,181):path!=null?HexColor(path.color):C(178,181,181);
    var hc=new Vector2(x0+27,y+27);
    Glow(hc,38,new Color(school.r,school.g,school.b,.10f));Disc(hc,32,C(95,98,98,.4f));Disc(hc,31,C(24,27,23));Disc(hc,27,C(145,148,148));Disc(hc,26,C(19,25,28));
    Glow(hc,24,C(80,83,83,.2f));
    Glyph(n.glyph,new Rect(hc.x-15,hc.y-15,30,30),school);
    Text(new Rect(x0+70,y+15,200,24),isStat?"기본 능력치":path!=null?L(path.ko,path.en):"",sans,16,C(199,196,190),FontStyle.Normal,.96f);
    y+=72;
    Text(new Rect(x0,y,w,48.6f),Name(n),serif,36,C(228,225,219),FontStyle.Bold,1.08f);y+=66.6f;
    // rank row (invested level is state)
    Text(new Rect(x0,y+.5f,120,24),isStat?"직접 투자량":"투자 레벨",sans,16,C(199,196,190));
    string cap=isStat?(n.uncapped?"∞":"/ "+n.max):"/ "+n.max;
    float capW=Width(sans,10,FontStyle.Normal,cap,0);Text(new Rect(x0+w-capW,y+5,capW+4,15),cap,sans,10,C(139,142,142));
    Text(new Rect(x0+w-capW-26,y,17,25),PlannedValue(n.key).ToString(),sans,25,C(198,195,189),FontStyle.Normal,0,TextAnchor.MiddleRight);
    y+=33;
    if(!isStat){
     for(int i=0;i<n.max;i++){
      // skewX(-25deg) 4px bar drawn as four 1px rows
      float px=x0+i*(w+4)/n.max;for(int row=0;row<4;row++)Fill(new Rect(px+(1.5f-row)*Mathf.Tan(25*Mathf.Deg2Rad)*1f+1f,y+row,(w+4)/n.max-4,1),i<PlannedValue(n.key)?C(224,191,134):C(58,61,61));
     }
     y+=18;
     if(selectedRank>0){Text(new Rect(x0,y,w,22),"Lv. "+selectedRank+" · "+RankCost(selectedRank-1)+" AP",sans,14,C(199,196,190));y+=24;}
    } else y+=6;
    // contribution table
    bool pending=PlannedValue(n.key)!=LiveValue(n.key);int value=PlannedValue(n.key),from=pending?LiveValue(n.key):value,target=selectedRank>0?(selectedRank>value?selectedRank:selectedRank-1):pending?value:Math.Min(n.uncapped?int.MaxValue:n.max,value+1);
    string third=pending||(!isStat&&selectedRank>0)?"계획":isStat?"+1":"다음";
    float ty=y,rows=46.7f;var eff=n.effects;float[] heights=new float[eff.Length],afterWidths=new float[eff.Length],beforeWidths=new float[eff.Length];
    for(int i=0;i<eff.Length;i++){string before=FmtEffect(eff[i],n.key,from),after=FmtEffect(eff[i],n.key,target);beforeWidths[i]=Mathf.Max(38,Width(sans,18,FontStyle.Normal,before,0));afterWidths[i]=Mathf.Max(42,Width(sans,24,i==0?FontStyle.Normal:FontStyle.Bold,after,0));float labelW=w-beforeWidths[i]-afterWidths[i]-24;var lines=Wrap(L(eff[i].ko,eff[i].en),sans,18,labelW);heights[i]=(i==0?30:24)+Mathf.Max(lines.Count*27.9f,i==0?28.8f:37.2f)+1;rows+=heights[i];}
    Fill(new Rect(x0,ty,w,1),C(82,85,85));Fill(new Rect(x0,ty+rows+1,w,1),C(82,85,85));
    Text(new Rect(x0,ty+13,w-104,21.7f),isStat?"투자분의 기본 기여":"패시브 기여",sans,14,C(191,188,182),FontStyle.Normal,.56f);
    Text(new Rect(x0+w-92,ty+13,38,21.7f),"현재",sans,14,C(188,185,179),FontStyle.Normal,.56f);
    Text(new Rect(x0+w-42,ty+13,42,21.7f),third,sans,14,C(188,185,179),FontStyle.Normal,.56f);
    float ry=ty+47.7f;Fill(new Rect(x0,ry-1,w,1),C(49,52,52));
    for(int i=0;i<eff.Length;i++){
     float aw=afterWidths[i],bw=beforeWidths[i],labelW=w-bw-aw-24,contentH=heights[i]-(i==0?30:24)-1;var lines=Wrap(L(eff[i].ko,eff[i].en),sans,18,labelW);float pad=i==0?15:12,cy=ry+pad;
     for(int k=0;k<lines.Count;k++)Text(new Rect(x0,cy+(contentH-lines.Count*27.9f)/2+k*27.9f,labelW,27.9f),lines[k],sans,18,C(191,188,182));
     Text(new Rect(x0+w-aw-12-bw,cy+(contentH-27.9f)/2,bw,27.9f),FmtEffect(eff[i],n.key,from),sans,18,C(159,162,162),FontStyle.Normal,0,TextAnchor.MiddleRight);
     bool capped=FmtEffect(eff[i],n.key,from)==FmtEffect(eff[i],n.key,target);Color nextColor=i==0?C(220,217,211):capped?C(185,182,176):C(239,131,123);
     Text(new Rect(x0+w-aw,cy+(contentH-(i==0?28.8f:37.2f))/2,aw,i==0?28.8f:37.2f),FmtEffect(eff[i],n.key,target),sans,24,nextColor,i==0||capped?FontStyle.Normal:FontStyle.Bold,0,TextAnchor.MiddleRight);
     ry+=heights[i];Fill(new Rect(x0,ry-1,w,1),C(49,52,52));
    }
    y=ty+rows+10;
    y+=Paragraph(new Rect(x0,y,w,100),L(n.noteKo,n.noteEn),sans,18,C(204,201,195),30.6f);
    string support=SupportNote(n.key);if(support.Length>0){y+=12;y+=Paragraph(new Rect(x0,y,w,120),support,sans,14,C(220,174,133),23f);}
    y+=DrawLedgers(x0,y,w);
    detailContent=y+detailScroll+10;
    if(detailContent-rect.height<=0)detailScroll=0;
   } finally {GUI.matrix=oldM;}
   DrawInspectorSurface(new Rect(1459,154,408,56));DrawInspectorSurface(new Rect(1459,rect.yMax,408,987-rect.yMax));
   DrawDetailScrollbar(rect);
   // the still carries the passive title: blank it with a plain patch of the same panel, then draw the current one
   Text(new Rect(1477,170,372,24),isStat?"능력치 분석":"패시브 분석",sans,16,C(199,196,190),FontStyle.Normal,2.56f);
   DrawActions(isStat);
  }
  void DrawInspectorSurface(Rect area){
   if(inspectorIron!=null)NativeUiAudit.DrawTextureWithTexCoords(area,inspectorIron,new Rect(area.x/320,area.y/320,area.width/320,area.height/320),false);else Fill(area,C(18,20,20));
   var whole=new Rect(1453,148,420,845);var texture=Gradient(C(27,30,30,.867f),C(16,16,19,.95f),180);NativeUiAudit.DrawTextureWithTexCoords(area,texture,new Rect((area.x-whole.x)/whole.width,1-(area.yMax-whole.y)/whole.height,area.width/whole.width,area.height/whole.height),true);
  }
  static Color Desaturate(Color c,float strength){float l=c.r*.2126f+c.g*.7152f+c.b*.0722f;return new Color(Mathf.Lerp(l,c.r,strength),Mathf.Lerp(l,c.g,strength),Mathf.Lerp(l,c.b,strength),c.a);}
  void ControlFace(Rect r,bool primary,bool enabled){float a=enabled?1:.48f;Color top=primary?C(155,70,53,a):C(39,42,42,a),bottom=primary?C(99,38,31,a):C(19,23,25,a),edge=primary?C(157,160,160,a):C(82,85,85,a),inset=primary?C(72,32,25,a):C(17,21,22,a);if(!enabled){top=Desaturate(top,.3f);bottom=Desaturate(bottom,.3f);}Grad(r,top,bottom);Border(r,edge);Border(new Rect(r.x+1,r.y+1,r.width-2,r.height-2),inset,2);}
  // Web overflow:auto thin scroll bar (same face as the inventory lists): 10px track, 6px thumb, arrow tips; only when the content overflows.
  void DrawDetailScrollbar(Rect rect){
   float total=detailContent,view=rect.height,max=total-view;if(max<=0){detailDrag=false;return;}
   var track=new Rect(rect.xMax-10,rect.y,10,view);
   float inner=view-24f,thumbH=Mathf.Max(20f,inner*view/total),travel=inner-thumbH;
   float thumbY=track.y+12+travel*Mathf.Clamp01(detailScroll/max);var thumbCol=C(110,113,113);
   Fill(track,C(18,17,19));Fill(new Rect(track.x+2,thumbY+1.5f,6,thumbH-3),thumbCol);Fill(new Rect(track.x+3,thumbY,4,thumbH),thumbCol);
   float[] aw={2,4,4,6};
   for(int k=0;k<aw.Length;k++){
    Fill(new Rect(track.x+5-aw[k]/2f,track.y+2+k,aw[k],1),thumbCol);
    Fill(new Rect(track.x+5-aw[aw.Length-1-k]/2f,track.yMax-6+k,aw[aw.Length-1-k],1),thumbCol);
   }
   var ev=Event.current;
   if(ev.type==EventType.MouseDown&&ev.button==0&&track.Contains(ev.mousePosition)){detailDrag=true;ev.Use();}
   if(detailDrag&&(ev.type==EventType.MouseDown||ev.type==EventType.MouseDrag)){
    float t=Mathf.Clamp01((ev.mousePosition.y-track.y-12-thumbH/2)/Mathf.Max(1f,travel));detailScroll=t*max;ev.Use();
   }
   if(ev.type==EventType.MouseUp)detailDrag=false;
  }
  float DrawLedgers(float x,float y,float width){
   float start=y;if(planChanges>0){Text(new Rect(x,y,width,24),"변경 중 · "+planChanges,sans,13,C(188,185,179));y+=28;foreach(var n in defs.nodes){int before=LiveValue(n.key),after=PlannedValue(n.key);if(before==after)continue;Text(new Rect(x,y,width-110,25),Name(n),sans,13,C(204,201,195));Text(new Rect(x+width-110,y,110,25),before+" → "+after,serif,14,C(240,215,167),FontStyle.Normal,0,TextAnchor.MiddleRight);y+=28;}}
   if(sim!=null&&sim.Growth.Queue.Count>0){Text(new Rect(x,y,width,24),"자동 투자 예약 · "+sim.Growth.Queue.Count,sans,13,C(188,185,179));y+=28;for(int i=0;i<sim.Growth.Queue.Count;i++){string key=sim.Growth.Queue[i];var r=new Rect(x,y,width,28);StatDefsNode node;Text(r,(i+1)+". "+(nodeByKey.TryGetValue(key,out node)?Name(node):key),sans,13,C(204,201,195));Text(r,"예약 취소",sans,12,C(188,185,179),FontStyle.Normal,0,TextAnchor.MiddleRight);if(Click(r)){CancelReservation(i);break;}y+=30;}}
   return y-start;
  }
  static string SupportNote(string key){switch(key){case "pPierce":return "효과 미지원 · 현재 전투에 관통 패시브가 연결되지 않아 신규 투자와 예약은 사용할 수 없습니다. 기존 투자분 환불은 가능합니다.";case "pDot":return "효과 일부 미지원 · 축적률은 적용되며 DOT 피해·지속시간 소비는 아직 연결되지 않았습니다.";case "pPred":return "효과 일부 미지원 · 저체력 피해와 HP 회복은 적용되며 이동속도 증가는 아직 연결되지 않았습니다.";case "pRegen":return "효과 일부 미지원 · HP/ST 재생과 패링 회복은 적용되며 물약 쿨다운 감소는 아직 연결되지 않았습니다.";case "pGuard":return "효과 일부 미지원 · 기존 보호막 흡수율은 적용되며 보호 중 추가 HP 재생은 아직 연결되지 않았습니다.";default:return "";}}
  void DrawActions(bool isStat){
   string key=SelectedKey;int value=PlannedValue(key),reserved=sim==null?0:sim.Growth.Queued(key),future=value+reserved;
   int amount=isStat?1:Math.Max(1,selectedRank-future),cost=0;for(int i=0;i<amount;i++)cost+=RankCost(future+i);
   bool reserve=!isStat&&(sim.Growth.Queue.Count>0||plannedAp<cost),maxed=!isStat&&future>=GrowthState.Cap(key);
   bool can=key!="pPierce"&&(isStat?plannedSp>=1&&value<Math.Max(GrowthState.Cap(key),LiveValue(key)):!maxed&&future+amount<=GrowthState.Cap(key));
   string label=isStat?"계획에 추가 · 1 SP":maxed?"최대 레벨":(reserve?"자동 투자 예약 · ":"계획에 추가 · ")+cost+" AP";
   if(key=="pPierce")label="효과 미지원";
   var upgrade=new Rect(1477,820.2f,372,49);float ua=can?1:.48f;Grad(upgrade,C(81,84,84,ua),C(37,40,40,ua));Border(upgrade,C(147,150,150,ua));Border(new Rect(upgrade.x+1,upgrade.y+1,upgrade.width-2,upgrade.height-2),C(24,27,27,ua),2);Text(upgrade,label,sans,18,C(221,218,212,ua),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   if(Click(upgrade)&&can){if(reserve)ReservePassive(key,amount);else PlanChange(key,amount);}
   string note=isStat?can?"추가 후 계획 잔여 SP "+(plannedSp-1):"SP 또는 투자 상한을 확인하세요.":maxed?"레벨 상한에 도달했습니다.":reserve?"현재 AP "+plannedAp+" · 예약 후 예상 레벨 "+(future+amount)+" · AP가 모이면 자동 투자":"추가 후 계획 잔여 AP "+(plannedAp-cost);
   if(key=="pPierce")note="현재 전투 효과 연결 전까지 신규 투자는 잠겨 있습니다.";
   Text(new Rect(1477,876.2f,372,22.4f),note,sans,14,C(188,185,179),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   string notice=sim.Growth.Queue.Count>0?"자동 투자 예약 "+sim.Growth.Queue.Count+"개 저장됨 · 위에서 개별 취소 가능":planChanges>0?"변경 "+planChanges+"개 · 하단에서 적용":"AP가 부족해도 예약할 수 있습니다. 예약은 즉시 저장됩니다.";
   Text(new Rect(1477,904.6f,372,22.4f),notice,sans,14,C(188,185,179),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   int remove=isStat?1:selectedRank>0&&selectedRank<=value?value-selectedRank+1:1,refund=0;for(int i=0;i<remove;i++)refund+=RankCost(value-i-1);
   var rr=new Rect(1477,927,372,44);Text(rr,isStat?"1포인트 환불 계획":(remove==1?"1레벨 환불 계획":"환불 계획 · Lv. "+value+" → "+(value-remove))+(value>0?" · +"+refund+" AP":""),sans,18,C(160,163,163,value>0?1f:.48f),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(Click(rr)&&value>0)PlanChange(key,-remove);
  }
  void DrawFooter(Action close){
   string footer=sim.Growth.Queue.Count>0?"자동 투자 예약 "+sim.Growth.Queue.Count+"개 저장됨 · 짝수 레벨업마다 AP +1, 충분해지면 예약 순서대로 투자됩니다.":planChanges>0?planChanges+"개 변경 대기 · 적용 전에는 저장되지 않습니다.":"AP가 부족해도 예약 가능 · 짝수 레벨업으로 AP가 모이면 순서대로 자동 투자됩니다.";
   Text(new Rect(51,1014.8f,1342.9f,22.4f),footer,sans,14,C(188,185,179));
   var refund=new Rect(1407.89f,1004,109.22f,44);Text(refund,"전체 환불 계획",sans,16,C(142,145,145),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(Click(refund)){plan.RefundAll();RefreshPlan();}
   var cancel=new Rect(1531.11f,1004,97.5f,44);ControlFace(cancel,false,planChanges>0);Text(cancel,"계획 취소",sans,16,C(184,181,175,planChanges>0?1f:.48f),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(Click(cancel)&&planChanges>0){plan=sim.Growth.CreatePlan();RefreshPlan();}
   var apply=new Rect(1642.61f,1003,123.5f,46);ControlFace(apply,true,planChanges>0);Text(apply,"변경 적용",sansSemi,16,C(230,227,221,planChanges>0?1f:.48f),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(Click(apply)&&planChanges>0)ApplyPlan();
   var closeRect=new Rect(1780.11f,1004,88.89f,44);ControlFace(closeRect,false,true);if(Hot(closeRect))Fill(closeRect,new Color(1,1,1,.05f));Text(closeRect,"닫기 [J]",sans,16,C(184,181,175),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(Click(closeRect))close();
  }

  // ---- verification entry (--unity-stat-panel-capture <out-dir>): opens the window by itself, captures stills and quits ----
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void BootCapture(){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"--unity-stat-panel-capture");if(i<0||i+1>=a.Length)return;
   var go=new GameObject("StatPanelCapture");UnityEngine.Object.DontDestroyOnLoad(go);go.AddComponent<CaptureHost>().Output=a[i+1];
  }
  sealed class CaptureHost : MonoBehaviour {
   public string Output;NativeStatPanel panel;readonly List<string> log=new List<string>();bool done;
   void Awake(){panel=new NativeStatPanel();panel.SetOpen(true);}
   IEnumerator Start(){
    Directory.CreateDirectory(Output);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(1.2f);
    yield return Shot("unity-stat-default");
    panel.SelectNode("pDot",0);yield return Shot("unity-stat-node");
    panel.SelectNode("str",0);yield return Shot("unity-stat-node-stat");
    panel.forcedHover="pDot";yield return Shot("unity-stat-hover-node");panel.forcedHover="pDot@3";yield return Shot("unity-stat-hover-star");panel.forcedHover="str";yield return Shot("unity-stat-hover-stat");panel.forcedHover=null;
    panel.SelectPath("survival");yield return Shot("unity-stat-path-survival");
    panel.SelectPath("all");panel.filter="learned";yield return Shot("unity-stat-tab-learned");
    panel.filter="all";panel.SetZoom(1.25f);yield return Shot("unity-stat-zoom125");
    File.WriteAllText(Path.Combine(Output,"stat-capture.json"),"{\"scope\":\"Unity stat panel stills; no OS input claim\",\"shots\":[\""+string.Join("\",\"",log.ToArray())+"\"]}");
    done=true;Application.Quit(0);
   }
   IEnumerator Shot(string name){yield return new WaitForSecondsRealtime(.25f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(Output,name+".png"));log.Add(name);yield return new WaitForSecondsRealtime(.4f);}
   void OnGUI(){GUI.depth=-10000;if(!done)panel.Draw(()=>{});}
  }
 }
}
