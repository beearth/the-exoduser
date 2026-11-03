using System;
using Exoduser.UnityPort;

static class Program
{
 static int checks;
 static void Check(bool ok,string name){checks++;if(!ok)throw new Exception(name);}
 static NativePetBubbleCue Cue(string id,int tier=0,int weight=0,float cd=40)=>new NativePetBubbleCue{id=id,tier=tier,weight=weight,who="crow",key="first",seconds=4,pairWho="cat",pairKey="second",pairSeconds=4,cooldown=cd};
 static void Start(NativePetBubbleQueue q,NativePetBubbleCue c){q.BeginFrame(0,false,false,false);q.Offer(c);q.Dispatch();}
 static void Main()
 {
  var q=new NativePetBubbleQueue();var env=Cue("env");
  Start(q,env);Check(q.Visible&&q.Key=="first"&&q.Speaker=="crow","first line");
  q.BeginFrame(4,false,false,false);Check(q.Visible&&q.PairPhase&&q.Key=="second"&&q.Speaker=="cat","pair starts once");
  q.BeginFrame(4,false,false,false);Check(!q.Active,"pair ends");
  q.Offer(env);Check(q.Dispatch()==null,"id cooldown");
  q.Reset();Start(q,env);q.BeginFrame(20,false,false,false);Check(!q.Active,"large tick expires both lines");
  q.Reset();Start(q,env);q.BeginFrame(2,true,false,false);Check(!q.Visible&&q.Remaining==4,"menu hides and freezes");
  q.BeginFrame(0,false,false,false);Check(q.Visible,"menu resumes");
  q.BeginFrame(0,false,true,false);Check(!q.Active,"death clears current and pair");
  q.Reset();q.BeginFrame(0,false,false,false);q.Offer(Cue("low",0));q.Offer(Cue("high",4));Check(q.Dispatch().id=="high","highest tier wins one slot");
  q.BeginFrame(0,false,false,false);q.Offer(Cue("normal",2));Check(q.Dispatch()==null,"normal cannot interrupt");
  q.Offer(Cue("urgent",5,100));Check(q.Dispatch().id=="urgent"&&!q.PairPhase,"T5 cancels pair");
  q.BeginFrame(0,false,false,false);q.Offer(Cue("less-urgent",5,40));Check(q.Dispatch()==null,"lower survival weight cannot overwrite critical");
  q.BeginFrame(0,false,false,false);q.Offer(Cue("urgent",5,100));Check(q.Dispatch()==null,"no repeating active urgent");
  q.BeginFrame(8,false,false,false);q.Offer(Cue("during-suppression",0));Check(q.Dispatch()!=null,"lower tier allowed after five seconds");
  q.Reset();Start(q,Cue("warning",5,40));q.BeginFrame(0,false,false,false);q.Offer(Cue("critical",5,100));Check(q.Dispatch().id=="critical","higher T5 interrupts T5");
  q.BeginFrame(0,false,false,true);q.Offer(Cue("flavor",0));Check(q.Dispatch()==null,"finale blocks low tier");
  q.Reset();q.BeginFrame(0,false,false,true);q.Offer(Cue("tutorial",1));Check(q.Dispatch()==null,"finale blocks tutorials");
  q.Offer(Cue("combat",4));Check(q.Dispatch()!=null,"finale permits combat");
  q.Reset();Start(q,Cue("flavor",0));q.BeginFrame(0,false,false,true);Check(!q.Active,"finale removes active low tier pair");
  for(int tier=0;tier<6;tier++){
   q.Reset();Start(q,Cue("a",tier,0,0));q.BeginFrame(8,false,false,false);q.Offer(Cue("b",tier,0,0));
   bool eligible=NativePetBubbleQueue.TierCooldown[tier]<=8;Check((q.Dispatch()!=null)==eligible,"tier cooldown "+tier);
  }
  q.Reset();Start(q,Cue("warning",5,100));q.BeginFrame(0,false,true,false);q.BeginFrame(4,false,false,false);q.Offer(Cue("early",4));Check(q.Dispatch()==null,"T5 lower tier suppression five seconds");
  q.BeginFrame(1,false,false,false);q.Offer(Cue("on-time",4));Check(q.Dispatch()!=null,"suppression ends at five seconds");
  q.Reset();q.BeginFrame(0,false,false,false);q.Offer(env);Check(q.Dispatch()!=null,"run reset clears id cooldown");
  q.Reset();Check(!q.Active&&q.Clock==0,"encounter reset clears pending and clock");
  Check(!NativePetBubblePolicy.EnvironmentReady(30,false,false),"environment strictly after thirty seconds");
  Check(!NativePetBubblePolicy.EnvironmentReady(31,true,true),"boss flag blocks environment");
  Check(!NativePetBubblePolicy.EnvironmentReady(31,false,false),"unobserved flag is not equivalent");
  Check(NativePetBubblePolicy.EnvironmentReady(31,false,true),"observed defeat conservative common condition");
  Check(!NativePetBubblePolicy.BossReady(true,false,true),"no boss reference means no intro");
  Check(NativePetBubblePolicy.BossReady(true,true,true),"alive arena actor means boss intro");
  string hint=NativePetBubbleHints.Resolve("Shift / SHIFT / Space. Q! Equal Shifter.",action=>action=="charge"?"C":action=="bow"?"B":action=="parry"?"V":"?");
  Check(hint=="C / C / B. V! Equal Shifter.","key boundaries and rebind");
  Check(NativePetBubbleHints.Resolve("Shift",_=>"LB")=="LB","device label supplied without rewriting source key");
  Check(NativePetBubbleHints.Resolve("Shift",_=>"R3")=="R3","input mapping can refresh");
  Console.WriteLine("Pet bubble policy checks="+checks+" failed=0");
 }
}
