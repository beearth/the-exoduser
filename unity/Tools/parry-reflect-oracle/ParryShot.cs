// parryShot section: the five shots of a Q-parried angler energy ball (Simulation.ParryShot.cs via DruidBoss.UpdateProjectiles) against the web player projectile loop
// run as written by export.cjs (section 18), frame by frame: shots (position, velocity, damage, range, bounces, pierce count, bounce cooldown, hit set, element, pierce rate),
// every hurtE call (frame, enemy, damage, own hit / splash), enemy knock-back / stun / alive, field boss hp / hit cooldown, _parryMagicHitFx count.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

static partial class P
{
    static Func<double> Lcg(uint seed) { uint s = seed; return () => { s = unchecked(s * 1664525u + 1013904223u); return s / 4294967296.0; }; }
    static bool Near(double a, double b, double tol) { return Math.Abs(a - b) <= tol * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }

    static void CheckParryShot(JsonElement root)
    {
        int sn = 0, framesSeen = 0, hitsSeen = 0, splashSeen = 0, bounceSeen = 0, pierceSeen = 0, edgeSeen = 0;
        foreach (var c in Cases(root, "parryShot"))
        {
            var i = c.GetProperty("in"); var o = c.GetProperty("out"); string tag = "scenario " + (sn++) + " ";
            var rng = Lcg((uint)i.GetProperty("seed").GetInt32());
            var sim = new Simulation(new SimulationConfig()) { Random01 = rng };
            sim.AttachDruidBoss();
            var walls = new List<double[]>(); foreach (var w in i.GetProperty("walls").EnumerateArray()) walls.Add(new[] { w[0].GetDouble(), w[1].GetDouble(), w[2].GetDouble(), w[3].GetDouble() });
            sim.IsProjectileWall = (x, y) => { foreach (var w in walls) if (x >= w[0] && x < w[0] + w[2] && y >= w[1] && y < w[1] + w[3]) return true; return false; };
            sim.Crossbow.PierceFlat = N0(i, "pierceFlat");
            if (Has(i, "helmet"))
            {
                var h = i.GetProperty("helmet");
                var eq = new InventoryItem[InventoryState.Slots.Length];
                eq[Array.IndexOf(InventoryState.Slots, "helmet")] = new InventoryItem { slot = "helmet", rarity = 3, tier = 1, splashR = N0(h, "splashR"), splashMul = N0(h, "splashMul"), magicPen = N0(h, "magicPen") };
                sim.EquippedInventory = new InventoryState(new InventorySeedData { equipped = eq, bag = new InventoryItem[0] });
            }
            var enemies = new List<EnemyState>(); var hp = new List<double>();
            foreach (var e in i.GetProperty("enemies").EnumerateArray())
            {
                var en = new EnemyState { X = (float)N0(e, "x"), Y = (float)N0(e, "y"), Radius = (float)N0(e, "r"), Hp = int.MaxValue, MaxHp = int.MaxValue };
                if (Has(e, "el")) en.Web = new EnemySpawn { el = N0(e, "el") };   // e.el (undefined when absent: elMul is then 1)
                enemies.Add(en); hp.Add(N0(e, "hp")); sim.Enemies.Add(en);
            }
            var fbIn = i.GetProperty("fbs").EnumerateArray().ToArray();
            if (fbIn.Length > 0)
                sim.FieldBosses = fbIn.Select((m, k) => new FieldBossState { Index = k, X = N0(m, "x"), Y = N0(m, "y"), R = N0(m, "r"), Hp = N0(m, "hp"), MaxHp = N0(m, "hp"), Hid = N0(m, "hid") != 0,
                    TpT = (int)N0(m, "tpT"), TpX = N0(m, "tpX"), TpY = N0(m, "tpY"), Asleep = N0(m, "asleep") != 0, HitCd = (int)N0(m, "hitCd"), SpawnIn = false }).ToArray();
            var events = new List<string>(); int frame = 0;
            // the web stub draws one Math.random per hurtE; every own hit is followed by the splash ring particle loop (24 Math.random, presentation): skipped here
            sim.ParryShotHurt = (e, dmg, ang, splash) =>
            {
                int k = enemies.IndexOf(e); events.Add(frame + "," + k + "," + dmg + "," + (splash ? 1 : 0)); rng();
                if (!splash) for (int s = 0; s < 24; s++) rng();
                hp[k] -= dmg; if (hp[k] <= 0) e.Alive = false;
            };
            var b = i.GetProperty("ball");
            sim.Druid.AddParryShots(new ReflectProjectile { X = N0(b, "x"), Y = N0(b, "y"), Vx = N0(b, "vx"), Vy = N0(b, "vy"), El = N0(b, "el") }, N0(i, "total"), "#3388ff");
            bool stop = false; int edge = -1;
            foreach (var wf in o.GetProperty("frames").EnumerateArray())
            {
                sim.TickCount = frame;
                sim.Druid.TickWorld(false);
                if (sim.FieldBosses != null) foreach (var m in sim.FieldBosses) if (m != null && m.HitCd > 0) m.HitCd--;   // harness, same as the web side
                string at = tag + "frame " + frame + " "; framesSeen++;
                var ws = wf.GetProperty("shots"); var cs = sim.Druid.Projectiles;
                // Range end: every shot flies 7.5 px a frame (homing keeps the speed) and dies when dist > 900 = 7.5 x 120 exactly, so the 120th frame is a float knife edge:
                // 900, 900+ulp or 900-ulp depends on the last bit of cos/sin of the runtime (V8 fdlibm vs .NET). From the first frame that holds a shot at the range,
                // nothing is compared shot by shot any more; the scenario must end with no shot in both within one frame (checked below).
                bool boundary = cs.Any(p => p.Dist >= p.MaxDist - 1e-6) || ws.EnumerateArray().Any(w => w[5].GetDouble() >= 900 - 1e-6);
                if (edge < 0 && boundary) edge = frame;
                if (edge >= 0) { Check(cs.Count <= 5 && ws.GetArrayLength() <= 5, at + "range end"); edgeSeen++; frame++; continue; }
                Check(cs.Count == ws.GetArrayLength(), at + "shot count C#=" + cs.Count + " web=" + ws.GetArrayLength());
                if (cs.Count != ws.GetArrayLength()) { stop = true; break; }
                for (int k = 0; k < cs.Count; k++)
                {
                    var p = cs[k]; var w = ws[k];
                    int hitSet = (p.HitSet != null ? p.HitSet.Count : 0) + (p.HitFieldSet != null ? p.HitFieldSet.Count : 0);
                    bool ok = p.ParryMagicShot && p.Friendly && Near(p.X, w[0].GetDouble(), 1e-6) && Near(p.Y, w[1].GetDouble(), 1e-6) && Near(p.Vx, w[2].GetDouble(), 1e-6) && Near(p.Vy, w[3].GetDouble(), 1e-6)
                        && p.Dmg == w[4].GetDouble() && Near(p.Dist, w[5].GetDouble(), 1e-6) && p.Bounces == w[6].GetInt32() && p.Pierced == w[7].GetInt32() && Near(p.BounceCool, w[8].GetDouble(), 1e-9)
                        && hitSet == w[9].GetInt32() && p.El == w[10].GetInt32() && Near(p.PierceRate, w[11].GetDouble(), 1e-12);
                    Check(ok, at + "shot " + k + " C#=(" + p.X + "," + p.Y + "," + p.Vx + "," + p.Vy + "," + p.Dmg + "," + p.Dist + "," + p.Bounces + "," + p.Pierced + "," + p.BounceCool + "," + hitSet + "," + p.El + "," + p.PierceRate + ") web=" + w.GetRawText());
                    if (p.Bounces > 0) bounceSeen++; if (p.Pierced > 0) pierceSeen++;
                }
                var we = wf.GetProperty("en");
                for (int k = 0; k < enemies.Count; k++)
                {
                    var e = enemies[k]; var w = we[k];
                    Check(Near(e.KnockbackX, w[0].GetDouble(), 1e-5) && Near(e.KnockbackY, w[1].GetDouble(), 1e-5) && e.Stunned == w[2].GetDouble() && (e.Alive ? 1 : 0) == w[3].GetInt32(),
                        at + "enemy " + k + " C#=(" + e.KnockbackX + "," + e.KnockbackY + "," + e.Stunned + "," + e.Alive + ") web=" + w.GetRawText());
                }
                var wb = wf.GetProperty("fb").EnumerateArray().ToArray();
                for (int k = 0; k < wb.Length; k++)
                {
                    var m = sim.FieldBosses != null && k < sim.FieldBosses.Length ? sim.FieldBosses[k] : null;
                    if (wb[k].ValueKind == JsonValueKind.Null) { Check(m == null, at + "field boss " + k + " slain in the web, alive in C#"); continue; }
                    Check(m != null && m.Hp == wb[k][0].GetDouble() && m.HitCd == wb[k][1].GetInt32(), at + "field boss " + k + " C#=" + (m == null ? "null" : m.Hp + "/" + m.HitCd) + " web=" + wb[k].GetRawText());
                }
                Check(sim.ParryShotHits == wf.GetProperty("fx").GetInt32(), at + "_parryMagicHitFx C#=" + sim.ParryShotHits + " web=" + wf.GetProperty("fx").GetInt32());
                frame++;
            }
            if (stop) continue;
            var frames = o.GetProperty("frames"); var last = frames[frames.GetArrayLength() - 1];
            Check(last.GetProperty("shots").GetArrayLength() == 0, tag + "web scenario ends with no shot");
            for (int extra = 0; extra < 2 && sim.Druid.Projectiles.Count > 0; extra++) { sim.TickCount = frame++; sim.Druid.TickWorld(false); }
            Check(sim.Druid.Projectiles.Count == 0, tag + "C# shots end at the 900 px range within one frame of the web (left " + sim.Druid.Projectiles.Count + ")");
            var webEvents = new List<string>(); foreach (var e in o.GetProperty("events").EnumerateArray()) if (edge < 0 || e[0].GetInt32() < edge) webEvents.Add(e[0].GetInt32() + "," + e[1].GetInt32() + "," + e[2].GetInt32() + "," + e[3].GetInt32());
            if (edge >= 0) events.RemoveAll(x => int.Parse(x.Split(',')[0]) >= edge);
            Check(string.Join(";", events) == string.Join(";", webEvents), tag + "hurtE calls C#=" + string.Join(";", events.Take(12)) + " web=" + string.Join(";", webEvents.Take(12)));
            hitsSeen += webEvents.Count(x => x.EndsWith(",0")); splashSeen += webEvents.Count(x => x.EndsWith(",1"));
        }
        Check(framesSeen >= 4000 && hitsSeen >= 300 && splashSeen >= 300 && bounceSeen > 0 && pierceSeen > 0, "coverage frames " + framesSeen + " hits " + hitsSeen + " splash " + splashSeen + " bounce " + bounceSeen + " pierce " + pierceSeen);
        Console.WriteLine("PARRY_SHOT frames " + framesSeen + " (range-end frames not compared shot by shot " + edgeSeen + ") own hits " + hitsSeen + " splash " + splashSeen + " shot-frames bounced " + bounceSeen + " pierced " + pierceSeen);
    }
}
