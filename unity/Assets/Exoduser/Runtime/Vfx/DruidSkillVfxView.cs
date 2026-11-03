using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Body VFX of the remodelled 1-1 druid's moves (docs/5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md). Step 1 = (2) slam: wind-up earth chunks, contact core,
    // earth shock ring, seven radial cracks, flying shards, low dust and the crack decal. It only READS Simulation.Druid (state S / St2 / Facing / X / Y, compared with the
    // previous state like NativeBossView.prevBossState) and never writes back: damage, timing and shake stay the Core's, so the fight is identical with or without it.
    // Step 2 = (1) slashCombo: hits 1 and 2 sweep a thin bone-coloured additive trail (a horizontal band 0.35 H above the floor) across the whole hit fan and are gone at act +8;
    // hit 3 draws no trail but strikes the ground at the staff tip on the damage tick (core, shards, low dust) and leaves a furrow decal down the fan's middle line.
    // Every number is DruidSlamVfxTimeline / DruidSlashVfxTimeline (pure, checked by unity/Tools/druid-skill-vfx-tests). Clock = Core ticks, so pause / frame stepping cannot consume the effect.
    // Draw order (G1 1.3): cracks + ring (vertex-colour mesh, projected on the floor like the telegraph decals) -8994 < dust -8989 < shards -8988 < telegraph decal -8985 < actors;
    // only the contact core and the slash trail are additive above the actors. Limits (shared by both moves): 24 body sprites at once (oldest dropped first), 8 decals.
    public sealed class DruidSkillVfxView : IDisposable
    {
        const int MeshOrder = -8994, DustOrder = -8989, ShardOrder = -8988, CoreOrder = 29999, MaxBodySprites = 24, MaxDecals = 8;

        sealed class Mb
        {
            public readonly List<Vector3> V = new List<Vector3>(); public readonly List<Color> C = new List<Color>(); public readonly List<int> T = new List<int>();
            public readonly Mesh Mesh = new Mesh { name = "druid-slam-ground" };
            public void Clear() { V.Clear(); C.Clear(); T.Clear(); }
            int Add(double x, double y, Color c) { V.Add(new Vector3((float)x / 100, -(float)y / 100, 0)); C.Add(c); return V.Count - 1; }
            public void Quad(double x0, double y0, double x1, double y1, double x2, double y2, double x3, double y3, Color c)
            {
                int a = Add(x0, y0, c), b = Add(x1, y1, c), d = Add(x2, y2, c), e = Add(x3, y3, c);
                T.Add(a); T.Add(b); T.Add(d); T.Add(a); T.Add(d); T.Add(e); T.Add(a); T.Add(d); T.Add(b); T.Add(a); T.Add(e); T.Add(d);   // both windings: nothing is culled
            }
            public void Arc(double cx, double cy, double r0, double r1, double a0, double a1, Color c)
            {
                if (r1 <= r0 || a1 <= a0) return;
                int n = Math.Max(2, (int)Math.Ceiling((a1 - a0) / (Math.PI * 2) * 64));
                for (int i = 0; i < n; i++)
                {
                    double s = a0 + (a1 - a0) * i / n, e = a0 + (a1 - a0) * (i + 1) / n;
                    Quad(cx + Math.Cos(s) * r0, cy + Math.Sin(s) * r0, cx + Math.Cos(s) * r1, cy + Math.Sin(s) * r1, cx + Math.Cos(e) * r1, cy + Math.Sin(e) * r1, cx + Math.Cos(e) * r0, cy + Math.Sin(e) * r0, c);
                }
            }
            public void Flush() { Mesh.Clear(); if (V.Count == 0) return; Mesh.SetVertices(V); Mesh.SetColors(C); Mesh.SetTriangles(T, 0); Mesh.bounds = new Bounds(Vector3.zero, new Vector3(1000, 1000, 1)); }
        }

        sealed class Slam { public int Born, Seed; public double X, Y, TipX, TipY; public DruidSlamVfxTimeline.Shard[] Shards; public DruidSlamVfxTimeline.Puff[] Dust; }
        // one swing of slashCombo. X / Y follow the boss while the swing runs (trail centre); HitX / HitY = where the boss stands on the damage tick (furrow, tip).
        sealed class Slash
        {
            public int Born, Seed, Idx; public bool FurrowDropped; public double X, Y, HitX, HitY, Facing, BossR, PlayerR, Reach, TipX, TipY;
            public DruidSlamVfxTimeline.Shard[] Shards; public DruidSlamVfxTimeline.Puff[] Dust;
            public bool HasFurrow { get { return DruidSlashVfxTimeline.HasStrike(Idx) && !FurrowDropped; } }
            public int Life { get { return DruidSlashVfxTimeline.HasStrike(Idx) ? DruidSlashVfxTimeline.HitAct + DruidSlashVfxTimeline.GougeLife : DruidSlashVfxTimeline.TrailLife; } }
        }

        readonly Transform root; readonly Mb mb = new Mb(); readonly MeshRenderer meshR; readonly NativeGroundWarningProjection ground;
        readonly List<SpriteRenderer> alphaPool = new List<SpriteRenderer>(), addPool = new List<SpriteRenderer>(); int alphaUsed, addUsed;
        readonly Sprite lens, puff, glow; readonly Texture2D lensTex, puffTex, glowTex, trailTex;
        readonly Mesh trailMesh = new Mesh { name = "druid-slash-trail" }; readonly MeshRenderer trailR; readonly MaterialPropertyBlock trailBlock = new MaterialPropertyBlock();
        readonly List<Vector3> tv = new List<Vector3>(); readonly List<Vector2> tuv = new List<Vector2>(); readonly List<int> tt = new List<int>();
        readonly List<Slash> slashes = new List<Slash>();
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        readonly List<Slam> slams = new List<Slam>();
        string prevState; int lastTick = int.MinValue, windStart = -1; DruidSlamVfxTimeline.Chunk[] chunks;
        public int SlamsStarted, SlashesStarted, MaxBodySpritesDrawn, BodySpritesDrawn;   // QA
        const int TrailSections = 24;

        public DruidSkillVfxView(Transform parent)
        {
            root = new GameObject("DruidSkillVfxView").transform; root.SetParent(parent, false);
            var go = new GameObject("slamGround"); go.transform.SetParent(root, false);
            go.AddComponent<MeshFilter>().sharedMesh = mb.Mesh;
            meshR = go.AddComponent<MeshRenderer>();
            var probe = new GameObject("probe").AddComponent<SpriteRenderer>(); meshR.sharedMaterial = probe.sharedMaterial; UnityEngine.Object.Destroy(probe.gameObject);   // default sprite material: alpha blend, vertex colour
            meshR.sortingOrder = MeshOrder; meshR.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; meshR.receiveShadows = false;
            ground = new NativeGroundWarningProjection(meshR, mb.Mesh);
            // lens: a pointed, stretched chunk (no noise, no dots)
            lensTex = MakeTex(64, 16, (u, v) => { float h = 1 - Mathf.Pow(Mathf.Abs(u), 1.5f); return Mathf.Clamp01((h - Mathf.Abs(v)) * 6f); });
            lens = Sprite.Create(lensTex, new Rect(0, 0, 64, 16), new Vector2(.5f, .5f), 100);
            // Soft lobed dust puff: the same five overlapping smooth lobes as CombatImpactView (no noise or grain, alpha 0 at the border)
            var lobes = new[] { new Vector3(0, 0, .40f), new Vector3(.17f, .07f, .28f), new Vector3(-.16f, .09f, .28f), new Vector3(.05f, -.15f, .26f), new Vector3(-.09f, -.11f, .24f) };
            puffTex = MakeTex(64, 64, (u, v) =>
            {
                float x = u * .5f, y = v * .5f, sum = 0;
                foreach (var l in lobes) { float dx = x - l.x, dy = y - l.y, sigma = l.z * .5f; sum += Mathf.Exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)); }
                float edge = Mathf.Clamp01((.5f - Mathf.Sqrt(x * x + y * y)) / .12f); return (1 - Mathf.Exp(-sum * 1.6f)) * edge;
            });
            puff = Sprite.Create(puffTex, new Rect(0, 0, 64, 64), new Vector2(.5f, .5f), 100);
            glowTex = MakeTex(64, 64, (u, v) => Mathf.Pow(Mathf.Clamp01(1 - Mathf.Sqrt(u * u + v * v)), 1.7f));
            glow = Sprite.Create(glowTex, new Rect(0, 0, 64, 64), new Vector2(.5f, .5f), 100);
            // slash trail ramp: u (left -> right) = tail -> leading edge on the G1 colours (bark -> #9a8a72 -> bone), v = soft edges across the thin band; no noise
            trailTex = MakeColorTex(128, 16, (u, v) =>
            {
                double t = (u + 1) * .5; uint c = DruidSlashVfxTimeline.TrailColor(t); float a = Mathf.Clamp01((1 - Mathf.Abs(v)) * 3f) * (float)DruidSlashVfxTimeline.TrailAlphaAlong(t);
                return new Color32((byte)((c >> 16) & 255), (byte)((c >> 8) & 255), (byte)(c & 255), (byte)(a * 255));
            });
            var tgo = new GameObject("slashTrail"); tgo.transform.SetParent(root, false);
            tgo.AddComponent<MeshFilter>().sharedMesh = trailMesh;
            trailR = tgo.AddComponent<MeshRenderer>(); trailR.sharedMaterial = NativeDruidArt.Additive;   // KiSlashAdditive: Blend One One, rgb * a * _Opacity
            trailR.sortingOrder = CoreOrder - 1; trailR.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; trailR.receiveShadows = false; trailR.enabled = false;
        }

        // u, v in -1..1 across the texture; returns alpha
        static Texture2D MakeTex(int w, int h, Func<float, float, float> alpha)
        {
            var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[w * h];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) px[y * w + x] = new Color32(255, 255, 255, (byte)(Mathf.Clamp01(alpha((x + .5f) / w * 2 - 1, (y + .5f) / h * 2 - 1)) * 255));
            tex.SetPixels32(px); tex.Apply(false, false); return tex;
        }

        static Texture2D MakeColorTex(int w, int h, Func<float, float, Color32> color)
        {
            var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[w * h];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) px[y * w + x] = color((x + .5f) / w * 2 - 1, (y + .5f) / h * 2 - 1);
            tex.SetPixels32(px); tex.Apply(false, false); return tex;
        }

        public void Dispose()
        {
            ground.Dispose();
            if (root != null) UnityEngine.Object.Destroy(root.gameObject);
            UnityEngine.Object.Destroy(mb.Mesh); UnityEngine.Object.Destroy(trailMesh); UnityEngine.Object.Destroy(trailTex);
            UnityEngine.Object.Destroy(lens); UnityEngine.Object.Destroy(puff); UnityEngine.Object.Destroy(glow);
            UnityEngine.Object.Destroy(lensTex); UnityEngine.Object.Destroy(puffTex); UnityEngine.Object.Destroy(glowTex);
        }

        public void Reset() { slams.Clear(); slashes.Clear(); prevState = null; windStart = -1; chunks = null; lastTick = int.MinValue; }

        static Color Rgb(uint h, double a) { return new Color(((h >> 16) & 255) / 255f, ((h >> 8) & 255) / 255f, (h & 255) / 255f, (float)Math.Max(0, Math.Min(1, a))); }

        // call every frame after the Simulation tick; `cam` = the world camera (billboards face it while the 3D floor is on)
        public void Update(Simulation sim, Camera cam)
        {
            int tick = sim.TickCount;
            if (tick < lastTick) Reset();
            lastTick = tick;
            alphaUsed = 0; addUsed = 0; mb.Clear();
            var druid = sim.Druid; DruidData dd = null;
            bool live = druid != null && druid.Remodel && druid.Boss != null && druid.Boss.Alive && druid.Data.TryGetValue(druid.Boss, out dd);
            double windAge = -1;
            if (live)
            {
                string s = dd.S;
                if (s == "bossSlamWind" && dd.St2 >= 1 && dd.St2 <= DruidSlamVfxTimeline.WindLiftTicks)
                {
                    windAge = DruidSlamVfxTimeline.WindLiftTicks - dd.St2;
                    if (windStart < 0) { windStart = tick - (int)windAge; chunks = DruidSlamVfxTimeline.Chunks(DruidSlamVfxTimeline.Seed(windStart, dd.X, dd.Y)); }
                }
                else { windStart = -1; chunks = null; }
                if (s == "bossSlam" && prevState != "bossSlam") StartSlam(dd, tick);
                if (s == "bossSlash")
                {
                    if (prevState != "bossSlash") StartSlash(dd, tick, sim.Player.Radius);
                    else if (slashes.Count > 0) { var cur = slashes[slashes.Count - 1]; cur.X = dd.X; cur.Y = dd.Y; }   // the boss steps along Facing during the swing: the trail follows
                }
                prevState = s;
            }
            else { prevState = null; windStart = -1; chunks = null; }

            int body = 0;
            if (live && chunks != null && DruidSlamVfxTimeline.ChunkActive(windAge)) body = DrawChunks(dd, windAge, cam, body);
            for (int i = slams.Count - 1; i >= 0; i--) if (tick - slams[i].Born > DruidSlamVfxTimeline.ActTicks + DruidSlamVfxTimeline.DecalLife) slams.RemoveAt(i);
            for (int i = slashes.Count - 1; i >= 0; i--) if (tick - slashes[i].Born > slashes[i].Life) slashes.RemoveAt(i);
            foreach (var sl in slams) GroundMesh(sl, tick - sl.Born);
            foreach (var sh in slashes) SlashGround(sh, tick - sh.Born);
            // newest first across both moves: over the cap the oldest are dropped
            int ia = slams.Count - 1, ib = slashes.Count - 1;
            while (ia >= 0 || ib >= 0)
            {
                if (ib < 0 || (ia >= 0 && slams[ia].Born >= slashes[ib].Born)) { body = DrawSprites(slams[ia], tick - slams[ia].Born, cam, body); ia--; }
                else { body = DrawSlashSprites(slashes[ib], tick - slashes[ib].Born, cam, body); ib--; }
            }
            DrawTrail(tick);
            BodySpritesDrawn = body; if (body > MaxBodySpritesDrawn) MaxBodySpritesDrawn = body;
            mb.Flush(); ground.Update(mb.V, mb.C, mb.T);
            for (int i = alphaUsed; i < alphaPool.Count; i++) alphaPool[i].enabled = false;
            for (int i = addUsed; i < addPool.Count; i++) addPool[i].enabled = false;
        }

        void StartSlam(DruidData d, int tick)
        {
            // act 0 = the first tick the state is bossSlam (St2 = SlamActive then); a late first look still lines the clock up with the Core's damage tick
            int born = tick - (int)Math.Round(Math.Max(0, Math.Min(DruidSlamVfxTimeline.ActTicks, DruidSlamVfxTimeline.ActTicks - d.St2)));
            int seed = DruidSlamVfxTimeline.Seed(born + DruidSlamVfxTimeline.ActTicks, d.X, d.Y);
            // the contact point: the staff tip on the Core formula (DruidBoss.StaffReachExtra along Facing + WeaponAng) with WeaponAng 0 = the value the Core sets on the damage tick
            double reach = d.R + DruidBoss.StaffReachExtra;
            slams.Add(new Slam { Born = born, Seed = seed, X = d.X, Y = d.Y, TipX = d.X + Math.Cos(d.Facing) * reach, TipY = d.Y + Math.Sin(d.Facing) * reach, Shards = DruidSlamVfxTimeline.Shards(seed), Dust = DruidSlamVfxTimeline.Dust(seed) });
            EnforceDecalCap();
            SlamsStarted++;
        }

        // decals (slam crack sets + slash furrows) share the cap of 8: over it the oldest goes first
        void EnforceDecalCap()
        {
            while (true)
            {
                int furrows = 0, oldest = -1;
                for (int i = 0; i < slashes.Count; i++) if (slashes[i].HasFurrow) { furrows++; if (oldest < 0) oldest = i; }
                if (slams.Count + furrows <= MaxDecals) return;
                if (oldest >= 0 && (slams.Count == 0 || slashes[oldest].Born < slams[0].Born)) slashes[oldest].FurrowDropped = true;
                else slams.RemoveAt(0);
            }
        }

        void StartSlash(DruidData d, int tick, double playerR)
        {
            // act 0 = the first tick the state is bossSlash (St2 = SlashActive then); a late first look still lines the clock up with the Core's damage tick (St2 == SlashHitAt)
            int act = (int)Math.Round(Math.Max(0, Math.Min(DruidSlashVfxTimeline.ActTicks, DruidSlashVfxTimeline.ActTicks - d.St2)));
            int born = tick - act;
            double adv = DruidSlashVfxTimeline.ForwardPerTick * (DruidSlashVfxTimeline.HitAct - act);   // the boss walks 2.5 px per tick along Facing until the damage tick
            double hx = d.X + Math.Cos(d.Facing) * adv, hy = d.Y + Math.Sin(d.Facing) * adv;
            int seed = DruidSlamVfxTimeline.Seed(born + DruidSlashVfxTimeline.HitAct, hx, hy);
            double reach = d.R + DruidBoss.StaffReachExtra;   // Core staff tip with WeaponAng 0 (the value it takes on the damage tick)
            var sl = new Slash
            {
                Born = born, Seed = seed, Idx = d.SlashIdx, X = d.X, Y = d.Y, HitX = hx, HitY = hy, Facing = d.Facing, BossR = d.R, PlayerR = playerR,
                Reach = DruidSlashVfxTimeline.Reach(d.R, playerR), TipX = hx + Math.Cos(d.Facing) * reach, TipY = hy + Math.Sin(d.Facing) * reach
            };
            if (DruidSlashVfxTimeline.HasStrike(sl.Idx)) { sl.Shards = DruidSlashVfxTimeline.Shards(seed); sl.Dust = DruidSlashVfxTimeline.Dust(seed); }
            slashes.Add(sl);
            EnforceDecalCap();
            SlashesStarted++;
        }

        // ---- floor layer: shock ring + radial cracks (uniform-colour triangles, so the receiver-depth projection can lie them on the real floor) ----
        void GroundMesh(Slam s, int age)
        {
            double ca = DruidSlamVfxTimeline.CrackAlpha(age);
            if (ca > 0)
            {
                double reach = DruidSlamVfxTimeline.CrackReach(age);
                for (int i = 0; i < DruidSlamVfxTimeline.CrackCount; i++) CrackStrip(s, DruidSlamVfxTimeline.Crack(i, s.Seed, reach), ca);
            }
            double ra = DruidSlamVfxTimeline.RingAlpha(age);
            if (ra > 0)
            {
                double outer = DruidSlamVfxTimeline.RingOuter(age), w = DruidSlamVfxTimeline.RingWidth(age), inner = Math.Max(0, outer - w), crest = outer - w * .4;
                mb.Arc(s.X, s.Y, inner, crest, 0, Math.PI * 2, Rgb(DruidSlamVfxTimeline.EarthDark, ra * .8));
                mb.Arc(s.X, s.Y, crest, outer, 0, Math.PI * 2, Rgb(DruidSlamVfxTimeline.EarthMid, ra));
            }
        }

        void CrackStrip(Slam s, DruidSlamVfxTimeline.Pt[] pts, double alpha)
        {
            Strip(s.X, s.Y, pts, DruidSlamVfxTimeline.CrackWidth, DruidSlamVfxTimeline.CrackCenter, DruidSlamVfxTimeline.CrackEdgeColor, alpha);
        }

        // jagged three-band strip (edge | centre | edge) along `pts` (offsets from cx, cy); width = f(Pt.R)
        void Strip(double cx, double cy, DruidSlamVfxTimeline.Pt[] pts, Func<double, double> width, uint centre, uint edge, double alpha)
        {
            int n = pts.Length; if (n < 2) return;
            var nx = new double[n]; var ny = new double[n]; var m = new double[n]; var sx = new double[n - 1]; var sy = new double[n - 1];
            for (int j = 0; j < n - 1; j++)
            {
                double dx = pts[j + 1].X - pts[j].X, dy = pts[j + 1].Y - pts[j].Y, l = Math.Max(1e-6, Math.Sqrt(dx * dx + dy * dy));
                sx[j] = -dy / l; sy[j] = dx / l;
            }
            for (int k = 0; k < n; k++)
            {
                double ax = k > 0 ? sx[k - 1] : sx[0], ay = k > 0 ? sy[k - 1] : sy[0], bx = k < n - 1 ? sx[k] : sx[n - 2], by = k < n - 1 ? sy[k] : sy[n - 2];
                double x = ax + bx, y = ay + by, l = Math.Sqrt(x * x + y * y); if (l < 1e-6) { x = bx; y = by; l = 1; }
                nx[k] = x / l; ny[k] = y / l; m[k] = 1 / Math.Max(.55, nx[k] * bx + ny[k] * by);
            }
            double[] f = { -.5, -.225, .225, .5 };
            Color[] col = { Rgb(edge, alpha * .85), Rgb(centre, alpha), Rgb(edge, alpha * .85) };
            for (int j = 0; j < n - 1; j++)
                for (int b = 0; b < 3; b++)
                {
                    double wa = width(pts[j].R) * m[j], wb = width(pts[j + 1].R) * m[j + 1];
                    mb.Quad(cx + pts[j].X + nx[j] * f[b] * wa, cy + pts[j].Y + ny[j] * f[b] * wa,
                            cx + pts[j + 1].X + nx[j + 1] * f[b] * wb, cy + pts[j + 1].Y + ny[j + 1] * f[b] * wb,
                            cx + pts[j + 1].X + nx[j + 1] * f[b + 1] * wb, cy + pts[j + 1].Y + ny[j + 1] * f[b + 1] * wb,
                            cx + pts[j].X + nx[j] * f[b + 1] * wa, cy + pts[j].Y + ny[j] * f[b + 1] * wa, col[b]);
                }
        }

        // ---- hit 3 furrow: a decal on the floor mesh, carved along the fan's middle line ----
        void SlashGround(Slash s, int age)
        {
            if (!s.HasFurrow) return;
            double ga = age - DruidSlashVfxTimeline.HitAct, alpha = DruidSlashVfxTimeline.GougeAlpha(ga); if (alpha <= 0) return;
            double len = DruidSlashVfxTimeline.GougeLength(s.PlayerR);
            var pts = DruidSlashVfxTimeline.Gouge(s.Seed, s.Facing, s.BossR, len, DruidSlashVfxTimeline.GougeReach(ga, len));
            Strip(s.HitX, s.HitY, pts, along => DruidSlashVfxTimeline.GougeWidth(along, len), DruidSlashVfxTimeline.GougeShadow, DruidSlashVfxTimeline.GougeEdge, alpha);
        }

        // ---- hits 1 and 2 trail: ONE additive strip, a horizontal band 0.35 H above the floor, outer edge on the judged boundary (R + pr + 300) ----
        void DrawTrail(int tick)
        {
            Slash cur = null;
            foreach (var s in slashes) if (DruidSlashVfxTimeline.HasTrail(s.Idx) && tick - s.Born >= 0 && tick - s.Born < DruidSlashVfxTimeline.TrailLife) cur = s;   // swings are >= 36 ticks apart: at most one is alive
            if (cur == null) { trailR.enabled = false; return; }
            double age = tick - cur.Born, op = DruidSlashVfxTimeline.TrailAlpha(age);
            if (op <= 0) { trailR.enabled = false; return; }
            var ang = DruidSlashVfxTimeline.TrailAngles(age, TrailSections);
            double outer = DruidSlashVfxTimeline.TrailOuter(cur.Reach), inner = DruidSlashVfxTimeline.TrailInner(cur.Reach), lift = DruidSlashVfxTimeline.TrailLift;
            tv.Clear(); tuv.Clear(); tt.Clear();
            for (int i = 0; i <= TrailSections; i++)
            {
                double a = cur.Facing + ang[i], c = Math.Cos(a), sn = Math.Sin(a), u = (double)i / TrailSections;
                tv.Add(World(cur.X + c * inner, cur.Y + sn * inner, lift)); tuv.Add(new Vector2((float)u, 0));
                tv.Add(World(cur.X + c * outer, cur.Y + sn * outer, lift)); tuv.Add(new Vector2((float)u, 1));
                if (i > 0) { int k = i * 2; tt.Add(k - 2); tt.Add(k - 1); tt.Add(k); tt.Add(k - 1); tt.Add(k + 1); tt.Add(k); }
            }
            trailMesh.Clear(); trailMesh.SetVertices(tv); trailMesh.SetUVs(0, tuv); trailMesh.SetTriangles(tt, 0); trailMesh.bounds = new Bounds(Vector3.zero, new Vector3(2000, 2000, 2000));
            trailR.GetPropertyBlock(trailBlock); trailBlock.SetTexture("_MainTex", trailTex); trailBlock.SetFloat(NativeDruidArt.Opacity, (float)op); trailR.SetPropertyBlock(trailBlock);
            trailR.transform.position = Vector3.zero; trailR.transform.rotation = Quaternion.identity; trailR.transform.localScale = Vector3.one;
            trailR.enabled = true;
        }

        // ---- hit 3 ground strike sprites: core + shards + dust at the staff tip ----
        int DrawSlashSprites(Slash s, int age, Camera cam, int body)
        {
            if (!DruidSlashVfxTimeline.HasStrike(s.Idx)) return body;
            double ca = age - DruidSlashVfxTimeline.HitAct;
            if (ca >= 0 && ca < DruidSlamVfxTimeline.CoreLife)
            {
                double d = DruidSlashVfxTimeline.StrikeCoreDiameter * DruidSlashVfxTimeline.StrikeCoreScale(ca);
                Put(true, glow, World(s.TipX, s.TipY, d * .22), d, d, 0, Rgb(DruidSlashVfxTimeline.StrikeCoreColor(ca), 1), (float)DruidSlashVfxTimeline.StrikeCoreAlpha(ca), CoreOrder, cam);
            }
            foreach (var sh in s.Shards)
            {
                double sa = age - sh.SpawnAct, al = DruidSlamVfxTimeline.ShardAlpha(sh, sa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                double ang = s.Facing + sh.Angle, dx = Math.Cos(ang), dy = Math.Sin(ang), tr = DruidSlamVfxTimeline.ShardTravel(sh, sa);
                float sang = ScreenAngle(cam, World(s.TipX, s.TipY, 0), World(s.TipX + dx * 100, s.TipY + dy * 100, 0));
                Put(false, lens, World(s.TipX + dx * tr, s.TipY + dy * tr, DruidSlamVfxTimeline.ShardHeight(sh, sa)), sh.Length, sh.Width, sang, Rgb(sh.Color, al), 1, ShardOrder, cam); body++;
            }
            foreach (var p in s.Dust)
            {
                double pa = age - p.SpawnAct, al = DruidSlamVfxTimeline.DustAlpha(p, pa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                Put(false, puff, World(s.TipX + p.X, s.TipY + p.Y, DruidSlamVfxTimeline.DustLift(p, pa)), p.Size, DruidSlamVfxTimeline.DustHeight(p), 0, Rgb(p.Color, al), 1, DustOrder, cam); body++;
            }
            return body;
        }

        // ---- sprites ----
        int DrawChunks(DruidData d, double windAge, Camera cam, int body)
        {
            double a = DruidSlamVfxTimeline.ChunkAlpha(windAge);
            foreach (var c in chunks)
            {
                if (body >= MaxBodySprites) break;
                var at = World(d.X + c.X, d.Y + c.Y, DruidSlamVfxTimeline.ChunkLiftCore(c, windAge));
                Put(false, lens, at, c.Length, c.Width, (float)c.Angle, Rgb(c.Color, a), 1, DustOrder, cam); body++;
            }
            return body;
        }

        int DrawSprites(Slam s, int age, Camera cam, int body)
        {
            // contact core: additive, above the actors; the hot centre is the tint at tick 0 (#fff4d0 -> #d49a5c)
            if (age >= 0 && age < DruidSlamVfxTimeline.CoreLife)
            {
                double d = DruidSlamVfxTimeline.CoreDiameter * DruidSlamVfxTimeline.CoreScale(age);
                Put(true, glow, World(s.TipX, s.TipY, d * .22), d, d, 0, Rgb(DruidSlamVfxTimeline.CoreColor(age), 1), (float)DruidSlamVfxTimeline.CoreAlpha(age), CoreOrder, cam);
            }

            foreach (var sh in s.Shards)
            {
                double sa = age - sh.SpawnAct, al = DruidSlamVfxTimeline.ShardAlpha(sh, sa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                double dx = Math.Cos(sh.Angle), dy = Math.Sin(sh.Angle), tr = DruidSlamVfxTimeline.ShardTravel(sh, sa);
                float ang = ScreenAngle(cam, World(s.X, s.Y, 0), World(s.X + dx * 100, s.Y + dy * 100, 0));
                Put(false, lens, World(s.X + dx * tr, s.Y + dy * tr, DruidSlamVfxTimeline.ShardHeight(sh, sa)), sh.Length, sh.Width, ang, Rgb(sh.Color, al), 1, ShardOrder, cam); body++;
            }
            foreach (var p in s.Dust)
            {
                double pa = age - p.SpawnAct, al = DruidSlamVfxTimeline.DustAlpha(p, pa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                Put(false, puff, World(s.X + p.X, s.Y + p.Y, DruidSlamVfxTimeline.DustLift(p, pa)), p.Size, DruidSlamVfxTimeline.DustHeight(p), 0, Rgb(p.Color, al), 1, DustOrder, cam); body++;
            }
            return body;
        }

        // Core px + height (Core px) -> world. 3D floor: ground point + up; flat 2D: up on screen is -y.
        static Vector3 World(double x, double y, double lift)
        {
            var p = NativeRemodel3D.Point(x, y) + Vector3.up * (float)(lift / 100);
            if (NativeRemodel3D.Active) p += Vector3.up * .03f;
            return p;
        }

        // screen-space angle (counter-clockwise, y up) of the direction a -> b
        static float ScreenAngle(Camera cam, Vector3 a, Vector3 b)
        {
            if (NativeRemodel3D.Active && cam != null && !cam.orthographic)
            {
                var sa = cam.WorldToScreenPoint(a); var sb = cam.WorldToScreenPoint(b);
                return Mathf.Atan2(sb.y - sa.y, sb.x - sa.x);
            }
            return Mathf.Atan2(b.y - a.y, b.x - a.x);
        }

        void Put(bool additive, Sprite sprite, Vector3 pos, double wCore, double hCore, float screenAngle, Color tint, float opacity, int order, Camera cam)
        {
            SpriteRenderer r;
            if (additive)
            {
                if (addUsed >= addPool.Count) { var go = new GameObject("fxAdd"); go.transform.SetParent(root, false); var rr = go.AddComponent<SpriteRenderer>(); rr.sharedMaterial = NativeDruidArt.Additive; addPool.Add(rr); }
                r = addPool[addUsed++];
            }
            else
            {
                if (alphaUsed >= alphaPool.Count) { var go = new GameObject("fx"); go.transform.SetParent(root, false); alphaPool.Add(go.AddComponent<SpriteRenderer>()); }
                r = alphaPool[alphaUsed++];
            }
            r.enabled = true; r.sprite = sprite; r.sortingOrder = order; r.color = tint;
            var q = Quaternion.Euler(0, 0, screenAngle * Mathf.Rad2Deg);
            r.transform.rotation = NativeRemodel3D.Active && cam != null ? cam.transform.rotation * q : q;
            r.transform.position = pos;
            r.transform.localScale = new Vector3((float)wCore / sprite.rect.width, (float)hCore / sprite.rect.height, 1);
            if (additive) { r.GetPropertyBlock(block); block.SetFloat(NativeDruidArt.Opacity, opacity); r.SetPropertyBlock(block); }
        }
    }
}
