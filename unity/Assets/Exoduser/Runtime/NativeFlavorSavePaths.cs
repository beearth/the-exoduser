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
  static bool OsMetadata(string file){string name=Path.GetFileName(file);return name==".DS_Store"||string.Equals(name,"Thumbs.db",StringComparison.OrdinalIgnoreCase)||string.Equals(name,"desktop.ini",StringComparison.OrdinalIgnoreCase);}
  static Dictionary<string,long> CaptureStores(string root)
  {
   RejectLink(root);var files=new Dictionary<string,long>(StringComparer.Ordinal);
   foreach(string name in Stores){
    string store=Path.Combine(root,name);if(!Directory.Exists(store))continue;RejectLink(store);
    if(Directory.GetDirectories(store).Length!=0)throw new IOException("Unexpected save subdirectory.");
    files.Add("D:"+name,-1);int json=0,bak=0;
    foreach(string file in Directory.GetFiles(store)){
     RejectLink(file);if(OsMetadata(file))continue;
     string ext=Path.GetExtension(file);
     if(string.Equals(ext,".tmp",StringComparison.OrdinalIgnoreCase))throw new IOException("Save store contains an in-flight temporary file.");
     if(ext!=".json"&&ext!=".bak")continue;
     if(ext==".json")json++;else bak++;
     files.Add(name+"/"+Path.GetFileName(file),new FileInfo(file).Length);
    }
    if(bak>0&&json==0)throw new IOException("Backup-only save store cannot be imported.");
   }
   return files;
  }
  static bool SameSnapshot(Dictionary<string,long> a,Dictionary<string,long> b){if(a.Count!=b.Count)return false;foreach(var file in a)if(!b.TryGetValue(file.Key,out var size)||file.Value!=size)return false;return true;}
  static void ValidateImport(string source,string stage,Dictionary<string,long> original)
  {
   if(!SameSnapshot(original,CaptureStores(source))||!SameSnapshot(original,CaptureStores(stage)))throw new IOException("Save import source/staging file list or size changed before promotion.");
  }
  static string[] AbandonedStages(string root,string target)
  {
   var stages=new List<string>();string legacy=target+".legacy-import";if(Directory.Exists(legacy))stages.Add(legacy);
   if(Directory.Exists(root))foreach(string stage in Directory.GetDirectories(root,Path.GetFileName(legacy)+"-*")){
    string suffix=stage.Substring((legacy+"-").Length);if(Guid.TryParseExact(suffix,"N",out _))stages.Add(stage);
   }
   return stages.ToArray();
  }
  static void ClearStaging(string stage)
  {
   if(!Directory.Exists(stage))return;
   RejectLink(stage);
   // Old imports have no marker. Only the importer's flat store/copy layout is
   // reclaimable; links, unknown content and live writers remain fail-closed.
   var files=new List<string>();var handles=new List<FileStream>();
   try{
    foreach(string file in Directory.GetFiles(stage)){
     if(!OsMetadata(file))throw new IOException("Unexpected import staging file.");
     RejectLink(file);files.Add(file);handles.Add(new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.Delete));
    }
    foreach(string store in Directory.GetDirectories(stage)){
     if(Array.IndexOf(Stores,Path.GetFileName(store))<0)throw new IOException("Unexpected import staging directory.");
     RejectLink(store);
     if(Directory.GetDirectories(store).Length!=0)throw new IOException("Unexpected import staging subdirectory.");
     foreach(string file in Directory.GetFiles(store)){
      string ext=Path.GetExtension(file);if(ext!=".json"&&ext!=".bak"&&!OsMetadata(file))throw new IOException("Unexpected import staging content.");
      RejectLink(file);files.Add(file);
      // Preflight every file before deleting anything; deny active writers but
      // allow this cleanup to delete while these read-only handles are held.
      handles.Add(new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.Delete));
     }
    }
    foreach(string file in files)File.Delete(file);
    foreach(string store in Directory.GetDirectories(stage))Directory.Delete(store);
    Directory.Delete(stage);
   }finally{foreach(var handle in handles)handle.Dispose();}
  }
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
   directory="";error="";string ownedStage=null;FileStream lease=null;
   try{
    if(string.IsNullOrWhiteSpace(persistentRoot)||!Path.IsPathRooted(persistentRoot)||string.IsNullOrEmpty(saveNamespace))throw new ArgumentException("Absolute save root and flavor namespace required.");
    foreach(char c in saveNamespace)if(!(c>='A'&&c<='Z'||c>='a'&&c<='z'||c>='0'&&c<='9'||c=='-'||c=='_'))throw new ArgumentException("Invalid save namespace.");
    string root=Path.GetFullPath(persistentRoot),target=Path.Combine(root,saveNamespace),legacyStage=target+".legacy-import";
    if(File.Exists(target))throw new IOException("Conflicting save destination. Original saves preserved.");
    if(Directory.Exists(target)){RejectLink(target);directory=target;return true;}
    if(File.Exists(legacyStage))throw new IOException("Conflicting save import path. Original saves preserved.");
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
    if(source!=null||AbandonedStages(root,target).Length!=0){
     Directory.CreateDirectory(root);RejectLink(root);
     string lockPath=Path.Combine(root,"."+saveNamespace+".legacy-import.lock");
     bool createLease=!File.Exists(lockPath);
     if(!createLease)RejectLink(lockPath);
     // CreateNew proves ownership (a race fails closed). DeleteOnClose removes
     // only this new lease while its exclusive handle still protects the name;
     // an existing lease is opened without deletion or content changes.
     lease=new FileStream(lockPath,createLease?FileMode.CreateNew:FileMode.Open,FileAccess.ReadWrite,FileShare.None,4096,createLease?FileOptions.DeleteOnClose:FileOptions.None);
     // Recheck after taking the lease: a previous importer may have committed.
     if(Directory.Exists(target)){RejectLink(target);directory=target;return true;}
     if(File.Exists(target)||File.Exists(legacyStage))throw new IOException("Conflicting save import path. Original saves preserved.");
     // Opening a preexisting lock grants serialization, not ownership of old copies.
     if(createLease)foreach(string abandoned in AbandonedStages(root,target))ClearStaging(abandoned);
     else if(source==null&&AbandonedStages(root,target).Length!=0)throw new IOException("Abandoned staging requires a newly created import lease.");
    }
    if(source!=null){
     RejectLink(source);
     var original=CaptureStores(source);
     // Every attempt owns a distinct staging directory; catch never deletes a peer's.
     string stage=target+".legacy-import-"+Guid.NewGuid().ToString("N");
     Directory.CreateDirectory(stage);
     ownedStage=stage;
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
      ValidateImport(source,stage,original);
      Directory.Move(stage,target);
      ownedStage=null;
     }finally{foreach(var stream in streams)stream.Dispose();}
    }
    directory=target;return true;
   }catch(Exception e) when(e is IOException||e is UnauthorizedAccessException||e is ArgumentException||e is NotSupportedException){
    error=e.Message;
    if(ownedStage!=null)try{ClearStaging(ownedStage);}catch(Exception cleanup) when(cleanup is IOException||cleanup is UnauthorizedAccessException){error+=" Staging cleanup: "+cleanup.Message;}
    return false;
   }finally{if(lease!=null)lease.Dispose();}
  }
 }
}
