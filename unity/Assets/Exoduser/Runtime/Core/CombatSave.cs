using System;
using System.Collections.Generic;
using System.Reflection;

namespace Exoduser.UnityPort.Core
{
 // The part of the web character save (game.html dbSave `saveData`, 3552-3584) that the Unity game owns.
 // Everything else in a loaded save (skills, passives, qslots, hellCleared, crystal bags, ...) stays in Raw and is written back verbatim,
 // so a later web import (E04) cannot be damaged by a Unity autosave.
 public sealed class CombatSaveModel
 {
  public double Lv=1,Exp,MaxExp=15,Sp,Ap;
  public string TransLvDate;public double TransLvCount;
  public double BaseAtk=8,BaseDef=2,Hp,Mhp=350,Mp,Mmp=80,St,Mst=100,Speed=2.6,Shield,Mshield;
  public readonly InventoryItem[] Equipped=new InventoryItem[InventoryItemJson.SlotCount];
  public readonly List<InventoryItem> Bag=new List<InventoryItem>();
  public double Stage,Kills,PotLvHp,BagMax=300;
  public JsonValue Raw;   // loaded `data` root (unmodeled sections), null for a first save
  // B03: the skill sections the Unity skill executor owns (web `skills` {id:Lv}, `skillSlots`[6], `ultSlot`, `activeCtSk`). null = never saved / not loaded:
  // entries of skills Unity cannot run yet stay as the raw save has them, so a web import after a Unity autosave still finds them.
  public Dictionary<string,double> Skills;public string[] SkillSlots;public string UltSlot,ActiveCtSk;
 }

 public static class CombatSaveCodec
 {
  public const string Schema="exoduser.unity.combat-save";
  public const int Version=1;
  // Web literal key order (dbSave). Modeled keys are generated, the rest are copied from Raw when present.
  static readonly string[] TopOrder={"player","inv","stats","passives","grit","gritCostModeV2","qslots","game","bagMax","hellCleared","storage","crystalBag","crystalDust","stoneBag","upgrades","potLv","skills","fused","skProf","fuseProfSec","cardProf","catProf","activeChargeSk","activeBowSk","activeTechSk","activeMagicSk","activeLMBSk","activeRMBSk","activeQSk","activeCtSk","skillSlots","ultSlot","charIdx"};
  static JsonValue Raw(CombatSaveModel m,string key){return m.Raw==null?null:m.Raw.Get(key);}
  static JsonValue Sub(JsonValue obj,string key){return obj==null||obj.Kind!=JsonKind.Object?null:obj.Get(key);}
  static JsonValue Pick(JsonValue obj,string key,JsonValue fallback){var v=Sub(obj,key);return v!=null?v:fallback;}
  static JsonValue Arr(){return JsonValue.NewArray();}
  static JsonValue Obj(){return JsonValue.NewObject();}

