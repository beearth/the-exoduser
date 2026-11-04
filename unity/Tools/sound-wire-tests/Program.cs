using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Exoduser.UnityPort;

// R8/R9 sound wiring checks without Unity: file resolution order, boss-state cue timing (collapse12 / collapse23 / heap loop), pulse interval, and call-site counts.
// usage: dotnet run -p:ExoduserProject=<unity project dir> -- <unity project dir>
static class P
{
    static int pass, fail;
    static void Check(bool ok, string name) { if (ok) pass++; else { fail++; Console.WriteLine("FAIL " + name); } }
    static int Count(string path, string pattern) { return Regex.Matches(File.ReadAllText(path), pattern).Count; }
    static int Main(string[] args)
    {
        string root = args.Length > 0 ? args[0] : "../..";
        var none = new Func<string, bool>(k => false);
        // 1. file resolution: key file > fallback > log only > unknown key keeps old {key}
        foreach (var k in new[] { "druid_intro", "druid_collapse12", "druid_collapse23", "druid_boss_kill", "druid_death_sink", "exit_open", "exit_enter" })
        {
            string key0 = k;
            var own = NativeSoundWire.ResolveFiles(key0, key => key == key0, NativeSoundWire.Fallbacks);
            Check(own.Length == 1 && own[0] == key0, key0 + ": own file wins");
            var miss = NativeSoundWire.ResolveFiles(key0, none, NativeSoundWire.Fallbacks);
            Check(key0 == "druid_death_sink" ? (miss.Length == 1 && miss[0] == "druid_sink") : miss.Length == 0, key0 + ": fallback / log-only when no file");
            Check(NativeSoundWire.StartVolume.ContainsKey(key0), key0 + ": start volume");
        }
        var ownSink = NativeSoundWire.ResolveFiles("druid_death_sink", k => k == "druid_death_sink" || k == "druid_sink", NativeSoundWire.Fallbacks);
        Check(ownSink.Length == 1 && ownSink[0] == "druid_death_sink", "druid_death_sink file beats the druid_sink stand-in");
        var old = new Dictionary<string, string[]> { { "tell_parry", new[] { "tell_melee" } }, { "druid_staff_tap", new string[0] } };
        Check(NativeSoundWire.ResolveFiles("tell_parry", none, old, NativeSoundWire.Fallbacks)[0] == "tell_melee", "older table still resolves");
        Check(NativeSoundWire.ResolveFiles("druid_hit", none, old, NativeSoundWire.Fallbacks)[0] == "druid_hit", "unlisted key stays {key}");
        Check(NativeSoundWire.NoFileNote("exit_open").StartsWith("no file", StringComparison.Ordinal), "no-file note text");
        Check(NativeSoundWire.StartVolume["druid_intro"] == .8f && NativeSoundWire.StartVolume["druid_collapse12"] == .7f && NativeSoundWire.StartVolume["druid_collapse23"] == .7f && NativeSoundWire.StartVolume["druid_boss_kill"] == .8f && NativeSoundWire.StartVolume["druid_death_sink"] == .55f && NativeSoundWire.StartVolume["exit_open"] == .6f && NativeSoundWire.StartVolume["exit_enter"] == .6f && NativeSoundWire.VolHeap == .35f && NativeSoundWire.VolTreePulse == .5f && NativeSoundWire.VolTreeBreath == .4f, "start volumes match the brief");

        // 2. pulse interval 3.5-4.5 s
        Check(NativeSoundWire.PulseInterval(0) == 3.5f && NativeSoundWire.PulseInterval(1) == 4.5f && NativeSoundWire.PulseInterval(.5) == 4f, "pulse interval bounds");
        var rnd = new Random(7); bool inRange = true; for (int i = 0; i < 1000; i++) { float v = NativeSoundWire.PulseInterval(rnd.NextDouble()); if (v < 3.5f || v > 4.5f) inRange = false; }
        Check(inRange, "pulse interval always 3.5-4.5");

        // 3. boss cue timing: normal -> rest(life0) x120 frames -> rec -> rest(life1) x120 -> rec -> dying rest(life2) -> gone
        var tr = new NativeSoundWire.BossCueTracker(); int c12 = 0, c23 = 0, hs = 0, hp = 0, other = 0;
        Action<string, int, bool> feed = (st, life, gone) =>
        {
            var s = tr.Observe(st, life, gone);
            if (s.Cue == "druid_collapse12") c12++; else if (s.Cue == "druid_collapse23") c23++; else if (s.Cue != null) other++;
            if (s.Heap == NativeSoundWire.HeapAction.Start) hs++; else if (s.Heap == NativeSoundWire.HeapAction.Stop) hp++;
        };
        feed(null, 0, true); feed("bossIdle", 0, false); feed("bossSlamWind", 0, false);
        for (int i = 0; i < 120; i++) feed("bossDruidRest", 0, false);
        Check(c12 == 1 && c23 == 0 && hs == 0, "life 0 kneel: collapse12 exactly once, no heap");
        feed("bossRec", 1, false); feed("bossIdle", 1, false);
        for (int i = 0; i < 120; i++) feed("bossDruidRest", 1, false);
        Check(c12 == 1 && c23 == 1 && hs == 1 && hp == 0 && tr.HeapOn, "life 1 kneel: collapse23 once, heap loop started once");
        feed("bossRec", 2, false); feed("bossIdle", 2, false);
        for (int i = 0; i < 60; i++) feed("bossDruidRest", 2, false);   // the final death sequence also kneels: no collapse sound
        Check(c12 == 1 && c23 == 1 && other == 0 && hs == 1 && hp == 0, "life 2 death sequence: no extra collapse sound, heap keeps looping");
        feed("bossDruidRest", 2, true); feed(null, 0, true); feed(null, 0, true);
        Check(hs == 1 && hp == 1 && !tr.HeapOn, "boss gone (final kill / sink): heap stops exactly once");
        feed("bossDruidRest", -1, false);
        Check(c12 == 1 && c23 == 1, "unknown life gives no cue");
        // arena load / field restored / reset stop
        tr.Reset(); hs = hp = 0; feed("bossRec", 1, false); feed("bossDruidRest", 1, false);
        Check(hs == 1 && tr.HeapOn, "second fight: heap starts again");
        Check(tr.StopHeap() && !tr.HeapOn && !tr.StopHeap(), "StopHeap (arena load / field restored / reset) stops once, then no-op");

        // 4. call-site counts (each trigger exists exactly once at the intended place)
        string rt = Path.Combine(root, "Assets/Exoduser/Runtime");
        string flow = Path.Combine(rt, "NativeGame.StageFlow.cs");
        Check(Count(flow, @"PlayWire\(NativeSoundWire\.DruidIntro") == 1, "druid_intro: one BossIntro call site");
        Check(Count(flow, @"PlayWire\(NativeSoundWire\.ExitOpen") == 1, "exit_open: one ExitOpened call site");
        Check(Count(flow, @"PlayWire\(NativeSoundWire\.ExitEnter") == 1, "exit_enter: one StageCleared call site");
        Check(Count(flow, @"druidCues\?\.StopHeap") == 2, "heap stop on ArenaLoadStart and FieldRestored");
        Check(Count(Path.Combine(rt, "NativeFeedbackAudio.cs"), @"PlayWire\(NativeSoundWire\.DruidBossKill") == 1, "druid_boss_kill: one BossDeath call site");
        Check(Count(Path.Combine(rt, "NativeFeedbackAudio.cs"), @"SampleKey=NativeSoundWire\.DruidDeathSink") == 1, "druid_death_sink: PlaySinkHole key");
        Check(Count(Path.Combine(rt, "NativeAmbientSources.cs"), @"public void AddBioTree\(Vector3 world\)") == 1, "AddBioTree public");
        Check(Count(Path.Combine(rt, "NativeGameMusic.cs"), @"Audio/RM1/"" \+ NativeSoundWire\.AmbForestBed") == 1, "amb_forest_bed loaded from RM1 first");

        Console.WriteLine("sound-wire tests: " + pass + " passed, " + fail + " failed");
        return fail == 0 ? 0 : 1;
    }
}
