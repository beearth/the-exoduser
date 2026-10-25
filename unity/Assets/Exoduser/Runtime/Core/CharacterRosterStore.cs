using System;
using System.IO;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 [Serializable]
 public sealed class CharacterRosterSnapshot
 {
  public string schema;
  public int version;
  public long revision;
  public string[] names;
  public int selectedIndex;
 }
 public enum CharacterStoreStatus
 {
  Missing,Loaded,RecoveredFromBackup,Saved,NotLoaded,InvalidData,
  UnsupportedVersion,WrongSchema,TooLarge,IoError,Busy,Conflict,CodecError
 }
 // Only frontend identities. Does not import or write player, inventory, account or old saves.
 public sealed class CharacterRosterStore
 {
  public const string Schema="exoduser.unity.character-roster";
  public const int Version=1;
  public const int MaximumBytes=65536;
  public const string DataFileName="characters.v1.json";
  public const string BackupFileName="characters.v1.bak";
  public const string LockFileName="characters.lock";
  readonly string directory,primary,backup,lockFile;
  readonly Func<CharacterRosterSnapshot,string> encode;
  readonly Func<string,CharacterRosterSnapshot> decode;
  readonly UTF8Encoding utf8=new UTF8Encoding(false,true);
  bool loaded;
  long expectedRevision;
  public CharacterRosterStore(string absoluteDirectory,Func<CharacterRosterSnapshot,string> encode,
                              Func<string,CharacterRosterSnapshot> decode)
  {
   if(string.IsNullOrEmpty(absoluteDirectory)||!Path.IsPathRooted(absoluteDirectory))
    throw new ArgumentException("An absolute, dedicated Unity character directory is required.","absoluteDirectory");
   if(encode==null)throw new ArgumentNullException("encode");
   if(decode==null)throw new ArgumentNullException("decode");
   directory=Path.GetFullPath(absoluteDirectory);this.encode=encode;this.decode=decode;
   primary=Path.Combine(directory,DataFileName);backup=Path.Combine(directory,BackupFileName);
   lockFile=Path.Combine(directory,LockFileName);
  }
  public static CharacterRosterSnapshot CreateSnapshot(string[] names,int selectedIndex)
  {
   return new CharacterRosterSnapshot{schema=Schema,version=Version,revision=0,
    names=names==null?null:(string[])names.Clone(),selectedIndex=selectedIndex};
  }
  public static CharacterRosterSnapshot Capture(CharacterRoster roster)
  {
   if(roster==null)throw new ArgumentNullException("roster");
   var names=new string[roster.Count];for(int i=0;i<names.Length;i++)names[i]=roster.NameAt(i);
   return CreateSnapshot(names,roster.SelectedIndex);
  }
  static CharacterRosterSnapshot Copy(CharacterRosterSnapshot snapshot)
  {
   return new CharacterRosterSnapshot{schema=snapshot.schema,version=snapshot.version,revision=snapshot.revision,
    names=snapshot.names==null?null:(string[])snapshot.names.Clone(),selectedIndex=snapshot.selectedIndex};
  }
  public static bool Validate(CharacterRosterSnapshot snapshot,out CharacterStoreStatus status)
  {
   status=CharacterStoreStatus.InvalidData;
   if(snapshot==null)return false;
   if(snapshot.schema!=Schema){if(snapshot.schema!=null)status=CharacterStoreStatus.WrongSchema;return false;}
   if(snapshot.version>Version){status=CharacterStoreStatus.UnsupportedVersion;return false;}
   if(snapshot.version!=Version||snapshot.revision<0||snapshot.names==null||snapshot.names.Length>CharacterRoster.Capacity)return false;
   if(snapshot.selectedIndex< -1||snapshot.selectedIndex>=snapshot.names.Length)return false;
   var candidate=new CharacterRoster();
   foreach(string name in snapshot.names)
   {
    if(name==null||!string.Equals(name,CharacterRoster.TrimName(name),StringComparison.Ordinal))return false;
    CharacterCreateError error;if(!candidate.TryCreate(name,0,out error))return false;
   }
   status=CharacterStoreStatus.Loaded;return true;
  }
  bool Read(string path,out CharacterRosterSnapshot snapshot,out CharacterStoreStatus status)
  {
   snapshot=null;status=CharacterStoreStatus.Missing;
   if(!File.Exists(path))return true;
   string json;
   try
   {
    using(var stream=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.Read))
    {
     if(stream.Length>MaximumBytes){status=CharacterStoreStatus.TooLarge;return false;}
     var bytes=new byte[(int)stream.Length];int offset=0;
     while(offset<bytes.Length){int count=stream.Read(bytes,offset,bytes.Length-offset);if(count==0){status=CharacterStoreStatus.InvalidData;return false;}offset+=count;}
     json=utf8.GetString(bytes);
    }
   }
   catch(DecoderFallbackException){status=CharacterStoreStatus.InvalidData;return false;}
   catch(IOException){status=CharacterStoreStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=CharacterStoreStatus.IoError;return false;}
   try { snapshot=decode(json); }
   catch(Exception){status=CharacterStoreStatus.InvalidData;return false;}
   if(!Validate(snapshot,out status)){snapshot=null;return false;}
   if(snapshot.revision<1){snapshot=null;status=CharacterStoreStatus.InvalidData;return false;}
   return true;
  }
  bool ReadBest(out CharacterRosterSnapshot snapshot,out CharacterStoreStatus status)
  {
   bool valid=Read(primary,out snapshot,out status);
   if(valid&&status==CharacterStoreStatus.Loaded)return true;
   // Unknown formats, oversized files and I/O errors must never be silently downgraded.
   if(!valid&&status!=CharacterStoreStatus.InvalidData)return false;
   CharacterStoreStatus primaryStatus=status;
   if(Read(backup,out snapshot,out status)&&status==CharacterStoreStatus.Loaded)
   { status=CharacterStoreStatus.RecoveredFromBackup;return true; }
   if(status==CharacterStoreStatus.Missing&&primaryStatus==CharacterStoreStatus.Missing)
   { snapshot=CreateSnapshot(new string[0],-1);return true; }
   if(status==CharacterStoreStatus.Missing)status=primaryStatus;
   snapshot=null;return false;
  }
  FileStream Acquire(out CharacterStoreStatus status)
  {
   status=CharacterStoreStatus.Loaded;
   try { return new FileStream(lockFile,FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None); }
   catch(UnauthorizedAccessException){status=CharacterStoreStatus.IoError;return null;}
   catch(IOException){status=CharacterStoreStatus.Busy;return null;}
  }
  public bool TryLoad(out CharacterRosterSnapshot snapshot,out CharacterStoreStatus status)
  {
   snapshot=null;loaded=false;
   if(!Directory.Exists(directory))
   {
    if(File.Exists(directory)){status=CharacterStoreStatus.IoError;return false;}
    snapshot=CreateSnapshot(new string[0],-1);status=CharacterStoreStatus.Missing;
    expectedRevision=0;loaded=true;return true;
   }
   using(var lease=Acquire(out status))
   {
    if(lease==null)return false;
    if(!ReadBest(out snapshot,out status))return false;
    expectedRevision=snapshot.revision;loaded=true;return true;
   }
  }
  public bool TrySave(CharacterRoster roster,out CharacterStoreStatus status)
  {
   if(roster==null){status=CharacterStoreStatus.InvalidData;return false;}
   return TrySaveSnapshot(Capture(roster),out status);
  }
  static bool Equal(CharacterRosterSnapshot a,CharacterRosterSnapshot b)
  {
   if(a.schema!=b.schema||a.version!=b.version||a.revision!=b.revision||a.selectedIndex!=b.selectedIndex||a.names.Length!=b.names.Length)return false;
   for(int i=0;i<a.names.Length;i++)if(!string.Equals(a.names[i],b.names[i],StringComparison.Ordinal))return false;
   return true;
  }
  public bool TrySaveSnapshot(CharacterRosterSnapshot snapshot,out CharacterStoreStatus status)
  {
   status=CharacterStoreStatus.NotLoaded;if(!loaded)return false;
   if(!Validate(snapshot,out status))return false;
   if(expectedRevision==long.MaxValue){status=CharacterStoreStatus.Conflict;return false;}
   var next=Copy(snapshot);next.revision=expectedRevision+1;
   byte[] payload;
   try
   {
    string json=encode(next);if(string.IsNullOrEmpty(json)){status=CharacterStoreStatus.CodecError;return false;}
    var roundtrip=decode(json);
    if(!Validate(roundtrip,out status)||!Equal(next,roundtrip)){status=CharacterStoreStatus.CodecError;return false;}
    payload=utf8.GetBytes(json);
   }
   catch(Exception){status=CharacterStoreStatus.CodecError;return false;}
   if(payload.Length>MaximumBytes){status=CharacterStoreStatus.TooLarge;return false;}
   try { Directory.CreateDirectory(directory); }
   catch(IOException){status=CharacterStoreStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=CharacterStoreStatus.IoError;return false;}
   using(var lease=Acquire(out status))
   {
    if(lease==null)return false;
    CharacterRosterSnapshot current;CharacterStoreStatus currentStatus;
    if(!ReadBest(out current,out currentStatus)){status=currentStatus;return false;}
    if(current.revision!=expectedRevision){status=CharacterStoreStatus.Conflict;return false;}
    string temporary=Path.Combine(directory,".characters-"+Guid.NewGuid().ToString("N")+".tmp");
    try
    {
     using(var file=new FileStream(temporary,FileMode.CreateNew,FileAccess.Write,FileShare.None))
     { file.Write(payload,0,payload.Length);file.Flush(true); }
     if(File.Exists(primary))
     {
      if(currentStatus==CharacterStoreStatus.RecoveredFromBackup)
      {
       // Preserve the damaged original and the good backup before publishing repaired data.
       File.Move(primary,Path.Combine(directory,"characters.corrupt-"+Guid.NewGuid().ToString("N")+".json"));
       File.Move(temporary,primary);
      }
      else File.Replace(temporary,primary,backup);
     }
     else File.Move(temporary,primary);
     expectedRevision=next.revision;status=CharacterStoreStatus.Saved;return true;
    }
    catch(IOException){status=CharacterStoreStatus.IoError;return false;}
    catch(UnauthorizedAccessException){status=CharacterStoreStatus.IoError;return false;}
    catch(NotSupportedException){status=CharacterStoreStatus.IoError;return false;}
    finally { try { if(File.Exists(temporary))File.Delete(temporary); }catch(IOException){}catch(UnauthorizedAccessException){} }
   }
  }
 }
}
