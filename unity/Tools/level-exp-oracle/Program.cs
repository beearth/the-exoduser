// D05 oracle check: compares Runtime/Core/LevelExp.cs with oracle.json (produced by export.cjs from the ORIGINAL game.html code).
// usage: LevelExpTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
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
    static double N(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : double.NaN; }
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; per[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        foreach (var c in Cases(root, "maxExp"))
        {
            int lv = (int)N(c, "lv");
            Check(LevelExp.MaxExperience(lv) == c.GetProperty("out").GetDouble(), "lv " + lv + " C#=" + LevelExp.MaxExperience(lv) + " web=" + c.GetProperty("out").GetDouble());
        }
        foreach (var c in Cases(root, "add"))
        {
            var p = new PlayerState { Level = (int)N(c, "lv"), Experience = (int)N(c, "exp"), MaxExperience = (int)N(c, "maxExp"), TransDate = S(c, "date"), TransCount = (int)N(c, "count") };
            var ctx = new ExpContext { NecklaceExpBonus = N(c, "nb"), AffixExpBonus = N(c, "ab"), DemoLevelCap = (int)N(c, "cap"), Today = root.GetProperty("wrapper").GetProperty("today").GetString() };
            var up = LevelExp.Add(p, (int)N(c, "v"), B(c, "trans"), ctx);
            var o = c.GetProperty("out");
            string ctxText = c.GetRawText();
            int levels = (int)N(o, "levels"), apGain = (int)N(o, "apGain");
            bool ok = p.Level == (int)N(o, "lv") && p.Experience == (int)N(o, "exp") && p.MaxExperience == (int)N(o, "maxExp") && p.StatPoints == (int)N(o, "sp") && p.PassivePoints == (int)N(o, "ap")
                && p.TransCount == (int)N(o, "count") && p.TransDate == S(o, "date")
                && (levels > 0) == (up != null) && (up == null || (up.Levels == levels && up.StatPoints == levels * 3 && up.PassivePoints == apGain && up.NewLevel == p.Level));
            Check(ok, ctxText + " -> C# lv=" + p.Level + " exp=" + p.Experience + " max=" + p.MaxExperience + " sp=" + p.StatPoints + " ap=" + p.PassivePoints + " cnt=" + p.TransCount + " date=" + p.TransDate + " up=" + (up == null ? "null" : up.Levels + "/" + up.PassivePoints));
        }
        foreach (var c in Cases(root, "kill"))
        {
            bool trans;
            int v = LevelExp.KillValue((int)N(c, "pl"), (int)N(c, "lv"), B(c, "ib"), (int)N(c, "elite"), LevelExp.ComboBonus((int)N(c, "combo"), (int)N(c, "diff")), out trans);
            var o = c.GetProperty("out");
            Check((int)N(o, "calls") == 1 && v == (int)N(o, "v") && trans == B(o, "trans"), c.GetRawText() + " -> C# v=" + v + " trans=" + trans);
        }
        var sum = new List<string>();
        foreach (var kv in per) sum.Add("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failures\":" + kv.Value[1] + "}");
        File.WriteAllText(args[0], "{\"checks\":" + checks + ",\"failures\":" + bad + ",\"sections\":{" + string.Join(",", sum) + "},\"first\":" + JsonSerializer.Serialize(failures) + "}");
        Console.WriteLine("checks=" + checks + " failures=" + bad);
        foreach (var f in failures) Console.WriteLine(f);
        return bad > 0 ? 1 : 0;
    }
}
