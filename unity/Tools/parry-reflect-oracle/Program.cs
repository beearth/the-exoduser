// parry-reflect oracle check: compares Runtime/Core/ParryReflect.cs with oracle.json (produced by export.cjs from the ORIGINAL game.html code: the projectile-loop parry branch chain
// 35064-35248, the blue-bean homing block, the friendly-hit lines and the AoE line, each executed as written).
// usage: ParryReflectTests.dll <receipt.json> <oracle.json>   (exit code 1 when a check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core.Combat;

static class P
{
    static int checks, bad;
    static readonly Dictionary<string, int[]> perSection = new Dictionary<string, int[]>();
    static readonly List<string> firstFailures = new List<string>();
    static string section = "";

    static void Check(bool ok, string detail)
    {
        checks++; var c = perSection[section]; c[0]++;
        if (!ok) { bad++; c[1]++; if (c[1] <= 5) firstFailures.Add(section + ": " + detail); }
    }
    static bool Eq(double a, double b) { if (double.IsNaN(a) && double.IsNaN(b)) return true; if (double.IsNaN(a) || double.IsNaN(b)) return false; return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Abs(b)); }
    static double N(JsonElement e, string k) { if (!e.TryGetProperty(k, out var v) || v.ValueKind == JsonValueKind.Null) return double.NaN; if (v.ValueKind == JsonValueKind.True) return 1; if (v.ValueKind == JsonValueKind.False) return 0; return v.GetDouble(); }
    static double N0(JsonElement e, string k) { double v = N(e, k); return double.IsNaN(v) ? 0 : v; }
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }
    static bool Has(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind != JsonValueKind.Null; }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; if (!perSection.ContainsKey(name)) perSection[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static void Num(string name, double actual, JsonElement o, string key, string ctx) { double want = N(o, key); Check(Eq(actual, want), ctx + " " + name + " C#=" + actual + " web=" + (double.IsNaN(want) ? "null" : want.ToString())); }
    static void Bool(string name, bool actual, JsonElement o, string key, string ctx) { Check(actual == B(o, key), ctx + " " + name + " C#=" + actual + " web=" + B(o, key)); }

    static ReflectProjectile Proj(JsonElement p)
    {
        return new ReflectProjectile { X = N0(p, "x"), Y = N0(p, "y"), Vx = N0(p, "vx"), Vy = N0(p, "vy"), Dmg = N0(p, "dmg"), Life = N0(p, "life"), Ml = N0(p, "ml"), El = N0(p, "el"), Sz = N0(p, "sz"), R = N0(p, "r"), Col = S(p, "col") ?? "", ParryClass = S(p, "parryClass") ?? "",
            FbEnergy = B(p, "fbEnergy"), FdEnergy = B(p, "fdEnergy"), Mine = B(p, "mine"), Trap = B(p, "trap"), BlackBean = B(p, "blackBean"), Friendly = B(p, "friendly"), NoParry = B(p, "noParry"), Bomb = B(p, "bomb"), Web = B(p, "web"), PoisonZone = B(p, "poisonZone"),
            IceZone = B(p, "iceZone"), Blizzard = B(p, "blizzard"), DimRift = B(p, "dimRift"), ElemBall = B(p, "elemBall"), CoralSpike = B(p, "_coralSpike"), GbBean = B(p, "gbBean"), BlueBean = B(p, "blueBean"), FireMagic = B(p, "fireMagic"), WaterBean = B(p, "waterBean"),
            TitanEye = B(p, "titanEye"), BwBean = B(p, "bwBean"), RedBean = B(p, "redBean"), SwordWave = B(p, "swordWave"), PhantomSword = B(p, "phantomSword"), DruidStraight = B(p, "_druidStraight"), Magic = B(p, "magic"), Homing = B(p, "homing"), ParryBlueBean = B(p, "parryBlueBean"), AoeR = N0(p, "_aoeR"), AoeDmg = N0(p, "_aoeDmg"), FromRainbow = B(p, "_fromRainbow") };
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        int reflected = 0, kinds = 0; var kindSeen = new HashSet<ReflectKind>();
        foreach (var c in Cases(root, "reflect"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = i.GetRawText();
            var p = Proj(i.GetProperty("p"));
            var inp = new ParryReflect.ResolveInput
            {
                S = S(i, "s"), St2 = N0(i, "st2"), KiParryT = N0(i, "kiParryT"), SbParryT = N0(i, "sbParryT"), SbReleaseR = N0(i, "sbReleaseR"), Iframes = N0(i, "iframes"), SBashChgMul = N0(i, "sBashChgMul"), Detonate = N0(i, "detonate"),
                MaliceSwipe = N0(i, "maliceSwipe"), ShieldThrow = N0(i, "shieldThrow"), BonusRange = N0(i, "bonusRange"), PParry = N0(i, "pParry"), ParryBonus = N0(i, "parryBonus"), WRange = 0, WpBonusRange = 0, PR = N0(i, "pr"), PX = N0(i, "px"), PY = N0(i, "py"),
                IoActive = B(i, "io"), WhirlDet = B(i, "whirlDet"), PDist = N0(i, "pDist"),
                Counter = new ParryRules.CounterInput { MeleeRef = N0(i, "meleeRef"), StatStr = N0(i, "statStr"), PAtkMul = N0(i, "pAtkMul"), MagicRef = N0(i, "magicRef"), StatInt = N0(i, "statInt"), PMagicMul = N0(i, "pMagicMul"), PParry = N0(i, "pParry"), ParryBonus = N0(i, "parryBonus"), LegShieldParry = N0(i, "legShieldParry") },
            };
            if (i.TryGetProperty("tgt", out var t) && t.ValueKind == JsonValueKind.Object) { inp.HasTarget = true; inp.TargetX = N0(t, "x"); inp.TargetY = N0(t, "y"); }
            var r = ParryReflect.Resolve(p, inp);
            bool webReflected = N0(o, "kept") > 0;
            Check(r.Outcome == ReflectOutcome.Reflect == webReflected, x + " reflected C#=" + (r.Outcome == ReflectOutcome.Reflect) + " web=" + webReflected);
            Bool("pHit", r.PHit, o, "pHit", x); Bool("fell", r.Fell, o, "fell", x);
            if (webReflected && r.Outcome == ReflectOutcome.Reflect)
            {
                reflected++; if (kindSeen.Add(r.Kind)) kinds++;
                var po = o.GetProperty("p");
                Num("x", p.X, po, "x", x); Num("y", p.Y, po, "y", x); Num("vx", p.Vx, po, "vx", x); Num("vy", p.Vy, po, "vy", x); Num("dmg", p.Dmg, po, "dmg", x); Num("life", p.Life, po, "life", x); Num("ml", p.Ml, po, "ml", x);
                Bool("friendly", p.Friendly, po, "friendly", x); Bool("redBean", p.RedBean, po, "redBean", x); Bool("titanEye", p.TitanEye, po, "titanEye", x); Bool("bwBean", p.BwBean, po, "bwBean", x); Bool("gbBean", p.GbBean, po, "gbBean", x);
                Bool("waterBean", p.WaterBean, po, "waterBean", x); Bool("blueBean", p.BlueBean, po, "blueBean", x); Bool("parryBlueBean", p.ParryBlueBean, po, "parryBlueBean", x); Bool("magic", p.Magic, po, "magic", x); Bool("homing", p.Homing, po, "homing", x);
                Check(p.Col == S(po, "col"), x + " col C#=" + p.Col + " web=" + S(po, "col")); Num("aoeR", p.AoeR, po, "_aoeR", x); Num("aoeDmg", p.AoeDmg, po, "_aoeDmg", x); Bool("fromRainbow", p.FromRainbow, po, "_fromRainbow", x); Bool("elemBall", p.ElemBall, po, "elemBall", x);
                var dp = o.GetProperty("doParry"); Check(N0(o, "doParryCount") == 1, x + " doParry count");
                Num("dp.dmg", r.ParryDmg, dp, "dmg", x); Num("dp.x", r.ParryX, dp, "x", x); Num("dp.y", r.ParryY, dp, "y", x); StrEq("dp.el", r.ParryEl, dp, "el", x);
                Check(r.ResourceMul == (Has(dp, "mul") ? N0(dp, "mul") : 0), x + " dp.mul C#=" + r.ResourceMul + " web=" + N(dp, "mul")); StrEq("dp.tag", r.ParryTag, dp, "tag", x);
                Num("parryBank", r.ParryBankAdd, o, "parryBank", x); Check(r.IceBurst == (N0(o, "ice") > 0), x + " ice burst");
            }
            else
            {
                Check(N0(o, "doParryCount") == 0, x + " web paid doParry without reflecting");
                Check(r.Outcome != ReflectOutcome.Reflect, x + " outcome");
                // the bullet record is untouched when nothing reflected
                var po = o.GetProperty("p"); Num("vx", p.Vx, po, "vx", x); Num("vy", p.Vy, po, "vy", x); Num("dmg", p.Dmg, po, "dmg", x); Bool("friendly", p.Friendly, po, "friendly", x);
                bool webRecycled = N0(o, "recycled") > 0;
                bool cRecycled = !r.Fell;
                Check(webRecycled == cRecycled, x + " recycled C#=" + cRecycled + " web=" + webRecycled);
            }
        }
        section = "reflect"; Check(reflected >= 150, "reflected cases " + reflected); Check(kinds == 6, "reflect kinds seen " + kinds);

        foreach (var c in Cases(root, "reflectHoming"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = i.GetRawText();
            var p = new ReflectProjectile { X = N0(i, "x"), Y = N0(i, "y"), Vx = N0(i, "vx"), Vy = N0(i, "vy") };
            if (B(i, "inRange")) ParryReflect.HomingTurn(p, N0(i, "tx"), N0(i, "ty"), N0(i, "sp"));
            Num("vx", p.Vx, o, "vx", x); Num("vy", p.Vy, o, "vy", x);
        }
        int blastContacts = 0;
        foreach (var c in Cases(root, "reflectBlast"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = i.GetRawText();
            var p = Proj(i.GetProperty("p"));
            var en = i.GetProperty("e").EnumerateArray().ToArray();
            var targets = en.Select(e => new ParryReflect.BlastTarget { X = N0(e, "x"), Y = N0(e, "y"), R = N0(e, "r"), Alive = B(e, "alive"), BluHitCd = N0(e, "cd") }).ToArray();
            var hits = new List<ParryReflect.BlastHit>();
            bool used = ParryReflect.Blast(p, targets, N0(i, "dot"), hits);
            Bool("pHit", used, o, "pHit", x);
            var wh = o.GetProperty("hurts").EnumerateArray().ToArray();
            Check(hits.Count == wh.Length, x + " hurt count C#=" + hits.Count + " web=" + wh.Length);
            if (hits.Count == wh.Length && used)
            {
                blastContacts++;
                for (int k = 0; k < hits.Count; k++)
                {
                    Num("idx", hits[k].Index, wh[k], "i", x); Num("dmg", hits[k].Damage, wh[k], "dmg", x); Num("ang", hits[k].Angle, wh[k], "ang", x); Num("kbMult", 2, wh[k], "kb", x);
                    Bool("magic", true, wh[k], "magic", x); Bool("blue", p.BlueBean, wh[k], "blue", x); Bool("parry", p.ParryBlueBean, wh[k], "parry", x);
                }
                var we = o.GetProperty("en").EnumerateArray().ToArray();
                for (int k = 0; k < targets.Length; k++)
                {
                    double kx = 0, ky = 0; foreach (var h in hits) if (h.Index == k) { kx = h.KbX; ky = h.KbY; }
                    Num("kbx", kx, we[k], "kbx", x); Num("kby", ky, we[k], "kby", x); Num("poisonT", targets[k].PoisonT, we[k], "pt", x); Num("poisonStk", targets[k].PoisonStk, we[k], "ps", x); Num("poisonPool", targets[k].PoisonPool, we[k], "pp", x); Num("bluCd", targets[k].BluHitCd, we[k], "cd", x);
                }
            }
        }
        section = "reflectBlast"; Check(blastContacts >= 200, "blast contact cases " + blastContacts);

        var receipt = new { schema = "exoduser.unity.parry-reflect-oracle-result.v1", checks, failures = bad, oracleSha = root.GetProperty("source").GetProperty("sha256").GetString(), sections = perSection.ToDictionary(k => k.Key, k => new { checks = k.Value[0], failures = k.Value[1] }), firstFailures };
        File.WriteAllText(args[0], JsonSerializer.Serialize(receipt, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("PARRY_REFLECT_ORACLE " + checks + " checks / " + bad + " failures (reflected " + reflected + ", kinds " + kinds + ")");
        foreach (var f in firstFailures.Take(25)) Console.WriteLine("  " + f);
        return bad == 0 ? 0 : 1;
    }
    static void StrEq(string name, string actual, JsonElement o, string key, string ctx) { Check(actual == S(o, key), ctx + " " + name + " C#=" + actual + " web=" + S(o, key)); }
}
