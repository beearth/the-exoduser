// RM-B0 remake frame check (docs/engine/UNITY_BOSS_RM0_REMODEL_FRAMEWORK_20261028.md §5). TEST-ONLY sets: nothing here is game data (BossRemodelSets is untouched);
// the sets are put into one Simulation's RemodelSets before AttachDruidBoss.
//   A  si1 "sampleSi1": 3 shared executors (slashCombo / charge / slam), 2 lives, per-boss flag -> spawn, kneel, life 2, kill, exit; life hooks; telegraph numbers
//   B  si2 "sampleSi2": a move of its own (sampleRing: StartMove / TickState / Telegraphs / ForcePick hooks in a partial DruidBoss below) + charge, 1 life, common flag
//   off: si1 / si2 with the set registered but the flag off keep BossCoreMissing; DruidRemodel alone turns on the druid set only
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Core
{
    // what a boss's own file looks like (here: the test-only "sampleRing" move). Static hooks inside the partial class reach the private helpers.
    public sealed partial class DruidBoss
    {
        public const double SampleRingRadius = 220;
        public static int SampleRingStarts, SampleRingFires, SampleRingForced;

        internal static bool SampleStart(DruidBoss b, EnemyState e, DruidData d, BossMove mv, double dist, int phase, int tele)
        {
            if (mv.Id != "sampleRing") return false;   // charge: the shared executor
            SampleRingStarts++;
            d.S = "rmSampleRingWind"; d.St2 = Or(tele, 40); b.host.Text(d.X, d.Y - 30, "◎", "#dfd6c2", 40);
            return true;
        }

        internal static bool SampleTick(DruidBoss b, EnemyState e, DruidData d, double dist)
        {
            if (d.S != "rmSampleRingWind") return false;
            if (d.St2 > 0) return true;
            SampleRingFires++;
            if (b.host.PlayerAlive && b.host.PIframes <= 0 && Dst(b.host.PX, b.host.PY, d.X, d.Y) < SampleRingRadius + b.host.PRadius) b.PlayerHit(e, d, 1.0, 6, true);
            d.S = "bossRec"; d.St2 = 30;
            return true;
        }

        internal static void SampleTele(DruidBoss b, DruidData d, List<DruidTelegraph> into)
        {
            if (d.S != "rmSampleRingWind") return;
            var t = b.Tele(into, "sampleRing", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, d.RmTeleTotal, d.St2, 0);
            t.X = d.X; t.Y = d.Y; t.Radius = SampleRingRadius;
        }

        // forced at the fight start once (the way the druid forces his heartbeat), then only through the score table
        internal static bool SamplePick(DruidBoss b, EnemyState e, DruidData d, double dist)
        {
            if (SampleRingForced > 0) return false;
            SampleRingForced++;
            return b.RmStartForced(e, d, "sampleRing", dist);
        }
    }
}

static partial class P
{
    static readonly int[] L0 = { 0 }, L01 = { 0, 1 }, L1 = { 1 };
    static int hkAttach, hkCollapse, hkLife, hkFinal, hkKneelTicks;

    static BossRemodelSet SampleSi1()
    {
        var s = new BossRemodelSet {
            Id = "sampleSi1", Lives = 2, LifeHpFraction = new[] { 1.0, 0.5 }, BodyScale = new[] { 1.0, 0.8 }, ShieldFraction = new[] { 0, 0.1 }, CollapseTicks = 90,
            Moves = new[] {
                BossRemodelSet.Move("slashCombo", 13, 20, 40, 90, false, 0, 100, L01, "melee", "multi-hit"),
                BossRemodelSet.Move("charge", 2, 40, 40, 100, true, 40, 400, L01, "gap-close", "melee"),
                BossRemodelSet.Move("slam", 14, 35, 40, 140, false, 0, 140, L1, "melee", "aoe"),
            },
            Combos = new[] { BossRemodelSet.Combo(L01, "charge", "slashCombo"), BossRemodelSet.Combo(L1, "slashCombo", "slam") },
            Phases = new[] { BossRemodelSet.PhaseDef("P1", 1.0, 1.0, .30, 0), BossRemodelSet.PhaseDef("P2", 1.15, .8, .5, .1) },
            Parryable = new HashSet<string> { "slashCombo", "charge", "slam" }, SlamRadius = 160 };
        s.Hooks.OnAttach = (sim, e, st) => hkAttach++;
        s.Hooks.OnCollapse = (sim, e, st) => hkCollapse++;
        s.Hooks.CollapseTick = (sim, e, st) => hkKneelTicks++;
        s.Hooks.OnLife = (sim, e, st) => hkLife++;
        s.Hooks.OnFinal = (sim, e, st) => hkFinal++;
        return s;
    }

