using System;

namespace Exoduser.UnityPort.Core
{
    // Web auto potion (game.html: potHeal, update() auto block, _malCost, kill / chest / breakable drops, forge potion tab + _fgCraft).
    // Pure state and arithmetic, no UnityEngine; every number is checked against the original functions by Tools/auto-potion-oracle
    // (the oracle runs the original source lines in a Node VM, nothing here was copied from a hand-made expectation).
    // The manual quickslot potion was retired in the web (docs 2_8, 2026-10-10): only the auto potion that spends malice (G.mats) exists.

    /// <summary>Mutable per-run potion state (web: autoPotCd, POT_LV.hp, P._lBeltT, G._sStats.potions). Not saved by the web either (potLv is, see docs).</summary>
    public sealed class AutoPotionState
    {
        /// <summary>POT_LV.hp, 0..10 (the forge repeat can exceed 10 in the web, see ForgeEnhance).</summary>
        public int PotLv;
        /// <summary>autoPotCd in source frames.</summary>
        public double Cooldown;
        /// <summary>G._sStats.potions: shown by the stage clear panel as "물약 N회".</summary>
        public int PotionsUsed;
        /// <summary>P._lBeltT: remaining frames of the legendary belt damage buff started by a potion (damage use is not ported).</summary>
        public double BeltBuffTicks;
    }

    /// <summary>Values the web reads from globals at the moment of the auto block.</summary>
    public struct AutoPotionInput
    {
        public double Hp, MaxHp;
        public int Materials;
        /// <summary>window._parryLesson.active (parry practice blocks the potion).</summary>
        public bool ParryLessonActive;
        /// <summary>_eqAffix('potionPower') sum.</summary>
        public double PotionPower;
        /// <summary>gl().potCd / blt().potCd raw item values (capped 0.2 inside), PASSIVES.pRegen level (x0.03, capped 0.3 inside).</summary>
        public double GlovePotCd, BeltPotCd, RegenLevel;
        /// <summary>_lEq('_lBeltBuff')>0.</summary>
        public bool LegendBeltBuff;
    }

    public struct AutoPotionFeedback
    {
        public string Text, Color;
        public int Ttl;
        /// <summary>Offset from the player's y (web: P.y-25 / P.y-45).</summary>
        public double DY;
    }

    public struct AutoPotionResult
    {
        public bool Used;
        public int Heal;
        public double Hp;
        public int Materials;
        /// <summary>Feedback lines in web order (belt buff text first, then the heal text). Text has no emoji (project rule).</summary>
        public AutoPotionFeedback[] Feedback;
    }

    public enum DropAnchor { Player, Source }

    /// <summary>A floating text of a drop (web addTxt). Anchor Source = the killed enemy / chest / breakable; DX/DY are offsets from that anchor.</summary>
    public struct DropText
    {
        public string Text, Color;
        public int Ttl;
        public DropAnchor Anchor;
        public double DX, DY;
    }

    public struct DropResult
    {
        public int Malice, Draws;
        public DropText[] Texts;
    }

    public static class AutoPotion
    {
        public const int MaxLevel = 10;
        public const double CooldownBaseFrames = 420, GloveCap = .2, BeltCap = .2, RegenCap = .3, RegenPerLevel = .03;
        public const int CooldownMinFrames = 6, BeltBuffFrames = 300;
        public const double MaliceCostMul = .5;

        // web ~~x (ToInt32 truncation) for the small finite values used here
        static int Trunc(double v) => double.IsNaN(v) || double.IsInfinity(v) ? 0 : (int)Math.Truncate(v);

        /// <summary>game.html potHeal: 0강=100, 1강=150, 2강+ = 강화×100.</summary>
        public static int PotHeal(int lv) => lv <= 0 ? 100 : lv == 1 ? 150 : lv * 100;

        /// <summary>~~(potHeal('hp')*(1+_eqAffix('potionPower'))): the same expression is the trigger threshold and the healed amount.</summary>
        public static int HealAmount(int lv, double potionPower) => Trunc(PotHeal(lv) * (1 + potionPower));

