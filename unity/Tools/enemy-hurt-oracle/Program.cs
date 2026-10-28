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
// Per case: early-return flag + the returned locals object(s) (H1 = CX-04a head, H2 = CX-04b middle with given head values, CH = H1 then H2 chained), every enemy field afterwards,
// the player object, the G globals (_sStats, _dmgPeak, _dmgPeakShow, _flashCol/_flashT, hitStop, slowMo, _noHitStopT, _dpsDmg, _txtPerFrame, _uqScCtx, _uqS), _shBufI, _hitSfxCd,
// window._btDmgLog, the complete ordered list of injected calls with arguments, and the Math.random() count.
// CX-04c1 adds the death head (H3 = EnemyHurt.DeathHead with given body values, CH3 = H1 -> H2 -> H3 chained): exit label (decoy / doppelganger / boss revive / continue), the returned locals,
// the death-world globals (kills, combo, spawn holes, gate guard, druid sink, queues, projectiles ...), enemies added by the companion revive, and the same call/draw comparison.
// CX-04c2 adds the death tail (H4 = EnemyHurt.DeathTail with given body / death-head values, CH4 = H1 -> H2 -> H3 -> H4, the whole hurtE): G4 globals (malice, kill chain, rifts,
// _critSfxCd, _druidFled) and the tail's injected calls (_wiPush / _spawnBossProjectile literals with nested enemies and items, mkEn splits, potions, rollDrop, addExp, checkRooms, autosave).
// Standalone .NET check (not a Unity runtime or whole-game verdict).
class EnemyHurtProgram
{
    static readonly List<object> rows = new List<object>();
    static int failures, total;
    static string currentCase = "";
    static string currentKind = "tables";
    static readonly Dictionary<string, int> kindChecks = new Dictionary<string, int>(), kindFailures = new Dictionary<string, int>();
    static void Check(bool pass, string name)
    {
        total++; kindChecks[currentKind] = (kindChecks.ContainsKey(currentKind) ? kindChecks[currentKind] : 0) + 1;
        if (!pass) kindFailures[currentKind] = (kindFailures.ContainsKey(currentKind) ? kindFailures[currentKind] : 0) + 1;
        if (pass) { if (total % 20000 == 1) rows.Add(new { name = currentCase + " | " + name, passed = true }); }
        else { failures++; if (failures <= 80) rows.Add(new { name = currentCase + " | " + name, passed = false }); }
    }
    static bool Same(double a, double b) => BitConverter.DoubleToInt64Bits(a) == BitConverter.DoubleToInt64Bits(b);
    // {"$n":"NaN"|"Infinity"|"-Infinity"|"-0"}: numbers JSON cannot carry (recorded by export.cjs)
    static bool IsNumTag(JsonElement e, out string tag)
    {
        tag = null;
        if (e.ValueKind != JsonValueKind.Object) return false;
        int n = 0; foreach (var p in e.EnumerateObject()) { n++; if (p.Name == "$n" && p.Value.ValueKind == JsonValueKind.String) tag = p.Value.GetString(); }
        return n == 1 && tag != null;
    }
    static bool NumTagMatches(object cs, string tag)
    {
        if (!(cs is double d)) return false;
        switch (tag)
        {
            case "NaN": return double.IsNaN(d);
            case "Infinity": return double.IsPositiveInfinity(d);
            case "-Infinity": return double.IsNegativeInfinity(d);
            case "-0": return BitConverter.DoubleToInt64Bits(d) == BitConverter.DoubleToInt64Bits(-0.0);
            default: return false;
        }
    }

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
        if (u == typeof(object)) return JsValue(v);
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

