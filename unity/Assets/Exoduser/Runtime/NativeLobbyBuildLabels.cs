using System;
using UnityEngine;

namespace Exoduser.UnityPort {
 // The Silver Hell web lobby hides #lobbyVerOverlay and uses #lobbyVersionTxt beside Quit
 // as the patch-notes button. Coordinates are in the lobby's 1920x1080 design space.
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
  public static Rect CornerBounds(float powerCenterY){
   var f=BuildFlavor.Current;var s=BuildFlavor.LobbyStyle;
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit);
   int size=Mathf.RoundToInt(s.cornerSize*unit);
   float width=Width(f.Label,size,s.cornerLs*unit);
   return new Rect(s.cornerRight-width-6*unit,powerCenterY-16*unit,width+12*unit,32*unit);
  }
  // powerCenterY = vertical centre of the quit button in the lobby layout; the corner label is centred on it (web: both 36px flex items, align-items:center)
  public static void Draw(float powerCenterY,bool highlighted=false){
   var f=BuildFlavor.Current;var s=BuildFlavor.LobbyStyle;
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit);
   int size=Mathf.RoundToInt(s.cornerSize*unit);float ls=s.cornerLs*unit,w=Width(f.Label,size,ls);
   Text(s.cornerRight-w,powerCenterY-7.5f*unit,15*unit,f.Label,size,highlighted?new Color(.78f,.8f,.78f):s.cornerColor,ls);
  }
 }
}
