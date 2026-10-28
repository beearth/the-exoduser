// RM-1 sound slice: drives the real Simulation (EnemyAi on, DruidRemodel on, arena entered through StageFlow) and writes the sound timeline the Core produces.
// usage: Rm1SoundTimeline.dll <out-dir>     writes timeline-r2.json (ordinary fight, ~30 s) and timeline-druid.json (whole druid fight) ; the Unity replay (Rm1SoundCapture) plays them through the real audio adapter.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

static class P
{
    sealed class Row { public int Tick; public string Type, Kind, Key, Source; public float X, Y, Volume, Rate, Size; public int Etype, Step; public bool Boss; }

    static string J(string s) { return s == null ? "null" : "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\""; }
    static string F(float v) { return v.ToString("0.###", CultureInfo.InvariantCulture); }
    static string Line(Row r) { return "{\"tick\":" + r.Tick + ",\"type\":" + J(r.Type) + ",\"kind\":" + J(r.Kind) + ",\"key\":" + J(r.Key) + ",\"source\":" + J(r.Source) + ",\"x\":" + F(r.X) + ",\"y\":" + F(r.Y) + ",\"volume\":" + F(r.Volume) + ",\"rate\":" + F(r.Rate) + ",\"size\":" + F(r.Size) + ",\"etype\":" + r.Etype + ",\"step\":" + r.Step + ",\"boss\":" + (r.Boss ? "true" : "false") + "}"; }

    static void Drain(Simulation s, List<Row> rows)
    {
        while (s.Feedback.Count > 0)
        {
            var e = s.Feedback.Dequeue();
            if (e.Kind == FeedbackKind.KiChargeFlash || e.Kind == FeedbackKind.KiSlashHit) continue;
            rows.Add(new Row { Tick = e.Tick, Type = "feedback", Kind = e.Kind.ToString(), Key = e.SampleKey, Source = e.Source, X = e.X, Y = e.Y, Volume = e.Volume, Rate = e.QueuedRate != 0 ? e.QueuedRate : e.Rate, Size = e.Size, Etype = e.Etype, Step = e.Step, Boss = e.IsBoss });
        }
        while (s.Stage.Events.Count > 0)
        {
            var e = s.Stage.Events.Dequeue();
            rows.Add(new Row { Tick = e.Tick, Type = "stage", Kind = e.Kind.ToString(), X = e.X, Y = e.Y });
        }
    }

    static void Write(string path, List<Row> rows, string scenario)
    {
        var sb = new StringBuilder("{\"scenario\":" + J(scenario) + ",\"ticksPerSecond\":60,\"rows\":[\n");
        for (int i = 0; i < rows.Count; i++) sb.Append(Line(rows[i])).Append(i + 1 < rows.Count ? ",\n" : "\n");
        File.WriteAllText(path, sb.Append("]}\n").ToString());
    }

