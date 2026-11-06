using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace Exoduser.DevTools
{
    // Run 3 (3D path). Editor build staging only; every asset change goes through WebBuildFileStage and is restored after the build.
    // Target lists: docs/0마스터플랜/WEB_BUILD/WEBGL_SIZE_TARGETS_20261105.md, audited at e0ff19191.
    public static partial class WebBuild
    {
        const string S3AuditSha256 = "918cce8b9600d411616fabcc007a98e751aa3b8497e84a90f36559711326a8ed";
        // Same scene pair as PortVerification.cs:253 (-remodel-scenes 1).
        const string Scene3DPath = "Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity";
        [Serializable] sealed class S3Item { public string path; public int w0,h0,w1,h1; }
        [Serializable] sealed class S3Actions { public string[] mipOff; public S3Item[] resize; public S3Item[] pad; public string[] hold; }
        [Serializable] sealed class S3Row { public string action,path,status,note; public int w0,h0,w1,h1; public long bytes0,bytes1; }
        [Serializable] sealed class S3Receipt
        {
            public bool scene3d,auditMatched; public string auditExpected=S3AuditSha256,auditActual="",webArgs="",indexPatched="";
            public string[] scenes; public List<S3Row> rows=new List<S3Row>();
        }
        static S3Receipt s3Receipt;
        static string[] BuildScenes() { return Arg("-scene3d")=="true" ? new[]{ScenePath,Scene3DPath} : new[]{ScenePath}; }
        static void S3Report()
        {
            if(s3Receipt!=null && !string.IsNullOrEmpty(Arg("-s3Receipt"))) WriteText(Arg("-s3Receipt"),JsonUtility.ToJson(s3Receipt,true));
        }
        static void S3Row3(string action,string path,string status,string note="",int w0=0,int h0=0,int w1=0,int h1=0,long b0=0,long b1=0)
        { s3Receipt.rows.Add(new S3Row { action=action,path=path,status=status,note=note,w0=w0,h0=h0,w1=w1,h1=h1,bytes0=b0,bytes1=b1 }); }

        static void PrepareS3(Slim2State s)
        {
            s3Receipt=new S3Receipt { scene3d=Arg("-scene3d")=="true",webArgs=Arg("-webArgs")??"",scenes=BuildScenes() };
            foreach(var scene in s3Receipt.scenes) if(!File.Exists(scene)) throw new FileNotFoundException(scene);
            var file=Arg("-s3Actions"); if(string.IsNullOrEmpty(file)) { S3Report(); return; }
            s3Receipt.auditActual=AuditSignature(); s3Receipt.auditMatched=s3Receipt.auditActual==S3AuditSha256;
            if(!s3Receipt.auditMatched)
                throw new InvalidOperationException("S3 audit changed: re-audit runtime/JSON before staging. actual="+s3Receipt.auditActual);
            var a=JsonUtility.FromJson<S3Actions>(File.ReadAllText(file));
            ApplyS3Hold(s,a.hold??new string[0]);
            ApplyS3MipOff(s,a.mipOff??new string[0]);
            foreach(var item in a.resize??new S3Item[0]) ApplyS3Pixels(s,"resize",item);
            foreach(var item in a.pad??new S3Item[0]) ApplyS3Pixels(s,"pad",item);
            if(Arg("-s3Audio")=="q05") ApplyS3Audio(s);
            S3Report();
        }
        static void ApplyS3Hold(Slim2State s,string[] hold)
        {
            if(hold.Length==0)return;
            var candidates=new HashSet<string>(hold,StringComparer.Ordinal);
            var roots=AssetDatabase.GetAllAssetPaths().Where(p=>p.StartsWith("Assets/",StringComparison.Ordinal) &&
                (p.Contains("/Resources/")||p.StartsWith("Assets/StreamingAssets/",StringComparison.Ordinal)) &&
                !candidates.Contains(p)&&File.Exists(FullAsset(p))).Concat(BuildScenes()).ToArray();
            var referenced=new HashSet<string>(AssetDatabase.GetDependencies(roots,true),StringComparer.Ordinal);
            foreach(var p in hold)
            {
                if(!File.Exists(FullAsset(p))) { S3Row3("hold",p,"kept","missing"); continue; }
                if(referenced.Contains(p)) { S3Row3("hold",p,"kept","serialized dependency from a build root"); continue; }
                long bytes=new FileInfo(FullAsset(p)).Length; s.stage.HoldAsset(p); S3Row3("hold",p,"held","",0,0,0,0,bytes,0);
            }
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
        }
        static void ApplyS3MipOff(Slim2State s,string[] paths)
        {
            // CTO condition: 3D material textures stay as they are. mipmapEnabled has no WebGL-only field, so it is staged and restored.
            var mats=AssetDatabase.FindAssets("t:Material").Select(AssetDatabase.GUIDToAssetPath).Where(p=>p.StartsWith("Assets/",StringComparison.Ordinal)).ToArray();
            var usedBy3D=new HashSet<string>(AssetDatabase.GetDependencies(mats.Concat(new[]{Scene3DPath}).ToArray(),true),StringComparer.Ordinal);
            foreach(var p in paths)
            {
                var imp=AssetImporter.GetAtPath(p) as TextureImporter;
                if(imp==null) { S3Row3("mipOff",p,"kept","no texture importer"); continue; }
                if(usedBy3D.Contains(p)) { S3Row3("mipOff",p,"kept","referenced by a material or the 3D scene"); continue; }
                if(!imp.mipmapEnabled) { S3Row3("mipOff",p,"kept","already off"); continue; }
                s.stage.PreserveMeta(p); WebBuildImportOverride.MipOff.Add(p); imp.mipmapEnabled=false; imp.SaveAndReimport();
                // SourceTextureImporter.cs:43 turns mips back on during import for /ui/ paths, so read the result back. Run 3 reported "applied" without this and all 100 stayed on.
                imp=(TextureImporter)AssetImporter.GetAtPath(p);
                S3Row3("mipOff",p,imp.mipmapEnabled?"not-applied":"applied",imp.mipmapEnabled?"re-enabled by import postprocessor":"");
            }
        }
        static long AudioCompSize(AudioImporter i)
        {
            var p=typeof(AudioImporter).GetProperty("compSize",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Public);
            return p==null?-1:Convert.ToInt64(p.GetValue(i));
        }
        // CTO allowed this for run 4 only: WebGL overrides are refused for every codec (audio-probe/vorbis.txt), so the shared default is staged and restored.
        // Quality is what changes size; AAC and Vorbis requests gave identical sizes for all 154 clips (audio-probe/default.csv).
        static void ApplyS3Audio(Slim2State s)
        {
            foreach(var g in AssetDatabase.FindAssets("t:AudioClip",new[]{"Assets/Exoduser/Resources/Audio"}).OrderBy(x=>x,StringComparer.Ordinal))
            {
                var p=AssetDatabase.GUIDToAssetPath(g); var imp=AssetImporter.GetAtPath(p) as AudioImporter; if(imp==null) continue;
                var clip=AssetDatabase.LoadAssetAtPath<AudioClip>(p); bool longClip=clip!=null&&clip.length>1; if(clip!=null) Resources.UnloadAsset(clip);
                if(!longClip) continue;
                long before=AudioCompSize(imp); var d=imp.defaultSampleSettings;
                d.compressionFormat=AudioCompressionFormat.Vorbis; d.loadType=AudioClipLoadType.CompressedInMemory; d.quality=.5f;
                s.stage.PreserveMeta(p); WebBuildImportOverride.Audio[p]=d; imp.SaveAndReimport();
                imp=(AudioImporter)AssetImporter.GetAtPath(p); long after=AudioCompSize(imp);
                S3Row3("audioQ05",p,after>0&&after<before?"applied":"no-reduction","",0,0,0,0,before,after);
            }
        }
        // Height 1080, width follows the window ratio up to 3840, the same design rule as NativeUiSafeArea.cs:4 and NativeUiEdgeArea (h/1080, Width=w/s). CSS fits it to the window. Template text only, no runtime change.
        static void PatchCanvas(ref string text)
        {
            string[][] edits={
                new[]{"width=\"960\" height=\"600\"","width=\"1920\" height=\"1080\""},
                new[]{"// config.matchWebGLToCanvasSize = false;","config.matchWebGLToCanvasSize = false;"},
                new[]{"fullscreenContainer.style.width = \"960px\";","var fit=function(){var W=Math.min(3840,Math.round(1080*innerWidth/innerHeight));if(canvas.width!==W)canvas.width=W;if(canvas.height!==1080)canvas.height=1080;var s=Math.min(innerWidth/W,innerHeight/1080);fullscreenContainer.style.width=(W*s)+\"px\";fullscreenContainer.style.height=(1080*s)+\"px\";};fit();addEventListener(\"resize\",fit);"},
                new[]{"fullscreenContainer.style.height = \"600px\";",""},
                new[]{"</head>","<style>html,body{background:#000;overflow:hidden}#unity-footer{display:none}</style></head>"},
            };
            foreach(var e in edits)
            {
                if(!text.Contains(e[0])) throw new InvalidOperationException("index.html template text not found: "+e[0]);
                text=text.Replace(e[0],e[1]);
            }
        }
        static void ApplyS3Pixels(Slim2State s,string action,S3Item item)
        {
            var path=item.path; var imp=AssetImporter.GetAtPath(path) as TextureImporter;
            if(imp==null||!path.EndsWith(".png",StringComparison.OrdinalIgnoreCase)) { S3Row3(action,path,"kept","needs a PNG texture importer"); return; }
            if(imp.npotScale!=TextureImporterNPOTScale.None) { S3Row3(action,path,"kept","npotScale is not None"); return; }
            int w,h; imp.GetSourceTextureWidthAndHeight(out w,out h);
            if(w!=item.w0||h!=item.h0) { S3Row3(action,path,"kept","source dimensions differ from audit",w,h); return; }
            Texture2D input=null,output=null;
            try
            {
                byte[] original=File.ReadAllBytes(FullAsset(path));
                input=new Texture2D(2,2,TextureFormat.RGBA32,false,false);
                if(!ImageConversion.LoadImage(input,original,false)||input.width!=w||input.height!=h) throw new InvalidOperationException("source PNG decode mismatch: "+path);
                var colors=input.GetPixels32(); Color32[] pixels;
                if(action=="pad") pixels=PadRightBottom(colors,w,h,item.w1,item.h1);
                else
                {
                    var rgba=new byte[colors.Length*4];
                    for(int i=0;i<colors.Length;i++) { rgba[i*4]=colors[i].r;rgba[i*4+1]=colors[i].g;rgba[i*4+2]=colors[i].b;rgba[i*4+3]=colors[i].a; }
                    var resized=WebBuildResizePixels.ResizeRgba(rgba,w,h,item.w1,item.h1);
                    pixels=new Color32[resized.Length/4];
                    for(int i=0;i<pixels.Length;i++) pixels[i]=new Color32(resized[i*4],resized[i*4+1],resized[i*4+2],resized[i*4+3]);
                }
                output=new Texture2D(item.w1,item.h1,TextureFormat.RGBA32,false,false);
                output.SetPixels32(pixels); output.Apply(false,false);
                byte[] png=ImageConversion.EncodeToPNG(output);
                if(png==null||png.Length==0) throw new InvalidOperationException("PNG encode failed: "+path);
                s.stage.PreserveAsset(path); File.WriteAllBytes(FullAsset(path),png);
                AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport|ImportAssetOptions.ForceUpdate);
                var actual=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                if(actual==null||actual.width!=item.w1||actual.height!=item.h1) throw new InvalidOperationException("import dimensions differ: "+path);
                Resources.UnloadAsset(actual);
                S3Row3(action,path,"applied","",w,h,item.w1,item.h1,original.Length,png.Length);
            }
            finally
            {
                if(input!=null)UnityEngine.Object.DestroyImmediate(input);
                if(output!=null)UnityEngine.Object.DestroyImmediate(output);
            }
        }
        // GetPixels32 row 0 is the image bottom. Adding rows at the image bottom and columns at the right keeps every top-based rect on the same source pixels
        // (NativeGame.cs:536 converts with texture.height-top-height).
        static Color32[] PadRightBottom(Color32[] src,int w,int h,int W,int H)
        {
            int down=H-h; var dst=new Color32[W*H];
            for(int y=0;y<H;y++) for(int x=0;x<W;x++) dst[y*W+x]=src[Mathf.Clamp(y-down,0,h-1)*w+Mathf.Min(x,w-1)];
            return dst;
        }
        static void PatchWebArgs(string outDir)
        {
            var value=Arg("-webArgs"); bool canvas=Arg("-canvas1920")=="true"; if(string.IsNullOrEmpty(value)&&!canvas) return;
            var index=Path.Combine(outDir,"index.html"); var text=File.ReadAllText(index); var list="";
            if(!string.IsNullOrEmpty(value))
            {
                list="["+string.Join(", ",value.Split(new[]{';'},StringSplitOptions.RemoveEmptyEntries).Select(v=>"\""+v+"\""))+"]";
                var patched=text.Replace("arguments: []","arguments: "+list);
                if(patched==text) throw new InvalidOperationException("index.html has no empty arguments list");
                text=patched;
            }
            if(canvas) { PatchCanvas(ref text); list+=" canvas1920"; }
            File.WriteAllText(index,text); s3Receipt.indexPatched=list; S3Report();
        }
    }
}
