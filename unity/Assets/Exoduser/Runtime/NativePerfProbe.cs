using System;
using System.Collections.Generic;
using System.IO;
using Unity.Profiling;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // 11-04 CTO demo v0 performance: QA-only frame sampler. Active only with `--unity-perf-probe` and `-output <dir>`.
    // Every frame records frame time, FrameTimingManager CPU main/render and GPU time (needs Frame Timing Stats in the build),
    // and render counters, bucketed by game state (NativeGame.PerfSegment) and screen size. Writes <output>/perf-probe.json.
    // `--perf-off shadows` zeroes the URP shadow distance for A/B cost runs. Never changes Core or game rules.
    public sealed class NativePerfProbe : MonoBehaviour
    {
        const string Flag = "--unity-perf-probe";
        sealed class Bucket { public string key; public List<float> ms = new List<float>(); public double cpuMain, cpuRender, gpu; public int timed; public readonly double[] counters = new double[Names.Length]; }
        static readonly string[] Names = { "Draw Calls Count", "SetPass Calls Count", "Batches Count", "Triangles Count", "Vertices Count", "Shadow Casters Count", "Visible Skinned Meshes Count" };
        [Serializable] sealed class Row { public string segment, screen, bottleneck; public int frames, timedFrames; public float avgFps, p50Ms, p95Ms, p99Ms, maxMs, cpuMainMs, cpuRenderMs, gpuMs, drawCalls, setPass, batches, triangles, vertices, shadowCasters, skinnedMeshes; }
        [Serializable] sealed class Report { public string scope = "QA perf probe: hidden-desktop PC sample, not a device guarantee. GPU/CPU from FrameTimingManager; 0 means Frame Timing Stats was off in this build."; public string offs = ""; public bool frameTimingStats; public List<Row> rows = new List<Row>(); }

        readonly Dictionary<string, Bucket> buckets = new Dictionary<string, Bucket>();
        readonly FrameTiming[] timing = new FrameTiming[1];
        ProfilerRecorder[] recorders;
        NativeGame game; string output, offs = ""; float nextFind, nextWrite; bool stats;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            var a = Environment.GetCommandLineArgs();
            if (Array.IndexOf(a, Flag) < 0) return;
            int o = Array.IndexOf(a, "-output"); if (o < 0 || o + 1 >= a.Length) { Debug.LogWarning("PERF_PROBE needs -output"); return; }
            var go = new GameObject("QA perf probe"); DontDestroyOnLoad(go);
            var p = go.AddComponent<NativePerfProbe>(); p.output = a[o + 1];
            WindowsHardExit.RegisterFinalFlush(p.HardExitFlush);
            for (int i = 0; i < a.Length - 1; i++) if (a[i] == "--perf-off") p.offs += (p.offs.Length > 0 ? "," : "") + a[i + 1];
        }

        void Start()
        {
            recorders = new ProfilerRecorder[Names.Length];
            for (int i = 0; i < Names.Length; i++) recorders[i] = ProfilerRecorder.StartNew(ProfilerCategory.Render, Names[i], 1);
            if (offs.Contains("shadows") && GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp) urp.shadowDistance = 0;
            Debug.Log("PERF_PROBE start output=" + output + " off=" + offs);
        }

        void LateUpdate()
        {
            if (game == null && Time.unscaledTime >= nextFind) { game = FindFirstObjectByType<NativeGame>(); nextFind = Time.unscaledTime + 1; }
            string seg = game != null ? game.PerfSegment() : "boot";
            string key = seg + "@" + Screen.width + "x" + Screen.height;
            if (!buckets.TryGetValue(key, out var b)) buckets[key] = b = new Bucket { key = key };
            if (b.ms.Count < 60000) b.ms.Add(Time.unscaledDeltaTime * 1000f);
            FrameTimingManager.CaptureFrameTimings();
            if (FrameTimingManager.GetLatestTimings(1, timing) > 0 && timing[0].cpuFrameTime > 0)
            { stats = true; b.timed++; b.cpuMain += timing[0].cpuMainThreadFrameTime; b.cpuRender += timing[0].cpuRenderThreadFrameTime; b.gpu += timing[0].gpuFrameTime; }
            for (int i = 0; i < recorders.Length; i++) if (recorders[i].Valid) b.counters[i] += recorders[i].LastValue;
            if (Time.unscaledTime >= nextWrite) { nextWrite = Time.unscaledTime + 10; Write(); }
        }

        void OnApplicationQuit() { Write(); }
        // PC-QUIT-1: perf-probe.json is rewritten from the hard-exit final flush too (idempotent), in case OnApplicationQuit ordering is reversed.
        void HardExitFlush() { if (this != null) Write(); }
        void OnDestroy() { if (recorders != null) foreach (var r in recorders) r.Dispose(); }

        void Write()
        {
            try
            {
                var rep = new Report { offs = offs, frameTimingStats = stats };
                foreach (var b in buckets.Values)
                {
                    if (b.ms.Count < 2) continue;
                    var s = new List<float>(b.ms); s.Sort(); double sum = 0; foreach (var m in s) sum += m;
                    int n = b.ms.Count; float q(float p) => s[Mathf.Clamp(Mathf.CeilToInt(p * n) - 1, 0, n - 1)];
                    var at = b.key.IndexOf('@');
                    var row = new Row { segment = b.key.Substring(0, at), screen = b.key.Substring(at + 1), frames = n, timedFrames = b.timed, avgFps = (float)(n * 1000.0 / sum), p50Ms = q(.5f), p95Ms = q(.95f), p99Ms = q(.99f), maxMs = s[n - 1] };
                    if (b.timed > 0) { row.cpuMainMs = (float)(b.cpuMain / b.timed); row.cpuRenderMs = (float)(b.cpuRender / b.timed); row.gpuMs = (float)(b.gpu / b.timed); }
                    float c(int i) => (float)(b.counters[i] / n);
                    row.drawCalls = c(0); row.setPass = c(1); row.batches = c(2); row.triangles = c(3); row.vertices = c(4); row.shadowCasters = c(5); row.skinnedMeshes = c(6);
                    row.bottleneck = b.timed == 0 ? "unknown" : row.gpuMs >= Mathf.Max(row.cpuMainMs, row.cpuRenderMs) * .9f ? "GPU" : row.cpuRenderMs > row.cpuMainMs ? "CPU-render" : "CPU-main";
                    rep.rows.Add(row);
                }
                Directory.CreateDirectory(output);
                File.WriteAllText(Path.Combine(output, "perf-probe.json"), JsonUtility.ToJson(rep, true));
            }
            catch (Exception e) { Debug.LogWarning("PERF_PROBE write failed: " + e.Message); }
        }
    }
}
