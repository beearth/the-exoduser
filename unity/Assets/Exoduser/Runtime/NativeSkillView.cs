using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // PC-B03 presentation of the starting skills: spike trap / holy dome ground zones, the giant slam shock wave, the ice orb and its blades. The textures are the web's own
    // sheets (sprites/spike_trap/spike_thorn.png, sprites/holy_dome.png, assets/vfx/vfx_ice_orb.png, assets/vfx/inferno_slam_impact_sheet.png); the layer rules follow the
    // web draw code (G._fireZones render, _gSlamWave render, ICE ORB render, iceBlade projectile polygons). 'lighter' / 'screen' layers use EXODUSER/SkillAdditive.
    public sealed class NativeSkillView : IDisposable
    {
        sealed class Item { public GameObject go; public SpriteRenderer a, b; public LineRenderer[] rings; }
        readonly Transform parent; readonly Material add, addFlat, alpha;
        readonly Dictionary<int, Item> zones = new Dictionary<int, Item>(), waves = new Dictionary<int, Item>(), blades = new Dictionary<int, Item>(), orbs = new Dictionary<int, Item>();
        readonly Dictionary<int, List<Vector3>> orbTrails = new Dictionary<int, List<Vector3>>();   // web p._trail: the last 14 positions of a malice orb
        readonly List<int> stale = new List<int>();
        // The web draws fire zones in the world layer, then the dynamic lighting pass (game.html _renderLighting, line 55344) darkens them; Unity has no such overlay. Factor measured web|Unity capture 2026-10-28.
        const float WebLitHolyDome = .11f;
        // Web lighting presses the ring band (.62~.90 r) down to almost 0, so the two rings are practically invisible there (web|Unity capture 10-28).
        const float WebLitHolyDomeRing = .03f;
        Sprite spike, dome, shard, disc; readonly Sprite[] slamFrames = new Sprite[4], orbFrames = new Sprite[9], maliceFrames = new Sprite[20];
        Item orb; int lastTick = -1;
        public int ActiveZones, ActiveWaves, ActiveBlades, ActiveMaliceOrbs; public bool OrbShown;

        public NativeSkillView(Transform parent)
        {
            this.parent = parent;
            add = new Material(Resources.Load<Shader>("Shaders/SkillAdditive"));
            addFlat = new Material(Resources.Load<Shader>("Shaders/SkillAdditive")); addFlat.SetFloat("_Flat", 1);
            alpha = new Material(Shader.Find("Sprites/Default"));
            spike = Whole("Art/vfx/skill_spike_thorn"); dome = Whole("Art/vfx/skill_holy_dome");
            var slam = Resources.Load<Texture2D>("Art/vfx/skill_inferno_slam_sheet"); int hw = slam.width / 2, hh = slam.height / 2;
            for (int i = 0; i < 4; i++) slamFrames[i] = Sprite.Create(slam, new Rect(i % 2 * hw, slam.height - (i / 2 + 1) * hh, hw, hh), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            var orbTex = Resources.Load<Texture2D>("Art/vfx/skill_ice_orb_sheet"); int fw = orbTex.width / 3, fh = orbTex.height / 3;
            for (int i = 0; i < 9; i++) orbFrames[i] = Sprite.Create(orbTex, new Rect(i % 3 * fw, orbTex.height - (i / 3 + 1) * fh, fw, fh), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            // web _MO_IMG (assets/vfx/vfx_magic_orb.png): 7 x 3 cells of 171 px, 20 frames, drawn 'lighter' at r * 5
            var mo = Resources.Load<Texture2D>("Art/vfx/skill_malice_orb_sheet");
            for (int i = 0; i < 20; i++) maliceFrames[i] = Sprite.Create(mo, new Rect(i % 7 * 171, mo.height - (i / 7 + 1) * 171, 171, 171), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            shard = BuildShard(); disc = BuildDisc();
        }
        static Sprite Whole(string path)
        {
            var t = Resources.Load<Texture2D>(path); if (t == null) throw new InvalidOperationException("Missing original skill texture " + path);
            return Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
        }

        // web iceBlade draw (59694+): four layered polygons, nose +x; 2 texture px per web px, origin at 16 px from the left edge
        static Sprite BuildShard()
        {
            const int w = 80, h = 28; var px = new Color[w * h];
            Vector2[][] polys = {
                new[]{ new Vector2(26,0),new Vector2(2,-7),new Vector2(-18,1),new Vector2(2,7) },
                new[]{ new Vector2(24,0),new Vector2(4,-6),new Vector2(6,-2),new Vector2(-16,1),new Vector2(-2,2),new Vector2(-4,6) },
                new[]{ new Vector2(22,0),new Vector2(3,-4),new Vector2(5,-1),new Vector2(-14,.5f),new Vector2(-1,1),new Vector2(-2,4) },
                new[]{ new Vector2(19,0),new Vector2(2,-2),new Vector2(3,0),new Vector2(-10,.3f),new Vector2(0,0),new Vector2(-1,2) } };
            Color[] cols = { new Color(.4f, .8f, .933f, .15f), new Color(.486f, .784f, .91f, .5f), new Color(.667f, .933f, 1f, .85f), new Color(.867f, .957f, 1f, 1f) };
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                Vector2 p = new Vector2((x + .5f) / 2f - 16, (y + .5f) / 2f - 7); Color acc = Color.clear;
                for (int l = 0; l < 4; l++) if (Inside(polys[l], p)) { Color c = cols[l]; float a = c.a + acc.a * (1 - c.a); acc = a <= 0 ? Color.clear : new Color((c.r * c.a + acc.r * acc.a * (1 - c.a)) / a, (c.g * c.a + acc.g * acc.a * (1 - c.a)) / a, (c.b * c.a + acc.b * acc.a * (1 - c.a)) / a, a); }
                px[y * w + x] = acc;
            }
            var t = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; t.SetPixels(px); t.Apply(false, true);
            return Sprite.Create(t, new Rect(0, 0, w, h), new Vector2(32f / w, .5f), 200, 0, SpriteMeshType.FullRect);
        }
        static bool Inside(Vector2[] poly, Vector2 p)
        {
            bool inside = false;
            for (int i = 0, j = poly.Length - 1; i < poly.Length; j = i++)
                if (((poly[i].y > p.y) != (poly[j].y > p.y)) && (p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) inside = !inside;
            return inside;
        }
        static Sprite BuildDisc()
        {
            const int n = 128; var px = new Color[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++) { float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1; px[y * n + x] = new Color(1, 1, 1, Mathf.Clamp01((1 - Mathf.Sqrt(dx * dx + dy * dy)) * n / 2f)); }
            var t = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; t.SetPixels(px); t.Apply(false, true);
            return Sprite.Create(t, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
        }

        static Vector3 Point(float x, float y) { return new Vector3(x / 100, -y / 100, 0); }
        SpriteRenderer NewRenderer(Item item, string name, Sprite sprite, Material material, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(item != null ? item.go.transform : parent, false);
            var r = go.AddComponent<SpriteRenderer>(); r.sprite = sprite; r.sharedMaterial = material; r.sortingOrder = order; return r;
        }
        Item NewItem(string name) { return new Item { go = new GameObject(name) { transform = { parent = parent } } }; }
        static void Fit(SpriteRenderer r, float px, float srcPx) { r.transform.localScale = Vector3.one * (px / srcPx); }
        LineRenderer NewRing(Item item, Color color)
        {
            var go = new GameObject("ring"); go.transform.SetParent(item.go.transform, false);
            var l = go.AddComponent<LineRenderer>(); l.useWorldSpace = false; l.loop = true; l.positionCount = 72; l.widthMultiplier = .03f; l.sharedMaterial = add;
            l.startColor = l.endColor = color; l.sortingOrder = -18990; return l;
        }
        static void SetRing(LineRenderer l, float radiusPx, Color c)
        {
            l.startColor = l.endColor = c;
            for (int i = 0; i < 72; i++) { float a = i * Mathf.PI * 2 / 72; l.SetPosition(i, new Vector3(Mathf.Cos(a) * radiusPx / 100, Mathf.Sin(a) * radiusPx / 100, 0)); }
        }

        public void Update(Simulation sim, float time)
        {
            ActiveZones = ActiveWaves = ActiveBlades = ActiveMaliceOrbs = 0; var p = sim.Player;
            // ---- ground zones ----
            stale.Clear(); foreach (var k in zones.Keys) stale.Add(k);
            foreach (var z in sim.FireZones)
            {
                stale.Remove(z.Id); Item it; if (!zones.TryGetValue(z.Id, out it)) { it = NewItem(z.Type + z.Id); zones[z.Id] = it; BuildZone(it, z); }
                ActiveZones++; it.go.transform.position = Point(z.X, z.Y);
                float fade = Mathf.Clamp01((z.MaxT - z.T) / 30f), deploy = Mathf.Min(1f, z.T / (z.Type == "holyDome" ? 15f : 12f));
                if (z.Type == "spikeTrap")
                {
                    it.a.transform.localRotation = Quaternion.Euler(0, 0, -time * 1000f * 0.00005f * Mathf.Rad2Deg);
                    Fit(it.a, z.R * 2 * deploy, spike.rect.width); it.a.color = new Color(1, 1, 1, (.43f + .04f * Mathf.Sin(time * 1000f * .003f)) * fade);
                }
                else
                {
                    float t = time; float sz = z.R * 2 * deploy;
                    it.a.transform.localRotation = Quaternion.Euler(0, 0, time * 1000f * 0.00005f * Mathf.Rad2Deg);
                    Fit(it.a, sz * 1.02f, dome.rect.width); it.a.color = new Color(182 / 255f, 1f, 84 / 255f, (.52f + .12f * Mathf.Sin(t * 3)) * fade * WebLitHolyDome);
                    for (int ri = 0; ri < 2; ri++)
                    {
                        float rp = (Mathf.Sin(t * (2.1f + ri * .35f) + ri * 2.4f) + 1) * .5f;
                        SetRing(it.rings[ri], z.R * (.62f + ri * .19f + rp * .09f) * deploy, new Color(213 / 255f, 1f, 114 / 255f, (.64f + rp * .18f) * fade * WebLitHolyDomeRing));
                    }
                }
            }
            Drop(zones, stale);
            // ---- giant slam waves ----
            stale.Clear(); foreach (var k in waves.Keys) stale.Add(k);
            foreach (var w in sim.SlamWaves)
            {
                stale.Remove(w.Id); Item it; if (!waves.TryGetValue(w.Id, out it)) { it = NewItem("slam" + w.Id); waves[w.Id] = it; it.a = NewRenderer(it, "wave", slamFrames[0], addFlat == null ? add : add, -18900); it.b = NewRenderer(it, "flash", disc, alpha, -18890); }
                ActiveWaves++; it.go.transform.position = Point(w.X, w.Y);
                float wp = w.T / (float)w.MaxT, fadeA = wp < .62f ? 1f : Mathf.Max(0, (1 - wp) / .38f);
                int frame = Mathf.Min(3, Mathf.FloorToInt(Mathf.Pow(wp, .6f) * 4)); it.a.sprite = slamFrames[frame];
                float size = w.MaxR * .9f * (.72f + .28f * Mathf.Min(1, wp * 3.5f)); Fit(it.a, size, slamFrames[frame].rect.width); it.a.color = w.Bash ? new Color(.4f, .667f, .867f, fadeA) : new Color(1, 1, 1, fadeA);   // E strike: web col #66aadd
                float flash = Mathf.Max(0, 1 - wp * 4); it.b.enabled = flash > 0;
                if (flash > 0) { float fr = Mathf.Min(w.MaxR * .4f, 42) * (.55f + .45f * flash); Fit(it.b, fr * 2, disc.rect.width); it.b.color = new Color(1f, .957f, .816f, .9f * flash * flash); }
            }
            Drop(waves, stale);
            // ---- ice blades ----
            stale.Clear(); foreach (var k in blades.Keys) stale.Add(k);
            foreach (var b in sim.SkillBlades)
            {
                if (!b.Active) continue; stale.Remove(b.Id); Item it; if (!blades.TryGetValue(b.Id, out it)) { it = NewItem("blade" + b.Id); blades[b.Id] = it; it.a = NewRenderer(it, "shard", shard, alpha, 0); }
                ActiveBlades++; it.go.transform.position = Point(b.X, b.Y); it.a.sortingOrder = (int)b.Y + 1;
                float ang = Mathf.Atan2(-b.Vy, b.Vx) + time * 12f; it.a.transform.localRotation = Quaternion.Euler(0, 0, ang * Mathf.Rad2Deg);
            }
            Drop(blades, stale);
            // ---- malice orbs (E slot) ----
            stale.Clear(); foreach (var k in orbs.Keys) stale.Add(k);
            foreach (var o in sim.MaliceOrbs)
            {
                if (!o.Active) continue; stale.Remove(o.Id); Item it; List<Vector3> trail;
                if (!orbs.TryGetValue(o.Id, out it)) { it = NewItem("malice" + o.Id); orbs[o.Id] = it; it.a = NewRenderer(it, "orb", maliceFrames[0], add, 0); it.rings = new[] { NewTrail(it) }; orbTrails[o.Id] = new List<Vector3>(); }
                trail = orbTrails[o.Id]; ActiveMaliceOrbs++;
                var pos = Point(o.X, o.Y); it.go.transform.position = pos; it.a.sortingOrder = (int)o.Y + 3;
                int fr = (int)(time * 1000f * .12f + o.X * .1f); it.a.sprite = maliceFrames[((fr % 20) + 20) % 20];
                Fit(it.a, o.R * 5f, 171); it.a.color = new Color(1, 1, 1, .85f);
                trail.Add(pos); if (trail.Count > 14) trail.RemoveAt(0);
                var line = it.rings[0]; line.positionCount = trail.Count;
                for (int ti = 0; ti < trail.Count; ti++) line.SetPosition(ti, trail[trail.Count - 1 - ti] - pos);
                line.widthMultiplier = Mathf.Max(4, o.R) * 2f / 100f; line.sortingOrder = (int)o.Y + 2;
            }
            foreach (int id in stale) orbTrails.Remove(id);
            Drop(orbs, stale);
            // ---- the orb the player stands in ----
            OrbShown = sim.IceOrbActive;
            if (orb == null) { orb = NewItem("ice orb"); orb.a = NewRenderer(orb, "base0", orbFrames[0], alpha, 0); orb.b = NewRenderer(orb, "base1", orbFrames[0], alpha, 0); var g0 = NewRenderer(orb, "glow0", orbFrames[0], add, 0); var g1 = NewRenderer(orb, "glow1", orbFrames[0], add, 0); orb.rings = null; glow0 = g0; glow1 = g1; }
            orb.go.SetActive(sim.IceOrbActive);
            if (sim.IceOrbActive)
            {
                orb.go.transform.position = Point(sim.IceOrbX, sim.IceOrbY);
                float ioP = Mathf.Min(1, sim.IceOrbT / 180f), lvScale = 1 + (Math.Max(1, sim.Skills.Level("iceOrb")) - 1) * .1f;
                float R = (p.Radius + 32 + Mathf.Sin(ioP * Mathf.PI) * 10) * lvScale, draw = R * 6.6f;
                float ff = 8 * (1 - Mathf.Min(1, sim.IceOrbT / 60f)); int fl = Mathf.FloorToInt(ff); float mix = ff - fl;
                int order = (int)p.Y + 2;
                SetOrb(orb.a, fl, draw, new Color(1, 1, 1, (.85f + .1f * Mathf.Sin(ioP * 6)) * (1 - mix)), order); SetOrb(orb.b, Mathf.Min(8, fl + 1), draw, new Color(1, 1, 1, (.85f + .1f * Mathf.Sin(ioP * 6)) * mix), order);
                SetOrb(glow0, fl, draw, new Color(1, 1, 1, (.2f + .12f * Mathf.Sin(ioP * 8)) * (1 - mix)), order + 1); SetOrb(glow1, Mathf.Min(8, fl + 1), draw, new Color(1, 1, 1, (.2f + .12f * Mathf.Sin(ioP * 8)) * mix), order + 1);
            }
        }
        SpriteRenderer glow0, glow1;
        void SetOrb(SpriteRenderer r, int frame, float drawPx, Color c, int order)
        {
            r.sprite = orbFrames[Mathf.Clamp(frame, 0, 8)]; Fit(r, drawPx, r.sprite.rect.width); r.color = c; r.sortingOrder = order; r.enabled = c.a > 0.001f;
        }
        // web _drawMaliceOrbTrail: a dark smoke ribbon under an additive violet / ember ribbon that thins out to the tail
        LineRenderer NewTrail(Item item)
        {
            var go = new GameObject("trail"); go.transform.SetParent(item.go.transform, false);
            var l = go.AddComponent<LineRenderer>(); l.useWorldSpace = false; l.numCapVertices = 4; l.sharedMaterial = add;
            l.widthCurve = new AnimationCurve(new Keyframe(0, .55f), new Keyframe(1, 0));
            var g = new Gradient(); g.SetKeys(new[] { new GradientColorKey(new Color(.86f, .55f, 1f), 0), new GradientColorKey(new Color(.55f, .18f, .8f), .5f), new GradientColorKey(new Color(.25f, .05f, .4f), 1) },
                new[] { new GradientAlphaKey(.55f, 0), new GradientAlphaKey(.3f, .5f), new GradientAlphaKey(0, 1) });
            l.colorGradient = g; return l;
        }
        void BuildZone(Item it, FireZone z)
        {
            if (z.Type == "spikeTrap") { it.a = NewRenderer(it, "thorn", spike, add, -19000); return; }
            it.a = NewRenderer(it, "dome", dome, addFlat, -19000);
            it.rings = new[] { NewRing(it, Color.white), NewRing(it, Color.white) };
        }
        void Drop(Dictionary<int, Item> map, List<int> ids)
        {
            foreach (int id in ids) { UnityEngine.Object.Destroy(map[id].go); map.Remove(id); }
        }

        public void Reset()
        {
            foreach (var m in new[] { zones, waves, blades, orbs }) { foreach (var it in m.Values) UnityEngine.Object.Destroy(it.go); m.Clear(); }
            if (orb != null) orb.go.SetActive(false);
            orbTrails.Clear(); ActiveZones = ActiveWaves = ActiveBlades = ActiveMaliceOrbs = 0;
        }
        public void Dispose()
        {
            Reset(); if (orb != null) UnityEngine.Object.Destroy(orb.go);
            UnityEngine.Object.Destroy(add); UnityEngine.Object.Destroy(addFlat); UnityEngine.Object.Destroy(alpha);
        }
    }
}
