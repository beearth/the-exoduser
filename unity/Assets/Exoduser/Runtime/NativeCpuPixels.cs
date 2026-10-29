using UnityEngine;

namespace Exoduser.UnityPort
{
    // WebGL / WebGPU cannot read a RenderTexture back synchronously (Texture2D.ReadPixels after a Blit returns nothing there: the copies came out blank, which showed as a light-grey
    // HUD bar). On the web the pixels of an uncompressed readable source texture are taken on the CPU instead; every other platform keeps the Blit + ReadPixels path it always had,
    // so desktop output is unchanged. The sources opt in with `isReadable: 1` in their .meta (ui_bar_only.png, inventory/knight.png).
    public static class NativeCpuPixels
    {
        public static bool UseCpu(Texture2D source) { return Application.platform == RuntimePlatform.WebGLPlayer && source != null && source.isReadable; }
    }
}
