using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // Clean-map trial switches. With none of these arguments nothing here runs and the shader keeps its default variant.
    // --a2-clean: leaves only ground, water, bridge deck and atmosphere (BRIEF_CLEAN_MAP_20261105 M0; torches go too).
    // --a2-ground=m1a: forest_ground_04 at its real size, no tint. 3.2m / 1.152m per u = 2.78u; see M0_M1_JUDGE §6.
    // --a2-debug-ground=worldNormal|vertexColor|shOnly|flatAmbient|albedoOnly: ground stain isolation output.
    public static class A2CleanMode
    {
        static string Value(string prefix){foreach(var a in Environment.GetCommandLineArgs())if(a.StartsWith(prefix,StringComparison.Ordinal))return a.Substring(prefix.Length);return null;}
        public static readonly bool Enabled=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2-clean")>=0;
        public static readonly string Ground=Value("--a2-ground=");
        public static readonly string Debug=Value("--a2-debug-ground=");
    }
    public sealed partial class NativeGame
    {
        static readonly HashSet<string> A2CleanKept=new HashSet<string>{"A2 전체 필드 지면","A2 원본 보행 밖 독액 개울","A2 시작 목교","A2 지면 높이 안개","A2 필드 국소 빛기둥"};
        void A2CleanApply()
        {
            if(A2CleanMode.Enabled)
            {
                int renderers=0,lights=0;
                foreach(Transform child in a2Root.transform)
                {
                    if(A2CleanKept.Contains(child.name))continue;
                    foreach(var r in child.GetComponentsInChildren<Renderer>(true))if(r.enabled){r.enabled=false;renderers++;}
                    foreach(var l in child.GetComponentsInChildren<Light>(true))if(l.enabled){l.enabled=false;lights++;}
                }
                Debug.Log("[A2 Clean] renderers off "+renderers+", lights off "+lights);
            }
            if(a2FieldSoil==null)return;
            if(A2CleanMode.Ground=="m1a")a2FieldSoil.EnableKeyword("_A2_GROUND_M1A");
            switch(A2CleanMode.Debug)
            {
                case "worldNormal":a2FieldSoil.EnableKeyword("_A2_DBG_NORMAL");break;
                case "vertexColor":a2FieldSoil.EnableKeyword("_A2_DBG_VCOLOR");break;
                case "shOnly":a2FieldSoil.EnableKeyword("_A2_DBG_SH");break;
                case "flatAmbient":a2FieldSoil.EnableKeyword("_A2_DBG_FLAT");break;
                case "albedoOnly":a2FieldSoil.EnableKeyword("_A2_DBG_ALBEDO");break;
            }
        }
    }
}
