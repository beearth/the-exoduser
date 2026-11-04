using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
#if UNITY_STANDALONE_WIN && !UNITY_EDITOR
using System.Runtime.InteropServices;
#endif

namespace Exoduser.UnityPort
{
    // PC-QUIT-1 (2026-11-04): Windows 11 + Input System (+ Windows.Gaming.Input) can hang inside RoUninitialize while the player shuts down, leaving
    // EXODUSER-Unity.exe alive as a zombie after "Input System module state changed to: Shutdown." / "CodeReloadManager destroyed".
    // Workaround (Unity Discussions "[BUG] Unity 6 Build Game Process Continues Running in Background After Closing Window"; Unity Issue Tracker
    // "Player .exe remains open as a background task after closing it when Active Input Handling is set to Input System Package (New)"):
    // once every game-level quit step has finished, end the process with kernel32 TerminateProcess instead of letting the engine run its native teardown.
    //
    // Contract:
    //  * Every quit in the Runtime goes through Quit(code) so the requested exit code survives (Unity exposes no way to read it later). Non-zero wins over zero.
    //  * X button / Alt+F4 never call Quit; they use the default code 0 and reach the same Application.quitting hook.
    //  * Application.quitting is the last managed callback. Whether OnApplicationQuit always runs BEFORE quitting is UNVERIFIED (not confirmed against Unity docs or a
    //    Player log). So the owners of game data register RegisterFlush (fallback, skipped when MarkApplicationQuitSeen ran) and files normally written from
    //    OnDestroy/OnDisable (which never run under a hard exit) register RegisterFinalFlush (always runs). Then PlayerPrefs.Save() and TerminateProcess.
    //  * QA capture writer: NativeQaCaptureWriter drains on a Task.Run background thread (QA only); its owner's final flush waits for Idle (bounded) before exit.
    //  * Application.Quit(int) must not be called directly from Runtime or Player-built Tools (source check in tools/ tests); a direct call turns exit code 2 into 0.
    //  * `--unity-no-hard-exit` restores the original Unity shutdown (diagnostics). Editor and non-Windows players are never affected.
    public static class WindowsHardExit
    {
        public const string DisableFlag = "--unity-no-hard-exit";
        static readonly List<Action> flushes = new List<Action>();
        static readonly List<Action> finalFlushes = new List<Action>();
        static int requestedCode;
        static bool codeRequested, appQuitSeen, installed;

        public static int RequestedCode => requestedCode;
        public static bool CodeRequested => codeRequested;

        /// <summary>Records the exit code and asks Unity to quit. Replacement for Application.Quit(int) everywhere in the Runtime.</summary>
        public static void Quit(int code = 0)
        {
            if (code != 0 || !codeRequested) requestedCode = code;
            codeRequested = true;
            Application.Quit(code);
        }

        /// <summary>Idempotent last-chance flush (settings/save/log). Used only if the hard exit would run before the owner's OnApplicationQuit.</summary>
        public static void RegisterFlush(Action flush)
        {
            if (flush != null && !flushes.Contains(flush)) flushes.Add(flush);
        }

        /// <summary>Flush that ALWAYS runs just before the hard exit, even if OnApplicationQuit ran. For files normally written from OnDestroy/OnDisable and for QA receipts. Must be idempotent and null-safe.</summary>
        public static void RegisterFinalFlush(Action flush)
        {
            if (flush != null && !finalFlushes.Contains(flush)) finalFlushes.Add(flush);
        }

        /// <summary>Called from every OnApplicationQuit that writes game data, so the fallback flush is skipped when the normal path already ran.</summary>
        public static void MarkApplicationQuitSeen() { appQuitSeen = true; }

        internal static bool Disabled => Array.IndexOf(Environment.GetCommandLineArgs(), DisableFlag) >= 0;

        internal static void RunFallbackFlushes()
        {
            if (appQuitSeen) return;
            foreach (var flush in flushes.ToArray())
            {
                try { flush(); } catch (Exception e) { Debug.LogWarning("[HardExit] flush failed: " + e.Message); }
            }
        }

        internal static void RunFinalFlushes()
        {
            foreach (var flush in finalFlushes.ToArray())
            {
                try { flush(); } catch (Exception e) { Debug.LogWarning("[HardExit] final flush failed: " + e.Message); }
            }
        }

        internal static string DescribeReason() => codeRequested ? "app-quit-request" : "window-close-or-engine-quit";

#if UNITY_STANDALONE_WIN && !UNITY_EDITOR
        [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll", SetLastError = true)] static extern bool TerminateProcess(IntPtr process, uint exitCode);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Install()
        {
            if (installed) return;
            installed = true;
            if (Disabled) { Debug.Log("[HardExit] disabled by " + DisableFlag); return; }
            Application.quitting += OnQuitting;
        }

        static void OnQuitting()
        {
            Application.quitting -= OnQuitting;
            int code = requestedCode;
            string reason = DescribeReason() + (appQuitSeen ? "" : "+fallback-flush");
            try { RunFallbackFlushes(); } catch { }
            try { RunFinalFlushes(); } catch { }
            // Engine Screenmanager keys (resolution, window position, fullscreen) can otherwise be lost if the engine writes them only during native teardown.
            try { PlayerPrefs.Save(); } catch { }
            string line = "[HardExit] code=" + code + " reason=" + reason;
            Debug.Log(line);
            AppendToLogFile(line);
            TerminateProcess(GetCurrentProcess(), unchecked((uint)code));
        }

        // Debug.Log goes through Unity's log thread; mirror the single line straight into the -logFile so it survives TerminateProcess.
        static void AppendToLogFile(string line)
        {
            try
            {
                var args = Environment.GetCommandLineArgs();
                int at = Array.IndexOf(args, "-logFile");
                if (at < 0 || at + 1 >= args.Length || args[at + 1] == "-") return;
                using (var stream = new FileStream(args[at + 1], FileMode.Append, FileAccess.Write, FileShare.ReadWrite | FileShare.Delete))
                using (var writer = new StreamWriter(stream)) { writer.WriteLine(line + " (direct)"); writer.Flush(); stream.Flush(true); }
            }
            catch { }
        }
#endif
    }
}
