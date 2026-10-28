using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;

// DT-03 비교판: 기준 PNG | Unity PNG 나란히 + 각 1x(원본 픽셀) 크롭 2곳 + 지표 숫자/히스토그램.
// UnityEngine 의존이 없어 Unity 밖(csc 하네스)에서도 만들 수 있다.
//
// 레이아웃 (폭 1920):
//   [ 행1 ] 기준(축소 960x540) | Unity(축소 960x540)
//   [ 행2 ] 크롭A 기준 480x270 1x | 크롭A Unity 480x270 1x | 크롭B 기준 | 크롭B Unity     (4 x 480)
//   [ 행3 ] 지표: 왼쪽=기준(REF), 오른쪽=Unity — 숫자(MEDIAN, SAT5 %, HUE30) + 32구간 luma 히스토그램(막대 높이는 제곱근 눌림)
// 비트맵 글꼴이 없어 3x5 숫자/영문 대문자 픽셀 글꼴을 직접 그린다.
namespace Exoduser.DevTools.LookDev
{
    public static class LookDevPngWriter
    {
        static uint[] crcTable;
        static uint Crc(byte[] b, int off, int len, uint crc)
        {
            if (crcTable == null)
            {
                crcTable = new uint[256];
                for (uint n = 0; n < 256; n++) { uint c = n; for (int k = 0; k < 8; k++) c = (c & 1) != 0 ? 0xEDB88320u ^ (c >> 1) : c >> 1; crcTable[n] = c; }
            }
            crc = ~crc; for (int i = 0; i < len; i++) crc = crcTable[(crc ^ b[off + i]) & 0xFF] ^ (crc >> 8); return ~crc;
        }
        static void Chunk(Stream s, string type, byte[] data)
        {
            var len = new byte[] { (byte)(data.Length >> 24), (byte)(data.Length >> 16), (byte)(data.Length >> 8), (byte)data.Length }; s.Write(len, 0, 4);
            var t = Encoding.ASCII.GetBytes(type); s.Write(t, 0, 4); s.Write(data, 0, data.Length);
            uint c = Crc(t, 0, 4, 0); c = Crc(data, 0, data.Length, c);
            s.Write(new byte[] { (byte)(c >> 24), (byte)(c >> 16), (byte)(c >> 8), (byte)c }, 0, 4);
        }

        /// <summary>8비트 RGB PNG 인코딩 (필터 0, zlib).</summary>
        public static byte[] Encode(LookDevRaw img)
        {
            int w = img.Width, h = img.Height; var raw = new byte[(w * 3 + 1) * h];
            for (int y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; Buffer.BlockCopy(img.Rgb, y * w * 3, raw, y * (w * 3 + 1) + 1, w * 3); }
            var z = new MemoryStream(); z.WriteByte(0x78); z.WriteByte(0x9C);
            using (var ds = new DeflateStream(z, CompressionLevel.Fastest, true)) ds.Write(raw, 0, raw.Length);
            uint a = 1, b = 0; for (int i = 0; i < raw.Length; i++) { a = (a + raw[i]) % 65521; b = (b + a) % 65521; }
            uint ad = (b << 16) | a; z.Write(new byte[] { (byte)(ad >> 24), (byte)(ad >> 16), (byte)(ad >> 8), (byte)ad }, 0, 4);
            var o = new MemoryStream(); o.Write(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, 0, 8);
            var ih = new byte[13]; ih[0] = (byte)(w >> 24); ih[1] = (byte)(w >> 16); ih[2] = (byte)(w >> 8); ih[3] = (byte)w; ih[4] = (byte)(h >> 24); ih[5] = (byte)(h >> 16); ih[6] = (byte)(h >> 8); ih[7] = (byte)h; ih[8] = 8; ih[9] = 2;
            Chunk(o, "IHDR", ih); Chunk(o, "IDAT", z.ToArray()); Chunk(o, "IEND", new byte[0]); return o.ToArray();
        }
    }

    public static class LookDevCompare
    {
        public struct SideMetrics { public double Median, Sat5Percent, Hue30; public int[] Hist; }

        public static SideMetrics Measure(LookDevRaw img)
        {
            int n; double ml; var m = new SideMetrics();
            m.Median = LookDevMetricsCore.ScreenMedian(img);
            m.Sat5Percent = LookDevMetricsCore.TopLumaSat(img, null, 0.95, out n) * 100.0;
            m.Hue30 = LookDevMetricsCore.TopLumaHue(img, null, 0.70, out ml, out n);
            m.Hist = LookDevMetricsCore.Histogram32(img); return m;
        }

        // ---- 그리기 도구
        static void Fill(LookDevRaw c, int x, int y, int w, int h, byte r, byte g, byte b)
        {
            for (int yy = Math.Max(0, y); yy < Math.Min(c.Height, y + h); yy++)
                for (int xx = Math.Max(0, x); xx < Math.Min(c.Width, x + w); xx++) { int o = (yy * c.Width + xx) * 3; c.Rgb[o] = r; c.Rgb[o + 1] = g; c.Rgb[o + 2] = b; }
        }
        static void Blit(LookDevRaw c, LookDevRaw src, int sx, int sy, int w, int h, int dx, int dy)
        {
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    int xs = sx + x, ys = sy + y, xd = dx + x, yd = dy + y;
                    if (xs < 0 || ys < 0 || xs >= src.Width || ys >= src.Height || xd < 0 || yd < 0 || xd >= c.Width || yd >= c.Height) continue;
                    int os = (ys * src.Width + xs) * 3, od = (yd * c.Width + xd) * 3; c.Rgb[od] = src.Rgb[os]; c.Rgb[od + 1] = src.Rgb[os + 1]; c.Rgb[od + 2] = src.Rgb[os + 2];
                }
        }
        static void Frame(LookDevRaw c, int x, int y, int w, int h, byte r, byte g, byte b)
        {
            Fill(c, x, y, w, 1, r, g, b); Fill(c, x, y + h - 1, w, 1, r, g, b); Fill(c, x, y, 1, h, r, g, b); Fill(c, x + w - 1, y, 1, h, r, g, b);
        }

