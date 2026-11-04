using System;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Exoduser.UnityPort.MoodLab
{
    // No save resolver, player prefs, gameplay singleton or Core is called here.
    public static class MoodLabOptions
    {
        public static bool Requested(string[] args) { return Array.IndexOf(args, "--moodlab") >= 0; }

        public static bool TryParse(string[] args, out char mood, out string error)
        {
            mood = 'a'; error = "";
            int sandboxCount = 0, moodCount = 0;
            for (int i = 0; i < args.Length; i++)
            {
                string arg = args[i];
                if (arg == "--unity-qa-sandbox")
                {
                    sandboxCount++;
                    if (i + 1 >= args.Length || args[i + 1].StartsWith("-", StringComparison.Ordinal) ||
                        !Path.IsPathRooted(args[i + 1]))
                    { error = "--unity-qa-sandbox requires an absolute, isolated QA folder"; return false; }
                    // Syntax only: do not read, create, probe or resolve ANY save directory.
                    i++;
                }
                else if (arg.StartsWith("--mood=", StringComparison.Ordinal))
                {
                    moodCount++;
                    if (arg.Length != 8 || arg[7] < 'a' || arg[7] > 'd')
                    { error = "Expected --mood=a|b|c|d"; return false; }
                    mood = arg[7];
                }
                else if (arg == "--unity-mute") { /* Safe shared-runner flag; lab also mutes itself. */ }
                else if (arg == "--mood" || arg == "--remodel3d" || arg.StartsWith("--unity-", StringComparison.Ordinal))
                { error = "MoodLab cannot be combined with gameplay/review flags: " + arg; return false; }
            }
            if (sandboxCount != 1 || moodCount > 1)
            { error = "Exactly one --unity-qa-sandbox and at most one --mood= are required"; return false; }
            return true;
        }
    }

    static class MoodLabBootstrap
    {
        static bool ready;
        static char selected;

        // Unity documents this phase as loaded objects, BEFORE their Awake:
        // https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RuntimeInitializeLoadType.BeforeSceneLoad.html
        // Disable scene roots BEFORE validating too: rejected lab runs must not fall into gameplay/save startup.
        // Same-phase runtime-hook order is unspecified; only this opt-in hook owns the lab.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void BeforeSceneLoad()
        {
            ready = false;
            var args = Environment.GetCommandLineArgs();
            if (!MoodLabOptions.Requested(args)) return;
            for (int i = 0; i < SceneManager.sceneCount; i++)
            {
                var scene = SceneManager.GetSceneAt(i);
                if (!scene.isLoaded) continue;
                foreach (var root in scene.GetRootGameObjects()) root.SetActive(false);
            }
            AudioListener.pause = true;
            AudioListener.volume = 0;
            string error;
            if (!MoodLabOptions.TryParse(args, out selected, out error))
            {
                Debug.LogError("[MoodLab] REJECTED: " + error);
                Application.Quit(2);
                return;
            }
            ready = true;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void AfterSceneLoad()
        {
            if (!ready) return;
            ready = false;
            try { MoodLabScene.Create(selected); }
            catch (Exception e)
            {
                Debug.LogError("[MoodLab] SETUP FAILED: " + e);
                Application.Quit(2);
            }
        }
    }
}
