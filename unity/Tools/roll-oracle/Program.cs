// PC-B07 roll oracle check: Simulation.Roll.cs / RollRules.cs against oracle.json (produced by export.cjs from the ORIGINAL web functions).
// usage: RollTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

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
    static bool Eq(double a, double b) { return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }
    static bool EqF(double a, double b) { return Math.Abs(a - b) <= 1e-3; }   // Player X / Y / Facing are float32 in the port, doubles in the web
    static double N(JsonElement e, string k) { return e.GetProperty(k).ValueKind == JsonValueKind.Null ? double.NaN : e.GetProperty(k).GetDouble(); }
    static string S(JsonElement e, string k) { var v = e.GetProperty(k); return v.ValueKind == JsonValueKind.Null ? null : v.GetString(); }
    static bool B(JsonElement e, string k) { return e.GetProperty(k).GetBoolean(); }
    static IEnumerable<JsonElement> Cases(JsonElement root, string name) { section = name; perSection[name] = new int[2]; return root.GetProperty("sections").GetProperty(name).EnumerateArray(); }
    static Simulation NewSim() { var s = new Simulation(new SimulationConfig()); s.Random01 = () => .5; s.CanMove = (x, y, r) => true; return s; }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        // ---- constants ----
        section = "constants"; perSection[section] = new int[2];
        { var c = root.GetProperty("sections").GetProperty("constants");
          Check(Eq(c.GetProperty("dist").GetDouble(), RollRules.Dist), "dist"); Check(c.GetProperty("frames").GetInt32() == RollRules.Frames, "frames");
          Check(c.GetProperty("iframes").GetInt32() == RollRules.Iframes, "iframes"); Check(Eq(c.GetProperty("cost").GetDouble(), RollRules.GaugeCost), "cost"); }
        // ---- _canRoll ----
        foreach (var t in Cases(root, "canRoll"))
        {
            var i = t.GetProperty("in"); double moveT = N(i, "moveT"); if (double.IsNaN(moveT)) moveT = 0;   // undefined > 0 is false
            Check(RollRules.CanRoll(moveT, i.GetProperty("gauge").GetDouble()) == t.GetProperty("out").GetBoolean(), i.GetRawText());
            if (moveT == 0) { var s = NewSim(); s.HarpGauge = i.GetProperty("gauge").GetDouble(); Check(s.CanRollNow == t.GetProperty("out").GetBoolean(), "sim " + i.GetRawText()); }
        }
        // ---- activateRoll (Simulation.StartRoll) ----
        foreach (var t in Cases(root, "activateRoll"))
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out"); var a = i.GetProperty("act");
            var s = NewSim(); string st = i.GetProperty("state").GetString();
            // states the Unity port has (the web whirlwind / beam skills do not exist here): they map to idle with the same kept-state rule
            s.Player.State = st; s.Player.KiChargeActive = B(i, "kiCharging"); s.Player.Iframes = (float)i.GetProperty("iframes").GetDouble(); s.HarpGauge = i.GetProperty("gauge").GetDouble();
            s.SetRollInput(B(a, "up"), B(a, "down"), B(a, "left"), B(a, "right"), false);
            if (st == "stagger") { s.Player.StateTicks = 3; }
            if (!s.CanRollNow) { Check(Eq(o.GetProperty("gauge").GetDouble(), s.HarpGauge), "refused keeps gauge " + i.GetRawText()); continue; }
            s.StartRoll(i.GetProperty("dir").GetInt32());
            string ctx = i.GetRawText();
            Check(Eq(N(o, "gauge"), s.HarpGauge), "gauge " + ctx + " C#=" + s.HarpGauge);
            bool keeps = st == "sDraw" || st == "kiGather" || B(i, "kiCharging");
            string wantState = S(o, "s");
            if (st == "whirlwind" || st == "beam") wantState = "bladeDash";   // no such state here: web sets bladeDash and remembers it
            Check(s.Player.State == wantState, "state " + ctx + " C#=" + s.Player.State + " web=" + wantState);
            if (!keeps) Check(Eq(N(o, "st2"), s.Player.StateTicks), "st2 " + ctx);
            Check(Eq(N(o, "moveT"), s.RollMoveT), "moveT " + ctx);
            Check(Eq(N(o, "ang"), s.RollAngle), "ang " + ctx + " C#=" + s.RollAngle);
            Check(B(o, "roll") == s.RollActive, "roll flag " + ctx);
            string pre = S(o, "pre"); Check((pre == "sBlock" ? "sBlock" : null) == s.PreRollState, "pre " + ctx + " C#=" + s.PreRollState + " web=" + pre);
            Check(EqF(N(o, "facing"), s.Player.Facing), "facing " + ctx);
            Check(Eq(N(o, "iframes"), s.Player.Iframes), "iframes " + ctx);
            string cells = S(o, "cells"); Check(cells == RollRules.CellsLeft(s.HarpGauge) + "/" + RollRules.CellsMax(s.HarpGaugeMax), "floater " + ctx + " web=" + cells);
        }
        // ---- _tickBladeDash roll branch + _finishRoll ----
        foreach (var t in Cases(root, "trajectory"))
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out"); string ctx = i.GetRawText();
            var s = NewSim(); double ang = i.GetProperty("ang").GetDouble(); string pre = S(i, "pre"); bool parry = B(i, "parry");
            if (!i.GetProperty("wall").ValueKind.Equals(JsonValueKind.Null)) { double wall = i.GetProperty("wall").GetDouble(); s.CanMove = (x, y, r) => x < wall; }
            s.Player.X = 1000; s.Player.Y = 500; s.Player.Mana = (float)i.GetProperty("mp").GetDouble();
            s.SetPlayerCombatInput(parry, false, false);
            if (pre == "sBlock") s.Player.State = "sBlock";
            // reproduce activateRoll with the recorded angle through the cardinal / diagonal inputs: use dir + perpendicular keys that give exactly this angle when possible, else drive the angle directly
            s.StartRollAngle(ang);
            int n = 0;
            foreach (var f in o.GetProperty("frames").EnumerateArray())
            {
                s.TickRoll(); n++;
                string c2 = ctx + " frame " + n;
                Check(EqF(N(f, "x"), s.Player.X) && EqF(N(f, "y"), s.Player.Y), "pos " + c2 + " C#=" + s.Player.X + "," + s.Player.Y + " web=" + N(f, "x") + "," + N(f, "y"));
                Check(Eq(N(f, "moveT"), s.RollMoveT), "moveT " + c2 + " C#=" + s.RollMoveT);
                Check(B(f, "roll") == s.RollActive, "roll flag " + c2);
                string ws = S(f, "s"); Check(ws == s.Player.State, "state " + c2 + " C#=" + s.Player.State + " web=" + ws);
            }
            Check(!s.RollActive, "finished " + ctx);
        }
        // ---- u_n02 ----
        foreach (var t in Cases(root, "blinkWeak"))
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out"); var s = NewSim(); s.Player.X = 1000; s.Player.Y = 500;
            s.UniqueBlinkWeak = i.GetProperty("v").GetDouble(); var es = new List<EnemyState>();
            foreach (var e in i.GetProperty("enemies").EnumerateArray())
                es.Add(new EnemyState { X = (float)N(e, "x"), Y = (float)N(e, "y"), Radius = (float)N(e, "r"), Alive = B(e, "alive"), BlinkWeak = N(e, "_blinkWeak") });
            s.Enemies.AddRange(es);
            s.StartRollAngle(i.GetProperty("ang").GetDouble(), applyPathOnly: true);
            int k = 0;
            foreach (var w in o.EnumerateArray()) { Check(Eq(N(w, "weak"), es[k].BlinkWeak) && Eq(N(w, "t"), es[k].BlinkWeakTicks), "enemy " + k + " " + i.GetProperty("ang") + " C#=" + es[k].BlinkWeak + "/" + es[k].BlinkWeakTicks + " web=" + w.GetRawText()); k++; }
        }
        // ---- u_d06 ----
        foreach (var t in Cases(root, "warpRefund"))
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out"); double gauge = i.GetProperty("gauge").GetDouble(), cost = i.GetProperty("cost").GetDouble(), v = i.GetProperty("v").GetDouble(); int warpT = i.GetProperty("warpT").GetInt32();
            double got = gauge; int tok = warpT;
            if (tok > 0) { tok = 0; if (v > 0 && cost > 0) got = Math.Min(225, gauge + RollRules.WarpRefund(cost, v, gauge, 225)); }
            Check(Eq(N(o, "gauge"), got) && (tok > 0 ? 1 : 0) == (N(o, "warpT") > 0 ? 1 : 0), i.GetRawText() + " C#=" + got);
            // the same through the simulation: a roll costs 45
            if (cost == 45)
            {
                var s = NewSim(); s.HarpGauge = gauge < 45 ? 45 : gauge; s.UniqueWarpStepRefund = v; s.WarpStepRefundTicks = warpT; double g0 = s.HarpGauge;
                s.StartRoll(0); double want = Math.Max(0, g0 - 45); if (warpT > 0 && v > 0) want = Math.Min(225, want + Math.Min(45 * v, Math.Max(0, 225 - want)));
                Check(Eq(want, s.HarpGauge) && s.WarpStepRefundTicks == 0 == (warpT > 0 || s.WarpStepRefundTicks == 0), "sim refund " + i.GetRawText());
            }
        }

        int total = 0; foreach (var kv in perSection) total += kv.Value[0];
        var sb = new System.Text.StringBuilder("{\"checks\":" + checks + ",\"failures\":" + bad + ",\"sections\":{");
        bool first = true; foreach (var kv in perSection) { if (!first) sb.Append(','); first = false; sb.Append("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failures\":" + kv.Value[1] + "}"); }
        sb.Append("},\"firstFailures\":[");
        for (int k = 0; k < firstFailures.Count; k++) { if (k > 0) sb.Append(','); sb.Append(JsonSerializer.Serialize(firstFailures[k])); }
        sb.Append("]}");
        File.WriteAllText(args[0], sb.ToString());
        Console.WriteLine(checks + " checks, " + bad + " failures");
        foreach (var f in firstFailures) Console.WriteLine("FAIL " + f);
        return bad == 0 ? 0 : 1;
    }
}