        static readonly Dictionary<char, string> Font = new Dictionary<char, string>
        {
            {'0',"111101101101111"},{'1',"010110010010111"},{'2',"110001010100111"},{'3',"110001010001110"},{'4',"101101111001001"},
            {'5',"111100110001110"},{'6',"011100111101111"},{'7',"111001010010010"},{'8',"111101111101111"},{'9',"111101111001110"},
            {'.',"000000000000010"},{'-',"000000111000000"},{':',"000010000010000"},{'%',"101001010100101"},{' ',"000000000000000"},
            {'A',"010101111101101"},{'D',"110101101101110"},{'E',"111100110100111"},{'F',"111100110100100"},{'G',"011100101101011"},
            {'H',"101101111101101"},{'I',"111010010010111"},{'L',"100100100100111"},{'M',"101111111101101"},{'N',"110101101101101"},
            {'R',"110101110101101"},{'S',"011100010001110"},{'T',"111010010010010"},{'U',"101101101101111"},{'Y',"101101010010010"},
        };
        static void Text(LookDevRaw c, string s, int x, int y, int scale, byte r, byte g, byte b)
        {
            foreach (char ch in s)
            {
                string bits; if (!Font.TryGetValue(char.ToUpperInvariant(ch), out bits)) bits = "111101101101111";
                for (int i = 0; i < 15; i++) if (bits[i] == '1') Fill(c, x + (i % 3) * scale, y + (i / 3) * scale, scale, scale, r, g, b);
                x += 4 * scale;
            }
        }

        static string F1(double v) { return double.IsNaN(v) ? "NAN" : v.ToString("0.0", System.Globalization.CultureInfo.InvariantCulture); }

        static void DrawSide(LookDevRaw c, SideMetrics m, int x0, int y0, int w, byte tr, byte tg, byte tb, string title)
        {
            Fill(c, x0, y0, w, 150, 14, 11, 10);
            Fill(c, x0, y0, 6, 150, tr, tg, tb);
            Text(c, title, x0 + 14, y0 + 8, 4, tr, tg, tb);
            Text(c, "MEDIAN " + F1(m.Median), x0 + 14, y0 + 40, 4, 223, 214, 194);
            Text(c, "SAT5 " + F1(m.Sat5Percent) + "%", x0 + 14, y0 + 68, 4, 223, 214, 194);
            Text(c, "HUE30 " + F1(m.Hue30), x0 + 14, y0 + 96, 4, 223, 214, 194);
            int hx = x0 + 420, hy = y0 + 12, hw = w - 440, hh = 120; long mx = 1; foreach (var v in m.Hist) if (v > mx) mx = v;
            Frame(c, hx - 1, hy - 1, hw + 2, hh + 2, 70, 62, 52);
            int bw = Math.Max(1, hw / 32);
            for (int i = 0; i < 32; i++) { int bh = (int)(hh * Math.Sqrt((double)m.Hist[i] / mx)); Fill(c, hx + i * bw, hy + hh - bh, bw - 1, bh, 164, 147, 115); }
            int mxp = hx + (int)(Math.Min(255.0, m.Median) / 8.0 * bw); Fill(c, mxp, hy, 2, hh, tr, tg, tb);
        }

        /// <summary>비교판. reference 가 다른 크기면 unity 크기로 리샘플한다. 크롭 좌표는 unity 해상도 기준.</summary>
        public static LookDevRaw Build(LookDevRaw reference, LookDevRaw unity, LookDevCrop cropA, LookDevCrop cropB, out SideMetrics refM, out SideMetrics unM)
        {
            var refR = LookDevMetricsCore.ResizeBilinear(reference, unity.Width, unity.Height);
            refM = Measure(refR); unM = Measure(unity);
            const int W = 1920, HalfW = 960, HalfH = 540, CW = 480, CH = 270;
            var cv = new LookDevRaw(W, HalfH + CH + 150 + 3 * 6); Fill(cv, 0, 0, cv.Width, cv.Height, 8, 6, 5);
            var a = LookDevMetricsCore.ResizeBilinear(refR, HalfW, HalfH); var b = LookDevMetricsCore.ResizeBilinear(unity, HalfW, HalfH);
            Blit(cv, a, 0, 0, HalfW, HalfH, 0, 0); Blit(cv, b, 0, 0, HalfW, HalfH, HalfW, 0);
            Fill(cv, HalfW - 1, 0, 2, HalfH, 8, 6, 5);
            int y2 = HalfH + 6;
            Blit(cv, refR, cropA.x, cropA.y, CW, CH, 0, y2); Blit(cv, unity, cropA.x, cropA.y, CW, CH, CW, y2);
            Blit(cv, refR, cropB.x, cropB.y, CW, CH, 2 * CW, y2); Blit(cv, unity, cropB.x, cropB.y, CW, CH, 3 * CW, y2);
            for (int i = 0; i < 4; i++)
            {
                bool isRef = i % 2 == 0;
                Frame(cv, i * CW, y2, CW, CH, isRef ? (byte)164 : (byte)176, isRef ? (byte)147 : (byte)40, isRef ? (byte)115 : (byte)28);
            }
            int y3 = y2 + CH + 6;
            DrawSide(cv, refM, 0, y3, HalfW, 164, 147, 115, "REF");
            DrawSide(cv, unM, HalfW, y3, HalfW, 176, 40, 28, "UNITY");
            return cv;
        }
    }
}
