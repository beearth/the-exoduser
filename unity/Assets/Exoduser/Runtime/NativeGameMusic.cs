using System;
using Exoduser.UnityPort.Core;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // RM-1 sound A1 + A2: the in-game BGM bus (hell1 -> boss -> victory, death) and the forest bed that follows hell1.
    // Web BGM.play(key): stop the current track, play the new one (loop); _ambSync(key): the bed loops while the key is 'hell1' and fades out in 800 ms otherwise.
    // Volumes follow the mixer parameters MusicVol / AmbVol (settings percentages), the boss key moves the mixer to the Boss snapshot (Ambience -8 dB).
    public sealed class NativeGameMusic : IDisposable
    {
        public const float MusicBase = .6f, BedGain = .15f, FadeOutSeconds = .5f, FadeInSeconds = .3f, BedFadeSeconds = .8f;
        readonly NativeAudioMixer bus; readonly GameObject root; readonly AudioSource music, bed, arenaBed;
        string playing = "", wanted = "", wantedGame = ""; float musicLevel, bedLevel, arenaLevel, playedFor; bool bedWanted, arenaWanted, rotating, forgeRotating;
        readonly NativeFieldBgmRotation rotation = new NativeFieldBgmRotation(n => UnityEngine.Random.Range(0, n));   // 1-1 field rotation (BGM select "auto" only)
        readonly NativeBgmCues cues = new NativeBgmCues(n => UnityEngine.Random.Range(0, n));
        public string Playing { get { return playing; } }
        public string Wanted { get { return wanted; } }
        public bool Rotating { get { return rotating; } }
        public bool BedWanted { get { return bedWanted; } }
        public bool BedAudible { get { return bed.isPlaying && bedLevel > 0; } }
        public int Switches;
        public bool BedFromKeyFile;   // true = RM1/amb_forest_bed.mp3 plays, false = the Ambient/amb_hell_forest_bed stand-in
        public Action<string, string, float, string> Report;   // Receipt line (key, source, volume, file note); NativeGame adds the Core tick
        bool bedStartLogged;
        public readonly System.Collections.Generic.List<string> Log = new System.Collections.Generic.List<string>();
        public NativeGameMusic(Transform parent, NativeAudioMixer bus)
        {
            this.bus = bus; root = new GameObject("Game music"); root.transform.SetParent(parent);
            music = Make("BGM", "Music"); bed = Make("Forest bed", "Ambience"); arenaBed = Make("Druid arena bed", "Ambience");
            var clip = Resources.Load<AudioClip>("Audio/RM1/" + NativeSoundWire.AmbForestBed);   // R8: the picked forest bed wins when RM1/amb_forest_bed.mp3 exists
            BedFromKeyFile = clip != null;
            if (clip == null) clip = Resources.Load<AudioClip>("Audio/Ambient/amb_hell_forest_bed");   // else the bed that has always played
            if (clip == null) throw new InvalidOperationException("Missing original ambience amb_hell_forest_bed");
            clip.LoadAudioData(); bed.clip = clip;
            var arena = Resources.Load<AudioClip>("Audio/RM1/amb_druid_arena");   // SND-09: boss-arena bed (10 s loop), takes the forest bed's place while the boss track plays
            if (arena != null) { arena.LoadAudioData(); arenaBed.clip = arena; }
        }
        AudioSource Make(string name, string group)
        {
            var go = new GameObject(name); go.transform.SetParent(root.transform);
            var s = go.AddComponent<AudioSource>(); s.playOnAwake = false; s.loop = true; s.spatialBlend = 0; s.volume = 0; s.outputAudioMixerGroup = bus.Group(group);
            return s;
        }
        public void SetPercents(int sfxPercent, int bgmPercent) { bus.SetSfxPercent(sfxPercent); bus.SetMusicPercent(bgmPercent); }
        // BGM.play(key): "" stops the music. A key without a track (hell2..7 are not part of this slice) leaves silence, never another chapter's song.
        public void Sync(string key) { Sync(key, key); }
        // key = the stage key (forest bed, boss snapshot); audioKey = the song to play (the BGM select may replace it, NativeBgmCatalog.Resolve).
        public void Sync(string key, string audioKey) { Sync(key, audioKey, false); }
        // rotate = the BGM select is "auto": on the field (hell1) the song plays once, then the six rotation songs follow (NativeFieldBgmRotation).
        // A boss / death / victory / chosen song leaves the rotation; the next field entry starts with hell1 again. Silence (key "") keeps its place.
        public void Sync(string key, string audioKey, bool rotate)
        {
            bool rot = rotate && audioKey == NativeFieldBgmRotation.FirstClip && (key == "hell1" || key.Length == 0);
            if (!rot && audioKey.Length > 0) rotation.Reset();
            string cue = cues.Resolve(key, audioKey);
            bool forge = audioKey == "forge";
            string target = rot ? rotation.Current : cue;
            if (target == wanted && key == wantedGame && rot == rotating && forge == forgeRotating) return;
            if (target != wanted) { Switches++; Log.Add(target); }
            wanted = target; wantedGame = key; rotating = rot; forgeRotating = forge;
            bus.Snapshot(key == "boss");
            bedWanted = key == "hell1"; arenaWanted = key == "boss" && arenaBed.clip != null;
        }
        public void Tick(float dt)
        {
            music.loop = !(rotating || forgeRotating);   // field/forge shuffle songs play once; an explicitly selected file loops
            if (playing != wanted)
            {
                if (music.isPlaying && musicLevel > 0) { musicLevel = Mathf.Max(0, musicLevel - dt / FadeOutSeconds); music.volume = musicLevel * MusicBase * NativeDecisionSound.MusicGain; }
                else
                {
                    music.Stop(); playing = wanted; var clip = playing.Length > 0 ? Resources.Load<AudioClip>("Audio/Bgm/" + (playing == "boss" ? "bgm_druid_boss" : playing)) : null;   // 1-1 slice: the boss is the druid (SND-09)
                    if (clip == null && playing.Length > 0) clip = Resources.Load<AudioClip>("Audio/Bgm/" + playing);
                    if (clip == null && playing == "lobby") clip = Resources.Load<AudioClip>("Audio/Lobby/lobby");   // BGM select "lobby"
                    music.clip = clip; musicLevel = 0; playedFor = 0;
                    if (clip != null) music.Play();
                }
            }
            else if (music.isPlaying) { playedFor += dt; musicLevel = Mathf.Min(1, musicLevel + dt / FadeInSeconds); music.volume = musicLevel * MusicBase * NativeDecisionSound.MusicGain; }
            else if (rotating && music.clip != null && playedFor > 1f && !AudioListener.pause) { wanted = rotation.Advance(); Switches++; Log.Add(wanted); playedFor = 0; }   // the song ended: the switch above loads the next one (same fade-in path)
            else if (forgeRotating && music.clip != null && playedFor > 1f && !AudioListener.pause) { wanted = cues.AdvanceForge(); Switches++; Log.Add(wanted); playedFor = 0; }
            if (bedWanted)
            {
                if (!bed.isPlaying) { bed.Play(); bedLevel = 0; }
                if (!bedStartLogged) { bedStartLogged = true; if (Report != null) Report(NativeSoundWire.AmbForestBed, "BGM key hell1: forest bed loop start", BedGain, BedFromKeyFile ? "file ok" : "temporary file amb_hell_forest_bed"); }
                bedLevel = Mathf.Min(1, bedLevel + dt / FadeInSeconds); bed.volume = bedLevel * BedGain * bus.SfxGain * NativeScreenTransition.Gain;   // web: 0.15 x sfxVol
            }
            if (arenaWanted)
            {
                if (!arenaBed.isPlaying) { arenaBed.Play(); arenaLevel = 0; }
                arenaLevel = Mathf.Min(1, arenaLevel + dt / FadeInSeconds); arenaBed.volume = arenaLevel * BedGain * bus.SfxGain * NativeScreenTransition.Gain;
            }
            else if (arenaBed.isPlaying)
            {
                arenaLevel = Mathf.Max(0, arenaLevel - dt / BedFadeSeconds); arenaBed.volume = arenaLevel * BedGain * bus.SfxGain * NativeScreenTransition.Gain;
                if (arenaLevel <= 0) arenaBed.Stop();
            }
            if (bedWanted) { }
            else if (bed.isPlaying)
            {
                bedLevel = Mathf.Max(0, bedLevel - dt / BedFadeSeconds); bed.volume = bedLevel * BedGain * bus.SfxGain * NativeScreenTransition.Gain;
                if (bedLevel <= 0) { bed.Stop(); bedStartLogged = false; }
            }
        }
        public void Silence() { rotation.Reset(); cues.ClearContext(); rotating = forgeRotating = false; playedFor = 0; wanted = ""; wantedGame = ""; playing = ""; bedWanted = false; arenaWanted = false; music.Stop(); bed.Stop(); arenaBed.Stop(); bedStartLogged = false; musicLevel = bedLevel = arenaLevel = 0; bus.Snapshot(false, 0); }
        public void Dispose() { if (root != null) UnityEngine.Object.Destroy(root); }
    }
}
