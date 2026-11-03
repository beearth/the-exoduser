using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static bool BossArenaMaterialReviewRequested {get{return Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-boss-arena-material-review")>=0;}}
        bool arenaMaterialShot;float arenaMaterialVisibleAt=-1;
        [Serializable] sealed class Arena8bTone
        {
            public string volume,tonemapping;public string profileEntity;public float weight,exposure,contrast,saturation,bloom;public Color colorFilter;
        }
        [Serializable] sealed class Arena8bLighting
        {
            public string scope="Existing field lights and live post profiles, no arena replacement profile";
            public string moonEntity;public string moon;public Vector3 moonRotation;public Color moonColor;public float moonIntensity;public string moonShadows;
            public bool cameraPost,fog;public string fogMode;public float fogStart,fogEnd;public Color ambientSky,ambientEquator,ambientGround;
            public List<Arena8bTone> profiles=new List<Arena8bTone>();
        }
        Arena8bLighting BossArenaCaptureLighting()
        {
            var result=new Arena8bLighting{cameraPost=r3Cam!=null&&r3Cam.GetUniversalAdditionalCameraData().renderPostProcessing,fog=RenderSettings.fog,fogMode=RenderSettings.fogMode.ToString(),fogStart=RenderSettings.fogStartDistance,fogEnd=RenderSettings.fogEndDistance,ambientSky=RenderSettings.ambientSkyColor,ambientEquator=RenderSettings.ambientEquatorColor,ambientGround=RenderSettings.ambientGroundColor};
            if(r3Roots==null)return result;
            foreach(var sceneRoot in r3Roots)
            {
                if(sceneRoot==null)continue;
                foreach(var lamp in sceneRoot.GetComponentsInChildren<Light>(true))
                    if(lamp.type==LightType.Directional&&lamp.isActiveAndEnabled){result.moonEntity=lamp.GetEntityId().ToString();result.moon=lamp.name;result.moonRotation=lamp.transform.eulerAngles;result.moonColor=lamp.color;result.moonIntensity=lamp.intensity;result.moonShadows=lamp.shadows.ToString();}
                foreach(var volume in sceneRoot.GetComponentsInChildren<Volume>(true))
                {
                    if(!volume.isActiveAndEnabled||volume.profile==null)continue;
                    var profile=volume.profile;var tone=new Arena8bTone{volume=volume.name,profileEntity=profile.GetEntityId().ToString(),weight=volume.weight};
                    ColorAdjustments color;if(profile.TryGet<ColorAdjustments>(out color)){tone.exposure=color.postExposure.value;tone.contrast=color.contrast.value;tone.saturation=color.saturation.value;tone.colorFilter=color.colorFilter.value;}
                    Tonemapping mapping;if(profile.TryGet<Tonemapping>(out mapping))tone.tonemapping=mapping.mode.value.ToString();
                    Bloom bloom;if(profile.TryGet<Bloom>(out bloom))tone.bloom=bloom.intensity.value;
                    result.profiles.Add(tone);
                }
            }
            return result;
        }
        IEnumerator BossArenaMaterialFieldReference()
        {
            if(!BossArenaMaterialReviewRequested||arenaReviewOutput==null)yield break;
            float deadline=Time.realtimeSinceStartup+60;
            // Pause ordinary QA input before its first simulation tick. No hero teleport/HP edits.
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady||Simulation.Stage.InArena){Debug.LogWarning("ARENA8B field reference unavailable; material receipt must remain FAIL");yield break;}
            for(int i=0;i<4;i++){UpdateViews();yield return null;}
            if(!arenaReviewMetricsOnly){QueueArenaReviewShot("material-field-reference");yield return new WaitForEndOfFrame();yield return null;}
        }
        void BossArenaMaterialLate()
        {
            if(!BossArenaMaterialReviewRequested||arenaReviewMetricsOnly||arenaMaterialShot)return;
            bool visible=NativeRemodel3D.ArenaActive&&Simulation.Stage.LoadPhase==0&&r3Cam!=null&&r3Cam.isActiveAndEnabled;
            if(!visible){arenaMaterialVisibleAt=-1;return;}
            if(arenaMaterialVisibleAt<0)arenaMaterialVisibleAt=Time.unscaledTime;
            if(Time.unscaledTime-arenaMaterialVisibleAt<2)return;
            arenaMaterialShot=true;QueueArenaReviewShot("material-arena-reference");
        }
        void BossArenaMaterialEnd(List<string> missing)
        {
            if(!BossArenaMaterialReviewRequested||arenaReviewMetricsOnly)return;
            foreach(var name in new[]{"material-field-reference","material-arena-reference"})
                foreach(var suffix in new[]{".png",".json"})if(!File.Exists(Path.Combine(arenaReviewOutput,name+suffix)))missing.Add(name+suffix);
            const string html="<!doctype html><meta charset='utf-8'><title>Arena8b same-build comparison</title><style>body{margin:20px;background:#17191b;color:#ddd;font:16px Georgia}section{display:flex;gap:16px;overflow:auto}figure{margin:0;flex:1;min-width:0}img{max-width:100%;height:auto}body.native figure{flex:none;min-width:auto}body.native img{max-width:none}button{margin:0 8px 16px 0}p{max-width:1000px}</style><h1>Arena8b: field / arena</h1><p>Same Player build and fixed resolution. Inspect the JSON for actual camera pose, moon/profile instance IDs, torch positions and surface source. Visual verdict pending. Fit view scales images; native view preserves one image pixel per screen pixel at browser zoom 100%.</p><button onclick='document.body.classList.remove(&quot;native&quot;)'>Fit</button><button onclick='document.body.classList.add(&quot;native&quot;)'>Native 1x</button><section><figure><figcaption>Field 34 degrees - <a href='material-field-reference.json'>receipt</a></figcaption><img src='material-field-reference.png'></figure><figure><figcaption>Arena 34 degrees - <a href='material-arena-reference.json'>receipt</a></figcaption><img src='material-arena-reference.png'></figure></section>";
            File.WriteAllText(Path.Combine(arenaReviewOutput,"material-comparison.html"),html);
        }
    }
}
