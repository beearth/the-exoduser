using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  bool frontendEntryInputFence;
  void PrepareStartupGameplay(){ResetRun();pauseMenu.Reset();menu=false;Running=false;}
  void EnterFromLobby()
  {
   if(!lobby.StartupGameplayPrepared)ResetRun();skillInputFence=true;pauseMenu.Reset();menu=false;
   // Existing scripted fixtures keep their direct entry contract.
   bool fixture=false;foreach(var arg in Environment.GetCommandLineArgs())if(arg.StartsWith("--unity-",StringComparison.Ordinal)&&arg.EndsWith("-smoke",StringComparison.Ordinal))fixture=true;
   frontendEntryInputFence=!fixture;if(frontendEntryInputFence)frontendFenceSetFrame=Time.frameCount;Running=fixture;
  }
  bool WaitForFrontendEntryInput()
  {
   if(!frontendEntryInputFence)return false;
   Running=false;
   if(gameFocused&&!Input.anyKey&&!Input.GetMouseButton(0)&&!Input.GetMouseButton(1)&&!Input.GetMouseButton(2)){frontendEntryInputFence=false;frontendFenceReleasedFrame=Time.frameCount;Running=true;}
   return true;
  }
  void DrawStartupWorldHud()
  {
   InitGUI();var old=GUI.matrix;float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,Vector3.one*scale);
   bool enabled=GUI.enabled;GUI.enabled=false;hud.Draw(Screen.width/scale,Screen.height/scale,Simulation.Config.ActiveAttack,Simulation);GUI.enabled=enabled;GUI.matrix=old;
  }
 }
}
