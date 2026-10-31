using System;
namespace Exoduser.UnityPort
{
 // UI 디자인 좌표는 항상 1920x1080. 물리 화면과 포인터는 같은 원점/배율을 사용한다.
 public struct NativeUiSafeArea
 {
  public const float DesignWidth=1920,DesignHeight=1080;
  public float X,Y,Width,Height,Scale;
  public static NativeUiSafeArea Fit(float width,float height){width=Math.Max(1,width);height=Math.Max(1,height);float s=Math.Min(width/DesignWidth,height/DesignHeight);return new NativeUiSafeArea{X=(width-DesignWidth*s)/2,Y=(height-DesignHeight*s)/2,Width=DesignWidth*s,Height=DesignHeight*s,Scale=s};}
  public float LocalX(float physicalX){return (physicalX-X)/Scale;}
  public float LocalY(float bottomOriginY,float screenHeight){return (screenHeight-bottomOriginY-Y)/Scale;}
 }
 public struct NativeUiEdgeArea { public float Width,Scale; public static NativeUiEdgeArea Fit(float width,float height){float s=Math.Max(1,height)/1080f;return new NativeUiEdgeArea{Width=Math.Max(1,width)/s,Scale=s};} public float LocalX(float x){return x/Scale;} public float LocalY(float y,float height){return (height-y)/Scale;} }
 public struct NativeSkillBodyArea
 {
  public float Top,Height;
  public static NativeSkillBodyArea Fit(float width,float height){var center=NativeUiSafeArea.Fit(width,height);var edge=NativeUiEdgeArea.Fit(width,height);float top=Math.Max(308,(center.Y+300*center.Scale)/edge.Scale+8),bottom=Math.Min(974,(center.Y+998*center.Scale)/edge.Scale-24);return new NativeSkillBodyArea{Top=top,Height=Math.Max(300,bottom-top)};}
 }
}
