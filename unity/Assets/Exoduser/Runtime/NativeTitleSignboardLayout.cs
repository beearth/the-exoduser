using System;
namespace Exoduser.UnityPort
{
 internal struct NativeTitleSignboardLayout
 {
  internal double X,Y,Width,Height;
  internal static NativeTitleSignboardLayout Cover(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);
   double scale=Math.Max(width/2036d,height/1016d),w=2036*scale,h=1016*scale;
   return new NativeTitleSignboardLayout{X=(width-w)/2,Y=(height-h)/2,Width=w,Height=h};
  }
  internal static NativeTitleSignboardLayout Buffer(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);
   double scale=Math.Min(1,Math.Min(3840d/width,2160d/height));
   return new NativeTitleSignboardLayout{Width=Math.Max(1,Math.Round(width*scale)),Height=Math.Max(1,Math.Round(height*scale))};
  }
  internal static NativeTitleSignboardLayout Menu(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);double scale=Math.Min(width/1920d,height/1080d);
   return new NativeTitleSignboardLayout{X=Math.Max(48,height*.045)-96*scale,Y=(height-1080*scale)/2,Width=scale,Height=scale};
  }
  internal static double Advance(double time,double delta,bool paused)=>time+(paused?0:Math.Max(0,Math.Min(.1,delta)));
 }
}
