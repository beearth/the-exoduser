
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
  public static string HeroResource(int visual){return visual==1?"Characters/Silvertail":visual==2?"Characters/Ivan":"Characters/Warrior";}
  public static bool ReviewSelectionAllowed(string[] args,int visual){
   if(visual==0)return true;
   if((visual!=1&&visual!=2)||!Requested(args)||args==null)return false;
   for(int i=0;i<args.Length-1;i++)if(args[i]=="--unity-qa-sandbox"&&!string.IsNullOrWhiteSpace(args[i+1])&&!args[i+1].StartsWith("-"))return true;
   return false;
  }
  public static int TexelScale(int screenHeight){return System.Math.Max(1,screenHeight/1080);}
  public static int TextureSize(float worldUnitsPerPixel,int texelScale,float worldExtent){
   if(float.IsNaN(worldUnitsPerPixel)||float.IsInfinity(worldUnitsPerPixel)||worldUnitsPerPixel<=0||texelScale<1||worldExtent<=0)return 0;
   double pixels=System.Math.Ceiling(worldExtent/(worldUnitsPerPixel*texelScale)/32d)*32;
   if(pixels>1024)return 0; // Fall back instead of clipping the greatsword or changing pixel scale.
   return System.Math.Max(64,(int)pixels);
  }
 }
}
