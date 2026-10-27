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
        readonly SpriteRenderer renderer, floor; Texture2D texture; Sprite sprite, floorSprite;
        readonly BossArenaLayout layout; 
        public int BuiltExitCount = -1;

        public NativeArenaView(Transform parent, BossArenaLayout arena)
        {
            layout = arena;
            var go = new GameObject("Boss Arena Floor"); go.transform.SetParent(parent);
            renderer = go.AddComponent<SpriteRenderer>(); renderer.sortingOrder = -30000;
            go.transform.position = Vector3.zero;
            var fg = new GameObject("Boss Arena Soil"); fg.transform.SetParent(parent); fg.transform.position = Vector3.zero;
            floor = fg.AddComponent<SpriteRenderer>(); floor.sortingOrder = -30001;
            var soil = Resources.Load<Texture2D>("Art/map/boss_arena/ground_dark_soil"); soil.filterMode = FilterMode.Point; soil.wrapMode = TextureWrapMode.Repeat;
            floorSprite = Sprite.Create(soil, new Rect(0, 0, soil.width, soil.height), new Vector2(0, 1), 100f, 0, SpriteMeshType.FullRect);
            floor.sprite = floorSprite; floor.drawMode = SpriteDrawMode.Tiled; floor.tileMode = SpriteTileMode.Continuous;
            floor.size = new Vector2(BossArenaLayout.Width * .4f, BossArenaLayout.Height * .4f);
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
            int w = BossArenaLayout.Width * Px, h = BossArenaLayout.Height * Px;
            if (texture == null) { texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Point }; }
            var px = new Color32[w * h];
            for (int ty = 0; ty < BossArenaLayout.Height; ty++)
                for (int tx = 0; tx < BossArenaLayout.Width; tx++)
                {
                    int tile = layout.Tiles[ty * BossArenaLayout.Width + tx];
                    bool exitTile = exitOpen && ty == exitY && Mathf.Abs(tx - exitX) <= 1 && tile == 0;
                    for (int yy = 0; yy < Px; yy++)
                        for (int xx = 0; xx < Px; xx++)
                        {
                            int gx = tx * Px + xx, gy = ty * Px + yy;
                            px[(h - 1 - gy) * w + gx] = Shade(tile, tx, ty, xx, yy, gx, gy, exitTile);
                        }
                }
            texture.SetPixels32(px); texture.Apply(false);
            if (sprite == null) { sprite = Sprite.Create(texture, new Rect(0, 0, w, h), new Vector2(0, 1), 20f, 0, SpriteMeshType.FullRect); renderer.sprite = sprite; }
            BuiltExitCount = exitOpen ? 1 : 0;
        }

        static readonly Color32 Wall = new Color32(3, 6, 10, 255), Clear = new Color32(0, 0, 0, 0);

        Color32 Shade(int tile, int tx, int ty, int xx, int yy, int gx, int gy, bool exitTile)
        {
            if (tile == 1) return Wall;
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
            if (texture != null) UnityEngine.Object.Destroy(texture);
        }
    }
}
