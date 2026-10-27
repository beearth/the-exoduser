using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // C01-AI: the field spawn pool of the web (HELL_SPAWN, _RANGED_ET, _CH1_OPENING_EXCLUDED_ET, rollEtype, _spawnHoleCount; game.html 31050~31098, 31138~31142).
    // rollEtype consumes Math.random in the web order: stage 0 = one draw for ranged/melee, one draw for the weighted pick; other stages = see RollEtype.
    public static class EnemyPools
    {
        // [etype, weight] per chapter (hell index)
        public static readonly int[][][] HellSpawn = {
            P(0,12,1,4,2,20,3,4,4,14,5,5,6,12,7,7,8,3,9,2,10,6,11,3,12,10,13,1,14,5,15,3,16,5,17,1,18,3,19,2,20,8,21,6,22,16,23,5,24,8,25,2,26,3,27,3,28,2,29,1,47,16),
            P(0,6,1,5,2,10,3,15,4,5,5,8,6,4,7,7,8,3,9,2,10,3,11,6,12,8,13,7,14,4,15,3,16,6,17,3,18,2,19,1,30,14,31,6,32,4,33,10,34,3,35,6,36,6,37,3,38,2,39,2,47,14),
            P(0,5,1,2,2,10,3,4,4,4,5,8,6,3,7,6,8,3,9,1,10,2,11,2,12,10,13,1,14,4,15,2,16,5,17,1,18,1,19,1,40,8,41,7,42,2,43,14,44,8,45,3,46,2,47,14,48,2,49,1),
            P(0,5,1,2,2,10,3,5,4,5,5,4,6,5,7,8,8,2,9,5,10,14,11,5,12,8,13,2,14,6,15,3,16,6,17,4,18,6,19,3,50,8,51,4,52,6,53,3,54,4,55,10,56,5,57,2,58,4,59,1,47,10),
            P(0,4,1,2,2,10,3,4,4,3,5,6,6,3,7,7,8,2,9,1,10,3,11,2,12,6,13,2,14,10,15,3,16,6,17,1,18,3,19,2,60,10,61,10,62,4,63,8,64,8,65,10,66,2,67,6,68,2,69,1,47,10),
            P(0,3,1,1,2,6,3,2,4,3,5,2,6,3,7,6,8,1,9,1,10,2,12,3,14,3,16,5,18,4,19,3,70,14,71,4,72,4,73,14,74,7,75,10,76,5,77,3,78,2,79,1,47,14),
            P(0,3,1,2,2,6,3,3,4,3,5,3,6,3,7,7,8,2,9,2,10,5,11,3,12,6,13,2,14,4,15,3,16,6,17,2,18,4,19,4,20,2,22,4,25,1,29,1,30,4,35,2,39,2,40,1,44,2,47,12,49,1,50,1,55,2,59,1,60,1,65,1,69,1,70,2,74,1,79,1,80,12,81,5,82,3,83,10,84,2,85,10,86,6,87,6,88,2,89,1)
        };
        static int[][] P(params int[] flat) { var r = new int[flat.Length / 2][]; for (int i = 0; i < r.Length; i++) r[i] = new[] { flat[i * 2], flat[i * 2 + 1] }; return r; }

        public static readonly HashSet<int> Ranged = new HashSet<int> { 1, 7, 8, 9, 13, 16, 17, 25, 26, 34, 38, 42, 45, 46, 48, 53, 54, 66, 71, 76, 78, 82, 84, 86, 88 };
        public static readonly HashSet<int> Ch1OpeningExcluded = new HashSet<int> { 2, 22, 30, 43 };

        // _HELL_CDF: cumulative p/total, built with the same float accumulation as the web (cum += p/total)
        static readonly double[][] CdfEt = new double[7][], CdfCum = new double[7][];
        static EnemyPools()
        {
            for (int h = 0; h < HellSpawn.Length; h++)
            {
                double total = 0; foreach (var p in HellSpawn[h]) total += p[1];
                CdfEt[h] = new double[HellSpawn[h].Length]; CdfCum[h] = new double[HellSpawn[h].Length]; double cum = 0;
                for (int i = 0; i < HellSpawn[h].Length; i++) { cum += HellSpawn[h][i][1] / total; CdfEt[h][i] = HellSpawn[h][i][0]; CdfCum[h][i] = cum; }
            }
        }

        // HELL_EL = [theme element, bias] per hell; EL = {P:0,F:1,I:2,D:3,L:4,H:5,E:6}
        static readonly int[] HellEl = { 0, 0, 2, 1, 3, 3, 3 };
        static readonly double[] HellElBias = { .40, .40, .45, .45, .45, .45, .35 };

        // rollEl(si): the theme element with probability bias, otherwise one of the six base elements (two draws on the second branch)
        public static int RollEl(int si, Func<double> random)
        {
            int hell = si >= 0 && si < EnemyTables.SiToHell.Length ? EnemyTables.SiToHell[si] : 0;
            if (random() < HellElBias[hell]) return HellEl[hell];
            return (int)(random() * 6);
        }

        public static int RollEtype(int si, Func<double> random)
        {
            if (si == 0)
            {
                bool ranged = random() < .5;
                var pool = new List<int[]>();
                foreach (var p in HellSpawn[0]) if (!Ch1OpeningExcluded.Contains(p[0]) && Ranged.Contains(p[0]) == ranged) pool.Add(p);
                double total = 0; foreach (var p in pool) total += p[1];
                double roll = random() * total;
                foreach (var p in pool) { roll -= p[1]; if (roll < 0) return p[0]; }
                return pool.Count > 0 ? pool[pool.Count - 1][0] : 0;
            }
            int hell = si >= 0 && si < EnemyTables.SiToHell.Length ? EnemyTables.SiToHell[si] : 0;
            if (hell >= HellSpawn.Length) hell = 0;
            var all = HellSpawn[hell];
            if (random() < 0.5)
            {
                var rPool = new List<int[]>(); double rTot = 0;
                foreach (var p in all) if (Ranged.Contains(p[0])) { rPool.Add(p); rTot += p[1]; }
                if (rTot > 0)
                {
                    double rv = random() * rTot, rc = 0;
                    foreach (var p in rPool) { rc += p[1]; if (rv < rc) return p[0]; }
                    return rPool[rPool.Count - 1][0];
                }
            }
            for (int att = 0; att < 12; att++)
            {
                double r = random(); int et = (int)CdfEt[hell][CdfEt[hell].Length - 1];
                for (int i = 0; i < CdfEt[hell].Length; i++) if (r < CdfCum[hell][i]) { et = (int)CdfEt[hell][i]; break; }
                if (!Ranged.Contains(et)) return et;
            }
            return 2;
        }

        // _spawnHoleCount(size, si): size<=.3 -> S 50, <=.5 -> M 100, else L 100; stage 0 = ceil(ceil(base*.5)*.3)
        public static int SpawnHoleCount(double size, int si)
        {
            int b = size <= .3 ? 50 : size <= .5 ? 100 : 100;
            return si == 0 ? (int)Math.Ceiling(Math.Ceiling(b * .5) * .3) : b;
        }
    }
}
