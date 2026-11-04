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
        public float LutCurveContrast, LutCurveSaturation = 1;
        public string Intent = "";

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
                Intent = "A2 기준판: 차가운 주광과 기존 거리 안개 비교",
            },
            // CX5 trial, not a recommended numeric range. CX1 §3/§8/§10 principles only.
            new MoodLabPreset('b', "Height fog and rim", 3.2f, new Color(.55f,.82f,1f), .55f, 1f, new Color(.22f,.30f,.34f), 22f, 68f, new Color(.16f,.34f,.42f), .55f, 18f, -12f, new Color(1f,1f,1f))
            {
                Intent = "청록 저지대 안개와 밝은 상부 림: 냉습한 늪",
                HeightDensity = .100f, HeightBase = .60f, HeightFalloff = .9f, HeightLaneFloor = .25f, // 저작 시험값, CX1 §3 원칙 기준; density 5x previous
                OpticalDepthCap = .240f, // 저작 시험값, CX1 §3/§10 원칙 기준; report any T<83%, no false pass
                RimPower = 2f, RimStrength = .90f, RimColor = new Color(.65f,.85f,1f) // 저작 시험값, CX1 §8 원칙 기준; strength 7.5x previous
            },
            // CX5 trial: extinction slope 2.5x via range 48/2.5=19.2u; NOT a CX1 numeric recommendation.
            new MoodLabPreset('c', "Smooth medium and aerial perspective", 3.0f, new Color(1f,.73f,.42f), .50f, 1f, new Color(.30f,.23f,.15f), 24f, 43.2f, new Color(.42f,.24f,.10f), .45f, 20f, 8f, new Color(1f,1f,1f))
            {
                Intent = "황갈색 산란과 빠른 거리 감쇠: 무거운 유황 대기",
                VolumeDensity = .00625f, VolumeFloor = .20f, Scatter = 1.625f, // 저작 시험값, CX1 §4.1/§10 원칙 기준; density/scatter controls 2.5x
                OpticalDepthCap = .150f // 저작 시험값, CX1 §3/§10 원칙 기준; actual integrated T reported
            },
            // CX5 trial color curves, white balance and LUT. CX1 §9.1/§9.3 principles only.
            new MoodLabPreset('d', "White balance and LUT", 3.2f, new Color(.85f,.90f,1f), .55f, 1f, new Color(.26f,.28f,.30f), 19f, 62f, new Color(.105f,.145f,.17f), .30f, 26f, -24f, new Color(1f,1f,1f))
            {
                Intent = "보랏빛 암부와 낮은 채도 S곡선: 차가운 잿빛 지옥",
                Temperature = -30f, Tint = 24f, LutContribution = .85f, // 저작 시험값, CX1 §9.3 원칙 기준
                LutScale = new Vector3(.80f,.92f,.98f), // 저작 시험값, CX1 §9.3 원칙 기준
                LutCross = new Vector3(.06f,0f,0f), // 저작 시험값, CX1 §9.3 원칙 기준
                LutLift = new Vector3(.035f,.015f,.005f), // 저작 시험값, CX1 §9.3 원칙 기준
                LutCurveContrast = .65f, LutCurveSaturation = .70f // 저작 시험값, CX1 §9.3 원칙 기준; monotonic S-curve, no baked ACES
            }
        };
    }
}
