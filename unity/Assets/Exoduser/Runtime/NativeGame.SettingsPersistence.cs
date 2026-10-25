using System;
using System.Collections;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  const string SettingsQaProduct="EXODUSER Settings QA",SettingsQaIdentifier="com.fordeargamers.exoduser.settingsqa";
  NativeSettingsStore nativeSettingsStore;NativeSettingsStoreStatus nativeSettingsStatus;
  string nativeSettingsDirectory="";bool settingsSavePending,settingsScreenPending,settingsHostError;
  float settingsSaveAt;int settingsScreenGeneration;Coroutine settingsScreenOwner;
  bool SettingsQaIdentity {get{return Application.productName==SettingsQaProduct&&Application.identifier==SettingsQaIdentifier;}}
  bool SettingsFixtureRequested {get{return Array.IndexOf(Environment.GetCommandLineArgs(),NativeSettingsStorageScope.FixtureArgument)>=0;}}
  void InitializeNativeSettings()
  {
   settings=new NativeSettingsState(120);var args=Environment.GetCommandLineArgs();string directory;
   if(SettingsFixtureRequested&&!SettingsQaIdentity){nativeSettingsStatus=NativeSettingsStoreStatus.IoError;return;}
   if(NativeSettingsStorageScope.TryResolve(args,Application.persistentDataPath,out directory,out nativeSettingsStatus)){
    nativeSettingsDirectory=directory;nativeSettingsStore=new NativeSettingsStore(directory,s=>JsonUtility.ToJson(s,true),json=>JsonUtility.FromJson<NativeSettingsSnapshot>(json),settings,Screen.fullScreen);
    NativeSettingsSnapshot snapshot;bool loaded=nativeSettingsStore.TryLoad(out snapshot,out nativeSettingsStatus);
    if(loaded&&snapshot!=null){settings.TryRestore(snapshot.sfxPercent,snapshot.bgmPercent,snapshot.frameCap);if(nativeSettingsStatus!=NativeSettingsStoreStatus.Missing)RequestSettingsFullscreen(snapshot.fullscreen,false);}
   }
   ApplySettingsHostValues();
  }
  void ApplySettingsHostValues(){sound.SetVolumePercent(settings.SfxPercent);lobby.SetStartupSfxPercent(settings.SfxPercent);lobby.SetBgmPercent(settings.BgmPercent);ApplyFrameCap(settings.FrameCap);}
  void QueueSettingsSave(){if(nativeSettingsStore==null)return;settingsSavePending=true;settingsSaveAt=Time.unscaledTime+.25f;}
  void FlushNativeSettings()
  {
   if(nativeSettingsStore==null||!settingsSavePending)return;settingsSavePending=false;
   NativeSettingsStoreStatus saveStatus;nativeSettingsStore.TrySave(settings,Screen.fullScreen,out saveStatus);
   // A rejected initial load leaves the store closed. Preserve its concrete diagnostic.
   if(saveStatus!=NativeSettingsStoreStatus.NotLoaded)nativeSettingsStatus=saveStatus;
   UpdateSettingsPersistenceNotice();
  }
  void UpdateSettingsPersistence()
  {
   if(settingsSavePending&&!settingsScreenPending&&Time.unscaledTime>=settingsSaveAt)FlushNativeSettings();UpdateSettingsPersistenceNotice();
  }
  void UpdateSettingsPersistenceNotice()
  {
   if(pauseMenu==null)return;pauseMenu.SettingsPersistenceEnabled=nativeSettingsStore!=null;
   pauseMenu.SettingsPersistenceRecovered=nativeSettingsStatus==NativeSettingsStoreStatus.RecoveredFromBackup;
   pauseMenu.SettingsPersistenceProblem=nativeSettingsStatus!=NativeSettingsStoreStatus.Missing&&nativeSettingsStatus!=NativeSettingsStoreStatus.Loaded&&nativeSettingsStatus!=NativeSettingsStoreStatus.Saved&&nativeSettingsStatus!=NativeSettingsStoreStatus.RecoveredFromBackup&&!(nativeSettingsStatus==NativeSettingsStoreStatus.NotLoaded&&nativeSettingsStore==null);pauseMenu.SettingsHostApplyPending=settingsScreenPending;pauseMenu.SettingsHostApplyFailed=settingsHostError;
  }
  void SetFullscreenPreference(bool value){RequestSettingsFullscreen(value,true);}
  void RequestSettingsFullscreen(bool value,bool save)
  {
   int generation=++settingsScreenGeneration;if(settingsScreenOwner!=null)StopCoroutine(settingsScreenOwner);
   settingsScreenPending=true;settingsHostError=false;Screen.fullScreenMode=value?FullScreenMode.FullScreenWindow:FullScreenMode.Windowed;
   settingsScreenOwner=StartCoroutine(SettleSettingsFullscreen(generation,value,save));
  }
  IEnumerator SettleSettingsFullscreen(int generation,bool value,bool save)
  {
   float deadline=Time.realtimeSinceStartup+4,stableSince=-1;
   while(generation==settingsScreenGeneration&&Time.realtimeSinceStartup<deadline){yield return null;if(Screen.fullScreen==value){if(stableSince<0)stableSince=Time.realtimeSinceStartup;if(Time.realtimeSinceStartup-stableSince>=.2f)break;}else stableSince=-1;}
   if(generation!=settingsScreenGeneration)yield break;
   settingsScreenOwner=null;settingsScreenPending=false;settingsHostError=Screen.fullScreen!=value;
   // Persist the observed host, never a stale requested bool. Menu also reads Screen.fullScreen.
   if(save)QueueSettingsSave();UpdateSettingsPersistenceNotice();
  }
  void OnApplicationQuit(){if(settingsSavePending)FlushNativeSettings();}
 }
}
