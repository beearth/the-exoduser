using System;
using System.Collections.Generic;
using System.Globalization;

namespace Exoduser.UnityPort.Core
{
    // One floating text the web raises with addTxt(x,y,text,color,life). Ko = what `_T`/`_L` give in Korean, En = the English form.
    public sealed class ReviveText { public double X, Y; public string Ko, En, Color; public int Life; }

    // Everything the revive rules read besides the enemy itself.
    public sealed class ReviveContext
    {
        public int Stage, Hell;                        // G.stage, STG[G.stage].hell
        public bool DemoMode; public int DemoLastStage; // _DEMO_MODE, _DEMO_LAST_STAGE
        public double AntiRevive;                      // _eqAffix('antiRevive')  (Holy Power)
        public Func<double, double, double> HolyPrison; // (x,y) -> suppress of the first holyPrison zone containing the point, NaN when none
        public double PlayerHp, PlayerMaxHp, PlayerX, PlayerY, PlayerFacing, PlayerIframes; public string PlayerState = "idle";
        public Func<float, float, float, bool> CanMove; // canMv
        public Func<float, float, float, double[]> SafePoint; // safePt -> {x,y} or null
        public List<int> KilledBosses;                 // G._killedBosses
        public Func<double> Rnd;                       // Math.random
    }

    // Boss immediate-revive side effects the caller applies (VFX, the player shockwave, the burst bullets, the companion boss). Positions are final.
    public sealed class BossRevivePlan
    {
        public double OldX, OldY, OldR, VfxR, NewR, ShrinkPct, NewX, NewY;
        public double ShockwaveR, ShockwaveDamage; public bool ShockwaveHitsPlayer;
        public int BurstCount; public bool H7;
        public int CompanionEtype = -1; public double CompanionX, CompanionY;
    }

    public sealed class ReviveResult
    {
        public bool Revived;           // the enemy was brought back inside the death block (web `return`)
        public BossRevivePlan Boss;    // set for a boss immediate revive
        public bool DoppelgangerRevive;
        public readonly List<ReviveText> Texts = new List<ReviveText>();
    }

    public sealed class CorpseResult
    {
        public enum Kind { None, BossRevived, BossFinaleRevived, BossFinalDeath, Ghoul, OwnBody }
        public Kind What;
        public EnemyState Ghoul;       // the new ghoul (the caller adds it to the enemy list)
        public double ShrinkPct;
        public readonly List<ReviveText> Texts = new List<ReviveText>();
    }

    // Revive judgement of enemies and the player (hurtE death block 42588-42738, corpse timer 34577-34638, _spawnGhoul 41602-41627,
    // druid finale 17138-17164, die() 43815-43840 and _fallenResolve 43940-43950 of game.html). Rendering/sound stay with the caller.
    public static class ReviveRules
    {
        public static double Trunc(double v) { return double.IsNaN(v) || double.IsInfinity(v) ? 0 : (double)(int)(long)Math.Truncate(v); } // ~~v
        static string N(double v) { return v.ToString("R", CultureInfo.InvariantCulture); }
        static double D(double v, double fallback) { return v == 0 || double.IsNaN(v) ? fallback : v; } // v||fallback

        static ReviveText Txt(ReviveResult r, double x, double y, string ko, string en, string col, int life)
        { var t = new ReviveText { X = x, Y = y, Ko = ko, En = en ?? ko, Color = col, Life = life }; r.Texts.Add(t); return t; }
        static void Txt(CorpseResult r, double x, double y, string ko, string en, string col, int life)
        { r.Texts.Add(new ReviveText { X = x, Y = y, Ko = ko, En = en ?? ko, Color = col, Life = life }); }

        // _isDruidFinale(e) 17138: demo && stage == _DEMO_LAST_STAGE && stage == 3 && e.ib
        public static bool IsDruidFinale(ReviveContext c, EnemyState e) { return c.DemoMode && c.Stage == c.DemoLastStage && c.Stage == 3 && e != null && e.IsBoss; }
        // _isSi0DruidSink(e) 10920
        public static bool IsSi0DruidSink(ReviveContext c, EnemyState e) { return e != null && e.IsBoss && !e.FmKind && c.Stage == 0 && !IsDruidFinale(c, e); }
        // _druidFinaleReviveChance 17147
        public static double DruidFinaleReviveChance(EnemyState e, double suppress) { return e.Deaths == 1 && e.RevPts > 0 ? Math.Max(0, Math.Min(1, 1 - suppress)) : 0; }

