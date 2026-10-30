using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Core.Skills;

// PC-B03 skill oracle: compares Runtime/Core/Skills/SkillRules.cs with the values oracle.json got from running the ORIGINAL game.html functions
// (export.cjs). usage: SkillTests <result.json> <oracle.json>   exit code 0 = every comparison equal.
static class Program
{
    static int checks, mismatches; static string section = "";
    static readonly System.Collections.Generic.List<string> messages = new System.Collections.Generic.List<string>();

    static void Same(string what, double expected, double actual)
    {
        checks++;
        if (BitConverter.DoubleToInt64Bits(expected) == BitConverter.DoubleToInt64Bits(actual) || (double.IsNaN(expected) && double.IsNaN(actual))) return;
        mismatches++; if (messages.Count < 40) messages.Add(section + ": " + what + " expected " + expected.ToString("R") + " got " + actual.ToString("R"));
    }
    static void Flag(string what, bool expected, bool actual) { checks++; if (expected == actual) return; mismatches++; if (messages.Count < 40) messages.Add(section + ": " + what + " expected " + expected + " got " + actual); }
    static double D(JsonElement e, string k) { return e.GetProperty(k).GetDouble(); }
    static int I(JsonElement e, string k) { return (int)e.GetProperty(k).GetDouble(); }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement; var s = root.GetProperty("sections");

        section = "skMul";
        foreach (var c in s.GetProperty("skMul").GetProperty("cases").EnumerateArray()) Same(c.GetProperty("id").GetString() + " Lv" + I(c, "lv"), D(c, "out"), SkillRules.SkMul(c.GetProperty("id").GetString(), I(c, "lv")));
        // every web id is in the C# table and vice versa
        var webIds = s.GetProperty("skMul").GetProperty("cases").EnumerateArray().Select(c => c.GetProperty("id").GetString()).Where(i => i != "nope").Distinct().OrderBy(i => i).ToArray();
        var cIds = SkillRules.SkMulIds.OrderBy(i => i).ToArray();
        Flag("id set equal (" + webIds.Length + " vs " + cIds.Length + ")", true, webIds.SequenceEqual(cIds));

        section = "cost";
        foreach (var c in s.GetProperty("cost").GetProperty("st").EnumerateArray())
            Same("stCost giantSlam Lv" + I(c, "lv") + " mst" + D(c, "mst") + " pAtk" + D(c, "pAtk") + " pMelee" + D(c, "pMelee") + " red" + D(c, "stRed"), D(c, "out"),
                SkillRules.StCost("giantSlam", I(c, "lv"), D(c, "mst"), SkillRules.PAtkCost(D(c, "pAtk")), SkillRules.PMeleeStCost(D(c, "pMelee")), D(c, "stRed")));
        foreach (var c in s.GetProperty("cost").GetProperty("mp").EnumerateArray())
            Same("mpCost iceOrb Lv" + I(c, "lv") + " pMagic" + D(c, "pMagic") + " red" + D(c, "mpRed") + " hm" + D(c, "hm"), D(c, "out"), SkillRules.MpCost("iceOrb", I(c, "lv"), SkillRules.PMagicCost(D(c, "pMagic"), D(c, "mpRed"), D(c, "hm"))));

        section = "spikeTrap";
        foreach (var c in s.GetProperty("spikeTrap").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"), mats = I(c, "mats"); var o = c.GetProperty("out"); bool can = mats >= RageMalice.Cost(SkillRules.SpikeTrapMalice);
            string tag = "Lv" + lv + " mats" + mats;
            Flag(tag + " cast", o.GetProperty("zone").ValueKind == JsonValueKind.Object, can);
            if (!can) { Same(tag + " mats unchanged", D(o, "mats"), mats); continue; }
            var z = o.GetProperty("zone");
            Same(tag + " mats", D(o, "mats"), mats - RageMalice.Cost(SkillRules.SpikeTrapMalice));
            Same(tag + " cd", D(o, "cd"), SkillRules.SpikeTrapCooldown(D(c, "cdRed")));
            Same(tag + " r", D(z, "r"), SkillRules.SpikeTrapRadius(lv)); Same(tag + " maxT", D(z, "maxT"), SkillRules.SpikeTrapMaxT);
            Same(tag + " dmg", D(z, "dmg"), SkillRules.SpikeTrapDamage(D(c, "magicRef"), 1, D(c, "mul"), lv)); Same(tag + " lv", D(z, "lv"), lv);
            Same(tag + " x", D(z, "x"), 120.5); Same(tag + " y", D(z, "y"), -40.25);
        }
        foreach (var c in s.GetProperty("spikeTrap").GetProperty("slow").EnumerateArray()) Same("slow Lv" + I(c, "lv"), D(c, "out"), SkillRules.SpikeTrapSlowPct(I(c, "lv")));

