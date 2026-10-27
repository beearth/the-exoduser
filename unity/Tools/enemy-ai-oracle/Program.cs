using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// C01-AI enemy AI oracle: replays the scenarios of oracle.json (export.cjs ran the ORIGINAL updateE of game.html tick by tick in a Node VM) through
// EnemyTick.UpdateHead + EnemyAi.UpdateBody and compares, per case: the sampled enemy snapshots (every 5th tick + the last), the ordered per-tick list of
// injected calls (hurtP, shots, projectiles, zones, mkEn, text, particles, sfx, teleport, parry), the player side effects, the creation count and the
// Math.random() draws consumed. Standalone .NET check, not a Unity runtime verdict.
class EnemyAiProgram
{
    static int failures, total; static readonly List<object> rows = new List<object>(); static string currentCase = "";
    static void Check(bool pass, string name)
    {
        total++;
        if (pass) { if (total % 50000 == 1) rows.Add(new { name = currentCase + " | " + name, passed = true }); }
        else { failures++; if (failures <= 400) rows.Add(new { name = currentCase + " | " + name, passed = false }); }
    }
    static bool Same(double a, double b) { if (a == 0 && b == 0) return true; return BitConverter.DoubleToInt64Bits(a) == BitConverter.DoubleToInt64Bits(b); }

    static int Imul(int a, int b) { return unchecked(a * b); }
    static Func<double> Mulberry(int a)
    {
        return () => {
            a = unchecked(a + 0x6D2B79F5);
            int t = Imul(a ^ (int)((uint)a >> 15), 1 | a);
            t = unchecked(t + Imul(t ^ (int)((uint)t >> 7), 61 | t)) ^ t;
            return (double)(uint)(t ^ (int)((uint)t >> 14)) / 4294967296.0;
        };
    }

