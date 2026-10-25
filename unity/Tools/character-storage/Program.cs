using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

class Program
{
 static int count;
 static readonly JsonSerializerOptions options=new JsonSerializerOptions{IncludeFields=true};
 static string Encode(CharacterRosterSnapshot snapshot){return JsonSerializer.Serialize(snapshot,options);}
 static CharacterRosterSnapshot Decode(string json){return JsonSerializer.Deserialize<CharacterRosterSnapshot>(json,options);}
 static void Check(bool value,string name){count++;if(!value)throw new Exception(name);}
 static CharacterRosterStore Store(string root){return new CharacterRosterStore(root,Encode,Decode);}
 static CharacterRoster Roster(params string[] names)
 {
  var roster=new CharacterRoster();foreach(string name in names){CharacterCreateError error;if(!roster.TryCreate(name,0,out error))throw new Exception("fixture name rejected");}return roster;
 }
 static string Primary(string root){return Path.Combine(root,CharacterRosterStore.DataFileName);}
 static string Backup(string root){return Path.Combine(root,CharacterRosterStore.BackupFileName);}
 static CharacterRosterSnapshot DiskSnapshot(string[] names,int selected,long revision=1)
 {var snapshot=CharacterRosterStore.CreateSnapshot(names,selected);snapshot.revision=revision;return snapshot;}
 static void Main(string[] args)
 {
  string suite=Path.Combine(Path.GetFullPath(args[0]),Guid.NewGuid().ToString("N"));Directory.CreateDirectory(suite);
  string root=Path.Combine(suite,"roundtrip");var store=Store(root);CharacterStoreStatus status;CharacterRosterSnapshot data;
  Check(!Directory.Exists(root),"constructor creates no files");
  Check(store.TryLoad(out data,out status)&&status==CharacterStoreStatus.Missing,"first load missing");
  Check(data.names.Length==0&&data.selectedIndex== -1&&data.revision==0,"empty defaults");
  Check(!Directory.Exists(root),"missing load creates no files");
  var roster=Roster("아린");
  Check(store.TrySave(roster,out status)&&status==CharacterStoreStatus.Saved,"first atomic publish");
  Check(File.Exists(Primary(root))&&!File.Exists(Backup(root)),"first publish no invented backup");
  var restarted=Store(root);
  Check(restarted.TryLoad(out data,out status)&&status==CharacterStoreStatus.Loaded,"new process-shaped store loads");
  Check(data.names.Length==1&&data.names[0]=="아린"&&data.selectedIndex==0&&data.revision==1,"created name and selection persist");
  CharacterCreateError error;roster.TryCreate("루나",0,out error);roster.Select(0);
  Check(store.TrySave(roster,out status),"second atomic replace");
  Check(File.Exists(Backup(root))&&Decode(File.ReadAllText(Backup(root))).revision==1,"backup is previous validated revision");
  Check(restarted.TryLoad(out data,out status)&&data.names.Length==2&&data.selectedIndex==0&&data.revision==2,"selection and order persist");
  var noSelection=CharacterRosterStore.CreateSnapshot(data.names,-1);
  Check(restarted.TrySaveSnapshot(noSelection,out status),"persist no-selection state with names");
  Check(noSelection.revision==0,"save does not mutate caller snapshot");
  Check(Store(root).TryLoad(out data,out status)&&data.names.Length==2&&data.selectedIndex== -1,"no-selection restores exactly");
  var deletion=Store(root);deletion.TryLoad(out data,out status);
  Check(deletion.TrySaveSnapshot(CharacterRosterStore.CreateSnapshot(new[]{"루나"},0),out status),"deletion snapshot writes");
  Check(Store(root).TryLoad(out data,out status)&&data.names.Length==1&&data.names[0]=="루나","deleted slot stays absent on restart");
  deletion.TryLoad(out data,out status);
  Check(deletion.TrySaveSnapshot(CharacterRosterStore.CreateSnapshot(new string[0],-1),out status),"last deletion stores empty list");
  Check(Store(root).TryLoad(out data,out status)&&data.names.Length==0&&data.selectedIndex== -1,"empty list restart");
  Check(Directory.GetFiles(root,"*.tmp").Length==0,"temporary publications cleaned");

  root=Path.Combine(suite,"conflict");var a=Store(root);var b=Store(root);
  a.TryLoad(out data,out status);b.TryLoad(out data,out status);
  Check(a.TrySave(Roster("아린"),out status),"first writer wins");
  Check(!b.TrySave(Roster("루나"),out status)&&status==CharacterStoreStatus.Conflict,"stale other app cannot overwrite");
  Check(Store(root).TryLoad(out data,out status)&&data.names[0]=="아린","conflict preserves committed identity");

  root=Path.Combine(suite,"recover");store=Store(root);store.TryLoad(out data,out status);
  store.TrySave(Roster("아린"),out status);store.TrySave(Roster("아린","루나"),out status);
  File.WriteAllText(Primary(root),"{broken");
  var recovery=Store(root);
  Check(recovery.TryLoad(out data,out status)&&status==CharacterStoreStatus.RecoveredFromBackup,"corrupt primary uses good backup");
  Check(data.names.Length==1&&data.names[0]=="아린"&&data.revision==1,"recovery returns actual previous snapshot");
  Check(File.ReadAllText(Primary(root))=="{broken","load never destroys damaged original");
  Check(recovery.TrySave(Roster("아린","보라"),out status),"publish after explicit recovery load");
  var quarantined=Directory.GetFiles(root,"characters.corrupt-*.json");
  Check(quarantined.Length==1&&File.ReadAllText(quarantined[0])=="{broken","damaged original preserved on repair");
  Check(Decode(File.ReadAllText(Backup(root))).names[0]=="아린","good backup not replaced with corrupt bytes");
  Check(Store(root).TryLoad(out data,out status)&&data.names[1]=="보라","repaired metadata reloads");

  root=Path.Combine(suite,"bad-only");Directory.CreateDirectory(root);File.WriteAllText(Primary(root),"not json");store=Store(root);
  Check(!store.TryLoad(out data,out status)&&status==CharacterStoreStatus.InvalidData,"corruption without backup is not empty list");
  Check(!store.TrySave(Roster("루나"),out status)&&status==CharacterStoreStatus.NotLoaded,"failed load prevents silent overwrite");
  Check(File.ReadAllText(Primary(root))=="not json","bad-only file preserved");

  root=Path.Combine(suite,"future");Directory.CreateDirectory(root);data=DiskSnapshot(new[]{"아린"},0);File.WriteAllText(Backup(root),Encode(data));data.version=2;string future=Encode(data);File.WriteAllText(Primary(root),future);store=Store(root);
  Check(!store.TryLoad(out data,out status)&&status==CharacterStoreStatus.UnsupportedVersion,"future version refuses backup downgrade");
  Check(!store.TrySave(Roster("루나"),out status)&&File.ReadAllText(Primary(root))==future,"future bytes never overwritten");

  root=Path.Combine(suite,"schema");Directory.CreateDirectory(root);data=DiskSnapshot(new[]{"아린"},0);data.schema="foreign.save";File.WriteAllText(Primary(root),Encode(data));store=Store(root);
  Check(!store.TryLoad(out data,out status)&&status==CharacterStoreStatus.WrongSchema,"unrelated format refused");

  foreach(var invalid in new[]{
   CharacterRosterStore.CreateSnapshot(new[]{"아린","아린"},0),
   CharacterRosterStore.CreateSnapshot(new[]{" 아린"},0),
   CharacterRosterStore.CreateSnapshot(new[]{"a"},0),
   CharacterRosterStore.CreateSnapshot(new[]{"나/라"},0),
   CharacterRosterStore.CreateSnapshot(new[]{"아린"},1),
   CharacterRosterStore.CreateSnapshot(new string[0],0),
   CharacterRosterStore.CreateSnapshot(null,-1),
   CharacterRosterStore.CreateSnapshot(new[]{"가나","다라","마바","사아","자차","카타"},0)})
   Check(!CharacterRosterStore.Validate(invalid,out status),"invalid imported snapshot rejected before live mutation");
  Check(CharacterRosterStore.Validate(CharacterRosterStore.CreateSnapshot(new[]{"가나","다라","마바","사아","자차"},4),out status),"five canonical slots accepted");

  root=Path.Combine(suite,"large");Directory.CreateDirectory(root);File.WriteAllText(Primary(root),new string('x',CharacterRosterStore.MaximumBytes+1));store=Store(root);
  Check(!store.TryLoad(out data,out status)&&status==CharacterStoreStatus.TooLarge,"bounded metadata reader");
  Check(new FileInfo(Primary(root)).Length==CharacterRosterStore.MaximumBytes+1,"oversized data preserved");

  root=Path.Combine(suite,"codec");var badCodec=new CharacterRosterStore(root,s=>"{}",Decode);badCodec.TryLoad(out data,out status);
  Check(!badCodec.TrySave(Roster("아린"),out status)&&status==CharacterStoreStatus.CodecError,"codec field loss rejected");
  Check(!Directory.Exists(root),"bad codec creates no metadata files");

  root=Path.Combine(suite,"busy");store=Store(root);store.TryLoad(out data,out status);store.TrySave(Roster("아린"),out status);
  using(var lease=new FileStream(Path.Combine(root,CharacterRosterStore.LockFileName),FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None))
   Check(!Store(root).TryLoad(out data,out status)&&status==CharacterStoreStatus.Busy,"competing writer lock respected");
  Check(Store(root).TryLoad(out data,out status)&&data.names[0]=="아린","lock released without data loss");

  root=Path.Combine(suite,"not-directory");File.WriteAllText(root,"sentinel");store=Store(root);
  Check(!store.TryLoad(out data,out status)&&status==CharacterStoreStatus.IoError,"invalid root reports IO error");
  Check(File.ReadAllText(root)=="sentinel","unrelated path content preserved");

  root=Path.Combine(suite,"overflow");Directory.CreateDirectory(root);File.WriteAllText(Primary(root),Encode(DiskSnapshot(new[]{"아린"},0,long.MaxValue)));store=Store(root);store.TryLoad(out data,out status);
  Check(!store.TrySave(Roster("루나"),out status)&&status==CharacterStoreStatus.Conflict,"revision does not overflow");
  var result=new {passed=count,failed=0,suite,scope="New isolated filesystem persistence/recovery/concurrency tests; no user storage or Unity runtime access"};
  string report=JsonSerializer.Serialize(result);File.WriteAllText(args[1],report+"\n");Console.WriteLine(report);
 }
}
