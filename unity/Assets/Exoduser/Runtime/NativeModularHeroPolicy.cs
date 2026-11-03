using System;
namespace Exoduser.UnityPort {
 // Candidate selection only. Class rules, saves and the renderer policy are unchanged.
 public static class NativeModularHeroPolicy {
  public static string Resource(string[] args){
   bool modular=false;
   for(int i=0;i<(args==null?0:args.Length);i++){
    string value=args[i];
    if(value.StartsWith("--hero-rig=",StringComparison.Ordinal))modular=value.Substring(11)=="modular";
    else if(value=="--hero-rig"&&i+1<args.Length)modular=args[++i]=="modular";
   }
   return modular&&NativeRigPixelPolicy.Requested(args)?"Characters/Warrior_Modular":"Characters/Warrior";
  }
 }
}
