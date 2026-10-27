using System;
using System.Collections.Generic;
using System.Globalization;
using System.Numerics;
using Exoduser.UnityPort.Core.Combat;

#pragma warning disable CS0219 // base-literal locals that only exist to keep the web's evaluation order readable
namespace Exoduser.UnityPort.Core
{
    // Port of mkItem (game.html 15895-16170) and rollAffixes (15132). Field values AND the number/order of Math.random() calls equal the web:
    // the web builds the `base` literal for EVERY slot (so every slot's bonus rolls consume the random stream), then the ring/necklace
    // affix pre-pick that rollAffixes later overwrites; all of that is replayed here. Tables come from the generated DropTablesData.
    // Known web quirk kept: gloves/belt potCd index [rarity] is undefined for unique (5) -> NaN.
    public static class ItemFactory
    {
        // Number.prototype.toFixed: exact decimal expansion of the double, a tie rounds away from zero (the larger n). string.Format("F") rounds ties to even.
        public static string ToFixed(double v, int digits)
        {
            if (double.IsNaN(v)) return "NaN";
            if (double.IsInfinity(v)) return v > 0 ? "Infinity" : "-Infinity";
            long bits = BitConverter.DoubleToInt64Bits(v); bool neg = bits < 0;
            int exp = (int)((bits >> 52) & 0x7FF); long mant = bits & 0xFFFFFFFFFFFFFL;
            if (exp == 0) exp++; else mant |= 1L << 52;
            exp -= 1075; // |v| = mant * 2^exp
            BigInteger scaled = new BigInteger(mant) * BigInteger.Pow(10, digits), q;
            if (exp >= 0) q = scaled << exp;
            else { BigInteger den = BigInteger.One << -exp, rem; q = BigInteger.DivRem(scaled, den, out rem); if (rem * 2 >= den) q += 1; }
            string d = q.ToString(CultureInfo.InvariantCulture);
            if (digits > 0) { if (d.Length <= digits) d = new string('0', digits - d.Length + 1) + d; d = d.Substring(0, d.Length - digits) + "." + d.Substring(d.Length - digits); }
            return (neg && q != 0 ? "-" : "") + d;
        }
        public static double Fixed(double v, int digits)
        {
            if (double.IsNaN(v) || double.IsInfinity(v)) return v;
            return double.Parse(ToFixed(v, digits), CultureInfo.InvariantCulture);
        }

