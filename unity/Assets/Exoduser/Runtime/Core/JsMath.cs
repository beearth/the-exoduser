using System;

namespace Exoduser.UnityPort.Core
{
    // Math.atan2 / Math.sin / Math.cos exactly as V8 computes them (fdlibm 5.3: e_atan2.c, s_atan.c, k_sin.c, k_cos.c, e_rem_pio2.c).
    // .NET calls the C runtime for these and differs from V8 in the last bit for some arguments; the web game's state (facing, move angle,
    // leash teleport position) is built from them, so the Unity port needs the same bits on every platform. The oracle projects compare
    // this class with V8 on thousands of arguments. sin/cos support |x| <= 2^19*pi/2 (~823549, far above any angle the game uses);
    // larger arguments throw instead of returning a different result.
    public static class JsMath
    {
        static int Hi(double x) { return (int)(BitConverter.DoubleToInt64Bits(x) >> 32); }
        static uint Lo(double x) { return (uint)BitConverter.DoubleToInt64Bits(x); }
        static double FromWords(int hi, uint lo) { return BitConverter.Int64BitsToDouble(((long)hi << 32) | lo); }

        // ---- atan (s_atan.c) ----
        static readonly double[] AtanHi = { 4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00 };
        static readonly double[] AtanLo = { 2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17 };
        static readonly double[] AT = {
            3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
            9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
            4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02 };
        static double Atan(double x)
        {
            int hx = Hi(x), ix = hx & 0x7fffffff, id;
            if (ix >= 0x44100000)
            { // |x| >= 2^66
                if (ix > 0x7ff00000 || (ix == 0x7ff00000 && Lo(x) != 0)) return x + x; // NaN
                return hx > 0 ? AtanHi[3] + AtanLo[3] : -AtanHi[3] - AtanLo[3];
            }
            if (ix < 0x3fdc0000)
            { // |x| < 0.4375
                if (ix < 0x3e200000) { if (1.0e300 + x > 1.0) return x; } // |x| < 2^-29
                id = -1;
            }
            else
            {
                x = Math.Abs(x);
                if (ix < 0x3ff30000)
                { // |x| < 1.1875
                    if (ix < 0x3fe60000) { id = 0; x = (2.0 * x - 1.0) / (2.0 + x); } // 7/16 <= |x| < 11/16
                    else { id = 1; x = (x - 1.0) / (x + 1.0); }                       // 11/16 <= |x| < 19/16
                }
                else
                {
                    if (ix < 0x40038000) { id = 2; x = (x - 1.5) / (1.0 + 1.5 * x); } // |x| < 2.4375
                    else { id = 3; x = -1.0 / x; }                                      // 2.4375 <= |x| < 2^66
                }
            }
            double z = x * x, w = z * z;
            double s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10])))));
            double s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
            if (id < 0) return x - x * (s1 + s2);
            z = AtanHi[id] - ((x * (s1 + s2) - AtanLo[id]) - x);
            return hx < 0 ? -z : z;
        }

        // ---- atan2 (e_atan2.c) ----
        const double Tiny = 1.0e-300, PiO4 = 7.8539816339744827900E-01, PiO2 = 1.5707963267948965580E+00, Pi = 3.1415926535897931160E+00, PiLo = 1.2246467991473531772E-16;
        public static double Atan2(double y, double x)
        {
            int hx = Hi(x), ix = hx & 0x7fffffff, hy = Hi(y), iy = hy & 0x7fffffff;
            uint lx = Lo(x), ly = Lo(y);
            if (double.IsNaN(x) || double.IsNaN(y)) return x + y;
            if (((hx - 0x3ff00000) | (int)lx) == 0) return Atan(y); // x = 1.0
            int m = ((hy >> 31) & 1) | ((hx >> 30) & 2);             // 2*sign(x) + sign(y)
            if ((iy | (int)ly) == 0)
            { // y = 0
                switch (m) { case 0: case 1: return y; case 2: return Pi + Tiny; default: return -Pi - Tiny; }
            }
            if ((ix | (int)lx) == 0) return hy < 0 ? -PiO2 - Tiny : PiO2 + Tiny; // x = 0
            if (ix == 0x7ff00000)
            { // x is INF
                if (iy == 0x7ff00000)
                {
                    switch (m) { case 0: return PiO4 + Tiny; case 1: return -PiO4 - Tiny; case 2: return 3.0 * PiO4 + Tiny; default: return -3.0 * PiO4 - Tiny; }
                }
                switch (m) { case 0: return 0.0; case 1: return -0.0; case 2: return Pi + Tiny; default: return -Pi - Tiny; }
            }
            if (iy == 0x7ff00000) return hy < 0 ? -PiO2 - Tiny : PiO2 + Tiny; // y is INF
            int k = (iy - ix) >> 20;
            double z;
            if (k > 60) { z = PiO2 + 0.5 * PiLo; m &= 1; }     // |y/x| > 2^60
            else if (hx < 0 && k < -60) z = 0.0;                // 0 > |y|/x > -2^-60
            else z = Atan(Math.Abs(y / x));
            switch (m)
            {
                case 0: return z;
                case 1: return -z;
                case 2: return Pi - (z - PiLo);
                default: return (z - PiLo) - Pi;
            }
        }

        // ---- kernels (k_sin.c, k_cos.c) ----
        const double S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04, S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
        const double C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05, C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
        static double KernelSin(double x, double y, int iy)
        {
            int ix = Hi(x) & 0x7fffffff;
            if (ix < 0x3e400000) { if ((int)x == 0) return x; }
            double z = x * x, v = z * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
            if (iy == 0) return x + v * (S1 + z * r);
            return x - ((z * (0.5 * y - v * r) - y) - v * S1);
        }
        static double KernelCos(double x, double y)
        {
            int ix = Hi(x) & 0x7fffffff;
            if (ix < 0x3e400000) { if ((int)x == 0) return 1.0; }
            double z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
            if (ix < 0x3FD33333) return 1.0 - (0.5 * z - (z * r - x * y));
            double qx = ix > 0x3fe90000 ? 0.28125 : FromWords(ix - 0x00200000, 0);
            double hz = 0.5 * z - qx, a = 1.0 - qx;
            return a - (hz - (z * r - x * y));
        }

        // ---- argument reduction (e_rem_pio2.c, arguments up to 2^19*pi/2) ----
        const double InvPio2 = 6.36619772367581382433e-01, Pio2_1 = 1.57079632673412561417e+00, Pio2_1t = 6.07710050650619224932e-11,
            Pio2_2 = 6.07710050630396597660e-11, Pio2_2t = 2.02226624879595063154e-21, Pio2_3 = 2.02226624871116645580e-21, Pio2_3t = 8.47842766036889956997e-32;
        static int RemPio2(double x, out double y0, out double y1)
        {
            int hx = Hi(x), ix = hx & 0x7fffffff;
            if (ix <= 0x3fe921fb) { y0 = x; y1 = 0; return 0; } // |x| ~<= pi/4
            double z;
            if (ix < 0x4002d97c)
            { // |x| < 3pi/4, n = +-1
                if (hx > 0)
                {
                    z = x - Pio2_1;
                    if (ix != 0x3ff921fb) { y0 = z - Pio2_1t; y1 = (z - y0) - Pio2_1t; }
                    else { z -= Pio2_2; y0 = z - Pio2_2t; y1 = (z - y0) - Pio2_2t; }
                    return 1;
                }
                z = x + Pio2_1;
                if (ix != 0x3ff921fb) { y0 = z + Pio2_1t; y1 = (z - y0) + Pio2_1t; }
                else { z += Pio2_2; y0 = z + Pio2_2t; y1 = (z - y0) + Pio2_2t; }
                return -1;
            }
            if (ix <= 0x413921fb)
            { // |x| ~<= 2^19*(pi/2), medium size. (The fdlibm "quick check" table shortcut gives the same y0 as the general path.)
                double t = Math.Abs(x);
                int n = (int)(t * InvPio2 + 0.5);
                double fn = n, r = t - fn * Pio2_1, w = fn * Pio2_1t; // 1st round good to 85 bit
                int j = ix >> 20;
                y0 = r - w;
                int i = j - ((Hi(y0) >> 20) & 0x7ff);
                if (i > 16)
                { // 2nd iteration needed, good to 118
                    t = r; w = fn * Pio2_2; r = t - w; w = fn * Pio2_2t - ((t - r) - w); y0 = r - w;
                    i = j - ((Hi(y0) >> 20) & 0x7ff);
                    if (i > 49)
                    { // 3rd iteration needed, 151 bits accuracy
                        t = r; w = fn * Pio2_3; r = t - w; w = fn * Pio2_3t - ((t - r) - w); y0 = r - w;
                    }
                }
                y1 = (r - y0) - w;
                if (hx < 0) { y0 = -y0; y1 = -y1; return -n; }
                return n;
            }
            throw new ArgumentOutOfRangeException("x", "JsMath.Sin/Cos support |x| <= 2^19*pi/2");
        }

        public static double Sin(double x)
        {
            int ix = Hi(x) & 0x7fffffff;
            if (ix <= 0x3fe921fb) return KernelSin(x, 0, 0);
            if (ix >= 0x7ff00000) return x - x; // NaN or Inf
            double y0, y1; int n = RemPio2(x, out y0, out y1);
            switch (n & 3) { case 0: return KernelSin(y0, y1, 1); case 1: return KernelCos(y0, y1); case 2: return -KernelSin(y0, y1, 1); default: return -KernelCos(y0, y1); }
        }
        public static double Cos(double x)
        {
            int ix = Hi(x) & 0x7fffffff;
            if (ix <= 0x3fe921fb) return KernelCos(x, 0);
            if (ix >= 0x7ff00000) return x - x;
            double y0, y1; int n = RemPio2(x, out y0, out y1);
            switch (n & 3) { case 0: return KernelCos(y0, y1); case 1: return -KernelSin(y0, y1, 1); case 2: return -KernelCos(y0, y1); default: return KernelSin(y0, y1, 1); }
        }
    }
}
