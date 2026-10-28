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
        public readonly int W, H, scale, mapW, mapH, x0, y0, x1, y1, top;
        readonly float T; readonly Color32[] px;
        const int LegendW = 980;

        public ShotCanvas(MapLintProfile p)
        {
            p.Window(out x0, out y0, out x1, out y1); T = p.tileSize;
            int tw = x1 - x0, th = y1 - y0;
            top = 120;
            scale = Mathf.Max(2, Mathf.Min((p.shotMaxW - LegendW) / Mathf.Max(1, tw), (p.shotMaxH - top) / Mathf.Max(1, th)));
            mapW = tw * scale; mapH = th * scale; W = Mathf.Min(p.shotMaxW, mapW + LegendW); H = top + Mathf.Max(mapH, 700);
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
        void RectM(int c0, int r0, int c1, int r1, Color32 c, float a) { Rect(c0, r0 + top, c1, r1 + top, c, a); }
        void FrameM(int c0, int r0, int c1, int r1, Color32 c, int t) { Frame(c0, r0 + top, c1, r1 + top, c, t); }
        void LineM(float ax, float ay, float bx, float by, int thick, Color32 c)
        {
            float dx = bx - ax, dy = by - ay; int n = Mathf.Max(1, Mathf.CeilToInt(Mathf.Max(Mathf.Abs(dx), Mathf.Abs(dy))));
            for (int i = 0; i <= n; i++) { int x = Mathf.RoundToInt(ax + dx * i / n), y = Mathf.RoundToInt(ay + dy * i / n); RectM(x - thick / 2, y - thick / 2, x + (thick + 1) / 2, y + (thick + 1) / 2, c, 1f); }
        }
        void Rect(int c0, int r0, int c1, int r1, Color32 c, float a) { for (int r = r0; r < r1; r++) for (int cc = c0; cc < c1; cc++) Set(cc, r, c, a); }
        void Frame(int c0, int r0, int c1, int r1, Color32 c, int t) { Rect(c0, r0, c1, r0 + t, c, 1); Rect(c0, r1 - t, c1, r1, c, 1); Rect(c0, r0, c0 + t, r1, c, 1); Rect(c1 - t, r0, c1, r1, c, 1); }
        Vector2 ToPx(float wx, float wz) { return new Vector2((wx / T - x0) * scale, (-wz / T - y0) * scale); }

        public void Base(bool[,] walk)
        {
            var blocked = new Color32(30, 22, 22, 255); var walkC = new Color32(34, 92, 48, 255);
            for (int ty = y0; ty < y1; ty++) for (int tx = x0; tx < x1; tx++)
                    RectM((tx - x0) * scale, (ty - y0) * scale, (tx - x0 + 1) * scale, (ty - y0 + 1) * scale, walk[tx, ty] ? walkC : blocked, 1f);
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
                    if (l1 >= 0 && l2 >= 0 && l3 >= 0) Set(col, r + top, gray, 0.8f);
                }
        }

        void Disc(int cx, int cy, int r, Color32 c, float a)
        {
            for (int y = Mathf.Max(0, cy - r); y <= Mathf.Min(mapH - 1, cy + r); y++)
            {
                int dy = y - cy; int hw = Mathf.RoundToInt(Mathf.Sqrt(Mathf.Max(0, r * r - dy * dy)));
                RectM(Mathf.Max(0, cx - hw), y, Mathf.Min(mapW, cx + hw + 1), y + 1, c, a);
            }
        }
        void Ring(int cx, int cy, int r, int t, Color32 c)
        {
            for (int y = Mathf.Max(0, cy - r); y <= Mathf.Min(mapH - 1, cy + r); y++)
            {
                int dy = y - cy; int ho = Mathf.RoundToInt(Mathf.Sqrt(Mathf.Max(0, r * r - dy * dy))), hi = r - t > Mathf.Abs(dy) ? Mathf.RoundToInt(Mathf.Sqrt((r - t) * (r - t) - dy * dy)) : 0;
                if (hi == 0) RectM(Mathf.Max(0, cx - ho), y, Mathf.Min(mapW, cx + ho + 1), y + 1, c, 1f);
                else { RectM(Mathf.Max(0, cx - ho), y, Mathf.Max(0, cx - hi), y + 1, c, 1f); RectM(Mathf.Min(mapW, cx + hi + 1), y, Mathf.Min(mapW, cx + ho + 1), y + 1, c, 1f); }
            }
        }

        public void Overlay(MapLintResult res)
        {
            var red = new Color32(255, 40, 40, 255); var orange = new Color32(255, 150, 20, 255); var purple = new Color32(200, 90, 255, 255);
            var yellow = new Color32(255, 230, 50, 255); var cyan = new Color32(60, 220, 255, 255); var green = new Color32(34, 92, 48, 255);
            foreach (var t in res.uncoveredIslandTiles) RectM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, cyan, 0.85f);
            var pink = new Color32(255, 110, 200, 255);
            foreach (var t in res.overheadTiles) FrameM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, pink, Mathf.Max(1, scale / 8));
            foreach (var t in res.overheadViolations) RectM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, pink, 0.8f);
            foreach (var t in res.coveredCentre) RectM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, red, 0.95f);
            foreach (var t in res.navCoreOnly) FrameM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, yellow, Mathf.Max(1, scale / 6));
            foreach (var t in res.navNavOnly) FrameM((t.x - x0) * scale, (t.y - y0) * scale, (t.x - x0 + 1) * scale, (t.y - y0 + 1) * scale, yellow, Mathf.Max(1, scale / 6));
            foreach (var w in res.wedges)
            {
                if (w.pass) continue;
                var a = ToPx(w.b.min.x, w.b.max.z); var b = ToPx(w.b.max.x, w.b.min.z);
                int c0 = Mathf.RoundToInt(a.x), r0 = Mathf.RoundToInt(a.y), c1 = Mathf.RoundToInt(b.x), r1 = Mathf.RoundToInt(b.y);
                if (c1 - c0 < 3) c1 = c0 + 3; if (r1 - r0 < 3) r1 = r0 + 3;
                RectM(c0, r0, c1, r1, orange, 0.35f); FrameM(c0, r0, c1, r1, orange, 2);
            }
            foreach (var o in res.invisPts) { var q = ToPx(o.x, o.z); int cx = Mathf.RoundToInt(q.x), cy = Mathf.RoundToInt(q.y); RectM(cx - 3, cy - 3, cx + 4, cy + 4, cyan, 1); }
            var org = ToPx(0, 0); int ox = Mathf.RoundToInt(org.x), oy = Mathf.RoundToInt(org.y);
            bool originInside = ox >= 0 && oy >= 0 && ox < mapW && oy < mapH;
            int pile = res.originPileCount;
            if (pile > 0)
            {
                // 큰 보라 원(쌓인 개수에 비례) + 화살표, 의도 위치(부모)마다 보라 X
                var bright = new Color32(235, 160, 255, 255);
                foreach (var o in res.intendedPts)
                {
                    var q = ToPx(o.x, o.z); int cx = Mathf.RoundToInt(q.x), cy = Mathf.RoundToInt(q.y);
                    if (cx < -8 || cy < -8 || cx > mapW + 8 || cy > mapH + 8) continue;
                    LineM(cx - 6, cy - 6, cx + 6, cy + 6, 3, bright); LineM(cx - 6, cy + 6, cx + 6, cy - 6, 3, bright);
                }
                int rad = Mathf.Min(Mathf.Min(mapW, mapH) / 2, Mathf.RoundToInt(40f + 14f * Mathf.Sqrt(pile)));
                int tx0 = Mathf.Clamp(ox, 0, mapW - 1), ty0 = Mathf.Clamp(oy, 0, mapH - 1);
                Disc(tx0, ty0, rad, purple, 0.5f); Ring(tx0, ty0, rad, 8, purple);
                float dx = ox >= mapW / 2 ? -1 : 1, dy = oy >= mapH / 2 ? -1 : 1; float inv = 0.70710678f;
                float hx = tx0 + dx * rad * inv, hy = ty0 + dy * rad * inv;           // 화살촉이 닿는 원 둘레 점
                float tx = hx + dx * 260, ty = hy + dy * 260;                           // 화살 꼬리
                LineM(tx, ty, hx, hy, 12, bright);
                LineM(hx, hy, hx + dx * 70, hy + dy * 8, 12, bright); LineM(hx, hy, hx + dx * 8, hy + dy * 70, 12, bright);
                string lab = "ORIGIN PILE " + pile; int lw = lab.Length * 4 * 6;
                int lx = Mathf.Clamp((int)(tx - (dx > 0 ? 0 : lw)), 4, mapW - lw - 4), ly = Mathf.Clamp((int)(ty + (dy > 0 ? 14 : -50)), 4, mapH - 50);
                RectM(lx - 8, ly - 8, lx + lw + 8, ly + 38, new Color32(20, 8, 30, 255), 0.9f); Text(lx, ly + top, lab, 6, bright);
            }
            else foreach (var o in res.originPts)
                {
                    var q = ToPx(o.x, o.z); int cx = Mathf.RoundToInt(q.x), cy = Mathf.RoundToInt(q.y);
                    if (cx < -8 || cy < -8 || cx > mapW + 8 || cy > mapH + 8) continue;
                    RectM(cx - 7, cy - 1, cx + 8, cy + 2, purple, 1); RectM(cx - 1, cy - 7, cx + 2, cy + 8, purple, 1);
                }
            if (originInside) { int rr = Mathf.RoundToInt(res.profile.originRadius / T * scale); FrameM(ox - rr, oy - rr, ox + rr, oy + rr, purple, 2); }
            // 맨 위 경고 띠
            if (pile > 0)
            {
                Rect(0, 0, W, top, new Color32(170, 20, 24, 255), 1f); Rect(0, top - 6, W, top, new Color32(255, 70, 60, 255), 1f);
                Text(24, 14, "ORIGIN PILE DETECTED  " + pile, 9, new Color32(255, 244, 230, 255));
                Text(24, 78, pile + " RENDERERS STACKED AT WORLD ORIGIN  " + res.intendedPts.Count + " INTENDED POSITIONS (X MARKS)", 4, new Color32(255, 214, 200, 255));
            }
            else { Rect(0, 0, W, top, new Color32(20, 46, 28, 255), 1f); Text(24, 40, "NO ORIGIN PILE", 7, new Color32(140, 230, 150, 255)); }
            DrawLegend(res, green, red, orange, purple, yellow, cyan, originInside);
        }

        void DrawLegend(MapLintResult res, Color32 green, Color32 red, Color32 orange, Color32 purple, Color32 yellow, Color32 cyan, bool originInside)
        {
            int x = mapW + 36, y = top + 28; var white = new Color32(235, 228, 210, 255); var dim = new Color32(160, 150, 130, 255);
            Text(x, y, "MAPLINT " + Up(res.profile.name), 6, white); y += 52;
            Text(x, y, Up(Path.GetFileNameWithoutExtension(res.scene)), 4, dim); y += 34;
            Text(x, y, "HEAD " + (res.headSha.Length >= 7 ? res.headSha.Substring(0, 7) : res.headSha) + "  " + res.durMs + " MS", 4, dim); y += 54;
            Func<string, CheckResult> g = id => res.Get(id);
            Func<CheckResult, string, string> ex = (c, k) => { if (c == null) return "?"; foreach (var kv in c.extra) if (kv.Key == k) return kv.Value; return "?"; };
            Swatch(x, y, green); Text(x + 60, y, "WALK TILE", 4, white); y += 46;
            Swatch(x, y, new Color32(120, 118, 124, 255)); Text(x + 60, y, "MESH FOOTPRINT ABOVE TOL", 4, white); y += 46;
            Swatch(x, y, red); Text(x + 60, y, "L1 COVERED CENTRE " + ex(g("L1"), "centre") + " DEEP " + ex(g("L1"), "deep05"), 4, white); y += 46;
            Swatch(x, y, new Color32(255, 110, 200, 255)); Text(x + 60, y, "L1B OVERHEAD " + ex(g("L1b"), "overheadTiles") + " VIOLATING " + ex(g("L1b"), "violatingTiles"), 4, white); y += 46;
            Swatch(x, y, orange); Text(x + 60, y, "L4 WEDGE FAIL " + (g("L4") != null ? g("L4").count.ToString() : "?"), 4, white); y += 46;
            Swatch(x, y, purple); Text(x + 60, y, "L6 ORIGIN PILE A " + ex(g("L6"), "a_boundsNearOrigin") + " B " + ex(g("L6"), "b_childAtOriginParentFar") + " C " + ex(g("L6"), "c_groupBoundsMismatch"), 4, white); y += 46;
            Swatch(x, y, new Color32(235, 160, 255, 255)); Text(x + 60, y, "L6 PILE " + res.originPileCount + "  X = INTENDED POSITION", 4, white); y += 46;
            Swatch(x, y, yellow); Text(x + 60, y, "L2 NAV DIFF CORE " + ex(g("L2"), "coreWalkNavNo") + " NAV " + ex(g("L2"), "navWalkCoreNo"), 4, white); y += 46;
            Swatch(x, y, cyan); Text(x + 60, y, "L3 UNCOVERED ISLAND " + ex(g("L3"), "uncoveredAfterFill") + " TILES " + ex(g("L3"), "uncoveredTilesTotal"), 4, white); y += 56;
            foreach (var c in res.checks) { Text(x, y, c.id + (c.id == "L7" ? "  WARN " + c.count : (c.pass ? "  PASS" : "  FAIL ") + (c.pass ? "" : c.count.ToString())), 4, c.pass ? new Color32(120, 220, 130, 255) : red); y += 36; }
            y += 20; Text(x, y, res.originPileCount > 0 ? "PURPLE CIRCLE = WORLD ORIGIN PILE (SIZE = COUNT)  X = INTENDED POSITION" : (originInside ? "PURPLE SQUARE = WORLD ORIGIN RADIUS" : "WORLD ORIGIN IS OUTSIDE THIS WINDOW"), 3, dim); y += 28;
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
