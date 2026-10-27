namespace Exoduser.UnityPort.Core
{
    // Fields that the web `hurtE` head creates or reads on the enemy object but that neither `mkEn` (CX-02) nor `updateE` (CX-03a) set (CX-04a).
    // null = JS `undefined`.
    public sealed partial class EnemySpawn
    {
        public double? _aDefM, _burning, _poisoned, _slowed, _freezeSlow, _comboBmT, bleedPool, _lReactF;
        public bool? _mgActive, _bcActive, _isGhoul, _freezeImmune;
    }
}
