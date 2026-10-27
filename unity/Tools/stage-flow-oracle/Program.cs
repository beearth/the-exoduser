// PC-C07 stage-flow oracle check: BossArena.cs / StageFlow.cs against oracle.json (produced by export.cjs from the ORIGINAL web code).
// usage: StageFlowTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static readonly Dictionary<string, int[]> perSection = new Dictionary<string, int[]>();
    static readonly List<string> firstFailures = new List<string>();
    static string section = "";

    static void Check(bool ok, string detail)
    {
        checks++; var c = perSection[section]; c[0]++;
        if (!ok) { bad++; c[1]++; if (c[1] <= 3) firstFailures.Add(section + ": " + detail); }
    }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; perSection[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static int I(JsonElement e, string k) { return e.GetProperty(k).GetInt32(); }
    static bool B(JsonElement e, string k) { return e.GetProperty(k).GetBoolean(); }
    static int[] Ints(JsonElement e) { return e.EnumerateArray().Select(x => x.GetInt32()).ToArray(); }

    static Simulation NewSim(int stage)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = stage, EnemyAiEnabled = false }); s.Random01 = () => .5;
        s.Stage.Enabled = true;
        s.Stage.BossSpawners[stage] = (sim, x, y) => sim.AddEnemy(new EnemyState { Etype = 0, Hp = 100, MaxHp = 100, X = x, Y = y, Radius = 20, IsBoss = true });
        return s;
    }
    static void Run(Simulation s, int ticks) { for (int i = 0; i < ticks; i++) s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false); }
    static int Count(Simulation s, StageEventKind k) { return s.Stage.Events.Count(e => e.Kind == k); }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;

        // ---- arena: genBossArena for all 35 stages, then the live flow (enter -> boss dead -> exit opened) ----
        foreach (var t in Cases(root, "arena"))
        {
            int si = I(t, "si"); var lay = BossArenaLayout.Generate(si);
            var tiles = Ints(t.GetProperty("tiles"));
            Check(I(t, "mw") == BossArenaLayout.Width && I(t, "mh") == BossArenaLayout.Height, "size si" + si);
            Check(tiles.SequenceEqual(lay.Tiles), "tiles si" + si);
            Check(I(t, "exitX") == lay.ExitX && I(t, "exitY") == lay.ExitY, "exit si" + si);
            Check(I(t, "entryX") == lay.EntryX && I(t, "entryY") == lay.EntryY, "entry si" + si);
            Check(I(t, "bossX") == lay.BossX && I(t, "bossY") == lay.BossY, "boss si" + si);
            var r = t.GetProperty("room");
            Check(I(r, "x") == lay.RoomX && I(r, "y") == lay.RoomY && I(r, "w") == lay.RoomW && I(r, "h") == lay.RoomH && I(r, "cx") == lay.RoomCx && I(r, "cy") == lay.RoomCy, "room si" + si);
            // live flow
            var s = NewSim(si); s.Stage.LoadPhase = 1; Run(s, 60);
            Check(s.Stage.InArena && s.Stage.Arena != null && s.Stage.Arena.Tiles.SequenceEqual(tiles), "flow arena tiles si" + si);
            Check(Math.Abs(s.Player.X - (lay.EntryX + .5f) * 40) < 1e-3 && Math.Abs(s.Player.Y - (lay.EntryY + .5f) * 40) < 1e-3, "player entry si" + si);
            var boss = s.Stage.Boss;
            Check(boss != null && boss.IsBoss && Math.Abs(boss.X - (lay.BossX + .5f) * 40) < 1e-3 && Math.Abs(boss.Y - (lay.BossY + .5f) * 40) < 1e-3, "boss spawn si" + si);
            Check(s.Stage.Exits.Count == 0, "exits empty before boss death si" + si);
            Check(!s.Stage.StageCleared, "no clear before boss death si" + si);
            Run(s, 300);   // phases 3 / 4 finish
            if (boss != null) boss.Alive = false;
            Run(s, 31);
            Check(!s.Stage.BossAlive && s.Stage.Exits.Count == 1 && s.Stage.Exits[0].X == lay.ExitX && s.Stage.Exits[0].Y == lay.ExitY, "exit pushed si" + si);
            Check(s.Stage.Arena.Tiles.SequenceEqual(Ints(t.GetProperty("opened"))), "opened tiles si" + si);
            Check(Count(s, StageEventKind.BossDefeated) == 1 && Count(s, StageEventKind.ExitOpened) == 1 && Count(s, StageEventKind.ChestSpawned) == 1, "defeat events si" + si);
            // stepping on the exit clears the stage (+10 SP) within one 30-frame period
            int sp0 = s.Player.StatPoints; s.Player.X = (lay.ExitX + .5f) * 40; s.Player.Y = (lay.ExitY + .5f) * 40;
            s.Stage.CheckT = 0; Run(s, 31);
            Check(s.Stage.StageCleared && s.Player.StatPoints == sp0 + 10 && Count(s, StageEventKind.StageCleared) == 1, "clear si" + si);
        }

        // ---- field: exit / gate tiles of the original 1-1 map data against _applyCh1StartNorthGate ----
        {
            section = "field"; perSection[section] = new int[2];
            var f = root.GetProperty("sections").GetProperty("field"); var web = f.GetProperty("web");
            var s = NewSim(0); s.Stage.InitializeField(Ints(f.GetProperty("tiles")), I(f, "width"));
            var exits = web.GetProperty("exits").EnumerateArray().Select(e => (I(e, "x"), I(e, "y"))).ToList();
            Check(s.Stage.Exits.Select(e => (e.X, e.Y)).SequenceEqual(exits), "exits");
            Check(s.Stage.FieldGateCx == I(web, "bossCx") && s.Stage.FieldGateY == I(web, "gateY"), "gate cx/y");
            Check(exits.All(e => e.Item2 == I(web, "exitY")), "exitY");
            var gates = web.GetProperty("gateTiles").EnumerateArray().Select(e => (I(e, "x"), I(e, "y"))).ToList();
            var tilesArr = Ints(f.GetProperty("tiles")); int w = I(f, "width");
            Check(gates.All(g => tilesArr[g.Item2 * w + g.Item1] == 3) && tilesArr.Count(v => v == 3) == gates.Count && tilesArr.Count(v => v == 2) == exits.Count, "tile values 2 / 3");
        }

        // ---- boss-load phases + the 30-frame cadence ----
        section = "loadPhases"; perSection[section] = new int[2];
        foreach (var run in root.GetProperty("sections").GetProperty("loadPhases").EnumerateArray())
        {
            bool withBoss = B(run, "withBoss");
            var s = NewSim(0); if (!withBoss) s.Stage.BossSpawners[0] = (sim, x, y) => null;
            s.Stage.LoadPhase = 1; s.Stage.CheckT = I(run, "startCrT"); s.Player.State = "wSwing"; s.Player.StateTicks = 5;
            int heavyBefore = 0, enteredAt = 0, introAt = -1, tick = 0; EnemyState seen = null; float stunAtIntro = -1, reviveAtIntro = -1;
            foreach (var w in run.GetProperty("trace").EnumerateArray())
            {
                tick++;
                s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
                bool heavy = s.Stage.HeavyRuns != heavyBefore; heavyBefore = s.Stage.HeavyRuns;
                if (enteredAt == 0 && s.Stage.Arena != null) enteredAt = tick;
                if (introAt < 0 && s.Stage.Events.Any(e => e.Kind == StageEventKind.BossIntro)) { introAt = tick; seen = s.Stage.Boss; if (seen != null) { stunAtIntro = seen.Stunned; reviveAtIntro = (float)seen.ReviveIframes; } }
                Check(s.Stage.LoadPhase == I(w, "phase"), "phase@" + tick + " " + s.Stage.LoadPhase + "!=" + I(w, "phase"));
                Check(Math.Abs(s.Stage.LoadT - w.GetProperty("t").GetDouble()) < 1e-9, "T@" + tick);
                Check(Math.Abs(s.Stage.LoadFade - w.GetProperty("fade").GetDouble()) < 1e-12, "fade@" + tick);
                Check(heavy == B(w, "heavy"), "heavy@" + tick);
                if (tick <= 330) Check(s.Player.State == w.GetProperty("pState").GetString() && s.Player.StateTicks == I(w, "pSt2"), "player idle@" + tick + " " + s.Player.State);
                Check((enteredAt == tick) == B(w, "entered"), "entered@" + tick);
            }
            Check(enteredAt == I(run, "entered"), "entered tick " + enteredAt);
            Check(introAt == I(run, "introAt"), "intro tick " + introAt + " vs " + I(run, "introAt"));
            if (withBoss) Check(stunAtIntro == run.GetProperty("introStunned").GetDouble() && reviveAtIntro == run.GetProperty("introRevive").GetDouble(), "intro stun/revive");
        }

        // ---- Hell Gate unlock (region-less branch) ----
        foreach (var t in Cases(root, "unlock"))
        {
            var s = NewSim(I(t, "stage")); s.Stage.FieldBossDone = B(t, "fb"); s.Stage.GateGuardKilled = B(t, "gk"); s.Stage.TotalSpawned = I(t, "tot"); s.Kills = I(t, "kills");
            s.Stage.CheckT = 29; Run(s, 1);
            bool u = s.Stage.BossUnlocked; int ann = Count(s, StageEventKind.GateUnlocked);
            Check(u == B(t, "unlocked") && ann == I(t, "announced"), "stage" + I(t, "stage") + " fb" + B(t, "fb") + " gk" + B(t, "gk") + " tot" + I(t, "tot") + " kills" + I(t, "kills") + ": got " + u + "/" + ann);
        }

        // ---- exit tile stepped on in the field: angler / sealed / start load ----
        int skipped = 0;
        foreach (var t in Cases(root, "exitGate"))
        {
            int stage = I(t, "stage"), tot = I(t, "tot"), kills = I(t, "kills"); bool fb = B(t, "fb"), unl = B(t, "unlocked"), gk = B(t, "gk");
            bool krakenOk = stage != 0 || fb; bool wouldUnlock = krakenOk && (tot <= 0 || (double)kills / tot + (gk ? .10 : 0) >= .8);
            if (!unl && wouldUnlock) { skipped++; continue; }   // the unlock block runs first in the same pass; it is covered by the "unlock" section
            var s = NewSim(stage); s.Stage.FieldBossDone = fb; s.Stage.BossUnlocked = unl; s.Stage.GateGuardKilled = gk; s.Stage.TotalSpawned = tot; s.Kills = kills;
            s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29; s.TickCount = I(t, "frame") - 1;
            s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
            string msg = null; int pct = -1;
            foreach (var e in s.Stage.Events) { if (e.Kind == StageEventKind.GateAnglerBlocked) msg = "angler"; else if (e.Kind == StageEventKind.GateSealed) { msg = "sealed"; pct = e.Percent; } }
            string exp = t.GetProperty("msg").ValueKind == JsonValueKind.Null ? null : t.GetProperty("msg").GetString();
            bool ok = s.Stage.LoadPhase == I(t, "loadPhase") && msg == exp && (exp != "sealed" || pct == I(t, "pct"));
            Check(ok, "stage" + stage + " fb" + fb + " unl" + unl + " gk" + gk + " tot" + tot + " kills" + kills + " frame" + I(t, "frame") + ": phase " + s.Stage.LoadPhase + " msg " + msg + "/" + pct + " vs " + I(t, "loadPhase") + " " + exp + "/" + (t.GetProperty("pct").ValueKind == JsonValueKind.Null ? "-" : I(t, "pct").ToString()));
        }

        // ---- Unity extension point (no web counterpart): no boss spawner registered => the gate holds, nothing breaks ----
        section = "extension"; perSection[section] = new int[2];
        {
            var s = new Simulation(new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false }); s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
            s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29; s.TickCount = 44;
            s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
            Check(s.Stage.LoadPhase == 0 && Count(s, StageEventKind.BossCoreMissing) == 1 && !s.Stage.InArena, "no spawner => BossCoreMissing, no arena");
            // a boss etype other than 0 is accepted once it is flagged IsBoss (boss Core extension), a non-boss one still throws
            var s2 = NewSim(0); var b = s2.AddEnemy(new EnemyState { Etype = 77, Hp = 1000, MaxHp = 1000, Shield = 0, MaxShield = 0, X = 500, Y = 500, Radius = 20, IsBoss = true, Level = 1 });
            bool threw = false; try { s2.HurtEnemy(b, 10); } catch (NotSupportedException) { threw = true; }
            Check(!threw && b.Hp < 1000, "IsBoss etype 77 takes damage");
            var plain = s2.AddEnemy(new EnemyState { Etype = 77, Hp = 1000, MaxHp = 1000, X = 600, Y = 600, Radius = 20, Level = 1 });
            threw = false; try { s2.HurtEnemy(plain, 10); } catch (NotSupportedException) { threw = true; }
            Check(threw, "non-boss etype 77 still throws");
            // BossTick replaces the generic enemy tick for IsBoss
            var s3 = NewSim(0); s3.Config.EnemyAiEnabled = true; int calls = 0; s3.BossTick = e => calls++;
            var bb = s3.AddEnemy(new EnemyState { Etype = 0, Hp = 100, MaxHp = 100, X = 500, Y = 500, Radius = 20, IsBoss = true });
            Run(s3, 5); Check(calls == 5, "BossTick called per tick");
            // death retry in the arena restores the field
            var s4 = NewSim(0); s4.CanMove = (x, y, r) => true; s4.Stage.InitializeField(new int[200 * 200], 200); s4.Stage.LoadPhase = 1; Run(s4, 60);
            Check(s4.Stage.InArena, "retry setup");
            s4.Stage.LeaveArenaToField();
            Check(!s4.Stage.InArena && s4.Stage.BossAlive && s4.Stage.LoadPhase == 0 && Count(s4, StageEventKind.FieldRestored) == 1, "retry restores the field");
        }

        // ---- report ----
        var report = new Dictionary<string, object> { { "checks", checks }, { "failures", bad }, { "skippedExitGate", skipped }, { "sections", perSection.ToDictionary(k => k.Key, k => new { checks = k.Value[0], failures = k.Value[1] }) }, { "firstFailures", firstFailures } };
        File.WriteAllText(args[0], JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine(checks.ToString("N0") + " checks, " + bad + " failures (exit-gate cases folded into the unlock section: " + skipped + ")");
        foreach (var f in firstFailures) Console.WriteLine("FAIL " + f);
        return bad == 0 ? 0 : 1;
    }
}
