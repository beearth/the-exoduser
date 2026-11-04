using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // STY-23: existing web keys, 29 locales. No global locale state or Korean-only glyph atlas.
 public static class NativeDemoText
 {
  [Serializable] sealed class Entry {public string key;public string[] texts;}
  [Serializable] sealed class Line {public string key,text;}
  [Serializable] sealed class Bundle {public string[] codes;public Entry[] entries;public Line[] bossLines;}
  static readonly Dictionary<string,string[]> entries=new Dictionary<string,string[]>();
  static readonly Dictionary<string,string> bossLines=new Dictionary<string,string>();
  static string[] codes;static bool loaded;
  static void Load()
  {
   if(loaded)return;
   var asset=Resources.Load<TextAsset>("Data/demo_text");
   if(asset==null)throw new InvalidOperationException("Missing demo_text locale resource");
   var data=JsonUtility.FromJson<Bundle>(asset.text);codes=data.codes;
   foreach(var entry in data.entries){if(entry.texts.Length!=codes.Length)throw new InvalidOperationException("Incomplete demo text: "+entry.key);entries.Add(entry.key,entry.texts);}
   foreach(var line in data.bossLines)bossLines.Add(line.key,line.text);loaded=true;
  }
  public static string Get(string key,string locale,string fallback=null)
  {
   return NativeLocaleCatalog.Get("demo_text",key,locale,key,fallback);
  }
  public static string BossLine(string key,string locale)
  {
   Load();return bossLines.TryGetValue(key,out var text)?Get(text,locale):null;
  }
  internal static GUIStyle Style(GUIStyle source,string text)
  {
   return new GUIStyle(source){font=NativeSilverHellUi.TextFont(source.font,text),clipping=TextClipping.Clip};
  }
  internal static void Label(Rect rect,string text,GUIStyle style,string paintId=null)
  {
   if(string.IsNullOrEmpty(text))return;
   var s=Style(style,text);
   if(NativeDemoArabicText.Draw(rect,text,s,paintId))return;
   NativeSilverHellUi.Label(rect,text,s);
  }
 }
}
