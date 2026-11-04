using System;
namespace Exoduser.UnityPort.Core {
 public sealed partial class Simulation {
  public GrowthState Growth {get;private set;}=new GrowthState();
  // Called inside ApplyEquipment before assigning maxima and clamping current resources.
  void ApplyGrowthEquipment(InventoryStats s,InventoryState inventory){
   int str=Growth.Value("str"),dex=Growth.Value("dex"),intel=Growth.Value("int"),lck=Growth.Value("lck"),grit=Growth.Grit;
   int human=Growth.Value("pHuman"),melee=Growth.Value("pMelee"),fortify=Growth.Value("pFortify");
   bool allocated=Growth.SpentSp()!=0||Growth.SpentAp()!=0;
   if(allocated){
    double hp=0;foreach(var it in inventory.Equipped)if(it!=null&&it.slot!="weapon"&&it.slot!="bow"&&it.slot!="helmet")hp+=it.bonusHp;
    // web applyStats: s.vit is ~~vitFlat only (SP vit is never read, D-U3); + maxHPFlat, lifeMaxHP and the whole _gritTotal (level + equipment + SP)
    double raw=Math.Max(100,300-20*(Config.DifficultyIndex-5))+Config.StageIndex*6+(s.EffectiveStr+str)*5+s.VitFlat*3+hp+inventory.AffixTotal("maxHPFlat")+inventory.ImplicitTotal("_iMaxHP");
    s.PlayerMaxHp=(int)(raw*(1+inventory.AffixTotal("maxHPPct")+inventory.AffixTotal("lifeMaxHP")+(inventory.ImplicitTotal("_iMaxHPPct")+inventory.ImplicitTotal("_iLifeHPPct"))*.01+melee*.03))+(int)((int)(Player.Level*.5)+s.EquipmentGrit)+grit+human*100+fortify*300;
    s.PlayerMaxMana+=intel*2+grit+human*100+Growth.Value("pVital")*50;
    s.PlayerMaxStamina+=dex*2+grit+human*100+Growth.Value("pStamina")*50;
    s.PlayerMaxShield+=intel*5;
    s.PlayerSpeed+=dex*.005*(1+inventory.SpeedBonus());
    s.PlayerHpRegen+=str*.002;s.PlayerStaminaRegen+=dex*.005;s.PlayerManaRegen+=intel*.005;
    s.PlayerStaminaRegen*=1+Growth.Value("pStamina")*.01;s.PlayerManaRegen*=1+Growth.Value("pVital")*.01;
    // ~~(_gritTotal()*.5) feeds both pDef and eDef; CalculateStats already holds the level + equipment part (D-U2)
    double g0=(int)(Player.Level*.5)+s.EquipmentGrit,gritDef=(int)((g0+grit)*.5)-(int)(g0*.5);
    s.PlayerPhysicalDefense+=gritDef+Growth.Value("pArmor")*20;s.PlayerEnergyDefense+=gritDef;
    s.PlayerCriticalChance+=lck*.025+Growth.Value("pCrit")*1.5;s.PlayerCriticalMultiplier+=lck*.002+Growth.Value("pCrit")*.08;
    s.AttackSpeedMultiplier+=dex*.0005;s.DamageMultiplier=(1+Growth.Value("pAtk")*.10+human*.05+melee*.15)*.7;
    s.DropBonus+=lck*.0015+Growth.Value("pDrop")*.08;s.StrengthFlat+=str;s.Dex+=dex;
   }
   // Existing formulas consume these input fields; their protected Q/E/dash rules are unchanged.
   PassiveAtk=Growth.Value("pAtk");PassiveMagic=Growth.Value("pMagic");PassiveMelee=melee;
   PParry=Growth.Value("pParry");PRegen=Growth.Value("pRegen");PGuard=Growth.Value("pGuard");PCharge=Growth.Value("pCharge");
   Config.PassiveDemon=Growth.Value("pDemon");Config.PassiveHuman=human;Config.ShieldStatInt=intel;Config.ShieldMRegen=Growth.Value("pMRegen");
   PassiveRageLevel=Growth.Value("pRage");PassiveMaliceLevel=Growth.Value("pMalice");
   Crossbow.PassiveAtk=Growth.Value("pAtk");Crossbow.PassiveBow=Growth.Value("pBow");Crossbow.PassiveXbow=Growth.Value("pXbow");
  }
  public bool ApplyGrowthPlan(GrowthPlan plan){if(!Growth.TryApply(plan,Player))return false;if(EquippedInventory!=null)ApplyEquipment(EquippedInventory);return true;}
  public bool ReserveGrowthPassive(string key,int amount){return Growth.Reserve(key,amount);}
  public int ProcessGrowthQueue(){int n=Growth.ProcessQueue(Player);if(n>0&&EquippedInventory!=null)ApplyEquipment(EquippedInventory);return n;}
 }
}
