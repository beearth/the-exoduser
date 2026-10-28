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
   if(gameFocused&&!ExoInput.AnyKey&&!ExoInput.Mouse(0)&&!ExoInput.Mouse(1)&&!ExoInput.Mouse(2)){frontendEntryInputFence=false;frontendFenceReleasedFrame=Time.frameCount;Running=true;}
   return true;
  }
  void DrawStartupWorldHud()
  {
   InitGUI();var old=GUI.matrix;float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,Vector3.one*scale);
   bool enabled=GUI.enabled;GUI.enabled=false;hud.Draw(Screen.width/scale,Screen.height/scale,Simulation.Config.ActiveAttack,Simulation);GUI.enabled=enabled;GUI.matrix=old;
  }
 }
}
