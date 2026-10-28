// DevTools: WebGL build for a private browser preview (this branch only; never merge into unity/main).
// Usage: Unity -batchmode -quit -buildTarget WebGL -projectPath <wt>/unity -executeMethod Exoduser.DevTools.WebBuild.Run -outDir <dir> [-receipt <json>] [-api webgpu|webgl2|both]
using System;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.DevTools
{
    public static class WebBuild
    {
        const string ScenePath = "Assets/Scenes/FirstPlayable.unity"; // same single scene as the PC verification build (PortVerification.MakeScene)

        static string Arg(string key)
        {
            var a = Environment.GetCommandLineArgs();
            var i = Array.IndexOf(a, key);
            return i >= 0 && i + 1 < a.Length ? a[i + 1] : "";
        }

        public static void Run()
        {
            int exit = 2;
            try
            {
                var outDir = Arg("-outDir");
                if (string.IsNullOrEmpty(outDir)) throw new ArgumentException("-outDir required");
                var receipt = Arg("-receipt");
                var api = Arg("-api");
                if (string.IsNullOrEmpty(api)) api = "both";

                if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL)
                    throw new InvalidOperationException("Pass -buildTarget WebGL (active=" + EditorUserBuildSettings.activeBuildTarget + ")");

                // Graphics API: WebGPU first, WebGL2 fallback.
                PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.WebGL, false);
                GraphicsDeviceType[] apis =
                    api == "webgl2" ? new[] { GraphicsDeviceType.OpenGLES3 } :
                    api == "webgpu" ? new[] { GraphicsDeviceType.WebGPU } :
                    new[] { GraphicsDeviceType.WebGPU, GraphicsDeviceType.OpenGLES3 };
                PlayerSettings.SetGraphicsAPIs(BuildTarget.WebGL, apis);

                // Build data is ~800 MB raw (textures are forced uncompressed by SourceTextureImporter) -> Brotli by default.
                // The host must send Content-Encoding: br for *.br (see vercel.json / smoke.mjs). -compression none|gzip|br
                var comp = Arg("-compression");
                PlayerSettings.WebGL.compressionFormat = comp == "none" ? WebGLCompressionFormat.Disabled : comp == "gzip" ? WebGLCompressionFormat.Gzip : WebGLCompressionFormat.Brotli;
                PlayerSettings.WebGL.decompressionFallback = false;
                PlayerSettings.WebGL.threadsSupport = false;
                PlayerSettings.WebGL.dataCaching = true;
                PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.None;
                PlayerSettings.WebGL.debugSymbolMode = WebGLDebugSymbolMode.Off;
                PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.WebGL, ManagedStrippingLevel.Medium);
                PlayerSettings.SetIl2CppCodeGeneration(NamedBuildTarget.WebGL, Il2CppCodeGeneration.OptimizeSize);
                PlayerSettings.runInBackground = true;

                if (!File.Exists(ScenePath)) throw new FileNotFoundException(ScenePath);
                Directory.CreateDirectory(outDir);

                var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                {
                    scenes = new[] { ScenePath },
                    locationPathName = outDir,
                    target = BuildTarget.WebGL,
                    options = BuildOptions.None
                });
                bool ok = report.summary.result == BuildResult.Succeeded;
                int droppedVideos = 0;
                if (ok && Arg("-keepVideos") != "true")
                {
                    // 4K lobby/intro mp4 (~50 MB) are not shipped to the web preview; the lobby must advance without them.
                    var lobby = Path.Combine(outDir, "StreamingAssets", "Lobby");
                    if (Directory.Exists(lobby))
                        foreach (var f in Directory.GetFiles(lobby, "*.mp4")) { File.Delete(f); droppedVideos++; }
                }
                var sb = new StringBuilder();
                sb.Append("{\"passed\":").Append(ok ? "true" : "false")
                  .Append(",\"result\":\"").Append(report.summary.result).Append("\"")
                  .Append(",\"errors\":").Append(report.summary.totalErrors)
                  .Append(",\"bytes\":").Append(report.summary.totalSize)
                  .Append(",\"droppedVideos\":").Append(droppedVideos).Append(",\"api\":\"").Append(api).Append("\"").Append(",\"compression\":\"").Append(PlayerSettings.WebGL.compressionFormat).Append("\"")
                  .Append(",\"engine\":\"").Append(Application.unityVersion).Append("\"");
                sb.Append(",\"topAssets\":[");
                var packed = report.packedAssets.SelectMany(p => p.contents).OrderByDescending(c => (long)c.packedSize).Take(40).ToArray();
                for (int i = 0; i < packed.Length; i++)
                {
                    if (i > 0) sb.Append(',');
                    sb.Append("{\"path\":\"").Append(packed[i].sourceAssetPath.Replace("\\", "/")).Append("\",\"packed\":").Append(packed[i].packedSize).Append('}');
                }
                sb.Append("]}");
                if (!string.IsNullOrEmpty(receipt)) File.WriteAllText(receipt, sb.ToString());
                Debug.Log("UNITY_WEB_BUILD " + report.summary.result + " bytes=" + report.summary.totalSize);
                exit = ok ? 0 : 2;
            }
            catch (Exception e) { Debug.LogException(e); }
            EditorApplication.Exit(exit);
        }
    }
}
