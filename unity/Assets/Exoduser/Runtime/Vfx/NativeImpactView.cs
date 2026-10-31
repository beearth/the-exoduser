using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Read-only observer: no Core time, damage, input, RNG, displacement or save writes.
    public sealed class NativeImpactView : IDisposable
    {
        sealed class Burst { public GameObject Go; public VisualEffect Fx; public VFXEventAttribute Attr; public Renderer Render;public Light Light; public float Born=-10,Power; }
        sealed class Scar { public GameObject Go; public Material Mat,FlatMat; public DecalProjector Projector;public MeshRenderer Flat; public float Born=-10; }
        readonly Transform parent;
        readonly VisualEffectAsset asset;
        readonly Material scarBase,scarFlatBase;
        readonly Burst[] bursts=new Burst[8];
        readonly Scar[] scars=new Scar[8];
        readonly Dictionary<int,float> health=new Dictionary<int,float>();
        readonly HashSet<int> present=new HashSet<int>();
        readonly List<int> removed=new List<int>();
        readonly ImpactResponse response=new ImpactResponse();
        Simulation bound; int observedTick=-1,scarIndex; float heroUntil;
        public int Contacts {get;private set;}
        public int Dropped {get;private set;}
        public int Spawned {get;private set;}
        public int PeakParticles {get;private set;}
        public bool Enabled {get;set;}=true;
        public Camera RenderCamera {get;set;}
        public bool Ready {get{return asset!=null&&scarBase!=null&&scarFlatBase!=null;}}
        public bool HeroFrozen(float now) { return Enabled && now<heroUntil; }
        public bool EnemyFrozen(int id,float now) { return Enabled && response.Frozen(id,now); }
        public float Flash(int id,float now) { return Enabled?(float)response.Flash(id,now):0; }
        public Vector2 CameraOffset(float now) { if(!Enabled)return Vector2.zero; response.Camera(now,out var x,out var y);return new Vector2((float)x,(float)-y); }

        public NativeImpactView(Transform parent)
        {
            this.parent=parent;
            asset=Resources.Load<VisualEffectAsset>("VFX/Impact/VFX_ImpactBurst");
            scarBase=Resources.Load<Material>("VFX/Impact/M_ImpactScorch");
            scarFlatBase=Resources.Load<Material>("VFX/Impact/M_SkillFloor");
            if(!Ready)Debug.LogError("[임팩트] 필수 타격 Graph/Shader Graph 재질 누락, 기존 접점 표시 유지");
        }
        public void Reset()
        {
            health.Clear();response.Reset();observedTick=-1;bound=null;heroUntil=0;
            Contacts=Dropped=Spawned=PeakParticles=0;
            foreach(var b in bursts)if(b!=null){b.Go.SetActive(false);b.Born=-10;}
            foreach(var s in scars)if(s!=null){s.Go.SetActive(false);s.Born=-10;}
        }
        public void Observe(Simulation sim,float now)
        {
            if(!ReferenceEquals(bound,sim)){Reset();bound=sim;}
            Animate(now);
            if(sim==null||sim.TickCount==observedTick)return;
            observedTick=sim.TickCount;present.Clear();
            foreach(var e in sim.Enemies)
            {
                present.Add(e.Id);float total=e.Hp+e.Shield;
                bool known=health.TryGetValue(e.Id,out var previous);
                if(ImpactResponse.IsContact(known,previous,total,e.HurtTicks)&&Enabled&&Ready)
                {
                    float angle=e.KnockbackX*e.KnockbackX+e.KnockbackY*e.KnockbackY>.001f?Mathf.Atan2(e.KnockbackY,e.KnockbackX):Mathf.Atan2(e.Y-sim.Player.Y,e.X-sim.Player.X);
                    bool heavy=sim.KiComboStep==3||sim.Player.State.StartsWith("gSlam",StringComparison.Ordinal)||sim.Player.State=="sBash";
                    // Damage-over-time with no hurt flash gets residue, not a new weapon pause.
                    if(e.HurtTicks>0&&ImpactSpace.Visible(RenderCamera,ImpactSpace.Point(e.X,e.Y,.42f))&&response.Hit(e.Id,now,angle,heavy,false))
                    {
                        Contacts++;heroUntil=now+(float)response.FreezeSeconds;
                        Spawn(e.X-Mathf.Cos(angle)*e.Radius*.4f,e.Y-Mathf.Sin(angle)*e.Radius*.4f,e.Y,angle,heavy,now);
                    }
                }
                health[e.Id]=total;
            }
            removed.Clear();foreach(var id in health.Keys)if(!present.Contains(id))removed.Add(id);foreach(int id in removed)health.Remove(id);
        }
        static Gradient ContactGradient(bool shards)
        {
            var gradient=new Gradient();
            gradient.SetKeys(shards?new[]{new GradientColorKey(PoisonBurstPresets.Lin(0xffd9a0,1.2f),0),new GradientColorKey(PoisonBurstPresets.Lin(0x9a8a72,1),.18f),new GradientColorKey(PoisonBurstPresets.Lin(0x2a2220,1),1)}:new[]{new GradientColorKey(PoisonBurstPresets.Lin(0xfff4d0,4),0)},
                shards?new[]{new GradientAlphaKey(1,0),new GradientAlphaKey(.9f,.55f),new GradientAlphaKey(0,1)}:new[]{new GradientAlphaKey(.35f,0),new GradientAlphaKey(1,.08f),new GradientAlphaKey(1,.28f),new GradientAlphaKey(.225f,.5f),new GradientAlphaKey(0,1)});
            return gradient;
        }
        static readonly Gradient hotCore=ContactGradient(false),hotShards=ContactGradient(true);
        void Spawn(float x,float y,float actorY,float angle,bool heavy,float now)
        {
            if(asset==null)return;
            Burst b=null;int lights=0;
            foreach(var slot in bursts)if(slot!=null&&slot.Light.enabled)lights++;
            for(int i=0;i<bursts.Length;i++)
            {
                if(bursts[i]==null){
                    var go=new GameObject("접점 Impact Graph");go.transform.SetParent(parent,false);
                    var fx=go.AddComponent<VisualEffect>();fx.visualEffectAsset=asset;fx.playRate=1;
                    var light=go.AddComponent<Light>();light.type=LightType.Point;light.shadows=LightShadows.None;light.range=heavy?2.2f:1.5f;light.color=new Color(1,.68f,.34f);
                    bursts[i]=new Burst {Go=go,Fx=fx,Attr=fx.CreateVFXEventAttribute(),Render=go.GetComponent<Renderer>(),Light=light};
                }
                if(now-bursts[i].Born>=.9f){b=bursts[i];break;}
            }
            if(b==null){Dropped++;return;}
            b.Go.SetActive(true);b.Born=now;b.Fx.Reinit();
            var preset=new PoisonPreset {HdrCore=0xfff4d0,CoreHdr=4,CoreSize=heavy?.38f:.24f,
                PaletteMid=0x9a8a72,PaletteShadow=0x2a2220,ChunkSizeMin=.035f,ChunkSizeMax=heavy?.09f:.065f,ChunkSpeed=heavy?3.8f:2.8f,ChunkBias=.8f,
                MistSize=heavy?.8f:.5f,MistLifeMin=.35f,MistLifeMax=.65f,MistAlpha=.14f,TaintCount=0,TaintSize=.01f,TaintAlpha=0};
            var dir=new Vector2(Mathf.Cos(angle),-Mathf.Sin(angle));PoisonBurstPresets.Apply(b.Fx,preset,dir,1);
            if(b.Fx.HasGradient("CoreGradient"))b.Fx.SetGradient("CoreGradient",hotCore);
            if(b.Fx.HasGradient("ChunkGradient"))b.Fx.SetGradient("ChunkGradient",hotShards);
            ImpactSpace.Velocities(b.Fx,preset,dir);
            var world=ImpactSpace.Point(x,y,.42f);b.Go.transform.position=world;
            if(b.Render!=null)b.Render.sortingOrder=SkillPresentation.ContactOrder(actorY);
            if(b.Attr.HasVector3("position"))b.Attr.SetVector3("position",world);
            if(b.Attr.HasVector3("direction"))b.Attr.SetVector3("direction",new Vector3(dir.x,0,dir.y));
            b.Fx.SendEvent("OnBurst",b.Attr);
            Spawned++;
            b.Light.enabled=lights<2;b.Power=heavy?3:2;b.Light.intensity=b.Power;b.Light.range=heavy?2.2f:1.5f;
            SpawnScar(x,y,angle,heavy,now);
        }
        void SpawnScar(float x,float y,float angle,bool heavy,float now)
        {
            if(scarBase==null)return;
            int index=scarIndex++%scars.Length;var s=scars[index];
            if(s==null){var go=new GameObject("타격 그을음");go.transform.SetParent(parent,false);var m=new Material(scarBase);var p=go.AddComponent<DecalProjector>();p.material=m;p.pivot=Vector3.zero;s=scars[index]=new Scar{Go=go,Mat=m,Projector=p};}
            float radius=heavy?.5f:.28f,box=radius*2+.12f;
            if(!NativeRemodel3D.Active)
            {
                s.Projector.enabled=false;
                if(s.Flat==null){var go=new GameObject("2D 타격 그을음");go.transform.SetParent(s.Go.transform,false);go.AddComponent<MeshFilter>().sharedMesh=ImpactSpace.FloorQuad;s.Flat=go.AddComponent<MeshRenderer>();s.FlatMat=new Material(scarFlatBase);s.Flat.sharedMaterial=s.FlatMat;s.Flat.sortingOrder=-18999;s.Flat.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;}
                s.Flat.enabled=true;s.Flat.transform.localScale=Vector3.one*(radius*2);s.FlatMat.SetColor("_FillColor",new Color32(27,20,16,255));s.FlatMat.SetColor("_EdgeColor",new Color32(27,20,16,255));s.FlatMat.SetFloat("_EdgeGlow",0);s.FlatMat.SetFloat("_Fade",.6f);
                s.Go.transform.SetPositionAndRotation(ImpactSpace.Point(x,y,.12f),ImpactSpace.FloorRotation*Quaternion.Euler(0,angle*Mathf.Rad2Deg,0));s.Go.SetActive(true);s.Born=now;return;
            }
            if(s.Flat!=null)s.Flat.enabled=false;s.Projector.enabled=true;
            s.Mat.SetFloat("_Shape",0);s.Mat.SetFloat("_Progress",1);s.Mat.SetFloat("_Radius",radius);s.Mat.SetFloat("_SizeX",box);s.Mat.SetFloat("_SizeY",box);s.Mat.SetFloat("_EdgeGlow",0);s.Mat.SetFloat("_Flash",0);
            s.Mat.SetColor("_FillColor",new Color32(27,20,16,255));s.Projector.size=new Vector3(box,box,.3f);s.Projector.fadeFactor=.6f;
            s.Go.transform.SetPositionAndRotation(RemodelWorld.ToWorld(x,y,.12f),Quaternion.Euler(90,angle*Mathf.Rad2Deg,0));s.Go.SetActive(true);s.Born=now;
        }
        void Animate(float now)
        {
            int particles=0;
            foreach(var b in bursts)if(b!=null){particles+=b.Fx.aliveParticleCount;float age=now-b.Born;if(age>.1f)b.Light.enabled=false;else b.Light.intensity=Mathf.Max(0,1-age/.1f)*b.Power;if(age>=.9f)b.Go.SetActive(false);}
            PeakParticles=Math.Max(PeakParticles,particles);
            foreach(var s in scars)if(s!=null){float age=now-s.Born,fade=.6f*Mathf.Clamp01((2-age)/1.2f);s.Projector.fadeFactor=fade;if(s.FlatMat!=null)s.FlatMat.SetFloat("_Fade",fade);if(age>=2)s.Go.SetActive(false);}
        }
        public void Dispose(){foreach(var b in bursts)if(b!=null){b.Attr.Dispose();UnityEngine.Object.Destroy(b.Go);}foreach(var s in scars)if(s!=null){UnityEngine.Object.Destroy(s.Mat);if(s.FlatMat!=null)UnityEngine.Object.Destroy(s.FlatMat);UnityEngine.Object.Destroy(s.Go);}}
    }
}
