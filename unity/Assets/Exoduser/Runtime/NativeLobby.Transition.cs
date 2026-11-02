using System;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  readonly Exoduser.UnityPort.Core.GateEnterDelay gateEnterDelay=new Exoduser.UnityPort.Core.GateEnterDelay();internal bool CinematicEntryPending=>gateEnterDelay.Pending;
  void TickGateEntry(float delta){gateEnterDelay.Tick(delta);if(gateEnterDelay.Ready&&!NativeScreenTransition.Busy&&gateEnterDelay.Consume())TransitionPage("gate-world",()=>StartGate(),true);}

  bool TransitionPage(string boundary,Action work,bool video=false){
   if(NativeScreenTransition.Executing||AutomatedInput||LegacyFrontendFixture())return false;
   if(NativeScreenTransition.Busy)return true;
   NativeScreenTransition.Request(boundary,work,()=>!video||TransitionMediaReady(),null,()=>video?TransitionMediaError():null);return true;
  }
  bool TransitionMediaReady(){
   if(characterStep==1){EnsureSilverVisual();var clip=characterPresentationPlayback?.Video;return clip==null||clip.Player==null||(clip.Prepared&&clip.Frame>=0);}
   return movie==null||movie.Player==null||(movie.Prepared&&movie.Frame>=0);
  }
  string TransitionMediaError(){if(characterStep==1)return characterPresentationPlayback?.Video?.Error;return movie?.Error;}
  void FinishCharacterStory(bool seen){
   if(warriorStory==null||warriorStory.Entering||NativeScreenTransition.Busy)return;
   if(AutomatedInput||LegacyFrontendFixture()){warriorStory.Finish(seen);return;}
   string name=warriorStory.Name;int slot=warriorSlot;
   NativeScreenTransition.Request("story-game",()=>{
    bool valid=Characters.SelectedIndex==slot&&Characters.NameAt(slot)==name;
    warriorStory.Finish(seen);movie.Close();warriorDecoderClosed=true;SubtitleText="";
    CancelCharacterStory();characterInputFence=true;
    if(valid)BeginCharacterEntry(true);else ShowLobby();
   },()=>!StartupEntryActive||startup.Page!=Exoduser.UnityPort.Core.FrontendEntryPage.Loading);
  }
 }
}