        static double Suppress(ReviveContext c, EnemyState e, out bool zone)
        {
            double s = c.AntiRevive; zone = false;
            if (c.HolyPrison != null) { double z = c.HolyPrison(e.X, e.Y); if (!double.IsNaN(z)) { s += z; zone = true; } }
            return s;
        }

        // hurtE `if(e.hp<=0){ ... }` up to the end of the boss fallback reservation. Returns Revived=true when the web returns before the kill path.
        // Not included: decoy (no Unity decoys), the kill path itself (alive=false, kills, drops).
        public static ReviveResult OnZeroHp(ReviveContext c, EnemyState e)
        {
            var res = new ReviveResult();
            Func<double> rnd = c.Rnd;
            // 87: doppelganger revives once
            if (e.Etype == 87 && !e.DgRevived)
            {
                e.DgRevived = true; e.Hp = (int)Trunc(e.MaxHp * .5); e.Shield = 0; e.MaxShield = 0; e.Alive = true; e.State = "idle"; e.StateTicks = 30; e.Stunned = 0;
                Txt(res, e.X, e.Y - 20, "부활!", "부활!", "#ffdd44", 50);
                res.Revived = true; res.DoppelgangerRevive = true; return res;
            }
            if (e.IsBoss)
            {
                e.Deaths = e.Deaths + 1;
                bool finale = IsDruidFinale(c, e);
                bool isH7 = c.Hell == 6;
                bool hpZone; double bSuppress = Suppress(c, e, out hpZone);
                double revCost = 10;
                if (bSuppress > 0) revCost += Trunc(Math.Min(5, bSuppress * 10 + 2));
                if (hpZone) revCost += 3;
                if (c.PlayerHp >= c.PlayerMaxHp) revCost += 2;
                e.RevPts = e.RevPts - revCost;
                if (e.RevPts < 0) e.RevPts = 0;
                bool doRevive = false;
                double revBase = 2.00 + c.Stage * 0.05;
                double revCh = Math.Max(0, revBase - (e.Deaths - 1) * 0.15 - bSuppress);
                if (!finale && e.RevPts > 0 && rnd() < revCh) doRevive = true;
                double revPct = Trunc((finale ? DruidFinaleReviveChance(e, bSuppress) : revCh) * 100);
                bool sink = IsSi0DruidSink(c, e);
                if (doRevive)
                {
                    Txt(res, e.X, e.Y - 55, "💀 " + N(e.Deaths) + "차 부활! " + N(revPct) + "%", "💀 " + N(e.Deaths) + " Revive! " + N(revPct) + "%",
                        revPct >= 80 ? "#ff2244" : revPct >= 50 ? "#ff8844" : "#ffcc44", 50);
                    Txt(res, e.X, e.Y - 70, "부활력 -" + N(revCost) + " (" + N(e.RevPts) + "/" + N(e.MaxRevPts) + ")", "Revive Power -" + N(revCost) + " (" + N(e.RevPts) + "/" + N(e.MaxRevPts) + ")",
                        revCost >= 13 ? "#ffdd44" : "#ffffff", 60);
                    if (bSuppress > 0) Txt(res, e.X, e.Y - 85, "✟ 신성력 억제! +" + N(Trunc(Math.Min(5, bSuppress * 10 + 2))), "✟ Holy Suppressed! +" + N(Trunc(Math.Min(5, bSuppress * 10 + 2))), "#ffffff", 50);
                }
                else if (e.RevPts <= 0)
                {
                    if (!sink) { Txt(res, e.X, e.Y - 55, "☠ 부활력 고갈!", "☠ Revival Depleted!", "#ff2222", 80); Txt(res, e.X, e.Y - 40, "0/" + N(e.MaxRevPts), null, "#ff4444", 50); }
                }
                else if (finale) Txt(res, e.X, e.Y - 40, "마지막 저항 판정 " + N(revPct) + "%", "Last stand chance " + N(revPct) + "%", "#c8dfab", 60);
                else if (bSuppress > 0) Txt(res, e.X, e.Y - 40, "✟ 신성력 억제! (" + N(revPct) + "%)", "✟ Holy Suppress! (" + N(revPct) + "%)", "#ffffff", 60);
                else if (!(sink && e.BossRevJudged)) Txt(res, e.X, e.Y - 40, "부활 실패 (" + N(revPct) + "%)", "Revive Failed (" + N(revPct) + "%)", "#bbbbbb", 40);
                if (doRevive)
                {
                    var plan = new BossRevivePlan { H7 = isH7 };
                    e.Hp = e.MaxHp; e.Shield = 0; e.MaxShield = 0; e.BossPhase = 0;
                    e.Alive = true; e.State = "recover"; e.StateTicks = 90; e.Stunned = 0;
                    e.BossRevJudged = true;
                    e.MaxPoise = (float)Trunc(e.MaxPoise * 1.5); e.Poise = (float)Trunc(e.MaxPoise * 0.25);
                    e.ReviveIframes = 90;
                    e.Attack = (int)Trunc(e.Attack * (isH7 ? 2 : 1.5));
                    e.Speed = (float)Math.Min(e.Speed * 1.25, isH7 ? 2.0 : 1.6);
                    e.BossPatCd = Math.Max(isH7 ? 20 : 60, e.BossPatCd - 30);
                    if (e.OrigR == 0) e.OrigR = e.Radius;
                    double rvScale = Math.Max(0.40, e.RevPts / Math.Max(1, D(e.MaxRevPts, 150)));
                    plan.VfxR = e.Radius;
                    e.Radius = (float)Math.Max(10, Trunc(e.OrigR * rvScale));
                    plan.NewR = e.Radius;
                    plan.ShrinkPct = Trunc((1 - rvScale) * 100);
                    if (plan.ShrinkPct > 0) Txt(res, e.X, e.Y - 85, "▼ " + N(plan.ShrinkPct) + "%", null, "#aaffcc", 55);
                    plan.OldX = e.X; plan.OldY = e.Y; plan.OldR = D(e.Radius, 20);
                    double tpAng = c.PlayerFacing + Math.PI + ((rnd() - .5) * .8);
                    double tpDist = 80 + e.Deaths * 20;
                    double tpX = c.PlayerX + JsMath.Cos(tpAng) * tpDist, tpY = c.PlayerY + JsMath.Sin(tpAng) * tpDist;
                    if (c.CanMove == null || c.CanMove((float)tpX, (float)tpY, e.Radius)) { e.X = (float)tpX; e.Y = (float)tpY; }
                    else
                    {
                        var sp = c.SafePoint == null ? null : c.SafePoint((float)(c.PlayerX + JsMath.Cos(tpAng) * 50), (float)(c.PlayerY + JsMath.Sin(tpAng) * 50), e.Radius);
                        if (sp != null) { e.X = (float)sp[0]; e.Y = (float)sp[1]; }
                    }
                    plan.NewX = e.X; plan.NewY = e.Y;
                    Txt(res, e.X, e.Y - 50, "🔥부활!", null, "#ff4400", 40);
                    e.SpawnTicks = 55; e.BossReviveVfxPending = 40;
                    plan.ShockwaveR = 100 + e.Deaths * 30;
                    plan.ShockwaveDamage = Trunc(e.Attack * (.5 + e.Deaths * .15));
                    double pd = Math.Sqrt((c.PlayerX - e.X) * (c.PlayerX - e.X) + (c.PlayerY - e.Y) * (c.PlayerY - e.Y));
                    if (pd < plan.ShockwaveR && c.PlayerIframes <= 0 && c.PlayerState != "charge")
                    { plan.ShockwaveHitsPlayer = true; Txt(res, c.PlayerX, c.PlayerY - 20, "🌊충격파!", null, "#ff4400", 30); }
                    if (e.Deaths >= 2) { plan.BurstCount = (int)(8 + e.Deaths * 4); Txt(res, e.X, e.Y - 65, "💀 분노 폭발!", null, "#ff0000", 50); }
                    if (c.KilledBosses != null && c.KilledBosses.Count > 0 && rnd() < 0.1)
                    {
                        var pool = new List<int>(); foreach (int et in c.KilledBosses) if (et != e.Etype) pool.Add(et);
                        if (pool.Count > 0)
                        {
                            int cet = pool[(int)Trunc(rnd() * pool.Count)];
                            double sa = rnd() * Math.PI * 2, sd = 120 + rnd() * 60;
                            double sx = e.X + JsMath.Cos(sa) * sd, sy = e.Y + JsMath.Sin(sa) * sd;
                            if (c.CanMove != null && !c.CanMove((float)sx, (float)sy, 20))
                            { var sp = c.SafePoint == null ? null : c.SafePoint(e.X, e.Y, 20); if (sp != null) { sx = sp[0]; sy = sp[1]; } }
                            plan.CompanionEtype = cet; plan.CompanionX = sx; plan.CompanionY = sy;
                            Txt(res, sx, sy - 30, "👻 동반부활!", "👻 Co-Revive!", "#cc44ff", 50);
                        }
                    }
                    string revTxt = (isH7 ? "👿 " : "💀 ") + N(e.Deaths) + "차 부활! (×" + N(Math.Pow(2, e.Deaths)) + ")";
                    string revTxtEn = (isH7 ? "👿 " : "💀 ") + N(e.Deaths) + " Revive! (×" + N(Math.Pow(2, e.Deaths)) + ")";
                    Txt(res, e.X, e.Y - 35, revTxt, revTxtEn, isH7 ? "#ff0044" : "#ff2244", 70);
                    Txt(res, e.X, e.Y - 20, "HP " + N(e.MaxHp), null, isH7 ? "#ff4488" : "#ff6666", 50);
                    res.Revived = true; res.Boss = plan; return res;
                }
            }
            // ordinary enemy: one revive, power vs suppression
            if (!e.IsBoss && !e.Revived && !e.IsGhoul)
            {
                double revPow = (e.Elite > 0 ? (e.Elite >= 2 ? .6 : .5) : .5) + Trunc(D(e.Level, 1) / 100) * 0.10;
                bool z; double suppress = Suppress(c, e, out z);
                double finalRev = Math.Max(0, revPow - suppress);
                if (finalRev > 0 && rnd() < finalRev)
                {
                    e.Revived = true; e.ReviveTimer = e.Elite > 0 ? 120 : 90; e.ReviveX = e.X; e.ReviveY = e.Y;
                    e.ReviveAsGhoul = rnd() < 0.5;
                }
                else if (suppress > 0) Txt(res, e.X, e.Y - 30, "✟ 신성력 억제!", "✟ Holy Suppressed!", "#ffffff", 50);
            }
            // boss fallback: 3 s countdown, outcome rolled now and resolved when the timer ends
            if (e.IsBoss && !e.BossRevJudged)
            {
                e.BossRevJudged = true; e.ReviveTimer = 180; e.ReviveX = e.X; e.ReviveY = e.Y;
                double rv2Base = 1.50 + c.Stage * 0.05;
                bool z; double rv2Sup = Suppress(c, e, out z);
                if (e.RevPts <= 0) { e.BossRevChance = 0; e.BossRevRoll = 1; }
                else { e.BossRevChance = IsDruidFinale(c, e) ? DruidFinaleReviveChance(e, rv2Sup) : Math.Max(0, rv2Base - e.Deaths * 0.25 - rv2Sup); e.BossRevRoll = rnd(); }
                e.BossRevived = true;
            }
            return res;
        }

