using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class Program
{
 static int passed,failed;
 static void Check(bool ok,string label){if(ok)passed++;else{failed++;Console.WriteLine("FAIL "+label);}}
 static int Main(string[] args){
  var json=JsonDocument.Parse(File.ReadAllText(args[0]));var source=json.RootElement.GetProperty("cuts");var cuts=new double[source.GetArrayLength()];for(int i=0;i<cuts.Length;i++)cuts[i]=source[i].GetDouble();
  var s=new WarriorStoryState(cuts);Check(s.Begin("아린"),"first start");Check(!s.Begin("루나")&&s.Name=="아린","duplicate start preserves identity");
  Check(s.Next(0)==1,"first cue");for(int i=0;i<cuts.Length-1;i++)Check(s.Next(cuts[i])==cuts[i+1],"source next "+i);Check(s.Next(92.9)==-1,"final cue completes");Check(s.Next(.95)==5.5,"strict epsilon boundary");
  s.SetHeld("Escape",true);s.Tick(.6,1,true);Check(!s.Entering&&s.HoldProgress==.5,"half hold");s.SetHeld("Space",true);s.SetHeld("Escape",false);s.Tick(.2,3,true);Check(s.HoldProgress>.6&&s.HintsHidden,"overlapping sources retain original start");
  s.SetHeld("Space",false);Check(s.HoldProgress==0,"last release resets");s.Tick(.1,0,true);Check(s.HintsHidden,"seek backwards does not re-show hints");
  s.SetHeld("Escape",true);s.Tick(.7,4,true);s.Tick(10,4,false);Check(!s.Entering&&s.HoldProgress==0,"blur cancels hold");s.Tick(1,5,true);Check(!s.Entering,"focus return does not resurrect held source");
  s.SetHeld("Escape",true);s.Tick(1.19,5,true);Check(!s.Entering,"below source threshold");s.Tick(.02,5,true);Check(s.Entering&&s.Seen&&!s.EntryReady,"threshold begins gate");s.Finish(false);Check(s.Seen,"late error cannot change completion");
  s.Tick(10,0,false);Check(!s.EntryReady,"unfocused gate pauses");s.Tick(1.19,0,true);Check(!s.EntryReady,"gate below source delay");s.Tick(.02,0,true);Check(s.EntryReady,"source 1200ms gate");s.Cancel();Check(!s.Active&&!s.EntryReady,"cancel invalidates delayed entry");
  s.Begin("루나");s.Finish(false);Check(s.Entering&&!s.Seen&&s.Name=="루나","media error enters unseen with same identity");s.Cancel();s.Begin("전사");Check(!s.HintsHidden&&!s.Entering&&!s.Seen,"next creation has independent lifetime");
  File.WriteAllText(args[1],JsonSerializer.Serialize(new{passed,failed,scope="Source cue boundaries, hold-source lifetime, focus and delayed-entry cancellation"}));Console.WriteLine($"{passed} passed, {failed} failed");return failed==0?0:2;
 }
}
