using System;

namespace Exoduser.UnityPort
{
    // 표현 전용 시계. Core 상태/잔여 프레임을 읽으며 게임 시간·피해·난수는 변경하지 않는다.
    public sealed class NativeDruidMotionClock
    {
        public struct Pose
        {
            public string Clip;
            public double Time;
            public Pose(string clip, double time) { Clip = clip; Time = time; }
        }

        string previousState, previousClip, attackClip = "CastThorn";
        double budget, recoveryProgress, recoveryRemaining;
        int entered, hitEntered;
        bool hitActive;
        static double Clamp(double value) { return Math.Max(0, Math.Min(1, value)); }
        static bool Has(string value, string token) { return value.IndexOf(token, StringComparison.OrdinalIgnoreCase) >= 0; }

        static string Cast(string state, string move)
        {
            string key = state + ":" + move;
            if (Has(key, "slam") || Has(key, "shock") || Has(key, "jump")) return "Slam";
            if (Has(key, "poison") || Has(key, "lava") || Has(key, "elemBall") || Has(key, "mine")) return "CastPoison";
            if (Has(key, "root") || Has(key, "fissure") || Has(key, "summon") || Has(key, "burrow") || Has(key, "chase") || Has(key, "heart")) return "CastRoot";
            return "CastThorn";
        }

        public Pose Sample(int tick, string state, string move, double remaining, double teleTotal, bool moving, bool hit, bool dead)
        {
            state = state ?? "idle";
            // 피격은 잠시 덮는 표현이다. 공격/회복의 진입 시각·남은 프레임을 새 상태로 덮지 않는다.
            if (hit && !dead)
            {
                if (!hitActive) hitEntered = tick;
                hitActive = true;
                if (state != "eHit" && state != "eStagger" && state != "eKB")
                    SamplePhase(tick, state, move, remaining, teleTotal, moving, false);
                return new Pose("Hit", Clamp((tick - hitEntered) / 24.0));
            }
            hitActive = false;
            return SamplePhase(tick, state, move, remaining, teleTotal, moving, dead);
        }

        Pose SamplePhase(int tick, string state, string move, double remaining, double teleTotal, bool moving, bool dead)
        {
            string phase = dead ? "death" : state;
            bool recover = state == "bossRec" || state == "recover" || state == "bossHeartPause";
            bool idle = state == "idle" || state == "eWalk" || state == "eChase" || state == "eApproach";
            bool wind = Has(state, "Wind") || Has(state, "Aim") || Has(state, "Hold") || state == "bossDruidDive";
            string clip = dead ? "Death" : idle ? (moving ? "Walk" : "Idle") : recover ? attackClip : Cast(state, move ?? "");
            if (phase != previousState || clip != previousClip)
            {
                entered = tick;
                budget = Math.Max(1, wind && teleTotal > 0 ? teleTotal : remaining);
                recoveryProgress = 0; recoveryRemaining = Math.Max(0, remaining);
                previousState = phase; previousClip = clip;
            }
            if (!dead && !idle && !recover) attackClip = clip;
            if (dead) return new Pose(clip, Clamp((tick - entered) / 90.0));
            if (idle) return new Pose(clip, Math.Max(0, tick - entered) % (moving ? 96.0 : 180.0) / (moving ? 96.0 : 180.0));
            double contact = clip == "Slam" ? 48.0 / 124 : .4;
            double recovery = clip == "Slam" ? 54.0 / 124 : .48;
            if (recover)
            {
                double left = Math.Max(0, remaining);
                // 패링 등으로 회복이 늘어나면 현재 자세를 유지하고 이후 남은 구간만 늘어난 시간에 나눈다.
                if (left < recoveryRemaining && recoveryRemaining > 0)
                    recoveryProgress = Clamp(1 - (1 - recoveryProgress) * left / recoveryRemaining);
                recoveryRemaining = left;
                return new Pose(clip, recovery + recoveryProgress * (1 - recovery));
            }
            double progress = Clamp((budget - Math.Max(0, remaining)) / budget);
            return new Pose(clip, wind ? progress * contact : contact + progress * (recovery - contact));
        }

        // 핵은 실제 판정 원을 덮고, 작은 탄도 화면에서 읽히도록 최소 12px를 확보한다.
        public static double ProjectileDiameter(double radius, double size, bool large)
        {
            return Math.Max(Math.Max(0, radius) * 2, Math.Min(large ? 64 : 28, Math.Max(12, size * 14)));
        }

        // Core의 아래(+Y)는 검수 카메라 쪽(-Z)이다. 메시 정면 -Z를 이 방향으로 돌린다.
        public static double FacingYawDegrees(double facingRadians) { return facingRadians * 180 / Math.PI - 90; }
    }
}