        // STY-D9: the last death of the 1-1 druid (no revive pending) is shown as a ground sink instead of corpse/gore/text.
        public static bool SinkOnDeath(ReviveContext c, EnemyState e)
        {
            return IsSi0DruidSink(c, e) && !(e.ReviveTimer > 0 && e.BossRevived && e.BossRevRoll < e.BossRevChance);
        }

        // _reviveDruidFinale 17150: HP 35%, last stand
        public static void ReviveDruidFinale(EnemyState e)
        {
            e.Alive = true; e.Hp = (int)Math.Max(1, Math.Floor(e.MaxHp * .35)); e.Shield = 0; e.MaxShield = 0;
            e.RevPts = 0; e.BossPhase = 3; e.DruidLastStand = true;
            e.Attack = (int)Math.Floor((e.DruidBaseAttack != 0 ? e.DruidBaseAttack : e.Attack) * 1.6);
            e.State = "bossDruidRest"; e.StateTicks = 90; e.Stunned = 0; e.ReviveIframes = 90; e.KnockbackX = 0; e.KnockbackY = 0;
            e.BossRevJudged = false; e.BossRevived = false; e.ReviveTimer = 0; e.SpawnTicks = 0; e.BossReviveVfxPending = 0;
        }

        // GHOUL_DEFS / _ghoulType 41591-41600
        public sealed class GhoulDef { public string Name, Col; public float R, Spd; public int VfxSize, PartN, PartSpd, Shake; }
        public static readonly Dictionary<int, GhoulDef> GhoulDefs = new Dictionary<int, GhoulDef> {
            { 100, new GhoulDef { Name = "소형 구울", R = 16, Spd = .55f, Col = "#667744", VfxSize = 50, PartN = 8, PartSpd = 4, Shake = 3 } },
            { 101, new GhoulDef { Name = "구울", R = 26, Spd = .4f, Col = "#556633", VfxSize = 80, PartN = 14, PartSpd = 3, Shake = 5 } },
            { 102, new GhoulDef { Name = "대형 구울", R = 42, Spd = .28f, Col = "#445522", VfxSize = 120, PartN = 20, PartSpd = 2, Shake = 8 } } };
        public static int GhoulType(double origR, int elite) { int t = origR <= 24 ? 100 : origR >= 40 ? 102 : 101; if (elite >= 2 && t < 102) t++; return t; }

