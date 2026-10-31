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
 [Serializable] public sealed class SkillDefsSkill {public string id,name,desc,icon;public bool host;public string[] lines;}
 [Serializable] public sealed class SkillDefsFile {public SkillDefsSlot[] slots;public SkillDefsSkill[] skills;}

 public sealed class NativeSkills {
  public bool Open {get;private set;}
  public int SelectedSlot {get;private set;}=SkillUiState.LmbSlot;
  const string NotPorted="미이식";
  static readonly Vector2 AltarOrigin=new Vector2(393,295.64f);
  static readonly Rect AltarImageRect=new Rect(383,296,1154,671),WindowRect=new Rect(8,8,1904,1064);
  readonly SkillUiData data;readonly SkillDefsFile defs;readonly Dictionary<string,SkillDefsSkill> skillById=new Dictionary<string,SkillDefsSkill>();
  Font serif,cinzel,latinFont,sans,sansSemi;
  Texture2D windowBase,altarLmb,discEmptySel,discLmb,discLmbSel,plate;
  readonly Dictionary<string,Texture2D> orbIcons=new Dictionary<string,Texture2D>(),procedural=new Dictionary<string,Texture2D>();
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  string selectedOrb;bool ready;
  Texture2D discEmpty;Simulation cur;
  // B03 ports: these skills run in the Simulation (Skills/*.cs); everything else stays "미이식"
  static bool Ported(string id){return id=="kiSlash"||id=="spikeTrap"||id=="giantSlam"||id=="holyDome"||id=="iceOrb"||id=="fireball";}
  string EquippedId(int slot){
    if(slot==SkillUiState.LmbSlot)return cur.Config.ActiveAttack=="kiSlash"?"kiSlash":null;
    return NativeHud.SlotSkillId(cur,slot);
  }
  int SkillLevelOf(string id){return id=="kiSlash"?Math.Max(1,cur.Config.KiSlashLevel):cur.Skills.Level(id);}

  public NativeSkills(){
   data=JsonUtility.FromJson<SkillUiData>(Resources.Load<TextAsset>("Data/skill_ui").text);
   if(data.slots.Length!=13||data.slots[6].definition!="lmb"||data.skill.id!="kiSlash")throw new InvalidOperationException("Source skill slot catalogue mismatch");
   defs=JsonUtility.FromJson<SkillDefsFile>(Resources.Load<TextAsset>("Data/skill_defs_web").text);
   if(defs.slots.Length!=13)throw new InvalidOperationException("Web skill definition slots mismatch");
   foreach(var s in defs.skills)skillById[s.id]=s;
  }
  static int RequestedSlot(){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"--unity-skill-slot");return i>=0&&i+1<a.Length&&int.TryParse(a[i+1],out var n)?Mathf.Clamp(n,0,15):-1;}
  public void SetOpen(bool value,int slot=6){Open=value;if(value){int req=RequestedSlot();Select(req>=0?req:slot);}}
  public void Select(int slot){SelectedSlot=Mathf.Clamp(slot,0,15);selectedOrb=null;}
  public void HandleKeys(Action close,Action equip){
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
   latinFont=Resources.Load<Font>("Art/fonts/Cinzel-400");serif=NativeSilverHellUi.Font(true)??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");cinzel=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold")??serif;
   sans=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");sansSemi=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??sans;
   windowBase=Tex("Art/ui/skill/window_base");altarLmb=Tex("Art/ui/skill/altar_lmb");discEmpty=Tex("Art/ui/skill/disc_empty");discEmptySel=Tex("Art/ui/skill/disc_empty_sel");discLmb=Tex("Art/ui/skill/disc_lmb");discLmbSel=Tex("Art/ui/skill/disc_lmb_sel");
   plate=Tex("Art/ui/inventory/plate");
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
  void Text(Rect r,string text,Font f,int size,Color c,FontStyle fs=FontStyle.Normal,float spacing=0,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false){
   if(string.IsNullOrEmpty(text))return;
   var st=Style(f,size,fs);float total=Width(f,size,fs,text,spacing),x=r.x;
   if(anchor==TextAnchor.MiddleCenter||anchor==TextAnchor.UpperCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
   for(int pass=shadow?0:1;pass<2;pass++){
    st.normal.textColor=pass==0?new Color(0,0,0,.8f):c;float px=x,oy=pass==0?1.5f:0;
    if(spacing==0){NativeSilverHellUi.Label(new Rect(px,r.y+oy,Mathf.Max(r.width,total)+8,r.height),text,st);continue;}
    foreach(char ch in text){var g=ch.ToString();NativeSilverHellUi.Label(new Rect(px,r.y+oy,60,r.height),g,st);px+=st.CalcSize(new GUIContent(g)).x+spacing;}
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
  public void Draw(Simulation sim,Action close,Action equip){
   if(!Open)return;Init();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),C(0,0,0,.53f));
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    cur=sim;bool lmb=sim.Config.ActiveAttack=="kiSlash";int level=Math.Max(1,sim.Config.KiSlashLevel);
    var bodyMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.EdgeMatrix;NativeSilverHellUi.Panel(new Rect(8,8,NativeUiViewport.Edges.Width-16,1064),28,0);GUI.matrix=bodyMatrix;NativePanelTitle.Draw(new Rect(700,72,520,64),"전투 스킬");
    NativePanelTabBar.Draw(NativePanelTabBar.Preset.Skill,"skillPanel");
    DrawSlots(lmb);
    GUI.matrix=NativeUiViewport.EdgeMatrix;DrawInfo(sim,lmb,level,equip);
    float ew=NativeUiViewport.Edges.Width;bool wide=ew/1080f>=2.3f;float bodyX=wide?(ew-1800)/2:318,bodyW=wide?1800:ew-bodyX-(HasRoad()?318:24);float altarScale=Mathf.Min(bodyW/1154f,670/671f);GUI.matrix=NativeUiViewport.EdgeMatrix*Matrix4x4.TRS(new Vector3(bodyX+bodyW/2-960*altarScale,300-296*altarScale,0),Quaternion.identity,new Vector3(altarScale,altarScale,1));
    if(SelectedSlot<13)DrawAltar(lmb,level);else{var intrinsic=SelectedSlot==13?Tex("Art/ui/skill/roll_boots"):OrbIcon(SelectedSlot==14?"execution":"fanShot",false);if(intrinsic!=null)NativeUiAudit.DrawTexture(new Rect(912,565,96,96),intrinsic,ScaleMode.ScaleToFit,true);Text(new Rect(710,680,500,34),roleNames[SelectedSlot]+" · "+SlotKey(SelectedSlot),serif,22,C(217,214,208),FontStyle.Normal,0,TextAnchor.MiddleCenter);Text(new Rect(710,720,500,26),SelectedSlot==15?"전용 기술":"고정 기술 · 교체 불가",serif,14,C(150,153,153),FontStyle.Normal,0,TextAnchor.MiddleCenter);}
    GUI.matrix=NativeUiViewport.RightMatrix;if(HasRoad())DrawRoad(lmb);GUI.matrix=bodyMatrix;
    DrawBottom(close);
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }

  static readonly string[] roleNames={"스킬 1","스킬 2","스킬 3","스킬 4","F 스킬","필살기","무기 공격","마법","사슬 이동","칼등 처내기","마법 패링","탈출기","분노 폭발","구르기","처형","자동 석궁"};
  string SlotKey(int i){string[] actions={null,null,null,null,null,null,"weapon","beam","charge","shield","parry",null,"bow","roll",null,null};string code=actions[i]==null?null:NativeKeyBindInput.Bindings.Primary(actions[i]);if(actions[i]!=null&&code==null)return KeyBindings.KeyName(null,false);return i==13?"방향 + "+KeyBindings.KeyName(code,false):code==null?new[]{"1","2","3","4","F","Z","LMB","RMB","Shift","E","Q","Ctrl","Space","Space","X","T"}[i]:code=="mouse0"?"LMB":code=="mouse1"?"MMB":code=="mouse2"?"RMB":KeyBindings.KeyName(code,false);}
  string SelectedId(){if(SelectedSlot==13)return "roll";if(SelectedSlot==14)return "execution";if(SelectedSlot==15)return "fanShot";return selectedOrb??EquippedId(SelectedSlot);}
  bool HasRoad(){var id=SelectedId();return SelectedSlot<13&&id!=null&&skillById.TryGetValue(id,out var d)&&d.host;}
  void DrawSlots(bool lmb){
   const float cell=100,gap=8,total=16*cell+15*gap;float left=(1920-total)/2;
   for(int i=0;i<16;i++){bool sel=i==SelectedSlot;float x=left+i*(cell+gap);var button=new Rect(x,164,cell,136);var disc=new Rect(x+18,170,64,64);string id=i<13?EquippedId(i):i==14?"execution":null;bool preview=id==null&&(i==5||i==12);if(preview)id=i==5?"blackStar":"giantSlam";Texture2D tex=id==null?null:OrbIcon(id,preview);if(i==6&&lmb)tex=OrbIcon("kiSlash",false);if(i==13)tex=Tex("Art/ui/skill/roll_boots");if(i==15)tex=OrbIcon("fanShot",false);if(id==null&&i>=1&&i<=3)tex=Tex("Art/ui/skill/empty_socket_"+(i+1));if(tex!=null)NativeUiAudit.DrawTexture(disc,tex,ScaleMode.ScaleToFit,true);else {NativeSilverHellUi.ActionPlate(disc,false,sel?1:0,false,14,0);Text(disc,i==13?"↔":i==15?"T":"—",serif,22,C(140,143,143),FontStyle.Normal,0,TextAnchor.MiddleCenter);}
    if(sel)Border(new Rect(disc.x-3,disc.y-3,disc.width+6,disc.height+6),C(207,205,197));
    Mixed(new Rect(x,146,cell,20),SlotKey(i),11,C(191,188,182),.4f,TextAnchor.MiddleCenter);
    string shown=id!=null&&skillById.TryGetValue(id,out var sd)?sd.name:roleNames[i];var style=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),shown),fontSize=12,alignment=TextAnchor.UpperCenter,wordWrap=true,padding=new RectOffset(),margin=new RectOffset()};style.normal.textColor=C(210,207,201);if(style.CalcHeight(new GUIContent(shown),cell)>32)style.fontSize=10;NativeSilverHellUi.Label(new Rect(x,240,cell,32),shown,style);
    string state=preview?(Ported(id)&&SkillLevelOf(id)>0?"장착 필요":"습득 필요"):i==13||i==14?"고정 · 교체 불가":i==8||i==11?"전용 · 탈출":i>=6&&i!=12||i==15?"전용":id==null?"미장착":"장착";Text(new Rect(x,274,cell,20),state,serif,10,C(142,145,145),FontStyle.Normal,0,TextAnchor.MiddleCenter);if(NativeSilverHellUi.Button(button,GUIContent.none,GUIStyle.none))Select(i);
   }
  }
  void DrawInfo(Simulation sim,bool lmb,int level,Action equip){
   string id=SelectedId();SkillDefsSkill d=null;if(id!=null)skillById.TryGetValue(id,out d);bool fixedSkill=SelectedSlot==13||SelectedSlot==14;string name=d!=null?d.name:roleNames[SelectedSlot];
   string desc=SelectedSlot==13?"방향키와 구르기 키로 이동하고 기절에서 탈출합니다. 고정 기술로 교체하거나 제단 재료로 넣을 수 없습니다.":SelectedSlot==14?"그로기 보스에게 사용하는 고정 처형 기술입니다. 기존 습득·강화 경로를 따르며 교체할 수 없습니다.":SelectedSlot==15?"석궁 자동사격 전용 칸입니다.":d!=null?d.desc:"이 슬롯에 장착된 기술이 없습니다. 실제 습득한 후보를 선택해 장착합니다.";
   var font=NativeSilverHellUi.Font(true)??serif;var style=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.TextFont(font,desc),fontSize=15,fontStyle=FontStyle.Normal,wordWrap=true,alignment=TextAnchor.UpperLeft,padding=new RectOffset(),margin=new RectOffset()};style.normal.textColor=C(205,202,196);float descH=style.CalcHeight(new GUIContent(desc),238);float y=326+descH;bool ki=id=="kiSlash",learned=id!=null&&Ported(id)&&SkillLevelOf(id)>0;bool canEquip=ki&&!lmb&&SelectedSlot==SkillUiState.LmbSlot;float height=146+descH+(learned?70:0)+(canEquip?54:0);var box=new Rect(24,300,270,height);NativeSilverHellUi.Panel(box,20,0);NativeUiAudit.Region(box,"component","skill-info","전투 스킬 내용 높이 설명판");
   Text(new Rect(40,306,238,32),name,NativeSilverHellUi.Font()??serif,23,C(226,223,217));NativeSilverHellUi.Label(new Rect(40,344,238,descH),desc,style);y=344+descH+14;
   if(learned){Text(new Rect(40,y,238,22),"Lv "+SkillLevelOf(id)+" / "+SkillRules.MaxSkillLevel+" · 강화 SP "+SkillRules.UpgradeSpCost,serif,13,C(165,168,168));y+=30;bool can=sim.CanUpgradeSkill(id)&&!ki;if(WebButton(new Rect(40,y,108,40),"강화 +",C(35,34,37),C(15,16,17),C(89,92,92),C(218,215,209),can))sim.UpgradeSkill(id);y+=54;}else{Text(new Rect(40,y,238,24),fixedSkill?"고정 기술":id==null?"미장착":Ported(id)?"미습득":"미이식",serif,13,C(165,168,168));y+=32;}
   if(canEquip){if(WebButton(new Rect(40,y,238,40),"이 슬롯에 장착 [LMB]",C(35,34,37),C(15,16,17),C(89,92,92),C(218,215,209),true))equip();y+=54;}
   Text(new Rect(40,y,238,22),"SP "+sim.Player.StatPoints+" · LV "+sim.Player.Level,serif,13,C(165,168,168));
  }
  bool WebButton(Rect r,string label,Color top,Color bottom,Color border,Color text,bool active=false){if(top.a>0)Grad(r,top,bottom);if(active&&GUI.enabled&&r.Contains(Event.current.mousePosition))Fill(r,new Color(1,1,1,.06f));Border(r,border);Fill(new Rect(r.x+1,r.y+1,r.width-2,1),new Color(1,1,1,.07f));Text(r,label,serif,16,text,FontStyle.Bold,0,TextAnchor.MiddleCenter);return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none)&&active;}
  void DrawInfoResources(Simulation sim,float y){Fill(new Rect(74,y,284,1),C(146,149,149,.5f));string malice=sim.Materials.ToString("N0",System.Globalization.CultureInfo.InvariantCulture);Mixed(new Rect(74,y+8,284,23),"SP "+sim.Player.StatPoints+"  ·  악의 "+malice+"  ·  LV "+sim.Player.Level,13,C(165,168,168),.78f,TextAnchor.MiddleLeft);}

  void DrawAltar(bool lmb,int level){
   var slot=defs.slots[SelectedSlot];bool equipped=SelectedSlot==SkillUiState.LmbSlot&&lmb;
   if(equipped)NativeUiAudit.DrawTexture(AltarImageRect,altarLmb,ScaleMode.StretchToFill,false);
   // core name box (top left of the altar): 22px, 2px fire border-left, gradient to transparent
   string coreName=equipped?data.skill.name:NotPorted;
   var cn=R(slot.coreNameRect);float cw=Width(serif,22,FontStyle.Bold,coreName,1.32f)+28;var box=new Rect(cn.x,cn.y,cw,cn.height);
   Grad(box,C(6,9,9,.88f),C(6,9,9,0),90);Fill(new Rect(box.x,box.y,2,box.height),C(236,121,88));
   Text(new Rect(box.x+12,box.y+3,cw,box.height-7),coreName,serif,22,C(217,214,208),FontStyle.Bold,1.32f,TextAnchor.MiddleLeft,true);
   // field head (top right): title + sub, 2px fire border-right
   var fh=R(slot.fieldRect);Grad(fh,C(6,9,9,.88f),C(6,9,9,0),270);Fill(new Rect(fh.xMax-2,fh.y,2,fh.height),C(236,121,88));
   var ft=R(slot.fieldTitleRect);var fs=R(slot.fieldSubRect);
   Mixed(new Rect(ft.x-24,ft.y,ft.width+24,ft.height),slot.fieldTitle,18,C(217,214,208),1.08f,TextAnchor.MiddleRight,FontStyle.Bold,true);
   Text(new Rect(fs.x-24,fs.y,fs.width+24,fs.height),slot.fieldSub,serif,11,C(170,173,173),FontStyle.Normal,0,TextAnchor.MiddleRight,true);
   // hint under the disc
   string hint=equipped?"이 스킬은 합성 계열이 없습니다":NotPorted;float hw=Mathf.Max(Width(serif,13,FontStyle.Normal,hint,0)+30,60);
   var hr=R(slot.hintRect);var hb=new Rect(960-hw/2,hr.y,hw,hr.height);
   Grad(new Rect(hb.x,hb.y,hb.width*.12f,hb.height),C(6,9,9,0),C(6,9,9,.82f),90);Fill(new Rect(hb.x+hb.width*.12f,hb.y,hb.width*.76f,hb.height),C(6,9,9,.82f));Grad(new Rect(hb.x+hb.width*.88f,hb.y,hb.width*.12f,hb.height),C(6,9,9,.82f),C(6,9,9,0),90);
   Border(hb,C(89,92,92,.333f));
   Text(hb,hint,serif,13,C(217,214,208),FontStyle.Normal,0,TextAnchor.MiddleCenter,true);
   foreach(var o in slot.orbs)DrawOrb(o,level);
  }

  void DrawOrb(SkillDefsOrb o,int level){
   var c=AltarOrigin+new Vector2(o.x,o.y);float r=o.o/2f;bool ki=o.id=="kiSlash";
   bool dim=o.dim&&!(cur!=null&&Ported(o.id)&&SkillLevelOf(o.id)>=1);
   // ball: shadow ring layers (web box-shadow), dark ball, circular icon
   Glow(c.x,c.y+10,r+8,r+4,C(0,0,0,.5f));
   if(!dim)Glow(c.x,c.y,r+18,r+18,C(230,199,122,.28f));
   if(dim){Disc(c,r+3.5f,C(107,110,110,.32f));Disc(c,r+2.5f,C(39,42,42));}
   else{Disc(c,r+4,C(236,208,138));Disc(c,r+2.5f,C(114,117,117));}
   Disc(c,r+1,C(6,9,9));Disc(c,r,C(8,11,11));
   var tex=OrbIcon(o.id,dim);if(tex!=null)NativeUiAudit.DrawTexture(new Rect(c.x-r,c.y-r,o.o,o.o),tex);
   // label: name (12px) + level/host badge, soft dark blob behind
   var nr=R(o.nameRect);Glow(nr.center.x,nr.center.y,nr.width/2+8,nr.height/2+4,C(6,9,9,.86f));
   Color nameCol=ki?C(240,220,168):dim?C(138,141,141):C(217,214,208);
   Text(nr,skillById.TryGetValue(o.id,out var d)?d.name:o.id,serif,12,nameCol,FontStyle.Normal,0,TextAnchor.MiddleCenter,true);
   if(ki){
    var sr=R(o.subRect);Glow(sr.center.x,sr.center.y,sr.width/2+8,sr.height/2+4,C(6,9,9,.86f));
    Text(sr,"Lv "+level,serif,11,C(167,170,170),FontStyle.Normal,.22f,TextAnchor.MiddleCenter,true);
   }
   if(o.host&&o.hostRect!=null&&o.hostRect.Length==4){
    var hr=R(o.hostRect);Grad(hr,C(40,43,43),C(19,22,22));Border(hr,C(139,142,142));
    Text(hr,"모체",serif,11,C(243,226,180),FontStyle.Normal,0,TextAnchor.MiddleCenter,true);
   }
   // selecting an orb shows that skill in the info panel (web: orb click -> renderInfo)
   if(NativeSilverHellUi.Button(new Rect(c.x-r-4,c.y-r-4,o.o+8,o.o+8),GUIContent.none,GUIStyle.none))selectedOrb=o.id;
  }

  void DrawRoad(bool lmb){Mixed(new Rect(1562,316.64f,284,21),"합성 로드맵",15,C(165,168,168),1.2f,TextAnchor.MiddleLeft,FontStyle.Bold);Fill(new Rect(1562,344.64f,284,1),C(146,149,149,.5f));bool equipped=SelectedSlot==SkillUiState.LmbSlot&&lmb;Text(new Rect(1562,353.64f,284,30),equipped?"이 스킬은 합성 계열이 없습니다":NotPorted,serif,14,C(129,132,132));}

  void DrawBottom(Action close){
   // The three .pclose buttons sit under the window frame's bottom bar (frame is painted after them).
   Color txt=C(194,191,185);
   if(Plate(new Rect(768.19f,998,122.03f,40),"닫기 [ESC]",txt))close();
   bool wasEnabled=GUI.enabled;GUI.enabled=false;Plate(new Rect(902.22f,998,126.39f,40),"일괄 레벨업",txt);
   Plate(new Rect(1040.61f,998,111.19f,40),"추천 자동",txt);GUI.enabled=wasEnabled;
   // frame strip drawn above the buttons: window-image rows 1038..1050 (screen y 1046..1058)
   // 바깥 프레임은 높이 기준 9-slice가 그린다.
  }
 }
}
