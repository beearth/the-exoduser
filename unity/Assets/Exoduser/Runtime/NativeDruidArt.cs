using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // BX art: the web's own 1-1 dark druid sheets / VFX atlases (Resources/Art/boss/dark_druid, Resources/Art/vfx/boss — byte copies of assets/sprites/boss/boss_dark_druid_*.png,
    // assets/vfx/boss/druid_*_24_*.png, img/proj_firedevil_orb.png and the webp inside druid_corruption_ring.svg). This class only cuts them the way game.html does:
    // sheet cells use Math.round(col*w/cols) boundaries, atlas-clip frames use a 1 px inset (tools/2_5d/atlas-clip-runtime.mjs getAtlasFrameRect).
    internal static class NativeDruidArt
    {
        public const string BodyDir = "Art/boss/dark_druid/", VfxDir = "Art/vfx/boss/";
        static readonly Dictionary<string, Texture2D> textures = new Dictionary<string, Texture2D>();
        static readonly Dictionary<string, Sprite> sprites = new Dictionary<string, Sprite>();
        static Material additive;
        public static readonly int Opacity = Shader.PropertyToID("_Opacity");

        public static Texture2D Tex(string res)
        {
            Texture2D t;
            if (textures.TryGetValue(res, out t) && t != null) return t;
            t = Resources.Load<Texture2D>(res);
            if (t == null) throw new InvalidOperationException("Missing druid art " + res);
            textures[res] = t; return t;
        }

        // sy = pixels from the TOP of the texture (canvas convention)
        public static Sprite Rect(string res, int sx, int sy, int w, int h, Vector2 pivot)
        {
            string key = res + ":" + sx + ":" + sy + ":" + w + ":" + h + ":" + pivot.x + ":" + pivot.y;
            Sprite s; if (sprites.TryGetValue(key, out s) && s != null) return s;
            var t = Tex(res);
            s = Sprite.Create(t, new Rect(sx, t.height - sy - h, w, h), pivot, 100, 0, SpriteMeshType.FullRect);
            sprites[key] = s; return s;
        }

        // game.html _drawDruidBoss: sx=round(col*iw/cols), cw=round((col+1)*iw/cols)-sx
        public static Sprite SheetCell(string res, int cols, int rows, int col, int row, Vector2 pivot)
        {
            var t = Tex(res); int iw = t.width, ih = t.height;
            int sx = Mathf.RoundToInt((float)Math.Round(col * (double)iw / cols, MidpointRounding.AwayFromZero)), sy = Mathf.RoundToInt((float)Math.Round(row * (double)ih / rows, MidpointRounding.AwayFromZero));
            int cw = (int)Math.Round((col + 1) * (double)iw / cols, MidpointRounding.AwayFromZero) - sx, ch = (int)Math.Round((row + 1) * (double)ih / rows, MidpointRounding.AwayFromZero) - sy;
            return Rect(res, sx, sy, cw, ch, pivot);
        }

        public static Sprite ClipFrame(string res, int cols, int rows, int frame, int inset = 1)
        {
            var t = Tex(res); int cw = t.width / cols, ch = t.height / rows;
            return Rect(res, frame % cols * cw + inset, frame / cols * ch + inset, cw - inset * 2, ch - inset * 2, new Vector2(.5f, .5f));
        }

        public static Material Additive
        {
            get
            {
                if (additive == null) additive = new Material(Resources.Load<Shader>("Shaders/KiSlashAdditive"));   // Blend One One, rgb*a*_Opacity = canvas 'lighter'
                return additive;
            }
        }

        // game.html _druidSinkCell: the emerge sheet is cut in straight lines, so each cell is sampled 3 px inside and its four edges fade out over 9 % of the height.
        public static Sprite EmergeCell(int frame)
        {
            string key = "emergeCell:" + frame;
            Sprite s; if (sprites.TryGetValue(key, out s) && s != null) return s;
            var t = Tex(BodyDir + "emerge"); const int cols = 4, rows = 2, inset = 3;
            int iw = t.width, ih = t.height, fc = frame % cols, fr = frame / cols;
            int sx = (int)Math.Round(fc * (double)iw / cols, MidpointRounding.AwayFromZero), sy = (int)Math.Round(fr * (double)ih / rows, MidpointRounding.AwayFromZero);
            int cw = (int)Math.Round((fc + 1) * (double)iw / cols, MidpointRounding.AwayFromZero) - sx, ch = (int)Math.Round((fr + 1) * (double)ih / rows, MidpointRounding.AwayFromZero) - sy;
            int W = cw - inset * 2, H = ch - inset * 2, F = Mathf.Max(1, Mathf.RoundToInt(H * .09f));
            var src = t.GetPixels32();   // emerge.png is imported readable
            var px = new Color32[W * H];
            for (int y = 0; y < H; y++)
            {
                float fy = Mathf.Min(1f, Mathf.Min(y, H - 1 - y) / (float)F);
                int srcRow = t.height - 1 - (sy + inset + y);   // top-down row -> texture row
                for (int x = 0; x < W; x++)
                {
                    float fx = Mathf.Min(1f, Mathf.Min(x, W - 1 - x) / (float)F);
                    var c = src[srcRow * iw + sx + inset + x];
                    c.a = (byte)Mathf.RoundToInt(c.a * fx * fy);
                    px[(H - 1 - y) * W + x] = c;
                }
            }
            var cell = new Texture2D(W, H, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            cell.SetPixels32(px); cell.Apply(false, true);
            s = Sprite.Create(cell, new Rect(0, 0, W, H), new Vector2(.5f, .14f), 100, 0, SpriteMeshType.FullRect);
            sprites[key] = s; return s;
        }

        // _druidPoisonFly: proj_firedevil_orb.png (4x4, 16 frames) turned grey, multiplied by #66dd22, original alpha kept
        public static Sprite PoisonShot(int frame)
        {
            string key = "poisonShot:" + frame;
            Sprite s; if (sprites.TryGetValue(key, out s) && s != null) return s;
            var t = Tex(VfxDir + "proj_firedevil_orb"); int cw = t.width / 4, ch = t.height / 4;
            var src = t.GetPixels32(); var px = new Color32[cw * ch];
            int ox = frame % 4 * cw, oy = (3 - frame / 4) * ch;
            for (int y = 0; y < ch; y++) for (int x = 0; x < cw; x++)
            {
                var c = src[(oy + y) * t.width + ox + x];
                float g = (c.r * .299f + c.g * .587f + c.b * .114f) / 255f;   // canvas filter grayscale(1) uses the same luma weights
                px[y * cw + x] = new Color32((byte)Mathf.RoundToInt(g * 0x66), (byte)Mathf.RoundToInt(g * 0xdd), (byte)Mathf.RoundToInt(g * 0x22), c.a);
            }
            var cell = new Texture2D(cw, ch, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            cell.SetPixels32(px); cell.Apply(false, true);
            s = Sprite.Create(cell, new Rect(0, 0, cw, ch), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            sprites[key] = s; return s;
        }

        // 반사 불가 구체의 광택 흑요석 표현. 기존 프레임 시계·그리기 크기를 그대로 소비한다.
        public static Sprite DeepBlackOrb(int frame)
        {
            frame = (frame % 16 + 16) % 16;
            string key = "deepBlackOrb:" + frame;
            Sprite s; if (sprites.TryGetValue(key, out s) && s != null) return s;
            const int n = 128;
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                byte r, g, b, a;
                DruidProjectileAppearance.Pixel((x + .5) * 2 / n - 1, (y + .5) * 2 / n - 1, frame, out r, out g, out b, out a);
                px[y * n + x] = new Color32(r, g, b, a);
            }
            var cell = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            cell.SetPixels32(px); cell.Apply(false, true);
            s = Sprite.Create(cell, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            sprites[key] = s; return s;
        }

        // the corruption ring with its inside blanked (_drawDruidGroundRing innerFraction clip: only the band inner..1 of the radius stays)
        public static Sprite RingBand(float inner)
        {
            string key = "ringBand:" + inner;
            Sprite s; if (sprites.TryGetValue(key, out s) && s != null) return s;
            var t = Tex(VfxDir + "druid_corruption_ring"); int n = t.width;
            var px = t.GetPixels32(); float R = n / 2f, r0 = R * inner;
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = x + .5f - R, dy = y + .5f - R;
                if (dx * dx + dy * dy < r0 * r0) px[y * n + x].a = 0;
            }
            var cell = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            cell.SetPixels32(px); cell.Apply(false, true);
            s = Sprite.Create(cell, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            sprites[key] = s; return s;
        }

        public static Sprite Ring { get { return Rect(VfxDir + "druid_corruption_ring", 0, 0, Tex(VfxDir + "druid_corruption_ring").width, Tex(VfxDir + "druid_corruption_ring").height, new Vector2(.5f, .5f)); } }
    }
}
