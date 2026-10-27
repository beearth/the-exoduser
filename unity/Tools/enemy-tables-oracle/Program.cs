using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// Compares the C# enemy tables (Runtime/Core/Combat/Enemy/*.cs) with oracle.json, which export.cjs produced by running the ORIGINAL
// game.html declarations in a Node VM. Standalone .NET check (not a Unity runtime or whole-game verdict). Doubles are compared bit-for-bit.
class EnemyTablesProgram
{
    static readonly List<object> rows = new List<object>();
    static int failures, total;
    static void Check(bool pass, string name)
    {
        total++;
        if (pass) { if (total % 200 == 1) rows.Add(new { name, passed = true }); }
        else { failures++; if (failures <= 80) rows.Add(new { name, passed = false }); }
    }
    static bool Same(double a, double b) => BitConverter.DoubleToInt64Bits(a) == BitConverter.DoubleToInt64Bits(b);
    static int Count(JsonElement t, string k) => t.GetProperty(k).GetArrayLength();

    static void Doubles(string name, double[] cs, JsonElement js)
    {
        Check(cs != null && cs.Length == js.GetArrayLength(), name + " length (C# " + (cs == null ? -1 : cs.Length) + " vs web " + js.GetArrayLength() + ")");
        int n = Math.Min(cs == null ? 0 : cs.Length, js.GetArrayLength());
        for (int i = 0; i < n; i++) Check(Same(cs[i], js[i].GetDouble()), name + "[" + i + "] C# " + cs[i].ToString("R") + " vs web " + js[i].GetDouble().ToString("R"));
        for (int i = n; i < js.GetArrayLength(); i++) Check(false, name + "[" + i + "] missing in C#");
    }
    static void Ints(string name, int[] cs, JsonElement js)
    {
        Check(cs != null && cs.Length == js.GetArrayLength(), name + " length");
        int n = Math.Min(cs == null ? 0 : cs.Length, js.GetArrayLength());
        for (int i = 0; i < n; i++) Check(cs[i] == js[i].GetInt32(), name + "[" + i + "] C# " + cs[i] + " vs web " + js[i].GetInt32());
        for (int i = n; i < js.GetArrayLength(); i++) Check(false, name + "[" + i + "] missing in C#");
    }
    static void Bytes(string name, byte[] cs, JsonElement js)
    {
        Check(cs != null && cs.Length == js.GetArrayLength(), name + " length");
        int n = Math.Min(cs == null ? 0 : cs.Length, js.GetArrayLength());
        for (int i = 0; i < n; i++) Check(cs[i] == js[i].GetInt32(), name + "[" + i + "] C# " + cs[i] + " vs web " + js[i].GetInt32());
        for (int i = n; i < js.GetArrayLength(); i++) Check(false, name + "[" + i + "] missing in C#");
    }
    static void Strings(string name, string[] cs, JsonElement js)
    {
        Check(cs != null && cs.Length == js.GetArrayLength(), name + " length");
        int n = Math.Min(cs == null ? 0 : cs.Length, js.GetArrayLength());
        for (int i = 0; i < n; i++) Check(string.Equals(cs[i], js[i].GetString(), StringComparison.Ordinal), name + "[" + i + "] C# " + cs[i] + " vs web " + js[i].GetString());
        for (int i = n; i < js.GetArrayLength(); i++) Check(false, name + "[" + i + "] missing in C#");
    }
    static bool Has(JsonElement e, string k, out JsonElement v) => e.TryGetProperty(k, out v);

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;var t = root.GetProperty("tables");
        Doubles("ETYPE_HP", EnemyTables.Hp, t.GetProperty("ETYPE_HP"));
        Doubles("ETYPE_ATK", EnemyTables.Atk, t.GetProperty("ETYPE_ATK"));
        Doubles("_ETYPE_SPD_RAW", EnemyTables.SpdRaw, t.GetProperty("_ETYPE_SPD_RAW"));
        Doubles("ETYPE_SPD", EnemyTables.Spd, t.GetProperty("ETYPE_SPD"));
        Doubles("ETYPE_R", EnemyTables.R, t.GetProperty("ETYPE_R"));
        Doubles("ETYPE_RANGE", EnemyTables.Range, t.GetProperty("ETYPE_RANGE"));
        Doubles("ETYPE_POISE", EnemyTables.Poise, t.GetProperty("ETYPE_POISE"));
        Doubles("ETYPE_SHIELD", EnemyTables.Shield, t.GetProperty("ETYPE_SHIELD"));
        Strings("ETYPE_COL", EnemyTables.Col, t.GetProperty("ETYPE_COL"));
        Strings("ETYPE_COLS", EnemyTables.Cols, t.GetProperty("ETYPE_COLS"));
        // ETYPE_ERES: rows x 7
        var eres = t.GetProperty("ETYPE_ERES");
        Check(EnemyTables.Eres != null && EnemyTables.Eres.Length == eres.GetArrayLength(), "ETYPE_ERES rows (C# " + (EnemyTables.Eres == null ? -1 : EnemyTables.Eres.Length) + " vs web " + eres.GetArrayLength() + ")");
        for (int i = 0; i < eres.GetArrayLength(); i++)
        {
            if (EnemyTables.Eres == null || i >= EnemyTables.Eres.Length) { Check(false, "ETYPE_ERES[" + i + "] missing in C#"); continue; }
            Doubles("ETYPE_ERES[" + i + "]", EnemyTables.Eres[i], eres[i]);
        }
        // RARE_ETYPE: object keyed 90..99
        var rare = t.GetProperty("RARE_ETYPE");int rareCount = 0;
        foreach (var kv in rare.EnumerateObject())
        {
            rareCount++;int etype = int.Parse(kv.Name);var def = EnemyTables.FindRare(etype);var v = kv.Value;
            Check(def != null, "RARE_ETYPE[" + etype + "] present");
            if (def == null) continue;
            Check(def.Name == v.GetProperty("name").GetString(), "RARE_ETYPE[" + etype + "].name");
            Check(Same(def.Hp, v.GetProperty("hp").GetDouble()), "RARE_ETYPE[" + etype + "].hp");
            Check(Same(def.Atk, v.GetProperty("atk").GetDouble()), "RARE_ETYPE[" + etype + "].atk");
            Check(Same(def.Spd, v.GetProperty("spd").GetDouble()), "RARE_ETYPE[" + etype + "].spd");
            Check(Same(def.R, v.GetProperty("r").GetDouble()), "RARE_ETYPE[" + etype + "].r");
            Check(Same(def.Poise, v.GetProperty("poise").GetDouble()), "RARE_ETYPE[" + etype + "].poise");
            Check(def.Col == v.GetProperty("col").GetString(), "RARE_ETYPE[" + etype + "].col");
        }
        Check(EnemyTables.Rare != null && EnemyTables.Rare.Length == rareCount, "RARE_ETYPE entry count (C# " + (EnemyTables.Rare == null ? -1 : EnemyTables.Rare.Length) + " vs web " + rareCount + ")");
        // isRareEtype over 0..129 (the original function result)
        var isRare = t.GetProperty("isRareEtype");
        for (int i = 0; i < isRare.GetArrayLength(); i++) Check(EnemyTables.IsRareEtype(i) == isRare[i].GetBoolean(), "isRareEtype(" + i + ")");
        // ELITE_TIERS / ELITE_PROB / MOD_DEFS
        var tiers = t.GetProperty("ELITE_TIERS");
        Check(EliteTables.Tiers != null && EliteTables.Tiers.Length == tiers.GetArrayLength(), "ELITE_TIERS length");
        for (int i = 0; i < tiers.GetArrayLength() && EliteTables.Tiers != null && i < EliteTables.Tiers.Length; i++)
        {
            var c = EliteTables.Tiers[i];var v = tiers[i];string p = "ELITE_TIERS[" + i + "].";
            Check(c.Name == v.GetProperty("name").GetString(), p + "name"); Check(c.Col == v.GetProperty("col").GetString(), p + "col");
            Check(c.Mods == v.GetProperty("mods").GetInt32(), p + "mods");
            Check(Same(c.HpMul, v.GetProperty("hpMul").GetDouble()), p + "hpMul"); Check(Same(c.AtkMul, v.GetProperty("atkMul").GetDouble()), p + "atkMul");
            Check(Same(c.DropBonus, v.GetProperty("dropBonus").GetDouble()), p + "dropBonus"); Check(Same(c.ScaleMul, v.GetProperty("scaleMul").GetDouble()), p + "scaleMul");
        }
        var prob = t.GetProperty("ELITE_PROB");
        Check(EliteTables.Prob != null && EliteTables.Prob.Length == prob.GetArrayLength(), "ELITE_PROB rows");
        for (int i = 0; i < prob.GetArrayLength() && EliteTables.Prob != null && i < EliteTables.Prob.Length; i++) Doubles("ELITE_PROB[" + i + "]", EliteTables.Prob[i], prob[i]);
        var mods = t.GetProperty("MOD_DEFS");
        Check(EliteTables.Mods != null && EliteTables.Mods.Length == mods.GetArrayLength(), "MOD_DEFS length");
        for (int i = 0; i < mods.GetArrayLength() && EliteTables.Mods != null && i < EliteTables.Mods.Length; i++)
        {
            var c = EliteTables.Mods[i];var v = mods[i];string p = "MOD_DEFS[" + i + "].";
            Check(c.Id == v.GetProperty("id").GetString(), p + "id"); Check(c.Name == v.GetProperty("name").GetString(), p + "name");
            Check(c.Col == v.GetProperty("col").GetString(), p + "col"); Check(c.Hell == v.GetProperty("hell").GetInt32(), p + "hell");
        }
        // difficulty tables, stage maps, STG
        Doubles("DIFF_MUL", EnemyTables.DiffMul, t.GetProperty("DIFF_MUL"));
        Ints("DIFF_LV_OFF", EnemyTables.DiffLvOff, t.GetProperty("DIFF_LV_OFF"));
        Check(EnemyTables.TotalStages == t.GetProperty("TOTAL_STAGES").GetInt32(), "TOTAL_STAGES");
        Bytes("SI_TO_HELL", EnemyTables.SiToHell, t.GetProperty("SI_TO_HELL"));
        Bytes("SI_TO_FLOOR", EnemyTables.SiToFloor, t.GetProperty("SI_TO_FLOOR"));
        var stg = t.GetProperty("STG");
        Check(EnemyTables.Stg != null && EnemyTables.Stg.Length == stg.GetArrayLength(), "STG length");
        for (int i = 0; i < stg.GetArrayLength() && EnemyTables.Stg != null && i < EnemyTables.Stg.Length; i++)
        {
            var c = EnemyTables.Stg[i];var v = stg[i];string p = "STG[" + i + "].";
            Check(c.N == v.GetProperty("n").GetString(), p + "n"); Check(c.Kr == v.GetProperty("kr").GetString(), p + "kr");
            Check(c.W == v.GetProperty("w").GetString(), p + "w"); Check(c.F == v.GetProperty("f").GetString(), p + "f");
            Check(c.Ac == v.GetProperty("ac").GetString(), p + "ac"); Check(c.Bn == v.GetProperty("bn").GetString(), p + "bn");
            Check(c.Be == v.GetProperty("be").GetInt32(), p + "be"); Check(c.MonLv == v.GetProperty("monLv").GetInt32(), p + "monLv");
            Check(c.Hell == v.GetProperty("hell").GetInt32(), p + "hell"); Check(c.HellFloor == v.GetProperty("hellFloor").GetInt32(), p + "hellFloor");
            Check(c.IsHellBoss == v.GetProperty("isHellBoss").GetBoolean(), p + "isHellBoss"); Check(c.Chapter == v.GetProperty("chapter").GetInt32(), p + "chapter");
        }
        // sanity: the structural facts the doc reports
        Check(EnemyTables.EtypeCount == 90 && EnemyTables.EresRows == 120, "declared sizes (etype 90, eres rows 120)");
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_declaration_oracle_not_Unity_runtime", passed = failures == 0, failures, total,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32() },
            note = "every table item (length, each value, strings, bit-equal doubles) compared with the original declaration executed in Node; failing items are listed (first 80), passing ones are sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        Console.WriteLine("ENEMY_TABLES_RESULT " + total + " checks / " + failures + " failures");
        return failures == 0 ? 0 : 2;
    }
}
