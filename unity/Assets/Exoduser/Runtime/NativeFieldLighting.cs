using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Source snapshot dee094fd: game.html 4500-4733, 55201, 55352-55419.
    // Built-in world-camera consumer only; no simulation, UI or storage writes.
    [DisallowMultipleComponent, RequireComponent(typeof(Camera))]
    public sealed class NativeFieldLighting : MonoBehaviour
    {
        const int StaticCount = 12, LightCount = StaticCount + 1;
        [Serializable] sealed class SourceLights { public SourceLight[] statics; }
        [Serializable] sealed class SourceLight { public float x,y,r,a,cr,cg,cb,f; }

        static readonly int ScreenId = Shader.PropertyToID("_ScreenPx");
        static readonly int LightsId = Shader.PropertyToID("_Lights");
        static readonly int ColorRectsId = Shader.PropertyToID("_ColorRects");
        static readonly int HoleRectsId = Shader.PropertyToID("_HoleRects");
        static readonly int HoleStampsId = Shader.PropertyToID("_HoleStamps");
        static readonly int ColorStampsId = Shader.PropertyToID("_ColorStamps");
        static readonly int DarknessId = Shader.PropertyToID("_Darkness");
        static readonly int ColorMapId = Shader.PropertyToID("_ColorMap");
        static readonly int FogPulseId = Shader.PropertyToID("_FogPulse");
        static readonly int FogTimeId = Shader.PropertyToID("_FogTime");
        static readonly int DomFogId = Shader.PropertyToID("_DomFogEnabled");

        readonly Vector4[] lights = new Vector4[LightCount];
        readonly Vector4[] colorRects = new Vector4[LightCount], holeRects = new Vector4[LightCount];
        NativeGame owner;
        Camera worldCamera;
        SourceLight[] statics;
        Material material;
        SourceFieldLightStamps stamps;
        RenderTexture darkness, colorMap;
        int width,height,renderFrame,lastUnityFrame = -1;
        Vector2 lastCenter;
        Vector2 lastLogicalSize;
        bool dirty = true,ready;
        float fogTime;

        public void Initialize(NativeGame game, Camera camera)
        {
            owner = game;
            worldCamera = camera;
            var shader = Resources.Load<Shader>("Shaders/FieldLighting");
            var data = Resources.Load<TextAsset>("Data/ch1_lighting");
            if (shader == null || !shader.isSupported || data == null)
                throw new InvalidOperationException("Missing or unsupported source field lighting resources");
            statics = JsonUtility.FromJson<SourceLights>(data.text).statics;
            if (statics == null || statics.Length != StaticCount)
                throw new InvalidOperationException("CH1 source requires exactly 12 static lights");
            material = new Material(shader) { hideFlags = HideFlags.HideAndDontSave };
            stamps = new SourceFieldLightStamps();
            material.SetTexture(HoleStampsId, stamps.Holes);
            material.SetTexture(ColorStampsId, stamps.Colors);
            // Source 9072: Mac + navigator.gpu skips the separate THREE/WebGL fog canvas.
            bool mac = Application.platform == RuntimePlatform.OSXPlayer || Application.platform == RuntimePlatform.OSXEditor;
            material.SetFloat(DomFogId, mac ? 0 : 1);
            for (int i = 0; i < StaticCount; i++)
            {
                var s = statics[i];
                // _colIdx(4552): these source colors resolve to presets 3, 0, then 4.
                int preset = s.cr > 190 && s.cg < 110 && s.cb < 90 ? 3 :
                    s.cr > 190 && s.cg > 130 && s.cb < 140 ? 0 : 4;
                colorRects[i + 1] = stamps.ColorRect(preset);
                holeRects[i + 1] = stamps.HoleRect(s.r);
            }
            // _CENTER_GLOW=false: player ci6 contributes a hole, never a color disc.
            holeRects[0] = stamps.HoleRect(470);
            material.SetVectorArray(ColorRectsId, colorRects);
            material.SetVectorArray(HoleRectsId, holeRects);
            PrepareTargets(Mathf.Max(2, camera.pixelWidth), Mathf.Max(2, camera.pixelHeight));
            ready = true;
        }

        void Update()
        {
            if (!ready || worldCamera == null) return;
            // Resolution transition only. Stable frames perform no allocation or resource load.
            int w = Mathf.Max(2, worldCamera.pixelWidth), h = Mathf.Max(2, worldCamera.pixelHeight);
            if (w != width || h != height || !darkness.IsCreated() || !colorMap.IsCreated()) PrepareTargets(w,h);
        }

        void PrepareTargets(int w, int h)
        {
            ReleaseTarget(ref darkness);
            ReleaseTarget(ref colorMap);
            width = w; height = h;
            darkness = CreateTarget("Source half-resolution darkness", w / 2, h / 2);
            colorMap = CreateTarget("Source half-resolution color lights", w / 2, h / 2);
            material.SetTexture(DarknessId, darkness);
            material.SetTexture(ColorMapId, colorMap);
            dirty = true;
        }

        static RenderTexture CreateTarget(string name, int w, int h)
        {
            // Canvas stores premultiplied sRGB byte values. Gamma project; no linear conversion.
            var target = new RenderTexture(w,h,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear) {
                name = name, filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp,
                hideFlags = HideFlags.HideAndDontSave, useMipMap = false, autoGenerateMips = false
            };
            target.Create();
            return target;
        }

        void OnRenderImage(RenderTexture source, RenderTexture destination)
        {
            if (!ready || owner == null || !owner.WorldLightingVisible ||
                source.width != width || source.height != height || !darkness.IsCreated() || !colorMap.IsCreated())
            { Graphics.Blit(source, destination); return; }

            var previousTarget = RenderTexture.active;
            bool previousSrgb = GL.sRGBWrite;
            GL.sRGBWrite = false;
            try
            {
                if (lastUnityFrame != Time.frameCount)
                {
                    lastUnityFrame = Time.frameCount;
                    // Web _gameFrame is a render/update counter, not the native fixed tick.
                    if (owner.Running) renderFrame++;
                    fogTime += .016f;
                }
                float logicalHeight = worldCamera.orthographicSize * 200;
                var logicalSize = new Vector2(logicalHeight * worldCamera.aspect, logicalHeight);
                var cameraPosition = worldCamera.transform.position;
                var center = new Vector2(cameraPosition.x * 100, -cameraPosition.y * 100);
                material.SetVector(ScreenId, new Vector4(logicalSize.x,logicalSize.y,0,0));
                // Source 55201: moving camera/resize refresh immediately; stationary every 3 frames.
                if (dirty || renderFrame % 3 == 0 || center != lastCenter || logicalSize != lastLogicalSize)
                {
                    CollectLights(center,logicalSize);
                    Graphics.Blit(null, darkness, material, 0);
                    Graphics.Blit(null, colorMap, material, 1);
                    lastCenter = center; lastLogicalSize = logicalSize; dirty = false;
                }
                // Source performance.now milliseconds, independent of pause/fixed update.
                material.SetFloat(FogPulseId, .28f + (float)Math.Sin(Time.realtimeSinceStartupAsDouble * Math.PI / 2) * .08f);
                material.SetFloat(FogTimeId, fogTime);
                Graphics.Blit(source, destination, material, 2);
            }
            finally { GL.sRGBWrite = previousSrgb; RenderTexture.active = previousTarget; }
        }

        void CollectLights(Vector2 center, Vector2 size)
        {
            var p = owner.Simulation.Player;
            lights[0] = Light(p.X,p.Y - 6,470,.86f + Mathf.Sin(renderFrame * .07f) * .03f,center,size);
            for (int i = 0; i < StaticCount; i++)
            {
                var s = statics[i];
                lights[i + 1] = Light(s.x,s.y,s.r,s.a * (1 + Mathf.Sin(renderFrame * .09f + i * 1.7f) * .10f * s.f),center,size);
            }
            material.SetVectorArray(LightsId, lights);
        }

        static Vector4 Light(float x, float y, float radius, float alpha, Vector2 center, Vector2 size)
        {
            float sx = x - center.x + size.x / 2, sy = y - center.y + size.y / 2;
            if (sx < -300 || sy < -300 || sx > size.x + 300 || sy > size.y + 300) alpha = 0;
            return new Vector4(sx,sy,(int)(radius * .5f) * 2,alpha);
        }

        static void ReleaseTarget(ref RenderTexture target)
        {
            if (target == null) return;
            target.Release(); Destroy(target); target = null;
        }

        public void Release()
        {
            ready = false;
            ReleaseTarget(ref darkness); ReleaseTarget(ref colorMap);
            if (material != null) { Destroy(material); material = null; }
            stamps?.Dispose(); stamps = null;
            owner = null;
        }
        void OnDestroy() { Release(); }
    }
}
