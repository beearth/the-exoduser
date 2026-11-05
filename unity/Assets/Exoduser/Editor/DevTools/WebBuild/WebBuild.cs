// DevTools: WebGL build for a private browser preview (this branch only; never merge into unity/main).
// Usage: Unity -batchmode -quit -buildTarget WebGL -projectPath <wt>/unity -executeMethod Exoduser.DevTools.WebBuild.Run -outDir <dir> [-receipt <json>] [-api webgpu|webgl2|both]
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
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
        public static string TextureReport() { return BuildTextureReport(null); }

        // Probe: apply overrides, import, dump the report, exit (no player build).
        public static void Probe()
        {
            int exit = 2;
            try
            {
                if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL) throw new InvalidOperationException("need -buildTarget WebGL");
                if (Arg("-slim2") == "true")
                {
                    var state = PrepareSlim2("");
                    if (!string.IsNullOrEmpty(Arg("-receipt")))
                        WriteText(Arg("-receipt"), "{\"probe\":true,\"slim2\":" + JsonUtility.ToJson(state.receipt) + "}");
                }
                else
                {
                    int n = ApplyWebTextures(Arg("-texMax"));
                    File.WriteAllText(Arg("-probeOut"), TextureReport());
                    Debug.Log("UNITY_WEB_PROBE textures=" + n);
                }
                exit = 0;
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

        // S1 opt-in policy. Only SetPlatformTextureSettings/SetOverrideSampleSettings write import settings.
        // mipmapEnabled is a SHARED field, absent from TextureImporterPlatformSettings:
        // https://docs.unity3d.com/6000.6/Documentation/ScriptReference/TextureImporterPlatformSettings.html
        const string ArtRoot = "Assets/Exoduser/Resources/Art/";
        static readonly string[] SizeKeepPrefixes = {
            ArtRoot+"player/", ArtRoot+"enemy/", ArtRoot+"boss/dark_druid/", ArtRoot+"vfx/",
            ArtRoot+"map/production_finish/", ArtRoot+"ui/boss/",
            ArtRoot+"ui/silver_hell/btn_thorn_", ArtRoot+"ui/silver_hell/btn_chip_"
        };
        static readonly string[] SizeKeepPaths = {
            ArtRoot+"map/hell_lighting/torch_flame.png", ArtRoot+"lobby/varkan_idle.png",
            ArtRoot+"ui/area/area_atlas.png", ArtRoot+"ui/death/death_atlas.png",
            ArtRoot+"ui/clear/clear_atlas.png", ArtRoot+"ui/overlay/levelup_label.png",
            ArtRoot+"ui/forge/forge_glyphs.png", ArtRoot+"ui/keybind/keybind_glyphs.png",
            ArtRoot+"CharacterSelect/generated/presentation_ring_atlas.png",
            ArtRoot+"CharacterSelect/generated/trait_glyphs.png",
            ArtRoot+"ui/inventory/rail.png", ArtRoot+"ui/inventory/window_frame.png",
            ArtRoot+"ui/silver_hell/panel_frame_20261029.png", ArtRoot+"ui/silver_hell/btn_plaque_20261029.png",
            ArtRoot+"ui/silver_hell/btn_primary_composed.png", ArtRoot+"ui/ui_bar_only.png", ArtRoot+"ui/region_arrow.png"
        };
        // NativeScreenTransition.cs:52,54 reads this imported texture via GetPixelBilinear (NOT GetPixels32).
        // https://docs.unity3d.com/6000.6/Documentation/ScriptReference/Texture2D.GetPixelBilinear.html
        static readonly string[] NoCrunchPaths = { ArtRoot+"ui/silver_hell/gate_sigil_loading_embers.png" };
        // NativeGame.HellGround.cs:21; HellGroundPBR.shader:85 / A2RootSurface.shader:90 read .r.
        // A filename containing "mask" or "ARM/ORM" alone is not evidence of a single channel.
        static readonly string[] SingleChannelPaths = { ArtRoot+"map/hell_lighting/rock_ground_Rough.jpg" };
        static readonly string[] MeshTexturePaths = {
            ArtRoot+"map/hell_lighting/rock_ground_Diffuse.jpg", ArtRoot+"map/hell_lighting/burned_ground_01_Diffuse.jpg",
            ArtRoot+"map/hell_lighting/rock_ground_nor_gl.jpg", ArtRoot+"map/hell_lighting/rock_ground_Rough.jpg"
        };
        static readonly string[] UiPrefixes = {
            ArtRoot+"ui/", ArtRoot+"CharacterSelect/", ArtRoot+"Loading/", ArtRoot+"FullscreenWide/",
            ArtRoot+"Startup/", ArtRoot+"skill_icons/"
        };
        [Serializable] sealed class OverrideCount { public string classification; public int count; }
        [Serializable] sealed class Slim2Receipt
        {
            public bool enabled = true;
            public int textureOverrides, audioOverrides, texturesSkipped, audioDeferred, mipmapMismatches, actualUncompressed;
            public string textureCsv, audioCsv, uncompressedCsv, diagnosticsCsv;
            public string mipmapPolicy = "shared importer unchanged; mismatches reported";
            public string longAudioPolicy;
            public List<OverrideCount> textureOverridesByClass = new List<OverrideCount>();
            public List<OverrideCount> audioOverridesByClass = new List<OverrideCount>();
        }
        sealed class TexturePolicy { public string classification, reason; public int maxSize; public bool? desiredMip; }
        sealed class TextureRequest { public string format = "", status = "", reason = ""; }
        sealed class AudioRequest { public string format, loadType, quality; }
        sealed class Slim2State
        {
            public Slim2Receipt receipt = new Slim2Receipt();
            public HashSet<string> atlasTextures = new HashSet<string>(StringComparer.Ordinal);
            public HashSet<string> meshTextures = new HashSet<string>(StringComparer.Ordinal);
            public Dictionary<string, TextureRequest> requests = new Dictionary<string, TextureRequest>(StringComparer.Ordinal);
            public Dictionary<string, AudioRequest> audioRequests = new Dictionary<string, AudioRequest>(StringComparer.Ordinal);
            public Dictionary<string, string> audioStatus = new Dictionary<string, string>(StringComparer.Ordinal);
            public StringBuilder diagnostics = new StringBuilder("path,kind,reason,expected,actual\n");
            public StringBuilder uncompressed = new StringBuilder("path,w,h,requestedFormat,actualFormat,reason\n");
        }
        static string[] TexturePaths()
        {
            return AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets" }).Select(AssetDatabase.GUIDToAssetPath)
                .Where(p => p.StartsWith("Assets/", StringComparison.Ordinal)).Distinct()
                .OrderBy(p => p, StringComparer.Ordinal).ToArray();
        }
        static bool Matches(string path, string[] prefixes, string[] exact)
        { return exact.Contains(path) || prefixes.Any(p => path.StartsWith(p, StringComparison.Ordinal)); }
        static bool SheetName(string path)
        {
            var stem = Path.GetFileNameWithoutExtension(path).ToLowerInvariant();
            return stem.Contains("atlas") || stem.Contains("sheet") || stem.Contains("glyph") || stem.Contains("flipbook");
        }
        static void AddTextureDependencies(string asset, HashSet<string> into)
        {
            foreach (var p in AssetDatabase.GetDependencies(asset, true))
                if (p.StartsWith("Assets/", StringComparison.Ordinal) && AssetImporter.GetAtPath(p) is TextureImporter) into.Add(p);
        }
        static Slim2State NewSlim2State()
        {
            var s = new Slim2State();
            foreach (var g in AssetDatabase.FindAssets("t:SpriteAtlas", new[] { "Assets" }))
            {
                var p = AssetDatabase.GUIDToAssetPath(g); AddTextureDependencies(p, s.atlasTextures);
                var atlas = AssetDatabase.LoadAssetAtPath<UnityEngine.U2D.SpriteAtlas>(p);
                if (atlas == null) continue;
                foreach (var packed in UnityEditor.U2D.SpriteAtlasExtensions.GetPackables(atlas))
                {
                    var packPath = AssetDatabase.GetAssetPath(packed);
                    if (AssetDatabase.IsValidFolder(packPath))
                        foreach (var t in AssetDatabase.FindAssets("t:Texture2D", new[] { packPath }))
                            s.atlasTextures.Add(AssetDatabase.GUIDToAssetPath(t));
                    else if (!string.IsNullOrEmpty(packPath)) AddTextureDependencies(packPath, s.atlasTextures);
                }
            }
            // Mesh renderer material slots are evidence; an arbitrary .mat or non-Resources path is not.
            var modelGuids = AssetDatabase.FindAssets("t:Model", new[] { "Assets" })
                .Concat(AssetDatabase.FindAssets("t:Prefab", new[] { "Assets" })).Distinct();
            foreach (var g in modelGuids)
            {
                var go = AssetDatabase.LoadAssetAtPath<GameObject>(AssetDatabase.GUIDToAssetPath(g));
                if (go == null) continue;
                foreach (var renderer in go.GetComponentsInChildren<Renderer>(true))
                {
                    if (!(renderer is MeshRenderer) && !(renderer is SkinnedMeshRenderer)) continue;
                    foreach (var material in renderer.sharedMaterials)
                    {
                        if (material == null) continue;
                        foreach (var property in material.GetTexturePropertyNames())
                        {
                            var texture = material.GetTexture(property) as Texture2D;
                            var p = texture == null ? "" : AssetDatabase.GetAssetPath(texture);
                            if (p.StartsWith("Assets/", StringComparison.Ordinal)) s.meshTextures.Add(p);
                        }
                    }
                }
            }
            return s;
        }
        static TexturePolicy Classify(string path, TextureImporter imp, Slim2State s)
        {
            bool protect = Matches(path, SizeKeepPrefixes, SizeKeepPaths);
            bool sheet = protect || SheetName(path) || s.atlasTextures.Contains(path) ||
                (imp != null && imp.spriteImportMode == SpriteImportMode.Multiple);
            bool ui = UiPrefixes.Any(p => path.StartsWith(p, StringComparison.Ordinal));
            bool mesh = path.StartsWith(ArtRoot+"map/a2/ground/", StringComparison.Ordinal) ||
                MeshTexturePaths.Contains(path) || s.meshTextures.Contains(path);
            if (sheet) return new TexturePolicy { classification="sheet-atlas", maxSize=0, desiredMip=false,
                reason=protect ? "runtime-pixel-size-contract" : "atlas-or-sheet-evidence" };
            if (ui && mesh) return new TexturePolicy { classification="unclassified", maxSize=0, reason="UI-and-mesh-use-conflict" };
            if (ui) return new TexturePolicy { classification="ui-single", maxSize=2048, desiredMip=false, reason="UI-path-after-sheet-exclusions" };
            if (mesh) return new TexturePolicy { classification="mesh-material", maxSize=1024, desiredMip=true, reason="mesh-renderer-material-or-runtime-PBR-path" };
            return new TexturePolicy { classification="unclassified", maxSize=0, reason="no-proven-size-role; preserve" };
        }
        static string Csv(params object[] fields)
        {
            return string.Join(",", fields.Select(x => "\"" +
                (Convert.ToString(x, CultureInfo.InvariantCulture) ?? "").Replace("\"", "\"\"") + "\"")) + "\n";
        }
        static void Diagnostic(Slim2State s, string path, string kind, string reason, object expected = null, object actual = null)
        { s.diagnostics.Append(Csv(path, kind, reason, expected, actual)); }
        static void Count(List<OverrideCount> list, string category)
        {
            var c = list.FirstOrDefault(x => x.classification == category);
            if (c == null) { c = new OverrideCount { classification=category }; list.Add(c); } c.count++;
        }
        static int RetainSourceCap(int width, int height)
        {
            int largest=Math.Max(width,height), cap=32;
            while (cap < largest && cap < 16384) cap *= 2;
            return largest <= cap ? cap : 0;
        }
        static void ApplySlim2Textures(Slim2State s)
        {
            bool unaligned = Arg("-unaligned") == "true";
            foreach (var path in TexturePaths())
            {
                var imp=AssetImporter.GetAtPath(path) as TextureImporter;
                var policy=Classify(path,imp,s);
                var request=new TextureRequest { reason=policy.reason }; s.requests[path]=request;
                if (imp == null || imp.textureShape != TextureImporterShape.Texture2D)
                { request.status="skipped-non-Texture2D-importer"; s.receipt.texturesSkipped++; continue; }
                int w,h; imp.GetSourceTextureWidthAndHeight(out w,out h);
                int keepCap=RetainSourceCap(w,h);
                if (w <= 0 || h <= 0 || keepCap == 0)
                {
                    request.status="skipped-unverified-source-dimensions"; s.receipt.texturesSkipped++;
                    Diagnostic(s,path,"texture-skipped",request.status,"1..16384",w+"x"+h); continue;
                }
                bool aligned=w%4==0 && h%4==0, normal=imp.textureType==TextureImporterType.NormalMap;
                bool single=imp.textureType==TextureImporterType.SingleChannel || SingleChannelPaths.Contains(path);
                bool alpha=imp.DoesSourceTextureHaveAlpha();
                var format=alpha ? TextureImporterFormat.DXT5Crunched : TextureImporterFormat.DXT1Crunched;
                string formatKind=normal ? "normal-map" : single ? "single-channel-mask" : "color";
                bool crunch=true, plain=false;
                // Do not pad/resize just to make a codec accept dimensions. The flag is only a request experiment:
                // https://discussions.unity.com/t/optimising-unity-texture-import-settings/1631377
                if (!aligned)
                {
                    format=unaligned ? TextureImporterFormat.DXT5 : alpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24;
                    crunch=false; plain=!unaligned;
                    request.reason+=unaligned ? ";unaligned-DXT5-experiment" : ";unaligned-uncompressed";
                }
                else if (normal)
                {
                    format=TextureImporterFormat.BC5; crunch=false;
                    // NormalMap importer + DXT5 uses Unity's DXT5nm path; test API support, never force it.
                    // https://docs.unity3d.com/6000.6/Documentation/Manual/texture-formats-reference.html
                    if (!TextureImporter.IsPlatformTextureFormatValid(imp.textureType,BuildTarget.WebGL,format))
                        format=TextureImporterFormat.DXT5;
                }
                else if (single) { format=TextureImporterFormat.BC4; crunch=false; }
                else if (NoCrunchPaths.Contains(path))
                { format=TextureImporterFormat.DXT5; crunch=false; request.reason+=";CPU-GetPixelBilinear"; }
                if (!TextureImporter.IsPlatformTextureFormatValid(imp.textureType,BuildTarget.WebGL,format))
                {
                    request.format=format.ToString(); request.status="skipped-platform-format-rejected";
                    Diagnostic(s,path,"format-rejected","preserved; operator decision required",request.format,imp.textureType);
                    s.receipt.texturesSkipped++; continue;
                }
                if (policy.desiredMip.HasValue && imp.mipmapEnabled != policy.desiredMip.Value)
                {
                    s.receipt.mipmapMismatches++;
                    Diagnostic(s,path,"mipmap-mismatch","no WebGL-only mipmap field; shared value preserved",policy.desiredMip.Value,imp.mipmapEnabled);
                }
                bool mip=imp.mipmapEnabled, srgb=imp.sRGBTexture, readable=imp.isReadable;
                var ps=imp.GetPlatformTextureSettings("WebGL");
                ps.name="WebGL"; ps.overridden=true;
                ps.maxTextureSize=policy.maxSize==0 ? keepCap : Math.Min(keepCap,policy.maxSize);
                ps.format=format; ps.crunchedCompression=crunch; ps.compressionQuality=50;
                ps.textureCompression=plain ? TextureImporterCompression.Uncompressed : TextureImporterCompression.Compressed;
                imp.SetPlatformTextureSettings(ps); imp.SaveAndReimport();
                imp=(TextureImporter)AssetImporter.GetAtPath(path);
                var rb=imp.GetPlatformTextureSettings("WebGL");
                if (!rb.overridden || rb.format != format || rb.maxTextureSize != ps.maxTextureSize ||
                    rb.crunchedCompression != crunch || rb.compressionQuality != 50)
                    throw new InvalidOperationException("WebGL texture override readback mismatch: "+path);
                if (mip != imp.mipmapEnabled || srgb != imp.sRGBTexture || readable != imp.isReadable)
                    throw new InvalidOperationException("AssetPostprocessor changed shared texture settings: "+path);
                request.format=format.ToString(); request.status="override-applied";
                s.receipt.textureOverrides++; Count(s.receipt.textureOverridesByClass,policy.classification+"/"+formatKind);
            }
        }
        static void ApplySlim2Audio(Slim2State s)
        {
            // WebGL's supported codec is AAC; do not silently substitute for requested Vorbis/Streaming.
            // https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Modules/AssetPipelineEditor/ImportSettings/AudioImporterInspector.cs#L244
            // https://docs.unity3d.com/6000.6/Documentation/Manual/webgl-audio.html
            string mode=Arg("-webAudio");
            if (!string.IsNullOrEmpty(mode) && mode!="aac-inmemory" && mode!="keep")
                throw new ArgumentException("-webAudio must be aac-inmemory or keep");
            bool allowAacLong=mode=="aac-inmemory";
            s.receipt.longAudioPolicy=mode=="keep" ? "explicit keep: all audio settings preserved" :
                allowAacLong ? "explicit AAC q0.5 CompressedInMemory" :
                "deferred: WebGL Vorbis+Streaming unsupported; decision required";
            foreach (var g in AssetDatabase.FindAssets("t:AudioClip",new[]{"Assets"}).OrderBy(x=>x,StringComparer.Ordinal))
            {
                var path=AssetDatabase.GUIDToAssetPath(g);
                var importer=AssetImporter.GetAtPath(path) as AudioImporter;
                var clip=AssetDatabase.LoadAssetAtPath<AudioClip>(path);
                if (importer==null || clip==null) continue;
                double length=clip.length; Resources.UnloadAsset(clip);
                if (double.IsNaN(length) || double.IsInfinity(length) || length<=0)
                {
                    s.audioStatus[path]="deferred-unverified-duration"; s.receipt.audioDeferred++;
                    Diagnostic(s,path,"audio-deferred","duration not verified",">0",length); continue;
                }
                bool longClip=length>1.0;
                var settings=importer.ContainsSampleSettingsOverride("WebGL") ?
                    importer.GetOverrideSampleSettings("WebGL") : importer.defaultSampleSettings;
                s.audioRequests[path]=new AudioRequest {
                    format=mode=="keep" ? "keep" : longClip && !allowAacLong ? "Vorbis" : "AAC",
                    loadType=mode=="keep" ? "keep" : longClip ? (allowAacLong ? "CompressedInMemory" : "Streaming") : "DecompressOnLoad",
                    quality=mode=="keep" ? "keep" : longClip ? "0.5" : settings.quality.ToString(CultureInfo.InvariantCulture) };
                if (mode=="keep" || (longClip && !allowAacLong))
                {
                    s.audioStatus[path]="preserved-pending-audio-decision"; s.receipt.audioDeferred++;
                    Diagnostic(s,path,"audio-deferred","requested Vorbis/Streaming unsupported; no substitution",
                        longClip ? "Vorbis q0.5 Streaming" : "DecompressOnLoad","preserved"); continue;
                }
                settings.compressionFormat=AudioCompressionFormat.AAC;
                settings.loadType=longClip ? AudioClipLoadType.CompressedInMemory : AudioClipLoadType.DecompressOnLoad;
                if (longClip) settings.quality=0.5f;
                if (!importer.SetOverrideSampleSettings("WebGL",settings))
                {
                    s.audioStatus[path]="platform-override-rejected"; s.receipt.audioDeferred++;
                    Diagnostic(s,path,"audio-rejected","AudioImporter rejected WebGL override"); continue;
                }
                importer.SaveAndReimport(); importer=(AudioImporter)AssetImporter.GetAtPath(path);
                var actual=importer.GetOverrideSampleSettings("WebGL");
                if (!importer.ContainsSampleSettingsOverride("WebGL") || actual.compressionFormat!=settings.compressionFormat ||
                    actual.loadType!=settings.loadType || (longClip && Math.Abs(actual.quality-0.5f)>0.0001f))
                    throw new InvalidOperationException("WebGL audio override readback mismatch: "+path);
                s.audioStatus[path]="override-applied"; s.receipt.audioOverrides++;
                Count(s.receipt.audioOverridesByClass,longClip ? "over-1s-AAC-inmemory-opt-in" : "at-most-1s-decompress");
            }
        }
        static string BuildTextureReport(Slim2State state)
        {
            var s=state ?? NewSlim2State();
            var b=new StringBuilder("path,w,h,format,memBytes,분류,resources안밖,sRGB,mipmap,sourceW,sourceH,requestedFormat,status,reason\n");
            long total=0;
            foreach (var path in TexturePaths())
            {
                var t=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                var imp=AssetImporter.GetAtPath(path) as TextureImporter;
                var p=Classify(path,imp,s);
                TextureRequest request; s.requests.TryGetValue(path,out request);
                if (t==null)
                {
                    b.Append(Csv(path,"","","","",p.classification,path.Contains("/Resources/")?"inside":"outside",
                        "","","","",request==null?"":request.format,"not-loadable",p.reason)); continue;
                }
                int w=0,h=0; if(imp!=null) imp.GetSourceTextureWidthAndHeight(out w,out h);
                long memory=UnityEngine.Profiling.Profiler.GetRuntimeMemorySizeLong(t); total+=memory;
                string actual=t.format.ToString(), requested=request==null?"":request.format;
                string reason=request==null?p.reason:request.reason;
                b.Append(Csv(path,t.width,t.height,actual,memory,p.classification,path.Contains("/Resources/")?"inside":"outside",
                    imp==null?"unknown":imp.sRGBTexture.ToString(),imp==null?(t.mipmapCount>1).ToString():imp.mipmapEnabled.ToString(),
                    w,h,requested,request==null?"report-only":request.status,reason));
                if(state!=null && !UnityEngine.Experimental.Rendering.GraphicsFormatUtility.IsCompressedFormat(t.graphicsFormat))
                {
                    s.receipt.actualUncompressed++;
                    s.uncompressed.Append(Csv(path,t.width,t.height,requested,actual,reason));
                }
                if(state!=null && p.maxSize==0 && w>0 && h>0 && (t.width!=w || t.height!=h))
                    Diagnostic(s,path,"size-preserve-mismatch","shared NPOT/import policy may resize; inspect before accepting",w+"x"+h,t.width+"x"+t.height);
                Resources.UnloadAsset(t);
            }
            b.Append(Csv("TOTAL","","","",total,"","","","","","","","","")); return b.ToString();
        }
        static string AudioReport(Slim2State s)
        {
            var b=new StringBuilder("path,길이,포맷,loadType,크기,sourceFileBytes,requestedFormat,requestedLoadType,quality,requestedQuality,status\n");
            foreach(var g in AssetDatabase.FindAssets("t:AudioClip",new[]{"Assets"}).OrderBy(x=>x,StringComparer.Ordinal))
            {
                var path=AssetDatabase.GUIDToAssetPath(g);
                var imp=AssetImporter.GetAtPath(path) as AudioImporter;
                var clip=AssetDatabase.LoadAssetAtPath<AudioClip>(path); if(imp==null || clip==null) continue;
                // This is importer metadata, not a measurement of the encoded build codec.
                var settings=imp.ContainsSampleSettingsOverride("WebGL") ? imp.GetOverrideSampleSettings("WebGL") : imp.defaultSampleSettings;
                AudioRequest request; s.audioRequests.TryGetValue(path,out request);
                string status; s.audioStatus.TryGetValue(path,out status);
                b.Append(Csv(path,clip.length,settings.compressionFormat,clip.loadType,
                    UnityEngine.Profiling.Profiler.GetRuntimeMemorySizeLong(clip),File.Exists(path)?new FileInfo(path).Length:0,
                    request==null ? "" : request.format,request==null ? "" : request.loadType,
                    settings.quality,request==null ? "" : request.quality,status??"report-only"));
                Resources.UnloadAsset(clip);
            }
            return b.ToString();
        }
        static void WriteText(string path,string text)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path)));
            File.WriteAllText(path,text,new UTF8Encoding(false));
        }
        static string Sidecar(string probe,string suffix)
        {
            var full=Path.GetFullPath(probe);
            return Path.Combine(Path.GetDirectoryName(full),Path.GetFileNameWithoutExtension(full)+suffix);
        }
        static Slim2State PrepareSlim2(string defaultCsv)
        {
            var s=NewSlim2State(); var probe=Arg("-probeOut");
            if(string.IsNullOrEmpty(probe)) probe=defaultCsv;
            if(string.IsNullOrEmpty(probe)) throw new ArgumentException("-probeOut required for slim2 Probe");
            s.receipt.textureCsv=Path.GetFullPath(probe); s.receipt.audioCsv=Sidecar(probe,".audio.csv");
            s.receipt.uncompressedCsv=Sidecar(probe,".uncompressed.csv"); s.receipt.diagnosticsCsv=Sidecar(probe,".diagnostics.csv");
            try
            {
                ApplySlim2Textures(s); ApplySlim2Audio(s);
                WriteText(s.receipt.textureCsv,BuildTextureReport(s));
                WriteText(s.receipt.audioCsv,AudioReport(s));
                WriteText(s.receipt.uncompressedCsv,s.uncompressed.ToString());
            }
            finally { WriteText(s.receipt.diagnosticsCsv,s.diagnostics.ToString()); }
            Debug.Log("UNITY_WEB_SLIM2 "+JsonUtility.ToJson(s.receipt)); return s;
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

                bool slim = Arg("-slim") == "true", slim2 = Arg("-slim2") == "true", fontsHeld = false;
                Slim2State slim2State = null;
                if (slim2)
                {
                    slim2State = PrepareSlim2(outDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + ".textures.csv");
                    if (Arg("-holdCjk") != "false") { HoldCjkFonts(); fontsHeld = true; }
                }
                else if (slim)
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
                if (slim2State != null) sb.Append(",\"slim2\":").Append(JsonUtility.ToJson(slim2State.receipt));
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
