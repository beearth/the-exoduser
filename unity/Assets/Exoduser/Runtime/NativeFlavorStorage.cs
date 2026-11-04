using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public static class NativeFlavorStorage
 {
  static string cachedKey,cachedDirectory;static bool cachedOk;static bool importFailed;
  // True when the previous save folder could not be imported and this run started fresh (old files are untouched).
  public static bool ImportFailed{get{return importFailed;}}
  // Folder name of the current flavor's saves under the persistent (or QA sandbox) root.
  public static string Namespace
  {
   get{var flavor=BuildFlavor.Current;string ns=flavor.SaveNamespace;return string.IsNullOrEmpty(ns)?"EXODUSER-HELL-"+flavor.Name.ToUpperInvariant():ns;}
  }
  public static bool TryResolve(out string directory)
  {
   var flavor=BuildFlavor.Current;bool qa=NativeQaSandbox.Active;
   string root=qa?NativeQaSandbox.Root:Application.persistentDataPath;
   string ns=Namespace;
   string key=root+"|"+ns;
   if(cachedKey!=key||!cachedOk){
    cachedKey=key;string error;string[] legacy=new string[0];var report=new NativeFlavorSavePaths.PrepareReport();importFailed=false;
    // Derive from Unity's actual path; never guess its sanitized official product folder.
    if(!qa)legacy=NativeFlavorSavePaths.LegacyRoots(root,Application.companyName,Application.platform==RuntimePlatform.OSXPlayer||Application.platform==RuntimePlatform.OSXEditor);
    cachedOk=NativeFlavorSavePaths.TryPrepare(root,ns,flavor.Id==BuildFlavor.Kind.Full,legacy,qa,out cachedDirectory,out error,report);
    if(!cachedOk)Debug.LogError("Flavor save storage unavailable; original saves preserved: "+error);
    else{importFailed=report.ImportFailed;if(report.Notice.Length!=0)Debug.LogWarning("Flavor save storage: "+report.Notice);}
   }
   directory=cachedOk?cachedDirectory:"";return cachedOk;
  }
 }
}
