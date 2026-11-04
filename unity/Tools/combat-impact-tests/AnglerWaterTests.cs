using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// U-VFX-14 angler water orb: pure calculation checks (no Unity, no art decode). Art facts (sheet size, frame occupancy, dropped frames 0/1, hashes) are checked by
// tools/vfx/import_angler_water.py --check-only, which run.cjs calls after these.
static partial class Program
{
    static string RepoRoot()
    {
        var d = new DirectoryInfo(AppContext.BaseDirectory);
        while (d != null && !Directory.Exists(Path.Combine(d.FullName, "unity", "Assets"))) d = d.Parent;
        return d == null ? null : d.FullName;
    }
    static int PngWidth(string path) { var b = File.ReadAllBytes(path); return (b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]; }
    static int PngHeight(string path) { var b = File.ReadAllBytes(path); return (b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]; }

    static BossProjectile AnglerShot(Action<BossProjectile> change = null)
    {
        var p = new BossProjectile { X = 500, Y = 400, Vx = 10, Vy = 0, Dmg = 50, El = 2, Life = 320, Ml = 320, Sz = 48, R = 20, ElemBall = true, Typed = true, Commit = true, Col = "#3388ff" };
        if (change != null) change(p); return p;
    }

    static void AnglerWaterChecks()
    {
        string root = RepoRoot();
        // ---- sheets: counts, dropped frames, png sizes ----
        Check(AnglerWater.OrbFrames == 24 && AnglerWater.OrbCols * AnglerWater.OrbRows == 24, "angler orb sheet 24 frames (6x4)");
        Check(AnglerWater.CrownFrames == 14 && AnglerWater.SplitFrames == 14, "angler crown / split 14 frames each");
        Check(AnglerWater.DroppedSourceFrames == 2 && AnglerWater.CrownCols * AnglerWater.CrownRows - AnglerWater.DroppedSourceFrames == AnglerWater.CrownFrames, "source frames 0 and 1 (star discs) dropped: 16 - 2 = 14");
        Check(AnglerWater.OrbFrame(0) == 0 && AnglerWater.OrbFrame(119) == 23 && AnglerWater.OrbFrame(120) == 0 && AnglerWater.OrbFrame(4) == 0 && AnglerWater.OrbFrame(5) == 1, "orb loop 24 frames over 120 ticks (2 s)");
        if (root != null)
        {
            string dir = Path.Combine(root, "unity", "Assets", "Exoduser", "Resources", "Art", "vfx", "field");
            foreach (var s in new[] { Tuple.Create(AnglerWater.OrbSheet, 1536, 1024), Tuple.Create(AnglerWater.CrownSheet, 1024, 1024), Tuple.Create(AnglerWater.SplitSheet, 1024, 1024) })
            {
                string f = Path.Combine(dir, s.Item1 + ".png");
                Check(File.Exists(f) && PngWidth(f) == s.Item2 && PngHeight(f) == s.Item3 && File.Exists(f + ".meta"), "angler sheet present with the 256 px cell grid " + s.Item1);
            }
            Check(!File.Exists(Path.Combine(dir, "water_muzzle.png")), "the FAILed muzzle sheet is not imported");
        }

        // ---- the same bullet as the web (fbEnergy) ----
        if (root != null)
        {
            string core = File.ReadAllText(Path.Combine(root, "unity", "Assets", "Exoduser", "Runtime", "Core", "Simulation.FieldBoss.cs"));
            var m = Regex.Match(core, @"void FieldBossFireEnergy.*?new ProjSpec \{(?<body>[^}]*)\}", RegexOptions.Singleline);
            Check(m.Success, "Core FieldBossFireEnergy spawn literal found");
            string lit = m.Groups["body"].Value;
            Check(Regex.IsMatch(lit, @"El = 2,") && Regex.IsMatch(lit, @"Life = 320, Ml = 320") && Regex.IsMatch(lit, @"Sz = 48, R = 20, ElemBall = true, Typed = true, Commit = true"), "angler orb predicate constants equal the Core spawn literal");
            string web = File.Exists(Path.Combine(root, "game.html")) ? File.ReadAllText(Path.Combine(root, "game.html")) : null;
            if (web != null)
            {
                var w = Regex.Match(web, @"function _fbFireEnergy\(fb\)\{.*?spawnProj\(\{(?<body>[^}]*)\}\)", RegexOptions.Singleline);
                Check(w.Success && Regex.IsMatch(w.Groups["body"].Value, @"el:EL\.I,.*life:320,ml:320,.*sz:48,r:20,elemBall:true,_typed:true,_commit:true,fbEnergy:true"), "web _fbFireEnergy shot (fbEnergy, EL.I, 320, sz 48, r 20) = the Core literal");
                Check(Regex.IsMatch(web, @"if\(p\.fbEnergy\)\{[^\n]*\n\s*if\(typeof _fbDrawFly==='function'&&_fbDrawFly\(p\)\)") && Regex.IsMatch(web, @"function _fbDrawFly\(p\)\{[^}]*?_drawKrakenWaterOrbClip\(p\)"), "web draws the kraken water orb clip for fbEnergy shots only");
            }
        }
        Check(AnglerWater.IsAnglerOrb(AnglerShot()), "Core angler shot is the water orb");
        Check(!AnglerWater.IsAnglerOrb(AnglerShot(p => p.Friendly = true)) && !AnglerWater.IsAnglerOrb(AnglerShot(p => p.Active = false)) && !AnglerWater.IsAnglerOrb(AnglerShot(p => p.DruidPoison = true)) &&
              !AnglerWater.IsAnglerOrb(AnglerShot(p => p.Mine = true)) && !AnglerWater.IsAnglerOrb(AnglerShot(p => p.Sz = 18)) && !AnglerWater.IsAnglerOrb(AnglerShot(p => p.El = 1)) &&
              !AnglerWater.IsAnglerOrb(AnglerShot(p => p.ElemBall = false)) && !AnglerWater.IsAnglerOrb(AnglerShot(p => p.Ml = 400)) && !AnglerWater.IsAnglerOrb(null), "other bullets are not the water orb");
        Check(Math.Abs(AnglerWater.BodyBox(48) - 254.4) < 1e-9 && AnglerWater.BodyBox(1) == 96, "orb box = the element-orb box max(96, sz*5.3), Core Sz/R untouched");

        // ---- flight tail ----
        double body = AnglerWater.OrbBodyDiameter(AnglerWater.BodyBox(48));
        bool tailOk = true; for (int a = 0; a < 400; a++) { double l = AnglerWater.TailLength(body, a); tailOk &= l >= body * 1.5 - 1e-9 && l <= body * 2.0 + 1e-9; }
        Check(tailOk, "ribbon tail 1.5..2 body diameters long at every age");
        Check(AnglerWater.TailMaxAlpha <= .5 && AnglerWater.TailWidth(body) < body, "tail alpha <= .5 and narrower than the body");
        int dropTicks = 0; for (int a = 0; a < 120; a++) if (AnglerWater.TailDropTick(a)) dropTicks++;
        Check(dropTicks == 19 && AnglerWater.TailDropTick(6) && !AnglerWater.TailDropTick(0) && !AnglerWater.TailDropTick(7), "tail drops every 6 ticks");
        bool tailDrops = true;
        for (int seed = 0; seed < 300; seed++)
        {
            var ds = AnglerWater.TailDrops(seed, seed * .1, body); tailDrops &= ds.Length >= 1 && ds.Length <= 2;
            foreach (var d in ds)
            {
                tailDrops &= d.Width >= 3 && d.Length >= 10 && d.Length / d.Width >= 2.5 && d.G > 0 && d.Z(d.Life) <= 0 && d.Z(d.Life - 1) > 0 && d.Alive(d.Life - 1) && !d.Alive(d.Life) && !d.Alive(d.Life + 5);
                tailDrops &= AnglerWater.FallTicks(d.Z0, d.Vz, d.G) == d.Life;
            }
        }
        Check(tailDrops, "1..2 tail streaks >= 3x10 px, ratio >= 2.5, fall under gravity and vanish at the ground (no wet dot)");

        // ---- charge ----
        Check(Simulation.FieldBossEnergyCharge == 180 && AnglerWater.ChargeTicks == 60, "charge = the last 60 of the Core's 180 ticks");
        Check(AnglerWater.ChargeProgress(180, false, 0) == 0 && AnglerWater.ChargeProgress(61, false, 0) == 0 && AnglerWater.ChargeProgress(60, false, 0) == 0 && AnglerWater.ChargeProgress(0, false, 0) == 0 &&
              AnglerWater.ChargeProgress(30, false, 0) == .5 && AnglerWater.ChargeProgress(1, false, 0) > .98 && AnglerWater.ChargeProgress(30, true, 0) == 0 && AnglerWater.ChargeProgress(30, false, 10) == 0, "charge grows 0 -> 1 over the last 60 ticks, nothing while hidden / teleporting");
        bool grow = true; for (int e = 59; e >= 1; e--) grow &= AnglerWater.ChargeProgress(e, false, 0) > AnglerWater.ChargeProgress(e + 1, false, 0);
        Check(grow && Math.Abs(AnglerWater.ChargeSize(1, AnglerWater.BodyBox(48)) - AnglerWater.BodyBox(48)) < 1e-9 && AnglerWater.ChargeSize(0, 254) == 0, "charge size 0 -> body size, monotonic");

        // ---- launch spray ----
        bool launch = true;
        for (int seed = 0; seed < 300; seed++)
        {
            double ang = (seed % 13) * .5 - 3; var st = AnglerWater.LaunchStreaks(seed, ang); launch &= st.Length >= 5 && st.Length <= 7;
            foreach (var s in st)
            {
                launch &= Math.Abs(s.Angle - ang) <= 20 * Math.PI / 180 + 1e-9 && s.Length >= .4 * AnglerWater.H - 1e-9 && s.Length <= .8 * AnglerWater.H + 1e-9;
                double t0, h0; AnglerWater.StreakSpan(s, 0, out t0, out h0); double t8, h8; AnglerWater.StreakSpan(s, 8, out t8, out h8); launch &= h0 > 0 && h8 > t8 && h8 - t8 >= s.Width;
            }
        }
        Check(launch && AnglerWater.LaunchLife == 9 && AnglerWater.StreakAlpha(0) > 0 && AnglerWater.StreakAlpha(9) == 0 && AnglerWater.StreakAlpha(-1) == 0, "launch: 5..7 streaks within +-20 degrees, 0.4..0.8 H, 9 ticks (0.15 s), no sheet");

        // ---- contact plans ----
        var hit = AnglerWater.MakePlan(AnglerWaterKind.Hit); var par = AnglerWater.MakePlan(AnglerWaterKind.Parry); var exp = AnglerWater.MakePlan(AnglerWaterKind.Expire);
        Check(hit.CoreDiameter == .5 * AnglerWater.H && hit.CoreTicks == 5 && par.CoreTicks == 5 && par.CoreDiameter == hit.CoreDiameter, "core 0.5 H, 5 ticks (hit and parry)");
        Check(AnglerWater.CoreAlpha(hit, 0) == 1 && AnglerWater.CoreAlpha(hit, 4) > 0 && AnglerWater.CoreAlpha(hit, 5) == 0 && AnglerWater.CoreAlpha(hit, -1) == 0 && AnglerWater.CoreAlpha(exp, 0) == 0, "core alpha lives exactly 5 ticks, the vanish has none");
        Check(hit.Sheet == "water_hit_crown" && hit.Frames == 14 && hit.Life == 15 && hit.ContentWidth >= 2.5 * AnglerWater.H && hit.ContentWidth <= 3 * AnglerWater.H, "player hit: crown 14 frames over 0.25 s, 2.5..3 H wide");
        Check(Math.Abs(hit.CellWidth * AnglerWater.CrownContentPx / AnglerWater.CellPx - hit.ContentWidth) < 1e-9, "crown cell is scaled so its content (not the cell) has the G1 size");
        Check(par.Sheet == "water_parry_split" && par.Frames == 14 && par.Life == 15 && Math.Abs(par.ContentWidth - 2 * AnglerWater.H) < 1e-9 && Math.Abs(par.CellWidth * AnglerWater.SplitContentWidthPx / AnglerWater.CellPx - par.ContentWidth) < 1e-9, "parry: split 14 frames, 0.25 s, 2 H wide");
        Check(exp.Sheet == hit.Sheet && Math.Abs(exp.ContentWidth - hit.ContentWidth * .5) < 1e-9 && exp.Life == hit.Life && exp.DropMax == 0, "vanish: half-size crown, no streaks");
        Check(AnglerWater.CrownFrame(hit, 0) == 0 && AnglerWater.CrownFrame(hit, 14.99) == 13 && AnglerWater.CrownFrame(hit, 15) == -1 && AnglerWater.CrownFrame(hit, -1) == -1 && AnglerWater.CrownFrame(par, 7) >= 0, "crown plays frames 0..13 exactly once");
        Check(!hit.Sheet.StartsWith("Ice_") && !par.Sheet.StartsWith("Ice_") && !exp.Sheet.StartsWith("Ice_") && !par.Sheet.Contains("MistSmoke"), "angler plans never pick an ice recolour sheet");

        bool drops = true;
        for (int seed = 0; seed < 400; seed++)
        {
            double ang = seed * .37 - 3; var ds = AnglerWater.ContactDrops(hit, seed, ang); drops &= ds.Length >= 8 && ds.Length <= 12;
            foreach (var d in ds)
            {
                double dir = Math.Atan2(d.Vy, d.Vx), diff = Math.Atan2(Math.Sin(dir - ang), Math.Cos(dir - ang));
                drops &= Math.Abs(diff) <= 35 * Math.PI / 180 + 1e-9 && d.Life >= 18 && d.Life <= 30 && d.G > 0 && d.Width >= 3 && d.Length >= 10 && d.Length / d.Width >= 2.5 && d.Alive(0) && !d.Alive(d.Life);
                drops &= d.Z(0) > 0 && d.Z(d.Life + 40) < 0;
            }
            var pd = AnglerWater.ContactDrops(par, seed, ang); drops &= pd.Length >= 6 && pd.Length <= 10 && AnglerWater.ContactDrops(exp, seed, ang).Length == 0;
        }
        Check(drops, "hit: 8..12 streaks within +-35 degrees, 0.3..0.5 s, gravity, >= 3x10 px; parry has some, vanish none");

        // ---- wet marks ----
        Check(hit.DecalHold == 210 && hit.DecalFade == 60 && hit.DecalPeak <= .35 && exp.DecalHold == 120 && exp.DecalPeak <= .35 && par.DecalHold == 0, "wet mark: 3.5 s hold + 1 s fade, alpha <= .35; vanish 2 s hold; parry none");
        Check(AnglerWater.DecalAlpha(0, 210, 60, .35) == .35 && AnglerWater.DecalAlpha(210, 210, 60, .35) == .35 && Math.Abs(AnglerWater.DecalAlpha(240, 210, 60, .35) - .175) < 1e-9 && AnglerWater.DecalAlpha(270, 210, 60, .35) == 0 && AnglerWater.DecalAlpha(-1, 210, 60, .35) == 0, "wet mark hold then linear 1 s fade");
        var pool = new AnglerWetDecals(); Check(AnglerWater.DecalCapacity == 8 && pool.Slots.Length == 8, "wet mark pool holds 8");
        int firstSlot = pool.Add(0, 10, 10, 0, hit);
        for (int i = 1; i < 20; i++) pool.Add(i, 10 + i, 10, 0, hit);
        Check(pool.ActiveCount(20) == 8 && pool.ActiveCount(20) <= AnglerWater.DecalCapacity && pool.Slots.Min(s => s.Born) >= 12, "20 stamps in 20 ticks keep only the newest 8");
        Check(pool.Add(5, 0, 0, 0, par) == -1, "a parry leaves no wet mark");
        Check(pool.ActiveCount(20 + 270 + 1) == 0 && firstSlot >= 0, "all marks gone 4.5 s after the last stamp");
        var pool2 = new AnglerWetDecals(); for (int i = 0; i < 8; i++) pool2.Add(0, i, 0, 0, exp); pool2.Add(200, 99, 0, 0, hit);
        Check(pool2.Slots.Count(s => s.Active && s.Born == 200) == 1 && pool2.ActiveCount(200) == 1, "an expired slot is reused first");

        // ---- parry path: no ice recolour ----
        foreach (int step in new[] { 0, 1 })
        {
            var e = new FeedbackEvent { Kind = FeedbackKind.Parry, Step = step, Source = null, SampleKey = null, MeleeParry = false, X = 1, Y = 2 };   // what ApplyParrySuccess queues for a non-WaterBean bullet
            Check(!CombatImpactTimeline.Plan(e).Any(c => c.Sheet.StartsWith("Ice_")), "angler orb parry event (Source null) picks no Ice_* water recolour sheet, step " + step);
        }
        Check(CombatImpactTimeline.Plan(new FeedbackEvent { Kind = FeedbackKind.Parry, Source = "waterBean", Step = 1 }).Any(c => c.Sheet == "Ice_ImpactIce_Sheet_water"), "the water bean parry keeps its own recolour sheet");

        // ---- tracker: what happened to the orb ----
        {
            var list = new List<BossProjectile>(); var tr = new AnglerWaterTracker();
            var orb = AnglerShot(); var other = AnglerShot(p => { p.Sz = 18; p.El = 1; }); list.Add(orb); list.Add(other);
            tr.Update(list, 100, 0, 0, 16, 0);
            Check(tr.Orbs.Count == 1 && tr.Orbs[0].P == orb && tr.Events.Count == 1 && tr.Events[0].Launch && tr.Orbs[0].Born == 100 && Math.Abs(tr.Events[0].Angle) < 1e-9, "a fresh angler shot is tracked and sprays once, other bullets are ignored");
            tr.Events.Clear(); tr.Update(list, 101, 0, 0, 16, 0); Check(tr.Events.Count == 0 && tr.Orbs.Count == 1, "no second spray");
            var late = AnglerShot(p => p.Life = 100); var tr2 = new AnglerWaterTracker(); tr2.Update(new List<BossProjectile> { late }, 5, 0, 0, 16, 0);
            Check(tr2.Orbs.Count == 1 && tr2.Events.Count == 0, "a shot first seen mid-flight is tracked without a spray");
            // hit: removed next to the player and HP was lost
            orb.X = 40; orb.Y = 0; orb.Vx = 10; orb.Vy = 0; orb.Active = false; list.Remove(orb);
            tr.Update(list, 102, 100, 0, 16, 1);
            Check(tr.Events.Count == 1 && tr.Events[0].Kind == AnglerWaterKind.Hit && !tr.Events[0].Launch && tr.Orbs.Count == 0 && Math.Abs(tr.Events[0].X - 40) < 1e-9, "removed at the player with HP lost = hit");
            // block / parry: removed next to the player, no HP lost
            var o2 = AnglerShot(); var l2 = new List<BossProjectile> { o2 }; var tr3 = new AnglerWaterTracker(); tr3.Update(l2, 10, 0, 0, 16, 3); tr3.Events.Clear();
            o2.Active = false; l2.Clear(); o2.X = 10; o2.Y = 10; tr3.Update(l2, 11, 0, 0, 16, 3);
            Check(tr3.Events.Count == 1 && tr3.Events[0].Kind == AnglerWaterKind.Parry, "removed at the player with no HP lost = blocked / parried");
            // wall / end of life: far from the player
            var o3 = AnglerShot(); var l3 = new List<BossProjectile> { o3 }; var tr4 = new AnglerWaterTracker(); tr4.Update(l3, 10, 0, 0, 16, 0); tr4.Events.Clear();
            o3.Active = false; l3.Clear(); o3.X = 900; tr4.Update(l3, 11, 0, 0, 16, 0);
            Check(tr4.Events.Count == 1 && tr4.Events[0].Kind == AnglerWaterKind.Expire, "removed far from the player = vanish");
            // reflected: stays in the list, turned friendly
            var o4 = AnglerShot(); var l4 = new List<BossProjectile> { o4 }; var tr5 = new AnglerWaterTracker(); tr5.Update(l4, 10, 0, 0, 16, 0); tr5.Events.Clear();
            o4.Friendly = true; o4.BlueBean = true; tr5.Update(l4, 11, 0, 0, 16, 0);
            Check(tr5.Events.Count == 1 && tr5.Events[0].Kind == AnglerWaterKind.Parry && tr5.Orbs.Count == 0, "turned friendly in the list = parried back, no longer an orb");
            tr5.Events.Clear(); tr5.Update(l4, 12, 0, 0, 16, 0); Check(tr5.Events.Count == 0, "the reflected blue bean is left to its old drawing");
            // list cleared by a restart
            var o5 = AnglerShot(); var l5 = new List<BossProjectile> { o5 }; var tr6 = new AnglerWaterTracker(); tr6.Update(l5, 10, 0, 0, 16, 0); tr6.Events.Clear();
            l5.Clear(); tr6.Update(l5, 11, 0, 0, 16, 0); Check(tr6.Events.Count == 0 && tr6.Orbs.Count == 0, "a cleared list makes no effect");
            var o6 = AnglerShot(); var l6 = new List<BossProjectile> { o6 }; var tr7 = new AnglerWaterTracker(); tr7.Update(l6, 500, 0, 0, 16, 0); tr7.Events.Clear();
            tr7.Update(l6, 3, 0, 0, 16, 0); Check(tr7.Orbs.Count == 1 && tr7.Orbs[0].Born == 3 && tr7.Events.Count == 1 && tr7.Events[0].Launch, "a tick going backwards resets the tracker and re-reads the list");
        }
    }
}
