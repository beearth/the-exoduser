using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  static readonly bool RigPixelRequested=NativeRigPixelPolicy.Requested(Environment.GetCommandLineArgs());
  NativeRigPixelHero rigPixelHero;
  [Serializable] sealed class RigPixelEntryReceipt {public bool passed;public string route="actual M1 entry; visual review uses Warrior Core rules",page,resource;public int selectedVisual;public bool blocking,world3D;public int tick;}
  bool rigPixelEntryReady;
  void RigPixelEntryWrite(){string path=Argument("-output");if(string.IsNullOrEmpty(path))return;Directory.CreateDirectory(path);File.WriteAllText(Path.Combine(path,"rigpixel-entry.json"),JsonUtility.ToJson(new RigPixelEntryReceipt{passed=rigPixelEntryReady,selectedVisual=lobby.RigPixelSelectedVisual,resource=heroView!=null?NativeRigPixelPolicy.HeroResource(heroView.Visual):"missing",page=lobby.Flow.Page.ToString(),blocking=lobby.IsBlocking,world3D=NativeRemodel3D.Active,tick=Simulation!=null?Simulation.TickCount:0},true));}
  IEnumerator RigPixelEntryBoundary(){
   float deadline=Time.realtimeSinceStartup+30;
   while((NativeScreenTransition.Busy||lobby.CinematicEntryPending)&&Time.realtimeSinceStartup<deadline)yield return null;
   yield return null;
  }
  IEnumerator RigPixelReviewEntry(){
   rigPixelEntryReady=false;Running=false;RigPixelEntryWrite();
   // Let the initial field assembly finish before any 12s frontend prepare timer starts.
   float deadline=Time.realtimeSinceStartup+60;
   while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
   yield return new WaitForSecondsRealtime(.5f);
   lobby.ShowLobby();yield return RigPixelEntryBoundary();
   string fresh="Rig"+(DateTime.Now.Ticks%100000).ToString("00000");
   bool opened=lobby.OpenCharacterCreation();yield return RigPixelEntryBoundary();
   string hero=Argument("--rigpixel-review-hero");int visual=hero=="silvertail"?1:hero=="ivan"?2:0;
   if(!NativeRigPixelPolicy.ReviewSelectionAllowed(Environment.GetCommandLineArgs(),visual)){Debug.LogError("RigPixel selected hero requires isolated QA");yield break;}
   bool chosen=opened&&lobby.ChooseCharacterVisual(visual);bool confirmed=chosen&&lobby.ConfirmCharacterVisual();yield return RigPixelEntryBoundary();
   bool created=confirmed&&lobby.CreateCharacter(fresh);yield return RigPixelEntryBoundary();
   if(!created){Debug.LogError("RigPixel review identity creation failed");yield break;}
   lobby.ShowLobby();yield return RigPixelEntryBoundary();
   bool entered=lobby.BeginCharacterEntry(false);yield return RigPixelEntryBoundary();
   deadline=Time.realtimeSinceStartup+15;
   while(lobby.StartupCaptureState.Page!=Core.FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
   lobby.StartupCaptureState.Skip();yield return null;lobby.StartupCaptureState.Skip();yield return null;
   deadline=Time.realtimeSinceStartup+12;
   while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
   if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
   rigPixelEntryReady=entered&&!lobby.IsBlocking&&!NativeScreenTransition.Busy&&(!NativeRemodel3D.Requested||NativeRemodel3D.Active);
   RigPixelEntryWrite();
   if(!rigPixelEntryReady)Debug.LogError("RigPixel real M1 entry failed; no gameplay capture accepted");
  }
  void EnsureHeroView(){
   if(NativeHd2D.Enabled&&!RigPixelRequested)return;
   int visual=RigPixelRequested&&lobby!=null?lobby.RigPixelSelectedVisual:0;
   if(heroView!=null&&heroView.Visual!=visual){
    if(rigPixelHero!=null){rigPixelHero.Shutdown();Destroy(rigPixelHero.gameObject);rigPixelHero=null;}
    heroView.Dispose();heroView=null;
   }
   if(heroView==null)heroView=new NativeHeroView(transform,visual);
  }
  void AttachRigPixel(){
   if(!RigPixelRequested||rigPixelHero!=null||heroView==null||!heroView.Ready)return;
   var renderRoot=new GameObject("RigPixel renderer");renderRoot.transform.SetParent(transform,false);
   rigPixelHero=renderRoot.AddComponent<NativeRigPixelHero>();rigPixelHero.Initialize(heroView,()=>HudCamera,playerView);
  }
 }
}
