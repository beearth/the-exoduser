using System;
namespace Exoduser.UnityPort {
 internal static class NativeUiTextFlow {
  internal static float TitlePitch(float measured)=>Math.Max(33.6f,(float)Math.Ceiling(measured)+2);
  internal static float TitleExtra(int lines,float pitch)=>Math.Max(0,lines-1)*pitch;
  internal static float FooterExtra(int lines)=>Math.Max(0,lines-1)*24f;
  internal static float KeyNameWidth(float rowWidth,float pad,float mainWidth,float altWidth)=>Math.Max(1,rowWidth-pad*2-mainWidth-altWidth-20);
  internal static float KeyPitch(float measured)=>Math.Max(32,(float)Math.Ceiling(measured)+2);
  internal static float KeyRowHeight(int lines,float pitch)=>Math.Max(56,Math.Max(1,lines)*pitch+16);
 }
}
