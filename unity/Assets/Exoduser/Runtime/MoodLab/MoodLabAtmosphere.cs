using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort.MoodLab
{
    // CX1 §3/§4.1: surface-aligned optical compositor, NOT a URP volumetric renderer.
    // Existing opaque lighting/shadow passes remain untouched. No renderer feature/RenderGraph API.
    public sealed class MoodLabAtmosphere : IDisposable
    {
        readonly Material material;
        readonly List<MeshRenderer> overlays = new List<MeshRenderer>();

        public MoodLabAtmosphere(Transform host, Vector3 origin)
        {
            // Resources inclusion is local; never edit Always Included Shaders.
            var shader = Resources.Load<Shader>("MoodLab/MoodLabAtmosphere");
            if (shader == null || !shader.isSupported) throw new InvalidOperationException("MoodLab atmosphere shader unavailable");
            material = new Material(shader) { name = "MoodLab optical compositor transient" };
            material.SetVector("_Origin", new Vector4(origin.x, origin.y, origin.z, 0));
            foreach (var filter in host.GetComponentsInChildren<MeshFilter>(true))
            {
                if (filter.sharedMesh == null) continue;
                var source = filter.GetComponent<MeshRenderer>();
                if (source == null) continue;
                var go = new GameObject("MoodLab optical overlay");
                go.layer = filter.gameObject.layer;
                go.transform.SetParent(filter.transform, false); // identical mesh/matrix; never move authored objects
                go.AddComponent<MeshFilter>().sharedMesh = filter.sharedMesh;
                var overlay = go.AddComponent<MeshRenderer>();
                var mats = new Material[filter.sharedMesh.subMeshCount];
                for (int i = 0; i < mats.Length; i++) mats[i] = material;
                overlay.sharedMaterials = mats;
                overlay.shadowCastingMode = ShadowCastingMode.Off; overlay.receiveShadows = false;
                bool probe = source.name.StartsWith("NEAR ", StringComparison.Ordinal) ||
                    source.name.StartsWith("MID ", StringComparison.Ordinal) || source.name.StartsWith("FAR ", StringComparison.Ordinal);
                var block = new MaterialPropertyBlock(); block.SetFloat("_ProbeMask", probe ? 1 : 0);
                overlay.SetPropertyBlock(block); overlay.enabled = false; overlays.Add(overlay);
            }
        }

        public void Apply(MoodLabPreset preset)
        {
            material.SetFloat("_HeightDensity", preset.HeightDensity);
            material.SetFloat("_HeightBase", preset.HeightBase);
            material.SetFloat("_HeightFalloff", preset.HeightFalloff);
            material.SetFloat("_HeightLaneFloor", preset.HeightLaneFloor);
            material.SetFloat("_VolumeDensity", preset.VolumeDensity);
            material.SetFloat("_VolumeFloor", preset.VolumeFloor);
            material.SetFloat("_Scatter", preset.Scatter);
            material.SetFloat("_OpticalDepthCap", preset.OpticalDepthCap);
            material.SetFloat("_RimPower", preset.RimPower);
            material.SetFloat("_RimStrength", preset.RimStrength);
            material.SetColor("_RimColor", preset.RimColor);
            material.SetColor("_FogTint", preset.FogColor);
            material.SetVector("_LinearFog", new Vector4(preset.FogStart, preset.FogEnd, 0, 0));
            SetActive(true);
        }

        public void SetActive(bool active) { foreach (var overlay in overlays) if (overlay != null) overlay.enabled = active; }

        // Same 24 deterministic midpoint samples as the shader. Returns EXTRA transmission only;
        // caller multiplies by the existing linear fog factor, never reports rim brightness as transmission.
        public static float ExtraTransmission(Vector3 camera, Vector3 world, Vector3 origin, MoodLabPreset preset)
        {
            float length = Vector3.Distance(camera, world), integral = 0;
            for (int s = 0; s < MoodLabPresets.IntegrationSteps; s++)
            {
                var p = Vector3.Lerp(camera, world, (s + .5f) / MoodLabPresets.IntegrationSteps) - origin;
                float u = Mathf.Clamp01((Mathf.Abs(p.x)-2.2f)/4f);
                float lateral = Mathf.Lerp(preset.HeightLaneFloor, 1, u*u*(3-2*u));
                float height = preset.HeightDensity * Mathf.Exp(-preset.HeightFalloff*Mathf.Max(p.y-preset.HeightBase, 0))*lateral;
                float qx = p.x-6-p.y*.3f, qz = p.z-8-p.y*.1f;
                float volume = preset.VolumeDensity * Mathf.Lerp(preset.VolumeFloor, 1, Mathf.Exp(-qx*qx/16-qz*qz/64));
                integral += height + volume;
            }
            return Mathf.Exp(-Mathf.Min(preset.OpticalDepthCap, integral*length/MoodLabPresets.IntegrationSteps));
        }

        public void Dispose()
        {
            foreach (var overlay in overlays) if (overlay != null) UnityEngine.Object.Destroy(overlay.gameObject);
            if (material != null) UnityEngine.Object.Destroy(material);
        }
    }
}
