using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeHud
 {
  // 기존 구슬·스킬바 원화만 사용한다. 상태 글자의 위치는 슬롯 위 고정이다.
  Rect DockStatusRect(NativeHudDockLayout dock,float width)
  {return new Rect(width*.5f-180,dock.VisibleBar.y-25,360,20);}
 }
}
