using System;
using System.Linq;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

static class ArenaReviewPolicyTests
{
    public static void Run(Action<bool,string> check)
    {
        int count=0;
        Action<bool,string> test=(ok,label)=>{count++;check(ok,"arena coverage: "+label);};
        Func<BossRemodelSet,NativeArenaReviewPolicy.LifeCoverageTracker> create=set=>new NativeArenaReviewPolicy.LifeCoverageTracker(set);
        var tracker=create(DruidRemodelData.Set);
        for(int phase=0;phase<3;phase++)
        {
            int start=100+phase*6000;
            test(tracker.Waiting(phase,start),"fresh life does not inherit previous coverage P"+(phase+1));
            string[] expected=DruidRemodelData.Set.MovesOfPhase(phase);
            foreach(string id in expected.Take(expected.Length-1))tracker.Observe(phase,start+1,id);
            tracker.Observe(phase,start+2,null);
            tracker.Observe(phase,start+2,"not-a-move");
            test(tracker.Waiting(phase,start+3),"partial or non-activation cannot release P"+(phase+1));
            tracker.Observe(phase,start+4,expected.Last());
            test(!tracker.Waiting(phase,start+4),"all actual moves release P"+(phase+1));
            tracker.Observe(phase,start+5,expected.Last());
        }
        var rows=tracker.Results();
        test(rows.Length==3,"receipt contains three entered lives");
        for(int i=0;i<3;i++)
        {
            var row=rows[i];
            test(row.life==i+1&&row.complete&&!row.coverageTimeout,"completed life receipt P"+(i+1));
            test(row.expected.Length==new[]{4,6,7}[i]&&row.activated.Length==row.expected.Length&&row.missing.Length==0,"4/6/7 unique moves from set P"+(i+1));
            test(row.elapsedTicks==4,"completed timer freezes P"+(i+1));
        }
        var timeout=create(DruidRemodelData.Set);
        test(timeout.Waiting(0,500)&&timeout.Waiting(0,5899),"wait through 5399 ticks");
        test(!timeout.Waiting(0,5900)&&!timeout.Waiting(0,8000),"release at exactly 5400 ticks, latched");
        timeout.Observe(0,8001,"slashCombo");
        var timed=timeout.Results();
        test(timed.Length==1&&timed[0].coverageTimeout&&!timed[0].complete&&timed[0].elapsedTicks==5400,"timeout receipt retains 90s limit");
        test(((string[])timed[0].missing).Contains("grab"),"timeout does not fabricate activations");
        test(timeout.Waiting(1,8002),"next life has its own 90s budget after timeout");
        test(!timeout.Waiting(-1,8003)&&!timeout.Waiting(3,8003),"invalid phase cannot stall");
        var custom=new BossRemodelSet{Lives=1,Moves=new[]{new BossMove{Id="custom",Phase=new[]{0}}}};
        var changed=create(custom);
        test(changed.Waiting(0,0),"custom set waits for its move");changed.Observe(0,1,"slashCombo");
        test(changed.Waiting(0,1),"global list cannot satisfy custom set");changed.Observe(0,2,"custom");
        test(!changed.Waiting(0,2),"actual set controls required moves");
        var empty=create(new BossRemodelSet{Lives=1,Moves=new BossMove[0]});
        test(!empty.Waiting(0,0),"empty life proceeds immediately");
        var fresh=create(DruidRemodelData.Set);
        test(fresh.Waiting(0,0),"new encounter does not inherit completed lives");
        var boundary=create(custom);test(boundary.Waiting(0,10),"boundary setup");boundary.Observe(0,5410,"custom");
        test(!boundary.Waiting(0,5410)&&!boundary.Results()[0].coverageTimeout,"activation on deadline completes before timeout");
        foreach(bool review in new[]{false,true})foreach(bool waiting in new[]{false,true})foreach(bool contact in new[]{false,true})foreach(bool edge in new[]{false,true})
        {
            string want=!review?"Existing":waiting?"Coverage":contact?"Contact":edge?"Edge":"Existing";
            test(NativeArenaReviewPolicy.InputStepFor(review,waiting,contact,edge).ToString()==want,"review/coverage/seq/edge "+review+waiting+contact+edge);
        }
        foreach(string state in new[]{"bossSlashWind","bossSlamWind","bossChargeWind","bossGrabWind","bossDruidDive","bossDruidUnder","bossHeartWind","bossRmWind"})
            test(NativeArenaReviewPolicy.Activation(state,10,"idle",0,0,false,false,0,0)==null,"warning is not an activation: "+state);
        test(NativeArenaReviewPolicy.Activation("bossSlash",DruidRemodelData.SlashHitAt,"bossSlash",0,0,false,false,0,0)=="slashCombo","slash hit timer");
        test(NativeArenaReviewPolicy.Activation("bossRec",0,"bossSlam",0,0,false,false,0,0)=="slam","slam completion edge");
        test(NativeArenaReviewPolicy.Activation("bossCharge",0,"bossChargeWind",0,0,false,false,0,0)=="charge","charge executor entry");
        test(NativeArenaReviewPolicy.Activation("bossGrabLunge",0,"bossGrabWind",0,0,false,false,0,0)=="grab","grab executor entry");
        test(NativeArenaReviewPolicy.Activation("bossDruidErupt",0,"bossDruidErupt",0,0,true,false,0,0)=="burrowStrike","erupt hit edge");
        test(NativeArenaReviewPolicy.Activation("idle",0,"idle",0,0,false,false,2,1)=="groundFissure","live hazard serial");
        test(NativeArenaReviewPolicy.Activation("bossHeartPause",0,"bossHeartWind",1,0,false,false,0,0)=="heartbeat","actual pulse count");
        Console.WriteLine("arena-coverage checks="+count);
    }
}
