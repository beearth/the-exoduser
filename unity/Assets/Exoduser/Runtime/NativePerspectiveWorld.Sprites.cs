using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Sprite projection, Godot native_perspective_view.gd:233-300 _sync_sprite.
    //  - ground decoration (prop.ground): lying flat, y=.2, rotated by the 2D rotation, pivot semantics of the 2D sprite (:283-295)
    //  - everything else: Y-fixed billboard (:292) - bottom edge on the ground, foot z = y + distance from the pivot to the image bottom (:280, :287)
    //  - player: source anchor (combat.json body_anchor 24,47; visual_scale 2.5) is the ground contact (:275-291, player.gd:1529-1560)
    // Billboards with camera yaw 0 are plain camera-facing quads; the generic yaw rotation follows the camera forward projected on the ground.
    public sealed partial class NativePerspectiveWorld
    {
        sealed class Billboard
        {
            public GameObject go; public MeshFilter filter; public MeshRenderer renderer; public MaterialPropertyBlock block = new MaterialPropertyBlock();
            public string meshKey;
        }

        readonly List<GameObject> propObjects = new List<GameObject>();
        readonly List<Billboard> billboards = new List<Billboard>();
        readonly Dictionary<string, Mesh> billboardMeshes = new Dictionary<string, Mesh>();
        readonly Dictionary<int, Billboard> enemyBillboards = new Dictionary<int, Billboard>();
        Billboard playerBillboard;
        bool playerSilhouetteShadow = Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-world3d-silhouette-shadow") >= 0;
        // Default: the player's ground shadow is the spec blob only; the upright-sprite silhouette shadow is opt-in (toggle / --unity-world3d-silhouette-shadow).
        public bool PlayerSilhouetteShadow
        {
            get { return playerSilhouetteShadow; }
            set { playerSilhouetteShadow = value; if (playerBillboard != null) playerBillboard.renderer.shadowCastingMode = value ? UnityEngine.Rendering.ShadowCastingMode.TwoSided : UnityEngine.Rendering.ShadowCastingMode.Off; }
        }
        GameObject blobObject; Material blobMaterial; Texture2D blobTexture;
        public Vector2 PlayerPosition { get; private set; }
        public bool PlayerShown { get { return playerBillboard != null && playerBillboard.go.activeSelf; } }

        static readonly string[] PlayerDirections = { "south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west" };
        static readonly string[] EnemyDirections = { "east", "south_east", "south", "south_west", "west", "north_west", "north", "north_east" };
        // godot/data/combat.json player: visual_scale 2.5, body_anchor [24,47], radius 15; player_shadow.gd constants
        const float PlayerVisualScale = 2.5f, PlayerAnchorX = 24f, PlayerAnchorY = 47f;
        const float ShadowPlayerScale = 2f, ShadowCenterDrop = 12f, ShadowWidthPad = 2f, ShadowHeightRatio = 0.35f, ShadowBlobAlpha = 0.38f, ShadowSpan = 2.3f;
        static readonly Vector2 ShadowShift = new Vector2(0.12f, 0.18f);
        public const float PlayerShadowRenderY = -0.01f; // native_perspective_view.gd:9
        public const float SliceBlobHeight = 2.2f; // slice: the displaced ground rises +-1.5 px at the player, so the blob sits above it (PAINTGROUND-R: it was buried at -0.01)

        Billboard MakeBillboard(string name, Transform parent)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false);
            var b = new Billboard { go = go, filter = go.AddComponent<MeshFilter>(), renderer = go.AddComponent<MeshRenderer>() };
            b.renderer.sharedMaterial = litMaterial; b.renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.TwoSided; b.renderer.receiveShadows = true; // look_3d_variant.gd:189-193 upright sprites cast DOUBLE_SIDED
            billboards.Add(b); return b;
        }

        // anchor (ax, ay) is the pixel inside the source rect that sits on the ground at the foot point; the quad spans x in [-ax,sw-ax]*s, up in [-(sh-ay), ay]*s.
        void ShowBillboard(Billboard b, Texture2D texture, int sx, int top, int sw, int sh, float ax, float ay, float scale, bool flipX, Color tint, float footPx, float footPy)
        {
            string key = texture.name + "#" + texture.width + ":" + sx + ":" + top + ":" + sw + ":" + sh + ":" + ax + ":" + ay + ":" + scale + ":" + flipX;
            if (b.meshKey != key)
            {
                Mesh mesh;
                if (!billboardMeshes.TryGetValue(key, out mesh))
                {
                    mesh = new Mesh { name = "Billboard" };
                    float x0 = -ax * scale, x1 = (sw - ax) * scale, yb = -(sh - ay) * scale, yt = ay * scale;
                    float u0 = (float)sx / texture.width, u1 = (float)(sx + sw) / texture.width, v1 = 1f - (float)top / texture.height, v0 = 1f - (float)(top + sh) / texture.height;
                    if (flipX) { float t = u0; u0 = u1; u1 = t; }
                    mesh.vertices = new[] { new Vector3(x0, yt, 0), new Vector3(x1, yt, 0), new Vector3(x1, yb, 0), new Vector3(x0, yb, 0) };
                    mesh.uv = new[] { new Vector2(u0, v1), new Vector2(u1, v1), new Vector2(u1, v0), new Vector2(u0, v0) };
                    var n = new Vector3(0, 0, -1); mesh.normals = new[] { n, n, n, n };
                    mesh.triangles = new[] { 0, 1, 2, 0, 2, 3 };
                    mesh.bounds = new Bounds(new Vector3((x0 + x1) * 0.5f, (yb + yt) * 0.5f, 0), new Vector3(x1 - x0, yt - yb, 4f));
                    billboardMeshes.Add(key, mesh);
                }
                b.filter.sharedMesh = mesh; b.meshKey = key;
            }
            b.block.SetTexture("_MainTex", texture); b.block.SetColor("_Color", tint); b.block.SetFloat("_Cutoff", 0.1f);
            b.renderer.SetPropertyBlock(b.block);
            b.go.transform.position = Unity(footPx, 0f, footPy);
            b.go.SetActive(true);
        }

        void FaceCamera()
        {
            if (WorldCamera == null) return;
            var f = WorldCamera.transform.forward; f.y = 0f;
            if (f.sqrMagnitude < 1e-6f) f = Vector3.forward;
            var rotation = Quaternion.LookRotation(f.normalized, Vector3.up);
            for (int i = 0; i < billboards.Count; i++) if (billboards[i].go != null && billboards[i].go.activeSelf) billboards[i].go.transform.rotation = rotation;
        }

        void BuildProps()
        {
            foreach (var p in Map.props)
            {
                var texture = LoadBilinear(p.texture);
                if (p.ground) { propObjects.Add(GroundProp(p, texture)); continue; }
                var b = MakeBillboard(p.id, propRoot);
                // 2D sprite: centered=false, scale = draw/texture, offset = -pivot*size. foot_y = (1-pivotY)*drawH (:280). Quad bottom on the ground, x pivot at the node.
                float scaleX = p.width / texture.width, scaleY = p.height / texture.height;
                float scale = scaleY; // props are keepAR-fitted; Godot scales a non-uniform pair, handled by sizing the quad per axis below
                ShowBillboardNonUniform(b, texture, p, scaleX, scaleY);
                propObjects.Add(b.go);
            }
        }

        void ShowBillboardNonUniform(Billboard b, Texture2D texture, MapProp p, float scaleX, float scaleY)
        {
            if (Mathf.Abs(scaleX - scaleY) < 1e-4f)
            {
                ShowBillboard(b, texture, 0, 0, texture.width, texture.height, p.pivotX * texture.width, texture.height, scaleY, p.flip, new Color(1, 1, 1, p.alpha), p.x, p.y + (1f - p.pivotY) * p.height);
                return;
            }
            // Non-uniform scale: build the mesh directly with separate axis scales.
            var mesh = new Mesh { name = "BillboardNU" };
            float x0 = -p.pivotX * p.width, x1 = (1f - p.pivotX) * p.width;
            float u0 = 0f, u1 = 1f; if (p.flip) { u0 = 1f; u1 = 0f; }
            mesh.vertices = new[] { new Vector3(x0, p.height, 0), new Vector3(x1, p.height, 0), new Vector3(x1, 0, 0), new Vector3(x0, 0, 0) };
            mesh.uv = new[] { new Vector2(u0, 1), new Vector2(u1, 1), new Vector2(u1, 0), new Vector2(u0, 0) };
            var n = new Vector3(0, 0, -1); mesh.normals = new[] { n, n, n, n }; mesh.triangles = new[] { 0, 1, 2, 0, 2, 3 };
            mesh.bounds = new Bounds(new Vector3((x0 + x1) * 0.5f, p.height * 0.5f, 0), new Vector3(x1 - x0, p.height, 4f));
            b.filter.sharedMesh = mesh; b.meshKey = "nu:" + p.id;
            b.block.SetTexture("_MainTex", texture); b.block.SetColor("_Color", new Color(1, 1, 1, p.alpha)); b.block.SetFloat("_Cutoff", 0.1f);
            b.renderer.SetPropertyBlock(b.block);
            b.go.transform.position = Unity(p.x, 0f, p.y + (1f - p.pivotY) * p.height); b.go.SetActive(true);
        }

        // native_perspective_view.gd:283-295 ground branch: y=.2, image pivot at the node, rotation about the plane normal.
        GameObject GroundProp(MapProp p, Texture2D texture)
        {
            var go = new GameObject(p.id); go.transform.SetParent(propRoot, false);
            float W = p.width, H = p.height, ox = -p.pivotX * W, oy = -p.pivotY * H;
            float r = p.rotation * Mathf.Deg2Rad, c = Mathf.Cos(r), s = Mathf.Sin(r);
            Func<float, float, Vector3> corner = (cx, cy) => Unity(p.x + cx * c - cy * s, 0.2f, p.y + cx * s + cy * c); // 2D rotation, +angle = clockwise on screen (y down)
            float u0 = 0f, u1 = 1f; if (p.flip) { u0 = 1f; u1 = 0f; }
            var mesh = new Mesh { name = "GroundProp" };
            mesh.vertices = new[] { corner(ox, oy), corner(ox + W, oy), corner(ox + W, oy + H), corner(ox, oy + H) };
            mesh.uv = new[] { new Vector2(u0, 1), new Vector2(u1, 1), new Vector2(u1, 0), new Vector2(u0, 0) };
            mesh.normals = new[] { Vector3.up, Vector3.up, Vector3.up, Vector3.up }; mesh.triangles = new[] { 0, 1, 2, 0, 2, 3 }; mesh.RecalculateBounds();
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = litMaterial;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = true; // ground sprites do not cast (look_3d_variant.gd:192)
            var block = new MaterialPropertyBlock(); block.SetTexture("_MainTex", texture); block.SetColor("_Color", new Color(1, 1, 1, p.alpha)); block.SetFloat("_Cutoff", 0.1f);
            renderer.SetPropertyBlock(block);
            return go;
        }

        // ---- player (source anchor) and enemies (centered 256 cells), plus the actual source blob ground shadow ----
        public void SyncPlayer(float x, float y, float radius, int direction, int frame, bool charge = false)
        {
            PlayerPosition = new Vector2(x, y);
            var texture = LoadBilinear("Art/player/" + PlayerDirections[((direction % 8) + 8) % 8]);
            if (playerBillboard == null) { playerBillboard = MakeBillboard("Player", actorRoot); playerBillboard.renderer.shadowCastingMode = playerSilhouetteShadow ? UnityEngine.Rendering.ShadowCastingMode.TwoSided : UnityEngine.Rendering.ShadowCastingMode.Off; }
            // foot = P + (0, (47-24)*2.5): "source foot y47 displayed at actor.y+23*visual_scale" (combat.json native_actor_origin)
            float footY = y + (PlayerAnchorY - 24f) * PlayerVisualScale;
            ShowBillboard(playerBillboard, texture, frame * 48, 0, 48, 48, PlayerAnchorX, PlayerAnchorY, PlayerVisualScale, false, Color.white, x, footY);
            SyncBlob(x, y, radius, charge); OverlayPlayer(x, y, radius);
        }

        void BuildPlayerBlob()
        {
            // player_shadow.gd:56-61 blob_alpha_at: radial black, alpha stops 1 / .62@.55 / 0 over r 4..62, clipped at 62; 128x128.
            const int size = 128; blobTexture = new Texture2D(size, size, TextureFormat.RGBA32, false) { name = "PlayerBlob", wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            var pixels = new Color32[size * size];
            for (int py = 0; py < size; py++) for (int px = 0; px < size; px++)
            {
                float d = Mathf.Sqrt((px + 0.5f - size * 0.5f) * (px + 0.5f - size * 0.5f) + (py + 0.5f - size * 0.5f) * (py + 0.5f - size * 0.5f));
                pixels[py * size + px] = new Color32(0, 0, 0, (byte)Mathf.RoundToInt(255f * BlobAlphaAt(d)));
            }
            blobTexture.SetPixels32(pixels); blobTexture.Apply(false, true);
            var shader = Resources.Load<Shader>("Shaders/Look3DBlob");
            if (shader == null) throw new InvalidOperationException("Look3DBlob shader is missing");
            blobMaterial = new Material(shader) { name = "Look3DBlob" }; blobMaterial.SetTexture("_MainTex", blobTexture); blobMaterial.SetColor("_Color", new Color(1, 1, 1, ShadowBlobAlpha));
            blobObject = new GameObject("ActualSourcePlayerGroundShadow"); blobObject.transform.SetParent(actorRoot, false);
            var mesh = FlatQuad(-0.5f, -0.5f, 1f, 1f, 0f, 0f, 0f, 1f, 1f);
            blobObject.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = blobObject.AddComponent<MeshRenderer>(); renderer.sharedMaterial = blobMaterial; renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            blobObject.SetActive(false);
        }

        static float BlobAlphaAt(float distance)
        {
            if (distance > 62f) return 0f;
            float t = Mathf.Clamp01((distance - 4f) / (62f - 4f));
            float[,] stops = { { 0f, 1f }, { 0.55f, 0.62f }, { 1f, 0f } };
            for (int i = 1; i < 3; i++)
                if (t <= stops[i, 0]) return Mathf.Lerp(stops[i - 1, 1], stops[i, 1], (t - stops[i - 1, 0]) / (stops[i, 0] - stops[i - 1, 0]));
            return 0f;
        }

        // player_shadow.gd:40-47 geometry(): scaled = radius*2, width = scaled+2 (6 charging), height = scaled*.35, center = (0, scaled+12)
        void SyncBlob(float x, float y, float radius, bool charge)
        {
            float scaled = radius * ShadowPlayerScale, width = scaled + (charge ? 6f : ShadowWidthPad), height = scaled * ShadowHeightRatio, cx = 0f, cy = scaled + ShadowCenterDrop;
            float rx = cx - width * 1.15f + width * ShadowShift.x, ry = cy - height * 1.15f + height * ShadowShift.y, rw = width * ShadowSpan, rh = height * ShadowSpan;
            blobObject.transform.position = Unity(x + rx + rw * 0.5f, SliceActive ? SliceBlobHeight : PlayerShadowRenderY, y + ry + rh * 0.5f);
            blobObject.transform.localScale = new Vector3(rw, 1f, rh);
            blobObject.SetActive(true);
        }

        public void SyncEnemy(int id, float x, float y, float radius, int direction, int skin, bool alive)
        {
            Billboard b;
            if (!enemyBillboards.TryGetValue(id, out b)) { b = MakeBillboard("Enemy " + id, actorRoot); enemyBillboards.Add(id, b); }
            OverlayEnemy(id, x, y, radius, alive);
            if (!alive) { b.go.SetActive(false); return; }
            var texture = LoadBilinear("Art/enemy/atlas_ch1_8dir_" + EnemyDirections[((direction % 8) + 8) % 8]);
            float size = radius * 7f / 256f;
            ShowBillboard(b, texture, (skin % 8) * 256, (skin / 8) * 256, 256, 256, 128f, 256f, size, false, Color.white, x, y + 128f * size);
        }

        // Stage-1 actor mirror of the 2D selection (direction from facing, idle frame); walk/attack art and VFX are later stages.
        public void SyncActors(Simulation simulation)
        {
            var p = simulation.Player;
            int pd = ((int)Math.Floor((Math.PI / 2 - p.Facing) / (Math.PI / 4) + .5) % 8 + 8) % 8;
            SyncPlayer(p.X, p.Y, p.Radius, pd, (simulation.TickCount / 48) % 2, p.KiChargeActive);
            foreach (var e in simulation.Enemies)
            {
                int idx = ((int)(e.X * 31) & 0x7fffffff) % 40;
                int ed = ((int)Math.Floor(e.Facing / (Math.PI / 4) + .5) % 8 + 8) % 8;
                SyncEnemy(e.Id, e.X, e.Y, e.Radius, ed, idx, e.Alive);
            }
        }
    }
}
