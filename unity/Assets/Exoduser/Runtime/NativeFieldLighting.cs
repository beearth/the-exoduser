using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Source snapshot dee094fd: game.html 4500-4733, 55201, 55352-55419.
    // Built-in world-camera consumer only; no simulation, UI or storage writes.
    [DisallowMultipleComponent, RequireComponent(typeof(Camera))]
    public sealed class NativeFieldLighting : MonoBehaviour
    {
        const int StaticCount = 12, LightCount = StaticCount + 2, IrisIndex = LightCount - 1;
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
        static readonly int PetSpriteId=Shader.PropertyToID("_PetSprite"), PetFlameId=Shader.PropertyToID("_PetFlame");
        static readonly int PetEnabledId=Shader.PropertyToID("_PetEnabled"), BloomMapId=Shader.PropertyToID("_BloomMap"), BloomShiftId=Shader.PropertyToID("_BloomShift");

        readonly Vector4[] lights = new Vector4[LightCount];
        readonly Vector4[] colorRects = new Vector4[LightCount], holeRects = new Vector4[LightCount];
        NativeGame owner;
        Camera worldCamera;
        SourceLight[] statics;
        Material material;
        SourceFieldLightStamps stamps;
        Texture2D petHalo;
        SpriteRenderer playerPoint;
        Sprite playerPointSprite;
        Material playerPointMaterial;
        RenderTexture darkness, colorMap,litWorld,bloom,bloomScratch;
        int width,height,renderFrame,lastUnityFrame = -1;
        Vector2 lastCenter;
        Vector2 lastLogicalSize;
        bool dirty = true,ready;
        float fogTime;
        internal bool MeasureAllocations;
        internal long RenderAllocatedBytes, UpdateAllocatedBytes;
        internal int TargetRecreates, RenderCalls, CacheRefreshes;

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
            petHalo=BuildPetHalo();material.SetTexture("_PetHaloMap",petHalo);
            // Source25502/51944: independent Ori floor light, BEFORE actors and
            // the postprocess. _CENTER_GLOW=false disables ci6, not this bitmap.
            // GPU source6028 ignores globalCompositeOperation; source5592 uses
            // SrcAlpha/OneMinusSrcAlpha and source5614 samples this canvas linearly.
            var pointTexture=Resources.Load<Texture2D>("Art/map/source-light/player-point");
            var pointShader=Resources.Load<Shader>("Shaders/SourcePlayerFloor");
            if(pointTexture==null||pointShader==null)throw new InvalidOperationException("Missing original player floor light");
            pointTexture.filterMode=FilterMode.Bilinear;
            playerPointSprite=Sprite.Create(pointTexture,new Rect(0,0,640,640),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            playerPointMaterial=new Material(pointShader){hideFlags=HideFlags.HideAndDontSave};
            var pointObject=new GameObject("Source player floor light");pointObject.transform.SetParent(owner.transform,false);
            playerPoint=pointObject.AddComponent<SpriteRenderer>();playerPoint.sprite=playerPointSprite;
            playerPoint.sharedMaterial=playerPointMaterial;playerPoint.sortingOrder=-19999;playerPoint.enabled=false;
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
            // Source4685-4690: existing warm preset0, OPT.irisGlow||250, not a player boost.
            holeRects[IrisIndex]=stamps.HoleRect(250);colorRects[IrisIndex]=stamps.ColorRect(0);
            material.SetVectorArray(ColorRectsId, colorRects);
            material.SetVectorArray(HoleRectsId, holeRects);
            PrepareTargets(Mathf.Max(2, camera.pixelWidth), Mathf.Max(2, camera.pixelHeight));
            ready = true;
        }

        void Update()
        {
            if (!ready || worldCamera == null) return;
            long allocated = MeasureAllocations ? GC.GetAllocatedBytesForCurrentThread() : 0;
            playerPoint.enabled=owner!=null&&owner.WorldLightingVisible;
            if(playerPoint.enabled){var p=owner.Simulation.Player;playerPoint.transform.position=new Vector3(p.X/100,-p.Y/100,0);}
            // Resolution transition only. Stable frames perform no allocation or resource load.
            int w = Mathf.Max(2, worldCamera.pixelWidth), h = Mathf.Max(2, worldCamera.pixelHeight);
            if (w != width || h != height || !darkness.IsCreated() || !colorMap.IsCreated()) PrepareTargets(w,h);
            if (MeasureAllocations) UpdateAllocatedBytes += GC.GetAllocatedBytesForCurrentThread() - allocated;
        }

        void PrepareTargets(int w, int h)
        {
            TargetRecreates++;
            ReleaseTarget(ref darkness);
            ReleaseTarget(ref colorMap);
            ReleaseTarget(ref litWorld);ReleaseTarget(ref bloom);ReleaseTarget(ref bloomScratch);
            width = w; height = h;
            darkness = CreateTarget("Source half-resolution darkness", w / 2, h / 2);
            colorMap = CreateTarget("Source half-resolution color lights", w / 2, h / 2);
            litWorld=CreateTarget("Source lit world before bloom",w,h);
            bloom=CreateTarget("Source sixth-resolution bloom",Mathf.Max(1,w/6),Mathf.Max(1,h/6));
            bloom.filterMode=FilterMode.Point; // Source4464: world canvas imageSmoothingEnabled=false.
            bloomScratch=CreateTarget("Source bloom self-copy",Mathf.Max(1,w/6),Mathf.Max(1,h/6));
            var active=RenderTexture.active;RenderTexture.active=bloom;GL.Clear(false,true,Color.clear);RenderTexture.active=active;
            material.SetTexture(BloomMapId,bloom);
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

        static Texture2D BuildPetHalo()
        {
            // Source25504: literal cached400x400 premultiplied canvas, sampled with world smoothing off.
            var pixels=new Color32[400*400];
            var a=new Vector4(60*.22f/255,160*.22f/255,.22f,.22f);
            var b=new Vector4(40*.12f/255,130*.12f/255,220*.12f/255,.12f);
            var c=new Vector4(30*.04f/255,100*.04f/255,180*.04f/255,.04f);
            for(int y=0;y<400;y++)for(int x=0;x<400;x++){
                float dx=(x+.5f-200)/200,dy=(y+.5f-200)/200,t=Mathf.Sqrt(dx*dx+dy*dy);
                var v=t<.3f?Vector4.Lerp(a,b,t/.3f):t<.7f?Vector4.Lerp(b,c,(t-.3f)/.4f):Vector4.Lerp(c,Vector4.zero,(t-.7f)/.3f);
                pixels[y*400+x]=new Color32((byte)Mathf.RoundToInt(v.x*255),(byte)Mathf.RoundToInt(v.y*255),(byte)Mathf.RoundToInt(v.z*255),(byte)Mathf.RoundToInt(v.w*255));
            }
            var texture=new Texture2D(400,400,TextureFormat.RGBA32,false,true){name="Source cached iris halo",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp};
            texture.SetPixels32(pixels);texture.Apply(false,true);return texture;
        }

        void OnRenderImage(RenderTexture source, RenderTexture destination)
        {
            if (!ready || owner == null || !owner.WorldLightingVisible ||
                source.width != width || source.height != height || !darkness.IsCreated() || !colorMap.IsCreated())
            { Graphics.Blit(source, destination); return; }

            long allocated = MeasureAllocations ? GC.GetAllocatedBytesForCurrentThread() : 0;
            if (MeasureAllocations) RenderCalls++;
            var previousTarget = RenderTexture.active;
            bool previousSrgb = GL.sRGBWrite;
            GL.sRGBWrite = false;
            try
            {
                if (lastUnityFrame != Time.frameCount)
                {
                    lastUnityFrame = Time.frameCount;
                    // Source32113/32139: the light phase stops in lesson intro.
                    // Crow starts at0 and advances once in the same updatePet tick,
                    // including Curtain and iris-off, without resetting in lessons.
                    if (owner.FieldPets != null) renderFrame = (int)owner.FieldPets.Crow.T;
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
                    if (MeasureAllocations) CacheRefreshes++;
                    CollectLights(center,logicalSize);
                    Graphics.Blit(null, darkness, material, 0);
                    Graphics.Blit(null, colorMap, material, 1);
                    lastCenter = center; lastLogicalSize = logicalSize; dirty = false;
                }
                // Source performance.now milliseconds, independent of pause/fixed update.
                material.SetFloat(FogPulseId, .28f + (float)Math.Sin(Time.realtimeSinceStartupAsDouble * Math.PI / 2) * .08f);
                material.SetFloat(FogTimeId, fogTime);
                var pets=owner.FieldPets;
                bool iris=pets!=null&&!pets.IrisOff;
                material.SetFloat(PetEnabledId,iris?1:0);
                if(iris){
                    var pet=pets.Iris;float t=(float)pet.T;
                    material.SetVector(PetSpriteId,new Vector4((float)pet.X-center.x+logicalSize.x/2,
                        (float)pet.Y+Mathf.Sin(t*.07f)*5-center.y+logicalSize.y/2,
                        20+pets.IrisSize*.8f,.85f+Mathf.Sin(t*.09f)*.1f+Mathf.Sin(t*.17f)*.05f));
                    material.SetTexture(PetFlameId,owner.PetFlame);
                }
                Graphics.Blit(source,litWorld,material,3);
                // Source4481-4497 / 55203: original sixth-size multiply/self-copies, every3 offset1.
                // Torch mask55259 is dormant: source _TORCH.darkAlpha=0. Do not activate it.
                if(iris&&renderFrame%3==1){
                    Graphics.Blit(litWorld,bloom,material,4);
                    material.SetVector(BloomShiftId,new Vector4(2f/bloom.width,-2f/bloom.height,0,0));
                    Graphics.Blit(bloom,bloomScratch,material,5);
                    material.SetVector(BloomShiftId,new Vector4(-2f/bloom.width,2f/bloom.height,0,0));
                    Graphics.Blit(bloomScratch,bloom,material,5);
                }
                Graphics.Blit(litWorld, destination, material, 2);
            }
            finally { GL.sRGBWrite = previousSrgb; RenderTexture.active = previousTarget;
                if (MeasureAllocations) RenderAllocatedBytes += GC.GetAllocatedBytesForCurrentThread() - allocated; }
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
            var iris=owner.FieldPets;
            lights[IrisIndex]=Light((float)iris.Iris.X,(float)iris.Iris.Y,250,
                iris.IrisOff?0:(.45f+Mathf.Sin(renderFrame*.1f)*.08f+Mathf.Sin(renderFrame*.17f)*.05f)*.6f,center,size);
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
            ReleaseTarget(ref litWorld);ReleaseTarget(ref bloom);ReleaseTarget(ref bloomScratch);
            if (material != null) { Destroy(material); material = null; }
            stamps?.Dispose(); stamps = null;
            if(petHalo!=null){Destroy(petHalo);petHalo=null;}
            if(playerPoint!=null){Destroy(playerPoint.gameObject);playerPoint=null;}
            if(playerPointSprite!=null){Destroy(playerPointSprite);playerPointSprite=null;}
            if(playerPointMaterial!=null){Destroy(playerPointMaterial);playerPointMaterial=null;}
            owner = null;
        }
        void OnDisable(){if(playerPoint!=null)playerPoint.enabled=false;}
        void OnDestroy() { Release(); }
    }
}
