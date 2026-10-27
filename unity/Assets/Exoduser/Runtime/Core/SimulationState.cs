using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    [Serializable]
    public sealed class SimulationConfig
    {
        // This is an explicitly selected basic-weapon, unequipped source fixture.
        // It is not the game's randomly equipped default kiSlash character.
        public string Profile = "source-seed-basic-weapon";
        public string ActiveAttack = "weapon";
        public int KiSlashLevel = 1;
        public double StrengthFlat = 0;
        public float StartX, StartY;
        public int StageIndex = 0, DifficultyIndex = 5;
        public float WeaponAttack = 0, WeaponEnhanceAttack = 0;
        public float WeaponSpeed = .45f, WeaponRange = 50, WeaponArc = .95f;
        public int PlayerMaxHp = 300, PlayerBaseAttack = 15;
        public float PlayerSpeed = 2.6f, PlayerMaxStamina = 100, PlayerMaxMana = 100;
        public float PlayerMaxShield = 100, PlayerStartingShield = 0;
        public float InitialIframes = 0;
        public float PlayerHpRegen = .05f, PlayerStaminaRegen = .05f, PlayerManaRegen = .05f;
        public float PlayerPhysicalDefense = 2, PlayerCriticalChance = 0, PlayerCriticalMultiplier = 1.5f;
        public float AttackSpeedMultiplier = 1;
        public double DamageMultiplier = .7, AccessoryDamageBonus = 0;
        public float DropBonus = 1;
        public bool EnemyAiEnabled = true;
        public double ExpBonus = 0;   // web _eqAffix('expBonus') (necklace base expBonus field is not an Unity item field)
        public int LevelCap = 0;      // web _DEMO_MODE ? _DEMO_LV_CAP : none (0 = none)
    }

    [Serializable]
    public sealed class PlayerState
    {
        public float X, Y, Radius = 15, Hp, MaxHp, Stamina, MaxStamina, Mana, MaxMana;
        public float Shield, MaxShield, Speed, Facing, StateTicks, SwingProgress;
        public float KnockbackX, KnockbackY, Iframes, Poise = 4;
        public bool KiChargeActive;
        public float KiChargeTicks;
        public int Level = 1, Experience, MaxExperience = 15, StatPoints, PassivePoints;
        public string TransDate; public int TransCount; // web P._transLvDate/_transLvCount (one transcend level per local day)
        public int BaseAttack, BaseDefense = 2;
        public string State = "idle";
    }

    [Serializable]
    public sealed class EnemyState
    {
        public int Id, Etype, Hp, MaxHp, Attack, Level;
        public float X, Y, Radius, Speed, Facing, StateTicks, KnockbackX, KnockbackY;
        public float Shield, MaxShield, HitStun, HurtTicks, LastMoveX, LastMoveY, StuckTicks;
        public float Poise, MaxPoise, Stunned, MaxStunned, PoiseRegenTicks;
        public float ProjectileTicks, ProjectileChargeTicks;
        public bool Alive = true, Alerted, HasLastMove;
        public bool IsBoss; public int Elite; // web e.ib / e.elite (tier index): kill XP, combo timer
        public string State = "idle";
    }

    [Serializable]
    public sealed class LootState
    {
        // A world drop (web worldItems entry {type:'item', item, picked}); Item is the real mkItem result (D01).
        public int Id, Rarity, Tier, Element;
        public float X, Y;
        public string Slot, Kind = "equipment";
        public bool Picked;
        public InventoryItem Item;
    }
}
