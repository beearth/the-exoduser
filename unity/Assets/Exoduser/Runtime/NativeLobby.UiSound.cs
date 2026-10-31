using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  sealed class EntryHoverVoice{public AudioSource source;public float start,stop=-1,releaseGain;}
  readonly List<EntryHoverVoice> entryHoverVoices=new List<EntryHoverVoice>();AudioClip entryHoverClip;
  bool entryHoverWanted,entryHoverPrevious;int entryHoverFrame=-10;
  internal int EntryAudioEvents {get;private set;}
  AudioMixerGroup EntryUiGroup(){
   var mixer=Resources.Load<AudioMixer>("Audio/FrontendUI");if(mixer==null)throw new InvalidOperationException("Missing frontend UI mixer");
   foreach(var group in mixer.FindMatchingGroups("Master/UI"))if(group.name=="UI")return group;
   throw new InvalidOperationException("Missing frontend UI group");
  }
  void PrepareEntryHoverClip(){if(entryHoverClip==null){entryHoverClip=Resources.Load<AudioClip>("Audio/UI/entry_hover");entryHoverClip?.LoadAudioData();}}
  void DrawEntryHover(Rect r,bool enabled=true){
   if(Event.current.type!=EventType.Repaint)return;
   entryHoverFrame=Time.frameCount;entryHoverWanted=enabled&&GUI.enabled&&focused&&r.Contains(Event.current.mousePosition);
  }
  void UpdateEntryUiAudio(float dt){
   bool wanted=entryHoverWanted&&focused&&entryHoverFrame>=Time.frameCount-1&&IsBlocking;float now=Time.unscaledTime;
   if(wanted!=entryHoverPrevious){
    // 웹 _startHover는 이전 루프를 80ms로 내리고 새 소스는 첫 샘플부터 100ms로 올린다.
    foreach(var voice in entryHoverVoices)if(voice.stop<0){voice.stop=now;voice.releaseGain=voice.source.volume;}
    if(wanted){PrepareEntryHoverClip();if(entryHoverClip!=null){var audio=gameObject.AddComponent<AudioSource>();audio.playOnAwake=false;audio.loop=true;audio.spatialBlend=0;audio.outputAudioMixerGroup=EntryUiGroup();audio.clip=entryHoverClip;audio.volume=0;audio.Play();entryHoverVoices.Add(new EntryHoverVoice{source=audio,start=now});}}
    entryHoverPrevious=wanted;
   }
   for(int i=entryHoverVoices.Count-1;i>=0;i--){var voice=entryHoverVoices[i];voice.source.volume=voice.stop<0?.7f*Mathf.Clamp01((now-voice.start)/.1f):voice.releaseGain*Mathf.Clamp01(1-(now-voice.stop)/.08f);if(voice.stop>=0&&now-voice.stop>=.1f){voice.source.Stop();Destroy(voice.source);entryHoverVoices.RemoveAt(i);}}
  }
  void StopEntryHover(){entryHoverWanted=false;entryHoverFrame=-10;}
 }
}
