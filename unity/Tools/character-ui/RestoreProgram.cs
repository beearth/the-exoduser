using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class RestoreProgram
{
 static int passed,failed;
 static void Check(bool ok,string name){if(ok)passed++;else{failed++;Console.WriteLine("FAIL "+name);}}
 static void Main()
 {
  var r=new CharacterRoster();r.TryCreate("보존",0,out _);
  foreach(var invalid in new[]{null,new[]{"중복","중복"},new[]{" 한글 "},new[]{"금<지"},new[]{"a"},new[]{"아홉글자테스트이름임"},new[]{"하나","둘째","셋째","넷째","다섯","여섯"}})
   Check(!r.TryRestore(invalid,0)&&r.Count==1&&r.SelectedName=="보존","invalid snapshot preserves previous memory");
  Check(!r.TryRestore(new[]{"하나"},1)&&!r.TryRestore(new[]{"하나"},-2)&&!r.TryRestore(Array.Empty<string>(),0)&&r.SelectedName=="보존","invalid selection does not mutate");
  Check(r.TryRestore(new[]{"첫째","둘째"},-1)&&r.SelectedIndex==-1&&r.SelectedName==""&&r.Count==2,"nonempty unselected snapshot restores");
  Check(r.TryRemove(0)&&r.SelectedIndex==-1&&r.Count==1,"deletion preserves no selection");
  var names=new[]{"첫째","둘째"};Check(r.TryRestore(names,1)&&r.SelectedName=="둘째","selected snapshot restores");names[1]="외부수정";Check(r.SelectedName=="둘째","restore does not alias input array");
  Check(r.TryRestore(Array.Empty<string>(),-1)&&r.Count==0&&r.SelectedIndex==-1,"empty snapshot restores");
  File.WriteAllText("restore-result.json",JsonSerializer.Serialize(new{passed,failed,scope="Atomic roster restoration, rejected corruption and selectedIndex=-1"})+"\n");Console.WriteLine($"{passed} passed, {failed} failed");Environment.ExitCode=failed==0?0:1;
 }
}
