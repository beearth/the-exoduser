using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public static class NativeFlavorStorage
 {
  static string cachedKey,cachedDirectory;static bool cachedOk;
  public static bool TryResolve(out string directory)
  {
   var flavor=BuildFlavor.Current;bool qa=NativeQaSandbox.Active;
   string root=qa?NativeQaSandbox.Root:Application.persistentDataPath;
   string ns=flavor.SaveNamespace;
   if(string.IsNullOrEmpty(ns))ns="EXODUSER-HELL-"+flavor.Name.ToUpperInvariant();
   string key=root+"|"+ns;
   if(cachedKey!=key){
    cachedKey=key;string error;string[] legacy=new string[0];
    // Derive from Unity's actual path; never guess its sanitized official product folder.
    if(!qa)legacy=NativeFlavorSavePaths.LegacyRoots(root,Application.companyName,Application.platform==RuntimePlatform.OSXPlayer||Application.platform==RuntimePlatform.OSXEditor);
    cachedOk=NativeFlavorSavePaths.TryPrepare(root,ns,flavor.Id==BuildFlavor.Kind.Full,legacy,qa,out cachedDirectory,out error);
    if(!cachedOk)Debug.LogError("Flavor save storage unavailable; original saves preserved: "+error);
   }
   directory=cachedOk?cachedDirectory:"";return cachedOk;
  }
 }
}
