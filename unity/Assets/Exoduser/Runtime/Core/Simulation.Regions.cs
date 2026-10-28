using System;

namespace Exoduser.UnityPort.Core
{
    // One G._regions entry (web {id, total, kills, cleared, fbIdx}); ClearedTick is the Unity-side stamp of the tick that set cleared (logs only).
    public sealed class RegionState
    {
        public int Id, Total, Kills, FbIdx = -1, ClearedTick = -1;
        public bool Cleared;
    }

    /// <summary>
    /// M1-REGION R-A: the four-quadrant clear rule of the open field (web game.html [REGION] block: _regionInit 60963, _regKill 60994, _regionRatio 60991,
    /// _regionCheckClears 61032, _regionTick 61045, Hell Gate unlock 42069). 0 = northwest, 1 = northeast, 2 = southwest, 3 = southeast.
    /// Without regions (a map side under 180 tiles) the old global 80 % fallback in <see cref="StageFlow"/> stays. The abyssal angler of a region is R-B:
    /// while <see cref="StageFlow.FieldBossDone"/> is true (R-A) no angler is alive.
    /// </summary>
    public sealed partial class Simulation
    {
        public const double RegionClearRatio = 0.8;   // _REG_CLEAR_RATIO
        private static readonly int[] RegionFbToRegion = { 2, 3, 0, 1 };   // _REG_FB_TO_REG: _FB_SITES order (SW, SE, NW, NE) -> region index

        public RegionState[] Regions;                 // G._regions (null = no regions on this map)
        public double RegMidX, RegMidY;               // G._regMidX / _regMidY (tiles)
        public int RegGateIdx = -1;                   // G._regGateIdx: the region that takes the gate guard's +10 %

        /// <summary>_regionInit(si): call once after the spawn holes, the start enemies and the gate guard exist (the guard decides the bonus region).</summary>
        public void InitRegions()
        {
            Regions = null; RegMidX = 0; RegMidY = 0; RegGateIdx = -1;
            int si = Config.StageIndex;
            if (MapTilesWide < 180 || MapTilesHigh < 180) return;   // open fields only: a side of 180+ tiles
            double midX = MapTilesWide / 2.0, midY = MapTilesHigh / 2.0; RegMidX = midX; RegMidY = midY;
            var r = new RegionState[4];
            for (int i = 0; i < 4; i++) r[i] = new RegionState { Id = i };
            if (si == 0) for (int k = 0; k < RegionFbToRegion.Length; k++) r[RegionFbToRegion[k]].FbIdx = k;
            if (SpawnHoles != null)
                foreach (var h in SpawnHoles.Holes)
                    r[(h.Y / StartMobTile < midY ? 0 : 2) + (h.X / StartMobTile < midX ? 0 : 1)].Total += EnemyPools.SpawnHoleCount(h.Size, si);
            Regions = r;
            // the +10 % region = where the guard stands (none: the boss gate coordinates)
            var guard = Stage.GateGuard;
            double gtx = guard != null ? guard.X / StartMobTile : (Stage.HasFieldGate ? Stage.FieldGateCx + .5 : midX);
            double gty = guard != null ? guard.Y / StartMobTile : (Stage.HasFieldGate ? Stage.FieldGateY + .5 : 0);
            RegGateIdx = (gty < midY ? 0 : 2) + (gtx < midX ? 0 : 1);
            for (int i = 0; i < 4; i++) if (r[i].Total <= 0 && !RegionFbAlive(r[i])) { r[i].Cleared = true; r[i].ClearedTick = TickCount; }   // empty region: quietly cleared
        }

        /// <summary>_regionIdxAt: -1 without regions; x / y in pixels.</summary>
        public int RegionIdxAt(double x, double y)
        {
            if (Regions == null) return -1;
            return (y / StartMobTile < RegMidY ? 0 : 2) + (x / StartMobTile < RegMidX ? 0 : 1);
        }

        /// <summary>_regionFbAlive: see <see cref="FieldBossAliveForRegion"/> (R-B). Without anglers (FieldBossDone) nobody is alive.</summary>
        public bool RegionFbAlive(RegionState r) { return FieldBossAliveForRegion(r); }

        /// <summary>_regionRatio: kills / total (+0.10 on the gate region once the guard died); an empty region counts as 1.</summary>
        public double RegionRatio(RegionState r, int i)
        {
            if (r == null) return 0;
            double bonus = Stage.GateGuardKilled && i == RegGateIdx ? 0.10 : 0;
            return r.Total > 0 ? (double)r.Kills / r.Total + bonus : 1;
        }

        /// <summary>The HUD "지역 처치" row (#mmLvl killCnt, web 60584-60586): the current region's min(kills, total) / total (a cleared region is capped at its total),
        /// the stage-wide G._stageKills / G._totalSpawned on a map without regions or before the current region is known (G._regCurIdx -1, kept by the HUD).</summary>
        public void AreaKills(int regCurIdx, out int kills, out int total)
        {
            var r = Regions != null && regCurIdx >= 0 && regCurIdx < Regions.Length ? Regions[regCurIdx] : null;
            total = r != null ? r.Total : Stage.TotalSpawned;
            kills = r != null ? Math.Min(r.Kills, r.Total) : Stage.StageKills;
        }

        public int RegionClearedCount()
        {
            if (Regions == null) return 0;
            int n = 0; for (int i = 0; i < 4; i++) if (Regions[i].Cleared) n++;
            return n;
        }

        /// <summary>_regKill: a kill belongs to the region of the enemy's spawn position (not where it died). Bosses are not counted.</summary>
        private void RegKill(EnemyState e)
        {
            if (Regions == null || e == null || e.IsBoss) return;
            int i = e.HasHome ? RegionIdxAt(e.HomeX, e.HomeY) : RegionIdxAt(e.X, e.Y);
            if (i >= 0) Regions[i].Kills++;
        }

        /// <summary>_regionCheckClears: a region is cleared once ratio >= 0.8 (1e-9 absorbs 0.7 + 0.1 < 0.8 in doubles) and its angler is dead. Never switched off again.</summary>
        public void RegionCheckClears()
        {
            if (Regions == null) return;
            for (int i = 0; i < 4; i++)
            {
                var r = Regions[i];
                if (r.Cleared || RegionRatio(r, i) < RegionClearRatio - 1e-9 || RegionFbAlive(r)) continue;
                r.Cleared = true; r.ClearedTick = TickCount;
                Stage.RaiseRegionCleared(i, RegionClearedCount());
            }
        }

        /// <summary>_regionTick: every 15th frame outside the boss arena and its load screen.</summary>
        public void TickRegions()
        {
            if (Regions == null || !Stage.Enabled || Stage.InArena || Stage.LoadPhase > 0) return;
            if (TickCount % 15 != 0) return;
            RegionCheckClears();
        }
    }
}
