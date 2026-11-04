using UnityEngine;

namespace Exoduser.UnityPort.MoodLab
{
    public sealed class MoodLabPreset
    {
        public readonly char Id;
        public readonly string Name;
        public readonly float Key, Shadow, Ambient, FogStart, FogEnd, Exposure, Contrast, Saturation;
        public readonly Color KeyColor, AmbientColor, FogColor, Filter;

        public MoodLabPreset(char id, string name, float key, Color keyColor, float shadow,
            float ambient, Color ambientColor, float fogStart, float fogEnd, Color fogColor,
            float exposure, float contrast, float saturation, Color filter)
        {
            Id = id; Name = name; Key = key; KeyColor = keyColor; Shadow = shadow;
            Ambient = ambient; AmbientColor = ambientColor; FogStart = fogStart; FogEnd = fogEnd;
            FogColor = fogColor; Exposure = exposure; Contrast = contrast; Saturation = saturation; Filter = filter;
        }
    }

    public static class MoodLabPresets
    {
        // Source: NativeRemodel3D.Pitch/DistU (ForestA2), Resources/Data/remodel_camera.json FOV.
        // Deliberately do not use the non-A2 JSON pitch 48.7014126 / distance 14.
        public const float Pitch = 34f, Distance = 16.5f, FieldOfView = 46.9453f;
        public const float ProbeHeight = 1.61f;

        // SINGLE tuning table: provisional until CX1 exists. Values are authored experiments, NOT Unity recommendations.
        // Local baselines at 75add6ff4:
        // NativeGame.A2Field.cs: directional 3.2, (.85,.90,1), shadow .55, exposure .55, contrast 16.
        // NativeGame.A2Forest.cs: legacy directional 2.4, (1,.96,.90), shadow .65;
        // A2Ambient sky (.26,.28,.30). Flat ambient below deliberately preserves an unshadowed readability floor.
        // NativeGame.HellLighting.cs: A2 Linear fog 19..62u; exposure .25, contrast 16, saturation -8.
        // Public URP API and property meanings (web consulted 2026-11-05):
        // https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.ColorAdjustments.html
        // https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RenderSettings-fogEndDistance.html
        // URP colorFilter multiplies color; contrast/saturation are percentages. Exposure uses the package's postExposure control.
        // FogEnd is complete linear fog in camera eye-depth, NOT player-to-enemy distance.
        // Keep fog transmission >=83% at the 12u far probe (eye-depth center about 26u).
        // Columns: id/name, key/color, shadow, ambient multiplier/color, fog start/end/color, exposure/contrast/saturation/filter.
        public static readonly MoodLabPreset[] All =
        {
            new MoodLabPreset('a', "A2 cool reference", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 19f, 62f, new Color(.105f,.145f,.17f), .55f, 16f, -8f, new Color(1f,1f,1f)),
            new MoodLabPreset('b', "Moonlit blue", 2.7f, new Color(.70f,.82f,1f), .55f, 1.05f, new Color(.24f,.27f,.32f), 22f, 68f, new Color(.10f,.14f,.20f), .40f, 12f, -12f, new Color(.94f,.97f,1f)),
            new MoodLabPreset('c', "Sulfur dusk", 2.8f, new Color(1f,.90f,.67f), .50f, 1f, new Color(.29f,.28f,.23f), 24f, 72f, new Color(.18f,.19f,.115f), .35f, 14f, -10f, new Color(1f,.98f,.90f)),
            new MoodLabPreset('d', "Pale overcast", 2.4f, new Color(1f,.96f,.90f), .40f, 1.10f, new Color(.28f,.29f,.30f), 26f, 80f, new Color(.20f,.23f,.24f), .25f, 8f, -16f, new Color(.98f,1f,.98f))
        };
    }
}
