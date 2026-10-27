// B10 oracle check: compares Runtime/Core/RageMalice.cs with oracle.json (produced by export.cjs from the ORIGINAL game.html statements).
// usage: RageMaliceTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static readonly Dictionary<string, int[]> per = new Dictionary<string, int[]>();
    static readonly List<string> failures = new List<string>();
    static string section = "";

    static void Check(bool ok, string detail)
    {
        checks++; var c = per[section]; c[0]++;
        if (!ok) { bad++; c[1]++; if (c[1] <= 5) failures.Add(section + ": " + detail); }
    }
    static double N(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : 0; }
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; per[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static string Num(double v) { return v.ToString("0.###############", CultureInfo.InvariantCulture); }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        foreach (var c in Cases(root, "rageMax"))
        {
            double got = RageMalice.RageMax(B(c, "lesson"), N(c, "uMax"), N(c, "flat"), N(c, "pRage"));
            Check(got == c.GetProperty("out").GetDouble(), c.GetRawText() + " -> C# " + got);
        }
        foreach (var c in Cases(root, "add"))
        {
            string kind = c.GetProperty("kind").GetString();
            double max = RageMalice.RageMax(B(c, "lesson"), 0, N(c, "flat"), N(c, "pRage")), rage = N(c, "rage"), got;
            if (kind == "parry") got = RageMalice.Add(rage, N(c, "add"), max);
            else if (kind == "armor") got = RageMalice.Add(rage, RageMalice.ArmorRageAdd, max);
            else got = RageMalice.FractionAdd(rage, max, N(c, "frac"));
            Check(got == c.GetProperty("out").GetDouble(), c.GetRawText() + " -> C# " + got);
        }
        foreach (var c in Cases(root, "slam"))
        {
            double max = RageMalice.RageMax(false, 0, N(c, "flat"), N(c, "pRage")), rage = N(c, "rage");
            var r = RageMalice.Slam(rage, max, N(c, "pRage"), N(c, "rdmg"), N(c, "ember"));
            var o = c.GetProperty("out");
            var texts = new List<string>();
            if (rage > 0)
            {
                texts.Add("🔥분노 " + Num(r.Consumed) + "% → +" + Num(r.BonusPercent) + "%!");
                if (r.Ember > 0) texts.Add("잔불 분노! +" + Num(r.Ember));
            }
            var webTexts = new List<string>(); foreach (var t in o.GetProperty("texts").EnumerateArray()) webTexts.Add(t.GetString());
            bool ok = r.DamageMul == o.GetProperty("rageMul").GetDouble() && r.RageAfter == o.GetProperty("rage").GetDouble()
                && r.Bombs == (int)N(o, "lava") && string.Join("|", texts) == string.Join("|", webTexts);
            Check(ok, c.GetRawText() + " -> C# mul=" + r.DamageMul + " rage=" + r.RageAfter + " bombs=" + r.Bombs + " texts=" + string.Join("|", texts));
        }
        foreach (var c in Cases(root, "malCost"))
        {
            int got = RageMalice.Cost(N(c, "v"));
            Check(got == (int)c.GetProperty("out").GetDouble(), c.GetRawText() + " -> C# " + got);
        }
        foreach (var c in Cases(root, "pickup"))
        {
            int got = RageMalice.PickupAmount(N(c, "matVal"), N(c, "gold"), N(c, "pMal"));
            Check(got == (int)c.GetProperty("out").GetDouble(), c.GetRawText() + " -> C# " + got);
        }
        foreach (var c in Cases(root, "elite"))
        {
            bool elite = B(c, "ib") || N(c, "elite") > 0 || (c.TryGetProperty("ib", out var ib) && ib.ValueKind == JsonValueKind.Number && ib.GetDouble() > 0);
            int got;
            double[] drop = { 0, .5, 1.5, 3 };   // ELITE_TIERS dropBonus per tier (checked against EliteTables by the Unity smoke)
            if (c.GetProperty("kind").GetString() == "instant")
                got = elite ? RageMalice.EliteDrop((int)N(c, "stage"), drop[(int)N(c, "elite")], N(c, "gold"), N(c, "pMal")) : 0;
            else
                got = elite ? RageMalice.EliteExtra(N(c, "rnd"), N(c, "combo")) : 0;
            Check(got == (int)c.GetProperty("out").GetDouble(), c.GetRawText() + " -> C# " + got);
        }
        var sum = new List<string>();
        foreach (var kv in per) sum.Add("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failures\":" + kv.Value[1] + "}");
        File.WriteAllText(args[0], "{\"checks\":" + checks + ",\"failures\":" + bad + ",\"sections\":{" + string.Join(",", sum) + "},\"first\":" + JsonSerializer.Serialize(failures) + "}");
        Console.WriteLine("checks=" + checks + " failures=" + bad);
        foreach (var f in failures) Console.WriteLine(f);
        return bad > 0 ? 1 : 0;
    }
}
