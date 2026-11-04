using System;
using System.Collections;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  // Review only (--unity-startup-guide-review -output <dir> [--unity-barrier-legacy]): reaches the real startup guide page 1 through the lobby callbacks
  // (with waits for the page transitions), saves 1920x1080 stills and a 5 s frame sequence. Presentation/QA only; Core untouched.
  IEnumerator StartupGuideReview()
  {
   string output=Argument("-output");if(string.IsNullOrWhiteSpace(output)||string.IsNullOrEmpty(lobby.CharacterStoreDirectory)){Debug.LogError("STARTUP GUIDE REVIEW requires -output and an isolated roster");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);string seq=Path.Combine(output,"seq");Directory.CreateDirectory(seq);var log=new System.Text.StringBuilder();
   Action<string> note=s=>{log.AppendLine(s);Debug.Log("[guide-review] "+s);};
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
   lobby.ShowLobby();yield return new WaitForSecondsRealtime(1.5f);
   if(lobby.Characters.Count==0){
    note("open="+lobby.OpenCharacterCreation());yield return new WaitForSecondsRealtime(1.5f);
    note("choose="+lobby.ChooseCharacterVisual(0));yield return new WaitForSecondsRealtime(1f);
    note("confirm="+lobby.ConfirmCharacterVisual());yield return new WaitForSecondsRealtime(1.5f);
    note("create="+lobby.CreateCharacter("은빛검수"));yield return new WaitForSecondsRealtime(2.5f);
    lobby.ShowLobby();yield return new WaitForSecondsRealtime(1.5f);
   }
   note("entry="+lobby.BeginCharacterEntry(false));
   float deadline=Time.realtimeSinceStartup+25;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
   note("page="+lobby.StartupCaptureState.Page);yield return new WaitForSecondsRealtime(.5f);
   lobby.StartupCaptureState.Skip();yield return new WaitForSecondsRealtime(1f);
   note("page="+lobby.StartupCaptureState.Page+" step="+lobby.StartupCaptureState.GuideStep);
   if(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide){
    yield return new WaitForSecondsRealtime(1f);yield return SkillCapture(output,"guide-1-1920");
    for(int i=0;i<75;i++){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(seq,"f"+i.ToString("D4")+".png"));yield return new WaitForSecondsRealtime(1f/15f);}
   }
   File.WriteAllText(Path.Combine(output,"guide-review.txt"),log.ToString());lobby.CloseStartupCaptureMedia();
   yield return new WaitForSecondsRealtime(1);Application.Quit(0);
  }
 }
}
