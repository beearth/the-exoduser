using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.VFX;

// RM-1 V0 test patch (HDR core vs environment). Offscreen, muted, no window:
// Unity -batchmode -executeMethod Exoduser.VfxRm1Capture.CoreTest -output <dir> -quit
// Deterministic: VisualEffect.Reinit + Simulate(1/60 s x ticks), camera rendered into a RenderTexture, no player window involved.
namespace Exoduser
{
    public static class VfxRm1Capture
    {
        const string VfxPath = "Assets/Exoduser/VFX/RM1/VFX_CoreTest.vfx";
        const string VolumePath = "Assets/Exoduser/Rendering/GlobalVolume_Hell.asset";
        const int W = 1920, H = 1080, Cell = 400;
        // Ticks after the hit tick -> seconds 0 / 0.033 / 0.066 / 0.1 / 0.2 / 0.35 / 0.6 (tick 0 needs one step to spawn).
        static readonly int[] Ticks = { 1, 2, 4, 6, 12, 21, 36 };
        static readonly string[] Labels = { "0", "0.033", "0.066", "0.1", "0.2", "0.35", "0.6" };

        static string Arg(string name, string fallback)
        {
            var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, name);
            return i >= 0 && i + 1 < a.Length ? a[i + 1] : fallback;
        }

        sealed class Rig { public Camera cam; public VisualEffect vfx; public Volume volume; public Bloom bloom; public RenderTexture rt; public GameObject env, core; }

        static Sprite WhiteSprite() { return Sprite.Create(Texture2D.whiteTexture, new Rect(0, 0, 4, 4), new Vector2(.5f, .5f), 4); }

        static GameObject Block(string name, Vector2 pos, Vector2 size, Color c, Transform parent, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(parent); go.transform.position = new Vector3(pos.x, pos.y, 2f); go.transform.localScale = size;
            var r = go.AddComponent<SpriteRenderer>(); r.sprite = WhiteSprite(); r.color = c; r.sortingOrder = order;
            r.sharedMaterial = new Material(Shader.Find("Sprites/Default"));
            return go;
        }

        static Rig Build()
        {
            var rig = new Rig();
            var camGo = new GameObject("Camera"); camGo.transform.position = new Vector3(0, 0, -10);
            rig.cam = camGo.AddComponent<Camera>(); rig.cam.orthographic = true; rig.cam.orthographicSize = 5.4f;   // game camera
            rig.cam.clearFlags = CameraClearFlags.SolidColor; rig.cam.backgroundColor = new Color(.015f, .02f, .018f); rig.cam.allowHDR = true;
            camGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true;
            rig.rt = new RenderTexture(W, H, 24, RenderTextureFormat.ARGBHalf) { name = "rm1-v0" }; rig.cam.targetTexture = rig.rt;

            var vgo = new GameObject("Global Volume"); rig.volume = vgo.AddComponent<Volume>(); rig.volume.isGlobal = true;
            rig.volume.sharedProfile = AssetDatabase.LoadAssetAtPath<VolumeProfile>(VolumePath);
            rig.bloom = null; rig.volume.profile.TryGet(out rig.bloom);   // .profile = per-instance clone: sweeps never touch the shared asset

            // Environment: map-dark ground, a bright-but-below-threshold lamp (0.9) and a dim ember glow. Both far from the core.
            rig.env = new GameObject("Environment");
            Block("Ground", Vector2.zero, new Vector2(22, 12), new Color(.19f, .105f, .09f), rig.env.transform, -100);
            Block("Lamp", new Vector2(5.2f, 1.2f), new Vector2(1.6f, 1.6f), new Color(.9f, .86f, .78f), rig.env.transform, -50);
            Block("Ember", new Vector2(-5.2f, -1.4f), new Vector2(1.6f, 1.6f), new Color(.85f, .4f, .25f), rig.env.transform, -50);

            rig.core = new GameObject("Core VFX"); rig.core.transform.position = Vector3.zero;
            rig.vfx = rig.core.AddComponent<VisualEffect>(); rig.vfx.visualEffectAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(VfxPath);
            if (rig.vfx.visualEffectAsset == null) throw new Exception("VFX asset missing: " + VfxPath);
            return rig;
        }

