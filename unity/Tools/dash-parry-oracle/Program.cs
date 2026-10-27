// PC-B07 oracle check: compares Runtime/Core/Combat/*.cs with oracle.json (produced by export.cjs from the ORIGINAL game.html code).
// usage: DashParryTests.dll <receipt.json> <oracle.json>   (exit code = number of failing checks > 0 ? 1 : 0)
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 3) firstFailures.Add(section + ": " + detail); }
    }
    static bool Eq(double a, double b) { if (double.IsNaN(a) && double.IsNaN(b)) return true; if (double.IsNaN(a) || double.IsNaN(b)) return false; return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Abs(b)); }
    static void Num(string name, double actual, JsonElement o, string key, string ctx)
    {
        double want = N(o, key); bool ok = Eq(actual, want);
        Check(ok, ctx + " " + name + " C#=" + actual + " web=" + (double.IsNaN(want) ? "null" : want.ToString()));
    }
    static double N(JsonElement e, string k) { if (!e.TryGetProperty(k, out var v) || v.ValueKind == JsonValueKind.Null) return double.NaN; if (v.ValueKind == JsonValueKind.True) return 1; if (v.ValueKind == JsonValueKind.False) return 0; return v.GetDouble(); }
    static double N0(JsonElement e, string k) { double v = N(e, k); return double.IsNaN(v) ? 0 : v; }   // JS undefined/null used as a falsy number
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }
    static string Ctx(JsonElement i) { return i.GetRawText(); }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; if (!perSection.ContainsKey(name)) perSection[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static void BoolEq(string name, bool actual, JsonElement o, string key, string ctx) { Check(actual == B(o, key), ctx + " " + name + " C#=" + actual + " web=" + B(o, key)); }
    static void StrEq(string name, string actual, JsonElement o, string key, string ctx) { Check(actual == S(o, key), ctx + " " + name + " C#=" + actual + " web=" + S(o, key)); }

    static ParryRules.ProjectileFlags Flags(JsonElement p)
    {
        var f = new ParryRules.ProjectileFlags { ParryClass = S(p, "parryClass"), El = N0(p, "el") };
        f.FbEnergy = B(p, "fbEnergy"); f.FdEnergy = B(p, "fdEnergy"); f.Mine = B(p, "mine"); f.Trap = B(p, "trap"); f.BlackBean = B(p, "blackBean"); f.Friendly = B(p, "friendly"); f.NoParry = B(p, "noParry"); f.Bomb = B(p, "bomb"); f.Web = B(p, "web");
        f.PoisonZone = B(p, "poisonZone"); f.IceZone = B(p, "iceZone"); f.Blizzard = B(p, "blizzard"); f.DimRift = B(p, "dimRift"); f.ElemBall = B(p, "elemBall"); f.CoralSpike = B(p, "_coralSpike"); f.GbBean = B(p, "gbBean"); f.BlueBean = B(p, "blueBean");
        f.FireMagic = B(p, "fireMagic"); f.WaterBean = B(p, "waterBean"); f.TitanEye = B(p, "titanEye"); f.BwBean = B(p, "bwBean"); f.RedBean = B(p, "redBean"); f.SwordWave = B(p, "swordWave"); f.PhantomSword = B(p, "phantomSword");
        return f;
    }
    static string ClassName(ParryRules.ProjClass c) { return c == ParryRules.ProjClass.Physical ? "physical" : c == ParryRules.ProjClass.Magic ? "magic" : "forbidden"; }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        // ---- constants ----
        section = "constants"; perSection[section] = new int[2];
        { var c = root.GetProperty("sections").GetProperty("constants");
          void Arr(string k, IList<int> mine) { var w = c.GetProperty(k).EnumerateArray().Select(x => (int)x.GetDouble()).ToArray(); Check(w.SequenceEqual(mine), k + " " + string.Join(",", w) + " vs " + string.Join(",", mine)); }
          Arr("harpTierF", ChainDash.TierHoldFrames); Arr("harpIframe", ChainDash.IframeByTier); Arr("harpPullDur", ChainDash.PullFrames); Arr("harpGaugeCost", ChainDash.GaugeCost);
          Check(c.GetProperty("harpDmg").EnumerateArray().Select(x => x.GetDouble()).SequenceEqual(ChainDash.DamageMul), "harpDmg");
          Check(c.GetProperty("harpSpd").GetDouble() == ChainDash.FlightSpeed, "harpSpd"); Check(c.GetProperty("harpGaugeBaseCells").GetInt32() == ChainDash.BaseGaugeCells, "base cells");
          Check(c.GetProperty("miniStun").GetDouble() == EnemyPoiseRules.MiniStun && c.GetProperty("fullStun").GetDouble() == EnemyPoiseRules.FullStun, "mini/full stun");
          Check(c.GetProperty("parryWin").GetInt32() == ParryRules.ParryWin && c.GetProperty("sdGrace").GetDouble() == ParryRules.SdGrace, "parry win / sd grace");
          var hs = c.GetProperty("hitStop"); Check(hs.GetProperty("parry").GetDouble() == ParryRewards.HitStopParry && hs.GetProperty("parryReflect").GetDouble() == ParryRewards.HitStopParryReflect && hs.GetProperty("pStun").GetDouble() == PlayerPoise.PStunHitStop, "hit stop parry / reflect / pStun");
          Check(hs.GetProperty("groggy").GetDouble() == 8, "hit stop groggy 8 (value only)"); }

        foreach (var c in Cases(root, "parryTicks")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); double cape = N0(i, "cape"); Num("winTicks", ParryRules.LParryWinTicks(cape), o, "winTicks", Ctx(i)); Num("sbT", ParryRules.LSbParryT(cape), o, "sbT", Ctx(i)); }
        foreach (var c in Cases(root, "isPWin")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); BoolEq("win", ParryRules.IsParryWindow(S(i, "s"), N0(i, "st2"), N0(i, "kiParryT"), N0(i, "sbParryT"), N0(i, "cape")), o, "win", Ctx(i)); }
        foreach (var c in Cases(root, "swing")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); double m = N0(i, "maliceSwipe"), t = N0(i, "shieldThrow"); Num("level", ParryRules.WingStrikeLevel(m, t), o, "level", Ctx(i)); Num("rangeMul", ParryRules.SkillRangeMul(m, t), o, "rangeMul", Ctx(i)); Num("radius", ParryRules.SwingRadius(N0(i, "bonusRange"), m, t, N0(i, "chg")), o, "radius", Ctx(i)); }
        foreach (var c in Cases(root, "gate"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out");
            var g = new ParryRules.GateInput { S = S(i, "s"), St2 = N0(i, "st2"), KiParryT = N0(i, "kiParryT"), SbParryT = N0(i, "sbParryT"), SbReleaseR = N0(i, "sbReleaseR"), SBashChgMul = N0(i, "sBashChgMul"), Detonate = N0(i, "detonate"), MaliceSwipe = N0(i, "maliceSwipe"), ShieldThrow = N0(i, "shieldThrow"), BonusRange = N0(i, "bonusRange"), PParry = N0(i, "pParry"), ParryBonus = N0(i, "parryBonus"), WRange = N0(i, "wRange"), WpBonusRange = N0(i, "wpBonusRange"), PCollR = N0(i, "pCollR") };
            var r = ParryRules.ComputeGate(g); string x = Ctx(i);
            BoolEq("sbPW", r.SbPW, o, "sbPW", x); BoolEq("sbPWDet", r.SbPWDet, o, "sbPWDet", x); BoolEq("anyPW", r.AnyPW, o, "anyPW", x); BoolEq("sbActive", r.SbActive, o, "sbActive", x); BoolEq("isAtkState", r.IsAtkState, o, "isAtkState", x); BoolEq("releasePW", r.ReleasePW, o, "releasePW", x);
            Num("chgMP", r.ChgMP, o, "chgMP", x); Num("parryR", r.ParryR, o, "parryR", x); Num("parryRDet", r.ParryRDet, o, "parryRDet", x); Num("qPulseR", r.QPulseR, o, "qPulseR", x); Num("rbDeflR", r.RbDeflR, o, "rbDeflR", x);
        }
        foreach (var c in Cases(root, "sblockRadius")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("radius", ParryRules.SBlockChargeRadius(N0(i, "holdT")), o, "radius", Ctx(i)); }
        foreach (var c in Cases(root, "sblockZone")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var z = ParryRules.SBlockProjectileZone(N0(i, "distance"), N0(i, "parryT")); StrEq("zone", z == ParryRules.Zone.Absorb ? "absorb" : z == ParryRules.Zone.Parry ? "parry" : "none", o, "zone", Ctx(i)); }
        foreach (var c in Cases(root, "projectile"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            bool has = i.TryGetProperty("p", out var pe) && pe.ValueKind == JsonValueKind.Object; var f = has ? Flags(pe) : new ParryRules.ProjectileFlags();
            if (!has) { StrEq("cls", "forbidden", o, "cls", x); BoolEq("canReflect", false, o, "canReflect", x); Num("physMul", ParryRules.PhysicalResourceMultiplier(f, false), o, "physMul", x); BoolEq("mouth", false, o, "mouth", x); continue; }
            StrEq("cls", ClassName(ParryRules.ProjectileParryClass(f)), o, "cls", x);
            BoolEq("canReflect", ParryRules.ECanReflect(f, S(i, "ctxS"), N0(i, "stWingT"), B(i, "shieldFuse")), o, "canReflect", x);
            Num("physMul", ParryRules.PhysicalResourceMultiplier(f), o, "physMul", x); BoolEq("mouth", ParryRules.IsPhysicalMouthProjectile(f), o, "mouth", x);
        }
        foreach (var c in Cases(root, "passives")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); double lv = N0(i, "level"), sb = N0(i, "shieldBlockDR"); string x = Ctx(i);
            Num("parryDmg", ParryRules.ParryCounterDamageMul(lv), o, "parryDmg", x); Num("rmbSpd", ParryRules.ParryRecoverSpeed(lv), o, "rmbSpd", x); Num("rainbowDR", ParryRules.ParryRainbowDamageReduction(lv), o, "rainbowDR", x); Num("guardAbsorb", ParryRules.GuardAbsorb(lv, sb), o, "guardAbsorb", x);
            Num("shieldBlock", ParryRules.ShieldBlock(), o, "shieldBlock", x); Num("shieldMul", ParryRules.ShieldDamageMul(), o, "shieldMul", x); Num("chargeRange", ChainDash.RangeMul(lv), o, "chargeRange", x); Num("chargeGauge", ChainDash.GaugeRegenMul(lv), o, "chargeGauge", x); }
        foreach (var c in Cases(root, "parryProjDmg")) { var i = c.GetProperty("in"); var o = c.GetProperty("out");
            var ci = new ParryRules.CounterInput { BulletDmg = N0(i, "bulletDmg"), IsQ = B(i, "isQ"), MeleeRef = N0(i, "meleeRef"), StatStr = N0(i, "statStr"), PAtkMul = N0(i, "pAtkMul"), MagicRef = N0(i, "magicRef"), StatInt = N0(i, "statInt"), PMagicMul = N0(i, "pMagicMul"), PParry = N0(i, "pParry"), ParryBonus = N0(i, "parryBonus"), LegShieldParry = N0(i, "legShieldParry") };
            Num("dmg", ParryRules.ParryProjectileDamage(ci), o, "dmg", Ctx(i)); }
        foreach (var c in Cases(root, "doParry"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            string el = null; if (i.TryGetProperty("parryEl", out var pe2) && pe2.ValueKind == JsonValueKind.String) el = pe2.GetString();
            var inp = new ParryRewards.Input { PlayerState = S(i, "s"), ForceQ = B(i, "forceQ"), SbParryT = N0(i, "sbParryT"), ParryEl = el, ResourceMul = N0(i, "resourceMul"), LessonActive = B(i, "lesson"), Detonate = N0(i, "detonate"), ParryT = N0(i, "parryT"),
                ParryBonus = N0(i, "parryBonus"), PRegen = N0(i, "pRegen"), OptHitStop = N0(i, "optHitStop"), OptShake = N0(i, "optShake"), Iframes = N0(i, "iframes"), Hp = N0(i, "hp"), Mhp = N0(i, "mhp"), St = N0(i, "st"), Mst = N0(i, "mst"), Mp = N0(i, "mp"), Mmp = N0(i, "mmp"),
                Poise = N0(i, "poise"), MaxPoise = N0(i, "maxPoise"), Rage = N0(i, "rage"), RageMax = N0(i, "rageMax"), Mats = N0(i, "mats"), HarpGauge = N0(i, "harpGauge"), HarpGaugeMax = N0(i, "harpMax") };
            var r = ParryRewards.Apply(inp);
            Num("iframes", r.Iframes, o, "iframes", x); Num("hp", r.Hp, o, "hp", x); Num("st", r.St, o, "st", x); Num("mp", r.Mp, o, "mp", x); Num("poise", r.Poise, o, "poise", x); Num("rage", r.Rage, o, "rage", x); Num("mats", r.Mats, o, "mats", x);
            Num("harpGauge", r.HarpGauge, o, "harpGauge", x); Num("hitStop", r.HitStop, o, "hitStop", x); Num("slowMo", r.SlowMo, o, "slowMo", x); Num("shake", r.Shake, o, "shake", x);
        }
        foreach (var c in Cases(root, "harpDist")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); int tier = (int)N0(i, "tier"); double cb = N0(i, "chargeBoost"), mb = N0(i, "magicBlink"), pc = N0(i, "pCharge");
            Num("distTier", ChainDash.DistanceOfTier(tier, cb, mb, pc), o, "distTier", Ctx(i));
            double av = tier >= 1 && tier <= 3 ? ChainDash.AvailableDistance(tier, N0(i, "gauge"), cb, mb, pc) : double.NaN; Num("available", av, o, "available", Ctx(i)); }
        foreach (var c in Cases(root, "chainTier")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("tier", ChainDash.TierForHoldFrames(N0(i, "holdF")), o, "tier", Ctx(i)); }
        foreach (var c in Cases(root, "chainRelease")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var r = ChainDash.Release((int)N0(i, "tier"), N0(i, "gauge"), N0(i, "st"), N0(i, "mst"), N0(i, "chargeBoost"), 0, N0(i, "pCharge")); string x = Ctx(i);
            BoolEq("fired", r.Fired, o, "fired", x); Num("gauge", r.Gauge, o, "gauge", x); Num("st", r.St, o, "st", x); Num("maxDist", r.Fired ? r.MaxDist : double.NaN, o, "maxDist", x); }
        foreach (var c in Cases(root, "gaugeRegen")) { var i = c.GetProperty("in"); var o = c.GetProperty("out");
            Num("gauge", ChainDash.RegenGauge(N0(i, "gauge"), N0(i, "max"), N0(i, "chargeBoost"), N0(i, "pCharge"), N0(i, "dtSp"), B(i, "hold"), B(i, "harpActive"), B(i, "dashActive"), B(i, "dead"), B(i, "lessonCh2")), o, "gauge", Ctx(i)); }
        foreach (var c in Cases(root, "gaugeMax")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var r = ChainDash.ComputeGaugeMax(B(i, "dimRush"), B(i, "dimThunder"), B(i, "dimBreach"), N0(i, "chargeBoost"), N0(i, "magicBlink"), N0(i, "extraST"), N0(i, "armorStock"), N0(i, "bootsStock")); string x = Ctx(i);
            Num("cells", r.Cells, o, "cells", x); Num("max", r.Max, o, "max", x); Num("maxStocks", r.MaxStocks, o, "maxStocks", x); Num("cdBase", r.CdBase, o, "cdBase", x); }
        foreach (var c in Cases(root, "chainPull")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var r = ChainDash.StartPull((int)N0(i, "tier"), N0(i, "px"), N0(i, "py"), N0(i, "hx"), N0(i, "hy")); string x = Ctx(i);
            Num("vx", r.Vx, o, "vx", x); Num("vy", r.Vy, o, "vy", x); Num("left", r.Left, o, "left", x); Num("iframe", r.Iframe, o, "iframe", x); Num("poise", r.Poise, o, "poise", x); }
        foreach (var c in Cases(root, "chainFlight")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); double d = N0(i, "dist"); ChainDash.FlightStep(N0(i, "dtSp"), N0(i, "maxDist"), ref d, out double step); Num("step", step, o, "step", Ctx(i)); Num("dist", d, o, "dist", Ctx(i)); }
        foreach (var c in Cases(root, "chainStep")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("step", ChainDash.PullStep(N0(i, "dtSp"), N0(i, "left")), o, "step", Ctx(i)); Num("iframes", ChainDash.PullIframes(N0(i, "iframes")), o, "iframes", Ctx(i)); }
        foreach (var c in Cases(root, "chainLanding")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            Num("iframes", ChainDash.LandingInvulnerable(N0(i, "iframes")), o, "iframes", x); Num("landT", ChainDash.LandingAnimFrames, o, "landT", x); Num("shake", ChainDash.LandingShake((int)N0(i, "tier"), B(i, "dimBreach"), B(i, "slamLand")), o, "shake", x); }
        foreach (var c in Cases(root, "chainCancelTier")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("tier", ChainDash.CancelTier(N0(i, "chargeBoost")), o, "tier", Ctx(i)); }
        foreach (var c in Cases(root, "focusState")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); BoolEq("focus", PlayerPoise.IsFocusState(S(i, "s")), o, "focus", Ctx(i)); }
        foreach (var c in Cases(root, "playerHit"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var st = new PlayerPoise.State { S = S(i, "s"), Poise = N0(i, "poise"), PoiseR = 9, St2 = 0, Iframes = 7 };
            var r = PlayerPoise.OnHit(st, B(i, "dot"), B(i, "kiCharging"), N0(i, "ccRes"), N0(i, "stunRes"), N0(i, "optHitStop"), 0);
            StrEq("s", r.Player.S, o, "s", x); Num("poise", r.Player.Poise, o, "poise", x); Num("poiseR", r.Player.PoiseR, o, "poiseR", x); Num("st2", r.Player.St2, o, "st2", x); Num("iframes", r.Player.Iframes, o, "iframes", x); Num("hitStop", r.HitStop, o, "hitStop", x);
        }
        foreach (var c in Cases(root, "blockBranch"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var bi = new PlayerPoise.BlockInput { S = S(i, "s"), SbParryT = N0(i, "sbParryT"), Dmg = N0(i, "dmg"), Poise = N0(i, "poise"), PGuard = N0(i, "pGuard"), ShieldBlockDR = N0(i, "shieldBlockDR"), CcRes = N0(i, "ccRes"), StunRes = N0(i, "stunRes"), ParryBank = 5, ParryT = N0(i, "parryT"), Dot = B(i, "dot"), RedBean = B(i, "redBean"), Detonate = N0(i, "detonate") != 0 };
            var r = PlayerPoise.ShieldBranch(bi);
            Num("dmg", r.Dmg, o, "dmg", x); BoolEq("retFell", r.ReachedDamage, o, "retFell", x); StrEq("s", r.S, o, "s", x); Num("poise", r.Poise, o, "poise", x); Num("poiseR", r.PoiseR, o, "poiseR", x); Num("st2", r.St2, o, "st2", x); Num("iframes", r.Iframes, o, "iframes", x);
            Num("sbParryT", r.SbParryT, o, "sbParryT", x); Num("parryBank", r.ParryBank, o, "parryBank", x); Num("shake", r.Shake, o, "shake", x); Num("kbMag", r.KbMagnitude, o, "kbMag", x);
            Check(o.GetProperty("doParry").GetArrayLength() == r.DoParryCalls, x + " doParry calls C#=" + r.DoParryCalls + " web=" + o.GetProperty("doParry").GetArrayLength());
            if (r.DoParryCalls > 0) { var call = o.GetProperty("doParry")[0]; Check(call[0].GetDouble() == 0 && call[3].ValueKind == JsonValueKind.True, x + " doParry(0,..,true) arguments"); }
            Check(o.GetProperty("blasts").GetArrayLength() == (r.DetonateBlast ? 1 : 0), x + " detonate blast");
        }
        foreach (var c in Cases(root, "stunExit"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var ei = new PlayerPoise.EscapeInput { S = S(i, "s"), St2 = N0(i, "st2"), JustCharge = B(i, "jcCharge"), JustParry = B(i, "jcParry"), JustSkill7 = B(i, "jcSkill7"), ShiftHeld = B(i, "shiftHeld"), DashHold = B(i, "dashHold"), HarpActive = B(i, "harpActive"), DashActive = B(i, "dashActive"), CanBladeDash = B(i, "canBladeDash"), HasBladeDashTrigger = i.TryGetProperty("bdTrigger", out var bt) && bt.ValueKind != JsonValueKind.Null, SeaParalyzed = N0(i, "seaParalyzed") > 0 };
            var r = PlayerPoise.Escape(ei);
            StrEq("s", r.S, o, "s", x); Num("st2", r.St2, o, "st2", x); Num("iframes", r.Iframes, o, "iframes", x); Num("poise", r.Poise, o, "poise", x); Num("poiseR", r.PoiseR, o, "poiseR", x);
            Check(o.GetProperty("bladeDash").GetArrayLength() == (r.BladeDash ? 1 : 0), x + " blade dash");
            bool trigAfter = o.TryGetProperty("bdTriggerAfter", out var ta) && ta.ValueKind != JsonValueKind.Null; Check(trigAfter == (ei.HasBladeDashTrigger && !r.ConsumedTrigger), x + " trigger consumed");
        }
        foreach (var c in Cases(root, "poiseHit"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            if (B(i, "dead")) { var d = new EnemyPoiseRules.Enemy { Alive = false, Poise = 5, MaxPoise = 100, PoiseR = 2 }; var dr = EnemyPoiseRules.PoiseHit(d, 5, 0, 0); BoolEq("ret", dr.Broke, o, "ret", x); Num("poise", dr.Enemy.Poise, o, "poise", x); continue; }
            var e = new EnemyPoiseRules.Enemy { Alive = true, Boss = B(i, "ib"), PImmune = N0(i, "pImmune"), Poise = N0(i, "poise"), MaxPoise = 100, PoiseR = 7, Stunned = N0(i, "stunned"), MaxStunned = N0(i, "maxStunned") };
            var r = EnemyPoiseRules.PoiseHit(e, N0(i, "amt"), N0(i, "noHitStopT"), 0);
            BoolEq("ret", r.Broke, o, "ret", x); Num("poise", r.Enemy.Poise, o, "poise", x); Num("poiseR", r.Enemy.PoiseR, o, "poiseR", x); Num("stunned", r.Enemy.Stunned, o, "stunned", x); Num("maxStunned", r.Enemy.MaxStunned, o, "maxStunned", x); Num("pImmune", r.Enemy.PImmune, o, "pImmune", x); Num("slowMo", r.SlowMo, o, "slowMo", x);
        }
        foreach (var c in Cases(root, "poiseAmount"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            double? pm = i.TryGetProperty("poiseMult", out var pmv) && pmv.ValueKind == JsonValueKind.Number ? pmv.GetDouble() : (double?)null;
            bool ok = EnemyPoiseRules.PoiseAmount(N0(i, "dmg"), EnemyPoiseRules.PoiseMultDefault(pm), B(i, "isBoss"), N0(i, "atkEl"), B(i, "isDot"), B(i, "poiseHit"), N0(i, "pImmune"), N0(i, "staggerBns"), out double amt);
            Num("amt", ok ? amt : double.NaN, o, "amt", x);
        }
        foreach (var c in Cases(root, "groggyDamage")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("dmg", EnemyPoiseRules.GroggyDamage(N0(i, "stunned"), N0(i, "dmg"), B(i, "isDot")), o, "dmg", Ctx(i)); }
        foreach (var c in Cases(root, "poiseMultDefault")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); double? pm = i.TryGetProperty("poiseMult", out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : (double?)null; Num("psM", EnemyPoiseRules.PoiseMultDefault(pm), o, "psM", Ctx(i)); }
        foreach (var c in Cases(root, "enemyFrame"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var e = new EnemyPoiseRules.Enemy { Alive = true, Boss = B(i, "ib"), Stunned = N0(i, "stunned"), MaxStunned = N0(i, "maxStunned"), HitStun = N0(i, "hitStun"), StunImmune = 3, PImmune = N0(i, "pImmune"), Poise = N0(i, "poise"), MaxPoise = 100, PoiseR = N0(i, "poiseR"), S = "atk", St2 = 77, TeleDropY = 5 };
            var r = EnemyPoiseRules.Frame(e, N0(i, "sp"));
            Num("stunned", r.Stunned, o, "stunned", x); Num("maxStunned", r.MaxStunned, o, "maxStunned", x); Num("hitStun", r.HitStun, o, "hitStun", x); Num("stunImmune", r.StunImmune, o, "stunImmune", x); Num("pImmune", r.PImmune, o, "pImmune", x);
            Num("poise", r.Poise, o, "poise", x); Num("poiseR", r.PoiseR, o, "poiseR", x); StrEq("s", r.S, o, "s", x); Num("st2", r.St2, o, "st2", x); Num("teleDropY", r.TeleDropY, o, "teleDropY", x);
        }
        foreach (var c in Cases(root, "shieldCost")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); Num("cost", ParryRules.ShieldStaminaCost(N0(i, "maliceSwipe")), o, "cost", Ctx(i)); }
        foreach (var c in Cases(root, "sRecover")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); StrEq("s", "sRecover", o, "s", Ctx(i)); Num("st2", ParryRules.SRecoverTicks(N0(i, "pParry")), o, "st2", Ctx(i)); }
        foreach (var c in Cases(root, "kiGather"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i); double chg = N0(i, "kgChg");
            Num("tier", ParryRules.KiGatherTier(chg), o, "tier", x);
            var rl = o.GetProperty("release");
            if (!ParryRules.KiGatherFizzles(chg)) { StrEq("release.s", "sBash", rl, "s", x); Num("release.st2", 20, rl, "st2", x); Num("release.mul", ParryRules.ClampChargeMul(ParryRules.KiGatherReleaseMultiplier(chg)), rl, "mul", x); Num("release.chg", 0, rl, "chg", x); Num("release.tier", 0, rl, "tier", x); }
            else { StrEq("fizzle.s", "idle", rl, "s", x); Num("fizzle.chg", 0, rl, "chg", x); Num("fizzle.tier", 0, rl, "tier", x); Num("fizzle.mul", 1, rl, "mul", x); }
            var au = o.GetProperty("auto");
            if (ParryRules.KiGatherAutoRelease(chg)) { StrEq("auto.s", "sBash", au, "s", x); Num("auto.mul", ParryRules.ClampChargeMul(3), au, "mul", x); Num("auto.st2", 20, au, "st2", x); }
            else { StrEq("noauto.s", "kiGather", au, "s", x); }
        }
        foreach (var c in Cases(root, "sBashFire"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var r = ParryRules.SBashFire(N0(i, "st"), N0(i, "maliceSwipe"), "sDraw", 5, -1);
            BoolEq("fired", r.Fired, o, "fired", x); Num("st", r.St, o, "st", x); StrEq("s", r.S, o, "s", x); Num("st2", r.St2, o, "st2", x); Num("chgMul", r.ChgMul, o, "chgMul", x); Num("atkBon", r.AtkBon, o, "atkBon", x); Num("lastCost", r.LastCost, o, "lastCost", x);
        }
        foreach (var c in Cases(root, "sBashStrike")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); BoolEq("hit", ParryRules.SBashStrikes(N0(i, "st2"), N0(i, "sp")), o, "hit", Ctx(i)); }
        foreach (var c in Cases(root, "sdTap")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); BoolEq("ok", ParryRules.SdTapOk(N0(i, "buf"), N0(i, "frame"), out double after), o, "ok", Ctx(i)); Num("bufAfter", after, o, "bufAfter", Ctx(i)); }
        foreach (var c in Cases(root, "sBlockEnter"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string x = Ctx(i);
            var p = new ParryRules.SBlockState { Mp = N0(i, "mp"), Mmp = 400, S = "idle", St2 = 0, SbParryT = 0, SbHoldT = 5, SbReleaseR = 9, ParryT = 7, SbCd = 0 };
            bool entered = ParryRules.SBlockEnter(ref p, N0(i, "cape"), N0(i, "shieldCdRed"));
            BoolEq("entered", entered, o, "entered", x); Num("mp", p.Mp, o, "mp", x); StrEq("s", p.S, o, "s", x); Num("st2", p.St2, o, "st2", x); Num("sbParryT", p.SbParryT, o, "sbParryT", x); Num("holdT", p.SbHoldT, o, "holdT", x); Num("releaseR", p.SbReleaseR, o, "releaseR", x); Num("parryT", p.ParryT, o, "parryT", x); Num("sbCd", p.SbCd, o, "sbCd", x);
        }
        foreach (var c in Cases(root, "sBlockTick")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var p = new ParryRules.SBlockState { Mp = N0(i, "mp"), Mmp = N0(i, "mmp"), SbParryT = N0(i, "sbParryT"), SbHoldT = N0(i, "holdT") }; ParryRules.SBlockTick(ref p, N0(i, "sp")); string x = Ctx(i); Num("mp", p.Mp, o, "mp", x); Num("sbParryT", p.SbParryT, o, "sbParryT", x); Num("holdT", p.SbHoldT, o, "holdT", x); }
        foreach (var c in Cases(root, "sBlockRelease")) { var i = c.GetProperty("in"); var o = c.GetProperty("out"); var p = new ParryRules.SBlockState { S = "sBlock", SbHoldT = N0(i, "holdT"), SbParryT = 7, SbReleaseR = 0 }; ParryRules.SBlockRelease(ref p); string x = Ctx(i); StrEq("s", p.S, o, "s", x); Num("sbParryT", p.SbParryT, o, "sbParryT", x); Num("releaseR", p.SbReleaseR, o, "releaseR", x); Num("holdT", p.SbHoldT, o, "holdT", x); }

        var receipt = new { schema = "exoduser.unity.dash-parry-oracle-result.v1", checks, failures = bad, oracleSha = root.GetProperty("source").GetProperty("sha256").GetString(), sections = perSection.ToDictionary(k => k.Key, k => new { checks = k.Value[0], failures = k.Value[1] }), firstFailures };
        File.WriteAllText(args[0], JsonSerializer.Serialize(receipt, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("DASH_PARRY_ORACLE " + checks + " checks / " + bad + " failures");
        foreach (var f in firstFailures.Take(20)) Console.WriteLine("  " + f);
        return bad == 0 ? 0 : 1;
    }
}
