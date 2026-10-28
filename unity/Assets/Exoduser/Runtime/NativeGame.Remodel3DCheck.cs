using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-rmint-check -output <dir> [--remodel3d]`: RM-INT stage 1 verification with the real NativeGame.
    //  1. scripted replay of RmIntTicks Core ticks through the same entry point FixedUpdate uses (StepInput) -> <dir>/ticklog.json (player / enemy records every 10 ticks + one hash).
    //     Run it once without and once with --remodel3d: the two logs must be identical (presentation only).
    //  2. captures (1600x900) at fixed spots of the RM-1 window (start, mid, north, east) -> <dir>/caps/*.png, same spots for both modes.
    public sealed partial class NativeGame
    {
        const int RmIntTicks = 1800;
        [Serializable] sealed class RmIntRec { public int tick, kills, enemies; public float x, y, hp; public long enemyHash; }
        [Serializable] sealed class RmIntReceipt { public bool remodel3d, active, sceneReady; public int ticks; public string logHash; public float loadSeconds, fps; public string[] shots; public List<RmIntRec> records = new List<RmIntRec>(); }

        IEnumerator RemodelIntCheck()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) { Application.Quit(1); yield break; }
            string caps = Path.Combine(output, "caps"); Directory.CreateDirectory(caps);
            Screen.SetResolution(1600, 900, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            string fresh = "RI" + (DateTime.Now.Ticks % 100000).ToString("00000");
            if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh);
            lobby.ShowLobby(); yield return null;
            lobby.BeginCharacterEntry(false);
            float deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; Running = false; menu = false; gameFocused = true; yield return null;
            var rc = new RmIntReceipt { remodel3d = NativeRemodel3D.Requested };
            // the 3D layer loads asynchronously on the first UpdateViews of the field; wait for it so both runs start the replay from the same Core state
            float t0 = Time.realtimeSinceStartup;
            if (NativeRemodel3D.Requested) { while (!NativeRemodel3D.Active && Time.realtimeSinceStartup - t0 < 40) { UpdateViews(); yield return null; } }
            rc.loadSeconds = Time.realtimeSinceStartup - t0; rc.active = NativeRemodel3D.Active; rc.sceneReady = Remodel3DReady;
            var sim = Simulation; var p = sim.Player;
            // ---- 1. scripted replay: walk a square, attack held every other 3 seconds, aim along +x
            var sb = new StringBuilder(); long h = 1469598103934665603L; float fpsT0 = Time.realtimeSinceStartup;
            for (int t = 0; t < RmIntTicks; t++)
            {
                int phase = (t / 90) % 4; float mx = phase == 0 ? 1 : phase == 2 ? -1 : 0, my = phase == 1 ? 1 : phase == 3 ? -1 : 0; bool atk = (t / 180) % 2 == 0;
                StepInput(mx, my, p.X + 100, p.Y, atk, false);
                if (t % 10 == 9)
                {
                    long eh = 0; int alive = 0; foreach (var e in sim.Enemies) if (e.Alive) { alive++; eh = eh * 31 + (long)Math.Round(e.X * 8) * 7 + (long)Math.Round(e.Y * 8) * 13 + e.Hp; }
                    rc.records.Add(new RmIntRec { tick = sim.TickCount, kills = sim.Kills, enemies = alive, x = p.X, y = p.Y, hp = p.Hp, enemyHash = eh });
                    h = (h ^ sim.TickCount) * 1099511628211L; h = (h ^ (long)Math.Round(p.X * 100)) * 1099511628211L; h = (h ^ (long)Math.Round(p.Y * 100)) * 1099511628211L; h = (h ^ (long)Math.Round(p.Hp * 100)) * 1099511628211L; h = (h ^ alive) * 1099511628211L; h = (h ^ eh) * 1099511628211L;
                }
                if (t % 30 == 29) yield return null;   // keep the window alive; ticks themselves are independent of frames
            }
            rc.ticks = sim.TickCount; rc.logHash = h.ToString("x"); rc.fps = RmIntTicks / Mathf.Max(.001f, Time.realtimeSinceStartup - fpsT0);
            // ---- 2. captures at fixed spots (field, no mobs)
            sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); p.Iframes = 1e9f; p.Hp = p.MaxHp;
            var spots = new[] { Tuple.Create("start", 4020f, 7420f), Tuple.Create("mid", 4020f, 6880f), Tuple.Create("north", 3600f, 6400f), Tuple.Create("east", 4400f, 6000f) };
            var shots = new List<string>();
            foreach (var s in spots)
            {
                p.X = s.Item2; p.Y = s.Item3;
                for (int i = 0; i < 6; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.X = s.Item2; p.Y = s.Item3; p.Iframes = 1e9f; yield return null; }
                menu = false; gameFocused = true; UpdateViews(); yield return new WaitForSecondsRealtime(.8f); menu = false; gameFocused = true; UpdateViews(); yield return new WaitForEndOfFrame();
                ScreenCapture.CaptureScreenshot(Path.Combine(caps, (NativeRemodel3D.Requested ? "3d-" : "2d-") + s.Item1 + ".png")); shots.Add(s.Item1); yield return null; yield return new WaitForSecondsRealtime(.3f);
            }
            rc.shots = shots.ToArray();
            File.WriteAllText(Path.Combine(output, "ticklog.json"), JsonUtility.ToJson(rc, true));
            Application.Quit(0);
        }
    }
}