  // The `data` object the web stores in characters.data.
  public static JsonValue Encode(CombatSaveModel m)
  {
   var rp=Raw(m,"player");var rg=Raw(m,"game");var ri=Raw(m,"inv");var rpot=Raw(m,"potLv");
   var player=Obj()
    .Set("lv",JsonValue.Of(m.Lv)).Set("exp",JsonValue.Of(m.Exp)).Set("maxExp",JsonValue.Of(m.MaxExp)).Set("sp",JsonValue.Of(m.Sp)).Set("ap",JsonValue.Of(m.Ap))
    .Set("passiveQueue",Pick(rp,"passiveQueue",Arr()))
    .Set("transLvDate",JsonValue.Of(m.TransLvDate)).Set("transLvCount",JsonValue.Of(m.TransLvCount))
    .Set("apBossCleared",Pick(rp,"apBossCleared",Arr())).Set("goddessGift",Pick(rp,"goddessGift",Arr())).Set("_lvStatMigrated",Pick(rp,"_lvStatMigrated",JsonValue.Of(false)))
    .Set("baseAtk",JsonValue.Of(m.BaseAtk)).Set("baseDef",JsonValue.Of(m.BaseDef)).Set("mpR",Pick(rp,"mpR",JsonValue.Of(0.0))).Set("stR",Pick(rp,"stR",JsonValue.Of(.28)))
    .Set("hp",JsonValue.Of(m.Hp)).Set("mhp",JsonValue.Of(m.Mhp)).Set("mp",JsonValue.Of(m.Mp)).Set("mmp",JsonValue.Of(m.Mmp)).Set("st",JsonValue.Of(m.St)).Set("mst",JsonValue.Of(m.Mst)).Set("speed",JsonValue.Of(m.Speed))
    .Set("shield",JsonValue.Of(m.Shield)).Set("mshield",JsonValue.Of(m.Mshield)).Set("maskOn",Pick(rp,"maskOn",JsonValue.Of(true)));
   var bag=Arr();foreach(var it in m.Bag)bag.Add(InventoryItemJson.Write(it));
   var eq=Obj();for(int i=0;i<m.Equipped.Length;i++)eq.Set(InventoryItemJson.SlotName(i),m.Equipped[i]==null?JsonValue.Null:InventoryItemJson.Write(m.Equipped[i]));
   var inv=Obj().Set("bag",bag).Set("equipped",eq).Set("ossCollect",Pick(ri,"ossCollect",Obj()));
   var game=Obj().Set("stage",JsonValue.Of(m.Stage)).Set("kills",JsonValue.Of(m.Kills)).Set("mats",JsonValue.Of(0.0))
    .Set("irisSz",Pick(rg,"irisSz",JsonValue.Of(20.0))).Set("taRecords",Pick(rg,"taRecords",Obj())).Set("clearRecords",Pick(rg,"clearRecords",Obj()))
    .Set("comboMax",Pick(rg,"comboMax",JsonValue.Of(0.0))).Set("playTime",Pick(rg,"playTime",JsonValue.Of(0.0))).Set("cutsceneDone",Pick(rg,"cutsceneDone",JsonValue.Of(false)));
   var pot=Obj();if(rpot!=null&&rpot.Kind==JsonKind.Object)foreach(var kv in rpot.Members)if(kv.Key!="hp")pot.Set(kv.Key,kv.Value);
   pot.Members.Insert(0,new KeyValuePair<string,JsonValue>("hp",JsonValue.Of(m.PotLvHp)));
   var root=Obj();
   foreach(string key in TopOrder)
   {
    switch(key)
    {
     case "player":root.Set(key,player);break;case "inv":root.Set(key,inv);break;case "game":root.Set(key,game);break;
     case "bagMax":root.Set(key,JsonValue.Of(m.BagMax));break;case "potLv":root.Set(key,pot);break;
     case "skills":if(m.Skills!=null)root.Set(key,EncodeSkills(m,Raw(m,key)));else{var r=Raw(m,key);if(r!=null)root.Set(key,r);}break;
     case "skillSlots":if(m.SkillSlots!=null)root.Set(key,EncodeSlots(m,Raw(m,key)));else{var r=Raw(m,key);if(r!=null)root.Set(key,r);}break;
     case "ultSlot":if(m.Skills!=null)root.Set(key,m.UltSlot!=null?JsonValue.Of(m.UltSlot):JsonValue.Null);else{var r=Raw(m,key);if(r!=null)root.Set(key,r);}break;
     case "activeCtSk":if(m.ActiveCtSk!=null)root.Set(key,JsonValue.Of(m.ActiveCtSk));else{var r=Raw(m,key);if(r!=null)root.Set(key,r);}break;
     default:{var raw=Raw(m,key);if(raw!=null)root.Set(key,raw);break;}
    }
   }
   if(m.Raw!=null&&m.Raw.Kind==JsonKind.Object)foreach(var kv in m.Raw.Members)if(!root.Has(kv.Key))root.Set(kv.Key,kv.Value);   // future/unknown keys survive
   return root;
  }

