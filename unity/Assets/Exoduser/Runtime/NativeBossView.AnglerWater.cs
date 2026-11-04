using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

namespace Exoduser.UnityPort
{
    // U-VFX-14: the water energy ball of the four 1-1 abyssal anglers drawn as one set: charge at the feeler tip, launch spray, flight with a ribbon tail and shed drops,
    // player hit, block / parry, and the vanish at a wall or end of life. Numbers and the web condition are in Vfx/AnglerWaterTimeline.cs (pure, tested by combat-impact-tests);
    // this file only draws. Core values and judgement are untouched: the orb keeps its 48 Sz / R 20 box, the sheets replace the ice element-orb row for this shot only.
    public sealed partial class NativeBossView
    {
        sealed class AnglerFx
        {
            public AnglerWaterKind Kind; public bool Launch; public AnglerWater.Plan Plan; public int Born; public float X, Y; public double Ang; public AnglerWater.Streak[] Streaks;
        }
        sealed class AnglerDropFx { public AnglerWater.Drop D; public int Born; public float X, Y; public bool Tail; public float Shade; }

        readonly AnglerWaterTracker anglerTracker = new AnglerWaterTracker();
        readonly List<AnglerFx> anglerFx = new List<AnglerFx>();
        readonly List<AnglerDropFx> anglerDrops = new List<AnglerDropFx>();
        readonly Dictionary<BossProjectile, int> anglerTailTick = new Dictionary<BossProjectile, int>();
        readonly AnglerWetDecals anglerDecals = new AnglerWetDecals();
        Simulation anglerBound;
        const int AnglerDropCap = 96, AnglerFxCap = 24;
        /// <summary>Per Update: angler water orbs / charging balls drawn with the new sheets (the capture receipt may read these).</summary>
        public int AnglerOrbsDrawn, AnglerChargesDrawn;

        static bool AnglerHasArt() { return HasArt(AnglerWater.ResDir + AnglerWater.OrbSheet); }
        static Sprite AnglerCell(string sheet, int cols, int rows, int frame) { return NativeDruidArt.ClipFrame(AnglerWater.ResDir + sheet, cols, rows, frame, 0); }
        static readonly Color WaterMid = new Color(.227f, .416f, .533f), WaterDeep = new Color(.059f, .110f, .149f), WaterLight = new Color(.553f, .706f, .784f), WaterCore = new Color(.863f, .922f, .941f);

