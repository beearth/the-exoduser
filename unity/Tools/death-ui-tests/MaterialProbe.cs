using System;
enum ColorSpace { Gamma,Linear }
static class QualitySettings { public static ColorSpace activeColorSpace; }
static class GUI { public static Color color; }
enum TextureFormat { RGBA32,RGBAHalf }
enum FilterMode { Bilinear }
enum TextureWrapMode { Clamp }
struct Color {
 public float r,g,b,a;
 public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;}
 static float Decode(float c){return c<=.04045f?c/12.92f:(float)Math.Pow((c+.055f)/1.055f,2.4);}
 public Color linear=>new Color(Decode(r),Decode(g),Decode(b),a);
 public static Color Lerp(Color a,Color b,float t)=>new Color(a.r+(b.r-a.r)*t,a.g+(b.g-a.g)*t,a.b+(b.b-a.b)*t,a.a+(b.a-a.a)*t);
}
static class Mathf {
 public static float Clamp01(float x)=>Math.Max(0,Math.Min(1,x));
 public static float Sqrt(float x)=>(float)Math.Sqrt(x);
}
class Texture2D {
 public bool Linear;public TextureFormat Format;public Color[] Pixels;public string name;public FilterMode filterMode;public TextureWrapMode wrapMode;
 public Texture2D(int w,int h,TextureFormat f,bool mip,bool linear=false){Linear=linear;Format=f;}
 public void SetPixels(Color[] p){Pixels=p;}public void Apply(bool m,bool r){}
}
static class MaterialProbe {
 static Texture2D plateBase,plateEdgeV,plateEdgeH,plateHaze;
 /*PRODUCTION*/
 static float Encode(float c)=>c<=.0031308f?12.92f*c:1.055f*(float)Math.Pow(c,1/2.4f)-.055f;
 static int Main(){
  int failures=0;
  foreach(var space in new[]{ColorSpace.Linear,ColorSpace.Gamma}){
   QualitySettings.activeColorSpace=space;plateBase=null;PlateTextures();
   // IMGUI texture blit is unlit: store scene-linear samples explicitly in Linear,
   // so a final display encoding cannot turn 9..22/255 iron into 53..83/255 gray.
   float low=1,high=0;foreach(var p in plateBase.Pixels){float displayed=space==ColorSpace.Linear?Encode(p.r):p.r;low=Math.Min(low,displayed);high=Math.Max(high,displayed);}
   PlateTint(new Color(140/255f,123/255f,90/255f,.24f));
   float tint=space==ColorSpace.Linear?Encode(GUI.color.r):GUI.color.r;
   bool ok=plateBase.Linear&&plateBase.Format==TextureFormat.RGBAHalf&&low>=8/255f&&high<=23/255f&&Math.Abs(tint-140/255f)<.0001f&&GUI.color.a==.24f;
   Console.WriteLine((ok?"PASS ":"FAIL ")+space+" iron display range="+(low*255).ToString("F2")+".."+(high*255).ToString("F2"));if(!ok)failures++;
  }
  return failures==0?0:2;
 }
}
