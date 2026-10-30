using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeInventory {
  public InventoryNavigation Navigation {get;private set;}
  public bool ShowingDetails {get{return detailOnly;}}
  public float DetailScrollOffset {get{return detailScroll.y;}}
  static readonly KeyCode[] inventoryKeys={KeyCode.Tab,KeyCode.Escape,KeyCode.Return,KeyCode.KeypadEnter,KeyCode.LeftArrow,KeyCode.RightArrow,KeyCode.UpArrow,KeyCode.DownArrow,KeyCode.Home,KeyCode.End,KeyCode.C,KeyCode.PageUp,KeyCode.PageDown};
  public void SetFocus(bool focus){Navigation.SetFocus(focus);drag=null;dragging=false;}
  public bool PollKeys(int level){
   bool held=ExoInput.Mouse(0)||ExoInput.Mouse(1);foreach(var key in inventoryKeys)held|=ExoInput.Key(key);held|=NativeKeyBindInput.Held("inventory");Navigation.ObserveReleased(held);   // A16: the inventory key is a web binding
   if(!Navigation.Focused||Navigation.WaitingForRelease)return false;
   InventoryKey? input=null;
   if(NativeKeyBindInput.Down("inventory")||ExoInput.KeyDown(KeyCode.Escape))input=InventoryKey.Close;   // web: BINDS.inventory toggles the window, ESC is the fixed back key
   else if(ExoInput.KeyDown(KeyCode.LeftArrow))input=InventoryKey.Left;else if(ExoInput.KeyDown(KeyCode.RightArrow))input=InventoryKey.Right;
   else if(ExoInput.KeyDown(KeyCode.UpArrow))input=InventoryKey.Up;else if(ExoInput.KeyDown(KeyCode.DownArrow))input=InventoryKey.Down;
   else if(ExoInput.KeyDown(KeyCode.Home))input=InventoryKey.Home;else if(ExoInput.KeyDown(KeyCode.End))input=InventoryKey.End;
   // A07b: G no longer switches bag/equipment panes; it is left unconsumed so the window layer can treat it as the web forge key.
   else if(ExoInput.KeyDown(KeyCode.C))input=InventoryKey.Details;
   else if(ExoInput.KeyDown(KeyCode.PageUp))input=InventoryKey.PageUp;else if(ExoInput.KeyDown(KeyCode.PageDown))input=InventoryKey.PageDown;
   else if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter))input=InventoryKey.Accept;
   // The ossuary page has no bag/equipment selection to navigate; only Tab/Esc close it.
   if(Page!=PageEquipment&&input!=InventoryKey.Close)return false;
   return input.HasValue&&HandleKey(input.Value,level);
  }
  public bool HandleKey(InventoryKey key,int level){
   var before=State.Selected;var action=Navigation.Handle(key);if(!ReferenceEquals(before,State.Selected))RefreshSelection();
   switch(action){
    case InventoryAction.Close:return true;
    case InventoryAction.Equip:Equip(State.Selected,level);break;
    case InventoryAction.Unequip:Unequip(State.Selected.slot);break;
    case InventoryAction.Details:detailOnly=!detailOnly;detailScroll=Vector2.zero;break;
    case InventoryAction.ScrollUp:detailScroll.y=Mathf.Max(0,detailScroll.y-180);break;
    case InventoryAction.ScrollDown:detailScroll.y+=180;break;
   }
   return false;
  }
  void RefreshSelection(){detailItem=State.Selected;detailOnly=false;detailScroll=Vector2.zero;RevealSelection();}
  void RevealSelection(){var it=State.Selected;if(it==null||!State.Bag.Contains(it))return;const float cellSize=56f,visibleHeight=672;float top=it._gy*cellSize,bottom=(it._gy+2)*cellSize;if(top<scroll.y)scroll.y=top;else if(bottom>scroll.y+visibleHeight)scroll.y=bottom-visibleHeight;}
  void AfterOwnershipChange(){Navigation.TrackSelection();Navigation.Fence();RefreshSelection();}
  void DrawKeyboardHelp(Rect pane){
   NativeUiAudit.Label(new Rect(pane.x+32,pane.yMax-70,pane.width-64,68),"방향키 선택 · G 가방/장착 장비 · Enter 장착/해제\nC 비교/상세 · PgUp/PgDn 상세 스크롤 · Tab/ESC 닫기",small);
   if(Navigation.Focused){var active=Navigation.Pane==InventoryPane.Bag?new Rect(Screen.width/Mathf.Min(Screen.width/1920f,Screen.height/1080f)-600,24,600,3):new Rect(0,24,640,3);Fill(active,gold);}
  }
 }
}
