using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static GameObject b5AppliedRoot;
        static readonly int B5MainShadow = Shader.PropertyToID("_MainLightShadowParams");
        static readonly int B5AdditionalFade = Shader.PropertyToID("_AdditionalShadowFadeParams");

        internal static bool B5Enabled(string[] args, bool a2rDefault)
        {
            return Array.IndexOf(args, "--b5fix-off") < 0
                && Array.IndexOf(args, "--a2r1-light") < 0 && !a2rDefault;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void B5Boot()
        {
            RenderPipelineManager.beginCameraRendering -= B5BeforeCamera;
            b5AppliedRoot = null;
            var args = Environment.GetCommandLineArgs();
            bool a2r = Resources.Load<TextAsset>("A2R/default-enabled") != null;
            if (B5Enabled(args, a2r)) RenderPipelineManager.beginCameraRendering += B5BeforeCamera;
            // Explicit, sandbox-only same-frame comparison. Normal play never enters this path.
            if (!a2r && Array.IndexOf(args, "--a2r1-light") < 0
                && Array.IndexOf(args, "--b5fix-compare") >= 0 && NativeQaSandbox.Active)
            {
                var game = Instance;
                if (game != null) game.StartCoroutine(game.B5Compare());
            }
        }

        static void B5BeforeCamera(ScriptableRenderContext context, Camera camera)
        {
            var game = Instance;
            if (game == null || game.a2Root == null || game.a2Root == b5AppliedRoot) return;
            // Assembly is synchronous. This callback runs after assembly and before its first draw,
            // including reflection/capture cameras; it does no repeated renderer search per frame.
            B5Apply(game.a2Root);
            b5AppliedRoot = game.a2Root;
        }

        internal static int[] B5Apply(GameObject root)
        {
            int shafts = 0, water = 0;
            var block = new MaterialPropertyBlock();
            foreach (var renderer in root.GetComponentsInChildren<Renderer>(true))
            {
                // Current full-field and preserved legacy keyshot use different names.
                if (renderer.name == "A2 국소 달빛기둥" || renderer.name == "A2 필드 국소 빛기둥")
                {
                    renderer.enabled = false;
                    shafts++;
                }
                bool toxic = false;
                foreach (var material in renderer.sharedMaterials)
                    if (material != null && material.shader != null
                        && material.shader.name == "EXODUSER/A2ToxicRiver") toxic = true;
                if (!toxic) continue;
                renderer.receiveShadows = false;
                // The custom water pass calls UniversalFragmentPBR directly. The renderer flag
                // alone does not control that shader. Override shadow attenuation only for this
                // renderer, preserving every other property and all global/light settings.
                renderer.GetPropertyBlock(block);
                block.SetVector(B5MainShadow, Vector4.zero);
                block.SetVector(B5AdditionalFade, new Vector4(0, 1, 0, 0));
                renderer.SetPropertyBlock(block);
                water++;
            }
            Debug.Log("[B5] 빛기둥 끔=" + shafts + " 독액 수면 그림자 끔=" + water);
            return new[] { shafts, water };
        }

        IEnumerator B5Compare()
        {
            yield return null; // NativeGame.Start must finish first.
            string output = Argument("-output");
            if (string.IsNullOrEmpty(output)) { Application.Quit(3); yield break; }
            Directory.CreateDirectory(output);
            AudioListener.volume = 0; AudioListener.pause = true;
            Screen.SetResolution(3840, 1080, FullScreenMode.Windowed);
            smokeActive = true; pauseSmoke = true; Running = false;
            lobby.Flow.ShowLobby(); lobby.Flow.SelectPreview();
            if (!lobby.Flow.EnterTest()) { Application.Quit(3); yield break; }
            EndFirstPractice(true); frontendEntryInputFence = false; menu = false; gameFocused = true;
            Running = false;
            float deadline = Time.realtimeSinceStartup + 90;
            while (!Remodel3DReady && Time.realtimeSinceStartup < deadline) { UpdateViews(); yield return null; }
            if (!Remodel3DReady) { Application.Quit(3); yield break; }
            Simulation.Player.X = 4020; Simulation.Player.Y = 7420; lastX = 4020; lastY = 7420;
            // Distant-enemy visibility fixture; visual QA only, no product rules are changed.
            Simulation.SpawnNormalEnemy(4000, 6500);
            Simulation.SpawnNormalEnemy(3650, 6400);
            for (int i = 0; i < 20; i++) { UpdateViews(); yield return null; }
            Time.timeScale = 0;
            yield return new WaitForEndOfFrame();
            int width = 3840, height = 1080;
            var screenBefore = ScreenCapture.CaptureScreenshotAsTexture();
            if (screenBefore.width != width || screenBefore.height != height)
            {
                Debug.LogError("[B5] 실제 화면 크기 불일치 " + screenBefore.width + "x" + screenBefore.height);
                Destroy(screenBefore); Application.Quit(3); yield break;
            }
            File.WriteAllBytes(Path.Combine(output, "07-kill-off.png"), screenBefore.EncodeToPNG());
            // --b5fix-off makes the first draw the unmodified product. Two immediate renders
            // share simulation, shader time, camera, geometry, lighting and actor animation.
            var before = B5ReadFrame(width, height);
            File.WriteAllBytes(Path.Combine(output, "07-kill-off-world.png"), before.EncodeToPNG());
            var changed = B5Apply(a2Root);
            var after = B5ReadFrame(width, height);
            File.WriteAllBytes(Path.Combine(output, "07-kill-on-world.png"), after.EncodeToPNG());
            var a = before.GetPixels32(); var b = after.GetPixels32();
            int pixels = 0; long sum = 0;
            for (int i = 0; i < a.Length; i++)
            {
                int d = Math.Abs(a[i].r-b[i].r)+Math.Abs(a[i].g-b[i].g)+Math.Abs(a[i].b-b[i].b);
                if (d != 0) pixels++; sum += d;
            }
            yield return new WaitForEndOfFrame();
            var screenAfter = ScreenCapture.CaptureScreenshotAsTexture();
            File.WriteAllBytes(Path.Combine(output, "07-kill-on.png"), screenAfter.EncodeToPNG());
            var sa = screenBefore.GetPixels32(); var sb = screenAfter.GetPixels32();
            int screenPixels = 0;
            for (int i = 0; i < sa.Length; i++) if (!sa[i].Equals(sb[i])) screenPixels++;
            string receipt = "{\"width\":3840,\"height\":1080,\"changedPixels\":" + pixels
                + ",\"rgbAbsoluteDifference\":" + sum + ",\"disabledShafts\":" + changed[0]
                + ",\"waterRenderers\":" + changed[1] + ",\"worldSameFrame\":true,\"screenChangedPixels\":" + screenPixels
                + ",\"hud\":true,\"scope\":\"actual hidden-desktop GPU Player final screen pair plus same-frame world pair; fixed bridge and two distant fixture enemies; not natural play\"}";
            File.WriteAllText(Path.Combine(output, "pixel-diff.json"), receipt);
            Destroy(before); Destroy(after);
            Destroy(screenBefore); Destroy(screenAfter);
            lobby.enabled = false; lobby.CloseStartupCaptureMedia(); sound.Reset();
            Application.Quit(changed[0] > 0 && changed[1] > 0 ? 0 : 3);
        }

        Texture2D B5ReadFrame(int width, int height)
        {
            var camera = HudCamera;
            var target = RenderTexture.GetTemporary(width, height, 24, RenderTextureFormat.ARGB32);
            var previous = camera.targetTexture;
            var active = RenderTexture.active;
            try
            {
                camera.targetTexture = target; camera.Render(); RenderTexture.active = target;
                var image = new Texture2D(width, height, TextureFormat.RGB24, false);
                image.ReadPixels(new Rect(0, 0, width, height), 0, 0); image.Apply();
                return image;
            }
            finally { camera.targetTexture = previous; RenderTexture.active = active; RenderTexture.ReleaseTemporary(target); }
        }

#if UNITY_EDITOR
        public static void B5VerifyAndBuild()
        {
            if (!B5Enabled(Array.Empty<string>(), false)
                || B5Enabled(new[] { "--b5fix-off" }, false)
                || B5Enabled(new[] { "--a2r1-light" }, false)
                || B5Enabled(Array.Empty<string>(), true)) throw new Exception("B5 activation gate");
            var root = new GameObject("B5 editor fixture");
            Material material = null;
            try
            {
                material = new Material(Shader.Find("EXODUSER/A2ToxicRiver"));
                var water = new GameObject("water").AddComponent<MeshRenderer>(); water.transform.SetParent(root.transform);
                water.sharedMaterial = material; water.receiveShadows = true;
                var shaft = new GameObject("A2 필드 국소 빛기둥").AddComponent<MeshRenderer>(); shaft.transform.SetParent(root.transform);
                var legacy = new GameObject("A2 국소 달빛기둥").AddComponent<MeshRenderer>(); legacy.transform.SetParent(root.transform);
                var tree = new GameObject("tree").AddComponent<MeshRenderer>(); tree.transform.SetParent(root.transform); tree.receiveShadows = true;
                var block = new MaterialPropertyBlock(); block.SetFloat("_B5Preserve", 7); water.SetPropertyBlock(block);
                // Baseline reproduces both defects; the actual Unity objects must change.
                if (!water.receiveShadows || !shaft.enabled || !legacy.enabled) throw new Exception("B5 baseline fixture");
                var counts = B5Apply(root); water.GetPropertyBlock(block);
                if (counts[0] != 2 || counts[1] != 1 || water.receiveShadows || shaft.enabled || legacy.enabled
                    || !tree.enabled || !tree.receiveShadows || block.GetFloat("_B5Preserve") != 7
                    || block.GetVector(B5AdditionalFade).y != 1) throw new Exception("B5 renderer isolation");
                Debug.Log("B5_VERIFY passed activation=4 renderer-isolation=1 baseline=1");
            }
            finally { UnityEngine.Object.DestroyImmediate(root); if (material != null) UnityEngine.Object.DestroyImmediate(material); }
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                var verification = assembly.GetType("PortVerification");
                if (verification == null) continue;
                verification.GetMethod("Build").Invoke(null, null);
                return;
            }
            throw new Exception("PortVerification editor assembly missing");
        }
#endif
    }
}
