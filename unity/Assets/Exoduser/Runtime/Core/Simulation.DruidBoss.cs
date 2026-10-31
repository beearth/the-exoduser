using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // BX-01..05 glue: registers the 1-1 dark druid (DruidBoss) behind Stage.BossSpawners / BossTick and gives it the simulation as IBossHost.
    public sealed partial class Simulation
    {
        public DruidBoss Druid;
        public Action AfterEnemyTick;                        // update(): runs after the enemy loop (projectile + hazard updates of the boss)
        public float PlayerPoison, PlayerWebSlow;            // P.poison (DOT stacks) / P._webSlow (frames, halves the walk speed)
        public event Action<string, double, double, double> BossFx;   // presentation hook: (kind, x, y, radius)
        internal double NextBossRandom() { return NextRandom(); }
        float MoveSlowMultiplier { get { return PlayerWebSlow > 0 || PlayerFreezeSlow > 0 || PlayerTrapSlow > 0 ? .5f : 1f; } }

        public void AttachDruidBoss()
        {
            if (Druid != null) return;
            Druid = new DruidBoss(new BossHostAdapter(this)) { ElementMul = el => EnemyHurt.ElMul(el, ArmorElement()) };
            Stage.BossSpawners[0] = SpawnDruid; Stage.BossSpawners[3] = SpawnDruid;
            RegisterRemodelSpawners();   // RM-B0: other stages with a registered remodel set, only while its flag is on
            BossTick = DruidBossTick;
            AfterEnemyTick += TickDruidWorld;
        }

        // mkEn(x, y, si, 0, true, EL.P, 0): the oracle-checked Core builds the boss record (hp / atk / shield / poise / revive points / RNG order); EnemyState mirrors it.
        EnemyState SpawnDruid(Simulation sim, float x, float y)
        {
            var context = new EnemySpawnContext {
                PlayerLevel = Player.Level, DifficultyIndex = Config.DifficultyIndex, StageDiffOffset = 0, Stage = Config.StageIndex,
                DemoMode = Config.DemoMode, DemoLastStage = Config.DemoLastStage,
                CanMove = (cx, cy, cr) => Pass((float)cx, (float)cy, (float)cr), Random = NextRandom
            };
            var web = EnemyFactory.Create(context, x, y, Config.StageIndex, 0, true, 0, 0);
            if (web == null) return null;
            var e = new EnemyState {
                Etype = (int)web.etype, X = (float)web.x, Y = (float)web.y, Radius = (float)web.r,
                Hp = ToIntClamped(web.hp), MaxHp = ToIntClamped(web.mhp), Attack = ToIntClamped(web.atk), BaseAttack = ToIntClamped(web.baseAtk), Level = (int)web.lv,
                Shield = (float)web.eShield, MaxShield = (float)web.eShieldMax, Poise = (float)web.poise, MaxPoise = (float)web.maxPoise,
                Speed = (float)web.speed, Facing = (float)web.facing, StateTicks = (float)web.st2, ProjectileTicks = (float)web.projT,
                Elite = (int)web.elite, Col = web.col, Web = web, IsBoss = true, RevPts = web._revPts, MaxRevPts = web._maxRevPts, State = "idle"
            };
            webOwner[web] = e;
            AddEnemy(e);
            Druid.ClearHazards();
            var rmSet = RemodelSetFor(Config.StageIndex);   // RM-B0: null unless the remodel flag of this stage's set is on
            Druid.Remodel = rmSet != null; if (rmSet != null) Druid.Set = rmSet;
            Druid.Attach(e);
            if (rmSet != null) RemodelAttach(e, rmSet);
            return e;
        }

        void DruidBossTick(EnemyState e)
        {
            if (remodelPropMap.Count > 0 && remodelPropMap.ContainsKey(e)) return;   // RM-B0b: a boss prop has no AI
            if (druidLives.Count > 0 && RemodelPreTick(e)) return;   // RM-B1: kneeling between lives (the table is empty unless a remodel fight is attached)
            if (Druid != null && (Config.StageIndex == 0 || Config.StageIndex == 3 || Druid.Remodel))
            {
                if (druidLives.Count > 0) RemodelTickHead(e);   // RM-B0b: damage scale / obstacle bump (no-op for a set without them)
                Druid.TickBoss(e);
                if (druidLives.Count > 0) RemodelTickTail(e);
            }
            else TickEnemy(e);
        }

        void TickDruidWorld()
        {
            // PlayerWebSlow / poison belong to the player update of the web (33143, 33151)
            if (PlayerWebSlow > 0) PlayerWebSlow--; if (PlayerFreezeSlow > 0) PlayerFreezeSlow--; if (PlayerTrapSlow > 0) PlayerTrapSlow--;
            if (PlayerPoison > 0 && Player.Hp > 0)
            {
                PlayerPoison -= .02f;
                if ((int)Math.Floor(PlayerPoison * 10) % 6 < 1) { int pd = Js.Int(Player.MaxHp * .008); HurtPlayer(pd, new HurtOptions { Dot = true }); }
            }
            if (Druid == null) return;
            TickRemodelRules();   // RM-B0b: ended props leave Enemies, obstacles end with the arena
            if (Druid.Boss != null && !Enemies.Contains(Druid.Boss)) { Druid.ClearHazards(); Druid.Data.Clear(); Druid.Boss = null; }
            Druid.TickWorld(Stage.Enabled && Stage.InArena && Stage.BossAlive);
        }

        // Web Q-error aftermath is independent of whether hurtP dodged or shielded the hit.
        public sealed class RedBeanBurnStack { public double Total, Ticks, Tick; }
        public readonly List<RedBeanBurnStack> RedBeanBurns=new List<RedBeanBurnStack>();
        void AddRedBeanBurn(double rawDamage)
        {
            if(RedBeanBurns.Count<10){RedBeanBurns.Add(new RedBeanBurnStack{Total=rawDamage*2,Ticks=600,Tick=0});HurtText(Player.X,Player.Y-30,"화상!×"+RedBeanBurns.Count,"Burn!×"+RedBeanBurns.Count,"#ff4400",30);}
        }
        void OnRedBeanWrongInput(double rawDamage,double x,double y)
        {
            AddRedBeanBurn(rawDamage);
            DoHitFlash("#ff2200",.25);ScreenFlashAlpha=.3f;QueueLogicalSound("detonate","red bean Q wrong input",x,y);
        }
        // Source update switch: these stacks advance only in the idle branch, before walking/attacking.
        void TickRedBeanBurns()
        {
            TickRainbowPoisons();
            int write=0;for(int i=0;i<RedBeanBurns.Count;i++)
            {
                var burn=RedBeanBurns[i];burn.Ticks-=1;burn.Tick+=1;if(burn.Ticks<=0)continue;
                if(burn.Tick>=30){burn.Tick=0;int amount=Math.Max(1,Js.Int(burn.Total/20));HurtPlayer(amount,new HurtOptions{Dot=true});HurtText(Player.X,Player.Y-15-i*12,"화상 "+amount,"Burn "+amount,"#ff4400",18);}
                RedBeanBurns[write++]=burn;
            }
            if(write<RedBeanBurns.Count)RedBeanBurns.RemoveRange(write,RedBeanBurns.Count-write);
        }


        public sealed class RainbowPoisonStack { public double Total,Ticks,Tick; }
        public readonly List<RainbowPoisonStack> RainbowPoisons=new List<RainbowPoisonStack>();
        void TickRainbowPoisons()
        {
            int write=0;for(int i=0;i<RainbowPoisons.Count;i++)
            {
                var poison=RainbowPoisons[i];poison.Ticks-=1;poison.Tick+=1;if(poison.Ticks<=0)continue;
                if(poison.Tick>=30){poison.Tick=0;int amount=Math.Max(1,Js.Int(poison.Total/20));HurtPlayer(amount,new HurtOptions{Dot=true});HurtText(Player.X,Player.Y-15-i*12,"중독 "+amount,"Poison "+amount,"#88cc44",18);}
                RainbowPoisons[write++]=poison;
            }
            if(write<RainbowPoisons.Count)RainbowPoisons.RemoveRange(write,RainbowPoisons.Count-write);
        }
        void OnRainbowContact(BossProjectile p)
        {
            double angle=Math.Atan2(Player.Y-p.Y,Player.X-p.X);
            if(Player.Iframes>0&&Player.State!="whirlwind"){BossFx?.Invoke("rainbow",p.X,p.Y,80);return;}
            if(Player.Iframes>0&&Player.State=="whirlwind")
            {
                // ReflectInput exposes no whirlwind fusion in this port; retain the source base absorption.
                const double absorb=.20;
                int absorbed=Math.Max(1,Js.Int(p.Dmg*.3*(1-absorb)*(1-ParryRules.ParryRainbowDamageReduction(PParry))));
                HurtPlayer(absorbed,new HurtOptions{Magic=true,Projectile=true,DruidPoison=p.DruidPoison,HasSource=true,SrcX=Player.X,SrcY=Player.Y});
                ParryBank+=Js.Int(p.Dmg*.3*absorb);Player.KnockbackX+=(float)(Math.Cos(angle)*2);Player.KnockbackY+=(float)(Math.Sin(angle)*2);
                HurtShake(3);DoHitFlash("#ff00ff",.1);return;
            }
            double dr=ParryRules.ParryRainbowDamageReduction(PParry);
            int damage=Math.Max(Js.Int(Player.MaxHp*.15*(1-dr)),Js.Int(p.Dmg*.7*(1-dr)));
            HurtPlayer(damage,new HurtOptions{Magic=true,Projectile=true,DruidPoison=p.DruidPoison,HasSource=true,SrcX=Player.X,SrcY=Player.Y});
            if(RainbowPoisons.Count<10){RainbowPoisons.Add(new RainbowPoisonStack{Total=damage*2,Ticks=600,Tick=0});HurtText(Player.X,Player.Y-30,"중독!×"+RainbowPoisons.Count,"Poison!×"+RainbowPoisons.Count,"#33aa22",30);}
            Player.Poise=(float)Math.Max(0,Js.Or(Player.Poise,4)-2);
            if(Player.Poise<=0)
            {
                if(PlayerPoise.IsFocusState(Player.State)){Player.Poise=1;HurtText(Player.X,Player.Y-20,"집중!","Focus!","#44ddff",20);}
                else{Player.State="pStun";Player.StateTicks=PlayerPoise.StunFrames(CcRes,StunRes);Player.Iframes=60;CancelKiCharge();}
            }
            Player.KnockbackX+=(float)(Math.Cos(angle)*7);Player.KnockbackY+=(float)(Math.Sin(angle)*7);Player.Iframes=Math.Max(Player.Iframes,15);
            HurtShake(14);DoHitFlash("#ff00ff",.3);ScreenFlashAlpha=.35f;QueueLogicalSound("detonate","rainbow explosion",p.X,p.Y);
            var targets=Enemies.ToArray();int areaDamage=Math.Max(120,Js.Int(p.Dmg*2));
            foreach(var enemy in targets)if(enemy!=null&&enemy.Alive){double dx=enemy.X-p.X,dy=enemy.Y-p.Y;if(dx*dx+dy*dy<=120*120)ApplyEnemyDamage(enemy,areaDamage,(float)Math.Atan2(dy,dx),false,1,atkEl:p.El);}
            BossFx?.Invoke(p.DruidPoison?"druid_poison_hit":"rainbow_light",p.X,p.Y,120);
        }

        // ---- IBossHost ------------------------------------------------------------------------------------------------------------------------------------
        sealed class BossHostAdapter : IBossHost, IBossReflectHost, IBossProjectileSweepHost, IBossProjectileHurtHost, IBossRedBeanWrongInputHost, IBossProjectileBodyHurtHost, IBossRainbowContactHost
        {
            readonly Simulation s;
            public BossHostAdapter(Simulation sim) { s = sim; }
            public double Rand() { return s.NextBossRandom(); }
            public int Stage { get { return s.Config.StageIndex; } }
            public double ArenaW { get { return (s.Stage.InArena ? BossArenaLayout.Width : 50) * 40.0; } }
            public double ArenaH { get { return (s.Stage.InArena ? BossArenaLayout.Height : 42) * 40.0; } }
            public double PX { get { return s.Player.X; } set { s.Player.X = (float)value; } }
            public double PY { get { return s.Player.Y; } set { s.Player.Y = (float)value; } }
            public double PPrevX { get { return s.executingFirstPracticeTick?s.projectileStepStartX:s.Player.X; } }
            public double PPrevY { get { return s.executingFirstPracticeTick?s.projectileStepStartY:s.Player.Y; } }
            public double PRadius { get { return s.Player.Radius; } }
            public double PFacing { get { return s.Player.Facing; } }
            public double PIframes { get { return s.Player.Iframes; } set { s.Player.Iframes = (float)value; } }
            public bool PlayerAlive { get { return s.Player.Hp > 0; } }
            public bool ParryWindowOpen() { return s.Player.Hp > 0 && ParryRules.IsParryWindow(s.Player.State, s.Player.StateTicks, 0, s.SbParryT, s.CapeParry); }
            public bool CanMove(double x, double y, double r) { return s.Pass((float)x, (float)y, (float)r); }
            public bool TileWall(double x, double y) { return s.IsProjectileWall != null && s.IsProjectileWall((float)x, (float)y); }
            public bool IsWall(double x, double y) { return s.IsProjectileWall != null ? s.IsProjectileWall((float)x, (float)y) : !s.Pass((float)x, (float)y, 0); }
            public bool SafePoint(double x, double y, double r, out double ox, out double oy)
            {   // safePt: the spiral of the web (T..5T step T/2, 8 angles)
                if (CanMove(x, y, r)) { ox = x; oy = y; return true; }
                for (double d = 40; d <= 200; d += 20) for (int a = 0; a < 8; a++)
                {
                    double nx = x + Math.Cos(Math.PI / 4 * a) * d, ny = y + Math.Sin(Math.PI / 4 * a) * d;
                    if (CanMove(nx, ny, r)) { ox = nx; oy = ny; return true; }
                }
                ox = x; oy = y; return false;
            }
            // no flow field is ported: the open boss arena is walked in a straight line towards the player (the web field points the same way without obstacles)
            public bool FlowDir(double x, double y, out double dx, out double dy) { double a = Math.Atan2(s.Player.Y - y, s.Player.X - x); dx = Math.Cos(a); dy = Math.Sin(a); return true; }
            public bool Los(double x, double y, double tx, double ty) { return s.HasLineOfSight == null || s.HasLineOfSight((float)x, (float)y, (float)tx, (float)ty); }
            public void HurtPlayer(int damage, bool magic) { s.HurtPlayer(damage, new HurtOptions { Magic = magic }); }
            public void HurtProjectile(int damage,bool magic,bool redBean=false,bool druidPoison=false,bool wrongInput=false) { s.HurtPlayer(damage,new HurtOptions { Magic=magic,Projectile=true,RedBean=redBean,DruidPoison=druidPoison,HasSource=wrongInput,SrcX=s.Player.X,SrcY=s.Player.Y }); }
            public void HurtProjectileBody(BossProjectile p,int damage,double knockX,double knockY)
            {
                s.HurtPlayer(damage,new HurtOptions{Magic=true,Projectile=true,RedBean=p.RedBean,DruidPoison=p.DruidPoison,HasKnockback=true,KnockX=(float)knockX,KnockY=(float)knockY});
                if(p.RedBean&&!p.DruidPoison)s.AddRedBeanBurn(damage);
                if(p.WaterBean)s.PlayerFreezeSlow=Math.Max(s.PlayerFreezeSlow,60);
            }
            public void RainbowContact(BossProjectile p) { s.OnRainbowContact(p); }
            public void RedBeanWrongInput(double rawDamage,double x,double y) { s.OnRedBeanWrongInput(rawDamage,x,y); }
            public void KnockPlayer(double kx, double ky) { s.Player.KnockbackX += (float)kx; s.Player.KnockbackY += (float)ky; }
            public void StopPlayerKnock() { s.Player.KnockbackX = 0; s.Player.KnockbackY = 0; }
            public void PlayerPoison(double stacks, double webSlow) { s.PlayerPoison += (float)stacks; s.PlayerWebSlow = Math.Max(s.PlayerWebSlow, (float)webSlow); }
            public bool TryParry(EnemyState boss, double dmgMul, double stunFrames, double poiseAmt, double knockAngle)
            {
                if (!ParryWindowOpen()) return false;
                bool q = s.Player.State == "sBlock" || s.Player.State == "peaceShield" || s.SbParryT > 0;
                if (boss != null && boss.Alive)
                {
                    if (stunFrames > 0) boss.Stunned = (float)stunFrames;
                    if (dmgMul > 0)
                    {
                        int pd = Js.Int((s.Player.BaseAttack + s.Config.WeaponAttack + s.Config.WeaponEnhanceAttack) * dmgMul * ParryRules.ParryCounterDamageMul(s.PParry));
                        s.HurtEnemy(boss, pd, (float)knockAngle);
                        s.ParryBank += pd;   // P.parryBank += _pd (the counter damage)
                    }
                }
                s.ApplyParrySuccess(q);
                if (boss != null && boss.Alive && poiseAmt > 0 && s.Druid != null) s.Druid.PoiseHit(boss, poiseAmt);
                return true;
            }
            public void BossHurt(EnemyState boss, int damage, double angle) { s.HurtEnemy(boss, damage, (float)angle); }
            public void Text(double x, double y, string ko, string color, int life) { s.HurtText(x, y, ko, ko, color, life); }
            public void Shake(double n) { s.HurtShake(n); }
            public void Fx(string kind, double x, double y, double r) { var h = s.BossFx; if (h != null) h(kind, x, y, r); }
            public void Sound(string key, string source, double x, double y) { s.QueueLogicalSound(key, source, x, y); }
            public EnemyState SpawnMinion(double x, double y, int element, int etype)
            {
                var m = s.SpawnNormalEnemy((float)x, (float)y);
                if (m == null) return null;
                m.Hp = Js.Int(m.Hp * .5); m.MaxHp = m.Hp; m.Shield = 0; m.MaxShield = 0;   // summons are weak: hp x.5, no shield
                return m;
            }
            public void BossMoved(EnemyState boss) { }
            // parry reflection (ParryReflect.cs)
            public Combat.ParryReflect.ResolveInput ReflectInput(double playerDistance) { return s.ReflectInput(playerDistance); }
            public void PayReflectParry(in Combat.ParryReflect.ResolveResult result) { s.PayReflectParry(result); }
            public bool ReflectHoming(Combat.ReflectProjectile p) { return s.ReflectHoming(p); }
            public bool ReflectContact(Combat.ReflectProjectile p) { return s.ReflectContact(p); }
        }
    }
}
