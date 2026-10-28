using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Fields that the web `hurtE` head creates or reads on the enemy object but that neither `mkEn` (CX-02) nor `updateE` (CX-03a) set (CX-04a).
    // null = JS `undefined`.
    public sealed partial class EnemySpawn
    {
        public double? _aDefM, _burning, _poisoned, _slowed, _freezeSlow, _comboBmT, bleedPool, _lReactF;
        public bool? _mgActive, _bcActive, _isGhoul, _freezeImmune;
        // CX-04b (hurtE middle)
        public double? burnPool, poisonPool, _shockMul, _iceDotT, _iceDotDmg, _freezeMax;
        public bool? _iceSlowed;
        // CX-04c1 (hurtE death head: decoy, revive systems, STY-D9 sink, gate guard)
        public bool? _isDecoy, _revived, _reviveAsGhoul, _bossRevJudged, _bossRevived, _druidTargetLocked, _sinkDruid, _corpseSpawned, _isGateGuard;
        public double? _reviveX, _reviveY, _bossRevChance, _bossRevRoll, _druidAct, _druidStep, _druidRest, _uqGwExp, _fromHole;
        public string _fmKind;
        // CX-04c2 (hurtE death tail): set by other systems (plague burst, slime, twins) before the death
        public bool? _plagued, _isSlime;
        public double? _plagueLv, matDrop;
        public List<object> _eatenItems;
        public EnemySpawn _twPartnerDead;
    }
}
