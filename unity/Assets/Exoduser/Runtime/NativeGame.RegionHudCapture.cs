using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-region-hud-capture -output <dir>`: the region HUD scenes at 1920x1080 for the side-by-side with the web (same player spot, no mobs, same cleared set):
    // A banner (entry, NE) / B banner (purge, 1/4) / C direction arrow + label / D gate label + progress bar (2/4). Writes <dir>/region-hud.json with the HUD state read back from the objects.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class RhShot { public string name, banner, bannerEn, bannerSub, arrowLabel, gateLabel; public bool arrowShown, bannerActive, gateShown; public float playerX, playerY, arrowX, arrowY; public int cleared; }
        [Serializable] sealed class RhReceipt { public int regions; public float exitCx, exitCy; public List<RhShot> shots = new List<RhShot>(); public bool passed; }
        IEnumerator RegionHudCapture()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) { Application.Quit(1); yield break; }
            Directory.CreateDirectory(output);
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            string fresh = "RH" + (DateTime.Now.Ticks % 100000).ToString("00000");
            if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.8f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "E-lobby.png")); yield return null;   // LT-3 / LT-4: lobby with the new character card (version overlay, save caption)
            lobby.BeginCharacterEntry(false);
            float deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; Running = false; yield return null;
            var sim = Simulation; var p = sim.Player; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); p.Iframes = 1e9f; p.Hp = p.MaxHp;
            areaTitle.Hide();
            var rc = new RhReceipt { regions = sim.Regions != null ? 4 : 0 };
            double ex = 0, ey = 0; foreach (var t in sim.Stage.Exits) { ex += t.X; ey += t.Y; } ex /= Math.Max(1, sim.Stage.Exits.Count); ey /= Math.Max(1, sim.Stage.Exits.Count);
            rc.exitCx = (float)((ex + .5) * NativeRegionHud.T); rc.exitCy = (float)((ey + .5) * NativeRegionHud.T);
            // A: NE region entry banner at its hold
            yield return RegionHudShot(rc, "A-banner-enter", 150 * 40f, 60 * 40f, () => { regionHud.ShowBanner(sim, 1, false); regionHud.ForcedBannerAge = 1.0f; });
            regionHud.ForcedBannerAge = null;
            // C: arrow to the nearest uncleared region centre (no mobs)
            yield return RegionHudShot(rc, "C-arrow", 110 * 40f, 90 * 40f, () => { regionHud.Reset(); });
            // B: purge banner of region 0 with 1/4 cleared
            yield return RegionHudShot(rc, "B-banner-purge", 60 * 40f, 60 * 40f, () => { sim.Regions[0].Cleared = true; regionHud.Sync(sim); regionHud.ShowBanner(sim, 0, true); regionHud.ForcedBannerAge = 0.9f; });
            regionHud.ForcedBannerAge = null; regionHud.Reset();
            // D: gate label + progress bar with 2/4
            yield return RegionHudShot(rc, "D-gate-label", rc.exitCx, rc.exitCy + 50, () => { sim.Regions[0].Cleared = true; sim.Regions[1].Cleared = true; regionHud.Sync(sim); sim.Stage.HasFieldGate = false; /* web side: G.bossGate = [] (the tree art covers the label) */ });
            bool ok = rc.shots.Count == 4; rc.passed = ok;   // the lobby shot E-lobby.png is a separate file
            File.WriteAllText(Path.Combine(output, "region-hud.json"), JsonUtility.ToJson(rc, true));
            Application.Quit(ok ? 0 : 2);
        }
        IEnumerator RegionHudShot(RhReceipt rc, string name, float px, float py, Action setup = null)
        {
            var sim = Simulation; var p = sim.Player;
            p.X = px; p.Y = py;
            for (int i = 0; i < 6; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.X = px; p.Y = py; p.Iframes = 1e9f; sim.Enemies.Clear(); yield return null; }
            if (setup != null) setup();
            menu = false; gameFocused = true; UpdateViews(); yield return new WaitForSecondsRealtime(.9f); menu = false; gameFocused = true; UpdateViews(); yield return new WaitForEndOfFrame();
            var s = new RhShot { name = name, playerX = p.X, playerY = p.Y, cleared = sim.RegionClearedCount(), banner = regionHud.BannerKr, bannerEn = regionHud.BannerEn, bannerSub = regionHud.BannerSub, bannerActive = regionHud.BannerActive,
                arrowShown = regionHud.ArrowShown, arrowLabel = regionHud.ArrowLabel, arrowX = regionHud.ArrowPos.x, arrowY = regionHud.ArrowPos.y, gateShown = regionHud.GateLabelShown, gateLabel = regionHud.GateLabelText };
            rc.shots.Add(s);
            ScreenCapture.CaptureScreenshot(Path.Combine(Argument("-output"), name + ".png")); yield return null; yield return new WaitForSecondsRealtime(.3f);
        }
    }
}
