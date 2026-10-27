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
        public void Tick(float dt)
        {
            Vector3 listener = ListenerAt != null ? ListenerAt() : Vector3.zero; bool track = ListenerAt != null;
            foreach (var s in riverSources)
            {
                bool near = !track || Vector3.Distance(s.transform.position, listener) <= CullDistance;   // far sources sleep: the voice budget belongs to what can be heard
                s.volume = RiverVolume * bus.SfxGain;   // outside the SFX group: follows the SFX setting like the web bus
                if (near && !s.isPlaying) s.Play(); else if (!near && s.isPlaying) s.Stop();
            }
            foreach (var w in swamps)
            {
                w.timer -= dt; if (w.timer > 0) continue;
                w.timer = 2f + (float)rng.NextDouble() * 4f;   // 2-6 s
                if (track && Vector3.Distance(w.source.transform.position, listener) > CullDistance) continue;
                w.source.pitch = .9f + (float)rng.NextDouble() * .2f; w.source.volume = BubbleVolume * bus.SfxGain; w.source.Play(); BubblesPlayed++;
            }
        }
        public void Clear()
        {
            foreach (var s in riverSources) if (s != null) UnityEngine.Object.Destroy(s.gameObject);
            foreach (var w in swamps) if (w.source != null) UnityEngine.Object.Destroy(w.source.gameObject);
            riverSources.Clear(); swamps.Clear();
        }
        public void Dispose() { Clear(); if (root != null) UnityEngine.Object.Destroy(root.gameObject); }
    }
}