        /// <summary>Math.max(6, ~~(420*(1-glove-belt-regen))) with the web caps (glove 0.2, belt 0.2, regen 0.3).</summary>
        public static double CooldownFrames(double glovePotCd, double beltPotCd, double regenLevel)
        {
            double gl = Math.Min(double.IsNaN(glovePotCd) ? 0 : glovePotCd, GloveCap);
            double blt = Math.Min(double.IsNaN(beltPotCd) ? 0 : beltPotCd, BeltCap);
            double regen = Math.Min(regenLevel * RegenPerLevel, RegenCap);
            return Math.Max(CooldownMinFrames, Trunc(CooldownBaseFrames * (1 - gl - blt - regen)));
        }

        /// <summary>The whole auto block (game.html update(), one call per frame with sp frames elapsed).</summary>
        public static AutoPotionResult Tick(AutoPotionState state, AutoPotionInput input, double sp)
        {
            if (state == null) throw new ArgumentNullException(nameof(state));
            var result = new AutoPotionResult { Hp = input.Hp, Materials = input.Materials, Feedback = new AutoPotionFeedback[0] };
            if (state.Cooldown > 0) state.Cooldown -= sp;
            int need = HealAmount(state.PotLv, input.PotionPower);
            if (input.ParryLessonActive || !(state.Cooldown <= 0) || !(input.Hp > 0) || !(input.Materials > 0) || !(input.MaxHp - input.Hp >= need)) return result;
            result.Materials = input.Materials - 1;
            state.Cooldown = CooldownFrames(input.GlovePotCd, input.BeltPotCd, input.RegenLevel);
            int heal = HealAmount(state.PotLv, input.PotionPower);
            result.Heal = heal;
            result.Hp = Math.Min(input.MaxHp, input.Hp + heal);
            result.Used = true;
            var lines = new System.Collections.Generic.List<AutoPotionFeedback>();
            if (input.LegendBeltBuff)
            {
                state.BeltBuffTicks = BeltBuffFrames;
                lines.Add(new AutoPotionFeedback { Text = "피해 증가!", Color = "#ff8844", Ttl = 35, DY = -45 });
            }
            lines.Add(new AutoPotionFeedback { Text = "악의오브 추출: +" + heal + " HP", Color = "#33ff33", Ttl = 40, DY = -25 });
            result.Feedback = lines.ToArray();
            state.PotionsUsed++;
            return result;
        }

        // ---- malice cost helper and forge potion tab ----

        /// <summary>game.html _malCost: 0 for n&lt;=0, otherwise max(1, ceil(n*0.5)).</summary>
        public static int MalCost(double v) => v <= 0 || double.IsNaN(v) ? 0 : Math.Max(1, (int)Math.Ceiling(v * MaliceCostMul));

        /// <summary>_malCost((lv+1)*5): 3, 5, 8, 10, 13, 15, 18, 20, 23, 25 (the docs still say 5..50).</summary>
        public static int ForgeCost(int lv) => MalCost((lv + 1) * 5);

        /// <summary>reqLv=(lv+1)*100.</summary>
        public static int ForgeLevelGate(int lv) => (lv + 1) * 100;

        public static bool ForgeMaxed(int lv) => lv >= MaxLevel;

        /// <summary>The "회복량 cur → next" pair of the forge card (next = potHeal at lv+1, also computed when maxed).</summary>
        public static void ForgeHeal(int lv, out int current, out int next) { current = PotHeal(lv); next = PotHeal(lv + 1); }

        /// <summary>Card click is possible only when not maxed and the player level reaches reqLv (web: !maxed&amp;&amp;lvOk).</summary>
        public static bool ForgeCanSelect(int lv, int playerLevel) => !ForgeMaxed(lv) && playerLevel >= ForgeLevelGate(lv);

