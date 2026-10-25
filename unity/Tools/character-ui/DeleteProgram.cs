using System;
using System.Linq;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class DeleteProgram
{
 static int passed,failed;
 static void Check(bool ok,string name){if(ok)passed++;else{failed++;Console.WriteLine("FAIL "+name);}}
 static CharacterRoster Roster(int count){var r=new CharacterRoster();for(int i=0;i<count;i++)r.TryCreate("전사"+i,0,out _);return r;}
 static void Main()
 {
  for(int count=1;count<=5;count++)for(int selected=0;selected<count;selected++)for(int deleting=0;deleting<count;deleting++){
   var r=Roster(count);r.Select(selected);string previous=r.SelectedName;
   var expected=Enumerable.Range(0,count).Where(i=>i!=deleting).Select(i=>"전사"+i).ToArray();
   string expectedSelection=expected.Length==0?"":selected==deleting?expected[Math.Min(deleting,expected.Length-1)]:previous;
   Check(r.TryRemove(deleting)&&r.Count==count-1&&r.SelectedName==expectedSelection&&Enumerable.Range(0,r.Count).Select(r.NameAt).SequenceEqual(expected),$"count {count}, selected {selected}, deleted {deleting}");
  }
  var empty=Roster(0);Check(!empty.TryRemove(0)&&empty.SelectedIndex==-1,"empty rejection");
  var full=Roster(5);full.Select(2);Check(!full.TryRemove(-1)&&!full.TryRemove(5)&&full.Count==5&&full.SelectedName=="전사2","invalid indices preserve roster");
  Check(full.TryRemove(1)&&full.TryCreate("전사1",0,out _)&&full.Count==5&&full.SelectedName=="전사1","deleted name and capacity reusable");
  File.WriteAllText("delete-result.json",JsonSerializer.Serialize(new{passed,failed,scope="Deletion across all 1..5-slot selection positions, invalid indices and capacity reuse"})+"\n");
  Console.WriteLine($"{passed} passed, {failed} failed");Environment.ExitCode=failed==0?0:1;
 }
}
