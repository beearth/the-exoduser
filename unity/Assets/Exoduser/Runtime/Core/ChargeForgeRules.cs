using System;
using System.Collections.Generic;
using System.Linq;

namespace Exoduser.UnityPort.Core.Skills
{
    public sealed class ChargeForgeOrb
    {
        public string Id, Badge = "";
        public int Priority;
        public bool Dim, Sealed, Host;
    }
    public sealed class ChargeForgeModel
    {
        public string Host;
        public ChargeForgeOrb[] Orbs;
    }
    // 비합체 사슬 제단. 원문 forgeHost/forgeModel/orbItems의 후보·데모·순서 규칙이다.
    public static class ChargeForgeRules
    {
        public static readonly string[] Materials = { "magicBlink", "chainAssault", "chainSlam", "chainSlash", "giantSlam" };
        public static ChargeForgeModel Build(int chargeBoost, string active, bool demo, int[] levels)
        {
            if (levels == null || levels.Length != 5) throw new ArgumentException("사슬 재료5종 레벨 필요");
            var items = new List<ChargeForgeOrb>();
            if (chargeBoost >= 1)
            {
                for (int i = 0; i < Materials.Length; i++)
                {
                    bool blocked = demo && i >= 2, learned = levels[i] >= 1;
                    items.Add(new ChargeForgeOrb { Id = Materials[i], Priority = blocked ? 4 : !learned ? 3 : i == 0 ? 0 : 1,
                        Dim = blocked || !learned, Badge = blocked ? "정식판" : !learned ? "습득 필요" : i == 0 ? "" : "추가 재료" });
                }
            }
            items.Add(new ChargeForgeOrb { Id = "charge", Priority = active == "charge" ? 10 : 12 });
            if (chargeBoost < 1) items.Add(new ChargeForgeOrb { Id = "magicBlink", Priority = active == "magicBlink" ? 10 : levels[0] >= 1 ? 11 : 12, Dim = levels[0] < 1 });
            // 원문 Map 삽입 순서를 동일 우선순위 사이에 보존한다.
            return new ChargeForgeModel { Host = chargeBoost >= 1 ? "chargeBoost" : active, Orbs = items.OrderBy(x => x.Priority).ToArray() };
        }
        // 1920×1080 디자인 공간의 실제 원문 orbSlots/예약영역 계산. 위치는 제단 로컬 좌표다.
        public static double[] Position(int index, int count)
        {
            if (count != 2 && count != 6 || index < 0 || index >= count) throw new ArgumentOutOfRangeException("사슬 제단 구슬2/6개 범위");
            double[] x = { 253.4, 880.6, 253.4, 880.6, 410.2, 723.8 };
            double[] y = { 377.2528, 377.2528, 196.1328, 196.1328, 105.5728, 105.5728 };
            return new[] { x[index], y[index] };
        }
    }
}
