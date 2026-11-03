using System;
using System.Collections.Generic;
using UnityEngine;
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
        public float ShakeScale=1;
        int shakeBorn=-1000;float shake;
        int rollDustTick=-1;
        public int ActiveCount {get{return clips.Count+particles.Count;}}
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
            ringTexture=new Texture2D(32,32,TextureFormat.RGBA32,false){filterMode=FilterMode.Point};var px=new Color32[32*32];
            for(int y=0;y<32;y++)for(int x=0;x<32;x++)px[y*32+x]=new Color32(255,255,255,(byte)(x==0||x==31||y==0||y==31?255:0));
            ringTexture.SetPixels32(px);ringTexture.Apply();ring=Sprite.Create(ringTexture,new Rect(0,0,32,32),new Vector2(.5f,.5f),100);
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
            // Decals have their own pool and must survive the transient hit budget.
            if(CombatBloodDecals.ShouldStamp(e))StampBlood(e);
            bool hit=e.VisualOnly&&(e.Kind==FeedbackKind.EnemyHit||e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit);
            if(hit&&!timeline.AdmitHit(e.Tick,e.IsBoss))return;
            var plan=CombatImpactTimeline.Plan(e);
            if(e.Kind==FeedbackKind.Parry){Parries++;ParryParts(e);Shake(e.Tick,14);}
            if(hit){Hits++;HitParts(e);}
            if((e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath)&&e.Source!="druid_sink") {
                Deaths++;
                AddParticle(e,0,0,Color.white,Mathf.Max(8,e.Size),e.IsBoss?12:8,0,3);
                if(e.IsBoss)AddParticle(e,0,0,Hex("#ff5577"),Mathf.Max(12,e.Size*1.5f),15,0,3);
                for(int i=0;i<(e.IsBoss?3:1);i++)AddParticle(e,R(-.15f,.3f),R(-.15f,.3f),Color.white,e.IsBoss?6:4,e.IsBoss?6:4,0,1);
                if(e.IsBoss||e.Size>=18)Burst(e,e.IsBoss?26:16,e.IsBoss?Hex("#ff5577"):Hex("#ffaa66"),e.IsBoss?4.6f:3.2f,e.IsBoss?3.2f:2,2.4f,2.8f,14,10,.08f,true);
                Burst(e,e.IsBoss?10:6,Hex("#880000"),1.5f,3,1.5f,2.5f,12,10,.12f,false);
            }
            if(e.Kind==FeedbackKind.Roll){if(e.Step==0){RollStarts++;Shake(e.Tick,2);}else RollEnds++;Dust(e);}
            foreach(var spec in plan) {
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
        void StampBlood(FeedbackEvent e) {
            var sheet=Load("Blood_FBF_4x4_dark",4,4);if(sheet==null)return;
            int slot=bloodDecals.Add(e,12+random.Next(4),R(0,Mathf.PI*2));
            var stamp=bloodDecals.Slots[slot];var renderer=bloodGround[slot];
            if(renderer==null){renderer=Make("Pooled ground blood",bloodFloor);renderer.sortingOrder=-18998;
                renderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;renderer.receiveShadows=false;
                bloodGround[slot]=renderer;NativeGroundSkillSurface.Mark(renderer);}
            renderer.sprite=sheet.frames[stamp.Frame];
            // GroundSkillSurface projects this XY footprint onto actual receiver
            // depth in 3D (including slopes/deck gaps), rather than a floating card.
            renderer.transform.SetPositionAndRotation(ImpactSpace.Point(stamp.X,stamp.Y,.002f),Quaternion.Euler(0,0,(float)stamp.Angle*Mathf.Rad2Deg));
            renderer.transform.localScale=Vector3.one*(stamp.Width/renderer.sprite.rect.width);
            renderer.color=new Color(.9f,.9f,.9f,1);renderer.enabled=!NativeRemodel3D.Active||NativeGroundSkillProjection.Available;
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
        static Color ParryColor(FeedbackEvent e){
            // Existing feedback tags take precedence; rainbow has no single
            // element, so use the sacred core of its four-layer contact.
            if(e.Source=="waterBean")return Hex("#dcebf0");
            if(e.Source=="physicalProjectile")return Hex("#efe6d2");
            if(e.SampleKey=="red")return Hex("#ffd9a0");
            if(e.SampleKey=="rainbow")return Hex("#fff2d6");
            return Hex(new[]{"#efe6d2","#ffd9a0","#e8f3f8","#cdb2e0","#fff4d0","#fff2d6","#dcc8a4"}[Mathf.Clamp(e.Element,0,6)]);
        }
        float R(float low,float span){return low+(float)random.NextDouble()*span;}
        void Shake(int tick,float amount){float current=shake*Mathf.Pow(.86f,Mathf.Max(0,tick-shakeBorn));shakeBorn=tick;shake=Mathf.Max(current,amount);}
        public Vector3 CameraOffset(int tick) {
            float age=tick-shakeBorn;if(ReducedMotion||age<0)return Vector3.zero;
            float amplitude=shake*Mathf.Pow(.86f,age)*ShakeScale;if(amplitude<.3f)return Vector3.zero;
            float a=amplitude/100;
            return new Vector3(Mathf.Cos(age*2.399f)*a,Mathf.Sin(age*2.13f)*a,0);
        }
        void AddParticle(FeedbackEvent e,float vx,float vy,Color col,float size,float life,float gravity,int type=0,float angle=0) {
            if(particles.Count>=256){ReleaseRenderer(particles[0].renderer);particles.RemoveAt(0);}
            var r=Make("Combat particle "+e.Kind,alpha);r.sprite=type==3?ring:dot;
            particles.Add(new Particle{renderer=r,born=e.Tick,x=e.X,y=e.Y,vx=vx,vy=vy,color=col,size=size,life=life,gravity=gravity,type=type,angle=angle});
        }
        void ParryParts(FeedbackEvent e) {
            for(int i=0;i<12;i++){float a=Mathf.PI*2*i/12;AddParticle(e,Mathf.Cos(a)*R(3,4),Mathf.Sin(a)*R(3,4),i%3==0?Color.white:ParryColor(e),R(2,3),R(10,6),0);}
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
        void Burst(FeedbackEvent e,int n,Color col,float speed,float speedRange,float size,float sizeRange,float life,float lifeRange,float gravity,bool radial) {
            for(int i=0;i<n;i++) {
                float a=radial?Mathf.PI*2*i/n:e.Angle+Mathf.PI+R(-1.1f,2.2f),v=R(speed,speedRange);
                AddParticle(e,Mathf.Cos(a)*v,Mathf.Sin(a)*v,col,R(size,sizeRange),R(life,lifeRange),gravity);
            }
        }
        void Dust(FeedbackEvent e){ // web addParts truncates requested count × .6
            int n=(int)((e.Step==0?5:4)*.6f);
            for(int i=0;i<n;i++)AddParticle(e,R(-3.5f,7),R(-3.5f,7),Hex("#6e6050"),R(2,4),R(12,12),0);
        }
        static void Place(SpriteRenderer r,float x,float y,float width,float height,float angle,Camera camera) {
            var position=NativeRemodel3D.Point(x,y);
            if(NativeRemodel3D.Active){position+=Vector3.up*.03f;r.transform.rotation=(camera!=null?camera.transform.rotation:Quaternion.Euler(NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0))*Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);}
            else r.transform.rotation=Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);
            r.transform.position=position;r.transform.localScale=new Vector3(width/r.sprite.rect.width,height/r.sprite.rect.height,1);
        }
        public void Update(Simulation simulation,Camera camera) {
            int tick=simulation.TickCount;
            for(int i=0;i<bloodGround.Length;i++)if(bloodGround[i]!=null){var r=bloodGround[i];float fade=(float)bloodDecals.Alpha(i,tick);
                r.enabled=fade>0&&(!NativeRemodel3D.Active||NativeGroundSkillProjection.Available);r.color=new Color(.9f,.9f,.9f,fade);NativeGroundSkillSurface.Project(r);}
            if(rollDustTick!=tick){
                rollDustTick=tick;
                if(simulation.RollActive&&random.NextDouble()>.4){var p=simulation.Player;var e=new FeedbackEvent{Kind=FeedbackKind.Roll,Tick=tick,X=p.X+R(-p.Radius*.5f,p.Radius),Y=p.Y+p.Radius*.6f};AddParticle(e,R(-1,2),-R(0,1.5f),Hex("#6e6050"),R(2,2),R(10,6),0);}
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
        }
        public void DrawFlash(int tick) { // same UI flash path, below HUD; no simulation hit-stop
            if(ReducedMotion)return;
            float alphaFlash=FlashAlpha(tick);
            if(alphaFlash>0){var c=flashColor;c.a=alphaFlash;NativeUiViewport.FillScreen(c);}
        }
        int flashBorn=-1000;float flashPeak;Color flashColor;
        public float FlashAlpha(int tick){return Mathf.Max(0,flashPeak-Mathf.Max(0,tick-flashBorn)*.08f);}
        public void Flash(FeedbackEvent e){
            if(e.Kind!=FeedbackKind.Parry&&!e.VisualOnly)return;
            float strength=e.Kind==FeedbackKind.Parry?.25f:e.IsBoss?.2f:.1f;
            flashPeak=Mathf.Min(.5f,FlashAlpha(e.Tick)+strength*.5f);flashBorn=e.Tick;flashColor=e.Kind==FeedbackKind.Parry?ParryColor(e):ElementColor(e.Element);
        }
        static void Release(UnityEngine.Object o){if(Application.isPlaying)UnityEngine.Object.Destroy(o);else UnityEngine.Object.DestroyImmediate(o);}
        static void ReleaseRenderer(SpriteRenderer r){owned.Remove(r);Release(r.gameObject);}
        public void Reset(){foreach(var c in clips)ReleaseRenderer(c.renderer);clips.Clear();foreach(var p in particles)ReleaseRenderer(p.renderer);particles.Clear();timeline.Reset();bloodDecals.Reset();foreach(var r in bloodGround)if(r!=null){r.enabled=false;NativeGroundSkillSurface.Project(r);}rollDustTick=-1;shakeBorn=flashBorn=-1000;shake=flashPeak=0;}
        public void Dispose(){Reset();foreach(var r in bloodGround)if(r!=null)ReleaseRenderer(r);foreach(var sheet in sheets.Values)if(sheet!=null)foreach(var frame in sheet.frames)Release(frame);sheets.Clear();Release(dot);Release(ring);Release(ringTexture);Release(add);Release(alpha);Release(whiteAlpha);Release(bloodFloor);}
    }
}
