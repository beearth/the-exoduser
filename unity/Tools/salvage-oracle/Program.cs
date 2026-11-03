using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort.Core;
// InventoryState.SalvageValue / JunkItems / SalvageJunk / SalvageOne against the web salvageVal oracle (export.cjs) and the
// web invJunkBtn / dropItem rules. Standalone .NET over Core only: not a Unity Player check.
class Program
{
 static int failed,checks;
 static void Check(bool ok,string name){checks++;if(!ok){failed++;Console.WriteLine("FAIL "+name);}}
 static InventoryItem Item(int rarity,int tier,bool junk=false,bool fav=false){return new InventoryItem{slot="armor",name="t",rarity=rarity,tier=tier,junk=junk,fav=fav};}
 static int Main(string[] args)
 {
  string oraclePath=args.Length>0?args[0]:"oracle.json";
  using(var doc=JsonDocument.Parse(File.ReadAllText(oraclePath))){
   int n=0;
   foreach(var c in doc.RootElement.GetProperty("cases").EnumerateArray()){
    var i=c.GetProperty("input");var it=new InventoryItem();
    if(i.TryGetProperty("rarity",out var r))it.rarity=r.GetInt32();if(i.TryGetProperty("enh",out var e))it.enh=e.GetInt32();if(i.TryGetProperty("tier",out var t))it.tier=t.GetInt32();
    int want=c.GetProperty("value").GetInt32(),got=InventoryState.SalvageValue(it);
    Check(got==want,"salvageVal r"+it.rarity+" e"+it.enh+" t"+it.tier+" want "+want+" got "+got);n++;
   }
   Check(n>=192,"oracle grid has rarity0-5 x enh0/1/5/20 x tier0-7 ("+n+")");
  }
  Check(InventoryState.SalvageValue(null)==0,"null item is worth 0");
  // Bulk junk salvage (web invJunkBtn): favourites excluded even when junk, non-junk kept, total = sum of salvageVal.
  var bag=new List<InventoryItem>{Item(0,0,junk:true),Item(1,3,junk:true),Item(2,1),Item(4,2,junk:true,fav:true),Item(3,4,junk:true)};
  var s=new InventoryState(new InventorySeedData{equipped=new InventoryItem[InventoryState.Slots.Length],bag=bag.ToArray()});
  var junk=s.JunkItems();Check(junk.Count==3,"JunkItems excludes favourite and non-junk");
  int expect=1000+(2000+6)+(20000+8);Check(s.JunkSalvageTotal()==expect,"JunkSalvageTotal "+s.JunkSalvageTotal());
  s.Select(junk[1]);
  int count;int gained=s.SalvageJunk(out count);
  Check(count==3&&gained==expect,"SalvageJunk count3 total "+gained);
  Check(s.Bag.Count==2&&s.Bag.Contains(bag[2])&&s.Bag.Contains(bag[3]),"SalvageJunk keeps non-junk and favourite");
  Check(s.Selected==null,"selection of a removed item is cleared");
  Check(s.SalvageJunk(out count)==0&&count==0,"second SalvageJunk pays nothing");
  // Single salvage (web dropItem): favourite refused, next index selected.
  Check(s.SalvageOne(bag[3])==-1&&s.Bag.Contains(bag[3]),"SalvageOne refuses favourite");
  s.Select(bag[2]);int idx=s.Bag.IndexOf(bag[2]);int one=s.SalvageOne(bag[2]);
  Check(one==10002&&!s.Bag.Contains(bag[2]),"SalvageOne pays salvageVal and removes");
  Check(s.Selected==s.Bag[Math.Min(idx,s.Bag.Count-1)],"SalvageOne selects min(idx,len-1)");
  Check(s.SalvageOne(bag[2])==-1,"SalvageOne of a removed item is refused");
  Console.WriteLine("SALVAGE_RESULT "+checks+" checks / "+failed+" failures");return failed==0?0:2;
 }
}
