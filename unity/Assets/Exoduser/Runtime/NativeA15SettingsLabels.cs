using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Only the 43 exact IDs approved by the PC A15 label oracle are present in this resource.
 // Semantic and native-only copy continues through each caller's original ko/en fallback.
 public static class NativeA15SettingsLabels
 {
  [Serializable] sealed class LocaleText { public string code,text; }
  [Serializable] sealed class Entry { public string id,nativeKo,nativeEn;public LocaleText[] locales; }
  [Serializable] sealed class Bundle { public string sourceCommit,candidateSha256,qaSha256;public Entry[] entries; }
  static readonly Dictionary<string,Dictionary<string,string>> byId=new Dictionary<string,Dictionary<string,string>>();
  static readonly Dictionary<string,string> keyIdByKo=new Dictionary<string,string>();
  static bool tried,loaded;
  public static bool Loaded { get { EnsureLoaded();return loaded; } }
  public static int EntryCount { get { EnsureLoaded();return byId.Count; } }

  static void EnsureLoaded()
  {
   if(tried)return;tried=true;
   try {
    var asset=Resources.Load<TextAsset>("Data/a15_settings_labels_exact");
    if(asset==null)throw new InvalidOperationException("missing exact label resource");
    var data=JsonUtility.FromJson<Bundle>(asset.text);
    if(data==null||data.sourceCommit!="766250b64d833acd4172c83fb694820777d68b1b"||data.entries==null||data.entries.Length!=43)
     throw new InvalidOperationException("unexpected A15 label source or ID count");
    foreach(var entry in data.entries){
     if(entry==null||string.IsNullOrEmpty(entry.id)||entry.locales==null||byId.ContainsKey(entry.id))throw new InvalidOperationException("invalid A15 label entry");
     var values=new Dictionary<string,string>();
     foreach(var value in entry.locales){
      if(value==null||string.IsNullOrEmpty(value.code)||string.IsNullOrEmpty(value.text)||values.ContainsKey(value.code))throw new InvalidOperationException("invalid A15 locale value");
      values.Add(value.code,value.text);
     }
     byId.Add(entry.id,values);
     if(entry.id.StartsWith("key.",StringComparison.Ordinal)&&!string.IsNullOrEmpty(entry.nativeKo)){
      if(keyIdByKo.ContainsKey(entry.nativeKo))throw new InvalidOperationException("ambiguous A15 key label");
      keyIdByKo.Add(entry.nativeKo,entry.id);
     }
    }
    loaded=true;
   } catch(Exception error) {
    byId.Clear();keyIdByKo.Clear();loaded=false;
    Debug.LogWarning("A15_LABEL_RESOURCE_FALLBACK "+error.Message);
   }
  }

  public static string Get(string id,string locale,string ko,string en)
  {
   string fallback=locale=="ko"?ko:en;
   if(locale=="ko"||locale=="en"||locale=="ar")return fallback;
   EnsureLoaded();
   Dictionary<string,string> values;string translated;
   return loaded&&byId.TryGetValue(id,out values)&&values.TryGetValue(LobbyLanguage.Normalize(locale),out translated)?translated:fallback;
  }

  // Narrow adapter ready for the PC-owned NativeKeyBindList seam; no product call site yet.
  public static string GetKeyByKo(string originalKo,string locale,string fallback)
  {
   EnsureLoaded();string id;
   return loaded&&originalKo!=null&&keyIdByKo.TryGetValue(originalKo,out id)?Get(id,locale,originalKo,fallback):fallback;
  }
 }
}
