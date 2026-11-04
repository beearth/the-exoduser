using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Vfx
{
    // Unity clock/state-independent presentation contract. No gameplay references.
    public sealed class ImpactResponse
    {
        struct Pulse { public double Born, Hold; }
        readonly Dictionary<int,Pulse> pulses = new Dictionary<int,Pulse>();
        readonly List<int> expired = new List<int>();
        double frame = double.NegativeInfinity, impulseTime = double.NegativeInfinity, direction, amplitude;
        int accepted;
        readonly bool limitReactions;
        public ImpactResponse(bool limitReactions=false) { this.limitReactions=limitReactions; }
        // G1 11-04 (PBZ R3/R4): a hit holds the struck body and the hero for at most 2 ticks and never kicks the camera.
        public const double MaxFreezeSeconds = 2.0 / 60.0;
        public double FreezeSeconds { get; private set; }
        public static bool IsContact(bool known,double before,double after,double hurtTicks) { return hurtTicks>0&&(!known||after<before); }
        public bool Hit(int id,double now,double angle,bool heavy,bool critical)
        {
            if (now != frame) { frame=now; accepted=0; }
            if (pulses.TryGetValue(id,out var before) && now-before.Born < .08) return false;
            bool admitted=accepted<2;
            if(!admitted&&limitReactions)return false;
            FreezeSeconds=MaxFreezeSeconds;
            pulses[id]=new Pulse { Born=now, Hold=FreezeSeconds };
            // Every struck body reacts. Only flipbooks/lights/camera impulses use the two-contact budget.
            if(!admitted)return false;
            accepted++;
            impulseTime=now; direction=angle; amplitude=0;
            // Damage-over-time can touch many enemies; retired entries never grow without bound.
            if(pulses.Count>128) { expired.Clear(); foreach(var p in pulses) if(now-p.Value.Born>.3) expired.Add(p.Key); foreach(var key in expired)pulses.Remove(key); }
            return true;
        }
        public bool Frozen(int id,double now) { return pulses.TryGetValue(id,out var p) && now>=p.Born && now-p.Born < p.Hold; }
        public double Flash(int id,double now)
        {
            if(!pulses.TryGetValue(id,out var p))return 0;
            double age=now-p.Born; return age<0||age>=.1?0:Math.Pow(1-age/.1,2);
        }
        public void Camera(double now,out double x,out double y)
        {
            double age=now-impulseTime;
            if(age<0||age>=.18) { x=y=0; return; }
            double kick=-amplitude*Math.Exp(-age*24)*Math.Cos(age*55);
            x=Math.Cos(direction)*kick; y=Math.Sin(direction)*kick;
        }
        public void Reset() { pulses.Clear(); frame=impulseTime=double.NegativeInfinity; accepted=0; FreezeSeconds=0; }
    }
}
