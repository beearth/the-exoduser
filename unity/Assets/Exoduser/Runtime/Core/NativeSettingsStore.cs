using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
 [Serializable]
 public sealed class NativeSettingsSnapshot
 {
  public string schema;
  public int version;
  public long revision;
  public int sfxPercent,bgmPercent,frameCap;
  public bool fullscreen;
  public string[] binds,binds2;
  [NonSerialized] public Dictionary<string,string> extra;
 }
 public enum NativeSettingsStoreStatus
 {
  Missing,Loaded,RecoveredFromBackup,Saved,NotLoaded,InvalidData,
  UnsupportedVersion,WrongSchema,TooLarge,IoError,Busy,Conflict,CodecError
 }
 // Atomic IO control flow reused from CharacterRosterStore. The roster store is unchanged.
 // Native preferences and keyboard binding values only. No web/Godot/character/combat saves.
 public sealed class NativeSettingsStore
 {
  public const string Schema="exoduser.unity.settings";
  public const int Version=2;
  public const int MaximumBytes=8192;
  public const string DataFileName="settings.v1.json";
  public const string BackupFileName="settings.v1.bak";
  public const string LockFileName="settings.lock";
  readonly string directory,primary,backup,lockFile;
  readonly Func<NativeSettingsSnapshot,string> encode;
  readonly Func<string,NativeSettingsSnapshot> decode;
  readonly UTF8Encoding utf8=new UTF8Encoding(false,true);
  readonly NativeSettingsSnapshot defaults;
  bool loaded;
  long expectedRevision;
  NativeSettingsSnapshot lastSnapshot;
  public NativeSettingsStore(string absoluteDirectory,Func<NativeSettingsSnapshot,string> encode,
                              Func<string,NativeSettingsSnapshot> decode,NativeSettingsState initialState,bool initialFullscreen)
  {
   if(string.IsNullOrEmpty(absoluteDirectory)||!Path.IsPathRooted(absoluteDirectory))
    throw new ArgumentException("An absolute, dedicated Unity settings directory is required.","absoluteDirectory");
   if(encode==null)throw new ArgumentNullException("encode");
   if(decode==null)throw new ArgumentNullException("decode");
   if(initialState==null)throw new ArgumentNullException("initialState");
   directory=Path.GetFullPath(absoluteDirectory);this.encode=encode;this.decode=decode;defaults=Capture(initialState,initialFullscreen);
   primary=Path.Combine(directory,DataFileName);backup=Path.Combine(directory,BackupFileName);
   lockFile=Path.Combine(directory,LockFileName);
  }
  public static NativeSettingsSnapshot Capture(NativeSettingsState state,bool fullscreen)
  {
   if(state==null)throw new ArgumentNullException("state");
   return new NativeSettingsSnapshot{schema=Schema,version=Version,revision=0,sfxPercent=state.SfxPercent,bgmPercent=state.BgmPercent,frameCap=state.FrameCap,fullscreen=fullscreen,binds=NativeSettingsJsonCodec.Defaults(false),binds2=NativeSettingsJsonCodec.Defaults(true),extra=new Dictionary<string,string>()};
  }
  static NativeSettingsSnapshot Copy(NativeSettingsSnapshot s){return new NativeSettingsSnapshot{schema=s.schema,version=s.version,revision=s.revision,sfxPercent=s.sfxPercent,bgmPercent=s.bgmPercent,frameCap=s.frameCap,fullscreen=s.fullscreen,binds=s.binds==null?null:(string[])s.binds.Clone(),binds2=s.binds2==null?null:(string[])s.binds2.Clone(),extra=s.extra==null?new Dictionary<string,string>():new Dictionary<string,string>(s.extra)};}
  public static bool Validate(NativeSettingsSnapshot s,out NativeSettingsStoreStatus status)
  {
   status=NativeSettingsStoreStatus.InvalidData;if(s==null)return false;
   if(s.schema!=Schema){if(s.schema!=null)status=NativeSettingsStoreStatus.WrongSchema;return false;}
   if(s.version>Version){status=NativeSettingsStoreStatus.UnsupportedVersion;return false;}
   if((s.version!=1&&s.version!=Version)||s.revision<0||s.sfxPercent<0||s.sfxPercent>100||s.bgmPercent<0||s.bgmPercent>100||!NativeSettingsState.IsFrameCapSupported(s.frameCap))return false;
   status=NativeSettingsStoreStatus.Loaded;return true;
  }
  bool Read(string path,out NativeSettingsSnapshot snapshot,out NativeSettingsStoreStatus status)
  {
   snapshot=null;status=NativeSettingsStoreStatus.Missing;
   if(Directory.Exists(path)){status=NativeSettingsStoreStatus.IoError;return false;}
   if(!File.Exists(path))return true;
   string json;
   try
   {
    using(var stream=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.Read))
    {
     if(stream.Length>MaximumBytes){status=NativeSettingsStoreStatus.TooLarge;return false;}
     var bytes=new byte[(int)stream.Length];int offset=0;
     while(offset<bytes.Length){int count=stream.Read(bytes,offset,bytes.Length-offset);if(count==0){status=NativeSettingsStoreStatus.InvalidData;return false;}offset+=count;}
     json=utf8.GetString(bytes);
    }
   }
   catch(DecoderFallbackException){status=NativeSettingsStoreStatus.InvalidData;return false;}
   catch(IOException){status=NativeSettingsStoreStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=NativeSettingsStoreStatus.IoError;return false;}
   try { snapshot=decode(json); }
   catch(Exception){status=NativeSettingsStoreStatus.InvalidData;return false;}
   if(!Validate(snapshot,out status)){snapshot=null;return false;}
   if(snapshot.revision<1){snapshot=null;status=NativeSettingsStoreStatus.InvalidData;return false;}
   return true;
  }
  bool ReadBest(out NativeSettingsSnapshot snapshot,out NativeSettingsStoreStatus status)
  {
   bool valid=Read(primary,out snapshot,out status);
   if(valid&&status==NativeSettingsStoreStatus.Loaded)return true;
   // Unknown formats, oversized files and I/O errors must never be silently downgraded.
   if(!valid&&status!=NativeSettingsStoreStatus.InvalidData)return false;
   NativeSettingsStoreStatus primaryStatus=status;
   if(Read(backup,out snapshot,out status)&&status==NativeSettingsStoreStatus.Loaded)
   { status=NativeSettingsStoreStatus.RecoveredFromBackup;return true; }
   if(status==NativeSettingsStoreStatus.Missing&&primaryStatus==NativeSettingsStoreStatus.Missing)
   { snapshot=Copy(defaults);return true; }
   if(status==NativeSettingsStoreStatus.Missing)status=primaryStatus;
   snapshot=null;return false;
  }
  FileStream Acquire(out NativeSettingsStoreStatus status)
  {
   status=NativeSettingsStoreStatus.Loaded;
   try { return new FileStream(lockFile,FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None); }
   catch(UnauthorizedAccessException){status=NativeSettingsStoreStatus.IoError;return null;}
   catch(IOException){status=NativeSettingsStoreStatus.Busy;return null;}
  }
  public bool TryLoad(out NativeSettingsSnapshot snapshot,out NativeSettingsStoreStatus status)
  {
   snapshot=null;loaded=false;
   if(!Directory.Exists(directory))
   {
    if(File.Exists(directory)){status=NativeSettingsStoreStatus.IoError;return false;}
    snapshot=Copy(defaults);status=NativeSettingsStoreStatus.Missing;
    expectedRevision=0;lastSnapshot=Copy(snapshot);loaded=true;return true;
   }
   using(var lease=Acquire(out status))
   {
    if(lease==null)return false;
    if(!ReadBest(out snapshot,out status))return false;
    expectedRevision=snapshot.revision;lastSnapshot=Copy(snapshot);loaded=true;return true;
   }
  }
  public bool TrySave(NativeSettingsState state,bool fullscreen,out NativeSettingsStoreStatus status)
  {
   return TrySave(state,fullscreen,null,out status);
  }
  public bool TrySave(NativeSettingsState state,bool fullscreen,KeyBindings bindings,out NativeSettingsStoreStatus status)
  { return TrySave(state,fullscreen,bindings,false,out status); }
  public bool TrySave(NativeSettingsState state,bool fullscreen,KeyBindings bindings,bool cinSeen,out NativeSettingsStoreStatus status)
  {
   if(state==null){status=NativeSettingsStoreStatus.InvalidData;return false;}
   var next=lastSnapshot==null?Capture(state,fullscreen):Copy(lastSnapshot);next.version=Version;
   next.sfxPercent=state.SfxPercent;next.bgmPercent=state.BgmPercent;next.frameCap=state.FrameCap;next.fullscreen=fullscreen;
   if(bindings!=null){next.binds=new string[KeyBindings.Actions.Length];next.binds2=new string[KeyBindings.Actions.Length];for(int i=0;i<KeyBindings.Actions.Length;i++){next.binds[i]=bindings.Primary(KeyBindings.Actions[i]);next.binds2[i]=bindings.Secondary(KeyBindings.Actions[i]);}}
   if(cinSeen)next.extra["cinSeen"]="true";
   next.extra["opt"]=state.Options.Encode();
   for(int i=0;i<state.Presets.Length;i++)if(!string.IsNullOrEmpty(state.Presets[i]))next.extra["preset"+(i+1)]=state.Presets[i];
   return TrySaveSnapshot(next,out status);
  }
  static bool Same(string[] a,string[] b){if(a==null||b==null)return a==b;if(a.Length!=b.Length)return false;for(int i=0;i<a.Length;i++)if(a[i]!=b[i])return false;return true;}
  static bool Equal(NativeSettingsSnapshot a,NativeSettingsSnapshot b){if(a.schema!=b.schema||a.version!=b.version||a.revision!=b.revision||a.sfxPercent!=b.sfxPercent||a.bgmPercent!=b.bgmPercent||a.frameCap!=b.frameCap||a.fullscreen!=b.fullscreen||!Same(a.binds,b.binds)||!Same(a.binds2,b.binds2))return false;if(a.extra==null||b.extra==null)return a.extra==b.extra;if(a.extra.Count!=b.extra.Count)return false;foreach(var pair in a.extra){string value;if(!b.extra.TryGetValue(pair.Key,out value)||value!=pair.Value)return false;}return true;}
  public bool TrySaveSnapshot(NativeSettingsSnapshot snapshot,out NativeSettingsStoreStatus status)
  {
   status=NativeSettingsStoreStatus.NotLoaded;if(!loaded)return false;
   if(!Validate(snapshot,out status))return false;
   if(expectedRevision==long.MaxValue){status=NativeSettingsStoreStatus.Conflict;return false;}
   var next=Copy(snapshot);next.version=Version;next.revision=expectedRevision+1;
   byte[] payload;
   try
   {
    string json=encode(next);if(string.IsNullOrEmpty(json)){status=NativeSettingsStoreStatus.CodecError;return false;}
    var roundtrip=decode(json);
    if(!Validate(roundtrip,out status)||!Equal(next,roundtrip)){status=NativeSettingsStoreStatus.CodecError;return false;}
    payload=utf8.GetBytes(json);
   }
   catch(Exception){status=NativeSettingsStoreStatus.CodecError;return false;}
   if(payload.Length>MaximumBytes){status=NativeSettingsStoreStatus.TooLarge;return false;}
   try { Directory.CreateDirectory(directory); }
   catch(IOException){status=NativeSettingsStoreStatus.IoError;return false;}
   catch(UnauthorizedAccessException){status=NativeSettingsStoreStatus.IoError;return false;}
   using(var lease=Acquire(out status))
   {
    if(lease==null)return false;
    NativeSettingsSnapshot current;NativeSettingsStoreStatus currentStatus;
    if(!ReadBest(out current,out currentStatus)){status=currentStatus;return false;}
    if(current.revision!=expectedRevision){status=NativeSettingsStoreStatus.Conflict;return false;}
    string temporary=Path.Combine(directory,".settings-"+Guid.NewGuid().ToString("N")+".tmp");
    try
    {
     using(var file=new FileStream(temporary,FileMode.CreateNew,FileAccess.Write,FileShare.None))
     { file.Write(payload,0,payload.Length);file.Flush(true); }
     if(File.Exists(primary))
     {
      if(currentStatus==NativeSettingsStoreStatus.RecoveredFromBackup)
      {
       // Preserve the damaged original and the good backup before publishing repaired data.
       File.Move(primary,Path.Combine(directory,"settings.corrupt-"+Guid.NewGuid().ToString("N")+".json"));
       File.Move(temporary,primary);
      }
      else File.Replace(temporary,primary,backup);
     }
     else File.Move(temporary,primary);
     expectedRevision=next.revision;lastSnapshot=Copy(next);status=NativeSettingsStoreStatus.Saved;return true;
    }
    catch(IOException){status=NativeSettingsStoreStatus.IoError;return false;}
    catch(UnauthorizedAccessException){status=NativeSettingsStoreStatus.IoError;return false;}
    catch(NotSupportedException){status=NativeSettingsStoreStatus.IoError;return false;}
    finally { try { if(File.Exists(temporary))File.Delete(temporary); }catch(IOException){}catch(UnauthorizedAccessException){} }
   }
  }
 }
 public static class NativeSettingsStorageScope
 {
  public const string FixtureArgument="--unity-settings-persistence-smoke";
  public const string CinematicReviewArgument="--unity-cinematic-persistence-review";
  public static bool TryResolveCinematicReview(string[] args,string productName,string identifier,out string root)
  {
   root="";if(Array.IndexOf(args,CinematicReviewArgument)<0||Array.IndexOf(args,FixtureArgument)>=0||productName!="EXODUSER Settings QA"||identifier!="com.fordeargamers.exoduser.settingsqa")return false;
   foreach(string arg in args)if(arg!=CinematicReviewArgument&&arg.StartsWith("--unity-",StringComparison.Ordinal)&&(arg.EndsWith("-smoke",StringComparison.Ordinal)||arg.EndsWith("-capture",StringComparison.Ordinal)||arg.EndsWith("-review",StringComparison.Ordinal)))return false;
   int at=Array.IndexOf(args,"-output");if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1]))return false;
   try{var folder=new DirectoryInfo(Path.GetFullPath(args[at+1]));if(folder.Parent==null||folder.Parent.Name!="_out"||!folder.Name.StartsWith("UNITY-MAC-A05-IO-",StringComparison.Ordinal))return false;string marker=Path.Combine(folder.FullName,"qa-output.marker");if(!File.Exists(marker)||File.ReadAllText(marker)!="EXODUSER_MAC_A05_IO_V1\n")return false;root=folder.FullName;return true;}
   catch(ArgumentException){return false;}catch(NotSupportedException){return false;}catch(IOException){return false;}catch(UnauthorizedAccessException){return false;}
  }

  public static bool IsQa(string[] args){return QaRunPolicy.IsAutomated(args,false);}   // one shared decision (QaRunPolicy); a -batchmode player is handled by NativeQaSandbox
  public static bool TryResolve(string[] args,string nativeRoot,out string directory,out NativeSettingsStoreStatus status)
  { return TryResolve(args,nativeRoot,"","",out directory,out status); }
  public static bool TryResolve(string[] args,string nativeRoot,string productName,string identifier,out string directory,out NativeSettingsStoreStatus status)
  {
   directory="";status=NativeSettingsStoreStatus.NotLoaded;
   // The dedicated A05 Player review binds settings and roster to the same marked QA root.
   if(Array.IndexOf(args,CinematicReviewArgument)>=0){string qaRoot;if(!TryResolveCinematicReview(args,productName,identifier,out qaRoot)){status=NativeSettingsStoreStatus.IoError;return false;}directory=Path.Combine(qaRoot,"native-settings-v1");status=NativeSettingsStoreStatus.Missing;return true;}
   // All pre-existing QA runs keep session defaults and perform zero settings IO.
   if(IsQa(args)&&Array.IndexOf(args,FixtureArgument)<0)return false;
   string root=nativeRoot;
   if(Array.IndexOf(args,FixtureArgument)>=0){int at=Array.IndexOf(args,"-output");if(at<0||at+1>=args.Length||string.IsNullOrWhiteSpace(args[at+1])||!Path.IsPathRooted(args[at+1])){status=NativeSettingsStoreStatus.IoError;return false;}root=args[at+1];}
   try{if(string.IsNullOrWhiteSpace(root)||!Path.IsPathRooted(root)){status=NativeSettingsStoreStatus.IoError;return false;}directory=Path.Combine(Path.GetFullPath(root),"native-settings-v1");status=NativeSettingsStoreStatus.Missing;return true;}
   catch(ArgumentException){status=NativeSettingsStoreStatus.IoError;return false;}catch(NotSupportedException){status=NativeSettingsStoreStatus.IoError;return false;}
  }
 }

}
