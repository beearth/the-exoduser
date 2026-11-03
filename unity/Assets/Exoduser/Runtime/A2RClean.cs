using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // r19 screen cleanup switch. Default ON; --a2r-r18-look starts with the r18 values. Runtime toggle exists only for before|after proof pairs.
    public static class A2RClean
    {
        public static bool On=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r18-look")<0;
        public static void Set(bool on){On=on;Shader.SetGlobalFloat("_A2RClean",on?1f:0f);}
    }
}
