using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public enum FeedbackKind { Sample, KiChargeFlash, KiSlashHit }

    // Native view drains once after Tick. Pixel coordinates retain positive Y down.
    public sealed class FeedbackEvent
    {
        public FeedbackKind Kind;
        public int Tick, Step, Tier, FrameCount, FrameTicks, InkCapacity;
        public float X, Y, Angle, Scale, Size, Volume, Rate, QueuedRate;
        public string SampleKey;
        public bool Ink;
    }

    public sealed partial class Simulation
    {
        public readonly Queue<FeedbackEvent> Feedback = new Queue<FeedbackEvent>();

        private FeedbackEvent KiFeedback(FeedbackKind kind, int step, float chargeFrames = 0)
        {
            int tier = step == 3 ? KiChargeTier(chargeFrames) : 0;
            return new FeedbackEvent { Kind = kind, Tick = TickCount, Step = step, Tier = tier,
                X = Player.X, Y = Player.Y, Angle = Player.Facing, Scale = (float)(1 + tier * .4) };
        }

        private void QueueKiSample(string key, double volume, double rate, int step, float chargeFrames = 0)
        {
            var e = KiFeedback(FeedbackKind.Sample, step, chargeFrames);
            e.SampleKey = key; e.Volume = (float)volume; e.Rate = (float)rate;
            // Source playSample12367: a second shared random draw follows caller _r.
            // Adapter must use QueuedRate directly; it must not randomize again.
            e.QueuedRate = (float)(rate * (.92 + NextRandom() * .16));
            Feedback.Enqueue(e);
        }

        private void QueueKiCast(int step, float frames)
        {
            QueueKiSample("sword_swing" + step, .85, 1 + (NextRandom() - .5) * 2 * .06, step, frames);
        }

        private void QueueKiChargeTier(float before, float after)
        {
            if (KiChargeTier(after) <= KiChargeTier(before)) return;
            if (KiChargeTier(after) == 3) {
                QueueKiSample("sword_parry", .72, 1.08, 3, after);
                var e = KiFeedback(FeedbackKind.KiChargeFlash, 3, after);
                e.SampleKey = "ki_slash_hit_2"; e.Scale = .26f; e.FrameCount = 4; e.FrameTicks = 2;
                Feedback.Enqueue(e);
            }
            else QueueKiSample("scarecrow_charge", .35, 1, 3, after);
        }

        private void QueueKiHit(ProjectileState projectile, EnemyState enemy)
        {
            var e = KiFeedback(FeedbackKind.KiSlashHit, projectile.Step);
            e.Tier = projectile.Step == 3 ? (int)Math.Round((projectile.ChargeScale - 1) / .4) : 0;
            e.X = enemy.X; e.Y = enemy.Y; e.Angle = projectile.Angle; e.Scale = projectile.ChargeScale;
            e.Size = projectile.Step == 3 ? 184 * projectile.ChargeScale : 140;
            e.SampleKey = "ki_slash_hit_0"; e.FrameCount = 4; e.FrameTicks = 3;
            e.Ink = true; e.InkCapacity = 8;
            Feedback.Enqueue(e);
        }
    }
}
