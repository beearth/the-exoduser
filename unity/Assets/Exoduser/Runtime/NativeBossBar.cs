using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web boss HP / poise bar (#bossBar, game.html markup 2701, CSS 387-404 + 954-958, update code 35829-35880) in the 1920x1080 design space (web ui-scale 1,
 // top 28px, 500px wide, centred). Definitions (stage -> boss name table, layout, colours, timings, glyph atlases) come from Data/bossbar_web.json. Every
 // displayed value is passed in by the caller from Unity state: boss name, HP fraction, poise fraction, groggy / immune state, status chips.
 // Intro = web `.intro` (2.0s): name fades in with letter-spacing 1em -> .25em and blur 8px -> 0 (0.8s ease-out), the HP bar scales in from the centre
 // (1.2s ease-out, 0.4s delay); at 2.0s the web removes the class and the spacing snaps to .08em (kept). While the boss cine runs (3s) the HP bar shows the
 // intro fill (1.5s ramp, `_bossCine._introFill`) instead of the real value.
 // Not ported: poise label text (the web clips it: `.bpow{overflow:hidden}` hides `.bpol{right:-52px}`), the unused shield bar (width 0 in the web), English boss
 // names (`_T`), druid finale / revive suffix glyph emoji, rounded 2px corners of the poise frame.
 public sealed class NativeBossBar {
  public enum PoiseState {Normal,Groggy,Immune}
  public struct Chip {public string kind;public int stacks;public float seconds;}   // kind: bleed | poison | burn | shock
  public struct Input {
   public string name;public float hp01,poise01;
   public PoiseState state;public float stateRatio01,stateSeconds;   // groggy: stunned/maxStunned; immune: 1 - pImmune/300 (charging); seconds = remaining time
   public List<Chip> chips;
  }
  [Serializable] sealed class StageDef {public int si,hell,floor;public string boss;}
  [Serializable] sealed class Tok {public string c,id,color;public int x,y;public float adv;}
  [Serializable] sealed class AtlasPx {public int w,h,cellW,cellH,scale;}
  [Serializable] sealed class AtlasInfo {public AtlasPx sharpPx,blurPx,glyphPx;public int cellOrigin,glyphOrigin;}
  [Serializable] sealed class LayoutDef {public float barX,barW,top,nameH,nameMargin,hpH,hpRadius,poiseGap,poiseW,poiseH,statusGap,chipH,chipGap,chipPadX,chipFont,glyph;}
  [Serializable] sealed class TimingDef {public float onFade,nameIn,hpIn,hpInDelay,introSeconds,spacingFromEm,spacingToEm,spacingEm,blurFrom,nameEm,introFillSeconds,cineSeconds,poiseSeconds;}
  [Serializable] sealed class LabelDef {public string groggy,immune,bleed,poison,burn,shock;}
  [Serializable] sealed class Defs {public StageDef[] stages;public AtlasInfo atlas;public Tok[] sharp,blur,glyphs;public LayoutDef layout;public TimingDef timing;public LabelDef labels;}

  readonly Defs defs;readonly Dictionary<string,Tok> sharp=new Dictionary<string,Tok>(),blur=new Dictionary<string,Tok>(),glyph=new Dictionary<string,Tok>();
  Texture2D sharpTex,blurTex,glyphTex,glow;Font sans;bool ready;readonly Dictionary<string,Texture2D> gradients=new Dictionary<string,Texture2D>();
  readonly Dictionary<long,GUIStyle> styles=new Dictionary<long,GUIStyle>();
  Input input;bool active,hiding;float start,hideStart,hideFrom;public float? ForcedAge;
  // The hide fade finishes in the state check, not only while drawing: OnGUI does not run without graphics (-batchmode / -nographics), and the M1 route check reads this value.
  public bool Active{get{ResolveHide();return active;}}
  void ResolveHide(){if(active&&hiding&&Alpha()<=.001f){active=false;hiding=false;}}
  // set by the caller while a full-screen panel (inventory, forge, skills, stats, settings) is open: web ui-foundation.css 124 / game.html 2469 hide #bossBar then
  public bool Suppressed;
  // measurements for the capture check (design px)
  public float LastNameWidth,LastNameLetterSpacing;public readonly List<float> LastChipWidths=new List<float>();

  public NativeBossBar(){
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/bossbar_web").text);
   foreach(var t in defs.sharp)sharp[t.c]=t;foreach(var t in defs.blur)blur[t.c]=t;foreach(var t in defs.glyphs)glyph[t.id]=t;
  }
  float Now{get{return Time.unscaledTime;}}
  float Age{get{return ForcedAge.HasValue?ForcedAge.Value:Now-start;}}

  // Boss name of a stage index (web STG[si].bn = HELL_BOSSES[hell][min(floor,last)], definitions only); null when the index is outside the 35 stages.
  public string BossNameForStage(int si){foreach(var s in defs.stages)if(s.si==si)return s.boss;return null;}
  public void Show(string bossName,float hp01,float poise01){Show(new Input{name=bossName,hp01=hp01,poise01=poise01,state=PoiseState.Normal});}
  // First call starts the web intro; further calls while the bar is visible only update the values.
  public void Show(Input value){
   input=value;
   if(!active||hiding){float a=active&&hiding?Alpha():0;active=true;hiding=false;start=Now-InverseOn(a);}
  }
  public void Hide(){if(active&&!hiding){hiding=true;hideStart=Now;hideFrom=Alpha();}}
  float OnAlpha(float age){return Ease(Mathf.Clamp01(age/defs.timing.onFade),.25f,.1f,.25f,1f);}   // transition: opacity .6s (CSS ease)
  float InverseOn(float a){if(a<=0)return 0;float lo=0,hi=1;for(int i=0;i<20;i++){float m=(lo+hi)/2;if(Ease(m,.25f,.1f,.25f,1f)<a)lo=m;else hi=m;}return (lo+hi)/2*defs.timing.onFade;}
  float Alpha(){
   if(hiding){float k=Mathf.Clamp01((Now-hideStart)/defs.timing.onFade);return hideFrom*(1-Ease(k,.25f,.1f,.25f,1f));}
   return OnAlpha(Age);
  }
  // CSS cubic-bezier(x1,y1,x2,y2) timing function
  static float Ease(float x,float x1,float y1,float x2,float y2){
   if(x<=0)return 0;if(x>=1)return 1;float lo=0,hi=1,t=x;
   for(int i=0;i<24;i++){t=(lo+hi)/2;float bx=3*(1-t)*(1-t)*t*x1+3*(1-t)*t*t*x2+t*t*t;if(bx<x)lo=t;else hi=t;}
   return 3*(1-t)*(1-t)*t*y1+3*(1-t)*t*t*y2+t*t*t;
  }
  static float EaseOut(float x){return Ease(x,0f,0f,.58f,1f);}

  // ---- resources / primitives ----
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  static Color Hex(string h,float a=1f){ColorUtility.TryParseHtmlString(h,out var c);c.a=a;return c;}
  void Init(){
   if(ready)return;ready=true;
   sharpTex=Resources.Load<Texture2D>("Art/ui/boss/boss_name_sharp");blurTex=Resources.Load<Texture2D>("Art/ui/boss/boss_name_blur");glyphTex=Resources.Load<Texture2D>("Art/ui/boss/boss_status_glyphs");
   sans=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??Resources.Load<Font>("Art/fonts/NotoSansKR");
   // box-shadow 0 0 18px rgba(118,38,23,.38) of the 500x14 pill: gaussian (sigma 9) edge falloff of the pill's signed distance, built once
   const int pad=36;int w=(int)defs.layout.barW+pad*2,h=(int)defs.layout.hpH+pad*2;glow=new Texture2D(w,h,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   var px=new Color[w*h];float R=defs.layout.hpH/2f,cy=h/2f;
   for(int y=0;y<h;y++)for(int x=0;x<w;x++){
    float px0=x+.5f,py0=y+.5f;float qx=Mathf.Max(Mathf.Abs(px0-w/2f)-(defs.layout.barW/2f-R),0),qy=py0-cy;float d=Mathf.Sqrt(qx*qx+qy*qy)-R;   // pill SDF
    px[y*w+x]=new Color(118/255f,38/255f,23/255f,.38f*.5f*Erfc(d/(9f*1.41421356f)));
   }
   glow.SetPixels(px);glow.Apply(false,true);
  }
  static float Erfc(float x){float z=Mathf.Abs(x),t=1/(1+.5f*z);float r=t*Mathf.Exp(-z*z-1.26551223f+t*(1.00002368f+t*(.37409196f+t*(.09678418f+t*(-.18628806f+t*(.27886807f+t*(-1.13520398f+t*(1.48851587f+t*(-.82215223f+t*.17087277f)))))))));return x>=0?r:2-r;}
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  Texture2D Gradient(string key,Color[] cols,float[] stops,bool horizontal){
   if(gradients.TryGetValue(key,out var t))return t;
   int n=64;t=new Texture2D(horizontal?n:1,horizontal?1:n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<n;i++){
    float u=i/(float)(n-1);int k=0;while(k<stops.Length-2&&u>stops[k+1])k++;float f=Mathf.Clamp01((u-stops[k])/Mathf.Max(1e-5f,stops[k+1]-stops[k]));
    t.SetPixel(horizontal?i:0,horizontal?0:n-1-i,Color.Lerp(cols[k],cols[k+1],f));
   }
   t.Apply(false,true);gradients[key]=t;return t;
  }
  Texture2D HGrad(string key,params string[] colors){var cs=new Color[colors.Length];var st=new float[colors.Length];for(int i=0;i<colors.Length;i++){var p=colors[i].Split('@');cs[i]=Hex(p[0]);st[i]=p.Length>1?float.Parse(p[1],CultureInfo.InvariantCulture):i/(float)(colors.Length-1);}return Gradient(key,cs,st,true);}
  GUIStyle Style(int size){
   long key=size;if(!styles.TryGetValue(key,out var s)){s=new GUIStyle(GUI.skin.label){font=sans,fontSize=size,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[key]=s;}
   return s;
  }
  // pill (radius R = h/2, capped) vertical half-extent at column centre cx
  static float PillHalf(Rect p,float R,float cx){
   float ext=R;if(cx<p.x+R){float dx=p.x+R-cx;ext=Mathf.Sqrt(Mathf.Max(0,R*R-dx*dx));}else if(cx>p.xMax-R){float dx=cx-(p.xMax-R);ext=Mathf.Sqrt(Mathf.Max(0,R*R-dx*dx));}
   return ext;
  }
  // Draws `tex` over `fill` (a rect inside pill `p`) clipped to the pill's rounded ends: caps as 1px columns, the straight run in one piece.
  // horizontal: gradient runs along the fill width (u per column); otherwise the texture is a vertical gradient mapped over the pill height.
  void FillInPill(Rect fill,Rect p,Texture2D tex,bool horizontal,float alpha){
   float R=Mathf.Min(p.height/2f,defs.layout.hpRadius);var old=GUI.color;GUI.color=new Color(1,1,1,alpha);
   float x0=fill.x,x1=fill.xMax;float capL=p.x+R,capR=p.xMax-R;
   void Seg(float a,float b,bool cap){
    if(b<=a)return;
    if(!cap){GUI.DrawTextureWithTexCoords(new Rect(a,fill.y,b-a,fill.height),tex,horizontal?new Rect((a-fill.x)/fill.width,0,(b-a)/fill.width,1):new Rect(0,0,1,1));return;}
    for(float cx=a;cx<b;cx+=1){
     float w=Mathf.Min(1,b-cx);float half=PillHalf(p,R,cx+w/2f);float cyc=p.y+p.height/2f;float ya=Mathf.Max(fill.y,cyc-half),yb=Mathf.Min(fill.yMax,cyc+half);if(yb<=ya)continue;
     Rect uv=horizontal?new Rect((cx+w/2f-fill.x)/fill.width,0,w/fill.width,1):new Rect(0,1f-(yb-fill.y)/fill.height,1,(yb-ya)/fill.height);
     GUI.DrawTextureWithTexCoords(new Rect(cx,ya,w,yb-ya),tex,uv);
    }
   }
   Seg(x0,Mathf.Min(x1,capL),true);Seg(Mathf.Max(x0,capL),Mathf.Min(x1,capR),false);Seg(Mathf.Max(x0,capR),x1,true);
   GUI.color=old;
  }
  // 1px ring between pill `outer` and the pill inset by 1px
  void Ring(Rect outer,Color c,float inset=1f){
   var inner=new Rect(outer.x+inset,outer.y+inset,outer.width-2*inset,outer.height-2*inset);float Ro=outer.height/2f,Ri=inner.height/2f;float cyc=outer.y+outer.height/2f;var old=GUI.color;GUI.color=c;
   for(float cx=outer.x;cx<outer.xMax;cx+=1){
    float w=Mathf.Min(1,outer.xMax-cx);float mid=cx+w/2f;float eo=PillHalf(outer,Ro,mid);float ei=mid>=inner.x&&mid<=inner.xMax?PillHalf(inner,Ri,mid):0;
    if(ei<=0){GUI.DrawTexture(new Rect(cx,cyc-eo,w,eo*2),Texture2D.whiteTexture);continue;}
    GUI.DrawTexture(new Rect(cx,cyc-eo,w,eo-ei),Texture2D.whiteTexture);GUI.DrawTexture(new Rect(cx,cyc+ei,w,eo-ei),Texture2D.whiteTexture);
   }
   GUI.color=old;
  }
  Rect AtlasUv(Tok t,AtlasPx a){return new Rect((float)t.x/a.w,1f-(float)(t.y+a.cellH)/a.h,(float)a.cellW/a.w,(float)a.cellH/a.h);}

  // ---- window ----
  public void Draw(){
   if(!active||Suppressed)return;Init();
   float a=Alpha();if(hiding&&a<=.001f){active=false;hiding=false;return;}if(a<=.001f)return;
   var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    Layout(a);
   } finally {GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }

  void Layout(float a){
   var L=defs.layout;var T=defs.timing;float age=Age;bool intro=age<T.introSeconds&&!hiding;
   float cx=L.barX+L.barW/2f;
   // ---- name (#bossName: Black Han Sans faux-bold 25.6px, #ffd3a2; atlas glyphs include the web text-shadow) ----
   float nameA=1,spacing=T.spacingEm*T.nameEm,blurW=0;
   if(intro){float e=EaseOut(Mathf.Clamp01(age/T.nameIn));nameA=e;spacing=Mathf.Lerp(T.spacingFromEm,T.spacingToEm,e)*T.nameEm;blurW=1-e;}
   DrawName(input.name??"",cx,L.top,spacing,a*nameA,blurW);
   // ---- HP bar (.bhw: 500x14 pill, 1px border rgba(125,44,32,.92), bg gradient, glow; fill 498x12 gradient over its own width) ----
   float hpA=1,sx=1;
   if(intro){float e=EaseOut(Mathf.Clamp01((age-T.hpInDelay)/T.hpIn));hpA=e;sx=e;}
   float hpY=L.top+L.nameH+L.nameMargin;
   if(sx>.002f){
    var m=GUI.matrix;GUI.matrix=m*Matrix4x4.TRS(new Vector3(cx,0,0),Quaternion.identity,new Vector3(sx,1,1))*Matrix4x4.TRS(new Vector3(-cx,0,0),Quaternion.identity,Vector3.one);
    float ha=a*hpA;var outer=new Rect(L.barX,hpY,L.barW,L.hpH);var inner=new Rect(outer.x+1,outer.y+1,outer.width-2,outer.height-2);
    GUI.color=new Color(1,1,1,ha);GUI.DrawTexture(new Rect(outer.x-36,outer.y-36,outer.width+72,outer.height+72),glow);GUI.color=Color.white;
    var bg=Gradient("hpbg",new[]{C(20,7,7,.9f),C(9,5,6,.96f)},new[]{0f,1f},false);
    FillInPill(outer,outer,bg,false,ha);
    float frac=Mathf.Clamp01(age<T.cineSeconds&&!hiding?Mathf.Min(1,age/T.introFillSeconds):input.hp01);   // web: _bossCine.active -> _introFill ramp (90 ticks), then the real HP
    if(frac>0){var fill=new Rect(inner.x,inner.y,Mathf.Round(inner.width*frac*10)/10f,inner.height);FillInPill(fill,inner,HGrad("hpfill","#2d0405@0","#7f1212@.38","#cf361f@.72","#ffb16a@1"),true,ha);}
    Ring(outer,C(125,44,32,.92f*ha));Ring(inner,C(255,169,119,.08f*ha),1f);
    GUI.matrix=m;
   }
   // ---- poise gauge (.bpow 360x6, 1px border colour per state; fill 358x4, gradient over its own width) ----
   float py=hpY+L.hpH+L.poiseGap;var pw=new Rect(cx-L.poiseW/2f,py,L.poiseW,L.poiseH);
   string g0,g1;Color border;float pfrac;
   if(input.state==PoiseState.Groggy){pfrac=Mathf.Clamp01(input.stateRatio01);g0="#ff6600";g1="#ffaa00";border=Hex("#ff6600");}
   else if(input.state==PoiseState.Immune){pfrac=Mathf.Clamp01(input.stateRatio01);g0="#4455cc";g1="#8899ff";border=Hex("#4455cc");}
   else{
    float pct=Mathf.Clamp(input.poise01*100f,0,100);pfrac=pct/100f;
    if(pct<30){g0="#ff4400";g1="#ff8800";}else if(pct<60){g0="#ddaa00";g1="#ffcc44";}else{g0="#aaaaaa";g1="#ffffff";}
    border=pct<30?Hex("#ff4400"):Hex("#666666");
   }
   border.a*=a;
   var pbg=Gradient("poisebg",new[]{C(18,12,11,.82f),C(8,6,6,.92f)},new[]{0f,1f},false);
   GUI.color=new Color(1,1,1,a);GUI.DrawTexture(pw,pbg);GUI.color=Color.white;
   Fill(new Rect(pw.x,pw.y,pw.width,1),border);Fill(new Rect(pw.x,pw.yMax-1,pw.width,1),border);Fill(new Rect(pw.x,pw.y+1,1,pw.height-2),border);Fill(new Rect(pw.xMax-1,pw.y+1,1,pw.height-2),border);
   float pwid=Mathf.Round((pw.width-2)*pfrac*100)/100f;
   if(pwid>0){var old=GUI.color;GUI.color=new Color(1,1,1,a);GUI.DrawTextureWithTexCoords(new Rect(pw.x+1,pw.y+1,pwid,pw.height-2),HGrad("poise"+g0+g1,g0,g1),new Rect(0,0,1,1));GUI.color=old;}
   // ---- status chips (#bossStatus .bst-i: 24px, gap 6, padding 1px 6px, 1px border colour@.333, bg rgba(0,0,0,.6), radius 3, 13.6px text + 13px glyph) ----
   LastChipWidths.Clear();var chips=BuildChips();
   if(chips.Count>0){
    float total=0;var widths=new List<float>();
    foreach(var ch in chips){float w=2+L.chipPadX*2+L.glyph+ChipTextGap+TextWidth(ch.text,L.chipFont);widths.Add(w);total+=w;}
    total+=L.chipGap*(chips.Count-1);float x=cx-total/2f,y=py+L.poiseH+L.statusGap;
    for(int i=0;i<chips.Count;i++){DrawChip(new Rect(x,y,widths[i],L.chipH),chips[i],a);LastChipWidths.Add(widths[i]);x+=widths[i]+L.chipGap;}
   }
  }

  void DrawName(string name,float cx,float y,float spacing,float alpha,float blurW){
   var a=defs.atlas;float total=0;var list=new List<Tok>();var advs=new List<float>();
   foreach(var ch in name){
    string k=ch.ToString();Tok t;if(!sharp.TryGetValue(k,out t))t=null;list.Add(t);float adv=t!=null?t.adv:defs.timing.nameEm*.5f;advs.Add(adv);total+=adv+spacing;
   }
   LastNameWidth=total;LastNameLetterSpacing=spacing;float x=cx-total/2f;var old=GUI.color;
   for(int i=0;i<list.Count;i++){
    var t=list[i];
    if(t!=null){
     var r=new Rect(x-a.cellOrigin,y-a.cellOrigin,a.sharpPx.cellW/(float)a.sharpPx.scale,a.sharpPx.cellH/(float)a.sharpPx.scale);
     if(blurW<1){GUI.color=new Color(1,1,1,alpha*(1-blurW));GUI.DrawTextureWithTexCoords(r,sharpTex,AtlasUv(t,a.sharpPx));}
     if(blurW>0&&blur.TryGetValue(t.c,out var bt)){GUI.color=new Color(1,1,1,alpha*blurW);GUI.DrawTextureWithTexCoords(r,blurTex,AtlasUv(bt,a.blurPx));}
    }
    x+=advs[i]+spacing;
   }
   GUI.color=old;
  }

  const float ChipTextGap=1.5f;   // measured: every web chip is 1.5px wider than glyph 13 + text (inline svg / whitespace); the text starts after it
  struct ChipDef {public string text,glyphId;public Color col;}
  List<ChipDef> BuildChips(){
   var r=new List<ChipDef>();var lb=defs.labels;
   string S(float sec){return sec.ToString("0.0",CultureInfo.InvariantCulture);}
   if(input.state==PoiseState.Groggy)r.Add(new ChipDef{text=" "+lb.groggy+" "+S(input.stateSeconds)+"s",glyphId="burst",col=Hex("#ff8800")});
   if(input.state==PoiseState.Immune)r.Add(new ChipDef{text=" "+lb.immune+" "+S(input.stateSeconds)+"s",glyphId="shield",col=Hex("#8888ff")});
   if(input.chips!=null)foreach(var c in input.chips){
    string label,gid,hex;
    switch(c.kind){case "bleed":label=lb.bleed;gid="droplet";hex="#ff4444";break;case "poison":label=lb.poison;gid="venom";hex="#44dd44";break;case "burn":label=lb.burn;gid="flame";hex="#ff8833";break;case "shock":label=lb.shock;gid="bolt";hex="#44ddff";break;default:continue;}
    r.Add(new ChipDef{text=" "+label+Mathf.Max(1,c.stacks)+" "+S(c.seconds)+"s",glyphId=gid,col=Hex(hex)});
   }
   return r;
  }
  float TextWidth(string text,float size){var st=Style(14);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x*(size/14f);return w;}
  void DrawChip(Rect r,ChipDef c,float a){
   var L=defs.layout;
   Fill(r,new Color(0,0,0,.6f*a));var bc=new Color(c.col.r,c.col.g,c.col.b,.333f*a);
   Fill(new Rect(r.x,r.y,r.width,1),bc);Fill(new Rect(r.x,r.yMax-1,r.width,1),bc);Fill(new Rect(r.x,r.y+1,1,r.height-2),bc);Fill(new Rect(r.xMax-1,r.y+1,1,r.height-2),bc);
   float x=r.x+1+L.chipPadX;var at=defs.atlas;
   if(glyph.TryGetValue(c.glyphId,out var gt)){
    var rect=new Rect(x-at.glyphOrigin,r.y+r.height/2f-L.glyph/2f-at.glyphOrigin,at.glyphPx.cellW/(float)at.glyphPx.scale,at.glyphPx.cellH/(float)at.glyphPx.scale);
    var old=GUI.color;GUI.color=new Color(1,1,1,a);GUI.DrawTextureWithTexCoords(rect,glyphTex,AtlasUv(gt,at.glyphPx));GUI.color=old;
   }
   x+=L.glyph+ChipTextGap;var st=Style(14);float scale=L.chipFont/14f;var col=new Color(c.col.r,c.col.g,c.col.b,a);
   foreach(char ch in c.text){string g=ch.ToString();float w=st.CalcSize(new GUIContent(g)).x*scale;st.normal.textColor=col;NativeUiAudit.Label(new Rect(x,r.y,40,r.height),g,st);x+=w;}
  }
 }
}