        /// <summary>
        /// game.html _fgCraft: Shift/Ctrl repeats up to 10 times; before every repeat only "mats &lt; cost" is checked with the cost fixed at selection time
        /// (no max-level or player-level re-check: the web can pass level 10 this way, kept as is). Returns the number of enhancements done.
        /// </summary>
        public static int ForgeEnhance(AutoPotionState state, ref int materials, int selectedCost, bool repeat)
        {
            int count = repeat ? 10 : 1, done = 0;
            for (int i = 0; i < count; i++)
            {
                if (materials < selectedCost) break;
                state.PotLv++; materials -= selectedCost; done++;
            }
            return done;
        }

        // ---- drops (random numbers come from the caller, in the web call order) ----

        /// <summary>Normal kill drop (game.html kill block). pt=~~(draw2*3) over [hp, st, mp]; only hp pays malice (addPotion discards st/mp); boss: cnt 2 and one more draw (&lt; .5 gives +1).</summary>
        public static DropResult KillDrop(bool isBoss, Func<double> random)
        {
            if (random == null) throw new ArgumentNullException(nameof(random));
            var texts = new System.Collections.Generic.List<DropText>();
            int malice = 0, draws = 0;
            draws++;
            if (random() < 1)   // web: Math.random()<(e.ib?1:1), always true but it consumes a draw
            {
                draws++;
                int type = Trunc(random() * 3), count = isBoss ? 2 : 1;
                if (type == 0)
                {
                    malice += count;
                    texts.Add(Pickup(count));
                    texts.Add(new DropText { Text = "악의오브 추출 +" + count, Color = "#33cc66", Ttl = 30, Anchor = DropAnchor.Source, DY = -8 });
                }
            }
            if (isBoss)
            {
                draws++;
                if (random() < .5) { malice += 1; texts.Add(Pickup(1)); texts.Add(new DropText { Text = "HP물약 +1", Color = "#33ff33", Ttl = 30, Anchor = DropAnchor.Source, DY = -8 }); }
            }
            return new DropResult { Malice = malice, Draws = draws, Texts = texts.ToArray() };
        }

        /// <summary>Treasure chest: malice 5+~~(stage*2) (silent) plus addPotion('hp',2) = +2 malice with its two texts.</summary>
        public static DropResult ChestDrop(int stage)
        {
            return new DropResult { Malice = 5 + Trunc(stage * 2.0) + 2, Draws = 0, Texts = new[] { Pickup(2), new DropText { Text = "HP물약 +2", Color = "#33ff33", Ttl = 30, Anchor = DropAnchor.Source, DX = 20, DY = 10 } } };
        }

        /// <summary>Medium-or-bigger chest (_dt&gt;=1): draws once, &lt; .4 gives +1 malice. The draw is only consumed when the tier gate passes (web short-circuit).</summary>
        public static DropResult MediumChestDrop(int chestTier, Func<double> random)
        {
            if (random == null) throw new ArgumentNullException(nameof(random));
            int draws = 0;
            if (chestTier >= 1) { draws++; if (random() < .4) return new DropResult { Malice = 1, Draws = draws, Texts = new[] { Pickup(1), new DropText { Text = "HP물약 +1", Color = "#33ff33", Ttl = 25, Anchor = DropAnchor.Source, DX = 15, DY = 5 } } }; }
            return new DropResult { Malice = 0, Draws = draws, Texts = new DropText[0] };
        }

        /// <summary>Breakable with loot 'potion': addPotion('hp',1) = +1 malice.</summary>
        public static DropResult BreakablePotionDrop()
        {
            return new DropResult { Malice = 1, Draws = 0, Texts = new[] { Pickup(1), new DropText { Text = "HP물약!", Color = "#33ff33", Ttl = 40, Anchor = DropAnchor.Source, DY = -15 } } };
        }

        static DropText Pickup(int count) => new DropText { Text = "+" + count, Color = "#cc66ff", Ttl = 25, Anchor = DropAnchor.Player, DY = -20 };
    }
}
