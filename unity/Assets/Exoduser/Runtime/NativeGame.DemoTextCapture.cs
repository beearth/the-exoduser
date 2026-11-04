using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class DemoTextReceipt
  {
   public string locale,bossName,introLine,sinkLine,region;
   public bool passed,storesDisabled,rosterUnchanged,coreIntroEvent,visibleIntro;
   public int width,height;public string[] files;
   public string scope="controlled lobby/HUD and Core arena-entry event; sink0 is a controlled presentation call, not a natural boss defeat or native-language visual pass";
  }
  IEnumerator DemoTextCaptureRun()
  {
   string output=Argument("-output"),locale=Argument("-text-lang");if(locale.Length==0)locale="en";
   if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))||!NativeReviewArgs.BossDirect||nativeSettingsStore!=null||combatStore!=null||!string.IsNullOrEmpty(lobby.CharacterStoreDirectory))
   {Debug.LogError("Demo text capture requires absolute output, isolated QA sandbox, boss-direct0 and disabled stores");WindowsHardExit.Quit(2);yield break;}
   Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
   smokeActive=true;pauseSmoke=true;lobbySmoke=true;lobby.AutomatedInput=true;Running=false;menu=false;gameFocused=true;
   lobby.SetLanguage(locale);if(lobby.Language!=locale){Debug.LogError("Unsupported demo text locale "+locale);WindowsHardExit.Quit(2);yield break;}
   lobby.Characters.TryRestore(new[]{"문구검수"},0);lobby.ShowLobby();int roster=lobby.Characters.Count;var files=new List<string>();
   yield return new WaitForSecondsRealtime(.6f);yield return DeathCapture(output,"demo-lobby-"+locale,files);
   lobby.SelectPreview();if(!lobby.EnterNativeTest()){WindowsHardExit.Quit(2);yield break;}EndFirstPractice(true);menu=false;Running=false;frontendEntryInputFence=false;
   var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;p.Iframes=1e9f;p.Hp=p.MaxHp;areaTitle.Hide();
   regionHud.LocaleCode=locale;regionHud.ShowBanner(sim,1,false);regionHud.ForcedBannerAge=1;UpdateViews();
   yield return new WaitForSecondsRealtime(.3f);yield return DeathCapture(output,"demo-hud-"+locale,files);
   var receipt=new DemoTextReceipt{locale=locale,width=Screen.width,height=Screen.height,storesDisabled=true,region=regionHud.BannerKr};
   regionHud.ForcedBannerAge=null;regionHud.Reset();BossDirectEnter();
   for(int ticks=0;ticks<900&&(!sim.Stage.InArena||sim.Stage.LoadPhase!=0);ticks++){StepInput(0,0,p.X+100,p.Y,false,false);yield return null;}
   UpdateViews();yield return new WaitForSecondsRealtime(.25f);
   receipt.coreIntroEvent=sim.BossLineLog.Contains("intro0");receipt.visibleIntro=bossDialogue.Active;
   receipt.bossName=LastBossBarInput.name;receipt.introLine=NativeDemoText.BossLine("intro0",locale);
   yield return DeathCapture(output,"demo-boss-intro-"+locale,files);
   // Explicit controlled presentation call: natural sink/death timing remains a Mac gameplay gate.
   OnBossLine("sink0");receipt.sinkLine=NativeDemoText.BossLine("sink0",locale);
   yield return new WaitForSecondsRealtime(.6f);yield return DeathCapture(output,"demo-boss-sink-controlled-"+locale,files);
   receipt.rosterUnchanged=roster==lobby.Characters.Count;receipt.files=files.ToArray();
   receipt.passed=receipt.coreIntroEvent&&receipt.visibleIntro&&receipt.rosterUnchanged&&receipt.bossName==NativeDemoText.Get("다크드루이드",locale)&&files.Count==4;
   File.WriteAllText(Path.Combine(output,"demo-text-"+locale+".json"),JsonUtility.ToJson(receipt,true));
   lobby.CloseStartupCaptureMedia();sound?.Reset();WindowsHardExit.Quit(receipt.passed?0:2);
  }
 }
}
