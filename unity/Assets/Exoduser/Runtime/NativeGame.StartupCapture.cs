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
  int startupResetCount,frontendFenceSetFrame=-1,frontendFenceReleasedFrame=-1;
  [Serializable] sealed class StartupCaptureReceipt {public string scope,rosterDirectory;public bool passed,automatedInput;public int failures,resetDelta,fenceSetFrame,fenceReleasedFrame;public string[] checks;}
  IEnumerator StartupCapture()
  {
   string output=Argument("-output");var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   if(string.IsNullOrWhiteSpace(output)||output.StartsWith("-",StringComparison.Ordinal)||string.IsNullOrEmpty(lobby.CharacterStoreDirectory)){Debug.LogError("STARTUP CAPTURE requires explicit writable -output QA namespace");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);check(lobby.CharacterStoreDirectory==Path.Combine(Path.GetFullPath(output),"character-roster-v1"),"explicit isolated roster namespace");check(!lobby.AutomatedInput,"scripted callback capture leaves AutomatedInput false; no OS input claim");
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return null;lobby.ShowLobby();
   if(lobby.Characters.Count==0){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("입장검수"),"create only inside explicit capture roster");lobby.ShowLobby();}
   check(lobby.Characters.SelectedIndex>=0,"capture selected identity exists");int resets=startupResetCount;
   check(lobby.BeginCharacterEntry(false),"actual ordinary entry callback accepted");check(lobby.StartupCaptureState.Page==FrontendEntryPage.Loading&&!Running,"actual loading blocks Simulation");yield return SkillCapture(output,"startup-loading-720p");
   float deadline=Time.realtimeSinceStartup+12;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.StartupCaptureState.Page==FrontendEntryPage.Nemesis&&!Running,"1200ms loading reaches actual Nemesis");
   while(lobby.StartupCaptureState.LineIndex<2&&Time.realtimeSinceStartup<deadline)yield return null;
   yield return new WaitForSecondsRealtime(.2f);check(lobby.StartupCaptureState.VisibleCharacters>0&&!lobby.StartupCaptureState.FullText,"source dialogue is typing");yield return SkillCapture(output,"startup-nemesis-typing-720p");
   int line=lobby.StartupCaptureState.LineIndex;lobby.StartupCaptureState.Advance();check(lobby.StartupCaptureState.FullText&&lobby.StartupCaptureState.LineIndex==line,"first callback advance reveals dialogue");yield return SkillCapture(output,"startup-nemesis-full-720p");lobby.StartupCaptureState.Advance();check(lobby.StartupCaptureState.LineIndex==line+1,"second callback advance moves line");
   lobby.StartupCaptureState.Skip();yield return null;check(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide&&!Running,"Nemesis skip reaches actual guide with stopped Simulation");
   for(int step=0;step<4;step++){
    check(lobby.StartupCaptureState.GuideStep==step,"source guide page "+(step+1));Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-guide-"+(step+1)+"-720p");
    if(step==0||step==3){Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-guide-"+(step+1)+"-1080p");}
    lobby.StartupCaptureState.Advance();
   }
   check(lobby.StartupCaptureState.Page==FrontendEntryPage.Curtain&&!Running,"Start opens curtain while Simulation is stopped");yield return SkillCapture(output,"startup-curtain-1080p");
   deadline=Time.realtimeSinceStartup+5;while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
   check(!lobby.IsBlocking&&Running&&!frontendEntryInputFence,"actual completion resumes only after input release fence");check(frontendFenceSetFrame>=0&&frontendFenceReleasedFrame>=frontendFenceSetFrame,"entry release fence armed and processed");check(startupResetCount-resets==1,"exactly one ResetRun during the entry");Running=false;
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-gameplay-hud-720p");Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-gameplay-hud-1080p");
   lobby.CloseStartupCaptureMedia();sound?.Reset();check(!Running,"capture holds gameplay stopped before shutdown");
   File.WriteAllText(Path.Combine(output,"startup-capture.json"),JsonUtility.ToJson(new StartupCaptureReceipt{scope="Narrow scripted runtime callbacks and Player PNGs for actual entry/guide/current HUD; not keyboard or mouse OS-input QA. No full tutorial/practice completion claim.",rosterDirectory=lobby.CharacterStoreDirectory,passed=failures==0,automatedInput=lobby.AutomatedInput,failures=failures,resetDelta=startupResetCount-resets,fenceSetFrame=frontendFenceSetFrame,fenceReleasedFrame=frontendFenceReleasedFrame,checks=checks.ToArray()},true));
   yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
 }
}
