using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;
using Exoduser.UnityPort.Core;

// RM-1 VFX bridge (spec v2.1 U1): reads Core state, never writes it. Three signals feed the presentation:
//  * Simulation.DruidTelegraphs (RM-B1 read-only list, called once per tick after Tick) -> ground-decal parameters (DecalParams) + parry-glint / grab-eye events,
//  * Simulation.MaliceOrbBlasts / MaliceOrbLastX/Y (PC-B03b)                            -> player poison burst events,
//  * Simulation.Feedback (Ki slash)                                                       -> not consumed here (the views drain it); KiSlash VFX reads FeedbackEvent copies in stage 1.
// Pooling, per-frame event limit and off-screen skipping live here so every graph gets them. Pure data (DecalParams.From, EventBudget) is separate from the
// MonoBehaviour so it can be unit-checked in the editor without a scene.
namespace Exoduser.UnityPort.Vfx
{
    // Decal parameters in the units of SG_GroundDecal (metres, radians). Computed only from Core numbers (spec 3.3 "never by hand").
    public struct DecalParams
    {
        public int Shape;                 // 0 circle, 1 cone, 2 line (grows), 3 ring+gap, 4 arena minus safe zones
        public Vector2 Center;            // world metres (x = px / 100, y = -px / 100 : Core 2D world)
        public float Dir;                 // radians, +X of the decal local frame; world Y axis is flipped (px y goes down), so Dir is negated
        public float Radius, Angle, Length, Width, Inner, GapAngle, GapWidth, Grow, Progress;
        public Vector2 BoxSize;           // metres, decal box (project the shape with margin)
        public float Flash;               // 0..1 border pulse (60..90 ms before execution)
        public double[][] Safe;           // shape 4: {x, y, r} px of every safe zone (mask is baked by the caller)

        public const float PxToM = 0.01f;
        public const float Margin = 0.3f; // metres added around the shape so the border never touches the box edge
        public const float FlashLeadTicks = 5f;   // 83 ms: inside the spec's 60..90 ms before execution

        public static bool From(DruidTelegraph t, out DecalParams p)
        {
            p = default;
            if (t == null || t.Kind != DruidTeleKind.GroundDecal) return false;
            p.Center = VfxWorld.ToPlanar(t.X, t.Y);
            p.Dir = -(float)t.Dir;
            p.Progress = t.Total > 0 ? Mathf.Clamp01((float)(t.Elapsed / t.Total)) : 1f;
            p.Flash = t.Live ? 0f : (t.Remaining > 0 && t.Remaining <= FlashLeadTicks ? 1f : 0f);
            float r = (float)t.Radius * PxToM;
            switch (t.Shape)
            {
                case DruidTeleShape.Circle:
                    p.Shape = 0; p.Radius = r; p.Grow = 1f;
                    p.BoxSize = Vector2.one * (2f * r + 2f * Margin); break;
                case DruidTeleShape.Cone:
                    p.Shape = 1; p.Radius = r; p.Angle = (float)t.Angle; p.Grow = 1f;
                    p.BoxSize = Vector2.one * (2f * r + 2f * Margin); break;
                case DruidTeleShape.Line:
                case DruidTeleShape.Trail:
                {
                    // line: Core Length = full length (the charge: the farthest it can run), Width = full width; Progress = head length already travelled (move 4)
                    // trail: Length = origin to target, Progress = length already travelled (moves 7, 10)
                    p.Shape = 2; p.Length = (float)t.Length * PxToM; p.Radius = (float)t.Width * PxToM * 0.5f;
                    if (t.Shape == DruidTeleShape.Trail) p.Radius = Mathf.Max(p.Radius, 0.25f);
                    p.Grow = t.Progress > 0 && t.Length > 0 ? Mathf.Clamp01((float)(t.Progress / t.Length)) : 1f;
                    float side = Mathf.Max(p.Length, p.Radius) * 2f + 2f * Margin;
                    p.BoxSize = new Vector2(side, Mathf.Max(p.Radius * 2f + 2f * Margin, 1f));
                    p.Center += new Vector2(Mathf.Cos(p.Dir), Mathf.Sin(p.Dir)) * (p.Length * 0f);   // origin stays at the box centre; the box is long enough both ways
                    break;
                }
                case DruidTeleShape.RingGap:
                {
                    // Core: Radius = band centre line, Width = band thickness, Inner = inner radius. Shader: Radius = outer, Inner = inner.
                    float outer = r + (float)t.Width * PxToM * 0.5f;
                    p.Shape = 3; p.Radius = outer; p.Inner = (float)t.Inner * PxToM; p.Grow = 1f;
                    p.GapAngle = -(float)t.GapDir; p.GapWidth = (float)t.GapAngle;
                    p.BoxSize = Vector2.one * (2f * outer + 2f * Margin); break;
                }
                case DruidTeleShape.ArenaMinusSafe:
                    p.Shape = 4; p.Grow = 1f; p.Safe = t.Safe;
                    p.BoxSize = new Vector2((float)t.Length * PxToM, (float)t.Width * PxToM); break;
                default: return false;
            }
            return true;
        }

