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
            {   // title menu (web phase 2): labels, Down / Up / S / W move with wrap, a key that is not a menu key does nothing, Enter runs the selected row
                yield return null;
                rc.steps.Add(new IntroKeysStep { name = "title menu rows", before = lobby.StageName, after = lobby.StageName, note = string.Join(" | ", new List<string>(lobby.TitleLabels).ToArray()) + "; selected " + lobby.TitleSelected });
                int rows = lobby.TitleLabels.Count;
                KeyCode[] seq = { KeyCode.DownArrow, KeyCode.UpArrow, KeyCode.S, KeyCode.W, KeyCode.W, KeyCode.DownArrow, KeyCode.A, KeyCode.Escape, KeyCode.Tab };
                string[] seqNames = { "Down", "Up", "S", "W", "W (wrap up)", "Down (wrap down)", "A (not a menu key)", "Escape (not a menu key)", "Tab (not a menu key)" };
                for (int i = 0; i < seq.Length; i++)
                {
                    int before = lobby.TitleSelected; string stg = lobby.StageName; LobbyKeys.Press(seq[i]); yield return null; yield return null; yield return null;
                    rc.steps.Add(new IntroKeysStep { name = "title menu: " + seqNames[i], before = stg, after = lobby.StageName, note = "selected " + before + " -> " + lobby.TitleSelected + " of " + rows });
                }
            }
            b0 = lobby.StageName; double tTitle = lobby.CurrentVideo.Time; LobbyKeys.Press(KeyCode.Return); yield return null; yield return null; yield return new WaitForSecondsRealtime(.3f);
            add("title menu: Enter on the selected row (start game)", b0, lobby.StageName, tTitle, lobby.CurrentVideo.Time);
            // 인장에서 ENTER → 현행 세계관 영상. 옛 문을 기다리지 않는다.
            yield return new WaitForSecondsRealtime(.5f);
            b0=lobby.StageName;LobbyKeys.Press(KeyCode.Return);yield return null;yield return null;
            add("인장 ENTER 직결",b0,lobby.StageName,0,lobby.CurrentVideo.Time);
            double t0=0;
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
