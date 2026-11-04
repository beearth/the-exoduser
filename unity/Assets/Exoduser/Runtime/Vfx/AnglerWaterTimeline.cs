using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // U-VFX-14 (docs/5.1임펙트디자인/ANGLER_WATER_VFX_G1_20261104.md): the water energy ball of the 1-1 abyssal anglers. Presentation only, no Unity types and no
    // simulation writes, so combat-impact-tests can compile it with the Core. Web units: 1 tick = 1 frame at 60 fps, lengths in web pixels, H = hero height.
    //
    // Which bullet is the water orb. game.html draws a shot with the kraken water orb clip when `p.fbEnergy` (54183 -> _fbDrawFly 24214 -> _drawKrakenWaterOrbClip 24196),
    // and fbEnergy is set in exactly one place, _fbFireEnergy (61022-61028: el EL.I, life/ml 320, sz 48, r 20, elemBall, _typed, _commit, fbEnergy). Since core d637ea24c the bullet carries the
    // same FbEnergy flag (Simulation.FieldBoss.cs FieldBossFireEnergy), so the test is the flag plus the spawn literal.
    public enum AnglerWaterKind { Hit, Parry, Expire, Bounce, MagicHit }

    public static class AnglerWater
    {
        public const string ResDir = "Art/vfx/field/", OrbSheet = "water_orb_loop", CrownSheet = "water_hit_crown", SplitSheet = "water_parry_split";
        public const int OrbCols = 6, OrbRows = 4, OrbFrames = 24, OrbTicksPerFrame = 5;      // 24 frames x 5 ticks = 2 s loop
        public const int CrownCols = 4, CrownRows = 4, CrownFrames = 14, SplitFrames = 14;   // source frames 0 and 1 (star discs) are dropped by tools/vfx/import_angler_water.py
        public const int DroppedSourceFrames = 2, CellPx = 256;
        public const double H = 96;                                                       // hero height in web px (the CombatImpactView reference)
        // alpha boxes inside the 256 px cell (import_angler_water.py CONTENT_BOX): the draw sizes below are set so the content, not the cell, has the G1 size
        public const double OrbBodyPx = 136, CrownContentPx = 205, SplitContentWidthPx = 160;

        // ---- which bullet ----
        public static bool IsAnglerOrb(BossProjectile p)
        {
            return p != null && p.Active && p.FbEnergy && p.ElemBall && p.El == 2 && p.Sz == SpawnedSz && p.R == SpawnedR && p.Ml == 320 && p.Commit && p.Typed
                && !p.Friendly && !p.DruidPoison && !p.Mine && !p.Web && !p.RedBean && !p.BlackBean;
        }

        // ---- flight ----
        // DruidBoss.SpawnProjectile turns the FieldBossFireEnergy literal (Sz 48, R 20) into Sz x 2 = 96, R x 1.3 = 26, so the list holds these values.
        public const double SpawnedSz = 96, SpawnedR = 26;
        // G1 size: body diameter 48 web px (about 36 screen px at the LOCK camera), fixed; never derived from the doubled Core Sz.
        public const double OrbDesignDiameter = 48;
        public static double OrbCell() { return OrbDesignDiameter * CellPx / OrbBodyPx; }       // sheet cell box whose 136 px body comes out at the design diameter
        public static double OrbBodyDiameter(double cellWidth) { return cellWidth * OrbBodyPx / CellPx; }
        public static int OrbFrame(int age) { return (((age < 0 ? 0 : age) / OrbTicksPerFrame) % OrbFrames); }
        public const double TailMinFactor = 1.5, TailMaxFactor = 2.0, TailMaxAlpha = .5, TailWidthFactor = .55;
        // ribbon behind the body: 1.5..2 body diameters long (it breathes), alpha <= .5, tapered to a point
        public static double TailLength(double bodyDiameter, int age) { return bodyDiameter * (1.75 + .25 * Math.Sin(age * .09)); }
        public static double TailWidth(double bodyDiameter) { return bodyDiameter * TailWidthFactor; }
        public const int TailDropEvery = 6;
        public const double DropMinWidth = 3, DropMinLength = 10;

        public sealed class Drop
        {
            public double Dx, Dy;        // spawn offset from the contact / orb centre (ground plane, web px)
            public double Vx, Vy;        // ground drift per tick
            public double Z0, Vz, G;     // height above the ground (screen: up), initial lift per tick, gravity per tick^2
            public double Width, Length; // stretched streak, never a dot
            public int Delay, Life;      // life = ticks until it reaches the ground (z <= 0) or the cap, whichever first
            public double Z(double age) { return Z0 + Vz * age - .5 * G * age * age; }
            public bool Alive(double age) { return age >= 0 && age < Life && Z(age) > 0; }
        }
        public static int FallTicks(double z0, double vz, double g) { return (int)Math.Ceiling((vz + Math.Sqrt(vz * vz + 2 * g * z0)) / g); }

        // 1..2 streaks shed behind the orb every 6 ticks, falling and vanishing at the ground (no wet dot is left)
        public static bool TailDropTick(int age) { return age > 0 && age % TailDropEvery == 0; }
        public static Drop[] TailDrops(int seed, double ang, double bodyDiameter)
        {
            var rng = new Random(seed); int n = 1 + rng.Next(2); var drops = new Drop[n];
            for (int i = 0; i < n; i++)
            {
                double back = bodyDiameter * (.15 + rng.NextDouble() * .55), side = (rng.NextDouble() - .5) * bodyDiameter * .5;
                double cx = Math.Cos(ang), cy = Math.Sin(ang), z0 = 6 + rng.NextDouble() * 8, g = .22;
                drops[i] = new Drop { Dx = -cx * back - cy * side, Dy = -cy * back + cx * side, Vx = -cx * .8, Vy = -cy * .8, Z0 = z0, Vz = 0, G = g,
                    Width = DropMinWidth + rng.NextDouble() * 1.0, Length = DropMinLength + rng.NextDouble() * 5, Life = FallTicks(z0, 0, g) };
            }
            return drops;
        }

        // ---- charge (Core FieldBossEnergyCharge = 180 ticks; the last 60 grow the ball at the feeler tip, 0 -> body size, alpha 0 -> 1) ----
        public const int ChargeTicks = 60;
        public static double ChargeProgress(int enChg, bool hidden, int teleportTicks)
        {
            if (hidden || teleportTicks > 0 || enChg <= 0 || enChg > ChargeTicks) return 0;
            return (ChargeTicks - enChg) / (double)ChargeTicks;
        }
        public static double ChargeSize(double progress, double bodyCell) { return bodyCell * progress; }

        // ---- launch: no sheet, 5..7 water streaks from the feeler tip within +-20 degrees of the travel direction, 0.4..0.8 H long, 9 ticks (0.15 s) ----
        public const int LaunchLife = 9;
        public sealed class Streak { public double Angle, Length, Width; }
        public static Streak[] LaunchStreaks(int seed, double ang)
        {
            var rng = new Random(seed); int n = 5 + rng.Next(3); var s = new Streak[n];
            for (int i = 0; i < n; i++) s[i] = new Streak { Angle = ang + (rng.NextDouble() * 2 - 1) * 20 * Math.PI / 180, Length = (.4 + rng.NextDouble() * .4) * H, Width = 3 + rng.NextDouble() * 2 };
            return s;
        }
        // head and tail distance from the muzzle at `age`: the streak shoots out and thins away, never shorter than its own width
        public static void StreakSpan(Streak s, int age, out double tail, out double head)
        {
            double p = Math.Max(0, Math.Min(1, age / (double)LaunchLife)); head = s.Length * (.25 + 1.1 * p); tail = Math.Max(0, head - s.Length * (1 - p * .6));
        }
        public static double StreakAlpha(int age) { return age < 0 || age >= LaunchLife ? 0 : .85 * (1 - age / (double)LaunchLife); }

        // ---- Q parry split (round 2): the Core removes the ball and adds five Friendly + ParryMagicShot water shots (DruidBoss.AddParryShots, web _splitParriedBigEnergy
        // game.html 17363: 5 shots, 72 degrees apart from the reverse of the ball's travel, speed 7.5, range 900). They are drawn as allied water orbs. ----
        public const int SplitCount = 5;
        public const double SplitStepRad = Math.PI * 2 / SplitCount, SplitBodyScale = .55;
        public const double AllyRimAlpha = .8; public const byte AllyRimR = 0xdf, AllyRimG = 0xe3, AllyRimB = 0xe6;   // silver white #dfe3e6
        public const double SplitTailFactor = 1.0, SplitTailMaxAlpha = .4;
        public static bool IsParrySplitShot(BossProjectile p) { return p != null && p.Active && p.Friendly && p.ParryMagicShot && p.El == 2; }
        public static double SplitBodyCell() { return OrbCell() * SplitBodyScale; }                    // the original ball's box x .55 (the split shot's own Sz is 1)
        public static double SplitTailLength(double bodyDiameter) { return bodyDiameter * SplitTailFactor; }
        // five muzzle directions, 72 degrees apart, starting at the reverse of the travel direction (same arithmetic as the Core)
        public static double[] SplitAngles(double travelAngle)
        {
            var a = new double[SplitCount]; for (int k = 0; k < SplitCount; k++) a[k] = travelAngle + Math.PI + SplitStepRad * k; return a;
        }
        // short water jets out of the contact along each split direction: 2..3 per direction, 0.15 s (LaunchLife), stretched, never a dot
        public static Streak[] SplitBurst(int seed, double[] dirs)
        {
            var rng = new Random(seed); var list = new List<Streak>();
            foreach (var d in dirs)
            {
                int n = 2 + rng.Next(2);
                for (int i = 0; i < n; i++) list.Add(new Streak { Angle = d + (rng.NextDouble() * 2 - 1) * 6 * Math.PI / 180, Length = (.3 + rng.NextDouble() * .2) * H, Width = 3 + rng.NextDouble() * 2 });
            }
            return list.ToArray();
        }
        // ---- wall bounce of a split shot: the Core mirrors the velocity and counts Bounces; the splash opens along the reflected side ----
        public const double BounceScale = .35; public const int BounceLife = 9;      // crown sheet x .35, 0.15 s
        public static bool IsBounce(double prevVx, double prevVy, double vx, double vy, int bouncesBefore, int bouncesAfter)
        {
            return bouncesAfter > bouncesBefore && (Math.Abs(vx - prevVx) > 1e-9 || Math.Abs(vy - prevVy) > 1e-9);
        }
        // the wall normal = the change of the velocity (a mirror turns v into v - 2(v.n)n, so v' - v is along n); pointing away from the wall
        public static double BounceNormal(double prevVx, double prevVy, double vx, double vy) { return Math.Atan2(vy - prevVy, vx - prevVx); }
        // ---- parryMagicHit (Core Simulation.ParryMagicHitFx: BossFx "parryMagicHit", x, y, 72 = the web _addBoom radius): splash = 45 + r*3 = 69 px for r 8 ----
        public const double MagicSplashR = 69, MagicShotR = 8, MagicCoreH = .35;
        public const int MagicDropMin = 4, MagicDropMax = 6, MagicDecalHold = 120;

        // ---- contact plans ----
        public sealed class Plan
        {
            public AnglerWaterKind Kind;
            public string Sheet;                    // crown / split sheet name, never an Ice_* recolour
            public int Frames, Life;                // flip-book frames over Life ticks
            public double ContentWidth;             // what the G1 table sizes: body width in web px
            public double CellWidth;                // draw width of the 256 px cell so the content has ContentWidth
            public double CoreDiameter; public int CoreTicks;
            public int DropMin, DropMax, DropLifeMin, DropLifeMax;
            public int DecalHold, DecalFade; public double DecalPeak, DecalWidth;
            public bool Rotates;                    // crown: travel direction; split: the same axis (the fan opens backwards, toward the boss)
        }
        public const double CoreRatio = .5;         // core 0.5 H, 5 ticks (PBZ R1)
        public const int CoreTicksFixed = 5;
        public const double CrownContentH = 2.75, SplitContentH = 2.0, ExpireScale = .5;      // 2.5..3 H, 2 H wide, half size
        public const int ContactLife = 15;          // 0.25 s
        public const int DecalHoldTicks = 210, DecalFadeTicks = 60, ExpireDecalHoldTicks = 120, DecalCapacity = 8;
        public const double DecalPeakAlpha = .35;
        public static Plan MakePlan(AnglerWaterKind kind)
        {
            var p = new Plan { Kind = kind, Life = ContactLife, Rotates = true, CoreTicks = CoreTicksFixed, CoreDiameter = CoreRatio * H, DecalPeak = DecalPeakAlpha, DecalFade = DecalFadeTicks,
                DropLifeMin = 18, DropLifeMax = 30 };   // 0.3..0.5 s
            if (kind == AnglerWaterKind.Bounce)
            {
                p.Sheet = CrownSheet; p.Frames = CrownFrames; p.Life = BounceLife; p.ContentWidth = CrownContentH * H * BounceScale; p.CellWidth = p.ContentWidth * CellPx / CrownContentPx;
                p.CoreDiameter = 0; p.CoreTicks = 0; p.DropMin = p.DropMax = 0; p.DecalHold = 0; p.DecalWidth = 0; p.DecalPeak = 0;
            }
            else if (kind == AnglerWaterKind.MagicHit)
            {
                p.Sheet = CrownSheet; p.Frames = CrownFrames; p.ContentWidth = MagicSplashR * 2; p.CellWidth = p.ContentWidth * CellPx / CrownContentPx;
                p.CoreDiameter = MagicCoreH * H; p.DropMin = MagicDropMin; p.DropMax = MagicDropMax;
                p.DecalHold = MagicDecalHold; p.DecalWidth = 1.6 * H * p.ContentWidth / (CrownContentH * H);
            }
            else if (kind == AnglerWaterKind.Parry)
            {
                p.Sheet = SplitSheet; p.Frames = SplitFrames; p.ContentWidth = SplitContentH * H; p.CellWidth = p.ContentWidth * CellPx / SplitContentWidthPx; p.DropMin = 6; p.DropMax = 10; p.DecalHold = 0; p.DecalWidth = 0; p.DecalPeak = 0;
            }
            else
            {
                double s = kind == AnglerWaterKind.Expire ? ExpireScale : 1;
                p.Sheet = CrownSheet; p.Frames = CrownFrames; p.ContentWidth = CrownContentH * H * s; p.CellWidth = p.ContentWidth * CellPx / CrownContentPx;
                p.DecalWidth = 1.6 * H * s; p.DecalHold = kind == AnglerWaterKind.Expire ? ExpireDecalHoldTicks : DecalHoldTicks;
                if (kind == AnglerWaterKind.Expire) { p.CoreDiameter = 0; p.CoreTicks = 0; p.DropMin = p.DropMax = 0; }
                else { p.DropMin = 8; p.DropMax = 12; }
            }
            return p;
        }
        public static int CrownFrame(Plan p, double age) { return age < 0 || age >= p.Life ? -1 : Math.Min(p.Frames - 1, (int)(age * p.Frames / p.Life)); }
        public static double CoreAlpha(Plan p, double age) { return p.CoreTicks <= 0 || age < 0 || age >= p.CoreTicks ? 0 : 1 - age / p.CoreTicks; }

        // 8..12 streaks thrown forward of the contact (+-35 degrees of the travel direction), gravity, vanishing at the ground
        public static Drop[] ContactDrops(Plan p, int seed, double ang)
        {
            if (p.DropMax <= 0) return new Drop[0];
            var rng = new Random(seed); int n = p.DropMin + rng.Next(p.DropMax - p.DropMin + 1); var drops = new Drop[n];
            for (int i = 0; i < n; i++)
            {
                double a = ang + (rng.NextDouble() * 2 - 1) * 35 * Math.PI / 180, speed = 2.2 + rng.NextDouble() * 2.6, g = .26;
                double z0 = 8 + rng.NextDouble() * 10, vz = 2.4 + rng.NextDouble() * 1.8; int fall = FallTicks(z0, vz, g), life = p.DropLifeMin + rng.Next(p.DropLifeMax - p.DropLifeMin + 1);
                drops[i] = new Drop { Dx = Math.Cos(a) * 6, Dy = Math.Sin(a) * 6, Vx = Math.Cos(a) * speed, Vy = Math.Sin(a) * speed, Z0 = z0, Vz = vz, G = g,
                    Width = DropMinWidth + rng.NextDouble() * 1.0, Length = DropMinLength + rng.NextDouble() * 6, Life = Math.Min(life, fall) };
            }
            return drops;
        }

        public static double DecalAlpha(double age, int hold, int fade, double peak)
        {
            if (age < 0 || hold <= 0) return 0;
            return age <= hold ? peak : age < hold + fade ? peak * (1 - (age - hold) / fade) : 0;
        }
    }

    // The eight-slot pool of wet ground marks (like CombatBloodDecals): the oldest slot is reused.
    public sealed class AnglerWetDecals
    {
        public sealed class Stamp { public int Born, Hold, Fade; public float X, Y, Width; public double Angle, Peak; public bool Active; public long Serial; }
        public readonly Stamp[] Slots = new Stamp[AnglerWater.DecalCapacity]; long serial;
        public AnglerWetDecals() { for (int i = 0; i < Slots.Length; i++) Slots[i] = new Stamp(); }
        public int Add(int tick, float x, float y, double angle, AnglerWater.Plan plan)
        {
            if (plan.DecalHold <= 0) return -1;
            int index = 0; long oldest = long.MaxValue;
            for (int i = 0; i < Slots.Length; i++)
            {
                if (!Slots[i].Active || Alpha(i, tick) <= 0) { index = i; oldest = long.MinValue; break; }
                if (Slots[i].Serial < oldest) { oldest = Slots[i].Serial; index = i; }
            }
            var s = Slots[index]; s.Born = tick; s.X = x; s.Y = y; s.Angle = angle; s.Width = (float)plan.DecalWidth; s.Hold = plan.DecalHold; s.Fade = plan.DecalFade; s.Peak = plan.DecalPeak; s.Active = true; s.Serial = ++serial;
            return index;
        }
        public double Alpha(int index, int tick) { var s = Slots[index]; return s.Active ? AnglerWater.DecalAlpha(tick - s.Born, s.Hold, s.Fade, s.Peak) : 0; }
        public int ActiveCount(int tick) { int n = 0; for (int i = 0; i < Slots.Length; i++) if (Alpha(i, tick) > 0) n++; return n; }
        public void Reset() { foreach (var s in Slots) s.Active = false; serial = 0; }
    }

    // Follows the angler orbs of the druid projectile list between frames and says what happened to them. The Core only removes a bullet (Active = false), it raises no
    // event for it, so the fate is read from where it ended: removed near the player and the player lost HP = hit; removed near the player and no HP was lost = blocked / parried
    // (a Q parry also leaves five new Friendly ParryMagicShot shots at the same spot = split, read from them); removed anywhere else (wall, life) = expired.
    // The five split shots are followed too: a wall bounce is read from Bounces going up with the velocity mirrored, and BossFx "parryMagicHit" (NoteMagicHit) becomes a hit effect.
    public sealed class AnglerWaterTracker
    {
        public sealed class Orb { public BossProjectile P; public int Born; public double Ang; }
        public sealed class Shot { public BossProjectile P; public int Born; public double Vx, Vy; public int Bounces; public double X, Y; }
        public struct Event { public AnglerWaterKind Kind; public bool Launch, Split; public double X, Y, Angle, Radius; public double[] Dirs; public int Tick; }
        struct PendingHit { public double X, Y, R; }
        public readonly List<Orb> Orbs = new List<Orb>();
        public readonly List<Shot> Shots = new List<Shot>();
        public readonly List<Event> Events = new List<Event>();
        readonly List<PendingHit> pending = new List<PendingHit>();
        int lastTick = int.MinValue, lastHurt;
        public const double LifePerTick = .667, SplitFindReach = 30, HitMatchReach = 40;
        public static int AgeOf(BossProjectile p) { return (int)Math.Round((p.Ml - p.Life) / LifePerTick); }
        public static bool NearPlayer(double x, double y, double px, double py, double pr, double sz)
        {
            double dx = x - px, dy = y - py, reach = pr + (sz != 0 ? sz : 48) + 90 + 18;   // Core big-ball Q parry radius (ParryReflect pParryR = PR + Sz + 90; contact PR + Sz is inside it) plus one step of the spawned 18 px/tick orb
            return dx * dx + dy * dy <= reach * reach;
        }
        public void Reset() { Orbs.Clear(); Shots.Clear(); Events.Clear(); pending.Clear(); lastTick = int.MinValue; }
        /// <summary>The BossFx "parryMagicHit" arguments (x, y, radius); turned into an event by the next Update.</summary>
        public void NoteMagicHit(double x, double y, double r)
        {
            for (int i = 0; i < pending.Count; i++) { double dx = pending[i].X - x, dy = pending[i].Y - y; if (dx * dx + dy * dy < 36) return; }   // two anglers touched by one shot: one effect
            if (pending.Count < 16) pending.Add(new PendingHit { X = x, Y = y, R = r });
        }

        public void Update(IList<BossProjectile> list, int tick, double px, double py, double pr, int hurtCount)
        {
            if (tick < lastTick) Reset();
            lastTick = tick;
            // split shots: bounce reading for the known ones, the new ones are kept for the split reading below
            var fresh = new List<BossProjectile>();
            for (int i = 0; i < list.Count; i++)
            {
                var p = list[i]; if (!AnglerWater.IsParrySplitShot(p)) continue;
                Shot known = null; for (int k = 0; k < Shots.Count; k++) if (Shots[k].P == p) { known = Shots[k]; break; }
                if (known == null) { fresh.Add(p); continue; }
                if (AnglerWater.IsBounce(known.Vx, known.Vy, p.Vx, p.Vy, known.Bounces, p.Bounces))
                    Events.Add(new Event { Kind = AnglerWaterKind.Bounce, X = p.X, Y = p.Y, Angle = AnglerWater.BounceNormal(known.Vx, known.Vy, p.Vx, p.Vy), Tick = tick });
                known.Vx = p.Vx; known.Vy = p.Vy; known.Bounces = p.Bounces; known.X = p.X; known.Y = p.Y;
            }
            for (int i = Orbs.Count - 1; i >= 0; i--)
            {
                var o = Orbs[i]; var p = o.P; bool inList = list.Contains(p);
                if (inList && p.Active && !p.Friendly) { o.Ang = Math.Atan2(p.Vy, p.Vx); continue; }
                Orbs.RemoveAt(i);
                if (inList && p.Friendly) continue;                                               // the Core no longer reflects this ball (Q splits it, E does not reflect): nothing to read
                if (p.Active) continue;                                                           // the list was cleared (restart / stage change): no effect
                bool near = NearPlayer(p.X, p.Y, px, py, pr, p.Sz);
                var ev = new Event { Kind = near ? (hurtCount > lastHurt ? AnglerWaterKind.Hit : AnglerWaterKind.Parry) : AnglerWaterKind.Expire, X = p.X, Y = p.Y, Angle = o.Ang, Tick = tick };
                if (ev.Kind == AnglerWaterKind.Parry)
                {   // Q parry: five fresh shots at the contact (they start 12 px out)
                    var dirs = new List<double>();
                    foreach (var f in fresh) { double dx = f.X - p.X, dy = f.Y - p.Y; if (dx * dx + dy * dy <= SplitFindReach * SplitFindReach) dirs.Add(Math.Atan2(f.Vy, f.Vx)); }
                    if (dirs.Count > 0) { ev.Split = true; ev.Dirs = dirs.ToArray(); }
                }
                Events.Add(ev);
            }
            for (int i = 0; i < list.Count; i++)
            {
                var p = list[i]; if (!AnglerWater.IsAnglerOrb(p)) continue;
                bool known = false; for (int k = 0; k < Orbs.Count; k++) if (Orbs[k].P == p) { known = true; break; }
                if (known) continue;
                int age = AgeOf(p); Orbs.Add(new Orb { P = p, Born = tick - age, Ang = Math.Atan2(p.Vy, p.Vx) });
                if (age <= 2) Events.Add(new Event { Launch = true, X = p.X, Y = p.Y, Angle = Math.Atan2(p.Vy, p.Vx), Tick = tick });   // a shot first seen at birth: launch spray
            }
            // parryMagicHit: the shot that touched is still in Shots (it is dropped just below); only water (El 2) shots, an unmatched hit is drawn as water (the only 1-1 element)
            foreach (var h in pending)
            {
                Shot best = null; double bd = HitMatchReach * HitMatchReach;
                foreach (var s in Shots) { double dx = s.X - h.X, dy = s.Y - h.Y, d = dx * dx + dy * dy; if (d <= bd) { bd = d; best = s; } }
                if (best != null && best.P.El != 2) continue;
                Events.Add(new Event { Kind = AnglerWaterKind.MagicHit, X = h.X, Y = h.Y, Radius = h.R, Angle = best != null ? Math.Atan2(best.Vy, best.Vx) : 0, Tick = tick });
            }
            pending.Clear();
            for (int i = Shots.Count - 1; i >= 0; i--) if (!list.Contains(Shots[i].P) || !AnglerWater.IsParrySplitShot(Shots[i].P)) Shots.RemoveAt(i);
            foreach (var f in fresh) Shots.Add(new Shot { P = f, Born = tick, Vx = f.Vx, Vy = f.Vy, Bounces = f.Bounces, X = f.X, Y = f.Y });
            lastHurt = hurtCount;
        }
    }
}