        public void Apply(Material m)
        {
            m.SetFloat("_Shape", Shape); m.SetFloat("_Progress", Progress); m.SetFloat("_Radius", Radius); m.SetFloat("_Angle", Angle); m.SetFloat("_Length", Length);
            m.SetFloat("_Grow", Grow); m.SetFloat("_Inner", Inner); m.SetFloat("_GapAngle", GapAngle); m.SetFloat("_GapWidth", GapWidth);
            m.SetFloat("_SizeX", BoxSize.x); m.SetFloat("_SizeY", BoxSize.y); m.SetFloat("_Flash", Flash);
        }
    }

    // Per-frame event budget: simultaneous cap per graph, and a screen-rect cull (world metres) so off-screen events cost nothing.
    public sealed class EventBudget
    {
        readonly Dictionary<string, int> used = new Dictionary<string, int>();
        readonly Dictionary<string, int> caps = new Dictionary<string, int>();
        public Rect Screen = new Rect(-1000, -1000, 2000, 2000);
        public int Skipped;
        public void Cap(string graph, int max) { caps[graph] = max; }
        public void NewFrame() { used.Clear(); Skipped = 0; }
        public bool TryTake(string graph, Vector2 pos)
        {
            if (!Screen.Contains(pos)) { Skipped++; return false; }
            int u; used.TryGetValue(graph, out u); int cap; if (!caps.TryGetValue(graph, out cap)) cap = int.MaxValue;
            if (u >= cap) { Skipped++; return false; }
            used[graph] = u + 1; return true;
        }
    }

    // ---- poison burst (spec v2.1 3.2): ONE graph VFX_PoisonBurst, two variants ---------------------------------------------------------------------------
    // The graph holds no palette (U7): every colour / size / lifetime / velocity box below is pushed into its exposed properties right before a burst.
    // Variant A = enemy (dark druid poison landing / pool / chase-zone burst), variant B = player malice orb blast. Colours: VFX_LEAD_MASTER 2.2 rows "enemy poison" and "arcane".
    public enum PoisonVariant { A_Druid, B_Malice }

    public sealed class PoisonPreset
    {
        public PoisonVariant Variant;
        public uint PaletteCore, PaletteMid, PaletteShadow;   // 0xRRGGBB, sRGB
        public uint HdrCore;                                   // colour of the HDR core (A: the palette core, B: #f6f2fc)
        public float CoreHdr;                                  // HDR multiplier of the core colour (bloom threshold is above 1)
        public float CoreSize;                                 // metres (0.5 x character height 0.6 m)
        public float ChunkSizeMin, ChunkSizeMax;               // metres (width; the quad is stretched x2.6 along its velocity)
        public float ChunkSpeed, ChunkBias;                    // m/s half-extent of the velocity box; bias = share of that speed pushed along the projectile direction
        public float MistSize, MistLifeMin, MistLifeMax, MistAlpha;   // metres, seconds, per-puff alpha peak (4 overlapping puffs stay <= 0.58)
        public int TaintCount; public float TaintSize, TaintAlpha;    // variant B only: poison tint inside the inner 20 percent of the smoke
        public uint TaintColour;
        public int StainTicks; public float StainRadius;       // ground stain (SG_GroundDecal), visual only
        public uint StainEdge, StainFill;
    }

