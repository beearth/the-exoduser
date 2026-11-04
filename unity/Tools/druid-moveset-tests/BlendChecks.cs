using System;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

static class BlendChecks
{
    internal static void Run(Action<double,double,string> near)
    {
        near(NativeDruidBlendPolicy.FadeTicks / 60.0, .15, "M6 default crossfade seconds");
        var wind = NativeDruidRigPolicy.Select(new DruidData {S="bossSlamWind",RmMoveId="slam",St2=52,RmTeleTotal=52},false);
        near(NativeDruidBlendPolicy.Duration("bossSlamWind",wind),9,"normal transition has 9 Core tick blend");
        near(NativeDruidBlendPolicy.Weight(0,9),0,"transition starts at outgoing pose");
        near(NativeDruidBlendPolicy.Weight(4.5,9),.5,"transition midpoint");
        near(NativeDruidBlendPolicy.Weight(9,9),1,"transition complete at 0.15 seconds");
        near(NativeDruidBlendPolicy.Weight(90,9),1,"late samples clamp to incoming pose");
        near(NativeDruidBlendPolicy.Weight(-1,9),0,"negative elapsed clamped");
        near(NativeDruidBlendPolicy.Weight(0,0),1,"immediate contact never waits for blend");
        double previous=-1;
        for(int tick=0;tick<=9;tick++)
        {
            double weight=NativeDruidBlendPolicy.Weight(tick,9);
            near(weight>=previous&&weight>=0&&weight<=1?1:0,1,"blend monotonically approaches target");previous=weight;
        }
        var slash = NativeDruidRigPolicy.Select(new DruidData {S="bossSlash",RmMoveId="slashCombo",St2=8},false);
        near(slash.Frame,6,"existing slash contact pose remains source frame 6 at Core tick 2");
        near(NativeDruidBlendPolicy.Duration("bossSlash",slash),0,"late slash sample cannot blend beyond contact");
        var slashStart=NativeDruidRigPolicy.Select(new DruidData{S="bossSlash",RmMoveId="slashCombo",St2=10},false);
        near(NativeDruidBlendPolicy.Duration("bossSlash",slashStart),2,"slash entry blend capped by Core contact deadline");
        near(NativeDruidBlendPolicy.Weight(2,NativeDruidBlendPolicy.Duration("bossSlash",slash)),1,"slash reaches exact incoming pose at damage tick");
        near(NativeDruidBlendPolicy.Duration("bossSlam",NativeDruidRigPolicy.Select(new DruidData{S="bossSlam",St2=6},false)),6,"slam blend fits 6 Core active ticks");
        foreach(var state in new[]{"bossCharge","bossGrabLunge","bossGrab","bossDruidErupt","bossHeartPause"})
            near(NativeDruidBlendPolicy.Duration(state,new NativeDruidRigPolicy.Plan{Name=state=="bossDruidErupt"?"burrow_erupt":"any"}),0,"immediate contact guard "+state);
        near(NativeDruidBlendPolicy.Duration("bossRec",new NativeDruidRigPolicy.Plan{Name="fissure_act"}),0,"instant fissure pose not delayed");
        near(NativeDruidBlendPolicy.Duration("bossRec",new NativeDruidRigPolicy.Plan{Name="slam_rec"}),0,"slam impact enters recovery without delaying contact");
        near(NativeDruidBlendPolicy.Duration("bossRec",new NativeDruidRigPolicy.Plan{Name="slash_rec"}),9,"ordinary recovery still crossfades");
        for(int left=45;left>0;left--)
        {
            var data = new DruidData{S="bossDruidUnder",RmMoveId="burrowStrike",St2=left};
            var plan=NativeDruidRigPolicy.Select(data,false);
            near(NativeDruidBlendPolicy.Missing(data.S,plan,true)?1:0,0,"authored underground hold is not Idle fallback");
            near(plan.Frame,50,"underground retains burrow_dive end pose");
            near(data.St2,left,"Core underground duration not changed");
        }
        var held=NativeDruidRigPolicy.Select(new DruidData{S="bossDruidUnder"},false);
        near(NativeDruidBlendPolicy.Missing("bossDruidUnder",held,false)?1:0,1,"missing authored clip still reports missing");
        near(NativeDruidBlendPolicy.Missing("unknown",NativeDruidRigPolicy.Select(null,false),true)?1:0,1,"unknown held fallback remains honest");
    }
}
