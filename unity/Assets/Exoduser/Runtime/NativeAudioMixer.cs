using System;
using UnityEngine;
using UnityEngine.Audio;

namespace Exoduser.UnityPort
{
    // RM-1 sound track A: the Exoduser.mixer routing (Editor/Rm1SoundSetup.cs builds the asset).
    //   Master > Music | Ambience | SFX;  SFX > Tell | PlayerHit | Skill | Voice | EnemyHit | Death | Step | UI
    // Exposed parameters SfxVol / MusicVol (dB) carry the settings percentages. Snapshots Explore / Boss (Boss: Ambience -8 dB).
    // The Tell group sends to a Duck Volume on EnemyHit and Ambience (-4 dB, attack 10 ms, release 250 ms) so a telegraph is never buried in a melee.
    public sealed class NativeAudioMixer
    {
        public const string ResourcePath = "Audio/Exoduser";
        public static readonly string[] SfxGroups = { "Tell", "PlayerHit", "Skill", "Voice", "EnemyHit", "Death", "Step", "UI" };
        public readonly AudioMixer Mixer;
        public float SfxGain = .6f;   // OPT.sfxVol / 100, for sources that sit outside the SFX group (Ambience)
        readonly AudioMixerSnapshot explore, boss;
        public NativeAudioMixer()
        {
            Mixer = Resources.Load<AudioMixer>(ResourcePath);
            if (Mixer == null) throw new InvalidOperationException("Missing audio mixer Resources/" + ResourcePath + " (run Exoduser/RM1 Sound/Build Mixer)");
            explore = Mixer.FindSnapshot("Explore"); boss = Mixer.FindSnapshot("Boss");
            if (explore == null || boss == null) throw new InvalidOperationException("Exoduser.mixer is missing the Explore / Boss snapshots");
        }
        public AudioMixerGroup Group(string name)
        {
            string path = name == "Music" || name == "Ambience" || name == "SFX" ? "Master/" + name : "Master/SFX/" + name;
            var found = Mixer.FindMatchingGroups(path); string leaf = name;
            if (found == null || found.Length == 0) throw new InvalidOperationException("Exoduser.mixer has no group " + path);
            foreach (var g in found) if (g.name == leaf) return g;   // FindMatchingGroups also returns the children of a path
            return found[0];
        }
        public static float ToDb(float linear) { return linear <= .0001f ? -80f : Mathf.Clamp(20f * Mathf.Log10(linear), -80f, 20f); }
        // SFX percent -> master bus gain (web mbus gain = sfxVol); BGM percent / 60 -> music gain (web default 60 = 0 dB)
        public void SetSfxPercent(int percent) { float db = ToDb(Mathf.Clamp(percent, 0, 100) / 100f); Mixer.SetFloat("SfxVol", db); SfxGain = Mathf.Clamp(percent, 0, 100) / 100f; }   // the forest bed / 3D ambience follow it in code (web: same sfxVol bus)
        public void SetMusicPercent(int percent) { Mixer.SetFloat("MusicVol", ToDb(Mathf.Clamp(percent, 0, 100) / 60f)); }
        public void Snapshot(bool bossFight, float seconds = .5f) { Mixer.TransitionToSnapshots(new[] { bossFight ? boss : explore }, new[] { 1f }, seconds); }
    }
}
