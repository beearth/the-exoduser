// RM-B1 (RB1-1 / RB1-2) check: the remodelled 1-1 druid driven through the real Simulation (EnemyAi on, arena entered through StageFlow) by a scripted player.
// usage: DruidRemodelTests.dll <out-dir>      writes remodel-fight-A.json (root cut) / remodel-fight-B.json (root not hit) / remodel-report.md ; exit 1 when a check fails
// RM-B0: FrameworkChecks.cs (test-only si1 / si2 sets through the same Simulation) runs after the druid checks and is counted on its own line
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

static partial class P
{
    static int checks, bad; static readonly List<string> failures = new List<string>();
    static void Check(bool ok, string what) { checks++; if (!ok) { bad++; failures.Add(what); Console.WriteLine("FAIL " + what); } }

    sealed class Run
    {
        public string Name; public bool RootHit; public int BaseHp, ArenaTick, FightTicks, ExitOpenTick = -1, FinalTick = -1, RootHitsLanded;
        public List<DruidRemodelEvent> Events; public List<MoveLogEntry> Moves; public int[] MaxHp = new int[3]; public double[] Radius = new double[3]; public double[] Shield = new double[3], ShieldMax = new double[3];
        public int PlayerHits; public bool SinkSet, BossDead, BossAliveFlag, ExitsOpen; public string Error;
        public int MaxMinionsAlive, HeartbeatPulses;
    }

