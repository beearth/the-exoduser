using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

// M1-REGION R-A check on the REAL 1-1 map data (Resources/Data/ch1_map.json), standalone .NET (no Unity):
//   1. region totals from the 14 소환굴: northwest 23 / northeast 60 / southwest 53 / southeast 32 (sum 168); the gate guard (100,8) belongs to the northeast.
//   2. per region: the kill count one below / at 80 % (cleared on the next 15-frame check, never before); a kill belongs to where the enemy was born.
//   3. the guard's +10 % lands on the northeast only; the other regions keep kills / total.
//   4. 3 of 4 regions cleared keeps the gate sealed (sealed event carries "3"), the 4th opens it within one 30-frame block.
//   5. one full run with a per-region (kills/total, cleared at tick) table: gate opens -> arena -> boss dies -> exit -> StageCleared.
// usage: RegionRealMapTests.dll <ch1_map.json> [receipt.json]
class Program
{
    static readonly List<string> Log = new List<string>(); static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }
    static void Say(string line) { Log.Add(line); Console.WriteLine(line); }

    static MapData data; static SourceMap map;
    static readonly string[] RegionNames = { "NW", "NE", "SW", "SE" };
    // interior floor spots well away from the dividing lines (px); a kill is born where its enemy was spawned
    static readonly float[][] Spots = { new[] { 2420f, 2420f }, new[] { 5620f, 1820f }, new[] { 2980f, 6740f }, new[] { 5620f, 6420f } };

    static Simulation Make(int seed)
    {
        var rng = new Random(seed);
        var cfg = new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false, StartX = data.startX, StartY = data.startY, PlayerMaxHp = 1000000, PlayerMaxStamina = 300, PlayerMaxMana = 300 };
        var s = new Simulation(cfg); s.Random01 = () => rng.NextDouble();
        s.CanMove = map.CanMove; s.HasLineOfSight = map.LineOfSight; s.IsProjectileWall = (x, y) => map.Blocked(x, y);
        s.FloorTile = (tx, ty) => !map.Blocked((tx + .5f) * 40, (ty + .5f) * 40);
        s.Stage.InitializeField(data.tiles, data.width); s.Stage.FieldBossDone = true; s.Stage.Enabled = true;
        s.Stage.BossSpawners[0] = (sim, x, y) => sim.AddEnemy(new EnemyState { Etype = 0, Hp = 100, MaxHp = 100, X = x, Y = y, Radius = 20, IsBoss = true });
        s.EnableFieldSpawns(); s.SpawnStartEnemies(); s.InitRegions();
        s.SpawnHoles = null;   // the kill counts below are driven by hand
        return s;
    }
    static void Run(Simulation s, int ticks) { for (int i = 0; i < ticks; i++) s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false); }
    // kills n enemies born in region idx (born = spawned there); the enemy is dragged to the far corner before it dies: the kill must not follow the body
    static void KillBornIn(Simulation s, int idx, int n)
    {
        for (int k = 0; k < n; k++)
        {
            EnemyState e = null;
            for (int a = 0; a < 40 && e == null; a++)
            {
                float x = Spots[idx][0] + (a % 8) * 37, y = Spots[idx][1] + (a / 8) * 37;
                e = s.SpawnEnemy(x, y, 0, null, false);
                if (e != null && s.RegionIdxAt(e.HomeX, e.HomeY) != idx) { e.Alive = false; s.Enemies.Remove(e); e = null; }
            }
            if (e == null) { Check(false, "spawn a plain mob inside " + RegionNames[idx]); return; }
            e.X = 3990; e.Y = 3990;   // died on the dividing lines
            s.HarnessKill(e);
        }
    }
    static string Table(Simulation s)
    {
        return string.Join("  ", Enumerable.Range(0, 4).Select(i => RegionNames[i] + " " + s.Regions[i].Kills + "/" + s.Regions[i].Total + " (" + s.RegionRatio(s.Regions[i], i).ToString("0.000") + (s.Regions[i].Cleared ? ", cleared@" + s.Regions[i].ClearedTick : "") + ")"));
    }

    static int Main(string[] args)
    {
        data = JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[0]), new JsonSerializerOptions { IncludeFields = true, PropertyNameCaseInsensitive = true });
        map = new SourceMap(data);

        // ---- 1. totals ----
        var s0 = Make(1);
        int[] expect = { 23, 60, 53, 32 };
        Check(s0.Regions != null && s0.Regions.Length == 4, "1-1 (200x200) has regions");
        for (int i = 0; i < 4; i++) Check(s0.Regions[i].Total == expect[i], RegionNames[i] + " total " + s0.Regions[i].Total + " == " + expect[i]);
        Check(s0.Regions.Sum(r => r.Total) == 168 && s0.Stage.TotalSpawned == 168, "sum 168 == hole total");
        Check(s0.RegGateIdx == 1, "the gate guard (100,8) -> northeast (idx " + s0.RegGateIdx + ")");
        Check(s0.RegionClearedCount() == 0 && s0.Regions.All(r => r.FbIdx >= 0), "no region starts cleared; each has an angler slot (R-B)");
        Say("region totals: " + string.Join(" / ", Enumerable.Range(0, 4).Select(i => RegionNames[i] + " " + s0.Regions[i].Total)) + " = " + s0.Regions.Sum(r => r.Total) + "; bonus region " + RegionNames[s0.RegGateIdx]);

        // ---- 2. boundary per region: one below the line is not enough, the line clears it (no guard bonus) ----
        int[] need = new int[4];
        for (int i = 0; i < 4; i++)
        {
            int total = expect[i], k = 0; while ((double)k / total < 0.8 - 1e-9) k++;
            need[i] = k;
            var s = Make(10 + i);
            KillBornIn(s, i, k - 1); Run(s, 45);
            Check(!s.Regions[i].Cleared, RegionNames[i] + " " + (k - 1) + "/" + total + " (" + ((k - 1) * 100.0 / total).ToString("0.0") + " %) not cleared");
            for (int j = 0; j < 4; j++) if (j != i) Check(!s.Regions[j].Cleared, RegionNames[j] + " untouched by " + RegionNames[i] + " kills");
            KillBornIn(s, i, 1);
            Check(!s.Regions[i].Cleared || s.TickCount % 15 == 0, "clear only on a 15-frame check");
            Run(s, 15);
            Check(s.Regions[i].Cleared, RegionNames[i] + " " + k + "/" + total + " (" + (k * 100.0 / total).ToString("0.0") + " %) cleared");
            Check(s.Regions[i].Kills == k, RegionNames[i] + " kills follow the birth place, not the death place (" + s.Regions[i].Kills + ")");
            Say("boundary " + RegionNames[i] + ": " + (k - 1) + "/" + total + " sealed, " + k + "/" + total + " cleared");
        }

        // ---- 3. the guard bonus belongs to the northeast only ----
        {
            var s = Make(20); var guard = s.Stage.GateGuard;
            Check(guard != null && s.RegionIdxAt(guard.HomeX, guard.HomeY) == 1, "the guard was born in the northeast");
            KillBornIn(s, 0, 5); KillBornIn(s, 2, 5); KillBornIn(s, 3, 5);
            double[] before = Enumerable.Range(0, 4).Select(i => s.RegionRatio(s.Regions[i], i)).ToArray();
            s.HarnessKill(guard);
            Check(s.Stage.GateGuardKilled && s.Regions[1].Kills == 1, "guard kill counts as a northeast kill");
            for (int i = 0; i < 4; i++)
            {
                double now = s.RegionRatio(s.Regions[i], i), exp = i == 1 ? 1.0 / 60 + 0.10 : before[i];
                Check(now == exp, RegionNames[i] + " ratio after the guard died " + now.ToString("0.0000") + (i == 1 ? " (+0.10)" : " (unchanged)"));
            }
            // northeast: 0.7 + 0.1 clears (42 kills incl. the guard); one less does not
            KillBornIn(s, 1, 40); Run(s, 30);
            Check(!s.Regions[1].Cleared, "northeast 41/60 + 0.10 = 78.3 %: not cleared");
            KillBornIn(s, 1, 1); Run(s, 15);
            Check(s.Regions[1].Cleared, "northeast 42/60 + 0.10 = 80 %: cleared (0.7 + 0.1 absorbed by 1e-9)");
            Say("guard bonus: northeast clears at 42/60 incl. the guard; the other regions' ratios stay kills/total");
        }

        // ---- 4 + 5. the full run ----
        {
            var s = Make(2026);
            var sealedCounts = new List<int>();
            Say("run start: " + Table(s));
            // southeast, southwest, northwest by the line (no bonus there), northeast last with the guard
            foreach (int i in new[] { 3, 2, 0 }) { KillBornIn(s, i, need[i]); Run(s, 15); }
            Say("after 3 regions: " + Table(s));
            Check(s.RegionClearedCount() == 3, "3 regions cleared");
            // stand on the gate approach: the sealed text carries 3/4
            var exit = s.Stage.Exits[0]; s.Player.X = (exit.X + .5f) * 40; s.Player.Y = (exit.Y + .5f) * 40; s.Player.Iframes = 99999;
            Run(s, 100);
            Check(!s.Stage.BossUnlocked, "3/4 regions: the gate stays sealed");
            foreach (var ev in s.Stage.Events) if (ev.Kind == StageEventKind.GateSealed) { Check(ev.Regions, "sealed event is in region mode"); sealedCounts.Add(ev.Percent); }
            Check(sealedCounts.Count > 0 && sealedCounts.All(c => c == 3), "sealed text count N/4 = 3/4 (" + string.Join(",", sealedCounts) + ")");
            Check(s.Stage.Events.Count(e => e.Kind == StageEventKind.RegionCleared) == 3, "three RegionCleared events");
            // northeast: the guard (+10 %) and 41 more
            s.HarnessKill(s.Stage.GateGuard); KillBornIn(s, 1, 41);
            int tKills = s.TickCount; Run(s, 15);
            Check(s.Regions[1].Cleared && s.RegionClearedCount() == 4, "4/4 regions cleared");
            int guardTick = s.Stage.Events.Where(e => e.Kind == StageEventKind.GateGuardDefeated).Select(e => e.Tick).FirstOrDefault();
            Say("northeast: guard died at tick " + guardTick + ", cleared at tick " + s.Regions[1].ClearedTick);
            Run(s, 40);
            Check(s.Stage.BossUnlocked, "4/4 regions: the gate opens");
            Say("gate opened at tick " + s.Stage.Events.Where(e => e.Kind == StageEventKind.GateUnlocked).Select(e => e.Tick).FirstOrDefault() + ": " + Table(s));
            // the player stands on the exit tile: the unlocking check starts the arena load by itself
            int t0 = s.Stage.Events.Where(e => e.Kind == StageEventKind.GateUnlocked).Select(e => e.Tick).FirstOrDefault(); Run(s, 480);
            Check(s.Stage.InArena && s.Stage.Boss != null && s.Stage.Boss.Alive, "exit tile -> arena with the boss (" + (s.TickCount - t0) + " ticks)");
            int killsBeforeBoss = s.Regions.Sum(r => r.Kills);
            s.HarnessKill(s.Stage.Boss); Run(s, 70);
            Check(s.Regions.Sum(r => r.Kills) == killsBeforeBoss, "the boss is not counted in any region");
            Check(!s.Stage.BossAlive && s.Stage.Exits.Count > 0, "boss dead -> arena exit opened");
            var aex = s.Stage.Exits[s.Stage.Exits.Count - 1]; int sp0 = s.Player.StatPoints; s.Player.X = (aex.X + .5f) * 40; s.Player.Y = (aex.Y + .5f) * 40; Run(s, 70);
            Check(s.Stage.StageCleared && s.Player.StatPoints == sp0 + 10, "arena exit -> stage cleared (+10 SP)");
            Say("stage cleared at tick " + s.TickCount + ", clear time " + s.Stage.BossClearSeconds + "s; regions " + Table(s));
        }

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_real_ch1_map_not_Unity_runtime", passed = failed == 0, failed, log = Log, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 1) File.WriteAllText(args[1], result);
        Console.WriteLine("REGION_REAL_MAP " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
