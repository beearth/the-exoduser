using System;

namespace Exoduser.UnityPort.Core
{
    // Port of the first part of the web enemy update (CX-03a):
    //   L1 = game.html "if(G._bonfire&&G._bonfire.t>0)…" .. end of the per-enemy `if(e.alive){…}` block in the enemy loop (BeginFrame + Step)
    //   U1 = updateE(e,sp) from its first line up to (not including) the "D4식 DOT" comment (UpdateHead)
    // Only state changes and the ORDER of the injected calls are ported; the movement algorithm, wall tests, LOS, damage, sound, text and
    // particles are EnemyTickContext delegates. Written by hand from the original text; unity/Tools/enemy-tick-oracle compares it with the
    // original executed in Node. Dead enemies (the `else if(e._reviveTimer>0)` branch) are BX-08 and not ported.
    public static class EnemyTick
    {
        const double Tile = EnemyFactory.Tile;

        // ---- JS truthiness / helpers ----
        static bool Truthy(double? v) { return v.HasValue && v.Value != 0 && !double.IsNaN(v.Value); }
        static bool Truthy(bool? v) { return v.HasValue && v.Value; }
        static bool Gt0(double? v) { return v.HasValue && v.Value > 0; }
        static double Or(double? v, double fallback) { return Truthy(v) ? v.Value : fallback; }   // v||fallback
        static int ToInt32(double v) { return EnemyFactory.ToInt32(v); }
        static double Dst(double a, double b, double c, double d) { return Math.Sqrt((c - a) * (c - a) + (d - b) * (d - b)); }
        static double Dst2(double a, double b, double c, double d) { return (c - a) * (c - a) + (d - b) * (d - b); }
        // ETYPE_RANGE[etype]||600 (the web table has 90 entries; etype >= 90 is undefined -> 600)
        static double RangeOf(int etype) { double v = etype >= 0 && etype < EnemyTables.Range.Length ? EnemyTables.Range[etype] : 0; return v != 0 ? v : 600; }
        // _spikeTrapSlowPct(lv)
        static double SpikeTrapSlowPct(double? lv) { return Math.Min(.95, .91 + (Math.Max(1, Or(lv, 1)) - 1) * .02); }
        // _poiseReset(e)
        static void PoiseReset(EnemySpawn e) { e.poise = e.maxPoise; e.poiseR = 0; }
        // _isDruidFinale(e) / _isNormalDruidBoss(e)
        static bool IsDruidFinale(EnemyTickContext c, EnemySpawn e) { return c.DemoMode && c.Stage == c.DemoLastStage && c.Stage == 3 && e != null && e.ib; }
        static bool IsNormalDruidBoss(EnemyTickContext c, EnemySpawn e) { return e != null && e.ib && (c.Stage == 0 || c.Stage == 3) && !IsDruidFinale(c, e); }

        // ================= L1: enemy loop =================

        // Frame setup of the enemy loop: bonfire timer, _bf/_bfActive, G._eTierFrame++, _eUpdateStart = performance.now().
        public static EnemyTickFrame BeginFrame(EnemyTickContext c, double sp)
        {
            if (c.Bonfire != null && c.Bonfire.t > 0) c.Bonfire.t -= sp;
            var f = new EnemyTickFrame { Bonfire = c.Bonfire };
            f.BonfireActive = c.Bonfire != null && c.Bonfire.t > 0;
            if (!(c.EnemyTierFrame.HasValue && c.EnemyTierFrame.Value != 0)) c.EnemyTierFrame = 0;
            c.EnemyTierFrame = c.EnemyTierFrame.Value + 1;
            f.UpdateStartMs = c.Now();
            return f;
        }

