using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class FeedbackAudioReceipt
    {
        public int loadedClips,requested,played,dropped,voicesPeak;
        public float listenerPeak;
        public List<string> keys=new List<string>();
    }
    // Admitted five-sample source slice. EQ/compressor and the rest of the
    // game's audio graph are deliberately outside this adapter's scope.
    public sealed class NativeFeedbackAudio : IDisposable
    {
        sealed class Voice {public AudioSource source;public int priority;public double started,ends;}
        readonly Transform parent;
        readonly Dictionary<string,AudioClip> clips=new Dictionary<string,AudioClip>();
        readonly Dictionary<string,double> lastAt=new Dictionary<string,double>();
        readonly List<FeedbackEvent> pending=new List<FeedbackEvent>();
        readonly List<Voice> voices=new List<Voice>();
        readonly float[] output=new float[1024];
        public readonly FeedbackAudioReceipt Receipt=new FeedbackAudioReceipt();
        public NativeFeedbackAudio(Transform parent,Camera camera)
        {
            this.parent=parent;
            if(camera.GetComponent<AudioListener>()==null)camera.gameObject.AddComponent<AudioListener>();
            foreach(string key in new[]{"sword_swing1","sword_swing2","sword_swing3","scarecrow_charge","sword_parry"}){
                var clip=Resources.Load<AudioClip>("Audio/"+key);
                if(clip==null)throw new InvalidOperationException("Missing original audio sample "+key);
                clip.LoadAudioData();clips.Add(key,clip);
            }
            Receipt.loadedClips=clips.Count;AudioListener.GetOutputData(output,0);
        }
        static bool Priority(string key){return key.StartsWith("sword_swing",StringComparison.Ordinal)||key=="sword_parry";}
        public void Handle(FeedbackEvent e)
        {
            if(e.Kind!=FeedbackKind.Sample)return;Receipt.requested++;
            if(!clips.ContainsKey(e.SampleKey))throw new NotSupportedException("Audio sample outside admitted scope "+e.SampleKey);
            if(!Priority(e.SampleKey)){
                double now=Time.realtimeSinceStartupAsDouble;
                if(lastAt.TryGetValue(e.SampleKey,out double last)&&now-last<.03){Receipt.dropped++;return;}
                lastAt[e.SampleKey]=now;pending.Add(e);
            }else pending.Insert(0,e); // Original priority queue unshift.
        }
        public void Flush()
        {
            var seen=new Dictionary<string,int>();var categories=new Dictionary<string,int>();int count=0;
            foreach(var e in pending){
                bool priority=Priority(e.SampleKey);string category=e.SampleKey.StartsWith("sword_swing",StringComparison.Ordinal)?"g_swing":e.SampleKey;
                categories.TryGetValue(category,out int cat);seen.TryGetValue(e.SampleKey,out int n);
                if(!priority&&(count>=6||cat>=2)){Receipt.dropped++;continue;}
                categories[category]=cat+1;
                float volumeMultiplier=n<2?1:Mathf.Max(.08f,Mathf.Pow(.5f,n-1));
                float pitchMultiplier=n<2?1:Mathf.Max(.7f,1-(n-1)*.05f);
                Play(e.SampleKey,e.Volume*volumeMultiplier,e.QueuedRate*pitchMultiplier,priority?10:2);
                seen[e.SampleKey]=n+1;count++;
            }
            pending.Clear();
        }
        void Play(string key,float volume,float pitch,int priority)
        {
            double now=AudioSettings.dspTime;Voice available=null,lowest=null;int active=0,hitVoices=0;
            foreach(var v in voices){
                if(v.ends<=now){if(available==null)available=v;continue;}
                active++;if(v.priority<=2)hitVoices++;
                if(lowest==null||v.priority<lowest.priority||(v.priority==lowest.priority&&v.started<lowest.started))lowest=v;
            }
            if(priority<=2&&hitVoices>=3){Receipt.dropped++;return;}
            if(active>=48){
                if(lowest==null||!(priority>lowest.priority||(priority>=10&&priority>=lowest.priority))){Receipt.dropped++;return;}
                available=lowest;available.source.Stop();active--;
            }
            if(available==null){
                var go=new GameObject("Original SFX voice");go.transform.SetParent(parent);var source=go.AddComponent<AudioSource>();
                source.playOnAwake=false;source.loop=false;source.spatialBlend=0;source.dopplerLevel=0;
                available=new Voice{source=source};voices.Add(available);
            }
            var clip=clips[key];if(clip.loadState!=AudioDataLoadState.Loaded){Receipt.dropped++;return;}
            var s=available.source;s.clip=clip;s.pitch=pitch;
            // OPT.sfxVol60: sample gain min(1,vol*.6), then master bus gain .6.
            s.volume=Mathf.Min(1,volume*.6f)*.6f;s.panStereo=0;s.Play();
            available.priority=priority;available.started=now;available.ends=now+clip.length/pitch;
            Receipt.played++;if(!Receipt.keys.Contains(key))Receipt.keys.Add(key);Receipt.voicesPeak=Math.Max(Receipt.voicesPeak,active+1);
        }
        public void Probe()
        {
            AudioListener.GetOutputData(output,0);
            foreach(float value in output)Receipt.listenerPeak=Mathf.Max(Receipt.listenerPeak,Mathf.Abs(value));
        }
        public void Reset(){pending.Clear();lastAt.Clear();foreach(var v in voices){v.source.Stop();v.ends=0;}}
        public void Dispose(){Reset();foreach(var v in voices)UnityEngine.Object.Destroy(v.source.gameObject);voices.Clear();}
    }
}
