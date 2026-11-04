using System;using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static readonly bool DruidRigRequested=NativeDruidRigPolicy.Requested(Environment.GetCommandLineArgs());
        NativeDruidRigPixelView druidRig;
        void BossRigAttach()
        {
            if(druidRig!=null){druidRig.enabled=false;druidRig.Deactivate();Destroy(druidRig);druidRig=null;}
            if(!DruidRigRequested)return;
            var original=druidBody;
            druidRig=gameObject.AddComponent<NativeDruidRigPixelView>();
            druidRig.Initialize(()=>HudCamera,()=>original.Hide(),Argument("-output"));
        }
        void WriteDruidRigReceipt(string directory){druidRig?.WriteReceipt(directory);}
    }
}
