using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class PetBubbleReceipt
  {
   public string locale,switchedLocale;
   public string scope="controlled presentation queue fixture, not natural field/boss/HP events or a visual pass";
   public int width,height;public string[] files;
   public bool passed,storesDisabled,rosterUnchanged,artLoaded,pairShown,languageRefreshed,urgentInterrupted,menuHidden;
  }
  IEnumerator PetBubbleCaptureRun()
  {
   string output=Argument("-output"),locale=Argument("-text-lang"),switched=Argument("-pet-switch-lang");
   if(locale.Length==0)locale="ko";if(switched.Length==0)switched="ar";
   if(!Path.IsPathRooted(output)||!Path.IsPathRooted(Argument("--unity-qa-sandbox"))||!NativeReviewArgs.BossDirect||
    nativeSettingsStore!=null||combatStore!=null||!string.IsNullOrEmpty(lobby.CharacterStoreDirectory))
   {Debug.LogError("Pet bubble fixture requires absolute output/sandbox, boss-direct and disabled stores");WindowsHardExit.Quit(2);yield break;}
   Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
   petBubbleFixtureActive=petBubbleFixtureOwnsQueue=true;smokeActive=true;pauseSmoke=true;lobbySmoke=true;lobby.AutomatedInput=true;
   Running=false;menu=false;gameFocused=true;
   lobby.SetLanguage(locale);if(lobby.Language!=locale){WindowsHardExit.Quit(2);yield break;}
   lobby.Characters.TryRestore(new[]{"문구검수"},0);lobby.ShowLobby();lobby.SelectPreview();
   if(!lobby.EnterNativeTest()){WindowsHardExit.Quit(2);yield break;}
   EndFirstPractice(true);menu=false;Running=false;frontendEntryInputFence=false;UpdateViews();
   int count=lobby.Characters.Count;var files=new List<string>();
   var receipt=new PetBubbleReceipt{locale=locale,switchedLocale=switched,width=Screen.width,height=Screen.height,storesDisabled=true};
   petBubble.Reset();petBubble.BeginFrame(0,false,false,false);petBubble.Offer(NativePetBubbleCatalog.Cue("env_ch0"));petBubble.Dispatch();
   yield return new WaitForSecondsRealtime(.3f);yield return DeathCapture(output,"pet-env-crow-"+locale,files);
   receipt.artLoaded=petBubbleView.ArtLoaded;string firstText=petBubbleView.LastText;
   petBubble.BeginFrame(4,false,false,false);
   yield return DeathCapture(output,"pet-env-cat-"+locale,files);receipt.pairShown=petBubble.PairPhase&&petBubble.Speaker=="cat";
   lobby.SetLanguage(switched);
   yield return DeathCapture(output,"pet-language-"+switched,files);
   receipt.languageRefreshed=lobby.Language==switched&&petBubbleView.LastText==NativePetBubbleHints.Resolve(NativePetBubbleCatalog.Text(petBubble.Key,switched),action=>NativePetBubbleView.BindingLabel(action,switched));
   lobby.SetLanguage(locale);
   petBubble.Offer(NativePetBubbleCatalog.Cue("hp_critical"));petBubble.Dispatch();
   receipt.urgentInterrupted=petBubble.Id=="hp_critical"&&!petBubble.PairPhase;
   yield return DeathCapture(output,"pet-T5-interrupt-"+locale,files);
   menu=true;yield return DeathCapture(output,"pet-menu-hidden-"+locale,files);receipt.menuHidden=PetBubbleHidden;menu=false;
   petBubble.Reset();petBubble.BeginFrame(0,false,false,false);petBubble.Offer(NativePetBubbleCatalog.Cue("crisis_hp30"));petBubble.Dispatch();
   yield return DeathCapture(output,"pet-current-binding-"+locale,files);
   receipt.rosterUnchanged=count==lobby.Characters.Count;
   receipt.passed=receipt.artLoaded&&receipt.pairShown&&receipt.languageRefreshed&&receipt.urgentInterrupted&&receipt.menuHidden&&receipt.rosterUnchanged&&!string.IsNullOrEmpty(firstText);
   receipt.files=files.ToArray();File.WriteAllText(Path.Combine(output,"pet-bubble-"+locale+".json"),JsonUtility.ToJson(receipt,true));
   petBubble.Clear();lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
   yield return new WaitForSecondsRealtime(1);WindowsHardExit.Quit(receipt.passed?0:2);
  }
 }
}
