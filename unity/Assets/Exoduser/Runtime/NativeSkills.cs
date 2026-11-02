using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort {
 // Web skill window (skill-forge.js / skill-forge.css, #skillPanel) in the 1920x1080 design space.
 // Definitions (names, descriptions, icons, slot candidate lists, geometry) come from Resources/Data/skill_defs_web.json, extracted from the web
 // runtime with a state mirror of Unity (only kiSlash learned and equipped in LMB). State values (equipped skill, level, SP, malice, player LV)
 // are read from Unity; whatever Unity does not have is drawn as "미이식". The 3D altar/slot discs are stills captured from the web renderer.
 [Serializable] public sealed class SkillDefsOrb {public string id;public float x,y,o;public bool host,dim;public float[] nameRect,subRect,hostRect;}
 [Serializable] public sealed class SkillDefsSlot {
  public int index;public string key,fieldTitle,fieldSub;
  public float[] button,disc,keyRect,nameRect,fieldRect,fieldTitleRect,fieldSubRect,coreRect,coreNameRect,hintRect;
  public SkillDefsOrb[] orbs;
 }
 [Serializable] public sealed class SkillDefsSkill {public string id,name,desc,icon;public int spCost,matCost,reqLv;public bool host;public string[] lines;}
 [Serializable] public sealed class SkillDefsFile {public SkillDefsSlot[] slots;public SkillDefsSkill[] skills;}

 public sealed class NativeSkills {
  public bool Open {get;private set;}
  public Action Changed;
  string pendingResetId;
  public string PendingResetId {get{return pendingResetId;}}
  public bool RequestReset(Simulation sim,string id){if(sim==null||!Ported(id)||!skillById.TryGetValue(id,out var d)||NativeSkillManagementPolicy.Level(sim,id)<1)return false;if((id=="kiSlash"||id=="fireball")&&NativeSkillManagementPolicy.Level(sim,id)<=1)return false;cur=sim;pendingResetId=id;return true;}
  public bool ResolveReset(bool accept){if(pendingResetId==null)return false;string id=pendingResetId;pendingResetId=null;if(!accept)return false;bool changed=NativeSkillManagementPolicy.Reset(cur,id,skillById[id].spCost);if(changed)ChangedSkill();return changed;}
  public int SelectedSlot {get;private set;}=SkillUiState.LmbSlot;
  const string NotPorted="미이식";
  static readonly Vector2 AltarOrigin=new Vector2(393,295.64f);
  static readonly Rect AltarImageRect=new Rect(383,296,1154,671),WindowRect=new Rect(8,8,1904,1064);
  readonly SkillUiData data;readonly SkillDefsFile defs;readonly Dictionary<string,SkillDefsSkill> skillById=new Dictionary<string,SkillDefsSkill>();
  Font serif,cinzel,latinFont,sans,sansSemi;
  Texture2D windowBase,altarLmb,altarNone,altarRingLmb,altarRingNone,forgeBackground,sphereLight,discEmptySel,discLmb,discLmbSel,plate;
  readonly Dictionary<string,Texture2D> orbIcons=new Dictionary<string,Texture2D>(),procedural=new Dictionary<string,Texture2D>();
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  string selectedOrb;bool ready;
  Texture2D discEmpty;Simulation cur;
  // B03 ports: these skills run in the Simulation (Skills/*.cs); everything else stays "미이식"
  static bool Ported(string id){return NativeSkillManagementPolicy.Supported(id);}
  string EquippedId(int slot){
    if(slot==SkillUiState.LmbSlot)return cur.Config.ActiveAttack=="kiSlash"?"kiSlash":null;
    return NativeHud.SlotSkillId(cur,slot);
  }
  int SkillLevelOf(string id){return NativeSkillManagementPolicy.Level(cur,id);}
  void ChangedSkill(){Changed?.Invoke();}

  public NativeSkills(){
   data=JsonUtility.FromJson<SkillUiData>(Resources.Load<TextAsset>("Data/skill_ui").text);
   if(data.slots.Length!=13||data.slots[6].definition!="lmb"||data.skill.id!="kiSlash")throw new InvalidOperationException("Source skill slot catalogue mismatch");
   defs=JsonUtility.FromJson<SkillDefsFile>(Resources.Load<TextAsset>("Data/skill_defs_web").text);
   if(defs.slots.Length!=13)throw new InvalidOperationException("Web skill definition slots mismatch");
   // The reference capture predates the web E/RMB swap. Runtime and HUD already use RMB magic / E flame blade.
   var magic=defs.slots[9];defs.slots[9]=defs.slots[7];defs.slots[7]=magic;defs.slots[7].index=7;defs.slots[9].index=9;
   foreach(var s in defs.skills)skillById[s.id]=s;
  }
  static int RequestedSlot(){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"--unity-skill-slot");return i>=0&&i+1<a.Length&&int.TryParse(a[i+1],out var n)?Mathf.Clamp(n,0,15):-1;}
  public void SetOpen(bool value,int slot=6){Open=value;pendingResetId=null;if(value){int req=RequestedSlot();Select(req>=0?req:slot);}}
  public void Select(int slot){SelectedSlot=Mathf.Clamp(slot,0,15);selectedOrb=null;infoScroll=0;}
  public void HandleKeys(Action close,Action equip){
   if(pendingResetId!=null){if(ExoInput.KeyDown(KeyCode.Escape))pendingResetId=null;return;}
   if(NativeKeyBindInput.Down("skill")){close();return;}   // A16: web BINDS.skill
   if(ExoInput.KeyDown(KeyCode.LeftArrow))Select(SelectedSlot-1);
   if(ExoInput.KeyDown(KeyCode.RightArrow))Select(SelectedSlot+1);
   if(ExoInput.KeyDown(KeyCode.Home))Select(0);if(ExoInput.KeyDown(KeyCode.End))Select(15);
   if(ExoInput.KeyDown(KeyCode.Alpha1))Select(0);if(ExoInput.KeyDown(KeyCode.Alpha2))Select(1);if(ExoInput.KeyDown(KeyCode.Alpha3))Select(2);if(ExoInput.KeyDown(KeyCode.Alpha4))Select(3);
   if(ExoInput.KeyDown(KeyCode.Return)&&SelectedSlot==SkillUiState.LmbSlot)equip();
  }

  // ---- resources / primitives ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  Texture2D Tex(string path){return Resources.Load<Texture2D>(path);}
  void Init(){
   if(ready)return;ready=true;
   serif=NativeSilverHellUi.Font(true)??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");cinzel=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold")??serif;latinFont=Resources.Load<Font>("Art/fonts/Cinzel-400")??serif;
   sans=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");sansSemi=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??sans;
   windowBase=Tex("Art/ui/skill/window_base");altarLmb=Tex("Art/ui/skill/altar_lmb");altarNone=Tex("Art/ui/skill/altar_none");discEmpty=Tex("Art/ui/skill/disc_empty");discEmptySel=Tex("Art/ui/skill/disc_empty_sel");discLmb=Tex("Art/ui/skill/disc_lmb");discLmbSel=Tex("Art/ui/skill/disc_lmb_sel");
   plate=Tex("Art/ui/inventory/plate");altarRingLmb=Tex("Art/ui/skill/altar_lmb_clean");altarRingNone=Tex("Art/ui/skill/altar_none_clean");
  }
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Border(Rect r,Color c,float w=1){Fill(new Rect(r.x,r.y,r.width,w),c);Fill(new Rect(r.x,r.yMax-w,r.width,w),c);Fill(new Rect(r.x,r.y+w,w,r.height-2*w),c);Fill(new Rect(r.xMax-w,r.y+w,w,r.height-2*w),c);}
  static Rect R(float[] a){return new Rect(a[0],a[1],a[2],a[3]);}
  // CSS linear-gradient angle: 180 top to bottom, 90 left to right, 270 right to left.
  Texture2D Gradient(Color a,Color b,float angle){
   string key="g"+ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+angle;
   if(procedural.TryGetValue(key,out var t))return t;
   const int n=32;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   float rad=angle*Mathf.Deg2Rad,dx=Mathf.Sin(rad),dy=-Mathf.Cos(rad),len=Mathf.Abs(dx)+Mathf.Abs(dy);var px=new Color[n*n];
   for(int iy=0;iy<n;iy++)for(int ix=0;ix<n;ix++){float sx=(ix+.5f)/n-.5f,sy=((n-1-iy)+.5f)/n-.5f;px[iy*n+ix]=Color.Lerp(a,b,Mathf.Clamp01(.5f+(sx*dx+sy*dy)/len));}
   t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
  }
  void Grad(Rect r,Color a,Color b,float angle=180f){NativeUiAudit.DrawTexture(r,Gradient(a,b,angle));}
  Texture2D Radial(){
   if(procedural.TryGetValue("radial",out var t))return t;
   const int n=128;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=(x+.5f)/n*2-1,dy=(y+.5f)/n*2-1;px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(dx*dx+dy*dy)));}
   t.SetPixels(px);t.Apply(false,true);procedural["radial"]=t;return t;
  }
  void Glow(float cx,float cy,float rx,float ry,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(new Rect(cx-rx,cy-ry,rx*2,ry*2),Radial());GUI.color=old;}
  Texture2D DiscTexture(){
   if(procedural.TryGetValue("disc",out var t))return t;
   const int n=128;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float d=Mathf.Sqrt((x+.5f-n/2f)*(x+.5f-n/2f)+(y+.5f-n/2f)*(y+.5f-n/2f))/(n/2f);px[y*n+x]=new Color(1,1,1,Mathf.Clamp01((1f-d)*n/2f+.5f));}
   t.SetPixels(px);t.Apply(false,true);procedural["disc"]=t;return t;
  }
  void Disc(Vector2 c,float r,Color col){var old=GUI.color;GUI.color=col;NativeUiAudit.DrawTexture(new Rect(c.x-r,c.y-r,r*2,r*2),DiscTexture());GUI.color=old;}

  // ---- text ----
  GUIStyle Style(Font f,int size,FontStyle fs){
   long key=(((long)(f==serif?1:f==cinzel?2:f==sansSemi?3:f==latinFont?5:4))*1000+size)*4+(int)fs;
   if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=f,fontSize=size,fontStyle=fs,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  float Width(Font f,int size,FontStyle fs,string text,float spacing){
   var st=Style(f,size,fs);if(spacing==0)return st.CalcSize(new GUIContent(text)).x;
   float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+spacing;return w;
  }
  void Text(Rect r,string text,Font f,int size,Color c,FontStyle fs=FontStyle.Normal,float spacing=0,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false,bool bounded=false){
   if(string.IsNullOrEmpty(text))return;
   var st=Style(f,size,fs);
   if(bounded){st=new GUIStyle(st){clipping=TextClipping.Clip};if(Width(f,size,fs,text,spacing)>r.width){var ends=System.Globalization.StringInfo.ParseCombiningCharacters(text);int n=ends.Length;while(n>0&&Width(f,size,fs,text.Substring(0,ends[n-1])+"…",spacing)>r.width)n--;text=(n==0?"":text.Substring(0,ends[n-1]))+"…";}}
   float total=Width(f,size,fs,text,spacing),x=r.x;
   if(anchor==TextAnchor.MiddleCenter||anchor==TextAnchor.UpperCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
   for(int pass=shadow?0:1;pass<2;pass++){
    st.normal.textColor=pass==0?new Color(0,0,0,.8f):c;float px=x,oy=pass==0?1.5f:0;
    if(spacing==0){NativeSilverHellUi.Label(new Rect(px,r.y+oy,bounded?Mathf.Min(r.width,total):Mathf.Max(r.width,total)+8,r.height),text,st);continue;}
    foreach(char ch in text){var g=ch.ToString();NativeSilverHellUi.Label(new Rect(px,r.y+oy,bounded?Mathf.Min(st.CalcSize(new GUIContent(g)).x,Mathf.Max(0,r.xMax-px)):60,r.height),g,st);px+=st.CalcSize(new GUIContent(g)).x+spacing;}
   }
  }
  // Latin runs use the web display face (Cinzel Decorative), Hangul falls back to the serif body face, like the browser's font stack.
  static bool IsLatin(char c){return c<128||c=='·';}
  void Mixed(Rect r,string text,int size,Color c,float spacing,TextAnchor anchor,FontStyle koStyle=FontStyle.Normal,bool shadow=false){
   var runs=new List<KeyValuePair<bool,string>>();string cur="";bool latin=false;
   foreach(char ch in text){bool l=IsLatin(ch)&&ch!=' ';if(ch==' '){cur+=ch;continue;}if(cur.Length>0&&l!=latin&&cur.Trim().Length>0){runs.Add(new KeyValuePair<bool,string>(latin,cur));cur="";}latin=l;cur+=ch;}
   if(cur.Length>0)runs.Add(new KeyValuePair<bool,string>(latin,cur));
   float total=0;foreach(var run in runs)total+=run.Key?Width(latinFont,size,FontStyle.Normal,run.Value,spacing):Width(serif,size,koStyle,run.Value,spacing);
   float x=r.x;if(anchor==TextAnchor.MiddleCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
   foreach(var run in runs){
    float w=run.Key?Width(latinFont,size,FontStyle.Normal,run.Value,spacing):Width(serif,size,koStyle,run.Value,spacing);
    Text(new Rect(x,r.y,w+4,r.height),run.Value,run.Key?latinFont:serif,size,c,run.Key?FontStyle.Normal:koStyle,spacing,TextAnchor.MiddleLeft,shadow);x+=w;
   }
  }
  // Greedy wrap with the browser's break opportunities for Korean: after spaces and between Hangul syllables / Latin-or-digit and Hangul
  // (never before closing punctuation or after an opening bracket). Fixed CSS-like line height.
  static bool Hangul(char c){return c>=0xAC00&&c<=0xD7A3;}
  static bool CanBreak(string t,int i){
   if(i<=0||i>=t.Length)return false;char l=t[i-1],r=t[i];
   if(l==' ')return true;if(r==' ')return false;
   if(")].,!?:;%·".IndexOf(r)>=0||"([{".IndexOf(l)>=0)return false;
   return Hangul(l)||Hangul(r);
  }
  void Paragraph(Rect r,string text,Font f,int size,Color c,float lineHeight){
   var st=Style(f,size,FontStyle.Normal);float y=r.y;int start=0;
   while(start<text.Length){
    int end=start,lastBreak=-1;
    for(int i=start+1;i<=text.Length;i++){
     if(CanBreak(text,i)||i==text.Length)lastBreak=i;
     if(st.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x>r.width&&lastBreak>start&&lastBreak<i){end=lastBreak;break;}
     end=i;
    }
    if(end<=start)end=text.Length;
    Text(new Rect(r.x,y,r.width,lineHeight),text.Substring(start,end-start).Trim(),f,size,c);y+=lineHeight;start=end;
    while(start<text.Length&&text[start]==' ')start++;
   }
  }

  Texture2D OrbIcon(string id,bool dim){
   string path="Art/ui/skill_icons/orb/"+id+(dim?"_dim":"");
   if(!orbIcons.TryGetValue(path,out var t)){t=Resources.Load<Texture2D>(path);orbIcons[path]=t;}
   return t;
  }
  bool Plate(Rect r,string label,Color text,bool shadow=true){
   Fill(r,C(35,34,37));if(plate!=null)NativeUiAudit.DrawTexture(r,plate,ScaleMode.StretchToFill);
   Grad(r,C(21,20,23,.51f),C(11,10,12,.675f));
   if(GUI.enabled&&r.Contains(Event.current.mousePosition))Fill(r,new Color(1,1,1,.05f));
   Text(r,label,serif,16,text,FontStyle.Bold,0,TextAnchor.MiddleCenter,shadow);
   return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);
  }

  // ---- window ----
  float skillBodyTop=308.1875f;Rect altarBounds;Vector2 altarCenter;float forgeBackgroundWidth;
  public void Draw(Simulation sim,Action close,Action equip){
   if(!Open)return;Init();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),C(0,0,0,.53f));
    float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var centerMatrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*scale)/2,(Screen.height-1080*scale)/2,0),Quaternion.identity,Vector3.one*scale);
    cur=sim;if(pendingResetId!=null)GUI.enabled=false;bool lmb=sim.Config.ActiveAttack=="kiSlash";int level=Math.Max(1,sim.Config.KiSlashLevel);
    float ew=NativeUiViewport.Edges.Width;bool wide=ew/1080f>=2.3f;float bodyX=wide?(ew-1800)/2:333,bodyW=wide?1800:ew-bodyX-(HasRoad()?333:51);
    altarBounds=new Rect(bodyX,skillBodyTop,bodyW,658.8125f);altarCenter=new Vector2(altarBounds.center.x,676.2656f);
    GUI.matrix=NativeUiViewport.EdgeMatrix;NativeSilverHellUi.Panel(new Rect(8,8,ew-16,1064),28,0);DrawForgeBackground(new Rect(36,147,ew-72,833));
    GUI.matrix=centerMatrix;NativePanelTitle.Draw(new Rect(700,72,520,64),"전투 스킬");NativePanelTabBar.Draw(NativePanelTabBar.Preset.Skill,"skillPanel");DrawSlots(lmb);
    GUI.matrix=NativeUiViewport.EdgeMatrix;DrawInfo(sim,lmb,level,equip);NativeUiAudit.Region(altarBounds,"component","skill-tree","slot="+SelectedSlot+";road="+HasRoad());
    if(SelectedSlot<13)DrawAltar(lmb,level);else{var intrinsic=SelectedSlot==13?Tex("Art/ui/skill/roll_boots"):OrbIcon(SelectedSlot==14?"execution":"fanShot",false);if(intrinsic!=null)NativeUiAudit.DrawTexture(new Rect(altarCenter.x-48,altarCenter.y-48,96,96),intrinsic,ScaleMode.ScaleToFit,true);Text(new Rect(altarCenter.x-250,altarCenter.y+65,500,34),roleNames[SelectedSlot]+" · "+SlotKey(SelectedSlot),serif,22,C(217,214,208),FontStyle.Normal,0,TextAnchor.MiddleCenter);Text(new Rect(altarCenter.x-250,altarCenter.y+105,500,26),SelectedSlot==15?"전용":"고정 기술은 교체할 수 없습니다",serif,14,C(150,153,153),FontStyle.Normal,0,TextAnchor.MiddleCenter);}
    GUI.matrix=NativeUiViewport.RightMatrix;if(HasRoad())DrawRoad(lmb);GUI.matrix=centerMatrix;DrawBottom(close);GUI.enabled=enabled;if(pendingResetId!=null)DrawResetConfirmation();
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
  static float Fract(float x){return x-Mathf.Floor(x);}static float SmokeHash(float x,float y){return Fract(Mathf.Sin(x*127.1f+y*311.7f)*43758.5453f);}
  static float SmokeNoise(float x,float y){float ix=Mathf.Floor(x),iy=Mathf.Floor(y),fx=Fract(x),fy=Fract(y);fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return Mathf.Lerp(Mathf.Lerp(SmokeHash(ix,iy),SmokeHash(ix+1,iy),fx),Mathf.Lerp(SmokeHash(ix,iy+1),SmokeHash(ix+1,iy+1),fx),fy);}
  static float Smoke(float x,float y){float result=0,a=.5f;for(int i=0;i<5;i++){result+=a*SmokeNoise(x,y);x*=2.03f;y*=2.03f;a*=.5f;}return result;}
  static float Smooth(float a,float b,float x){float t=Mathf.Clamp01((x-a)/(b-a));return t*t*(3-2*t);}
  static float DisplayChannel(float x){x*=1.05f;x=Mathf.Clamp01(x*(2.51f*x+.03f)/(x*(2.43f*x+.59f)+.14f));return x<=.0031308f?x*12.92f:1.055f*Mathf.Pow(x,1/2.4f)-.055f;}
  void DrawForgeBackground(Rect root){
   Border(root,C(50,53,53),1);Border(new Rect(root.x+2,root.y+2,root.width-4,root.height-4),C(50,53,53),1);var area=new Rect(root.x+3,root.y+3,root.width-6,root.height-6);
   if(forgeBackground==null||Mathf.Abs(forgeBackgroundWidth-area.width)>.5f){if(forgeBackground!=null)UnityEngine.Object.Destroy(forgeBackground);forgeBackgroundWidth=area.width;float w=area.width,h=area.height,ax=(altarCenter.x-area.x)/w,ay=1-(altarCenter.y-area.y)/h;
    forgeBackground=NativeSilverHellUi.Effect(512,232,(u,v)=>{float vv=1-v,smoke=Smoke(u*w/600*1.6f,vv*h/600*1.6f)*.7f+Smoke(u*w/600*4,vv*h/600*4)*.3f,dx=(u-ax)*w/Mathf.Max(w,h),dy=(vv-ay)*h/Mathf.Max(w,h)*1.25f,r=Mathf.Sqrt(dx*dx+dy*dy),fire=Mathf.Pow(Smooth(.34f,0,r),1.6f)*(.5f+.5f*smoke)*.45f,vig=Smooth(1.15f,.25f,Mathf.Sqrt((u-.5f)*(u-.5f)+(vv-.5f)*(vv-.5f)*1.4f*1.4f));return new Color(DisplayChannel((Mathf.Lerp(.010f,.026f,smoke)+.40f*fire)*vig),DisplayChannel((Mathf.Lerp(.007f,.017f,smoke)+.08f*fire)*vig),DisplayChannel((Mathf.Lerp(.008f,.016f,smoke)+.025f*fire)*vig),1);});}
   NativeUiAudit.DrawTexture(area,forgeBackground);NativeUiAudit.Region(area,"component","skill-background","웹 전체폭 제단배경·사각 crop 제거");
  }
  static readonly string[] roleNames={"스킬 1","스킬 2","스킬 3","스킬 4","F 스킬","필살기","무기 공격","마법","사슬 이동","칼등 처내기","마법 패링","탈출기","분노 폭발","구르기","처형","일반사격"};
  string SlotKey(int i){string[] actions={null,null,null,null,null,null,"weapon","beam","charge","shield","parry",null,"bow","roll",null,null};string code=actions[i]==null?null:NativeKeyBindInput.Bindings.Primary(actions[i]);if(actions[i]!=null&&code==null)return KeyBindings.KeyName(null,false);return i==13?"↑↓←→ + "+KeyBindings.KeyName(code,false):code==null?new[]{"1","2","3","4","F","Z","LMB","RMB","Shift","E","Q","Ctrl","Space","Space","X","T"}[i]:code=="mouse0"?"LMB":code=="mouse1"?"MMB":code=="mouse2"?"RMB":KeyBindings.KeyName(code,false);}
  string PreviewId(int slot){if(slot!=5&&slot!=12||EquippedId(slot)!=null)return null;var ids=new List<string>();foreach(var orb in defs.slots[slot].orbs)if(skillById.ContainsKey(orb.id))ids.Add(orb.id);return NativeSkillPreviewPolicy.Pick(ids.ToArray(),id=>cur.Skills.Level(id),slot==5?"blackStar":"giantSlam");}
  string PreviewCondition(string id){if(id==null||!skillById.TryGetValue(id,out var d))return "습득 필요";if(d.reqLv>cur.Player.Level)return "Lv"+d.reqLv+" 도달 시 해금";return cur.Skills.Level(id)>0?"이 슬롯에 장착":"습득 SP "+d.spCost+(d.matCost>0?"\n악의오브 "+NativeSkillPreviewPolicy.MaliceCost(d.matCost):"");}
  string SelectedId(){if(SelectedSlot==13)return "roll";if(SelectedSlot==14)return "execution";if(SelectedSlot==15)return "fanShot";return selectedOrb??EquippedId(SelectedSlot)??PreviewId(SelectedSlot);}
  bool HasRoad(){var id=SelectedSlot<13?EquippedId(SelectedSlot):null;return SelectedSlot<13&&id!=null&&skillById.TryGetValue(id,out var d)&&d.host;}
  void Glass(Rect r){if(sphereLight==null)sphereLight=NativeSilverHellUi.Effect(128,128,(u,v)=>{float x=u*2-1,y=v*2-1,d=Mathf.Sqrt(x*x+y*y);if(d>1)return Color.clear;float highlight=Mathf.Exp(-((x+.28f)*(x+.28f)/.28f+(y+.48f)*(y+.48f)/.07f))*.43f,edge=Smooth(.64f,1,d)*.42f;return highlight>edge?new Color(1,1,1,highlight-edge):new Color(0,0,0,edge-highlight);});NativeUiAudit.DrawTexture(r,sphereLight);}
  string SlotCondition(int i,string id,bool preview){if(i==13)return "고정";if(i==14)return SkillLevelOf("execution")>0?"고정":"고정 · 습득 필요";if(i==8||i==11)return "기절 탈출";if(i>=6&&i!=12)return "전용";if(id!=null&&!preview)return "";if(preview)return PreviewCondition(id);return "스킬 습득 후 장착";}
  void DrawSlots(bool lmb){
   float cell=100,gap=Mathf.Clamp(Screen.width*.005f,4,10),total=16*cell+15*gap,left=(1920-total)/2;
   for(int i=0;i<16;i++){bool selected=i==SelectedSlot;float x=left+i*(cell+gap);var button=new Rect(x,164,cell,134.1875f);var disc=new Rect(x+15,164,70,70);string id=i<13?EquippedId(i):i==14?"execution":null;bool preview=id==null&&(i==5||i==12);if(preview)id=PreviewId(i);Texture2D tex=id==null?null:OrbIcon(id,preview);if(i==6&&lmb)tex=OrbIcon("kiSlash",false);if(i==13)tex=Tex("Art/ui/skill/roll_boots");if(i==15)tex=OrbIcon("fanShot",false);bool socket=id==null&&i>=1&&i<=3;if(socket)tex=Tex("Art/ui/skill/empty_socket_"+(i+1));
    if(i==13||i==14)Fill(new Rect(x,164,1,134),C(114,117,117,.33f));
    if(!socket){var c=disc.center;if(selected){Disc(c,43,C(236,121,88,.25f));Disc(c,39,C(236,121,88));Disc(c,37,C(8,11,11));}Disc(c,35,C(167,170,170));Disc(c,33,C(20,23,23));}
    if(tex!=null){var imageRect=socket?new Rect(disc.x-2,disc.y-2,74,74):i==13?new Rect(disc.x+5,disc.y+5,60,60):disc;NativeUiAudit.DrawTexture(imageRect,tex,ScaleMode.ScaleToFit,true);if(!socket)Glass(disc);}else Text(disc,"—",serif,22,C(140,143,143),FontStyle.Normal,0,TextAnchor.MiddleCenter);
    Mixed(new Rect(x,237,cell,11),SlotKey(i),11,C(167,170,170),0,TextAnchor.MiddleCenter);
    string shown=i==15?"일반사격":id!=null&&skillById.TryGetValue(id,out var d)?d.name:roleNames[i];Text(new Rect(x,251,cell,16.2f),shown,serif,12,selected?C(217,214,208):id==null&&!preview&&i<6?C(113,116,116):C(170,173,173),FontStyle.Normal,0,TextAnchor.MiddleCenter,false,true);
    var stateStyle=new GUIStyle(Style(serif,10,FontStyle.Normal)){alignment=TextAnchor.UpperCenter,wordWrap=true};stateStyle.normal.textColor=i==13||i==14?C(212,209,203):C(153,156,156);NativeSilverHellUi.Label(new Rect(x,270.1875f,cell,28),SlotCondition(i,id,preview),stateStyle);if(NativeSilverHellUi.Button(button,GUIContent.none,GUIStyle.none))Select(i);
   }
  }
  List<string> WrapInfo(string text,float width,int size){var lines=new List<string>();var style=Style(serif,size,FontStyle.Normal);int start=0;while(start<text.Length){int end=start,last=-1;for(int i=start+1;i<=text.Length;i++){if(style.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x>width){end=last>start?last:Mathf.Max(start+1,i-1);break;}end=i;if(CanBreak(text,i)||i==text.Length)last=i;}if(end<=start)end=text.Length;lines.Add(text.Substring(start,end-start).Trim());start=end;while(start<text.Length&&text[start]==' ')start++;}return lines;}
  float infoScroll;
  void DrawInfo(Simulation sim,bool lmb,int level,Action equip){
   string id=SelectedId();SkillDefsSkill d=null;if(id!=null)skillById.TryGetValue(id,out d);bool fixedSkill=SelectedSlot==13||SelectedSlot==14;
   if(id==null){var empty=new Rect(51,skillBodyTop,270,68);InfoFace(empty);Text(new Rect(74,skillBodyTop+22,224,24),"스킬을 고르면 정보가 표시됩니다",serif,14,C(113,116,116));return;}
   string name=SelectedSlot==15?"일반사격":d!=null?d.name:roleNames[SelectedSlot];int lv=SkillLevelOf(id);bool learned=d!=null&&lv>0,supported=Ported(id);
   string desc=SelectedSlot==13?"방향키와 함께 사용 · 기절 탈출":SelectedSlot==15?"T자동: 기본 화살":d!=null?d.desc:"";if(id=="fireball")desc=desc.Replace("[기본: E]","[기본: "+SlotKey(7)+"]");
   var lines=WrapInfo(desc,224,16);float descH=Mathf.Max(28,lines.Count*28),descY=104.59375f,y=descY+descH+14;bool extra=fixedSkill||SelectedSlot==8||SelectedSlot==11;
   float costY=y+(extra?33:0),buttonY=costY+59,equipY=buttonY+(d!=null?56:0);bool canEquip=id!=EquippedId(SelectedSlot)&&NativeSkillManagementPolicy.CanEquip(sim,SelectedSlot,id);
   float resourceY=equipY+(canEquip?56:0)+(d!=null&&!supported?20:0),height=resourceY+56;var box=new Rect(51,skillBodyTop,270,Mathf.Min(height,658.8125f));InfoFace(box);NativeUiAudit.Region(box,"component","skill-info","최종 웹실측 x51/w270·Hahmlet28/16·행간28");
   var evt=Event.current;if(evt.type==EventType.ScrollWheel&&box.Contains(evt.mousePosition)){infoScroll=Mathf.Clamp(infoScroll+evt.delta.y*22,0,Mathf.Max(0,height-box.height));evt.Use();}infoScroll=Mathf.Clamp(infoScroll,0,Mathf.Max(0,height-box.height));
   var groupMatrix=NativeUiAudit.BeginScaledGroup(box);try{float off=infoScroll;var ico=id=="roll"?Tex("Art/ui/skill/roll_boots"):OrbIcon(id,false);var center=new Vector2(51,49.296875f-off);Disc(center,28,C(146,149,149,.22f));if(ico!=null)NativeUiAudit.DrawTexture(new Rect(23,21.296875f-off,56,56),ico,ScaleMode.ScaleToFit,true);
    Text(new Rect(93,21-off,154,33.6f),name,serif,28,C(222,219,213),FontStyle.Bold);if(d!=null)Text(new Rect(93,58.59375f-off,154,19),"Lv "+lv+" / 20",serif,13,C(165,168,168));Fill(new Rect(23,89.59375f-off,224,1),C(146,149,149,.22f));
    for(int i=0;i<lines.Count;i++)Text(new Rect(23,descY+i*28-off,224,28),lines[i],serif,16,C(217,214,208));
    if(extra)Text(new Rect(23,y-off,224,24),fixedSkill?"고정 기술은 교체할 수 없습니다":"기절 탈출 ["+SlotKey(SelectedSlot)+"]",serif,13,C(170,173,173));
    if(d!=null){Fill(new Rect(23,costY-off,224,1),C(146,149,149,.22f));Fill(new Rect(23,costY+42-off,224,1),C(146,149,149,.22f));string cost=learned?"강화 SP "+SkillRules.UpgradeSpCost:"습득 SP "+d.spCost+(d.matCost>0?" · 악의오브 "+sim.MaliceCost(d.matCost):"");Text(new Rect(25,costY+10-off,220,23),cost,serif,15,C(165,168,168));int locked=SkillRules.SkillLevelLock(sim.Player.Level);if(learned&&lv>=locked&&lv<20)Text(new Rect(25,costY+10-off,220,23),"Lv"+(locked*50)+" 도달 시 해금",serif,14,C(224,138,106),FontStyle.Normal,0,TextAnchor.MiddleRight);
     bool can=supported&&(learned?NativeSkillManagementPolicy.CanUpgrade(sim,id):NativeSkillManagementPolicy.CanLearn(sim,id,d.spCost,d.matCost,d.reqLv));
     if(InfoButton(new Rect(23,buttonY-off,68.453125f,40),learned?"강화 +":"습득",can,true)){bool changed=learned?NativeSkillManagementPolicy.Upgrade(sim,id):NativeSkillManagementPolicy.Learn(sim,id,d.spCost,d.matCost,d.reqLv);if(changed)ChangedSkill();}
     if(learned){if(InfoButton(new Rect(101.453125f,buttonY-off,67.015625f,40),"강화 −",supported&&lv>1,false)){if(NativeSkillManagementPolicy.LevelDown(sim,id))ChangedSkill();}if(InfoButton(new Rect(178.46875f,buttonY-off,64,40),"리셋",supported&&(!(id=="kiSlash"||id=="fireball")||lv>1),false))RequestReset(sim,id);}if(!supported)Text(new Rect(23,buttonY+42-off,224,18),"실행 기능 미이식",serif,11,C(142,145,145));
    }
    if(canEquip&&InfoButton(new Rect(23,equipY-off,224,40),"이 슬롯에 장착 ["+SlotKey(SelectedSlot)+"]",true,false)){if(NativeSkillManagementPolicy.Equip(sim,SelectedSlot,id))ChangedSkill();}
    Fill(new Rect(23,resourceY-off,224,1),C(146,149,149,.22f));NativeCurrencyOrb.Draw(new Rect(23,resourceY+12-off,24,24),sim.Materials);Text(new Rect(47,resourceY+12-off,200,24),"SP "+sim.Player.StatPoints+" · 악의오브 "+sim.Materials.ToString("N0",System.Globalization.CultureInfo.InvariantCulture)+" · LV "+sim.Player.Level,serif,13,C(165,168,168),FontStyle.Normal,.1f);
   }finally{NativeUiAudit.EndScaledGroup(groupMatrix);}
  }
  void InfoFace(Rect r){Fill(r,C(8,11,11,.72f));Border(r,C(146,149,149,.22f));}
  bool InfoButton(Rect r,string text,bool enabled,bool primary){bool prior=GUI.enabled;GUI.enabled=prior&&enabled;var old=GUI.color;if(!enabled)GUI.color=new Color(old.r,old.g,old.b,old.a*.42f);NativeSilverHellUi.ActionPlate(r,false,enabled&&r.Contains(Event.current.mousePosition)?1:0,false,22,6);Text(r,text,serif,16,primary?C(242,240,236):C(214,211,205),FontStyle.Normal,0,TextAnchor.MiddleCenter);bool hit=NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);GUI.color=old;GUI.enabled=prior;return enabled&&hit;}
  void DrawResetConfirmation(){
   if(!skillById.TryGetValue(pendingResetId,out var d)){pendingResetId=null;return;}Fill(new Rect(0,0,1920,1080),C(0,0,0,.72f));var box=new Rect(650,408,620,264);Grad(box,C(22,10,8,.97f),C(15,6,6,.98f));Border(box,C(75,42,29));
   Text(new Rect(686,438,548,32),d.name+" 리셋?",serif,20,C(223,220,214),FontStyle.Bold,0,TextAnchor.MiddleCenter);Text(new Rect(686,480,548,28),"SP +"+NativeSkillManagementPolicy.ResetRefund(cur,pendingResetId,d.spCost)+" 환불",serif,17,C(223,220,214),FontStyle.Normal,0,TextAnchor.MiddleCenter);Text(new Rect(686,512,548,28),"악의오브는 반납되지 않습니다",serif,15,C(170,173,173),FontStyle.Normal,0,TextAnchor.MiddleCenter);
   if(InfoButton(new Rect(812,582,140,44),"확인",true,true))ResolveReset(true);if(InfoButton(new Rect(968,582,140,44),"취소",true,false))ResolveReset(false);
  }
  bool WebButton(Rect r,string label,Color top,Color bottom,Color border,Color text,bool active=false){if(top.a>0)Grad(r,top,bottom);if(active&&GUI.enabled&&r.Contains(Event.current.mousePosition))Fill(r,new Color(1,1,1,.06f));Border(r,border);Fill(new Rect(r.x+1,r.y+1,r.width-2,1),new Color(1,1,1,.07f));Text(r,label,serif,16,text,FontStyle.Bold,0,TextAnchor.MiddleCenter);return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none)&&active;}
  void DrawInfoResources(Simulation sim,float y){Fill(new Rect(74,y,284,1),C(146,149,149,.5f));string malice=sim.Materials.ToString("N0",System.Globalization.CultureInfo.InvariantCulture);NativeCurrencyOrb.Draw(new Rect(74,y+8,24,24),sim.Materials);Mixed(new Rect(104,y+8,254,23),"SP "+sim.Player.StatPoints+"  ·  악의오브 "+malice+"  ·  LV "+sim.Player.Level,13,C(165,168,168),.78f,TextAnchor.MiddleLeft);}

  Rect AltarRect(float[] a){var r=R(a);r.x+=altarCenter.x-960;r.y+=altarCenter.y-672.89f;return r;}
  void DrawAltar(bool lmb,int level){
   var slot=defs.slots[SelectedSlot];bool equipped=SelectedSlot==SkillUiState.LmbSlot&&lmb;const float scale=145.75f/150;
   var ring=equipped?altarRingLmb:altarRingNone;if(ring!=null)NativeUiAudit.DrawTexture(new Rect(altarCenter.x-577*scale,altarCenter.y-376.89f*scale,1154*scale,671*scale),ring,ScaleMode.StretchToFill,true);
   string host=EquippedId(SelectedSlot);if(!equipped&&host!=null){var icon=OrbIcon(host,false);if(icon!=null){Glow(altarCenter.x,altarCenter.y,88,88,C(236,121,88,.25f));Disc(altarCenter,70,C(149,152,152));Disc(altarCenter,66,C(15,18,18));var ir=new Rect(altarCenter.x-62,altarCenter.y-62,124,124);NativeUiAudit.DrawTexture(ir,icon,ScaleMode.ScaleToFit,true);Glass(ir);}}
   string name=host!=null&&skillById.TryGetValue(host,out var hd)?hd.name:host!=null?roleNames[SelectedSlot]:"슬롯이 비어 있습니다";
   Text(new Rect(altarBounds.x+16,skillBodyTop+10,Mathf.Min(altarBounds.width*.4f,400),37),name,serif,20,C(222,219,213),FontStyle.Bold,.4f);
   var right=altarBounds.xMax-16;Text(new Rect(right-300,skillBodyTop+14,300,21),"넣을 수 있는 스킬  ["+SlotKey(SelectedSlot)+"]",serif,15,C(217,214,208),FontStyle.Bold,1.2f,TextAnchor.MiddleRight);
   Text(new Rect(right-330,skillBodyTop+38,330,19),"끌어서 위 슬롯에 장착 · 빛나는 재료는 제단으로",serif,13,C(165,168,168),FontStyle.Normal,0,TextAnchor.MiddleRight);
   string hint=host==null?SlotCondition(SelectedSlot,PreviewId(SelectedSlot),PreviewId(SelectedSlot)!=null):HasRoad()?"합성할 재료를 먼저 습득하세요":"이 스킬은 합성 계열이 없습니다";float width=Width(serif,13,FontStyle.Normal,hint,0)+30;
   var hr=new Rect(altarCenter.x-width/2,altarBounds.yMax-73,width,29);Grad(hr,C(6,9,9,.82f),C(6,9,9,.82f));Border(hr,C(89,92,92,.333f));Text(hr,hint,serif,13,C(217,214,208),FontStyle.Normal,0,TextAnchor.MiddleCenter,true);
   foreach(var o in slot.orbs)DrawOrb(o,level);
  }
  void DrawOrb(SkillDefsOrb o,int level){
   var c=altarCenter+AltarOrigin+new Vector2(o.x,o.y)-new Vector2(960,672.89f);float r=o.o/2f;bool ki=o.id=="kiSlash";
   bool dim=o.dim&&!(cur!=null&&Ported(o.id)&&SkillLevelOf(o.id)>=1);
   // ball: shadow ring layers (web box-shadow), dark ball, circular icon
   Glow(c.x,c.y+10,r+8,r+4,C(0,0,0,.5f));
   if(!dim)Glow(c.x,c.y,r+18,r+18,C(230,199,122,.28f));
   if(dim){Disc(c,r+3.5f,C(107,110,110,.32f));Disc(c,r+2.5f,C(39,42,42));}
   else{Disc(c,r+4,C(236,208,138));Disc(c,r+2.5f,C(114,117,117));}
   Disc(c,r+1,C(6,9,9));Disc(c,r,C(8,11,11));
   var tex=OrbIcon(o.id,dim);if(tex!=null){var ir=new Rect(c.x-r,c.y-r,o.o,o.o);NativeUiAudit.DrawTexture(ir,tex);Glass(ir);}
   // label: name (12px) + level/host badge, soft dark blob behind
   var nr=AltarRect(o.nameRect);Glow(nr.center.x,nr.center.y,nr.width/2+8,nr.height/2+4,C(6,9,9,.86f));
   Color nameCol=ki?C(240,220,168):dim?C(138,141,141):C(217,214,208);
   Text(nr,skillById.TryGetValue(o.id,out var d)?d.name:o.id,serif,12,nameCol,FontStyle.Normal,0,TextAnchor.MiddleCenter,true,true);
   if(SkillLevelOf(o.id)>0&&o.subRect!=null&&o.subRect.Length==4){
    var sr=AltarRect(o.subRect);Glow(sr.center.x,sr.center.y,sr.width/2+8,sr.height/2+4,C(6,9,9,.86f));
    Text(new Rect(sr.x,sr.y,sr.width,sr.height),"Lv "+SkillLevelOf(o.id),serif,11,C(167,170,170),FontStyle.Bold,.22f,TextAnchor.MiddleCenter,true,true);
   }
   if(o.host&&o.hostRect!=null&&o.hostRect.Length==4){
    var hr=AltarRect(o.hostRect);Grad(hr,C(40,43,43),C(19,22,22));Border(hr,C(139,142,142));
    Text(hr,"모체",serif,11,C(243,226,180),FontStyle.Normal,0,TextAnchor.MiddleCenter,true);
   }
   // selecting an orb shows that skill in the info panel (web: orb click -> renderInfo)
   if(NativeSilverHellUi.Button(new Rect(c.x-r-4,c.y-r-4,o.o+8,o.o+8),GUIContent.none,GUIStyle.none)){selectedOrb=o.id;infoScroll=0;}
  }

  void DrawRoad(bool lmb){NativeUiAudit.Region(new Rect(1562,skillBodyTop+16.64f,284,67),"component","skill-road","합성 계열이 있을 때만 표시");Mixed(new Rect(1562,skillBodyTop+16.64f,284,21),"합성 로드맵",15,C(165,168,168),1.2f,TextAnchor.MiddleLeft,FontStyle.Bold);Fill(new Rect(1562,skillBodyTop+44.64f,284,1),C(146,149,149,.5f));bool equipped=SelectedSlot==SkillUiState.LmbSlot&&lmb;Text(new Rect(1562,skillBodyTop+53.64f,284,30),equipped?"이 스킬은 합성 계열이 없습니다":NotPorted,serif,14,C(129,132,132));}

  bool BottomButton(Rect r,string label){NativeSilverHellUi.ActionPlate(r,false,r.Contains(Event.current.mousePosition)&&GUI.enabled?1:0,false,28,6);Text(r,label,serif,16,C(214,211,205),FontStyle.Normal,0,TextAnchor.MiddleCenter);return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);}
  void DrawBottom(Action close){
   float w1=Width(serif,16,FontStyle.Normal,"닫기 [ESC]",0)+60,w2=Width(serif,16,FontStyle.Normal,"일괄 레벨업",0)+60,w3=Width(serif,16,FontStyle.Normal,"추천 자동",0)+60,x=(1920-w1-w2-w3-24)/2;
   if(BottomButton(new Rect(x,998,w1,40),"닫기 [ESC]"))close();x+=w1+12;
   if(BottomButton(new Rect(x,998,w2,40),"일괄 레벨업")){bool changed=false;foreach(var d in defs.skills)while(NativeSkillManagementPolicy.Upgrade(cur,d.id))changed=true;if(changed)ChangedSkill();}x+=w2+12;
   bool enabled=GUI.enabled;GUI.enabled=false;var auto=new Rect(x,998,w3,40);BottomButton(auto,"추천 자동");GUI.enabled=enabled;
   if(auto.Contains(Event.current.mousePosition)){var tip=new Rect(x-120,948,390,30);InfoFace(tip);Text(tip,"추천 빌드에 필요한 기술은 준비 중입니다",serif,12,C(170,173,173),FontStyle.Normal,0,TextAnchor.MiddleCenter);}
  }

 }
}
