using System;
namespace Exoduser.UnityPort
{
    // Read-only presentation decisions. Never changes a Core state, timer or RNG.
    public static class NativeDruidRigPolicy
    {
        public static bool Requested(string[] args)
        {
            bool enabled=false;if(args==null)return false;
            for(int i=0;i<args.Length;i++)
            {
                string value=null;
                if(args[i]!=null&&args[i].StartsWith("--boss-render=",StringComparison.Ordinal))value=args[i].Substring(14);
                else if(args[i]=="--boss-render"&&i+1<args.Length)value=args[++i];
                if(value!=null)enabled=value=="rigpixel";
            }
            return enabled;
        }
        public static string Role(string state)
        {
            return state=="eWalk"||state=="eChase"||state=="eApproach"?"Walk":state=="eRun"?"Run":state=="idle"?"Idle":"Hold";
        }
        public static string Palette(string name)
        {
            switch(name)
            {
                case "druid_bone":case "staff_bone":return "#b9ad90";
                case "druid_bark":case "staff_bark":return "#4a3826";
                case "druid_feather":return "#1c2024";
                case "druid_hair":return "#2a2624";
                case "druid_beard":return "#8f8a82";
                case "druid_glow":case "lantern_orb":return "#a8642a";
                case "druid_moss":return "#36421f";
                case "staff_leather":return "#2e231b";
                case "front_panel_cloth":return "#26211d";
                default:return null;
            }
        }
    }
}
