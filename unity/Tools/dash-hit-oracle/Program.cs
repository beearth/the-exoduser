// Chain-dash pass-through hit oracle check: compares Runtime/Core/ChainDash.cs (IsPathHit, PathHitDamage and the web constants) with oracle.json, produced by export.cjs from the
// ORIGINAL game.html loop (the `_dashActive` per-frame enemy hit loop, STR branch, run in a Node VM).
// usage: DashHitTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core.Combat;

static class P
{
    static int checks, bad, hits;
    static readonly List<string> firstFailures = new List<string>();

    static void Check(bool ok, string detail) { checks++; if (!ok) { bad++; if (firstFailures.Count < 8) firstFailures.Add(detail); } }
    static bool Eq(double a, double b) { return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }
    static double N(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDouble() : double.NaN; }
    static double N0(JsonElement e, string k) { double v = N(e, k); return double.IsNaN(v) ? 0 : v; }   // JS undefined / null used as a falsy number
    static bool B(JsonElement e, string k) { return e.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True; }

    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement;
        int caseNo = 0, frames = 0;
        foreach (var c in root.GetProperty("cases").EnumerateArray())
        {
            caseNo++;
            double cb = N0(c, "chargeBoost"), baseAtk = N0(c, "baseAtk"), dashBoost = N0(c, "dashBoost"), step = N0(c, "step");
            var armor = c.GetProperty("armor"); double charge = N0(armor, "charge"), armorEl = N0(armor, "el");
            var en = new List<JsonElement>(c.GetProperty("enemies").EnumerateArray());
            var hit = new bool[en.Count];
            var trace = new Dictionary<int, JsonElement>(); foreach (var t in c.GetProperty("trace").EnumerateArray()) trace[(int)N(t, "f")] = t;
            int total = (int)N(c, "frames"); string ctx = "case " + caseNo + " ";
            for (int f = 0; f < total; f++)
            {
                frames++; double px = f * step; var mine = new List<int>();
                for (int i = 0; i < en.Count; i++)
                    if (ChainDash.IsPathHit(px, 0, N(en[i], "x"), N(en[i], "y"), N(en[i], "r"), B(en[i], "alive"), hit[i])) { hit[i] = true; mine.Add(i); }
                JsonElement t; var want = new List<JsonElement>(); if (trace.TryGetValue(f, out t)) foreach (var h in t.GetProperty("hits").EnumerateArray()) want.Add(h);
                Check(want.Count == mine.Count, ctx + "frame " + f + " hit count C#=" + mine.Count + " web=" + want.Count);
                if (want.Count != mine.Count) continue;
                for (int k = 0; k < want.Count; k++)
                {
                    var h = want[k]; int i = mine[k]; hits++;
                    Check((int)N(h, "i") == i, ctx + "frame " + f + " enemy index C#=" + i + " web=" + N(h, "i"));
                    double ang = Math.Atan2(N(en[i], "y"), N(en[i], "x") - px);
                    Check(Eq(ang, N(h, "ang")), ctx + "angle C#=" + ang + " web=" + N(h, "ang"));
                    int dmg = ChainDash.PathHitDamage(cb, charge, baseAtk, 1, dashBoost);
                    Check(dmg == (int)N(h, "dmg"), ctx + "damage C#=" + dmg + " web=" + N(h, "dmg") + " (lv " + cb + ", charge " + charge + ", atk " + baseAtk + ", boost " + dashBoost + ")");
                    var o = h.GetProperty("opts");
                    Check(Eq(ChainDash.PathHitKnockbackMult, N(o, "kbMult")) && B(o, "poiseHit") && Eq(ChainDash.PathHitPoiseMult, N(o, "poiseMult")), ctx + "hurtE opts " + o.GetRawText());
                    Check(!B(h, "flag"), ctx + "hurtE 4th argument (dot) is false");
                    Check(Eq(armorEl, N0(h, "el")), ctx + "attack element C#=" + armorEl + " web=" + N0(h, "el"));
                    var kb = h.GetProperty("kb");
                    Check(Eq(Math.Cos(ang) * ChainDash.PathHitPush, N(kb, "x")) && Eq(Math.Sin(ang) * ChainDash.PathHitPush, N(kb, "y")), ctx + "knock-back " + kb.GetRawText());
                }
            }
        }
        var receipt = new Dictionary<string, object> { { "cases", caseNo }, { "frames", frames }, { "hits", hits }, { "checks", checks }, { "failures", bad }, { "firstFailures", firstFailures } };
        File.WriteAllText(args[0], JsonSerializer.Serialize(receipt, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("dash-hit oracle: " + caseNo + " cases, " + frames + " frames, " + hits + " hits, " + checks + " checks, " + bad + " failures");
        foreach (var s in firstFailures) Console.WriteLine("  FAIL " + s);
        return bad > 0 ? 1 : 0;
    }
}
