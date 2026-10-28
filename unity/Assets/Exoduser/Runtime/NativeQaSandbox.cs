using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // QA / automated runs must never read or write the player's real save, settings or character roster (LocalLow\ForDearGamers\<product>).
    // `--unity-qa-sandbox <absolute dir>` points every persistentDataPath consumer (character roster, combat save next to it, native settings,
    // forge capture default) at that folder. `--unity-m1-check` in -batchmode without the argument gets <persistentDataPath>\qa\<time>-<pid> automatically.
    // Ordinary play (no argument, not m1-check in batchmode) keeps persistentDataPath untouched.
    public static class NativeQaSandbox
    {
        public const string Argument = "--unity-qa-sandbox";
        static string root; static bool resolved;
        public static string Root { get { if (!resolved) { resolved = true; root = Compute(); } return root; } }
        public static bool Active { get { return !string.IsNullOrEmpty(Root); } }
        public static string Resolve(string persistentRoot) { return Active ? Root : persistentRoot; }
        static string Compute()
        {
            var args = Environment.GetCommandLineArgs(); int at = Array.IndexOf(args, Argument);
            bool automatic = Application.isBatchMode && Array.IndexOf(args, "--unity-m1-check") >= 0;
            if (at < 0 && !automatic) return "";
            try
            {
                string dir = "";
                if (at >= 0 && at + 1 < args.Length && !args[at + 1].StartsWith("-", StringComparison.Ordinal) && Path.IsPathRooted(args[at + 1])) dir = Path.GetFullPath(args[at + 1]);
                if (dir.Length == 0) dir = Path.Combine(Application.persistentDataPath, "qa", DateTime.Now.ToString("yyyyMMdd-HHmmss") + "-" + System.Diagnostics.Process.GetCurrentProcess().Id);
                Directory.CreateDirectory(dir);
                return dir;
            }
            catch (Exception e) { Debug.LogWarning("QA sandbox could not be created: " + e.Message); return ""; }
        }
    }
}
