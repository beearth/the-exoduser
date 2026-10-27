using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-b05-smoke -output <dir>`: the real NativeGame/Simulation. All seven melee weapons and the three crossbows are made by the real mkItem port (ItemFactory),
    // put in the real bag, equipped through NativeInventory.Equip (the same callback a D01 drop uses) and used through Tick; writes frames + b05-smoke.json.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class B05Receipt { public bool passed; public string scope, failures, notes; public int checks, boltShots, boltHits, maxPierceOneBolt; public List<string> melee = new List<string>(), bows = new List<string>(); }

        IEnumerator B05Shot(string output, string name)
        {
            UpdateViews(); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, name + ".png")); yield return null;
        }

        IEnumerator B05Smoke()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            lobby.ShowLobby(); lobby.SelectPreview(); lobby.EnterNativeTest(); menu = false; Running = false;
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            var sim = Simulation; sim.Config.ActiveAttack = "weapon"; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000;
            var fails = new List<string>(); int n = 0; Action<bool, string> check = (ok, what) => { n++; if (!ok) fails.Add(what); };
            var rec = new B05Receipt { scope = "actual_native_player_b05_weapons_crossbow" };
            var p = sim.Player; var rng = new System.Random(5); Func<double> rnd = () => rng.NextDouble(); yield return null;

            // a free line of 900 px for the enemies / bolts
            int dir = -1; float[] dxs = { 1, -1, 0, 0 }, dys = { 0, 0, 1, -1 };
            for (int d = 0; d < 4 && dir < 0; d++) { bool free = true; for (int s = 1; s <= 36; s++) if (!sim.CanMove(p.X + dxs[d] * 25 * s, p.Y + dys[d] * 25 * s, p.Radius)) free = false; if (free) dir = d; }
            check(dir >= 0, "a free direction for the test line"); if (dir < 0) dir = 0;
            Func<float, float> lx = dist => p.X + dxs[dir] * dist; Func<float, float> ly = dist => p.Y + dys[dir] * dist;
            float aimX = lx(300), aimY = ly(300);
            Func<float, EnemyState> spawn = dist => { var e = sim.SpawnNormalEnemy(lx(dist), ly(dist)); if (e != null) { e.Hp = e.MaxHp = 1000000000; e.Shield = e.MaxShield = 0; e.Poise = e.MaxPoise = 1000000000; } return e; };
            Action clear = () => { sim.Enemies.Clear(); sim.Bolts.Clear(); };
            check(sim.Crossbow.Equipped && sim.Crossbow.Type == "crossbow" && sim.CrossbowAuto, "the starter seed crossbow is equipped and auto fire is on (web start state)");

            // ---- seven melee weapons: mkItem -> bag -> Equip -> Config -> real LMB hit ----
            string[] melee = WeaponCatalog.MeleeKeys; double nowMs = 1.7e12;
            sim.CrossbowAuto = false;   // the seeded crossbow would add its own bolt hits to the melee damage readings
            for (int w = 0; w < melee.Length; w++)
            {
                var item = ItemFactory.MkItem("weapon", 1, 0, 2, melee[w], p.Level, rnd, nowMs);
                check(item != null && item.wtype == melee[w], melee[w] + " made by mkItem: " + (item == null ? "null" : item.wtype));
                if (item == null) continue;
                string reason; check(inventory.State.TryPickup(item, false, out reason), melee[w] + " bag pickup: " + reason);
                check(inventory.Equip(item, p.Level), melee[w] + " equip refused");
                check(sim.Config.WeaponAttack == (float)item.atk && Math.Abs(sim.Config.WeaponSpeed - item.spd) < 1e-5 && Math.Abs(sim.Config.WeaponRange - (item.wRange + item.bonusRange * 4)) < 1e-4 && Math.Abs(sim.Config.WeaponArc - item.wArcW) < 1e-5,
                      melee[w] + " stats on equip: atk " + sim.Config.WeaponAttack + "/" + item.atk + " spd " + sim.Config.WeaponSpeed + "/" + item.spd + " range " + sim.Config.WeaponRange + " arc " + sim.Config.WeaponArc);
                clear(); p.State = "idle"; p.StateTicks = 0; p.Stamina = p.MaxStamina; p.Hp = p.MaxHp; p.Iframes = 0; p.Poise = 4;
                var target = spawn(30); check(target != null, melee[w] + " target spawned"); if (target == null) continue;
                sim.Config.PlayerCriticalChance = 0; int total0 = sim.TotalDamage; int swingTicks = 0, recoverTicks = 0; bool hit = false; string diag = "";
                int expected = (int)((int)((p.BaseAttack + sim.Config.WeaponAttack + sim.Config.WeaponEnhanceAttack + 15) * 6) * sim.Config.DamageMultiplier) + (int)(5 * 1.5);
                for (int t = 0; t < 80; t++)
                {
                    int before = sim.TotalDamage; sim.Tick(0, 0, aimX, aimY, t == 0, false);
                    if (sim.TotalDamage != before) diag += " t" + t + ":+" + (sim.TotalDamage - before) + "(enemies " + sim.Enemies.Count + ", crit " + sim.Config.PlayerCriticalChance + ", rage " + sim.Rage + ", stunned " + target.Stunned + ", active " + sim.Config.ActiveAttack + ")";
                    if (sim.TotalDamage > total0 && !hit) { hit = true; swingTicks = t + 1; if (w == 0 || w == 5) yield return B05Shot(output, "b05-melee-" + melee[w] + "-hit"); }
                    if (hit && p.State == "wRecover") recoverTicks++;
                    if (hit && p.State == "idle") break;
                }
                check(hit, melee[w] + " LMB hit landed on the target at 30 px");
                check(sim.TotalDamage - total0 == expected, melee[w] + " hit damage " + (sim.TotalDamage - total0) + " != web formula " + expected + " diag:" + diag);
                int wantRecover = (int)(16 / ((sim.Config.WeaponSpeed != 0 ? sim.Config.WeaponSpeed : .3f) * sim.Config.AttackSpeedMultiplier));
                check(Math.Abs(recoverTicks - wantRecover) <= 2, melee[w] + " recovery " + recoverTicks + " vs ~" + wantRecover);
                rec.melee.Add(melee[w] + " atk " + item.atk + " spd " + item.spd + " range " + item.wRange + "+" + item.bonusRange + "*4 dmg " + (sim.TotalDamage - total0) + " swing@" + swingTicks + " recover " + recoverTicks);
            }
            clear(); p.State = "idle"; p.StateTicks = 0; sim.CrossbowAuto = true;

            // ---- crossbows: Equip fills Crossbow inputs; auto fire; pierce once the pool recycles; T toggle; roll key independent ----
            string[] bows = WeaponCatalog.BowKeys;
            for (int b = 0; b < bows.Length; b++)
            {
                var item = ItemFactory.MkItem("bow", 2, 0, 3, bows[b], p.Level, rnd, nowMs);
                check(item != null && item.btype == bows[b], bows[b] + " made by mkItem");
                if (item == null) continue;
                string reason; check(inventory.State.TryPickup(item, false, out reason), bows[b] + " bag pickup: " + reason);
                check(inventory.Equip(item, p.Level), bows[b] + " equip refused");
                var c = sim.Crossbow; double range, speed; sim.AutoBowSpec(out range, out speed);
                check(c.Equipped && c.Type == bows[b] && Math.Abs(c.Atk - item.atk) < 1e-9 && Math.Abs(c.BowSpd - item.bowSpd) < 1e-9, bows[b] + " inputs on equip: " + c.Type + " atk " + c.Atk + " spd " + c.BowSpd);
                clear(); sim.BoltFreeCount = 0; p.State = "idle"; p.Stamina = p.MaxStamina; sim.CrossbowTimer = 0; sim.CrossbowAuto = true;
                for (int i = 0; i < 6; i++) spawn(220 + i * 70);
                int shots0 = sim.BoltShots, hits0 = sim.BoltHits; int pierceMax = 0;
                double interval = Simulation.CrossbowInterval / (c.BowSpd * sim.XbowSpdMul);
                int ticks = (int)(interval * 5) + 40;
                for (int t = 0; t < ticks; t++)
                {
                    sim.Tick(0, 0, aimX, aimY, false, false); p.Stamina = p.MaxStamina;
                    if (b == 0 && (t == (int)interval + 6 || t == (int)(interval * 2) + 8 || t == (int)(interval * 3) + 6)) yield return B05Shot(output, "b05-crossbow-" + bows[b] + "-t" + t);
                    foreach (var bolt in sim.Bolts) pierceMax = Math.Max(pierceMax, bolt.Pierced);
                }
                int fired = sim.BoltShots - shots0, hitCount = sim.BoltHits - hits0;
                check(fired >= 4 && fired <= 6, bows[b] + " auto fired " + fired + " bolts in " + ticks + " ticks (interval " + interval + ")");
                check(hitCount > fired, bows[b] + " pierce: " + hitCount + " hits from " + fired + " bolts");
                check(pierceMax >= 2, bows[b] + " one bolt passed through " + pierceMax + " enemies");
                rec.boltShots += fired; rec.boltHits += hitCount; rec.maxPierceOneBolt = Math.Max(rec.maxPierceOneBolt, pierceMax);
                rec.bows.Add(bows[b] + " atk " + item.atk + " bowSpd " + item.bowSpd + " range " + range + " dmg " + sim.AutoCrossbowDamage() + " fired " + fired + " hits " + hitCount + " maxPierce " + pierceMax);
            }

            // ---- T toggle: OFF stops fire, ON resumes (reset timer / target) ----
            clear(); sim.BoltFreeCount = 0; for (int i = 0; i < 3; i++) spawn(260 + i * 80);
            sim.ToggleCrossbowAuto(); check(!sim.CrossbowAuto && sim.CrossbowTimer == 0, "T off"); int s0 = sim.BoltShots;
            for (int t = 0; t < 200; t++) { sim.Tick(0, 0, aimX, aimY, false, false); p.Stamina = p.MaxStamina; }
            check(sim.BoltShots == s0, "no shots while auto is off: " + (sim.BoltShots - s0));
            sim.ToggleCrossbowAuto(); check(sim.CrossbowAuto, "T on");
            for (int t = 0; t < 200; t++) { sim.Tick(0, 0, aimX, aimY, false, false); p.Stamina = p.MaxStamina; }
            check(sim.BoltShots > s0, "shots resume after T on: " + (sim.BoltShots - s0));
            // stamina gate: at 20% of max or below the auto crossbow does not fire (P.st > P.mst*.2)
            int s1 = sim.BoltShots; sim.CrossbowTimer = 999; p.Stamina = p.MaxStamina * .199f;   // below 20% (one tick of regen is far smaller than the gap)
            sim.Tick(0, 0, aimX, aimY, false, false); check(sim.BoltShots == s1, "no shot at stamina just under 20%");
            p.Stamina = p.MaxStamina * .205f; sim.CrossbowTimer = 999; sim.Tick(0, 0, aimX, aimY, false, false); check(sim.BoltShots == s1 + 1, "shot just above 20% stamina (" + (sim.BoltShots - s1) + ")");

            // ---- roll key (Space + direction) still rolls with the crossbow equipped ----
            clear(); p.State = "idle"; p.Iframes = 0; sim.HarpGauge = 225;
            sim.SetRollInput(false, false, false, true, true); sim.Tick(0, 0, aimX, aimY, false, false);
            check(sim.RollActive && p.State == "bladeDash", "roll still starts with Space + direction while a crossbow is equipped: " + p.State);
            for (int t = 0; t < 30; t++) sim.Tick(0, 0, aimX, aimY, false, false);
            sim.SetRollInput(false, false, false, false, false);

            // ---- unequip the bow: auto fire stops ----
            string why2; check(inventory.State.TryUnequip("bow", out why2), "unequip bow: " + why2); sim.ApplyEquipment(inventory.State);
            check(!sim.Crossbow.Equipped, "Crossbow.Equipped off after unequip"); clear(); p.State = "idle"; spawn(260); int s2 = sim.BoltShots;
            for (int t = 0; t < 300; t++) sim.Tick(0, 0, aimX, aimY, false, false);
            check(sim.BoltShots == s2, "no shots without a bow");

            rec.checks = n; rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0;
            rec.notes = "bolt sounds (crossbow_shot / bow_hit) are not in the admitted audio slice yet; OPT.xbowAuto persistence and the elMul element chart (B06) are not wired; web fireBow has no caller, Space only rolls";
            File.WriteAllText(Path.Combine(output, "b05-smoke.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
    }
}
