using System;using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 public sealed class InventoryState {
  public static readonly string[] Slots={"weapon","shield","boots","armor","helmet","bow","gloves","pants","belt","necklace","ring1","ring2","cape","bracelet","headband","ossuary","headband2"};
  public const int Columns=10,Rows=120,BagMax=300;
  public readonly List<InventoryItem> Bag=new List<InventoryItem>();
  public readonly InventoryItem[] Equipped=new InventoryItem[17];
  public InventoryItem Selected;
  public InventoryState(InventorySeedData data) {
   if(data==null||data.equipped==null||data.equipped.Length!=Slots.Length||data.bag==null||data.bag.Length>BagMax)throw new ArgumentException("Invalid native inventory seed");
   var owned=new HashSet<InventoryItem>();
   for(int i=0;i<data.equipped.Length;i++){var it=data.equipped[i];if(it==null)continue;string why;if(!Admitted(it,out why)||it.slot!=Slots[i]||!owned.Add(it))throw new ArgumentException("Unsupported equipped item: "+why);Equipped[i]=it;}
   foreach(var it in data.bag){string why;if(it!=null&&it.slot=="ossuary")throw new ArgumentException("The ossuary is never a bag item");if(!Admitted(it,out why)||!owned.Add(it))throw new ArgumentException("Unsupported bag item: "+why);Bag.Add(it);}
   // Missing coordinates are placed as the original inventory opening path does.
   bool missing=false;foreach(var it in Bag)if(it._gx<0||it._gy<0)missing=true;
   if(missing)Sort();else for(int i=0;i<Bag.Count;i++)if(!CanPlace(i,Bag[i]._gx,Bag[i]._gy))throw new ArgumentException("Overlapping seed inventory");
  }
  // The one fixed unique ossuary of the source (game.html mkItem ossuary branch 16155-16166). Never a bag/equip-page item.
  static bool AdmittedOssuary(InventoryItem it,out string reason) {
   reason="Only the fixed source unique ossuary is admitted";
   if(it.rarity!=5||it.tier!=0||it.enh!=0||it.socketCount!=0||it.itemLv!=0||it.reqLv!=0||it.el!=0||!string.IsNullOrEmpty(it.legendarySpecial)||!string.IsNullOrEmpty(it.uniqueSpecial))return false;
   if(it.crystals!=null&&it.crystals.Length!=0||it.socketQ!=null&&it.socketQ.Length!=0||it.elements!=null&&it.elements.Length!=0)return false;
   if(it.affixes==null||it.affixes.Length!=1||it.affixes[0]==null||it.affixes[0].id!="ancHP"||it.affixes[0].tier!=3||!Finite(it.affixes[0].value))return false;
   if(it._implicitStat!="_iAncPow")return false;
   foreach(var f in typeof(InventoryItem).GetFields())if(f.FieldType==typeof(double)&&!Finite((double)f.GetValue(it)))return false;
   reason=null;return true;
  }
  public static bool Admitted(InventoryItem it,out string reason) {
   if(it!=null&&it.slot=="ossuary")return AdmittedOssuary(it,out reason);
   // D01: any mkItem result is admitted (rarity 0-5, tier 0-4, level fields, known affix ids, implicit/legendary/unique fields); enhancement,
   // sockets and crystals stay unadmitted because they have no native owner yet.
   reason="Only admitted unenhanced, socketless source equipment is available";
   if(it==null||Array.IndexOf(Slots,it.slot)<0||it.slot=="ossuary"||it.rarity<0||it.rarity>5||it.tier<0||it.tier>4||it.enh!=0||it.socketCount!=0||it.itemLv<0||it.reqLv<0||it.crystals!=null&&it.crystals.Length!=0||it.socketQ!=null&&it.socketQ.Length!=0)return false;
   if(it.affixes!=null)foreach(var a in it.affixes)if(a==null||!KnownAffix(a.id)||!Finite(a.value)||a.tier<0||a.tier>4)return false;
   if(it.slot=="weapon"&&Array.IndexOf(new[]{"sword","dagger","hammer","mace","club","axe","spear"},it.wtype)<0)return false;
   if(it.slot=="bow"&&Array.IndexOf(new[]{"crossbow","repeater","arcane"},it.btype)<0)return false;
   if(!string.IsNullOrEmpty(it._implicitStat)&&!ImplicitStats.Contains(it._implicitStat))return false;
   if(it.elements!=null)foreach(var e in it.elements)if(e==null||!Finite(e.dmg)||e.dmg<0)return false;
   foreach(var f in typeof(InventoryItem).GetFields())if(f.FieldType==typeof(double)&&!Finite((double)f.GetValue(it)))return false;
   reason=null;return true;
  }
  static readonly HashSet<string> KnownAffixIds=BuildKnownAffixIds(),ImplicitStats=BuildImplicitStats();
  static HashSet<string> BuildKnownAffixIds(){var h=new HashSet<string>();foreach(var a in DropTablesData.AffixPool)h.Add(a.Id);return h;}
  static HashSet<string> BuildImplicitStats(){var h=new HashSet<string>();foreach(var d in DropTablesData.Implicit.Values)if(d.Stat!="_iAncPow")h.Add(d.Stat);return h;}
  static bool KnownAffix(string id)=>id!=null&&KnownAffixIds.Contains(id);
  // Web pickupItem (16401): the grid must have a free 2x2 cell; the item goes to the bag (never auto-equipped) and a closed panel re-sorts the bag.
  // The web leaves potCd NaN on unique gloves/belts (index [5] of a 5-entry table); a native item holds only finite numbers, so NaN becomes 0.
  public bool TryPickup(InventoryItem item,bool sortIfClosed,out string reason){
   reason="No item";if(item==null)return false;
   foreach(var f in typeof(InventoryItem).GetFields())if(f.FieldType==typeof(double)&&double.IsNaN((double)f.GetValue(item)))f.SetValue(item,0.0);
   if(!Admitted(item,out reason))return false;
   if(Owns(item)){reason="Item already owned";return false;}
   Bag.Add(item);int x,y;if(!FindSpace(Bag.Count-1,out x,out y)){Bag.RemoveAt(Bag.Count-1);reason="No bag space";return false;}
   item._gx=x;item._gy=y;reason=null;if(sortIfClosed)Sort();return true;
  }
  static bool Finite(double v)=>!double.IsNaN(v)&&!double.IsInfinity(v);
  public InventoryItem GetEquipped(string slot){int i=Array.IndexOf(Slots,slot);return i<0?null:Equipped[i];}
  public bool Owns(InventoryItem it)=>it!=null&&(Bag.Contains(it)||Array.IndexOf(Equipped,it)>=0);
  public bool Select(InventoryItem it){if(it!=null&&!Owns(it))return false;Selected=it;return true;}
  // All admitted source slots use 2x2; source unknown 1x1 and ossuary category are not admitted.
  public static int Width(InventoryItem it)=>2; public static int Height(InventoryItem it)=>2;
  bool CanPlace(int skip,int x,int y){if(skip<0||skip>=Bag.Count||x<0||y<0||x+2>Columns||y+2>Rows)return false;for(int i=0;i<Bag.Count;i++){if(i==skip)continue;var it=Bag[i];if(it._gx<0||it._gy<0)continue;if(x<it._gx+2&&x+2>it._gx&&y<it._gy+2&&y+2>it._gy)return false;}return true;}
  bool FindSpace(int skip,out int x,out int y){for(y=0;y<=Rows-2;y++)for(x=0;x<=Columns-2;x++)if(CanPlace(skip,x,y))return true;x=y=-1;return false;}
  public bool TryMove(InventoryItem item,int gx,int gy){int i=Bag.IndexOf(item);if(!CanPlace(i,gx,gy))return false;item._gx=gx;item._gy=gy;return true;}
  public bool TryEquip(InventoryItem item,int playerLevel,out string reason){
   reason="Item is not in the bag";if(item==null||!Bag.Contains(item))return false;
   if(item.slot=="ossuary"){reason="The ossuary is not equipped from the equipment page";return false;}
   if(!Admitted(item,out reason))return false;
   if(item.reqLv>playerLevel){reason="Required level: "+item.reqLv;return false;}
   string target=item.slot;if(target=="headband"||target=="headband2")target=GetEquipped("headband")==null?"headband":GetEquipped("headband2")==null?"headband2":item.slot;
   int slot=Array.IndexOf(Slots,target);var old=Equipped[slot];
   if(old!=null&&!Admitted(old,out reason))return false;
   if(old!=null){old._gx=item._gx;old._gy=item._gy;Bag.Add(old);}
   Equipped[slot]=item;item.slot=target;Bag.Remove(item);reason=null;return true;
  }
  public bool TryUnequip(string slot,out string reason){int index=Array.IndexOf(Slots,slot);reason="No equipped item";if(index<0||Equipped[index]==null)return false;if(slot=="ossuary"){reason="The ossuary is not unequipped from the equipment page";return false;}var item=Equipped[index];if(!Admitted(item,out reason))return false;
   // Original unequip checks the grid, not BAG_MAX: the 300-item grid is the limit.
   Bag.Add(item);int x,y;if(!FindSpace(Bag.Count-1,out x,out y)){Bag.RemoveAt(Bag.Count-1);reason="No bag space";return false;}item._gx=x;item._gy=y;Equipped[index]=null;reason=null;return true;}
  public void Sort(){var order=new Dictionary<InventoryItem,int>();for(int i=0;i<Bag.Count;i++)order.Add(Bag[i],i);Bag.Sort((a,b)=>{int d=b.fav.CompareTo(a.fav);if(d!=0)return d;d=a.junk.CompareTo(b.junk);if(d!=0)return d;d=b.rarity.CompareTo(a.rarity);if(d!=0)return d;d=ItemPower(b).CompareTo(ItemPower(a));if(d!=0)return d;d=b.itemLv.CompareTo(a.itemLv);if(d!=0)return d;d=b.enh.CompareTo(a.enh);return d!=0?d:order[a].CompareTo(order[b]);});for(int i=0;i<Bag.Count;i++){Bag[i]._gx=i%5*2;Bag[i]._gy=i/5*2;}}
  public static int ItemPower(InventoryItem i){if(i==null)return 0;double p=i.enh*80+i.itemLv*3;
   p+=i.slot=="weapon"&&i.spd>0?i.atk*i.spd*6:i.slot=="bow"&&i.bowSpd>0?i.atk*i.bowSpd*6:i.atk*6;
   p+=i.def*5+i.eDef*3+i.bonusHp*2+i.bonusSt*1.5+i.spd*30+i.wStagger*2+i.wRange*3+i.bonusRange*8+i.bowRange*2+i.bowPierce*150+i.stagger*2+i.charge+i.chargeDist+i.chargeW*.5+i.chargeAoE*2+i.bonusChargeDist*8+i.chargeCharge*60+i.critRate*20+i.critDmg*120+i.atkSpd*200+i.potCd*80+i.beamDmg*15+i.splashR*3+i.splashMul*60+i.magicPen*25;
   if(i.elements!=null)foreach(var e in i.elements)p+=e.dmg*.6;p+=i.stRegen*150+i.mpRegen*400+(i.bStr+i.bDex+i.bInt)*3;
   double iv=Math.Abs(i._implicitVal);if(iv!=0)p+=iv>1?iv*2:iv*80;
   if(i.affixes!=null)foreach(var a in i.affixes){string unit=PoolUnit(a.id);double v=Math.Abs(a.value);p+=(unit=="pct"||unit=="prob"?v*150:unit=="val"||unit=="dmg"||unit=="dps"?v*1.5:v*3)+a.tier*15;}
   if(!string.IsNullOrEmpty(i.legendarySpecial))p+=120;if(!string.IsNullOrEmpty(i.uniqueSpecial))p+=200;
   return double.IsNaN(p)?0:(int)p;
  }
  // itemPower: the unit of the FIRST AFFIX_POOL entry with this id, 'val' when unknown
  static string PoolUnit(string id){foreach(var e in DropTablesData.AffixPool)if(e.Id==id)return e.Unit;return "val";}
  static string AffixUnit(string id){switch(id){case "defFlat":case "shieldFlat":case "pickupRadius":case "flatLightDmg":return "val";case "poisonDot":return "dps";case "onHitPoison":case "onHitBleed":return "prob";case "ancHP":case "projDmgPct":case "pierceDmgKeep":case "reflect":case "dropRate":case "cooldownRed":case "darkPen":case "counterAtkDmg":case "maxHPPct":case "darkDR":case "slowDmgUp":case "poisonDmgPct":case "skDarkPillarDmg":return "pct";default:return null;}}
  double Affix(string name){double v=0;foreach(var i in Equipped)if(i?.affixes!=null)foreach(var a in i.affixes)if(a.id==name)v+=a.value;return v;}
  public double AffixTotal(string name){return Affix(name);} // web _eqAffix(id)
  public double ImplicitTotal(string name){return Implicit(name);} // web _eqImplicit(stat)
  double Implicit(string name){double v=0;foreach(var i in Equipped)if(i!=null&&i._implicitStat==name)v+=i._implicitVal;return v;}
  public InventoryStats CalculateStats(int level,int stage=1,int difficultySigned=0){if(level<1||stage<1||difficultySigned<-5||difficultySigned>5)throw new ArgumentOutOfRangeException();
   double lb=(int)(level*.5),str=lb,dex=lb,intel=lb,lck=lb,hp=0,mp=0,shield=0,st=0,def=2,energyDef=0,grit=lb,damage=0;
   foreach(var i in Equipped){if(i==null)continue;string reason;if(!Admitted(i,out reason))throw new InvalidOperationException(reason);str+=i.bStr;dex+=i.bDex;intel+=i.bInt;st+=i.bonusSt;grit+=i.bGrit;
    if(i.slot!="weapon"&&i.slot!="bow"&&i.slot!="helmet"){hp+=i.bonusHp;mp+=i.bonusMp;shield+=i.bonusShield;}
    if(i.slot=="shield"||i.slot=="armor"||i.slot=="boots"||i.slot=="gloves"||i.slot=="pants")def+=i.def;
    if(i.slot!="weapon"&&i.slot!="bow"&&i.slot!="ossuary")energyDef+=i.eDef;
    if(i.slot=="necklace"||i.slot=="ring1"||i.slot=="ring2"||i.slot=="belt"||i.slot=="bracelet"||i.slot=="headband"||i.slot=="headband2")damage+=i.dmgBonus;
   }
   var w=GetEquipped("weapon");var g=GetEquipped("gloves");var n=GetEquipped("necklace");var r1=GetEquipped("ring1");var r2=GetEquipped("ring2");foreach(var i in Equipped)if(i!=null)lck+=i.bLck;
   return new InventoryStats{PlayerMaxHp=(int)((Math.Max(100,300-20*difficultySigned)+(stage-1)*6+str*5+hp+Implicit("_iMaxHP"))*(1+Affix("maxHPPct")+(Implicit("_iMaxHPPct")+Implicit("_iLifeHPPct"))*.01))+(int)lb,PlayerMaxStamina=(int)(100+st)+lb,PlayerMaxMana=(int)(100+intel*2+mp)+lb,PlayerMaxShield=(int)(100+intel*5+shield+Affix("shieldFlat")),PlayerBaseAttack=15+(stage-1)*2,
    PlayerSpeed=(2.6+dex*.005)*(1+Implicit("_iMovSpd")*.01),PlayerHpRegen=.05+str*.002,PlayerStaminaRegen=.05+dex*.005,PlayerManaRegen=.05+intel*.005,PlayerPhysicalDefense=def+Affix("defFlat")+(int)(lb*.5),PlayerEnergyDefense=energyDef+Affix("eDefFlat")+(int)((grit+Affix("gritFlatN")+Affix("gritFlatR"))*.5),PlayerCriticalChance=lck*.025+(n?.critRate??0)+(r1?.critRate??0)+(r2?.critRate??0),PlayerCriticalMultiplier=1.5+lck*.002,AttackSpeedMultiplier=1+dex*.0005+(g?.atkSpd??0)+Implicit("_iAtkSpd")*.01,DamageMultiplier=.7,AccessoryDamageBonus=damage*.01,AccessoryDamageSum=damage,DropBonus=1+lck*.0015+Affix("dropRate"),StrengthFlat=str,Dex=dex,
    WeaponAttack=w?.atk??0,WeaponSpeed=w?.spd??0,WeaponRange=(w?.wRange??0)+(w?.bonusRange??0)*4,WeaponArc=w?.wArcW??0,AntiRevive=Affix("antiRevive"),ReviveOnce=Affix("reviveOnce"),RevivePow=Affix("revivePow")+Implicit("_iRevPow")*.01,ReviveCd=Affix("reviveCd"),PhysicalDamageReduction=Implicit("_iPhysDR")*.01,ElementResistance=Implicit("_iElemRes")*.01,StatusResistance=Implicit("_iStsRes")*.01};
  }
 }
}
