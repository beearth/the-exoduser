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
            p.Center = new Vector2((float)t.X * PxToM, -(float)t.Y * PxToM);
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

    public sealed class VfxBridge : MonoBehaviour
    {
        public const string GraphDecal = "decal", GraphGlint = "parryGlint", GraphGrab = "grabEyes", GraphPoison = "poisonBurst", GraphBubble = "bubble";

        public Simulation Sim;
        public VisualEffect GlintFx, GrabFx, PoisonFx;            // optional: assigned when the RM-1 graphs exist; a null graph is skipped, never an error
        public Material DecalMaterial;                            // SG_GroundDecal instance; each pooled projector gets its own copy
        public readonly EventBudget Budget = new EventBudget();

        readonly List<DruidTelegraph> list = new List<DruidTelegraph>();
        readonly Dictionary<long, DecalHandle> live = new Dictionary<long, DecalHandle>();
        readonly Stack<DecalHandle> pool = new Stack<DecalHandle>();
        readonly List<long> stale = new List<long>();
        readonly HashSet<long> glinted = new HashSet<long>();
        int lastMaliceBlasts;
        int frame;

        // Test hooks: what the last Pump produced (read by the editor checks).
        public readonly List<DecalParams> LastDecals = new List<DecalParams>();
        public int LastGlints, LastGrabs, LastPoisonBursts;

        sealed class DecalHandle { public GameObject Go; public Material Mat; public long Key; public int Frame; }

        void Awake()
        {
            Budget.Cap(GraphDecal, 12); Budget.Cap(GraphGlint, 4); Budget.Cap(GraphGrab, 2); Budget.Cap(GraphPoison, 6); Budget.Cap(GraphBubble, 24);
        }

        public void Bind(Simulation sim) { Sim = sim; lastMaliceBlasts = sim != null ? sim.MaliceOrbBlasts : 0; }

        static long Key(DruidTelegraph t) { return ((long)t.Serial << 24) ^ ((long)t.Move << 16) ^ ((long)(int)t.Kind << 8) ^ (long)t.Index; }

        // Call once per simulation tick, after Tick. Reads only.
        public void Pump()
        {
            if (Sim == null) return;
            frame++; Budget.NewFrame(); LastDecals.Clear(); LastGlints = LastGrabs = LastPoisonBursts = 0;
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
            // player poison burst: one event per MaliceOrbBlasts increment, at the Core position
            int blasts = Sim.MaliceOrbBlasts;
            for (; lastMaliceBlasts < blasts; lastMaliceBlasts++)
            {
                var pos = new Vector2(Sim.MaliceOrbLastX * DecalParams.PxToM, -Sim.MaliceOrbLastY * DecalParams.PxToM);
                if (!Budget.TryTake(GraphPoison, pos)) continue;
                LastPoisonBursts++; Send(PoisonFx, "OnBurst", pos, Vector2.zero, 1f, 0);
            }
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
            tr.position = new Vector3(p.Center.x, 0f, p.Center.y);        // ground plane XZ; the RM-1 scene rule decides Z (see spec 3.3: "3D layer Z is the RM-1 scene rule")
            tr.rotation = Quaternion.Euler(90f, 0f, 0f) * Quaternion.Euler(0f, 0f, p.Dir * Mathf.Rad2Deg);
        }

        void PumpGlint(DruidTelegraph t)
        {
            // spec 3.3 (1): a single glint at Elapsed == 2, at the staff tip
            if (t.Elapsed < 2 || t.Elapsed >= 3) return;
            long k = Key(t); if (!glinted.Add(k)) return;
            if (glinted.Count > 256) glinted.Clear();
            var pos = new Vector2((float)t.TipX * DecalParams.PxToM, -(float)t.TipY * DecalParams.PxToM);
            if (!Budget.TryTake(GraphGlint, pos)) return;
            LastGlints++; Send(GlintFx, "OnGlint", pos, new Vector2(Mathf.Cos(-(float)t.Dir), Mathf.Sin(-(float)t.Dir)), 0.25f, 0);
        }

        void PumpGrab(DruidTelegraph t)
        {
            long k = Key(t) ^ 0x5A5A; if (!glinted.Add(k)) return;       // one start event per grab; the graph runs for the whole 60 f itself
            var pos = new Vector2((float)t.X * DecalParams.PxToM, -(float)t.Y * DecalParams.PxToM);
            if (!Budget.TryTake(GraphGrab, pos)) return;
            LastGrabs++; Send(GrabFx, "OnGrab", pos, new Vector2(Mathf.Cos(-(float)t.Dir), Mathf.Sin(-(float)t.Dir)), 1f, 0);
        }

        static void Send(VisualEffect fx, string evt, Vector2 pos, Vector2 dir, float size, int tier)
        {
            if (fx == null) return;
            var a = fx.CreateVFXEventAttribute();
            a.SetVector3("position", new Vector3(pos.x, 0f, pos.y)); a.SetVector3("direction", new Vector3(dir.x, 0f, dir.y));
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
