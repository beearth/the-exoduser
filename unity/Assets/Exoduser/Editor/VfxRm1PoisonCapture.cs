using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.VFX;
using Exoduser.UnityPort.Vfx;

// RM-1 stage 3: poison burst A (enemy druid) / B (player malice orb) capture rig. NOT run yet (written together with VFX_PoisonBurst.vfx; the Unity step is ordered separately).
//   Unity -batchmode -projectPath <unity dir> -executeMethod Exoduser.VfxRm1PoisonCapture.Run -output E:/exoduser-wt/_out/vfx-rm1/poison -logFile <log> -quit
// Do NOT add -nographics: the capture would come out black. Offscreen render target, muted, no window of its own beyond the batch editor.
// Deterministic: Play Mode with a fixed 60 Hz capture clock; per sample VisualEffect.Reinit -> PoisonBurstPresets.Fire (OnBurst) -> Simulate(1/60 x ticks) -> one frame -> render.
// Top-down orthographic camera like the game camera (ortho 5.4 -> 100 px per metre, 1920x1080); the ground is the XZ plane, character height 60 px = 0.6 m (spec 2.7.3).
// Output (all under -output):
//   poison_A_strip_7x400.png / poison_B_strip_7x400.png     7 cells x 400 px at 0 / 0.033 / 0.066 / 0.1 / 0.2 / 0.35 / 0.6 s (full burst incl. ground stain)
//   poison_A_0.1s_1920x1080.png / poison_B_0.1s_1920x1080.png   whole screen at 0.1 s
//   poison_AB_0.1s|0.2s|0.35s_1920x1080.png                  A (left) and B (right) in ONE frame, over a map-toxic ground patch (hue 52 deg), same time
//   measure.json / measure.txt                               peak tick, top-1% brightness, body diameter / character height, hue bands, particle counts, afterglow
namespace Exoduser
{
    public static class VfxRm1PoisonCapture
    {
        const string VfxPath = "Assets/Exoduser/VFX/RM1/VFX_PoisonBurst.vfx";
        const string DecalPath = "Assets/Exoduser/VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph";
        const string VolumePath = "Assets/Exoduser/Rendering/GlobalVolume_Hell.asset";
        const int W = 1920, H = 1080, Cell = 400;
        const float PxPerM = 100f, HeroPx = 60f;
        // ticks after the hit tick -> seconds 0 / 0.033 / 0.066 / 0.1 / 0.2 / 0.35 / 0.6 (tick 0 needs one step to spawn), same table as VfxRm1Capture
        static readonly int[] Ticks = { 1, 2, 4, 6, 12, 21, 36 };
        static readonly string[] Labels = { "0", "0.033", "0.066", "0.1", "0.2", "0.35", "0.6" };
        static readonly Color GroundDefault = new Color(.2f, .16f, .15f);
        static readonly Color GroundToxic = new Color(.227f, .212f, .071f);    // #3a3612-ish linear-ish stand-in for the map toxic liquid (hue ~52 deg, art bible D5)

        static string Arg(string name, string fallback)
        {
            var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, name);
            return i >= 0 && i + 1 < a.Length ? a[i + 1] : fallback;
        }

        sealed class Rig
        {
            public Camera cam; public RenderTexture rt; public Volume volume;
            public GameObject ground; public Material groundMat; public GameObject hero;
            public VisualEffect fxA, fxB; public PoisonStainPool stains; public Material decalMat;
        }

        static float Disp(float v) { return PlayerSettings.colorSpace == ColorSpace.Linear ? Mathf.LinearToGammaSpace(Mathf.Max(0f, v)) : v; }

