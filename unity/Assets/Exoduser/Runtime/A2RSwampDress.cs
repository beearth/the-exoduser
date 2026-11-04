using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(26000)]
    public sealed class A2RSwampDress : MonoBehaviour
    {
        public static readonly bool Requested = Array.IndexOf(Environment.GetCommandLineArgs(), "--a2r-swamp-off") < 0;
        public static A2RSwampDress Active { get; private set; }
        public bool Applied { get; private set; }
        public int ShoreSegments { get; private set; }
        public int VisibleDebris { get; private set; }
        readonly List<Mesh> meshes = new List<Mesh>();
        readonly List<Material> materials = new List<Material>();
        readonly List<Floater> floaters = new List<Floater>();
        readonly Plane[] planes = new Plane[6];
        readonly List<Floater> visible = new List<Floater>();
        GameObject dressing;
        A2RiverReflection surface;
        A2FieldLayout field;
        bool proofStarted;
        float nextSearch;
        sealed class Floater { public Transform transform; public MeshRenderer renderer; public Vector3 position; public float phase, yaw, distance; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Install()
        {
            Shader.SetGlobalFloat("_A2RSwampOn", 0);
            var root = new GameObject("A2R swamp presentation observer");
            DontDestroyOnLoad(root); root.AddComponent<A2RSwampDress>();
        }

        void Update()
        {
            if (surface == null && field != null) Clear();
            if (surface == null && Time.unscaledTime >= nextSearch)
            {
                nextSearch = Time.unscaledTime + .4f;
                var game = NativeGame.Instance;
                if (game == null || NativeRemodel3D.Field == null || !NativeRemodel3D.ForestA2) return;
                foreach (var candidate in FindObjectsByType<A2RiverReflection>(FindObjectsSortMode.None))
                {
                    if (candidate.Surface == null || candidate.Viewer == null || !candidate.Surface.shader.name.Contains("ToxicRiver")) continue;
                    var web = FindFirstObjectByType<A2RWebAssets>();
                    if (web == null || !web.Applied) continue;
                    Clear(); surface = candidate; field = NativeRemodel3D.Field; Active = this;
                    Build(); SetApplied(Requested);
                    Debug.Log("[A2R swamp] ready shore=" + ShoreSegments + " debrisSites=" + floaters.Count + " enabled=" + Applied + " Core/camera unchanged");
                    break;
                }
            }
            if (surface == null) { if (dressing != null) Clear(); return; }
            if (!proofStarted && Array.IndexOf(Environment.GetCommandLineArgs(), "--a2r-swamp-proof") >= 0 && NativeQaSandbox.Active)
            {
                proofStarted = true;
                NativeGame.Instance.StartCoroutine(NativeGame.Instance.A2RSwampDressProof());
            }
        }

        public void SetApplied(bool on)
        {
            Applied = on; Shader.SetGlobalFloat("_A2RSwampOn", on ? 1 : 0);
            if (dressing != null) dressing.SetActive(on);
            if (NativeQaSandbox.Active && surface != null)
                Debug.Log("[A2R swamp] on=" + on + " waterMode=" + surface.Surface.GetFloat("_SwampDressMode") + " fires=" + Shader.GetGlobalInt("_A2RWaterFireCount") + " planar=" + surface.Surface.GetFloat("_PlanarStrength"));
        }

        Material DressMaterial(string name)
        {
            var material = new Material(Resources.Load<Shader>("A2R/ToxicRiver")) { name = name };
            material.SetFloat("_SwampDressMode", 1); material.SetFloat("_SwampZWrite", 0); material.SetFloat("_SwampCull", 0);
            material.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");
            material.renderQueue = 3010; materials.Add(material); return material;
        }

        MeshRenderer MeshObject(string name, Mesh mesh, Material material)
        {
            meshes.Add(mesh);
            var go = new GameObject(name); go.transform.SetParent(dressing.transform, false); go.layer = 4;
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = material;
            renderer.shadowCastingMode = ShadowCastingMode.Off; renderer.receiveShadows = true;
            return renderer;
        }

        internal static Mesh CreateShoreMesh(A2FieldLayout field, float waterHeight, List<A2RSwampDressGeometry.Segment> segments)
        {
            var vertices = new List<Vector3>(); var colours = new List<Color>(); var indices = new List<int>();
            foreach (var s in segments)
            {
                int start = vertices.Count;
                // Continuous 2.0u band (1.24H): 0.8u into water and 1.2u up the bank; feather both ends.
                var offsets = new[] { -.80f, -.40f, 0f, .60f, 1.20f };
                var alphas = new[] { 0f, .72f, .90f, .50f, 0f };
                for (int row = 0; row < offsets.Length; row++) for (int end = 0; end < 2; end++)
                {
                    float ex = end == 0 ? s.ax : s.bx, ez = end == 0 ? s.az : s.bz;
                    var normal = new Vector2(field.TerrainHeight(ex + .03f, ez) - field.TerrainHeight(ex - .03f, ez),
                        field.TerrainHeight(ex, ez + .03f) - field.TerrainHeight(ex, ez - .03f)).normalized;
                    if (normal.sqrMagnitude < .1f) normal = new Vector2(s.nx, s.nz);
                    float x = ex + normal.x * offsets[row];
                    float z = ez + normal.y * offsets[row];
                    float y = Mathf.Max(waterHeight + .008f, field.TerrainHeight(x, z) + .026f);
                    vertices.Add(new Vector3(x, y, z));
                    var colour = Color.Lerp(new Color(.032f, .023f, .019f), new Color(.095f, .072f, .052f), row / 4f);
                    colour.a = alphas[row]; colours.Add(colour);
                    if (row == 4 || end != 0) continue;
                    int i = start + row * 2; indices.AddRange(new[] { i, i + 2, i + 1, i + 1, i + 2, i + 3 });
                }
            }
            var shore = new Mesh { name = "2.0u feathered wet shoreline", indexFormat = IndexFormat.UInt32 };
            shore.SetVertices(vertices); shore.SetColors(colours); shore.SetTriangles(indices, 0); shore.RecalculateBounds(); shore.RecalculateNormals();
            return shore;
        }

        void Build()
        {
            dressing = new GameObject("A2R wet mud and sparse floating remains");
            dressing.transform.SetParent(surface.transform, true);
            // Existing water-domain threshold, sampled at 0.4u. This never writes the field or water mask.
            var segments = A2RSwampDressGeometry.Contours(field.TerrainHeight, .4f, -79.6f, 79.6f, -.4f, .4f, -.46f);
            ShoreSegments = segments.Count;
            var shore = CreateShoreMesh(field, surface.Height, segments);
            MeshObject(shore.name, shore, DressMaterial("A2R wet black-brown mud"));
            var remains = DressMaterial("A2R waterlogged flesh and bone");
            for (int z = 0; z < 36; z++) for (int x = 0; x < 36; x++)
            {
                float wx = 1.5f + x * 2.2f + Mathf.Sin(z * 1.7f + x * .5f) * .4f;
                float wz = -1.5f - z * 2.2f + Mathf.Sin(x * 1.9f - z * .8f) * .4f;
                if (!A2RSwampDressGeometry.SafeDebris(wx, wz,
                    (a, b) => field.TerrainHeight(a, b) < -.50f,
                    (a, b) => field.Distance(a, b) < -.5f && !NativeGame.Instance.Map.CanMove(a * 100, -b * 100, 100))) continue;
                int id = floaters.Count; bool bone = id % 3 == 0;
                var mesh = RemainsMesh(bone, id);
                var renderer = MeshObject(bone ? "Waterlogged bone fragment" : "Floating torn flesh membrane", mesh, remains);
                var pos = new Vector3(wx, surface.Height + .018f, wz);
                renderer.transform.position = pos;
                floaters.Add(new Floater { renderer = renderer, transform = renderer.transform, position = pos, phase = id * 2.399963f, yaw = id * 137.5f });
                renderer.enabled = false;
            }
        }

        static Mesh RemainsMesh(bool bone, int id)
        {
            if (bone) return RibMesh();
            // Broad connected silhouettes, not tiny particles. One mesh with a raised centre/fold.
            var mesh = new Mesh { name = bone ? "Submerged broken rib" : "Waterlogged folded tissue" };
            float length = bone ? .64f : .72f, width = bone ? .12f : .34f;
            var v = new List<Vector3> { new Vector3(.04f, .09f, 0) };
            var c = new List<Color> { bone ? new Color(.16f, .13f, .095f) : new Color(.095f, .026f, .025f) };
            var tri = new List<int>();
            for (int i = 0; i < 12; i++)
            {
                float a = i * Mathf.PI / 6, lobe = 1 + .16f * Mathf.Sin(a * 3 + id);
                v.Add(new Vector3(Mathf.Cos(a) * length * .5f, 0, Mathf.Sin(a) * width * .5f * lobe));
                c.Add(bone ? new Color(.09f, .078f, .055f) : new Color(.045f, .022f, .019f));
                tri.AddRange(new[] { 0, i + 1, (i + 1) % 12 + 1 });
            }
            mesh.SetVertices(v); mesh.SetColors(c); mesh.SetTriangles(tri, 0); mesh.RecalculateNormals(); mesh.RecalculateBounds(); return mesh;
        }

        static Mesh RibMesh()
        {
            var vertices = new List<Vector3>(); var colours = new List<Color>(); var triangles = new List<int>();
            for (int ring = 0; ring <= 6; ring++)
            {
                float t = ring / 6f, radius = Mathf.Lerp(.07f, .05f, t);
                for (int side = 0; side < 8; side++)
                {
                    float a = side * Mathf.PI / 4;
                    vertices.Add(new Vector3((t - .5f) * .72f, .045f * Mathf.Sin(t * Mathf.PI) + radius * Mathf.Sin(a), .05f * Mathf.Sin(t * Mathf.PI) + radius * Mathf.Cos(a)));
                    colours.Add(Color.Lerp(new Color(.09f, .075f, .055f), new Color(.16f, .13f, .095f), Mathf.Clamp01(Mathf.Sin(a))));
                    if (ring == 6) continue;
                    int i = ring * 8 + side, n = ring * 8 + (side + 1) % 8;
                    triangles.AddRange(new[] { i, n, i + 8, n, n + 8, i + 8 });
                }
            }
            var mesh = new Mesh { name = "Waterlogged curved rib with submerged underside" };
            mesh.SetVertices(vertices); mesh.SetColors(colours); mesh.SetTriangles(triangles, 0); mesh.RecalculateNormals(); mesh.RecalculateBounds(); return mesh;
        }

        void LateUpdate()
        {
            if (!Applied || surface == null || dressing == null || surface.Viewer == null) return;
            var camera = surface.Viewer; GeometryUtility.CalculateFrustumPlanes(camera, planes); visible.Clear();
            foreach (var f in floaters)
            {
                f.renderer.enabled = false;
                if (!GeometryUtility.TestPlanesAABB(planes, f.renderer.bounds)) continue;
                // Reject HUD-covered and clipped edges before applying the six-per-screen cap.
                Vector3 viewport = camera.WorldToViewportPoint(f.position);
                if (viewport.z <= 0 || viewport.x < .04f || viewport.x > .96f || viewport.y < .20f || viewport.y > .92f) continue;
                Vector3 a = camera.WorldToScreenPoint(f.position), b = camera.WorldToScreenPoint(f.position + camera.transform.right * .65f);
                if (a.z <= 0 || Vector2.Distance(a, b) < 8) continue;
                f.distance = (camera.transform.position - f.position).sqrMagnitude; visible.Add(f);
            }
            visible.Sort((a, b) => a.distance.CompareTo(b.distance)); VisibleDebris = Mathf.Min(6, visible.Count);
            for (int i = 0; i < VisibleDebris; i++)
            {
                var f = visible[i]; f.renderer.enabled = true;
                f.transform.position = f.position + Vector3.up * (Mathf.Sin(Time.time * .61f + f.phase) * .006f);
                f.transform.rotation = Quaternion.Euler(Mathf.Sin(Time.time * .47f + f.phase) * 1.2f, f.yaw + Mathf.Sin(Time.time * .23f + f.phase) * 3, 0);
            }
        }

        void Clear()
        {
            if (dressing != null) Destroy(dressing);
            foreach (var mesh in meshes) if (mesh != null) Destroy(mesh);
            foreach (var material in materials) if (material != null) Destroy(material);
            meshes.Clear(); materials.Clear(); floaters.Clear(); surface = null; field = null; dressing = null;
            Shader.SetGlobalFloat("_A2RSwampOn", 0); Applied = false;
        }
        void OnDestroy() { Clear(); if (Active == this) Active = null; }

#if UNITY_EDITOR
        public static int VerifyAndBuild()
        {
            A2RSwampDressEditor.VerifyAndBake();
            foreach (var path in new[] { "A2R/ToxicRiver", "Shaders/A2ToxicRiver" })
            {
                var shader = Resources.Load<Shader>(path);
                if (shader == null || UnityEditor.ShaderUtil.ShaderHasError(shader)) throw new InvalidOperationException("Swamp shader import failed: " + path);
                var material = new Material(shader);
                try
                {
                    material.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");
                    if (!material.HasProperty("_SwampDressMode") || !material.IsKeywordEnabled("_SPECULARHIGHLIGHTS_OFF"))
                        throw new InvalidOperationException("Swamp material contract failed: " + path);
                }
                finally { DestroyImmediate(material); }
            }
            var type = Type.GetType("Exoduser.A2RBuilder, Exoduser.Editor");
            if (type == null) throw new InvalidOperationException("A2R build entry missing");
            Debug.Log("A2R_SWAMP_COMPILE_PASS shader import x2 / reflection OFF keyword preserved / Core unchanged");
            return (int)type.GetMethod("Build").Invoke(null, null);
        }
#endif
    }
}
