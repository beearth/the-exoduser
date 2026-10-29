using System;
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
            int w = (BossArenaLayout.Width + Margin * 2) * Px, h = (BossArenaLayout.Height + Margin * 2) * Px;
            if (texture == null) { texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear }; }
            var mask = new float[w * h];
            var px = new Color32[w * h];
            for (int ty = -Margin; ty < BossArenaLayout.Height + Margin; ty++)
                for (int tx = -Margin; tx < BossArenaLayout.Width + Margin; tx++)
                {
                    int tile = Tile(tx, ty);
                    bool nearFloor = false;
                    for (int dy = -1; dy <= 1 && !nearFloor; dy++) for (int dx = -1; dx <= 1; dx++) if (Tile(tx + dx, ty + dy) != 1) { nearFloor = true; break; }
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
            // 타일 충돌은 유지한다. 바닥은 한 칸 확장한 뒤 3회 분리 블러로 외곽 아래에 자연스럽게 잇는다.
            var temp = new float[mask.Length];
            for (int pass = 0; pass < 3; pass++) { Blur(mask, temp, w, h, 10, true); Blur(temp, mask, w, h, 10, false); }
            for (int i = 0; i < px.Length; i++)
                if (mask[i] > 0) px[i] = new Color32(Wall.r, Wall.g, Wall.b, (byte)Mathf.RoundToInt(mask[i] * 255));
            texture.SetPixels32(px); texture.Apply(false);
            if (sprite == null) { sprite = Sprite.Create(texture, new Rect(0, 0, w, h), new Vector2(0, 1), 20f, 0, SpriteMeshType.FullRect); renderer.sprite = sprite; }
            BuiltExitCount = exitOpen ? 1 : 0;
        }

        static readonly Color32 Wall = new Color32(3, 6, 10, 255), Clear = new Color32(0, 0, 0, 0);

        int Tile(int x, int y) { return x < 0 || y < 0 || x >= BossArenaLayout.Width || y >= BossArenaLayout.Height ? 1 : layout.Tiles[y * BossArenaLayout.Width + x]; }
        static void Blur(float[] input, float[] output, int w, int h, int radius, bool horizontal)
        {
            int lines = horizontal ? h : w, length = horizontal ? w : h, span = radius * 2 + 1;
            for (int line = 0; line < lines; line++)
            {
                int start = horizontal ? line * w : line, step = horizontal ? 1 : w;
                float sum = 0; for (int i = -radius; i <= radius; i++) sum += input[start + Mathf.Clamp(i, 0, length - 1) * step];
                for (int i = 0; i < length; i++) { output[start + i * step] = sum / span; sum += input[start + Mathf.Min(length - 1, i + radius + 1) * step] - input[start + Mathf.Max(0, i - radius) * step]; }
            }
        }

        Color32 Shade(int tile, int tx, int ty, int xx, int yy, int gx, int gy, bool exitTile)
        {
            if (tile == 1) return Clear; // 벽의 알파는 부드러운 점유 마스크가 결정한다.
            if (!exitTile) return Clear;
            // threshold of the opened exit: warm ember light falling off with distance from the tile centre (half-strength alpha blend over the soil)
            float dx = (xx - Px / 2f) / (Px / 2f), dy = (yy - Px / 2f) / (Px / 2f); float d = Mathf.Clamp01(1 - Mathf.Sqrt(dx * dx + dy * dy) * .8f);
            return new Color(Mathf.Clamp01(1.16f * d + .16f), Mathf.Clamp01(.54f * d + .08f), Mathf.Clamp01(.18f * d + .04f), .5f);
        }

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
