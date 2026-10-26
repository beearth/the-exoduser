using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D stage 1: Unity port of Godot native_perspective_view.gd (origin/main godot/scripts/native_perspective_view.gd)
    // lit with the LOOK-001 D baseline key/fill/ambient constants (godot/scripts/look001/look_3d_variant.gd).
    // Simulation coordinates stay 2D pixels (+Y down). Built-in pipeline only; shadows/fog/glow/grade are later stages.
    //
    // Coordinate contract: 1 unit = 1 px. Godot: X=px_x, Z=px_y (south = +Z), camera at +Z looking toward -Z, RH.
    // Unity is left-handed, so the world is reflected in Z only: Unity (x, height, -px_y). A reflection of every position
    // combined with Unity's left-handed camera reproduces the Godot image exactly (north up, east right, nothing mirrored).
    public sealed partial class NativePerspectiveWorld : MonoBehaviour
    {
        // native_perspective_view.gd:26 DEFAULTS, :164 far 16000
        public const float Yaw = 0f, Pitch = 0.85f, Distance = 1400f, Zoom = 1f, Near = 32f, Far = 16000f;
        // native_perspective_view.gd:186 soil plane y=-2 (clamp footprint plane), :356 baked chunks y=-1.5
        public const float GroundPlaneY = -2f, ChunkY = -1.5f;
        // look_3d_variant.gd:8-15
        public static readonly Vector3 KeySource = new Vector3(-900f, 1500f, -1100f);
        public static readonly Vector3 FillSource = new Vector3(700f, 950f, 1100f);
        public static readonly Color KeyColor = new Color(0.86f, 0.80f, 0.69f), FillColor = new Color(0.40f, 0.44f, 0.48f), AmbientColor = new Color(0.45f, 0.43f, 0.40f);
        public const float KeyEnergy = 1.05f, FillEnergy = 0.48f, AmbientEnergy = 0.68f;
        // look_3d_variant.gd:95
        public static readonly Color BackgroundColor = new Color(0.025f, 0.028f, 0.029f);

        public const string FlagArgument = "--unity-world-3d";
        public static bool WantsWorld3D { get { return Array.IndexOf(Environment.GetCommandLineArgs(), FlagArgument) >= 0; } }

        public MapData Map { get; private set; }
        public Camera WorldCamera { get; private set; }
        public NativePerspectiveWorldPost Post { get; private set; }
        public Vector2 Focus { get; private set; }
        public Vector2 AppliedFocus { get; private set; }
        public bool ClampApplied { get; private set; }
        public int LoadedChunkCount { get { return chunks.Count; } }
        public int MassCount { get { return massObjects.Count; } }
        public int PropCount { get { return propObjects.Count; } }

        Material litMaterial;
        Transform root, chunkRoot, propRoot, massRoot, actorRoot;
        Light keyLight, fillLight;
        readonly Rect groundBounds = new Rect(0, 0, 8000, 8000); // soil plane extent, native_perspective_view.gd:118-120 (200x200 tiles x 40px)

        // Godot: native_perspective_view.gd:162 position = target + (sin(yaw)cos(pitch), sin(pitch), cos(yaw)cos(pitch))*distance
        public static Vector3 Unity(float px, float height, float py) { return new Vector3(px, height, -py); }

        public static Vector3 LinearDirection(Vector3 source)
        {
            var d = source.normalized; return new Vector3(d.x, d.y, -d.z); // direction towards the light, Unity space
        }

        public void Initialize(MapData map)
        {
            Map = map;
            var shader = Resources.Load<Shader>("Shaders/Look3DLit");
            if (shader == null) throw new InvalidOperationException("Look3DLit shader is missing");
            litMaterial = new Material(shader) { name = "Look3DLit(shared)" };
            litMaterial.SetFloat("_Cutoff", 0.1f);
            root = new GameObject("NativePerspectiveWorld Root").transform; root.SetParent(transform, false);
            chunkRoot = Child("Ground chunks"); propRoot = Child("Props"); massRoot = Child("Masses"); actorRoot = Child("Actors");
            var cameraObject = new GameObject("NativePerspectiveWorld Camera"); cameraObject.transform.SetParent(root, false);
            WorldCamera = cameraObject.AddComponent<Camera>();
            WorldCamera.clearFlags = CameraClearFlags.SolidColor; WorldCamera.backgroundColor = BackgroundColor;
            WorldCamera.orthographic = false; WorldCamera.nearClipPlane = Near; WorldCamera.farClipPlane = Far;
            WorldCamera.allowHDR = false; WorldCamera.allowMSAA = false; WorldCamera.depth = 10; WorldCamera.enabled = false;
            Post = cameraObject.AddComponent<NativePerspectiveWorldPost>();
            ApplyLighting();
            InitializeOverlay();
            BuildProps();
            BuildMasses();
            BuildPlayerBlob();
            Focus = AppliedFocus = new Vector2(map.startX, map.startY);
            ApplyOverlayArgument();
        }

        Transform Child(string name) { var t = new GameObject(name).transform; t.SetParent(root, false); return t; }

        public void SetCameraEnabled(bool on) { if (WorldCamera != null) WorldCamera.enabled = on; }
        // Simulation px position the camera follows (player). The camera is placed in LateUpdate.
        public void SetFocus(Vector2 px) { Focus = px; }

        // look_3d_variant.gd:8-15 constants. Colours become linear (Godot converts light/ambient colours from sRGB); energy
        // already includes Godot's x PI which cancels the Lambert 1/PI. The key Directional Light is the real Unity main light
        // (stage 2: soft shadow, look_3d_variant.gd:139-159); fill stays a Directional Light without effect on this shader.
        // Empirical calibration (stage 2): the Godot D capture is brighter than the same constants evaluated by the Lambert model
        // (per-pixel inversion of D through the modelled fog + brightness/contrast/saturation, regression over ground/billboard regions:
        // ambient x1.44, key x1.525, fill ~x1; residual rms 3.2/255). The cause inside Godot is not identified. Documented in
        // UNITY_MAP3D_S2_20261026.md; SetCalibration(false) restores the plain constants.
        public const float AmbientCalibration = 1.44f, KeyCalibration = 1.525f;
        public bool Calibrated { get; private set; }

        void ApplyLighting()
        {
            keyLight = MakeLight("NorthWestBoneKey", KeySource, KeyColor, KeyEnergy, true);
            fillLight = MakeLight("SoftIronFill", FillSource, FillColor, FillEnergy, false);
            SetCalibration(true);
            BuildStage2Lighting();
        }

        public void SetCalibration(bool on)
        {
            Calibrated = on;
            Shader.SetGlobalVector("_L3D_KeyDir", LinearDirection(KeySource));
            Shader.SetGlobalVector("_L3D_FillDir", LinearDirection(FillSource));
            Shader.SetGlobalVector("_L3D_KeyCol", Premultiplied(KeyColor, KeyEnergy * (on ? KeyCalibration : 1f)));
            Shader.SetGlobalVector("_L3D_FillCol", Premultiplied(FillColor, FillEnergy));
            Shader.SetGlobalVector("_L3D_Ambient", Premultiplied(AmbientColor, AmbientEnergy * (on ? AmbientCalibration : 1f)));
        }

        Light MakeLight(string name, Vector3 source, Color color, float energy, bool shadows)
        {
            var go = new GameObject(name); go.transform.SetParent(root, false);
            var light = go.AddComponent<Light>(); light.type = LightType.Directional; light.color = color; light.intensity = energy;
            light.shadows = shadows ? LightShadows.Soft : LightShadows.None;
            if (shadows) { light.shadowStrength = ShadowStrength; light.shadowBias = ShadowBias; light.shadowNormalBias = ShadowNormalBias; }
            else light.cullingMask = 0; // fill is evaluated by the shader constants only
            var toLight = LinearDirection(source);
            go.transform.rotation = Quaternion.LookRotation(-toLight, Vector3.up); // light travels from the source towards the origin
            return light;
        }

        static Vector4 Premultiplied(Color srgb, float energy)
        {
            var c = srgb.linear; return new Vector4(c.r * energy, c.g * energy, c.b * energy, 1f);
        }

        // ---- camera: native_perspective_view.gd:153-179 _sync_camera ----
        public void SyncCamera(Vector2 center)
        {
            Focus = center;
            PlaceCamera(center);
            ClampApplied = false; AppliedFocus = center;
            Rect before; if (!GroundFootprint(out before) || groundBounds.width <= 0 || groundBounds.height <= 0) return;
            // R36376-36379 CAM-CLAMP: keep the actual perspective footprint inside the soil plane.
            Vector2 low = groundBounds.min - (before.min - center), high = groundBounds.max - (before.max - center);
            var admitted = new Vector2(
                low.x <= high.x ? Mathf.Clamp(center.x, low.x, high.x) : (groundBounds.center.x - (before.center.x - center.x)),
                low.y <= high.y ? Mathf.Clamp(center.y, low.y, high.y) : (groundBounds.center.y - (before.center.y - center.y)));
            if (!Mathf.Approximately(admitted.x, center.x) || !Mathf.Approximately(admitted.y, center.y))
            {
                PlaceCamera(admitted); ClampApplied = true; AppliedFocus = admitted;
            }
        }

        void PlaceCamera(Vector2 center)
        {
            float height = WorldCamera.targetTexture != null ? WorldCamera.targetTexture.height : Screen.height;
            if (height <= 0) height = 1080f;
            var target = Unity(center.x, 0f, center.y);
            float sy = Mathf.Sin(Yaw), cy = Mathf.Cos(Yaw), sp = Mathf.Sin(Pitch), cp = Mathf.Cos(Pitch);
            // Godot offset (sin yaw cos pitch, sin pitch, cos yaw cos pitch)*distance; Z reflected.
            var offset = new Vector3(sy * cp, sp, -(cy * cp)) * Distance;
            WorldCamera.transform.position = target + offset;
            WorldCamera.transform.rotation = Quaternion.LookRotation(target - WorldCamera.transform.position, Vector3.up);
            WorldCamera.nearClipPlane = Near; WorldCamera.farClipPlane = Far;
            WorldCamera.fieldOfView = 2f * Mathf.Atan(height / (2f * Distance * Zoom)) * Mathf.Rad2Deg; // native_perspective_view.gd:164
        }

        // _camera_ground_footprint (native_perspective_view.gd:181-200): four corner rays against the y=-2 plane, in Godot px (x, px_y).
        bool GroundFootprint(out Rect footprint)
        {
            footprint = new Rect();
            var min = new Vector2(float.PositiveInfinity, float.PositiveInfinity); var max = new Vector2(float.NegativeInfinity, float.NegativeInfinity);
            var corners = new[] { new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(0, 0) };
            foreach (var c in corners)
            {
                var ray = WorldCamera.ViewportPointToRay(new Vector3(c.x, c.y, 0));
                if (Mathf.Abs(ray.direction.y) < 1e-6f) return false;
                float t = (GroundPlaneY - ray.origin.y) / ray.direction.y;
                if (t <= 0f || float.IsInfinity(t) || float.IsNaN(t)) return false;
                var p = ray.origin + ray.direction * t;
                var g = new Vector2(p.x, -p.z);
                min = Vector2.Min(min, g); max = Vector2.Max(max, g);
            }
            footprint = new Rect(min.x, min.y, max.x - min.x, max.y - min.y);
            return true;
        }

        public bool VisibleFootprint(out Rect footprint) { return GroundFootprint(out footprint); }

        // Aim: camera ray against the ground plane y=0 -> simulation px (Godot screen_to_world, native_perspective_view.gd:416-424). `mouse` uses Unity's
        // bottom-left origin (Input.mousePosition). Returns false when there is no valid hit (Godot: aim becomes zero -> the player keeps its facing, player.gd:154-158).
        public bool ScreenToGroundPx(Vector2 mouse, out Vector2 px)
        {
            float w = WorldCamera.targetTexture != null ? WorldCamera.targetTexture.width : Screen.width, h = WorldCamera.targetTexture != null ? WorldCamera.targetTexture.height : Screen.height;
            return ScreenToGroundPxTopLeft(new Vector2(mouse.x, h - mouse.y), w, h, out px);
        }

        public bool ScreenToGroundPxTopLeft(Vector2 screen, float width, float height, out Vector2 px)
        {
            double x, y; bool hit = Exoduser.UnityPort.Core.NativePerspectiveWorldMath.ScreenToGround(AppliedFocus.x, AppliedFocus.y, screen.x, screen.y, width, height, 0.0, out x, out y);
            px = new Vector2((float)x, (float)y); return hit;
        }

        // ---- ground: baked environment chunks as flat quads at y=-1.5 (native_perspective_view.gd:353-358, :260) ----
        sealed class ChunkEntry { public GameObject go; public Texture2D texture; }
        readonly Dictionary<int, ChunkEntry> chunks = new Dictionary<int, ChunkEntry>();

        void StreamChunks()
        {
            Rect footprint; if (!GroundFootprint(out footprint)) return;
            var wanted = new Rect(footprint.x - 1000, footprint.y - 1000, footprint.width + 2000, footprint.height + 2000);
            var keep = new HashSet<int>();
            for (int i = 0; i < Map.chunks.Length; i++)
            {
                var c = Map.chunks[i];
                if (!wanted.Overlaps(new Rect(c.x, c.y, c.width, c.height))) continue;
                keep.Add(i);
                if (chunks.ContainsKey(i)) continue;
                var texture = Resources.Load<Texture2D>(c.texture);
                if (texture == null) throw new InvalidOperationException("Missing original chunk " + c.texture);
                var go = new GameObject("Ground " + i); go.transform.SetParent(chunkRoot, false);
                float u0 = (float)c.sx / texture.width, u1 = (float)(c.sx + c.sw) / texture.width;
                float v1 = 1f - (float)c.sy / texture.height, v0 = 1f - (float)(c.sy + c.sh) / texture.height;
                var mesh = FlatQuad(c.x, c.y, c.width, c.height, ChunkY, u0, v0, u1, v1);
                go.AddComponent<MeshFilter>().sharedMesh = mesh;
                var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = litMaterial;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = true; // ground receives the key shadow, never casts
                var block = new MaterialPropertyBlock(); block.SetTexture("_MainTex", texture); block.SetColor("_Color", Color.white); block.SetFloat("_Cutoff", 0f);
                renderer.SetPropertyBlock(block);
                chunks.Add(i, new ChunkEntry { go = go, texture = texture });
                EnsureOverlay(i);
            }
            List<int> remove = null;
            foreach (var pair in chunks) if (!keep.Contains(pair.Key)) { if (remove == null) remove = new List<int>(); remove.Add(pair.Key); }
            if (remove != null) foreach (int id in remove)
            {
                var entry = chunks[id]; ReleaseOverlay(id); Dispose(entry.go.GetComponent<MeshFilter>().sharedMesh); Dispose(entry.go); chunks.Remove(id); pendingUnload.Add(entry.texture);
            }
        }

        // Axis-aligned flat quad on the ground plane. (x, y) = top-left px, w/h px; image top = north (small px_y).
        public static Mesh FlatQuad(float x, float y, float w, float h, float height, float u0, float v0, float u1, float v1)
        {
            var mesh = new Mesh { name = "FlatQuad" };
            mesh.vertices = new[] { Unity(x, height, y), Unity(x + w, height, y), Unity(x + w, height, y + h), Unity(x, height, y + h) };
            mesh.uv = new[] { new Vector2(u0, v1), new Vector2(u1, v1), new Vector2(u1, v0), new Vector2(u0, v0) };
            mesh.normals = new[] { Vector3.up, Vector3.up, Vector3.up, Vector3.up };
            mesh.triangles = new[] { 0, 1, 2, 0, 2, 3 };
            mesh.bounds = new Bounds(Unity(x + w * 0.5f, height, y + h * 0.5f), new Vector3(w, 2f, h));
            return mesh;
        }

        // Texture unloads are deferred by one frame: a chunk that streams out and back in within the same frame must not lose the texture a
        // pending-destroy renderer still points at (seen as a black ground block when Prime() jumped between foci inside one frame).
        readonly List<Texture2D> pendingUnload = new List<Texture2D>();
        public void FlushUnloads()
        {
            for (int i = 0; i < pendingUnload.Count; i++)
            {
                var t = pendingUnload[i]; if (t == null) continue;
                bool inUse = false; foreach (var e in chunks.Values) if (e.texture == t) { inUse = true; break; }
                if (!inUse) Resources.UnloadAsset(t);
            }
            pendingUnload.Clear();
        }

        // Destroy() is a no-op in edit mode (Editor batch renders); DestroyImmediate there.
        static void Dispose(UnityEngine.Object o) { if (o == null) return; if (Application.isPlaying) Destroy(o); else DestroyImmediate(o); }

        int streamCell = int.MinValue;
        void LateUpdate()
        {
            if (WorldCamera == null || !WorldCamera.enabled) return;
            FlushUnloads();
            SyncCamera(Focus);
            FaceCamera();
            UpdateFieldLights();
            int cell = Mathf.FloorToInt(AppliedFocus.x / 40f) * 10007 + Mathf.FloorToInt(AppliedFocus.y / 40f);
            if (cell != streamCell) { streamCell = cell; StreamChunks(); }
        }

        // One-shot synchronisation used by the capture and by callers that drive the world explicitly.
        public void Prime(Vector2 focus)
        {
            Focus = focus; SyncCamera(focus); FaceCamera(); UpdateFieldLights(); StreamChunks();
        }

        public static Texture2D LoadBilinear(string resource)
        {
            var t = Resources.Load<Texture2D>(resource);
            if (t == null) throw new InvalidOperationException("Missing original texture " + resource);
            // Godot Sprite3D uses TEXTURE_FILTER_LINEAR for ordinary source art (native_perspective_view.gd:252). The asset's runtime
            // filter mode is switched in memory only (importer settings are untouched); 2D mode never loads these in the same process.
            t.filterMode = FilterMode.Bilinear;
            return t;
        }

        void OnDestroy()
        {
            foreach (var pair in chunks) { if (pair.Value.go != null) Destroy(pair.Value.go); }
            chunks.Clear();
            if (litMaterial != null) Destroy(litMaterial);
        }
    }
}
