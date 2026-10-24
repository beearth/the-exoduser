using System;
using System.Globalization;

namespace Exoduser.UnityPort.Core
{
    // A read-only projection of the admitted player's existing resources.
    // The web updateHUD writer truncates maxima; this adapter never writes state.
    public sealed class HudValues
    {
        public bool HpValid { get; private set; }
        public bool ManaValid { get; private set; }
        public bool StaminaValid { get; private set; }
        public bool ExperienceValid { get; private set; }
        public double HpRatio { get; private set; }
        public double HpTranslatePercent { get; private set; }
        public double ManaRatio { get; private set; }
        public double ManaTranslatePercent { get; private set; }
        public double StaminaRatio { get; private set; }
        public double StaminaTranslatePercent { get; private set; }
        public double ShieldRatio { get; private set; }
        public double ShieldAlpha { get; private set; }
        public double ExperienceRatio { get; private set; }
        public string HpCurrentText { get; private set; }
        public string HpMaximumText { get; private set; }
        public string ManaCurrentText { get; private set; }
        public string ManaMaximumText { get; private set; }
        public string StaminaCurrentText { get; private set; }
        public string StaminaMaximumText { get; private set; }
        public string ExperienceText { get; private set; }
        // Original DOM order: hpEyeL, hpEyeR, mpEyeL, mpEyeR.
        public bool[] PoiseEyes { get; private set; }

        static bool Finite(double value) { return !double.IsNaN(value) && !double.IsInfinity(value); }
        static double ClampRatio(double value) { return Math.Max(0, Math.Min(1, value)); }
        static string Integer(double value) { return Math.Truncate(value).ToString("0", CultureInfo.InvariantCulture); }
        static string Readable(int value) { return Math.Max(0, value).ToString("N0", CultureInfo.GetCultureInfo("en-US")); }

        public static HudValues From(PlayerState player)
        {
            if (player == null) throw new ArgumentNullException(nameof(player));
            double hpMax = Math.Truncate(player.MaxHp), manaMax = Math.Truncate(player.MaxMana);
            bool hpValid = Finite(player.Hp) && Finite(hpMax) && hpMax > 0;
            bool manaValid = Finite(player.Mana) && Finite(manaMax) && manaMax > 0;
            bool staminaValid = Finite(player.Stamina) && Finite(player.MaxStamina) && player.MaxStamina > 0;
            double hpRatio = hpValid ? ClampRatio(Math.Truncate(player.Hp) / hpMax) : 0;
            double manaRatio = manaValid ? ClampRatio(Math.Truncate(player.Mana) / manaMax) : 0;
            double staminaRatio = staminaValid ? ClampRatio((double)player.Stamina / player.MaxStamina) : 0;
            bool shieldValid = Finite(player.Shield) && Finite(player.MaxShield) && player.MaxShield > 0;
            double rawShieldRatio = shieldValid ? (double)player.Shield / player.MaxShield : 0;
            double poise = Finite(player.Poise) && player.State != "pStun" ? player.Poise : 0;
            var eyes = new bool[4];
            for (int index = 0; index < eyes.Length; index++) eyes[index] = index >= 4 - poise;
            bool experienceValid = player.MaxExperience > 0;
            return new HudValues
            {
                HpValid = hpValid, ManaValid = manaValid, StaminaValid = staminaValid, ExperienceValid = experienceValid,
                HpRatio = hpRatio,
                HpTranslatePercent = hpValid ? Math.Round(10 + (100 - hpRatio * 100) * .87, 2, MidpointRounding.AwayFromZero) : 100,
                ManaRatio = manaRatio, ManaTranslatePercent = (1 - manaRatio) * 100,
                StaminaRatio = staminaRatio, StaminaTranslatePercent = (1 - staminaRatio) * 100,
                ShieldRatio = ClampRatio(rawShieldRatio), ShieldAlpha = shieldValid ? Math.Max(.1, rawShieldRatio) : 0,
                ExperienceRatio = experienceValid ? (double)player.Experience / player.MaxExperience : 0,
                HpCurrentText = hpValid ? Integer(player.Hp) : "", HpMaximumText = hpValid ? "/ " + Integer(hpMax) : "",
                ManaCurrentText = manaValid ? Integer(player.Mana) : "", ManaMaximumText = manaValid ? "/" + Integer(manaMax) : "",
                StaminaCurrentText = staminaValid ? Integer(player.Stamina) : "", StaminaMaximumText = staminaValid ? "/" + Integer(player.MaxStamina) : "",
                ExperienceText = experienceValid ? Readable(player.Experience) + " / " + Readable(player.MaxExperience) : "",
                PoiseEyes = eyes
            };
        }
    }
}
