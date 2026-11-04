
namespace Exoduser.UnityPort {
 // Presentation policy only. A/B stays opt-in until the same Player passes visual review.
 public static class NativeRigPixelPolicy {
  public static bool Requested(string[] args){
   bool enabled=false;if(args==null)return false;
   for(int i=0;i<args.Length;i++){
    string value=null;
    if(args[i]!=null&&args[i].StartsWith("--hero-render=",System.StringComparison.Ordinal))value=args[i].Substring(14);
    else if(args[i]=="--hero-render"&&i+1<args.Length)value=args[++i];
    if(value!=null)enabled=value=="rigpixel";
   }
   return enabled;
  }
  public static int TexelScale(int screenHeight){return System.Math.Max(1,screenHeight/1080);}
  public static int TextureSize(float worldUnitsPerPixel,int texelScale,float worldExtent){return TextureSize(worldUnitsPerPixel,texelScale,worldExtent,1024);}
  public static int TextureSize(float worldUnitsPerPixel,int texelScale,float worldExtent,int maxPixels){
   if(float.IsNaN(worldUnitsPerPixel)||float.IsInfinity(worldUnitsPerPixel)||worldUnitsPerPixel<=0||texelScale<1||worldExtent<=0)return 0;
   double pixels=System.Math.Ceiling(worldExtent/(worldUnitsPerPixel*texelScale)/32d)*32;
   if(pixels>maxPixels)return 0; // Fall back instead of clipping the greatsword or changing pixel scale.
   return System.Math.Max(64,(int)pixels);
  }
  // Enemy-only: keep the world canvas/foot anchor; reduce sampling density only for this frame when needed.
  public const int EnemyMaxRt=2048;
  public static int EnemyTextureSize(float worldUnitsPerPixel,int baseTexelScale,float boxPixels,out float texelScale){
   texelScale=baseTexelScale;
   if(float.IsNaN(worldUnitsPerPixel)||float.IsInfinity(worldUnitsPerPixel)||worldUnitsPerPixel<=0||baseTexelScale<1||float.IsNaN(boxPixels)||float.IsInfinity(boxPixels)||boxPixels<=0)return 0;
   // World units cancel. Divide in double before padding/rounding so finite float inputs cannot overflow.
   // A floating-point power-of-two multiplier also avoids int overflow for extreme projected boxes.
   for(;;){double pixels=System.Math.Ceiling((boxPixels/(double)texelScale+4)/32)*32;if(pixels<=EnemyMaxRt)return System.Math.Max(64,(int)pixels);texelScale*=2;}
  }
  // Druid-only: RT cap 2048; when the box is still too large this frame, double the texel scale (pixel size x2) until it fits. Never 0 for a finite box, never throws.
  public const int DruidMaxRt=2048;
  public static int DruidCanvas(float worldUnitsPerPixel,int baseTexelScale,float boxPixels,out int texelScale){
   texelScale=System.Math.Max(1,baseTexelScale);
   if(float.IsNaN(worldUnitsPerPixel)||float.IsInfinity(worldUnitsPerPixel)||worldUnitsPerPixel<=0||float.IsNaN(boxPixels)||float.IsInfinity(boxPixels)||boxPixels<=0)return 0;
   for(int n=0;n<24;n++){int size=TextureSize(worldUnitsPerPixel,texelScale,(boxPixels+4*texelScale)*worldUnitsPerPixel,DruidMaxRt);if(size>0)return size;texelScale*=2;}
   return 0;
  }
 }
}
