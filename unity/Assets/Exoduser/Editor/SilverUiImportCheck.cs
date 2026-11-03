using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

// Mac Editor gate only. PC lanes use compilation and leave this import/visual gate to Mac.
public static class SilverUiImportCheck
{
 [Serializable] sealed class Row {public string asset;public int mipmapCount;public bool noMipmaps,bilinear,metaUnchanged;}
 [Serializable] sealed class Receipt {public bool passed;public string scope="targeted import twice and loaded Texture2D; Player/visual gate remains separate";public List<Row> rows=new List<Row>();}
 public static void Run()
 {
  string output=null;var args=Environment.GetCommandLineArgs();for(int i=0;i+1<args.Length;i++)if(args[i]=="-output")output=args[i+1];
  if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))throw new ArgumentException("-output must be an absolute receipt directory");
  Directory.CreateDirectory(output);var receipt=new Receipt{passed=true};
  foreach(var path in Directory.GetFiles("Assets/Exoduser/Resources/Art/ui/silver_hell","*.png"))
  {
   string asset=path.Replace('\\','/');if(!SourceTextureImporter.OriginalUiNoMipmaps(asset))continue;
   string meta=asset+".meta",before=File.ReadAllText(meta);
   AssetDatabase.ImportAsset(asset,ImportAssetOptions.ForceUpdate|ImportAssetOptions.ForceSynchronousImport);
   string first=File.ReadAllText(meta);
   AssetDatabase.ImportAsset(asset,ImportAssetOptions.ForceUpdate|ImportAssetOptions.ForceSynchronousImport);
   var importer=(TextureImporter)AssetImporter.GetAtPath(asset);var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(asset);
   var row=new Row{asset=asset,mipmapCount=texture==null?0:texture.mipmapCount,noMipmaps=!importer.mipmapEnabled,bilinear=importer.filterMode==FilterMode.Bilinear,metaUnchanged=before==first&&first==File.ReadAllText(meta)};
   receipt.rows.Add(row);receipt.passed&=row.mipmapCount==1&&row.noMipmaps&&row.bilinear&&row.metaUnchanged;
  }
  receipt.passed&=receipt.rows.Count>=15;
  File.WriteAllText(Path.Combine(output,"silver-ui-import.json"),JsonUtility.ToJson(receipt,true));
  Debug.Log("SILVER_UI_IMPORT passed="+receipt.passed+" assets="+receipt.rows.Count);
  if(!receipt.passed)throw new InvalidOperationException("Silver UI import settings/meta gate failed; inspect silver-ui-import.json");
 }
}