    public static class PoisonBurstPresets
    {
        public const string EventName = "OnBurst";
        public const float Lift = 0.25f;                       // metres above the ground plane: the camera-facing quads never z-fight the ground

        public static readonly PoisonPreset A = new PoisonPreset
        {
            Variant = PoisonVariant.A_Druid, PaletteCore = 0xc8e8a8, PaletteMid = 0x5f8a2e, PaletteShadow = 0x1c2810, HdrCore = 0xc8e8a8, CoreHdr = 5.0f, CoreSize = 0.30f,
            ChunkSizeMin = 0.18f, ChunkSizeMax = 0.30f, ChunkSpeed = 6.0f, ChunkBias = 0.45f,
            MistSize = 1.10f, MistLifeMin = 0.6f, MistLifeMax = 0.8f, MistAlpha = 0.30f, TaintCount = 0, TaintSize = 0.20f, TaintAlpha = 0f, TaintColour = 0x5f8a2e,
            StainTicks = 90, StainRadius = 0.8f, StainEdge = 0x5f8a2e, StainFill = 0x1c2810
        };

        public static readonly PoisonPreset B = new PoisonPreset
        {
            Variant = PoisonVariant.B_Malice, PaletteCore = 0xe4dcf4, PaletteMid = 0x6a56a8, PaletteShadow = 0x161226, HdrCore = 0xf6f2fc, CoreHdr = 4.0f, CoreSize = 0.30f,
            ChunkSizeMin = 0.14f, ChunkSizeMax = 0.24f, ChunkSpeed = 5.0f, ChunkBias = 0f,
            MistSize = 0.95f, MistLifeMin = 0.5f, MistLifeMax = 0.6f, MistAlpha = 0.30f, TaintCount = 3, TaintSize = 0.19f, TaintAlpha = 0.22f, TaintColour = 0x5f8a2e,
            StainTicks = 60, StainRadius = 0.6f, StainEdge = 0x6a56a8, StainFill = 0x161226
        };

        public static PoisonPreset Get(PoisonVariant v) { return v == PoisonVariant.A_Druid ? A : B; }

        // sRGB hex -> linear colour x multiplier. The project is Linear and VFX Graph gradients are used as linear values (same maths as gen_vfx.py hdr()).
        public static Color Lin(uint hex, float mul)
        {
            var c = new Color32((byte)(hex >> 16), (byte)(hex >> 8), (byte)hex, 255);
            Color l = ((Color)c).linear;
            return new Color(l.r * mul, l.g * mul, l.b * mul, 1f);
        }

        static Gradient Grad(GradientColorKey[] ck, GradientAlphaKey[] ak)
        {
            var g = new Gradient(); g.mode = GradientMode.Blend; g.SetKeys(ck, ak); return g;
        }

        // Same shapes as the defaults baked by gen_vfx_poison.py (U2 core curve 1 -> 0.225 at 20 percent -> 0; chunks and mist go from the mid colour to the shadow colour).
        public static Gradient CoreGradient(PoisonPreset p)
        {
            return Grad(new[] { new GradientColorKey(Lin(p.HdrCore, p.CoreHdr), 0f) },
                        new[] { new GradientAlphaKey(0.35f, 0f), new GradientAlphaKey(1f, 0.16f), new GradientAlphaKey(0.225f, 0.4f), new GradientAlphaKey(0f, 1f) });
        }

