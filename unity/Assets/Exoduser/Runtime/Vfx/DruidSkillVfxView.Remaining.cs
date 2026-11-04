using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort.Vfx
{
    public sealed partial class DruidSkillVfxView
    {
        sealed class PathBody
        {
            public string Kind; public int Born, End=-1, Seed; public double Width;
            public readonly List<Vector2> Points=new List<Vector2>();
        }
        sealed class Burst
        { public int Born, Seed; public string Kind; public double X,Y,R,Angle; }
        sealed class BodySprite
        {
            public string Sheet;public int Born,Life,Frame;public bool Started,Add;
            public double X,Y,W,H,Lift,Vx,Vy,Peak,Alpha,Angle;public Color Tint=Color.white;
        }
        sealed class Hole { public int Born,Life,Reveal;public double X,Y,R; }
        sealed class GroundBody
        { public Mesh Mesh;public MeshRenderer Renderer;public readonly MaterialPropertyBlock Block=new MaterialPropertyBlock(); }
        readonly List<PathBody> paths=new List<PathBody>();
        readonly Dictionary<Fissure,PathBody> fissurePaths=new Dictionary<Fissure,PathBody>();
        readonly List<BodySprite> bodySprites=new List<BodySprite>();
        readonly List<Hole> holes=new List<Hole>();readonly List<Burst> bursts=new List<Burst>();
        readonly List<GroundBody> groundBodies=new List<GroundBody>();
        readonly List<Vector3> gv=new List<Vector3>();readonly List<Vector2> guv=new List<Vector2>();readonly List<Color> gc=new List<Color>();readonly List<int> gi=new List<int>();
        readonly Vector4[] safeVectors=new Vector4[16],pillarVectors=new Vector4[8];
        readonly List<DruidTelegraph> heartTelegraphs=new List<DruidTelegraph>();
        readonly DruidVfxSpawnBudget spawnBudget=new DruidVfxSpawnBudget();
        Material groundBodyMaterial,barkMaterial;Simulation boundSim;DruidData bodyData;
        NativeDruidRigPixelView boundRig; readonly List<GroundBody> tendrils=new List<GroundBody>(),drains=new List<GroundBody>();
        PathBody chargePath,burrowPath;int signalTick=int.MinValue,groundUsed,drainBorn=-1000,breakBorn=-1000,landingBorn=-1;
        string bodyPrev;double previousRemaining,heartX,heartY,heartSafe,heartOuter,arenaX,arenaY,arenaW,arenaH;int pulseBorn=-1000,veinFade=-1000;
        double[][] heartZones,heartPillars;bool wasLive;int fxSeed;
        public int ChargesStarted,FissuresStarted,BurrowsStarted,GrabsStarted,HeartbeatsStarted,RemainingSpritesDrawn,GroundBodiesDrawn;

        void InitializeRemaining()
        {
            var shader=Resources.Load<Shader>("Shaders/DruidGroundBody");
            if(shader!=null)groundBodyMaterial=new Material(shader){name="Druid textured body ground"};
            var bark=Resources.Load<Shader>("Shaders/DruidRootBark");
            if(bark!=null){barkMaterial=new Material(bark){name="Druid root bark (Point RT)"};barkMaterial.SetTexture("_BaseMap",Resources.Load<Texture2D>(EarthDir+"crack_strip_tile"));}
            for(int n=0;n<3;n++)
            {
                tendrils.Add(NewMeshBody("Druid grab root tube",barkMaterial,0));
                drains.Add(NewMeshBody("Druid drain streak",NativeDruidArt.Additive,0));
            }
        }
        GroundBody NewMeshBody(string name,Material material,int order)
        {
            var go=new GameObject(name);go.transform.SetParent(root,false);
            var mesh=new Mesh{name=name};mesh.MarkDynamic();go.AddComponent<MeshFilter>().sharedMesh=mesh;
            var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=material;r.sortingOrder=order;r.enabled=false;
            r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;
            return new GroundBody{Mesh=mesh,Renderer=r};
        }
        void DisposeRemaining()
        {
            if(boundSim!=null)boundSim.BossFx -= OnRemainingFx;
            DetachRig();
            foreach(var g in groundBodies)NativeGroundSkillProjection.UnregisterVolume(g.Renderer);
            foreach(var list in new[]{groundBodies,tendrils,drains})foreach(var g in list)UnityEngine.Object.Destroy(g.Mesh);
            if(groundBodyMaterial!=null)UnityEngine.Object.Destroy(groundBodyMaterial);
            if(barkMaterial!=null)UnityEngine.Object.Destroy(barkMaterial);
        }
        void DetachRig()
        {
            if(boundRig!=null)
            {
                boundRig.BodyVfxPoseReady-=DrawGrabTubes;
                foreach(var list in new[]{tendrils,drains})foreach(var g in list)boundRig.UnregisterBodyVfx(g.Renderer);
            }
            boundRig=null;
        }
        void ResetRemaining()
        {
            paths.Clear();fissurePaths.Clear();bodySprites.Clear();holes.Clear();bursts.Clear();chargePath=burrowPath=null;
            bodyPrev=null;bodyData=null;signalTick=int.MinValue;spawnBudget.Clear();wasLive=false;
            pulseBorn=drainBorn=breakBorn=veinFade=-1000;landingBorn=-1;heartZones=heartPillars=null;
            foreach(var list in new[]{groundBodies,tendrils,drains})foreach(var g in list)g.Renderer.enabled=false;
        }
        void UpdateRemainingSignals(Simulation sim,DruidData d,int tick)
        {
            if(boundSim!=sim)
            {
                if(boundSim!=null)boundSim.BossFx -= OnRemainingFx;
                ResetRemaining();boundSim=sim;sim.BossFx += OnRemainingFx;
            }
            bodyData=d;
            if(boundRig!=NativeDruidRigPixelView.Current)
            {
                DetachRig();boundRig=NativeDruidRigPixelView.Current;
                if(boundRig!=null)
                {
                    boundRig.BodyVfxPoseReady+=DrawGrabTubes;
                    foreach(var list in new[]{tendrils,drains})foreach(var g in list)boundRig.RegisterBodyVfx(g.Renderer);
                }
            }
            if(signalTick==tick)return;signalTick=tick;
            if(d==null)
            {
                if(wasLive)ResetRemaining();wasLive=false;return;
            }
            wasLive=true;string s=d.S;bool entered=s!=bodyPrev;
            if(s=="bossChargeWind"&&d.St2<=12&&(entered||previousRemaining>12))
                AddPuff(tick,d.X-Math.Cos(d.Facing)*d.R,d.Y-Math.Sin(d.Facing)*d.R,18,.6*DruidSlamVfxTimeline.HeroH);
            if(s=="bossCharge")
            {
                if(entered){chargePath=StartPath("charge",tick,d.X,d.Y,d.R);ChargesStarted++;}
                Append(chargePath,d.X,d.Y);
                int age=tick-chargePath.Born;
                if(age%6==0)AddPuff(tick,d.X,d.Y,24,.6*DruidSlamVfxTimeline.HeroH);
                if(age%8==2)AddPuff(tick,d.X+Math.Cos(d.Facing)*d.R,d.Y+Math.Sin(d.Facing)*d.R,12,.45*DruidSlamVfxTimeline.HeroH);
            }
            else if(chargePath!=null){chargePath.End=tick;chargePath=null;}
            if(s=="bossRmWind"&&d.RmPending!=null&&d.RmPending.Id=="groundFissure"&&d.St2<=12&&(entered||previousRemaining>12))
            {
                double tx,ty;DruidSlashVfxTimeline.StaffTip(d.X,d.Y,d.Facing,d.WeaponAng,d.R,out tx,out ty);
                AddPuff(tick,tx,ty,18,.5*DruidSlamVfxTimeline.HeroH);
            }
            UpdateFissures(sim,tick);
            if(s=="bossDruidDive"&&entered)
            {
                holes.Add(new Hole{Born=tick,Life=56+90,Reveal=56,X=d.X,Y=d.Y,R=d.R});BurrowsStarted++;
                AddPuff(tick,d.X,d.Y,30,d.R*1.4);
            }
            if(s=="bossDruidUnder")
            {
                if(entered)burrowPath=StartPath("burrow",tick,d.X,d.Y,d.R);
                Append(burrowPath,d.X,d.Y);
                if((tick-burrowPath.Born)%8==0)
                {
                    AddPuff(tick,d.X,d.Y,24,d.R*.9);
                    AddShard(tick+1,d.X,d.Y,fxSeed++,d.Facing,30,18);
                }
            }
            else if(burrowPath!=null){burrowPath.End=tick;burrowPath=null;}
            if(s=="bossDruidErupt"&&!d.EruptHit&&d.St2<=18&&(entered||previousRemaining>18))
                for(int i=0;i<6;i++)AddShard(tick+i/2,d.X,d.Y,fxSeed++,i*Math.PI/3,d.R*.5,12,true);
            if(s=="bossGrabLunge"&&DruidRemainingVfxTimeline.GrabStep(d.St2,entered?20:previousRemaining))
                AddPuff(tick,d.X,d.Y,15,.6*DruidSlamVfxTimeline.HeroH);
            if(s=="bossGrab"&&entered)
            {
                GrabsStarted++;breakBorn=-1000;drainBorn=-1000;
                QueueSprite(new BodySprite{Sheet="core",Add=true,Born=tick,Life=5,X=sim.Player.X,Y=sim.Player.Y,W=DruidSlamVfxTimeline.HeroH*.5,H=DruidSlamVfxTimeline.HeroH*.5,Alpha=1,Lift=20});
            }
            if(bodyPrev=="bossGrab"&&s!="bossGrab")
            {
                breakBorn=tick;
                // Core has no airborne state. Follow its knockback until motion settles; escape does not make a landing impact.
                if(previousRemaining<=1)landingBorn=tick;
                for(int i=0;i<4;i++)AddShard(tick+1+i/2,sim.Player.X,sim.Player.Y,fxSeed++,d.GrabAng+i*.4,28,18);
            }
            if(bodyPrev=="bossGrabLunge"&&s!="bossGrabLunge"&&s!="bossGrab")
                AddPuff(tick,d.X+Math.Cos(d.GrabAng)*d.R,d.Y+Math.Sin(d.GrabAng)*d.R,15,.5*DruidSlamVfxTimeline.HeroH);
            if(landingBorn>=0&&tick-landingBorn>=2&&(Math.Abs(sim.Player.KnockbackX)+Math.Abs(sim.Player.KnockbackY)<.5||tick-landingBorn>=60))
            { AddPuff(tick,sim.Player.X,sim.Player.Y,24,DruidSlamVfxTimeline.HeroH*1.5);landingBorn=-1; }
            if(s=="bossHeartWind")CaptureHeartSafe(sim,d);
            if(bodyPrev=="bossHeartWind"&&s!="bossHeartWind")veinFade=tick;
            bodyPrev=s;previousRemaining=d.St2;
        }
        PathBody StartPath(string kind,int tick,double x,double y,double r)
        {
            var p=new PathBody{Kind=kind,Born=tick,Seed=fxSeed++,Width=DruidRemainingVfxTimeline.PathWidth(kind,r)};p.Points.Add(new Vector2((float)x,(float)y));paths.Add(p);
            if(paths.Count>MaxDecals)paths.RemoveAt(0);return p;
        }
        static void Append(PathBody p,double x,double y)
        {
            if(p==null)return;var next=new Vector2((float)x,(float)y);
            if(p.Points.Count==0||Vector2.Distance(p.Points[p.Points.Count-1],next)>.1f)p.Points.Add(next);
        }
        void UpdateFissures(Simulation sim,int tick)
        {
            foreach(var f in sim.Druid.Fissures)
            {
                if(!f.Druid||!f.Straight)continue;PathBody p;
                if(!fissurePaths.TryGetValue(f,out p))
                {p=StartPath("fissure",tick,f.X,f.Y,0);p.Width=f.W;fissurePaths.Add(f,p);FissuresStarted++;}
                // A continuous textured strip, never the old three-colour disc chain.
                p.Points.Clear();int n=Math.Max(1,(int)Math.Ceiling(f.Len/24));
                for(int i=0;i<=n;i++)
                {
                    double t=f.Len*i/n,side=DruidRemainingVfxTimeline.EdgeOffset(t,p.Seed,f.W);
                    p.Points.Add(new Vector2((float)(f.X+Math.Cos(f.Ang)*t-Math.Sin(f.Ang)*side),(float)(f.Y+Math.Sin(f.Ang)*t+Math.Cos(f.Ang)*side)));
                }
                if(p.End<0&&(f.Done||f.Exploded))
                { p.End=tick;BeginBurst("fissure",tick,f.X+Math.Cos(f.Ang)*f.Len,f.Y+Math.Sin(f.Ang)*f.Len,f.ExplR,f.Ang); }
                if(p.End<0&&(tick-p.Born)%8==0)
                    QueueSprite(new BodySprite{Sheet="thorn_spike",Born=tick,Life=30,X=f.X+Math.Cos(f.Ang)*f.Len,Y=f.Y+Math.Sin(f.Ang)*f.Len,W=48,H=68,Alpha=.45});
                if(p.End<0&&(tick-p.Born)%6==0)
                    for(int i=0;i<4;i++)AddShard(tick+i/2,f.X+Math.Cos(f.Ang)*f.Len,f.Y+Math.Sin(f.Ang)*f.Len,fxSeed++,f.Ang+i*.7,30,18);
            }
            var dead=new List<Fissure>();
            foreach(var kv in fissurePaths)if(!sim.Druid.Fissures.Contains(kv.Key))
            {if(kv.Value.End<0)kv.Value.End=tick;dead.Add(kv.Key);}
            foreach(var f in dead)fissurePaths.Remove(f);
        }
        void OnRemainingFx(string kind,double x,double y,double r)
        {
            if(boundSim==null||boundSim.Druid==null||!boundSim.Druid.Remodel)return;
            DruidData d;var boss=boundSim.Druid.Boss;
            if(boss==null||!boss.Alive||!boundSim.Druid.Data.TryGetValue(boss,out d))return;
            int tick=boundSim.TickCount;
            if(kind=="wallSlam")
            {
                double nx=(ViewCanMove(x+8,y,d.R)?1:0)-(ViewCanMove(x-8,y,d.R)?1:0);
                double ny=(ViewCanMove(x,y+8,d.R)?1:0)-(ViewCanMove(x,y-8,d.R)?1:0);
                BeginBurst("wall",tick,x,y,r,nx*nx+ny*ny>0?Math.Atan2(ny,nx):d.Facing+Math.PI);
            }
            if(kind=="druidDust")AddPuff(tick,x,y,36,r*1.5);
            if(kind=="druidRoots")
            {
                BeginBurst("erupt",tick,x,y,r,d.Facing);
                holes.Add(new Hole{Born=tick,Life=180,Reveal=0,X=x,Y=y,R=r});
            }
            if(kind=="druidAbsorb")
            {drainBorn=tick;if(boundRig!=null)boundRig.PulseDrainChest(tick);}
            if(kind=="druidHeartbeat")
            {CaptureHeartSafe(boundSim,d);pulseBorn=tick;veinFade=tick;HeartbeatsStarted++;}
        }
        void CaptureHeartSafe(Simulation sim,DruidData d)
        {
            heartX=d.X;heartY=d.Y;
            // The public telegraph carries the already-shifted live safe radius, extra circles, and exact pillar geometry.
            sim.DruidTelegraphs(heartTelegraphs);
            foreach(var t in heartTelegraphs)if(t.MoveId=="heartbeat"&&t.Shape==DruidTeleShape.ArenaMinusSafe)
            {heartSafe=t.Safe[0][2];heartZones=t.Safe;heartPillars=t.Shadows;arenaX=t.X-t.Length/2;arenaY=t.Y-t.Width/2;arenaW=t.Length;arenaH=t.Width;return;}
            // Pulse can arrive after Core has left bossHeartWind. Keep the previous telegraph snapshot for that beat.
        }
        bool ViewCanMove(double x,double y,double r)
        {return (boundSim.CanMove==null||boundSim.CanMove((float)x,(float)y,(float)r))&&!boundSim.Druid.PillarBlocks(x,y,r);}
        void BeginBurst(string kind,int tick,double x,double y,double r,double angle)
        {
            bursts.Add(new Burst{Kind=kind,Born=tick,X=x,Y=y,R=r,Angle=angle,Seed=fxSeed++});
            QueueSprite(new BodySprite{Sheet="core",Add=true,Born=tick,Life=5,X=x,Y=y,W=DruidSlamVfxTimeline.CoreDiameter,H=DruidSlamVfxTimeline.CoreDiameter,Alpha=1,Lift=22});
            QueueSprite(new BodySprite{Sheet=kind=="wall"?"wall_impact_dust":"earth_eruption",Born=tick,Life=kind=="wall"?48:30,X=x,Y=y,W=r*2,H=Math.Min(48,DruidSlamVfxTimeline.HeroH*.4),Alpha=.45});
            if(kind!="wall")QueueSprite(new BodySprite{Sheet="thorn_burst",Born=tick+1,Life=30,X=x,Y=y,W=r*2,H=Math.Min(r,100),Alpha=.45});
            for(int i=0;i<12;i++)
            {
                double a=kind=="wall"?angle-Math.PI/2+Math.PI*(i+.5)/12:Math.PI*2*i/12;
                AddShard(tick+1+i/2,x,y,fxSeed++,a,Math.Min(r,160),21);
            }
        }
        void AddPuff(int tick,double x,double y,int life,double size)
        {QueueSprite(new BodySprite{Sheet="dust",Born=tick,Life=life,X=x,Y=y,W=size,H=Math.Min(size,DruidSlamVfxTimeline.HeroH*.4),Alpha=.35});}
        void AddShard(int tick,double x,double y,int seed,double angle,double reach,int life,bool liftOnly=false)
        {
            QueueSprite(new BodySprite{Sheet="debris",Frame=(seed&15),Born=tick,Life=life,X=x,Y=y,W=20+(seed&7),H=24+(seed&7),
                Vx=liftOnly?0:Math.Cos(angle)*reach/life,Vy=liftOnly?0:Math.Sin(angle)*reach/life,Peak=liftOnly?4:24+(seed&15),Alpha=.45,Tint=new Color(.72f,.66f,.57f,1),Angle=angle});
        }
        void QueueSprite(BodySprite s){bodySprites.Add(s);if(bodySprites.Count>160)bodySprites.RemoveAt(0);}

        int DrawRemaining(Simulation sim,DruidData d,int tick,Camera cam)
        {
            groundUsed=0;RemainingSpritesDrawn=0;
            // Immediate attack information wins over old residues when the common eight-ground-layer cap is full.
            DrawHeart(d,tick);
            if(d!=null&&d.S=="bossDruidErupt"&&!d.EruptHit)
            {
                double reveal=DruidRemainingVfxTimeline.BurrowReveal(d.St2,d.EruptMax),r=d.R+120;
                GroundQuad(crackTex[0],d.X,d.Y,DruidSlamVfxTimeline.CrackSize(0)*r/260*reveal,DruidSlamVfxTimeline.CrackSize(0)*r/260*reveal,new Color(1,1,1,.4f));
            }
            for(int i=holes.Count-1;i>=0;i--)
            {
                var h=holes[i];double age=tick-h.Born,fade=DruidRemainingVfxTimeline.Fade(age,h.Life,60);
                if(fade<=0){holes.RemoveAt(i);continue;}
                double reveal=h.Reveal>0?DruidRemainingVfxTimeline.Saturate(age/h.Reveal):1;
                GroundQuad(crackTex[0],h.X,h.Y,h.R*2.5,h.R*2.5,new Color(1,1,1,(float)(.4*fade*reveal)));
                GroundQuad(glowTex,h.X,h.Y,h.R*1.9,h.R*1.9,new Color(.018f,.013f,.008f,(float)(.45*fade*reveal)));
            }
            for(int i=bursts.Count-1;i>=0;i--)
            {
                var b=bursts[i];int age=tick-b.Born;if(age>=180){bursts.RemoveAt(i);continue;}
                double size=DruidSlamVfxTimeline.CrackSize(0)*b.R/260;
                GroundQuad(crackTex[0],b.X,b.Y,size,size,new Color(1,1,1,(float)(.4*DruidRemainingVfxTimeline.Fade(age,180,60))));
            }
            for(int i=paths.Count-1;i>=0;i--)
            {
                var p=paths[i];int life=p.Kind=="fissure"?180:p.Kind=="charge"?150:48;
                double alpha=p.End<0?.35:.35*DruidRemainingVfxTimeline.Fade(tick-p.End,life,Math.Min(60,life));
                if(alpha<=0){paths.RemoveAt(i);continue;}
                DrawPath(p,alpha);
            }
            int liveSprites=0;foreach(var s in bodySprites)if(s.Started&&tick-s.Born>=0&&tick-s.Born<s.Life)liveSprites++;
            // Contact and authored thorn volumes get the two birth slots before secondary debris. Retire oldest bodies at the active cap.
            for(int priority=0;priority<4;priority++)foreach(var s in bodySprites)
            {
                int age=tick-s.Born;if(s.Started||age<0||age>=s.Life||SpritePriority(s)!=priority)continue;
                if(!spawnBudget.Take(tick,Math.Min(liveSprites,23)))continue;
                if(liveSprites>=24)
                {
                    BodySprite oldest=null;foreach(var other in bodySprites)if(other.Started&&tick-other.Born<other.Life&&(oldest==null||other.Born<oldest.Born))oldest=other;
                    if(oldest!=null){oldest.Life=0;liveSprites--;}
                }
                s.Started=true;liveSprites++;
            }
            foreach(var s in bodySprites)
            {
                int age=tick-s.Born;if(!s.Started||age<0||age>=s.Life)continue;
                Sprite sprite=null;
                if(s.Sheet=="dust")sprite=dustFrames[DruidSlamVfxTimeline.DustFrame(age,s.Life)];
                else if(s.Sheet=="debris")sprite=debrisFrames[s.Frame];
                else if(s.Sheet=="core")sprite=coreSprite;
                else {int cols=s.Sheet=="thorn_spike"?4:6;int frame=Math.Min(cols*4-1,age*cols*4/s.Life);sprite=NativeDruidArt.ClipFrame(EarthDir+s.Sheet,cols,4,frame);}
                double p=age/(double)s.Life,lift=s.Lift+Math.Sin(p*Math.PI)*s.Peak,alpha=s.Alpha*DruidRemainingVfxTimeline.Fade(age,s.Life,Math.Min(12,s.Life));
                // CoreOpacity already contains its five-tick envelope: a second alpha fade would suppress the HDR peak.
                Color tint=s.Tint;tint.a=s.Add?1:(float)alpha;
                Put(s.Add,sprite,World(s.X+s.Vx*age,s.Y+s.Vy*age,lift),s.W,s.H,(float)s.Angle,tint,s.Add?(float)DruidSlamVfxTimeline.CoreOpacity(age):1,DustOrder,cam);
            }
            bodySprites.RemoveAll(s=>tick-s.Born>=s.Life);
            for(int i=groundUsed;i<groundBodies.Count;i++)groundBodies[i].Renderer.enabled=false;
            RemainingSpritesDrawn=alphaUsed+addUsed;GroundBodiesDrawn=groundUsed;
            return RemainingSpritesDrawn;
        }
        static int SpritePriority(BodySprite s)
        {return s.Add?0:s.Sheet=="thorn_burst"||s.Sheet=="thorn_spike"?1:s.Sheet=="debris"?3:2;}
        GroundBody BeginGround(Texture tex,Color tint,Texture emit=null,float emission=0,bool safe=false,bool repeat=false)
        {
            if(groundBodyMaterial==null||tex==null||groundUsed>=MaxDecals)return null;
            if(groundUsed==groundBodies.Count)groundBodies.Add(NewMeshBody("Druid textured floor body",groundBodyMaterial,DecalOrder));
            var g=groundBodies[groundUsed++];g.Renderer.enabled=true;g.Block.Clear();g.Block.SetTexture("_MainTex",tex);g.Block.SetTexture("_EmitTex",emit!=null?emit:Texture2D.blackTexture);
            bool projection=NativeRemodel3D.Active&&NativeGroundSkillProjection.Available;
            if(projection)NativeGroundSkillProjection.RegisterVolume(g.Renderer);else NativeGroundSkillProjection.UnregisterVolume(g.Renderer);
            g.Block.SetColor("_Tint",tint);g.Block.SetFloat("_Emission",emission);g.Block.SetFloat("_Repeat",repeat?1:0);g.Block.SetFloat("_Plane3D",NativeRemodel3D.Active?1:0);g.Block.SetFloat("_MaskSafe",safe?1:0);g.Block.SetFloat("_ProjectionEnabled",projection?1:0);
            if(safe)SetSafeProperties(g.Block);g.Renderer.SetPropertyBlock(g.Block);
            gv.Clear();guv.Clear();gc.Clear();gi.Clear();return g;
        }
        void Vertex(double x,double y,double u,double v)
        {gv.Add(World(x,y,.5));guv.Add(new Vector2((float)u,(float)v));gc.Add(Color.white);}
        void QuadIndices(int a,int b,int c,int d){gi.Add(a);gi.Add(b);gi.Add(c);gi.Add(c);gi.Add(b);gi.Add(d);}
        void FinishGround(GroundBody g)
        {if(g==null)return;g.Mesh.Clear();g.Mesh.SetVertices(gv);g.Mesh.SetUVs(0,guv);g.Mesh.SetColors(gc);g.Mesh.SetTriangles(gi,0);g.Mesh.RecalculateBounds();}
        void GroundQuad(Texture tex,double x,double y,double w,double h,Color tint,Texture emit=null,float emission=0,bool safe=false)
        {
            var g=BeginGround(tex,tint,emit,emission,safe);if(g==null)return;
            const int n=12;
            for(int j=0;j<=n;j++)for(int i=0;i<=n;i++)Vertex(x+w*(i/(double)n-.5),y+h*(j/(double)n-.5),i/(double)n,1-j/(double)n);
            for(int j=0;j<n;j++)for(int i=0;i<n;i++){int a=j*(n+1)+i;QuadIndices(a,a+1,a+n+1,a+n+2);}
            FinishGround(g);
        }
        void DrawPath(PathBody p,double alpha)
        {
            if(p.Points.Count<2)return;var tex=Resources.Load<Texture2D>(EarthDir+(p.Kind=="charge"?"ground_furrow_tile":"crack_strip_tile"));
            // Brightness only: preserve authored hue and alpha of the approved furrow.
            float value=p.Kind=="charge"?1.25f:1;
            var g=BeginGround(tex,new Color(value,value,value,(float)Math.Min(.42,alpha)),repeat:true);if(g==null)return;
            double run=0;
            for(int i=0;i<p.Points.Count;i++)
            {
                var at=p.Points[i];if(i>0)run+=Vector2.Distance(p.Points[i-1],at);
                var dir=(p.Points[Math.Min(p.Points.Count-1,i+1)]-p.Points[Math.Max(0,i-1)]).normalized;var side=new Vector2(-dir.y,dir.x)*(float)DruidRemainingVfxTimeline.PathHalfWidth(p.Width);
                Vertex(at.x+side.x,at.y+side.y,run/256,1);Vertex(at.x-side.x,at.y-side.y,run/256,0);
                if(i>0){int a=i*2;QuadIndices(a-2,a-1,a,a+1);}
            }
            FinishGround(g);
        }
        void SetSafeProperties(MaterialPropertyBlock props)
        {
            int ns=Math.Min(16,heartZones==null?0:heartZones.Length),np=Math.Min(8,heartPillars==null?0:heartPillars.Length);
            for(int i=0;i<ns;i++)safeVectors[i]=new Vector4((float)heartZones[i][0],(float)heartZones[i][1],(float)heartZones[i][2],0);
            for(int i=0;i<np;i++)pillarVectors[i]=new Vector4((float)heartPillars[i][0],(float)heartPillars[i][1],(float)heartPillars[i][2],0);
            props.SetVectorArray("_SafeZones",safeVectors);props.SetVectorArray("_Pillars",pillarVectors);props.SetFloat("_SafeCount",ns);props.SetFloat("_PillarCount",np);
            props.SetVector("_Arena",new Vector4((float)arenaX,(float)arenaY,(float)(arenaX+arenaW),(float)(arenaY+arenaH)));props.SetVector("_Boss",new Vector4((float)heartX,(float)heartY,0,0));
        }
        void DrawHeart(DruidData d,int tick)
        {
            if(heartZones==null)return;
            double alpha=0;
            if(d!=null&&d.S=="bossHeartWind")alpha=.15+.25*(1-DruidRemainingVfxTimeline.Saturate(d.St2/(d.HbBeat==0?90:60)));
            else if(d!=null&&d.S=="bossHeartPause")alpha=.15+.25*DruidRemainingVfxTimeline.Saturate(d.St2/30);
            else alpha=.15*DruidRemainingVfxTimeline.Fade(tick-veinFade,30,30);
            if(alpha>0)GroundQuad(Resources.Load<Texture2D>(EarthDir+"root_vein_decal"),heartX,heartY,arenaW,arenaH,new Color(1,1,1,(float)alpha),Resources.Load<Texture2D>(EarthDir+"root_vein_decal_emit"),.08f,true);
            int age=tick-pulseBorn;if(age<0||age>=12)return;
            heartOuter=0;foreach(double x in new[]{arenaX,arenaX+arenaW})foreach(double y in new[]{arenaY,arenaY+arenaH})heartOuter=Math.Max(heartOuter,Math.Sqrt((x-heartX)*(x-heartX)+(y-heartY)*(y-heartY)));
            double r=DruidRemainingVfxTimeline.PulseRadius(age,heartSafe,heartOuter),width=DruidRemainingVfxTimeline.PulseWidth;
            var g=BeginGround(Resources.Load<Texture2D>(EarthDir+"pulse_band"),new Color(1,1,1,.4f),safe:true,repeat:true);if(g==null)return;
            const int n=192;
            for(int i=0;i<=n;i++)
            {double a=Math.PI*2*i/n;Vertex(heartX+Math.Cos(a)*r,heartY+Math.Sin(a)*r,i/12.0,1);Vertex(heartX+Math.Cos(a)*Math.Max(heartSafe,r-width),heartY+Math.Sin(a)*Math.Max(heartSafe,r-width),i/12.0,0);if(i>0){int k=i*2;QuadIndices(k-2,k-1,k,k+1);}}
            FinishGround(g);
        }

        // Called by the rig AFTER its real pose is sampled, BEFORE its existing Point RT capture. No second pixel camera or pose writer.
        void DrawGrabTubes()
        {
            foreach(var list in new[]{tendrils,drains})foreach(var g in list)g.Renderer.enabled=false;
            if(boundSim==null||bodyData==null||boundRig==null||barkMaterial==null)return;
            int tick=boundSim.TickCount;bool held=bodyData.S=="bossGrab";int breaking=tick-breakBorn;
            if(!held&&(breaking<0||breaking>=3))return;
            Vector3 hand,chest;if(!boundRig.TryGetGrabSockets(out hand,out chest))return;
            var player=boundSim.Player;var boss=World(bodyData.X,bodyData.Y,0);var foot=World(player.X,player.Y,0);
            Vector3 toward=(boss-foot);toward.y=0;if(toward.sqrMagnitude>1e-8f)toward.Normalize();
            var edge=foot+toward*(float)(player.Radius/100)+Vector3.up*(float)(DruidSlamVfxTimeline.HeroH*.35/100);
            for(int n=0;n<3;n++)
            {
                var tube=tendrils[n];BuildTube(tube,hand,edge,n,tick,held?1:1-breaking/3f);tube.Renderer.enabled=true;
                int age=tick-drainBorn;
                if(held&&age>=0&&age<10)
                {
                    var drain=drains[n];float p=age/10f;var a=Vector3.Lerp(edge,chest,p);var b=Vector3.Lerp(edge,chest,Math.Min(1,p+.18f));
                    // Every streak is >=14 Core px; no detached point particles.
                    if((b-a).sqrMagnitude<.0196f)b=a+(chest-edge).normalized*.14f;
                    BuildDrain(drain,a,b,n);drain.Renderer.enabled=true;
                }
            }
        }
        static Vector3 TubePoint(Vector3 start,Vector3 end,float t,int strand,int tick)
        {
            var dir=(end-start).normalized;var side=Vector3.Cross(dir,Vector3.up);if(side.sqrMagnitude<1e-6f)side=Vector3.right;else side.Normalize();
            return Vector3.Lerp(start,end,t)+side*(Mathf.Sin(t*Mathf.PI*2+strand*2.094f)*.07f*Mathf.Sin(t*Mathf.PI))+Vector3.up*(-.12f*Mathf.Sin(t*Mathf.PI));
        }
        void BuildTube(GroundBody tube,Vector3 start,Vector3 end,int strand,int tick,float reveal)
        {
            gv.Clear();guv.Clear();gi.Clear();gc.Clear();const int rings=18,sides=6;
            for(int i=0;i<=rings;i++)
            {
                float t=i/(float)rings;var at=TubePoint(start,end,t,strand,tick);var dir=(end-start).normalized;
                Vector3 axis=Vector3.Cross(dir,Vector3.up);if(axis.sqrMagnitude<1e-6f)axis=Vector3.right;else axis.Normalize();var up=Vector3.Cross(dir,axis).normalized;
                for(int j=0;j<=sides;j++)
                {
                    float a=j*Mathf.PI*2/sides,r=.035f*reveal*(.8f+.2f*Mathf.Sin(i*.8f+strand));
                    gv.Add(at+(axis*Mathf.Cos(a)+up*Mathf.Sin(a))*r);guv.Add(new Vector2(t*4,j/(float)sides));gc.Add(Color.white);
                    if(i>0&&j<sides){int k=i*(sides+1)+j;QuadIndices(k-sides-1,k-sides,k,k+1);}
                }
            }
            FinishGround(tube);tube.Mesh.RecalculateNormals();
        }
        void BuildDrain(GroundBody drain,Vector3 a,Vector3 b,int strand)
        {
            gv.Clear();guv.Clear();gi.Clear();gc.Clear();Vector3 dir=(b-a).normalized,side=Vector3.Cross(dir,Vector3.up).normalized*.025f;
            a+=Vector3.up*(strand*.025f);b+=Vector3.up*(strand*.025f);
            gv.Add(a-side);gv.Add(a+side);gv.Add(b-side);gv.Add(b+side);guv.Add(new Vector2(0,0));guv.Add(new Vector2(0,1));guv.Add(new Vector2(1,0));guv.Add(new Vector2(1,1));
            for(int i=0;i<4;i++)gc.Add(new Color(1,1,1,.45f));QuadIndices(0,1,2,3);FinishGround(drain);
            drain.Block.SetTexture("_MainTex",Resources.Load<Texture2D>(EarthDir+"amber_drain_streak"));drain.Block.SetFloat("_Opacity",1.1f);drain.Renderer.SetPropertyBlock(drain.Block);
        }
    }
}
