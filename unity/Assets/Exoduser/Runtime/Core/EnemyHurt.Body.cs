using System;

namespace Exoduser.UnityPort.Core
{
    // Port of the middle of the web hurtE (CX-04b): from "// ═══ 데미지 → HP 직행 ═══" up to (not including) `if(e.hp<=0){`.
    // HP application, stats/peak, leech affixes, on-hit statuses, counter-attack switch, damage text/blood/flash/hit-stun/hit-stop/impact,
    // on-hit DoT affixes, lightChain/darkCurse/chainTarget, ice freeze gauge, knockback, poise (_poiseHit) with its stagger explosions.
    // Values and the ORDER of the injected calls and Math.random draws equal the web (blood-splash draws included).
    // Written by hand from the original text; unity/Tools/enemy-hurt-oracle (H2 + chain cases) compares it with the original executed in Node.
    public static partial class EnemyHurt
    {
        const double TxtBudget = 12; // _TXT_BUDGET
        static readonly string[] BloodColsWhirl = { "#aa0000", "#880000", "#cc1111" };
        static readonly string[] BloodCols = { "#aa0000", "#880000", "#cc1111", "#660000" };

        // _poiseHit(e, amt) (game.html 20037): true when the poise broke (stagger). The label argument is always undefined here.
        public static bool PoiseHit(EnemyHurtContext c, EnemySpawn e, double amt)
        {
            if (e == null || !e.alive || amt <= 0) return false;
            if (e.ib && Gt0(e._pImmune)) return false;
            e.poise -= amt;
            e.poiseR = 0;
            if (e.poise <= 0)
            {
                e.poise = 0;
                double stunT = e.ib ? 90 : 180;
                e.stunned = Math.Max(e.stunned, stunT);
                e._maxStunned = Math.Max(Or(e._maxStunned, 0), stunT);
                if (e.ib) e._pImmune = 300;
                if (c.UqScCtx != null && !Truthy(c.UqScCtx._uqRef))
                {
                    double spV = c.UEq("_uSkyPoiseRefund");
                    if (spV > 0) { c.UqScCtx._uqRef = true; c.TickSkyCrusherRecharge(spV); c.AddText(e.x, e.y - 40, c.Translate("쿨 회수!"), "#d8b878", 30, null, null); }
                }
                if (c.UEq("_uPoiseOrbFracture") > 0) c.UqS.poiseOrbT = 300; // _uqS is always defined in the game; a null context throws like the web
                c.SfxGroggy();
                c.AddText(e.x, e.y - 22, c.Translate("💥 그로기!"), "#ff8800", 60, null, null);
                if (!Gt0(c.NoHitStopT)) c.SlowMo = 20;
                for (int j = 0; j < 14; j++) { double a = Math.PI * 2 * j / 14; c.PoolPart(e.x, e.y, JsMath.Cos(a) * 7, JsMath.Sin(a) * 7, "#ffaa44", 3 + c.Random() * 4, 18, null, null, null); }
                return true;
            }
            return false;
        }