        public static Gradient ChunkGradient(PoisonPreset p)
        {
            return Grad(new[] { new GradientColorKey(Lin(p.PaletteMid, 1f), 0f), new GradientColorKey(Lin(p.PaletteShadow, 1f), 1f) },
                        new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(0.9f, 0.55f), new GradientAlphaKey(0f, 1f) });
        }

        public static Gradient MistGradient(PoisonPreset p)
        {
            return Grad(new[] { new GradientColorKey(Lin(p.PaletteMid, 1f), 0f), new GradientColorKey(Lin(p.PaletteShadow, 1f), 1f) },
                        new[] { new GradientAlphaKey(0f, 0f), new GradientAlphaKey(p.MistAlpha, 0.12f), new GradientAlphaKey(p.MistAlpha * 0.67f, 0.6f), new GradientAlphaKey(0f, 1f) });
        }

        public static Gradient TaintGradient(PoisonPreset p)
        {
            return Grad(new[] { new GradientColorKey(Lin(p.TaintColour, 1f), 0f), new GradientColorKey(Lin(p.PaletteShadow, 1f), 1f) },
                        new[] { new GradientAlphaKey(0f, 0f), new GradientAlphaKey(p.TaintAlpha, 0.2f), new GradientAlphaKey(0f, 1f) });
        }

        // Velocity box of the chunks (world XZ, y = 0): centred on dir * bias * speed, half-extent speed. Uniform random per component inside the box (graph: Set Velocity Random).
        public static void ChunkBox(PoisonPreset p, Vector2 dir, float scale, out Vector3 min, out Vector3 max)
        {
            float s = p.ChunkSpeed * scale;
            Vector2 c = dir.sqrMagnitude > 1e-6f ? dir.normalized * (p.ChunkBias * s) : Vector2.zero;
            min = new Vector3(c.x - s, 0f, c.y - s); max = new Vector3(c.x + s, 0f, c.y + s);
        }

        // Push the variant into the exposed properties. A property the asset lacks is skipped (never an error).
        public static void Apply(VisualEffect fx, PoisonPreset p, Vector2 dir, float scale)
        {
            if (fx == null) return;
            if (fx.HasGradient("CoreGradient")) fx.SetGradient("CoreGradient", CoreGradient(p));
            if (fx.HasFloat("CoreSize")) fx.SetFloat("CoreSize", p.CoreSize * scale);
            if (fx.HasGradient("ChunkGradient")) fx.SetGradient("ChunkGradient", ChunkGradient(p));
            if (fx.HasFloat("ChunkSizeMin")) fx.SetFloat("ChunkSizeMin", p.ChunkSizeMin * scale);
            if (fx.HasFloat("ChunkSizeMax")) fx.SetFloat("ChunkSizeMax", p.ChunkSizeMax * scale);
            Vector3 vmin, vmax; ChunkBox(p, dir, scale, out vmin, out vmax);
            if (fx.HasVector3("ChunkVelMin")) fx.SetVector3("ChunkVelMin", vmin);
            if (fx.HasVector3("ChunkVelMax")) fx.SetVector3("ChunkVelMax", vmax);
            if (fx.HasGradient("MistGradient")) fx.SetGradient("MistGradient", MistGradient(p));
            if (fx.HasFloat("MistSize")) fx.SetFloat("MistSize", p.MistSize * scale);
            if (fx.HasFloat("MistLifeMin")) fx.SetFloat("MistLifeMin", p.MistLifeMin);
            if (fx.HasFloat("MistLifeMax")) fx.SetFloat("MistLifeMax", p.MistLifeMax);
            if (fx.HasGradient("TaintGradient")) fx.SetGradient("TaintGradient", TaintGradient(p));
            if (fx.HasFloat("TaintSize")) fx.SetFloat("TaintSize", p.TaintSize * scale);
            if (fx.HasFloat("TaintCount")) fx.SetFloat("TaintCount", p.TaintCount);
        }

        static readonly Dictionary<VisualEffect, VFXEventAttribute> attrs = new Dictionary<VisualEffect, VFXEventAttribute>();

