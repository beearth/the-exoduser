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
  internal bool UiAudioAllowed=>focused&&IsBlocking;
  void UiNavigate(string id){if(UiAudioAllowed&&(Event.current==null||!Event.current.isMouse))NativeUiSounds.Current?.Navigate(id);}
  void UiConfirm(){if(UiAudioAllowed)NativeUiSounds.Current?.Clicked();}
  bool EntrySoundButton(Rect rect){return NativeUiSounds.SilentButton(()=>NativeUiAudit.Button(rect,"",GUIStyle.none));}
  bool DecisionSoundButton(Rect rect){return NativeUiSounds.OwnSoundButton(()=>NativeUiAudit.Button(rect,"",GUIStyle.none));}
  void FocusUiControl(string id){if(GUI.GetNameOfFocusedControl()!=id){if(id!="lobby-enter"&&!id.StartsWith("visual-info-",StringComparison.Ordinal))UiNavigate(id);if(id!="lobby-enter")StopEntryHover();}GUI.FocusControl(id);}
  void MoveLobbyFocus(bool back){
   var controls=new List<string>{"lobby-language"};for(int n=0;n<2;n++)if(characterScroll+n<Characters.Count)controls.Add("character-slot-"+(characterScroll+n));
   controls.Add("character-create-card");if(Characters.SelectedIndex>=0)controls.Add("lobby-enter");controls.AddRange(new[]{"lobby-replay","lobby-steam","patch-notes-open","lobby-quit"});
   int at=controls.IndexOf(GUI.GetNameOfFocusedControl());FocusUiControl(controls[(at+(back?controls.Count-1:1)+controls.Count)%controls.Count]);
  }
  int lobbyPadFrame=-1;float lobbyPadVertical,lobbyPadHorizontal;
  Event LobbyPadEvent(Event original){
   if(AutomatedInput||!focused||original.type!=EventType.Layout||lobbyPadFrame==Time.frameCount)return original;
   lobbyPadFrame=Time.frameCount;float y=0,x=0;
   foreach(var pad in UnityEngine.InputSystem.Gamepad.all){var stick=pad.leftStick.ReadValue();var d=pad.dpad.ReadValue();if(Mathf.Abs(stick.y)>.5f)y=Mathf.Sign(stick.y);if(Mathf.Abs(stick.x)>.5f)x=Mathf.Sign(stick.x);if(Mathf.Abs(d.y)>.5f)y=Mathf.Sign(d.y);if(Mathf.Abs(d.x)>.5f)x=Mathf.Sign(d.x);}
   bool movedY=y!=0&&y!=lobbyPadVertical,movedX=x!=0&&x!=lobbyPadHorizontal;lobbyPadVertical=y;lobbyPadHorizontal=x;
   KeyCode key=KeyCode.None;
   if(ExoInput.KeyDown(KeyCode.JoystickButton0))key=KeyCode.Return;
   else if(ExoInput.KeyDown(KeyCode.JoystickButton1))key=KeyCode.Escape;
   else if(movedY)key=showLanguages?(y>0?KeyCode.UpArrow:KeyCode.DownArrow):KeyCode.Tab;
   else if(movedX)key=x>0?KeyCode.RightArrow:KeyCode.LeftArrow;
   if(key==KeyCode.None)return original;
   if(showLanguages){ProcessLanguageMenuKey(key,false);ProcessLanguageMenuKey(key,true);return original;}
   if(lobbyQuitPrompt){if(key==KeyCode.Escape){UiConfirm();lobbyQuitPrompt=false;}return original;}
   return new Event{type=EventType.KeyDown,keyCode=key,shift=movedY&&y>0};
  }
  AudioMixerGroup EntryUiGroup(){
   var mixer=Resources.Load<AudioMixer>("Audio/FrontendUI");if(mixer==null)throw new InvalidOperationException("Missing frontend UI mixer");
   foreach(var group in mixer.FindMatchingGroups("Master/UI"))if(group.name=="UI")return group;
   throw new InvalidOperationException("Missing frontend UI group");
  }
  void PrepareEntryHoverClip(){if(entryHoverClip==null){entryHoverClip=Resources.Load<AudioClip>("Audio/UI/entry_hover");entryHoverClip?.LoadAudioData();}}
  void DrawEntryHover(Rect r,bool enabled=true){
   if(Event.current.type!=EventType.Repaint)return;
   entryHoverFrame=Time.frameCount;entryHoverWanted=enabled&&GUI.enabled&&focused&&(r.Contains(Event.current.mousePosition)||GUI.GetNameOfFocusedControl()=="lobby-enter");
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
