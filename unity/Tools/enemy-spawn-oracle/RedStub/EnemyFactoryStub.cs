using System;

// RED stub: the public shape of EnemyFactory/EnemySpawn with only the position copied (what an "etype 0 only" abbreviation such as SpawnNormalEnemy offers: no tables, no random draws).
namespace Exoduser.UnityPort.Core
{
    public sealed class EnemySpawn { public double x, y; public bool ib; public double hp; }
    public sealed class AuraDef { public string Id, Name, Col; public int Hell; public double Range; }
    public sealed class EnemySpawnContext
    {
        public double PlayerLevel = 1; public int DifficultyIndex = 5; public double StageDiffOffset; public int Stage; public bool DemoMode; public int DemoLastStage;
        public Func<double, double, double, bool> CanMove; public Func<double> Random;
    }
    public static class EnemyFactory
    {
        public const double Tile = 0; public const int Mob8Total = 0, Mob8Cols = 0, BossMovesCount = 0;
        public static readonly int[] OpeningExcludedEtypes = new int[0];
        public static readonly string[] ElementColors = new string[0];
        public static readonly AuraDef[] AuraDefs = new AuraDef[0];
        public static EnemySpawn Create(EnemySpawnContext c, double x, double y, int si, int etype, bool ib, double? el, double? room)
        {
            return new EnemySpawn { x = x, y = y, ib = ib, hp = 1 };
        }
    }
}
