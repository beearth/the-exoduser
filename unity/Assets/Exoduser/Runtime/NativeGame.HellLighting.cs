using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        Material hellActorMaterial; Light hellHeroRim;
        readonly List<SpriteRenderer> hellFlames=new List<SpriteRenderer>();
        Sprite[] hellFlameFrames;
        AmbientMode hellOldAmbient; Color hellOldSky,hellOldEquator,hellOldGround,hellOldFog; bool hellOldFogOn; float hellOldFogDensity; FogMode hellOldFogMode;
        void HellLightingSetup()
        {
            hellOldAmbient=RenderSettings.ambientMode;hellOldSky=RenderSettings.ambientSkyColor;hellOldEquator=RenderSettings.ambientEquatorColor;hellOldGround=RenderSettings.ambientGroundColor;
            hellOldFogOn=RenderSettings.fog;hellOldFog=RenderSettings.fogColor;hellOldFogDensity=RenderSettings.fogDensity;hellOldFogMode=RenderSettings.fogMode;
            foreach(var root in r3Roots)
            {
                foreach(var v in root.GetComponentsInChildren<Volume>(true))
                {
                    var profile=v.profile;if(profile==null)continue;hellProfile=profile;
                    if(!profile.TryGet<Tonemapping>(out var tm))tm=profile.Add<Tonemapping>();tm.mode.Override(TonemappingMode.ACES);
                    if(!profile.TryGet<ColorAdjustments>(out var tone))tone=profile.Add<ColorAdjustments>();
                    tone.postExposure.Override(-.15f);tone.contrast.Override(16);tone.saturation.Override(-8);tone.colorFilter.Override(Color.white);
                    if(!profile.TryGet<SplitToning>(out var split))split=profile.Add<SplitToning>();split.shadows.Override(new Color(.43f,.48f,.54f));split.highlights.Override(new Color(.55f,.51f,.46f));split.balance.Override(-12);
                    if(!profile.TryGet<Bloom>(out var bloom))bloom=profile.Add<Bloom>();bloom.threshold.Override(1.1f);bloom.intensity.Override(.16f);bloom.scatter.Override(.48f);
                    if(profile.TryGet<Vignette>(out var vignette)){vignette.color.Override(new Color(.008f,.012f,.018f));vignette.intensity.Override(.13f);vignette.smoothness.Override(.65f);}
                    if(profile.TryGet<FilmGrain>(out var grain))grain.active=false;
                }
                foreach(var t in root.GetComponentsInChildren<Transform>(true))if(t.name=="Shafts")t.gameObject.SetActive(false);
                foreach(var l in root.GetComponentsInChildren<Light>(true))
                {
                    if(l.type==LightType.Directional){l.color=new Color(.61f,.74f,1f);l.intensity=.7f;l.shadows=LightShadows.Soft;l.shadowStrength=.85f;}
                    else if(l.name.StartsWith("Pool_Hell",StringComparison.Ordinal)){l.color=new Color(1f,.32f,.075f);l.intensity=11f;l.range=4.7f;l.shadows=LightShadows.Soft;l.shadowStrength=.8f;l.shadowBias=.025f;l.shadowNormalBias=.1f;}
                    else{l.intensity*=.6f;}
                }
            }
            var g=NativeRemodel3D.Ground;
            if(g!=null)
            {
                var layers=g.terrainData.terrainLayers;for(int i=0;i<layers.Length;i++){layers[i]=Instantiate(layers[i]);layers[i].normalScale=.8f;layers[i].smoothness=i==0?.32f:.22f;layers[i].specular=new Color(.12f,.12f,.12f);}
                g.terrainData.terrainLayers=layers;
            }
            hellActorMaterial=new Material(Shader.Find("EXODUSER/SpriteLit3D"));hellActorMaterial.SetFloat("_Ambient",.22f);hellActorMaterial.SetFloat("_NormalTilt",.4f);
            var rim=new GameObject("영웅 차가운 림광");rim.transform.SetParent(r3Marker,false);rim.transform.localPosition=new Vector3(-.3f,1.8f,.6f);
            hellHeroRim=rim.AddComponent<Light>();hellHeroRim.type=LightType.Point;hellHeroRim.color=new Color(.53f,.72f,1f);hellHeroRim.range=3.5f;hellHeroRim.intensity=3.2f;
            var sheet=Resources.Load<Texture2D>("Art/map/hell_lighting/torch_flame");
            if(sheet!=null){hellFlameFrames=new Sprite[8];for(int i=0;i<8;i++)hellFlameFrames[i]=Sprite.Create(sheet,new Rect(i%4*(sheet.width/4),(1-i/4)*(sheet.height/2),sheet.width/4,sheet.height/2),new Vector2(.5f,.12f),100);}
            var baseTex=Resources.Load<Texture2D>("Art/map/hell_lighting/torch_base");
            if(baseTex!=null&&hellFlameFrames!=null)
            {
                var root=new GameObject("지옥불 광원 기구");UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(root,r3Scene);root.transform.SetParent(g.transform.parent,true);
                var baseSprite=Sprite.Create(baseTex,new Rect(0,0,baseTex.width,baseTex.height),new Vector2(.5f,.05f),100);
                foreach(var tile in new[]{new Vector2(95,183),new Vector2(109,174),new Vector2(100,156),new Vector2(112,142),new Vector2(80.5f,152.5f)})
                {
                    float x=tile.x*.4f,z=-tile.y*.4f;var pos=new Vector3(x,NativeRemodel3D.GroundY(x,z),z);
                    var holder=new GameObject("지옥불 받침");holder.transform.SetParent(root.transform,false);holder.transform.SetPositionAndRotation(pos,Quaternion.Euler(NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0));holder.transform.localScale=Vector3.one*(2.6f/(baseTex.height/100f));
                    var sr=holder.AddComponent<SpriteRenderer>();sr.sprite=baseSprite;sr.sharedMaterial=hellActorMaterial;sr.shadowCastingMode=ShadowCastingMode.On;sr.receiveShadows=true;
                    var flame=new GameObject("지옥불");flame.transform.SetParent(root.transform,false);flame.transform.SetPositionAndRotation(pos+holder.transform.up*1.5f+Vector3.right*.55f,holder.transform.rotation);flame.transform.localScale=Vector3.one*.22f;
                    var fr=flame.AddComponent<SpriteRenderer>();fr.sprite=hellFlameFrames[0];fr.color=new Color(2.1f,1.7f,1.25f,1);hellFlames.Add(fr);
                }
            }
        }
        void HellLightingActive(bool on)
        {
            RenderSettings.ambientMode=on?AmbientMode.Trilight:hellOldAmbient;
            RenderSettings.ambientSkyColor=on?new Color(.10f,.14f,.21f):hellOldSky;RenderSettings.ambientEquatorColor=on?new Color(.065f,.085f,.12f):hellOldEquator;RenderSettings.ambientGroundColor=on?new Color(.025f,.032f,.045f):hellOldGround;
            RenderSettings.fog=on||hellOldFogOn;RenderSettings.fogMode=on?FogMode.ExponentialSquared:hellOldFogMode;RenderSettings.fogColor=on?new Color(.035f,.065f,.085f):hellOldFog;RenderSettings.fogDensity=on?.023f:hellOldFogDensity;
        }
        void HellLightingLate()
        {
            if(hellActorMaterial==null)return;
            if(playerView!=null){playerView.sharedMaterial=hellActorMaterial;playerView.shadowCastingMode=ShadowCastingMode.On;playerView.receiveShadows=true;}
            foreach(var e in enemies.Values)foreach(var sr in new[]{e.body,e.walk})if(sr!=null){sr.sharedMaterial=hellActorMaterial;sr.shadowCastingMode=ShadowCastingMode.On;sr.receiveShadows=true;}
            for(int i=0;i<hellFlames.Count;i++)if(hellFlames[i]!=null)hellFlames[i].sprite=hellFlameFrames[((int)(Time.time*12)+i*3)%8];
        }
    }
}
