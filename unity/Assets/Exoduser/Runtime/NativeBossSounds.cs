using UnityEngine;

namespace Exoduser.UnityPort
{
    // RM-1 sound A6: the one boss sound the host plays itself -- the intro howl (web playSample(_BOSS_SFX[0].howl, 1.0, _r(.7, .1)) at the arena intro).
    // Hit / death come from Core feedback events; the remodel's tell and attack sounds come from the druid Core.
    public static class NativeBossSounds
    {
        public static void Howl(NativeFeedbackAudio sound, float bossX, float bossY)
        {
            var at = new Vector3(bossX / 100, -bossY / 100, 0);
            if (sound.HasClip("druid_vo_phase")) sound.PlayNow("druid_vo_phase", 1f, 1f, at);   // SND-09: the old forest keeper replaces the generic monster howl
            else sound.PlayNow("boss_howl", 1f, Random.Range(.63f, .77f), at);
        }
    }
}
