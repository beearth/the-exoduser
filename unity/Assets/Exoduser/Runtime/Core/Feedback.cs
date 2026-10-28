using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-1 sound: EnemyHit / EnemyCrit / EnemyDeath / BossHit / BossDeath / Roll are plain notifications (position, etype, source volume and rate).
    // The sample choice among variants is the audio adapter's (the Core never draws a random number for sound, so every oracle stays unchanged).
    public enum FeedbackKind { Sample, KiChargeFlash, KiSlashHit, EnemyHit, EnemyCrit, EnemyDeath, BossHit, BossDeath, Roll, Parry }

    // Native view drains once after Tick. Pixel coordinates retain positive Y down.
    public sealed class FeedbackEvent
    {
        public FeedbackKind Kind;
        public int Tick, Step, Tier, FrameCount, FrameTicks, InkCapacity, Etype;
        public float X, Y, Angle, Scale, Size, Volume, Rate, QueuedRate;
        public string SampleKey;
        public bool Ink, IsBoss;
        public string Source;   // RM-1 sound: where the sound came from (move number / event), for the Receipt log
    }

    public sealed partial class Simulation
    {
        public readonly Queue<FeedbackEvent> Feedback = new Queue<FeedbackEvent>();

        // RM-1 sound notifications (no state change, no RNG). hitSfxCd is the web _hitSfxCd (8f) cooldown, counted per Tick (the crit cooldown _critSfxCd is the Core's own: Simulation.Death).
        private int hitSfxCd, painAnchorHp, lastPainTick = -1000;
        // RM-1 sound SND-09: druid_vo_pain once for every 8 % of the (life) HP the boss loses, at least 3 s apart; the anchor follows the HP up on a new life
        private void BossPainCheck(EnemyState enemy)
        {
            if (!enemy.IsBoss || Config.StageIndex != 0 || enemy.Hp <= 1) return;
            if (enemy.Hp > painAnchorHp) painAnchorHp = enemy.Hp;
            if (painAnchorHp - enemy.Hp >= enemy.MaxHp * .08 && TickCount - lastPainTick >= 180) { QueueLogicalSound("druid_vo_pain", "boss lost 8 % HP", enemy.X, enemy.Y); painAnchorHp = enemy.Hp; lastPainTick = TickCount; }
        }
        // RM-1 sound section 6.6, P1 entry: three staff taps (24 f apart), then the four root pillars rise. Plain ticks: nothing here touches the simulation state.
        private readonly List<KeyValuePair<int, string[]>> scheduledSounds = new List<KeyValuePair<int, string[]>>();
        public void ScheduleDruidIntroSounds()
        {
            if (!DruidRemodel) return;
            for (int k = 0; k < 3; k++) scheduledSounds.Add(new KeyValuePair<int, string[]>(TickCount + k * 24, new[] { "druid_staff_tap", "P1 entry: staff tap " + (k + 1) + "/3" }));
            scheduledSounds.Add(new KeyValuePair<int, string[]>(TickCount + 72, new[] { "druid_roots_rise", "P1 entry: four root pillars rise" }));
        }
        private void TickScheduledSounds()
        {
            for (int i = scheduledSounds.Count - 1; i >= 0; i--)
                if (TickCount >= scheduledSounds[i].Key)
                {
                    var s = scheduledSounds[i].Value; scheduledSounds.RemoveAt(i);
                    var boss = Stage.FindBoss();
                    QueueLogicalSound(s[0], s[1], boss != null ? boss.X : Player.X, boss != null ? boss.Y : Player.Y);
                }
        }
        private EnemyState hurtSfxEnemy;
        private void QueueEnemySound(FeedbackKind kind, EnemyState enemy, string key, double volume, double rate)
        {
            Feedback.Enqueue(new FeedbackEvent { Kind = kind, Tick = TickCount, X = enemy.X, Y = enemy.Y, Etype = enemy.Etype, Size = enemy.Radius,
                SampleKey = key, Volume = (float)volume, Rate = (float)rate, QueuedRate = (float)rate, IsBoss = enemy.IsBoss });
        }
        // the web hurtE sound branch: the hurt context hands the category key and base pitch to PlaySample (enemy = the one being hurt)
        private void QueueHurtSample(string key, double volume, double rate)
        {
            if (hurtSfxEnemy == null || string.IsNullOrEmpty(key)) return;
            if (key == "crit_heavy") { QueueEnemySound(FeedbackKind.EnemyCrit, hurtSfxEnemy, key, volume, rate); return; }   // the web crit site (O-1 port, its cooldown is the Core's): the adapter voices it
            QueueEnemySound(hurtSfxEnemy.IsBoss ? FeedbackKind.BossHit : FeedbackKind.EnemyHit, hurtSfxEnemy, key, volume, rate);
        }
        // a named sound the boss / enemy logic asks for (RM-1 sound section 6.6); the adapter maps the logical key to a file (or to "no file yet")
        public void QueueLogicalSound(string key, string source, double x, double y, double volume = 0)
        {
            Feedback.Enqueue(new FeedbackEvent { Kind = FeedbackKind.Sample, Tick = TickCount, X = (float)x, Y = (float)y, SampleKey = key, Source = source, Volume = (float)volume, Rate = 1, QueuedRate = 1 });
        }
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
