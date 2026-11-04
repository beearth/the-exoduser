using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Read-only Core observer for the struck-body reaction. G1 11-04: the silver ki-slash flipbook and the soot patch are gone
    // (CombatImpactView draws the one element hit); what stays is the 2-tick hold, the white flash and a heavy-hit point light.
    public sealed class NativeImpactView : IDisposable
    {
        sealed class Burst { public GameObject Go;public Light Light;public float Born=-10,Power; }
        static readonly HashSet<SpriteRenderer> owned=new HashSet<SpriteRenderer>();
        public static bool IsContactSprite(SpriteRenderer renderer)=>owned.Contains(renderer);
        readonly Transform parent;
        readonly Burst[] bursts=new Burst[8];
        readonly Dictionary<int,float> health=new Dictionary<int,float>();readonly HashSet<int> present=new HashSet<int>();readonly List<int> removed=new List<int>();
        readonly ImpactResponse response;Simulation bound;int observedTick=-1;float heroUntil;
        public int Contacts {get;private set;}public int Dropped {get;private set;}public int Spawned {get;private set;}
        public int PeakParticles=>0;public int FlipbookFrames=>0;public int PeakSprites=>0;
        public bool Enabled {get;set;}=true;public bool ReducedMotion {get;set;}public Camera RenderCamera {get;set;}
        public bool Ready=>true;
        public bool HeroFrozen(float now)=>Enabled&&now<heroUntil;
        public bool EnemyFrozen(int id,float now)=>Enabled&&response.Frozen(id,now);
        public float Flash(int id,float now)=>Enabled?(float)response.Flash(id,now):0;
        public Vector2 CameraOffset(float now){if(!Enabled||ReducedMotion)return Vector2.zero;response.Camera(now,out var x,out var y);return new Vector2((float)x,(float)-y);}
        public NativeImpactView(Transform parent)
        {
            this.parent=parent;response=new ImpactResponse(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-impact-response-baseline")>=0);
        }
        public void Reset(){health.Clear();response.Reset();observedTick=-1;bound=null;heroUntil=0;Contacts=Dropped=Spawned=0;foreach(var b in bursts)if(b!=null){b.Go.SetActive(false);b.Born=-10;}}
        public void Observe(Simulation sim,float now)
        {
            if(!ReferenceEquals(bound,sim)){Reset();bound=sim;}
            Animate(now);if(sim==null||sim.TickCount==observedTick)return;observedTick=sim.TickCount;present.Clear();
            foreach(var e in sim.Enemies){present.Add(e.Id);float total=e.Hp+e.Shield;bool known=health.TryGetValue(e.Id,out var previous);
                if(Enabled&&ImpactResponse.IsContact(known,previous,total,e.HurtTicks)){
                    float angle=e.KnockbackX*e.KnockbackX+e.KnockbackY*e.KnockbackY>.001f?Mathf.Atan2(e.KnockbackY,e.KnockbackX):Mathf.Atan2(e.Y-sim.Player.Y,e.X-sim.Player.X);
                    bool heavy=sim.KiComboStep==3||sim.Player.State.StartsWith("gSlam",StringComparison.Ordinal)||sim.Player.State=="sBash"||e.IsBoss;
                    if(ImpactSpace.Visible(RenderCamera,ImpactSpace.Point(e.X,e.Y,.42f))&&response.Hit(e.Id,now,angle,heavy,false)){Contacts++;heroUntil=now+(float)response.FreezeSeconds;Spawn(e.X-Mathf.Cos(angle)*e.Radius*.4f,e.Y-Mathf.Sin(angle)*e.Radius*.4f,heavy,now);}
                }health[e.Id]=total;
            }
            removed.Clear();foreach(var id in health.Keys)if(!present.Contains(id))removed.Add(id);foreach(int id in removed)health.Remove(id);
        }
        // Only heavy contacts (3rd ki hit, ground slam, bash, boss) get the warm point light, two at a time.
        void Spawn(float x,float y,bool heavy,float now)
        {
            Spawned++;if(!heavy||ReducedMotion)return;
            Burst b=null;int lights=0;foreach(var slot in bursts)if(slot!=null&&slot.Light.enabled)lights++;
            if(lights>=2){Dropped++;return;}
            for(int i=0;i<bursts.Length;i++){
                if(bursts[i]==null){var go=new GameObject("접점 점광원");go.transform.SetParent(parent,false);var light=go.AddComponent<Light>();light.type=LightType.Point;light.shadows=LightShadows.None;light.color=new Color(1,.68f,.34f);bursts[i]=new Burst{Go=go,Light=light};}
                if(now-bursts[i].Born>=.16f){b=bursts[i];break;}
            }
            if(b==null){Dropped++;return;}b.Born=now;b.Go.SetActive(true);
            var world=ImpactSpace.Point(x,y,NativeRemodel3D.Active?.55f:.42f);if(RenderCamera!=null&&NativeRemodel3D.Active)world-=RenderCamera.transform.forward*.08f;
            b.Go.transform.position=world;b.Power=2.4f;b.Light.enabled=true;b.Light.intensity=b.Power;b.Light.range=1.8f;
        }
        void Animate(float now)
        {
            foreach(var b in bursts)if(b!=null){float age=now-b.Born;bool alive=Enabled&&age>=0&&age<.08f&&b.Power>0&&!ReducedMotion;b.Light.enabled=alive;if(alive)b.Light.intensity=b.Power*Mathf.Clamp01(1-age/.08f);if(age>=.16f)b.Go.SetActive(false);}
        }
        public void Dispose(){foreach(var b in bursts)if(b!=null)UnityEngine.Object.Destroy(b.Go);}
    }
}
