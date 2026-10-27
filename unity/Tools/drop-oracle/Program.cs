using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// D01: compares the native ItemFactory / WorldDrop (Runtime/Core) with oracle.json, which export.cjs produced by running the ORIGINAL game.html
// mkItem / rollAffixes / rollDrop (equipment half) / _wiPush in a Node VM with a seeded Math.random. Same seed => same draws => same items.
class Rng
{
    uint a; public int Draws;
    public Rng(long seed) { a = unchecked((uint)(int)seed); }
    public double Next()
    {
        Draws++;
        unchecked { a += 0x6D2B79F5u; uint t = (a ^ (a >> 15)) * (1u | a); t = (t + (t ^ (t >> 7)) * (61u | t)) ^ t; return (t ^ (t >> 14)) / 4294967296.0; }
    }
}

class DropProgram
{
    static int failures, total;
    static readonly List<string> rows = new List<string>();
    static void Fail(string name, string why) { failures++; if (failures <= 40) rows.Add("FAIL " + name + ": " + why); }
    static void Pass() { total++; }

    static readonly Dictionary<string, FieldInfo> Fields = typeof(InventoryItem).GetFields().ToDictionary(f => f.Name);
    static readonly HashSet<string> Special = new HashSet<string> { "_gx", "_gy", "fav", "junk", "legendarySpecial", "legendaryKo", "legendaryVal", "uniqueSpecial", "uniqueKo", "uniqueVal", "uniqueSecs", "uniqueDisp", "affixes", "elements", "crystals", "socketQ" };

    static bool Eq(double a, JsonElement j)
    {
        if (j.ValueKind == JsonValueKind.String) return j.GetString() == "NaN" && double.IsNaN(a);
        return j.ValueKind == JsonValueKind.Number && a == j.GetDouble();
    }

