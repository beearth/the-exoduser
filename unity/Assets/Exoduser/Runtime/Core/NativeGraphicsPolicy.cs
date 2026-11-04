using System;

namespace Exoduser.UnityPort.Core
{
 // P18 (P12, P14-P29): which web graphics settings have a real Unity effect in this build. Everything else keeps its web row but is shown as unavailable (greyed, no input).
 // Reasons are kept in docs/3.1 ui hud 디자인/UNITY_PAUSE_OPTIONS_PARITY_20261104.md ("P18 처리 표").
 public static class NativeGraphicsPolicy
 {
  // OPT keys without a Unity counterpart: no particle-amount hook in the VFX Graph events (P12), no ghost flame (P15, P17), death FX are Core no-op callbacks (P22),
  // the 3D scene lights are the locked 1-1 look (P23, P24), no web weather/ambient particles (P25, P26), film grain is banned by the dot rule (P28), no outline pass (P29).
  public static readonly string[] Unavailable={"parts","irisSz","irisGlow","deathFx","lighting","torch","atmos","ambPart","grain","outline"};
  // Wired: resScale (P14), bloom (P18), trail (P19), slash (P20), postfx (P21), fog (P27). brightness (P16), showFps and shake were already wired.
  public static readonly string[] Wired={"resScale","bloom","trail","slash","postfx","fog","brightness","showFps","shake"};
  public static bool IsAvailable(string key){return Array.IndexOf(Unavailable,key)<0;}
  // URP render scale multiplier for the web Resolution Scale value (50..100 %).
  public static float RenderScale(int percent){return Math.Max(50,Math.Min(100,percent))/100f;}
 }
}
