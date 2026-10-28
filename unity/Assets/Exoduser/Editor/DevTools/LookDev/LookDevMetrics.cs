using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;
#if UNITY_EDITOR
using UnityEngine;
#endif

// DT-03 LookDev 지표 코어.
// 정의의 정답은 E:\exoduser-wt\_out\rm0-light\measure_L.py / lum.py (맵 총괄 확인). 아래 UnityEngine 의존이 없는 코어(LookDevRaw, LookDevPng, LookDevMetricsCore)는
// csc 하나로 컴파일해서 파이썬 결과와 나란히 비교할 수 있게 일부러 Unity와 분리해 두었다(맨 아래 #if UNITY_EDITOR 어댑터만 Unity 의존).
//
// 정의 (모두 sRGB 값 기준, 선형 변환 없음):
//   luma255   = (0.2126 R + 0.7152 G + 0.0722 B) * 255          (R,G,B 는 0~1)
//   median    = numpy.median (짝수 개면 가운데 둘의 평균)
//   quantile  = numpy.quantile 기본(선형 보간, pos = q*(n-1))
//   sat       = max>1e-6 ? (max-min)/max : 0
//   hue       = measure_L.hue_deg (d = max-min+1e-9, 무채색은 0도로 센다)   평균 = 원형 평균 (atan2(mean sin, mean cos))
//   dilation  = scipy.ndimage.binary_dilation(iterations=6) = 4방향 팽창 6회 (마름모 반경 6)
//   mask      = PNG 의 R/255 > 0.95  (= 바이트 >= 243)
namespace Exoduser.DevTools.LookDev
{
    /// <summary>8비트 RGB 이미지 (맨 윗줄부터, PNG 와 같은 순서).</summary>
    public sealed class LookDevRaw
    {
        public int Width, Height;
        public byte[] Rgb; // Width*Height*3

        public LookDevRaw(int w, int h) { Width = w; Height = h; Rgb = new byte[w * h * 3]; }
        public LookDevRaw(int w, int h, byte[] rgb) { Width = w; Height = h; Rgb = rgb; }

        public double R(int x, int y) { return Rgb[(y * Width + x) * 3] / 255.0; }
        public double G(int x, int y) { return Rgb[(y * Width + x) * 3 + 1] / 255.0; }
        public double B(int x, int y) { return Rgb[(y * Width + x) * 3 + 2] / 255.0; }
        public double Luma255(int x, int y)
        {
            int i = (y * Width + x) * 3;
            return (0.2126 * (Rgb[i] / 255.0) + 0.7152 * (Rgb[i + 1] / 255.0) + 0.0722 * (Rgb[i + 2] / 255.0)) * 255.0;
        }
    }

    /// <summary>최소 PNG 디코더 (8비트 RGB/RGBA/그레이, 비인터레이스). 우리 캡처·마스크 PNG 용.</summary>
    public static class LookDevPng
    {
        public static LookDevRaw Load(string path) { return Decode(File.ReadAllBytes(path)); }

