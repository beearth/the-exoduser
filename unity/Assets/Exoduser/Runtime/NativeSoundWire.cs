using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // R8/R9 sound wiring (sound lead, 2026-11-04): the logical keys the user's listening pick will fill with RM1/<key>.mp3, wired to their triggers before the files exist.
    // Rule per key: a file named RM1/<key>.mp3 wins; else the temporary file listed in a fallback table; else nothing plays and the Receipt records "no file yet".
    // No UnityEngine here on purpose: the timing / state-tracking rules below are checked by unity/Tools/sound-wire-tests without Unity.
    public static class NativeSoundWire
    {
        public const string AmbForestBed = "amb_forest_bed", BioTreePulse = "bio_tree_pulse", BioTreeBreath = "bio_tree_breath",
            DruidIntro = "druid_intro", DruidCollapse12 = "druid_collapse12", DruidCollapse23 = "druid_collapse23", DruidHeap = "druid_heap",
            DruidBossKill = "druid_boss_kill", DruidDeathSink = "druid_death_sink", ExitOpen = "exit_open", ExitEnter = "exit_enter";
        public const float VolIntro = .8f, VolCollapse = .7f, VolHeap = .35f, VolBossKill = .8f, VolDeathSink = .55f, VolExit = .6f, VolTreePulse = .5f, VolTreeBreath = .4f;
        public const float PulseMin = 3.5f, PulseMax = 4.5f;

        // keys that play through the one-shot path (NativeFeedbackAudio.HandleLogical): temporary file(s); an empty array = leave silent, log only
        public static readonly Dictionary<string, string[]> Fallbacks = new Dictionary<string, string[]> {
            { DruidIntro, new string[0] }, { DruidCollapse12, new string[0] }, { DruidCollapse23, new string[0] }, { DruidBossKill, new string[0] },
            { DruidDeathSink, new[] { "druid_sink" } },   // the sink sound already in the game stands in until RM1/druid_death_sink.mp3 exists
            { ExitOpen, new string[0] }, { ExitEnter, new string[0] } };
        public static readonly Dictionary<string, float> StartVolume = new Dictionary<string, float> {
            { DruidIntro, VolIntro }, { DruidCollapse12, VolCollapse }, { DruidCollapse23, VolCollapse }, { DruidBossKill, VolBossKill },
            { DruidDeathSink, VolDeathSink }, { ExitOpen, VolExit }, { ExitEnter, VolExit } };

        // file key list to play for a logical key: own file first, then the fallback tables in order, else {key} (old behaviour for keys nobody listed)
        public static string[] ResolveFiles(string key, Func<string, bool> has, params IDictionary<string, string[]>[] tables)
        {
            if (has != null && has(key)) return new[] { key };
            if (tables != null) foreach (var t in tables) { string[] f; if (t != null && t.TryGetValue(key, out f)) return f; }
            return new[] { key };
        }
        public static string NoFileNote(string key) { return "no file yet (placeholder, RM1/" + key + ".mp3 not added)"; }
        // seconds to the next tree pulse for a draw r01 in [0,1)
        public static float PulseInterval(double r01) { if (r01 < 0) r01 = 0; if (r01 > 1) r01 = 1; return PulseMin + (float)r01 * (PulseMax - PulseMin); }

        public enum HeapAction { None, Start, Stop }
        public struct BossStep { public string Cue, CueSource; public HeapAction Heap; public string HeapSource; }
        // Watches the druid state the way NativeBossView.prevBossState does (previous vs now): the Core gets no new event.
        // life = DruidLifeState.Life at the observed tick (0 = first life ended, 1 = second, 2 = the final death sequence: no collapse sound).
        public sealed class BossCueTracker
        {
            string prev; bool heapOn;
            public bool HeapOn { get { return heapOn; } }
            public void Reset() { prev = null; heapOn = false; }
            // true when a heap loop was running and now has to stop (arena load, field restored, reset)
            public bool StopHeap() { if (!heapOn) return false; heapOn = false; return true; }
            public BossStep Observe(string state, int life, bool bossGone)
            {
                var r = new BossStep();
                if (bossGone)
                {   // final kill or the sink drawing (EnemyState no longer Alive): the heap loop ends
                    prev = null;
                    if (heapOn) { heapOn = false; r.Heap = HeapAction.Stop; r.HeapSource = "boss gone (final kill / sink start)"; }
                    return r;
                }
                if (state == "bossDruidRest" && prev != "bossDruidRest")
                {
                    if (life == 0) { r.Cue = DruidCollapse12; r.CueSource = "boss state into bossDruidRest, life 1 ended"; }
                    else if (life == 1)
                    {
                        r.Cue = DruidCollapse23; r.CueSource = "boss state into bossDruidRest, life 2 ended";
                        if (!heapOn) { heapOn = true; r.Heap = HeapAction.Start; r.HeapSource = "collapse23 (life 2 ended): heap stays where he knelt"; }
                    }
                }
                prev = state;
                return r;
            }
        }
    }
}
