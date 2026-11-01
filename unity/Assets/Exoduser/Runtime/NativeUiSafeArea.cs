using System;
namespace Exoduser.UnityPort
{
 public struct NativeUiSafeArea
 {
  public const float DesignWidth=1920,DesignHeight=1080;
  public float X,Y,Width,Height,Scale;
  public static NativeUiSafeArea Fit(float width,float height){width=Math.Max(1,width);height=Math.Max(1,height);float s=Math.Min(width/DesignWidth,height/DesignHeight);return new NativeUiSafeArea{X=(width-DesignWidth*s)/2,Y=(height-DesignHeight*s)/2,Width=DesignWidth*s,Height=DesignHeight*s,Scale=s};}
 }
 public struct NativeUiEdgeArea
 {
  public float Width,Scale;
  public static NativeUiEdgeArea Fit(float width,float height){float s=Math.Max(1,height)/1080f;return new NativeUiEdgeArea{Width=Math.Max(1,width)/s,Scale=s};}
 }
}
