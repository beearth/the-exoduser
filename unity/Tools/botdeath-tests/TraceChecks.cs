using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
static class TraceChecks
{
    internal static void Run(Action<bool,string> check)
    {
        var source = new List<DruidTelegraph> { new DruidTelegraph {MoveId="slam",Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Circle,Total=58,Remaining=7,Radius=260} };
        var warnings = FullRunBossTrace.Warnings(source);
        source[0].Remaining = 0;
        check(warnings.Count==1 && warnings[0].moveId=="slam" && warnings[0].remaining==7,"warning snapshot detached from Core list");
        var trace = new FullRunBossTrace();
        for(int tick=0;tick<125;tick++) trace.Remember(new FullRunBossSnapshot {tick=tick,bossState="bossRec",bossMove="slam",hp=100});
        var dead = new FullRunBossSnapshot {tick=125,bossLife=2,bossLifeKnown=true,druidRemodel=true,x=10,y=20,hp=0,bossState="recover",bossMove="spin",activeTelegraphs=warnings};
        var row=trace.Death(3,2,dead);
        check(row.deathIndex==3&&row.retryIndex==2&&row.tick==125&&row.bossLife==2&&row.bossLifeKnown&&row.druidRemodel,"death identity, actual life and remodel flag");
        check(row.x==10&&row.y==20&&row.hp==0&&row.activeTelegraphs.Count==1,"death location/health/warnings copied read only");
        check(!row.lastHitMoveKnown&&row.lastHitMoveId=="미확인"&&row.bossMoveAtDeath=="spin","current boss move never becomes last-hit attribution");
        check(row.recentTicks.Count==120&&row.recentTicks[0].tick==5&&row.recentTicks[119].tick==124,"recent trace bounded to 120 ticks");
        trace.Clear();
        check(trace.Death(4,3,dead).recentTicks.Count==0,"retry clears previous-life trace");
        check(row.recentTicks.Count==120,"retry does not erase an already recorded death");
        var args=FullRunBossTrace.RenderArguments(new[]{"game","--boss-render=rigpixel","--hero-render","rigpixel","--remodel3d","--unity-druid-remodel","-output","private-path"});
        check(Array.IndexOf(args,"--boss-render=rigpixel")>=0&&Array.IndexOf(args,"--hero-render=rigpixel")>=0&&Array.IndexOf(args,"--remodel3d")>=0,"render arguments captured in equal and separate forms");
        check(Array.IndexOf(args,"private-path")<0,"unrelated arguments omitted");
        var directory=Path.Combine(AppContext.BaseDirectory,"trace-fixture");
        Directory.CreateDirectory(directory);
        var file=Path.Combine(directory,"boss-deaths.jsonl");
        try
        {
            var json=JsonSerializer.Serialize(row,new JsonSerializerOptions{IncludeFields=true});
            FullRunBossTrace.Append(file,json);FullRunBossTrace.Append(file,json);
            check(File.Exists(file),"death JSONL written immediately");
            if(File.Exists(file))
            {
                var lines=File.ReadAllLines(file);check(lines.Length==2,"one JSON object per death line");
                using(var parsed=JsonDocument.Parse(lines[0]))check(parsed.RootElement.GetProperty("lastHitMoveId").GetString()=="미확인"&&parsed.RootElement.GetProperty("tick").GetInt32()==125,"JSON preserves unknown attribution and death tick");
            }
        }
        finally { Directory.Delete(directory,true); }
    }
}
