using System;using System.IO;using System.Linq;using System.Text.Json;using Exoduser.UnityPort.Core;
class Program {
 static int passed;static void Check(bool yes,string message){if(!yes)throw new Exception(message);passed++;}
 static JsonSerializerOptions options=new JsonSerializerOptions{IncludeFields=true};
 static int Main(){var doc=JsonDocument.Parse(File.ReadAllText("oracle.json")).RootElement;Func<InventoryState> fresh=()=>new InventoryState(JsonSerializer.Deserialize<InventorySeedData>(doc.GetProperty("seed").GetRawText(),options));
 foreach(var c in doc.GetProperty("cases").EnumerateArray()){
  var s=fresh();var item=s.Bag[c.GetProperty("index").GetInt32()];s.Select(item);var before=JsonSerializer.Serialize(new{bag=s.Bag,equipped=s.Equipped,selected=s.Selected,stats=s.CalculateStats(1)},options);
  var baseline=InventoryComparison.Baseline(s,item);var rows=InventoryComparison.Rows(item,baseline);
  foreach(var expected in c.GetProperty("rows").EnumerateArray()){var row=rows.Single(x=>x.Key==expected.GetProperty("key").GetString());Check(Math.Abs(row.Delta-expected.GetProperty("delta").GetDouble())<.0000001,"source delta");Check(row.Better==expected.GetProperty("better").GetBoolean(),"source direction");}
  Check(before==JsonSerializer.Serialize(new{bag=s.Bag,equipped=s.Equipped,selected=s.Selected,stats=s.CalculateStats(1)},options),"read-only preview");
 }
 foreach(string empty in new[]{"none","headband","headband2","both"}){
  var s=fresh();var candidate=s.GetEquipped("headband2");s.TryUnequip("headband2",out _);if(empty=="headband"||empty=="both")s.TryUnequip("headband",out _);
  if(empty=="none"||empty=="headband")s.Equipped[16]=new InventoryItem{slot="headband2",name="test"};
  string target=InventoryComparison.TargetSlot(s,candidate);var baseline=InventoryComparison.Baseline(s,candidate);Check(s.TryEquip(candidate,1,out _),"earring equip");Check(ReferenceEquals(s.GetEquipped(target),candidate),"comparison matches actual target "+empty);Check(baseline==null||s.Bag.Contains(baseline),"comparison matches displaced item");
 }
 {var s=fresh();Check(InventoryComparison.TargetSlot(s,new InventoryItem{slot="weapon"})==null,"foreign ownership rejected");Check(InventoryComparison.TargetSlot(s,null)==null,"null selection");var it=s.GetEquipped("weapon");Check(ReferenceEquals(InventoryComparison.Baseline(s,it),it),"equipped self comparison");Check(InventoryComparison.Rows(it,it).Count==0,"self no deltas");}
 {var a=new InventoryItem{affixes=new[]{new InventoryAffix{id="maxHPPct",value=.1},new InventoryAffix{id="maxHPPct",value=.2}}};var b=new InventoryItem{affixes=new[]{new InventoryAffix{id="maxHPPct",value=.5},new InventoryAffix{id="defFlat",value=4}}};var rows=InventoryComparison.Rows(a,b);Check(Math.Abs(rows.Single(x=>x.Key=="maxHPPct").Delta+.2)<.000001,"duplicate affix sum");Check(rows.Single(x=>x.Key=="defFlat").Delta==-4,"lost affix included");}
 File.WriteAllText("result.json",JsonSerializer.Serialize(new{passed,failed=0,scope="source comparison deltas and preview ownership/immutability"}));Console.WriteLine("COMPARISON "+passed+" passed");return 0;
 }
}
