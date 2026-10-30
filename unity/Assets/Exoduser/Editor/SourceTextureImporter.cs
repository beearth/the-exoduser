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
  bool silverUi=assetPath.Contains("/ui/silver_hell/")||assetPath.EndsWith("/lobby/logo_exoduser.png")||assetPath.EndsWith("/lobby/title_logo.png")||assetPath.EndsWith("/lobby/brand_logo.png");
  if(silverUi){t.mipmapEnabled=true;t.filterMode=UnityEngine.FilterMode.Trilinear;}else
  t.filterMode=assetPath.Contains("/player/")||assetPath.Contains("/enemy/")?UnityEngine.FilterMode.Point:UnityEngine.FilterMode.Bilinear;
 }
}