        // Runs the middle part with the values CX-04a's Head returned. Never returns early.
        public static EnemyHurtBodyResult Body(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtHeadResult h)
        {
            var P = c.P;
            double dmg = h.dmg, atkEl = h.atkEl, kbM = h.kbM, psM = h.psM;
            bool? isDot = h.isDot; bool dotT = Truthy(isDot); bool isCrit = h._isCrit; bool? isMag = h._isMagicDmg;
            if (dmg > 0)
            {
                if (c.HasStats) { c.StatDmgDealt += dmg; if (dmg > c.StatMaxHit) c.StatMaxHit = dmg; }
                // 5-second rolling best hit
                if (c.DmgPeak == null) c.DmgPeak = new EnemyDmgPeak { val = 0, t = 0 };
                if (dmg > c.DmgPeak.val) { c.DmgPeak.val = dmg; c.DmgPeak.t = 300; }
                // leech affixes
                if (!dotT)
                {
                    double ll = c.EqAffix("lifeLeech") + (c.EqAffix("injuredLeech") > 0 && P.hp <= P.mhp * .35 ? c.EqAffix("injuredLeech") : 0);
                    if (ll > 0) P.hp = Math.Min(P.mhp, P.hp + dmg * ll);
                    double ml = c.EqAffix("manaLeech"); if (ml > 0) P.mp = Math.Min(P.mmp, P.mp + dmg * ml);
                    double sl = c.EqAffix("stLeech"); if (sl > 0) P.st = Math.Min(N(P.mst), N(P.st) + dmg * sl);
                    double loh = c.EqAffix("lifeOnHit"); if (loh > 0) P.hp = Math.Min(P.mhp, P.hp + loh);
                    if (c.UEq("_uAxeLeech") > 0 && (e.bleed > 0 || e.bleedT > 0)) P.hp = Math.Min(P.mhp, P.hp + ToInt32(dmg * c.UEq("_uAxeLeech")));
                }
                // on-hit status affixes (one Math.random per active affix, in this order)
                if (!dotT)
                {
                    double ohFire = c.EqAffix("fireOnHit"); if (ohFire > 0 && c.Random() < ohFire) { e.burnT = Math.Max(e.burnT, 180); e.burnPool = Or(e.burnPool, 0) + dmg * .3; }
                    double ohIce = c.EqAffix("iceOnHit"); if (ohIce > 0 && c.Random() < ohIce) { e._freezeGauge = Or(e._freezeGauge, 0) + 30; if (e._freezeGauge.Value >= 100 && !Truthy(e._freezeImmune)) { e._frozen = 180; e._freezeGauge = 0; } }
                    double ohLtn = c.EqAffix("lightOnHit"); if (ohLtn > 0 && c.Random() < ohLtn) { e._shockT = Math.Max(Or(e._shockT, 0), 120); e._shockMul = Math.Max(Or(e._shockMul, 0), .15); }
                    double ohDark = c.EqAffix("darkOnHit"); if (ohDark > 0 && c.Random() < ohDark) { e._cursed = Math.Max(Or(e._cursed, 0), 180); }
                    double ohPsn = c.EqAffix("poisonOnHit"); if (ohPsn > 0 && c.Random() < ohPsn) { e.poisonT = Math.Max(e.poisonT, 300); e.poisonPool = Or(e.poisonPool, 0) + dmg * .2; }
                    double ohBld = c.EqAffix("onHitBleed"); if (ohBld > 0 && c.Random() < ohBld) { e.bleedT = Math.Max(e.bleedT, 300); e.bleedPool = Or(e.bleedPool, 0) + dmg * .25; }
                    double ohStn = c.EqAffix("onHitStun"); if (ohStn > 0 && c.Random() < ohStn) { e.stunned = Math.Min(180, Math.Max(e.stunned, 60)); }
                    double ohFrz = c.EqAffix("onHitFreeze"); if (ohFrz > 0 && c.Random() < ohFrz) { e._freezeGauge = Or(e._freezeGauge, 0) + 50; if (e._freezeGauge.Value >= 100 && !Truthy(e._freezeImmune)) { e._frozen = 180; e._freezeGauge = 0; } }
                }
                e._alerted = true; // being hit makes it notice the player at any distance
                // immediate counter: recover/idle switch to combat
                if (!dotT && !e.ib) { if (e.s == "recover") { e.s = "idle"; e.st2 = 0; } else if (e.s == "idle" && e.st2 > 5) { e.st2 = 5; } }
                e.hp -= dmg;
                c.DpsDmg += dmg;
                // damage text: single hits only (no DOT / channelled)
                bool quiet2 = opts != null && (Truthy(opts.bladeShard) || Truthy(opts.maliceHunt) || Truthy(opts.iceBlade) || Truthy(opts.beam) || Truthy(opts.dot) || Truthy(opts.ltnChaser) || Truthy(opts.lightning));
                if (!dotT && !quiet2 && P.s != "whirlwind")
                {
                    if (c.DmgPeakShow == null || dmg > c.DmgPeakShow.dmg) c.DmgPeakShow = new EnemyDmgPeakShow { x = e.x, y = e.y, dmg = dmg, crit = isCrit };
                }
                if (P.s == "whirlwind" && !(opts != null && Truthy(opts.detonate)))
                {
                    // whirlwind: the hit-arc creates the slash impact per enemy; here only blood
                    e._hitFlash = 4;
                    if (ang.HasValue && c.OptParts >= 40)
                    {
                        double bN = Math.Min(4, ToInt32(1 + dmg * 0.01) * c.OptParts / 100);
                        for (int bi = 0; bi < bN; bi++)
                        {
                            double ba = ang.Value + (c.Random() - .5) * .8; double bs = 1 + c.Random() * 2;
                            c.PoolPart(e.x + (c.Random() - .5) * 6, e.y + (c.Random() - .5) * 6, JsMath.Cos(ba) * bs, JsMath.Sin(ba) * bs - c.Random(), BloodColsWhirl[ToInt32(c.Random() * 3)], 1.5 + c.Random() * 2, 8 + c.Random() * 6, 0, 0, .12);
                        }
                    }
                }
                else
                {
                    bool quiet = opts != null && (Truthy(opts.bladeShard) || Truthy(opts.maliceHunt) || Truthy(opts.iceBlade) || Truthy(opts.beam) || Truthy(opts.ltnChaser) || Truthy(opts.lightning));
                    c.TxtPerFrame++;
                    bool overBudget = c.TxtPerFrame > TxtBudget;
                    if (!quiet && !overBudget)
                    {
                        c.AddParts(e.x, e.y, e.col, Math.Min(ToInt32(dmg / 3 * c.OptParts / 100), overBudget ? 0 : 8));
                        // blood splash along the attack direction
                        if (ang.HasValue)
                        {
                            double bN = Math.Min(12, ToInt32(2 + dmg * 0.04) * c.OptParts / 100);
                            for (int bi = 0; bi < bN; bi++)
                            {
                                double ba = ang.Value + (c.Random() - .5) * .8;
                                double bs = 1.5 + c.Random() * 3 + dmg * 0.02;
                                c.PoolPart(e.x + (c.Random() - .5) * 6, e.y + (c.Random() - .5) * 6, JsMath.Cos(ba) * bs, JsMath.Sin(ba) * bs - c.Random() * 1.5,
                                    BloodCols[ToInt32(c.Random() * 4)], 1.5 + c.Random() * 2.5, 12 + c.Random() * 10, 0, 0, .12);
                            }
                        }
                        e._hitFlash = 6;
                        // hit stun: normal 8 frames, elite 4, boss 0
                        if (!e.ib && e.s == "idle") { e._hitStun = e.elite > 0 ? 4 : 8; }
                        c.FlashCol = "#ffffff"; c.FlashT = 0.08;
                        if (!overBudget) { if (!Gt0(c.NoHitStopT)) c.HitStop = Math.Max(c.HitStop, 5); c.Shake(Math.Min(4, 12 - c.ImpPerFrame)); }
                        if (ang.HasValue && !overBudget && !Truthy(isMag) && !(opts != null && Truthy(opts.noImpact)))
                        {
                            string impType = (opts != null && Truthy(opts.explode)) ? "explosion" : "slash";
                            c.AddImpact(e.x, e.y, 0, ang.Value, impType, e.ib, c.ImpPerFrame > 3);
                            if (opts != null && Truthy(opts.explode) && !(c.ImpPerFrame > 3)) c.AddBoom(e.x, e.y, 20 + (e.ib ? 15 : 0), 16, "fire");
                        }
                    }
                }
                // on-hit DoT affixes
                if (!dotT)
                {
                    double apDot = c.EqAffix("poisonDot"), afDot = c.EqAffix("fireDot"), aiDot = c.EqAffix("iceDot");
                    if (apDot > 0)
                    {
                        e.poison = 1; e.poisonT = Math.Max(e.poisonT, 300); e.poisonStk = Math.Min(10, e.poisonStk + 1); if (e.poisonStk < 10) e._poisonPool = e._poisonPool + c.PDotPool() * dmg * 0.10;
                    }
                    if (afDot > 0)
                    {
                        e.burnT = 180; e.burnStk = Math.Min(10, e.burnStk + 1); if (e.burnStk < 10) e._burnPool = e._burnPool + c.PDotPool() * dmg * 0.10;
                    }
                    if (aiDot > 0 && !e.ib)
                    {
                        if (!Truthy(e._iceDotT) && c.TxtPerFrame < TxtBudget) c.AddText(e.x, e.y - 15, c.Translate("빙결!"), "#88ccff", 20, null, null);
                        e._iceDotT = Math.Max(Or(e._iceDotT, 0), 60 + ToInt32(aiDot * 5));
                        e._iceDotDmg = ToInt32(e.mhp * (.008 + aiDot * .0002));
                        e._iceSlowed = true;
                    }
                    // lightChain: chain damage to up to 2 nearby enemies
                    int lcD = ToInt32(c.EqAffix("lightChain"));
                    if (lcD > 0) { var lcN = c.ShQuery(e.x, e.y, 120); int lc = 0; for (int li = 0; li < lcN.Count && lc < 2; li++) { var le = lcN[li]; if (le != e && le.alive) { c.HurtEnemy(le, lcD, 0, true, new EnemyHurtOpts { dot = true, shieldHit = true }, ElL); lc++; } } }
                    // darkCurse
                    double dcP = c.EqAffix("darkCurse");
                    if (dcP > 0 && c.Random() < dcP) { e._cursed = 180; c.AddText(e.x, e.y - 15, c.Translate("저주!"), "#9933cc", 20, null, null); }
                    // chainTarget: extra targets
                    int ctN = ToInt32(c.EqAffix("chainTarget"));
                    if (ctN > 0) { var ctQ = c.ShQuery(e.x, e.y, 100); int ct = 0; for (int ci = 0; ci < ctQ.Count && ct < ctN; ci++) { var ce = ctQ[ci]; if (ce != e && ce.alive) { c.HurtEnemy(ce, ToInt32(dmg * .3), 0, true, new EnemyHurtOpts { dot = true, shieldHit = true }, atkEl); ct++; } } }
                }
                // ice freeze gauge: EL.I (2) hits accumulate
                if (atkEl == 2 && Or(e._frozen, 0) <= 0 && Or(e._frozenImmune, 0) <= 0)
                {
                    if (!Truthy(e._freezeMax)) e._freezeMax = e.ib ? 500 : 100;
                    if (!Truthy(e._freezeGauge)) e._freezeGauge = 0;
                    double iceResMul = Gt0(e._iceResDown) ? 1.5 : 1;
                    double iceShardMul = 1 + Or(e._iceShardRes, 0);
                    double fzAdd = (e.ib ? dmg * .3 : dmg) * iceResMul * iceShardMul;
                    e._freezeGauge = Math.Min(e._freezeMax.Value, e._freezeGauge.Value + fzAdd);
                    if (e._freezeGauge.Value >= e._freezeMax.Value)
                    {
                        e._frozen = 180;
                        e._freezeGauge = 0;
                        if (c.TxtPerFrame < TxtBudget) c.AddText(e.x, e.y - 25, c.Translate("❄프리즌!"), "#44ddff", 50, null, null);
                        c.AddParts(e.x, e.y, "#88eeff", 12);
                    }
                }
            }
            // knockback (kbM applied)
            bool isBoss = e.ib;
            double finalKbM = isBoss ? 0.05 : kbM;
            bool isRanged = (opts != null && Truthy(opts.beam)) || (opts != null && opts.maxDist.HasValue && !Truthy(opts.magic)) || (opts != null && (Truthy(opts.bladeShard) || Truthy(opts.bladeOrb) || Truthy(opts.normalBow))) || atkEl == ElL;
            bool? isMH = opts == null ? (bool?)null : (Truthy(opts.maliceHunt) ? true : opts.mhBlade);
            bool? isBB = opts == null ? (bool?)null : opts.blueBean;
            bool? isMagicProj = opts == null ? (bool?)null : opts.magic;
            double kbScale = Truthy(isMagicProj) ? .2 : 1;
            bool? noKB = opts == null ? (bool?)null : opts.noKB;
            if (ang.HasValue && !isRanged && !dotT && !Truthy(isMH) && !Truthy(isBB) && !Truthy(noKB))
            {
                double kbAmt = Math.Min(dmg * .25 * finalKbM * kbScale, 15 * finalKbM * kbScale);
                // legendary club: knockback x, wall hit deals 50% extra
                if (c.LEq("_lClubKB") > 0 && !(opts != null && Truthy(opts._lClubWall)))
                {
                    kbAmt *= c.LEq("_lClubKB");
                    if (!e.ib && kbAmt > 2 && !c.CanMove(e.x + JsMath.Cos(ang.Value) * (e.r + 24), e.y + JsMath.Sin(ang.Value) * (e.r + 24), e.r))
                    {
                        c.HurtEnemy(e, Math.Max(1, ToInt32(dmg * .5)), null, true, new EnemyHurtOpts { dot = true, shieldHit = true, _lClubWall = true }, null);
                        if (e.alive) c.AddText(e.x, e.y - 35, c.Translate("💥벽충돌!"), "#ffaa44", 30, null, null);
                    }
                }
                // enemies outside the viewport move instantly instead of getting a knockback vector
                bool kbInView = e.ib || Gt0(e.hurt) || (e.x > c.CamX - c.ViewW / 2 - 300 && e.x < c.CamX + c.ViewW / 2 + 300 && e.y > c.CamY - c.ViewH / 2 - 300 && e.y < c.CamY + c.ViewH / 2 + 300);
                if (kbInView) { e.kb.x += JsMath.Cos(ang.Value) * kbAmt; e.kb.y += JsMath.Sin(ang.Value) * kbAmt; }
                else { double nx = e.x + JsMath.Cos(ang.Value) * kbAmt * 3, ny = e.y + JsMath.Sin(ang.Value) * kbAmt * 3; if (c.CanMove(nx, ny, e.r)) { e.x = nx; e.y = ny; } }
            }
            // poise (stagger) damage: poiseHit only
            if (!dotT && (opts != null && Truthy(opts.poiseHit)) && !(isBoss && Gt0(e._pImmune)))
            {
                double amt = ToInt32(dmg * psM);
                if (isBoss) amt = ToInt32(amt * (atkEl > 0 ? 0.2 : 0.5));
                if (c.EqAffix("staggerBns") > 0) amt += ToInt32(c.EqAffix("staggerBns"));
                if (PoiseHit(c, e, amt))
                {
                    if (c.EqAffix("staggerExplosion") > 0)
                    {
                        double seD = ToInt32(dmg * c.EqAffix("staggerExplosion")); var seQ = c.ShQuery(e.x, e.y, 100);
                        for (int si = 0; si < seQ.Count; si++) { var se = seQ[si]; if (se != e && se.alive) c.HurtEnemy(se, seD, 0, true, new EnemyHurtOpts { dot = true, shieldHit = true }, atkEl); }
                    }
                    // legendary hammer / mace: stagger shockwave
                    double lShk = Math.Max(c.LEq("_lHammerShock"), c.LEq("_lMaceShock"));
                    if (lShk > 0)
                    {
                        double lsD = Math.Max(1, ToInt32(c.MeleeRef() * c.StatStr() * c.PAtkMul() * lShk)); var lsQ = c.ShQuery(e.x, e.y, 120);
                        for (int li2 = 0; li2 < lsQ.Count; li2++) { var se2 = lsQ[li2]; if (se2.alive && se2 != e) c.HurtEnemy(se2, lsD, JsMath.Atan2(se2.y - e.y, se2.x - e.x), true, new EnemyHurtOpts { dot = true, shieldHit = true }, atkEl); }
                        c.AddText(e.x, e.y - 30, c.Translate("💥충격파!"), "#ffaa44", 35, null, null); c.AddParts(e.x, e.y, "#ffaa44", 12);
                    }
                }
            }
            return new EnemyHurtBodyResult
            {
                dmg = dmg, atkEl = atkEl, isDot = isDot, _shBlocked = h._shBlocked, kbM = kbM, psM = psM, _isPure = h._isPure, _isArrow = h._isArrow, _isGunpowder = h._isGunpowder, _isMagicDmg = h._isMagicDmg,
                _cbAf = h._cbAf, _cbPas = h._cbPas, _isRageSk = h._isRageSk, _isCrit = isCrit,
                isBoss = isBoss, finalKbM = finalKbM, _isRanged = isRanged, _isMH = isMH, _isBB = isBB, _isMagicProj = isMagicProj, _kbScale = kbScale, _noKB = noKB
            };
        }
    }
}
