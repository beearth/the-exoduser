using System;using System.IO;using System.Text;using System.Linq;using System.Collections.Generic;
using Exoduser.UnityPort;
static class ImportRecoveryTests
{
 const string Ns="EXODUSER-HELL-FULL";
 static int checks;static readonly List<string> results=new List<string>();
 static void Check(bool value,string message){if(!value)throw new Exception(message);checks++;results.Add(message);}
 static string Put(string root,string relative,string value){string p=Path.Combine(root,relative);Directory.CreateDirectory(Path.GetDirectoryName(p));File.WriteAllText(p,value,new UTF8Encoding(false));return p;}
 static string Stage(string root){return Path.Combine(root,Ns+".legacy-import");}
 static byte[] ReadSnapshot(string file){using(var input=new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.ReadWrite))using(var copy=new MemoryStream()){input.CopyTo(copy);return copy.ToArray();}}
 static Dictionary<string,byte[]> Snapshot(string root){return Directory.GetFiles(root,"*",SearchOption.AllDirectories).ToDictionary(p=>Path.GetRelativePath(root,p).Replace('\\','/'),ReadSnapshot);}
 static void Unchanged(string root,Dictionary<string,byte[]> before,string label){var after=Snapshot(root);Check(before.Count==after.Count&&before.All(p=>after.ContainsKey(p.Key)&&p.Value.SequenceEqual(after[p.Key])),label);}
 static bool Prepare(string root,string source,out string directory,out string error){return NativeFlavorSavePaths.TryPrepare(root,Ns,true,source,false,out directory,out error);}
 static string[] Aside(string root,string suffix){return Directory.GetDirectories(root,Ns+suffix+"*");}
 static void Stamp(string file,int seconds){File.SetLastWriteTimeUtc(file,File.GetLastWriteTimeUtc(file).AddSeconds(seconds));}
 static string Imported(string work,string name,out string source,out string root){source=Path.Combine(work,name+"-src");root=Path.Combine(work,name+"-root");Put(source,"character-roster-v1/characters.v1.json","{\"revision\":1}");string d,e;if(!Prepare(root,source,out d,out e))throw new Exception(e);return d;}
 static int Main(string[] args)
 {
  string work=Path.GetFullPath(args[0]);
  try{
   if(!work.Replace('\\','/').EndsWith("/unity/Library/f1-import-recovery-fixture",StringComparison.Ordinal))throw new Exception("Dedicated owned fixture required");
   if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
   string source=Path.Combine(work,"legacy");
   Put(source,"character-roster-v1/characters.v1.json","{\"revision\":7,\"names\":[\"preserve\"]}");
   string combat=Put(source,"combat-save-v1/save-41.v1.json","{\"revision\":19,\"hp\":37}");
   Put(source,"native-settings-v1/settings.v1.json","{\"revision\":5,\"sfxPercent\":61}");
   Put(source,"native-settings-v1/settings.v1.bak","{\"revision\":4,\"sfxPercent\":60}");
   var original=Snapshot(source);string dir,error,root=Path.Combine(work,"locked-source");
   // Lock the second store, after the roster has already been copied. Reads remain
   // available for byte comparison while the import's read-only share rejects us.
   using(var locked=new FileStream(combat,FileMode.Open,FileAccess.ReadWrite,FileShare.Read)){
    Check(!Prepare(root,source,out dir,out error)&&dir=="","locked source rejects import");
    Check(!Directory.Exists(Path.Combine(root,Ns)),"failed import never commits destination");
    Check(!Directory.Exists(Stage(root)),"F-1: catch removes failed attempt staging");
    Check(!File.Exists(Path.Combine(root,"."+Ns+".legacy-import.lock")),"failed import leaves no new lease");
    Unchanged(source,original,"locked failure leaves every original byte unchanged");
   }
   Check(Prepare(root,source,out dir,out error),"unlock then one retry succeeds: "+error);
   foreach(var file in original)Check(File.ReadAllBytes(Path.Combine(dir,file.Key)).SequenceEqual(file.Value),"retry preserves copied bytes "+file.Key);
   Unchanged(source,original,"successful retry leaves originals unchanged");
   Check(!File.Exists(Path.Combine(root,"."+Ns+".legacy-import.lock")),"successful import removes only its new lease");
   string abandoned=Path.Combine(work,"abandoned");Put(Stage(abandoned),"character-roster-v1/characters.v1.json","partial-copy");
   Check(Prepare(abandoned,source,out dir,out error),"unmarked legacy staging reclaimed and import attempted once: "+error);
   Check(!Directory.Exists(Stage(abandoned))&&File.ReadAllBytes(Path.Combine(dir,"character-roster-v1/characters.v1.json")).SequenceEqual(original["character-roster-v1/characters.v1.json"]),"partial copy replaced by original bytes");
   Check(Aside(abandoned,".legacy-import.abandoned-").Length==1&&File.ReadAllText(Path.Combine(Aside(abandoned,".legacy-import.abandoned-")[0],"character-roster-v1/characters.v1.json"))=="partial-copy","#6 abandoned staging is moved beside the saves, never deleted");
   string failedAgain=Path.Combine(work,"abandoned-locked-source");Put(Stage(failedAgain),"character-roster-v1/characters.v1.json","partial-copy");
   using(var locked=new FileStream(combat,FileMode.Open,FileAccess.ReadWrite,FileShare.Read))Check(!Prepare(failedAgain,source,out dir,out error),"recovered staging plus locked source returns failure without a retry loop");
   Check(!Directory.Exists(Stage(failedAgain)),"recovered staging also cleaned after copy fails");
   Check(Prepare(failedAgain,source,out dir,out error),"later unlocked call succeeds");
   string foreign=Path.Combine(work,"unexpected-entry");Put(Stage(foreign),"other-writer.json","preserve");var foreignBefore=Snapshot(foreign);
   Check(Prepare(foreign,source,out dir,out error),"unexpected staging content no longer blocks the import: "+error);
   Check(Aside(foreign,".legacy-import.abandoned-").Length==1&&File.ReadAllText(Path.Combine(Aside(foreign,".legacy-import.abandoned-")[0],"other-writer.json"))=="preserve"&&!File.Exists(Path.Combine(foreign,"."+Ns+".legacy-import.lock")),"#6 unexpected staging content preserved aside byte for byte, no lease residue");
   string busy=Path.Combine(work,"other-importer");Put(Stage(busy),"character-roster-v1/characters.v1.json","partial");var busyBefore=Snapshot(Stage(busy));
   string existingLease=Put(busy,"."+Ns+".legacy-import.lock","other-importer-lease");
   using(var writer=new FileStream(Path.Combine(busy,"."+Ns+".legacy-import.lock"),FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(busy,source,out dir,out error),"active import lease blocks cleanup");
   Unchanged(Stage(busy),busyBefore,"other importer staging preserved");Check(Prepare(busy,source,out dir,out error),"released lease allows recovery");
   Check(!File.Exists(existingLease),"#6 a lock no process holds is abandoned and reclaimed");
   Check(!Directory.Exists(Stage(busy))&&Aside(busy,".legacy-import.abandoned-").Length==1,"#6 abandoned staging of a reclaimed lock is set aside");
   Unchanged(Aside(busy,".legacy-import.abandoned-")[0],busyBefore,"#6 set-aside staging keeps every byte");
   string fileBusy=Path.Combine(work,"other-file-writer");string stageFile=Put(Stage(fileBusy),"character-roster-v1/characters.v1.json","partial");var fileBusyBefore=Snapshot(fileBusy);
   using(var writer=new FileStream(stageFile,FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(fileBusy,source,out dir,out error),"active staging-file writer blocks cleanup");
   Unchanged(fileBusy,fileBusyBefore,"staging-file lock preserves complete save folder without lease residue");Check(Prepare(fileBusy,source,out dir,out error),"released staging-file writer allows recovery");
   string valid=Path.Combine(work,"existing-destination");Put(Stage(valid),"other-writer.json","preserve");Put(Path.Combine(valid,Ns),"character-roster-v1/characters.v1.json","existing");var validBefore=Snapshot(valid);
   Check(Prepare(valid,source,out dir,out error),"existing destination wins over leftover staging");Unchanged(valid,validBefore,"valid destination and leftover staging unchanged");
   string fileConflict=Path.Combine(work,"file-conflict");Put(fileConflict,Ns+".legacy-import","preserve");var conflictBefore=Snapshot(fileConflict);
   Check(!Prepare(fileConflict,source,out dir,out error),"staging file fails closed");Unchanged(fileConflict,conflictBefore,"staging file preserved");
   string metadata=Path.Combine(work,"metadata");Put(Stage(metadata),"character-roster-v1/partial.json","partial");
   foreach(string name in new[]{".DS_Store","Thumbs.db","desktop.ini"})Put(Stage(metadata),name,"os metadata");
   Check(Prepare(metadata,source,out dir,out error)&&!Directory.Exists(Stage(metadata)),"new lease owner reclaims staging containing OS metadata");
   string abandonedGuid=Path.Combine(work,"abandoned-guid"),guidStage=Path.Combine(abandonedGuid,Ns+".legacy-import-0123456789abcdef0123456789abcdef");Put(guidStage,"character-roster-v1/partial.json","partial");
   Check(Prepare(abandonedGuid,source,out dir,out error)&&!Directory.Exists(guidStage),"new lease owner reclaims well-formed abandoned GUID staging");
   string backupOnly=Path.Combine(work,"backup-source");Put(backupOnly,"character-roster-v1/only.bak","backup");
   var failedReport=new NativeFlavorSavePaths.PrepareReport();string backupRoot=Path.Combine(work,"backup-destination");
   Check(NativeFlavorSavePaths.TryPrepare(backupRoot,Ns,true,new[]{backupOnly},false,out dir,out error,failedReport)&&failedReport.ImportFailed&&!Directory.Exists(Path.Combine(backupRoot,Ns))&&File.ReadAllText(Path.Combine(backupOnly,"character-roster-v1/only.bak"))=="backup","#5 backup-only source is not promoted: fresh start flagged, old bytes kept");
   string temporary=Put(source,"combat-save-v1/inflight.tmp","inflight"),tempRoot=Path.Combine(work,"temporary-source");
   string unpaired=Put(source,"character-roster-v1/.characters-0123.tmp","half-written");var tempReport=new NativeFlavorSavePaths.PrepareReport();
   Check(NativeFlavorSavePaths.TryPrepare(tempRoot,Ns,true,new[]{source},false,out dir,out error,tempReport)&&!tempReport.ImportFailed&&File.Exists(Path.Combine(dir,"combat-save-v1/save-41.v1.json"))&&!File.Exists(Path.Combine(dir,"combat-save-v1/inflight.tmp"))&&!File.Exists(Path.Combine(dir,"character-roster-v1/.characters-0123.tmp")),"#5 stale .tmp (paired and unpaired) is skipped: import succeeds without copying it");
   Check(File.ReadAllText(temporary)=="inflight"&&File.ReadAllText(unpaired)=="half-written","#5 stale .tmp left untouched in the old folder");File.Delete(temporary);File.Delete(unpaired);
   // #4: roll back to the old build, play there, open the new build again.
   string aSource,aRoot,aTarget=Imported(work,"re-a",out aSource,out aRoot);string aRoster=Path.Combine(aSource,"character-roster-v1/characters.v1.json"),aCopy=Path.Combine(aTarget,"character-roster-v1/characters.v1.json");
   string marker=Path.Combine(aRoot,"."+Ns+".legacy-import.marker");
   Check(File.Exists(marker),"#4 import leaves a marker beside the destination");
   Check(Prepare(aRoot,aSource,out dir,out error)&&Aside(aRoot,".replaced-").Length==0,"#4 unchanged old folder is not imported again");
   string oldBuildSave="{\"revision\":2,\"played-in-old-build\":true}";File.WriteAllText(aRoster,oldBuildSave);Stamp(aRoster,60);
   var reReport=new NativeFlavorSavePaths.PrepareReport();
   Check(NativeFlavorSavePaths.TryPrepare(aRoot,Ns,true,new[]{aSource},false,out dir,out error,reReport)&&File.ReadAllText(aCopy)==oldBuildSave,"#4 old folder newer and destination untouched: imported again");
   Check(Aside(aRoot,".replaced-").Length==1&&File.ReadAllText(Path.Combine(Aside(aRoot,".replaced-")[0],"character-roster-v1/characters.v1.json"))=="{\"revision\":1}"&&reReport.Notice.Contains("preserved"),"#4 previous destination kept beside the saves as .replaced-<time>");
   Check(File.ReadAllText(aRoster)==oldBuildSave&&!File.Exists(Path.Combine(aRoot,"."+Ns+".legacy-import.lock"))&&Aside(aRoot,".legacy-import-").Length==0,"#4 old folder only read; re-import leaves no lease or staging");
   Check(Prepare(aRoot,aSource,out dir,out error)&&Aside(aRoot,".replaced-").Length==1,"#4 after the re-import the new marker stops further imports");
   string cSource,cRoot,cTarget=Imported(work,"re-c",out cSource,out cRoot);string cCopy=Path.Combine(cTarget,"character-roster-v1/characters.v1.json");File.WriteAllText(cCopy,"{\"revision\":1,\"new-build\":true}");
   Check(Prepare(cRoot,cSource,out dir,out error)&&File.ReadAllText(cCopy).Contains("new-build")&&Aside(cRoot,".replaced-").Length==0,"#4 only the new folder changed: new progress kept");
   string dSource,dRoot,dTarget=Imported(work,"re-d",out dSource,out dRoot);string dCopy=Path.Combine(dTarget,"character-roster-v1/characters.v1.json"),dRoster=Path.Combine(dSource,"character-roster-v1/characters.v1.json");
   File.WriteAllText(dCopy,"{\"revision\":3,\"new-build-play\":true}");File.WriteAllText(dRoster,"{\"revision\":4,\"old-again\":true}");Stamp(dRoster,60);var divergeReport=new NativeFlavorSavePaths.PrepareReport();
   Check(NativeFlavorSavePaths.TryPrepare(dRoot,Ns,true,new[]{dSource},false,out dir,out error,divergeReport)&&File.ReadAllText(dCopy).Contains("new-build-play")&&Aside(dRoot,".replaced-").Length==0&&divergeReport.Notice.Length>0&&!divergeReport.ImportFailed,"#4 both folders changed: destination kept, warning noted, nothing replaced");
   Check(File.ReadAllText(dRoster).Contains("old-again"),"#4 diverged: old folder untouched");
   // #5: a permanently unreadable old folder starts fresh with a failed marker, and imports once it becomes readable.
   string failSource=Path.Combine(work,"fail-source"),failRoot=Path.Combine(work,"fail-root");Put(failSource,"character-roster-v1/characters.v1.json","{\"revision\":9}");Directory.CreateDirectory(Path.Combine(failSource,"character-roster-v1","odd"));var failReport=new NativeFlavorSavePaths.PrepareReport();
   Check(NativeFlavorSavePaths.TryPrepare(failRoot,Ns,true,new[]{failSource},false,out dir,out error,failReport)&&failReport.ImportFailed&&error==""&&!Directory.Exists(Path.Combine(failRoot,Ns))&&File.Exists(Path.Combine(failRoot,"."+Ns+".legacy-import.marker")),"#5 import failure: start fresh, flag it, leave a failed marker");
   Check(Directory.Exists(Path.Combine(failSource,"character-roster-v1","odd"))&&File.ReadAllText(Path.Combine(failSource,"character-roster-v1/characters.v1.json"))=="{\"revision\":9}"&&!Directory.Exists(Stage(failRoot))&&Aside(failRoot,".legacy-import-").Length==0,"#5 failed import keeps the old folder and leaves no staging");
   Directory.Delete(Path.Combine(failSource,"character-roster-v1","odd"));
   Check(Prepare(failRoot,failSource,out dir,out error)&&File.ReadAllText(Path.Combine(dir,"character-roster-v1/characters.v1.json"))=="{\"revision\":9}","#4 failed marker: next launch imports once the old folder is readable");
   string playedSource=Path.Combine(work,"played-src"),playedRoot=Path.Combine(work,"played-root");Put(playedSource,"character-roster-v1/characters.v1.json","x");Directory.CreateDirectory(Path.Combine(playedSource,"character-roster-v1","odd"));var playedReport=new NativeFlavorSavePaths.PrepareReport();
   Check(NativeFlavorSavePaths.TryPrepare(playedRoot,Ns,true,new[]{playedSource},false,out dir,out error,playedReport)&&playedReport.ImportFailed,"#5 second unreadable folder starts fresh");
   Put(Path.Combine(playedRoot,Ns),"character-roster-v1/characters.v1.json","played-fresh");Directory.Delete(Path.Combine(playedSource,"character-roster-v1","odd"));
   Check(Prepare(playedRoot,playedSource,out dir,out error)&&File.ReadAllText(Path.Combine(dir,"character-roster-v1/characters.v1.json"))=="played-fresh"&&Aside(playedRoot,".replaced-").Length==0,"#4 failed marker but the player already played fresh: destination kept");
   string qaMark=Path.Combine(work,"qa-mark");
   Check(NativeFlavorSavePaths.TryPrepare(qaMark,Ns,true,new[]{source},true,out dir,out error)&&!File.Exists(Path.Combine(qaMark,"."+Ns+".legacy-import.marker"))&&!Directory.Exists(Path.Combine(qaMark,Ns)),"sandbox never writes a marker or reads old saves");
   string observedName=null;string observeRoot=Path.Combine(work,"guid-observation");Directory.CreateDirectory(observeRoot);
   using(var observed=new System.Threading.ManualResetEventSlim())using(var watcher=new FileSystemWatcher(observeRoot,Ns+".legacy-import*")){
    watcher.NotifyFilter=NotifyFilters.DirectoryName;watcher.Created+=(s,e)=>{observedName=e.Name;observed.Set();};watcher.EnableRaisingEvents=true;
    Check(Prepare(observeRoot,source,out dir,out error),"GUID observation import succeeds");
    Check(observed.Wait(2000)&&observedName.StartsWith(Ns+".legacy-import-",StringComparison.Ordinal)&&Guid.TryParseExact(observedName.Substring((Ns+".legacy-import-").Length),"N",out _),"each import creates a uniquely named GUID staging directory");
   }
   Unchanged(source,original,"all scenarios preserve original file set and bytes");
   Console.WriteLine("PASS "+checks+" import-recovery checks");File.WriteAllLines(Path.Combine(work,"result.txt"),results);return 0;
  }catch(Exception ex){Console.Error.WriteLine("FAIL after "+checks+" checks: "+ex.Message);return 1;}
 }
}
