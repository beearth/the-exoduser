using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // M1-REGION R-B: view / HUD side of the four 심연의 앵글러 (rules: Core/Simulation.FieldBoss.cs). Minimal on purpose: the web sheet img/fieldboss_angler.png (2 rows x 4 columns, 8 frames,
    // _fbFaceFrame picks the frame), a hp bar with the web layout (220x10 above the body) and the two announcement banners. Smoke, lightning, the vanish / wriggle frames of the teleport
    // (`_fbDrawVanishFrame`), the charge feeler glow and the death explosion are not drawn (placeholders listed in docs/engine/UNITY_M1_REGION_RB_20261028.md). 3D look = boss battle lead.
    public sealed partial class NativeGame
    {
        readonly Dictionary<int, SpriteRenderer> anglerViews = new Dictionary<int, SpriteRenderer>();
        readonly Dictionary<int, double> anglerLastHp = new Dictionary<int, double>();
        readonly Dictionary<int, Sprite> anglerFrames = new Dictionary<int, Sprite>();

        void ResetFieldBossViews()
        {
            foreach (var v in anglerViews.Values) if (v != null) Destroy(v.gameObject);
            anglerViews.Clear(); anglerLastHp.Clear();
        }

        // web _fbDrawOne: cell = frame % 4 / frame / 4 of the 1200x600 prescale, drawn 300 px wide around the body centre; the sheet is 1774x887, so a cell is 443.5 px
        Sprite AnglerFrame(int frame)
        {
            Sprite s; if (anglerFrames.TryGetValue(frame, out s)) return s;
            var texture = Resources.Load<Texture2D>("Art/enemy/fieldboss_angler"); if (texture == null) return null;
            float cw = texture.width / 4f, ch = texture.height / 2f; int col = frame % 4, row = frame / 4;
            s = Sprite.Create(texture, new Rect(col * cw, texture.height - (row + 1) * ch, cw, ch), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            anglerFrames[frame] = s; return s;
        }

        void FieldBossViews()
        {
            var list = Simulation.FieldBosses;
            foreach (var v in anglerViews.Values) if (v != null) v.enabled = false;
            if (list == null) return;
            foreach (var fb in list)
            {
                if (fb == null || fb.Hp <= 0) continue;
                double last; if (anglerLastHp.TryGetValue(fb.Index, out last) && last - fb.Hp >= 1) damage.Add(new DamageText { x = (float)fb.X, y = (float)(fb.Y - fb.R * .5), amount = (int)(last - fb.Hp), until = Time.unscaledTime + 1 });   // _fmApply's floater
                anglerLastHp[fb.Index] = fb.Hp;
                if (fb.Asleep || fb.Hid || fb.TpT > 0) continue;   // `if(fb.tpT>0) ...vanish frames; return` / `if(fb.hid) return`: the body is not drawn
                SpriteRenderer r; if (!anglerViews.TryGetValue(fb.Index, out r) || r == null) { r = CreateRenderer("Angler " + fb.Index); anglerViews[fb.Index] = r; }
                var sprite = AnglerFrame(fb.Frame); if (sprite == null) continue;
                float wob = (float)(System.Math.Sin(fb.T * .03) * .03 + System.Math.Sin(fb.T * .017) * .015), bob = (float)(System.Math.Sin(fb.T * .05) * 3);
                r.sprite = sprite; r.enabled = true;
                r.transform.position = Point((float)fb.X, (float)fb.Y - bob); r.transform.rotation = Quaternion.Euler(0, 0, -wob * Mathf.Rad2Deg);
                r.transform.localScale = Vector3.one * (300f / (sprite.rect.width));
                r.sortingOrder = (int)fb.Y;
            }
        }

        // web _fbDrawOne: bar 220x10 at (centre - 110, centre - 172), element colour fill on #40252b, black 60 % frame, the name above it
        void DrawFieldBossBars()
        {
            var list = Simulation.FieldBosses; if (list == null) return;
            foreach (var fb in list)
            {
                if (fb == null || fb.Hp <= 0 || fb.Asleep || fb.Hid || fb.TpT > 0) continue;
                var a = ToGUI((float)(fb.X - 110), (float)(fb.Y - 172)); var b = ToGUI((float)(fb.X + 110), (float)(fb.Y - 172)); float w = b.x - a.x, h = Mathf.Max(3, 10 * w / 220);
                Color col = Color.white; ColorUtility.TryParseHtmlString(Simulation.ElementColor(fb.El), out col);
                Fill(new Rect(a.x - 2, a.y - 2, w + 4, h + 4), new Color(0, 0, 0, .6f));
                Fill(new Rect(a.x, a.y, w, h), new Color(.251f, .145f, .169f));
                Fill(new Rect(a.x, a.y, w * Mathf.Clamp01((float)(fb.Hp / fb.MaxHp)), h), col);
                var keep = center.normal.textColor; center.normal.textColor = new Color(.867f, 1f, 1f);
                NativeUiAudit.Label(new Rect(a.x + w / 2 - 100, a.y - 26, 200, 22), lobby.Language != "ko" ? "Abyssal Angler" : "심연의 앵글러", center);
                center.normal.textColor = keep;
            }
        }

        // web showPH (500 ms banner)
        void AnglerEvent(StageEvent e)
        {
            string ko = e.Kind == StageEventKind.AnglerWoke ? "심연의 앵글러" : "필드보스 처치!", en = e.Kind == StageEventKind.AnglerWoke ? "Abyssal Angler" : "Field Boss Slain!";
            notice = lobby.Language != "ko" ? en : ko; noticeUntil = Time.unscaledTime + .5f;
        }

        // a view whose enemy left the list (the 800 -> 700 hard cap removes them without a death) has to go too
        void PruneEnemyViews()
        {
            if (enemies.Count <= Simulation.Enemies.Count) return;
            var alive = new HashSet<int>(); foreach (var e in Simulation.Enemies) alive.Add(e.Id);
            var gone = new List<int>(); foreach (var kv in enemies) if (!alive.Contains(kv.Key)) gone.Add(kv.Key);
            foreach (int id in gone)
            {
                var ev = enemies[id]; if (ev.body != null) Destroy(ev.body.gameObject); if (ev.walk != null) Destroy(ev.walk.gameObject); if (ev.arc != null) Destroy(ev.arc.gameObject);
                enemies.Remove(id);
            }
        }
    }
}