        // HDR target (the game camera renders HDR into its intermediate buffer); readback is clamped to 0..1, i.e. what an LDR display shows without tonemapping.
        // The HDR target holds linear values in a Linear project; the display applies the sRGB curve, so stats must too (Gamma: stored = displayed).
        static float Disp(float v) { return PlayerSettings.colorSpace == ColorSpace.Linear ? Mathf.LinearToGammaSpace(Mathf.Max(0f, v)) : v; }

        static Texture2D Render(Rig rig)
        {
            rig.cam.Render();
            var prev = RenderTexture.active; RenderTexture.active = rig.rt;
            var hdr = new Texture2D(W, H, TextureFormat.RGBAHalf, false); hdr.ReadPixels(new Rect(0, 0, W, H), 0, 0); hdr.Apply();
            RenderTexture.active = prev;
            var src = hdr.GetPixels(); var dst = new Color32[src.Length];
            for (int i = 0; i < src.Length; i++) dst[i] = new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].r)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].g)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].b)) * 255f), 255);
            UnityEngine.Object.DestroyImmediate(hdr);
            var tex = new Texture2D(W, H, TextureFormat.RGB24, false); tex.SetPixels32(dst); tex.Apply(); return tex;
        }

        // Same state rendered at another resolution (bloom depends on the target size), same display conversion.
        static Texture2D RenderSized(Rig rig, int w, int h)
        {
            var rt2 = new RenderTexture(w, h, 24, RenderTextureFormat.ARGBHalf); rig.cam.targetTexture = rt2; rig.cam.Render();
            var prev = RenderTexture.active; RenderTexture.active = rt2;
            var hdr = new Texture2D(w, h, TextureFormat.RGBAHalf, false); hdr.ReadPixels(new Rect(0, 0, w, h), 0, 0); hdr.Apply(); RenderTexture.active = prev;
            var src = hdr.GetPixels(); var dst = new Color32[src.Length];
            for (int i = 0; i < src.Length; i++) dst[i] = new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].r)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].g)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].b)) * 255f), 255);
            UnityEngine.Object.DestroyImmediate(hdr); rig.cam.targetTexture = rig.rt; rt2.Release(); UnityEngine.Object.DestroyImmediate(rt2);
            var tex = new Texture2D(w, h, TextureFormat.RGB24, false); tex.SetPixels32(dst); tex.Apply(); return tex;
        }

        // Deterministic: pause the effect, reset it, and advance exactly ticks x 1/60 s (VisualEffect.Simulate); the render that follows draws that state.
        static void Sample(Rig rig, int ticks) { rig.vfx.pause = true; rig.vfx.Reinit(); rig.vfx.Simulate(1f / 60f, (uint)ticks); }

        static float Lum(Color32 c) { return 0.2126f * c.r + 0.7152f * c.g + 0.0722f * c.b; }

        // Mean luminance, top-1% mean and max of a pixel rectangle (texture origin bottom-left).
        static void Stats(Texture2D t, int x0, int y0, int w, int h, out float mean, out float top1, out float max)
        {
            var px = t.GetPixels32(); var v = new float[w * h]; int n = 0;
            for (int y = y0; y < y0 + h; y++) for (int x = x0; x < x0 + w; x++) v[n++] = Lum(px[y * W + x]);
            Array.Sort(v); int k = Math.Max(1, n / 100); float top = 0; for (int i = n - k; i < n; i++) top += v[i];
            mean = v.Average(); top1 = top / k; max = v[n - 1];
        }

        static float RectMean(Texture2D t, int x0, int y0, int w, int h) { float m, a, b; Stats(t, x0, y0, w, h, out m, out a, out b); return m; }

        // Mean luminance of the ring just outside a square element, element centred at (cx,cy), half = half size in px.
        static float Ring(Texture2D t, int cx, int cy, int half, int inner, int outer)
        {
            var px = t.GetPixels32(); double sum = 0; int n = 0;
            for (int y = cy - half - outer; y <= cy + half + outer; y++) for (int x = cx - half - outer; x <= cx + half + outer; x++)
            {
                if (x < 0 || y < 0 || x >= W || y >= H) continue;
                int dx = Math.Max(Math.Abs(x - cx) - half, 0), dy = Math.Max(Math.Abs(y - cy) - half, 0);
                int d = Math.Max(dx, dy); if (d < inner || d > outer) continue;
                sum += Lum(px[y * W + x]); n++;
            }
            return (float)(sum / Math.Max(1, n));
        }

        static void Save(Texture2D t, string path) { File.WriteAllBytes(path, t.EncodeToPNG()); }

        // Entry point: enters Play Mode with a fixed 60 Hz capture clock (batchmode, no window), runs Runner, exits.
        public static void CoreTest()
        {
            EditorSettings.enterPlayModeOptionsEnabled = true;
            EditorSettings.enterPlayModeOptions = EnterPlayModeOptions.DisableDomainReload | EnterPlayModeOptions.DisableSceneReload;
            EditorApplication.playModeStateChanged += st =>
            {
                Debug.Log("[VFXRM1] playmode state " + st);
                if (st != PlayModeStateChange.EnteredPlayMode) return;
                Time.captureDeltaTime = 1f / 60f;
                new GameObject("VfxRm1 Runner").AddComponent<Runner>();
            };
            Debug.Log("[VFXRM1] entering play mode");
            EditorApplication.EnterPlaymode();
        }

        sealed class Runner : MonoBehaviour
        {
            IEnumerator Start()
            {
                Debug.Log("[VFXRM1] runner started");
                yield return null;
                try { yield return RunCoreTest(this); }
                finally { }
                EditorApplication.Exit(0);
            }
        }

        static System.Collections.IEnumerator RunCoreTest(MonoBehaviour host)
        {
            string dir = Arg("-output", "rm1-v0"); Directory.CreateDirectory(dir);
            var rig = Build();
            var log = new StringBuilder();
            yield return null;
            // scene point -> pixel (ortho 5.4 -> 100 px/unit, ReadPixels origin bottom-left)
            int lampX = (int)(W / 2f + 520f), lampY = (int)(H / 2f + 120f), emberX = (int)(W / 2f - 520f), emberY = (int)(H / 2f - 140f);

            // Environment only: bloom ON vs OFF.
            rig.core.SetActive(false); yield return null;
            var envBloom = Render(rig); rig.bloom.active = false; yield return null; yield return null; var envNoBloom = Render(rig); rig.bloom.active = true; yield return null; yield return null;
            rig.core.SetActive(true);
            float lampHalo = Ring(envBloom, lampX, lampY, 80, 4, 60) - Ring(envNoBloom, lampX, lampY, 80, 4, 60);
            float emberHalo = Ring(envBloom, emberX, emberY, 80, 4, 60) - Ring(envNoBloom, emberX, emberY, 80, 4, 60);
            Save(envBloom, Path.Combine(dir, "env_bloomON.png"));
            log.AppendLine("env_bloom_spill lamp(0.9)=" + lampHalo.ToString("F2") + " ember=" + emberHalo.ToString("F2") + "  (8-bit luminance delta of 4..60px halo ring, bloom ON - OFF)");

            var strip = new Texture2D(Cell * Ticks.Length, Cell, TextureFormat.RGB24, false);
            int cx0 = W / 2 - Cell / 2, cy0 = H / 2 - Cell / 2;
            float envMean = RectMean(envBloom, 0, 0, W, H);
            for (int i = 0; i < Ticks.Length; i++)
            {
                Sample(rig, Ticks[i]); yield return null;
                log.AppendLine("  diag tick=" + Ticks[i] + " alive=" + rig.vfx.aliveParticleCount + " culled=" + rig.vfx.culled + " dt=" + Time.deltaTime.ToString("F4") + " t=" + Time.time.ToString("F3") + " frame=" + Time.frameCount);
                var frame = Render(rig);
                strip.SetPixels(Cell * i, 0, Cell, Cell, frame.GetPixels(cx0, cy0, Cell, Cell));
                float mean, top1, max; Stats(frame, cx0, cy0, Cell, Cell, out mean, out top1, out max);
                float full = RectMean(frame, 0, 0, W, H);
                log.AppendLine("t=" + Labels[i] + "s tick=" + Ticks[i] + " crop400: mean=" + mean.ToString("F1") + " top1%=" + top1.ToString("F1") + " max=" + max.ToString("F0") + "  fullscreen mean delta vs env-only=" + (full - envMean).ToString("F2"));
                if (Labels[i] == "0.1") Save(frame, Path.Combine(dir, "core_0.1s_1920x1080.png"));
                if (Labels[i] == "0.033") Save(frame, Path.Combine(dir, "core_0.033s_1920x1080.png"));
                if (Labels[i] == "0.033") { var f900 = RenderSized(rig, 1600, 900); Save(f900, Path.Combine(dir, "core_0.033s_1600x900.png")); }
            }
            strip.Apply(); Save(strip, Path.Combine(dir, "core_strip_7x400.png"));
            // Core with bloom OFF at peak: shows what the bloom adds.
            rig.bloom.active = false; yield return null; yield return null; Sample(rig, 2); yield return null; var nb = Render(rig);
            float m2, t2, x2; Stats(nb, cx0, cy0, Cell, Cell, out m2, out t2, out x2);
            log.AppendLine("t=0.033s bloom OFF crop400: mean=" + m2.ToString("F1") + " top1%=" + t2.ToString("F1") + " max=" + x2.ToString("F0"));
            rig.bloom.active = true;
            // Bloom threshold sweep (profile clone only): env halo of the 0.9 lamp / ember vs core brightness and glow at the peak tick.
            foreach (float th in new[] { 0.9f, 1.0f, 1.2f, 1.5f })
            {
                rig.bloom.threshold.Override(th); rig.core.SetActive(false); yield return null; yield return null;
                var eOn = Render(rig); rig.bloom.active = false; yield return null; yield return null; var eOff = Render(rig); rig.bloom.active = true; yield return null; yield return null;
                float lh = Ring(eOn, lampX, lampY, 80, 4, 60) - Ring(eOff, lampX, lampY, 80, 4, 60), eh = Ring(eOn, emberX, emberY, 80, 4, 60) - Ring(eOff, emberX, emberY, 80, 4, 60);
                rig.core.SetActive(true); Sample(rig, 2); yield return null; var pk = Render(rig);
                float pm, pt, px2; Stats(pk, cx0, cy0, Cell, Cell, out pm, out pt, out px2);
                float halo = Ring(pk, W / 2, H / 2, 60, 4, 80);   // glow ring around the core disc (core half-size ~60px)
                log.AppendLine("sweep threshold=" + th.ToString("F2") + " intensity=" + rig.bloom.intensity.value.ToString("F2") + ": lamp_spill=" + lh.ToString("F2") + " ember_spill=" + eh.ToString("F2") + " core_peak top1%=" + pt.ToString("F1") + " core_halo_ring=" + halo.ToString("F1"));
            }
            // Colour check: intensity-1 core (VFX_CoreColor), every post effect off. Centre pixel at the peak minus the ground-only pixel = the additive contribution, compared with #fff4d0.
            foreach (var comp in rig.volume.profile.components) comp.active = false;
            rig.core.SetActive(false); var colorEnv = rig.vfx.visualEffectAsset;
            rig.vfx.visualEffectAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>("Assets/Exoduser/VFX/RM1/VFX_CoreColor.vfx");
            rig.core.SetActive(false); yield return null; yield return null; var gnd = Render(rig);
            rig.core.SetActive(true); Sample(rig, 3); yield return null; var cc = Render(rig);
            var g0 = gnd.GetPixel(W / 2, H / 2); var c0 = cc.GetPixel(W / 2, H / 2);
            Func<float, float, float> add = (c, g) => Mathf.LinearToGammaSpace(Mathf.Max(0f, Mathf.GammaToLinearSpace(c) - Mathf.GammaToLinearSpace(g))) * 255f;   // additive blend happens in linear: subtract there, then encode
            float dr = add(c0.r, g0.r), dg = add(c0.g, g0.g), db = add(c0.b, g0.b);
            log.AppendLine("color_check centre add(display 8-bit) r=" + dr.ToString("F1") + " g=" + dg.ToString("F1") + " b=" + db.ToString("F1") + "  target #fff4d0 = 255/244/208 scaled to r=" + dr.ToString("F1") + " -> g=" + (dr * 244f / 255f).ToString("F1") + " b=" + (dr * 208f / 255f).ToString("F1") + "  ground=" + (g0.r * 255f).ToString("F0") + "/" + (g0.g * 255f).ToString("F0") + "/" + (g0.b * 255f).ToString("F0") + " colorSpace=" + PlayerSettings.colorSpace);
            File.WriteAllText(Path.Combine(dir, "measure.txt"), log.ToString());
            Debug.Log("[VFXRM1] CoreTest\n" + log);
            UnityEngine.Object.DestroyImmediate(rig.rt);
        }
    }
}
