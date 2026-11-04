using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public static class NativePetBubbleCatalog
 {
  [Serializable] sealed class Entry{public string key;public string[] texts;}
  [Serializable] sealed class Bundle{public string[] codes;public NativePetBubbleCue[] cues;public Entry[] entries;}
  static readonly Dictionary<string,NativePetBubbleCue> cues=new Dictionary<string,NativePetBubbleCue>();
  static readonly Dictionary<string,string[]> entries=new Dictionary<string,string[]>();
  static string[] codes;
  static void Load()
  {
   if(codes!=null)return;
   var asset=Resources.Load<TextAsset>("Data/pet_bubble");if(asset==null)throw new InvalidOperationException("Missing pet bubble catalogue");
   var bundle=JsonUtility.FromJson<Bundle>(asset.text);
   if(bundle.codes==null||bundle.codes.Length!=29)throw new InvalidOperationException("Pet locales incomplete");
   foreach(var entry in bundle.entries){if(entry.texts.Length!=29)throw new InvalidOperationException(entry.key);entries.Add(entry.key,entry.texts);}
   foreach(var cue in bundle.cues)cues.Add(cue.id,cue);
   codes=bundle.codes;
  }
  public static NativePetBubbleCue Cue(string id){Load();return cues.TryGetValue(id,out var cue)?cue:null;}
  public static string Text(string key,string locale)
  {
   Load();if(key==null||!entries.TryGetValue(key,out var values))return "";
   int index=Array.IndexOf(codes,LobbyLanguage.Normalize(locale));if(index<0)index=Array.IndexOf(codes,"en");
   return values[index];
  }
 }
}
