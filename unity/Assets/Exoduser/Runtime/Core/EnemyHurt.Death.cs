using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Port of the front half of the death part of the web hurtE (CX-04c1): from `  if(e.hp<=0){` up to (not including) "// ═══ 지옥의 잔해 드롭 ═══"
    // (game.html fce195067 lines 42568..42817): decoy, 87 doppelganger, boss revive system, normal-mob revive, killSlayer, On-Kill affixes/uniques/legendaries,
    // STY-D9 si0 druid sink, death effects, combo, spawn-hole counter, gate guard.
    // Values and the ORDER of the injected calls and Math.random draws equal the web. Written by hand from the original text;
    // unity/Tools/enemy-hurt-oracle (H3 + chain cases) compares it with the original executed in Node.
    public static partial class EnemyHurt
    {
        // _isDruidFinale(e)
        static bool IsDruidFinale(EnemyHurtContext c, EnemySpawn e) { return c.DemoMode && c.Stage == c.DemoLastStage && c.Stage == 3 && e != null && e.ib; }
        // _druidFinaleReviveChance(e, suppress)
        static double DruidFinaleReviveChance(EnemySpawn e, double suppress) { return e.deaths == 1 && e._revPts > 0 ? Math.Max(0, Math.Min(1, 1 - suppress)) : 0; }
        // _isSi0DruidSink(e)
        static bool IsSi0DruidSink(EnemyHurtContext c, EnemySpawn e) { return e != null && e.ib && !Truthy(e._fmKind) && c.Stage == 0 && !IsDruidFinale(c, e); }
        static bool Truthy(string s) { return !string.IsNullOrEmpty(s); }
        // STG[G.stage]?STG[G.stage].hell:0
        static double HellOfStage(double stage)
        {
            int si = (int)stage;
            return stage == si && si >= 0 && si < EnemyTables.SiToHell.Length ? EnemyTables.SiToHell[si] : 0;
        }
        // holyPrison zone adds 15%..30% (Lv1..Lv10) to the suppression; returns 0 and found=false when the enemy is outside every zone
        static double HolyPrisonBonus(EnemyHurtContext c, EnemySpawn e, out bool found)
        {
            found = false;
            if (c.FireZones != null)
            {
                for (int fi = 0; fi < c.FireZones.Count; fi++)
                {
                    var fz = c.FireZones[fi];
                    if (fz.type == "holyPrison" && Dst(e.x, e.y, fz.x, fz.y) < fz.r) { found = true; return .15 + (Or(fz.lv, 1) - 1) * (.15 / 9); }
                }
            }
            return 0;
        }
        // safePt(x,y,r): the point itself, else the first free point on the 8-direction rings d = 40..200 step 20; false = null
        static bool SafePt(EnemyHurtContext c, double x, double y, double r, out double ox, out double oy)
        {
            if (c.CanMove(x, y, r)) { ox = x; oy = y; return true; }
            for (double d = 40; d <= 40 * 5; d += 40 / 2)
                for (int a = 0; a < 8; a++)
                {
                    double nx = x + JsMath.Cos(Math.PI / 4 * a) * d, ny = y + JsMath.Sin(Math.PI / 4 * a) * d;
                    if (c.CanMove(nx, ny, r)) { ox = nx; oy = ny; return true; }
                }
            ox = 0; oy = 0; return false;
        }
        // _r(v,s): pitch randomiser, one Math.random() draw
        static double Rnd(EnemyHurtContext c, double v, double s) { return v * (1 + (c.Random() - .5) * 2 * s); }

        // Returns null where the web returns early inside this range (decoy, doppelganger revive, successful boss revive); `exit` says which.
        // A non-null result with __cont=false means the HP check failed (no death); __cont=true carries the locals CX-04c2 needs.
        public static EnemyHurtDeathResult DeathHead(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtBodyResult b, out DeathExit exit)
        {
            var P = c.P;
            double dmg = b.dmg, atkEl = b.atkEl;
            if (!(e.hp <= 0)) { exit = DeathExit.NotDead; return new EnemyHurtDeathResult { __cont = false }; }
            // 디코이(환영) 사망: 파티클만 + 드롭 없음
            if (Truthy(e._isDecoy))
            {
                c.AtkTicketRelease(e); e.alive = false; c.Kills++; c.StageKills = Or(c.StageKills, 0) + 1; c.RegKill(e); c.PetOnKill(e); c.AddParts(e.x, e.y, "#bb66ff", 15);
                c.AddText(e.x, e.y - 15, c.Translate("환영 소멸!"), "#bb66ff", 25, null, null);
                c.Shake(3); exit = DeathExit.Decoy; return null;
            }
            // 87:도플갱어 부활 (1회)
            if (e.etype == 87 && !e._dgRevived)
            {
                e._dgRevived = true; e.hp = ToInt32(e.mhp * .5); e.eShield = 0; e.eShieldMax = 0; e.alive = true; e.s = "idle"; e.st2 = 30; e.stunned = 0;
                c.ReviveVfx(e.x, e.y, "#ffdd44", "부활!", new EnemyReviveVfxOpts { partN = 16, partSpd = 5, shake = 10, vfxSize = 140, flash = 3 });
                exit = DeathExit.Doppelganger; return null;
            }
            // 보스 부활 시스템 (확률+포인트 병행)
            if (e.ib)
            {
                e.deaths = Or(e.deaths, 0) + 1;
                if (IsDruidFinale(c, e)) c.DruidFinaleBoss = e;
                double bHell = HellOfStage(c.Stage);
                bool isH7 = bHell == 6;
                double bSuppress = c.EqAffix("antiRevive");
                bool hpZone;
                bSuppress += HolyPrisonBonus(c, e, out hpZone);
                double revCost = 10;
                if (bSuppress > 0) revCost += ToInt32(Math.Min(5, bSuppress * 10 + 2));
                if (hpZone) revCost += 3;
                if (P.hp >= P.mhp) revCost += 2;
                e._revPts = Or(e._revPts, 0) - revCost;
                if (e._revPts < 0) e._revPts = 0;
                bool doRevive = false;
                double revBase = 2.00 + c.Stage * 0.05;
                double revCh = Math.Max(0, revBase - (e.deaths - 1) * 0.15 - bSuppress);
                if (!IsDruidFinale(c, e) && e._revPts > 0 && c.Random() < revCh) doRevive = true;
                double revPct = ToInt32((IsDruidFinale(c, e) ? DruidFinaleReviveChance(e, bSuppress) : revCh) * 100);
                if (doRevive)
                {
                    c.AddText(e.x, e.y - 55, c.Translate("💀 ") + JsNumber(e.deaths) + c.Lang("차 부활! ", " Revive! ") + JsNumber(revPct) + "%", revPct >= 80 ? "#ff2244" : revPct >= 50 ? "#ff8844" : "#ffcc44", 50, null, null);
                    c.AddText(e.x, e.y - 70, c.Lang("부활력 -", "Revive Power -") + JsNumber(revCost) + " (" + JsNumber(e._revPts) + "/" + JsNumber(e._maxRevPts) + ")", revCost >= 13 ? "#ffdd44" : "#ffffff", 60, null, null);
                    if (bSuppress > 0) c.AddText(e.x, e.y - 85, c.Translate("✟ 신성력 억제! +") + JsNumber(ToInt32(Math.Min(5, bSuppress * 10 + 2))), "#ffffff", 50, null, null);
                }
                else if (e._revPts <= 0)
                {
                    if (!IsSi0DruidSink(c, e)) { c.AddText(e.x, e.y - 55, c.Translate("☠ 부활력 고갈!"), "#ff2222", 80, null, null); c.AddText(e.x, e.y - 40, "0/" + JsNumber(e._maxRevPts), "#ff4444", 50, null, null); }
                }
                else if (IsDruidFinale(c, e)) { c.AddText(e.x, e.y - 40, c.Lang("마지막 저항 판정 ", "Last stand chance ") + JsNumber(revPct) + "%", "#c8dfab", 60, null, null); }
                else if (bSuppress > 0) { c.AddText(e.x, e.y - 40, c.Translate("✟ 신성력 억제! (") + JsNumber(revPct) + "%)", "#ffffff", 60, null, null); }
                else if (!(IsSi0DruidSink(c, e) && Truthy(e._bossRevJudged))) { c.AddText(e.x, e.y - 40, c.Translate("부활 실패 (") + JsNumber(revPct) + "%)", "#bbbbbb", 40, null, null); }
                if (doRevive)
                {
                    // 풀피 부활 (HP 변동 없음)
                    e.hp = e.mhp; e.eShield = 0; e.eShieldMax = 0;
                    e._bossPhase = 0;
                    if (IsDruidFinale(c, e)) { e._druidAct = -1; e._druidStep = 0; e._druidRest = 0; e._druidTargetLocked = false; }
                    e.alive = true; e.s = "recover"; e.st2 = 90; e.stunned = 0;
                    e._bossRevJudged = true;
                    e._comboSeq = null; e._comboIdx = 0; e._feinting = false; e._delaying = 0;
                    e.maxPoise = ToInt32(e.maxPoise * 1.5); e.poise = ToInt32(e.maxPoise * 0.25);
                    e.reviveIframes = 90;
                    e.atk = ToInt32(e.atk * (isH7 ? 2 : 1.5));
                    e.speed = Math.Min(e.speed * 1.25, isH7 ? 2.0 : 1.6);
                    e.bossPatCd = Math.Max(isH7 ? 20 : 60, e.bossPatCd - 30);
                    // 남은 부활력 비율로 크기 축소
                    if (!Truthy(e._origR)) e._origR = e.r;
                    double rvScale = Math.Max(0.40, Or(e._revPts, 0) / Math.Max(1, Or(e._maxRevPts, 150)));
                    double vfxR1 = e.r;
                    e.r = Math.Max(10, ToInt32(e._origR.Value * rvScale));
                    double shrinkPct1 = ToInt32((1 - rvScale) * 100);
                    if (shrinkPct1 > 0) c.AddText(e.x, e.y - 85, "▼ " + JsNumber(shrinkPct1) + "%", "#aaffcc", 55, null, null);
                    // 부활 순간이동: 플레이어 뒤로 텔레포트 + 재소환 포탈 연출
                    double rvOx = e.x, rvOy = e.y, rvR = Or(e.r, 20);
                    double portalSc = (vfxR1 * 7) / 64;
                    c.PlayVfxAng("boss_revive_boom", rvOx, rvOy, portalSc, 5, 0, true);
                    c.AddBlastLight(rvOx, rvOy, rvR * 3, 12, 255, 80, 0);
                    double tpAng = N(P.facing) + Math.PI + ((c.Random() - .5) * .8);
                    double tpDist = 80 + e.deaths * 20;
                    double tpX = P.x + JsMath.Cos(tpAng) * tpDist, tpY = P.y + JsMath.Sin(tpAng) * tpDist;
                    if (c.CanMove(tpX, tpY, e.r)) { e.x = tpX; e.y = tpY; }
                    else { double sx, sy; if (SafePt(c, P.x + JsMath.Cos(tpAng) * 50, P.y + JsMath.Sin(tpAng) * 50, e.r, out sx, out sy)) { e.x = sx; e.y = sy; } }
                    c.PlayVfxAng("boss_revive_boom", e.x, e.y, portalSc, 5, 0, true);
                    c.AddTpBolt(rvOx, rvOy, e.x, e.y, 14, "#ff6600");
                    c.AddText(e.x, e.y - 50, c.Translate("🔥부활!"), "#ff4400", 40, null, null);
                    // 보스 숨김: 포탈 열리는 동안 투명 → 40f 후 grand VFX + 페이드인
                    e._tpWarnT = 0; e._tpWarnX = 0; e._tpWarnY = 0;
                    e._spawnT = 55; e._bossReviveVFXPending = 40;
                    c.PlaySample("boss_revive", 1.0, Rnd(c, 1.0, .08));
                    // 부활 충격파: 주변 밀어내기 + 데미지
                    double waveR = 100 + e.deaths * 30;
                    double waveDmg = ToInt32(e.atk * (.5 + e.deaths * .15));
                    if (Dst(P.x, P.y, e.x, e.y) < waveR && P.iframes <= 0 && P.s != "charge")
                    {
                        c.HurtPlayerTyped(waveDmg, new EnemyHurtPMeta { dtype = "magic" });
                        double ka = JsMath.Atan2(P.y - e.y, P.x - e.x); P.kb.x += JsMath.Cos(ka) * 12; P.kb.y += JsMath.Sin(ka) * 12;
                        c.AddText(P.x, P.y - 20, c.Translate("🌊충격파!"), "#ff4400", 30, null, null);
                    }
                    for (int k = 0; k < 36; k++)
                    {
                        double a = Math.PI * 2 * k / 36;
                        c.PoolPart(e.x + JsMath.Cos(a) * 20, e.y + JsMath.Sin(a) * 20, JsMath.Cos(a) * (isH7 ? 10 : 7), JsMath.Sin(a) * (isH7 ? 10 : 7), "#ff4400", 3 + c.Random() * 3, 18 + c.Random() * 8, null, null, null);
                    }
                    // 2차 부활부터: 분노 폭발 (전방위 투사체)
                    if (e.deaths >= 2)
                    {
                        double bCnt = 8 + e.deaths * 4;
                        for (int bi = 0; bi < bCnt; bi++)
                        {
                            double ba = Math.PI * 2 * bi / bCnt;
                            bool isRBr = bi % 2 == 0; int rnbHr = ToInt32(bi * 360 / bCnt); string rnbCr = isRBr ? "#cc1100" : ("hsl(" + rnbHr + ",100%,60%)");
                            double mOff = Or(e.r, 12) * .7; double mAng = Or(ba, Or(e.facing, 0));
                            double rmx = e.x + JsMath.Cos(mAng) * mOff, rmy = e.y + JsMath.Sin(mAng) * mOff;
                            c.SpawnBossShot(e, new EnemyBossShot
                            {
                                x = rmx, y = rmy, vx = JsMath.Cos(ba) * 3, vy = JsMath.Sin(ba) * 3, dmg = ToInt32(e.atk * (isRBr ? .8 : .6)), el = e.el, friendly = false, life = 600, ml = 600, col = rnbCr, sz = isRBr ? 2.0 : 1.8,
                                redBean = isRBr ? (bool?)true : null, homing = isRBr ? (bool?)true : null
                            });
                        }
                        c.AddText(e.x, e.y - 65, c.Translate("💀 분노 폭발!"), "#ff0000", 50, null, null);
                    }
                    // 10% 동반부활: 이전에 처치한 보스 중 랜덤 1마리 스폰
                    if (c.KilledBosses != null && c.KilledBosses.Count > 0 && c.Random() < 0.1)
                    {
                        var pool = new List<double>(); foreach (var et in c.KilledBosses) if (et != e.etype) pool.Add(et);
                        if (pool.Count > 0)
                        {
                            double cet = pool[ToInt32(c.Random() * pool.Count)];
                            double sa = c.Random() * Math.PI * 2; double sd = 120 + c.Random() * 60;
                            double sx = e.x + JsMath.Cos(sa) * sd, sy = e.y + JsMath.Sin(sa) * sd;
                            if (!c.CanMove(sx, sy, 20)) { double px, py; if (SafePt(c, e.x, e.y, 20, out px, out py)) { sx = px; sy = py; } }
                            var ce = c.MkEn(sx, sy, (int)c.Stage, 0, true, cet, 0);
                            ce.mhp = ToInt32(e.mhp * .4); ce.hp = ce.mhp; ce.atk = ToInt32(e.atk * .5); ce.deaths = 0;
                            c.Ens.Add(ce);
                            c.AddText(sx, sy - 30, c.Translate("👻 동반부활!"), "#cc44ff", 50, null, null); c.AddParts(sx, sy, "#cc44ff", 12);
                        }
                    }
                    string revTxt = isH7 ? "👿 " + JsNumber(e.deaths) + "차 부활! (×" + JsNumber(Math.Pow(2, e.deaths)) + ")" : "💀 " + JsNumber(e.deaths) + "차 부활! (×" + JsNumber(Math.Pow(2, e.deaths)) + ")";
                    string revCol = isH7 ? "#ff0044" : "#ff2244";
                    c.AddText(e.x, e.y - 35, revTxt, revCol, 70, null, null);
                    c.AddText(e.x, e.y - 20, "HP " + JsNumber(e.mhp), isH7 ? "#ff4488" : "#ff6666", 50, null, null);
                    exit = DeathExit.BossRevive; return null; // 죽지 않음
                }
            }
            // 일반몹 부활 (1회 제한) — 부활력 vs 억제력
            if (!e.ib && !Truthy(e._revived) && !Truthy(e._isGhoul))
            {
                double revPow = (e.elite > 0 ? (e.elite >= 2 ? .6 : .5) : .5) + ToInt32(Or(e.lv, 1) / 100) * 0.10;
                double suppress = c.EqAffix("antiRevive");
                bool zoneFound;
                suppress += HolyPrisonBonus(c, e, out zoneFound);
                double finalRev = Math.Max(0, revPow - suppress);
                if (finalRev > 0 && c.Random() < finalRev)
                {
                    e._revived = true; e._reviveTimer = e.elite > 0 ? 120 : 90; e._reviveX = e.x; e._reviveY = e.y;
                    e._reviveAsGhoul = c.Random() < 0.5;
                }
                else if (suppress > 0) { c.AddText(e.x, e.y - 30, c.Translate("✟ 신성력 억제!"), "#ffffff", 50, null, null); }
            }
            // 보스: 부활력 남아있으면 3초 카운트다운 → 부활률 공식 + 포인트 체크
            if (e.ib && !Truthy(e._bossRevJudged))
            {
                e._bossRevJudged = true; e._reviveTimer = 180; e._reviveX = e.x; e._reviveY = e.y;
                double rv2Base = 1.50 + c.Stage * 0.05;
                double rv2Sup = c.EqAffix("antiRevive");
                bool zoneFound2;
                rv2Sup += HolyPrisonBonus(c, e, out zoneFound2);
                if (Or(e._revPts, 0) <= 0) { e._bossRevChance = 0; e._bossRevRoll = 1; }
                else
                {
                    e._bossRevChance = IsDruidFinale(c, e) ? DruidFinaleReviveChance(e, rv2Sup) : Math.Max(0, rv2Base - Or(e.deaths, 0) * 0.25 - rv2Sup);
                    e._bossRevRoll = c.Random();
                }
                e._bossRevived = true;
            }
            // 어픽스: killSlayer (처치보너스) — 처치 시 3초간 뎀업
            if (c.EqAffix("killSlayer") > 0) { P._killBuff = 180; P._killMul = c.EqAffix("killSlayer"); }
            // On-Kill 어픽스: 처치 시 회복/폭발/이속
            {
                double okH = c.EqAffix("onKillHeal") + c.EqAffix("hpOnKill"); if (okH > 0) P.hp = Math.Min(P.mhp, P.hp + okH);
                double okM = c.EqAffix("onKillMana"); if (okM > 0) P.mp = Math.Min(P.mmp, P.mp + okM);
                double okS = c.EqAffix("onKillStam"); if (okS > 0) P.st = Math.Min(N(P.mst), N(P.st) + okS);
                double okSh = c.EqAffix("shieldOnKill"); if (okSh > 0) P.shield = Math.Min(N(P.mshield), N(P.shield) + okSh);
                double okSp = c.EqAffix("onKillSpeed"); if (okSp > 0) { P._okSpdBuff = 120; P._okSpdMul = okSp; }
            }
            // 유니크 On-Kill 효과
            if (c.UEq("_uMaceExplode") > 0)
            {
                double exD = ToInt32(e.mhp * c.UEq("_uMaceExplode")); var exQ = c.ShQuery(e.x, e.y, 150);
                for (int ei = 0; ei < exQ.Count; ei++)
                {
                    if (exQ[ei].alive && exQ[ei] != e) c.HurtEnemy(exQ[ei], exD, JsMath.Atan2(exQ[ei].y - e.y, exQ[ei].x - e.x), true, new EnemyHurtOpts { dot = true }, null);
                }
                c.AddText(e.x, e.y - 20, c.Translate("💥유니크 폭발!"), "#ff4466", 40, null, null);
            }
            // 유니크 u_d05 귀환 연료
            if (Truthy(e._uqGwExp) && Or(c.PlayTime, 0) < e._uqGwExp)
            {
                e._uqGwExp = 0;
                double gfV = c.UEq("_uGhostFuel");
                if (gfV > 0 && N(c.UqS.gwRefund) < 27)
                {
                    double gfAdd = Math.Min(45 * gfV, 27 - N(c.UqS.gwRefund)); c.UqS.gwRefund = N(c.UqS.gwRefund) + gfAdd;
                    c.HarpGauge = Math.Min(c.HarpGaugeMax, c.HarpGauge + gfAdd);
                    c.AddText(e.x, e.y - 45, c.Translate("기동 회수!") + " +" + JsNumber(ToInt32(gfAdd)), "#44ddff", 28, null, null);
                }
            }
            // 유니크 u_d08 잔상 추격
            if (c.UqHitCtx == "chainSlash" && !Truthy(c.UqS.csEchoUsed) && (e.bleed > 0 || e.bleedT > 0) && c.UEq("_uChainBleedEcho") > 0)
            {
                c.UqS.csEchoUsed = true;
                double ceD = Math.Max(1, ToInt32(dmg * c.UEq("_uChainBleedEcho")));
                EnemySpawn ceT = null; double ceB = 600; var ceQ = c.ShQuery(e.x, e.y, 600);
                for (int ci3 = 0; ci3 < ceQ.Count; ci3++) { var oe = ceQ[ci3]; if (!oe.alive || oe == e) continue; double od = Dst(e.x, e.y, oe.x, oe.y); if (od < ceB) { ceB = od; ceT = oe; } }
                if (ceT != null)
                {
                    double ca2 = JsMath.Atan2(ceT.y - e.y, ceT.x - e.x);
                    var pp = c.GetPProj(); pp.x = e.x; pp.y = e.y; pp.vx = JsMath.Cos(ca2) * 10; pp.vy = JsMath.Sin(ca2) * 10;
                    pp.dmg = ceD; pp.el = 0; pp.maxDist = 900; pp.dist = 0; pp.r = 6; pp.stagger = 0; pp.kb = 0;
                    pp.pierce = 0; pp.pierceMax = 0; pp._pierceRate = 0; pp.magic = true; pp.bladeShard = true; pp._uqEcho = true; pp.col = "#cc4444";
                    c.PProjs.Add(pp);
                    c.AddText(e.x, e.y - 35, c.Translate("잔상 칼날!"), "#cc4444", 30, null, null);
                }
            }
            // 유니크 u_d13 번지는 뿌리
            if (c.UqFzCtx != null && c.UqFzCtx.type == "spikeTrap" && !Truthy(c.UqFzCtx._uqChild) && !Truthy(c.UqFzCtx._pillarSpike) && !Truthy(c.UqFzCtx._uqSpawned) && c.UEq("_uTrapOffshoot") > 0)
            {
                c.UqFzCtx._uqSpawned = true;
                if (c.UqZoneQ == null) c.UqZoneQ = new List<EnemyUqZone>();
                c.UqZoneQ.Add(new EnemyUqZone { x = e.x, y = e.y, r = 150, t = 0, maxT = 180, dmg = Math.Max(1, ToInt32(N(c.UqFzCtx.dmg) * c.UEq("_uTrapOffshoot"))), el = 0, lv = Or(c.UqFzCtx.lv, 1), type = "spikeTrap", _uqChild = true });
                c.AddText(e.x, e.y - 35, c.Translate("자식 덫!"), "#88cc44", 30, null, null);
            }
            // 전설 On-Kill 효과
            if (c.LEq("_lDaggerKill") > 0) { P._okSpdBuff = Math.Max(Or(P._okSpdBuff, 0), 180); P._okSpdMul = Math.Max(Or(P._okSpdMul, 0), .40); P._lNextCrit = 1; }
            if (c.LEq("_lRingKill") > 0) { double lrM = c.RageMax(); P.rage = Math.Min(lrM, N(P.rage) + Math.Max(1, ToInt32(lrM * c.LEq("_lRingKill")))); }
            // (atkEl===EL.F||(opts&&opts.beam))&&!(opts&&opts.explode)  — JS tri-state
            bool? burnA = atkEl == 1 ? (bool?)true : (opts == null ? null : opts.beam);
            bool? isBurnDeath = Truthy(burnA) ? (bool?)!Truthy(opts == null ? null : opts.explode) : burnA;
            bool isWhirlKill = P.s == "whirlwind" && !Truthy(opts == null ? null : opts.detonate);
            c.AtkTicketRelease(e); e.alive = false; c.Kills++; c.StageKills = Or(c.StageKills, 0) + 1; c.RegKill(e); c.PetOnKill(e);
            // [STY-D9] 1-1 드루이드의 마지막 사망(부활 없음 확정)만 침강 도주로 표시
            bool sinkDruid = IsSi0DruidSink(c, e) && !(Gt0(e._reviveTimer) && Truthy(e._bossRevived) && (e._bossRevRoll ?? 1) < Or(e._bossRevChance, 0));
            // _druidSinkStart(e): since web 05d519db7 / 2c3c380ec it also plays the sink sound (_playDruidSfx = playSample with a _r pitch), sets G._druidFled and says the sink0 line
            if (sinkDruid) { c.PlaySample("druid_sink", .55, Rnd(c, 1, .04)); e._sinkDruid = true; c.DruidFled = true; e._corpseSpawned = true; c.DruidSink = new EnemyDruidSink { x = e.x, y = e.y, r = e.r, t = 0 }; c.BossLine("sink0"); }
            // 최신 원본은 스테이지 범위를 제한하지 않고 대사 키가 있는 보스를 표시한다.
            else if (e.ib && !Truthy(e._fmKind) && !IsDruidFinale(c, e) && !(Gt0(e._reviveTimer) && Truthy(e._bossRevived) && (e._bossRevRoll ?? 1) < Or(e._bossRevChance, 0)))
                c.BossLine("die" + JsNumber(c.Stage));
            // 버스트루프 광역 사망음 카운터
            bool isBurnT = Truthy(isBurnDeath);
            if (opts != null && Truthy(opts._blastKill) && c.BlDeathSndQ != null)
            {
                string dKey = e.ib ? "death_boss" : ("death_" + (e.etype < 10 ? "slime" : "demon"));
                c.BlDeathSndQ.Add(new EnemyDeathSnd { key = dKey, vol = 0.6, rate = Rnd(c, 1, .1) });
                c.DeathFx(e.x, e.y, e.r, e.col, e.ib, true, e.etype, sinkDruid ? "druid_sink" : null);
            }
            else
            {
                c.DeathFx(e.x, e.y, e.r, e.col, e.ib, isBurnDeath, e.etype, sinkDruid ? "druid_sink" : null);
            }
            if (!Gt0(c.NoHitStopT)) { c.HitStop = ToInt32(4 * c.OptHitStop / 100); }
            // 콤보 시스템: 일반몹 +1초(최대20초), 보스 +30초(최대30초)
            c.Combo++;
            if (e.ib) { c.ComboTimer = Math.Min(1800, c.ComboTimer + 1800); }
            else { c.ComboTimer = Math.Min(1200, c.ComboTimer + 60); }
            if (c.Combo > c.ComboMax) c.ComboMax = c.Combo;
            if (c.Combo >= 1000 && c.Combo % 1000 == 0)
            {
                double cbPct = ToInt32((ToInt32(c.Combo / 100) * 0.05 + Math.Max(0, (c.OptDiff.HasValue ? c.OptDiff.Value : 5) - 5) * 0.10) * 100);
                c.AddText(P.x, P.y - 40, "🔥 " + JsNumber(c.Combo) + " COMBO!" + (cbPct > 0 ? " +" + JsNumber(cbPct) + c.Lang("%보상", "% Bonus") : ""), "#ffaa00", 50, null, null);
            }
            double killAng = ang.HasValue ? ang.Value : JsMath.Atan2(e.y - P.y, e.x - P.x);
            if (!isWhirlKill && !sinkDruid) c.SpawnLargeMonsterDeathFx(e, killAng);
            // 시체 잔해
            if (!sinkDruid) { double cp = Math.Min(8, dmg / Math.Max(1, e.mhp) * 20); c.AddCorpse(e, killAng, cp); }
            // 화염/빔 사망 → 추가로 불타는 시체 + 전용 사운드
            if (isBurnT && !sinkDruid)
            {
                c.AddBurnCorpse(e);
                string burnKey = opts != null && Truthy(opts.beam) ? new[] { "fire_death", "fire_death2", "fire_death3" }[(int)(c.Random() * 3)] : "fire_hit";
                c.PlaySample(burnKey, .5, Rnd(c, 1, .15));
                c.PlayVfxAng("burn_death", e.x, e.y - e.r * 0.3, Math.Max(0.15, e.r * 2.2 / 211), 4, 0, false);
            }
            // gore 파편 + 사망 임팩트
            if (!sinkDruid)
            {
                bool gL = e.ib || e.r >= 18;
                var gCommon = new[] { "flesh", "flesh", "flesh", "blood", "blood", "intestine", "organ", "tendon" };
                var gRare = new[] { "bone", "eye", "skull", "heart", "finger", "tooth" };
                var gPick = c.Random() < .8 ? gCommon : gRare;
                c.AddGorePiece(e.x, e.y, gPick[ToInt32(c.Random() * gPick.Length)]);
                if (gL) c.AddGorePiece(e.x, e.y, c.Random() < .5 ? "intestine" : "organ");
                c.AddDeathImpact(e.x, e.y, e.r);
            }
            if (e._fromHole.HasValue && e._fromHole.Value >= 0 && e._fromHole.Value < c.SpawnHoles.Count && e._fromHole.Value == Math.Floor(e._fromHole.Value) && c.SpawnHoles[(int)e._fromHole.Value] != null)
                c.SpawnHoles[(int)e._fromHole.Value].alive = N(c.SpawnHoles[(int)e._fromHole.Value].alive) - 1;
            if (sinkDruid) { c.FlashT = 3; c.FlashCol = "#ff4400"; } // 문구 없이 섬광만
            else if (e.ib && Truthy(e._bossRevJudged)) { c.AddText(e.x, e.y - 45, c.Translate("💀 부활 판정 중..."), "#ff8844", 90, null, null); c.FlashT = 3; c.FlashCol = "#ff4400"; }
            else if (e.ib) { c.AddText(e.x, e.y - 45, c.Translate("☠ 완전 사망!"), "#ff4400", 90, null, null); c.FlashT = 6; c.FlashCol = "#ffffff"; c.ChromaT = 5; }
            // 문지기 사망 → 게이트 해방 연출
            if (Truthy(e._isGateGuard))
            {
                c.AddText(e.x, e.y - 50, c.Translate("⚔ 문지기 처치!"), "#ffaa00", 80, null, null);
                c.Shake(16); c.FlashT = 4; c.FlashCol = "#ffaa00";
                c.SfxVictory();
                for (int k = 0; k < 30; k++)
                {
                    double a = Math.PI * 2 * k / 30; double v = 4 + c.Random() * 6;
                    c.PoolPart(e.x + JsMath.Cos(a) * e.r, e.y + JsMath.Sin(a) * e.r, JsMath.Cos(a) * v, JsMath.Sin(a) * v, "#ffaa00", 2 + c.Random() * 3, 20 + c.Random() * 15, null, null, null);
                }
                c.GateGuardSet = false; c.GateGuardKilled = true;
                c.BossGateOpen = true; c.ShDirty = true; c.BuildMapCache();
            }
            exit = DeathExit.Continue;
            return new EnemyHurtDeathResult { __cont = true, _isBurnDeath = isBurnDeath, _isWhirlKill = isWhirlKill, _sinkDruid = sinkDruid, _killAng = killAng };
        }
    }
}
