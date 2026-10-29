using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  bool inventoryKeysSmoke,traceInventoryKeys;string inventoryTraceState="";
  void TraceInventoryKeys(){
   string state="app="+Application.isFocused+" host="+gameFocused+" menu="+menu+" open="+inventory.Open+" nav="+inventory.Navigation.Focused+" fence="+inventory.Navigation.WaitingForRelease+" mouse="+ExoInput.Mouse(0)+","+ExoInput.Mouse(1)+" test="+inventoryKeysSmoke+" hp="+Simulation.Player.Hp;
   if(state!=inventoryTraceState||ExoInput.AnyKeyDown){string held="";foreach(KeyCode key in new[]{KeyCode.Return,KeyCode.Tab,KeyCode.Escape,KeyCode.C,KeyCode.G,KeyCode.LeftArrow,KeyCode.RightArrow})if(ExoInput.Key(key))held+=key+",";Debug.Log("INVENTORY_KEYS "+state+" held="+held);inventoryTraceState=state;}
  }
  void InventoryTestKey(InventoryKey key){inventory.Navigation.ObserveReleased(false);if(inventory.HandleKey(key,Simulation.Player.Level))SetInventory(false);}
  IEnumerator InventoryKeysSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))throw new InvalidOperationException("inventory keys fixture needs -output");Directory.CreateDirectory(output);
   if(Argument("-inventory-keys-phase")=="visual"){yield return InventoryKeysVisual(output);yield break;}
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   SetGameFocus(true);SetInventory(true);Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);int tick=Simulation.TickCount;
   check(inventory.State.Selected==null,"opening starts with no selection (web parity, R-9)");InventoryTestKey(InventoryKey.Right);var item=inventory.State.Selected;check(item!=null&&inventory.State.Bag.Contains(item),"first arrow key selects the first visible bag item");
   int count=inventory.State.Bag.Count;var prior=inventory.State.GetEquipped(InventoryComparison.TargetSlot(inventory.State,item));
   inventory.Navigation.ObserveReleased(false);yield return UiCapture(output,"inventory-compare-720p");
   InventoryTestKey(InventoryKey.Details);check(inventory.ShowingDetails,"C switches to selected item details");yield return UiCapture(output,"inventory-details-720p");
   InventoryTestKey(InventoryKey.Details);InventoryTestKey(InventoryKey.PageDown);check(inventory.DetailScrollOffset>0,"PageDown scrolls comparison");yield return UiCapture(output,"inventory-compare-bottom-720p");
   InventoryTestKey(InventoryKey.Accept);check(!inventory.State.Bag.Contains(item)&&ReferenceEquals(inventory.State.GetEquipped(item.slot),item),"Enter invokes actual equip handler");
   check(inventory.Navigation.Pane==InventoryPane.Equipment&&ReferenceEquals(inventory.State.Selected,item),"equipped item remains selected in correct pane");
   inventory.HandleKey(InventoryKey.Accept,Simulation.Player.Level);check(!inventory.State.Bag.Contains(item),"held Enter cannot immediately unequip");
   check(Simulation.Player.MaxHp==inventory.State.CalculateStats(Simulation.Player.Level).PlayerMaxHp,"existing callback updates actual player stats");
   inventory.Navigation.ObserveReleased(false);yield return UiCapture(output,"inventory-equipped-720p");
   SetGameFocus(false);inventory.HandleKey(InventoryKey.Accept,Simulation.Player.Level);check(!inventory.State.Bag.Contains(item)&&!Running,"blur cannot unequip or resume");SetGameFocus(true);inventory.HandleKey(InventoryKey.Accept,Simulation.Player.Level);check(!inventory.State.Bag.Contains(item),"focus return fences stale Enter");
   InventoryTestKey(InventoryKey.Accept);check(inventory.State.Bag.Contains(item)&&inventory.State.GetEquipped(item.slot)==null,"fresh Enter invokes actual unequip handler");
   check(inventory.Navigation.Pane==InventoryPane.Bag&&ReferenceEquals(inventory.State.Selected,item),"unequipped item remains selected and visible");
   // Exercise the existing level rejection through the new input route; this is memory-only fixture data.
   int required=item.reqLv;item.reqLv=Simulation.Player.Level+1;InventoryTestKey(InventoryKey.Accept);check(inventory.State.Bag.Contains(item),"keyboard honors required level");item.reqLv=required;
   InventoryTestKey(InventoryKey.SwitchPane);check(inventory.Navigation.Pane==InventoryPane.Bag&&ReferenceEquals(inventory.State.Selected,item),"G no longer switches panes (web: G = forge)");
   InventoryTestKey(InventoryKey.Right);check(inventory.State.Selected!=null,"arrows keep a valid owned selection");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);inventory.Navigation.ObserveReleased(false);yield return UiCapture(output,"inventory-compare-1080p");InventoryTestKey(InventoryKey.Details);inventory.Navigation.ObserveReleased(false);yield return UiCapture(output,"inventory-details-1080p");
   check(!Running&&tick==Simulation.TickCount,"all selection and equipment operations leave simulation paused");
   InventoryTestKey(InventoryKey.Close);check(!inventory.Open&&Running&&skillInputFence,"explicit close resumes with combat input fence");
   // Leave an unmodified seeded inventory for OS interaction, without user-save writes.
   ResetRun();menu=false;Running=true;SetInventory(true);SetGameFocus(true);inventoryKeysSmoke=false;pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"inventory-keys.json"),JsonUtility.ToJson(new InventoryKeysReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-inventory-keys-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator InventoryKeysVisual(string output){
   SetGameFocus(true);SetInventory(true);InventoryTestKey(InventoryKey.Accept);
   foreach(int width in new[]{1280,1920}){Screen.SetResolution(width,width==1280?720:1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);inventory.Navigation.ObserveReleased(false);yield return UiCapture(output,"inventory-equipped-"+width);}
   ResetRun();menu=false;Running=true;SetInventory(true);SetGameFocus(true);inventoryKeysSmoke=false;pauseSmoke=false;
   File.WriteAllText(Path.Combine(output,"inventory-visual.json"),"{\"scope\":\"equipped text 2 sizes; OS focus diagnosis follows\"}");
  }
  [Serializable]sealed class InventoryKeysReceipt{public string scope="new inventory keyboard handlers in memory-only Player; OS input separately recorded";public bool passed;public int failures;public string[] checks;}
 }
}
