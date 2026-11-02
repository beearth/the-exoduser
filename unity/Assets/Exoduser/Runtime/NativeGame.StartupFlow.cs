using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  bool frontendEntryInputFence;
  readonly Dictionary<SpriteRenderer,bool> startupEnemyRendererVisibility=new Dictionary<SpriteRenderer,bool>();
  void LateUpdate()
  {
   // Presentation only: apply after both Update methods and before the camera renders.
   bool hide=lobby!=null&&lobby.StartupEntryActive&&lobby.StartupStage=="Guide";
   if(hide){foreach(var enemy in enemies.Values){MaskStartupEnemyRenderer(enemy.body);MaskStartupEnemyRenderer(enemy.walk);}}
   else if(startupEnemyRendererVisibility.Count>0){foreach(var saved in startupEnemyRendererVisibility)if(saved.Key!=null)saved.Key.enabled=saved.Value;startupEnemyRendererVisibility.Clear();}
  }
  void MaskStartupEnemyRenderer(SpriteRenderer renderer){if(renderer==null)return;if(!startupEnemyRendererVisibility.ContainsKey(renderer))startupEnemyRendererVisibility.Add(renderer,renderer.enabled);renderer.enabled=false;}
  void PrepareStartupGameplay(){ResetRun();pauseMenu.Reset();menu=false;Running=false;}
  void EnterFromLobby()
  {
   if(!lobby.StartupGameplayPrepared)ResetRun();skillInputFence=true;pauseMenu.Reset();menu=false;
   // Existing scripted fixtures keep their direct entry contract.
   bool fixture=false;foreach(var arg in Environment.GetCommandLineArgs())if(arg.StartsWith("--unity-",StringComparison.Ordinal)&&arg.EndsWith("-smoke",StringComparison.Ordinal))fixture=true;
   frontendEntryInputFence=!fixture;if(frontendEntryInputFence)frontendFenceSetFrame=Time.frameCount;Running=fixture;
   if(!fixture&&NativeReviewArgs.BossDirect&&BossDirectEnter()){}   // review: start at the boss arena entry, no first practice
   else if(!fixture&&lobby.StartupGameplayPrepared)BeginFirstPractice();
  }
  bool WaitForFrontendEntryInput()
  {
   if(!frontendEntryInputFence)return false;
   Running=false;
   if(gameFocused&&!ExoInput.AnyKey&&!ExoInput.Mouse(0)&&!ExoInput.Mouse(1)&&!ExoInput.Mouse(2)){frontendEntryInputFence=false;frontendFenceReleasedFrame=Time.frameCount;Running=!menu&&!inventory.Open&&!skills.Open&&!stats.Open&&!forge.Open&&!PlayerDown;}
   return true;
  }
  void DrawStartupWorldHud()
  {
   InitGUI();var old=GUI.matrix;GUI.matrix=NativeUiViewport.Matrix;
   bool enabled=GUI.enabled;GUI.enabled=false;var p=Simulation.Player;int ak,at;Simulation.AreaKills(regionHud.CurIdx,out ak,out at);objective.Draw(NativeUiSafeArea.DesignWidth,new NativeObjectivePanel.Info{level=p.Level,exp=p.Experience,maxExp=p.MaxExperience,materials=Simulation.Materials,areaKills=ak,areaTotal=at,english=lobby.Language!="ko"});DrawFieldHud(NativeUiSafeArea.DesignWidth);hud.Draw(NativeUiSafeArea.DesignWidth,NativeUiSafeArea.DesignHeight,Simulation.Config.ActiveAttack,Simulation);GUI.enabled=enabled;GUI.matrix=old;
  }
 }
}
