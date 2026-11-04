using System;

namespace Exoduser.UnityPort
{
 // Presentation-only cue state: event entries alternate takes; forge uses a shuffle bag.
 // Silence caused by opening settings keeps the current event/take and shuffle position.
 public sealed class NativeBgmCues
 {
  static readonly string[] forge = { "forge_vengeance", "forge_vengeance_alt", "forge_anvil_ashes" };
  readonly NativeBgmShuffle forgeShuffle;
  string context="", death="death", victory="victory", forgeCurrent="";
  int deaths, victories; bool forgeActive;
  public NativeBgmCues(Func<int,int> randomBelow){forgeShuffle=new NativeBgmShuffle(forge,randomBelow);}
  public string Resolve(string gameKey,string audioKey)
  {
   if(audioKey.Length==0)return "";
   if(gameKey.Length>0&&gameKey!=context)
   {
    if(gameKey=="death")death=deaths++%2==0?"death":"death_alt";
    if(gameKey=="victory")victory=victories++%2==0?"victory":"victory_alt";
    context=gameKey;
   }
   if(audioKey=="forge")
   {
    if(!forgeActive){AdvanceForge();forgeActive=true;}
    return forgeCurrent;
   }
   forgeActive=false;
   if(gameKey=="death"&&audioKey=="death")return death;
   if(gameKey=="victory"&&audioKey=="victory")return victory;
   return audioKey;
  }
  public string AdvanceForge()
  {
   return forgeCurrent=forgeShuffle.Next();
  }
  public void ClearContext(){context="";forgeActive=false;}
 }
}
