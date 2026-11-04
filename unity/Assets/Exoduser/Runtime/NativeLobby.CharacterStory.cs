using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  WarriorStoryState warriorStory;
  [Serializable] sealed class WarriorStoryData {public string video;public double[] cuts;public LobbyCaptionLanguage[] captions;public WarriorStoryControls[] controls;}
  [Serializable] sealed class WarriorStoryControls {public string code;public string[] labels;}
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
   if(!ShouldPlayCharacterStory)return;if(TransitionPage("create-story",()=>BeginCreatedCharacterStory(),true))return;
   if(warriorStoryData==null){var source=Resources.Load<TextAsset>("Data/warrior_story");if(source!=null)warriorStoryData=JsonUtility.FromJson<WarriorStoryData>(source.text);}
   if(warriorStoryData==null||warriorStoryData.cuts==null){characterError=K("캐릭터는 저장됐지만 이야기 자료를 읽지 못했습니다.","The character was saved, but story data could not be loaded.");return;}
   if(warriorStory==null)warriorStory=new WarriorStoryState(warriorStoryData.cuts);
   if(!warriorStory.Begin(Characters.SelectedName))return;
   warriorSlot=Characters.SelectedIndex;warriorDecoderClosed=false;warriorError="";SubtitleText="";frontendPad.Reset();
   StopMusic();movie.Open(warriorStoryData.video,false,false,false);movie.Volume(1);
  }
  public void NextCharacterStory(){if(!CharacterStoryActive||warriorStory.Entering||!movie.Prepared)return;if(frontendPadQaEnabled)FrontendPadQaStoryNextConsumptions++;double next=warriorStory.Next(movie.Time);if(next<0)FinishCharacterStory(true);else movie.Seek(next);}
  public void HoldCharacterStory(string source,bool held){if(warriorStory!=null)warriorStory.SetHeld(source,held);}
  string CharacterStoryControl(int index){WarriorStoryControls selected=null,english=null;if(warriorStoryData!=null&&warriorStoryData.controls!=null)foreach(var row in warriorStoryData.controls){if(row.code==Language)selected=row;if(row.code=="en")english=row;}var labels=(selected??english)?.labels;return labels!=null&&index>=0&&index<labels.Length?labels[index]:"";}
  void CancelCharacterStory(){if(warriorStory!=null)warriorStory.Cancel();warriorSlot=-1;SubtitleText="";frontendPad.Reset();}
  void UpdateCharacterStory(float delta)
  {
   if(!CharacterStoryActive)return;
   if(!warriorStory.Entering){
    if(movie.Error.Length>0){warriorError=movie.Error;FinishCharacterStory(false);}
    else if(movie.Ended||(movie.Prepared&&movie.Duration>0&&movie.Duration-movie.Time<=.6))FinishCharacterStory(true);
    var pad=frontendPad.Step(FrontendPadPhase.Story,ReadFrontendPadFrame(),!AutomatedInput&&!characterInputFence);
    HoldCharacterStory("pad-skip",pad.Hold);
    if(!AutomatedInput&&!characterInputFence){
     if(LobbyKeys.Down(KeyCode.Return)||LobbyKeys.Down(KeyCode.KeypadEnter)||LobbyKeys.Down(KeyCode.RightArrow)||LobbyKeys.Down(KeyCode.Space)||pad.Next)NextCharacterStory();
     HoldCharacterStory("keyboard-Escape",LobbyKeys.Held(KeyCode.Escape));HoldCharacterStory("keyboard-Space",LobbyKeys.Held(KeyCode.Space));
     if(!ExoInput.Mouse(0))HoldCharacterStory("pointer",false);
    }
    SubtitleText="";foreach(var language in warriorStoryData.captions)if(language.code==Language){foreach(var cue in language.cues)if(movie.Time>=cue.start&&movie.Time<cue.end){SubtitleText=cue.text;break;}break;}
   }
   warriorStory.Tick(delta,movie.Time,focused,false);if(warriorStory.HoldProgress>=1)FinishCharacterStory(true);
   if(warriorStory.Entering&&!warriorDecoderClosed){movie.Close();warriorDecoderClosed=true;SubtitleText="";}
   if(warriorStory.Entering&&!NativeScreenTransition.Busy){
    string name=warriorStory.Name;bool valid=Characters.SelectedIndex==warriorSlot&&Characters.NameAt(warriorSlot)==name;
    CancelCharacterStory();characterInputFence=true;
    if(valid)BeginCharacterEntry(true);else ShowLobby();
   }
  }
  Texture2D warriorStoryPoster;
  void DrawCharacterStory()
  {
   if(warriorStory.Entering){DrawEntryLoadingLogo();if(warriorError.Length>0)Label(new Rect(360,580,1200,70),K("이야기 영상을 재생하지 못했습니다. 캐릭터 목록은 보존됩니다.","The story could not play. Your character list is preserved."),normal,TextAnchor.MiddleCenter);return;}
   // Poster = the story movie's own first frame, drawn in the movie's rect until Presentable.
   if(warriorStoryPoster==null)warriorStoryPoster=Resources.Load<Texture2D>("Art/ui/lobby_poster/warrior_story_v23_clean");
   DrawMovie(new Rect(0,0,1920,1080),warriorStoryPoster,false);
   if(warriorCaption==null){warriorCaption=new GUIStyle(normal){font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold"),fontSize=36,alignment=TextAnchor.MiddleCenter,wordWrap=true};warriorCaption.normal.textColor=Color.white;}
   if(SubtitleText.Length>0){var box=new Rect(180,864,1560,120);Fill(box,new Color(0,0,0,.64f));Label(box,SubtitleText,warriorCaption,TextAnchor.MiddleCenter);CaptionVisible=true;}
   var before=GUI.matrix;GUI.matrix=NativeUiViewport.EdgeMatrix;
   try{
    float w=NativeUiViewport.Edges.Width,spacing=13*.06f;var font=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??normal.font;
    string nextText=CharacterStoryControl(0)+" · A / Enter",skipText=CharacterStoryControl(4)+" · "+CharacterStoryControl(1)+" Space / Esc / B";
    float nextWidth=SpacedWidth(font,13,nextText,spacing)-spacing,skipWidth=SpacedWidth(font,13,skipText,spacing)-spacing;
    Rect skip=new Rect(w-w*.03f-skipWidth,1080-1080*.03f-35,skipWidth,35),next=new Rect(w-w*.03f-skipWidth-22-nextWidth,1080-1080*.03f-35,nextWidth,35);var e=Event.current;
    if(warriorStory.HintsOpacity>0){float alpha=(float)warriorStory.HintsOpacity;var color=new Color(201/255f,183/255f,149/255f,alpha);DrawSpaced(next.x,next.y+10,15,nextText,font,13,spacing,color,true);DrawSpaced(skip.x,skip.y+10,15,skipText,font,13,spacing,color,true);Fill(new Rect(skip.x,skip.yMax-2,skip.width*(float)warriorStory.HoldProgress,2),new Color(204/255f,183/255f,137/255f,alpha));NativeUiAudit.Region(new Rect(next.x,next.y,nextWidth+22+skipWidth,35),"component","character-story-hints","웹29언어 controls·right3%·bottom3%·13px·gap22");}
    if(!AutomatedInput&&e.type==EventType.MouseDown&&e.button==0){if(!warriorStory.HintsHidden&&skip.Contains(e.mousePosition))HoldCharacterStory("pointer",true);else NextCharacterStory();e.Use();}
    if(!AutomatedInput&&e.type==EventType.MouseDrag&&!skip.Contains(e.mousePosition))HoldCharacterStory("pointer",false);
    if(e.isKey)e.Use();
   }finally{GUI.matrix=before;}
  }
 }
}
