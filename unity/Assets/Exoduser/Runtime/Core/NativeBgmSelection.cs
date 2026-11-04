using System;

namespace Exoduser.UnityPort.Core
{
 // Web optBgmTrack (game.html 49436 + BGM.play gate 4282-4283): "auto" follows the stage key; a chosen key replaces the in-game track
 // (death and victory keep playing their own song); "t:<file>" and "allRandom" need the web's track files and shuffler.
 // Unity only owns these songs: auto, lobby (Audio/Lobby/lobby), hell1, boss, death, victory. Every other value in the menu list falls back to auto.
 public static class NativeBgmSelection
 {
  static readonly string[] supported={"auto","lobby","hell1","boss","death","victory"};
  public static bool IsSupported(string value){return Array.IndexOf(supported,value)>=0;}
  public static string Effective(string value){return IsSupported(value)?value:"auto";}
  public static int SupportedCount{get{return supported.Length;}}
  public static string SupportedAt(int index){return supported[index];}
  // gameKey = the key the stage flow wants now ("" = no game music). Result = the music key to play ("" = none).
  public static string Resolve(string gameKey,string track)
  {
   if(string.IsNullOrEmpty(gameKey))return "";
   string t=Effective(track);
   if(t=="auto"||gameKey=="death"||gameKey=="victory")return gameKey;
   return t;
  }
 }
}
