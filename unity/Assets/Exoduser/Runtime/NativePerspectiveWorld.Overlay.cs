using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // QA-only collision overlay (default OFF): the simulation's own SourceMap.CanMove(x, y, radius) evaluated on a 10px grid and drawn
    // translucent over the 3D ground (red = the player body cannot stand there, faint green = walkable) with the 40px tile grid.
    // The overlay reads SourceMap only; 3D meshes never create collision (agreement s7.3). Toggle: SetCollisionOverlay(bool) or
    // --unity-world3d-collision-overlay (capture mode renders both states).
    public sealed partial class NativePerspectiveWorld
    {
        public const float OverlayCell = 10f, OverlayBodyRadius = 15f, OverlayHeight = 1.0f;
        public bool CollisionOverlay { get; private set; }
        SourceMap sourceMap;
        Material overlayMaterial;
        Transform overlayRoot;
        readonly Dictionary<int, GameObject> overlays = new Dictionary<int, GameObject>();

        void InitializeOverlay()
        {
            sourceMap = new SourceMap(Map);
            var shader = Resources.Load<Shader>("Shaders/Look3DOverlay");
            if (shader == null) throw new InvalidOperationException("Look3DOverlay shader is missing");
            overlayMaterial = new Material(shader) { name = "Look3DOverlay" };
            overlayRoot = Child("Collision overlay (QA)");
            overlayRoot.gameObject.SetActive(false);
        }

        public void ApplyOverlayArgument() { if (Array.IndexOf(Environment.GetCommandLineArgs(), OverlayArgument) >= 0) SetCollisionOverlay(true); }

        public const string OverlayArgument = "--unity-world3d-collision-overlay";
        public const float OverlayLineHeight = 1.4f, OverlayLineWidth = 3f, SpawnRingRadius = 580f;
        GameObject rectOutlines, spawnRing;
        GameObject playerRing; readonly Dictionary<int, GameObject> enemyRings = new Dictionary<int, GameObject>();
        readonly Dictionary<int, Mesh> ringMeshes = new Dictionary<int, Mesh>();

        void SetTint(GameObject go, Color color, bool grid)
        {
            var renderer = go.GetComponent<MeshRenderer>(); var block = new MaterialPropertyBlock();
            block.SetTexture("_MainTex", Texture2D.whiteTexture); block.SetColor("_Tint", color); block.SetFloat("_Grid", grid ? 1f : 0f); renderer.SetPropertyBlock(block);
        }

        GameObject LineObject(string name, Mesh mesh, Color color)
        {
            var go = new GameObject(name); go.transform.SetParent(overlayRoot, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = overlayMaterial;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            SetTint(go, color, false); return go;
        }

        // Ring (annulus) of simulation radius `radius` px centred on the origin, flat at OverlayLineHeight.
        Mesh RingMesh(float radius)
        {
            int key = Mathf.RoundToInt(radius * 2f); Mesh mesh;
            if (ringMeshes.TryGetValue(key, out mesh)) return mesh;
            const int seg = 48; float inner = Mathf.Max(0.5f, radius - OverlayLineWidth * 0.5f), outer = radius + OverlayLineWidth * 0.5f;
            var v = new Vector3[seg * 2]; var uv = new Vector2[seg * 2]; var n = new Vector3[seg * 2]; var t = new int[seg * 6];
            for (int i = 0; i < seg; i++)
            {
                float a = Mathf.PI * 2f * i / seg, c = Mathf.Cos(a), s = Mathf.Sin(a);
                v[i * 2] = new Vector3(c * inner, OverlayLineHeight, -s * inner); v[i * 2 + 1] = new Vector3(c * outer, OverlayLineHeight, -s * outer);
                n[i * 2] = n[i * 2 + 1] = Vector3.up; uv[i * 2] = uv[i * 2 + 1] = Vector2.zero;
                int a0 = i * 2, a1 = i * 2 + 1, b0 = ((i + 1) % seg) * 2, b1 = ((i + 1) % seg) * 2 + 1;
                t[i * 6] = a0; t[i * 6 + 1] = a1; t[i * 6 + 2] = b1; t[i * 6 + 3] = a0; t[i * 6 + 4] = b1; t[i * 6 + 5] = b0;
            }
            mesh = new Mesh { name = "OverlayRing" + radius, vertices = v, uv = uv, normals = n, triangles = t }; mesh.RecalculateBounds();
            ringMeshes.Add(key, mesh); return mesh;
        }

        GameObject PlaceRing(string name, float x, float y, float radius, Color color)
        {
            var go = LineObject(name, RingMesh(radius), color); go.transform.position = Unity(x, 0f, y); return go;
        }

        // Static QA geometry: the 292 collision_rects outlines and the source start-enemy ring (NativeGame.ResetRun: 5 ordinary enemies on a 580 px ring,
        // game.html:63425-63432).
        void BuildOverlayStatics()
        {
            if (rectOutlines != null) return;
            int count = massRects.Length / 4; var v = new List<Vector3>(count * 16); var t = new List<int>(count * 24); var uv = new List<Vector2>(count * 16); var n = new List<Vector3>(count * 16);
            float w = OverlayLineWidth;
            Action<float, float, float, float> quad = (x0, y0, x1, y1) =>
            {
                int b = v.Count; v.Add(Unity(x0, OverlayLineHeight, y0)); v.Add(Unity(x1, OverlayLineHeight, y0)); v.Add(Unity(x1, OverlayLineHeight, y1)); v.Add(Unity(x0, OverlayLineHeight, y1));
                for (int k = 0; k < 4; k++) { uv.Add(Vector2.zero); n.Add(Vector3.up); }
                t.AddRange(new[] { b, b + 1, b + 2, b, b + 2, b + 3 });
            };
            for (int i = 0; i < count; i++)
            {
                float x = massRects[i * 4], y = massRects[i * 4 + 1], rw = massRects[i * 4 + 2], rh = massRects[i * 4 + 3];
                quad(x, y, x + rw, y + w); quad(x, y + rh - w, x + rw, y + rh); quad(x, y + w, x + w, y + rh - w); quad(x + rw - w, y + w, x + rw, y + rh - w);
            }
            var mesh = new Mesh { name = "CollisionRectOutlines" }; mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
            mesh.SetVertices(v); mesh.SetNormals(n); mesh.SetUVs(0, uv); mesh.SetTriangles(t, 0); mesh.RecalculateBounds();
            rectOutlines = LineObject("collision_rects outlines", mesh, new Color(1f, 0.82f, 0.15f, 0.85f));
            spawnRing = new GameObject("start enemy ring"); spawnRing.transform.SetParent(overlayRoot, false);
            var ringColor = new Color(0.2f, 0.9f, 1f, 0.9f);
            PlaceRing("ring r580", Map.startX, Map.startY, SpawnRingRadius, ringColor).transform.SetParent(spawnRing.transform, true);
            for (int i = 0; i < 5; i++)
            {
                double a = Math.PI * 2 * i / 5 - Math.PI / 2;
                PlaceRing("spawn " + i, Map.startX + (float)Math.Cos(a) * SpawnRingRadius, Map.startY + (float)Math.Sin(a) * SpawnRingRadius, 22f, ringColor).transform.SetParent(spawnRing.transform, true);
            }
        }

        void OverlayPlayer(float x, float y, float radius)
        {
            if (!CollisionOverlay) return;
            if (playerRing == null) playerRing = PlaceRing("player body", x, y, radius, new Color(0.3f, 1f, 0.4f, 0.95f));
            playerRing.transform.position = Unity(x, 0f, y);
        }

        void OverlayEnemy(int id, float x, float y, float radius, bool alive)
        {
            if (!CollisionOverlay) return;
            GameObject go;
            if (!enemyRings.TryGetValue(id, out go)) { go = PlaceRing("enemy " + id, x, y, radius, new Color(1f, 0.55f, 0.1f, 0.95f)); enemyRings.Add(id, go); }
            go.SetActive(alive); go.transform.position = Unity(x, 0f, y);
        }

        public void SetCollisionOverlay(bool on)
        {
            CollisionOverlay = on;
            overlayRoot.gameObject.SetActive(on);
            if (on) { BuildOverlayStatics(); foreach (var pair in chunks) EnsureOverlay(pair.Key); }
        }

        void EnsureOverlay(int chunkIndex)
        {
            if (!CollisionOverlay || overlays.ContainsKey(chunkIndex)) return;
            var c = Map.chunks[chunkIndex];
            int w = Mathf.CeilToInt(c.width / OverlayCell), h = Mathf.CeilToInt(c.height / OverlayCell);
            var pixels = new Color32[w * h];
            for (int j = 0; j < h; j++) for (int i = 0; i < w; i++)
            {
                float x = c.x + (i + 0.5f) * OverlayCell, y = c.y + (j + 0.5f) * OverlayCell;
                bool free = sourceMap.CanMove(x, y, OverlayBodyRadius);
                pixels[(h - 1 - j) * w + i] = free ? new Color32(70, 255, 130, 22) : new Color32(255, 40, 40, 120); // image row 0 = south edge in Unity UV space
            }
            var texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { name = "CollisionOverlay " + chunkIndex, filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
            texture.SetPixels32(pixels); texture.Apply(false, true);
            var go = new GameObject("Overlay " + chunkIndex); go.transform.SetParent(overlayRoot, false);
            go.AddComponent<MeshFilter>().sharedMesh = FlatQuad(c.x, c.y, c.width, c.height, OverlayHeight, 0f, 0f, 1f, 1f);
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = overlayMaterial;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            var block = new MaterialPropertyBlock(); block.SetTexture("_MainTex", texture); block.SetColor("_Tint", Color.white); block.SetFloat("_Grid", 1f); renderer.SetPropertyBlock(block);
            overlays.Add(chunkIndex, go);
        }

        void ReleaseOverlay(int chunkIndex)
        {
            GameObject go;
            if (!overlays.TryGetValue(chunkIndex, out go)) return;
            var renderer = go.GetComponent<MeshRenderer>(); var block = new MaterialPropertyBlock(); renderer.GetPropertyBlock(block);
            var texture = block.GetTexture("_MainTex");
            Dispose(go.GetComponent<MeshFilter>().sharedMesh); if (texture != null) Dispose(texture); Dispose(go); overlays.Remove(chunkIndex);
        }
    }
}
