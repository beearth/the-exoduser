using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-keybind-capture <dir>`: stand-alone window (NativeGame / NativeLobby only silenced, not modified). Draws the key-binding list at the web position inside the web
 // scroll pane (settings-pages rect 45,325,1830x652; list origin x87, y625.19 - scrollTop) for the six web states, top and scrolled to the end, and writes keybind-capture.json.
 // Values are explicit test values (recorded in the receipt); the state is a private KeyBindings instance, not the shared one.
 public static class NativeKeyBindCapture {
  const string Arg="--unity-keybind-capture";
  static bool Requested(out string output){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;if(i<0||i+1>=a.Length)return false;output=a[i+1];return true;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)] static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Requested(out var dir)){var host=new GameObject("KeyBindCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,mappedCodes;public string stateSource,testNote;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeKeyBindList list;bool show;float scroll;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   static readonly Rect Pane=new Rect(45,325,1830,652);const float ListX=87,ListY=625.19f,Tail=37.81f;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){
    if(list==null||!show)return;GUI.depth=-1000;
    var old=GUI.matrix;float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    GUI.color=new Color(.04f,.04f,.045f,1f);NativeUiAudit.DrawTexture(Pane,Texture2D.whiteTexture);GUI.color=Color.white;
    NativeUiAudit.BeginGroup(Pane);list.Draw(new Vector2(ListX-Pane.x,ListY-scroll-Pane.y),new Rect(0,0,Pane.width,Pane.height));NativeUiAudit.EndGroup();
    list.DrawToasts();
    GUI.matrix=old;
   }
   float End(){return Mathf.Max(0,ListY+list.WebHeight+Tail-(Pane.yMax));}   // web scrollTop at the end of the pane
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var keys=new KeyBindings();list=new NativeKeyBindList(keys);show=true;
    // ---- definition / mapping checks ----
    Check(NativeKeyBindInput.MappedCodeCount==107,"web code <-> Unity KeyCode table size "+NativeKeyBindInput.MappedCodeCount);
    int bad=0;foreach(var kv in KeyBindings.KeyLabelTable){KeyCode k;if(!NativeKeyBindInput.TryKey(kv.Key,out k)||NativeKeyBindInput.CodeFor(k)!=kv.Key)bad++;}
    Check(bad==0,"every labelled web code round-trips through the Unity KeyCode table ("+bad+" bad)");
    foreach(var a in KeyBindings.Actions){KeyCode k;string c=KeyBindings.DefaultPrimaryOf(a);if(c.StartsWith("mouse"))continue;if(!NativeKeyBindInput.TryKey(c,out k)){Check(false,"default code "+c+" of "+a+" has no Unity key");}}
    Check(list.GlyphCount==7,"7 baked symbols (⌨ 🎮x3 ⟨ ⟩ ✕)");
    // ---- 1 default ----
    scroll=0;yield return Frame("unity_kb_1_default",true);
    Check(Mathf.Abs(list.ContentHeight-list.WebHeight-26f)<.01f&&Mathf.Abs(list.WebHeight-745f)<.01f,"default web height 745 (+26 saving-note line); got "+list.WebHeight.ToString("0.00")+" / "+list.ContentHeight.ToString("0.00"));
    Check(Mathf.Abs(list.LastResetY-701f)<.01f,"reset button y 701 (got "+list.LastResetY+")");
    Check(list.LastKeyRects.Count==42&&Mathf.Abs(list.LastKeyRects[0].x-(ListX-Pane.x+345.09f))<.01f&&Mathf.Abs(list.LastKeyRects[0].width-251.61f)<.01f&&Mathf.Abs(list.LastKeyRects[1].x-(ListX-Pane.x+606.7f))<.01f,"key rects: 42 buttons, first main x/w and alternate x match the web dump");
    scroll=End();yield return Frame("unity_kb_1_default_bottom",true);
    // ---- 2 listening (weapon main) ----
    list.BeginListening("weapon",false);list.ForceListeningAge(1);
    scroll=0;yield return Frame("unity_kb_2_listening_main",true);
    Check(list.Listening&&list.ListeningAction=="weapon"&&!list.ListeningAlt,"weapon main key waiting");
    Check(Mathf.Abs(list.ContentHeight-list.WebHeight-26f)<.01f&&Mathf.Abs(list.WebHeight-774f)<.01f,"waiting list height 774 (reset 44 + gap 4 + margin 6 + hint 19); got "+list.WebHeight.ToString("0.00"));
    scroll=End();yield return Frame("unity_kb_2_listening_main_bottom",true);
    list.CancelListening();
    // ---- 3 alternate set (weapon alt = F; web states: click alt, press F) ----
    list.BeginListening("weapon",true);list.ForceListeningAge(1);bool ok3=list.CaptureApply("KeyF");
    Check(ok3&&keys.Secondary("weapon")=="KeyF"&&!list.Listening,"weapon alternate = KeyF (x button visible)");
    scroll=0;yield return Frame("unity_kb_3_alt_set",true);
    // ---- 4 chain conflict (charge main := E, E is the shield key) ----
    list.BeginListening("charge",false);list.ForceListeningAge(1);list.CaptureApply("KeyE");
    Check(keys.Primary("charge")=="ShiftLeft","chain movement keeps ShiftLeft when set to the shield key E");
    scroll=0;yield return Frame("unity_kb_4_chain_conflict",true);
    list.ToastsVisible=true;yield return Frame("unity_kb_4_chain_conflict_toast",true);list.ToastsVisible=false;   // web hides the message under the window; this extra frame shows it drawn
    // ---- 5 gamepad tab ----
    yield return new WaitForSecondsRealtime(.6f);list.CurrentTab=NativeKeyBindList.Tab.Pad;
    scroll=0;yield return Frame("unity_kb_5_gamepad_tab",true);
    Check(Mathf.Abs(list.WebHeight-788.66f)<.02f,"gamepad tab web height 788.66 (got "+list.WebHeight.ToString("0.00")+")");
    scroll=End();yield return Frame("unity_kb_5_gamepad_tab_bottom",true);
    // ---- 6 after reset ----
    list.CurrentTab=NativeKeyBindList.Tab.Kbm;list.ResetBindings();
    Check(keys.Listed.Count==19&&keys.Secondary("weapon")==null,"after reset 19 rows (web quirk) and no alternate keys");
    scroll=End();yield return Frame("unity_kb_6_after_reset_notif",true);
    list.ToastsVisible=true;yield return Frame("unity_kb_6_after_reset_notif_toast",true);list.ToastsVisible=false;
    yield return new WaitForSecondsRealtime(1.6f);
    scroll=0;yield return Frame("unity_kb_6_after_reset",true);
    Check(Mathf.Abs(list.WebHeight-(62+10*57+12+44))<.02f,"after reset 19 rows: web height "+(62+10*57+12+44)+" (got "+list.WebHeight.ToString("0.00")+")");
    scroll=End();yield return Frame("unity_kb_6_after_reset_bottom",true);
    show=false;
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,mappedCodes=NativeKeyBindInput.MappedCodeCount,
     stateSource="Private KeyBindings instance; no game state is read. Baseline = web defaults, then the explicit operations listed in the file names (weapon main waiting, weapon alternate = KeyF, charge := KeyE rejected, gamepad tab, reset).",
     testNote="All frames use test operations that mirror the web capture sequence (E:/exoduser-wt/_out/pc-a16/web/a16_*.png). Saving is not ported (Codex settings schema has no key fields); gamepad values are 미이식.",checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"keybind-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Frame(string name,bool shot){
    yield return new WaitForSecondsRealtime(.2f);
    if(shot){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
   }
  }
 }
}
