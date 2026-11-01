using System;
namespace Exoduser.UnityPort
{
 public struct NativeWorldChunkRange
 {
  public int CenterX,CenterY,RadiusX,RadiusY;
  public static NativeWorldChunkRange Fit(double x,double y,double halfWidth,double halfHeight){return new NativeWorldChunkRange{CenterX=(int)Math.Floor(x/1000),CenterY=(int)Math.Floor(y/1000),RadiusX=Math.Max(2,(int)Math.Ceiling(halfWidth/1000)),RadiusY=Math.Max(1,(int)Math.Ceiling(halfHeight/1000))};}
  public bool Contains(int x,int y){return Math.Abs(x-CenterX)<=RadiusX&&Math.Abs(y-CenterY)<=RadiusY;}
 }
}
