using System;
namespace Exoduser.UnityPort.Core {
    public sealed partial class Simulation {
        // Source _refreshEquipmentStats: recalculate maxima, then min(old current,new max).
        public void ApplyEquipment(InventoryState inventory){
            if(inventory==null)throw new ArgumentNullException(nameof(inventory));
            var s=inventory.CalculateStats(Player.Level,Config.StageIndex+1,Config.DifficultyIndex-5);
            Config.PlayerMaxHp=s.PlayerMaxHp;Config.PlayerMaxStamina=(float)s.PlayerMaxStamina;Config.PlayerMaxMana=(float)s.PlayerMaxMana;Config.PlayerMaxShield=(float)s.PlayerMaxShield;
            Config.PlayerBaseAttack=s.PlayerBaseAttack;Config.PlayerSpeed=(float)s.PlayerSpeed;Config.PlayerHpRegen=(float)s.PlayerHpRegen;Config.PlayerStaminaRegen=(float)s.PlayerStaminaRegen;Config.PlayerManaRegen=(float)s.PlayerManaRegen;
            Config.PlayerPhysicalDefense=(float)s.PlayerPhysicalDefense;Config.PlayerCriticalChance=(float)s.PlayerCriticalChance;Config.PlayerCriticalMultiplier=(float)s.PlayerCriticalMultiplier;
            Config.AttackSpeedMultiplier=(float)s.AttackSpeedMultiplier;Config.DamageMultiplier=s.DamageMultiplier;Config.AccessoryDamageBonus=s.AccessoryDamageBonus;Config.DropBonus=(float)s.DropBonus;Config.ExpBonus=inventory.AffixTotal("expBonus");
            // KiSlash already adds level-derived STR; this config stores equipment STR only.
            Config.StrengthFlat=s.StrengthFlat-(int)(Player.Level*.5);
            Config.WeaponAttack=(float)s.WeaponAttack;Config.WeaponSpeed=(float)s.WeaponSpeed;Config.WeaponRange=(float)s.WeaponRange;Config.WeaponArc=(float)s.WeaponArc;
            Player.MaxHp=s.PlayerMaxHp;Player.MaxStamina=(float)s.PlayerMaxStamina;Player.MaxMana=(float)s.PlayerMaxMana;Player.MaxShield=(float)s.PlayerMaxShield;
            Player.BaseAttack=s.PlayerBaseAttack;Player.Speed=(float)s.PlayerSpeed;s.ClampResources(Player);
            Config.AntiRevive=s.AntiRevive;Config.ReviveOnceAffix=s.ReviveOnce;Config.RevivePow=s.RevivePow;Config.ReviveCdAffix=s.ReviveCd; // B08
            ApplyAutoPotionEquipment(inventory); // web _eqAffix('potionPower'), gl().potCd, blt().potCd
        }
    }
}