  // B03: raw entries are copied; the ids in SkillIds are the ones the Unity executor owns and are written from the model (Lv 0 = key removed)
  static JsonValue EncodeSkills(CombatSaveModel m,JsonValue raw)
  {
   var o=Obj();
   if(raw!=null&&raw.Kind==JsonKind.Object)foreach(var kv in raw.Members)
   {
    double level;
    if(OwnsSkill(kv.Key)&&m.Skills.TryGetValue(kv.Key,out level)){if(level>=1)o.Set(kv.Key,JsonValue.Of(level));}
    else o.Set(kv.Key,kv.Value);
   }
   foreach(var kv in m.Skills)if(kv.Value>=1)o.Set(kv.Key,JsonValue.Of(kv.Value));
   return o;
  }
  static bool OwnsSkill(string id){return id=="kiSlash"||Array.IndexOf(Simulation.PortedSkillIds,id)>=0;}
  static JsonValue EncodeSlots(CombatSaveModel m,JsonValue raw)
  {
   var a=Arr();
   for(int i=0;i<m.SkillSlots.Length;i++)
   {
    string s=m.SkillSlots[i];
    if(s==null&&raw!=null&&raw.Kind==JsonKind.Array&&i<raw.Items.Count){var r=raw.Items[i];if(r!=null&&r.Kind==JsonKind.String&&(!OwnsSkill(r.Text)||!m.Skills.ContainsKey(r.Text))){a.Add(r);continue;}}
    a.Add(s!=null?JsonValue.Of(s):JsonValue.Null);
   }
   return a;
  }

  public static double Or(double v,double fallback){return v==0||double.IsNaN(v)?fallback:v;}   // JS `v||fallback`
  public static double Number(JsonValue obj,string key,double fallback){var v=Sub(obj,key);return v!=null&&v.Kind==JsonKind.Number?v.Number:fallback;}
  static bool Valid(JsonValue v,JsonKind kind){return v!=null&&v.Kind==kind;}

  // web _restoreExpProgress (3606-3611)
  public static void RestoreExp(double lv,double rawExp,double rawMaxExp,bool hasMaxExp,out double exp,out double maxExp)
  {
   maxExp=hasMaxExp?Or(rawMaxExp,15):15;
   double l=Or(lv,1);
   if(l<1000||(!double.IsInfinity(maxExp)&&!double.IsNaN(maxExp)&&maxExp>0)){exp=Or(rawExp,0);return;}
   exp=Math.Max(0,rawExp);double t=lv-999;maxExp=Math.Floor(5000000+t*t*10000);   // _calcMaxExp(lv>=1000) in double: the int LevelExp.MaxExperience would overflow past Lv1461
  }

