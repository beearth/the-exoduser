using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  int deletingCharacter=-1;
  string deletingName="";
  bool deleteSelected,deleteFocus;
  GUIStyle deleteMessageStyle,deleteConfirmStyle,deleteCancelStyle;
  internal string DeleteDialogFontName;
  void CharacterDeleteStyles()
  {
   if(deleteMessageStyle!=null)return;
   // 확인 창 글자도 게임 명조(Hahmlet) 토큰. 스킨 버튼에서 복사하던 기본 회색 그라데이션 바탕을 쓰지 않는다(2026-11-03 재질 정리).
   deleteMessageStyle=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.Font(true),fontSize=19,alignment=TextAnchor.MiddleCenter,wordWrap=true,padding=new RectOffset(),margin=new RectOffset()};deleteMessageStyle.normal.textColor=NativeSilverHellUi.PlateText;
   deleteConfirmStyle=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.Font(true),fontSize=17,alignment=TextAnchor.MiddleCenter,wordWrap=false,padding=new RectOffset(),margin=new RectOffset()};deleteConfirmStyle.normal.textColor=NativeSilverHellUi.PlateTextDanger;
   deleteCancelStyle=new GUIStyle(deleteConfirmStyle);deleteCancelStyle.normal.textColor=NativeSilverHellUi.PlateText;
  }
  public bool CharacterDeleteOpen {get{return characterStep==3;}}
  public bool RequestCharacterDelete(int index)
  {
   if(!characterWritesAllowed||Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||showLanguages||lobbyQuitPrompt||index<0||index>=Characters.Count)return false;
   UiConfirm();deletingCharacter=index;deletingName=Characters.NameAt(index);deleteSelected=false;deleteFocus=true;characterStep=3;characterError="";return true;
  }
  public bool ConfirmCharacterDelete()
  {
   // This visual fixture may open the real dialog, but must never commit a deletion, even from accidental input.
   if(System.Array.IndexOf(System.Environment.GetCommandLineArgs(),"--unity-death-ui-smoke")>=0)return false;
   if(!CharacterDeleteOpen||Flow.Page!=LobbyPage.Lobby)return false;
   // Bind confirmation to the identity displayed, not a slot that may have moved.
   var candidate=CopyCharacters();
   if(Characters.NameAt(deletingCharacter)!=deletingName||!candidate.TryRemove(deletingCharacter)){CloseCharacterCreation();return false;}
   string removedName=deletingName;
   if(!CommitCharacters(candidate))return false;
   NativeDecisionSound.Play("delete");CharacterDeleted?.Invoke(removedName);   // E03: the character's combat save goes with it (a re-created name must not inherit it)
   RevealSelectedCharacter();CloseCharacterCreation();NativeUiSounds.Current?.SuppressConfirm();return true;
  }
  void HandleCharacterDeleteKeys(Event e)
  {
   if(e.keyCode==KeyCode.Escape){CloseCharacterCreation();e.Use();return;}
   bool before=deleteSelected;
   if(e.keyCode==KeyCode.Tab){deleteSelected=!deleteSelected;deleteFocus=true;}
   else if(e.keyCode==KeyCode.LeftArrow){deleteSelected=true;deleteFocus=true;}
   else if(e.keyCode==KeyCode.RightArrow){deleteSelected=false;deleteFocus=true;}
   else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space){if(deleteSelected)ConfirmCharacterDelete();else CloseCharacterCreation();}
   if(deleteSelected!=before)UiNavigate(deleteSelected?"character-delete-confirm":"character-delete-cancel");e.Use();
  }
  void DrawCharacterDelete()
  {
   CharacterDeleteStyles();Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.85f));
   Rect panel=new Rect(727,425,466,230);NativeSilverHellUi.Panel(panel,28,8,iron:true);
   string message=deletingName+CharacterDialogLabel("deleteSuffix",K(" 캐릭터를 정말 삭제하시겠습니까?"," — Really delete this character?"));
   deleteMessageStyle.font=CharacterDialogFont(message);DeleteDialogFontName=deleteMessageStyle.font==null?"missing":deleteMessageStyle.font.name;Label(new Rect(759,445,402,104),message,deleteMessageStyle,TextAnchor.MiddleCenter);
   var confirm=new Rect(784,562,170,46);var cancel=new Rect(966,562,170,46);
   bool overConfirm=confirm.Contains(Event.current.mousePosition),overCancel=cancel.Contains(Event.current.mousePosition);
   NativeSilverHellUi.ActionPlate(confirm,false,deleteSelected||overConfirm?1:0,!AutomatedInput&&overConfirm&&ExoInput.Mouse(0),22,2);
   NativeSilverHellUi.ActionPlate(cancel,false,!deleteSelected||overCancel?1:0,!AutomatedInput&&overCancel&&ExoInput.Mouse(0),22,2);
   GUI.SetNextControlName("character-delete-confirm");if(DecisionSoundButton(confirm))ConfirmCharacterDelete();
   GUI.SetNextControlName("character-delete-cancel");if(NativeUiAudit.Button(cancel,"",GUIStyle.none))CloseCharacterCreation();
   string confirmText=CharacterDialogLabel("confirm",K("확인","Confirm")),cancelText=CharacterDialogLabel("cancel",K("취소","Cancel"));
   deleteConfirmStyle.font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),confirmText);deleteCancelStyle.font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),cancelText);
   Label(confirm,confirmText,deleteConfirmStyle,TextAnchor.MiddleCenter);
   Label(cancel,cancelText,deleteCancelStyle,TextAnchor.MiddleCenter);
   if(deleteFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl(deleteSelected?"character-delete-confirm":"character-delete-cancel");deleteFocus=false;}
  }
 }
}
