// E03 oracle check: compares Runtime/Core/CombatSave.cs (+SaveJson, CombatSaveStore) with oracle.json (produced by export.cjs from the ORIGINAL game.html dbSave/dbRestore code).
// usage: SaveTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 5) failures.Add(section + ": " + (detail.Length > 1500 ? detail.Substring(0, 1500) : detail)); }
    }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; per[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static double N(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : double.NaN; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }

    static readonly HashSet<string> ItemKnown = new HashSet<string>();
    // Item normal form: only fields Unity models, zero / false / null / empty-string omitted. Both sides go through it.
    static JsonValue NormItem(JsonValue o)
    {
        var r = JsonValue.NewObject();
        foreach (var kv in o.Members)
        {
            if (!ItemKnown.Contains(kv.Key)) continue;
            var v = kv.Value;
            if (v.Kind == JsonKind.Null || (v.Kind == JsonKind.Number && v.Number == 0) || (v.Kind == JsonKind.Bool && !v.Bool) || (v.Kind == JsonKind.String && v.Text == "")) continue;
            if (v.Kind == JsonKind.Array && v.Items.Count == 0) continue;
            r.Set(kv.Key, v);
        }
        r.Members.Sort((a, b) => string.CompareOrdinal(a.Key, b.Key));
        return r;
    }
    // Structural comparison; `items` switches to the item normal form for the objects found at bag[] / equipped.{slot}.
    static string Diff(JsonValue a, JsonValue b, string path, bool ordered)
    {
        if (a == null || b == null) return path + ": missing " + (a == null ? "left" : "right");
        if (a.Kind != b.Kind) return path + ": kind " + a.Kind + " vs " + b.Kind;
        switch (a.Kind)
        {
            case JsonKind.Bool: return a.Bool == b.Bool ? null : path + ": " + a.Bool + " vs " + b.Bool;
            case JsonKind.Number: return a.Number == b.Number ? null : path + ": " + a.Number + " vs " + b.Number;
            case JsonKind.String: return a.Text == b.Text ? null : path + ": '" + a.Text + "' vs '" + b.Text + "'";
            case JsonKind.Array:
                if (a.Items.Count != b.Items.Count) return path + ": length " + a.Items.Count + " vs " + b.Items.Count;
                for (int i = 0; i < a.Items.Count; i++) { var d = Diff(a.Items[i], b.Items[i], path + "[" + i + "]", ordered); if (d != null) return d; }
                return null;
            case JsonKind.Object:
                if (a.Members.Count != b.Members.Count) return path + ": keys " + string.Join(",", Keys(a)) + " vs " + string.Join(",", Keys(b));
                for (int i = 0; i < a.Members.Count; i++)
                {
                    if (ordered && a.Members[i].Key != b.Members[i].Key) return path + ": key order '" + a.Members[i].Key + "' vs '" + b.Members[i].Key + "'";
                    var other = b.Get(a.Members[i].Key);
                    var d = Diff(a.Members[i].Value, other, path + "." + a.Members[i].Key, ordered); if (d != null) return d;
                }
                return null;
        }
        return null;
    }
    static List<string> Keys(JsonValue o) { var l = new List<string>(); foreach (var kv in o.Members) l.Add(kv.Key); return l; }
    // Replace every item object inside inv.bag / inv.equipped by its normal form.
    static JsonValue NormInv(JsonValue root)
    {
        var inv = root.Get("inv"); if (inv == null) return root;
        var bag = inv.Get("bag"); if (bag != null) for (int i = 0; i < bag.Items.Count; i++) bag.Items[i] = NormItem(bag.Items[i]);
        var eq = inv.Get("equipped"); if (eq != null) for (int i = 0; i < eq.Members.Count; i++) if (eq.Members[i].Value.Kind == JsonKind.Object) eq.Members[i] = new KeyValuePair<string, JsonValue>(eq.Members[i].Key, NormItem(eq.Members[i].Value));
        return root;
    }
    static JsonValue Tree(JsonElement e) { return SaveJson.Parse(e.GetRawText()); }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        var fields = root.GetProperty("fields");
        var oracleNames = new HashSet<string>();
        foreach (var kind in new[] { "num", "int", "str", "bool" }) foreach (var n in fields.GetProperty(kind).EnumerateArray()) oracleNames.Add(n.GetString());
        section = "coverage"; per[section] = new int[2];
        foreach (var f in typeof(InventoryItem).GetFields())
        {
            if (f.FieldType == typeof(double) || f.FieldType == typeof(int) || f.FieldType == typeof(string) || f.FieldType == typeof(bool)) Check(oracleNames.Contains(f.Name), "InventoryItem field not exercised by the oracle: " + f.Name);
            ItemKnown.Add(f.Name);
        }
        var slots = new List<string>(); foreach (var s in root.GetProperty("slots").EnumerateArray()) slots.Add(s.GetString());
        Check(slots.Count == InventoryState.Slots.Length, "slot count");
        for (int i = 0; i < slots.Count; i++) Check(slots[i] == InventoryItemJson.SlotName(i), "slot order " + i);
        string[] modeled = { "player", "inv", "game", "bagMax", "potLv" };

        // 1) Unity model -> JSON equals the web literal for the keys Unity owns (key order of every object checked)
        foreach (var c in Cases(root, "encode"))
        {
            var inp = c.GetProperty("input");
            var m = new CombatSaveModel
            {
                Lv = N(inp, "lv"), Exp = N(inp, "exp"), MaxExp = N(inp, "maxExp"), Sp = N(inp, "sp"), Ap = N(inp, "ap"), TransLvDate = S(inp, "transDate"), TransLvCount = N(inp, "transCount"),
                BaseAtk = N(inp, "baseAtk"), BaseDef = N(inp, "baseDef"), Hp = N(inp, "hp"), Mhp = N(inp, "mhp"), Mp = N(inp, "mp"), Mmp = N(inp, "mmp"), St = N(inp, "st"), Mst = N(inp, "mst"),
                Speed = N(inp, "speed"), Shield = N(inp, "shield"), Mshield = N(inp, "mshield"), Stage = N(inp, "stage"), Kills = N(inp, "kills"), PotLvHp = N(inp, "potLvHp"), BagMax = N(inp, "bagMax")
            };
            int si = 0; foreach (var e in inp.GetProperty("equipped").EnumerateArray()) { if (e.ValueKind == JsonValueKind.Object) m.Equipped[si] = InventoryItemJson.Read(Tree(e)); si++; }
            foreach (var b in inp.GetProperty("bag").EnumerateArray()) m.Bag.Add(InventoryItemJson.Read(Tree(b)));
            var got = SaveJson.Parse(SaveJson.Write(CombatSaveCodec.Encode(m)));         // through text, like the file
            var web = Tree(c.GetProperty("saved"));
            var gotM = JsonValue.NewObject(); var webM = JsonValue.NewObject();
            foreach (var k in modeled) { gotM.Set(k, got.Get(k)); webM.Set(k, web.Get(k)); }
            string d = Diff(NormInv(gotM), NormInv(webM), "$", true);
            Check(d == null && got.Members.Count == modeled.Length, d ?? ("extra keys written: " + string.Join(",", Keys(got))));
        }

        // 2) a full web save (every section) loaded and saved again keeps all sections, in the web key order
        foreach (var c in Cases(root, "roundtrip"))
        {
            var web = Tree(c.GetProperty("saved"));
            CombatSaveModel m; string err;
            bool ok = CombatSaveCodec.TryDecode(web, out m, out err);
            Check(ok, "decode failed: " + err);
            if (!ok) continue;
            var again = SaveJson.Parse(SaveJson.Write(CombatSaveCodec.Encode(m)));
            var left = SaveJson.Parse(SaveJson.Write(web));
            string d = Diff(NormInv(again), NormInv(left), "$", true);
            Check(d == null, d ?? "");
        }

        // 3) restore statements of the original dbRestore against the C# decode
        foreach (var c in Cases(root, "decode"))
        {
            var saved = Tree(c.GetProperty("saved")); var o = c.GetProperty("out"); var before = c.GetProperty("before");
            CombatSaveModel m; string err;
            bool hasPlayer = saved.Get("player") != null;
            bool ok = CombatSaveCodec.TryDecode(saved, out m, out err);
            Check(ok == hasPlayer, "decode result " + ok + " hasPlayer=" + hasPlayer);
            if (!ok) continue;
            double mhp = N(before, "mhp"), mmp = N(before, "mmp"), mst = N(before, "mst");
            double hp = CombatSaveCodec.Or(m.Hp, mhp), mp = CombatSaveCodec.Or(m.Mp, mmp), st = CombatSaveCodec.Or(m.St, mst);
            double shared = N(before, "shared"), newShared, mats; bool clear;
            var game = saved.Get("game");
            CombatSaveCodec.ResolveMats(game == null ? 0 : CombatSaveCodec.Number(game, "mats", 0), shared, out newShared, out mats, out clear);
            // `d.game` absent: the web never touches G.* (no stage/kills/mats), Unity keeps its fresh values
            bool g = c.GetProperty("out").GetProperty("hasGame").GetBoolean();
            bool same = m.Lv == N(o, "lv") && m.Exp == N(o, "exp") && m.MaxExp == N(o, "maxExp") && m.Sp == N(o, "sp") && m.Ap == N(o, "ap") && m.TransLvDate == S(o, "transDate") && m.TransLvCount == N(o, "transCount")
                && m.BaseAtk == N(o, "baseAtk") && m.BaseDef == N(o, "baseDef") && hp == N(o, "hp") && m.Mhp == N(o, "mhp") && mp == N(o, "mp") && m.Mmp == N(o, "mmp") && st == N(o, "st") && m.Mst == N(o, "mst")
                && m.Speed == N(o, "speed") && m.Shield == N(o, "shield") && m.Mshield == N(o, "mshield") && m.BagMax == N(o, "bagMax") && m.PotLvHp == N(o, "potLvHp")
                && (!g || (m.Stage == N(o, "stage") && m.Kills == N(o, "kills") && mats == N(o, "mats") && newShared == N(o, "sharedAfter")))
                && (g || (m.Stage == 0 && m.Kills == 0 && newShared == shared))
                && m.Bag.Count == (int)N(o, "bagLen");
            Check(same, c.GetRawText().Substring(0, Math.Min(900, c.GetRawText().Length)) + " -> C# lv=" + m.Lv + " exp=" + m.Exp + " max=" + m.MaxExp + " hp=" + hp + " bag=" + m.Bag.Count + " mats=" + mats + " shared=" + newShared);
        }

        // 4) store: atomic file, backup recovery, version / schema refusal, shared malice
        section = "store"; per[section] = new int[2];
        string dir = Path.Combine(Path.GetTempPath(), "exoduser-save-oracle-" + Guid.NewGuid().ToString("N"));
        try
        {
            var store = new CombatSaveStore(dir);
            JsonValue data = JsonValue.NewObject().Set("player", JsonValue.NewObject().Set("lv", JsonValue.Of(7.0))).Set("name", JsonValue.Of("검\n\"x\""));
            long rev; CombatSaveStatus st2; JsonValue back;
            Check(!store.Exists("아린") && !store.TryLoad("아린", out back, out rev, out st2) && st2 == CombatSaveStatus.Missing, "missing save");
            Check(store.TrySave("아린", data, 0, out rev, out st2) && rev == 1 && st2 == CombatSaveStatus.Saved, "first save");
            Check(store.TryLoad("아린", out back, out rev, out st2) && rev == 1 && st2 == CombatSaveStatus.Loaded && Diff(back, data, "$", true) == null, "load equals saved data");
            var data2 = JsonValue.NewObject().Set("player", JsonValue.NewObject().Set("lv", JsonValue.Of(8.0)));
            Check(store.TrySave("아린", data2, rev, out rev, out st2) && rev == 2, "second save");
            File.WriteAllText(store.PathFor("아린"), "{broken");
            Check(store.TryLoad("아린", out back, out rev, out st2) && st2 == CombatSaveStatus.RecoveredFromBackup && rev == 1 && Diff(back, data, "$", true) == null, "damaged primary recovers the previous save");
            File.WriteAllText(store.PathFor("루나"), "{\"schema\":\"" + CombatSaveCodec.Schema + "\",\"version\":99,\"revision\":1,\"name\":\"루나\",\"data\":{}}");
            Check(!store.TryLoad("루나", out back, out rev, out st2) && st2 == CombatSaveStatus.UnsupportedVersion, "future version is refused, not downgraded");
            File.WriteAllText(store.PathFor("타이"), "{\"schema\":\"other\",\"version\":1,\"name\":\"타이\",\"data\":{}}");
            Check(!store.TryLoad("타이", out back, out rev, out st2) && st2 == CombatSaveStatus.WrongSchema, "wrong schema refused");
            Check(store.PathFor("아린") != store.PathFor("루나") && store.PathFor("a/b").IndexOf('/') < 0 && Path.GetDirectoryName(store.PathFor("..\\x")) == Path.GetFullPath(dir), "file name is hex of the name (no path escape)");
            Check(store.LoadSharedMats() == 0 && store.SaveSharedMats(1234.9) && store.LoadSharedMats() == 1234 && store.SaveSharedMats(-5) && store.LoadSharedMats() == 0, "shared malice file");
            Check(store.Delete("아린") && !store.Exists("아린"), "delete");
        }
        finally { try { Directory.Delete(dir, true); } catch (IOException) { } }

        var sum = new List<string>();
        foreach (var kv in per) sum.Add("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failures\":" + kv.Value[1] + "}");
        File.WriteAllText(args[0], "{\"checks\":" + checks + ",\"failures\":" + bad + ",\"sections\":{" + string.Join(",", sum) + "},\"first\":" + JsonSerializer.Serialize(failures) + "}");
        Console.WriteLine("checks=" + checks + " failures=" + bad);
        foreach (var f in failures) Console.WriteLine(f);
        return bad > 0 ? 1 : 0;
    }
}