    static BossRemodelSet SampleSi2()
    {
        var s = new BossRemodelSet {
            Id = "sampleSi2", Lives = 1, CollapseTicks = 60,
            Moves = new[] {
                BossRemodelSet.Move("sampleRing", 40, 40, 30, 150, false, 0, 999, L0, "aoe"),
                BossRemodelSet.Move("charge", 2, 40, 40, 100, false, 40, 400, L0, "gap-close", "melee"),
            },
            Phases = new[] { BossRemodelSet.PhaseDef("P1", 1.0, 1.0, 0, 0) }, Parryable = new HashSet<string> { "charge" } };
        s.Hooks.StartMove = DruidBoss.SampleStart; s.Hooks.TickState = DruidBoss.SampleTick; s.Hooks.Telegraphs = DruidBoss.SampleTele; s.Hooks.ForcePick = DruidBoss.SamplePick;
        return s;
    }

    sealed class FwRun
    {
        public string Name, Error; public int BaseHp, ArenaTick, MaxMinions; public bool BossDead, Sink, ExitsOpen, BossAliveFlag, SetOn, Spawned;
        public int[] MaxHp = new int[2]; public double[] Radius = new double[2], ShieldMax = new double[2]; public int Etype;
        public List<DruidRemodelEvent> Events = new List<DruidRemodelEvent>(); public List<MoveLogEntry> Moves = new List<MoveLogEntry>();
        public readonly HashSet<string> TeleBad = new HashSet<string>(); public readonly HashSet<int> TeleMoves = new HashSet<int>(); public int TeleSeen;
    }

