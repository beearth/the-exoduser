using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class FeedbackAudioReceipt
    {
        public int loadedClips,requested,played,dropped,voicesPeak;
        public float listenerPeak;
        public List<string> keys=new List<string>();
        public List<string> groups=new List<string>();
    }
    // Admitted source samples (ki slash cast / charge / parry, B09 player_hit1-4) plus the RM-1 sound slice (track A):
    // enemy hit / crit / death, boss hit / death, roll and the adopted RM1 keys. Every voice is routed to an Exoduser.mixer group.
    // EQ/compressor and the rest of the game's audio graph are deliberately outside this adapter's scope.
    public sealed class NativeFeedbackAudio : IDisposable
    {
        // web _SFX_PRI (TELL 12, SKILL 10, VOICE 9, PLAYER_HIT 8, DEATH 4, STEP 3, HIT 2, PROJ 1, AMB 0)
        public const int PriTell=12,PriSkill=10,PriVoice=9,PriPlayerHit=8,PriDeath=4,PriStep=3,PriHit=2,PriProj=1,PriAmb=0;
        sealed class Voice {public AudioSource source;public int priority;public double started,ends;public float rawVolume;}
        sealed class Req {public string key,category,group,logical,source,note,fileKey;public int tick;public float volume,pitch,blend,delay,pan;public int priority;public Vector3 pos;public bool front;}
        readonly Transform parent;float volumeGain=.6f;
        readonly NativeAudioMixer bus;readonly GameObject listenerObject;
        readonly Dictionary<string,AudioMixerGroup> groupCache=new Dictionary<string,AudioMixerGroup>();
        readonly System.Random rng=new System.Random(20261027);
        public NativeAudioMixer Bus{get{return bus;}}
        public Func<Vector3> ListenerAt;   // the AudioListener sits on the player (camera height must not bend the distance feel)
        public void SetVolumePercent(int percent){volumeGain=Mathf.Clamp(percent,0,100)/100f;bus.SetSfxPercent(percent);foreach(var v in voices)v.source.volume=Mathf.Min(1,v.rawVolume*volumeGain);}
        readonly Dictionary<string,AudioClip> clips=new Dictionary<string,AudioClip>();
        readonly Dictionary<string,double> lastAt=new Dictionary<string,double>();
        readonly List<Req> pending=new List<Req>(),direct=new List<Req>();
        readonly List<Voice> voices=new List<Voice>();
        readonly float[] output=new float[1024];
        int deathTick=-1,deathN,lastBurstTick=-1000;bool deathThrottled;
        public readonly FeedbackAudioReceipt Receipt=new FeedbackAudioReceipt();
        // RM-1 Receipt log (section 6.6): one line per sound -- frame, logical key, where it came from, mixer group, volume, file present
        public readonly List<string> Lines=new List<string>();
        public Func<Vector3,bool> OnScreen;   // tell sounds of off-screen monsters are skipped (AD3 stage 2)
        public int CurrentTick;               // host fallback for sounds the host asks for itself
        // 3rd-round candidates that have no adopted file yet (section 6.6 "pending" column): logical key -> temporary file keys ({} = leave empty, still logged)
        static readonly Dictionary<string,string[]> LogicalFiles=new Dictionary<string,string[]>{
            {"tell_parry",new[]{"tell_melee"}},{"druid_staff_tap",new string[0]},{"druid_root_pierce",new string[0]}};
        // adopted start volumes (RM1_AUDIO_KEYS.json); the final values are set by ear
        static readonly Dictionary<string,float> StartVolume=new Dictionary<string,float>{
            {"tell_melee",.45f},{"tell_ranged",.45f},{"tell_boss",.45f},{"tell_grab",.45f},{"tell_parry",.45f},{"druid_erupt",.5f},{"druid_sink",.55f},{"druid_tide",.5f},{"druid_roots_rise",.5f},{"druid_heartbeat",.5f},{"druid_burrow",.45f},{"druid_staff_tap",.5f},{"druid_root_pierce",.5f},
            {"druid_vo_pain",.6f},{"druid_vo_attack",.7f},{"druid_vo_phase",1f},{"druid_vo_fall",.7f},{"druid_vo_last",.75f},{"druid_drag",.6f},{"druid_fissure",.6f},{"druid_pod",.5f},{"druid_summon",.6f},{"druid_hit",.3f},{"druid_hit_heavy",.6f},{"druid_whip",.55f},{"druid_spore",.55f},{"druid_slam",.7f}};
        readonly Dictionary<string,int> lastTellTick=new Dictionary<string,int>();
        int lastPlayerHitTick=-1000;
        public NativeFeedbackAudio(Transform parent,Camera camera)
        {
            this.parent=parent;bus=new NativeAudioMixer();
            var cameraListener=camera.GetComponent<AudioListener>();if(cameraListener!=null)UnityEngine.Object.Destroy(cameraListener);
            listenerObject=new GameObject("Audio listener (player)");listenerObject.transform.SetParent(parent);listenerObject.AddComponent<AudioListener>();
            foreach(string key in new[]{"sword_swing1","sword_swing2","sword_swing3","scarecrow_charge","sword_parry","player_hit1","player_hit2","player_hit3","player_hit4","spike_trap","fireball","heavy_hit","chain_assault_fire","ice_storm","voice_holyDome","voice_holyDome2","voice_grunt","male_grunt"}){
                var clip=Resources.Load<AudioClip>("Audio/"+key);
                if(clip==null)throw new InvalidOperationException("Missing original audio sample "+key);
                clip.LoadAudioData();clips.Add(key,clip);
            }
            foreach(var folder in new[]{"Audio/SFX","Audio/RM1","Audio/UI"})foreach(var clip in Resources.LoadAll<AudioClip>(folder)){clip.LoadAudioData();clips[clip.name]=clip;}
            foreach(string key in new[]{"monster_hit","monster_hit1","monster_hit_flesh1","monster_hit_flesh2","flat_hit","crit_heavy","boss_hit","boss_howl","death_boss","footstep","footstep2","tell_melee","tell_ranged","tell_boss","tell_grab","toxic_bubble"})
                if(!clips.ContainsKey(key))throw new InvalidOperationException("Missing RM-1 audio sample "+key);
            Receipt.loadedClips=clips.Count;bus.SetSfxPercent(60);AudioListener.GetOutputData(output,0);
        }
        public bool HasClip(string key){return clips.ContainsKey(key);}
        public AudioClip Clip(string key){AudioClip clip;if(!clips.TryGetValue(key,out clip))throw new InvalidOperationException("Audio sample outside admitted scope "+key);return clip;}
        float Jitter(float centre,float spread){return centre*(1+((float)rng.NextDouble()-.5f)*2*spread);}   // web _r(centre, spread)
        // web _sfxPri + the mixer group of each key family; blend = spatialBlend (0 = player / UI 2D, .5 = direction only, no distance roll-off)
        static void Classify(string key,out int priority,out string group,out float blend,out bool front)
        {
            front=key.StartsWith("sword_swing",StringComparison.Ordinal)||key=="sword_parry"||key=="chain_assault_fire";blend=0;
            if(key=="ui_tab"){priority=PriSkill;group="UI";}
            else if(front||key=="q_parry"||key=="scarecrow_charge"||key=="spike_trap"||key=="fireball"||key=="heavy_hit"||key=="chain_assault_fire"||key=="ice_storm"){priority=PriSkill;group="Skill";}
            else if(key.StartsWith("sword_back",StringComparison.Ordinal)){priority=PriHit;group="PlayerHit";}   // web: HIT class
            else if(key.StartsWith("player_hit",StringComparison.Ordinal)){priority=PriPlayerHit;group="PlayerHit";}
            else if(key.StartsWith("voice_",StringComparison.Ordinal)||key=="male_grunt"){priority=PriVoice;group="Voice";}
            else if(key.StartsWith("druid_vo_",StringComparison.Ordinal)){priority=PriVoice;group="Voice";blend=.5f;}   // SND-09 druid voices
            else if(key.StartsWith("tell_",StringComparison.Ordinal)){priority=PriTell;group="Tell";blend=.5f;}
            else if(key.StartsWith("boss_howl",StringComparison.Ordinal)){priority=PriSkill;group="Skill";blend=.5f;}
            else if(key.StartsWith("death_",StringComparison.Ordinal)||key=="monster_die1"){priority=PriDeath;group="Death";blend=.5f;}
            else if(key.StartsWith("footstep",StringComparison.Ordinal)||key=="roll_body"){priority=PriStep;group="Step";}
            else if(key=="toxic_bubble"){priority=PriAmb;group="Ambience";blend=1;}
            else{priority=PriHit;group="EnemyHit";blend=.5f;}   // monster_hit*, flat_hit, crit_heavy, boss_hit
        }
        static string Category(string key)
        {
            if(key.StartsWith("sword_swing",StringComparison.Ordinal))return "g_swing";
            if(key.StartsWith("monster_hit",StringComparison.Ordinal)||key=="flat_hit")return "g_monHit";
            if(key=="boss_hit"||key=="druid_hit")return "g_bossHit";
            return key;
        }
        Req Make(string key,float volume,float pitch,Vector3 pos,FeedbackEvent e=null){var r=new Req{key=key,logical=key,volume=volume,pitch=pitch,pos=pos,tick=e!=null?e.Tick:CurrentTick,source=e!=null?(e.Source??("Core "+e.Kind)):"host"};Classify(key,out r.priority,out r.group,out r.blend,out r.front);r.category=Category(key);return r;}
        static Vector3 World(FeedbackEvent e){return new Vector3(e.X/100,-e.Y/100,0);}   // NativeGame.Point
        public void Handle(FeedbackEvent e)
        {
            switch(e.Kind){
                case FeedbackKind.Sample:if(e.SampleKey=="druid_sink"&&e.Source==SinkCoreSource)break;HandleSample(e);break;   // the Core's sink notification is ignored: the sink sound rides on the sink drawing (PlaySinkHole)
                case FeedbackKind.EnemyHit:Receipt.requested++;Queue(HitRequest(e));break;
                case FeedbackKind.BossHit:Receipt.requested++;Queue(BossHitRequest(e));break;   // _BOSS_SFX[0].hit pitch .7
                case FeedbackKind.EnemyCrit:Receipt.requested++;if(e.IsBoss&&HasClip("druid_hit_heavy"))HeavyHit(e);else Queue(Make("crit_heavy",e.Volume,Jitter(1,.05f),World(e),e));break;
                case FeedbackKind.EnemyDeath:HandleDeath(e);break;
                case FeedbackKind.BossDeath:Receipt.requested++;direct.Add(HasClip("druid_vo_last")?Make("druid_vo_last",.75f,Jitter(1,.03f),World(e),e):Make("death_boss",.75f,Jitter(.7f,.15f),World(e),e));break;   // _BOSS_SFX[0].die
                case FeedbackKind.Parry:   // game.html doParry (38667): Q parry -> q_parry .9 (1+-.08); otherwise sword_parry 1 (1+-.1) + one sword_back* .5 (1.1+-.1); then 50 % voice_parry1-4 (1+-.03) else male_grunt (1+-.15)
                    Receipt.requested++;
                    if(e.Step==1)direct.Add(Make("q_parry",.9f,Jitter(1,.08f),World(e),e));
                    else{
                        direct.Add(Make("sword_parry",1f,Jitter(1,.1f),World(e),e));
                        direct.Add(Make(new[]{"sword_back","sword_back2","sword_back3"}[rng.Next(3)],.5f,Jitter(1.1f,.1f),World(e),e));
                    }
                    if(rng.NextDouble()<.5)direct.Add(Make("voice_parry"+(1+rng.Next(4)),1f,Jitter(1,.03f),World(e),e));
                    else direct.Add(Make("male_grunt",1f,Jitter(1,.15f),World(e),e));
                    break;
                case FeedbackKind.Roll:
                    Receipt.requested++;   // the web has no roll sample yet: it borrows footstep at the roll start and footstep2 in _finishRoll (roll_body replaces them)
                    var step=e.Step==0?Make("roll_body",.55f,Jitter(1.15f,.1f),World(e),e):Make("roll_body",.5f,Jitter(1f,.1f),World(e),e);
                    step.fileKey=e.Step==0?"footstep":"footstep2";step.source=e.Step==0?"roll start":"roll end (_finishRoll)";direct.Add(step);break;
            }
        }
        // boss hit voicing (sound lead SND-09): variants rotate at random but never the same one twice in a row, rate +-6 %, a hit within 0.6 s of the last one is x.85 quieter
        // than that one (floor x.55), a 0.6 s pause restores the start volume. SND-09 round 2: druid_hit (one adopted variant, v3d) replaces boss_hit; a is not used, b..d were not picked.
        // Every boss hit in the Unity build today is the 1-1 druid; the next boss gets its own set here.
        static readonly string[] BossHitVariantsDruid={"druid_hit"},BossHitVariantsOld={"boss_hit"};
        string[] BossHitVariants{get{return HasClip("druid_hit")?BossHitVariantsDruid:BossHitVariantsOld;}}
        int lastBossHitVariant=-1,lastComboTick=-1000;float comboAtten=1;
        Req BossHitRequest(FeedbackEvent e)
        {
            int v=BossHitVariants.Length==1?0:rng.Next(BossHitVariants.Length);
            if(BossHitVariants.Length>1&&v==lastBossHitVariant)v=(v+1+rng.Next(BossHitVariants.Length-1))%BossHitVariants.Length;
            lastBossHitVariant=v;
            comboAtten=e.Tick-lastComboTick<=36?Mathf.Max(.55f,comboAtten*.85f):1f;lastComboTick=e.Tick;
            string key=BossHitVariants[v];
            var r=Make(key,e.Volume*comboAtten,key=="druid_hit"?Jitter(1,.06f):Jitter(.7f,.06f),World(e),e);
            if(key=="druid_hit")r.note="file ok (adopted "+AdoptedSource(key)+")";
            return r;
        }
        // SND-09 round 2 druid_hit_heavy: a critical hit on the boss (the Core's EnemyCrit event) sounds this instead of crit_heavy, 30 tick cooldown (spec L1). No stagger event exists in the Core yet.
        int lastHeavyTick=-1000;
        void HeavyHit(FeedbackEvent e)
        {
            if(e.Tick-lastHeavyTick<30){Receipt.dropped++;Lines.Add(Line(e.Tick,"druid_hit_heavy",e.Source??("Core "+e.Kind),"EnemyHit",.6f,"DROPPED 30 f cooldown"));return;}
            lastHeavyTick=e.Tick;
            var r=Make("druid_hit_heavy",.6f,Jitter(1,.05f),World(e),e);r.note="file ok (adopted "+AdoptedSource("druid_hit_heavy")+")";Queue(r);
        }
        // SND-09 round 2 druid_whip: every swing of move #1 (slashCombo hits 1-3). The Core's telegraph event of each hit is the cue; the whip sounds when the swing lands.
        // Hits 2 and 3: telegraph + link tele (24) + swing check (2) = exact. Hit 1: the first telegraph length is the move data (32) + 2; the Core does not pass the phase-scaled length, so hit 1 is an estimate.
        // Same file for the three: the rate climbs 0.97 / 1.00 / 1.06 (+-3 %) so the combo rises.
        void WhipOnSwing(FeedbackEvent e)
        {
            if(e.Source==null||!HasClip("druid_whip"))return;
            int hit,after;float centre;
            if(e.Source=="#1 slashCombo telegraph"){hit=1;centre=.97f;after=Array.Find(DruidRemodelData.Moves,m=>m.Id=="slashCombo").Tele+(DruidRemodelData.SlashActive-DruidRemodelData.SlashHitAt);}
            else if(e.Source.EndsWith("slashCombo hit 2 telegraph",StringComparison.Ordinal)){hit=2;centre=1f;after=DruidRemodelData.SlashLinkTele+(DruidRemodelData.SlashActive-DruidRemodelData.SlashHitAt);}
            else if(e.Source.EndsWith("slashCombo hit 3 telegraph",StringComparison.Ordinal)){hit=3;centre=1.06f;after=DruidRemodelData.SlashLinkTele+(DruidRemodelData.SlashActive-DruidRemodelData.SlashHitAt);}
            else return;
            var r=Make("druid_whip",.55f,Jitter(centre,.03f),World(e),e);r.logical="druid_whip";r.group="Skill";r.priority=PriSkill;r.delay=after/60f;r.tick=e.Tick+after;r.source="#1 slashCombo hit "+hit+" swing (telegraph +"+after+" f)";r.note="file ok (adopted "+AdoptedSource("druid_whip")+")";
            Receipt.requested++;direct.Add(r);
        }
        // SND-09 round 3 druid_spore: the poison spore fan (move #5 "fan") firing. The Core's "#5 fan telegraph" event is the cue; the fan fires when the telegraph ends (move data Tele 38, TeleM 1 in the remodel).
        void SporeOnFan(FeedbackEvent e)
        {
            if(e.Source!="#5 fan telegraph"||!HasClip("druid_spore"))return;
            int after=Array.Find(DruidRemodelData.Moves,m=>m.Id=="fan").Tele;
            var r=Make("druid_spore",.55f,Jitter(1,.05f),World(e),e);r.logical="druid_spore";r.group="Skill";r.priority=PriSkill;r.delay=after/60f;r.tick=e.Tick+after;r.source="#5 fan fires (telegraph +"+after+" f)";r.note="file ok (adopted "+AdoptedSource("druid_spore")+")";
            Receipt.requested++;direct.Add(r);
        }
        // SND-09 round 4 druid_slam: the dung slam (move #2 "slam") landing. The Core's "#2 slam telegraph" event is the cue; the swing starts when the telegraph ends (move data Tele 48) and lands SlamActive (6) ticks later (shock wave + damage check).
        void SlamOnLanding(FeedbackEvent e)
        {
            if(e.Source!="#2 slam telegraph"||!HasClip("druid_slam"))return;
            int after=Array.Find(DruidRemodelData.Moves,m=>m.Id=="slam").Tele+DruidRemodelData.SlamActive;
            var r=Make("druid_slam",.7f,Jitter(1,.04f),World(e),e);r.logical="druid_slam";r.group="Skill";r.priority=PriSkill;r.delay=after/60f;r.tick=e.Tick+after;r.source="#2 slam lands (telegraph +"+after+" f)";r.note="file ok (adopted "+AdoptedSource("druid_slam")+")";
            Receipt.requested++;direct.Add(r);
        }
        // _hitSfxForEtype: Core names the category (EnemySoundTables.Hit) and the base pitch; the variant is drawn here, never in the Core
        Req HitRequest(FeedbackEvent e)
        {
            string key;float pitch=e.Rate;
            switch(e.SampleKey){
                case "insect":case "bone":case "magic":key="monster_hit1";break;
                case "ghost":case "beast":key="monster_hit";break;
                case "flesh":key=rng.NextDouble()<.5?"monster_hit_flesh1":"monster_hit_flesh2";pitch=Jitter(1,.1f);break;
                case "armor":key="flat_hit";break;
                default:key=rng.NextDouble()<.5?"monster_hit":"monster_hit1";break;
            }
            return Make(key,e.Volume,pitch,World(e),e);
        }
        // deathFX sound branch: a burst of up to 6 layered voices per frame, 5-frame cross-frame throttle, ARMOR .525 / big (r>=40) 1.05 / normal .825
        void HandleDeath(FeedbackEvent e)
        {
            Receipt.requested++;
            if(e.Tick!=deathTick){deathTick=e.Tick;deathN=0;deathThrottled=e.Tick-lastBurstTick<5;if(!deathThrottled)lastBurstTick=e.Tick;}
            if(deathThrottled||deathN>=6){Receipt.dropped++;return;}
            int n=deathN++;float layer=n==0?1:Mathf.Max(.32f,.72f-(n-1)*.16f),pan=n==0?0:(n%2==1?-1:1)*Mathf.Min(.6f,.22f+n*.13f),layerPitch=n==0?1:Jitter(1.05f+n*.03f,.06f);
            string category=EnemySoundTables.DeathCategory(e.Etype);string[] pool;
            if(!NativeEnemySfxTables.DeathPools.TryGetValue(category,out pool))pool=NativeEnemySfxTables.DeathPools["monster"];
            float volume=(category=="armor"?.525f:e.Size>=40?1.05f:.825f)*layer;
            var r=Make(pool[rng.Next(pool.Length)],Jitter(volume,.08f),Jitter(1,.12f)*layerPitch,World(e),e);r.pan=pan;direct.Add(r);
            if(n==0&&e.Size>=40&&rng.NextDouble()<.25)direct.Add(Make("monster_die1",.75f,Jitter(.8f,.15f),World(e),e));
            if(n==0&&rng.NextDouble()<.15)direct.Add(Make("death_grunt",.45f,Jitter(1,.15f),World(e),e));
        }
        void HandleSample(FeedbackEvent e)
        {
            Receipt.requested++;
            if(e.Source!=null){HandleLogical(e);return;}
            if(!clips.ContainsKey(e.SampleKey))throw new NotSupportedException("Audio sample outside admitted scope "+e.SampleKey);
            double now=e.Tick/60.0;   // Core clock (60 ticks/s): the same-key 30 ms rule must not depend on how fast the frames are rendered
            var r=Make(e.SampleKey,e.Volume,e.QueuedRate,e.X!=0||e.Y!=0?World(e):Vector3.zero,e);
            // 기동불꽃 원문 _r(중심,.1), playSample의 공통 .92~1.08 변조를 각각 한 번 적용한다.
            if(e.SampleKey=="chain_assault_fire"||e.SampleKey=="heavy_hit"&&Mathf.Abs(e.Rate-.8f)<.0001f)r.pitch=Jitter(e.Rate,.1f)*(.92f+(float)rng.NextDouble()*.16f);
            if(e.SampleKey=="fireball"){r.volume=.9f;r.pitch=Jitter(.7f,.1f);}   // section 6.6: start values of the web E spell cast (vol .9, rate .7 +-.1), the Core only says 'a fireball was cast'
            if(e.SampleKey.StartsWith("tell_",StringComparison.Ordinal)){   // AD3: the same telegraph key at most once per 120 ms
                if(lastAt.TryGetValue(e.SampleKey,out double lastTell)&&now-lastTell<.12){Receipt.dropped++;return;}
                lastAt[e.SampleKey]=now;pending.Insert(0,r);return;
            }
            if(e.SampleKey.StartsWith("player_hit",StringComparison.Ordinal)){   // web: one hit sound per damage instance; several landing within 100 ms count once
                if(lastPlayerHitTick>=0&&e.Tick-lastPlayerHitTick<6){Receipt.dropped++;Lines.Add(Line(e.Tick,e.SampleKey,e.Source??("Core "+e.Kind),"PlayerHit",e.Volume,"DROPPED another player hit within 100 ms"));return;}
                lastPlayerHitTick=e.Tick;
            }
            if(!r.front){
                if(lastAt.TryGetValue(e.SampleKey,out double last)&&now-last<.03){Receipt.dropped++;return;}
                lastAt[e.SampleKey]=now;pending.Add(r);
            }else pending.Insert(0,r); // Original priority queue unshift.
        }
        // a logical sound key from the boss / enemy logic: tell_* (120 ms per key, at most 2 at once, off-screen skipped) and druid_* (mapped to a file or logged as "no file")
        void HandleLogical(FeedbackEvent e)
        {
            string[] files;if(!LogicalFiles.TryGetValue(e.SampleKey,out files))files=new[]{e.SampleKey};
            float volume;if(e.Volume>0)volume=e.Volume;else if(!StartVolume.TryGetValue(e.SampleKey,out volume))volume=.5f;
            string adopted=AdoptedSource(e.SampleKey);string note=files.Length==0?"no file yet (3rd-round pending, left empty)":(files[0]!=e.SampleKey?"temporary file "+string.Join("+",files):"file ok"+(adopted!=null?" (adopted "+adopted+")":""));
            WhipOnSwing(e);SporeOnFan(e);SlamOnLanding(e);
            var pos=World(e);bool tell=e.SampleKey.StartsWith("tell_",StringComparison.Ordinal);bool druid=e.SampleKey.StartsWith("druid_",StringComparison.Ordinal);
            if(tell){
                int last;if(lastTellTick.TryGetValue(e.SampleKey,out last)&&e.Tick-last<8){Receipt.dropped++;Lines.Add(Line(e.Tick,e.SampleKey,e.Source,"Tell",volume,"DROPPED same key within 120 ms"));return;}
                if(OnScreen!=null&&!OnScreen(pos)){Receipt.dropped++;Lines.Add(Line(e.Tick,e.SampleKey,e.Source,"Tell",volume,"DROPPED off-screen"));return;}
                int tells=0;double now=AudioSettings.dspTime;foreach(var v in voices)if(v.ends>now&&v.priority==PriTell)tells++;
                if(tells>=2){Receipt.dropped++;Lines.Add(Line(e.Tick,e.SampleKey,e.Source,"Tell",volume,"DROPPED 2 tells already sounding"));return;}
                lastTellTick[e.SampleKey]=e.Tick;
            }
            if(files.Length==0){Lines.Add(Line(e.Tick,e.SampleKey,e.Source,druid?"Skill":"Tell",volume,note));return;}
            for(int i=0;i<files.Length;i++){
                var r=Make(files[i],volume,1,pos,e);r.logical=e.SampleKey;r.pitch=e.SampleKey=="druid_staff_tap"?Jitter(1,.04f):1;r.delay=i*.08f;r.front=false;r.note=note;
                if(druid){if(e.SampleKey.StartsWith("druid_vo_",StringComparison.Ordinal)){r.group="Voice";r.priority=PriVoice;if(e.SampleKey=="druid_vo_pain"||e.SampleKey=="druid_vo_attack")r.pitch=Jitter(1,.05f);}else{r.group="Skill";r.priority=PriSkill;}}
                if(tell){r.group="Tell";r.priority=PriTell;}
                direct.Add(r);
            }
        }
        // SND-09 adopted processed files (RM1_AUDIO_KEYS.json "source"); the Receipt shows the adoption path next to each of these keys
        static readonly Dictionary<string,string> Adopted=new Dictionary<string,string>{
            {"druid_vo_pain","_preview_druid/druid_vo_pain_v2a_proc"},{"druid_vo_attack","_preview_druid/druid_vo_attack_v2a_proc"},{"druid_vo_phase","_preview_druid/druid_vo_phase_v2c_proc"},
            {"druid_vo_fall","_preview_druid/druid_vo_fall_v2a_proc"},{"druid_vo_last","_preview_druid/druid_vo_last_v2a_proc"},{"druid_drag","_preview_druid/druid_drag_v2a_proc"},
            {"druid_fissure","_preview_druid/druid_fissure_v2b_proc"},{"druid_pod","_preview_druid/druid_pod_v2d_proc"},{"druid_summon","_preview_druid/druid_summon_v2c_proc"},
            {"druid_hit","_preview_druid2/druid_hit_v3d_proc"},{"druid_hit_heavy","_preview_druid2/druid_hit_heavy_v3d_proc"},{"druid_whip","_preview_druid2/druid_whip_v3a_proc"},{"druid_spore","_preview_r3/druid_spore_r3a_proc"},{"druid_slam","_preview_r4/druid_slam_r4e2_proc"},{"druid_burrow","_preview_s3/druid_burrow_s3d_proc"}};
        static string AdoptedSource(string key){string s;return Adopted.TryGetValue(key,out s)?s:null;}
        static string Line(int tick,string key,string source,string group,float volume,string file){return "frame="+tick+" key="+key+" from=\""+source+"\" group="+group+" vol="+volume.ToString("0.00",System.Globalization.CultureInfo.InvariantCulture)+" file="+file;}
        int lastBossHitTick = -1000;
        void Queue(Req r)
        {
            if(r.key=="boss_hit"||r.key=="druid_hit"){if(r.tick-lastBossHitTick<8){Receipt.dropped++;return;}lastBossHitTick=r.tick;}   // A3: same 8 f cooldown as every enemy hit
            double now=r.tick/60.0;   // Core clock, see HandleSample
            if(r.priority<PriSkill&&lastAt.TryGetValue(r.key,out double last)&&now-last<.03){Receipt.dropped++;return;}
            lastAt[r.key]=now;pending.Add(r);
        }
        // host-driven one-shot (boss howl at the arena intro, tell keys, A8 bubbles): same routing as a Core event
        public const string SinkCoreSource="third fall: sink escape",SinkViewSource="view: sink hole opens (body sink 55 %)";
        // 1-1 druid sink: called by the sink drawing (NativeGame.BossSinkDraw) when the hole shows; same routing and Receipt line as a Core sample event
        public void PlaySinkHole(float x,float y,int tick){Handle(new FeedbackEvent{Kind=FeedbackKind.Sample,Tick=tick,X=x,Y=y,SampleKey="druid_sink",Source=SinkViewSource,Rate=1,QueuedRate=1});}
        // UI 탭은 전투 Tick이 멈춘 패널에서도 즉시 1회. SFX/UI와 기존 사용자 음량을 따른다.
        public void PlayUiTab(){Receipt.requested++;Play(Make("ui_tab",.22f,1f,Vector3.zero));}
        public void PlayNow(string key,float volume,float pitch,Vector3 world){Receipt.requested++;direct.Add(Make(key,volume,pitch,world));}
        public void Flush()
        {
            if(ListenerAt!=null)listenerObject.transform.position=ListenerAt();
            foreach(var r in direct)Play(r);
            direct.Clear();
            var seen=new Dictionary<string,int>();var categories=new Dictionary<string,int>();int count=0;
            foreach(var r in pending){
                bool priority=r.front||r.priority>=PriTell;   // swing / parry unshift like the original; telegraphs never hit the category caps
                categories.TryGetValue(r.category,out int cat);seen.TryGetValue(r.key,out int n);
                if(!priority&&(count>=6||cat>=2)){Receipt.dropped++;continue;}
                categories[r.category]=cat+1;
                float volumeMultiplier=n<2?1:Mathf.Max(.08f,Mathf.Pow(.5f,n-1));
                float pitchMultiplier=n<2?1:Mathf.Max(.7f,1-(n-1)*.05f);
                r.volume*=volumeMultiplier;r.pitch*=pitchMultiplier;Play(r);
                seen[r.key]=n+1;count++;
            }
            pending.Clear();
        }
        AudioMixerGroup GroupFor(string name){AudioMixerGroup g;if(!groupCache.TryGetValue(name,out g)){g=bus.Group(name);groupCache.Add(name,g);}return g;}
        void Play(Req r)
        {
            double now=AudioSettings.dspTime;Voice available=null,lowest=null;int active=0,hitVoices=0;
            foreach(var v in voices){
                if(v.ends<=now){if(available==null)available=v;continue;}
                active++;if(v.priority<=PriHit)hitVoices++;
                if(lowest==null||v.priority<lowest.priority||(v.priority==lowest.priority&&v.started<lowest.started))lowest=v;
            }
            if(r.priority<=PriHit&&hitVoices>=3){Receipt.dropped++;return;}
            if(active>=48){
                if(lowest==null||!(r.priority>lowest.priority||(r.priority>=10&&r.priority>=lowest.priority))){Receipt.dropped++;return;}
                available=lowest;available.source.Stop();active--;
            }
            if(available==null){
                var go=new GameObject("Original SFX voice");go.transform.SetParent(parent);var source=go.AddComponent<AudioSource>();
                source.playOnAwake=false;source.loop=false;source.spatialBlend=0;source.dopplerLevel=0;
                source.rolloffMode=AudioRolloffMode.Custom;source.SetCustomCurve(AudioSourceCurveType.CustomRolloff,AnimationCurve.Constant(0,1,1));source.spread=0;   // direction only: no distance fall-off
                available=new Voice{source=source};voices.Add(available);
            }
            string fileKey=r.fileKey??(r.key=="roll_body"?"footstep":r.key);   // roll_body is not adopted yet: the web footsteps stand in
            if(r.key=="roll_body")r.note="temporary file "+fileKey;
            var clip=clips[fileKey];if(clip.loadState!=AudioDataLoadState.Loaded){Receipt.dropped++;return;}
            var s=available.source;s.clip=clip;s.pitch=r.pitch;s.outputAudioMixerGroup=GroupFor(r.group);s.spatialBlend=r.blend;s.transform.position=r.pos;
            // OPT.sfxVol60: sample gain min(1,vol*.6); the master bus gain .6 is the mixer's SfxVol parameter.
            available.rawVolume=r.volume;s.volume=Mathf.Min(1,r.volume*volumeGain);s.panStereo=r.blend>0?0:Mathf.Clamp(r.pan,-1,1);
            if(r.delay>0)s.PlayDelayed(r.delay);else s.Play();
            available.priority=r.priority;available.started=now;available.ends=now+r.delay+clip.length/Mathf.Max(.01f,r.pitch);
            Lines.Add(Line(r.tick,r.logical??r.key,r.source??"host",r.group,r.volume,r.note??"file ok")+(r.logical!=null&&r.logical!=fileKey?" played="+fileKey:""));
            Receipt.played++;if(!Receipt.keys.Contains(r.logical??r.key))Receipt.keys.Add(r.logical??r.key);if(!Receipt.groups.Contains(r.group))Receipt.groups.Add(r.group);Receipt.voicesPeak=Math.Max(Receipt.voicesPeak,active+1);
        }
        public void Probe()
        {
            AudioListener.GetOutputData(output,0);
            foreach(float value in output)Receipt.listenerPeak=Mathf.Max(Receipt.listenerPeak,Mathf.Abs(value));
        }
        public void Reset(){pending.Clear();direct.Clear();lastAt.Clear();lastPlayerHitTick=-1000;lastBossHitTick=-1000;lastBossHitVariant=-1;lastComboTick=-1000;comboAtten=1;foreach(var v in voices){v.source.Stop();v.ends=0;}}
        public void Dispose(){Reset();foreach(var v in voices)UnityEngine.Object.Destroy(v.source.gameObject);voices.Clear();if(listenerObject!=null)UnityEngine.Object.Destroy(listenerObject);}
    }
}
