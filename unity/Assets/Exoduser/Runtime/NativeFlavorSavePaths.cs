using System;
using System.Collections.Generic;
using System.IO;

namespace Exoduser.UnityPort
{
 // Routing/migration only: the existing store schemas and codecs stay unchanged.
 public static class NativeFlavorSavePaths
 {
  public const string LegacyProductName="EXODUSER · Unity 이식 검증판";
  static readonly string[] Stores={"character-roster-v1","combat-save-v1","native-settings-v1"};
  static void RejectLink(string path){if((File.GetAttributes(path)&FileAttributes.ReparsePoint)!=0)throw new IOException("Linked save paths cannot be imported.");}
  static bool HasStores(string root){foreach(var name in Stores)if(Directory.Exists(Path.Combine(root,name)))return true;return false;}
  public static string[] LegacyRoots(string persistentRoot,string company,bool mac)
  {
   var parent=Directory.GetParent(persistentRoot);if(parent==null)return new string[0];
   if(!mac)return new[]{Path.Combine(parent.FullName,LegacyProductName)};
   // Unity macOS Player may use unity.company.product; Editor uses company/product.
   string support=parent.Name==company&&parent.Parent!=null?parent.Parent.FullName:parent.FullName;
   return new[]{Path.Combine(support,company,LegacyProductName),Path.Combine(support,"unity."+company+"."+LegacyProductName)};
  }
  public static bool TryPrepare(string persistentRoot,string saveNamespace,bool full,string legacyRoot,bool sandbox,out string directory,out string error)
  {return TryPrepare(persistentRoot,saveNamespace,full,string.IsNullOrEmpty(legacyRoot)?new string[0]:new[]{legacyRoot},sandbox,out directory,out error);}
  public static bool TryPrepare(string persistentRoot,string saveNamespace,bool full,string[] legacyRoots,bool sandbox,out string directory,out string error)
  {
   directory="";error="";
   try{
    if(string.IsNullOrWhiteSpace(persistentRoot)||!Path.IsPathRooted(persistentRoot)||string.IsNullOrEmpty(saveNamespace))throw new ArgumentException("Absolute save root and flavor namespace required.");
    foreach(char c in saveNamespace)if(!(c>='A'&&c<='Z'||c>='a'&&c<='z'||c>='0'&&c<='9'||c=='-'||c=='_'))throw new ArgumentException("Invalid save namespace.");
    string root=Path.GetFullPath(persistentRoot),target=Path.Combine(root,saveNamespace),stage=target+".legacy-import";
    if(File.Exists(target)||File.Exists(stage)||Directory.Exists(stage))throw new IOException("Unfinished or conflicting save import. Original saves preserved.");
    if(Directory.Exists(target)){RejectLink(target);directory=target;return true;}
    // QA never probes real saves. Demo/BIC/EA never inherit the historically shared full save.
    string source=null;
    if(!sandbox){
     foreach(string legacyRoot in legacyRoots){
      string qualified=Path.Combine(legacyRoot,saveNamespace);
      if(Directory.Exists(qualified)){source=qualified;break;}
     }
     if(source==null&&full&&HasStores(root))source=root;
     if(source==null&&full)foreach(string legacyRoot in legacyRoots)if(HasStores(legacyRoot)){source=legacyRoot;break;}
    }
    if(source!=null){
     RejectLink(source);
     // A single fixed staging directory, never overwrite, never modify/delete the source.
     Directory.CreateDirectory(stage);
     var streams=new List<FileStream>();
     try{
      foreach(string store in Stores){
       string from=Path.Combine(source,store);if(!Directory.Exists(from))continue;RejectLink(from);
       if(Directory.GetDirectories(from).Length!=0)throw new IOException("Unexpected save subdirectory.");
       string to=Path.Combine(stage,store);Directory.CreateDirectory(to);
       foreach(string file in Directory.GetFiles(from)){
        string ext=Path.GetExtension(file);if(ext!=".json"&&ext!=".bak")continue;
        RejectLink(file);
        // Keep every source open read-only until commit, rejecting an active writer.
        var input=new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.Read);streams.Add(input);
        using(var output=new FileStream(Path.Combine(to,Path.GetFileName(file)),FileMode.CreateNew,FileAccess.Write,FileShare.None)){input.CopyTo(output);output.Flush(true);}
       }
      }
      Directory.Move(stage,target);
     }finally{foreach(var stream in streams)stream.Dispose();}
    }
    directory=target;return true;
   }catch(Exception e) when(e is IOException||e is UnauthorizedAccessException||e is ArgumentException||e is NotSupportedException){error=e.Message;return false;}
  }
 }
}
