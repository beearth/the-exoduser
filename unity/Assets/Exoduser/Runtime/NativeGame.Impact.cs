using System;
using UnityEngine;
using Exoduser.UnityPort.Vfx;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        NativeImpactView contactVfx;
        NativeSkillRemaster skillRemaster;
        float impactReviewClock=-1;
        int heroContactSeen=-1;
        float ImpactNow {get{return impactReviewClock>=0?impactReviewClock:Time.unscaledTime;}}
        bool Impact3DActive {get{return contactVfx!=null&&contactVfx.Enabled&&NativeRemodel3D.Active;}}
        void ImpactInitialize()
        {
            contactVfx=new NativeImpactView(transform);
            // Same-build before/after capture: baseline retains the previous drawing path.
            contactVfx.Enabled=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-impact-baseline")<0;
            skillRemaster=new NativeSkillRemaster(transform){Enabled=contactVfx.Enabled};
        }
        Vector3 ImpactCameraOffset()
        {
            if(!Impact3DActive)return Vector3.zero;
            var offset=contactVfx.CameraOffset(ImpactNow)*OptionShakeScale;
            return NativeRemodel3D.Active?new Vector3(offset.x,0,offset.y):new Vector3(offset.x,offset.y,0);
        }
        bool ImpactHoldHeroPose()
        {
            bool firstContact=contactVfx!=null&&heroContactSeen!=contactVfx.Contacts;
            heroContactSeen=contactVfx==null?-1:contactVfx.Contacts;
            // Draw the contact pose once, then hold it. Holding the prior wind-up
            // would hide the actual strike. This also covers the HD-2D sprite path.
            return !firstContact&&Impact3DActive&&contactVfx.HeroFrozen(ImpactNow)&&!Simulation.RollActive&&
                (Simulation.Player.State=="wSwing"||Simulation.Player.State=="wRecover"||Simulation.Player.State=="gSlamWindup"||Simulation.Player.State=="gSlam1"||Simulation.Player.State=="sBash");}
    }
}
