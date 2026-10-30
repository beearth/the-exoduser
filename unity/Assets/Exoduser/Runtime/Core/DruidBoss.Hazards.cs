using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    public sealed class ProjSpec
    {
        public double X, Y, Vx, Vy, Dmg, Life, Ml, Sz = 1, R = 4;
        public int El; public bool ElementAbsent;
        public string Col = "", ParryClass = "";
        public bool FbEnergy, FdEnergy, RedBean, BlackBean, Homing, Mine, ElemBall, DruidStraight, DruidParryVolley, Commit, FireMagic, MissileTrail, Typed, Web;
    }

    public sealed class BossProjectile
    {
        public double X, Y, Vx, Vy, Dmg, Life, Ml, Sz = 1, R = 4, Dist;
        public int El; public bool ElementAbsent;
        public string Col = "", ParryClass = "";
        public bool FbEnergy, FdEnergy, RedBean, BlackBean, Homing, Mine, ElemBall, DruidStraight, DruidPoison, DruidParryVolley, Commit, FireMagic, MissileTrail, Typed, Web, Active = true;
        // parry reflection (ParryReflect.cs): a reflected bullet is friendly and flies back as a blue bean
        public bool Friendly, BlueBean, ParryBlueBean, Magic, FromRainbow, WaterBean, TitanEye, BwBean, GbBean;
        public double AoeR, AoeDmg;
    }

    // Serial / Idx: RM-B1 telegraph list (DruidTelegraph.cs) only, the id of the move start that made the hazard; the oracle never reads them
    public sealed class ChaseZone { public double X, Y, R, T, Delay, ExplT, ExplMax; public int Dmg, Serial, Idx; public bool Hit, Druid; }
    public sealed class ChaseAoe { public int Cnt, MaxCnt, Dmg, Serial; public double T, Interval, R, Delay; public bool Druid; public List<ChaseZone> Zones = new List<ChaseZone>(); }
    public sealed class Fissure { public double X, Y, Ang, Spd, Len, MaxLen, T, MaxT, W, ExplR; public int Dmg, Serial; public bool Exploded, Druid, Straight, Hit, Done; }   // Straight/Hit/Done: RM-B1 straight fissure (spec #4)
    public sealed class TideWave { public double X, Y, Rad, MaxR, Spd, T, MaxT, GapAng, GapSize, W, HitT; public int Dmg, Serial; public bool Druid; }
    public sealed class SeekerMine { public bool DruidMine; public double X, Y, Vx, Vy, Spd, SpeedCap = 1.5, T, ArmT, MaxT, R; public int Dmg, El, Hp; }
    public sealed class PoisonPool { public double X, Y, T, MaxT, R, TickT; public int Dmg; }
    public sealed class LavaPool { public double X, Y, T, WarnT, MaxT, R, TickT; public int Dmg; }
    public sealed class DruidOrb { public double X, Y, Vx, Vy, T, R; public int Dmg; }

    // Enemy projectiles (spawnProj / _spawnBossProjectile / the enemy half of the projectile loop) and the boss hazards of update() (chase AoE, fissure, tide wave,
    // seeker mine, poison pool, lava pool = druid poison swamp, rhythm volley, orb). Player contact goes through IBossHost.HurtPlayer, i.e. B09 hurtP (which already
    // handles the E strike window and the Q block); the bullet reflection (blue bean) of a successful parry is NOT ported: the bullet is absorbed.
    public sealed partial class DruidBoss
    {
        public readonly List<BossProjectile> Projectiles = new List<BossProjectile>();
        public readonly List<ChaseAoe> ChaseAoes = new List<ChaseAoe>();
        public readonly List<Fissure> Fissures = new List<Fissure>();
        public readonly List<TideWave> TideWaves = new List<TideWave>();
        public readonly List<SeekerMine> SeekerMines = new List<SeekerMine>();
        public readonly List<PoisonPool> PoisonPools = new List<PoisonPool>();
        public readonly List<LavaPool> LavaPools = new List<LavaPool>();
        public readonly List<DruidOrb> Orbs = new List<DruidOrb>();
        public int ProjDropCnt;                    // _eProjDropCnt (module level: 1 of 3 moving bullets passes)
        public int Dropped, Spawned;               // oracle counters
        public double VolleyT, OrbT; public int VolleyN;   // G._druidParryT / _druidOrbT / _druidParryVolley
        public bool ProjectileFlight = true;       // false: oracle (the web projectile loop is not extracted, spawn parameters only)
        public Action<BossProjectile> OnSpawn;
        public Action<int, bool, double, double> ProjectilePlayerHurt;
        public Func<int, double> ElementMul;       // elMul(p.el, ar().el): null = 1 (the oracle and the boss arena)

        public const double ESpeedPhysMin = 300.0 / 60, ESpeedPhysMax = 300.0 / 60, ESpeedMagicMin = 500.0 / 60, ESpeedMagicMax = 600.0 / 60;

        public void ClearHazards()
        {
            Projectiles.Clear(); ChaseAoes.Clear(); Fissures.Clear(); TideWaves.Clear(); SeekerMines.Clear(); PoisonPools.Clear(); LavaPools.Clear(); Orbs.Clear();
            VolleyT = 0; OrbT = 0; VolleyN = 0;
        }

        // game.html _druidSinkStart: remove only hostile druid poison bullets; reflected bullets keep flying.
        public void ClearSinkHazards()
        {
            Projectiles.RemoveAll(p => p.DruidPoison && !p.Friendly);
            LavaPools.Clear(); Orbs.Clear();
        }

        // _projectileParryClass
        static string ClassOf(BossProjectile p)
        {
            if (p.ParryClass != "") return p.ParryClass;
            if (p.Mine) return "magic";
            if (p.BlackBean) return "magic";
            if (p.ElemBall) return "forbidden";
            if (p.FireMagic) return "magic";
            return p.El == EL_P ? "physical" : "magic";
        }

        void SpawnBossProjectile(EnemyState e, DruidData d, ProjSpec s) { SpawnProjectile(e, d, s, true); }

        // spawnProj(props) for an enemy bullet; `viaBoss` = _spawnBossProjectile wrapper (druid poison + straight flags)
        public BossProjectile SpawnProjectile(EnemyState e, DruidData d, ProjSpec s, bool viaBoss)
        {
            var p = new BossProjectile { X = s.X, Y = s.Y, Vx = s.Vx, Vy = s.Vy, Dmg = s.Dmg, ElementAbsent = s.ElementAbsent, Life = s.Life, Ml = s.Ml, Sz = s.Sz, R = s.R, El = s.El, Col = s.Col, ParryClass = s.ParryClass,
                FbEnergy = s.FbEnergy, FdEnergy = s.FdEnergy, RedBean = s.RedBean, BlackBean = s.BlackBean, Homing = s.Homing, Mine = s.Mine, ElemBall = s.ElemBall, DruidStraight = s.DruidStraight, DruidParryVolley = s.DruidParryVolley,
                Commit = s.Commit, FireMagic = s.FireMagic, MissileTrail = s.MissileTrail, Typed = s.Typed, Web = s.Web };
            if (viaBoss) { p.DruidPoison = e != null && e.IsBoss && DruidStage; p.DruidStraight = p.DruidStraight && e != null && e.IsBoss && DruidStage; }
            if (p.DruidPoison) { p.ParryClass = ClassOf(p); p.El = EL_P; p.Col = "#66dd22"; }
            p.ParryClass = ClassOf(p);
            if (p.Ml == 0 && p.Life != 0) p.Ml = p.Life;
            bool moving = p.Vx * p.Vx + p.Vy * p.Vy > 0;
            bool speedBand = moving && !p.Mine && !p.ElemBall && !p.Web;   // the other exclusions (trap, bomb, swordWave ...) are flags this boss never sets
            if (speedBand && ClassOf(p) == "magic") p.Homing = true;
            if (moving && !p.ElementAbsent && p.El == EL_P && p.ParryClass == "physical" && !p.BlackBean && !p.FireMagic && !p.Mine && !p.ElemBall && !p.Web)
            {
                p.Homing = !p.DruidStraight;
                if (!p.RedBean) { p.Vx *= 1.3; p.Vy *= 1.3; p.RedBean = true; }
            }
            if (moving)
            {
                if (!p.Commit && !p.DruidParryVolley)
                {
                    ProjDropCnt = (ProjDropCnt + 1) % 3;
                    if (ProjDropCnt != 0) { Dropped++; return null; }
                }
                p.Sz *= 2; p.R *= 1.3; p.Vx *= 1.8; p.Vy *= 1.8; p.Dmg = I(p.Dmg * 2.0);
                if (p.RedBean) p.Dmg = I(p.Dmg * 0.5);
                if (p.RedBean) { p.Vx *= .7; p.Vy *= .7; }
            }
            if (speedBand)
            {
                double spd = Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy);
                if (spd > 0)
                {
                    string cls = ClassOf(p);
                    double next = p.BlackBean ? ESpeedMagicMin + (ESpeedMagicMax - ESpeedMagicMin) * R()
                        : cls == "physical" ? ESpeedPhysMin + (ESpeedPhysMax - ESpeedPhysMin) * R()
                        : ESpeedMagicMin + (ESpeedMagicMax - ESpeedMagicMin) * R();
                    p.Vx = p.Vx / spd * next; p.Vy = p.Vy / spd * next;
                }
            }
            Projectiles.Add(p); Spawned++; if (OnSpawn != null) OnSpawn(p);
            return p;
        }

        static double TurnRate(BossProjectile p)
        {
            if (p.BlackBean) return .0058125;
            if (p.ElemBall) return .007275;
            if (ClassOf(p) == "physical") return .00109083;
            return .00655;
        }

        // distance from point (qx,qy) to the segment (ax,ay)-(bx,by): the swept test of the projectile loop
        static double SegDist(double ax, double ay, double bx, double by, double qx, double qy)
        {
            double dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = l2 > 0 ? ((qx - ax) * dx + (qy - ay) * dy) / l2 : 0;
            t = t < 0 ? 0 : t > 1 ? 1 : t; return Dst(qx, qy, ax + dx * t, ay + dy * t);
        }

        // =====================================================================================================================================================
        // update(): enemy projectiles first, then the boss hazards in the order of the web update (chase AoE, fissure, tide wave, seeker mine, poison pool,
        // druid rhythm volley, druid orb, lava pool). Called once per simulation tick whether or not the boss is alive.
        // =====================================================================================================================================================
        public void TickWorld(bool bossAliveFlag)
        {
            if (ProjectileFlight) UpdateProjectiles();
            UpdateChaseAoes();
            UpdateFissures();
            UpdateTideWaves();
            UpdateSeekerMines();
            UpdatePoisonPools();
            if (DruidStage && bossAliveFlag && !Remodel) { UpdateRhythmVolley(); UpdateOrbs(); }   // remodel: not among the 12 moves
            UpdateLavaPools();
        }

        void UpdateProjectiles()
        {
            double px = host.PX, py = host.PY, pr = host.PRadius;
            int w = 0;
            for (int i = 0; i < Projectiles.Count; i++)
            {
                var p = Projectiles[i]; bool dead = false;
                p.Life -= 0.667;
                if (p.Mine)
                {
                    p.Vx = 0; p.Vy = 0;
                    if (Dst(px, py, p.X, p.Y) < 30 && host.PIframes <= 0)
                    {
                        host.HurtPlayer(I(p.Dmg), true);
                        double ka = Atan2(py - p.Y, px - p.X); host.KnockPlayer(Cos(ka) * 10, Sin(ka) * 10); RmText(px, py - 20, "💥 지뢰!", "#ffcc00", 40); host.Shake(6); dead = true;
                    }
                    else if (p.Life <= 0) dead = true;
                    if (dead) { p.Active = false; continue; }
                    Projectiles[w++] = p; continue;
                }
                if (p.Life <= 0)
                {
                    if (p.RedBean) dead = true;
                    else { double cdx = p.X - px, cdy = p.Y - py; if (cdx * cdx + cdy * cdy > 6250000) dead = true; else p.Life = 1; }
                }
                if (dead) { p.Active = false; continue; }
                double ox = p.X, oy = p.Y;
                if (p.Friendly && reflectHost != null) ReflectHoming(p);
                else if ((p.Homing || p.BlackBean) && !p.DruidStraight && p.Life > 30)
                {
                    double hAng = Atan2(py - p.Y, px - p.X), cAng = Atan2(p.Vy, p.Vx), diff = hAng - cAng;
                    while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
                    double turn = Math.Min(Math.Abs(diff), TurnRate(p)) * Math.Sign(diff), spd = Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy), nAng = cAng + turn;
                    p.Vx = Cos(nAng) * spd; p.Vy = Sin(nAng) * spd;
                }
                double nx = p.X + p.Vx, ny = p.Y + p.Vy;
                p.X = nx; p.Y = ny; p.Dist += Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy);
                if (host.IsWall(nx, ny)) { p.Active = false; continue; }
                if (Remodel && PillarBlocks(nx, ny, Math.Max(p.R, 2))) { p.Active = false; continue; }   // RB1-3: the root pillars stop every bullet
                if (p.Friendly)
                {   // a reflected bullet never hurts the player: it looks for an enemy (ParryReflect.Blast) and is used up on contact
                    if (reflectHost != null && ReflectContact(p)) { p.Active = false; continue; }
                    Projectiles[w++] = p; continue;
                }
                if (reflectHost != null && TryReflect(p, px, py, pr, ox, oy, nx, ny)) { Projectiles[w++] = p; continue; }
                double collR = pr + (p.Sz != 0 ? p.Sz : 1) * 3;
                double pd = Math.Min(Dst(px, py, p.X, p.Y), SegDist(ox, oy, nx, ny, px, py));
                double hitR = host.ParryWindowOpen() ? collR * 3 + 12 : collR + 4;
                if (pd < hitR && (host.ParryWindowOpen() || host.PIframes <= 0))
                {
                    if (p.Web) { host.PlayerPoison(0, 90); RmText(px, py - 20, "🕸둔화!", "#aaaaaa", 30); }   // spider web: 1.5 s slow, no damage
                    else {
                        int amount=I((p.Dmg!=0?p.Dmg:10)*(ElementMul!=null?ElementMul(p.El):1));
                        if(ProjectilePlayerHurt==null)host.HurtPlayer(amount,true);
                        else {double kx=p.Vx,ky=p.Vy,km=Math.Sqrt(kx*kx+ky*ky);if(km<=.001){kx=px-p.X;ky=py-p.Y;km=Math.Sqrt(kx*kx+ky*ky);}if(km<=.001){kx=0;ky=2;}else{kx=kx/km*2;ky=ky/km*2;}ProjectilePlayerHurt(amount,true,kx,ky);}
                    }
                    p.Active = false; continue;
                }
                Projectiles[w++] = p;
            }
            if (w < Projectiles.Count) Projectiles.RemoveRange(w, Projectiles.Count - w);
        }

        void UpdateChaseAoes()
        {
            if (ChaseAoes.Count == 0) return;
            double px = host.PX, py = host.PY, pr = host.PRadius; int cw = 0;
            for (int ci = 0; ci < ChaseAoes.Count; ci++)
            {
                var ca = ChaseAoes[ci]; ca.T += 1;
                if (ca.T >= ca.Interval && ca.Cnt < ca.MaxCnt)
                {
                    ca.T = 0; ca.Cnt++;
                    ca.Zones.Add(new ChaseZone { X = px, Y = py, R = ca.R, T = 0, Delay = ca.Delay, Dmg = ca.Dmg, Hit = false, Druid = ca.Druid, Serial = ca.Serial, Idx = ca.Cnt });
                }
                int zw = 0;
                for (int zi = 0; zi < ca.Zones.Count; zi++)
                {
                    var z = ca.Zones[zi]; z.T += 1;
                    if (!z.Hit && z.T >= z.Delay)
                    {
                        z.Hit = true; z.ExplT = 0; z.ExplMax = 15; host.Shake(6);
                        if (Dst(px, py, z.X, z.Y) < z.R + pr && host.PIframes <= 0)
                        {
                            host.HurtPlayer(I(z.Dmg), false);
                            double ka = Atan2(py - z.Y, px - z.X); host.KnockPlayer(Cos(ka) * 8, Sin(ka) * 8);
                        }
                    }
                    if (z.Hit) { z.ExplT += 1; if (z.ExplT >= z.ExplMax) continue; }
                    ca.Zones[zw++] = z;
                }
                if (zw < ca.Zones.Count) ca.Zones.RemoveRange(zw, ca.Zones.Count - zw);
                if (ca.Cnt >= ca.MaxCnt && ca.Zones.Count == 0) continue;
                ChaseAoes[cw++] = ca;
            }
            if (cw < ChaseAoes.Count) ChaseAoes.RemoveRange(cw, ChaseAoes.Count - cw);
        }

        void UpdateFissures()
        {
            if (Fissures.Count == 0) return;
            double px = host.PX, py = host.PY; int w = 0;
            for (int fi = 0; fi < Fissures.Count; fi++)
            {
                var f = Fissures[fi]; f.T += 1;
                if (f.Straight) { UpdateStraightFissure(f, px, py); if (f.T < f.MaxT) Fissures[w++] = f; continue; }
                double hx = f.X + Cos(f.Ang) * f.Len, hy = f.Y + Sin(f.Ang) * f.Len;
                double toP = Atan2(py - hy, px - hx); hx += Cos(toP) * f.Spd; hy += Sin(toP) * f.Spd;
                f.Ang = Atan2(hy - f.Y, hx - f.X); f.Len = Math.Min(f.MaxLen, Dst(f.X, f.Y, hx, hy));
                hx = f.X + Cos(f.Ang) * f.Len; hy = f.Y + Sin(f.Ang) * f.Len;
                if (!f.Exploded && f.Len >= f.MaxLen)
                {
                    f.Exploded = true; host.Shake(12);
                    if (Dst(px, py, hx, hy) < f.ExplR && host.PIframes <= 0)
                    {
                        host.HurtPlayer(I(f.Dmg), false);
                        double ka = Atan2(py - hy, px - hx); host.KnockPlayer(Cos(ka) * 10, Sin(ka) * 10);
                    }
                }
                if (f.T < f.MaxT) Fissures[w++] = f;
            }
            if (w < Fissures.Count) Fissures.RemoveRange(w, Fissures.Count - w);
        }

        // RM-B1 spec #4 (boss-battle lead ruling 2026-10-28): the head keeps the direction fixed when the telegraph started, crawls Spd per tick up to MaxLen or the arena edge,
        // and hurts only where it is: the segment it swept this tick, once per cast, no end blast. The part it has already passed stays on screen but is harmless.
        void UpdateStraightFissure(Fissure f, double px, double py)
        {
            if (f.Done) return;
            double prev = f.Len, next = Math.Min(f.MaxLen, prev + f.Spd);
            double stop = PillarRayDistance(f.X, f.Y, Cos(f.Ang), Sin(f.Ang), next);   // RB1-3: the head stops at a pillar
            bool atPillar = stop < next; if (atPillar) next = Math.Max(prev, stop);
            double nx = f.X + Cos(f.Ang) * next, ny = f.Y + Sin(f.Ang) * next;
            if (!host.CanMove(nx, ny, 10) && !PillarBlocks(nx, ny, 10)) { f.Done = true; return; }   // the arena wall ends it (CanMove also refuses the pillar margin: that is the pillar stop above, not a wall)
            f.Len = next;
            if (!f.Hit && host.PIframes <= 0 && SegDist(f.X + Cos(f.Ang) * prev, f.Y + Sin(f.Ang) * prev, nx, ny, px, py) <= FissureHitHalfWidth + host.PRadius)
            {
                f.Hit = true; host.HurtPlayer(I(f.Dmg), false);
                double ka = Atan2(py - ny, px - nx); host.KnockPlayer(Cos(ka) * 10, Sin(ka) * 10);
            }
            if (f.Len >= f.MaxLen || atPillar) { f.Done = true; host.Shake(12); }
        }

        public const double FissureHitHalfWidth = 70;

        void UpdateTideWaves()
        {
            if (TideWaves.Count == 0) return;
            double px = host.PX, py = host.PY; int w = 0;
            for (int ti = 0; ti < TideWaves.Count; ti++)
            {
                var tw = TideWaves[ti]; tw.T += 1; tw.Rad = Math.Min(tw.MaxR, tw.Rad + tw.Spd); tw.HitT -= 1;
                if (tw.HitT <= 0)
                {
                    tw.HitT = 10; double pd2 = Dst(px, py, tw.X, tw.Y);
                    if (Math.Abs(pd2 - tw.Rad) < tw.W && host.PIframes <= 0)
                    {
                        double pAng = Atan2(py - tw.Y, px - tw.X), gd = pAng - tw.GapAng;
                        while (gd > Math.PI) gd -= Math.PI * 2; while (gd < -Math.PI) gd += Math.PI * 2;
                        if (Math.Abs(gd) > tw.GapSize)
                        {
                            if (!host.TryParry(Boss, 0, 0, 0, 0)) host.HurtPlayer(I(tw.Dmg), false);
                            else if (Remodel) { DruidData bd; if (Boss != null && Data.TryGetValue(Boss, out bd)) OnBossParried(bd); }
                        }
                    }
                }
                if (tw.T < tw.MaxT) TideWaves[w++] = tw;
            }
            if (w < TideWaves.Count) TideWaves.RemoveRange(w, TideWaves.Count - w);
        }

        void UpdateSeekerMines()
        {
            if (SeekerMines.Count == 0) return;
            double px = host.PX, py = host.PY, pr = host.PRadius; int w = 0;
            for (int mi = 0; mi < SeekerMines.Count; mi++)
            {
                var sm = SeekerMines[mi]; sm.T += 1;
                if (sm.T > sm.ArmT)
                {
                    double hAng = Atan2(py - sm.Y, px - sm.X);
                    sm.Vx += (Cos(hAng) * sm.Spd * .02); sm.Vy += (Sin(hAng) * sm.Spd * .02);
                    double sv = Math.Sqrt(sm.Vx * sm.Vx + sm.Vy * sm.Vy);
                    if (sv > sm.SpeedCap) { sm.Vx *= sm.SpeedCap / sv; sm.Vy *= sm.SpeedCap / sv; }
                }
                sm.X += sm.Vx; sm.Y += sm.Vy;
                bool del = false;
                if (sm.T > sm.ArmT && Dst(px, py, sm.X, sm.Y) < sm.R + pr && host.PIframes <= 0)
                {
                    if (host.ParryWindowOpen())
                    {
                        double rA = Atan2(sm.Y - py, sm.X - px); sm.Vx = Cos(rA) * 4; sm.Vy = Sin(rA) * 4; sm.T = 0; sm.ArmT = 999; sm.MaxT = 120;
                    }
                    else { host.HurtPlayer(I(sm.Dmg), false); del = true; host.Shake(8); }
                }
                if (sm.T >= sm.MaxT) del = true;
                if (del) continue;
                SeekerMines[w++] = sm;
            }
            if (w < SeekerMines.Count) SeekerMines.RemoveRange(w, SeekerMines.Count - w);
        }

        void UpdatePoisonPools()
        {
            if (PoisonPools.Count == 0) return;
            double px = host.PX, py = host.PY, pr = host.PRadius; int w = 0;
            for (int pi = 0; pi < PoisonPools.Count; pi++)
            {
                var pp = PoisonPools[pi]; pp.T += 1; pp.TickT += 1;
                if (Dst(px, py, pp.X, pp.Y) < pp.R + pr && host.PIframes <= 0 && pp.TickT >= 60)
                {
                    pp.TickT = 0; host.HurtPlayer(I(pp.Dmg * .5), false); RmText(px, py - 15, "독!", "#44cc00", 20);
                    if (DruidStage) host.PlayerPoison(2, 60);
                }
                if (pp.T < pp.MaxT) PoisonPools[w++] = pp;
            }
            if (w < PoisonPools.Count) PoisonPools.RemoveRange(w, PoisonPools.Count - w);
        }

        // [DRUID-PARRY-RHYTHM] 37080: independent of the AI draw, fires a comet volley every 90-6*phase frames while the druid lives
        void UpdateRhythmVolley()
        {
            var b = Boss; DruidData d;
            if (b == null || !b.Alive || !Data.TryGetValue(b, out d)) return;
            int ph = Math.Max(0, Math.Min(4, d.BossPhase)); int interval = 90 - ph * 6, count = 5 + ph;
            VolleyT += 1;
            if (VolleyT >= interval)
            {
                VolleyT -= interval;
                double aim = Atan2(host.PY - d.Y, host.PX - d.X), spread = Math.PI * (.42 + d.BossPhase * .03);
                for (int i = 0; i < count; i++)
                {
                    double ang = aim - spread / 2 + spread * i / (count - 1);
                    SpawnBossProjectile(b, d, new ProjSpec { X = d.X + Cos(ang) * d.R, Y = d.Y - 36 + Sin(ang) * d.R, Vx = Cos(ang) * 6, Vy = Sin(ang) * 6, Dmg = I((d.Atk != 0 ? d.Atk : 100) * .35), El = 1, Life = 240, Ml = 240,
                        Col = "#66dd22", Sz = 2, R = 10, FireMagic = true, Typed = true, DruidParryVolley = true });
                }
                RmText(d.X, d.Y - 60, "Q!", "#66dd22", 32); VolleyN++;
            }
        }

        // [다크드루이드] orb: 3 green orbs every 110 frames, contact = in-place explosion (parry cannot reflect it)
        void UpdateOrbs()
        {
            var b = Boss; DruidData d; double px = host.PX, py = host.PY, pr = host.PRadius;
            OrbT += 1;
            if (b != null && b.Alive && Data.TryGetValue(b, out d) && OrbT >= 110)
            {
                OrbT = 0; double oa = Atan2(py - d.Y, px - d.X);
                for (int k = -1; k <= 1; k++) { double a = oa + k * 0.14; Orbs.Add(new DruidOrb { X = d.X, Y = d.Y - 40, Vx = Cos(a) * 6.8, Vy = Sin(a) * 6.8, T = 0, R = 26, Dmg = I((d.Atk != 0 ? d.Atk : 100) * .6) }); }
            }
            int w = 0;
            for (int oi = 0; oi < Orbs.Count; oi++)
            {
                var o = Orbs[oi]; o.T += 1; o.X += o.Vx; o.Y += o.Vy; bool del = false;
                if (Dst(px, py, o.X, o.Y) < o.R + pr)
                {
                    bool pw = host.ParryWindowOpen(); double obR = 90; int obDmg = Math.Max(40, I((o.Dmg != 0 ? o.Dmg : 60) * 1.2));
                    if (b != null && b.Alive && Dst(o.X, o.Y, b.X, b.Y) <= obR) host.BossHurt(b, obDmg, Atan2(b.Y - o.Y, b.X - o.X));
                    if (pw) host.TryParry(b, 0, 0, 0, 0);
                    else if (host.PIframes <= 0) { host.HurtPlayer(I(o.Dmg), false); host.PlayerPoison(3, 80); RmText(px, py - 16, "☠속박!", "#66dd22", 22); }
                    del = true;
                }
                if (o.T > 460 || o.X < -40 || o.Y < -40 || o.X > host.ArenaW + 40 || o.Y > host.ArenaH + 40) del = true;
                if (!del) Orbs[w++] = o;
            }
            if (w < Orbs.Count) Orbs.RemoveRange(w, Orbs.Count - w);
        }

        void UpdateLavaPools()
        {
            if (LavaPools.Count == 0) return;
            double px = host.PX, py = host.PY, pr = host.PRadius; int w = 0;
            for (int li = 0; li < LavaPools.Count; li++)
            {
                var lp = LavaPools[li]; lp.T += 1;
                if (lp.T >= lp.WarnT)
                {
                    lp.TickT += 1;
                    if (Dst(px, py, lp.X, lp.Y) < lp.R + pr && host.PIframes <= 0 && lp.TickT >= 30) { lp.TickT = 0; host.HurtPlayer(I(lp.Dmg * .4), false); }
                }
                if (lp.T < lp.MaxT) LavaPools[w++] = lp;
            }
            if (w < LavaPools.Count) LavaPools.RemoveRange(w, LavaPools.Count - w);
        }
    }
}