        section = "giantSlam";
        foreach (var c in s.GetProperty("giantSlam").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"), mats = I(c, "mats"); var o = c.GetProperty("out"); bool can = mats >= RageMalice.Cost(SkillRules.GiantSlamMalice);
            string tag = "Lv" + lv + " mats" + mats + " rage" + D(c, "rage");
            Flag(tag + " cast", o.GetProperty("hit").ValueKind == JsonValueKind.Array, can);
            if (!can) continue;
            var h = o.GetProperty("hit");
            Same(tag + " mats", D(o, "mats"), mats - RageMalice.Cost(SkillRules.GiantSlamMalice));
            Same(tag + " cd", D(o, "cd"), SkillRules.GiantSlamCooldown(lv, D(c, "cdRed")));
            var slam = RageMalice.Slam(D(c, "rage"), 100, D(c, "pRage"), D(c, "rageDmg"), 0);
            Same(tag + " hit.range", h[1].GetDouble(), SkillRules.GiantSlamRange(lv));
            Same(tag + " hit.dmg", h[3].GetDouble(), SkillRules.GiantSlamDamage(D(c, "meleeRef"), 1, lv, slam.DamageMul));
            Same(tag + " hit.arc", h[2].GetDouble(), Math.PI);
            Same(tag + " st2", D(o, "st2"), SkillRules.GiantSlamWindup); Flag(tag + " state", true, o.GetProperty("state").GetString() == "gSlamWindup");
            var w = o.GetProperty("waves")[0]; Same(tag + " wave.maxR", D(w, "maxR"), SkillRules.GiantSlamRange(lv) * 2); Same(tag + " wave.maxT", D(w, "maxT"), SkillRules.GiantSlamWaveMaxT);
            Same(tag + " st cost calls", D(o, "st"), 1);
        }

        section = "slamHit";
        foreach (var c in s.GetProperty("slamHit").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"); double range = SkillRules.GiantSlamRange(lv), dist = D(c, "dist"), r = 15; var o = c.GetProperty("out"); bool boss = c.GetProperty("boss").GetBoolean();
            string tag = "Lv" + lv + " dist" + dist + (boss ? " boss" : "") + " poise" + D(c, "poise");
            bool inRange = dist <= range + r; bool hurt = o.GetProperty("hurt").ValueKind == JsonValueKind.Object;
            Flag(tag + " inside the damage range", hurt, inRange);
            if (!inRange) { Same(tag + " stunned untouched", D(o, "stunned"), 0); continue; }
            int dmg = SkillRules.GiantSlamHitDamage(I(c, "dmg"), D(c, "pAtkMul"), 0);
            Same(tag + " dmg", o.GetProperty("hurt").GetProperty("d").GetDouble(), dmg);
            bool dead = !o.GetProperty("alive").GetBoolean(); Flag(tag + " alive", !dead, D(c, "mhp") - dmg > 0);
            if (dead) continue;
            if (boss) { Same(tag + " poise amt", o.GetProperty("poise").GetDouble(), Js.Int(D(c, "maxPoise") * 0.25)); Same(tag + " boss stunned", D(o, "stunned"), 0); }
            else
            {
                double stun = SkillRules.GiantSlamMiniStun; if (D(c, "poise") <= 0) stun = Math.Max(stun, Js.Int(SkillRules.GiantSlamFullStun(lv) * 1.0));
                Same(tag + " stunned", D(o, "stunned"), stun);
            }
            Same(tag + " kb", D(o, "kbx"), 8);
        }

        section = "holyDome";
        foreach (var c in s.GetProperty("holyDome").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"); var o = c.GetProperty("out"); var z = o.GetProperty("zones")[0];
            Same("Lv" + lv + " cd", D(o, "cd"), SkillRules.HolyDomeCooldown); Same("Lv" + lv + " r", D(z, "r"), SkillRules.HolyDomeRadius(lv)); Same("Lv" + lv + " maxT", D(z, "maxT"), SkillRules.HolyDomeDuration(lv));
            Same("Lv" + lv + " zone lv", D(z, "lv"), lv); Same("Lv" + lv + " zone count", o.GetProperty("zones").GetArrayLength(), 1);
        }
        foreach (var c in s.GetProperty("holyDome").GetProperty("regen").EnumerateArray())
            Same("regen Lv" + I(c, "lv") + " fm" + D(c, "fm"), D(c, "out"), 10 + SkillRules.HolyDomeRegenPerFrame(I(c, "lv"), D(c, "fm")) - 10);

