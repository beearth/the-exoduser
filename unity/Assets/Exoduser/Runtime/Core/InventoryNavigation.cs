using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 public enum InventoryPane { Bag, Equipment }
 public enum InventoryKey { Left,Right,Up,Down,Home,End,SwitchPane,Details,PageUp,PageDown,Accept,Close }
 public enum InventoryAction { None,Equip,Unequip,Details,ScrollUp,ScrollDown,Close }
 // Selection uses the actual item grid and shared equipment layout, never list order or IDs.
 public sealed class InventoryNavigation {
  public static readonly int[] EquipmentOrder={14,4,9,16,10,3,8,11,0,6,1,5,13,7,2,12};
  readonly InventoryState state;InventoryItem lastBag,lastEquipment;
  public InventoryPane Pane {get;private set;}=InventoryPane.Bag;
  public bool Focused {get;private set;}=true;
  public bool WaitingForRelease {get;private set;}
  public InventoryNavigation(InventoryState state){this.state=state??throw new ArgumentNullException("state");}
  public void Fence(){WaitingForRelease=true;}
  public void SetFocus(bool focus){Focused=focus;Fence();}
  public void ObserveReleased(bool held){if(Focused&&!held)WaitingForRelease=false;}
  public void Open(){if(!state.Owns(state.Selected)){Pane=InventoryPane.Bag;SelectFirst();}else TrackSelection();Fence();}
  public void TrackSelection(){if(!state.Owns(state.Selected)){state.Select(null);return;}Pane=state.Bag.Contains(state.Selected)?InventoryPane.Bag:InventoryPane.Equipment;if(Pane==InventoryPane.Bag)lastBag=state.Selected;else lastEquipment=state.Selected;}
  bool InPane(InventoryItem it){return it!=null&&(Pane==InventoryPane.Bag?state.Bag.Contains(it):Array.IndexOf(state.Equipped,it)>=0);}
  List<InventoryItem> Items(){var result=new List<InventoryItem>();if(Pane==InventoryPane.Bag){result.AddRange(state.Bag);result.Sort((a,b)=>{int y=a._gy.CompareTo(b._gy);return y!=0?y:a._gx.CompareTo(b._gx);});}else foreach(int i in EquipmentOrder)if(state.Equipped[i]!=null)result.Add(state.Equipped[i]);return result;}
  void Select(InventoryItem it){state.Select(it);if(it!=null)TrackSelection();}
  void SelectFirst(){var items=Items();Select(items.Count>0?items[0]:null);}
  void Position(InventoryItem it,out int x,out int y){if(Pane==InventoryPane.Bag){x=it._gx;y=it._gy;return;}int index=Array.IndexOf(EquipmentOrder,Array.IndexOf(state.Equipped,it));x=index%4;y=index/4;}
  public InventoryAction Handle(InventoryKey key){
   if(!Focused||WaitingForRelease)return InventoryAction.None;Fence();
   if(key==InventoryKey.Close)return InventoryAction.Close;
   if(key==InventoryKey.SwitchPane){TrackSelection();Pane=Pane==InventoryPane.Bag?InventoryPane.Equipment:InventoryPane.Bag;var previous=Pane==InventoryPane.Bag?lastBag:lastEquipment;if(InPane(previous))Select(previous);else SelectFirst();return InventoryAction.None;}
   if(!InPane(state.Selected)){SelectFirst();return InventoryAction.None;}
   if(key==InventoryKey.Details)return InventoryAction.Details;
   if(key==InventoryKey.PageUp)return InventoryAction.ScrollUp;if(key==InventoryKey.PageDown)return InventoryAction.ScrollDown;
   if(key==InventoryKey.Accept)return Pane==InventoryPane.Bag?InventoryAction.Equip:InventoryAction.Unequip;
   var items=Items();if(key==InventoryKey.Home){Select(items[0]);return InventoryAction.None;}if(key==InventoryKey.End){Select(items[items.Count-1]);return InventoryAction.None;}
   Position(state.Selected,out int sx,out int sy);InventoryItem best=null;long score=long.MaxValue;
   foreach(var item in items){if(ReferenceEquals(item,state.Selected))continue;Position(item,out int x,out int y);int dx=x-sx,dy=y-sy;bool horizontal=key==InventoryKey.Left||key==InventoryKey.Right;
    int forward=key==InventoryKey.Left?-dx:key==InventoryKey.Right?dx:key==InventoryKey.Up?-dy:dy;if(forward<=0)continue;
    long candidate=Math.Abs(horizontal?dy:dx)*10000L+forward;
    if(candidate<score){score=candidate;best=item;}
   }
   if(best!=null)Select(best);return InventoryAction.None;
  }
 }
}
