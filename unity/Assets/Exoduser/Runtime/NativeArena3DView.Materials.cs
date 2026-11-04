using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeArena3DView
    {
        const float TorchHeight=1.4f;
        // Presentation constants for the arena RETOUCH (docs UNITY_BOSS_RIGPIXEL_DRUID_PREP section 10.3). Core pillar geometry and the camera are untouched.
        const float GroundTintR=.66f,GroundTintG=.56f,GroundTintB=.50f,GroundSaturationKeep=.62f,GroundFlatten=.45f;
        const float TorchIntensity=5.5f,TorchRange=4f;
        const float SunIntensityScale=.65f,SunPitch=48f,AmbientScale=.8f;
        readonly List<SpriteRenderer> torchFlames=new List<SpriteRenderer>();
        readonly List<Light> torchLights=new List<Light>();
        readonly List<Sprite> torchFrames=new List<Sprite>();
        static readonly HashSet<SpriteRenderer> arenaFlames=new HashSet<SpriteRenderer>();
        Material groundMaterial,channelMaterial;
        readonly Material sourceWater;
        Mesh channelMesh;
        int channelCells;
        public static bool IsArenaFlame(SpriteRenderer sprite){return arenaFlames.Contains(sprite);}
        static Texture2D RequiredTexture(string path)
        {
            var texture=Resources.Load<Texture2D>(path);
            if(texture==null)throw new InvalidOperationException("Arena8b texture missing: "+path);
            return texture;
        }
        Material CreateGroundMaterial()
        {
            var shader=Resources.Load<Shader>("Arena8b/Ground");
            if(shader==null)throw new InvalidOperationException("Arena8b ground shader missing");
            var material=new Material(shader){name="Arena8b A2R earth and roots"};
            materials.Add(material);
            foreach(string suffix in new[]{"A","B"})
            {
                string tile=suffix=="A"?"r3_ground_2_4":"r3_ground_3_4";
                string path="Arena8b/Textures/"+tile;
                material.SetTexture("_Paint"+suffix,RequiredTexture(path));
                material.SetTexture("_Normal"+suffix,RequiredTexture(path+"_normal"));
                material.SetTexture("_Mask"+suffix,RequiredTexture(path+"_mask"));
            }
            // B1/B2 (arena RETOUCH 11-04): dark brown-red ground like the 1-1 field, desaturated, painted contrast pulled toward the tile mean.
            material.SetColor("_Tint",new Color(GroundTintR,GroundTintG,GroundTintB,1));material.SetFloat("_Sat",GroundSaturationKeep);material.SetFloat("_Flat",GroundFlatten);material.SetFloat("_Dark",1);
            material.SetTexture("_Soil",RequiredTexture("Art/map/a2/ground/A2_ForestSoil_BaseColor"));
            material.SetTexture("_Roots",RequiredTexture("Art/map/a2/ground/A2_ExposedRoots_BaseColor"));
            groundMaterial=material;
            return material;
        }
        void CreateTorches()
        {
            var source=Asset("RF3_Bridge_Torch_Holder");
            var sheet=RequiredTexture("Art/map/hell_lighting/torch_flame");
            var shader=Resources.Load<Shader>("Shaders/KiSlashAdditive");
            if(shader==null)throw new InvalidOperationException("Arena8b flame shader missing");
            var fire=new Material(shader){name="Arena8b torch flame"};fire.SetFloat("_Opacity",1);materials.Add(fire);
            for(int i=0;i<8;i++)torchFrames.Add(Sprite.Create(sheet,new Rect(i%4*(sheet.width/4),(1-i/4)*(sheet.height/2),sheet.width/4,sheet.height/2),new Vector2(.5f,.12f),100,0,SpriteMeshType.FullRect));
            int index=0;
            foreach(var anchor in NativeArena3DPlan.Torches(layout))
            {
                var at=new Vector3(anchor.X,anchor.Y,anchor.Z);
                // Y is up; the old 2D -90 degree holder rotation is not used here.
                Place(source,"RB1-8b upright Torch",at,index*180,.55f,TorchHeight);
                var go=new GameObject("RB1-8b torch flame");go.transform.SetParent(root.transform,false);
                go.transform.position=at+Vector3.up*(TorchHeight*.9f);
                go.transform.localScale=Vector3.one*(.65f/torchFrames[0].bounds.size.y);
                var flame=go.AddComponent<SpriteRenderer>();flame.sharedMaterial=fire;flame.sprite=torchFrames[0];flame.color=new Color(1.8f,1.15f,.65f,1);torchFlames.Add(flame);arenaFlames.Add(flame);
                var lightObject=new GameObject("RB1-8b Pool_Hell torch "+index);lightObject.transform.SetParent(root.transform,false);lightObject.transform.position=at+Vector3.up*(TorchHeight+.15f);
                var lamp=lightObject.AddComponent<Light>();lamp.type=LightType.Point;lamp.color=new Color(1,.55f,.24f);lamp.intensity=TorchIntensity;lamp.range=TorchRange;lamp.shadows=LightShadows.None;torchLights.Add(lamp);
                index++;
            }
        }
        void CreateChannel()
        {
            var shader=sourceWater!=null?sourceWater.shader:Shader.Find("EXODUSER/A2ToxicRiver");
            if(shader==null)throw new InvalidOperationException("Arena8b toxic river shader missing");
            channelMaterial=sourceWater!=null?new Material(sourceWater):new Material(shader);
            channelMaterial.name="Arena8b field toxic river, local wall mask";
            channelMaterial.SetFloat("_ShoreReady",0); // The field distance map is not the arena boundary.
            channelMaterial.SetMatrix("_PlanarVP",Matrix4x4.identity); // Keep disabled reflection UV math finite.
            channelMaterial.SetFloat("_PlanarStrength",0); // Never reflect the old field camera image into this room.
            materials.Add(channelMaterial);
            var vertices=new List<Vector3>();var triangles=new List<int>();
            var cells=Exoduser.UnityPort.Remodel.ArenaChannelPlan.Build(layout);channelCells=cells.Length;
            foreach(int cell in cells)
            {
                float x=(cell%Core.BossArenaLayout.Width)*NativeArena3DPlan.Tile,z=-(cell/Core.BossArenaLayout.Width)*NativeArena3DPlan.Tile,t=NativeArena3DPlan.Tile;int at=vertices.Count;
                vertices.AddRange(new[]{new Vector3(x,.02f,z),new Vector3(x+t,.02f,z),new Vector3(x+t,.02f,z-t),new Vector3(x,.02f,z-t)});
                triangles.AddRange(new[]{at,at+1,at+2,at,at+2,at+3});
            }
            channelMesh=new Mesh{name="Arena8b Core exterior one-tile toxic channel"};channelMesh.SetVertices(vertices);channelMesh.SetTriangles(triangles,0);channelMesh.RecalculateNormals();channelMesh.RecalculateBounds();
            var go=new GameObject("RB1-8b exterior toxic water");go.transform.SetParent(root.transform,false);go.layer=4;
            var filter=go.AddComponent<MeshFilter>();filter.sharedMesh=channelMesh;var renderer=go.AddComponent<MeshRenderer>();renderer.sharedMaterial=channelMaterial;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=true;
            camera.cullingMask|=1<<4;NativeGroundSkillProjection.RegisterWaterReceiver(filter);
        }
        void TorchLate()
        {
            for(int i=0;i<torchFlames.Count;i++)
            {
                var flame=torchFlames[i];if(flame==null)continue;
                flame.sprite=torchFrames[((int)(Time.unscaledTime*12)+i*3)%8];
                flame.transform.rotation=camera.transform.rotation;
                // Same Pool_Hell mean intensity, restrained continuous flicker.
                torchLights[i].intensity=TorchIntensity*(1+.035f*Mathf.Sin(Time.unscaledTime*4.7f+i*.9f)+.02f*Mathf.Sin(Time.unscaledTime*7.3f+i));
            }
        }
        [Serializable] public sealed class TorchReceipt {public Vector3 position;public Color color;public float intensity,range;public string shadows;}
        [Serializable] public sealed class SurfaceReceipt
        {
            public bool active;public int channelCells;public string waterShader;public string shader,source="A2R 3967a7562fee303d0a362e20b617d86a538f183b, r3_ground_2_4/3_4 + original normals/masks; existing A2 soil/roots";
            public float patchMetres=10,normalStrength=.35f;public List<TorchReceipt> torches=new List<TorchReceipt>();
        }
        public SurfaceReceipt CaptureSurface()
        {
            var receipt=new SurfaceReceipt{active=root.activeInHierarchy,shader=groundMaterial==null?"":groundMaterial.shader.name,channelCells=channelCells,waterShader=channelMaterial==null?"":channelMaterial.shader.name};
            foreach(var lamp in torchLights)receipt.torches.Add(new TorchReceipt{position=lamp.transform.position,color=lamp.color,intensity=lamp.intensity,range=lamp.range,shadows=lamp.shadows.ToString()});
            return receipt;
        }
        // B3: arena-only sun and ambient. The field values are saved on entry and restored on exit; Core and the camera are not touched.
        struct SunState{public Light Light;public float Intensity;public Quaternion Rotation;}
        readonly List<SunState> sunSaved=new List<SunState>();
        Color ambSky,ambEquator,ambGround;bool lightingOn;
        void ApplyArenaLighting(bool on)
        {
            if(on==lightingOn)return;
            lightingOn=on;
            if(on)
            {
                sunSaved.Clear();
                foreach(var l in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None))
                {
                    if(l==null||l.type!=LightType.Directional||!l.isActiveAndEnabled)continue;
                    sunSaved.Add(new SunState{Light=l,Intensity=l.intensity,Rotation=l.transform.rotation});
                    var e=l.transform.eulerAngles;l.intensity*=SunIntensityScale;l.transform.rotation=Quaternion.Euler(SunPitch,e.y,e.z);
                }
                ambSky=RenderSettings.ambientSkyColor;ambEquator=RenderSettings.ambientEquatorColor;ambGround=RenderSettings.ambientGroundColor;
                RenderSettings.ambientSkyColor=ambSky*AmbientScale;RenderSettings.ambientEquatorColor=ambEquator*AmbientScale;RenderSettings.ambientGroundColor=ambGround*AmbientScale;
            }
            else
            {
                foreach(var s in sunSaved)if(s.Light!=null){s.Light.intensity=s.Intensity;s.Light.transform.rotation=s.Rotation;}
                sunSaved.Clear();
                RenderSettings.ambientSkyColor=ambSky;RenderSettings.ambientEquatorColor=ambEquator;RenderSettings.ambientGroundColor=ambGround;
            }
        }
        // B7: smooth radial contact shadow under each pillar (no noise, no dither), created after the occlusion pass so it stays a plain transparent sprite.
        readonly List<SpriteRenderer> pillarAo=new List<SpriteRenderer>();
        Sprite aoSprite;Texture2D aoTexture;
        void CreatePillarAo(int count)
        {
            const int n=64;
            aoTexture=new Texture2D(n,n,TextureFormat.RGBA32,false){name="Arena pillar AO",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            for(int y=0;y<n;y++)for(int x=0;x<n;x++)
            {
                float d=Mathf.Sqrt(((x+.5f)/n*2-1)*((x+.5f)/n*2-1)+((y+.5f)/n*2-1)*((y+.5f)/n*2-1));
                float a=Mathf.Pow(1-Mathf.SmoothStep(0,1,d),1.4f);
                aoTexture.SetPixel(x,y,new Color(.012f,.010f,.008f,a));
            }
            aoTexture.Apply(false,true);
            aoSprite=Sprite.Create(aoTexture,new Rect(0,0,n,n),new Vector2(.5f,.5f),n);
            for(int i=0;i<count;i++)
            {
                var go=new GameObject("Arena pillar base AO");go.transform.SetParent(root.transform,false);
                go.transform.rotation=Quaternion.Euler(90,0,0);
                var sr=go.AddComponent<SpriteRenderer>();sr.sprite=aoSprite;sr.color=new Color(1,1,1,.78f);sr.sortingOrder=-19000;sr.shadowCastingMode=ShadowCastingMode.Off;sr.receiveShadows=false;sr.enabled=false;
                pillarAo.Add(sr);
            }
        }
        void SyncPillarAo(int index,bool on,float x,float z,float radius)
        {
            if(index>=pillarAo.Count)return;
            var sr=pillarAo[index];sr.enabled=on;if(!on)return;
            sr.transform.position=new Vector3(x,.035f,z);
            float d=radius*2*1.9f; // roots spread past the Core radius; judgement radius is unchanged
            sr.transform.localScale=new Vector3(d,d,1);
        }
        void DisposeTorches()
        {
            ApplyArenaLighting(false);
            if(aoSprite!=null)ReleaseArenaObject(aoSprite);
            if(aoTexture!=null)ReleaseArenaObject(aoTexture);
            foreach(var flame in torchFlames)arenaFlames.Remove(flame);
            if(channelMesh!=null)ReleaseArenaObject(channelMesh);
            foreach(var frame in torchFrames)ReleaseArenaObject(frame);
        }
    }
}
