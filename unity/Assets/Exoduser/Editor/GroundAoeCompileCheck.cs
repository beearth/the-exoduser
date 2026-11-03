using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort.Editor
{
    // PC handoff gate only. Does not build, enter Play Mode or render a fixture.
    public static class GroundAoeCompileCheck
    {
        public static void Run()
        {
            if(!Application.isBatchMode||EditorApplication.isCompiling)throw new InvalidOperationException("Batch compilation must finish before the gate");
            string[] shaders={"GroundSkillProjection","GroundSkillReceiverDepth","A2ToxicRiver"};
            foreach(string name in shaders)
            {
                var shader=AssetDatabase.LoadAssetAtPath<Shader>("Assets/Exoduser/Resources/Shaders/"+name+".shader");
                if(shader==null||ShaderUtil.ShaderHasError(shader))throw new InvalidOperationException("Ground shader import failed: "+name);
            }
            var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");
            if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1]))throw new InvalidOperationException("Absolute compile receipt path required");
            Directory.CreateDirectory(Path.GetDirectoryName(args[at+1]));
            File.WriteAllText(args[at+1],"{\"passed\":true,\"compileOnly\":true,\"shaderImports\":3,\"visualVerified\":false,\"playerRun\":false}");
            Debug.Log("GROUND_AOE_P0_COMPILE_OK: compilation and3 shader imports; no build/Player/visual gate");
        }
    }
}
