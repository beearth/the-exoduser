using System;
using System.Collections.Generic;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
class BotDeathTests
{
    static int checks, failures;
    static void Check(bool ok, string label) { checks++; if (!ok) { failures++; Console.WriteLine("FAIL " + label); } }
    static bool Open(float x, float y, float r) { return true; }
    static int Main()
    {
        var warnings = new List<DruidTelegraph> { new DruidTelegraph { MoveId="slam", Kind=DruidTeleKind.GroundDecal,
            Shape=DruidTeleShape.Circle, X=0, Y=0, Radius=260, Total=58, Remaining=50 } };
        var plan = FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,Open);
        Check(plan.threat && plan.escape, "reacts to slam before low-health condition");
        Check(Math.Sqrt(plan.x*plan.x+plan.y*plan.y)>280, "slam escape leaves warned area");
        Check(!plan.roll, "early warning does not spend a roll immediately");
        Check(warnings[0].Remaining==50 && warnings[0].Radius==260, "snapshot remains read only");
        warnings[0].Remaining=5;
        Check(FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,Open).roll, "imminent warning requests legal roll input");
        Check(!FullRunBossThreatPolicy.Decide(600,0,20,null,true,warnings,Open).threat, "safe player does not retreat forever");
        plan=FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,(x,y,r)=>false);
        Check(plan.threat&&!plan.escape, "blocked endpoints reported without teleport");
        warnings[0]=new DruidTelegraph{MoveId="charge",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Line,X=0,Y=0,Dir=0,Length=880,Width=120,Total=58,Remaining=10};
        plan=FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,Open);
        Check(plan.threat&&plan.escape&&Math.Abs(plan.y)>80,"charge exits its lane sideways");
        warnings[0]=new DruidTelegraph{MoveId="heartbeat",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.ArenaMinusSafe,Total=90,Remaining=10,Safe=new[]{new double[]{0,0,260}},Shadows=null};
        plan=FullRunBossThreatPolicy.Decide(600,0,20,null,true,warnings,Open);
        Check(plan.threat&&plan.escape&&Math.Sqrt(plan.x*plan.x+plan.y*plan.y)<240,"heartbeat moves into safe circle, not farther away");
        Check(!FullRunBossThreatPolicy.Decide(100,0,20,null,true,warnings,Open).threat,"heartbeat safe circle held");
        warnings[0].Shadows=new[]{new double[]{300,0,50}};warnings[0].SrcX=0;warnings[0].SrcY=0;
        Check(!FullRunBossThreatPolicy.Decide(600,0,20,null,true,warnings,Open).threat,"pillar shadow remains safe");
        warnings.Clear();
        var data=new DruidData{X=0,Y=0,R=44,S="bossSpinWind",St2=30,CurMove="spin"};
        plan=FullRunBossThreatPolicy.Decide(210,0,20,data,false,warnings,Open);
        Check(plan.threat&&plan.escape&&plan.source=="legacy-state","legacy spin handled without remodel telegraph API");
        Check(Math.Sqrt(plan.x*plan.x+plan.y*plan.y)>520,"legacy spin retreats beyond conservative range");
        data.S="bossMultiDash";data.St2=8;data.Facing=0;
        plan=FullRunBossThreatPolicy.Decide(210,0,20,data,false,warnings,Open);
        Check(plan.threat&&plan.escape&&plan.roll&&Math.Abs(plan.y)>100,"legacy multidash reacts laterally regardless of current health");
        data.S="recover";
        Check(!FullRunBossThreatPolicy.Decide(210,0,20,data,false,warnings,Open).threat,"recover is not labelled a fatal attack");
        Check(!FullRunBossThreatPolicy.Decide(210,0,20,data,true,warnings,Open).threat,"empty remodel snapshots not invented as visual evidence");
        Console.WriteLine("B2 bot threat tests: checks="+checks+" failures="+failures);
        return failures==0?0:1;
    }
}
