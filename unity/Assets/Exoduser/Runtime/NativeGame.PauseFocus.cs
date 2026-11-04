namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  bool gameFocused=true;
  void OnApplicationFocus(bool focus){if(!pauseSmoke&&!dropSmoke&&!m1ModeFlag)SetGameFocus(focus);}   // --unity-m1-check: an unattended run is never auto-paused by focus loss
  public void SetGameFocus(bool focus)
  {
   gameFocused=focus;if(pauseMenu==null)return;pauseMenu.SetFocus(focus);inventory.SetFocus(focus);
   if(!focus&&lobby!=null&&!lobby.IsBlocking&&!(Simulation!=null&&PlayerDown&&death.Active)){   // L11: death decision screen keeps its state on focus loss
    Running=false;
    if(!menu&&!inventory.Open&&!skills.Open){menu=true;pauseMenu.Reset();}
   }
   // Focus return never restarts combat or confirms the highlighted action.
  }
 }
}
