using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// BX-02/03/05 oracle: replays oracle.json (the ORIGINAL game.html druid code run in Node, see export.cjs) through Runtime/Core/DruidBoss*.cs with the same seeded
// Math.random() stream and compares, tick by tick: every draw count, the boss state fields, the hurtP / hurtE / poise / doParry call lists, the knock-back and
// player-displacement the boss caused, the projectiles it spawned (after the spawnProj multipliers / drop rule / speed roll) and all boss hazard arrays.
public static class Program
{
    sealed class Lcg { uint s; public int N; public Lcg(uint seed) { s = seed; } public double Next() { unchecked { s = s * 1664525u + 1013904223u; } N++; return s / 4294967296.0; } }

    const double W = 128 * 40, H = 108 * 40;
    static bool IsWf(double x, double y) { return x < 80 || y < 80 || x > W - 80 || y > H - 80 || (Math.Abs(x - W / 2) < 60 && Math.Abs(y - H / 2) < 60); }

    sealed class Fake : IBossHost
    {
        public Lcg Rng; public int StageIdx; public double Px, Py, Pf, Pi; public bool ParryOpen;
        public double KbX, KbY, Poison, WebSlow; public int Minions;
        public List<double[]> Ev = new List<double[]>(); public List<string> EvName = new List<string>();
        public double Rand() { return Rng.Next(); }
        public int Stage { get { return StageIdx; } }
        public double ArenaW { get { return W; } }
        public double ArenaH { get { return H; } }
        public double PX { get { return Px; } set { Px = value; } }
        public double PY { get { return Py; } set { Py = value; } }
        public double PRadius { get { return 15; } }
        public double PFacing { get { return Pf; } }
        public double PIframes { get { return Pi; } set { Pi = value; } }
        public bool PlayerAlive { get { return true; } }
        public bool ParryWindowOpen() { return ParryOpen; }
        public bool TileWall(double x, double y) { int tx = (int)(x / 40), ty = (int)(y / 40); return tx < 0 || ty < 0 || tx >= 128 || ty >= 108 || IsWf(tx * 40 + 20, ty * 40 + 20); }
        public bool IsWall(double x, double y) { return IsWf(x, y); }
        public bool CanMove(double x, double y, double r) { return !IsWf(x - r, y - r) && !IsWf(x + r, y - r) && !IsWf(x - r, y + r) && !IsWf(x + r, y + r); }
        public bool SafePoint(double x, double y, double r, out double ox, out double oy)
        {
            if (CanMove(x, y, r)) { ox = x; oy = y; return true; }
            for (double d = 40; d <= 200; d += 20) for (int a = 0; a < 8; a++)
            {
                double nx = x + Math.Cos(Math.PI / 4 * a) * d, ny = y + Math.Sin(Math.PI / 4 * a) * d;
                if (CanMove(nx, ny, r)) { ox = nx; oy = ny; return true; }
            }
            ox = x; oy = y; return false;
        }
        public bool FlowDir(double x, double y, out double dx, out double dy) { double a = Math.Atan2(Py - y, Px - x); dx = Math.Cos(a); dy = Math.Sin(a); return true; }
        public bool Los(double x, double y, double tx, double ty) { return true; }
        void Add(string n, params double[] v) { EvName.Add(n); Ev.Add(v); }
        public void HurtPlayer(int damage, bool magic) { Add("hurtP", damage, magic ? 1 : 0); }
        public void KnockPlayer(double kx, double ky) { KbX += kx; KbY += ky; }
        public void StopPlayerKnock() { KbX = 0; KbY = 0; }
        public void PlayerPoison(double stacks, double webSlow) { Poison += stacks; WebSlow = Math.Max(WebSlow, webSlow); }
        public bool TryParry(EnemyState boss, double dmgMul, double stunFrames, double poiseAmt, double knockAngle)
        {
            if (!ParryOpen) return false;
            if (boss != null && stunFrames > 0) boss.Stunned = (float)stunFrames;
            if (dmgMul > 0) Add("hurtE", Math.Truncate((100 + 50 + 0) * dmgMul * 1));
            Add("doParry");
            if (poiseAmt > 0) Add("poiseHit", poiseAmt);
            return true;
        }
        public void BossHurt(EnemyState boss, int damage, double angle) { Add("hurtE", damage); }
        public void Text(double x, double y, string ko, string color, int life) { }
        public void Shake(double n) { }
        public void Fx(string kind, double x, double y, double r) { }
        public EnemyState SpawnMinion(double x, double y, int element, int etype) { Minions++; return null; }
        public void BossMoved(EnemyState boss) { }
    }

