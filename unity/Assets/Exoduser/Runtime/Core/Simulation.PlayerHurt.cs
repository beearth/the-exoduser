using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // Optional `opts` of the web hurtP(dmg, opts): damage over time, energy (magic / parry) damage type, knock-back direction.
    // The etype0 contact attack calls hurtP(dmg) without opts, so the knock-back direction is a random angle (game.html 43745).
    public struct HurtOptions { public bool Dot, Magic, HasAngle, HasSource, HasKnockback; public float KnockbackX,KnockbackY; public float Angle, SrcX, SrcY; }

    // PC-B09: the player-hurt pipeline of hurtP (game.html 43563-43754): guards, dodge, shield-block branch (B07), defence / hit cap / minimum, B08 energy shield, HP,
    // poise stagger (B07 PlayerPoise), damage floater, damage-proportional knock-back, screen flash and shake, hit sound. Not ported (inputs the equipment / affix /
    // unique layers do not feed yet, all 0 or absent in the web state they stand for): barrier, healthy / injured / dot / burn / boss / close / far conditional DR,
    // counterHit / thorns / reflect, lastStand, _uArmorRage, pet hit, ice-orb / ghost-walk invulnerability, whirlwind guard, P.s==='charge' (no such Unity state),
    // chromatic-aberration pulse (state kept, no renderer), G.hitStop (the web resets it every frame before use), gamepad vibration, particles.
    public sealed partial class Simulation
    {
        public double DodgeAffix;                         // _eqAffix('dodgeChance') (fraction)
        public double OptShake = 100;                     // OPT.shake (percent)
        public float ShakeAmount;                         // G.shake (pixels), decays x.86 per frame, <.3 -> 0
        public float ScreenFlashAlpha, HitFlashAlpha;     // scrFlashA (-.018 / frame, colour rgba(200,0,0)) and _hitFlash.a (-.08 / frame)
        public string HitFlashColor = "#ffffff";
        public float FlashTicks, ChromaTicks;             // G._flashT, G._chromaT (state only)
        public int HurtCount, DodgeCount, HurtDamage;     // landed hits, dodges, HP lost (smoke / m1-check counters)
        public int LastHurtAmount;                        // `a` of the last landed hit (HP damage after defence and shield)

        private void TickHurtFx()
        {
            if (ShakeAmount > 0) { ShakeAmount *= .86f; if (ShakeAmount < .3f) ShakeAmount = 0; }
            if (HitFlashAlpha > 0) { HitFlashAlpha -= .08f; if (HitFlashAlpha < 0) HitFlashAlpha = 0; }
            if (ScreenFlashAlpha > 0) { ScreenFlashAlpha -= .018f; if (ScreenFlashAlpha < 0) ScreenFlashAlpha = 0; }
            if (FlashTicks > 0) FlashTicks--;
            if (ChromaTicks > 0) ChromaTicks--;
        }

        private void DoHitFlash(string color, double strength) { HitFlashAlpha = (float)Math.Min(.5, HitFlashAlpha + strength * .5); HitFlashColor = color ?? "#ffffff"; }
        private void HurtShake(double n) { ShakeAmount = (float)Math.Max(ShakeAmount, n * OptShake / 100); }   // shake(n)

        // playSample('player_hit'+(1+~~(random*4)), vol, _r(1,.15)): draw order index, _r, then playSample's own .92+random*.16 jitter
        private void QueueHurtSample(double volume)
        {
            int index = 1 + (int)(NextRandom() * 4);
            double rate = 1 * (1 + (NextRandom() - .5) * 2 * .15);
            var e = new FeedbackEvent { Kind = FeedbackKind.Sample, Tick = TickCount, X = Player.X, Y = Player.Y, SampleKey = "player_hit" + index, Volume = (float)volume, Rate = (float)rate };
            e.QueuedRate = (float)(rate * (.92 + NextRandom() * .16));
            Feedback.Enqueue(e);
        }

        public void HurtPlayer(int damage) { HurtPlayer(damage, default(HurtOptions)); }

        public void HurtPlayer(int damage, HurtOptions o)
        {
            if (Player.Hp <= 0 || Player.State == "fallen" || Player.State == "dead") return;   // fallen / dead are invulnerable
            if (Stage.Enabled && Stage.LoadPhase > 0) return;                                  // G._bossLoadPhase: invulnerable while the arena loads
            if (Player.Iframes > 0) return;
            if (IceOrbActive) return;                                                         // B03: nothing reaches the player inside the ice orb (web !P._ioActive)
            if (HarpActive || DashActive) return;                                             // chain move cannot be interrupted
            // dodge: (DEX + level bonus + equipment DEX) * .05 + dodgeChance affix, cap 35 %, not against DOT. The draw happens even at 0 %.
            if (!o.Dot)
            {
                double dodgePct = Math.Min(35, (Crossbow.DexFlat + Math.Truncate(Player.Level * .5)) * .05 + DodgeAffix * 100);
                if (NextRandom() * 100 < dodgePct) { DodgeCount++; return; }
            }
            BlockFx blk;
            if (CombatBeforeHurt(ref damage, o.Dot, out blk)) return;
            if (blk.Active)
            {
                // sBlock / peaceShield absorb (B07 ShieldBranch did the maths): failed-parry floater, knock-back, shake, sound, flash, rate floater
                if (blk.FocusKeep) HurtText(Player.X, Player.Y - 20, "집중!", "Focus!", "#44ddff", 20);
                if (blk.Failed) HurtText(Player.X, Player.Y - 32, "패링 실패!", "Parry Fail!", "#ff6644", 30);
                double bAng = o.HasAngle ? o.Angle + Math.PI : NextRandom() * Math.PI * 2;
                Player.KnockbackX += (float)(Math.Cos(bAng) * blk.KbMagnitude); Player.KnockbackY += (float)(Math.Sin(bAng) * blk.KbMagnitude);
                HurtShake(blk.Shake); QueueHurtSample(blk.Failed ? .6 : .4);
                DoHitFlash(blk.Failed ? "#ff4422" : blk.Peace ? "#ff88bb" : "#4488ff", blk.Failed ? .25 : .15);
                int pct = (int)(blk.Rate * 100);
                HurtText(Player.X, Player.Y - 18, (blk.Peace ? "평화보호 " : "보호막 ") + pct + "%", (blk.Peace ? "Aegis " : "Barrier ") + pct + "%", blk.Failed ? "#ff6644" : blk.Peace ? "#ff88bb" : "#4488ff", 22);
            }
            else if (!o.Dot) QueueHurtSample(.6);
            // defence (physical, or energy for magic / parry damage), DR cap 75 %
            double def = o.Magic ? Config.PlayerEnergyDefense : Config.PlayerPhysicalDefense;
            double dr = Math.Min(.75, def / (def + 2500.0));
            int a = damage;
            int hitCap = Js.Int(Player.MaxHp * .33);
            if (a > hitCap) { a = hitCap; Player.Iframes = Math.Max(Player.Iframes, 60); HurtText(Player.X, Player.Y - 35, "한방캡!", "One-hit Cap!", "#ff8800", 40); }
            a = Math.Max(1, Js.Int(a * (1 - dr)));
            int minDamage = Math.Max(1, Js.Int(Player.MaxHp * 0.005));
            if (a < minDamage) a = minDamage;
            // B08 energy shield: after every reduction, spent before HP; only the overflow reaches HP
            var sh = EnergyShield.AbsorbPlayer(Player.Shield, Player.MaxShield, Player.ShieldRegenTicks, a);
            Player.Shield = (float)sh.Shield; Player.ShieldRegenTicks = (float)sh.RegenT;
            if (sh.Broke) HurtText(Player.X, Player.Y - 30, "쉴드 파괴!", "Shield Destroy!", "#4488ff", 50);
            else if (sh.FullBlock) HurtText(Player.X, Player.Y - 25, "-" + a, "-" + a, "#4488ff", 20);
            a = (int)sh.Damage;
            Player.Hp -= a; HurtDamage += a; HurtCount++; LastHurtAmount = a;
            if (o.Dot) { Player.Iframes = 0; }
            else
            {
                Player.Iframes = 0;
                CombatApplyHitPoise();
                if (a > 0) HurtText(Player.X, Player.Y - 10, "-" + a, "-" + a, "#ff3333", 28);
                // 일반 투사체는 원문의 속도 방향 2px, 접촉 공격은 피해 비례 1..12px다.
                if (o.HasKnockback)
                {
                    Player.KnockbackX += o.KnockbackX; Player.KnockbackY += o.KnockbackY;
                }
                else
                {
                    double kbStr = Math.Min(12, Math.Max(1, a / (double)Player.MaxHp * 30));
                    double kbAng = o.HasAngle ? o.Angle + Math.PI : o.HasSource ? Math.Atan2(Player.Y - o.SrcY, Player.X - o.SrcX) : NextRandom() * Math.PI * 2;
                    Player.KnockbackX += (float)(Math.Cos(kbAng) * kbStr); Player.KnockbackY += (float)(Math.Sin(kbAng) * kbStr);
                }
                ScreenFlashAlpha = .25f;
                ShakeAmount = (float)(Math.Max(4, Math.Min(16, Js.Int(a / (double)Player.MaxHp * 60))) * OptShake / 100);
                FlashTicks = Math.Max(FlashTicks, 2);
                if (a > Player.MaxHp * .15) ChromaTicks = Math.Max(ChromaTicks, 4);
            }
            if (Player.Hp <= 0) PlayerDie();
        }

        private void HurtText(double x, double y, string ko, string en, string color, int life)
        {
            var h = ReviveTextRaised; if (h != null) h(new ReviveText { X = x, Y = y, Ko = ko, En = en, Color = color, Life = life });
        }
    }
}
