using System;
using UnityEngine;
using UnityEngine.Video;

namespace Exoduser.UnityPort {
 // `--unity-mute` (every automated run from the shared launcher): silence the whole Player, whatever mode it runs in.
 // 11-03: the flag was only honoured by the M1 smoke and the per-capture EarlyMute hooks, so the UI overlap check played
 // lobby music and video on the user's speakers. The listener volume is forced to 0 at load and again after every frame,
 // and Direct video audio (which does not pass through the listener) is muted per track. Without the flag nothing changes.
 public static class NativeMuteGuard {
  public static bool Active => Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-mute") >= 0;
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void Install(){
   if(!Active)return;
   AudioListener.volume=0;
   var host=new GameObject("EXODUSER Mute Guard");host.hideFlags=HideFlags.HideAndDontSave;UnityEngine.Object.DontDestroyOnLoad(host);host.AddComponent<Enforcer>();
  }
  [DefaultExecutionOrder(int.MaxValue)]
  sealed class Enforcer : MonoBehaviour {
   float nextVideoScan;
   void LateUpdate(){
    AudioListener.volume=0;
    if(Time.unscaledTime<nextVideoScan)return;
    nextVideoScan=Time.unscaledTime+.25f;
    foreach(var video in FindObjectsByType<VideoPlayer>(FindObjectsSortMode.None)){
     if(video.audioOutputMode!=VideoAudioOutputMode.Direct)continue;
     for(ushort track=0;track<video.audioTrackCount;track++)if(!video.GetDirectAudioMute(track))video.SetDirectAudioMute(track,true);
    }
   }
  }
 }
}
