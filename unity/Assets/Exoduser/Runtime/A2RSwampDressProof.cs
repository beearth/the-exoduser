using System;
using System.Collections;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // Explicit sandbox-only proof entry; existing play-smoke and D4 code are left untouched.
        internal IEnumerator A2RSwampDressProof()
        {
            if (!NativeQaSandbox.Active || Array.IndexOf(Environment.GetCommandLineArgs(), "--a2r-play-smoke") >= 0)
            { Debug.LogError("Swamp proof needs sandbox and its own entry (do not combine --a2r-play-smoke)"); yield break; }
            a2rPlayOutput = Argument("-output");
            if (string.IsNullOrEmpty(a2rPlayOutput) || !Path.IsPathRooted(a2rPlayOutput)) { Application.Quit(2); yield break; }
            Directory.CreateDirectory(a2rPlayOutput); a2rPlayStarted = Time.realtimeSinceStartup;
            a2rPlay = new A2RPlayReceipt { sandbox = NativeQaSandbox.Root, scope = "Ordinary lobby entry and Core walking; bridge-north is a supplementary fixed-pose fixture. Swamp OFF/ON pairs share the same camera and source build. No Core rules or camera parameters changed." };
            Application.logMessageReceived += A2RPlayLog; Application.runInBackground = true; AudioListener.volume = 0; AudioListener.pause = true;
            smokeActive = true; pauseSmoke = true; dropSmoke = true; lobbySmoke = true; introKeysSmoke = true;
            lobby.AutomatedInput = false; SetGameFocus(true); lobby.SetPlaybackFocus(true);
            yield return A2RWaitFrontend("cold-load"); lobby.ShowLobby(); yield return A2RWaitFrontend("ready-lobby");
            if (lobby.Characters.Count == 0)
            {
                bool opened = lobby.OpenCharacterCreation(); yield return A2RWaitFrontend("selection");
                bool confirmed = opened && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual(); yield return A2RWaitFrontend("name");
                bool created = confirmed && lobby.CreateCharacter("A2R검수"); yield return A2RWaitFrontend("created-story");
                if (!created) a2rPlay.failures.Add("Isolated character creation failed");
                lobby.ShowLobby(); yield return A2RWaitFrontend("entry-lobby");
            }
            if (a2rPlay.failures.Count > 0 || !lobby.EnterSelectedCharacter()) { a2rPlay.failures.Add("Ordinary field entry rejected"); A2RPlayFinish(); yield break; }
            yield return A2RWaitFrontend("lobby-game");
            float deadline = Time.realtimeSinceStartup + 30;
            while (lobby.StartupEntryActive && lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline)
            { lobby.SetPlaybackFocus(true); yield return null; }
            if (lobby.StartupEntryActive) { lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null; }
            deadline = Time.realtimeSinceStartup + 25;
            while ((lobby.IsBlocking || NativeScreenTransition.Busy) && Time.realtimeSinceStartup < deadline) { lobby.SetPlaybackFocus(true); yield return null; }
            if (lobby.IsBlocking || NativeScreenTransition.Busy) { a2rPlay.failures.Add("Ordinary field entry timeout"); A2RPlayFinish(); yield break; }
            a2rPlay.ordinaryEntryVerified = true; if (firstPractice != null) EndFirstPractice(true);
            Running = false; frontendEntryInputFence = false;
            var swamp = A2RSwampDress.Active;
            bool initialOffVerified = !A2RSwampDress.Requested && !swamp.Applied && Shader.GetGlobalFloat("_A2RSwampOn") == 0;
            if (!A2RSwampDress.Requested && !initialOffVerified) a2rPlay.failures.Add("Command-line swamp-off did not disable presentation");
            yield return A2RNatureSize(3840);
            for (int i = 0; i < 20; i++) { UpdateViews(); yield return null; }
            a2rPlay.start = new Vector2(Simulation.Player.X, Simulation.Player.Y);
            yield return A2RSwampPair("02-field-entry", swamp);
            // Keep the original source walking path; no player-coordinate assignment on this route.
            var goal = new Vector2(2050, 4400); var route = A2RWalkPath(a2rPlay.start, goal);
            if (route.Count == 0) { a2rPlay.failures.Add("No radius-safe Core route"); A2RPlayFinish(); yield break; }
            int waypoint = 0, stall = 0; float next = Time.realtimeSinceStartup; deadline = next + 160;
            while (waypoint < route.Count && Time.realtimeSinceStartup < deadline)
            {
                int catchup = 0;
                while (next <= Time.realtimeSinceStartup && catchup++ < 8 && waypoint < route.Count)
                {
                    var p = Simulation.Player; var current = new Vector2(p.X, p.Y);
                    if (Vector2.Distance(current, route[waypoint]) < 5) { waypoint++; continue; }
                    var move = (route[waypoint] - current).normalized; p.Iframes = 600;
                    StepInput(move.x, move.y, route[waypoint].x, route[waypoint].y, false, false);
                    float moved = Vector2.Distance(current, new Vector2(p.X, p.Y)); a2rPlay.walkedPixels += moved; a2rPlay.ticks++;
                    if (moved < .01f) { stall++; a2rPlay.blockedTicks++; } else stall = 0;
                    next += 1 / 60f; if (stall > 120) { a2rPlay.failures.Add("Core walking stalled"); waypoint = route.Count; break; }
                }
                UpdateViews(); yield return null;
            }
            a2rPlay.end = new Vector2(Simulation.Player.X, Simulation.Player.Y); a2rPlay.arrived = Vector2.Distance(a2rPlay.end, goal) < 55;
            if (!a2rPlay.arrived) a2rPlay.failures.Add("Actual walk did not reach camp");
            yield return A2RSwampPair("camp", swamp);
            // Existing D4 bridge pose and enemy fixture. Marked as fixture in every output name.
            yield return R18Pose(new Vector2(4320, 6700)); R19Spawn(new Vector2(Simulation.Player.X, Simulation.Player.Y), 6);
            bool ai = Simulation.Config.EnemyAiEnabled; Simulation.Config.EnemyAiEnabled = false;
            for (int i = 0; i < 20; i++) { UpdateViews(); yield return null; }
            yield return A2RSwampPair("fixture-bridge-north", swamp);
            string frames = Path.Combine(a2rPlayOutput, "water-frames"); Directory.CreateDirectory(frames);
            var image = new Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
            Time.captureFramerate = 30;
            for (int i = 0; i < 300; i++)
            {
                UpdateViews(); yield return new WaitForEndOfFrame();
                image.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0); image.Apply();
                File.WriteAllBytes(Path.Combine(frames, "f" + i.ToString("000") + ".jpg"), image.EncodeToJPG(95));
            }
            Time.captureFramerate = 0; Destroy(image); Simulation.Config.EnemyAiEnabled = ai;
            yield return A2RNatureSize(1920); yield return A2RPlayShot("fixture-bridge-north-1920-swamp");
            File.WriteAllText(Path.Combine(a2rPlayOutput, "swamp-proof.json"), JsonUtility.ToJson(new SwampProofReceipt
            { initialCommandLineOffVerified = initialOffVerified, shoreSegments = swamp.ShoreSegments, visibleDebris = swamp.VisibleDebris, frames = 300 }, true));
            swamp.SetApplied(A2RSwampDress.Requested); A2RPlayFinish();
        }

        IEnumerator A2RSwampPair(string id, A2RSwampDress swamp)
        {
            var position = r3Cam.transform.position; var rotation = r3Cam.transform.rotation; var player = new Vector2(Simulation.Player.X, Simulation.Player.Y);
            foreach (bool on in new[] { false, true })
            {
                swamp.SetApplied(on);
                for (int i = 0; i < 3; i++) { UpdateViews(); yield return null; }
                yield return A2RPlayShot(id + (on ? "-swamp" : "-D4"));
            }
            if (Vector3.Distance(position, r3Cam.transform.position) > .0001f || Quaternion.Angle(rotation, r3Cam.transform.rotation) > .001f ||
                Vector2.Distance(player, new Vector2(Simulation.Player.X, Simulation.Player.Y)) > .0001f) a2rPlay.failures.Add("Pair camera/player pose drift: " + id);
        }

        [Serializable] sealed class SwampProofReceipt
        {
            public bool initialCommandLineOffVerified;
            public int shoreSegments, visibleDebris, frames;
            public int fps = 30, width = 3840, height = 1080;
            public bool visualPass = false, macVerified = false;
            public string scope = "Actual Player frames; bridge-north is a fixed-pose fixture. Visual judgement remains separate.";
        }
    }
}