    // ---- JSON -> C# (field names of the web object) ----
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
        if (v.ValueKind == JsonValueKind.Null) return null;
        if (u == typeof(double)) return v.GetDouble();
        if (u == typeof(bool)) return v.GetBoolean();
        if (u == typeof(string)) return v.GetString();
        if (u.IsGenericType && u.GetGenericTypeDefinition() == typeof(List<>))
        {
            var et = u.GetGenericArguments()[0]; var list = (IList)Activator.CreateInstance(u);
            foreach (var x in v.EnumerateArray()) list.Add(Conv(et, x, name + "[]"));
            return list;
        }
        throw new InvalidOperationException("unsupported field type " + t + " for " + name);
    }

    static object Get(EnemySpawn e, string key)
    {
        if (key == "kb.x") return e.kb.x; if (key == "kb.y") return e.kb.y;
        if (key.StartsWith("modT.")) { var mf = typeof(EnemyModT).GetField(key.Substring(5), BindingFlags.Public | BindingFlags.Instance); if (mf == null) throw new InvalidOperationException("C# EnemyModT has no field " + key); return mf.GetValue(e.modT); }
        var f = typeof(EnemySpawn).GetField(key, BindingFlags.Public | BindingFlags.Instance);
        if (f == null) throw new InvalidOperationException("C# EnemySpawn has no field " + key);
        return f.GetValue(e);
    }

    // ---- the recording host (same semantics as prelude.js) ----
    sealed class Host : IEnemyAiHost
    {
        public Func<double> Random; public List<object[]> Log = new List<object[]>(); public List<EnemySpawn> Ens = new List<EnemySpawn>(), Dead = new List<EnemySpawn>();
        public double Px = 1000, Py = 1000, Pr = 10, PFace, Piframes, PkbX, PkbY, Pfreeze, Pst2, ArmEl; public string Ps = "idle"; public bool Pwin; public int Si; public bool P_st2Set;
        EnemySpawnContext Ctx() { return new EnemySpawnContext { PlayerLevel = 100, DifficultyIndex = 5, StageDiffOffset = 0, Stage = Si, DemoMode = false, DemoLastStage = 0, CanMove = (x, y, r) => true, Random = Random }; }
        public EnemySpawn Make(int etype, double? el, double? room) { return EnemyFactory.Create(Ctx(), 1000, 1000, Si, etype, false, el, room); }
        void L(params object[] a) { Log.Add(a); }
        int Idx(EnemySpawn e) { return Ens.IndexOf(e); }
        public double Rand() { return Random(); }
        public double PX { get { return Px; } } public double PY { get { return Py; } } public double PRadius { get { return Pr; } } public double PFacing { get { return PFace; } } public double PIframes { get { return Piframes; } }
        public string PState { get { return Ps; } } public int Stage { get { return Si; } }
        public bool CanMove(double x, double y, double r) { return true; } public bool IsWall(double x, double y) { return false; }
        public void HurtPlayer(int damage, bool magic) { L("hurtP", (double)damage, magic); }
        public void KnockPlayer(double kx, double ky) { PkbX += kx; PkbY += ky; }
        public void ScaleKnock(double m) { PkbX *= m; PkbY *= m; }
        public void FreezeSlow(double frames) { Pfreeze = Math.Max(Pfreeze, frames); }
        public void StaggerPlayer(double frames) { Ps = "stagger"; Pst2 = frames; P_st2Set = true; }
        public double ElMul(double? a) { return EnemyHurt.ElMul(a, ArmEl); }   // elMul(e.el, ar().el) with the scenario's armor element
        public bool IsParryWindow() { return Pwin; }
        public void Parry(EnemySpawn e, double atk) { L("txt", "⚡패링!"); L("doParry", atk, e.x, e.y); L("poiseHit", new Ref { E = Idx(e) }, 20.0); }
        public void Text(double x, double y, string text, string color, int life) { L("txt", text); }
        public void Parts(double x, double y, string color, int count) { L("parts", (double)count); }
        public void Shake(double n) { L("shake", n); }
        public void Sfx(string name) { L("sfx", name); }
        public IList<EnemySpawn> Query(double x, double y, double r)
        {
            var list = new List<EnemySpawn>(); int cx0 = (int)((x - r) / 128), cx1 = (int)((x + r) / 128), cy0 = (int)((y - r) / 128), cy1 = (int)((y + r) / 128);
            foreach (var o in Ens) { if (!o.alive) continue; int cx = (int)(o.x / 128), cy = (int)(o.y / 128); if (cx >= cx0 && cx <= cx1 && cy >= cy0 && cy <= cy1) list.Add(o); }
            return list;
        }
        public int EnemyCount { get { return Ens.Count; } }
        public IList<EnemySpawn> DeadPool { get { return Dead; } }
        public EnemySpawn Create(double x, double y, int etype, double? el)
        {
            var o = EnemyFactory.Create(Ctx(), x, y, Si, etype, false, el, 2);
            L("mk", x, y, (double)Si, (double)etype, el.HasValue ? (object)el.Value : null, o != null ? (object)o.hp : null, o != null ? (object)o.atk : null);
            return o;
        }
        public void AddEnemy(EnemySpawn e) { Ens.Add(e); }
        public void ReviveCorpse(EnemySpawn c)
        {
            c.alive = true; c.hp = Math.Truncate(c.mhp * .5); c.eShield = 0; c.eShieldMax = 0; c.s = "recover"; c.st2 = 60; c.stunned = 0; c.poise = c.maxPoise; c.reviveIframes = 0;
        }
        public void Shot(EnemySpawn e, ProjSpec s) { L("shot", s.X, s.Y, s.Vx, s.Vy, s.Dmg, (double)s.El, s.Life, s.Ml, s.Col, s.Sz, s.RedBean, s.Homing, s.FireMagic, s.Commit, s.Web); }
        public void Proj(EnemySpawn e, ProjSpec s) { L("proj", s.X, s.Y, s.Vx, s.Vy, s.Dmg, (double)s.El, s.Life, s.Ml, s.Col, s.Sz, s.RedBean, s.Homing, s.FireMagic, s.BlackBean, s.Commit); }
        public void Teleported(EnemySpawn e, double x, double y) { L("tp", x, y); }
        public void Zone(EnemySpawn e, string kind, double x, double y, double life, double r, double dmg, double el) { L("zone", x, y, life, r, dmg, kind, el); }
        public double DotDur() { return 1; } public double DotDmg() { return 1; }
        public void HurtDot(EnemySpawn e, int damage, bool maliceHunt, double? atkEl) { L("hurtE", new Ref { E = Idx(e) }, (double)damage, null, true, true, true, maliceHunt, atkEl.HasValue ? (object)atkEl.Value : null); }
    }
    sealed class Ref { public int E; }

    static string Fmt(object o, JsonElement js, bool jsSide)
    {
        if (jsSide)
        {
            switch (js.ValueKind)
            {
                case JsonValueKind.Null: return "null";
                case JsonValueKind.True: return "true"; case JsonValueKind.False: return "false";
                case JsonValueKind.Number: { double d = js.GetDouble(); if (d == 0) d = 0; return d.ToString("R"); }
                case JsonValueKind.String: return "\"" + js.GetString() + "\"";
                case JsonValueKind.Object: foreach (var p in js.EnumerateObject()) return "{" + p.Name + ":" + p.Value.GetDouble() + "}"; return "{}";
            }
            return "?";
        }
        if (o == null) return "null";
        if (o is bool b) return b ? "true" : "false";
        if (o is double d2) { if (d2 == 0) d2 = 0; return d2.ToString("R"); }
        if (o is string s) return "\"" + s + "\"";
        if (o is Ref r) return "{e:" + r.E + "}";
        return o.ToString();
    }

    static void CmpValue(object cs, JsonElement js, string path)
    {
        switch (js.ValueKind)
        {
            case JsonValueKind.Null:
                Check(cs == null || (cs is double z && z == 0) || (cs is bool bb && !bb) || (cs is string ss && ss == ""), path + " web undefined, C# " + (cs ?? "null")); return;
            case JsonValueKind.Number:
                if (cs is bool || cs is string || cs == null) { Check(false, path + " web " + js.GetDouble().ToString("R") + " vs C# " + (cs ?? "null")); return; }
                Check(Same(Convert.ToDouble(cs), js.GetDouble()), path + " C# " + Convert.ToDouble(cs).ToString("R") + " vs web " + js.GetDouble().ToString("R")); return;
            case JsonValueKind.True: case JsonValueKind.False:
                Check(cs is bool b && b == (js.ValueKind == JsonValueKind.True), path + " C# " + (cs ?? "null") + " vs web " + js.ValueKind); return;
            case JsonValueKind.String: Check(cs is string s && s == js.GetString(), path + " C# " + (cs ?? "null") + " vs web " + js.GetString()); return;
        }
        Check(false, path + " unsupported json kind " + js.ValueKind);
    }

    static int Main(string[] args)
    {
        var doc = JsonDocument.Parse(File.ReadAllText(args[1])); var root = doc.RootElement;
        var snapKeys = new List<string>(); foreach (var k in root.GetProperty("snap").EnumerateArray()) snapKeys.Add(k.GetString());
        int cases = 0, ticksRun = 0;
        foreach (var rc in root.GetProperty("cases").EnumerateArray())
        {
            var c = rc.GetProperty("case"); var o = rc.GetProperty("out"); currentCase = c.GetProperty("name").GetString(); cases++;
            int etype = (int)c.GetProperty("etype").GetDouble(), si = (int)c.GetProperty("si").GetDouble(), seed = (int)c.GetProperty("seed").GetDouble(), ticks = (int)c.GetProperty("ticks").GetDouble();
            double sp = c.GetProperty("sp").GetDouble(), ang = c.GetProperty("ang").GetDouble(), dist = c.GetProperty("dist").GetDouble();
            var rnd = Mulberry(seed); int draws = 0; bool first = true;
            var host = new Host { Si = si, PFace = c.GetProperty("pfacing").GetDouble(), Piframes = c.GetProperty("piframes").GetDouble(), Ps = c.GetProperty("ps").GetString(), Pwin = c.GetProperty("pwin").GetBoolean(), ArmEl = c.TryGetProperty("armEl", out var armEl) ? armEl.GetDouble() : 0 };
            host.Random = () => { draws++; if (first) { first = false; return 0.9999; } return rnd(); };
            // note: the web sequence is [0.9999, r0, r1 ...]; the first draw (mkEn's elite roll) is 0.9999, the rest the mulberry stream
            var e = host.Make(etype, 1, 2);
            e.x = 1000 + JsMath.Cos(ang) * dist; e.y = 1000 + JsMath.Sin(ang) * dist; Fill(e, c.GetProperty("over")); e._aAtkM = 1; e._aSpdM = 1; host.Ens.Add(e);
            foreach (var a in c.GetProperty("allies").EnumerateArray()) { var al = host.Make((int)a.GetProperty("etype").GetDouble(), 1, 2); Fill(al, a.GetProperty("over")); al._aAtkM = 1; al._aSpdM = 1; host.Ens.Add(al); }
            foreach (var a in c.GetProperty("corpses").EnumerateArray()) { var co = host.Make((int)a.GetProperty("etype").GetDouble(), 1, 2); Fill(co, a.GetProperty("over")); co.alive = false; co.hp = 0; host.Dead.Add(co); host.Ens.Add(co); }
            var ctx = new EnemyTickContext {
                PlayerX = 1000, PlayerY = 1000, CamX = 1000, CamY = 1000, Random = host.Random, Now = () => 0, Map = new int[1][] { new int[1] }, MapWidth = 1, MapHeight = 1, Stage = si, DemoLastStage = 0, DemoMode = false,
                CanMove = (x, y, r) => true, CanMoveTile = (x, y, r) => true, IsWall = (x, y, f) => false, HasLos = (a, b, cc, d) => false, WallStuck = (x, y) => false,
                PushOutWall = w => { }, PushOutsideBonfire = (w, bf, cl) => { }, BonfireClearance = w => w.r * 1.5 + 2,
                FlowMove = (w, s, m) => { w.x += s * m; w.y += s * m * 0.5; }, HurtEnemy = (w, d) => { }, CancelProjCharge = w => { w._projChargeT = 0; w._projChargeCol = null; w._projChargeBean = null; w._projChargeParryClass = null; },
                RollDrop = w => { }, AddExp = n => { }, RegKill = w => { }, BossReviveGrandVfx = (w, r) => { }, UpdateE = (w, s) => { }, Translate = s => s,
                AddText = (x, y, t, col, l) => host.Text(x, y, t, col, (int)l), AddParts = (x, y, col, n) => host.Parts(x, y, col, (int)n), Block = () => host.Sfx("block"), Shake = n => host.Shake(n),
                PlaySample = (n, v, r) => { }, RandomRate = (a, b) => a + b * 0.5
            };
            host.Log.Clear();   // the creation logs of the setup are part of the web preamble, not of a tick
            var tickLogs = new List<List<object[]>>(); var snaps = o.GetProperty("snaps"); int snapIdx = 0; var wlogs = o.GetProperty("logs");
            for (int t = 0; t < ticks; t++)
            {
                host.Log = new List<object[]>(); int cnt = host.Ens.Count; foreach (var q in host.Ens) if (q.alive) { q._aAtkM = 1; q._aSpdM = 1; }
                for (int i = 0; i < cnt; i++)
                {
                    var w = host.Ens[i]; if (!w.alive) continue;
                    double d; if (EnemyTick.UpdateHead(ctx, w, sp, out d)) continue;
                    EnemyAi.UpdateBody(host, w, sp, d);
                }
                if (Environment.GetEnvironmentVariable("AI_TRACE") == currentCase) { var tj = o.GetProperty("tr")[t]; Console.WriteLine("TRACE " + t + " C# " + e.x.ToString("R") + " " + e.y.ToString("R") + " " + e.facing.ToString("R") + " " + e.s + " | web " + tj[0].GetDouble().ToString("R") + " " + tj[1].GetDouble().ToString("R") + " " + tj[2].GetDouble().ToString("R") + " " + tj[3].GetString()); }
                // per-tick log compare
                var wl = wlogs[t]; Check(host.Log.Count == wl.GetArrayLength(), "tick " + t + " log count C# " + host.Log.Count + " vs web " + wl.GetArrayLength() + " [" + Dump(host.Log) + " | " + wl.ToString() + "]");
                for (int li = 0; li < Math.Min(host.Log.Count, wl.GetArrayLength()); li++)
                {
                    var cl = host.Log[li]; var wj = wl[li]; var sb1 = new StringBuilder(); var sb2 = new StringBuilder();
                    for (int k = 0; k < cl.Length; k++) sb1.Append(Fmt(cl[k], default(JsonElement), false)).Append(',');
                    for (int k = 0; k < wj.GetArrayLength(); k++) sb2.Append(Fmt(null, wj[k], true)).Append(',');
                    Check(sb1.ToString() == sb2.ToString(), "tick " + t + " call " + li + " C# " + sb1 + " vs web " + sb2);
                }
                if (t % 5 == 4 || t == ticks - 1)
                {
                    var sn = snaps[snapIdx++];
                    Check((int)sn.GetProperty("t").GetDouble() == t, "snap tick");
                    foreach (var key in snapKeys) CmpValue(Get(e, key), sn.GetProperty(key), "t" + t + "." + key);
                    CmpValue(e.kb.x, sn.GetProperty("kb.x"), "t" + t + ".kb.x"); CmpValue(e.kb.y, sn.GetProperty("kb.y"), "t" + t + ".kb.y");
                    Check((int)sn.GetProperty("n").GetDouble() == host.Ens.Count, "t" + t + " ens count C# " + host.Ens.Count + " vs web " + sn.GetProperty("n").GetDouble());
                }
                ticksRun++;
            }
            var pw = o.GetProperty("P");
            CmpValue(host.PkbX, pw.GetProperty("kbx"), "P.kb.x"); CmpValue(host.PkbY, pw.GetProperty("kby"), "P.kb.y"); CmpValue(host.Pfreeze, pw.GetProperty("fz"), "P._freezeSlow");
            CmpValue(host.Ps, pw.GetProperty("s"), "P.s"); if (host.P_st2Set) CmpValue(host.Pst2, pw.GetProperty("st2"), "P.st2");
            Check((int)o.GetProperty("rand").GetDouble() == draws, "random draws C# " + draws + " vs web " + o.GetProperty("rand").GetDouble());
        }
        var summary = new { cases, ticksRun, checks = total, failures, rows };
        File.WriteAllText(args[0], JsonSerializer.Serialize(summary));
        Console.WriteLine("ENEMY_AI_RESULT cases " + cases + " ticks " + ticksRun + " checks " + total + " failures " + failures);
        foreach (var r in rows) { var s = JsonSerializer.Serialize(r); if (s.Contains("\"passed\":false")) Console.WriteLine(s.Length > 400 ? s.Substring(0, 400) : s); }
        return failures == 0 ? 0 : 1;
    }

    static string Dump(List<object[]> log)
    {
        var sb = new StringBuilder();
        foreach (var l in log) { sb.Append('['); foreach (var x in l) sb.Append(Fmt(x, default(JsonElement), false)).Append(','); sb.Append("] "); }
        return sb.ToString();
    }
}
