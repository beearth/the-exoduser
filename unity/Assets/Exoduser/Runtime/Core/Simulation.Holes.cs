using System;

namespace Exoduser.UnityPort.Core
{
    // C01-AI: 1-1 natural field spawning. The web has no timer spawner in the field: enemies come from G.spawnHoles (소환굴) that wake within 2000px.
    public sealed partial class Simulation
    {
        public SpawnHoleSystem SpawnHoles;
        public Func<int, int, bool> FloorTile;   // G.map[ty][tx] === 0 (set by the host; used only by the hole's wall spiral)
        public int MapTilesWide = 200, MapTilesHigh = 200;

        /// <summary>initStage(0) hole set: the 14 final holes (totalSpawned 168 is the clear-ratio denominator, not counted per summon).</summary>
        public void EnableFieldSpawns()
        {
            SpawnHoles = new SpawnHoleSystem {
                TileWidth = MapTilesWide, TileHeight = MapTilesHigh, Random = NextRandom,
                IsWall = (x, y) => IsProjectileWall != null ? IsProjectileWall((float)x, (float)y) : !Pass((float)x, (float)y, 0),
                FloorTile = (tx, ty) => FloorTile == null || FloorTile(tx, ty),
                AliveEnemies = () => { int n = 0; foreach (var e in Enemies) if (e.Alive) n++; return n; },
                Spawn = (x, y, si, etype) => {
                    var e = SpawnEnemy((float)x, (float)y, etype, null, false);
                    if (e == null) return false;
                    e.ReviveIframes = 15; if (e.Web != null) e.Web.reviveIframes = 15;   // ne.reviveIframes=15
                    return true;
                }
            };
            SpawnHoles.LoadStage0();
            Stage.TotalSpawned = SpawnHoles.TotalPlanned;   // G._totalSpawned = sum of the hole counts (168)
        }

        void TickSpawnHoles()
        {
            if (SpawnHoles != null && Config.StageIndex == 0 && !Stage.InArena) SpawnHoles.Tick(TickCount, Player.X, Player.Y, 1, Config.StageIndex);
        }
    }
}
