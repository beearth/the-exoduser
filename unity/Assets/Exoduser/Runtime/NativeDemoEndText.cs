using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public static class NativeDemoEndText
 {
  [Serializable] public sealed class Row {public string code,demoSub,demoNext,demoWishlist;}
  [Serializable] sealed class Bundle {public Row[] entries;}
  static Bundle bundle;
  public static Row ForLocale(string locale){
   if(bundle==null)bundle=JsonUtility.FromJson<Bundle>(Resources.Load<TextAsset>("Data/stageclear_labels").text);
   string code=LobbyLanguage.Normalize(locale);Row english=null;
   foreach(var row in bundle.entries){if(row.code==code)return row;if(row.code=="en")english=row;}
   return english;
  }
 }
}
