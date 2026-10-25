using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  IEnumerator CharacterStorySmoke()
  {
   string output=Argument("-output"),mode=Argument("-story-mode");Directory.CreateDirectory(output);
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);
   check(lobby.CharacterStoreDirectory=="","story fixture never uses normal user roster storage");
   lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("전사이야기")&&lobby.CharacterStoryActive&&lobby.Characters.Count==1,"successful creation starts story once with selected identity");
   check(!lobby.OpenCharacterCreation()&&!lobby.EnterSelectedCharacter()&&!lobby.RequestCharacterDelete(0),"story owns creation deletion and entry input");
   float deadline=Time.realtimeSinceStartup+18;
   while(!lobby.CurrentVideo.Prepared&&lobby.VideoError.Length==0&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.CurrentVideo.Prepared&&lobby.VideoError.Length==0,"original warrior video decodes in native Player");
   if(mode=="failure")lobby.CurrentVideo.Open("missing-warrior-story-fixture.mp4",false,false,false);
   else{
    deadline=Time.realtimeSinceStartup+8;while(lobby.CurrentVideo.Time<1.3&&Time.realtimeSinceStartup<deadline)yield return null;
    check(lobby.CurrentVideo.Time>=1.3&&lobby.SubtitleText.Length>0,"original first caption follows native video time");
    yield return SkillCapture(output,"story-first-"+mode+"-720p");
    if(mode=="skip"){
     lobby.NextCharacterStory();yield return new WaitForSecondsRealtime(.35f);
     check(lobby.CurrentVideo.Time>=5.45,"next follows original cue and epsilon");
     lobby.HoldCharacterStory("test",true);yield return new WaitForSecondsRealtime(.5f);
     check(lobby.CharacterStoryHoldProgress>0&&!lobby.CharacterStoryEntering,"short hold does not skip");
     lobby.HoldCharacterStory("test",false);check(lobby.CharacterStoryHoldProgress==0,"release cancels skip progress");
     lobby.HoldCharacterStory("test",true);yield return new WaitForSecondsRealtime(.3f);lobby.SetPlaybackFocus(false);
     check(lobby.CharacterStoryHoldProgress==0,"focus loss clears held sources");lobby.SetPlaybackFocus(true);
     lobby.HoldCharacterStory("test",true);yield return new WaitForSecondsRealtime(1.25f);
     check(lobby.CharacterStoryEntering&&lobby.IsBlocking&&!Running,"completed hold enters loading gate before gameplay");
     yield return SkillCapture(output,"story-entry-720p");
    }
   }
   deadline=Time.realtimeSinceStartup+(mode=="natural"?130:10);bool middleCaptured=false;
   while(lobby.CharacterStoryActive&&Time.realtimeSinceStartup<deadline){
    if(mode=="natural"&&!middleCaptured&&lobby.CurrentVideo.Time>50){middleCaptured=true;yield return SkillCapture(output,"story-natural-middle-720p");}
    yield return null;
   }
   check(!lobby.CharacterStoryActive&&!lobby.IsBlocking&&Running&&lobby.ActiveCharacterName=="전사이야기","story completion enters gameplay with created name");Running=false;
   check(lobby.CharacterStorySeen==(mode!="failure"),"natural or skip marks session seen; playback failure does not");
   check(lobby.Characters.Count==1&&lobby.Characters.SelectedName=="전사이야기","story completion does not create another slot");
   yield return SkillCapture(output,"story-gameplay-"+mode+"-720p");
   if(mode=="skip"){
    ApplyPauseCommand(PauseMenuCommand.ReturnLobby);lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();lobby.CreateCharacter("취소검수");
    check(lobby.CharacterStoryActive,"subsequent creation starts its own story");lobby.ShowLobby();yield return new WaitForSecondsRealtime(1.5f);
    check(!lobby.CharacterStoryActive&&lobby.IsBlocking&&!Running&&lobby.Characters.Count==2,"lobby return cancels stale story entry without losing identities");
   }
   File.WriteAllText(Path.Combine(output,"story-"+mode+".json"),JsonUtility.ToJson(new CharacterSmokeReceipt{scope="Original native warrior video, session-only roster, callbacks and rendering; no OS input claim",passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-story-smoke")>=0)Application.Quit(failures==0?0:2);
  }
 }
}
