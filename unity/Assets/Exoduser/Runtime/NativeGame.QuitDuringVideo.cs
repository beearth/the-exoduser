using System;
using System.Collections;
using System.Globalization;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // DBT-5 repro: `--unity-quit-during-video <fdg|world> <seconds>`. Plays the lobby movie of that stage for <seconds> of real time and then calls Application.Quit() while the
    // Media Foundation decoder is still running (the case that ended in 0xC000041D on the way out). Silent (AudioListener.volume = 0), no window needed (-batchmode without
    // -nographics keeps the real GPU). `-output <dir>` receives quit-during-video.json. The cleanup under test is NativeLobbyVideo.OnWantsToQuit; the diagnostic switch
    // `--unity-skip-video-quit-cleanup` turns it off so the same build shows the "before" behaviour.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class QuitDuringVideoReceipt { public string stage, stageName, error; public bool reached, playing, prepared, cleanupSkipped; public double videoTime, wallPlayed; public long frame; }

        IEnumerator QuitDuringVideo(string stage, double seconds)
        {
            AudioListener.volume = 0;   // silent; AudioListener.pause is NOT used: the movie clock must keep running
            string output = Argument("-output"); if (!string.IsNullOrEmpty(output)) Directory.CreateDirectory(output);
            var receipt = new QuitDuringVideoReceipt { stage = stage, cleanupSkipped = NativeLobbyVideo.DiagnosticSkipQuitCleanup };
            lobby.SetPlaybackFocus(true); lobby.Begin(); yield return null;   // Begin(): the saved settings of this PC say the intro was seen, so the game would otherwise start at the lobby page
            double limit = LobbyNow + 40, nextLog = 0;
            Action<string> trace = where =>
            {
                if (LobbyNow < nextLog) return; nextLog = LobbyNow + 1;
                var m = lobby.CurrentVideo; var pl = m.Player;
                Debug.Log("QDV_WAIT " + where + " stageName=" + lobby.StageName + " prepared=" + m.Prepared + " frame=" + m.Frame + " time=" + m.Time.ToString("0.00", CultureInfo.InvariantCulture) + " playing=" + (pl != null && pl.isPlaying) + " error=" + m.Error);
            };
            if (stage == "fdg")
            {
                while ((lobby.StageName != "FDG" || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && LobbyNow < limit) { trace("fdg"); yield return null; }
                receipt.reached = lobby.StageName == "FDG" && lobby.CurrentVideo.Prepared;
            }
            else
            {
                lobby.AdvanceSplash(); yield return null; lobby.AdvanceSplash(); yield return null;
                while ((!lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && LobbyNow < limit) { trace("gate"); yield return null; }
                lobby.StartGate(); limit = LobbyNow + 40;
                while ((lobby.Flow.Page != LobbyPage.WorldIntro || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Time < 1) && LobbyNow < limit) { trace("world"); yield return null; }
                receipt.reached = lobby.Flow.Page == LobbyPage.WorldIntro && lobby.CurrentVideo.Prepared;
            }
            double started = LobbyNow; while (LobbyNow - started < seconds) { trace("play"); yield return null; }
            var movie = lobby.CurrentVideo; var player = movie.Player;
            receipt.stageName = lobby.StageName; receipt.prepared = movie.Prepared; receipt.playing = player != null && player.isPlaying; receipt.videoTime = movie.Time; receipt.frame = movie.Frame; receipt.wallPlayed = LobbyNow - started; receipt.error = movie.Error;
            Debug.Log("QUIT_DURING_VIDEO " + JsonUtility.ToJson(receipt));
            if (!string.IsNullOrEmpty(output)) File.WriteAllText(Path.Combine(output, "quit-during-video.json"), JsonUtility.ToJson(receipt, true));
            Application.Quit();
        }

        // DBT-8 check: `--unity-missing-movie-check` (with `--unity-lobby-hide-movie <file>`) walks FDG -> title -> gate -> world intro with that movie missing and records how often
        // movies were requested and whether the lobby page is reached on its own. `-output <dir>` receives missing-movie-check.json.
        [Serializable] sealed class MissingMovieReceipt { public string hidden, finalPage, error; public bool reachedLobby; public double secondsToLobby, secondsObserved; public int openCalls, prepareCalls, errorEvents, openCallsAtLobby, openCallsAfterLobbyWait; }

        IEnumerator MissingMovieCheck()
        {
            AudioListener.volume = 0;
            string output = Argument("-output"); if (!string.IsNullOrEmpty(output)) Directory.CreateDirectory(output);
            var receipt = new MissingMovieReceipt { hidden = NativeLobbyVideo.HiddenMovie ?? "" };
            lobby.SetPlaybackFocus(true); lobby.Begin(); yield return null;
            double t0 = LobbyNow, limit = t0 + 90;
            lobby.AdvanceSplash(); yield return null; lobby.AdvanceSplash(); yield return null;
            while ((!lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && LobbyNow < t0 + 20) yield return null;
            lobby.StartGate();
            while (lobby.Flow.Page != LobbyPage.Lobby && LobbyNow < limit) yield return null;
            receipt.reachedLobby = lobby.Flow.Page == LobbyPage.Lobby; receipt.secondsToLobby = LobbyNow - t0; receipt.openCallsAtLobby = NativeLobbyVideo.OpenCalls;
            double w0 = LobbyNow; while (LobbyNow - w0 < 6) yield return null;
            receipt.secondsObserved = LobbyNow - w0; receipt.openCallsAfterLobbyWait = NativeLobbyVideo.OpenCalls;
            receipt.openCalls = NativeLobbyVideo.OpenCalls; receipt.prepareCalls = NativeLobbyVideo.PrepareCalls; receipt.errorEvents = NativeLobbyVideo.ErrorEvents; receipt.finalPage = lobby.Flow.Page.ToString(); receipt.error = lobby.CurrentVideo.Error;
            Debug.Log("MISSING_MOVIE_CHECK " + JsonUtility.ToJson(receipt));
            if (!string.IsNullOrEmpty(output)) File.WriteAllText(Path.Combine(output, "missing-movie-check.json"), JsonUtility.ToJson(receipt, true));
            Application.Quit();
        }

        void StartMissingMovieCheck() { lobbySmoke = true; lobby.AutomatedInput = true; StartCoroutine(MissingMovieCheck()); }

        void StartQuitDuringVideo()
        {
            var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, "--unity-quit-during-video");
            string stage = i + 1 < a.Length ? a[i + 1] : "fdg"; double seconds = 2;
            if (i + 2 < a.Length) double.TryParse(a[i + 2], NumberStyles.Float, CultureInfo.InvariantCulture, out seconds);
            lobbySmoke = true; lobby.AutomatedInput = true; StartCoroutine(QuitDuringVideo(stage, seconds));
        }
    }
}
