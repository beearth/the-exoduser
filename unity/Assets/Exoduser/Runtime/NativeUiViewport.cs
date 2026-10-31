using UnityEngine;
namespace Exoduser.UnityPort
{
 internal static class NativeUiViewport
 {
  internal static NativeUiSafeArea Current=>NativeUiSafeArea.Fit(Screen.width,Screen.height);
  internal static Matrix4x4 Matrix {get{var a=Current;return Matrix4x4.TRS(new Vector3(a.X,a.Y,0),Quaternion.identity,new Vector3(a.Scale,a.Scale,1));}}
  internal static Vector2 Pointer(Vector3 screenPoint){var a=Current;return new Vector2(a.LocalX(screenPoint.x),a.LocalY(screenPoint.y,Screen.height));}
  internal static void FillScreen(Color tint){var old=GUI.matrix;var color=GUI.color;try{GUI.matrix=Matrix4x4.identity;GUI.color=tint;NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Texture2D.whiteTexture);}finally{GUI.matrix=old;GUI.color=color;}}
  // 로비 페인트의 마지막에 직접 호출한다. 별도 Host의 초기화/메시지 순서에 의존하지 않는다.
  internal static void MaskFrontend()
  {
   var a=Current;var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try{GUI.matrix=Matrix4x4.identity;GUI.color=Color.black;GUI.enabled=true;
    if(a.X>0){NativeUiAudit.DrawTexture(new Rect(0,0,a.X,Screen.height),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(a.X+a.Width,0,Screen.width-a.X-a.Width,Screen.height),Texture2D.whiteTexture);}
    if(a.Y>0){NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,a.Y),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(0,a.Y+a.Height,Screen.width,Screen.height-a.Y-a.Height),Texture2D.whiteTexture);}
   }finally{GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
 }
}
