using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D stage 2 lighting: key directional shadow, 12 static field lights as real Point Lights, exp distance fog.
    //  - shadow: look_3d_variant.gd:20-23,139-159 (distance 5000, opacity .60, blur 1.5 ~ Soft, bias .045, normal bias .65, 4 splits)
    //  - fog: look_3d_variant.gd:16-17,103-107 (density .00006, light colour (.10,.115,.12), light energy .75)
    //  - field lights: Resources/Data/map3d_ch1_lights.json (the 12 statics of origin/codex/unity-map-light-01-20261026 8fb4072db ch1_lighting.json with provenance; web game.html:4639-4653).
    //    Position/radius/colour are the source values. The source has no height; PointLightHeight is a presentation constant.
    //    Flicker follows NativeFieldLighting.cs:163: a * (1 + sin(frame*.09 + i*1.7) * .10 * f).
    public sealed partial class NativePerspectiveWorld
    {
        public const float ShadowDistance = 5000f, ShadowStrength = 0.60f, ShadowBias = 0.045f, ShadowNormalBias = 0.65f;
        public const float FogDensity = 0.00006f, FogEnergy = 0.75f;
        public static readonly Color FogColor = new Color(0.10f, 0.115f, 0.12f);
        public const float PointLightHeight = 96f;

        [Serializable] sealed class FieldLightData { public FieldLight[] statics; }
        [Serializable] sealed class FieldLight { public float x, y, r, a, cr, cg, cb, f; }

        FieldLight[] fieldLights = new FieldLight[0];
        Light[] pointLights = new Light[0];
        readonly Vector4[] pointPositions = new Vector4[12], pointColors = new Vector4[12];
        public int? SimulationFrame; // simulation tick supplied by NativeGame (web _gameFrame); standalone uses render time*60
        public float? FlickerFrameOverride; // QA/capture: fixed flicker phase for deterministic stills
        public int FieldLightCount { get { return fieldLights.Length; } }
        public bool ShadowsEnabled { get { return keyLight != null && keyLight.shadows != LightShadows.None; } }

        void BuildStage2Lighting()
        {
            // Runtime-only: in edit mode QualitySettings writes ProjectSettings/QualitySettings.asset (a shared file), so never touch it there.
            if (Application.isPlaying)
            {
                QualitySettings.shadows = ShadowQuality.All; QualitySettings.shadowResolution = ShadowResolution.VeryHigh;
                QualitySettings.shadowProjection = ShadowProjection.StableFit; QualitySettings.shadowDistance = ShadowDistance;
                QualitySettings.shadowCascades = 4; QualitySettings.shadowCascade4Split = new Vector3(0.1f, 0.2f, 0.5f); // Godot SHADOW_PARALLEL_4_SPLITS defaults
            }
            Shader.SetGlobalVector("_L3D_Fog", new Vector4(FogDensity, FogEnergy, 0f, 0f));
            var fog = FogColor.linear; Shader.SetGlobalVector("_L3D_FogCol", new Vector4(fog.r, fog.g, fog.b, 1f));
            var data = Resources.Load<TextAsset>("Data/map3d_ch1_lights");
            if (data == null) throw new InvalidOperationException("Original field lighting data is missing");
            var parsed = JsonUtility.FromJson<FieldLightData>(data.text);
            if (parsed == null || parsed.statics == null || parsed.statics.Length == 0 || parsed.statics.Length > 12) throw new InvalidOperationException("Invalid field lighting data");
            fieldLights = parsed.statics; pointLights = new Light[fieldLights.Length];
            for (int i = 0; i < fieldLights.Length; i++)
            {
                var s = fieldLights[i];
                var go = new GameObject("FieldLight " + i); go.transform.SetParent(root, false);
                go.transform.position = Unity(s.x, PointLightHeight, s.y);
                var light = go.AddComponent<Light>(); light.type = LightType.Point; light.range = s.r; light.color = new Color(s.cr / 255f, s.cg / 255f, s.cb / 255f); light.intensity = s.a; light.shadows = LightShadows.None;
                pointLights[i] = light;
            }
            Shader.SetGlobalFloat("_L3D_PtCount", fieldLights.Length);
            UpdateFieldLights();
        }

        // Light values are sampled from the Light components so the Point Lights stay the single source of truth.
        void UpdateFieldLights()
        {
            float frame = FlickerFrameOverride.HasValue ? FlickerFrameOverride.Value : SimulationFrame.HasValue ? SimulationFrame.Value : Time.timeSinceLevelLoad * 60f; // web: _gameFrame (game.html:4683)
            for (int i = 0; i < fieldLights.Length; i++)
            {
                var s = fieldLights[i]; var light = pointLights[i];
                if (light == null) continue;
                float flicker = s.a * (1f + Mathf.Sin(frame * 0.09f + i * 1.7f) * 0.10f * s.f);
                var p = light.transform.position;
                pointPositions[i] = new Vector4(p.x, p.y, p.z, light.range);
                pointColors[i] = new Vector4(light.color.r, light.color.g, light.color.b, Mathf.Clamp01(flicker * 0.85f) * (light.enabled ? 1f : 0f));
            }
            Shader.SetGlobalVectorArray("_L3D_PtPos", pointPositions);
            Shader.SetGlobalVectorArray("_L3D_PtCol", pointColors);
        }

        public void SetShadows(bool on)
        {
            if (keyLight != null) keyLight.shadows = on ? LightShadows.Soft : LightShadows.None;
        }

        public void SetFieldLights(bool on)
        {
            for (int i = 0; i < pointLights.Length; i++) if (pointLights[i] != null) pointLights[i].enabled = on;
            UpdateFieldLights();
        }
    }
}
