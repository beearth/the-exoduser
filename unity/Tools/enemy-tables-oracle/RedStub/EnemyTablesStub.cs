using System;

// RED stub: the public shape of EnemyTables/EliteTables with empty tables (what the implementation looked like before CX-01).
namespace Exoduser.UnityPort.Core
{
    public sealed class RareEnemyDef { public int Etype; public string Name, Col; public double Hp, Atk, Spd, R, Poise; }
    public sealed class EnemyStageDef { public string N, Kr, W, F, Ac, Bn; public int Be, MonLv, Hell, HellFloor, Chapter; public bool IsHellBoss; }
    public sealed class EliteTierDef { public string Name, Col; public int Mods; public double HpMul, AtkMul, DropBonus, ScaleMul; }
    public sealed class ModDef { public string Id, Name, Col; public int Hell; }
    public static class EnemyTables
    {
        public const int EtypeCount = 0, EresRows = 0, ElementCount = 7, TotalStages = 0;
        public static readonly double[] Hp = new double[0], Atk = new double[0], SpdRaw = new double[0], Spd = new double[0], R = new double[0], Range = new double[0], Poise = new double[0], Shield = new double[0], DiffMul = new double[0];
        public static readonly string[] Col = new string[0], Cols = new string[0];
        public static readonly double[][] Eres = new double[0][];
        public static readonly RareEnemyDef[] Rare = new RareEnemyDef[0];
        public static readonly int[] DiffLvOff = new int[0];
        public static readonly byte[] SiToHell = new byte[0], SiToFloor = new byte[0];
        public static readonly EnemyStageDef[] Stg = new EnemyStageDef[0];
        public static bool IsRareEtype(int et) { return false; }
        public static RareEnemyDef FindRare(int etype) { return null; }
    }
    public static class EliteTables
    {
        public static readonly EliteTierDef[] Tiers = new EliteTierDef[0];
        public static readonly double[][] Prob = new double[0][];
        public static readonly ModDef[] Mods = new ModDef[0];
    }
}
