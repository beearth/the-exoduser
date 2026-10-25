using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  int deletingCharacter=-1;
  string deletingName="";
  bool deleteSelected,deleteFocus;
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
   if(!CommitCharacters(candidate))return false;
   RevealSelectedCharacter();CloseCharacterCreation();return true;
  }
  void HandleCharacterDeleteKeys(Event e)
  {
   if(e.keyCode==KeyCode.Escape){CloseCharacterCreation();e.Use();return;}
   if(e.keyCode==KeyCode.Tab||e.keyCode==KeyCode.LeftArrow||e.keyCode==KeyCode.RightArrow){deleteSelected=!deleteSelected;deleteFocus=true;}
   else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space){if(deleteSelected)ConfirmCharacterDelete();else CloseCharacterCreation();}
   e.Use();
  }
  void DrawCharacterDelete()
  {
   Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.83f));Rect panel=new Rect(570,330,780,420);Fill(panel,new Color(.055f,.047f,.045f,.99f));Border(panel,new Color(.55f,.40f,.25f),2);
   Image(new Rect(610,380,108,108),warriorPortrait,ScaleMode.ScaleAndCrop);
   Label(new Rect(750,372,540,65),deletingName,characterTitle,TextAnchor.MiddleLeft);
   Label(new Rect(750,440,540,65),K("이 캐릭터를 삭제하시겠습니까?","Delete this character?"),characterText,TextAnchor.MiddleLeft);
   Label(new Rect(610,530,700,70),characterError.Length>0?characterError:K("캐릭터 목록에서 이름과 슬롯을 삭제합니다.","Remove this name and slot from the character list."),characterSmall,TextAnchor.UpperLeft);
   var cancel=new Rect(610,640,310,64);var confirm=new Rect(960,640,350,64);
   GUI.SetNextControlName("character-delete-cancel");if(GUI.Button(cancel,K("취소 · ESC","Cancel · ESC"),characterButton))CloseCharacterCreation();
   GUI.SetNextControlName("character-delete-confirm");if(GUI.Button(confirm,K("삭제","Delete"),characterButton))ConfirmCharacterDelete();
   Border(deleteSelected?confirm:cancel,new Color(.85f,.67f,.40f),2);
   if(deleteFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl(deleteSelected?"character-delete-confirm":"character-delete-cancel");deleteFocus=false;}
  }
 }
}
