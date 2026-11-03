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
        public static int VerifyNearestSurface()
        {
            var format=SystemInfo.SupportsBlendingOnRenderTextureFormat(RenderTextureFormat.RFloat)?RenderTextureFormat.RFloat:RenderTextureFormat.ARGBHalf;var target=new RenderTexture(64,64,0,format);target.Create();var old=RenderTexture.active;var image=new Texture2D(64,64,TextureFormat.RGBAFloat,false,true);var mesh=new Mesh();mesh.vertices=new[]{new Vector3(-.8f,-.8f,-.25f),new Vector3(.8f,-.8f,-.25f),new Vector3(-.8f,.8f,-.25f),new Vector3(.8f,.8f,-.25f)};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateNormals();mesh.RecalculateTangents();
            try{foreach(var name in new[]{"LitOpaque","CardOpaque"}){var m=new Material(Resources.Load<Shader>("A2R/"+name));var cmd=new UnityEngine.Rendering.CommandBuffer();try{int pass=m.FindPass("A2RNearest");if(pass<0)throw new Exception("A2R nearest pass absent: "+name);cmd.SetRenderTarget(target);cmd.SetViewport(new Rect(0,0,64,64));cmd.ClearRenderTarget(false,true,new Color(100,100,100,100));cmd.SetGlobalMatrix("_A2RNearestVP",Matrix4x4.Scale(new Vector3(1,1,-1)));cmd.SetGlobalMatrix("_A2RNearestView",Matrix4x4.identity);cmd.DrawMesh(mesh,Matrix4x4.identity,m,0,pass);Graphics.ExecuteCommandBuffer(cmd);RenderTexture.active=target;image.ReadPixels(new Rect(0,0,64,64),0,0);image.Apply();float actual=image.GetPixel(32,32).r;if(Mathf.Abs(actual-.25f)>.01f)throw new Exception("A2R nearest GPU probe failed: "+name+" actual="+actual+" format="+format);Debug.Log("A2R_NEAREST_GPU_PASS "+name+" depth="+actual+" format="+format);}finally{cmd.Release();UnityEngine.Object.DestroyImmediate(m);}}}
            finally{RenderTexture.active=old;target.Release();UnityEngine.Object.DestroyImmediate(target);UnityEngine.Object.DestroyImmediate(image);UnityEngine.Object.DestroyImmediate(mesh);}return 0;
        }
        public static int Build()
        {
            var args=Exoduser.DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-output");if(at<0)throw new Exception("A2R output missing");string output=args[at+1];Directory.CreateDirectory(output);
            foreach(var name in new[]{"CardOpaque","CardFade","LitOpaque","LitFade","GroundPainting","DistanceHaze","HeroReadability","FootLight"}){var shader=Resources.Load<Shader>("A2R/"+name);if(shader==null)throw new Exception("A2R shader missing: "+name);if(ShaderUtil.ShaderHasError(shader)){foreach(var message in ShaderUtil.GetShaderMessages(shader))Debug.LogError(name+":"+message.line+":"+message.message);throw new Exception("A2R shader error: "+name);}}
            VerifyNearestSurface();
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