    static int mismatches, checks;
    static readonly List<string> firstMismatches = new List<string>();
    static readonly Dictionary<string, int> byField = new Dictionary<string, int>();

    static void Bad(string where, string field, string exp, string got)
    {
        var skip = Environment.GetEnvironmentVariable("DRUID_SKIP"); if (skip != null && ("," + skip + ",").Contains("," + field + ",")) return;
        mismatches++; if (!byField.ContainsKey(field)) byField[field] = 0; byField[field]++;
        if (firstMismatches.Count < 25) firstMismatches.Add(where + " " + field + " expected " + exp + " got " + got);
    }
    static readonly bool Strict = Environment.GetEnvironmentVariable("DRUID_STRICT") == "1";
    static bool Eq(double a, double b) { return Strict ? Math.Abs(a - b) <= 2e-5 + 1e-12 * Math.Abs(a) : Math.Abs(a - b) <= 1e-3 + 1.2e-7 * Math.Abs(a); }
    static double Num(JsonElement e) { return e.ValueKind == JsonValueKind.Number ? e.GetDouble() : e.ValueKind == JsonValueKind.Null ? 0 : e.ValueKind == JsonValueKind.True ? 1 : 0; }
    static void CmpNum(string where, string field, JsonElement exp, double got) { checks++; double a = Num(exp); if (exp.ValueKind == JsonValueKind.String) { Bad(where, field, exp.GetString(), got.ToString("R")); return; } if (!Eq(a, got)) Bad(where, field, a.ToString("R"), got.ToString("R")); }
    static void CmpStr(string where, string field, JsonElement exp, string got) { checks++; string a = exp.ValueKind == JsonValueKind.String ? exp.GetString() : ""; if (a != got) Bad(where, field, a, got); }

    static string Mv(IEnumerable<string> l) { return string.Join(",", l); }

