using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // C01-AI host: everything updateE (after the DOT part) reads from globals or calls and that lives outside the enemy object.
    public interface IEnemyAiHost
    {
        double Rand();                                           // Math.random()
        double PX { get; } double PY { get; } double PRadius { get; } double PFacing { get; } double PIframes { get; }
        string PState { get; }                                   // P.s ('charge' blocks every hit)
        int Stage { get; }                                       // G.stage
        bool CanMove(double x, double y, double r);              // canMv
        bool IsWall(double x, double y);                         // isW
        void HurtPlayer(int damage, bool magic);                 // hurtP(dmg) / hurtP(dmg,{dtype:'magic'})
        void KnockPlayer(double kx, double ky);                  // P.kb.x/y += ...
        void ScaleKnock(double m);                               // P.kb.x/y *= m (M03)
        void FreezeSlow(double frames);                          // P._freezeSlow = max(P._freezeSlow, n)
        void StaggerPlayer(double frames);                       // P.s='stagger'; P.st2=n (eModHitP M01)
        double ElMul(double? attackerElement);                   // elMul(e.el, ar().el)
        bool IsParryWindow();                                    // isPWin()
        void Parry(EnemySpawn e, double atk);                    // P.parryBank += atk, "패링!" text, doParry, _poiseHit(e,20)
        void Text(double x, double y, string text, string color, int life);   // addTxt
        void Parts(double x, double y, string color, int count); // addParts
        void Shake(double n);
        void Sfx(string name);                                   // SFX.charge / groggy / magic / block ...
        IList<EnemySpawn> Query(double x, double y, double r);   // shQuery
        int EnemyCount { get; }                                  // ens.length
        IList<EnemySpawn> DeadPool { get; }                      // _deadPool
        EnemySpawn Create(double x, double y, int etype, double? el);   // mkEn(x,y,G.stage,etype,false,el,undefined)
        void AddEnemy(EnemySpawn e);                             // ens.push
        void ReviveCorpse(EnemySpawn corpse);                    // the shaman's revive of a corpse
        void Shot(EnemySpawn e, ProjSpec shot);                  // _emitEnemyShot (60 frame warning ring, then spawnProj)
        void Proj(EnemySpawn e, ProjSpec shot);                  // spawnProj directly
        void Teleported(EnemySpawn e, double x, double y);       // teleportE arrival (presentation hook; the oracle records it)
        void Zone(EnemySpawn e, string kind, double x, double y, double life, double r, double dmg, double el);   // ground zones spawned as zero-speed bullets (trap / iceZone / blizzard)
        double DotDur();                                         // pDotDur()
        double DotDmg();                                         // pDotDmg()
        void HurtDot(EnemySpawn e, int damage, bool maliceHunt, double? atkEl);   // hurtE(e,dmg,undefined,true,{dot:true,[maliceHunt:true,]shieldHit:true},atkEl)
    }

    // Field enemy AI of the web updateE for the 1-1 etypes (game.html 38950~41493), the part after the shared head (CX-03a) and the DOT block:
    // atk reset, elite modifier tick, projectile charge ring, per-etype idle skills, the state machine (idle / charges / swoop / slam / bash / summon / windup / attack / recover)
    // and the contact + projectile shot of the idle state. Boss branches (ib), rare etypes (90~99) and the etypes of chapters 2..7 are not ported here.
    public static class EnemyAi
    {
        const double EL_P = 0, EL_F = 1, EL_I = 2, EL_D = 3, EL_L = 4;
        static readonly string[] ElCol = { "#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44" };
        static readonly HashSet<int> NoProj = new HashSet<int> { 5, 9, 11, 20, 24, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59 };   // _noProjEtypes
        static readonly HashSet<int> KeepDistance = new HashSet<int> { 1, 7, 8, 9, 11, 16, 17, 21, 23, 25, 26, 31, 34, 38, 62 };
        static readonly HashSet<int> MeleeEt = new HashSet<int> { 0, 2, 4, 5, 6, 10, 12, 18, 19 };

        static double RangeOf(int et) { return et >= 0 && et < EnemyTables.Range.Length ? EnemyTables.Range[et] : 0; }   // ETYPE_RANGE[et]||fallback: undefined past the table (rare etypes 90+)
        static double Dst(double ax, double ay, double bx, double by) { double dx = ax - bx, dy = ay - by; return Math.Sqrt(dx * dx + dy * dy); }
        static double Spd(EnemySpawn e) { return e._aSpdM ?? 1; }
        static string ElColor(double? el) { int i = (int)(el ?? 0); return el.HasValue && i >= 0 && i < ElCol.Length ? ElCol[i] : null; }

        // canMv-guarded step (the web `nx=e.x+mx,ny=e.y+my;if(canMv(nx,ny,e.r)){e.x=nx;e.y=ny}`)
        static void Step(IEnemyAiHost h, EnemySpawn e, double mx, double my)
        {
            double nx = e.x + mx, ny = e.y + my;
            if (h.CanMove(nx, ny, e.r)) { e.x = nx; e.y = ny; }
        }
        // retreat from the player along e.facing (keep-distance etypes)
        static void Back(IEnemyAiHost h, EnemySpawn e, double sp, double mul)
        {
            double sm = e.speed * mul * Spd(e);
            Step(h, e, -JsMath.Cos(e.facing) * sm * sp, -JsMath.Sin(e.facing) * sm * sp);
        }
        static void Fwd(IEnemyAiHost h, EnemySpawn e, double sp, double mul)
        {
            double sm = e.speed * mul * Spd(e);
            Step(h, e, JsMath.Cos(e.facing) * sm * sp, JsMath.Sin(e.facing) * sm * sp);
        }

        // _eMouthXY(e, ang)
        static void Mouth(EnemySpawn e, double ang, out double x, out double y)
        {
            double off = (e.r != 0 ? e.r : 12) * .7, a = ang != 0 ? ang : (e.facing != 0 ? e.facing : 0);
            x = e.x + JsMath.Cos(a) * off; y = e.y + JsMath.Sin(a) * off;
        }

        // eProjAt(e, ang, spd, dmgMult, el, life, col, sz): _beanRoll then _emitEnemyShot
        public static void ProjAt(IEnemyAiHost h, EnemySpawn e, double ang, double spd, double dmgMult, double el, double life, string col, double sz)
        {
            life = Js.Int(life * 1.5);
            double bEl = el, bSz = sz, bSpd = spd, bDm = dmgMult; string bCol = ElColor(el) ?? col; bool red = false, gb = false, water = false, fire = false, homing = false;
            if (e.s != "eShootWind")
            {
                if (el == EL_P) { bCol = col != "" && col != null ? col : "#f4f4f4"; bSz = sz != 0 ? sz : 1.5; bSpd = spd * 1.3; bDm = 1.2; red = true; homing = true; }
                else if (el == EL_D) { bCol = "#a44cff"; bSz = sz != 0 ? sz : 1.6; bSpd = spd * 1.1; bDm = 1.0; gb = true; }
                else if (el == EL_I) { bCol = "#317cec"; bSz = sz != 0 ? sz : 1.6; bSpd = spd * 1.05; bDm = 1.2; water = true; homing = true; }
                else if (el == EL_F) { bCol = col != "" && col != null ? col : "#ff2e22"; bSz = sz != 0 ? sz : 1.6; bSpd = spd * 1.05; bDm = 1.2; fire = true; homing = true; }
                else { bCol = col != "" && col != null ? col : (ElColor(el) ?? "#ffaa00"); bSz = sz != 0 ? sz : 1.2; }
            }
            double mx, my; Mouth(e, ang, out mx, out my);
            h.Shot(e, new ProjSpec { X = mx, Y = my, Vx = JsMath.Cos(ang) * bSpd, Vy = JsMath.Sin(ang) * bSpd, Dmg = Js.Int(e.atk * bDm), El = (int)bEl, Life = life, Ml = life, Col = bCol, Sz = bSz, RedBean = red, Homing = homing, FireMagic = fire, Commit = true });
        }

        // ---- _fireChargedProj / _tickProjCharge --------------------------------------------------------------------------------------------------
        static void FireChargedProj(IEnemyAiHost h, EnemySpawn e)
        {
            double aim = JsMath.Atan2(h.PY - e.y, h.PX - e.x); e.facing = aim;
            string fb = e._projChargeBean;
            double rg = RangeOf((int)e.etype), range = rg != 0 ? rg : 600, pLife = Js.Int(range * .3);
            double vx = JsMath.Cos(e.facing), vy = JsMath.Sin(e.facing);
            string elc = ElColor(e.el) ?? e.col;
            ProjSpec s; Action parts;
            if (fb == "black") { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 4.4, Vy = vy * 4.4, Dmg = Js.Int(e.atk * 1.5), El = 0, Life = 400, Ml = 400, Col = "#00aa00", Sz = 2.0, BlackBean = true, Commit = true }; parts = () => h.Parts(e.x, e.y, "#00aa00", 3); }
            else if (fb == "red") { double l = Math.Max(200, pLife); s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 2.8, Vy = vy * 2.8, Dmg = Js.Int(e.atk * 2.5), El = 1, Life = l, Ml = l, Col = "#cc1100", Sz = 1.5, RedBean = true, Homing = true, Commit = true }; parts = () => h.Parts(e.x, e.y, "#cc1100", 3); }
            else if (fb == "dark") { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 3.3, Vy = vy * 3.3, Dmg = Js.Int(e.atk * 1), El = 3, Life = pLife, Ml = pLife, Col = "#a44cff", Sz = 1.6, Commit = true }; parts = () => h.Parts(e.x, e.y, "#a44cff", 3); }
            else if (fb == "fire") { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 3.2, Vy = vy * 3.2, Dmg = Js.Int(e.atk * 1.2), El = 1, Life = pLife, Ml = pLife, Col = "#ff2e22", Sz = 1.6, FireMagic = true, Commit = true }; parts = () => h.Parts(e.x, e.y, "#ff2e22", 3); }
            else if (fb == "water") { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 3.2, Vy = vy * 3.2, Dmg = Js.Int(e.atk * 1.2), El = 2, Life = pLife, Ml = pLife, Col = "#317cec", Sz = 1.6, Commit = true }; parts = () => h.Parts(e.x, e.y, "#317cec", 3); }
            else if (fb == "special") { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 3, Vy = vy * 3, Dmg = Js.Int(e.atk * 1), El = (int)(e.el ?? 0), ElementAbsent = !e.el.HasValue, Life = pLife, Ml = pLife, Col = elc, Sz = 2.5, Commit = true }; parts = () => h.Parts(e.x, e.y, e.col, 3); }
            else { s = new ProjSpec { X = e.x, Y = e.y, Vx = vx * 3, Vy = vy * 3, Dmg = Js.Int(e.atk * .8), El = (int)(e.el ?? 0), ElementAbsent = !e.el.HasValue, Life = pLife, Ml = pLife, Col = elc, Sz = 1.5, Commit = true }; parts = () => h.Parts(e.x, e.y, e.col, 2); }
            h.Proj(e, s); parts();
            e._projChargeT = 0; e._projChargeCol = null; e._projChargeBean = null; e._projChargeParryClass = null;   // _cancelProjCharge
        }

        static void TickProjCharge(IEnemyAiHost h, EnemySpawn e, double sp)
        {
            if (!(e._projChargeT > 0)) return;
            e._projChargeT -= sp;
            if (e._projChargeT <= 0) FireChargedProj(h, e);
        }

        // ---- eModHitP (the modifiers of hell 0 that act on a hit; M05/M18 belong to later chapters) ------------------------------------------------
        static void ModHitP(IEnemyAiHost h, EnemySpawn e)
        {
            if (e.mods == null || e.mods.Count == 0) return;   // eModHitP: `if(!e.mods||!e.mods.length)return;` precedes the chapter-1 _iceOnHit freeze
            {
                if (e.mods.Contains("M01") && h.Rand() < .1 && h.PState != "charge" && h.PState != "sBlock") { h.StaggerPlayer(60); h.Text(h.PX, h.PY - 20, "❄빙결!", "#88ccff", 30); h.Parts(h.PX, h.PY, "#88ccff", 8); }
                if (e.mods.Contains("M03")) h.ScaleKnock(2);
            }
            if (e._iceOnHit && h.Rand() < .35) { h.FreezeSlow(90); h.Text(h.PX, h.PY - 20, "❄빙결!", "#88ccff", 25); h.Parts(h.PX, h.PY, "#88ccff", 6); }
        }

        static void ChargeHit(IEnemyAiHost h, EnemySpawn e, double dmgMul, double knock, bool bigImpact, bool bash)
        {
            if (h.IsParryWindow()) { h.Parry(e, e.atk); return; }
            if (h.PState != "charge")
            {
                h.HurtPlayer(Js.Int(e.atk * dmgMul * h.ElMul(e.el)), false); ModHitP(h, e);
                double ang = JsMath.Atan2(h.PY - e.y, h.PX - e.x);
                h.KnockPlayer(JsMath.Cos(ang) * knock, JsMath.Sin(ang) * knock);
                if (bigImpact) h.Shake(10);
                if (bigImpact) h.Sfx("detonate");
                if (bash) { h.StaggerPlayer(40); h.Text(h.PX, h.PY - 20, "경직!", "#8888ff", 30); }
            }
        }

        // ============================================================================================================================================
        // updateE after "D4식 DOT": d = distance computed by the head
        // ============================================================================================================================================
        // JS String(number) for the whole-number stack counts of the DOT texts
        static string Num(double v) { return v == Math.Floor(v) && Math.Abs(v) < 1e15 ? ((long)v).ToString(System.Globalization.CultureInfo.InvariantCulture) : v.ToString("R", System.Globalization.CultureInfo.InvariantCulture); }

        // "D4식 DOT" block of updateE (hit-damage pools drained once per second), then the timers of the hit marks and the ice / malice-hunt DOT
        static void DotTick(IEnemyAiHost h, EnemySpawn e, double sp)
        {
            if (e.bleedT > 0)
            {
                e.bleedT -= sp / h.DotDur();
                if (Math.Floor(e.bleedT / 60) < Math.Floor((e.bleedT + sp) / 60))
                {
                    double sec = Math.Max(1, Math.Ceiling(e.bleedT / 60));
                    int dmg = Math.Max(1, Js.Int(e._bleedPool / sec * h.DotDmg()));
                    e._bleedPool = Math.Max(0, e._bleedPool - Math.Max(1, Js.Int(e._bleedPool / sec)));
                    double stk = Js.Or(e.bleedStk, 1);
                    h.HurtDot(e, dmg, false, null); h.Text(e.x, e.y - 18, "🩸" + Num(stk) + " -" + dmg, "#cc2222", 20); h.Parts(e.x, e.y, "#880000", 1 + Js.Int(stk / 3));
                }
                if (e.bleedT <= 0) { e.bleed = 0; e.bleedStk = 0; e._bleedPool = 0; }
            }
            if (e.poisonT > 0)
            {
                e.poisonT -= sp / h.DotDur();
                if (Math.Floor(e.poisonT / 60) < Math.Floor((e.poisonT + sp) / 60))
                {
                    double sec = Math.Max(1, Math.Ceiling(e.poisonT / 60));
                    int dmg = Math.Max(1, Js.Int(e._poisonPool / sec * h.DotDmg()));
                    e._poisonPool = Math.Max(0, e._poisonPool - Math.Max(1, Js.Int(e._poisonPool / sec)));
                    double stk = Js.Or(e.poisonStk, 1);
                    h.HurtDot(e, dmg, false, null); h.Parts(e.x, e.y, "#006600", 1 + Js.Int(stk / 3));
                }
                if (e.poisonT <= 0) { e.poison = 0; e.poisonStk = 0; e._poisonPool = 0; }
            }
            if (e.burnT > 0)
            {
                e.burnT -= sp / h.DotDur();
                if (Math.Floor(e.burnT / 60) < Math.Floor((e.burnT + sp) / 60))
                {
                    double sec = Math.Max(1, Math.Ceiling(e.burnT / 60));
                    int dmg = Math.Max(1, Js.Int(e._burnPool / sec * h.DotDmg()));
                    e._burnPool = Math.Max(0, e._burnPool - Math.Max(1, Js.Int(e._burnPool / sec)));
                    double stk = Js.Or(e.burnStk, 1);
                    h.HurtDot(e, dmg, false, EL_F); h.Text(e.x, e.y - 18, "🔥" + Num(stk) + " -" + dmg, "#ff6600", 20); h.Parts(e.x, e.y, "#ff4400", 1 + Js.Int(stk / 3));
                }
                if (e.burnT <= 0) { e.burnT = 0; e.burnStk = 0; e._burnPool = 0; }
            }
            if ((e._hrMarkT ?? 0) > 0) { e._hrMarkT -= sp; if (e._hrMarkT <= 0) { e._hrMark = 0; e._hrMarkT = 0; } }
            if ((e._bbStkT ?? 0) > 0) { e._bbStkT -= sp; if (e._bbStkT <= 0) { e._bbStk = 0; e._bbStkT = 0; } }
            if ((e._iceDotT ?? 0) > 0)
            {
                e._iceDotT -= sp;
                e.spd = Js.Or(e.baseSpd, Js.Or(e.spd ?? 0, 2)) * .55;
                if (Math.Floor(e._iceDotT.Value / 60) < Math.Floor((e._iceDotT.Value + sp) / 60))
                {
                    int ice = (int)Math.Max(1, Js.Or(e._iceDotDmg ?? 0, Js.Int(e.mhp * .008)));
                    h.HurtDot(e, ice, false, EL_I); h.Text(e.x, e.y - 18, "-" + ice, "#88ccff", 20); h.Parts(e.x, e.y, "#4499ff", 2);
                }
                if (e._iceDotT <= 0) { e._iceDotT = 0; e._iceSlowed = false; e.spd = Js.Or(e.baseSpd, Js.Or(e.spd ?? 0, 2)); }
            }
            if ((e._mhDot ?? 0) > 0)
            {
                e._mhDot -= sp;
                if (Math.Floor(e._mhDot.Value / 40) < Math.Floor((e._mhDot.Value + sp) / 40))
                {
                    int mh = (int)Math.Max(1, Js.Or(e._mhDotDmg ?? 0, Js.Int(e.mhp * .02)));
                    h.HurtDot(e, mh, true, EL_P);
                    if (h.Rand() > .5) { h.Rand(); h.Rand(); h.Rand(); h.Rand(); h.Rand(); h.Rand(); }   // poolPart(e.x+(r-.5)*8, e.y+(r-.5)*8, (r-.5)*2, -1-r, col, 2+r*2, 10+r*6): cosmetic, draws only
                }
                if (e._mhDot <= 0) { e._mhDot = 0; e._mhDotDmg = 0; }
            }
        }

        public static void UpdateBody(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            double px = h.PX, py = h.PY, pr = h.PRadius;
            DotTick(h, e, sp);
            e.atk = e.baseAtk;   // _isDruidFinale(e) is false for field enemies
            if ((e._tpFlashT ?? 0) > 0) e._tpFlashT -= sp;
            if (e.mods != null && e.mods.Count > 0) EliteTick(h, e, sp, d);
            if (e._aAtkM.HasValue && e._aAtkM.Value != 1) e.atk = Js.Int(e.atk * e._aAtkM.Value);
            bool chgCommit = e.s == "eChargeWind" || e.s == "eCharge";
            TickProjCharge(h, e, sp);
            if (!chgCommit)
            {
                if (e._alerted != true && !e.ib && d > 400) return;
                if (h.PIframes > 0 && e._alerted != true && !e.ib && d > 400) return;
            }
            e._moveAng = JsMath.Atan2(py - e.y, px - e.x); e.st2 -= sp;   // no flow field: _ffDir is null
            int et = (int)e.etype;
            string s0 = e.s;
            if (et == 5 && e.s == "idle" && d < 35 + pr) { e.s = "windup"; e.st2 = 20; }
            if (et == 6) Etype6Escort(h, e, sp);
            if (et == 6 && e.s == "idle") Etype6Bash(h, e, sp, d);
            if (et == 7 && e.s == "idle") Lich(h, e, sp, d);
            if (et == 9 && e.s == "idle") Shaman(h, e, sp, d);
            if (et == 10 && e.s == "idle") Shadow(h, e, sp, d);
            if (et == 11 && e.s == "idle") Womb(h, e, sp, d);
            if (et == 12 && !e._enraged && e.hp < e.mhp * .4)
            {
                e._enraged = true; e.speed *= 2.2; e.baseAtk = Js.Int(e.baseAtk * 1.5); e.atk = e.baseAtk;
                h.Text(e.x, e.y - 20, "💢광폭!", "#ff0000", 40); h.Parts(e.x, e.y, "#ff0000", 15); if (Dst(e.x, e.y, px, py) < 800) h.Sfx("groggy");
                h.Shake(5);
            }
            if (et == 13 && e.s == "idle")
            {
                e.webT -= sp;
                if (e.webT <= 0 && d < 1200 && d > 30)
                {
                    double wa = JsMath.Atan2(py - e.y, px - e.x);
                    h.Shot(e, new ProjSpec { X = e.x, Y = e.y, Vx = JsMath.Cos(wa) * 3, Vy = JsMath.Sin(wa) * 3, Dmg = Js.Int(e.atk * .5), El = 0, Life = 200, Ml = 200, Col = "#aaaaaa", Sz = 1.2, Web = true });
                    e.webT = e.webCd; h.Parts(e.x, e.y, "#aaaaaa", 3);
                }
            }
            if (et == 14 && e.s == "idle") Swooper(h, e, sp, d, false);
            if (et == 16 && e.s == "idle") Trapper(h, e, sp, d);
            if (et == 17 && e.s == "idle") Mother(h, e, sp, d);
            if (et == 19 && e.s == "idle")
            {
                e.slamT -= sp;
                if (e.slamT <= 0 && d < 80) { e.s = "eSlamWind"; e.st2 = 40; e.slamT = e.slamCd; h.Text(e.x, e.y - 20, "💀", "#cc4444", 30); }
            }
            if (et == 22 && e.s == "idle") FrostWolf(h, e, sp, d);
            if (et == 24 && e.s == "idle" && d < e.r + pr + 8) { h.FreezeSlow(90); h.Text(px, py - 20, "❄빙결!", "#5588aa", 30); h.Parts(px, py, "#88ccff", 6); }
            if (et == 25 && e.s == "idle")
            {
                e._iceSlimeT -= sp;
                if (e._iceSlimeT <= 0) { h.Zone(e, "iceZone", e.x, e.y, 480, 2, 0, EL_D); e._iceSlimeT = e._iceSlimeCd; h.Parts(e.x, e.y, "#5e10a8", 3); }
            }
            if (et == 26 && e.s == "idle")
            {
                e._iceBlizzT -= sp;
                if (e._iceBlizzT <= 0 && d < 1200)
                {
                    double zx = px + (h.Rand() - .5) * 60, zy = py + (h.Rand() - .5) * 60;
                    h.Zone(e, "blizzard", zx, zy, 180, 3, Js.Int(e.atk * .3), EL_D);
                    e._iceBlizzT = e._iceBlizzCd; h.Text(e.x, e.y - 15, "🌑", "#5e10a8", 30); h.Sfx("magic");
                }
            }
            if (et == 27 && e.s == "idle") BatSwoop(h, e, sp, d);
            if (et == 28 && e.s == "idle")
            {
                e._iceSlamT -= sp;
                if (e._iceSlamT <= 0 && d < 100)
                {
                    e.s = "eSlamWind"; e.st2 = 50; e._iceSlamT = e._iceSlamCd; h.Text(e.x, e.y - 20, "❄빙결파!", "#6699bb", 40);
                    if (d < 90) { h.FreezeSlow(120); h.Parts(px, py, "#88ccff", 10); }
                }
            }
            if (et == 29 && e.s == "idle") IceDemon(h, e, sp, d);
            if (et == 47 && e.s == "idle") ShadowTwin(h, e, sp, d);

            // ---- state machine -------------------------------------------------------------------------------------------------------------------
            StateMachine(h, e, sp, d, et);
        }

        static void EliteTick(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            var m = e.modT; double px = h.PX, py = h.PY;
            if (e.mods.Contains("M04")) { m.regen += sp; if (m.regen >= 120) { m.regen = 0; int hl = Js.Int(e.mhp * .05); e.hp = Math.Min(e.mhp, e.hp + hl); if (d < 300) h.Text(e.x, e.y - 18, "+" + hl, "#44ff88", 18); } }
            m.eliteBusy = Math.Max(0, m.eliteBusy - sp);   // _tickEliteAttackLock
            if (e.mods.Contains("M29") && e.s == "idle" && d > 140 && d < 520)
            {
                m.eliteCharge += sp;
                if (m.eliteCharge >= 540 && m.eliteBusy <= 0)
                {
                    m.eliteBusy = 78; m.eliteCharge = 0; double a = JsMath.Atan2(py - e.y, px - e.x); e.facing = a; e.echDx = JsMath.Cos(a); e.echDy = JsMath.Sin(a);
                    e.s = "eChargeWind"; e.st2 = 60; e._chgAimMax = 60; e._chgDur = 18; e._chgSpd = 32; e._chgLen = 640 + e.r; e._chgVisLen = e._chgLen;
                }
            }
            if (e.mods.Contains("M30") && d < 800)
            {
                m.eliteRing += sp;
                if (m.eliteRing >= 480 && m.eliteBusy <= 0)
                {
                    m.eliteBusy = 54; m.eliteRing = 0; if (e._eliteZones == null) e._eliteZones = new List<EliteZone>();
                    e._eliteZones.Add(new EliteZone { x = px, y = py, t = 54, dur = 54, r = 125, kind = "burst", col = "#ff2438" });
                }
            }
            if (e.mods.Contains("M31"))
            {
                if (e._eliteBoltWarn > 0)
                {
                    e._eliteBoltWarn -= sp;
                    if (e._eliteBoltWarn <= 0) { double a = e._eliteBoltAim; ProjAt(h, e, a - .24, 3, .72, EL_L, 260, "#ffee44", 3.5); ProjAt(h, e, a, 3, .72, EL_L, 260, "#ffee44", 3.5); ProjAt(h, e, a + .24, 3, .72, EL_L, 260, "#ffee44", 3.5); }
                }
                else if (d < 850)
                {
                    m.eliteBolt += sp;
                    if (m.eliteBolt >= 360 && m.eliteBusy <= 0) { m.eliteBusy = 45; m.eliteBolt = 0; e._eliteBoltAim = JsMath.Atan2(py - e.y, px - e.x); e._eliteBoltWarn = 45; }
                }
            }
            if (e.mods.Contains("M32") && d < 1100)
            {
                m.eliteMortar += sp;
                if (m.eliteMortar >= 600 && m.eliteBusy <= 0)
                {
                    m.eliteBusy = 126; m.eliteMortar = 0; if (e._eliteZones == null) e._eliteZones = new List<EliteZone>();
                    double a = JsMath.Atan2(py - e.y, px - e.x), zx = px, zy = py;
                    for (int i = -1; i <= 1; i++)
                    {
                        double off = i * 92;
                        e._eliteZones.Add(new EliteZone { x = zx - JsMath.Sin(a) * off, y = zy + JsMath.Cos(a) * off, t = 78 + (i + 1) * 24, dur = 78 + (i + 1) * 24, r = 68, kind = "mortar", col = "#ff3322" });
                    }
                }
            }
            if (e._eliteZones != null && e._eliteZones.Count > 0)
            {
                for (int zi = e._eliteZones.Count - 1; zi >= 0; zi--)
                {
                    var z = e._eliteZones[zi]; z.t -= sp;
                    if (z.t <= 0)
                    {
                        bool hit = Dst(px, py, z.x, z.y) <= z.r;
                        if (hit && h.PIframes <= 0 && h.PState != "charge") { h.HurtPlayer(Math.Max(1, Js.Int(e.atk * (z.kind == "mortar" ? .8 : .65))), true); h.Text(px, py - 18, z.kind == "mortar" ? "💥포격!" : "충격파! ", z.col, 22); }
                        h.Parts(z.x, z.y, z.col, z.kind == "mortar" ? 18 : 12);
                        e._eliteZones.RemoveAt(zi);
                    }
                }
            }
        }

        static void Etype6Escort(IEnemyAiHost h, EnemySpawn e, double sp)
        {
            if (e.eShield > 0 && e.s == "idle")
            {
                EnemySpawn target = null; double escDist = 150;
                var near = h.Query(e.x, e.y, 150);
                for (int i = 0; i < near.Count; i++) { var oe = near[i]; if (oe != e && (oe.etype == 1 || oe.etype == 7 || oe.etype == 8)) { double od = Dst(oe.x, oe.y, e.x, e.y); if (od < escDist) { escDist = od; target = oe; } } }
                if (target != null)
                {
                    double gx = target.x + (h.PX - target.x) * 0.6, gy = target.y + (h.PY - target.y) * 0.6, toG = JsMath.Atan2(gy - e.y, gx - e.x), gDist = Dst(gx, gy, e.x, e.y);
                    if (gDist > 10) Step(h, e, JsMath.Cos(toG) * e.speed * 1.2 * Spd(e) * sp, JsMath.Sin(toG) * e.speed * 1.2 * Spd(e) * sp);
                    e._escorting = true;
                }
                else e._escorting = false;
            }
            else e._escorting = false;
        }

        static void Etype6Bash(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            double toP = JsMath.Atan2(h.PY - e.y, h.PX - e.x), sd = toP - e.shieldAng;
            while (sd > Math.PI) sd -= Math.PI * 2; while (sd < -Math.PI) sd += Math.PI * 2;
            e.shieldAng += sd * 0.08 * sp; e.shieldBashT -= sp;
            if (e.eShield <= 0 && e.shieldBashT <= 0 && d < 150 && d > 30)
            {
                e.s = "eShieldBash"; e.st2 = 20; e.echDx = JsMath.Cos(e.facing); e.echDy = JsMath.Sin(e.facing); e.shieldBashT = e.shieldBashCd;
                h.Text(e.x, e.y - 15, "🛡突!", "#6688cc", 30); h.Sfx("charge");
            }
        }

        static void Lich(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.teleportT -= sp; e.summonT -= sp;
            if (e._tpWarnT > 0)
            {
                e._tpWarnT -= sp;
                if (e._tpWarnT <= 0)
                {
                    Teleport(h, e, e._tpWarnX, e._tpWarnY, "#8833cc"); e.teleportT = e.teleportCd; e._tpWarnT = 0;
                    ProjAt(h, e, JsMath.Atan2(h.PY - e.y, h.PX - e.x), 3, 0.8, e.el ?? 0, 200, "#8833cc", 2);
                }
            }
            else if (d < 100 && e.teleportT <= 0)
            {
                double a = h.Rand() * Math.PI * 2, td = 150 + h.Rand() * 50, tx = h.PX + JsMath.Cos(a) * td, ty = h.PY + JsMath.Sin(a) * td;
                if (h.CanMove(tx, ty, e.r)) { e._tpWarnT = 120; e._tpWarnMax = 120; e._tpWarnX = tx; e._tpWarnY = ty; e._tpWarnCol = "#8833cc"; }
                else e.teleportT = 30;
            }
            if (e.summonT <= 0)
            {
                var near = h.Query(e.x, e.y, 200); int nearby = 0;
                for (int i = 0; i < near.Count; i++) { var oe = near[i]; if (oe != e && Dst(oe.x, oe.y, e.x, e.y) < 200) nearby++; }
                if (nearby < 4) { e.s = "eSummon"; e.st2 = 40; h.Text(e.x, e.y - 15, "💀소환!", "#8833cc", 35); }
                else e.summonT = 60;
            }
        }

        // teleportE(e,nx,ny,col,n): the landing slam on the player (non-boss) + the move; effects other than the slam are presentation
        static bool Teleport(IEnemyAiHost h, EnemySpawn e, double nx, double ny, string col)
        {
            if (!h.CanMove(nx, ny, e.r)) return false;
            double r = e.r != 0 ? e.r : 12; e.x = nx; e.y = ny; h.Teleported(e, nx, ny);
            if (!e.ib && h.PIframes <= 0 && h.PState != "charge")
            {
                double landR = (r + 10) * 2;
                if (Dst(h.PX, h.PY, nx, ny) < landR + h.PRadius)
                {
                    h.HurtPlayer(Js.Int(e.atk * 10.5 * h.ElMul(e.el)), false); ModHitP(h, e);
                    double la = JsMath.Atan2(h.PY - ny, h.PX - nx); h.KnockPlayer(JsMath.Cos(la) * 120, JsMath.Sin(la) * 120);
                    h.Text(h.PX, h.PY - 25, "충격파!", col, 30);
                }
            }
            return true;
        }

        static void Shaman(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.reviveT -= sp;
            if (e.reviveT <= 0)
            {
                EnemySpawn corpse = null; var dead = h.DeadPool;
                for (int i = 0; i < dead.Count; i++) { var oe = dead[i]; if (!oe.ib && oe.etype != 9 && !oe._absorbed && Dst(oe.x, oe.y, e.x, e.y) < 150) { corpse = oe; break; } }
                if (corpse != null)
                {
                    h.ReviveCorpse(corpse);
                    h.Text(e.x, e.y - 15, "🔮주술!", "#8833cc", 30); h.Parts(e.x, e.y, "#8833cc", 6);
                    e.reviveT = e.reviveCd;
                }
                else e.reviveT = 60;
            }
            if (d < 100) Back(h, e, sp, 1);
        }

        static void Shadow(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.stealthT -= sp;
            if (!e._cloaked && e.stealthT <= 0 && d < 1200) { e._cloaked = true; e.stealthT = e.stealthCd; h.Text(e.x, e.y - 15, "...", "#aaaaaa", 20); h.Parts(e.x, e.y, "#222", 6); }
            if (e._cloaked && d < 1200)
            {
                double ba = h.PFacing + Math.PI, bx = h.PX + JsMath.Cos(ba) * 35, by = h.PY + JsMath.Sin(ba) * 35;
                if (h.CanMove(bx, by, e.r)) { h.Parts(e.x, e.y, "#222", 8); e.x = bx; e.y = by; h.Parts(e.x, e.y, "#aa2222", 10); }
                e._cloaked = false; e._telegraphT = 20; e.s = "windup"; e.st2 = 10;
            }
        }

        static void Womb(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.wombT -= sp;
            if (e.wombT <= 0)
            {
                int nearCnt = h.Query(e.x, e.y, 200).Count;
                if (nearCnt < 6) { e.s = "eSummon"; e.st2 = 35; h.Text(e.x, e.y - 15, "🩸산란!", "#8b3a3a", 30); }
                else e.wombT = 60;
            }
            if (d < 120) Back(h, e, sp, 1);
        }

        static void Swooper(IEnemyAiHost h, EnemySpawn e, double sp, double d, bool bat)
        {
            e.swoopT -= sp;
            if (e.swoopT <= 0 && d < 1200 && d > 60)
            {
                e._swoopOx = e.x; e._swoopOy = e.y; e.s = "eSwoop"; e.st2 = 18; e.echDx = JsMath.Cos(e.facing); e.echDy = JsMath.Sin(e.facing);
                e.swoopT = e.swoopCd; h.Text(e.x, e.y - 15, "🦅", "#88cc88", 25); h.Sfx("charge");
            }
            if (d > 60 && d < 1200) Orbit(h, e, sp, 150, .04);
        }

        static void Orbit(IEnemyAiHost h, EnemySpawn e, double sp, double radius, double rate)
        {
            double orbA = JsMath.Atan2(e.y - h.PY, e.x - h.PX) + rate * sp, tx = h.PX + JsMath.Cos(orbA) * radius, ty = h.PY + JsMath.Sin(orbA) * radius, toA = JsMath.Atan2(ty - e.y, tx - e.x);
            Step(h, e, JsMath.Cos(toA) * e.speed * Spd(e) * sp, JsMath.Sin(toA) * e.speed * Spd(e) * sp);
        }

        static void Trapper(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.trapT -= sp;
            if (e.trapT <= 0 && d < 250)
            {
                h.Zone(e, "trap", e.x, e.y, 600, .8, Js.Int(e.atk * 1.5), e.el ?? 0);
                e.trapT = e.trapCd; h.Text(e.x, e.y - 10, "⚠", "#ff3a00", 20); h.Parts(e.x, e.y, "#ff6600", 4);
            }
            if (d < 100) Back(h, e, sp, 1);
        }

        static void Mother(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e.motherT -= sp;
            if (e.motherT <= 0)
            {
                int nearCnt = h.Query(e.x, e.y, 200).Count;
                if (nearCnt < 8)
                {
                    int cnt = 2 + Js.Int(h.Rand() * 2);
                    for (int mi = 0; mi < cnt; mi++)
                    {
                        double a = Math.PI * 2 * mi / cnt, sx = e.x + JsMath.Cos(a) * 25, sy = e.y + JsMath.Sin(a) * 25;
                        if (h.CanMove(sx, sy, 6)) { var ne = h.Create(sx, sy, 13, e.el); if (ne != null) h.AddEnemy(ne); }
                    }
                    h.Text(e.x, e.y - 15, "🕷산란!", "#6b2a2a", 35); h.Parts(e.x, e.y, "#6b2a2a", 10); h.Sfx("magic");
                    e.motherT = e.motherCd;
                }
                else e.motherT = 60;
            }
            if (d < 150) Back(h, e, sp, 1);
        }

        // _chgPathClear(e, len)
        static bool ChgPathClear(IEnemyAiHost h, EnemySpawn e, double len)
        {
            double a = JsMath.Atan2(h.PY - e.y, h.PX - e.x), dx = JsMath.Cos(a), dy = JsMath.Sin(a), mx = Math.Min(len != 0 ? len : 300, Dst(h.PX, h.PY, e.x, e.y) + e.r + 24);
            for (double t = e.r; t < mx; t += 12) if (h.IsWall(e.x + dx * t, e.y + dy * t)) return false;
            return true;
        }

        static void FrostWolf(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e._iceChargeT -= sp;
            if (e._iceChargeT <= 0 && d < 1200 && d > 40 && ChgPathClear(h, e, 798 + e.r))
            {
                double ca = JsMath.Atan2(h.PY - e.y, h.PX - e.x); e.echDx = JsMath.Cos(ca); e.echDy = JsMath.Sin(ca); e.facing = ca;
                e.s = "eChargeWind"; e.st2 = 90; e._chgAimMax = 90; e._chgDur = 19; e._chgSpd = 42; e._chgLen = 798 + e.r;
                e._iceChargeT = e._iceChargeCd; h.Text(e.x, e.y - 15, "🐺", "#aaddff", 25); h.Sfx("charge");
            }
            if (d < 80) { h.FreezeSlow(3); if (h.Rand() < .02 * sp) h.Text(h.PX, h.PY - 20, "❄서리!", "#aaddff", 20); }
        }

        static void BatSwoop(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e._iceSwoopT -= sp;
            if (e._iceSwoopT <= 0 && d < 1200 && d > 50)
            {
                e._iceSwoopOx = e.x; e._iceSwoopOy = e.y; e.s = "eSwoop"; e.st2 = 15; e.echDx = JsMath.Cos(e.facing); e.echDy = JsMath.Sin(e.facing);
                e._iceSwoopT = e._iceSwoopCd; h.Text(e.x, e.y - 15, "🦇", "#aabbee", 25); h.Sfx("charge");
                for (int ib = 0; ib < 2; ib++) { double ia = e.facing + (h.Rand() - .5) * .6; ProjAt(h, e, ia, 2.5, .8, EL_I, 180, "#aabbee", 1.5); }
            }
            if (d > 50 && d < 1200) Orbit(h, e, sp, 120, .05);
        }

        static void IceDemon(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e._iceSlamT -= sp;
            if (e._iceSlamT <= 0 && d < 120)
            {
                e.s = "eSlamWind"; e.st2 = 45; e._iceSlamT = e._iceSlamCd; h.Text(e.x, e.y - 20, "💀빙마!", "#4455aa", 40);
                for (int ip = 0; ip < 8; ip++) ProjAt(h, e, Math.PI * 2 * ip / 8, 3, 1.2, EL_I, 300, "#4455aa", 2);
                if (d < 100) { h.FreezeSlow(120); h.Parts(h.PX, h.PY, "#88ccff", 12); }
                h.Shake(8); if (Dst(e.x, e.y, h.PX, h.PY) < 800) h.Sfx("groggy");
            }
            if (d > 150 && d < 1200 && h.Rand() < .008 * sp)
            {
                e.s = "eCharge"; e.st2 = 25; e.echDx = JsMath.Cos(e.facing); e.echDy = JsMath.Sin(e.facing);
                h.Text(e.x, e.y - 15, "돌진!", "#4455aa", 30); h.Sfx("charge");
            }
        }

        static void ShadowTwin(IEnemyAiHost h, EnemySpawn e, double sp, double d)
        {
            e._stCloneT -= sp; e._stTpCd -= sp;
            if (e._stCloneT <= 0 && h.EnemyCount < 200)
            {
                e._stCloneT = e._stCloneCd;
                double cx = e.x + (h.Rand() - .5) * 60, cy = e.y + (h.Rand() - .5) * 60;
                var clone = h.Create(cx, cy, 40, Js.Or(e.el ?? 0, EL_D));   // e.el||EL.D: element 0 (physical) is falsy too   // the web builds the 원령 clone but never pushes it into ens
                if (clone != null) { clone.hp = Js.Int(clone.hp * .3); clone.mhp = clone.hp; clone.eShield = 0; clone.eShieldMax = 0; clone.atk = Js.Int(clone.atk * .5); }
                h.Text(e.x, e.y - 15, "분신!", "#cc44ff", 25); h.Parts(e.x, e.y, "#cc44ff", 6);
            }
            if (e._tpWarnT > 0)
            {
                e._tpWarnT -= sp;
                if (e._tpWarnT <= 0) { Teleport(h, e, e._tpWarnX, e._tpWarnY, "#cc44ff"); e._stTpCd = 120 + h.Rand() * 40; e._tpWarnT = 0; }
            }
            else if (e._stTpCd <= 0 && d < 1200 && d > 60)
            {
                double ta = h.Rand() * Math.PI * 2, td = 60 + h.Rand() * 40, nx = h.PX + JsMath.Cos(ta) * td, ny = h.PY + JsMath.Sin(ta) * td;
                if (h.CanMove(nx, ny, e.r)) { e._tpWarnT = 120; e._tpWarnMax = 120; e._tpWarnX = nx; e._tpWarnY = ny; e._tpWarnCol = "#cc44ff"; }
                else e._stTpCd = 30;
            }
        }

        // ---- the switch(e.s) of updateE, the states reachable by the 1-1 etypes + the common tail ---------------------------------------------------
        static void StateMachine(IEnemyAiHost h, EnemySpawn e, double sp, double d, int et)
        {
            double px = h.PX, py = h.PY, pr = h.PRadius;
            switch (e.s)
            {
                case "idle": Idle(h, e, sp, d, et); break;
                case "eChargeWind":
                {
                    double lockAt = (e._chgAimMax != 0 ? e._chgAimMax : 60) * .755;
                    if (e.st2 > lockAt) { double ca = JsMath.Atan2(py - e.y, px - e.x); e.echDx = JsMath.Cos(ca); e.echDy = JsMath.Sin(ca); e.facing = ca; e._chgVisLen = null; }
                    if (e._chgVisLen == null)
                    {
                        double vl = e._chgLen != 0 ? e._chgLen : 100;
                        for (double ct = e.r; ct < vl; ct += 12) if (h.IsWall(e.x + e.echDx * ct, e.y + e.echDy * ct)) { vl = ct; break; }
                        e._chgVisLen = vl;
                    }
                    if (h.Rand() < .3 * sp) { h.Rand(); h.Rand(); }   // poolPart velocity draws (presentation only, the draws are kept)
                    if (e.st2 <= 0) { e.s = "eCharge"; e.st2 = e._chgDur != 0 ? e._chgDur : 20; e._chgVisLen = null; }
                    break;
                }
                case "eCharge":
                {
                    double spd = (e._chgSpd != 0 ? e._chgSpd : 5) * sp, ox = e.x, oy = e.y, nx = e.x + e.echDx * spd, ny = e.y + e.echDy * spd;
                    if (h.CanMove(nx, ny, e.r)) { e.x = nx; e.y = ny; } else { e.s = "recover"; e.st2 = 30; break; }
                    double sgx = e.x - ox, sgy = e.y - oy, sl2 = sgx * sgx + sgy * sgy, st = sl2 > 0 ? ((px - ox) * sgx + (py - oy) * sgy) / sl2 : 0;
                    st = st < 0 ? 0 : st > 1 ? 1 : st;
                    double scx = ox + sgx * st, scy = oy + sgy * st;
                    if (Dst(px, py, scx, scy) < pr + e.r + 18 && h.PIframes <= 0) { ChargeHit(h, e, 30, 100, true, false); e.s = "recover"; e.st2 = 30; break; }
                    if (h.Rand() > .5) { h.Rand(); h.Rand(); }   // trail particle draws (x, y jitter)
                    if (e.st2 <= 0) { e.s = "recover"; e.st2 = 30; }
                    break;
                }
                case "eSwoop":
                {
                    double spd = 6 * sp, nx = e.x + e.echDx * spd, ny = e.y + e.echDy * spd;
                    if (h.CanMove(nx, ny, e.r)) { e.x = nx; e.y = ny; } else { e.s = "recover"; e.st2 = 25; break; }
                    if (Dst(px, py, e.x, e.y) < pr + e.r + 8 && h.PIframes <= 0) { ChargeHit(h, e, 1.8, 6, false, false); e.s = "recover"; e.st2 = 35; break; }
                    if (h.Rand() > .4) { h.Rand(); h.Rand(); }
                    if (e.st2 <= 0) { e.s = "recover"; e.st2 = 35; }
                    break;
                }
                case "eSlamWind":
                    if (e.st2 <= 0)
                    {
                        double sR = 70 + e.r;
                        if (Dst(px, py, e.x, e.y) < sR && h.PIframes <= 0 && h.PState != "charge")
                        {
                            h.HurtPlayer(Js.Int(e.atk * 2 * h.ElMul(e.el)), false);
                            double ang = JsMath.Atan2(py - e.y, px - e.x); h.KnockPlayer(JsMath.Cos(ang) * 10, JsMath.Sin(ang) * 10);
                        }
                        var sl = h.Query(e.x, e.y, sR);
                        for (int i = 0; i < sl.Count; i++) { var oe = sl[i]; if (oe != e && oe.alive && Dst(oe.x, oe.y, e.x, e.y) < sR) { double oa = JsMath.Atan2(oe.y - e.y, oe.x - e.x); oe.kb.x += JsMath.Cos(oa) * 6; oe.kb.y += JsMath.Sin(oa) * 6; } }
                        h.Parts(e.x, e.y, e.col, 20); h.Shake(8); h.Sfx("groggy");
                        e.shockR = 0; e.shockMax = sR; e.s = "recover"; e.st2 = 50;
                    }
                    break;
                case "eShootWind": if (e.st2 <= 0) { e.s = "idle"; } break;
                case "eSelfDestruct": e.s = "idle"; e.st2 = 30; break;
                case "eShieldBash":
                {
                    double spd = 4.5 * sp, nx = e.x + e.echDx * spd, ny = e.y + e.echDy * spd;
                    if (h.CanMove(nx, ny, e.r)) { e.x = nx; e.y = ny; } else { e.s = "recover"; e.st2 = 20; break; }
                    if (Dst(px, py, e.x, e.y) < pr + e.r + 8 && h.PIframes <= 0) { ChargeHit(h, e, 1.3, 10, false, true); e.s = "recover"; e.st2 = 30; break; }
                    if (h.Rand() > .5) { h.Rand(); h.Rand(); }
                    if (e.st2 <= 0) { e.s = "recover"; e.st2 = 25; }
                    break;
                }
                case "eSummon": Summon(h, e); break;
                case "windup": if (e.st2 <= 0) { e.s = "attack"; e.st2 = e.etype == 3 ? 5 : 8; } break;
                case "attack":
                    if (e.st2 <= 5 && e.st2 + sp > 5)
                    {
                        double mAng = JsMath.Atan2(py - e.y, px - e.x), mx, my; Mouth(e, mAng, out mx, out my);
                        double mSpd = e.ib ? 5 : 4, mLife = e.ib ? 80 : 60, mSz = e.ib ? 2.5 : 2.0;
                        h.Shot(e, new ProjSpec { X = mx, Y = my, Vx = JsMath.Cos(mAng) * mSpd, Vy = JsMath.Sin(mAng) * mSpd, Dmg = Js.Int(e.atk * 1.0), El = (int)(e.el ?? 0), ElementAbsent = !e.el.HasValue, Life = mLife, Ml = mLife, Col = ElColor(e.el) ?? e.col, Sz = mSz });
                        h.Parts(e.x, e.y, !string.IsNullOrEmpty(e.col) ? e.col : "#ffaa00", 3);
                    }
                    if (e.st2 <= 0) { e.s = "recover"; e.st2 = 35; }
                    break;
                case "recover":
                    if (e.st2 <= 0) { e.s = "idle"; e.st2 = e.ib ? 3 + h.Rand() * 5 : 15 + h.Rand() * 15; }
                    break;
            }
        }

        static void Summon(IEnemyAiHost h, EnemySpawn e)
        {
            string col = e.etype == 11 ? "#8b3a3a" : "#8833cc";
            if (h.Rand() > .5) { h.Rand(); h.Rand(); h.Rand(); }   // poolPart draws (x, y jitter, size)
            if (e.st2 <= 0)
            {
                int cnt = e.etype == 11 ? (2 + Js.Int(h.Rand() * 2)) : (1 + Js.Int(h.Rand() * 2));
                for (int si = 0; si < cnt; si++)
                {
                    double a = Math.PI * 2 * si / cnt + h.Rand(), sd = 30 + h.Rand() * 20, sx = e.x + JsMath.Cos(a) * sd, sy = e.y + JsMath.Sin(a) * sd;
                    double el = Js.Int(h.Rand() * 6);   // [EL.P,EL.F,EL.I,EL.D,EL.L,EL.H][~~(random*6)] = the index
                    var ne = h.Create(sx, sy, 3, el);
                    if (ne != null) { ne.hp = Js.Int(ne.hp * .5); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0; h.AddEnemy(ne); }
                    h.Parts(sx, sy, col, 8);
                }
                h.Text(e.x, e.y - 20, cnt + "체 소환!", col, 35); h.Sfx("charge");
                if (e.etype == 11) e.wombT = e.wombCd; else e.summonT = e.summonCd;
                e.s = "recover"; e.st2 = 50;
            }
        }

        static void Idle(IEnemyAiHost h, EnemySpawn e, double sp, double d, int et)
        {
            double pr = h.PRadius;
            if (et == 6 && e._escorting) { }
            else if (et == 14 || et == 27 || et == 66) { }
            else if (KeepDistance.Contains(et))
            {
                if (d < 80) Back(h, e, sp, .6);
                else if (d > 200) Fwd(h, e, sp, 1.2);
            }
            else Fwd(h, e, sp, 1.6);   // the strafe / orbit branches need G.atkTickets >= maxAtkTickets, which never happens (atkTicketRequest grants without counting)
            // separation
            if (!e.ib && e.s == "idle" && e._sepCd <= 0)
            {
                var near = h.Query(e.x, e.y, e.r * 4.4); double sx = 0, sy = 0;
                for (int i = 0; i < near.Count; i++)
                {
                    var oe = near[i]; if (oe == e || !oe.alive) continue;
                    double odx = e.x - oe.x, ody = e.y - oe.y, od2 = odx * odx + ody * ody, minD = e.r + oe.r + 4;
                    if (od2 < minD * minD && od2 > 0.01) { double od = Math.Sqrt(od2), force = (minD - od) / minD; sx += odx / od * force * 1.5; sy += ody / od * force * 1.5; }
                }
                if (sx != 0 || sy != 0) Step(h, e, sx * sp, sy * sp);
                e._sepCd = 3;
            }
            else if (e._sepCd > 0) e._sepCd -= sp;
            // contact attack
            if (MeleeEt.Contains(et) && d < e.r + pr + 8 && h.PIframes <= 0 && e.st2 <= 0)
            {
                h.HurtPlayer(Js.Int(e.atk * 0.8), false); h.Parts(h.PX, h.PY, e.col, 4);
                e.st2 = 40 + Js.Int(h.Rand() * 20);
            }
            // generic projectile ring (60f charge, then _fireChargedProj)
            if (e.projCd >= 9000 && !e.ib && !NoProj.Contains(et)) { e.projCd = 240; e.projT = 180 + h.Rand() * 120; }
            if (e.projCd < 9000)
            {
                if (!(e._projChargeT > 0))
                {
                    e.projT -= sp;
                    double rg = RangeOf(et), range = rg != 0 ? rg : 700;
                    if (e.projT <= 0 && d < range)
                    {
                        e.projT = e.projCd;
                        double el = e.el ?? 0;
                        e._projChargeBean = el == EL_D ? "dark" : el == EL_I ? "water" : el == EL_F ? "fire" : "normal";
                        e._projChargeCol = e._projChargeBean == "dark" ? "#a44cff" : e._projChargeBean == "water" ? "#317cec" : e._projChargeBean == "fire" ? "#ff2e22" : (ElColor(e.el) ?? e.col);
                        e._projChargeParryClass = el == EL_P ? "physical" : "magic";
                        e._projChargeT = 60;
                    }
                }
            }
        }
    }
}
