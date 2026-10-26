using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D vertical slice (START screen, focus (4020,7420)): real geometry instead of flat art.
    //  - ground: 8 px grid mesh displaced in the vertex shader by floor_v01b_height / mass_v01_height (Look3DGroundLayered), two material layers
    //    (L0 floor_v01b, L1 mass_v01) blended by height with a splat weight from a signed-distance mask baked from SourceMap.CanMove (walkable
    //    stays within +-1.5 px of y=0, the blocked outskirts rise up to ~20 px);
    //  - outer masses: the procedural OBJ meshes of E:/exoduser-wt/_out/map3d-mass (SDF smooth-union lobes + fBm/ridged displacement, made by the
    //    mesh teammate) placed ON non-walkable cells only (footprint ellipse tested against the same SDF), triplanar mass_v01;
    //  - root tubes, contact AO ellipses, key shadow, point lights, fog (S2-2 stack) and the existing billboard player with its foot blob.
    // Enabled by --unity-world3d-slice. The simulation, collision and 2D path are untouched; nothing here creates collision.
    public sealed partial class NativePerspectiveWorld
    {
        public const string SliceArgument = "--unity-world3d-slice";
        public static bool WantsSlice { get { return Array.IndexOf(Environment.GetCommandLineArgs(), SliceArgument) >= 0; } }

        public static readonly Rect SliceRect = new Rect(2100f, 5900f, 3850f, 2100f);
        public const float SliceCell = 10f, SliceSdRange = 400f, SliceGridStep = 8f;
        public bool SliceActive { get; private set; }
        public int SliceVertexCount { get; private set; }
        public readonly List<SlicePlacement> SlicePlacements = new List<SlicePlacement>();

        [Serializable] public sealed class SlicePlacement { public string mesh; public float x, y, angleDegrees, scale, radiusA, radiusB; public int footprintWalkableCells; public float minSd, heightStretch, heightPx; }

        float[] sdGrid; int sdW, sdH;
        Material groundMaterial, massMaterial3D, aoMaterial;
        Transform sliceRoot;
        Texture2D maskTexture; RenderTexture macroTexture;
        Vector3 keySource = KeySource;
        public void SetSliceDebug(int mode) { if (groundMaterial != null) groundMaterial.SetFloat("_Debug", mode); }

        // ---- key light override (slice only; the LOOK-001 constant stays the default) ----
        public void SetKeySource(Vector3 source)
        {
            keySource = source;
            if (keyLight != null) keyLight.transform.rotation = Quaternion.LookRotation(-LinearDirection(source), Vector3.up);
            SetCalibration(Calibrated);
        }

        void BuildSlice()
        {
            SliceActive = true;
            chunkRoot.gameObject.SetActive(false); massRoot.gameObject.SetActive(false);
            sliceRoot = Child("Vertical slice");
            BuildMask();
            BuildMacro();
            BuildGround();
            BuildSliceMeshes();
            // slice lighting grade (SliceGrade.cs): key at ~28 deg, warm key / cool fill / low ambient, floor light pools, haze, vignette; three extra placeholder point lights (not in the source table)
            SetKeySource(SliceKeySource);
            if (keyLight != null) keyLight.shadowStrength = 0.85f;
            ApplySlicePost();
            AddSliceExtraLight(3430f, 7330f, 480f, 0.90f, 255f, 150f, 70f, 1f);
            AddSliceExtraLight(4640f, 7540f, 460f, 0.80f, 255f, 72f, 44f, 0.6f);
            AddSliceExtraLight(3700f, 7750f, 300f, 0.40f, 126f, 236f, 98f, 0.7f);
            AddSliceExtraLight(4260f, 7770f, 430f, 0.75f, 255f, 170f, 90f, 0.8f);
            BuildDecals();
            UpdateFieldLights();
        }

        // ---------------- signed-distance mask ----------------
        void BuildMask()
        {
            sdW = Mathf.CeilToInt(SliceRect.width / SliceCell); sdH = Mathf.CeilToInt(SliceRect.height / SliceCell);
            var blocked = new bool[sdW * sdH];
            for (int j = 0; j < sdH; j++) for (int i = 0; i < sdW; i++)
                blocked[j * sdW + i] = !sourceMap.CanMove(SliceRect.x + (i + 0.5f) * SliceCell, SliceRect.y + (j + 0.5f) * SliceCell, OverlayBodyRadius);
            var toBlocked = Chamfer(blocked, true); var toWalkable = Chamfer(blocked, false);
            sdGrid = new float[sdW * sdH];
            for (int k = 0; k < sdGrid.Length; k++) sdGrid[k] = Mathf.Clamp(blocked[k] ? -toWalkable[k] * SliceCell : toBlocked[k] * SliceCell, -SliceSdRange, SliceSdRange);
            // 3x3 smoothing keeps gradients usable for the splat and for the placement orientation
            var smooth = new float[sdGrid.Length];
            for (int j = 0; j < sdH; j++) for (int i = 0; i < sdW; i++)
            {
                float sum = 0; int n = 0;
                for (int dj = -1; dj <= 1; dj++) for (int di = -1; di <= 1; di++) { int ii = Mathf.Clamp(i + di, 0, sdW - 1), jj = Mathf.Clamp(j + dj, 0, sdH - 1); sum += sdGrid[jj * sdW + ii]; n++; }
                smooth[j * sdW + i] = sum / n;
            }
            sdGrid = smooth;
            var pixels = new Color32[sdW * sdH];
            for (int k = 0; k < pixels.Length; k++)
            {
                float wx = SliceRect.x + (k % sdW + 0.5f) * SliceCell, wy = SliceRect.y + (k / sdW + 0.5f) * SliceCell;
                pixels[k] = new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(sdGrid[k] / SliceSdRange * 0.5f + 0.5f) * 255f), (byte)Mathf.RoundToInt(ZoneBlood(wx, wy, sdGrid[k]) * 255f), (byte)Mathf.RoundToInt(ZoneRoot(wx, wy, sdGrid[k]) * 255f), 255);
            }
            maskTexture = new Texture2D(sdW, sdH, TextureFormat.RGBA32, false, true) { name = "SliceSdMask", wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            maskTexture.SetPixels32(pixels); maskTexture.Apply(false, false);
        }

        // Distance (in cells) to the nearest `target`-type cell; 0 on target cells. target == true: blocked cells, false: walkable cells.
        float[] Chamfer(bool[] blocked, bool targetBlocked)
        {
            var d = new float[sdW * sdH]; const float big = 1e6f, diag = 1.41421356f;
            for (int k = 0; k < d.Length; k++) d[k] = (blocked[k] == targetBlocked) ? 0f : big;
            for (int j = 0; j < sdH; j++) for (int i = 0; i < sdW; i++)
            {
                float v = d[j * sdW + i];
                if (i > 0) v = Mathf.Min(v, d[j * sdW + i - 1] + 1f); if (j > 0) v = Mathf.Min(v, d[(j - 1) * sdW + i] + 1f);
                if (i > 0 && j > 0) v = Mathf.Min(v, d[(j - 1) * sdW + i - 1] + diag); if (i < sdW - 1 && j > 0) v = Mathf.Min(v, d[(j - 1) * sdW + i + 1] + diag);
                d[j * sdW + i] = v;
            }
            for (int j = sdH - 1; j >= 0; j--) for (int i = sdW - 1; i >= 0; i--)
            {
                float v = d[j * sdW + i];
                if (i < sdW - 1) v = Mathf.Min(v, d[j * sdW + i + 1] + 1f); if (j < sdH - 1) v = Mathf.Min(v, d[(j + 1) * sdW + i] + 1f);
                if (i < sdW - 1 && j < sdH - 1) v = Mathf.Min(v, d[(j + 1) * sdW + i + 1] + diag); if (i > 0 && j < sdH - 1) v = Mathf.Min(v, d[(j + 1) * sdW + i - 1] + diag);
                d[j * sdW + i] = v;
            }
            return d;
        }

        public float SdAt(float px, float py)
        {
            float fx = (px - SliceRect.x) / SliceCell - 0.5f, fy = (py - SliceRect.y) / SliceCell - 0.5f;
            int x0 = Mathf.Clamp(Mathf.FloorToInt(fx), 0, sdW - 2), y0 = Mathf.Clamp(Mathf.FloorToInt(fy), 0, sdH - 2);
            float tx = Mathf.Clamp01(fx - x0), ty = Mathf.Clamp01(fy - y0);
            float a = Mathf.Lerp(sdGrid[y0 * sdW + x0], sdGrid[y0 * sdW + x0 + 1], tx), b = Mathf.Lerp(sdGrid[(y0 + 1) * sdW + x0], sdGrid[(y0 + 1) * sdW + x0 + 1], tx);
            return Mathf.Lerp(a, b, ty);
        }

        // ---------------- macro colour (original baked ground, region sized, with mips) ----------------
        void BuildMacro()
        {
            const int W = 1024, H = 560;
            macroTexture = new RenderTexture(W, H, 0, RenderTextureFormat.ARGB32) { name = "SliceMacroColour", useMipMap = true, autoGenerateMips = false, filterMode = FilterMode.Trilinear, wrapMode = TextureWrapMode.Clamp };
            macroTexture.Create();
            var previous = RenderTexture.active; RenderTexture.active = macroTexture;
            GL.Clear(true, true, new Color(0.2f, 0.17f, 0.15f, 1f));
            GL.PushMatrix(); GL.LoadPixelMatrix(0, W, H, 0);
            foreach (var c in Map.chunks)
            {
                if (!SliceRect.Overlaps(new Rect(c.x, c.y, c.width, c.height))) continue;
                var texture = Resources.Load<Texture2D>(c.texture); if (texture == null) continue;
                var dst = new Rect((c.x - SliceRect.x) / SliceRect.width * W, (c.y - SliceRect.y) / SliceRect.height * H, c.width / SliceRect.width * W, c.height / SliceRect.height * H);
                var src = new Rect((float)c.sx / texture.width, 1f - (float)(c.sy + c.sh) / texture.height, (float)c.sw / texture.width, (float)c.sh / texture.height);
                Graphics.DrawTexture(dst, texture, src, 0, 0, 0, 0);
                Resources.UnloadAsset(texture);
            }
            GL.PopMatrix(); RenderTexture.active = previous;
            macroTexture.GenerateMips();
        }

        // ---------------- ground grid ----------------
        void BuildGround()
        {
            var shader = Resources.Load<Shader>("Shaders/Look3DGroundLayered");
            if (shader == null) throw new InvalidOperationException("Look3DGroundLayered shader is missing");
            groundMaterial = new Material(shader) { name = "Look3DGroundLayered" };
            Action<string, string> tex = (prop, path) =>
            {
                var t = Resources.Load<Texture2D>(path); if (t == null) throw new InvalidOperationException("Missing texture " + path);
                t.wrapMode = TextureWrapMode.Repeat; t.filterMode = FilterMode.Trilinear; t.anisoLevel = 8; groundMaterial.SetTexture(prop, t);
            };
            tex("_FloorAlb", "Art/map3d/floor_v01b"); tex("_FloorNhr", "Art/map3d/floor_v01b_nhr");
            tex("_BloodAlb", "Art/map3d/floor_v02b"); tex("_BloodNhr", "Art/map3d/floor_v02b_nhr");
            tex("_RootAlb", "Art/map3d/floor_v03b"); tex("_RootNhr", "Art/map3d/floor_v03b_nhr");
            tex("_MassAlb", "Art/map3d/mass_v01"); tex("_MassNhr", "Art/map3d/mass_v01_nhr");
            groundMaterial.SetTexture("_MaskTex", maskTexture); groundMaterial.SetTexture("_MacroTex", macroTexture);
            Shader.SetGlobalTexture("_L3D_MaskTex", maskTexture); Shader.SetGlobalVector("_L3D_MaskRect", new Vector4(SliceRect.x, SliceRect.y, SliceRect.width, SliceRect.height));
            groundMaterial.SetVector("_MaskRect", new Vector4(SliceRect.x, SliceRect.y, SliceRect.width, SliceRect.height));
            groundMaterial.SetVector("_Tiles", new Vector4(1250f, 700f, 0f, 0f)); groundMaterial.SetVector("_Disp", new Vector4(3f, 18f, 0f, 0f)); groundMaterial.SetFloat("_SDRange", SliceSdRange);
            int nx = Mathf.CeilToInt(SliceRect.width / SliceGridStep), nz = Mathf.CeilToInt(SliceRect.height / SliceGridStep);
            var vertices = new Vector3[(nx + 1) * (nz + 1)]; var triangles = new int[nx * nz * 6];
            for (int j = 0; j <= nz; j++) for (int i = 0; i <= nx; i++)
                vertices[j * (nx + 1) + i] = Unity(SliceRect.x + Mathf.Min(i * SliceGridStep, SliceRect.width), 0f, SliceRect.y + Mathf.Min(j * SliceGridStep, SliceRect.height));
            int t = 0;
            for (int j = 0; j < nz; j++) for (int i = 0; i < nx; i++)
            {
                int a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
                triangles[t++] = a; triangles[t++] = b; triangles[t++] = c; triangles[t++] = b; triangles[t++] = d; triangles[t++] = c;
            }
            var mesh = new Mesh { name = "SliceGroundGrid", indexFormat = UnityEngine.Rendering.IndexFormat.UInt32 };
            mesh.vertices = vertices; mesh.triangles = triangles; mesh.bounds = new Bounds(Unity(SliceRect.center.x, 10f, SliceRect.center.y), new Vector3(SliceRect.width, 60f, SliceRect.height));
            SliceVertexCount = vertices.Length;
            var go = new GameObject("Ground grid " + SliceGridStep + "px"); go.transform.SetParent(sliceRoot, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = groundMaterial;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On; renderer.receiveShadows = true; // casting On: the ground ShadowCaster pass also feeds the screen-space shadow depth
        }

        // ---------------- masses, roots, contact AO ----------------
        sealed class MeshSpec { public string name; public float scale; public bool root; }

        void BuildSliceMeshes()
        {
            var massShader = Resources.Load<Shader>("Shaders/Look3DMass");
            if (massShader == null) throw new InvalidOperationException("Look3DMass shader is missing");
            massMaterial3D = new Material(massShader) { name = "Look3DMass" };
            var massAlb = Resources.Load<Texture2D>("Art/map3d/mass_v01"); var massNrm = Resources.Load<Texture2D>("Art/map3d/mass_v01_normal");
            massAlb.wrapMode = TextureWrapMode.Repeat; massNrm.wrapMode = TextureWrapMode.Repeat; massAlb.filterMode = FilterMode.Bilinear; massNrm.filterMode = FilterMode.Bilinear;
            massMaterial3D.SetTexture("_MassAlb", massAlb); massMaterial3D.SetTexture("_MassNrm", massNrm);
            var blobShader = Resources.Load<Shader>("Shaders/Look3DBlob");
            aoMaterial = new Material(blobShader) { name = "SliceContactAO" };
            aoMaterial.SetTexture("_MainTex", blobTexture); aoMaterial.SetColor("_Color", new Color(1f, 1f, 1f, 0.92f));
            var specs = new[]
            {
                new MeshSpec { name = "mass_01", scale = 1.0f }, new MeshSpec { name = "mass_02", scale = 1.0f }, new MeshSpec { name = "mass_03", scale = 1.1f },
                new MeshSpec { name = "mass_04", scale = 1.0f }, new MeshSpec { name = "mass_03", scale = 0.8f },
                new MeshSpec { name = "root_01", scale = 1.0f, root = true }, new MeshSpec { name = "root_02", scale = 1.0f, root = true }, new MeshSpec { name = "root_03", scale = 1.1f, root = true },
            };
            var rng = new System.Random(20261026);
            foreach (var spec in specs)
            {
                var model = Resources.Load<GameObject>("Art/map3d/mesh/" + spec.name);
                if (model == null) throw new InvalidOperationException("Missing mesh " + spec.name);
                var mesh = model.GetComponentInChildren<MeshFilter>().sharedMesh;
                float scale = spec.scale * (0.92f + (float)rng.NextDouble() * 0.16f);
                SlicePlacement p;
                if (!FindPlacement(mesh, spec, scale, out p)) { UnityEngine.Debug.LogWarning("Slice: no valid spot for " + spec.name); continue; }
                // vertical stretch (footprint unchanged) so the masses read as walls of 150-400 px (mesh heights are 165-380)
                p.heightStretch = spec.root ? 1f : Mathf.Clamp(380f / Mathf.Max(mesh.bounds.size.y * p.scale, 1f), 1f, 1.5f); p.heightPx = mesh.bounds.size.y * p.scale * p.heightStretch;
                SlicePlacements.Add(p);
                var go = new GameObject("slice " + spec.name); go.transform.SetParent(sliceRoot, false);
                go.AddComponent<MeshFilter>().sharedMesh = mesh;
                var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = massMaterial3D;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.TwoSided; renderer.receiveShadows = true;
                // OBJ import mirrors X; file coords (x east, z south) -> Unity rotation y = theta + 180 (derivation in the doc).
                go.transform.position = Unity(p.x, 0f, p.y); go.transform.rotation = Quaternion.Euler(0f, p.angleDegrees + 180f, 0f); go.transform.localScale = new Vector3(p.scale, p.scale * p.heightStretch, p.scale);
                // contact AO ellipse under the footprint
                var ao = new GameObject("contact AO " + spec.name); ao.transform.SetParent(sliceRoot, false);
                ao.AddComponent<MeshFilter>().sharedMesh = FlatQuad(-0.5f, -0.5f, 1f, 1f, 0f, 0f, 0f, 1f, 1f);
                var aor = ao.AddComponent<MeshRenderer>(); aor.sharedMaterial = aoMaterial; aor.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; aor.receiveShadows = false;
                ao.transform.position = Unity(p.x, 0.8f, p.y); ao.transform.rotation = Quaternion.Euler(0f, p.angleDegrees, 0f);
                ao.transform.localScale = new Vector3(p.radiusA * 3.4f, 1f, p.radiusB * 3.4f);
                var ao2 = new GameObject("contact AO core " + spec.name); ao2.transform.SetParent(sliceRoot, false);
                ao2.AddComponent<MeshFilter>().sharedMesh = FlatQuad(-0.5f, -0.5f, 1f, 1f, 0f, 0f, 0f, 1f, 1f);
                var aor2 = ao2.AddComponent<MeshRenderer>(); aor2.sharedMaterial = aoMaterial; aor2.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; aor2.receiveShadows = false;
                ao2.transform.position = Unity(p.x, 0.9f, p.y); ao2.transform.rotation = Quaternion.Euler(0f, p.angleDegrees, 0f); ao2.transform.localScale = new Vector3(p.radiusA * 2.2f, 1f, p.radiusB * 2.2f);
            }
        }

        // Places the mesh footprint (an ellipse in the mesh's own X/Z extents) on non-walkable cells hugging the walkable boundary,
        // inside the START view, oriented along the boundary tangent, without overlapping earlier placements.
        bool FindPlacement(Mesh mesh, MeshSpec spec, float scale, out SlicePlacement result)
        {
            result = null;
            var b = mesh.bounds;
            float a = Mathf.Max(b.extents.x, 20f) * scale * (spec.root ? 0.9f : 0.8f), c = Mathf.Max(b.extents.z, 20f) * scale * (spec.root ? 0.9f : 0.8f);
            var view = new Rect(2450f, 6500f, 3150f, 1550f);
            float bestScore = float.NegativeInfinity;
            for (float y = view.yMin; y <= view.yMax; y += 30f) for (float x = view.xMin; x <= view.xMax; x += 30f)
            {
                float sd0 = SdAt(x, y); if (sd0 > -10f || sd0 < -260f) continue;
                float gx = (SdAt(x + 20f, y) - SdAt(x - 20f, y)) / 40f, gy = (SdAt(x, y + 20f) - SdAt(x, y - 20f)) / 40f;
                float gl = Mathf.Sqrt(gx * gx + gy * gy); if (gl < 0.2f) continue;
                float tx = -gy / gl, ty = gx / gl; // boundary tangent
                float theta = Mathf.Atan2(ty, tx);
                float maxSd = float.NegativeInfinity; int walkable = 0; float ct = Mathf.Cos(theta), st = Mathf.Sin(theta);
                for (int k = 0; k <= 24; k++)
                {
                    float ang = k == 24 ? 0f : Mathf.PI * 2f * k / 24f, lx = k == 24 ? 0f : Mathf.Cos(ang) * a, lz = k == 24 ? 0f : Mathf.Sin(ang) * c;
                    float s = SdAt(x + lx * ct - lz * st, y + lx * st + lz * ct); maxSd = Mathf.Max(maxSd, s); if (s > 0f) walkable++;
                }
                float allowed = spec.root ? 25f : -16f;
                if (maxSd > allowed) continue;
                bool overlap = false;
                foreach (var q in SlicePlacements)
                {
                    float dx = x - q.x, dy = y - q.y; float need = (spec.root ? 0.6f : 1.0f) * (Mathf.Max(a, c) + Mathf.Max(q.radiusA, q.radiusB));
                    if (!(spec.root && q.mesh.StartsWith("mass") ) && dx * dx + dy * dy < need * need * 0.55f) { overlap = true; break; }
                }
                if (overlap) continue;
                float score = maxSd; // closest to the walkable boundary that still fits
                score -= spec.root ? 0f : 90f / (1f + MinDistanceToPlaced(x, y) / 350f);
                if (score > bestScore) { bestScore = score; result = new SlicePlacement { mesh = spec.name, x = x, y = y, angleDegrees = theta * Mathf.Rad2Deg, scale = scale, radiusA = a, radiusB = c, footprintWalkableCells = walkable, minSd = maxSd }; }
            }
            return result != null;
        }

        float MinDistanceToPlaced(float x, float y)
        {
            float best = 1e6f; foreach (var q in SlicePlacements) best = Mathf.Min(best, Mathf.Sqrt((x - q.x) * (x - q.x) + (y - q.y) * (y - q.y)));
            return best;
        }

        // Verification: every footprint sample of every placement against the simulation's own CanMove (independent of the SDF).
        public int CountFootprintWalkableViolations()
        {
            int bad = 0;
            foreach (var p in SlicePlacements)
            {
                float ct = Mathf.Cos(p.angleDegrees * Mathf.Deg2Rad), st = Mathf.Sin(p.angleDegrees * Mathf.Deg2Rad);
                for (int k = 0; k < 24; k++)
                {
                    float ang = Mathf.PI * 2f * k / 24f, lx = Mathf.Cos(ang) * p.radiusA, lz = Mathf.Sin(ang) * p.radiusB;
                    if (!p.mesh.StartsWith("root") && sourceMap.CanMove(p.x + lx * ct - lz * st, p.y + lx * st + lz * ct, OverlayBodyRadius)) bad++;
                }
            }
            return bad;
        }

        // ---------------- standalone capture (--unity-world3d-capture <out> --unity-world3d-slice) ----------------
        [Serializable] sealed class SliceReceipt
        {
            public string scope = "PC-MAP3D vertical slice, START (4020,7420), 1920x1080";
            public string unityVersion, graphicsDevice, graphicsApi, renderPipeline;
            public int gridVertices, gridTriangles, placements, footprintWalkableViolations, shadowCascades, fieldLights;
            public float gridStepPx, groundDisplacementWalkablePx, groundDisplacementWallPx;
            public string textureSamples = "vertex 3 (mask, 2 height) + fragment 17 ground (mask 1, macro 2, albedo 7, nhr 7) + mass 6 (triplanar albedo x3, normal x3) + decal 3 each (albedo, normal, alpha mip)";
            public int decals, decalsBlood, decalsBone, decalsRoot; public float keyElevationDegrees, fogHazeDensity;
            public List<SliceDecal> decalList = new List<SliceDecal>();
            public List<SlicePlacement> list = new List<SlicePlacement>();
            public List<string> checks = new List<string>();
            public bool passed; public string png, fpsJson;
        }

        IEnumerator SliceCaptureRoutine(string output)
        {
            var receipt = new SliceReceipt(); Directory.CreateDirectory(output);
            try
            {
                SilenceHostScene();
                var resource = Resources.Load<TextAsset>("Data/ch1_map");
                Initialize(JsonUtility.FromJson<MapData>(resource.text));
                SyncPlayer(Map.startX, Map.startY, 15f, 2, 0);
                WorldCamera.enabled = true; Prime(new Vector2(Map.startX, Map.startY));
            }
            catch (Exception e) { UnityEngine.Debug.LogException(e); receipt.checks.Add("FAIL init: " + e); File.WriteAllText(Path.Combine(output, "slice.json"), JsonUtility.ToJson(receipt, true)); Application.Quit(2); yield break; }
            for (int i = 0; i < 6; i++) yield return null;
            yield return new WaitForEndOfFrame();
            FlickerFrameOverride = 0f;
            var rt = new RenderTexture(1920, 1080, 24, RenderTextureFormat.ARGB32) { antiAliasing = 1 };
            var shown = WorldCamera.targetTexture; WorldCamera.targetTexture = rt;
            var image = new Texture2D(1920, 1080, TextureFormat.RGB24, false); var previous = RenderTexture.active;
            Action<string> save = path => { WorldCamera.Render(); RenderTexture.active = rt; image.ReadPixels(new Rect(0, 0, 1920, 1080), 0, 0); image.Apply(); RenderTexture.active = previous; File.WriteAllBytes(path, image.EncodeToPNG()); };
            Prime(new Vector2(Map.startX, Map.startY)); yield return null; yield return null;
            string png = Path.Combine(output, "unity-slice.png"); save(png);
            SetShadows(false); save(Path.Combine(output, "unity-slice-noshadow.png")); SetShadows(true);
            SetFieldLights(false); save(Path.Combine(output, "unity-slice-nolights.png")); SetFieldLights(true);
            SetCollisionOverlay(true); yield return null; save(Path.Combine(output, "unity-slice-collision.png")); SetCollisionOverlay(false);
            SetSliceDebug(2); save(Path.Combine(output, "unity-slice-debug-mask.png")); SetSliceDebug(3); save(Path.Combine(output, "unity-slice-debug-splat.png")); SetSliceDebug(0);
            File.WriteAllBytes(Path.Combine(output, "unity-slice-splat-mask.png"), maskTexture.EncodeToPNG());
            WorldCamera.targetTexture = shown; rt.Release(); Destroy(rt); Destroy(image);
            receipt.unityVersion = Application.unityVersion; receipt.graphicsDevice = SystemInfo.graphicsDeviceName; receipt.graphicsApi = SystemInfo.graphicsDeviceType.ToString();
            receipt.renderPipeline = UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline == null ? "Built-in" : "SRP";
            receipt.gridVertices = SliceVertexCount; receipt.gridTriangles = (SliceVertexCount > 0 ? Mathf.CeilToInt(SliceRect.width / SliceGridStep) * Mathf.CeilToInt(SliceRect.height / SliceGridStep) * 2 : 0);
            receipt.gridStepPx = SliceGridStep; receipt.groundDisplacementWalkablePx = 3f; receipt.groundDisplacementWallPx = 18f;
            receipt.placements = SlicePlacements.Count; receipt.list = SlicePlacements; receipt.footprintWalkableViolations = CountFootprintWalkableViolations();
            receipt.shadowCascades = QualitySettings.shadowCascades; receipt.fieldLights = FieldLightCount; receipt.png = png;
            receipt.decalList = SliceDecals; receipt.decals = SliceDecals.Count; foreach (var d in SliceDecals) { if (d.kind == "blood") receipt.decalsBlood++; else if (d.kind == "bone") receipt.decalsBone++; else receipt.decalsRoot++; }
            receipt.keyElevationDegrees = Mathf.Atan2(SliceKeySource.y, new Vector2(SliceKeySource.x, SliceKeySource.z).magnitude) * Mathf.Rad2Deg; receipt.fogHazeDensity = SliceHaze.x;
            Action<bool, string> check = (ok, name) => receipt.checks.Add((ok ? "PASS " : "FAIL ") + name);
            check(receipt.renderPipeline == "Built-in", "Built-in render pipeline");
            check(SlicePlacements.FindAll(p => p.mesh.StartsWith("mass")).Count >= 3, "at least 3 procedural masses placed");
            check(SlicePlacements.FindAll(p => p.mesh.StartsWith("root")).Count >= 2, "at least 2 root tubes placed");
            check(receipt.footprintWalkableViolations == 0, "no mass footprint sample is walkable per SourceMap.CanMove (24 samples each)");
            check(ShadowsEnabled, "key shadow on");

            // 30 s still-scene frame intervals (LOOK-001 definitions)
            float seconds = 30f; float parsed; if (float.TryParse(ArgumentValue(FpsSecondsArgument), out parsed) && parsed >= 1f) seconds = parsed;
            var fps = new FpsReceipt { scene = "vertical slice START still scene, key shadow + lights + fog + glow, no input", vSyncCount = QualitySettings.vSyncCount, targetFrameRate = Application.targetFrameRate };
            var intervals = new List<double>(4096); var clock = Stopwatch.StartNew();
            yield return new WaitForEndOfFrame(); double begin = clock.Elapsed.TotalSeconds, previousTime = begin, binBegin = begin; int binFrames = 0;
            while (previousTime - begin < seconds)
            {
                yield return new WaitForEndOfFrame();
                double now = clock.Elapsed.TotalSeconds; intervals.Add(now - previousTime); binFrames++;
                if (now - binBegin >= 1.0) { fps.oneSecondBins.Add(binFrames / (now - binBegin)); binBegin = now; binFrames = 0; }
                previousTime = now;
            }
            double duration = previousTime - begin, longest = 0; foreach (double v in intervals) if (v > longest) longest = v;
            double minimumBin = double.PositiveInfinity; foreach (double v in fps.oneSecondBins) if (v < minimumBin) minimumBin = v;
            fps.frames = intervals.Count; fps.durationSeconds = duration; fps.averageFps = intervals.Count / duration; fps.minimumOneSecondFps = double.IsInfinity(minimumBin) ? 0 : minimumBin;
            fps.longestFrameMs = longest * 1000.0; fps.minimumInstantaneousFps = longest > 0 ? 1.0 / longest : 0;
            string fpsPath = Path.Combine(output, "unity-slice-fps.json"); File.WriteAllText(fpsPath, JsonUtility.ToJson(fps, true)); receipt.fpsJson = fpsPath;
            receipt.passed = !receipt.checks.Exists(c => c.StartsWith("FAIL"));
            File.WriteAllText(Path.Combine(output, "slice.json"), JsonUtility.ToJson(receipt, true));
            Application.Quit(receipt.passed ? 0 : 3);
        }
    }
}
