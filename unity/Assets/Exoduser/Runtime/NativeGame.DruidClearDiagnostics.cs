using System.Collections;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        Coroutine druidClearDiagnostics;

        // 게임 객체의 수명 안에서 한 번만 시작한다. 입력·진행·저장·일시정지를 쓰지 않는다.
        internal void EnsureDruidClearDiagnostics()
        {
            if (druidClearDiagnostics == null && isActiveAndEnabled) druidClearDiagnostics = StartCoroutine(ObserveDruidClear());
        }

        IEnumerator ObserveDruidClear()
        {
            var wait = new WaitForSecondsRealtime(.5f);
            string previous = null; int lastTick = -1;
            float advancedAt = Time.unscaledTime, reportedAt = -10;
            while (true)
            {
                yield return wait;
                if (Simulation == null || !Simulation.Stage.InArena) { previous = null; lastTick = -1; continue; }
                var s = Simulation; var f = s.Stage; var p = s.Player; var b = f.Boss;
                float now = Time.unscaledTime;
                if (s.TickCount != lastTick) { lastTick = s.TickCount; advancedAt = now; }
                bool alive = b != null && b.Alive, reviving = b != null && b.ReviveTimer > 0;
                bool inv = inventory != null && inventory.Open, sk = skills != null && skills.Open;
                bool stat = stats != null && stats.Open, craft = forge != null && forge.Open;
                bool clear = stageClear != null && stageClear.Active;
                bool frontend = lobby != null && lobby.IsBlocking, lastHp = b != null && b.Hp <= 1;
                bool stalled = now - advancedAt >= 2;
                string vital = p.State == "fallen" || p.State == "dead" ? p.State : "생존";
                string key = Running + "/" + gameFocused + "/" + menu + "/" + inv + "/" + sk + "/" + stat + "/" + craft
                    + "/" + f.Enabled + "/" + f.LoadPhase + "/" + f.BossAlive + "/" + alive + "/" + reviving
                    + "/" + f.Exits.Count + "/" + f.StageCleared + "/" + clear + "/" + vital + "/" + p.Level + "/" + stalled + "/" + frontend + "/" + lastHp;
                float interval = !alive || !f.BossAlive || stalled ? 2 : 10;
                if (key == previous && now - reportedAt < interval) continue;
                previous = key; reportedAt = now;
                Debug.Log("[드루이드 흐름] frame=" + Time.frameCount + " tick=" + s.TickCount + " viewTick=" + renderedTick + " realtime=" + now
                    + " timescale=" + Time.timeScale + " running=" + Running + " focus=" + gameFocused + " appFocus=" + Application.isFocused
                    + " menu=" + menu + " frontend=" + frontend + " panels=" + inv + "," + sk + "," + stat + "," + craft + " fixture=" + m1ModeFlag
                    + " player=" + p.State + " xy=" + p.X + "," + p.Y + " hp=" + p.Hp + "/" + p.MaxHp + " level=" + p.Level
                    + " enabled=" + f.Enabled + " load=" + f.LoadPhase + " bossAlive=" + f.BossAlive + " actorAlive=" + alive
                    + " bossHp=" + (b == null ? 0 : b.Hp) + " bossState=" + (b == null ? "없음" : b.State)
                    + " revive=" + (b == null ? 0 : b.ReviveTimer) + " sink=" + (b != null && b.SinkDruid)
                    + " exits=" + f.Exits.Count + " cleared=" + f.StageCleared + " clearPanel=" + clear + " tickStalled=" + stalled);
            }
        }
    }
}
