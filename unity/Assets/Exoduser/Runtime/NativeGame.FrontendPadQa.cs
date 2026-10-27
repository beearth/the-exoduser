using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class FrontendPadQaReceipt
  {
   public string scope,product,identifier,output,rosterDirectory,settingsDirectory;
   public bool passed,storyNext,shortRelease,longHold,guideGate,guideConfirm,guideStart;
   public int failures;public string[] checks;
  }

  IEnumerator FrontendPadIntegrationQa()
  {
   string output=Argument("-output"),root;
   if(!SettingsQaIdentity||!NativeSettingsStorageScope.TryResolveCinematicReview(Environment.GetCommandLineArgs(),out root)||
      string.IsNullOrWhiteSpace(output)||Path.GetFullPath(output)!=root||!lobby.EnableFrontendPadQa()||
      lobby.CharacterStoreDirectory!=Path.Combine(root,"character-roster-v1")||nativeSettingsDirectory!=Path.Combine(root,"native-settings-v1"))
   {Debug.LogError("Frontend pad QA rejected: product, PID, marker or isolated root mismatch");Application.Quit(2);yield break;}

   var checks=new List<string>();int failures=0;
   Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   bool storyNext=false,shortRelease=false,longHold=false,guideGate=false,guideConfirm=false,guideStart=false;
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);
   lobby.ShowLobby();yield return null;
   check(lobby.Characters.Count==0,"new isolated QA roster is empty");
   check(lobby.OpenCharacterCreation()&&lobby.ConfirmCharacterVisual()&&lobby.CreateCharacter("패드검수")&&lobby.CharacterStoryActive,"ordinary character creation callbacks start one story");
   float deadline=Time.realtimeSinceStartup+18;
   while((!lobby.CurrentVideo.Prepared||lobby.CurrentVideo.Time<1.3)&&lobby.VideoError.Length==0&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.CurrentVideo.Prepared&&lobby.CurrentVideo.Time>=1.3&&lobby.VideoError.Length==0,"canonical warrior video prepared and playing");

   lobby.SetFrontendPadQaState(true,false,false);yield return null;
   lobby.SetFrontendPadQaState(false,false,false);yield return new WaitForSecondsRealtime(.25f);
   storyNext=lobby.CharacterStoryActive&&lobby.CurrentVideo.Time>=5.45;
   check(storyNext,"injected Confirm edge reaches actual NextCharacterStory cut");
   yield return null;
   lobby.SetFrontendPadQaState(false,false,true);yield return new WaitForSecondsRealtime(.45f);
   check(lobby.CharacterStoryHoldProgress>0&&!lobby.CharacterStoryEntering,"short injected Start hold remains in story");
   lobby.SetFrontendPadQaState(false,false,false);yield return null;
   shortRelease=lobby.CharacterStoryHoldProgress==0&&!lobby.CharacterStoryEntering;
   check(shortRelease,"release cancels story hold");
   lobby.SetFrontendPadQaState(false,false,true);yield return new WaitForSecondsRealtime(1.28f);
   longHold=lobby.CharacterStoryEntering&&lobby.CharacterStorySeen;
   check(longHold,"1.2-second injected Start hold enters story gate once");
   lobby.SetFrontendPadQaState(false,false,false);
   deadline=Time.realtimeSinceStartup+8;
   while(lobby.StartupStage!="Nemesis"&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.StartupStage=="Nemesis"&&lobby.Characters.Count==1,"story gate reaches Nemesis without duplicate roster");
   yield return null;
   lobby.SetFrontendPadQaState(false,false,true);yield return null;
   lobby.SetFrontendPadQaState(false,false,false);
   deadline=Time.realtimeSinceStartup+2;
   while(lobby.StartupStage!="Guide"&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.StartupStage=="Guide"&&lobby.StartupCaptureState.GuideStep==0,"injected Start skips Nemesis into Guide");

   yield return null;
   check(lobby.SetGuideSkipFocusQa(true),"QA places existing keyboard skip focus on Guide");
   float early=(float)lobby.StartupCaptureState.Elapsed;
   lobby.SetFrontendPadQaState(true,false,false);yield return null;
   guideGate=early<.25f&&lobby.StartupStage=="Guide"&&lobby.StartupCaptureState.GuideStep==0;
   check(guideGate,"early injected Confirm obeys 250ms Guide gate");
   lobby.SetFrontendPadQaState(false,false,false);yield return new WaitForSecondsRealtime(.28f);
   lobby.SetFrontendPadQaState(true,false,false);yield return null;
   guideConfirm=lobby.StartupStage=="Guide"&&lobby.StartupCaptureState.GuideStep==1;
   check(guideConfirm,"injected Confirm advances despite keyboard skip focus");
   lobby.SetFrontendPadQaState(false,false,false);yield return null;
   for(int target=2;target<=3;target++){
    yield return new WaitForSecondsRealtime(.28f);
    lobby.SetFrontendPadQaState(true,false,false);yield return null;
    check(lobby.StartupStage=="Guide"&&lobby.StartupCaptureState.GuideStep==target,"injected Confirm reaches Guide step "+target);
    lobby.SetFrontendPadQaState(false,false,false);yield return null;
   }
   yield return SkillCapture(root,"guide-4-potion-720p");
   lobby.SetFrontendPadQaState(false,false,true);yield return null;
   guideStart=lobby.StartupStage=="Curtain";
   check(guideStart,"injected Start immediately skips Guide from page 4");
   lobby.SetFrontendPadQaState(false,false,false);
   deadline=Time.realtimeSinceStartup+4;
   while(lobby.IsBlocking&&Time.realtimeSinceStartup<deadline)yield return null;
   check(!lobby.IsBlocking&&lobby.Characters.Count==1,"curtain enters field with one QA character");

   File.WriteAllText(Path.Combine(root,"frontend-pad-integration.json"),JsonUtility.ToJson(new FrontendPadQaReceipt{
    scope="QA-only semantic pad frames through actual NativeLobby; no physical controller, button-label or full web parity claim",
    product=Application.productName,identifier=Application.identifier,output=root,
    rosterDirectory=lobby.CharacterStoreDirectory,settingsDirectory=nativeSettingsDirectory,
    passed=failures==0,failures=failures,storyNext=storyNext,shortRelease=shortRelease,longHold=longHold,
    guideGate=guideGate,guideConfirm=guideConfirm,guideStart=guideStart,checks=checks.ToArray()},true));
   Debug.Log("FRONTEND_PAD_INTEGRATION "+(failures==0?"PASS":"FAIL")+" checks="+checks.Count+" failures="+failures);
   Application.Quit(failures==0?0:2);
  }
 }
}
