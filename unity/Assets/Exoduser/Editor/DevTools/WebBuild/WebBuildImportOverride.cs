using System.Collections.Generic;
using UnityEditor;

namespace Exoduser.DevTools
{
    // WebGL build staging only. Runs after SourceTextureImporter / SourceAudioImporter without changing their rules.
    // The sets are empty outside WebBuild.PrepareS3, and RestoreS2 clears them before the staged metas are restored.
    internal sealed class WebBuildImportOverride : AssetPostprocessor
    {
        internal static readonly HashSet<string> MipOff = new HashSet<string>();
        internal static readonly Dictionary<string,AudioImporterSampleSettings> Audio = new Dictionary<string,AudioImporterSampleSettings>();
        internal static void Clear() { MipOff.Clear(); Audio.Clear(); }
        public override int GetPostprocessOrder() { return 1000; }
        void OnPreprocessTexture() { if(MipOff.Contains(assetPath)) ((TextureImporter)assetImporter).mipmapEnabled=false; }
        void OnPreprocessAudio() { if(Audio.TryGetValue(assetPath,out var s)) ((AudioImporter)assetImporter).defaultSampleSettings=s; }
    }
}
