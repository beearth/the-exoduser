using System;
using System.Diagnostics;
using UnityEditor;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
using Debug = UnityEngine.Debug;

// PERF-U4 identity check (docs/12퍼포먼스·최적화/UNITY_FRAME_OPT_MASTER_20261103.md):
// Unity -batchmode -nographics -quit -projectPath unity -executeMethod PerfSelfTests.ArenaMask
public static class PerfSelfTests
{
    public static void ArenaMask()
    {
        int failures = 0; var watch = new Stopwatch();
        for (int stage = 0; stage < 7; stage++)
        {
            var arena = BossArenaLayout.Generate(stage);
            watch.Restart(); bool closed = NativeArenaView.ParallelMatchesSerial(arena.Tiles, false, 0, 0); long closedMs = watch.ElapsedMilliseconds;
            var t = (int[])arena.Tiles.Clone(); int ex = arena.ExitX, ey = arena.ExitY, w = BossArenaLayout.Width;
            if (ey >= 0 && ey < BossArenaLayout.Height && ex >= 0 && ex < w) { t[ey * w + ex] = 0; if (ex > 0 && t[ey * w + ex - 1] == 1) t[ey * w + ex - 1] = 0; if (ex < w - 1 && t[ey * w + ex + 1] == 1) t[ey * w + ex + 1] = 0; }
            bool open = NativeArenaView.ParallelMatchesSerial(t, true, ex, ey);
            if (!closed) failures++; if (!open) failures++;
            Debug.Log("PERF_SELFTEST arena-mask stage=" + stage + " closed=" + closed + " open=" + open + " serial+parallel=" + closedMs + "ms");
        }
        Debug.Log("PERF_SELFTEST arena-mask " + (failures == 0 ? "PASS" : "FAIL failures=" + failures));
        EditorApplication.Exit(failures == 0 ? 0 : 2);
    }
}
