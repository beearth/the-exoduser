using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  bool pauseSmoke;
  void PauseTestKey(PauseKey key){pauseMenu.Navigation.ObserveReleased(false);ApplyPauseCommand(pauseMenu.HandleKey(key,Simulation.Player.Hp<=0,Screen.fullScreen));}
  IEnumerator PauseSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))throw new InvalidOperationException("pause fixture needs -output");Directory.CreateDirectory(output);
   if(Argument("-pause-phase")=="visual"){yield return PauseVisual(output);yield break;}
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   SetGameFocus(true);pauseMenu.Reset();Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
   int tick=Simulation.TickCount;yield return UiCapture(output,"main-720p");check(!Running&&Simulation.TickCount==tick,"menu freezes actual simulation");
   PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Accept);check(pauseMenu.SettingsOpen&&!Running,"keyboard settings opens without resume");
   PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Left);
   check(settings.FrameCap==60&&Application.targetFrameRate==60,"keyboard FPS reaches host");
   ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Left,false,false));check(settings.FrameCap==60,"held direction cannot repeat");
   PauseTestKey(PauseKey.Right);check(settings.FrameCap==120&&Mathf.Abs(Time.fixedDeltaTime-1f/60)<.000001,"FPS returns without changing simulation clock");
   yield return UiCapture(output,"display-720p");
   PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Accept);yield return new WaitForSecondsRealtime(.6f);check(Screen.fullScreen,"keyboard fullscreen applied by Player");
   PauseTestKey(PauseKey.Accept);yield return new WaitForSecondsRealtime(.6f);check(!Screen.fullScreen,"keyboard returns to windowed mode");
   SetGameFocus(false);ApplyPauseCommand(PauseMenuCommand.Resume);check(!Running&&pauseMenu.SettingsOpen,"blur blocks resume and keeps settings");
   SetGameFocus(true);ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Back,false,false));check(!Running&&pauseMenu.SettingsOpen,"focus return fences stale Escape");
   PauseTestKey(PauseKey.Home);PauseTestKey(PauseKey.Right);PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Left);
   check(settings.SfxPercent==55,"keyboard SFX change");PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Right);check(settings.BgmPercent==65,"keyboard BGM change");
   yield return UiCapture(output,"audio-720p");
   PauseTestKey(PauseKey.End);PauseTestKey(PauseKey.Previous);PauseTestKey(PauseKey.Accept);check(settings.SfxPercent==60&&settings.BgmPercent==60&&Application.targetFrameRate==-1,"defaults invoke all existing callbacks");SetFrameCap(120);
   PauseTestKey(PauseKey.Back);check(pauseMenu.Navigation.Page==PausePage.Main&&pauseMenu.Navigation.Cursor==1&&!Running,"Escape returns to parent selection");
   PauseTestKey(PauseKey.End);PauseTestKey(PauseKey.Accept);check(pauseMenu.Navigation.Page==PausePage.Quit&&pauseMenu.Navigation.Cursor==0,"quit opens on cancel");
   PauseTestKey(PauseKey.Right);SetGameFocus(false);SetGameFocus(true);check(pauseMenu.Navigation.Page==PausePage.Quit&&pauseMenu.Navigation.Cursor==0&&!Running,"focus return cancels dangerous selection without leaving dialog");
   check(pauseMenu.HandleKey(PauseKey.Accept,false,false)==PauseMenuCommand.None&&pauseMenu.Navigation.Page==PausePage.Quit,"held confirmation cannot quit after focus return");
   yield return UiCapture(output,"quit-720p");PauseTestKey(PauseKey.Accept);check(pauseMenu.Navigation.Page==PausePage.Main&&!Running,"fresh Enter cancels quit");
   PauseTestKey(PauseKey.Home);PauseTestKey(PauseKey.Accept);check(Running&&!menu&&skillInputFence,"deliberate resume gates combat input");
   SetGameFocus(false);tick=Simulation.TickCount;yield return new WaitForSecondsRealtime(.2f);check(menu&&!Running&&tick==Simulation.TickCount,"combat blur auto-pauses actual ticks");SetGameFocus(true);yield return null;check(!Running&&menu,"combat focus return stays paused");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return UiCapture(output,"main-1080p");
   PauseTestKey(PauseKey.Down);PauseTestKey(PauseKey.Accept);PauseTestKey(PauseKey.Home);PauseTestKey(PauseKey.Accept);yield return UiCapture(output,"display-1080p");
   PauseTestKey(PauseKey.Right);yield return UiCapture(output,"audio-1080p");PauseTestKey(PauseKey.Back);PauseTestKey(PauseKey.End);PauseTestKey(PauseKey.Accept);yield return UiCapture(output,"quit-1080p");
   check(Simulation.TickCount==tick,"all settings and quit captures remain paused");
   pauseMenu.Reset();SetGameFocus(true);pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"pause-smoke.json"),JsonUtility.ToJson(new PauseSmokeReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-pause-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator PauseVisual(string output){
   SetGameFocus(true);menu=true;Running=false;pauseMenu.ShowSettings();
   foreach(int width in new[]{1280,1920}){
    Screen.SetResolution(width,width==1280?720:1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
    for(int tab=0;tab<3;tab++){pauseMenu.Navigation.SelectTab(tab);pauseMenu.Navigation.ObserveReleased(false);yield return UiCapture(output,"settings-"+tab+"-"+width);}
   }
   pauseMenu.English=true;pauseMenu.Navigation.SelectTab(0);yield return UiCapture(output,"settings-en-1920");pauseMenu.Navigation.SelectTab(2);yield return UiCapture(output,"controls-en-1920");pauseMenu.English=false;
   pauseMenu.Reset();SetGameFocus(true);pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"pause-visual.json"),"{\"captures\":8,\"scope\":\"visual-only; prior behavioral checks not repeated\"}");
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-pause-smoke")>=0)Application.Quit();
  }
  [Serializable]sealed class PauseSmokeReceipt{public string scope="actual Player handlers/focus model; OS input separately recorded";public bool passed;public int failures;public string[] checks;}
 }
}
