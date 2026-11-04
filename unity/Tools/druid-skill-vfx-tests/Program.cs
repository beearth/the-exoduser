using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// Druid slam body VFX (G1 2 (2), textured rework 11-04): the numbers of DruidSlamVfxTimeline + DruidEarthSheetTable against the Core facts and the G1 table. No Unity, no windows, no sound.
// args[0] = repo root (source / asset checks).
static partial class Program
{
    static int checks, bad; static string repo = "";
    static void Check(bool value, string name) { checks++; if (!value) { bad++; Console.WriteLine("FAIL " + name); } }
    static bool Near(double a, double b, double tol) { return Math.Abs(a - b) <= tol; }
    const double Eps = 1e-9;
    static string Src(string rel) { return File.ReadAllText(Path.Combine(repo, rel)); }
    const string VfxDir = "unity/Assets/Exoduser/Runtime/Vfx/";

    static int Main(string[] args)
    {
        repo = args.Length > 0 ? args[0] : "";
        // ---- Core facts the timeline is tied to ----
        Check(DruidSlamVfxTimeline.ActTicks == 6 && DruidSlamVfxTimeline.ActTicks == DruidRemodelData.SlamActive, "act length = Core SlamActive 6");
        Check(DruidSlamVfxTimeline.HitRadius == 260 && DruidSlamVfxTimeline.HitRadius == DruidRemodelData.SlamRadius, "hit radius = Core SlamRadius 260");

        // ---- colours: only the contact core keeps a colour table (the earth sheets carry their own) ----
        Check(DruidSlamVfxTimeline.CoreHot == 0xFFF4D0 && DruidSlamVfxTimeline.CoreEdge == 0xD49A5C, "core colours #fff4d0 -> #d49a5c");
        Check(DruidSlamVfxTimeline.Lerp(0xFFF4D0, 0xD49A5C, 0) == 0xFFF4D0 && DruidSlamVfxTimeline.Lerp(0xFFF4D0, 0xD49A5C, 1) == 0xD49A5C, "colour lerp ends");

        // ---- sheet table (generated from the PNGs) ----
        Check(DruidEarthSheetTable.Frames == 24 && DruidEarthSheetTable.Cols * DruidEarthSheetTable.Rows == 24 && DruidEarthSheetTable.Width.Length == 24 && DruidEarthSheetTable.CenterX.Length == 24, "dust sheet table: 6x4 = 24 frames");
        Check(DruidEarthSheetTable.Width.All(w => w > 0 && w < 1) && DruidEarthSheetTable.Width[0] < DruidEarthSheetTable.Width[3], "dust sheet table: widths are fractions, frame 0 is the smallest puff");
        Check(DruidEarthSheetTable.CrackMaxR.Length == DruidSlamVfxTimeline.CrackVariants && DruidEarthSheetTable.GougeX1.Length == DruidSlashVfxTimeline.GougeVariants && DruidEarthSheetTable.SmearX1.Length == DruidSlashVfxTimeline.RibbonVariants, "sheet table: 4 crack, 3 gouge, 3 smear variants");

        // ---- shock dust: the visible edge of the sheet frame played at +6 = the hit circle (horizontal radius 260 +-8 Core px) ----
        Check(Near(DruidSlamVfxTimeline.DustMainRadius(6), 260, 8), "dust edge radius 260 +-8 Core px on the damage tick (act +6)");
        Check(Near(DruidSlamVfxTimeline.DustMainSize * DruidEarthSheetTable.Width[DruidSlamVfxTimeline.DustFrame(6, DruidSlamVfxTimeline.DustMainLife)], 520, 16), "dust visible width 520 +-16 Core px at +6 (size x table)");
        bool before = true, after = true; double prevR = -1; bool grow = true;
        for (int a = 0; a <= 5; a++) { double r = DruidSlamVfxTimeline.DustMainRadius(a); if (r > 260 + 8) before = false; if (r < prevR - Eps) grow = false; prevR = r; }
        for (int a = 6; a < 36; a++) { double r = DruidSlamVfxTimeline.DustMainRadius(a); if (r > 300) after = false; }
        Check(before && grow, "dust edge only grows and never passes the circle before +6");
        Check(after, "dust edge stays <= 300 after +6 (a little past the circle, never a screen-wide cloud)");
        Check(DruidSlamVfxTimeline.DustMainRadius(0) < 130, "dust starts as a small puff at act 0");
        bool frameRange = true; for (double age = -3; age < 60; age += .25) for (int life = 26; life <= 40; life += 2) { int f = DruidSlamVfxTimeline.DustFrame(age, life); if (f < 0 || f > 23) frameRange = false; }
        Check(frameRange, "dust frame index always within 0..23");
        bool mainAlpha = true; for (double a = -2; a < 40; a += .25) { double al = DruidSlamVfxTimeline.DustMainAlpha(a); if (al < 0 || al > .6 + Eps) mainAlpha = false; }
        Check(mainAlpha && DruidSlamVfxTimeline.DustMainAlpha(DruidSlamVfxTimeline.DustMainLife) == 0 && DruidSlamVfxTimeline.DustMainAlpha(-1) == 0, "main dust alpha <= .6 and 0 outside its 36 ticks");
        Check(DruidSlamVfxTimeline.DustMainLife == 36, "main dust plays the 24 frames over 36 ticks (0.6 s)");

        // ---- rim dusts: 3 small bursts staggered +2..+5 ----
        bool ringOk = true, ringAlpha = true, ringStagger = true;
        for (int seed = -300; seed < 700; seed++)
        {
            var rd = DruidSlamVfxTimeline.RingDusts(seed); if (rd.Length != 3) ringOk = false;
            foreach (var d in rd)
            {
                if (d.SpawnAct < 2 || d.SpawnAct > 5) ringStagger = false;
                if (!Near(Math.Sqrt(d.X * d.X + d.Y * d.Y), 260 * .82, 1e-6)) ringOk = false;
                for (int age = -1; age <= d.Life + 1; age++) { double al = DruidSlamVfxTimeline.RingDustAlpha(d, age); if (al < 0 || al > .5 + Eps) ringAlpha = false; }
            }
            if (rd.Select(d => d.SpawnAct).Distinct().Count() != 3) ringStagger = false;
        }
        Check(ringOk, "3 rim dusts on the circle edge (r = .82 x 260)");
        Check(ringStagger, "rim dusts stagger over act +2..+5, one per tick");
        Check(ringAlpha, "rim dust alpha <= .5");

        // ---- crack decal: ground_crack_radial variant, scaled so the farthest crack pixel reaches r260 (diameter 520 +-8) ----
        for (int v = 0; v < DruidSlamVfxTimeline.CrackVariants; v++)
        {
            Check(Near(DruidSlamVfxTimeline.CrackReachFull(v) * 2, 520, 8), "crack decal diameter 520 +-8 at full reveal, variant " + v);
            Check(DruidSlamVfxTimeline.CrackSize(v) > 520 * .9 && DruidSlamVfxTimeline.CrackSize(v) < 520 * 1.6, "crack decal quad size sane, variant " + v);
        }
        Check(DruidSlamVfxTimeline.CrackReveal(0) == 0 && DruidSlamVfxTimeline.CrackReveal(-2) == 0 && DruidSlamVfxTimeline.CrackReveal(6) == 1 && DruidSlamVfxTimeline.CrackReveal(40) == 1, "crack reveal 0 at act 0, 1 at the damage tick (+6)");
        bool revMono = true, revRange = true; double pv = -1; for (double a = -1; a <= 10; a += .25) { double r = DruidSlamVfxTimeline.CrackReveal(a); if (r < pv - Eps) revMono = false; if (r < 0 || r > 1) revRange = false; pv = r; }
        Check(revMono && revRange, "crack reveal opens monotonically 0..1");
        var variants = new HashSet<int>(); bool angOk = true;
        for (int seed = -2000; seed < 2000; seed++) { int v = DruidSlamVfxTimeline.CrackVariant(seed); variants.Add(v); if (v < 0 || v > 3) angOk = false; double an = DruidSlamVfxTimeline.CrackAngle(seed); if (an < 0 || an >= Math.PI * 2) angOk = false; }
        Check(variants.Count == 4 && angOk, "crack variant 0..3 all occur over seeds; seed rotation in 0..2pi");
        Check(DruidSlamVfxTimeline.CrackVariant(77) == DruidSlamVfxTimeline.CrackVariant(77) && DruidSlamVfxTimeline.CrackAngle(77) == DruidSlamVfxTimeline.CrackAngle(77), "crack variant and angle are deterministic");

        // ---- crack decal life: 3.0 s, last 1 s fade, alpha <= .42 ----
        Check(DruidSlamVfxTimeline.DecalLife == 180 && DruidSlamVfxTimeline.DecalFade == 60, "decal 180 ticks (3.0 s), fade 60 ticks (1 s)");
        bool decalOk = true; for (double a = -1; a <= 200; a += .5) if (DruidSlamVfxTimeline.CrackAlpha(a) > .42 + Eps) decalOk = false;
        Check(decalOk, "decal alpha <= .42");
        Check(Near(DruidSlamVfxTimeline.CrackAlpha(60), .42, Eps) && Near(DruidSlamVfxTimeline.CrackAlpha(120), .42, Eps), "decal holds .42 until the last second");
        Check(DruidSlamVfxTimeline.CrackAlpha(185) > 0 && DruidSlamVfxTimeline.CrackAlpha(186) == 0 && DruidSlamVfxTimeline.CrackAlpha(300) == 0, "decal gone at act +186 (= +6 plus 180)");
        bool fade = true; double q = double.MaxValue; for (double a = 126; a < 186; a += 1) { double v = DruidSlamVfxTimeline.CrackAlpha(a); if (v > q + Eps) fade = false; q = v; }
        Check(fade && DruidSlamVfxTimeline.CrackAlpha(156) < .42 * .6, "decal fades steadily over the last 60 ticks");

        // ---- debris: debris_chunks stills ----
        var counts = new HashSet<int>(); bool dOk = true, sizeOk = true, lifeOk = true, spawnOk = true, perTickOk = true, alphaOk = true, travelOk = true, dirOk = true, frameOk = true, spinOk = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var sh = DruidSlamVfxTimeline.Debrises(seed); counts.Add(sh.Length);
            if (sh.Length < 9 || sh.Length > 11) dOk = false;
            var perTick = new int[7]; var angles = new List<double>();
            foreach (var s in sh)
            {
                if (s.Frame < 0 || s.Frame > 15) frameOk = false;
                double vmin = s.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMin, vmax = s.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMax;
                if (vmin < 14 - 1e-6 || vmax > 30 + 1e-6) sizeOk = false;
                if (s.Life < 12 || s.Life > 21) lifeOk = false;
                if (s.SpawnAct < 0 || s.SpawnAct > 6) spawnOk = false; else perTick[s.SpawnAct]++;
                if (DruidSlamVfxTimeline.DebrisTravel(s, 0) != 0 || DruidSlamVfxTimeline.DebrisTravel(s, s.Life) < 85 || DruidSlamVfxTimeline.DebrisTravel(s, s.Life) > 170.001) travelOk = false;
                for (int age = -2; age <= s.Life + 1; age++) { double al = DruidSlamVfxTimeline.DebrisAlpha(s, age); if (al < 0 || al > .85 + Eps) alphaOk = false; }
                if (DruidSlamVfxTimeline.DebrisAlpha(s, -1) != 0 || DruidSlamVfxTimeline.DebrisAlpha(s, s.Life) != 0) alphaOk = false;
                if (DruidSlamVfxTimeline.DebrisHeight(s, 0) != 0 || Math.Abs(DruidSlamVfxTimeline.DebrisHeight(s, s.Life)) > 1e-6) travelOk = false;
                if (Math.Abs(s.Spin) > .3 + Eps) spinOk = false;
                angles.Add(s.Angle);
            }
            var ring = DruidSlamVfxTimeline.RingDusts(seed); foreach (var r in ring) if (r.SpawnAct <= 6) perTick[r.SpawnAct]++;
            if (perTick.Max() > 2) perTickOk = false;   // debris + rim dusts together
            var wrapped = angles.Select(a => (a % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)).OrderBy(a => a).ToList(); double maxGap = 0;
            for (int i = 0; i < wrapped.Count; i++) maxGap = Math.Max(maxGap, (i + 1 < wrapped.Count ? wrapped[i + 1] : wrapped[0] + Math.PI * 2) - wrapped[i]);
            if (maxGap > 130 * Math.PI / 180) dirOk = false;
        }
        Check(dOk && counts.Min() == 9 && counts.Max() == 11 && counts.Count == 3, "debris count 9..11 over 2000 seeds (all three values occur)");
        Check(frameOk, "debris still index within 0..15 (debris_chunks 4x4)");
        Check(sizeOk, "debris visible size 14..30 screen px for every still (cell x measured fill .586 .. .797) [r2: was 10..24]");
        Check(lifeOk, "debris life 12..21 ticks (0.2..0.35 s)");
        Check(spawnOk, "debris spawn during act 0..+6");
        Check(perTickOk, "debris + rim dusts: at most 2 new body sprites per tick");
        Check(alphaOk, "debris alpha within 0..0.85 and 0 outside its life");
        Check(travelOk, "debris leave the centre, travel 90..170 Core px and land");
        Check(dirOk, "debris fly in all directions (no gap > 130 deg)");
        Check(spinOk, "debris spin <= .3 rad per tick");

