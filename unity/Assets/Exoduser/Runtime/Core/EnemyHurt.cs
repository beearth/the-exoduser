using System;
using System.Globalization;

namespace Exoduser.UnityPort.Core
{
    // Port of the head of the web hurtE (CX-04a): from the function's first line up to (not including) "// ═══ 데미지 → HP 직행 ═══".
    // Gates, per-etype defence, damage multipliers, crit, stun/freeze x1.5 and the energy-shield absorption. Values and the ORDER of the injected calls
    // equal the web; equipment/passive lookups, other targets (hurtE recursion), text/sound/particles are EnemyHurtContext delegates.
    // Written by hand from the original text; unity/Tools/enemy-hurt-oracle compares it with the original executed in Node.
    public static partial class EnemyHurt
    {
        // EL = {P:0,F:1,I:2,D:3,L:4,H:5,E:6}
        const double ElL = 4;

        static bool Truthy(double? v) { return v.HasValue && v.Value != 0 && !double.IsNaN(v.Value); }
        static bool Truthy(bool? v) { return v.HasValue && v.Value; }
        static bool Gt0(double? v) { return v.HasValue && v.Value > 0; }
        static double Or(double? v, double fallback) { return Truthy(v) ? v.Value : fallback; }  // v||fallback
        static double N(double? v) { return v ?? double.NaN; }                                   // undefined in arithmetic
        static int ToInt32(double v) { return EnemyFactory.ToInt32(v); }
        static double Dst(double a, double b, double c, double d) { return Math.Sqrt((c - a) * (c - a) + (d - b) * (d - b)); }
        static string At(string[] arr, double idx) { return idx >= 0 && idx < arr.Length && idx == Math.Floor(idx) ? arr[(int)idx] : null; }

        // elMul(a,d) (game.html 14404). Nullable operands keep JS `undefined===undefined`.
        public static double ElMul(double? a, double? d)
        {
            if (a == 1 && d == 2) return 2;
            if (a == 2 && d == 1) return 2;
            if (a == 3 && d == 4) return 2;
            if (a == 4 && d == 3) return 2;
            if (a == 3 && d == 5) return 2;
            if (a == 5 && d == 3) return 2;
            if (a == 6 && d == 4) return 2;
            if (a == 4 && d == 6) return 2;
            if (a == d && a != 0) return .5;
            return 1;
        }

        // JS String(number) for the integer-valued / short fractional shield numbers shown in the damage text.
        static string JsNumber(double v)
        {
            if (v == Math.Floor(v) && Math.Abs(v) < 1e15) return ((long)v).ToString(CultureInfo.InvariantCulture);
            return v.ToString("R", CultureInfo.InvariantCulture);
        }

