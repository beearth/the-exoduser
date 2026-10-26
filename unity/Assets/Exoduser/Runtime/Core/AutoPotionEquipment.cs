using System;

namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// Equipment side inputs of the auto potion (web: _eqAffix('potionPower') = sum of the affix value over every equipped item,
    /// gl().potCd, blt().potCd). The passive pRegen level and the legendary belt buff have no Unity system yet and stay 0 / false.
    /// </summary>
    public static class AutoPotionEquipment
    {
        public const string PotionPowerAffix = "potionPower";

        public static void Read(InventoryState inventory, out double potionPower, out double glovePotCd, out double beltPotCd)
        {
            if (inventory == null) throw new ArgumentNullException(nameof(inventory));
            potionPower = 0;
            foreach (var item in inventory.Equipped)
            {
                if (item == null || item.affixes == null) continue;
                foreach (var a in item.affixes) if (a != null && a.id == PotionPowerAffix) potionPower += a.value;
            }
            var gloves = inventory.GetEquipped("gloves");var belt = inventory.GetEquipped("belt");
            glovePotCd = gloves == null ? 0 : gloves.potCd;
            beltPotCd = belt == null ? 0 : belt.potCd;
        }
    }

    // New partial of the restricted Simulation (new file, the original Simulation.cs is untouched). The two call sites that make it run
    // (after the enemy loop in Tick, and the kill drop in KillEnemy) are the B11 patch.
    public sealed partial class Simulation
    {
        /// <summary>autoPotCd, POT_LV.hp, potions used. Not saved (the web saves only potLv).</summary>
        public readonly AutoPotionState PotionState = new AutoPotionState();
        /// <summary>Equipment / passive inputs (filled by ApplyAutoPotionEquipment; pRegen and the legendary belt have no Unity source yet).</summary>
        public double PotionPower, GlovePotCd, BeltPotCd, PotionRegenLevel;
        public bool LegendBeltBuff, ParryLessonActive;
        /// <summary>Raised when a potion was drunk. Web: SFX.potion + floating texts that the web only draws in the battle test bed (see doc).</summary>
        public event Action<AutoPotionResult> AutoPotionDrunk;
        /// <summary>Raised for a normal kill drop (malice already added). Floating texts are the web's addTxt calls, hidden by its whitelist in normal play.</summary>
        public event Action<EnemyState, DropResult> KillDropped;

        public void ApplyAutoPotionEquipment(InventoryState inventory)
        {
            AutoPotionEquipment.Read(inventory, out var power, out var glove, out var belt);
            PotionPower = power; GlovePotCd = glove; BeltPotCd = belt;
        }

        void TickAutoPotion()
        {
            var input = new AutoPotionInput
            {
                Hp = Player.Hp, MaxHp = Player.MaxHp, Materials = Materials, ParryLessonActive = ParryLessonActive, PotionPower = PotionPower,
                GlovePotCd = GlovePotCd, BeltPotCd = BeltPotCd, RegenLevel = PotionRegenLevel, LegendBeltBuff = LegendBeltBuff
            };
            var r = AutoPotion.Tick(PotionState, input, 1);
            if (!r.Used) return;
            Materials = r.Materials; Player.Hp = (float)r.Hp;
            AutoPotionDrunk?.Invoke(r);
        }

        void ApplyKillDrop(EnemyState enemy)
        {
            // Unity has no boss flag on EnemyState yet (boss kills are not ported): the normal rule (cnt 1, no extra roll) applies.
            var drop = AutoPotion.KillDrop(false, NextRandom);
            Materials += drop.Malice;
            KillDropped?.Invoke(enemy, drop);
        }
    }
}
