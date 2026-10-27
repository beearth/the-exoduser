using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort.Core;

// Logical pad contract only. No OS controller, media, roster or save is opened.
public static class FrontendPadVerification
{
 static int checks;
 static void Check(bool ok,string label){if(!ok)throw new Exception("Frontend pad: "+label);checks++;}
 static FrontendPadFrame Frame(int number,bool confirm=false,bool cancel=false,bool start=false,bool confirmDown=false,bool startDown=false)
 {return new FrontendPadFrame{Number=number,ConfirmHeld=confirm,CancelHeld=cancel,StartHeld=start,ConfirmDown=confirmDown,StartDown=startDown};}

 public static void Run()
 {
  var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");
  if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1]))throw new ArgumentException("Absolute -output QA path required");
  string output=args[at+1];Directory.CreateDirectory(output);
  var policy=new FrontendPadPolicy();
  Check(!policy.Step(FrontendPadPhase.Story,Frame(1),true).Next,"entry neutral frame");
  var next=policy.Step(FrontendPadPhase.Story,Frame(2,confirm:true,confirmDown:true),true);
  Check(next.Next&&!next.Hold&&!next.Skip,"story Confirm edge is Next");
  Check(!policy.Step(FrontendPadPhase.Story,Frame(2,confirm:true,confirmDown:true),true).Next,"one action per frame");
  Check(!policy.Step(FrontendPadPhase.Story,Frame(3,confirm:true),true).Next,"held Confirm does not repeat Next");
  var combinedPolicy=new FrontendPadPolicy();combinedPolicy.Step(FrontendPadPhase.Story,Frame(1),true);
  var combined=combinedPolicy.Step(FrontendPadPhase.Story,Frame(2,confirm:true,cancel:true,confirmDown:true),true);
  Check(combined.Next&&combined.Hold&&!combined.Skip,"story Confirm edge and Cancel hold coexist in one frame");
  combinedPolicy.Step(FrontendPadPhase.Story,Frame(3),true);
  combined=combinedPolicy.Step(FrontendPadPhase.Story,Frame(4,confirm:true,start:true,confirmDown:true,startDown:true),true);
  Check(combined.Next&&combined.Hold&&!combined.Skip,"story Confirm edge and Start hold coexist in one frame");

  var story=new WarriorStoryState(new double[]{1,5});Check(story.Begin("pad"),"story begins");
  var hold=policy.Step(FrontendPadPhase.Story,Frame(4,start:true,startDown:true),true);
  Check(hold.Hold&&!hold.Next&&!hold.Skip,"Start begins story hold without immediate skip");
  story.SetHeld("pad",hold.Hold);story.Tick(1.199,1,true);
  Check(!story.Entering,"story below 1.2-second hold boundary");
  hold=policy.Step(FrontendPadPhase.Story,Frame(5,start:true),true);story.SetHeld("pad",hold.Hold);story.Tick(.002,1,true);
  Check(story.Entering&&story.Seen,"story crosses 1.2-second hold boundary once");

  story.Cancel();Check(story.Begin("release"),"fresh story begins");
  hold=policy.Step(FrontendPadPhase.Story,Frame(6,cancel:true),true);story.SetHeld("pad",hold.Hold);story.Tick(.6,1,true);
  Check(hold.Hold&&story.HoldProgress>0,"existing Cancel input starts hold");
  hold=policy.Step(FrontendPadPhase.Story,Frame(7),true);story.SetHeld("pad",hold.Hold);
  Check(!hold.Hold&&story.HoldProgress==0,"last release cancels hold");
  policy.Reset();Check(!policy.Step(FrontendPadPhase.Story,Frame(8,start:true,startDown:true),true).Hold,"scene entry absorbs held Start");
  Check(!policy.Step(FrontendPadPhase.Story,Frame(9),true).Hold,"release opens fence without action");
  Check(policy.Step(FrontendPadPhase.Story,Frame(10,cancel:true),true).Hold,"fresh press after release is accepted");
  policy.Step(FrontendPadPhase.Story,Frame(11,cancel:true),false);
  Check(!policy.Step(FrontendPadPhase.Story,Frame(12,cancel:true),true).Hold,"focus/input disable requires release");
  policy.Step(FrontendPadPhase.Story,Frame(13),true);

  Check(!policy.Step(FrontendPadPhase.Guide,Frame(14,confirm:true,confirmDown:true),true).Next,"page transition absorbs held Confirm");
  policy.Step(FrontendPadPhase.Guide,Frame(15),true);
  var guide=policy.Step(FrontendPadPhase.Guide,Frame(16,confirm:true,confirmDown:true),true);
  Check(guide.Next&&!guide.Skip,"guide Confirm chooses Next regardless of keyboard focus");
  guide=policy.Step(FrontendPadPhase.Guide,Frame(17,confirm:true,start:true,confirmDown:true,startDown:true),true);
  Check(guide.Skip&&!guide.Next,"guide Start has priority and skips immediately");
  policy.Step(FrontendPadPhase.Nemesis,Frame(18),true);policy.Step(FrontendPadPhase.Nemesis,Frame(19),true);
  var nemesis=policy.Step(FrontendPadPhase.Nemesis,Frame(20,cancel:true),true);
  Check(nemesis.Hold&&!nemesis.Skip,"Nemesis Cancel hold remains timed by entry flow");
  nemesis=policy.Step(FrontendPadPhase.Nemesis,Frame(21,start:true,startDown:true),true);
  Check(nemesis.Skip&&!nemesis.Hold,"Nemesis Start skips immediately");

  File.WriteAllText(Path.Combine(output,"frontend-pad-policy.json"),JsonUtility.ToJson(new Receipt{passed=true,checks=checks,scope="logical frames, release/focus/phase fences, Story 1.2s hold, Guide Confirm/Start"},true));
  Debug.Log("FRONTEND_PAD_POLICY_PASS checks="+checks);
 }
 [Serializable] sealed class Receipt{public bool passed;public int checks;public string scope;}
}
