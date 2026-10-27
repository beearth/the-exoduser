using UnityEditor;
using UnityEngine;
public sealed class SourceAudioImporter : AssetPostprocessor
{
 public override uint GetVersion(){return 3;}
 void OnPreprocessAudio()
 {
  if(!assetPath.StartsWith("Assets/Exoduser/Resources/Audio/"))return;
  var importer=(AudioImporter)assetImporter;var settings=importer.defaultSampleSettings;
  if(assetPath.StartsWith("Assets/Exoduser/Resources/Audio/Bgm/"))
  {
   // RM-1 sound A1: the game BGM tracks are 2-6 MB mp3s -- stream them instead of decompressing to PCM at load.
   settings.loadType=AudioClipLoadType.CompressedInMemory;settings.compressionFormat=AudioCompressionFormat.MP3;settings.quality=.7f;settings.sampleRateSetting=AudioSampleRateSetting.PreserveSampleRate;
   settings.preloadAudioData=false;
   importer.defaultSampleSettings=settings;importer.forceToMono=false;importer.loadInBackground=true;
   return;
  }
  settings.loadType=AudioClipLoadType.DecompressOnLoad;settings.compressionFormat=AudioCompressionFormat.PCM;settings.sampleRateSetting=AudioSampleRateSetting.PreserveSampleRate;
        settings.preloadAudioData=true;
        importer.defaultSampleSettings=settings;importer.forceToMono=false;importer.loadInBackground=false;
 }
}
