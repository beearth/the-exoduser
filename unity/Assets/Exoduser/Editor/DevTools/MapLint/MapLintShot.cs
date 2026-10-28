using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

// 탑뷰 정사영 PNG. 걷기 칸 초록, 메시 발자국 회색, 덮임 빨강, 쐐기 실패 주황, 원점 쌓임 보라, NavMesh 차이 노랑, 안 보이는 막힌 섬 하늘색.
// 렌더러 없이 CPU 로 직접 그린다(batchmode 에서도 동작). 글자는 3x5 비트맵 글꼴(영문 대문자·숫자).
namespace Exoduser.DevTools.MapLint
{
    public sealed class ShotCanvas
    {
        public readonly int W, H, scale, mapW, mapH, x0, y0, x1, y1;
        readonly float T; readonly Color32[] px;
        const int LegendW = 980;

        public ShotCanvas(MapLintProfile p)
        {
            p.Window(out x0, out y0, out x1, out y1); T = p.tileSize;
            int tw = x1 - x0, th = y1 - y0;
            scale = Mathf.Max(2, Mathf.Min((p.shotMaxW - LegendW) / Mathf.Max(1, tw), p.shotMaxH / Mathf.Max(1, th)));
            mapW = tw * scale; mapH = th * scale; W = Mathf.Min(p.shotMaxW, mapW + LegendW); H = Mathf.Max(mapH, 640);
            if (H > p.shotMaxH) H = p.shotMaxH; if (W > p.shotMaxW) W = p.shotMaxW;
            px = new Color32[W * H]; var bg = new Color32(14, 12, 12, 255); for (int i = 0; i < px.Length; i++) px[i] = bg;
        }

        void Set(int col, int row, Color32 c, float a)   // row 0 = 위(북쪽)
        {
            if (col < 0 || row < 0 || col >= W || row >= H) return;
            int i = (H - 1 - row) * W + col;
            if (a >= 0.999f) { px[i] = c; return; }
            var o = px[i]; px[i] = new Color32((byte)(o.r + (c.r - o.r) * a), (byte)(o.g + (c.g - o.g) * a), (byte)(o.b + (c.b - o.b) * a), 255);
        }
        void Rect(int c0, int r0, int c1, int r1, Color32 c, float a) { for (int r = r0; r < r1; r++) for (int cc = c0; cc < c1; cc++) Set(cc, r, c, a); }
        void Frame(int c0, int r0, int c1, int r1, Color32 c, int t) { Rect(c0, r0, c1, r0 + t, c, 1); Rect(c0, r1 - t, c1, r1, c, 1); Rect(c0, r0, c0 + t, r1, c, 1); Rect(c1 - t, r0, c1, r1, c, 1); }
        Vector2 ToPx(float wx, float wz) { return new Vector2((wx / T - x0) * scale, (-wz / T - y0) * scale); }

        public void Base(bool[,] walk)
        {
            var blocked = new Color32(30, 22, 22, 255); var walkC = new Color32(34, 92, 48, 255);
            for (int ty = y0; ty < y1; ty++) for (int tx = x0; tx < x1; tx++)
                    Rect((tx - x0) * scale, (ty - y0) * scale, (tx - x0 + 1) * scale, (ty - y0 + 1) * scale, walk[tx, ty] ? walkC : blocked, 1f);
        }

        public void PaintTri(Vector3 a, Vector3 b, Vector3 c)
        {
            var pa = ToPx(a.x, a.z); var pb = ToPx(b.x, b.z); var pc = ToPx(c.x, c.z);
            int c0 = Mathf.Max(0, Mathf.FloorToInt(Mathf.Min(pa.x, Mathf.Min(pb.x, pc.x)))), c1 = Mathf.Min(mapW - 1, Mathf.CeilToInt(Mathf.Max(pa.x, Mathf.Max(pb.x, pc.x))));
            int r0 = Mathf.Max(0, Mathf.FloorToInt(Mathf.Min(pa.y, Mathf.Min(pb.y, pc.y)))), r1 = Mathf.Min(mapH - 1, Mathf.CeilToInt(Mathf.Max(pa.y, Mathf.Max(pb.y, pc.y))));
            if (c0 > c1 || r0 > r1) return;
            float den = (pb.y - pc.y) * (pa.x - pc.x) + (pc.x - pb.x) * (pa.y - pc.y); if (Mathf.Abs(den) < 1e-6f) return; float inv = 1f / den;
            var gray = new Color32(120, 118, 124, 255);
            for (int r = r0; r <= r1; r++) for (int col = c0; col <= c1; col++)
                {
                    float x = col + .5f, y = r + .5f;
                    float l1 = ((pb.y - pc.y) * (x - pc.x) + (pc.x - pb.x) * (y - pc.y)) * inv, l2 = ((pc.y - pa.y) * (x - pc.x) + (pa.x - pc.x) * (y - pc.y)) * inv, l3 = 1f - l1 - l2;
                    if (l1 >= 0 && l2 >= 0 && l3 >= 0) Set(col, r, gray, 0.8f);
                }
        }

