using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    public static class ImpactSpace
    {
        static Mesh quad;
        public static Quaternion FloorRotation {get{return NativeRemodel3D.Active?Quaternion.identity:Quaternion.Euler(-90,0,0);}}
        public static Vector3 Point(float x,float y,float lift=0){return NativeRemodel3D.Active?RemodelWorld.ToWorld(x,y,lift):NativeRemodel3D.Point(x,y)+Vector3.back*lift;}
        public static bool Visible(Camera camera,Vector3 world)
        {
            if(camera==null)return true;
            if(!camera.enabled||(camera.cullingMask&1)==0)return false;
            var p=camera.WorldToViewportPoint(world);
            return p.z>=camera.nearClipPlane&&p.z<=camera.farClipPlane&&SkillPresentation.VisibleViewport(p.x,p.y,p.z);
        }
        public static void Velocities(VisualEffect fx,PoisonPreset preset,Vector2 dir)
        {
            if(NativeRemodel3D.Active)return;
            PoisonBurstPresets.ChunkBox(preset,dir,1,out var min,out var max);
            var a=FloorRotation*min;var b=FloorRotation*max;
            if(fx.HasVector3("ChunkVelMin"))fx.SetVector3("ChunkVelMin",Vector3.Min(a,b));
            if(fx.HasVector3("ChunkVelMax"))fx.SetVector3("ChunkVelMax",Vector3.Max(a,b));
        }
        public static Mesh FloorQuad
        {
            get{if(quad!=null)return quad;quad=new Mesh{name="XY/XZ 임팩트 바닥"};quad.vertices=new[]{new Vector3(-.5f,0,-.5f),new Vector3(-.5f,0,.5f),new Vector3(.5f,0,.5f),new Vector3(.5f,0,-.5f)};quad.uv=new[]{Vector2.zero,Vector2.up,Vector2.one,Vector2.right};quad.triangles=new[]{0,1,2,0,2,3};quad.RecalculateNormals();quad.RecalculateBounds();return quad;}
        }
    }
    // Only reads Core objects. Geometry, Graph events and point lights share the Core
    // position/radius; no collider, input, random stream, life or damage is written.
    public sealed class NativeSkillRemaster : IDisposable
    {
        sealed class Handle
        {
            public GameObject Go; public Transform[] Parts;
            public MaterialPropertyBlock Block=new MaterialPropertyBlock();
            public ImpactGroundPatch Patch;
            public Light Light; public int Seen; public float Last=-99;
            public int Kind;
        }
        sealed class Puff { public GameObject Go; public VisualEffect Fx; public VFXEventAttribute Attr; public Renderer Render;public float Born=-99; }
        readonly Transform parent;
        readonly Material matter,ground,flat;
        readonly VisualEffectAsset graph;
        readonly Mesh crystal,thorn,crescent,orb;
        readonly Dictionary<string,Handle> live=new Dictionary<string,Handle>();
        readonly Stack<Handle> free=new Stack<Handle>();
        readonly List<string> stale=new List<string>();
        readonly Puff[] puffs=new Puff[12];
        readonly HashSet<BossProjectile> drawn=new HashSet<BossProjectile>();
        readonly HashSet<string> seenSkills=new HashSet<string>();
        readonly Queue<Vector3> blasts=new Queue<Vector3>();int blastSerial;
        Simulation bound; int frame,events,lights; bool wasActive;
        public static NativeSkillRemaster Current {get;private set;}
        public bool Enabled=true;
        public Camera RenderCamera {get;set;}
        public bool Active {get{return Enabled&&Ready;}}
        public bool Ready {get{return matter!=null&&ground!=null&&flat!=null&&graph!=null;}}
        public int GraphEvents {get;private set;}
        public int PeakHandles {get;private set;}
        public int PoisonFrames {get;private set;}
        public int ThornFrames {get;private set;}
        public int DarkFrames {get;private set;}
        public string[] SeenSkills {get{var a=new string[seenSkills.Count];seenSkills.CopyTo(a);return a;}}
        public bool Drawn(BossProjectile p) {return Active&&drawn.Contains(p);}

        public NativeSkillRemaster(Transform parent)
        {
            this.parent=parent;Current=this;
            matter=Resources.Load<Material>("VFX/Impact/M_SkillMatter");
            ground=Resources.Load<Material>("VFX/Impact/M_SkillGround");
            flat=Resources.Load<Material>("VFX/Impact/M_SkillFloor");
            graph=Resources.Load<VisualEffectAsset>("VFX/Impact/VFX_SkillMatter");
            crystal=Crystal(false);thorn=Crystal(true);crescent=Crescent();orb=Orb();
            if(!Ready)Debug.LogError("[임팩트] 스킬 Graph/바닥/물질 재질 누락");
        }
        static Mesh Crystal(bool spike)
        {
            var vs=new List<Vector3>();var ts=new List<int>();
            // Flat triangle normals preserve a chipped mineral / splinter silhouette.
            Vector3 top=new Vector3(spike?.13f:0,spike?1f:.65f,0),bottom=new Vector3(0,-.45f,0);
            for(int i=0;i<5;i++)
            {
                float a=i*Mathf.PI*2/5,b=(i+1)*Mathf.PI*2/5;
                var p=new Vector3(Mathf.Cos(a)*.35f,0,Mathf.Sin(a)*.35f);
                var q=new Vector3(Mathf.Cos(b)*.35f,0,Mathf.Sin(b)*.35f);
                int n=vs.Count;vs.Add(p);vs.Add(top);vs.Add(q);vs.Add(q);vs.Add(bottom);vs.Add(p);
                for(int j=0;j<6;j++)ts.Add(n+j);
            }
            var m=new Mesh{name=spike?"부패한 가시 조각":"거친 결정"};m.SetVertices(vs);m.SetTriangles(ts,0);m.RecalculateNormals();m.RecalculateBounds();return m;
        }
        static Mesh Crescent()
        {
            var vs=new List<Vector3>();var ts=new List<int>();
            // One slim forward crescent, same outer web envelope; no five opaque sprite layers.
            const int n=28;
            for(int i=0;i<=n;i++)
            {
                float a=Mathf.Lerp(-1.3f,1.3f,i/(float)n),width=.025f*Mathf.Sin(i*Mathf.PI/n);
                vs.Add(new Vector3(Mathf.Cos(a)*.5f,.12f,Mathf.Sin(a)*.5f));
                vs.Add(new Vector3(Mathf.Cos(a)*(.5f-width),.12f,Mathf.Sin(a)*(.5f-width)));
                if(i>0){int j=i*2;ts.Add(j-2);ts.Add(j-1);ts.Add(j);ts.Add(j-1);ts.Add(j+1);ts.Add(j);}
            }
            var m=new Mesh{name="절제된 기검참 외곽"};m.SetVertices(vs);m.SetTriangles(ts,0);m.RecalculateNormals();m.RecalculateBounds();return m;
        }
        static Mesh Orb()
        {
            const int rows=8,cols=12;var vs=new List<Vector3>();var ts=new List<int>();
            for(int j=0;j<=rows;j++)for(int i=0;i<=cols;i++)
            {
                float a=i*Mathf.PI*2/cols,b=j*Mathf.PI/rows,r=.5f*(1+.025f*Mathf.Sin(a*3)*Mathf.Sin(b*4));
                vs.Add(new Vector3(Mathf.Cos(a)*Mathf.Sin(b),Mathf.Cos(b),Mathf.Sin(a)*Mathf.Sin(b))*r);
            }
            for(int j=0;j<rows;j++)for(int i=0;i<cols;i++){int a=j*(cols+1)+i,b=a+cols+1;ts.Add(a);ts.Add(a+1);ts.Add(b);ts.Add(a+1);ts.Add(b+1);ts.Add(b);}
            var m=new Mesh{name="실체가 있는 불규칙 탄 본체"};m.SetVertices(vs);m.SetTriangles(ts,0);m.RecalculateNormals();m.RecalculateBounds();return m;
        }
        Handle Get(string key,int kind,int count)
        {
            if(live.TryGetValue(key,out var h)){h.Seen=frame;return h;}
            // If full, leave enemy bullets on their original readable drawing path.
            if(live.Count>=96)return null;
            h=free.Count>0?free.Pop():new Handle {Go=new GameObject("스킬 물질")};
            h.Go.transform.SetParent(parent,false);h.Go.name=key;h.Kind=kind;h.Seen=frame;h.Last=-99;
            if(h.Parts==null||h.Parts.Length!=count)
            {
                if(h.Parts!=null)foreach(var p in h.Parts)UnityEngine.Object.Destroy(p.gameObject);
                h.Parts=new Transform[count];
                for(int i=0;i<count;i++)
                {
                    var go=new GameObject("물질 "+i);go.transform.SetParent(h.Go.transform,false);
                    go.AddComponent<MeshFilter>();var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=matter;
                    r.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;r.receiveShadows=true;h.Parts[i]=go.transform;
                }
            }
            for(int i=0;i<h.Parts.Length;i++)h.Parts[i].GetComponent<MeshFilter>().sharedMesh=kind==2||kind==1?thorn:kind==6?crescent:(kind==7||kind==8)&&i==0?orb:crystal;
            if(h.Patch!=null)h.Patch.Hide();
            if(h.Light!=null)h.Light.enabled=false;
            h.Go.SetActive(true);live.Add(key,h);PeakHandles=Math.Max(PeakHandles,live.Count);return h;
        }
        static Color Hex(uint rgb){return new Color32((byte)(rgb>>16),(byte)(rgb>>8),(byte)rgb,255);}
        static void Surface(Handle h,uint baseColor,uint edge,float glow,float time)
        {
            h.Block.SetColor("_Base",Hex(baseColor));h.Block.SetColor("_Edge",Hex(edge));h.Block.SetFloat("_Glow",glow);h.Block.SetFloat("_Phase",time);
            foreach(var p in h.Parts)
            {
                // Keep the Core XY footprint, but show upright matter at LOOK-001's
                // elevation instead of pointing its height directly into the camera.
                if(!NativeRemodel3D.Active&&h.Kind!=6)p.localRotation=Quaternion.Euler(90-NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0)*p.localRotation;
                p.GetComponent<MeshRenderer>().SetPropertyBlock(h.Block);
            }
        }
        static void Place(Handle h,float x,float y,float lift=0){h.Go.transform.position=ImpactSpace.Point(x,y,lift);h.Go.transform.rotation=ImpactSpace.FloorRotation;h.Go.transform.localScale=Vector3.one;}
        void Floor(Handle h,float radius,uint fill,uint edge,float alpha,float emission)
        {
            if(h.Patch==null)h.Patch=new ImpactGroundPatch(h.Go.transform,flat,-19000);
            var core=NativeRemodel3D.Active?RemodelWorld.ToCore(h.Go.transform.position):new Vector2(h.Go.transform.position.x*100,-h.Go.transform.position.y*100);
            h.Patch.Draw(core.x,core.y,radius,Hex(fill),Hex(edge),alpha,emission);
        }
        void Light(Handle h,Color c,float range,float intensity)
        {
            if(lights>=2||!ImpactSpace.Visible(RenderCamera,h.Go.transform.position))return;lights++;
            if(h.Light==null){var go=new GameObject("국소 바닥 조명");go.transform.SetParent(h.Go.transform,false);go.transform.localPosition=new Vector3(0,.75f,0);h.Light=go.AddComponent<Light>();h.Light.type=LightType.Point;h.Light.shadows=LightShadows.None;}
            h.Light.enabled=true;h.Light.color=c;h.Light.range=range;h.Light.intensity=intensity;
        }
        void Emit(Handle h,float now,float x,float y,float lift,uint core,uint mid,uint dark,float size,float speed,float alpha,float period=.18f)
        {
            if(now-h.Last<period||events>=6||!ImpactSpace.Visible(RenderCamera,ImpactSpace.Point(x,y,lift)))return;
            Puff p=null;
            for(int i=0;i<puffs.Length;i++)
            {
                if(puffs[i]==null){var go=new GameObject("스킬 미립자 Graph");go.transform.SetParent(parent,false);var fx=go.AddComponent<VisualEffect>();fx.visualEffectAsset=graph;puffs[i]=new Puff{Go=go,Fx=fx,Attr=fx.CreateVFXEventAttribute(),Render=go.GetComponent<Renderer>()};}
                if(now-puffs[i].Born>=.8f){p=puffs[i];break;}
            }
            if(p==null)return;events++;GraphEvents++;h.Last=now;p.Born=now;p.Go.SetActive(true);p.Fx.Reinit();
            var preset=new PoisonPreset{HdrCore=core,CoreHdr=1.5f,CoreSize=size*.24f,PaletteMid=mid,PaletteShadow=dark,
                ChunkSizeMin=size*.06f,ChunkSizeMax=size*.12f,ChunkSpeed=speed,ChunkBias=0,MistSize=size*.8f,MistLifeMin=.24f,MistLifeMax=.5f,MistAlpha=alpha,TaintCount=0};
            // Healing is a quiet ground film and broad vapour, never seven tiny
            // glitter dots. Its user-selected web green remains unchanged.
            if(h.Kind==4){preset.CoreHdr=0;preset.CoreSize=0;preset.ChunkSizeMin=preset.ChunkSizeMax=0;preset.MistSize=.9f;preset.MistAlpha=.035f;preset.PaletteMid=0xb6ff54;preset.PaletteShadow=0x3d571c;}
            PoisonBurstPresets.Apply(p.Fx,preset,Vector2.zero,1);
            ImpactSpace.Velocities(p.Fx,preset,Vector2.zero);
            if(h.Kind==5)
            {
                // Slam: hot directional fragments rise out of the ground, while
                // the longer residual plume stays soot-coloured.
                var rotation=ImpactSpace.FloorRotation;
                Vector3 va=rotation*new Vector3(-speed,1.2f,-speed),vb=rotation*new Vector3(speed,3.5f,speed);
                if(p.Fx.HasVector3("ChunkVelMin"))p.Fx.SetVector3("ChunkVelMin",Vector3.Min(va,vb));
                if(p.Fx.HasVector3("ChunkVelMax"))p.Fx.SetVector3("ChunkVelMax",Vector3.Max(va,vb));
                if(p.Fx.HasGradient("MistGradient"))p.Fx.SetGradient("MistGradient",PoisonBurstPresets.MistGradient(new PoisonPreset{PaletteMid=0x9a8a72,PaletteShadow=0x2a2220,MistAlpha=.12f}));
            }
            var world=ImpactSpace.Point(x,y,lift);p.Go.transform.position=world;
            if(p.Render!=null)p.Render.sortingOrder=SkillPresentation.ResidualOrder(y);
            if(p.Attr.HasVector3("position"))p.Attr.SetVector3("position",world);
            p.Fx.SendEvent("OnBurst",p.Attr);
        }
        public void Update(Simulation sim,float now)
        {
            if(!ReferenceEquals(bound,sim)){Reset();bound=sim;if(bound!=null)bound.MaliceOrbExploded+=OnMaliceExploded;}
            drawn.Clear();
            if(!Active){if(wasActive)Reset();wasActive=false;return;}
            wasActive=true;frame++;events=lights=0;
            foreach(var h in live.Values)if(h.Light!=null)h.Light.enabled=false;
            foreach(var z in sim.FireZones)
            {
                bool spikes=z.Type=="spikeTrap";if(!spikes&&z.Type!="holyDome")continue;
                var h=Get(z.Type+z.Id,spikes?1:4,spikes?18:0);if(h==null)continue;seenSkills.Add(z.Type);Place(h,z.X,z.Y);
                float fade=Mathf.Clamp01((z.MaxT-z.T)/30f),deploy=Mathf.Min(1,z.T/(spikes?12f:15f)),r=z.R*.01f*deploy;
                for(int i=0;i<h.Parts.Length;i++)
                {
                    var p=h.Parts[i];float a=i*2.399963f,rr=r*Mathf.Sqrt((i+.5f)/h.Parts.Length);
                    p.localPosition=new Vector3(Mathf.Cos(a)*rr,spikes?.04f:.08f+Mathf.Sin(now*1.3f+i)*.03f,Mathf.Sin(a)*rr);
                    p.localRotation=Quaternion.Euler(spikes?12:0,i*137.5f,spikes?Mathf.Sin(i*3)*20:0);
                    float size=spikes?(.28f+.18f*(i%3)):.045f;p.localScale=new Vector3(spikes?.22f:size,spikes?size*deploy*fade:size*fade,spikes?.22f:size);
                }
                Surface(h,spikes?0x30281bU:0xb6ff54U,spikes?0xb3a17cU:0xd5ff72U,spikes?.12f:0,now);
                Floor(h,r,spikes?0x1c1610U:0xb6ff54U,spikes?0x66513aU:0xd5ff72U,fade*(spikes?.2f:.11f),spikes?0:.03f);
                Emit(h,now,z.X+Mathf.Cos(now*2)*r*45,z.Y+Mathf.Sin(now*2)*r*45,.12f,spikes?0xd9c8a2U:0xc8dda0U,spikes?0x766449U:0x708151U,0x26251c,.35f,.3f,.05f,.36f);
            }
            foreach(var w in sim.SlamWaves)
            {
                var h=Get("slam"+w.Id,5,14);if(h==null)continue;seenSkills.Add("giantSlam");Place(h,w.X,w.Y);
                float progress=w.T/(float)Math.Max(1,w.MaxT),fade=Mathf.Clamp01((1-progress)/.38f),r=w.MaxR*.01f*.45f*(.72f+.28f*Mathf.Min(1,progress*3.5f));
                for(int i=0;i<h.Parts.Length;i++){float a=i*Mathf.PI*2/h.Parts.Length;var p=h.Parts[i];p.localPosition=new Vector3(Mathf.Cos(a)*r,.03f+Mathf.Sin(progress*Mathf.PI)*.17f,Mathf.Sin(a)*r);p.localRotation=Quaternion.Euler(i*37,now*28+i*39,i*17);p.localScale=Vector3.one*(.12f+.04f*(i%3))*fade;}
                Surface(h,w.Bash?0x393026U:0x3a2117U,w.Bash?0x91a7acU:0xd8562aU,w.Bash?.1f:.8f*(1-progress),now);Floor(h,r,0x251b13,0xc8995c,fade*.28f,.05f);
                Emit(h,now,w.X,w.Y,.15f,w.Bash?0xfff4d0U:0xffd9a0U,w.Bash?0x9a8a72U:0xd8562aU,w.Bash?0x2a2220U:0x4a1610U,Mathf.Min(2,r),3,.12f,9);
                if(progress<.2f)Light(h,w.Bash?Hex(0xe8f3f8):new Color(1,.63f,.28f),Mathf.Min(4,r*1.5f),2*(1-progress/.2f));
            }
            foreach(var b in sim.SkillBlades)if(b.Active)
            {
                var h=Get("iceblade"+b.Id,3,1);if(h==null)continue;Place(h,b.X,b.Y,.35f);h.Go.transform.rotation=ImpactSpace.FloorRotation*Quaternion.Euler(0,Mathf.Atan2(b.Vy,b.Vx)*Mathf.Rad2Deg+90,80);
                h.Parts[0].localPosition=Vector3.zero;h.Parts[0].localRotation=Quaternion.identity;h.Parts[0].localScale=new Vector3(.11f,.4f,.11f);Surface(h,0x1a2a36,0xe8f3f8,.4f,now);
                Emit(h,now,b.X,b.Y,.35f,0xe8f3f8,0x5f98c0,0x1a2a36,.16f,.2f,.02f,.2f);
            }
            if(sim.IceOrbActive)
            {
                var h=Get("ice-shell",3,14);if(h!=null)
                {
                    seenSkills.Add("iceOrb");Place(h,sim.IceOrbX,sim.IceOrbY);
                    float p=Mathf.Min(1,sim.IceOrbT/180f),r=(sim.Player.Radius+32+Mathf.Sin(p*Mathf.PI)*10)*(1+(Math.Max(1,sim.Skills.Level("iceOrb"))-1)*.1f)*.01f;
                    // Sparse crystals inside the web 6.6R envelope leave the player and enemy shots visible.
                    for(int i=0;i<h.Parts.Length;i++){float a=i*Mathf.PI*2/h.Parts.Length+now*.15f;var t=h.Parts[i];t.localPosition=new Vector3(Mathf.Cos(a)*r*3.2f,.4f+(i%3)*.16f,Mathf.Sin(a)*r*3.2f);t.localRotation=Quaternion.Euler(12,i*137.5f,Mathf.Cos(a)*25);t.localScale=new Vector3(.1f,.28f+(i%3)*.09f,.12f);}
                    Surface(h,0x1a2a36,0xe8f3f8,.38f,now);Floor(h,r,0x1a2a36,0x5f98c0,.08f,.08f);
                    Emit(h,now,sim.IceOrbX,sim.IceOrbY,.5f,0xe8f3f8,0x5f98c0,0x1a2a36,.45f,.4f,.045f,.25f);Light(h,Hex(0xe8f3f8),1.8f,.45f);
                }
            }
            foreach(var o in sim.MaliceOrbs)if(o.Active)
            {
                var h=Get("malice"+o.Id,8,4);if(h==null)continue;seenSkills.Add("fireball");Place(h,o.X,o.Y,.35f);
                float r=o.R*.01f;
                for(int i=0;i<4;i++){var p=h.Parts[i];float a=i*Mathf.PI*2/3+now*1.2f;p.localPosition=i==0?Vector3.zero:new Vector3(Mathf.Cos(a)*r*2.1f,Mathf.Sin(a*2)*r*.25f,Mathf.Sin(a)*r*2.1f);p.localRotation=Quaternion.Euler(now*35+i*27,i*137,now*25);p.localScale=i==0?Vector3.one*r*2.75f:new Vector3(r*.7f,r*1.35f,r*.65f);}
                Surface(h,0x6a56a8,0xe4dcf4,.5f,now);Emit(h,now,o.X,o.Y,.35f,0xe4dcf4,0x6a56a8,0x161226,r*1.8f,.3f,.09f,.12f);Light(h,new Color(.62f,.53f,.72f),1.1f,.5f);
            }
            foreach(var p in sim.Projectiles)if(p.Active)
            {
                var h=Get("ki"+p.Id,6,1);if(h==null)continue;Place(h,p.X,p.Y,.24f);h.Go.transform.rotation=ImpactSpace.FloorRotation*Quaternion.Euler(0,p.Angle*Mathf.Rad2Deg,0);
                float width=SkillPresentation.KiWidth(p.Step,p.ChargeScale)*.01f;h.Parts[0].localPosition=Vector3.zero;h.Parts[0].localRotation=Quaternion.identity;h.Parts[0].localScale=Vector3.one*width;
                Surface(h,0x9c978b,0xede8d8,1.5f,now);Emit(h,now,p.X,p.Y,.35f,0xfff1d1,0xa89a7c,0x3a3429,.3f,.6f,.035f,.12f);
            }
            if(sim.Player.KiChargeActive)
            {
                var p=sim.Player;var h=Get("ki-charge",3,3);
                if(h!=null){Place(h,p.X+Mathf.Cos(p.Facing)*25,p.Y+Mathf.Sin(p.Facing)*25,.4f);int tier=Mathf.Clamp((int)(p.KiChargeTicks/40),0,3);
                    for(int i=0;i<3;i++){h.Parts[i].localPosition=new Vector3((i-1)*.1f,.06f*i,0);h.Parts[i].localRotation=Quaternion.Euler(0,now*35,0);h.Parts[i].localScale=Vector3.one*(i<tier?.1f:.045f);}
                    Surface(h,0x756d5c,0xe6d9ba,.5f,now);Emit(h,now,p.X,p.Y,.5f,0xffedcf,0xa89a7c,0x3a3429,.2f,.2f,.02f,.3f);}
            }
            while(blasts.Count>0)
            {
                var v=blasts.Dequeue();var h=Get("malice-blast"+(blastSerial++),3,0);if(h!=null)Emit(h,now,v.x,v.y,.3f,0xe4dcf4,0x6a56a8,0x161226,Mathf.Min(1.8f,v.z*.01f),2,.14f,9);
            }
            if(sim.Druid!=null)foreach(var p in sim.Druid.Projectiles)
            {
                if(!p.Active||p.Mine||p.Friendly||p.BlueBean||p.BlackBean||p.BwBean)continue;
                int kind=SkillPresentation.BulletKind(p.DruidPoison,p.ParryClass=="physical",p.El);if(kind==0)continue;
                var h=Get("bullet"+System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(p),kind==2?2:kind==1?7:8,kind==2?3:4);if(h==null)continue;drawn.Add(p);
                Place(h,(float)p.X,(float)p.Y,.3f);float width=(float)SkillPresentation.EnemyWidth(p.DruidPoison,p.ParryClass=="physical",p.ElemBall,p.Sz)*.01f,r=width*.5f,a=Mathf.Atan2((float)p.Vy,(float)p.Vx);
                h.Go.transform.rotation=ImpactSpace.FloorRotation*Quaternion.Euler(0,a*Mathf.Rad2Deg,0);
                for(int i=0;i<h.Parts.Length;i++)
                {
                    var t=h.Parts[i];float b=i*Mathf.PI*2/3+now;
                    t.localPosition=kind==2?new Vector3(-i*width*.16f,0,(i-1)*width*.08f):i==0?Vector3.zero:new Vector3(Mathf.Cos(b)*width*.36f,Mathf.Sin(b*2)*width*.05f,Mathf.Sin(b)*width*.36f);
                    t.localRotation=kind==2?Quaternion.Euler(0,0,-90):Quaternion.Euler(now*20+i*41,now*15,i*73);
                    t.localScale=kind==2?new Vector3(width*(i==0?.22f:.14f),width*(i==0?.58f:.36f),width*.18f):i==0?(kind==1?Vector3.one*width*.66f:new Vector3(width*.72f,width*.28f,width*.34f)):new Vector3(width*.18f,width*.25f,width*.17f);
                }
                uint core=kind==1?SkillPresentation.EnemyPoisonCore:kind==2?0xefe6d2U:SkillPresentation.EnemyDarkCore,mid=kind==1?SkillPresentation.EnemyPoisonMid:kind==2?0x9a8a72U:SkillPresentation.EnemyDarkMid,dark=kind==1?SkillPresentation.EnemyPoisonShadow:kind==2?0x2a2220U:SkillPresentation.EnemyDarkShadow;
                Surface(h,mid,core,kind==2?.35f:.7f,now);Emit(h,now,(float)p.X,(float)p.Y,.3f,core,mid,dark,Mathf.Min(.5f,r),.22f,.04f,.24f);
                if(kind==1)PoisonFrames++;else if(kind==2)ThornFrames++;else DarkFrames++;
            }
            stale.Clear();foreach(var kv in live)if(kv.Value.Seen!=frame)stale.Add(kv.Key);
            foreach(var key in stale){var h=live[key];h.Go.SetActive(false);free.Push(h);live.Remove(key);}
            foreach(var p in puffs)if(p!=null&&now-p.Born>.8f)p.Go.SetActive(false);
        }
        void OnMaliceExploded(MaliceOrb o){if(Active)blasts.Enqueue(new Vector3(o.X,o.Y,o.ExplR));}
        public void Reset(){if(bound!=null)bound.MaliceOrbExploded-=OnMaliceExploded;foreach(var h in live.Values){h.Go.SetActive(false);free.Push(h);}live.Clear();drawn.Clear();seenSkills.Clear();blasts.Clear();GraphEvents=PeakHandles=PoisonFrames=ThornFrames=DarkFrames=0;foreach(var p in puffs)if(p!=null){p.Go.SetActive(false);p.Born=-99;}bound=null;}
        public void Dispose(){Reset();while(free.Count>0){var h=free.Pop();if(h.Patch!=null)h.Patch.Dispose();UnityEngine.Object.Destroy(h.Go);}foreach(var p in puffs)if(p!=null){p.Attr.Dispose();UnityEngine.Object.Destroy(p.Go);}UnityEngine.Object.Destroy(crystal);UnityEngine.Object.Destroy(thorn);UnityEngine.Object.Destroy(crescent);UnityEngine.Object.Destroy(orb);if(Current==this)Current=null;}
    }
}