        // _spawnGhoul 41602-41627 (the fields EnemyState carries). Random draws in source order: speed, then idle timer.
        public static EnemyState SpawnGhoul(ReviveContext c, double x, double y, EnemyState orig, int id)
        {
            int gt = GhoulType(orig.Radius, orig.Elite); var gd = GhoulDefs[gt];
            int baseHp = (int)Trunc(orig.MaxHp * 2.0), baseAtk = (int)Trunc(orig.BaseAttack * 2.0);
            double speed = gd.Spd + c.Rnd() * .08;
            double st2 = 30 + c.Rnd() * 20;
            return new EnemyState {
                Id = id, Etype = gt, X = (float)x, Y = (float)y, Radius = gd.R, Hp = baseHp, MaxHp = baseHp, Attack = baseAtk, BaseAttack = baseAtk,
                Speed = (float)speed, Col = gd.Col, Alive = true, Stunned = 0, Poise = (float)Trunc(baseHp * .4), MaxPoise = (float)Trunc(baseHp * .4),
                IsBoss = false, Level = orig.Level != 0 ? orig.Level : (c.Stage + 1) * 100, State = "idle", StateTicks = (float)st2,
                Facing = (float)JsMath.Atan2(c.PlayerY - y, c.PlayerX - x), Elite = 0, Shield = baseHp, MaxShield = baseHp,
                IsGhoul = true, Revived = true, ReviveChase = true, Alerted = true };
        }

