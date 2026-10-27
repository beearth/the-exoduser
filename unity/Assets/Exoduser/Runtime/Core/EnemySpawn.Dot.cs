namespace Exoduser.UnityPort.Core
{
    // C01-FX: fields of the D4-style DOT block of updateE (bleed / poison / burn pools live in EnemySpawn.cs) and of elite M31 that mkEn does not create.
    public sealed partial class EnemySpawn
    {
        public double? _hrMark, _hrMarkT, _bbStk, _bbStkT, _mhDot, _mhDotDmg, spd;
        public double _eliteBoltWarn, _eliteBoltAim;
    }
}
