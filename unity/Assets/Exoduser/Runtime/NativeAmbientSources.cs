using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // RM-1 sound A8: 3D environment sources for the 1-1 toxic river (both sides, south -> north) and the non-walkable swamps.
    // The map owns the positions (map board T6: the map only gives positions, the sound lives here): AddRiver takes the river spline, AddSwamp each swamp object.
    // River = a looping amb_toxic_river source every 12 m along the spline; swamp = a toxic_bubble one-shot at a random 2-6 s interval.
    // Spatial rules (UNITY_RM1_SOUND_SLICE section 2): spatialBlend 1, logarithmic roll-off, min 4 m / max 30 m, output group Ambience.
    public sealed class NativeAmbientSources : IDisposable
    {
        public const float RiverSpacing = 12f, MinDistance = 4f, MaxDistance = 30f, CullDistance = 45f, RiverVolume = .15f, BubbleVolume = .3f;   // RM1_AUDIO_KEYS.json start volumes
        sealed class Swamp { public AudioSource source; public float timer; }
        readonly NativeAudioMixer bus; readonly Transform root; readonly AudioClip river, bubble;
        readonly List<AudioSource> riverSources = new List<AudioSource>(); readonly List<Swamp> swamps = new List<Swamp>();
        readonly System.Random rng = new System.Random(20261028);
        public Func<Vector3> ListenerAt;
        public int RiverCount { get { return riverSources.Count; } }
        public int SwampCount { get { return swamps.Count; } }
        public int BubblesPlayed;
        public NativeAmbientSources(Transform parent, NativeAudioMixer bus)
        {
            this.bus = bus; root = new GameObject("Environment audio").transform; root.SetParent(parent);
            river = Resources.Load<AudioClip>("Audio/RM1/amb_toxic_river"); bubble = Resources.Load<AudioClip>("Audio/RM1/toxic_bubble");
            if (river == null || bubble == null) throw new InvalidOperationException("Missing RM-1 environment samples amb_toxic_river / toxic_bubble");
            river.LoadAudioData(); bubble.LoadAudioData();
        }
        AudioSource Spatial(string name, Vector3 at, AudioClip clip, bool loop)
        {
            var go = new GameObject(name); go.transform.SetParent(root); go.transform.position = at;
            var s = go.AddComponent<AudioSource>(); s.clip = clip; s.loop = loop; s.playOnAwake = false; s.spatialBlend = 1; s.dopplerLevel = 0;
            s.rolloffMode = AudioRolloffMode.Logarithmic; s.minDistance = MinDistance; s.maxDistance = MaxDistance; s.outputAudioMixerGroup = bus.Group("Ambience");
            return s;
        }
        // loop sources every RiverSpacing metres along the polyline (points in Unity world metres), start and end included
        public int AddRiver(IList<Vector3> spline)
        {
            int added = 0; if (spline == null || spline.Count == 0) return 0;
            float carried = 0; var points = new List<Vector3> { spline[0] };
            for (int i = 1; i < spline.Count; i++)
            {
                var a = spline[i - 1]; var b = spline[i]; float len = Vector3.Distance(a, b); if (len <= 1e-4f) continue;
                float at = RiverSpacing - carried;
                while (at <= len) { points.Add(Vector3.Lerp(a, b, at / len)); at += RiverSpacing; }
                carried = len - (at - RiverSpacing);
            }
            if (Vector3.Distance(points[points.Count - 1], spline[spline.Count - 1]) > 1f) points.Add(spline[spline.Count - 1]);
            foreach (var p in points)
            {
                var s = Spatial("River loop", p, river, true); s.volume = RiverVolume; s.time = (float)rng.NextDouble() * river.length * .99f;   // desync neighbouring loops
                riverSources.Add(s); added++;
            }
            return added;
        }
        public void AddSwamp(Vector3 at)
        {
            var s = Spatial("Swamp bubble", at, bubble, false); s.volume = BubbleVolume;
            swamps.Add(new Swamp { source = s, timer = 2f + (float)rng.NextDouble() * 4f });
        }
        // ---- R8/R9 wiring: bio trees (pulse one-shot + breath loop) and the druid heap loop. Files RM1/bio_tree_pulse|bio_tree_breath|druid_heap.mp3 are optional: without them nothing sounds, the Receipt says so. ----
        sealed class BioTree { public AudioSource pulse, breath; public float timer; public bool breathLogged; }
        readonly List<BioTree> trees = new List<BioTree>();
        AudioClip treePulse, treeBreath, heapClip; bool wireLoaded; AudioSource heapSource;
        public Action<int, string, string, string, float, string> Log;   // Receipt line writer (NativeFeedbackAudio.AddLine)
        public Func<int> TickNow;
        public int BioTreeCount { get { return trees.Count; } }
        public int PulsesFired, HeapStarts, HeapStops;
        public bool HeapPlaying { get { return heapOn; } }
        bool heapOn;
        void LoadWire()
        {
            if (wireLoaded) return; wireLoaded = true;
            treePulse = Resources.Load<AudioClip>("Audio/RM1/" + NativeSoundWire.BioTreePulse); treeBreath = Resources.Load<AudioClip>("Audio/RM1/" + NativeSoundWire.BioTreeBreath); heapClip = Resources.Load<AudioClip>("Audio/RM1/" + NativeSoundWire.DruidHeap);
            if (treePulse != null) treePulse.LoadAudioData(); if (treeBreath != null) treeBreath.LoadAudioData(); if (heapClip != null) heapClip.LoadAudioData();
        }
        void Report(int tick, string key, string source, float volume, bool file, string extra)
        {
            if (Log != null) Log(tick, key, source, "Ambience", volume, file ? "file ok" + (extra ?? "") : NativeSoundWire.NoFileNote(key));
        }
        int NowTick() { return TickNow != null ? TickNow() : 0; }
        // a bio tree the map registers (Unity world metres): a 3D pulse every 3.5-4.5 s and a 3D breath loop, both only audible close by
        public void AddBioTree(Vector3 world)
        {
            LoadWire();
            var t = new BioTree { timer = NativeSoundWire.PulseInterval(rng.NextDouble()) };
            t.pulse = Spatial("Bio tree pulse", world, treePulse, false); t.pulse.volume = NativeSoundWire.VolTreePulse;
            t.breath = Spatial("Bio tree breath", world, treeBreath, true); t.breath.volume = NativeSoundWire.VolTreeBreath;
            if (treeBreath != null) t.breath.time = (float)rng.NextDouble() * treeBreath.length * .99f;
            trees.Add(t);
        }
        // collapse23 (life 2 ended): a looping heap at the spot where he knelt, until the final kill / sink / arena load / field restore / reset
        public void StartHeap(Vector3 world, int tick, string source)
        {
            if (heapOn) return; LoadWire(); heapOn = true; HeapStarts++;
            heapSource = Spatial("Druid heap loop", world, heapClip, true); heapSource.volume = NativeSoundWire.VolHeap * (bus != null ? bus.SfxGain : 1) * NativeScreenTransition.Gain;
            if (heapClip != null) heapSource.Play();
            Report(tick, NativeSoundWire.DruidHeap, source + " [loop start]", NativeSoundWire.VolHeap, heapClip != null, null);
        }
        public void StopHeap(int tick, string source)
        {
            if (!heapOn) return; heapOn = false; HeapStops++;
            if (heapSource != null) { heapSource.Stop(); UnityEngine.Object.Destroy(heapSource.gameObject); heapSource = null; }
            if (Log != null) Log(tick, NativeSoundWire.DruidHeap, source + " [loop stop]", "Ambience", NativeSoundWire.VolHeap, "stopped");
        }
        void TickWire(float dt, Vector3 listener, bool track)
        {
            float gain = bus.SfxGain * NativeScreenTransition.Gain;
            if (heapSource != null && heapClip != null) { heapSource.volume = NativeSoundWire.VolHeap * gain; if (!heapSource.isPlaying && heapOn) heapSource.Play(); }
            foreach (var t in trees)
            {
                bool near = !track || Vector3.Distance(t.pulse.transform.position, listener) <= CullDistance;
                t.breath.volume = NativeSoundWire.VolTreeBreath * gain; t.pulse.volume = NativeSoundWire.VolTreePulse * gain;
                if (treeBreath != null) { if (near && !t.breath.isPlaying) t.breath.Play(); else if (!near && t.breath.isPlaying) t.breath.Stop(); }
                if (near && !t.breathLogged) { t.breathLogged = true; Report(NowTick(), NativeSoundWire.BioTreeBreath, "bio tree loop start (near)", NativeSoundWire.VolTreeBreath, treeBreath != null, null); }
                t.timer -= dt; if (t.timer > 0) continue;
                t.timer = NativeSoundWire.PulseInterval(rng.NextDouble());   // 3.5-4.5 s
                if (!near) continue;
                PulsesFired++; Report(NowTick(), NativeSoundWire.BioTreePulse, "bio tree pulse (3.5-4.5 s timer)", NativeSoundWire.VolTreePulse, treePulse != null, null);
                if (treePulse != null) t.pulse.Play();
            }
        }
        public void Tick(float dt)
        {
            Vector3 listener = ListenerAt != null ? ListenerAt() : Vector3.zero; bool track = ListenerAt != null;
            TickWire(dt, listener, track);
            foreach (var s in riverSources)
            {
                bool near = !track || Vector3.Distance(s.transform.position, listener) <= CullDistance;   // far sources sleep: the voice budget belongs to what can be heard
                s.volume = RiverVolume * bus.SfxGain * NativeScreenTransition.Gain;   // outside the SFX group: follows the SFX setting like the web bus
                if (near && !s.isPlaying) s.Play(); else if (!near && s.isPlaying) s.Stop();
            }
            foreach (var w in swamps)
            {
                w.source.volume = BubbleVolume * bus.SfxGain * NativeScreenTransition.Gain;w.timer -= dt; if (w.timer > 0) continue;
                w.timer = 2f + (float)rng.NextDouble() * 4f;   // 2-6 s
                if (track && Vector3.Distance(w.source.transform.position, listener) > CullDistance) continue;
                w.source.pitch = .9f + (float)rng.NextDouble() * .2f; w.source.volume = BubbleVolume * bus.SfxGain * NativeScreenTransition.Gain; w.source.Play(); BubblesPlayed++;
            }
        }
        public void Clear()
        {
            foreach (var s in riverSources) if (s != null) UnityEngine.Object.Destroy(s.gameObject);
            foreach (var w in swamps) if (w.source != null) UnityEngine.Object.Destroy(w.source.gameObject);
            riverSources.Clear(); swamps.Clear();
            foreach (var t in trees) { if (t.pulse != null) UnityEngine.Object.Destroy(t.pulse.gameObject); if (t.breath != null) UnityEngine.Object.Destroy(t.breath.gameObject); }
            trees.Clear(); StopHeap(NowTick(), "Clear");
        }
        public void Dispose() { Clear(); if (root != null) UnityEngine.Object.Destroy(root.gameObject); }
    }
}
