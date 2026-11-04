using System;
using System.IO;
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
        // Core DruidBoss.Remodel.cs:95 hits only at distance > HeartbeatSafeOf(d).
        // Its closed boss-centre boundary is retained; the bot adds radius20 + margin1.
        Check(plan.threat&&plan.escape&&Math.Sqrt(plan.x*plan.x+plan.y*plan.y)<=239,"heartbeat goal keeps player radius plus one pixel inside Core safe boundary");
        Check(File.ReadAllText("unity/Assets/Exoduser/Runtime/Core/DruidBoss.Remodel.cs").Contains("Dst(host.PX, host.PY, d.X, d.Y) > HeartbeatSafeOf(d)"),"heartbeat contract matches owning Core comparison");
        Check(!FullRunBossThreatPolicy.Decide(239,0,20,null,true,warnings,Open).threat,"closed bot inset boundary is safe");
        Check(FullRunBossThreatPolicy.Decide(239.01,0,20,null,true,warnings,Open).threat,"outside inset boundary triggers proactive movement");
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
        warnings.Add(new DruidTelegraph{MoveId="slashCombo",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Cone,Radius=300,Angle=1.2,Dir=0,Remaining=20});
        Check(FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,Open).escape,"slash cone produces a safe escape");
        Check(!FullRunBossThreatPolicy.Decide(0,300,20,null,true,warnings,Open).threat,"outside slash cone stays safe");
        warnings[0]=new DruidTelegraph{MoveId="grab",Kind=DruidTeleKind.GrabEyes,Shape=DruidTeleShape.None,Radius=500,Dir=0,Remaining=8};
        Check(FullRunBossThreatPolicy.Decide(210,0,20,null,true,warnings,Open).escape,"grab-eye warning triggers movement");
        Check(!FullRunBossThreatPolicy.Decide(-210,0,20,null,true,warnings,Open).threat,"behind grab direction stays safe");
        warnings[0]=new DruidTelegraph{MoveId="groundFissure",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Line,Width=140,Length=900,Progress=100,Live=true};
        Check(FullRunBossThreatPolicy.Decide(100,0,20,null,true,warnings,Open).escape,"live fissure head avoided");
        Check(!FullRunBossThreatPolicy.Decide(0,0,20,null,true,warnings,Open).threat,"spent fissure tail is not treated as the head");
        warnings[0]=new DruidTelegraph{MoveId="burrowStrike",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Circle,Radius=200,Remaining=34};
        Check(FullRunBossThreatPolicy.Decide(0,0,20,null,true,warnings,Open).escape,"burrow eruption warning escaped");
        warnings[0].Remaining=0;
        Check(!FullRunBossThreatPolicy.Decide(0,0,20,null,true,warnings,Open).threat,"expired warning is not replayed");
        warnings[0]=new DruidTelegraph{MoveId="tideWave",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.RingGap,Radius=300,Inner=250,Width=50,GapDir=0,GapAngle=1.2,Remaining=10};
        Check(!FullRunBossThreatPolicy.Decide(300,0,20,null,true,warnings,Open).threat,"ring gap stays open");
        Check(FullRunBossThreatPolicy.Decide(-300,0,20,null,true,warnings,Open).escape,"damaging ring side escaped");
        warnings[0]=new DruidTelegraph{MoveId="heartbeat",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.ArenaMinusSafe,Remaining=10,Safe=new[]{new double[]{0,0,260},new double[]{600,0,100}}};
        // Core InSafeZone uses strict < for extra circles; inset remains on its safe side.
        Check(!FullRunBossThreatPolicy.Decide(259,0,0,null,true,warnings,Open).threat,"zero-radius caller still keeps one pixel of boss-circle margin");
        Check(FullRunBossThreatPolicy.Decide(259.01,0,0,null,true,warnings,Open).threat,"boss-circle inset matches closed comparison");
        Check(!FullRunBossThreatPolicy.Decide(698.99,0,0,null,true,warnings,Open).threat,"extra safe circle strict inset interior");
        Check(FullRunBossThreatPolicy.Decide(699,0,0,null,true,warnings,Open).threat,"extra safe circle strict inset boundary");
        TraceChecks.Run(Check);
        Console.WriteLine("B2R bot threat/trace tests: checks="+checks+" failures="+failures);
        return failures==0?0:1;
    }
}
