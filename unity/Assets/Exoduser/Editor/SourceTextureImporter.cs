using UnityEditor;
public sealed class SourceTextureImporter : AssetPostprocessor
{
 public override uint GetVersion(){return 1;}
 void OnPreprocessTexture()
 {
  if(!assetPath.StartsWith("Assets/Exoduser/Resources/Art/"))return;
  var t=(TextureImporter)assetImporter;
  t.textureType=TextureImporterType.Default;t.textureShape=TextureImporterShape.Texture2D;t.mipmapEnabled=false;t.alphaIsTransparency=true;t.npotScale=TextureImporterNPOTScale.None;
  t.maxTextureSize=8192;t.textureCompression=TextureImporterCompression.Uncompressed;t.wrapMode=UnityEngine.TextureWrapMode.Clamp;
  t.filterMode=assetPath.Contains("/player/")||assetPath.Contains("/enemy/")?UnityEngine.FilterMode.Point:UnityEngine.FilterMode.Bilinear;
 }
}
