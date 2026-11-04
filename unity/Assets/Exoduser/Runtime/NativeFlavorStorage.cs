using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public static class NativeFlavorStorage
 {
  // Folder name of a namespaced flavor's saves under the persistent (or QA sandbox) root. Full does not use it outside QA.
  public static string Namespace
  {
   get{var flavor=BuildFlavor.Current;string ns=flavor.SaveNamespace;return string.IsNullOrEmpty(ns)?"EXODUSER-HELL-"+flavor.Name.ToUpperInvariant():ns;}
  }
  static NativeFlavorSavePaths.RootKind PlatformKind()
  {
   switch(Application.platform){
    case RuntimePlatform.WindowsPlayer:return NativeFlavorSavePaths.RootKind.Windows;
    case RuntimePlatform.OSXPlayer:return NativeFlavorSavePaths.RootKind.MacPlayer;
    default:return NativeFlavorSavePaths.RootKind.Other;
   }
  }
  // Chosen by platform and flavor only; nothing probes whether a folder exists. QA sandbox never sees the real root.
  public static bool TryResolve(out string directory)
  {
   directory="";
   try{
    if(NativeQaSandbox.Active){directory=NativeFlavorSavePaths.NamespacedRoot(NativeQaSandbox.Root,Namespace);return true;}
    if(BuildFlavor.Current.Id==BuildFlavor.Kind.Full){
     if(!NativeFlavorSavePaths.UsesLegacyRoot(Application.productName)){directory=Path.GetFullPath(Application.persistentDataPath);return !string.IsNullOrWhiteSpace(directory);}
     string root=NativeFlavorSavePaths.FullRoot(Application.persistentDataPath,Application.companyName,PlatformKind());
     if(string.IsNullOrWhiteSpace(root)||!Path.IsPathRooted(root))return false;
     directory=Path.GetFullPath(root);return true;
    }
    directory=NativeFlavorSavePaths.NamespacedRoot(Application.persistentDataPath,Namespace);return true;
   }catch(Exception e){
    if(!(e is ArgumentException||e is NotSupportedException||e is PathTooLongException||e is System.Security.SecurityException))throw;
    Debug.LogError("Flavor save storage unavailable: "+e.Message);directory="";return false;
   }
  }
 }
}
