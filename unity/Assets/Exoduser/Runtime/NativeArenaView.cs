using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // C07: floor of the boss arena (web genBossArena tiles 1 wall / 4 floor / 5 edge rune / 0 opened exit).
    // BX art: the web's own pictures, painted the way buildMapCache does it: the chapter-1 floor (assets/map/ch1/ground_dark_soil.png) repeated 1:1 over the whole map as a tiled
    // sprite (1 texel = 1 web pixel, nearest), the void wall (wall_black_void_tile.png is a flat near-black navy, mean 3/6/10) as an opaque mask over every wall tile, and an
    // ember-lit exit threshold on top. The mask / glow overlay is rebuilt when the exit opens.
    public sealed class NativeArenaView
    {
        const int Px = 8;                        // texels per tile of the wall / exit overlay
        const int Margin = 32;                   // 화면 밖까지 마스크를 연장해 출구 카메라의 사각형 단절을 막는다.
        readonly SpriteRenderer renderer, floor; Texture2D texture; Sprite sprite, floorSprite;
        readonly BossArenaLayout layout; 
        public int BuiltExitCount = -1;

        public NativeArenaView(Transform parent, BossArenaLayout arena)
        {
            layout = arena;
            var go = new GameObject("Boss Arena Floor"); go.transform.SetParent(parent);
            renderer = go.AddComponent<SpriteRenderer>(); renderer.sortingOrder = -30000;
            go.transform.position = new Vector3(-Margin * .4f, Margin * .4f, 0);
            var fg = new GameObject("Boss Arena Soil"); fg.transform.SetParent(parent); fg.transform.position = Vector3.zero;
            floor = fg.AddComponent<SpriteRenderer>(); floor.sortingOrder = -30001;
            fg.transform.position = go.transform.position;
            var soil = Resources.Load<Texture2D>("Art/map/boss_arena/ground_dark_soil"); soil.filterMode = FilterMode.Bilinear; soil.wrapMode = TextureWrapMode.Repeat;
            floorSprite = Sprite.Create(soil, new Rect(0, 0, soil.width, soil.height), new Vector2(0, 1), 100f, 0, SpriteMeshType.FullRect);
            floor.sprite = floorSprite; floor.drawMode = SpriteDrawMode.Tiled; floor.tileMode = SpriteTileMode.Continuous;
            floor.size = new Vector2((BossArenaLayout.Width + Margin * 2) * .4f, (BossArenaLayout.Height + Margin * 2) * .4f);
        }

        static float Hash(int x, int y, int seed)
        {
            unchecked { uint h = (uint)(x * 374761393 + y * 668265263 + seed * 1274126177); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xffff) / 65535f; }
        }
        static float Smooth(float t) { return t * t * (3 - 2 * t); }
        static float Noise(float x, float y, int seed)
        {
            int xi = Mathf.FloorToInt(x), yi = Mathf.FloorToInt(y); float fx = Smooth(x - xi), fy = Smooth(y - yi);
            float a = Hash(xi, yi, seed), b = Hash(xi + 1, yi, seed), c = Hash(xi, yi + 1, seed), d = Hash(xi + 1, yi + 1, seed);
            return Mathf.Lerp(Mathf.Lerp(a, b, fx), Mathf.Lerp(c, d, fx), fy);
        }

        public void Rebuild(bool exitOpen, int exitX, int exitY)
        {
            int w = MaskWidth, h = MaskHeight;
            if (texture == null) { texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear }; }
            var px = Mask(layout.Tiles, exitOpen, exitX, exitY);
            texture.SetPixels32(px); texture.Apply(false);
            if (sprite == null) { sprite = Sprite.Create(texture, new Rect(0, 0, w, h), new Vector2(0, 1), 20f, 0, SpriteMeshType.FullRect); renderer.sprite = sprite; }
            BuiltExitCount = exitOpen ? 1 : 0;
        }

        // PERF-U4 (docs/12퍼포먼스·최적화/UNITY_FRAME_OPT_MASTER_20261103.md): the mask depends only on the tiles and the exit, so it is cached by
        // tile content + exit and can be computed ahead on a background thread (Prewarm). A miss computes it in parallel rows. Pixels are the same as the serial build.
        public const int MaskWidth = (BossArenaLayout.Width + Margin * 2) * Px, MaskHeight = (BossArenaLayout.Height + Margin * 2) * Px;
        sealed class CacheEntry { public long key; public Color32[] pixels; public Task task; }
        static readonly List<CacheEntry> cache = new List<CacheEntry>();
        const int CacheLimit = 2;   // one closed + one open arena mask, 8.4 MB each
        public static int CacheHits, CacheMisses;

        static long Key(int[] tiles, bool exitOpen, int exitX, int exitY)
        {
            unchecked { long h = 1469598103934665603L; for (int i = 0; i < tiles.Length; i++) h = (h ^ tiles[i]) * 1099511628211L; h = (h ^ (exitOpen ? 1 : 0)) * 1099511628211L; if (exitOpen) { h = (h ^ exitX) * 1099511628211L; h = (h ^ exitY) * 1099511628211L; } return h; }
        }
        static CacheEntry Find(long key) { lock (cache) { foreach (var e in cache) if (e.key == key) return e; return null; } }
        static CacheEntry Add(long key)
        {
            lock (cache)
            {
                foreach (var e in cache) if (e.key == key) return e;
                var entry = new CacheEntry { key = key }; cache.Add(entry);
                while (cache.Count > CacheLimit) cache.RemoveAt(0);
                return entry;
            }
        }

        static Color32[] Mask(int[] tiles, bool exitOpen, int exitX, int exitY)
        {
            long key = Key(tiles, exitOpen, exitX, exitY); var entry = Find(key);
            if (entry != null) { if (entry.task != null) entry.task.Wait(); if (entry.pixels != null) { CacheHits++; return entry.pixels; } }
            CacheMisses++;
            var pixels = Compute((int[])tiles.Clone(), exitOpen, exitX, exitY, true);
            Add(key).pixels = pixels; return pixels;
        }

        // Background precompute on a below-normal thread; tiles are copied so Core may keep mutating its own array.
        public static void Prewarm(int[] tiles, bool exitOpen, int exitX, int exitY)
        {
            var copy = (int[])tiles.Clone(); long key = Key(copy, exitOpen, exitX, exitY);
            CacheEntry entry; var done = new TaskCompletionSource<bool>();
            lock (cache) { if (Find(key) != null) return; entry = Add(key); entry.task = done.Task; }
            var thread = new Thread(() => { try { entry.pixels = Compute(copy, exitOpen, exitX, exitY, false); } catch (Exception ex) { Debug.LogException(ex); } finally { done.TrySetResult(true); } })
            { IsBackground = true, Priority = System.Threading.ThreadPriority.BelowNormal, Name = "Arena mask prewarm" };
            thread.Start();
        }

        static Color32[] Compute(int[] tiles, bool exitOpen, int exitX, int exitY, bool parallel)
        {
            int w = MaskWidth, h = MaskHeight;
            var mask = new float[w * h];
            var px = new Color32[w * h];
            Action<int> row = ty =>
            {
                for (int tx = -Margin; tx < BossArenaLayout.Width + Margin; tx++)
                {
                    int tile = Tile(tiles, tx, ty);
                    bool nearFloor = false;
                    for (int dy = -1; dy <= 1 && !nearFloor; dy++) for (int dx = -1; dx <= 1; dx++) if (Tile(tiles, tx + dx, ty + dy) != 1) { nearFloor = true; break; }
                    bool exitTile = exitOpen && ty == exitY && Mathf.Abs(tx - exitX) <= 1 && tile == 0;
                    for (int yy = 0; yy < Px; yy++)
                        for (int xx = 0; xx < Px; xx++)
                        {
                            int gx = (tx + Margin) * Px + xx, gy = (ty + Margin) * Px + yy;
                            int index = (h - 1 - gy) * w + gx;
                            mask[index] = nearFloor ? 0 : 1;
                            px[index] = Shade(tile, tx, ty, xx, yy, gx, gy, exitTile);
                        }
                }
            };
            if (parallel) Parallel.For(-Margin, BossArenaLayout.Height + Margin, row);
            else for (int ty = -Margin; ty < BossArenaLayout.Height + Margin; ty++) row(ty);
            // 타일 충돌은 유지한다. 바닥은 한 칸 확장한 뒤 3회 분리 블러로 외곽 아래에 자연스럽게 잇는다.
            var temp = new float[mask.Length];
            for (int pass = 0; pass < 3; pass++) { Blur(mask, temp, w, h, 10, true, parallel); Blur(temp, mask, w, h, 10, false, parallel); }
            for (int i = 0; i < px.Length; i++)
                if (mask[i] > 0) px[i] = new Color32(Wall.r, Wall.g, Wall.b, (byte)Mathf.RoundToInt(mask[i] * 255));
            return px;
        }

        // Editor/QA identity check: the parallel and serial builds must produce the same bytes.
        public static bool ParallelMatchesSerial(int[] tiles, bool exitOpen, int exitX, int exitY)
        {
            var a = Compute(tiles, exitOpen, exitX, exitY, false); var b = Compute(tiles, exitOpen, exitX, exitY, true);
            for (int i = 0; i < a.Length; i++) if (a[i].r != b[i].r || a[i].g != b[i].g || a[i].b != b[i].b || a[i].a != b[i].a) return false;
            return true;
        }

        static readonly Color32 Wall = new Color32(3, 6, 10, 255), Clear = new Color32(0, 0, 0, 0);

        static int Tile(int[] tiles, int x, int y) { return x < 0 || y < 0 || x >= BossArenaLayout.Width || y >= BossArenaLayout.Height ? 1 : tiles[y * BossArenaLayout.Width + x]; }
        static void Blur(float[] input, float[] output, int w, int h, int radius, bool horizontal, bool parallel)
        {
            int lines = horizontal ? h : w, length = horizontal ? w : h, span = radius * 2 + 1;
            Action<int> body = line =>
            {
                int start = horizontal ? line * w : line, step = horizontal ? 1 : w;
                float sum = 0; for (int i = -radius; i <= radius; i++) sum += input[start + Mathf.Clamp(i, 0, length - 1) * step];
                for (int i = 0; i < length; i++) { output[start + i * step] = sum / span; sum += input[start + Mathf.Min(length - 1, i + radius + 1) * step] - input[start + Mathf.Max(0, i - radius) * step]; }
            };
            if (parallel) Parallel.For(0, lines, body); else for (int line = 0; line < lines; line++) body(line);
        }

        static Color32 Shade(int tile, int tx, int ty, int xx, int yy, int gx, int gy, bool exitTile)
        {
            if (tile == 1) return Clear; // 벽의 알파는 부드러운 점유 마스크가 결정한다.
            if (!exitTile) return Clear;
            // threshold of the opened exit: warm ember light falling off with distance from the tile centre (half-strength alpha blend over the soil)
            float dx = (xx - Px / 2f) / (Px / 2f), dy = (yy - Px / 2f) / (Px / 2f); float d = Mathf.Clamp01(1 - Mathf.Sqrt(dx * dx + dy * dy) * .8f);
            return new Color(Mathf.Clamp01(1.16f * d + .16f), Mathf.Clamp01(.54f * d + .08f), Mathf.Clamp01(.18f * d + .04f), .5f);
        }

        public void SetLightingMaterial(Material material) { if (floor != null) floor.sharedMaterial = material; }

        public void Dispose()
        {
            if (renderer != null) UnityEngine.Object.Destroy(renderer.gameObject);
            if (floor != null) UnityEngine.Object.Destroy(floor.gameObject);
            if (sprite != null) UnityEngine.Object.Destroy(sprite);
            if (floorSprite != null) UnityEngine.Object.Destroy(floorSprite);
            if (texture != null) UnityEngine.Object.Destroy(texture);
        }
    }
}
