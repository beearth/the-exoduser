using System;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  static readonly bool RigPixelRequested=NativeRigPixelPolicy.Requested(Environment.GetCommandLineArgs());
  NativeRigPixelHero rigPixelHero;
  void AttachRigPixel(){
   if(!RigPixelRequested||rigPixelHero!=null||heroView==null||!heroView.Ready)return;
   rigPixelHero=gameObject.AddComponent<NativeRigPixelHero>();rigPixelHero.Initialize(heroView,()=>HudCamera,playerView);
  }
 }
}
