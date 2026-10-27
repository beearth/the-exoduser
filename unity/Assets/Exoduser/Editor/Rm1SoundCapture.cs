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
    //   -executeMethod Exoduser.UnityPort.Editor.Rm1SoundCapture.RunR2|RunDruid -timeline <timeline.json> -output <prefix>   (no -quit: the replay exits the editor)
    // writes <prefix>.wav, <prefix>.receipt.txt. Gaps between events longer than 3 s are shortened to 3 s (stated in the receipt); frames in the receipt are the Core's own ticks.
    public static class Rm1SoundCapture
    {
        const string KScenario = "rm1.scenario", KTimeline = "rm1.timeline", KOutput = "rm1.output";
        static string Arg(string name) { var a = Environment.GetCommandLineArgs(); for (int i = 0; i < a.Length - 1; i++) if (a[i] == name) return a[i + 1]; return ""; }
        public static void RunR2() { Start("R2 ordinary fight"); }
        public static void RunDruid() { Start("1-1 druid fight"); }
        static void Start(string scenario)
        {
            SessionState.SetString(KScenario, scenario); SessionState.SetString(KTimeline, Arg("-timeline")); SessionState.SetString(KOutput, Arg("-output"));
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
                    r.Scenario = SessionState.GetString(KScenario, ""); r.Timeline = SessionState.GetString(KTimeline, ""); r.Output = SessionState.GetString(KOutput, "");
                    SessionState.SetString(KScenario, "");
                }
            };
        }
    }

    [Serializable] public sealed class Rm1Row { public int tick; public string type, kind, key, source; public float x, y, volume, rate, size; public int etype; public bool boss; }
    [Serializable] public sealed class Rm1Doc { public string scenario; public Rm1Row[] rows; }

    public sealed class Rm1SoundReplay : MonoBehaviour
    {
        public string Scenario, Timeline, Output;
        const int Fps = 60, MaxGapFrames = 180, LeadFrames = 120, TailFrames = 240;
        NativeFeedbackAudio sound; NativeGameMusic music; NativeAmbientSources ambient;
        Rm1Row[] rows; int[] playFrame; int next, frame, endFrame, channels;
        Vector3 player = Vector3.zero; bool inArena, bossAlive = true, started;
        readonly List<float> pcm = new List<float>(); readonly List<string> musicLog = new List<string>(); int lastTick;
        string lastMusic = ""; int annotated;

        void Start()
        {
            try { Setup(); }
            catch (Exception e) { Debug.LogError("[RM1 SOUND] setup failed: " + e); File.WriteAllText(Output + ".receipt.txt", "SETUP FAILED\n" + e); EditorApplication.Exit(2); }
        }
        void Setup()
        {
            var doc = JsonUtility.FromJson<Rm1Doc>(File.ReadAllText(Timeline)); rows = doc.rows.OrderBy(r => r.tick).ToArray();
            playFrame = new int[rows.Length]; int f = LeadFrames, prev = rows[0].tick;
            for (int i = 0; i < rows.Length; i++) { f += Math.Min(rows[i].tick - prev, MaxGapFrames); prev = rows[i].tick; playFrame[i] = f; }
            endFrame = f + TailFrames;
            var cam = new GameObject("Camera").AddComponent<Camera>();
            sound = new NativeFeedbackAudio(transform, cam);
            music = new NativeGameMusic(transform, sound.Bus); ambient = new NativeAmbientSources(transform, sound.Bus);
            sound.SetVolumePercent(60); music.SetPercents(60, 60);
            sound.ListenerAt = ambient.ListenerAt = () => player;
            sound.OnScreen = w => Vector3.Distance(w, player) < 14f;   // about half a 1920x1080 screen of world
            // A8 positions come from the map RM-1 scene (not on unity/main yet): a test river along the west edge and three swamps
            var river = new List<Vector3>(); for (int k = 0; k <= 6; k++) river.Add(new Vector3(-14, -30 + k * 10, 0));
            ambient.AddRiver(river); ambient.AddSwamp(new Vector3(8, 6, 0)); ambient.AddSwamp(new Vector3(-6, -8, 0)); ambient.AddSwamp(new Vector3(10, -12, 0));
            channels = AudioSettings.speakerMode == AudioSpeakerMode.Mono ? 1 : 2;
            Time.captureDeltaTime = 1f / Fps; AudioRenderer.Start(); started = true;
            Debug.Log("[RM1 SOUND] " + Scenario + ": " + rows.Length + " rows, " + endFrame + " frames, channels " + channels + ", " + AudioSettings.outputSampleRate + " Hz");
        }

        void Update()
        {
            if (!started) return;
            sound.CurrentTick = lastTick;
            while (next < rows.Length && playFrame[next] <= frame) { Feed(rows[next]); next++; }
            sound.Flush();
            for (int i = annotated; i < sound.Lines.Count; i++) sound.Lines[i] += " rec=" + (frame / (float)Fps).ToString("0.00", System.Globalization.CultureInfo.InvariantCulture) + "s";   // position in the recording
            annotated = sound.Lines.Count;
            string want = inArena ? (bossAlive ? "boss" : "victory") : "hell1";
            if (want != lastMusic) { musicLog.Add("MUSIC frame=" + lastTick + " rec=" + (frame / (float)Fps).ToString("0.00", System.Globalization.CultureInfo.InvariantCulture) + "s key=" + want + " mixer snapshot=" + (want == "boss" ? "Boss (Ambience -8 dB)" : "Explore")); lastMusic = want; }
            music.Sync(want); music.Tick(1f / Fps); ambient.Tick(1f / Fps);
            int n = AudioRenderer.GetSampleCountForCaptureFrame();
            using (var buf = new NativeArray<float>(n * channels, Allocator.Temp)) { if (AudioRenderer.Render(buf)) for (int i = 0; i < buf.Length; i++) pcm.Add(buf[i]); }
            frame++;
            if (frame >= endFrame) Finish();
        }

        void Feed(Rm1Row r)
        {
            lastTick = r.tick;
            if (r.type == "stage")
            {
                if (r.kind == "ArenaEntered") { inArena = true; bossAlive = true; }
                else if (r.kind == "BossIntro") NativeBossSounds.Howl(sound, r.x, r.y);
                else if (r.kind == "BossDefeated") bossAlive = false;
                return;
            }
            FeedbackKind kind; if (!Enum.TryParse(r.kind, out kind)) return;
            if (r.key == "player_hit1" || r.key == "player_hit2" || r.key == "player_hit3" || r.key == "player_hit4" || kind == FeedbackKind.Roll) player = new Vector3(r.x / 100, -r.y / 100, 0);
            var e = new FeedbackEvent { Kind = kind, Tick = r.tick, X = r.x, Y = r.y, SampleKey = r.key, Source = string.IsNullOrEmpty(r.source) ? null : r.source, Volume = r.volume, Rate = r.rate, QueuedRate = r.rate, Size = r.size, Etype = r.etype, IsBoss = r.boss };
            sound.Handle(e);
        }

        void Finish()
        {
            started = false; AudioRenderer.Stop(); Time.captureDeltaTime = 0;
            WriteWav(Output + ".wav"); WriteReceipt(Output + ".receipt.txt");
            Debug.Log("[RM1 SOUND] done: " + pcm.Count / channels / (float)AudioSettings.outputSampleRate + " s");
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
            sb.AppendLine("RM-1 sound Receipt -- " + Scenario + " (timeline " + Path.GetFileName(Timeline) + ", real Simulation 60 ticks/s)");
            sb.AppendLine("frame = the Core's own tick. Gaps between events longer than 3 s were shortened to 3 s in the recording; the receipt keeps the original ticks.");
            sb.AppendLine("Fixture: A8 river (loop sources every 12 m along x=-14 m) and 3 swamps are test positions (the map RM-1 scene is not on unity/main yet).");
            sb.AppendLine();
            foreach (var m in musicLog) sb.AppendLine(m);
            sb.AppendLine();
            foreach (var l in sound.Lines) sb.AppendLine(l);
            sb.AppendLine();
            // checks the judge asked for
            var played = sound.Lines.Where(l => !l.Contains("DROPPED")).ToList();
            int overlaps = 0;
            foreach (var g in played.Where(l => l.Contains("key=tell_")).GroupBy(l => Field(l, "key=")))
            {
                int last = -1000; foreach (var l in g.OrderBy(l => int.Parse(Field(l, "frame=")))) { int t = int.Parse(Field(l, "frame=")); if (t - last < 8) overlaps++; last = t; }
            }
            sb.AppendLine("SUMMARY lines=" + sound.Lines.Count + " played=" + played.Count + " dropped(adapter)=" + sound.Receipt.dropped + " same-key tell overlaps<120ms=" + overlaps);
            foreach (var g in played.GroupBy(l => Field(l, "key=")).OrderBy(g => g.Key)) sb.AppendLine("  " + g.Key + " x" + g.Count() + " groups=" + string.Join("/", g.Select(l => Field(l, "group=")).Distinct()));
            sb.AppendLine("  no-file keys: " + string.Join(", ", sound.Lines.Where(l => l.Contains("no file yet")).Select(l => Field(l, "key=")).Distinct()));
            sb.AppendLine("  temporary-file keys: " + string.Join(", ", sound.Lines.Where(l => l.Contains("temporary file")).Select(l => Field(l, "key=")).Distinct()));
            sb.AppendLine("  A8 river sources=" + ambient.RiverCount + " swamps=" + ambient.SwampCount + " bubbles played=" + ambient.BubblesPlayed);
            sb.AppendLine("  BGM switches: " + string.Join(" -> ", music.Log));
            File.WriteAllText(path, sb.ToString());
        }
        static string Field(string line, string name) { int i = line.IndexOf(name, StringComparison.Ordinal); if (i < 0) return ""; i += name.Length; int j = line.IndexOf(' ', i); return j < 0 ? line.Substring(i) : line.Substring(i, j - i); }
    }
}
