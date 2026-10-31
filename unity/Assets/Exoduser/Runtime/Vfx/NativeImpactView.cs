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
        sealed class Burst { public GameObject Go; public VisualEffect Fx; public VFXEventAttribute Attr; public Light Light; public float Born=-10; }
        sealed class Scar { public GameObject Go; public Material Mat; public DecalProjector Projector; public float Born=-10; }
        readonly Transform parent;
        readonly VisualEffectAsset asset;
        readonly Material scarBase;
        readonly Burst[] bursts=new Burst[8];
        readonly Scar[] scars=new Scar[8];
        readonly Dictionary<int,float> health=new Dictionary<int,float>();
        readonly HashSet<int> present=new HashSet<int>();
        readonly List<int> removed=new List<int>();
        readonly ImpactResponse response=new ImpactResponse();
        Simulation bound; int observedTick=-1,scarIndex; float heroUntil;
        public int Contacts {get;private set;}
        public int Dropped {get;private set;}
        public bool Enabled {get;set;}=true;
        public bool HeroFrozen(float now) { return Enabled && now<heroUntil; }
        public bool EnemyFrozen(int id,float now) { return Enabled && response.Frozen(id,now); }
        public float Flash(int id,float now) { return Enabled?(float)response.Flash(id,now):0; }
        public Vector2 CameraOffset(float now) { if(!Enabled)return Vector2.zero; response.Camera(now,out var x,out var y);return new Vector2((float)x,(float)-y); }

        public NativeImpactView(Transform parent)
        {
            this.parent=parent;
            asset=Resources.Load<VisualEffectAsset>("VFX/Impact/VFX_ImpactBurst");
            scarBase=Resources.Load<Material>("VFX/Impact/M_ImpactScorch");
            if(asset==null||scarBase==null)Debug.LogError("[임팩트] 필수 타격 Graph/Shader Graph 재질 누락");
        }
        public void Reset()
        {
            health.Clear();response.Reset();observedTick=-1;bound=null;heroUntil=0;
            Contacts=Dropped=0;
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
                if(ImpactResponse.IsContact(known,previous,total,e.HurtTicks)&&Enabled)
                {
                    float angle=e.KnockbackX*e.KnockbackX+e.KnockbackY*e.KnockbackY>.001f?Mathf.Atan2(e.KnockbackY,e.KnockbackX):Mathf.Atan2(e.Y-sim.Player.Y,e.X-sim.Player.X);
                    bool heavy=sim.KiComboStep==3||sim.Player.State.StartsWith("gSlam",StringComparison.Ordinal)||sim.Player.State=="sBash";
                    // Damage-over-time with no hurt flash gets residue, not a new weapon pause.
                    if(e.HurtTicks>0&&response.Hit(e.Id,now,angle,heavy,false))
                    {
                        Contacts++;heroUntil=now+(float)response.FreezeSeconds;
                        if(NativeRemodel3D.Active)Spawn(e.X-Mathf.Cos(angle)*e.Radius*.4f,e.Y-Mathf.Sin(angle)*e.Radius*.4f,angle,heavy,now);
                    }
                }
                health[e.Id]=total;
            }
            removed.Clear();foreach(var id in health.Keys)if(!present.Contains(id))removed.Add(id);foreach(int id in removed)health.Remove(id);
        }
        void Spawn(float x,float y,float angle,bool heavy,float now)
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
                    bursts[i]=new Burst {Go=go,Fx=fx,Attr=fx.CreateVFXEventAttribute(),Light=light};
                }
                if(now-bursts[i].Born>=.9f){b=bursts[i];break;}
            }
            if(b==null){Dropped++;return;}
            b.Go.SetActive(true);b.Born=now;b.Fx.Reinit();
            var preset=new PoisonPreset {HdrCore=0xfff4d0,CoreHdr=4,CoreSize=heavy?.38f:.24f,
                PaletteMid=0x9a8a72,PaletteShadow=0x2a2220,ChunkSizeMin=.035f,ChunkSizeMax=heavy?.09f:.065f,ChunkSpeed=heavy?3.8f:2.8f,ChunkBias=.8f,
                MistSize=heavy?.8f:.5f,MistLifeMin=.35f,MistLifeMax=.65f,MistAlpha=.14f,TaintCount=0,TaintSize=.01f,TaintAlpha=0};
            var dir=new Vector2(Mathf.Cos(angle),-Mathf.Sin(angle));PoisonBurstPresets.Apply(b.Fx,preset,dir,1);
            var world=RemodelWorld.ToWorld(x,y,.42f);b.Go.transform.position=world;
            if(b.Attr.HasVector3("position"))b.Attr.SetVector3("position",world);
            if(b.Attr.HasVector3("direction"))b.Attr.SetVector3("direction",new Vector3(dir.x,0,dir.y));
            b.Fx.SendEvent("OnBurst",b.Attr);
            b.Light.enabled=lights<2;b.Light.intensity=heavy?3:2;
            SpawnScar(x,y,angle,heavy,now);
        }
        void SpawnScar(float x,float y,float angle,bool heavy,float now)
        {
            if(scarBase==null)return;
            int index=scarIndex++%scars.Length;var s=scars[index];
            if(s==null){var go=new GameObject("타격 그을음");go.transform.SetParent(parent,false);var m=new Material(scarBase);var p=go.AddComponent<DecalProjector>();p.material=m;p.pivot=Vector3.zero;s=scars[index]=new Scar{Go=go,Mat=m,Projector=p};}
            float radius=heavy?.5f:.28f,box=radius*2+.12f;
            s.Mat.SetFloat("_Shape",0);s.Mat.SetFloat("_Progress",1);s.Mat.SetFloat("_Radius",radius);s.Mat.SetFloat("_SizeX",box);s.Mat.SetFloat("_SizeY",box);s.Mat.SetFloat("_EdgeGlow",0);s.Mat.SetFloat("_Flash",0);
            s.Mat.SetColor("_FillColor",new Color32(27,20,16,255));s.Projector.size=new Vector3(box,box,2);s.Projector.fadeFactor=.6f;
            s.Go.transform.SetPositionAndRotation(RemodelWorld.ToWorld(x,y,.2f),Quaternion.Euler(90,angle*Mathf.Rad2Deg,0));s.Go.SetActive(true);s.Born=now;
        }
        void Animate(float now)
        {
            foreach(var b in bursts)if(b!=null){float age=now-b.Born;if(age>.1f)b.Light.enabled=false;else b.Light.intensity=Mathf.Max(0,1-age/.1f)*3;if(age>=.9f)b.Go.SetActive(false);}
            foreach(var s in scars)if(s!=null){float age=now-s.Born;s.Projector.fadeFactor=.6f*Mathf.Clamp01((2-age)/1.2f);if(age>=2)s.Go.SetActive(false);}
        }
        public void Dispose(){foreach(var b in bursts)if(b!=null){b.Attr.Dispose();UnityEngine.Object.Destroy(b.Go);}foreach(var s in scars)if(s!=null){UnityEngine.Object.Destroy(s.Mat);UnityEngine.Object.Destroy(s.Go);}}
    }
}
