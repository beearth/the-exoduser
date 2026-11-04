using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RB1-7: seven active moves in the original twelve slots; AI range160 / hit reach300 corrected by CTO 2026-11-03 21:00.
    // RM-B1 (RB1-1 / RB1-2): the remodelled 1-1 dark druid. SSOT = docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md (§2 lives, §3 moves, §4 telegraph).
    // Everything here is data; the behaviour lives in DruidBoss.Remodel.cs (moves) and Simulation.DruidRemodel.cs (lives, collapse, sink).
    // The web-port tables in DruidBossData.cs stay untouched: the remodel is switched on per fight (DruidBoss.Remodel / Simulation.DruidRemodel), the default is off.
    public static class DruidRemodelData
    {
        public const int Lives = 3;
        // spec §2: effective HP of each life as a fraction of the base HP of mkEn (P1 100 % / P2 60 % / P3 40 %), body size and the energy shield of P2 / P3
        public static readonly double[] LifeHpFraction = { 1.0, 0.6, 0.4 };
        // BodyScale: the old shrink rule (Round(44 x BodyScale) = 44 / 37 / 31 px). Since 11-04 (CTO option a) it only defines LifeRadiusBasis below: the Core radius is LifeRadiusPx.
        public static readonly double[] BodyScale = { 1.0, 0.85, 0.70 };
        // 11-04 screen size = Core collision (boss board 8.5.5): P1 husk 2.8 x hero height, P2 = P1 x .85 (G0 gives no number), P3 old man ~2.0 x. Radius px -> world px/100 -> model scale (linear, PREP 10.1), so
        // 11-04 recalculation (CTO): the basis is the measured rig-pixel hero idle height 1.6094975 u (edge-p1-hit-1.json bossRig.heroIdleWorld), not 1.12 / 1.31: P1 130 -> 2.79 x, P2 111 -> 2.38 x (husk 4.8295 m / foot 1.3987 m), P3 57 -> 2.02 x (old man horn 2.71 m / foot 0.4762 m).
        public static readonly double[] LifeRadiusPx = { 130, 111, 57 };
        // the radius the centre-based distances below (WalkStandOff, SlamRadius, HeartbeatSafeRadius, move ranges) were designed for = Round(44 x BodyScale). Shift per life = LifeRadiusPx - basis = 86 / 74 / 26.
        public static readonly double[] LifeRadiusBasis = { 44, 37, 31 };
        public static readonly double[] ShieldFraction = { 0, 0.15, 0.15 };
        public const int CollapseTicks = 120;              // 2.0 s of invulnerability while the root sits in his back
        public const int RootHitsNeeded = 3;
        public const double RootBonusFraction = 0.10;      // −10 %p of the base HP on the next life, once per fight
        public const int HeartbeatCooldownTicks = 2400;    // 40 s
        public const int HeartbeatBeats = 3, HeartbeatBeatWind = 60, HeartbeatPause = 30, HeartbeatRecover = 90;   // RB1-6 spec §10.2 #12: first beat 90 (Moves[11].Tele), beats 2-3 60, 30 f standing still between beats, 90 f recovery
        public const double HeartbeatSafeRadius = 260;       // boss-battle lead 2026-10-28 (reachability, RM-B4 spec §3.1): the ring of 260 around the boss centre takes no damage, the pillar shadows (RB1-3) are added later
        public const double HeartbeatDamageMul = 1.5;      // initial value (spec gives no number): ATK x1.5, magic, not parryable
        public const int GrabTicks = 120;                  // 2 s of absorption
        public const double GrabHealFraction = 0.03;       // boss +3 % of the current life HP over the whole grab
        public const int GrabEscapeHits = 3;               // player hits during the grab that break it
        public const double SlashReach = 300, ChargeContact = 120; // RM1 §13.4: slash hit reach unchanged; charge extra contact 80 ->120
        public const double SlamRadius = 260;              // RB1-7 §13.2 #2 (the web value is a 1000 px arena wave)
        public const int PoisonTrailTicks = 180;           // spec §3 #8 "독 흔적 3초"
        public const double ChaseZoneRadius = 150;         // initial value: the web uses 450, unreadable with a short warning
        public const int ChaseZoneWarn = 30, ChaseZoneCount = 6;   // RB1-6 spec §10.2 #8: 30 f warning per zone (was 20)
        public const int SummonMax = 3;

        // ---- RB1-6 (spec §10, boss board §8 M1..M7): slow, heavy movement. One place for every speed / frame number so the boss-battle lead can retune them. 60 fps ticks, px per tick. ----
        // walking (§10.1 / M5): 42 % of the player's 2.6 px/tick, phase factor from Phases[].SpdM (1.0 / 1.1 / 1.2 -> at most 1.32)
        public const double WalkSpeed = 1.1, WalkStandOff = 220;               // stops walking once this close to the player (no orbiting, no side dodge)
        public const int WalkAccelTicks = 20, WalkStopTicks = 12;              // 0 -> max in 20 f, max -> 0 in 12 f
        public const double WalkTurn = 3 * Math.PI / 180, TeleTurn = 2 * Math.PI / 180;   // rad per tick: walking 3 deg, during a telegraph 2 deg
        public const int AimFixTicks = 12;                                     // the aim is frozen this many ticks before the move goes off (M2); the feint cuts the first half only
        public static readonly int[] GapTicks = { 45, 36, 30 };                // recovery end -> next telegraph, life 1 / 2 / 3 (M4)
        public const int ComboLinkTicks = 12;                                  // between the moves of a combo
        public const int ParryRecoveryBonus = 30;                              // a parried move recovers 30 f longer (M3): hits 1-2 of #1, #2, #3, #10
        public const int FeintRecovery = 25;
        // move frames that are not in the table (BossMove.Tele / Rec / Cd): active parts and speeds, spec §10.2
        public const int SlashActive = 10, SlashHitAt = 8, SlashLinkTele = 26;  // RB1-7 #1: telegraph 36 for the first hit (Moves[0].Tele), 26 for hits 2 and 3, swing 10 f, damage check when St2 == 8 (2 ticks after swing start)
        public const int SlamActive = 6;                                       // #2
        public const double ChargeSpeed = 22, ChargeTicks = 40;                // #3: up to 880 px
        public const double FissureSpeed = 14;                                 // #4: head px per tick
        public const double FanBulletMul = 0.75;                               // #5
        public const int GrabLungeTicks = 20; public const double GrabLungeSpeed = 9, GrabContact = 150;   // RB1-7 #6: lunge 20 f at 9 px/tick, contact +120 px, grabs when within body + player + GrabContact
        public const int GrabMissRecovery = 84, GrabHeldRecovery = 60;         // after a missed lunge (table) / after the throw (initial value)
        public const double PoisonDashSpeed = 4; public const int PoisonDashTicks = 45;   // #8: the poison-trail dash inside the move, 4 px/tick x 45 f = 180 px (boss-battle lead 2026-10-28); its direction is the frozen aim
        public const double BurrowTrackSpeed = 1.4;                            // #7: the marker that follows the player underground moves at most this fast
        public const int BurrowEruptWarn = 34, BurrowEruptPost = 6;            // RB1-7 #7: erupt telegraph 34 f then the blast, 6 f after
        public const double TideSpeedMul = 0.75;                               // #10 ring speed
        public const double MineSpeedMul = 0.7;                                // #11 mine speed (and its cap)
        // RB1-3 (spec §5): four root pillars, 0.55 x the arena radius from the centre, on the diagonals (the entry in the south and the exit in the north stay open), radius 80 (initial value)
        public const int PillarCount = 4;
        // floating texts the remodelled druid may still raise (boss battle lead decides keep / drop per entry): wall hit damage, poison tick on the player, leaving the grab
        public static readonly string[] PopupKeep = { "벽 충돌!", "독!", "벗어났다!" };

        static BossMove M(string id, int idx, int tele, int rec, int cd, bool feint, double rmin, double rmax, int[] phase, string[] tags)
        { return new BossMove { Id = id, Idx = idx, Tele = tele, Rec = rec, Cd = cd, CanFeint = feint, CanDelay = 0, RangeMin = rmin, RangeMax = rmax, Phase = phase, Combo = new string[0], Tags = tags }; }
        static BossCombo C(int[] phase, params string[] seq) { return new BossCombo { Seq = seq, Phase = phase }; }

        // phase index 0 / 1 / 2 = life 1 / 2 / 3 (P1 / P2 / P3). Order = spec table rows #1..#12.
        public static readonly BossMove[] Moves = {
            M("slashCombo",   13, 36, 84, 120, false,   0, 160, new[] { 0, 1, 2 }, new[] { "melee", "multi-hit" }),
            M("slam",         14, 52, 76, 160, false,   0, 260, new[] { 0, 1, 2 }, new[] { "melee", "aoe" }),
            M("charge",        2, 58, 74, 130, true,   40, 400, new[] { 0, 1, 2 }, new[] { "gap-close", "melee" }),
            M("groundFissure",34, 42, 60, 160, false,  60, 400, new[] { 1, 2 }, new[] { "aoe", "zone", "ranged" }),
            M("fan",           1, 38, 60, 120, false,  60, 300, new int[0],    new[] { "ranged", "frontal" }),
            M("grab",          8, 64, 84, 200, false,   0, 150, new[] { 0, 1, 2 }, new[] { "melee", "punish" }),
            M("burrowStrike", 58, 56, 76, 220, false, 150, 600, new[] { 1, 2 },    new[] { "gap-close", "melee", "ambush" }),
            M("chaseAoe",     21, 30, 60, 200, false,   0, 999, new int[0],    new[] { "aoe", "zone", "utility" }),
            M("summon",        6, 60, 60, 320, false,   0, 999, new int[0],       new[] { "utility" }),
            M("tideWave",     35, 70, 70, 180, false,   0, 999, new int[0],       new[] { "aoe", "ranged" }),
            M("seekerMines",  36, 40, 60, 200, false,   0, 999, new int[0],       new[] { "ranged", "zone", "utility" }),
            M("heartbeat",    57, 90, 90, DruidRemodelData.HeartbeatCooldownTicks, false, 0, 999, new[] { 2 }, new[] { "aoe" }),
        };
        // RB1-7 §13.2: C1 / C2 / C3 (P2-3) / C4. Inactive moves keep their executor slots.
        public static readonly BossCombo[] Combos = {
            C(new[] { 0, 1, 2 }, "slashCombo", "slam"),
            C(new[] { 0, 1, 2 }, "charge", "slashCombo"),
            C(new[] { 1, 2 },    "groundFissure", "charge"),
            C(new[] { 1, 2 },    "burrowStrike", "grab"),
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

        // RM-B0: the same data as the first BossRemodelSet (declared last: the static initialisers above run first). The druid rules are on here only.
        public const string SetId = "druid";
        public static readonly BossRemodelSet Set = MakeSet();
        static BossRemodelSet MakeSet()
        {
            var s = new BossRemodelSet {
                Id = SetId, Lives = Lives, LifeHpFraction = LifeHpFraction, BodyScale = BodyScale, ShieldFraction = ShieldFraction, CollapseTicks = CollapseTicks,
                Moves = Moves, Combos = Combos, Phases = Phases, Parryable = Parryable, Instant = Instant, Forced = new HashSet<string> { "heartbeat" },
                SlamRadius = SlamRadius, PoisonTrailTicks = PoisonTrailTicks, ChaseZoneRadius = ChaseZoneRadius, ChaseZoneWarn = ChaseZoneWarn, ChaseZoneCount = ChaseZoneCount, SummonMax = SummonMax,
                WalkSpeed = WalkSpeed, WalkStandOff = WalkStandOff, WalkAccelTicks = WalkAccelTicks, WalkStopTicks = WalkStopTicks, WalkTurn = WalkTurn, TeleTurn = TeleTurn, AimFixTicks = AimFixTicks, GapTicks = GapTicks, ComboLinkTicks = ComboLinkTicks, PillarCount = PillarCount, PopupKeep = (string[])PopupKeep.Clone(), LifeRadius = (double[])LifeRadiusPx.Clone(), LifeRadiusBasis = (double[])LifeRadiusBasis.Clone(), BodySeparation = true,
                Heartbeat = true, GrabAbsorb = true, RootBonus = true, RootHitsNeeded = RootHitsNeeded, RootBonusFraction = RootBonusFraction, Sink = true };
            return s;
        }
    }
}
