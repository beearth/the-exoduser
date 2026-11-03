using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Original web art at Core contact coordinates. All clocks are simulation
    // ticks: pause, M1 frame stepping and restart cannot consume a short effect.
    public sealed class CombatImpactView : IDisposable
    {
        sealed class Sheet {public Texture2D texture;public Sprite[] frames;public int cols,rows;}
        sealed class Clip {public SpriteRenderer renderer;public CombatClip spec;public Sheet sheet;public FeedbackEvent source;}
        sealed class Particle {public SpriteRenderer renderer;public int born,type;public float x,y,vx,vy,size,life,gravity,angle;public Color color;}
        sealed class ParryLine {public SpriteRenderer renderer;public FeedbackEvent source;public CombatParryPresentation.Spark spec;public int born;}
        sealed class DustPuff {public SpriteRenderer renderer;public int born;public float x,y;public CombatRollDust.Puff spec;}
        readonly CombatParryPresentation parry=new CombatParryPresentation();
        readonly CombatPresentationClock clock=new CombatPresentationClock();
        readonly List<DustPuff> dust=new List<DustPuff>();int rollBorn=-1000;
        readonly Sprite puff;readonly Texture2D puffTexture;
        readonly List<ParryLine> parryLines=new List<ParryLine>();
        readonly Sprite line;readonly Texture2D lineTexture;
        readonly SpriteRenderer meleeFlash;readonly Material meleeFlashMaterial;
        int parryBorn=-1000,meleeFlashBorn=-1000;
        public bool ParryPushIn;
        public float ParryCameraScale(int tick){return ReducedMotion?1:(float)parry.CameraScale(clock.Now(tick)-parryBorn,ParryPushIn);}
        // Called for each fixed step the simulation is held by the melee parry hit-stop.
        public void HoldFrame(){clock.Hold();}
        readonly Transform parent;
        readonly Dictionary<string,Sheet> sheets=new Dictionary<string,Sheet>();
        readonly List<Clip> clips=new List<Clip>();
        readonly List<Particle> particles=new List<Particle>();
        readonly Dictionary<long,int> particleCells=new Dictionary<long,int>();
        static readonly HashSet<SpriteRenderer> owned=new HashSet<SpriteRenderer>();
        readonly CombatImpactTimeline timeline=new CombatImpactTimeline();
        readonly CombatBloodDecals bloodDecals=new CombatBloodDecals();
        readonly SpriteRenderer[] bloodGround=new SpriteRenderer[CombatBloodDecals.Capacity];
        readonly Material bloodFloor;
        readonly Material add,alpha,whiteAlpha;
        readonly Sprite dot,ring;
        readonly Texture2D ringTexture;
        readonly System.Random random=new System.Random(20261103); // presentation RNG only
        public int Hits,Parries,Deaths,RollStarts,RollEnds,DrawnFrames,MissingSheets;
        public bool ReducedMotion;
        // Actual displayed body by enemy ID, after the final billboard/rig pose.
        // A future rig renderer supplies projected bounds through this same API.
        public Func<int,(Vector3 foot,Vector3 top)?> EnemyBody;
        public Func<int,double> EnemyChestRatio;
        // Collapse-start offset, not the full death duration. Enemy3D can derive
        // this from its deathTicks timeline; unset/flat keeps the exact tick 0.
        public Func<int,int> EnemyDeathDelay;
        Camera renderCamera;int renderTick;
        public float ShakeScale=1;
        int shakeBorn=-1000;float shake;
        int rollDustTick=-1;
        public int ActiveCount {get{return clips.Count+particles.Count+parryLines.Count+dust.Count;}}
        public static bool IsSprite(SpriteRenderer r){return owned.Contains(r);}
        public CombatImpactView(Transform parent) {
            this.parent=parent;
            var shader=Resources.Load<Shader>("Shaders/SkillAdditive");
            if(shader==null)throw new InvalidOperationException("Missing combat SkillAdditive shader");
            add=new Material(shader);add.SetFloat("_Flat",0);add.SetFloat("_DepthTest",8);
            alpha=new Material(shader);alpha.SetFloat("_Flat",0);alpha.SetFloat("_NormalBlend",1);alpha.SetFloat("_DstBlend",10);alpha.SetFloat("_DepthTest",8);
            whiteAlpha=new Material(alpha);whiteAlpha.SetFloat("_Flat",1);
            bloodFloor=new Material(alpha);bloodFloor.SetFloat("_DepthTest",4); // LEqual in the legacy floor path
            dot=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f),100);
            ParryPushIn=parry.ParsePushIn(Environment.GetCommandLineArgs());
            lineTexture=new Texture2D(64,4,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            var linePixels=new Color32[64*4];
            for(int y=0;y<4;y++)for(int x=0;x<64;x++)linePixels[y*64+x]=new Color32(255,255,255,(byte)(255*Mathf.Min(1,Mathf.Min(x,63-x)/8f)*(y==0||y==3?.35f:1)));
            lineTexture.SetPixels32(linePixels);lineTexture.Apply();line=Sprite.Create(lineTexture,new Rect(0,0,64,4),new Vector2(.5f,.5f),100);
            // Before transparent danger sprites (queue3000), after opaque terrain.
            meleeFlashMaterial=new Material(alpha){renderQueue=2999};
            meleeFlash=Make("Melee parry screen flash below danger",meleeFlashMaterial);meleeFlash.sprite=dot;meleeFlash.sortingOrder=-32700;meleeFlash.enabled=false;
            ringTexture=new Texture2D(32,32,TextureFormat.RGBA32,false){filterMode=FilterMode.Point};var px=new Color32[32*32];
            for(int y=0;y<32;y++)for(int x=0;x<32;x++)px[y*32+x]=new Color32(255,255,255,(byte)(x==0||x==31||y==0||y==31?255:0));
            ringTexture.SetPixels32(px);ringTexture.Apply();ring=Sprite.Create(ringTexture,new Rect(0,0,32,32),new Vector2(.5f,.5f),100);
            // Soft lobed dust puff: five overlapping smooth lobes, no noise or grain, alpha 0 at the border.
            puffTexture=new Texture2D(64,64,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};var puffPixels=new Color32[64*64];
            var lobes=new[]{new Vector3(0,0,.40f),new Vector3(.17f,.07f,.28f),new Vector3(-.16f,.09f,.28f),new Vector3(.05f,-.15f,.26f),new Vector3(-.09f,-.11f,.24f)};
            for(int y=0;y<64;y++)for(int x=0;x<64;x++){float u=(x+.5f)/64-.5f,v=(y+.5f)/64-.5f,sum=0;foreach(var l in lobes){float dx=u-l.x,dy=v-l.y,sigma=l.z*.5f;sum+=Mathf.Exp(-(dx*dx+dy*dy)/(2*sigma*sigma));}
                float edge=Mathf.Clamp01((.5f-Mathf.Sqrt(u*u+v*v))/.12f);puffPixels[y*64+x]=new Color32(255,255,255,(byte)(255*(1-Mathf.Exp(-sum*1.6f))*edge));}
            puffTexture.SetPixels32(puffPixels);puffTexture.Apply();puff=Sprite.Create(puffTexture,new Rect(0,0,64,64),new Vector2(.5f,.5f),100);
            // Actor projection/grounding happens in LateUpdate. Read final bounds
            // immediately before the camera renders (URP and Built-in).
            RenderPipelineManager.beginCameraRendering+=BeforeCamera;
            Camera.onPreCull+=BeforeBuiltinCamera;
        }
        SpriteRenderer Make(string name,Material material) {
            var go=new GameObject(name);go.transform.SetParent(parent,false);
            var r=go.AddComponent<SpriteRenderer>();r.sharedMaterial=material;r.sortingOrder=CombatImpactTimeline.SortOrder;owned.Add(r);return r;
        }
        Sheet Load(string key,int cols,int rows) {
            string id=key+":"+cols+":"+rows;
            if(sheets.TryGetValue(id,out var cached))return cached;
            var tex=Resources.Load<Texture2D>("Art/vfx/combat/"+key);
            if(tex==null){MissingSheets++;Debug.LogWarning("[CombatImpact] missing sheet "+key);sheets[id]=null;return null;}
            int w=tex.width/cols,h=tex.height/rows;
            var sheet=new Sheet{texture=tex,cols=cols,rows=rows,frames=new Sprite[cols*rows]};
            for(int i=0;i<sheet.frames.Length;i++)sheet.frames[i]=Sprite.Create(tex,new Rect(i%cols*w,tex.height-(i/cols+1)*h,w,h),new Vector2(.5f,.5f),100);
            sheets[id]=sheet;return sheet;
        }
        public void Handle(FeedbackEvent e) {
            bool death=e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath;
            int deathDelay=death&&NativeRemodel3D.Active&&e.TargetId!=0&&EnemyDeathDelay!=null?Math.Max(0,EnemyDeathDelay(e.TargetId)):0;
            // Decals have their own pool and must survive the transient hit budget.
            if(CombatBloodDecals.ShouldStamp(e))StampBlood(e,deathDelay);
            bool hit=e.VisualOnly&&(e.Kind==FeedbackKind.EnemyHit||e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit);
            if(hit&&!timeline.AdmitHit(e.Tick,e.IsBoss))return;
            var plan=CombatImpactTimeline.Plan(e);
            // Latest warm line sparks for all parries; retain G2 feedback data.
            // Push-in candidate (R4) applies to melee parries only; bullet parries keep the G1 shake 4 because they are frequent.
            if(e.Kind==FeedbackKind.Parry){Parries++;bool melee=e.MeleeParry||parry.IsMelee(e);float amount=e.ParryShake>0?e.ParryShake:melee?6:4;
                if(melee&&ParryPushIn){parryBorn=clock.Now(e.Tick);amount=Mathf.Min(amount,2);}ParryLines(e);Shake(clock.Now(e.Tick),amount);}
            if(hit){Hits++;HitParts(e);}
            if((e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath)&&e.Source!="druid_sink") {
                Deaths++;
                // RETOUCH 4: the web's white square ring, white specks and pink/orange/bright-red dot bursts are gone. Death reads
                // from the dark matte blood sheet and the ground stain only (VFX master §2.2 blood row, PBZ R6/R7, no dots).
            }
            if(e.Kind==FeedbackKind.Roll){if(e.Step==0){RollStarts++;rollBorn=e.Tick;Shake(clock.Now(e.Tick),2);}else RollEnds++;RollDust(e);}
            foreach(var spec in plan) {
                if(death)spec.Delay+=deathDelay;
                if(spec.Mode==CombatClipMode.Blood)spec.Angle+=R(-35,70)*Math.PI/180;
                var sheet=Load(spec.Sheet,spec.Cols,spec.Rows);
                if(sheet==null&&spec.Fallback!=null){
                    int cols=spec.Mode==CombatClipMode.Death?4:9,rows=spec.Mode==CombatClipMode.Death?4:1;
                    sheet=Load(spec.Fallback,cols,rows);spec.Cols=cols;spec.Rows=rows;spec.Frames=cols*rows;
                }
                if(sheet==null)continue;
                // Web impact and boom pools each hold twelve contacts. Evict a
                // whole oldest contact (including its burst), never one layer.
                EnforceCapacity(spec.Mode,e);
                int cap=spec.Mode==CombatClipMode.Death?20:60;
                if(clips.Count>=cap){ReleaseRenderer(clips[0].renderer);clips.RemoveAt(0);}
                var renderer=Make("Combat "+e.Kind+" "+spec.Sheet,spec.Flat?whiteAlpha:spec.Additive?add:alpha);
                clips.Add(new Clip{renderer=renderer,spec=spec,sheet=sheet,source=e});
            }
        }
        void StampBlood(FeedbackEvent e,int delay=0) {
            var sheet=Load("Blood_FBF_4x4_dark",4,4);if(sheet==null)return;
            int slot=bloodDecals.Add(e,12+random.Next(4),R(0,Mathf.PI*2),delay);
            var stamp=bloodDecals.Slots[slot];var renderer=bloodGround[slot];
            if(renderer==null){renderer=Make("Pooled ground blood",bloodFloor);renderer.sortingOrder=-18998;
                renderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;renderer.receiveShadows=false;
                bloodGround[slot]=renderer;NativeGroundSkillSurface.Mark(renderer);}
            renderer.sprite=sheet.frames[stamp.Frame];
            // GroundSkillSurface projects this XY footprint onto actual receiver
            // depth in 3D (including slopes/deck gaps), rather than a floating card.
            renderer.transform.SetPositionAndRotation(ImpactSpace.Point(stamp.X,stamp.Y,.002f),Quaternion.Euler(0,0,(float)stamp.Angle*Mathf.Rad2Deg));
            renderer.transform.localScale=Vector3.one*(stamp.Width/renderer.sprite.rect.width);
            renderer.color=new Color(.9f,.9f,.9f,1);renderer.enabled=delay==0&&(!NativeRemodel3D.Active||NativeGroundSkillProjection.Available);
            NativeGroundSkillSurface.Project(renderer);
        }
        void EnforceCapacity(CombatClipMode mode,FeedbackEvent incoming) {
            if(mode!=CombatClipMode.Boom&&mode!=CombatClipMode.Impact)return;
            int count=0;FeedbackEvent oldest=null;
            foreach(var c in clips)if(c.spec.Mode==mode){if(oldest==null)oldest=c.source;if(c.source!=incoming)count++;}
            int cap=mode==CombatClipMode.Boom?CombatImpactTimeline.BoomCapacity:CombatImpactTimeline.HitCapacity;
            if(count<cap||oldest==null)return;
            for(int i=clips.Count-1;i>=0;i--)if(clips[i].source==oldest){ReleaseRenderer(clips[i].renderer);clips.RemoveAt(i);}
        }
        static Color Hex(string value){ColorUtility.TryParseHtmlString(value,out var c);return c;}
        static Color ElementColor(int el){return Hex(new[]{"#bbbbbb","#ff5522","#3388ff","#9933cc","#ffee00","#ff88cc","#88aa44"}[Mathf.Clamp(el,0,6)]);}
        float R(float low,float span){return low+(float)random.NextDouble()*span;}
        void Shake(int tick,float amount){float current=shake*Mathf.Pow(.86f,Mathf.Max(0,tick-shakeBorn));shakeBorn=tick;shake=Mathf.Max(current,amount);}
        public Vector3 CameraOffset(int tick) {
            float age=clock.Now(tick)-shakeBorn;if(ReducedMotion||age<0)return Vector3.zero;
            float amplitude=shake*Mathf.Pow(.86f,age)*ShakeScale;if(amplitude<.3f)return Vector3.zero;
            float a=amplitude/100;
            return new Vector3(Mathf.Cos(age*2.399f)*a,Mathf.Sin(age*2.13f)*a,0);
        }
        void AddParticle(FeedbackEvent e,float vx,float vy,Color col,float size,float life,float gravity,int type=0,float angle=0) {
            if(particles.Count>=256){ReleaseRenderer(particles[0].renderer);particles.RemoveAt(0);}
            var r=Make("Combat particle "+e.Kind,alpha);r.sprite=type==3?ring:dot;
            particles.Add(new Particle{renderer=r,born=e.Tick,x=e.X,y=e.Y,vx=vx,vy=vy,color=col,size=size,life=life,gravity=gravity,type=type,angle=angle});
        }
        void ParryLines(FeedbackEvent e) {
            var specs=parry.Sparks(e,unchecked(e.Tick*397+e.Step*17+(int)e.X));
            // Four complete contacts maximum; no per-cell culling of the 130-line peak.
            if(parryLines.Count+specs.Length>520){foreach(var p in parryLines)ReleaseRenderer(p.renderer);parryLines.Clear();}
            foreach(var spec in specs){var r=Make("Melee parry line",add);r.sprite=line;parryLines.Add(new ParryLine{renderer=r,source=e,spec=spec,born=clock.Now(e.Tick)});}
        }
        public void DrawMeleeParry(int tick,Camera camera,SpriteRenderer hero) {
            if(camera==null)return;
            float height=96*camera.pixelHeight/900f;
            if(hero!=null&&hero.enabled){var b=hero.bounds;float lo=float.MaxValue,hi=float.MinValue;
                for(int corner=0;corner<8;corner++){var point=b.center+Vector3.Scale(b.extents,new Vector3((corner&1)==0?-1:1,(corner&2)==0?-1:1,(corner&4)==0?-1:1));
                    float y=camera.WorldToScreenPoint(point).y;lo=Mathf.Min(lo,y);hi=Mathf.Max(hi,y);}height=Mathf.Max(1,hi-lo);}
            float plane=camera.nearClipPlane+.1f;
            for(int i=0;i<parryLines.Count;) {
                var p=parryLines[i];float age=clock.Now(tick)-p.born;var spec=p.spec;
                if(age<0||age>=spec.Life){ReleaseRenderer(p.renderer);parryLines.RemoveAt(i);continue;}
                float opacity=(float)parry.SparkAlpha(spec,age);var origin=camera.WorldToScreenPoint(NativeRemodel3D.Point(p.source.X,p.source.Y));
                p.renderer.enabled=opacity>0&&origin.z>0;if(!p.renderer.enabled){i++;continue;}
                var aim=camera.WorldToScreenPoint(NativeRemodel3D.Point(p.source.X+Mathf.Cos((float)spec.Angle)*100,p.source.Y+Mathf.Sin((float)spec.Angle)*100));
                var direction=new Vector2(aim.x-origin.x,aim.y-origin.y).normalized;
                float a=Mathf.Max(0,age-spec.Delay),travel=height*(float)spec.Speed*a;
                var centre=new Vector2(origin.x,origin.y)+direction*travel+Vector2.down*(height*.00065f*a*a);
                float length=height*(float)parry.SparkLength(spec,age),thickness=(float)spec.Thickness*camera.pixelHeight/900f;
                // Lifetime taper never shrinks below one reference pixel or key length×.05.
                thickness=Mathf.Max(camera.pixelHeight/900f,thickness*(1-age/spec.Life*.5f));
                var at=camera.ScreenToWorldPoint(new Vector3(centre.x,centre.y,plane));
                var right=camera.ScreenToWorldPoint(new Vector3(centre.x+length,centre.y,plane));
                var up=camera.ScreenToWorldPoint(new Vector3(centre.x,centre.y+thickness,plane));
                p.renderer.transform.SetPositionAndRotation(at,camera.transform.rotation*Quaternion.Euler(0,0,Mathf.Atan2(direction.y,direction.x)*Mathf.Rad2Deg));
                p.renderer.transform.localScale=new Vector3(Vector3.Distance(at,right)/line.bounds.size.x,Vector3.Distance(at,up)/line.bounds.size.y,1);
                var color=Color.Lerp(Hex("#f5e5d5"),Hex("#f0debd"),(float)spec.Color);color.a=opacity;p.renderer.color=color;i++;
            }
            float flash=ReducedMotion?0:(float)parry.FlashAlpha(clock.Now(tick)-meleeFlashBorn,QualitySettings.activeColorSpace==ColorSpace.Linear);
            meleeFlash.enabled=flash>0;
            if(flash>0){var centre=camera.ViewportToWorldPoint(new Vector3(.5f,.5f,plane));var corner=camera.ViewportToWorldPoint(new Vector3(1,1,plane));
                meleeFlash.transform.SetPositionAndRotation(centre,camera.transform.rotation);
                meleeFlash.transform.localScale=new Vector3(Vector3.Dot(corner-centre,camera.transform.right)*2/dot.bounds.size.x,Vector3.Dot(corner-centre,camera.transform.up)*2/dot.bounds.size.y,1);
                meleeFlash.color=new Color(1,244/255f,208/255f,flash);}
        }
        void HitParts(FeedbackEvent e) {
            var ec=ElementColor(e.Element);var ep=e.Element>=0&&e.Element<6?Hex(new[]{"#dddddd","#ff6622","#44aaff","#bb55ee","#ffee44","#ffdd55"}[e.Element]):ec;
            int n=6+random.Next(3);
            for(int i=0;i<n;i++){float a=e.Angle+Mathf.PI+R(-1.1f,2.2f),v=R(2,4);AddParticle(e,Mathf.Cos(a)*v,Mathf.Sin(a)*v,i%2==1?ec:ep,R(1.5f,2),R(6,5),.06f,i%3==0?2:0,a);}
            if(e.Element==1)for(int i=0;i<3;i++){float a=e.Angle+Mathf.PI+R(-.9f,1.8f);AddParticle(e,Mathf.Cos(a)*3,Mathf.Sin(a)*3-1,Hex("#ff6600"),R(2,2),R(8,4),-.04f,2,a);}
            if(e.Element==2)for(int i=0;i<3;i++){float a=R(0,Mathf.PI*2);AddParticle(e,Mathf.Cos(a)*2,Mathf.Sin(a)*2,Hex("#88eeff"),R(2,1),R(10,5),0);}
            if(e.Element==3)AddParticle(e,0,0,Hex("#aa44ff"),6,8,0,3);
            if(e.Element==4)for(int i=0;i<4;i++){float a=R(0,Mathf.PI*2),v=R(3,4);AddParticle(e,Mathf.Cos(a)*v,Mathf.Sin(a)*v,Hex("#ffff88"),R(1.5f,1),R(4,3),0,2,a);}
        }
        void RollDust(FeedbackEvent e){foreach(var spec in CombatRollDust.Burst(e,unchecked(e.Tick*131+e.Step*7+(int)e.X)))AddPuff(e.Tick,e.X,e.Y,spec);}
        void AddPuff(int tick,float x,float y,CombatRollDust.Puff spec){
            if(dust.Count>=24){ReleaseRenderer(dust[0].renderer);dust.RemoveAt(0);}
            var r=Make("Roll dust puff",alpha);r.sprite=puff;dust.Add(new DustPuff{renderer=r,born=tick,x=x,y=y,spec=spec});
        }
        static void Place(SpriteRenderer r,float x,float y,float width,float height,float angle,Camera camera) {
            var position=NativeRemodel3D.Point(x,y);
            if(NativeRemodel3D.Active){position+=Vector3.up*.03f;r.transform.rotation=(camera!=null?camera.transform.rotation:Quaternion.Euler(NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0))*Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);}
            else r.transform.rotation=Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);
            r.transform.position=position;r.transform.localScale=new Vector3(width/r.sprite.rect.width,height/r.sprite.rect.height,1);
        }
        void BeforeCamera(ScriptableRenderContext context,Camera camera){DrawEnemyHits(camera);}
        void BeforeBuiltinCamera(Camera camera){if(GraphicsSettings.currentRenderPipeline==null)DrawEnemyHits(camera);}
        void DrawEnemyHits(Camera camera) {
            if(camera==null||camera!=renderCamera||!NativeRemodel3D.Active||camera.orthographic||EnemyBody==null)return;
            foreach(var c in clips) {
                if(!c.renderer.enabled||!CombatHitAnchor.Applies(true,c.source.TargetId,c.source.Kind,c.spec.Mode))continue;
                var body=EnemyBody(c.source.TargetId);if(!body.HasValue)continue;
                var foot=camera.WorldToScreenPoint(body.Value.foot);var top=camera.WorldToScreenPoint(body.Value.top);
                if(foot.z<=0||top.z<=0)continue;
                var anchor=CombatHitAnchor.Resolve(foot.y,foot.y,top.y,c.source.Kind,
                    EnemyChestRatio!=null?EnemyChestRatio(c.source.TargetId):double.NaN,c.source.IsBoss||c.source.Size>=18);
                if(!anchor.UseBody)continue;
                float w=(float)anchor.DrawWidth,h=w*c.renderer.sprite.rect.height/c.renderer.sprite.rect.width/(float)c.spec.Stretch;
                var screen=new Vector3(foot.x,foot.y+(float)anchor.OffsetY,foot.z);
                float angle=-(float)c.spec.Angle;
                if(c.spec.Mode==CombatClipMode.Blood) {
                    var a=camera.WorldToScreenPoint(NativeRemodel3D.Point(c.source.X,c.source.Y));
                    var b=camera.WorldToScreenPoint(NativeRemodel3D.Point(c.source.X+Mathf.Cos((float)c.spec.Angle)*100,c.source.Y+Mathf.Sin((float)c.spec.Angle)*100));
                    angle=Mathf.Atan2(b.y-a.y,b.x-a.x);
                    float offset=w*.3f*Mathf.Min(1,(renderTick-c.source.Tick)/6f);
                    screen.x+=Mathf.Cos(angle)*offset;screen.y+=Mathf.Sin(angle)*offset;
                }
                var at=camera.ScreenToWorldPoint(screen);
                var right=camera.ScreenToWorldPoint(screen+Vector3.right*w);var up=camera.ScreenToWorldPoint(screen+Vector3.up*h);
                c.renderer.transform.SetPositionAndRotation(at,camera.transform.rotation*Quaternion.Euler(0,0,angle*Mathf.Rad2Deg));
                // Stretch changes aspect only; the final width obeys the policy.
                c.renderer.transform.localScale=new Vector3(Vector3.Distance(at,right)/c.renderer.sprite.bounds.size.x,Vector3.Distance(at,up)/c.renderer.sprite.bounds.size.y,1);
            }
        }
        public void Update(Simulation simulation,Camera camera,SpriteRenderer hero=null) {
            renderCamera=camera;renderTick=simulation.TickCount;
            int tick=simulation.TickCount;
            DrawMeleeParry(tick,camera,hero);
            for(int i=0;i<bloodGround.Length;i++)if(bloodGround[i]!=null){var r=bloodGround[i];float fade=(float)bloodDecals.Alpha(i,tick);
                r.enabled=fade>0&&(!NativeRemodel3D.Active||NativeGroundSkillProjection.Available);r.color=new Color(.9f,.9f,.9f,fade);NativeGroundSkillSurface.Project(r);}
            if(rollDustTick!=tick){
                rollDustTick=tick;
                if(simulation.RollActive&&CombatRollDust.Trail(tick-rollBorn)){var p=simulation.Player;AddPuff(tick,p.X+R(-p.Radius*.4f,p.Radius*.8f),p.Y+p.Radius*.5f,CombatRollDust.TrailPuff(tick));}
            }
            int drawnHits=0;
            for(int i=0;i<clips.Count;) {
                var c=clips[i];float age=tick-c.source.Tick;int frame=c.spec.Frame(age);
                if(age>=c.spec.Life+c.spec.Delay){ReleaseRenderer(c.renderer);clips.RemoveAt(i);continue;}
                bool draw=frame>=0;
                if(c.spec.Mode==CombatClipMode.Impact&&draw)draw=drawnHits++<CombatImpactTimeline.MaxHitDraw;
                c.renderer.enabled=draw;if(!draw){i++;continue;}
                c.renderer.sprite=c.sheet.frames[Mathf.Clamp(frame,0,c.sheet.frames.Length-1)];
                float w=(float)c.spec.DrawWidth(age,c.renderer.sprite.rect.width),h=w*c.renderer.sprite.rect.height/c.renderer.sprite.rect.width;
                float angle=(float)c.spec.Angle,x=c.source.X,y=c.source.Y;
                if(c.spec.Mode==CombatClipMode.Blood){
                    // Move the stream away from the contact, preserving its
                    // attack-direction cone; never leave a body-sized centre blob.
                    float offset=w*.3f*Mathf.Min(1,age/6);x+=Mathf.Cos(angle)*offset;y+=Mathf.Sin(angle)*offset;
                    if(NativeRemodel3D.Active&&camera!=null){var a=camera.WorldToScreenPoint(NativeRemodel3D.Point(x,y));
                        var b=camera.WorldToScreenPoint(NativeRemodel3D.Point(x+Mathf.Cos(angle)*100,y+Mathf.Sin(angle)*100));
                        angle=-Mathf.Atan2(b.y-a.y,b.x-a.x);}
                }
                Place(c.renderer,x,y,w*(float)c.spec.Stretch,h,angle,camera);
                c.renderer.color=new Color(1,1,1,(float)c.spec.Alpha(age));DrawnFrames++;i++;
            }
            particleCells.Clear();int drawnParticles=0;
            for(int i=0;i<particles.Count;) {
                var p=particles[i];float age=tick-p.born;
                if(age>=p.life||age<0){ReleaseRenderer(p.renderer);particles.RemoveAt(i);continue;}
                float x=p.x+(float)CombatImpactTimeline.ParticleTravel(p.vx,0,age),y=p.y+(float)CombatImpactTimeline.ParticleTravel(p.vy,p.gravity,age);
                long cell=((long)Mathf.FloorToInt(x/32)<<32)|(uint)Mathf.FloorToInt(y/32);particleCells.TryGetValue(cell,out int used);
                var viewport=camera!=null?camera.WorldToViewportPoint(NativeRemodel3D.Point(x,y)):new Vector3(.5f,.5f,1);
                p.renderer.enabled=drawnParticles<80&&used<3&&viewport.z>0&&viewport.x>-.1f&&viewport.x<1.1f&&viewport.y>-.1f&&viewport.y<1.1f;
                if(!p.renderer.enabled){i++;continue;}drawnParticles++;particleCells[cell]=used+1;
                var color=p.color;color.a=Mathf.Clamp01((1-age/p.life)*2.1f);p.renderer.color=color;
                float size=p.type==3?p.size*(1+age/p.life*2)*2:p.size;
                Place(p.renderer,x,y,p.type==2?size*3:size,p.type==2?1:size,p.angle,camera);i++;
            }
            for(int i=0;i<dust.Count;) {
                var d=dust[i];float age=tick-d.born;var spec=d.spec;
                if(age<0||age>=spec.Delay+spec.Life){ReleaseRenderer(d.renderer);dust.RemoveAt(i);continue;}
                float a=(float)CombatRollDust.Alpha(spec,age);d.renderer.enabled=a>0;if(a<=0){i++;continue;}
                var color=Color.Lerp(Hex("#6e6050"),Hex("#9a8a72"),(float)spec.Shade);color.a=a;d.renderer.color=color;
                float travel=(float)CombatRollDust.Travel(spec,age),w=(float)CombatRollDust.Width(spec,age);
                Place(d.renderer,d.x+(float)spec.Dx*travel,d.y+(float)spec.Dy*travel,w,w*.7f,0,camera);i++;
            }
        }
        public void DrawFlash(int tick) { // same UI flash path, below HUD; no simulation hit-stop
            if(ReducedMotion)return;
            float alphaFlash=FlashAlpha(tick);
            if(alphaFlash>0){var c=flashColor;c.a=alphaFlash;NativeUiViewport.FillScreen(c);}
        }
        // M1 uses a separate deterministic view without consuming the live view's
        // RNG or clocks. Preserve the exact enabled flags of its existing sprites.
        public Action HideForProbe() {
            var saved=new List<KeyValuePair<SpriteRenderer,bool>>();
            Action<SpriteRenderer> hide=r=>{if(r!=null){saved.Add(new KeyValuePair<SpriteRenderer,bool>(r,r.enabled));r.enabled=false;}};
            foreach(var c in clips)hide(c.renderer);foreach(var p in particles)hide(p.renderer);foreach(var p in parryLines)hide(p.renderer);foreach(var d in dust)hide(d.renderer);
            foreach(var r in bloodGround)hide(r);hide(meleeFlash);
            return ()=>{foreach(var pair in saved)if(pair.Key!=null)pair.Key.enabled=pair.Value;};
        }
        int flashBorn=-1000;float flashPeak;Color flashColor;
        public float FlashAlpha(int tick){return Mathf.Max(0,flashPeak-Mathf.Max(0,tick-flashBorn)*.08f);}
        public void Flash(FeedbackEvent e){
            // Screen flash only for a perfect melee parry (R2); bullet parries and blocks get none.
            if(e.Kind==FeedbackKind.Parry){if(parry.HasFlash(e))meleeFlashBorn=clock.Now(e.Tick);return;}
            if(!e.VisualOnly)return;
            float strength=e.IsBoss?.2f:.1f;
            flashPeak=Mathf.Min(.5f,FlashAlpha(e.Tick)+strength*.5f);flashBorn=e.Tick;flashColor=ElementColor(e.Element);
        }
        static void Release(UnityEngine.Object o){if(Application.isPlaying)UnityEngine.Object.Destroy(o);else UnityEngine.Object.DestroyImmediate(o);}
        static void ReleaseRenderer(SpriteRenderer r){owned.Remove(r);Release(r.gameObject);}
        public void Reset(){foreach(var c in clips)ReleaseRenderer(c.renderer);clips.Clear();foreach(var p in particles)ReleaseRenderer(p.renderer);particles.Clear();foreach(var p in parryLines)ReleaseRenderer(p.renderer);parryLines.Clear();foreach(var d in dust)ReleaseRenderer(d.renderer);dust.Clear();rollBorn=-1000;clock.Reset();meleeFlash.enabled=false;parryBorn=meleeFlashBorn=-1000;timeline.Reset();bloodDecals.Reset();foreach(var r in bloodGround)if(r!=null){r.enabled=false;NativeGroundSkillSurface.Project(r);}rollDustTick=-1;shakeBorn=flashBorn=-1000;shake=flashPeak=0;}
        public void Dispose(){RenderPipelineManager.beginCameraRendering-=BeforeCamera;Camera.onPreCull-=BeforeBuiltinCamera;Reset();ReleaseRenderer(meleeFlash);Release(meleeFlashMaterial);Release(line);Release(lineTexture);foreach(var r in bloodGround)if(r!=null)ReleaseRenderer(r);foreach(var sheet in sheets.Values)if(sheet!=null)foreach(var frame in sheet.frames)Release(frame);sheets.Clear();Release(dot);Release(ring);Release(ringTexture);Release(puff);Release(puffTexture);Release(add);Release(alpha);Release(whiteAlpha);Release(bloodFloor);}
    }
}
