using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

class Program
{
 static int assertions;
 static void Equal(string actual,string expected,string label)
 {
  assertions++;
  if(actual!=expected)throw new Exception(label+": expected ["+expected+"] actual ["+actual+"]");
 }
 static void Main(string[] args)
 {
  using(var doc=JsonDocument.Parse(File.ReadAllText(args[0])))
  {
   var root=doc.RootElement;
   var catalogue=root.GetProperty("catalogue");
   Equal(LobbyLanguage.Count.ToString(),catalogue.GetArrayLength().ToString(),"catalogue length");
   int i=0;
   foreach(var item in catalogue.EnumerateArray())
   {
    Equal(LobbyLanguage.GetCode(i),item[0].GetString(),"source UI order "+i);
    Equal(LobbyLanguage.GetDisplayName(item[0].GetString()),item[1].GetString(),"source native name "+i);
    i++;
   }
   foreach(var item in root.GetProperty("cases").EnumerateArray())
   {
    string input=item.GetProperty("input").GetString();
    string normalized=item.GetProperty("normalize").GetString();
    Equal(LobbyLanguage.Resolve(input),item.GetProperty("resolve").GetString(),"original resolve "+input);
    Equal(LobbyLanguage.Normalize(input),normalized,"original normalize "+input);
    string expectedName=null;
    foreach(var entry in catalogue.EnumerateArray())if(entry[0].GetString()==normalized)expectedName=entry[1].GetString();
    Equal(LobbyLanguage.GetDisplayName(input),expectedName,"resolved display name "+input);
   }
  }
  var result=new {passed=assertions,failed=0,scope="Pure C# versus original JS oracle and original HTML labels; no Unity runtime/render validation"};
  string receipt=JsonSerializer.Serialize(result);
  File.WriteAllText(args[1],receipt+"\n");
  Console.WriteLine(receipt);
 }
}
