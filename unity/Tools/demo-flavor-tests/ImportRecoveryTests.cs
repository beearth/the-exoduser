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
 static int Main(string[] args)
 {
  string work=Path.GetFullPath(args[0]);
  try{
   if(!work.Replace('\\','/').EndsWith("/unity/Library/f1-import-recovery-fixture",StringComparison.Ordinal))throw new Exception("Dedicated owned fixture required");
   if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
   string source=Path.Combine(work,"legacy");
   Put(source,"character-roster-v1/characters.v1.json","{\"revision\":7,\"names\":[\"preserve\"]}");
   string combat=Put(source,"combat-save-v1/save-41.v1.json","{\"revision\":19,\"hp\":37}");
   Put(source,"native-settings-v1/settings.v1.bak","{\"revision\":5,\"sfxPercent\":61}");
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
   string failedAgain=Path.Combine(work,"abandoned-locked-source");Put(Stage(failedAgain),"character-roster-v1/characters.v1.json","partial-copy");
   using(var locked=new FileStream(combat,FileMode.Open,FileAccess.ReadWrite,FileShare.Read))Check(!Prepare(failedAgain,source,out dir,out error),"recovered staging plus locked source returns failure without a retry loop");
   Check(!Directory.Exists(Stage(failedAgain)),"recovered staging also cleaned after copy fails");
   Check(Prepare(failedAgain,source,out dir,out error),"later unlocked call succeeds");
   string foreign=Path.Combine(work,"unexpected-entry");Put(Stage(foreign),"other-writer.json","preserve");var foreignBefore=Snapshot(foreign);
   Check(!Prepare(foreign,source,out dir,out error),"unexpected staging content fails closed");Unchanged(foreign,foreignBefore,"unexpected staging and whole save folder preserved without lease residue");
   string busy=Path.Combine(work,"other-importer");Put(Stage(busy),"character-roster-v1/characters.v1.json","partial");var busyBefore=Snapshot(Stage(busy));
   string existingLease=Put(busy,"."+Ns+".legacy-import.lock","other-importer-lease");
   using(var writer=new FileStream(Path.Combine(busy,"."+Ns+".legacy-import.lock"),FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(busy,source,out dir,out error),"active import lease blocks cleanup");
   Unchanged(Stage(busy),busyBefore,"other importer staging preserved");Check(Prepare(busy,source,out dir,out error),"released lease allows recovery");
   Check(File.ReadAllText(existingLease)=="other-importer-lease","preexisting lease file and its bytes never deleted or changed");
   string fileBusy=Path.Combine(work,"other-file-writer");string stageFile=Put(Stage(fileBusy),"character-roster-v1/characters.v1.json","partial");var fileBusyBefore=Snapshot(fileBusy);
   using(var writer=new FileStream(stageFile,FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(fileBusy,source,out dir,out error),"active staging-file writer blocks cleanup");
   Unchanged(fileBusy,fileBusyBefore,"staging-file lock preserves complete save folder without lease residue");Check(Prepare(fileBusy,source,out dir,out error),"released staging-file writer allows recovery");
   string valid=Path.Combine(work,"existing-destination");Put(Stage(valid),"other-writer.json","preserve");Put(Path.Combine(valid,Ns),"character-roster-v1/characters.v1.json","existing");var validBefore=Snapshot(valid);
   Check(Prepare(valid,source,out dir,out error),"existing destination wins over leftover staging");Unchanged(valid,validBefore,"valid destination and leftover staging unchanged");
   string fileConflict=Path.Combine(work,"file-conflict");Put(fileConflict,Ns+".legacy-import","preserve");var conflictBefore=Snapshot(fileConflict);
   Check(!Prepare(fileConflict,source,out dir,out error),"staging file fails closed");Unchanged(fileConflict,conflictBefore,"staging file preserved");
   Unchanged(source,original,"all scenarios preserve original file set and bytes");
   Console.WriteLine("PASS "+checks+" import-recovery checks");File.WriteAllLines(Path.Combine(work,"result.txt"),results);return 0;
  }catch(Exception ex){Console.Error.WriteLine("FAIL after "+checks+" checks: "+ex.Message);return 1;}
 }
}
