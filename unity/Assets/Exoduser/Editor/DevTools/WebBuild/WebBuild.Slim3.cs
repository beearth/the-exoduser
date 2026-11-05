using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.Security.Cryptography;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Exoduser.DevTools
{
    public static partial class WebBuild
    {
        // Audit: a8663c2b4, Runtime CS + all Resources JSON; normalized UTF8/LF.
        const string RuntimeAuditSha256 = "987fd3ebc9e3a89f53865e8d71f628442c179817797453fc7a077d8de5996ff4";
        sealed class ResizeSpec { public string path; public int w,h; public ResizeSpec(string p,int x,int y) { path=p;w=x;h=y; } }
        static readonly ResizeSpec[] Resize4Allow = {
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/crystals/crystals_base.png",1836,858),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_empty.png",570,582),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_item.png",570,582),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/center_frame_baked.png",220,250),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/portrait_baked.png",720,958),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_arms_dim.png",51,51),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_legs_dim.png",51,51),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_skull_dim.png",51,51),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_torso_dim.png",51,51),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/skill/altar_lmb_clean.png",1154,671),
            new ResizeSpec("Assets/Exoduser/Resources/Art/ui/skill/altar_none_clean.png",1154,671),
        };
        // Exact audited paths, not whole directories. Runtime and serialized-reference guards run before moving.
        static readonly string[] DemoFilterAllow = {
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_BaseColor.png",
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_MetallicSmoothness.png",
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_Normal.png",
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_Rigged.fbx",
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_Run.fbx",
            "Assets/Exoduser/Art/Characters/Ivan/Ivan_Walk.fbx",
            "Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun.fbx",
            "Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_BaseColor.png",
            "Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_MetallicSmoothness.png",
            "Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_Normal.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_BaseColor.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_MetallicSmoothness.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Normal.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Rigged.fbx",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Run.fbx",
            "Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Walk.fbx",
            "Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger.fbx",
            "Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_BaseColor.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_MetallicSmoothness.png",
            "Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_Normal.png",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_core_compare.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_plan_check.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_receipt.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_rooms.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_spawns.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_walk.json",
            "Assets/Exoduser/Remodel/CH1_2/Data/rm2_build.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_blocked_islands.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_reach.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_rooms.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_source_receipt.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_spawns.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_walk.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/rm3_camera_occlusion.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/rm3_hero_layer.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/rm3_islands.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/rm3_navmesh_diff.json",
            "Assets/Exoduser/Remodel/CH1_3/Data/rm3_walk_overlap.json",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_cracked.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_drag.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_drops.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone_ribs.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone_skull.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root_branch.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root_tangle.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/NavWalk.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Pool_1.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/Pool_2.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_01.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_02.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_03.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/RM3_NavMesh.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/RM3_Terrain.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/River_E.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/River_W.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/SporePit_1.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/SporePit_2.asset",
            "Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor1.terrainlayer",
            "Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor2.terrainlayer",
            "Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor3.terrainlayer",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_EyeBone.mat",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_EyePupil.mat",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_MushCapDark.mat",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_MushCapWarm.mat",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_MushStem.mat",
            "Assets/Exoduser/Remodel/CH1_3/Materials/M_VoidDark.mat",
            "Assets/Exoduser/Remodel/CH1_3/RM3_Slice.unity",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_build.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_core_compare.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_plan.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_reach.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_receipt.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_rooms.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_spawns.json",
            "Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_walk.json",
            "Assets/Exoduser/Rendering/Sandbox/SandboxTerrain.asset",
            "Assets/Exoduser/Resources/Art/ui/minimap_silvertail.png",
            "Assets/Exoduser/Resources/Art/TitleSignboard/A/silvertail.png",
        };
        [Serializable] sealed class AudioAttempt
        { public string path, acceptedSelector="", adoptedString="", nativeGroupString="미확인"; public List<string> attempts=new List<string>(); }
        [Serializable] sealed class ResizeResult
        { public string path,status; public int sourceW,sourceH,w,h; public long sourceBytes,temporaryBytes; }
        [Serializable] sealed class S2Receipt
        {
            public bool resize4,demoFilter,auditMatched,restoreAttempted,restorePassed;
            public string auditExpected=RuntimeAuditSha256,auditActual="",holdDirectory="Library/WebBuildS2Hold";
            public string estimateBasis="source bytes of Resources + StreamingAssets + FirstPlayable dependencies; NOT cooked or Brotli bytes";
            public long estimatedBuildInputBytesBefore,estimatedBuildInputBytesAfterFilter,estimatedBuildInputReduction,filteredSourceBytes;
            public int resizeCandidates=Resize4Allow.Length,resizeCount,filterCandidates=DemoFilterAllow.Length,filterCount;
            public List<string> filteredPaths=new List<string>(),retainedPaths=new List<string>(),restoreErrors=new List<string>();
            public List<ResizeResult> resized=new List<ResizeResult>();
            public List<AudioAttempt> audioAttempts=new List<AudioAttempt>();
            public List<OverrideCount> audioSelectors=new List<OverrideCount>();
        }
        [Serializable] sealed class PackedAssetRow { public string path; public long packed; }
        [Serializable] sealed class BuildReceipt
        {
            public bool passed,probe;
            public string result,buildResult="",error="",api,compression,engine;
            public long bytes;
            public int errors,droppedVideos,replacedVideos;
            public Slim2Receipt slim2;
            public List<PackedAssetRow> topAssets=new List<PackedAssetRow>();
        }
        static string ProjectRoot { get { return Directory.GetParent(Application.dataPath).FullName; } }
        static string FullAsset(string path) { return Path.Combine(ProjectRoot,path); }
        static bool S2Flag(string key) { return Arg(key)=="true"; }
        static void ValidateS2Flags(bool slim2)
        {
            if(!slim2 && (S2Flag("-resize4")||S2Flag("-demoFilter")))
                throw new ArgumentException("-resize4/-demoFilter require -slim2 true");
        }
        static void InitializeS2(Slim2State s)
        {
            s.receipt.s2=new S2Receipt { resize4=S2Flag("-resize4"),demoFilter=S2Flag("-demoFilter") };
            s.stage=new WebBuildFileStage(ProjectRoot);
        }
        static string AuditSignature()
        {
            var root=ProjectRoot;
            var paths=Directory.GetFiles(Path.Combine(root,"Assets/Exoduser/Runtime"),"*.cs",SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(Path.Combine(root,ResourcesRoot),"*.json",SearchOption.AllDirectories))
                .Select(p=>p.Substring(root.Length+1).Replace('\\','/')).OrderBy(p=>p,StringComparer.Ordinal);
            using(var hash=SHA256.Create())
            {
                foreach(var p in paths)
                {
                    var bytes=Encoding.UTF8.GetBytes(p+"\n"+File.ReadAllText(FullAsset(p)).TrimStart('\uFEFF').Replace("\r\n","\n")+"\n");
                    hash.TransformBlock(bytes,0,bytes.Length,bytes,0);
                }
                hash.TransformFinalBlock(Array.Empty<byte>(),0,0);
                return BitConverter.ToString(hash.Hash).Replace("-","").ToLowerInvariant();
            }
        }
        static string[] BuildInputPaths()
        {
            // Unity Resources and StreamingAssets are included even without a literal runtime reference.
            return AssetDatabase.GetAllAssetPaths().Where(p=>p.StartsWith("Assets/",StringComparison.Ordinal) &&
                    (p.Contains("/Resources/")||p.StartsWith("Assets/StreamingAssets/",StringComparison.Ordinal)))
                .Concat(AssetDatabase.GetDependencies(ScenePath,true))
                .Where(p=>p.StartsWith("Assets/",StringComparison.Ordinal)&&File.Exists(FullAsset(p)))
                .Distinct(StringComparer.Ordinal).ToArray();
        }
        static long SourceBytes(IEnumerable<string> paths)
        { return paths.Where(p=>File.Exists(FullAsset(p))).Sum(p=>new FileInfo(FullAsset(p)).Length); }

        static void PrepareS2Assets(Slim2State s)
        {
            var r=s.receipt.s2;
            r.estimatedBuildInputBytesBefore=SourceBytes(BuildInputPaths());
            r.estimatedBuildInputBytesAfterFilter=r.estimatedBuildInputBytesBefore;
            if(r.resize4||r.demoFilter)
            {
                r.auditActual=AuditSignature(); r.auditMatched=r.auditActual==RuntimeAuditSha256;
                if(!r.auditMatched)
                    Diagnostic(s,"","S2-audit-changed","resize/filter skipped; re-audit changed runtime or JSON",RuntimeAuditSha256,r.auditActual);
                else
                {
                    if(r.demoFilter) ApplyDemoFilter(s);
                    if(r.resize4) ApplyResize4(s);
                }
            }
            // S2 demoFilter respects code references: every non-en/ko font is currently referenced.
            // Legacy CJK hold must not override the stricter filter decision.
            if(r.demoFilter)
                Diagnostic(s,"","CJK-preserved","demoFilter keeps referenced ja/zh/zht/th/ar fonts; legacy CJK hold disabled");
            else if(Arg("-holdCjk")!="false")
            {
                foreach(var p in CjkFonts) if(File.Exists(FullAsset(p))) s.stage.HoldAsset(p);
                AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            }
        }
        static void ApplyDemoFilter(Slim2State s)
        {
            var r=s.receipt.s2;
            var candidates=new HashSet<string>(DemoFilterAllow,StringComparer.Ordinal);
            // Check only roots shipped by this build, excluding audited candidates themselves.
            // JSON/string/dynamic resource references are separately protected by the audit signature.
            var roots=AssetDatabase.GetAllAssetPaths().Where(p=>p.StartsWith("Assets/",StringComparison.Ordinal) &&
                (p.Contains("/Resources/")||p.StartsWith("Assets/StreamingAssets/",StringComparison.Ordinal)) &&
                !candidates.Contains(p)&&File.Exists(FullAsset(p))).Concat(new[]{ScenePath}).ToArray();
            var referenced=new HashSet<string>(AssetDatabase.GetDependencies(roots,true),StringComparer.Ordinal);
            foreach(var p in DemoFilterAllow)
            {
                if(!File.Exists(FullAsset(p))) { r.retainedPaths.Add(p+" | missing; no move"); continue; }
                if(referenced.Contains(p))
                {
                    r.retainedPaths.Add(p+" | referenced by included asset");
                    Diagnostic(s,p,"filter-kept","serialized dependency from included build root"); continue;
                }
                long bytes=new FileInfo(FullAsset(p)).Length;
                s.stage.HoldAsset(p); r.filteredSourceBytes+=bytes; r.filteredPaths.Add(p); r.filterCount++;
            }
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            r.estimatedBuildInputBytesAfterFilter=SourceBytes(BuildInputPaths());
            r.estimatedBuildInputReduction=r.estimatedBuildInputBytesBefore-r.estimatedBuildInputBytesAfterFilter;
        }
        static void ApplyResize4(Slim2State s)
        {
            foreach(var spec in Resize4Allow)
            {
                var path=spec.path;
                if(!File.Exists(FullAsset(path))) { Diagnostic(s,path,"resize-kept","missing or filtered"); continue; }
                var imp=AssetImporter.GetAtPath(path) as TextureImporter;
                var policy=Classify(path,imp,s);
                if(imp==null || imp.textureType!=TextureImporterType.Default ||
                    imp.textureShape!=TextureImporterShape.Texture2D || imp.spriteImportMode!=SpriteImportMode.None ||
                    imp.spriteBorder!=Vector4.zero || imp.npotScale!=TextureImporterNPOTScale.None ||
                    policy.classification!="ui-single" || s.atlasTextures.Contains(path))
                { Diagnostic(s,path,"resize-kept","current importer/atlas classification differs from audited single art"); continue; }
                int w,h;imp.GetSourceTextureWidthAndHeight(out w,out h);
                if(w!=spec.w||h!=spec.h)
                { Diagnostic(s,path,"resize-kept","source dimensions differ from audit",spec.w+"x"+spec.h,w+"x"+h);continue; }
                if(w%4==0&&h%4==0)continue;
                var size=WebBuildResizePixels.AlignedSize(w,h,policy.maxSize);
                Texture2D input=null,output=null;
                try
                {
                    // Load original PNG bytes directly: never make the shared importer readable.
                    // Unity ImageConversion.LoadImage/EncodeToPNG; gamma/sRGB importer flag is preserved.
                    input=new Texture2D(2,2,TextureFormat.RGBA32,false,false);
                    byte[] original=File.ReadAllBytes(FullAsset(path));
                    if(!ImageConversion.LoadImage(input,original,false) || input.width!=w || input.height!=h)
                        throw new InvalidOperationException("resize source PNG decode mismatch: "+path);
                    var colors=input.GetPixels32();var rgba=new byte[colors.Length*4];
                    for(int i=0;i<colors.Length;i++) { rgba[i*4]=colors[i].r;rgba[i*4+1]=colors[i].g;rgba[i*4+2]=colors[i].b;rgba[i*4+3]=colors[i].a; }
                    var resized=WebBuildResizePixels.ResizeRgba(rgba,w,h,size[0],size[1]);
                    var pixels=new Color32[resized.Length/4];
                    for(int i=0;i<pixels.Length;i++)pixels[i]=new Color32(resized[i*4],resized[i*4+1],resized[i*4+2],resized[i*4+3]);
                    output=new Texture2D(size[0],size[1],TextureFormat.RGBA32,false,false);
                    output.SetPixels32(pixels);output.Apply(false,false);
                    byte[] png=ImageConversion.EncodeToPNG(output);
                    if(png==null||png.Length==0)throw new InvalidOperationException("resize PNG encode failed: "+path);
                    s.stage.PreserveAsset(path);
                    File.WriteAllBytes(FullAsset(path),png);
                    AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport|ImportAssetOptions.ForceUpdate);
                    var actual=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                    if(actual==null||actual.width!=size[0]||actual.height!=size[1])
                        throw new InvalidOperationException("resize import dimensions differ: "+path);
                    Resources.UnloadAsset(actual);
                    s.receipt.s2.resized.Add(new ResizeResult { path=path,status="temporary-PNG-imported",sourceW=w,sourceH=h,w=size[0],h=size[1],sourceBytes=original.Length,temporaryBytes=png.Length });
                    s.receipt.s2.resizeCount++;
                }
                finally
                {
                    if(input!=null)UnityEngine.Object.DestroyImmediate(input);
                    if(output!=null)UnityEngine.Object.DestroyImmediate(output);
                }
            }
        }
        static void RestoreS2(Slim2State s)
        {
            if(s==null||s.stage==null)return;
            var r=s.receipt.s2;r.restoreAttempted=true;
            try { r.restoreErrors.AddRange(s.stage.Restore(()=>AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport))); }
            catch(Exception e) { r.restoreErrors.Add(e.ToString()); }
            r.restorePassed=r.restoreErrors.Count==0;
            if(!r.restorePassed)Debug.LogError("WebBuild restoration failed; retain Library/WebBuildS2Hold and run RestoreSlim3.");
        }
        public static void RestoreSlim3()
        {
            var errors=new List<string>();
            try { errors.AddRange(WebBuildFileStage.Recover(ProjectRoot,"Library/WebBuildS2Hold",()=>AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport))); }
            catch(Exception e) { errors.Add(e.ToString()); }
            var s=new Slim2Receipt { s2=new S2Receipt { restoreAttempted=true,restorePassed=errors.Count==0,restoreErrors=errors } };
            var result=new BuildReceipt { passed=errors.Count==0,result=errors.Count==0?"Restored":"RestorationFailed",slim2=s,engine=Application.unityVersion };
            if(!string.IsNullOrEmpty(Arg("-receipt")))WriteText(Arg("-receipt"),JsonUtility.ToJson(result));
            Debug.Log(JsonUtility.ToJson(result));EditorApplication.Exit(errors.Count==0?0:2);
        }

        static bool AudioSettingsEqual(AudioImporterSampleSettings a,AudioImporterSampleSettings b)
        {
            return a.compressionFormat==b.compressionFormat && a.loadType==b.loadType &&
                a.sampleRateSetting==b.sampleRateSetting && a.sampleRateOverride==b.sampleRateOverride &&
                Math.Abs(a.quality-b.quality)<=0.0001f;
        }
        static string ApplyAudioCandidate(Slim2State s,string path,AudioImporterSampleSettings settings)
        {
            // UnityCsReference 6000.6.7f1 AudioImporter.bindings.cs:64-106,119-140;
            // AudioImporterInspector.cs:113-129 uses the public BuildTargetGroup overload.
            // Native platform parser/codec rejection is not observable offline.
            const string groupSelector="BuildTargetGroup.WebGL";
            var initial=(AudioImporter)AssetImporter.GetAtPath(path);
            bool had=initial.ContainsSampleSettingsOverride(BuildTargetGroup.WebGL);
            var before=initial.GetOverrideSampleSettings(BuildTargetGroup.WebGL);
            s.stage.PreserveMeta(path);
            var row=new AudioAttempt { path=path };s.receipt.s2.audioAttempts.Add(row);
            var candidates=new[]{groupSelector,BuildPipeline.GetBuildTargetName(BuildTarget.WebGL),"WebGL","Web"};
            string selected=WebBuildAudioSelection.Try(candidates,selector=>
            {
                var imp=(AudioImporter)AssetImporter.GetAtPath(path);
                bool accepted=selector==groupSelector ? imp.SetOverrideSampleSettings(BuildTargetGroup.WebGL,settings) :
                    imp.SetOverrideSampleSettings(selector,settings);
                row.attempts.Add(selector+" set="+accepted);
                if(!accepted)return false;
                imp.SaveAndReimport();imp=(AudioImporter)AssetImporter.GetAtPath(path);
                bool verified=imp.ContainsSampleSettingsOverride(BuildTargetGroup.WebGL) &&
                    AudioSettingsEqual(imp.GetOverrideSampleSettings(BuildTargetGroup.WebGL),settings);
                row.attempts.Add(selector+" readback="+verified);
                return verified;
            },selector=>
            {
                var imp=(AudioImporter)AssetImporter.GetAtPath(path);
                if(had)
                {
                    if(!imp.SetOverrideSampleSettings(BuildTargetGroup.WebGL,before))
                        throw new InvalidOperationException("audio rollback rejected: "+path);
                }
                else if(imp.ContainsSampleSettingsOverride(BuildTargetGroup.WebGL))
                {
                    if(!imp.ClearSampleSettingOverride(BuildTargetGroup.WebGL))
                        throw new InvalidOperationException("audio rollback clear rejected: "+path);
                }
                imp.SaveAndReimport();imp=(AudioImporter)AssetImporter.GetAtPath(path);
                if(imp.ContainsSampleSettingsOverride(BuildTargetGroup.WebGL)!=had ||
                    had && !AudioSettingsEqual(imp.GetOverrideSampleSettings(BuildTargetGroup.WebGL),before))
                    throw new InvalidOperationException("audio rollback readback mismatch: "+path);
            },row.attempts);
            row.acceptedSelector=selected;
            row.adoptedString=selected==groupSelector?"":selected;
            if(!string.IsNullOrEmpty(selected))Count(s.receipt.s2.audioSelectors,selected);
            return selected;
        }
        static void WriteBuildReceipt(BuildReport report,Slim2State s,string error,string api,int dropped,int replaced,bool probe=false)
        {
            bool restored=s==null || s.receipt.s2!=null&&s.receipt.s2.restorePassed;
            bool built=probe || report!=null&&report.summary.result==BuildResult.Succeeded;
            var r=new BuildReceipt {
                passed=built&&string.IsNullOrEmpty(error)&&restored,probe=probe,
                buildResult=report==null?"":report.summary.result.ToString(),
                result=!restored?"RestorationFailed":!string.IsNullOrEmpty(error)?"Exception":probe?"Probe":report==null?"NotBuilt":report.summary.result.ToString(),
                error=error,api=api,compression=PlayerSettings.WebGL.compressionFormat.ToString(),
                engine=Application.unityVersion,bytes=report==null?0:(long)report.summary.totalSize,
                errors=report==null?0:(int)report.summary.totalErrors,droppedVideos=dropped,replacedVideos=replaced,
                slim2=s==null?null:s.receipt };
            if(report!=null)r.topAssets=report.packedAssets.SelectMany(p=>p.contents).OrderByDescending(p=>(long)p.packedSize)
                .Take(40).Select(p=>new PackedAssetRow { path=p.sourceAssetPath.Replace('\\','/'),packed=(long)p.packedSize }).ToList();
            if(!string.IsNullOrEmpty(Arg("-receipt")))WriteText(Arg("-receipt"),JsonUtility.ToJson(r));
            Debug.Log("UNITY_WEB_BUILD "+JsonUtility.ToJson(r));
        }
    }
}
