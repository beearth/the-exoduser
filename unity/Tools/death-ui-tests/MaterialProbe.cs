using System;
class Texture2D {public static Texture2D whiteTexture=new Texture2D();}
enum ColorSpace{Gamma,Linear}
enum ScaleMode{StretchToFill}
static class QualitySettings{public static ColorSpace activeColorSpace;}
struct Rect{}
struct Color{
 public float r,g,b,a;
 public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;}
 static float Decode(float c)=>c<=.04045f?c/12.92f:(float)Math.Pow((c+.055f)/1.055f,2.4);
 static float Encode(float c)=>c<=.0031308f?12.92f*c:1.055f*(float)Math.Pow(c,1/2.4f)-.055f;
 public Color linear=>new Color(Decode(r),Decode(g),Decode(b),a);
 public Color gamma=>new Color(Encode(r),Encode(g),Encode(b),a);
 public static Color white=>new Color(1,1,1,1);
}
static class GUI{public static Color color,backgroundColor;}
static class NativeUiAudit{
 public static bool blend;public static Color ink;public static Texture2D texture;
 public static void DrawTexture(Rect r,Texture2D t,ScaleMode m,bool alphaBlend){blend=alphaBlend;ink=GUI.color;texture=t;}
}
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
  foreach(var space in new[]{ColorSpace.Gamma,ColorSpace.Linear}){
   QualitySettings.activeColorSpace=space;GUI.color=new Color(.8f,.1f,.4f,.2f);GUI.backgroundColor=new Color(.2f,.3f,.8f,.1f);
   SolidRect(new Rect(),new Color(15/255f,15/255f,16/255f,.3f),true);
   var displayed=space==ColorSpace.Linear?NativeUiAudit.ink.gamma:NativeUiAudit.ink;
   bool ok=!NativeUiAudit.blend&&NativeUiAudit.ink.a==1&&NativeUiAudit.texture==Texture2D.whiteTexture
    &&Math.Abs(displayed.r-15/255f)<.00001f&&Math.Abs(displayed.b-16/255f)<.00001f
    &&GUI.color.a==.2f&&GUI.backgroundColor.a==.1f;
   Console.WriteLine((ok?"PASS ":"FAIL ")+space+" solid face: alpha1 / no blend / no inherited tint / #0f0f10");if(!ok)fail++;
  }
  return fail==0?0:2;
 }
}
