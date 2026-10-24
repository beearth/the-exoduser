using UnityEditor;
using UnityEngine;
public sealed class SourceAudioImporter : AssetPostprocessor
{
 public override uint GetVersion(){return 1;}
 void OnPreprocessAudio()
 {
  if(!assetPath.StartsWith("Assets/Exoduser/Resources/Audio/"))return;
  var importer=(AudioImporter)assetImporter;var settings=importer.defaultSampleSettings;
  settings.loadType=AudioClipLoadType.DecompressOnLoad;settings.compressionFormat=AudioCompressionFormat.PCM;settings.sampleRateSetting=AudioSampleRateSetting.PreserveSampleRate;
        settings.preloadAudioData=true;
        importer.defaultSampleSettings=settings;importer.forceToMono=false;importer.loadInBackground=false;
 }
}
