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
  Texture2D frame,mapTex,portrait,markerRing,markerArrow,objectiveCircle,lockClosed,lockOpen;
  readonly List<NativeMinimapObjective> objectiveMarkers=new List<NativeMinimapObjective>(24);Font font;NativeMinimapTiles texFor;bool mapBuilt;float mapSc;int mapW,mapH;
  readonly Dictionary<string,GUIStyle> styles=new Dictionary<string,GUIStyle>();
  static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
  static void Fill(Rect r,Color c){var o=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=o;}
  GUIStyle St(int size,TextAnchor a,Color c,bool bold=false)
  {
   string k=size+"|"+a+"|"+ColorUtility.ToHtmlStringRGBA(c)+bold;GUIStyle s;if(styles.TryGetValue(k,out s))return s;
   s=new GUIStyle(GUI.skin.label){font=font,fontSize=size,alignment=a,fontStyle=FontStyle.Normal,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};s.normal.textColor=c;styles[k]=s;return s;
  }
  void Init()
  {
   if(font!=null)return;
   font=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");frame=Resources.Load<Texture2D>("Art/ui/mm_frame_ring_20261028");portrait=Resources.Load<Texture2D>("Art/ui/minimap_warrior");InitMarker();InitObjectiveMarkers();

  }
  // _mmTickBuild: tile 1 is skipped, 2 #777a7a, 4 #443355, everything else #555858; one sc-sized square per tile.
  void BuildMap(NativeMinimapTiles map)
  {
   texFor=map;mapBuilt=true;int mw=map.Width,mh=map.Height;float sc=Mathf.Min(122f/mw,122f/mh);mapSc=sc;
   mapW=Mathf.Max(1,(int)(mw*sc));mapH=Mathf.Max(1,(int)(mh*sc));
   var px=new Color32[mapW*mapH];Color32 a=new Color32(119,122,122,255),b=new Color32(68,51,85,255),c=new Color32(85,88,88,255);
    int size=Mathf.Max(1,Mathf.CeilToInt(sc));
   for(int ty=0;ty<mh;ty++)for(int tx=0;tx<mw;tx++)
   {
     int tv=map.Tile(tx,ty);if(tv==1)continue;Color32 col=tv==2?a:tv==4?b:c;
    int x0=(int)(tx*sc),y0=(int)(ty*sc);
    for(int dy=0;dy<size;dy++)for(int dx=0;dx<size;dx++){int x=x0+dx,y=y0+dy;if(x<mapW&&y<mapH)px[(mapH-1-y)*mapW+x]=col;}
   }
   // CSS #mm의 50% 원형 clip. 비정방 캔버스도 CSS 130x130에 맞춰 표시한다.
   int sourceH=mapH+8;float ox=(130-mapW)/2f,oy=(sourceH-mapH)/2f;
   var circle=new Color32[130*130];
   for(int y=0;y<130;y++)for(int x=0;x<130;x++){
    float dx=x+.5f-65,dy=y+.5f-65,edge=Mathf.Clamp01(65-Mathf.Sqrt(dx*dx+dy*dy));if(edge<=0)continue;
    float sy=(y+.5f)*sourceH/130;int mx=(int)(x-ox),my=(int)(sy-oy);Color32 col=new Color32(0,0,0,115);
    if(mx>=0&&mx<mapW&&my>=0&&my<mapH){var tile=px[(mapH-1-my)*mapW+mx];if(tile.a>0)col=tile;}
    col.a=(byte)(col.a*edge);circle[(129-y)*130+x]=col;
   }
   if(mapTex!=null)UnityEngine.Object.Destroy(mapTex);
   mapTex=new Texture2D(130,130,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};mapTex.SetPixels32(circle);mapTex.Apply(false,true);
  }
  // 웹 Canvas의 검정/흰색 이중 원과 방향 삼각형. 장식 원화는 원본 PNG를 사용한다.
  void InitMarker(){
   markerRing=new Texture2D(36,36,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear};
   markerArrow=new Texture2D(24,20,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear};
   for(int y=0;y<36;y++)for(int x=0;x<36;x++){float r=Vector2.Distance(new Vector2(x+.5f,y+.5f),new Vector2(18,18))*.5f;float a=Mathf.Clamp01(8.5f-r)*2;Color c=new Color(0,0,0,Mathf.Clamp01(a));if(Mathf.Abs(r-6.5f)<.5f)c=Color.white;else if(r<6)c=Color.clear;markerRing.SetPixel(x,y,c);}markerRing.Apply(false,true);
   for(int y=0;y<20;y++)for(int x=0;x<24;x++){float sx=(x+.5f)*.5f,sy=Mathf.Abs((y+.5f)*.5f-5);float half=3.4f*(1-(sx-.5f)/5);bool inside=sx>=.5f&&sx<=5.5f&&sy<=half;bool border=sx>=0&&sx<=6&&sy<=half+.5f;markerArrow.SetPixel(x,y,inside?Color.white:border?Color.black:Color.clear);}markerArrow.Apply(false,true);
  }

  public void Draw(float hudWidth,Info info)
  {
   if(info.sim==null||info.map==null)return;Init();
   var tiles=NativeMinimapTiles.Read(info.map,info.sim.Stage);
   if(!mapBuilt||!texFor.Same(tiles)||mapTex==null)BuildMap(tiles);
   var matrix=GUI.matrix;GUI.matrix=NativeUiViewport.EdgeMatrix;DrawMinimap(info);DrawCorner(info);GUI.matrix=matrix;DrawClock(hudWidth,info);
  }
  void DrawMinimap(Info info)
  {
   var old=GUI.color;
   NativeUiAudit.Region(new Rect(8,8,141.1f,141.1f),"component","hud-minimap","미니맵 외곽");var canvas=new Rect(23.3f,23.3f,110.5f,110.5f);const float k=.85f;
   float ox=(130-mapW)/2f,oy=4,sourceH=mapH+8,ys=130f/sourceH;
   GUI.color=new Color(1,1,1,.94f);NativeUiAudit.DrawTexture(canvas,mapTex);GUI.color=old;
   DrawObjectiveMarkers(info,canvas,k);
   var sim=info.sim;int T=texFor.TileSize;int shown=0;
   foreach(var e in sim.Enemies){
    if(!e.Alive||sim.IsRemodelProp(e))continue;if(shown++>=60)break;float ex=ox+e.X/T*mapSc,ey=(oy+e.Y/T*mapSc)*ys;
    if(Vector2.Distance(new Vector2(ex,ey),new Vector2(65,65))>64)continue;
    Color col=new Color32(187,187,187,255);if(!string.IsNullOrEmpty(e.Col))ColorUtility.TryParseHtmlString(e.Col,out col);
    Fill(new Rect(canvas.x+(ex-1)*k,canvas.y+(ey-1)*k,2*k,2*k),new Color(col.r,col.g,col.b,.94f));
   }
   var p=sim.Player;float px=ox+p.X/T*mapSc,py=(oy+p.Y/T*mapSc)*ys,cx=canvas.x+px*k,cy=canvas.y+py*k;
   if(Vector2.Distance(new Vector2(px,py),new Vector2(65,65))<56){
    GUI.color=new Color(1,1,1,.94f);var m=GUI.matrix;RotateLocal(new Vector2(cx,cy),-p.Facing*Mathf.Rad2Deg);
    NativeUiAudit.DrawTexture(new Rect(cx+7*k,cy-5*k,12*k,10*k),markerArrow);GUI.matrix=m;
    if(portrait!=null)NativeUiAudit.DrawTexture(new Rect(cx-7*k,cy-7*k,14*k,14*k),portrait);
    NativeUiAudit.DrawTexture(new Rect(cx-9*k,cy-9*k,18*k,18*k),markerRing);GUI.color=old;
   }
   if(frame!=null){GUI.color=new Color(1.05f,1.05f,1.05f,.94f);NativeUiAudit.DrawTexture(new Rect(8,8,141.1f,141.1f),frame,ScaleMode.StretchToFill,true);GUI.color=old;}
  }


  void InitObjectiveMarkers(){
   objectiveCircle=NativeSilverHellUi.Effect(32,32,(u,v)=>{float x=u-.5f,y=v-.5f;return new Color(1,1,1,Mathf.Clamp01((.5f-Mathf.Sqrt(x*x+y*y))*32));});
   lockClosed=NativeSilverHellUi.Effect(64,64,(u,v)=>MinimapLockPixel((u-.5f)*16,(v-.5f)*16,false));
   lockOpen=NativeSilverHellUi.Effect(64,64,(u,v)=>MinimapLockPixel((u-.5f)*16,(v-.5f)*16,true));
  }
  static float MinimapSegmentDistance(float x,float y,float ax,float ay,float bx,float by){float dx=bx-ax,dy=by-ay,t=Mathf.Clamp01(((x-ax)*dx+(y-ay)*dy)/Mathf.Max(.0001f,dx*dx+dy*dy));dx=x-ax-t*dx;dy=y-ay-t*dy;return Mathf.Sqrt(dx*dx+dy*dy);}
  static float MinimapRectCoverage(float x,float y,float x0,float y0,float x1,float y1){return Mathf.Clamp01(Mathf.Min(Mathf.Min(x-x0,x1-x),Mathf.Min(y-y0,y1-y))+.5f);}
  static Color MinimapOver(Color below,Color above){float a=above.a+below.a*(1-above.a);return a<=0?Color.clear:new Color((above.r*above.a+below.r*below.a*(1-above.a))/a,(above.g*above.a+below.g*below.a*(1-above.a))/a,(above.b*above.a+below.b*below.a*(1-above.a))/a,a);}
  static Color MinimapLockPixel(float x,float y,bool open){
   Color color=open?new Color(68/255f,170/255f,1):new Color(1,68/255f,68/255f),pixel=Color.clear;
   float first=open?Mathf.PI*.95f:Mathf.PI,last=open?Mathf.PI*1.8f:Mathf.PI*2,cx=open?3:0,cy=open?-2.5f:-2,best=100,ax=cx+Mathf.Cos(first)*3,ay=cy+Mathf.Sin(first)*3;
   for(int i=1;i<=32;i++){float angle=first+(last-first)*i/32,bx=cx+Mathf.Cos(angle)*3,by=cy+Mathf.Sin(angle)*3;best=Mathf.Min(best,MinimapSegmentDistance(x,y,ax,ay,bx,by));ax=bx;ay=by;}
   pixel=MinimapOver(pixel,new Color(0,0,0,.9f*Mathf.Clamp01(2-best)));pixel=MinimapOver(pixel,new Color(color.r,color.g,color.b,Mathf.Clamp01(1.25f-best)));
   pixel=MinimapOver(pixel,new Color(0,0,0,.9f*MinimapRectCoverage(x,y,-4,-2.5f,4,4.5f)));
   pixel=MinimapOver(pixel,new Color(color.r,color.g,color.b,MinimapRectCoverage(x,y,-3,-1.5f,3,3.5f)));
   return MinimapOver(pixel,new Color(0,0,0,.85f*MinimapRectCoverage(x,y,-.5f,-.2f,.7f,2.4f)));
  }
  void DrawObjectiveMarkers(Info info,Rect canvas,float scale){
   NativeMinimapObjectives.Collect(info.sim,objectiveMarkers);var old=GUI.color;
   try{foreach(var marker in objectiveMarkers){
    var point=NativeMinimapObjectives.Project(marker.X,marker.Y,texFor.Width,texFor.Height,texFor.TileSize);
    if(Vector2.Distance(new Vector2(point.X,point.Y),new Vector2(65,65))>64)continue;
    if(marker.Kind==NativeMinimapObjectiveKind.Gate){GUI.color=new Color(1,1,1,.94f);NativeUiAudit.DrawTexture(new Rect(canvas.x+(point.X-8)*scale,canvas.y+(point.Y-8)*scale,16*scale,16*scale),marker.Unlocked?lockOpen:lockClosed);continue;}
    float radius=marker.Radius,alpha=(marker.Kind==NativeMinimapObjectiveKind.Hole?.85f:1)*.94f;Color color;
    if(!ColorUtility.TryParseHtmlString(marker.Color,out color))color=new Color(.73f,.73f,.73f);
    GUI.color=new Color(0,0,0,alpha);NativeUiAudit.DrawTexture(new Rect(canvas.x+(point.X-radius-.5f)*scale,canvas.y+(point.Y-radius-.5f)*scale,(radius+.5f)*2*scale,(radius+.5f)*2*scale),objectiveCircle);
    GUI.color=new Color(color.r,color.g,color.b,alpha);NativeUiAudit.DrawTexture(new Rect(canvas.x+(point.X-radius+.5f)*scale,canvas.y+(point.Y-radius+.5f)*scale,(radius-.5f)*2*scale,(radius-.5f)*2*scale),objectiveCircle);
   }}finally{GUI.color=old;}
  }

  // Rotation about a point in the current (scaled) GUI space; RotateAroundPivot assumes an unscaled matrix.
  static void RotateLocal(Vector2 pivot,float deg){GUI.matrix=GUI.matrix*Matrix4x4.TRS(pivot,Quaternion.Euler(0,0,deg),Vector3.one)*Matrix4x4.TRS(-pivot,Quaternion.identity,Vector3.one);}
  static string Compact(double n){return n>=1e9?(n/1e9).ToString("0.00")+"B":n>=1e6?(n/1e6).ToString("0.00")+"M":n>=1e3?(n/1e3).ToString("0.0")+"K":((int)n).ToString();}
  void DrawCorner(Info info)
  {
   var box=new Rect(16,188,108,58.3f);float a=.94f;
   NativeSilverHellUi.Panel(box,10,0);
   var tc=C(226,223,217,.93f*a);
   NativeSilverHellUi.Label(new Rect(24,196,22,18),"SP",St(10,TextAnchor.MiddleLeft,tc));
   string sp=info.statPoints.ToString()+(info.passivePoints>0?" +"+info.passivePoints:"");
   NativeSilverHellUi.Label(new Rect(46,196,70,17.7f),sp,St(13,TextAnchor.MiddleLeft,tc));
   Fill(new Rect(28,216.7f,86,1),C(130,133,133,.2f*a));
   NativeSilverHellUi.Label(new Rect(24,219,22,22),"CP",St(10,TextAnchor.MiddleLeft,tc));
   string cp=info.combatPower>=100000?Compact(info.combatPower):info.combatPower.ToString("N0",System.Globalization.CultureInfo.InvariantCulture);
   NativeSilverHellUi.Label(new Rect(46,219,70,21.7f),cp,St(13,TextAnchor.MiddleLeft,tc));
  }
  void DrawClock(float hudWidth,Info info)
  {
   float a=1f,x=hudWidth/2-85;var box=new Rect(x,17,170,37);
   NativeSilverHellUi.ActionPlate(box,false,0,false,12,0);
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
    var oc=GUI.color;GUI.color=new Color(1,1,1,a);NativeUiAudit.DrawTexture(new Rect(bar.x,bar.y,w,2),fillGrad);GUI.color=oc;}
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