        // ---- low dust (remainder) ----
        bool dustOk = true, dustLife = true, dustAlpha = true, dustTop = true, dustSize = true, spawnTick = true, concurrent = true, dustSpread = true, dustLate = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var d = DruidSlamVfxTimeline.Dust(seed); var sh = DruidSlamVfxTimeline.Debrises(seed); var ring = DruidSlamVfxTimeline.RingDusts(seed);
            if (d.Length != DruidSlamVfxTimeline.DustCount || d.Length != 4) dustOk = false;
            var perTick = new int[40]; foreach (var s in sh) perTick[s.SpawnAct]++; foreach (var r in ring) perTick[r.SpawnAct]++;
            foreach (var p in d)
            {
                if (p.Life < 30 || p.Life > 38) dustLife = false;
                if (p.Size < .6 * 131 - 1e-6 || p.Size > .9 * 131 + 1e-6) dustSize = false;
                if (Math.Sqrt(p.X * p.X + p.Y * p.Y) > 260 + Eps) dustSpread = false;
                if (p.SpawnAct < 7) dustLate = false;
                perTick[p.SpawnAct]++;
                for (int age = -1; age <= p.Life + 1; age++)
                {
                    double al = DruidSlamVfxTimeline.DustAlpha(p, age); if (al > .5 + Eps || al < 0) dustAlpha = false;
                    if (age >= 0 && age < p.Life && DruidSlamVfxTimeline.DustTop(p, age) > .4 * 131 + Eps) dustTop = false;
                }
            }
            if (perTick.Max() > 2) spawnTick = false;
            for (int act = 0; act <= 200; act++)
            {
                int alive = 0;
                foreach (var s in sh) if (DruidSlamVfxTimeline.DebrisAlpha(s, act - s.SpawnAct) > 0) alive++;
                foreach (var r in ring) if (DruidSlamVfxTimeline.RingDustAlpha(r, act - r.SpawnAct) > 0) alive++;
                foreach (var p in d) if (DruidSlamVfxTimeline.DustAlpha(p, act - p.SpawnAct) > 0) alive++;
                if (DruidSlamVfxTimeline.DustMainAlpha(act) > 0) alive++;
                if (act < DruidSlamVfxTimeline.CoreLife) alive++;   // the contact core
                if (alive > 24) concurrent = false;
            }
        }
        Check(dustOk, "4 low dust bursts (was 8 puffs: the 24-sprite cap now also holds the main and rim dusts)");
        Check(dustLife, "low dust life 30..38 ticks (0.5..0.63 s)");
        Check(dustSize, "low dust sprite 0.6..0.9 H");
        Check(dustAlpha, "low dust alpha <= .5");
        Check(dustTop, "low dust visible top <= 0.4 H (52.4 Core px)");
        Check(dustSpread, "low dust stays inside the hit circle");
        Check(dustLate, "low dust starts after the damage tick (act >= +7)");
        Check(spawnTick, "debris + rim + low dust: at most 2 new body sprites per tick");
        Check(concurrent, "never more than 24 sprites alive for one slam (core and main dust included)");

        // ---- contact core: HDR additive ----
        Check(DruidSlamVfxTimeline.CoreLife == 5 && DruidSlamVfxTimeline.CorePeakAct == 2, "core 5 ticks, peak at +2");
        Check(Near(DruidSlamVfxTimeline.CoreDiameter, 1.2 * 131, 1e-6), "core diameter 1.2 H (size unchanged)");
        Check(Near(DruidSlamVfxTimeline.CoreAlpha(0), 1, Eps), "core alpha 1 at act 0");
        Check(Near(DruidSlamVfxTimeline.CoreAlpha(1), .225, 1e-6), "core alpha .225 at 20 % of life");
        Check(DruidSlamVfxTimeline.CoreAlpha(5) == 0 && DruidSlamVfxTimeline.CoreAlpha(-1) == 0, "core gone after 5 ticks");
        bool coreMono = true; for (int a = 0; a < 4; a++) if (DruidSlamVfxTimeline.CoreAlpha(a + 1) > DruidSlamVfxTimeline.CoreAlpha(a) + Eps) coreMono = false;
        Check(coreMono, "core alpha only falls");
        Check(DruidSlamVfxTimeline.CoreScale(2) == 1 && DruidSlamVfxTimeline.CoreScale(0) < 1 && DruidSlamVfxTimeline.CoreScale(4) < 1 && DruidSlamVfxTimeline.CoreScale(4) > .6, "core size peaks at +2");
        Check(DruidSlamVfxTimeline.CoreColor(0) == 0xFFF4D0 && DruidSlamVfxTimeline.CoreColor(5) == 0xD49A5C, "core colour #fff4d0 at act 0 to #d49a5c");
        Check(((DruidSlamVfxTimeline.CoreColor(0) >> 16) & 0xFF) >= 240, "core peak red channel >= 240");
        Check(DruidSlamVfxTimeline.CoreHdrGain == 1.6 && Near(DruidSlamVfxTimeline.CoreOpacity(0), 1.6, Eps), "core HDR: _Opacity peaks at 1.6 (only the centre passes the 1.1 bloom threshold) [r2: was 2.4]");
        double maxOp = 0; int hdrSteps = 0; for (double a = -1; a < 8; a += .05) { double o = DruidSlamVfxTimeline.CoreOpacity(a); maxOp = Math.Max(maxOp, o); if (o > 1.1) hdrSteps++; }
        Check(Near(maxOp, 1.6, Eps) && DruidSlamVfxTimeline.CoreOpacity(5) == 0 && DruidSlamVfxTimeline.CoreOpacity(1) > 0, "core HDR opacity never exceeds 1.6 and is 0 after 5 ticks");
        Check(hdrSteps > 0 && hdrSteps * .05 <= 1.0 + 1e-6, "core is above the bloom threshold for at most 1 tick (a 1..3 frame flash, then ordinary light)");

        // ---- r2: soft warm core texture (alpha (1-r)^2.2, 0 from r .95, colour baked) ----
        bool texMono = true, texEdge = true; double pr2 = 2;
        for (double r = 0; r <= 1.2; r += .005) { double al = DruidSlamVfxTimeline.CoreTexAlpha(r); if (al > pr2 + Eps) texMono = false; pr2 = al; if (r >= .95 && al != 0) texEdge = false; if (al < 0 || al > 1) texMono = false; }
        Check(texMono, "core texture alpha only falls with the radius, within 0..1 (no ring, no plateau)");
        Check(texEdge && DruidSlamVfxTimeline.CoreTexAlpha(.95) == 0 && DruidSlamVfxTimeline.CoreTexAlpha(1) == 0 && DruidSlamVfxTimeline.CoreTexAlpha(.9) > 0, "core texture alpha is exactly 0 from r .95 (no hard rim)");
        Check(Near(DruidSlamVfxTimeline.CoreTexAlpha(0), 1, Eps) && Near(DruidSlamVfxTimeline.CoreTexAlpha(.5), Math.Pow(.5, 2.2), 1e-9), "core texture alpha (1-r)^2.2: 1 at the centre, .218 at r .5");
        Check(DruidSlamVfxTimeline.CoreTexAlpha(.5) < .25 && DruidSlamVfxTimeline.CoreTexAlpha(.7) < .08, "core texture: the body is soft (alpha < .25 from r .5), no solid disc");
        Check(DruidSlamVfxTimeline.CoreTexColor(0) == 0xFFF4D0 && DruidSlamVfxTimeline.CoreTexColor(.5) == 0xD49A5C && DruidSlamVfxTimeline.CoreTexColor(.8) == 0xD49A5C && DruidSlamVfxTimeline.CoreTexColor(.25) != 0xFFF4D0 && DruidSlamVfxTimeline.CoreTexColor(.25) != 0xD49A5C, "core texture colour: #fff4d0 centre -> #d49a5c at r .5, baked");

        // ---- r2: flat decal fallback alpha (the sheets are dark on dark soil) ----
        bool flatOk = true; for (double a = -1; a <= 200; a += .5) { double f = DruidSlamVfxTimeline.CrackAlphaFlat(a); if (f < 0 || f > .85 + Eps || f < DruidSlamVfxTimeline.CrackAlpha(a) - Eps) flatOk = false; if (DruidSlamVfxTimeline.CrackAlpha(a) == 0 && f != 0) flatOk = false; }
        Check(flatOk && Near(DruidSlamVfxTimeline.CrackAlphaFlat(60), .84, Eps), "flat crack alpha = projected x2, <= .85, same life and fade (projected path keeps <= .42)");
        Check(DruidSlamVfxTimeline.CrackAlphaFlat(186) == 0 && DruidSlamVfxTimeline.CrackAlphaFlat(0) == 0 && DruidSlamVfxTimeline.CrackAlphaFlat(185) > 0, "flat crack lives exactly as long as the projected one");

        // ---- r2: debris brighter for the first 4 ticks ----
        Check(DruidSlamVfxTimeline.DebrisBright(0) == 1.3 && DruidSlamVfxTimeline.DebrisBright(3) == 1.3 && DruidSlamVfxTimeline.DebrisBright(4) == 1 && DruidSlamVfxTimeline.DebrisBright(10) == 1 && DruidSlamVfxTimeline.DebrisBright(-1) == 1, "debris x1.3 bright for the first 4 ticks, then the sheet colour");
        Check(DruidSlamVfxTimeline.DebrisVisMinScreen == 14 && DruidSlamVfxTimeline.DebrisVisMaxScreen == 30, "debris visible size 14..30 screen px");

        // ---- wind-up chunks (debris stills) ----
        bool chunkOk = true, liftOk = true, chunkSize = true, chunkFrame = true;
        for (int seed = -200; seed < 800; seed++)
        {
            var ch = DruidSlamVfxTimeline.Chunks(seed); if (ch.Length != 6) chunkOk = false;
            foreach (var c in ch)
            {
                if (Math.Sqrt(c.X * c.X + c.Y * c.Y) > .9 * 260 || Math.Sqrt(c.X * c.X + c.Y * c.Y) < 60) chunkOk = false;
                if (c.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMin < 14 - 1e-6 || c.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMax > 30 + 1e-6) chunkSize = false;
                if (c.Frame < 0 || c.Frame > 15) chunkFrame = false;
                for (int w = 0; w < 12; w++) { double px = DruidSlamVfxTimeline.ChunkLiftPx(c, w); if (px < 1 - Eps || px > 3 + Eps) liftOk = false; }
            }
        }
        Check(chunkOk, "6 wind-up chunks inside the circle");
        Check(chunkSize, "wind-up debris stills are 14..30 screen px visible [r2: was 10..24]");
        Check(chunkFrame, "wind-up debris still index within 0..15");
        Check(liftOk, "wind-up chunks bob 1..3 screen px");
        Check(DruidSlamVfxTimeline.WindLiftTicks == 12 && !DruidSlamVfxTimeline.ChunkActive(-1) && DruidSlamVfxTimeline.ChunkActive(0) && DruidSlamVfxTimeline.ChunkActive(11) && !DruidSlamVfxTimeline.ChunkActive(12), "wind-up chunks only in the last 12 ticks");
        Check(DruidSlamVfxTimeline.ChunkAlpha(12) == 0 && DruidSlamVfxTimeline.ChunkAlpha(5) <= .85 + Eps && DruidSlamVfxTimeline.ChunkAlpha(0) > 0, "wind-up chunk alpha");

        // ---- determinism ----
        int s0 = DruidSlamVfxTimeline.Seed(1234, 640.4, -210.6);
        Check(s0 == DruidSlamVfxTimeline.Seed(1234, 640.4, -210.6), "seed is a pure function of tick and position");
        Check(s0 != DruidSlamVfxTimeline.Seed(1235, 640.4, -210.6) && s0 != DruidSlamVfxTimeline.Seed(1234, 641.4, -210.6), "seed changes with tick and position");
        Check(Same(DruidSlamVfxTimeline.Debrises(s0), DruidSlamVfxTimeline.Debrises(s0)), "same seed, same debris");
        Check(DruidSlamVfxTimeline.Dust(s0).Select(p => p.X + p.Size).SequenceEqual(DruidSlamVfxTimeline.Dust(s0).Select(p => p.X + p.Size)), "same seed, same dust");
        Check(DruidSlamVfxTimeline.RingDusts(s0).Select(p => p.X + p.SpawnAct).SequenceEqual(DruidSlamVfxTimeline.RingDusts(s0).Select(p => p.X + p.SpawnAct)), "same seed, same rim dusts");
        Check(DruidSlamVfxTimeline.Chunks(s0).Select(c => c.X).SequenceEqual(DruidSlamVfxTimeline.Chunks(s0).Select(c => c.X)), "same seed, same chunks");
        Check(!DruidSlamVfxTimeline.Debrises(s0).Select(s => s.Angle).SequenceEqual(DruidSlamVfxTimeline.Debrises(s0 + 1).Select(s => s.Angle)), "different seed, different debris");

        // ---- source and asset checks: the vector ring / polyline cracks are gone, the sheets are in ----
        if (repo != "")
        {
            string view = Src(VfxDir + "DruidSkillVfxView.cs"), slam = Src(VfxDir + "DruidSlamVfxTimeline.cs"), slash = Src(VfxDir + "DruidSlashVfxTimeline.cs");
            foreach (var bannedName in new[] { "Arc(", "CrackStrip", "Strip(", "class Mb", "NativeGroundWarningProjection", "RingOuter", "RingWidth", "RingAlpha", "TrailAngles", "LeadAngle", "TailAngle", "TrailOuter", "TrailInner", "Gouge(", "GougeReach", "GougeWidth", "lensTex", "puffTex", "trailTex" })
                Check(!view.Contains(bannedName) && !slam.Contains(bannedName) && !slash.Contains(bannedName), "old vector code is gone: " + bannedName);
            Check(!slam.Contains("Crack(") && !slam.Contains("CrackSteps") && !slam.Contains("CrackWidth") && !slam.Contains("CrackCount") && !slam.Contains("struct Pt"), "old polyline crack code is gone from the slam timeline");
            Check(view.Contains("earth_dust_burst") && view.Contains("debris_chunks") && view.Contains("ground_crack_radial") && view.Contains("ground_gouge_linear") && view.Contains("whip_smear"), "view loads the five earth sheet families");
            Check(!view.Contains("earth_dust_puff"), "view does not use earth_dust_puff (FAIL sheet)");
            Check(view.Contains("TryGetOrbSocketWorldPosition") && view.Contains("StaffTip("), "ribbon: rig staff-head socket, Core staff-tip formula as the fallback");
            Check(view.Contains("NativeGroundSkillSurface.Mark") && view.Contains("NativeGroundSkillSurface.Project"), "decals use the receiver-depth floor projection");
            Check(view.Contains("CoreOpacity") && view.Contains("StrikeCoreOpacity"), "both cores write the HDR opacity");
            Check(view.Split(new[] { "Put(true, coreSprite" }, StringSplitOptions.None).Length == 3 && view.Contains("MakeCoreTex") && view.Contains("CoreTexAlpha") && view.Contains("CoreTexColor"), "both cores use the soft baked-colour core texture (old glow texture is only the orb glow)");
            Check(view.Contains("flatPool") && view.Contains("lyingOn3D") && view.Contains("Quaternion.Euler(90, 0, 0)") && view.Contains("IsLying") && view.Contains("CrackAlphaFlat") && view.Contains("GougeAlphaFlat"), "decal fallback: flat textured sprite (lying on the 3D floor when the receiver is missing)");
            Check(view.Split(new[] { "d.transform.localScale = new Vector3((float)wCore / sprite.rect.width" }, StringSplitOptions.None).Length == 2, "decal fallback quad has the same size as the projection (one shared scale line)");
            Check(Src("unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs").Contains("DruidSkillVfxView.IsLying"), "billboard pass skips the lying decal sprites");
            int rs = view.IndexOf("void DrawRibbon"), re = view.IndexOf("// ---- hit 3 ground strike"); string ribSrc = rs >= 0 && re > rs ? view.Substring(rs, re - rs) : "";
            Check(ribSrc.Length > 0 && !ribSrc.Contains("White") && !ribSrc.Contains("Color.white") && ribSrc.Contains("RibbonTint") && ribSrc.Contains("RibbonAlongAlpha") && ribSrc.Contains("trailBlendR") && ribSrc.Contains("RibbonAddOpacity"), "ribbon: alpha-blend layer tinted bone -> bark + weak additive head, no pure-white constant");
            Check(view.Contains("ShardTint") && view.Split(new[] { "ShardTint(sa, al)" }, StringSplitOptions.None).Length == 3, "both flying-debris draws use the x1.3 first-4-ticks tint");
            Check(view.Contains("RibbonSamplesRig") && view.Contains("RibbonSamplesFormula") && Src("unity/Assets/Exoduser/Runtime/NativeGame.BossArenaReview.cs").Contains("trailSource"), "QA: review JSON records trailSource (rig / formula) and orbSocket");
            string sheetDir = "unity/Assets/Exoduser/Resources/Art/vfx/boss/earth/";
            foreach (var sheet in new[] { "earth_dust_burst", "debris_chunks", "ground_crack_radial", "ground_crack_radial_v2", "ground_crack_radial_v3", "ground_crack_radial_v4", "ground_gouge_linear", "ground_gouge_linear_v2", "ground_gouge_linear_v3", "whip_smear", "whip_smear_v2", "whip_smear_v3" })
            {
                bool ok = File.Exists(Path.Combine(repo, sheetDir + sheet + ".png")) && File.Exists(Path.Combine(repo, sheetDir + sheet + ".png.meta"));
                if (ok) { string meta = File.ReadAllText(Path.Combine(repo, sheetDir + sheet + ".png.meta")); ok = meta.Contains("wrapU: 1") && meta.Contains("wrapV: 1") && meta.Contains("filterMode: 1") && meta.Contains("enableMipMap: 0"); }
                Check(ok, "sheet imported with Clamp / Bilinear / no mips: " + sheet);
            }
        }

        SlashChecks();
        RemainingChecks();
        Console.WriteLine("druid skill vfx checks: " + checks + " run, " + bad + " failed");
        return bad == 0 ? 0 : 1;
    }

    static bool Same(DruidSlamVfxTimeline.Debris[] a, DruidSlamVfxTimeline.Debris[] b)
    {
        if (a.Length != b.Length) return false;
        for (int i = 0; i < a.Length; i++) if (a[i].Angle != b[i].Angle || a[i].Life != b[i].Life || a[i].Size != b[i].Size || a[i].Frame != b[i].Frame || a[i].SpawnAct != b[i].SpawnAct) return false;
        return true;
    }
}
