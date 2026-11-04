using System;

namespace Exoduser.UnityPort.Core
{
 // P31/P32: web custom cursor (game.html _buildCursor): the 128 px source is drawn at out=clamp(round(64*cursorSize/100),16,256) px, hotspot (round(out*13/56),0).
 // Unity ships pre-built textures for these steps (Resources/Art/ui/cursors/cursor_<dark|purple>_<step>.bytes, PNG data) and picks the nearest one.
 public static class NativeCursorSteps
 {
  public static readonly int[] Steps={20,24,28,32,40,48,56,64,80,96,112,128};
  public static readonly string[] Kinds={"dark","purple"};
  public static int WebPixels(int sizePercent)
  {
   int out_=(int)Math.Round(64*sizePercent/100.0,MidpointRounding.AwayFromZero);
   return Math.Max(16,Math.Min(256,out_));
  }
  // Nearest shipped step to the web pixel size (a tie goes to the smaller step).
  public static int StepFor(int sizePercent)
  {
   int want=WebPixels(sizePercent),best=Steps[0];
   foreach(int s in Steps)if(Math.Abs(s-want)<Math.Abs(best-want))best=s;
   return best;
  }
  public static void Hotspot(int step,out int x,out int y){x=(int)Math.Round(step*13/56.0,MidpointRounding.AwayFromZero);y=0;}
  public static string ResourcePath(int kind,int step){return "Art/ui/cursors/cursor_"+Kinds[Math.Max(0,Math.Min(Kinds.Length-1,kind))]+"_"+step;}
 }
}
