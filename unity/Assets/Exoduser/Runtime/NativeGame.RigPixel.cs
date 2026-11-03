using System;
using System.Collections;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  static readonly bool RigPixelRequested=NativeRigPixelPolicy.Requested(Environment.GetCommandLineArgs());
  NativeRigPixelHero rigPixelHero;
  bool rigPixelEntryReady;
  IEnumerator RigPixelReviewEntry(){
   rigPixelEntryReady=false;lobby.ShowLobby();
   float deadline=Time.realtimeSinceStartup+30;
   while((NativeScreenTransition.Busy||lobby.CinematicEntryPending)&&Time.realtimeSinceStartup<deadline)yield return null;
   if(NativeScreenTransition.Busy||lobby.CinematicEntryPending){Debug.LogError("RigPixel lobby transition timeout");yield break;}
   lobby.SelectPreview();if(!lobby.EnterNativeTest()){Debug.LogError("RigPixel preview entry rejected");yield break;}
   deadline=Time.realtimeSinceStartup+30;
   while((NativeScreenTransition.Busy||lobby.CinematicEntryPending)&&Time.realtimeSinceStartup<deadline)yield return null;
   EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
   rigPixelEntryReady=!lobby.IsBlocking&&!NativeScreenTransition.Busy;
   if(!rigPixelEntryReady)Debug.LogError("RigPixel review must show real gameplay, lobby still blocking");
  }
  void AttachRigPixel(){
   if(!RigPixelRequested||rigPixelHero!=null||heroView==null||!heroView.Ready)return;
   rigPixelHero=gameObject.AddComponent<NativeRigPixelHero>();rigPixelHero.Initialize(heroView,()=>HudCamera,playerView);
  }
 }
}
