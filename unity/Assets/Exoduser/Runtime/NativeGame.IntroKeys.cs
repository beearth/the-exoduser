using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-intro-keys-smoke -output <dir>`: walks the intro with injected keys (LobbyKeys, no window) and records what each key did on each stage, for the side-by-side with the
    // web index.html (FDG logo: any key; title: Enter / Space; door video: Enter / Space do nothing; world intro: Enter / Space / Right = next cue, hold Esc / Space 5 s = finish).
    public sealed partial class NativeGame
    {
        [Serializable] sealed class IntroKeysStep { public string name, before, after, note; public double timeBefore, timeAfter; }
        [Serializable] sealed class IntroKeysReceipt { public List<IntroKeysStep> steps = new List<IntroKeysStep>(); public string finalStage; public bool reachedLobby; }

        IEnumerator IntroKeysSmoke()
        {
            AudioListener.volume = 0;
            string output = Argument("-output"); if (!string.IsNullOrEmpty(output)) Directory.CreateDirectory(output);
            var rc = new IntroKeysReceipt(); double Now() { return Time.realtimeSinceStartupAsDouble; }
            Action<string, string, string, double, double> add = (n, b, a, tb, ta) => rc.steps.Add(new IntroKeysStep { name = n, before = b, after = a, timeBefore = tb, timeAfter = ta });
            lobby.SetPlaybackFocus(true); lobby.AutomatedInput = false; lobby.Begin(); yield return null;
            double limit = Now() + 40;
            while ((lobby.StageName != "FDG" || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && Now() < limit) yield return null;
            yield return new WaitForSecondsRealtime(.5f);
            {   // A. no key on the title splash for 16 s (longer than the 7.3 s title movie): does it advance by itself, does the movie loop?
                LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
                var a = new IntroKeysStep { name = "A idle title splash 16 s", before = lobby.StageName }; double maxT = 0, endT = 0; double idle0 = Now(); bool looped = false; double prevT = 0;
                while (Now() - idle0 < 16) { double tt = lobby.CurrentVideo.Time; if (tt < prevT - 1) looped = true; prevT = tt; maxT = Math.Max(maxT, tt); yield return null; }
                a.after = lobby.StageName; a.timeAfter = lobby.CurrentVideo.Time; a.note = "max movie time " + maxT.ToString("0.0", CultureInfo.InvariantCulture) + ", looped " + looped + ", duration " + lobby.CurrentVideo.Duration.ToString("0.0", CultureInfo.InvariantCulture) + ", ended " + lobby.CurrentVideo.Ended; rc.steps.Add(a);
                lobby.Begin(); yield return null; limit = Now() + 40;
                while ((lobby.StageName != "FDG" || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && Now() < limit) yield return null;
                yield return new WaitForSecondsRealtime(.5f);
            }
            // 1. FDG logo: any key -> title splash
            string b0 = lobby.StageName; LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("FDG: Enter", b0, lobby.StageName, 0, 0);
            // 2. title splash: any key -> title page
            limit = Now() + 10; while ((!lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && Now() < limit) yield return null;
            limit = Now() + 12; while (lobby.CurrentVideo.Time < 4.8 && Now() < limit) yield return null;   // DT-16 pressed Enter at about 4.8 s of the title movie
            b0 = lobby.StageName; double tTitle = lobby.CurrentVideo.Time; LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("title splash: Enter at 4.8 s", b0, lobby.StageName, tTitle, lobby.CurrentVideo.Time);
            // 3. title page: Enter -> gate (door video)
            limit = Now() + 10; while ((!lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && Now() < limit) yield return null;
            yield return new WaitForSecondsRealtime(.5f);
            b0 = lobby.StageName; LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("title: Enter", b0, lobby.StageName, 0, 0);
            // 4. gate (door video): Enter / Space must NOT skip it (web: _cinReady only after the door video ended); record what happens
            limit = Now() + 20; while ((lobby.Flow.Page != LobbyPage.Gate || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Time < 1) && Now() < limit) yield return null;
            b0 = lobby.StageName; double t0 = lobby.CurrentVideo.Time;
            LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("gate door video: Enter", b0, lobby.StageName, t0, lobby.CurrentVideo.Time);
            b0 = lobby.StageName; t0 = lobby.CurrentVideo.Time;
            LobbyKeys.Press(KeyCode.Space); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("gate door video: Space", b0, lobby.StageName, t0, lobby.CurrentVideo.Time);
            // 5. world intro: wait for it to play
            limit = Now() + 40; while ((lobby.Flow.Page != LobbyPage.WorldIntro || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Time < 1.5) && Now() < limit) yield return null;
            string[] names = { "world intro: Enter", "world intro: Space", "world intro: RightArrow" }; KeyCode[] keys = { KeyCode.Return, KeyCode.Space, KeyCode.RightArrow };
            for (int i = 0; i < keys.Length; i++)
            {
                yield return new WaitForSecondsRealtime(.6f);
                b0 = lobby.StageName; t0 = lobby.CurrentVideo.Time;
                LobbyKeys.Press(keys[i]); yield return null; yield return null; yield return new WaitForSecondsRealtime(.4f);
                var step = new IntroKeysStep { name = names[i], before = b0, after = lobby.StageName, timeBefore = t0, timeAfter = lobby.CurrentVideo.Time };
                step.note = "next cue " + lobby.Flow.NextCut(Math.Max(0, t0 - NativeLobby.WorldCueOffset)).ToString("0.###", CultureInfo.InvariantCulture); rc.steps.Add(step);
            }
            // 6. hold Esc 5 s -> finish the intro
            yield return new WaitForSecondsRealtime(.6f);
            b0 = lobby.StageName; t0 = lobby.CurrentVideo.Time; LobbyKeys.Hold(KeyCode.Escape, true);
            double held0 = Now(); while (lobby.Flow.Page == LobbyPage.WorldIntro && Now() - held0 < 8) yield return null;
            LobbyKeys.Hold(KeyCode.Escape, false);
            var hold = new IntroKeysStep { name = "world intro: hold Escape", before = b0, after = lobby.StageName, timeBefore = t0, timeAfter = lobby.CurrentVideo.Time, note = "held " + (Now() - held0).ToString("0.0", CultureInfo.InvariantCulture) + " s" };
            rc.steps.Add(hold);
            rc.finalStage = lobby.StageName; rc.reachedLobby = lobby.Flow.Page == LobbyPage.Lobby;
            LobbyKeys.ReleaseAll();
            Debug.Log("INTRO_KEYS " + JsonUtility.ToJson(rc));
            if (!string.IsNullOrEmpty(output)) File.WriteAllText(Path.Combine(output, "intro-keys.json"), JsonUtility.ToJson(rc, true));
            Application.Quit();
        }

        bool introKeysSmoke;   // NativeGame.Update forces AutomatedInput = lobbySmoke every frame; this keeps the lobby reading keys
        void StartIntroKeysSmoke() { lobbySmoke = true; introKeysSmoke = true; lobby.AutomatedInput = false; StartCoroutine(IntroKeysSmoke()); }
    }
}
