using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Web settings strings in the 29 web languages, read from the live game.html DOM after the web's own language switch
 // (tools: web-labels dump -> Resources/Data/a15_options_web.json). Lists use U+0001 as the item separator.
 public static class NativeOptionText
 {
  [Serializable] sealed class Entry { public string key;public string[] texts; }
  [Serializable] sealed class Bundle { public string sourceCommit;public string[] codes;public Entry[] entries; }
  static readonly Dictionary<string,string[]> byKey=new Dictionary<string,string[]>();
  static string[] codes=new string[0];
  static bool tried,loaded;
  public static bool Loaded { get { Ensure();return loaded; } }
  public static int EntryCount { get { Ensure();return byKey.Count; } }
  static void Ensure()
  {
   if(tried)return;tried=true;
   try {
    var asset=Resources.Load<TextAsset>("Data/a15_options_web");
    if(asset==null)throw new InvalidOperationException("missing option label resource");
    var data=JsonUtility.FromJson<Bundle>(asset.text);
    if(data==null||data.codes==null||data.entries==null)throw new InvalidOperationException("bad option label resource");
    codes=data.codes;
    foreach(var entry in data.entries){if(entry==null||string.IsNullOrEmpty(entry.key)||entry.texts==null||entry.texts.Length!=codes.Length)throw new InvalidOperationException("bad option label entry");byKey[entry.key]=entry.texts;}
    loaded=true;
   } catch(Exception error) { byKey.Clear();loaded=false;Debug.LogWarning("A15_OPTION_TEXT_FALLBACK "+error.Message); }
  }
  // Per-key locale -> EN -> KO, then the caller's source fallback. Never show an internal key.
  public static string Get(string key,string locale,string fallback="")
  {
   return NativeLocaleCatalog.Get("a15_options_web",key,locale,fallback,fallback);
  }
  public static string[] List(string key,string locale)
  {
   string value=Get(key,locale,"");
   return value.Length==0?new string[0]:value.Split('\u0001');
  }
  // "1성 이하|4성 이하" style samples (v.fuse/v.enh): the suffix after the first digit for any count.
  public static string CountSuffix(string key,string locale)
  {
   string value=Get(key,locale,"");int bar=value.IndexOf('|');if(bar>0)value=value.Substring(0,bar);
   return value.Length>1?value.Substring(1):"";
  }
 }
}
