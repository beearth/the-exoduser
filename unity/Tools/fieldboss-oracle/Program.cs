// M1-REGION R-B oracle check: Simulation.FieldBoss.cs against oracle.json (produced by export.cjs from the ORIGINAL web code).
// usage: FieldBossTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 6) firstFailures.Add(section + ": " + detail); }
    }
    static void Begin(string name) { section = name; perSection[name] = new int[2]; }
    static int I(JsonElement e, string k) { return e.GetProperty(k).GetInt32(); }
    static double D(JsonElement e, string k) { return e.GetProperty(k).GetDouble(); }
    static bool B(JsonElement e, string k) { var v = e.GetProperty(k); return v.ValueKind == JsonValueKind.True || (v.ValueKind == JsonValueKind.Number && v.GetDouble() != 0); }
    static bool Near(double a, double b, double tol = 0.03) { return Math.Abs(a - b) <= tol; }

    static Simulation NewSim(int lv, double x, double y)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = 0, EnemyAiEnabled = false, PlayerMaxHp = 1000000000 }); var rng = new Random(5); s.Random01 = () => rng.NextDouble();
        s.Player.Level = lv; s.Player.X = (float)x; s.Player.Y = (float)y; s.Player.Hp = s.Player.MaxHp;
        s.Stage.Enabled = true; s.EnableFieldBosses();
        return s;
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;

        // ---- constants / formulas ----
        Begin("constants");
        var c0 = root.GetProperty("constants");
        foreach (var t in c0.GetProperty("hp").EnumerateArray()) Check(Simulation.FieldBossHp(I(t, "lv")) == I(t, "hp"), "_fbHp lv " + I(t, "lv"));
        {
            var sites = c0.GetProperty("sites").EnumerateArray().Select(a => new[] { a[0].GetInt32(), a[1].GetInt32() }).ToArray();
            var els = c0.GetProperty("els").EnumerateArray().Select(a => a.GetInt32()).ToArray();
            var s = NewSim(10, 0, 0); s.TickFieldBosses();
            Check(I(c0, "count") == Simulation.FieldBossCount && I(c0, "wake") == Simulation.FieldBossWake, "count / wake");
            Check(s.FieldBosses != null && s.FieldBosses.Length == 4, "four spawned on the first tick");
            for (int i = 0; i < 4; i++) { var fb = s.FieldBosses[i]; Check(Near(fb.X, (sites[i][0] + .5) * 40, 1e-9) && Near(fb.Y, (sites[i][1] + .5) * 40, 1e-9) && fb.El == els[i], "site " + i + " position / element"); }
        }
        foreach (var t in c0.GetProperty("mk").EnumerateArray())
        {
            int lv = I(t, "lv"); var w = t.GetProperty("fb"); var s = NewSim(lv, 0, 0); var fb = s.MakeFieldBoss(0, 58, 158, 2);
            string what = "_fbMk lv " + lv;
            Check(fb.X == D(w, "x") && fb.Y == D(w, "y") && fb.HomeX == D(w, "homeX") && fb.HomeY == D(w, "homeY") && fb.R == D(w, "r"), what + " geometry");
            Check(fb.Hp == D(w, "hp") && fb.MaxHp == D(w, "mhp") && fb.Atk == I(w, "atk"), what + " hp " + fb.Hp + " / atk " + fb.Atk + " web " + D(w, "hp") + " / " + I(w, "atk"));
            Check(fb.ShotCd == I(w, "shotCd") && fb.TpCd == I(w, "tpCd") && fb.TpT == I(w, "tpT") && fb.TpMax == I(w, "tpMax") && fb.Hid == B(w, "hid") && fb.SpawnIn == B(w, "spawnIn") && fb.Asleep == B(w, "asleep") && fb.EnChg == I(w, "enChg") && fb.Burst == I(w, "burst") && fb.El == I(w, "el"), what + " initial state");
        }
        Begin("faces");
        foreach (var t in root.GetProperty("faces").EnumerateArray())
        {
            var w = t.GetProperty("fb"); var fb = new FieldBossState { X = D(w, "x"), Y = D(w, "y"), T = I(w, "t"), Frame = I(w, "frame") };
            Check(Simulation.FieldBossFaceFrame(fb, D(t, "px"), D(t, "py")) == I(t, "face"), "_fbFaceFrame");
            double ex, ey; Simulation.FieldBossFeeler(fb, out ex, out ey); var e = t.GetProperty("esca");
            Check(Near(ex, D(e, "x"), 1e-9) && Near(ey, D(e, "y"), 1e-9), "_fbEsca");
        }

        // ---- scenarios ----
        Begin("scenarios");
        int sn = 0;
        foreach (var sc in root.GetProperty("scenarios").EnumerateArray())
        {
            var plan = sc.GetProperty("plan").EnumerateArray().ToList(); var trace = sc.GetProperty("trace").EnumerateArray().ToList();
            var s = NewSim(I(sc, "lv"), D(plan[0], "x"), D(plan[0], "y"));
            var sets = new[] { new HashSet<FieldBossState>(), new HashSet<FieldBossState>() };
            var webHurt = sc.GetProperty("hurtP").EnumerateArray().Select(h => new[] { I(h, "frame"), I(h, "dmg") }).ToList();
            var webShots = sc.GetProperty("shots").EnumerateArray().ToList(); var webPh = sc.GetProperty("showPH").EnumerateArray().ToList();
            int hurtIdx = 0, shotIdx = 0, phIdx = 0, evIdx = 0, ti = 0, slamsSeen = 0;
            string tag = "sc#" + sn;
            foreach (var st in plan)
            {
                int f = I(st, "f");
                s.Player.X = (float)D(st, "x"); s.Player.Y = (float)D(st, "y"); s.Player.Hp = s.Player.MaxHp; s.Player.Iframes = st.TryGetProperty("iframes", out var ifr) ? (float)ifr.GetDouble() : 0;
                int hits0 = s.FieldBossPlayerHits.Count, shots0 = s.FieldBossShotCount, slam0 = s.FieldBossSlams;
                s.TickFieldBosses();
                bool? hitRes = null;
                if (st.TryGetProperty("hit", out var h))
                {
                    int si = I(h, "set"); hitRes = s.HurtFieldMobs(D(h, "x"), D(h, "y"), D(h, "r"), D(h, "dmg"), si < 0 ? null : sets[si]);
                }
                // events of this frame
                var newHits = s.FieldBossPlayerHits.Skip(hits0).ToList(); int wh = 0; while (hurtIdx < webHurt.Count && webHurt[hurtIdx][0] == f) { wh++; hurtIdx++; }
                Check(newHits.Count == wh, tag + " f" + f + " contact hits web " + wh + " cs " + newHits.Count);
                int ns = s.FieldBossShotCount - shots0; int wsn = 0;
                while (shotIdx < webShots.Count && I(webShots[shotIdx], "frame") == f)
                {
                    var w = webShots[shotIdx]; wsn++;
                    if (ns >= wsn)
                    {
                        var spec = s.FieldBossShots[s.FieldBossShots.Count - (ns - wsn + 1)];
                        Check(Near(spec.X, D(w, "x"), 0.05) && Near(spec.Y, D(w, "y"), 0.05) && Near(spec.Vx, D(w, "vx"), 1e-3) && Near(spec.Vy, D(w, "vy"), 1e-3), tag + " f" + f + " shot geometry web " + D(w, "x").ToString("0.000") + "," + D(w, "y").ToString("0.000") + " v " + D(w, "vx").ToString("0.0000") + "," + D(w, "vy").ToString("0.0000") + " cs " + spec.X.ToString("0.000") + "," + spec.Y.ToString("0.000") + " v " + spec.Vx.ToString("0.0000") + "," + spec.Vy.ToString("0.0000"));
                        Check(spec.Dmg == D(w, "dmg") && spec.El == I(w, "el") && spec.Life == D(w, "life") && spec.Sz == D(w, "sz") && spec.R == D(w, "r") && spec.ElemBall == B(w, "elemBall"), tag + " f" + f + " shot props");
                    }
                    shotIdx++;
                }
                Check(ns == wsn, tag + " f" + f + " shots web " + wsn + " cs " + ns);
                int wp = 0; var phKinds = new List<string>(); while (phIdx < webPh.Count && I(webPh[phIdx], "frame") == f) { phKinds.Add(webPh[phIdx].GetProperty("text").GetString()); phIdx++; wp++; }
                var evs = s.Stage.Events.ToArray(); var newEv = evs.Skip(evIdx).Where(e => e.Kind == StageEventKind.AnglerWoke || e.Kind == StageEventKind.AnglerSlain).Select(e => e.Kind == StageEventKind.AnglerWoke ? "심연의 앵글러" : "필드보스 처치!").ToList(); evIdx = evs.Length;
                Check(newEv.SequenceEqual(phKinds), tag + " f" + f + " announcements web [" + string.Join("|", phKinds) + "] cs [" + string.Join("|", newEv) + "]");
                // sampled state
                if (ti < trace.Count && I(trace[ti], "f") == f)
                {
                    var tr = trace[ti++];
                    Check(Near(s.Player.X, D(tr, "px")) && Near(s.Player.Y, D(tr, "py")), tag + " f" + f + " player pushed to web " + D(tr, "px").ToString("0.00") + "," + D(tr, "py").ToString("0.00") + " cs " + s.Player.X + "," + s.Player.Y);
                    Check((hitRes.HasValue ? (hitRes.Value ? 1 : 0) : -1) == (tr.GetProperty("hitRes").ValueKind == JsonValueKind.Null ? -1 : (tr.GetProperty("hitRes").GetInt32() > 0 ? 1 : 0)), tag + " f" + f + " _hurtFieldMobs result");
                    Check(s.Stage.FieldBossDone == B(tr, "done") && s.FieldBossSpawned == B(tr, "spawned"), tag + " f" + f + " done / spawned flags");
                    var wb = tr.GetProperty("bosses").EnumerateArray().ToList();
                    Check((s.FieldBosses == null ? 0 : s.FieldBosses.Length) == wb.Count, tag + " f" + f + " list length");
                    for (int i = 0; i < wb.Count && s.FieldBosses != null && i < s.FieldBosses.Length; i++)
                    {
                        var fb = s.FieldBosses[i]; var w = wb[i];
                        if (w.ValueKind == JsonValueKind.Null) { Check(fb == null, tag + " f" + f + " slot " + i + " empty"); continue; }
                        if (fb == null) { Check(false, tag + " f" + f + " slot " + i + " missing"); continue; }
                        string what = tag + " f" + f + " b" + i;
                        Check(Near(fb.X, D(w, "x")) && Near(fb.Y, D(w, "y")) && Near(fb.TpX, D(w, "tpX")) && Near(fb.TpY, D(w, "tpY")), what + " position web " + D(w, "x").ToString("0.00") + "," + D(w, "y").ToString("0.00") + " tp " + D(w, "tpX").ToString("0.00") + "," + D(w, "tpY").ToString("0.00") + " cs " + fb.X.ToString("0.00") + "," + fb.Y.ToString("0.00") + " tp " + fb.TpX.ToString("0.00") + "," + fb.TpY.ToString("0.00"));
                        Check(fb.Hp == D(w, "hp") && fb.MaxHp == D(w, "mhp") && fb.Atk == I(w, "atk") && fb.Alive == B(w, "alive"), what + " hp " + fb.Hp + " web " + D(w, "hp") + " atk/alive");
                        Check(fb.T == I(w, "t") && fb.Frame == I(w, "frame") && fb.HitCd == I(w, "hitCd") && fb.ShotCd == I(w, "shotCd") && fb.TpCd == I(w, "tpCd") && fb.TpT == I(w, "tpT"), what + " timers t/frame/hitCd/shotCd/tpCd/tpT web " + I(w, "t") + "/" + I(w, "frame") + "/" + I(w, "hitCd") + "/" + I(w, "shotCd") + "/" + I(w, "tpCd") + "/" + I(w, "tpT") + " cs " + fb.T + "/" + fb.Frame + "/" + fb.HitCd + "/" + fb.ShotCd + "/" + fb.TpCd + "/" + fb.TpT);
                        Check(fb.Hid == B(w, "hid") && fb.SpawnIn == B(w, "spawnIn") && fb.Asleep == B(w, "asleep") && fb.Burst == I(w, "burst") && fb.BurstGap == I(w, "burstGap") && fb.EnChg == I(w, "enChg"), what + " flags hid/spawnIn/asleep/burst/gap/enChg");
                    }
                }
            }
            Check(s.FieldBossSlams == sc.GetProperty("slams").GetInt32(), tag + " landing slams web " + sc.GetProperty("slams").GetInt32() + " cs " + s.FieldBossSlams);
            Check(s.Stage.FieldBossDone == B(sc, "done"), tag + " field boss flag at the end");
            int ri = 0; foreach (var ra in sc.GetProperty("regionAlive").EnumerateArray()) { Check(s.FieldBossAliveForRegion(new RegionState { FbIdx = ri }) == ra.GetBoolean(), tag + " _regionFbAlive idx " + ri); ri++; }
            sn++;
        }

        Console.WriteLine("FIELDBOSS_RESULT " + checks + " checks / " + bad + " failures");
        foreach (var kv in perSection) Console.WriteLine("  " + kv.Key + ": " + kv.Value[0] + " checks, " + kv.Value[1] + " failures");
        foreach (var f in firstFailures) Console.WriteLine("FAIL " + f);
        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_not_Unity_runtime", passed = bad == 0, checks, failures = bad, sections = perSection.ToDictionary(k => k.Key, k => new { checks = k.Value[0], failures = k.Value[1] }), firstFailures }, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(args[0], result);
        return bad == 0 ? 0 : 1;
    }
}