    static string Compare(JsonElement js, InventoryItem it)
    {
        var seen = new HashSet<string>();
        foreach (var p in js.EnumerateObject())
        {
            string k = p.Name; var v = p.Value; seen.Add(k);
            switch (k)
            {
                case "legendarySpecial":
                    if (v.ValueKind == JsonValueKind.Null) { if (!string.IsNullOrEmpty(it.legendarySpecial)) return "legendarySpecial should be null"; }
                    else if (v.GetProperty("stat").GetString() != it.legendarySpecial || v.GetProperty("ko").GetString() != it.legendaryKo || !Eq(it.legendaryVal, v.GetProperty("val"))) return "legendarySpecial";
                    break;
                case "uniqueSpecial":
                    if (v.ValueKind == JsonValueKind.Null) { if (!string.IsNullOrEmpty(it.uniqueSpecial)) return "uniqueSpecial should be null"; }
                    else
                    {
                        if (v.GetProperty("stat").GetString() != it.uniqueSpecial || v.GetProperty("ko").GetString() != it.uniqueKo || !Eq(it.uniqueVal, v.GetProperty("val"))) return "uniqueSpecial";
                        JsonElement secs, disp;
                        if (v.TryGetProperty("secs", out secs)) { if (secs.GetString() != it.uniqueSecs) return "uniqueSpecial.secs " + secs + " vs " + it.uniqueSecs; } else if (it.uniqueSecs != null) return "uniqueSpecial.secs extra";
                        if (v.TryGetProperty("disp", out disp)) { if (!Eq(it.uniqueDisp, disp)) return "uniqueSpecial.disp"; } else if (it.uniqueDisp != 0) return "uniqueSpecial.disp extra";
                    }
                    break;
                case "affixes":
                    {
                        var arr = v.EnumerateArray().ToArray(); if (arr.Length != (it.affixes?.Length ?? 0)) return "affixes length " + arr.Length + " vs " + (it.affixes?.Length ?? 0);
                        for (int i = 0; i < arr.Length; i++) if (arr[i].GetProperty("id").GetString() != it.affixes[i].id || arr[i].GetProperty("tier").GetInt32() != it.affixes[i].tier || !Eq(it.affixes[i].value, arr[i].GetProperty("value"))) return "affix " + i + " " + arr[i].GetRawText() + " vs " + it.affixes[i].id + "/" + it.affixes[i].tier + "/" + it.affixes[i].value;
                        break;
                    }
                case "elements":
                    {
                        var arr = v.EnumerateArray().ToArray(); if (arr.Length != (it.elements?.Length ?? 0)) return "elements length";
                        for (int i = 0; i < arr.Length; i++) if (arr[i].GetProperty("el").GetInt32() != it.elements[i].el || !Eq(it.elements[i].dmg, arr[i].GetProperty("dmg"))) return "element " + i;
                        break;
                    }
                case "crystals": if (v.GetArrayLength() != (it.crystals?.Length ?? 0)) return "crystals"; break;
                case "socketQ": if (v.GetArrayLength() != (it.socketQ?.Length ?? 0)) return "socketQ"; break;
                default:
                    FieldInfo f;
                    if (Fields.TryGetValue(k, out f) && !Special.Contains(k))
                    {
                        if (f.FieldType == typeof(double)) { if (!Eq((double)f.GetValue(it), v)) return k + " " + v.GetRawText() + " vs " + f.GetValue(it); }
                        else if (f.FieldType == typeof(int)) { if (v.ValueKind != JsonValueKind.Number || (int)f.GetValue(it) != v.GetInt32()) return k + " " + v.GetRawText() + " vs " + f.GetValue(it); }
                        else if (f.FieldType == typeof(string)) { if ((string)f.GetValue(it) != (v.ValueKind == JsonValueKind.Null ? null : v.GetString())) return k + " " + v.GetRawText() + " vs " + f.GetValue(it); }
                        else if (f.FieldType == typeof(bool)) { if ((bool)f.GetValue(it) != (v.ValueKind == JsonValueKind.True)) return k; }
                    }
                    else if (it.legendarySpecial == k) { if (!Eq(it.legendaryVal, v)) return "legendary stat value " + k; }
                    else if (it.uniqueSpecial == k) { if (!Eq(it.uniqueVal, v)) return "unique stat value " + k; }
                    else return "web key without native field: " + k;
                    break;
            }
        }
        // native values that the web item does not have
        foreach (var f in Fields.Values)
        {
            if (Special.Contains(f.Name) || seen.Contains(f.Name)) continue;
            object val = f.GetValue(it);
            bool nonDefault = val is double d ? d != 0 : val is int n ? n != 0 : val is string s ? !string.IsNullOrEmpty(s) : val is bool b && b;
            if (nonDefault) return "native field absent from web item: " + f.Name + "=" + val;
        }
        if (!string.IsNullOrEmpty(it.legendarySpecial) && !seen.Contains("legendarySpecial")) return "legendary extra";
        return null;
    }