        static readonly double[] AtkFloor = { 0, .05, .15, .25, .40, .50 };
        static readonly double[] GlovePotCd = { .05, .10, .15, .20, .30 };
        static readonly double[] BeltPotCd = { .03, .06, .10, .15, .22 };
        static readonly string[] RingAffixPool = { "fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "maxSTFlat", "maxMPFlat", "eDefFlat", "lckFlatR", "gritFlatR" };
        static readonly string[] NeckAffixPool = { "fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "allRes", "maxSTFlat", "maxMPFlat", "eDefFlat", "lckFlatN", "gritFlatN", "mpCostRed", "expBonus" };
        static readonly int[] ExtraElements = { 1, 2, 3, 4, 5 };

        // ~~(tier*50+10+Math.random()*40): the bonusHp/St/Shield/Mp roll of the web base literal
        static double Bonus(int tier, Func<double> rnd) { return Js.Int(tier * 50 + 10 + rnd() * 40); }
        static double AntiRevive(Func<double> rnd) { return Fixed(0.01 + 0.19 * Math.Pow(rnd(), 3), 2); }
        static int Idx(Func<double> rnd, int n) { return Js.Int(rnd() * n); }

        static AffixPoolEntry FindAffix(string id)
        {
            foreach (var a in DropTablesData.AffixPool) if (a.Id == id) return a;
            return null;
        }

        static WeaponTypeDef TypeOf(WeaponTypeDef[] defs, string key)
        {
            foreach (var d in defs) if (d.Key == key) return d;
            return null;
        }

        // nowMs is the Date.now() the web adds to the id; the id also consumes one random.
        public static InventoryItem MkItem(string slot, int tier, int el, int rarity, string wtype, int playerLevel, Func<double> rnd, double nowMs, bool demoMode = false)
        {
            if (slot == "headband2") { var hb = MkItem("headband", tier, el, rarity, wtype, playerLevel, rnd, nowMs, demoMode); hb.slot = slot; return hb; }
            if (slot == "ossuary") throw new ArgumentException("The ossuary is a fixed unique, never rolled");
            double rm = DropTablesData.RarityMul[rarity];
            int pLv = playerLevel > 0 ? playerLevel : 1;
            double atkMax = Js.Int((200 + tier * 200 + pLv) * 0.25);
            double atkFloor = rarity >= 0 && rarity < AtkFloor.Length ? AtkFloor[rarity] : 0;
            double atkRoll = Math.Max(1, Js.Int(atkMax * (atkFloor + (1 - atkFloor) * Math.Pow(rnd(), 2))));

            // ---- the web `base` literal, evaluated in source order for every slot ----
            double wAnti = AntiRevive(rnd);                                                             // weapon
            double shBonusHp = Bonus(tier, rnd), shBonusSt = Bonus(tier, rnd), shAnti = AntiRevive(rnd); // shield
            double boBonusSt = Bonus(tier, rnd), boBonusHp = Bonus(tier, rnd);                            // boots
            double arBonusSt = Bonus(tier, rnd), arBonusHp = Bonus(tier, rnd);                            // armor
            double bowAnti = AntiRevive(rnd);                                                           // bow
            double glBonusHp = Bonus(tier, rnd), glBonusSt = Bonus(tier, rnd);                            // gloves
            double paBonusSt = Bonus(tier, rnd), paBonusHp = Bonus(tier, rnd);                            // pants
            double caBonusHp = Bonus(tier, rnd), caBonusSt = Bonus(tier, rnd);                            // cape
            double beBonusShield = Bonus(tier, rnd), beBonusMp = Bonus(tier, rnd);                       // belt
            double neBonusShield = Bonus(tier, rnd), neBonusMp = Bonus(tier, rnd);                       // necklace
            double r1BonusShield = Bonus(tier, rnd), r1BonusMp = Bonus(tier, rnd);                       // ring1
            double r2BonusShield = Bonus(tier, rnd), r2BonusMp = Bonus(tier, rnd);                       // ring2
            double brBonusShield = Bonus(tier, rnd), brBonusMp = Bonus(tier, rnd);                       // bracelet
            double hbBonusShield = Bonus(tier, rnd), hbBonusMp = Bonus(tier, rnd);                       // headband
            double osBonusMp = Bonus(tier, rnd);                                                         // ossuary

            // per-slot base values actually used (the web reads base[slot])
            double bDef = 0, bEDef = 0, bSpd = 0, bStagger = 0, bShieldWt = 0, bCharge = 0, bChargeDist = 0, bChargeW = 0, bBeam = 0, bAtk = 0;
            double bBonusHp = 0, bBonusSt = 0, bBonusShield = 0, bBonusMp = 0, bDmgBonus = 0, bCritRate = 0, bMpRegen = 0;
            bool hasSpd = false;
            double t20 = 20 + tier * 20;
            switch (slot)
            {
                case "weapon": bAtk = atkRoll; bSpd = 1; hasSpd = true; break;
                case "shield": bDef = t20; bStagger = 15 + tier * 8; bShieldWt = 10 - tier; bBonusHp = shBonusHp; bBonusSt = shBonusSt; break;
                case "boots": bDef = t20; bSpd = tier * .08; hasSpd = true; bBonusSt = boBonusSt; bChargeDist = 14 + tier * 3; bBonusHp = boBonusHp; break;
                case "armor": bDef = t20; bCharge = 8 + tier * 5; bChargeDist = 22 + tier * 4; bChargeW = 12 + tier * 5; bBonusSt = arBonusSt; bBonusHp = arBonusHp; break;
                case "helmet": bAtk = atkRoll; bBeam = 1.5 + tier * 1.2; bDef = t20; break;
                case "bow": bAtk = atkRoll; bSpd = 1; hasSpd = true; break;
                case "gloves": bDef = t20; bSpd = tier * .04; hasSpd = true; bBonusHp = glBonusHp; bBonusSt = glBonusSt; break;
                case "pants": bDef = t20; bBonusSt = paBonusSt; bBonusHp = paBonusHp; break;
                case "cape": bDef = t20; bSpd = tier * .03; hasSpd = true; bBonusHp = caBonusHp; bBonusSt = caBonusSt; break;
                case "belt": bEDef = t20; bDmgBonus = 10 + tier * 10; bBonusSt = 4 + tier * 3; bBonusShield = beBonusShield; bBonusMp = beBonusMp; break;
                case "necklace": bEDef = t20; bCritRate = 10; bDmgBonus = 20 + tier * 20; bBonusShield = neBonusShield; bBonusMp = neBonusMp; break;
                case "ring1": bEDef = t20; bCritRate = 5; bDmgBonus = 10 + tier * 10; bBonusShield = r1BonusShield; bBonusMp = r1BonusMp; break;
                case "ring2": bEDef = t20; bCritRate = 5; bDmgBonus = 10 + tier * 10; bBonusShield = r2BonusShield; bBonusMp = r2BonusMp; break;
                case "bracelet": bEDef = t20; bDmgBonus = 10 + tier * 10; bBonusShield = brBonusShield; bBonusMp = brBonusMp; break;
                case "headband": bEDef = t20; bDmgBonus = 10 + tier * 10; bMpRegen = (1 + tier * 1) * 2; bBonusShield = hbBonusShield; bBonusMp = hbBonusMp; break;
                default: throw new ArgumentException("Unknown drop slot " + slot);
            }
            if (slot == "weapon" || slot == "shield") el = 0;

            // item literal: id is Date.now()+Math.random()
            var item = new InventoryItem { id = nowMs + rnd(), slot = slot, el = el, rarity = rarity, tier = tier };
            int nameTier = Math.Min(tier, 4);
            if (slot == "weapon" || slot == "bow") item.name = "";
            else
            {
                string key = slot == "ring2" ? "ring1" : slot;
                string[][] byEl; item.name = "";
                if (DropTablesData.Names.TryGetValue(key, out byEl) && el >= 0 && el < byEl.Length) item.name = byEl[el][nameTier];
                else if (DropTablesData.Names.ContainsKey(key)) throw new InvalidOperationException("No name row for element " + el); // web would throw too (names[slot][el][..] on undefined)
            }
            item.emoji = DropTablesData.SlotEmoji[Array.IndexOf(DropTablesData.SlotNames, slot)];

            if (slot == "weapon")
            {
                string wt = wtype ?? DropTablesData.WeaponTypes[Idx(rnd, DropTablesData.WeaponTypes.Length)].Key;
                var wd = TypeOf(DropTablesData.WeaponTypes, wt);
                item.wtype = wt;
                var mod = DropTablesData.WeaponMod[el >= 0 && el < DropTablesData.WeaponMod.Length ? el : 0];
                item.name = mod[nameTier] + " " + wd.Name;
                item.emoji = wd.Emoji;
                item.atk = Js.Int(atkRoll * wd.AtkMul);
                item.spd = Fixed(wd.SpdMul * rm, 2);
                item.wStCost = Js.Int(wd.StCost * (2 - rm * .3));
                item.wArcW = Fixed(wd.ArcW, 2);
                item.wRange = Js.Int(wd.Range * (0.95 + rnd() * .1));
                item.wStagger = Js.Int(wd.Stagger * rm);
                item.bonusRange = Math.Min(3, Js.Int((1 + tier * .4 + rarity * .5) * (0.8 + rnd() * .4)));
            }
            if (slot == "bow")
            {
                string bt = wtype ?? DropTablesData.BowTypes[Idx(rnd, DropTablesData.BowTypes.Length)].Key;
                var bd = TypeOf(DropTablesData.BowTypes, bt);
                if (bd == null) return item;
                item.btype = bt;
                string[][] bn;
                item.name = DropTablesData.BowNames.TryGetValue(bt, out bn) && el >= 0 && el < bn.Length ? bn[el][nameTier] : (bd.Name ?? "석궁");
                item.emoji = bd.Emoji;
                item.atk = Js.Int(atkRoll * bd.AtkMul);
                item.bowSpd = Fixed(bd.SpdMul * rm, 2);
                item.bowStCost = Js.Int(bd.StCost * (2 - rm * .3));
                item.bowRange = Js.Int(bd.Range * (0.95 + rnd() * .1));
                item.bowProjSpd = bd.ProjSpd;
                item.bonusRange = Math.Min(3, Js.Int((1 + tier * .4 + rarity * .5) * (0.8 + rnd() * .4)));
                item.bowPierce = Fixed((0.02 + tier * 0.03 + rarity * 0.04) * (0.8 + rnd() * 0.4), 2);
            }
            if (slot == "shield")
            {
                item.bonusRange = Math.Min(3, Js.Int((1 + tier * .4 + rarity * .5) * (0.8 + rnd() * .4)));
                item.shieldWt = Math.Max(1, Js.Int(bShieldWt * (2 - rm * .3)));
            }
            if (slot != "weapon" && slot != "bow" && bAtk != 0) item.atk = slot == "helmet" ? bAtk : Js.Int(bAtk * rm * (0.9 + rnd() * .2));
            if (bDef != 0) item.def = Js.Int(bDef * rm * (0.9 + rnd() * .2));
            if (bEDef != 0) item.eDef = Js.Int(bEDef * rm * (0.9 + rnd() * .2));
            if (slot != "weapon" && slot != "bow" && hasSpd) item.spd = Fixed(bSpd * rm, 2);
            if (bBonusSt != 0) item.bonusSt = Js.Int(bBonusSt * rm * (0.9 + rnd() * .2));
            if (bCharge != 0) item.charge = Js.Int(bCharge * rm * (0.9 + rnd() * .2));
            if (bChargeDist != 0) item.chargeDist = Js.Int(bChargeDist * rm);
            if (bChargeW != 0) item.chargeW = Js.Int(bChargeW * rm * (0.9 + rnd() * .2));
            if (slot == "armor")
            {
                item.bonusRange = Math.Min(3, Js.Int((1 + tier * .4 + rarity * .5) * (0.8 + rnd() * .4)));
                item.bonusChargeDist = Math.Min(3, Js.Int((1 + tier * .35 + rarity * .45) * (0.8 + rnd() * .4)));
            }
            if (slot == "armor" && rarity >= 3)
            {
                double aoBase = rarity == 4 ? (40 + tier * 12) : (25 + tier * 8);
                item.chargeAoE = Js.Int(aoBase * (0.9 + rnd() * .2));
            }
            if (bStagger != 0) item.stagger = Js.Int(bStagger * rm);
            if (bBonusHp != 0) item.bonusHp = bBonusHp;
            if (bBonusShield != 0) item.bonusShield = bBonusShield;
            if (bBonusMp != 0) item.bonusMp = bBonusMp;
            if (slot == "boots" && rarity >= 1)
            {
                double ccChance = new double[] { 0, .2, .4, .7, 1 }[Math.Min(rarity, 4)];
                if (rarity > 4) ccChance = double.NaN; // [..][5] is undefined in the web: Math.random()<undefined is false
                if (rnd() < ccChance) item.chargeCharge = rarity >= 3 ? 1 + Js.Int(rnd() * 2) : 1;
            }
            if (slot == "helmet")
            {
                item.beamDmg = Fixed(bBeam * rm, 1);
                var elements = new List<InventoryElement> { new InventoryElement { el = el, dmg = Js.Int(item.beamDmg * (8 + tier * 3)) } };
                var extraEls = new List<int>(); foreach (int e in ExtraElements) if (e != el) extraEls.Add(e);
                int extraCount = rarity >= 4 ? 3 : rarity >= 3 ? 2 : rarity >= 2 ? 1 : 0;
                var used = new HashSet<int> { el };
                for (int i = 0; i < extraCount; i++)
                {
                    var pool = extraEls.FindAll(e => !used.Contains(e)); if (pool.Count == 0) break;
                    int ee = pool[Js.Int(rnd() * pool.Count)]; used.Add(ee);
                    elements.Add(new InventoryElement { el = ee, dmg = Js.Int(item.beamDmg * (4 + tier * 2) * (0.7 + rnd() * .3)) });
                }
                item.elements = elements.ToArray();
                if (rarity >= 4 && elements.Count >= 3) item.name = "혼돈의 왕관";
                if (rarity >= 4 && elements.Count >= 4) item.name = "전지전능의 왕관";
                if (rarity >= 1) item.splashR = Math.Min(10, Js.Int((10 + tier * 6 + rarity * 8) * (0.9 + rnd() * .2)));
                if (rarity >= 2) item.splashMul = Fixed((0.15 + rarity * 0.08 + tier * 0.03) * (0.9 + rnd() * .2), 2);
                if (rarity >= 3) item.magicPen = rarity >= 4 ? (2 + Js.Int(tier / 2.0)) : 1;
                item.bonusRange = Math.Min(5, Js.Int((1 + tier * .6 + rarity * .8) * (0.8 + rnd() * .4)));
            }
            if (slot == "gloves")
            {
                item.potCd = Fixed((rarity < GlovePotCd.Length ? GlovePotCd[rarity] : double.NaN) * (0.9 + rnd() * .2), 3);
                if (rarity >= 1) item.atkSpd = Fixed((0.02 + rarity * 0.015 + tier * 0.005) * (0.9 + rnd() * .2), 3);
            }
            if (slot == "pants") item.bonusHp = item.bonusHp + Js.Int((5 + tier * 4 + rarity * 6) * (0.9 + rnd() * .2));
            if (slot == "belt")
            {
                item.potCd = Fixed((rarity < BeltPotCd.Length ? BeltPotCd[rarity] : double.NaN) * (0.9 + rnd() * .2), 3);
                item.bonusHp = item.bonusHp + Js.Int((3 + tier * 2 + rarity * 4) * (0.9 + rnd() * .2));
            }
            // ring/necklace pre-pick: the web writes item.affixes here and rollAffixes overwrites it below, but the draws still happen
            if (slot == "ring1" || slot == "ring2") PrePick(RingAffixPool, rnd);
            if (slot == "necklace") PrePick(NeckAffixPool, rnd);

            bool isWeaponPart = slot == "weapon" || slot == "bow" || slot == "helmet";
            bool isAccess = slot == "belt" || slot == "bracelet" || slot == "ring1" || slot == "ring2" || slot == "necklace" || slot == "headband" || slot == "ossuary";
            if (rarity >= 1 && !isWeaponPart)
            {
                if (isAccess)
                {
                    item.bLck = StatValue(tier, rarity, rnd);
                    item.bGrit = StatValue(tier, rarity, rnd);
                    int extra = Idx(rnd, 3);
                    double v = StatValue(tier, rarity, rnd);
                    if (extra == 0) item.bStr = v; else if (extra == 1) item.bDex = v; else item.bInt = v;
                }
                else
                {
                    var statPool = new List<int> { 0, 1, 2 };
                    int statCount = rarity >= 4 ? 3 : rarity >= 3 ? 2 : rarity >= 2 ? (rnd() < .6 ? 2 : 1) : (rnd() < .4 ? 1 : 0);
                    var picked = new List<int>();
                    for (int i = 0; i < statCount; i++)
                    {
                        var pool = statPool.FindAll(s => !picked.Contains(s)); if (pool.Count == 0) break;
                        picked.Add(pool[Js.Int(rnd() * pool.Count)]);
                    }
                    foreach (int sk in picked)
                    {
                        double sv = StatValue(tier, rarity, rnd);
                        if (sk == 0) item.bStr = sv; else if (sk == 1) item.bDex = sv; else item.bInt = sv;
                    }
                }
            }
            if (slot == "bracelet")
            {
                item.brType = rnd() < .5 ? "demon" : "life";
                string[][] br = DropTablesData.BraceletNames[item.brType];
                item.name = el >= 0 && el < br.Length ? br[el][nameTier] : (item.brType == "demon" ? "악마의 팔찌" : "생명의 팔찌");
            }
            item.affixes = RollAffixes(rarity, slot, item.brType, pLv, rnd, demoMode);
            string implKey = slot == "bracelet" ? "bracelet_" + item.brType : slot;
            ImplicitDef impl;
            if (DropTablesData.Implicit.TryGetValue(implKey, out impl))
            {
                double iv = impl.Lo + rnd() * (impl.Hi - impl.Lo);
                item._implicitStat = impl.Stat;
                item._implicitVal = Fixed(iv, 2);
                item._implicitKo = impl.Ko;
            }
            item.legendarySpecial = null;
            if (rarity >= 4)
            {
                var ls = DropTablesData.Legendary[Idx(rnd, DropTablesData.Legendary.Length)];
                item.legendarySpecial = ls.Stat; item.legendaryKo = ls.Ko; item.legendaryVal = ls.Val;
            }
            item.uniqueSpecial = null;
            if (rarity >= 5)
            {
                var us = DropTablesData.Unique[Idx(rnd, DropTablesData.Unique.Length)];
                UniqueArtDef[] arts; DropTablesData.UniqueArt.TryGetValue(UniqueArtBase(item), out arts);
                if (arts != null && arts.Length > 0) { var ua = arts[Idx(rnd, arts.Length)]; item.uniqueArt = ua.Id; item.name = ua.Ko; }
                double uv = us.Val; double ud = 0; string secs = null;
                if (us.HasRoll)
                {
                    ud = us.RollLo + Js.Int(rnd() * (us.RollHi - us.RollLo + 1));
                    uv = us.Scale != 0 ? Fixed(ud * us.Scale, 4) : ud;
                    secs = ToFixed(ud / 60, 1);
                }
                item.uniqueSpecial = us.Stat; item.uniqueKo = us.Ko; item.uniqueVal = uv; item.uniqueDisp = ud; item.uniqueSecs = secs;
            }
            int itemLv = Math.Min(900, (int)Math.Floor(pLv / 10.0) * 10);
            item.itemLv = itemLv; item.reqLv = Math.Max(0, itemLv - 10);
            item.socketCount = 0; item.crystals = new InventoryCrystal[0]; item.socketQ = new double[0];
            return item;
        }

        static double StatValue(int tier, int rarity, Func<double> rnd) { return Js.Int((4 + tier * 4 + rarity * 6) * (0.8 + rnd() * .4)); }

        static void PrePick(string[] ids, Func<double> rnd)
        {
            string a1 = ids[Idx(rnd, ids.Length)], a2 = ids[Idx(rnd, ids.Length)];
            while (a2 == a1) a2 = ids[Idx(rnd, ids.Length)];
        }

        // _uniqueArtBase: wtype, else crossbow for bows, else slot; ring/earring merge
        public static string UniqueArtBase(InventoryItem it)
        {
            string b = !string.IsNullOrEmpty(it.wtype) ? it.wtype : (it.slot == "bow" || !string.IsNullOrEmpty(it.btype)) ? "crossbow" : (it.slot ?? "");
            switch (b) { case "ring1": case "ring2": return "ring"; case "headband": case "headband2": return "earring"; default: return b; }
        }

        static readonly Dictionary<string, List<AffixPoolEntry>[]> poolCache = new Dictionary<string, List<AffixPoolEntry>[]>();
        static readonly HashSet<string> DemoBanned = new HashSet<string> { "sharpAtk", "brutalAtk", "ruinAtk", "overkilDmg", "staggerExplosion", "parryExplosion", "elemConvert" };

        public static InventoryAffix[] RollAffixes(int grade, string slot, string brType, int playerLevel, Func<double> rnd, bool demoMode)
        {
            string aSlot; if (!DropTablesData.AfSlot.TryGetValue(slot, out aSlot)) return new InventoryAffix[0];
            string ck = aSlot + (brType != null ? "_" + brType : "") + (demoMode ? "#d" : "");
            List<AffixPoolEntry>[] cc;
            if (!poolCache.TryGetValue(ck, out cc))
            {
                cc = new[] { new List<AffixPoolEntry>(), new List<AffixPoolEntry>() };
                foreach (var a in DropTablesData.AffixPool)
                {
                    if (Array.IndexOf(a.Slots, aSlot) < 0) continue;
                    if (a.BrType != null && a.BrType != brType) continue;
                    if (demoMode && DemoBanned.Contains(a.Id)) continue;
                    if (a.Type == 0) cc[0].Add(a); else cc[1].Add(a);
                }
                poolCache[ck] = cc;
            }
            int maxCount = grade >= 0 && grade < 6 ? new[] { 0, 2, 3, 5, 6, 7 }[grade] : 0;
            var result = new List<InventoryAffix>(); var usedG = new HashSet<string>();
            var order = grade % 2 == 1 ? new[] { cc[0], cc[1] } : new[] { cc[1], cc[0] };
            for (int i = 0; i < maxCount; i++)
            {
                var pool = order[i % 2];
                int baseTier = grade >= 4 ? 2 : grade >= 3 ? 1 : 0;
                int lvBonus = Js.Int((playerLevel > 0 ? playerLevel : 1) / 200.0);
                double tw = 0;
                foreach (var a in pool) if (!usedG.Contains(a.Group) && !double.IsNaN(a.Tiers[0]) && !(a.MinGrade > grade)) tw += a.Weight;
                if (tw <= 0) continue;
                double r = rnd() * tw;
                foreach (var a in pool)
                {
                    if (usedG.Contains(a.Group) || double.IsNaN(a.Tiers[0]) || a.MinGrade > grade) continue;
                    r -= a.Weight;
                    if (r > 0) continue;
                    int maxTier = Math.Min(a.Tiers.Length - 1, baseTier + lvBonus);
                    double val; int tierIdx;
                    if (a.TierW != null)
                    {
                        double twSum = 0;
                        for (int ti = 0; ti <= maxTier; ti++) twSum += TierWeight(a, ti);
                        double tr = rnd() * twSum; tierIdx = 0;
                        for (int ti = 0; ti <= maxTier; ti++) { tr -= TierWeight(a, ti); if (tr <= 0) { tierIdx = ti; break; } }
                        val = a.Tiers[tierIdx];
                    }
                    else
                    {
                        double lo = a.Tiers[0], hi = Num(a.Tiers[maxTier]);
                        double rr = a.SkewRoll != 0 ? Math.Pow(rnd(), a.SkewRoll) : rnd();
                        val = a.Unit == "cnt" || a.Unit == "val" ? lo + Js.Int(rr * (hi - lo + 1)) : Fixed(lo + (hi - lo) * rr, 4);
                        tierIdx = val >= Num(a.Tiers[Math.Min(2, maxTier)]) ? maxTier : val >= Num(a.Tiers[Math.Min(1, maxTier)]) ? Math.Min(1, maxTier) : 0;
                    }
                    result.Add(new InventoryAffix { id = a.Id, tier = tierIdx, value = val }); usedG.Add(a.Group);
                    break;
                }
            }
            return result.ToArray();
        }
        static double TierWeight(AffixPoolEntry a, int ti) { double w = ti < a.TierW.Length ? a.TierW[ti] : 0; return w == 0 || double.IsNaN(w) ? 1 : w; } // (a.tierW[ti]||1)
        static double Num(double v) { return double.IsNaN(v) ? 0 : v; } // JS null -> 0 in arithmetic
    }
}
