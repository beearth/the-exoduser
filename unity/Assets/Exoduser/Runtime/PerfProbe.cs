using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using Unity.Profiling;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PERF-U0 frame-cost probe (docs/12퍼포먼스·최적화/UNITY_FRAME_OPT_MASTER_20261103.md).
    // Off unless --unity-perf is on the command line. When off, Begin/End is a single static bool test and nothing is allocated.
    // When on, NativeGame attaches PerfRecorder, which writes perf-frames.csv + perf-meta.json into -output (or the QA sandbox) on quit.
    public static class PerfProbe
    {
        public const string Argument = "--unity-perf";
        public static readonly bool Enabled = Array.IndexOf(Environment.GetCommandLineArgs(), Argument) >= 0;
        // Sections may nest (Views and Chunks run inside Update, Hud inside Gui); each is timed on its own.
        public enum Section { Update, FixedSim, Views, Chunks, Gui, Hud, R3Late, Qa, EnemyViews, Objective, FieldHud, EnemyBars, Floaters, RegionHud, Count }   // Qa = fullrun QA planner + policy file reads (not product cost)
        static readonly long[] started = new long[(int)Section.Count];
        static readonly long[] total = new long[(int)Section.Count];
        static readonly long[] heapStart = new long[(int)Section.Count], allocated = new long[(int)Section.Count];   // managed heap growth inside a section (a GC inside the section reads as 0)
        public static int FixedSteps, GuiCalls;
        public static void Begin(Section s) { if (!Enabled) return; heapStart[(int)s] = UnityEngine.Profiling.Profiler.GetMonoUsedSizeLong(); started[(int)s] = Stopwatch.GetTimestamp(); }
        public static void End(Section s) { if (!Enabled) return; total[(int)s] += Stopwatch.GetTimestamp() - started[(int)s]; long grown = UnityEngine.Profiling.Profiler.GetMonoUsedSizeLong() - heapStart[(int)s]; if (grown > 0) allocated[(int)s] += grown; }
        internal static void Drain(float[] ms)
        {
            double k = 1000.0 / Stopwatch.Frequency;
            for (int i = 0; i < total.Length; i++) { ms[i] = (float)(total[i] * k); total[i] = 0; }
        }
        internal static void DrainAlloc(long[] bytes) { for (int i = 0; i < allocated.Length; i++) { bytes[i] = allocated[i]; allocated[i] = 0; } }
    }

    public sealed class PerfRecorder : MonoBehaviour
    {
        struct Row
        {
            public int frame, fixedSteps, guiCalls, gcCount, enemies, loadPhase, phase;
            public float realMs, cpuMainMs, cpuRenderMs, gpuMs, time;
            public long gcAlloc, gcUsed, drawCalls, batches, setPass, triangles;
        }
        public NativeGame Game;
        public string Output;
        public int FrameCap = -1;   // -1 = uncapped (measures cost, not the cap); -perf-cap N keeps the player's own cap
        const int Capacity = 400000;   // frames; a full uncapped 1-1 run is ~155k
        readonly List<Row> rows = new List<Row>(Capacity);
        static readonly int N = (int)PerfProbe.Section.Count;
        float[] sectionMs; long[] sectionBytes;
        readonly float[] sections = new float[(int)PerfProbe.Section.Count];
        readonly long[] sectionAlloc = new long[(int)PerfProbe.Section.Count];
        readonly FrameTiming[] timing = new FrameTiming[1];
        readonly object logLock = new object();
        readonly List<string> logEvents = new List<string>();
        ProfilerRecorder gcAlloc, gcUsed, drawCalls, batches, setPass, triangles;
        long last; int lastGc; bool flushed; float started;

        void OnEnable()
        {
            gcAlloc = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Allocated In Frame");
            gcUsed = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Used Memory");
            drawCalls = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Draw Calls Count");
            batches = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Batches Count");
            setPass = ProfilerRecorder.StartNew(ProfilerCategory.Render, "SetPass Calls Count");
            triangles = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Triangles Count");
            sectionMs = new float[Capacity * N]; sectionBytes = new long[Capacity * N];
            Application.logMessageReceivedThreaded += OnLog;
            started = Time.realtimeSinceStartup; last = Stopwatch.GetTimestamp(); lastGc = GC.CollectionCount(0);
            StartCoroutine(EndOfFrameLoop());
        }
        void OnDisable()
        {
            Application.logMessageReceivedThreaded -= OnLog;
            gcAlloc.Dispose(); gcUsed.Dispose(); drawCalls.Dispose(); batches.Dispose(); setPass.Dispose(); triangles.Dispose();
        }
        // Shader variant uploads / compiles (GraphicsSettings "Log Shader Compilation") and loading lines, tagged with the frame they landed in.
        void OnLog(string message, string stack, LogType type)
        {
            if (message == null) return;
            if (message.IndexOf("shader", StringComparison.OrdinalIgnoreCase) < 0 && type != LogType.Error && type != LogType.Exception) return;
            string line = Time.frameCount + "\t" + type + "\t" + (message.Length > 300 ? message.Substring(0, 300) : message).Replace('\n', ' ').Replace('\t', ' ');
            lock (logLock) { if (logEvents.Count < 20000) logEvents.Add(line); }
        }
        IEnumerator EndOfFrameLoop()
        {
            var endOfFrame = new WaitForEndOfFrame();
            while (true) { yield return endOfFrame; Sample(); }
        }
        // One row per rendered frame: wall time from the previous end-of-frame to this one, so the row holds that frame's own sections.
        void Sample()
        {
            if (flushed || rows.Count >= Capacity) return;
            if (Application.targetFrameRate != FrameCap) Application.targetFrameRate = FrameCap;
            if (FrameCap < 0 && QualitySettings.vSyncCount != 0) QualitySettings.vSyncCount = 0;
            long now = Stopwatch.GetTimestamp();
            var r = new Row { frame = Time.frameCount, realMs = (float)((now - last) * 1000.0 / Stopwatch.Frequency), time = Time.realtimeSinceStartup - started };
            last = now;
            FrameTimingManager.CaptureFrameTimings();
            if (FrameTimingManager.GetLatestTimings(1, timing) > 0)
            { r.cpuMainMs = (float)timing[0].cpuMainThreadFrameTime; r.cpuRenderMs = (float)timing[0].cpuRenderThreadFrameTime; r.gpuMs = (float)timing[0].gpuFrameTime; }
            else r.cpuMainMs = r.cpuRenderMs = r.gpuMs = -1;
            int gc = GC.CollectionCount(0); r.gcCount = gc - lastGc; lastGc = gc;
            r.gcAlloc = gcAlloc.Valid ? gcAlloc.LastValue : -1; r.gcUsed = gcUsed.Valid ? gcUsed.LastValue : -1;
            r.drawCalls = drawCalls.Valid ? drawCalls.LastValue : -1; r.batches = batches.Valid ? batches.LastValue : -1;
            r.setPass = setPass.Valid ? setPass.LastValue : -1; r.triangles = triangles.Valid ? triangles.LastValue : -1;
            r.fixedSteps = PerfProbe.FixedSteps; r.guiCalls = PerfProbe.GuiCalls; PerfProbe.FixedSteps = 0; PerfProbe.GuiCalls = 0;
            PerfProbe.Drain(sections); PerfProbe.DrainAlloc(sectionAlloc);
            int at = rows.Count * N; for (int i = 0; i < N; i++) { sectionMs[at + i] = sections[i]; sectionBytes[at + i] = sectionAlloc[i]; }
            var sim = Game != null ? Game.Simulation : null;
            // phase: 0 frontend/lobby, 1 field, 2 arena, 3 stage loading
            if (sim == null || Game.FrontendBlocking) r.phase = 0;
            else
            {
                r.loadPhase = sim.Stage.LoadPhase; r.phase = sim.Stage.LoadPhase > 0 ? 3 : sim.Stage.InArena ? 2 : 1;
                int alive = 0; var list = sim.Enemies; for (int i = 0; i < list.Count; i++) if (list[i].Alive) alive++; r.enemies = alive;
            }
            rows.Add(r);
        }
        void OnApplicationQuit() { Flush(); }
        public void Flush()
        {
            if (flushed) return; flushed = true;
            string dir = Output;
            if (string.IsNullOrEmpty(dir)) dir = Path.Combine(Application.persistentDataPath, "perf");
            try
            {
                Directory.CreateDirectory(dir);
                var csv = new StringBuilder(rows.Count * 160);
                csv.Append("frame,time,phase,loadPhase,enemies,realMs,cpuMainMs,cpuRenderMs,gpuMs,fixedSteps,guiCalls,gcCount,gcAlloc,gcUsed,drawCalls,batches,setPass,triangles");
                for (int i = 0; i < (int)PerfProbe.Section.Count; i++) csv.Append(",ms").Append(((PerfProbe.Section)i).ToString());
                for (int i = 0; i < (int)PerfProbe.Section.Count; i++) csv.Append(",alloc").Append(((PerfProbe.Section)i).ToString());
                csv.Append('\n');
                var inv = System.Globalization.CultureInfo.InvariantCulture;
                for (int ri = 0; ri < rows.Count; ri++)
                {
                    var r = rows[ri];
                    csv.Append(r.frame).Append(',').Append(r.time.ToString("0.000", inv)).Append(',').Append(r.phase).Append(',').Append(r.loadPhase).Append(',').Append(r.enemies).Append(',')
                       .Append(r.realMs.ToString("0.###", inv)).Append(',').Append(r.cpuMainMs.ToString("0.###", inv)).Append(',').Append(r.cpuRenderMs.ToString("0.###", inv)).Append(',').Append(r.gpuMs.ToString("0.###", inv)).Append(',')
                       .Append(r.fixedSteps).Append(',').Append(r.guiCalls).Append(',').Append(r.gcCount).Append(',').Append(r.gcAlloc).Append(',').Append(r.gcUsed).Append(',')
                       .Append(r.drawCalls).Append(',').Append(r.batches).Append(',').Append(r.setPass).Append(',').Append(r.triangles);
                    int at = ri * N;
                    for (int i = 0; i < N; i++) csv.Append(',').Append(sectionMs[at + i].ToString("0.###", inv));
                    for (int i = 0; i < N; i++) csv.Append(',').Append(sectionBytes[at + i]);
                    csv.Append('\n');
                }
                File.WriteAllText(Path.Combine(dir, "perf-frames.csv"), csv.ToString());
                lock (logLock) File.WriteAllLines(Path.Combine(dir, "perf-log-events.tsv"), logEvents.ToArray());
                var meta = new Meta
                {
                    device = SystemInfo.graphicsDeviceName, api = SystemInfo.graphicsDeviceType.ToString(), cpu = SystemInfo.processorType, cores = SystemInfo.processorCount,
                    memoryMb = SystemInfo.systemMemorySize, os = SystemInfo.operatingSystem, unity = Application.unityVersion, buildGuid = Application.buildGUID,
                    development = UnityEngine.Debug.isDebugBuild, width = Screen.width, height = Screen.height, quality = QualitySettings.names[QualitySettings.GetQualityLevel()],
                    frameCap = FrameCap, vSync = QualitySettings.vSyncCount, remodel3d = NativeRemodel3D.Requested, frameTimingSupported = FrameTimingManager.IsFeatureEnabled(),
                    gcAllocRecorder = gcAlloc.Valid, renderRecorders = drawCalls.Valid, frames = rows.Count, args = string.Join(" ", Environment.GetCommandLineArgs()),
                    sections = string.Join(",", Enum.GetNames(typeof(PerfProbe.Section)))
                };
                File.WriteAllText(Path.Combine(dir, "perf-meta.json"), JsonUtility.ToJson(meta, true));
                UnityEngine.Debug.Log("UNITY_PERF_WRITTEN " + rows.Count + " frames -> " + dir);
            }
            catch (Exception ex) when (ex is IOException || ex is UnauthorizedAccessException) { UnityEngine.Debug.LogError("UNITY_PERF_WRITE " + ex.GetType().Name + " " + ex.Message); }
        }
        [Serializable] sealed class Meta
        {
            public string device, api, cpu, os, unity, buildGuid, quality, args, sections; public int cores, memoryMb, width, height, frameCap, vSync, frames;
            public bool development, remodel3d, frameTimingSupported, gcAllocRecorder, renderRecorders;
        }
    }
}
