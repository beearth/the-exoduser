using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// Compares C# EnemyFactory.Create (Runtime/Core/EnemyFactory.cs) with oracle.json, which export.cjs produced by running the ORIGINAL mkEn from game.html
// (plus rollElite/rollMods/rollAura/_isDruidFinale/safePt/_assignMobSkin ...) in a Node VM with a recorded Math.random() sequence.
// Per case: null-ness, every field of the spawned object (reflection by web field name, doubles bit-for-bit), the number of Random() calls and the canMv call list.
// Standalone .NET check (not a Unity runtime or whole-game verdict).
class EnemySpawnProgram
{
    static readonly List<object> rows = new List<object>();
    static int failures, total;
    static readonly List<string> allFailures = new List<string>();   // every failing check (the receipt keeps the first 80); written next to the receipt as <receipt>.fails.txt
    static string currentCase = "";
    static void Check(bool pass, string name)
    {
        total++;
        if (pass) { if (total % 5000 == 1) rows.Add(new { name = currentCase + " | " + name, passed = true }); }
        else { failures++; allFailures.Add(currentCase + " | " + name); if (failures <= 80) rows.Add(new { name = currentCase + " | " + name, passed = false }); }
    }
    static bool Same(double a, double b) => BitConverter.DoubleToInt64Bits(a) == BitConverter.DoubleToInt64Bits(b);
    static double Num(JsonElement e) => e.ValueKind == JsonValueKind.String ? double.Parse(e.GetString() == "NaN" ? "NaN" : e.GetString() == "Infinity" ? "Infinity" : e.GetString() == "-Infinity" ? "-Infinity" : e.GetString(), System.Globalization.CultureInfo.InvariantCulture) : e.GetDouble();

