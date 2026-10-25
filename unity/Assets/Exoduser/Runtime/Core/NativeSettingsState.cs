using System;

namespace Exoduser.UnityPort.Core
{
 // Current-session settings only; never reads or writes original game saves.
 public sealed class NativeSettingsState
 {
  public const int DefaultSfxPercent=60;
  public const int DefaultBgmPercent=60;
  public const int DefaultFrameCap=0;
  static readonly int[] frameCaps={30,60,120,144,244,0};
  public int SfxPercent { get; private set; }
  public int BgmPercent { get; private set; }
  public int FrameCap { get; private set; }
  public static int FrameCapCount { get { return frameCaps.Length; } }
  public static int GetFrameCap(int index) { return frameCaps[index]; }
  public NativeSettingsState(int initialFrameCap=DefaultFrameCap)
  {
   if(!TrySetFrameCap(initialFrameCap))throw new ArgumentOutOfRangeException("initialFrameCap");
   SfxPercent=DefaultSfxPercent;BgmPercent=DefaultBgmPercent;
  }
  static int Percent(int value) { return Math.Max(0,Math.Min(100,value)); }
  public void SetSfxPercent(int value) { SfxPercent=Percent(value); }
  public void SetBgmPercent(int value) { BgmPercent=Percent(value); }
  public bool TrySetFrameCap(int value)
  {
   foreach(int cap in frameCaps)if(value==cap){FrameCap=value;return true;}
   return false;
  }
  public int UnityFrameCap { get { return FrameCap==0?-1:FrameCap; } }
  public float SfxGain { get { return SfxPercent/100f; } }
  // Existing admitted samples use the source volume control in sample and master stages.
  public float SampleOutputGain(float sampleVolume) { return Math.Min(1,sampleVolume*SfxGain)*SfxGain; }
  // Preserve the admitted track's phase gain at the source default of sixty percent.
  public float BgmRelativeGain { get { return BgmPercent/(float)DefaultBgmPercent; } }
  public void RestoreDefaults()
  {
   SfxPercent=DefaultSfxPercent;BgmPercent=DefaultBgmPercent;FrameCap=DefaultFrameCap;
  }
 }
}
