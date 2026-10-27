using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Exoduser.UnityPort.Core;

// Compares C# EnemyHurt.Head (Runtime/Core/EnemyHurt.cs) with oracle.json, which export.cjs produced by running the ORIGINAL head of hurtE from game.html
// in a Node VM with recording stubs for everything the web code calls but CX-04a does not port.
// Per case: early-return flag + the returned locals object, every enemy field afterwards, the player object, G._sStats / G.playTime, _shBufI, _hitSfxCd,
// window._btDmgLog, the complete ordered list of injected calls with arguments, and the Math.random() count.
// Standalone .NET check (not a Unity runtime or whole-game verdict).
class EnemyHurtProgram
{
    static readonly List<object> rows = new List<object>();
    static int failures, total;
    static string currentCase = "";
    static void Check(bool pass, string name)
    {
        total++;
        if (pass) { if (total % 20000 == 1) rows.Add(new { name = currentCase + " | " + name, passed = true }); }
        else { failures++; if (failures <= 80) rows.Add(new { name = currentCase + " | " + name, passed = false }); }
    }
    static bool Same(double a, double b) => BitConverter.DoubleToInt64Bits(a) == BitConverter.DoubleToInt64Bits(b);

    static void Fill(object target, JsonElement obj)
    {
        foreach (var p in obj.EnumerateObject())
        {
            var f = target.GetType().GetField(p.Name, BindingFlags.Public | BindingFlags.Instance);
            if (f == null) throw new InvalidOperationException("C# " + target.GetType().Name + " has no field " + p.Name);
            f.SetValue(target, Conv(f.FieldType, p.Value, p.Name));
        }
    }
    static object Conv(Type t, JsonElement v, string name)
    {
        var u = Nullable.GetUnderlyingType(t) ?? t;
        if (v.ValueKind == JsonValueKind.Null)
        {
            if (t.IsValueType && Nullable.GetUnderlyingType(t) == null) throw new InvalidOperationException("null for non-nullable " + name);
            return null;
        }
        if (u == typeof(double)) return v.GetDouble();
        if (u == typeof(bool)) return v.GetBoolean();
        if (u == typeof(string)) return v.GetString();
        if (u == typeof(double[])) { var a = new double[v.GetArrayLength()]; for (int i = 0; i < a.Length; i++) a[i] = v[i].GetDouble(); return a; }
        if (u.IsGenericType && u.GetGenericTypeDefinition() == typeof(List<>))
        {
            var et = u.GetGenericArguments()[0]; var list = (IList)Activator.CreateInstance(u);
            foreach (var x in v.EnumerateArray()) list.Add(Conv(et, x, name + "[]"));
            return list;
        }
        if (u.IsClass) { var o = Activator.CreateInstance(u); Fill(o, v); return o; }
        throw new InvalidOperationException("unsupported field type " + t + " for " + name);
    }

    static void Cmp(object cs, JsonElement js, string path)
    {
        switch (js.ValueKind)
        {
            case JsonValueKind.Null: Check(cs == null, path + " expected null"); return;
            case JsonValueKind.Number:
                if (cs == null || cs is string || cs is bool) { Check(false, path + " C# " + (cs ?? "null") + " vs web " + js.GetDouble().ToString("R")); return; }
                double d = Convert.ToDouble(cs), w = js.GetDouble();
                if (d == 0 && w == 0) d = w;
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
                var type = cs.GetType(); var seen = new HashSet<string>();
                foreach (var p in js.EnumerateObject())
                {
                    seen.Add(p.Name);
                    var f = type.GetField(p.Name, BindingFlags.Public | BindingFlags.Instance);
                    if (f == null) { Check(false, path + "." + p.Name + " missing in C# " + type.Name); continue; }
                    Cmp(f.GetValue(cs), p.Value, path + "." + p.Name);
                }
                foreach (var f in type.GetFields(BindingFlags.Public | BindingFlags.Instance))
                    if (!seen.Contains(f.Name)) Check(f.GetValue(cs) == null, path + "." + f.Name + " set in C# but undefined in web");
                return;
        }
    }

