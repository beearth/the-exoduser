using System;

namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// C07: web genBossArena(si) (game.html 30835-30885) and the collision it implies. One tile = 40 px (web T). Tile values as the web:
    /// 1 wall, 4 arena floor, 5 arena edge rune (floor next to a wall). Exact integer/double arithmetic of the web (JS ~~ is truncation toward zero).
    /// </summary>
    public sealed class BossArenaLayout
    {
        public const int TileSize = 40;
        public const int Width = 128, Height = 108;
        // _BOSS_ARENA_TYPE[SI_TO_HELL[si]||0]: 0 circle, 1 cathedral, 2 cross, 3 octagon, 4 ellipse
        private static readonly int[] ArenaType = { 0, 1, 2, 3, 4, 0, 1 };

        public int Stage, Type;
        public int[] Tiles;                  // y * Width + x
        public int RoomX, RoomY, RoomW, RoomH, RoomCx, RoomCy;
        public int ExitX, ExitY, EntryX, EntryY, BossX, BossY;

        public int Tile(int x, int y) { return Tiles[y * Width + x]; }

        public static BossArenaLayout Generate(int stage)
        {
            int hell = EnemyTables.SiToHell[Math.Min(Math.Max(stage, 0), EnemyTables.SiToHell.Length - 1)];
            int at = ArenaType[hell];
            int mw = Width, mh = Height;
            var map = new int[mw * mh];
            for (int i = 0; i < map.Length; i++) map[i] = 1;
            int cx = mw / 2, cy = mh / 2;
            int il = 2, it = 2, ir = mw - 2, ib = mh - 2;
            if (at == 0)
            {
                double rr = Math.Min(ir - il, ib - it) / 2.0 - 1;
                for (int y = it; y < ib; y++) for (int x = il; x < ir; x++) if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= rr * rr) map[y * mw + x] = 4;
            }
            else if (at == 1)
            {
                for (int y = it; y < ib; y++) for (int x = il; x < ir; x++) map[y * mw + x] = 4;
            }
            else if (at == 2)
            {
                int armW = (int)((ir - il) * .3), armH = (int)((ib - it) * .3);
                for (int y = it; y < ib; y++) for (int x = il; x < ir; x++) if (Math.Abs(x - cx) < armW || Math.Abs(y - cy) < armH) map[y * mw + x] = 4;
            }
            else if (at == 3)
            {
                int hw = (int)((ir - il) / 2.0), hh = (int)((ib - it) / 2.0), cut = (int)(Math.Min(hw, hh) * .38);
                for (int y = it; y < ib; y++) for (int x = il; x < ir; x++)
                {
                    int dx2 = Math.Abs(x - cx), dy2 = Math.Abs(y - cy);
                    if (dx2 <= hw && dy2 <= hh && dx2 + dy2 <= hw + hh - cut) map[y * mw + x] = 4;
                }
            }
            else
            {
                for (int y = it; y < ib; y++) for (int x = il; x < ir; x++)
                {
                    double nx = (x - cx) / ((ir - il) / 2.0), ny = (y - cy) / ((ib - it) / 2.0);
                    if (nx * nx + ny * ny <= 1) map[y * mw + x] = 4;
                }
            }
            int entY = ib - 3;
            for (int dy = -2; dy <= 1; dy++) for (int dx = -3; dx <= 3; dx++)
            {
                int ty = entY + dy, tx = cx + dx; if (ty >= 0 && ty < mh && tx >= 0 && tx < mw) map[ty * mw + tx] = 4;
            }
            int bossY = cy;
            for (int dy = -2; dy <= 2; dy++) for (int dx = -3; dx <= 3; dx++)
            {
                int ty = bossY + dy, tx = cx + dx; if (ty >= 0 && ty < mh && tx >= 0 && tx < mw && map[ty * mw + tx] == 1) map[ty * mw + tx] = 4;
            }
            int exitY = it;
            for (int y = it; y < cy; y++) { if (map[y * mw + cx] == 4) { exitY = y - 1; break; } }
            if (exitY < 1) exitY = 1;
            int exitX = cx;
            for (int y = it; y < ib; y++) for (int x = il; x < ir; x++)
            {
                if (map[y * mw + x] != 4) continue;
                if ((y > 0 && map[(y - 1) * mw + x] == 1) || (y < mh - 1 && map[(y + 1) * mw + x] == 1) || (x > 0 && map[y * mw + x - 1] == 1) || (x < mw - 1 && map[y * mw + x + 1] == 1)) map[y * mw + x] = 5;
            }
            return new BossArenaLayout {
                Stage = stage, Type = at, Tiles = map, RoomX = il, RoomY = it, RoomW = ir - il, RoomH = ib - it, RoomCx = cx, RoomCy = cy,
                ExitX = exitX, ExitY = exitY, EntryX = cx, EntryY = entY, BossX = cx, BossY = bossY
            };
        }

        // canMv's four-corner sampling against the arena tiles (value 1 blocks; outside the grid blocks).
        public bool Blocked(float x, float y)
        {
            if (float.IsNaN(x) || float.IsInfinity(x) || float.IsNaN(y) || float.IsInfinity(y) || x < 0 || y < 0 || x >= Width * TileSize || y >= Height * TileSize) return true;
            return Tiles[(int)Math.Floor(y / TileSize) * Width + (int)Math.Floor(x / TileSize)] == 1;
        }
        public bool CanMove(float x, float y, float radius)
        {
            if (float.IsNaN(radius) || float.IsInfinity(radius) || radius < 0) return false;
            return !Blocked(x - radius, y - radius) && !Blocked(x + radius, y - radius) && !Blocked(x - radius, y + radius) && !Blocked(x + radius, y + radius);
        }
        public bool LineOfSight(float x0, float y0, float x1, float y1)
        {
            double dx = x1 - x0, dy = y1 - y0;
            int steps = Math.Max(1, (int)(Math.Sqrt(dx * dx + dy * dy) / 16));
            for (int i = 1; i < steps; i++) if (Blocked(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps)) return false;
            return true;
        }
    }
}
