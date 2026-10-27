using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-cam-capture -output <dir>`: 1-1 field at its start spot and at the four map ends / corners, 1920x1080 each, plus a receipt that the visible rectangle never leaves the map.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class CamShot { public string name; public float playerX, playerY, camX, camY, halfW, halfH; public bool insideMap; }
        [Serializable] sealed class CamReceipt { public float mapW, mapH; public bool passed; public List<CamShot> shots = new List<CamShot>(); }
        IEnumerator CameraClampCapture()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) { Application.Quit(1); yield break; }
            Directory.CreateDirectory(output);
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            string fresh = "CC" + (DateTime.Now.Ticks % 100000).ToString("00000");
            if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh);
            lobby.ShowLobby(); yield return null;
            lobby.BeginCharacterEntry(false);
            float deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; Running = false; yield return null;
            var sim = Simulation; var p = sim.Player; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); p.Iframes = 1e9f; p.Hp = p.MaxHp;
            float mapW = Map.Data.width * Map.Data.tileSize, mapH = Map.Data.height * Map.Data.tileSize;
            var rc = new CamReceipt { mapW = mapW, mapH = mapH };
            float sx = p.X, sy = p.Y;
            var spots = new[]{ Tuple.Create("start", sx, sy), Tuple.Create("north", mapW / 2, 70f), Tuple.Create("south", mapW / 2, mapH - 70f), Tuple.Create("west", 70f, mapH / 2), Tuple.Create("east", mapW - 70f, mapH / 2), Tuple.Create("sw", 70f, mapH - 70f), Tuple.Create("ne", mapW - 70f, 70f) };
            foreach (var s in spots)
            {
                p.X = s.Item2; p.Y = s.Item3;
                for (int i = 0; i < 6; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); p.X = s.Item2; p.Y = s.Item3; p.Iframes = 1e9f; yield return null; }
                menu = false; gameFocused = true; UpdateViews(); yield return new WaitForSecondsRealtime(.7f); menu = false; gameFocused = true; UpdateViews(); yield return new WaitForEndOfFrame();
                float halfH = view.orthographicSize * 100, halfW = halfH * view.aspect, cxp = view.transform.position.x * 100, cyp = -view.transform.position.y * 100;
                rc.shots.Add(new CamShot { name = s.Item1, playerX = p.X, playerY = p.Y, camX = cxp, camY = cyp, halfW = halfW, halfH = halfH, insideMap = cxp - halfW >= -.5f && cxp + halfW <= mapW + .5f && cyp - halfH >= -.5f && cyp + halfH <= mapH + .5f });
                ScreenCapture.CaptureScreenshot(Path.Combine(output, "cam-" + s.Item1 + ".png")); yield return null; yield return new WaitForSecondsRealtime(.3f);
            }
            bool ok = true; foreach (var shot in rc.shots) if (!shot.insideMap) ok = false; rc.passed = ok;
            File.WriteAllText(Path.Combine(output, "cam-capture.json"), JsonUtility.ToJson(rc, true));
            Application.Quit(ok ? 0 : 2);
        }
    }
}
