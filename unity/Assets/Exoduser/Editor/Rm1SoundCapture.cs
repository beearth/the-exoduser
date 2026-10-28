using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Unity.Collections;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Editor
{
    // RM-1 sound track A submission: replays the sound timeline the real Simulation produced (Tools/rm1-sound-timeline) through the real audio adapter
    // (NativeFeedbackAudio + NativeGameMusic + NativeAmbientSources + Exoduser.mixer) in play mode and records the mixed output with AudioRenderer (no audio device needed).
    //   -executeMethod Exoduser.UnityPort.Editor.Rm1SoundCapture.RunR2|RunDruid -timeline <timeline.json> -output <prefix> [-passes "name:key=val;key=val|name2:..."]   (no -quit: the replay exits the editor)
    // writes <prefix>[-<pass>].wav and .receipt.txt. Gaps between events longer than 3 s are shortened to 3 s (stated in the receipt); frames in the receipt are the Core's own ticks.
    // pass keys (measurement): solo=Music,Ambience,EnemyHit,SFX (everything else muted; Tell sources stay un-muted so the ducking sidechain lives) | snap=Boss|Explore (mixer snapshot forced)
    //   | music=hell1|boss (BGM forced) | notell=1 (tell events are not fed) | comp=off (SFX compressor threshold 0 dB) | tellvol=off (Tell fader -80 dB; its pre-fader sends still duck)
    public static class Rm1SoundCapture
    {
        const string KScenario = "rm1.scenario", KTimeline = "rm1.timeline", KOutput = "rm1.output", KPasses = "rm1.passes";
        static string Arg(string name) { var a = Environment.GetCommandLineArgs(); for (int i = 0; i < a.Length - 1; i++) if (a[i] == name) return a[i + 1]; return ""; }
        public static void RunR2() { Start("R2 ordinary fight"); }
        public static void RunDruid() { Start("1-1 druid fight"); }
        static void Start(string scenario)
        {
            SessionState.SetString(KScenario, scenario); SessionState.SetString(KTimeline, Arg("-timeline")); SessionState.SetString(KOutput, Arg("-output")); SessionState.SetString(KPasses, Arg("-passes"));
            EditorApplication.EnterPlaymode();
        }
        [InitializeOnLoadMethod]
        static void Hook()
        {
            EditorApplication.playModeStateChanged += state =>
            {
                if (state == PlayModeStateChange.EnteredPlayMode && !string.IsNullOrEmpty(SessionState.GetString(KScenario, "")))
                {
                    var go = new GameObject("Rm1SoundReplay"); var r = go.AddComponent<Rm1SoundReplay>();
                    r.Scenario = SessionState.GetString(KScenario, ""); r.Timeline = SessionState.GetString(KTimeline, ""); r.Output = SessionState.GetString(KOutput, ""); r.Passes = SessionState.GetString(KPasses, "");
                    SessionState.SetString(KScenario, "");
                }
            };
        }
    }

    [Serializable] public sealed class Rm1Row { public int tick; public string type, kind, key, source; public float x, y, volume, rate, size; public int etype, step; public bool boss; }
    [Serializable] public sealed class Rm1Doc { public string scenario; public Rm1Row[] rows; }

    public sealed class Rm1SoundReplay : MonoBehaviour
    {
        public string Scenario, Timeline, Output, Passes;
        const int Fps = 60, MaxGapFrames = 180, LeadFrames = 120, TailFrames = 240;
        sealed class Pass { public string name = ""; public Dictionary<string, string> cfg = new Dictionary<string, string>(); }
        readonly List<Pass> passes = new List<Pass>(); int passIndex; Pass pass;
        NativeFeedbackAudio sound; NativeGameMusic music; NativeAmbientSources ambient; Camera cam;
        Rm1Row[] rows; int[] playFrame; int next, frame, endFrame, channels;
        Vector3 player = Vector3.zero; bool inArena, bossAlive = true, started;
        readonly List<float> pcm = new List<float>(); readonly List<string> musicLog = new List<string>(); int lastTick;
        string lastMusic = ""; int annotated; HashSet<string> solo; readonly List<string> parryNotes = new List<string>();

        void Start()
        {
            try
            {
                var doc = JsonUtility.FromJson<Rm1Doc>(File.ReadAllText(Timeline)); rows = SinkOnDrawing(doc.rows).OrderBy(r => r.tick).ToArray();
                playFrame = new int[rows.Length]; int f = LeadFrames, prev = rows[0].tick;
                for (int i = 0; i < rows.Length; i++) { f += Math.Min(rows[i].tick - prev, MaxGapFrames); prev = rows[i].tick; playFrame[i] = f; }
                endFrame = f + TailFrames;
                foreach (var spec in (string.IsNullOrEmpty(Passes) ? "" : Passes).Split(new[] { '|' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var p = new Pass(); var parts = spec.Split(new[] { ':' }, 2); p.name = parts[0];
                    if (parts.Length > 1) foreach (var kv in parts[1].Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries)) { var q = kv.Split('='); p.cfg[q[0]] = q.Length > 1 ? q[1] : "1"; }
                    passes.Add(p);
                }
                if (passes.Count == 0) passes.Add(new Pass());
                cam = new GameObject("Camera").AddComponent<Camera>();
                channels = AudioSettings.speakerMode == AudioSpeakerMode.Mono ? 1 : 2;
                BeginPass(0);
            }
            catch (Exception e) { Debug.LogError("[RM1 SOUND] setup failed: " + e); File.WriteAllText(Output + ".receipt.txt", "SETUP FAILED\n" + e); EditorApplication.Exit(2); }
        }

        string Cfg(string key) { string v; return pass.cfg.TryGetValue(key, out v) ? v : ""; }

        void BeginPass(int index)
        {
            passIndex = index; pass = passes[index];
            if (sound != null) { sound.Dispose(); music.Dispose(); ambient.Dispose(); }
            pcm.Clear(); musicLog.Clear(); parryNotes.Clear(); frame = 0; next = 0; annotated = 0; lastMusic = ""; inArena = false; bossAlive = true; player = Vector3.zero; lastTick = 0;
            sound = new NativeFeedbackAudio(transform, cam);
            music = new NativeGameMusic(transform, sound.Bus); ambient = new NativeAmbientSources(transform, sound.Bus);
            var mixer = sound.Bus.Mixer; mixer.ClearFloat("TellVol"); mixer.ClearFloat("SfxCompThreshold"); mixer.ClearFloat("MasterCompThreshold");
            sound.SetVolumePercent(60); music.SetPercents(60, 60);
            if (Cfg("comp") == "off") { mixer.SetFloat("SfxCompThreshold", 0f); mixer.SetFloat("MasterCompThreshold", 0f); }
            if (Cfg("tellvol") == "off") mixer.SetFloat("TellVol", -80f);
            solo = null;
            if (!string.IsNullOrEmpty(Cfg("solo")))
            {
                solo = new HashSet<string>(Cfg("solo").Split(','));
                if (solo.Contains("SFX")) foreach (var g in NativeAudioMixer.SfxGroups) solo.Add(g);
            }
            sound.ListenerAt = ambient.ListenerAt = () => player;
            sound.OnScreen = w => Vector3.Distance(w, player) < 14f;   // about half a 1920x1080 screen of world
            // A8 positions come from the map RM-1 scene (not on unity/main yet): a test river along the west edge and three swamps
            var river = new List<Vector3>(); for (int k = 0; k <= 6; k++) river.Add(new Vector3(-14, -30 + k * 10, 0));
            ambient.AddRiver(river); ambient.AddSwamp(new Vector3(8, 6, 0)); ambient.AddSwamp(new Vector3(-6, -8, 0)); ambient.AddSwamp(new Vector3(10, -12, 0));
            if (!started) { Time.captureDeltaTime = 1f / Fps; AudioRenderer.Start(); }
            started = true;
            Debug.Log("[RM1 SOUND] " + Scenario + " pass '" + pass.name + "': " + rows.Length + " rows, " + endFrame + " frames, " + AudioSettings.outputSampleRate + " Hz, cfg " + string.Join(";", pass.cfg.Select(kv => kv.Key + "=" + kv.Value)));
        }

        void Update()
        {
            if (!started) return;
            sound.CurrentTick = lastTick;
            while (next < rows.Length && playFrame[next] <= frame) { Feed(rows[next]); next++; }
            sound.Flush();
            for (int i = annotated; i < sound.Lines.Count; i++) sound.Lines[i] += " rec=" + (frame / (float)Fps).ToString("0.00", System.Globalization.CultureInfo.InvariantCulture) + "s";   // position in the recording
            annotated = sound.Lines.Count;
            string want = Cfg("music") != "" ? Cfg("music") : (inArena ? (bossAlive ? "boss" : "victory") : "hell1");
            if (want != lastMusic) { musicLog.Add("MUSIC frame=" + lastTick + " rec=" + (frame / (float)Fps).ToString("0.00", System.Globalization.CultureInfo.InvariantCulture) + "s key=" + want + " mixer snapshot=" + (want == "boss" ? "Boss (Ambience -8 dB)" : "Explore")); lastMusic = want; }
            music.Sync(want); music.Tick(1f / Fps); ambient.Tick(1f / Fps);
            if (Cfg("snap") != "") sound.Bus.Snapshot(Cfg("snap") == "Boss", 0f);
            if (solo != null)
                foreach (var s in FindObjectsByType<AudioSource>(FindObjectsSortMode.None))
                {
                    string g = s.outputAudioMixerGroup != null ? s.outputAudioMixerGroup.name : "";
                    s.mute = !(solo.Contains(g) || g == "Tell");   // Tell sources keep running: the pre-fader sends of the Tell group are the ducking sidechain
                }
            int n = AudioRenderer.GetSampleCountForCaptureFrame();
            using (var buf = new NativeArray<float>(n * channels, Allocator.Temp)) { if (AudioRenderer.Render(buf)) for (int i = 0; i < buf.Length; i++) pcm.Add(buf[i]); }
            frame++;
            if (frame >= endFrame) EndPass();
        }

        // the game plays the druid sink sound from the sink drawing (NativeGame.SinkHoleTick ticks after the kill); the replay puts it at the same offset
        static Rm1Row[] SinkOnDrawing(Rm1Row[] all)
        {
            var death = all.FirstOrDefault(r => r.type == "feedback" && r.kind == "BossDeath");
            if (death == null || !all.Any(r => r.key == "druid_sink")) return all;
            var list = all.Where(r => r.key != "druid_sink").ToList();
            list.Add(new Rm1Row { tick = death.tick + NativeGame.SinkHoleTick, type = "feedback", kind = "Sample", key = "druid_sink", source = NativeFeedbackAudio.SinkViewSource, x = death.x, y = death.y, rate = 1 });
            return list.ToArray();
        }

        void Feed(Rm1Row r)
        {
            lastTick = r.tick;
            if (r.type == "note") { parryNotes.Add("PARRY frame=" + r.tick + " rec=" + (frame / (float)Fps).ToString("0.00", System.Globalization.CultureInfo.InvariantCulture) + "s " + r.source + " (the Core queues a Parry feedback event for it: see the q_parry / sword_parry / sword_back / voice lines at this frame)"); return; }
            if (r.type == "stage")
            {
                if (r.kind == "ArenaEntered") { inArena = true; bossAlive = true; }
                else if (r.kind == "BossIntro") NativeBossSounds.Howl(sound, r.x, r.y);
                else if (r.kind == "BossDefeated") bossAlive = false;
                return;
            }
            if (Cfg("notell") == "1" && r.key != null && r.key.StartsWith("tell_", StringComparison.Ordinal)) return;
            FeedbackKind kind; if (!Enum.TryParse(r.kind, out kind)) return;
            if (r.key == "player_hit1" || r.key == "player_hit2" || r.key == "player_hit3" || r.key == "player_hit4" || kind == FeedbackKind.Roll) player = new Vector3(r.x / 100, -r.y / 100, 0);
            var e = new FeedbackEvent { Kind = kind, Tick = r.tick, X = r.x, Y = r.y, SampleKey = r.key, Source = string.IsNullOrEmpty(r.source) ? null : r.source, Volume = r.volume, Rate = r.rate, QueuedRate = r.rate, Size = r.size, Etype = r.etype, Step = r.step, IsBoss = r.boss };
            sound.Handle(e);
        }

        void EndPass()
        {
            string prefix = pass.name.Length > 0 ? Output + "-" + pass.name : Output;
            WriteWav(prefix + ".wav"); WriteReceipt(prefix + ".receipt.txt");
            Debug.Log("[RM1 SOUND] pass '" + pass.name + "' done: " + pcm.Count / channels / (float)AudioSettings.outputSampleRate + " s");
            if (passIndex + 1 < passes.Count) { BeginPass(passIndex + 1); return; }
            started = false; AudioRenderer.Stop(); Time.captureDeltaTime = 0;
            EditorApplication.Exit(0);
        }

        void WriteWav(string path)
        {
            int rate = AudioSettings.outputSampleRate; var bytes = new byte[pcm.Count * 2];
            for (int i = 0; i < pcm.Count; i++) { short v = (short)Mathf.Clamp(Mathf.RoundToInt(pcm[i] * 32767f), -32768, 32767); bytes[i * 2] = (byte)(v & 255); bytes[i * 2 + 1] = (byte)(v >> 8); }
            using (var w = new BinaryWriter(File.Create(path)))
            {
                w.Write(Encoding.ASCII.GetBytes("RIFF")); w.Write(36 + bytes.Length); w.Write(Encoding.ASCII.GetBytes("WAVEfmt ")); w.Write(16); w.Write((short)1); w.Write((short)channels);
                w.Write(rate); w.Write(rate * channels * 2); w.Write((short)(channels * 2)); w.Write((short)16); w.Write(Encoding.ASCII.GetBytes("data")); w.Write(bytes.Length); w.Write(bytes);
            }
        }

        void WriteReceipt(string path)
        {
            var sb = new StringBuilder();
            sb.AppendLine("RM-1 sound Receipt -- " + Scenario + " (timeline " + Path.GetFileName(Timeline) + ", real Simulation 60 ticks/s)" + (pass.name.Length > 0 ? " pass " + pass.name + " [" + string.Join(";", pass.cfg.Select(kv => kv.Key + "=" + kv.Value)) + "]" : ""));
            sb.AppendLine("frame = the Core's own tick. Gaps between events longer than 3 s were shortened to 3 s in the recording; the receipt keeps the original ticks.");
            sb.AppendLine("Fixture: A8 river (loop sources every 12 m along x=-14 m) and 3 swamps are test positions (the map RM-1 scene is not on unity/main yet).");
            sb.AppendLine();
            foreach (var m in musicLog) sb.AppendLine(m);
            sb.AppendLine();
            foreach (var l in sound.Lines) sb.AppendLine(l);
            foreach (var n in parryNotes) sb.AppendLine(n);
            sb.AppendLine();
            // checks the judge asked for
            var played = sound.Lines.Where(l => !l.Contains("DROPPED")).ToList();
            int overlaps = 0;
            foreach (var g in played.Where(l => l.Contains("key=tell_")).GroupBy(l => Field(l, "key=")))
            {
                int last = -1000; foreach (var l in g.OrderBy(l => int.Parse(Field(l, "frame=")))) { int t = int.Parse(Field(l, "frame=")); if (t - last < 8) overlaps++; last = t; }
            }
            int skewed = played.GroupBy(l => Field(l, "frame=")).Count(g => g.Select(l => Field(l, "rec=")).Distinct().Count() > 1);
            sb.AppendLine("TIME AXIS CHECK: Core frames whose sounds start at different rec times = " + skewed + " (0 = every sound of one Core frame sits on the same recording time)");
            sb.AppendLine("SUMMARY lines=" + sound.Lines.Count + " played=" + played.Count + " dropped(adapter)=" + sound.Receipt.dropped + " same-key tell overlaps<120ms=" + overlaps);
            foreach (var g in played.GroupBy(l => Field(l, "key=")).OrderBy(g => g.Key)) sb.AppendLine("  " + g.Key + " x" + g.Count() + " groups=" + string.Join("/", g.Select(l => Field(l, "group=")).Distinct()));
            sb.AppendLine("  parry successes in the fight: " + parryNotes.Count + " (parry sound lines in this receipt: " + sound.Lines.Count(l => l.Contains("from=\"Core Parry\"")) + ")");
            sb.AppendLine("  per-key counts (played): " + string.Join(", ", played.GroupBy(l => Field(l, "key=")).OrderBy(g => g.Key).Select(g => g.Key + " x" + g.Count())));
            sb.AppendLine("  no-file keys: " + string.Join(", ", sound.Lines.Where(l => l.Contains("no file yet")).Select(l => Field(l, "key=")).Distinct()));
            sb.AppendLine("  temporary-file keys: " + string.Join(", ", sound.Lines.Where(l => l.Contains("temporary file")).Select(l => Field(l, "key=")).Distinct()));
            var seeker = rows.Count(r => r.source != null && r.source.Contains("seekerMines"));
            sb.AppendLine("  move 11 (seekerMines, spore pods) telegraphs in this timeline: " + (seeker > 0 ? seeker.ToString() : "0 (unused in this fight)"));
            sb.AppendLine("  A8 river sources=" + ambient.RiverCount + " swamps=" + ambient.SwampCount + " bubbles played=" + ambient.BubblesPlayed);
            sb.AppendLine("  BGM switches: " + string.Join(" -> ", music.Log));
            File.WriteAllText(path, sb.ToString());
        }
        static string Field(string line, string name) { int i = line.IndexOf(name, StringComparison.Ordinal); if (i < 0) return ""; i += name.Length; int j = line.IndexOf(' ', i); return j < 0 ? line.Substring(i) : line.Substring(i, j - i); }
    }
}
