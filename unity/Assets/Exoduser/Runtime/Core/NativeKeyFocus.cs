namespace Exoduser.UnityPort.Core
{
 // Keyboard focus stops of the Controls tab key list (web: every key button is a real button in DOM order = action by action: main key, secondary key; the reset button last).
 // Stop 2k = main key of listed action k, 2k+1 = its secondary key, 2*rows = the reset button. Up/Down/Tab walk the stops in this order (PauseNavigation Cursor +-1),
 // Left/Right jump between the main and the secondary key of the same action.
 public static class NativeKeyFocus
 {
  public static int StopCount(int rows){return rows<=0?0:rows*2+1;}
  public static bool IsReset(int stop,int rows){return rows>0&&stop==rows*2;}
  public static bool IsSlot(int stop,int rows){return stop>=0&&stop<rows*2;}
  public static int Row(int stop){return stop/2;}
  public static bool IsSecondary(int stop){return (stop&1)==1;}
  // dir -1 = Left (main key), +1 = Right (secondary key). The reset button and out-of-range stops stay where they are.
  public static int Horizontal(int stop,int rows,int dir)
  {
   if(!IsSlot(stop,rows))return stop;
   return dir<0?stop&~1:stop|1;
  }
 }
}
