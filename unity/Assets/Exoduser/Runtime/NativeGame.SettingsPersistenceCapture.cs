using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
   [Serializable] sealed class SettingsPersistenceReceipt{public string scope,phase,product,identifier,persistentDataPath,directory,status;public bool passed,fullscreen,expectedFullscreen,settingsPending,xbowOption,xbowRuntime;public int failures,sfx,bgm,frameCap,hostFrameCap,vsync;public float sampleVolume,bgmVolume,expectedSampleVolume,bgmRelativeGain;public string[] checks;}
  IEnumerator SettingsPersistenceFixture()
  {
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};string output=Argument("-output"),phase=Argument("-settings-phase");
   if(!SettingsQaIdentity||nativeSettingsStore==null||string.IsNullOrWhiteSpace(output)||!Path.IsPathRooted(output)){Debug.LogError("Settings fixture refuses normal product identity or missing isolated output");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);lobby.ShowLobby();menu=true;Running=false;pauseMenu.ShowSettings();
   check(nativeSettingsDirectory==Path.Combine(Path.GetFullPath(output),"native-settings-v1"),"explicit output settings directory");check(lobby.CharacterStoreDirectory=="","settings fixture opens no normal character roster");check(SettingsQaIdentity,"distinct Settings QA product and explicit bundle identifier");
   float deadline=Time.realtimeSinceStartup+6;while(settingsScreenPending&&Time.realtimeSinceStartup<deadline)yield return null;
   if(phase=="write"){
     settings.Options.Set("xbowAuto",1);OnSettingsOptionChanged("xbowAuto");check(Simulation.CrossbowAuto,"설정 ON이 실제 자동 석궁에 적용");
     ToggleCrossbow();check(!Simulation.CrossbowAuto&&!settings.Options.Check("xbowAuto"),"T 토글이 실제 석궁·설정 값을 함께 OFF로 변경");
    SetSfxPercent(35);SetBgmPercent(45);SetFrameCap(144);SetFullscreenPreference(false);SetFullscreenPreference(true);
    deadline=Time.realtimeSinceStartup+6;while(settingsScreenPending&&Time.realtimeSinceStartup<deadline)yield return null;FlushNativeSettings();
    check(nativeSettingsStatus==NativeSettingsStoreStatus.Saved,"write phase atomically publishes latest settings");check(Screen.fullScreen,"last fullscreen toggle wins without stale coroutine save");
   }else if(phase=="read"){
     check(!settings.Options.Check("xbowAuto")&&!Simulation.CrossbowAuto,"새 프로세스에서 자동 석궁 OFF 설정과 실제 동작 복원");
    check(nativeSettingsStatus==NativeSettingsStoreStatus.Loaded,"second process loads native settings");check(settings.SfxPercent==35&&settings.BgmPercent==45&&settings.FrameCap==144&&Screen.fullScreen,"second process restores values and actual fullscreen");
   }else if(phase=="invalid"){
    check(nativeSettingsStatus==NativeSettingsStoreStatus.InvalidData||nativeSettingsStatus==NativeSettingsStoreStatus.WrongSchema||nativeSettingsStatus==NativeSettingsStoreStatus.UnsupportedVersion||nativeSettingsStatus==NativeSettingsStoreStatus.TooLarge,"invalid input is rejected without overwriting");check(settings.SfxPercent==60&&settings.BgmPercent==60&&settings.FrameCap==120,"invalid input preserves existing native launch defaults");
    var rejectedStatus=nativeSettingsStatus;string rejectedFile=Path.Combine(nativeSettingsDirectory,NativeSettingsStore.DataFileName);byte[] rejectedBytes=File.ReadAllBytes(rejectedFile);
    SetSfxPercent(25);FlushNativeSettings();
    check(nativeSettingsStatus==rejectedStatus&&pauseMenu.SettingsPersistenceProblem,"editing after rejected load preserves concrete error and problem notice");
    check(Convert.ToBase64String(rejectedBytes)==Convert.ToBase64String(File.ReadAllBytes(rejectedFile)),"editing after rejected load never overwrites original bytes");
    check(settings.SfxPercent==25,"editing rejected-file session retains valid live SFX value");
   }else if(phase=="defaults"){
    pauseMenu.Navigation.ObserveReleased(false);pauseMenu.HandleKey(PauseKey.End,false,Screen.fullScreen);pauseMenu.Navigation.ObserveReleased(false);pauseMenu.HandleKey(PauseKey.Up,false,Screen.fullScreen);pauseMenu.Navigation.ObserveReleased(false);pauseMenu.HandleKey(PauseKey.Accept,false,Screen.fullScreen);FlushNativeSettings();
    check(settings.SfxPercent==60&&settings.BgmPercent==60&&settings.FrameCap==0&&Application.targetFrameRate==-1,"existing Restore defaults reaches host and stored values");
   }else if(phase=="write-failure"){
    string primary=Path.Combine(nativeSettingsDirectory,NativeSettingsStore.DataFileName);byte[] before=File.Exists(primary)?File.ReadAllBytes(primary):null;Directory.CreateDirectory(nativeSettingsDirectory);
    using(var locked=new FileStream(Path.Combine(nativeSettingsDirectory,NativeSettingsStore.LockFileName),FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None)){SetSfxPercent(25);FlushNativeSettings();check(nativeSettingsStatus==NativeSettingsStoreStatus.Busy,"busy writer reports failure");check(before==null?!File.Exists(primary):Convert.ToBase64String(before)==Convert.ToBase64String(File.ReadAllBytes(primary)),"write failure preserves last disk bytes");check(settings.SfxPercent==25,"write failure retains valid current session value");}
   }else{check(false,"recognized write/read/invalid/defaults/write-failure phase");}
   check(Application.targetFrameRate==settings.UnityFrameCap&&QualitySettings.vSyncCount==0,"FPS UI value matches actual host without changing simulation clock");check(Mathf.Abs(Time.fixedDeltaTime-1f/60)<.000001f,"fixed simulation timestep unchanged");
   var flags=BindingFlags.Instance|BindingFlags.NonPublic;typeof(NativeFeedbackAudio).GetMethod("Play",flags).Invoke(sound,new object[]{"sword_swing1",.5f,1f,10});AudioSource sample=null,music=null;foreach(var source in GetComponentsInChildren<AudioSource>()){if(source.gameObject.name=="Original SFX voice")sample=source;if(source.clip!=null&&source.clip.name=="lobby")music=source;}
   check(sample!=null&&Mathf.Abs(sample.volume-settings.SampleOutputGain(.5f))<.00001f,"restored SFX reaches actual sample source");check(music!=null&&Mathf.Abs(music.volume-.65f*settings.BgmRelativeGain)<.00001f,"restored BGM reaches actual lobby source");
   float measuredSampleVolume=sample==null?-1:sample.volume,measuredBgmVolume=music==null?-1:music.volume;
   // Probe lobby audio first, then use the existing preview route so lobby GUI cannot cover settings.
   lobby.SelectPreview();bool previewEntered=lobby.EnterNativeTest();menu=true;Running=false;pauseMenu.ShowSettings();
   yield return null;yield return new WaitForEndOfFrame();
   check(previewEntered&&!lobby.IsBlocking&&pauseMenu.SettingsOpen,"preview renders actual settings UI without blocking lobby");
   pauseMenu.Navigation.ObserveReleased(false);pauseMenu.Navigation.SelectTab(0);yield return UiCapture(output,"settings-"+phase+"-display");pauseMenu.Navigation.SelectTab(1);yield return UiCapture(output,"settings-"+phase+"-audio");
    File.WriteAllText(Path.Combine(output,"settings-"+phase+".json"),JsonUtility.ToJson(new SettingsPersistenceReceipt{scope="명시적 격리 Settings QA Player. 쓰기/읽기는 별도 프로세스이며 제품 콜백·실제 호스트/오디오/화면 검수. OS 손조작 및 전체 HUD/일시정지 검수와 별도.",phase=phase,product=Application.productName,identifier=Application.identifier,persistentDataPath=Application.persistentDataPath,directory=nativeSettingsDirectory,status=nativeSettingsStatus.ToString(),passed=failures==0,failures=failures,sfx=settings.SfxPercent,bgm=settings.BgmPercent,frameCap=settings.FrameCap,hostFrameCap=Application.targetFrameRate,vsync=QualitySettings.vSyncCount,fullscreen=Screen.fullScreen,expectedFullscreen=phase=="write"||phase=="read"?true:Screen.fullScreen,settingsPending=settingsScreenPending,xbowOption=settings.Options.Check("xbowAuto"),xbowRuntime=Simulation.CrossbowAuto,sampleVolume=measuredSampleVolume,expectedSampleVolume=settings.SampleOutputGain(.5f),bgmRelativeGain=settings.BgmRelativeGain,bgmVolume=measuredBgmVolume,checks=checks.ToArray()},true));
   lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
 }
}
