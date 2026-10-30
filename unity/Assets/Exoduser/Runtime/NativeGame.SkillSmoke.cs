using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  IEnumerator SkillSmoke(){
   if(Argument("-qe-ui")=="1"){yield return QeUiCapture();yield break;}
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
   Running=true;SetSkills(true);int tick=Simulation.TickCount;float hpBefore=Simulation.Player.Hp;int matsBefore=Simulation.Materials;
   yield return SkillCapture(output,"skill-lmb-720p");check(skills.Open&&!Running&&Simulation.TickCount==tick,"skill screen owns pause");
   skills.Select(0);EquipSelectedSkill();check(Simulation.Config.ActiveAttack=="kiSlash","number slot cannot receive fixed LMB skill");yield return SkillCapture(output,"skill-empty-slot-720p");
   skills.Select(6);EquipSelectedSkill();check(Simulation.Player.Hp==hpBefore&&Simulation.Materials==matsBefore&&Simulation.TickCount==tick,"equip leaves player/resources/world intact");SetSkills(false);check(Running&&!skills.Open&&skillInputFence,"close restores play with click release fence");Running=false;
   Simulation.Config.EnemyAiEnabled=false;Simulation.Enemies.Clear();Simulation.Player.Stamina=Simulation.Player.MaxStamina;
   int safety=0;while(Simulation.KiComboStep<2&&safety++<300)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   while(!Simulation.Player.KiChargeActive&&safety++<450)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   while(Simulation.Player.KiChargeTicks<80&&safety++<600)StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,true,false);
   check(Simulation.Player.KiChargeActive&&Simulation.KiChargeTier(Simulation.Player.KiChargeTicks)==2,"actual third-hit charge state reaches tier 2");
   yield return SkillCapture(output,"hud-actual-charge");
   StepInput(0,0,Simulation.Player.X+100,Simulation.Player.Y,false,false);check(!Simulation.Player.KiChargeActive&&Simulation.KiComboStep==3,"same Tick executor releases third strike");
   // Restore a normal starter, leaving the new screen ready for optional native key inspection.
   ResetRun();SetGameFocus(true);pauseSmoke=false;menu=false;Running=true;SetSkills(true,6);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"skill-lmb-1080p");
   File.WriteAllText(Path.Combine(output,"skill-smoke.json"),JsonUtility.ToJson(new SkillSmokeReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-skill-smoke")>=0)Application.Quit(failures==0?0:2);
  }
  IEnumerator SkillCapture(string path,string name){yield return new WaitForSecondsRealtime(.15f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(path,name+".png"));yield return null;}
  [Serializable] sealed class SkillSmokeReceipt{public string scope="Actual Unity Player skill UI and existing Tick executor; no OS input claim";public bool passed;public int failures;public string[] checks;}
 }
}
