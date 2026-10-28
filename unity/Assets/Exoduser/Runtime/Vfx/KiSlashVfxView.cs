using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // RM-1 presentation only. Core projectile motion, hit admission and feedback
    // timing remain owned by Simulation. One graph instance per live projectile
    // prevents different Ki slashes from joining the same GPU strip.
    public sealed class KiSlashVfxView : IDisposable
    {
        const string HitEvent = "OnKiHit", ChargeEvent = "OnKiCharge", TrailEvent = "OnKiTrail";
        const int TailTicks = 8; // 0.12 s strip lifetime plus one tick of margin
        const int ScarTicks = 90;
        sealed class TrailHandle
        {
            public GameObject Go;
            public VisualEffect Fx;
            public VFXEventAttribute Attr;
            public int LastTick;
        }
        sealed class Scar
        {
            public GameObject Go;
            public Material Mat;
            public DecalProjector Projector;
            public int Born;
        }

        readonly Transform root;
        readonly VisualEffectAsset asset;
        readonly Material scarBase;
        readonly VisualEffect impact;
        readonly VFXEventAttribute impactAttr;
        readonly Dictionary<int, TrailHandle> active = new Dictionary<int, TrailHandle>();
        readonly Stack<TrailHandle> free = new Stack<TrailHandle>();
        readonly List<int> stale = new List<int>();
        readonly List<Scar> scars = new List<Scar>();
        Simulation sim;
        int lastTick = -1;
        public int HitCount { get; private set; }
        public int ChargeCount { get; private set; }
        public int TrailEvents { get; private set; }

        public KiSlashVfxView(Transform parent, Material groundDecalMaterial)
        {
            root = parent;
            scarBase = groundDecalMaterial != null ? groundDecalMaterial :
                throw new ArgumentNullException(nameof(groundDecalMaterial));
            asset = Resources.Load<VisualEffectAsset>("VFX/RM1/VFX_KiSlash");
            if (asset == null) throw new InvalidOperationException("Missing RM-1 Ki Slash VFX Graph in Resources/VFX/RM1");
            impact = NewEffect("RM1 Ki impact");
            impactAttr = impact.CreateVFXEventAttribute();
        }

        VisualEffect NewEffect(string name)
        {
            var go = new GameObject(name);
            go.transform.SetParent(root, false);
            var fx = go.AddComponent<VisualEffect>();
            fx.visualEffectAsset = asset;
            Configure(fx);
            return fx;
        }

        static Gradient Gradient(uint first, uint last, float peak)
        {
            var g = new Gradient();
            g.SetKeys(new[] {
                new GradientColorKey(PoisonBurstPresets.Lin(first, 1f), 0f),
                new GradientColorKey(PoisonBurstPresets.Lin(last, 1f), 1f)
            }, new[] {
                new GradientAlphaKey(peak, 0f),
                new GradientAlphaKey(peak * 0.225f, 0.2f),
                new GradientAlphaKey(0f, 1f)
            });
            return g;
        }

        static Gradient CoreGradient()
        {
            var g = new Gradient();
            Color hdr = PoisonBurstPresets.Lin(0xfff4d0, 4f);
            g.SetKeys(new[] { new GradientColorKey(hdr, 0f) }, new[] {
                new GradientAlphaKey(0.35f, 0f),
                new GradientAlphaKey(1f, 0.16f),
                new GradientAlphaKey(0.225f, 0.4f),
                new GradientAlphaKey(0f, 1f)
            });
            return g;
        }

        static void Configure(VisualEffect fx)
        {
            // Physical palette in VFX_LEAD_MASTER §2.2. Colour lives in exposed
            // gradients, never as a hardcoded graph colour (spec U7).
            if (fx.HasGradient("CoreGradient")) fx.SetGradient("CoreGradient", CoreGradient());
            if (fx.HasGradient("ShardGradient")) fx.SetGradient("ShardGradient", Gradient(0xefe6d2, 0x9a8a72, 1f));
            if (fx.HasGradient("TrailGradient")) fx.SetGradient("TrailGradient", Gradient(0xefe6d2, 0x9a8a72, 1f));
            if (fx.HasFloat("CoreSize")) fx.SetFloat("CoreSize", 0.24f);
            if (fx.HasFloat("ShardSize")) fx.SetFloat("ShardSize", 0.12f);
            if (fx.HasFloat("TrailSize")) fx.SetFloat("TrailSize", 0.09f);
            if (fx.HasFloat("TierScale")) fx.SetFloat("TierScale", 1f);
        }

        public void Bind(Simulation simulation)
        {
            sim = simulation;
            lastTick = -1;
            HitCount = ChargeCount = TrailEvents = 0;
            foreach (var h in active.Values) Retire(h);
            active.Clear();
            for (int i = scars.Count - 1; i >= 0; i--) RemoveScar(i);
            impact.Reinit();
        }

        static void Send(VisualEffect fx, VFXEventAttribute attr, string name,
            float x, float y, float angle, float size, int tier, int step)
        {
            Vector3 pos = VfxWorld.ToWorld(x, y, 0.25f);
            Vector3 dir = new Vector3(Mathf.Cos(angle), 0f, -Mathf.Sin(angle));
            if (attr.HasVector3("position")) attr.SetVector3("position", pos);
            if (attr.HasVector3("direction")) attr.SetVector3("direction", dir);
            if (attr.HasFloat("size")) attr.SetFloat("size", size);
            if (attr.HasInt("tier")) attr.SetInt("tier", tier);
            if (attr.HasInt("step")) attr.SetInt("step", step);
            fx.SendEvent(name, attr);
        }

        public void Handle(FeedbackEvent e)
        {
            if (e == null) return;
            if (e.Kind == FeedbackKind.KiSlashHit)
            {
                float size = (e.Step == 3 ? 0.36f : e.Step == 2 ? 0.28f : 0.24f) * e.Scale;
                if (impact.HasFloat("CoreSize")) impact.SetFloat("CoreSize", size);
                if (impact.HasFloat("ShardSize")) impact.SetFloat("ShardSize", 0.12f * e.Scale);
                Vector3 forward = new Vector3(Mathf.Cos(e.Angle), 0f, -Mathf.Sin(e.Angle));
                Vector3 tangent = new Vector3(-forward.z, 0f, forward.x);
                Vector3 spread = new Vector3(0.35f + Mathf.Abs(tangent.x) * 1.2f, 0f,
                    0.35f + Mathf.Abs(tangent.z) * 1.2f);
                if (impact.HasVector3("ShardVelMin")) impact.SetVector3("ShardVelMin", forward * 1.5f - spread);
                if (impact.HasVector3("ShardVelMax")) impact.SetVector3("ShardVelMax", forward * 2.1f + spread);
                Send(impact, impactAttr, HitEvent, e.X, e.Y, e.Angle, size, e.Tier, e.Step);
                if (e.Step == 3) SpawnScar(e);
                HitCount++;
            }
            else if (e.Kind == FeedbackKind.KiChargeFlash)
            {
                if (impact.HasFloat("CoreSize")) impact.SetFloat("CoreSize", 0.18f);
                Send(impact, impactAttr, ChargeEvent, e.X, e.Y, e.Angle, 0.18f, e.Tier, e.Step);
                ChargeCount++;
            }
        }

        public void Update()
        {
            if (sim == null || sim.TickCount == lastTick) return;
            int tick = sim.TickCount;
            lastTick = tick;
            foreach (var p in sim.Projectiles)
            {
                if (!p.Active) continue;
                TrailHandle h;
                if (!active.TryGetValue(p.Id, out h))
                {
                    if (free.Count > 0)
                    {
                        h = free.Pop(); h.Go.SetActive(true); h.Fx.Reinit();
                    }
                    else
                    {
                        var fx = NewEffect("RM1 Ki trail " + p.Id);
                        h = new TrailHandle { Go = fx.gameObject, Fx = fx,
                            Attr = fx.CreateVFXEventAttribute() };
                    }
                    active.Add(p.Id, h);
                }
                h.LastTick = tick;
                int tier = p.Step == 3 ? Mathf.Clamp(Mathf.RoundToInt((p.ChargeScale - 1f) / 0.4f), 0, 3) : 0;
                float width = Mathf.Min(0.09f, 0.07f * p.ChargeScale);
                if (h.Fx.HasFloat("TrailSize")) h.Fx.SetFloat("TrailSize", width);
                Send(h.Fx, h.Attr, TrailEvent, p.X, p.Y, p.Angle, width, tier, p.Step);
                TrailEvents++;
            }
            stale.Clear();
            foreach (var pair in active)
                if (tick - pair.Value.LastTick > TailTicks) stale.Add(pair.Key);
            foreach (int id in stale)
            {
                var h = active[id]; active.Remove(id); Retire(h);
            }
            UpdateScars(tick);
        }

        static void SetFloat(Material mat, string name, float value)
        {
            if (mat.HasProperty(name)) mat.SetFloat(name, value);
        }

        static void SetColour(Material mat, string name, Color value)
        {
            if (mat.HasProperty(name)) mat.SetColor(name, value);
        }

        void SpawnScar(FeedbackEvent e)
        {
            if (scars.Count >= 8) RemoveScar(0);
            var go = new GameObject("RM1 Ki scar");
            go.transform.SetParent(root, false);
            var mat = new Material(scarBase);
            float length = 1.5f * e.Scale, radius = 0.08f * e.Scale;
            float boxX = length * 2f + 0.6f, boxY = radius * 2f + 0.6f;
            SetFloat(mat, "_Shape", 2f); SetFloat(mat, "_Progress", 1f);
            SetFloat(mat, "_Length", length); SetFloat(mat, "_Radius", radius);
            SetFloat(mat, "_Grow", 1f); SetFloat(mat, "_SizeX", boxX);
            SetFloat(mat, "_SizeY", boxY); SetFloat(mat, "_Flash", 0f);
            SetFloat(mat, "_EdgeGlow", 0f);
            SetColour(mat, "_EdgeColor", new Color32(154, 138, 114, 255));
            SetColour(mat, "_FillColor", new Color32(42, 34, 32, 255));
            var projector = go.AddComponent<DecalProjector>();
            projector.material = mat;
            projector.size = new Vector3(boxX, boxY, 2f);
            projector.pivot = Vector3.zero;
            projector.fadeFactor = 0.42f;
            go.transform.position = VfxWorld.ToWorld(e.X, e.Y);
            go.transform.rotation = Quaternion.Euler(90f, 0f, 0f) *
                Quaternion.Euler(0f, 0f, -e.Angle * Mathf.Rad2Deg);
            scars.Add(new Scar { Go = go, Mat = mat, Projector = projector,
                Born = sim != null ? sim.TickCount : e.Tick });
        }

        void UpdateScars(int tick)
        {
            for (int i = scars.Count - 1; i >= 0; i--)
            {
                int age = tick - scars[i].Born;
                if (age >= ScarTicks) { RemoveScar(i); continue; }
                float fade = age <= 36 ? 1f : Mathf.Clamp01((ScarTicks - age) / 54f);
                scars[i].Projector.fadeFactor = 0.42f * fade;
            }
        }

        void RemoveScar(int index)
        {
            var s = scars[index]; scars.RemoveAt(index);
            Release(s.Go); Release(s.Mat);
        }

        void Retire(TrailHandle h)
        {
            h.Go.SetActive(false);
            free.Push(h);
        }

        static void Release(UnityEngine.Object value)
        {
            if (Application.isPlaying) UnityEngine.Object.Destroy(value);
            else UnityEngine.Object.DestroyImmediate(value);
        }

        public void Dispose()
        {
            foreach (var h in active.Values) Release(h.Go);
            foreach (var h in free) Release(h.Go);
            active.Clear(); free.Clear();
            for (int i = scars.Count - 1; i >= 0; i--) RemoveScar(i);
            Release(impact.gameObject);
        }
    }
}
