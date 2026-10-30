using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Fields that the web `updateE`/enemy loop create or read on the enemy object but that `mkEn` does not set (CX-03a).
    // null = JS `undefined` ("none" is different from 0: `!e._maxStunned`, `e._prevX||e.x` ... are reproduced in EnemyTick).
    public sealed partial class EnemySpawn
    {
        public string _tellS;
        public bool _groggy; public double groggyT; // 원본 불꽃칼날 파동 피격 마커 // 원본 updateE의 이전 상태 마커. 생성 전에는 undefined/null이다.
        public double? exp, _reviveTimer, _origR, _bossReviveVFXPending, _hitStun, _hitFlash, _stunImmune, _pImmune, _maxStunned, _teleDropY, hurt, _frozen, _stuckT, _walkDist;
        public double? _telegraphT, _telegraphR, _cursed, _shockT, _shockStk, _spikeSlow, _spikeSlowLv, _bluHitCD;
        public double? _mwStk;   // 악의 약화 stacks (B03b): web `e._mwStk||0` in _maliceWeakMul — undefined until the first orb hit, so it cannot be a plain double on the generated spawn object
        public double? _prevX, _prevY, _moveHold, _moveAng, _freezeGauge, _frozenImmune, _webSlow, _iceResDown, _iceShardRes;
        public double? _weakT, _weakPhys, _weakMag, _weakPj, _shockDRT, _shockDR, _blinkWeakT, _blinkWeak, _mSfxCd;
        public double? _wwStk, _wwStkT, _comboStk, _comboHitT, _comboDecayT;
        public bool? _lessonEnemy, _alerted, _reviveChase, _isMoving;
    }
}
