using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // The lobby's keys (intro skip: any key on the FDG logo, Enter / Space on the title, Enter / Space / Right on the world intro, hold Esc / Space) read through one place so an
    // unattended run can press them without a window. Real play: Press / Hold are never called and every query is the plain UnityEngine.Input call.
    internal static class LobbyKeys
    {
        static readonly Dictionary<KeyCode, int> pressed = new Dictionary<KeyCode, int>();
        static readonly HashSet<KeyCode> held = new HashSet<KeyCode>();
        static int anyFrame = -100; static bool anyPending;

        /// <summary>Harness: one key-down event (seen by exactly one query within the next two frames).</summary>
        public static void Press(KeyCode key) { pressed[key] = Time.frameCount; anyFrame = Time.frameCount; anyPending = true; }
        /// <summary>Harness: the key is held down (or released).</summary>
        public static void Hold(KeyCode key, bool on) { if (on) held.Add(key); else held.Remove(key); }
        public static void ReleaseAll() { pressed.Clear(); held.Clear(); anyPending = false; }

        public static bool Down(KeyCode key)
        {
            if (Input.GetKeyDown(key)) return true;
            int frame; if (!pressed.TryGetValue(key, out frame)) return false;
            pressed.Remove(key); return Time.frameCount - frame <= 2;
        }

        public static bool Held(KeyCode key) { return Input.GetKey(key) || held.Contains(key); }

        public static bool AnyDown
        {
            get
            {
                if (Input.anyKeyDown) return true;
                if (!anyPending) return false;
                anyPending = false; bool fresh = Time.frameCount - anyFrame <= 2; pressed.Clear(); return fresh;   // one physical press is one frame: the key-down the splash consumed is not seen again by the next page
            }
        }
    }
}