        static Rig Build()
        {
            var rig = new Rig();
            var camGo = new GameObject("Camera"); camGo.transform.position = new Vector3(0, 10, 0); camGo.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            rig.cam = camGo.AddComponent<Camera>(); rig.cam.orthographic = true; rig.cam.orthographicSize = 5.4f; rig.cam.nearClipPlane = .1f; rig.cam.farClipPlane = 30f;
            rig.cam.clearFlags = CameraClearFlags.SolidColor; rig.cam.backgroundColor = new Color(.015f, .02f, .018f); rig.cam.allowHDR = true;
            camGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true;
            rig.rt = new RenderTexture(W, H, 24, RenderTextureFormat.ARGBHalf) { name = "rm1-poison" }; rig.cam.targetTexture = rig.rt;

            var vgo = new GameObject("Global Volume"); rig.volume = vgo.AddComponent<Volume>(); rig.volume.isGlobal = true;
            rig.volume.sharedProfile = AssetDatabase.LoadAssetAtPath<VolumeProfile>(VolumePath);

            var light = new GameObject("Sun").AddComponent<Light>(); light.type = LightType.Directional; light.intensity = .6f; light.transform.rotation = Quaternion.Euler(52f, -35f, 0f);

            rig.ground = GameObject.CreatePrimitive(PrimitiveType.Quad); rig.ground.name = "Ground";
            rig.ground.transform.rotation = Quaternion.Euler(90f, 0f, 0f); rig.ground.transform.localScale = new Vector3(40f, 40f, 1f);
            UnityEngine.Object.DestroyImmediate(rig.ground.GetComponent<MeshCollider>());
            rig.groundMat = new Material(Shader.Find("Universal Render Pipeline/Lit")); rig.groundMat.SetFloat("_Smoothness", 0f);
            rig.ground.GetComponent<MeshRenderer>().sharedMaterial = rig.groundMat;

            // scale cue: a 0.3 x 0.6 m slab = a character standing 60 px tall, bottom-left of the 400 px crop (never under the burst)
            rig.hero = GameObject.CreatePrimitive(PrimitiveType.Cube); rig.hero.name = "Hero 60px";
            UnityEngine.Object.DestroyImmediate(rig.hero.GetComponent<BoxCollider>());
            rig.hero.transform.position = new Vector3(-1.65f, 0.03f, -1.45f); rig.hero.transform.localScale = new Vector3(0.3f, 0.05f, HeroPx / PxPerM);
            var hm = new Material(Shader.Find("Universal Render Pipeline/Lit")); hm.SetColor("_BaseColor", new Color(.32f, .31f, .30f)); hm.SetFloat("_Smoothness", 0f);
            rig.hero.GetComponent<MeshRenderer>().sharedMaterial = hm;

            var shader = AssetDatabase.LoadAssetAtPath<Shader>(DecalPath);
            if (shader == null) throw new Exception("decal shader missing: " + DecalPath);
            rig.decalMat = new Material(shader);
            rig.stains = new PoisonStainPool(new GameObject("Stains").transform, rig.decalMat);

            var asset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(VfxPath);
            if (asset == null) throw new Exception("VFX asset missing (import failed?): " + VfxPath);
            rig.fxA = NewFx("PoisonFx A", asset); rig.fxB = NewFx("PoisonFx B", asset);
            return rig;
        }

        static VisualEffect NewFx(string name, VisualEffectAsset asset)
        {
            var go = new GameObject(name); go.transform.position = Vector3.zero;     // the graph's bounds are 80 x 80 m around the origin, so the component never moves
            var fx = go.AddComponent<VisualEffect>(); fx.visualEffectAsset = asset; fx.pause = true;
            return fx;
        }

        static void SetGround(Rig rig, Color c) { rig.groundMat.SetColor("_BaseColor", c); }

        // ---- sampling --------------------------------------------------------------------------------------------------------------------------------
        static float TimeOf(int ticks) { return ticks == 1 ? 0f : ticks / 60f; }

        sealed class Burst { public PoisonVariant V; public Vector2 Pos; public Vector2 Dir; }

        // Reset everything, fire the bursts, advance `ticks` simulation steps. stain=false hides the ground stain (particles-only measurement).
        static void Sample(Rig rig, int ticks, bool stain, params Burst[] bursts)
        {
            rig.stains.Clear();
            rig.fxA.pause = true; rig.fxB.pause = true; rig.fxA.Reinit(); rig.fxB.Reinit();
            bool usedA = false, usedB = false;
            foreach (var b in bursts)
            {
                var fx = b.V == PoisonVariant.A_Druid ? rig.fxA : rig.fxB;
                if (b.V == PoisonVariant.A_Druid) usedA = true; else usedB = true;
                PoisonBurstPresets.Fire(fx, b.V, b.Pos, b.Dir, 1f);
                if (stain) rig.stains.Spawn(b.V, b.Pos, 1f);
            }
            if (usedA) rig.fxA.Simulate(1f / 60f, (uint)ticks);
            if (usedB) rig.fxB.Simulate(1f / 60f, (uint)ticks);
            int age = ticks == 1 ? 0 : ticks;
            for (int i = 0; i < age; i++) rig.stains.Tick();
        }

