// PC-DEFS1 identity check: the shared affix_defs_web.json must carry exactly the data the forge (forge_web.json affixes/affixUnits) and the
// inventory card (item_card_defs_web.json affixDesc) read before. usage: dotnet run -- <affix_defs_before.json> <Resources/Data dir>
using System;using System.Collections.Generic;using System.IO;using System.Text.Json;
static class P{
 static int bad;
 static void Check(string what,bool ok,string detail=""){if(!ok){bad++;Console.WriteLine("FAIL "+what+" "+detail);}}
 static string Str(JsonElement e,string k)=>e.TryGetProperty(k,out var v)&&v.ValueKind==JsonValueKind.String?v.GetString():null;
 static int Main(string[] a){
  using var before=JsonDocument.Parse(File.ReadAllText(a[0]));using var after=JsonDocument.Parse(File.ReadAllText(Path.Combine(a[1],"affix_defs_web.json")));
  // old reader semantics: affixById[id]=def (last wins), unitById[id]=unit (last wins), affDesc[id]=desc
  var oName=new Dictionary<string,string>();var oType=new Dictionary<string,int>();var oUnit=new Dictionary<string,string>();var oDesc=new Dictionary<string,string>();
  var ids=new List<string>();
  foreach(var x in before.RootElement.GetProperty("affixes").EnumerateArray()){string id=Str(x,"id");if(!oName.ContainsKey(id))ids.Add(id);oName[id]=Str(x,"name");oType[id]=x.GetProperty("type").GetInt32();}
  int rawUnits=0;foreach(var x in before.RootElement.GetProperty("affixUnits").EnumerateArray()){rawUnits++;oUnit[Str(x,"id")]=Str(x,"unit");}
  foreach(var x in before.RootElement.GetProperty("affixDesc").EnumerateArray())oDesc[Str(x,"id")]=Str(x,"desc");
  // new reader semantics (AffixDefs.All consumers): empty unit/desc = absent
  var nName=new Dictionary<string,string>();var nType=new Dictionary<string,int>();var nUnit=new Dictionary<string,string>();var nDesc=new Dictionary<string,string>();
  var arr=after.RootElement.GetProperty("affixes");Check("count 417",arr.GetArrayLength()==417,arr.GetArrayLength().ToString());
  foreach(var x in arr.EnumerateArray()){string id=Str(x,"id");Check("unique id "+id,!nName.ContainsKey(id));nName[id]=Str(x,"name");nType[id]=x.GetProperty("type").GetInt32();
   string u=Str(x,"unit");if(!string.IsNullOrEmpty(u))nUnit[id]=u;string d=Str(x,"desc");if(!string.IsNullOrEmpty(d))nDesc[id]=d;}
  int nameOk=0,typeOk=0,descOk=0,unitOk=0;
  foreach(var id in ids){
   if(nName.TryGetValue(id,out var n)&&n==oName[id])nameOk++;else Check("name "+id,false);
   if(nType.TryGetValue(id,out var t)&&t==oType[id])typeOk++;else Check("type "+id,false);
   oUnit.TryGetValue(id,out var ou);nUnit.TryGetValue(id,out var nu);if(ou==nu)unitOk++;else Check("unit "+id,false,ou+" vs "+nu);
  }
  foreach(var kv in oDesc){if(nDesc.TryGetValue(kv.Key,out var d)&&d==kv.Value)descOk++;else Check("desc "+kv.Key,false);}
  Check("no extra desc",nDesc.Count==oDesc.Count,nDesc.Count+" vs "+oDesc.Count);
  Check("no extra unit",nUnit.Count==oUnit.Count,nUnit.Count+" vs "+oUnit.Count);
  Check("unit keys subset of names",oUnit.Keys.Count>0&&nUnit.Count==oUnit.Count);
  // removed from the old files
  using var forge=JsonDocument.Parse(File.ReadAllText(Path.Combine(a[1],"forge_web.json")));using var card=JsonDocument.Parse(File.ReadAllText(Path.Combine(a[1],"item_card_defs_web.json")));
  Check("forge_web has no affixes",!forge.RootElement.TryGetProperty("affixes",out _));Check("forge_web has no affixUnits",!forge.RootElement.TryGetProperty("affixUnits",out _));
  Check("item_card_defs has no affixDesc",!card.RootElement.TryGetProperty("affixDesc",out _));
  Check("item_card_defs keeps wtypes 7",card.RootElement.GetProperty("wtypes").GetArrayLength()==7);Check("item_card_defs keeps btypes 3",card.RootElement.GetProperty("btypes").GetArrayLength()==3);
  Console.WriteLine($"names {nameOk}/{ids.Count} types {typeOk}/{ids.Count} desc {descOk}/{oDesc.Count} units {unitOk}/{ids.Count} (raw unit rows {rawUnits}, unique {oUnit.Count}); unit-less ids {ids.Count-oUnit.Count}");
  Console.WriteLine(bad==0?"IDENTICAL":"DIFF "+bad);return bad==0?0:1;}}