    // R2: an ordinary field fight. The player stands among monsters of the 1-1 etypes, swings, rolls, gets hit; nothing but the real Core decides what makes a sound.
    static void R2(string outDir)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 60, PlayerCriticalChance = 35 }, 20261028);
        s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp; var p = s.Player; var rows = new List<Row>();
        int[] etypes = { 0, 0, 5, 3, 4, 7, 22, 28, 0, 1, 11, 25, 0, 2 };
        int spawned = 0, tick = 0;
        for (; tick < 1800; tick++)
        {
            p.Hp = p.MaxHp;
            if (tick % 90 == 0 && s.Enemies.Count(e => e.Alive) < 10)
            {   // a new monster every 1.5 s on a ring 180..320 px away
                double a = spawned * 2.399; float r = 180 + (spawned * 37 % 140);
                var e = s.SpawnEnemy(p.X + (float)Math.Cos(a) * r, p.Y + (float)Math.Sin(a) * r, etypes[spawned % etypes.Length]); spawned++;
                if (e != null) { e.Hp = e.MaxHp = 90 + (spawned % 5) * 70; }
            }
            // aim at the nearest live monster, swing; roll every ~4 s
            EnemyState nearest = null; double best = 1e9;
            foreach (var e in s.Enemies) if (e.Alive) { double d = Math.Sqrt((e.X - p.X) * (e.X - p.X) + (e.Y - p.Y) * (e.Y - p.Y)); if (d < best) { best = d; nearest = e; } }
            float ax = nearest != null ? nearest.X : p.X + 100, ay = nearest != null ? nearest.Y : p.Y;
            float mx = 0, my = 0; if (nearest != null && best > 70) { mx = (ax - p.X) / (float)best; my = (ay - p.Y) / (float)best; }
            if (tick % 240 == 120) s.QueueRoll(tick / 240 % 4);
            p.Poise = 4; if (p.State == "pStun" || p.State == "stagger") { p.State = "idle"; p.StateTicks = 0; }   // the fixture keeps the player on his feet
            if (tick % 14 == 0) { var live = s.Enemies.Where(q => q.Alive).ToList(); if (live.Count > 0) { var tg = live[(tick / 14) % live.Count]; if ((tick / 14) % 9 == 0) { tg.Hp = Math.Min(tg.Hp, 60); tg.Shield = 0; } s.HurtEnemy(tg, 140, (float)Math.Atan2(tg.Y - p.Y, tg.X - p.X)); } }   // a steady stream of hits, kills and crits
            p.Mana = p.MaxMana;
            s.SetMagicInput(tick % 600 >= 300 && tick % 600 < 306);   // the E spell (fireball): a short press every 10 s, once released after one cast
            s.Tick(mx, my, ax, ay, tick % 600 >= 300 && tick % 600 < 306 ? false : true, false);
            Drain(s, rows);
        }
        Console.WriteLine("r2 kills=" + s.Kills + " damage=" + s.TotalDamage + " hurtPlayer=" + s.HurtCount + " enemiesNow=" + string.Join(",", s.Enemies.Where(e => e.Alive).Select(e => e.Etype + ":" + e.Hp + "@" + (int)Math.Sqrt((e.X - p.X) * (e.X - p.X) + (e.Y - p.Y) * (e.Y - p.Y)))) + " playerState=" + p.State);
        Write(Path.Combine(outDir, "timeline-r2.json"), rows, "R2 ordinary fight, 30 s (real Simulation)");
        Console.WriteLine("r2 rows=" + rows.Count + " kinds=" + string.Join(",", rows.GroupBy(r => r.Kind + ":" + r.Key).Select(g => g.Key + "x" + g.Count())));
    }

    // the whole remodelled druid fight (arena entry -> P1 -> P2 -> P3 -> sink), the same scripted player as Tools/druid-remodel-test
    static void Druid(string outDir, uint seed)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        s.DruidRemodel = true; s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp; s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        var p = s.Player; var rows = new List<Row>(); int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) { s.Tick(0, 0, p.X + 100, p.Y, false, false); Drain(s, rows); }
        var boss = s.Stage.Boss; if (boss == null) throw new Exception("boss did not spawn");
        int dmg = Math.Max(1, (int)Math.Ceiling(boss.MaxHp * 0.0085)), hitCd = 0, killGuard = 0;   // ~2.7 hits a second (every 22 ticks)
        var rng = new Random((int)seed * 7 + 1); DruidData dd = null; s.Druid.Data.TryGetValue(boss, out dd);
        string prevState = ""; int attacks = 0, evadeRoll = 0, evadeParry = 0, taken = 0, rollAt = -1, parryAt = -1, parryHold = 0, hurt0 = s.HurtCount, parries0 = s.ParryCount, lastParries = s.ParryCount;
        var hurtByState = new Dictionary<string, int>(); int lastHurt = s.HurtCount; double orbit = 0.9; int moveCd = 0;
        Func<string, bool> isAttackState = n => n != null && (n.EndsWith("Wind") || n == "bossDruidDive" || n == "bossSlash");
        for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; Drain(s, rows); }
        while (boss.Alive && killGuard++ < 40000)
        {
            p.Hp = p.MaxHp; var st = s.DruidLife(boss);
            if (dd == null) s.Druid.Data.TryGetValue(boss, out dd);
            if (st == null || !st.Collapsing)
            {
                // telegraph reading: the moment he enters a wind-up / dive / follow-up swing, decide (fixture RNG): ~70 % avoid it (roll, or a parry for parryable swings), ~30 % take it
                if (dd != null && dd.S != prevState && isAttackState(dd.S))
                {
                    attacks++; double pick = rng.NextDouble();
                    if (pick < .85)
                    {
                        if (dd.AtkParryable && rng.NextDouble() < .45) { parryAt = s.TickCount + Math.Max(0, (int)dd.St2 - 7); evadeParry++; }
                        else { rollAt = s.TickCount + Math.Max(0, (int)dd.St2 - 9); evadeRoll++; }
                    }
                    else taken++;
                }
                if (dd != null) prevState = dd.S;
                if (rollAt >= 0 && s.TickCount >= rollAt) { s.QueueRoll(attacks % 4); rollAt = -1; }
                double ang = Math.Atan2(boss.Y - 800, boss.X - 800) + orbit; p.X = (float)(boss.X + Math.Cos(ang) * 110); p.Y = (float)(boss.Y + Math.Sin(ang) * 110);
                if (!s.CanMove((float)p.X, (float)p.Y, p.Radius)) { p.X = boss.X + 110; p.Y = boss.Y; }
                if (hitCd-- <= 0) { s.HurtEnemy(boss, dmg); hitCd = 22; }
                if (dd != null && killGuard % 30 == 0) foreach (var mn in dd.Minions.ToArray()) if (mn.Alive) s.HurtEnemy(mn, 100000);   // a real player cuts down the summoned minions at once
            }
            bool qNow = false; if (parryAt >= 0 && s.TickCount >= parryAt) { parryHold = 22; parryAt = -1; } if (parryHold-- > 0) qNow = true;
            s.SetPlayerCombatInput(qNow, false, false);
            s.Tick(0, 0, boss.X, boss.Y, false, false); Drain(s, rows);
            if (s.HurtCount != lastHurt) { string k = (dd != null ? dd.S : "?"); int mm = 0; foreach (var d2 in s.Druid.Data.Values) mm += d2.Minions.Count(x => x.Alive); k += mm > 0 ? "+minions" : ""; hurtByState[k] = (hurtByState.ContainsKey(k) ? hurtByState[k] : 0) + (s.HurtCount - lastHurt); lastHurt = s.HurtCount; if (moveCd <= 0) { orbit += 0.9; moveCd = 60; p.Iframes = Math.Max(p.Iframes, 60); } }   // a real player steps out of whatever hit him (hazard zone, pool) and gets a moment of grace
            if (moveCd > 0) moveCd--;
            if (s.ParryCount != lastParries) { rows.Add(new Row { Tick = s.TickCount, Type = "note", Kind = "ParrySuccess", Key = "parry", Source = "druid fight: player parry succeeded (ParryCount " + s.ParryCount + ")" }); lastParries = s.ParryCount; }
        }
        for (int i = 0; i < 300; i++) { p.Hp = p.MaxHp; p.Iframes = 600; s.Tick(0, 0, p.X + 100, p.Y, false, false); Drain(s, rows); }
        Console.WriteLine("druid fight script: attacks seen " + attacks + " (evade by roll " + evadeRoll + ", by parry " + evadeParry + ", not evaded " + taken + "); hits that landed on the player " + (s.HurtCount - hurt0) + " (" + (attacks > 0 ? ((s.HurtCount - hurt0) * 100 / attacks).ToString() : "0") + " % of the attacks seen); parries succeeded " + (s.ParryCount - parries0));
        Console.WriteLine("hurt by boss state: " + string.Join(", ", hurtByState.OrderByDescending(kv => kv.Value).Select(kv => kv.Key + "=" + kv.Value)));
        Console.WriteLine("druid seed " + seed + " moves: " + string.Join(",", s.Druid.MoveLog.GroupBy(m => m.Move).Select(g => g.Key + "x" + g.Count())));
        Write(Path.Combine(outDir, "timeline-druid.json"), rows, "1-1 druid fight: arena entry, P1-P3, sink (real Simulation, DruidRemodel on, seed " + seed + ")");
        Console.WriteLine("druid rows=" + rows.Count + " ticks=" + s.TickCount + " kinds=" + string.Join(",", rows.GroupBy(r => r.Kind + ":" + r.Key).Select(g => g.Key + "x" + g.Count())));
    }

    static int Main(string[] args)
    {
        string outDir = args.Length > 0 ? args[0] : "."; Directory.CreateDirectory(outDir);
        uint seed = args.Length > 1 ? uint.Parse(args[1]) : 11; if (args.Length < 3 || args[2] != "druid-only") R2(outDir); Druid(outDir, seed); return 0;
    }
}
