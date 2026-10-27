using System;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// RM-1 V0: ground-decal check. `Unity -batchmode -executeMethod Exoduser.VfxRm1DecalCapture.Run -output <dir> -quit` (offscreen, no window, muted).
//  1. DecalParams unit checks from fabricated DruidTelegraph entries (Core numbers -> shader units).
//  2. 5 shapes x 4 states sheet (progress 0.1 / 0.5 / 1.0 / flash) at 1600x900, top-down orthographic like the game camera.
//  3. Boundary check: each shape rendered alone at 1920x1080 (100 px per metre); the measured edge on a ray from the origin is compared with the Core number (budget +-4 px).
namespace Exoduser
{
    public static class VfxRm1DecalCapture
    {
        const string ShaderPath = "Assets/Exoduser/VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph";
        static string Arg(string name, string fallback) { var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, name); return i >= 0 && i + 1 < a.Length ? a[i + 1] : fallback; }

        static DruidTelegraph Tele(DruidTeleShape shape, double x, double y, double dir)
        {
            return new DruidTelegraph { Move = 1, MoveId = "test", Kind = DruidTeleKind.GroundDecal, Shape = shape, X = x, Y = y, Dir = dir, Total = 60, Remaining = 30 };
        }

        static DruidTelegraph[] Samples()
        {
            var circle = Tele(DruidTeleShape.Circle, 0, 0, 0); circle.Radius = 120;
            var cone = Tele(DruidTeleShape.Cone, 0, 0, 0); cone.Radius = 130; cone.Angle = 1.4;
            var line = Tele(DruidTeleShape.Line, 0, 0, 0); line.Length = 220; line.Width = 60; line.Progress = 110;
            var ring = Tele(DruidTeleShape.RingGap, 0, 0, 0); ring.Radius = 100; ring.Width = 40; ring.Inner = 80; ring.GapDir = 0; ring.GapAngle = 0.9;
            var arena = Tele(DruidTeleShape.ArenaMinusSafe, 0, 0, 0); arena.Length = 300; arena.Width = 200; arena.Safe = null;
            return new[] { circle, cone, line, ring, arena };
        }

        static bool Near(float a, float b, float tol = 1e-3f) { return Mathf.Abs(a - b) <= tol; }

        static void Check(StringBuilder log, bool ok, string what) { log.AppendLine((ok ? "PASS " : "FAIL ") + what); if (!ok) fails++; }
        static int fails;

        public static void Run()
        {
            var dir = Arg("-output", "rm1-decal"); Directory.CreateDirectory(dir);
            var log = new StringBuilder(); fails = 0;
            var shader = AssetDatabase.LoadAssetAtPath<Shader>(ShaderPath);
            if (shader == null) throw new Exception("shader not found: " + ShaderPath);

            // 1. unit checks
            var s = Samples(); DecalParams p;
            Check(log, DecalParams.From(s[0], out p) && p.Shape == 0 && Near(p.Radius, 1.2f) && Near(p.BoxSize.x, 3.0f), "circle r120px -> Radius 1.2 m, box 3.0 m");
            Check(log, DecalParams.From(s[1], out p) && p.Shape == 1 && Near(p.Radius, 1.3f) && Near(p.Angle, 1.4f), "cone reach 130px / full angle 1.4 rad");
            Check(log, DecalParams.From(s[2], out p) && p.Shape == 2 && Near(p.Length, 2.2f) && Near(p.Radius, 0.3f) && Near(p.Grow, 0.5f), "line length 220px, width 60px -> half width 0.3 m, head 110 px -> Grow 0.5");
            Check(log, DecalParams.From(s[3], out p) && p.Shape == 3 && Near(p.Radius, 1.2f) && Near(p.Inner, 0.8f) && Near(p.GapWidth, 0.9f), "ring centre 100 + band 40 -> outer 1.2 m, inner 0.8 m, gap 0.9 rad");
            Check(log, DecalParams.From(s[4], out p) && p.Shape == 4 && Near(p.BoxSize.x, 3.0f) && Near(p.BoxSize.y, 2.0f), "arena 300x200 px -> box 3.0 x 2.0 m");
            var ph = Tele(DruidTeleShape.Circle, 0, 0, 0); ph.Kind = DruidTeleKind.ParryGlint;
            Check(log, !DecalParams.From(ph, out p), "non-decal kinds are rejected");
            var live = Tele(DruidTeleShape.Circle, 0, 0, 0); live.Radius = 100; live.Live = true; live.Remaining = 3;
            Check(log, DecalParams.From(live, out p) && p.Flash == 0f, "a running hazard does not flash");
            var flash = Tele(DruidTeleShape.Circle, 0, 0, 0); flash.Radius = 100; flash.Remaining = 4;
            Check(log, DecalParams.From(flash, out p) && p.Flash == 1f, "flash only in the last 5 ticks (83 ms) before execution");
            var budget = new EventBudget(); budget.Cap("g", 2); bool b1 = budget.TryTake("g", Vector2.zero), b2 = budget.TryTake("g", Vector2.zero), b3 = budget.TryTake("g", Vector2.zero);
            Check(log, b1 && b2 && !b3 && budget.Skipped == 1, "event budget caps simultaneous events");
            budget.NewFrame(); budget.Screen = new Rect(0, 0, 1, 1);
            Check(log, !budget.TryTake("g", new Vector2(5, 5)) && budget.TryTake("g", new Vector2(.5f, .5f)), "off-screen events are skipped");

            // 2. sheet
            RenderSheet(shader, dir, log);
            // 3. boundary
            Boundary(shader, dir, log);

            File.WriteAllText(Path.Combine(dir, "decal_check.txt"), log.ToString());
            Debug.Log("[VFXRM1] DecalCheck fails=" + fails + "\n" + log);
            EditorApplication.Exit(fails == 0 ? 0 : 1);
        }

