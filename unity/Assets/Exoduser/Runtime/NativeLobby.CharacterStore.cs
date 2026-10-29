using System;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  CharacterRosterStore characterStore;
  public CharacterStoreStatus CharacterStoreState {get;private set;}
  public string CharacterStoreDirectory {get;private set;}="";
  bool characterStoreProblem;
  void InitializeCharacterStore()
  {
   var args=Environment.GetCommandLineArgs();string cinematicRoot;bool cinematicReview=Array.IndexOf(args,NativeSettingsStorageScope.CinematicReviewArgument)>=0;
   if(cinematicReview&&!NativeSettingsStorageScope.TryResolveCinematicReview(args,Application.productName,Application.identifier,out cinematicRoot)){characterWritesAllowed=false;characterStoreProblem=true;CharacterStoreState=CharacterStoreStatus.IoError;return;}
   bool fixture=false;bool review=cinematicReview||Array.IndexOf(args,"--unity-frontend-review")>=0||Array.IndexOf(args,"--unity-startup-capture")>=0||Array.IndexOf(args,"--unity-first-practice-review")>=0||Array.IndexOf(args,"--unity-first-practice-capture")>=0||Array.IndexOf(args,NativeGame.CombatSaveCaptureFlag)>=0||Array.IndexOf(args,"--unity-m1-check")>=0;
   foreach(string arg in args)if(arg.StartsWith("--unity-",StringComparison.Ordinal)&&arg.EndsWith("-smoke",StringComparison.Ordinal))fixture=true;
   if(fixture&&Array.IndexOf(args,"--unity-character-store-smoke")<0)return;
   if(fixture||review){int at=Array.IndexOf(args,"-output");if(at<0||at+1>=args.Length||string.IsNullOrWhiteSpace(args[at+1])||args[at+1].StartsWith("-",StringComparison.Ordinal)){characterWritesAllowed=false;characterStoreProblem=true;CharacterStoreState=CharacterStoreStatus.IoError;return;}CharacterStoreDirectory=Path.Combine(Path.GetFullPath(args[at+1]),"character-roster-v1");}
   else CharacterStoreDirectory=Path.Combine(NativeQaSandbox.Resolve(Application.persistentDataPath),"character-roster-v1");
   characterStore=new CharacterRosterStore(CharacterStoreDirectory,value=>JsonUtility.ToJson(value,true),json=>JsonUtility.FromJson<CharacterRosterSnapshot>(json));
   bool loaded=characterStore.TryLoad(out var snapshot,out var status);CharacterStoreState=status;
   if(!loaded||snapshot==null||!Characters.TryRestore(snapshot.names,snapshot.selectedIndex)){characterWritesAllowed=false;characterStoreProblem=true;return;}
   RevealSelectedCharacter();writeCharacters=SaveCharacterRoster;
  }
  bool SaveCharacterRoster(CharacterRoster candidate)
  {
   bool saved=characterStore.TrySave(candidate,out var status);CharacterStoreState=status;characterStoreProblem=!saved;
   if(!saved){characterError=CharacterStoreError();return false;}
   return true;
  }
  string CharacterStoreError()
  {
   if(CharacterStoreState==CharacterStoreStatus.Conflict)return K("다른 실행에서 목록이 바뀌었습니다. 앱을 다시 열어 주세요.","The list changed in another instance. Reopen the app.");
   if(CharacterStoreState==CharacterStoreStatus.UnsupportedVersion||CharacterStoreState==CharacterStoreStatus.WrongSchema)return K("이 버전에서 읽을 수 없는 캐릭터 목록입니다. 파일은 보존했습니다.","This character list is not supported by this version. The file was preserved.");
   return K("캐릭터 목록을 저장하거나 불러오지 못했습니다. 기존 목록은 보존했습니다.","Could not save or load the character list. The previous list was preserved.");
  }
  string CharacterPersistenceNote()
  {
   if(characterStoreProblem)return CharacterStoreError();
   if(characterStore!=null&&CharacterStoreState==CharacterStoreStatus.RecoveredFromBackup)return K("백업에서 캐릭터 목록을 복원했습니다.\n전투 진행은 저장되지 않습니다.","The character list was recovered from backup.\nBattle progress is not saved.");
   return characterStore==null?K("미리보기의 진행 상황은 저장되지 않습니다.","Preview progress is not saved."):K("캐릭터 목록은 "+NativePlatformLabel.Ko+"에 저장됩니다.\n전투 진행은 저장되지 않습니다.","The character list is saved on "+NativePlatformLabel.En+".\nBattle progress is not saved.");
  }
  string CharacterCreationNote(){return characterStore==null?K("이번 실행에서만 유지되는 캐릭터입니다.\n입장할 때 새 전투가 시작되며 진행은 저장되지 않습니다.","Characters last for this app session.\nEach entry starts a new battle; progress is not saved."):K("캐릭터 이름과 슬롯은 "+NativePlatformLabel.Ko+"에 저장됩니다.\n전투 진행은 저장되지 않으며 입장할 때 새 전투가 시작됩니다.","Character names and slots are saved on "+NativePlatformLabel.En+".\nEach entry starts a new battle; battle progress is not saved.");}
  string CharacterSlotCaption(){return characterStore==null?K("전사 · 이번 실행에서만 유지","Warrior · This session only"):K("전사 · "+NativePlatformLabel.Ko+"에 저장","Warrior · Saved on "+NativePlatformLabel.En);}
 }
}
