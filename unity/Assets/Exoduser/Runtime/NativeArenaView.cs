using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // C07: floor of the boss arena (web genBossArena tiles 1 wall / 4 floor / 5 edge rune / 0 opened exit), drawn as one generated sprite at 16 texels per 40 px tile.
    // Hell Gothic palette: charcoal slab floor with a faint iron-brown grain, a dull ember inlay along the wall edge, near-black walls, an ember-lit exit threshold.
    // Smooth value noise only (no speckle). Built once per arena and rebuilt when the exit opens.
    public sealed class NativeArenaView
    {
        const int Px = 16;                       // texels per tile
        readonly SpriteRenderer renderer; Texture2D texture; Sprite sprite;
        readonly BossArenaLayout layout;
        public int BuiltExitCount = -1;

        public NativeArenaView(Transform parent, BossArenaLayout arena)
        {
            layout = arena;
            var go = new GameObject("Boss Arena Floor"); go.transform.SetParent(parent);
            renderer = go.AddComponent<SpriteRenderer>(); renderer.sortingOrder = -30000;
            go.transform.position = Vector3.zero;
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
            if (texture == null) { texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear }; }
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
            if (sprite == null) { sprite = Sprite.Create(texture, new Rect(0, 0, w, h), new Vector2(0, 1), 40f, 0, SpriteMeshType.FullRect); renderer.sprite = sprite; }
            BuiltExitCount = exitOpen ? 1 : 0;
        }

        Color32 Shade(int tile, int tx, int ty, int xx, int yy, int gx, int gy, bool exitTile)
        {
            float broad = Noise(gx / 46f, gy / 46f, 7), fine = Noise(gx / 11f, gy / 11f, 19);
            if (tile == 1)
            {   // wall mass: almost black, a faint cool edge where it meets the floor is added by the floor side (tile 5)
                float v = .035f + broad * .02f; return new Color(v * .95f, v * .9f, v * .95f, 1);
            }
            // floor slabs: 4x2 tile slabs, running bond; seams are thin dark lines
            int slabW = 4 * Px, slabH = 2 * Px; int row = gy / slabH; int offX = (row & 1) * (slabW / 2);
            int sx = (gx + offX) % slabW, sy = gy % slabH;
            bool seam = sx < 1 || sy < 1;
            float baseV = .125f + broad * .045f + fine * .02f;
            float slab = Hash((gx + offX) / slabW, row, 3) * .03f;   // each slab slightly different in value
            float r = baseV + slab + .012f, g = baseV + slab * .9f, b = baseV + slab * .8f - .006f;
            if (seam) { r *= .45f; g *= .45f; b *= .45f; }
            if (tile == 5)
            {   // edge rune band: darker slab + a dull ember inlay line 3 texels from the wall side
                r *= .85f; g *= .8f; b *= .8f;
                bool wallN = ty > 0 && layout.Tiles[(ty - 1) * BossArenaLayout.Width + tx] == 1, wallS = ty < BossArenaLayout.Height - 1 && layout.Tiles[(ty + 1) * BossArenaLayout.Width + tx] == 1;
                bool wallW = tx > 0 && layout.Tiles[ty * BossArenaLayout.Width + tx - 1] == 1, wallE = tx < BossArenaLayout.Width - 1 && layout.Tiles[ty * BossArenaLayout.Width + tx + 1] == 1;
                float edge = 99;
                if (wallN) edge = Mathf.Min(edge, yy); if (wallS) edge = Mathf.Min(edge, Px - 1 - yy);
                if (wallW) edge = Mathf.Min(edge, xx); if (wallE) edge = Mathf.Min(edge, Px - 1 - xx);
                if (edge < 99)
                {
                    float line = Mathf.Clamp01(1 - Mathf.Abs(edge - 3.5f) / 1.6f);                 // inlay centre line
                    float glow = Mathf.Clamp01(1 - edge / 11f) * .35f;                              // soft wash toward the wall
                    float pulse = .75f + .25f * Noise(gx / 30f, gy / 30f, 31);
                    r += (line * .42f + glow * .20f) * pulse; g += (line * .075f + glow * .03f) * pulse; b += (line * .035f + glow * .015f) * pulse;
                    if (edge < 1.5f) { r *= .55f; g *= .55f; b *= .55f; }                           // wall contact shadow
                }
            }
            if (exitTile)
            {   // threshold of the opened exit: warm ember light falling off with distance from the tile centre
                float dx = (xx - Px / 2f) / (Px / 2f), dy = (yy - Px / 2f) / (Px / 2f); float d = Mathf.Clamp01(1 - Mathf.Sqrt(dx * dx + dy * dy) * .8f);
                r = r * .5f + .58f * d + .08f; g = g * .5f + .27f * d + .04f; b = b * .5f + .09f * d + .02f;
            }
            return new Color(Mathf.Clamp01(r), Mathf.Clamp01(g), Mathf.Clamp01(b), 1);
        }

        public void Dispose()
        {
            if (renderer != null) UnityEngine.Object.Destroy(renderer.gameObject);
            if (sprite != null) UnityEngine.Object.Destroy(sprite);
            if (texture != null) UnityEngine.Object.Destroy(texture);
        }
    }
}
