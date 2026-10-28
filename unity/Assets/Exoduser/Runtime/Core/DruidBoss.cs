using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // BX-02/03/05 (1-1 dark druid, si0 / si3 normal branch): the AI tick of game.html updateE for `e.ib`, _bossPhaseCheck, _bossIdleMove, _bossAI, _bossScore,
    // _bossStartPattern and the 23 moves of _BOSS_MOVESET[0] with every state of the updateE switch they use. One Tick = one web frame (sp = 1).
    // Everything that touches the rest of the game (player, map, damage, fx) goes through <see cref="IBossHost"/>, so unity/Tools/druid-boss-oracle compiles this
    // file without the simulation and compares it with the ORIGINAL game.html code executed in Node (same seeded Math.random, same call order).
    // Not ported on purpose (visual or owned elsewhere): particles / blast lights / sprite clips, status DOTs on the enemy (bleed, burn ...), the _druidFinale* branch
    // (unreachable in the original: _DEMO_LAST_STAGE===0 and stage===3 cannot both hold), the lesson / testbed freeze, wall push-out, spawn-hole culling tiers.
    public interface IBossHost
    {
        double Rand();                                   // Math.random()
        int Stage { get; }                               // G.stage
        double ArenaW { get; }                           // (G.mw||50)*T in px
        double ArenaH { get; }                           // (G.mh||42)*T in px
        double PX { get; set; } double PY { get; set; }  // P.x / P.y
        double PRadius { get; }                          // P.r
        double PFacing { get; }                          // P.facing
        double PIframes { get; set; }                    // P.iframes
        bool PlayerAlive { get; }                        // P.hp>0
        bool ParryWindowOpen();                          // isPWin()
        bool CanMove(double x, double y, double r);      // canMv
        bool TileWall(double x, double y);               // G.map[ty][tx]===1 or off the map (real tile wall: knock-back wall damage)
        bool IsWall(double x, double y);                 // isW
        bool SafePoint(double x, double y, double r, out double ox, out double oy);   // safePt
        bool FlowDir(double x, double y, out double dx, out double dy);               // _ffDir (false = no field: straight line)
        bool Los(double x, double y, double tx, double ty);
        void HurtPlayer(int damage, bool magic);         // hurtP(dmg,{dtype:'magic'?})
        void KnockPlayer(double kx, double ky);          // P.kb.x += kx, P.kb.y += ky
        void StopPlayerKnock();                          // P.kb = 0
        void PlayerPoison(double stacks, double webSlow);// P.poison += n; P._webSlow = max(P._webSlow, ...)
        bool TryParry(EnemyState boss, double dmgMul, double stunFrames, double poiseAmt, double knockAngle);   // isPWin() branch: counter hit + doParry; false = no parry window
        void BossHurt(EnemyState boss, int damage, double angle);   // hurtE on the boss itself
        void Text(double x, double y, string ko, string color, int life);
        void Shake(double n);
        void Fx(string kind, double x, double y, double r);         // presentation hook (flash, rings, dust ...)
        void Sound(string key, string source, double x, double y) { }   // RM-1 sound: a logical sound key (tell_* / druid_*) at the moment the web would telegraph / fire it; no state, no RNG
        EnemyState SpawnMinion(double x, double y, int element, int etype);   // mkEn(...) child of bossSummonWind (hp/shield handled by the caller)
        void BossMoved(EnemyState boss);
    }

    // per-boss web fields that EnemyState does not carry
    public sealed partial class DruidData
    {
        public double X, Y, Facing, St2, Speed, BaseSpeed, R;                // authoritative copy of e.x/e.y/e.facing/e.st2 (synced back to EnemyState each tick)
        public string S = "idle";
        public double BossPatT, BossPatCd, BossOrbitAng, BossStrafeCd, StrafeDir, IdleRBT, ProjT, ProjCd = 50, ProjChargeT, PImmune, TelegraphT, TelegraphR, TeleDropY;
        public bool Alerted, Feinting, AtkParryable, EruptHit;
        public string CombatSt = "engage", ProjChargeBean = "normal";
        public int BossPhase, MeleeStreak, ComboIdx, DashCnt, DashIdx, SlashCnt, SlashIdx, BsWave, BsMaxWave;
        public double[] MoveCDs = new double[DruidBossData.MoveSlots];
        public List<string> LastMoves = new List<string>();
        public string[] ComboSeq;
        public double EchDx, EchDy, JumpX, JumpY, JumpOx, JumpOy, ShockR, ShockMax, WeaponAng, SweepDir, SpinAng, GrabAng, PtAng, PtT, TeleOx, TeleOy, DiveMax, DiveTx, DiveTy, UnderMax, EruptMax, Iframes;
        public double FanWindMax, GrabWindMax, Delaying;
        public double Atk, MaxPoiseBase;
        public int ProjDropCnt;
        public double ParryT, OrbT; public int ParryVolley;                    // G._druidParryT / G._druidOrbT / G._druidParryVolley
        public bool SeenAlive, WasStunned, HasLastFd;
        public double LastFdx, LastFdy, StuckT;
    }

    public sealed partial class DruidBoss
    {
        public const double T = 40;                         // tile size
        const int EL_P = 0, EL_D = 3;
        readonly IBossHost host;
        public readonly Dictionary<EnemyState, DruidData> Data = new Dictionary<EnemyState, DruidData>();
        public EnemyState Boss;                             // G._bossRef (alive druid)
        public int Tick;                                    // frames ticked (G.frame for the %6 trail gates)
        public double HitSp = 1;
        public int ScoreEvals;                              // oracle counter

        public DruidBoss(IBossHost h) { host = h; reflectHost = h as IBossReflectHost; }

        double R() { return host.Rand(); }
        static int I(double v) { return Js.Int(v); }
        static double Dst(double a, double b, double c, double d) { return Math.Sqrt((c - a) * (c - a) + (d - b) * (d - b)); }
        static double Cos(double a) { return JsMath.Cos(a); }
        static double Sin(double a) { return JsMath.Sin(a); }
        static double Atan2(double y, double x) { return JsMath.Atan2(y, x); }
        bool DruidStage { get { return host.Stage == 0 || host.Stage == 3; } }

        // ---- boss creation: mkEn(ib=true) numbers (docs/engine FDG_SOURCE_TRACE_BOSS_CH1 §1.2) -------------------------------------------------------------------
        public static readonly double[] DiffMul = { .45, .55, .65, .76, .88, 1, 1.12, 1.25, 1.40, 1.58, 1.78 };
        public static readonly int[] DiffLevelOffset = { -500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500 };
        public static void BossStats(int playerLevel, int difficulty, int stageDiffOff, int si, out int level, out int hp, out int atk)
        {
            int L = Math.Max(1, Math.Max(1, playerLevel) + DiffLevelOffset[difficulty] + stageDiffOff);   // (P.lv||1)+DIFF_LV_OFF+_stageDiffOff
            double dm = DiffMul[difficulty];
            double curve = (L <= 500 ? .4 * L * L * L + 199 * L + 100 : 50000000 * Math.Pow(1.0014, L - 500)) * 2.925;
            double pacing = 1 / (1 + Math.Min(9, Math.Max(0, L - 1)) / 18.0);
            double h0 = Math.Floor(curve * pacing * 24 * dm * 1);
            hp = (int)Math.Floor(h0 * (1 + si * .02));
            atk = (int)Math.Floor((75 + L * 2.9) * .6 * dm * 1);
            level = L;
        }

        // Fills the web fields of a freshly built boss. RNG order of mkEn: st2, facing, projT, bossPatT, _bossOrbitAng (the other draws of mkEn belong to the skin / elite code).
        public DruidData Attach(EnemyState e)
        {
            var d = new DruidData();
            d.X = e.X; d.Y = e.Y; d.R = e.Radius; d.Speed = e.Speed; d.BaseSpeed = e.Speed;
            var w = e.Web;
            if (w != null) { d.St2 = w.st2; d.Facing = w.facing; d.ProjT = w.projT; d.ProjCd = w.projCd; d.BossPatT = w.bossPatT; d.BossPatCd = w.bossPatCd; d.BossOrbitAng = w._bossOrbitAng; }
            else { d.St2 = 30 + R() * 50; d.Facing = R() * Math.PI * 2; d.ProjT = 70 + R() * 50; d.BossPatT = 30 + R() * 20; d.BossOrbitAng = R() * Math.PI * 2; d.BossPatCd = 35; }
            d.S = "idle"; d.Atk = e.Attack; e.BossPatCd = d.BossPatCd; e.BossPhase = 0;
            Data[e] = d; WriteBack(e, d); Boss = e; ResetPillars();
            return d;
        }

        // oracle / harness: an explicit web-state preset instead of the mkEn record
        public DruidData Attach(EnemyState e, DruidData preset) { Data[e] = preset; WriteBack(e, preset); Boss = e; ResetPillars(); return preset; }

        // external writers (revive, stun end, hit-stun ...) change EnemyState; pull their changes in before the tick
        void Pull(EnemyState e, DruidData d)
        {
            if (e.Web != null) d.PImmune = e.Web._pImmune ?? 0;
            if ((float)d.X != e.X) d.X = e.X;
            if ((float)d.Y != e.Y) d.Y = e.Y;
            if ((float)d.Facing != e.Facing) d.Facing = e.Facing;
            if ((float)d.St2 != e.StateTicks) d.St2 = e.StateTicks;
            if (d.S != e.State) d.S = e.State;
            if ((float)d.R != e.Radius) d.R = e.Radius; if ((float)d.Speed != e.Speed) d.Speed = e.Speed; d.Atk = e.Attack;
            d.BossPhase = (int)e.BossPhase; d.BossPatCd = e.BossPatCd;
        }
        void WriteBack(EnemyState e, DruidData d)
        {
            e.X = (float)d.X; e.Y = (float)d.Y; e.Facing = (float)d.Facing; e.StateTicks = (float)d.St2; e.State = d.S; e.BossPhase = d.BossPhase; e.BossPatCd = d.BossPatCd;
            e.Speed = (float)d.Speed; e.Attack = (int)d.Atk;
            if (e.Web != null) e.Web._pImmune = d.PImmune;
        }

        // =====================================================================================================================================================
        // updateE for the druid boss (Simulation.BossTick). Returns nothing; the caller already ran the enemy-loop timers (stun / hit-stun / revive iframes).
        // =====================================================================================================================================================
        public void TickBoss(EnemyState e)
        {
            DruidData d;
            if (!Data.TryGetValue(e, out d)) d = Attach(e);
            Pull(e, d);
            Tick++;
            EnsurePillars();
            if (Remodel && d.HeartCd > 0) d.HeartCd -= 1;                             // heartbeat cooldown = 40 s of boss ticks (not only idle ticks); the sim skips the boss tick while it kneels
            if (d.PImmune > 0) d.PImmune -= 1;                                        // Step(): `if(e._pImmune>0) e._pImmune-=sp`
            if (d.WasStunned && e.Stunned <= 0)                                       // Step(): stun end (`e.stunned<=0&&e._maxStunned`): poise reset, 5 s immunity, back to idle
            {
                d.WasStunned = false; e.MaxStunned = 0; e.Poise = e.MaxPoise; e.PoiseRegenTicks = 0; d.PImmune = Math.Max(d.PImmune, 300); d.S = "idle"; d.St2 = 30; d.TeleDropY = 0;
            }
            if (d.TelegraphT > 0) { d.TelegraphT -= 1; d.TelegraphR = d.R + 20; }     // updateE head
            if (e.ReviveIframes > 0) e.ReviveIframes = Math.Max(0, e.ReviveIframes - 1);   // the web decrements it in the enemy loop AND in updateE
            // knock-back movement (EnemyState carries kb); a hit on a real tile wall hurts the boss (hurtE wall collision damage; rifts are not ported)
            if (Math.Abs(e.KnockbackX) > .1 || Math.Abs(e.KnockbackY) > .1)
            {
                double nx = d.X + e.KnockbackX, ny = d.Y + e.KnockbackY;
                if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                else
                {
                    double kbSpd = Math.Sqrt((double)e.KnockbackX * e.KnockbackX + (double)e.KnockbackY * e.KnockbackY);
                    if (host.TileWall(nx, ny) && kbSpd > 2)
                    {
                        double wPct = Math.Min(0.08, kbSpd * 0.004);
                        int wallDmg = Math.Max(I(kbSpd * 4), I(e.MaxHp * wPct));
                        host.BossHurt(e, wallDmg, 0); host.Shake(8); RmText(d.X, d.Y - 18, "벽 충돌! " + wallDmg, "#cc8844", 30);
                    }
                    e.KnockbackX = 0; e.KnockbackY = 0;
                }
                e.KnockbackX = (float)(e.KnockbackX * .85); e.KnockbackY = (float)(e.KnockbackY * .85);
            }
            if (e.HitStun > 0) { WriteBack(e, d); return; }
            if (e.Stunned > 0)
            {
                d.WasStunned = true;
                d.ProjChargeT = 0;                                                    // _cancelProjCharge
                if (e.Stunned > 180) e.Stunned = 180;
                if (e.MaxStunned < e.Stunned) e.MaxStunned = e.Stunned;
                WriteBack(e, d); return;
            }
            double dist = Dst(host.PX, host.PY, d.X, d.Y);
            // sight aggro and the alerted chase of the common head (etype 0 range 400: flow move x2 until within 30 px)
            if (!d.Alerted && dist < 800 && (d.S == "idle" || d.S == "recover") && host.Los(d.X, d.Y, host.PX, host.PY)) d.Alerted = true;
            if (!Remodel)   // remodel (RB1-6): facing is limited per state (Face) and the walk is RmWalk, not a snap + a x2 flow chase
            {
                bool aimLocked = DruidStage && (d.S == "bossCharge" || (d.S == "bossChargeWind" && d.St2 <= 18 + 1));
                if (dist < 800 && d.Alerted && !aimLocked) d.Facing = Atan2(host.PY - d.Y, host.PX - d.X);
                if (d.Alerted && (d.S == "idle" || d.S == "recover") && dist > 30) { FlowMove(d, 2); dist = Dst(host.PX, host.PY, d.X, d.Y); }
            }
            // ATK reset + projectile charge + clock (38771, 38874-38884): the phase ATK buff lives until the next reset
            // (e.baseAtk is kept by the factory; the phase check multiplies e.atk, the next tick resets it to baseAtk)
            if (e.BaseAttack > 0) d.Atk = e.BaseAttack;
            if (d.ProjChargeT > 0) { d.ProjChargeT -= 1; if (d.ProjChargeT <= 0) FireChargedProj(e, d); }
            d.St2 -= 1;
            if (Remodel) RmDrift(d);
            UpdateBoss(e, d, dist);
            WriteBack(e, d);
            host.BossMoved(e);
        }

        // _ffMoveE(e,sp,mul): flow field direction (host.FlowDir) or the last direction, wall slide, 8/16 direction escape when stuck, teleport towards the player after 90 stuck frames
        void FlowMove(DruidData d, double mul)
        {
            double dx, dy;
            bool fd = host.FlowDir(d.X, d.Y, out dx, out dy);
            if (!fd)
            {
                if (d.HasLastFd) { dx = d.LastFdx; dy = d.LastFdy; }
                else { double a = Atan2(host.PY - d.Y, host.PX - d.X); dx = Cos(a); dy = Sin(a); }
            }
            else { d.LastFdx = dx; d.LastFdy = dy; d.HasLastFd = true; }
            double s = d.Speed * mul, nx = d.X + dx * s, ny = d.Y + dy * s;
            if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; d.StuckT = 0; }
            else if (host.CanMove(nx, d.Y, d.R)) { d.X = nx; d.LastFdx = dx; d.LastFdy = 0; d.HasLastFd = true; d.StuckT = 0; }
            else if (host.CanMove(d.X, ny, d.R)) { d.Y = ny; d.LastFdx = 0; d.LastFdy = dy; d.HasLastFd = true; d.StuckT = 0; }
            else
            {
                d.StuckT += 1;
                double escAng = Atan2(dy, dx), escSpd = s * 0.8; bool escaped = false;
                for (int e2 = 1; e2 <= 4 && !escaped; e2++)
                {
                    double a1 = escAng + e2 * Math.PI / 4, a2 = escAng - e2 * Math.PI / 4, ex1 = d.X + Cos(a1) * escSpd, ey1 = d.Y + Sin(a1) * escSpd;
                    if (host.CanMove(ex1, ey1, d.R)) { d.X = ex1; d.Y = ey1; d.LastFdx = Cos(a1); d.LastFdy = Sin(a1); d.HasLastFd = true; escaped = true; }
                    else
                    {
                        double ex2 = d.X + Cos(a2) * escSpd, ey2 = d.Y + Sin(a2) * escSpd;
                        if (host.CanMove(ex2, ey2, d.R)) { d.X = ex2; d.Y = ey2; d.LastFdx = Cos(a2); d.LastFdy = Sin(a2); d.HasLastFd = true; escaped = true; }
                    }
                }
                if (!escaped && d.StuckT > 30)
                {
                    double sr = Math.Max(2, d.R - 2);
                    for (int e3 = 1; e3 <= 8 && !escaped; e3++)
                    {
                        double a3 = escAng + e3 * Math.PI / 8, a4 = escAng - e3 * Math.PI / 8, ex3 = d.X + Cos(a3) * escSpd, ey3 = d.Y + Sin(a3) * escSpd;
                        if (host.CanMove(ex3, ey3, sr)) { d.X = ex3; d.Y = ey3; d.LastFdx = Cos(a3); d.LastFdy = Sin(a3); d.HasLastFd = true; escaped = true; }
                        else
                        {
                            double ex4 = d.X + Cos(a4) * escSpd, ey4 = d.Y + Sin(a4) * escSpd;
                            if (host.CanMove(ex4, ey4, sr)) { d.X = ex4; d.Y = ey4; d.LastFdx = Cos(a4); d.LastFdy = Sin(a4); d.HasLastFd = true; escaped = true; }
                        }
                    }
                }
                if (!escaped && d.StuckT > 90)
                {
                    double tpA = Atan2(host.PY - d.Y, host.PX - d.X);
                    for (double tpD = s * 2; tpD <= s * 6; tpD += s)
                    {
                        double tx = d.X + Cos(tpA) * tpD, ty = d.Y + Sin(tpA) * tpD;
                        if (host.CanMove(tx, ty, d.R)) { d.X = tx; d.Y = ty; d.StuckT = 0; break; }
                    }
                }
                if (escaped) d.StuckT = 0;
            }
        }

        // 40588.. : phase check -> idle move + AI -> feint intercept -> state switch
        void UpdateBoss(EnemyState e, DruidData d, double dist)
        {
            if (e.Alive && !Remodel) PhaseCheck(e, d);   // remodel: the life (Simulation.DruidRemodel) is the phase
            if (d.S == "idle") { if (Remodel) RmWalk(e, d, dist); else IdleMove(e, d, dist); AI(e, d, dist); }
            if (d.Feinting && d.S.EndsWith("Wind") && d.St2 <= (Remodel ? d.RmTeleTotal / 2 : 0))   // remodel: a feint cuts the telegraph at its half way point (first half only)
            {
                if (Remodel) { d.S = "bossRec"; d.St2 = DruidRemodelData.FeintRecovery; } else { d.S = "recover"; d.St2 = 25; }
                d.Feinting = false; RmText(d.X, d.Y - 30, "...", "#cccccc", 30);
            }
            StateSwitch(e, d, dist);
        }

        // ---- _bossPhaseCheck ----------------------------------------------------------------------------------------------------------------------------------
        void PhaseCheck(EnemyState e, DruidData d)
        {
            double hpR = (double)e.Hp / e.MaxHp;
            int bp = hpR > .80 ? 0 : hpR > .60 ? 1 : hpR > .40 ? 2 : hpR > .20 ? 3 : 4;
            if (bp <= d.BossPhase) return;
            d.BossPhase = bp;
            var ph = DruidBossData.Phases[bp];
            e.Hp = Math.Max(e.Hp, I(e.MaxHp * ph.HpHigh));
            e.ReviveIframes = 90;
            d.Atk = I(d.Atk * 1.3);   // e.atk only: the next tick restores baseAtk (web 38771)
            d.Speed = Math.Min(d.Speed * 1.15, 1.8 + bp * .1);
            e.MaxPoise = I(e.MaxPoise * 1.2);
            d.BossPatCd = Math.Max(20, I(d.BossPatCd * (.9 - bp * .05)));
            e.Stunned = 0; d.S = "recover"; d.St2 = 45; d.BossPatT = 10;
            d.ComboSeq = null; d.ComboIdx = 0; d.Feinting = false; d.Delaying = 0;
            for (int i = 0; i < d.MoveCDs.Length; i++) d.MoveCDs[i] = 0;
            // teleport behind the player
            double tpAng = host.PFacing + Math.PI + ((R() - .5) * .8);
            double tpDist = 80 + bp * 25;
            double tpX = host.PX + Cos(tpAng) * tpDist, tpY = host.PY + Sin(tpAng) * tpDist;
            double sx, sy;
            if (host.CanMove(tpX, tpY, d.R)) { d.X = tpX; d.Y = tpY; }
            else if (host.SafePoint(host.PX + Cos(tpAng) * 50, host.PY + Sin(tpAng) * 50, d.R, out sx, out sy)) { d.X = sx; d.Y = sy; }
            host.Fx("phaseBlink", d.X, d.Y, d.R);
            // shockwave
            double waveR = 100 + bp * 30; int waveDmg = I(d.Atk * (.4 + bp * .1));
            if (Dst(host.PX, host.PY, d.X, d.Y) < waveR && host.PIframes <= 0)
            {
                host.HurtPlayer(waveDmg, true);
                double ka = Atan2(host.PY - d.Y, host.PX - d.X); host.KnockPlayer(Cos(ka) * 10, Sin(ka) * 10);
                RmText(host.PX, host.PY - 20, "🌊충격파!", "#ff4400", 30);
            }
            // rage burst of red / rainbow beans
            int bCnt = 8 + bp * 4;
            for (int bi = 0; bi < bCnt; bi++)
            {
                double ba = Math.PI * 2 * bi / bCnt; bool rb1 = bi % 2 == 0;
                double vs = 3 + R();   // vx draws first, then vy (object literal order): two draws per bean
                double vs2 = 3 + R();
                SpawnBossProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(ba) * vs, Vy = Sin(ba) * vs2, Dmg = I(d.Atk * (rb1 ? 1.5 : 1.2)), El = e.Etype == 0 ? EL_P : EL_P, Life = 380, Ml = 380,
                    Col = rb1 ? "#cc1100" : "hsl", Sz = rb1 ? 1.8 : 1.5, RedBean = rb1, Homing = rb1 });
            }
            RmText(d.X, d.Y - 50, ph.Label, bp >= 3 ? "#ff0000" : bp >= 2 ? "#cc2200" : "#ff8800", 70);
            host.Shake(14 + bp * 4);
            host.Fx("phaseRoar", d.X, d.Y, d.R);
        }

        // ---- _bossIdleMove --------------------------------------------------------------------------------------------------------------------------------------
        void IdleMove(EnemyState e, DruidData d, double dist)
        {
            if (e.Stunned > 0) return;
            var ph = Ph(d.BossPhase);
            double spd = d.Speed * ph.SpdM;
            if (dist > 200)
            {
                double boost = Math.Min(2.5, 1 + dist / 300), dx, dy, mx, my;
                if (host.FlowDir(d.X, d.Y, out dx, out dy)) { mx = dx * spd * boost; my = dy * spd * boost; }
                else { double a = Atan2(host.PY - d.Y, host.PX - d.X); mx = Cos(a) * spd * boost; my = Sin(a) * spd * boost; }
                double nx = d.X + mx, ny = d.Y + my;
                if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                else { if (host.CanMove(d.X + mx, d.Y, d.R)) d.X += mx; else if (host.CanMove(d.X, d.Y + my, d.R)) d.Y += my; }
            }
            else if (dist > 50)
            {
                double orbitR = Math.Max(80, 150 - d.BossPhase * 18);
                d.BossOrbitAng += 0.015 * (d.StrafeDir != 0 ? d.StrafeDir : 1);
                if (d.BossStrafeCd > 0) d.BossStrafeCd -= 1;
                else if (R() < .005) { d.StrafeDir = (d.StrafeDir != 0 ? d.StrafeDir : 1) * -1; d.BossStrafeCd = 60; }
                double tx = host.PX + Cos(d.BossOrbitAng) * orbitR, ty = host.PY + Sin(d.BossOrbitAng) * orbitR;
                double ta = Atan2(ty - d.Y, tx - d.X), mx = Cos(ta) * spd * .7, my = Sin(ta) * spd * .7, nx = d.X + mx, ny = d.Y + my;
                if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                else { if (host.CanMove(d.X + mx, d.Y, d.R)) d.X += mx; else if (host.CanMove(d.X, d.Y + my, d.R)) d.Y += my; }
            }
            else
            {
                double away = Atan2(d.Y - host.PY, d.X - host.PX), sd = d.StrafeDir != 0 ? d.StrafeDir : 1, sideOff = sd * 0.4;
                double mx = Cos(away + sideOff) * spd, my = Sin(away + sideOff) * spd, nx = d.X + mx, ny = d.Y + my;
                if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                else
                {
                    double sx = Cos(away + Math.PI / 2 * sd) * spd, sy = Sin(away + Math.PI / 2 * sd) * spd;
                    if (host.CanMove(d.X + sx, d.Y + sy, d.R)) { d.X += sx; d.Y += sy; }
                    else if (host.CanMove(d.X + sx, d.Y, d.R)) d.X += sx;
                    else if (host.CanMove(d.X, d.Y + sy, d.R)) d.Y += sy;
                }
            }
            // idle red / black bean volley (not one of the 12 remodel moves)
            if (Remodel) return;
            d.IdleRBT += 1;
            double interval = Math.Max(18, 40 - d.BossPhase * 5);
            if (d.IdleRBT >= interval && dist < 1200)
            {
                d.IdleRBT = 0;
                int cnt = 1 + I(d.BossPhase * .5);
                double toP = Atan2(host.PY - d.Y, host.PX - d.X);
                for (int i = 0; i < cnt; i++)
                {
                    double a = toP + (R() - .5) * .5, spd2 = 2.5 + R() * 1.5, r0 = R();
                    bool bk = r0 < .5, rb = r0 >= .5;
                    double sp = bk ? 4.4 : spd2;
                    SpawnBossProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(a) * sp, Vy = Sin(a) * sp, Dmg = I(d.Atk * (bk ? 1.5 : rb ? 1.5 : 1)), El = EL_P, Life = bk ? 400 : 280, Ml = bk ? 400 : 280,
                        Col = bk ? "#00aa00" : rb ? "#cc1100" : "col", Sz = bk ? 2.0 : rb ? 1.5 : 1.2, RedBean = rb, BlackBean = bk, Homing = rb });
                }
            }
            // generic idle forward step that `case'idle'` adds after the boss idle move (speed*1.6)
        }

        // ---- _bossScore -----------------------------------------------------------------------------------------------------------------------------------------
        public sealed class PlayerStats { public double ParryRate, DashRate, HealRate, KiteRate, AggroRate; }
        public PlayerStats PStats = new PlayerStats();

        double Score(BossMove mv, double dist, int phase, DruidData d)
        {
            ScoreEvals++;
            if (mv.Id == "cageTrap" || (Remodel && Set.Forced.Contains(mv.Id))) return -1;   // heartbeat is forced by the AI (P3 entry + 40 s cooldown), never scored
            if (!mv.InPhase(phase)) return -1;
            if (d.MoveCDs[mv.Idx] > 0) return 0;
            double mid = (mv.RangeMin + mv.RangeMax) / 2, span = Math.Max(1, (mv.RangeMax - mv.RangeMin) / 2);
            double distFit = Math.Exp(-((dist - mid) / span) * ((dist - mid) / span));
            double repeatPen = 1;
            int lastN = d.LastMoves.Count;
            for (int i = 0; i < lastN; i++)
            {
                if (d.LastMoves[i] != mv.Id) continue;
                int age = (lastN - 1) - i;
                if (age <= 0) repeatPen *= .15; else if (age == 1) repeatPen *= .28; else if (age == 2) repeatPen *= .45; else repeatPen *= .70;
            }
            double counterAdj = 0; var ps = PStats;
            if (ps != null)
            {
                if (ps.ParryRate > .4 && mv.CanFeint) counterAdj += .5;
                if (ps.DashRate > .5 && mv.HasTag("aoe")) counterAdj += .3;
                if (ps.HealRate > .3 && mv.HasTag("gap-close")) counterAdj += .4;
                if (ps.KiteRate > .3 && mv.HasTag("gap-close")) counterAdj += .5;
                if (ps.KiteRate > .3 && mv.HasTag("cc")) counterAdj += .4;
                if (ps.AggroRate > .5 && mv.HasTag("punish")) counterAdj += .5;
                if (ps.AggroRate > .5 && mv.HasTag("aoe")) counterAdj += .3;
            }
            if (d.CombatSt == "retreat" && mv.HasTag("gap-close")) counterAdj += .6;
            if (d.CombatSt == "approach" && mv.HasTag("ranged")) counterAdj += .4;
            if (d.CombatSt == "engage" && (mv.HasTag("melee") || mv.HasTag("aoe"))) counterAdj += .3;
            if (dist < 130 && (mv.Id == "slashCombo" || mv.Id == "slam" || mv.Id == "sweep")) counterAdj += .8;
            if (dist < 80 && mv.Id == "slashCombo") counterAdj += .6;
            double comboBonus = 0;
            if (d.ComboSeq != null && d.ComboIdx < d.ComboSeq.Length && d.ComboSeq[d.ComboIdx] == mv.Id) comboBonus = 2.4;
            double phasePref = 0;
            if (phase >= 3 && mv.HasTag("aoe")) phasePref += .3;
            if (phase >= 3 && mv.HasTag("multi-hit")) phasePref += .2;
            if (phase <= 1 && mv.HasTag("utility")) phasePref += .2;
            double novelty = d.LastMoves.IndexOf(mv.Id) < 0 ? .35 : 0;
            double sc = (distFit * 1 + repeatPen * .6 + counterAdj * .7 + comboBonus * 1.2 + phasePref * .5 + novelty) * (.85 + R() * .3);
            if ((host.Stage == 0 || host.Stage == 3) && d.MeleeStreak >= 3 && (mv.HasTag("ranged") || mv.HasTag("ambush"))) sc *= 3.0;
            return sc;
        }

        BossMove FindMove(string id) { foreach (var m in MoveTable) if (m.Id == id) return m; return null; }
        bool InMoveSet(string id) { return Remodel ? FindMove(id) != null : Array.IndexOf(DruidBossData.MoveSet, id) >= 0; }

        // ---- _bossAI ---------------------------------------------------------------------------------------------------------------------------------------------
        public string LastPick;   // oracle trace
        void AI(EnemyState e, DruidData d, double dist)
        {
            var ph = Ph(d.BossPhase);
            for (int i = 0; i < d.MoveCDs.Length; i++) if (d.MoveCDs[i] > 0) d.MoveCDs[i] -= 1;
            if (e.Stunned > 0 || d.S != "idle") return;
            double engDist = 180 - d.BossPhase * 20;
            d.CombatSt = dist > engDist + 30 ? "approach" : dist < 50 ? "retreat" : "engage";
            d.BossPatT -= 1;
            if (Remodel && RmForcedPick(e, d, dist)) return;
            if (d.BossPatT > 0 || dist > 500 || dist < 20) return;
            // G._pStats.avgDist is a statistic nothing else reads in the ported slice
            if (d.ComboSeq != null && d.ComboIdx < d.ComboSeq.Length)
            {
                string nid = d.ComboSeq[d.ComboIdx];
                var nmv = FindMove(nid);
                if (nmv != null && nmv.InPhase(d.BossPhase) && InMoveSet(nid) && d.MoveCDs[nmv.Idx] <= 0)
                {
                    d.ComboIdx++;
                    d.MoveCDs[nmv.Idx] = CooldownOf(nmv, ph);
                    d.BossPatT = Remodel ? Set.ComboLinkTicks : I(6 + R() * 6);
                    d.LastMoves.Add(nmv.Id); if (d.LastMoves.Count > 5) d.LastMoves.RemoveAt(0);
                    d.MeleeStreak = nmv.HasTag("ranged") ? 0 : d.MeleeStreak + 1;
                    d.Feinting = nmv.CanFeint && !(Remodel && d.FeintUsed) && R() < ph.FeintC; if (d.Feinting) d.FeintUsed = true;
                    int ed = 0; if (nmv.CanDelay > 0 && R() < ph.DelayC) ed = I(nmv.Tele * nmv.CanDelay);
                    LastPick = nmv.Id; StartPattern(e, d, nmv, dist, d.BossPhase, ed); return;
                }
                else { d.ComboSeq = null; d.ComboIdx = 0; }
            }
            BossMove bestMv = null; double bestS = -1;
            var moves = MoveTable; var scores = new double[moves.Length];
            for (int i = 0; i < moves.Length; i++)
            {
                double s = Score(moves[i], dist, d.BossPhase, d);
                scores[i] = s; if (s > bestS) { bestS = s; bestMv = moves[i]; }
            }
            if (bestMv == null || bestS <= 0) { d.BossPatT = 10 + R() * 10; return; }
            var cand = new List<KeyValuePair<BossMove, double>>();
            for (int i = 0; i < moves.Length; i++) if (scores[i] > 0) cand.Add(new KeyValuePair<BossMove, double>(moves[i], scores[i]));
            if (cand.Count > 1)
            {
                // Array.prototype.sort is stable in V8 (>=7.0): equal scores keep the original order
                var sorted = new List<KeyValuePair<BossMove, double>>(cand); StableSortDesc(sorted);
                int topN = Math.Min(6, sorted.Count); double totalW = 0; var w = new double[topN];
                for (int i = 0; i < topN; i++) { w[i] = Math.Max(.001, sorted[i].Value); totalW += w[i]; }
                double r = R() * totalW;
                for (int i = 0; i < topN; i++) { r -= w[i]; if (r <= 0) { bestMv = sorted[i].Key; bestS = sorted[i].Value; break; } }
            }
            d.LastMoves.Add(bestMv.Id); if (d.LastMoves.Count > 5) d.LastMoves.RemoveAt(0);
            d.MeleeStreak = bestMv.HasTag("ranged") ? 0 : d.MeleeStreak + 1;
            d.MoveCDs[bestMv.Idx] = CooldownOf(bestMv, ph);
            d.BossPatT = Remodel ? Set.GapTicks[Math.Min(Math.Max(d.BossPhase, 0), 2)] : (d.BossPatCd + R() * 15) * ph.CdM;
            if (R() < ph.ComboC)
            {
                var mc = new List<BossCombo>();
                foreach (var c in ComboTable) if (c.Seq[0] == bestMv.Id && c.InPhase(d.BossPhase)) mc.Add(c);
                if (mc.Count > 0) { var c = mc[I(R() * mc.Count)]; d.ComboSeq = c.Seq; d.ComboIdx = 1; }
            }
            d.FeintUsed = false;   // a fresh pick starts a new combo window: one feint per combo (remodel)
            d.Feinting = bestMv.CanFeint && R() < ph.FeintC; if (d.Feinting) d.FeintUsed = true;
            int extraDelay = 0;
            if (bestMv.CanDelay > 0 && R() < ph.DelayC) extraDelay = I(bestMv.Tele * bestMv.CanDelay);
            LastPick = bestMv.Id;
            StartPattern(e, d, bestMv, dist, d.BossPhase, extraDelay);
        }

        static void StableSortDesc(List<KeyValuePair<BossMove, double>> l)
        {
            for (int i = 1; i < l.Count; i++)
            {
                var x = l[i]; int j = i - 1;
                while (j >= 0 && l[j].Value < x.Value) { l[j + 1] = l[j]; j--; }
                l[j + 1] = x;
            }
        }
    }
}