  // The player/inv/game/bagMax/potLv part of web dbRestore (3618-3646, 3694, 3730-3746, 3778) without the legacy item migrations
  // (Unity only ever writes items in the current shape).
  public static bool TryDecode(JsonValue data,out CombatSaveModel model,out string error)
  {
   model=null;error=null;
   if(!Valid(data,JsonKind.Object)){error="save root is not an object";return false;}
   var pd=data.Get("player");
   if(!Valid(pd,JsonKind.Object)){error="save has no player (created, never played)";return false;}
   var m=new CombatSaveModel{Raw=data};
   m.Lv=Or(Number(pd,"lv",0),1);
   double exp,maxExp;RestoreExp(Number(pd,"lv",0),Number(pd,"exp",0),Number(pd,"maxExp",0),true,out exp,out maxExp);m.Exp=exp;m.MaxExp=maxExp;
   m.TransLvDate=pd.Get("transLvDate")!=null&&pd.Get("transLvDate").Kind==JsonKind.String?pd.Get("transLvDate").Text:null;
   m.TransLvCount=Or(Number(pd,"transLvCount",0),0);
   m.Sp=Or(Number(pd,"sp",0),0);m.Ap=Or(Number(pd,"ap",0),0);
   m.BaseAtk=Or(Number(pd,"baseAtk",0),8);m.BaseDef=Or(Number(pd,"baseDef",0),2);
   m.Hp=Number(pd,"hp",0);m.Mhp=Or(Number(pd,"mhp",0),350);m.Mp=Number(pd,"mp",0);m.Mmp=Or(Number(pd,"mmp",0),80);
   m.St=Number(pd,"st",0);m.Mst=Or(Number(pd,"mst",0),100);m.Speed=Or(Number(pd,"speed",0),2.6);
   m.Shield=Or(Number(pd,"shield",0),0);m.Mshield=Or(Number(pd,"mshield",0),0);
   var inv=data.Get("inv");
   if(Valid(inv,JsonKind.Object))
   {
    var bag=inv.Get("bag");
    if(Valid(bag,JsonKind.Array))foreach(var item in bag.Items){if(!Valid(item,JsonKind.Object)){error="bag entry is not an item";return false;}m.Bag.Add(InventoryItemJson.Read(item));}
    var eq=inv.Get("equipped");
    if(Valid(eq,JsonKind.Object))for(int i=0;i<m.Equipped.Length;i++)
    {
     var v=eq.Get(InventoryItemJson.SlotName(i));
     if(Valid(v,JsonKind.Object))m.Equipped[i]=InventoryItemJson.Read(v);
    }
   }
   var game=data.Get("game");
   if(Valid(game,JsonKind.Object)){m.Stage=Or(Number(game,"stage",0),0);m.Kills=Or(Number(game,"kills",0),0);}
   var bm=data.Get("bagMax");
   m.BagMax=bm!=null&&bm.Kind==JsonKind.Number?Or(bm.Number,300):300;
   var pot=data.Get("potLv");
   if(Valid(pot,JsonKind.Object))m.PotLvHp=Number(pot,"hp",0);
   var sk=data.Get("skills");
   if(Valid(sk,JsonKind.Object))
   {
    m.Skills=new Dictionary<string,double>();foreach(var kv in sk.Members)if(kv.Value!=null&&kv.Value.Kind==JsonKind.Number)m.Skills[kv.Key]=kv.Value.Number;
    var slots=data.Get("skillSlots");m.SkillSlots=new string[6];
    if(Valid(slots,JsonKind.Array))for(int i=0;i<6&&i<slots.Items.Count;i++){var v=slots.Items[i];if(v!=null&&v.Kind==JsonKind.String)m.SkillSlots[i]=v.Text;}
    var ult=data.Get("ultSlot");m.UltSlot=ult!=null&&ult.Kind==JsonKind.String?ult.Text:null;
    var ct=data.Get("activeCtSk");m.ActiveCtSk=ct!=null&&ct.Kind==JsonKind.String?ct.Text:null;
   }
   model=m;return true;
  }

  // web dbRestore 3733-3738: the saved `game.mats` is only a legacy remainder, the account-wide shared value is the truth.
  public static void ResolveMats(double savedMats,double sharedMats,out double newShared,out double playerMats,out bool clearSaved)
  {
   double saved=Math.Max(0,Math.Floor(double.IsNaN(savedMats)?0:savedMats));
   newShared=sharedMats;clearSaved=false;
   if(saved>0&&saved!=sharedMats){newShared=Math.Max(sharedMats,saved);clearSaved=true;}
   playerMats=Math.Max(0,newShared);
  }
 }

 // Reflection reader/writer for InventoryItem in the web item shape (same field names as the web objects).
 public static class InventoryItemJson
 {
  public const int SlotCount=17;
  public static string SlotName(int i){return InventoryState.Slots[i];}
  static readonly FieldInfo[] Fields=typeof(InventoryItem).GetFields(BindingFlags.Public|BindingFlags.Instance);
  static readonly HashSet<string> Always=new HashSet<string>{"id","slot","name","rarity","tier","itemLv","reqLv","enh","socketCount"};

