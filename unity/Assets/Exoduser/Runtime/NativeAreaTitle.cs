using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web #areaTitle (game.html markup 2678, CSS 333-339 incl. ::before/::after rules, keyframes hudAreaTitle 3.1s ease-in-out both, _showHudAreaTitle 60243)
 // in the 1920x1080 design space. Definitions (name table, formats, keyframes, geometry) come from Data/areatitle_web.json. The caller passes the stage
 // index (a Unity value); a stage outside the table is drawn as "미이식". CSS blur()/drop-shadow() have no IMGUI equivalent: both are approximated with
 // offset copies of the glyphs (recorded as a remaining difference).
 public sealed class NativeAreaTitle {
  [Serializable] sealed class Key {public float p,op,ty,blur;}
  [Serializable] sealed class TitleDef {public string formatKo,formatEn,enLine,easing;public float durationSec,boxX,boxW,boxTop,krH,enTop,enH,krSize,krLs,enSize,enLs,lineW,lineTop;public Key[] keyframes;}
  [Serializable] sealed class Name {public int i;public string kr,en;}
  [Serializable] sealed class Tok {public string n;public float x,y,w,h,adv,pad,cy;}
  [Serializable] sealed class Defs {public TitleDef title;public Name[] names;public Tok[] atlas;}
  const string NotPorted="미이식";
  readonly Defs defs;readonly Dictionary<string,Tok> tok=new Dictionary<string,Tok>();
  Texture2D atlas,lineTex;Font nanum;bool ready;readonly Dictionary<int,GUIStyle> styles=new Dictionary<int,GUIStyle>();
  int stage;bool english,active;float start;public float? ForcedAge;
  public bool Active{get{return active;}}
  public float Duration{get{return defs.title.durationSec;}}

  public NativeAreaTitle(){
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/areatitle_web").text);
   foreach(var t in defs.atlas)tok[t.n]=t;
  }
  // The web calls this when the stage changes (first HUD slow-path tick of a stage). Unity has no stage-change event: the NativeGame patch calls it once at run entry.
  public void Show(int stageIndex,bool englishText=false){stage=stageIndex;english=englishText;active=true;start=Time.unscaledTime;}
  public void Hide(){active=false;}
  float Age{get{return ForcedAge.HasValue?ForcedAge.Value:Time.unscaledTime-start;}}

  // CSS ease-in-out = cubic-bezier(.42,0,.58,1), solved by bisection on x.
  static float Ease(float x){
   x=Mathf.Clamp01(x);float lo=0,hi=1,t=x;
   for(int i=0;i<24;i++){t=(lo+hi)/2;float bx=3*(1-t)*(1-t)*t*.42f+3*(1-t)*t*t*.58f+t*t*t;if(bx<x)lo=t;else hi=t;}
   return 3*(1-t)*(1-t)*t*0+3*(1-t)*t*t*1+t*t*t;
  }
  public void Sample(float ageSec,out float opacity,out float ty,out float blur){
   var k=defs.title.keyframes;float p=Mathf.Clamp01(ageSec/defs.title.durationSec);
   opacity=k[k.Length-1].op;ty=k[k.Length-1].ty;blur=k[k.Length-1].blur;
   for(int i=0;i<k.Length-1;i++){
    if(p<=k[i+1].p){float u=k[i+1].p>k[i].p?(p-k[i].p)/(k[i+1].p-k[i].p):1;float e=Ease(u);opacity=Mathf.Lerp(k[i].op,k[i+1].op,e);ty=Mathf.Lerp(k[i].ty,k[i+1].ty,e);blur=Mathf.Lerp(k[i].blur,k[i+1].blur,e);return;}
   }
  }
  public string KrText(){
   Name nm=null;foreach(var n in defs.names)if(n.i==stage){nm=n;break;}
   if(nm==null)return NotPorted;
   return (english?defs.title.formatEn:defs.title.formatKo).Replace("{n}",(stage+1).ToString()).Replace("{name}",english?nm.en:nm.kr);
  }
  public string EnText(){
   Name nm=null;foreach(var n in defs.names)if(n.i==stage){nm=n;break;}
   return nm==null?NotPorted:defs.title.enLine.Replace("{NAME}",(nm.en??nm.kr).ToUpperInvariant());
  }

  void Init(){
   if(ready)return;ready=true;
   atlas=Resources.Load<Texture2D>("Art/ui/area/area_atlas");nanum=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
   lineTex=new Texture2D(32,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<32;i++)lineTex.SetPixel(i,0,new Color(164/255f,147/255f,115/255f,.54f*i/31f));lineTex.Apply(false,true);
  }
  GUIStyle Style(int size){
   if(!styles.TryGetValue(size,out var s)){s=new GUIStyle(GUI.skin.label){font=nanum,fontSize=size,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};styles[size]=s;}
   return s;
  }
  struct Cell {public string text;public bool glyph;public string token;public float adv;}
  // Latin / digits / middle dot use the web-rendered Cinzel crops (key prefix), Hangul uses Nanum Myeongjo (the web's own fallback for this stack).
  List<Cell> Layout(string text,string prefix,int nanumSize,float ls,out float width){
   var cells=new List<Cell>();var st=Style(nanumSize);width=0;
   foreach(char ch in text){
    string key=prefix+ch;Cell c;
    if(tok.TryGetValue(key,out var t)){c=new Cell{glyph=true,token=key,adv=t.adv+ls};}
    else{c=new Cell{text=ch.ToString(),adv=st.CalcSize(new GUIContent(ch.ToString())).x+ls};}
    cells.Add(c);width+=c.adv;
   }
   return cells;
  }
  void DrawCells(List<Cell> cells,float x,float cy,int nanumSize,Color col,Vector2 off){
   var st=Style(nanumSize);var old=GUI.color;float xx=x+off.x;
   foreach(var c in cells){
    if(c.glyph){var t=tok[c.token];GUI.color=col;NativeUiAudit.DrawTextureWithTexCoords(new Rect(xx-t.pad,cy+off.y-t.cy,t.w,t.h),atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));}
    else{st.normal.textColor=col;NativeUiAudit.Label(new Rect(xx,cy+off.y-20,70,40),c.text,st);}
    xx+=c.adv;
   }
   GUI.color=old;
  }
  // blur()/drop-shadow() approximation: ring of offset copies, total alpha preserved.
  void DrawRing(List<Cell> cells,float x,float cy,int nanumSize,Color shadow,float shadowBlur,float shadowDy,float op){
   int n=8;float r=Mathf.Max(.5f,shadowBlur*.5f);
   for(int i=0;i<n;i++){float a=i*Mathf.PI*2/n;DrawCells(cells,x,cy,nanumSize,new Color(shadow.r,shadow.g,shadow.b,shadow.a*op*.16f),new Vector2(Mathf.Cos(a)*r,shadowDy+Mathf.Sin(a)*r));}
  }
  void DrawSoft(List<Cell> cells,float x,float cy,int nanumSize,Color col,float blurPx,float op){
   if(blurPx<.6f){DrawCells(cells,x,cy,nanumSize,new Color(col.r,col.g,col.b,col.a*op),Vector2.zero);return;}
   int m=8;float rr=blurPx*.5f;
   DrawCells(cells,x,cy,nanumSize,new Color(col.r,col.g,col.b,col.a*op*.30f),Vector2.zero);
   for(int i=0;i<m;i++){float a=i*Mathf.PI*2/m;DrawCells(cells,x,cy,nanumSize,new Color(col.r,col.g,col.b,col.a*op*.70f/m),new Vector2(Mathf.Cos(a)*rr,Mathf.Sin(a)*rr));}
  }

  public void Draw(){
   if(!active)return;Init();
   float age=Age;if(!ForcedAge.HasValue&&age>defs.title.durationSec){active=false;return;}
   Sample(age,out float op,out float ty,out float blur);if(op<=.002f)return;
   var old=GUI.matrix;var color=GUI.color;
   try {
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    var T=defs.title;float cx=T.boxX+T.boxW/2f;float top=T.boxTop+ty;
    // ::before / ::after: 21% wide, 1px, gradient transparent -> rgba(164,147,115,.54), opacity .8 (right one mirrored)
    GUI.color=new Color(1,1,1,.8f*op);
    NativeUiAudit.DrawTexture(new Rect(T.boxX,top+T.lineTop,T.lineW,1),lineTex);
    NativeUiAudit.DrawTextureWithTexCoords(new Rect(T.boxX+T.boxW-T.lineW,top+T.lineTop,T.lineW,1),lineTex,new Rect(1,0,-1,1));
    GUI.color=Color.white;
    string kr=KrText(),en=EnText();
    float w;var krCells=Layout(kr,"k:",25,T.krLs,out w);float kx=cx-w/2f;
    DrawRing(krCells,kx,top+T.krH/2f,25,new Color(0,0,0,.9f),12,5,op);               // filter: drop-shadow(0 5px 12px rgba(0,0,0,.9))
    DrawCells(krCells,kx,top+T.krH/2f,25,new Color(0,0,0,.35f*op),new Vector2(0,2));  // text-shadow 0 2px 6px #000
    DrawSoft(krCells,kx,top+T.krH/2f,25,new Color(223/255f,214/255f,194/255f,.9f),blur,op);
    var enCells=Layout(en,"e:",11,T.enLs,out w);float ex=cx-w/2f;float ecy=T.boxTop+(T.enTop-T.boxTop)+ty+T.enH/2f;
    DrawRing(enCells,ex,ecy,11,new Color(0,0,0,.9f),12,5,op);
    DrawSoft(enCells,ex,ecy,11,new Color(168/255f,153/255f,127/255f,.72f),blur,op);
   } finally {GUI.matrix=old;GUI.color=color;}
  }
 }
}
