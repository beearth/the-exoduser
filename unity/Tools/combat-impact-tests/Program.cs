using System;
using System.Linq;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Vfx;

static class Program
{
    static int checks,bad;
    static void Check(bool value,string name){checks++;if(!value){bad++;Console.WriteLine("FAIL "+name);}}
    static int Main()
    {
        AuditFixTests.Run(Check, System.IO.Directory.GetCurrentDirectory());
        // RED uses reflection so an absent presentation policy is an assertion,
        // not a compiler failure. Expected coordinates are screen pixels, Y up.
        var anchorType=typeof(CombatImpactTimeline).Assembly.GetType("Exoduser.UnityPort.Vfx.CombatHitAnchor");
        Check(anchorType!=null,"visible-body hit anchor policy exists");
        if(anchorType!=null) {
            var resolve=anchorType.GetMethod("Resolve");
            Func<double,double,double,FeedbackKind,double,bool,dynamic> anchor=(foot,bottom,top,kind,ratio,large)=>
                resolve.Invoke(null,new object[]{foot,bottom,top,kind,ratio,large});
            foreach(var kind in new[]{FeedbackKind.EnemyHit,FeedbackKind.EnemyCrit,FeedbackKind.BossHit,FeedbackKind.EnemyDeath,FeedbackKind.BossDeath}) {
                dynamic a=anchor(100,110,210,kind,double.NaN,false);
                Check((bool)a.UseBody&&Math.Abs((double)a.OffsetY-65)<1e-9,"default chest .55 excludes transparent padding "+kind);
                Check(Math.Abs((double)a.DrawWidth-(kind==FeedbackKind.EnemyHit?60:100))<1e-9,"normal .6 / critical boss death 1.0 body width "+kind);
            }
            foreach(double ratio in new[]{-1.0,0,.55,.618,1,2,double.PositiveInfinity}) {
                dynamic a=anchor(20,30,230,FeedbackKind.EnemyHit,ratio,true);
                double y=20+(double)a.OffsetY;
                Check(y>=30&&y<=230,"contact remains inside visible body "+ratio);
                Check((double)a.DrawWidth<=200*1.2,"large enemy width capped at 1.2 body heights "+ratio);
            }
            dynamic chest=anchor(0,0,200,FeedbackKind.EnemyCrit,.618,false);
            Check(Math.Abs((double)chest.OffsetY-123.6)<1e-9,"rig catalog chest ratio is honored");
            foreach(double height in new[]{32.0,96.0,192.0}) {
                dynamic a=anchor(300,300,300+height,FeedbackKind.BossHit,double.NaN,true);
                Check(Math.Abs((double)a.DrawWidth-height)<1e-9&&Math.Abs((double)a.OffsetY-height*.55)<1e-9,"perspective body pixels scale independently of Core radius "+height);
            }
            foreach(var pair in new[]{(0.0,0.0),(200.0,100.0),(double.NaN,100.0),(0.0,double.PositiveInfinity)})
                Check(!(bool)anchor(0,pair.Item1,pair.Item2,FeedbackKind.EnemyHit,double.NaN,false).UseBody,"missing/invalid body requests exact legacy path");
            var applies=anchorType.GetMethod("Applies");
            foreach(var mode in new[]{CombatClipMode.Impact,CombatClipMode.SlashBurst,CombatClipMode.Electric,CombatClipMode.Blood}) {
                Check((bool)applies.Invoke(null,new object[]{true,9,FeedbackKind.EnemyHit,mode}),"body hit layer "+mode);
                Check(!(bool)applies.Invoke(null,new object[]{false,9,FeedbackKind.EnemyHit,mode}),"flat mode preserves legacy "+mode);
                Check(!(bool)applies.Invoke(null,new object[]{true,0,FeedbackKind.EnemyHit,mode}),"target zero preserves legacy "+mode);
                Check(!(bool)applies.Invoke(null,new object[]{true,9,FeedbackKind.EnemyDeath,mode}),"death stays at ground "+mode);
            }
            Check(!(bool)applies.Invoke(null,new object[]{true,9,FeedbackKind.Parry,CombatClipMode.Impact}),"melee parry is excluded");
        }
        var s=new Simulation(new SimulationConfig{EnemyAiEnabled=false,PlayerBaseAttack=10,PlayerCriticalChance=0},123);
        var e=s.SpawnNormalEnemy(s.Player.X+40,s.Player.Y);
        if(e==null)throw new Exception("fixture spawn failed");
        e.Hp=e.MaxHp=10000;e.Shield=0;e.ReviveIframes=0;
        s.Feedback.Clear();s.HurtEnemy(e,1,.7f);s.HurtEnemy(e,1,.8f);
        var hits=s.Feedback.Where(x=>x.Source=="combat-impact").ToArray();
        Check(hits.Length==2,"two real same-tick hits must emit visuals independently of audio cooldown/noSound");
        Check(hits.All(x=>x.TargetId==e.Id&&x.Angle>.6f),"hit identity and attack angle survive the view boundary");
        s.Feedback.Clear();s.Player.State="sBash";s.SbParryT=0;
        s.PayReflectParry(new ParryReflect.ResolveResult{DoParry=true,ParryTag="physicalProjectile",ParryX=321,ParryY=456,ResourceMul=3});
        var parry=s.Feedback.First(x=>x.Kind==FeedbackKind.Parry);
        Check(parry.Step==0&&parry.Source=="physicalProjectile"&&parry.X==321&&parry.Y==456,"shield reflection keeps web contact position and physical appearance tag");
        var physical=CombatImpactTimeline.Plan(parry).Single();
        Check(physical.Flat&&physical.Frames==4&&physical.Life==66,"physical parry uses white first four cells and web minimum life 66");
        Check(Math.Abs(physical.DrawWidth(0,128)-108)<.001&&Math.Abs(physical.DrawWidth(9,128)-180)<.001,"physical boom grows from 60 percent to full radius60 times3");
        // 11-03 parry retouch: bullet parries no longer use the dark02 purple star or the three yellow lightning sheets.
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,Source="projectile"}).Count==0,"bullet Q parry: no purple star sheet, line sparks only");
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=0,Source="projectile"}).Count==0,"bullet shield parry: no yellow lightning sheets, line sparks only");
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,Source="physicalProjectile"}).Count==0,"physical bullet Q parry: no purple star either");
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.EnemyHit}).Count==0,"audio hit cannot duplicate a visual hit");
        var normal=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.EnemyHit,VisualOnly=true,Element=2});
        Check(normal[0].Sheet=="impact_el2_sheet_v2"&&normal[0].Frames==9&&normal[0].Life==16,"normal impact chooses remastered elemental 9-cell strip for16ticks");
        var boss=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.BossHit,IsBoss=true,VisualOnly=true,Element=4});
        Check(boss[0].Sheet=="impact_el4_boss_sheet_v2"&&boss[0].Frames==16&&boss[0].Scale==2.5,"boss impact retains 16cells and2.5scale");
        for(int el=0;el<6;el++)foreach(bool isBoss in new[]{false,true}) {
            var hit=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=isBoss?FeedbackKind.BossHit:FeedbackKind.EnemyHit,VisualOnly=true,IsBoss=isBoss,Element=el})[0];
            Check(hit.Sheet=="impact_el"+el+(isBoss?"_boss_sheet_v2":"_sheet_v2")&&hit.Fallback=="impact_basic_sheet","v2 sheet and basic fallback "+el+" boss="+isBoss);
            Check(hit.Life==16&&hit.Frames==(isBoss?16:9)&&hit.Cols==hit.Frames&&hit.Rows==1&&hit.Scale==(isBoss?2.5:1)&&hit.Additive&&hit.Mode==CombatClipMode.Impact,"v2 retains lifecycle, layout, scale and additive blend "+el+" boss="+isBoss);
            Check(hit.Frame(0)==0&&hit.Frame(16)==-1&&Math.Abs(hit.Alpha(0)-(isBoss?.62:.45))<1e-9&&Math.Abs(hit.Alpha(8)-(isBoss?.31:.225))<1e-9,"v2 retains frame and alpha curve "+el+" boss="+isBoss);
            double cell=85,scale=isBoss?2.5:1,start=isBoss?.92:.8;
            Check(Math.Abs(hit.DrawWidth(0,cell)-cell*scale*start)<1e-9&&Math.Abs(hit.DrawWidth(8,cell)-cell*scale*(start+.3))<1e-9,"v2 retains width curve "+el+" boss="+isBoss);
        }
        Check(boss[1].Mode==CombatClipMode.Electric&&boss[1].Scale==.18,"lightning impact adds exact electric burst");
        var budget=new CombatImpactTimeline();Check(budget.AdmitHit(1,false)&&budget.AdmitHit(1,false)&&!budget.AdmitHit(1,false)&&budget.AdmitHit(1,true)&&budget.AdmitHit(2,false),"same tick limits two ordinary hits; bosses bypass; next tick renews");
        budget.Reset();Check(budget.AdmitHit(1,false),"restart resets budget even when ticks rewind");
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.BossDeath,Source="druid_sink",IsBoss=true}).Count==0,"druid escape must not bleed");
        var dead=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.EnemyDeath,Size=20}).Single();
        Check(dead.Life==64&&Math.Abs(dead.Width-236.8)<.001&&!dead.Additive&&dead.Sheet=="Blood_FBF_4x4_dark","ordinary death uses dark blood alpha blend and radius-dependent width");
        var bossDead=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.BossDeath,IsBoss=true,Size=40}).Single();
        Check(bossDead.Frames==16&&bossDead.Life==96&&bossDead.Sheet=="Blood_FBF_4x4_dark"&&!bossDead.Additive,"boss death uses the same dark ramp and retains96tick lifecycle");
        foreach(var kind in new[]{FeedbackKind.EnemyHit,FeedbackKind.EnemyCrit,FeedbackKind.BossHit}) {
            bool heavy=kind!=FeedbackKind.EnemyHit;
            var blood=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=kind,VisualOnly=true,Size=20,Angle=.7f,IsBoss=kind==FeedbackKind.BossHit}).Where(c=>c.Sheet=="Blood_FBF_4x4_dark").ToArray();
            Check(blood.Length==1,"one directional blood clip for "+kind);
            if(blood.Length==1){var c=blood[0];Check(!c.Additive&&c.Life==(heavy?18:9)&&c.Frames==16&&c.Stretch==1.6,"normal alpha, horizontal stretch and .15/.3s blood lifecycle "+kind);
                Check(Math.Abs(c.Angle-.7)<35*Math.PI/180&&Math.Abs(c.Width-40*(heavy?1:.6))<.001,"blood angle cone and body diameter scale "+kind);
                Check(c.Frame(0)==0&&c.Frame(c.Life)==-1&&c.Alpha(12)<=.35,"blood starts on contact and stops obscuring after .2s "+kind);}
        }
        // Reflection allows the first RED to report a missing policy as a test
        // failure rather than a compiler error; this exercises the real pool.
        var poolType=typeof(CombatImpactTimeline).Assembly.GetType("Exoduser.UnityPort.Vfx.CombatBloodDecals");
        Check(poolType!=null,"pooled blood decal lifecycle policy exists");
        if(poolType!=null) {
            dynamic pool=Activator.CreateInstance(poolType);
            var stamp=new FeedbackEvent{Kind=FeedbackKind.EnemyCrit,VisualOnly=true,Size=20,Tick=100};
            int slot=(int)pool.Add(stamp,12,.25);
            Check(slot==0&&(double)pool.Alpha(slot,99)==0&&(double)pool.Alpha(slot,100)==1,"decal begins at contact, no negative age");
            Check((double)pool.Alpha(slot,309)==1&&(double)pool.Alpha(slot,310)==1,"decal holds full opacity for3.5seconds");
            Check(Math.Abs((double)pool.Alpha(slot,340)-.5)<1e-9&&(double)pool.Alpha(slot,370)==0,"decal fades for1second then expires");
            for(int i=1;i<8;i++){stamp.Tick=100+i;Check((int)pool.Add(stamp,12+i%4,.25)==i,"decal free slot "+i);}
            stamp.Tick=108;Check((int)pool.Add(stamp,15,.5)==0,"ninth decal recycles oldest slot");
            stamp.Tick=109;Check((int)pool.Add(stamp,14,.6)==1,"tenth decal recycles next oldest slot");
            Check((int)pool.Slots.Length==8&&pool.Slots[0].Frame==15&&Math.Abs((double)pool.Slots[0].Angle-.5)<1e-9,"eight fixed slots retain last-four frame and rotation");
            stamp.Tick=500;Check((int)pool.Add(stamp,12,0)==0,"expired slots reused without growth");
            pool.Reset();Check((double)pool.Alpha(0,500)==0,"restart hides pooled decals");
            stamp.Tick=100;pool.Add(stamp,12,0,20);
            Check((int)pool.Slots[0].Born==120&&(double)pool.Alpha(0,119)==0&&(double)pool.Alpha(0,120)==1,"optional collapse delay starts ground blood on the selected tick");
            Check((int)pool.Add(stamp,12,0,20)==1,"queued death blood reserves its pool slot before collapse");
            pool.Reset();pool.Add(stamp,12,0);
            Check((int)pool.Slots[0].Born==100&&(double)pool.Alpha(0,100)==1,"unset death delay preserves contact tick exactly");
            foreach(var kind in new[]{FeedbackKind.EnemyCrit,FeedbackKind.BossHit,FeedbackKind.EnemyDeath,FeedbackKind.BossDeath})
                Check((bool)poolType.GetMethod("ShouldStamp").Invoke(null,new object[]{new FeedbackEvent{Kind=kind,VisualOnly=true}}),"decal event "+kind);
            foreach(var evt in new[]{new FeedbackEvent{Kind=FeedbackKind.EnemyHit,VisualOnly=true},new FeedbackEvent{Kind=FeedbackKind.EnemyCrit},new FeedbackEvent{Kind=FeedbackKind.BossDeath,Source="druid_sink"}})
                Check(!(bool)poolType.GetMethod("ShouldStamp").Invoke(null,new object[]{evt}),"no blood decal for audio, normal hit or druid escape");
        }
        Check(CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.EnemyHit,VisualOnly=true,Element=6})[0].Sheet=="impact_basic_sheet","unbanked earth element uses the web basic fallback");
        Check(Math.Abs(CombatImpactTimeline.ParticleTravel(3,0,2)-5.7)<1e-9&&Math.Abs(CombatImpactTimeline.ParticleTravel(3,.1,2)-5.79)<1e-9,"particle drag.9 and gravity match two web pool updates");
        var water=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,Source="waterBean"});
        Check(water.Count==2&&water[0].Sheet=="Ice_ImpactIce_Sheet_water"&&water[1].Sheet=="Ice_MistSmoke_FBF_4x4_water","water parry uses the water-ramp sheets, not the web cartoon cyan");
        Check(water[0].Frames==12&&water[0].Frame(71)==11&&Math.Abs(water[1].Opacity-.6)<1e-9,"water impact stops before the loose droplet frames; mist .6");
        // Hit-stop presentation clock: two held fixed steps right after the contact tick count toward the spark age.
        var clock=new CombatPresentationClock();int born=clock.Now(500);clock.Hold();clock.Hold();
        Check(clock.Now(500)-born==2&&clock.Now(501)-born==3,"held frames advance parry presentation; peak lands at contact +3 frames");
        clock.Reset();Check(clock.Now(7)==7,"clock reset");
        // Roll dust puffs.
        for(int seed=0;seed<20;seed++)foreach(int step in new[]{0,1}) {
            var roll=new FeedbackEvent{Kind=FeedbackKind.Roll,Step=step,Angle=.3f};var puffs=CombatRollDust.Burst(roll,seed);
            Check(puffs.Length==(step==0?3:2),"roll dust puff count "+step);
            foreach(var pf in puffs) {
                double peak=0;for(int t=0;t<=40;t++)peak=Math.Max(peak,CombatRollDust.Alpha(pf,t));
                Check(peak<=.42+1e-9&&peak>=.3&&CombatRollDust.Alpha(pf,pf.Delay+pf.Life)==0&&pf.Size>=26&&pf.Size<=40,"puff soft peak, expiry and size "+step);
                Check(CombatRollDust.Width(pf,pf.Delay+pf.Life)>pf.Size*1.79&&Math.Abs(CombatRollDust.Travel(pf,pf.Delay+pf.Life)-1)<1e-9,"puff expands and settles "+step);
                if(step==0)Check(Math.Cos(Math.Atan2(pf.Dy,pf.Dx)-(roll.Angle+Math.PI))>Math.Cos(.71),"start puffs kick up behind the roll direction");
            }
        }
        Check(!CombatRollDust.Trail(0)&&CombatRollDust.Trail(4)&&!CombatRollDust.Trail(5)&&CombatRollDust.TrailPuff(9).Peak<.3,"trail puff every four roll ticks, fainter");
        var rainbow=CombatImpactTimeline.Plan(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,SampleKey="rainbow"});
        Check(rainbow.Count==4&&rainbow.All(c=>c.Additive)&&Math.Abs(rainbow[3].Opacity-.55)<1e-9,"rainbow Q preserves four layers and attenuation");
        Check(rainbow.Select(c=>c.Sheet).SequenceEqual(new[]{"Poison_MediumImpact_pal","Dark_DarkSmoke_FBF_4x4","Light_ImpactLight_Sheet","Ice_ImpactIce_Sheet_pal"}),"rainbow Q uses palette copies; dark original is audited, cartoon light awaits artwork");
        var kiSim=new Simulation(SourceStarterFixture.CreateKiSlash(),456);kiSim.Config.EnemyAiEnabled=false;
        var kiTarget=kiSim.SpawnNormalEnemy(kiSim.Player.X+35,kiSim.Player.Y);if(kiTarget==null)throw new Exception("ki fixture spawn failed");
        kiSim.Player.Facing=0;kiSim.SpawnKiSlash(1,0);kiSim.Feedback.Clear();kiSim.Tick(0,0,kiSim.Player.X+100,kiSim.Player.Y,false,false);
        Check(kiSim.Feedback.Any(x=>x.Kind==FeedbackKind.KiSlashHit)&&!kiSim.Feedback.Any(x=>x.Source=="combat-impact"),"web ki noImpact keeps only its original dedicated hit sheet");
        var parryType=typeof(CombatImpactTimeline).Assembly.GetType("Exoduser.UnityPort.Vfx.CombatParryPresentation");
        Check(parryType!=null,"G2 melee spark, flash and camera policy exists");
        if(parryType!=null) {
            dynamic fx=Activator.CreateInstance(parryType);
            var melee=new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,Tick=100,Angle=.5f};
            Check((bool)fx.IsMelee(melee),"untagged contact is melee");
            foreach(var tag in new[]{"physicalProjectile","waterBean","projectile","redBean","rainbowBean"})
                Check(!(bool)fx.IsMelee(new FeedbackEvent{Kind=FeedbackKind.Parry,Source=tag}),"reflection excluded: "+tag);
            foreach(var sample in new[]{"red","rainbow","dark"})
                Check(!(bool)fx.IsMelee(new FeedbackEvent{Kind=FeedbackKind.Parry,SampleKey=sample}),"reflection sample excluded: "+sample);
            for(int seed=0;seed<20;seed++)foreach(int step in new[]{0,1}) {
                melee.Step=step;dynamic lines=fx.Sparks(melee,seed);int n=lines.Length;
                Check(n>=(step==1?80:30)&&n<=(step==1?130:60),"spark count "+step+" seed "+seed);
                int initial=0,fan=0;bool shape=true;
                foreach(dynamic line in lines){if(line.Delay==0)initial++;if(line.ReverseFan)fan++;
                    shape&=line.Delay>=0&&line.Delay<=3&&line.Life>=18&&line.Life<=30&&line.Length>=.10&&line.Length<=.25&&line.Thickness>=1&&line.Thickness<=2;
                    for(int t=0;t<=30;t++)if((double)fx.SparkAlpha(line,t)>0)shape&=(double)fx.SparkLength(line,t)>=.05;
                }
                Check(shape&&Math.Abs(initial/(double)n-.3)<.025&&Math.Abs(fan/(double)n-.7)<.025,"line lengths, thickness, lifetime, 30 percent contact and 70 percent reverse fan");
                double previous=0;for(int t=0;t<=3;t++){double brightness=0;foreach(dynamic line in lines)brightness+=(double)fx.SparkAlpha(line,t);Check(brightness>previous,"rising spark density/brightness tick "+t);previous=brightness;}
                double next=0;foreach(dynamic line in lines)next+=(double)fx.SparkAlpha(line,4);Check(next<previous,"spark peak at tick3");
            }
            melee.Step=1;
            for(int age=-1;age<=30;age++) {
                double a=(double)fx.FlashAlpha(age,false),linear=(double)fx.FlashAlpha(age,true);
                Check(a>=0&&a*255<=40&&linear>=0&&linear<=.02,"screen brightness bound tick "+age);
                if(age<0||age>=6)Check(a==0&&linear==0,"flash exact six tick expiry "+age);
            }
            Check((double)fx.FlashAlpha(1,false)>(double)fx.FlashAlpha(0,false)&&(double)fx.FlashAlpha(2,false)<(double)fx.FlashAlpha(1,false),"one tick flash rise then five tick decay");
            Check(!(bool)fx.HasFlash(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=0})&&(bool)fx.HasFlash(melee),"flash only perfect melee");
            Check(!(bool)fx.HasFlash(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=1,Source="waterBean"}),"projectile has no new melee flash");
            for(int seed=0;seed<20;seed++)foreach(int step in new[]{0,1}){
                dynamic bl=fx.Sparks(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=step,Source="projectile",Angle=1},seed);int bn=bl.Length;
                Check(bn>=(step==1?36:20)&&bn<=(step==1?50:30),"bullet parry spark count "+step+" seed "+seed);
                Check(!(bool)fx.HasFlash(new FeedbackEvent{Kind=FeedbackKind.Parry,Step=step,Source="projectile"}),"bullet parry has no screen flash "+step);
            }
            Check(((dynamic)fx.Sparks(new FeedbackEvent{Kind=FeedbackKind.EnemyHit},1)).Length==0,"sparks only for parry events");
            Check(!(bool)fx.ParsePushIn(new[]{"game"})&&!(bool)fx.ParsePushIn(new[]{"--unity-parry-camera=shake"})&&(bool)fx.ParsePushIn(new[]{"--unity-parry-camera=pushin"})&&(bool)fx.ParsePushIn(new[]{"--parry-feedback-push-in"}),"camera argument defaults to shake; both push-in flags select one push");
            Check((double)fx.CameraScale(8,true)==.975&&(double)fx.CameraScale(8,false)==1,"pushin narrows2.5percent over8ticks");
            foreach(double baseline in new[]{34.0,45.0,5.4,16.5})foreach(int age in new[]{-1,28,29,1000})
                Check(baseline*(double)fx.CameraScale(age,true)==baseline,"camera returns bit-exact baseline "+baseline+" tick "+age);
            Check((double)fx.CameraScale(18,true)>.975&&(double)fx.CameraScale(18,true)<1,"pushin returns over20ticks");
        }
        Console.WriteLine("combat-impact: "+checks+" checks, "+bad+" failures");return bad==0?0:1;
    }
}