        static void Hide(Rig rig)
        {
            rig.stains.Clear(); rig.fxA.Reinit(); rig.fxB.Reinit();
            rig.fxA.gameObject.SetActive(false); rig.fxB.gameObject.SetActive(false);
        }
        static void Show(Rig rig) { rig.fxA.gameObject.SetActive(true); rig.fxB.gameObject.SetActive(true); }

        static Texture2D Render(Rig rig)
        {
            rig.cam.Render();
            var prev = RenderTexture.active; RenderTexture.active = rig.rt;
            var hdr = new Texture2D(W, H, TextureFormat.RGBAHalf, false); hdr.ReadPixels(new Rect(0, 0, W, H), 0, 0); hdr.Apply();
            RenderTexture.active = prev;
            var src = hdr.GetPixels(); var dst = new Color32[src.Length];
            for (int i = 0; i < src.Length; i++)
                dst[i] = new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].r)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].g)) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(Disp(src[i].b)) * 255f), 255);
            UnityEngine.Object.DestroyImmediate(hdr);
            var tex = new Texture2D(W, H, TextureFormat.RGB24, false); tex.SetPixels32(dst); tex.Apply(); return tex;
        }

        static void Save(Texture2D t, string path) { File.WriteAllBytes(path, t.EncodeToPNG()); }

        // ---- measurement -----------------------------------------------------------------------------------------------------------------------------
        static float Lum(Color32 c) { return 0.2126f * c.r + 0.7152f * c.g + 0.0722f * c.b; }

        static void Top1(Color32[] px, int x0, int y0, int w, int h, out float mean, out float top1, out float max)
        {
            var v = new float[w * h]; int n = 0;
            for (int y = y0; y < y0 + h; y++) for (int x = x0; x < x0 + w; x++) v[n++] = Lum(px[y * W + x]);
            Array.Sort(v); int k = Math.Max(1, n / 100); float top = 0, sum = 0; for (int i = n - k; i < n; i++) top += v[i];
            for (int i = 0; i < n; i++) sum += v[i];
            mean = sum / n; top1 = top / k; max = v[n - 1];
        }

        // Changed pixels (luminance delta >= thr vs the empty scene): bounding box, area, hue bands.
        sealed class Region
        {
            public int Area, MinX = int.MaxValue, MinY = int.MaxValue, MaxX = -1, MaxY = -1;
            public int Sat, Hue85_95, Hue65_80, Hue110Plus, Hue248_272, Hue300Plus, Hue170_200;
            public int[] Hist = new int[36];
            public float DiameterPx { get { return Area == 0 ? 0f : Mathf.Max(MaxX - MinX + 1, MaxY - MinY + 1); } }
        }

        static Region Diff(Color32[] now, Color32[] empty, float thr)
        {
            var r = new Region();
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    int i = y * W + x; var a = now[i]; var b = empty[i];
                    if (Mathf.Abs(Lum(a) - Lum(b)) < thr) continue;
                    r.Area++; if (x < r.MinX) r.MinX = x; if (x > r.MaxX) r.MaxX = x; if (y < r.MinY) r.MinY = y; if (y > r.MaxY) r.MaxY = y;
                    float h, s, v; Color.RGBToHSV(a, out h, out s, out v);
                    if (s < 0.35f) continue;       // hue is only meaningful where the colour is saturated (SSOT 2.2 colour-angle rule: saturation 0.35 and up)
                    float deg = h * 360f; r.Sat++; r.Hist[Mathf.Min(35, (int)(deg / 10f))]++;
                    if (deg >= 85f && deg <= 95f) r.Hue85_95++;
                    if (deg >= 65f && deg < 80f) r.Hue65_80++;
                    if (deg >= 110f && deg < 170f) r.Hue110Plus++;
                    if (deg >= 248f && deg <= 272f) r.Hue248_272++;
                    if (deg >= 300f) r.Hue300Plus++;
                    if (deg >= 170f && deg <= 200f) r.Hue170_200++;
                }
            return r;
        }

        static string Js(Region r, bool hist)
        {
            var sb = new StringBuilder();
            sb.Append("{\"area\":").Append(r.Area).Append(",\"diameterPx\":").Append(r.DiameterPx.ToString("F0")).Append(",\"overHero\":").Append((r.DiameterPx / HeroPx).ToString("F2"))
              .Append(",\"saturatedPx\":").Append(r.Sat)
              .Append(",\"hue85_95\":").Append(r.Hue85_95).Append(",\"hue65_80\":").Append(r.Hue65_80).Append(",\"hue110_170\":").Append(r.Hue110Plus)
              .Append(",\"hue248_272\":").Append(r.Hue248_272).Append(",\"hue300plus\":").Append(r.Hue300Plus).Append(",\"hue170_200\":").Append(r.Hue170_200);
            if (hist) { sb.Append(",\"hist10deg\":["); for (int i = 0; i < r.Hist.Length; i++) sb.Append(i > 0 ? "," : "").Append(r.Hist[i]); sb.Append("]"); }
            return sb.Append("}").ToString();
        }

        // ---- entry -----------------------------------------------------------------------------------------------------------------------------------
        public static void Run()
        {
            EditorSettings.enterPlayModeOptionsEnabled = true;
            EditorSettings.enterPlayModeOptions = EnterPlayModeOptions.DisableDomainReload | EnterPlayModeOptions.DisableSceneReload;
            EditorApplication.playModeStateChanged += st =>
            {
                Debug.Log("[VFXRM1] playmode state " + st);
                if (st != PlayModeStateChange.EnteredPlayMode) return;
                Time.captureDeltaTime = 1f / 60f;
                new GameObject("VfxRm1 Poison Runner").AddComponent<Runner>();
            };
            Debug.Log("[VFXRM1] entering play mode (poison capture)");
            EditorApplication.EnterPlaymode();
        }

        sealed class Runner : MonoBehaviour
        {
            IEnumerator Start()
            {
                yield return null;
                int code = 0;
                var run = RunAll();
                while (true)
                {
                    bool more; try { more = run.MoveNext(); } catch (Exception e) { Debug.LogError("[VFXRM1] poison capture failed: " + e); code = 1; break; }
                    if (!more) break;
                    yield return run.Current;
                }
                EditorApplication.Exit(code);
            }
        }

        static IEnumerator RunAll()
        {
            string dir = Arg("-output", "E:/exoduser-wt/_out/vfx-rm1/poison"); Directory.CreateDirectory(dir);
            var rig = Build();
            var js = new StringBuilder(); var txt = new StringBuilder();
            js.Append("{\"colorSpace\":\"").Append(PlayerSettings.colorSpace).Append("\",\"heroPx\":").Append(HeroPx).Append(",\"variants\":{");
            yield return null;

            var variants = new[] { PoisonVariant.A_Druid, PoisonVariant.B_Malice };
            for (int vi = 0; vi < variants.Length; vi++)
            {
                var v = variants[vi]; string tag = v == PoisonVariant.A_Druid ? "A" : "B";
                var burst = new Burst { V = v, Pos = Vector2.zero, Dir = v == PoisonVariant.A_Druid ? new Vector2(1f, 0f) : Vector2.zero };   // A: shot travelling +X
                SetGround(rig, GroundDefault);

                // empty scene reference
                Hide(rig); yield return null; yield return null;
                var empty = Render(rig).GetPixels32(); Show(rig);

                // 1. peak search on the core crop (particles only, no stain): ticks 1..14
                int peakTick = 1; float peakTop = -1f; var series = new StringBuilder();
                int cx0 = W / 2 - Cell / 2, cy0 = H / 2 - Cell / 2;
                for (int n = 1; n <= 14; n++)
                {
                    Sample(rig, n, false, burst); yield return null;
                    var px = Render(rig).GetPixels32(); float mean, top1, max; Top1(px, cx0, cy0, Cell, Cell, out mean, out top1, out max);
                    series.Append(n > 1 ? "," : "").Append("[").Append(n).Append(",").Append(TimeOf(n).ToString("F3")).Append(",").Append(top1.ToString("F1")).Append("]");
                    if (top1 > peakTop) { peakTop = top1; peakTick = n; }
                }
                js.Append(vi > 0 ? "," : "").Append("\"").Append(tag).Append("\":{\"peakTick\":").Append(peakTick).Append(",\"peakTimeS\":").Append(TimeOf(peakTick).ToString("F3"))
                  .Append(",\"top1PctAtPeak\":").Append(peakTop.ToString("F1")).Append(",\"top1Series\":[").Append(series).Append("]");
                txt.AppendLine(tag + ": peak tick " + peakTick + " (" + TimeOf(peakTick).ToString("F3") + " s, spec <= 0.067) top-1% brightness " + peakTop.ToString("F1") + " (spec >= 240)");

                // 2. body size and colour at 0.066 / 0.1 / 0.2 / 0.35 s (particles only)
                js.Append(",\"body\":{");
                foreach (int n in new[] { 4, 6, 12, 21 })
                {
                    Sample(rig, n, false, burst); yield return null;
                    var px = Render(rig).GetPixels32(); var reg = Diff(px, empty, 30f);
                    js.Append(n > 4 ? "," : "").Append("\"").Append(TimeOf(n).ToString("F3")).Append("\":").Append(Js(reg, n == 6 || n == 12));
                    txt.AppendLine(tag + " t=" + TimeOf(n).ToString("F3") + "s body diameter " + reg.DiameterPx.ToString("F0") + " px = " + (reg.DiameterPx / HeroPx).ToString("F2") + " x character height, saturated px " + reg.Sat
                                   + " hue85-95:" + reg.Hue85_95 + " lime65-80:" + reg.Hue65_80 + " green110+:" + reg.Hue110Plus + " | arcane248-272:" + reg.Hue248_272 + " magenta300+:" + reg.Hue300Plus + " cyan170-200:" + reg.Hue170_200);
                }
                js.Append("}");

                // 3. particle counts (spec U6: <= 24 per effect) and afterglow (0.8 s: particles gone, stain left)
                Sample(rig, 6, false, burst); yield return null;
                int alive = rig.fxA.aliveParticleCount + rig.fxB.aliveParticleCount;
                Sample(rig, 49, true, burst); yield return null;
                int aliveLate = rig.fxA.aliveParticleCount + rig.fxB.aliveParticleCount;
                var late = Render(rig).GetPixels32(); var lateReg = Diff(late, empty, 12f);
                js.Append(",\"particles\":{\"alive0.1s\":").Append(alive).Append(",\"alive0.8s\":").Append(aliveLate).Append("},\"afterglow0.8s\":").Append(Js(lateReg, false)).Append(",\"stainsActive0.8s\":").Append(rig.stains.Active);
                txt.AppendLine(tag + " particles alive at 0.1 s: " + alive + " (<= 24), at 0.8 s: " + aliveLate + ", stains at 0.8 s: " + rig.stains.Active + ", changed area at 0.8 s: " + lateReg.Area + " px");

                // 4. pictures: strip (7 x 400 px, full burst incl. stain) + whole screen at 0.1 s
                var strip = new Texture2D(Cell * Ticks.Length, Cell, TextureFormat.RGB24, false);
                for (int i = 0; i < Ticks.Length; i++)
                {
                    Sample(rig, Ticks[i], true, burst); yield return null;
                    var frame = Render(rig);
                    strip.SetPixels(Cell * i, 0, Cell, Cell, frame.GetPixels(cx0, cy0, Cell, Cell));
                    if (Labels[i] == "0.1") Save(frame, Path.Combine(dir, "poison_" + tag + "_0.1s_1920x1080.png"));
                }
                strip.Apply(); Save(strip, Path.Combine(dir, "poison_" + tag + "_strip_7x400.png"));
                js.Append("}");
            }
            js.Append("}");

            // 5. A and B side by side in one frame over the map-toxic patch (spec 3.2 / stage 3: the comparison sheet is mandatory)
            SetGround(rig, GroundToxic);
            var a = new Burst { V = PoisonVariant.A_Druid, Pos = new Vector2(-2.3f, 0f), Dir = new Vector2(1f, 0f) };
            var b = new Burst { V = PoisonVariant.B_Malice, Pos = new Vector2(2.3f, 0f), Dir = Vector2.zero };
            rig.hero.SetActive(true);
            foreach (var pair in new[] { new { n = 6, t = "0.1s" }, new { n = 12, t = "0.2s" }, new { n = 21, t = "0.35s" } })
            {
                Sample(rig, pair.n, true, a, b); yield return null;
                Save(Render(rig), Path.Combine(dir, "poison_AB_" + pair.t + "_1920x1080.png"));
            }

            File.WriteAllText(Path.Combine(dir, "measure.json"), js.ToString());
            File.WriteAllText(Path.Combine(dir, "measure.txt"), txt.ToString());
            Debug.Log("[VFXRM1] poison capture\n" + txt);
            UnityEngine.Object.DestroyImmediate(rig.rt);
        }
    }
}
