using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Windowless IMGUI capture. In `-batchmode` (GPU, no window) ScreenCapture returns a black frame, so the IMGUI pass is pointed at a RenderTexture instead:
    // a host with the lowest OnGUI order makes the RenderTexture the active target before any other OnGUI of the frame, a host with the highest order gives the target back.
    // The background (the world cameras, or black) is drawn into the target by the host's Update, i.e. before the GUI pass, every frame, so translucent HUD parts never stack up across frames.
    // Nothing runs unless Begin() was called (capture harnesses only).
    public static class NativeGuiCapture
    {
        public static RenderTexture Target;
        public static Action<RenderTexture> Background;   // null = clear to black
        public static int RepaintFrames;                  // how many GUI repaints went into the target (0 = OnGUI never ran: the capture is only the background)
        static GameObject hosts;

        public static void Begin(RenderTexture target, Action<RenderTexture> background)
        {
            Target = target; Background = background; RepaintFrames = 0;
            if (hosts == null) { hosts = new GameObject("GuiCaptureHosts"); UnityEngine.Object.DontDestroyOnLoad(hosts); hosts.AddComponent<Prepare>(); hosts.AddComponent<First>(); hosts.AddComponent<Last>(); }
        }
        public static void End() { Target = null; Background = null; }

        public static void Save(string path)
        {
            if (Target == null) return;
            var prev = RenderTexture.active; RenderTexture.active = Target;
            var tex = new Texture2D(Target.width, Target.height, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, Target.width, Target.height), 0, 0); tex.Apply(); RenderTexture.active = prev;
            File.WriteAllBytes(path, tex.EncodeToPNG()); UnityEngine.Object.Destroy(tex);
        }

        [DefaultExecutionOrder(-32000)] sealed class Prepare : MonoBehaviour
        {
            void LateUpdate()
            {
                if (Target == null) return;
                if (Background != null) Background(Target); else { var prev = RenderTexture.active; RenderTexture.active = Target; GL.Clear(true, true, Color.black); RenderTexture.active = prev; }
            }
        }
        [DefaultExecutionOrder(-32000)] sealed class First : MonoBehaviour
        {
            void OnGUI() { if (Target != null && Event.current.type == EventType.Repaint) { RepaintFrames++; RenderTexture.active = Target; } }
        }
        [DefaultExecutionOrder(32000)] sealed class Last : MonoBehaviour
        {
            void OnGUI() { if (Target != null && Event.current.type == EventType.Repaint) RenderTexture.active = null; }
        }
    }
}