        public void Overlay(MapLintResult res)
        {
            var red = new Color32(255, 40, 40, 255); var orange = new Color32(255, 150, 20, 255); var purple = new Color32(200, 90, 255, 255);
            var yellow = new Color32(255, 230, 50, 255); var cyan = new Color32(60, 220, 255, 255); var green = new Color32(34, 92, 48, 255);
            foreach (var t in res.uncoveredIslandTiles) Rect((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, cyan, 0.85f);
            foreach (var t in res.coveredCentre) Rect((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, red, 0.95f);
            foreach (var t in res.navCoreOnly) Frame((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, yellow, Mathf.Max(1, scale / 6));
            foreach (var t in res.navNavOnly) Frame((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, yellow, Mathf.Max(1, scale / 6));
            foreach (var w in res.wedges)
            {
                if (w.pass) continue;
                var a = ToPx(w.b.min.x, w.b.max.z); var b = ToPx(w.b.max.x, w.b.min.z);
                int c0 = Mathf.RoundToInt(a.x), r0 = Mathf.RoundToInt(a.y), c1 = Mathf.RoundToInt(b.x), r1 = Mathf.RoundToInt(b.y);
                if (c1 - c0 < 3) c1 = c0 + 3; if (r1 - r0 < 3) r1 = r0 + 3;
                Rect(c0, r0, c1, r1, orange, 0.35f); Frame(c0, r0, c1, r1, orange, 2);
            }
            foreach (var o in res.originPts)
            {
                var q = ToPx(o.x, o.z); int cx = Mathf.RoundToInt(q.x), cy = Mathf.RoundToInt(q.y);
                if (cx < -8 || cy < -8 || cx > mapW + 8 || cy > mapH + 8) continue;
                Rect(cx - 7, cy - 1, cx + 8, cy + 2, purple, 1); Rect(cx - 1, cy - 7, cx + 2, cy + 8, purple, 1);
            }
            foreach (var o in res.invisPts) { var q = ToPx(o.x, o.z); int cx = Mathf.RoundToInt(q.x), cy = Mathf.RoundToInt(q.y); Rect(cx - 3, cy - 3, cx + 4, cy + 4, cyan, 1); }
            // 월드 원점 표식(창 안일 때)
            var org = ToPx(0, 0); int ox = Mathf.RoundToInt(org.x), oy = Mathf.RoundToInt(org.y);
            bool originInside = ox >= 0 && oy >= 0 && ox < mapW && oy < mapH;
            if (originInside) { int rr = Mathf.RoundToInt(res.profile.originRadius / T * scale); Frame(ox - rr, oy - rr, ox + rr, oy + rr, purple, 2); }
            DrawLegend(res, green, red, orange, purple, yellow, cyan, originInside);
        }

        void DrawLegend(MapLintResult res, Color32 green, Color32 red, Color32 orange, Color32 purple, Color32 yellow, Color32 cyan, bool originInside)
        {
            int x = mapW + 36, y = 28; var white = new Color32(235, 228, 210, 255); var dim = new Color32(160, 150, 130, 255);
            Text(x, y, "MAPLINT " + Up(res.profile.name), 6, white); y += 52;
            Text(x, y, Up(Path.GetFileNameWithoutExtension(res.scene)), 4, dim); y += 34;
            Text(x, y, "HEAD " + (res.headSha.Length >= 7 ? res.headSha.Substring(0, 7) : res.headSha) + "  " + res.durMs + " MS", 4, dim); y += 54;
            Func<string, CheckResult> g = id => res.Get(id);
            Func<CheckResult, string, string> ex = (c, k) => { if (c == null) return "?"; foreach (var kv in c.extra) if (kv.Key == k) return kv.Value; return "?"; };
            Swatch(x, y, green); Text(x + 60, y, "WALK TILE", 4, white); y += 46;
            Swatch(x, y, new Color32(120, 118, 124, 255)); Text(x + 60, y, "MESH FOOTPRINT ABOVE TOL", 4, white); y += 46;
            Swatch(x, y, red); Text(x + 60, y, "L1 COVERED CENTRE " + ex(g("L1"), "centre") + " DEEP " + ex(g("L1"), "deep05"), 4, white); y += 46;
            Swatch(x, y, orange); Text(x + 60, y, "L4 WEDGE FAIL " + (g("L4") != null ? g("L4").count.ToString() : "?"), 4, white); y += 46;
            Swatch(x, y, purple); Text(x + 60, y, "L6 ORIGIN PILE A " + ex(g("L6"), "a_boundsNearOrigin") + " B " + ex(g("L6"), "b_childAtOriginParentFar") + " C " + ex(g("L6"), "c_groupBoundsMismatch"), 4, white); y += 46;
            Swatch(x, y, yellow); Text(x + 60, y, "L2 NAV DIFF CORE " + ex(g("L2"), "coreWalkNavNo") + " NAV " + ex(g("L2"), "navWalkCoreNo"), 4, white); y += 46;
            Swatch(x, y, cyan); Text(x + 60, y, "L3 UNCOVERED ISLAND " + ex(g("L3"), "uncoveredAfterFill") + " TILES " + ex(g("L3"), "uncoveredTilesTotal"), 4, white); y += 56;
            foreach (var c in res.checks) { Text(x, y, c.id + (c.id == "L7" ? "  WARN " + c.count : (c.pass ? "  PASS" : "  FAIL ") + (c.pass ? "" : c.count.ToString())), 4, c.pass ? new Color32(120, 220, 130, 255) : red); y += 36; }
            y += 20; Text(x, y, originInside ? "PURPLE BOX = WORLD ORIGIN RADIUS" : "WORLD ORIGIN IS OUTSIDE THIS WINDOW", 3, dim); y += 28;
            Text(x, y, "TOP VIEW  NORTH UP  1 TILE = " + scale + " PX", 3, dim);
        }
        static string Up(string s) { return (s ?? "").ToUpperInvariant(); }
        void Swatch(int x, int y, Color32 c) { Rect(x, y - 2, x + 44, y + 28, c, 1); }

        public void Save(string pngPath)
        {
            var tex = new Texture2D(W, H, TextureFormat.RGBA32, false); tex.SetPixels32(px);
            Directory.CreateDirectory(Path.GetDirectoryName(pngPath)); File.WriteAllBytes(pngPath, tex.EncodeToPNG()); UnityEngine.Object.DestroyImmediate(tex);
        }

        // ---------------------------------------------------------------- 3x5 글꼴
        static readonly Dictionary<char, string> Font = BuildFont();
        static Dictionary<char, string> BuildFont()
        {
            var f = new Dictionary<char, string>();
            void G(char ch, string rows) { f[ch] = rows.Replace("|", ""); }
            G('A', ".#.|#.#|###|#.#|#.#"); G('B', "##.|#.#|##.|#.#|##."); G('C', ".##|#..|#..|#..|.##"); G('D', "##.|#.#|#.#|#.#|##."); G('E', "###|#..|##.|#..|###");
            G('F', "###|#..|##.|#..|#.."); G('G', ".##|#..|#.#|#.#|.##"); G('H', "#.#|#.#|###|#.#|#.#"); G('I', "###|.#.|.#.|.#.|###"); G('J', "..#|..#|..#|#.#|.#.");
            G('K', "#.#|#.#|##.|#.#|#.#"); G('L', "#..|#..|#..|#..|###"); G('M', "#.#|###|###|#.#|#.#"); G('N', "###|#.#|#.#|#.#|#.#"); G('O', ".#.|#.#|#.#|#.#|.#.");
            G('P', "##.|#.#|##.|#..|#.."); G('Q', ".#.|#.#|#.#|##.|.##"); G('R', "##.|#.#|##.|#.#|#.#"); G('S', ".##|#..|.#.|..#|##."); G('T', "###|.#.|.#.|.#.|.#.");
            G('U', "#.#|#.#|#.#|#.#|###"); G('V', "#.#|#.#|#.#|#.#|.#."); G('W', "#.#|#.#|###|###|#.#"); G('X', "#.#|#.#|.#.|#.#|#.#"); G('Y', "#.#|#.#|.#.|.#.|.#.");
            G('Z', "###|..#|.#.|#..|###");
            G('0', "###|#.#|#.#|#.#|###"); G('1', ".#.|##.|.#.|.#.|###"); G('2', "##.|..#|.#.|#..|###"); G('3', "##.|..#|.#.|..#|##."); G('4', "#.#|#.#|###|..#|..#");
            G('5', "###|#..|##.|..#|##."); G('6', ".##|#..|###|#.#|###"); G('7', "###|..#|.#.|.#.|.#."); G('8', "###|#.#|###|#.#|###"); G('9', "###|#.#|###|..#|##.");
            G('.', "...|...|...|...|.#."); G(':', "...|.#.|...|.#.|..."); G('=', "...|###|...|###|..."); G('-', "...|...|###|...|..."); G('(', ".#.|#..|#..|#..|.#."); G(')', ".#.|..#|..#|..#|.#.");
            G('/', "..#|..#|.#.|#..|#.."); G('>', "#..|.#.|..#|.#.|#.."); G('<', "..#|.#.|#..|.#.|..#"); G('_', "...|...|...|...|###"); G('+', "...|.#.|###|.#.|..."); G('[', "##.|#..|#..|#..|##."); G(']', ".##|..#|..#|..#|.##"); G(',', "...|...|...|.#.|#..");
            G(' ', "...|...|...|...|...");
            return f;
        }
        void Text(int x, int y, string s, int sc, Color32 c)
        {
            foreach (char ch0 in s)
            {
                char ch = char.ToUpperInvariant(ch0); string g; if (!Font.TryGetValue(ch, out g)) g = Font['.'];
                for (int r = 0; r < 5; r++) for (int cc = 0; cc < 3; cc++) if (g[r * 3 + cc] == '#') Rect(x + cc * sc, y + r * sc, x + (cc + 1) * sc, y + (r + 1) * sc, c, 1f);
                x += 4 * sc;
            }
        }
    }
}
