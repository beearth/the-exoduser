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
  // Same values as the en row of Resources/Data/stageclear_labels.json; used only when the data file is missing or broken.
  static readonly Row builtInEnglish=new Row{code="en",demoSub="The Rotten Forest is not finished yet.",demoNext="End of Demo",demoWishlist="Wishlist the full game"};
  static Bundle Load(){
   if(bundle!=null)return bundle;
   var asset=Resources.Load<TextAsset>("Data/stageclear_labels");
   if(asset==null||string.IsNullOrEmpty(asset.text))return null;
   try{var parsed=JsonUtility.FromJson<Bundle>(asset.text);if(parsed!=null&&parsed.entries!=null)bundle=parsed;}catch(Exception){}
   return bundle;
  }
  // Order: requested language -> en -> ko -> built-in English. Never returns null, never throws.
  public static Row ForLocale(string locale){
   var data=Load();
   if(data!=null){
    string code=LobbyLanguage.Normalize(locale);Row english=null,korean=null;
    foreach(var row in data.entries){if(row==null||string.IsNullOrEmpty(row.code))continue;if(row.code==code)return row;if(row.code=="en")english=row;else if(row.code=="ko")korean=row;}
    if(english!=null)return english;
    if(korean!=null)return korean;
   }
   return builtInEnglish;
  }
 }
}
