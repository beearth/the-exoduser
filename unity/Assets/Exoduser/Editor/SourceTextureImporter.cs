using UnityEditor;
public sealed class SourceTextureImporter : AssetPostprocessor
{
 public override uint GetVersion(){return 2;}
 void OnPreprocessTexture()
 {
  if(!assetPath.StartsWith("Assets/Exoduser/Resources/Art/"))return;
  var t=(TextureImporter)assetImporter;
  var name=System.IO.Path.GetFileNameWithoutExtension(assetPath);
  if(assetPath.StartsWith("Assets/Exoduser/Resources/Art/map/hell_lighting/")&&
   (name=="rock_ground_Diffuse"||name=="rock_ground_nor_gl"||name=="rock_ground_Rough"||name=="burned_ground_01_Diffuse"||name=="bark_brown_02_Diffuse"||name=="bark_brown_02_nor_gl"||name=="bark_brown_02_Rough"))
  {
   bool normal=name.EndsWith("_nor_gl"),rough=name.EndsWith("_Rough");
   t.textureType=normal?TextureImporterType.NormalMap:TextureImporterType.Default;t.textureShape=TextureImporterShape.Texture2D;t.sRGBTexture=!normal&&!rough;
   t.mipmapEnabled=true;t.alphaIsTransparency=false;t.alphaSource=TextureImporterAlphaSource.None;t.npotScale=TextureImporterNPOTScale.None;
   t.maxTextureSize=2048;t.textureCompression=TextureImporterCompression.CompressedHQ;t.wrapMode=UnityEngine.TextureWrapMode.Repeat;
   t.filterMode=UnityEngine.FilterMode.Trilinear;t.anisoLevel=8;return;
  }
  t.textureType=TextureImporterType.Default;t.textureShape=TextureImporterShape.Texture2D;t.mipmapEnabled=false;t.alphaIsTransparency=true;t.npotScale=TextureImporterNPOTScale.None;
  t.maxTextureSize=8192;t.textureCompression=TextureImporterCompression.Uncompressed;t.wrapMode=UnityEngine.TextureWrapMode.Clamp;
  t.filterMode=assetPath.Contains("/player/")||assetPath.Contains("/enemy/")?UnityEngine.FilterMode.Point:UnityEngine.FilterMode.Bilinear;
 }
}
