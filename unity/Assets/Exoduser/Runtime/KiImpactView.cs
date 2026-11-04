using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class ImpactReceipt
    {
        public int hitCount,chargeCount,drawnFrames,peakInk,peakAdditive;
    }
    // U-VFX-05: presentation clock only; never writes a Core event/projectile.
    public static class KiImpactPresentation
    {
        public const int CoreTicks=5,TrailTicks=9;
        public const double TrailThickness=.45,BodyOpacity=.35;
        public static double CoreAlpha(double age)=>age<0||age>=CoreTicks?0:age<1?.35+.65*age:(CoreTicks-age)/4;
        public static double CoreDiameter(int step,double scale,double height)=>height*(step==3?.6*scale:.35);
        public static double TrailAlpha(double age)=>age<0||age>=TrailTicks?0:age<6?1:.35*(TrailTicks-age)/3;
        public static double BodyAlpha(double age)=>BodyOpacity*Math.Max(0,1-age/3);
        public static int SparkCount(int step,double scale)=>step==3?(int)Math.Round(24*Math.Max(1,Math.Min(2.2,scale))):12;
        public static int SparkLife(int index)=>12+index%7;
        public static double SparkLength(int index,double height)=>Math.Max(.05*height,Math.Min(.15*height,height*(.08+.07*(index%8)/7)));
        public static double SparkAngle(int index,int count)=>(-1+2*(index+.5)/count)*Math.PI/3;
        public static double SparkAlpha(double age,double life)=>age<0||age>=life?0:Math.Min(1,(life-age)/6);
        public static double Shake(int step,int tier)=>step==3?(tier>=3?3:2):0;
        public static double ShakeAmplitude(int step,int tier,double age,double optionScale,bool reducedMotion)
        {
            if(reducedMotion||age<0)return 0;
            double amplitude=Shake(step,tier)*Math.Pow(.86,age);
            return amplitude<.3?0:amplitude*optionScale;
        }
        public static int SheetFrame(int age,int ticks,int count)=>age<0||age>=Math.Max(1,ticks)*count?-1:age/Math.Max(1,ticks);
        // U-VFX-15: the hit's star flash is a soft warm core (same rule as the enemy-hit lane): alpha (1-r)^3.5, zero from r>=.95,
        // centre #fff4d0, _Opacity peak 2.6 at +2 ticks, five ticks, diameter .5 H. The silver hit sheet's star is no longer drawn for a hit.
        public const int SoftCoreTicks=5,SoftCorePeakTick=2,SoftCoreTexture=128;
        public const double SoftCoreExponent=3.5,SoftCoreCutoff=.95,SoftCorePeak=2.6,SoftCoreSizeRatio=.5;
        public static readonly byte[] SoftCoreColor={255,244,208};
        public static double SoftCoreFalloff(double r)=>r<0?1:r>=SoftCoreCutoff?0:Math.Pow(1-r,SoftCoreExponent);
        public static double SoftCoreOpacity(double age)=>age<0||age>=SoftCoreTicks?0:age<SoftCorePeakTick?SoftCorePeak*(.35+.65*age/SoftCorePeakTick):SoftCorePeak*(SoftCoreTicks-age)/(SoftCoreTicks-SoftCorePeakTick);
        public static double SoftCoreDiameter(double height)=>height*SoftCoreSizeRatio;
        // U-VFX-15: a flying crescent never hides the body it crosses. Opacity is capped at .7, halved while the crescent overlaps a target's body,
        // and after 12 ticks (0.2 s) of overlap the outer layers fade out over 6 ticks (layer 4 = the thin front edge keeps half). overlapTicks<0 = no overlap.
        public const double CrescentAlphaCap=.7,CrescentOverlapScale=.5,CrescentOverlapGraceTicks=12,CrescentFadeTicks=6;
        public static bool CrescentOverlaps(double px,double py,double tx,double ty,double radius)=>(px-tx)*(px-tx)+(py-ty)*(py-ty)<=radius*radius;
        public static double CrescentAlpha(double alpha,int layer,double overlapTicks)
        {
            double a=Math.Min(alpha,CrescentAlphaCap);if(overlapTicks<0)return a;
            a*=CrescentOverlapScale;if(overlapTicks<=CrescentOverlapGraceTicks)return a;
            double f=Math.Min(1,(overlapTicks-CrescentOverlapGraceTicks)/CrescentFadeTicks);
            return a*(layer==4?1-.5*f:1-f);
        }
    }
    public sealed class KiImpactView : IDisposable
    {
        sealed class Flash { public SpriteRenderer renderer;public FeedbackEvent source; }
        readonly List<Flash> additive=new List<Flash>(),shadows=new List<Flash>(),contacts=new List<Flash>(),contactShadows=new List<Flash>();
        static readonly HashSet<SpriteRenderer> centeredContacts=new HashSet<SpriteRenderer>();
        public static bool IsFeelSprite(SpriteRenderer renderer)=>centeredContacts.Contains(renderer);
        public static readonly bool FeelEnabled=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-combat-feel-off")<0;
        public bool ReducedMotion=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-reduce-menu-motion")>=0;public float ShakeScale=1;double hurtUntil=-1;
        public bool HurtActive(int tick)=>FeelEnabled&&tick<hurtUntil;
        readonly Transform parent;readonly Func<int,Sprite> frame;
        readonly Func<float> heroHeight;readonly Func<Camera> camera;
        readonly Material contactMaterial;readonly Sprite coreShape,sparkShape,softShape;readonly Texture2D softTexture;
        sealed class Burst {public FeedbackEvent source;public SpriteRenderer core;public SpriteRenderer[] sparks;public float height;}
        readonly List<Burst> bursts=new List<Burst>();
        int lastHitTick=-1,shakeTick=-1,shakeTier;float shakeAngle;
        public bool HitSince(int tick)=>lastHitTick>tick;
        public Vector2 CameraOffset(int tick)
        {
            double age=tick-shakeTick;
            float amplitude=(float)KiImpactPresentation.ShakeAmplitude(3,shakeTier,age,ShakeScale,ReducedMotion);
            if(shakeTick<0||amplitude<=0)return Vector2.zero;
            float kick=amplitude*(float)Math.Cos(age*2.4)/100;
            return new Vector2(Mathf.Cos(shakeAngle)*kick,-Mathf.Sin(shakeAngle)*kick);
        }
        readonly Material addMaterial,inkMaterial;
        readonly MaterialPropertyBlock properties=new MaterialPropertyBlock();
        static readonly int Opacity=Shader.PropertyToID("_Opacity");
        public readonly ImpactReceipt Receipt=new ImpactReceipt();
        public int ActiveCount {get{return additive.Count;}}
        public KiImpactView(Transform parent,Func<int,Sprite> frame,Func<float> heroHeight=null,Func<Camera> camera=null)
        {
            this.parent=parent;this.frame=frame;this.heroHeight=heroHeight;this.camera=camera;
            contactMaterial=new Material(Resources.Load<Shader>("Shaders/SkillAdditive"));
            contactMaterial.SetFloat("_Flat",1);contactMaterial.SetFloat("_DepthTest",8);
            sparkShape=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f),1);
            coreShape=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f),1);
            // A compact filled contact disk, no texture generation or imported art.
            // OverrideGeometry takes sprite-rect pixels (0..1 here), not pivot-relative units:
            // centre the disk on the .5 pivot and inset the rim so no vertex sits on the 1.0 edge.
            softTexture=SoftCoreTexture();softShape=Sprite.Create(softTexture,new Rect(0,0,softTexture.width,softTexture.height),new Vector2(.5f,.5f),softTexture.width);
            var vertices=new Vector2[17];var triangles=new ushort[48];vertices[0]=new Vector2(.5f,.5f);
            for(int i=0;i<16;i++){float a=i*Mathf.PI/8;var rim=vertices[0]+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*.499f;vertices[i+1]=new Vector2(Mathf.Clamp(rim.x,.0005f,.9995f),Mathf.Clamp(rim.y,.0005f,.9995f));triangles[i*3]=0;triangles[i*3+1]=(ushort)(i+1);triangles[i*3+2]=(ushort)((i+1)%16+1);}
            coreShape.OverrideGeometry(vertices,triangles);
            addMaterial=new Material(Resources.Load<Shader>("Shaders/KiSlashAdditive"));
            inkMaterial=new Material(Resources.Load<Shader>("Shaders/KiSlashInk"));
        }
        // Smooth radial gradient, no noise: rgb is the fixed warm centre colour, alpha follows (1-r)^3.5 and is 0 from r>=.95.
        static Texture2D SoftCoreTexture()
        {
            int n=KiImpactPresentation.SoftCoreTexture;var t=new Texture2D(n,n,TextureFormat.RGBA32,false){name="Ki soft warm core",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var c=KiImpactPresentation.SoftCoreColor;var pixels=new Color32[n*n];
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){double dx=(x+.5-n*.5)/(n*.5),dy=(y+.5-n*.5)/(n*.5);double r=Math.Sqrt(dx*dx+dy*dy);pixels[y*n+x]=new Color32(c[0],c[1],c[2],(byte)Math.Round(255*KiImpactPresentation.SoftCoreFalloff(r)));}
            t.SetPixels32(pixels);t.Apply(false,false);return t;
        }
        public void Handle(FeedbackEvent e)
        {
            if(FeelEnabled&&e.Kind==FeedbackKind.FeelHurt){hurtUntil=e.Tick+NativeCombatFeelPolicy.HurtTicks;return;}
            if(FeelEnabled&&e.Kind==FeedbackKind.FeelContact){Contact(e);return;}
            if(e.Kind!=FeedbackKind.KiSlashHit&&e.Kind!=FeedbackKind.KiChargeFlash)return;
            float width=e.Kind==FeedbackKind.KiSlashHit?e.Size:e.Scale*627;
            // Source playVFXAng: all effects admitted here are skills, so the
            // 20-entry pool evicts its oldest. Ink is a separate eight-entry pool.
            if(additive.Count>=20)Remove(additive,0);
            // A hit draws the soft warm core below (SpawnContact); only the charge flash still plays the silver sheet.
            if(e.Kind!=FeedbackKind.KiSlashHit)additive.Add(Create(e,width,false));
            if(e.Kind==FeedbackKind.KiSlashHit){
                Receipt.hitCount++;SpawnContact(e);lastHitTick=e.Tick;
                if(e.Step==3){
                    double current=KiImpactPresentation.ShakeAmplitude(3,shakeTier,e.Tick-shakeTick,1,false);
                    if(shakeTick<0||KiImpactPresentation.Shake(e.Step,e.Tier)>=current){shakeTick=e.Tick;shakeTier=e.Tier;shakeAngle=e.Angle;}
                }
            }else Receipt.chargeCount++;
            Receipt.peakInk=Math.Max(Receipt.peakInk,shadows.Count);Receipt.peakAdditive=Math.Max(Receipt.peakAdditive,additive.Count+bursts.Count);
        }
        void Contact(FeedbackEvent e){
            int found=contacts.FindIndex(x=>x.source.TargetId==e.TargetId);
            if(found>=0){contacts[found].source=e;contactShadows[found].source=e;return;}
            if(contacts.Count>=NativeCombatFeelPolicy.Capacity){Remove(contacts,0);Remove(contactShadows,0);}
            var light=Create(e,e.Killed?72:64,false);var shadow=Create(e,e.Killed?72:64,true);contacts.Add(light);contactShadows.Add(shadow);centeredContacts.Add(light.renderer);centeredContacts.Add(shadow.renderer);
        }
        void DrawContacts(int tick){
            for(int i=0;i<contacts.Count;){var source=contacts[i].source;double age=tick-source.Tick;int cell=NativeCombatFeelPolicy.Frame(age,ReducedMotion);if(cell<0){Remove(contacts,i);Remove(contactShadows,i);continue;}
                for(int pass=0;pass<2;pass++){var f=(pass==0?contactShadows:contacts)[i];f.renderer.sprite=frame(cell);f.renderer.sortingOrder=(int)source.Y+(pass==0?3:4);f.renderer.transform.position=NativeRemodel3D.Point(source.X,source.Y);f.renderer.transform.rotation=Quaternion.Euler(0,0,-source.Angle*Mathf.Rad2Deg);f.renderer.transform.localScale=Vector3.one*(NativeCombatFeelPolicy.Size(source.Killed,age,ShakeScale,ReducedMotion)/627);f.renderer.GetPropertyBlock(properties);properties.SetFloat(Opacity,NativeCombatFeelPolicy.Alpha(age));f.renderer.SetPropertyBlock(properties);}
                i++;
            }
        }
        Flash Create(FeedbackEvent e,float width,bool ink)
        {
            var go=new GameObject(ink?"Ki hit ink":"Ki impact light");go.transform.SetParent(parent);
            var r=go.AddComponent<SpriteRenderer>();r.sharedMaterial=ink?inkMaterial:addMaterial;
            r.transform.position=NativeRemodel3D.Point(e.X,e.Y);r.transform.rotation=Quaternion.Euler(0,0,-e.Angle*Mathf.Rad2Deg);
            r.transform.localScale=Vector3.one*(width/627);r.color=Color.white;
            return new Flash{renderer=r,source=e};
        }
        public void Update(int tick)
        {
            DrawContacts(tick);Draw(shadows,tick,true);Draw(additive,tick,false);DrawBursts(tick);
        }
        void Draw(List<Flash> list,int tick,bool ink)
        {
            for(int i=0;i<list.Count;){
                // Source additive advances before drawing; ink uses game-frame age.
                var f=list[i];int age=tick-f.source.Tick,cell=f.source.Kind==FeedbackKind.KiSlashHit?KiImpactPresentation.SheetFrame(age,f.source.FrameTicks,f.source.FrameCount):Math.Max(0,age+(ink?0:1))/Math.Max(1,f.source.FrameTicks);
                if(cell<0||cell>=f.source.FrameCount){Remove(list,i);continue;}
                f.renderer.sprite=frame(cell);f.renderer.sortingOrder=(ink?24000:27000)+i;
                // The second original cell is the sheet peak at contact +3 ticks.
                float alpha=ink?.35f*(1-cell*.18f):1-(float)cell/f.source.FrameCount*.3f;
                f.renderer.GetPropertyBlock(properties);properties.SetFloat(Opacity,alpha);f.renderer.SetPropertyBlock(properties);
                Receipt.drawnFrames++;i++;
            }
        }
        SpriteRenderer ContactRenderer(string name,Sprite sprite,Material material=null)
        {
            var r=new GameObject(name).AddComponent<SpriteRenderer>();r.transform.SetParent(parent,false);
            r.sharedMaterial=material??contactMaterial;r.sprite=sprite;r.sortingOrder=27020;
            centeredContacts.Add(r);return r;
        }
        void SpawnContact(FeedbackEvent e)
        {
            if(bursts.Count>=20)RemoveBurst(0);
            float height=Mathf.Max(1,heroHeight!=null?heroHeight():160);
            var b=new Burst{source=e,height=height,core=ContactRenderer("Ki contact core",softShape,addMaterial),sparks=new SpriteRenderer[KiImpactPresentation.SparkCount(e.Step,e.Scale)]};
            for(int i=0;i<b.sparks.Length;i++)b.sparks[i]=ContactRenderer("Ki contact spark",sparkShape);
            bursts.Add(b);
        }
        static Color ContactColor(double age,float alpha)
        {
            var color=Color.Lerp(new Color32(255,244,208,255),new Color32(255,217,160,255),Mathf.Clamp01((float)age/4));
            color.a=alpha;return color;
        }
        void DrawBursts(int tick)
        {
            for(int n=bursts.Count-1;n>=0;n--){
                var b=bursts[n];var e=b.source;int age=tick-e.Tick;
                if(age>=18){RemoveBurst(n);continue;}
                var origin=NativeRemodel3D.Point(e.X,e.Y);
                float alpha=(float)KiImpactPresentation.CoreAlpha(age),coreOpacity=(float)KiImpactPresentation.SoftCoreOpacity(age);
                b.core.enabled=coreOpacity>0;b.core.color=Color.white;
                b.core.GetPropertyBlock(properties);properties.SetFloat(Opacity,coreOpacity);b.core.SetPropertyBlock(properties);
                b.core.transform.position=origin;b.core.transform.rotation=Quaternion.identity;
                b.core.transform.localScale=Vector3.one*(float)(KiImpactPresentation.SoftCoreDiameter(b.height)/100);
                var cam=camera?.Invoke();
                for(int i=0;i<b.sparks.Length;i++){
                    var r=b.sparks[i];float life=KiImpactPresentation.SparkLife(i);
                    alpha=(float)KiImpactPresentation.SparkAlpha(age,life);r.enabled=alpha>0;if(!r.enabled)continue;
                    float angle=e.Angle+(float)KiImpactPresentation.SparkAngle(i,b.sparks.Length);
                    float distance=b.height*.36f*Mathf.Max(0,age)/60;
                    var position=NativeRemodel3D.Point(e.X+Mathf.Cos(angle)*distance,e.Y+Mathf.Sin(angle)*distance);
                    var tip=NativeRemodel3D.Point(e.X+Mathf.Cos(angle),e.Y+Mathf.Sin(angle));
                    var direction=tip-origin;
                    if(NativeRemodel3D.Active){position.y-=b.height/100*.16f*(age/60f)*(age/60f);}
                    float roll=-angle*Mathf.Rad2Deg,width=.015f;
                    if(cam!=null){
                        var start=cam.WorldToScreenPoint(position);var end=cam.WorldToScreenPoint(position+direction);
                        roll=Mathf.Atan2(end.y-start.y,end.x-start.x)*Mathf.Rad2Deg;
                        float units=cam.orthographic?2*cam.orthographicSize:2*Mathf.Max(.01f,start.z)*Mathf.Tan(cam.fieldOfView*Mathf.Deg2Rad*.5f);
                        width=units/Mathf.Max(1,cam.pixelHeight)*1.5f;
                    }
                    r.transform.position=position;r.transform.rotation=Quaternion.Euler(0,0,roll);
                    // Fade alpha only: do not shrink a line into a bright dot.
                    r.transform.localScale=new Vector3((float)(KiImpactPresentation.SparkLength(i,b.height)/100),width,1);
                    r.color=ContactColor(age,alpha);
                }
            }
        }
        void RemoveBurst(int index)
        {
            var b=bursts[index];centeredContacts.Remove(b.core);Release(b.core.gameObject);
            foreach(var r in b.sparks){centeredContacts.Remove(r);Release(r.gameObject);}bursts.RemoveAt(index);
        }
        static void Release(UnityEngine.Object value){if(Application.isPlaying)UnityEngine.Object.Destroy(value);else UnityEngine.Object.DestroyImmediate(value);}
        static void Remove(List<Flash> list,int index){centeredContacts.Remove(list[index].renderer);Release(list[index].renderer.gameObject);list.RemoveAt(index);}
        public void Reset(){hurtUntil=-1;lastHitTick=shakeTick=-1;shakeTier=0;shakeAngle=0;while(bursts.Count>0)RemoveBurst(bursts.Count-1);while(contacts.Count>0)Remove(contacts,contacts.Count-1);while(contactShadows.Count>0)Remove(contactShadows,contactShadows.Count-1);while(additive.Count>0)Remove(additive,additive.Count-1);while(shadows.Count>0)Remove(shadows,shadows.Count-1);}
        public void Dispose(){Reset();Release(addMaterial);Release(inkMaterial);Release(contactMaterial);Release(coreShape);Release(sparkShape);Release(softShape);Release(softTexture);}
    }
}
