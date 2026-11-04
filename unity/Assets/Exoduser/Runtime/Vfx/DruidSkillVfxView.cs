using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Body VFX of the remodelled 1-1 druid's moves (docs/5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md). It only READS Simulation.Druid (state S / St2 / Facing / X / Y,
    // compared with the previous state like NativeBossView.prevBossState) and never writes back: damage, timing and shake stay the Core's.
    // Textured rework (G2 FAIL 11-04): every body layer is a Blender earth sheet (Resources/Art/vfx/boss/earth: earth_dust_burst, debris_chunks, ground_crack_radial*,
    // ground_gouge_linear*, whip_smear*) instead of clean vector shapes.
    //  (2) slam: wind-up debris stills lift, contact core (HDR additive), earth_dust_burst whose visible edge reaches the Core r260 on act +6 (+ 3 small ones on the rim),
    //      debris stills flying out, a crack decal projected on the floor (opens from the centre over act 0..+6), low dust.
    //  (1) slashCombo: hits 1 and 2 sweep a whip_smear ribbon that follows the real staff head (rig lantern_orb socket, else the Core staff-tip formula) for 6 ticks;
    //      hit 3 strikes the ground at the staff tip (HDR core, small dust, debris) and leaves a ground_gouge_linear decal down the fan's middle line.
    // Every number is DruidSlamVfxTimeline / DruidSlashVfxTimeline (pure, checked by unity/Tools/druid-skill-vfx-tests). Clock = Core ticks, so pause / frame stepping cannot consume the effect.
    // Draw order: decals (projected on the real floor, sorting -8994) < dust -8989 < debris -8988 < telegraph decal -8985 < actors; only the contact core and the ribbon are additive
    // above the actors. Limits (shared by both moves): 24 body sprites at once (oldest dropped first), 8 decals.
    public sealed class DruidSkillVfxView : IDisposable
    {
        const int DecalOrder = -8994, DustOrder = -8989, ShardOrder = -8988, CoreOrder = 29999, MaxBodySprites = 24, MaxDecals = 8;
        const string EarthDir = "Art/vfx/boss/earth/";
        const double FallbackStaffLift = .45 * DruidSlamVfxTimeline.HeroH;   // staff head height used when the rig socket is missing (Core formula is 2D)
        static readonly Color White = new Color(1, 1, 1, 1);

        sealed class Slam { public int Born, Seed, Variant; public double X, Y, TipX, TipY, Angle; public DruidSlamVfxTimeline.Debris[] Shards; public DruidSlamVfxTimeline.Puff[] Dust; public DruidSlamVfxTimeline.RingDust[] Ring; }
        // one swing of slashCombo. HitX / HitY = where the boss stands on the damage tick (gouge, tip). Pts / PtTick = the staff head's recorded path (hits 1 and 2).
        sealed class Slash
        {
            public int Born, Seed, Idx, Variant; public bool FurrowDropped; public double HitX, HitY, Facing, BossR, PlayerR, TipX, TipY;
            public DruidSlamVfxTimeline.Debris[] Shards;
            public readonly List<Vector3> Pts = new List<Vector3>(); public readonly List<int> PtTick = new List<int>();
            public bool HasFurrow { get { return DruidSlashVfxTimeline.HasStrike(Idx) && !FurrowDropped; } }
            public int Life { get { return DruidSlashVfxTimeline.HasStrike(Idx) ? DruidSlashVfxTimeline.HitAct + DruidSlashVfxTimeline.GougeLife : DruidSlashVfxTimeline.TrailLife; } }
        }

        // sprites this view owns (the 3D billboard pass must not lift them like characters: pivot = centre of the effect)
        static readonly HashSet<SpriteRenderer> owned = new HashSet<SpriteRenderer>();
        public static bool IsCentered(SpriteRenderer sprite) { return sprite != null && owned.Contains(sprite); }

        readonly Transform root;
        readonly List<SpriteRenderer> alphaPool = new List<SpriteRenderer>(), addPool = new List<SpriteRenderer>(), decalPool = new List<SpriteRenderer>(); int alphaUsed, addUsed, decalUsed;
        readonly Sprite glow; readonly Texture2D glowTex; readonly Material spriteMaterial;
        readonly Texture2D dustTex, debrisTex; readonly Sprite[] dustFrames = new Sprite[DruidEarthSheetTable.Frames], debrisFrames = new Sprite[DruidSlamVfxTimeline.DebrisFrames];
        readonly Texture2D[] crackTex = new Texture2D[DruidSlamVfxTimeline.CrackVariants], gougeTex = new Texture2D[DruidSlashVfxTimeline.GougeVariants], smearTex = new Texture2D[DruidSlashVfxTimeline.RibbonVariants];
        readonly Sprite[] crackSprites = new Sprite[DruidSlamVfxTimeline.CrackVariants], gougeSprites = new Sprite[DruidSlashVfxTimeline.GougeVariants];
        readonly Mesh trailMesh = new Mesh { name = "druid-slash-ribbon" }; readonly MeshRenderer trailR; readonly MaterialPropertyBlock trailBlock = new MaterialPropertyBlock();
        readonly List<Vector3> tv = new List<Vector3>(); readonly List<Vector2> tuv = new List<Vector2>(); readonly List<int> tt = new List<int>(); readonly List<Vector3> rib = new List<Vector3>();
        readonly List<Slash> slashes = new List<Slash>();
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        readonly List<Slam> slams = new List<Slam>();
        string prevState; int lastTick = int.MinValue, windStart = -1; DruidSlamVfxTimeline.Chunk[] chunks;
        public int SlamsStarted, SlashesStarted, MaxBodySpritesDrawn, BodySpritesDrawn;   // QA
        public bool OrbGlowDrawn, RibbonOnRig;
        public int RibbonPoints;

        public DruidSkillVfxView(Transform parent)
        {
            root = new GameObject("DruidSkillVfxView").transform; root.SetParent(parent, false);
            var probe = new GameObject("probe").AddComponent<SpriteRenderer>(); spriteMaterial = probe.sharedMaterial; UnityEngine.Object.Destroy(probe.gameObject);   // default sprite material: alpha blend (also what the floor projection expects)
            glowTex = MakeTex(64, 64, (u, v) => Mathf.Pow(Mathf.Clamp01(1 - Mathf.Sqrt(u * u + v * v)), 1.7f));
            glow = Sprite.Create(glowTex, new Rect(0, 0, 64, 64), new Vector2(.5f, .5f), 100);
            dustTex = Resources.Load<Texture2D>(EarthDir + "earth_dust_burst"); debrisTex = Resources.Load<Texture2D>(EarthDir + "debris_chunks");
            if (dustTex != null)
                for (int i = 0; i < dustFrames.Length; i++) { int r = i / DruidEarthSheetTable.Cols, c = i % DruidEarthSheetTable.Cols; dustFrames[i] = Sprite.Create(dustTex, new Rect(c * 256, (DruidEarthSheetTable.Rows - 1 - r) * 256, 256, 256), new Vector2(.5f, .5f), 100); }
            if (debrisTex != null)
                for (int i = 0; i < debrisFrames.Length; i++) { int r = i / 4, c = i % 4; debrisFrames[i] = Sprite.Create(debrisTex, new Rect(c * 128, (3 - r) * 128, 128, 128), new Vector2(.5f, .5f), 100); }
            string[] crack = { "ground_crack_radial", "ground_crack_radial_v2", "ground_crack_radial_v3", "ground_crack_radial_v4" }, gouge = { "ground_gouge_linear", "ground_gouge_linear_v2", "ground_gouge_linear_v3" }, smear = { "whip_smear", "whip_smear_v2", "whip_smear_v3" };
            for (int i = 0; i < crack.Length; i++) { crackTex[i] = Resources.Load<Texture2D>(EarthDir + crack[i]); if (crackTex[i] != null) crackSprites[i] = FullSprite(crackTex[i]); }
            for (int i = 0; i < gouge.Length; i++) { gougeTex[i] = Resources.Load<Texture2D>(EarthDir + gouge[i]); if (gougeTex[i] != null) gougeSprites[i] = FullSprite(gougeTex[i]); }
            for (int i = 0; i < smear.Length; i++) smearTex[i] = Resources.Load<Texture2D>(EarthDir + smear[i]);
            var tgo = new GameObject("slashRibbon"); tgo.transform.SetParent(root, false);
            tgo.AddComponent<MeshFilter>().sharedMesh = trailMesh;
            trailR = tgo.AddComponent<MeshRenderer>(); trailR.sharedMaterial = NativeDruidArt.Additive;   // KiSlashAdditive: Blend One One, rgb * a * _Opacity
            trailR.sortingOrder = CoreOrder - 1; trailR.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; trailR.receiveShadows = false; trailR.enabled = false;
        }

        static Sprite FullSprite(Texture2D t) { return Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(.5f, .5f), 100); }

        // u, v in -1..1 across the texture; returns alpha
        static Texture2D MakeTex(int w, int h, Func<float, float, float> alpha)
        {
            var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[w * h];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) px[y * w + x] = new Color32(255, 255, 255, (byte)(Mathf.Clamp01(alpha((x + .5f) / w * 2 - 1, (y + .5f) / h * 2 - 1)) * 255));
            tex.SetPixels32(px); tex.Apply(false, false); return tex;
        }

        public void Dispose()
        {
            foreach (var r in alphaPool) owned.Remove(r);
            foreach (var r in addPool) owned.Remove(r);
            foreach (var r in decalPool) owned.Remove(r);
            if (root != null) UnityEngine.Object.Destroy(root.gameObject);
            UnityEngine.Object.Destroy(trailMesh); UnityEngine.Object.Destroy(glow); UnityEngine.Object.Destroy(glowTex);
            foreach (var s in dustFrames) if (s != null) UnityEngine.Object.Destroy(s);
            foreach (var s in debrisFrames) if (s != null) UnityEngine.Object.Destroy(s);
            foreach (var s in crackSprites) if (s != null) UnityEngine.Object.Destroy(s);
            foreach (var s in gougeSprites) if (s != null) UnityEngine.Object.Destroy(s);
        }

        public void Reset() { slams.Clear(); slashes.Clear(); prevState = null; windStart = -1; chunks = null; lastTick = int.MinValue; }

        // call every frame after the Simulation tick; `cam` = the world camera (billboards face it while the 3D floor is on)
        public void Update(Simulation sim, Camera cam)
        {
            int tick = sim.TickCount;
            if (tick < lastTick) Reset();
            lastTick = tick;
            alphaUsed = 0; addUsed = 0; decalUsed = 0;
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
                    RecordRibbon(dd, tick);
                }
                prevState = s;
            }
            else { prevState = null; windStart = -1; chunks = null; }

            int body = 0;
            if (live && chunks != null && DruidSlamVfxTimeline.ChunkActive(windAge)) body = DrawChunks(dd, windAge, cam, body);
            for (int i = slams.Count - 1; i >= 0; i--) if (tick - slams[i].Born > DruidSlamVfxTimeline.ActTicks + DruidSlamVfxTimeline.DecalLife) slams.RemoveAt(i);
            for (int i = slashes.Count - 1; i >= 0; i--) if (tick - slashes[i].Born > slashes[i].Life) slashes.RemoveAt(i);
            foreach (var sl in slams) SlamDecal(sl, tick - sl.Born);
            foreach (var sh in slashes) SlashDecal(sh, tick - sh.Born);
            // newest first across both moves: over the cap the oldest are dropped
            int ia = slams.Count - 1, ib = slashes.Count - 1;
            while (ia >= 0 || ib >= 0)
            {
                if (ib < 0 || (ia >= 0 && slams[ia].Born >= slashes[ib].Born)) { body = DrawSprites(slams[ia], tick - slams[ia].Born, cam, body); ia--; }
                else { body = DrawSlashSprites(slashes[ib], tick - slashes[ib].Born, cam, body); ib--; }
            }
            DrawRibbon(tick, cam);
            if (live && dd.S == "bossSlashWind" && DruidSlashVfxTimeline.HasOrbGlow(dd.SlashIdx)) DrawOrbGlow(dd.St2, cam);
            BodySpritesDrawn = body; if (body > MaxBodySpritesDrawn) MaxBodySpritesDrawn = body;
            for (int i = alphaUsed; i < alphaPool.Count; i++) alphaPool[i].enabled = false;
            for (int i = addUsed; i < addPool.Count; i++) addPool[i].enabled = false;
            for (int i = decalUsed; i < decalPool.Count; i++) decalPool[i].enabled = false;
            foreach (var d in decalPool) NativeGroundSkillSurface.Project(d);   // the floor projection reads the sprite state set above
        }

        // hit-3 telegraph: the lantern orb warms on the rig's real socket. The rig samples its pose in LateUpdate, so this reads the previous frame (one frame behind).
        void DrawOrbGlow(double remaining, Camera cam)
        {
            double a = DruidSlashVfxTimeline.OrbAlpha(remaining); Vector3 orb;
            if (a <= 0 || !NativeDruidRigPixelView.TryGetOrbSocketWorldPosition(out orb)) { OrbGlowDrawn = false; return; }
            double d = DruidSlashVfxTimeline.OrbDiameter;
            Put(true, glow, orb, d, d, 0, White, (float)a, CoreOrder, cam); OrbGlowDrawn = true;
        }

        void StartSlam(DruidData d, int tick)
        {
            // act 0 = the first tick the state is bossSlam (St2 = SlamActive then); a late first look still lines the clock up with the Core's damage tick
            int born = tick - (int)Math.Round(Math.Max(0, Math.Min(DruidSlamVfxTimeline.ActTicks, DruidSlamVfxTimeline.ActTicks - d.St2)));
            int seed = DruidSlamVfxTimeline.Seed(born + DruidSlamVfxTimeline.ActTicks, d.X, d.Y);
            // the contact point: the staff tip on the Core formula (DruidBoss.StaffReachExtra along Facing + WeaponAng) with WeaponAng 0 = the value the Core sets on the damage tick
            double reach = d.R + DruidBoss.StaffReachExtra;
            slams.Add(new Slam
            {
                Born = born, Seed = seed, Variant = DruidSlamVfxTimeline.CrackVariant(seed), Angle = DruidSlamVfxTimeline.CrackAngle(seed), X = d.X, Y = d.Y,
                TipX = d.X + Math.Cos(d.Facing) * reach, TipY = d.Y + Math.Sin(d.Facing) * reach,
                Shards = DruidSlamVfxTimeline.Debrises(seed), Dust = DruidSlamVfxTimeline.Dust(seed), Ring = DruidSlamVfxTimeline.RingDusts(seed)
            });
            EnforceDecalCap();
            SlamsStarted++;
        }

        // decals (slam crack sets + slash gouges) share the cap of 8: over it the oldest goes first
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
                Born = born, Seed = seed, Idx = d.SlashIdx, HitX = hx, HitY = hy, Facing = d.Facing, BossR = d.R, PlayerR = playerR,
                TipX = hx + Math.Cos(d.Facing) * reach, TipY = hy + Math.Sin(d.Facing) * reach
            };
            sl.Variant = DruidSlashVfxTimeline.HasStrike(sl.Idx) ? DruidSlashVfxTimeline.GougeVariant(seed) : DruidSlashVfxTimeline.RibbonVariant(seed);
            if (DruidSlashVfxTimeline.HasStrike(sl.Idx)) sl.Shards = DruidSlashVfxTimeline.Debrises(seed);
            slashes.Add(sl);
            EnforceDecalCap();
            SlashesStarted++;
        }

        // ---- floor layer: ground decals projected on the real floor (NativeGroundSkillSurface, like the pooled blood stamps) ----
        // Core px + euler z (deg) -> a pooled floor sprite. Size in Core px (the sprite is 100 px per world unit).
        void Decal(Sprite sprite, double x, double y, double eulerZ, double wCore, double hCore, double alpha)
        {
            if (sprite == null || alpha <= 0 || wCore <= 0 || hCore <= 0 || decalUsed >= MaxDecals) return;
            if (decalUsed >= decalPool.Count)
            {
                var go = new GameObject("fxGround"); go.transform.SetParent(root, false);
                var r = go.AddComponent<SpriteRenderer>(); r.sharedMaterial = spriteMaterial; r.sortingOrder = DecalOrder;
                r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; r.receiveShadows = false;
                NativeGroundSkillSurface.Mark(r); decalPool.Add(r); owned.Add(r);
            }
            var d = decalPool[decalUsed++];
            d.enabled = true; d.sprite = sprite; d.color = new Color(1, 1, 1, (float)Math.Min(1, alpha));
            d.transform.SetPositionAndRotation(World(x, y, 0), Quaternion.Euler(0, 0, (float)eulerZ));
            d.transform.localScale = new Vector3((float)wCore / sprite.rect.width, (float)hCore / sprite.rect.height, 1);
        }

        // slam crack decal: opens from the centre act 0 -> +6 (scale 0 -> 1: GroundSkillProjection has no radial mask property), kept 3 s, last 1 s fades
        void SlamDecal(Slam s, int age)
        {
            double alpha = DruidSlamVfxTimeline.CrackAlpha(age), reveal = DruidSlamVfxTimeline.CrackReveal(age);
            if (alpha <= 0 || reveal <= 0) return;
            double size = DruidSlamVfxTimeline.CrackSize(s.Variant) * reveal;
            Decal(crackSprites[s.Variant], s.X, s.Y, s.Angle * Mathf.Rad2Deg, size, size, alpha);
        }

        // hit 3 gouge decal: a ground_gouge_linear variant along the fan's middle line, from the body edge to the judged boundary
        void SlashDecal(Slash s, int age)
        {
            if (!s.HasFurrow) return;
            double alpha = DruidSlashVfxTimeline.GougeAlpha(age - DruidSlashVfxTimeline.HitAct); if (alpha <= 0) return;
            double len = DruidSlashVfxTimeline.GougeLength(s.PlayerR), size = DruidSlashVfxTimeline.GougeSize(s.Variant, len), along = DruidSlashVfxTimeline.GougeCentreAlong(s.Variant, size, s.BossR, len);
            double h = size * DruidEarthSheetTable.GougeSheetH / DruidEarthSheetTable.GougeSheetW;
            Decal(gougeSprites[s.Variant], s.HitX + Math.Cos(s.Facing) * along, s.HitY + Math.Sin(s.Facing) * along, -s.Facing * Mathf.Rad2Deg, size, h, alpha);   // Core y is down: the world angle is -Facing
        }

        // ---- hits 1 and 2: whip_smear ribbon on the staff head's recorded path ----
        void RecordRibbon(DruidData d, int tick)
        {
            if (slashes.Count == 0) return;
            var cur = slashes[slashes.Count - 1];
            int age = tick - cur.Born;
            if (!DruidSlashVfxTimeline.HasTrail(cur.Idx) || age < 0 || age >= DruidSlashVfxTimeline.TrailLife) return;
            Vector3 p;
            if (NativeDruidRigPixelView.TryGetOrbSocketWorldPosition(out p)) RibbonOnRig = true;
            else
            {
                double x, y; DruidSlashVfxTimeline.StaffTip(d.X, d.Y, d.Facing, d.WeaponAng, d.R, out x, out y);
                p = World(x, y, FallbackStaffLift); RibbonOnRig = false;
            }
            int n = cur.Pts.Count;
            if (n > 0 && cur.PtTick[n - 1] == tick) cur.Pts[n - 1] = p;   // one sample per tick: the newest frame wins
            else { cur.Pts.Add(p); cur.PtTick.Add(tick); }
        }

        void DrawRibbon(int tick, Camera cam)
        {
            Slash cur = null;
            foreach (var s in slashes) if (DruidSlashVfxTimeline.HasTrail(s.Idx) && tick - s.Born >= 0 && tick - s.Born < DruidSlashVfxTimeline.TrailLife) cur = s;   // swings are >= 36 ticks apart: at most one is alive
            RibbonPoints = 0;
            if (cur == null) { trailR.enabled = false; return; }
            double age = tick - cur.Born, op = DruidSlashVfxTimeline.TrailAlpha(age);
            var tex = smearTex[cur.Variant];
            if (op <= 0 || tex == null) { trailR.enabled = false; return; }
            int oldest = cur.Born + DruidSlashVfxTimeline.RibbonOldestAct(age);
            rib.Clear();
            for (int i = cur.Pts.Count - 1; i >= 0; i--) { if (cur.PtTick[i] < oldest) break; rib.Add(cur.Pts[i]); }   // newest first
            RibbonPoints = rib.Count;
            if (rib.Count < 2) { trailR.enabled = false; return; }
            double total = 0; for (int i = 1; i < rib.Count; i++) total += Vector3.Distance(rib[i - 1], rib[i]);
            if (total < 1e-4) { trailR.enabled = false; return; }
            Vector3 fwd = cam != null ? cam.transform.forward : Vector3.forward, up = cam != null ? cam.transform.up : Vector3.up;
            float half = (float)(DruidSlashVfxTimeline.RibbonWidth / 100 / 2), u0 = (float)DruidSlashVfxTimeline.RibbonU0(cur.Variant), u1 = (float)DruidSlashVfxTimeline.RibbonU1(cur.Variant);
            tv.Clear(); tuv.Clear(); tt.Clear();
            double run = 0;
            for (int i = 0; i < rib.Count; i++)
            {
                if (i > 0) run += Vector3.Distance(rib[i - 1], rib[i]);
                float t = (float)(run / total);
                Vector3 dir = rib[Math.Max(0, i - 1)] - rib[Math.Min(rib.Count - 1, i + 1)];
                Vector3 side = Vector3.Cross(dir, fwd); side = side.sqrMagnitude < 1e-10f ? up : side.normalized;
                float w = half * (1 - .6f * t), u = Mathf.Lerp(u0, u1, t);   // a little thinner towards the tail
                tv.Add(rib[i] + side * w); tuv.Add(new Vector2(u, 1));
                tv.Add(rib[i] - side * w); tuv.Add(new Vector2(u, 0));
                if (i > 0) { int k = i * 2; tt.Add(k - 2); tt.Add(k - 1); tt.Add(k); tt.Add(k - 1); tt.Add(k + 1); tt.Add(k); }
            }
            trailMesh.Clear(); trailMesh.SetVertices(tv); trailMesh.SetUVs(0, tuv); trailMesh.SetTriangles(tt, 0); trailMesh.bounds = new Bounds(Vector3.zero, new Vector3(2000, 2000, 2000));
            trailR.GetPropertyBlock(trailBlock); trailBlock.SetTexture("_MainTex", tex); trailBlock.SetFloat(NativeDruidArt.Opacity, (float)op); trailR.SetPropertyBlock(trailBlock);
            trailR.transform.position = Vector3.zero; trailR.transform.rotation = Quaternion.identity; trailR.transform.localScale = Vector3.one;
            trailR.enabled = true;
        }

        // ---- hit 3 ground strike sprites: HDR core + small dust + debris at the staff tip ----
        int DrawSlashSprites(Slash s, int age, Camera cam, int body)
        {
            if (!DruidSlashVfxTimeline.HasStrike(s.Idx)) return body;
            double ca = age - DruidSlashVfxTimeline.HitAct;
            if (ca >= 0 && ca < DruidSlamVfxTimeline.CoreLife)
            {
                double d = DruidSlashVfxTimeline.StrikeCoreDiameter * DruidSlashVfxTimeline.StrikeCoreScale(ca);
                Put(true, glow, World(s.TipX, s.TipY, d * .22), d, d, 0, White, (float)DruidSlashVfxTimeline.StrikeCoreOpacity(ca), CoreOrder, cam);
            }
            body = DrawDust(body, s.TipX, s.TipY, DruidSlashVfxTimeline.StrikeDustSize, ca, DruidSlashVfxTimeline.StrikeDustLife, DruidSlashVfxTimeline.StrikeDustAlpha(ca), 0, cam);
            foreach (var sh in s.Shards)
            {
                double sa = age - sh.SpawnAct, al = DruidSlamVfxTimeline.DebrisAlpha(sh, sa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                double ang = s.Facing + sh.Angle, dx = Math.Cos(ang), dy = Math.Sin(ang), tr = DruidSlamVfxTimeline.DebrisTravel(sh, sa);
                Put(false, debrisFrames[sh.Frame], World(s.TipX + dx * tr, s.TipY + dy * tr, DruidSlamVfxTimeline.DebrisHeight(sh, sa)), sh.Size, sh.Size, (float)DruidSlamVfxTimeline.DebrisRotation(sh, sa), new Color(1, 1, 1, (float)al), 1, ShardOrder, cam); body++;
            }
            return body;
        }

        // one earth_dust_burst sprite (24 frames over `life` ticks)
        int DrawDust(int body, double x, double y, double size, double age, int life, double alpha, double lift, Camera cam)
        {
            if (alpha <= 0 || age < 0 || age >= life || body >= MaxBodySprites) return body;
            var sp = dustFrames[DruidSlamVfxTimeline.DustFrame(age, life)];
            if (sp == null) return body;
            Put(false, sp, World(x, y, lift), size, size, 0, new Color(1, 1, 1, (float)alpha), 1, DustOrder, cam);
            return body + 1;
        }

        // ---- sprites ----
        int DrawChunks(DruidData d, double windAge, Camera cam, int body)
        {
            double a = DruidSlamVfxTimeline.ChunkAlpha(windAge);
            foreach (var c in chunks)
            {
                if (body >= MaxBodySprites) break;
                var at = World(d.X + c.X, d.Y + c.Y, DruidSlamVfxTimeline.ChunkLiftCore(c, windAge));
                Put(false, debrisFrames[c.Frame], at, c.Size, c.Size, (float)c.Angle, new Color(1, 1, 1, (float)a), 1, DustOrder, cam); body++;
            }
            return body;
        }

        int DrawSprites(Slam s, int age, Camera cam, int body)
        {
            // contact core: additive HDR (_Opacity up to 2.4), above the actors
            if (age >= 0 && age < DruidSlamVfxTimeline.CoreLife)
            {
                double d = DruidSlamVfxTimeline.CoreDiameter * DruidSlamVfxTimeline.CoreScale(age);
                Put(true, glow, World(s.TipX, s.TipY, d * .22), d, d, 0, White, (float)DruidSlamVfxTimeline.CoreOpacity(age), CoreOrder, cam);
            }
            // shock dust: the visible edge of the +6 frame is the hit circle
            body = DrawDust(body, s.X, s.Y, DruidSlamVfxTimeline.DustMainSize, age, DruidSlamVfxTimeline.DustMainLife, DruidSlamVfxTimeline.DustMainAlpha(age), 0, cam);
            foreach (var rd in s.Ring)
            {
                double pa = age - rd.SpawnAct;
                body = DrawDust(body, s.X + rd.X, s.Y + rd.Y, rd.Size, pa, rd.Life, DruidSlamVfxTimeline.RingDustAlpha(rd, pa), 0, cam);
            }
            foreach (var sh in s.Shards)
            {
                double sa = age - sh.SpawnAct, al = DruidSlamVfxTimeline.DebrisAlpha(sh, sa); if (al <= 0) continue;
                if (body >= MaxBodySprites) return body;
                double dx = Math.Cos(sh.Angle), dy = Math.Sin(sh.Angle), tr = DruidSlamVfxTimeline.DebrisTravel(sh, sa);
                Put(false, debrisFrames[sh.Frame], World(s.X + dx * tr, s.Y + dy * tr, DruidSlamVfxTimeline.DebrisHeight(sh, sa)), sh.Size, sh.Size, (float)DruidSlamVfxTimeline.DebrisRotation(sh, sa), new Color(1, 1, 1, (float)al), 1, ShardOrder, cam); body++;
            }
            foreach (var p in s.Dust)
            {
                double pa = age - p.SpawnAct;
                body = DrawDust(body, s.X + p.X, s.Y + p.Y, p.Size, pa, p.Life, DruidSlamVfxTimeline.DustAlpha(p, pa), DruidSlamVfxTimeline.DustLift(p, pa), cam);
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

        void Put(bool additive, Sprite sprite, Vector3 pos, double wCore, double hCore, float screenAngle, Color tint, float opacity, int order, Camera cam)
        {
            if (sprite == null) return;
            SpriteRenderer r;
            if (additive)
            {
                if (addUsed >= addPool.Count) { var go = new GameObject("fxAdd"); go.transform.SetParent(root, false); var rr = go.AddComponent<SpriteRenderer>(); rr.sharedMaterial = NativeDruidArt.Additive; addPool.Add(rr); owned.Add(rr); }
                r = addPool[addUsed++];
            }
            else
            {
                if (alphaUsed >= alphaPool.Count) { var go = new GameObject("fx"); go.transform.SetParent(root, false); var rr = go.AddComponent<SpriteRenderer>(); alphaPool.Add(rr); owned.Add(rr); }
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