    static int Main(string[] args)
    {
        using (var doc = JsonDocument.Parse(File.ReadAllText(args[0])))
        {
            var o = doc.RootElement;
            if (o.GetProperty("source").GetProperty("sha256").GetString() == null) throw new Exception("no source sha");
            // generated tables must come from the same game.html as the oracle
            foreach (var c in o.GetProperty("mk").EnumerateArray())
            {
                var i = c.GetProperty("in"); var rng = new Rng(i.GetProperty("seed").GetInt64());
                string wt = i.GetProperty("wtype").ValueKind == JsonValueKind.Null ? null : i.GetProperty("wtype").GetString();
                InventoryItem item;
                try { item = ItemFactory.MkItem(i.GetProperty("slot").GetString(), i.GetProperty("tier").GetInt32(), i.GetProperty("el").GetInt32(), i.GetProperty("rarity").GetInt32(), wt, i.GetProperty("lv").GetInt32(), rng.Next, 1700000000000.0, i.GetProperty("demo").GetBoolean()); }
                catch (Exception e) { Fail("mk " + i.GetRawText(), e.GetType().Name + " " + e.Message); continue; }
                string why = Compare(c.GetProperty("out"), item);
                if (why == null && rng.Draws != c.GetProperty("draws").GetInt32()) why = "draw count " + rng.Draws + " vs " + c.GetProperty("draws").GetInt32();
                if (why != null) Fail("mk " + i.GetRawText(), why); else Pass();
            }
            foreach (var c in o.GetProperty("affix").EnumerateArray())
            {
                var i = c.GetProperty("in"); var rng = new Rng(i.GetProperty("seed").GetInt64());
                string br = i.GetProperty("brType").ValueKind == JsonValueKind.Null ? null : i.GetProperty("brType").GetString();
                var res = ItemFactory.RollAffixes(i.GetProperty("grade").GetInt32(), i.GetProperty("slot").GetString(), br, i.GetProperty("lv").GetInt32(), rng.Next, i.GetProperty("demo").GetBoolean());
                var exp = c.GetProperty("out").EnumerateArray().ToArray(); string why = null;
                if (exp.Length != res.Length) why = "length " + exp.Length + " vs " + res.Length;
                else for (int k = 0; k < exp.Length && why == null; k++) if (exp[k].GetProperty("id").GetString() != res[k].id || exp[k].GetProperty("tier").GetInt32() != res[k].tier || !Eq(res[k].value, exp[k].GetProperty("value"))) why = "affix " + k;
                if (why == null && rng.Draws != c.GetProperty("draws").GetInt32()) why = "draw count";
                if (why != null) Fail("affix " + i.GetRawText(), why); else Pass();
            }
            int dropItems = 0;
            foreach (var c in o.GetProperty("drop").EnumerateArray())
            {
                var i = c.GetProperty("in"); var e = i.GetProperty("e"); var rng = new Rng(i.GetProperty("seed").GetInt64());
                int stage = i.GetProperty("stage").GetInt32();
                var tier = WorldDrop.Classify(e.GetProperty("ib").GetBoolean(), e.GetProperty("etype").GetInt32(), e.GetProperty("elite").GetInt32(), stage % 5 == 4);
                double bonus = i.GetProperty("bonus").GetDouble() * (i.GetProperty("curse").GetBoolean() ? .5 : 1);
                var opt = new WorldDrop.Options { MinPickRarity = i.GetProperty("minPickRar").GetInt32(), MinPickLevelTier = i.GetProperty("minPickLvTier").GetInt32(), PlayerLevel = i.GetProperty("lv").GetInt32(), NowMs = 1700000000000.0, DemoMode = i.GetProperty("demo").GetBoolean() };
                int id = 1;
                var res = WorldDrop.Roll(tier, bonus, e.GetProperty("dropTier").GetInt32(), e.GetProperty("x").GetDouble(), e.GetProperty("y").GetDouble(), opt, rng.Next, () => id++);
                var exp = c.GetProperty("out").GetProperty("items").EnumerateArray().ToArray(); string why = null;
                if (exp.Length != res.Count) why = "item count " + exp.Length + " vs " + res.Count;
                else for (int k = 0; k < exp.Length && why == null; k++)
                    {
                        if (res[k].X != (float)exp[k].GetProperty("x").GetDouble() || res[k].Y != (float)exp[k].GetProperty("y").GetDouble()) { why = "position " + k; break; }
                        if (exp[k].GetProperty("type").GetString() != "item" || exp[k].GetProperty("picked").GetBoolean()) { why = "entry shape"; break; }
                        why = Compare(exp[k].GetProperty("item"), res[k].Item); dropItems++;
                    }
                if (why == null && rng.Draws != c.GetProperty("out").GetProperty("draws").GetInt32()) why = "draw count " + rng.Draws + " vs " + c.GetProperty("out").GetProperty("draws").GetInt32();
                if (why != null) Fail("drop " + i.GetRawText(), why); else Pass();
            }
            foreach (var c in o.GetProperty("push").EnumerateArray())
            {
                var list = new List<LootState>(); int id = 1;
                foreach (var r in c.GetProperty("seq").EnumerateArray()) WorldDrop.Push(list, new LootState { Id = id++, Item = new InventoryItem { rarity = r.GetInt32() } });
                var exp = c.GetProperty("ids").EnumerateArray().Select(x => x.GetInt32()).ToArray();
                if (exp.SequenceEqual(list.Select(x => x.Id))) Pass(); else Fail("push " + c.GetProperty("seq").GetRawText(), "order differs");
            }
            Console.WriteLine("{\"checks\":" + (total + failures) + ",\"failures\":" + failures + ",\"dropItemsCompared\":" + dropItems + "}");
            foreach (var r in rows) Console.WriteLine(r.Length > 600 ? r.Substring(0, 600) : r);
            return failures == 0 ? 0 : 1;
        }
    }
}
