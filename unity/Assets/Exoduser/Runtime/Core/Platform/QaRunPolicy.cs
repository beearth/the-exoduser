using System;

namespace Exoduser.UnityPort.Core
{
    // One place that decides "this is an automated / QA run" (never the player's own session). Used by NativeQaSandbox (persistentDataPath isolation, fail-closed)
    // and NativeSettingsStorageScope.IsQa (no settings IO). Pure C# so Tools/qa-run-policy can unit-test it: argument list + batch flag -> bool.
    public static class QaRunPolicy
    {
        public const string SandboxArgument = "--unity-qa-sandbox";
        static readonly string[] QaSuffixes = { "-smoke", "-capture", "-review", "-check", "-dump", "-compare", "-probe", "-qa", "-preview" };
        static readonly string[] QaExact = { "--unity-a15-direct" };

        public static bool IsQaArgument(string arg)
        {
            if (arg == null || !arg.StartsWith("--unity-", StringComparison.Ordinal)) return false;
            if (arg.StartsWith("--unity-qa-", StringComparison.Ordinal)) return true;
            foreach (string exact in QaExact) if (arg == exact) return true;
            foreach (string suffix in QaSuffixes) if (arg.EndsWith(suffix, StringComparison.Ordinal)) return true;
            return false;
        }

        // -batchmode (Application.isBatchMode) or any QA / smoke / capture / review / check argument means an automated run.
        public static bool IsAutomated(string[] args, bool batchMode)
        {
            if (batchMode) return true;
            if (args == null) return false;
            foreach (string arg in args) if (IsQaArgument(arg)) return true;
            return false;
        }

        public static bool SandboxRequested(string[] args) { return args != null && Array.IndexOf(args, SandboxArgument) >= 0; }
    }
}
