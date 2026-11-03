using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Formats.Tar;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Loader;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

// Reads Git archive stdout in memory. No source checkout, extraction or project copy.
class BaselineCompile {
 static int Main(string[] args) {
  AssemblyLoadContext.Default.Resolving += (context,name) => {
   string dll=Path.Combine(args[4],name.Name+".dll");
   return File.Exists(dll)?context.LoadFromAssemblyPath(dll):null;
  };
  return Compile(args);
 }
 [MethodImpl(MethodImplOptions.NoInlining)]
 static int Compile(string[] args) {
  string root=args[0],sha=args[1],output=args[2],referenceDir=args[3];
  var trees=new List<SyntaxTree>();
  var psi=new ProcessStartInfo("C:/Program Files/Git/cmd/git.exe") {WorkingDirectory=root,UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true};
  foreach(string a in new[]{"archive","--format=tar",sha,"unity/Assets/Exoduser/Runtime/Core","unity/Assets/Exoduser/Runtime/SourceMap.cs"})psi.ArgumentList.Add(a);
  using(var process=Process.Start(psi)) {
   var error=process.StandardError.ReadToEndAsync();
   using(var tar=new TarReader(process.StandardOutput.BaseStream,leaveOpen:true)) {
    TarEntry entry;
    while((entry=tar.GetNextEntry())!=null) {
     if(!entry.Name.EndsWith(".cs",StringComparison.Ordinal)||entry.DataStream==null)continue;
     using(var reader=new StreamReader(entry.DataStream,Encoding.UTF8,true,4096,leaveOpen:true))
      trees.Add(CSharpSyntaxTree.ParseText(reader.ReadToEnd(),new CSharpParseOptions(LanguageVersion.Latest),sha+":"+entry.Name));
    }
   }
   // Git tar padding can exceed a Windows pipe buffer after TarReader sees the end marker.
   process.StandardOutput.BaseStream.CopyTo(Stream.Null);
   process.WaitForExit();if(process.ExitCode!=0)throw new Exception("git archive failed: "+error.GetAwaiter().GetResult());
  }
  int baseSources=trees.Count;
  string harness=Path.Combine(root,"unity/Tools/enemy-hurt-oracle/Program.cs");
  trees.Add(CSharpSyntaxTree.ParseText(File.ReadAllText(harness),new CSharpParseOptions(LanguageVersion.Latest),harness));
  var refs=Directory.GetFiles(referenceDir,"*.dll").Select(f=>MetadataReference.CreateFromFile(f));
  var compilation=CSharpCompilation.Create("BaselineEnemyHurtTests",trees,refs,new CSharpCompilationOptions(OutputKind.ConsoleApplication,optimizationLevel:OptimizationLevel.Release));
  var result=compilation.Emit(output);
  foreach(var diagnostic in result.Diagnostics.Where(d=>d.Severity==DiagnosticSeverity.Error))Console.WriteLine(diagnostic);
  Console.WriteLine("BASELINE_COMPILE "+sha+" sources="+baseSources+" errors="+result.Diagnostics.Count(d=>d.Severity==DiagnosticSeverity.Error));
  return result.Success?0:1;
 }
}
