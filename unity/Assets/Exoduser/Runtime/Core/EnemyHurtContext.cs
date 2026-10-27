using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // The player object fields the hurtE head reads/writes (web P). null = undefined.
    public sealed class EnemyHurtPlayer
    {
        public double x, y, hp, mhp, mp, mmp, iframes;
        public double? eShield, eShieldMax, _greedCurse, _killBuff, _killMul, _lBeltT, _lBootsT, _lNextCrit, _lSpearStk, _lSpearT;
        public bool? _rageSkCtx;
    }

    // `opts` of hurtE (only the keys the head reads). null reference = no opts object (JS undefined); unset keys = undefined.
    public sealed class EnemyHurtOpts
    {
        public bool? dot, shieldHit, bleed, poison, parryBlueBean, noStun, pure, magic, explode, beam, proj, _kiFull;
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

    // One push into window._btDmgLog
    public sealed class EnemyHurtLogEntry { public double t; public string src; public double dmg; }

    // Everything the hurtE head reads from globals plus the functions it calls that are NOT ported (CX-04a).
    public sealed class EnemyHurtContext
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
        public Action<EnemySpawn, double, double?, bool, EnemyHurtOpts> HurtEnemy; // hurtE(e, dmg, ang, noSound, opts) — recursion for other targets
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
}
