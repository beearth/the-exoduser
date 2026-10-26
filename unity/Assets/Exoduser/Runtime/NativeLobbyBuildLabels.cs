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
   foreach(char ch in text){string g=ch.ToString();GUI.Label(new Rect(xx,y,40,h),g,st);xx+=st.CalcSize(new GUIContent(g)).x+ls;}
   return xx-x;
  }
  public static float Width(string text,int size,float ls){var st=Style(size);float w=0;foreach(char ch in text)w+=st.CalcSize(new GUIContent(ch.ToString())).x+ls;return w;}
  // powerCenterY = vertical centre of the quit button in the lobby layout; the corner label is centred on it (web: both 36px flex items, align-items:center)
  public static void Draw(float powerCenterY,bool offline=true){
   var f=BuildFlavor.Current;var s=BuildFlavor.LobbyStyle;int size=Mathf.RoundToInt(s.fontSize);
   // top-left overlay: label / version / mode / limits, line-height 19.2px, text box 17px tall inside each line
   float y=s.overlayY+1f;
   Text(s.overlayX,y,17,f.Label,size,s.color,s.ls);y+=s.lineHeight;
   Text(s.overlayX,y,17,BuildFlavor.VersionLine,size,s.color,s.ls);y+=s.lineHeight;
   Text(s.overlayX,y,17,offline?s.modeOffline:s.modeOnline,size,s.color,s.ls);y+=s.lineHeight;
   if(!string.IsNullOrEmpty(f.Limits))Text(s.overlayX,y,17,f.Limits,size,s.limitsColor,s.ls);
   // corner label: right-aligned to the gap before the quit button
   int csize=Mathf.RoundToInt(s.cornerSize);float w=Width(f.Label,csize,s.cornerLs);Text(s.cornerRight-w,powerCenterY-7.5f,15,f.Label,csize,s.cornerColor,s.cornerLs);
  }
 }
}
