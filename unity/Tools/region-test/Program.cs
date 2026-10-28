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
//   6. (R-B) the four abyssal anglers on the real map: sites / hp / atk, the 1000 px wake line, the attack order, a region at 80 % stays sealed while its angler lives,
//      the field boss flag only after all four died, the exit tile says slay-every-angler until then, then the whole run to StageCleared.
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
            // O-1: kills call checkRooms() too (web hurtE tail), which shifts the 30-call check phase; the sealed text needs a check on a frame %45 == 0 (web 42106),
            // so line the phase up the way an earlier kill could have (first check on tick TickCount + 30 - CheckT, a multiple of 15) instead of relying on the old fixed phase
            s.Stage.CheckT = s.TickCount % 15;
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


        // ---- 6. R-B: the four abyssal anglers ----
        {
            Func<int, int, Simulation> MakeB = (seed, lv) =>
            {
                var rng = new Random(seed);
                var cfg = new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false, StartX = data.startX, StartY = data.startY, PlayerMaxHp = 1000000000, PlayerMaxStamina = 300, PlayerMaxMana = 300 };
                var sim = new Simulation(cfg); sim.Random01 = () => rng.NextDouble(); sim.Player.Level = lv;
                sim.CanMove = map.CanMove; sim.HasLineOfSight = map.LineOfSight; sim.IsProjectileWall = (x, y) => map.Blocked(x, y);
                sim.FloorTile = (tx, ty) => !map.Blocked((tx + .5f) * 40, (ty + .5f) * 40);
                sim.Stage.InitializeField(data.tiles, data.width); sim.Stage.Enabled = true;   // FieldBossDone stays down: the anglers decide it
                sim.Stage.BossSpawners[0] = (s2, x, y) => s2.AddEnemy(new EnemyState { Etype = 0, Hp = 100, MaxHp = 100, X = x, Y = y, Radius = 20, IsBoss = true });
                sim.EnableFieldSpawns(); sim.SpawnStartEnemies(); sim.InitRegions(); sim.SpawnHoles = null; sim.EnableFieldBosses();
                return sim;
            };
            int[][] sites = { new[] { 58, 158 }, new[] { 148, 150 }, new[] { 52, 42 }, new[] { 148, 42 } }; int[] els = { 2, 1, 3, 4 };
            foreach (int lv in new[] { 1, 10 })
            {
                var s = MakeB(31, lv); Run(s, 1);
                Check(s.FieldBosses != null && s.FieldBosses.Length == 4 && s.FieldBosses.All(f => f != null && f.Asleep && f.Hid), "Lv" + lv + ": four anglers asleep after the first tick");
                int hpExp = Simulation.FieldBossHp(lv), atkExp = (int)Math.Floor((20 + lv * 3) * 1.2);
                for (int i = 0; i < 4; i++)
                {
                    var f = s.FieldBosses[i];
                    Check(f.X == (sites[i][0] + .5) * 40 && f.Y == (sites[i][1] + .5) * 40 && f.El == els[i] && f.R == 120, "Lv" + lv + " site " + i + " (" + sites[i][0] + "," + sites[i][1] + ") element " + els[i]);
                    Check(f.Hp == hpExp && f.MaxHp == hpExp && f.Atk == atkExp, "Lv" + lv + " site " + i + " hp " + f.Hp + " atk " + f.Atk);
                    Check(map.CanMove((float)f.X, (float)f.Y, 15), "Lv" + lv + " site " + i + " stands on walkable ground");
                }
                Say("anglers Lv" + lv + ": " + string.Join("  ", s.FieldBosses.Select(f => "(" + (int)(f.X / 40) + "," + (int)(f.Y / 40) + ") el" + f.El + " hp " + f.Hp + " atk " + f.Atk)));
            }
            { var sx = MakeB(1, 1); Say("regions with anglers: " + string.Join(" ", Enumerable.Range(0, 4).Select(i => RegionNames[i] + "<-site" + sx.Regions[i].FbIdx))); }

            // wake line: 1001 px sleeps, 1000 px wakes (and announces once)
            {
                var s = MakeB(32, 1); Run(s, 1); var sw = s.FieldBosses[0];
                s.Player.X = (float)(sw.X + 1001); s.Player.Y = (float)sw.Y; s.Player.Iframes = 99999; s.TickFieldBosses(); s.TickFieldBosses(); s.TickFieldBosses();
                Check(sw.Asleep, "1001 px from the south-west angler: still asleep");
                s.Player.X = (float)(sw.X + 1000); s.TickFieldBosses();
                Check(!sw.Asleep && sw.TpT == 54 && sw.Hid, "1000 px: awake, rising from the ground (54 frames), hidden");
                Check(s.Stage.Events.Count(e => e.Kind == StageEventKind.AnglerWoke) == 1, "one 'Abyssal Angler' announcement");
                for (int k = 0; k < 54; k++) { s.Player.X = (float)(sw.X + 1000); s.TickFieldBosses(); }
                Check(!sw.Hid && sw.TpT == 0 && !sw.SpawnIn, "after 54 frames it stands (can be hit, blocks the way)");
            }

            // attack order, 520 px from the south-west angler (inside the 1920x1080 shooting box)
            {
                var s = MakeB(33, 1); Run(s, 1); var sw = s.FieldBosses[0];
                int wake = -1, rise = -1, energy = -1; var energies = new List<int>(); var emits = new List<int>(); var tele = new List<int>(); var landed = new List<int>(); bool hidPrev = true;
                for (int t = 1; t <= 1500; t++)
                {
                    s.Player.X = (float)(sw.X + 520); s.Player.Y = (float)sw.Y; s.Player.Iframes = 99999; s.Player.Hp = s.Player.MaxHp;
                    int sc = s.FieldBossShotCount, tpb = s.FieldBossTeleports; bool wasAsleep = sw.Asleep;
                    s.TickFieldBosses();
                    if (wasAsleep && !sw.Asleep) wake = t;
                    if (rise < 0 && !sw.Asleep && !sw.Hid) rise = t;
                    if (s.FieldBossShotCount > sc) { var spec = s.FieldBossShots[s.FieldBossShots.Count - 1]; if (spec.ElemBall) { energies.Add(t); if (energy < 0) energy = t; } else emits.Add(t); }
                    if (s.FieldBossTeleports > tpb) tele.Add(t);
                    if (hidPrev && !sw.Hid && rise >= 0 && t > rise) landed.Add(t);
                    hidPrev = sw.Hid;
                }
                Say("attack order (frames after waking at tick " + wake + "): stands +" + (rise - wake) + ", energy balls at +" + string.Join(", +", energies.Take(4).Select(e => e - wake)) + ", eye shots " + emits.Count + ", teleport announced +" + (tele.Count > 0 ? tele[0] - wake : -1) + ", lands +" + (landed.Count > 0 ? landed[0] - wake : -1));
                Check(wake > 0 && rise - wake == 54, "stands 54 frames after waking");
                Check(energy - wake == 299, "first energy ball 299 frames after waking (120 frame shot timer, then the 180 frame charge) (+" + (energy - wake) + ")");
                Check(energies.Count >= 2 && energies[1] - energies[0] == 180, "the next charge starts the frame after the ball: balls 180 frames apart (" + string.Join(",", energies.Take(3)) + ")");
                // web quirk, kept: shotCd reaches 0 the frame after the ball, so the next charge (enChg > 0) starts at once and blocks the 3 eye shots that the same block wants to release
                Check(emits.Count == 0 && s.FieldBossBurstShots == 0, "web behaviour: the 3-shot eye burst never gets out (0 eye shots in 1500 frames)");
                Check(tele.Count > 0 && tele[0] - energy == 599, "teleport announced 599 frames after the first energy ball (tpCd 600 set that frame, counted down the same frame) (+" + (tele.Count > 0 ? tele[0] - energy : -1) + ")");
                Check(landed.Count > 0 && tele.Count > 0 && landed[0] - tele[0] == 54, "lands 54 frames after the announcement");
                var e0 = s.FieldBossShots.First(sp => sp.ElemBall);
                Check(e0.Dmg == Math.Floor(sw.Atk * 2.8) && Math.Abs(Math.Sqrt(e0.Vx * e0.Vx + e0.Vy * e0.Vy) - 10) < 1e-9 && e0.El == 2 && e0.Life == 320, "energy ball: atk x 2.8, speed 10, water, life 320");
            }

            // regions: 80 % with the angler alive stays open, the angler's death clears it; the field boss flag needs all four
            {
                var s = MakeB(34, 1); Run(s, 1);
                KillBornIn(s, 1, need[1] + 5); Run(s, 45);
                Check(s.RegionRatio(s.Regions[1], 1) >= 0.8 && !s.Regions[1].Cleared, "northeast at " + s.Regions[1].Kills + "/60 but its angler lives: not cleared");
                var ne = s.FieldBosses[3];
                s.Player.X = (float)(ne.X + 500); s.Player.Y = (float)ne.Y; s.Player.Iframes = 99999; Run(s, 60);
                Check(!ne.Hid && !ne.Asleep, "northeast angler awake and standing");
                bool hit = s.HurtFieldMobs(ne.X, ne.Y, 10, 1e9, null);
                Check(hit && s.FieldBosses[3] == null && !s.Stage.FieldBossDone && s.FieldBossAliveCount() == 3, "killing it leaves three; the field boss flag stays down");
                Run(s, 15);
                Check(s.Regions[1].Cleared, "northeast clears at the next check once its angler is dead");
                Check(s.Stage.Events.Count(e => e.Kind == StageEventKind.AnglerSlain) == 1, "one 'Field Boss Slain' announcement");
            }

            // the whole run
            {
                var s = MakeB(2027, 1); Run(s, 1);
                int[] order = { 3, 0, 2, 1 };   // site indices: NE, SW, NW, SE
                int[] regionOfSite = { 2, 3, 0, 1 };
                var log = new List<string>(); var exit = s.Stage.Exits[0];
                s.HarnessKill(s.Stage.GateGuard); KillBornIn(s, 1, 41); KillBornIn(s, 0, need[0]); KillBornIn(s, 2, need[2]); KillBornIn(s, 3, need[3]); Run(s, 45);
                Check(s.RegionClearedCount() == 0, "all four regions at 80 % but every angler lives: nothing cleared");
                Say("run: all regions at 80 %, no angler dead -> cleared " + s.RegionClearedCount() + "/4, field boss flag " + (s.Stage.FieldBossDone ? "up" : "down"));
                int step = 0;
                foreach (int k in order)
                {
                    var fb = s.FieldBosses[k];
                    s.Player.X = (float)(fb.X + 500); s.Player.Y = (float)fb.Y; s.Player.Iframes = 99999; Run(s, 70);
                    s.HurtFieldMobs(fb.X, fb.Y, 10, 1e9, null); Run(s, 15); step++;
                    Check(s.Regions[regionOfSite[k]].Cleared, "region " + RegionNames[regionOfSite[k]] + " clears when its angler (site " + k + ") dies");
                    log.Add("angler " + k + " dead @tick " + s.TickCount + " -> " + RegionNames[regionOfSite[k]] + " cleared@" + s.Regions[regionOfSite[k]].ClearedTick + " (" + s.RegionClearedCount() + "/4, flag " + (s.Stage.FieldBossDone ? "up" : "down") + ")");
                    if (step < 4) Check(!s.Stage.FieldBossDone, "field boss flag still down after " + step + " of 4");
                }
                foreach (var l in log) Say("run: " + l);
                Check(s.Stage.FieldBossDone && s.FieldBossAliveCount() == 0 && s.RegionClearedCount() == 4, "all four dead -> flag up, 4/4 regions");
                s.Player.X = (exit.X + .5f) * 40; s.Player.Y = (exit.Y + .5f) * 40; s.Player.Iframes = 99999; Run(s, 60);
                Check(s.Stage.BossUnlocked, "gate opened by 4/4 regions + the flag");
                Run(s, 480);
                Check(s.Stage.InArena && s.Stage.Boss != null, "arena entered");
                Check(s.FieldBosses == null, "no field angler inside the arena");
                s.HarnessKill(s.Stage.Boss); Run(s, 70);
                var aex = s.Stage.Exits[s.Stage.Exits.Count - 1]; s.Player.X = (aex.X + .5f) * 40; s.Player.Y = (aex.Y + .5f) * 40; Run(s, 70);
                Check(s.Stage.StageCleared, "arena exit -> stage cleared");
                Say("run: stage cleared at tick " + s.TickCount + "; regions " + Table(s));
            }
            // the exit tile before the flag says "slay every angler"
            {
                var s = MakeB(35, 1); Run(s, 1); var exit = s.Stage.Exits[0];
                s.Stage.ForceUnlock(); s.Player.X = (exit.X + .5f) * 40; s.Player.Y = (exit.Y + .5f) * 40; s.Player.Iframes = 99999; Run(s, 100);
                Check(s.Stage.Events.Any(e => e.Kind == StageEventKind.GateAnglerBlocked) && !s.Stage.InArena && s.Stage.LoadPhase == 0, "exit tile with the flag down: blocked, no arena");
            }
        }


        // ---- 7. follow-up: the death EnemyTick hands to ctx.RegKill (web 34625, stuck in a wall) is a kill of the region the enemy was born in ----
        // The branch itself cannot trigger in Unity yet: the tick context stubs WallStuck (false), Map (1x1) and PushOutWall, so this drives the connected callback directly.
        {
            var s = Make(41); s.Config.EnemyAiEnabled = true; s.Enemies.Clear(); s.Player.Iframes = 99999;
            var e = s.SpawnEnemy(2420, 2420, 0, null, false); Run(s, 2);
            var field = typeof(Simulation).GetField("tickCtx", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var ctx = field != null ? field.GetValue(s) as EnemyTickContext : null;
            Check(e != null && ctx != null && ctx.RegKill != null, "tick context built and RegKill connected");
            if (e != null && ctx != null)
            {
                int idx = s.RegionIdxAt(e.HomeX, e.HomeY), k0 = s.Kills, r0 = s.Regions[idx].Kills;
                ctx.RegKill(e.Web);
                Check(!e.Alive && s.Kills == k0 + 1 && s.Regions[idx].Kills == r0 + 1, "kills " + k0 + " -> " + s.Kills + ", " + RegionNames[idx] + " " + r0 + " -> " + s.Regions[idx].Kills);
                Say("RegKill callback (stuck-in-wall death): kills " + k0 + " -> " + s.Kills + ", " + RegionNames[idx] + " " + r0 + " -> " + s.Regions[idx].Kills);
            }
        }

        // ---- 8. O-1: a kill through the web death part (EnemyHurt.DeathHead/DeathTail) calls _regKill once and the guard's +10 % once; the stuck-in-wall death
        //         (EnemyTick 34625: rollDrop, addExp(e.exp||1), kills++, _regKill) is not the hurtE death part: no malice, no combo ----
        {
            var s = Make(43); var g = s.Stage.GateGuard;
            Check(g != null, "guard present");
            if (g != null)
            {
                int gi = s.RegionIdxAt(g.HomeX, g.HomeY), r0 = s.Regions[gi].Kills, k0 = s.Kills;
                Func<int> guardEvents = () => s.Stage.Events.Count(ev => ev.Kind == StageEventKind.GateGuardDefeated);
                int ev0 = guardEvents(); g.Shield = 0; g.Hp = 1; s.Player.Iframes = 99999; s.HurtEnemy(g, 50);
                Check(!g.Alive && s.Kills == k0 + 1 && s.Regions[gi].Kills == r0 + 1 && guardEvents() == ev0 + 1 && s.Stage.GateGuardKilled,
                    "hurt kill of the guard: kills +1 (" + (s.Kills - k0) + "), " + RegionNames[gi] + " +1 (" + (s.Regions[gi].Kills - r0) + "), GateGuardDefeated +1 (" + (guardEvents() - ev0) + ")");
                s.HurtEnemy(g, 50);
                Check(s.Kills == k0 + 1 && s.Regions[gi].Kills == r0 + 1 && guardEvents() == ev0 + 1, "hitting the dead guard again counts nothing");
            }
            var s2 = Make(44); s2.Config.EnemyAiEnabled = true; s2.Enemies.Clear(); s2.Player.Iframes = 99999;
            var e = s2.SpawnEnemy(2420, 2420, 0, null, false); Run(s2, 2);
            var field = typeof(Simulation).GetField("tickCtx", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var ctx = field != null ? field.GetValue(s2) as EnemyTickContext : null;
            if (e != null && ctx != null)
            {
                int idx = s2.RegionIdxAt(e.HomeX, e.HomeY), k0 = s2.Kills, r0 = s2.Regions[idx].Kills, m0 = s2.Materials, c0 = s2.Combo, x0 = s2.Player.Experience;
                ctx.RollDrop(e.Web); ctx.AddExp(1); ctx.RegKill(e.Web);   // the web order of the stuck branch
                Check(!e.Alive && s2.Kills == k0 + 1 && s2.Regions[idx].Kills == r0 + 1 && s2.Materials == m0 && s2.Combo == c0 && s2.Player.Experience == x0,
                    "stuck-in-wall death: kills +1, region +1, malice / combo unchanged, addExp(1) -> ~~(1/3) = 0 exp (kills " + (s2.Kills - k0) + " region " + (s2.Regions[idx].Kills - r0) + " malice " + (s2.Materials - m0) + ")");
            }
            else Check(false, "tick context for the stuck-in-wall check");
        }

        // ---- 9. LT-5: the HUD "지역 처치" row (#mmLvl killCnt, 60584~60586) and G._stageKills. The start enemies (guard, escorts, 다안 육괴) are born in a region
        //         but are not part of its hole total, so a region's kills can pass its total: the row is capped (web Math.min), never "17 / 14".
        //         G._stageKills is 0 at initStage (31750) while G.kills runs on through the save: kills made before InitializeField are not stage kills ----
        {
            var s = Make(45); int gi = s.RegGateIdx, tot = s.Regions[gi].Total;
            int k, t; s.AreaKills(gi, out k, out t);
            Check(k == s.Regions[gi].Kills && t == tot, RegionNames[gi] + " row " + k + " / " + t + " = region kills / region total");
            s.Regions[gi].Kills = tot + 3; s.AreaKills(gi, out k, out t);
            Check(k == tot && t == tot, RegionNames[gi] + " kills " + (tot + 3) + " of " + tot + ": row capped " + k + " / " + t);
            s.AreaKills(-1, out k, out t);
            Check(k == s.Stage.StageKills && t == s.Stage.TotalSpawned, "no current region (G._regCurIdx -1): stage-wide " + k + " / " + t);
            var s2 = Make(46); s2.Kills = 120; s2.Stage.InitializeField(data.tiles, data.width);   // a save restored G.kills 120 before initStage
            Check(s2.Stage.StageKills == 0 && s2.Kills == 120, "initStage after a restored G.kills 120: stage kills " + s2.Stage.StageKills + ", G.kills " + s2.Kills);
            KillBornIn(s2, 2, 3);
            Check(s2.Stage.StageKills == 3 && s2.Kills == 123, "three kills: stage kills " + s2.Stage.StageKills + ", G.kills " + s2.Kills);
        }

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_real_ch1_map_not_Unity_runtime", passed = failed == 0, failed, log = Log, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 1) File.WriteAllText(args[1], result);
        Console.WriteLine("REGION_REAL_MAP " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
