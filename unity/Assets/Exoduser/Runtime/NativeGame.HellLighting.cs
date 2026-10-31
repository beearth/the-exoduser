using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        public static bool HellAtmosphereEnabled { get; private set; }
        int hellDiagnosticFilter;
        Material hellActorMaterial; Light hellHeroRim;
        readonly List<SpriteRenderer> hellFlames=new List<SpriteRenderer>();
        Sprite[] hellFlameFrames;
        AmbientMode hellOldAmbient; Color hellOldSky,hellOldEquator,hellOldGround,hellOldFog; bool hellOldFogOn; float hellOldFogDensity,hellOldFogStart,hellOldFogEnd; FogMode hellOldFogMode;
        void HellLightingSetup()
        {
            hellOldAmbient=RenderSettings.ambientMode;hellOldSky=RenderSettings.ambientSkyColor;hellOldEquator=RenderSettings.ambientEquatorColor;hellOldGround=RenderSettings.ambientGroundColor;
            hellOldFogOn=RenderSettings.fog;hellOldFog=RenderSettings.fogColor;hellOldFogDensity=RenderSettings.fogDensity;hellOldFogMode=RenderSettings.fogMode;
            hellOldFogStart=RenderSettings.fogStartDistance;hellOldFogEnd=RenderSettings.fogEndDistance;
            foreach(var root in r3Roots)
            {
                foreach(var v in root.GetComponentsInChildren<Volume>(true))
                {
                    var profile=v.profile;if(profile==null)continue;hellProfile=profile;
                    if(!profile.TryGet<Tonemapping>(out var tm))tm=profile.Add<Tonemapping>();tm.mode.Override(TonemappingMode.ACES);
                    if(!profile.TryGet<ColorAdjustments>(out var tone))tone=profile.Add<ColorAdjustments>();
                    tone.postExposure.Override(.25f);tone.contrast.Override(16);tone.saturation.Override(-8);tone.colorFilter.Override(Color.white);
                    if(!profile.TryGet<SplitToning>(out var split))split=profile.Add<SplitToning>();split.shadows.Override(new Color(.43f,.48f,.54f));split.highlights.Override(new Color(.55f,.51f,.46f));split.balance.Override(-12);
                    if(!profile.TryGet<Bloom>(out var bloom))bloom=profile.Add<Bloom>();bloom.threshold.Override(1.1f);bloom.intensity.Override(.16f);bloom.scatter.Override(.48f);
                    if(profile.TryGet<Vignette>(out var vignette)){vignette.color.Override(new Color(.008f,.012f,.018f));vignette.intensity.Override(.13f);vignette.smoothness.Override(.65f);}
                    if(profile.TryGet<FilmGrain>(out var grain))grain.active=false;
                }
                foreach(var t in root.GetComponentsInChildren<Transform>(true))if(t.name=="Shafts"||t.name=="Foreground Cards"||t.name=="Background Cards")Destroy(t.gameObject);
                foreach(var l in root.GetComponentsInChildren<Light>(true))
                {
                    if(l.type==LightType.Directional){l.color=new Color(.85f,.89f,1f);l.intensity=1f;l.shadows=LightShadows.Soft;l.shadowStrength=.85f;l.transform.rotation=Quaternion.Euler(62,35,0);}
                    else if(l.name.StartsWith("Pool_Hell",StringComparison.Ordinal)){l.color=new Color(1f,.60f,.28f);l.intensity=5f;l.range=4.7f;l.shadows=LightShadows.Soft;l.shadowStrength=.8f;l.shadowBias=.025f;l.shadowNormalBias=.1f;}
                    else{l.intensity*=.6f;}
                }
            }
            var g=NativeRemodel3D.Ground;
            if(g!=null)
            {
                // Editor Play 검수가 공유 TerrainData 에셋의 레이어를 저장하지 않게 격리한다.
                if(Application.isEditor)g.terrainData=Instantiate(g.terrainData);
                var layers=g.terrainData.terrainLayers;for(int i=0;i<layers.Length;i++){layers[i]=Instantiate(layers[i]);layers[i].normalScale=.55f;layers[i].smoothness=i==0?.24f:.22f;layers[i].specular=new Color(.12f,.12f,.12f);}
                g.terrainData.terrainLayers=layers;
                HellGroundSetup(g);
                if(!A2Requested)HellEnvironmentSetup(g);
            }
            foreach(var root in r3Roots)if(root!=null)foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))if(renderer.name!="지옥 바닥 PBR 표면"&&(hellEnvironment==null||!renderer.transform.IsChildOf(hellEnvironment.transform))){renderer.shadowCastingMode=ShadowCastingMode.Off;var mat=renderer.sharedMaterial;if(mat!=null&&(mat.name.Contains("RottenWoodMembrane")||mat.name.Contains("CursedBark")||renderer.name.StartsWith("Decals_root",StringComparison.Ordinal)))renderer.enabled=false;}
            hellActorMaterial=new Material(Shader.Find("EXODUSER/SpriteLit3D"));hellActorMaterial.SetFloat("_Ambient",.3f);hellActorMaterial.SetFloat("_NormalTilt",.4f);
            var rim=new GameObject("영웅 차가운 림광");rim.transform.SetParent(r3Marker,false);rim.transform.localPosition=new Vector3(-.3f,1.8f,.6f);
            hellHeroRim=rim.AddComponent<Light>();hellHeroRim.type=LightType.Point;hellHeroRim.color=new Color(.68f,.8f,1f);hellHeroRim.range=3.5f;hellHeroRim.intensity=2.2f;
            var heroSpot=new GameObject("영웅 달빛 웅덩이");heroSpot.transform.SetParent(r3Marker,false);heroSpot.transform.localPosition=new Vector3(0,4,0);heroSpot.transform.localRotation=Quaternion.Euler(90,0,0);
            var spot=heroSpot.AddComponent<Light>();spot.type=LightType.Spot;spot.color=new Color(.72f,.84f,1);spot.intensity=14;spot.range=7;spot.spotAngle=58;spot.innerSpotAngle=40;spot.shadows=LightShadows.Soft;spot.shadowStrength=.65f;spot.shadowNormalBias=.1f;
            var sheet=Resources.Load<Texture2D>("Art/map/hell_lighting/torch_flame");
            if(sheet!=null){hellFlameFrames=new Sprite[8];for(int i=0;i<8;i++)hellFlameFrames[i]=Sprite.Create(sheet,new Rect(i%4*(sheet.width/4),(1-i/4)*(sheet.height/2),sheet.width/4,sheet.height/2),new Vector2(.5f,.12f),100);}
            var brazier=Resources.Load<GameObject>("Art/map/keyshot/brazier");
            if(brazier!=null&&hellFlameFrames!=null&&g!=null)
            {
                var root=new GameObject("실제 철제 지옥불 화로");UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(root,r3Scene);root.transform.SetParent(g.transform.parent,true);
                var iron=new Material(Shader.Find("Universal Render Pipeline/Lit"));iron.SetColor("_BaseColor",new Color(.15f,.17f,.20f));iron.SetFloat("_Metallic",.8f);iron.SetFloat("_Smoothness",.45f);
                foreach(var tile in new[]{new Vector2(95,183),new Vector2(109,174),new Vector2(100,156),new Vector2(112,142),new Vector2(80.5f,152.5f)})
                {
                    float x=tile.x*.4f,z=-tile.y*.4f;var pos=new Vector3(x,NativeRemodel3D.GroundY(x,z),z);
                    var holder=Instantiate(brazier,root.transform);holder.transform.SetPositionAndRotation(pos,Quaternion.identity);
                    foreach(var sr in holder.GetComponentsInChildren<MeshRenderer>()){sr.sharedMaterial=iron;sr.shadowCastingMode=ShadowCastingMode.On;sr.receiveShadows=true;}
                    var flame=new GameObject("지옥불");flame.transform.SetParent(root.transform,false);flame.transform.SetPositionAndRotation(pos+Vector3.up*.74f,Quaternion.Euler(NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0));flame.transform.localScale=Vector3.one*.14f;
                    var fr=flame.AddComponent<SpriteRenderer>();fr.sprite=hellFlameFrames[0];fr.color=new Color(1.5f,1.2f,1,1);hellFlames.Add(fr);
                }
            }else Debug.LogError("[키샷] 실제 화로 리소스 누락");
            A2ForestSetup(g);
        }
        void HellLightingActive(bool on)
        {
            HellAtmosphereEnabled=on;
            if(hellActorMaterial!=null)hellActorMaterial.SetFloat("_Ambient",on?.3f:.85f);
            RenderSettings.ambientMode=on?AmbientMode.Trilight:hellOldAmbient;
            RenderSettings.ambientSkyColor=on?new Color(.18f,.20f,.24f):hellOldSky;RenderSettings.ambientEquatorColor=on?new Color(.09f,.115f,.15f):hellOldEquator;RenderSettings.ambientGroundColor=on?new Color(.04f,.045f,.055f):hellOldGround;
            RenderSettings.fog=on||hellOldFogOn;RenderSettings.fogMode=on?FogMode.ExponentialSquared:hellOldFogMode;RenderSettings.fogColor=on?new Color(.035f,.065f,.085f):hellOldFog;RenderSettings.fogDensity=on?.023f:hellOldFogDensity;
            RenderSettings.fogStartDistance=hellOldFogStart;RenderSettings.fogEndDistance=hellOldFogEnd;
            if(on&&A2Requested)
            {
                A2Ambient();
                RenderSettings.fogColor=new Color(.105f,.145f,.17f);RenderSettings.fogMode=FogMode.Linear;RenderSettings.fogStartDistance=19;RenderSettings.fogEndDistance=62;
            }
        }
        void HellLightingLate()
        {
            if(hellActorMaterial==null)return;
            if(playerView!=null){playerView.sharedMaterial=hellActorMaterial;playerView.shadowCastingMode=ShadowCastingMode.On;playerView.receiveShadows=true;}
            foreach(var e in enemies.Values)foreach(var sr in new[]{e.body,e.walk})if(sr!=null){sr.sharedMaterial=hellActorMaterial;sr.shadowCastingMode=ShadowCastingMode.On;sr.receiveShadows=true;}
            for(int i=0;i<hellFlames.Count;i++)if(hellFlames[i]!=null)hellFlames[i].sprite=hellFlameFrames[((int)(Time.time*12)+i*3)%8];
            if(hellDiagnosticFilter>=1)foreach(var renderer in FindObjectsByType<MeshRenderer>(FindObjectsSortMode.None))renderer.enabled=false;
            if(hellDiagnosticFilter>=2)foreach(var renderer in FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None))if(renderer!=playerView)renderer.enabled=false;
            if(hellDiagnosticFilter>=3)NativeRemodel3D.Ground.drawHeightmap=false;
        }
    }
}