        // One iteration of the enemy loop (index ei). Returns true when the web loop executes `break` (time budget exceeded).
        public static bool Step(EnemyTickContext c, EnemyTickFrame f, System.Collections.Generic.IList<EnemySpawn> ens, int ei, double sp)
        {
            var e = ens[ei];
            // time budget: over 12ms (mobile 8ms) -> skip the rest except bosses
            if (ei % (c.IsMobile ? 8 : 32) == 0 && ei > 0 && !e.ib && c.Now() - f.UpdateStartMs > (c.IsMobile ? 8 : 12)) return true;
            if (!e.alive) return false; // web: `else if(e._reviveTimer>0)` revive handling (BX-08), not ported
            if (f.BonfireActive && !e.ib) { double clr = c.BonfireClearance(e); c.PushOutsideBonfire(e, f.Bonfire, clr); }
            // stuck in a wall (centre + 4 corners) — before culling
            if (c.WallStuck(e.x, e.y) || c.WallStuck(e.x - e.r, e.y - e.r) || c.WallStuck(e.x + e.r, e.y - e.r) || c.WallStuck(e.x - e.r, e.y + e.r) || c.WallStuck(e.x + e.r, e.y + e.r))
            {
                bool rescued0 = false;
                for (int wr0 = 1; wr0 <= 5 && !rescued0; wr0++)
                {
                    for (int wd0 = 0; wd0 < 8; wd0++)
                    {
                        double wa0 = wd0 * Math.PI / 4, wx0 = e.x + JsMath.Cos(wa0) * Tile * wr0, wy0 = e.y + JsMath.Sin(wa0) * Tile * wr0;
                        int rtx0 = ToInt32(wx0 / Tile), rty0 = ToInt32(wy0 / Tile);
                        if (rtx0 >= 0 && rty0 >= 0 && rtx0 < c.MapWidth && rty0 < c.MapHeight && c.Map[rty0][rtx0] != 1) { e.x = wx0; e.y = wy0; e.kb.x = 0; e.kb.y = 0; rescued0 = true; break; }
                    }
                }
                if (!rescued0)
                {
                    if (e.ib)
                    {
                        // bosses never die here: wide ring (6..12 tiles) -> player position -> stay
                        bool brescued0 = false;
                        for (int wr1 = 6; wr1 <= 12 && !brescued0; wr1++)
                        {
                            for (int wd1 = 0; wd1 < 8; wd1++)
                            {
                                double wa1 = wd1 * Math.PI / 4, wx1 = e.x + JsMath.Cos(wa1) * Tile * wr1, wy1 = e.y + JsMath.Sin(wa1) * Tile * wr1;
                                int rtx1 = ToInt32(wx1 / Tile), rty1 = ToInt32(wy1 / Tile);
                                if (rtx1 >= 0 && rty1 >= 0 && rtx1 < c.MapWidth && rty1 < c.MapHeight && c.Map[rty1][rtx1] != 1) { e.x = wx1; e.y = wy1; e.kb.x = 0; e.kb.y = 0; brescued0 = true; break; }
                            }
                        }
                        if (!brescued0 && c.CanMove(c.PlayerX, c.PlayerY, e.r)) { e.x = c.PlayerX; e.y = c.PlayerY; e.kb.x = 0; e.kb.y = 0; }
                    }
                    else
                    {
                        e.hp = 0; e.alive = false; e.s = "dead"; c.RollDrop(e); c.AddExp(Or(e.exp, 1)); c.Kills++; c.StageKills = Or(c.StageKills, 0) + 1; c.RegKill(e);
                        return false; // continue
                    }
                }
            }
            // timers that always run (culling / tier independent)
            if (e._spawnT > 0) e._spawnT--;
            if (Gt0(e._bossReviveVFXPending))
            {
                e._bossReviveVFXPending -= sp;
                if (e._bossReviveVFXPending <= 0) { e._bossReviveVFXPending = 0; c.BossReviveGrandVfx(e, Or(e._origR, e.r)); }
            }
            if (e.stunned > 0) e.stunned -= sp;
            if (Gt0(e._hitStun)) e._hitStun -= sp;
            if (Gt0(e._hitFlash)) e._hitFlash = Math.Max(0, e._hitFlash.Value - sp);
            if (Gt0(e._stunImmune)) e._stunImmune -= sp;
            if (Gt0(e._pImmune)) e._pImmune -= sp;
            if (e.stunned <= 0 && Truthy(e._maxStunned))
            {
                e._maxStunned = 0;
                if (e.ib) { PoiseReset(e); e._pImmune = Math.Max(Or(e._pImmune, 0), 300); e.s = "idle"; e.st2 = 30; e._teleDropY = 0; }
            }
            double eox = e.x, eoy = e.y;
            if (e.reviveIframes > 0) e.reviveIframes = Math.Max(0, e.reviveIframes - sp);
            double ed2 = Dst2(c.PlayerX, c.PlayerY, e.x, e.y);
            // viewport culling (+300px), exceptions: boss, hurt, charge commit, within 30px
            bool eCommitChg = e.s == "eChargeWind" || e.s == "eCharge";
            bool eInView = e.ib || Gt0(e.hurt) || eCommitChg || (ed2 < 900) ||
                (c.WorldPointVisible!=null?c.WorldPointVisible(e.x,e.y,300):(e.x > c.CamX - c.ViewW / 2 - 300 && e.x < c.CamX + c.ViewW / 2 + 300 && e.y > c.CamY - c.ViewH / 2 - 300 && e.y < c.CamY + c.ViewH / 2 + 300));
            int tierFrame = ToInt32(c.EnemyTierFrame.Value);
            if (!eInView)
            {
                // leash teleport: alerted enemies 2500px+ away jump to the 800..1200px ring (2 Math.random)
                if (!e.ib && e.stunned == 0 && !Truthy(e._frozen) && Truthy(e._alerted) && ed2 > 6250000)
                {
                    double lshAng = Math.PI * 2 * c.Random(), lshD = 800 + c.Random() * 400;
                    double lshX = c.PlayerX + JsMath.Cos(lshAng) * lshD, lshY = c.PlayerY + JsMath.Sin(lshAng) * lshD;
                    if ((c.WorldPointVisible==null||!c.WorldPointVisible(lshX,lshY,e.r+100))&&c.CanMove(lshX, lshY, e.r)) { e.x = lshX; e.y = lshY; e.kb.x = 0; e.kb.y = 0; e.facing = JsMath.Atan2(c.PlayerY - e.y, c.PlayerX - e.x); e._stuckT = 0; }
                }
                if (Truthy(e._alerted) && (tierFrame & 7) == 0)
                {
                    double erOff = RangeOf((int)e.etype);
                    if (erOff <= 400 || Dst(c.PlayerX, c.PlayerY, e.x, e.y) > erOff * .85) c.FlowMove(e, sp * 4, 0.5);
                }
                return false; // continue
            }
            // 4-tier AI (boss = always T1)
            if (e.ib || Gt0(e.hurt) || ed2 < 22500 || eCommitChg)
            {
                c.UpdateE(e, sp);
            }
            else if (ed2 < 122500)
            {
                if ((tierFrame & 1) == (ei & 1)) c.UpdateE(e, sp * 2);
            }
            else if (ed2 < 490000)
            {
                if ((tierFrame & 3) == (ei & 3)) c.UpdateE(e, sp * 4);
            }
            else
            {
                if ((tierFrame & 7) == (ei & 7))
                {
                    if (Truthy(e._alerted)) { double erT4 = RangeOf((int)e.etype); if (erT4 <= 400 || Dst(c.PlayerX, c.PlayerY, e.x, e.y) > erT4 * .85) c.FlowMove(e, sp * 4, 0.6); }
                    else c.UpdateE(e, sp * 8);
                }
            }
            if (f.BonfireActive && !e.ib) { double clr2 = c.BonfireClearance(e); c.PushOutsideBonfire(e, f.Bonfire, clr2); }
            double edd = (e.x - eox) * (e.x - eox) + (e.y - eoy) * (e.y - eoy);
            if (edd > 0) e._walkDist = Or(e._walkDist, 0) + Math.Sqrt(edd);
            return false;
        }

