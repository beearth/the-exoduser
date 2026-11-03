using System;using System.IO;using System.Linq;using System.Diagnostics;using System.Threading;using System.Reflection;
using Exoduser.UnityPort;
static class ImportConcurrentTests
{
 const string Ns="EXODUSER-HELL-FULL";static int checks;
 static void Check(bool value,string message){if(!value)throw new Exception(message);checks++;Console.WriteLine("PASS "+message);}
 static string Put(string root,string name,string value){string p=Path.Combine(root,name);Directory.CreateDirectory(Path.GetDirectoryName(p));File.WriteAllText(p,value);return p;}
 static Process Child(params string[] args){var start=new ProcessStartInfo(Environment.ProcessPath){UseShellExecute=false,CreateNoWindow=true};if(Path.GetFileNameWithoutExtension(Environment.ProcessPath).Equals("dotnet",StringComparison.OrdinalIgnoreCase))start.ArgumentList.Add(Assembly.GetExecutingAssembly().Location);foreach(string arg in args)start.ArgumentList.Add(arg);return Process.Start(start);}
 static void WaitFile(string path){var end=DateTime.UtcNow.AddSeconds(15);while(!File.Exists(path)&&DateTime.UtcNow<end)Thread.Sleep(10);if(!File.Exists(path))throw new Exception("Child ready timeout");}
 static int Main(string[] args){try{
  if(args[0]=="hold"){
   using(var lease=new FileStream(Path.Combine(args[1],"."+Ns+".legacy-import.lock"),FileMode.CreateNew,FileAccess.ReadWrite,FileShare.None,4096,FileOptions.DeleteOnClose)){File.WriteAllText(args[2],"ready");WaitFile(args[3]);}return 0;
  }
  if(args[0]=="import"){
   bool ok=NativeFlavorSavePaths.TryPrepare(args[1],Ns,true,args[2],false,out string dir,out string error);File.WriteAllText(args[3],ok?"ok":"blocked");return 0;
  }
  string work=Path.GetFullPath(args[0]);if(!work.Replace('\\','/').EndsWith("/unity/Library/f1-two-process-fixture",StringComparison.Ordinal))throw new Exception("Dedicated fixture required");
  if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
  string source=Path.Combine(work,"source"),root=Path.Combine(work,"destination"),stage=Path.Combine(root,Ns+".legacy-import");
  string original=Put(source,"character-roster-v1/characters.json","{\"revision\":5}"),copy=Put(stage,"character-roster-v1/partial.json","partial");byte[] bytes=File.ReadAllBytes(original);
  Put(stage,".DS_Store","metadata");string ready=Path.Combine(work,"ready"),release=Path.Combine(work,"release"),answer=Path.Combine(work,"answer");
  using(var holder=Child("hold",root,ready,release)){
   try{
    WaitFile(ready);
    using(var importer=Child("import",root,source,answer)){Check(importer.WaitForExit(15000)&&importer.ExitCode==0,"second process exits after real lease contention");}
    Check(File.ReadAllText(answer)=="blocked"&&!Directory.Exists(Path.Combine(root,Ns)),"second process cannot promote while lease is held");
    Check(File.ReadAllText(copy)=="partial"&&File.Exists(Path.Combine(stage,".DS_Store")),"other process cannot reclaim active owner's staging");
   }finally{File.WriteAllText(release,"release");if(!holder.WaitForExit(5000)){holder.Kill(true);holder.WaitForExit();}}
   Check(holder.ExitCode==0&&!File.Exists(Path.Combine(root,"."+Ns+".legacy-import.lock")),"holder releases and deletes only its own lease");
  }
  using(var retry=Child("import",root,source,answer)){Check(retry.WaitForExit(15000)&&retry.ExitCode==0&&File.ReadAllText(answer)=="ok","separate process retries successfully after release");}
  Check(File.ReadAllBytes(original).SequenceEqual(bytes)&&File.ReadAllBytes(Path.Combine(root,Ns,"character-roster-v1/characters.json")).SequenceEqual(bytes),"all original and promoted bytes preserved");
  Check(!Directory.Exists(stage)&&Directory.GetDirectories(root,Ns+".legacy-import-*").Length==0&&!File.Exists(Path.Combine(root,"."+Ns+".legacy-import.lock")),"new lease owner reclaims abandoned staging and leaves no own residue");
  Console.WriteLine("PASS "+checks+" two-process import checks");return 0;
 }catch(Exception e){Console.Error.WriteLine("FAIL concurrent fixture: "+e.Message);return 1;}}
}
