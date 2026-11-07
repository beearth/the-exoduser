using System;
namespace Exoduser.UnityPort
{
 internal struct NativeTitleSignboardLayout
 {
  // 32:9 master (2026-11-07): 16:9/21:9 screens crop the centre, where the untouched 1920x1080 10-28 Kling original sits at x=960.
  internal const int VideoW=3840,VideoH=1080;
  internal double X,Y,Width,Height;
  internal static NativeTitleSignboardLayout Cover(int width,int height)
  {
   width=Math.Max(1,width);height=Math.Max(1,height);
   double scale=Math.Max(width/(double)VideoW,height/(double)VideoH),w=VideoW*scale,h=VideoH*scale;
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
  internal static int VideoWidth(int width,int height)=>VideoW;
  internal static string VideoFile(int width)=>"title_motion_1028_superwide_20261107.mp4";
  internal static double Advance(double time,double delta,bool paused)=>time+(paused?0:Math.Max(0,Math.Min(.1,delta)));
 }
}
