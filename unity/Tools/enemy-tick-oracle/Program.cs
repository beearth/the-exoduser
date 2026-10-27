using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Exoduser.UnityPort.Core;

// Compares C# EnemyTick (Runtime/Core/EnemyTick.cs) with oracle.json, which export.cjs produced by running the ORIGINAL enemy-loop head (L1) and
// updateE head (U1) from game.html in a Node VM with recording stubs for everything the web code calls but CX-03a does not port.
// Per case: every field of every enemy after the call (reflection by web field name, doubles bit-for-bit), the globals the code changes
// (G.kills, G._stageKills, G._eTierFrame, bonfire timer, _mSfxPlaying), the complete ordered list of injected calls with their arguments,
// the Math.random() count, the performance.now() count, and for U1 the early-return flag and the local d.
// Standalone .NET check (not a Unity runtime or whole-game verdict).
class EnemyTickProgram
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

    // ---- JSON -> C# object (by web field name) ----
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

    // ---- rules shared with export.cjs ----
    sealed class Rule
    {
        public string Kind = "open"; public double Cx, Cy, Rad, V;
        public static Rule From(JsonElement e)
        {
            var r = new Rule { Kind = e.GetProperty("kind").GetString() };
            if (e.TryGetProperty("cx", out var a)) r.Cx = a.GetDouble();
            if (e.TryGetProperty("cy", out var b)) r.Cy = b.GetDouble();
            if (e.TryGetProperty("rad", out var c)) r.Rad = c.GetDouble();
            if (e.TryGetProperty("v", out var d)) r.V = d.GetDouble();
            return r;
        }
        public bool Move(double x, double y, double rad)
        {
            if (Kind == "open") return true; if (Kind == "blockAll") return false;
            if (Kind == "blockDisc") { double dx = x - Cx, dy = y - Cy, rr = Rad + rad; return dx * dx + dy * dy >= rr * rr; }
            if (Kind == "blockXge") return !(x >= V);
            throw new InvalidOperationException("rule " + Kind);
        }
    }

    sealed class Ref { public int E; }
    sealed class BfRef { public double[] V; }
    static List<EnemySpawn> ens;
    static List<object[]> log;
    static void Log(string name, params object[] args)
    {
        var a = new object[args.Length + 1]; a[0] = name;
        for (int i = 0; i < args.Length; i++)
        {
            var x = args[i];
            if (x is EnemySpawn es) { int idx = ens.IndexOf(es); if (idx < 0) throw new InvalidOperationException("unknown enemy argument"); a[i + 1] = new Ref { E = idx }; }
            else if (x is EnemyBonfire bf) a[i + 1] = new BfRef { V = new[] { bf.x, bf.y, bf.r, bf.t } };
            else if (x is int n) a[i + 1] = (double)n;
            else a[i + 1] = x;
        }
        log.Add(a);
    }

    static void CmpLog(List<object[]> got, JsonElement want)
    {
        Check(got.Count == want.GetArrayLength(), "injected call count C# " + got.Count + " vs web " + want.GetArrayLength());
        for (int i = 0; i < Math.Min(got.Count, want.GetArrayLength()); i++)
        {
            var g = got[i]; var w = want[i];
            string tag = "call[" + i + "] " + w[0].GetString();
            bool ok = g.Length == w.GetArrayLength() && (string)g[0] == w[0].GetString();
            Check(ok, tag + " name/arity C# " + g[0] + "/" + g.Length + " vs web " + w[0].GetString() + "/" + w.GetArrayLength());
            if (!ok) continue;
            for (int k = 1; k < g.Length; k++)
            {
                var wa = w[k]; var ga = g[k]; bool same;
                switch (wa.ValueKind)
                {
                    case JsonValueKind.Number: same = ga is double gd && Same(gd, wa.GetDouble()); break;
                    case JsonValueKind.String: same = ga is string gs && gs == wa.GetString(); break;
                    case JsonValueKind.True: same = ga is bool gb1 && gb1; break;
                    case JsonValueKind.False: same = ga is bool gb2 && !gb2; break;
                    case JsonValueKind.Object:
                        if (wa.TryGetProperty("e", out var ee)) same = ga is Ref r && r.E == ee.GetInt32();
                        else { var bv = wa.GetProperty("bf"); var br = ga as BfRef; same = br != null && br.V.Length == bv.GetArrayLength(); if (same) for (int q = 0; q < br.V.Length; q++) same &= Same(br.V[q], bv[q].GetDouble()); }
                        break;
                    default: same = false; break;
                }
                Check(same, tag + " arg" + k + " C# " + Describe(ga) + " vs web " + wa.GetRawText());
            }
        }
    }
    static string Describe(object o) { if (o is Ref r) return "{e:" + r.E + "}"; if (o is BfRef b) return "{bf:[" + string.Join(",", b.V) + "]}"; if (o is double d) return d.ToString("R"); return (o ?? "null").ToString(); }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement;
        var t = root.GetProperty("tables");
        currentCase = "tables";
        Check(EnemyFactory.Tile == t.GetProperty("T").GetDouble(), "T");
        var rng = t.GetProperty("ETYPE_RANGE");
        Check(EnemyTables.Range.Length == rng.GetArrayLength(), "ETYPE_RANGE length");
        for (int i = 0; i < Math.Min(rng.GetArrayLength(), EnemyTables.Range.Length); i++) Check(Same(EnemyTables.Range[i], rng[i].GetDouble()), "ETYPE_RANGE[" + i + "]");
        var es = t.GetProperty("_ETYPE_SFX"); var ar = t.GetProperty("_ARCH_SFX");
        Check(EnemyTickTables.EtypeSfxCount == CountProps(es), "_ETYPE_SFX entry count"); Check(EnemyTickTables.ArchSfxCount == CountProps(ar), "_ARCH_SFX entry count");
        for (int et = -2; et < 130; et++)
        {
            string wantE = es.TryGetProperty(et.ToString(), out var pe) ? pe.GetString() : null, wantA = ar.TryGetProperty(et.ToString(), out var pa) ? pa.GetString() : null;
            Check(EnemyTickTables.EtypeSfx(et) == wantE, "_ETYPE_SFX[" + et + "]"); Check(EnemyTickTables.ArchSfx(et) == wantA, "_ARCH_SFX[" + et + "]");
        }
        // JsMath (fdlibm port) against the host V8 results
        var ms = t.GetProperty("mathSamples");
        foreach (var a in ms.GetProperty("atan2").EnumerateArray()) { double got = JsMath.Atan2(a[0].GetDouble(), a[1].GetDouble()), want = a[2].GetDouble(); Check(Same(got == 0 ? 0 : got, want == 0 ? 0 : want), "JsMath.Atan2(" + a[0].GetDouble().ToString("R") + "," + a[1].GetDouble().ToString("R") + ") C# " + got.ToString("R") + " vs V8 " + want.ToString("R")); }
        foreach (var a in ms.GetProperty("sin").EnumerateArray()) { double got = JsMath.Sin(a[0].GetDouble()), want = a[1].GetDouble(); Check(Same(got == 0 ? 0 : got, want == 0 ? 0 : want), "JsMath.Sin(" + a[0].GetDouble().ToString("R") + ") C# " + got.ToString("R") + " vs V8 " + want.ToString("R")); }
        foreach (var a in ms.GetProperty("cos").EnumerateArray()) { double got = JsMath.Cos(a[0].GetDouble()), want = a[1].GetDouble(); Check(Same(got == 0 ? 0 : got, want == 0 ? 0 : want), "JsMath.Cos(" + a[0].GetDouble().ToString("R") + ") C# " + got.ToString("R") + " vs V8 " + want.ToString("R")); }
        var bases = root.GetProperty("bases");

        int caseCount = 0, earlyCount = 0;
        foreach (var cs in root.GetProperty("cases").EnumerateArray())
        {
            caseCount++;
            currentCase = cs.GetProperty("name").GetString();
            string kind = cs.GetProperty("kind").GetString();
            double sp = cs.GetProperty("sp").GetDouble();
            var w = cs.GetProperty("world"); var rules = cs.GetProperty("rules"); var exp = cs.GetProperty("expected");
            // enemies: base JSON + overrides (initial), expected final = initial + diff
            ens = new List<EnemySpawn>(); var finals = new List<JsonDocument>();
            int ei = 0;
            foreach (var es0 in cs.GetProperty("enemies").EnumerateArray())
            {
                var node = JsonNode.Parse(bases[es0.GetProperty("base").GetInt32()].GetProperty("obj").GetRawText()).AsObject();
                foreach (var p in es0.GetProperty("over").EnumerateObject()) node[p.Name] = JsonNode.Parse(p.Value.GetRawText());
                var e = new EnemySpawn(); using (var doc = JsonDocument.Parse(node.ToJsonString())) Fill(e, doc.RootElement);
                ens.Add(e);
                foreach (var p in exp.GetProperty("diffs")[ei].EnumerateObject()) node[p.Name] = JsonNode.Parse(p.Value.GetRawText());
                finals.Add(JsonDocument.Parse(node.ToJsonString())); ei++;
            }
            log = new List<object[]>();
            var seqJs = cs.GetProperty("seq"); var seq = new double[seqJs.GetArrayLength()]; for (int i = 0; i < seq.Length; i++) seq[i] = seqJs[i].GetDouble();
            var clockJs = cs.GetProperty("clock"); var clock = new double[clockJs.GetArrayLength()]; for (int i = 0; i < clock.Length; i++) clock[i] = clockJs[i].GetDouble();
            int used = 0, clockUsed = 0;
            var mapW = w.GetProperty("mw").GetInt32(); var mapH = w.GetProperty("mh").GetInt32();
            var map = new int[mapH][]; for (int y = 0; y < mapH; y++) map[y] = new int[mapW];
            foreach (var wl in w.GetProperty("walls").EnumerateArray()) map[wl[1].GetInt32()][wl[0].GetInt32()] = 1;
            var rCanMv = Rule.From(rules.GetProperty("canMv")); var rTile = Rule.From(rules.GetProperty("canMvTile")); var rWall = Rule.From(rules.GetProperty("wallStuck"));
            var rIsW = Rule.From(rules.GetProperty("isW")); bool rLos = rules.GetProperty("hasLOS").GetBoolean();
            var c = new EnemyTickContext
            {
                PlayerX = w.GetProperty("P").GetProperty("x").GetDouble(), PlayerY = w.GetProperty("P").GetProperty("y").GetDouble(),
                CamX = w.GetProperty("cam").GetProperty("x").GetDouble(), CamY = w.GetProperty("cam").GetProperty("y").GetDouble(),
                ViewW = w.GetProperty("VW").GetDouble(), ViewH = w.GetProperty("VH").GetDouble(), IsMobile = w.GetProperty("IS_MOBILE").GetBoolean(),
                MapWidth = mapW, MapHeight = mapH, Map = map, Kills = w.GetProperty("kills").GetDouble(),
                StageKills = w.GetProperty("stageKills").ValueKind == JsonValueKind.Null ? (double?)null : w.GetProperty("stageKills").GetDouble(),
                EnemyTierFrame = w.GetProperty("eTierFrame").ValueKind == JsonValueKind.Null ? (double?)null : w.GetProperty("eTierFrame").GetDouble(),
                MoveSfxPlaying = w.GetProperty("mSfx").GetInt32(), ParryLessonActive = w.GetProperty("lesson").GetBoolean(),
                Stage = w.GetProperty("stage").GetInt32(), DemoMode = w.GetProperty("demoMode").GetBoolean(), DemoLastStage = w.GetProperty("demoLast").GetInt32()
            };
            if (w.GetProperty("bonfire").ValueKind != JsonValueKind.Null) { var b = w.GetProperty("bonfire"); c.Bonfire = new EnemyBonfire { x = b.GetProperty("x").GetDouble(), y = b.GetProperty("y").GetDouble(), r = b.GetProperty("r").GetDouble(), t = b.GetProperty("t").GetDouble() }; }
            foreach (var rf in w.GetProperty("rifts").EnumerateArray()) c.Rifts.Add(new EnemyRift { x = rf.GetProperty("x").GetDouble(), y = rf.GetProperty("y").GetDouble(), t = rf.GetProperty("t").GetDouble(), maxT = rf.GetProperty("maxT").GetDouble() });
            c.Random = () => { if (used >= seq.Length) throw new InvalidOperationException("random sequence exhausted (C# draws more than the web)"); return seq[used++]; };
            c.Now = () => { Log("now"); if (clockUsed >= clock.Length) throw new InvalidOperationException("clock exhausted"); return clock[clockUsed++]; };
            c.CanMove = (x, y, r) => { Log("canMv", x, y, r); return rCanMv.Move(x, y, r); };
            c.CanMoveTile = (x, y, r) => { Log("canMvTile", x, y, r); return rTile.Move(x, y, r); };
            c.IsWall = (x, y, f) => { Log("isW", x, y, f); if (rIsW.Kind == "none") return false; if (rIsW.Kind == "all") return true; if (rIsW.Kind == "xge") return x >= rIsW.V; throw new InvalidOperationException("isW rule"); };
            c.HasLos = (a, b, cc, d) => { Log("hasLOS", a, b, cc, d); return rLos; };
            c.WallStuck = (x, y) => { Log("wallStuck", x, y); if (rWall.Kind == "none") return false; if (rWall.Kind == "all") return true; if (rWall.Kind == "disc") { double dx = x - rWall.Cx, dy = y - rWall.Cy; return dx * dx + dy * dy < rWall.Rad * rWall.Rad; } throw new InvalidOperationException("wallStuck rule"); };
            c.FlowMove = (e, s, mul) => { Log("ffMove", e, s, mul); e.x += s * mul; e.y += s * mul * 0.5; };
            c.PushOutWall = e => { Log("pushOutWall", e); e.x += 1.5; e.y -= 0.5; };
            c.PushOutsideBonfire = (e, bf, clr) => { Log("pushOutsideBonfire", e, bf, clr); e.x += 0.25; e.y += 0.125; };
            c.BonfireClearance = e => { Log("bonfireClearance", e); return e.r * 1.5 + 2; };
            c.HurtEnemy = (e, dmg) => { Log("hurtE", e, dmg); e.hp = Math.Max(0, e.hp - dmg); };
            c.CancelProjCharge = e => Log("cancelProjCharge", e);
            c.RollDrop = e => Log("rollDrop", e); c.AddExp = n => Log("addExp", n); c.RegKill = e => Log("regKill", e);
            c.BossReviveGrandVfx = (e, r) => Log("bossReviveGrandVFX", e, r);
            c.UpdateE = (e, s) => Log("updateE", e, s);
            c.Translate = s => { Log("T", s); return s; };
            c.AddText = (x, y, s, col, life) => Log("addTxt", x, y, s, col, life);
            c.AddParts = (x, y, col, n) => Log("addParts", x, y, col, n);
            c.Block = () => Log("sfxBlock"); c.Shake = n => Log("shake", n);
            c.PlaySample = (n, v, r) => Log("playSample", n, v, r);
            c.RandomRate = (a, b) => { Log("r", a, b); return a + b * 0.5; };

            string error = null; bool early = false; double dOut = 0;
            try
            {
                if (kind == "U1") early = EnemyTick.UpdateHead(c, ens[0], sp, out dOut);
                else
                {
                    var f = EnemyTick.BeginFrame(c, sp);
                    for (int i = 0; i < ens.Count; i++) if (EnemyTick.Step(c, f, ens, i, sp)) break;
                }
            }
            catch (Exception ex) { error = ex.GetType().Name + ": " + ex.Message; }
            Check(error == null, "no exception" + (error == null ? "" : " (" + error + ")"));
            if (error != null) continue;
            if (kind == "U1")
            {
                var tail = exp.GetProperty("tail");
                if (tail.ValueKind == JsonValueKind.Null) { earlyCount++; Check(early, "web returned early, C# did not"); }
                else { Check(!early, "web ran through the head, C# returned early"); Check(Same(dOut, tail.GetProperty("d").GetDouble()), "d C# " + dOut.ToString("R") + " vs web " + tail.GetProperty("d").GetDouble().ToString("R")); }
            }
            for (int i = 0; i < ens.Count; i++) Cmp(ens[i], finals[i].RootElement, "enemy" + i);
            var wx = exp.GetProperty("world");
            Check(Same(c.Kills, wx.GetProperty("kills").GetDouble()), "G.kills");
            if (wx.TryGetProperty("stageKills", out var sk)) Check(c.StageKills.HasValue && Same(c.StageKills.Value, sk.GetDouble()), "G._stageKills"); else Check(!c.StageKills.HasValue, "G._stageKills undefined");
            if (wx.TryGetProperty("eTierFrame", out var tf)) Check(c.EnemyTierFrame.HasValue && Same(c.EnemyTierFrame.Value, tf.GetDouble()), "G._eTierFrame"); else Check(!c.EnemyTierFrame.HasValue, "G._eTierFrame undefined");
            if (wx.TryGetProperty("bonfireT", out var bt)) Check(c.Bonfire != null && Same(c.Bonfire.t, bt.GetDouble()), "G._bonfire.t"); else Check(c.Bonfire == null, "G._bonfire undefined");
            Check(c.MoveSfxPlaying == wx.GetProperty("mSfx").GetInt32(), "_mSfxPlaying C# " + c.MoveSfxPlaying + " vs web " + wx.GetProperty("mSfx").GetInt32());
            Check(used == exp.GetProperty("consumed").GetInt32(), "Random() calls C# " + used + " vs web " + exp.GetProperty("consumed").GetInt32());
            Check(clockUsed == exp.GetProperty("clockUsed").GetInt32(), "performance.now() calls C# " + clockUsed + " vs web " + exp.GetProperty("clockUsed").GetInt32());
            CmpLog(log, exp.GetProperty("log"));
            foreach (var d in finals) d.Dispose();
        }
        currentCase = "summary";
        var s = root.GetProperty("summary");
        Check(caseCount == s.GetProperty("cases").GetInt32(), "case count");
        Check(earlyCount == s.GetProperty("u1Early").GetInt32(), "early-return count");
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_function_oracle_not_Unity_runtime", passed = failures == 0, failures, total, cases = caseCount, earlyReturns = earlyCount,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32(), head = root.GetProperty("source").GetProperty("head").GetString() },
            note = "every case compares all enemy fields after the call (bit-equal doubles), changed globals, the ordered injected-call list with arguments, Math.random and performance.now counts and the U1 early-return flag / local d; failing items listed (first 80), passing ones sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        Console.WriteLine("ENEMY_TICK_RESULT " + total + " checks / " + failures + " failures (" + caseCount + " cases)");
        return failures == 0 ? 0 : 2;
    }
    static int CountProps(JsonElement e) { int n = 0; foreach (var _ in e.EnumerateObject()) n++; return n; }
}
