using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Exoduser.UnityPort
{
 // Routing/migration only: the existing store schemas and codecs stay unchanged.
 public static class NativeFlavorSavePaths
 {
  // Permanent problem in the old save itself (links, unknown layout, backup-only). Transient/busy IO stays a plain IOException.
  sealed class ImportContentException:IOException{public ImportContentException(string message):base(message){}}
  // Log text for the caller; ImportFailed means the old save could not be imported and the player starts fresh (the player is told).
  public sealed class PrepareReport{public string Notice="";public bool ImportFailed;}
  sealed class Marker{public string Status="",Source="",Target="";public long SourceNewest;}
  enum Decision{Keep,Reimport,Diverged}
  public const string LegacyProductName="EXODUSER · Unity 이식 검증판";
  static readonly string[] Stores={"character-roster-v1","combat-save-v1","native-settings-v1"};
  static void RejectLink(string path,bool content=true){if((File.GetAttributes(path)&FileAttributes.ReparsePoint)!=0){if(content)throw new ImportContentException("Linked save paths cannot be imported.");throw new IOException("Linked save paths cannot be imported.");}}
  static bool HasStores(string root){foreach(var name in Stores)if(Directory.Exists(Path.Combine(root,name)))return true;return false;}
  static bool OsMetadata(string file){string name=Path.GetFileName(file);return name==".DS_Store"||string.Equals(name,"Thumbs.db",StringComparison.OrdinalIgnoreCase)||string.Equals(name,"desktop.ini",StringComparison.OrdinalIgnoreCase);}
  static Dictionary<string,long> CaptureStores(string root)
  {
   RejectLink(root);var files=new Dictionary<string,long>(StringComparer.Ordinal);
   foreach(string name in Stores){
    string store=Path.Combine(root,name);if(!Directory.Exists(store))continue;RejectLink(store);
    if(Directory.GetDirectories(store).Length!=0)throw new ImportContentException("Unexpected save subdirectory.");
    files.Add("D:"+name,-1);int json=0,bak=0;
    foreach(string file in Directory.GetFiles(store)){
     RejectLink(file);if(OsMetadata(file))continue;
     string ext=Path.GetExtension(file);
     // Old WriteAtomic leaves .tmp behind after a crash; a temporary is never a save, so it is neither copied nor compared.
     if(ext!=".json"&&ext!=".bak")continue;
     if(ext==".json")json++;else bak++;
     files.Add(name+"/"+Path.GetFileName(file),new FileInfo(file).Length);
    }
    if(bak>0&&json==0)throw new ImportContentException("Backup-only save store cannot be imported.");
   }
   return files;
  }
  static bool SameSnapshot(Dictionary<string,long> a,Dictionary<string,long> b){if(a.Count!=b.Count)return false;foreach(var file in a)if(!b.TryGetValue(file.Key,out var size)||file.Value!=size)return false;return true;}
  static void ValidateImport(string source,string stage,Dictionary<string,long> original)
  {
   if(!SameSnapshot(original,CaptureStores(source))||!SameSnapshot(original,CaptureStores(stage)))throw new IOException("Save import source/staging file list or size changed before promotion.");
  }
  static string Hex(string text){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(text))).Replace("-","");}
  // File list, sizes and last-write times of the three stores (json/bak only). Tolerant: never throws on odd content.
  static string Fingerprint(string root,out long newest)
  {
   newest=0;if(!Directory.Exists(root))return "absent";var text=new StringBuilder();
   foreach(string name in Stores){
    string store=Path.Combine(root,name);if(!Directory.Exists(store))continue;text.Append("D:").Append(name).Append('\n');
    var files=Directory.GetFiles(store);Array.Sort(files,StringComparer.Ordinal);
    foreach(string file in files){
     string ext=Path.GetExtension(file);if(ext!=".json"&&ext!=".bak")continue;
     var info=new FileInfo(file);long ticks=info.LastWriteTimeUtc.Ticks;if(ticks>newest)newest=ticks;
     text.Append(name).Append('/').Append(info.Name).Append('|').Append(info.Length).Append('|').Append(ticks).Append('\n');
    }
   }
   return Hex(text.ToString());
  }
  static string MarkerPath(string root,string ns){return Path.Combine(root,"."+ns+".legacy-import.marker");}
  static Marker ReadMarker(string path)
  {
   try{
    if(!File.Exists(path))return null;var m=new Marker();bool version=false;
    foreach(string line in File.ReadAllLines(path)){
     int at=line.IndexOf('=');if(at<0){if(line=="marker-v1")version=true;continue;}
     string key=line.Substring(0,at),value=line.Substring(at+1);
     if(key=="status")m.Status=value;else if(key=="source")m.Source=value;else if(key=="target")m.Target=value;
     else if(key=="sourceNewest"){long n;if(!long.TryParse(value,out n))return null;m.SourceNewest=n;}
    }
    return version&&(m.Status=="ok"||m.Status=="failed")&&m.Source.Length!=0&&m.Target.Length!=0?m:null;
   }catch(IOException){return null;}catch(UnauthorizedAccessException){return null;}
  }
  static void WriteMarker(string path,string status,string source,long newest,string target)
  {
   string temp=path+".tmp-"+Guid.NewGuid().ToString("N");
   File.WriteAllText(temp,"marker-v1\nstatus="+status+"\nsource="+source+"\nsourceNewest="+newest+"\ntarget="+target+"\nwritten="+DateTime.UtcNow.ToString("o")+"\n",new UTF8Encoding(false));
   if(File.Exists(path))File.Delete(path);
   File.Move(temp,path);
  }
  static Decision Decide(Marker marker,string source,string target,out string why)
  {
   long newest;string sourcePrint=Fingerprint(source,out newest),targetPrint=Fingerprint(target,out _);
   bool targetChanged=targetPrint!=marker.Target,sourceChanged=sourcePrint!=marker.Source;why="";
   if(marker.Status=="failed"){
    if(!targetChanged)return Decision.Reimport;
    if(sourceChanged){why="Old save folder changed after a failed import, but the new save also changed; new save kept.";return Decision.Diverged;}
    return Decision.Keep;
   }
   bool sourceNewer=sourceChanged&&newest>marker.SourceNewest;
   if(!sourceNewer)return Decision.Keep;
   if(!targetChanged)return Decision.Reimport;
   why="Old save folder and new save both changed since the last import; new save kept, old folder not re-imported.";return Decision.Diverged;
  }
  static string SideName(string path,string label)
  {
   string stamp=DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");string name=path+"."+label+"-"+stamp;int n=1;
   while(Directory.Exists(name)||File.Exists(name))name=path+"."+label+"-"+stamp+"-"+(n++);
   return name;
  }
  // Abandoned staging is evidence, not garbage: keep it beside the saves. Every file must be openable
  // (no live writer) so a rename never moves a folder somebody is still writing.
  static string SetAside(string stage)
  {
   RejectLink(stage,false);var handles=new List<FileStream>();
   try{
    foreach(string file in Directory.GetFiles(stage,"*",SearchOption.AllDirectories)){
     if((File.GetAttributes(file)&FileAttributes.ReparsePoint)!=0)continue;
     handles.Add(new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.Delete));
    }
    string aside=SideName(stage,"abandoned");
    foreach(var handle in handles)handle.Dispose();handles.Clear();
    Directory.Move(stage,aside);return aside;
   }finally{foreach(var handle in handles)handle.Dispose();}
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
   // The old Player's real folder is its bundle id (com.<company>.<product>), found on a Mac 11-04.
   return new[]{Path.Combine(support,company,LegacyProductName),Path.Combine(support,"unity."+company+"."+LegacyProductName),Path.Combine(support,BundleIdentifier(company,LegacyProductName))};
  }
  // Unity builds the macOS bundle id from company and product, turning every byte of the UTF-8 text that is not
  // an ASCII letter or digit into '-' (a two-byte letter becomes two dashes).
  public static string BundleIdentifier(string company,string product)
  {
   return "com."+Sanitize(company)+"."+Sanitize(product);
  }
  static string Sanitize(string text)
  {
   var result=new StringBuilder();
   foreach(byte b in Encoding.UTF8.GetBytes(text??""))result.Append(b>='A'&&b<='Z'||b>='a'&&b<='z'||b>='0'&&b<='9'?(char)b:'-');
   return result.ToString();
  }
  public static bool TryPrepare(string persistentRoot,string saveNamespace,bool full,string legacyRoot,bool sandbox,out string directory,out string error)
  {return TryPrepare(persistentRoot,saveNamespace,full,string.IsNullOrEmpty(legacyRoot)?new string[0]:new[]{legacyRoot},sandbox,out directory,out error);}
  public static bool TryPrepare(string persistentRoot,string saveNamespace,bool full,string[] legacyRoots,bool sandbox,out string directory,out string error)
  {return TryPrepare(persistentRoot,saveNamespace,full,legacyRoots,sandbox,out directory,out error,new PrepareReport());}
  static string FindSource(string root,bool full,string saveNamespace,string[] legacyRoots)
  {
   foreach(string legacyRoot in legacyRoots){
    string qualified=Path.Combine(legacyRoot,saveNamespace);
    if(Directory.Exists(qualified))return qualified;
   }
   if(full&&HasStores(root))return root;
   if(full)foreach(string legacyRoot in legacyRoots)if(HasStores(legacyRoot))return legacyRoot;
   return null;
  }
  // true: directory is usable. A permanently unreadable old save is reported through report (fresh start, old files untouched);
  // busy/transient IO (live writer, lease held by another process, conflicting paths) still returns false and is retried by the caller.
  public static bool TryPrepare(string persistentRoot,string saveNamespace,bool full,string[] legacyRoots,bool sandbox,out string directory,out string error,PrepareReport report)
  {
   directory="";error="";string ownedStage=null;FileStream lease=null;string source=null,target=null,root=null,markerPath=null;bool reimport=false;
   try{
    if(string.IsNullOrWhiteSpace(persistentRoot)||!Path.IsPathRooted(persistentRoot)||string.IsNullOrEmpty(saveNamespace))throw new ArgumentException("Absolute save root and flavor namespace required.");
    foreach(char c in saveNamespace)if(!(c>='A'&&c<='Z'||c>='a'&&c<='z'||c>='0'&&c<='9'||c=='-'||c=='_'))throw new ArgumentException("Invalid save namespace.");
    root=Path.GetFullPath(persistentRoot);target=Path.Combine(root,saveNamespace);string legacyStage=target+".legacy-import";markerPath=MarkerPath(root,saveNamespace);
    if(File.Exists(target))throw new IOException("Conflicting save destination. Original saves preserved.");
    bool exists=Directory.Exists(target);string why;
    if(exists)RejectLink(target,false);
    // QA never probes real saves. Demo/BIC/EA never inherit the historically shared full save.
    Marker marker=sandbox?null:ReadMarker(markerPath);
    if(exists&&marker==null){directory=target;return true;}
    if(!sandbox)source=FindSource(root,full,saveNamespace,legacyRoots);
    if(exists){
     // A marker means an import happened here once. Look at the old folder again so a rollback to the old build is not lost.
     if(source==null){directory=target;return true;}
     var decision=Decide(marker,source,target,out why);
     if(decision==Decision.Diverged)report.Notice+=why+" ";
     if(decision!=Decision.Reimport){directory=target;return true;}
     reimport=true;
    }
    else if(File.Exists(legacyStage))throw new IOException("Conflicting save import path. Original saves preserved.");
    if(source!=null||AbandonedStages(root,target).Length!=0){
     Directory.CreateDirectory(root);RejectLink(root,false);
     string lockPath=Path.Combine(root,"."+saveNamespace+".legacy-import.lock");
     if(File.Exists(lockPath))RejectLink(lockPath,false);
     // Exclusive open proves nobody is importing: a lock that no process holds is abandoned and is reclaimed
     // (deleted when this importer finishes). A held lock fails with an IOException and nothing is touched.
     lease=new FileStream(lockPath,FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None,4096,FileOptions.DeleteOnClose);
     // Recheck after taking the lease: a previous importer may have committed.
     if(Directory.Exists(target)){
      RejectLink(target,false);
      if(!reimport){directory=target;return true;}
      var again=ReadMarker(markerPath);
      if(again==null||Decide(again,source,target,out why)!=Decision.Reimport){directory=target;return true;}
     }
     if(File.Exists(target)||File.Exists(legacyStage))throw new IOException("Conflicting save import path. Original saves preserved.");
     foreach(string abandoned in AbandonedStages(root,target))report.Notice+="Abandoned import staging preserved at "+SetAside(abandoned)+". ";
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
       if(Directory.GetDirectories(from).Length!=0)throw new ImportContentException("Unexpected save subdirectory.");
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
      long newest;string sourcePrint=Fingerprint(source,out newest);
      string kept=null;
      // Re-import keeps the previous destination beside the saves; nothing is deleted.
      if(reimport&&Directory.Exists(target)){kept=SideName(target,"replaced");Directory.Move(target,kept);}
      try{Directory.Move(stage,target);}
      catch{if(kept!=null)Directory.Move(kept,target);throw;}
      ownedStage=null;
      if(kept!=null)report.Notice+="Previous save folder preserved at "+kept+". ";
      try{WriteMarker(markerPath,"ok",sourcePrint,newest,Fingerprint(target,out _));}
      catch(Exception markerError) when(markerError is IOException||markerError is UnauthorizedAccessException){report.Notice+="Import marker not written: "+markerError.Message+" ";}
     }finally{foreach(var stream in streams)stream.Dispose();}
    }
    directory=target;return true;
   }catch(Exception e) when(e is IOException||e is UnauthorizedAccessException||e is ArgumentException||e is NotSupportedException){
    error=e.Message;
    if(ownedStage!=null)try{ClearStaging(ownedStage);}catch(Exception cleanup) when(cleanup is IOException||cleanup is UnauthorizedAccessException){error+=" Staging cleanup: "+cleanup.Message;}
    if(e is ImportContentException&&source!=null&&target!=null){
     // The old save itself cannot be imported: keep every old byte, start fresh, say why. A failed-import marker
     // lets the next launch retry while the new folder is still untouched.
     report.ImportFailed=true;report.Notice+="Old save could not be imported ("+e.Message+"); starting fresh. Original saves preserved.";
     if(!reimport)try{long newest;WriteMarker(markerPath,"failed",Fingerprint(source,out newest),newest,"absent");}catch(Exception markerError) when(markerError is IOException||markerError is UnauthorizedAccessException){}
     error="";directory=target;return true;
    }
    return false;
   }finally{if(lease!=null)lease.Dispose();}
  }
 }
}
