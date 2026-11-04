// 11-04 CTO decision (3): fight length of the remodelled druid at the bot's growth state when it entered the hell gate (3D fullrun round 1: Lv 12, 348 kills, boss base HP 148,786).
// A scripted player stays beside the boss and lands one hit every HitEvery ticks that carries BotDpsPerTick x HitEvery damage (HP never runs out), for many seeds.
// Pass: median fight length 120..180 s (60 ticks = 1 s) and all seven moves (slashCombo slam charge grab burrowStrike groundFissure heartbeat) at least once in every seed.
// The same numbers are written to remodel-fightlength.json / printed, with a sensitivity table over other bot DPS values.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

static partial class P
{
    // bot DPS: the old-set run lost 61,322 boss HP (148,786 -> 87,464, ticks 24482..26226 = 1,744) in the arena = 35.2 HP/tick (2,100 HP/s) including its own dodging time
    const double BotDpsPerTick = 35;
    const int HitEvery = 30, FightLevel = 12, SeedsPerMode = 24;
    static readonly string[] SevenMoves = { "slashCombo", "slam", "charge", "grab", "burrowStrike", "groundFissure", "heartbeat" };

    sealed class LenRun { public string Mode; public uint Seed; public int BaseHp, Ticks, Hits; public Dictionary<string, int> Moves = new Dictionary<string, int>(); public int[] LifeTicks = new int[3]; public bool Dead; }