        public static LookDevRaw Decode(byte[] png)
        {
            if (png.Length < 33 || png[0] != 0x89 || png[1] != 0x50 || png[2] != 0x4E || png[3] != 0x47) throw new InvalidDataException("not a PNG");
            int p = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
            var idat = new MemoryStream();
            while (p + 8 <= png.Length)
            {
                int len = (png[p] << 24) | (png[p + 1] << 16) | (png[p + 2] << 8) | png[p + 3];
                string type = Encoding.ASCII.GetString(png, p + 4, 4);
                int d = p + 8;
                if (type == "IHDR")
                {
                    w = (png[d] << 24) | (png[d + 1] << 16) | (png[d + 2] << 8) | png[d + 3];
                    h = (png[d + 4] << 24) | (png[d + 5] << 16) | (png[d + 6] << 8) | png[d + 7];
                    bitDepth = png[d + 8]; colorType = png[d + 9]; interlace = png[d + 12];
                }
                else if (type == "IDAT") idat.Write(png, d, len);
                else if (type == "IEND") break;
                p = d + len + 4;
            }
            if (bitDepth != 8 || interlace != 0 || (colorType != 2 && colorType != 6 && colorType != 0)) throw new NotSupportedException("PNG: only 8-bit non-interlaced gray/RGB/RGBA (bitDepth=" + bitDepth + " colorType=" + colorType + " interlace=" + interlace + ")");
            int bpp = colorType == 2 ? 3 : colorType == 6 ? 4 : 1;
            int stride = w * bpp;
            var raw = new byte[(stride + 1) * h];
            idat.Position = 2; // zlib 헤더 2바이트 건너뜀
            using (var ds = new DeflateStream(idat, CompressionMode.Decompress))
            {
                int got = 0;
                while (got < raw.Length) { int n = ds.Read(raw, got, raw.Length - got); if (n <= 0) break; got += n; }
                if (got < raw.Length) throw new InvalidDataException("PNG: truncated data");
            }
            var cur = new byte[stride]; var prev = new byte[stride];
            var img = new LookDevRaw(w, h);
            for (int y = 0; y < h; y++)
            {
                int f = raw[y * (stride + 1)];
                Buffer.BlockCopy(raw, y * (stride + 1) + 1, cur, 0, stride);
                for (int i = 0; i < stride; i++)
                {
                    int a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0, x = cur[i];
                    switch (f)
                    {
                        case 1: x += a; break;
                        case 2: x += b; break;
                        case 3: x += (a + b) >> 1; break;
                        case 4:
                            {
                                int pp = a + b - c, pa = Math.Abs(pp - a), pb = Math.Abs(pp - b), pc = Math.Abs(pp - c);
                                x += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); break;
                            }
                    }
                    cur[i] = (byte)x;
                }
                for (int xx = 0; xx < w; xx++)
                {
                    int o = (y * w + xx) * 3;
                    if (bpp == 1) { img.Rgb[o] = img.Rgb[o + 1] = img.Rgb[o + 2] = cur[xx]; }
                    else { img.Rgb[o] = cur[xx * bpp]; img.Rgb[o + 1] = cur[xx * bpp + 1]; img.Rgb[o + 2] = cur[xx * bpp + 2]; }
                }
                var t = prev; prev = cur; cur = t;
            }
            return img;
        }
    }

    /// <summary>비교판 1x 크롭 영역 (픽셀). Unity 직렬화용.</summary>
    [Serializable] public struct LookDevCrop { public int x, y, w, h; public LookDevCrop(int x, int y, int w, int h) { this.x = x; this.y = y; this.w = w; this.h = h; } }

    /// <summary>가로세로 사각형 (픽셀).</summary>
    public struct LookDevRect
    {
        public int X, Y, W, H;
        public LookDevRect(int x, int y, int w, int h) { X = x; Y = y; W = w; H = h; }
    }

    public sealed class PatchResult
    {
        public string Name;
        public double LumaMedian;     // 패치 안 luma255 의 중앙값
        public double RG;             // 채널별 중앙값 R / max(G,1e-4)   (measure_L: sandbox_floor_RG)
        public bool BLeG;             // 채널별 중앙값 B <= G + 1e-6
        public double MedR, MedG, MedB; // 0~1
    }

    public static class LookDevMetricsCore
    {
        // ------------------------------------------------------------------ 통계 도구
        public static double Median(List<double> v)
        {
            if (v.Count == 0) return double.NaN;
            var a = v.ToArray(); Array.Sort(a);
            int n = a.Length; return (n & 1) == 1 ? a[n / 2] : (a[n / 2 - 1] + a[n / 2]) * 0.5;
        }

        public static double Quantile(double[] sorted, double q)
        {
            int n = sorted.Length; if (n == 0) return double.NaN;
            double pos = q * (n - 1); int lo = (int)Math.Floor(pos); int hi = Math.Min(lo + 1, n - 1); double fr = pos - lo;
            return sorted[lo] + (sorted[hi] - sorted[lo]) * fr;
        }

        public static double Sat(double r, double g, double b)
        {
            double mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
            return mx > 1e-6 ? (mx - mn) / mx : 0.0;
        }

        public static double HueDeg(double r, double g, double b)
        {
            double mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b)); double d = mx - mn + 1e-9; double h;
            if (mx == r) { double t = (g - b) / d; t %= 6.0; if (t < 0) t += 6.0; h = t; }
            else if (mx == g) h = (b - r) / d + 2.0;
            else h = (r - g) / d + 4.0;
            h *= 60.0; h %= 360.0; if (h < 0) h += 360.0; return h;
        }

        public static double CircMeanDeg(List<double> hues)
        {
            if (hues.Count == 0) return double.NaN;
            double s = 0, c = 0;
            for (int i = 0; i < hues.Count; i++) { double a = hues[i] * Math.PI / 180.0; s += Math.Sin(a); c += Math.Cos(a); }
            s /= hues.Count; c /= hues.Count;
            double deg = Math.Atan2(s, c) * 180.0 / Math.PI; deg %= 360.0; if (deg < 0) deg += 360.0; return deg;
        }

        /// <summary>scipy.ndimage.binary_dilation(mask, iterations=n): 4방향 구조 요소.</summary>
        public static bool[] Dilate(bool[] m, int w, int h, int iterations)
        {
            var cur = (bool[])m.Clone();
            for (int it = 0; it < iterations; it++)
            {
                var nxt = (bool[])cur.Clone();
                for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
                    {
                        if (!cur[y * w + x]) continue;
                        if (x > 0) nxt[y * w + x - 1] = true; if (x < w - 1) nxt[y * w + x + 1] = true;
                        if (y > 0) nxt[(y - 1) * w + x] = true; if (y < h - 1) nxt[(y + 1) * w + x] = true;
                    }
                cur = nxt;
            }
            return cur;
        }

        /// <summary>마스크 PNG → bool 배열 (R/255 > 0.95).</summary>
        public static bool[] MaskFromRaw(LookDevRaw m)
        {
            var r = new bool[m.Width * m.Height];
            for (int i = 0; i < r.Length; i++) r[i] = m.Rgb[i * 3] / 255.0 > 0.95;
            return r;
        }

        // ------------------------------------------------------------------ 화면 전체 지표
        /// <summary>measure_L: r['screen_median'] — 전체 프레임 luma255 중앙값.</summary>
        public static double ScreenMedian(LookDevRaw img)
        {
            var l = new List<double>(img.Width * img.Height);
            for (int y = 0; y < img.Height; y++) for (int x = 0; x < img.Width; x++) l.Add(img.Luma255(x, y));
            return Median(l);
        }

        /// <summary>32구간 luma 히스토그램 (구간 = luma255/8, 0~31).</summary>
        public static int[] Histogram32(LookDevRaw img)
        {
            var hist = new int[32];
            for (int y = 0; y < img.Height; y++) for (int x = 0; x < img.Width; x++) { int b = (int)(img.Luma255(x, y) / 8.0); if (b > 31) b = 31; if (b < 0) b = 0; hist[b]++; }
            return hist;
        }

        // ------------------------------------------------------------------ 패치
        /// <summary>measure_L 패치 정의: 사각형 (프리셋이 좌표를 가짐). 경계 밖은 잘라낸다.</summary>
        public static PatchResult Patch(LookDevRaw img, string name, LookDevRect rc)
        {
            int x0 = Math.Max(0, rc.X), y0 = Math.Max(0, rc.Y), x1 = Math.Min(img.Width, rc.X + rc.W), y1 = Math.Min(img.Height, rc.Y + rc.H);
            var r = new List<double>(); var g = new List<double>(); var b = new List<double>(); var l = new List<double>();
            for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) { r.Add(img.R(x, y)); g.Add(img.G(x, y)); b.Add(img.B(x, y)); l.Add(img.Luma255(x, y)); }
            var pr = new PatchResult { Name = name };
            if (r.Count == 0) { pr.LumaMedian = double.NaN; pr.RG = double.NaN; return pr; }
            pr.MedR = Median(r); pr.MedG = Median(g); pr.MedB = Median(b);
            pr.RG = pr.MedR / Math.Max(pr.MedG, 1e-4); pr.BLeG = pr.MedB <= pr.MedG + 1e-6; pr.LumaMedian = Median(l);
            return pr;
        }

        /// <summary>measure_L: sandbox_floor_* 의 3패치 정의(폭·높이 비율 + 120x90). 프리셋 기본값으로 쓴다.</summary>
        public static LookDevRect FracPatch(int w, int h, double fx, double fy, int pw, int ph)
        {
            return new LookDevRect((int)(w * fx), (int)(h * fy), pw, ph);
        }

        // ------------------------------------------------------------------ 영역(마스크) 지표 — 영역 sel == null 이면 프레임 전체
        /// <summary>휘도(0~1, 가중합) 상위 (1-q) 픽셀 평균 HSV 채도. measure_L blade_sat_top5 (q=0.95, 행 범위+마스크가 sel).</summary>
        public static double TopLumaSat(LookDevRaw img, bool[] sel, double q, out int count)
        {
            var vals = new List<double>(); var idx = new List<int>();
            for (int y = 0; y < img.Height; y++) for (int x = 0; x < img.Width; x++)
                {
                    int i = y * img.Width + x; if (sel != null && !sel[i]) continue;
                    vals.Add(0.2126 * img.R(x, y) + 0.7152 * img.G(x, y) + 0.0722 * img.B(x, y)); idx.Add(i);
                }
            count = 0; if (vals.Count == 0) return double.NaN;
            var sorted = vals.ToArray(); Array.Sort(sorted); double thr = Quantile(sorted, q);
            double sum = 0; int n = 0;
            for (int k = 0; k < vals.Count; k++)
            {
                if (vals[k] < thr) continue; int i = idx[k]; int x = i % img.Width, y = i / img.Width;
                sum += Sat(img.R(x, y), img.G(x, y), img.B(x, y)); n++;
            }
            count = n; return n > 0 ? sum / n : double.NaN;
        }

        /// <summary>luma255 상위 (1-q) 픽셀의 색상각 원형 평균. measure_L pool_floor_hue_deg (q=0.70). meanLuma 는 같은 픽셀 luma255 평균(pool_floor_luma_top30).</summary>
        public static double TopLumaHue(LookDevRaw img, bool[] sel, double q, out double meanLuma, out int count)
        {
            var vals = new List<double>(); var idx = new List<int>();
            for (int y = 0; y < img.Height; y++) for (int x = 0; x < img.Width; x++)
                {
                    int i = y * img.Width + x; if (sel != null && !sel[i]) continue;
                    vals.Add(img.Luma255(x, y)); idx.Add(i);
                }
            meanLuma = double.NaN; count = 0; if (vals.Count == 0) return double.NaN;
            var sorted = vals.ToArray(); Array.Sort(sorted); double thr = Quantile(sorted, q);
            var hues = new List<double>(); double ls = 0;
            for (int k = 0; k < vals.Count; k++)
            {
                if (vals[k] < thr) continue; int i = idx[k]; int x = i % img.Width, y = i / img.Width;
                hues.Add(HueDeg(img.R(x, y), img.G(x, y), img.B(x, y))); ls += vals[k];
            }
            count = hues.Count; meanLuma = ls / Math.Max(1, hues.Count); return CircMeanDeg(hues);
        }

        // ------------------------------------------------------------------ measure_L.py 와 같은 캐릭터 샷 지표 (마스크 PNG 필요)
        /// <summary>weapon_scale 샷의 바닥 luma 중앙값: 마스크 팽창 6 바깥, 아래 30 % 만. (char_floor_luma_median)</summary>
        public static double CharFloorLumaMedian(LookDevRaw img, LookDevRaw mask)
        {
            var m = MaskFromRaw(mask); var d = Dilate(m, img.Width, img.Height, 6);
            int top = (int)(img.Height * 0.70); var l = new List<double>();
            for (int y = top; y < img.Height; y++) for (int x = 0; x < img.Width; x++) if (!d[y * img.Width + x]) l.Add(img.Luma255(x, y));
            return Median(l);
        }

        /// <summary>가슴 점 중심 60x60 박스 안 캐릭터 픽셀의 R/G 중앙값. (armor_RG)</summary>
        public static double ArmorRG(LookDevRaw img, LookDevRaw mask, double chestX, double chestY)
        {
            var m = MaskFromRaw(mask); int cx = (int)chestX, cy = (int)chestY; var v = new List<double>();
            for (int y = Math.Max(0, cy - 30); y < Math.Min(img.Height, cy + 30); y++)
                for (int x = Math.Max(0, cx - 30); x < Math.Min(img.Width, cx + 30); x++)
                    if (m[y * img.Width + x]) v.Add(img.R(x, y) / Math.Max(img.G(x, y), 1e-4));
            return Median(v);
        }

        /// <summary>날 구간 행 y0..y1(포함) 안 캐릭터 픽셀의 휘도 상위 5 % 평균 채도. (blade_sat_top5)</summary>
        public static double BladeSatTop5(LookDevRaw img, LookDevRaw mask, double y0, double y1)
        {
            var m = MaskFromRaw(mask); var sel = new bool[m.Length];
            int a = (int)y0, b = (int)y1;
            for (int y = Math.Max(0, a); y <= Math.Min(img.Height - 1, b); y++) for (int x = 0; x < img.Width; x++) sel[y * img.Width + x] = m[y * img.Width + x];
            int n; return TopLumaSat(img, sel, 0.95, out n);
        }

        /// <summary>웅덩이 안 샷: 캐릭터 바깥(팽창 6), 위 45 % 제외 영역에서 밝기 상위 30 % 의 색상각(원형 평균). (pool_floor_hue_deg, pool_floor_luma_top30, pool_in_floor_luma_median)</summary>
        public static double PoolFloorHue(LookDevRaw img, LookDevRaw mask, out double top30Luma, out double regionLumaMedian)
        {
            var m = MaskFromRaw(mask); var d = Dilate(m, img.Width, img.Height, 6);
            var reg = new bool[d.Length]; int top = (int)(img.Height * 0.45); var l = new List<double>();
            for (int y = top; y < img.Height; y++) for (int x = 0; x < img.Width; x++) { int i = y * img.Width + x; if (!d[i]) { reg[i] = true; l.Add(img.Luma255(x, y)); } }
            regionLumaMedian = Median(l); int n; return TopLumaHue(img, reg, 0.70, out top30Luma, out n);
        }

        // ------------------------------------------------------------------ 기준 비교용: 이미지 리샘플 / 보조
        public static LookDevRaw ResizeBilinear(LookDevRaw src, int w, int h)
        {
            if (src.Width == w && src.Height == h) return src;
            var dst = new LookDevRaw(w, h);
            for (int y = 0; y < h; y++)
            {
                double fy = (y + 0.5) * src.Height / h - 0.5; int y0 = (int)Math.Floor(fy); double ty = fy - y0; int ya = Math.Max(0, Math.Min(src.Height - 1, y0)), yb = Math.Max(0, Math.Min(src.Height - 1, y0 + 1));
                for (int x = 0; x < w; x++)
                {
                    double fx = (x + 0.5) * src.Width / w - 0.5; int x0 = (int)Math.Floor(fx); double tx = fx - x0; int xa = Math.Max(0, Math.Min(src.Width - 1, x0)), xb = Math.Max(0, Math.Min(src.Width - 1, x0 + 1));
                    for (int c = 0; c < 3; c++)
                    {
                        double v00 = src.Rgb[(ya * src.Width + xa) * 3 + c], v10 = src.Rgb[(ya * src.Width + xb) * 3 + c], v01 = src.Rgb[(yb * src.Width + xa) * 3 + c], v11 = src.Rgb[(yb * src.Width + xb) * 3 + c];
                        double v = (v00 * (1 - tx) + v10 * tx) * (1 - ty) + (v01 * (1 - tx) + v11 * tx) * ty;
                        dst.Rgb[(y * w + x) * 3 + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(v)));
                    }
                }
            }
            return dst;
        }
    }

#if UNITY_EDITOR
    /// <summary>Unity 텍스처/렌더 결과 → 코어 입력 변환.</summary>
    public static class LookDevMetrics
    {
        public static LookDevRaw FromTexture(Texture2D tex)
        {
            var px = tex.GetPixels32(); int w = tex.width, h = tex.height; var raw = new LookDevRaw(w, h);
            for (int y = 0; y < h; y++)
            {
                int srcRow = (h - 1 - y) * w; // Unity 는 아랫줄부터 → 윗줄부터로 뒤집는다
                for (int x = 0; x < w; x++) { var c = px[srcRow + x]; int o = (y * w + x) * 3; raw.Rgb[o] = c.r; raw.Rgb[o + 1] = c.g; raw.Rgb[o + 2] = c.b; }
            }
            return raw;
        }

        public static LookDevRaw FromPngBytes(byte[] png) { return LookDevPng.Decode(png); }
        public static LookDevRaw FromPngFile(string path) { return LookDevPng.Load(path); }
    }
#endif
}
