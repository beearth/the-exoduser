using System;
using UnityEngine;
namespace Exoduser.UnityPort {
 // Web UI samples: lobby feedback also runs while the combat simulation is stopped.
 [DefaultExecutionOrder(-31000)]
 internal sealed class NativeUiSounds:MonoBehaviour {
  internal static NativeUiSounds Current;static int silentDepth,ownDepth;internal static bool ButtonsSilent=>silentDepth>0;
  internal static bool SilentButton(Func<bool> button){silentDepth++;try{return button();}finally{silentDepth--;}}
  internal static bool OwnSoundButton(Func<bool> button){ownDepth++;try{return button();}finally{ownDepth--;}}
  internal void TabChanged(){if(allowed!=null&&allowed())audio.PlayUiTab();}
  void OnGUI(){if(Event.current.type==EventType.MouseMove){previousHovered=hovered;hovered=null;}}
  NativeFeedbackAudio audio;Func<bool> allowed,lobby;string hovered,previousHovered,lateHover;double hoverAt=double.NegativeInfinity,confirmAt=double.NegativeInfinity;int pendingFrame=-1,pendingRevision;
  internal void Initialize(NativeFeedbackAudio sound,Func<bool> enabled,Func<bool> inLobby=null){audio=sound;allowed=enabled;lobby=inLobby;Current=this;}
  internal void Navigate(string id){if(allowed==null||!allowed()||id==hovered)return;hovered=id;QueueHover(id);}
  void QueueHover(string id){lateHover=id;if(Time.realtimeSinceStartupAsDouble-hoverAt>=.06)PlayHover();}
  void PlayHover(){hoverAt=Time.realtimeSinceStartupAsDouble;lateHover=null;bool front=lobby!=null&&lobby();audio.PlayUiSample("ui_button_hover",front?.6f:.25f,1,front);}
  internal void BeforeButton(Rect rect,string text){
   if(ButtonsSilent||allowed==null||!allowed()||!GUI.enabled)return;
   var e=Event.current;if(e==null||e.type!=EventType.MouseMove)return;
   if(!rect.Contains(e.mousePosition))return;
   var p=GUIUtility.GUIToScreenPoint(rect.position);string id=p+"/"+rect.size+"/"+text;
   hovered=id;if(previousHovered==id)return;
   QueueHover(id);
  }
  internal void Clicked(){if(!ButtonsSilent&&ownDepth==0&&allowed!=null&&allowed()){pendingFrame=Time.frameCount;pendingRevision=audio.UiRevision;}}
  internal void SuppressConfirm(){pendingFrame=-1;}
  void LateUpdate(){
   if(allowed==null||!allowed()){lateHover=null;pendingFrame=-1;return;}
   if(lateHover!=null){if(hovered!=lateHover)lateHover=null;else if(Time.realtimeSinceStartupAsDouble-hoverAt>=.06)PlayHover();}
   if(pendingFrame<0||Time.frameCount<=pendingFrame)return;if(NativeDecisionSound.LastDecisionFrame>=pendingFrame){pendingFrame=-1;return;}pendingFrame=-1;
   double now=Time.realtimeSinceStartupAsDouble;
   if(pendingRevision==audio.UiRevision&&now-confirmAt>=.08){confirmAt=now;audio.PlayUiSample("ui_button_confirm",.35f,1,lobby!=null&&lobby());}
  }
  internal void ResetHover(){hovered=previousHovered=lateHover=null;}
  void OnDestroy(){if(Current==this)Current=null;}
 }
}
