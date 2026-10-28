using UnityEngine;

namespace Exoduser.UnityPort
{
    // LT-4: the player-facing name of "this device" in the save notes. The Mac build said "이 Mac" on every platform; Windows says "이 PC".
    public static class NativePlatformLabel
    {
        public static string ThisDevice(bool korean)
        {
            switch (Application.platform)
            {
                case RuntimePlatform.OSXPlayer: case RuntimePlatform.OSXEditor: return korean ? "이 Mac" : "this Mac";
                case RuntimePlatform.WindowsPlayer: case RuntimePlatform.WindowsEditor: return korean ? "이 PC" : "this PC";
                default: return korean ? "이 기기" : "this device";
            }
        }
        public static string Ko { get { return ThisDevice(true); } }
        public static string En { get { return ThisDevice(false); } }
    }
}
