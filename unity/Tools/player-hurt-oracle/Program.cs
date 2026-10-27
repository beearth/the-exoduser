// PC-B09 oracle check: Simulation.HurtPlayer (Runtime/Core/Simulation.PlayerHurt.cs) against oracle.json (produced by export.cjs from the ORIGINAL hurtP of game.html).
// usage: PlayerHurtTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static readonly List<string> firstFailures = new List<string>();
    static readonly Dictionary<string, int> failKinds = new Dictionary<string, int>();

    static void Check(bool ok, string what, string ctx)
    {
        checks++;
        if (ok) return;
        bad++; failKinds[what] = failKinds.ContainsKey(what) ? failKinds[what] + 1 : 1;
        if (failKinds[what] <= 3) firstFailures.Add(what + " :: " + ctx);
    }
    static bool Near(double a, double b, double tol = 1e-3) { return Math.Abs(a - b) <= tol * Math.Max(1, Math.Abs(b)); }
    static double N(JsonElement e, string k) { if (!e.TryGetProperty(k, out var v) || v.ValueKind == JsonValueKind.Null) return 0; if (v.ValueKind == JsonValueKind.True) return 1; if (v.ValueKind == JsonValueKind.False) return 0; return v.GetDouble(); }
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }
    static string S(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null; }

    // web addTxt strings carry emoji / symbols the native floaters do not: drop surrogates, U+2190-2BFF symbols and variation selectors, then trim
    static string Plain(string s)
    {
        var sb = new StringBuilder();
        foreach (char c in s) { if (char.IsSurrogate(c) || (c >= 0x2190 && c <= 0x2BFF) || c == 0xFE0F) continue; sb.Append(c); }
        return sb.ToString().Trim();
    }

    sealed class Seen { public List<ReviveText> Texts = new List<ReviveText>(); public int Draws; }

    static Simulation Build(JsonElement i, double[] rng, Seen seen)
    {
        var cfg = new SimulationConfig { PlayerMaxHp = (int)N(i, "mhp"), PlayerMaxShield = (float)N(i, "mshield"), PlayerStartingShield = (float)N(i, "shield"), PlayerPhysicalDefense = (float)N(i, "baseDef"), PlayerEnergyDefense = (float)N(i, "edef"), EnemyAiEnabled = false };
        var s = new Simulation(cfg);
        int idx = 0; s.Random01 = () => { seen.Draws++; return rng[idx++ % rng.Length]; };
        s.ReviveTextRaised += t => seen.Texts.Add(t);
        var p = s.Player;
        p.X = 100; p.Y = 200; p.Hp = (float)N(i, "hp"); p.Level = (int)N(i, "level"); p.State = S(i, "state"); p.StateTicks = (float)N(i, "st2");
        p.Poise = (float)N(i, "poise"); p.Iframes = (float)N(i, "iframes"); p.ShieldRegenTicks = (float)N(i, "shieldRegenT"); p.KiChargeActive = B(i, "kiCharge");
        s.SbParryT = N(i, "sbParryT"); s.Crossbow.DexFlat = N(i, "dex"); s.DodgeAffix = N(i, "dodge"); s.CcRes = N(i, "ccRes"); s.StunRes = N(i, "stunRes"); s.PGuard = N(i, "pGuard"); s.ShieldBlockDR = N(i, "shieldBlockDR");
        return s;
    }

    static HurtOptions Opts(JsonElement i)
    {
        var o = new HurtOptions();
        if (!i.TryGetProperty("opts", out var w) || w.ValueKind != JsonValueKind.Object) return o;
        if (B(w, "dot")) o.Dot = true;
        string dt = S(w, "dtype"); if (dt == "magic" || dt == "parry") o.Magic = true;
        if (w.TryGetProperty("ang", out var a) && a.ValueKind == JsonValueKind.Number) { o.HasAngle = true; o.Angle = (float)a.GetDouble(); }
        if (w.TryGetProperty("src", out var sr) && sr.ValueKind == JsonValueKind.Object) { o.HasSource = true; o.SrcX = (float)N(sr, "x"); o.SrcY = (float)N(sr, "y"); }
        return o;
    }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement;
        var cases = root.GetProperty("sections").GetProperty("hurt").EnumerateArray().ToArray();
        int shown = 0;
        foreach (var c in cases)
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out");
            var rng = c.GetProperty("rng").EnumerateArray().Select(x => x.GetDouble()).ToArray();
            var seen = new Seen(); var sim = Build(i, rng, seen);
            string inState = S(i, "state"); int parryBefore = sim.ParryCount;
            sim.HurtPlayer((int)N(i, "dmg"), Opts(i));
            var p = sim.Player; string ctx = i.GetRawText();
            bool died = inState != "fallen" && inState != "dead" && p.State == "fallen";
            Check(died == B(o, "died"), "died", ctx + " C#=" + died);
            Check(sim.ParryCount - parryBefore == (int)N(o, "parryCalls"), "parry", ctx + " C#=" + (sim.ParryCount - parryBefore) + " web=" + N(o, "parryCalls"));
            Check(seen.Draws == (int)N(o, "rng") + (died ? 1 : 0), "rngDraws", ctx + " C#=" + seen.Draws + " web=" + N(o, "rng"));
            if (N(o, "parryCalls") > 0) { shown++; continue; }   // a parried hit is the B07 doParry path (Simulation.ApplyParrySuccess, covered by dash-parry-oracle): only the call itself is compared
            var wp = o.GetProperty("p");
            if (!died) Check(Near(p.Hp, N(wp, "hp")), "hp", ctx + " C#=" + p.Hp + " web=" + N(wp, "hp"));
            else Check(p.Hp <= 0 && N(wp, "hp") <= 0, "hpDied", ctx + " C#=" + p.Hp + " web=" + N(wp, "hp"));
            Check(Near(p.Shield, N(wp, "shield")), "shield", ctx + " C#=" + p.Shield + " web=" + N(wp, "shield"));
            Check(Near(p.ShieldRegenTicks, N(wp, "shieldRegenT")), "shieldRegenT", ctx + " C#=" + p.ShieldRegenTicks + " web=" + N(wp, "shieldRegenT"));
            Check(Near(p.Poise, N(wp, "poise")), "poise", ctx + " C#=" + p.Poise + " web=" + N(wp, "poise"));
            if (!died) { Check(p.State == S(wp, "s"), "state", ctx + " C#=" + p.State + " web=" + S(wp, "s")); Check(Near(p.StateTicks, N(wp, "st2")), "stateTicks", ctx + " C#=" + p.StateTicks + " web=" + N(wp, "st2")); }
            if (!died) Check(Near(p.Iframes, N(wp, "iframes")), "iframes", ctx + " C#=" + p.Iframes + " web=" + N(wp, "iframes"));
            Check(Near(p.KnockbackX, N(wp, "kbx"), 1e-4) && Near(p.KnockbackY, N(wp, "kby"), 1e-4), "knockback", ctx + " C#=" + p.KnockbackX + "," + p.KnockbackY + " web=" + N(wp, "kbx") + "," + N(wp, "kby"));
            Check(Near(sim.SbParryT, N(wp, "sbParryT")), "sbParryT", ctx + " C#=" + sim.SbParryT + " web=" + N(wp, "sbParryT"));
            Check(Near(sim.ShakeAmount, N(o, "shake")), "shake", ctx + " C#=" + sim.ShakeAmount + " web=" + N(o, "shake"));
            Check(Near(sim.FlashTicks, N(o, "flashT")), "flashT", ctx + " C#=" + sim.FlashTicks + " web=" + N(o, "flashT"));
            Check(Near(sim.ChromaTicks, N(o, "chromaT")), "chromaT", ctx + " C#=" + sim.ChromaTicks + " web=" + N(o, "chromaT"));
            Check(Near(sim.ScreenFlashAlpha, N(o, "scrFlashA")), "scrFlashA", ctx + " C#=" + sim.ScreenFlashAlpha + " web=" + N(o, "scrFlashA"));
            Check(Near(sim.HitFlashAlpha, N(o, "hitFlashA")), "hitFlashA", ctx + " C#=" + sim.HitFlashAlpha + " web=" + N(o, "hitFlashA"));
            if (N(o, "hitFlashA") > 0) Check(sim.HitFlashColor == S(o, "hitFlashCol"), "hitFlashCol", ctx + " C#=" + sim.HitFlashColor + " web=" + S(o, "hitFlashCol"));
            // floaters (order, position, colour, life, text without emoji)
            var wt = o.GetProperty("texts").EnumerateArray().ToArray();
            bool sameTexts = wt.Length == seen.Texts.Count;
            for (int k = 0; sameTexts && k < wt.Length; k++)
            {
                var t = seen.Texts[k];
                sameTexts = Near(t.X, N(wt[k], "x")) && Near(t.Y, N(wt[k], "y")) && t.Color == S(wt[k], "col") && t.Life == (int)N(wt[k], "life") && Plain(t.Ko).Replace(" ", "") .Length > 0 && TextMatch(t.Ko, S(wt[k], "t"));
            }
            Check(sameTexts, "texts", ctx + " C#=[" + string.Join("|", seen.Texts.Select(t => t.Y + ":" + t.Ko + ":" + t.Color + ":" + t.Life)) + "] web=" + o.GetProperty("texts").GetRawText());
            // sound events
            var ws = o.GetProperty("samples").EnumerateArray().ToArray();
            var cs = sim.Feedback.Where(f => f.Kind == FeedbackKind.Sample).ToArray();
            bool sameSamples = ws.Length == cs.Length;
            for (int k = 0; sameSamples && k < ws.Length; k++)
                sameSamples = cs[k].SampleKey == S(ws[k], "key") && Near(cs[k].Volume, N(ws[k], "vol"), 1e-6) && Near(cs[k].Rate, N(ws[k], "rate"), 1e-5) && Near(cs[k].QueuedRate, N(ws[k], "queued"), 1e-5);
            Check(sameSamples, "samples", ctx + " C#=" + string.Join("|", cs.Select(f => f.SampleKey + "@" + f.Volume + "/" + f.Rate)) + " web=" + o.GetProperty("samples").GetRawText());
            shown++;
        }
        var receipt = new { schema = "exoduser.unity.player-hurt-oracle.receipt.v1", cases = shown, checks, failures = bad, failKinds, firstFailures = firstFailures.Take(12).ToArray() };
        File.WriteAllText(args[0], JsonSerializer.Serialize(receipt, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }));
        Console.WriteLine("cases " + shown + " checks " + checks + " failures " + bad);
        foreach (var f in firstFailures.Take(8)) Console.WriteLine("FAIL " + f.Substring(0, Math.Min(500, f.Length)));
        return bad > 0 ? 1 : 0;
    }

    // C# floater (Korean) vs the web text: equal after dropping emoji; the percentage floaters begin with the web prefix text
    static bool TextMatch(string cs, string web) { return Plain(cs) == Plain(web); }
}
