using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B0: the common frame of the boss remakes. SSOT = docs/engine/UNITY_BOSS_RM0_REMODEL_FRAMEWORK_20261028.md.
    // A remake = one BossRemodelSet (data: lives, move table, combos, phases) + the boss's own rules in its own partial files (hooks below).
    // The AI engine is the oracle-checked DruidBoss (score / combo / feint / cooldown, 23 shared move executors picked by id); the lives are Simulation.DruidRemodel.
    // A stage gets its set from BossRemodelSets (one partial-method slot per boss) and runs it only while its remodel flag is on (Simulation.BossRemodel.cs).
    public delegate bool BossRmPick(DruidBoss boss, EnemyState e, DruidData d, double dist);                                // true = the boss started a forced move this tick
    public delegate bool BossRmStart(DruidBoss boss, EnemyState e, DruidData d, BossMove mv, double dist, int phase, int tele);
    public delegate bool BossRmTick(DruidBoss boss, EnemyState e, DruidData d, double dist);
    public delegate void BossRmTele(DruidBoss boss, DruidData d, List<DruidTelegraph> into);
    public delegate void BossRmLife(Simulation sim, EnemyState e, Simulation.DruidLifeState st);
    // RM-B0b
    public delegate double BossRmScale(Simulation sim, EnemyState e, Simulation.DruidLifeState st);                         // damage the boss takes: 1 = normal, 0 = blocked
    public delegate void BossRmProp(Simulation sim, Simulation.RemodelProp p);
    public delegate void BossRmObstacle(DruidBoss boss, EnemyState e, DruidData d, Simulation.RemodelObstacle o);

    // Per-boss rules. Every hook is optional; null = nothing happens. The AI hooks are meant to be static methods inside the boss's own `partial class DruidBoss` file
    // (they then reach the private helpers: StartPattern, PlayerHit, Parry, Tele, RmStartForced ...).
    public sealed class BossRemodelHooks
    {
        public BossRmPick ForcePick;       // idle, before the score table (druid: move 12 heartbeat is forced the same way, see DruidBoss.RmForcedPick)
        public BossRmStart StartMove;      // StartPattern, before the shared executors: return true when the move is the boss's own (new id, or a shared id it overrides);
                                           //   set d.S (own state name) and d.St2. false = the shared executor of that id runs
        public BossRmTick TickState;       // updateE `switch(e.s)`, before the shared states: return true when d.S is the boss's own state (leave it through
                                           //   "recover" / "bossRec" / "idle"); false = the shared state machine runs
        public BossRmTele Telegraphs;      // append the boss's own telegraph entries (after the shared ones) — DruidBoss.CollectTelegraphs
        public BossRmLife OnAttach;        // the fight starts (life 1, after the "start" event)
        public BossRmLife OnCollapse;      // a life ends: the boss kneels for CollapseTicks (after the "collapse" event)
        public BossRmLife CollapseTick;    // every tick of the kneel (the AI is stopped, HP stays 1): move the body, pull things in ... (e.X / e.Y are the boss position)
        public BossRmLife OnLife;          // the next life starts (after the "life" event; HP / body / shield already set)
        public BossRmLife OnFinal;         // the last life ends: called right before the common kill (rewards, StageFlow opens the exit)
        // RM-B0b
        public BossRmLife DyingTick;       // every tick of the death sequence (FinalTicks > 0: invulnerable, AI stopped), before the kill
        public BossRmProp PropBroken;      // a boss prop (Simulation.SpawnRemodelProp) lost its HP to the player
        public BossRmScale DamageScale;    // asked every boss tick while a life runs: < 1 scales the damage the boss takes, <= 0 blocks it (the "blocked" event counts the hits)
        public BossRmObstacle ObstacleHit; // the boss AI asked to move into an obstacle of the set this tick (d.S tells which move: a charge into a stump ...)

        public void CopyTo(BossRemodelHooks o)
        {
            o.ForcePick = ForcePick; o.StartMove = StartMove; o.TickState = TickState; o.Telegraphs = Telegraphs; o.OnAttach = OnAttach; o.OnCollapse = OnCollapse; o.CollapseTick = CollapseTick;
            o.OnLife = OnLife; o.OnFinal = OnFinal; o.DyingTick = DyingTick; o.PropBroken = PropBroken; o.DamageScale = DamageScale; o.ObstacleHit = ObstacleHit;
        }
    }

    // RM-B0b: a fixed obstacle of the boss arena (arena px). It is placed when the fight starts and stays until the arena is left.
    public sealed class RemodelObstacleDef
    {
        public string Name; public double X, Y, R;
        public bool BlocksMove = true;      // player, boss and enemies (Simulation.CanMove)
        public bool BlocksShots = true;     // projectiles / boss hazards that test walls (Simulation.IsProjectileWall)
    }

    // RM-B0b: the boss line keys of the web (_BOSS_LINES). A line fires once per key per fight: "intro"+si at the start, "sink"+si / "die"+si at the end.
    public static class BossLines
    {
        public static readonly HashSet<string> Keys = new HashSet<string> { "intro0", "sink0", "die1", "die2", "die3" };
    }

    public sealed class BossRemodelSet
    {
        public string Id;                                  // flag key (Simulation.RemodelBosses) and log name
        public int Lives = 1;
        // per life (index = life = AI phase): HP as a fraction of the mkEn base HP, body size, energy shield as a fraction of the life HP
        public double[] LifeHpFraction = { 1.0 }, BodyScale = { 1.0 }, ShieldFraction = { 0 };
        public int CollapseTicks = 120;                    // kneel between two lives (invulnerable, AI stopped)
        public BossMove[] Moves = new BossMove[0];         // order = telegraph move number (DruidTelegraph.Move = row + 1)
        public BossCombo[] Combos = new BossCombo[0];
        public BossPhaseDef[] Phases = new BossPhaseDef[0];   // one per life
        public HashSet<string> Parryable = new HashSet<string>();   // red = parryable at the start of the move
        public HashSet<string> Instant = new HashSet<string>();     // moves that get the bossRmWind telegraph state in front of them
        public HashSet<string> Forced = new HashSet<string>();      // never scored (started by a ForcePick rule), cooldown not scaled by the phase
        // parameters of the remodel variants of the shared executors (the web numbers apply with the remodel off)
        public double SlamRadius = 140;                    // slam
        public int PoisonTrailTicks = 180;                 // poison trail of chaseAoe / poisonTrail
        public double ChaseZoneRadius = 150; public int ChaseZoneWarn = 20, ChaseZoneCount = 6;   // chaseAoe
        public int SummonMax = 3;                          // summon: alive at once
        // motion of the remake (RB1-6, boss board §8 M2 / M4 / M5): every boss has its own walking numbers. The defaults are the druid's (B2 / B3 use a walking speed of 1.05).
        public double WalkSpeed = 1.1, WalkStandOff = 100;                  // px per tick (times Phases[].SpdM); he stops walking once this close to the player
        public int WalkAccelTicks = 20, WalkStopTicks = 12;                 // 0 -> max / max -> 0
        public double WalkTurn = 3 * Math.PI / 180, TeleTurn = 2 * Math.PI / 180;   // rad per tick: walking / during a telegraph
        public int AimFixTicks = 12;                                        // the aim is frozen this many ticks before the move goes off
        public int[] GapTicks = { 45, 36, 30 };                             // recovery end -> next telegraph, per life
        public int ComboLinkTicks = 12;                                     // between the moves of a combo
        // arena furniture (RB1-3): root pillars on a ring of PillarRingFraction x the arena radius, first one at PillarStartDeg (0 = none)
        public int PillarCount; public double PillarRingFraction = 0.55, PillarRadius = 80, PillarStartDeg = 45;
        // floating texts the remodelled boss may still raise (a text must start with one of these and carry no emoji / symbol glyph). Move names, phase labels and callouts are never shown (spec §6)
        public string[] PopupKeep = new string[0];
        // druid rules (RM-B1): on in DruidRemodelData.Set only
        public bool Heartbeat;                             // move 12 forced at the last-life entry, then every 40 s
        public bool GrabAbsorb;                            // grab: 2 s hold, heal, mash out
        public bool RootBonus;                             // hits on the root during the kneel: next life -RootBonusFraction, once per fight
        public int RootHitsNeeded = 3; public double RootBonusFraction = 0.10;
        public bool Sink;                                  // last fall = SinkDruid (STY-D9)
        // RM-B0b: life change / death variants (defaults = the RM-B1 behaviour)
        public bool CollapseVulnerable;                    // the boss takes damage during the change of life; the damage comes off the next life (CollapseTick may switch it per tick)
        public double CollapseHpFloor;                     // ... but the next life keeps at least this fraction of its HP
        public int FinalTicks;                             // > 0: the last fall runs a death sequence of this many ticks (invulnerable, DyingTick) before the kill
        public List<RemodelObstacleDef> Obstacles = new List<RemodelObstacleDef>();
        public BossRemodelHooks Hooks = new BossRemodelHooks();

        // the 23 executors of DruidBoss.StartPattern (+ the druid's heartbeat): a set reuses them by id
        public static readonly HashSet<string> SharedExecutors = new HashSet<string> {
            "burst", "fan", "charge", "jump", "shock", "summon", "grab", "spin", "mine", "multiDash", "slashCombo", "slam", "sweep", "burrowStrike", "beanStorm",
            "chaseAoe", "elemBall", "groundFissure", "tideWave", "seekerMines", "poisonTrail", "lavaPools", "rapidMissile", "heartbeat" };

        // same tables (shared arrays), own switches and hooks: a stage variant of a set (druid si3 = no sink)
        public BossRemodelSet Clone()
        {
            var c = (BossRemodelSet)MemberwiseClone();
            c.Hooks = new BossRemodelHooks(); Hooks.CopyTo(c.Hooks);
            c.Obstacles = new List<RemodelObstacleDef>(Obstacles);
            return c;
        }

        public BossPhaseDef Phase(int life) { return Phases[Math.Min(Math.Max(life, 0), Lives - 1)]; }

        public int MoveNo(string id)
        {
            for (int i = 0; i < Moves.Length; i++) if (Moves[i].Id == id) return i + 1;
            return 0;
        }

        public string[] MovesOfPhase(int phase)
        {
            var l = new List<string>();
            foreach (var m in Moves) if (m.InPhase(phase)) l.Add(m.Id);
            return l.ToArray();
        }

        // null = usable; otherwise the first problem (BossRemodelSets.Build and the harness call it)
        public string Validate()
        {
            if (string.IsNullOrEmpty(Id)) return "no Id";
            if (Lives < 1) return Id + ": Lives < 1";
            if (LifeHpFraction.Length < Lives || BodyScale.Length < Lives || ShieldFraction.Length < Lives || Phases.Length < Lives) return Id + ": per-life arrays shorter than Lives";
            if (Moves.Length == 0) return Id + ": no moves";
            var idx = new HashSet<int>(); var ids = new HashSet<string>();
            foreach (var m in Moves)
            {
                if (m.Idx < 0 || m.Idx >= DruidBossData.MoveSlots) return Id + ": move " + m.Id + " Idx " + m.Idx + " outside the cooldown slots 0.." + (DruidBossData.MoveSlots - 1);
                if (!idx.Add(m.Idx)) return Id + ": Idx " + m.Idx + " used twice";
                if (!ids.Add(m.Id)) return Id + ": move " + m.Id + " listed twice";
                if (!SharedExecutors.Contains(m.Id) && (Hooks.StartMove == null || Hooks.TickState == null)) return Id + ": move " + m.Id + " is not a shared executor and the set has no StartMove/TickState hooks";
                if (m.Id == "heartbeat" && !Heartbeat) return Id + ": heartbeat is a druid rule (Heartbeat off)";
                if (m.Phase == null || m.Tags == null || m.Combo == null) return Id + ": move " + m.Id + " has a null Phase/Tags/Combo";
            }
            foreach (var c in Combos) foreach (var s in c.Seq) if (!ids.Contains(s)) return Id + ": combo step " + s + " is not in the move table";
            foreach (var s in Parryable) if (!ids.Contains(s)) return Id + ": parryable " + s + " is not in the move table";
            foreach (var s in Instant) if (!ids.Contains(s)) return Id + ": instant " + s + " is not in the move table";
            foreach (var s in Forced) if (!ids.Contains(s)) return Id + ": forced " + s + " is not in the move table";
            if (Forced.Count > 0 && Hooks.ForcePick == null && !Heartbeat) return Id + ": forced moves without a ForcePick rule";
            return null;
        }

        public static BossMove Move(string id, int idx, int tele, int rec, int cd, bool feint, double rmin, double rmax, int[] phase, params string[] tags)
        { return new BossMove { Id = id, Idx = idx, Tele = tele, Rec = rec, Cd = cd, CanFeint = feint, CanDelay = 0, RangeMin = rmin, RangeMax = rmax, Phase = phase, Combo = new string[0], Tags = tags }; }
        public static BossCombo Combo(int[] phase, params string[] seq) { return new BossCombo { Seq = seq, Phase = phase }; }
        public static BossPhaseDef PhaseDef(string label, double spdM, double cdM, double comboC, double feintC)
        { return new BossPhaseDef { HpLow = 0, HpHigh = 1, SpdM = spdM, TeleM = 1, CdM = cdM, ComboC = comboC, FeintC = feintC, DelayC = 0, Label = label }; }
    }

    // Game data: stage index (si) -> remake set. Every boss fills its own slot from its own file (`static partial void StageN(...)` in `partial class BossRemodelSets`),
    // so parallel boss work never edits this file. An empty slot compiles away. Registering a set changes nothing until its remodel flag is on.
    public static partial class BossRemodelSets
    {
        public static Dictionary<int, BossRemodelSet> Build()
        {
            var m = new Dictionary<int, BossRemodelSet>();
            m[0] = DruidRemodelData.Set;                                // 1-1 dark druid (RM-B1)
            var d3 = DruidRemodelData.Set.Clone(); d3.Sink = false; m[3] = d3; // 1-4 keeps the druid tables until its own remake fills Stage3, but never sinks (RM-B4 §1: normal death, die3)
            Stage1(m); Stage2(m); Stage3(m);
            foreach (var kv in m) { string bad = kv.Value.Validate(); if (bad != null) throw new InvalidOperationException("BossRemodelSets si" + kv.Key + ": " + bad); }
            return m;
        }
        static partial void Stage1(Dictionary<int, BossRemodelSet> m);   // 1-2 poison mushroom giant
        static partial void Stage2(Dictionary<int, BossRemodelSet> m);   // 1-3 hell deformity
        static partial void Stage3(Dictionary<int, BossRemodelSet> m);   // 1-4 final druid (replaces m[3])
    }
}