        // ================= U1: updateE head =================

        // Runs updateE up to the "D4식 DOT" comment. Returns true if the web function returned early (lesson / hit-stun / stun / freeze).
        // `d` = distance to the player at the end of the head (the web local `d`, kept consistent after every move).
        public static bool UpdateHead(EnemyTickContext c, EnemySpawn e, double sp, out double d)
        {
            d = 0;
            if (Truthy(e._lessonEnemy) && c.ParryLessonActive) return true;
            e._tellS = e.s; // 음향 재생은 주입 계층 소유, 상태 마커는 원본과 같은 틱에 기록한다.
            // telegraph timer
            if (Gt0(e._telegraphT)) { e._telegraphT -= sp; e._telegraphR = e.r + 20; }
            // push out of a wall
            if (!c.CanMoveTile(e.x, e.y, e.r)) c.PushOutWall(e);
            if (e.reviveIframes > 0) e.reviveIframes = Math.Max(0, e.reviveIframes - sp);
            if (Gt0(e._cursed)) e._cursed -= sp;
            if (Gt0(e._shockT)) { e._shockT -= sp; if (e._shockT <= 0) { e._shockT = 0; e._shockStk = 0; } }
            // knockback movement
            if (Math.Abs(e.kb.x) > .1 || Math.Abs(e.kb.y) > .1)
            {
                double nx = e.x + e.kb.x * sp, ny = e.y + e.kb.y * sp;
                if (c.CanMove(nx, ny, e.r))
                {
                    e.x = nx; e.y = ny;
                    // rift collision while knocked back
                    if (c.Rifts.Count > 0)
                    {
                        double kbSpd2 = Math.Sqrt(e.kb.x * e.kb.x + e.kb.y * e.kb.y);
                        if (kbSpd2 > 2)
                        {
                            for (int ri2 = 0; ri2 < c.Rifts.Count; ri2++)
                            {
                                var rf = c.Rifts[ri2];
                                double rd = Dst(e.x, e.y, rf.x, rf.y); double riftR = 15 + Math.Min(1, rf.t / rf.maxT) * 20;
                                if (rd < riftR + e.r)
                                {
                                    int crDmg = ToInt32(kbSpd2 * 4); c.HurtEnemy(e, crDmg);
                                    c.AddText(e.x, e.y - 18, c.Translate("균열 충돌! ") + crDmg, "#9933ff", 30); c.AddParts(e.x, e.y, "#aa44ff", 8);
                                    c.Block(); c.Shake(6); e.kb.x = 0; e.kb.y = 0; break;
                                }
                            }
                        }
                    }
                }
                else
                {
                    // wall collision damage: real tile walls only (not MAP_OBJS)
                    int wbTx = ToInt32(nx / Tile), wbTy = ToInt32(ny / Tile);
                    bool isRealWall = wbTx < 0 || wbTy < 0 || wbTx >= c.MapWidth || wbTy >= c.MapHeight || c.Map[wbTy][wbTx] == 1;
                    double kbSpd = Math.Sqrt(e.kb.x * e.kb.x + e.kb.y * e.kb.y);
                    if (isRealWall && kbSpd > 2)
                    {
                        double wPct = Math.Min(0.08, kbSpd * 0.004);
                        int wallDmg = (int)Math.Max(ToInt32(kbSpd * 4), ToInt32(e.mhp * wPct));
                        c.HurtEnemy(e, wallDmg);
                        c.AddText(e.x, e.y - 18, c.Translate("벽 충돌! ") + wallDmg, "#cc8844", 30); c.AddParts(e.x, e.y, "#aa7744", 8);
                        c.Block(); c.Shake(8); e.kb.x = 0; e.kb.y = 0;
                    }
                    else { e.kb.x = 0; e.kb.y = 0; }
                }
                double ekD = Math.Pow(.85, sp); e.kb.x *= ekD; e.kb.y *= ekD;
                if (Gt0(e._spikeSlow)) { double ssP = SpikeTrapSlowPct(e._spikeSlowLv); e.kb.x *= (1 - ssP); e.kb.y *= (1 - ssP); }
            }
            if (Gt0(e._bluHitCD)) e._bluHitCD -= sp;
            if (Gt0(e._hitStun)) return true; // hit-stun: skip AI
            if (e.stunned > 0)
            {
                c.CancelProjCharge(e);
                if (e.stunned > 180) e.stunned = 180;
                if (!Truthy(e._maxStunned) || e._maxStunned < e.stunned) e._maxStunned = e.stunned;
                if (e.stunned <= 0)
                {
                    e.stunned = 0; e._maxStunned = 0; PoiseReset(e);
                    if (e.ib) { e._pImmune = Math.Max(Or(e._pImmune, 0), 300); e.s = "idle"; e.st2 = 30; e._teleDropY = 0; }
                }
                return true;
            }
            // moving?: compare with the previous position (3 frame hold) and record the move angle
            {
                double dx = e.x - Or(e._prevX, e.x), dy = e.y - Or(e._prevY, e.y);
                if (dx * dx + dy * dy > 0.25) { e._isMoving = true; e._moveHold = 3; e._moveAng = JsMath.Atan2(dy, dx); }
                else if (Gt0(e._moveHold)) { e._moveHold -= sp; }
                else { e._isMoving = false; }
                e._prevX = e.x; e._prevY = e.y;
            }
            // frozen: no actions
            if (Gt0(e._frozen))
            {
                c.CancelProjCharge(e);
                e._frozen -= sp;
                if (e._frozen <= 0) { e._frozen = 0; e._freezeGauge = 0; e._frozenImmune = e.ib ? 300 : 120; }
                return true;
            }
            if (Gt0(e._webSlow)) e._webSlow -= sp;
            if (Gt0(e._frozenImmune)) e._frozenImmune -= sp;
            if (Gt0(e._iceResDown)) e._iceResDown -= sp;
            if (Gt0(e._iceShardRes)) { e._iceShardRes -= 0.002 * sp; if (e._iceShardRes < 0) e._iceShardRes = 0; }
            if (Gt0(e._weakT)) { e._weakT -= sp; if (e._weakT <= 0) { e._weakPhys = 0; e._weakMag = 0; e._weakPj = 0; } }
            if (Gt0(e._shockDRT)) { e._shockDRT -= sp; if (e._shockDRT <= 0) e._shockDR = 0; }
            if (Gt0(e._blinkWeakT)) { e._blinkWeakT -= sp; if (e._blinkWeakT <= 0) e._blinkWeak = 0; }
            if (Gt0(e._freezeGauge)) e._freezeGauge = Math.Max(0, e._freezeGauge.Value - sp * .3);
            // poise: normal enemies regenerate on their own, bosses only via _poiseHit/_poiseReset
            if (!e.ib && e.poise < e.maxPoise)
            {
                e.poiseR += sp;
                if (e.poiseR >= 200) { e.poise = Math.Min(e.maxPoise, e.poise + ToInt32(e.maxPoise * 0.15)); e.poiseR = 0; }
            }
            d = Dst(c.PlayerX, c.PlayerY, e.x, e.y);
            // move sound (within 1000, at most 3 at once)
            if (d < 1000 && e.stunned == 0 && !Truthy(e._frozen))
            {
                if (!Truthy(e._mSfxCd)) e._mSfxCd = 0;
                if (e._mSfxCd <= 0)
                {
                    if (c.MoveSfxPlaying < 3)
                    {
                        string msk = EnemyTickTables.EtypeSfx((int)e.etype) ?? EnemyTickTables.ArchSfx((int)e.etype);
                        if (msk != null)
                        {
                            double vol = Math.Max(.03, .35 * (1 - d / 1000));
                            string msk2 = (msk == "monster_crawl" && c.Random() < .5) ? "monster_crawl1" : msk;
                            c.PlaySample(msk2, vol, c.RandomRate(1, .15)); e._mSfxCd = 60 + ToInt32(c.Random() * 60); c.MoveSfxPlaying++;
                        }
                    }
                }
                else e._mSfxCd -= sp;
            }
            // revive aggro: double-speed flow field chase until the player is reached
            if (Truthy(e._reviveChase) && d > 200 && (e.s == "idle" || e.s == "recover"))
            {
                c.FlowMove(e, sp, 2);
                d = Dst(c.PlayerX, c.PlayerY, e.x, e.y); if (d <= 200) e._reviveChase = false;
            }
            // sight aggro: within 800 and LOS
            if (!Truthy(e._alerted) && d < 800 && (e.s == "idle" || e.s == "recover") && c.HasLos(e.x, e.y, c.PlayerX, c.PlayerY)) e._alerted = true;
            // facing: only when alerted (druid charge aim lock excepted)
            bool druidAimLocked = (IsDruidFinale(c, e) || IsNormalDruidBoss(c, e)) && (e.s == "bossCharge" || (e.s == "bossChargeWind" && e.st2 <= 18 + sp));
            if (d < 800 && Truthy(e._alerted) && !druidAimLocked) e.facing = JsMath.Atan2(c.PlayerY - e.y, c.PlayerX - e.x);
            // chase by range class
            if (Truthy(e._alerted) && (e.s == "idle" || e.s == "recover"))
            {
                double eRng = RangeOf((int)e.etype);
                if (eRng <= 400)
                {
                    if (d > 30) { c.FlowMove(e, sp, e.ib ? 2 : 1); d = Dst(c.PlayerX, c.PlayerY, e.x, e.y); }
                }
                else
                {
                    double idealMin = eRng * .65, idealMax = eRng * .85;
                    if (d > idealMax)
                    {
                        c.FlowMove(e, sp, e.ib ? 2 : 1); d = Dst(c.PlayerX, c.PlayerY, e.x, e.y);
                    }
                    else if (d < idealMin && d > 30)
                    {
                        double bAng = JsMath.Atan2(e.y - c.PlayerY, e.x - c.PlayerX);
                        double bSpd = e.speed * (e.ib ? 2 : 1) * sp * .5;
                        double bnx = e.x + JsMath.Cos(bAng) * bSpd, bny = e.y + JsMath.Sin(bAng) * bSpd;
                        if (!c.IsWall(bnx, bny, true)) { e.x = bnx; e.y = bny; d = Dst(c.PlayerX, c.PlayerY, e.x, e.y); }
                    }
                }
            }
            // whirlwind hit stacks: 3 per second decay after 1s without hits
            if (Gt0(e._wwStk)) { if (Gt0(e._wwStkT)) e._wwStkT -= sp; else e._wwStk = Math.Max(0, e._wwStk.Value - ToInt32(3 * sp / 60)); }
            // weak-point exposure: -20% per second, reset after 5s without hits
            if (Or(e._comboStk, 0) > 0)
            {
                if (!Truthy(e._comboHitT)) e._comboHitT = 0;
                e._comboHitT += sp;
                if (e._comboHitT >= 300) { e._comboStk = 0; e._comboHitT = 0; }
                else if (e._comboHitT >= 60)
                {
                    if (!Truthy(e._comboDecayT)) e._comboDecayT = 0;
                    e._comboDecayT += sp;
                    if (e._comboDecayT >= 60) { e._comboDecayT -= 60; e._comboStk = Math.Max(0, e._comboStk.Value - Math.Max(1, ToInt32(e._comboStk.Value * 0.20))); }
                }
            }
            return false;
        }
    }
}
