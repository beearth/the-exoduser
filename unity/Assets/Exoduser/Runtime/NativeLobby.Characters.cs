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
  public bool CharacterModalOpen {get{return characterStep!=0||CharacterStoryActive;}}
  int characterStep,characterVisual,characterScroll;
  bool characterFocus,characterInputFence,characterRestoreCreateFocus,characterVisualFocusPending;
  string characterName="",characterError="";
  [System.Serializable] sealed class CharacterDialogLabels { public CharacterDialogLabelEntry[] entries; }
  [System.Serializable] sealed class CharacterDialogLabelEntry { public string code,title,description,nameLabel,cancel,create,nameLength,forbidden,duplicate,full,comingSoon,deleteSuffix,confirm,delete,deleteFailure; }
  CharacterDialogLabels characterDialogLabels;bool characterDialogLabelsLoaded;
  void LoadCharacterDialogLabels()
  {
   if(characterDialogLabelsLoaded)return;characterDialogLabelsLoaded=true;
   var source=Resources.Load<TextAsset>("Data/character_dialog_labels");
   if(source!=null)try{characterDialogLabels=JsonUtility.FromJson<CharacterDialogLabels>(source.text);}catch(System.Exception e){Debug.LogWarning("Character dialog labels: "+e.Message);}
  }
  string CharacterDialogLabel(string field,string fallback)
  {
   if(Language=="ko")return fallback;
   LoadCharacterDialogLabels();
   CharacterDialogLabelEntry english=null;var entries=characterDialogLabels==null?null:characterDialogLabels.entries;
   if(entries!=null)foreach(var entry in entries){
    if(entry==null)continue;if(entry.code=="en")english=entry;
    if(entry.code==Language){string value=CharacterDialogValue(entry,field);if(!string.IsNullOrEmpty(value))return value;}
   }
   string en=CharacterDialogValue(english,field);return string.IsNullOrEmpty(en)?fallback:en;
  }
  static string CharacterDialogValue(CharacterDialogLabelEntry entry,string field)
  {
   if(entry==null)return null;
   switch(field){
    case "title":return entry.title;case "description":return entry.description;case "nameLabel":return entry.nameLabel;
    case "cancel":return entry.cancel;case "create":return entry.create;case "nameLength":return entry.nameLength;
    case "forbidden":return entry.forbidden;case "duplicate":return entry.duplicate;case "full":return entry.full;
    case "comingSoon":return entry.comingSoon;case "deleteSuffix":return entry.deleteSuffix;case "confirm":return entry.confirm;
    case "delete":return entry.delete;case "deleteFailure":return entry.deleteFailure;default:return null;
   }
  }
  Texture2D warriorArt,warriorPortrait;
  GUIStyle characterText,characterSmall,characterTitle,characterField,characterButton,characterDeleteButton,characterStorageText;
  void CharacterStyles()
  {
   if(characterText!=null)return;
   warriorArt=Resources.Load<Texture2D>("Art/CharacterSelect/warrior_cut");warriorPortrait=Resources.Load<Texture2D>("Art/CharacterSelect/portrait_warrior");
   characterText=new GUIStyle(lobbyText){fontSize=25,wordWrap=true,clipping=TextClipping.Clip};
   characterSmall=new GUIStyle(characterText){fontSize=20};
   characterStorageText=new GUIStyle(characterText){fontSize=16};
   characterTitle=new GUIStyle(characterText){fontSize=38};
   characterField=new GUIStyle(GUI.skin.textField){font=characterText.font,fontSize=30,padding=new RectOffset(16,16,10,10)};
   characterButton=new GUIStyle(GUI.skin.button){font=characterText.font,fontSize=24,padding=new RectOffset(12,12,8,8)};
   characterDeleteButton=new GUIStyle(characterButton){padding=new RectOffset(0,0,0,0)};
   InitializeCharacterPresentation();
  }
  public bool OpenCharacterCreation()
  {
   if(!characterWritesAllowed||Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||Characters.Count>=CharacterRoster.Capacity||showLanguages||lobbyQuitPrompt)return false;
   characterRestoreCreateFocus=false;characterVisualFocusPending=true;
   characterStep=1;characterName="";characterError="";return true;
  }
  public bool ChooseCharacterVisual(int index)
  {
   if(characterStep!=1||index<0||index>=5)return false;
   characterVisual=index;return true;
  }
  public bool ConfirmCharacterVisual()
  {
   if(characterStep!=1||characterVisual!=0)return false;
   CloseCharacterPresentationVideo();characterStep=2;characterVisualFocusPending=false;characterFocus=true;characterError="";return true;
  }
  public bool CreateCharacter(string name)
  {
   if(Flow.Page!=LobbyPage.Lobby||characterStep!=2)return false;
   var candidate=CopyCharacters();
   if(!candidate.TryCreate(name,characterVisual,out var error)){characterError=CharacterError(error);return false;}
   if(!CommitCharacters(candidate))return false;
   RevealSelectedCharacter();CloseCharacterCreation();characterRestoreCreateFocus=false;if(characterVisual==0)BeginCreatedCharacterStory();return true;
  }
  string CharacterError(CharacterCreateError error)
  {
   switch(error){
    case CharacterCreateError.NameLength:return CharacterDialogLabel("nameLength",K("이름은 2~8자여야 합니다.","Name must be 2-8 characters."));
    case CharacterCreateError.Forbidden:return CharacterDialogLabel("forbidden",K("특수문자는 사용할 수 없습니다.","Special characters cannot be used."));
    case CharacterCreateError.Duplicate:return CharacterDialogLabel("duplicate",K("이미 같은 이름의 캐릭터가 있습니다.","A character with this name already exists."));
    case CharacterCreateError.Full:return CharacterDialogLabel("full",K("슬롯이 가득 찼습니다.","All five slots are occupied."));
    default:return CharacterDialogLabel("comingSoon",K("출시 준비 중","Coming Soon"));
   }
  }
  public void CloseCharacterCreation(){characterRestoreCreateFocus=characterStep==1||characterStep==2;characterVisualFocusPending=false;CloseCharacterPresentationVideo();characterStep=0;characterError="";characterFocus=false;deletingCharacter=-1;deletingName="";deleteFocus=false;characterInputFence=true;if(Event.current!=null)GUI.FocusControl(null);}
  public bool SelectCharacter(int index){if(Flow.Page!=LobbyPage.Lobby||CharacterModalOpen)return false;if(index==Characters.SelectedIndex&&index>=0)return true;var candidate=CopyCharacters();if(!candidate.Select(index)||!CommitCharacters(candidate))return false;RevealSelectedCharacter();return true;}
  void RevealSelectedCharacter(){if(Characters.SelectedIndex<characterScroll)characterScroll=Characters.SelectedIndex;if(Characters.SelectedIndex>=characterScroll+2)characterScroll=Characters.SelectedIndex-1;characterScroll=Mathf.Clamp(characterScroll,0,Mathf.Max(0,Characters.Count-2));}
  public bool EnterSelectedCharacter()
  {
   if(Flow.Page!=LobbyPage.Lobby||CharacterModalOpen||Characters.SelectedIndex<0)return false;
   ActiveCharacterName=Characters.SelectedName;characterInputFence=true;return BeginCharacterEntry(false);
  }
  void UpdateCharacterFence(){if(characterInputFence&&!ExoInput.Key(KeyCode.Return)&&!ExoInput.Key(KeyCode.KeypadEnter)&&!ExoInput.Key(KeyCode.Escape)&&!ExoInput.Key(KeyCode.N)&&!ExoInput.Key(KeyCode.Delete)&&!ExoInput.Key(KeyCode.Backspace)&&!ExoInput.Key(KeyCode.Space))characterInputFence=false;}
  void HandleCharacterKeys()
  {
   var e=Event.current;if(AutomatedInput||e.type!=EventType.KeyDown||showLanguages||lobbyQuitPrompt)return;
   if(characterInputFence){e.Use();return;}
   if(CharacterModalOpen){
    if(CharacterDeleteOpen){HandleCharacterDeleteKeys(e);return;}
    // Enter must commit the current IME composition before it can submit a name.
    if(ExoInput.CompositionString.Length>0)return;
    if(e.keyCode==KeyCode.Escape){CloseCharacterCreation();e.Use();return;}
    if(characterStep==1){
     string focused=GUI.GetNameOfFocusedControl();
     if(e.keyCode==KeyCode.Tab){
      string[] controls=characterVisual==0?new[]{"visual-info-left","visual-info-right","visual-icon-0","visual-icon-1","visual-icon-2","visual-icon-3","visual-icon-4","visual-cancel","visual-create"}:new[]{"visual-info-left","visual-info-right","visual-icon-0","visual-icon-1","visual-icon-2","visual-icon-3","visual-icon-4","visual-cancel"};
      int at=System.Array.IndexOf(controls,focused);GUI.FocusControl(controls[at<0?(e.shift?controls.Length-1:0):(at+(e.shift?controls.Length-1:1))%controls.Length]);
     }
     else if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space){
      if(focused=="visual-cancel")CloseCharacterCreation();
      else if(focused=="visual-create")ConfirmCharacterVisual();
      else for(int n=0;n<5;n++)if(focused=="visual-icon-"+n){ChooseCharacterVisual(n);break;}
     }
     else for(int n=0;n<5;n++)if(focused=="visual-icon-"+n){
      int next=e.keyCode==KeyCode.Home?0:e.keyCode==KeyCode.End?4:e.keyCode==KeyCode.LeftArrow?Mathf.Max(0,n-1):e.keyCode==KeyCode.RightArrow?Mathf.Min(4,n+1):n;
      if(next!=n){ChooseCharacterVisual(next);GUI.FocusControl("visual-icon-"+next);}break;
     }
     e.Use();return;
    }
    if(e.keyCode==KeyCode.Tab){string focusedControl=GUI.GetNameOfFocusedControl();int at=focusedControl=="character-cancel"?1:focusedControl=="character-create"?2:0;GUI.FocusControl(new[]{"character-name","character-cancel","character-create"}[(at+(e.shift?2:1))%3]);e.Use();return;}
    if(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter){if(GUI.GetNameOfFocusedControl()=="character-cancel")CloseCharacterCreation();else CreateCharacter(characterName);e.Use();return;}
    return;
   }
   if(GUI.GetNameOfFocusedControl()=="character-create-card"&&(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space)){OpenCharacterCreation();e.Use();return;}
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
   SilverStyles();if(Characters.SelectedIndex<0){DrawAncestor();return;}EnsureSilverVisual();DrawSilverScene(new Rect(0,0,1920,1080),0);var label=Characters.SelectedName;float spacing=36*.16f,tw=SpacedWidth(silverName.font,36,label,spacing)-spacing;DrawSpaced(680-tw/2,993.6f,54,label,silverName.font,36,spacing,new Color(217/255f,214/255f,208/255f,.94f),true);string job=K("전사","WARRIOR");float jw=SpacedWidth(silverMicro.font,11,job,3.52f)-3.52f;DrawSpaced(680-jw/2,974.2f,15.4f,job,silverMicro.font,11,3.52f,new Color(195/255f,192/255f,186/255f),false);
  }
  void DrawCharacterModal()
  {
   if(!CharacterModalOpen)return;
   if(CharacterDeleteOpen){DrawCharacterDelete();return;}
   bool guiEnabled=GUI.enabled;var matrix=GUI.matrix;GUI.matrix=Matrix4x4.identity;
   if(characterStep==1)DrawCharacterVisualPresentation();else DrawCharacterNamePresentation();
   GUI.matrix=matrix;GUI.enabled=guiEnabled;
  }
 }
}
