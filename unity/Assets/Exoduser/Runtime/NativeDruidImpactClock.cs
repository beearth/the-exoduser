using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // 기존 Core 사건을 읽는 표현 전용 상태. Core 시간·위치·피해·RNG를 소유하지 않는다.
    public sealed class NativeDruidImpactClock
    {
        public struct Actor
        {
            public int Id, Etype;
            public double X, Y, Radius;
            public bool Alive, IsBoss;
        }
        public struct Contact
        {
            public bool Hit, DrawHit, Critical, Slam;
            public double X, Y, TipX, TipY;
            public int Width, Life, HoldTicks;
        }
        int bossId = -1, tick = int.MinValue, finished = int.MinValue, holdUntil = int.MinValue, shakeBorn = int.MinValue;
        string previousState;
        double x, y, radius, tipX, tipY, shakePeak;
        bool active, hit, critical, ki, slam;
        public Contact LastContact { get; private set; }
        public int LastContactTick { get; private set; } = -1;

        public void Reset()
        {
            bossId = -1; tick = finished = holdUntil = shakeBorn = int.MinValue;
            previousState = null; shakePeak = 0; active = hit = critical = ki = slam = false;
            LastContact = default(Contact); LastContactTick = -1;
        }

        public void Begin(int coreTick, int actorId, double actorX, double actorY, double actorRadius, string state, bool valid, double staffX, double staffY)
        {
            if (!valid || actorId < 0 || state == "bossDruidUnder" || state == "eDeath") { Reset(); return; }
            if (actorId != bossId || coreTick < tick) Reset();
            if (active && coreTick == tick) return;
            slam = active && previousState == "bossSlam" && (state == "recover" || state == "bossRec");
            bossId = actorId; tick = coreTick; active = true;
            x = actorX; y = actorY; radius = Math.Max(0, actorRadius); tipX = staffX; tipY = staffY;
            previousState = state; hit = critical = ki = false;
        }

        bool Inside(double px, double py) { double dx = px - x, dy = py - y; return dx * dx + dy * dy <= radius * radius; }
        public void OfferHit(int coreTick, double px, double py, bool crit)
        {
            if (!active || coreTick != tick || finished == tick || !Inside(px, py)) return;
            hit = true; critical |= crit;
        }
        public void OfferKi(int coreTick, double px, double py)
        {
            if (active && coreTick == tick && finished != tick && Inside(px, py)) ki = true;
        }
        public Contact Finish(int coreTick)
        {
            if (!active || coreTick != tick || finished == tick) return default(Contact);
            finished = tick;
            int duration = Math.Max(hit ? (critical ? 4 : 2) : 0, slam ? 4 : 0);
            var result = new Contact { Hit = hit, DrawHit = hit && !ki, Critical = critical, Slam = slam,
                X = x, Y = y, TipX = tipX, TipY = tipY, Width = hit ? (critical ? 72 : 48) : 0, Life = hit ? (critical ? 8 : 6) : 0, HoldTicks = duration };
            if (result.Hit || result.Slam) { LastContact = result; LastContactTick = tick; }
            if (duration > 0)
            {
                holdUntil = Math.Max(holdUntil, tick + duration);
                double impulse = hit && !critical && !slam ? 2 : 4;
                shakePeak = Math.Max(Shake(tick), impulse); shakeBorn = tick;
            }
            return result;
        }
        public bool Holding(int coreTick) { return active && coreTick >= tick && coreTick < holdUntil; }
        public double Shake(int coreTick)
        {
            if (!active || shakeBorn == int.MinValue || coreTick < shakeBorn || coreTick - shakeBorn >= 8) return 0;
            return shakePeak * Math.Pow(.86, coreTick - shakeBorn);
        }
        public static double CombineShake(double core, double presentation, double option) { return Math.Max(core, presentation) * Math.Max(0, option); }

        // FeedbackEvent에는 actor id가 없다. 현재 본체와 유일하게 일치하는 표적 사건만 추정하여 받는다.
        public static bool SourceMatches(int wantedId, int wantedEtype, int eventEtype, bool eventBoss, double px, double py, IReadOnlyList<Actor> actors)
        {
            if (!eventBoss || wantedEtype != eventEtype || actors == null) return false;
            int matches = 0, matchedId = -1;
            foreach (var actor in actors)
            {
                double dx = px - actor.X, dy = py - actor.Y;
                if (actor.Alive && actor.IsBoss && actor.Etype == eventEtype && dx * dx + dy * dy <= actor.Radius * actor.Radius)
                { matches++; matchedId = actor.Id; }
            }
            return matches == 1 && matchedId == wantedId;
        }
    }

    // 표시 자세만 잠깐 유지한다. 호출자는 매번 기저 자세를 먼저 계산하므로 해제 시 과거 단계로 돌아가지 않는다.
    public sealed class NativeDruidPoseHold<T>
    {
        T displayed, held;
        bool have, holding;
        int lastTick = int.MinValue, lastActor = -1;
        public void Clear() { have = holding = false; displayed = held = default(T); lastTick = int.MinValue; lastActor = -1; }
        public T Select(int tick, T underlying, bool hold, bool cancel, int actorId = -1)
        {
            if (tick < lastTick || actorId != lastActor) Clear();
            lastActor = actorId;
            if (cancel) { Clear(); lastTick = tick; lastActor = actorId; return underlying; }
            lastTick = tick;
            if (hold)
            {
                if (!holding) held = have ? displayed : underlying;
                holding = true; displayed = held;
            }
            else { holding = false; displayed = underlying; }
            have = true; return displayed;
        }
    }

    // 시간 셀만 보류하고 방향 row/방향 자체 셀은 최종 그리기에서 현재 방향으로 다시 선택한다.
    public struct NativeDruidSheetPose
    {
        public string Sheet;
        public int Frame, Columns, Rows;
        public bool DirectionRow, DirectionCell, Base, Box;
        public float Breath;
        public void Cell(int direction, out int col, out int row)
        {
            int cell = DirectionCell ? direction : Frame;
            col = cell % Columns; row = DirectionRow ? direction : cell / Columns;
        }
    }
}
