using System;using System.IO;using System.Text.Json;using Exoduser.UnityPort.Core;
static class P{static int Main(string[] a){
 var opt=new JsonSerializerOptions{IncludeFields=true,NumberHandling=System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString};
 using var doc=JsonDocument.Parse(File.ReadAllText(a[0]));int bad=0;
 foreach(var row in doc.RootElement.EnumerateArray()){
  var seed=JsonSerializer.Deserialize<InventorySeedData>(row.GetProperty("seed").GetRawText(),opt);
  var inv=new InventoryState(seed);var s=inv.CalculateStats(row.GetProperty("lv").GetInt32());
  var w=row.GetProperty("web");double oMp=row.GetProperty("ossuaryBonusMp").GetDouble();
  int hp=s.PlayerMaxHp;double mp=s.PlayerMaxMana+oMp,st=s.PlayerMaxStamina;
  bool ok=hp==w.GetProperty("mhp").GetInt32()&&mp==w.GetProperty("mmp").GetDouble()&&st==w.GetProperty("mst").GetDouble();
  if(!ok)bad++;
  Console.WriteLine($"ts={row.GetProperty("ts")} unity(noOss) HP={hp} MP={s.PlayerMaxMana} ST={st} Shield={s.PlayerMaxShield} | +ossuaryMp={oMp} -> MP={mp} | web HP={w.GetProperty("mhp")} MP={w.GetProperty("mmp")} ST={w.GetProperty("mst")} Shield={w.GetProperty("mshield")} => {(ok?"MATCH":"DIFF")}");
 }
 return bad;}}
