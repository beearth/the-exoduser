using System;

namespace Exoduser.UnityPort.Core
{
 // Web optBgmTrack (game.html 49436 + BGM.play gate 4282-4283): "auto" follows the stage key; a chosen key replaces the in-game track
 // (death and victory keep playing their own song); "t:<file>" plays that one file in a loop (web BGM.playTrack); "allRandom" needs the web's shuffler.
 // Unity only owns these songs: auto, lobby (Audio/Lobby/lobby), hell1, boss, death, victory and the three 1-1 field rotation songs
 // (web act-1 folder "Remastered" wav files -> Audio/Bgm/hell1_rot_*). Every other value in the menu list falls back to auto.
 public static class NativeBgmSelection
 {
  const string Act1 = "t:bgm/1\uC7A5_\uC369\uC740\uC232/";
  public const string AshesValue = Act1 + "Ashes Under the Banner (Remastered).wav";
  public const string CathedralValue = Act1 + "Cathedral of Steel (Remastered).wav";
  public const string IronOathValue = Act1 + "Iron Oath Under Ash (Remastered).wav";
  static readonly string[] supported={"auto","lobby","hell1","boss","death","victory",AshesValue,CathedralValue,IronOathValue};
  // menu value -> Audio/Bgm clip for the t: values (same order as NativeBgmRotation.Tracks)
  static readonly string[] clipOf={NativeBgmRotation.AshesClip,NativeBgmRotation.CathedralClip,NativeBgmRotation.IronOathClip};
  public static bool IsSupported(string value){return Array.IndexOf(supported,value)>=0;}
  public static string Effective(string value){return IsSupported(value)?value:"auto";}
  public static bool IsAuto(string value){return Effective(value)=="auto";}
  public static int SupportedCount{get{return supported.Length;}}
  public static string SupportedAt(int index){return supported[index];}
  // The Audio/Bgm clip a menu value plays ("t:" values map to their file, plain keys are their own clip name).
  public static string ClipFor(string value)
  {
   int i=Array.IndexOf(supported,value);
   return i>=6?clipOf[i-6]:value;
  }
  // gameKey = the key the stage flow wants now ("" = no game music). Result = the music key to play ("" = none).
  public static string Resolve(string gameKey,string track)
  {
   if(string.IsNullOrEmpty(gameKey))return "";
   string t=Effective(track);
   if(t=="auto"||gameKey=="death"||gameKey=="victory")return gameKey;
   return ClipFor(t);
  }
 }
}
