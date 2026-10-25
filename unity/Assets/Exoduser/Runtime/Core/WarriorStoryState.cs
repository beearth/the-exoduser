using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort.Core
{
 // Source character-story-player.js lifetime. No character or progress storage.
 public sealed class WarriorStoryState
 {
  readonly double[] cuts;
  readonly HashSet<string> held=new HashSet<string>();
  public const double HoldSeconds=1.2,GateSeconds=1.2;
  public bool Active {get;private set;}
  public bool Entering {get;private set;}
  public bool Seen {get;private set;}
  public bool HintsHidden {get;private set;}
  double hintFade;
  public double HintsOpacity {get{return HintsHidden?Math.Max(0,1-hintFade/.4):1;}}
  public string Name {get;private set;}="";
  public double HoldProgress {get;private set;}
  public double GateElapsed {get;private set;}
  public bool EntryReady {get{return Active&&Entering&&GateElapsed>=GateSeconds;}}
  public WarriorStoryState(double[] cuts){this.cuts=(double[])cuts.Clone();}
  public bool Begin(string name){if(Active||string.IsNullOrEmpty(name))return false;Active=true;Entering=false;Seen=false;HintsHidden=false;hintFade=0;Name=name;GateElapsed=0;CancelHold();return true;}
  public double Next(double time){foreach(double cut in cuts)if(cut>time+.05)return cut;return -1;}
  public void SetHeld(string source,bool down){if(!Active||Entering)return;if(down)held.Add(source);else held.Remove(source);if(held.Count==0)HoldProgress=0;}
  public void CancelHold(){held.Clear();HoldProgress=0;}
  public void Tick(double delta,double time,bool focused){if(!Active)return;if(!focused){CancelHold();return;}delta=Math.Max(0,delta);if(Entering){GateElapsed+=delta;return;}if(time>=3)HintsHidden=true;if(HintsHidden)hintFade+=delta;if(held.Count>0){HoldProgress=Math.Min(1,HoldProgress+delta/HoldSeconds);if(HoldProgress>=1)Finish(true);}}
  public void Finish(bool seen){if(!Active||Entering)return;Seen=seen;Entering=true;GateElapsed=0;CancelHold();}
  public void Cancel(){Active=false;Entering=false;GateElapsed=0;CancelHold();}
 }
}
