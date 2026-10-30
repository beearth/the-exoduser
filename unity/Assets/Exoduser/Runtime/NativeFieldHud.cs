using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // A06: web field HUD parts that were missing in Unity — minimap (#mmWrap: drawMM + _mmTickBuild tile colours, frame img/mm_frame.png),
 // stage clock (#stageClock: mm:ss + progress bar) and the top-left star/lozenge corner (#hudCorner). Geometry = computed-rect dump of the live web at 1920x1080.
 public sealed class NativeFieldHud
 {
  public struct Info { public SourceMap map;public Simulation sim;public int statPoints,passivePoints,combatPower;public float progress;public bool english; }
  Texture2D frame,mapTex,grad;Font font;SourceMap texFor;float mapSc;int mapW,mapH;
  readonly Dictionary<string,GUIStyle> styles=new Dictionary<string,GUIStyle>();
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  static void Fill(Rect r,Color c){var o=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=o;}
  GUIStyle St(int size,TextAnchor a,Color c,bool bold=false)
  {
   string k=size+"|"+a+"|"+ColorUtility.ToHtmlStringRGBA(c)+bold;GUIStyle s;if(styles.TryGetValue(k,out s))return s;
   s=new GUIStyle(GUI.skin.label){font=font,fontSize=size,alignment=a,fontStyle=bold?FontStyle.Bold:FontStyle.Normal,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};s.normal.textColor=c;styles[k]=s;return s;
  }
  void Init()
  {
   if(font!=null)return;
   font=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");frame=Resources.Load<Texture2D>("Art/ui/mm_frame");
   grad=new Texture2D(1,16,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
   for(int i=0;i<16;i++)grad.SetPixel(0,15-i,new Color(12/255f,13/255f,16/255f,.72f*(1f-i/15f)));grad.Apply(false,true);
  }
  // _mmTickBuild: tile 1 is skipped, 2 #777a7a, 4 #443355, everything else #555858; one sc-sized square per tile.
  void BuildMap(SourceMap map)
  {
   texFor=map;int mw=map.Data.width,mh=map.Data.height;float sc=Mathf.Min(122f/mw,122f/mh);mapSc=sc;
   mapW=Mathf.Max(1,(int)(mw*sc));mapH=Mathf.Max(1,(int)(mh*sc));
   var px=new Color32[mapW*mapH];Color32 a=new Color32(119,122,122,255),b=new Color32(68,51,85,255),c=new Color32(85,88,88,255);
   var tiles=map.Data.tiles;int size=Mathf.Max(1,Mathf.CeilToInt(sc));
   for(int ty=0;ty<mh;ty++)for(int tx=0;tx<mw;tx++)
   {
    int tv=tiles[ty*mw+tx];if(tv==1)continue;Color32 col=tv==2?a:tv==4?b:c;
    int x0=(int)(tx*sc),y0=(int)(ty*sc);
    for(int dy=0;dy<size;dy++)for(int dx=0;dx<size;dx++){int x=x0+dx,y=y0+dy;if(x<mapW&&y<mapH)px[(mapH-1-y)*mapW+x]=col;}
   }
   mapTex=new Texture2D(mapW,mapH,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Point};mapTex.SetPixels32(px);mapTex.Apply(false,false);
  }
  public void Draw(float hudWidth,Info info)
  {
   if(info.sim==null||info.map==null)return;Init();
   if(texFor!=info.map||mapTex==null)BuildMap(info.map);
   DrawMinimap(info);DrawCorner(info);DrawClock(hudWidth,info);
  }
  void DrawMinimap(Info info)
  {
   var old=GUI.color;
   var canvas=new Rect(23.3f,23.3f,110.5f,110.5f);const float k=.85f;
   Fill(canvas,new Color(0,0,0,.45f*.94f));
   float ox=(130-mapW)/2f,oy=(130-mapH)/2f;
   GUI.color=new Color(1,1,1,.94f);
   GUI.DrawTexture(new Rect(canvas.x+ox*k,canvas.y+oy*k,mapW*k,mapH*k),mapTex);
   GUI.color=old;
   var sim=info.sim;int T=info.map.Data.tileSize;if(T<=0)T=64;
   foreach(var e in sim.Enemies)
   {
    if(!e.Alive||sim.IsRemodelProp(e))continue;float ex=ox+e.X/T*mapSc,ey=oy+e.Y/T*mapSc;if(ex<0||ex>130||ey<0||ey>130)continue;
    Color col=new Color32(187,187,187,255);if(!string.IsNullOrEmpty(e.Col))ColorUtility.TryParseHtmlString(e.Col,out col);
    Fill(new Rect(canvas.x+(ex-1)*k,canvas.y+(ey-1)*k,2*k,2*k),new Color(col.r,col.g,col.b,.94f));
   }
   var p=sim.Player;float px=ox+p.X/T*mapSc,py=oy+p.Y/T*mapSc;float cx=canvas.x+px*k,cy=canvas.y+py*k,r=7*k;
   // direction triangle, then the white disc with the black+white double ring (_mmDrawPlayerMarker without portrait).
   var m=GUI.matrix;RotateLocal(new Vector2(cx,cy),-p.Facing*Mathf.Rad2Deg);Fill(new Rect(cx+r+.5f,cy-1.2f,4,2.4f),Color.white);GUI.matrix=m;
   Fill(new Rect(cx-r-.5f,cy-r-.5f,(r+.5f)*2,(r+.5f)*2),Color.black);Fill(new Rect(cx-r+.5f,cy-r+.5f,(r-.5f)*2,(r-.5f)*2),Color.white);Fill(new Rect(cx-r+1.5f,cy-r+1.5f,(r-1.5f)*2,(r-1.5f)*2),new Color32(229,226,220,255));
   if(frame!=null){GUI.color=new Color(1,1,1,.94f);GUI.DrawTexture(new Rect(8,8,141.1f,141.1f),frame,ScaleMode.StretchToFill,true);GUI.color=old;}
  }
  // Rotation about a point in the current (scaled) GUI space; RotateAroundPivot assumes an unscaled matrix.
  static void RotateLocal(Vector2 pivot,float deg){GUI.matrix=GUI.matrix*Matrix4x4.TRS(pivot,Quaternion.Euler(0,0,deg),Vector3.one)*Matrix4x4.TRS(-pivot,Quaternion.identity,Vector3.one);}
  void Star(float cx,float cy,float s,Color c)
  {
   var m=GUI.matrix;Fill(new Rect(cx-s,cy-.9f,s*2,1.8f),c);Fill(new Rect(cx-.9f,cy-s,1.8f,s*2),c);RotateLocal(new Vector2(cx,cy),45);Fill(new Rect(cx-s*.6f,cy-.7f,s*1.2f,1.4f),c);Fill(new Rect(cx-.7f,cy-s*.6f,1.4f,s*1.2f),c);GUI.matrix=m;
  }
  void Lozenge(float cx,float cy,float s,Color c)
  {
   var m=GUI.matrix;RotateLocal(new Vector2(cx,cy),45);var r=new Rect(cx-s*.7f,cy-s*.7f,s*1.4f,s*1.4f);Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);GUI.matrix=m;
  }
  static string Compact(double n){return n>=1e9?(n/1e9).ToString("0.00")+"B":n>=1e6?(n/1e6).ToString("0.00")+"M":n>=1e3?(n/1e3).ToString("0.0")+"K":((int)n).ToString();}
  void DrawCorner(Info info)
  {
   var box=new Rect(16,188,108,58.3f);float a=.94f;
   Fill(box,C(21,19,18,.9f*a));Fill(new Rect(box.x,box.y,box.width,1),C(142,145,145,.4f*a));Fill(new Rect(box.x,box.y,2,box.height),C(144,147,147,.64f*a));
   var tc=C(226,223,217,.93f*a);
   Star(36,205,5,tc);
   string sp=info.statPoints.ToString()+(info.passivePoints>0?" +"+info.passivePoints:"");
   NativeSilverHellUi.Label(new Rect(46,196,70,17.7f),sp,St(13,TextAnchor.MiddleLeft,tc));
   Fill(new Rect(28,216.7f,86,1),C(130,133,133,.2f*a));
   Lozenge(36,229,4.5f,tc);
   string cp=info.combatPower>=100000?Compact(info.combatPower):info.combatPower.ToString("N0",System.Globalization.CultureInfo.InvariantCulture);
   NativeSilverHellUi.Label(new Rect(46,219,70,21.7f),cp,St(13,TextAnchor.MiddleLeft,tc));
  }
  void DrawClock(float hudWidth,Info info)
  {
   float a=1f,x=hudWidth/2-85;var box=new Rect(x,17,170,37);
   var o=GUI.color;GUI.color=new Color(1,1,1,a);GUI.DrawTexture(box,grad);GUI.color=o;
   Fill(new Rect(box.x,box.y,box.width,1),C(145,148,148,.38f*a));
   int sec=Mathf.Max(0,info.sim.TickCount/60);string t=(sec/60).ToString("00")+":"+(sec%60).ToString("00");
   var st=St(12,TextAnchor.MiddleCenter,C(230,227,221,.92f*a),true);
   // letter-spacing .14em
   float total=0;foreach(char ch in t)total+=st.CalcSize(new GUIContent(ch.ToString())).x+1.68f;float lx=box.center.x-total/2;
   foreach(char ch in t){NativeSilverHellUi.Label(new Rect(lx,23,20,16),ch.ToString(),St(12,TextAnchor.MiddleLeft,C(230,227,221,.92f*a),true));lx+=st.CalcSize(new GUIContent(ch.ToString())).x+1.68f;}
   // #stageProgress: 2px track rgba(0,0,0,.45) + shadow 0 1px 2px rgba(0,0,0,.85); #stageProgressFill: linear-gradient(90deg,rgba(112,96,73,.34),rgba(183,166,129,.8),rgba(112,96,73,.34)),
   // width transition .6s ease-out (cubic-bezier(0,0,.58,1)); the fill's own glow is clipped by the track's overflow:hidden
   var bar=new Rect(x+12,44,146,2);Fill(new Rect(bar.x-1,bar.y+1,bar.width+2,2),new Color(0,0,0,.28f*a));Fill(bar,new Color(0,0,0,.45f*a));
   float w=bar.width*ProgressShown(Mathf.Clamp01(info.progress));
   if(w>0){if(fillGrad==null){fillGrad=new Texture2D(3,1,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};fillGrad.SetPixel(0,0,C(96,99,99,.34f));fillGrad.SetPixel(1,0,C(165,168,168,.8f));fillGrad.SetPixel(2,0,C(96,99,99,.34f));fillGrad.Apply(false,true);}
    var oc=GUI.color;GUI.color=new Color(1,1,1,a);GUI.DrawTexture(new Rect(bar.x,bar.y,w,2),fillGrad);GUI.color=oc;}
  }
  Texture2D fillGrad;float progFrom,progTo,progStart=-10;bool progInit;
  static float EaseOut(float x){x=Mathf.Clamp01(x);float lo=0,hi=1,t=x;for(int i=0;i<24;i++){t=(lo+hi)/2;float bx=3*(1-t)*t*t*.58f+t*t*t;if(bx<x)lo=t;else hi=t;}return 3*(1-t)*t*t*1+t*t*t;}   // cubic-bezier(0,0,.58,1)
  float ProgressShown(float target)
  {
   float now=Time.unscaledTime;
   if(!progInit){progInit=true;progFrom=progTo=target;progStart=-10;return target;}   // first value: no transition from 0 (the web sets width 0 -> N on the first HUD tick as well, but capture / resume starts at the real value)
   float cur=progFrom+(progTo-progFrom)*EaseOut((now-progStart)/.6f);
   if(!Mathf.Approximately(target,progTo)){progFrom=cur;progTo=target;progStart=now;cur=progFrom;}
   return progFrom+(progTo-progFrom)*EaseOut((now-progStart)/.6f);
  }
 }
}