        // SG_ToxicBubble smoke: four spheres (Thin 0 / 0.5 / 1 / burst) over a map-toxic ground patch, 1600x900. Per-bubble values go through a MaterialPropertyBlock (per-renderer data).
        public static void Bubble()
        {
            var dir = Arg("-output", "rm1-bubble"); Directory.CreateDirectory(dir);
            var shader = AssetDatabase.LoadAssetAtPath<Shader>("Assets/Exoduser/VFX/RM1/ShaderGraph/SG_ToxicBubble.shadergraph");
            if (shader == null) throw new Exception("bubble shader missing");
            var g = Ground(); g.GetComponent<MeshRenderer>().sharedMaterial.SetColor("_BaseColor", new Color(.16f, .15f, .06f));
            var light = new GameObject("Sun").AddComponent<Light>(); light.type = LightType.Directional; light.intensity = .6f; light.transform.rotation = Quaternion.Euler(52f, -35f, 0f);
            RenderTexture rt; var cam = Cam(1600, 900, out rt);
            var mat = new Material(shader);
            float[] thin = { 0f, 0.5f, 1f, 1f }, burst = { 0f, 0f, 0f, 1f }, infl = { 0f, 0.04f, 0.07f, 0.1f };
            for (int i = 0; i < 4; i++)
            {
                var sp = GameObject.CreatePrimitive(PrimitiveType.Sphere); UnityEngine.Object.DestroyImmediate(sp.GetComponent<SphereCollider>());
                sp.transform.position = new Vector3(-3.6f + i * 2.4f, 0.4f, 0f); sp.transform.localScale = Vector3.one * 0.8f;
                var r = sp.GetComponent<MeshRenderer>(); r.sharedMaterial = mat;
                var mpb = new MaterialPropertyBlock(); mpb.SetFloat("_Thin", thin[i]); mpb.SetFloat("_Burst", burst[i]); mpb.SetFloat("_Inflate", infl[i]); mpb.SetFloat("_Phase", i * .25f); r.SetPropertyBlock(mpb);
            }
            cam.Render();
            File.WriteAllBytes(Path.Combine(dir, "bubble_4states_1600x900.png"), Read(rt, true).EncodeToPNG());
            Debug.Log("[VFXRM1] bubble captured");
            EditorApplication.Exit(0);
        }

        static GameObject Ground()
        {
            var g = GameObject.CreatePrimitive(PrimitiveType.Quad); g.name = "Ground";
            g.transform.rotation = Quaternion.Euler(90f, 0f, 0f); g.transform.localScale = new Vector3(40f, 40f, 1f);
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit")); m.SetColor("_BaseColor", new Color(.2f, .16f, .15f)); m.SetFloat("_Smoothness", 0f);
            g.GetComponent<MeshRenderer>().sharedMaterial = m; UnityEngine.Object.DestroyImmediate(g.GetComponent<MeshCollider>());
            return g;
        }

        static Camera Cam(int w, int h, out RenderTexture rt)
        {
            var go = new GameObject("Cam"); var cam = go.AddComponent<Camera>();
            cam.orthographic = true; cam.orthographicSize = 5.4f; cam.transform.position = new Vector3(0, 10, 0); cam.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Color.black; cam.allowHDR = true; cam.nearClipPlane = .1f; cam.farClipPlane = 30f;
            go.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = false;
            rt = new RenderTexture(w, h, 24, RenderTextureFormat.ARGBHalf); cam.targetTexture = rt; return cam;
        }

        static GameObject Decal(Material baseMat, DecalParams p, Vector2 offset, Transform parent)
        {
            var go = new GameObject("Decal"); go.transform.SetParent(parent);
            go.transform.position = new Vector3(p.Center.x + offset.x, 0f, p.Center.y + offset.y);
            go.transform.rotation = Quaternion.Euler(90f, 0f, 0f) * Quaternion.Euler(0f, 0f, p.Dir * Mathf.Rad2Deg);
            var m = new Material(baseMat); p.Apply(m);
            var proj = go.AddComponent<DecalProjector>(); proj.material = m; proj.size = new Vector3(p.BoxSize.x, p.BoxSize.y, 2f); proj.pivot = Vector3.zero;
            return go;
        }

