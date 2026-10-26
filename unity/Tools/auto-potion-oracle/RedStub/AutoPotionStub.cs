using System;
namespace Exoduser.UnityPort.Core
{
    // RED run only: the production API does not exist yet, so every check must fail against this empty shape.
    public sealed class AutoPotionState { public int PotLv; public double Cooldown; public int PotionsUsed; public double BeltBuffTicks; }
    public struct AutoPotionInput { public double Hp, MaxHp; public int Materials; public bool ParryLessonActive; public double PotionPower, GlovePotCd, BeltPotCd, RegenLevel; public bool LegendBeltBuff; }
    public struct AutoPotionFeedback { public string Text, Color; public int Ttl; public double DY; }
    public struct AutoPotionResult { public bool Used; public int Heal; public double Hp; public int Materials; public AutoPotionFeedback[] Feedback; }
    public enum DropAnchor { Player, Source }
    public struct DropText { public string Text, Color; public int Ttl; public DropAnchor Anchor; public double DX, DY; }
    public struct DropResult { public int Malice, Draws; public DropText[] Texts; }
    public static class AutoPotion
    {
        public static int PotHeal(int lv) => 0;
        public static int HealAmount(int lv, double power) => 0;
        public static double CooldownFrames(double g, double b, double r) => 0;
        public static AutoPotionResult Tick(AutoPotionState s, AutoPotionInput i, double sp) => new AutoPotionResult { Hp = i.Hp, Materials = i.Materials, Feedback = new AutoPotionFeedback[0] };
        public static int MalCost(double v) => 0;
        public static int ForgeCost(int lv) => 0;
        public static int ForgeLevelGate(int lv) => 0;
        public static bool ForgeMaxed(int lv) => false;
        public static void ForgeHeal(int lv, out int c, out int n) { c = 0; n = 0; }
        public static bool ForgeCanSelect(int lv, int p) => false;
        public static int ForgeEnhance(AutoPotionState s, ref int m, int c, bool r) => 0;
        public static DropResult KillDrop(bool b, Func<double> r) => new DropResult { Texts = new DropText[0] };
        public static DropResult ChestDrop(int stage) => new DropResult { Texts = new DropText[0] };
        public static DropResult MediumChestDrop(int t, Func<double> r) => new DropResult { Texts = new DropText[0] };
        public static DropResult BreakablePotionDrop() => new DropResult { Texts = new DropText[0] };
    }
}
