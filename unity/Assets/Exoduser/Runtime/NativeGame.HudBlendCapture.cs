using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class HudBlendReceipt
  {
   public string scope="Narrow Native Player HUD screenshots and shared 1920x1080 logical layout geometry; no OS-input claim";
   public bool passed;public int failures;public string rosterNamespace;public string[] captures,checks,keyNames;
   public float artScale,minSlotGap,minLabelGap,minLabelGapAt720;
   public Rect slotBar,leftOrb,rightOrb,visibleBar,activeSlot,statusLabel;
   public Rect[] skillHitRects,keyLabelRects;
  }
  IEnumerator HudBlendCapture()
  {
   string output=Argument("-output");var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   if(string.IsNullOrWhiteSpace(output)||output.StartsWith("-",StringComparison.Ordinal)){Debug.LogError("HUD blend capture requires explicit -output QA path");Application.Quit(2);yield break;}
   bool tracePointer=Array.IndexOf(Environment.GetCommandLineArgs(),"--keep-open-after-hud-blend")>=0;hud.TracePointerEvents=tracePointer;
   Directory.CreateDirectory(output);lobby.ShowLobby();lobby.SelectPreview();
   check(string.IsNullOrEmpty(lobby.CharacterStoreDirectory),"generic smoke fixture never initializes or writes the user roster");
   check(!lobby.AutomatedInput,"capture invokes entry callback directly without claiming OS input");
   check(lobby.EnterNativeTest(),"preview reaches the existing native gameplay callback");menu=false;Running=false;
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);
   Simulation.Config.EnemyAiEnabled=false;Simulation.Enemies.Clear();Simulation.Player.Stamina=Simulation.Player.MaxStamina;
   hud.Refresh(Simulation.Player,Simulation.TickCount,true);
   yield return SkillCapture(output,"hud-blend-idle-720p");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);yield return SkillCapture(output,"hud-blend-idle-1080p");
   int safety=0;
   while(Simulation.KiComboStep<2&&safety++<300)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   while(!Simulation.Player.KiChargeActive&&safety++<450)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   while(Simulation.Player.KiChargeTicks<80&&safety++<600)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   check(Simulation.Player.KiChargeActive&&Simulation.KiChargeTier(Simulation.Player.KiChargeTicks)==2,"actual KiSlash input reaches charge tier 2");
   hud.Refresh(Simulation.Player,Simulation.TickCount,true);
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);yield return SkillCapture(output,"hud-blend-charge-tier2-720p");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.35f);
   while(Simulation.Player.KiChargeTicks<120&&safety++<700)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   check(Simulation.Player.KiChargeActive&&Simulation.KiChargeTier(Simulation.Player.KiChargeTicks)==3,"actual KiSlash input reaches charge tier 3");
   hud.Refresh(Simulation.Player,Simulation.TickCount,true);
   yield return SkillCapture(output,"hud-blend-charge-tier3-1080p");
   StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,false,false);Running=false;
   var dock=NativeHudDockLayout.Create(1920,1080);var slots=new Rect[13];var labels=new Rect[13];float minSlotGap=float.MaxValue,minLabelGap=float.MaxValue;
   for(int i=0;i<13;i++){slots[i]=NativeHud.SkillSlotRect(dock,i);labels[i]=NativeHudDockLayout.KeyLabelRect(dock.SlotBar,1080,i);if(i>0){minSlotGap=Mathf.Min(minSlotGap,slots[i].x-slots[i-1].xMax);minLabelGap=Mathf.Min(minLabelGap,(labels[i].x+3)-(labels[i-1].xMax-3));}}
   check(NativeHudDockLayout.KeyNames.Length==13,"all 13 original key names are retained");
   check(minSlotGap>0,"13 hit rectangles share one layout with positive inter-slot gap");check(minLabelGap>0,"13 inset key-label rectangles share one layout with positive inter-label gap");
   for(int i=0;i<13;i++){check(Mathf.Abs(slots[i].center.x-labels[i].center.x)<.01f,"key label centered over shared slot "+NativeHudDockLayout.KeyNames[i]);check(dock.SlotBar.Contains(slots[i].min)&&dock.SlotBar.Contains(slots[i].max),"slot hitbox remains within bar "+NativeHudDockLayout.KeyNames[i]);check(dock.VisibleBar.Contains(labels[i].min)&&dock.VisibleBar.Contains(labels[i].max),"key label remains within visible rail "+NativeHudDockLayout.KeyNames[i]);}
   check(!NativeHud.StatusShouldDisplay(false,false,false),"status label hidden with no hover, selection, or charge");
   check(NativeHud.StatusShouldDisplay(true,false,false),"status label shown on active-slot hover");
   check(NativeHud.StatusShouldDisplay(false,false,true),"status label shown briefly after active-slot selection");
   check(NativeHud.StatusShouldDisplay(false,true,false),"status label shown during charge");
   string[] captures={"hud-blend-idle-720p.png","hud-blend-idle-1080p.png","hud-blend-charge-tier2-720p.png","hud-blend-charge-tier3-1080p.png"};
   float waitForCaptures=0;while(waitForCaptures<3f){bool all=true;foreach(string capture in captures)all&=File.Exists(Path.Combine(output,capture));if(all)break;waitForCaptures+=Time.unscaledDeltaTime;yield return null;}
   foreach(string capture in captures)check(File.Exists(Path.Combine(output,capture)),"capture exists: "+capture);
   File.WriteAllText(Path.Combine(output,"hud-blend-capture.json"),JsonUtility.ToJson(new HudBlendReceipt{passed=failures==0,failures=failures,rosterNamespace="none; generic smoke fixture does not initialize user roster storage",captures=captures,checks=checks.ToArray(),keyNames=NativeHudDockLayout.KeyNames,artScale=NativeHudDockLayout.ArtScale,minSlotGap=minSlotGap,minLabelGap=minLabelGap,minLabelGapAt720=minLabelGap*(720f/1080f),slotBar=dock.SlotBar,leftOrb=dock.LeftFrame,rightOrb=dock.RightFrame,visibleBar=dock.VisibleBar,activeSlot=dock.ActiveSlot,statusLabel=new Rect(1920*.5f-180,dock.VisibleBar.y-25,360,20),skillHitRects=slots,keyLabelRects=labels},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--keep-open-after-hud-blend")>=0)yield break;
   yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
 }
}