    static void Cmp(object cs, JsonElement js, string path)
    {
        switch (js.ValueKind)
        {
            case JsonValueKind.Null: Check(cs == null, path + " expected null"); return;
            case JsonValueKind.Number:
                if (cs == null || cs is string || cs is bool) { Check(false, path + " C# " + (cs ?? "null") + " vs web " + js.GetDouble().ToString("R")); return; }
                double d = Convert.ToDouble(cs), w = js.GetDouble();
                if (d == 0 && w == 0) d = w; // JSON cannot carry -0 (export.cjs rejects a -0 result)
                Check(Same(d, w), path + " C# " + d.ToString("R") + " vs web " + w.ToString("R")); return;
            case JsonValueKind.True: case JsonValueKind.False:
                Check(cs is bool b && b == (js.ValueKind == JsonValueKind.True), path + " C# " + (cs ?? "null") + " vs web " + js.ValueKind); return;
            case JsonValueKind.String: Check(cs is string s && s == js.GetString(), path + " C# " + (cs ?? "null") + " vs web " + js.GetString()); return;
            case JsonValueKind.Array:
                var list = cs as IList;
                if (list == null) { Check(false, path + " expected array, C# " + (cs ?? "null")); return; }
                Check(list.Count == js.GetArrayLength(), path + " length C# " + list.Count + " vs web " + js.GetArrayLength());
                for (int i = 0; i < Math.Min(list.Count, js.GetArrayLength()); i++) Cmp(list[i], js[i], path + "[" + i + "]");
                return;
            case JsonValueKind.Object:
                if (cs == null) { Check(false, path + " expected object, C# null"); return; }
                var type = cs.GetType();
                var seen = new HashSet<string>();
                foreach (var p in js.EnumerateObject())
                {
                    seen.Add(p.Name);
                    var f = type.GetField(p.Name, BindingFlags.Public | BindingFlags.Instance);
                    if (f == null) { Check(false, path + "." + p.Name + " missing in C# " + type.Name); continue; }
                    Cmp(f.GetValue(cs), p.Value, path + "." + p.Name);
                }
                // a C# field that the web does not have on this object must be unset (null = web undefined)
                foreach (var f in type.GetFields(BindingFlags.Public | BindingFlags.Instance))
                    if (!seen.Contains(f.Name)) Check(f.GetValue(cs) == null, path + "." + f.Name + " set in C# but undefined in web");
                return;
        }
    }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement;
        var t = root.GetProperty("tables");
        currentCase = "tables";
        // --- constants and tables mkEn needs, from the original ---
        Check(EnemyFactory.Tile == t.GetProperty("T").GetDouble(), "T");
        Check(EnemyFactory.Mob8Total == t.GetProperty("_MOB8_TOTAL").GetInt32(), "_MOB8_TOTAL");
        Check(EnemyFactory.Mob8Cols == t.GetProperty("_MOB8_COLS").GetInt32(), "_MOB8_COLS");
        Check(EnemyFactory.BossMovesCount == t.GetProperty("BOSS_MOVES_length").GetInt32(), "BOSS_MOVES.length");
        var ex = t.GetProperty("_CH1_OPENING_EXCLUDED_ET");
        Check(EnemyFactory.OpeningExcludedEtypes != null && EnemyFactory.OpeningExcludedEtypes.Length == ex.GetArrayLength(), "_CH1_OPENING_EXCLUDED_ET length");
        var probe = t.GetProperty("opening_excluded_probe");
        for (int i = 0; i < probe.GetArrayLength(); i++) Check((Array.IndexOf(EnemyFactory.OpeningExcludedEtypes, i) >= 0) == probe[i].GetBoolean(), "_CH1_OPENING_EXCLUDED_ET.has(" + i + ")");
        var elc = t.GetProperty("ELC");
        Check(EnemyFactory.ElementColors.Length == elc.GetArrayLength(), "ELC length");
        for (int i = 0; i < Math.Min(elc.GetArrayLength(), EnemyFactory.ElementColors.Length); i++) Check(EnemyFactory.ElementColors[i] == elc[i].GetString(), "ELC[" + i + "]");
        var aura = t.GetProperty("AURA_DEFS");
        Check(EnemyFactory.AuraDefs.Length == aura.GetArrayLength(), "AURA_DEFS length");
        for (int i = 0; i < Math.Min(aura.GetArrayLength(), EnemyFactory.AuraDefs.Length); i++)
        {
            var c = EnemyFactory.AuraDefs[i]; var v = aura[i];
            Check(c.Id == v.GetProperty("id").GetString(), "AURA_DEFS[" + i + "].id"); Check(c.Name == v.GetProperty("name").GetString(), "AURA_DEFS[" + i + "].name");
            Check(c.Col == v.GetProperty("col").GetString(), "AURA_DEFS[" + i + "].col"); Check(c.Hell == v.GetProperty("hell").GetInt32(), "AURA_DEFS[" + i + "].hell");
            Check(Same(c.Range, v.GetProperty("range").GetDouble()), "AURA_DEFS[" + i + "].range");
        }
        // table drift guard: CX-01 tables vs the game.html this oracle was exported from (a mismatch here explains field mismatches below)
        Dbl("ETYPE_HP", EnemyTables.Hp, t.GetProperty("ETYPE_HP")); Dbl("ETYPE_ATK", EnemyTables.Atk, t.GetProperty("ETYPE_ATK")); Dbl("ETYPE_SPD", EnemyTables.Spd, t.GetProperty("ETYPE_SPD"));
        Dbl("ETYPE_R", EnemyTables.R, t.GetProperty("ETYPE_R")); Dbl("ETYPE_POISE", EnemyTables.Poise, t.GetProperty("ETYPE_POISE")); Dbl("DIFF_MUL", EnemyTables.DiffMul, t.GetProperty("DIFF_MUL"));
        var col = t.GetProperty("ETYPE_COL");
        Check(EnemyTables.Col.Length == col.GetArrayLength(), "ETYPE_COL length");
        for (int i = 0; i < Math.Min(col.GetArrayLength(), EnemyTables.Col.Length); i++) Check(EnemyTables.Col[i] == col[i].GetString(), "ETYPE_COL[" + i + "]");
        var sih = t.GetProperty("SI_TO_HELL");
        Check(EnemyTables.SiToHell.Length == sih.GetArrayLength(), "SI_TO_HELL length");
        for (int i = 0; i < Math.Min(sih.GetArrayLength(), EnemyTables.SiToHell.Length); i++) Check(EnemyTables.SiToHell[i] == sih[i].GetInt32(), "SI_TO_HELL[" + i + "]");
        var dlo = t.GetProperty("DIFF_LV_OFF");
        for (int i = 0; i < Math.Min(dlo.GetArrayLength(), EnemyTables.DiffLvOff.Length); i++) Check(EnemyTables.DiffLvOff[i] == dlo[i].GetInt32(), "DIFF_LV_OFF[" + i + "]");
        var prob = t.GetProperty("ELITE_PROB");
        Check(EliteTables.Prob.Length == prob.GetArrayLength(), "ELITE_PROB rows");
        for (int i = 0; i < Math.Min(prob.GetArrayLength(), EliteTables.Prob.Length); i++) Dbl("ELITE_PROB[" + i + "]", EliteTables.Prob[i], prob[i]);
        var tiers = t.GetProperty("ELITE_TIERS");
        for (int i = 0; i < Math.Min(tiers.GetArrayLength(), EliteTables.Tiers.Length); i++)
        {
            var c = EliteTables.Tiers[i]; var v = tiers[i];
            Check(c.Mods == v.GetProperty("mods").GetInt32() && Same(c.HpMul, v.GetProperty("hpMul").GetDouble()) && Same(c.AtkMul, v.GetProperty("atkMul").GetDouble()) && Same(c.ScaleMul, v.GetProperty("scaleMul").GetDouble()), "ELITE_TIERS[" + i + "]");
        }
        var mods = t.GetProperty("MOD_DEFS");
        Check(EliteTables.Mods.Length == mods.GetArrayLength(), "MOD_DEFS length");
        for (int i = 0; i < Math.Min(mods.GetArrayLength(), EliteTables.Mods.Length); i++) Check(EliteTables.Mods[i].Id == mods[i].GetProperty("id").GetString() && EliteTables.Mods[i].Hell == mods[i].GetProperty("hell").GetInt32(), "MOD_DEFS[" + i + "]");
        foreach (var kv in t.GetProperty("RARE_ETYPE").EnumerateObject())
        {
            var def = EnemyTables.FindRare(int.Parse(kv.Name)); var v = kv.Value;
            Check(def != null && Same(def.Hp, v.GetProperty("hp").GetDouble()) && Same(def.Atk, v.GetProperty("atk").GetDouble()) && Same(def.Spd, v.GetProperty("spd").GetDouble()) && Same(def.R, v.GetProperty("r").GetDouble()) && Same(def.Poise, v.GetProperty("poise").GetDouble()) && def.Col == v.GetProperty("col").GetString(), "RARE_ETYPE[" + kv.Name + "]");
        }

