using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // One entry of G.rifts (only the fields updateE reads).
    public sealed class EnemyRift { public double x, y, t, maxT; public double? si; public bool? spawned; }   // si / spawned: set by the hurtE death tail (CX-04c2) that pushes the rift
    // G._bonfire
    public sealed class EnemyBonfire { public double x, y, r, t; }

    // Everything the web enemy loop / updateE head reads from globals, plus the functions they call that are NOT ported here
    // (flow field, wall tests, LOS, damage, sound, text, particles ... are injected; CX-03a only moves state and the call order).
    public sealed class EnemyTickContext
    {
        // --- globals (web names in comments) ---
        public double PlayerX, PlayerY;                  // P.x, P.y
        public double CamX, CamY, ViewW = 1600, ViewH = 900; // G.cam, VW, VH
        public Func<double,double,double,bool> WorldPointVisible; // optional actual camera; null preserves the original rectangle
        public bool IsMobile;                            // IS_MOBILE
        public int MapWidth, MapHeight; public int[][] Map; // G.mw, G.mh, G.map (tile 1 = wall)
        public List<EnemyRift> Rifts = new List<EnemyRift>(); // G.rifts
        public double Kills; public double? StageKills;  // G.kills, G._stageKills (null = undefined)
        public double? EnemyTierFrame;                   // G._eTierFrame (null = undefined)
        public EnemyBonfire Bonfire;                     // G._bonfire (null = undefined)
        public int MoveSfxPlaying;                       // _mSfxPlaying
        public bool ParryLessonActive;                   // window._parryLesson?.active
        public int Stage, DemoLastStage; public bool DemoMode; // G.stage, _DEMO_LAST_STAGE, _DEMO_MODE (for _isDruidFinale)

        // --- sources ---
        public Func<double> Random;                      // Math.random()
        public Func<double> Now;                         // performance.now() in ms

        // --- injected web functions ---
        public Func<double, double, double, bool> CanMove, CanMoveTile;   // canMv, _canMvTile (x, y, r)
        public Func<double, double, bool, bool> IsWall;                   // isW(x, y, flag)
        public Func<double, double, double, double, bool> HasLos;         // hasLOS(x1, y1, x2, y2)
        public Func<double, double, bool> WallStuck;                      // _eWallStuck(x, y)
        public Action<EnemySpawn> PushOutWall;                            // _pushOutWall(e)
        public Action<EnemySpawn, EnemyBonfire, double> PushOutsideBonfire; // _pushOutsideBonfire(e, bf, clearance)
        public Func<EnemySpawn, double> BonfireClearance;                 // _bonfireEnemyClearance(e)
        public Action<EnemySpawn, double, double> FlowMove;               // _ffMoveE(e, sp, mul)
        public Action<EnemySpawn, double> HurtEnemy;                      // hurtE(e, dmg)
        public Action<EnemySpawn> CancelProjCharge;                       // _cancelProjCharge(e)
        public Action<EnemySpawn> RollDrop;                               // rollDrop(e)
        public Action<double> AddExp;                                     // addExp(n)
        public Action<EnemySpawn> RegKill;                                // _regKill(e)
        public Action<EnemySpawn, double> BossReviveGrandVfx;             // _bossReviveGrandVFX(e, r)
        public Action<EnemySpawn, double> UpdateE;                        // updateE(e, sp) (the loop calls it; CX-03b/c)
        public Func<string, string> Translate;                            // _T(s)
        public Action<double, double, string, string, double> AddText;    // addTxt(x, y, text, color, life)
        public Action<double, double, string, double> AddParts;           // addParts(x, y, color, n)
        public Action Block;                                              // SFX.block()
        public Action<double> Shake;                                      // shake(n)
        public Action<string, double, double> PlaySample;                 // playSample(name, vol, rate)
        public Func<double, double, double> RandomRate;                   // _r(a, b)
    }

    // State carried between BeginFrame and the per-enemy steps (web locals _bf, _bfActive, _eUpdateStart).
    public sealed class EnemyTickFrame
    {
        public EnemyBonfire Bonfire; public bool BonfireActive; public double UpdateStartMs;
    }
}
