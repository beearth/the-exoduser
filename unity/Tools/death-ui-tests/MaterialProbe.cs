using System;
using System.Collections.Generic;
class Texture2D{public string name;public Texture2D(string name=""){this.name=name;}}
static class Debug{public static void Log(string s){Console.WriteLine(s);}}
struct Color{public float r,g,b,a;public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;}public static Color white=>new Color(1,1,1,1);}
struct Rect{public float x,y,width,height;public Rect(float x,float y,float w,float h){this.x=x;this.y=y;width=w;height=h;}}
static class Mathf{public static float Min(float a,float b)=>Math.Min(a,b);public static float Clamp01(float x)=>Math.Max(0,Math.Min(1,x));}
static class GUI{public static Color color;}
static class Screen{public static int height=1080;}
static class Resources{public static T Load<T>(string name) where T:class=>new Texture2D(name) as T;}
static class NativeUiAudit{
 public static int clip;public static bool glowClipped=true;public static float glowAlpha;
 public static void Region(Rect r,string s){}
 public static void BeginGroup(Rect r){clip++;}
 public static void EndGroup(){clip--;}
 public static void DrawTexture(Rect r,Texture2D t){glowClipped&=clip>0;glowAlpha=GUI.color.a;}
}
class GUIStyleState{public Texture2D background;public Texture2D[] scaledBackgrounds=Array.Empty<Texture2D>();}
class GUIStyle{
 public static GUIStyle none=new GUIStyle();public string name="test";public int fontSize=23,padding=7;
 public GUIStyleState normal=new GUIStyleState(),hover=new GUIStyleState(),active=new GUIStyleState(),focused=new GUIStyleState(),onNormal=new GUIStyleState(),onHover=new GUIStyleState(),onActive=new GUIStyleState(),onFocused=new GUIStyleState();
}
static class MaterialProbe{
 static int StrippedStates;static readonly HashSet<Texture2D> skinTextures=new HashSet<Texture2D>();static void RememberStock(){}
 static Texture2D plaque,primaryPlaque,chipOne,chipTwo,innerButtonGlow;internal static string ReviewState;
 static string face;static Color tint;static bool sliced;
 static void Slice(Rect r,Texture2D t,float sx,float sy,float ex,float ey,bool center){face=t.name;tint=GUI.color;sliced=sx==174&&sy==0&&ex==40&&ey==0&&center;}
 /*PRODUCTION*/
 static int Main(){
  int fail=0;var native=new Texture2D("skin");skinTextures.Add(native);
  var style=new GUIStyle();var states=new[]{style.normal,style.hover,style.active,style.focused,style.onNormal,style.onHover,style.onActive,style.onFocused};
  foreach(var state in states){state.background=native;state.scaledBackgrounds=new[]{native};}
  ClearBackgrounds(style);
  foreach(var state in states){if(state.background!=null)fail++;
#if UNITY_EDITOR
   if(state.scaledBackgrounds[0]!=null)fail++;
#endif
  }
  if(StrippedStates!=8||style.fontSize!=23||style.padding!=7)fail++;
  var art=new Texture2D("artist-painted");style.normal.background=art;style.normal.scaledBackgrounds=new[]{native,art};ClearBackgrounds(style);
  if(style.normal.background!=art)fail++;
#if UNITY_EDITOR
  if(style.normal.scaledBackgrounds[0]!=null||style.normal.scaledBackgrounds[1]!=art)fail++;
#endif
  Console.WriteLine((fail==0?"PASS ":"FAIL ")+"only stock skin removed; authored backgrounds and typography preserved");
  foreach(bool primary in new[]{false,true})foreach(string state in new[]{"normal","hover","selected","disabled"})foreach(bool pressed in new[]{false,true}){
   ReviewState=state;GUI.color=new Color(.2f,.3f,.4f,.25f);NativeUiAudit.glowAlpha=0;NativeUiAudit.glowClipped=true;
   ActionPlate(new Rect(100,200,400,76),primary,0,pressed);
   bool ok=sliced&&face.EndsWith(primary?"btn_primary_composed":"btn_plaque_20261029")&&tint.r==1&&tint.g==1&&tint.b==1&&tint.a==1
    &&GUI.color.r==.2f&&GUI.color.a==.25f&&NativeUiAudit.clip==0&&NativeUiAudit.glowClipped;
   bool focused=state=="hover"||state=="selected";ok&=focused?NativeUiAudit.glowAlpha==.18f:NativeUiAudit.glowAlpha==0;
   if(!ok){Console.WriteLine("FAIL art state "+primary+"/"+state+"/"+pressed);fail++;}
  }
  Console.WriteLine((fail==0?"PASS ":"FAIL ")+"original artwork slices; brightness1.0 all states; clipped inner hover only");
  foreach(var size in new[]{new Rect(0,0,70,34),new Rect(0,0,300,30),new Rect(0,0,159,80)})foreach(int height in new[]{1080,1440}){
   Screen.height=height;ReviewState="normal";ActionPlate(size,false,0,false);
   if(!face.EndsWith(height>1080?"btn_chip_2x":"btn_chip_1x")||tint.r!=1||tint.g!=1||tint.b!=1||tint.a!=1)fail++;
  }
  Console.WriteLine((fail==0?"PASS ":"FAIL ")+"compact faces use prescaled thorn-free art at brightness1.0");
  return fail==0?0:2;
 }
}