    static Run Fight(string name, bool rootHit, uint seed)
    {
        var r = new Run { Name = name, RootHit = rootHit };
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        s.DruidRemodel = true; s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp;
        s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        var p = s.Player; EnemyState boss = null; int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
        boss = s.Stage.Boss; if (boss == null) { r.Error = "boss did not spawn"; return r; }
        r.ArenaTick = s.TickCount; r.BaseHp = boss.MaxHp;
        int hitCd = 0, rootLeft = rootHit ? 3 : 0, killGuard = 0, lastLife = 0, hurt0 = s.HurtCount, collapseTick = -1;
        var tele = new TeleTrack();
        r.MaxHp[0] = boss.MaxHp; r.Radius[0] = boss.Radius; r.Shield[0] = boss.Shield; r.ShieldMax[0] = boss.MaxShield;
        int dmg = Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.012));
        // the intro stun / revive-iframes of StageFlow (90 / 110 f) run out first
        for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }
        while (boss.Alive && killGuard++ < 40000)
        {
            p.Hp = p.MaxHp;
            var st = s.DruidLife(boss);
            // stay ~110 px from the boss on the side he is facing away from the arena wall (arena centre pull keeps the player out of the corners)
            if (st == null || !st.Collapsing)
            {
                double ang = Math.Atan2(boss.Y - 800, boss.X - 800) + 0.9; p.X = (float)(boss.X + Math.Cos(ang) * 110); p.Y = (float)(boss.Y + Math.Sin(ang) * 110);
                if (!s.CanMove((float)p.X, (float)p.Y, p.Radius)) { p.X = boss.X + 110; p.Y = boss.Y; }
            }
            if (st != null && st.Collapsing)
            {
                if (collapseTick < 0) collapseTick = s.TickCount;
                // root hits come on ticks 10 / 25 / 40 of the kneel
                int into = s.TickCount - collapseTick;
                if (rootLeft > 0 && (into == 10 || into == 25 || into == 40)) { s.HurtEnemy(boss, dmg); rootLeft--; r.RootHitsLanded++; }
                if (st.Collapsing && boss.Hp != 1) Check(false, name + ": boss HP changed while kneeling " + boss.Hp);
            }
            else
            {
                collapseTick = -1;
                if (hitCd-- <= 0) { s.HurtEnemy(boss, dmg); hitCd = 30; }
                if (rootHit && st != null && st.Life != lastLife) rootLeft = 3;
            }
            if (st != null && st.Life != lastLife)
            {
                lastLife = st.Life; if (st.Life < 3) { r.MaxHp[st.Life] = boss.MaxHp; r.Radius[st.Life] = boss.Radius; r.Shield[st.Life] = boss.Shield; r.ShieldMax[st.Life] = boss.MaxShield; dmg = Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.012)); }
            }
            s.Tick(0, 0, boss.X, boss.Y, false, false);
            ObserveTelegraphs(name, s, boss, tele);
            if (s.Druid != null) { int alive = 0; foreach (var d in s.Druid.Data.Values) foreach (var m in d.Minions) if (m.Alive) alive++; r.MaxMinionsAlive = Math.Max(r.MaxMinionsAlive, alive); }
        }
        r.FightTicks = s.TickCount - r.ArenaTick; r.FinalTick = s.TickCount; r.PlayerHits = s.HurtCount - hurt0;
        r.BossDead = !boss.Alive; r.SinkSet = boss.SinkDruid;
        int open = 0; while (s.Stage.Exits.Count == 0 && open++ < 600) { p.Hp = p.MaxHp; p.Iframes = 600; s.Tick(0, 0, p.X + 100, p.Y, false, false); }
        r.ExitOpenTick = s.Stage.Exits.Count > 0 ? s.TickCount : -1; r.ExitsOpen = s.Stage.Exits.Count > 0; r.BossAliveFlag = s.Stage.BossAlive;
        r.Events = new List<DruidRemodelEvent>(s.DruidRemodelLog); r.Moves = new List<MoveLogEntry>(s.Druid.MoveLog);
        return r;
    }

    static string J(string s) { return "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\""; }
    static string D(double v) { return v.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture); }

    static string ToJson(Run r)
    {
        var sb = new StringBuilder();
        sb.Append("{\n  \"scenario\": ").Append(J(r.Name)).Append(",\n  \"rootHit\": ").Append(r.RootHit ? "true" : "false");
        sb.Append(",\n  \"baseHp\": ").Append(r.BaseHp).Append(",\n  \"arenaEnteredTick\": ").Append(r.ArenaTick).Append(",\n  \"fightTicks\": ").Append(r.FightTicks).Append(",\n  \"finalTick\": ").Append(r.FinalTick).Append(",\n  \"exitOpenedTick\": ").Append(r.ExitOpenTick);
        sb.Append(",\n  \"bossDead\": ").Append(r.BossDead ? "true" : "false").Append(",\n  \"sinkDruid\": ").Append(r.SinkSet ? "true" : "false").Append(",\n  \"stageBossAlive\": ").Append(r.BossAliveFlag ? "true" : "false").Append(",\n  \"exitsOpen\": ").Append(r.ExitsOpen ? "true" : "false");
        sb.Append(",\n  \"rootHitsLanded\": ").Append(r.RootHitsLanded).Append(",\n  \"playerHurtCount\": ").Append(r.PlayerHits).Append(",\n  \"maxMinionsAlive\": ").Append(r.MaxMinionsAlive);
        sb.Append(",\n  \"lives\": [");
        for (int i = 0; i < 3; i++) sb.Append(i > 0 ? ", " : "").Append("{\"life\": ").Append(i + 1).Append(", \"maxHp\": ").Append(r.MaxHp[i]).Append(", \"hpFractionOfBase\": ").Append(D((double)r.MaxHp[i] / r.BaseHp)).Append(", \"radius\": ").Append(D(r.Radius[i])).Append(", \"shield\": ").Append(D(r.Shield[i])).Append(", \"shieldFractionOfLifeHp\": ").Append(D(r.MaxHp[i] > 0 ? r.ShieldMax[i] / r.MaxHp[i] : 0)).Append("}");
        sb.Append("],\n  \"events\": [\n");
        for (int i = 0; i < r.Events.Count; i++) { var e = r.Events[i]; sb.Append("    {\"tick\": ").Append(e.Tick).Append(", \"kind\": ").Append(J(e.Kind)).Append(", \"life\": ").Append(e.Life + 1).Append(", \"hp\": ").Append(D(e.Hp)).Append(", \"maxHp\": ").Append(D(e.MaxHp)).Append(", \"shield\": ").Append(D(e.Shield)).Append(", \"radius\": ").Append(D(e.Radius)).Append(", \"note\": ").Append(J(e.Note ?? "")).Append("}").Append(i + 1 < r.Events.Count ? ",\n" : "\n"); }
        sb.Append("  ],\n  \"movesByLife\": {\n");
        for (int ph = 0; ph < 3; ph++)
        {
            var g = r.Moves.Where(m => m.Phase == ph).GroupBy(m => m.Move).OrderBy(x => x.Key).ToList();
            sb.Append("    \"P").Append(ph + 1).Append("\": {");
            sb.Append(string.Join(", ", g.Select(x => J(x.Key) + ": " + x.Count()))).Append("}").Append(ph < 2 ? ",\n" : "\n");
        }
        sb.Append("  },\n  \"heartbeatTicks\": [").Append(string.Join(", ", r.Moves.Where(m => m.Move == "heartbeat").Select(m => m.Tick.ToString()))).Append("],\n  \"moveLog\": [");
        sb.Append(string.Join(", ", r.Moves.Select(m => "[" + m.Tick + "," + (m.Phase + 1) + "," + J(m.Move) + "]")));
        sb.Append("]\n}\n");
        return sb.ToString();
    }

    static readonly string[][] AllowedByLife = {
        new[] { "slashCombo", "slam", "charge", "groundFissure", "fan", "grab" },
        new[] { "slashCombo", "slam", "charge", "groundFissure", "fan", "grab", "burrowStrike", "chaseAoe", "summon" },
        new[] { "slashCombo", "slam", "charge", "groundFissure", "grab", "burrowStrike", "chaseAoe", "tideWave", "seekerMines", "heartbeat" },
    };

    static void Verify(Run r)
    {
        string n = r.Name;
        Check(r.Error == null, n + ": " + r.Error);
        if (r.Error != null) return;
        Check(r.BossDead && r.SinkSet, n + ": boss dead with the sink flag");
        Check(!r.BossAliveFlag && r.ExitsOpen, n + ": stage boss flag cleared and exit opened");
        int collapses = r.Events.Count(e => e.Kind == "collapse"), lifeEvents = r.Events.Count(e => e.Kind == "life"), finals = r.Events.Count(e => e.Kind == "final");
        Check(collapses == 2 && lifeEvents == 2 && finals == 1, n + ": 2 collapses, 2 new lives, 1 final (" + collapses + "/" + lifeEvents + "/" + finals + ")");
        double[] frac = r.RootHit ? new[] { 1.0, 0.5, 0.4 } : new[] { 1.0, 0.6, 0.4 };
        double[] body = { 1.0, 0.85, 0.70 }, shield = { 0, 0.15, 0.15 };
        for (int i = 0; i < 3; i++)
        {
            Check(Math.Abs(r.MaxHp[i] - Math.Round(r.BaseHp * frac[i])) <= 1, n + ": life " + (i + 1) + " HP " + r.MaxHp[i] + " vs " + Math.Round(r.BaseHp * frac[i]));
            Check(Math.Abs(r.Radius[i] - Math.Round(r.Radius[0] * body[i])) <= 1, n + ": life " + (i + 1) + " radius " + r.Radius[i]);
            Check(Math.Abs(r.ShieldMax[i] - Math.Round(r.MaxHp[i] * shield[i])) <= 1 && Math.Abs(r.Shield[i] - r.ShieldMax[i]) < 1e-3, n + ": life " + (i + 1) + " shield " + r.Shield[i] + "/" + r.ShieldMax[i]);
        }
        // kneel = exactly 120 ticks between the collapse and the new life event
        var ev = r.Events;
        for (int i = 0; i + 1 < ev.Count; i++) if (ev[i].Kind == "collapse") { int j = ev.FindIndex(i + 1, e => e.Kind == "life"); Check(j > 0 && ev[j].Tick - ev[i].Tick == DruidRemodelData.CollapseTicks, n + ": kneel length " + (j > 0 ? ev[j].Tick - ev[i].Tick : -1)); }
        Check(ev.Count(e => e.Kind == "rootCut") == (r.RootHit ? 1 : 0), n + ": rootCut events " + ev.Count(e => e.Kind == "rootCut"));
        Check(ev.Count(e => e.Kind == "rootCutIgnored") == (r.RootHit ? 1 : 0), n + ": second cut ignored (once per fight)");
        // no move outside the 12 and none outside its life
        for (int ph = 0; ph < 3; ph++) foreach (var m in r.Moves.Where(x => x.Phase == ph)) Check(AllowedByLife[ph].Contains(m.Move), n + ": move " + m.Move + " in life " + (ph + 1));
        // no move started while kneeling
        foreach (var c in ev.Where(e => e.Kind == "collapse")) { var l = ev.First(e => e.Kind == "life" && e.Tick > c.Tick); Check(!r.Moves.Any(m => m.Tick > c.Tick && m.Tick < l.Tick), n + ": a move started during the kneel at " + c.Tick); }
        Check(r.MaxMinionsAlive <= DruidRemodelData.SummonMax, n + ": minions alive " + r.MaxMinionsAlive);
        // heartbeat: once at P3 entry, then one start per 40 s of real time (the cooldown must not wait for idle ticks)
        var l3 = ev.First(e => e.Kind == "life" && e.Life == 2); int p3 = ev.First(e => e.Kind == "final").Tick - l3.Tick;
        var hb = r.Moves.Where(m => m.Move == "heartbeat").Select(m => m.Tick).ToList();
        Check(hb.Count >= 1 + Math.Max(0, (p3 - 600) / DruidRemodelData.HeartbeatCooldownTicks) && hb.Count <= 1 + p3 / DruidRemodelData.HeartbeatCooldownTicks, n + ": heartbeats " + hb.Count + " in a " + p3 + "-tick P3");
        for (int i = 1; i < hb.Count; i++) Check(hb[i] - hb[i - 1] >= DruidRemodelData.HeartbeatCooldownTicks && hb[i] - hb[i - 1] <= DruidRemodelData.HeartbeatCooldownTicks + 600, n + ": heartbeat gap " + (hb[i] - hb[i - 1]));
    }

    static int Main(string[] args)
    {
        string dir = args.Length > 0 ? args[0] : "remodel-out"; Directory.CreateDirectory(dir);
        var a = Fight("A-root-cut", true, 20261027u); var b = Fight("B-root-not-hit", false, 20261028u);
        Verify(a); Verify(b); VerifyTelegraphs(); ParryGuard();
        int druidChecks = checks, druidBad = bad;
        FrameworkChecks();
        int fwChecks = checks - druidChecks, fwBad = bad - druidBad;
        File.WriteAllText(Path.Combine(dir, "remodel-telegraphs.json"), TelegraphJson(), new UTF8Encoding(false));
        File.WriteAllText(Path.Combine(dir, "remodel-fight-A.json"), ToJson(a), new UTF8Encoding(false));
        File.WriteAllText(Path.Combine(dir, "remodel-fight-B.json"), ToJson(b), new UTF8Encoding(false));
        var sb = new StringBuilder("# RM-B1 RB1-1/2 fight check\n\nchecks " + druidChecks + ", failed " + druidBad + "\n\n# RM-B0 remake frame check\n\nchecks " + fwChecks + ", failed " + fwBad + "\n\n" + fwSummary);
        foreach (var f in failures) sb.Append("- FAIL ").Append(f).Append('\n');
        File.WriteAllText(Path.Combine(dir, "remodel-report.md"), sb.ToString(), new UTF8Encoding(false));
        Console.WriteLine("druid-remodel: " + druidChecks + " checks, " + druidBad + " failed");
        Console.WriteLine("remodel-frame: " + fwChecks + " checks, " + fwBad + " failed");
        return bad == 0 ? 0 : 1;
    }
}