        // One burst: properties first, then the OnBurst event with the event attributes position (world metres, XZ ground plane) and direction. Returns false when fx is null.
        public static bool Fire(VisualEffect fx, PoisonVariant v, Vector2 pos, Vector2 dir, float scale)
        {
            if (fx == null) return false;
            Apply(fx, Get(v), dir, scale);
            VFXEventAttribute a;
            if (!attrs.TryGetValue(fx, out a) || a == null) { a = fx.CreateVFXEventAttribute(); attrs[fx] = a; }
            if (a.HasVector3("position")) a.SetVector3("position", VfxWorld.ToWorldMetres(pos, Lift));
            if (a.HasVector3("direction")) a.SetVector3("direction", new Vector3(dir.x, 0f, dir.y));
            fx.SendEvent(EventName, a);
            return true;
        }
    }

    // Ground stain of a poison burst: a pooled DecalProjector with SG_GroundDecal (shape 0, circle), visual only (spec 3.2 layer 4). Ticks, not seconds (Core clock),
    // so it stays in step with the simulation and with the capture rig.
    public sealed class PoisonStainPool
    {
        sealed class Stain { public GameObject Go; public Material Mat; public UnityEngine.Rendering.Universal.DecalProjector Proj; public int Age, Life; }

        public const int Cap = 8;
        public const float Margin = 0.3f;
        readonly Transform root; readonly Material baseMat;
        readonly List<Stain> live = new List<Stain>(); readonly Stack<Stain> free = new Stack<Stain>();
        public int Active { get { return live.Count; } }

        public PoisonStainPool(Transform parent, Material decalMaterial) { root = parent; baseMat = decalMaterial; }

        static void SetCol(Material m, string prop, uint hex) { if (m.HasProperty(prop)) m.SetColor(prop, new Color32((byte)(hex >> 16), (byte)(hex >> 8), (byte)hex, 255)); }
        static void SetF(Material m, string prop, float v) { if (m.HasProperty(prop)) m.SetFloat(prop, v); }

        public bool Spawn(PoisonVariant v, Vector2 pos, float scale)
        {
            if (baseMat == null || live.Count >= Cap) return false;
            var p = PoisonBurstPresets.Get(v);
            Stain s;
            if (free.Count > 0) s = free.Pop();
            else
            {
                var go = new GameObject("RM1 PoisonStain"); go.transform.SetParent(root, false);
                s = new Stain { Go = go, Mat = new Material(baseMat) };
                s.Proj = go.AddComponent<UnityEngine.Rendering.Universal.DecalProjector>();
                s.Proj.material = s.Mat; s.Proj.pivot = Vector3.zero;
            }
            float r = p.StainRadius * scale, box = 2f * r + 2f * Margin;
            SetF(s.Mat, "_Shape", 0f); SetF(s.Mat, "_Progress", 1f); SetF(s.Mat, "_Radius", r); SetF(s.Mat, "_SizeX", box); SetF(s.Mat, "_SizeY", box); SetF(s.Mat, "_Flash", 0f);
            SetF(s.Mat, "_EdgeGlow", 0.25f);
            SetCol(s.Mat, "_EdgeColor", p.StainEdge); SetCol(s.Mat, "_FillColor", p.StainFill);
            s.Proj.size = new Vector3(box, box, 2f); s.Proj.fadeFactor = 1f;
            s.Go.transform.position = VfxWorld.ToWorldMetres(pos);
            s.Go.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            s.Age = 0; s.Life = p.StainTicks; s.Go.SetActive(true);
            live.Add(s); return true;
        }

        // Once per simulation tick: full opacity for the first 40 percent of the life, then a linear fade to nothing.
        public void Tick()
        {
            for (int i = live.Count - 1; i >= 0; i--)
            {
                var s = live[i]; s.Age++;
                if (s.Age >= s.Life) { s.Go.SetActive(false); free.Push(s); live.RemoveAt(i); continue; }
                float hold = s.Life * 0.4f;
                s.Proj.fadeFactor = s.Age <= hold ? 1f : Mathf.Clamp01(1f - (s.Age - hold) / (s.Life - hold));
            }
        }

        public void Clear() { for (int i = live.Count - 1; i >= 0; i--) { live[i].Go.SetActive(false); free.Push(live[i]); } live.Clear(); }
    }

    public sealed class VfxBridge : MonoBehaviour
    {
        public const string GraphDecal = "decal", GraphGlint = "parryGlint", GraphGrab = "grabEyes", GraphPoison = "poisonBurst", GraphPoisonA = "poisonBurstA", GraphBubble = "bubble";

        public Simulation Sim;
        public VisualEffect GlintFx, GrabFx, PoisonFx;            // optional: assigned when the RM-1 graphs exist; a null graph is skipped, never an error
        public VisualEffect PoisonFxA;                            // VFX_PoisonBurst instance for variant A (enemy); PoisonFx above = variant B (player malice orb)
        public Material DecalMaterial;                            // SG_GroundDecal instance; each pooled projector gets its own copy
        public readonly EventBudget Budget = new EventBudget();

        readonly List<DruidTelegraph> list = new List<DruidTelegraph>();
        readonly Dictionary<long, DecalHandle> live = new Dictionary<long, DecalHandle>();
        readonly Stack<DecalHandle> pool = new Stack<DecalHandle>();
        readonly List<long> stale = new List<long>();
        readonly HashSet<long> glinted = new HashSet<long>();
        int lastMaliceBlasts;
        int frame;
        PoisonStainPool stains;
        readonly HashSet<BossProjectile> poisonShots = new HashSet<BossProjectile>(), shotsNow = new HashSet<BossProjectile>();
        readonly List<BossProjectile> gone = new List<BossProjectile>();
        readonly HashSet<PoisonPool> seenPools = new HashSet<PoisonPool>(), poolsNow = new HashSet<PoisonPool>();
        readonly HashSet<ChaseZone> seenZones = new HashSet<ChaseZone>(), zonesNow = new HashSet<ChaseZone>();

        // Test hooks: what the last Pump produced (read by the editor checks).
        public readonly List<DecalParams> LastDecals = new List<DecalParams>();
        public int LastGlints, LastGrabs, LastPoisonBursts, LastPoisonBurstsA;     // poison: LastPoisonBursts = variant B (player), LastPoisonBurstsA = variant A (enemy)

        sealed class DecalHandle { public GameObject Go; public Material Mat; public long Key; public int Frame; }

        void Awake()
        {
            Budget.Cap(GraphDecal, 12); Budget.Cap(GraphGlint, 4); Budget.Cap(GraphGrab, 2); Budget.Cap(GraphPoison, 6); Budget.Cap(GraphPoisonA, 6); Budget.Cap(GraphBubble, 24);
        }

        public void Bind(Simulation sim)
        {
            Sim = sim; lastMaliceBlasts = sim != null ? sim.MaliceOrbBlasts : 0;
            poisonShots.Clear(); seenPools.Clear(); seenZones.Clear(); if (stains != null) stains.Clear();
        }

        static long Key(DruidTelegraph t) { return ((long)t.Serial << 24) ^ ((long)t.Move << 16) ^ ((long)(int)t.Kind << 8) ^ (long)t.Index; }

        // Call once per simulation tick, after Tick. Reads only.
        public void Pump()
        {
            if (Sim == null) return;
            frame++; Budget.NewFrame(); LastDecals.Clear(); LastGlints = LastGrabs = LastPoisonBursts = LastPoisonBurstsA = 0;
            Sim.DruidTelegraphs(list);
            for (int i = 0; i < list.Count; i++)
            {
                var t = list[i];
                switch (t.Kind)
                {
                    case DruidTeleKind.GroundDecal: PumpDecal(t); break;
                    case DruidTeleKind.ParryGlint: PumpGlint(t); break;
                    case DruidTeleKind.GrabEyes: PumpGrab(t); break;
                }
            }
            // decals that were not in this tick's list are done: return them to the pool
            stale.Clear();
            foreach (var kv in live) if (kv.Value.Frame != frame) stale.Add(kv.Key);
            for (int i = 0; i < stale.Count; i++) { var h = live[stale[i]]; live.Remove(stale[i]); h.Go.SetActive(false); pool.Push(h); }
            PumpPoison();
        }

        // ---- poison burst (spec 3.2): variant B = player malice orb, variant A = enemy druid. Reads only; the stains advance one step per call (= per simulation tick). ----
        PoisonStainPool Stains
        {
            get
            {
                if (stains == null && DecalMaterial != null) stains = new PoisonStainPool(transform, DecalMaterial);
                return stains;
            }
        }

        void BurstPoison(PoisonVariant v, VisualEffect fx, string graph, Vector2 pos, Vector2 dir, float scale)
        {
            if (!Budget.TryTake(graph, pos)) return;
            if (v == PoisonVariant.A_Druid) LastPoisonBurstsA++; else LastPoisonBursts++;
            PoisonBurstPresets.Fire(fx, v, pos, dir, scale);
            var st = Stains; if (st != null) st.Spawn(v, pos, scale);
        }

        static Vector2 PxToWorld(double x, double y) { return VfxWorld.ToPlanar(x, y); }

        void PumpPoison()
        {
            var sp = stains; if (sp != null) sp.Tick();
            // B (player): one burst per MaliceOrbBlasts increment (PC-B03b), at the Core position
            int blasts = Sim.MaliceOrbBlasts;
            for (; lastMaliceBlasts < blasts; lastMaliceBlasts++)
                BurstPoison(PoisonVariant.B_Malice, PoisonFx, GraphPoison, PxToWorld(Sim.MaliceOrbLastX, Sim.MaliceOrbLastY), Vector2.zero, 1f);
            var d = Sim.Druid;
            if (d == null) { poisonShots.Clear(); seenPools.Clear(); seenZones.Clear(); return; }
            // A1: druid poison shots (move 5). A tracked shot that is no longer in the live list has landed (player hit, wall or end of life); position = its last Core position.
            shotsNow.Clear();
            var ps = d.Projectiles;
            for (int i = 0; i < ps.Count; i++) { var p = ps[i]; if (p.DruidPoison && !p.Friendly && !p.Mine && p.Active) { shotsNow.Add(p); poisonShots.Add(p); } }
            gone.Clear();
            foreach (var p in poisonShots) if (!shotsNow.Contains(p)) gone.Add(p);
            for (int i = 0; i < gone.Count; i++)
            {
                var p = gone[i]; poisonShots.Remove(p);
                if (p.Active) continue;                                 // dropped by ClearHazards (arena reset), not a landing
                var dir = new Vector2((float)p.Vx, -(float)p.Vy);
                BurstPoison(PoisonVariant.A_Druid, PoisonFxA, GraphPoisonA, PxToWorld(p.X, p.Y), dir, 1f);
            }
            // A2: new poison pools (move 2 phase 3 and the trail pools); radius scales the burst (140 px = 1)
            poolsNow.Clear();
            var pools = d.PoisonPools;
            for (int i = 0; i < pools.Count; i++)
            {
                var pp = pools[i]; poolsNow.Add(pp);
                if (seenPools.Add(pp)) BurstPoison(PoisonVariant.A_Druid, PoisonFxA, GraphPoisonA, PxToWorld(pp.X, pp.Y), Vector2.zero, Mathf.Clamp((float)pp.R / 140f, 0.8f, 1.6f));
            }
            seenPools.IntersectWith(poolsNow);
            // A3: druid chase zones going off (move 8, parasite root)
            zonesNow.Clear();
            var aoes = d.ChaseAoes;
            for (int i = 0; i < aoes.Count; i++)
            {
                var zs = aoes[i].Zones;
                for (int j = 0; j < zs.Count; j++)
                {
                    var z = zs[j]; if (!z.Druid) continue;
                    zonesNow.Add(z);
                    if (z.Hit && seenZones.Add(z)) BurstPoison(PoisonVariant.A_Druid, PoisonFxA, GraphPoisonA, PxToWorld(z.X, z.Y), Vector2.zero, Mathf.Clamp((float)z.R / 100f, 0.8f, 1.4f));
                }
            }
            seenZones.IntersectWith(zonesNow);
        }

        void PumpDecal(DruidTelegraph t)
        {
            DecalParams p;
            if (!DecalParams.From(t, out p)) return;
            if (!Budget.TryTake(GraphDecal, p.Center)) return;
            LastDecals.Add(p);
            if (DecalMaterial == null) return;
            long k = Key(t); DecalHandle h;
            if (!live.TryGetValue(k, out h))
            {
                h = pool.Count > 0 ? pool.Pop() : NewDecal();
                h.Key = k; live[k] = h; h.Go.SetActive(true);
            }
            h.Frame = frame;
            p.Apply(h.Mat);
            var tr = h.Go.transform;
            tr.position = VfxWorld.ToWorldMetres(p.Center);
            tr.rotation = Quaternion.Euler(90f, 0f, 0f) * Quaternion.Euler(0f, 0f, p.Dir * Mathf.Rad2Deg);
        }

        void PumpGlint(DruidTelegraph t)
        {
            // spec 3.3 (1): a single glint at Elapsed == 2, at the staff tip
            if (t.Elapsed < 2 || t.Elapsed >= 3) return;
            long k = Key(t); if (!glinted.Add(k)) return;
            if (glinted.Count > 256) glinted.Clear();
            var pos = VfxWorld.ToPlanar(t.TipX, t.TipY);
            if (!Budget.TryTake(GraphGlint, pos)) return;
            LastGlints++; Send(GlintFx, "OnGlint", pos, new Vector2(Mathf.Cos(-(float)t.Dir), Mathf.Sin(-(float)t.Dir)), 0.25f, 0);
        }

        void PumpGrab(DruidTelegraph t)
        {
            long k = Key(t) ^ 0x5A5A; if (!glinted.Add(k)) return;       // one start event per grab; the graph runs for the whole 60 f itself
            var pos = VfxWorld.ToPlanar(t.X, t.Y);
            if (!Budget.TryTake(GraphGrab, pos)) return;
            LastGrabs++; Send(GrabFx, "OnGrab", pos, new Vector2(Mathf.Cos(-(float)t.Dir), Mathf.Sin(-(float)t.Dir)), 1f, 0);
        }

        static void Send(VisualEffect fx, string evt, Vector2 pos, Vector2 dir, float size, int tier)
        {
            if (fx == null) return;
            var a = fx.CreateVFXEventAttribute();
            a.SetVector3("position", VfxWorld.ToWorldMetres(pos)); a.SetVector3("direction", new Vector3(dir.x, 0f, dir.y));
            a.SetFloat("size", size); a.SetInt("tier", tier);
            fx.SendEvent(evt, a);
        }

        DecalHandle NewDecal()
        {
            var go = new GameObject("RM1 GroundDecal");
            go.transform.SetParent(transform, false);
            var h = new DecalHandle { Go = go, Mat = new Material(DecalMaterial) };
            var proj = go.AddComponent<UnityEngine.Rendering.Universal.DecalProjector>();
            proj.material = h.Mat; proj.size = new Vector3(4f, 4f, 2f); proj.pivot = Vector3.zero;
            return h;
        }

        void LateUpdate()
        {
            foreach (var kv in live)
            {
                var proj = kv.Value.Go.GetComponent<UnityEngine.Rendering.Universal.DecalProjector>();
                if (proj == null) continue;
                var sx = kv.Value.Mat.GetFloat("_SizeX"); var sy = kv.Value.Mat.GetFloat("_SizeY");
                proj.size = new Vector3(sx, sy, 2f);
            }
        }
    }
}
