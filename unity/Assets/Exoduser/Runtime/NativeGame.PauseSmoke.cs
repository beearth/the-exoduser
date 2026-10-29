using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  bool pauseSmoke;
  const string A15DirectArgument="--unity-a15-direct";
  bool a15DirectReview,a15HitTrace;
  static readonly string[] A15QaLocales={"ko","en","ja","es","cs","el","th","zh"};
  int a15QaLocaleIndex;
  void BeginA15DirectReview(string[] args){
   string root,phase=Argument("-a15-phase");
   if(!NativeSettingsStorageScope.TryResolveCinematicReview(args,Application.productName,Application.identifier,out root)||nativeSettingsStore==null||nativeSettingsDirectory!=Path.Combine(root,"native-settings-v1")||lobby.CharacterStoreDirectory!=Path.Combine(root,"character-roster-v1")||(phase!="write"&&phase!="read")){
    Debug.LogError("A15_QA_REJECTED: marked Settings QA root, persistence review and write/read phase required");Application.Quit(2);return;
   }
   a15DirectReview=true;a15HitTrace=Array.IndexOf(args,"-a15-hittrace")>=0;pauseMenu.HitTraceForQa=a15HitTrace;lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest()){Debug.LogError("A15_QA_REJECTED: preview entry failed");Application.Quit(2);return;}
   frontendEntryInputFence=false;SetGameFocus(true);pauseMenu.Reset();pauseMenu.ShowSettings();pauseMenu.Navigation.SelectTab(3);menu=true;Running=false;
   if(phase=="write")pauseMenu.BeginEmbeddedKeyCaptureForQa("up",false);
   Debug.Log("A15_LABEL_RESOURCE loaded="+NativeA15SettingsLabels.Loaded+" ids="+NativeA15SettingsLabels.EntryCount);
   Debug.Log("A15_QA_DIRECT phase="+phase+" root="+root+" sfx="+settings.SfxPercent+" up="+NativeKeyBindInput.Bindings.Primary("up")+" listening="+pauseMenu.KeyCaptureActive);
  }
  void TraceA15HitRoot(string phase){
   if(!a15HitTrace||Event.current==null||Event.current.rawType!=EventType.MouseDown)return;
   var list=pauseMenu.KeyListForTest;var m=GUI.matrix;var e=Event.current;
   Debug.Log("A15_HIT_ROOT phase="+phase+" frame="+Time.frameCount+" type="+e.type+" raw="+e.rawType+" button="+e.button+" mouse="+e.mousePosition.ToString("F3")+" screen="+Screen.width+"x"+Screen.height+" dpi="+Screen.dpi+" matrix="+m.m00+","+m.m11+","+m.m03+","+m.m13+" listening="+(list!=null&&list.Listening)+" action="+(list!=null?list.ListeningAction:"null")+" consumed="+(list!=null?list.CaptureConsumedFrame:-10));
  }
  bool HandleA15DirectKeys(){
   if(pauseMenu.KeyCaptureActive)return false;
   if(ExoInput.KeyDown(KeyCode.F6)){pauseMenu.Navigation.SelectTab(3);pauseMenu.BeginEmbeddedKeyCaptureForQa("up",false);Debug.Log("A15_QA_REARM up");return true;}
   if(ExoInput.KeyDown(KeyCode.F7)){pauseMenu.Navigation.SelectTab(2);pauseMenu.Navigation.PointAt(4);Debug.Log("A15_QA_AUDIO sfx="+settings.SfxPercent+" up="+NativeKeyBindInput.Bindings.Primary("up"));return true;}
   if(ExoInput.KeyDown(KeyCode.F8)){a15QaLocaleIndex=(a15QaLocaleIndex+1)%A15QaLocales.Length;lobby.SetLanguage(A15QaLocales[a15QaLocaleIndex]);Debug.Log("A15_QA_LOCALE code="+lobby.Language+" title="+NativeA15SettingsLabels.Get("settings.title",lobby.Language,"설정","Settings")+" keyUp="+NativeA15SettingsLabels.GetKeyByKo("위로 이동",lobby.Language,lobby.Language=="ko"?"위로 이동":"Move Up"));return true;}
   return false;
  }
  void PauseTestKey(PauseKey key){pauseMenu.Navigation.ObserveReleased(false);ApplyPauseCommand(pauseMenu.HandleKey(key,Simulation.Player.Hp<=0,Screen.fullScreen));}
  IEnumerator PauseSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))throw new InvalidOperationException("pause fixture needs -output");Directory.CreateDirectory(output);
   if(Argument("-pause-phase")=="visual"||Argument("-pause-phase")=="visual-en"){yield return PauseVisual(output);yield break;}
   if(Argument("-pause-phase")=="keys"){yield return PauseKeysCapture(output);yield break;}
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
  // A16: Controls tab + the key-binding page of the pause menu (real NativeGame draw path). usage: --unity-pause-smoke -output <dir> -pause-phase keys --quit-after-pause-smoke
  IEnumerator PauseKeysCapture(string output){
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   SetGameFocus(true);menu=true;Running=false;pauseMenu.Reset();pauseMenu.ShowSettings();int tick=Simulation.TickCount;
   foreach(int width in new[]{1920,1280}){
    Screen.SetResolution(width,width==1920?1080:720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
    pauseMenu.Navigation.SelectTab(2);pauseMenu.Navigation.ObserveReleased(false);yield return UiCapture(output,"keys-controls-tab-"+width);
    pauseMenu.OpenKeyPageForTest();yield return new WaitForSecondsRealtime(.2f);check(pauseMenu.KeyPageOpen&&!Running,"key page opens over the paused game ("+width+")");
    yield return UiCapture(output,"keys-page-default-"+width);
    pauseMenu.KeyListForTest.BeginListening("weapon",false);pauseMenu.KeyListForTest.ForceListeningAge(1);yield return new WaitForSecondsRealtime(.2f);
    check(pauseMenu.KeyCaptureActive&&!HandlePanelHotkeys(),"waiting key blocks window hotkeys ("+width+")");
    yield return UiCapture(output,"keys-page-waiting-"+width);
    pauseMenu.KeyListForTest.CancelListening();pauseMenu.SetKeyScrollForTest(100000f);yield return new WaitForSecondsRealtime(.2f);yield return UiCapture(output,"keys-page-end-"+width);
    pauseMenu.KeyListForTest.CurrentTab=NativeKeyBindList.Tab.Pad;pauseMenu.SetKeyScrollForTest(0f);yield return new WaitForSecondsRealtime(.2f);yield return UiCapture(output,"keys-page-pad-top-"+width);
    pauseMenu.SetKeyScrollForTest(100000f);yield return new WaitForSecondsRealtime(.2f);yield return UiCapture(output,"keys-page-pad-end-"+width);
    pauseMenu.KeyListForTest.CurrentTab=NativeKeyBindList.Tab.Kbm;
    pauseMenu.SetKeyScrollForTest(0f);pauseMenu.Reset();pauseMenu.ShowSettings();check(!pauseMenu.KeyPageOpen,"menu reset closes the key page ("+width+")");
   }
   check(Simulation.TickCount==tick&&!Running,"the game stays paused during all key-page captures");
   pauseMenu.Reset();SetGameFocus(true);pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"keys-smoke.json"),JsonUtility.ToJson(new PauseSmokeReceipt{scope="A16 pause menu key page; actual Player draw path, test hooks (not OS mouse input)",passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-pause-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator PauseVisual(string output){
   SetGameFocus(true);menu=true;Running=false;pauseMenu.ShowSettings();
   foreach(int width in Argument("-pause-phase")=="visual-en"?new int[0]:new[]{1280,1920}){
    Screen.SetResolution(width,width==1280?720:1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
    for(int tab=0;tab<3;tab++){pauseMenu.Navigation.SelectTab(tab);pauseMenu.Navigation.ObserveReleased(false);yield return UiCapture(output,"settings-"+tab+"-"+width);}
   }
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);lobby.SetLanguage("en");pauseMenu.Navigation.SelectTab(0);yield return UiCapture(output,"settings-en-1920");pauseMenu.Navigation.SelectTab(2);yield return UiCapture(output,"controls-en-1920");lobby.SetLanguage("ko");
   pauseMenu.Reset();SetGameFocus(true);pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"pause-visual.json"),"{\"scope\":\"visual-only; prior behavioral checks not repeated\",\"phase\":\""+Argument("-pause-phase")+"\"}");
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-pause-smoke")>=0)Application.Quit();
  }
  [Serializable]sealed class PauseSmokeReceipt{public string scope="actual Player handlers/focus model; OS input separately recorded";public bool passed;public int failures;public string[] checks;}
 }
}
