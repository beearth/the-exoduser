using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D MAP3D-LIFE1 (plan 4.5): motion that makes a plain map feel alive, slice START only (SliceActive).
    //  L1 wind vertex shader (grass + root tubes) / L2 player push with a fading trail / L3 moving gobo shadow (root-vine alpha textures) /
    //  L4 spore + ash motes in 3 depth layers (<= 300 particles) / L6 slow pulse of the flesh masses / L7 breathing field lights /
    //  L8 600-1500 GPU-instanced tentacle tufts scattered by map data / L9 every phase, speed and amplitude is per individual.
    // Everything is driven by LifeTime (Time.time by default, LifeTimeOverride for deterministic captures) through the shader global _L3D_Life.
    // Readability first: motion colours stay below the character in saturation and contrast; the centre of the fight area is kept sparse.
    public sealed partial class NativePerspectiveWorld
    {
        public const int GrassTargetCount = 950, ParticleLayerMax = 100, TrailSlots = 8;
        public const float GrassPushRadius = 90f, TrailDecaySeconds = 0.45f, TrailSampleDistance = 18f;
        public const float WindAmplitudePx = 9f, RootWindAmplitudePx = 4f, MassPulsePx = 3f, GoboStrength = 0.45f;
        public const float LifeStillTime = 2.0f, ParticleWarmup = 14f;

        public float? LifeTimeOverride;
        public float LifeTime { get { return LifeTimeOverride.HasValue ? LifeTimeOverride.Value : Time.time; } }
        public int GrassCount { get; private set; }
        public int GrassNotWalkable { get; private set; }
        public readonly List<Vector2> GrassPositions = new List<Vector2>();
        // Motes are GPU particles without the (disabled) built-in Particle System module: one quad mesh per layer, position/age/fade computed in the vertex shader from _L3D_Life.
        readonly List<MoteLayer> moteLayers = new List<MoteLayer>();
        sealed class MoteLayer { public int count; public float[] life, phase; }
        public int ParticleLayerCount { get { return moteLayers.Count; } }
        // Particles with a visible fade envelope (> 5%) at the current life time, from the same formula as the shader.
        public int ParticleAlive
        {
            get
            {
                int n = 0; float t = LifeTime;
                foreach (var l in moteLayers) for (int i = 0; i < l.count; i++) { float u = Mathf.Repeat(t / l.life[i] + l.phase[i], 1f); if (MoteEnvelope(u) > 0.05f) n++; }
                return n;
            }
        }
        static float MoteEnvelope(float u) { return Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(u / 0.2f)) * (1f - Mathf.SmoothStep(0f, 1f, Mathf.Clamp01((u - 0.8f) / 0.2f))); }

        Transform lifeRoot; Material grassMaterial, moteMaterial, rootMaterial3D;
        readonly Vector4[] trailArray = new Vector4[TrailSlots];
        readonly Vector2[] trailPos = new Vector2[TrailSlots - 1]; readonly float[] trailTime = new float[TrailSlots - 1]; int trailCount;
        Vector2 lastTrailSample = new Vector2(float.NaN, float.NaN);

        void BuildLife()
        {
            lifeRoot = Child("Life");
            // root tubes get their own material (wind); masses keep massMaterial3D with the pulse
            rootMaterial3D.SetFloat("_WindAmp", RootWindAmplitudePx); rootMaterial3D.SetFloat("_LifeH", 60f);
            massMaterial3D.SetFloat("_Pulse", MassPulsePx); massMaterial3D.SetFloat("_LifeH", 300f);
            BuildGobo();
            BuildGrass();
            BuildMotes();
            UpdateLife();
        }

        // ---------------- L3 gobo ----------------
        void BuildGobo()
        {
            var g0 = Resources.Load<Texture2D>("Art/map3d/decal_root_branch"); var g1 = Resources.Load<Texture2D>("Art/map3d/decal_root_tangle");
            if (g0 == null || g1 == null) throw new InvalidOperationException("Gobo textures (root decal alpha) missing");
            g0.wrapMode = TextureWrapMode.Repeat; g1.wrapMode = TextureWrapMode.Repeat; // decal edges are transparent, repeat is invisible there
            Shader.SetGlobalTexture("_L3D_Gobo0", g0); Shader.SetGlobalTexture("_L3D_Gobo1", g1);
            Shader.SetGlobalVector("_L3D_GoboParams", new Vector4(GoboStrength, 1500f, 2100f, 0f));
        }

        // ---------------- L8 tentacle tufts ----------------
        // Procedural tuft mesh: `blades` curved tapering 4-sided tubes of 6 segments (vertex colour r = height mask, g = blade phase, b = brightness).
        static Mesh MakeTuftMesh(string name, int seed, int blades, float spread, float leanMax)
        {
            const int segments = 6, sides = 4; var rng = new System.Random(seed);
            var vertices = new List<Vector3>(); var normals = new List<Vector3>(); var colors = new List<Color>(); var triangles = new List<int>();
            for (int b = 0; b < blades; b++)
            {
                float ang = (float)rng.NextDouble() * Mathf.PI * 2f, rad = Mathf.Sqrt((float)rng.NextDouble()) * spread;
                var baseP = new Vector3(Mathf.Cos(ang) * rad, 0f, Mathf.Sin(ang) * rad);
                float height = 50f * (0.7f + 0.5f * (float)rng.NextDouble()) * (1f - 0.25f * rad / Mathf.Max(spread, 1f));
                float leanAng = ang + ((float)rng.NextDouble() - 0.5f) * 0.8f, lean = leanMax * (0.3f + 0.7f * (float)rng.NextDouble()) * height;
                float width = 2.0f + 1.2f * (float)rng.NextDouble(), phase = (float)rng.NextDouble(), bright = (float)rng.NextDouble();
                int first = vertices.Count;
                for (int i = 0; i <= segments; i++)
                {
                    float t = (float)i / segments;
                    var center = baseP + new Vector3(Mathf.Cos(leanAng) * lean * t * t, height * t, Mathf.Sin(leanAng) * lean * t * t);
                    float r = Mathf.Max(width * Mathf.Pow(1f - t, 0.8f), 0.18f);
                    for (int s = 0; s < sides; s++)
                    {
                        float a = Mathf.PI * 2f * s / sides + leanAng;
                        vertices.Add(center + new Vector3(Mathf.Cos(a) * r, 0f, Mathf.Sin(a) * r));
                        normals.Add(new Vector3(Mathf.Cos(a) * 0.6f, 0.8f, Mathf.Sin(a) * 0.6f).normalized);
                        colors.Add(new Color(t, phase, bright, 1f));
                    }
                }
                for (int i = 0; i < segments; i++) for (int s = 0; s < sides; s++)
                {
                    int a0 = first + i * sides + s, a1 = first + i * sides + (s + 1) % sides, b0 = a0 + sides, b1 = a1 + sides;
                    triangles.Add(a0); triangles.Add(b0); triangles.Add(a1); triangles.Add(a1); triangles.Add(b0); triangles.Add(b1);
                }
            }
            var mesh = new Mesh { name = name, indexFormat = UnityEngine.Rendering.IndexFormat.UInt16 };
            mesh.SetVertices(vertices); mesh.SetNormals(normals); mesh.SetColors(colors); mesh.SetTriangles(triangles, 0);
            mesh.bounds = new Bounds(new Vector3(0f, 40f, 0f), new Vector3(spread * 2f + 140f, 140f, spread * 2f + 140f)); // grown for wind and push
            return mesh;
        }

        // PAINTGROUND-R: no grass inside the core of the poison pool (3400,7340), thinning out to its rim, so the pool reads at a glance (judge: grass hid it)
        static bool PoisonPoolClearsGrass(float x, float y)
        {
            float d = Mathf.Sqrt((x - 3400f) * (x - 3400f) + (y - 7340f) * (y - 7340f));
            if (d < PoisonClearCore) return true;
            if (d > PoisonClearRim) return false;
            float keep = Mathf.SmoothStep(0f, 1f, (d - PoisonClearCore) / (PoisonClearRim - PoisonClearCore));
            float h = Mathf.Repeat(Mathf.Sin(x * 12.9898f + y * 78.233f) * 43758.5453f, 1f);
            return h > keep;
        }
        public const float PoisonClearCore = 230f, PoisonClearRim = 400f;

        void BuildGrass()
        {
            var shader = Resources.Load<Shader>("Shaders/Look3DGrass");
            if (shader == null) throw new InvalidOperationException("Look3DGrass shader is missing");
            grassMaterial = new Material(shader) { name = "Look3DGrass", enableInstancing = true };
            grassMaterial.SetFloat("_WindAmp", WindAmplitudePx);
            var meshes = new[] { MakeTuftMesh("Tuft A", 7101, 14, 7f, 0.30f), MakeTuftMesh("Tuft B", 7202, 18, 9f, 0.42f), MakeTuftMesh("Tuft C", 7303, 24, 11f, 0.24f) };
            // candidate grid (jittered), weights by map data: boundary band, light pools, sparse around the focus; scaled so the total is ~GrassTargetCount
            var rng = new System.Random(20261041);
            var region = new Rect(2300f, 6300f, 3400f, 1750f); var focus = new Vector2(Map.startX, Map.startY);
            var cands = new List<Vector3>(); double total = 0;
            for (float gy = region.yMin; gy < region.yMax; gy += 28f) for (float gx = region.xMin; gx < region.xMax; gx += 28f)
            {
                float x = gx + (float)rng.NextDouble() * 28f, y = gy + (float)rng.NextDouble() * 28f;
                float sd = SdAt(x, y); if (sd < 22f) continue;
                float boundary = Mathf.Exp(-Mathf.Pow((sd - 85f) / 140f, 2f));
                float light = 0f; foreach (var l in fieldLights) light = Mathf.Max(light, 1f - Mathf.Sqrt((x - l.x) * (x - l.x) + (y - l.y) * (y - l.y)) / l.r);
                float center = Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(180f, 650f, (new Vector2(x, y) - focus).magnitude));
                float w = (0.07f + 0.75f * boundary + 0.55f * Mathf.Max(light, 0f)) * (0.12f + 0.88f * center);
                cands.Add(new Vector3(x, y, w)); total += w;
            }
            double k = GrassTargetCount / Math.Max(total, 1e-6);
            int variant = 0;
            foreach (var c in cands)
            {
                if (rng.NextDouble() > Math.Min(1.0, c.z * k)) continue;
                float dFocus = (new Vector2(c.x, c.y) - focus).magnitude;
                float near = 1f - Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(180f, 520f, dFocus)); // smaller close to the fight area
                float sy = Mathf.Lerp(0.35f, 0.9f, (float)rng.NextDouble()) * Mathf.Lerp(1f, 0.7f, near), sxz = Mathf.Lerp(0.7f, 1.25f, (float)rng.NextDouble()); // 17-45 px tall: the character (~40 px) must stay readable
                float rotation = (float)rng.NextDouble() * 360f; var tuftMesh = meshes[variant++ % meshes.Length]; // same random draws as before
                if (PoisonPoolClearsGrass(c.x, c.y)) continue; // PAINTGROUND-R: the poison pool on the left is not hidden by grass
                var go = new GameObject("tuft"); go.transform.SetParent(lifeRoot, false);
                go.AddComponent<MeshFilter>().sharedMesh = tuftMesh;
                var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = grassMaterial;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = true;
                renderer.lightProbeUsage = UnityEngine.Rendering.LightProbeUsage.Off; renderer.reflectionProbeUsage = UnityEngine.Rendering.ReflectionProbeUsage.Off;
                go.transform.position = Unity(c.x, 0f, c.y); go.transform.rotation = Quaternion.Euler(0f, rotation, 0f); go.transform.localScale = new Vector3(sxz, sy, sxz);
                GrassPositions.Add(new Vector2(c.x, c.y));
                if (!sourceMap.CanMove(c.x, c.y, OverlayBodyRadius)) GrassNotWalkable++;
            }
            GrassCount = GrassPositions.Count;
        }

        // ---------------- L4 motes ----------------
        void BuildMotes()
        {
            var shader = Resources.Load<Shader>("Shaders/Look3DMote");
            if (shader == null) throw new InvalidOperationException("Look3DMote shader is missing");
            // 3 depth layers (far / mid / near): size, drift speed and brightness grow towards the camera (parallax); 100 particles each = 300 max
            MakeMoteLayer(shader, "Motes far", 5101, 2.5f, 4.5f, new Vector3(5f, 2f, 0f), 0.55f, new Color(0.95f, 0.55f, 0.40f), new Color(0.65f, 0.60f, 0.58f));
            MakeMoteLayer(shader, "Motes mid", 5202, 5f, 8f, new Vector3(11f, 4f, 0f), 0.75f, new Color(1.0f, 0.50f, 0.32f), new Color(0.70f, 0.64f, 0.60f));
            MakeMoteLayer(shader, "Motes near", 5303, 9f, 14f, new Vector3(20f, 8f, 0f), 0.9f, new Color(1.0f, 0.45f, 0.28f), new Color(0.75f, 0.68f, 0.62f));
        }

        void MakeMoteLayer(Shader shader, string name, int seed, float sizeMin, float sizeMax, Vector3 drift, float alpha, Color ember, Color ash)
        {
            var rng = new System.Random(seed); int n = ParticleLayerMax;
            var layer = new MoteLayer { count = n, life = new float[n], phase = new float[n] };
            var vertices = new Vector3[n * 4]; var uv = new Vector2[n * 4]; var uv2 = new Vector4[n * 4]; var colors = new Color[n * 4]; var triangles = new int[n * 6];
            for (int i = 0; i < n; i++)
            {
                // spawn box (px): x +-1600, depth +-850, height 0..300 around the START view; life 10-16 s; random start phase
                var c = new Vector3(((float)rng.NextDouble() * 2f - 1f) * 1600f, (float)rng.NextDouble() * 300f, ((float)rng.NextDouble() * 2f - 1f) * 850f);
                layer.life[i] = 10f + 6f * (float)rng.NextDouble(); layer.phase[i] = (float)rng.NextDouble();
                float size = Mathf.Lerp(sizeMin, sizeMax, (float)rng.NextDouble()), seedF = (float)rng.NextDouble();
                var col = Color.Lerp(ember, ash, (float)rng.NextDouble()); col.a = alpha * (0.6f + 0.4f * (float)rng.NextDouble());
                for (int k = 0; k < 4; k++)
                {
                    vertices[i * 4 + k] = c; uv[i * 4 + k] = new Vector2(k & 1, k >> 1); colors[i * 4 + k] = col;
                    uv2[i * 4 + k] = new Vector4(layer.life[i], layer.phase[i], size, seedF);
                }
                int v = i * 4, t = i * 6; triangles[t] = v; triangles[t + 1] = v + 2; triangles[t + 2] = v + 1; triangles[t + 3] = v + 1; triangles[t + 4] = v + 2; triangles[t + 5] = v + 3;
            }
            var mesh = new Mesh { name = name, indexFormat = UnityEngine.Rendering.IndexFormat.UInt16 };
            mesh.vertices = vertices; mesh.uv = uv; mesh.SetUVs(1, uv2); mesh.colors = colors; mesh.triangles = triangles;
            mesh.bounds = new Bounds(Unity(4020f, 150f, 7140f), new Vector3(4200f, 700f, 2600f));
            var material = new Material(shader) { name = "Look3DMote " + name };
            var o = Unity(4020f, 0f, 7140f); material.SetVector("_Origin", new Vector4(o.x, o.y, o.z, 0f)); material.SetVector("_Drift", new Vector4(drift.x, drift.y, drift.z, 0f));
            var go = new GameObject(name); go.transform.SetParent(lifeRoot, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = material;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            moteLayers.Add(layer);
        }

        // ---------------- per-frame ----------------
        float LightBreath(int index)
        {
            if (!SliceActive) return 1f; // L7: every light breathes with its own period (about 10-15 s) and phase
            return 1f + 0.16f * Mathf.Sin(LifeTime * (0.42f + 0.06f * (index % 7)) + index * 2.37f);
        }

        void UpdateLife()
        {
            if (!SliceActive) return;
            float t = LifeTime; Vector2 p = PlayerPosition;
            // trail: slot 0 = the current position (always full strength); older samples (one per TrailSampleDistance moved) fade out
            if (float.IsNaN(lastTrailSample.x) || (p - lastTrailSample).magnitude >= TrailSampleDistance)
            {
                if (!float.IsNaN(lastTrailSample.x))
                {
                    for (int i = Mathf.Min(trailCount, TrailSlots - 2); i > 0; i--) { trailPos[i] = trailPos[i - 1]; trailTime[i] = trailTime[i - 1]; }
                    trailPos[0] = lastTrailSample; trailTime[0] = t; trailCount = Mathf.Min(trailCount + 1, TrailSlots - 1);
                }
                lastTrailSample = p;
            }
            trailArray[0] = new Vector4(p.x, p.y, 1f, GrassPushRadius);
            for (int i = 0; i < TrailSlots - 1; i++)
            {
                float s = i < trailCount ? Mathf.Exp(-Mathf.Max(t - trailTime[i], 0f) / TrailDecaySeconds) : 0f;
                trailArray[i + 1] = new Vector4(trailPos[i].x, trailPos[i].y, s < 0.02f ? 0f : s, GrassPushRadius);
            }
            Shader.SetGlobalVector("_L3D_Life", new Vector4(t, 0f, 0f, 0f));
            Shader.SetGlobalVectorArray("_L3D_Trail", trailArray);
        }

        // Capture/QA: fixes the life clock and refreshes the shader globals and the breathing lights (everything is a function of this time).
        public void SetLifeTime(float t)
        {
            LifeTimeOverride = t;
            UpdateLife(); UpdateFieldLights();
        }

        public void ReleaseLifeTime() { LifeTimeOverride = null; }
    }
}