        // ---- procedural sprites (smooth alpha, no noise, no grain) ----
        static Sprite anglerRibbon, anglerCore, anglerWet;
        // ribbon: x 0 = body end, tapering to a point, alpha 1 -> 0 along its length (the renderer colour alpha carries the .5 cap), colour #2f5870 -> #1c3646 (darker than the body)
        static Sprite AnglerRibbon()
        {
            if (anglerRibbon != null) return anglerRibbon;
            const int w = 256, h = 64; var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; var px = new Color32[w * h];
            Color a = new Color(.184f, .345f, .439f), b = new Color(.110f, .212f, .275f);
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                float u = x / (float)(w - 1), v = Mathf.Abs((y + .5f) / h * 2 - 1), width = Mathf.Pow(1 - u, .9f) + .0001f, t = v / width;
                float al = t >= 1 ? 0 : Mathf.Clamp01(1 - t * t) * Mathf.Pow(1 - u, 1.3f); Color c = Color.Lerp(a, b, u);
                px[y * w + x] = new Color32((byte)(c.r * 255), (byte)(c.g * 255), (byte)(c.b * 255), (byte)(al * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return anglerRibbon = Sprite.Create(tex, new Rect(0, 0, w, h), new Vector2(0, .5f), 100f, 0, SpriteMeshType.FullRect);
        }
        // contact core: #dcebf0 soft disc for the additive material (rgb * a)
        static Sprite AnglerCore()
        {
            if (anglerCore != null) return anglerCore;
            const int n = 64; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, r = Mathf.Sqrt(dx * dx + dy * dy), al = r >= 1 ? 0 : Mathf.Pow(1 - r, 1.4f);
                px[y * n + x] = new Color32(220, 235, 240, (byte)(al * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return anglerCore = Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }
        // wet ground mark: five smooth overlapping lobes (long axis +x), colour is set by the renderer, alpha 0 at the border
        static Sprite AnglerWet()
        {
            if (anglerWet != null) return anglerWet;
            const int n = 128; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; var px = new Color32[n * n];
            var lobes = new[] { new Vector3(0, 0, .30f), new Vector3(.17f, .03f, .20f), new Vector3(-.19f, -.04f, .21f), new Vector3(.04f, .12f, .15f), new Vector3(-.07f, -.12f, .15f) };
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float u = (x + .5f) / n - .5f, v = (y + .5f) / n - .5f, sum = 0;
                foreach (var l in lobes) { float dx = u - l.x, dy = v - l.y, s = l.z * .5f; sum += Mathf.Exp(-(dx * dx + dy * dy) / (2 * s * s)); }
                float edge = Mathf.Clamp01((.5f - Mathf.Sqrt(u * u + v * v)) / .14f);
                px[y * n + x] = new Color32(255, 255, 255, (byte)(255 * (1 - Mathf.Exp(-sum * 1.5f)) * edge));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return anglerWet = Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }

        // ---- per Update: follow the orbs, turn what happened to them into effects ----
        void AnglerWaterBegin(Simulation sim, DruidBoss druid, int t)
        {
            AnglerOrbsDrawn = 0; AnglerChargesDrawn = 0;
            if (anglerBound != sim) { anglerBound = sim; anglerTracker.Reset(); anglerFx.Clear(); anglerDrops.Clear(); anglerTailTick.Clear(); anglerDecals.Reset(); }
            if (t < boundTickPrevAngler) { anglerFx.Clear(); anglerDrops.Clear(); anglerTailTick.Clear(); anglerDecals.Reset(); }
            boundTickPrevAngler = t;
            var pl = sim.Player;
            anglerTracker.Update(druid.Projectiles, t, pl.X, pl.Y, pl.Radius, sim.HurtCount);
            foreach (var ev in anglerTracker.Events)
            {
                int seed = unchecked(ev.Tick * 397 + (int)ev.X * 31 + (int)ev.Y);
                if (anglerFx.Count >= AnglerFxCap) anglerFx.RemoveAt(0);
                if (ev.Launch) { anglerFx.Add(new AnglerFx { Launch = true, Born = ev.Tick, X = (float)ev.X, Y = (float)ev.Y, Ang = ev.Angle, Streaks = AnglerWater.LaunchStreaks(seed, ev.Angle) }); continue; }
                var plan = AnglerWater.MakePlan(ev.Kind);
                var fx = new AnglerFx { Kind = ev.Kind, Plan = plan, Born = ev.Tick, X = (float)ev.X, Y = (float)ev.Y, Ang = ev.Angle };
                if (ev.Kind == AnglerWaterKind.Parry && ev.Split) fx.Streaks = AnglerWater.SplitBurst(seed + 3, ev.Dirs);   // Q parry: jets along the five split directions
                anglerFx.Add(fx);
                foreach (var d in AnglerWater.ContactDrops(plan, seed + 7, ev.Angle)) AddAnglerDrop(d, ev.Tick, (float)ev.X, (float)ev.Y, false, (float)((seed >> 3 & 255) / 255.0));
                anglerDecals.Add(ev.Tick, (float)ev.X, (float)ev.Y, ev.Angle, plan);
            }
            anglerTracker.Events.Clear();
            foreach (var o in anglerTracker.Orbs)
            {
                int age = t - o.Born, last; anglerTailTick.TryGetValue(o.P, out last);
                if (!AnglerWater.TailDropTick(age) || anglerTailTick.ContainsKey(o.P) && last == t) continue;
                anglerTailTick[o.P] = t; double D = AnglerWater.OrbBodyDiameter(AnglerWater.BodyBox(o.P.Sz));
                foreach (var d in AnglerWater.TailDrops(unchecked(t * 131 + (int)o.P.X), o.Ang, D)) AddAnglerDrop(d, t, (float)o.P.X, (float)o.P.Y, true, 0);
            }
            if (anglerTailTick.Count > 64) { var gone = new List<BossProjectile>(); foreach (var k in anglerTailTick.Keys) if (!k.Active) gone.Add(k); foreach (var k in gone) anglerTailTick.Remove(k); }
        }
        int boundTickPrevAngler;

        void AddAnglerDrop(AnglerWater.Drop d, int born, float x, float y, bool tail, float shade)
        {
            if (anglerDrops.Count >= AnglerDropCap) anglerDrops.RemoveAt(0);
            anglerDrops.Add(new AnglerDropFx { D = d, Born = born, X = x, Y = y, Tail = tail, Shade = shade });
        }

        // the orb in flight: ribbon tail under the body, body = the 24-frame loop turned to the travel direction. false = not the angler orb / art missing (old path draws it)
        bool AnglerOrbDraw(BossProjectile p, int t)
        {
            if (!AnglerWater.IsAnglerOrb(p) || !AnglerHasArt()) return false;
            int born = t - AnglerWaterTracker.AgeOf(p); foreach (var o in anglerTracker.Orbs) if (o.P == p) { born = o.Born; break; }
            int age = Math.Max(0, t - born); double ang = Math.Atan2(p.Vy, p.Vx), cell = AnglerWater.BodyBox(p.Sz), D = AnglerWater.OrbBodyDiameter(cell);
            int order = (int)p.Y + 6;
            PutBox(AnglerRibbon(), p.X, p.Y, D * .5 + AnglerWater.TailLength(D, age), AnglerWater.TailWidth(D), new Color(1, 1, 1, (float)AnglerWater.TailMaxAlpha), order - 1, ang + Math.PI);
            PutBox(AnglerCell(AnglerWater.OrbSheet, AnglerWater.OrbCols, AnglerWater.OrbRows, AnglerWater.OrbFrame(age)), p.X, p.Y, cell, cell, Color.white, order, ang);
            AnglerOrbsDrawn++; FieldOrbsDrawn++;
            return true;
        }

        // allied rim: smooth ring #dfe3e6 laid over the body edge (the enemy orb keeps its dark rim)
        static Sprite anglerRim;
        static Sprite AnglerRim()
        {
            if (anglerRim != null) return anglerRim;
            const int n = 128; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, r = Mathf.Sqrt(dx * dx + dy * dy), t = Mathf.Clamp01(1 - Mathf.Abs(r - .93f) / .07f), al = t * t * (3 - 2 * t);
                px[y * n + x] = new Color32(AnglerWater.AllyRimR, AnglerWater.AllyRimG, AnglerWater.AllyRimB, (byte)(al * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return anglerRim = Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }

        // the five shots of a Q parry (Friendly + ParryMagicShot, water): the same loop at .55 x the ball, a short ribbon, a silver-white rim. false = not such a shot / art missing
        bool AnglerSplitDraw(BossProjectile p, int t)
        {
            if (!AnglerWater.IsParrySplitShot(p) || !AnglerHasArt()) return false;
            int born = t; foreach (var s in anglerTracker.Shots) if (s.P == p) { born = s.Born; break; }
            int age = Math.Max(0, t - born); double ang = Math.Atan2(p.Vy, p.Vx), cell = AnglerWater.SplitBodyCell(), D = AnglerWater.OrbBodyDiameter(cell); int order = (int)p.Y + 6;
            PutBox(AnglerRibbon(), p.X, p.Y, D * .5 + AnglerWater.SplitTailLength(D), AnglerWater.TailWidth(D), new Color(1, 1, 1, (float)AnglerWater.SplitTailMaxAlpha), order - 1, ang + Math.PI);
            PutBox(AnglerCell(AnglerWater.OrbSheet, AnglerWater.OrbCols, AnglerWater.OrbRows, AnglerWater.OrbFrame(age)), p.X, p.Y, cell, cell, Color.white, order, ang);
            PutBox(AnglerRim(), p.X, p.Y, D, D, new Color(1, 1, 1, (float)AnglerWater.AllyRimAlpha), order + 1, 0);
            return true;
        }

        // jets of the launch spray / the Q split: stretched, shrinking away, never a dot
        void AnglerDrawStreaks(AnglerFx f, int age)
        {
            if (f.Streaks == null || age >= AnglerWater.LaunchLife) return;
            float al = (float)AnglerWater.StreakAlpha(age);
            foreach (var s in f.Streaks)
            {
                double tail, head; AnglerWater.StreakSpan(s, age, out tail, out head); double len = head - tail; if (len < 2) continue;
                double mid = (head + tail) * .5; Color c = Color.Lerp(WaterLight, WaterMid, age / (float)AnglerWater.LaunchLife); c.a = al;
                PutBox(disc, f.X + Math.Cos(s.Angle) * mid, f.Y + Math.Sin(s.Angle) * mid, len, s.Width, c, (int)f.Y + 5, s.Angle);
            }
        }

        // charge: the ball grows at the feeler tip for the last 60 of the 180 charge ticks, alpha 0 -> 1, turning
        void AnglerChargeDraw(Simulation sim, int t)
        {
            var list = sim.FieldBosses; if (list == null || !AnglerHasArt()) return;
            for (int i = 0; i < list.Length; i++)
            {
                var fb = list[i]; if (fb == null || !fb.Alive) continue;   // FieldBossFireEnergy hard-codes El 2 for all four anglers
                double prog = AnglerWater.ChargeProgress(fb.EnChg, fb.Hid, fb.TpT); if (prog <= 0) continue;
                double fx, fy; Simulation.FieldBossFeeler(fb, out fx, out fy);
                double size = AnglerWater.ChargeSize(prog, AnglerWater.BodyBox(48)), face = Math.Atan2(sim.Player.Y - fy, sim.Player.X - fx) + t * .12;
                PutBox(AnglerCell(AnglerWater.OrbSheet, AnglerWater.OrbCols, AnglerWater.OrbRows, AnglerWater.OrbFrame(t)), fx, fy, size, size, new Color(1, 1, 1, (float)prog), (int)fy + 6, face);
                AnglerChargesDrawn++;
            }
        }

        // effects after the bullets: wet marks (ground), launch spray, contact core + crown / split, falling streaks
        void AnglerWaterDraw(Simulation sim, int t)
        {
            AnglerChargeDraw(sim, t);
            bool sheets = AnglerHasArt() && HasArt(AnglerWater.ResDir + AnglerWater.CrownSheet) && HasArt(AnglerWater.ResDir + AnglerWater.SplitSheet);
            for (int i = 0; i < anglerDecals.Slots.Length; i++)
            {
                double a = anglerDecals.Alpha(i, t); if (a <= 0) continue; var s = anglerDecals.Slots[i];
                PutBox(AnglerWet(), s.X, s.Y, s.Width, s.Width * .62, new Color(WaterDeep.r, WaterDeep.g, WaterDeep.b, (float)a), -9006 + i, s.Angle, ground: true);
            }
            for (int i = 0; i < anglerFx.Count;)
            {
                var f = anglerFx[i]; int age = t - f.Born;
                if (f.Launch)
                {
                    if (age >= AnglerWater.LaunchLife) { anglerFx.RemoveAt(i); continue; }
                    AnglerDrawStreaks(f, age);
                    i++; continue;
                }
                if (age >= f.Plan.Life) { anglerFx.RemoveAt(i); continue; }
                double core = AnglerWater.CoreAlpha(f.Plan, age);
                if (core > 0) PutAdd(AnglerCore(), f.X, f.Y, f.Plan.CoreDiameter, f.Plan.CoreDiameter, (float)core, (int)f.Y + 8);
                int frame = AnglerWater.CrownFrame(f.Plan, age);
                if (sheets && frame >= 0)
                {
                    PutBox(AnglerCell(f.Plan.Sheet, AnglerWater.CrownCols, AnglerWater.CrownRows, frame), f.X, f.Y, f.Plan.CellWidth, f.Plan.CellWidth, Color.white, (int)f.Y + 3, f.Ang);
                }
                AnglerDrawStreaks(f, age);   // Q split: jets along the five directions
                i++;
            }
            for (int i = 0; i < anglerDrops.Count;)
            {
                var d = anglerDrops[i]; double age = t - d.Born - d.D.Delay;
                if (age >= d.D.Life || age >= 0 && !d.D.Alive(age)) { anglerDrops.RemoveAt(i); continue; }
                i++; if (age < 0) continue;
                double z = d.D.Z(age), x = d.X + d.D.Dx + d.D.Vx * age, y = d.Y + d.D.Dy + d.D.Vy * age, vyScreen = d.D.Vy - (d.D.Vz - d.D.G * age);
                double speed = Math.Sqrt(d.D.Vx * d.D.Vx + vyScreen * vyScreen), len = Math.Max(d.D.Length, speed * 2.4), ang = Math.Atan2(vyScreen, d.D.Vx);
                float fade = (float)Math.Min(1, (d.D.Life - age) / 5.0);
                Color c = d.Tail ? new Color(.165f, .302f, .388f, .6f * fade) : Color.Lerp(WaterMid, WaterLight, d.Shade * .5f); if (!d.Tail) c.a = .9f * fade;
                PutBox(disc, x, y - z, len, d.D.Width, c, (int)y + 4, ang);
            }
        }
    }
}
