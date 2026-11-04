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
        // CX5: scene.isLoaded is NOT an eligibility gate for objects in the first scene before Awake.
        // FirstPlayable serializes NativeGame directly; find its object regardless of scene enumeration state.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void BeforeSceneLoad()
        {
            ready = false;
            var args = Environment.GetCommandLineArgs();
            if (!MoodLabOptions.Requested(args)) return;
            var games = UnityEngine.Object.FindObjectsByType<NativeGame>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (var game in games)
            {
                Debug.Log("[MoodLab isolation] before-Awake target=" + game.name + " sceneLoaded=" + game.gameObject.scene.isLoaded);
                game.transform.root.gameObject.SetActive(false);
                game.enabled = false;
            }
            Debug.Log("[MoodLab isolation] blocked NativeGame objects=" + games.Length);
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
            try
            {
                // Reject rather than hiding an already initialized frontend two seconds later.
                // Instance is assigned at the FIRST line of NativeGame.Awake, before sound/stores/lobby.
                int lobby = UnityEngine.Object.FindObjectsByType<NativeLobby>(FindObjectsInactive.Include, FindObjectsSortMode.None).Length;
                int audio = UnityEngine.Object.FindObjectsByType<AudioSource>(FindObjectsInactive.Include, FindObjectsSortMode.None).Length;
                int video = UnityEngine.Object.FindObjectsByType<UnityEngine.Video.VideoPlayer>(FindObjectsInactive.Include, FindObjectsSortMode.None).Length;
                if (NativeGame.Instance != null || lobby != 0 || audio != 0 || video != 0)
                    throw new InvalidOperationException("Isolation failed before lab creation: NativeGame.Awake=" + (NativeGame.Instance != null) + " lobby=" + lobby + " audio=" + audio + " video=" + video);
                Debug.Log("[MoodLab isolation] Awake/NativeLobby/AudioSource/VideoPlayer=0; no NativeGame startup IO path entered");
                MoodLabScene.Create(selected);
            }
            catch (Exception e)
            {
                Debug.LogError("[MoodLab] SETUP FAILED: " + e);
                Application.Quit(2);
            }
        }
    }
}
