using System;using System.IO;using System.Text;using System.Linq;using System.Collections.Generic;
using Exoduser.UnityPort;
static class ImportRecoveryTests
{
 const string Ns="EXODUSER-HELL-FULL",Marker=".exoduser-import-owner";
 static int checks;static readonly List<string> results=new List<string>();
 static void Check(bool value,string message){if(!value)throw new Exception(message);checks++;results.Add(message);}
 static string Put(string root,string relative,string value){string p=Path.Combine(root,relative);Directory.CreateDirectory(Path.GetDirectoryName(p));File.WriteAllText(p,value,new UTF8Encoding(false));return p;}
 static string B64(string s){return Convert.ToBase64String(Encoding.UTF8.GetBytes(s));}
 static string LockPath(string root){return Path.Combine(root,"."+Ns+".legacy-import.lock");}
 static string Stage(string root){return Path.Combine(root,Ns+".legacy-import");}
 static Dictionary<string,byte[]> Snapshot(string root){return Directory.GetFiles(root,"*",SearchOption.AllDirectories).ToDictionary(p=>Path.GetRelativePath(root,p),File.ReadAllBytes);}
 static void Unchanged(string root,Dictionary<string,byte[]> before,string label){var after=Snapshot(root);Check(before.Count==after.Count&&before.All(p=>after.ContainsKey(p.Key)&&p.Value.SequenceEqual(after[p.Key])),label);}
 static void OwnedStage(string root,string source,bool extra=false)
 {
  // Versioned on-disk recovery contract, independently authored abandoned-copy fixture.
  string target=Path.Combine(root,Ns),record="EXODUSER_SAVE_IMPORT_V1\n"+Guid.NewGuid().ToString("N")+"\n"+B64(target)+"\n"+B64(source)+"\nD:"+B64("character-roster-v1")+"\nF:"+B64("character-roster-v1/characters.v1.json")+"\n";
  Put(root,Path.GetFileName(LockPath(root)),record);Put(Stage(root),Marker,record);
  Put(Stage(root),"character-roster-v1/characters.v1.json","partial-copy");
  if(extra)Put(Stage(root),"other-writer.json","preserve-other-writer");
 }
 static bool Prepare(string root,string source,out string directory,out string error){return NativeFlavorSavePaths.TryPrepare(root,Ns,true,source,false,out directory,out error);}
 static int Main(string[] args)
 {
  string work=Path.GetFullPath(args[0]);
  try{
   if(!work.Replace('\\','/').EndsWith("/unity/Library/f1-import-recovery-fixture",StringComparison.Ordinal))throw new Exception("Dedicated owned fixture required");
   if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
   string source=Path.Combine(work,"legacy");string roster=Put(source,"character-roster-v1/characters.v1.json","{\"revision\":7,\"names\":[\"preserve\"]}");
   Put(source,"combat-save-v1/save-41.v1.json","{\"revision\":19,\"hp\":37}");Put(source,"native-settings-v1/settings.v1.bak","{\"revision\":5,\"sfxPercent\":61}");
   var original=Snapshot(source);string dir,error,root=Path.Combine(work,"locked-source");
   using(var locked=new FileStream(roster,FileMode.Open,FileAccess.ReadWrite,FileShare.None)){
    Check(!Prepare(root,source,out dir,out error)&&dir=="","locked source rejects import");
    Check(!Directory.Exists(Path.Combine(root,Ns)),"failed import never commits destination");
    Check(!Directory.Exists(Stage(root)),"F-1: failed attempt removes only its own staging");
    Unchanged(source,original,"locked failure leaves every original byte unchanged");
   }
   Check(Prepare(root,source,out dir,out error),"unlock then one retry succeeds: "+error);
   foreach(var file in original)Check(File.ReadAllBytes(Path.Combine(dir,file.Key)).SequenceEqual(file.Value),"retry preserves copied bytes "+file.Key);
   Unchanged(source,original,"successful retry leaves originals unchanged");

   string abandoned=Path.Combine(work,"abandoned");OwnedStage(abandoned,source);
   Check(Prepare(abandoned,source,out dir,out error),"owned abandoned staging reclaimed and retried once");
   Check(!Directory.Exists(Stage(abandoned))&&File.ReadAllText(Path.Combine(dir,"character-roster-v1/characters.v1.json")).Contains("revision"),"abandoned partial copy replaced with original content");

   string foreign=Path.Combine(work,"unmarked");Put(Stage(foreign),"characters.v1.json","unowned-data");var foreignBefore=Snapshot(Stage(foreign));
   Check(!Prepare(foreign,source,out dir,out error),"unmarked old staging fails closed");Unchanged(Stage(foreign),foreignBefore,"unmarked staging is never deleted");

   string extra=Path.Combine(work,"unexpected-entry");OwnedStage(extra,source,true);var extraBefore=Snapshot(Stage(extra));
   Check(!Prepare(extra,source,out dir,out error),"foreign entry inside owned container blocks cleanup");Unchanged(Stage(extra),extraBefore,"unknown writer data and all staging preserved");

   string busy=Path.Combine(work,"other-importer");OwnedStage(busy,source);var busyBefore=Snapshot(Stage(busy));
   using(var writer=new FileStream(LockPath(busy),FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(busy,source,out dir,out error),"active import lease blocks cleanup");
   Unchanged(Stage(busy),busyBefore,"other import writer's staging preserved");
   Check(Prepare(busy,source,out dir,out error),"released importer lease allows recovery");

   string fileBusy=Path.Combine(work,"other-file-writer");OwnedStage(fileBusy,source);var fileBusyBefore=Snapshot(Stage(fileBusy));
   using(var writer=new FileStream(Path.Combine(Stage(fileBusy),"character-roster-v1/characters.v1.json"),FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!Prepare(fileBusy,source,out dir,out error),"active staging-file writer blocks cleanup before deletion");
   Unchanged(Stage(fileBusy),fileBusyBefore,"staging-file lock preserves complete container");
   Check(Prepare(fileBusy,source,out dir,out error),"released staging-file writer allows recovery");

   string valid=Path.Combine(work,"existing-destination");OwnedStage(valid,source,true);Put(Path.Combine(valid,Ns),"character-roster-v1/characters.v1.json","{\"revision\":99,\"names\":[\"existing\"]}");var validBefore=Snapshot(valid);
   Check(Prepare(valid,source,out dir,out error),"existing destination wins over leftover staging");Unchanged(valid,validBefore,"valid destination, lease and foreign staging stay byte-identical");

   string mismatch=Path.Combine(work,"bad-owner");OwnedStage(mismatch,source);File.AppendAllText(Path.Combine(Stage(mismatch),Marker),"foreign");var mismatchBefore=Snapshot(Stage(mismatch));
   Check(!Prepare(mismatch,source,out dir,out error),"mismatched owner proof is rejected");Unchanged(Stage(mismatch),mismatchBefore,"mismatched owner container preserved");
   Unchanged(source,original,"all scenarios preserve original file set and bytes");
   Console.WriteLine("PASS "+checks+" import-recovery checks");File.WriteAllLines(Path.Combine(work,"result.txt"),results);return 0;
  }catch(Exception ex){Console.Error.WriteLine("FAIL after "+checks+" checks: "+ex.Message);return 1;}
 }
}
