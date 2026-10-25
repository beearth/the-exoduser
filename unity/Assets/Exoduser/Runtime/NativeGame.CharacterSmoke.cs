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
  IEnumerator CharacterSmoke()
  {
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--character-delete-only")>=0){yield return CharacterDeleteSmoke();yield break;}
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--character-presentation-only")>=0){yield return CharacterPresentationOnlySmoke();yield break;}
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--character-visual-only")>=0){yield return CharacterVisualSmoke();yield break;}
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;
   Directory.CreateDirectory(output);var checks=new List<string>();int failures=0;
   Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
   check(!lobby.EnterSelectedCharacter(),"empty roster rejects entry");
   check(lobby.OpenCharacterCreation()&&lobby.ChooseCharacterVisual(4)&&!lobby.ConfirmCharacterVisual(),"locked class cannot open name step");
   yield return SkillCapture(output,"character-locked-720p");
   lobby.ChooseCharacterVisual(0);check(lobby.ConfirmCharacterVisual(),"warrior opens name step");
   check(!lobby.CreateCharacter("<x")&&lobby.Characters.Count==0,"invalid name does not create identity");
   yield return SkillCapture(output,"character-name-error-720p");
   check(lobby.CreateCharacter("  아린  ")&&lobby.Characters.SelectedName=="아린"&&!lobby.CharacterModalOpen,"trimmed creation selects identity and closes modal");
   lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(!lobby.CreateCharacter("아린")&&lobby.Characters.Count==1,"duplicate rejected without changing roster");
   yield return SkillCapture(output,"character-duplicate-720p");
   lobby.CloseCharacterCreation();check(lobby.Characters.Count==1,"cancel preserves roster");
   for(int i=2;i<=5;i++){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("전사"+i),"create session slot "+i);}
   check(!lobby.OpenCharacterCreation()&&lobby.Characters.Count==5,"five-slot limit blocks sixth creation");
   yield return SkillCapture(output,"character-five-slots-720p");
   lobby.SelectCharacter(0);var previous=Simulation;
   check(lobby.EnterSelectedCharacter()&&!lobby.IsBlocking&&Running&&lobby.ActiveCharacterName=="아린"&&!ReferenceEquals(previous,Simulation),"selected identity enters a fresh native preview");
   Running=false;yield return SkillCapture(output,"character-entered-720p");
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);
   check(lobby.IsBlocking&&!Running&&lobby.Characters.Count==5&&lobby.Characters.SelectedName=="아린","return to lobby retains session identities and selection");
   check(lobby.SelectCharacter(4)&&lobby.EnterSelectedCharacter()&&lobby.ActiveCharacterName=="전사5","different selected identity reaches native preview");
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);lobby.SelectPreview();lobby.EnterNativeTest();
   check(lobby.ActiveCharacterName=="","anonymous preview does not reuse selected name");
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);lobby.Characters.Clear();
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
   lobby.OpenCharacterCreation();yield return SkillCapture(output,"character-warrior-1080p");
   File.WriteAllText(Path.Combine(output,"character-smoke.json"),JsonUtility.ToJson(new CharacterSmokeReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   lobbySmoke=false;lobby.AutomatedInput=false;
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-character-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator CharacterPresentationOnlySmoke()
  {
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var receipt=new CharacterPresentationSmokeReceipt();
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);
   lobby.OpenCharacterCreation();lobby.ChooseCharacterVisual(0);yield return WaitForCharacterPresentationFrame(receipt,"warrior-720p","cs_idle_warrior_cs3_4k.mp4");yield return SkillCapture(output,"character-presentation-warrior-720p");
   lobby.ChooseCharacterVisual(1);yield return WaitForCharacterPresentationFrame(receipt,"silvertail-720p","cs_idle_silvertail_4k.mp4");yield return SkillCapture(output,"character-presentation-silvertail-720p");
   for(int i=2;i<5;i++){lobby.ChooseCharacterVisual(i);yield return SkillCapture(output,"character-presentation-class-"+i+"-720p");}
   lobby.ChooseCharacterVisual(0);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);
   yield return WaitForCharacterPresentationFrame(receipt,"warrior-1080p","cs_idle_warrior_cs3_4k.mp4");yield return SkillCapture(output,"character-presentation-warrior-1080p");
   lobby.ConfirmCharacterVisual();yield return SkillCapture(output,"character-presentation-name-ko-1080p");
   lobby.CreateCharacter("<");yield return SkillCapture(output,"character-presentation-name-error-1080p");
   lobby.CloseCharacterCreation();Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);
   lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();yield return SkillCapture(output,"character-presentation-name-ko-720p");
   lobby.CreateCharacter("<");yield return SkillCapture(output,"character-presentation-name-error-720p");
   lobby.CloseCharacterCreation();receipt.scope="Focused Player capture only; presentation frames/captures; no roster or storage mutation; no native OS input claim";
   var playback=lobby.GetComponent<NativeCharacterPresentationPlayback>();receipt.presentationVideoClosed=playback==null||playback.Video==null||playback.Video.Player==null;
   if(lobby.CurrentVideo!=null)lobby.CurrentVideo.Close();receipt.lobbyVideoClosed=lobby.CurrentVideo==null||lobby.CurrentVideo.Player==null;receipt.passed=receipt.failures==0&&receipt.presentationVideoClosed&&receipt.lobbyVideoClosed;
   yield return new WaitForSecondsRealtime(1f);
   File.WriteAllText(Path.Combine(output,"character-presentation-smoke.json"),JsonUtility.ToJson(receipt,true));
   lobbySmoke=false;lobby.AutomatedInput=false;
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-character-smoke")>=0)Application.Quit(receipt.passed?0:2);
  }
  IEnumerator WaitForCharacterPresentationFrame(CharacterPresentationSmokeReceipt receipt,string name,string expectedFile)
  {
   yield return new WaitForEndOfFrame();
   var playback=lobby.GetComponent<NativeCharacterPresentationPlayback>();var video=playback!=null?playback.Video:null;float deadline=Time.realtimeSinceStartup+20;
   while(video!=null&&!video.Prepared&&video.Error.Length==0&&Time.realtimeSinceStartup<deadline)yield return null;
   if(video!=null&&video.Prepared){deadline=Time.realtimeSinceStartup+5;while(video.Frame<0&&Time.realtimeSinceStartup<deadline)yield return null;}
   string actual=video!=null&&video.Player!=null?video.Player.url:"";bool correctSource=actual.EndsWith(expectedFile,StringComparison.OrdinalIgnoreCase),ready=correctSource&&video.Prepared&&video.Frame>=0;
   receipt.videoFrames.Add(name+":"+(ready?"prepared":"FAIL")+",expected="+expectedFile+",actual="+actual+(video==null?"":",error="+video.Error));if(!ready)receipt.failures++;
  }
  [Serializable] sealed class CharacterPresentationSmokeReceipt{public string scope;public List<string> videoFrames=new List<string>();public int failures;public bool passed,presentationVideoClosed,lobbyVideoClosed;}
  [Serializable] sealed class CharacterSmokeReceipt{public string scope="Actual Player callbacks and rendering; no native OS input claim; session-only identities";public bool passed;public int failures;public string[] checks;}
  IEnumerator CharacterVisualSmoke()
  {
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
   lobby.OpenCharacterCreation();for(int i=0;i<5;i++){lobby.ChooseCharacterVisual(i);yield return SkillCapture(output,"class-"+i+"-720p");}
   lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();lobby.CreateCharacter("가나다라마바사아");
   yield return SkillCapture(output,"selected-name-720p");
   lobby.EnterSelectedCharacter();Running=false;yield return SkillCapture(output,"name-badge-720p");
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
   yield return SkillCapture(output,"selected-name-1080p");
   lobby.SetLanguage("en");lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();yield return SkillCapture(output,"name-english-1080p");
   lobby.CloseCharacterCreation();lobby.SetLanguage("ko");lobbySmoke=false;lobby.AutomatedInput=false;
   File.WriteAllText(Path.Combine(output,"visual-capture.json"),"{\"scope\":\"Final display-only changes; class art, positioning, maximum name length and English form\",\"captures\":9}");
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-character-smoke")>=0)Application.Quit();
  }
 }
}
