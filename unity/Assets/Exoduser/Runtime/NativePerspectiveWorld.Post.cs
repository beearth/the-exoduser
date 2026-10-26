using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D stage 2 post-process component (Built-in OnRenderImage on the 3D world camera only). Constants: look_3d_variant.gd:127-136.
    [ExecuteAlways] public sealed class NativePerspectiveWorldPost : MonoBehaviour
    {
        public const float GlowIntensity = 0.20f, GlowBloom = 0.025f, GlowThreshold = 0.82f;
        public const float Brightness = 1.02f, Contrast = 1.06f, Saturation = 0.86f;
        Material material;
        public bool Active = true;
        public float Vignette, CenterLift, InnerRadius = 0.30f, ContrastScale = 1f; // slice grade (0 = off): screen-edge darkening, centre lift, contrast multiplier

        void OnEnable()
        {
            var shader = Resources.Load<Shader>("Shaders/Look3DPost");
            if (shader == null) throw new InvalidOperationException("Look3DPost shader is missing");
            material = new Material(shader) { name = "Look3DPost", hideFlags = HideFlags.HideAndDontSave };
        }

        void OnDisable() { if (material != null) Destroy(material); material = null; }

        void OnRenderImage(RenderTexture source, RenderTexture destination)
        {
            if (!Active || material == null) { Graphics.Blit(source, destination); return; }
            int w = Mathf.Max(1, source.width / 4), h = Mathf.Max(1, source.height / 4);
            var a = RenderTexture.GetTemporary(w, h, 0, RenderTextureFormat.ARGB32); var b = RenderTexture.GetTemporary(w, h, 0, RenderTextureFormat.ARGB32);
            a.filterMode = FilterMode.Bilinear; b.filterMode = FilterMode.Bilinear;
            material.SetVector("_GlowParams", new Vector4(GlowIntensity, GlowBloom, GlowThreshold, 0f));
            material.SetVector("_BcsParams", new Vector4(Brightness, Contrast * ContrastScale, Saturation, 0f));
            material.SetVector("_VigParams", new Vector4(Vignette, InnerRadius, CenterLift, 0f));
            Graphics.Blit(source, a, material, 0);
            material.SetVector("_BlurDirection", new Vector2(1.5f, 0f)); Graphics.Blit(a, b, material, 1);
            material.SetVector("_BlurDirection", new Vector2(0f, 1.5f)); Graphics.Blit(b, a, material, 1);
            material.SetTexture("_GlowTex", a);
            Graphics.Blit(source, destination, material, 2);
            RenderTexture.ReleaseTemporary(a); RenderTexture.ReleaseTemporary(b);
        }
    }
}
