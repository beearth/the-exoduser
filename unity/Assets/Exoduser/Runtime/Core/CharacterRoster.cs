using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort.Core
{
 public enum CharacterCreateError { None, Locked, NameLength, Forbidden, Duplicate, Full }
 // Disposable frontend identities only. No disk, account, save or progression access.
 public sealed class CharacterRoster
 {
  public const int Capacity=5;
  readonly List<string> names=new List<string>();
  public int Count {get{return names.Count;}}
  public int SelectedIndex {get;private set;}=-1;
  public string SelectedName {get{return NameAt(SelectedIndex);}}
  public string NameAt(int index){return index>=0&&index<Count?names[index]:"";}
  public bool Select(int index){if(index<0||index>=Count)return false;SelectedIndex=index;return true;}
  public bool TryRemove(int index)
  {
   if(index<0||index>=Count)return false;
   names.RemoveAt(index);
   if(Count==0)SelectedIndex=-1;
   else if(index<SelectedIndex)SelectedIndex--;
   else if(index==SelectedIndex)SelectedIndex=Math.Min(index,Count-1);
   return true;
  }
  public void Clear(){names.Clear();SelectedIndex=-1;}
  // Validate a complete candidate before replacing live memory. -1 also means
  // no selection in a nonempty list; malformed/unnormalized stored names fail.
  public bool TryRestore(string[] restoredNames,int selectedIndex)
  {
   if(restoredNames==null||restoredNames.Length>Capacity||selectedIndex<-1||selectedIndex>=restoredNames.Length)return false;
   var candidate=new CharacterRoster();
   foreach(string name in restoredNames)if(name!=TrimName(name)||!candidate.TryCreate(name,0,out _))return false;
   names.Clear();names.AddRange(candidate.names);SelectedIndex=selectedIndex;return true;
  }
  // ECMAScript trim / UTF-16 length, matching the offline source name handler.
  static bool JsWhitespace(char c){return c=='\t'||c=='\n'||c=='\v'||c=='\f'||c=='\r'||c==' '||c=='\u00a0'||c=='\u1680'||(c>='\u2000'&&c<='\u200a')||c=='\u2028'||c=='\u2029'||c=='\u202f'||c=='\u205f'||c=='\u3000'||c=='\ufeff';}
  public static string TrimName(string raw){if(raw==null)return "";int first=0,last=raw.Length;while(first<last&&JsWhitespace(raw[first]))first++;while(last>first&&JsWhitespace(raw[last-1]))last--;return raw.Substring(first,last-first);}
  public CharacterCreateError Validate(string raw,int visualIndex=0)
  {
   if(visualIndex!=0)return CharacterCreateError.Locked;
   string name=TrimName(raw);
   if(name.Length<2||name.Length>8)return CharacterCreateError.NameLength;
   if(name.IndexOfAny(new[]{'<','>','"','\'','&','/','\\'})>=0)return CharacterCreateError.Forbidden;
   foreach(string existing in names)if(string.Equals(existing,name,StringComparison.Ordinal))return CharacterCreateError.Duplicate;
   return Count>=Capacity?CharacterCreateError.Full:CharacterCreateError.None;
  }
  public bool TryCreate(string raw,int visualIndex,out CharacterCreateError error)
  {
   error=Validate(raw,visualIndex);if(error!=CharacterCreateError.None)return false;
   names.Add(TrimName(raw));SelectedIndex=Count-1;return true;
  }
 }
 [Serializable] public sealed class CharacterCatalog {public string sourceSha256;public CharacterVisual[] visuals;}
 [Serializable] public sealed class CharacterVisual {public string id,name,job,description;public bool locked;}
}
