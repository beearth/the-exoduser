using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Port of the back half of the death part of the web hurtE (CX-04c2): from "// ═══ 지옥의 잔해 드롭 ═══" to the end of the `if(e.hp<=0){` block
    // (game.html origin/main 5286c0464 lines 42952..43322): debris, kill-chain rift, M26 avenger, plague burst, etype death effects of every chapter,
    // element death zones, rare-mob rewards, elite death modifiers, slime refund, malice / potion / combo rewards, rollDrop, exp, checkRooms, autosave.
    // Values and the ORDER of the injected calls and Math.random draws equal the web. Written by hand from the original text;
    // unity/Tools/enemy-hurt-oracle (H3b + CH4 chain cases) compares it with the original executed in Node. Runs only when DeathHead returned Continue.
    public static partial class EnemyHurt
    {
        static readonly string[] PotTypes = { "hp", "st", "mp" };
        static readonly string[] SlotNames = DropTablesData.SlotNames;
        static EliteTierDef EliteTier(double elite) { int i = (int)elite; if (i != elite || i < 0 || i >= EliteTables.Tiers.Length) throw new InvalidOperationException("ELITE_TIERS[" + elite + "] is undefined"); return EliteTables.Tiers[i]; }
        static string RareName(double et) { foreach (var r in EnemyTables.Rare) if (r.Etype == et) return r.Name; return null; }
        // SI_TO_HELL[G.stage] (undefined -> NaN in arithmetic)
        static double SiToHellAt(double stage) { int si = (int)stage; return stage == si && si >= 0 && si < EnemyTables.SiToHell.Length ? EnemyTables.SiToHell[si] : double.NaN; }
        static bool HasMod(EnemySpawn e, string id) { return e.mods != null && e.mods.Contains(id); }
        static void HitStopAtLeast(EnemyHurtContext c, double frames) { if (!Gt0(c.NoHitStopT)) c.HitStop = Math.Max(c.HitStop, ToInt32(frames * c.OptHitStop / 100)); }
        static object Undef(bool v) { return v ? (object)true : null; }   // `x||undefined` of a boolean
        static JsObj BeanShot(EnemySpawn e, double ang, double spdBlack, double spdOther, double dmgBlack, double dmgRed, double dmgOther, double? elBlack, double? elOther,
            double lifeBlack, double lifeOther, string colRed, string colOther, bool black, bool red)
        {
            double spd = black ? spdBlack : spdOther;
            double? el = black ? elBlack : elOther;
            return new JsObj().Set("x", e.x).Set("y", e.y).Set("vx", JsMath.Cos(ang) * spd).Set("vy", JsMath.Sin(ang) * spd)
                .Set("dmg", (double)ToInt32(e.atk * (black ? dmgBlack : red ? dmgRed : dmgOther))).Set("el", el.HasValue ? (object)el.Value : null).Set("friendly", false)
                .Set("life", black ? lifeBlack : lifeOther).Set("ml", black ? lifeBlack : lifeOther).Set("col", black ? "#00aa00" : red ? colRed : colOther)
                .Set("sz", black ? 2.0 : red ? 1.5 : 1.2).Set("redBean", Undef(red)).Set("blackBean", Undef(black)).Set("homing", Undef(red));
        }
        static JsObj ItemDrop(EnemyHurtContext c, EnemySpawn e, double spread, object item)
        {
            return new JsObj().Set("x", e.x + (c.Random() - .5) * spread).Set("y", e.y + (c.Random() - .5) * spread).Set("type", "item").Set("item", item).Set("picked", false);
        }

        public static void DeathTail(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtBodyResult b, EnemyHurtDeathResult d)
        {
            var P = c.P;
            const double ELP = 0, ELF = 1, ELI = 2, ELD = 3, ELL = 4;
            // ═══ 지옥의 잔해 드롭 ═══
            if (!e.ib && !(e.etype >= 90 && e.etype <= 99))
            {
                double debC = e.elite >= 3 ? .25 : e.elite >= 2 ? .15 : e.elite >= 1 ? .08 : 0;
                if (debC > 0 && c.Random() < debC)
                {
                    double dt = e.elite >= 3 ? 2 : e.elite >= 2 ? 1 : 0; // 0소/1중/2대
                    c.WiPush(new JsObj().Set("x", e.x + (c.Random() - .5) * 20).Set("y", e.y + (c.Random() - .5) * 20).Set("type", "debris").Set("debTier", dt).Set("picked", false));
                    c.AddText(e.x, e.y - 25, c.Translate("잔해 출현!"), "#cc8844", 40, null, null); c.AddParts(e.x, e.y, "#cc8844", 6);
                }
            }
            // ═══ 킬 체인 균열 시스템 ═══
            c.ChainCnt++; c.ChainT = 180; // 3초 윈도우 (60fps)
            if (c.ChainCnt >= 5 && !e.ib)
            {
                c.ChainCnt = 0;
                c.Rifts.Add(new EnemyRift { x = e.x, y = e.y, t = 0, maxT = 120, spawned = false, si = c.Stage });
                c.AddText(e.x, e.y - 30, c.Translate("🌀균열 발생!"), "#aa44ff", 60, null, null);
                c.SfxGroggy(); c.Shake(14);
            }
            // M26 복수자: 주변 M26 소유 적 강화 (ATK+20%, SPD+15%, 크기+10%)
            var m26n = c.ShQuery(e.x, e.y, 200);
            for (int i = 0; i < m26n.Count; i++)
            {
                var oe = m26n[i];
                if (oe != e && HasMod(oe, "M26") && Dst(oe.x, oe.y, e.x, e.y) < 200)
                {
                    oe.baseAtk = ToInt32(oe.baseAtk * 1.2); oe.atk = oe.baseAtk; oe.speed = Math.Min(oe.speed * 1.15, 2.0); oe.r = Math.Min(oe.r * 1.1, 30);
                    c.AddText(oe.x, oe.y - 15, c.Translate("🔥복수!"), "#cc2200", 30, null, null); c.AddParts(oe.x, oe.y, "#cc2200", 8);
                }
            }
            // ═══ 폭독혈: 전염된 적 사망 시 폭발 ═══
            if (Truthy(e._plagued))
            {
                double pbLv = Or(e._plagueLv, 1);
                double pbR = ToInt32((160 + (pbLv - 1) * 8) * 0.5); // 폭발 범위 50%↓
                double pbDmg = ToInt32(c.MagicRef() * c.StatInt() * c.PMagicMul() * c.SkMul("plagueBurst"));
                var pbNear = c.ShQuery(e.x, e.y, pbR);
                for (int i = 0; i < pbNear.Count; i++)
                {
                    var oe = pbNear[i]; if (oe == e || !oe.alive) continue;
                    if (Dst(oe.x, oe.y, e.x, e.y) < pbR) c.HurtEnemyAng(oe, Math.Min(pbDmg, Math.Max(1, oe.hp - 1)), JsMath.Atan2(oe.y - e.y, oe.x - e.x));
                }
                c.AddBoom(e.x, e.y, pbR, 15, "plague");
                c.AddText(e.x, e.y - 35, c.Translate("💥폭독혈!"), "#882222", 50, null, null); c.Shake(8);
            }
            // 화약병 사망 폭발
            if (e.etype == 8)
            {
                const double blR = 50;
                var neX = c.ShQuery(e.x, e.y, blR);
                for (int i = 0; i < neX.Count; i++) { var oe = neX[i]; if (oe != e && oe.alive && Dst(oe.x, oe.y, e.x, e.y) < blR) c.HurtEnemyAng(oe, ToInt32(e.atk * 1.0), JsMath.Atan2(oe.y - e.y, oe.x - e.x)); }
                if (Dst(P.x, P.y, e.x, e.y) < blR && P.iframes <= 0 && P.s != "charge") c.HurtPlayerTyped(ToInt32(e.atk * 1.0), new EnemyHurtPMeta { dtype = "magic" });
                c.AddBoom(e.x, e.y, blR, 20, "fire");
                c.Shake(5);
            }
            // 분열사도(15): 사망 시 소형 2마리로 분열
            if (e.etype == 15 && !e._splitDone)
            {
                for (int spi = 0; spi < 2; spi++)
                {
                    double a = Math.PI * spi + c.Random(), sd = 18 + c.Random() * 8;
                    var ne = c.MkEn(e.x + JsMath.Cos(a) * sd, e.y + JsMath.Sin(a) * sd, (int)c.Stage, 15, false, e.el, e.room);
                    if (ne == null) continue;
                    ne.hp = ToInt32(ne.hp * .35); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0; ne.r = Math.Max(5, ToInt32(e.r * .6)); ne.speed *= 1.3; ne._splitDone = true;
                    c.Ens.Add(ne); c.AddParts(ne.x, ne.y, e.col, 6);
                }
                c.AddText(e.x, e.y - 15, c.Translate("분열!"), "#7b5b3b", 30, null, null);
            }
            // ═══ 1장 썩은 숲 사망 효과 ═══
            // 25:빙판슬라임 사망 시 주변 빙판 지대
            if (e.etype == 25)
            {
                for (int si = 0; si < 3; si++)
                {
                    double a = Math.PI * 2 * si / 3;
                    c.SpawnShot(e, new JsObj().Set("x", e.x + JsMath.Cos(a) * 15).Set("y", e.y + JsMath.Sin(a) * 15).Set("vx", 0).Set("vy", 0).Set("dmg", 0).Set("el", ELI).Set("friendly", false)
                        .Set("life", 360).Set("ml", 360).Set("col", "#77ddff").Set("sz", 2.5).Set("iceZone", true));
                }
                c.AddText(e.x, e.y - 15, c.Translate("빙판!"), "#77ddff", 30, null, null); c.AddParts(e.x, e.y, "#88ccff", 10);
            }
            // 28:빙하골렘 사망 시 광역 빙결파
            if (e.etype == 28)
            {
                const double fR = 80;
                if (Dst(P.x, P.y, e.x, e.y) < fR && P.iframes <= 0) { P._freezeSlow = Math.Max(N(P._freezeSlow), 120); c.AddText(P.x, P.y - 25, c.Translate("❄빙결파!"), "#6699bb", 40, null, null); }
                for (int fi = 0; fi < 12; fi++) { double fa = Math.PI * 2 * fi / 12; c.PoolPart(e.x, e.y, JsMath.Cos(fa) * 5, JsMath.Sin(fa) * 5, "#88ccff", 4, 25, null, null, null); }
                c.Shake(6); c.AddParts(e.x, e.y, "#88ccff", 15);
            }
            // 29:빙마 사망 시 8방향 얼음기둥+빙결파 (30% 무지개탄)
            if (e.etype == 29)
            {
                for (int ip = 0; ip < 8; ip++)
                {
                    double ia = Math.PI * 2 * ip / 8; double iR = c.Random(); bool bk = iR < .5, rb = iR >= .5;
                    c.SpawnShot(e, BeanShot(e, ia, 4.4, 2.5, 1.5, 1.2, .8, ELP, ELI, 400, 200, "#cc1100", "#4455aa", bk, rb));
                }
                const double fR2 = 100;
                if (Dst(P.x, P.y, e.x, e.y) < fR2 && P.iframes <= 0) { P._freezeSlow = Math.Max(N(P._freezeSlow), 150); c.AddText(P.x, P.y - 25, c.Translate("❄최종빙결!"), "#4455aa", 50, null, null); }
                c.Shake(10); HitStopAtLeast(c, 12);
                c.AddText(e.x, e.y - 25, c.Translate("빙마 처치!"), "#88ccff", 60, null, null); c.AddParts(e.x, e.y, "#4455aa", 20);
            }
            // ═══ 4장 고통의 화염지대 사망 효과 ═══
            // 51:융합체 사망 시 소형 2마리 분리 (etype 50으로) — the web has no null check here (a blocked spot throws)
            if (e.etype == 51 && !e._amalgSplit)
            {
                for (int ai = 0; ai < 2; ai++)
                {
                    double a = Math.PI * ai + c.Random(), sd = 18 + c.Random() * 8;
                    var ne = c.MkEn(e.x + JsMath.Cos(a) * sd, e.y + JsMath.Sin(a) * sd, (int)c.Stage, 50, false, e.el, e.room);
                    if (ne == null) throw new InvalidOperationException("TypeError: mkEn returned false (web: Cannot read properties of false)");
                    ne.hp = ToInt32(ne.hp * .35); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0; ne.r = Math.Max(5, ToInt32(e.r * .6)); ne.speed *= 1.3; ne._amalgSplit = true;
                    c.Ens.Add(ne); c.AddParts(ne.x, ne.y, e.col, 6);
                }
                c.AddText(e.x, e.y - 15, c.Translate("분리!"), "#884455", 30, null, null);
            }
            // 55:뼈짐승 사망 시 8방향 뼈파편 (30% 무지개탄)
            if (e.etype == 55 && e._boneDeath)
            {
                for (int bi = 0; bi < 8; bi++)
                {
                    double ba = Math.PI * 2 * bi / 8; double iR = c.Random(); bool bk = iR < .5, rb = iR >= .5;
                    c.SpawnShot(e, BeanShot(e, ba, 4.4, 3, 1.5, 1.2, .8, ELP, ELP, 400, 150, "#cc1100", "#ccbbaa", bk, rb));
                }
                c.AddText(e.x, e.y - 15, c.Translate("뼈 파편!"), "#ccbbaa", 30, null, null); c.AddParts(e.x, e.y, "#ccbbaa", 12);
                c.Shake(4);
            }
            // 57:태아 거인 사망 시 충격파
            if (e.etype == 57)
            {
                const double fgR = 80;
                if (Dst(P.x, P.y, e.x, e.y) < fgR && P.iframes <= 0) c.HurtPlayer(ToInt32(e.atk * .5));
                c.AddParts(e.x, e.y, "#885566", 15); c.Shake(8); c.SfxGroggy();
                c.AddText(e.x, e.y - 25, c.Translate("태아 처치!"), "#885566", 50, null, null);
            }
            // 59:괴물길 지배자 사망 시 대폭발 (30% 무지개탄)
            if (e.etype == 59)
            {
                for (int oi = 0; oi < 8; oi++)
                {
                    double oa = Math.PI * 2 * oi / 8; double iR = c.Random(); bool bk = iR < .5, rb = iR >= .5;
                    c.SpawnShot(e, BeanShot(e, oa, 4.4, 2.5, 1.5, 1, .6, ELP, e.el, 400, 180, "#cc1100", "#884422", bk, rb));
                }
                c.AddText(e.x, e.y - 35, c.Translate("지배자 처치!"), "#ff4422", 70, null, null); HitStopAtLeast(c, 12);
                c.Shake(12); c.FlashT = 6; c.FlashCol = "#ff4400";
                c.AddParts(e.x, e.y, "#884422", 20); c.AddParts(e.x, e.y, "#ff4422", 15);
            }
            // ═══ 6장 사도의 마굴 사망 효과 ═══
            // 70:화염 보행자, 72:용암 슬라임 — 사망 시 용암 웅덩이
            if (e._lavaPoolDeath)
            {
                for (int li = 0; li < 3; li++)
                {
                    double a = Math.PI * 2 * li / 3;
                    c.SpawnShot(e, new JsObj().Set("x", e.x + JsMath.Cos(a) * 12).Set("y", e.y + JsMath.Sin(a) * 12).Set("dx", 0).Set("dy", 0).Set("r", 8).Set("dmg", (double)ToInt32(e.atk * .3))
                        .Set("el", ELF).Set("type", "mine").Set("life", 300).Set("owner", e).Set("_lavaPool", true));
                }
                c.AddText(e.x, e.y - 15, c.Translate("용암!"), "#ff5500", 30, null, null); c.AddParts(e.x, e.y, "#ff4400", 12);
            }
            // 72:용암 슬라임 — 사망 폭발
            if (e.etype == 72)
            {
                const double blR = 45;
                if (Dst(P.x, P.y, e.x, e.y) < blR && P.iframes <= 0) c.HurtPlayer(ToInt32(e.atk * 1.5));
                c.AddParts(e.x, e.y, "#ff6600", 18); c.AddParts(e.x, e.y, "#ffaa00", 12);
                c.Shake(6); c.SfxExplode();
            }
            // 79:화룡 사도 — 사망 시 용암비+화면 효과
            if (e.etype == 79)
            {
                for (int mi = 0; mi < 8; mi++)
                {
                    double mx = e.x + (c.Random() - .5) * 150, my = e.y + (c.Random() - .5) * 150;
                    c.SpawnShot(e, new JsObj().Set("x", mx).Set("y", my - 200).Set("dx", 0).Set("dy", 3).Set("r", 6).Set("dmg", (double)ToInt32(e.atk * .5)).Set("el", ELF)
                        .Set("type", "bomb").Set("life", 60).Set("owner", e).Set("_lavaPool", true));
                }
                c.AddText(e.x, e.y - 35, c.Translate("화룡 처치!"), "#ff2200", 80, null, null); HitStopAtLeast(c, 15);
                c.Shake(15); c.FlashT = 8; c.FlashCol = "#ff4400"; c.ChromaT = 6;
                c.AddParts(e.x, e.y, "#ff2200", 25); c.AddParts(e.x, e.y, "#ff8800", 20);
            }
            // ═══ 7장 지옥성 사망 효과 ═══
            // 80:고통의 인형 — 사망 폭발 (자폭 아닌 경우에도)
            if (e.etype == 80)
            {
                if (Dst(e.x, e.y, P.x, P.y) < 50 + N(P.r) && P.iframes <= 0) c.HurtPlayer(ToInt32(e.atk * .5));
                c.AddParts(e.x, e.y, "#553333", 12); c.AddParts(e.x, e.y, "#884444", 8); c.SfxExplode();
            }
            // 84:비명의 기둥 — 사망 비명 (최후의 감속)
            if (e.etype == 84)
            {
                if (Dst(e.x, e.y, P.x, P.y) < 150) P._freezeSlow = Math.Max(Or(P._freezeSlow, 0), 90);
                c.AddText(e.x, e.y - 25, c.Translate("최후의 비명!"), "#cc6666", 40, null, null);
                for (int ds = 0; ds < 8; ds++) { double da = Math.PI * 2 * ds / 8; c.PoolPart(e.x, e.y, JsMath.Cos(da) * 4, JsMath.Sin(da) * 4, "#443333", 3, 20, null, null, null); }
                c.Shake(6); c.SfxGroggy();
            }
            // 85:절망의 기사 — 그림자 산화
            if (e.etype == 85)
            {
                c.AddParts(e.x, e.y, "#111111", 15); c.AddParts(e.x, e.y, "#222222", 10);
                c.AddText(e.x, e.y - 20, c.Translate("산화..."), "#aaaaaa", 35, null, null);
            }
            // 88:심판자 — 미니보스, 심판의 빛 폭발
            if (e.etype == 88)
            {
                for (int jd = 0; jd < 10; jd++) { double ja = Math.PI * 2 * jd / 10; c.EProjAt(e, ja, 3, .6, ELD, 150, "#222244", 3); }
                c.AddText(e.x, e.y - 30, c.Translate("심판자 처치!"), "#8888dd", 60, null, null); HitStopAtLeast(c, 12);
                c.Shake(10); c.AddParts(e.x, e.y, "#222244", 20);
            }
            // 89:고통의 왕 — 최종보스 사망, 전방위 폭발+화면 효과
            if (e.etype == 89)
            {
                for (int ka = 0; ka < 16; ka++) { double a = Math.PI * 2 * ka / 16; c.EProjAt(e, a, 2, .5, ELD, 200, "#440000", 4); }
                c.AddText(e.x, e.y - 40, c.Translate("고통의 왕 처치!"), "#ff0000", 90, null, null); HitStopAtLeast(c, 20);
                c.Shake(20); c.FlashT = 10; c.FlashCol = "#880000"; c.ChromaT = 8;
                c.AddParts(e.x, e.y, "#660000", 30); c.AddParts(e.x, e.y, "#330000", 25); c.AddParts(e.x, e.y, "#880000", 20);
            }
            // 5장 지옥의 군단: 산소방울 드롭 (30% 확률)
            if (e.etype >= 60 && e.etype <= 69 && c.Random() < .3)
                c.WiPush(new JsObj().Set("x", e.x + (c.Random() - .5) * 20).Set("y", e.y + (c.Random() - .5) * 20).Set("type", "o2bubble").Set("picked", false));
            // ═══ 5장 지옥의 군단 사망 효과 ═══
            // 60:심해 보행자 — 사망 시 감속 수역
            if (e.etype == 60)
            {
                for (int sw = 0; sw < 3; sw++)
                {
                    double sa = Math.PI * 2 * sw / 3;
                    c.SpawnShot(e, new JsObj().Set("x", e.x + JsMath.Cos(sa) * 12).Set("y", e.y + JsMath.Sin(sa) * 12).Set("vx", 0).Set("vy", 0).Set("dmg", 0).Set("el", ELI).Set("friendly", false)
                        .Set("life", 300).Set("ml", 300).Set("col", "#334466").Set("sz", 2.5).Set("_seaSlow", true));
                }
                c.AddText(e.x, e.y - 15, c.Translate("수역!"), "#334466", 25, null, null); c.AddParts(e.x, e.y, "#446688", 8);
            }
            // 66:산호 괴물 — 사망 시 산호 파편 폭발
            if (e.etype == 66)
            {
                for (int cf = 0; cf < 8; cf++) { double fa = Math.PI * 2 * cf / 8; c.EProjAt(e, fa, 3, .5, ELP, 120, "#aa6677", 1.5); }
                c.AddText(e.x, e.y - 15, c.Translate("파편 폭발!"), "#aa6677", 30, null, null); c.AddParts(e.x, e.y, "#885566", 15); c.Shake(5);
            }
            // 68:심해 거대어 — 미니보스 사망, 기생충 분출
            if (e.etype == 68)
            {
                for (int pb = 0; pb < 6; pb++) { double pa = Math.PI * 2 * pb / 6; c.EProjAt(e, pa, 2.5, .4, ELP, 200, "#556677", 1.5); }
                c.AddText(e.x, e.y - 25, c.Translate("거대어 처치!"), "#66aacc", 60, null, null); HitStopAtLeast(c, 10);
                c.Shake(10); c.AddParts(e.x, e.y, "#334455", 20);
            }
            // 69:심연의 대사도 — 보스급 사망, 해일+화면 효과
            if (e.etype == 69)
            {
                for (int td = 0; td < 12; td++) { double ta = Math.PI * 2 * td / 12; c.EProjAt(e, ta, 2, .6, ELI, 200, "#223355", 3); }
                c.AddText(e.x, e.y - 35, c.Translate("대사도 처치!"), "#6699dd", 80, null, null); HitStopAtLeast(c, 15);
                c.Shake(15); c.FlashT = 8; c.FlashCol = "#223355"; c.ChromaT = 6;
                c.AddParts(e.x, e.y, "#0a1122", 25); c.AddParts(e.x, e.y, "#223355", 20);
            }
            // ═══ 속성별 사망 장판 (엘리트 100%, 일반 20%) ═══
            if (!e.ib && !Truthy(e._isDecoy) && !(e.el.HasValue && e.el.Value == ELP) && (e.elite >= 1 || c.Random() < .2))
            {
                double dzDmg = ToInt32(e.atk * .25), dzSz = e.elite >= 2 ? 10 : 7, dzLife = e.elite >= 2 ? 360 : 240;
                double el = e.el ?? double.NaN;
                if (el == ELD)
                { // 독장판
                    c.SpawnShot(e, new JsObj().Set("x", e.x).Set("y", e.y).Set("vx", 0).Set("vy", 0).Set("dmg", dzDmg).Set("el", ELD).Set("friendly", false).Set("life", dzLife).Set("ml", dzLife)
                        .Set("col", "#33aa22").Set("sz", dzSz).Set("poisonZone", true).Set("_tickCd", 0).Set("_tickRate", 40));
                    c.AddText(e.x, e.y - 15, c.Translate("독웅덩이!"), "#33aa22", 25, null, null);
                }
                else if (el == ELF)
                { // 화염장판
                    c.SpawnShot(e, new JsObj().Set("x", e.x).Set("y", e.y).Set("vx", 0).Set("vy", 0).Set("dmg", dzDmg).Set("el", ELF).Set("friendly", false).Set("life", dzLife).Set("ml", dzLife)
                        .Set("col", "#ff5500").Set("sz", dzSz).Set("poisonZone", true).Set("_tickCd", 0).Set("_tickRate", 35));
                    c.AddText(e.x, e.y - 15, c.Translate("화염장판!"), "#ff5500", 25, null, null);
                }
                else if (el == ELL)
                { // 전기장
                    c.SpawnShot(e, new JsObj().Set("x", e.x).Set("y", e.y).Set("vx", 0).Set("vy", 0).Set("dmg", dzDmg).Set("el", ELL).Set("friendly", false).Set("life", dzLife).Set("ml", dzLife)
                        .Set("col", "#44ddff").Set("sz", dzSz).Set("poisonZone", true).Set("_tickCd", 0).Set("_tickRate", 30));
                    c.AddText(e.x, e.y - 15, c.Translate("전기장!"), "#44ddff", 25, null, null);
                }
                else if (el == ELI)
                { // 빙결지대
                    c.SpawnShot(e, new JsObj().Set("x", e.x).Set("y", e.y).Set("vx", 0).Set("vy", 0).Set("dmg", 0).Set("el", ELI).Set("friendly", false).Set("life", dzLife).Set("ml", dzLife)
                        .Set("col", "#77ddff").Set("sz", dzSz).Set("iceZone", true));
                    c.AddText(e.x, e.y - 15, c.Translate("빙판!"), "#77ddff", 25, null, null);
                }
            }
            // ═══ 레어몹 사망 처리 ═══
            if (e._isRare)
            {
                string rn = RareName(e.etype);
                string rLabel = rn != null ? c.Translate(rn) : c.Translate("레어");
                c.AddText(e.x, e.y - 35, rLabel + " " + c.Translate("처치!"), "#ffaa00", 70, null, null);
                HitStopAtLeast(c, 18); c.Shake(15);
                for (int ri = 0; ri < 20; ri++) { double a = Math.PI * 2 * ri / 20; c.PoolPart(e.x, e.y, JsMath.Cos(a) * 6, JsMath.Sin(a) * 6, e.col, 5, 30, null, null, null); }
                c.SfxMagicHit();
                // 90 방랑기사: 희귀~전설 무기 드롭
                if (e.etype == 90)
                {
                    var wSlots = new[] { "weapon", "bow" }; string ws = wSlots[ToInt32(c.Random() * wSlots.Length)];
                    double wr = c.Random() < .15 ? 4 : c.Random() < .4 ? 3 : 2;
                    var wi = c.MkItem(ws, Or(e.dropTier, 0), new[] { ELP, ELF, ELI, ELD, ELL }[ToInt32(c.Random() * 5)], wr);
                    c.WiPush(ItemDrop(c, e, 16, wi));
                    c.AddText(e.x, e.y - 20, c.Translate("무기 드롭!"), "#ffcc00", 40, null, null);
                }
                // 91 보물악마: 대량 악의 + 보장 영웅이상 장비
                if (e.etype == 91)
                {
                    double tmMat = 50 + ToInt32(c.Stage * 3); c.Mats += tmMat;
                    c.AddText(e.x, e.y - 20, c.Translate("악의 +") + JsNumber(tmMat), "#ddaa00", 50, null, null);
                    string tmSlot = SlotNames[ToInt32(c.Random() * SlotNames.Length)];
                    double tmR = c.Random() < .25 ? 4 : 3;
                    var tmI = c.MkItem(tmSlot, Or(e.dropTier, 0), new[] { ELP, ELF, ELI, ELD, ELL }[ToInt32(c.Random() * 5)], tmR);
                    c.WiPush(ItemDrop(c, e, 16, tmI));
                    c.AddText(e.x, e.y - 5, c.Translate("보물 발견!"), "#ffdd44", 50, null, null);
                }
                // 93 상인악마: 상인의 주머니 (대량 악의)
                if (e.etype == 93)
                {
                    double mcMat = 30 + ToInt32(c.Stage * 2); c.Mats += mcMat;
                    c.AddText(e.x, e.y - 20, c.Translate("상인의 주머니 +") + JsNumber(mcMat), "#886644", 40, null, null);
                }
                // 94 사슬죄수: 희귀 장신구 드롭
                if (e.etype == 94)
                {
                    var cpSlots = new[] { "ring1", "necklace" }; string cs = cpSlots[ToInt32(c.Random() * cpSlots.Length)];
                    double cr = c.Random() < .2 ? 4 : c.Random() < .5 ? 3 : 2;
                    var ci = c.MkItem(cs, Or(e.dropTier, 0), new[] { ELP, ELD, ELL }[ToInt32(c.Random() * 3)], cr);
                    c.WiPush(ItemDrop(c, e, 16, ci));
                    c.AddText(e.x, e.y - 20, c.Translate("속박의 파편!"), "#888899", 40, null, null);
                }
                // 95 시간사도: 부츠/장갑 드롭
                if (e.etype == 95)
                {
                    var tsSlots = new[] { "boots", "gloves" }; string tss = tsSlots[ToInt32(c.Random() * tsSlots.Length)];
                    double tsr = c.Random() < .2 ? 4 : c.Random() < .5 ? 3 : 2;
                    var tsi = c.MkItem(tss, Or(e.dropTier, 0), new[] { ELI, ELL, ELP }[ToInt32(c.Random() * 3)], tsr);
                    c.WiPush(ItemDrop(c, e, 16, tsi));
                    c.AddText(e.x, e.y - 20, c.Translate("시간의 조각!"), "#aabb99", 40, null, null);
                }
                // 96 탐욕사도: 훔친 골드 2배 반환
                if (e.etype == 96)
                {
                    double grRet = ToInt32(e._grGold * 2);
                    if (grRet > 0) { c.Mats += grRet; }
                    if (Gt0(P._greedCurse)) { P._greedCurse = 0; c.AddText(P.x, P.y - 30, c.Translate("저주 해제!"), "#44ff44", 40, null, null); }
                }
                // 97 쌍둥이: 부활 메카닉 — 파트너 5초 내 처치 실패 시 부활
                if (e.etype == 97)
                {
                    EnemySpawn twPair = null;
                    foreach (var oe in c.Ens) if (oe != e && oe.etype == 97 && oe.alive && oe.room == e.room) { twPair = oe; break; }
                    if (twPair != null)
                    {
                        twPair._twReviveT = 300; // 5초 타이머
                        twPair._twPartnerDead = e; // 부활 대상 기억
                        c.AddText(twPair.x, twPair.y - 30, c.Translate("쌍둥이의 분노!"), "#aa44ff", 50, null, null);
                        twPair.atk = ToInt32(twPair.atk * 1.5); twPair.speed *= 1.3;
                    }
                }
                // 98 차원균열체: 유니크 확률 UP
                if (e.etype == 98)
                {
                    double drR = c.Random() < .3 ? 4 : 3;
                    string drSlot = SlotNames[ToInt32(c.Random() * SlotNames.Length)];
                    var drI = c.MkItem(drSlot, Math.Min(SiToHellAt(c.Stage) + 3, 4), new[] { ELD, ELL }[ToInt32(c.Random() * 2)], drR);
                    c.WiPush(ItemDrop(c, e, 16, drI));
                    c.AddText(e.x, e.y - 20, c.Translate("차원의 결정!"), "#9900ff", 40, null, null);
                }
                // 99 죽음: 보장 전설 드롭 + 대량 보상
                if (e.etype == 99)
                {
                    string deSlot = SlotNames[ToInt32(c.Random() * SlotNames.Length)];
                    var deI = c.MkItem(deSlot, Math.Min(SiToHellAt(c.Stage) + 4, 4), ELD, 4); // 전설 확정
                    c.WiPush(ItemDrop(c, e, 16, deI));
                    double deMat = 200 + ToInt32(c.Stage * 5); c.Mats += deMat;
                    c.AddText(e.x, e.y - 20, c.Translate("전설 아이템!"), "#ff4400", 60, null, null);
                    c.AddText(e.x, e.y - 50, c.Translate("죽음을 이겨냈다!"), "#ffffff", 80, null, null);
                    for (int di = 0; di < 40; di++) { double a = Math.PI * 2 * di / 40, spd = 3 + c.Random() * 5; c.PoolPart(e.x, e.y, JsMath.Cos(a) * spd, JsMath.Sin(a) * spd, "#000000", 6, 50, null, null, null); }
                    c.Shake(30); HitStopAtLeast(c, 30);
                }
            }
            // ═══ 엘리트 사망 모디파이어 ═══
            if (e.mods != null && e.mods.Count > 0)
            {
                // M07 기생: 주변 아군 HP 30% 회복
                if (HasMod(e, "M07"))
                {
                    var m07n = c.ShQuery(e.x, e.y, 120);
                    for (int i = 0; i < m07n.Count; i++)
                    {
                        var oe = m07n[i];
                        if (oe != e && Dst(oe.x, oe.y, e.x, e.y) < 120)
                        {
                            double hl = ToInt32(oe.mhp * .3); oe.hp = Math.Min(oe.mhp, oe.hp + hl); c.AddText(oe.x, oe.y - 15, "+" + JsNumber(hl), "#ff44aa", 25, null, null); c.AddParts(oe.x, oe.y, "#ff44aa", 5);
                        }
                    }
                }
                // M08 분열: 소형 2마리로 분열 (분열체는 재분열 불가) — no null check in the web
                if (HasMod(e, "M08") && !e.modT.split)
                {
                    for (int si = 0; si < 2; si++)
                    {
                        double a = Math.PI * si + c.Random(), sd = 20 + c.Random() * 10;
                        var ne = c.MkEn(e.x + JsMath.Cos(a) * sd, e.y + JsMath.Sin(a) * sd, (int)c.Stage, 3, false, e.el, e.room);
                        if (ne == null) throw new InvalidOperationException("TypeError: mkEn returned false (web: Cannot read properties of false)");
                        ne.hp = ToInt32(ne.hp * .3); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0; ne.r = Math.Max(4, e.r * .6); ne.elite = 0; ne.mods = new List<string>(); ne.modT.split = true;
                        c.Ens.Add(ne); c.AddParts(ne.x, ne.y, e.col, 5);
                    }
                    c.AddText(e.x, e.y - 15, c.Translate("분열!"), "#ffaa44", 30, null, null);
                }
                // M10 사망폭발: 대폭발 (플레이어에게만)
                if (HasMod(e, "M10"))
                {
                    const double bR = 80;
                    if (Dst(P.x, P.y, e.x, e.y) < bR && P.iframes <= 0 && P.s != "charge") c.HurtPlayerTyped(ToInt32(e.atk * 3), new EnemyHurtPMeta { dtype = "magic" });
                    c.AddParts(e.x, e.y, "#ff0000", 30); c.Shake(12); c.AddText(e.x, e.y - 20, c.Translate("💥대폭발!"), "#ff0000", 40, null, null);
                }
                // M20 연쇄전격: 주변 적 ATK+50%
                if (HasMod(e, "M20"))
                {
                    var m20n = c.ShQuery(e.x, e.y, 150);
                    for (int i = 0; i < m20n.Count; i++)
                    {
                        var oe = m20n[i];
                        if (oe != e && Dst(oe.x, oe.y, e.x, e.y) < 150) { oe.baseAtk = ToInt32(oe.baseAtk * 1.5); oe.atk = oe.baseAtk; c.AddText(oe.x, oe.y - 15, c.Translate("⚡강화!"), "#ffdd00", 25, null, null); c.AddParts(oe.x, oe.y, "#ffdd00", 5); }
                    }
                }
                // 엘리트 처치 알림
                if (e.elite > 0)
                {
                    var tier = EliteTier(e.elite);
                    c.AddText(e.x, e.y - 30, c.Translate(tier.Name) + c.Lang(" 처치!", " Defeated!"), tier.Col, 50, null, null); HitStopAtLeast(c, 12);
                }
            }
            // 슬라임 괴물 사망 → 악의 30% 회수 + 먹은 장비 토해냄
            if (Truthy(e._isSlime) && Gt0(e.matDrop))
            {
                c.Mats += ToInt32(e.matDrop.Value * 2);
                for (int si = 0; si < 8; si++) { double a = Math.PI * 2 * si / 8; c.PoolPart(e.x, e.y, JsMath.Cos(a) * 3, JsMath.Sin(a) * 3, "#aa44ff", 4, 20, null, null, null); }
            }
            if (Truthy(e._isSlime) && e._eatenItems != null && e._eatenItems.Count > 0)
            {
                for (int ei = 0; ei < e._eatenItems.Count; ei++) c.WiPush(ItemDrop(c, e, 40, e._eatenItems[ei]));
                c.AddText(e.x, e.y - e.r - 10, c.Translate("장비 ") + JsNumber(e._eatenItems.Count) + c.Lang("개 토해냄!", " gear spat out!"), "#ffcc44", 40, null, null);
            }
            // DROPS (엘리트만 악의 드롭, 10배)
            bool eliteT = e.elite != 0 && !double.IsNaN(e.elite);
            if (e.ib || eliteT)
            {
                double db = eliteT ? EliteTier(e.elite).DropBonus : 0;
                double matCnt = ToInt32((12 + c.Stage * 3) * 12 * (1 + db));
                // 즉시 수급 + 트레일 이펙트 (worldItems 우회)
                double matAmt = ToInt32(matCnt * (1 + c.EqAffix("goldBonus")) * c.MaliceMul());
                c.Mats += matAmt;
                c.AddText(e.x, e.y - 15, c.Translate("악의 +") + JsNumber(matAmt), "#cc66ff", 30, null, null);
                double mtAng = JsMath.Atan2(P.y - e.y, P.x - e.x);
                for (int mi = 0; mi < 4; mi++)
                {
                    double md = 8 + mi * 6;
                    double px = e.x + JsMath.Cos(mtAng) * md, py = e.y + JsMath.Sin(mtAng) * md, vx = JsMath.Cos(mtAng) * (3 + mi), vy = JsMath.Sin(mtAng) * (3 + mi);
                    c.PoolPart(px, py, vx, vy, "#cc66ff", 2 + c.Random() * 2, 12 + mi * 3, null, null, null);
                }
                c.SfxPickup();
            }
            // Potion drops → 바로 퀵슬롯 추가 (바닥 드랍 X); the web draws the 100 % roll too
            if (c.Random() < (e.ib ? 1 : 1))
            {
                string pt = PotTypes[ToInt32(c.Random() * PotTypes.Length)];
                double cnt = e.ib ? 2 : 1;
                if (c.AddPotion(pt, cnt)) { var pp = c.Pot(pt); if (pp != null) c.AddText(e.x, e.y - 8, pp.name + " +" + JsNumber(cnt), pp.col, 30, null, null); }
            }
            if (e.ib && c.Random() < .5) { if (c.AddPotion("hp", 1)) { c.AddText(e.x, e.y - 8, c.Translate("HP물약 +1"), "#33ff33", 30, null, null); } }
            // ═══ 콤보 보상: 100콤보당+5%(캡없음) + 난이도 1단당+10%(0단=0%) ═══
            double comboPct = ToInt32(c.Combo / 100) * 0.05;
            double diffPct = Math.Max(0, (c.OptDiff.HasValue ? c.OptDiff.Value : 5) - 5) * 0.10;
            double comboBonus = 1 + comboPct + diffPct;
            // 모든 처치 기본 악의 보상 (x2 배율)
            c.Mats += 4;
            // 악의 추가 드랍 (엘리트/보스) + 콤보 보너스 적용
            if (e.ib || eliteT)
            {
                double mCnt = ToInt32((2 + ToInt32(c.Random() * 2)) * 10 * comboBonus * 2);
                c.Mats += mCnt;
            }
            c.RollDrop(e); // Equipment drop!
            double eLv = Or(e.lv, 10); double expMul = (eliteT ? 1 + EliteTier(e.elite).DropBonus : 1) * comboBonus;
            // 초월(1000+): 고정 XP — 일반 1, 엘리트 2, 보스 10
            if (P.lv.HasValue && P.lv.Value >= 1000) { c.AddExp(e.ib ? 10 : eliteT ? 2 : 1, true); }
            else { c.AddExp(ToInt32((e.ib ? Math.Max(30, ToInt32(eLv * 2)) : Math.Max(5, ToInt32(eLv * .4))) * expMul), null); }
            c.CheckRooms(); // Immediate check on kill
            if (c.Kills % 10 == 0) c.DbSaveNow(); // 10킬마다 자동저장
        }
    }
}
