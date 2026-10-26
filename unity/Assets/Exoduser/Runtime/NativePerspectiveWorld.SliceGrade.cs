using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D S2-1/RETOUCH of the START vertical slice: lighting grade (warm key / cool fill / low ambient, floor light pools, vignette,
    // atmospheric haze), seeded ground decals (dried blood, bone scatter, root vines) and the baked splat zones. Slice only: the LOOK-001
    // constants and the stage-2 lighting stay the defaults everywhere else (ApplySliceGrade runs only while SliceActive).
    public sealed partial class NativePerspectiveWorld
    {
        public static readonly Vector3 SliceKeySource = new Vector3(-1000f, 760f, -1000f); // elevation atan(760/1414) = 28.2 deg (25-35 requested)
        public static readonly Color SliceKeyColor = new Color(1.00f, 0.80f, 0.60f), SliceFillColor = new Color(0.26f, 0.38f, 0.66f), SliceAmbientColor = new Color(0.34f, 0.40f, 0.56f);
        public const float SliceKeyGain = 0.72f, SliceFillGain = 1.6f, SliceAmbientGain = 0.95f, SlicePoolGain = 5.5f, SlicePoolWrap = 0.55f;
        public static readonly Vector3 SliceFillSource = new Vector3(800f, 520f, 1000f);
        public static readonly Vector4 SliceHaze = new Vector4(0.00042f, 1300f, 0.0035f, 0f); // density, start distance px, height falloff
        public static readonly Color SliceHazeColor = new Color(0.26f, 0.19f, 0.16f);

        public const float SliceBumpAmplitude = 30f, SliceBumpWavelength = 420f; // fbm of range ~+-0.35 -> floor undulation of about +-10 px
        [Serializable] public sealed class SliceDecal { public string kind; public float x, y, sizePx, angleDegrees, alpha; public bool mirror; }
        public readonly List<SliceDecal> SliceDecals = new List<SliceDecal>();

        void ApplySliceGrade()
        {
            Shader.SetGlobalVector("_L3D_KeyDir", LinearDirection(keySource));
            Shader.SetGlobalVector("_L3D_KeyCol", Premultiplied(SliceKeyColor, KeyEnergy * (Calibrated ? KeyCalibration : 1f) * SliceKeyGain));
            Shader.SetGlobalVector("_L3D_FillDir", LinearDirection(SliceFillSource));
            Shader.SetGlobalVector("_L3D_FillCol", Premultiplied(SliceFillColor, FillEnergy * SliceFillGain));
            Shader.SetGlobalVector("_L3D_Ambient", Premultiplied(SliceAmbientColor, AmbientEnergy * (Calibrated ? AmbientCalibration : 1f) * SliceAmbientGain));
            Shader.SetGlobalVector("_L3D_Pool", new Vector4(SlicePoolGain, SlicePoolWrap, 0f, 0f));
            Shader.SetGlobalVector("_L3D_Fog2", SliceHaze);
            Shader.SetGlobalVector("_L3D_Bump", new Vector4(SliceBumpAmplitude, SliceBumpWavelength, 130f, 430f));
            Shader.SetGlobalVector("_L3D_Focus", new Vector4(Map.startX, Map.startY, 0f, 0f));
            var haze = SliceHazeColor.linear; Shader.SetGlobalVector("_L3D_Fog2Col", new Vector4(haze.r, haze.g, haze.b, 0.85f));
        }

        void ApplySlicePost()
        {
            if (Post == null) return;
            Post.Vignette = 0.42f; Post.InnerRadius = 0.30f; Post.CenterLift = 0.10f; Post.ContrastScale = 1.06f;
        }

        // Splat zone weights (baked into the mask texture channels G = dried blood, B = roots) from the walkable signed distance and seeded noise:
        // more blood and roots hugging the outskirts, patchy elsewhere. Deterministic (Mathf.PerlinNoise with fixed offsets).
        static float ZoneBlood(float wx, float wy, float sd)
        {
            float pn = Mathf.PerlinNoise(wx / 700f + 100.7f, wy / 700f + 100.3f);
            float boundary = sd > 0f && sd < 320f ? Mathf.Exp(-Mathf.Pow((sd - 120f) / 130f, 2f)) : 0f;
            return Mathf.Clamp01((pn - 0.46f) * 3.4f + boundary * 0.30f);
        }
        static float ZoneRoot(float wx, float wy, float sd)
        {
            float pn = Mathf.PerlinNoise(wx / 520f + 300.1f, wy / 520f + 300.9f);
            float boundary = sd > 0f && sd < 240f ? Mathf.Exp(-Mathf.Pow((sd - 70f) / 90f, 2f)) : 0f;
            return Mathf.Clamp01((pn - 0.50f) * 3.4f + boundary * 0.45f);
        }

        // Unit quad (centered, y = 0) subdivided n x n so the decal vertex shader can follow the floor undulation. Same UV orientation as FlatQuad.
        static Mesh GridQuad(int n)
        {
            var vertices = new Vector3[(n + 1) * (n + 1)]; var uv = new Vector2[vertices.Length]; var triangles = new int[n * n * 6];
            for (int j = 0; j <= n; j++) for (int i = 0; i <= n; i++)
            {
                float u = (float)i / n, v = (float)j / n; // u east, v north (px y decreases with v)
                vertices[j * (n + 1) + i] = Unity(-0.5f + u, 0f, 0.5f - v); uv[j * (n + 1) + i] = new Vector2(u, v);
            }
            int t = 0;
            for (int j = 0; j < n; j++) for (int i = 0; i < n; i++)
            {
                int a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
                triangles[t++] = a; triangles[t++] = c; triangles[t++] = b; triangles[t++] = b; triangles[t++] = c; triangles[t++] = d;
            }
            var mesh = new Mesh { name = "DecalGridQuad" }; mesh.vertices = vertices; mesh.uv = uv; mesh.triangles = triangles;
            mesh.bounds = new Bounds(Vector3.zero, new Vector3(1f, 80f, 1f)); mesh.RecalculateNormals();
            return mesh;
        }

        // ---------------- decals ----------------
        void BuildDecals()
        {
            var shader = Resources.Load<Shader>("Shaders/Look3DDecal");
            if (shader == null) throw new InvalidOperationException("Look3DDecal shader is missing");
            var kinds = new[] { "blood", "bone", "root" };
            var counts = new[] { 9, 5, 10 }; var sizes = new[] { 260f, 150f, 330f }; var tints = new[] { new Color(1f, 0.92f, 0.90f), new Color(0.88f, 0.84f, 0.78f), new Color(0.90f, 0.86f, 0.80f) };
            var materials = new Material[3];
            for (int k = 0; k < 3; k++)
            {
                var albedo = Resources.Load<Texture2D>("Art/map3d/decal_" + kinds[k]); var normal = Resources.Load<Texture2D>("Art/map3d/decal_" + kinds[k] + "_nrm");
                if (albedo == null || normal == null) throw new InvalidOperationException("Missing decal texture " + kinds[k]);
                albedo.wrapMode = TextureWrapMode.Clamp; normal.wrapMode = TextureWrapMode.Clamp;
                materials[k] = new Material(shader) { name = "Decal " + kinds[k] };
                materials[k].SetTexture("_MainTex", albedo); materials[k].SetTexture("_NrmTex", normal);
            }
            var mesh = GridQuad(16);
            var rng = new System.Random(20261033);
            var view = new Rect(2500f, 6550f, 3050f, 1450f);
            var focus = new Vector2(Map.startX, Map.startY);
            var order = new List<int>();
            for (int k = 0; k < 3; k++) for (int n = 0; n < counts[k]; n++) order.Add(k);
            // shuffle so one kind does not claim the best spots first
            for (int i = order.Count - 1; i > 0; i--) { int j = rng.Next(i + 1); int t = order[i]; order[i] = order[j]; order[j] = t; }
            var decalRoot = Child("Decals");
            foreach (int k in order)
            {
                bool placed = false;
                for (int attempt = 0; attempt < 6000 && !placed; attempt++)
                {
                    float x = view.xMin + (float)rng.NextDouble() * view.width, y = view.yMin + (float)rng.NextDouble() * view.height;
                    float sd = SdAt(x, y); if (sd < 40f) continue;
                    if ((new Vector2(x, y) - focus).magnitude < 140f) continue;
                    float boundary = Mathf.Exp(-Mathf.Pow((sd - 130f) / 160f, 2f));
                    float light = 0f; foreach (var l in fieldLights) light = Mathf.Max(light, 1f - Mathf.Sqrt((x - l.x) * (x - l.x) + (y - l.y) * (y - l.y)) / (l.r * 0.95f));
                    float w = 0.10f + boundary * (k == 2 ? 1.0f : 0.65f) + Mathf.Max(light, 0f) * (k == 1 ? 1.0f : 0.6f);
                    if (rng.NextDouble() > Mathf.Clamp01(w / 1.3f)) continue;
                    bool near = false; foreach (var d in SliceDecals) if ((d.x - x) * (d.x - x) + (d.y - y) * (d.y - y) < 200f * 200f) { near = true; break; }
                    if (near) continue;
                    var decal = new SliceDecal { kind = kinds[k], x = x, y = y, sizePx = sizes[k] * (0.7f + (float)rng.NextDouble() * 0.6f), angleDegrees = (float)rng.NextDouble() * 360f, alpha = (k == 0 ? 0.55f + (float)rng.NextDouble() * 0.30f : 0.78f + (float)rng.NextDouble() * 0.22f), mirror = rng.NextDouble() < 0.5 };
                    SliceDecals.Add(decal); placed = true;
                    var go = new GameObject("decal " + kinds[k]); go.transform.SetParent(decalRoot, false);
                    go.AddComponent<MeshFilter>().sharedMesh = mesh;
                    var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = materials[k]; renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = true;
                    var block = new MaterialPropertyBlock(); var tint = tints[k]; block.SetColor("_Tint", new Color(tint.r, tint.g, tint.b, decal.alpha)); renderer.SetPropertyBlock(block);
                    go.transform.position = Unity(x, 2.0f, y); go.transform.rotation = Quaternion.Euler(0f, decal.angleDegrees, 0f);
                    float stretch = 0.75f + (float)rng.NextDouble() * 0.5f; go.transform.localScale = new Vector3(decal.sizePx * stretch * (decal.mirror ? -1f : 1f), 1f, decal.sizePx);
                }
                if (!placed) UnityEngine.Debug.LogWarning("Slice: no valid spot for decal " + kinds[k]);
            }
        }
    }
}
