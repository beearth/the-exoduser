using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Original web flipbook, read-only Core observer. No gameplay clock or input writes.
    public sealed class NativeImpactView : IDisposable
    {
        sealed class Burst { public GameObject Go;public SpriteRenderer Sprite;public Light Light;public MaterialPropertyBlock Block=new MaterialPropertyBlock();public float Born=-10,Power;public bool Heavy; }
        sealed class Scar { public ImpactGroundPatch Patch;public float Born=-10; }
        static readonly HashSet<SpriteRenderer> owned=new HashSet<SpriteRenderer>();
        public static bool IsContactSprite(SpriteRenderer renderer)=>owned.Contains(renderer);
        readonly Transform parent;readonly Sprite[] frames=new Sprite[4];readonly Material material,scarFlat,scarGround;
        readonly Burst[] bursts=new Burst[8];readonly Scar[] scars=new Scar[8];
        readonly Dictionary<int,float> health=new Dictionary<int,float>();readonly HashSet<int> present=new HashSet<int>();readonly List<int> removed=new List<int>();
        readonly ImpactResponse response;Simulation bound;int observedTick=-1,scarIndex;float heroUntil;
        public int Contacts {get;private set;}public int Dropped {get;private set;}public int Spawned {get;private set;}
        public int PeakParticles=>0;public int FlipbookFrames {get;private set;}public int PeakSprites {get;private set;}
        public bool Enabled {get;set;}=true;public bool ReducedMotion {get;set;}public Camera RenderCamera {get;set;}
        public bool Ready=>frames[0]!=null&&material!=null;
        public bool HeroFrozen(float now)=>Enabled&&now<heroUntil;
        public bool EnemyFrozen(int id,float now)=>Enabled&&response.Frozen(id,now);
        public float Flash(int id,float now)=>Enabled?(float)response.Flash(id,now):0;
        public Vector2 CameraOffset(float now){if(!Enabled||ReducedMotion)return Vector2.zero;response.Camera(now,out var x,out var y);return new Vector2((float)x,(float)-y);}
        public NativeImpactView(Transform parent)
        {
            this.parent=parent;response=new ImpactResponse(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-impact-response-baseline")>=0);var sheet=Resources.Load<Texture2D>("Art/vfx/ki_slash_hit_silver_sheet");
            var shader=Resources.Load<Shader>("Shaders/KiSlashAdditive");
            if(sheet!=null&&sheet.width==1254&&sheet.height==1254&&shader!=null){material=new Material(shader);for(int i=0;i<4;i++)frames[i]=Sprite.Create(sheet,new Rect(i%2*627,1254-(i/2+1)*627,627,627),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);}
            scarFlat=Resources.Load<Material>("VFX/Impact/M_SkillFloor");scarGround=Resources.Load<Material>("VFX/Impact/M_SkillGround");
            if(!Ready)Debug.LogWarning("[임팩트] 웹 접점 원화 누락: 기존 타격 표시 유지");
        }
        public void Reset(){health.Clear();response.Reset();observedTick=-1;bound=null;heroUntil=0;Contacts=Dropped=Spawned=FlipbookFrames=PeakSprites=0;foreach(var b in bursts)if(b!=null){b.Go.SetActive(false);b.Born=-10;}foreach(var s in scars)if(s!=null){s.Patch.Hide();s.Born=-10;}}
        public void Observe(Simulation sim,float now)
        {
            if(!ReferenceEquals(bound,sim)){Reset();bound=sim;}
            Animate(now);if(sim==null||sim.TickCount==observedTick)return;observedTick=sim.TickCount;present.Clear();
            foreach(var e in sim.Enemies){present.Add(e.Id);float total=e.Hp+e.Shield;bool known=health.TryGetValue(e.Id,out var previous);
                if(Enabled&&Ready&&ImpactResponse.IsContact(known,previous,total,e.HurtTicks)){
                    float angle=e.KnockbackX*e.KnockbackX+e.KnockbackY*e.KnockbackY>.001f?Mathf.Atan2(e.KnockbackY,e.KnockbackX):Mathf.Atan2(e.Y-sim.Player.Y,e.X-sim.Player.X);
                    bool heavy=sim.KiComboStep==3||sim.Player.State.StartsWith("gSlam",StringComparison.Ordinal)||sim.Player.State=="sBash";
                    if(ImpactSpace.Visible(RenderCamera,ImpactSpace.Point(e.X,e.Y,.42f))&&response.Hit(e.Id,now,angle,heavy,false)){Contacts++;heroUntil=now+(float)response.FreezeSeconds;Spawn(e.X-Mathf.Cos(angle)*e.Radius*.4f,e.Y-Mathf.Sin(angle)*e.Radius*.4f,e.Y,angle,heavy,now);}
                }health[e.Id]=total;
            }
            removed.Clear();foreach(var id in health.Keys)if(!present.Contains(id))removed.Add(id);foreach(int id in removed)health.Remove(id);
        }
        void Spawn(float x,float y,float actorY,float angle,bool heavy,float now)
        {
            Burst b=null;int lights=0;foreach(var slot in bursts)if(slot!=null&&slot.Light.enabled)lights++;
            for(int i=0;i<bursts.Length;i++){
                if(bursts[i]==null){var go=new GameObject("웹 타격 원화 플립북");go.transform.SetParent(parent,false);var sr=go.AddComponent<SpriteRenderer>();sr.sharedMaterial=material;sr.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;sr.receiveShadows=false;owned.Add(sr);var light=go.AddComponent<Light>();light.type=LightType.Point;light.shadows=LightShadows.None;light.color=new Color(1,.68f,.34f);bursts[i]=new Burst{Go=go,Sprite=sr,Light=light};}
                if(now-bursts[i].Born>=.16f){b=bursts[i];break;}
            }
            if(b==null){Dropped++;return;}b.Born=now;b.Heavy=heavy;b.Go.SetActive(true);
            var world=ImpactSpace.Point(x,y,NativeRemodel3D.Active?.55f:.42f);if(RenderCamera!=null&&NativeRemodel3D.Active)world-=RenderCamera.transform.forward*.08f;
            b.Go.transform.SetPositionAndRotation(world,(RenderCamera!=null?RenderCamera.transform.rotation:Quaternion.identity)*Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg));
            b.Go.transform.localScale=Vector3.one*((heavy?1.35f:.95f)/6.27f);b.Sprite.sprite=frames[0];b.Sprite.enabled=true;b.Sprite.sortingOrder=SkillPresentation.ContactOrder(actorY);b.Block.SetFloat("_Opacity",1);b.Sprite.SetPropertyBlock(b.Block);
            b.Power=lights<2?(heavy?2.4f:1.5f):0;b.Light.enabled=b.Power>0&&!ReducedMotion;b.Light.intensity=b.Power;b.Light.range=heavy?1.8f:1.2f;Spawned++;
            if(scarFlat!=null&&scarGround!=null){int i=scarIndex++%scars.Length;var s=scars[i]??(scars[i]=new Scar{Patch=new ImpactGroundPatch(parent,scarFlat,-18999,scarGround)});var soot=new Color32(27,20,16,255);s.Patch.Draw(x,y,heavy?.4f:.24f,soot,soot,.35f,0);s.Born=now;}
        }
        void Animate(float now)
        {
            int active=0;foreach(var b in bursts)if(b!=null){float age=now-b.Born;bool alive=Enabled&&age>=0&&age<.16f;b.Sprite.enabled=alive;if(alive){int frame=Math.Min(3,(int)(age/.04f));b.Sprite.sprite=frames[frame];b.Block.SetFloat("_Opacity",SkillPresentation.ContactOpacity(age));b.Sprite.SetPropertyBlock(b.Block);active++;FlipbookFrames++;}b.Light.enabled=alive&&!ReducedMotion&&age<.08f&&b.Power>0;if(b.Light.enabled)b.Light.intensity=b.Power*Mathf.Clamp01(1-age/.08f);if(age>=.16f)b.Go.SetActive(false);}
            PeakSprites=Math.Max(PeakSprites,active);foreach(var s in scars)if(s!=null){float age=now-s.Born;s.Patch.Fade(.35f*Mathf.Clamp01((1.2f-age)/.8f));if(age>=1.2f)s.Patch.Hide();}
        }
        public void Dispose(){foreach(var b in bursts)if(b!=null){owned.Remove(b.Sprite);UnityEngine.Object.Destroy(b.Go);}foreach(var s in scars)if(s!=null)s.Patch.Dispose();foreach(var f in frames)if(f!=null)UnityEngine.Object.Destroy(f);if(material!=null)UnityEngine.Object.Destroy(material);}
    }
}