    // ---- injected-call log ----
    sealed class Ref { public int E; }
    sealed class Pairs { public List<KeyValuePair<string, object>> V = new List<KeyValuePair<string, object>>(); }
    static List<EnemySpawn> ens;
    static List<object[]> log;
    static object Ser(object x)
    {
        if (x == null) return null;
        if (x is EnemySpawn es) { int idx = ens.IndexOf(es); if (idx < 0) throw new InvalidOperationException("unknown enemy argument"); return new Ref { E = idx }; }
        if (x is EnemyHurtOpts || x is EnemyProjectile)
        {
            var p = new Pairs(); var fields = new List<FieldInfo>(x.GetType().GetFields(BindingFlags.Public | BindingFlags.Instance));
            fields.Sort((a, b) => string.CompareOrdinal(a.Name, b.Name));
            foreach (var f in fields)
            {
                var v = f.GetValue(x);
                if (x is EnemyHurtOpts && v == null) continue; // unset key = absent in the web object
                p.V.Add(new KeyValuePair<string, object>(f.Name, v));
            }
            return p;
        }
        if (x is int n) return (double)n;
        return x;
    }
    static void Log(string name, params object[] args)
    {
        var a = new object[args.Length + 1]; a[0] = name;
        for (int i = 0; i < args.Length; i++) a[i + 1] = Ser(args[i]);
        log.Add(a);
    }
    static bool SameArg(object ga, JsonElement wa)
    {
        switch (wa.ValueKind)
        {
            case JsonValueKind.Null: return ga == null;
            case JsonValueKind.Number: return ga is double gd && Same(gd, wa.GetDouble());
            case JsonValueKind.String: return ga is string gs && gs == wa.GetString();
            case JsonValueKind.True: return ga is bool b1 && b1;
            case JsonValueKind.False: return ga is bool b2 && !b2;
            case JsonValueKind.Object:
                if (wa.TryGetProperty("e", out var ee)) return ga is Ref r && r.E == ee.GetInt32();
                var arr = wa.GetProperty("o"); var pr = ga as Pairs; if (pr == null || pr.V.Count != arr.GetArrayLength()) return false;
                for (int i = 0; i < pr.V.Count; i++) { if (pr.V[i].Key != arr[i][0].GetString() || !SameArg(pr.V[i].Value, arr[i][1])) return false; }
                return true;
            default: return false;
        }
    }
    static string Describe(object o) { if (o is Ref r) return "{e:" + r.E + "}"; if (o is Pairs p) return "{o:" + string.Join(",", p.V.ConvertAll(kv => kv.Key + "=" + kv.Value)) + "}"; if (o is double d) return d.ToString("R"); return (o ?? "null").ToString(); }
    static void CmpLog(List<object[]> got, JsonElement want)
    {
        Check(got.Count == want.GetArrayLength(), "injected call count C# " + got.Count + " vs web " + want.GetArrayLength());
        for (int i = 0; i < Math.Min(got.Count, want.GetArrayLength()); i++)
        {
            var g = got[i]; var w = want[i]; string tag = "call[" + i + "] " + w[0].GetString();
            bool ok = g.Length == w.GetArrayLength() && (string)g[0] == w[0].GetString();
            Check(ok, tag + " name/arity C# " + g[0] + "/" + g.Length + " vs web " + w[0].GetString() + "/" + w.GetArrayLength());
            if (!ok) continue;
            for (int k = 1; k < g.Length; k++) Check(SameArg(g[k], w[k]), tag + " arg" + k + " C# " + Describe(g[k]) + " vs web " + w[k].GetRawText());
        }
    }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement;
        var t = root.GetProperty("tables");
        currentCase = "tables";
        var elc = t.GetProperty("ELC"); Check(EnemyFactory.ElementColors.Length == elc.GetArrayLength(), "ELC length");
        for (int i = 0; i < Math.Min(elc.GetArrayLength(), EnemyFactory.ElementColors.Length); i++) Check(EnemyFactory.ElementColors[i] == elc[i].GetString(), "ELC[" + i + "]");
        var elp = t.GetProperty("ELP"); Check(EnemyHurtTables.ParticleColors.Length == elp.GetArrayLength(), "ELP length");
        for (int i = 0; i < Math.Min(elp.GetArrayLength(), EnemyHurtTables.ParticleColors.Length); i++) Check(EnemyHurtTables.ParticleColors[i] == elp[i].GetString(), "ELP[" + i + "]");
        var und = new HashSet<int>(); foreach (var x in t.GetProperty("UNDEAD_ET").EnumerateArray()) und.Add(x.GetInt32());
        Check(EnemyHurtTables.UndeadCount == und.Count, "_UNDEAD_ET count");
        for (int et = -2; et < 130; et++) Check(EnemyHurtTables.IsUndead(et) == und.Contains(et), "_UNDEAD_ET.has(" + et + ")");
        var elv = t.GetProperty("EL"); Check(elv.GetProperty("L").GetInt32() == 4 && elv.GetProperty("P").GetInt32() == 0 && elv.GetProperty("F").GetInt32() == 1 && elv.GetProperty("I").GetInt32() == 2 && elv.GetProperty("D").GetInt32() == 3 && elv.GetProperty("H").GetInt32() == 5 && elv.GetProperty("E").GetInt32() == 6, "EL constants used by ElMul / lightning");
        // elMul over every pair of 0..7 and undefined against the original is covered by the cases (ring-reaction); direct table check:
        var bases = root.GetProperty("bases");

