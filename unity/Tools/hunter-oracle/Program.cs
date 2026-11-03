using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// D-U1: Unity Simulation.HunterMul against the ORIGINAL web _hunterMul (export.cjs), then the same rule through the real hurt path (HurtEnemy -> EnemyHurt.Head).
// usage: HunterOracleTests.dll <oracle.json> [result.json]
class Program
{
    static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }

    static Simulation Make(int rank) { var s = new Simulation(new SimulationConfig { EnemyAiEnabled = false }); s.Random01 = () => .5; s.Growth.Passives["pHunter"] = rank; return s; }

    // hp + shield lost by one hit of `damage` on a fresh lv1 etype0 enemy dressed as boss / elite / rare / plain
    static double Loss(int rank, bool boss, int elite, int etype, int damage)
    {
        var s = Make(rank); var e = s.SpawnNormalEnemy(40, 0);
        e.IsBoss = boss; e.Elite = elite; e.Etype = etype; e.Hp = e.MaxHp = 1000000; e.Shield = 0; e.MaxShield = 0;
        double before = e.Hp + e.Shield; s.HurtEnemy(e, damage); return before - (e.Hp + e.Shield);
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[0]));
        int n = 0, bad = 0;
        foreach (var c in doc.RootElement.GetProperty("cases").EnumerateArray())
        {
            var w = new EnemySpawn { ib = c.GetProperty("ib").GetBoolean(), elite = c.GetProperty("eliteMissing").GetBoolean() ? 0 : c.GetProperty("elite").GetDouble(), etype = c.GetProperty("etype").GetInt32() };
            double web = c.GetProperty("web").GetDouble(), unity = Simulation.HunterMul(w, c.GetProperty("rank").GetInt32());
            n++; if (Math.Abs(web - unity) > 1e-12) { bad++; if (bad <= 5) Console.WriteLine("  differs ib=" + w.ib + " elite=" + w.elite + " etype=" + w.etype + " rank=" + c.GetProperty("rank") + " web=" + web + " unity=" + unity); }
        }
        Check(n > 0 && bad == 0, "web _hunterMul oracle " + n + " cases, mismatches " + bad + " (" + doc.RootElement.GetProperty("function").GetString() + ")");

        // the real hurt path: pHunter 3 adds 30 % on a boss, an elite and a rare, nothing on a plain enemy
        const int dmg = 1000;
        foreach (var t in new[] { ("boss", true, 0, 0), ("elite", false, 2, 0), ("rare", false, 0, 95), ("plain", false, 0, 0) })
        {
            double l0 = Loss(0, t.Item2, t.Item3, t.Item4, dmg), l3 = Loss(3, t.Item2, t.Item3, t.Item4, dmg);
            bool hunted = t.Item1 != "plain"; double ratio = l0 > 0 ? l3 / l0 : 0;
            Check(l0 > 0 && (hunted ? Math.Abs(ratio - 1.3) < .01 : l3 == l0), "HurtEnemy " + t.Item1 + ": pHunter 0 -> " + l0 + ", pHunter 3 -> " + l3 + " (x" + ratio.ToString("0.000") + ", expected " + (hunted ? "x1.3" : "x1") + ")");
        }

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_core_vs_web_hunterMul", passed = failed == 0, failed, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 1) File.WriteAllText(args[1], result);
        Console.WriteLine("HUNTER_RESULT " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
