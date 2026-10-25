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
  [Serializable] sealed class SettingsPersistenceReceipt{public string scope,phase,product,identifier,persistentDataPath,directory,status;public bool passed,fullscreen,expectedFullscreen,settingsPending;public int failures,sfx,bgm,frameCap,hostFrameCap,vsync;public float sampleVolume,bgmVolume,expectedSampleVolume,bgmRelativeGain;public string[] checks;}
  IEnumerator SettingsPersistenceFixture()
  {
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};string output=Argument("-output"),phase=Argument("-settings-phase");
   if(!SettingsQaIdentity||nativeSettingsStore==null||string.IsNullOrWhiteSpace(output)||!Path.IsPathRooted(output)){Debug.LogError("Settings fixture refuses normal product identity or missing isolated output");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);lobby.ShowLobby();menu=true;Running=false;pauseMenu.ShowSettings();
   check(nativeSettingsDirectory==Path.Combine(Path.GetFullPath(output),"native-settings-v1"),"explicit output settings directory");check(lobby.CharacterStoreDirectory=="","settings fixture opens no normal character roster");check(SettingsQaIdentity,"distinct Settings QA product and explicit bundle identifier");
   float deadline=Time.realtimeSinceStartup+6;while(settingsScreenPending&&Time.realtimeSinceStartup<deadline)yield return null;
   if(phase=="write"){
    SetSfxPercent(35);SetBgmPercent(45);SetFrameCap(144);SetFullscreenPreference(false);SetFullscreenPreference(true);
    deadline=Time.realtimeSinceStartup+6;while(settingsScreenPending&&Time.realtimeSinceStartup<deadline)yield return null;FlushNativeSettings();
    check(nativeSettingsStatus==NativeSettingsStoreStatus.Saved,"write phase atomically publishes latest settings");check(Screen.fullScreen,"last fullscreen toggle wins without stale coroutine save");
   }else if(phase=="read"){
    check(nativeSettingsStatus==NativeSettingsStoreStatus.Loaded,"second process loads native settings");check(settings.SfxPercent==35&&settings.BgmPercent==45&&settings.FrameCap==144&&Screen.fullScreen,"second process restores values and actual fullscreen");
   }else if(phase=="invalid"){
    check(nativeSettingsStatus==NativeSettingsStoreStatus.InvalidData||nativeSettingsStatus==NativeSettingsStoreStatus.WrongSchema||nativeSettingsStatus==NativeSettingsStoreStatus.UnsupportedVersion||nativeSettingsStatus==NativeSettingsStoreStatus.TooLarge,"invalid input is rejected without overwriting");check(settings.SfxPercent==60&&settings.BgmPercent==60&&settings.FrameCap==120,"invalid input preserves existing native launch defaults");
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
   pauseMenu.Navigation.ObserveReleased(false);pauseMenu.Navigation.SelectTab(0);yield return UiCapture(output,"settings-"+phase+"-display");pauseMenu.Navigation.SelectTab(1);yield return UiCapture(output,"settings-"+phase+"-audio");
   File.WriteAllText(Path.Combine(output,"settings-"+phase+".json"),JsonUtility.ToJson(new SettingsPersistenceReceipt{scope="Narrow explicit Settings QA Player run; write and read are separate processes. Scripted production callbacks and host/audio/pixel captures, not OS keyboard/mouse input or full pause/HUD suite.",phase=phase,product=Application.productName,identifier=Application.identifier,persistentDataPath=Application.persistentDataPath,directory=nativeSettingsDirectory,status=nativeSettingsStatus.ToString(),passed=failures==0,failures=failures,sfx=settings.SfxPercent,bgm=settings.BgmPercent,frameCap=settings.FrameCap,hostFrameCap=Application.targetFrameRate,vsync=QualitySettings.vSyncCount,fullscreen=Screen.fullScreen,expectedFullscreen=phase=="write"||phase=="read"?true:Screen.fullScreen,settingsPending=settingsScreenPending,sampleVolume=sample==null?-1:sample.volume,expectedSampleVolume=settings.SampleOutputGain(.5f),bgmRelativeGain=settings.BgmRelativeGain,bgmVolume=music==null?-1:music.volume,checks=checks.ToArray()},true));
   lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
 }
}
