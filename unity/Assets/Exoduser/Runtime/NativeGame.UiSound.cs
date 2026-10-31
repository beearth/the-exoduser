using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  bool uiPanelTransaction,uiPanelHotkey;
  void OnPanelHotkeyRequested(string id){uiPanelHotkey=true;try{OnPanelRequested(id);}finally{uiPanelHotkey=false;}}
  string UiPanelState(){
   if(Simulation==null||firstPractice!=null||PlayerDown||!gameFocused||(lobby!=null&&lobby.IsBlocking))return null;
   return inventory.Open?"invPanel":skills.Open?"skillPanel":stats.Open?"statPanel":forge.Open?"forge":menu?"settings":"";
  }
  void UiPanelChanged(string before){
   if(uiPanelTransaction||before==null)return;string after=UiPanelState();if(after==null||after==before)return;
   if(before.Length==0)sound?.PlayUiSample("ui_panel_open",.22f);
   else if(after.Length==0)sound?.PlayUiSample("ui_panel_close",.22f);
   else if(uiPanelHotkey)sound?.PlayUiSample("ui_panel_open",.22f);else sound?.PlayUiTab();
  }
 }
}
