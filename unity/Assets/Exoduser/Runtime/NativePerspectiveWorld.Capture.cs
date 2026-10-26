using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using UnityEngine;
using UnityEngine.Video;

namespace Exoduser.UnityPort
{
    // PC-MAP3D stage-1 standalone verification: `EXODUSER-Unity.exe --unity-world3d-capture <out> [--unity-world3d-fps-seconds N]`.
    // The world builds itself (no NativeGame change), renders the Godot LOOK-001 focus (4020,7420) at 1920x1080 into a RenderTexture,
    // records the still-scene frame intervals with the LOOK-001 definitions, writes a receipt and quits.
    public sealed partial class NativePerspectiveWorld
    {
        public const string CaptureArgument = "--unity-world3d-capture", FpsSecondsArgument = "--unity-world3d-fps-seconds";

        static string ArgumentValue(string key)
        {
            var args = Environment.GetCommandLineArgs(); int i = Array.IndexOf(args, key);
            return i >= 0 && i + 1 < args.Length ? args[i + 1] : "";
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void BeforeScene()
        {
            if (string.IsNullOrEmpty(ArgumentValue(CaptureArgument))) return;
            AudioListener.volume = 0f; QualitySettings.vSyncCount = 0; Application.targetFrameRate = 120; Application.runInBackground = true;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void AfterScene()
        {
            string output = ArgumentValue(CaptureArgument);
            if (string.IsNullOrEmpty(output)) return;
            var go = new GameObject("NativePerspectiveWorld Capture");
            DontDestroyOnLoad(go);
            var world = go.AddComponent<NativePerspectiveWorld>();
            world.StartCoroutine(world.CaptureRoutine(output));
        }

        [Serializable] sealed class CaptureReceipt
        {
            public string scope = "PC-MAP3D stage 1 (Built-in, lit key/fill/ambient, no shadow/fog/glow/grade)";
            public string unityVersion, graphicsDevice, graphicsApi, renderPipeline, colorSpace, qualityLevel;
            public int vSyncCount, targetFrameRate, screenWidth, screenHeight, captureWidth, captureHeight;
            public float focusX, focusY, appliedFocusX, appliedFocusY, cameraFov, cameraNear, cameraFar, cameraX, cameraY, cameraZ, cameraPitchDegrees;
            public bool clampApplied, passed, shadows, postActive;
            public float rayCenterErrorPx, rayCornerMaxErrorPx; public int pixelLightCount;
            public int fieldLights, overlayChunks, shadowCascades; public float shadowDistance, altarFocusAppliedX, altarFocusAppliedY;
            public int loadedChunks, mapChunks, massCount, propCount;
            public float massHeight;
            public string massTexture;
            public List<string> checks = new List<string>();
            public string png, fpsJson;
        }

        [Serializable] sealed class FpsReceipt
        {
            public string definition = "LOOK-001 look-001_REPORT.md: average = frames/real seconds; min(1s) = lowest completed 1-second bin; instantaneous = 1 / longest frame interval";
            public string scene = "still scene (focus 4020,7420), no input, no simulation tick; end-of-frame timestamps";
            public double durationSeconds, averageFps, minimumOneSecondFps, minimumInstantaneousFps, longestFrameMs;
            public int frames, vSyncCount, targetFrameRate;
            public List<double> oneSecondBins = new List<double>();
        }

        IEnumerator CaptureRoutine(string output)
        {
            var receipt = new CaptureReceipt();
            Directory.CreateDirectory(output);
            try
            {
                SilenceHostScene();
                var resource = Resources.Load<TextAsset>("Data/ch1_map");
                if (resource == null) throw new InvalidOperationException("Original map resource is missing");
                Initialize(JsonUtility.FromJson<MapData>(resource.text));
                SyncPlayer(Map.startX, Map.startY, 15f, 2, 0); // Godot player starts with facing = RIGHT (player.gd:70) -> idle_east frame 0
                WorldCamera.enabled = true;
                Prime(new Vector2(Map.startX, Map.startY));
            }
            catch (Exception e) { UnityEngine.Debug.LogException(e); receipt.checks.Add("FAIL init: " + e.Message); File.WriteAllText(Path.Combine(output, "capture.json"), JsonUtility.ToJson(receipt, true)); Application.Quit(2); yield break; }
            for (int i = 0; i < 6; i++) yield return null;
            yield return new WaitForEndOfFrame();
            // 1920x1080 world render (camera only, the Godot capture also contains its HUD layer).
            var rt = new RenderTexture(1920, 1080, 24, RenderTextureFormat.ARGB32) { antiAliasing = 1 };
            var shown = WorldCamera.targetTexture; WorldCamera.targetTexture = rt;
            var image = new Texture2D(1920, 1080, TextureFormat.RGB24, false); var previous = RenderTexture.active;
            Action<string> save = path =>
            {
                WorldCamera.Render();
                RenderTexture.active = rt; image.ReadPixels(new Rect(0, 0, 1920, 1080), 0, 0); image.Apply(); RenderTexture.active = previous;
                File.WriteAllBytes(path, image.EncodeToPNG());
            };
            FlickerFrameOverride = 0f; // deterministic stills; the live view flickers
            var start = new Vector2(Map.startX, Map.startY); var altar = new Vector2(5900f, 3900f); // altar = map.json m_c1altar, same focus as the Godot altar cut
            Prime(start); yield return null; yield return null; FlushUnloads();
            string png = Path.Combine(output, "unity-world3d.png"); save(png);
            receipt.png = png; receipt.captureWidth = image.width; receipt.captureHeight = image.height;
            var cam = WorldCamera.transform.position;
            receipt.unityVersion = Application.unityVersion; receipt.graphicsDevice = SystemInfo.graphicsDeviceName; receipt.graphicsApi = SystemInfo.graphicsDeviceType.ToString();
            receipt.renderPipeline = UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline == null ? "Built-in" : UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline.name;
            receipt.colorSpace = QualitySettings.activeColorSpace.ToString(); receipt.qualityLevel = QualitySettings.names[QualitySettings.GetQualityLevel()];
            receipt.vSyncCount = QualitySettings.vSyncCount; receipt.targetFrameRate = Application.targetFrameRate; receipt.screenWidth = Screen.width; receipt.screenHeight = Screen.height;
            receipt.focusX = Focus.x; receipt.focusY = Focus.y; receipt.appliedFocusX = AppliedFocus.x; receipt.appliedFocusY = AppliedFocus.y; receipt.clampApplied = ClampApplied;
            receipt.cameraFov = WorldCamera.fieldOfView; receipt.cameraNear = WorldCamera.nearClipPlane; receipt.cameraFar = WorldCamera.farClipPlane;
            receipt.cameraX = cam.x; receipt.cameraY = cam.y; receipt.cameraZ = cam.z; receipt.cameraPitchDegrees = WorldCamera.transform.eulerAngles.x;
            receipt.loadedChunks = LoadedChunkCount; receipt.mapChunks = Map.chunks.Length; receipt.massCount = MassCount; receipt.propCount = PropCount; receipt.massHeight = MaxMassHeight; receipt.massTexture = MassTextureResource;
            receipt.shadows = ShadowsEnabled; receipt.fieldLights = FieldLightCount; receipt.postActive = Post != null && Post.Active; receipt.shadowDistance = QualitySettings.shadowDistance; receipt.shadowCascades = QualitySettings.shadowCascades;
            // Aim ray: screen centre must land on the camera focus; the four corners are cross-checked against Unity's own camera rays on the y=0 plane.
            Vector2 centerHit; ScreenToGroundPxTopLeft(new Vector2(960f, 540f), 1920f, 1080f, out centerHit);
            receipt.rayCenterErrorPx = Vector2.Distance(centerHit, AppliedFocus);
            float cornerMax = 0f;
            foreach (var corner in new[] { new Vector2(0, 0), new Vector2(1920, 0), new Vector2(1920, 1080), new Vector2(0, 1080) })
            {
                Vector2 mine; bool hit = ScreenToGroundPxTopLeft(corner, 1920f, 1080f, out mine);
                var ray = WorldCamera.ScreenPointToRay(new Vector3(corner.x, 1080f - corner.y, 0f)); float t = -ray.origin.y / ray.direction.y;
                var unityHit = ray.origin + ray.direction * t; var expected = new Vector2(unityHit.x, -unityHit.z);
                cornerMax = Mathf.Max(cornerMax, hit ? Vector2.Distance(mine, expected) : 9999f);
            }
            receipt.rayCornerMaxErrorPx = cornerMax; receipt.pixelLightCount = QualitySettings.pixelLightCount;
            Action<bool, string> check = (ok, name) => receipt.checks.Add((ok ? "PASS " : "FAIL ") + name);
            check(receipt.rayCenterErrorPx <= 1f, "aim ray: screen centre -> focus within 1 px");
            check(receipt.rayCornerMaxErrorPx <= 1f, "aim ray: four corners equal Unity camera rays on y=0 within 1 px");
            check(receipt.renderPipeline == "Built-in", "Built-in render pipeline (no URP/SRP asset)");
            check(Mathf.Abs(receipt.cameraFov - 2f * Mathf.Atan(1080f / (2f * Distance * Zoom)) * Mathf.Rad2Deg) < 0.01f, "FOV = 2*atan(H/(2*d*zoom)) for H=1080");
            check(MassCount == 292, "292 authored masses");
            check(PropCount == Map.props.Length, "all original props placed");
            check(LoadedChunkCount > 0, "ground chunks streamed");
            check(image.width == 1920 && image.height == 1080, "1920x1080 capture");
            check(receipt.shadows && receipt.shadowCascades == 4 && Mathf.Abs(receipt.shadowDistance - ShadowDistance) < 0.5f, "key shadow on: 4 cascades, distance 5000");
            check(receipt.fieldLights == 12, "12 field Point Lights from ch1_lighting.json");
            check(receipt.postActive, "glow + colour adjustment post pass active");
            // Variant without the authored masses: the Godot LOOK-001 D capture only built 3 of the 51 masses intersecting its view area
            // (_sync_visible_masses caches the camera cell before the corner rays are ready, native_perspective_view.gd:521-531),
            // so these renders are the like-for-like comparison for ground/props/player/lighting.
            massRoot.gameObject.SetActive(false); save(Path.Combine(output, "unity-world3d-nomass.png"));
            massRoot.gameObject.SetActive(true);
            // Altar cut (Godot altar focus (5900,3900) = m_c1altar).
            Prime(altar); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-altar.png"));
            massRoot.gameObject.SetActive(false); save(Path.Combine(output, "unity-world3d-altar-nomass.png")); massRoot.gameObject.SetActive(true);
            receipt.altarFocusAppliedX = AppliedFocus.x; receipt.altarFocusAppliedY = AppliedFocus.y;
            // Uncalibrated constants (plain Godot look_3d_variant.gd energies) at START and altar.
            SetCalibration(false); Prime(start); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-nocalibration.png")); massRoot.gameObject.SetActive(false); save(Path.Combine(output, "unity-world3d-nocalibration-nomass.png")); massRoot.gameObject.SetActive(true);
            Prime(altar); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-altar-nocalibration.png")); SetCalibration(true);
            // Lighting ablations at the start focus (shadow off / field lights off) prove the stage-2 terms have a visible effect.
            Prime(start); yield return null; yield return null; FlushUnloads();
            SetShadows(false); save(Path.Combine(output, "unity-world3d-noshadow.png")); SetShadows(true);
            SetFieldLights(false); Prime(altar); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-altar-nofieldlight.png")); SetFieldLights(true);
            // QA collision overlay (default off) at START and at the altar.
            SetCollisionOverlay(true);
            Prime(start); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-collision-start.png"));
            Prime(altar); yield return null; yield return null; FlushUnloads(); save(Path.Combine(output, "unity-world3d-collision-altar.png"));
            receipt.overlayChunks = overlays.Count;
            SetCollisionOverlay(false);
            check(receipt.overlayChunks > 0 && !CollisionOverlay, "collision overlay built from SourceMap and switched off again");
            Prime(start); yield return null; yield return null; FlushUnloads(); FlickerFrameOverride = null;
            WorldCamera.targetTexture = shown; rt.Release(); Destroy(rt); Destroy(image);

            // Still-scene frame intervals. Window renders every frame to the screen; timestamps at end of frame (frame_post_draw analogue).
            float seconds = 30f; float parsed; if (float.TryParse(ArgumentValue(FpsSecondsArgument), out parsed) && parsed >= 1f) seconds = parsed;
            var fps = new FpsReceipt { vSyncCount = QualitySettings.vSyncCount, targetFrameRate = Application.targetFrameRate };
            var intervals = new List<double>(4096); var clock = Stopwatch.StartNew();
            yield return new WaitForEndOfFrame(); double begin = clock.Elapsed.TotalSeconds, previousTime = begin, binBegin = begin; int binFrames = 0;
            while (previousTime - begin < seconds)
            {
                yield return new WaitForEndOfFrame();
                double now = clock.Elapsed.TotalSeconds; intervals.Add(now - previousTime); binFrames++;
                if (now - binBegin >= 1.0) { fps.oneSecondBins.Add(binFrames / (now - binBegin)); binBegin = now; binFrames = 0; }
                previousTime = now;
            }
            double duration = previousTime - begin, longest = 0; foreach (double v in intervals) if (v > longest) longest = v;
            double minimumBin = double.PositiveInfinity; foreach (double v in fps.oneSecondBins) if (v < minimumBin) minimumBin = v;
            fps.frames = intervals.Count; fps.durationSeconds = duration; fps.averageFps = intervals.Count / duration; fps.minimumOneSecondFps = double.IsInfinity(minimumBin) ? 0 : minimumBin;
            fps.longestFrameMs = longest * 1000.0; fps.minimumInstantaneousFps = longest > 0 ? 1.0 / longest : 0;
            string fpsPath = Path.Combine(output, "unity-world3d-fps.json"); File.WriteAllText(fpsPath, JsonUtility.ToJson(fps, true)); receipt.fpsJson = fpsPath;
            receipt.passed = !receipt.checks.Exists(c => c.StartsWith("FAIL"));
            File.WriteAllText(Path.Combine(output, "capture.json"), JsonUtility.ToJson(receipt, true));
            foreach (var video in FindObjectsByType<VideoPlayer>(FindObjectsInactive.Include)) Destroy(video);
            yield return null; yield return null;
            Application.Quit(receipt.passed ? 0 : 3);
        }

        // The standalone verification must not play the lobby movies or draw frontend IMGUI: stop every other port behaviour/camera/media.
        void SilenceHostScene()
        {
            foreach (var behaviour in FindObjectsByType<MonoBehaviour>(FindObjectsInactive.Include))
                if (behaviour != null && behaviour != this && behaviour.GetType().Namespace == "Exoduser.UnityPort") behaviour.enabled = false;
            foreach (var video in FindObjectsByType<VideoPlayer>(FindObjectsInactive.Include)) { video.Stop(); video.enabled = false; }
            foreach (var source in FindObjectsByType<AudioSource>(FindObjectsInactive.Include)) { source.Stop(); source.mute = true; }
            foreach (var camera in FindObjectsByType<Camera>(FindObjectsInactive.Include)) camera.enabled = false;
        }
    }
}
