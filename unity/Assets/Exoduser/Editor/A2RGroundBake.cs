using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Security.Cryptography;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditorInternal;
using UnityEngine;
using UnityEngine.Experimental.Rendering;
using UnityEngine.Rendering;

namespace Exoduser
{
    // Native-format texel copy. Never resamples, recompresses or generates mipmaps.
    public static class A2RGroundBake
    {
        const string Root="Assets/Exoduser/Resources/A2R/Baked/Ground";
        const string Source="Assets/Exoduser/Resources/A2R/C10/Art/";
        internal static string Disk(string asset){return Path.GetFullPath(Path.Combine(Application.dataPath,"..",asset));}
        const int SlicesPerPack=16; // Raw RGBA32 1000px full-mip pack stays below Git's 100 MiB limit.
        [Serializable] sealed class Input { public Tile[] groundTiles; }
        [Serializable] sealed class Tile { public string asset; }
        [Serializable] sealed class Manifest { public int version=1; public string sourceHash; public List<Pack> packs=new List<Pack>(); }
        [Serializable] sealed class Pack { public string resource; public string[] ids; }
        sealed class SourceTexture { public string id; public Texture2D texture; }
        static Input ReadInput() { return JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text); }
        static string[] SourceIds()
        {
            var result=new List<string>();foreach(var tile in ReadInput().groundTiles)
                foreach(var suffix in new[]{"","_normal","_mask"})result.Add(tile.asset+suffix);
            if(result.Count!=192 || new HashSet<string>(result,StringComparer.Ordinal).Count!=192)
                throw new InvalidOperationException("Ground bake requires exactly 192 unique source images");
            return result.ToArray();
        }
        static string SourceHash()
        {
            var text=new StringBuilder();foreach(string id in SourceIds())
                text.Append(id).Append(':').Append(AssetDatabase.GetAssetDependencyHash(Source+id+".png")).Append('\n');
            using(var hash=SHA256.Create())return BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(text.ToString()))).Replace("-","");
        }
        public static void Bake()
        {
            int limit=QualitySettings.globalTextureMipmapLimit;
            try{QualitySettings.globalTextureMipmapLimit=0;BakeFullResolution();}
            finally{QualitySettings.globalTextureMipmapLimit=limit;}
        }
        static void BakeFullResolution()
        {
            Directory.CreateDirectory(Disk(Root));
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            var groups=new Dictionary<string,List<SourceTexture>>(StringComparer.Ordinal);
            foreach(string id in SourceIds())
            {
                var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(Source+id+".png");
                if(texture==null)throw new InvalidOperationException("Missing ground texture: "+id);
                string role=id.EndsWith("_normal",StringComparison.Ordinal)?"normal":id.EndsWith("_mask",StringComparison.Ordinal)?"mask":"paint";
                string key=role+":"+texture.graphicsFormat+":"+texture.width+":"+texture.height+":"+texture.mipmapCount+
                    ":"+texture.filterMode+":"+texture.anisoLevel+":"+texture.wrapModeU+":"+texture.wrapModeV+":"+texture.wrapModeW+
                    ":"+texture.mipMapBias.ToString("R",System.Globalization.CultureInfo.InvariantCulture)+":"+texture.ignoreMipmapLimit+":"+texture.mipmapLimitGroup;
                List<SourceTexture> group;if(!groups.TryGetValue(key,out group))groups.Add(key,group=new List<SourceTexture>());
                group.Add(new SourceTexture{id=id,texture=texture});
            }
            var manifest=new Manifest{sourceHash=SourceHash()};int packNumber=0;
            foreach(var group in groups.Values)for(int start=0;start<group.Count;start+=SlicesPerPack)
            {
                int count=Math.Min(SlicesPerPack,group.Count-start);var reference=group[start].texture;
                var array=new Texture2DArray(reference.width,reference.height,count,reference.graphicsFormat,reference.mipmapCount>1?TextureCreationFlags.MipChain:TextureCreationFlags.None,reference.mipmapCount,new MipmapLimitDescriptor(!reference.ignoreMipmapLimit,reference.mipmapLimitGroup))
                    {name="A2R exact ground "+packNumber,filterMode=reference.filterMode,anisoLevel=reference.anisoLevel,
                        wrapModeU=reference.wrapModeU,wrapModeV=reference.wrapModeV,wrapModeW=reference.wrapModeW,mipMapBias=reference.mipMapBias};
                string name="pack-"+packNumber.ToString("D2"),asset=Root+"/"+name+".asset";
                var pack=new Pack{resource="A2R/Baked/Ground/"+name,ids=new string[count]};
                try
                {
                    if(array.graphicsFormat!=reference.graphicsFormat || array.mipmapCount!=reference.mipmapCount)throw new InvalidOperationException("Unsupported exact ground format: "+reference.graphicsFormat);
                    for(int slice=0;slice<count;slice++)
                    {
                        var item=group[start+slice];pack.ids[slice]=item.id;
                        for(int mip=0;mip<item.texture.mipmapCount;mip++)
                        {
                            var read=AsyncGPUReadback.Request(item.texture,mip);read.WaitForCompletion();
                            if(read.hasError)throw new InvalidOperationException("Ground GPU readback failed: "+item.id+" mip="+mip);
                            array.SetPixelData(read.GetData<byte>(),mip,slice);
                        }
                    }
                    array.Apply(false,false);
                    // Keep serialized upload bytes, but prevent a second readable copy in the Player.
                    var serialized=new SerializedObject(array);var readable=serialized.FindProperty("m_IsReadable");
                    if(readable==null)throw new InvalidOperationException("Texture2DArray readable serialization contract missing");
                    readable.boolValue=false;serialized.ApplyModifiedPropertiesWithoutUndo();
                    InternalEditorUtility.SaveToSerializedFileAndForget(new UnityEngine.Object[]{array},Disk(asset),false);
                }
                finally{UnityEngine.Object.DestroyImmediate(array);}
                AssetDatabase.ImportAsset(asset,ImportAssetOptions.ForceSynchronousImport|ImportAssetOptions.ForceUpdate);
                if(new FileInfo(Disk(asset)).Length>=100L*1024*1024)throw new InvalidOperationException("Ground pack exceeds 100 MiB: "+asset);
                manifest.packs.Add(pack);packNumber++;
            }
            File.WriteAllText(Disk(Root+"/manifest.json"),JsonUtility.ToJson(manifest,true));
            AssetDatabase.ImportAsset(Root+"/manifest.json",ImportAssetOptions.ForceSynchronousImport|ImportAssetOptions.ForceUpdate);
            AssetDatabase.SaveAssets();
            Debug.Log("A2R_GROUND_BAKED sourceImages=192 packs="+packNumber+" mipGeneration=0 recompression=0 resampling=0");
        }
        public static void ValidateFresh()
        {
            var text=AssetDatabase.LoadAssetAtPath<TextAsset>(Root+"/manifest.json");
            if(text==null)throw new BuildFailedException("Missing A2R ground bake; run Exoduser.A2RGroundBake.Bake");
            var manifest=JsonUtility.FromJson<Manifest>(text.text);
            if(manifest.version!=1 || manifest.sourceHash!=SourceHash())throw new BuildFailedException("Stale A2R ground bake: source/import settings changed");
            foreach(var pack in manifest.packs)if(Resources.Load<Texture2DArray>(pack.resource)==null)
                throw new BuildFailedException("Missing A2R ground pack: "+pack.resource);
        }
        public static void BakeVerifyBuild()
        {
            if(Resources.Load<TextAsset>("A2R/Baked/Ground/manifest")==null)
            {
                bool rejected=false;
                try{A2RGroundBakeVerification.InspectAndRequireBake();}
                catch(InvalidOperationException error)when(error.Message.StartsWith("A2R_GROUND_EXPECTED_RED:",StringComparison.Ordinal))
                {rejected=true;Debug.Log("A2R_GROUND_EXPECTED_RED_CONFIRMED missing bake rejected before generation");}
                if(!rejected)throw new InvalidOperationException("Missing bake was not rejected by the verification");
            }
            A2RGroundBakeProbeVerification.Verify();Bake();ValidateFresh();A2RGroundBakeVerification.VerifyBake();
            if(A2RBuilder.Build()!=0)throw new BuildFailedException("A2R loadprof Player build failed");
        }
    }
    public sealed class A2RGroundBakeBuildGuard : IPreprocessBuildWithReport
    {
        public int callbackOrder {get{return 0;}}
        public void OnPreprocessBuild(BuildReport report)
        {
            if(File.Exists(A2RGroundBake.Disk("Assets/Exoduser/Resources/A2R/Baked/Ground/manifest.json")))A2RGroundBake.ValidateFresh();
        }
    }
}
