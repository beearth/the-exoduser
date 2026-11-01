using System;
namespace Exoduser.UnityPort
{
 internal struct NativeTitleSignboardLayout
 {
  internal double X,Y,Width,Height;
  internal static NativeTitleSignboardLayout Cover(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);
   double scale=Math.Max(width/7680d,height/2160d),w=7680*scale,h=2160*scale;
   return new NativeTitleSignboardLayout{X=(width-w)/2,Y=(height-h)/2,Width=w,Height=h};
  }
  internal static NativeTitleSignboardLayout Buffer(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);
   double scale=Math.Min(1,Math.Min(5760d/width,2160d/height));
   return new NativeTitleSignboardLayout{Width=Math.Max(1,Math.Round(width*scale)),Height=Math.Max(1,Math.Round(height*scale))};
  }
  internal static double Advance(double time,double delta,bool paused)=>time+(paused?0:Math.Max(0,Math.Min(.1,delta)));
 }
}
