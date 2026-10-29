using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // BX-03: _bossStartPattern (start side of the 23 moves) and the `switch(e.s)` states of updateE they use (game.html 40703-41517). Damage numbers are raw ATK
    // multipliers exactly as in the original; the host applies defence, shield, hit cap, knock-back and parry (B09 / B07 Core).
    public sealed partial class DruidBoss
    {
        // _PARRYABLE_ATK (red = parryable, purple = not): only the part inside the druid moveset
        static readonly HashSet<string> Parryable = new HashSet<string> { "charge", "slashCombo", "slam", "sweep", "spin", "multiDash", "jump", "tideWave" };
        static double Or(double v, double fb) { return v != 0 && !double.IsNaN(v) ? v : fb; }   // `tele||fb`

        void StartPattern(EnemyState e, DruidData d, BossMove mv, double dist, int phase, int extraDelay)
        {
            d.AtkParryable = (Remodel ? Set.Parryable : Parryable).Contains(mv.Id);
            int tele = I(mv.Tele * Ph(phase).TeleM) + extraDelay;
            if (!d.RmFire) { RmTell(mv, d, dist); d.PrevMove = d.CurMove; d.CurMove = mv.Id; }   // RM-1 sound: one telegraph = one tell sound, on the frame the telegraph starts
            double px = host.PX, py = host.PY;
            if (Remodel)
            {
                if (MoveLog != null) MoveLog.Add(new MoveLogEntry { Tick = Clock != null ? Clock() : Tick, Phase = phase, Move = mv.Id });
                if (!d.RmFire)
                {   // telegraph list (DruidTelegraph.cs): one serial per move start; the tide-wave gap is drawn now so the ring can show it from the first telegraph frame (same one draw, earlier)
                    TeleSerial++; d.RmMoveId = mv.Id; d.RmParryPending = false; d.RmBonusApplied = false;
                    if (mv.Id == "groundFissure") d.RmDir = Atan2(py - d.Y, px - d.X);   // spec #4: the line is aimed once, at the first telegraph tick
                    if (mv.Id == "tideWave") d.RmGap = R() * Math.PI * 2;
                }
                if (!d.RmFire && Set.Instant.Contains(mv.Id))
                {   // the web fires these the moment they are picked; the remodel shows the telegraph first (spec §4: it never gets shorter)
                    d.S = "bossRmWind"; d.St2 = Or(tele, 25); d.RmTeleTotal = d.St2; d.RmPending = mv; RmText(d.X, d.Y - 30, "⚠", "#a9cc63", 40); return;
                }
            }
            if (!RmStartHook(e, d, mv, dist, phase, tele)) switch (mv.Id)   // RM-B0: the boss's own file may take the move first (BossRemodelHooks.StartMove)
            {
                case "burst": d.S = "bossBurstWind"; d.St2 = Or(tele, 55); RmText(d.X, d.Y - 30, "⚠ 광역 발사!", "#ff6600", 50); break;
                case "fan": d.S = "bossFanWind"; d.St2 = Or(tele, 30); RmText(d.X, d.Y - 30, "🔥 확산!", "#ff4444", 35); break;
                case "charge": d.S = "bossChargeWind"; d.St2 = Or(tele, 55); RmText(d.X, d.Y - 30, "⚠ 돌진!", "#ffaa00", 50); break;
                case "jump":
                    {
                        double jx = px, jy = py, sx, sy;
                        if (!host.CanMove(jx, jy, d.R)) { if (host.SafePoint(jx, jy, d.R, out sx, out sy)) { jx = sx; jy = sy; } else { jx = d.X; jy = d.Y; } }
                        d.JumpX = jx; d.JumpY = jy; d.JumpOx = d.X; d.JumpOy = d.Y;
                        d.S = "bossJumpWind"; d.St2 = Or(tele, 34); d.TelegraphT = Or(tele, 34); d.TelegraphR = d.R + 30; RmText(d.X, d.Y - 30, "🦅 도약 준비!", "#cc66ff", 40); break;
                    }
                case "shock": d.S = "bossShockWind"; d.St2 = Or(tele, 45); RmText(d.X, d.Y - 30, "🌊 충격파!", "#44aaff", 40); break;
                case "summon": d.S = "bossSummonWind"; d.St2 = Or(tele, 55); RmText(d.X, d.Y - 30, "👹 소환!", "#aa00ff", 50); break;
                case "grab":
                    if (dist < 120) { d.S = "bossGrabWind"; d.St2 = Or(tele, 40); d.GrabWindMax = d.St2; d.GrabAng = d.Facing; RmText(d.X, d.Y - 30, "🖐 잡기!", "#cc00ff", 45); }
                    else { d.S = "bossChargeWind"; d.St2 = Or(I(55 * Ph(phase).TeleM) + extraDelay, 55); RmText(d.X, d.Y - 30, "⚠ 돌진!", "#ffaa00", 50); }
                    break;
                case "spin": d.S = "bossSpinWind"; d.St2 = Or(tele, 35); d.SpinAng = 0; RmText(d.X, d.Y - 30, "🌀 회전참!", "#ff6644", 45); break;
                case "mine": d.S = "bossMineWind"; d.St2 = Or(tele, 30); RmText(d.X, d.Y - 30, "💣 지뢰!", "#5e10a8", 40); break;
                case "multiDash": d.S = "bossMultiDashWind"; d.St2 = Or(tele, 20); d.DashCnt = 4 + I(phase * 1.5); d.DashIdx = 0; RmText(d.X, d.Y - 30, "⚡ 연격!", "#ff4488", 45); break;
                case "slashCombo": d.S = "bossSlashWind"; d.St2 = Or(tele, 20); d.SlashCnt = Remodel ? 3 : 3 + I(phase * 1.5); d.SlashIdx = 0; d.WeaponAng = 0; RmText(d.X, d.Y - 30, "⚔ 난타!", "#ff8844", 45); break;
                case "slam": d.S = "bossSlamWind"; d.St2 = Or(tele, 35); d.WeaponAng = -1.2; RmText(d.X, d.Y - 30, "💥 강타!", "#ff4400", 50); break;
                case "sweep": d.S = "bossSweepWind"; d.St2 = Or(tele, 25); d.WeaponAng = -.8; d.SweepDir = R() > .5 ? 1 : -1; RmText(d.X, d.Y - 30, "🌀 휘두르기!", "#ffaa00", 40); break;
                case "heartbeat": d.S = "bossHeartWind"; d.St2 = Or(tele, DruidRemodelData.HeartbeatBeatWind); d.HbBeat = 0; RmText(d.X, d.Y - 30, "♥", "#aa2222", 50); host.Fx("druidHeartbeatWind", d.X, d.Y, d.R); break;
                case "burrowStrike":
                    d.TeleOx = d.X; d.TeleOy = d.Y; if (!Remodel) d.Facing = Atan2(py - d.Y, px - d.X);
                    d.S = "bossDruidDive"; d.St2 = Or(tele, 50); d.DiveMax = Or(tele, 50); RmText(d.X, d.Y - 30, "🌿⚠", "#66dd22", 60); break;
                case "beanStorm": d.S = "bossBeanStormWind"; d.St2 = Or(tele, 25); d.BsWave = 0; d.BsMaxWave = 3 + I(phase); RmText(d.X, d.Y - 30, "🔴 빨간콩 폭풍!", "#cc1100", 50); break;
                case "chaseAoe":
                    if (Remodel)
                    {   // spec #8: chase zones with a 20 f warning each + the poison trail the boss leaves on his way (no charge)
                        ChaseAoes.Add(new ChaseAoe { Cnt = 0, MaxCnt = Set.ChaseZoneCount, T = 0, Interval = 60, R = Set.ChaseZoneRadius, Delay = Set.ChaseZoneWarn, Dmg = I(d.Atk * 2), Druid = e.IsBoss && DruidStage, Serial = TeleSerial });
                        RmText(d.X, d.Y - 30, "🌿 추적 장판!", "#a9cc63", 55);
                        d.PtAng = d.Facing; d.PtT = 0; d.S = "bossPoisonDash"; d.St2 = DruidRemodelData.PoisonDashTicks; break;   // the dash goes where the telegraph aim was frozen (12 f before), no re-aim
                    }
                    ChaseAoes.Add(new ChaseAoe { Cnt = 0, MaxCnt = 10, T = 0, Interval = 60, R = 450, Delay = 90, Dmg = I(d.Atk * 2), Druid = e.IsBoss && DruidStage });
                    RmText(d.X, d.Y - 30, "🌿 추적 장판!", "#a9cc63", 55);
                    d.S = "bossChargeWind"; d.St2 = Or(I(40 * Ph(phase).TeleM) + extraDelay, 40);
                    d.Facing = Atan2(py - d.Y, px - d.X); RmText(d.X, d.Y - 45, "⚠ 돌진!", "#ffaa00", 40); break;
                case "elemBall":
                    {
                        d.Facing = Atan2(py - d.Y, px - d.X);
                        double spd = 6, rr = 16; int dmg = I(d.Atk * 3); int cnt = 10 + I(d.BossPhase * 1.5); double fanW = Math.PI * .55;
                        for (int bi = 0; bi < cnt; bi++)
                        {
                            double ba = d.Facing - fanW / 2 + fanW * bi / (cnt - 1);
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X + Cos(ba) * 30, Y = d.Y + Sin(ba) * 30, Vx = Cos(ba) * spd, Vy = Sin(ba) * spd, Dmg = dmg, El = EL_P, Life = 400, Ml = 400, Col = "el", Sz = rr, ElemBall = true,
                                Homing = false, ParryClass = "magic", DruidStraight = true, R = rr });
                        }
                        RmText(d.X, d.Y - 30, "💥 속성탄!", "#ff8844", 45); host.Shake(8);
                        Recover(d, 30); break;
                    }
                case "groundFissure":
                    {
                        host.Sound("druid_fissure", "#4 groundFissure: the crack runs", d.X, d.Y);
                        if (!Remodel) d.Facing = Atan2(py - d.Y, px - d.X);
                        int gfPh = d.BossPhase; int n = Remodel ? 1 : gfPh >= 3 ? 3 : gfPh >= 1 ? 2 : 1;   // remodel: one straight line
                        for (int fi = 0; fi < n; fi++)
                        {
                            double off = (fi - (n - 1) / 2.0) * .3, ang = (Remodel ? d.RmDir : d.Facing) + off; int maxLen = FissureMaxLen(); if (Remodel) maxLen = (int)Math.Floor(RmFissureReach(d.X, d.Y, ang, Math.Min(maxLen, DruidRemodelData.FissureSpeed * 140)));
                            Fissures.Add(new Fissure { X = d.X, Y = d.Y, Ang = ang, Spd = Remodel ? DruidRemodelData.FissureSpeed : 20, Len = 0, MaxLen = maxLen, T = 0, MaxT = 140, W = 140, Dmg = I(d.Atk * 2), Exploded = false, ExplR = Math.Min(750, maxLen * .3), Druid = e.IsBoss && DruidStage, Serial = TeleSerial, Straight = Remodel });
                        }
                        host.Shake(10); RmText(d.X, d.Y - 30, "🌋 균열!", "#a9cc63", 50); Recover(d, 30); break;
                    }
                case "tideWave":
                    {
                        int n = Remodel ? 1 : 2 + Math.Min(d.BossPhase, 2);   // remodel: one ring, one gap (spec #10)
                        for (int ti = 0; ti < n; ti++)
                        {
                            double gap = Remodel ? d.RmGap : R() * Math.PI * 2;   // remodel: drawn when the move started (one ring, ti == 0)
                            TideWaves.Add(new TideWave { X = d.X, Y = d.Y, Rad = 20 + ti * 8, MaxR = 1750, Spd = Remodel ? 15 * DruidRemodelData.TideSpeedMul : 15, T = 0, MaxT = 120, GapAng = gap, GapSize = .8, W = 60, Dmg = I(d.Atk * 1.5), HitT = 0, Druid = e.IsBoss && DruidStage, Serial = TeleSerial });
                        }
                        RmText(d.X, d.Y - 30, "🌊 파동!", "#a9cc63", 50); host.Sound("druid_tide", "#10 tideWave ring rises", d.X, d.Y); AttackVoice(d, "tideWave"); Recover(d, 35); break;
                    }
                case "seekerMines":
                    {
                        host.Sound("druid_pod", "#11 seekerMines: spore pods burst", d.X, d.Y);
                        int n = Remodel ? 3 : 3 + Math.Min(d.BossPhase, 2);   // remodel: three mines (spec #11)
                        for (int mi = 0; mi < n; mi++)
                        {
                            double ma = d.Facing + Math.PI * 2 * mi / n;
                            SeekerMines.Add(new SeekerMine { DruidMine = e.IsBoss && DruidStage, X = d.X + Cos(ma) * 20, Y = d.Y + Sin(ma) * 20, Vx = Cos(ma) * (Remodel ? DruidRemodelData.MineSpeedMul : 1), Vy = Sin(ma) * (Remodel ? DruidRemodelData.MineSpeedMul : 1), Spd = Remodel ? DruidRemodelData.MineSpeedMul : 1, SpeedCap = Remodel ? 1.5 * DruidRemodelData.MineSpeedMul : 1.5, T = 0, ArmT = 60, MaxT = 360, R = 60, Dmg = I(d.Atk * 2), El = EL_D, Hp = 1 });
                        }
                        RmText(d.X, d.Y - 30, "💣 추적지뢰!", "#5e10a8", 50); Recover(d, 25); break;
                    }
                case "poisonTrail":
                    d.PtAng = Atan2(py - d.Y, px - d.X); d.PtT = 0; d.S = "bossPoisonDash"; d.St2 = 50; RmText(d.X, d.Y - 30, "☠ 독안개!", "#44cc00", 55); break;
                case "lavaPools":
                    {
                        // druid branch: three poison pools on the player's approach axis (centre +120, flanks +-360)
                        double a = Atan2(py - d.Y, px - d.X), ux = Cos(a), uy = Sin(a);
                        double cx = px + ux * 120, cy = py + uy * 120, nx = -uy, ny = ux;
                        double[] xs = { cx, cx + nx * 360, cx - nx * 360 }, ys = { cy, cy + ny * 360, cy - ny * 360 };
                        for (int l = 0; l < 3; l++) LavaPools.Add(new LavaPool { X = xs[l], Y = ys[l], T = 0, WarnT = 55 + l * 18, MaxT = 300, R = 150, Dmg = I(d.Atk * .9), TickT = 0 });
                        RmText(d.X, d.Y - 30, "☠ 독 늪!", "#66dd22", 60); Recover(d, 25); break;
                    }
                case "rapidMissile":
                    {
                        d.Facing = Atan2(py - d.Y, px - d.X);
                        int n = 3 + Math.Min(d.BossPhase, 3);
                        for (int mi = 0; mi < n; mi++)
                        {
                            double off = (mi - (n - 1) / 2.0) * .15, ang = d.Facing + off, spd = 14 + d.BossPhase * 2;
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X + Cos(ang) * d.R, Y = d.Y + Sin(ang) * d.R, Vx = Cos(ang) * spd, Vy = Sin(ang) * spd, Dmg = I(d.Atk * 2), El = EL_P, Life = 300, Ml = 300, Col = "#ff4444", Sz = 3, Homing = true, MissileTrail = true });
                        }
                        host.Shake(8); RmText(d.X, d.Y - 30, "🚀 미사일!", "#ff2200", 55); Recover(d, 30); break;
                    }
            }
            if (Remodel && !d.RmFire) d.RmTeleTotal = d.St2;   // telegraph length of the wind state just entered (DruidTelegraph.cs)
        }

        // ---- the updateE `switch(e.s)` ------------------------------------------------------------------------------------------------------------------------
        void PlayerHit(EnemyState e, DruidData d, double mul, double kb, bool magic = false)
        {
            host.HurtPlayer(I(d.Atk * mul), magic);
            if (kb != 0) { double ka = Atan2(host.PY - d.Y, host.PX - d.X); host.KnockPlayer(Cos(ka) * kb, Sin(ka) * kb); }
        }
        bool Parry(EnemyState e, DruidData d, double mul, double stun, double poise, double angle)
        {
            bool ok = host.TryParry(e, mul, stun, poise, angle);
            if (ok && Remodel) OnBossParried(d);
            return ok;
        }
        bool Idle() { return host.PIframes <= 0; }

        void StateSwitch(EnemyState e, DruidData d, double dist)
        {
            double px = host.PX, py = host.PY, pr = host.PRadius;
            int stage = host.Stage;
            if (!RmTickHook(e, d, dist)) switch (d.S)   // RM-B0: the boss's own file may take the state first (BossRemodelHooks.TickState)
            {
                case "idle":
                    {
                        // `case'idle'` else-branch of a melee etype: forward step speed*1.6 along the facing
                        if (!Remodel)   // remodel: no forward step (RB1-6, the walk is RmWalk)
                        {
                            double a1 = d.Speed * 1.6, mx = Cos(d.Facing) * a1, my = Sin(d.Facing) * a1, nx = d.X + mx, ny = d.Y + my;
                            if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                        }
                        // etype0 contact attack
                        if (dist < d.R + pr + 8 && host.PIframes <= 0 && d.St2 <= 0)
                        {
                            host.HurtPlayer(I(d.Atk * 0.8), false);
                            d.St2 = 40 + I(R() * 20);
                        }
                        // generic ranged charge (projCd 50)
                        if (!Remodel && d.ProjCd < 9000 && !(d.ProjChargeT > 0))
                        {
                            d.ProjT -= 1;
                            if (d.ProjT <= 0 && dist < 400) { d.ProjT = d.ProjCd; d.ProjChargeBean = "normal"; d.ProjChargeT = 60; }
                        }
                        break;
                    }
                case "bossRmWind":
                    d.Facing = Face(d, d.RmPending != null && d.RmPending.Id == "groundFissure" ? d.RmDir : Atan2(py - d.Y, px - d.X));   // the fissure line is aimed at the first telegraph tick: the body turns to it, never snaps
                    if (d.St2 <= 0) { var pend = d.RmPending; d.RmPending = null; d.RmFire = true; StartPattern(e, d, pend, dist, d.BossPhase, 0); d.RmFire = false; }
                    break;
                case "bossHeartWind":
                    if (d.St2 <= 0) HeartbeatPulse(e, d);
                    break;
                case "bossHeartPause":   // RB1-6 #12: 30 f standing still between beats
                    if (d.St2 <= 0) { d.S = "bossHeartWind"; d.St2 = DruidRemodelData.HeartbeatBeatWind; }
                    break;
                case "bossBurstWind":
                    if (d.St2 <= 0)
                    {
                        int cnt = I(Math.Max(10, 6 + Math.Min(stage, 6)) * (1 + (d.BossPhase - 1) * .12));
                        for (int i = 0; i < cnt; i++)
                        {
                            double a = Math.PI * 2 * i / cnt, r2 = R(); bool bk = r2 < .5, rb = r2 >= .5; double sp = bk ? 4.4 : rb ? 4.0 : 3.2;
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(a) * sp, Vy = Sin(a) * sp, Dmg = I(d.Atk * (bk ? 1.5 : rb ? 2.5 : 1.2)), El = EL_P, Life = 400, Ml = 400,
                                Col = bk ? "#00aa00" : rb ? "#cc1100" : "col", Sz = bk ? 2.0 : rb ? 1.8 : 1.2, RedBean = rb, BlackBean = bk, Homing = rb });
                        }
                        host.Shake(8); Recover(d, 50);
                    }
                    break;
                case "bossFanWind":
                    if (d.St2 <= 0)
                    {
                        double fanW = Math.PI * (.7 + d.BossPhase * .06); int cnt = I(Math.Max(12, 4 + Math.Min(stage, 5)) * (1 + (d.BossPhase - 1) * .12)); double aim = d.Facing; int fanFirst = Projectiles.Count;
                        for (int i = 0; i < cnt; i++)
                        {
                            double a = aim - fanW / 2 + fanW * i / (cnt - 1), lane = (double)i / (cnt - 1);
                            bool physical = lane < .28 || lane > .72, black = d.BossPhase >= 2 && i % 4 == 1;
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(a) * 4.4, Vy = Sin(a) * 4.4, Dmg = I(d.Atk * (black ? 1.5 : 1.3)), El = physical && !black ? EL_P : EL_P, Life = 400, Ml = 400,
                                Col = black ? "#00aa00" : physical ? "#8a5a2a" : "col", Sz = black ? 2 : 1.2, BlackBean = black, ParryClass = physical && !black ? "physical" : "magic", Homing = false, DruidStraight = true });
                        }
                        if (Remodel) for (int fj = fanFirst; fj < Projectiles.Count; fj++) { Projectiles[fj].Vx *= DruidRemodelData.FanBulletMul; Projectiles[fj].Vy *= DruidRemodelData.FanBulletMul; }   // spec #5: bullet speed x0.75
                        Recover(d, 45);
                    }
                    break;
                case "bossChargeWind":
                    if (!DruidStage || d.St2 > (Remodel ? Set.AimFixTicks : 18)) d.Facing = Face(d, Atan2(py - d.Y, px - d.X));
                    if (d.St2 <= 0) { AttackVoice(d, "charge"); host.Sound("druid_drag", "#3 charge: roots drag over the ground", d.X, d.Y); d.S = "bossCharge"; d.St2 = Remodel ? DruidRemodelData.ChargeTicks : 50; d.EchDx = Cos(d.Facing); d.EchDy = Sin(d.Facing); }
                    break;
                case "bossCharge":
                    {
                        double spd = Remodel ? DruidRemodelData.ChargeSpeed : 35, nx = d.X + d.EchDx * spd, ny = d.Y + d.EchDy * spd;
                        if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                        else if (host.CanMove(d.X + d.EchDx * spd, d.Y, d.R)) { d.X += d.EchDx * spd; }
                        else if (host.CanMove(d.X, d.Y + d.EchDy * spd, d.R)) { d.Y += d.EchDy * spd; }
                        else { d.ShockR = 0; d.ShockMax = 800; d.S = "bossShock"; d.St2 = 20; host.Shake(25); host.Fx("wallSlam", d.X, d.Y, 150); break; }
                        if (Dst(px, py, d.X, d.Y) < pr + d.R + 80 && host.PIframes <= 0)
                        {
                            if (Parry(e, d, 5, 90, 20, d.Facing + Math.PI))
                            {
                                e.KnockbackX = (float)(Cos(d.Facing + Math.PI) * 18); e.KnockbackY = (float)(Sin(d.Facing + Math.PI) * 18);
                            }
                            else PlayerHit(e, d, 2, 12);
                            Recover(d, 40); break;
                        }
                        if (d.St2 <= 0) { Recover(d, 40); }
                        break;
                    }
                case "bossJumpWind":
                    if (d.St2 <= 0) { d.S = "bossJump"; d.St2 = 40; RmText(d.X, d.Y - 30, "🦅 도약!", "#cc66ff", 30); }
                    break;
                case "bossJump":
                    {
                        double prog = 1 - d.St2 / 40, jx, jy;
                        if (prog < .5) { double t = prog * 2; jx = d.JumpOx + (d.JumpX - d.JumpOx) * t * .3; jy = d.JumpOy + (d.JumpY - d.JumpOy) * t * .3; }
                        else { double t = (prog - .5) * 2; jx = d.JumpOx + (d.JumpX - d.JumpOx) * (.3 + t * .7); jy = d.JumpOy + (d.JumpY - d.JumpOy) * (.3 + t * .7); }
                        if (host.CanMove(jx, jy, d.R)) { d.X = jx; d.Y = jy; }
                        if (d.St2 <= 0)
                        {
                            d.ShockR = 0; d.ShockMax = 800 + stage * 50; d.S = "bossShock"; d.St2 = 25; host.Shake(25);
                            if (Dst(px, py, d.X, d.Y) < 300 && host.PIframes <= 0) PlayerHit(e, d, 1.8, 15);
                        }
                        break;
                    }
                case "bossShockWind":
                    if (d.St2 <= 0) { d.ShockR = 0; d.ShockMax = 1000 + stage * 50; d.S = "bossShock"; d.St2 = 30; host.Shake(10); }
                    break;
                case "bossShock":
                    {
                        d.ShockR += 4.5;
                        if (Math.Abs(Dst(px, py, d.X, d.Y) - d.ShockR) < 18 && host.PIframes <= 0) PlayerHit(e, d, 1.4, 8);
                        if (d.ShockR >= d.ShockMax || d.St2 <= 0) { Recover(d, 55); }
                        break;
                    }
                case "bossSummonWind":
                    if (d.St2 <= 0)
                    {
                        host.Sound("druid_summon", "#9 summon: the corpses stir", d.X, d.Y);
                        int cnt = 3 + I(stage * .5);
                        if (Remodel) { cnt = 2 + I(R() * 2); cnt = Math.Min(cnt, Set.SummonMax - AliveMinions(d)); }   // spec #9: 2-3 mobs, at most 3 alive at once
                        int[] etypes = { 0, 2, 3, 3, 3 };
                        for (int si = 0; si < cnt; si++)
                        {
                            double a = Math.PI * 2 * si / cnt, sd = 50 + R() * 30, sx = d.X + Cos(a) * sd, sy = d.Y + Sin(a) * sd;
                            int el = I(R() * 6); int et = etypes[I(R() * 5)];
                            var mn = host.SpawnMinion(sx, sy, el, et); if (Remodel && mn != null) d.Minions.Add(mn);
                        }
                        RmText(d.X, d.Y - 20, cnt + "체 소환!", "#cc66ff", 40); Recover(d, 70);
                    }
                    break;
                case "bossGrabWind":
                    {
                        double ga = Atan2(py - d.Y, px - d.X);
                        if (Remodel) { ga = Face(d, ga); d.Facing = ga; }
                        d.GrabAng = ga;
                        if (!RmGrab)   // druid remodel: the boss stands still, the lunge is the next state; other sets keep the web approach
                        {
                            double gs = d.Speed * 1.5, gmx = Cos(ga) * gs, gmy = Sin(ga) * gs, gnx = d.X + gmx, gny = d.Y + gmy;
                            if (host.CanMove(gnx, gny, d.R)) { d.X = gnx; d.Y = gny; }
                            else { if (host.CanMove(d.X + gmx, d.Y, d.R)) d.X += gmx; else if (host.CanMove(d.X, d.Y + gmy, d.R)) d.Y += gmy; }
                        }
                        if (d.St2 <= 0 && RmGrab) { d.S = "bossGrabLunge"; d.St2 = DruidRemodelData.GrabLungeTicks; }
                        else if (d.St2 <= 0)
                        {
                            if (Dst(px, py, d.X, d.Y) < d.R + pr + 200 && host.PIframes <= 0) { d.S = "bossGrab"; d.St2 = RmGrab ? DruidRemodelData.GrabTicks : 60; if (RmGrab) GrabStart(e, d); RmText(px, py - 25, "⚠ 잡혔다!", "#cc00ff", 50); host.Shake(10); }
                            else { Recover(d, 40); }
                        }
                        break;
                    }
                case "bossGrabLunge":
                    {   // RB1-6 #6: 18 f lunge along the fixed grab direction at 9 px/tick; touching the player starts the hold, a miss costs 80 f
                        double lmx = Cos(d.GrabAng) * DruidRemodelData.GrabLungeSpeed, lmy = Sin(d.GrabAng) * DruidRemodelData.GrabLungeSpeed;
                        if (host.CanMove(d.X + lmx, d.Y + lmy, d.R)) { d.X += lmx; d.Y += lmy; }
                        if (Dst(px, py, d.X, d.Y) < d.R + pr + DruidRemodelData.GrabContact && host.PIframes <= 0)
                        { d.S = "bossGrab"; d.St2 = DruidRemodelData.GrabTicks; GrabStart(e, d); RmText(px, py - 25, "⚠ 잡혔다!", "#cc00ff", 50); host.Shake(10); break; }
                        if (d.St2 <= 0) Recover(d, 40);
                        break;
                    }
                case "bossGrab":
                    {
                        if (RmGrab && GrabEscaped(e, d)) break;   // spec #6: mashing breaks the hold (the absorption stops with it)
                        host.PX = d.X + Cos(d.GrabAng) * 25; host.PY = d.Y + Sin(d.GrabAng) * 25; host.StopPlayerKnock();
                        if (d.St2 % 10 == 0 && host.PIframes <= 0) host.HurtPlayer(I(d.Atk * .4), false);
                        if (RmGrab && d.St2 % 10 == 0) GrabAbsorb(e, d);
                        if (d.St2 <= 0)
                        {
                            host.HurtPlayer(I(d.Atk * 1.8), false);
                            double ta = d.GrabAng; host.StopPlayerKnock(); host.KnockPlayer(Cos(ta) * 18, Sin(ta) * 18);
                            host.PIframes = 30; RmText(host.PX, host.PY - 30, "💥 내던지기!", "#ff4400", 50); host.Shake(15);
                            Recover(d, 70);
                        }
                        break;
                    }
                case "bossSpinWind":
                    if (d.St2 <= 0) { d.S = "bossSpin"; d.St2 = 50; d.SpinAng = 0; }
                    break;
                case "bossSpin":
                    {
                        d.SpinAng += .35; double spR = 500 + stage * 15;
                        if (d.St2 % 8 < 1)
                        {
                            double sa = d.SpinAng;
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X + Cos(sa) * 20, Y = d.Y + Sin(sa) * 20, Vx = Cos(sa) * 4, Vy = Sin(sa) * 4, Dmg = I(d.Atk * .8), El = EL_P, Life = 250, Ml = 250, Col = "col", Sz = 2 });
                        }
                        if (Dst(px, py, d.X, d.Y) < spR && host.PIframes <= 0 && d.St2 % 12 < 1)
                        {
                            if (!Parry(e, d, 0, 0, 20, 0)) PlayerHit(e, d, 1.2, 6);
                        }
                        if (d.St2 <= 0) { Recover(d, 55); host.Shake(6); }
                        break;
                    }
                case "bossMineWind":
                    if (d.St2 <= 0)
                    {
                        int mc = 3 + I(d.BossPhase) + I(stage * .3);
                        for (int mi = 0; mi < mc; mi++)
                        {
                            double ma = Math.PI * 2 * mi / mc, md = 60 + R() * 80, mx = d.X + Cos(ma) * md, my = d.Y + Sin(ma) * md;
                            SpawnBossProjectile(e, d, new ProjSpec { X = mx, Y = my, Vx = 0, Vy = 0, Dmg = I(d.Atk * 1.6), El = EL_D, Life = 180, Ml = 180, Col = "#ff2000", Sz = 5, Mine = true });
                        }
                        RmText(d.X, d.Y - 20, mc + "개 설치!", "#5e10a8", 35); Recover(d, 50);
                    }
                    break;
                case "bossMultiDashWind":
                    d.Facing = Atan2(py - d.Y, px - d.X);
                    if (d.St2 <= 0) { d.EchDx = Cos(d.Facing); d.EchDy = Sin(d.Facing); d.S = "bossMultiDash"; d.St2 = 12; }
                    break;
                case "bossMultiDash":
                    {
                        double spd = 9, nx = d.X + d.EchDx * spd, ny = d.Y + d.EchDy * spd;
                        if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
                        else if (host.CanMove(d.X + d.EchDx * spd, d.Y, d.R)) { d.X += d.EchDx * spd; }
                        else if (host.CanMove(d.X, d.Y + d.EchDy * spd, d.R)) { d.Y += d.EchDy * spd; }
                        if (Dst(px, py, d.X, d.Y) < pr + d.R + 10 && host.PIframes <= 0)
                        {
                            if (!Parry(e, d, 4, 90, 0, d.Facing + Math.PI)) PlayerHit(e, d, 1.3, 8);
                        }
                        if (d.St2 <= 0)
                        {
                            d.DashIdx++;
                            if (d.DashIdx < d.DashCnt)
                            {
                                d.Facing = Atan2(py - d.Y, px - d.X) + ((R() - .5) * .4); d.EchDx = Cos(d.Facing); d.EchDy = Sin(d.Facing);
                                d.St2 = 10 + I(R() * 5); host.Shake(4);
                            }
                            else { Recover(d, 25); host.Shake(8); }
                        }
                        break;
                    }
                case "bossDruidDive":
                    d.Facing = Face(d, Atan2(py - d.Y, px - d.X));
                    if (d.St2 <= 0) { d.DiveTx = px; d.DiveTy = py; d.S = "bossDruidUnder"; d.St2 = 45; d.UnderMax = 45; d.Iframes = Math.Max(d.Iframes, 50); host.Fx("druidDust", d.X, d.Y, d.R); }
                    break;
                case "bossDruidUnder":
                    {
                        if (Remodel)
                        {   // RB1-6 #7: the marker that follows the player underground crawls at most 1.4 px per tick
                            double mdx = px - d.DiveTx, mdy = py - d.DiveTy, md = Math.Sqrt(mdx * mdx + mdy * mdy), ms = Math.Min(md * .06, DruidRemodelData.BurrowTrackSpeed);
                            if (md > 1e-9) { d.DiveTx += mdx / md * ms; d.DiveTy += mdy / md * ms; }
                        }
                        else { d.DiveTx += (px - d.DiveTx) * .06; d.DiveTy += (py - d.DiveTy) * .06; }
                        double up = 1 - d.St2 / (Or(d.UnderMax, 45)), bux, buy;
                        BurrowTarget(d, d.DiveTx, d.DiveTy, out bux, out buy);   // RB1-3: he comes up at a root pillar (the marker itself without pillars)
                        d.X = d.TeleOx + (bux - d.TeleOx) * up; d.Y = d.TeleOy + (buy - d.TeleOy) * up;
                        d.Iframes = Math.Max(d.Iframes, 5);
                        if (d.St2 <= 0) { d.X = bux; d.Y = buy; host.Fx("druidDust", d.X, d.Y, d.R * 1.3); host.Sound("druid_erupt", "#7 burrowStrike erupt", d.X, d.Y); d.S = "bossDruidErupt"; d.St2 = Remodel ? DruidRemodelData.BurrowEruptWarn + DruidRemodelData.BurrowEruptPost : 40; d.EruptMax = d.St2; d.EruptHit = false; RmText(d.X, d.Y - 40, "🌿💥", "#66dd22", 60); host.Shake(12); }
                        break;
                    }
                case "bossDruidErupt":
                    {
                        if (!d.EruptHit && d.St2 <= (d.EruptMax - (Remodel ? DruidRemodelData.BurrowEruptWarn : 8)))
                        {
                            d.EruptHit = true; double erR = d.R + 120; int erDmg = I(d.Atk * 2.2);
                            host.Fx("druidRoots", d.X, d.Y, erR);
                            if (Dst(px, py, d.X, d.Y) < erR && host.PIframes <= 0)
                            {
                                if (!Parry(e, d, 4, 60, 20, d.Facing + Math.PI))
                                {
                                    host.HurtPlayer(erDmg, false); host.PlayerPoison(4, 90); RmText(px, py - 16, "☠속박!", "#66dd22", 24);
                                    double ka = Atan2(py - d.Y, px - d.X); host.KnockPlayer(Cos(ka) * 14, Sin(ka) * 14);
                                }
                            }
                        }
                        if (d.St2 <= 0) { Recover(d, 30); }
                        break;
                    }
                case "bossSlashWind":
                    d.Facing = Face(d, Atan2(py - d.Y, px - d.X)); d.WeaponAng = -.8 + Sin(d.St2 * .3) * .3;
                    if (d.St2 <= 0) { d.S = "bossSlash"; d.St2 = Remodel ? DruidRemodelData.SlashActive : 10; d.WeaponAng = -.8; }
                    break;
                case "bossSlash":
                    {
                        double swProg = 1 - d.St2 / (Remodel ? (double)DruidRemodelData.SlashActive : 10); d.WeaponAng = -.8 + swProg * 2.0;
                        double smx = Cos(d.Facing) * 2.5, smy = Sin(d.Facing) * 2.5;
                        if (host.CanMove(d.X + smx, d.Y + smy, d.R)) { d.X += smx; d.Y += smy; }
                        if (Remodel) d.AtkParryable = d.SlashIdx < 2;   // spec #1: the big third swing cannot be parried
                        if ((Remodel ? d.St2 == DruidRemodelData.SlashHitAt : swProg > .3 && swProg < .7) && Dst(px, py, d.X, d.Y) < d.R + pr + 300 && host.PIframes <= 0)
                        {
                            double toP = Atan2(py - d.Y, px - d.X), aDiff = Math.Abs(((toP - d.Facing) % (Math.PI * 2) + (Math.PI * 3)) % (Math.PI * 2) - Math.PI);
                            if (aDiff < 1.2) { if ((Remodel && d.SlashIdx >= 2) || !Parry(e, d, 3, 60, 20, d.Facing + Math.PI)) PlayerHit(e, d, 1.5, 7); }
                        }
                        if (d.St2 <= 0)
                        {
                            d.SlashIdx++;
                            if (d.SlashIdx < d.SlashCnt)
                            {
                                if (Remodel) { host.Sound(d.SlashIdx == 1 ? "tell_parry" : "tell_boss", "#1 slashCombo hit " + (d.SlashIdx + 1) + " telegraph", d.X, d.Y); d.S = "bossSlashWind"; d.St2 = DruidRemodelData.SlashLinkTele; }   // hits 2 and 3 get their own 24 f telegraph (the aim still turns 2 deg per tick until 12 f before)
                                else { d.Facing = Atan2(py - d.Y, px - d.X); d.S = "bossSlash"; d.St2 = 8 + I(R() * 4); }
                                d.WeaponAng = -.8; host.Shake(3);
                            }
                            else { Recover(d, 25); d.WeaponAng = 0; host.Shake(5); }   // remodel: bossRec keeps the full 40 f counter window (recover clamps to 20)
                        }
                        break;
                    }
                case "bossSlamWind":
                    {
                        d.Facing = Face(d, Atan2(py - d.Y, px - d.X)); d.WeaponAng = -1.2 + Sin(d.St2 * .15) * .2;
                        double smx = Cos(d.Facing) * 1.5, smy = Sin(d.Facing) * 1.5;
                        if (!Remodel && Dst(px, py, d.X, d.Y) > 50 && host.CanMove(d.X + smx, d.Y + smy, d.R)) { d.X += smx; d.Y += smy; }   // remodel: the boss stands while he winds up
                        if (d.St2 <= 0) { AttackVoice(d, "slam"); d.S = "bossSlam"; d.St2 = Remodel ? DruidRemodelData.SlamActive : 8; }
                        break;
                    }
                case "bossSlam":
                    {
                        double slProg = 1 - d.St2 / 8; d.WeaponAng = -1.2 + slProg * 2.4;
                        if (d.St2 <= 0)
                        {
                            d.WeaponAng = 0; double slamR = Remodel ? Set.SlamRadius : 1000 + stage * 30 + d.BossPhase * 80, slamD = Dst(px, py, d.X, d.Y);
                            if (slamD < slamR && host.PIframes <= 0) { if (!Parry(e, d, 4, 80, 20, d.Facing + Math.PI)) PlayerHit(e, d, 2.2, 14); }
                            d.ShockR = 0; d.ShockMax = slamR; host.Shake(14);
                            if (Remodel && d.BossPhase >= 2) { PoisonPools.Add(new PoisonPool { X = d.X, Y = d.Y, T = 0, MaxT = 240, R = Set.SlamRadius, Dmg = I(d.Atk * .3), TickT = 0 }); host.Fx("druidPoison", d.X, d.Y, Set.SlamRadius); }
                            Recover(d, 40);
                        }
                        break;
                    }
                case "bossSweepWind":
                    d.Facing = Atan2(py - d.Y, px - d.X); d.WeaponAng = (d.SweepDir != 0 ? d.SweepDir : 1) * -1.2;
                    if (d.St2 <= 0) { d.S = "bossSweep"; d.St2 = 14; }
                    break;
                case "bossSweep":
                    {
                        double sw = 1 - d.St2 / 14, dir = d.SweepDir != 0 ? d.SweepDir : 1; d.WeaponAng = dir * (-1.2 + sw * 2.8);
                        double swR = d.R + pr + 400;
                        if (sw > .15 && sw < .85 && Dst(px, py, d.X, d.Y) < swR && host.PIframes <= 0)
                        {
                            double toP = Atan2(py - d.Y, px - d.X), aDiff = Math.Abs(((toP - d.Facing) % (Math.PI * 2) + (Math.PI * 3)) % (Math.PI * 2) - Math.PI);
                            if (aDiff < 1.7) { if (!Parry(e, d, 3, 60, 20, d.Facing + Math.PI)) PlayerHit(e, d, 1.8, 10); }
                        }
                        if (d.St2 <= 0)
                        {
                            d.WeaponAng = 0;
                            if (d.BossPhase >= 2)
                            {
                                double swA = d.Facing;
                                for (int si = -2; si <= 2; si++)
                                {
                                    double a = swA + si * 0.25;
                                    SpawnBossProjectile(e, d, new ProjSpec { X = d.X + Cos(a) * 20, Y = d.Y + Sin(a) * 20, Vx = Cos(a) * 4, Vy = Sin(a) * 4, Dmg = I(d.Atk * .8), El = EL_P, Life = 200, Ml = 200, Col = "#ffaa00", Sz = 2 });
                                }
                                RmText(d.X, d.Y - 20, "wind!", "#ffcc00", 20);
                            }
                            Recover(d, 30); host.Shake(6);
                        }
                        break;
                    }
                case "bossBeanStormWind":
                    d.Facing = Atan2(py - d.Y, px - d.X);
                    if (d.St2 <= 0) { d.S = "bossBeanStorm"; d.St2 = 8; d.BsWave = 0; }
                    break;
                case "bossBeanStorm":
                    if (d.St2 <= 0)
                    {
                        int cnt = 5 + Math.Min(I(stage * .3), 4) + d.BossPhase; double baseAng = Atan2(py - d.Y, px - d.X), spread = Math.PI * (.5 + d.BossPhase * .1);
                        for (int i = 0; i < cnt; i++)
                        {
                            double a = baseAng - spread / 2 + spread * i / (cnt - 1) + (R() - .5) * .15, spd = 2.5 + R() * 1.5, r4 = R(); bool bk = r4 < .5, rb = r4 >= .5; double sp = bk ? 4.4 : spd;
                            SpawnBossProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(a) * sp, Vy = Sin(a) * sp, Dmg = I(d.Atk * (bk ? 1.5 : rb ? 2 : 1)), El = EL_P, Life = bk ? 400 : 350, Ml = bk ? 400 : 350,
                                Col = bk ? "#00aa00" : rb ? "#cc1100" : "col", Sz = bk ? 2.0 : rb ? 1.8 : 1.2, RedBean = rb, BlackBean = bk, Homing = rb });
                        }
                        host.Shake(4); d.BsWave++;
                        if (d.BsWave >= d.BsMaxWave) { Recover(d, 25); } else d.St2 = 10 + I(R() * 6);
                    }
                    break;
                case "bossPoisonDash":
                    {
                        double pdSpd = Remodel ? DruidRemodelData.PoisonDashSpeed : 5, pmx = Cos(d.PtAng) * pdSpd, pmy = Sin(d.PtAng) * pdSpd;
                        if (host.CanMove(d.X + pmx, d.Y + pmy, d.R)) { d.X += pmx; d.Y += pmy; }
                        d.PtT += 1;
                        if (d.PtT >= 8) { d.PtT -= 8; PoisonPools.Add(new PoisonPool { X = d.X, Y = d.Y, T = 0, MaxT = Remodel ? Set.PoisonTrailTicks : 240, R = 175, Dmg = I(d.Atk * .3), TickT = 0 }); host.Fx("druidPoison", d.X, d.Y, 175); }
                        if (d.St2 <= 0) { Recover(d, 25); }
                        break;
                    }
                case "bossRec":
                    if (d.St2 <= 0) { d.S = "idle"; d.St2 = 3 + R() * 5; }
                    break;
                case "recover":
                    if (d.St2 > 20) d.St2 = 20;
                    if (d.St2 <= 0) { d.S = "idle"; d.St2 = 3 + R() * 5; }
                    break;
            }
        }

        // _fireChargedProj for a boss with a physical element (`else` branch): one plain bullet aimed at the player, life ~~(range*.3)
        void FireChargedProj(EnemyState e, DruidData d)
        {
            double aim = Atan2(host.PY - d.Y, host.PX - d.X); d.Facing = aim;
            int pLife = I(400 * .3);
            SpawnProjectile(e, d, new ProjSpec { X = d.X, Y = d.Y, Vx = Cos(aim) * 3, Vy = Sin(aim) * 3, Dmg = I(d.Atk * .8), El = EL_P, Life = pLife, Ml = pLife, Col = "col", Sz = 1.5, Commit = true }, false);
            d.ProjChargeT = 0;
        }
    }
}
