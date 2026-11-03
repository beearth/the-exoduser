using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
namespace Exoduser
{
    public static class A2RBuilder
    {
        [Serializable] sealed class Receipt{public string result;public int errors;public ulong bytes;}
        public static int Build()
        {
            var args=Exoduser.DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-output");if(at<0)throw new Exception("A2R output missing");string output=args[at+1];Directory.CreateDirectory(output);
            foreach(var name in new[]{"CardOpaque","CardFade","LitOpaque","LitFade","GroundPainting"}){var shader=Resources.Load<Shader>("A2R/"+name);if(shader==null||ShaderUtil.ShaderHasError(shader))throw new Exception("A2R shader error: "+name);}
            var target=Application.platform==RuntimePlatform.OSXEditor?BuildTarget.StandaloneOSX:BuildTarget.StandaloneWindows64;
            var player=target==BuildTarget.StandaloneOSX?"EXODUSER-A2R.app":"EXODUSER-A2R.exe";
            var r=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{"Assets/Scenes/FirstPlayable.unity","Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity"},locationPathName=Path.Combine(output,player),target=target,options=BuildOptions.None});
            File.WriteAllText(Path.Combine(output,"build.json"),JsonUtility.ToJson(new Receipt{result=r.summary.result.ToString(),errors=r.summary.totalErrors,bytes=r.summary.totalSize},true));return r.summary.result==BuildResult.Succeeded?0:2;
        }
    }
    public sealed class A2RWebTextureImport : AssetPostprocessor
    {
        void OnPreprocessTexture(){bool full=assetPath.StartsWith("Assets/Exoduser/Resources/A2R/C10/Art/",StringComparison.Ordinal);if(!full&&!assetPath.StartsWith("Assets/Exoduser/Resources/A2R/Web/",StringComparison.Ordinal))return;var t=(TextureImporter)assetImporter;t.textureType=TextureImporterType.Default;t.sRGBTexture=!assetPath.EndsWith("_normal.png",StringComparison.Ordinal)&&!assetPath.EndsWith("_mask.png",StringComparison.Ordinal);t.alphaIsTransparency=t.sRGBTexture;t.mipmapEnabled=true;t.isReadable=false;t.npotScale=TextureImporterNPOTScale.None;t.filterMode=FilterMode.Trilinear;t.anisoLevel=8;t.textureCompression=TextureImporterCompression.Uncompressed;t.maxTextureSize=full?2048:4096;t.wrapMode=assetPath.Contains("r3_water")||assetPath.Contains("r3_litter")||assetPath.Contains("r3_soil")||assetPath.Contains("r4_tex_")?TextureWrapMode.Repeat:TextureWrapMode.Clamp;}
    }
}
