using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
using Object = UnityEngine.Object;

namespace Exoduser.Editor
{
    // Isolated batch Editor only: no NativeGame instance, simulation ticks, Play mode or saved assets.
    public static class BossArenaLookShot
    {
        const int Width=1920,Height=1080;
        const float Pitch=34,Distance=16.5f,Fov=46.9453f;
        const BindingFlags Private=BindingFlags.Instance|BindingFlags.NonPublic;
        [Serializable] sealed class Tone
        {
            public string tonemapping;public float weight,exposure,contrast,saturation,bloom;public Color colorFilter;
        }
        [Serializable] sealed class Lighting
        {
            public Vector3 moonRotation;public Color moonColor,ambientSky,ambientEquator,ambientGround;
            public float moonIntensity,fogStart,fogEnd;public string moonShadows,fogMode;
            public bool cameraPost,fog;public List<Tone> profiles;
        }
        [Serializable] sealed class Reference
        {
            public Vector3 position,rotation,marker;public float fieldOfView;public Lighting lighting;
        }
        [Serializable] sealed class GroundValues
        {
            public Color tint;public Vector4 ambient;public float saturation,flatten,dark,shadowFloor;
            public GroundValues(Material m){tint=m.GetColor("_Tint");ambient=m.GetVector("_GroundAmbient");saturation=m.GetFloat("_Sat");flatten=m.GetFloat("_Flat");dark=m.GetFloat("_Dark");shadowFloor=m.GetFloat("_GroundShadowFloor");}
        }
        [Serializable] sealed class Region
        {
            public string name;public int pixels;public float meanY,stdY,meanS,maxS,fractionSAbove030,shadowMean,shadowMin,shadowBelowHalfFraction,lambertMean;
        }
        [Serializable] sealed class Shot
        {
            public string name;public GroundValues values;public List<Region> regions=new List<Region>();
        }
        [Serializable] sealed class Receipt
        {
            public string status="MEASURED_EDITOR_ONLY_CTO_SELECTION_PENDING";
            public string scope="NativeArena3DView constructor/Prewarm/SetActive/Late; measured field-light replay; no actors, active Core pillars, VFX or HUD. Not a Player or visual acceptance gate.";
            public string limits="Field upstream setup replayed from JSON and HellLighting constants, not NativeGame startup. Hero-attached fill/spot and live field-water material are absent. Receiver mask uses opaque/alpha-clipped material silhouettes; blended pixels excluded. Torch animation/flicker frozen between shots.";
            public string fieldReference,poseReference,unityVersion;public int width=Width,height=Height;
            public string qualityName,pipelineAsset,graphicsDevice;public float replayedShadowStrength=.55f;
            public float pitch=Pitch,distance=Distance,fov=Fov;public Vector3 position,marker;
            public string colorSpace,roiConvention="top-left normalized; only visible receiver pixels; Y=.299R+.587G+.114B in PNG bytes; S=HSV saturation";
            public Rect roi;public Lighting fieldLighting;public float arenaSunIntensity;public Vector3 arenaSunRotation;public Color arenaAmbientSky,arenaAmbientEquator,arenaAmbientGround;
            public NativeArena3DView.SurfaceReceipt surface;public List<Shot> shots=new List<Shot>();
        }
        static string Value(string[] args,string key,bool required=false)
        {
            int at=Array.IndexOf(args,key);if(at<0){if(required)throw new ArgumentException("Missing "+key);return null;}
            if(Array.LastIndexOf(args,key)!=at||at+1>=args.Length||args[at+1].StartsWith("-",StringComparison.Ordinal))throw new ArgumentException("Invalid/duplicate "+key);
            return args[at+1];
        }
        static float[] Numbers(string text,int count,float max)
        {
            var parts=text.Split(',');if(parts.Length!=count)throw new ArgumentException("Expected "+count+" comma-separated numbers: "+text);
            var result=new float[count];for(int i=0;i<count;i++)
                if(!float.TryParse(parts[i],NumberStyles.Float,CultureInfo.InvariantCulture,out result[i])||float.IsNaN(result[i])||float.IsInfinity(result[i])||result[i]<0||result[i]>max)throw new ArgumentException("Number outside 0.."+max+": "+text);
            return result;
        }
        static bool ApplyCandidates(string[] args,Material ground)
        {
            bool changed=false;
            foreach(string key in args)if(key.StartsWith("-ground",StringComparison.Ordinal)&&Array.IndexOf(new[]{"-groundAmbient","-groundTint","-groundSat","-groundFlat","-groundDark","-groundShadowFloor"},key)<0)throw new ArgumentException("Unknown ground option "+key);
            foreach(string key in new[]{"-groundAmbient","-groundTint","-groundSat","-groundFlat","-groundDark","-groundShadowFloor"})
            {
                string value=Value(args,key);if(value==null)continue;changed=true;
                if(key=="-groundAmbient"||key=="-groundTint")
                {
                    var v=Numbers(value,3,key=="-groundAmbient"?2.4f:1);
                    if(key=="-groundAmbient")ground.SetVector("_GroundAmbient",new Vector4(v[0],v[1],v[2],1));
                    else ground.SetColor("_Tint",new Color(v[0],v[1],v[2],1));
                }
                else ground.SetFloat(key=="-groundSat"?"_Sat":key=="-groundFlat"?"_Flat":key=="-groundDark"?"_Dark":"_GroundShadowFloor",Numbers(value,1,1)[0]);
            }
            return changed;
        }
        static Reference ReadReference(string path)
        {
            var r=JsonUtility.FromJson<Reference>(File.ReadAllText(path));
            if(r==null||r.lighting==null||!(r.lighting.moonIntensity>0)||r.lighting.profiles==null||r.lighting.profiles.Count!=1)throw new ArgumentException("Expected one live field volume and a moon light: "+path);
            return r;
        }
        static VolumeProfile ReplayField(Lighting field,Transform root,out Light sun)
        {
            var go=new GameObject("LookShot measured field moon");go.transform.SetParent(root,false);sun=go.AddComponent<Light>();sun.type=LightType.Directional;
            sun.intensity=field.moonIntensity;sun.color=field.moonColor;sun.transform.rotation=Quaternion.Euler(field.moonRotation);
            sun.shadows=(LightShadows)Enum.Parse(typeof(LightShadows),field.moonShadows);
            // NativeGame.A2Field upstream settings (not part of the old JSON receipt).
            sun.shadowStrength=.55f;sun.shadowBias=.035f;sun.shadowNormalBias=.12f;RenderSettings.sun=sun;
            RenderSettings.ambientMode=AmbientMode.Trilight;RenderSettings.ambientSkyColor=field.ambientSky;RenderSettings.ambientEquatorColor=field.ambientEquator;RenderSettings.ambientGroundColor=field.ambientGround;
            RenderSettings.fog=field.fog;RenderSettings.fogMode=(FogMode)Enum.Parse(typeof(FogMode),field.fogMode);RenderSettings.fogStartDistance=field.fogStart;RenderSettings.fogEndDistance=field.fogEnd;
            RenderSettings.fogColor=new Color(.105f,.145f,.17f); // NativeGame.HellLightingActive A2 branch.
            var source=AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Exoduser/Rendering/GlobalVolume_Hell.asset");
            if(source==null)throw new InvalidOperationException("GlobalVolume_Hell asset missing; use the full Mac checkout");
            var profile=Object.Instantiate(source);profile.components=new List<VolumeComponent>();
            foreach(var component in source.components)profile.components.Add(Object.Instantiate(component));
            var volume=new GameObject("LookShot measured field volume").AddComponent<Volume>();volume.transform.SetParent(root,false);volume.isGlobal=true;volume.weight=field.profiles[0].weight;volume.sharedProfile=profile;
            var tone=field.profiles[0];var map=Get<Tonemapping>(profile);map.mode.Override((TonemappingMode)Enum.Parse(typeof(TonemappingMode),tone.tonemapping));
            var color=Get<ColorAdjustments>(profile);color.postExposure.Override(tone.exposure);color.contrast.Override(tone.contrast);color.saturation.Override(tone.saturation);color.colorFilter.Override(tone.colorFilter);
            var split=Get<SplitToning>(profile);split.shadows.Override(new Color(.43f,.48f,.54f));split.highlights.Override(new Color(.55f,.51f,.46f));split.balance.Override(-12);
            var bloom=Get<Bloom>(profile);bloom.threshold.Override(1.1f);bloom.intensity.Override(tone.bloom);bloom.scatter.Override(.48f);
            if(profile.TryGet<Vignette>(out var vignette)){vignette.color.Override(new Color(.008f,.012f,.018f));vignette.intensity.Override(.13f);vignette.smoothness.Override(.65f);}
            if(profile.TryGet<FilmGrain>(out var grain))grain.active=false;
            return profile;
        }
        static T Get<T>(VolumeProfile profile) where T:VolumeComponent,new(){return profile.TryGet<T>(out var component)?component:profile.Add<T>();}
        static Texture2D Render(Camera camera,RenderTexture target,bool post,bool linear)
        {
            camera.targetTexture=target;camera.GetUniversalAdditionalCameraData().renderPostProcessing=post;
            RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=target});
            var old=RenderTexture.active;
            var image=new Texture2D(Width,Height,linear?TextureFormat.RGBAFloat:TextureFormat.RGB24,false,linear);
            try{RenderTexture.active=target;image.ReadPixels(new Rect(0,0,Width,Height),0,0);image.Apply();return image;}
            catch{Object.DestroyImmediate(image);throw;}
            finally{RenderTexture.active=old;}
        }
        static Color[] ReceiverMask(Camera camera,RenderTexture target,Renderer ground,Transform root)
        {
            var shader=Shader.Find("Universal Render Pipeline/Unlit");if(shader==null)throw new InvalidOperationException("URP Unlit mask shader missing");
            var original=new Dictionary<Renderer,Material[]>();var forced=new Dictionary<Renderer,bool>();var owned=new List<Material>();
            bool fog=RenderSettings.fog;var bg=camera.backgroundColor;
            try
            {
                foreach(var r in root.GetComponentsInChildren<Renderer>(true))
                {
                    // These ColorMask=0 depth proxies do not contribute to the beauty image.
                    if(r.name=="Ground effect receiver depth"){forced[r]=r.forceRenderingOff;r.forceRenderingOff=true;continue;}
                    var old=r.sharedMaterials;original.Add(r,old);var replacement=new Material[old.Length];
                    for(int i=0;i<old.Length;i++)
                    {
                        var m=new Material(shader);owned.Add(m);if(old[i]!=null)m.CopyPropertiesFromMaterial(old[i]);
                        m.SetColor("_BaseColor",r==ground?Color.white:Color.black);
                        if(r==ground){m.SetTexture("_BaseMap",Texture2D.whiteTexture);m.SetFloat("_AlphaClip",0);m.DisableKeyword("_ALPHATEST_ON");}
                        replacement[i]=m;
                    }
                    r.sharedMaterials=replacement;
                }
                RenderSettings.fog=false;camera.backgroundColor=Color.black;
                var image=Render(camera,target,false,true);try{return image.GetPixels();}finally{Object.DestroyImmediate(image);}
            }
            finally
            {
                foreach(var item in original)if(item.Key!=null)item.Key.sharedMaterials=item.Value;
                foreach(var item in forced)if(item.Key!=null)item.Key.forceRenderingOff=item.Value;
                foreach(var m in owned)Object.DestroyImmediate(m);RenderSettings.fog=fog;camera.backgroundColor=bg;
            }
        }
        static Region Measure(string name,Color32[] beauty,Color[] diagnostic,Color[] mask,int width,int height,Rect roi)
        {
            var r=new Region{name=name,shadowMin=1};double sum=0,squares=0,sat=0,shadow=0,lambert=0;int over=0,dark=0;
            for(int y=Mathf.FloorToInt(roi.y*height);y<Mathf.CeilToInt((roi.y+roi.height)*height);y++)
            for(int x=Mathf.FloorToInt(roi.x*width);x<Mathf.CeilToInt((roi.x+roi.width)*width);x++)
            {
                int at=(height-1-y)*width+x;var m=mask[at];if(m.r<.999f||m.g<.999f||m.b<.999f)continue;
                var c=beauty[at];double v=.299*c.r+.587*c.g+.114*c.b;Color.RGBToHSV((Color)c,out _,out float s,out _);
                var d=diagnostic[at];r.pixels++;sum+=v;squares+=v*v;sat+=s;shadow+=d.r;lambert+=d.g;
                r.maxS=Mathf.Max(r.maxS,s);r.shadowMin=Mathf.Min(r.shadowMin,d.r);if(s>.30f)over++;if(d.r<.5f)dark++;
            }
            if(r.pixels==0)throw new InvalidOperationException("No visible ground pixels in "+name+"; no Y verdict can be made");
            double mean=sum/r.pixels;r.meanY=(float)mean;r.stdY=(float)Math.Sqrt(Math.Max(0,squares/r.pixels-mean*mean));
            r.meanS=(float)(sat/r.pixels);r.fractionSAbove030=(float)over/r.pixels;r.shadowMean=(float)(shadow/r.pixels);r.shadowBelowHalfFraction=(float)dark/r.pixels;r.lambertMean=(float)(lambert/r.pixels);return r;
        }
        static Shot CaptureShot(string name,string output,Material ground,Camera camera,RenderTexture beautyTarget,RenderTexture dataTarget,Color[] mask,Rect roi,bool post)
        {
            var shot=new Shot{name=name,values=new GroundValues(ground)};Texture2D image=null,diagnostic=null;
            try
            {
                ground.SetFloat("_LookDiagnostic",0);image=Render(camera,beautyTarget,post,false);File.WriteAllBytes(Path.Combine(output,name+".png"),image.EncodeToPNG());
                ground.SetFloat("_LookDiagnostic",1);diagnostic=Render(camera,dataTarget,false,true);
                var bytes=image.GetPixels32();var data=diagnostic.GetPixels();
                shot.regions.Add(Measure("all",bytes,data,mask,Width,Height,roi));
                for(int i=0;i<3;i++)shot.regions.Add(Measure(new[]{"left","centre","right"}[i],bytes,data,mask,Width,Height,new Rect(roi.x+roi.width*i/3,roi.y,roi.width/3,roi.height)));
                File.WriteAllText(Path.Combine(output,name+".json"),JsonUtility.ToJson(shot,true));return shot;
            }
            finally{ground.SetFloat("_LookDiagnostic",0);if(image!=null)Object.DestroyImmediate(image);if(diagnostic!=null)Object.DestroyImmediate(diagnostic);}
        }
        // NativeArenaOcclusion.Dispose uses delayed Destroy. Detach that callback and release its
        // owned data here in edit mode, then let the normal arena Dispose release the rest.
        static void DisposeEditorArena(NativeArena3DView arena)
        {
            if(arena==null)return;arena.SetActive(false);
            var field=typeof(NativeArena3DView).GetField("occlusion",Private);var occlusion=field.GetValue(arena);
            if(occlusion!=null)
            {
                var type=occlusion.GetType();var method=type.GetMethod("NearestPass",Private);
                var callback=(Action<ScriptableRenderContext,Camera>)Delegate.CreateDelegate(typeof(Action<ScriptableRenderContext,Camera>),occlusion,method);
                RenderPipelineManager.beginCameraRendering-=callback;
                var texture=type.GetField("nearest",Private).GetValue(occlusion) as RenderTexture;if(texture!=null){texture.Release();Object.DestroyImmediate(texture);}
                foreach(var material in (IEnumerable)type.GetField("owned",Private).GetValue(occlusion))Object.DestroyImmediate((Object)material);
                field.SetValue(arena,null);
            }
            arena.Dispose();
        }
        public static void VerifyMath()
        {
            // Uses the same reducer as real captures: black props must not lower the floor mean.
            var bytes=new[]{new Color32(80,80,80,255),new Color32(0,0,0,255),new Color32(70,70,70,255),new Color32(255,0,0,255)};
            var mask=new[]{Color.white,Color.black,Color.white,Color.black};var diagnostic=new[]{new Color(.25f,.7f,1),Color.black,new Color(.75f,.8f,1),Color.black};
            var r=Measure("fixture",bytes,diagnostic,mask,2,2,new Rect(0,0,1,1));
            if(r.pixels!=2||Mathf.Abs(r.meanY-75)>.0001f||Mathf.Abs(r.stdY-5)>.0001f||Mathf.Abs(r.shadowMean-.5f)>.0001f||Mathf.Abs(r.shadowBelowHalfFraction-.5f)>.0001f||r.meanS!=0)throw new InvalidOperationException("Look-shot reducer contract failed");
            if(Measure("top-left",bytes,diagnostic,mask,2,2,new Rect(0,0,.5f,.5f)).meanY!=70)throw new InvalidOperationException("Top-left ROI convention failed");
            bool emptyRejected=false;try{Measure("empty",bytes,diagnostic,new Color[4],2,2,new Rect(0,0,1,1));}catch(InvalidOperationException){emptyRejected=true;}
            if(!emptyRejected)throw new InvalidOperationException("Empty mask accepted");
            foreach(string value in new[]{"NaN","Infinity","-0.1","1.1","0,1"}){bool rejected=false;try{Numbers(value,1,1);}catch(ArgumentException){rejected=true;}if(!rejected)throw new InvalidOperationException("Bad candidate accepted: "+value);}
            if(Numbers("0.25,0.5,1",3,1)[1]!=.5f)throw new InvalidOperationException("Invariant parser failed");
            foreach(var invalid in new[]{new[]{"-output"},new[]{"-output","a","-output","b"}}){bool rejected=false;try{Value(invalid,"-output",true);}catch(ArgumentException){rejected=true;}if(!rejected)throw new InvalidOperationException("Missing/duplicate argument accepted");}
            Debug.Log("BOSS_ARENA_LOOKSHOT_MATH reducer/mask/variance/shadow/parser verified; no visual PASS");
        }
        public static void Capture()
        {
            if(!Application.isBatchMode||Application.isPlaying)throw new InvalidOperationException("Use an isolated batch Editor, outside Play mode");
            var args=Environment.GetCommandLineArgs();string output=Path.GetFullPath(Value(args,"-output",true));
            var fieldPath=Path.GetFullPath(Value(args,"-fieldReference",true));var posePath=Path.GetFullPath(Value(args,"-poseReference",true));
            var field=ReadReference(fieldPath);var pose=ReadReference(posePath);var a=Value(args,"-roi");var v=a==null?new[]{.15f,.20f,.70f,.65f}:Numbers(a,4,1);
            if(v[2]<=0||v[3]<=0||v[0]+v[2]>1||v[1]+v[3]>1)throw new ArgumentException("ROI must fit in normalized image bounds");
            if(Mathf.Abs(pose.rotation.x-Pitch)>.001f||Mathf.Abs(pose.rotation.y)>.001f||Mathf.Abs(pose.rotation.z)>.001f||Mathf.Abs(pose.fieldOfView-Fov)>.001f)throw new ArgumentException("Pose is outside the locked 34 degree/FOV camera");
            if(QualitySettings.activeColorSpace!=ColorSpace.Linear)throw new InvalidOperationException("Expected runtime Linear color space");
            if(!(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset))throw new InvalidOperationException("Expected the project URP pipeline");
            if(Mathf.Abs(NativeRemodelCamera.FieldOfView-Fov)>.001f||NativeArena3DCameraState.FieldDistance!=Distance||NativeArena3DCameraState.BossDistance!=Distance)throw new InvalidOperationException("Runtime camera contract changed; do not override it in this tool");
            Directory.CreateDirectory(output);foreach(string name in new[]{"before.png","before.json","after.png","after.json","look.json"}){string file=Path.Combine(output,name);if(File.Exists(file))File.Delete(file);}
            VerifyMath();var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            NativeArena3DView arena=null;VolumeProfile profile=null;GameObject root=null;RenderTexture beauty=null,data=null;Material candidate=null;
            float volume=AudioListener.volume;bool paused=AudioListener.pause;AudioListener.volume=0;AudioListener.pause=true;
            try
            {
                root=new GameObject("BossArenaLookShot transient map");profile=ReplayField(field.lighting,root.transform,out var sun);
                var camera=new GameObject("LookShot locked camera").AddComponent<Camera>();camera.transform.SetParent(root.transform,false);camera.enabled=false;camera.fieldOfView=Fov;camera.aspect=(float)Width/Height;camera.nearClipPlane=.3f;camera.farClipPlane=240;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.23f,.29f,.35f);
                camera.transform.SetPositionAndRotation(pose.marker+new Vector3(0,Mathf.Sin(Pitch*Mathf.Deg2Rad)*Distance,-Mathf.Cos(Pitch*Mathf.Deg2Rad)*Distance),Quaternion.Euler(Pitch,0,0));
                if(Vector3.Distance(camera.transform.position,pose.position)>.002f)throw new ArgumentException("Reference distance differs from locked 16.5");
                beauty=new RenderTexture(Width,Height,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB){antiAliasing=1};beauty.Create();
                data=new RenderTexture(Width,Height,24,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear){antiAliasing=1};data.Create();camera.targetTexture=beauty;
                var extra=camera.GetUniversalAdditionalCameraData();extra.renderShadows=true;extra.antialiasing=AntialiasingMode.None;extra.requiresDepthTexture=true;
                arena=new NativeArena3DView(root.transform,BossArenaLayout.Generate(0),camera);var work=arena.Prewarm();int steps=0;
                while(work.MoveNext())if(++steps>10000)throw new InvalidOperationException("Arena prewarm did not finish");
                if(!arena.Ready)throw new InvalidOperationException("Arena not ready");arena.SetActive(true);
                if(Mathf.Abs(sun.intensity-pose.lighting.moonIntensity)>.002f||Quaternion.Angle(sun.transform.rotation,Quaternion.Euler(pose.lighting.moonRotation))>.01f||Vector4.Distance(RenderSettings.ambientSkyColor,pose.lighting.ambientSky)>.002f||Vector4.Distance(RenderSettings.ambientEquatorColor,pose.lighting.ambientEquator)>.002f||Vector4.Distance(RenderSettings.ambientGroundColor,pose.lighting.ambientGround)>.002f)throw new InvalidOperationException("Runtime arena lighting differs from pose receipt; refresh reference pair");
                arena.Late(pose.marker-NativeRemodelCamera.TargetOffset); // Once: freeze occlusion/flicker for both shots.
                var ground=root.transform.Find("RB1-8 forest arena").GetComponent<MeshRenderer>();
                if(ShaderUtil.ShaderHasError(ground.sharedMaterial.shader)||!ground.sharedMaterial.shader.isSupported)throw new InvalidOperationException("Arena ground shader import/support failed");
                candidate=new Material(ground.sharedMaterial);bool hasCandidate=ApplyCandidates(args,candidate);
                var mask=ReceiverMask(camera,data,ground,root.transform);var receipt=new Receipt{fieldReference=fieldPath,poseReference=posePath,unityVersion=Application.unityVersion,colorSpace=QualitySettings.activeColorSpace.ToString(),qualityName=QualitySettings.names[QualitySettings.GetQualityLevel()],pipelineAsset=GraphicsSettings.currentRenderPipeline.name,graphicsDevice=SystemInfo.graphicsDeviceType.ToString(),position=camera.transform.position,marker=pose.marker,roi=new Rect(v[0],v[1],v[2],v[3]),fieldLighting=field.lighting,arenaSunIntensity=sun.intensity,arenaSunRotation=sun.transform.eulerAngles,arenaAmbientSky=RenderSettings.ambientSkyColor,arenaAmbientEquator=RenderSettings.ambientEquatorColor,arenaAmbientGround=RenderSettings.ambientGroundColor,surface=arena.CaptureSurface()};
                receipt.shots.Add(CaptureShot("before",output,ground.sharedMaterial,camera,beauty,data,mask,receipt.roi,field.lighting.cameraPost));
                if(hasCandidate){ground.sharedMaterial=candidate;receipt.shots.Add(CaptureShot("after",output,candidate,camera,beauty,data,mask,receipt.roi,field.lighting.cameraPost));}
                File.WriteAllText(Path.Combine(output,"look.json"),JsonUtility.ToJson(receipt,true));Debug.Log("BOSS_ARENA_LOOKSHOT measured="+receipt.shots.Count+" output="+output+" acceptance=CTO_PENDING");
            }
            finally
            {
                DisposeEditorArena(arena);if(root!=null)Object.DestroyImmediate(root);if(candidate!=null)Object.DestroyImmediate(candidate);
                if(profile!=null){foreach(var c in profile.components)Object.DestroyImmediate(c);Object.DestroyImmediate(profile);}
                if(beauty!=null){beauty.Release();Object.DestroyImmediate(beauty);}if(data!=null){data.Release();Object.DestroyImmediate(data);}
                AudioListener.volume=volume;AudioListener.pause=paused;
            }
        }
    }
}
