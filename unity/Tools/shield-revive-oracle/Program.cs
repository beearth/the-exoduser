// B08 oracle check: compares Runtime/Core/EnergyShield.cs and ReviveRules.cs with oracle.json (produced by export.cjs from the ORIGINAL game.html code).
// usage: ShieldReviveTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Globalization;
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 6) failures.Add(section + ": " + detail); }
    }
    static bool Near(double a, double b, double tol = 1e-4) { return Math.Abs(a - b) <= Math.Max(tol, 1e-6 * Math.Abs(b)); }
    static double N(JsonElement e, string k, double d = double.NaN) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : d; }
    static bool Has(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind != JsonValueKind.Null; }
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; per[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static string Num(double v) { return v.ToString("R", CultureInfo.InvariantCulture); }

    // same LCG as export.cjs lcg()
    sealed class Lcg { uint s; public int N; public Lcg(double seed) { s = (uint)(long)seed; } public double Next() { s = unchecked(s * 1664525u + 1013904223u); N++; return s / 4294967296.0; } }

    static EnemyState MakeEnemy(JsonElement j)
    {
        var e = new EnemyState {
            X = (float)N(j, "x", 0), Y = (float)N(j, "y", 0), Radius = (float)N(j, "r", 0), Hp = (int)N(j, "hp", 0), MaxHp = (int)N(j, "mhp", 0), Attack = (int)N(j, "atk", 0),
            BaseAttack = (int)N(j, "baseAtk", 0), DruidBaseAttack = (int)N(j, "_druidBaseAtk", 0), Speed = (float)N(j, "speed", 0), MaxPoise = (float)N(j, "maxPoise", 0), Poise = (float)N(j, "poise", 0),
            BossPatCd = N(j, "bossPatCd", 0), IsBoss = B(j, "ib"), Etype = (int)N(j, "etype", 0), Elite = (int)N(j, "elite", 0), Level = (int)N(j, "lv", 0), Deaths = N(j, "deaths", 0),
            RevPts = N(j, "_revPts", 0), MaxRevPts = N(j, "_maxRevPts", 0), Revived = B(j, "_revived"), IsGhoul = B(j, "_isGhoul"), BossRevJudged = B(j, "_bossRevJudged"), OrigR = N(j, "_origR", 0),
            DgRevived = B(j, "_dgRevived"), FmKind = Has(j, "_fmKind"), Alive = B(j, "alive"), State = S(j, "s") ?? "idle", StateTicks = (float)N(j, "st2", 0), Stunned = (float)N(j, "stunned", 0),
            Shield = (float)N(j, "eShield", 0), MaxShield = (float)N(j, "eShieldMax", 0), ReviveIframes = N(j, "reviveIframes", 0), ReviveTimer = N(j, "_reviveTimer", 0), ReviveX = N(j, "_reviveX", 0), ReviveY = N(j, "_reviveY", 0),
            ReviveAsGhoul = B(j, "_reviveAsGhoul"), BossRevived = B(j, "_bossRevived"), BossRevChance = N(j, "_bossRevChance", 0), BossRevRoll = N(j, "_bossRevRoll", 1), SinkDruid = B(j, "_sinkDruid"), Col = S(j, "col") };
        return e;
    }

    // compares every snapshot field; JS undefined/null means "untouched default"
    static bool EnemyMatches(EnemyState e, JsonElement s, out string why)
    {
        string acc = "";
        Func<string, double, bool> d = (k, v) => { double want = N(s, k, double.NaN); if (double.IsNaN(want)) return true; if (!Near(v, want)) { acc += k + " C#=" + Num(v) + " web=" + Num(want) + "; "; return false; } return true; };
        Func<string, bool, bool> b = (k, v) => { if (!s.TryGetProperty(k, out var x) || x.ValueKind == JsonValueKind.Null) return true; bool want = x.ValueKind == JsonValueKind.True; if (v != want) { acc += k + " C#=" + v + " web=" + want + "; "; return false; } return true; };
        bool ok = true;
        ok &= d("hp", e.Hp); ok &= d("mhp", e.MaxHp); ok &= b("alive", e.Alive); ok &= d("st2", e.StateTicks); ok &= d("stunned", e.Stunned); ok &= d("deaths", e.Deaths);
        ok &= d("_revPts", e.RevPts); ok &= d("_maxRevPts", e.MaxRevPts); ok &= b("_revived", e.Revived); ok &= d("_reviveTimer", e.ReviveTimer); ok &= d("_reviveX", e.ReviveX); ok &= d("_reviveY", e.ReviveY);
        ok &= b("_reviveAsGhoul", e.ReviveAsGhoul); ok &= b("_bossRevJudged", e.BossRevJudged); ok &= b("_bossRevived", e.BossRevived); ok &= d("_bossRevChance", e.BossRevChance); ok &= d("_bossRevRoll", e.BossRevRoll);
        ok &= b("_dgRevived", e.DgRevived); ok &= d("_bossPhase", e.BossPhase); ok &= d("maxPoise", e.MaxPoise); ok &= d("poise", e.Poise); ok &= d("reviveIframes", e.ReviveIframes);
        ok &= d("atk", e.Attack); ok &= d("speed", e.Speed); ok &= d("bossPatCd", e.BossPatCd); ok &= d("_origR", e.OrigR); ok &= d("r", e.Radius); ok &= d("x", e.X); ok &= d("y", e.Y);
        ok &= d("_spawnT", e.SpawnTicks); ok &= d("_bossReviveVFXPending", e.BossReviveVfxPending); ok &= d("eShield", e.Shield); ok &= d("eShieldMax", e.MaxShield);
        string st = S(s, "s"); if (st != null && st != e.State) { acc += "s C#=" + e.State + " web=" + st + "; "; ok = false; }
        why = acc; return ok;
    }

    static string TextsDiff(List<ReviveText> mine, JsonElement web)
    {
        var w = new List<JsonElement>(); foreach (var t in web.EnumerateArray()) w.Add(t);
        if (w.Count != mine.Count) return "text count C#=" + mine.Count + " web=" + w.Count;
        for (int i = 0; i < w.Count; i++)
        {
            var t = w[i];
            if (!Near(mine[i].X, t[0].GetDouble()) || !Near(mine[i].Y, t[1].GetDouble()) || mine[i].Ko != t[2].GetString() || mine[i].Color != t[3].GetString() || mine[i].Life != (int)t[4].GetDouble())
                return "text " + i + " C#=(" + Num(mine[i].X) + "," + Num(mine[i].Y) + "," + mine[i].Ko + "," + mine[i].Color + "," + mine[i].Life + ") web=" + t.GetRawText();
        }
        return null;
    }

    static ReviveContext Ctx(JsonElement c, Lcg rng, List<string> calls)
    {
        var canQ = new List<bool>(); if (c.TryGetProperty("canQ", out var cq)) foreach (var q in cq.EnumerateArray()) canQ.Add(q.GetBoolean()); if (canQ.Count == 0) canQ.Add(true);
        int cm = 0; bool hasSafe = Has(c, "safe"); double sx = 0, sy = 0; if (hasSafe) { sx = c.GetProperty("safe")[0].GetDouble(); sy = c.GetProperty("safe")[1].GetDouble(); }
        double zoneLv = Has(c, "zone") ? N(c, "zone") : double.NaN;
        var killed = new List<int>(); if (c.TryGetProperty("killed", out var kb)) foreach (var k in kb.EnumerateArray()) killed.Add((int)k.GetDouble());
        return new ReviveContext {
            Stage = (int)N(c, "stage"), Hell = (int)N(c, "hell", 0), DemoMode = B(c, "demo"), DemoLastStage = (int)N(c, "lastStage"), AntiRevive = N(c, "anti", 0),
            HolyPrison = double.IsNaN(zoneLv) ? (Func<double, double, double>)null : (x, y) => .15 + (zoneLv - 1) * (.15 / 9),
            PlayerHp = B(c, "phpFull") ? 100 : 50, PlayerMaxHp = 100, PlayerX = N(c, "px", 0), PlayerY = N(c, "py", 0), PlayerFacing = N(c, "pf", 0), PlayerIframes = N(c, "piframes", 0), PlayerState = S(c, "ps") ?? "idle",
            CanMove = (x, y, r) => { bool v = canQ[cm++ % canQ.Count]; calls.Add("canMv"); return v; },
            SafePoint = (x, y, r) => { calls.Add("safePt"); return hasSafe ? new[] { sx, sy } : null; },
            KilledBosses = killed, Rnd = rng.Next };
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        foreach (var c in Cases(root, "enemyShield"))
        {
            var r = EnergyShield.AbsorbEnemy(N(c, "shield"), N(c, "max"), N(c, "dmg"), B(c, "isDot"), B(c, "shieldHit")); var o = c.GetProperty("out");
            bool num = o.GetProperty("numberCalls").GetDouble() > 0;
            bool ok = Near(r.Shield, N(o, "shield"), 1e-9) && Near(r.Damage, N(o, "dmg"), 1e-9) && r.Blocked == B(o, "blocked") && r.ShowNumber == num && (!num || Num(r.Absorbed) == S(o, "number"));
            Check(ok, c.GetRawText() + " -> C# shield=" + Num(r.Shield) + " dmg=" + Num(r.Damage) + " abs=" + Num(r.Absorbed) + " blocked=" + r.Blocked + " show=" + r.ShowNumber);
        }
        foreach (var c in Cases(root, "reviveGate"))
        {
            double ri = N(c, "ri"); bool sw = EnergyShield.SwallowedByReviveIframes(ref ri, B(c, "isDot")); var o = c.GetProperty("out");
            Check(sw == (S(o, "r") == "swallowed") && Near(ri, N(o, "ri"), 1e-9), c.GetRawText() + " -> C# swallowed=" + sw + " ri=" + Num(ri));
        }
        foreach (var c in Cases(root, "playerShield"))
        {
            var r = EnergyShield.AbsorbPlayer(N(c, "shield"), N(c, "ms"), N(c, "regenT"), N(c, "a")); var o = c.GetProperty("out");
            var texts = new List<string>(); foreach (var t in o.GetProperty("texts").EnumerateArray()) texts.Add(t.GetString());
            bool textOk = r.Broke ? texts.Count == 1 && texts[0] == "⚡쉴드 파괴!" : r.FullBlock ? texts.Count == 1 && texts[0] == "❄-" + Num(N(c, "a")) : texts.Count == 0;
            bool ok = Near(r.Shield, N(o, "shield"), 1e-9) && Near(r.RegenT, N(o, "regenT"), 1e-9) && Near(r.Damage, N(o, "a"), 1e-9) && r.FullBlock == B(o, "full") && textOk && Near(r.PreAbsorb, N(c, "a"), 1e-9);
            Check(ok, c.GetRawText() + " -> C# shield=" + Num(r.Shield) + " regen=" + Num(r.RegenT) + " a=" + Num(r.Damage) + " full=" + r.FullBlock + " broke=" + r.Broke);
        }
        foreach (var c in Cases(root, "playerRegen"))
        {
            double sh = N(c, "shield"), rt = N(c, "regenT");
            EnergyShield.PlayerRegen(ref sh, N(c, "ms"), ref rt, N(c, "si"), (int)N(c, "lv"), N(c, "pm"), N(c, "sp")); var o = c.GetProperty("out");
            Check(Near(sh, N(o, "shield"), 1e-9) && Near(rt, N(o, "regenT"), 1e-9), c.GetRawText() + " -> C# shield=" + Num(sh) + " regen=" + Num(rt));
        }
        foreach (var c in Cases(root, "death"))
        {
            var e = MakeEnemy(c.GetProperty("e")); var rng = new Lcg(N(c, "seed")); var calls = new List<string>(); var ctx = Ctx(c, rng, calls);
            var res = ReviveRules.OnZeroHp(ctx, e); var o = c.GetProperty("out");
            string why; bool ok = res.Revived == (S(o, "ret") == "return");
            ok &= EnemyMatches(e, o.GetProperty("e"), out why);
            string td = TextsDiff(res.Texts, o.GetProperty("texts"));
            if (td != null) { why += td + "; "; ok = false; }
            // hurtP(shockwave): web calls it once with the boss's enhanced atk
            var hurt = o.GetProperty("hurt"); int hc = hurt.GetArrayLength();
            bool sw = res.Boss != null && res.Boss.ShockwaveHitsPlayer;
            if (hc != (sw ? 1 : 0) || (sw && !Near(res.Boss.ShockwaveDamage, hurt[0][0].GetDouble()))) { why += "shockwave; "; ok = false; }
            if ((res.Boss != null ? res.Boss.BurstCount : 0) != (int)N(o, "burst")) { why += "burst C#=" + (res.Boss != null ? res.Boss.BurstCount : 0) + " web=" + N(o, "burst") + "; "; ok = false; }
            var comp = o.GetProperty("companion");
            if (comp.ValueKind == JsonValueKind.Null) { if (res.Boss != null && res.Boss.CompanionEtype >= 0) { why += "companion unexpected; "; ok = false; } }
            else if (res.Boss == null || res.Boss.CompanionEtype != (int)comp[3].GetDouble() || !Near(res.Boss.CompanionX, comp[0].GetDouble()) || !Near(res.Boss.CompanionY, comp[1].GetDouble())) { why += "companion mismatch; "; ok = false; }
            if (rng.N != (int)N(o, "draws")) { why += "draws C#=" + rng.N + " web=" + N(o, "draws") + "; "; ok = false; }
            var wc = o.GetProperty("calls"); var wlist = new List<string>(); foreach (var q in wc.EnumerateArray()) wlist.Add(q[0].GetString());
            if (string.Join(",", wlist) != string.Join(",", calls)) { why += "calls C#=" + string.Join(",", calls) + " web=" + string.Join(",", wlist) + "; "; ok = false; }
            if (ReviveRules.SinkOnDeath(ctx, e) != B(o, "sink")) { why += "sink; "; ok = false; }
            Check(ok, "id=" + N(c, "id") + " " + why + " in=" + c.GetProperty("e").GetRawText());
        }
        foreach (var c in Cases(root, "corpse"))
        {
            var e = MakeEnemy(c.GetProperty("e")); var rng = new Lcg(N(c, "seed")); var calls = new List<string>(); var ctx = Ctx(c, rng, calls);
            var texts = new List<ReviveText>(); EnemyState ghoul = null; int steps = 0; var o = c.GetProperty("out");
            while (e.ReviveTimer > 0 && steps < 8) { var r = ReviveRules.TickCorpse(ctx, e, N(c, "sp"), 777); texts.AddRange(r.Texts); if (r.Ghoul != null) ghoul = r.Ghoul; steps++; }
            string why; bool ok = steps == (int)N(o, "steps") && EnemyMatches(e, o.GetProperty("e"), out why);
            why = ""; EnemyMatches(e, o.GetProperty("e"), out why);
            string td = TextsDiff(texts, o.GetProperty("texts")); if (td != null) { why += td + "; "; ok = false; }
            if (rng.N != (int)N(o, "draws")) { why += "draws C#=" + rng.N + " web=" + N(o, "draws") + "; "; ok = false; }
            if (e.DruidLastStand != B(o, "druidLast")) { why += "druidLast; "; ok = false; }
            var g = o.GetProperty("ghoul");
            if (g.ValueKind == JsonValueKind.Null) { if (ghoul != null) { why += "ghoul unexpected; "; ok = false; } }
            else if (ghoul == null) { why += "ghoul missing; "; ok = false; }
            else
            {
                bool gk = ghoul.Etype == (int)N(g, "etype") && Near(ghoul.X, N(g, "x")) && Near(ghoul.Y, N(g, "y")) && Near(ghoul.Radius, N(g, "r")) && ghoul.Hp == (int)N(g, "hp") && ghoul.MaxHp == (int)N(g, "mhp")
                    && ghoul.Attack == (int)N(g, "atk") && ghoul.BaseAttack == (int)N(g, "baseAtk") && Near(ghoul.Speed, N(g, "speed")) && Near(ghoul.Poise, N(g, "poise")) && Near(ghoul.MaxPoise, N(g, "maxPoise")) && ghoul.Level == (int)N(g, "lv")
                    && Near(ghoul.StateTicks, N(g, "st2")) && Near(ghoul.Facing, N(g, "facing")) && ghoul.Elite == (int)N(g, "elite") && Near(ghoul.Shield, N(g, "eShield")) && Near(ghoul.MaxShield, N(g, "eShieldMax"))
                    && !ghoul.IsBoss && ghoul.IsGhoul == B(g, "_isGhoul") && ghoul.Revived == B(g, "_revived") && ghoul.ReviveChase == B(g, "_reviveChase") && ghoul.Alerted == B(g, "_alerted") && ghoul.Col == S(g, "col") && ghoul.State == S(g, "s") && ghoul.Alive == B(g, "alive");
                if (!gk) { why += "ghoul fields " + g.GetRawText(); ok = false; }
            }
            Check(ok, "id=" + N(c, "id") + " " + why);
        }
        section = "ghoulType"; per[section] = new int[2];
        foreach (var c in root.GetProperty("sections").GetProperty("ghoulType").EnumerateArray()) Check(ReviveRules.GhoulType(N(c, "r"), (int)N(c, "el")) == (int)N(c, "out"), c.GetRawText());
        {
            section = "ghoulDefs"; per[section] = new int[2];
            foreach (var kv in root.GetProperty("sections").GetProperty("ghoulDefs").EnumerateObject())
            {
                var w = kv.Value; var m = ReviveRules.GhoulDefs[int.Parse(kv.Name)];
                Check(m.Name == S(w, "name") && Near(m.R, N(w, "r")) && Near(m.Spd, N(w, "spd")) && m.Col == S(w, "col") && m.VfxSize == (int)N(w, "vfxSize") && m.PartN == (int)N(w, "partN") && m.PartSpd == (int)N(w, "partSpd") && m.Shake == (int)N(w, "shake"), kv.Name + " " + w.GetRawText());
            }
        }
        foreach (var c in Cases(root, "sink"))
        {
            var e = new EnemyState { IsBoss = B(c, "ib"), FmKind = B(c, "fm"), ReviveTimer = N(c, "timer"), BossRevived = B(c, "revd"), BossRevRoll = N(c, "roll", 1), BossRevChance = N(c, "ch", 0) };
            var ctx = new ReviveContext { Stage = (int)N(c, "stage"), DemoMode = B(c, "demo"), DemoLastStage = (int)N(c, "last") };
            Check(ReviveRules.SinkOnDeath(ctx, e) == B(c, "out"), c.GetRawText());
        }
        foreach (var c in Cases(root, "fall"))
        {
            var rng = new Lcg(N(c, "seed")); double zone = N(c, "zone", 0); double zv = zone > 0 ? 0.10 + ((Math.Round((zone - .1) / .01) + 1) - 1) * 0.01 : 0;
            var inp = new ReviveRules.PlayerFallInput { Level = (int)N(c, "lv"), RevivePow = N(c, "rp"), ReviveCdAffix = N(c, "cd"), ReviveOnceAffix = N(c, "once"), PassiveDemon = (int)N(c, "dm"), PassiveHuman = (int)N(c, "hu"), WeakRevZone = zv, ReviveOnceUsed = B(c, "used"), DemonReviveCd = N(c, "dcd") };
            var o = c.GetProperty("out"); bool onceBranch = inp.ReviveOnceAffix > 0 && !inp.ReviveOnceUsed;
            if (!onceBranch) inp.Roll = rng.Next() * 100;
            var f = ReviveRules.PlayerFall(inp); bool ok;
            string ret = S(o, "ret");
            if (f.ReviveOnce) ok = ret == "once" && rng.N == (int)N(o, "draws");
            else ok = ret == "fall" && Near(f.Chance, N(o, "chance"), 1e-9) && Near(f.CdFrames, N(o, "cd"), 1e-9) && f.CanRevive == B(o, "can") && Near(f.Roll, N(o, "roll"), 1e-9) && rng.N == (int)N(o, "draws");
            if (ok && !f.ReviveOnce && c.TryGetProperty("resolve", out var rs) && rs.ValueKind == JsonValueKind.Object)
            {
                bool succ = ReviveRules.FallenSucceeds(f.CanRevive, f.Roll, f.Chance); bool webSucc = S(rs, "ret") != "dead";
                ok = succ == webSucc;
                if (ok && succ) { var tx = ReviveRules.FallenSuccessTexts(11, 22, f.Chance); var wt = rs.GetProperty("texts"); ok = wt.GetArrayLength() == tx.Count && wt[0].GetString() == tx[0].Ko && wt[1].GetString() == tx[1].Ko; }
            }
            Check(ok, c.GetRawText() + " -> C# once=" + f.ReviveOnce + " chance=" + Num(f.Chance) + " cd=" + Num(f.CdFrames) + " can=" + f.CanRevive + " roll=" + Num(f.Roll));
        }
        var sum = new List<string>();
        foreach (var kv in per) sum.Add("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failures\":" + kv.Value[1] + "}");
        File.WriteAllText(args[0], "{\"checks\":" + checks + ",\"failures\":" + bad + ",\"sections\":{" + string.Join(",", sum) + "},\"first\":" + JsonSerializer.Serialize(failures) + "}");
        Console.WriteLine("checks=" + checks + " failures=" + bad);
        foreach (var f in failures) Console.WriteLine(f);
        return bad > 0 ? 1 : 0;
    }
}
