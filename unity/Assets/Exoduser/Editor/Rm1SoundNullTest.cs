using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Unity.Collections;
using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort.Editor
{
    // RM-1 sound pipeline check: plays single keys through the real adapter + Exoduser.mixer with 1 s of silence before and after, records the mixer output with AudioRenderer
    // and writes the decoded original next to it so a script can run a null test (recorded - gain * original) and look for a second copy.
    //   -executeMethod Exoduser.UnityPort.Editor.Rm1SoundNullTest.Run -keys tell_grab,tell_boss,... -output <dir>
    public static class Rm1SoundNullTest
    {
        public static void Run()
        {
            var a = Environment.GetCommandLineArgs(); string keys = "", output = "";
            for (int i = 0; i < a.Length - 1; i++) { if (a[i] == "-keys") keys = a[i + 1]; if (a[i] == "-output") output = a[i + 1]; }
            SessionState.SetString("rm1.null.keys", keys); SessionState.SetString("rm1.null.out", output);
            EditorApplication.EnterPlaymode();
        }
        [InitializeOnLoadMethod]
        static void Hook()
        {
            EditorApplication.playModeStateChanged += state =>
            {
                if (state == PlayModeStateChange.EnteredPlayMode && !string.IsNullOrEmpty(SessionState.GetString("rm1.null.keys", "")))
                {
                    var go = new GameObject("Rm1NullTest"); var t = go.AddComponent<Rm1NullTestRunner>();
                    t.Keys = SessionState.GetString("rm1.null.keys", "").Split(','); t.Output = SessionState.GetString("rm1.null.out", "");
                    SessionState.SetString("rm1.null.keys", "");
                }
            };
        }
    }

    public sealed class Rm1NullTestRunner : MonoBehaviour
    {
        public string[] Keys; public string Output;
        const int Fps = 60;
        NativeFeedbackAudio sound; Camera cam; int keyIndex, frame, playFrame, endFrame, channels; bool started;
        readonly List<float> pcm = new List<float>(); AudioClip clip;

        void Start()
        {
            try
            {
                Directory.CreateDirectory(Output); cam = new GameObject("Camera").AddComponent<Camera>();
                channels = AudioSettings.speakerMode == AudioSpeakerMode.Mono ? 1 : 2;
                Time.captureDeltaTime = 1f / Fps; AudioRenderer.Start(); started = true; Begin(0);
            }
            catch (Exception e) { Debug.LogError("[RM1 NULL] " + e); EditorApplication.Exit(2); }
        }

        void Begin(int index)
        {
            keyIndex = index; if (sound != null) sound.Dispose();
            sound = new NativeFeedbackAudio(transform, cam); sound.ListenerAt = () => Vector3.zero;
            var mixer = sound.Bus.Mixer; mixer.ClearFloat("TellVol"); mixer.ClearFloat("SfxCompThreshold"); mixer.ClearFloat("MasterCompThreshold");
            sound.SetVolumePercent(100); mixer.SetFloat("SfxCompThreshold", 0f); mixer.SetFloat("MasterCompThreshold", 0f);
            string key = Keys[index]; clip = sound.Clip(key);
            pcm.Clear(); frame = 0; playFrame = Fps; endFrame = Fps + Mathf.CeilToInt(clip.length * Fps) + Fps * 2;
            Debug.Log("[RM1 NULL] " + key + " clip " + clip.length + " s, " + clip.channels + " ch, " + clip.frequency + " Hz");
        }

        void Update()
        {
            if (!started) return;
            if (frame == playFrame) sound.PlayNow(Keys[keyIndex], 1f, 1f, Vector3.zero);
            sound.Flush();
            int n = AudioRenderer.GetSampleCountForCaptureFrame();
            using (var buf = new NativeArray<float>(n * channels, Allocator.Temp)) { if (AudioRenderer.Render(buf)) for (int i = 0; i < buf.Length; i++) pcm.Add(buf[i]); }
            frame++;
            if (frame >= endFrame) { Save(); if (keyIndex + 1 < Keys.Length) Begin(keyIndex + 1); else { started = false; AudioRenderer.Stop(); EditorApplication.Exit(0); } }
        }

        void Save()
        {
            string key = Keys[keyIndex];
            Wav(Path.Combine(Output, key + "-rec.wav"), pcm.ToArray(), channels, AudioSettings.outputSampleRate);
            var data = new float[clip.samples * clip.channels]; clip.GetData(data, 0);
            Wav(Path.Combine(Output, key + "-ref.wav"), data, clip.channels, clip.frequency);
            File.WriteAllText(Path.Combine(Output, key + ".txt"), "playFrame=" + playFrame + " fps=" + Fps + " clipLength=" + clip.length + " clipChannels=" + clip.channels + " clipHz=" + clip.frequency + " outHz=" + AudioSettings.outputSampleRate + "\n");
        }

        static void Wav(string path, float[] samples, int channels, int rate)
        {
            var bytes = new byte[samples.Length * 2];
            for (int i = 0; i < samples.Length; i++) { short v = (short)Mathf.Clamp(Mathf.RoundToInt(samples[i] * 32767f), -32768, 32767); bytes[i * 2] = (byte)(v & 255); bytes[i * 2 + 1] = (byte)(v >> 8); }
            using (var w = new BinaryWriter(File.Create(path)))
            {
                w.Write(Encoding.ASCII.GetBytes("RIFF")); w.Write(36 + bytes.Length); w.Write(Encoding.ASCII.GetBytes("WAVEfmt ")); w.Write(16); w.Write((short)1); w.Write((short)channels);
                w.Write(rate); w.Write(rate * channels * 2); w.Write((short)(channels * 2)); w.Write((short)16); w.Write(Encoding.ASCII.GetBytes("data")); w.Write(bytes.Length); w.Write(bytes);
            }
        }
    }
}
