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
        // RETOUCH 2 (macbook lead decision): colours back to the LOOK-001 D key / fill / ambient (KeyColor, FillColor, AmbientColor and their energies,
        // stage-2 calibration kept); only the key elevation stays slice-specific. Floor albedo is tone-shifted to the Godot D v2 ground mean by a script-measured multiplier.
        public static readonly Vector3 SliceKeySource = new Vector3(-1000f, 760f, -1000f); // elevation atan(760/1414) = 28.2 deg (25-35 requested)
        public const float SlicePoolGain = 9.0f, SlicePoolWrap = 0.55f; // PAINTGROUND-R: gain 5.0 -> 9.0
        // PAINTGROUND-R (before: pool weight 1.0, no floor level outside the pools = 1.0, key shadow only in the 30% dynamic share = 0.0, outer body = texture x (1.8,1.0,0.95) tone)
        public const float SlicePoolWeight = 2.4f, SliceFloorOutsidePools = 0.90f, SlicePaintShadow = 0.5f;
        public const float SliceMassBody = 0.95f, SliceMassSinew = 0.0f, SliceMassBone = 0.0f, SliceMassWet = 0.0f; // design lead 2026-10-27: cream lines off (outer body = dark flesh only until the MESHY-0 meshes; V5 bright tail is a temporary exception)
        public const float SliceRidgeLo = 0.30f, SliceRidgeHi = 0.50f, SliceShadeWeight = 0.30f, SliceBodyGreen = 1.22f; // re-judge: ridge lines only, greyer body (whole-screen R/G <= 1.8) // flesh body level, sinew ridge, bone tip, wet streak gains
        public const float PaintDynamicWeight = 0.3f; // painted light 70% + dynamic light 30%
        public static readonly Vector3 SliceGroundToneDefault = new Vector3(1.78f, 1.0f, 0.94f); // (PAINTGROUND-R re-judge: R 1.72 -> 1.78: floor centre R/G 1.69 after the crimson light was reduced, whole screen 1.77) linear albedo multiplier measured by script to match the Godot D v2 ground mean (was 0.85 x3); override: --unity-world3d-ground-tone=r,g,b
        public static readonly Vector4 SliceHaze = new Vector4(0.00042f, 1300f, 0.0035f, 0f); // density, start distance px, height falloff
        public static readonly Color SliceHazeColor = new Color(0.26f, 0.19f, 0.16f);

        public const float SliceBumpAmplitude = 30f, SliceBumpWavelength = 420f; // fbm of range ~+-0.35 -> floor undulation of about +-10 px
        [Serializable] public sealed class SliceDecal { public string kind; public float x, y, sizePx, angleDegrees, alpha; public bool mirror; }
        public readonly List<SliceDecal> SliceDecals = new List<SliceDecal>();

        // QA tuning without a rebuild: --unity-world3d-tune=key=value,key=value (pgain, pz, pdark, pshadow, mbody, msinew, mbone, mwet, pblob); absent -> the default constant.
        static float SliceTune(string key, float fallback)
        {
            foreach (var a in Environment.GetCommandLineArgs())
            {
                if (!a.StartsWith("--unity-world3d-tune=")) continue;
                foreach (var pair in a.Substring(a.IndexOf('=') + 1).Split(','))
                {
                    var kv = pair.Split('='); float v;
                    if (kv.Length == 2 && kv[0] == key && float.TryParse(kv[1], System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out v)) return v;
                }
            }
            return fallback;
        }

        void ApplySliceGrade()
        {
            Shader.SetGlobalVector("_L3D_KeyDir", LinearDirection(keySource));
            Shader.SetGlobalVector("_L3D_KeyCol", Premultiplied(KeyColor, KeyEnergy * (Calibrated ? KeyCalibration : 1f)));
            Shader.SetGlobalVector("_L3D_FillDir", LinearDirection(FillSource));
            Shader.SetGlobalVector("_L3D_FillCol", Premultiplied(FillColor, FillEnergy));
            Shader.SetGlobalVector("_L3D_Ambient", Premultiplied(AmbientColor, AmbientEnergy * (Calibrated ? AmbientCalibration : 1f)));
            var tone = SliceGroundToneDefault;
            foreach (var a in Environment.GetCommandLineArgs())
                if (a.StartsWith("--unity-world3d-ground-tone="))
                {
                    var p = a.Substring(a.IndexOf('=') + 1).Split(','); float tr, tg, tb;
                    if (p.Length == 3 && float.TryParse(p[0], System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out tr) && float.TryParse(p[1], System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out tg) && float.TryParse(p[2], System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out tb)) tone = new Vector3(tr, tg, tb);
                }
            Shader.SetGlobalVector("_L3D_GroundTone", new Vector4(tone.x, tone.y, tone.z, 1f));
            {
                // reference dynamic level = what the dynamic model gives on flat ground without pools/shadow: ambient + key*N.L + fill*N.L (N = up)
                Vector3 kd = LinearDirection(keySource), fd = LinearDirection(FillSource);
                var kc = Premultiplied(KeyColor, KeyEnergy * (Calibrated ? KeyCalibration : 1f)); var fc = Premultiplied(FillColor, FillEnergy); var ac = Premultiplied(AmbientColor, AmbientEnergy * (Calibrated ? AmbientCalibration : 1f));
                float kn = Mathf.Max(kd.y, 0f), fn = Mathf.Max(fd.y, 0f);
                Shader.SetGlobalVector("_L3D_PaintRef", new Vector4(ac.x + kc.x * kn + fc.x * fn, ac.y + kc.y * kn + fc.y * fn, ac.z + kc.z * kn + fc.z * fn, PaintDynamicWeight));
            }
            Shader.SetGlobalVector("_L3D_Pool", new Vector4(SliceTune("pgain", SlicePoolGain), SlicePoolWrap, SliceTune("pz", SlicePoolWeight), SliceTune("pdark", SliceFloorOutsidePools)));
            Shader.SetGlobalVector("_L3D_PaintShadow", new Vector4(SliceTune("pshadow", SlicePaintShadow), 0f, 0f, 0f));
            Shader.SetGlobalVector("_L3D_MassTune2", new Vector4(SliceTune("rlo", SliceRidgeLo), SliceTune("rhi", SliceRidgeHi), SliceTune("shw", SliceShadeWeight), SliceTune("bg", SliceBodyGreen)));
            Shader.SetGlobalVector("_L3D_MassTune", new Vector4(SliceTune("mbody", SliceMassBody), SliceTune("msinew", SliceMassSinew), SliceTune("mbone", SliceMassBone), SliceTune("mwet", SliceMassWet)));
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
            // GPT-DECAL2 variants (HANDOFF section 6): blood drag / drops / cracked, bone ribs / skull, root branch / tangle
            var kinds = new[] { "blood_drag", "blood_drops", "blood_cracked", "bone_ribs", "bone_skull", "root_branch", "root_tangle" };
            // sizes: the previous values x DecalScale (0.45): the character is ~40 px tall, root vines must not be 6-8 character lengths, bone ~knee height
            const float DecalScale = 0.5f;
            var counts = new[] { 3, 3, 2, 3, 1, 5, 5 }; var sizes = new[] { 420f * DecalScale, 520f * DecalScale, 280f * DecalScale, 120f * DecalScale, 66f * DecalScale, 380f * DecalScale, 340f * DecalScale };
            var erode = new[] { 0.3f, 0.3f, 0.8f, 0.2f, 0.2f, 0.25f, 0.25f }; var lowOnly = new[] { 0f, 0f, 1f, 0f, 0f, 0f, 0f }; // cracked pool: noise-eroded edge, only in low floor areas
            var tints = new[] { new Color(1f, 0.92f, 0.90f), new Color(1f, 0.92f, 0.90f), new Color(0.82f, 0.70f, 0.67f), new Color(0.50f, 0.46f, 0.41f), new Color(0.44f, 0.41f, 0.37f), new Color(0.92f, 0.88f, 0.82f), new Color(0.90f, 0.86f, 0.80f) };
            var materials = new Material[kinds.Length];
            for (int k = 0; k < kinds.Length; k++)
            {
                var albedo = Resources.Load<Texture2D>("Art/map3d/decal_" + kinds[k]); var normal = Resources.Load<Texture2D>("Art/map3d/decal_" + kinds[k] + "_nrm");
                if (albedo == null || normal == null) throw new InvalidOperationException("Missing decal texture " + kinds[k]);
                albedo.wrapMode = TextureWrapMode.Clamp; normal.wrapMode = TextureWrapMode.Clamp;
                materials[k] = new Material(shader) { name = "Decal " + kinds[k] };
                materials[k].SetTexture("_MainTex", albedo); materials[k].SetTexture("_NrmTex", normal); materials[k].SetFloat("_Erode", erode[k]); materials[k].SetFloat("_LowOnly", lowOnly[k]);
            }
            var mesh = GridQuad(16);
            var rng = new System.Random(20261033);
            var view = new Rect(2500f, 6550f, 3050f, 1450f);
            var focus = new Vector2(Map.startX, Map.startY);
            var order = new List<int>();
            for (int k = 0; k < kinds.Length; k++) for (int n = 0; n < counts[k]; n++) order.Add(k);
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
                    bool isRoot = k >= 5, isBone = k == 3 || k == 4;
                    float w = 0.10f + boundary * (isRoot ? 1.0f : 0.65f) + Mathf.Max(light, 0f) * (isBone ? 1.0f : 0.6f);
                    if (rng.NextDouble() > Mathf.Clamp01(w / 1.3f)) continue;
                    bool near = false; foreach (var d in SliceDecals) if ((d.x - x) * (d.x - x) + (d.y - y) * (d.y - y) < 150f * 150f) { near = true; break; }
                    if (near) continue;
                    var decal = new SliceDecal { kind = kinds[k], x = x, y = y, sizePx = sizes[k] * (0.7f + (float)rng.NextDouble() * 0.6f), angleDegrees = (float)rng.NextDouble() * 360f, alpha = 0.62f + (float)rng.NextDouble() * 0.20f, mirror = rng.NextDouble() < 0.5 };
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
