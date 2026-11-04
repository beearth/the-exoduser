using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Tools
{
    // PC-QUIT-1 A/B (2026-11-04): `--unity-quit-path-check <path> -output <absolute dir>` (QA sandbox required). Drives ONE quit path of the real Player and writes the state at the
    // moment of the quit request to quit-path-check.json (also logged as QUIT_PATH_CHECK), so the caller can compare the exit code, the [HardExit] log line, the save/settings
    // mtimes in the sandbox and the Screenmanager registry before/after. Nothing here changes product code paths; the close requests reach the product exactly as the OS sends them.
    //   x        WM_SYSCOMMAND SC_CLOSE to the own Unity window (what the title-bar X button sends) once the lobby is up.
    //   altf4    WM_SYSKEYDOWN Alt / F4 with the Alt context bit (DefWindowProc turns it into SC_CLOSE), then the key-ups.
    //   code0|code2|code3   WindowsHardExit.Quit(n) once the lobby is up (QA exit-code contract).
    //   loading  SC_CLOSE right after entering the field while the forest 3D entry load is still running (pass --remodel3d, as the shipped shortcut does).
    //   fallen   enter the field, continue with a virtual Enter (product path), make the hero fall through Core HurtPlayer (never faking State/Hp), wait 1.5 s, SC_CLOSE.
    //   video-x  SC_CLOSE while the FDG lobby movie plays (NativeLobbyVideo.OnWantsToQuit defers the quit until the decoders are closed).
    // The pause-menu quit is covered by --unity-pause-input-check. If a posted close has no effect within 10 s the check ends itself with exit code 4 (= "close message ignored"),
    // so the runner never mistakes an ignored message for a shutdown stall.
    internal sealed class QuitPathCheck : MonoBehaviour
    {
        const string Flag = "--unity-quit-path-check";
        const uint WM_SYSCOMMAND = 0x0112, WM_SYSKEYDOWN = 0x0104, WM_SYSKEYUP = 0x0105, WM_KEYUP = 0x0101;
        const int SC_CLOSE = 0xF060, VK_MENU = 0x12, VK_F4 = 0x73;

        [Serializable] sealed class FileStamp { public string name; public long length; public string mtimeUtc; }
        [Serializable] sealed class Receipt
        {
            public string scope = "격리 실제 Player 종료 경로 1회. 요청 순간 상태와 격리 저장 파일 mtime. 종료 뒤 판정(종료 코드·[HardExit]·mtime 변화·레지스트리)은 호출 쪽";
            public string path, stageName, page, playerState, error, sandbox, hardExit, gamepadBackend;
            public bool windowFound, posted, lobbyBlocking, remodelRequested, remodelActive, videoPrepared, videoPlaying, running, fallen;
            public int loadPhase, width, height;
            public double videoTime, hp;
            public float requestedAtRealtime;
            public string requestedAtUtc;
            public List<FileStamp> sandboxFilesAtRequest = new List<FileStamp>();
        }

        delegate bool WindowCallback(IntPtr window, IntPtr state);
        [StructLayout(LayoutKind.Sequential)] struct ClientRect { public int left, top, right, bottom; }
        [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback, IntPtr state);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window, out uint process);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassNameW(IntPtr window, System.Text.StringBuilder name, int size);
        [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr window);
        [DllImport("kernel32.dll")] static extern uint GetCurrentProcessId();
        [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr window, uint message, IntPtr w, IntPtr l);

        static string Arg(string key) { var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, key); return i >= 0 && i + 1 < a.Length ? a[i + 1] : null; }
        static object Get(object o, string k) => o.GetType().GetField(k, BindingFlags.Instance | BindingFlags.NonPublic).GetValue(o);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot() { if (Array.IndexOf(Environment.GetCommandLineArgs(), Flag) >= 0) new GameObject("Quit path isolated check").AddComponent<QuitPathCheck>(); }

        readonly Receipt receipt = new Receipt();
        string output;
        NativeGame game; NativeLobby lobby; Keyboard keyboard;

        IEnumerator Start()
        {
            receipt.path = (Arg(Flag) ?? "").ToLowerInvariant();
            output = Arg("-output");
            receipt.sandbox = NativeQaSandbox.Root;
            receipt.hardExit = Array.IndexOf(Environment.GetCommandLineArgs(), WindowsHardExit.DisableFlag) >= 0 ? "disabled" : Application.isBatchMode ? "batchmode-off" : "on";
            if (!NativeQaSandbox.Active || string.IsNullOrEmpty(output) || !Path.IsPathRooted(output)) { Debug.LogError("QUIT_PATH_REJECT: sandbox and absolute -output required"); WindowsHardExit.Quit(2); yield break; }
            Directory.CreateDirectory(output);
            AudioListener.volume = 0; Application.runInBackground = true;
            float until = Time.realtimeSinceStartup + 30;
            while (NativeGame.Instance == null && Time.realtimeSinceStartup < until) yield return null;
            game = NativeGame.Instance; if (game == null) { Fail("NativeGame missing"); yield break; }
            lobby = game.GetComponent<NativeLobby>(); if (lobby == null) { Fail("NativeLobby missing"); yield break; }
            yield return null;
            switch (receipt.path)
            {
                case "x": case "altf4": case "code0": case "code2": case "code3": yield return Lobby(); break;
                case "video-x": yield return Video(); break;
                case "loading": yield return Field(false); break;
                case "fallen": yield return Field(true); break;
                default: Fail("unknown path '" + receipt.path + "' (x|altf4|code0|code2|code3|loading|fallen|video-x)"); yield break;
            }
        }

        IEnumerator Lobby()
        {
            float until = Time.realtimeSinceStartup + 6;   // the normal boot (splash / FDG / title) keeps running; only the request is injected
            while (Time.realtimeSinceStartup < until) yield return null;
            if (receipt.path.StartsWith("code", StringComparison.Ordinal)) { int code = receipt.path[4] - '0'; Record(); WriteReceipt(); WindowsHardExit.Quit(code); yield break; }
            yield return Close(receipt.path == "altf4");
        }

        IEnumerator Video()
        {
            lobby.SetPlaybackFocus(true); lobby.Begin(); yield return null;   // same start as --unity-quit-during-video (DBT-5)
            float limit = Time.realtimeSinceStartup + 40;
            while ((lobby.StageName != "FDG" || !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0) && Time.realtimeSinceStartup < limit) yield return null;
            if (lobby.StageName != "FDG" || !lobby.CurrentVideo.Prepared) receipt.error = "FDG movie not prepared within 40 s";
            float played = Time.realtimeSinceStartup + 2; while (Time.realtimeSinceStartup < played) yield return null;
            yield return Close(false);
        }

        IEnumerator Field(bool fall)
        {
            lobby.SetPlaybackFocus(true); lobby.AutomatedInput = false; lobby.ShowLobby(); lobby.SelectPreview();
            if (!lobby.EnterNativeTest()) { Fail("EnterNativeTest refused"); yield break; }
            game.SetGameFocus(true);
            if (!fall)
            {
                yield return null; yield return null;   // the entry load (lobby transition + forest 3D) is now running
                if (!(NativeRemodel3D.Requested && !NativeRemodel3D.Active) && !lobby.IsBlocking) receipt.error = "entry load already finished before the close request";
                yield return Close(false); yield break;
            }
            float until = Time.realtimeSinceStartup + 10;
            while ((lobby.IsBlocking || (bool)Get(game, "frontendEntryInputFence")) && Time.realtimeSinceStartup < until) yield return null;
            until = Time.realtimeSinceStartup + 45;
            while (NativeRemodel3D.Requested && !NativeRemodel3D.Active && Time.realtimeSinceStartup < until) yield return null;
            yield return null; yield return null;
            keyboard = InputSystem.AddDevice<Keyboard>(); keyboard.MakeCurrent(); InputSystem.QueueStateEvent(keyboard, new KeyboardState()); yield return null;
            InputSystem.QueueStateEvent(keyboard, new KeyboardState(UnityEngine.InputSystem.Key.Enter)); yield return null; yield return null;   // product "continue" after the load
            InputSystem.QueueStateEvent(keyboard, new KeyboardState()); yield return null; yield return null;
            if (!game.Running) receipt.error = "field did not start running after Enter";
            var sim = game.Simulation; var p = sim.Player;
            for (int i = 0; i < 400 && p.State != "fallen" && p.State != "dead"; i++) { p.Iframes = 0; sim.HurtPlayer(99999); }
            receipt.fallen = p.State == "fallen";
            if (!receipt.fallen) receipt.error = (receipt.error == null ? "" : receipt.error + " | ") + "Core HurtPlayer did not reach fallen: " + p.State;
            float wait = Time.realtimeSinceStartup + 1.5f; while (Time.realtimeSinceStartup < wait) yield return null;   // fallen presentation ticks
            yield return Close(false);
        }

        IEnumerator Close(bool altF4)
        {
            IntPtr window = OwnWindow(); receipt.windowFound = window != IntPtr.Zero;
            Record(); WriteReceipt();
            if (!receipt.windowFound) { Fail("own Unity window not found"); yield break; }
            if (altF4)
            {
                IntPtr altDown = (IntPtr)(1 | (0x38 << 16) | (1 << 29)), f4Down = (IntPtr)(1 | (0x3E << 16) | (1 << 29));
                IntPtr f4Up = (IntPtr)unchecked((int)(1u | (0x3Eu << 16) | (1u << 29) | (1u << 30) | (1u << 31))), altUp = (IntPtr)unchecked((int)(1u | (0x38u << 16) | (1u << 30) | (1u << 31)));
                receipt.posted = PostMessageW(window, WM_SYSKEYDOWN, (IntPtr)VK_MENU, altDown) & PostMessageW(window, WM_SYSKEYDOWN, (IntPtr)VK_F4, f4Down)
                               & PostMessageW(window, WM_SYSKEYUP, (IntPtr)VK_F4, f4Up) & PostMessageW(window, WM_KEYUP, (IntPtr)VK_MENU, altUp);
            }
            else receipt.posted = PostMessageW(window, WM_SYSCOMMAND, (IntPtr)SC_CLOSE, IntPtr.Zero);
            WriteReceipt();
            Debug.Log("QUIT_PATH_CHECK " + JsonUtility.ToJson(receipt));
            float until = Time.realtimeSinceStartup + 10; while (Time.realtimeSinceStartup < until) yield return null;
            receipt.error = (receipt.error == null ? "" : receipt.error + " | ") + "close message had no effect within 10 s";
            WriteReceipt(); Debug.LogError("QUIT_PATH_NO_EFFECT " + receipt.path); WindowsHardExit.Quit(4);
        }

        void Record()
        {
            receipt.requestedAtRealtime = Time.realtimeSinceStartup; receipt.requestedAtUtc = DateTime.UtcNow.ToString("o");
            receipt.width = Screen.width; receipt.height = Screen.height;
            try
            {
                receipt.stageName = lobby.StageName; receipt.page = lobby.Flow.Page.ToString(); receipt.lobbyBlocking = lobby.IsBlocking;
                var movie = lobby.CurrentVideo; receipt.videoPrepared = movie != null && movie.Prepared; receipt.videoTime = movie != null ? movie.Time : 0;
                receipt.videoPlaying = movie != null && movie.Player != null && movie.Player.isPlaying;
                receipt.remodelRequested = NativeRemodel3D.Requested; receipt.remodelActive = NativeRemodel3D.Active;
                receipt.running = game.Running; receipt.loadPhase = game.Simulation.Stage.LoadPhase;
                receipt.playerState = game.Simulation.Player.State; receipt.hp = game.Simulation.Player.Hp;
            }
            catch (Exception e) { receipt.error = (receipt.error == null ? "" : receipt.error + " | ") + "state read: " + e.Message; }
            receipt.sandboxFilesAtRequest.Clear();
            try
            {
                foreach (var f in Directory.GetFiles(NativeQaSandbox.Root, "*", SearchOption.AllDirectories))
                {
                    var info = new FileInfo(f);
                    receipt.sandboxFilesAtRequest.Add(new FileStamp { name = f.Substring(NativeQaSandbox.Root.Length).TrimStart('\\', '/'), length = info.Length, mtimeUtc = info.LastWriteTimeUtc.ToString("o") });
                }
            }
            catch (Exception e) { receipt.error = (receipt.error == null ? "" : receipt.error + " | ") + "sandbox list: " + e.Message; }
        }

        void WriteReceipt() { try { File.WriteAllText(Path.Combine(output, "quit-path-check.json"), JsonUtility.ToJson(receipt, true)); } catch (Exception e) { Debug.LogError("QUIT_PATH_RECEIPT_FAILED " + e.Message); } }

        void Fail(string why) { receipt.error = (receipt.error == null ? "" : receipt.error + " | ") + why; Debug.LogError("QUIT_PATH_FAILED " + why); if (output != null) WriteReceipt(); WindowsHardExit.Quit(2); }

        IntPtr OwnWindow()
        {
            IntPtr found = IntPtr.Zero; uint own = GetCurrentProcessId();
            EnumWindows((w, state) =>
            {
                GetWindowThreadProcessId(w, out uint pid); if (pid != own) return true;
                var name = new System.Text.StringBuilder(128); GetClassNameW(w, name, 128);
                if (name.ToString() == "UnityWndClass" && IsWindowVisible(w)) { found = w; return false; }
                return true;
            }, IntPtr.Zero);
            return found;
        }
    }
}
