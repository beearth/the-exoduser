using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  WarriorStoryState warriorStory;
  [Serializable] sealed class WarriorStoryData {public string video;public double[] cuts;public LobbyCaptionLanguage[] captions;}
  WarriorStoryData warriorStoryData;
  GUIStyle warriorCaption;
  int warriorSlot=-1;
  bool warriorDecoderClosed;
  string warriorError="";
  public bool CharacterStoryActive {get{return warriorStory!=null&&warriorStory.Active;}}
  public bool CharacterStoryEntering {get{return CharacterStoryActive&&warriorStory.Entering;}}
  public bool CharacterStorySeen {get{return warriorStory!=null&&warriorStory.Seen;}}
  public double CharacterStoryHoldProgress {get{return warriorStory==null?0:warriorStory.HoldProgress;}}
  bool ShouldPlayCharacterStory {get{return !AutomatedInput||Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-character-story-smoke")>=0;}}
  void BeginCreatedCharacterStory()
  {
   if(!ShouldPlayCharacterStory)return;
   if(warriorStoryData==null){var source=Resources.Load<TextAsset>("Data/warrior_story");if(source!=null)warriorStoryData=JsonUtility.FromJson<WarriorStoryData>(source.text);}
   if(warriorStoryData==null||warriorStoryData.cuts==null){characterError=K("캐릭터는 저장됐지만 이야기 자료를 읽지 못했습니다.","The character was saved, but story data could not be loaded.");return;}
   if(warriorStory==null)warriorStory=new WarriorStoryState(warriorStoryData.cuts);
   if(!warriorStory.Begin(Characters.SelectedName))return;
   warriorSlot=Characters.SelectedIndex;warriorDecoderClosed=false;warriorError="";SubtitleText="";frontendPad.Reset();
   StopMusic();movie.Open(warriorStoryData.video,false,false,false);movie.Volume(1);
  }
  public void NextCharacterStory(){if(!CharacterStoryActive||warriorStory.Entering||!movie.Prepared)return;if(frontendPadQaEnabled)FrontendPadQaStoryNextConsumptions++;double next=warriorStory.Next(movie.Time);if(next<0)warriorStory.Finish(true);else movie.Seek(next);}
  public void HoldCharacterStory(string source,bool held){if(warriorStory!=null)warriorStory.SetHeld(source,held);}
  void CancelCharacterStory(){if(warriorStory!=null)warriorStory.Cancel();warriorSlot=-1;SubtitleText="";frontendPad.Reset();}
  void UpdateCharacterStory(float delta)
  {
   if(!CharacterStoryActive)return;
   if(!warriorStory.Entering){
    if(movie.Error.Length>0){warriorError=movie.Error;warriorStory.Finish(false);}
    else if(movie.Ended)warriorStory.Finish(true);
    var pad=frontendPad.Step(FrontendPadPhase.Story,ReadFrontendPadFrame(),!AutomatedInput&&!characterInputFence);
    HoldCharacterStory("pad-skip",pad.Hold);
    if(!AutomatedInput&&!characterInputFence){
     if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)||ExoInput.KeyDown(KeyCode.RightArrow)||ExoInput.KeyDown(KeyCode.Space)||pad.Next)NextCharacterStory();
     HoldCharacterStory("keyboard-Escape",ExoInput.Key(KeyCode.Escape));HoldCharacterStory("keyboard-Space",ExoInput.Key(KeyCode.Space));
     if(!ExoInput.Mouse(0))HoldCharacterStory("pointer",false);
    }
    SubtitleText="";foreach(var language in warriorStoryData.captions)if(language.code==Language){foreach(var cue in language.cues)if(movie.Time>=cue.start&&movie.Time<cue.end){SubtitleText=cue.text;break;}break;}
   }
   warriorStory.Tick(delta,movie.Time,focused);
   if(warriorStory.Entering&&!warriorDecoderClosed){movie.Close();warriorDecoderClosed=true;SubtitleText="";}
   if(warriorStory.EntryReady){
    string name=warriorStory.Name;bool valid=Characters.SelectedIndex==warriorSlot&&Characters.NameAt(warriorSlot)==name;
    CancelCharacterStory();characterInputFence=true;
    if(valid)BeginCharacterEntry(true);else ShowLobby();
   }
  }
  void DrawCharacterStory()
  {
   if(warriorStory.Entering){DrawEntryLoadingLogo();if(warriorError.Length>0)Label(new Rect(360,580,1200,70),K("이야기 영상을 재생하지 못했습니다. 캐릭터 목록은 보존됩니다.","The story could not play. Your character list is preserved."),normal,TextAnchor.MiddleCenter);return;}
   DrawMovie(new Rect(0,0,1920,1080),null,false);
   if(warriorCaption==null){warriorCaption=new GUIStyle(normal){font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold"),fontSize=36,alignment=TextAnchor.MiddleCenter,wordWrap=true};warriorCaption.normal.textColor=Color.white;}
   if(SubtitleText.Length>0){var box=new Rect(180,864,1560,120);Fill(box,new Color(0,0,0,.64f));Label(box,SubtitleText,warriorCaption,TextAnchor.MiddleCenter);CaptionVisible=true;}
   Rect next=new Rect(1050,1000,360,52),skip=new Rect(1430,1000,440,52);var e=Event.current;
   if(warriorStory.HintsOpacity>0){bool pad=frontendPadQaEnabled||ExoInput.PadConnected;Color hintColor=GUI.color;GUI.color=new Color(hintColor.r,hintColor.g,hintColor.b,(float)warriorStory.HintsOpacity);Label(next,pad?K("다음 대사 · A / Enter","Next line · A / Enter"):K("다음 대사 · Enter","Next line · Enter"),small,TextAnchor.MiddleCenter);Label(skip,pad?K("건너뛰기 · B / Start 길게","Skip · Hold B / Start"):K("건너뛰기 · Space / Esc 길게","Skip · Hold Space / Esc"),small,TextAnchor.MiddleCenter);Fill(new Rect(skip.x,1054,skip.width*(float)warriorStory.HoldProgress,3),new Color(.8f,.72f,.55f));GUI.color=hintColor;}
   if(!AutomatedInput&&e.type==EventType.MouseDown&&e.button==0){if(!warriorStory.HintsHidden&&skip.Contains(e.mousePosition))HoldCharacterStory("pointer",true);else NextCharacterStory();e.Use();}
   if(!AutomatedInput&&e.type==EventType.MouseDrag&&!skip.Contains(e.mousePosition))HoldCharacterStory("pointer",false);
   if(e.isKey)e.Use();
  }
 }
}
