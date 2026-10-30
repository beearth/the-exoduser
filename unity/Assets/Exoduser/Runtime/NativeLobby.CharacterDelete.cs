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
  void CharacterDeleteStyles()
  {
   if(deleteMessageStyle!=null)return;
   deleteMessageStyle=new GUIStyle(characterSmall){fontSize=18,alignment=TextAnchor.MiddleCenter,wordWrap=true};deleteMessageStyle.normal.textColor=new Color(.8f,.667f,.467f);
   deleteConfirmStyle=new GUIStyle(characterButton){fontSize=17,alignment=TextAnchor.MiddleCenter};deleteConfirmStyle.normal.textColor=new Color(1,.267f,.267f);
   deleteCancelStyle=new GUIStyle(characterButton){fontSize=17,alignment=TextAnchor.MiddleCenter};deleteCancelStyle.normal.textColor=new Color(.667f,.533f,.4f);
  }
  public bool CharacterDeleteOpen {get{return characterStep==3;}}
  public bool RequestCharacterDelete(int index)
  {
   if(!characterWritesAllowed||Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||showLanguages||lobbyQuitPrompt||index<0||index>=Characters.Count)return false;
   deletingCharacter=index;deletingName=Characters.NameAt(index);deleteSelected=false;deleteFocus=true;characterStep=3;characterError="";return true;
  }
  public bool ConfirmCharacterDelete()
  {
   if(!CharacterDeleteOpen||Flow.Page!=LobbyPage.Lobby)return false;
   // Bind confirmation to the identity displayed, not a slot that may have moved.
   var candidate=CopyCharacters();
   if(Characters.NameAt(deletingCharacter)!=deletingName||!candidate.TryRemove(deletingCharacter)){CloseCharacterCreation();return false;}
   string removedName=deletingName;
   if(!CommitCharacters(candidate))return false;
   CharacterDeleted?.Invoke(removedName);   // E03: the character's combat save goes with it (a re-created name must not inherit it)
   RevealSelectedCharacter();CloseCharacterCreation();return true;
  }
  void HandleCharacterDeleteKeys(Event e)
  {
   if(e.keyCode==KeyCode.Escape){CloseCharacterCreation();e.Use();return;}
   if(e.keyCode==KeyCode.Tab){deleteSelected=!deleteSelected;deleteFocus=true;}
   else if(e.keyCode==KeyCode.LeftArrow){deleteSelected=true;deleteFocus=true;}
   else if(e.keyCode==KeyCode.RightArrow){deleteSelected=false;deleteFocus=true;}
   else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space){if(deleteSelected)ConfirmCharacterDelete();else CloseCharacterCreation();}
   e.Use();
  }
  void DrawCharacterDelete()
  {
   CharacterDeleteStyles();Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.85f));
   Rect panel=new Rect(727,425,466,230);Fill(panel,new Color(.102f,.078f,.063f));Border(panel,new Color(.4f,.2f,.133f),2);
   string message=deletingName+CharacterDialogLabel("deleteSuffix",K(" 캐릭터를 정말 삭제하시겠습니까?"," — Really delete this character?"));
   Label(new Rect(759,445,402,104),message,deleteMessageStyle,TextAnchor.MiddleCenter);
   var confirm=new Rect(784,562,170,46);var cancel=new Rect(966,562,170,46);
   Fill(confirm,new Color(.22f,.035f,.035f));Border(confirm,new Color(.533f,0,0),1);
   Fill(cancel,new Color(.063f,.055f,.047f));Border(cancel,new Color(.333f,.267f,.2f),1);
   GUI.SetNextControlName("character-delete-confirm");if(NativeUiAudit.Button(confirm,"",GUIStyle.none))ConfirmCharacterDelete();
   GUI.SetNextControlName("character-delete-cancel");if(NativeUiAudit.Button(cancel,"",GUIStyle.none))CloseCharacterCreation();
   Label(confirm,CharacterDialogLabel("confirm",K("확인","Confirm")),deleteConfirmStyle,TextAnchor.MiddleCenter);
   Label(cancel,CharacterDialogLabel("cancel",K("취소","Cancel")),deleteCancelStyle,TextAnchor.MiddleCenter);
   Border(deleteSelected?confirm:cancel,new Color(.788f,.663f,.38f),2);
   if(deleteFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl(deleteSelected?"character-delete-confirm":"character-delete-cancel");deleteFocus=false;}
  }
 }
}
