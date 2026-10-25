using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  public CharacterRoster Characters {get;private set;}=new CharacterRoster();
  System.Func<CharacterRoster,bool> writeCharacters;
  bool characterWritesAllowed=true;
  CharacterRoster CopyCharacters(){var copy=new CharacterRoster();var names=new string[Characters.Count];for(int i=0;i<names.Length;i++)names[i]=Characters.NameAt(i);copy.TryRestore(names,Characters.SelectedIndex);return copy;}
  bool CommitCharacters(CharacterRoster candidate){if(!characterWritesAllowed||writeCharacters!=null&&!writeCharacters(candidate))return false;Characters=candidate;return true;}
  public string ActiveCharacterName {get;private set;}="";
  public bool CharacterModalOpen {get{return characterStep!=0;}}
  int characterStep,characterVisual,characterScroll;
  bool characterFocus,characterInputFence;
  string characterName="",characterError="";
  CharacterCatalog characterCatalog;Texture2D warriorArt,warriorPortrait;Texture2D[] classArt;
  GUIStyle characterText,characterSmall,characterTitle,characterField,characterButton,characterDeleteButton,characterStorageText;
  readonly string[] classEnglish={"Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"};
  void CharacterStyles()
  {
   if(characterText!=null)return;
   characterCatalog=JsonUtility.FromJson<CharacterCatalog>(Resources.Load<TextAsset>("Data/character_ui").text);
   warriorArt=Art("warrior_cut");warriorPortrait=Art("warrior_portrait");
   classArt=new[]{warriorArt,Art("character_1"),Art("character_2"),Art("character_3"),Art("character_4")};
   characterText=new GUIStyle(lobbyText){fontSize=25,wordWrap=true,clipping=TextClipping.Clip};
   characterSmall=new GUIStyle(characterText){fontSize=20};
   characterStorageText=new GUIStyle(characterText){fontSize=16};
   characterTitle=new GUIStyle(characterText){fontSize=38};
   characterField=new GUIStyle(GUI.skin.textField){font=characterText.font,fontSize=30,padding=new RectOffset(16,16,10,10)};
   characterButton=new GUIStyle(GUI.skin.button){font=characterText.font,fontSize=24,padding=new RectOffset(12,12,8,8)};
   characterDeleteButton=new GUIStyle(characterButton){padding=new RectOffset(0,0,0,0)};
  }
  public bool OpenCharacterCreation()
  {
   if(!characterWritesAllowed||Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||Characters.Count>=CharacterRoster.Capacity||showLanguages||lobbyQuitPrompt)return false;
   characterStep=1;characterVisual=0;characterName="";characterError="";return true;
  }
  public bool ChooseCharacterVisual(int index)
  {
   if(characterStep!=1||index<0||index>=5)return false;
   characterVisual=index;return true;
  }
  public bool ConfirmCharacterVisual()
  {
   if(characterStep!=1||characterVisual!=0)return false;
   characterStep=2;characterFocus=true;characterError="";return true;
  }
  public bool CreateCharacter(string name)
  {
   if(Flow.Page!=LobbyPage.Lobby||characterStep!=2)return false;
   var candidate=CopyCharacters();
   if(!candidate.TryCreate(name,characterVisual,out var error)){characterError=CharacterError(error);return false;}
   if(!CommitCharacters(candidate))return false;
   RevealSelectedCharacter();CloseCharacterCreation();return true;
  }
  string CharacterError(CharacterCreateError error)
  {
   switch(error){
    case CharacterCreateError.NameLength:return K("이름은 2~8자여야 합니다.","Use 2 to 8 characters.");
    case CharacterCreateError.Forbidden:return K("특수문자는 사용할 수 없습니다: < > \" ' & / \\","These characters are not allowed: < > \" ' & / \\");
    case CharacterCreateError.Duplicate:return K("이미 같은 이름의 캐릭터가 있습니다.","A character with this name already exists.");
    case CharacterCreateError.Full:return K("슬롯이 가득 찼습니다.","All five slots are occupied.");
    default:return K("출시 준비 중입니다.","Coming soon.");
   }
  }
  public void CloseCharacterCreation(){characterStep=0;characterError="";characterFocus=false;deletingCharacter=-1;deletingName="";deleteFocus=false;characterInputFence=true;if(Event.current!=null)GUI.FocusControl(null);}
  public bool SelectCharacter(int index){if(Flow.Page!=LobbyPage.Lobby||CharacterModalOpen)return false;if(index==Characters.SelectedIndex&&index>=0)return true;var candidate=CopyCharacters();if(!candidate.Select(index)||!CommitCharacters(candidate))return false;RevealSelectedCharacter();return true;}
  void RevealSelectedCharacter(){if(Characters.SelectedIndex<characterScroll)characterScroll=Characters.SelectedIndex;if(Characters.SelectedIndex>=characterScroll+2)characterScroll=Characters.SelectedIndex-1;characterScroll=Mathf.Clamp(characterScroll,0,Mathf.Max(0,Characters.Count-2));}
  public bool EnterSelectedCharacter()
  {
   if(Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||Characters.SelectedIndex<0)return false;
   ActiveCharacterName=Characters.SelectedName;Flow.SelectPreview();characterInputFence=true;return EnterNativeTest();
  }
  void UpdateCharacterFence(){if(characterInputFence&&!Input.GetKey(KeyCode.Return)&&!Input.GetKey(KeyCode.KeypadEnter)&&!Input.GetKey(KeyCode.Escape)&&!Input.GetKey(KeyCode.N)&&!Input.GetKey(KeyCode.Delete)&&!Input.GetKey(KeyCode.Backspace)&&!Input.GetKey(KeyCode.Space))characterInputFence=false;}
  void HandleCharacterKeys()
  {
   var e=Event.current;if(AutomatedInput||e.type!=EventType.KeyDown||showLanguages||lobbyQuitPrompt)return;
   if(characterInputFence){e.Use();return;}
   if(CharacterModalOpen){
    if(CharacterDeleteOpen){HandleCharacterDeleteKeys(e);return;}
    // Enter must commit the current IME composition before it can submit a name.
    if(Input.compositionString.Length>0)return;
    if(e.keyCode==KeyCode.Escape){CloseCharacterCreation();e.Use();return;}
    if(characterStep==1){
     if(e.keyCode==KeyCode.LeftArrow)characterVisual=Mathf.Max(0,characterVisual-1);
     else if(e.keyCode==KeyCode.RightArrow)characterVisual=Mathf.Min(4,characterVisual+1);
     else if(e.keyCode==KeyCode.Home)characterVisual=0;
     else if(e.keyCode==KeyCode.End)characterVisual=4;
     else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter)ConfirmCharacterVisual();
     else if(e.keyCode==KeyCode.Tab)characterVisual=(characterVisual+(e.shift?4:1))%5;
     e.Use();return;
    }
    if(e.keyCode==KeyCode.Tab){string focusedControl=GUI.GetNameOfFocusedControl();int at=focusedControl=="character-cancel"?1:focusedControl=="character-create"?2:0;GUI.FocusControl(new[]{"character-name","character-cancel","character-create"}[(at+(e.shift?2:1))%3]);e.Use();return;}
    if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter){if(GUI.GetNameOfFocusedControl()=="character-cancel")CloseCharacterCreation();else CreateCharacter(characterName);e.Use();return;}
    return;
   }
   if(e.keyCode==KeyCode.N){OpenCharacterCreation();e.Use();}
   else if(e.keyCode==KeyCode.Delete||e.keyCode==KeyCode.Backspace){RequestCharacterDelete(Characters.SelectedIndex);e.Use();}
   else if(e.keyCode==KeyCode.UpArrow){SelectCharacter(Mathf.Max(0,Characters.SelectedIndex-1));e.Use();}
   else if(e.keyCode==KeyCode.DownArrow){SelectCharacter(Mathf.Min(Characters.Count-1,Characters.SelectedIndex+1));e.Use();}
   else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter){EnterSelectedCharacter();e.Use();}
  }
  void DrawCharacterSlots()
  {
   Label(new Rect(1392,277,330,32),K("캐릭터 ","Characters ")+Characters.Count+" / 5",lobbyText,TextAnchor.MiddleLeft);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&characterScroll>0;if(GUI.Button(new Rect(1770,277,44,32),"▲",characterButton))characterScroll--;
   GUI.enabled=enabled&&characterScroll+2<Characters.Count;if(GUI.Button(new Rect(1822,277,44,32),"▼",characterButton))characterScroll++;GUI.enabled=enabled;
   for(int i=0;i<2;i++){
    int index=characterScroll+i;string name=Characters.NameAt(index);bool filled=name.Length>0,selected=index==Characters.SelectedIndex;
    Rect card=new Rect(1392,315+i*94,470,84);Fill(card,new Color(.12f,.105f,.11f,filled?.92f:.1f));
    if(selected)Border(card,new Color(.75f,.57f,.34f),2);else DashedBorder(card,new Color(.43f,.33f,.25f,filled?.7f:.15f));
    if(filled){Image(new Rect(1404,327+i*94,60,60),warriorPortrait,ScaleMode.ScaleAndCrop);Label(new Rect(1483,325+i*94,320,34),name,characterSmall,TextAnchor.MiddleLeft);Label(new Rect(1483,361+i*94,320,24),CharacterSlotCaption(),lobbyText,TextAnchor.MiddleLeft);if(GUI.Button(new Rect(1814,337+i*94,36,36),new GUIContent("×",K("캐릭터 삭제","Delete character")),characterDeleteButton))RequestCharacterDelete(index);if(GUI.Button(new Rect(card.x,card.y,410,card.height),"",GUIStyle.none))SelectCharacter(index);}
    else Label(card,"—",lobbyMode,TextAnchor.MiddleCenter);
   }
  }
  void DrawSelectedCharacter()
  {
   if(Characters.SelectedIndex<0){DrawAncestor();return;}
   Image(new Rect(290,220,700,760),warriorArt);
   Label(new Rect(250,910,790,68),Characters.SelectedName,characterTitle,TextAnchor.MiddleCenter);
   Label(new Rect(250,982,790,40),K("전사 · 플레이 미리보기","Warrior · Play preview"),characterSmall,TextAnchor.MiddleCenter);
  }
  void DrawCharacterModal()
  {
   if(!CharacterModalOpen)return;
   if(CharacterDeleteOpen){DrawCharacterDelete();return;}
   Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.83f));Rect panel=new Rect(350,100,1220,880);Fill(panel,new Color(.055f,.047f,.045f,.99f));Border(panel,new Color(.55f,.40f,.25f),2);
   Label(new Rect(400,125,1120,65),K("새 캐릭터","New character"),characterTitle,TextAnchor.MiddleLeft);
   for(int i=0;i<5;i++){
    Rect tab=new Rect(400+i*224,211,212,74);Fill(tab,new Color(.10f,.085f,.08f));Border(tab,i==characterVisual?new Color(.8f,.61f,.38f):new Color(.3f,.25f,.20f),i==characterVisual?2:1);
    string name=K(characterCatalog.visuals[i].name,classEnglish[i]);Label(new Rect(tab.x+8,tab.y+7,196,34),name,characterSmall,TextAnchor.MiddleCenter);
    Label(new Rect(tab.x+8,tab.y+43,196,24),i==0?K("생성 가능","Available"):K("출시 준비 중","Coming soon"),lobbyText,TextAnchor.MiddleCenter);
    if(characterStep==1&&GUI.Button(tab,"",GUIStyle.none))ChooseCharacterVisual(i);
   }
   var artTint=GUI.color;if(characterVisual!=0)GUI.color=new Color(.45f,.45f,.45f,1);
   Image(new Rect(395,310,470,570),classArt[characterVisual]);GUI.color=artTint;
   if(characterVisual!=0){Fill(new Rect(395,785,470,80),new Color(.03f,.025f,.025f,.90f));Label(new Rect(420,795,420,60),K("출시 준비 중","Coming soon"),characterTitle,TextAnchor.MiddleCenter);}
   Label(new Rect(900,330,600,70),K(characterCatalog.visuals[characterVisual].name,classEnglish[characterVisual]),characterTitle,TextAnchor.MiddleLeft);
   Label(new Rect(900,417,600,90),K(characterCatalog.visuals[characterVisual].description,characterVisual==0?"A black-iron warrior wielding a greatsword.":"This class is not available yet."),characterText,TextAnchor.UpperLeft);
   Label(new Rect(900,530,600,105),CharacterCreationNote(),characterSmall,TextAnchor.UpperLeft);
   if(characterStep==2){
    Label(new Rect(900,652,600,38),K("캐릭터 이름 (2~8자)","Character name (2–8 characters)"),characterText,TextAnchor.MiddleLeft);
    GUI.SetNextControlName("character-name");characterName=GUI.TextField(new Rect(900,698,600,64),characterName,8,characterField);
    if(characterFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl("character-name");characterFocus=false;}
    Label(new Rect(900,775,600,70),characterError,characterSmall,TextAnchor.UpperLeft);
   }else Label(new Rect(900,665,600,90),K("← → 화신 선택 · Enter 이름 입력","← → Choose class · Enter to name"),characterSmall,TextAnchor.UpperLeft);
   GUI.SetNextControlName("character-cancel");if(GUI.Button(new Rect(900,870,220,60),K("취소 · ESC","Cancel · ESC"),characterButton))CloseCharacterCreation();
   bool enabled=GUI.enabled;GUI.enabled=enabled&&characterVisual==0;
   GUI.SetNextControlName("character-create");if(GUI.Button(new Rect(1150,870,350,60),characterStep==1?K("이름 입력","Choose a name"):K("캐릭터 생성","Create character"),characterButton)){if(characterStep==1)ConfirmCharacterVisual();else CreateCharacter(characterName);}GUI.enabled=enabled;
  }
 }
}