        // Returns null where the web hurtE returns early inside this range (nothing else happens), otherwise the values for CX-04b.
        // opts == null means no opts object. ang == null means undefined. atkEl defaults to 0 in the web signature.
        public static EnemyHurtHeadResult Head(EnemyHurtContext c, EnemySpawn e, double dmg, double? ang, bool noSound, EnemyHurtOpts opts, double atkEl)
        {
            var P = c.P;
            if (c.ParryLessonActive) { c.ParryLessonHurt(e, dmg, ang, opts); return null; }
            if (e == null || !e.alive) return null;
            if (e.hp <= 0) return null; // already dead (alive flag lagging)
            if (c.BtDmgLog != null) c.BtDmgLog.Add(new EnemyHurtLogEntry { t = c.Now, src = "player", dmg = dmg });
            c.ShBufI++; // shQuery buffer guard
            try
            {
                c.PetOnAtk();
                bool? isDot = opts == null ? (bool?)null : opts.dot; // opts&&opts.dot
                bool dotT = Truthy(isDot);
                // revive invulnerability (cap 90, -1 per hit, not for DOT)
                if (e.reviveIframes > 90) e.reviveIframes = 90;
                if (e.reviveIframes > 0 && !dotT) { e.reviveIframes = Math.Max(0, e.reviveIframes - 1); return null; }
                // mirror guard: attacking it counters
                if (e.ib && Truthy(e._mgActive) && e.s == "bossMirrorGuard")
                {
                    e._mgActive = false; double mgDmg = ToInt32(e.atk * 2 * ElMul(e.el, c.ArmorEl));
                    c.HurtPlayer(mgDmg); c.AddText(P.x, P.y - 25, c.Translate("🪞 반격!"), "#ff2200", 55, null, null);
                    c.Shake(15); c.DoHitFlash("#00ccff", 0.3); P.iframes = 15;
                    e.s = "recover"; e.st2 = 30; return null;
                }
                // burst counter
                if (e.ib && Truthy(e._bcActive) && e.s == "bossBurstCounter")
                {
                    c.HurtPlayer(ToInt32(e.atk * 1.5 * ElMul(e.el, c.ArmorEl))); c.AddText(P.x, P.y - 25, c.Translate("💢 반격!"), "#cc00ff", 55, null, null);
                    c.Shake(12); c.DoHitFlash("#00ccff", 0.25); P.iframes = 15; return null;
                }
                // rare mobs
                if (e.etype == 99) { dmg = Math.Min(dmg, ToInt32(e.mhp * .01)); if (dmg < 1) dmg = 1; }
                if (e.etype == 92 && !dotT)
                {
                    if (atkEl > 0)
                    {
                        e._mrAbsorb = Math.Min(e._mrAbsorbMax, e._mrAbsorb + dmg);
                        if (e._mrAbsorb >= e._mrAbsorbMax)
                        {
                            c.SpawnBossProjectile(e, new EnemyProjectile { x = e.x, y = e.y, vx = JsMath.Cos(e.facing) * 4, vy = JsMath.Sin(e.facing) * 4, dmg = e._mrAbsorb, el = atkEl, friendly = false, life = 300, ml = 300, col = "#4488ff", sz = 2.5 });
                            e._mrAbsorb = 0; c.AddText(e.x, e.y - 20, c.Translate("반격 발사!"), "#4488ff", 30, null, null);
                        }
                        return null;
                    }
                }
                if (e.etype == 91) e._tmHitCnt = Or(e._tmHitCnt, 0) + 1;
                if (e.etype == 93 && !e._mcFleeing)
                {
                    e._mcFleeing = true; P._greedCurse = Or(P._greedCurse, 0) + 18000;
                    c.AddText(P.x, P.y - 25, c.Translate("저주! 드랍률 -50%"), "#886644", 60, null, null); c.AddText(e.x, e.y - 15, c.Translate("도망!"), "#886644", 30, null, null);
                }
                if (e.etype == 40 && e._wraithPhasing) return null;
                if (e.etype == 41 && e._dkGuarding) dmg = ToInt32(dmg * .5);
                if (e.etype == 57 && e._curled) return null;
                // parry blue bean: at least 10% max HP
                if (opts != null && Truthy(opts.parryBlueBean) && e.mhp > 0) dmg = Math.Max(dmg, ToInt32(e.mhp * 0.10));
                if (!dotT)
                {
                    if (opts != null && Truthy(opts.bleed))
                    {
                        e.bleed = 1; e.bleedT = Math.Max(e.bleedT, 300); e.bleedStk = Math.Min(10, e.bleedStk + 1);
                        if (e.bleedStk < 10) e._bleedPool = e._bleedPool + c.PDotPool() * dmg * 0.10;
                    }
                    if (opts != null && Truthy(opts.poison))
                    {
                        e.poison = 1; e.poisonT = Math.Max(e.poisonT, 300); e.poisonStk = Math.Min(10, e.poisonStk + 1);
                        if (e.poisonStk < 10) e._poisonPool = e._poisonPool + c.PDotPool() * dmg * 0.10;
                    }
                }
                // etype 6 shield
                if (e.etype == 6 && ang.HasValue)
                {
                    double shDiff = (ang.Value + Math.PI) - e.shieldAng; while (shDiff > Math.PI) shDiff -= Math.PI * 2; while (shDiff < -Math.PI) shDiff += Math.PI * 2;
                    if (Math.Abs(shDiff) < Math.PI / 3) { dmg = ToInt32(dmg * 0.3); c.AddText(e.x, e.y - 15, "🛡", "#8888ff", 20, null, null); if (!noSound) c.Block(); }
                }
                bool shBlocked = false; // energy shield block flag (checked after the final multiplier)
                // element resistance
                if (e.eRes != null && atkEl >= 0 && atkEl < e.eRes.Length && atkEl == Math.Floor(atkEl) && e.eRes[(int)atkEl] > 0) dmg = ToInt32(dmg * (1 - e.eRes[(int)atkEl]));
                if (e.etype == 63 && e._crabGuard && !dotT) dmg = ToInt32(dmg * .3);
                if (e.etype == 74 && e._obsGuarding && !dotT) dmg = ToInt32(dmg * .2);
                if (e.etype == 85 && !dotT && c.Random() < .25) { c.AddParts(e.x, e.y, "#333333", 4); return null; }
                // elite hit modifiers
                if (e.mods != null && e.mods.Contains("M14")) dmg = ToInt32(dmg * .5);
                if (Truthy(e._aDefM) && e._aDefM.Value < 1) dmg = ToInt32(dmg * e._aDefM.Value);
                if (e.mods != null && !e.ib)
                {
                    var m22 = c.ShQuery(e.x, e.y, 120);
                    for (int i = 0; i < m22.Count; i++)
                    {
                        var oe = m22[i];
                        if (oe != e && oe.mods != null && oe.mods.Contains("M22")) { dmg = ToInt32(dmg * .67); c.AddText(e.x, e.y - 8, c.Translate("불사 보호"), "#ff66aa", 15, null, null); break; }
                    }
                }
                // monster hit sound with cooldown
                if (!dotT && c.HitSfxCd <= 0)
                {
                    c.HitSfxCd = 8;
                    var hs = c.HitSfxForEtype((int)e.etype);
                    c.PlaySample(hs.key, .3, hs.pitch);
                }
                // shock stacks +5% each
                if (Or(e._shockStk, 0) > 0) dmg = ToInt32(dmg * (1 + e._shockStk.Value * 0.05));
                // lightning applies shock
                if (atkEl == ElL && !dotT)
                {
                    e._shockT = Math.Max(Or(e._shockT, 0), 300);
                    e._shockStk = Math.Min(10, Or(e._shockStk, 0) + 1);
                    if (!e.ib && e._shockStk.Value >= 3 && e.stunned == 0 && !(opts != null && Truthy(opts.noStun))) { e.stunned = Math.Max(e.stunned, 18); c.AddText(e.x, e.y - 25, "⚡", "#44ddff", 15, null, null); }
                }
                if (Gt0(e._cursed)) dmg = ToInt32(dmg * 1.25);
                dmg = ToInt32(dmg * c.StatStr());
                // holy power vs undead
                if ((EnemyHurtTables.IsUndead((int)e.etype) || Truthy(e._isGhoul)) && !e.ib) { double hpBonus = c.EqAffix("antiRevive"); if (hpBonus > 0) dmg = ToInt32(dmg * (1 + hpBonus)); }
                // elemConvert
                if (atkEl == 0 && c.EqAffix("elemConvert") > 0 && c.Random() < c.EqAffix("elemConvert") && Or(c.WeaponEl, 0) > 0) atkEl = c.WeaponEl.Value;
                // elemFocus
                if (atkEl > 0 && c.EqAffix("elemFocus") > 0) dmg = ToInt32(dmg * (1 + c.EqAffix("elemFocus")));
                // phase 2 element damage % + accessory element bonus
                {
                    string[] elAx = { null, "fireDmgPct", "iceDmgPct", "darkDmgPct", "lightDmgPct" };
                    string[] elBn = { null, "fireDmgBns", "iceDmgBns", "darkDmgBns", "lightDmgBns" };
                    if (atkEl > 0 && atkEl <= 4) { int ai = (int)atkEl; double ev = c.EqAffix(elAx[ai]) + c.EqAffix(elBn[ai]); if (ev > 0) dmg = ToInt32(dmg * (1 + ev)); }
                    if (atkEl == 0) { double pv = c.EqAffix("poisonDmgPct") + c.EqAffix("poisonDmgBns"); if (pv > 0 && (opts != null && Truthy(opts.poison))) dmg = ToInt32(dmg * (1 + pv)); }
                }
                // crisisBoost
                if (P.hp < P.mhp * .3 && c.EqAffix("crisisBoost") > 0) dmg = ToInt32(dmg * (1 + c.EqAffix("crisisBoost")));
                // killSlayer (undefined _killMul -> NaN -> ~~NaN = 0, as in the web)
                if (Gt0(P._killBuff)) dmg = ToInt32(dmg * (1 + N(P._killMul)));
                // legendary belt / boots / spear
                if (Gt0(P._lBeltT) && c.LEq("_lBeltBuff") > 0) dmg = ToInt32(dmg * (1 + c.LEq("_lBeltBuff")));
                if (Gt0(P._lBootsT) && !dotT && c.LEq("_lBootsEvade") > 0) { dmg = ToInt32(dmg * (1 + c.LEq("_lBootsEvade"))); P._lBootsT = 0; c.AddText(e.x, e.y - 30, c.Translate("⚡회피 일격!"), "#88ddff", 30, null, null); }
                if (Gt0(P._lSpearT) && Or(P._lSpearStk, 0) > 0 && c.LEq("_lSpearStack") > 0) dmg = ToInt32(dmg * (1 + c.LEq("_lSpearStack") * P._lSpearStk.Value));
                // accessory damage bonus
                { double accDmg = (c.NecklaceDmg + c.Ring1Dmg + c.Ring2Dmg + c.BeltDmg + c.BraceletDmg + c.HeadbandDmg + c.Headband2Dmg) * 0.01; if (accDmg > 0) dmg = ToInt32(dmg * (1 + accDmg)); }
                // passives: weak-prey, hunter
                { double pb = c.PredBonus(e); if (pb > 0) dmg = ToInt32(dmg * (1 + pb)); }
                { double hm = c.HunterMul(e); if (hm > 1) dmg = ToInt32(dmg * hm); }
                // conditional affixes: summed, applied once
                {
                    double cAx = 0;
                    if (e.hp >= e.mhp * .7) cAx += c.EqAffix("abundDmg") + Or(c.PassAbund, 0) * .20;
                    if (P.hp >= P.mhp * .7) cAx += c.EqAffix("healthyAtk");
                    if (P.hp == P.mhp) cAx += c.EqAffix("fullLifeDmg");
                    if (P.hp <= P.mhp * .35) cAx += c.EqAffix("lowLifeDmg") + c.EqAffix("injuredDmg");
                    if (e.hp <= e.mhp * .3) cAx += c.EqAffix("predDmg");
                    if (e.hp <= e.mhp * .2) cAx += c.EqAffix("overkilDmg");
                    if (e.hp >= e.mhp * .95 && !dotT) cAx += c.EqAffix("firstStrike");
                    { double d2e = Math.Abs(P.x - e.x) + Math.Abs(P.y - e.y); if (d2e <= 120) cAx += c.EqAffix("closeDmg"); if (d2e > 300) cAx += c.EqAffix("farDmg"); }
                    if (e.stunned > 0) { cAx += c.EqAffix("stunDmgUp"); if (c.UEq("_uClubStun") > 0) cAx += (c.UEq("_uClubStun") - 1); }
                    if (Gt0(e._frozen)) cAx += c.EqAffix("frozenDmgUp");
                    if (Gt0(e._burning) || e.burnT > 0) cAx += c.EqAffix("burnDmgUp");
                    if (Gt0(e._poisoned) || e.poison > 0) cAx += c.EqAffix("poisonDmgUp");
                    if (Gt0(e._cursed)) cAx += c.EqAffix("curseDmgUp");
                    if (Gt0(e._slowed) || Gt0(e._webSlow) || Gt0(e._freezeSlow)) cAx += c.EqAffix("slowDmgUp");
                    if (e.ib) cAx += c.EqAffix("bossSlayer") + c.EqAffix("vsBossDmg");
                    if (e.mods != null && e.mods.Count > 0 && !e.ib) cAx += c.EqAffix("eliteSlayer") + c.EqAffix("vsEliteDmg");
                    if (!e.ib && (e.mods == null || e.mods.Count == 0)) cAx += c.EqAffix("mobSlayer");
                    if (cAx > 0) dmg = ToInt32(dmg * (1 + cAx));
                }
                // minimum damage 1 (the shield flag is still false here)
                if (dmg < 1 && !shBlocked) dmg = 1;
                double kbM = (opts != null && opts.kbMult.HasValue) ? opts.kbMult.Value : 1.0;
                double psM = (opts != null && opts.poiseMult.HasValue) ? opts.poiseMult.Value : 1.0;
                bool isPure = opts != null && Truthy(opts.pure);
                // dual damage-type flags (JS tri-state: opts&&... keeps undefined / false / true)
                bool? isArrow;
                if (isPure) isArrow = false; else if (opts == null) isArrow = null; else if (!opts.maxDist.HasValue) isArrow = false; else isArrow = !Truthy(opts.magic);
                bool? isGun;
                if (Truthy(isArrow)) isGun = true;
                else if (opts == null) isGun = null;
                else if (!Truthy(opts.explode)) isGun = opts.explode;
                else isGun = !Truthy(opts.magic);
                bool? isMag;
                if (isPure) isMag = false; else if (Truthy(isGun)) isMag = false; else if (atkEl > 0) isMag = true;
                else if (opts == null) isMag = null; else if (Truthy(opts.beam)) isMag = true; else isMag = opts.magic;
                bool magT = Truthy(isMag), arrT = Truthy(isArrow), beamT = opts != null && Truthy(opts.beam), projT = opts != null && Truthy(opts.proj);
                // phase 2 damage % by type
                {
                    double tyAx = 0;
                    if (!magT && !arrT && !dotT) tyAx += c.EqAffix("meleeDmgPct");
                    if (arrT) tyAx += c.EqAffix("rangedDmgPct") + c.EqAffix("projDmgPct");
                    if (magT && !beamT) tyAx += c.EqAffix("spellDmgPct");
                    if (beamT) tyAx += c.EqAffix("beamDmgPct") + c.EqAffix("spellDmgPct");
                    if (dotT) tyAx += c.EqAffix("dotDmgPct");
                    if (projT) tyAx += c.EqAffix("projDmgPct");
                    if (projT && !arrT) tyAx += N(c.PassBow) * .15; // undefined pBow -> NaN -> the whole % is dropped, as in the web
                    if (tyAx > 0) dmg = ToInt32(dmg * (1 + tyAx));
                }
                // debuff areas
                if (!isPure && Gt0(e._weakPhys) && !magT && !arrT) dmg = ToInt32(dmg * (1 + e._weakPhys.Value));
                if (!isPure && Gt0(e._weakMag) && magT) dmg = ToInt32(dmg * (1 + e._weakMag.Value));
                if (!isPure && Gt0(e._weakPj) && arrT) dmg = ToInt32(dmg * (1 + e._weakPj.Value));
                if (!isPure && Or(e._shockDR, 0) > 0) dmg = ToInt32(dmg * (1 + e._shockDR.Value));
                if (!isPure && Or(e._blinkWeak, 0) > 0 && Or(e._blinkWeakT, 0) > 0) dmg = ToInt32(dmg * (1 + e._blinkWeak.Value));
                // weak-point exposure (combo boost)
                double cbAf = c.EqAffix("comboBoost");
                double cbPas = Or(c.PassCombo, 0);
                if (cbAf > 0 || cbPas > 0)
                {
                    double cbMax = (cbPas > 0 ? cbPas * 5 : 0) + (cbAf > 0 ? 10 : 0);
                    if (!dotT)
                    {
                        bool cbAdd = true;
                        if (beamT) { if (!Truthy(e._comboBmT)) e._comboBmT = 0; e._comboBmT++; if (e._comboBmT < 4) cbAdd = false; else e._comboBmT = 0; }
                        if (cbAdd) { e._comboStk = Math.Min(cbMax, Or(e._comboStk, 0) + 1); e._comboHitT = 0; e._comboDecayT = 0; }
                    }
                    if (Or(e._comboStk, 0) > 0) dmg = ToInt32(dmg * (1 + e._comboStk.Value * 0.03));
                }
                bool isRageSk = Truthy(P._rageSkCtx);
                if (isRageSk) { double rsd = c.EqAffix("rageSkDmg"); if (rsd > 0) dmg = ToInt32(dmg * (1 + rsd)); }
                // critical hit
                bool isCrit = false;
                {
                    double crBonus = 0;
                    if (isRageSk) crBonus += c.EqAffix("rageSkCrit") * 100;
                    if (!magT && !arrT) crBonus += c.EqAffix("critRateMelee") * 100;
                    if (magT || beamT) crBonus += c.EqAffix("critRateSpell") * 100;
                    if (arrT) crBonus += c.EqAffix("critRateBow") * 100;
                    bool lDagForce = !dotT && Or(P._lNextCrit, 0) > 0 && c.LEq("_lDaggerKill") > 0;
                    double ksFC = (!dotT && opts != null && Truthy(opts._kiFull)) ? Math.Min(1, c.EqAffix("kiSlashFullCrit")) : 0;
                    if (c.Random() * 100 < c.StatCrit() + crBonus || lDagForce || ksFC > 0)
                    {
                        if (lDagForce) P._lNextCrit = 0;
                        dmg = ToInt32(dmg * (c.StatCritDmg() + ksFC)); isCrit = true; if (c.HasStats) c.StatCrits++;
                        // SND-02 치명타 전용음 (HIT 분류, 12f 쿨다운) — web 780ac692b, after the fce195067 port: one more Math.random (_r pitch)
                        if (!dotT && !noSound && c.CritSfxCd <= 0) { c.CritSfxCd = 12; c.PlaySample("crit_heavy", .45, Rnd(c, 1, .05)); }
                        if (!dotT && c.LEq("_lAxeBleed") > 0 && e.bleedT > 0 && Or(e.bleedPool, 0) > 0)
                        {
                            double abD = Math.Max(1, ToInt32(e.bleedPool.Value * c.LEq("_lAxeBleed"))); e.bleedPool = 0; e.bleedT = 0; if (e.bleed != 0) e.bleed = 0;
                            dmg += abD; c.AddText(e.x, e.y - 55, c.Translate("🩸출혈 폭발!"), "#ff2244", 40, null, null);
                        }
                        double ocExpl = c.EqAffix("onCritExplode");
                        if (ocExpl > 0)
                        {
                            double ocR = 80; double ocD = ToInt32(dmg * ocExpl);
                            for (int oi = 0; oi < c.Ens.Count; oi++) { var oe = c.Ens[oi]; if (oe != null && oe.alive && oe != e && Dst(e.x, e.y, oe.x, oe.y) < ocR) c.HurtEnemy(oe, ocD, JsMath.Atan2(oe.y - e.y, oe.x - e.x), false, new EnemyHurtOpts { pure = true }, null); }
                            c.AddParts(e.x, e.y, "#ff6622", 12);
                        }
                        double ocChain = c.EqAffix("onCritChain");
                        if (ocChain > 0)
                        {
                            EnemySpawn ocTgt = null; double ocMin = 250;
                            for (int oi = 0; oi < c.Ens.Count; oi++) { var oe = c.Ens[oi]; if (oe != null && oe.alive && oe != e) { double od = Dst(e.x, e.y, oe.x, oe.y); if (od < ocMin) { ocMin = od; ocTgt = oe; } } }
                            if (ocTgt != null) c.HurtEnemy(ocTgt, ToInt32(dmg * ocChain), JsMath.Atan2(ocTgt.y - e.y, ocTgt.x - e.x), false, new EnemyHurtOpts { pure = true }, null);
                        }
                        double ocFrz = c.EqAffix("onCritFreeze");
                        if (ocFrz > 0) { e._freezeGauge = Or(e._freezeGauge, 0) + ToInt32(ocFrz * 100); if (e._freezeGauge.Value >= 100 && !Truthy(e._freezeImmune)) { e._frozen = 180; e._freezeGauge = 0; } }
                        double ocHeal = c.EqAffix("onCritHeal"); if (ocHeal > 0) P.hp = Math.Min(P.mhp, P.hp + ocHeal);
                        double ocMana = c.EqAffix("onCritMana"); if (ocMana > 0) P.mp = Math.Min(P.mmp, P.mp + ocMana);
                        double ocShld = c.EqAffix("onCritShield"); if (ocShld > 0 && N(P.eShieldMax) > 0) P.eShield = Math.Min(P.eShieldMax.Value, N(P.eShield) + ocShld);
                    }
                }
                // legendary ring: element weakness hit -> extra explosion (2s internal cooldown)
                if (!dotT && atkEl > 0 && c.LEq("_lRingElem") > 0 && ElMul(atkEl, e.el) >= 2 && Or(c.PlayTime, 0) - Or(e._lReactF, -9999) >= 120)
                {
                    e._lReactF = Or(c.PlayTime, 0);
                    double reD = Math.Max(1, ToInt32(c.MeleeRef() * c.StatStr() * c.PAtkMul() * c.LEq("_lRingElem")));
                    var reQ = c.ShQuery(e.x, e.y, 100);
                    for (int ri = 0; ri < reQ.Count; ri++) { var re = reQ[ri]; if (re.alive && re != e) c.HurtEnemy(re, reD, JsMath.Atan2(re.y - e.y, re.x - e.x), true, new EnemyHurtOpts { dot = true, shieldHit = true }, null); }
                    c.AddText(e.x, e.y - 40, c.Translate("💥속성 폭발!"), At(EnemyFactory.ElementColors, atkEl) ?? "#ffdd44", 35, null, null); c.AddParts(e.x, e.y, At(EnemyHurtTables.ParticleColors, atkEl) ?? "#ffdd44", 10);
                }
                // stun / freeze: x1.5
                if (e.stunned > 0 && !dotT) dmg = ToInt32(dmg * 1.5);
                if (Gt0(e._frozen) && !dotT) dmg = ToInt32(dmg * 1.5);
                // parry blue bean on a boss: exactly 10% max HP
                if (e.ib && opts != null && Truthy(opts.parryBlueBean)) dmg = ToInt32(e.mhp * .10);
                // energy shield: absorbs after every multiplier is final; only the overflow reaches HP
                if ((!dotT || (opts != null && Truthy(opts.shieldHit))) && e.eShieldMax > 0 && e.eShield > 0)
                {
                    double shAbs = Math.Min(e.eShield, dmg);
                    e.eShield = Math.Max(0, e.eShield - dmg);
                    dmg = Math.Max(0, dmg - shAbs);
                    if (shAbs > 0 && !dotT) c.AddText(e.x, e.y - 70, JsNumber(shAbs), "#66ddff", 45, 48, JsNumber(shAbs));
                    if (dmg == 0) shBlocked = true;
                }
                return new EnemyHurtHeadResult { dmg = dmg, atkEl = atkEl, isDot = isDot, _shBlocked = shBlocked, kbM = kbM, psM = psM, _isPure = isPure, _isArrow = isArrow, _isGunpowder = isGun, _isMagicDmg = isMag, _cbAf = cbAf, _cbPas = cbPas, _isRageSk = isRageSk, _isCrit = isCrit };
            }
            finally { c.ShBufI--; }
        }
    }
}
