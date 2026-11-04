using System;

namespace Exoduser.UnityPort.Core
{
 // 1-1 field BGM rotation (web BGM._onEnded for hell1 + OPT.bgmTrack=='auto': the act song plays once, then the gameplay cue is shuffled).
 // Unity rule: hell1 once on field entry, then the three rotation songs in a shuffled order; when all three have played they are shuffled
 // again and the first song of the new round is never the song that just ended. Only used while the BGM select is "auto".
 public sealed class NativeBgmRotation
 {
  public const string FirstClip = "hell1";
  public const string AshesClip = "hell1_rot_ashes_banner", CathedralClip = "hell1_rot_cathedral_steel", IronOathClip = "hell1_rot_iron_oath";
  static readonly string[] tracks = { AshesClip, CathedralClip, IronOathClip };
  readonly Func<int, int> randomBelow;   // [0,n)
  string[] order; int pos; string current = FirstClip;
  public NativeBgmRotation(Func<int, int> randomBelow) { this.randomBelow = randomBelow; }
  public static int TrackCount { get { return tracks.Length; } }
  public static string TrackAt(int index) { return tracks[index]; }
  public string Current { get { return current; } }
  // back to "field entry": the next song to play is hell1 again
  public void Reset() { current = FirstClip; order = null; pos = 0; }
  // the song that ended -> the song to play next
  public string Advance()
  {
   if (order == null || pos >= order.Length) Shuffle();
   current = order[pos++];
   return current;
  }
  void Shuffle()
  {
   order = (string[])tracks.Clone();
   for (int i = order.Length - 1; i > 0; i--) { int j = randomBelow(i + 1); string t = order[i]; order[i] = order[j]; order[j] = t; }
   if (order[0] == current && order.Length > 1)   // no immediate repeat across the round boundary
   { int j = 1 + randomBelow(order.Length - 1); string t = order[0]; order[0] = order[j]; order[j] = t; }
   pos = 0;
  }
 }
}
