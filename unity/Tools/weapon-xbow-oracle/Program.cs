// PC-B05 weapon / crossbow oracle check: WeaponCatalog.cs and Simulation.Crossbow.cs against oracle.json (export.cjs runs the ORIGINAL web functions and loops).
// usage: WeaponXbowTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
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
        if (!ok) { bad++; c[1]++; if (c[1] <= 4) firstFailures.Add(section + ": " + detail); }
    }
    static bool Eq(double a, double b) { return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }
    static bool Near(double a, double b) { return Math.Abs(a - b) <= 1e-6 * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }
    static void Begin(string name) { section = name; perSection[name] = new int[2]; }

    static Func<double> Lcg(uint seed) { uint s = seed; return () => { s = unchecked(s * 1664525u + 1013904223u); return s / 4294967296.0; }; }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var sections = doc.RootElement.GetProperty("sections");

        // ---- WTYPES / BOWTYPES / RARITY_MUL ----
        Begin("catalog");
        { var c = sections.GetProperty("catalog");
          var wk = c.GetProperty("WTYPE_KEYS"); Check(wk.GetArrayLength() == WeaponCatalog.MeleeKeys.Length, "melee count");
          int i = 0; foreach (var k in wk.EnumerateArray())
          {
              string key = k.GetString(); var w = c.GetProperty("WTYPES").GetProperty(key); var d = WeaponCatalog.Melee(key);
              Check(d != null && WeaponCatalog.MeleeKeys[i] == key, "melee key " + key); i++; if (d == null) continue;
              Check(Eq(w.GetProperty("atkMul").GetDouble(), d.AtkMul) && Eq(w.GetProperty("stCost").GetDouble(), d.StCost) && Eq(w.GetProperty("spdMul").GetDouble(), d.SpdMul) && Eq(w.GetProperty("arcW").GetDouble(), d.ArcW)
                    && Eq(w.GetProperty("range").GetDouble(), d.Range) && Eq(w.GetProperty("stagger").GetDouble(), d.Stagger), "melee numbers " + key);
          }
          var bk = c.GetProperty("BTYPE_KEYS"); Check(bk.GetArrayLength() == WeaponCatalog.BowKeys.Length, "bow count"); i = 0;
          foreach (var k in bk.EnumerateArray())
          {
              string key = k.GetString(); var b = c.GetProperty("BOWTYPES").GetProperty(key); var d = WeaponCatalog.Bow(key);
              Check(WeaponCatalog.BowKeys[i] == key && d.Key == key, "bow key " + key); i++;
              Check(Eq(b.GetProperty("atkMul").GetDouble(), d.AtkMul) && Eq(b.GetProperty("stCost").GetDouble(), d.StCost) && Eq(b.GetProperty("spdMul").GetDouble(), d.SpdMul)
                    && Eq(b.GetProperty("range").GetDouble(), d.Range) && Eq(b.GetProperty("projSpd").GetDouble(), d.ProjSpeed), "bow numbers " + key);
          }
          var rm = c.GetProperty("RARITY_MUL"); Check(rm.GetArrayLength() == WeaponCatalog.RarityMul.Length, "rarity count");
          for (int r = 0; r < rm.GetArrayLength(); r++) Check(Eq(rm[r].GetDouble(), WeaponCatalog.RarityMul[r]), "rarity " + r);
          Check(WeaponCatalog.Bow("bogus").Key == "crossbow" && WeaponCatalog.Bow(null).Key == "crossbow", "unknown bow type falls back to crossbow"); }

        // ---- _autoBowSpec ----
        Begin("autoBowSpec");
        foreach (var t in sections.GetProperty("autoBowSpec").EnumerateArray())
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out");
            var s = new Simulation(new SimulationConfig()); var c = s.Crossbow;
            c.Type = i.GetProperty("btype").ValueKind == JsonValueKind.Null ? "crossbow" : i.GetProperty("btype").GetString();   // bw().btype||'crossbow'; BOWTYPES[..]||crossbow is the catalog fallback
            c.BowRange = i.GetProperty("bowRange").ValueKind == JsonValueKind.Null ? 0 : i.GetProperty("bowRange").GetDouble();
            c.BonusRange = i.GetProperty("bonusRange").ValueKind == JsonValueKind.Null ? 0 : i.GetProperty("bonusRange").GetDouble();
            c.ProjSpeed = i.GetProperty("projSpd").ValueKind == JsonValueKind.Null ? 0 : i.GetProperty("projSpd").GetDouble();
            c.PassiveBow = i.GetProperty("pBow").GetDouble();
            double range, speed; s.AutoBowSpec(out range, out speed);
            Check(Near(range, o.GetProperty("range").GetDouble()) && Near(speed, o.GetProperty("spd").GetDouble()), i.GetRawText() + " C#=" + range + "/" + speed + " web=" + o.GetRawText());
        }

        // ---- full scenarios: auto fire + damage + pierce + wall bounce + kill pierce + pool, frame by frame ----
        Begin("scenarios"); int sn = 0;
        foreach (var t in sections.GetProperty("scenarios").EnumerateArray())
        {
            var i = t.GetProperty("in"); var o = t.GetProperty("out"); string tag = "scenario " + (sn++) + " ";
            var rng = Lcg((uint)i.GetProperty("seed").GetInt32());
            var cfg = new SimulationConfig { PlayerBaseAttack = i.GetProperty("baseAtk").GetInt32(), PlayerCriticalChance = (float)i.GetProperty("crit").GetDouble(), PlayerMaxStamina = 100 };
            var p = i.GetProperty("passives"); cfg.PassiveHuman = p.GetProperty("pHuman").GetInt32();
            var sim = new Simulation(cfg) { Random01 = rng };
            sim.Player.Level = i.GetProperty("lv").GetInt32(); sim.Player.BaseAttack = i.GetProperty("baseAtk").GetInt32();
            sim.Player.X = (float)i.GetProperty("player").GetProperty("x").GetDouble(); sim.Player.Y = (float)i.GetProperty("player").GetProperty("y").GetDouble();
            sim.Player.Hp = 300; sim.Player.MaxHp = 300; sim.Player.MaxStamina = (float)i.GetProperty("maxStamina").GetDouble(); sim.Player.Stamina = (float)i.GetProperty("stamina").GetDouble();
            var walls = new List<double[]>(); foreach (var w in i.GetProperty("walls").EnumerateArray()) walls.Add(new[] { w[0].GetDouble(), w[1].GetDouble(), w[2].GetDouble(), w[3].GetDouble() });
            sim.IsProjectileWall = (x, y) => { foreach (var w in walls) if (x >= w[0] && x < w[0] + w[2] && y >= w[1] && y < w[1] + w[3]) return true; return false; };
            var c = sim.Crossbow; var bow = i.GetProperty("bow"); var aff = i.GetProperty("aff");
            c.Equipped = true; c.Type = bow.GetProperty("btype").GetString(); c.Atk = bow.GetProperty("atk").GetDouble(); c.EnhanceAtk = bow.GetProperty("enh").GetDouble() * .25;
            double flat = 0; foreach (var a in bow.GetProperty("affixes").EnumerateArray()) flat += a.GetProperty("value").GetDouble();
            c.SlotFlatAtk = flat; c.BowSpd = bow.GetProperty("bowSpd").GetDouble() != 0 ? bow.GetProperty("bowSpd").GetDouble() : 1; c.BowRange = bow.GetProperty("bowRange").GetDouble();
            c.BonusRange = bow.GetProperty("bonusRange").GetDouble(); c.ProjSpeed = bow.GetProperty("bowProjSpd").GetDouble(); c.Element = bow.GetProperty("el").GetInt32();
            c.DexFlat = i.GetProperty("dex").GetDouble();   // STATS.dex = 0 in the harness: _eqStat('Dex') = dex, the level part comes from _lvB()
            c.PierceFlat = aff.GetProperty("pierceFlat").GetDouble(); c.StCostRed = aff.GetProperty("stCostRed").GetDouble();
            c.PassiveAtk = p.GetProperty("pAtk").GetDouble(); c.PassiveBow = p.GetProperty("pBow").GetDouble(); c.PassiveXbow = p.GetProperty("pXbow").GetDouble();
            c.FanShotLevel = i.GetProperty("fan").GetInt32(); c.LegendaryBowCrit = i.GetProperty("legendary").GetBoolean();
            var enemies = new List<EnemyState>(); var hp = new List<long>(); foreach (var e in i.GetProperty("enemies").EnumerateArray())
            {
                var en = new EnemyState { Etype = 0, X = (float)e.GetProperty("x").GetDouble(), Y = (float)e.GetProperty("y").GetDouble(), Radius = (float)e.GetProperty("r").GetDouble(), Hp = int.MaxValue, MaxHp = int.MaxValue };
                enemies.Add(en); hp.Add((long)e.GetProperty("hp").GetDouble()); sim.Enemies.Add(en);
            }
            var events = new List<string>(); int frameNo = 0;
            sim.BoltHurt = (e, dmg, ang) => { events.Add(frameNo + "," + sim.Enemies.IndexOf(e) + "," + dmg); rng(); int k = sim.Enemies.IndexOf(e); hp[k] -= dmg; if (hp[k] <= 0) e.Alive = false; };
            var toggles = new HashSet<int>(); foreach (var tg in i.GetProperty("toggles").EnumerateArray()) toggles.Add(tg.GetInt32());
            for (int k = 0; k < i.GetProperty("poolPrime").GetInt32(); k++) sim.BoltFreeCount++;
            var frames = o.GetProperty("frames");
            int f = 0; bool stop = false;
            foreach (var wf in frames.EnumerateArray())
            {
                frameNo = f;
                if (toggles.Contains(f)) sim.ToggleCrossbowAuto();
                sim.TickCrossbow();
                var wb = wf.GetProperty("bolts"); string at = tag + "frame " + f + " ";
                Check(sim.Bolts.Count == wb.GetArrayLength(), at + "bolt count C#=" + sim.Bolts.Count + " web=" + wb.GetArrayLength());
                if (sim.Bolts.Count != wb.GetArrayLength()) { stop = true; break; }
                for (int b = 0; b < sim.Bolts.Count; b++)
                {
                    var cb = sim.Bolts[b]; var web = wb[b];
                    bool ok = Near(cb.X, web[0].GetDouble()) && Near(cb.Y, web[1].GetDouble()) && Near(cb.Vx, web[2].GetDouble()) && Near(cb.Vy, web[3].GetDouble()) && cb.Damage == (int)web[4].GetDouble()
                        && Near(cb.Dist, web[5].GetDouble()) && Near(cb.MaxDist, web[6].GetDouble()) && cb.Bounces == (int)web[7].GetDouble() && cb.Pierced == (int)web[8].GetDouble()
                        && Eq(cb.Fresh ? -1 : cb.PierceRate, web[9].GetDouble()) && cb.HitSet.Count == (int)web[10].GetDouble() && cb.Element == (int)web[11].GetDouble();
                    Check(ok, at + "bolt " + b + " C#=(" + cb.X + "," + cb.Y + "," + cb.Damage + "," + cb.Dist + "," + cb.Bounces + "," + cb.Pierced + "," + (cb.Fresh ? -1 : cb.PierceRate) + "," + cb.HitSet.Count + ") web=" + web.GetRawText());
                }
                Check(Eq(sim.CrossbowTimer, wf.GetProperty("timer").GetDouble()), at + "timer C#=" + sim.CrossbowTimer + " web=" + wf.GetProperty("timer").GetDouble());
                Check(Math.Abs(sim.Player.Stamina - wf.GetProperty("st").GetDouble()) < 1e-3, at + "stamina C#=" + sim.Player.Stamina + " web=" + wf.GetProperty("st").GetDouble());
                Check(sim.BoltFreeCount == wf.GetProperty("free").GetInt32(), at + "free C#=" + sim.BoltFreeCount + " web=" + wf.GetProperty("free").GetInt32());
                string alive = ""; foreach (var e in enemies) alive += e.Alive ? "1" : "0";
                Check(alive == wf.GetProperty("alive").GetString(), at + "alive C#=" + alive + " web=" + wf.GetProperty("alive").GetString());
                f++;
            }
            if (stop) continue;
            var webEvents = new List<string>(); foreach (var e in o.GetProperty("events").EnumerateArray()) webEvents.Add(e[0].GetInt32() + "," + e[1].GetInt32() + "," + e[2].GetInt32());
            Check(string.Join(";", events) == string.Join(";", webEvents), tag + "hit events C#=" + string.Join(";", events) + " web=" + string.Join(";", webEvents));
        }

        string receipt = JsonSerializer.Serialize(new { passed = bad == 0, checks, failures = bad, perSection, firstFailures });
        File.WriteAllText(args[0], receipt); Console.WriteLine(receipt);
        return bad == 0 ? 0 : 1;
    }
}
