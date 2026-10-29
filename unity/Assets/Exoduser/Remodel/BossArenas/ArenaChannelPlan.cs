using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Remodel
{
    /// <summary>
    /// Candidate geometry for the one-tile exterior channel beside a Core arena floor.
    /// Indices are y * BossArenaLayout.Width + x; no collision data is changed.
    /// Rendering may smooth this mask, but must not expand it over walkable tiles.
    /// </summary>
    public static class ArenaChannelPlan
    {
        public static int[] Build(BossArenaLayout arena)
        {
            if (arena == null) throw new ArgumentNullException(nameof(arena));
            var result = new List<int>();
            int width = BossArenaLayout.Width, height = BossArenaLayout.Height;
            for (int y = 1; y < height - 1; y++)
            for (int x = 1; x < width - 1; x++)
            {
                if (Math.Abs(x - arena.EntryX) <= 3 || arena.Tile(x, y) != 1) continue;
                if (IsFloor(arena, x - 1, y) || IsFloor(arena, x + 1, y) ||
                    IsFloor(arena, x, y - 1) || IsFloor(arena, x, y + 1))
                    result.Add(y * width + x);
            }
            return result.ToArray();
        }

        static bool IsFloor(BossArenaLayout arena, int x, int y)
        {
            return arena.Tile(x, y) != 1;
        }
    }
}