    // a JSON value as the C# side keeps an arbitrary web value (List<object> fields such as _eatenItems): object -> JsObj (key order kept), array -> List<object>
    static object JsValue(JsonElement v)
    {
        switch (v.ValueKind)
        {
            case JsonValueKind.Null: return null;
            case JsonValueKind.Number: return v.GetDouble();
            case JsonValueKind.String: return v.GetString();
            case JsonValueKind.True: return true;
            case JsonValueKind.False: return false;
            case JsonValueKind.Array: { var l = new List<object>(); foreach (var x in v.EnumerateArray()) l.Add(JsValue(x)); return l; }
            default: { var o = new JsObj(); foreach (var p in v.EnumerateObject()) o.Set(p.Name, JsValue(p.Value)); return o; }
        }
    }
    static void Cmp(object cs, JsonElement js, string path)
    {
        switch (js.ValueKind)
        {
            case JsonValueKind.Null: Check(cs == null, path + " expected null, C# " + (cs ?? "null")); return;
            case JsonValueKind.Number:
                if (cs == null || cs is string || cs is bool) { Check(false, path + " C# " + (cs ?? "null") + " vs web " + js.GetDouble().ToString("R")); return; }
                double d = Convert.ToDouble(cs), w = js.GetDouble();
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
                if (IsNumTag(js, out var tag)) { Check(NumTagMatches(cs, tag), path + " expected " + tag + ", C# " + (cs is double td ? td.ToString("R") : (cs ?? "null").ToString())); return; }
                if (cs == null) { Check(false, path + " expected object, C# null"); return; }
                if (cs is JsObj jo)
                {
                    int keys = 0; foreach (var p in js.EnumerateObject()) { keys++; Check(jo.Has(p.Name), path + "." + p.Name + " missing in C# literal"); Cmp(jo.Get(p.Name), p.Value, path + "." + p.Name); }
                    Check(keys == jo.Props.Count, path + " key count C# " + jo.Props.Count + " vs web " + keys);
                    return;
                }
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

    sealed class GStatsView { public double crits, dmgDealt, maxHit; }
    sealed class GView
    {
        public GStatsView sStats; public double? playTime; public EnemyDmgPeak dmgPeak; public EnemyDmgPeakShow dmgPeakShow; public string flashCol; public double? flashT;
        public double hitStop, slowMo; public double? noHitStopT; public double dpsDmg, txtPerFrame; public EnemyUqScCtx uqScCtx; public EnemyUqS uqS;
    }

    sealed class G4View { public bool? druidFled; public double mats, chainCnt, chainT; public List<EnemyRift> rifts; public double critSfxCd; }

    sealed class G3View
    {
        public double kills; public double? stageKills; public double combo, comboTimer, comboMax; public EnemyDruidSink druidSink; public double druidFinaleBoss; public bool gateGuardSet; public bool? gateGuardKilled, bossGateOpen;
        public double? chromaT; public List<EnemyDeathSnd> blDeathSndQ; public List<EnemyUqZone> uqZoneQ; public List<EnemySpawnHole> spawnHoles; public bool shDirty; public double harpGauge; public EnemyFzCtx uqFzCtx; public List<EnemyPProj> pProjs;
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
        if (x is EnemyHurtOpts || x is EnemyProjectile || x is EnemyBossShot || x is EnemyReviveVfxOpts || x is EnemyHurtPMeta)
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
        if (x is JsObj jo)
        {   // a web object literal: keys sorted like Object.keys(a).sort(), nested enemies / literals serialised the same way (export.cjs __ser)
            var p = new Pairs(); var kv = new List<KeyValuePair<string, object>>(jo.Props); kv.Sort((a, b) => string.CompareOrdinal(a.Key, b.Key));
            foreach (var e in kv) p.V.Add(new KeyValuePair<string, object>(e.Key, Ser(e.Value)));
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
                if (IsNumTag(wa, out var ntag)) return NumTagMatches(ga, ntag);
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
        var potTable = new Dictionary<string, EnemyPotDef>();
        foreach (var pp in t.GetProperty("POT").EnumerateObject()) potTable[pp.Name] = new EnemyPotDef { name = pp.Value.GetProperty("name").GetString(), col = pp.Value.GetProperty("col").GetString() };
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

        int caseCount = 0, earlyCount = 0, h1Count = 0, h2Count = 0, chainCount = 0, h3Count = 0, chain3Count = 0, h4Count = 0, chain4Count = 0, addedCount = 0;
        var exitCounts = new Dictionary<string, int>();
        foreach (var cs in root.GetProperty("cases").EnumerateArray())
        {
            caseCount++;
            currentCase = cs.GetProperty("name").GetString();
            string kind = cs.GetProperty("kind").GetString(); currentKind = kind; if (kind == "H1") h1Count++; else if (kind == "H2") h2Count++; else if (kind == "CH") chainCount++; else if (kind == "H3") h3Count++; else if (kind == "CH3") chain3Count++; else if (kind == "H4") h4Count++; else chain4Count++;
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
                PlayTime = w.TryGetProperty("playTime", out var ptJs) && ptJs.ValueKind == JsonValueKind.Number ? ptJs.GetDouble() : (double?)null, PassAbund = pas("pAbund"), PassBow = pas("pBow"), PassCombo = pas("pCombo"),
                ArmorEl = elOf("armor"), WeaponEl = elOf("weapon"),
                NecklaceDmg = dmgB("necklace", ""), Ring1Dmg = dmgB("ring1", ""), Ring2Dmg = dmgB("ring2", ""), BeltDmg = dmgB("belt", ""), BraceletDmg = dmgB("bracelet", ""), HeadbandDmg = dmgB("headband", ""), Headband2Dmg = dmgB("headband2", ""),
                ShBufI = w.GetProperty("shBufI").GetInt32(), HitSfxCd = w.GetProperty("hitSfxCd").GetDouble(), Now = w.GetProperty("now").GetDouble(),
                BtDmgLog = w.GetProperty("btLog").ValueKind == JsonValueKind.Null ? null : new List<EnemyHurtLogEntry>(), ParryLessonActive = w.GetProperty("lesson").GetBoolean(), Ens = ens
            };
            var sSt = w.GetProperty("sStats");
            if (sSt.ValueKind != JsonValueKind.Null) { c.StatDmgDealt = sSt.GetProperty("dmgDealt").GetDouble(); c.StatMaxHit = sSt.GetProperty("maxHit").GetDouble(); }
            var w2 = cs.GetProperty("w2");
            c.OptParts = w2.GetProperty("optParts").GetDouble(); c.ViewW = w2.GetProperty("VW").GetDouble(); c.ViewH = w2.GetProperty("VH").GetDouble(); c.DpsDmg = w2.GetProperty("dpsDmg").GetDouble();
            c.TxtPerFrame = w2.GetProperty("txtPerFrame").GetDouble(); c.ImpPerFrame = w2.GetProperty("impPerFrame").GetDouble();
            c.CamX = w2.GetProperty("cam").GetProperty("x").GetDouble(); c.CamY = w2.GetProperty("cam").GetProperty("y").GetDouble();
            c.HitStop = w2.GetProperty("hitStop").GetDouble(); c.SlowMo = w2.GetProperty("slowMo").GetDouble();
            c.NoHitStopT = w2.GetProperty("noHitStopT").ValueKind == JsonValueKind.Null ? (double?)null : w2.GetProperty("noHitStopT").GetDouble();
            if (w2.GetProperty("dmgPeak").ValueKind == JsonValueKind.Object) { c.DmgPeak = new EnemyDmgPeak(); Fill(c.DmgPeak, w2.GetProperty("dmgPeak")); }
            if (w2.GetProperty("dmgPeakShow").ValueKind == JsonValueKind.Object) { c.DmgPeakShow = new EnemyDmgPeakShow(); Fill(c.DmgPeakShow, w2.GetProperty("dmgPeakShow")); }
            if (w2.GetProperty("uqScCtx").ValueKind == JsonValueKind.Object) { c.UqScCtx = new EnemyUqScCtx(); Fill(c.UqScCtx, w2.GetProperty("uqScCtx")); }
            if (w2.GetProperty("uqS").ValueKind == JsonValueKind.Object) { c.UqS = new EnemyUqS(); Fill(c.UqS, w2.GetProperty("uqS")); }
            string canMvRule = w2.GetProperty("canMv").GetString();
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
            c.HurtEnemy = (e, d, ang, ns, o, el) => { if (el.HasValue) Log("hurtE", e, d, ang.HasValue ? (object)ang.Value : null, ns, o, el.Value); else Log("hurtE", e, d, ang.HasValue ? (object)ang.Value : null, ns, o); };
            c.PoolPart = (x, y, vx, vy, col, sz, life, tp, rot, grav) => { if (tp.HasValue) Log("poolPart", x, y, vx, vy, col, sz, life, tp.Value, rot.Value, grav.Value); else Log("poolPart", x, y, vx, vy, col, sz, life); };
            c.AddImpact = (x, y, el, ang, type, ib, nf) => Log("addImpact", x, y, el, ang, type, ib, nf);
            c.AddBoom = (x, y, r, dur, col) => Log("addBoom", x, y, r, dur, col);
            c.TickSkyCrusherRecharge = fr => Log("tickSkyCrusherRecharge", fr);
            c.SfxGroggy = () => Log("sfxGroggy");
            c.ParryLessonHurt = (e, d, ang, o) => Log("parryLessonHurt", e, d, ang.HasValue ? (object)ang.Value : null, o);
            c.HurtPlayer = d => Log("hurtP", d);
            c.SpawnBossProjectile = (e, o) => Log("spawnBossProjectile", e, o);
            c.AddText = (x, y, s, col, life, size, s2) => { if (size.HasValue) Log("addTxt", x, y, s, col, life, size.Value, s2); else Log("addTxt", x, y, s, col, life); };
            c.AddParts = (x, y, col, n) => Log("addParts", x, y, col, n);
            c.Shake = n => Log("shake", n); c.DoHitFlash = (col, al) => Log("doHitFlash", col, al);
            c.PlaySample = (k, v, p) => Log("playSample", k, v, p);
            c.HitSfxForEtype = et => { Log("hitSfxForEtype", et); return new EnemyHitSfx { key = "hit_" + et, pitch = 1 + et / 1000.0 }; };
            c.Block = () => Log("sfxBlock"); c.Translate = s => { Log("T", s); return s; };

            // ---- CX-04c1 death world (w3) ----
            var w3 = cs.GetProperty("w3");
            Func<string, double?> w3n = k => w3.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : (double?)null;
            c.Stage = w3.GetProperty("stage").GetDouble(); c.DemoMode = w3.GetProperty("demoMode").GetBoolean(); c.DemoLastStage = w3.GetProperty("demoLast").GetDouble();
            c.OptDiff = w3n("diff"); c.OptHitStop = w3.GetProperty("optHitStop").GetDouble();
            c.Kills = w3.GetProperty("kills").GetDouble(); c.StageKills = w3n("stageKills"); c.Combo = w3.GetProperty("combo").GetDouble(); c.ComboTimer = w3.GetProperty("comboTimer").GetDouble(); c.ComboMax = w3.GetProperty("comboMax").GetDouble();
            if (w3.GetProperty("killedBosses").ValueKind == JsonValueKind.Array) { c.KilledBosses = new List<double>(); foreach (var kb in w3.GetProperty("killedBosses").EnumerateArray()) c.KilledBosses.Add(kb.GetDouble()); }
            if (w3.GetProperty("fireZones").ValueKind == JsonValueKind.Array) { c.FireZones = new List<EnemyFireZone>(); foreach (var fz in w3.GetProperty("fireZones").EnumerateArray()) { var z = new EnemyFireZone(); Fill(z, fz); c.FireZones.Add(z); } }
            c.SpawnHoles = new List<EnemySpawnHole>(); foreach (var sh in w3.GetProperty("spawnHoles").EnumerateArray()) { var h = new EnemySpawnHole(); Fill(h, sh); c.SpawnHoles.Add(h); }
            c.GateGuardSet = w3.GetProperty("gateGuard").GetBoolean(); c.GateGuardKilled = w3.GetProperty("gateGuardKilled").GetBoolean(); c.BossGateOpen = w3.GetProperty("bossGateOpen").GetBoolean(); c.ChromaT = w3n("chromaT");
            if (w3.GetProperty("blDeathSndQ").ValueKind == JsonValueKind.Array) c.BlDeathSndQ = new List<EnemyDeathSnd>();
            if (w3.GetProperty("uqZoneQ").ValueKind == JsonValueKind.Array) { c.UqZoneQ = new List<EnemyUqZone>(); foreach (var uz in w3.GetProperty("uqZoneQ").EnumerateArray()) { var z = new EnemyUqZone(); Fill(z, uz); c.UqZoneQ.Add(z); } }
            c.ShDirty = w3.GetProperty("shDirty").GetBoolean(); c.HarpGauge = w3.GetProperty("harpGauge").GetDouble(); c.HarpGaugeMax = w3.GetProperty("harpMax").GetDouble();
            c.UqHitCtx = w3.GetProperty("uqHitCtx").ValueKind == JsonValueKind.String ? w3.GetProperty("uqHitCtx").GetString() : null;
            if (w3.GetProperty("uqFzCtx").ValueKind == JsonValueKind.Object) { c.UqFzCtx = new EnemyFzCtx(); Fill(c.UqFzCtx, w3.GetProperty("uqFzCtx")); }
            double rageMaxValue = w3n("rageMax") ?? double.NaN;
            int cmN = 0;
            c.CanMove = (x, y, r) => { Log("canMv", x, y, r); cmN++; if (canMvRule == "blockAll") return false; if (canMvRule.StartsWith("first")) return cmN > int.Parse(canMvRule.Substring(5)); if (canMvRule.StartsWith("only")) return cmN != int.Parse(canMvRule.Substring(4)); return true; };
            c.AtkTicketRelease = e0 => Log("atkTicketRelease", e0); c.RegKill = e0 => Log("regKill", e0); c.PetOnKill = e0 => Log("petOnKill", e0);
            c.ReviveVfx = (x, y, col, label, o) => Log("reviveVFX", x, y, col, label, o);
            c.PlayVfxAng = (k, x, y, sc, a0, b0, f) => Log("playVFXAng", k, x, y, sc, a0, b0, f);
            c.AddBlastLight = (x, y, r, t0, cr, cg, cb) => Log("addBlastLight", x, y, r, t0, cr, cg, cb);
            c.AddTpBolt = (a0, b0, c0, d0, wd, col) => Log("addTpBolt", a0, b0, c0, d0, wd, col);
            c.DeathFx = (x, y, r, col, ib, burn, et, kind0) => Log("deathFX", x, y, r, col, ib, burn, et, kind0);
            c.SpawnLargeMonsterDeathFx = (e0, a0) => Log("spawnLargeDeathFx", e0, a0); c.AddCorpse = (e0, a0, pw) => Log("addCorpse", e0, a0, pw); c.AddBurnCorpse = e0 => Log("addBurnCorpse", e0);
            c.AddGorePiece = (x, y, k) => Log("addGorePiece", x, y, k); c.AddDeathImpact = (x, y, r) => Log("addDeathImpact", x, y, r);
            c.GetPProj = () => { Log("getPProj"); return new EnemyPProj(); };
            c.Lang = (ko, en) => { Log("L", ko, en); return ko; };
            c.RageMax = () => { Log("rageMax"); return rageMaxValue; };
            c.HurtPlayerTyped = (d0, m0) => Log("hurtP", d0, m0);
            c.SpawnBossShot = (e0, o) => Log("spawnBossProjectile", e0, o);
            c.SfxVictory = () => Log("sfxVictory"); c.BuildMapCache = () => Log("buildMapCache");
            var spawnCtx = new EnemySpawnContext { PlayerLevel = P.lv ?? double.NaN, DifficultyIndex = (int)(c.OptDiff ?? 5), StageDiffOffset = 0, Stage = (int)c.Stage, DemoMode = c.DemoMode, DemoLastStage = (int)c.DemoLastStage, CanMove = (x, y, r) => c.CanMove(x, y, r), Random = () => c.Random() };
            c.MkEn = (x, y, si, et, ib, el, room) => { Log("mkEn", x, y, si, et, ib, el.HasValue ? (object)el.Value : null, room.HasValue ? (object)room.Value : null); return EnemyFactory.Create(spawnCtx, x, y, si, et, ib, el, room); };

            // ---- CX-04c2 death-tail world (w4) + the head / death-head additions of web 780ac692b (crit sound), 481482e72 (boss line), 2c3c380ec (sink line / _druidFled) ----
            var w4 = cs.GetProperty("w4");
            c.Mats = w4.GetProperty("mats").GetDouble(); c.ChainCnt = w4.GetProperty("chainCnt").GetDouble(); c.ChainT = w4.GetProperty("chainT").GetDouble(); c.CritSfxCd = w4.GetProperty("critSfxCd").GetDouble();
            c.Rifts = new List<EnemyRift>(); foreach (var rf in w4.GetProperty("rifts").EnumerateArray()) { var z = new EnemyRift(); Fill(z, rf); c.Rifts.Add(z); }
            double magicRefV = w4.GetProperty("magicRef").GetDouble(), statIntV = w4.GetProperty("statInt").GetDouble(), pMagicMulV = w4.GetProperty("pMagicMul").GetDouble(), skMulV = w4.GetProperty("skMul").GetDouble(); bool addPotionOk = w4.GetProperty("addPotionOk").GetBoolean();
            c.BossLine = k => Log("bossLine", k);
            c.WiPush = o => Log("wiPush", o);
            c.MagicRef = () => { Log("magicRef"); return magicRefV; }; c.StatInt = () => { Log("statInt"); return statIntV; }; c.PMagicMul = () => { Log("pMagicMul"); return pMagicMulV; }; c.SkMul = id => { Log("skMul", id); return skMulV; };
            c.EProjAt = (e0, a0, sp, dm, el, life, col, sz) => Log("eProjAt", e0, a0, sp, dm, el, life, col, sz);
            c.SpawnShot = (e0, o) => Log("spawnBossProjectile", e0, o);
            c.HurtEnemyAng = (e0, d0, a0) => Log("hurtE", e0, d0, a0, null, null);
            int itemN = 0; c.MkItem = (sl, tier, el, rar) => { Log("mkItem", sl, tier, el, rar); return new JsObj().Set("stubItem", (double)(++itemN)).Set("slot", (object)sl).Set("tier", tier).Set("el", el).Set("rarity", rar); };
            c.AddPotion = (t0, n0) => { Log("addPotion", t0, n0); return addPotionOk; };
            c.Pot = k => potTable.TryGetValue(k, out var pd) ? pd : null;
            double? pMal = pas("pMalice"); c.MaliceMul = () => 1 + (pMal.HasValue && pMal.Value != 0 && !double.IsNaN(pMal.Value) ? pMal.Value : 0) * 0.08;
            c.RollDrop = e0 => Log("rollDrop", e0); c.AddExp = (v, tr) => { if (tr.HasValue) Log("addExp", v, tr.Value); else Log("addExp", v); };
            c.CheckRooms = () => Log("checkRooms"); c.DbSaveNow = () => Log("dbSaveNow");
            c.SfxExplode = () => Log("sfxExplode"); c.SfxMagicHit = () => Log("sfxMagicHit"); c.SfxPickup = () => Log("sfxPickup");

            EnemyHurtHeadResult ret = null; EnemyHurtBodyResult ret2 = null; EnemyHurtDeathResult ret3 = null; DeathExit exit3 = DeathExit.NotDead; string error = null;
            try
            {
                EnemyHurtOpts opts = null; if (a.TryGetProperty("opts", out var optsJs) && optsJs.ValueKind == JsonValueKind.Object) { opts = new EnemyHurtOpts(); Fill(opts, optsJs); }
                double? ang = !a.TryGetProperty("ang", out var angJs) || angJs.ValueKind == JsonValueKind.Null ? (double?)null : angJs.GetDouble(); // an undefined ang is omitted by JSON
                bool noSound = a.GetProperty("noSound").GetBoolean();
                if (kind == "H2") { var head = new EnemyHurtHeadResult(); Fill(head, cs.GetProperty("head")); ret2 = EnemyHurt.Body(c, ens[0], ang, noSound, opts, head); }
                else if (kind == "H3") { var body = new EnemyHurtBodyResult(); Fill(body, cs.GetProperty("head3")); ret3 = EnemyHurt.DeathHead(c, ens[0], ang, noSound, opts, body, out exit3); }
                else if (kind == "H4") { var body = new EnemyHurtBodyResult(); Fill(body, cs.GetProperty("head3")); var d4 = new EnemyHurtDeathResult(); Fill(d4, cs.GetProperty("d4")); EnemyHurt.DeathTail(c, ens[0], ang, noSound, opts, body, d4); }
                else
                {
                    double atkEl = !a.TryGetProperty("atkEl", out var aeJs) || aeJs.ValueKind == JsonValueKind.Null ? 0 : aeJs.GetDouble();
                    ret = EnemyHurt.Head(c, ens[0], a.GetProperty("dmg").GetDouble(), ang, noSound, opts, atkEl);
                    if ((kind == "CH" || kind == "CH3" || kind == "CH4") && ret != null) ret2 = EnemyHurt.Body(c, ens[0], ang, noSound, opts, ret);
                    if ((kind == "CH3" || kind == "CH4") && ret2 != null) ret3 = EnemyHurt.DeathHead(c, ens[0], ang, noSound, opts, ret2, out exit3);
                    if (kind == "CH4" && exit3 == DeathExit.Continue) EnemyHurt.DeathTail(c, ens[0], ang, noSound, opts, ret2, ret3);
                }
            }
            catch (Exception ex) { error = ex.GetType().Name + ": " + ex.Message; }
            Check(error == null, "no exception" + (error == null ? "" : " (" + error + ")"));
            if (error != null) continue;
            if (kind == "H1" || kind == "CH" || kind == "CH3" || kind == "CH4")
            {
                var want = exp.GetProperty("ret");
                if (want.ValueKind == JsonValueKind.Null) { earlyCount++; Check(ret == null, "web returned early, C# did not"); }
                else { Check(ret != null, "web fell through, C# returned early"); if (ret != null) Cmp(ret, want, "ret"); }
            }
            if (kind == "H2" || kind == "CH" || kind == "CH3" || kind == "CH4") { Check(ret2 != null, "Body result missing"); if (ret2 != null) Cmp(ret2, exp.GetProperty("ret2"), "ret2"); }
            if (kind == "H3" || kind == "CH3" || kind == "CH4")
            {
                var want3 = exp.GetProperty("ret3"); string wantExit = exp.GetProperty("exit").GetString();
                Check(exit3.ToString() == wantExit, "death head exit C# " + exit3 + " vs web " + wantExit);
                exitCounts[wantExit] = (exitCounts.ContainsKey(wantExit) ? exitCounts[wantExit] : 0) + 1;
                if (want3.ValueKind == JsonValueKind.Null) Check(ret3 == null, "web returned early (undefined), C# returned a result");
                else { Check(ret3 != null, "web returned a result, C# returned early"); if (ret3 != null) Cmp(ret3, want3, "ret3"); }
                var g3 = new G3View
                {
                    kills = c.Kills, stageKills = c.StageKills, combo = c.Combo, comboTimer = c.ComboTimer, comboMax = c.ComboMax, druidSink = c.DruidSink, druidFinaleBoss = c.DruidFinaleBoss == null ? -1 : ens.IndexOf(c.DruidFinaleBoss),
                    gateGuardSet = c.GateGuardSet, gateGuardKilled = c.GateGuardKilled, bossGateOpen = c.BossGateOpen, chromaT = c.ChromaT, blDeathSndQ = c.BlDeathSndQ, uqZoneQ = c.UqZoneQ, spawnHoles = c.SpawnHoles,
                    shDirty = c.ShDirty, harpGauge = c.HarpGauge, uqFzCtx = c.UqFzCtx, pProjs = c.PProjs
                };
                Cmp(g3, exp.GetProperty("G3"), "G3");
            }
            var added = exp.GetProperty("added"); addedCount += added.GetArrayLength();
            Check(ens.Count == finals.Count + added.GetArrayLength(), "enemy count C# " + ens.Count + " vs web " + (finals.Count + added.GetArrayLength()));
            for (int i = 0; i < finals.Count; i++) Cmp(ens[i], finals[i].RootElement, "enemy" + i);
            for (int i = 0; i < added.GetArrayLength() && finals.Count + i < ens.Count; i++) Cmp(ens[finals.Count + i], added[i], "added enemy" + i);
            Cmp(P, finalP.RootElement, "P");
            var g = exp.GetProperty("G");
            var gv = new GView
            {
                sStats = c.HasStats ? new GStatsView { crits = c.StatCrits, dmgDealt = c.StatDmgDealt, maxHit = c.StatMaxHit } : null, playTime = c.PlayTime, dmgPeak = c.DmgPeak, dmgPeakShow = c.DmgPeakShow, flashCol = c.FlashCol, flashT = c.FlashT,
                hitStop = c.HitStop, slowMo = c.SlowMo, noHitStopT = c.NoHitStopT, dpsDmg = c.DpsDmg, txtPerFrame = c.TxtPerFrame, uqScCtx = c.UqScCtx, uqS = c.UqS
            };
            Cmp(gv, g, "G");
            Cmp(new G4View { druidFled = c.DruidFled, mats = c.Mats, chainCnt = c.ChainCnt, chainT = c.ChainT, rifts = c.Rifts, critSfxCd = c.CritSfxCd }, exp.GetProperty("G4"), "G4");
            Check(c.ShBufI == exp.GetProperty("shBufI").GetInt32(), "_shBufI C# " + c.ShBufI + " vs web " + exp.GetProperty("shBufI").GetInt32());
            Check(Same(c.HitSfxCd, exp.GetProperty("hitSfxCd").GetDouble()), "_hitSfxCd");
            Cmp(c.BtDmgLog, exp.GetProperty("btLog"), "window._btDmgLog");
            Check(used == exp.GetProperty("consumed").GetInt32(), "Random() calls C# " + used + " vs web " + exp.GetProperty("consumed").GetInt32());
            CmpLog(log, exp.GetProperty("log"));
            foreach (var d in finals) d.Dispose(); finalP.Dispose();
        }
        currentCase = "summary"; currentKind = "summary";
        var s = root.GetProperty("summary");
        Check(caseCount == s.GetProperty("cases").GetInt32(), "case count");
        Check(earlyCount == s.GetProperty("earlyReturns").GetInt32(), "early-return count");
        Check(h1Count == s.GetProperty("h1").GetInt32() && h2Count == s.GetProperty("h2").GetInt32() && chainCount == s.GetProperty("chain").GetInt32() && h3Count == s.GetProperty("h3").GetInt32() && chain3Count == s.GetProperty("chain3").GetInt32() && h4Count == s.GetProperty("h4").GetInt32() && chain4Count == s.GetProperty("chain4").GetInt32(), "case kinds H1/H2/chain/H3/CH3/H4/CH4");
        Check(addedCount == s.GetProperty("addedEnemies").GetInt32(), "enemies added by the companion revive");
        foreach (var ex in s.GetProperty("h3Exits").EnumerateObject()) Check((exitCounts.ContainsKey(ex.Name) ? exitCounts[ex.Name] : 0) == ex.Value.GetInt32(), "death-head exit count " + ex.Name);
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_function_oracle_not_Unity_runtime", passed = failures == 0, failures, total, checksByKind = kindChecks, failuresByKind = kindFailures, cases = caseCount, h1Cases = h1Count, h2Cases = h2Count, chainCases = chainCount, h3Cases = h3Count, h4Cases = h4Count, chain4Cases = chain4Count, chain3Cases = chain3Count, deathExits = exitCounts, addedEnemies = addedCount, earlyReturns = earlyCount,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32(), head = root.GetProperty("source").GetProperty("head").GetString() },
            note = "every case compares the early-return flag and returned locals, all enemy fields, player, globals, the ordered injected-call list with arguments and the Math.random count; failing items listed (first 80), passing ones sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        Console.WriteLine("ENEMY_HURT_RESULT " + total + " checks / " + failures + " failures (" + caseCount + " cases)");
        foreach (var kv in kindChecks) Console.WriteLine("  " + kv.Key + ": " + kv.Value + " checks / " + (kindFailures.ContainsKey(kv.Key) ? kindFailures[kv.Key] : 0) + " failures");
        return failures == 0 ? 0 : 2;
    }
}
