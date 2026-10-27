using System;

namespace Exoduser.UnityPort.Core
{
    // Rage / malice state on the restricted Simulation (new partial). B03 (skill execution) calls the spend / consume API below.
    public sealed partial class Simulation
    {
        /// <summary>Web P.rage (0..RageMaximum). Not saved, not decaying.</summary>
        public double Rage;
        /// <summary>Inputs the Unity equipment / passive layers feed (0 until they exist): PASSIVES.pRage / pMalice levels, _uEq('_uRageMax'), _eqAffix('rageMaxFlat' / 'rageDmg' / 'goldBonus').</summary>
        public double PassiveRageLevel, PassiveMaliceLevel, UniqueRageMax, AffixRageMaxFlat, AffixRageDmg, AffixGoldBonus;
        /// <summary>Raised when rage changes (add / slam spend): old value, new value.</summary>
        public event Action<double, double> RageChanged;
        /// <summary>Raised on every malice gain or spend: signed delta.</summary>
        public event Action<int> MaliceChanged;

        public double RageMaximum { get { return RageMalice.RageMax(ParryLessonActive, UniqueRageMax, AffixRageMaxFlat, PassiveRageLevel); } }

        /// <summary>Reads rageMaxFlat / rageDmg / goldBonus from the equipped items (web _eqAffix = sum over equipped items).</summary>
        public void ApplyRageMaliceEquipment(InventoryState inventory)
        {
            if (inventory == null) throw new ArgumentNullException(nameof(inventory));
            double flat = 0, dmg = 0, gold = 0;
            foreach (var item in inventory.Equipped)
            {
                if (item == null || item.affixes == null) continue;
                foreach (var a in item.affixes)
                {
                    if (a == null) continue;
                    if (a.id == "rageMaxFlat") flat += a.value; else if (a.id == "rageDmg") dmg += a.value; else if (a.id == "goldBonus") gold += a.value;
                }
            }
            AffixRageMaxFlat = flat; AffixRageDmg = dmg; AffixGoldBonus = gold;
        }

        /// <summary>P.rage=Math.min(_rageMax(), P.rage+add). Returns the new rage.</summary>
        public double GainRage(double add) { return SetRage(RageMalice.Add(Rage, add, RageMaximum)); }

        /// <summary>Sword-combo / ring-kill style adds: Math.max(1,~~(max*frac)).</summary>
        public double GainRageFraction(double frac) { return SetRage(RageMalice.FractionAdd(Rage, RageMaximum, frac)); }

        /// <summary>Armor unique: the hit becomes +10 rage (the caller zeroes the damage).</summary>
        public double GainArmorRage() { return GainRage(RageMalice.ArmorRageAdd); }

        /// <summary>Rage part of the giant slam / Space rage burst: returns the damage multiplier etc. and spends the rage (ember unique keeps a remainder).</summary>
        public RageMalice.SlamResult ConsumeRageForSlam(double emberUnique = 0)
        {
            var r = RageMalice.Slam(Rage, RageMaximum, PassiveRageLevel, AffixRageDmg, emberUnique);
            if (r.Consumed > 0) SetRage(r.RageAfter);
            return r;
        }

        double SetRage(double value)
        {
            double old = Rage; Rage = value;
            if (old != value) RageChanged?.Invoke(old, value);
            return Rage;
        }

        // ---------------- malice API for B03 ----------------

        public int MaliceCost(double raw) { return RageMalice.Cost(raw); }

        /// <summary>G.mats>=_malCost(raw) (lessonFree = the giant slam inside the parry practice).</summary>
        public bool CanSpendMalice(double raw, bool lessonFree = false) { return RageMalice.CanAfford(Materials, raw, lessonFree); }

        /// <summary>Checks and pays _malCost(raw). False (nothing paid) when short; the caller shows "악의 부족! (cost)". Returns the cost paid via out.</summary>
        public bool TrySpendMalice(double raw, out int paid, bool lessonFree = false)
        {
            paid = 0;
            if (lessonFree) return true;
            int cost = RageMalice.Cost(raw);
            if (Materials < cost) return false;
            Materials -= cost; paid = cost;
            if (cost != 0) MaliceChanged?.Invoke(-cost);
            return true;
        }

        public bool TrySpendMalice(double raw) { int paid; return TrySpendMalice(raw, out paid); }

        /// <summary>Raw spends without the 50% discount (web 36512 storm fuse `G.mats=Math.max(0,G.mats-12)`, 40451 steal).</summary>
        public int SpendMaliceRaw(int amount)
        {
            int before = Materials; Materials = Math.Max(0, Materials - amount);
            int paid = before - Materials; if (paid != 0) MaliceChanged?.Invoke(-paid);
            return paid;
        }

        /// <summary>Plain gain (parry 38630, kill +4, refunds). The elite drop and pickups go through AddMalicePickup.</summary>
        public void AddMalice(int amount) { if (amount == 0) return; Materials += amount; MaliceChanged?.Invoke(amount); }

        /// <summary>Ground mat item: ~~(matVal*(1+goldBonus)*_maliceMul()).</summary>
        public int AddMalicePickup(double matVal)
        {
            int amount = RageMalice.PickupAmount(matVal, AffixGoldBonus, PassiveMaliceLevel); AddMalice(amount); return amount;
        }

        /// <summary>Elite / boss kill malice (43170-43201). Returns the total added (instant drop + extra).</summary>
        int AddEliteKillMalice(EnemyState enemy, double comboBonus)
        {
            if (!(enemy.IsBoss || enemy.Elite > 0)) return 0;
            double db = enemy.Elite > 0 ? EliteTables.Tiers[Math.Min(enemy.Elite, EliteTables.Tiers.Length - 1)].DropBonus : 0;
            int instant = RageMalice.EliteDrop(Config.StageIndex, db, AffixGoldBonus, PassiveMaliceLevel);
            int extra = RageMalice.EliteExtra(NextRandom(), comboBonus);
            AddMalice(instant + extra);
            return instant + extra;
        }
    }
}
