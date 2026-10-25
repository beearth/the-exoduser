using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  // Explicit developer CLI fixture, like the existing inventory smoke. Never runs in normal play.
  IEnumerator UiSmoke() {
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var checks=new List<string>();int failures=0;
   Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   var flags=BindingFlags.Instance|BindingFlags.NonPublic;
   int width=Screen.width,height=Screen.height;int vsync=QualitySettings.vSyncCount;
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
   check(settings.FrameCap==120&&Application.targetFrameRate==120,"menu preserves current 120fps");
   yield return UiCapture(output,"pause");pauseMenu.ShowSettings();yield return UiCapture(output,"display");
   check(pauseMenu.HandleEscape()&&!pauseMenu.SettingsOpen&&!Running,"settings Escape returns to paused main");
   pauseMenu.ShowSettings();typeof(NativePauseMenu).GetField("tab",flags).SetValue(pauseMenu,1);
   SetSfxPercent(0);SetBgmPercent(0);yield return UiCapture(output,"audio-muted");
   check(settings.SfxPercent==0&&settings.BgmPercent==0,"real audio callbacks update state");
   var play=typeof(NativeFeedbackAudio).GetMethod("Play",flags);play.Invoke(sound,new object[]{"sword_swing1",.5f,1f,10});
   AudioSource sample=null;foreach(var a in GetComponentsInChildren<AudioSource>())if(a.gameObject.name=="Original SFX voice")sample=a;
   check(sample!=null&&sample.volume==0,"muted actual sample source");SetSfxPercent(30);
   check(sample!=null&&Mathf.Abs(sample.volume-.045f)<.00001f,"live voice uses raw volume when changing SFX");
   SetSfxPercent(60);check(sample!=null&&Mathf.Abs(sample.volume-.18f)<.00001f,"default SFX gain restored");sound.Reset();
   SetFrameCap(30);check(Application.targetFrameRate==30&&QualitySettings.vSyncCount==0&&Mathf.Abs(Time.fixedDeltaTime-1f/60)<.000001,"frame cap does not alter simulation");
   SetFrameCap(0);check(Application.targetFrameRate==-1,"unlimited cap");SetFrameCap(120);
   typeof(NativePauseMenu).GetField("tab",flags).SetValue(pauseMenu,2);yield return UiCapture(output,"controls");pauseMenu.Reset();
   ApplyPauseCommand(PauseMenuCommand.Resume);check(Running&&!menu,"resume command");SetInventory(true);int tick=Simulation.TickCount;
   var item=inventory.State.Bag.Find(i=>i.slot=="weapon");inventory.State.Select(item);var original=inventory.State.GetEquipped("weapon");
   yield return UiCapture(output,"inventory-comparison-1080p");check(!Running&&tick==Simulation.TickCount&&ReferenceEquals(original,inventory.State.GetEquipped("weapon")),"view comparison pauses without equipping");
   typeof(NativeInventory).GetField("detailScroll",flags).SetValue(inventory,new Vector2(0,10000));yield return UiCapture(output,"inventory-comparison-bottom");
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);typeof(NativeInventory).GetField("detailScroll",flags).SetValue(inventory,Vector2.zero);yield return UiCapture(output,"inventory-comparison-720p");
   check(inventory.Equip(item,Simulation.Player.Level)&&ReferenceEquals(inventory.State.GetEquipped("weapon"),item),"comparison candidate equips through existing handler");
   yield return UiCapture(output,"inventory-equipped");SetInventory(false);check(Running,"inventory close resumes");menu=true;Running=false;
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);yield return new WaitForSecondsRealtime(.3f);
   var music=(AudioSource)typeof(NativeLobby).GetField("music",flags).GetValue(lobby);
   check(lobby.IsBlocking&&!Running&&music.volume==0,"return lobby and BGM mute survives track change");SetBgmPercent(30);check(Mathf.Abs(music.volume-.325f)<.0001,"BGM retains phase gain");SetBgmPercent(60);check(Mathf.Abs(music.volume-.65f)<.0001,"default lobby mix restored");
   Screen.SetResolution(width,height,FullScreenMode.Windowed);QualitySettings.vSyncCount=vsync;
   File.WriteAllText(Path.Combine(output,"ui-smoke.json"),JsonUtility.ToJson(new UiSmokeReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-ui-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator UiCapture(string output,string name){yield return new WaitForSecondsRealtime(.15f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;}
  [Serializable] sealed class UiSmokeReceipt{public string scope="actual Unity Player fixture; not OS mouse input";public bool passed;public int failures;public string[] checks;}
 }
}
