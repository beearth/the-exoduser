using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-field-compare -output <dir> [-fcx <x> -fcy <y>]`: the 1-1 field with a fixed set of ordinary etypes placed at fixed offsets around the player and AI off, one 1920x1080 capture
    // for the side-by-side with the web (tools: unity/Tools/field-compare), plus a runtime self-check of the C01-FX wiring (DOT ticks through the real hurtE, ground zones, element multiplier).
    public sealed partial class NativeGame
    {
        // (etype, dx, dy) of the field-compare set: two rows around the player, wide spacing so no sprites overlap
        static readonly int[][] FieldCompareSet = {
            new[]{0,-420,-170}, new[]{1,-250,-170}, new[]{3,-80,-170}, new[]{4,90,-170}, new[]{5,260,-170}, new[]{6,430,-170},
            new[]{7,-420,170}, new[]{8,-250,170}, new[]{9,-80,170}, new[]{10,90,170}, new[]{12,260,170}, new[]{13,430,170},
            new[]{16,-420,350}, new[]{17,-250,350}, new[]{19,-80,350}, new[]{21,90,350}, new[]{22,260,350}, new[]{25,430,350},
            new[]{26,-420,-350}, new[]{27,-250,-350}, new[]{28,-80,-350}, new[]{29,90,-350}, new[]{2,260,-350}, new[]{11,430,-350},
        };
        [Serializable] sealed class FcCheck { public string name; public bool ok; public string note; }
        [Serializable] sealed class FcReceipt { public float playerX, playerY; public List<string> placed = new List<string>(); public List<FcCheck> checks = new List<FcCheck>(); }

        IEnumerator FieldCompare()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) { Application.Quit(1); yield break; }
            Directory.CreateDirectory(output);
            var rc = new FcReceipt();
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            string fresh = "FC" + (DateTime.Now.Ticks % 100000).ToString("00000");
            if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh);
            lobby.ShowLobby(); yield return null;
            lobby.BeginCharacterEntry(false);
            float deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; Running = false; yield return null;
            var sim = Simulation; var p = sim.Player;
            sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000; sim.SpawnHoles = null;
            string sx = Argument("-fcx"), sy = Argument("-fcy"); float fx, fy;
            if (float.TryParse(sx, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out fx) && float.TryParse(sy, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out fy)) { p.X = fx; p.Y = fy; }
            rc.playerX = p.X; rc.playerY = p.Y;
            p.Iframes = 1e9f; p.Hp = p.MaxHp;
            foreach (var s in FieldCompareSet)
            {
                var e = sim.SpawnEnemy(p.X + s[1], p.Y + s[2], s[0], null, false); if (e == null) { rc.placed.Add(s[0] + ":none"); continue; }
                e.X = p.X + s[1]; e.Y = p.Y + s[2]; e.Elite = 0; if (e.Web != null) { e.Web.x = e.X; e.Web.y = e.Y; e.Web.elite = 0; e.Web.mods.Clear(); }
                double face = Math.Atan2(p.Y - e.Y, p.X - e.X); e.Facing = (float)face; if (e.Web != null) e.Web.facing = face;
                rc.placed.Add(s[0] + ":" + e.X.ToString("0") + "," + e.Y.ToString("0"));
            }
            for (int i = 0; i < 20; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.Iframes = 1e9f; yield return null; }
            UpdateViews(); yield return new WaitForSecondsRealtime(.4f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "field-unity.png")); yield return null; yield return new WaitForSecondsRealtime(.3f);

            // ---- ground zones next to the player (same set as tools zones-web capture): trap x2, ice-pool x2 (dark / ice), blizzard x2 (dark / ice) ----
            sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = false; p.Iframes = 1e9f;
            double[][] zset = { new[]{-300.0,80,0,0}, new[]{-180.0,80,0,3}, new[]{-40.0,80,1,3}, new[]{80.0,80,1,2}, new[]{200.0,80,2,3}, new[]{320.0,80,2,2} };
            double[] zsz = { .8, .8, 2, 2.5, 3, 3 };
            for (int i = 0; i < zset.Length; i++) sim.FieldZones.Add(new Simulation.FieldZone { Kind = zset[i][2] == 0 ? "trap" : zset[i][2] == 1 ? "iceZone" : "blizzard", X = p.X + zset[i][0], Y = p.Y + zset[i][1], Life = 480, R = zsz[i], Dmg = 50, El = zset[i][3] });
            for (int i = 0; i < 12; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.Iframes = 1e9f; yield return null; }
            UpdateViews(); yield return new WaitForSecondsRealtime(.4f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "zones-unity.png")); yield return null; yield return new WaitForSecondsRealtime(.3f);
            sim.FieldZones.Clear();

            // ---- runtime self-check of the C01-FX wiring (no capture) ----
            Action<string, bool, string> add = (n, ok, note) => rc.checks.Add(new FcCheck { name = n, ok = ok, note = note });
            // 1) bleed + burn DOT tick through the real hurtE (AI on, alerted enemy near the player, player invulnerable)
            sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = true;
            var d = sim.SpawnEnemy(p.X + 150, p.Y, 0, null, false);
            if (d == null) add("dot", false, "no enemy");
            else
            {
                d.Web._alerted = true; d.Web.bleedT = 300; d.Web._bleedPool = 4000; d.Web.bleedStk = 5; d.Web.bleed = 1; d.Web.burnT = 180; d.Web._burnPool = 1500; d.Web.burnStk = 3; d.Web._iceDotT = 120; d.Web._iceDotDmg = 25;
                d.Hp = d.MaxHp = 100000; d.Web.hp = d.Web.mhp = 100000; int hp0 = d.Hp; var hpTrace = new List<int>();
                for (int i = 0; i < 330; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.Iframes = 1e9f; if (i % 60 == 59) hpTrace.Add(d.Hp); }
                add("dot", d.Hp < hp0 && hpTrace[0] < hp0 && hpTrace[hpTrace.Count - 1] < hpTrace[0] && d.Web.burnT <= 0, "hp " + hp0 + " -> " + d.Hp + " per second [" + string.Join(",", hpTrace.ConvertAll(x => x.ToString()).ToArray()) + "], bleedT " + d.Web.bleedT + " burnT " + d.Web.burnT + " iceDotT " + d.Web._iceDotT);
            }
            // 2) ground zones against the player
            sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = true; sim.FieldZones.Clear();   // the zones tick with the enemy loop
            p.Iframes = 0; p.Hp = p.MaxHp; p.State = "idle"; sim.PlayerFreezeSlow = 0; sim.PlayerTrapSlow = 0;
            Func<float> tot = () => p.Hp + p.Shield; float hpA = tot();   // the energy shield takes the hit first
            sim.FieldZones.Add(new Simulation.FieldZone { Kind = "trap", X = p.X, Y = p.Y, Life = 600, R = .8, Dmg = 100, El = 0 }); StepInput(0, 0, p.X + 300, p.Y, false, false);
            add("trap zone", tot() < hpA && sim.PlayerTrapSlow > 0 && sim.FieldZones.Count == 0, "hp+shield " + hpA + " -> " + tot() + ", trapSlow " + sim.PlayerTrapSlow + ", zones left " + sim.FieldZones.Count);
            p.Iframes = 0; p.Hp = p.MaxHp; hpA = tot();
            sim.FieldZones.Add(new Simulation.FieldZone { Kind = "iceZone", X = p.X, Y = p.Y, Life = 480, R = 2, Dmg = 0, El = 2 }); StepInput(0, 0, p.X + 300, p.Y, false, false);
            add("ice zone (ice element)", sim.PlayerFreezeSlow >= 59 && tot() >= hpA && sim.FieldZones.Count == 0, "freezeSlow " + sim.PlayerFreezeSlow + ", zones left " + sim.FieldZones.Count);
            p.Iframes = 0; sim.PlayerFreezeSlow = 0; hpA = tot();
            sim.FieldZones.Add(new Simulation.FieldZone { Kind = "blizzard", X = p.X, Y = p.Y, Life = 180, R = 3, Dmg = 80, El = 3 }); StepInput(0, 0, p.X + 300, p.Y, false, false);
            add("blizzard (dark element)", tot() < hpA && sim.PlayerFreezeSlow == 0 && sim.FieldZones.Count == 0, "hp+shield " + hpA + " -> " + tot() + ", freezeSlow " + sim.PlayerFreezeSlow);
            p.Iframes = 1e9f;
            sim.FieldZones.Add(new Simulation.FieldZone { Kind = "iceZone", X = p.X + 900, Y = p.Y, Life = 480, R = 2, Dmg = 0, El = 3 }); StepInput(0, 0, p.X + 300, p.Y, false, false);
            add("zone out of reach stays", sim.FieldZones.Count == 1, "zones " + sim.FieldZones.Count);
            File.WriteAllText(Path.Combine(output, "field-compare.json"), JsonUtility.ToJson(rc, true), new UTF8Encoding(false));
            yield return null; Application.Quit(0);
        }
    }
}
