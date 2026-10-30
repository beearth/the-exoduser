using System;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core
{
    public sealed partial class Simulation
    {
        // dbRestore의 고정 슬롯 제거→영역 복구→학습 액티브 자동 배정. 미소유 Raw 슬롯은 덮어쓰지 않는다.
        void RepairRestoredSkillSlots(bool[] reserved)
        {
            Func<int, bool> empty = i => Skills.Slots[i] == null && !reserved[i];
            var displaced = new System.Collections.Generic.List<string>();
            for (int i = 0; i < Skills.Slots.Length; i++) if (Skills.Slots[i] == "iceOrb") Skills.Slots[i] = null;
            foreach (int i in new[] { 5, 4 })
            {
                string id = Skills.Slots[i];
                if (id != null && !(i == 5 ? id == "holyDome" : id == "giantSlam")) { displaced.Add(id); Skills.Slots[i] = null; }
            }
            for (int i = 0; i < 4; i++)
            {
                string id = Skills.Slots[i]; if (id == null || id == "spikeTrap") continue;
                Skills.Slots[i] = null;
                if (id == "holyDome" && empty(5)) Skills.Slots[5] = id;
                else if (id == "giantSlam" && empty(4)) Skills.Slots[4] = id;
            }
            foreach (string id in displaced)
            {
                if (Array.IndexOf(Skills.Slots, id) >= 0) continue;
                if (id == "holyDome" && empty(5)) { Skills.Slots[5] = id; continue; }
                if (id == "giantSlam" && empty(4)) { Skills.Slots[4] = id; continue; }
                if (id == "spikeTrap") for (int i = 0; i < 4; i++) if (empty(i)) { Skills.Slots[i] = id; break; }
            }
            if (Skills.Learned("giantSlam") && Array.IndexOf(Skills.Slots, "giantSlam") < 0 && empty(4)) Skills.Slots[4] = "giantSlam";
            if (Skills.Learned("spikeTrap") && Array.IndexOf(Skills.Slots, "spikeTrap") < 0)
                for (int i = 0; i < 4; i++) if (empty(i)) { Skills.Slots[i] = "spikeTrap"; break; }
        }
        // 진입 후 보정은 dbRestore와 별도다. 데모는 미습득 Ctrl만, 일반 캐릭터 진입은 항상 기본 얼음보주로 배정한다.
        public void ApplyLoadedStarterSkillDefaults(System.Collections.Generic.Dictionary<string, double> savedSkills, bool forceCtrl = false)
        {
            Skills.Levels["iceOrb"] = Math.Max(1, Skills.Level("iceOrb"));
            double rawLevel;
            bool savedLearned = Skills.CtSkill != null && savedSkills != null && savedSkills.TryGetValue(Skills.CtSkill, out rawLevel) && rawLevel >= 1;
            if (forceCtrl || (!Skills.Learned(Skills.CtSkill) && !savedLearned)) Skills.CtSkill = "iceOrb";
        }

        // 창의13개 의미 슬롯. 숫자 장착은 같은 스킬의 다른 숫자 슬롯을 먼저 비운다(skill-forge.js equip).
        public bool CanEquipSkill(int windowSlot, string id)
        {
            if (windowSlot == 8 && id == "charge") return true;
            if (!IsPorted(id)) return false;
            if (windowSlot == 6) return id == "kiSlash";
            if (windowSlot == 9) return id == "fireball";
            if (!Skills.Learned(id)) return false;
            if (windowSlot == 8) return id == "magicBlink";
            if (windowSlot >= 0 && windowSlot < 4) return id == "spikeTrap" || id == "iceOrb";
            if (windowSlot == 4) return id == "holyDome";
            if (windowSlot == 7) return id == "maliceSwipe";
            if (windowSlot == 11) return id == "iceOrb";
            return windowSlot == 12 && id == "giantSlam";
        }
        public bool EquipSkill(int windowSlot, string id)
        {
            if (!CanEquipSkill(windowSlot, id)) return false;
            int index = windowSlot >= 0 && windowSlot < 4 ? windowSlot : windowSlot == 4 ? 5 : windowSlot == 12 ? 4 : -1;
            if (index >= 0)
            {
                for (int i = 0; i < Skills.Slots.Length; i++) if (Skills.Slots[i] == id) Skills.Slots[i] = null;
                Skills.Slots[index] = id;
            }
            else if (windowSlot == 6) Config.ActiveAttack = "kiSlash";
            else if (windowSlot == 9) Skills.MagicSkill = id;
            else if (windowSlot == 8) Skills.ChargeSkill = id;
            else if (windowSlot == 11) { Skills.CtSkill = id; preservedLoadedCtSkill = null; }
            return true;
        }

        // 원문 _skCtx/_skLearnUp. 미이식 스킬은 기존 저장 원문으로 보존하며 여기서 실행 소유권을 넓히지 않는다.
        public int SkillLearnMalice(string id)
        {
            switch (id)
            {
                case "kiSlash": case "fireball": return 0;
                case "giantSlam": return 120;
                case "holyDome": return 90;
                case "iceOrb": return 100;
                case "chargeBoost": case "magicBlink": case "chainSlam": return 100;
                default: return 80;
            }
        }
        public bool CanLearnSkill(string id)
        {
            return IsPorted(id) && Skills.Level(id) < 1 && Player.StatPoints >= 10 && Materials >= MaliceCost(SkillLearnMalice(id));
        }
        public bool LearnSkill(string id)
        {
            if (!CanLearnSkill(id)) return false;
            int paid; if (!TrySpendMalice(SkillLearnMalice(id), out paid)) return false;
            Skills.Levels[id] = 1; Player.StatPoints -= 10;
            if (id == "magicBlink") Skills.ChargeSkill = id;
            if (id == "kiSlash") Config.KiSlashLevel = 1;
            MaliceSwipeLevel = Skills.Level("maliceSwipe"); ShieldThrowLevel = Skills.Level("shieldThrow");
            int slot = -1;
            if (Array.IndexOf(Skills.Slots, id) < 0)
            {
                if (id == "holyDome") { if (Skills.Slots[5] == null) slot = 5; }
                else if (id == "giantSlam") { if (Skills.Slots[4] == null) slot = 4; }
                else if (id == "spikeTrap" || id == "iceOrb")
                    for (int i = 0; i < 4; i++) if (Skills.Slots[i] == null) { slot = i; break; }
            }
            if (slot >= 0) Skills.Slots[slot] = id;
            return true;
        }

        public bool CanLowerSkillLevel(string id)
        {
            if (!IsPorted(id)) return false;
            if (ShieldFuse && (id == "maliceSwipe" || id == "shieldThrow"))
                return Math.Min(Math.Max(1, Skills.Level("maliceSwipe")), Math.Max(1, Skills.Level("shieldThrow"))) > 1;
            return (id == "kiSlash" ? Config.KiSlashLevel : Skills.Level(id)) > 1;
        }
        // 원문 _skLevelDown: 합체는 최저 레벨 기준으로 구성원 모두를 낮춘다.
        public bool LowerSkillLevel(string id)
        {
            if (!CanLowerSkillLevel(id)) return false;
            int current = id == "kiSlash" ? Config.KiSlashLevel : Skills.Level(id);
            if (ShieldFuse && (id == "maliceSwipe" || id == "shieldThrow"))
            {
                int minimum = Math.Min(Math.Max(1, Skills.Level("maliceSwipe")), Math.Max(1, Skills.Level("shieldThrow")));
                int target = minimum - 1;
                if (Skills.Level("maliceSwipe") >= minimum) Skills.Levels["maliceSwipe"] = target;
                if (Skills.Level("shieldThrow") >= minimum) Skills.Levels["shieldThrow"] = target;
                Player.StatPoints += target >= 9 ? 6 : 2;
            }
            else
            {
                Skills.Levels[id] = current - 1;
                if (id == "kiSlash") Config.KiSlashLevel = current - 1;
                Player.StatPoints += SkillRules.UpgradeSpCost;
            }
            MaliceSwipeLevel = Skills.Level("maliceSwipe"); ShieldThrowLevel = Skills.Level("shieldThrow");
            return true;
        }

        public int SkillResetRefund(string id)
        {
            if (!IsPorted(id)) return 0;
            if (ShieldFuse && (id == "maliceSwipe" || id == "shieldThrow"))
            {
                int minimum = Math.Min(Math.Max(1, Skills.Level("maliceSwipe")), Math.Max(1, Skills.Level("shieldThrow")));
                int refund = 0; for (int i = 1; i < minimum; i++) refund += i >= 9 ? 6 : 2;
                return refund;
            }
            int level = id == "kiSlash" ? Config.KiSlashLevel : Skills.Level(id);
            int result = level > 0 ? 10 + level - 1 : 0;
            if (id == "kiSlash" || id == "fireball" || id == "spikeTrap") result -= 10;
            return result;
        }
        // 원문 _skResetSkill. 확인 취소는 수치·슬롯·자원을 바꾸지 않는다.
        public bool ResetSkill(string id, bool confirmed)
        {
            if (!IsPorted(id)) return false;
            bool fused = ShieldFuse && (id == "maliceSwipe" || id == "shieldThrow");
            int level = id == "kiSlash" ? Config.KiSlashLevel : Skills.Level(id);
            if (fused)
            {
                int minimum = Math.Min(Math.Max(1, Skills.Level("maliceSwipe")), Math.Max(1, Skills.Level("shieldThrow")));
                if (minimum <= 1 || !confirmed) return false;
                Skills.Levels["maliceSwipe"] = Skills.Level("maliceSwipe") - minimum + 1;
                Skills.Levels["shieldThrow"] = Skills.Level("shieldThrow") - minimum + 1;
                Player.StatPoints += SkillResetRefundFromLevel(minimum);
            }
            else
            {
                bool free = id == "kiSlash" || id == "fireball" || id == "spikeTrap";
                int refund = level > 0 ? 10 + level - 1 : 0;
                if (free) refund -= 10;
                if ((free && refund <= 0) || !confirmed) return false;
                Skills.Levels[id] = free ? 1 : 0;
                if (id == "kiSlash") Config.KiSlashLevel = Skills.Level(id);
                Player.StatPoints += refund;
                for (int i = 0; i < Skills.Slots.Length; i++) if (Skills.Slots[i] == id) Skills.Slots[i] = null;
                if (Skills.UltSlot == id) Skills.UltSlot = null;
                if (Skills.CtSkill == id) { Skills.CtSkill = "ghostWalk"; preservedLoadedCtSkill = null; }
                if (Skills.ChargeSkill == id) Skills.ChargeSkill = "charge";
            }
            MaliceSwipeLevel = Skills.Level("maliceSwipe"); ShieldThrowLevel = Skills.Level("shieldThrow");
            return true;
        }
        static int SkillResetRefundFromLevel(int minimum)
        {
            int result = 0; for (int i = 1; i < minimum; i++) result += i >= 9 ? 6 : 2; return result;
        }
    }
}
