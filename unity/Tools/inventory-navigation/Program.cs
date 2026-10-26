using System;
using Exoduser.UnityPort.Core;
class Program {
 static int count;static InventoryState s;static InventoryNavigation n;
 static void Check(bool value,string text){count++;if(!value)throw new Exception(text);Console.WriteLine("PASS "+text);}
 static InventoryAction Key(InventoryKey key){n.ObserveReleased(false);return n.Handle(key);}
 static InventoryItem Item(string name,string slot,int x=-1,int y=-1){return new InventoryItem{name=name,slot=slot,wtype=slot=="weapon"?"sword":null,btype=slot=="bow"?"crossbow":null,_gx=x,_gy=y};}
 static void Main(){
 var a=Item("A","weapon",0,0);var b=Item("B","helmet",4,0);var c=Item("C","armor",0,8);var d=Item("D","boots",8,8);var eq=new InventoryItem[17];eq[4]=Item("hat","helmet");eq[0]=Item("sword","weapon");eq[2]=Item("boots","boots");
 s=new InventoryState(new InventorySeedData{equipped=eq,bag=new[]{d,b,c,a}});n=new InventoryNavigation(s);n.Open();Check(s.Selected==null,"opening starts with no selection (web parity)");
 Check(n.Handle(InventoryKey.Accept)==InventoryAction.None,"opening input fenced");n.ObserveReleased(true);Check(n.WaitingForRelease,"held opening key stays fenced");
 Key(InventoryKey.Right);Check(ReferenceEquals(s.Selected,a),"first key press selects grid-first item rather than bag list order");Key(InventoryKey.Right);Check(ReferenceEquals(s.Selected,b),"right picks aligned sparse-grid neighbor");Key(InventoryKey.Right);Check(ReferenceEquals(s.Selected,d),"right can reach diagonal item when row is empty");Key(InventoryKey.End);Check(ReferenceEquals(s.Selected,d),"end follows visual order");Key(InventoryKey.Down);Check(ReferenceEquals(s.Selected,d),"bottom edge does not wrap");Key(InventoryKey.Home);Key(InventoryKey.Down);Check(ReferenceEquals(s.Selected,c),"down prefers aligned column");Key(InventoryKey.Up);Check(ReferenceEquals(s.Selected,a),"up returns aligned item");
 Check(Key(InventoryKey.Details)==InventoryAction.Details,"details action");Check(Key(InventoryKey.PageDown)==InventoryAction.ScrollDown,"details scroll down");Check(Key(InventoryKey.PageUp)==InventoryAction.ScrollUp,"details scroll up");
 Check(Key(InventoryKey.SwitchPane)==InventoryAction.None&&n.Pane==InventoryPane.Bag&&ReferenceEquals(s.Selected,a),"G no longer switches panes (web: G is the forge key)");s.Select(eq[4]);n.TrackSelection();Check(n.Pane==InventoryPane.Equipment&&ReferenceEquals(s.Selected,eq[4]),"equipment follows displayed order once an equipped item is selected (mouse path)");Key(InventoryKey.End);Check(ReferenceEquals(s.Selected,eq[2]),"equipment last item");Key(InventoryKey.Up);Check(ReferenceEquals(s.Selected,eq[4]),"equipment column navigation");
 s.Select(a);n.TrackSelection();Check(n.Pane==InventoryPane.Bag&&ReferenceEquals(s.Selected,a),"selecting a bag item returns to the bag pane");
 Check(Key(InventoryKey.Accept)==InventoryAction.Equip,"bag accept requests equip");Check(n.Handle(InventoryKey.Accept)==InventoryAction.None,"held accept cannot mutate twice");Check(s.Bag.Contains(a)&&ReferenceEquals(s.Equipped[0],eq[0]),"navigation alone never mutates equipment");
 a.reqLv=2;Check(!s.TryEquip(a,1,out var why)&&s.Bag.Contains(a),"existing level gate rejects keyboard candidate");a.reqLv=0;Check(s.TryEquip(a,1,out why),"existing equip handler succeeds");n.TrackSelection();Check(n.Pane==InventoryPane.Equipment&&ReferenceEquals(s.Selected,a),"selection follows equipped item identity");
 Check(Key(InventoryKey.Accept)==InventoryAction.Unequip,"equipped accept requests unequip");Check(s.TryUnequip(a.slot,out why),"existing unequip handler succeeds");n.TrackSelection();Check(n.Pane==InventoryPane.Bag&&ReferenceEquals(s.Selected,a),"selection follows unequipped identity");
 n.SetFocus(false);Check(Key(InventoryKey.Accept)==InventoryAction.None,"blur blocks mutation");n.SetFocus(true);Check(n.Handle(InventoryKey.Accept)==InventoryAction.None,"focus return fenced");Check(Key(InventoryKey.Close)==InventoryAction.Close,"fresh close allowed");
 s.Bag.Remove(a);n.Open();Check(s.Selected==null,"reopen after removal clears stale selection");
 var empty=new InventoryState(new InventorySeedData{equipped=new InventoryItem[17],bag=new InventoryItem[0]});n=new InventoryNavigation(empty);n.Open();Check(empty.Selected==null,"empty bag opens safely");Check(Key(InventoryKey.Accept)==InventoryAction.None,"empty bag cannot equip");Check(Key(InventoryKey.SwitchPane)==InventoryAction.None&&n.Pane==InventoryPane.Bag&&empty.Selected==null,"G is inert on an empty inventory");Check(Key(InventoryKey.Close)==InventoryAction.Close,"empty pane closes");
 Console.WriteLine("PASS "+count+"/"+count);
 }
}