    public static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "oracle.json");
        using (var doc = JsonDocument.Parse(File.ReadAllText(path)))
        {
            var root = doc.RootElement; int cases = 0, ticks = 0;
            var movesSeen = new HashSet<string>(); var statesSeen = new HashSet<string>(); int spawns = 0, hazChase = 0, hazFis = 0, hazTide = 0, hazMine = 0, hazPool = 0, hazLava = 0, hazOrb = 0, hurtP = 0, hurtE = 0, poiseHits = 0;
            foreach (var c in root.GetProperty("cases").EnumerateArray())
            {
                cases++; string id = c.GetProperty("id").GetString();
                var host = new Fake { Rng = new Lcg((uint)c.GetProperty("seed").GetInt64()), StageIdx = c.GetProperty("stage").GetInt32() };
                var b = c.GetProperty("boss"); var pl = c.GetProperty("player"); var st = c.GetProperty("stats");
                var druid = new DruidBoss(host); druid.ProjectileFlight = false;
                druid.PStats = new DruidBoss.PlayerStats { ParryRate = Num(st.GetProperty("parryRate")), DashRate = Num(st.GetProperty("dashRate")), HealRate = Num(st.GetProperty("healRate")), KiteRate = Num(st.GetProperty("kiteRate")), AggroRate = Num(st.GetProperty("aggroRate")) };
                var spawned = new List<BossProjectile>(); druid.OnSpawn = p => spawned.Add(p);
                var e = new EnemyState { IsBoss = true, Alive = true, X = (float)Num(b.GetProperty("x")), Y = (float)Num(b.GetProperty("y")), Radius = (float)Num(b.GetProperty("r")), Hp = (int)Num(b.GetProperty("hp")), MaxHp = (int)Num(b.GetProperty("mhp")),
                    Attack = (int)Num(b.GetProperty("atk")), BaseAttack = (int)Num(b.GetProperty("baseAtk")), Speed = (float)Num(b.GetProperty("speed")), MaxPoise = (float)Num(b.GetProperty("maxPoise")), Poise = (float)Num(b.GetProperty("poise")), State = "idle" };
                var d = new DruidData { X = Num(b.GetProperty("x")), Y = Num(b.GetProperty("y")), R = Num(b.GetProperty("r")), Speed = Num(b.GetProperty("speed")), BaseSpeed = Num(b.GetProperty("speed")),
                    St2 = Num(b.GetProperty("st2")), Facing = Num(b.GetProperty("facing")), ProjT = Num(b.GetProperty("projT")), ProjCd = Num(b.GetProperty("projCd")), BossPatT = Num(b.GetProperty("bossPatT")), BossPatCd = Num(b.GetProperty("bossPatCd")),
                    BossOrbitAng = Num(b.GetProperty("_bossOrbitAng")), Atk = Num(b.GetProperty("atk")), S = "idle" };
                druid.Attach(e, d);
                host.Px = Num(pl.GetProperty("x")); host.Py = Num(pl.GetProperty("y"));
                var script = c.GetProperty("script"); int nScript = script.GetArrayLength(); int n = c.GetProperty("ticks").GetInt32(); int t = 0; double webSlowAbs = 0;
                foreach (var tk in c.GetProperty("out").EnumerateArray())
                {
                    var s = script[Math.Min(t, nScript - 1)]; string where = id + "#" + t;
                    host.Px = Num(s.GetProperty("x")); host.Py = Num(s.GetProperty("y")); host.Pf = Num(s.GetProperty("f"));
                    host.ParryOpen = s.TryGetProperty("parry", out var pv) && Num(pv) != 0; host.Pi = s.TryGetProperty("iframes", out var iv) ? Num(iv) : 0;
                    if (s.TryGetProperty("hp", out var hv)) e.Hp = (int)Num(hv);
                    host.Ev.Clear(); host.EvName.Clear(); host.KbX = 0; host.KbY = 0; double px0 = host.Px, py0 = host.Py, po0 = host.Poison; int draws0 = host.Rng.N; int spawned0 = spawned.Count;
                    // Simulation enemy loop (stun / revive iframes) before the boss tick
                    if (e.ReviveIframes > 0) e.ReviveIframes = Math.Max(0, e.ReviveIframes - 1);
                    if (e.Stunned > 0) e.Stunned = Math.Max(0, e.Stunned - 1);
                    if (e.Stunned <= 0 && e.MaxStunned > 0) e.MaxStunned = 0;
                    druid.TickBoss(e);
                    druid.TickWorld(true);
                    ticks++;
                    var es = tk.GetProperty("e"); var dd = druid.Data[e];
                    if (Environment.GetEnvironmentVariable("DRUID_TRACE") == id && Math.Abs(Num(es.GetProperty("x")) - dd.X) > 1e-9) { Console.WriteLine("TRACE " + where + " x exp " + Num(es.GetProperty("x")).ToString("R") + " got " + dd.X.ToString("R") + " s " + dd.S + " kb " + e.KnockbackX); }
                    CmpNum(where, "draws", tk.GetProperty("draws"), host.Rng.N - draws0);
                    CmpNum(where, "x", es.GetProperty("x"), dd.X); CmpNum(where, "y", es.GetProperty("y"), dd.Y);
                    CmpStr(where, "s", es.GetProperty("s"), dd.S); CmpNum(where, "st2", es.GetProperty("st2"), dd.St2); CmpNum(where, "facing", es.GetProperty("facing"), dd.Facing);
                    CmpNum(where, "hp", es.GetProperty("hp"), e.Hp); CmpNum(where, "_bossPhase", es.GetProperty("_bossPhase"), dd.BossPhase); CmpNum(where, "bossPatT", es.GetProperty("bossPatT"), dd.BossPatT);
                    CmpNum(where, "bossPatCd", es.GetProperty("bossPatCd"), dd.BossPatCd); CmpNum(where, "stunned", es.GetProperty("stunned"), e.Stunned); CmpNum(where, "atk", es.GetProperty("atk"), dd.Atk);
                    CmpNum(where, "speed", es.GetProperty("speed"), dd.Speed); CmpNum(where, "maxPoise", es.GetProperty("maxPoise"), e.MaxPoise); CmpNum(where, "_comboIdx", es.GetProperty("_comboIdx"), dd.ComboIdx);
                    CmpNum(where, "_feinting", es.GetProperty("_feinting"), dd.Feinting ? 1 : 0); CmpNum(where, "_meleeStreak", es.GetProperty("_meleeStreak"), dd.MeleeStreak); CmpNum(where, "_projChargeT", es.GetProperty("_projChargeT"), dd.ProjChargeT);
                    CmpNum(where, "projT", es.GetProperty("projT"), dd.ProjT); CmpNum(where, "shockR", es.GetProperty("shockR"), dd.ShockR); CmpNum(where, "_dashIdx", es.GetProperty("_dashIdx"), dd.DashIdx);
                    CmpNum(where, "_slashIdx", es.GetProperty("_slashIdx"), dd.SlashIdx); CmpNum(where, "_bsWave", es.GetProperty("_bsWave"), dd.BsWave); CmpNum(where, "_weaponAng", es.GetProperty("_weaponAng"), dd.WeaponAng);
                    CmpNum(where, "_ptT", es.GetProperty("_ptT"), dd.PtT); CmpNum(where, "reviveIframes", es.GetProperty("reviveIframes"), e.ReviveIframes); CmpNum(where, "_telegraphT", es.GetProperty("_telegraphT"), dd.TelegraphT);
                    CmpNum(where, "_bossOrbitAng", es.GetProperty("_bossOrbitAng"), dd.BossOrbitAng); CmpNum(where, "_bossStrafeCd", es.GetProperty("_bossStrafeCd"), dd.BossStrafeCd); CmpNum(where, "_strafeDir", es.GetProperty("_strafeDir"), dd.StrafeDir);
                    CmpNum(where, "_idleRBT", es.GetProperty("_idleRBT"), dd.IdleRBT); CmpNum(where, "_alerted", es.GetProperty("_alerted"), dd.Alerted ? 1 : 0); CmpStr(where, "_combatSt", es.GetProperty("_combatSt"), dd.CombatSt);
                    CmpNum(where, "_diveTx", es.GetProperty("_diveTx"), dd.DiveTx); CmpNum(where, "_diveTy", es.GetProperty("_diveTy"), dd.DiveTy); CmpNum(where, "_grabAng", es.GetProperty("_grabAng"), dd.GrabAng);
                    CmpNum(where, "iframes", es.GetProperty("iframes"), dd.Iframes); CmpNum(where, "kbx", es.GetProperty("kbx"), e.KnockbackX); CmpNum(where, "kby", es.GetProperty("kby"), e.KnockbackY);
                    CmpStr(where, "_lm", es.GetProperty("_lm"), Mv(dd.LastMoves)); CmpStr(where, "_cs", es.GetProperty("_cs"), dd.ComboSeq == null ? "" : string.Join(",", dd.ComboSeq));
                    double cdSum = 0; foreach (var v in dd.MoveCDs) cdSum += v; CmpNum(where, "_cd", es.GetProperty("_cd"), cdSum);
                    movesSeen.Add(druid.LastPick ?? ""); statesSeen.Add(dd.S);
                    // call lists
                    var ev = tk.GetProperty("ev"); int k = 0; checks++;
                    if (ev.GetArrayLength() != host.Ev.Count) { Bad(where, "ev.count", ev.GetArrayLength().ToString(), host.Ev.Count.ToString() + "[" + string.Join(";", host.EvName) + "]"); }
                    else foreach (var item in ev.EnumerateArray())
                    {
                        var arr = item.EnumerateArray(); var en = arr.GetEnumerator(); en.MoveNext(); string nm = en.Current.GetString(); checks++;
                        if (nm != host.EvName[k]) { Bad(where, "ev.name", nm, host.EvName[k]); k++; continue; }
                        int vi = 0; while (en.MoveNext()) { if (vi < host.Ev[k].Length) CmpNum(where, "ev." + nm + vi, en.Current, host.Ev[k][vi]); vi++; }
                        if (nm == "hurtP") hurtP++; else if (nm == "hurtE") hurtE++; else if (nm == "poiseHit") poiseHits++;
                        k++;
                    }
                    var kb = tk.GetProperty("kb"); CmpNum(where, "kb.x", kb[0], host.KbX); CmpNum(where, "kb.y", kb[1], host.KbY);
                    var pp = tk.GetProperty("pp"); CmpNum(where, "pp.x", pp[0], host.Px - px0); CmpNum(where, "pp.y", pp[1], host.Py - py0);
                    CmpNum(where, "piframes", tk.GetProperty("piframes"), host.Pi); CmpNum(where, "poison", tk.GetProperty("poison"), host.Poison - po0);
                    webSlowAbs = Math.Max(webSlowAbs, host.WebSlow); CmpNum(where, "webSlow", tk.GetProperty("webSlow"), host.WebSlow);
                    CmpNum(where, "drop", tk.GetProperty("drop"), druid.ProjDropCnt); CmpNum(where, "minions", tk.GetProperty("mq"), host.Minions);
                    // spawned projectiles
                    var sp = tk.GetProperty("spawn"); checks++;
                    if (sp.GetArrayLength() != spawned.Count - spawned0) Bad(where, "spawn.count", sp.GetArrayLength().ToString(), (spawned.Count - spawned0).ToString());
                    else { int pi = 0; foreach (var pr in sp.EnumerateArray()) { var p = spawned[spawned0 + pi++]; spawns++; var a = pr.EnumerateArray().GetEnumerator(); string tag = where + ".p" + pi;
                        double[] got = { p.X, p.Y, p.Vx, p.Vy, p.Dmg, p.El, p.Life, p.Ml, p.Sz, p.R, p.Homing ? 1 : 0, p.RedBean ? 1 : 0, p.BlackBean ? 1 : 0, p.Mine ? 1 : 0, p.ElemBall ? 1 : 0, p.DruidPoison ? 1 : 0, p.DruidStraight ? 1 : 0, p.DruidParryVolley ? 1 : 0 };
                        string[] names = { "x", "y", "vx", "vy", "dmg", "el", "life", "ml", "sz", "r", "homing", "redBean", "blackBean", "mine", "elemBall", "druidPoison", "druidStraight", "parryVolley" };
                        for (int q = 0; q < got.Length; q++) { a.MoveNext(); CmpNum(tag, "proj." + names[q], a.Current, got[q]); }
                        a.MoveNext(); CmpStr(tag, "proj.parryClass", a.Current, p.ParryClass); a.MoveNext(); CmpNum(tag, "proj.fireMagic", a.Current, p.FireMagic ? 1 : 0); a.MoveNext(); CmpNum(tag, "proj.commit", a.Current, p.Commit ? 1 : 0); } }
                    // hazards
                    var hz = tk.GetProperty("haz");
                    CmpHaz(where, "chase", hz.GetProperty("chase"), () => { var l = new List<double[]>(); foreach (var ca in druid.ChaseAoes) { var row = new List<double> { ca.Cnt, ca.T, ca.Interval, ca.Zones.Count }; foreach (var z in ca.Zones) { row.Add(z.X); row.Add(z.Y); row.Add(z.T); row.Add(z.Hit ? 1 : 0); row.Add(z.ExplT); } l.Add(row.ToArray()); } return l; }, true);
                    CmpHaz(where, "fis", hz.GetProperty("fis"), () => Rows(druid.Fissures, f => new[] { f.X, f.Y, f.Ang, f.Len, f.T, f.Exploded ? 1 : 0, f.ExplR }), false);
                    CmpHaz(where, "tide", hz.GetProperty("tide"), () => Rows(druid.TideWaves, f => new[] { f.Rad, f.T, f.HitT, f.GapAng }), false);
                    CmpHaz(where, "mine", hz.GetProperty("mine"), () => Rows(druid.SeekerMines, f => new[] { f.X, f.Y, f.Vx, f.Vy, f.T, f.ArmT, f.MaxT }), false);
                    CmpHaz(where, "pp", hz.GetProperty("pp"), () => Rows(druid.PoisonPools, f => new[] { f.X, f.Y, f.T, f.TickT, (double)f.Dmg }), false);
                    CmpHaz(where, "lava", hz.GetProperty("lava"), () => Rows(druid.LavaPools, f => new[] { f.X, f.Y, f.T, f.TickT, f.WarnT, (double)f.Dmg }), false);
                    CmpHaz(where, "orb", hz.GetProperty("orb"), () => Rows(druid.Orbs, f => new[] { f.X, f.Y, f.Vx, f.Vy, f.T, (double)f.Dmg }), false);
                    CmpNum(where, "volleyT", hz.GetProperty("vt"), druid.VolleyT); CmpNum(where, "orbT", hz.GetProperty("ot"), druid.OrbT); CmpNum(where, "volleyN", hz.GetProperty("vn"), druid.VolleyN);
                    hazChase += druid.ChaseAoes.Count > 0 ? 1 : 0; hazFis += druid.Fissures.Count > 0 ? 1 : 0; hazTide += druid.TideWaves.Count > 0 ? 1 : 0; hazMine += druid.SeekerMines.Count > 0 ? 1 : 0;
                    hazPool += druid.PoisonPools.Count > 0 ? 1 : 0; hazLava += druid.LavaPools.Count > 0 ? 1 : 0; hazOrb += druid.Orbs.Count > 0 ? 1 : 0;
                    t++;
                }
            }
            movesSeen.Remove("");
            Console.WriteLine("cases " + cases + " ticks " + ticks + " checks " + checks + " mismatches " + mismatches);
            Console.WriteLine("coverage: moves picked [" + string.Join(",", new SortedSet<string>(movesSeen)) + "] states [" + string.Join(",", new SortedSet<string>(statesSeen)) + "]");
            Console.WriteLine("coverage: projectile spawns " + spawns + ", ticks with chaseAoe " + hazChase + " fissure " + hazFis + " tide " + hazTide + " mines " + hazMine + " poisonPool " + hazPool + " lava " + hazLava + " orb " + hazOrb + ", hurtP " + hurtP + " hurtE " + hurtE + " poiseHit " + poiseHits);
            foreach (var kv in byField) Console.WriteLine("  mismatch field " + kv.Key + ": " + kv.Value);
            foreach (var m in firstMismatches) Console.WriteLine("  " + m);
            return mismatches == 0 ? 0 : 1;
        }
    }

    static List<double[]> Rows<T>(List<T> l, Func<T, double[]> f) { var r = new List<double[]>(); foreach (var x in l) r.Add(f(x)); return r; }

    // compares a web hazard array (array of number arrays; for the chase AoE the zones are nested and flattened as [cnt,t,interval,zoneCount,zone...])
    static void CmpHaz(string where, string name, JsonElement exp, Func<List<double[]>> got, bool nested)
    {
        var g = got(); checks++;
        if (exp.GetArrayLength() != g.Count) { Bad(where, "haz." + name + ".count", exp.GetArrayLength().ToString(), g.Count.ToString()); return; }
        int i = 0;
        foreach (var row in exp.EnumerateArray())
        {
            var gr = g[i++]; int j = 0;
            if (nested)
            {
                var items = row.EnumerateArray(); var it = items.GetEnumerator(); it.MoveNext(); CmpNum(where, "haz." + name + ".cnt", it.Current, gr[0]); it.MoveNext(); CmpNum(where, "haz." + name + ".t", it.Current, gr[1]); it.MoveNext(); CmpNum(where, "haz." + name + ".iv", it.Current, gr[2]);
                it.MoveNext(); var zs = it.Current; checks++;
                if (zs.GetArrayLength() != (int)gr[3]) { Bad(where, "haz." + name + ".zones", zs.GetArrayLength().ToString(), ((int)gr[3]).ToString()); continue; }
                int zi = 0; foreach (var z in zs.EnumerateArray()) { int q = 0; foreach (var zv in z.EnumerateArray()) { CmpNum(where, "haz." + name + ".z" + q, zv, gr[4 + zi * 5 + q]); q++; } zi++; }
                continue;
            }
            foreach (var v in row.EnumerateArray()) { if (j < gr.Length) CmpNum(where, "haz." + name + j, v, gr[j]); j++; }
        }
    }
}
