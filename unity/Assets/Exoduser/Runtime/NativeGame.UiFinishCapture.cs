using System;
using System.Collections;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // PC UI-finish review fixture (A06/A15/A17/A18/A22/A23): `--unity-ui-finish-capture -output <dir> -ui-phase <name>`.
 // Real Player handlers only; writes PNGs at 1920x1080 and 1600x900 plus a receipt of the values it observed.
 public sealed partial class NativeGame
 {
  IEnumerator UiFinishCapture()
  {
   string output=Argument("-output"),phase=Argument("-ui-phase");if(string.IsNullOrEmpty(output))yield break;
   Directory.CreateDirectory(output);lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();
   SetGameFocus(true);yield return new WaitForSecondsRealtime(.4f);
   var log=new System.Collections.Generic.List<string>();
   foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(1600,900)})
   {
    Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
    string tag=size.x.ToString();
    if(phase=="art")yield return UiFinishArt(output,tag,log);
    if(phase=="settings")yield return UiFinishSettings(output,tag,log);
    if(phase=="hud")yield return UiFinishHud(output,tag,log);
    if(phase=="pause")yield return UiFinishPause(output,tag,log);
   }
   File.WriteAllText(Path.Combine(output,"ui-finish-"+phase+".json"),"{\"phase\":\""+phase+"\",\"log\":["+string.Join(",",log.ConvertAll(x=>"\""+x.Replace("\"","'")+"\""))+"]}");
   Application.Quit();
  }
  IEnumerator UiFinishSettings(string output,string tag,System.Collections.Generic.List<string> log)
  {
   menu=true;Running=false;pauseMenu.Reset();pauseMenu.ShowSettings();
   for(int tab=0;tab<4;tab++){pauseMenu.Navigation.SelectTab(tab);pauseMenu.Navigation.ObserveReleased(false);yield return UiCapture(output,"unity-settings-"+tab+"-"+tag);}
   pauseMenu.Navigation.SelectTab(3);pauseMenu.A15SetScrollForQa(9999);yield return UiCapture(output,"unity-settings-3-scrolled-"+tag);pauseMenu.A15SetScrollForQa(0);
   pauseMenu.Navigation.SelectTab(2);pauseMenu.A15OpenSelectForQa("optBgmTrack");yield return UiCapture(output,"unity-settings-2-popup-"+tag);
   log.Add("opt="+settings.Options.Encode()+" sfx="+settings.SfxPercent+" bgm="+settings.BgmPercent+" fps="+settings.FrameCap);
   // keyboard rows: cursor onto the first Display row (Shake) and step it right.
   pauseMenu.Reset();pauseMenu.ShowSettings();pauseMenu.Navigation.SelectTab(1);pauseMenu.Navigation.PointAt(4);int shakeBefore=settings.Options.Get("shake");
   for(int i=0;i<2;i++){pauseMenu.Navigation.ObserveReleased(false);ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Left,false,false));}
   log.Add("kbd shake "+shakeBefore+" -> "+settings.Options.Get("shake")+" (two Left steps of 5)");settings.Options.Set("shake",shakeBefore);
   // persistence round trip through the real store + codec.
   var st=new NativeSettingsState(60);st.Options.Set("shake",35);st.Options.Set("brightness",90);st.Options.Set("bloom",0);st.Options.Set("atmos",1);st.Options.BgmTrack="hell3";st.Presets[0]="{\"opt\":{}}";
   string dir=Path.Combine(output,"io-"+tag,"native-settings-v1");NativeSettingsSnapshot snap;NativeSettingsStoreStatus status;
   var store=new NativeSettingsStore(dir,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,st,false);store.TryLoad(out snap,out status);
   bool saved=store.TrySave(st,false,NativeKeyBindInput.Bindings,false,out status);
   var store2=new NativeSettingsStore(dir,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,new NativeSettingsState(60),false);bool loaded=store2.TryLoad(out snap,out status);
   var st2=new NativeSettingsState(60);string raw="",rawPreset="";if(snap!=null&&snap.extra!=null){snap.extra.TryGetValue("opt",out raw);snap.extra.TryGetValue("preset1",out rawPreset);}st2.Options.Decode(raw);
   log.Add("io saved="+saved+" loaded="+loaded+" same="+(st2.Options.Encode()==st.Options.Encode())+" shake="+st2.Options.Get("shake")+" brightness="+st2.Options.Get("brightness")+" bloom="+st2.Options.Get("bloom")+" atmos="+st2.Options.Get("atmos")+" bgmTrack="+st2.Options.BgmTrack+" preset1="+rawPreset);
   // other languages (web strings from the live DOM).
   pauseMenu.Reset();pauseMenu.ShowSettings();
   foreach(string code in new[]{"en","ja","de"}){lobby.SetLanguage(code);pauseMenu.Navigation.SelectTab(0);pauseMenu.Navigation.ObserveReleased(false);yield return UiCapture(output,"unity-settings-0-"+code+"-"+tag);}
   lobby.SetLanguage("ko");
   pauseMenu.Reset();
  }
  IEnumerator UiFinishHud(string output,string tag,System.Collections.Generic.List<string> log)
  {
   menu=false;Running=true;pauseMenu.Reset();yield return new WaitForSecondsRealtime(2.5f);
   yield return UiCapture(output,"unity-hud-"+tag);
   log.Add("hud running="+Running+" hp="+Simulation.Player.Hp.ToString("0")+" tick="+Simulation.TickCount);
  }
  IEnumerator UiFinishPause(string output,string tag,System.Collections.Generic.List<string> log)
  {
   menu=false;Running=true;pauseMenu.Reset();yield return new WaitForSecondsRealtime(1f);
   // web ESC: settings window opens directly and the game is frozen.
   menu=true;pauseMenu.OpenSettingsDirect();Running=false;int tick=Simulation.TickCount;yield return new WaitForSecondsRealtime(.6f);
   log.Add("esc -> settings direct="+(pauseMenu.SettingsOpen&&pauseMenu.Navigation.DirectSettings)+" frozen="+(Simulation.TickCount==tick));
   yield return UiCapture(output,"unity-pause-open-"+tag);
   pauseMenu.Navigation.ObserveReleased(false);ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Back,false,false));
   log.Add("esc again -> menu="+menu+" running="+Running);
  }
  IEnumerator UiFinishArt(string output,string tag,System.Collections.Generic.List<string> log)
  {
   // 기존 실제 창 진입 함수를 사용한다. 플레이·저장 품질을 이 정지 화면으로 판정하지 않는다.
   if(!NativeQaSandbox.Active)yield break;smokeActive=true;menu=false;Running=false;pauseMenu.Reset();
   yield return UiCapture(output,"Unity_HUD_"+tag);
   SetInventory(true);yield return UiCapture(output,"Unity_인벤토리_"+tag);SetInventory(false);Running=false;
   SetSkills(true,6);yield return UiCapture(output,"Unity_스킬_"+tag);SetSkills(false);Running=false;
   SetStats(true);yield return UiCapture(output,"Unity_능력치_"+tag);SetStats(false);Running=false;
   SetForge(true);yield return UiCapture(output,"Unity_대장간_"+tag);SetForge(false);Running=false;
   menu=true;pauseMenu.OpenSettingsDirect();yield return UiCapture(output,"Unity_설정_"+tag);pauseMenu.Reset();menu=false;Running=false;
   int present=0;for(int i=1;i<=27;i++)if(Resources.Load<Texture2D>("Art/ui/inventory/unique/ui-"+i.ToString("00")+"_cut")!=null)present++;log.Add("유니크 기존 원화 "+present+"/27, 화면 "+tag);
  }

 }
}
