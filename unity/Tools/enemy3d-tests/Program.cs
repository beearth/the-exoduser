using System;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
static class Program {
 static int checks,fail;static void Check(bool value,string name){checks++;if(!value){fail++;Console.WriteLine("FAIL "+name);}}
 static void Main(){
 Check(!NativeEnemyRigPolicy.Requested(null),"default sprite");Check(NativeEnemyRigPolicy.Requested(new[]{"--enemy-render=rigpixel"}),"opt in");Check(!NativeEnemyRigPolicy.Requested(new[]{"--enemy-render=rigpixel","--enemy-render=sprite"}),"last flag wins");Check(NativeEnemyRigPolicy.Requested(new[]{"--enemy-render","rigpixel"}),"split flag");
 var e=new EnemyState{Id=1,Etype=4,Alive=true,Radius=16,Web=new EnemySpawn{s="idle"}};var p=new NativeEnemyRigPolicy();
 Check(p.Sample(e,100,0).State==EnemyRigState.Idle,"idle");Check(p.Sample(e,101,2).State==EnemyRigState.Move,"move");
 e.Web.s="g2Tell";e.Web.MeleeTellMax=36;e.Web.MeleeTimer=36;e.Web.MeleeTellSerial=1;var s=p.Sample(e,102,2);Check(s.State==EnemyRigState.Tell&&s.Normalized==0,"tell first tick");e.Web.MeleeTimer=1;s=p.Sample(e,137,2);Check(Math.Abs(s.Normalized-35.0/36)<.0001,"tell exact Core progress");
 e.Web.s="g2Active";e.Web.MeleeActiveMax=3;e.Web.MeleeTimer=3;s=p.Sample(e,138,2);Check(s.State==EnemyRigState.Active&&s.Normalized==0,"active starts at Core frame");
 e.Web.MeleeTimer=1;Check(Math.Abs(p.Sample(e,140,2).Normalized-2.0/3)<.0001,"active last tick");e.Web.s="g2Gap";e.Web.MeleeTimer=22;Check(p.Sample(e,141,2).State==EnemyRigState.Recover,"combo gap");
 e.MeleeFreezeUntil=200;e.MeleeParriedTick=155;Check(p.Sample(e,155,2).State==EnemyRigState.Recover,"parried counter window");e.MeleeFreezeUntil=0;e.Stunned=180;Check(p.Sample(e,156,2).State==EnemyRigState.Stagger,"poise break");e.Stunned=0;e.Web.s="idle";e.HurtTicks=8;Check(p.Sample(e,157,2).State==EnemyRigState.Hit,"hurt");
 e.Alive=false;Check(p.Sample(e,158,2).State==EnemyRigState.Death,"death priority");Check(p.Sample(e,158,2).Age==0,"same tick cannot advance death");Check(p.Sample(e,200,2).Age==42,"death uses Core ticks");e.Alive=true;e.HurtTicks=0;Check(p.Sample(e,201,2).State!=EnemyRigState.Death,"revive clears death");
 var ranged=new EnemyState{Alive=true,Etype=1,Web=new EnemySpawn{s="idle",_projChargeT=60}};var q=new NativeEnemyRigPolicy();Check(q.Sample(ranged,1,0).State==EnemyRigState.Tell,"ranged charge");ranged.Web._projChargeT=1;Check(q.Sample(ranged,60,0).Normalized>0.98,"ranged last charge frame");ranged.Web._projChargeT=0;Check(q.Sample(ranged,61,0).State==EnemyRigState.Active,"ranged release");Check(q.Sample(ranged,64,0).State==EnemyRigState.Recover,"ranged recovery");
 for(int i=0;i<40;i++){double ratio=NativeEnemyRigPolicy.ImpactRatio(i%2==0?0:1,i==39);Check(ratio>=.6&&ratio<=(i==39?1.2:1),"impact scale range "+i);}
 Check(NativeEnemyRigPolicy.AnchorRatio(-1)==0,"anchor low clamp");Check(NativeEnemyRigPolicy.AnchorRatio(2)==1,"anchor high clamp");Check(NativeEnemyRigPolicy.AnchorRatio(double.NaN)==.55,"invalid anchor fallback");
 Console.WriteLine(checks+" checks / "+fail+" failures");Environment.ExitCode=fail==0?0:1;
 }
}
