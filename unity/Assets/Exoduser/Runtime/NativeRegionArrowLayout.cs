using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort
{
 public static class NativeRegionArrowLayout
 {
  // Fit the complete rotated image/glow/label footprint, rather than moving only its pivot.
  public static bool TryPlace(float preferredX,float preferredY,NativeFloatingTextLayout.Box area,NativeFloatingTextLayout.Box footprint,IList<NativeFloatingTextLayout.Box> blocks,float gap,out float x,out float y)
  {
   x=y=0;float minX=area.X-footprint.X,maxX=area.X+area.Width-footprint.X-footprint.Width,minY=area.Y-footprint.Y,maxY=area.Y+area.Height-footprint.Y-footprint.Height;
   if(maxX<minX||maxY<minY)return false;
   var xs=new List<float>{Clamp(preferredX,minX,maxX),minX,maxX};var ys=new List<float>{Clamp(preferredY,minY,maxY),minY,maxY};
   foreach(var b in blocks){xs.Add(Clamp(b.X-gap-footprint.X-footprint.Width,minX,maxX));xs.Add(Clamp(b.X+b.Width+gap-footprint.X,minX,maxX));ys.Add(Clamp(b.Y-gap-footprint.Y-footprint.Height,minY,maxY));ys.Add(Clamp(b.Y+b.Height+gap-footprint.Y,minY,maxY));}
   float best=float.MaxValue;
   foreach(float cx in xs)foreach(float cy in ys){var paint=new NativeFloatingTextLayout.Box(cx+footprint.X,cy+footprint.Y,footprint.Width,footprint.Height);bool fits=true;foreach(var b in blocks)if(paint.Overlaps(new NativeFloatingTextLayout.Box(b.X-gap,b.Y-gap,b.Width+2*gap,b.Height+2*gap))){fits=false;break;}if(!fits)continue;float dx=cx-preferredX,dy=cy-preferredY,score=dx*dx+dy*dy;if(score<best){best=score;x=cx;y=cy;}}
   return best<float.MaxValue;
  }
  static float Clamp(float v,float min,float max){return Math.Max(min,Math.Min(max,v));}
 }
}
