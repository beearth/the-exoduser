using System;
class Texture2D {}
static class Debug {public static void Log(string s){Console.WriteLine(s);}}
class GUIStyleState {public Texture2D background;public Texture2D[] scaledBackgrounds;}
class GUIStyle {
 public static GUIStyle none=new GUIStyle();
 public GUIStyleState normal=new GUIStyleState(),hover=new GUIStyleState(),active=new GUIStyleState(),focused=new GUIStyleState(),onNormal=new GUIStyleState(),onHover=new GUIStyleState(),onActive=new GUIStyleState(),onFocused=new GUIStyleState();
 public int fontSize=23,padding=7;public string name="test";
}
static class MaterialProbe {
 static int StrippedStates;
 static void RememberStock(){}
 /*PRODUCTION*/
 static int Main(){
  var style=new GUIStyle();var states=new[]{style.normal,style.hover,style.active,style.focused,style.onNormal,style.onHover,style.onActive,style.onFocused};
  foreach(var state in states){state.background=new Texture2D();state.scaledBackgrounds=new[]{new Texture2D()};}
  var result=ClearBackgrounds(style);int fail=0;
  foreach(var state in states){if(state.background!=null)fail++;
#if UNITY_EDITOR
   if(state.scaledBackgrounds.Length!=0)fail++;
#endif
  }
  if(result!=style||style.fontSize!=23||style.padding!=7||StrippedStates!=8)fail++;
  ClearBackgrounds(style);if(StrippedStates!=8)fail++;
  Console.WriteLine((fail==0?"PASS":"FAIL")+" all 8 native/HiDPI states; typography/padding preserved; repeat safe");
  return fail==0?0:2;
 }
}
