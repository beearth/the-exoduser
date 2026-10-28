using System;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // QA / automated runs must never read or write the player's real save, settings or character roster (LocalLow\ForDearGamers\<product>).
    // `--unity-qa-sandbox <absolute dir>` points every persistentDataPath consumer (character roster, combat save next to it, native settings,
    // forge capture default) at that folder. an automated run (QaRunPolicy: -batchmode or a QA argument) without the argument gets <persistentDataPath>\qa\<time>-<pid> automatically.
    // Ordinary play (no argument, not m1-check in batchmode) keeps persistentDataPath untouched.
    // FAIL-CLOSED: when a sandbox was requested (argument present, or batchmode m1-check) and it cannot be created, the run logs an error, quits with exit code 3
    // and throws, so nothing ever falls back to the real persistentDataPath.
    public static class NativeQaSandbox
    {
        public const string Argument = "--unity-qa-sandbox";
        public const int FailureExitCode = 3;
        static string root; static bool resolved;
        public static string Root { get { if (!resolved) { root = Compute(); resolved = true; } return root; } }
        public static bool Active { get { return !string.IsNullOrEmpty(Root); } }
        public static string Resolve(string persistentRoot) { return Active ? Root : persistentRoot; }
        static string Compute()
        {
            var args = Environment.GetCommandLineArgs(); int at = Array.IndexOf(args, Argument);
            bool automatic = QaRunPolicy.IsAutomated(args, Application.isBatchMode);   // batchmode, or any --unity-*-smoke/-capture/-review/-check/--unity-qa-* argument
            if (at < 0 && !automatic) return "";
            string reason = "";
            try
            {
                string dir = "";
                if (at >= 0)
                {
                    string value = at + 1 < args.Length ? args[at + 1] : "";
                    if (string.IsNullOrWhiteSpace(value) || value.StartsWith("-", StringComparison.Ordinal) || !Path.IsPathRooted(value)) reason = Argument + " needs an absolute folder, got '" + value + "'";
                    else dir = Path.GetFullPath(value);
                }
                else dir = Path.Combine(Application.persistentDataPath, "qa", DateTime.Now.ToString("yyyyMMdd-HHmmss") + "-" + System.Diagnostics.Process.GetCurrentProcess().Id);
                if (reason.Length == 0)
                {
                    Directory.CreateDirectory(dir);
                    string probe = Path.Combine(dir, ".write-test"); File.WriteAllText(probe, "ok"); File.Delete(probe);   // a folder that exists but cannot be written is a failure too
                    return dir;
                }
            }
            catch (Exception e) { reason = e.GetType().Name + ": " + e.Message; }
            Debug.LogError("QA SANDBOX FAILED, refusing to touch the real persistentDataPath: " + reason);
            Application.Quit(FailureExitCode);
            throw new InvalidOperationException("QA sandbox unavailable: " + reason);
        }
    }
}
