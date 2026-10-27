using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

// PC-M1 fixed-mobs check on the REAL 1-1 map data (Resources/Data/ch1_map.json), standalone .NET (no Unity):
//   1. SpawnStartEnemies places the web's fixed enemies: 2 x 다안 육괴 (etype 4) at the start tile + (-13,-18) / (+13,-21), the gate guard (etype 29) at tile (100,8), 12~16 escort + wave mobs around it.
//   2. The clear rule: kills / 168 (+10 % when the guard died) >= 80 % opens the gate; one kill short does not; the guard bonus is what lets 117 kills + guard open it.
//   3. One full run: gate opens -> arena -> boss dies -> exit -> stage cleared.
// usage: StartMobsTests.dll <ch1_map.json> [receipt.json]
class Program
{
    static readonly List<string> Log = new List<string>(); static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }
    static void Say(string line) { Log.Add(line); Console.WriteLine(line); }

    static MapData data; static SourceMap map;

    static Simulation Make(int seed)
    {
        var rng = new Random(seed);
        var cfg = new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false, StartX = data.startX, StartY = data.startY, PlayerMaxHp = 1000000, PlayerMaxStamina = 300, PlayerMaxMana = 300 };
        var s = new Simulation(cfg); s.Random01 = () => rng.NextDouble();
        s.CanMove = map.CanMove; s.HasLineOfSight = map.LineOfSight; s.IsProjectileWall = (x, y) => map.Blocked(x, y);
        s.FloorTile = (tx, ty) => !map.Blocked((tx + .5f) * 40, (ty + .5f) * 40);
        s.Stage.InitializeField(data.tiles, data.width); s.Stage.FieldBossDone = true; s.Stage.Enabled = true;
        s.Stage.BossSpawners[0] = (sim, x, y) => sim.AddEnemy(new EnemyState { Etype = 0, Hp = 100, MaxHp = 100, X = x, Y = y, Radius = 20, IsBoss = true });
        s.EnableFieldSpawns(); s.SpawnStartEnemies();
        return s;
    }
    static void Run(Simulation s, int ticks) { for (int i = 0; i < ticks; i++) s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false); }
    static int Tx(EnemyState e) { return (int)(e.X / 40); }
    static int Ty(EnemyState e) { return (int)(e.Y / 40); }
    static int Alive(Simulation s) { return s.Enemies.Count(e => e.Alive); }
    // kills until the sim has `target` kills, using plain mobs spawned off the books (not part of the 168)
    static void KillTo(Simulation s, int target)
    {
        foreach (var e in s.Enemies.Where(e => e.Alive && !e.IsGateGuard && !e.IsBoss).ToList()) { if (s.Kills >= target) return; s.HarnessKill(e); }
        while (s.Kills < target) { var e = s.SpawnEnemy(s.Player.X + 60, s.Player.Y, 0, null, false); if (e == null) { Check(false, "spawn plain mob for the kill count"); return; } s.HarnessKill(e); }
    }

    static int Main(string[] args)
    {
        data = JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[0]), new JsonSerializerOptions { IncludeFields = true, PropertyNameCaseInsensitive = true });
        map = new SourceMap(data);

        // ---- 1. the start field ----
        var s = Make(12345);
        Say("start tile (" + (int)(s.Player.X / 40) + "," + (int)(s.Player.Y / 40) + ") px (" + (int)s.Player.X + "," + (int)s.Player.Y + "); stage hole total " + s.Stage.TotalSpawned);
        foreach (var l in s.StartMobLog) Say("  " + l);
        var eyes = s.Enemies.Where(e => e.Etype == 4 && e.Elite == 0 && !e.IsGateGuard).ToList();
        Check(s.StartEyeMasses == 2, "two 다안 육괴 placed (" + s.StartEyeMasses + ")");
        Check(eyes.Any(e => Math.Abs(Tx(e) - 87) <= 1 && Math.Abs(Ty(e) - 167) <= 1), "a 다안 육괴 at web tile (87,167)");
        Check(eyes.Any(e => Math.Abs(Tx(e) - 113) <= 1 && Math.Abs(Ty(e) - 164) <= 1), "a 다안 육괴 at web tile (113,164)");
        var guard = s.Stage.GateGuard;
        Check(guard != null && guard.IsGateGuard && guard.Etype == 29 && guard.Elite == 3, "gate guard = etype 29, elite 3");
        Check(guard != null && Math.Abs(Tx(guard) - 100) <= 1 && Math.Abs(Ty(guard) - 8) <= 1, "gate guard at web tile (100,8)");
        Check(guard != null && guard.Poise == 80 && guard.MaxPoise == 80, "gate guard poise 80");
        Check(guard != null && guard.Web != null && guard.Web.hp == guard.Hp && guard.Web.mhp == guard.MaxHp && guard.Web.r == guard.Radius && guard.Web.elite == 3, "gate guard web object kept in step");
        Check(s.StartEscorts >= 4 && s.StartEscorts <= 6, "4~6 escorts (" + s.StartEscorts + ")");
        Check(s.StartEscorts + s.StartWave >= 12 - 2 && s.StartEscorts + s.StartWave <= 16, "12~16 escort + wave mobs, wall rejects tolerated (" + (s.StartEscorts + s.StartWave) + ")");
        Check(s.StartWave >= 8 - 2 && s.StartWave <= 12, "8~12 wave mobs (" + s.StartWave + ")");
        Check(Alive(s) == s.StartEyeMasses + s.StartGuards + s.StartEscorts + s.StartWave, "alive enemies = placed enemies (" + Alive(s) + ")");
        Check(s.Stage.TotalSpawned == 168, "denominator stays the 168 hole total (" + s.Stage.TotalSpawned + ")");
        Check(s.Enemies.Where(e => e.Elite == 1).All(e => Math.Sqrt((e.X - guard.X) * (e.X - guard.X) + (e.Y - guard.Y) * (e.Y - guard.Y)) < 120), "escorts stand within 120 px of the guard");
        Check(s.StartMobLog.Count == Alive(s), "one log line per enemy");
        var startCount = Alive(s);
        s.SpawnHoles = null;   // the clear scenarios below drive the kill count by hand
        Run(s, 70); Check(!s.Stage.BossUnlocked && !s.Stage.GateGuardKilled, "gate sealed at the start");

        // ---- 2a. without the guard: 134 kills (79.76 %) sealed, 135 (80.36 %) open ----
        var a = Make(777); a.SpawnHoles = null;
        KillTo(a, 134); Run(a, 70);
        Check(!a.Stage.BossUnlocked && a.Stage.GateGuard != null && !a.Stage.GateGuardKilled, "134/168 kills, guard alive: sealed (" + a.Stage.StageKills + "/" + a.Stage.TotalSpawned + ")");
        KillTo(a, 135); Run(a, 70);
        Check(a.Stage.BossUnlocked, "135/168 kills (80.4 %), guard alive: open");
        Say("no-guard rule: sealed at 134/168, open at 135/168");

        // ---- 2b + 3. the guard bonus and one full run ----
        var b = Make(2026); b.SpawnHoles = null;
        var g = b.Stage.GateGuard;
        Check(g != null && g.Alive, "fresh run has a living guard");
        b.HarnessKill(g);
        Check(b.Stage.GateGuardKilled && b.Stage.GateGuard == null && b.Stage.Events.Any(e => e.Kind == StageEventKind.GateGuardDefeated), "killing the guard sets the flag and raises GateGuardDefeated");
        KillTo(b, 117); Run(b, 70);
        Check(!b.Stage.BossUnlocked, "117 kills incl. the guard (69.6 % + 10 %): sealed (" + b.Stage.StageKills + "/" + b.Stage.TotalSpawned + ")");
        KillTo(b, 118); Run(b, 70);
        Check(b.Stage.BossUnlocked, "118 kills incl. the guard (70.2 % + 10 % = 80.2 %): open (" + b.Stage.StageKills + "/" + b.Stage.TotalSpawned + ")");
        Say("clear run: guard killed at tick " + b.TickCount + ", gate " + (b.Stage.BossUnlocked ? "opened" : "sealed") + " at " + b.Stage.StageKills + "/" + b.Stage.TotalSpawned + " kills (+10 % guard)");

        var exit = b.Stage.Exits[0]; b.Player.X = (exit.X + .5f) * 40; b.Player.Y = (exit.Y + .5f) * 40; b.Player.Iframes = 600;
        int t0 = b.TickCount; Run(b, 480);
        Check(b.Stage.InArena && b.Stage.Boss != null && b.Stage.Boss.Alive, "exit tile -> arena with the boss (" + (b.TickCount - t0) + " ticks)");
        Say("arena entered, boss placed");
        b.HarnessKill(b.Stage.Boss); Run(b, 70);
        Check(!b.Stage.BossAlive && b.Stage.Exits.Count > 0, "boss dead -> arena exit opened");
        var aex = b.Stage.Exits[b.Stage.Exits.Count - 1]; int sp0 = b.Player.StatPoints; b.Player.X = (aex.X + .5f) * 40; b.Player.Y = (aex.Y + .5f) * 40; Run(b, 70);
        Check(b.Stage.StageCleared && b.Player.StatPoints == sp0 + 10, "arena exit -> stage cleared (+10 SP)");
        Say("stage cleared: kills " + b.Stage.StageKills + "/" + b.Stage.TotalSpawned + ", clear time " + b.Stage.BossClearSeconds + "s, start enemies " + startCount);

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_real_ch1_map_not_Unity_runtime", passed = failed == 0, failed, startLog = s.StartMobLog, log = Log, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 1) File.WriteAllText(args[1], result);
        Console.WriteLine("START_MOBS " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