        section = "iceOrb";
        foreach (var c in s.GetProperty("iceOrb").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"); var o = c.GetProperty("out"); double mp = D(c, "mp"); string tag = "Lv" + lv + " mp" + mp;
            int cost = SkillRules.MpCost("iceOrb", lv, 1), paid = (int)Math.Min(mp, cost);
            int bon = paid * 2; Same(tag + " bonus", D(o, "bon"), bon); Same(tag + " mp after", D(o, "mpAfter"), Math.Max(0, mp - cost));
            int baseDmg = SkillRules.IceOrbBaseDamage(D(c, "magicRef"), 1, D(c, "mul"), lv, bon);
            Same(tag + " blades", D(o, "blades"), SkillRules.IceOrbBlades(lv)); Same(tag + " bladeDmg", D(o, "bladeDmg"), SkillRules.IceOrbBladeDamage(baseDmg));
            Same(tag + " cd", D(o, "cd"), SkillRules.IceOrbCooldown(lv));
            Same(tag + " spawn radius", Math.Round(D(o, "r0"), 6), Math.Round(SkillRules.IceOrbSpawnRadius(15, lv), 6));
            double shatterR = SkillRules.IceOrbShatterRadius(lv); bool inside = 10 < shatterR + 15;
            Flag(tag + " shatter hit", o.GetProperty("hurt").ValueKind == JsonValueKind.Number, inside);
            if (inside) Same(tag + " shatter dmg", D(o, "hurt"), SkillRules.IceOrbShatterDamage(baseDmg));
        }

        section = "level";
        foreach (var c in s.GetProperty("level").GetProperty("cost").EnumerateArray()) Same("upSp Lv" + I(c, "lv"), D(c, "out"), SkillRules.UpgradeSpCost);
        foreach (var c in s.GetProperty("level").GetProperty("locks").EnumerateArray()) Same("lock Lv" + I(c, "lv"), D(c, "out"), SkillRules.SkillLevelLock(I(c, "lv")));

        section = "fireball";
        foreach (var c in s.GetProperty("fireball").GetProperty("cases").EnumerateArray())
        {
            int lv = I(c, "lv"); var o = c.GetProperty("out"); double angle = D(c, "angle"); string tag = "악의구 Lv" + lv;
            Same(tag + " 시전시간", D(c, "castTicks"), Js.Int(14 / D(c, "castSpeed")));
            // 위치·속도는 Core의 float32 저장 계약에서 비트 일치한다. JS/.NET sin의 double 1ULP 차이는 그대로 저장 형식에 양자화한다.
            Same(tag + " 시작x(float32)", (float)D(o, "x"), (float)(100 + Math.Cos(angle) * 14)); Same(tag + " 시작y(float32)", (float)D(o, "y"), (float)(200 + Math.Sin(angle) * 14));
            Same(tag + " 시작각vx(float32)", (float)D(o, "vx"), (float)(Math.Cos(angle) * SkillRules.FireballSpeed)); Same(tag + " 시작각vy(float32)", (float)D(o, "vy"), (float)(Math.Sin(angle) * SkillRules.FireballSpeed));
            Same(tag + " 사거리", D(o, "maxDist"), SkillRules.FireballRange(lv, D(c, "bonusRange")));
            Same(tag + " 초기반경", D(o, "r"), SkillRules.FireballRadius0); Same(tag + " 성장반경", D(o, "_fbRMax"), SkillRules.FireballRadiusMax(lv));
            Same(tag + " 폭발반경", D(o, "explR"), SkillRules.FireballExplosionRadius(lv)); Same(tag + " 속성", D(o, "el"), SkillRules.FireballElement);
            int damage = SkillRules.FireballDamage(D(c, "magicRef"), D(c, "statInt"), D(c, "mul"), lv) + I(c, "bonus");
            Same(tag + " 피해", D(o, "dmg"), damage); Same(tag + " 폭발피해", D(o, "explDmg"), Js.Int(damage * .6));
        }

        var result = new { checks, mismatches, messages };
        File.WriteAllText(args[0], JsonSerializer.Serialize(result));
        Console.WriteLine("skill oracle: " + checks + " checks, " + mismatches + " mismatches");
        foreach (var m in messages) Console.WriteLine("  " + m);
        return mismatches == 0 ? 0 : 1;
    }
}
