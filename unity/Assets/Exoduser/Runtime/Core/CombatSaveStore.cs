using System;
using System.IO;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 public enum CombatSaveStatus { Missing,Loaded,RecoveredFromBackup,Saved,InvalidData,UnsupportedVersion,WrongSchema,TooLarge,IoError }

 // One file per character (web: one `characters` row per _charId), account-shared malice in shared.v1.json (web: localStorage hellcave_sharedMats).
 // Envelope: {schema,version,revision,name,updated_at,data} where `data` is exactly the web characters.data object.
 // Same atomic-write / previous-copy-as-backup convention as CharacterRosterStore and NativeSettingsStore.
 public sealed class CombatSaveStore
 {
  public const int MaximumBytes=8*1024*1024;
  public const string BackupExtension=".bak";
  public const string SharedFileName="shared.v1.json";
  readonly string directory;
  readonly UTF8Encoding utf8=new UTF8Encoding(false,true);
  public string DirectoryPath{get{return directory;}}
  public CombatSaveStore(string absoluteDirectory)
  {
   if(string.IsNullOrEmpty(absoluteDirectory)||!Path.IsPathRooted(absoluteDirectory))throw new ArgumentException("An absolute, dedicated Unity combat save directory is required.","absoluteDirectory");
   directory=Path.GetFullPath(absoluteDirectory);
  }
  public string PathFor(string characterName)
  {
   if(string.IsNullOrEmpty(characterName))throw new ArgumentException("character name required");
   var b=new StringBuilder("save-");foreach(byte x in Encoding.UTF8.GetBytes(characterName))b.Append(x.ToString("x2"));
   return Path.Combine(directory,b.Append(".v1.json").ToString());
  }
  public bool Exists(string characterName){return File.Exists(PathFor(characterName))||File.Exists(PathFor(characterName)+BackupExtension);}

  bool ReadOne(string path,string name,out JsonValue data,out long revision,out CombatSaveStatus status)
  {
   data=null;revision=0;status=CombatSaveStatus.Missing;
   if(!File.Exists(path))return false;
   string text;
   try
   {
    using(var s=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.Read))
    {
     if(s.Length>MaximumBytes){status=CombatSaveStatus.TooLarge;return false;}
     var bytes=new byte[(int)s.Length];int off=0;while(off<bytes.Length){int n=s.Read(bytes,off,bytes.Length-off);if(n==0){status=CombatSaveStatus.InvalidData;return false;}off+=n;}
     text=utf8.GetString(bytes);
    }
   }
   catch(DecoderFallbackException){status=CombatSaveStatus.InvalidData;return false;}
   catch(IOException){status=CombatSaveStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=CombatSaveStatus.IoError;return false;}
   JsonValue root;try{root=SaveJson.Parse(text);}catch(FormatException){status=CombatSaveStatus.InvalidData;return false;}
   if(root.Kind!=JsonKind.Object||root.Str("schema")!=CombatSaveCodec.Schema){status=root.Kind==JsonKind.Object&&root.Str("schema")!=null?CombatSaveStatus.WrongSchema:CombatSaveStatus.InvalidData;return false;}
   if(root.Num("version",0)>CombatSaveCodec.Version){status=CombatSaveStatus.UnsupportedVersion;return false;}
   if(root.Num("version",0)!=CombatSaveCodec.Version||root.Str("name")!=name||root.Get("data")==null||root.Get("data").Kind!=JsonKind.Object){status=CombatSaveStatus.InvalidData;return false;}
   data=root.Get("data");revision=(long)root.Num("revision",0);status=CombatSaveStatus.Loaded;return true;
  }
  // Primary first, previous copy when the primary is damaged. Unknown versions/schemas are never silently downgraded to the backup.
  public bool TryLoad(string characterName,out JsonValue data,out long revision,out CombatSaveStatus status)
  {
   string path=PathFor(characterName);
   if(ReadOne(path,characterName,out data,out revision,out status))return true;
   if(status!=CombatSaveStatus.Missing&&status!=CombatSaveStatus.InvalidData)return false;
   var primary=status;
   if(ReadOne(path+BackupExtension,characterName,out data,out revision,out status)){status=CombatSaveStatus.RecoveredFromBackup;return true;}
   if(status==CombatSaveStatus.Missing)status=primary;
   return false;
  }
  public bool TrySave(string characterName,JsonValue data,long previousRevision,out long revision,out CombatSaveStatus status)
  {
   revision=previousRevision;
   try
   {
    System.IO.Directory.CreateDirectory(directory);
    string path=PathFor(characterName);
    var env=JsonValue.NewObject().Set("schema",JsonValue.Of(CombatSaveCodec.Schema)).Set("version",JsonValue.Of((double)CombatSaveCodec.Version)).Set("revision",JsonValue.Of((double)(previousRevision+1)))
     .Set("name",JsonValue.Of(characterName)).Set("updated_at",JsonValue.Of(DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'"))).Set("data",data);
    byte[] bytes=utf8.GetBytes(SaveJson.Write(env));
    if(bytes.Length>MaximumBytes){status=CombatSaveStatus.TooLarge;return false;}
    WriteAtomic(path,bytes);revision=previousRevision+1;status=CombatSaveStatus.Saved;return true;
   }
   catch(IOException){status=CombatSaveStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=CombatSaveStatus.IoError;return false;}
  }
  void WriteAtomic(string path,byte[] bytes)
  {
   string temp=path+".tmp";
   using(var s=new FileStream(temp,FileMode.Create,FileAccess.Write,FileShare.None)){s.Write(bytes,0,bytes.Length);s.Flush(true);}
   if(File.Exists(path))File.Copy(path,path+BackupExtension,true);      // the previous good save becomes the backup
   if(File.Exists(path))File.Delete(path);
   File.Move(temp,path);
  }
  public bool Delete(string characterName)
  {
   try{string p=PathFor(characterName);if(File.Exists(p))File.Delete(p);if(File.Exists(p+BackupExtension))File.Delete(p+BackupExtension);return true;}
   catch(IOException){return false;}catch(UnauthorizedAccessException){return false;}
  }

  // ---- account-shared malice (web _loadSharedMats / _saveSharedMats) ----
  public bool HasSharedMats{get{return File.Exists(Path.Combine(directory,SharedFileName));}}
  public double LoadSharedMats()
  {
   string p=Path.Combine(directory,SharedFileName);
   try
   {
    if(!File.Exists(p))return 0;
    var root=SaveJson.Parse(utf8.GetString(File.ReadAllBytes(p)));
    return root.Kind==JsonKind.Object?Math.Max(0,Math.Floor(root.Num("mats",0))):0;
   }
   catch(Exception e) when(e is FormatException||e is IOException||e is UnauthorizedAccessException||e is DecoderFallbackException){return 0;}
  }
  public bool SaveSharedMats(double mats)
  {
   try
   {
    System.IO.Directory.CreateDirectory(directory);
    double n=Math.Max(0,Math.Min(Math.Floor(double.IsNaN(mats)?0:mats),9007199254740991.0));
    WriteAtomic(Path.Combine(directory,SharedFileName),utf8.GetBytes(SaveJson.Write(JsonValue.NewObject().Set("schema",JsonValue.Of("exoduser.unity.shared")).Set("mats",JsonValue.Of(n)))));
    return true;
   }
   catch(IOException){return false;}catch(UnauthorizedAccessException){return false;}
  }
 }
}
