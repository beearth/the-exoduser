using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort.Editor
{
 // Public-runner PC compile receipt only. Does not enter Play Mode, build or render.
 public static class PetBubbleCompileCheck
 {
  public static void Run()
  {
   if(EditorApplication.isCompiling||EditorUtility.scriptCompilationFailed)
    throw new InvalidOperationException("Pet bubble compilation did not complete");
   if(EditorApplication.isPlaying)throw new InvalidOperationException("Compile gate must not enter Play Mode");
   const string output="I:/EXODUSER-Storage/codex-takeover/death-screen/pet-bubble-current/compile.json";
   Directory.CreateDirectory(Path.GetDirectoryName(output));
   File.WriteAllText(output,"{\"passed\":true,\"compileOnly\":true,\"playerRun\":false,\"build\":false,\"visualVerified\":false}");
   Debug.Log("PET_BUBBLE_COMPILE_OK: runtime/editor compilation only; no Player/build/visual verdict");
  }
 }
}
