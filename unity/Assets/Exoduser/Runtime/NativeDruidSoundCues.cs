using System;
using System.Collections.Generic;
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
        public void Reset(){prevBoss=null;prevState=null;liftDone=kickDone=false;prevExploded.Clear();}
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
