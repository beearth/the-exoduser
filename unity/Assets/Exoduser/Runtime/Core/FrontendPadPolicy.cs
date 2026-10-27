namespace Exoduser.UnityPort.Core
{
 public enum FrontendPadPhase { Story,Nemesis,Guide }

 // Logical buttons only. NativeLobby maps the project's existing Confirm, Cancel and Start inputs.
 public struct FrontendPadFrame
 {
  public int Number;
  public bool ConfirmDown,ConfirmHeld,CancelHeld,StartDown,StartHeld;
  public bool AnyHeld {get{return ConfirmHeld||CancelHeld||StartHeld;}}
 }

 public struct FrontendPadDecision
 {
  public bool Next,Skip,Hold;
 }

 // One decision per Unity frame. Entry, focus and page changes require every pad button to be released.
 public sealed class FrontendPadPolicy
 {
  int lastFrame=-1;
  bool releaseFence=true,hasPhase;
  FrontendPadPhase phase;

  public void Reset(){releaseFence=true;hasPhase=false;lastFrame=-1;}

  public FrontendPadDecision Step(FrontendPadPhase current,FrontendPadFrame frame,bool enabled)
  {
   if(frame.Number==lastFrame)return default(FrontendPadDecision);
   lastFrame=frame.Number;
   if(!enabled){releaseFence=true;hasPhase=false;return default(FrontendPadDecision);}
   if(!hasPhase||phase!=current){phase=current;hasPhase=true;releaseFence=true;}
   if(releaseFence){if(!frame.AnyHeld)releaseFence=false;return default(FrontendPadDecision);}
   if(current==FrontendPadPhase.Story)
    return new FrontendPadDecision{Next=frame.ConfirmDown,Hold=frame.CancelHeld||frame.StartHeld};
   if(frame.StartDown)return new FrontendPadDecision{Skip=true};
   if(current==FrontendPadPhase.Nemesis)
    return new FrontendPadDecision{Next=frame.ConfirmDown,Hold=frame.CancelHeld};
   return new FrontendPadDecision{Next=frame.ConfirmDown};
  }
 }
}
