using System;
using UnityEngine;
using UnityEngine.Audio;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  AudioSource entryHoverAudio;float entryHoverGain;bool entryHoverWanted;int entryHoverFrame=-10;
  internal int EntryAudioEvents {get;private set;}
  AudioMixerGroup EntryUiGroup(){
   var mixer=Resources.Load<AudioMixer>("Audio/FrontendUI");if(mixer==null)throw new InvalidOperationException("Missing frontend UI mixer");
   foreach(var group in mixer.FindMatchingGroups("Master/UI"))if(group.name=="UI")return group;
   throw new InvalidOperationException("Missing frontend UI group");
  }
  void DrawEntryHover(Rect r,bool enabled=true){
   if(Event.current.type!=EventType.Repaint)return;
   entryHoverFrame=Time.frameCount;entryHoverWanted=enabled&&GUI.enabled&&focused&&r.Contains(Event.current.mousePosition);
  }
  void UpdateEntryUiAudio(float dt){
   bool wanted=entryHoverWanted&&focused&&entryHoverFrame>=Time.frameCount-1&&IsBlocking;
   if(wanted&&entryHoverAudio==null){entryHoverAudio=gameObject.AddComponent<AudioSource>();entryHoverAudio.playOnAwake=false;entryHoverAudio.loop=true;entryHoverAudio.spatialBlend=0;entryHoverAudio.outputAudioMixerGroup=EntryUiGroup();entryHoverAudio.clip=Resources.Load<AudioClip>("Audio/UI/entry_hover");}
   if(entryHoverAudio==null)return;
   if(wanted&&!entryHoverAudio.isPlaying){entryHoverAudio.volume=0;entryHoverAudio.Play();}
   entryHoverGain=Mathf.MoveTowards(entryHoverGain,wanted?.7f:0,dt*.7f/(wanted?.1f:.08f));entryHoverAudio.volume=entryHoverGain;
   if(!wanted&&entryHoverGain<=0)entryHoverAudio.Stop();
  }
  void StopEntryHover(){entryHoverWanted=false;entryHoverFrame=-10;}
 }
}
