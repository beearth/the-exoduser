// M1-REGION R-A oracle check: Simulation.Regions.cs / StageFlow.cs against oracle.json (produced by export.cjs from the ORIGINAL web code).
// usage: RegionTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 4) firstFailures.Add(section + ": " + detail); }
    }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; perSection[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static int I(JsonElement e, string k) { return e.GetProperty(k).GetInt32(); }
    static double D(JsonElement e, string k) { return e.GetProperty(k).GetDouble(); }
    static bool B(JsonElement e, string k) { return e.GetProperty(k).GetBoolean(); }
    static bool Null(JsonElement e, string k) { return e.GetProperty(k).ValueKind == JsonValueKind.Null; }

    static Simulation Build(JsonElement c)
    {
        int mw = I(c, "mw"), mh = I(c, "mh"), si = I(c, "si");
        var s = new Simulation(new SimulationConfig { StageIndex = si, EnemyAiEnabled = false }); var rng = new Random(7); s.Random01 = () => rng.NextDouble();
        s.MapTilesWide = mw; s.MapTilesHigh = mh;
        s.SpawnHoles = new SpawnHoleSystem();
        foreach (var h in c.GetProperty("holes").EnumerateArray()) s.SpawnHoles.Holes.Add(new SpawnHole { X = D(h, "x"), Y = D(h, "y"), Size = D(h, "size") });
        var tiles = new int[mw * mh]; var gate = c.GetProperty("gate");
        if (gate.ValueKind != JsonValueKind.Null) tiles[I(gate, "gateY") * mw + I(gate, "bossCx")] = 3;
        s.Stage.InitializeField(tiles, mw);
        var guard = c.GetProperty("guard");
        if (guard.ValueKind != JsonValueKind.Null) s.Stage.GateGuard = new EnemyState { X = (float)D(guard, "x"), Y = (float)D(guard, "y") };
        s.Stage.FieldBossDone = B(c, "fbDone"); s.Stage.Enabled = true;
        s.InitRegions();
        return s;
    }

    static void CompareState(Simulation s, JsonElement web, string what)
    {
        var regs = web.GetProperty("regions");
        if (regs.ValueKind == JsonValueKind.Null) { Check(s.Regions == null, what + " regions null"); return; }
        if (s.Regions == null) { Check(false, what + " regions missing"); return; }
        Check(D(web, "midX") == s.RegMidX && D(web, "midY") == s.RegMidY, what + " mid");
        Check(I(web, "gateIdx") == s.RegGateIdx, what + " gateIdx web " + I(web, "gateIdx") + " cs " + s.RegGateIdx);
        int i = 0;
        foreach (var r in regs.EnumerateArray())
        {
            var m = s.Regions[i];
            Check(I(r, "total") == m.Total, what + " r" + i + " total web " + I(r, "total") + " cs " + m.Total);
            Check(I(r, "kills") == m.Kills, what + " r" + i + " kills web " + I(r, "kills") + " cs " + m.Kills);
            Check(B(r, "cleared") == m.Cleared, what + " r" + i + " cleared web " + B(r, "cleared") + " cs " + m.Cleared);
            Check(I(r, "fbIdx") == m.FbIdx, what + " r" + i + " fbIdx");
            i++;
        }
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;

        // ---- _spawnHoleCount ----
        foreach (var t in Cases(root, "holeCount")) Check(EnemyPools.SpawnHoleCount(D(t, "size"), I(t, "si")) == I(t, "count"), "size " + D(t, "size") + " si " + I(t, "si"));

        // ---- _regionInit ----
        int n = 0;
        foreach (var t in Cases(root, "init")) { var s = Build(t.GetProperty("c")); CompareState(s, t.GetProperty("web"), "init#" + n++); }

        // ---- kills / guard / 15-frame tick / gating ----
        n = 0;
        foreach (var t in Cases(root, "sequence"))
        {
            var c = t.GetProperty("c"); var s = Build(c); int frame = 0; int oi = 0;
            var ops = t.GetProperty("ops").EnumerateArray().ToList(); var trace = t.GetProperty("trace").EnumerateArray().ToList();
            for (; oi < ops.Count; oi++)
            {
                var op = ops[oi]; string kind = op.GetProperty("op").GetString();
                if (kind == "kill")
                {
                    var e = s.SpawnEnemy((float)D(op, "x"), (float)D(op, "y"), 0, null, false);
                    e.IsBoss = B(op, "ib"); e.IsGateGuard = B(op, "guard");
                    if (!Null(op, "hx")) { e.HasHome = true; e.HomeX = D(op, "hx"); e.HomeY = D(op, "hy"); } else e.HasHome = false;
                    s.HarnessKill(e);
                }
                else if (kind == "kills")
                {
                    for (int k = 0; k < I(op, "n"); k++)
                    {
                        var e = s.SpawnEnemy((float)D(op, "hx"), (float)D(op, "hy"), 0, null, false);
                        e.HasHome = true; e.HomeX = D(op, "hx"); e.HomeY = D(op, "hy"); s.HarnessKill(e);
                    }
                }
                else if (kind == "flags")
                {
                    s.Stage.Enabled = B(op, "on"); s.Stage.InArena = B(op, "arena"); s.Stage.LoadPhase = I(op, "load"); s.Stage.FieldBossDone = B(op, "fbDone");
                }
                else
                {
                    for (int k = 0; k < I(op, "n"); k++) { frame++; s.TickCount = frame; s.TickRegions(); }
                }
                var tr = trace[oi]; var web = tr.GetProperty("state");
                string what = "seq#" + n + " op" + oi + " " + kind;
                CompareState(s, web, what);
                if (s.Regions != null)
                {
                    Check(I(tr, "count") == s.RegionClearedCount(), what + " cleared count");
                    int ri = 0;
                    foreach (var rr in tr.GetProperty("ratios").EnumerateArray()) { Check(rr.GetDouble() == s.RegionRatio(s.Regions[ri], ri), what + " ratio r" + ri + " web " + rr.GetDouble().ToString("R") + " cs " + s.RegionRatio(s.Regions[ri], ri).ToString("R")); ri++; }
                }
            }
            n++;
        }

        // ---- Hell Gate unlock with regions ----
        foreach (var t in Cases(root, "unlock"))
        {
            int stage = I(t, "stage"); bool arena = B(t, "arena"), alive = B(t, "alive"), already = B(t, "already"); int mask = I(t, "mask");
            string what = "unlock stage " + stage + " fb " + B(t, "fbDone") + " mask " + mask + " arena " + arena + " alive " + alive + " already " + already;
            if (arena) { Check(B(t, "unlocked") == already, what + " web cannot unlock inside the arena"); continue; }   // CheckRooms inside an arena runs the boss flow, not the gate
            var s = new Simulation(new SimulationConfig { StageIndex = stage, EnemyAiEnabled = false }); var rng = new Random(3); s.Random01 = () => rng.NextDouble();
            s.Regions = new RegionState[4];
            for (int i = 0; i < 4; i++) s.Regions[i] = new RegionState { Id = i, Total = 10, Kills = 10, Cleared = (mask & (1 << i)) != 0 };
            s.Stage.Enabled = true; s.Stage.FieldBossDone = B(t, "fbDone"); s.Stage.BossAlive = alive; s.Stage.BossUnlocked = already; s.Stage.CheckT = 29;
            s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
            Check(s.Stage.HeavyRuns == 1, what + " heavy block ran");
            Check(s.Stage.BossUnlocked == B(t, "unlocked"), what + " web " + B(t, "unlocked") + " cs " + s.Stage.BossUnlocked);
        }

        // ---- enemy list hard cap (> 800 -> 700, culled = kills) ----
        n = 0;
        foreach (var t in Cases(root, "cap"))
        {
            var s = new Simulation(new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false }); var rng = new Random(11); s.Random01 = () => rng.NextDouble();
            var pj = t.GetProperty("P"); s.Player.X = (float)D(pj, "x"); s.Player.Y = (float)D(pj, "y");
            int idx = 0;
            foreach (var e in t.GetProperty("input").EnumerateArray())
            {
                s.Enemies.Add(new EnemyState { Id = idx++, X = (float)D(e, "x"), Y = (float)D(e, "y"), Alive = B(e, "alive"), IsBoss = B(e, "ib"), ReviveTimer = D(e, "reviveTimer") });
            }
            int kills0 = s.Kills; s.CapEnemies();
            string what = "cap#" + n++ + " n=" + I(t, "n");
            var kept = t.GetProperty("kept").EnumerateArray().Select(x => x.GetInt32()).ToList();
            Check(s.Enemies.Select(e => e.Id).SequenceEqual(kept), what + " kept list (web " + kept.Count + ", cs " + s.Enemies.Count + ")");
            Check(s.Kills - kills0 == I(t, "kills") && s.Kills - kills0 == I(t, "stageKills"), what + " kills web " + I(t, "kills") + " cs " + (s.Kills - kills0));
        }

        // ---- HUD "지역 처치" row (#mmLvl killCnt, 60584~60586): Simulation.AreaKills with the HUD's G._regCurIdx (LT-5) ----
        n = 0;
        foreach (var t in Cases(root, "hudKills"))
        {
            var s = new Simulation(new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false });
            if (!Null(t, "regions")) s.Regions = t.GetProperty("regions").EnumerateArray().Select(r => new RegionState { Id = I(r, "id"), Total = I(r, "total"), Kills = I(r, "kills"), Cleared = B(r, "cleared") }).ToArray();
            s.Kills = Null(t, "stageKills") ? 0 : I(t, "stageKills"); s.Stage.TotalSpawned = Null(t, "totalSpawned") ? 0 : I(t, "totalSpawned");   // G._stageKills||0, G._totalSpawned||0
            int k, tot; s.AreaKills(I(t, "curIdx"), out k, out tot);
            Check(k == I(t, "k") && tot == I(t, "t"), "hud#" + n++ + " cur " + I(t, "curIdx") + " web " + I(t, "k") + "/" + I(t, "t") + " cs " + k + "/" + tot);
        }

        Console.WriteLine("REGION_RESULT " + checks + " checks / " + bad + " failures");
        foreach (var kv in perSection) Console.WriteLine("  " + kv.Key + ": " + kv.Value[0] + " checks, " + kv.Value[1] + " failures");
        foreach (var f in firstFailures) Console.WriteLine("FAIL " + f);
        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_not_Unity_runtime", passed = bad == 0, checks, failures = bad, sections = perSection.ToDictionary(k => k.Key, k => new { checks = k.Value[0], failures = k.Value[1] }), firstFailures }, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(args[0], result);
        return bad == 0 ? 0 : 1;
    }
}
