using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // BX art: body of the 1-1 dark druid, a port of game.html _drawDruidBoss (8-direction sheets, walk / attack / beast / transform / dive / emerge) and _drawDruidSink.
    // Size and anchor are the web numbers: _CODEX_BOSS[0] dw 9.3 x r, dh 14.1 x r, the figure stands on the 0.86 line of its box, and the boss is drawn inside
    // translate(e) scale(_btScaleMul=4) translate(-e) with its own translate(e.y-6) scale(1/4), so the anchor sits 4*(-6 + breath) px above e.y.
    internal sealed class NativeDruidBody
    {
        const float SpecDw = 9.3f, SpecDh = 14.1f, BtScale = 4f;
        static readonly int[] DirMap = { 6, 7, 0, 1, 2, 3, 4, 5 };
        static readonly Vector2 Pivot = new Vector2(.5f, .14f);   // box top at -dh*.86 -> the feet line is 14 % up from the bottom
        readonly SpriteRenderer main, glow, hole;
        readonly Sprite disc;
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        float lastX, lastY; bool haveLast;
        public int Stamp;
        public bool Visible { get { return main != null && main.enabled; } }
        public Bounds Bounds { get { return main.bounds; } }
        // 표현용 크기. Core 반경·공격 판정과 독립이며 Put에서 누적 없이 적용.
        public float PresentationScale=1f;

        public NativeDruidBody(Transform parent, Sprite discSprite)
        {
            disc = discSprite;
            main = Make(parent, "Druid body", null);
            glow = Make(parent, "Druid body light", NativeDruidArt.Additive);
            hole = Make(parent, "Druid sink hole", null);
            Hide();
        }

        static SpriteRenderer Make(Transform parent, string name, Material m)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false);
            var r = go.AddComponent<SpriteRenderer>(); if (m != null) r.sharedMaterial = m; return r;
        }

        public void Hide() { main.enabled = false; glow.enabled = false; hole.enabled = false; }
        public void Dispose() { if (main != null) UnityEngine.Object.Destroy(main.gameObject); if (glow != null) UnityEngine.Object.Destroy(glow.gameObject); if (hole != null) UnityEngine.Object.Destroy(hole.gameObject); }

        static Vector3 Point(float x, float y) { return NativeRemodel3D.Point(x, y); }

        // _stage1CodexBossMotionKey
        static string MotionKey(EnemyState e, DruidData d)
        {
            string s = d.S ?? "";
            if (e.Hp <= 0 || s == "eDeath") return "death";
            if (e.Stunned > 0 || s == "eHit" || s == "eKB" || s == "eStagger") return "hit";
            if (s.IndexOf("Slam", StringComparison.Ordinal) >= 0 || s == "bossJump" || s.IndexOf("Meteor", StringComparison.Ordinal) >= 0) return "slam";
            if (s.IndexOf("Slash", StringComparison.Ordinal) >= 0 || s.IndexOf("Sweep", StringComparison.Ordinal) >= 0 || s.IndexOf("Spin", StringComparison.Ordinal) >= 0
                || s.IndexOf("Charge", StringComparison.Ordinal) >= 0 || s.IndexOf("Dash", StringComparison.Ordinal) >= 0) return "slash";
            if (s.IndexOf("Wind", StringComparison.Ordinal) >= 0 || s.IndexOf("Aim", StringComparison.Ordinal) >= 0 || s.IndexOf("Hold", StringComparison.Ordinal) >= 0 || s == "eWindup") return "windup";
            if (s == "eWalk" || s == "eChase" || s == "eApproach" || s == "bossRec") return "walk";
            return "idle";
        }

        // _druidDir: facing, or the travel angle while walking, snapped to the 8 sheet directions
        int Dir(EnemyState e, DruidData d)
        {
            double ang = e.Facing;
            string s = d.S ?? "";
            if ((s == "eWalk" || s == "eChase" || s == "eApproach") && haveLast && (Mathf.Abs(e.X - lastX) > .001f || Mathf.Abs(e.Y - lastY) > .001f)) ang = Math.Atan2(e.Y - lastY, e.X - lastX);
            int q = (int)Math.Floor(ang / (Math.PI / 4) + .5); q = (q % 8 + 8) % 8;
            return DirMap[q];
        }

        // the web stretches every cell to the dw x dh box, so x and y scale independently
        void Put(SpriteRenderer r, Sprite s, float x, float y, float widthPx, float heightPx, int order, float alpha)
        {
            r.enabled = true; r.sprite = s; r.sortingOrder = order;
            r.transform.position = Point(x, y); r.transform.localScale = new Vector3(widthPx / s.rect.width*PresentationScale, heightPx / s.rect.height*PresentationScale, 1);
            r.color = new Color(1, 1, 1, alpha);
        }

        // returns true when the druid body was drawn (alive, art present)
        public bool Draw(EnemyState e, DruidData d, bool newTick)
        {
            float r = d.R > 0 ? (float)d.R : e.Radius;
            string s = d.S ?? "", key = MotionKey(e, d);
            double nowMs = Time.unscaledTime * 1000.0;
            int dir = Dir(e, d);
            if (newTick || !haveLast) { lastX = e.X; lastY = e.Y; haveLast = true; }
            if (s == "bossDruidUnder")
            {
                // fully underground: no sprite, just the soil mound that travels (procedural in the web, drawn here with the same flattened discs)
                float mr = r * 5.5f;
                hole.enabled = true; hole.sprite = disc; hole.sortingOrder = (int)e.Y - 2; hole.transform.position = Point(e.X, e.Y + mr * .13f);
                hole.transform.localScale = new Vector3(mr * 1.12f * 2 / 128f, mr * .42f * 2 / 128f, 1); hole.color = new Color(.035f, .05f, .04f, .42f);
                main.enabled = true; main.sprite = disc; main.sortingOrder = (int)e.Y - 1; main.transform.position = Point(e.X, e.Y);
                main.transform.localScale = new Vector3(mr * 2 / 128f, mr * .34f * 2 / 128f, 1); main.color = new Color(.2f, .26f, .18f, .9f);
                glow.enabled = false;
                return true;
            }
            string sheet; int cols, rows, col, row; bool boxScaled = false;
            bool isDive = s == "bossDruidDive" || s == "bossDruidUnder" || s == "bossDruidErupt", isBur = s == "bossTelePrep" || s == "bossTeleWarn";
            bool isChgWind = s.IndexOf("Wind", StringComparison.Ordinal) >= 0 && (s.IndexOf("Charge", StringComparison.Ordinal) >= 0 || s.IndexOf("Jump", StringComparison.Ordinal) >= 0 || s.IndexOf("Dash", StringComparison.Ordinal) >= 0);
            bool isCharge = !isChgWind && (s == "bossJump" || s.IndexOf("Charge", StringComparison.Ordinal) >= 0 || s.IndexOf("charge", StringComparison.Ordinal) >= 0 || s.IndexOf("Dash", StringComparison.Ordinal) >= 0 || s.IndexOf("multiDash", StringComparison.Ordinal) >= 0);
            int frame;
            if (isDive)
            {
                double p;
                if (s == "bossDruidDive") { p = Math.Max(0, Math.Min(1, 1 - d.St2 / (d.DiveMax > 0 ? d.DiveMax : 50))); frame = Math.Min(7, (int)(p * 8)); }
                else { p = Math.Max(0, Math.Min(1, 1 - d.St2 / (d.EruptMax > 0 ? d.EruptMax : 40))); frame = Math.Max(0, 7 - (int)(p * 8)); }
                sheet = "dive"; cols = 4; rows = 2; col = frame % 4; row = frame / 4; boxScaled = true;
            }
            else if (isBur)
            {
                double pmax = s == "bossTelePrep" ? 40 : 60, pg = Math.Max(0, Math.Min(1, 1 - d.St2 / pmax));
                frame = s == "bossTelePrep" ? Math.Min(7, (int)(pg * 8)) : Math.Max(0, 7 - (int)(pg * 8));
                sheet = "emerge"; cols = 4; rows = 2; col = frame % 4; row = frame / 4;
            }
            else if (isChgWind)
            {
                double tp = Math.Max(0, Math.Min(1, 1 - d.St2 / 45)); frame = Math.Min(7, (int)(tp * 8));
                sheet = "transform"; cols = 8; rows = 1; col = frame; row = 0; boxScaled = true;
            }
            else if (isCharge) { sheet = "beast"; cols = 4; rows = 2; frame = dir; col = dir % 4; row = dir / 4; boxScaled = true; }
            else if (key == "slash" || key == "slam" || key == "windup" || s == "bossDruidVolleyWind" || s == "bossDruidVolley") { sheet = "attack"; cols = 4; rows = 8; frame = (int)(nowMs / 150) % 4; col = frame; row = dir; }
            else if (key == "walk") { sheet = "walk"; cols = 4; rows = 8; frame = (int)(nowMs / 150) % 4; col = frame; row = dir; }
            else { sheet = "base8"; cols = 4; rows = 2; frame = dir; col = dir % 4; row = dir / 4; }

            string res = NativeDruidArt.BodyDir + (sheet == "base8" ? "base8_v3" : sheet);
                        Sprite sprite = sheet == "emerge" ? NativeDruidArt.EmergeCell(frame) : NativeDruidArt.SheetCell(res, cols, rows, col, row, Pivot);
            float cw = sprite.rect.width, ch = sprite.rect.height;
            float dh = r * SpecDh, dw = r * SpecDw;
            if (sheet == "base8") dw = dh * cw / ch;
            if (boxScaled) dw = dh * (cw / ch) * 1.12f;
            float breath = sheet == "base8" ? (float)Math.Sin(nowMs * .003) * 2 : 0;
            float ay = e.Y + BtScale * (-6 + breath);
            int order = (int)e.Y;
            Put(main, sprite, e.X, ay, dw, dh, order, 1f);
            hole.enabled = false;
            if (sheet != "base8")
            {
                // two 'lighter' passes at alpha .42 (self-lighten so the boss reads in the dark arena)
                Put(glow, sprite, e.X, ay, dw, dh, order + 1, 1f);
                glow.GetPropertyBlock(block); block.SetFloat(NativeDruidArt.Opacity, .84f); glow.SetPropertyBlock(block);
            }
            else glow.enabled = false;
            return true;
        }

        // _drawDruidSink: the dead druid sinks through the emerge sheet (8 cells over the body ticks), holds on the last cell, then fades 1 -> 0 while sinking a little more
        public void DrawSink(EnemyState e, int t, int bodyTicks, int holdTicks, int fadeTicks)
        {
            float r = e.Radius, dh = r * SpecDh, dw = r * SpecDw;
            int frame = Math.Min(7, (int)(t / (bodyTicks / 8f)));
            float fadeP = Mathf.Clamp01((t - bodyTicks - holdTicks) / (float)fadeTicks);
            float a = 1 - fadeP, dy = fadeP * dh * .08f, ay = e.Y + BtScale * -6 + dy;
            var sprite = NativeDruidArt.EmergeCell(frame);
            if (t > bodyTicks * .55f)
            {
                float holeA = Mathf.Min(1f, (t - bodyTicks * .55f) / 20f) * (1 - fadeP);
                hole.enabled = true; hole.sprite = disc; hole.sortingOrder = (int)e.Y - 1;
                hole.transform.position = Point(e.X, e.Y + dh * .1f);
                hole.transform.localScale = new Vector3(dw * .4f / 128f, dw * .14f / 128f, 1);
                hole.color = new Color(.027f, .035f, .02f, .5f * holeA);
            }
            else hole.enabled = false;
            if (a > .01f)
            {
                Put(main, sprite, e.X, ay, dw, dh, (int)e.Y, a);
                Put(glow, sprite, e.X, ay, dw, dh, (int)e.Y + 1, 1f);
                glow.GetPropertyBlock(block); block.SetFloat(NativeDruidArt.Opacity, .84f * a); glow.SetPropertyBlock(block);
            }
            else { main.enabled = false; glow.enabled = false; }
        }
    }
}
