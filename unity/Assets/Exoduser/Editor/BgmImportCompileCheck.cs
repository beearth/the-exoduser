using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort.Editor
{
 // Public-runner compile/import gate. Never enters Play Mode or plays audio.
 public static class BgmImportCompileCheck
 {
  public static void Run()
  {
   if(EditorApplication.isCompiling||EditorUtility.scriptCompilationFailed||EditorApplication.isPlaying)
    throw new InvalidOperationException("BGM compile/import gate requires successful compilation outside Play Mode");
   string[] clips={"death_alt","victory_alt","forge_vengeance","forge_vengeance_alt","forge_anvil_ashes","hell1_rot_neon_hellfire","hell1_rot_neon_hellfire_2","hell1_rot_wrath_golden_age"};
   const string root="Assets/Exoduser/Resources/Audio/Bgm/";
   var reference=(AudioImporter)AssetImporter.GetAtPath(root+"hell1_rot_iron_oath.mp3");
   var expected=reference.defaultSampleSettings;
   foreach(string name in clips)
   {
    var clip=AssetDatabase.LoadAssetAtPath<AudioClip>(root+name+".mp3");
    if(clip==null||clip.samples<=0||clip.length<1)throw new InvalidOperationException("Missing/invalid imported BGM: "+name);
    var importer=(AudioImporter)AssetImporter.GetAtPath(root+name+".mp3");var actual=importer.defaultSampleSettings;
    if(actual.loadType!=expected.loadType||actual.compressionFormat!=expected.compressionFormat||actual.quality!=expected.quality||importer.loadInBackground!=reference.loadInBackground)
     throw new InvalidOperationException("P0 importer mismatch: "+name);
   }
   string[] args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-bgmImportReceipt");
   if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1]))throw new InvalidOperationException("Absolute -bgmImportReceipt required");
   Directory.CreateDirectory(Path.GetDirectoryName(args[at+1]));
   File.WriteAllText(args[at+1],"{\"compiled\":true,\"errors\":0,\"importedClips\":8,\"audioPlayed\":false,\"playerRun\":false}");
   Debug.Log("BGM_IMPORT_P1_COMPILE_OK: 8 imports; no playback/build/Player");
  }
 }
}