        // --- every case ---
        int caseCount = 0, nullCases = 0;
        foreach (var cs in root.GetProperty("cases").EnumerateArray())
        {
            caseCount++;
            currentCase = cs.GetProperty("name").GetString();
            var inp = cs.GetProperty("input"); var exp = cs.GetProperty("expected");
            var seqJs = cs.GetProperty("seq"); var seq = new double[seqJs.GetArrayLength()];
            for (int i = 0; i < seq.Length; i++) seq[i] = seqJs[i].GetDouble();
            int used = 0;
            var calls = new List<double[]>();
            var rule = inp.GetProperty("canMove"); string kind = rule.GetProperty("kind").GetString();
            double rcx = kind == "blockDisc" ? rule.GetProperty("cx").GetDouble() : 0, rcy = kind == "blockDisc" ? rule.GetProperty("cy").GetDouble() : 0, rrad = kind == "blockDisc" ? rule.GetProperty("rad").GetDouble() : 0;
            var ctx = new EnemySpawnContext
            {
                PlayerLevel = inp.GetProperty("playerLevel").GetDouble(), DifficultyIndex = inp.GetProperty("diff").GetInt32(), StageDiffOffset = inp.GetProperty("stageDiffOff").GetDouble(),
                Stage = inp.GetProperty("stage").GetInt32(), DemoMode = inp.GetProperty("demoMode").GetBoolean(), DemoLastStage = inp.GetProperty("demoLastStage").GetInt32(),
                Random = () => { if (used >= seq.Length) throw new InvalidOperationException("random sequence exhausted (C# draws more than the web)"); return seq[used++]; },
                CanMove = (x, y, r) =>
                {
                    calls.Add(new[] { x, y, r });
                    if (kind == "open") return true;
                    if (kind == "blockAll") return false;
                    double dx = x - rcx, dy = y - rcy, rr = rrad + r; return dx * dx + dy * dy >= rr * rr;
                }
            };
            EnemySpawn got = null; string error = null;
            try
            {
                double? el = inp.GetProperty("el").ValueKind == JsonValueKind.Null ? (double?)null : inp.GetProperty("el").GetDouble();
                double? room = inp.GetProperty("room").ValueKind == JsonValueKind.Null ? (double?)null : inp.GetProperty("room").GetDouble();
                got = EnemyFactory.Create(ctx, Num(inp.GetProperty("x")), Num(inp.GetProperty("y")), inp.GetProperty("si").GetInt32(), inp.GetProperty("etype").GetInt32(), inp.GetProperty("ib").GetBoolean(), el, room);
            }
            catch (Exception e) { error = e.GetType().Name + ": " + e.Message; }
            Check(error == null, "no exception" + (error == null ? "" : " (" + error + ")"));
            if (error != null) continue;
            bool expectNull = exp.GetProperty("isNull").GetBoolean();
            if (expectNull) nullCases++;
            Check((got == null) == expectNull, "null result C# " + (got == null) + " vs web " + expectNull);
            Check(used == exp.GetProperty("consumed").GetInt32(), "Random() calls C# " + used + " vs web " + exp.GetProperty("consumed").GetInt32());
            var wc = exp.GetProperty("canMoveCalls");
            Check(calls.Count == wc.GetArrayLength(), "canMv call count C# " + calls.Count + " vs web " + wc.GetArrayLength());
            for (int i = 0; i < Math.Min(calls.Count, wc.GetArrayLength()); i++)
                Check(Same(calls[i][0], wc[i][0].GetDouble()) && Same(calls[i][1], wc[i][1].GetDouble()) && Same(calls[i][2], wc[i][2].GetDouble()), "canMv call[" + i + "] C# (" + calls[i][0].ToString("R") + "," + calls[i][1].ToString("R") + "," + calls[i][2] + ") vs web (" + wc[i][0].GetDouble().ToString("R") + "," + wc[i][1].GetDouble().ToString("R") + "," + wc[i][2].GetDouble() + ")");
            if (!expectNull && got != null) Cmp(got, exp.GetProperty("result"), "result");
        }
        currentCase = "summary";
        var cases = root.GetProperty("summary");
        Check(caseCount == cases.GetProperty("cases").GetInt32(), "case count");
        Check(nullCases == cases.GetProperty("nullResults").GetInt32(), "null result count");
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_function_oracle_not_Unity_runtime", passed = failures == 0, failures, total, cases = caseCount, nullCases,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32() },
            note = "every case compares null-ness, all object fields by web name (bit-equal doubles), Random() call count and the canMv call list with the original mkEn run in Node; failing items listed (first 80), passing ones sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        File.WriteAllLines(args[0] + ".fails.txt", allFailures);
        Console.WriteLine("ENEMY_SPAWN_RESULT " + total + " checks / " + failures + " failures (" + caseCount + " cases)");
        return failures == 0 ? 0 : 2;
    }
    static void Dbl(string name, double[] cs, JsonElement js)
    {
        Check(cs != null && cs.Length == js.GetArrayLength(), name + " length");
        for (int i = 0; i < Math.Min(cs == null ? 0 : cs.Length, js.GetArrayLength()); i++) Check(Same(cs[i], js[i].GetDouble()), name + "[" + i + "] C# " + cs[i].ToString("R") + " vs web " + js[i].GetDouble().ToString("R"));
    }
}
