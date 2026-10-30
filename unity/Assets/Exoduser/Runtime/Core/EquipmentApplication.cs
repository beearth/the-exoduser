using System;
namespace Exoduser.UnityPort.Core {
    public sealed partial class Simulation {
        // Source _refreshEquipmentStats: recalculate maxima, then min(old current,new max).
        public void ApplyEquipment(InventoryState inventory){
            if(inventory==null)throw new ArgumentNullException(nameof(inventory));
            var s=inventory.CalculateStats(Player.Level,Config.StageIndex+1,Config.DifficultyIndex-5);
            Config.PlayerMaxHp=s.PlayerMaxHp;Config.PlayerMaxStamina=(float)s.PlayerMaxStamina;Config.PlayerMaxMana=(float)s.PlayerMaxMana;Config.PlayerMaxShield=(float)s.PlayerMaxShield;
            Config.PlayerBaseAttack=s.PlayerBaseAttack;Config.PlayerSpeed=(float)s.PlayerSpeed;Config.PlayerHpRegen=(float)s.PlayerHpRegen;Config.PlayerStaminaRegen=(float)s.PlayerStaminaRegen;Config.PlayerManaRegen=(float)s.PlayerManaRegen;
            Config.PlayerPhysicalDefense=(float)s.PlayerPhysicalDefense;Config.PlayerEnergyDefense=(float)s.PlayerEnergyDefense;Config.PlayerCriticalChance=s.PlayerCriticalChance;Config.PlayerCriticalMultiplier=s.PlayerCriticalMultiplier;
            Config.AttackSpeedMultiplier=(float)s.AttackSpeedMultiplier;Config.DamageMultiplier=s.DamageMultiplier;Config.AccessoryDamageBonus=s.AccessoryDamageBonus;Config.AccessoryDamageSum=s.AccessoryDamageSum;EquippedInventory=inventory;Config.DropBonus=(float)s.DropBonus;Config.ExpBonus=inventory.AffixTotal("expBonus");
            // KiSlash already adds level-derived STR; this config stores equipment STR only.
            Config.StrengthFlat=s.StrengthFlat-(int)(Player.Level*.5);
            Config.WeaponAttack=(float)s.WeaponAttack;Config.WeaponSpeed=(float)s.WeaponSpeed;Config.WeaponRange=(float)s.WeaponRange;Config.WeaponArc=(float)s.WeaponArc;
            // web enhMulAtk(wp().enh) = enh*0.25 (both the swing and meleeRef), _slotFlatAtk(wp()) (meleeRef only)
            var weapon=inventory.GetEquipped("weapon");
            Config.WeaponEnhanceAttack=(float)((weapon!=null?weapon.enh:0)*.25);
            double flatAtk=0;if(weapon!=null&&weapon.affixes!=null)foreach(var a in weapon.affixes)if(a!=null&&(a.id=="sharpAtk"||a.id=="brutalAtk"||a.id=="ruinAtk"))flatAtk+=a.value;
            Config.WeaponFlatAttack=(float)flatAtk;
            Player.MaxHp=s.PlayerMaxHp;Player.MaxStamina=(float)s.PlayerMaxStamina;Player.MaxMana=(float)s.PlayerMaxMana;Player.MaxShield=(float)s.PlayerMaxShield;
            Player.BaseAttack=s.PlayerBaseAttack;Player.Speed=(float)s.PlayerSpeed;s.ClampResources(Player);
            Config.AntiRevive=s.AntiRevive;Config.ReviveOnceAffix=s.ReviveOnce;Config.RevivePow=s.RevivePow;Config.ReviveCdAffix=s.ReviveCd; // B08
            ApplyCrossbowEquipment(inventory,s.Dex); // B05 bow slot
            ApplyAutoPotionEquipment(inventory); // web _eqAffix('potionPower'), gl().potCd, blt().potCd
        }
    }
}
