using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // C01-AI: fields the field-enemy AI (updateE after the DOT part) creates or reads on the web enemy object beyond mkEn / CX-03a.
    public sealed class EliteZone { public double x, y, t, dur, r; public string kind, col; }

    public sealed partial class EnemySpawn
    {
        // charge / swoop (eChargeWind -> eCharge)
        public double echDx, echDy, _chgAimMax, _chgDur, _chgSpd, _chgLen; public double? _chgVisLen;
        // 60f projectile charge ring (idle shot): _projChargeT counts down, the bean kind is chosen when it starts
        public double _projChargeT; public string _projChargeBean, _projChargeCol, _projChargeParryClass;
        // aura multipliers: the web aura pass sets them each frame, 1 without an aura
        public double? _aSpdM, _aAtkM;
        // wander / orbit / separation bookkeeping
        public double _sepCd; public bool _escorting;
        public List<EliteZone> _eliteZones;
        public double? _tpFlashT, _lastFdx, _lastFdy;
        // shaman revive marker on a corpse
        public bool _absorbed;
        // set by the host when the web would have `_hasAtkTicket` (never: atkTicketRequest always grants without storing)
        public bool _hasAtkTicket;
    }
}
