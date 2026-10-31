using UnityEngine;
namespace Exoduser.UnityPort
{
 internal static class NativeUiViewport
 {
  internal static NativeUiSafeArea Current=>NativeUiSafeArea.Fit(Screen.width,Screen.height);
  internal static Matrix4x4 Matrix {get{var a=Current;return Matrix4x4.TRS(new Vector3(a.X,a.Y,0),Quaternion.identity,new Vector3(a.Scale,a.Scale,1));}}
  internal static Vector2 Pointer(Vector3 screenPoint){var a=Current;return new Vector2(a.LocalX(screenPoint.x),a.LocalY(screenPoint.y,Screen.height));}
  // 화면별 배경/모달의 넘침도 웹과 같은 순검정으로 마감한다. 입력은 중앙 디자인 좌표에서만 받는다.
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Object.FindFirstObjectByType<Bars>()==null)new GameObject("16:9 UI safe area").AddComponent<Bars>();}
  [DefaultExecutionOrder(31990)] internal sealed class Bars:MonoBehaviour
  {
   void OnGUI(){if(Event.current.type!=EventType.Repaint)return;var a=Current;var old=GUI.matrix;var color=GUI.color;var enabled=GUI.enabled;int depth=GUI.depth;
    try{GUI.matrix=Matrix4x4.identity;GUI.color=Color.black;GUI.enabled=true;GUI.depth=-20000;
     if(a.X>0){NativeUiAudit.DrawTexture(new Rect(0,0,a.X,Screen.height),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(a.X+a.Width,0,Screen.width-a.X-a.Width,Screen.height),Texture2D.whiteTexture);}
     if(a.Y>0){NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,a.Y),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(0,a.Y+a.Height,Screen.width,Screen.height-a.Y-a.Height),Texture2D.whiteTexture);}
    }finally{GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;GUI.depth=depth;}
   }
  }
 }
}
