using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B1 (spec §4 / VFX spec v2.1 §3.3): which of the three telegraph displays a move uses.
    public enum DruidTeleKind { None = 0, ParryGlint = 1, GroundDecal = 2, GrabEyes = 3 }

    // Shape of the judged area, always taken from the Core numbers (the presentation never measures by hand).
    public enum DruidTeleShape { None = 0, Circle = 1, Cone = 2, Line = 3, RingGap = 4, ArenaMinusSafe = 5, Trail = 6 }

    // One entry of the read-only telegraph list. Nothing here is written back to the fight: it is a snapshot of what the move state machine and the hazard lists already
    // hold, so judgement, timing and RNG are the same with or without a reader (druid-boss-oracle stays at 0 mismatches).
    // Numbers are px / radians / 60 fps ticks of the simulation. (Serial, Move, Kind, Index) identifies an entry from one frame to the next.
    public sealed class DruidTelegraph
    {
        public int Move;                 // 1..12 = row of the RM-B1 §3 move table (DruidRemodelData.Moves order)
        public string MoveId;            // DruidRemodelData.Moves[Move - 1].Id
        public DruidTeleKind Kind;
        public DruidTeleShape Shape;
        public int Serial;               // one per move start (and shared by every hazard that move makes)
        public int Index;                // slash hit 0..2 / heartbeat beat 0..2 / mine or zone number / 0 = the main entry, 1.. = the extra shapes of the same hit
        public bool Live;                // false = still a warning before the hit; true = the hazard is already running (fissure head, tide ring)
        public double X, Y;              // centre (circle, ring), origin (cone, line, trail) or the middle of the arena (ArenaMinusSafe)
        public double Dir;               // cone / line / trail direction (radians); grab: the way the hand reaches
        public double Radius;            // circle radius / cone reach / ring centre-line radius / grab reach
        public double Angle;             // cone: full opening angle
        public double Length;            // line: full length (the charge: the farthest it can run) / trail: origin to target / ring: farthest radius it travels / arena: width
        public double Width;             // line: full width / ring: band thickness / arena: height
        public double Inner;             // ring: inner radius of the band (Radius - Width / 2)
        public double GapDir, GapAngle;  // ring: direction and FULL angle of the opening; the opening is not damaged, the ring is
        public double Progress;          // fissure head length / ring radius now / trail length already travelled (moves 4, 7, 10)
        public double Total, Remaining;  // ticks from the first telegraph frame to the damage check, and what is left of it (Live: lifetime of the hazard)
        public double TipX, TipY;        // staff tip (kind ParryGlint); 0,0 otherwise
        public double[][] Safe;          // ArenaMinusSafe: {centre x, centre y, radius} of every safe zone (null = none: i-frames are the only answer)
        public double Elapsed { get { return Total - Remaining; } }   // the glint fires at Elapsed == 2 (VFX spec §3.3 ①)
    }

    public sealed partial class DruidBoss
    {
        public const double StaffReachExtra = 70;   // staff tip = body radius + 70 along (Facing + WeaponAng): initial value, the web draws no staff
        public const double ChargeSpeed = DruidRemodelData.ChargeSpeed, ChargeTicks = DruidRemodelData.ChargeTicks, SlashReach = 300, SlashHalfAngle = 1.2, EruptReachExtra = 120, FanRange = 2000, SummonSpread = 80;
        // lead = ticks between the end of the wind state and the damage check of the move (slam: bossSlam 8; first slash: bossSlash 10 -> window at <= 6; burrow: 45 under + 8 erupt)
        const int SlamLead = DruidRemodelData.SlamActive, SlashLead = DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt, BurrowUnder = 45, BurrowEruptLead = DruidRemodelData.BurrowEruptWarn, FissureMaxT = 140;   // ticks from the end of the wind to the damage check (slam swing 6, slash swing -> check at St2 == 6, erupt warning 30)
        public int TeleSerial;               // counts move starts (remodel only)

        // groundFissure: how far the head may crawl (also read by the telegraph)
        int FissureMaxLen() { return I(Math.Max(Or(host.ArenaW / T, 50), Or(host.ArenaH / T, 42)) * T * .45); }

        static int MoveNo(string id)
        {
            var mv = DruidRemodelData.Moves;
            for (int i = 0; i < mv.Length; i++) if (mv[i].Id == id) return i + 1;
            return 0;
        }

        DruidTelegraph Tele(List<DruidTelegraph> into, string moveId, DruidTeleKind kind, DruidTeleShape shape, double total, double remaining, int index = 0)
        {
            var t = new DruidTelegraph { Move = MoveNo(moveId), MoveId = moveId, Kind = kind, Shape = shape, Serial = TeleSerial, Index = index, Total = total, Remaining = remaining };
            into.Add(t); return t;
        }

        void StaffTip(DruidTelegraph t, DruidData d)
        {
            double a = d.Facing + d.WeaponAng, r = d.R + StaffReachExtra;
            t.TipX = d.X + Cos(a) * r; t.TipY = d.Y + Sin(a) * r;
        }

        // Read-only snapshot of every telegraph and running telegraph-hazard of the remodelled druid, rebuilt from scratch each call. Empty when the flag is off.
        // Fill order is stable. Ticks: call after Simulation.Tick, once per tick.
        public void CollectTelegraphs(List<DruidTelegraph> into)
        {
            into.Clear();
            if (!Remodel || Boss == null) return;
            DruidData d; if (!Data.TryGetValue(Boss, out d)) return;
            double pr = host.PRadius; DruidTelegraph t;
            string mid = d.RmMoveId ?? "";
            switch (d.S)
            {
                case "bossRmWind":
                    {   // the four moves that fire the moment they start in the web (DruidRemodelData.Instant): the wind shows what is about to appear
                        BossMove pend = d.RmPending; if (pend == null) break;
                        double tot = d.RmTeleTotal, rem = d.St2;
                        if (pend.Id == "groundFissure")
                        {
                            // spec #4 (ruling 2026-10-28): a straight line aimed once at the first telegraph tick; only the head hurts (half width 70 + player radius), no end blast
                            t = Tele(into, "groundFissure", DruidTeleKind.GroundDecal, DruidTeleShape.Line, tot, rem, 0);
                            t.X = d.X; t.Y = d.Y; t.Dir = d.RmDir; t.Length = Math.Min(FissureMaxLen(), DruidRemodelData.FissureSpeed * FissureMaxT); t.Width = 2 * FissureHitHalfWidth;
                        }
                        else if (pend.Id == "tideWave")
                        {
                            AddTideRing(into, tot, rem, false, d.X, d.Y, 20, 1750, d.RmGap, .8, 60, 0);
                        }
                        else if (pend.Id == "seekerMines")
                        {
                            int n = 3;   // DruidRemodelData spec #11
                            for (int mi = 0; mi < n; mi++)
                            {
                                double ma = d.Facing + Math.PI * 2 * mi / n;
                                t = Tele(into, "seekerMines", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, tot, rem, mi);
                                t.X = d.X + Cos(ma) * 20; t.Y = d.Y + Sin(ma) * 20; t.Radius = 60; t.Dir = ma;
                            }
                        }
                        // chaseAoe: the zones do not exist yet (they drop on the player's position 60 ticks later, each with its own 20 f warning, see below)
                        break;
                    }
                case "bossSlashWind":
                    AddSlash(into, d, pr, d.SlashIdx, SlashTele(d, d.SlashIdx) + SlashLead, d.St2 + SlashLead);
                    break;
                case "bossSlash":
                    {
                        int idx = d.SlashIdx; double left = d.St2 - DruidRemodelData.SlashHitAt;   // the swing is 8 f and the damage is checked once, when St2 == 6
                        if (left > 0) AddSlash(into, d, pr, idx, SlashTele(d, idx) + SlashLead, left);
                        break;
                    }
                case "bossSlamWind":
                    AddSlam(into, d, d.RmTeleTotal + SlamLead, d.St2 + SlamLead);
                    break;
                case "bossSlam":
                    if (d.St2 > 0) AddSlam(into, d, d.RmTeleTotal + SlamLead, d.St2);
                    break;
                case "bossChargeWind":
                    {   // move 3; a grab picked from 120 px or farther runs this same wind (BossMove "grab" falls back to the charge) and is reported as move 6
                        string cm = mid == "grab" ? "grab" : "charge";
                        double w = 2 * (d.R + pr + 80);
                        t = Tele(into, cm, DruidTeleKind.ParryGlint, DruidTeleShape.Line, d.RmTeleTotal, d.St2, 0);
                        t.X = d.X; t.Y = d.Y; t.Dir = d.Facing; t.Length = ChargeSpeed * ChargeTicks; t.Width = w; StaffTip(t, d);
                        t = Tele(into, cm, DruidTeleKind.GroundDecal, DruidTeleShape.Line, d.RmTeleTotal, d.St2, 1);
                        t.X = d.X; t.Y = d.Y; t.Dir = d.Facing; t.Length = ChargeSpeed * ChargeTicks; t.Width = w;
                        break;
                    }
                case "bossFanWind":
                    t = Tele(into, "fan", DruidTeleKind.GroundDecal, DruidTeleShape.Cone, d.RmTeleTotal, d.St2, 0);
                    t.X = d.X; t.Y = d.Y; t.Dir = d.Facing; t.Angle = Math.PI * (.7 + d.BossPhase * .06); t.Radius = FanRange;
                    break;
                case "bossGrabWind":
                    t = Tele(into, "grab", DruidTeleKind.GrabEyes, DruidTeleShape.None, d.RmTeleTotal, d.St2, 0);
                    t.X = d.X; t.Y = d.Y; t.Dir = d.GrabAng; t.Radius = d.R + pr + DruidRemodelData.GrabContact + DruidRemodelData.GrabLungeTicks * DruidRemodelData.GrabLungeSpeed;   // reach = the lunge (18 f x 9) + the contact distance
                    break;
                case "bossSummonWind":
                    t = Tele(into, "summon", DruidTeleKind.None, DruidTeleShape.None, d.RmTeleTotal, d.St2, 0);
                    t.X = d.X; t.Y = d.Y; t.Radius = SummonSpread;   // soil stirs inside this radius (the spawn spots are drawn when the wind ends)
                    break;
                case "bossDruidDive":
                    {   // the circle under the player's feet is where he surfaces: the target locks when the dive ends
                        double tot = d.RmTeleTotal + BurrowUnder + BurrowEruptLead;
                        t = Tele(into, "burrowStrike", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, tot, d.St2 + BurrowUnder + BurrowEruptLead, 0);
                        t.X = host.PX; t.Y = host.PY; t.Radius = d.R + EruptReachExtra;
                        break;
                    }
                case "bossDruidUnder":
                    {
                        double tot = d.RmTeleTotal + BurrowUnder + BurrowEruptLead, rem = d.St2 + BurrowEruptLead;
                        double dx = d.DiveTx - d.TeleOx, dy = d.DiveTy - d.TeleOy;
                        t = Tele(into, "burrowStrike", DruidTeleKind.GroundDecal, DruidTeleShape.Trail, tot, rem, 0);
                        t.X = d.TeleOx; t.Y = d.TeleOy; t.Dir = Atan2(dy, dx); t.Length = Math.Sqrt(dx * dx + dy * dy); t.Progress = Dst(d.TeleOx, d.TeleOy, d.X, d.Y);
                        t = Tele(into, "burrowStrike", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, tot, rem, 1);
                        t.X = d.DiveTx; t.Y = d.DiveTy; t.Radius = d.R + EruptReachExtra;
                        break;
                    }
                case "bossDruidErupt":
                    {
                        double rem = d.St2 - (d.EruptMax - BurrowEruptLead);   // the blast lands when St2 <= EruptMax - 8
                        if (rem > 0)
                        {
                            t = Tele(into, "burrowStrike", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, d.RmTeleTotal + BurrowUnder + BurrowEruptLead, rem, 0);
                            t.X = d.X; t.Y = d.Y; t.Radius = d.R + EruptReachExtra;
                        }
                        break;
                    }
                case "bossHeartWind":
                    {   // every beat: the whole arena except the safe zones; SafeZones is empty until RB1-3 puts the root pillars in
                        // first beat 90 f (Moves[11].Tele), beats 2-3 60 f; the safe zones are the ring of 260 around the boss (always) and the pillar shadows (SafeZones, RB1-3)
                        t = Tele(into, "heartbeat", DruidTeleKind.GroundDecal, DruidTeleShape.ArenaMinusSafe, d.HbBeat == 0 ? d.RmTeleTotal : DruidRemodelData.HeartbeatBeatWind, d.St2, d.HbBeat);
                        t.X = host.ArenaW / 2; t.Y = host.ArenaH / 2; t.Length = host.ArenaW; t.Width = host.ArenaH;
                        t.Safe = new double[SafeZones.Count + 1][]; t.Safe[0] = new[] { d.X, d.Y, DruidRemodelData.HeartbeatSafeRadius };
                        for (int i = 0; i < SafeZones.Count; i++) t.Safe[i + 1] = (double[])SafeZones[i].Clone();
                        break;
                    }
            }
            // chase zones: each one is its own 20 f warning (a circle where the player stood when it dropped)
            foreach (var ca in ChaseAoes)
                foreach (var z in ca.Zones)
                {
                    if (z.Hit) continue;
                    t = new DruidTelegraph { Move = MoveNo("chaseAoe"), MoveId = "chaseAoe", Kind = DruidTeleKind.GroundDecal, Shape = DruidTeleShape.Circle, Serial = z.Serial, Index = z.Idx,
                        Total = z.Delay, Remaining = z.Delay - z.T, X = z.X, Y = z.Y, Radius = z.R };
                    into.Add(t);
                }
            // fissures in flight: the head crawls straight along its fixed direction; the part it has passed stays on screen but is harmless
            foreach (var f in Fissures)
            {
                double reach = Math.Min(f.MaxLen, f.Spd * FissureMaxT);   // the fissure ends after FissureMaxT ticks even if the arena allows more
                double ticks = f.Done ? 0 : Math.Max(0, Math.Ceiling((reach - f.Len) / f.Spd));
                t = new DruidTelegraph { Move = MoveNo("groundFissure"), MoveId = "groundFissure", Kind = DruidTeleKind.GroundDecal, Shape = DruidTeleShape.Line, Serial = f.Serial, Index = 0, Live = true,
                    X = f.X, Y = f.Y, Dir = f.Ang, Length = reach, Width = f.W, Progress = f.Len, Total = reach / f.Spd, Remaining = ticks };
                into.Add(t);
            }
            foreach (var w in TideWaves) AddTideRing(into, w.MaxT, w.MaxT - w.T, true, w.X, w.Y, w.Rad, w.MaxR, w.GapAng, w.GapSize, w.W, w.Serial);
        }

        // telegraph length of hit idx: 32 for the first (Moves[0].Tele), 24 for hits 2 and 3 (their own wind state); the damage is checked 2 ticks after the wind ends
        static double SlashTele(DruidData d, int idx) { return idx == 0 ? d.RmTeleTotal : DruidRemodelData.SlashLinkTele; }

        // (see SlashTele)
        void AddSlash(List<DruidTelegraph> into, DruidData d, double pr, int idx, double total, double remaining)
        {
            double reach = d.R + pr + SlashReach, angle = SlashHalfAngle * 2;
            var kind = idx < 2 ? DruidTeleKind.ParryGlint : DruidTeleKind.GroundDecal;   // spec #1: hits 1 and 2 are parryable (red -> bone glint), the big third one is dodged
            var t = Tele(into, "slashCombo", kind, DruidTeleShape.Cone, total, remaining, idx);
            t.X = d.X; t.Y = d.Y; t.Dir = d.Facing; t.Angle = angle; t.Radius = reach;
            if (kind == DruidTeleKind.ParryGlint) StaffTip(t, d);
        }

        // slam: both displays at once (parry it, or step out of the circle)
        void AddSlam(List<DruidTelegraph> into, DruidData d, double total, double remaining)
        {
            var t = Tele(into, "slam", DruidTeleKind.ParryGlint, DruidTeleShape.Circle, total, remaining, 0);
            t.X = d.X; t.Y = d.Y; t.Radius = DruidRemodelData.SlamRadius; t.Dir = d.Facing; StaffTip(t, d);
            t = Tele(into, "slam", DruidTeleKind.GroundDecal, DruidTeleShape.Circle, total, remaining, 1);
            t.X = d.X; t.Y = d.Y; t.Radius = DruidRemodelData.SlamRadius; t.Dir = d.Facing;
        }

        // tide wave: the band is [rad - w, rad + w] (UpdateTideWaves tests |dist - rad| < w) and the gap passes when |angle - gapAng| <= gapSize
        void AddTideRing(List<DruidTelegraph> into, double total, double remaining, bool live, double x, double y, double rad, double maxR, double gapAng, double gapSize, double w, int serial)
        {
            for (int k = live ? 1 : 0; k < 2; k++)
            {   // parryable (UpdateTideWaves -> TryParry) and a ring to leave: both displays while it is only a warning; the running ring keeps the decal (the glint is a one-off)
                var t = Tele(into, "tideWave", k == 0 ? DruidTeleKind.ParryGlint : DruidTeleKind.GroundDecal, DruidTeleShape.RingGap, total, remaining, k);
                if (live) t.Serial = serial;
                t.Live = live; t.X = x; t.Y = y; t.Radius = rad; t.Inner = Math.Max(0, rad - w); t.Width = 2 * w; t.Length = maxR; t.Progress = rad; t.GapDir = gapAng; t.GapAngle = gapSize * 2;
                if (k == 0 && Boss != null) { DruidData d; if (Data.TryGetValue(Boss, out d)) StaffTip(t, d); }
            }
        }
    }
}
