namespace Exoduser.UnityPort.Core {
 // A heavy on-black callback may run only after a fully black Repaint has been submitted in an earlier frame.
 public sealed class BlackPresentationLatch {
  public bool Pending {get;private set;}public int PresentedFrame {get;private set;}=-1;int requestedFrame;
  public void Request(int frame){Pending=true;requestedFrame=frame;PresentedFrame=-1;}
  public void Paint(int frame,double opacity){if(Pending&&frame>=requestedFrame&&opacity>=1)PresentedFrame=frame;}
  public bool TryConsume(int frame){if(!Pending||PresentedFrame<requestedFrame||frame<=PresentedFrame)return false;Pending=false;return true;}
  public void Cancel(){Pending=false;PresentedFrame=-1;}
 }
}
