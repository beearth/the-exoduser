using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // The player object fields the hurtE head reads/writes (web P). null = undefined.
    public sealed class EnemyHurtPlayer
    {
        public double x, y, hp, mhp, mp, mmp, iframes;
        public double? eShield, eShieldMax, _greedCurse, _killBuff, _killMul, _lBeltT, _lBootsT, _lNextCrit, _lSpearStk, _lSpearT;
        public double? st, mst; // stamina (CX-04b leech)
        public string s;        // player state (whirlwind ...)
        public bool? _rageSkCtx;
        // CX-04c1 (death head): kill rewards, revive shockwave, companion spawn level
        public double? lv, facing, rage, shield, mshield, _okSpdBuff, _okSpdMul;
        public EnemyVec kb;
        // CX-04c2 (death tail): freeze-slow from icy deaths, body radius for the etype 80 burst
        public double? _freezeSlow, r;
    }

    // `opts` of hurtE (only the keys the head reads). null reference = no opts object (JS undefined); unset keys = undefined.
    public sealed class EnemyHurtOpts
    {
        public bool? dot, shieldHit, bleed, poison, parryBlueBean, noStun, pure, magic, explode, beam, proj, _kiFull;
        public bool? _blastKill; // CX-04c1: opts._blastKill (buster-loop area kill)
        // keys read by the hurtE middle (CX-04b)
        public bool? bladeShard, maliceHunt, iceBlade, ltnChaser, lightning, detonate, noImpact, bladeOrb, normalBow, mhBlade, blueBean, noKB, _lClubWall, poiseHit;
        public double? maxDist, kbMult, poiseMult;
    }

    // The object literal passed to _spawnBossProjectile by the mirror priest (etype 92) return shot.
    public sealed class EnemyProjectile
    {
        public double x, y, vx, vy, dmg, el, life, ml, sz;
        public bool friendly;
        public string col;
    }

    // Result of _hitSfxForEtype
    public sealed class EnemyHitSfx { public string key; public double pitch; }

    // G._dmgPeak, G._dmgPeakShow, _uqScCtx, _uqS
    public sealed class EnemyDmgPeak { public double val, t; }
    public sealed class EnemyDmgPeakShow { public double x, y, dmg; public bool crit; }
    public sealed class EnemyUqScCtx { public bool? _uqRef; }
    public sealed class EnemyUqS { public double? poiseOrbT, gwRefund; public bool? csEchoUsed; }

    // One push into window._btDmgLog
    public sealed class EnemyHurtLogEntry { public double t; public string src; public double dmg; }

    // Everything the hurtE head reads from globals plus the functions it calls that are NOT ported (CX-04a).
    public sealed partial class EnemyHurtContext
    {
        // --- globals ---
        public EnemyHurtPlayer P;                       // P
        public bool HasStats; public double StatCrits;  // G._sStats (undefined when HasStats is false) and its crits counter
        public double? PlayTime;                        // G.playTime
        public double? PassAbund, PassBow, PassCombo;   // PASSIVES.pAbund / pBow / pCombo
        public double? ArmorEl, WeaponEl;               // ar().el, wp().el (INV.equipped.armor/weapon)
        public double NecklaceDmg, Ring1Dmg, Ring2Dmg, BeltDmg, BraceletDmg, HeadbandDmg, Headband2Dmg; // nc()/rg1()/rg2()/belt/bracelet/headband/headband2 .dmgBonus||0
        public int ShBufI;                              // _shBufI
        public double HitSfxCd;                         // _hitSfxCd
        public double Now;                              // _now
        public List<EnemyHurtLogEntry> BtDmgLog;        // window._btDmgLog (null = undefined)
        public bool ParryLessonActive;                  // window._parryLesson?.active
        public IList<EnemySpawn> Ens;                   // ens

        // --- sources ---
        public Func<double> Random;                     // Math.random()

        // --- injected web functions (equipment/passive lookups, other targets, text/sound/particles) ---
        public Func<string, double> EqAffix, LEq, UEq;  // _eqAffix, _lEq, _uEq (key -> value, 0 when absent)
        public Func<double> StatStr, StatCrit, StatCritDmg, PAtkMul, MeleeRef, PDotPool;
        public Func<EnemySpawn, double> PredBonus, HunterMul; // _predBonus(e), _hunterMul(e)
        public Action PetOnAtk;                         // _petOnAtk()
        public Func<double, double, double, IList<EnemySpawn>> ShQuery; // shQuery(x, y, r)
        public Action<EnemySpawn, double, double?, bool, EnemyHurtOpts, double?> HurtEnemy; // hurtE(e, dmg, ang, noSound, opts[, atkEl]) — recursion for other targets (atkEl null = argument omitted)
        public Action<EnemySpawn, double, double?, EnemyHurtOpts> ParryLessonHurt; // window._parryLesson.hurtEnemy(e, dmg, ang, opts)
        public Action<double> HurtPlayer;               // hurtP(dmg)
        public Action<EnemySpawn, EnemyProjectile> SpawnBossProjectile; // _spawnBossProjectile(e, obj)
        public Action<double, double, string, string, double, double?, string> AddText; // addTxt(x, y, text, color, life[, size, text2])
        public Action<double, double, string, double> AddParts; // addParts(x, y, color, n)
        public Action<double> Shake;                    // shake(n)
        public Action<string, double> DoHitFlash;       // doHitFlash(color, alpha)
        public Action<string, double, double> PlaySample; // playSample(key, volume, pitch)
        public Func<int, EnemyHitSfx> HitSfxForEtype;   // _hitSfxForEtype(etype)
        public Action Block;                            // SFX.block()
        public Func<string, string> Translate;          // _T(s)

        // --- CX-04b: globals the hurtE middle reads/writes ---
        public double StatDmgDealt, StatMaxHit;         // G._sStats.dmgDealt / maxHit (valid when HasStats)
        public EnemyDmgPeak DmgPeak;                    // G._dmgPeak (null = undefined)
        public EnemyDmgPeakShow DmgPeakShow;            // G._dmgPeakShow (null = undefined)
        public string FlashCol; public double? FlashT;  // G._flashCol, G._flashT
        public double? NoHitStopT;                      // G._noHitStopT
        public double HitStop, SlowMo;                  // G.hitStop, G.slowMo
        public double CamX, CamY, ViewW = 1600, ViewH = 900; // G.cam, VW, VH
        public double OptParts = 100;                   // OPT.parts
        public double DpsDmg;                           // _dpsDmg
        public double TxtPerFrame, ImpPerFrame;         // _txtPerFrame, _impPerFrame (_TXT_BUDGET = 12)
        public EnemyUqScCtx UqScCtx; public EnemyUqS UqS; // _uqScCtx, _uqS (null = undefined)
        public Func<double, double, double, bool> CanMove; // canMv(x, y, r)
        public Action<double, double, double, double, string, double, double, double?, double?, double?> PoolPart; // poolPart(x,y,vx,vy,col,sz,life[,tp,rot,grav]); trailing three null = omitted
        public Action<double, double, double, double, string, bool, bool> AddImpact; // _addImpact(x,y,el,ang,type,isBoss,noFlash)
        public Action<double, double, double, double, string> AddBoom; // _addBoom(x,y,r,dur,col)
        public Action<double> TickSkyCrusherRecharge;   // _tickSkyCrusherRecharge(frames)
        public Action SfxGroggy;                        // SFX.groggy()
    }

    // Values the head hands to CX-04b: the two parameters it may rewrite plus every local declared at the top level of the web try block.
    // bool? members keep the JS tri-state (undefined / false / true) of expressions like `opts&&opts.dot`.
    public sealed class EnemyHurtHeadResult
    {
        public double dmg, atkEl;
        public bool? isDot;
        public bool _shBlocked;
        public double kbM, psM;
        public bool _isPure;
        public bool? _isArrow, _isGunpowder, _isMagicDmg;
        public double _cbAf, _cbPas;
        public bool _isRageSk, _isCrit;
    }

    // Values the hurtE middle (CX-04b) hands to CX-04c: the 14 head values (as given) + every local declared at the top level of the range.
    public sealed class EnemyHurtBodyResult
    {
        public double dmg, atkEl;
        public bool? isDot;
        public bool _shBlocked;
        public double kbM, psM;
        public bool _isPure;
        public bool? _isArrow, _isGunpowder, _isMagicDmg;
        public double _cbAf, _cbPas;
        public bool _isRageSk, _isCrit;
        public bool isBoss;
        public double finalKbM;
        public bool _isRanged;
        public bool? _isMH, _isBB, _isMagicProj;
        public double _kbScale;
        public bool? _noKB;
    }
}
