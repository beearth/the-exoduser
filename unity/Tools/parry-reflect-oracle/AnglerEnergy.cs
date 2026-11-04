using System;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

static partial class P
{
    static void CheckAnglerEnergy(JsonElement root)
    {
        var split = typeof(ParryReflect).GetMethod("SplitBigEnergy");
        foreach (var c in Cases(root, "anglerEnergy"))
        {
            var i=c.GetProperty("in"); var o=c.GetProperty("out"); var p=Proj(i.GetProperty("p"));
            string ctx=i.GetRawText();
            var input=new ParryReflect.ResolveInput {S=S(i,"s"),St2=20,SbParryT=N0(i,"sb"),SbReleaseR=N0(i,"rel"),Iframes=N0(i,"iframes"),PR=10,PX=100,PY=100,PDist=N0(i,"d"),SBashChgMul=1,
                Counter=new ParryRules.CounterInput {MeleeRef=10,StatStr=1,PAtkMul=1,MagicRef=10,StatInt=1,PMagicMul=1}};
            var r=ParryReflect.Resolve(p,input);
            Check(ParryRules.ProjectileParryClass(p.Flags)==ParryRules.ProjClass.Magic,ctx+" classification");
            var paid=o.GetProperty("paid"); var shots=o.GetProperty("shots");
            Check((r.Outcome==ReflectOutcome.BigEnergyParry)==(paid.GetArrayLength()>0),ctx+" Q terminal");
            if(paid.GetArrayLength()>0)
            {
                var pay=paid[0];
                Check(r.DoParry,ctx+" doParry");
                Num("damage",r.ParryDmg,pay,"dmg",ctx); Num("resource",r.ResourceMul,pay,"mul",ctx);
                Num("bank",r.ParryBankAdd,o,"bank",ctx); StrEq("tag",r.ParryTag,pay,"tag",ctx);
                Check(split!=null,ctx+" five-shot replacement exists");
                if(split!=null)
                {
                    var actual=(ReflectProjectile[])split.Invoke(null,new object[]{p,r.ParryDmg});
                    Check(actual.Length==shots.GetArrayLength(),ctx+" five shots");
                    for(int k=0;k<Math.Min(actual.Length,shots.GetArrayLength());k++)
                    {
                        var a=actual[k];var w=shots[k];
                        Num("x",a.X,w,"x",ctx);Num("y",a.Y,w,"y",ctx);Num("vx",a.Vx,w,"vx",ctx);Num("vy",a.Vy,w,"vy",ctx);
                        Num("dmg",a.Dmg,w,"dmg",ctx);Num("el",a.El,w,"el",ctx);Num("r",a.R,w,"r",ctx);Num("range",a.MaxDist,w,"maxDist",ctx);
                        Check(a.Magic&&!a.BlueBean&&!a.ParryBlueBean&&!a.FbEnergy&&!a.FdEnergy,ctx+" ordinary elemental magic");
                    }
                }
            }
            if(o.GetProperty("hurts").GetArrayLength()>0) Check(r.Outcome==ReflectOutcome.BigEnergyHit,ctx+" E/idle contact");
            if(N0(i,"d")<=20 && S(i,"s")=="sBlock")Check(r.Outcome==ReflectOutcome.Absorb,ctx+" Q inner absorb");
            // the terminal's side effects: _fbEnergyBoom only on contact (DruidBoss.TryReflect host.Fx "waterEnergy"), _recycleProj on Q split / contact / absorb (p.Active=false)
            Num("booms",r.Outcome==ReflectOutcome.BigEnergyHit?1:0,o,"booms",ctx);
            Num("recycled",r.Outcome==ReflectOutcome.BigEnergyParry||r.Outcome==ReflectOutcome.BigEnergyHit||r.Outcome==ReflectOutcome.Absorb?1:0,o,"recycled",ctx);
        }
        section="anglerRuntime";perSection[section]=new int[2];
        var marker=typeof(ProjSpec).GetField("FbEnergy");Check(marker!=null,"spawn spec retains fbEnergy");
        foreach(bool remodel in new[]{false,true}) foreach(string state in new[]{"sBlock","sBash","idle"})
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>false;sim.Druid.Remodel=remodel;
            sim.Player.X=100;sim.Player.Y=100;sim.Player.Iframes=0;sim.Player.State=state;sim.Player.StateTicks=20;
            sim.SbParryT=state=="sBlock"?18:0;
            var spec=new ProjSpec {X=268,Y=100,Vx=-10,Vy=0,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};
            marker?.SetValue(spec,true);
            var b=sim.Druid.SpawnProjectile(null,null,spec,false);
            Check(b.ParryClass=="magic","runtime energy classification");
            sim.Druid.TickWorld(false);
            if(state=="sBlock")
            {
                Check(!b.Active&&!b.Friendly,"Q consumes original in field, including remodel flag");
                Check(sim.Druid.Projectiles.Count(p=>p.Friendly&&p.Magic&&p.El==2&&!p.BlueBean)==5,"Q five water magic shots");
                Check(sim.ReflectCount==1&&sim.ParryCount==1&&sim.ParryBank>0,"Q pays once");
            }
            else Check(sim.ReflectCount==0&&!b.Friendly,"E/idle never reflect");
        }
        foreach(string state in new[]{"idle","sBash","charge"}) foreach(int iframe in new[]{0,10})
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>false;
            int booms=0;sim.BossFx+=(k,x,y,r)=>{if(k=="waterEnergy")booms++;};
            sim.Player.X=100;sim.Player.Y=100;sim.Player.State=state;sim.Player.StateTicks=20;sim.Player.Iframes=iframe;
            var spec=new ProjSpec {X=168,Y=100,Vx=-10,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};marker?.SetValue(spec,true);
            var b=sim.Druid.SpawnProjectile(null,null,spec,false);sim.Druid.TickWorld(false);
            Check(!b.Active&&!b.Friendly&&sim.ReflectCount==0,"contact consumes without E reflection");
            Check(booms==1,"contact always plays _fbEnergyBoom once (state "+state+", iframes "+iframe+"): "+booms);
            if(iframe==0&&state!="charge")Check(sim.HurtCount+sim.DodgeCount==1&&sim.Player.KnockbackX==-100&&sim.Player.KnockbackY==0,"contact damage/dodge and 100px slide, no damage-proportional push (opts.knockback {0,0})");
            else Check(sim.HurtCount==0&&sim.Player.KnockbackX==0&&sim.Player.KnockbackY==0,"invulnerable/charge contact consumes without damage or slide");
        }
        // Q held past its window (sBlock, _sbParryT 0): hurtP's shield branch still adds its failed-guard push (5 at a random angle) on top of the 100 slide set before it
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>false;
            sim.Player.X=100;sim.Player.Y=100;sim.Player.State="sBlock";sim.Player.StateTicks=999;sim.Player.Iframes=0;sim.SbParryT=0;
            var spec=new ProjSpec {X=168,Y=100,Vx=-10,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};marker?.SetValue(spec,true);
            var b=sim.Druid.SpawnProjectile(null,null,spec,false);sim.Druid.TickWorld(false);
            double kx=sim.Player.KnockbackX+100,ky=sim.Player.KnockbackY,push=Math.Sqrt(kx*kx+ky*ky);
            Check(!b.Active&&sim.ReflectCount==0&&sim.HurtCount==1&&Math.Abs(push-5)<1e-3,"block contact keeps slide 100 + shield push 5: push "+push+" hurt "+sim.HurtCount);
        }
        // the Q release band (up to 500 px) reaches a big ball beyond 400 px: the web never cuts a big ball with the 400 px collision filter (`&&!_bigBall`)
        foreach(double rel in new[]{0.0,500.0})
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>false;
            sim.Player.X=100;sim.Player.Y=100;sim.Player.State="idle";sim.Player.StateTicks=20;sim.Player.Iframes=0;sim.SbParryT=12;sim.SbReleaseR=rel;
            var spec=new ProjSpec {X=568,Y=100,Vx=-10,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};marker?.SetValue(spec,true);   // spawn x1.8 speed: 468 -> 450 px from the player
            var b=sim.Druid.SpawnProjectile(null,null,spec,false);sim.Druid.TickWorld(false);
            int shots=sim.Druid.Projectiles.Count(p=>p.Friendly&&p.ParryMagicShot);
            if(rel>0)Check(!b.Active&&sim.ReflectCount==1&&shots==5,"release band 500: Q split at 450 px (shots "+shots+", reflects "+sim.ReflectCount+")");
            else Check(b.Active&&!b.Friendly&&sim.ReflectCount==0&&shots==0,"no release band: the ball at 450 px flies on");
        }
        // wall contact: centre + 8 rim samples, one boom, no hurt
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>x<40;
            int booms=0;sim.BossFx+=(k,x,y,r)=>{if(k=="waterEnergy")booms++;};
            sim.Player.X=1000;sim.Player.Y=100;sim.Player.State="idle";sim.Player.Iframes=0;
            var spec=new ProjSpec {X=140,Y=100,Vx=-10,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};marker?.SetValue(spec,true);
            var b=sim.Druid.SpawnProjectile(null,null,spec,false);sim.Druid.TickWorld(false);
            Check(!b.Active&&booms==1&&sim.HurtCount==0,"rim sample wall contact: boom once, no hurt (booms "+booms+")");
        }
        // the Q split in a real fight: the shots fly through Simulation.TickParryShot and hurt a real enemy through ApplyEnemyDamage (no hook)
        {
            var sim=new Simulation(new SimulationConfig {PlayerMaxHp=2000000},20261104u);
            sim.AttachDruidBoss();sim.IsProjectileWall=(x,y)=>false;
            sim.Player.X=100;sim.Player.Y=100;sim.Player.State="sBlock";sim.Player.StateTicks=999;sim.Player.Iframes=0;sim.SbParryT=18;
            var foe=sim.SpawnNormalEnemy(100,420);
            var spec=new ProjSpec {X=268,Y=100,Vx=-10,Dmg=280,El=2,Life=320,Ml=320,Sz=48,R=20,ElemBall=true,Commit=true};marker?.SetValue(spec,true);
            sim.Druid.SpawnProjectile(null,null,spec,false);
            int hp0=foe!=null?foe.Hp+(int)foe.Shield:0;
            for(int t=0;t<160&&sim.Druid.Projectiles.Count>0;t++){sim.TickCount++;sim.Druid.TickWorld(false);}
            Check(foe!=null&&sim.ReflectCount==1&&sim.ParryShotHits>0&&(!foe.Alive||foe.Hp+(int)foe.Shield<hp0),"real shots hit a real enemy (hits "+sim.ParryShotHits+", hp "+hp0+" -> "+(foe!=null?foe.Hp+(int)foe.Shield:-1)+")");
            Check(sim.Druid.Projectiles.All(p=>p.Friendly&&p.ParryMagicShot)&&sim.Druid.Projectiles.Count<=5,"only parry shots remain");
        }
        // Ordinary elemBall and rainbow retain their existing classification/input contract.
        {
            var sim=new Simulation(new SimulationConfig(),20261104u);sim.AttachDruidBoss();
            foreach(var spec in new[]{new ProjSpec {ElemBall=true,El=2},new ProjSpec {BlackBean=true,El=0},new ProjSpec {El=0},new ProjSpec {El=2}}) {
                var b=sim.Druid.SpawnProjectile(null,null,spec,false);
                Check(b.ParryClass==(spec.BlackBean?"magic":spec.ElemBall?"forbidden":spec.El==0?"physical":"magic"),"other classification unchanged");
            }
        }
        // Exercise the actual angler generator, not just an injected projectile.
        {
            var sim=new Simulation(new SimulationConfig(),20261104u);sim.AttachDruidBoss();sim.FieldEnemyCanShoot=(x,y)=>true;
            var fb=sim.MakeFieldBoss(0,4,4,3);sim.Player.X=300;sim.Player.Y=300;
            typeof(Simulation).GetMethod("FieldBossFireEnergy",BindingFlags.NonPublic|BindingFlags.Instance).Invoke(sim,new object[]{fb});
            Check(marker!=null&&(bool)marker.GetValue(sim.FieldBossShots.Last()),"real generator sets fbEnergy");
            Check(sim.Druid.Projectiles.Last().ParryClass=="magic","real generator reaches magic classification");
        }
    }
}
