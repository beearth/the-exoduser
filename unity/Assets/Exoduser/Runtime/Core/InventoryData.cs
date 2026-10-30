using System;
namespace Exoduser.UnityPort.Core {
 [Serializable] public sealed class InventoryElement { public int el; public double dmg; }
 [Serializable] public sealed class InventoryAffix { public string id; public double value; public int tier; }
 [Serializable] public sealed class InventoryCrystal { public string id; public int star,enh; public double q; }
 // Original source names and double IDs are retained; ownership uses reference identity.
 [Serializable] public sealed class InventoryItem {
  public double id; public string slot,name,emoji,wtype,btype,brType,_implicitStat,_implicitKo,legendarySpecial,uniqueSpecial;
  public int el,rarity,tier,itemLv,reqLv,enh,socketCount; public string anc; public bool unique; public double ancPow;
  public int _gx=-1,_gy=-1; public bool fav,junk;
  public double atk,spd,wStCost,wArcW,wRange,wStagger,bonusRange,shieldWt,def,bonusSt,stagger,bonusHp,chargeDist,charge,chargeW,bonusChargeDist,beamDmg,bowSpd,bowStCost,bowRange,bowProjSpd,bowPierce,potCd,eDef,bonusShield,bonusMp,splashR;
  public double bStr,bDex,bInt,bLck,critRate,critDmg,atkSpd,dmgBonus,chargeAoE,chargeCharge,splashMul,magicPen,stRegen,mpRegen,_implicitVal;
  // D01 world drops (mkItem): legendarySpecial/uniqueSpecial hold the web {stat} name (the web also sets item[stat]=val, read here via legendaryVal/uniqueVal).
  public string uniqueArt,legendaryKo,uniqueKo,uniqueSecs; public double bGrit,antiRevive,legendaryVal,uniqueVal,uniqueDisp;
  public InventoryAffix[] affixes; public InventoryCrystal[] crystals; public double[] socketQ; public InventoryElement[] elements;
 }
 [Serializable] public sealed class InventorySeedData { public InventoryItem[] equipped,bag; }
 [Serializable] public sealed class InventoryStats {
  public int PlayerMaxHp,PlayerBaseAttack;
  public double PlayerMaxStamina,PlayerMaxMana,PlayerMaxShield,PlayerSpeed,PlayerHpRegen,PlayerStaminaRegen,PlayerManaRegen,PlayerPhysicalDefense,PlayerEnergyDefense,PlayerCriticalChance,PlayerCriticalMultiplier,AttackSpeedMultiplier,DamageMultiplier,AccessoryDamageBonus,AccessoryDamageSum,DropBonus,StrengthFlat,WeaponAttack,WeaponSpeed,WeaponRange,WeaponArc;
  // Kept separate from DEF, as in the source; parent combat adapter may admit these separately.
  public double PhysicalDamageReduction,ElementResistance,StatusResistance;
  // B08: web _eqAffix(antiRevive / reviveOnce / revivePow + _iRevPow*.01 / reviveCd) feed the revive rules and the stat panel rows.
  public double AntiRevive,ReviveOnce,RevivePow,ReviveCd;
  // B05: web STATS.dex-side total (level bonus + equipment bDex) that bowRef() and the auto crossbow read.
  public double Dex;
  public void ClampResources(PlayerState p) { if(p==null)throw new ArgumentNullException(nameof(p));p.Hp=Math.Min(p.Hp,(float)PlayerMaxHp);p.Stamina=Math.Min(p.Stamina,(float)PlayerMaxStamina);p.Mana=Math.Min(p.Mana,(float)PlayerMaxMana);p.Shield=Math.Min(p.Shield,(float)PlayerMaxShield); }
 }
}
