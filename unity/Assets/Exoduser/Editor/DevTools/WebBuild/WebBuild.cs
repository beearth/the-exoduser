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


        // ---- Web-only size reduction (-slim true). PC import settings are never touched: only the "WebGL" platform override is written, and the CJK fonts are moved out of Assets for the build and moved back in finally. ----
        const string ResourcesRoot = "Assets/Exoduser/Resources";
        static readonly string[] CjkFonts = {
            "Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKjp-Regular.otf",
            "Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKsc-Regular.otf",
            "Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKtc-Regular.otf" };

        // maxSize <= 0 keeps the source size. The runtime reads Texture2D.width for sprite rects, so atlases must not shrink.
        public static int ApplyWebTextures(string maxSizeArg)
        {
            int maxSize = 8192; int.TryParse(maxSizeArg, out maxSize); if (maxSize <= 0) maxSize = 8192;
            var guids = AssetDatabase.FindAssets("t:Texture2D", new[] { ResourcesRoot });
            int n = 0;
            var wh = typeof(TextureImporter).GetMethod("GetWidthAndHeight", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            AssetDatabase.StartAssetEditing();
            try
            {
                foreach (var g in guids)
                {
                    var path = AssetDatabase.GUIDToAssetPath(g);
                    var imp = AssetImporter.GetAtPath(path) as TextureImporter;
                    if (imp == null) continue;
                    bool alpha = imp.DoesSourceTextureHaveAlpha();
                    var ps = imp.GetPlatformTextureSettings("WebGL");
                    ps.name = "WebGL"; ps.overridden = true; ps.maxTextureSize = maxSize;
                    ps.textureCompression = TextureImporterCompression.Compressed; ps.compressionQuality = 60; ps.crunchedCompression = true;
                    // DXT needs width/height multiples of 4 (WebGL S3TC); the rest (map chunks 1026, kiSlash 1254, ...) cannot change size because runtime rect code reads Texture2D.width -> ASTC (any size).
                    int w = 0, h = 0;
                    var args = new object[] { 0, 0 };
                    if (wh != null) { wh.Invoke(imp, args); w = (int)args[0]; h = (int)args[1]; }
                    bool dxtOk = wh != null && w % 4 == 0 && h % 4 == 0;
                    if (dxtOk) { ps.format = alpha ? TextureImporterFormat.DXT5Crunched : TextureImporterFormat.DXT1Crunched; ps.crunchedCompression = true; }
                    else if (Arg("-astc") == "true") { ps.format = path.Contains("/ui/") ? TextureImporterFormat.ASTC_4x4 : TextureImporterFormat.ASTC_6x6; ps.crunchedCompression = false; }
                    else ps.format = alpha ? TextureImporterFormat.DXT5Crunched : TextureImporterFormat.DXT1Crunched;
                    imp.SetPlatformTextureSettings(ps);
                    imp.SaveAndReimport();
                    n++;
                }
            }
            finally { AssetDatabase.StopAssetEditing(); }
            AssetDatabase.Refresh();
            return n;
        }

        // Per-texture report under the active WebGL target: format, size, runtime memory.
        public static string TextureReport()
        {
            var sb = new StringBuilder("path,w,h,format,memBytes\n"); long total = 0;
            var perFormat = new System.Collections.Generic.Dictionary<string, long>();
            foreach (var g in AssetDatabase.FindAssets("t:Texture2D", new[] { ResourcesRoot }))
            {
                var path = AssetDatabase.GUIDToAssetPath(g);
                var t = AssetDatabase.LoadAssetAtPath<Texture2D>(path); if (t == null) continue;
                long mem = UnityEngine.Profiling.Profiler.GetRuntimeMemorySizeLong(t);
                string fmt = t.format.ToString();
                sb.Append(path).Append(',').Append(t.width).Append(',').Append(t.height).Append(',').Append(fmt).Append(',').Append(mem).Append('\n');
                total += mem; long cur; perFormat.TryGetValue(fmt, out cur); perFormat[fmt] = cur + mem;
                Resources.UnloadAsset(t);
            }
            sb.Append("TOTAL,,,,").Append(total).Append('\n');
            foreach (var kv in perFormat) sb.Append("FORMAT ").Append(kv.Key).Append(",,,,").Append(kv.Value).Append('\n');
            return sb.ToString();
        }

        // Probe: apply overrides, import, dump the report, exit (no player build).
        public static void Probe()
        {
            int exit = 2;
            try
            {
                if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL) throw new InvalidOperationException("need -buildTarget WebGL");
                int n = ApplyWebTextures(Arg("-texMax"));
                File.WriteAllText(Arg("-probeOut"), TextureReport());
                Debug.Log("UNITY_WEB_PROBE textures=" + n); exit = 0;
            }
            catch (Exception e) { Debug.LogException(e); }
            EditorApplication.Exit(exit);
        }

        static string HoldDir { get { return Path.Combine(Directory.GetParent(Application.dataPath).FullName, "Library", "WebBuildHold"); } }
        static void HoldCjkFonts()
        {
            Directory.CreateDirectory(HoldDir);
            foreach (var f in CjkFonts)
                foreach (var ext in new[] { "", ".meta" })
                {
                    var src = f + ext; if (!File.Exists(src)) continue;
                    var dst = Path.Combine(HoldDir, Path.GetFileName(f) + ext);
                    if (File.Exists(dst)) File.Delete(dst);
                    File.Move(src, dst);
                }
            AssetDatabase.Refresh();
        }
        static void RestoreCjkFonts()
        {
            if (!Directory.Exists(HoldDir)) return;
            foreach (var f in CjkFonts)
                foreach (var ext in new[] { "", ".meta" })
                {
                    var dst = f + ext; var src = Path.Combine(HoldDir, Path.GetFileName(f) + ext);
                    if (File.Exists(src)) { if (File.Exists(dst)) File.Delete(dst); File.Move(src, dst); }
                }
            AssetDatabase.Refresh();
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
                PlayerSettings.WebGL.template = "PROJECT:Exoduser";   // Assets/WebGLTemplates/Exoduser (dark stage, gold hairline loader, no Unity logo)

                if (!File.Exists(ScenePath)) throw new FileNotFoundException(ScenePath);
                Directory.CreateDirectory(outDir);

                bool slim = Arg("-slim") == "true", fontsHeld = false;
                if (slim)
                {
                    int nTex = ApplyWebTextures(Arg("-texMax"));
                    var csv = TextureReport();
                    if (!string.IsNullOrEmpty(Arg("-probeOut"))) File.WriteAllText(Arg("-probeOut"), csv);
                    if (Arg("-holdCjk") != "false") { HoldCjkFonts(); fontsHeld = true; }
                    Debug.Log("UNITY_WEB_SLIM textures=" + nTex + " cjkHeld=" + fontsHeld);
                }
                BuildReport report;
                try
                {
                    report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                    {
                        scenes = new[] { ScenePath },
                        locationPathName = outDir,
                        target = BuildTarget.WebGL,
                        options = BuildOptions.None
                    });
                }
                finally { if (fontsHeld) RestoreCjkFonts(); }
                bool ok = report.summary.result == BuildResult.Succeeded;
                int droppedVideos = 0, replacedVideos = 0;
                var videoDir = Arg("-videoDir");
                if (ok && !string.IsNullOrEmpty(videoDir) && Directory.Exists(videoDir))
                {
                    var lobbyOut = Path.Combine(outDir, "StreamingAssets", "Lobby"); Directory.CreateDirectory(lobbyOut);
                    foreach (var f in Directory.GetFiles(videoDir, "*.mp4")) { File.Copy(f, Path.Combine(lobbyOut, Path.GetFileName(f)), true); replacedVideos++; }
                }
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
                  .Append(",\"droppedVideos\":").Append(droppedVideos).Append(",\"replacedVideos\":").Append(replacedVideos).Append(",\"api\":\"").Append(api).Append("\"").Append(",\"compression\":\"").Append(PlayerSettings.WebGL.compressionFormat).Append("\"")
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
