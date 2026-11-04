using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // r19 screen cleanup switch. Default ON; --a2r-r18-look starts with the r18 values. Runtime toggle exists only for before|after proof pairs.
    public static class A2RClean
    {
        public static bool On=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r18-look")<0;
        // D2 hell-rot canon: rotten bio-forest. Default ON; --a2r-hellrot-off restores the 778e8131a look (before|after proof).
        public static readonly bool HellRot=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-hellrot-off")<0;
        public static void Set(bool on){On=on;Shader.SetGlobalFloat("_A2RClean",on?1f:0f);Shader.SetGlobalFloat("_A2RD4",A2RD4.On?1f:0f);Shader.SetGlobalFloat("_A2RHellRot",HellRot?1f:0f);}
    }
}