        static Texture2D Read(RenderTexture rt, bool toDisplay)
        {
            var prev = RenderTexture.active; RenderTexture.active = rt;
            var hdr = new Texture2D(rt.width, rt.height, TextureFormat.RGBAHalf, false); hdr.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0); hdr.Apply(); RenderTexture.active = prev;
            var src = hdr.GetPixels(); var dst = new Color32[src.Length];
            Func<float, byte> enc = v => (byte)Mathf.RoundToInt(Mathf.Clamp01(PlayerSettings.colorSpace == ColorSpace.Linear ? Mathf.LinearToGammaSpace(Mathf.Max(0, v)) : v) * 255f);
            for (int i = 0; i < src.Length; i++) dst[i] = new Color32(enc(src[i].r), enc(src[i].g), enc(src[i].b), 255);
            UnityEngine.Object.DestroyImmediate(hdr);
            var t = new Texture2D(rt.width, rt.height, TextureFormat.RGB24, false); t.SetPixels32(dst); t.Apply(); return t;
        }

        static void RenderSheet(Shader shader, string dir, StringBuilder log)
        {
            var root = new GameObject("Root").transform; Ground().transform.SetParent(root);
            RenderTexture rt; var cam = Cam(1600, 900, out rt);
            var baseMat = new Material(shader);
            var samples = Samples();
            float[] progress = { 0.1f, 0.5f, 1.0f, 1.0f }; float[] flash = { 0, 0, 0, 1 };
            const float cw = 3.6f, ch = 2.5f;
            for (int c = 0; c < samples.Length; c++)
                for (int r = 0; r < 4; r++)
                {
                    DecalParams p; if (!DecalParams.From(samples[c], out p)) continue;
                    p.Progress = progress[r]; p.Flash = flash[r];
                    Decal(baseMat, p, new Vector2(-7.2f + c * cw, 3.75f - r * ch), root);
                }
            cam.Render();
            var tex = Read(rt, true); File.WriteAllBytes(Path.Combine(dir, "decal_sheet_5x4_1600x900.png"), tex.EncodeToPNG());
            log.AppendLine("sheet: columns = circle / cone / line (grown 0.5) / ring+gap / arena(white mask); rows = progress 0.1 / 0.5 / 1.0 / flash");
            UnityEngine.Object.DestroyImmediate(root.gameObject); UnityEngine.Object.DestroyImmediate(cam.gameObject); rt.Release();
        }

        // Edge on a ray from the shape origin: the last pixel (moving outwards) that differs from the bare ground by more than a threshold.
        static int EdgePx(Texture2D t, int ox, int oy, float dx, float dy, int max)
        {
            var bare = t.GetPixel(ox + (int)(dx * (max + 40)), oy + (int)(dy * (max + 40)));
            int last = -1;
            for (int i = 2; i < max + 40; i++)
            {
                var c = t.GetPixel(ox + Mathf.RoundToInt(dx * i), oy + Mathf.RoundToInt(dy * i));
                if (Mathf.Abs(c.r - bare.r) + Mathf.Abs(c.g - bare.g) + Mathf.Abs(c.b - bare.b) > 0.03f) last = i;
            }
            return last;
        }

        static void Boundary(Shader shader, string dir, StringBuilder log)
        {
            var samples = Samples(); int W = 1920, H = 1080; int ox = W / 2, oy = H / 2;
            var expect = new[] { ("circle outer edge (+X)", 0, 1f, 0f, 120), ("cone reach edge (+X)", 1, 1f, 0f, 130), ("line end edge (+X, Grow 1)", 2, 1f, 0f, 220), ("ring outer edge (+Y, away from the gap)", 3, 0f, 1f, 120) };
            foreach (var e in expect)
            {
                var root = new GameObject("Root").transform; Ground().transform.SetParent(root);
                RenderTexture rt; var cam = Cam(W, H, out rt);
                DecalParams p; DecalParams.From(samples[e.Item2], out p); p.Progress = 1f; p.Grow = 1f; p.Flash = 0f;
                Decal(new Material(shader), p, Vector2.zero, root);
                cam.Render(); var tex = Read(rt, true);
                // image y goes up in texture space (bottom-left origin); world +Z is up on screen
                int measured = EdgePx(tex, ox, oy, e.Item3, e.Item4, 420);
                int err = measured - e.Item5;
                Check(log, Mathf.Abs(err) <= 4, $"boundary {e.Item1}: measured {measured} px vs Core {e.Item5} px (error {err:+0;-0;0} px, budget 4)");
                if (e.Item2 == 3) File.WriteAllBytes(Path.Combine(dir, "decal_ring_1920x1080.png"), tex.EncodeToPNG());
                UnityEngine.Object.DestroyImmediate(root.gameObject); UnityEngine.Object.DestroyImmediate(cam.gameObject); rt.Release();
            }
        }
    }
}
