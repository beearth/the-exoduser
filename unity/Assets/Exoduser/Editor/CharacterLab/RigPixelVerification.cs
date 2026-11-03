using System;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEditor;
using Exoduser.UnityPort;
namespace Exoduser.CharacterLab {
 public static class RigPixelVerification {
  public static void Verify(){
   var args=Environment.GetCommandLineArgs();string output="I:/EXODUSER-Storage/codex-takeover/rig-pixel/editor-check.json";
   for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
   var type=TypeCache.GetTypesDerivedFrom<MonoBehaviour>().FirstOrDefault(t=>t.FullName=="Exoduser.UnityPort.NativeRigPixelHero");
   var toon=Resources.Load<Shader>("Shaders/RigPixelToon");var composite=Resources.Load<Shader>("Shaders/RigPixelComposite");
   var prefab=Resources.Load<GameObject>("Characters/Warrior");var animator=prefab!=null?prefab.GetComponent<Animator>():null;
   bool renderer=type!=null&&typeof(MonoBehaviour).IsAssignableFrom(type);
   bool shaders=toon!=null&&composite!=null&&!ShaderUtil.ShaderHasError(toon)&&!ShaderUtil.ShaderHasError(composite);
   bool rig=animator!=null&&animator.avatar!=null&&animator.avatar.isValid&&animator.avatar.isHuman;
   bool ok=renderer&&shaders&&rig;
   Directory.CreateDirectory(Path.GetDirectoryName(output));File.WriteAllText(output,"{\"passed\":"+ok.ToString().ToLowerInvariant()+",\"renderer\":"+renderer.ToString().ToLowerInvariant()+",\"shaders\":"+shaders.ToString().ToLowerInvariant()+",\"humanoid\":"+rig.ToString().ToLowerInvariant()+"}");
   Debug.Log("RIGPIXEL_CONTRACT "+(ok?"PASS":"FAIL")+" renderer="+renderer+" shaders="+shaders+" humanoid="+rig);
   EditorApplication.Exit(ok?0:2);
  }
 }
}