  public static JsonValue Write(InventoryItem it)
  {
   var o=JsonValue.NewObject();
   foreach(var f in Fields)
   {
    object v=f.GetValue(it);Type t=f.FieldType;
    if(t==typeof(string)){if(v!=null||Always.Contains(f.Name))o.Set(f.Name,JsonValue.Of((string)v));}
    else if(t==typeof(double)){if((double)v!=0||Always.Contains(f.Name))o.Set(f.Name,JsonValue.Of((double)v));}
    else if(t==typeof(int)){int n=(int)v;if(f.Name=="_gx"||f.Name=="_gy"){if(n>=0)o.Set(f.Name,JsonValue.Of((double)n));}else if(n!=0||Always.Contains(f.Name))o.Set(f.Name,JsonValue.Of((double)n));}
    else if(t==typeof(bool)){if((bool)v)o.Set(f.Name,JsonValue.Of(true));}
    else if(t==typeof(double[])){var a=(double[])v;if(a!=null){var arr=JsonValue.NewArray();foreach(double d in a)arr.Add(JsonValue.Of(d));o.Set(f.Name,arr);}}
    else if(t==typeof(InventoryAffix[])){var a=(InventoryAffix[])v;var arr=JsonValue.NewArray();if(a!=null)foreach(var x in a)arr.Add(JsonValue.NewObject().Set("id",JsonValue.Of(x.id)).Set("tier",JsonValue.Of((double)x.tier)).Set("value",JsonValue.Of(x.value)));o.Set(f.Name,arr);}
    else if(t==typeof(InventoryCrystal[])){var a=(InventoryCrystal[])v;var arr=JsonValue.NewArray();if(a!=null)foreach(var x in a)arr.Add(JsonValue.NewObject().Set("id",JsonValue.Of(x.id)).Set("star",JsonValue.Of((double)x.star)).Set("enh",JsonValue.Of((double)x.enh)).Set("q",JsonValue.Of(x.q)));o.Set(f.Name,arr);}
    else if(t==typeof(InventoryElement[])){var a=(InventoryElement[])v;if(a!=null){var arr=JsonValue.NewArray();foreach(var x in a)arr.Add(JsonValue.NewObject().Set("el",JsonValue.Of((double)x.el)).Set("dmg",JsonValue.Of(x.dmg)));o.Set(f.Name,arr);}}
   }
   return o;
  }

  public static InventoryItem Read(JsonValue o)
  {
   var it=new InventoryItem();
   foreach(var f in Fields)
   {
    var v=o.Get(f.Name);if(v==null||v.Kind==JsonKind.Null)continue;Type t=f.FieldType;
    if(t==typeof(string)){if(v.Kind==JsonKind.String)f.SetValue(it,v.Text);}
    else if(t==typeof(double)){if(v.Kind==JsonKind.Number)f.SetValue(it,v.Number);}
    else if(t==typeof(int)){if(v.Kind==JsonKind.Number)f.SetValue(it,(int)v.Number);}
    else if(t==typeof(bool)){if(v.Kind==JsonKind.Bool)f.SetValue(it,v.Bool);}
    else if(t==typeof(double[])){if(v.Kind==JsonKind.Array){var a=new double[v.Items.Count];for(int i=0;i<a.Length;i++)a[i]=v.Items[i].Kind==JsonKind.Number?v.Items[i].Number:0;f.SetValue(it,a);}}
    else if(t==typeof(InventoryAffix[])){if(v.Kind==JsonKind.Array){var a=new List<InventoryAffix>();foreach(var x in v.Items)if(x.Kind==JsonKind.Object)a.Add(new InventoryAffix{id=x.Str("id"),tier=(int)CombatSaveCodec.Number(x,"tier",0),value=CombatSaveCodec.Number(x,"value",0)});f.SetValue(it,a.ToArray());}}
    else if(t==typeof(InventoryCrystal[])){if(v.Kind==JsonKind.Array){var a=new List<InventoryCrystal>();foreach(var x in v.Items)if(x.Kind==JsonKind.Object)a.Add(new InventoryCrystal{id=x.Str("id"),star=(int)CombatSaveCodec.Number(x,"star",0),enh=(int)CombatSaveCodec.Number(x,"enh",0),q=CombatSaveCodec.Number(x,"q",0)});f.SetValue(it,a.ToArray());}}
    else if(t==typeof(InventoryElement[])){if(v.Kind==JsonKind.Array){var a=new List<InventoryElement>();foreach(var x in v.Items)if(x.Kind==JsonKind.Object)a.Add(new InventoryElement{el=(int)CombatSaveCodec.Number(x,"el",0),dmg=CombatSaveCodec.Number(x,"dmg",0)});f.SetValue(it,a.ToArray());}}
   }
   return it;
  }
 }
}