        // update() dead-enemy branch `else if(e._reviveTimer>0)` 34577-34638. sp = frames elapsed. nextId feeds the ghoul.
        public static CorpseResult TickCorpse(ReviveContext c, EnemyState e, double sp, int nextId)
        {
            var res = new CorpseResult();
            e.ReviveTimer -= sp;
            if (e.ReviveTimer > 0) return res;
            e.ReviveTimer = 0;
            if (e.IsBoss)
            {
                if (e.BossRevRoll < e.BossRevChance)
                {
                    if (IsDruidFinale(c, e)) { ReviveDruidFinale(e); res.What = CorpseResult.Kind.BossFinaleRevived; }
                    else
                    {
                        e.RevPts = Math.Max(0, e.RevPts - 10);
                        e.Alive = true; e.X = (float)e.ReviveX; e.Y = (float)e.ReviveY;
                        e.Hp = (int)Trunc(e.MaxHp * .5); e.Shield = 0; e.MaxShield = 0; e.State = "recover"; e.StateTicks = 60; e.Stunned = 0; e.KnockbackX = 0; e.KnockbackY = 0;
                        e.ReviveIframes = 90; e.BossRevJudged = false;
                        if (e.OrigR == 0) e.OrigR = e.Radius;
                        double rvScale = Math.Max(0.40, e.RevPts / Math.Max(1, D(e.MaxRevPts, 150)));
                        e.Radius = (float)Math.Max(10, Trunc(e.OrigR * rvScale));
                        res.ShrinkPct = Trunc((1 - rvScale) * 100);
                        Txt(res, e.X, e.Y - 50, "☠ 지옥에서 귀환!", "☠ Returned from Hell!", "#ff4400", 100);
                        Txt(res, e.X, e.Y - 30, "부활 성공! 부활력 " + N(e.RevPts) + "/" + N(e.MaxRevPts), "Revive! Power " + N(e.RevPts) + "/" + N(e.MaxRevPts), "#ff8844", 60);
                        if (res.ShrinkPct > 0) Txt(res, e.X, e.Y - 70, "▼ " + N(res.ShrinkPct) + "%", null, "#aaffcc", 55);
                        e.SpawnTicks = 55; e.BossReviveVfxPending = 40;
                        res.What = CorpseResult.Kind.BossRevived;
                    }
                }
                else
                {
                    e.BossRevived = false; e.ReviveTimer = 0;
                    if (!e.SinkDruid)
                    {
                        Txt(res, e.ReviveX, e.ReviveY - 50, "☠ 완전 사망!", "☠ Permanent Death!", "#ff2222", 100);
                        bool depleted = e.RevPts <= 0;
                        Txt(res, e.ReviveX, e.ReviveY - 30, depleted ? "부활력 고갈!" : "부활 실패...", depleted ? "Revival Depleted!" : "Revive Failed...", depleted ? "#ff4444" : "#888888", 60);
                    }
                    res.What = CorpseResult.Kind.BossFinalDeath;
                }
            }
            else if (e.ReviveAsGhoul)
            {
                res.Ghoul = SpawnGhoul(c, e.ReviveX, e.ReviveY, e, nextId);
                Txt(res, e.ReviveX, e.ReviveY - 20, "💀구울화!", null, res.Ghoul.Col, 50);
                res.What = CorpseResult.Kind.Ghoul;
            }
            else
            {
                e.Alive = true; e.X = (float)e.ReviveX; e.Y = (float)e.ReviveY;
                e.Hp = e.MaxHp; e.State = "recover"; e.StateTicks = 60; e.Stunned = 0; e.KnockbackX = 0; e.KnockbackY = 0;
                e.Poise = e.MaxPoise; e.ReviveChase = true; e.Alerted = true;
                Txt(res, e.X, e.Y - 20, "💀본모습 부활!", null, e.Col ?? "#ffffff", 50);
                res.What = CorpseResult.Kind.OwnBody;
            }
            return res;
        }

