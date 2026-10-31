using System;
using UnityEngine;
namespace Exoduser.UnityPort {
 // 게임 button 위임음. 로비의 무음 동작에는 적용하지 않는다.
 [DefaultExecutionOrder(-31000)]
 internal sealed class NativeUiSounds:MonoBehaviour {
  internal static NativeUiSounds Current;static int silentDepth;internal static bool ButtonsSilent=>silentDepth>0;
  internal static bool SilentButton(Func<bool> button){silentDepth++;try{return button();}finally{silentDepth--;}}
  internal void TabChanged(){if(allowed!=null&&allowed())audio.PlayUiTab();}
  void OnGUI(){if(Event.current.type==EventType.MouseMove){previousHovered=hovered;hovered=null;}}
  NativeFeedbackAudio audio;Func<bool> allowed;string hovered,previousHovered;double hoverAt=-1,confirmAt=-1;int pendingFrame=-1,pendingRevision;
  internal void Initialize(NativeFeedbackAudio sound,Func<bool> enabled){audio=sound;allowed=enabled;Current=this;}
  internal void BeforeButton(Rect rect,string text){
   if(ButtonsSilent||allowed==null||!allowed()||!GUI.enabled)return;
   var e=Event.current;if(e==null||e.type!=EventType.MouseMove)return;
   if(!rect.Contains(e.mousePosition))return;
   var p=GUIUtility.GUIToScreenPoint(rect.position);string id=p+"/"+rect.size+"/"+text;
   hovered=id;if(previousHovered==id)return;double now=Time.realtimeSinceStartupAsDouble;
   if(now-hoverAt<.06)return;hoverAt=now;audio.PlayUiSample("ui_button_hover",.25f);
  }
  internal void Clicked(){if(!ButtonsSilent&&allowed!=null&&allowed()){pendingFrame=Time.frameCount;pendingRevision=audio.UiRevision;}}
  void LateUpdate(){
   if(pendingFrame<0||Time.frameCount<=pendingFrame)return;pendingFrame=-1;
   double now=Time.realtimeSinceStartupAsDouble;
   if(allowed!=null&&allowed()&&pendingRevision==audio.UiRevision&&now-confirmAt>=.08){confirmAt=now;audio.PlayUiSample("ui_button_confirm",.35f);}
  }
  internal void ResetHover(){hovered=null;}
  void OnDestroy(){if(Current==this)Current=null;}
 }
}
