using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 // Read-only item values. No virtual equip, player mutation, or predicted combat power.
 public static class InventoryComparison {
  public sealed class Row {
   public string Key,Label; public double Current,Selected; public bool LowerIsBetter,Affix;
   public double Delta { get { return Selected-Current; } }
   public bool Better { get { return LowerIsBetter?Delta<0:Delta>0; } }
  }
  public static string TargetSlot(InventoryState state,InventoryItem item) {
   if(state==null||item==null||!state.Owns(item))return null;
   if(!state.Bag.Contains(item))return item.slot;
   if(item.slot=="headband"||item.slot=="headband2")return state.GetEquipped("headband")==null?"headband":state.GetEquipped("headband2")==null?"headband2":item.slot;
   return item.slot;
  }
  public static InventoryItem Baseline(InventoryState state,InventoryItem item) {
   var slot=TargetSlot(state,item);return slot==null?null:state.GetEquipped(slot);
  }
  public static List<Row> Rows(InventoryItem selected,InventoryItem current) {
   var rows=new List<Row>();if(selected==null||current==null)return rows;
   Add(rows,"atk","공격력",selected.atk,current.atk,false);
   Add(rows,"def","방어력",selected.def,current.def,false);
   Add(rows,"spd","무기 속도",selected.spd,current.spd,false);
   Add(rows,"wStCost","체력 소모",selected.wStCost,current.wStCost,true);
   Add(rows,"wRange","무기 사거리",selected.wRange,current.wRange,false);
   Add(rows,"wArcW","공격 범위",selected.wArcW,current.wArcW,false);
   Add(rows,"wStagger","무기 경직",selected.wStagger,current.wStagger,false);
   Add(rows,"bowSpd","발사 속도",selected.bowSpd,current.bowSpd,false);
   Add(rows,"bowRange","활 사거리",selected.bowRange,current.bowRange,false);
   Add(rows,"bowPierce","관통 확률",selected.bowPierce,current.bowPierce,false);
   Add(rows,"bonusSt","추가 체력",selected.bonusSt,current.bonusSt,false);
   Add(rows,"charge","돌진력",selected.charge,current.charge,false);
   Add(rows,"chargeDist","돌진 거리",selected.chargeDist,current.chargeDist,false);
   Add(rows,"bonusChargeDist","돌진 거리+",selected.bonusChargeDist,current.bonusChargeDist,false);
   Add(rows,"chargeW","돌진 폭",selected.chargeW,current.chargeW,false);
   Add(rows,"chargeAoE","광역 범위",selected.chargeAoE,current.chargeAoE,false);
   Add(rows,"chargeCharge","돌진 충전",selected.chargeCharge,current.chargeCharge,false);
   Add(rows,"stagger","경직력",selected.stagger,current.stagger,false);
   Add(rows,"shieldWt","무게",selected.shieldWt,current.shieldWt,true);
   Add(rows,"splashR","스플래시 범위",selected.splashR,current.splashR,false);
   Add(rows,"splashMul","스플래시 배율",selected.splashMul,current.splashMul,false);
   Add(rows,"magicPen","마법 관통",selected.magicPen,current.magicPen,false);
   Add(rows,"bonusRange","사거리+",selected.bonusRange,current.bonusRange,false);
   Add(rows,"stRegen","체력 회복",selected.stRegen,current.stRegen,false);
   Add(rows,"mpRegen","마력 회복",selected.mpRegen,current.mpRegen,false);
   Add(rows,"bStr","힘",selected.bStr,current.bStr,false);
   Add(rows,"bDex","민첩",selected.bDex,current.bDex,false);
   Add(rows,"bInt","지능",selected.bInt,current.bInt,false);
   Add(rows,"atkSpd","공격 속도",selected.atkSpd,current.atkSpd,false);
   Add(rows,"potCd","물약 쿨감",selected.potCd,current.potCd,true);
   Add(rows,"bonusHp","추가 생명력",selected.bonusHp,current.bonusHp,false);
   Add(rows,"critRate","치명률",selected.critRate,current.critRate,false);
   Add(rows,"critDmg","치명 피해",selected.critDmg,current.critDmg,false);
   Add(rows,"beamDmg","마법 피해",selected.beamDmg,current.beamDmg,false);
   Add(rows,"eDef","에너지 방어",selected.eDef,current.eDef,false);
   Add(rows,"bonusMp","추가 마력",selected.bonusMp,current.bonusMp,false);
   Add(rows,"bonusShield","추가 보호막",selected.bonusShield,current.bonusShield,false);
   Add(rows,"dmgBonus","추가 피해",selected.dmgBonus,current.dmgBonus,false);
   Add(rows,"bLck","행운",selected.bLck,current.bLck,false);
   var next=Affixes(selected);var old=Affixes(current);var keys=new List<string>(next.Keys);
   foreach(var key in old.Keys)if(!next.ContainsKey(key))keys.Add(key);
   foreach(var key in keys){next.TryGetValue(key,out double nv);old.TryGetValue(key,out double ov);Add(rows,key,key,nv,ov,false,true);}
   return rows;
  }
  static void Add(List<Row> rows,string key,string label,double nv,double ov,bool lower=false,bool affix=false) {
   if(Math.Abs(nv-ov)>.0001)rows.Add(new Row{Key=key,Label=label,Selected=nv,Current=ov,LowerIsBetter=lower,Affix=affix});
  }
  static Dictionary<string,double> Affixes(InventoryItem item) {
   var values=new Dictionary<string,double>();if(item.affixes!=null)foreach(var a in item.affixes){values.TryGetValue(a.id,out double v);values[a.id]=v+a.value;}return values;
  }
 }
}