    static Simulation FwSim(int si, uint seed, Action<Simulation> flags, BossRemodelSet extra)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = si, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        if (extra != null) s.RemodelSets[si] = extra;
        flags(s); s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp;
        s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        return s;
    }

    static FwRun FwFight(string name, int si, uint seed, Action<Simulation> flags, BossRemodelSet set, int lives)
    {
        var r = new FwRun { Name = name };
        var s = FwSim(si, seed, flags, set); var p = s.Player; int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
        var boss = s.Stage.Boss; if (boss == null) { r.Error = "boss did not spawn"; return r; }
        r.Spawned = true; r.SetOn = s.ActiveRemodelSet == set && s.Druid.Remodel; r.Etype = boss.Etype;
        r.ArenaTick = s.TickCount; r.BaseHp = boss.MaxHp; r.MaxHp[0] = boss.MaxHp; r.Radius[0] = boss.Radius; r.ShieldMax[0] = boss.MaxShield;
        int dmg = Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.015)), hitCd = 0, lastLife = 0, killGuard = 0, collapseTick = -1;
        var tele = new List<DruidTelegraph>();
        for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }
        while (boss.Alive && killGuard++ < 40000)
        {
            p.Hp = p.MaxHp;
            var st = s.DruidLife(boss);
            if (st == null || !st.Collapsing)
            {
                collapseTick = -1;
                double ang = Math.Atan2(boss.Y - 800, boss.X - 800) + 0.9; p.X = (float)(boss.X + Math.Cos(ang) * 110); p.Y = (float)(boss.Y + Math.Sin(ang) * 110);
                if (!s.CanMove((float)p.X, (float)p.Y, p.Radius)) { p.X = boss.X + 110; p.Y = boss.Y; }
                if (hitCd-- <= 0) { s.HurtEnemy(boss, dmg); hitCd = 30; }
            }
            else
            {   // hits during the kneel are swallowed; with RootBonus off they must not count as root hits
                if (collapseTick < 0) collapseTick = s.TickCount;
                int into = s.TickCount - collapseTick; if (into == 10 || into == 25 || into == 40) s.HurtEnemy(boss, dmg);
                if (boss.Hp != 1) Check(false, name + ": boss HP changed while kneeling " + boss.Hp);
            }
            if (st != null && st.Life != lastLife)
            {
                lastLife = st.Life; if (st.Life < 2) { r.MaxHp[st.Life] = boss.MaxHp; r.Radius[st.Life] = boss.Radius; r.ShieldMax[st.Life] = boss.MaxShield; }
                dmg = Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.015));
            }
            s.Tick(0, 0, boss.X, boss.Y, false, false);
            s.RemodelTelegraphs(tele);
            foreach (var t in tele)
            {
                r.TeleSeen++; r.TeleMoves.Add(t.Move);
                if (t.Move < 1 || t.Move > set.Moves.Length || set.Moves[t.Move - 1].Id != t.MoveId) r.TeleBad.Add(t.Move + "/" + t.MoveId);
            }
        }
        r.BossDead = !boss.Alive; r.Sink = boss.SinkDruid;
        int open = 0; while (s.Stage.Exits.Count == 0 && open++ < 600) { p.Hp = p.MaxHp; p.Iframes = 600; s.Tick(0, 0, p.X + 100, p.Y, false, false); }
        r.ExitsOpen = s.Stage.Exits.Count > 0; r.BossAliveFlag = s.Stage.BossAlive;
        r.Events = new List<DruidRemodelEvent>(s.DruidRemodelLog); r.Moves = new List<MoveLogEntry>(s.Druid.MoveLog);
        return r;
    }

    static void FwVerifyCommon(FwRun r, BossRemodelSet set, int lives)
    {
        string n = r.Name;
        Check(r.Error == null, n + ": " + r.Error); if (r.Error != null) return;
        Check(r.SetOn, n + ": the stage runs the test set");
        Check(r.BossDead && !r.Sink, n + ": boss dead through the common kill, no druid sink");
        Check(!r.BossAliveFlag && r.ExitsOpen, n + ": stage boss flag cleared and exit opened");
        int col = r.Events.Count(e => e.Kind == "collapse"), life = r.Events.Count(e => e.Kind == "life"), fin = r.Events.Count(e => e.Kind == "final");
        Check(col == lives - 1 && life == lives - 1 && fin == 1, n + ": collapse/life/final " + col + "/" + life + "/" + fin);
        Check(r.Events.Count(e => e.Kind == "rootCut" || e.Kind == "rootCutIgnored") == 0, n + ": no root bonus outside the druid set");
        Check(r.Events.Where(e => e.Kind == "final").All(e => e.Note == "kill"), n + ": final note = kill");
        for (int i = 0; i + 1 < r.Events.Count; i++) if (r.Events[i].Kind == "collapse") { int j = r.Events.FindIndex(i + 1, e => e.Kind == "life"); Check(j > 0 && r.Events[j].Tick - r.Events[i].Tick == set.CollapseTicks, n + ": kneel length"); }
        var ids = new HashSet<string>(set.Moves.Select(m => m.Id));
        foreach (var m in r.Moves) Check(ids.Contains(m.Move) && set.Moves.First(x => x.Id == m.Move).InPhase(m.Phase), n + ": move " + m.Move + " in life " + (m.Phase + 1));
        Check(r.TeleBad.Count == 0, n + ": telegraph move numbers follow the set (" + string.Join(",", r.TeleBad) + ")");
        Check(r.TeleSeen > 0, n + ": telegraph list carried entries");
    }

    static void FrameworkChecks()
    {
        // the game data registry: druid only (no test set leaks in), every set valid
        var reg = BossRemodelSets.Build();
        Check(reg.Count == 2 && reg[0] == DruidRemodelData.Set && reg[3] == DruidRemodelData.Set && !reg.ContainsKey(1) && !reg.ContainsKey(2), "registry = druid at si0 / si3 only");
        Check(DruidRemodelData.Set.Validate() == null && SampleSi1().Validate() == null && SampleSi2().Validate() == null, "sets validate");
        var bad = SampleSi2(); bad.Hooks.StartMove = null; Check(bad.Validate() != null, "a custom move without hooks is rejected");
        var bad2 = SampleSi1(); bad2.Moves[1].Idx = 13; Check(bad2.Validate() != null, "a cooldown slot used twice is rejected");
        var d = DruidRemodelData.Set;
        Check(d.Moves == DruidRemodelData.Moves && d.Combos == DruidRemodelData.Combos && d.Phases == DruidRemodelData.Phases && d.Lives == 3 && d.Heartbeat && d.GrabAbsorb && d.RootBonus && d.Sink, "druid set = the RM-B1 tables and rules");
        for (int i = 0; i < 12; i++) Check(d.MoveNo(DruidRemodelData.Moves[i].Id) == i + 1, "druid move number " + (i + 1));

        // flags off: si1 / si2 keep BossCoreMissing even with a set registered; DruidRemodel alone does not switch a non-druid set on
        foreach (int si in new[] { 1, 2 })
        {
            var s = FwSim(si, 7u + (uint)si, x => { }, si == 1 ? SampleSi1() : SampleSi2());
            var p = s.Player; for (int i = 0; i < 300; i++) s.Tick(0, 0, p.X + 100, p.Y, false, false);
            // (the BossCoreMissing text itself is throttled to TickCount % 45 inside the 30-tick heavy check, so it may never coincide: the state is what is checked)
            Check(!s.Stage.BossSpawners.ContainsKey(si) && s.Stage.LoadPhase == 0 && !s.Stage.InArena && s.Stage.Boss == null && s.Stage.BossAlive && s.ActiveRemodelSet == null
                && !s.Stage.Events.Any(e => e.Kind == StageEventKind.ArenaLoadStart), "off si" + si + ": no spawner, the exit does not load an arena");
            var s2 = FwSim(si, 9u, x => x.DruidRemodel = true, si == 1 ? SampleSi1() : SampleSi2());
            Check(!s2.Stage.BossSpawners.ContainsKey(si) && s2.RemodelSetFor(si) == null && s2.RemodelSetFor(0) == DruidRemodelData.Set && s2.RemodelSetFor(3) == DruidRemodelData.Set, "DruidRemodel only: si" + si + " stays off, druid si0 / si3 on");
        }

        hkAttach = hkCollapse = hkLife = hkFinal = hkKneelTicks = 0;
        var setA = SampleSi1();
        var a = FwFight("FW-A-si1", 1, 20261028u, x => x.RemodelBosses.Add("sampleSi1"), setA, 2);
        FwVerifyCommon(a, setA, 2);
        if (a.Error == null)
        {
            Check(Math.Abs(a.MaxHp[1] - Math.Round(a.BaseHp * 0.5)) <= 1, "FW-A: life 2 HP " + a.MaxHp[1] + " vs " + Math.Round(a.BaseHp * 0.5));
            Check(Math.Abs(a.Radius[1] - Math.Round(a.Radius[0] * 0.8)) <= 1, "FW-A: life 2 body " + a.Radius[1]);
            Check(Math.Abs(a.ShieldMax[1] - Math.Round(a.MaxHp[1] * 0.1)) <= 1 && a.ShieldMax[0] == 0, "FW-A: shields " + a.ShieldMax[0] + "/" + a.ShieldMax[1]);
            Check(hkAttach == 1 && hkCollapse == 1 && hkLife == 1 && hkFinal == 1, "FW-A: life hooks " + hkAttach + "/" + hkCollapse + "/" + hkLife + "/" + hkFinal);
            Check(hkKneelTicks == setA.CollapseTicks, "FW-A: CollapseTick hook ran " + hkKneelTicks + " kneel ticks");
            foreach (var id in new[] { "slashCombo", "charge", "slam" }) Check(a.Moves.Any(m => m.Move == id), "FW-A: move " + id + " was used");
            Check(!a.Moves.Any(m => m.Move == "slam" && m.Phase == 0), "FW-A: slam only in life 2");
        }

        DruidBoss.SampleRingStarts = DruidBoss.SampleRingFires = DruidBoss.SampleRingForced = 0;
        var setB = SampleSi2();
        var b = FwFight("FW-B-si2", 2, 20261029u, x => x.BossRemodel = true, setB, 1);
        FwVerifyCommon(b, setB, 1);
        if (b.Error == null)
        {
            Check(DruidBoss.SampleRingForced == 1 && b.Moves.Count > 0 && b.Moves[0].Move == "sampleRing", "FW-B: forced pick started the fight");
            Check(DruidBoss.SampleRingStarts >= 2 && DruidBoss.SampleRingFires >= 2 && DruidBoss.SampleRingFires >= DruidBoss.SampleRingStarts - 1, "FW-B: own move started " + DruidBoss.SampleRingStarts + " / fired " + DruidBoss.SampleRingFires);
            Check(b.TeleMoves.Contains(1), "FW-B: own telegraph (move 1 = sampleRing) emitted");
        }
        fwSummary = "FW-A si1: lives 2, fight " + (a.Moves.Count) + " moves, events " + string.Join(" ", a.Events.Select(e => e.Kind + "@" + e.Tick)) + "\n"
            + "FW-B si2: moves " + b.Moves.Count + ", ring starts " + DruidBoss.SampleRingStarts + ", fires " + DruidBoss.SampleRingFires + ", events " + string.Join(" ", b.Events.Select(e => e.Kind + "@" + e.Tick)) + "\n";
    }
    static string fwSummary = "";
}
