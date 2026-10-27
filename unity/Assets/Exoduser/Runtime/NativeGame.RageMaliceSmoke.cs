using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-rage-malice-smoke -output <dir>`: the real NativeGame/Simulation builds rage with the rage API (the parry reward path calls the same SetRage), spends
    // malice through the B03 cost API, gets the elite kill malice from a real elite kill, and the HUD shows the values (Space slot rage fill, objective panel malice).
    public sealed partial class NativeGame
    {
        [Serializable] sealed class RageMaliceReceipt { public bool passed; public string scope, failures; public int checks; public double rageMax; public int malicePeak, maliceAfter; }

        IEnumerator RageMaliceSmoke()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            lobby.ShowLobby(); lobby.SelectPreview(); lobby.EnterNativeTest(); menu = false; Running = false; // same entry as the HUD blend capture (no OS input)
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            var sim = Simulation; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000; // keep the auto potion from spending malice
            var fails = new List<string>(); int n = 0; Action<bool, string> check = (ok, what) => { n++; if (!ok) fails.Add(what); };
            var rec = new RageMaliceReceipt { scope = "actual_native_player_rage_malice_hud" };
            var p = sim.Player; double rageSeen = -1; sim.RageChanged += (a, b) => rageSeen = b;
            yield return null;

            // ---- rage: starts 0, max 100, adds clamp at the maximum, no decay ----
            check(sim.Rage == 0 && sim.RageMaximum == 100, "start rage " + sim.Rage + " max " + sim.RageMaximum);
            sim.GainRage(20); sim.GainRage(20); sim.GainRage(20);
            check(sim.Rage == 60 && rageSeen == 60, "rage after three +20: " + sim.Rage);
            for (int i = 0; i < 600; i++) sim.Tick(0, 0, p.X + 100, p.Y, false, false);
            check(sim.Rage == 60, "no decay over 600 ticks: " + sim.Rage);
            yield return new WaitForSecondsRealtime(.3f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "b10-rage-60.png")); yield return null;

            // ---- a raised maximum (affix rageMaxFlat 35, pRage level 0): 135; the add clamps there; the fill uses the real maximum ----
            sim.AffixRageMaxFlat = 35;
            check(sim.RageMaximum == 135, "max with +35: " + sim.RageMaximum);
            sim.GainRage(200);
            check(sim.Rage == 135, "clamped at max: " + sim.Rage);
            rec.rageMax = sim.RageMaximum;
            yield return new WaitForSecondsRealtime(.3f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "b10-rage-135-full.png")); yield return null;

            // ---- slam consume (Space burst): damage x(1+rage*.19), rage back to 0 ----
            var slam = sim.ConsumeRageForSlam();
            check(slam.Consumed == 135 && sim.Rage == 0 && Math.Abs(slam.DamageMul - (1 + 135 * .19)) < 1e-9 && slam.Bombs == 6, "slam " + slam.Consumed + " mul " + slam.DamageMul + " bombs " + slam.Bombs);

            // ---- malice: spend path (half rounded up), shortage leaves it untouched ----
            sim.Materials = 1000; int paid;
            check(sim.TrySpendMalice(30, out paid) && paid == 15 && sim.Materials == 985, "spend raw 30 -> 15: " + sim.Materials);
            check(sim.TrySpendMalice(5, out paid) && paid == 3 && sim.Materials == 982, "spend raw 5 -> 3: " + sim.Materials);
            sim.Materials = 7; check(!sim.TrySpendMalice(30) && sim.Materials == 7 && !sim.CanSpendMalice(30) && sim.CanSpendMalice(14), "short of 15 keeps 7");
            check(sim.CanSpendMalice(999, true) && sim.TrySpendMalice(999, out paid, true) && paid == 0 && sim.Materials == 7, "parry practice waives the slam cost");

            // ---- elite kill malice from a real kill: +4 base, instant drop, extra (random .99, combo x1.0) ----
            sim.Materials = 0; sim.Combo = 0; sim.Random01 = () => .99; sim.Enemies.Clear();
            var elite = sim.SpawnNormalEnemy(p.X + 30, p.Y); elite.Elite = 2; elite.Hp = 1; elite.MaxHp = 1; int kills = sim.Kills;
            for (int i = 0; i < 240 && sim.Kills == kills; i++) sim.Tick(0, 0, elite.X, elite.Y, i % 12 < 6, false);
            double comboBonus = LevelExp.ComboBonus(sim.Combo, sim.Config.DifficultyIndex - 5);
            int expected = 4 + RageMalice.EliteDrop(sim.Config.StageIndex, EliteTables.Tiers[2].DropBonus, 0, 0) + RageMalice.EliteExtra(.99, comboBonus);
            check(sim.Kills == kills + 1 && sim.Materials == expected && expected > 400, "elite kill malice " + sim.Materials + " expected " + expected);
            sim.Enemies.Clear(); rec.malicePeak = sim.Materials;

            // ---- HUD capture with a visible mid rage and the malice counter ----
            sim.Random01 = null; sim.GainRage(80);
            yield return new WaitForSecondsRealtime(.3f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "b10-malice-after-elite-kill.png")); yield return null;
            sim.TrySpendMalice(100);
            rec.maliceAfter = sim.Materials; check(rec.maliceAfter == rec.malicePeak - 50, "spend raw 100 -> 50: " + rec.maliceAfter);

            rec.checks = n; rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0;
            File.WriteAllText(Path.Combine(output, "rage-malice-smoke.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
    }
}
