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
  string nativeSettingsDirectory="";bool settingsSavePending,settingsScreenPending,settingsHostError,cinSeen;
  float settingsSaveAt;int settingsScreenGeneration,settingsBindingsVersion;Coroutine settingsScreenOwner;
  bool SettingsQaIdentity {get{return Application.productName==SettingsQaProduct&&Application.identifier==SettingsQaIdentifier;}}
  bool SettingsFixtureRequested {get{return Array.IndexOf(Environment.GetCommandLineArgs(),NativeSettingsStorageScope.FixtureArgument)>=0;}}
  void InitializeNativeSettings()
  {
   settings=new NativeSettingsState(120);cinSeen=false;var args=Environment.GetCommandLineArgs();string directory;
   if(SettingsFixtureRequested&&!SettingsQaIdentity){nativeSettingsStatus=NativeSettingsStoreStatus.IoError;return;}
   if(NativeSettingsStorageScope.TryResolve(args,NativeQaSandbox.Resolve(Application.persistentDataPath),Application.productName,Application.identifier,out directory,out nativeSettingsStatus)){
    nativeSettingsDirectory=directory;nativeSettingsStore=new NativeSettingsStore(directory,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,settings,Screen.fullScreen);
    NativeSettingsSnapshot snapshot;bool loaded=nativeSettingsStore.TryLoad(out snapshot,out nativeSettingsStatus);
    if(loaded&&snapshot!=null){string raw;cinSeen=snapshot.extra!=null&&snapshot.extra.TryGetValue("cinSeen",out raw)&&raw=="true";settings.TryRestore(snapshot.sfxPercent,snapshot.bgmPercent,snapshot.frameCap);if(snapshot.extra!=null){string rawOpt;if(snapshot.extra.TryGetValue("opt",out rawOpt))settings.Options.Decode(rawOpt);for(int slot=0;slot<settings.Presets.Length;slot++){string rawPreset;if(snapshot.extra.TryGetValue("preset"+(slot+1),out rawPreset))settings.Presets[slot]=rawPreset;}}if(nativeSettingsStatus!=NativeSettingsStoreStatus.Missing){RestoreNativeBindings(snapshot);RequestSettingsFullscreen(snapshot.fullscreen,false);}}
   }
   settingsBindingsVersion=NativeKeyBindInput.Bindings.Version;
   ApplySettingsHostValues();
  }
  static bool SupportedNativeBinding(string code)
  {
   if(code==null)return true;
   UnityEngine.KeyCode key;
   return NativeKeyBindInput.TryKey(code,out key)||code=="mouse0"||code=="mouse1"||code=="mouse2"||code=="mouse3"||code=="mouse4";
  }
  static void RestoreNativeBindings(NativeSettingsSnapshot snapshot)
  {
   NativeSettingsJsonCodec.ApplyBindings(snapshot,NativeKeyBindInput.Bindings,SupportedNativeBinding);
  }
  void ApplySettingsHostValues(){sound.SetVolumePercent(settings.SfxPercent);music.SetPercents(settings.SfxPercent,settings.BgmPercent);lobby.SetStartupSfxPercent(settings.SfxPercent);lobby.SetBgmPercent(settings.BgmPercent);ApplyFrameCap(settings.FrameCap);}
  void MarkCinematicSeen(){if(cinSeen)return;cinSeen=true;QueueSettingsSave();}
  void QueueSettingsSave(){if(nativeSettingsStore==null)return;settingsSavePending=true;settingsSaveAt=Time.unscaledTime+.25f;}
  void FlushNativeSettings()
  {
   if(nativeSettingsStore==null||!settingsSavePending)return;settingsSavePending=false;
   NativeSettingsStoreStatus saveStatus;nativeSettingsStore.TrySave(settings,Screen.fullScreen,NativeKeyBindInput.Bindings,cinSeen,out saveStatus);
   // A rejected initial load leaves the store closed. Preserve its concrete diagnostic.
   if(saveStatus!=NativeSettingsStoreStatus.NotLoaded)nativeSettingsStatus=saveStatus;
   UpdateSettingsPersistenceNotice();
  }
  void UpdateSettingsPersistence()
  {
   if(NativeKeyBindInput.Bindings.Version!=settingsBindingsVersion){settingsBindingsVersion=NativeKeyBindInput.Bindings.Version;QueueSettingsSave();}
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
  void OnApplicationQuit(){if(settingsSavePending)FlushNativeSettings();FlushCombatSave();}
 }
}