        // ---- player ----
        public sealed class PlayerFallInput
        {
            public int Level; public double RevivePow, ReviveCdAffix, ReviveOnceAffix; public int PassiveDemon, PassiveHuman;
            public double WeakRevZone; // 0.10+(lv-1)*0.01 of the first weakRev zone containing the player, 0 when none
            public bool ReviveOnceUsed; public double DemonReviveCd; public double Roll; // Math.random()*100 pre-rolled
        }
        public sealed class PlayerFallResult
        {
            public bool ReviveOnce;     // die() returned early: full HP/MP/ST, iframes 120
            public double Chance, CdFrames; public bool CanRevive, Rolled;
            public double Roll;
        }
        // die() 43819-43840
        public static PlayerFallResult PlayerFall(PlayerFallInput i)
        {
            var r = new PlayerFallResult();
            if (i.ReviveOnceAffix > 0 && !i.ReviveOnceUsed) { r.ReviveOnce = true; return r; }
            double revPowBonus = i.RevivePow + i.WeakRevZone;
            double natPow = Math.Min(100, Trunc(i.Level * 0.03));
            double skPow = i.PassiveDemon * 2;
            r.Chance = Math.Min(100, Math.Max(0, natPow + skPow + revPowBonus * 100 - i.PassiveHuman * 10));
            r.CdFrames = Trunc(Math.Max(6000, 36000 - i.PassiveDemon * 1800) * (1 + i.ReviveCdAffix));
            r.CanRevive = r.Chance > 0 && i.DemonReviveCd <= 0;
            r.Roll = i.Roll; r.Rolled = true;
            return r;
        }
        // _fallenResolve success texts: "악마화 부활!" over the player, then the revive power
        public static List<ReviveText> FallenSuccessTexts(double x, double y, double chance)
        {
            return new List<ReviveText> {
                new ReviveText { X = x, Y = y - 50, Ko = "악마화 부활!", En = "Demon Revive!", Color = "#ff2200", Life = 120 },
                new ReviveText { X = x, Y = y - 25, Ko = "부활력 " + N(chance) + "%", En = "Revive Power " + N(chance) + "%", Color = "#ff8844", Life = 50 } };
        }
        // _fallenResolve 43940-43950: success when the pre-rolled roll is below the chance
        public static bool FallenSucceeds(bool canRevive, double roll, double chance) { return canRevive && roll < chance; }
    }
}
