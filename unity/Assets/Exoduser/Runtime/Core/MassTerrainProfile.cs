using System;

namespace Exoduser.UnityPort
{
    // Visual-only height and boundary for CH1. The authored collision tiles remain authoritative.
    public sealed class MassTerrainProfile
    {
        readonly bool[] solid;
        readonly int[] inward;
        readonly int width, height, tileSize;
        readonly float baseHeight;

        public int SolidTileCount { get; private set; }

        public MassTerrainProfile(int width, int height, int tileSize, int[] rects, float baseHeight)
        {
            if (width <= 0 || height <= 0 || tileSize <= 0 || rects == null || rects.Length % 4 != 0 || baseHeight <= 0)
                throw new ArgumentException("Invalid mass terrain source");
            this.width = width; this.height = height; this.tileSize = tileSize; this.baseHeight = baseHeight;
            solid = new bool[width * height];
            for (int i = 0; i < rects.Length; i += 4)
            {
                int x = rects[i], y = rects[i + 1], w = rects[i + 2], h = rects[i + 3];
                if (x < 0 || y < 0 || w <= 0 || h <= 0 || x % tileSize != 0 || y % tileSize != 0 ||
                    w % tileSize != 0 || h % tileSize != 0 || x + w > width * tileSize || y + h > height * tileSize)
                    throw new ArgumentException("Mass rectangle is outside the tile grid");
                for (int ty = y / tileSize; ty < (y + h) / tileSize; ty++)
                    for (int tx = x / tileSize; tx < (x + w) / tileSize; tx++)
                    {
                        int at = ty * width + tx;
                        if (!solid[at]) { solid[at] = true; SolidTileCount++; }
                    }
            }
            inward = new int[solid.Length];
            for (int i = 0; i < inward.Length; i++) inward[i] = -1;
            var queue = new int[SolidTileCount]; int head = 0, tail = 0;
            for (int ty = 0; ty < height; ty++) for (int tx = 0; tx < width; tx++)
            {
                int at = ty * width + tx;
                if (!solid[at]) continue;
                if (HasExposedSide(tx, ty, -1, 0) || HasExposedSide(tx, ty, 1, 0) ||
                    HasExposedSide(tx, ty, 0, -1) || HasExposedSide(tx, ty, 0, 1))
                { inward[at] = 0; queue[tail++] = at; }
            }
            while (head < tail)
            {
                int at = queue[head++], tx = at % width, ty = at / width;
                Visit(tx - 1, ty, inward[at] + 1, queue, ref tail);
                Visit(tx + 1, ty, inward[at] + 1, queue, ref tail);
                Visit(tx, ty - 1, inward[at] + 1, queue, ref tail);
                Visit(tx, ty + 1, inward[at] + 1, queue, ref tail);
            }
            if (tail != SolidTileCount) throw new ArgumentException("Mass boundary distance did not cover all solid tiles");
        }

        void Visit(int tx, int ty, int distance, int[] queue, ref int tail)
        {
            if (!IsSolidTile(tx, ty)) return;
            int at = ty * width + tx;
            if (inward[at] >= 0) return;
            inward[at] = distance; queue[tail++] = at;
        }

        public bool IsSolidTile(int tx, int ty)
        {
            return tx >= 0 && tx < width && ty >= 0 && ty < height && solid[ty * width + tx];
        }

        public bool HasExposedSide(int tx, int ty, int dx, int dy)
        {
            if (Math.Abs(dx) + Math.Abs(dy) != 1) throw new ArgumentException("Use a cardinal side");
            return IsSolidTile(tx, ty) && !IsSolidTile(tx + dx, ty + dy);
        }

        public float HeightAt(float pxX, float pxY)
        {
            double x = pxX, y = pxY;
            // Rise from the baked floor at the boundary; never leave an exposed per-tile vertical wall.
            // Bilinear sampling on tile centers keeps heights identical across separate chunk meshes.
            double gx = x / tileSize - 0.5, gy = y / tileSize - 0.5;
            int tx = (int)Math.Floor(gx), ty = (int)Math.Floor(gy);
            double fx = gx - tx, fy = gy - ty;
            double top = InwardAt(tx, ty) * (1 - fx) + InwardAt(tx + 1, ty) * fx;
            double bottom = InwardAt(tx, ty + 1) * (1 - fx) + InwardAt(tx + 1, ty + 1) * fx;
            double d = Math.Max(0, Math.Min(1, (top * (1 - fy) + bottom * fy) / 6.0));
            double blend = d * d * (3.0 - 2.0 * d);
            const double floor = -1.2; // 0.3 px above the existing baked ground to avoid z fighting
            return (float)(floor + (baseHeight + 150.0 - floor) * blend + blend * (18.0 * Math.Sin(x / 710.0 + 0.3) * Math.Sin(y / 610.0 + 1.1)
                + 9.0 * Math.Sin(x / 245.0 + y / 470.0)
                + 4.0 * Math.Sin(x / 110.0 - y / 180.0)));
        }

        int InwardAt(int tx, int ty)
        {
            return IsSolidTile(tx, ty) ? inward[ty * width + tx] : 0;
        }
    }
}
