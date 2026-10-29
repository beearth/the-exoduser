using System;
using System.Linq;
using System.Reflection;
using Exoduser.UnityPort.Core;

internal static class Program
{
    static int Main()
    {
        try
        {
            var arena = BossArenaLayout.Generate(0);
            Check(arena.Type == 0 && arena.EntryX == 64 && arena.ExitX == 64, "actual Core si0 arena fixture");
            var before = (int[])arena.Tiles.Clone();
            var plan = typeof(BossArenaLayout).Assembly.GetType("Exoduser.UnityPort.Remodel.ArenaChannelPlan");
            Check(plan != null, "ArenaChannelPlan exists");
            var build = plan.GetMethod("Build", BindingFlags.Public | BindingFlags.Static, null, new[] { typeof(BossArenaLayout) }, null);
            Check(build != null, "Build accepts Core BossArenaLayout");
            var indices = build.Invoke(null, new object[] { arena }) as int[];
            Check(indices != null && indices.Length > 0, "exterior channel has tiles");
            Check(indices.Distinct().Count() == indices.Length, "channel tiles are unique");
            Check(indices.All(i => i >= 0 && i < arena.Tiles.Length && arena.Tiles[i] == 1), "all channel tiles are nonwalkable wall");
            Check(indices.All(i => Math.Abs(i % BossArenaLayout.Width - arena.EntryX) > 3), "north and south center gates stay dry");
            Check(indices.Any(i => i % BossArenaLayout.Width < arena.RoomCx - 3) && indices.Any(i => i % BossArenaLayout.Width > arena.RoomCx + 3), "east and west channel arcs exist");
            Check(indices.Any(i => i / BossArenaLayout.Width < arena.RoomCy) && indices.Any(i => i / BossArenaLayout.Width > arena.RoomCy), "north and south channel arcs exist");
            Check(indices.All(i => TouchesWalkable(arena, i)), "every channel tile borders the Core arena floor");
            Check(before.SequenceEqual(arena.Tiles), "plan leaves Core collision unchanged");
            Console.WriteLine("ARENA_CHANNEL_PASS 11 checks / 0 failures; tiles=" + indices.Length);
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("ARENA_CHANNEL_FAIL " + ex.Message);
            return 1;
        }
    }

    static bool TouchesWalkable(BossArenaLayout arena, int index)
    {
        int x = index % BossArenaLayout.Width, y = index / BossArenaLayout.Width;
        return IsFloor(arena, x - 1, y) || IsFloor(arena, x + 1, y) ||
               IsFloor(arena, x, y - 1) || IsFloor(arena, x, y + 1);
    }

    static bool IsFloor(BossArenaLayout arena, int x, int y)
    {
        return x >= 0 && x < BossArenaLayout.Width && y >= 0 && y < BossArenaLayout.Height && arena.Tile(x, y) != 1;
    }

    static void Check(bool condition, string name)
    {
        if (!condition) throw new Exception(name);
    }
}
