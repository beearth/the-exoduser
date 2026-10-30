using UnityEditor;
public sealed class SourceTextureImporter : AssetPostprocessor
{
 public override uint GetVersion(){return 3;}
 void OnPreprocessTexture()
 {
  if(!assetPath.StartsWith("Assets/Exoduser/Resources/Art/"))return;
  var t=(TextureImporter)assetImporter;
  var name=System.IO.Path.GetFileNameWithoutExtension(assetPath);
  bool a2=assetPath.StartsWith("Assets/Exoduser/Resources/Art/map/a2/");
  bool a2Ground=assetPath.StartsWith("Assets/Exoduser/Resources/Art/map/a2/ground/");
  bool pbr=assetPath.StartsWith("Assets/Exoduser/Resources/Art/map/hell_lighting/")&&
   (name=="rock_ground_Diffuse"||name=="rock_ground_nor_gl"||name=="rock_ground_Rough"||name=="burned_ground_01_Diffuse"||name=="bark_brown_02_Diffuse"||name=="bark_brown_02_nor_gl"||name=="bark_brown_02_Rough");
  if(a2||pbr)
  {
   bool normal=name.EndsWith("_nor_gl")||name.EndsWith("_Normal");
   bool color=name.EndsWith("_Diffuse")||name.EndsWith("_BaseColor");
   t.textureType=normal?TextureImporterType.NormalMap:TextureImporterType.Default;t.textureShape=TextureImporterShape.Texture2D;t.sRGBTexture=color;
   t.mipmapEnabled=true;t.alphaIsTransparency=a2&&color;t.npotScale=TextureImporterNPOTScale.None;
   t.maxTextureSize=2048;t.textureCompression=TextureImporterCompression.CompressedHQ;t.wrapMode=a2&&!a2Ground?UnityEngine.TextureWrapMode.Clamp:UnityEngine.TextureWrapMode.Repeat;
   t.filterMode=UnityEngine.FilterMode.Trilinear;t.anisoLevel=8;return;
  }
  t.textureType=TextureImporterType.Default;t.textureShape=TextureImporterShape.Texture2D;t.mipmapEnabled=false;t.alphaIsTransparency=true;t.npotScale=TextureImporterNPOTScale.None;
  t.maxTextureSize=8192;t.textureCompression=TextureImporterCompression.Uncompressed;t.wrapMode=UnityEngine.TextureWrapMode.Clamp;
  bool silverUi=assetPath.Contains("/ui/")||assetPath.Contains("/skill_icons/")||assetPath.Contains("/ui/stat/node_")||assetPath.Contains("/ui/skill/disc_")||assetPath.Contains("/ui/inventory/unique/")||assetPath.EndsWith("/lobby/logo_exoduser.png")||assetPath.EndsWith("/lobby/title_logo.png")||assetPath.EndsWith("/lobby/brand_logo.png");
  if(silverUi){t.mipmapEnabled=true;t.filterMode=UnityEngine.FilterMode.Trilinear;}else
  t.filterMode=assetPath.Contains("/player/")||assetPath.Contains("/enemy/")?UnityEngine.FilterMode.Point:UnityEngine.FilterMode.Bilinear;
 }
}
