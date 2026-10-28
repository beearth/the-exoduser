using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-forge-capture <dir>`: opens the forge window by itself over the running game objects (NativeGame/NativeLobby are only silenced,
 // not modified), captures every tab and a few interaction states, writes forge-capture.json and quits. No NativeGame change needed.
 public sealed partial class NativeForgePanel {
  const string CaptureArg="--unity-forge-capture";
  static bool HasCaptureArg(){return Array.IndexOf(Environment.GetCommandLineArgs(),CaptureArg)>=0;}
  static string CaptureDir(){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,CaptureArg);return i>=0&&i+1<a.Length?a[i+1]:Path.Combine(NativeQaSandbox.Resolve(Application.persistentDataPath),"forge-capture");}
  public void SetScrollForTest(string tab,float v){gridScroll[tab]=v;}
  public void SetListScrollForTest(float v){listScroll=v;}

  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(HasCaptureArg())AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(HasCaptureArg())new GameObject("ForgeCapture").AddComponent<ForgeCaptureHost>();}

  [Serializable] sealed class CaptureReceipt {public bool passed;public int failures,width,height;public string[] checks;public string[] files;}
  sealed class ForgeCaptureHost : MonoBehaviour {
   NativeForgePanel panel;Simulation sim;InventoryState inv;readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(panel==null||sim==null)return;GUI.depth=-1000;panel.Draw(sim,inv,()=>{});}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;
    yield return null;yield return null;
    Wiring(game);
    game.enabled=false;
    var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    sim=game.Simulation;inv=new InventoryState(NativeInventorySeed.Load());
    string dir=CaptureDir();Directory.CreateDirectory(dir);
    panel=new NativeForgePanel();panel.SetOpen(true);
    yield return new WaitForSecondsRealtime(.6f);
    // 6 tabs: the same SelectTab call a click on a left tab makes
    foreach(var t in new[]{"upgrade","potion","salvage","reroll","crystal","craft"}){
     panel.SelectTab(t);Check(panel.Tab==t,"tab switch -> "+t);
     yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_"+t);
    }
    // chip selected on the enhance tab (the chip click calls SelectChip)
    panel.SelectTab("upgrade");panel.SelectChip("weapon");Check(panel.SelectedChip=="weapon","enhance chip selected");
    yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_upgrade_chip");
    // scroll to the bottom (the panel clamps to the content height)
    panel.SetScrollForTest("upgrade",100000);yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_upgrade_chip_bottom");
    Check(panel.Scroll("upgrade")>1000,"enhance tab scrolls ("+panel.Scroll("upgrade")+")");
    panel.SelectChip(null);panel.SetScrollForTest("upgrade",0);yield return new WaitForSecondsRealtime(.2f);
    panel.SetScrollForTest("upgrade",100000);yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_upgrade_bottom");
    panel.SetScrollForTest("upgrade",0);
    panel.SelectTab("salvage");panel.SetListScrollForTest(100000);yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_salvage_list_bottom");
    Check(panel.ListScroll>0,"salvage list scrolls ("+panel.ListScroll+")");
    panel.SelectTab("reroll");panel.SetListScrollForTest(100000);yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_reroll_list_bottom");
    panel.SelectTab("craft");panel.SetScrollForTest("craft",100000);yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_craft_bottom");
    Check(panel.Scroll("craft")>0,"craft tab scrolls ("+panel.Scroll("craft")+")");
    // potion tab (B11): the card, the selection bar and the craft click are driven by the real Core state (Simulation.PotionState, Materials, Player.Level)
    int level0=sim.Player.Level,mats0=sim.Materials;var potion=sim.PotionState;int potLv0=potion.PotLv;
    panel.SelectTab("potion");sim.Player.Level=1;yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_potion_gate");
    Check(!AutoPotion.ForgeCanSelect(potion.PotLv,sim.Player.Level),"potion card Lv.0 is locked below player level 100");
    sim.Player.Level=100;panel.SelectPotionForTest(sim);Check(panel.PotionSelected,"potion card Lv.0 selectable at player level 100");
    yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_potion_select");
    int done=panel.CraftPotionForTest(sim,false);Check(done==1&&potion.PotLv==1&&sim.Materials==mats0-3&&!panel.PotionSelected,"craft once: Lv.0 -> Lv.1 for 3 malice, selection cleared (done "+done+", Lv "+potion.PotLv+", malice "+sim.Materials+")");
    yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_potion_lv1");
    sim.Player.Level=1000;panel.SelectPotionForTest(sim);int m1=sim.Materials;done=panel.CraftPotionForTest(sim,true);
    Check(done==10&&potion.PotLv==11&&sim.Materials==m1-50,"Shift/Ctrl craft repeats 10 times with the cost fixed at selection (web quirk: passes level 10): done "+done+", Lv "+potion.PotLv+", malice "+sim.Materials);
    yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_potion_max");
    potion.PotLv=0;sim.Player.Level=100;sim.Materials=2;panel.SelectPotionForTest(sim);done=panel.CraftPotionForTest(sim,false);
    Check(done==0&&panel.PotionNotice!=null&&panel.PotionSelected&&potion.PotLv==0&&sim.Materials==2,"not enough malice: nothing done, notice shown, selection kept");
    yield return new WaitForSecondsRealtime(.35f);yield return Shot(dir,"unity_forge_potion_short");
    sim.Player.Level=level0;sim.Materials=mats0;potion.PotLv=potLv0;
    var rec=new CaptureReceipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"forge-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   // Exercises the NativeGame patch wiring through the same event a tab-bar click / the G hotkey raises (NativePanelTabBar.Request ->
   // OnPanelRequested). Only meaningful when the A14 patch is applied (otherwise the forge field is missing and the check fails loudly).
   void Wiring(NativeGame game){
    var t=typeof(NativeGame);const BindingFlags fl=BindingFlags.NonPublic|BindingFlags.Instance;
    var forgeField=t.GetField("forge",fl);
    if(forgeField==null){Check(false,"NativeGame has no forge field (A14 patch not applied)");return;}
    bool Open(string n){var f=t.GetField(n,fl);if(f==null)return false;var o=f.GetValue(game);if(o==null)return false;var pr=o.GetType().GetProperty("Open");return pr!=null&&(bool)pr.GetValue(o);}
    var fp=t.GetField("firstPractice",fl);bool practice=fp!=null&&fp.GetValue(game)!=null;
    Check(!practice,"no first practice running (wiring precondition)");
    if(practice)return;
    NativePanelTabBar.Request("forge");Check(Open("forge"),"wiring: tab/G request opens forge");
    NativePanelTabBar.Request("forge");Check(!Open("forge"),"wiring: second request (G again) closes forge");
    NativePanelTabBar.Request("forge");NativePanelTabBar.Request("skillPanel");Check(!Open("forge")&&Open("skills"),"wiring: forge -> skills closes forge");
    NativePanelTabBar.Request("forge");Check(Open("forge")&&!Open("skills"),"wiring: forge request closes skills");
    NativePanelTabBar.Request("statPanel");Check(!Open("forge")&&Open("stats"),"wiring: forge -> stats closes forge");
    NativePanelTabBar.Request("forge");Check(Open("forge")&&!Open("stats"),"wiring: forge request closes stats");
    NativePanelTabBar.Request("invPanel");Check(!Open("forge")&&Open("inventory"),"wiring: forge -> inventory closes forge");
    NativePanelTabBar.Request("forge");Check(Open("forge")&&!Open("inventory"),"wiring: forge request closes inventory");
    NativePanelTabBar.Request("forge");Check(!Open("forge"),"wiring: closed again");
   }
   IEnumerator Shot(string dir,string name){yield return new WaitForEndOfFrame();string path=Path.Combine(dir,name+".png");ScreenCapture.CaptureScreenshot(path);files.Add(name+".png");yield return null;}
  }
 }
}
