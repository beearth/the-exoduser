using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // CX-04c1: objects and globals the hurtE death head (game.html `if(e.hp<=0){` .. before "지옥의 잔해 드롭") reads or writes. null = JS undefined.
    public sealed class EnemyFireZone { public string type; public double x, y, r; public double? lv; }   // G._fireZones[i]
    public sealed class EnemySpawnHole { public double? alive; }                                           // G.spawnHoles[i]
    public sealed class EnemyDruidSink { public double x, y, r, t; }                                       // G._druidSink
    public sealed class EnemyDeathSnd { public string key; public double vol, rate; }                      // G._blDeathSndQ entry
    public sealed class EnemyUqZone { public double x, y, r, t, maxT, dmg, el, lv; public string type; public bool _uqChild; } // G._uqZoneQ entry
    public sealed class EnemyFzCtx { public string type; public bool? _uqChild, _pillarSpike, _uqSpawned; public double? dmg, lv; } // _uqFzCtx
    // player projectile object from _getPProj (u_d08 echo blade)
    public sealed class EnemyPProj
    {
        public double x, y, vx, vy, dmg, el, maxDist, dist, r, stagger, kb, pierce, pierceMax, _pierceRate;
        public bool magic, bladeShard, _uqEcho;
        public string col;
    }
    // object literal passed to _spawnBossProjectile by the 2nd+ boss revival (all keys present; redBean/homing = true or undefined)
    public sealed class EnemyBossShot
    {
        public double x, y, vx, vy, dmg, life, ml, sz;
        public double? el;
        public bool friendly;
        public string col;
        public bool? redBean, homing;
    }
    // options object of _reviveVFX
    public sealed class EnemyReviveVfxOpts { public double partN, partSpd, shake, vfxSize, flash; }
    // second argument of hurtP(dmg, {dtype})
    public sealed class EnemyHurtPMeta { public string dtype; }

    public sealed partial class EnemyHurtContext
    {
        // --- globals (CX-04c1) ---
        public double Stage;                            // G.stage
        public bool DemoMode; public double DemoLastStage; // _DEMO_MODE, _DEMO_LAST_STAGE
        public double? OptDiff;                         // OPT.diff (null = undefined; _diffSigned treats it as 5)
        public double OptHitStop = 100;                 // OPT.hitStop
        public double Kills; public double? StageKills; // G.kills, G._stageKills
        public double Combo, ComboTimer, ComboMax;      // G.combo, G.comboTimer, G.comboMax
        public List<double> KilledBosses;               // G._killedBosses (null = undefined)
        public List<EnemyFireZone> FireZones;           // G._fireZones (null = undefined)
        public List<EnemySpawnHole> SpawnHoles;         // G.spawnHoles
        public EnemySpawn DruidFinaleBoss;              // G._druidFinaleBoss
        public EnemyDruidSink DruidSink;                // G._druidSink
        public bool GateGuardSet; public bool? GateGuardKilled, BossGateOpen; // G._gateGuard (null once cleared), G._gateGuardKilled, G.bossGateOpen
        public double? ChromaT;                         // G._chromaT
        public List<EnemyDeathSnd> BlDeathSndQ;         // G._blDeathSndQ (null = undefined)
        public List<EnemyUqZone> UqZoneQ;               // G._uqZoneQ (null = undefined)
        public bool ShDirty;                            // _shDirty
        public double HarpGauge, HarpGaugeMax;          // _harpGauge, _HARP_GAUGE_MAX
        public string UqHitCtx; public EnemyFzCtx UqFzCtx; // _uqHitCtx, _uqFzCtx
        public List<EnemyPProj> PProjs = new List<EnemyPProj>(); // pProjs

        // --- injected web functions (CX-04c1) ---
        public Action<EnemySpawn> AtkTicketRelease, RegKill, PetOnKill;              // atkTicketRelease, _regKill, _petOnKill
        public Action<double, double, string, string, EnemyReviveVfxOpts> ReviveVfx; // _reviveVFX(x,y,col,label,opts)
        public Action<string, double, double, double, double, double, bool> PlayVfxAng; // playVFXAng(key,x,y,scale,a,b,flag)
        public Action<double, double, double, double, double, double, double> AddBlastLight; // _addBlastLight(x,y,r,t,R,G,B)
        public Action<double, double, double, double, double, string> AddTpBolt;    // _addTpBolt(x1,y1,x2,y2,w,col)
        public Action<double, double, double, string, bool, bool?, double, string> DeathFx; // deathFX(x,y,r,col,isBoss,burn (JS tri-state),etype,kind)
        public Action<EnemySpawn, double> SpawnLargeMonsterDeathFx;                 // _spawnLargeMonsterDeathFx(e, ang)
        public Action<EnemySpawn, double, double> AddCorpse;                        // _addCorpse(e, ang, power)
        public Action<EnemySpawn> AddBurnCorpse;                                    // _addBurnCorpse(e)
        public Action<double, double, string> AddGorePiece;                         // _addGorePiece(x, y, kind)
        public Action<double, double, double> AddDeathImpact;                       // _addDeathImpact(x, y, r)
        public Func<EnemyPProj> GetPProj;                                           // _getPProj()
        public Func<string, string, string> Lang;                                   // _L(ko, en)
        public Func<double> RageMax;                                                // _rageMax()
        public Action<double, EnemyHurtPMeta> HurtPlayerTyped;                      // hurtP(dmg, {dtype})
        public Action<EnemySpawn, EnemyBossShot> SpawnBossShot;                     // _spawnBossProjectile(e, obj) with the revive-burst object
        public Action SfxVictory;                                                   // SFX.victory()
        public Action BuildMapCache;                                                // buildMapCache()
        public Func<double, double, int, int, bool, double?, double?, EnemySpawn> MkEn; // mkEn(x,y,si,etype,ib,el,room) — CX-02 EnemyFactory.Create
    }

    // Why DeathHead stopped (the web returns `undefined` for every early exit; this label is derived from what ran).
    public enum DeathExit { NotDead, Decoy, Doppelganger, BossRevive, Continue }

    // Values the death head hands to CX-04c2: the top-level locals of the `if(e.hp<=0){` block. `__cont` false = the HP check failed (nothing ran).
    public sealed class EnemyHurtDeathResult
    {
        public bool? __cont;
        public bool? _isBurnDeath;      // (atkEl===EL.F||(opts&&opts.beam))&&!(opts&&opts.explode) — JS tri-state
        public bool? _isWhirlKill, _sinkDruid;
        public double? _killAng;
    }
}
