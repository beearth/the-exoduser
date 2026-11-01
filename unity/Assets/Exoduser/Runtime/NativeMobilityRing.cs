using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // Web mobilityRing/mobilityRingTicks: clockwise yellow fill, 45-unit cells,
    // persistent empty track. CPU texture works without adding a shader variant.
    public sealed class NativeMobilityRing
    {
        public const int Size = 256;
        public const float Inset = 11, Diameter = 153;
        struct Sample { public int Offset; public double Turn, Coverage; }
        readonly Sample[] samples;
        public byte[] Pixels { get; private set; } = new byte[Size * Size * 4];
        double previousFill = -1, previousSpacing = -1;

        public NativeMobilityRing()
        {
            var points = new List<Sample>();
            double inner = .5 - 5.0 / Diameter, feather = 1.5 / Diameter;
            for (int y = 0; y < Size; y++) for (int x = 0; x < Size; x++)
            {
                double dx = (x + .5) / Size - .5, dy = (y + .5) / Size - .5;
                double radius = Math.Sqrt(dx * dx + dy * dy);
                double coverage = Clamp((radius - inner) / feather) * Clamp((.5 - radius) * Size);
                if (coverage <= 0) continue;
                double turn = Math.Atan2(dx, dy) / (2 * Math.PI);
                if (turn < 0) turn++;
                points.Add(new Sample { Offset = (y * Size + x) * 4, Turn = turn, Coverage = coverage });
            }
            samples = points.ToArray();
        }

        static double Clamp(double value) { return Math.Max(0, Math.Min(1, value)); }
        public bool Update(double gauge, double maximum)
        {
            bool valid = maximum > 0 && !double.IsInfinity(maximum);
            double fill = valid && !double.IsNaN(gauge) ? Clamp(gauge / maximum) : 0;
            double spacing = valid ? 45 / maximum : 0;
            if (fill == previousFill && spacing == previousSpacing) return false;
            previousFill = fill; previousSpacing = spacing;
            foreach (var s in samples)
            {
                // CSS repeating-conic-gradient: a 3-degree dark separator at
                // the beginning of each 45-unit cell, including the empty state.
                bool tick = valid && s.Turn % spacing < 3.0 / 360;
                bool yellow = valid && !tick && s.Turn < fill;
                int p = s.Offset;
                Pixels[p] = yellow ? (byte)255 : (byte)0;
                Pixels[p + 1] = yellow ? (byte)204 : (byte)0;
                Pixels[p + 2] = yellow ? (byte)51 : (byte)0;
                Pixels[p + 3] = (byte)Math.Round(s.Coverage * (valid ? tick ? .9 : yellow ? .95 : .28 : 0) * 255);
            }
            return true;
        }
    }
}
