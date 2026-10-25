using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class Program
{
 static int passed,failed;
 static void Check(bool ok,string name){if(ok)passed++;else{failed++;Console.WriteLine("FAIL "+name);}}
 static void Main()
 {
  var roster=new CharacterRoster();
  foreach(var row in JsonDocument.Parse(File.ReadAllText("name-oracle.json")).RootElement.EnumerateArray()){
   string raw=row.GetProperty("raw").GetString(),trimmed=row.GetProperty("trimmed").GetString();
   Check(CharacterRoster.TrimName(raw)==trimmed&&roster.Validate(raw).ToString()==row.GetProperty("expected").GetString(),"source oracle "+JsonSerializer.Serialize(raw));
  }
  Check(!roster.Select(0)&&roster.SelectedIndex==-1&&roster.SelectedName=="","empty selection");
  for(int i=-1;i<=5;i++)if(i!=0)Check(!roster.TryCreate("전사",i,out var e)&&e==CharacterCreateError.Locked&&roster.Count==0,"locked visual "+i);
  Check(roster.TryCreate("  아린  ",0,out _)&&roster.SelectedName=="아린","trim and select");
  Check(!roster.TryCreate("아린",0,out var duplicate)&&duplicate==CharacterCreateError.Duplicate&&roster.Count==1&&roster.SelectedIndex==0,"duplicate is immutable");
  foreach(string name in new[]{"Hero","hero","전사 네명","전사다섯"})Check(roster.TryCreate(name,0,out _),"allowed distinct name "+name);
  Check(!roster.TryCreate("여섯째",0,out var full)&&full==CharacterCreateError.Full&&roster.Count==5&&roster.SelectedName=="전사다섯","capacity failure is immutable");
  Check(roster.Select(0)&&roster.SelectedName=="아린"&&!roster.Select(-1)&&!roster.Select(5)&&roster.SelectedIndex==0,"bounded selection");
  var second=new CharacterRoster();Check(second.Count==0&&second.SelectedName=="","new session has no identities");
  roster.Clear();Check(roster.Count==0&&roster.SelectedIndex==-1&&roster.TryCreate("아린",0,out _),"session reset releases names and capacity");
  File.WriteAllText("result.json",JsonSerializer.Serialize(new{passed,failed,scope="Source JS name oracle, class admission, capacity, selection and disposable session boundary"})+"\n");
  Console.WriteLine($"{passed} passed, {failed} failed");Environment.ExitCode=failed==0?0:1;
 }
}
