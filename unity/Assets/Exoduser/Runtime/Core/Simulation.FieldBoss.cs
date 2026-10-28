using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // One G._fieldBosses entry of the web (_fbMk 61315): a 심연의 앵글러. It lives outside the enemy list, so it is not a kill of any region (G.kills / _stageKills / _regKill ignore it).
    public sealed class FieldBossState
    {
        public int Index, El, T, Frame, HitCd, ShotCd = 120, TpCd, TpT, TpMax = 54, Burst, BurstGap, EnChg, Atk;
        public double X, Y, HomeX, HomeY, R = 120, Hp, MaxHp, TpX, TpY;
        public bool Alive = true, Hid = true, SpawnIn = true, Asleep = true;
    }

    // A pending enemy shot (web _emitEnemyShot -> G._shotWarnings entry, t=60): spawns when the 60 frame ring is over, moved by what the owner moved meanwhile.
    public sealed class FieldBossShotWarning { public FieldBossState Owner; public int T = 60; public double X0, Y0; public ProjSpec Spec; }

    /// <summary>
    /// M1-REGION R-B: the four 심연의 앵글러 of 1-1 (web game.html 61233~61405 _FB_* constants, _fbHp, _fbMk, _fbTick, _fbTickOne, _fbMarkDead; hits 18810 _fmCanHit, 18879 _fmApply,
    /// 18914 _hurtFieldMobs; 20241 _fieldEnemyCanShoot; 20255 _emitEnemyShot; 61050 _regionFbAlive). Off until <see cref="EnableFieldBosses"/>.
    /// </summary>
    public sealed partial class Simulation
    {
        public const int FieldBossCount = 4, FieldBossWake = 1000, FieldBossEnergyCharge = 180;
        public const double FieldBossHpMul = 7.5;
        private static readonly int[][] FieldBossSites = { new[] { 58, 158 }, new[] { 148, 150 }, new[] { 52, 42 }, new[] { 148, 42 } };   // SW water / SE fire / NW dark / NE lightning
        private static readonly int[] FieldBossElements = { 2, 1, 3, 4 };                                                                 // EL.I, EL.F, EL.D, EL.L
        private static readonly string[] ElementColors = { "#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44" };   // ELC

        public FieldBossState[] FieldBosses;                       // G._fieldBosses (null = none / cleared); a slain angler becomes null in its slot
        public bool FieldBossSpawned, FieldBossAnnounced;          // G._fbSpawned, G._fbAnnounced
        public bool FieldBossesEnabled;
        public readonly List<FieldBossShotWarning> FieldBossWarnings = new List<FieldBossShotWarning>();
        public readonly List<ProjSpec> FieldBossShots = new List<ProjSpec>();   // every shot handed to the enemy projectile system (last 64), for logs / tests
        public int FieldBossShotCount;   // shots handed out so far (FieldBossShots keeps only the last 64)
        public int FieldBossEnergyShots, FieldBossBurstShots, FieldBossTeleports, FieldBossSlams;
        public readonly List<int> FieldBossPlayerHits = new List<int>();   // the raw damage handed to HurtPlayer (contact / landing slam), for logs / tests
        /// <summary>_fieldEnemyCanShoot: the host says whether (x, y) is inside the view (half extents - 64). Default: a 1920x1080 view centred on the player.</summary>
        public Func<double, double, bool> FieldEnemyCanShoot;

        private static double Dist(double x1, double y1, double x2, double y2) { double dx = x2 - x1, dy = y2 - y1; return Math.Sqrt(dx * dx + dy * dy); }   // dst()

        public void EnableFieldBosses() { FieldBossesEnabled = true; }

        public static string ElementColor(int el) { return el >= 0 && el < ElementColors.Length ? ElementColors[el] : "#66e5ff"; }
        public static int FieldBossHp(int lv) { return Js.Int((1800 + (lv != 0 ? lv : 1) * 350) * FieldBossHpMul); }   // _fbHp(lv)

        private bool CanFieldEnemyShoot(FieldBossState e)
        {
            if (FieldEnemyCanShoot != null) return FieldEnemyCanShoot(e.X, e.Y);
            return Math.Abs(e.X - Player.X) <= Math.Max(0, 1920 / 2.0 - 64) && Math.Abs(e.Y - Player.Y) <= Math.Max(0, 1080 / 2.0 - 64);
        }

        // _fbMk(tx, ty, el)
        public FieldBossState MakeFieldBoss(int index, int tx, int ty, int el)
        {
            double x = (tx + .5) * StartMobTile, y = (ty + .5) * StartMobTile;
            int hp = FieldBossHp(Player.Level);
            return new FieldBossState { Index = index, X = x, Y = y, HomeX = x, HomeY = y, Hp = hp, MaxHp = hp, Atk = Js.Int((20 + Player.Level * 3) * 1.2), TpX = x, TpY = y, El = el };
        }

        /// <summary>_fbAliveCount</summary>
        public int FieldBossAliveCount()
        {
            int n = 0; if (FieldBosses != null) foreach (var a in FieldBosses) if (a != null && a.Hp > 0) n++;
            return n;
        }

        /// <summary>_regionFbAlive: the region's angler is alive (not yet spawned counts as alive; after the field boss flag nobody is).</summary>
        public bool FieldBossAliveForRegion(RegionState r)
        {
            if (r == null || r.FbIdx < 0 || Config.StageIndex != 0 || Stage.FieldBossDone) return false;
            if (!FieldBossSpawned) return true;
            var a = FieldBosses; if (a == null) return false;
            var fb = r.FbIdx < a.Length ? a[r.FbIdx] : null;
            return fb != null && fb.Hp > 0;
        }

        // _fbMarkDead
        private void FieldBossMarkDead(FieldBossState fb)
        {
            if (fb == null) return;
            fb.Alive = false;
            if (FieldBosses != null) for (int i = 0; i < FieldBosses.Length; i++) if (FieldBosses[i] == fb) FieldBosses[i] = null;
            if (FieldBossAliveCount() == 0) Stage.FieldBossDone = true;
        }

        /// <summary>_fbTick: spawn the four on the first tick, then tick every living one. Not in the boss arena.</summary>
        public void TickFieldBosses()
        {
            if (!FieldBossesEnabled || !Stage.Enabled || Config.StageIndex != 0) return;
            if (Stage.InArena) { FieldBosses = null; return; }   // _fbClear
            if (!FieldBossSpawned && !Stage.FieldBossDone)
            {
                FieldBosses = new FieldBossState[FieldBossCount];
                for (int i = 0; i < FieldBossCount; i++) FieldBosses[i] = MakeFieldBoss(i, FieldBossSites[i][0], FieldBossSites[i][1], FieldBossElements[i]);
                FieldBossSpawned = true;
            }
            var list = FieldBosses;
            if (list != null) for (int i = 0; i < list.Length; i++)
            {
                var fb = list[i]; if (fb == null || fb.Hp <= 0) continue;
                TickFieldBoss(fb);
            }
            TickFieldBossWarnings();   // _tickEnemyShotWarnings runs later in the same frame (web 34833, after _fbTick 32326)
        }

        // _fbFaceFrame
        public static int FieldBossFaceFrame(FieldBossState fb, double px, double py)
        {
            bool right = px >= fb.X; int row = (fb.T >> 5) & 1;
            if (right) return row != 0 ? 7 : 3;
            double dy = py - fb.Y, adx = px > fb.X ? px - fb.X : fb.X - px;
            int pose = dy > adx * .4 ? 2 : dy < -adx * .4 ? 1 : 0;
            return pose + row * 4;
        }

        // _fbEsca: the feeler tip the energy ball leaves from
        public static void FieldBossFeeler(FieldBossState fb, out double x, out double y)
        {
            int fr = fb.Frame & 7; double u = (fr == 3 || fr == 7) ? 0.87 : 0.13, v = fr == 1 ? 0.14 : 0.22;
            x = fb.X + (u - .5) * 300; y = fb.Y + v * 300 - 150;
        }

        private void EmitFieldBossShot(ProjSpec s)
        {
            FieldBossShots.Add(s); FieldBossShotCount++; if (FieldBossShots.Count > 64) FieldBossShots.RemoveAt(0);
            SpawnFieldProjectile(s);
        }

        // _fbFireEnergy
        private void FieldBossFireEnergy(FieldBossState fb)
        {
            if (!CanFieldEnemyShoot(fb)) return;
            double a = Math.Atan2(Player.Y - fb.Y, Player.X - fb.X), mx, my; FieldBossFeeler(fb, out mx, out my);
            EmitFieldBossShot(new ProjSpec { X = mx, Y = my, Vx = Math.Cos(a) * 10, Vy = Math.Sin(a) * 10, Dmg = Js.Int(fb.Atk * 2.8), El = 2, Life = 320, Ml = 320, Col = ElementColors[2], Sz = 48, R = 20, ElemBall = true, Typed = true, Commit = true });
            FieldBossEnergyShots++;
            HurtShake(16);
        }

        // _emitEnemyShot for the 혈안 burst: the shot waits out a 60 frame warning ring, then flies (homing, red bean = titanEye)
        private void FieldBossEmitBurst(FieldBossState fb)
        {
            double a = Math.Atan2(Player.Y - fb.Y, Player.X - fb.X);
            var s = new ProjSpec { X = fb.X + Math.Cos(a) * fb.R * .7, Y = fb.Y + Math.Sin(a) * fb.R * .7, Vx = Math.Cos(a) * 9, Vy = Math.Sin(a) * 9, Dmg = Js.Int(fb.Atk * 1.6), El = 1, Life = 260, Ml = 260, Col = "#ff2233", Sz = 6.4, R = 12, Typed = true, Commit = true, Homing = true, RedBean = true };
            FieldBossWarnings.Add(new FieldBossShotWarning { Owner = fb, X0 = fb.X, Y0 = fb.Y, Spec = s });
            FieldBossBurstShots++;
        }

        // _tickEnemyShotWarnings: a dead owner cancels its pending shots
        private void TickFieldBossWarnings()
        {
            int n = 0;
            for (int i = 0; i < FieldBossWarnings.Count; i++)
            {
                var w = FieldBossWarnings[i];
                if (w.Owner.Alive)
                {
                    w.T -= 1;
                    if (w.T > 0) { FieldBossWarnings[n++] = w; continue; }
                    w.Spec.X += w.Owner.X - w.X0; w.Spec.Y += w.Owner.Y - w.Y0;
                    EmitFieldBossShot(w.Spec);
                }
            }
            if (n < FieldBossWarnings.Count) FieldBossWarnings.RemoveRange(n, FieldBossWarnings.Count - n);
        }

        // _fbTickOne
        private void TickFieldBoss(FieldBossState fb)
        {
            double px = Player.X, py = Player.Y, pr = Player.Radius;
            if (fb.Asleep)
            {
                if (Dist(px, py, fb.X, fb.Y) > FieldBossWake) return;
                fb.Asleep = false; fb.TpT = 54; fb.TpMax = 54; fb.Hid = true; fb.SpawnIn = true; fb.TpX = fb.X; fb.TpY = fb.Y;
                if (!FieldBossAnnounced) { FieldBossAnnounced = true; Stage.RaiseAngler(StageEventKind.AnglerWoke, (float)fb.X, (float)fb.Y, fb.El); }
                HurtShake(8);
                return;
            }
            fb.T++;
            if (fb.HitCd > 0) fb.HitCd--; if (fb.ShotCd > 0) fb.ShotCd--;
            double d = Dist(fb.X, fb.Y, px, py);
            fb.Frame = FieldBossFaceFrame(fb, px, py);
            if (!fb.Hid)
            {
                if (d < fb.R + pr)
                {
                    double pa = Math.Atan2(py - fb.Y, px - fb.X);
                    Player.X = (float)(fb.X + Math.Cos(pa) * (fb.R + pr)); Player.Y = (float)(fb.Y + Math.Sin(pa) * (fb.R + pr)); d = fb.R + pr;
                }
                if (d < fb.R + pr + 8 && Player.Iframes <= 0 && !(DashActive || HarpActive)) { FieldBossPlayerHits.Add(fb.Atk); HurtPlayer(fb.Atk); }
            }
            bool canShoot = CanFieldEnemyShoot(fb);
            if (!canShoot) { fb.EnChg = 0; fb.Burst = 0; fb.BurstGap = 0; }
            if (canShoot && fb.ShotCd <= 0 && !fb.Hid && !(fb.TpT > 0) && !(fb.EnChg > 0)) { fb.ShotCd = FieldBossEnergyCharge; fb.EnChg = FieldBossEnergyCharge; }
            if (fb.EnChg > 0 && !fb.Hid && !(fb.TpT > 0))
            {
                fb.EnChg--;
                if (fb.EnChg == 0) { FieldBossFireEnergy(fb); fb.Burst = 3; fb.BurstGap = 18; if (!(fb.TpCd > 0)) fb.TpCd = 600; }
            }
            if (fb.Burst > 0 && !fb.Hid && !(fb.TpT > 0) && !(fb.EnChg > 0))
            {
                if (fb.BurstGap > 0) fb.BurstGap--;
                else { FieldBossEmitBurst(fb); fb.Burst--; fb.BurstGap = 24; }   // 0.4 s apart, re-aimed every time
            }
            if (fb.TpT > 0)
            {
                fb.TpT--;
                if (fb.TpT == 0)
                {
                    bool isSpawn = fb.SpawnIn;
                    fb.X = fb.TpX; fb.Y = fb.TpY; fb.Hid = false; fb.SpawnIn = false;
                    HurtShake(16);
                    if (!isSpawn)
                    {
                        double sd = Dist(fb.X, fb.Y, Player.X, Player.Y);   // live player position: the web reads P.x after the push above
                        if (sd < fb.R + 110 && Player.Iframes <= 0 && !(DashActive || HarpActive))
                        {
                            FieldBossPlayerHits.Add(fb.Atk); HurtPlayer(fb.Atk);
                            double ka = Math.Atan2(Player.Y - fb.Y, Player.X - fb.X); Player.KnockbackX += (float)(Math.Cos(ka) * 18); Player.KnockbackY += (float)(Math.Sin(ka) * 18);
                            RaisePlayerText(Player.X, Player.Y - 30, "💥심해강타!", "#ff4444", 40);
                            FieldBossSlams++;
                        }
                    }
                }
            }
            else if (fb.TpCd > 0)
            {
                fb.TpCd--;
                if (fb.TpCd == 0)
                {
                    if (d < 2200) { fb.TpX = Player.X; fb.TpY = Player.Y; fb.TpMax = 54; fb.TpT = 54; fb.Hid = true; FieldBossTeleports++; HurtShake(6); }   // announce: body hidden, arrival point
                    else fb.TpCd = 600;
                }
            }
            if (fb.Hp <= 0)
            {
                if (!Stage.FieldBossDone) Stage.RaiseAngler(StageEventKind.AnglerSlain, (float)fb.X, (float)fb.Y, fb.El);   // showPH only while the flag is still down
                FieldBossMarkDead(fb);
            }
        }

        // ---- hits (the five _hurtFieldMobs call sites) ----
        // _fmXY: an angler is hit where it will arrive while it teleports
        private static void FieldBossXY(FieldBossState m, out double x, out double y)
        {
            if (m.TpT > 0) { x = m.TpX; y = m.TpY; } else { x = m.X; y = m.Y; }
        }
        // _fmCanHit(isFb): only a fully hidden angler is immune; wriggling in / smoke arrival can be hit
        private static bool FieldBossCanHit(FieldBossState m) { return m != null && m.Hp > 0 && (!m.Hid || m.TpT > 0); }

        // _fmApply
        private bool FieldBossApply(FieldBossState m, double dmg)
        {
            if (m.HitCd > 0) return false;
            int d = Math.Max(1, Js.Int(dmg));
            m.Hp -= d; m.HitCd = 8;
            if (m.Hp <= 0)
            {
                Stage.RaiseAngler(StageEventKind.AnglerSlain, (float)m.X, (float)m.Y, m.El);
                FieldBossMarkDead(m);
            }
            return true;
        }

        /// <summary>_hurtFieldMobs(x, y, hitR, dmg, hitSet): flat damage (no defence, element, crit) to every angler the circle touches. Returns whether one was hit.</summary>
        public bool HurtFieldMobs(double x, double y, double hitR, double dmg, HashSet<FieldBossState> hitSet)
        {
            var list = FieldBosses; if (list == null) return false;
            bool any = false;
            for (int i = 0; i < list.Length; i++)
            {
                var fb = list[i]; if (!FieldBossCanHit(fb)) continue;
                double fx, fy; FieldBossXY(fb, out fx, out fy);
                if (Dist(x, y, fx, fy) < hitR + fb.R && !(hitSet != null && hitSet.Contains(fb)))
                {
                    if (hitSet != null) hitSet.Add(fb);
                    if (FieldBossApply(fb, dmg)) any = true;
                }
            }
            return any;
        }
    }
}
