using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B1 (RB1-1 / RB1-2): the remodelled 1-1 dark druid. SSOT = docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md (§2 lives, §3 moves, §4 telegraph).
    // Everything here is data; the behaviour lives in DruidBoss.Remodel.cs (moves) and Simulation.DruidRemodel.cs (lives, collapse, sink).
    // The web-port tables in DruidBossData.cs stay untouched: the remodel is switched on per fight (DruidBoss.Remodel / Simulation.DruidRemodel), the default is off.
    public static class DruidRemodelData
    {
        public const int Lives = 3;
        // spec §2: effective HP of each life as a fraction of the base HP of mkEn (P1 100 % / P2 60 % / P3 40 %), body size and the energy shield of P2 / P3
        public static readonly double[] LifeHpFraction = { 1.0, 0.6, 0.4 };
        public static readonly double[] BodyScale = { 1.0, 0.85, 0.70 };
        public static readonly double[] ShieldFraction = { 0, 0.15, 0.15 };
        public const int CollapseTicks = 120;              // 2.0 s of invulnerability while the root sits in his back
        public const int RootHitsNeeded = 3;
        public const double RootBonusFraction = 0.10;      // −10 %p of the base HP on the next life, once per fight
        public const int HeartbeatCooldownTicks = 2400;    // 40 s
        public const int HeartbeatBeats = 3, HeartbeatBeatWind = 45, HeartbeatRecover = 60;
        public const double HeartbeatDamageMul = 1.5;      // initial value (spec gives no number): ATK x1.5, magic, not parryable
        public const int GrabTicks = 120;                  // 2 s of absorption
        public const double GrabHealFraction = 0.03;       // boss +3 % of the current life HP over the whole grab
        public const int GrabEscapeHits = 3;               // player hits during the grab that break it
        public const double SlamRadius = 140;              // spec §3 #2 (the web value is a 1000 px arena wave)
        public const int PoisonTrailTicks = 180;           // spec §3 #8 "독 흔적 3초"
        public const double ChaseZoneRadius = 150;         // initial value: the web uses 450, unreadable with a 20 f warning
        public const int ChaseZoneWarn = 20, ChaseZoneCount = 6;
        public const int SummonMax = 3;

        static BossMove M(string id, int idx, int tele, int rec, int cd, bool feint, double rmin, double rmax, int[] phase, string[] tags)
        { return new BossMove { Id = id, Idx = idx, Tele = tele, Rec = rec, Cd = cd, CanFeint = feint, CanDelay = 0, RangeMin = rmin, RangeMax = rmax, Phase = phase, Combo = new string[0], Tags = tags }; }
        static BossCombo C(int[] phase, params string[] seq) { return new BossCombo { Seq = seq, Phase = phase }; }

        // phase index 0 / 1 / 2 = life 1 / 2 / 3 (P1 / P2 / P3). Order = spec table rows #1..#12.
        public static readonly BossMove[] Moves = {
            M("slashCombo",   13, 20, 40,  90, false,   0, 100, new[] { 0, 1, 2 }, new[] { "melee", "multi-hit" }),
            M("slam",         14, 35, 40, 140, false,   0, 140, new[] { 0, 1, 2 }, new[] { "melee", "aoe" }),
            M("charge",        2, 40, 40, 100, true,   40, 400, new[] { 0, 1, 2 }, new[] { "gap-close", "melee" }),
            M("groundFissure",34, 25, 35, 140, false,  60, 400, new[] { 0, 1, 2 }, new[] { "aoe", "zone", "ranged" }),
            M("fan",           1, 25, 35, 100, false,  60, 300, new[] { 0, 1 },    new[] { "ranged", "frontal" }),
            M("grab",          8, 60, 50, 180, false,   0, 150, new[] { 0, 1, 2 }, new[] { "melee", "punish" }),
            M("burrowStrike", 58, 50, 40, 200, false, 150, 600, new[] { 1, 2 },    new[] { "gap-close", "melee", "ambush" }),
            M("chaseAoe",     21, 20, 60, 180, false,   0, 999, new[] { 1, 2 },    new[] { "aoe", "zone", "utility" }),
            M("summon",        6, 45, 60, 300, false,   0, 999, new[] { 1 },       new[] { "utility" }),
            M("tideWave",     35, 60, 40, 160, false,   0, 999, new[] { 2 },       new[] { "aoe", "ranged" }),
            M("seekerMines",  36, 25, 60, 180, false,   0, 999, new[] { 2 },       new[] { "ranged", "zone", "utility" }),
            M("heartbeat",    57, 45, 60, DruidRemodelData.HeartbeatCooldownTicks, false, 0, 999, new[] { 2 }, new[] { "aoe" }),
        };
        // spec §3 "콤보": C1..C6
        public static readonly BossCombo[] Combos = {
            C(new[] { 0, 1, 2 }, "slashCombo", "slam"),
            C(new[] { 0, 1, 2 }, "charge", "slashCombo"),
            C(new[] { 0, 1, 2 }, "groundFissure", "charge"),
            C(new[] { 1, 2 },    "burrowStrike", "grab"),
            C(new[] { 1 },       "chaseAoe", "fan"),
            C(new[] { 2 },       "tideWave", "charge", "slam"),
        };
        // spec §3: combo chance P1 .30 / P2 .45 / P3 .60, feint P1 0 / P2 .10 / P3 .15; §4: telegraph never shortens (TeleM 1), cooldown x1.0/.8/.65, speed x1.0/1.1/1.2
        public static readonly BossPhaseDef[] Phases = {
            new BossPhaseDef { HpLow = 0, HpHigh = 1, SpdM = 1.0, TeleM = 1, CdM = 1.0,  ComboC = .30, FeintC = 0,   DelayC = 0, Label = "P1" },
            new BossPhaseDef { HpLow = 0, HpHigh = 1, SpdM = 1.1, TeleM = 1, CdM = 0.8,  ComboC = .45, FeintC = .10, DelayC = 0, Label = "P2" },
            new BossPhaseDef { HpLow = 0, HpHigh = 1, SpdM = 1.2, TeleM = 1, CdM = 0.65, ComboC = .60, FeintC = .15, DelayC = 0, Label = "P3" },
        };
        // red = parryable (spec: 1·2 hit of the branch lash, slam, charge, tide wave); the third lash is switched off by the state machine
        public static readonly HashSet<string> Parryable = new HashSet<string> { "slashCombo", "slam", "charge", "tideWave" };
        // moves that fire the moment they start in the web: the remodel puts a telegraph state (bossRmWind, BossMove.Tele frames) in front of them
        public static readonly HashSet<string> Instant = new HashSet<string> { "groundFissure", "chaseAoe", "tideWave", "seekerMines" };

        public static string[] MovesOfPhase(int phase)
        {
            var l = new List<string>();
            foreach (var m in Moves) if (m.InPhase(phase)) l.Add(m.Id);
            return l.ToArray();
        }
    }
}