    // mode 0 = close (player centre = boss radius + 66, the existing fight harness), 1 = mid (radius + 160)
    static LenRun LengthFight(int mode, uint seed, double dpsTick, bool rootHit)
    {
        var r = new LenRun { Mode = mode == 0 ? "close" : "mid", Seed = seed };
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        s.DruidRemodel = true; s.Player.Level = FightLevel; s.Player.Hp = s.Player.MaxHp;
        s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        var p = s.Player; int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
        var boss = s.Stage.Boss; if (boss == null) return r;
        r.BaseHp = boss.MaxHp;
        for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }   // intro stun / i-frames
        int start = s.TickCount, hitCd = 0, rootLeft = rootHit ? 3 : 0, lastLife = 0, collapseTick = -1, kg = 0, lifeStart = start; double acc = 0;
        while (boss.Alive && kg++ < 60000)
        {
            p.Hp = p.MaxHp;
            var st = s.DruidLife(boss);
            if (st == null || !st.Collapsing)
            {
                double ang = Math.Atan2(boss.Y - 2160, boss.X - 2560) + 0.9; double keep = boss.Radius + (mode == 0 ? 66 : 160);
                p.X = (float)(boss.X + Math.Cos(ang) * keep); p.Y = (float)(boss.Y + Math.Sin(ang) * keep);
                if (!s.CanMove((float)p.X, (float)p.Y, p.Radius)) { p.X = boss.X + (float)keep; p.Y = boss.Y; }
            }
            if (st != null && st.Collapsing)
            {
                if (collapseTick < 0) collapseTick = s.TickCount;
                int into = s.TickCount - collapseTick;
                if (rootLeft > 0 && (into == 10 || into == 25 || into == 40)) { s.HurtEnemy(boss, Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.012))); rootLeft--; }
            }
            else
            {
                collapseTick = -1;
                if (hitCd-- <= 0) { acc += dpsTick * HitEvery; int dmg = (int)acc; acc -= dmg; if (dmg > 0) { s.HurtEnemy(boss, dmg); r.Hits++; } hitCd = HitEvery; }
                if (rootHit && st != null && st.Life != lastLife) rootLeft = 3;
            }
            if (st != null && st.Life != lastLife) { r.LifeTicks[lastLife] = s.TickCount - lifeStart; lifeStart = s.TickCount; lastLife = st.Life; }
            s.Tick(0, 0, boss.X, boss.Y, false, false);
        }
        r.LifeTicks[Math.Min(2, lastLife)] = s.TickCount - lifeStart;
        r.Ticks = s.TickCount - start; r.Dead = !boss.Alive;
        foreach (var m in s.Druid.MoveLog) { int n; r.Moves.TryGetValue(m.Move, out n); r.Moves[m.Move] = n + 1; }
        return r;
    }

    static double Median(List<int> v) { var a = v.OrderBy(x => x).ToList(); int n = a.Count; return n == 0 ? 0 : n % 2 == 1 ? a[n / 2] : (a[n / 2 - 1] + a[n / 2]) / 2.0; }

    static void FightLengthChecks(string dir)
    {
        var sb = new StringBuilder("{\n  \"botDpsPerTick\": " + D(BotDpsPerTick) + ", \"hitEvery\": " + HitEvery + ", \"level\": " + FightLevel + ",\n  \"scenarios\": [\n");
        double[] dpsList = { BotDpsPerTick, 25, 50, 70, 100 };
        bool firstScn = true;
        foreach (double dps in dpsList)
            foreach (bool rootHit in new[] { false, true })
            {
                if (dps != BotDpsPerTick && rootHit) continue;
                var runs = new List<LenRun>();
                for (int mode = 0; mode < 2; mode++) for (uint k = 0; k < SeedsPerMode; k++) runs.Add(LengthFight(mode, 20261104u + k * 7919u, dps, rootHit));
                var ticks = runs.Select(x => x.Ticks).ToList();
                var minMoves = SevenMoves.ToDictionary(m => m, m => runs.Min(x => { int n; return x.Moves.TryGetValue(m, out n) ? n : 0; }));
                var seedsMissing = SevenMoves.ToDictionary(m => m, m => runs.Count(x => !x.Moves.ContainsKey(m)));
                double med = Median(ticks) / 60.0, mn = ticks.Min() / 60.0, mx = ticks.Max() / 60.0;
                string tag = "dps " + D(dps) + (rootHit ? " rootCut" : "");
                string lifeMed = string.Join("/", Enumerable.Range(0, 3).Select(i => D(Median(runs.Select(x => x.LifeTicks[i]).ToList()) / 60.0)));
                Console.WriteLine("fightlength " + tag + ": base HP " + runs[0].BaseHp + ", " + runs.Count + " fights, median " + D(med) + " s, min " + D(mn) + " s, max " + D(mx) + " s, dead " + runs.Count(x => x.Dead) + "/" + runs.Count
                    + " | life s (median) " + lifeMed + " | min count " + string.Join(" ", SevenMoves.Select(m => m + "=" + minMoves[m])) + " | fights without: " + string.Join(" ", SevenMoves.Select(m => m + "=" + seedsMissing[m])));
                sb.Append(firstScn ? "" : ",\n").Append("    {\"dpsPerTick\": ").Append(D(dps)).Append(", \"rootCut\": ").Append(rootHit ? "true" : "false").Append(", \"baseHp\": ").Append(runs[0].BaseHp).Append(", \"fights\": ").Append(runs.Count)
                  .Append(", \"medianSec\": ").Append(D(med)).Append(", \"minSec\": ").Append(D(mn)).Append(", \"maxSec\": ").Append(D(mx))
                  .Append(", \"lifeMedianSec\": \"").Append(lifeMed).Append("\"")
                  .Append(", \"minMoveCount\": {").Append(string.Join(", ", SevenMoves.Select(m => J(m) + ": " + minMoves[m]))).Append("}")
                  .Append(", \"fightsWithoutMove\": {").Append(string.Join(", ", SevenMoves.Select(m => J(m) + ": " + seedsMissing[m]))).Append("}}");
                firstScn = false;
                if (dps == BotDpsPerTick && !rootHit)
                {
                    Check(runs.All(x => x.Dead), "fightlength: every fight ended with the boss dead");
                    Check(med >= 120 && med <= 180, "fightlength: median " + D(med) + " s outside 120..180 (dps " + D(dps) + ")");
                    foreach (var m in SevenMoves) Check(minMoves[m] >= 1, "fightlength: " + m + " missing in " + seedsMissing[m] + " of " + runs.Count + " fights");
                }
            }
        sb.Append("\n  ]\n}\n");
        File.WriteAllText(Path.Combine(dir, "remodel-fightlength.json"), sb.ToString(), new UTF8Encoding(false));
    }
}
