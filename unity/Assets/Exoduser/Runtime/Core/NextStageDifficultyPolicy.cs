using System;
namespace Exoduser.UnityPort.Core {
 // game.html NEXT_DIFF_OPTS / _showNextDiffPop. Selection has no gameplay effect until Confirm.
 public sealed class NextStageDifficultyPolicy {
  public const int Count=5;static readonly int[] offsets={-100,-50,0,50,100};
  public static int Offset(int index){if(index<0||index>=Count)throw new ArgumentOutOfRangeException(nameof(index));return offsets[index];}
  public static int IndexOf(int offset){int i=Array.IndexOf(offsets,offset);return i<0?2:i;}
  public bool Active{get;private set;}public int SelectedIndex{get;private set;}=2;public int ConfirmedOffset{get;private set;}
  public void Show(int previousOffset){SelectedIndex=IndexOf(previousOffset);Active=true;}
  public void Pick(int index){if(Active)SelectedIndex=((index%Count)+Count)%Count;}
  public bool Confirm(){if(!Active)return false;ConfirmedOffset=Offset(SelectedIndex);Active=false;return true;}
  public void Cancel(){Active=false;}
 }
}
