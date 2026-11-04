using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // R7 druid skill sounds that have no Core sound event: boss state changes (slam lift, charge kick, grab bind / throw), the wallSlam Fx and a fissure blowing up.
    // It only watches the Core (read only) and asks NativeFeedbackAudio to play; the sounds that ride on a Core sound event are in NativeFeedbackAudio.DruidExtras.
    public sealed class NativeDruidSoundCues : IDisposable
    {
        readonly NativeFeedbackAudio audio;
        Simulation bound;EnemyState prevBoss;string prevState;bool liftDone,kickDone;
        readonly Dictionary<Fissure,bool> prevExploded=new Dictionary<Fissure,bool>();
        public NativeDruidSoundCues(NativeFeedbackAudio audio){this.audio=audio;}
        readonly NativeSoundWire.BossCueTracker wire=new NativeSoundWire.BossCueTracker();   // R8/R9: collapse12 / collapse23 / heap loop from the boss state change
        public NativeAmbientSources Ambient;   // owner of the heap loop (3D source)
        static Vector3 Point(double x,double y){return new Vector3((float)x/100,-(float)y/100,0);}   // NativeGame.Point
        // stage events that end the heap loop (ArenaLoadStart, FieldRestored); the final kill / sink start are seen by Observe
        public void StopHeap(int tick,string source){if(wire.StopHeap()&&Ambient!=null)Ambient.StopHeap(tick,source);}
        public void Reset(){if(wire.StopHeap()&&Ambient!=null)Ambient.StopHeap(bound!=null?bound.TickCount:0,"Reset");wire.Reset();prevBoss=null;prevState=null;liftDone=kickDone=false;prevExploded.Clear();}
        public void Dispose(){if(bound!=null)bound.BossFx-=OnFx;bound=null;}
        void OnFx(string kind,double x,double y,double r)
        {
            if(kind!="wallSlam"||bound==null)return;
            int t=bound.TickCount;
            audio.PlayDruidCue("druid_wall_crash",.5f,1,.03f,(float)x,(float)y,t,0,"Core Fx wallSlam");
            audio.PlayDruidCue("druid_debris",.5f,1,.05f,(float)x,(float)y,t,2,"Core Fx wallSlam debris (+2 f)");
        }
        // once per frame, before NativeFeedbackAudio.Flush
        public void Observe(Simulation sim)
        {
            if(bound!=sim){if(bound!=null)bound.BossFx-=OnFx;bound=sim;Reset();if(sim!=null)sim.BossFx+=OnFx;}
            var druid=sim!=null?sim.Druid:null;if(druid==null){Reset();return;}
            int t=sim.TickCount,fix=DruidRemodelData.AimFixTicks;
            var boss=druid.Boss;string s=null;DruidData d=null;
            if(boss!=null&&boss.Alive&&druid.Data.TryGetValue(boss,out d))s=d.S;
            var lifeState=boss!=null?sim.DruidLife(boss):null;
            var step=wire.Observe(s,lifeState!=null?lifeState.Life:-1,boss==null||!boss.Alive);   // before prevState moves: previous vs now, like NativeBossView.prevBossState
            if(step.Cue!=null&&d!=null)audio.PlayWire(step.Cue,(float)d.X,(float)d.Y,t,step.CueSource);
            if(step.Heap==NativeSoundWire.HeapAction.Start&&d!=null&&Ambient!=null)Ambient.StartHeap(Point(d.X,d.Y),t,step.HeapSource);
            else if(step.Heap==NativeSoundWire.HeapAction.Stop&&Ambient!=null)Ambient.StopHeap(t,step.HeapSource);
            if(boss!=prevBoss){prevBoss=boss;prevState=null;liftDone=kickDone=false;}
            if(s!=prevState){liftDone=kickDone=false;}
            if(s=="bossSlamWind"&&!liftDone&&d.St2<=fix){liftDone=true;audio.PlayDruidCue("druid_slam_lift",.5f,1,0,(float)d.X,(float)d.Y,t,0,"boss state bossSlamWind, last "+fix+" f");}
            if(s=="bossChargeWind"&&!kickDone&&d.St2<=fix){kickDone=true;audio.PlayDruidCue("druid_charge_kick",.5f,1,.04f,(float)d.X,(float)d.Y,t,0,"boss state bossChargeWind, last "+fix+" f");}
            if(s=="bossGrab"&&prevState!="bossGrab")audio.PlayDruidCue("druid_grab_bind",.5f,1,0,(float)d.X,(float)d.Y,t,0,"boss state into bossGrab");
            if(prevState=="bossGrab"&&s!=null&&s!="bossGrab")audio.PlayDruidCue("druid_grab_throw",.5f,1,0,(float)d.X,(float)d.Y,t,0,"boss state bossGrab -> "+s);
            prevState=s;
            for(int i=0;i<druid.Fissures.Count;i++){
                var f=druid.Fissures[i];bool was;
                if(f.Exploded&&!(prevExploded.TryGetValue(f,out was)&&was)){
                    float hx=(float)(f.X+Math.Cos(f.Ang)*f.Len),hy=(float)(f.Y+Math.Sin(f.Ang)*f.Len);
                    audio.PlayDruidCue("druid_root_spikes",.5f,1,.04f,hx,hy,t,0,"fissure exploded");
                    audio.PlayDruidCue("druid_debris",.5f,1,.05f,hx,hy,t,2,"fissure exploded debris (+2 f)");
                }
                prevExploded[f]=f.Exploded;
            }
            if(prevExploded.Count>64){var gone=new List<Fissure>();foreach(var k in prevExploded.Keys)if(!druid.Fissures.Contains(k))gone.Add(k);foreach(var k in gone)prevExploded.Remove(k);}
        }
    }
}
