using UnityEngine;

namespace Exoduser.UnityPort.MoodLab
{
    public sealed class MoodLabPreset
    {
        public readonly char Id;
        public readonly string Name;
        public readonly float Key, Shadow, Ambient, FogStart, FogEnd, Exposure, Contrast, Saturation;
        public readonly Color KeyColor, AmbientColor, FogColor, Filter;
        // Optional treatments are disabled by default, preserving the committed a reference.
        public float HeightDensity, HeightBase, HeightFalloff, HeightLaneFloor;
        public float VolumeDensity, VolumeFloor, Scatter, OpticalDepthCap;
        public float RimPower, RimStrength, Temperature, Tint, LutContribution;
        public Color RimColor = Color.black;
        public Vector3 LutScale = Vector3.one, LutCross = Vector3.zero, LutLift = Vector3.zero;

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

        // SINGLE tuning table, CTO CX1 correction at efaa481c7. No project numeric recommendation exists in CX1.
        // Reference: I:/EXODUSER-Storage/codex-takeover/moodlab/CX1_codex_urp_mood.md
        // 저작 시험값, CX1 §3/§4.1 원칙 기준: deterministic midpoint quadrature, NOT a vendor quality preset.
        public const int IntegrationSteps = 24;
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
            // a: exact efaa481c7 reference values; CX1 §2/§10 evaluation only, no retuning.
            new MoodLabPreset('a', "A2 cool reference", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 19f, 62f, new Color(.105f,.145f,.17f), .55f, 16f, -8f, new Color(1f,1f,1f))
            {
            },
            // b: lighting/grading remain A2. Fog 22..68/color are 저작 시험값, CX1 §2/§10 원칙 기준.
            new MoodLabPreset('b', "Height fog and rim", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 22f, 68f, new Color(.105f,.145f,.17f), .55f, 16f, -8f, new Color(1f,1f,1f))
            {
                HeightDensity = .020f, HeightBase = .20f, HeightFalloff = 1.2f, HeightLaneFloor = .25f, // 저작 시험값, CX1 §3 원칙 기준
                OpticalDepthCap = .060f, // 저작 시험값, CX1 §3/§10 원칙 기준 + CTO center T>=.83 constraint
                RimPower = 4f, RimStrength = .12f, RimColor = new Color(.55f,.70f,1f) // 저작 시험값, CX1 §8 원칙 기준; p=4 example is NOT a recommendation
            },
            // c: lighting/grading remain A2. Fog 24..72/color are 저작 시험값, CX1 §2/§10 원칙 기준.
            new MoodLabPreset('c', "Smooth medium and aerial perspective", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 24f, 72f, new Color(.105f,.145f,.17f), .55f, 16f, -8f, new Color(1f,1f,1f))
            {
                VolumeDensity = .0025f, VolumeFloor = .20f, Scatter = .65f, // 저작 시험값, CX1 §4.1/§10 원칙 기준; smooth unshadowed scattering approximation
                OpticalDepthCap = .060f // 저작 시험값, CX1 §3/§10 원칙 기준; no jitter or noise
            },
            // d: A2 lighting/fog retained. .40/10/-12 grading is 저작 시험값, CX1 §9.1/§9.3 원칙 기준.
            new MoodLabPreset('d', "White balance and LUT", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 19f, 62f, new Color(.105f,.145f,.17f), .40f, 10f, -12f, new Color(1f,1f,1f))
            {
                Temperature = -8f, Tint = 5f, LutContribution = .35f, // 저작 시험값, CX1 §9.3 원칙 기준; no recommended WB/contribution in CX1
                LutScale = new Vector3(.96f,.98f,.94f), // 저작 시험값, CX1 §9.3 원칙 기준; encoded RGB transform, NOT another tone mapper
                LutCross = new Vector3(.02f,0f,.03f), // 저작 시험값, CX1 §9.3 원칙 기준
                LutLift = new Vector3(.01f,.005f,.01f) // 저작 시험값, CX1 §9.3 원칙 기준; monotonic, unclipped endpoints
            }
        };
    }
}
