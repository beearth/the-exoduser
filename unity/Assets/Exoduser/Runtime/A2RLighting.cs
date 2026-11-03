using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // Presentation only. A2 geometry, camera, Core and actor drawing stay owned by their existing paths.
    [DefaultExecutionOrder(25000)]
    public sealed class A2RLighting : MonoBehaviour
    {
        sealed class LightState
        {
            public Light light;public Color color;public float intensity,range,strength,bias,normalBias;public Quaternion rotation;public bool enabled;public LightShadows shadows;
            public LightState(Light l){light=l;color=l.color;intensity=l.intensity;range=l.range;strength=l.shadowStrength;bias=l.shadowBias;normalBias=l.shadowNormalBias;rotation=l.transform.rotation;enabled=l.enabled;shadows=l.shadows;}
            public void Restore(){if(light==null)return;light.color=color;light.intensity=intensity;light.range=range;light.shadowStrength=strength;light.shadowBias=bias;light.shadowNormalBias=normalBias;light.transform.rotation=rotation;light.enabled=enabled;light.shadows=shadows;}
        }
        sealed class FogState{public Renderer renderer;public Material original,replacement;}
        readonly List<LightState> originalLights=new List<LightState>();
        readonly List<FogState> fog=new List<FogState>();
        readonly List<Light> lamps=new List<Light>();readonly List<float> powers=new List<float>();
        readonly List<Volume> sourceVolumes=new List<Volume>();readonly List<bool> volumeEnabled=new List<bool>();
        AmbientMode ambientMode;Color sky,equator,ground,ambient;Color background;Camera viewer;Light moon,heroRim,heroFill;GameObject effects;Volume tone;MeshRenderer contact;Func<Vector3> foot;
        bool originalFog;FogMode originalFogMode;Color originalFogColor;float originalFogDensity,originalFogStart,originalFogEnd;
        public bool Applied {get;private set;}
        public void Initialize(Transform world,Camera camera,IEnumerable<Light> lights,IEnumerable<Volume> volumes,Func<Vector3> heroFoot)
        {
            viewer=camera;foot=heroFoot;ambientMode=RenderSettings.ambientMode;sky=RenderSettings.ambientSkyColor;equator=RenderSettings.ambientEquatorColor;ground=RenderSettings.ambientGroundColor;ambient=RenderSettings.ambientLight;background=camera.backgroundColor;
            originalFog=RenderSettings.fog;originalFogMode=RenderSettings.fogMode;originalFogColor=RenderSettings.fogColor;originalFogDensity=RenderSettings.fogDensity;originalFogStart=RenderSettings.fogStartDistance;originalFogEnd=RenderSettings.fogEndDistance;
            var unique=new HashSet<Light>();foreach(var l in lights)if(l!=null&&unique.Add(l)){originalLights.Add(new LightState(l));if(l.type==LightType.Directional&&l.enabled)moon=l;if(l.name=="Hero cool edge")heroRim=l;if(l.name=="Hero neutral fill")heroFill=l;}
            foreach(var v in volumes)if(v!=null&&!sourceVolumes.Contains(v)){sourceVolumes.Add(v);volumeEnabled.Add(v.enabled);}
            foreach(var r in world.GetComponentsInChildren<Renderer>(true)){var m=r.sharedMaterial;if(m==null)continue;bool height=m.shader.name=="EXODUSER/A2HeightFog",shaft=m.shader.name=="EXODUSER/A2Atmosphere";if(!height&&!shaft)continue;var copy=new Material(height?Resources.Load<Shader>("A2R/DistanceHaze"):m.shader);copy.CopyPropertiesFromMaterial(m);if(height){copy.SetColor("_Color",new Color(.072f,.066f,.053f,1));copy.SetFloat("_Density",.002f);copy.SetFloat("_Start",34);copy.SetFloat("_Maximum",.05f);}else copy.SetColor("_Color",new Color(.62f,.61f,.57f,0));fog.Add(new FogState{renderer=r,original=m,replacement=copy});}
            effects=new GameObject("A2R1 C10 lighting only");effects.transform.SetParent(world,true);
            tone=new GameObject("A2R1 C10 color and depth").AddComponent<Volume>();tone.transform.SetParent(effects.transform,false);tone.isGlobal=true;tone.priority=150;
            var profile=ScriptableObject.CreateInstance<VolumeProfile>();profile.name="A2R1 Neutral C10 transfer";profile.Add<Tonemapping>(true).mode.Override(TonemappingMode.Neutral);
            // C10 card exposure/cyan moon over-brightened A2 water and erased its earth palette.
            var color=profile.Add<ColorAdjustments>(true);color.postExposure.Override(.80f);color.contrast.Override(0);color.saturation.Override(0);color.colorFilter.Override(Color.white);
            var balance=profile.Add<WhiteBalance>(true);balance.temperature.Override(16);balance.tint.Override(6);
            var split=profile.Add<SplitToning>(true);split.shadows.Override(new Color(.48f,.49f,.51f));split.highlights.Override(new Color(.53f,.51f,.48f));split.balance.Override(-15);
            var bloom=profile.Add<Bloom>(true);bloom.intensity.Override(.055f);bloom.threshold.Override(1.5f);bloom.scatter.Override(.5f);
            var depth=profile.Add<DepthOfField>(true);depth.mode.Override(DepthOfFieldMode.Gaussian);depth.gaussianStart.Override(24);depth.gaussianEnd.Override(38);depth.gaussianMaxRadius.Override(.25f);depth.highQualitySampling.Override(true);tone.sharedProfile=profile;
            var quad=GameObject.CreatePrimitive(PrimitiveType.Quad);quad.name="A2R1 short hero ground contact";Destroy(quad.GetComponent<Collider>());quad.transform.SetParent(effects.transform,true);contact=quad.GetComponent<MeshRenderer>();contact.sharedMaterial=new Material(Resources.Load<Shader>("Shaders/HD2DContact"));contact.sharedMaterial.SetFloat("_Opacity",1.25f);contact.shadowCastingMode=ShadowCastingMode.Off;contact.receiveShadows=false;
            SetLook(false);
        }
        public void AnchorCamp(Vector3 at){foreach(var l in lamps){if(l.name=="A2R1 C10 camp fire")l.transform.position=at+new Vector3(0,1.1f,-.6f);if(l.name=="A2R1 C10 camp glow"){l.transform.position=at+new Vector3(0,.8f,-1);Shader.SetGlobalVector("_A2RCampPositionRange",new Vector4(l.transform.position.x,l.transform.position.y,l.transform.position.z,l.range));}}}
        public A2RHeroReadability Readability {get;private set;} public void SetHeroSprite(SpriteRenderer sprite){Readability=effects.AddComponent<A2RHeroReadability>();Readability.Initialize(sprite,foot,viewer);}
        public void AddLamp(string id,Vector3 position,float radius,float power,Color color,bool castShadows=true)
        {
            var l=new GameObject(id).AddComponent<Light>();l.transform.SetParent(effects.transform,true);l.transform.position=position;l.type=LightType.Point;l.range=radius;l.intensity=power;l.color=color;l.shadows=castShadows?LightShadows.Soft:LightShadows.None;l.shadowStrength=.9f;l.shadowBias=.025f;l.shadowNormalBias=.04f;lamps.Add(l);powers.Add(power);if(id=="A2R1 C10 camp glow"){Shader.SetGlobalVector("_A2RCampPositionRange",new Vector4(position.x,position.y,position.z,radius));Shader.SetGlobalColor("_A2RCampRadiance",color*1.45f);}
        }
        public void SetLook(bool on)
        {
            Applied=on;foreach(var s in originalLights)s.Restore();for(int i=0;i<sourceVolumes.Count;i++)sourceVolumes[i].enabled=on?false:volumeEnabled[i];foreach(var f in fog)if(f.renderer!=null)f.renderer.sharedMaterial=on?f.replacement:f.original;
            RenderSettings.ambientMode=on?AmbientMode.Trilight:ambientMode;RenderSettings.ambientSkyColor=on?new Color(.105f,.100f,.090f):sky;RenderSettings.ambientEquatorColor=on?new Color(.075f,.070f,.058f):equator;RenderSettings.ambientGroundColor=on?new Color(.018f,.015f,.012f):ground;if(!on)RenderSettings.ambientLight=ambient;viewer.backgroundColor=on?new Color(.002f,.003f,.004f):background;
            RenderSettings.fog=on?false:originalFog;if(!on){RenderSettings.fogMode=originalFogMode;RenderSettings.fogColor=originalFogColor;RenderSettings.fogDensity=originalFogDensity;RenderSettings.fogStartDistance=originalFogStart;RenderSettings.fogEndDistance=originalFogEnd;}
            effects.SetActive(on);if(!on)return;
            foreach(var s in originalLights){var l=s.light;if(l.type==LightType.Directional&&l.enabled){l.color=new Color(.92f,.90f,.86f);l.intensity=.62f;l.transform.rotation=Quaternion.Euler(32,-44,0);l.shadows=LightShadows.Soft;l.shadowStrength=.9f;l.shadowBias=.025f;l.shadowNormalBias=.04f;RenderSettings.sun=l;}else if(l.type==LightType.Spot&&l.name.IndexOf("달빛",StringComparison.Ordinal)>=0){l.enabled=false;}else if(l.name=="A2 횃불 불꽃"){l.color=new Color(1,.40f,.10f);l.range=5.8f;l.intensity=9;l.shadowStrength=.9f;l.shadowBias=.025f;l.shadowNormalBias=.04f;}else if(l.name=="Hero neutral fill"){l.intensity=2.4f;l.color=new Color(.94f,.96f,1);}else if(l.name=="Hero cool edge"){l.color=new Color(.78f,.85f,.91f);l.intensity=2.2f;l.range=3.2f;}}
        }
        void LateUpdate()
        {
            if(!Applied||foot==null)return;
            // The shared HellLighting activation runs after A2R setup. Own the candidate's final atmosphere here.
            RenderSettings.fog=false;RenderSettings.ambientMode=AmbientMode.Trilight;RenderSettings.ambientSkyColor=new Color(.105f,.100f,.090f);RenderSettings.ambientEquatorColor=new Color(.075f,.070f,.058f);RenderSettings.ambientGroundColor=new Color(.018f,.015f,.012f);
            var p=foot();var away=moon!=null?moon.transform.forward:new Vector3(-.6f,0,.6f);away.y=0;away.Normalize();contact.transform.SetPositionAndRotation(p+Vector3.up*.018f+away*.09f,Quaternion.Euler(90,Mathf.Atan2(away.x,away.z)*Mathf.Rad2Deg,0));contact.transform.localScale=new Vector3(.78f,.42f,1);
            if(heroRim!=null)heroRim.transform.position=p-away*.85f+Vector3.up*1.4f;
            for(int i=0;i<lamps.Count;i++)lamps[i].intensity=powers[i]*(1+.035f*Mathf.Sin(Time.unscaledTime*4.7f+i*.9f)+.02f*Mathf.Sin(Time.unscaledTime*7.3f+i));
        }
        void OnDestroy(){foreach(var f in fog)if(f.replacement!=null)Destroy(f.replacement);if(tone!=null&&tone.sharedProfile!=null)Destroy(tone.sharedProfile);}
    }
}
