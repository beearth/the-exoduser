using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // Presentation geometry only. Callbacks read the existing field and movement query.
    public static class A2RSwampDressGeometry
    {
        public struct Segment { public float ax, az, bx, bz, nx, nz; }
        public static List<Segment> Contours(Func<float, float, float> height,
            float minX, float minZ, float maxX, float maxZ, float step, float level)
        {
            if (height == null || step <= 0) throw new ArgumentException("Invalid contour input");
            var result = new List<Segment>();
            int width = (int)Math.Ceiling((maxX - minX) / step), depth = (int)Math.Ceiling((maxZ - minZ) / step);
            var samples = new float[(width + 1) * (depth + 1)];
            for (int z = 0; z <= depth; z++) for (int x = 0; x <= width; x++)
                samples[z * (width + 1) + x] = height(Math.Min(maxX, minX + x * step), Math.Min(maxZ, minZ + z * step)) - level;
            var px = new float[4]; var pz = new float[4]; var h = new float[4];
            var ex = new float[4]; var ez = new float[4];
            for (int z = 0; z < depth; z++) for (int x = 0; x < width; x++)
            {
                px[0] = px[3] = minX + x * step; px[1] = px[2] = Math.Min(maxX, px[0] + step);
                pz[0] = pz[1] = minZ + z * step; pz[2] = pz[3] = Math.Min(maxZ, pz[0] + step);
                int i = z * (width + 1) + x;
                h[0] = samples[i]; h[1] = samples[i + 1]; h[2] = samples[i + width + 2]; h[3] = samples[i + width + 1];
                int count = 0;
                for (int e = 0; e < 4; e++)
                {
                    int n = (e + 1) % 4;
                    if ((h[e] < 0) == (h[n] < 0)) continue;
                    float t = h[e] / (h[e] - h[n]);
                    ex[count] = px[e] + (px[n] - px[e]) * t; ez[count++] = pz[e] + (pz[n] - pz[e]) * t;
                }
                // Resolve saddle cells from the centre sample instead of crossing the two shores.
                if (count == 4 && (height((px[0] + px[2]) * .5f, (pz[0] + pz[2]) * .5f) < level) == (h[0] < 0))
                { float tx = ex[0], tz = ez[0]; ex[0] = ex[3]; ez[0] = ez[3]; ex[3] = ex[2]; ez[3] = ez[2]; ex[2] = ex[1]; ez[2] = ez[1]; ex[1] = tx; ez[1] = tz; }
                for (int e = 0; e + 1 < count; e += 2)
                {
                    float dx = ex[e + 1] - ex[e], dz = ez[e + 1] - ez[e], length = (float)Math.Sqrt(dx * dx + dz * dz);
                    if (length < .00001f) continue;
                    float nx = -dz / length, nz = dx / length, mx = (ex[e] + ex[e + 1]) * .5f, mz = (ez[e] + ez[e + 1]) * .5f;
                    if (height(mx + nx * .03f, mz + nz * .03f) < height(mx - nx * .03f, mz - nz * .03f)) { nx = -nx; nz = -nz; }
                    result.Add(new Segment { ax = ex[e], az = ez[e], bx = ex[e + 1], bz = ez[e + 1], nx = nx, nz = nz });
                }
            }
            return result;
        }

        public static bool SafeDebris(float x, float z, Func<float, float, bool> water, Func<float, float, bool> outsideWalk)
        {
            // Entire 1.4u footprint must be wet and outside the original walk band.
            for (int i = 0; i < 9; i++)
            {
                double a = i * Math.PI / 4;
                float px = x + (i == 8 ? 0 : .7f * (float)Math.Cos(a)), pz = z + (i == 8 ? 0 : .7f * (float)Math.Sin(a));
                if (!water(px, pz) || !outsideWalk(px, pz)) return false;
            }
            return true;
        }
    }
}