        int caseCount = 0, earlyCount = 0;
        foreach (var cs in root.GetProperty("cases").EnumerateArray())
        {
            caseCount++;
            currentCase = cs.GetProperty("name").GetString();
            var w = cs.GetProperty("world"); var exp = cs.GetProperty("expected"); var a = cs.GetProperty("args");
            ens = new List<EnemySpawn>(); var finals = new List<JsonDocument>(); var diffs = exp.GetProperty("diffs");
            var specs = new List<(JsonElement baseIdx, JsonElement over)>();
            // target + others: base JSON + overrides ('undefined' overrides are written as absent keys by the exporter's delete rule)
            Func<string, JsonElement, JsonElement, JsonObject> build = (baseName, over, del) =>
            {
                int bi = -1; int k = 0; foreach (var b in bases.EnumerateArray()) { if (b.GetProperty("name").GetString() == baseName) { bi = k; break; } k++; }
                if (bi < 0) throw new InvalidOperationException("base " + baseName);
                var node = JsonNode.Parse(bases[bi].GetProperty("obj").GetRawText()).AsObject();
                foreach (var p in over.EnumerateObject()) node[p.Name] = JsonNode.Parse(p.Value.GetRawText());
                foreach (var dk in del.EnumerateArray()) node.Remove(dk.GetString());
                return node;
            };
            var nodes = new List<JsonObject>();
            nodes.Add(build(cs.GetProperty("base").GetString(), cs.GetProperty("over"), cs.GetProperty("del")));
            foreach (var o in cs.GetProperty("others").EnumerateArray()) nodes.Add(build(o.GetProperty("base").GetString(), o.GetProperty("over"), o.GetProperty("del")));
            // keys that the exporter deleted (JS undefined) are those set to JSON null in the case 'over' of mkObj: they are simply missing from 'over' values; handled below
            for (int i = 0; i < nodes.Count; i++)
            {
                var e = new EnemySpawn(); using (var doc = JsonDocument.Parse(nodes[i].ToJsonString())) Fill(e, doc.RootElement);
                ens.Add(e);
                var node = nodes[i];
                foreach (var p in diffs[i].EnumerateObject()) node[p.Name] = JsonNode.Parse(p.Value.GetRawText());
                finals.Add(JsonDocument.Parse(node.ToJsonString()));
            }
            log = new List<object[]>();
            var seqJs = cs.GetProperty("seq"); var seq = new double[seqJs.GetArrayLength()]; for (int i = 0; i < seq.Length; i++) seq[i] = seqJs[i].GetDouble();
            int used = 0;
            var vals = cs.GetProperty("vals"); var aff = cs.GetProperty("aff"); var leq = cs.GetProperty("leq"); var ueq = cs.GetProperty("ueq");
            var P = new EnemyHurtPlayer(); Fill(P, w.GetProperty("P"));
            var initP = JsonNode.Parse(w.GetProperty("P").GetRawText()).AsObject();
            foreach (var p in exp.GetProperty("pdiff").EnumerateObject()) initP[p.Name] = JsonNode.Parse(p.Value.GetRawText());
            var finalP = JsonDocument.Parse(initP.ToJsonString());
            var ps = w.GetProperty("PASSIVES"); var eqp = w.GetProperty("equipped");
            Func<string, double?> pas = k => ps.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : (double?)null;
            Func<string, string, double> dmgB = (slot, _) => eqp.TryGetProperty(slot, out var it) && it.ValueKind == JsonValueKind.Object && it.TryGetProperty("dmgBonus", out var db) ? db.GetDouble() : 0;
            Func<string, double?> elOf = slot => eqp.TryGetProperty(slot, out var it) && it.ValueKind == JsonValueKind.Object && it.TryGetProperty("el", out var v) ? v.GetDouble() : (double?)null;
            Func<JsonElement, string, double> tab = (obj, k) => obj.TryGetProperty(k, out var v) ? v.GetDouble() : 0;
            var c = new EnemyHurtContext
            {
                P = P, HasStats = w.GetProperty("sStats").ValueKind != JsonValueKind.Null, StatCrits = w.GetProperty("sStats").ValueKind != JsonValueKind.Null ? w.GetProperty("sStats").GetProperty("crits").GetDouble() : 0,
                PlayTime = w.GetProperty("playTime").GetDouble(), PassAbund = pas("pAbund"), PassBow = pas("pBow"), PassCombo = pas("pCombo"),
                ArmorEl = elOf("armor"), WeaponEl = elOf("weapon"),
                NecklaceDmg = dmgB("necklace", ""), Ring1Dmg = dmgB("ring1", ""), Ring2Dmg = dmgB("ring2", ""), BeltDmg = dmgB("belt", ""), BraceletDmg = dmgB("bracelet", ""), HeadbandDmg = dmgB("headband", ""), Headband2Dmg = dmgB("headband2", ""),
                ShBufI = w.GetProperty("shBufI").GetInt32(), HitSfxCd = w.GetProperty("hitSfxCd").GetDouble(), Now = w.GetProperty("now").GetDouble(),
                BtDmgLog = w.GetProperty("btLog").ValueKind == JsonValueKind.Null ? null : new List<EnemyHurtLogEntry>(), ParryLessonActive = w.GetProperty("lesson").GetBoolean(), Ens = ens
            };
            c.Random = () => { if (used >= seq.Length) throw new InvalidOperationException("random sequence exhausted (C# draws more than the web)"); return seq[used++]; };
            c.EqAffix = k => { Log("eqAffix", k); return tab(aff, k); };
            c.LEq = k => { Log("lEq", k); return tab(leq, k); };
            c.UEq = k => { Log("uEq", k); return tab(ueq, k); };
            c.StatStr = () => { Log("statStr"); return vals.GetProperty("statStr").GetDouble(); };
            c.StatCrit = () => { Log("statCrit"); return vals.GetProperty("statCrit").GetDouble(); };
            c.StatCritDmg = () => { Log("statCritDmg"); return vals.GetProperty("statCritDmg").GetDouble(); };
            c.PAtkMul = () => { Log("pAtkMul"); return vals.GetProperty("pAtkMul").GetDouble(); };
            c.MeleeRef = () => { Log("meleeRef"); return vals.GetProperty("meleeRef").GetDouble(); };
            c.PDotPool = () => { Log("pDotPool"); return vals.GetProperty("pDotPool").GetDouble(); };
            c.PredBonus = e => { Log("predBonus", e); return vals.GetProperty("predBonus").GetDouble(); };
            c.HunterMul = e => { Log("hunterMul", e); return vals.GetProperty("hunterMul").GetDouble(); };
            c.PetOnAtk = () => Log("petOnAtk", c.ShBufI);
            c.ShQuery = (x, y, r) => { Log("shQuery", x, y, r, c.ShBufI); var res = new List<EnemySpawn>(); foreach (var o in ens) if (Math.Sqrt((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y)) <= r) res.Add(o); return res; };
            c.HurtEnemy = (e, d, ang, ns, o) => Log("hurtE", e, d, ang.HasValue ? (object)ang.Value : null, ns, o);
            c.ParryLessonHurt = (e, d, ang, o) => Log("parryLessonHurt", e, d, ang.HasValue ? (object)ang.Value : null, o);
            c.HurtPlayer = d => Log("hurtP", d);
            c.SpawnBossProjectile = (e, o) => Log("spawnBossProjectile", e, o);
            c.AddText = (x, y, s, col, life, size, s2) => { if (size.HasValue) Log("addTxt", x, y, s, col, life, size.Value, s2); else Log("addTxt", x, y, s, col, life); };
            c.AddParts = (x, y, col, n) => Log("addParts", x, y, col, n);
            c.Shake = n => Log("shake", n); c.DoHitFlash = (col, al) => Log("doHitFlash", col, al);
            c.PlaySample = (k, v, p) => Log("playSample", k, v, p);
            c.HitSfxForEtype = et => { Log("hitSfxForEtype", et); return new EnemyHitSfx { key = "hit_" + et, pitch = 1 + et / 1000.0 }; };
            c.Block = () => Log("sfxBlock"); c.Translate = s => { Log("T", s); return s; };

            EnemyHurtHeadResult ret = null; string error = null;
            try
            {
                EnemyHurtOpts opts = null; if (a.TryGetProperty("opts", out var optsJs) && optsJs.ValueKind == JsonValueKind.Object) { opts = new EnemyHurtOpts(); Fill(opts, optsJs); }
                double? ang = !a.TryGetProperty("ang", out var angJs) || angJs.ValueKind == JsonValueKind.Null ? (double?)null : angJs.GetDouble(); // an undefined ang is omitted by JSON
                double atkEl = a.GetProperty("atkEl").ValueKind == JsonValueKind.Null ? 0 : a.GetProperty("atkEl").GetDouble();
                ret = EnemyHurt.Head(c, ens[0], a.GetProperty("dmg").GetDouble(), ang, a.GetProperty("noSound").GetBoolean(), opts, atkEl);
            }
            catch (Exception ex) { error = ex.GetType().Name + ": " + ex.Message; }
            Check(error == null, "no exception" + (error == null ? "" : " (" + error + ")"));
            if (error != null) continue;
            var want = exp.GetProperty("ret");
            if (want.ValueKind == JsonValueKind.Null) { earlyCount++; Check(ret == null, "web returned early, C# did not"); }
            else { Check(ret != null, "web fell through, C# returned early"); if (ret != null) Cmp(ret, want, "ret"); }
            for (int i = 0; i < ens.Count; i++) Cmp(ens[i], finals[i].RootElement, "enemy" + i);
            Cmp(P, finalP.RootElement, "P");
            var g = exp.GetProperty("G");
            if (g.TryGetProperty("sStats", out var ss) && ss.ValueKind == JsonValueKind.Object) Check(c.HasStats && Same(c.StatCrits, ss.GetProperty("crits").GetDouble()), "G._sStats.crits"); else Check(!c.HasStats, "G._sStats undefined");
            Check(Same(c.PlayTime.Value, g.GetProperty("playTime").GetDouble()), "G.playTime");
            Check(c.ShBufI == exp.GetProperty("shBufI").GetInt32(), "_shBufI C# " + c.ShBufI + " vs web " + exp.GetProperty("shBufI").GetInt32());
            Check(Same(c.HitSfxCd, exp.GetProperty("hitSfxCd").GetDouble()), "_hitSfxCd");
            Cmp(c.BtDmgLog, exp.GetProperty("btLog"), "window._btDmgLog");
            Check(used == exp.GetProperty("consumed").GetInt32(), "Random() calls C# " + used + " vs web " + exp.GetProperty("consumed").GetInt32());
            CmpLog(log, exp.GetProperty("log"));
            foreach (var d in finals) d.Dispose(); finalP.Dispose();
        }
        currentCase = "summary";
        var s = root.GetProperty("summary");
        Check(caseCount == s.GetProperty("cases").GetInt32(), "case count");
        Check(earlyCount == s.GetProperty("earlyReturns").GetInt32(), "early-return count");
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_function_oracle_not_Unity_runtime", passed = failures == 0, failures, total, cases = caseCount, earlyReturns = earlyCount,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32(), head = root.GetProperty("source").GetProperty("head").GetString() },
            note = "every case compares the early-return flag and returned locals, all enemy fields, player, globals, the ordered injected-call list with arguments and the Math.random count; failing items listed (first 80), passing ones sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        Console.WriteLine("ENEMY_HURT_RESULT " + total + " checks / " + failures + " failures (" + caseCount + " cases)");
        return failures == 0 ? 0 : 2;
    }
}
