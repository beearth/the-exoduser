using System;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web lobby build labels (index.html: #lobbyVerOverlay top-left, markup 789, text 2885-2890 / 3737-3743; #lobbyVersionTxt next to the quit button, 837 / 3735),
 // drawn in the lobby's 1920x1080 design space. Label / limits text come from BuildFlavor; the version line is the web `_LOBBY_VER` format; the mode line is
 // "OFFLINE" because the Unity lobby has no online account mode. Fonts follow the web computed style (Noto Sans KR 12px / 10.24px, letter spacing 1.8px / 2.867px).
 public static class NativeLobbyBuildLabels {
  static Font font;static GUIStyle style;
  static GUIStyle Style(int size){
   if(font==null)font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");
   if(style==null)style=new GUIStyle(GUI.skin.label){font=font,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),alignment=TextAnchor.MiddleLeft};
   style.fontSize=size;return style;
  }
  static float Text(float x,float y,float h,string text,int size,Color col,float ls){
   var st=Style(size);float xx=x;st.normal.textColor=col;
   foreach(char ch in text){string g=ch.ToString();NativeUiAudit.Label(new Rect(xx,y,40,h),g,st);xx+=st.CalcSize(new GUIContent(g)).x+ls;}
   return xx-x;
  }
  public static float Width(string text,int size,float ls){var st=Style(size);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  public static Rect OverlayBounds(bool offline=true){
   var f=BuildFlavor.Current;var s=BuildFlavor.LobbyStyle;
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit),ls=s.ls*unit;
   int size=Mathf.RoundToInt(s.fontSize*unit);
   float width=Mathf.Max(Width(f.Label,size,ls),Width(BuildFlavor.VersionLine,size,ls),Width(offline?s.modeOffline:s.modeOnline,size,ls));
   if(!string.IsNullOrEmpty(f.Limits))width=Mathf.Max(width,Width(f.Limits,size,ls));
   int rows=string.IsNullOrEmpty(f.Limits)?3:4;
   return new Rect(s.overlayX*unit,s.overlayY*unit,width+4*unit,rows*s.lineHeight*unit);
  }
  // powerCenterY = vertical centre of the quit button in the lobby layout; the corner label is centred on it (web: both 36px flex items, align-items:center)
  public static void Draw(float powerCenterY,bool offline=true){
   var f=BuildFlavor.Current;var s=BuildFlavor.LobbyStyle;
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit);
   int size=Mathf.RoundToInt(s.fontSize*unit);
   // top-left overlay: label / version / mode / limits, line-height 19.2px, text box 17px tall inside each line
   Rect bounds=OverlayBounds(offline);float x=bounds.x,y=bounds.y+unit,lh=s.lineHeight*unit,ls=s.ls*unit;
   Text(x,y,17*unit,f.Label,size,s.color,ls);y+=lh;
   Text(x,y,17*unit,BuildFlavor.VersionLine,size,s.color,ls);y+=lh;
   Text(x,y,17*unit,offline?s.modeOffline:s.modeOnline,size,s.color,ls);y+=lh;
   if(!string.IsNullOrEmpty(f.Limits))Text(x,y,17*unit,f.Limits,size,s.limitsColor,ls);
   // corner label: right-aligned to the gap before the quit button
   int csize=Mathf.RoundToInt(s.cornerSize*unit);float cls=s.cornerLs*unit,w=Width(f.Label,csize,cls);Text(s.cornerRight-w,powerCenterY-7.5f*unit,15*unit,f.Label,csize,s.cornerColor,cls);
  }
 }
}
