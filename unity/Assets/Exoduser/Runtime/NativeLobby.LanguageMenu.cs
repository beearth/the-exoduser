using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  Vector2 languageScroll,languagePointer;bool revealLanguage,languagePointerKnown;KeyCode languageHeld=KeyCode.None;GUIStyle languageRow;
  internal bool LanguageMenuOpen=>showLanguages;
  internal int LanguageMenuCursor=>languageCursor;
  void ToggleLanguages(){
   showLanguages=!showLanguages;languageInputFence=true;
   if(showLanguages){languageCursor=0;languagePointerKnown=false;for(int i=0;i<LobbyLanguage.Count;i++)if(LobbyLanguage.GetCode(i)==Language){languageCursor=i;break;}revealLanguage=true;}
  }
  void CloseLanguageMenu(){showLanguages=false;languageInputFence=true;}
  internal bool ProcessLanguageMenuPointer(Vector2 position,int row){
   if(!showLanguages||row<0||row>=LobbyLanguage.Count)return false;
   if(languagePointerKnown&&languagePointer==position)return false;
   languagePointer=position;languagePointerKnown=true;languageCursor=row;return true;
  }
  internal bool ProcessLanguageMenuKey(KeyCode key,bool released){
   if(released){if(languageHeld==key)languageHeld=KeyCode.None;return false;}
   if(key==languageHeld)return true;
   if(key==KeyCode.L){languageHeld=key;ToggleLanguages();return true;}
   if(!showLanguages)return false;
   switch(key){
    case KeyCode.Escape:case KeyCode.Tab:languageHeld=key;CloseLanguageMenu();break;
    case KeyCode.Return:case KeyCode.KeypadEnter:case KeyCode.Space:languageHeld=key;SetLanguage(LobbyLanguage.GetCode(languageCursor));CloseLanguageMenu();break;
    case KeyCode.UpArrow:languageCursor=Mathf.Max(0,languageCursor-1);revealLanguage=true;break;
    case KeyCode.DownArrow:languageCursor=Mathf.Min(LobbyLanguage.Count-1,languageCursor+1);revealLanguage=true;break;
    case KeyCode.Home:languageCursor=0;revealLanguage=true;break;
    case KeyCode.End:languageCursor=LobbyLanguage.Count-1;revealLanguage=true;break;
   }
   return true;
  }
  void HandleLanguagePopupKeys(){
   var e=Event.current;if(CharacterModalOpen||AutomatedInput)return;
   if(e.type==EventType.KeyUp){ProcessLanguageMenuKey(e.keyCode,true);return;}
   if(e.type!=EventType.KeyDown)return;
   if(lobbyQuitPrompt){if(e.keyCode==KeyCode.Escape)lobbyQuitPrompt=false;e.Use();return;}
   if(ProcessLanguageMenuKey(e.keyCode,false))e.Use();
  }
  void DrawLanguages(Rect selector){
   // Web _langPop: one column, <=60vh, selected row kept in view.
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit);
   float width=240*unit,row=30*unit,pad=6*unit,height=Mathf.Min(648,29*row+2*pad);
   var panel=new Rect(Mathf.Clamp(selector.x,8*unit,1920-width-8*unit),Mathf.Min(selector.yMax+4*unit,1080-height-8*unit),width,height);
   // Preserve selector hit area while dismissing outside the actual list.
   var bounds=Rect.MinMaxRect(Mathf.Min(panel.xMin,selector.xMin),Mathf.Min(panel.yMin,selector.yMin),Mathf.Max(panel.xMax,selector.xMax),Mathf.Max(panel.yMax,selector.yMax));
   if(DismissOutside(bounds)){CloseLanguageMenu();return;}
   Fill(panel,new Color(10/255f,6/255f,2/255f,.95f));Border(panel,new Color(120/255f,80/255f,40/255f,.6f),1);
   if(languageRow==null)languageRow=new GUIStyle(lobbyText){alignment=TextAnchor.MiddleLeft,wordWrap=false};
   languageRow.fontSize=Mathf.RoundToInt(14*unit);
   if(revealLanguage){float top=languageCursor*row;if(top<languageScroll.y)languageScroll.y=top;else if(top+row>languageScroll.y+height-2*pad)languageScroll.y=top+row-height+2*pad;revealLanguage=false;}
   var viewport=new Rect(panel.x,panel.y+pad,panel.width,panel.height-2*pad);
   languageScroll=NativeUiAudit.BeginScrollView(viewport,languageScroll,new Rect(0,0,width-18*unit,LobbyLanguage.Count*row),false,true);
   for(int i=0;i<LobbyLanguage.Count;i++){
    var rect=new Rect(0,i*row,width-18*unit,row);string code=LobbyLanguage.GetCode(i);
    var e=Event.current;
    if(e.type==EventType.MouseMove||e.type==EventType.MouseDrag){
     var pointer=GUIUtility.GUIToScreenPoint(e.mousePosition);
     if(rect.Contains(e.mousePosition))ProcessLanguageMenuPointer(pointer,i);
    }
    if(i==languageCursor){Fill(rect,new Color(1,150/255f,80/255f,.2f));Border(rect,new Color(201/255f,169/255f,97/255f),1);}
    languageRow.normal.textColor=code==Language?new Color(1,.8f,.267f):new Color(.8f,.667f,.533f);
    Label(new Rect(16*unit,rect.y,rect.width-20*unit,rect.height),LobbyLanguageLabel(code),languageRow,TextAnchor.MiddleLeft);
    if(NativeUiAudit.Button(rect,"",GUIStyle.none)){languageCursor=i;SetLanguage(code);CloseLanguageMenu();}
   }
   NativeUiAudit.EndScrollView();
  }
 }
}
