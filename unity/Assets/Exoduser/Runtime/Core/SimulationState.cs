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
        // web _slotFlatAtk(wp()): sharpAtk + brutalAtk + ruinAtk values. meleeRef (kiSlash) adds it; the plain weapon swing line in the update loop does not.
        public float WeaponFlatAttack = 0;
        public float WeaponSpeed = .45f, WeaponRange = 50, WeaponArc = .95f;
        public int PlayerMaxHp = 300, PlayerBaseAttack = 15;
        public float PlayerSpeed = 2.6f, PlayerMaxStamina = 100, PlayerMaxMana = 100;
        public float PlayerMaxShield = 100, PlayerStartingShield = 0;
        public float InitialIframes = 0;
        public float PlayerHpRegen = .05f, PlayerStaminaRegen = .05f, PlayerManaRegen = .05f;
        public float PlayerPhysicalDefense = 2, PlayerEnergyDefense = 0;   // PlayerEnergyDefense: totalEDef of hurtP (magic / parry damage), 0 until the energy-defence equipment rows feed it
        // double like the web statCrit()/statCritDmg(): a float multiplier truncates the crit damage one point low on large hits.
        public double PlayerCriticalChance = 0, PlayerCriticalMultiplier = 1.5;
        public float AttackSpeedMultiplier = 1;
        public double DamageMultiplier = .7, AccessoryDamageBonus = 0;
        public double AccessoryDamageSum = 0;   // sum of the accessory dmgBonus values (hurtE multiplies the sum by 0.01 itself)
        public float DropBonus = 1;
        public bool EnemyAiEnabled = true;
        public double ExpBonus = 0;   // web _eqAffix('expBonus') (necklace base expBonus field is not an Unity item field)
        public int LevelCap = 0;      // web _DEMO_MODE ? _DEMO_LV_CAP : none (0 = none)
        // B08 revive/shield inputs the web reads from equipment and passives. All 0 until the owning rows (passives, zones) are ported.
        public double AntiRevive = 0;     // _eqAffix('antiRevive') = Holy Power (stat panel row "신성력")
        public double ReviveOnceAffix = 0;// _eqAffix('reviveOnce')
        public double RevivePow = 0;      // _eqAffix('revivePow') + _eqImplicit('_iRevPow')*.01
        public double ReviveCdAffix = 0;  // _eqAffix('reviveCd') (negative = shorter)
        public int PassiveDemon = 0, PassiveHuman = 0; // PASSIVES.pDemon / pHuman
        public double ShieldStatInt = 0;  // STATS.int (allocated INT, shield regen formula)
        public double ShieldMRegen = 0;   // PASSIVES.pMRegen
        public bool DemoMode = false;     // _DEMO_MODE (stage-3 druid finale needs it)
        public int DemoLastStage = 0;     // _DEMO_LAST_STAGE
    }

    [Serializable]
    public sealed class PlayerState
    {
        public float X, Y, Radius = 15, Hp, MaxHp, Stamina, MaxStamina, Mana, MaxMana;
        public float Shield, MaxShield, Speed, Facing, StateTicks, SwingProgress;
        public float KnockbackX, KnockbackY, Iframes, Poise = 4;
        public int ChargeStocks = 1, MaxChargeStocks = 1; public double ChargeCd;
        public bool KiChargeActive;
        public float KiChargeTicks;
        public int Level = 1, Experience, MaxExperience = 15, StatPoints, PassivePoints;
        public string TransDate; public int TransCount; // web P._transLvDate/_transLvCount (one transcend level per local day)
        // B08: P.shieldRegenT, P._demonRevCd, die() pre-rolled revive (P._fallen*), P._reviveOnceUsed
        public float ShieldRegenTicks, DemonReviveCd;
        public bool ReviveOnceUsed, FallenCanRevive;
        public double FallenReviveChance, FallenReviveCdFrames, FallenReviveRoll;
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
        public double HomeX, HomeY; public bool HasHome;   // web e._homeX/_homeY: the spawn position (a kill counts for the region it was born in)
        public bool IsGateGuard;              // web e._isGateGuard: the Hell Gate guardian (killing it adds +10 % clear progress)
        // B08 revive / energy-shield state (web e.deaths, _revPts, _revived, _reviveTimer ...). Defaults are the web's undefined/0.
        public double Deaths, RevPts, MaxRevPts, ReviveIframes, OrigR, ReviveTimer, ReviveX, ReviveY, BossRevChance, BossRevRoll = 1, BossPhase, BossPatCd, SpawnTicks, BossReviveVfxPending;
        public bool Revived, IsGhoul, ReviveAsGhoul, ReviveChase, BossRevJudged, BossRevived, DruidLastStand, SinkDruid, FmKind, DgRevived, Corpse;
        public int BaseAttack, DruidBaseAttack; public string Col;
        public double BlinkWeak; public int BlinkWeakTicks; // u_n02 roll weak (e._blinkWeak / _blinkWeakT)
        public string State = "idle";
        [NonSerialized] public EnemySpawn Web;   // C01 wire: the web-shaped enemy the Core (mkEn / hurtE) works on
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
