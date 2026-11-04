using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Presentation catalog extends the existing Core selection without changing Core files or rules.
 public static class NativeBgmCatalog
 {
  const string Act1="t:bgm/1\uC7A5_\uC369\uC740\uC232/", Common="t:bgm/\uACF5\uD1B5/";
  public const string AshesValue=NativeBgmSelection.AshesValue, CathedralValue=NativeBgmSelection.CathedralValue, IronOathValue=NativeBgmSelection.IronOathValue;
  static readonly string[] extra={"forge",Common+"지옥 추락 사망 징글.mp3",Common+"탈출 성공.mp3",Common+"복수의 대장간.mp3",Common+"forge.mp3",Common+"Anvil Ashes.mp3",Act1+"Neon Hellfire Protocol (Remastered).wav",Act1+"Neon Hellfire Protocol2(Remastered).wav",Act1+"Wrath of the Golden Age (Remastered).wav"};
  static readonly string[] clips={"forge","death_alt","victory_alt","forge_vengeance","forge_vengeance_alt","forge_anvil_ashes","hell1_rot_neon_hellfire","hell1_rot_neon_hellfire_2","hell1_rot_wrath_golden_age"};
  public static bool IsSupported(string value){return NativeBgmSelection.IsSupported(value)||Array.IndexOf(extra,value)>=0;}
  public static string Effective(string value){return IsSupported(value)?value:"auto";}
  public static bool IsAuto(string value){return Effective(value)=="auto";}
  public static int SupportedCount{get{return NativeBgmSelection.SupportedCount+extra.Length;}}
  public static string SupportedAt(int index){return index<NativeBgmSelection.SupportedCount?NativeBgmSelection.SupportedAt(index):extra[index-NativeBgmSelection.SupportedCount];}
  public static string ClipFor(string value){int at=Array.IndexOf(extra,value);return at>=0?clips[at]:NativeBgmSelection.ClipFor(value);}
  public static string Resolve(string gameKey,string track)
  {
   // Delegate every original/unsupported value to the unchanged P0 policy.
   if(Array.IndexOf(extra,track)<0)return NativeBgmSelection.Resolve(gameKey,track);
   if(string.IsNullOrEmpty(gameKey))return "";
   if(gameKey=="death"||gameKey=="victory")return gameKey;
   return ClipFor(track);
  }
 }

 public sealed class NativeFieldBgmRotation
 {
  public const string FirstClip=NativeBgmRotation.FirstClip;
  static readonly string[] tracks=MakeTracks();
  static string[] MakeTracks()
  {
   var all=new string[NativeBgmRotation.TrackCount+3];
   for(int i=0;i<NativeBgmRotation.TrackCount;i++)all[i]=NativeBgmRotation.TrackAt(i);
   all[all.Length-3]="hell1_rot_neon_hellfire";all[all.Length-2]="hell1_rot_neon_hellfire_2";all[all.Length-1]="hell1_rot_wrath_golden_age";return all;
  }
  readonly NativeBgmShuffle shuffle;string current=FirstClip;
  public NativeFieldBgmRotation(Func<int,int> randomBelow){shuffle=new NativeBgmShuffle(tracks,randomBelow);}
  public static int TrackCount{get{return tracks.Length;}}
  public static string TrackAt(int index){return tracks[index];}
  public string Current{get{return current;}}
  public void Reset(){current=FirstClip;shuffle.Reset();}
  public string Advance(){return current=shuffle.Next();}
 }

 // Shared shuffle bag for field and forge; no duplicate within a round or at its boundary.
 sealed class NativeBgmShuffle
 {
  readonly string[] tracks;readonly Func<int,int> randomBelow;string[] order;int pos;string last="";
  public NativeBgmShuffle(string[] tracks,Func<int,int> randomBelow){this.tracks=(string[])tracks.Clone();this.randomBelow=randomBelow;}
  public void Reset(){order=null;pos=0;last="";}
  public string Next()
  {
   if(order==null||pos>=order.Length)
   {
    order=(string[])tracks.Clone();
    for(int i=order.Length-1;i>0;i--){int j=randomBelow(i+1);string t=order[i];order[i]=order[j];order[j]=t;}
    if(order.Length>1&&order[0]==last){int j=1+randomBelow(order.Length-1);string t=order[0];order[0]=order[j];order[j]=t;}
    pos=0;
   }
   return last=order[pos++];
  }
 }
}
