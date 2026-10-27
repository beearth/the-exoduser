using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // One G.spawnHoles entry (web: {x,y,size,room,_triggered,_spawnDelay,_spawnTotal,_spawned,_spawnCD,_spawnInterval}); null = undefined.
    public sealed class SpawnHole
    {
        public double X, Y, Size; public int Room;
        public bool Triggered; public double? SpawnDelay, SpawnTotal, SpawnCd, SpawnInterval; public double Spawned;
    }

    // C01-AI: the 소환굴 (spawn hole) update of the web update() (game.html 35730~35790): the only natural field spawner of 1-1.
    // A hole wakes when the player comes within 2000px, glows 90 frames, then summons `_spawnHoleCount` enemies one by one (interval 900/total, curved) and disappears.
    public sealed class SpawnHoleSystem
    {
        // godot/data/ch1_map_source/si0.json spawn_holes_final (web initStage(0) console: 14 holes, totalSpawned 168)
        public static readonly double[][] Stage0Holes = {
            new[]{2980,6740,.5,1}, new[]{5620,6420,.3,1}, new[]{2220,5620,.5,1}, new[]{5620,5220,.3,1}, new[]{3220,4220,.5,1}, new[]{5220,3220,.5,1}, new[]{2420,2420,.3,1},
            new[]{5620,1820,.5,1}, new[]{4020,1020,.8,1}, new[]{3780,6220,.3,1}, new[]{3060,3420,.55,1}, new[]{4820,1900,.8,1}, new[]{4020,5540,.3,-1}, new[]{4020,4140,.3,-1}
        };

        public readonly List<SpawnHole> Holes = new List<SpawnHole>();
        public int TileWidth, TileHeight;
        public double Tile = 40;

        // host callbacks
        public Func<double> Random;
        public Func<double, double, bool> IsWall;                // isW(x, y, true)
        public Func<int, int, bool> FloorTile;                   // G.map[ty][tx] === 0
        public Func<int> AliveEnemies;                           // G._aliveEns
        public Func<double, double, int, int, bool> Spawn;       // mkEn(x, y, si, etype, false, undefined, room) + push; false = mkEn returned null
        public Action<SpawnHole> Finished;                       // addParts/addTxt/shake of the last summon

        public int TotalPlanned { get { int t = 0; foreach (var h in Stage0Holes) t += EnemyPools.SpawnHoleCount(h[2], 0); return t; } }

        public void LoadStage0()
        {
            Holes.Clear();
            foreach (var h in Stage0Holes) Holes.Add(new SpawnHole { X = h[0], Y = h[1], Size = h[2], Room = (int)h[3] });
        }

        // gameFrame = _gameFrame; px/py = P; sp = frame step
        public void Tick(int gameFrame, double px, double py, double sp, int stage)
        {
            if (gameFrame < 120) return;   // 시작 2초간 트리거 차단
            for (int hi = Holes.Count - 1; hi >= 0; hi--)
            {
                var h = Holes[hi];
                double hqd = (px - h.X) * (px - h.X) + (py - h.Y) * (py - h.Y);
                if (hqd > 4000000 && !h.Triggered) continue;
                if (!h.Triggered) { if (hqd < 4000000) h.Triggered = true; continue; }
                if (h.SpawnDelay == null) h.SpawnDelay = 90;
                if (h.SpawnDelay > 0) { h.SpawnDelay -= sp; continue; }
                if (h.SpawnTotal == null)
                {
                    h.SpawnTotal = EnemyPools.SpawnHoleCount(h.Size, stage); h.Spawned = 0; h.SpawnCd = 0;
                    h.SpawnInterval = Math.Truncate(900 / h.SpawnTotal.Value);
                }
                if (h.SpawnCd > 0) { h.SpawnCd -= sp; continue; }
                if (AliveEnemies() >= 700) { h.SpawnCd = 30; continue; }
                double sx = 0, sy = 0; int tries = 0;
                do
                {
                    double a = Math.PI * 2 * Random(), r = 120 + Random() * 300 + h.Size * 150;
                    sx = h.X + JsMath.Cos(a) * r; sy = h.Y + JsMath.Sin(a) * r; tries++;
                } while (tries < 30 && IsWall(sx, sy));
                if (IsWall(sx, sy))
                {
                    int ctx = (int)(h.X / Tile), cty = (int)(h.Y / Tile); bool found = false;
                    for (int sr = 1; sr < 20 && !found; sr++)
                        for (int sdy = -sr; sdy <= sr && !found; sdy++)
                            for (int sdx = -sr; sdx <= sr; sdx++)
                            {
                                if (Math.Abs(sdx) != sr && Math.Abs(sdy) != sr) continue;
                                int nx = ctx + sdx, ny = cty + sdy;
                                if (nx > 0 && ny > 0 && nx < TileWidth - 1 && ny < TileHeight - 1 && FloorTile(nx, ny)) { sx = (nx + .5) * Tile; sy = (ny + .5) * Tile; found = true; }
                            }
                    if (!found) { sx = h.X; sy = h.Y; }
                }
                int etype = EnemyPools.RollEtype(stage, Random);
                if (!Spawn(sx, sy, stage, etype)) { h.Spawned++; continue; }
                h.Spawned++;
                double prog = h.Spawned / h.SpawnTotal.Value;
                double curve = prog < .3 ? (0.6 + prog * 2.67) : prog < .7 ? (1.4 - (prog - .3) * 1.5) : (0.8 - (prog - .7) * 1.67);
                h.SpawnCd = Math.Max(1, Math.Truncate((h.SpawnInterval ?? 5) * Math.Max(.2, curve)));
                if (h.Spawned >= h.SpawnTotal) { if (Finished != null) Finished(h); Holes.RemoveAt(hi); }
            }
        }
    }
}
