using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // C01/C07 M1 fix: the enemies initStage(0) places by hand on top of the 소환굴 (web 31701-31715 _spawnCh1StartMediumEyeMasses, 31800-31832 gate guard block).
    // The holes alone leave the start of 1-1 empty: no first fight, and the clear rule (80 % kills + the guard's 10 %) has no guard to kill.
    //   - 2 "다안 육괴" (etype 4, element D): start tile + (-13,-18) and (+13,-21)
    //   - the gate guard (etype 29 for hell 0) 3 tiles below the boss gate: hp x4, atk x2, r x1.4, poise 80, elite 3
    //   - 4~6 melee escorts (elite 1, hp x2.5) on a 55 px ring around it and 8~12 plain mobs on a 100~180 px ring (12~16 in all)
    // None of them count in G._totalSpawned (the 168 hole total stays the denominator); every kill counts as a kill (G._stageKills).
    public sealed partial class Simulation
    {
        private const float StartMobTile = 40f;
        private static readonly int[][] Ch1StartMediumSpawns = { new[] { -13, -18 }, new[] { 13, -21 } };   // _CH1_START_MEDIUM_SPAWNS {dx, dy}
        private static readonly int[] GateGuardEtypes = { 29, 39, 49, 59, 69, 79, 89 };                       // [29,39,49,59,69,79,89][hell]

        /// <summary>One line per fixed enemy placed by <see cref="SpawnStartEnemies"/> (role, etype, tile, px) for the M1 logs.</summary>
        public readonly List<string> StartMobLog = new List<string>();
        public int StartEyeMasses, StartGuards, StartEscorts, StartWave;

        /// <summary>Places the stage-0 start enemies around the player's current position (call once right after EnableFieldSpawns). Returns how many were placed.</summary>
        public int SpawnStartEnemies()
        {
            // The placement draws from the run's own LCG; the stream is put back afterwards so the first fight / drop rolls of a run do not depend on how many
            // start enemies the walls let through (the M1 route checks 07b / 08 are seed-sensitive, and the web's Math.random has no stream to keep).
            uint savedState = randomState;
            try { return PlaceStartEnemies(); } finally { randomState = savedState; }
        }

        private int PlaceStartEnemies()
        {
            StartMobLog.Clear(); StartEyeMasses = StartGuards = StartEscorts = StartWave = 0;
            if (Config.StageIndex != 0) return 0;
            int si = Config.StageIndex, hell = EnemyTables.SiToHell[si];
            float startX = Player.X / StartMobTile, startY = Player.Y / StartMobTile;

            foreach (var s in Ch1StartMediumSpawns)
            {
                var e = SpawnEnemy((startX + s[0]) * StartMobTile, (startY + s[1]) * StartMobTile, 4, -1, false, 3);   // EL.D
                if (e == null) continue;
                var w = e.Web ?? SyncToWeb(e);
                e.Elite = 0; w.elite = 0; w.mods = new List<string>(); w.aura = null; w._firstShot = false;   // elite=0; mods=[]; aura=null; _firstShot=false
                StartEyeMasses++; LogStartMob("다안 육괴", e);
            }

            if (Stage.HasFieldGate)
            {
                int tx = Stage.FieldGateCx, ty = Stage.FieldGateY + 3;
                if (ty > 0 && ty < MapTilesHigh && (FloorTile == null || FloorTile(tx, ty))) SpawnGateGuard(si, hell, (tx + .5f) * StartMobTile, (ty + .5f) * StartMobTile);
            }
            return StartEyeMasses + StartGuards + StartEscorts + StartWave;
        }

        private void SpawnGateGuard(int si, int hell, float gx, float gy)
        {
            double el = 0;   // STG[si].be: the boss element of the stage theme (EL.P for 1-1)
            var guard = SpawnEnemy(gx, gy, GateGuardEtypes[hell], -1, false, el);
            if (guard == null) return;
            var w = guard.Web ?? SyncToWeb(guard);
            w.hp = Math.Truncate(w.mhp * 4); w.mhp = w.hp;
            w.atk = Math.Truncate(w.atk * 2); w.baseAtk = w.atk;
            w.r = Math.Truncate(w.r * 1.4);
            w.poise = 80; w.maxPoise = 80;
            w.elite = 3; w.dropTier = Math.Min(4, hell + 2);
            guard.Hp = ToIntClamped(w.hp); guard.MaxHp = ToIntClamped(w.mhp); guard.Attack = ToIntClamped(w.atk); guard.BaseAttack = ToIntClamped(w.baseAtk);
            guard.Radius = (float)w.r; guard.Poise = 80; guard.MaxPoise = 80; guard.Elite = 3; guard.IsGateGuard = true;
            Stage.GateGuard = guard; StartGuards++; LogStartMob("문지기", guard);

            int escorts = 4 + (int)(NextRandom() * 3);
            for (int i = 0; i < escorts; i++)
            {
                double a = Math.PI * 2 * i / escorts;
                float ex = gx + (float)Math.Cos(a) * 55, ey = gy + (float)Math.Sin(a) * 55;
                if (!Pass(ex, ey, 10)) continue;
                var e = SpawnEnemy(ex, ey, EnemyPools.RollEtype(si, NextRandom), -1, false, el);
                if (e == null) continue;
                var ew = e.Web ?? SyncToWeb(e);
                e.Elite = 1; ew.elite = 1; ew.hp = Math.Truncate(ew.mhp * 2.5); ew.mhp = ew.hp; e.Hp = ToIntClamped(ew.hp); e.MaxHp = ToIntClamped(ew.mhp);
                StartEscorts++; LogStartMob("호위 엘리트", e);
            }

            int wave = 8 + (int)(NextRandom() * 5);
            for (int i = 0; i < wave; i++)
            {
                double a = Math.PI * 2 * i / wave, d = 100 + NextRandom() * 80;
                float wx = gx + (float)(Math.Cos(a) * d), wy = gy + (float)(Math.Sin(a) * d);
                if (!Pass(wx, wy, 10)) continue;
                int etype = EnemyPools.RollEtype(si, NextRandom);
                var e = SpawnEnemy(wx, wy, etype, -1, false, EnemyPools.RollEl(si, NextRandom));
                if (e == null) continue;
                StartWave++; LogStartMob("외곽 웨이브", e);
            }
        }

        private void LogStartMob(string role, EnemyState e)
        {
            StartMobLog.Add(role + " etype " + e.Etype + " tile (" + (int)(e.X / StartMobTile) + "," + (int)(e.Y / StartMobTile) + ") px (" + (int)e.X + "," + (int)e.Y + ") hp " + e.MaxHp + " elite " + e.Elite);
        }

        /// <summary>Harness only: the same death path a killing blow takes (kill counter, XP, drops, gate guard flag).</summary>
        public void HarnessKill(EnemyState e) { if (e != null && e.Alive) { e.Hp = 0; KillEnemy(e); } }
    }
}
