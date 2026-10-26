using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D M1 preparation: the import path for external 3D kit assets (Meshy image-to-3D results) that works without any meshes present.
    //  - manifest: Resources/Data/map3d_assets.json (schema exoduser.unity.map3d-assets.v1). Empty by default. `--unity-world3d-assets=<file>` loads another
    //    manifest instead (tests, stand-ins) without touching the tracked one.
    //  - an entry without complete provenance is REJECTED at load (never instantiated); a slot pointing at a missing/rejected asset falls back to the
    //    procedural OBJ of the slice (mass_01..04, root_01..03), so an empty or broken manifest changes nothing on screen.
    //  - sizing is unit-agnostic: the model's own bounds are normalised to the manifest target (1 unit = 1 px), pivot = bottom centre. Meshy documents no axis or
    //    unit convention for FBX/OBJ, so nothing is assumed about the file scale.
    //  - LOD: a LODGroup per instance (LOD0 + optional LOD1/LOD2 from the manifest); a single LOD still gets a LODGroup (culled below 1% of screen height).
    // Placement, rotation rule and collision stay exactly as the slice (the 2D simulation owns collision; nothing here creates a collider).
    public sealed partial class NativePerspectiveWorld
    {
        public const string AssetManifestResource = "Data/map3d_assets", AssetManifestArgument = "--unity-world3d-assets=";
        public const string AssetManifestSchema = "exoduser.unity.map3d-assets.v1";
        // LODGroup switch heights (fraction of the screen height covered by the object's bounds): LOD1 starts below 12%, LOD2 below 5%, culled below 1%.
        // The slice masses are 150-400 px tall on a 1080 px view (14-37%), so LOD0 holds in the START view. A manifest `lods[i].screenHeight` (> 0)
        // overrides the height below which that LOD starts.
        public static readonly float[] AssetLodScreenHeights = { 0.12f, 0.05f };
        public const float AssetCullScreenHeight = 0.01f, AssetDefaultBlendHeightRatio = 0.2f;
        static readonly string[] AssetTags = { "mass", "root", "prop", "landmark" };
        static readonly string[] AssetFormats = { "obj", "fbx" };

        [Serializable] public sealed class Map3DProvenance { public string source, taskId, prompt, model, credits, date, approvedBy; }
        [Serializable] public sealed class Map3DLod { public string model; public float screenHeight; }
        [Serializable] public sealed class Map3DAssetEntry
        {
            public string id, tag, format, model;       // required; format = obj | fbx (decides the default yaw offset)
            public Map3DLod[] lods;                     // optional LOD1, LOD2 (LOD0 = model)
            public float targetHeightPx, targetWidthPx; // required: one of them (> 0); uniform scale, height wins when both are set
            public string pivot;                        // "bottom-center" (default) | "none"
            public bool hasYawOffset; public float yawOffsetDegrees; // default by format: obj 180 (validated, OBJ import mirrors X), fbx 0 (verify at the first real import)
            public float groundBlendHeightPx;           // 0 -> 20% of the target height
            public bool noShadow;
            public string baseColor, normal, roughness, metallic, ao; // optional Resources paths of the PBR maps (Meshy texture_urls)
            public Map3DProvenance provenance;          // required, see Validate
        }
        [Serializable] public sealed class Map3DSlotEntry { public string slot, assetId; }
        [Serializable] public sealed class Map3DAssetManifest { public string schema; public Map3DAssetEntry[] assets; public Map3DSlotEntry[] slots; }

        public sealed class Map3DAsset
        {
            public Map3DAssetEntry entry; public Mesh[] lodMeshes; public Material material;
            public float normalizeScale; public Vector3 pivotOffset; public float yawOffset;
        }

        readonly Dictionary<string, Map3DAsset> assetsById = new Dictionary<string, Map3DAsset>();
        readonly Dictionary<string, string> assetSlots = new Dictionary<string, string>();
        public readonly List<string> AssetRejections = new List<string>();
        public string AssetManifestSource { get; private set; }
        public int AssetsLoaded { get { return assetsById.Count; } }
        public int AssetInstances { get; private set; }
        bool assetsLoadedOnce;

        // Provenance gate: an asset with an empty provenance field is not loaded. Meshy assets need the full task record.
        public static string ValidateAssetEntry(Map3DAssetEntry e)
        {
            if (e == null) return "null entry";
            if (string.IsNullOrWhiteSpace(e.id)) return "id missing";
            if (Array.IndexOf(AssetTags, e.tag) < 0) return "tag must be one of " + string.Join("/", AssetTags);
            if (Array.IndexOf(AssetFormats, e.format) < 0) return "format must be obj or fbx";
            if (string.IsNullOrWhiteSpace(e.model)) return "model path missing";
            if (!(e.targetHeightPx > 0f || e.targetWidthPx > 0f)) return "targetHeightPx or targetWidthPx must be > 0";
            if (e.pivot != null && e.pivot.Length > 0 && e.pivot != "bottom-center" && e.pivot != "none") return "pivot must be bottom-center or none";
            var p = e.provenance;
            if (p == null) return "provenance missing";
            if (string.IsNullOrWhiteSpace(p.source)) return "provenance.source empty";
            if (string.IsNullOrWhiteSpace(p.date)) return "provenance.date empty";
            if (string.IsNullOrWhiteSpace(p.approvedBy)) return "provenance.approvedBy empty";
            if (p.source.StartsWith("meshy", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(p.taskId)) return "provenance.taskId empty (meshy)";
                if (string.IsNullOrWhiteSpace(p.prompt)) return "provenance.prompt empty (meshy)";
                if (string.IsNullOrWhiteSpace(p.model)) return "provenance.model empty (meshy)";
                if (string.IsNullOrWhiteSpace(p.credits)) return "provenance.credits empty (meshy)";
            }
            return null;
        }

        static string AssetManifestOverridePath()
        {
            foreach (var a in Environment.GetCommandLineArgs()) if (a.StartsWith(AssetManifestArgument)) return a.Substring(AssetManifestArgument.Length);
            return null;
        }

        // Loads and validates the manifest once. Never throws: problems are recorded in AssetRejections and the slots fall back to the procedural OBJ.
        public void LoadAssetManifest()
        {
            if (assetsLoadedOnce) return;
            assetsLoadedOnce = true;
            string json = null, overridePath = AssetManifestOverridePath();
            try
            {
                if (!string.IsNullOrEmpty(overridePath)) { json = File.ReadAllText(overridePath); AssetManifestSource = overridePath; }
                else { var text = Resources.Load<TextAsset>(AssetManifestResource); json = text != null ? text.text : null; AssetManifestSource = "Resources/" + AssetManifestResource; }
            }
            catch (Exception e) { AssetRejections.Add("manifest unreadable: " + e.Message); return; }
            if (string.IsNullOrEmpty(json)) { AssetRejections.Add("manifest missing"); return; }
            Map3DAssetManifest manifest;
            try { manifest = JsonUtility.FromJson<Map3DAssetManifest>(json); } catch (Exception e) { AssetRejections.Add("manifest invalid json: " + e.Message); return; }
            if (manifest == null || manifest.schema != AssetManifestSchema) { AssetRejections.Add("manifest schema must be " + AssetManifestSchema); return; }
            if (manifest.assets != null)
                foreach (var entry in manifest.assets)
                {
                    string problem = ValidateAssetEntry(entry);
                    if (problem == null && assetsById.ContainsKey(entry.id)) problem = "duplicate id";
                    Map3DAsset asset = null;
                    if (problem == null) problem = TryBuildAsset(entry, out asset);
                    if (problem != null) { AssetRejections.Add((entry != null && !string.IsNullOrEmpty(entry.id) ? entry.id : "<no id>") + ": " + problem); continue; }
                    assetsById.Add(entry.id, asset);
                }
            if (manifest.slots != null)
                foreach (var s in manifest.slots)
                {
                    if (s == null || string.IsNullOrEmpty(s.slot) || string.IsNullOrEmpty(s.assetId)) { AssetRejections.Add("slot entry incomplete"); continue; }
                    if (!assetsById.ContainsKey(s.assetId)) { AssetRejections.Add("slot " + s.slot + ": asset " + s.assetId + " not loaded (fallback to procedural OBJ)"); continue; }
                    assetSlots[s.slot] = s.assetId;
                }
        }

        string TryBuildAsset(Map3DAssetEntry entry, out Map3DAsset asset)
        {
            asset = null;
            var lodNames = new List<string> { entry.model };
            if (entry.lods != null) foreach (var l in entry.lods) { if (l == null || string.IsNullOrEmpty(l.model)) return "LOD entry without model"; lodNames.Add(l.model); }
            if (lodNames.Count > AssetLodScreenHeights.Length + 1) return "at most LOD0..LOD" + AssetLodScreenHeights.Length;
            var meshes = new Mesh[lodNames.Count];
            for (int i = 0; i < lodNames.Count; i++)
            {
                var model = Resources.Load<GameObject>(lodNames[i]);
                if (model == null) return "model not found in Resources: " + lodNames[i];
                var filter = model.GetComponentInChildren<MeshFilter>();
                if (filter == null || filter.sharedMesh == null) return "model has no mesh: " + lodNames[i];
                meshes[i] = filter.sharedMesh;
            }
            var bounds = meshes[0].bounds;
            float scale = entry.targetHeightPx > 0f ? entry.targetHeightPx / Mathf.Max(bounds.size.y, 1e-4f) : entry.targetWidthPx / Mathf.Max(Mathf.Max(bounds.size.x, bounds.size.z), 1e-4f);
            var shader = Resources.Load<Shader>("Shaders/Look3DProp");
            if (shader == null) return "Look3DProp shader missing";
            var material = new Material(shader) { name = "Look3DProp " + entry.id };
            Action<string, string> tex = (prop, path) =>
            {
                if (string.IsNullOrEmpty(path)) return;
                var t = Resources.Load<Texture2D>(path); if (t == null) throw new InvalidOperationException("texture not found: " + path);
                t.wrapMode = TextureWrapMode.Repeat; t.filterMode = FilterMode.Trilinear; t.anisoLevel = 4; material.SetTexture(prop, t);
            };
            try { tex("_BaseMap", entry.baseColor); tex("_NormalMap", entry.normal); tex("_RoughMap", entry.roughness); tex("_MetalMap", entry.metallic); tex("_AoMap", entry.ao); }
            catch (Exception e) { return e.Message; }
            float height = bounds.size.y * scale;
            material.SetFloat("_BlendHeight", entry.groundBlendHeightPx > 0f ? entry.groundBlendHeightPx : height * AssetDefaultBlendHeightRatio);
            material.SetFloat("_HasNormal", string.IsNullOrEmpty(entry.normal) ? 0f : 1f);
            Vector3 pivot = entry.pivot == "none" ? Vector3.zero : new Vector3(-bounds.center.x, -bounds.min.y, -bounds.center.z);
            asset = new Map3DAsset { entry = entry, lodMeshes = meshes, material = material, normalizeScale = scale, pivotOffset = pivot, yawOffset = entry.hasYawOffset ? entry.yawOffsetDegrees : (entry.format == "obj" ? 180f : 0f) };
            return null;
        }

        public bool TryResolveSlot(string slot, out Map3DAsset asset)
        {
            LoadAssetManifest();
            asset = null; string id;
            return assetSlots.TryGetValue(slot, out id) && assetsById.TryGetValue(id, out asset);
        }

        // One instance at a slice placement: root (position, yaw, uniform scale), one child per LOD (pivot offset applied), LODGroup on the root.
        GameObject BuildAssetInstance(Map3DAsset asset, SlicePlacement p, Transform parent)
        {
            var root = new GameObject("slice asset " + asset.entry.id); root.transform.SetParent(parent, false);
            root.transform.position = Unity(p.x, 0f, p.y); root.transform.rotation = Quaternion.Euler(0f, p.angleDegrees + asset.yawOffset, 0f); root.transform.localScale = Vector3.one * p.scale;
            var lods = new LOD[asset.lodMeshes.Length];
            for (int i = 0; i < lods.Length; i++)
            {
                var child = new GameObject("LOD" + i); child.transform.SetParent(root.transform, false); child.transform.localPosition = asset.pivotOffset;
                child.AddComponent<MeshFilter>().sharedMesh = asset.lodMeshes[i];
                var renderer = child.AddComponent<MeshRenderer>(); renderer.sharedMaterial = asset.material; renderer.receiveShadows = true;
                renderer.shadowCastingMode = asset.entry.noShadow ? UnityEngine.Rendering.ShadowCastingMode.Off : UnityEngine.Rendering.ShadowCastingMode.TwoSided;
                // Unity's LOD i threshold = the height below which LOD i is left: for i < n-1 the start height of LOD i+1, for the last LOD the cull height
                float threshold = i + 1 < lods.Length ? ((asset.entry.lods != null && asset.entry.lods[i].screenHeight > 0f) ? asset.entry.lods[i].screenHeight : AssetLodScreenHeights[i]) : AssetCullScreenHeight;
                lods[i] = new LOD(threshold, new Renderer[] { renderer });
            }
            var group = root.AddComponent<LODGroup>(); group.SetLODs(lods); group.RecalculateBounds();
            AssetInstances++;
            return root;
        }
    }
}
