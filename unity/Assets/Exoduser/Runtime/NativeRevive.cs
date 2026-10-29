using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // B08 presentation: the web addTxt floaters raised by the revive / energy-shield rules, and the fallen countdown (game.html 59001-59041:
    // dark vignette, centre panel with the revive power and the countdown seconds, gauge at the bottom). Drawn in the 1920x1080 GUI space.
    public sealed class NativeReviveHud
    {
        sealed class Floater { public float x, y, born, life; public string text; public Color col; }
        readonly List<Floater> floaters = new List<Floater>();
        public Font Font; public bool English;

        public void Reset() { floaters.Clear(); }
        public int Count { get { return floaters.Count; } }
        public IEnumerable<string> Texts { get { foreach (var f in floaters) yield return f.text; } }

        // `ReviveText.Life` is a web frame count (60 per second)
        public void Add(ReviveText t)
        {
            Color c; if (!ColorUtility.TryParseHtmlString(t.Color ?? "#ffffff", out c)) c = Color.white;
            string s = Clean(English ? t.En : t.Ko);
            if (s.Length == 0) return;
            float x = (float)t.X, y = (float)t.Y;
            // the web stacks several addTxt lines on one spot; keep them readable by lifting a line that would sit on a live one (~22 screen px apart)
            for (int guard = 0; guard < 8; guard++)
            {
                bool hit = false;
                foreach (var f in floaters) if (Time.unscaledTime - f.born < f.life * .8f && Mathf.Abs(f.x - x) < 130 && Mathf.Abs(f.y - y) < 16) { y = f.y - 16; hit = true; break; }
                if (!hit) break;
            }
            floaters.Add(new Floater { x = x, y = y, born = Time.unscaledTime, life = Math.Max(.9f, t.Life / 60f), text = s, col = c });
        }

        // The game font has no emoji / dingbat glyphs: decoration characters it cannot draw are dropped (the Korean/English words stay).
        string Clean(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            var b = new StringBuilder();
            foreach (char ch in s) { if (char.IsSurrogate(ch)) continue; if (Font != null && !Font.HasCharacter(ch) && ch != ' ') continue; b.Append(ch); }
            return b.ToString().Trim();
        }

        public void DrawFloaters(Func<float, float, Vector2> toGui, GUIStyle style, NativeFloatingTextLayout layout = null)
        {
            floaters.RemoveAll(f => Time.unscaledTime - f.born > f.life);
            var old = GUI.color;
            foreach (var f in floaters)
            {
                float age = (Time.unscaledTime - f.born) / f.life, alpha = Mathf.Clamp01((1 - age) * 3);
                var pt = toGui(f.x, f.y); var r = new Rect(pt.x - 260, pt.y - 22 - age * 26, 520, 36);
                style.alignment = TextAnchor.MiddleCenter; int keepSize = style.fontSize; style.fontSize = 24;
                if (layout != null) { var size = style.CalcSize(new GUIContent(f.text)); var box = layout.Place(pt.x, r.y, size.x + 12, 36); r = new Rect(box.X, box.Y, box.Width, box.Height); if (box.Width <= 0) { style.fontSize = keepSize; continue; } }
                var shade = new Color(0, 0, 0, alpha * .85f);
                style.normal.textColor = shade;
                foreach (var o in new[] { new Vector2(-2, 0), new Vector2(2, 0), new Vector2(0, -2), new Vector2(0, 2) }) GUI.Label(new Rect(r.x + o.x, r.y + o.y, r.width, r.height), f.text, style);
                style.normal.textColor = new Color(f.col.r, f.col.g, f.col.b, alpha);
                GUI.Label(r, f.text, style); style.fontSize = keepSize;
            }
            GUI.color = old;
        }

        Texture2D vignette;
        Texture2D Vignette()
        {
            if (vignette != null) return vignette;
            const int n = 128; var t = new Texture2D(n, n, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp }; var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, d = Mathf.Sqrt(dx * dx * .6f + dy * dy * 1f) / 1.05f; // web: radial 0.05w -> 0.65w, stops 0 / .2 @ .5 / .9 @ 1
                float a = d < .5f ? Mathf.Lerp(0f, .2f, Mathf.Clamp01((d - .1f) / .4f)) : Mathf.Lerp(.2f, .9f, Mathf.Clamp01((d - .5f) / .5f));
                px[y * n + x] = new Color32(255, 40, 40, (byte)(Mathf.Clamp01(a) * 255));
            }
            t.SetPixels32(px); t.Apply(); vignette = t; return t;
        }
        static void Fill(Rect r, Color c) { var old = GUI.color; GUI.color = c; GUI.DrawTexture(r, Texture2D.whiteTexture); GUI.color = old; }

        // P.s === 'fallen': st2 counts 300 -> 0. Called with the GUI matrix of the 1920x1080 design space.
        GUIStyle labelStyle, bigStyle;
        public void DrawFallen(PlayerState p, GUIStyle baseStyle)
        {
            if (labelStyle == null) { labelStyle = new GUIStyle(baseStyle); bigStyle = new GUIStyle(baseStyle) { fontStyle = FontStyle.Bold }; }
            GUIStyle label = labelStyle, big = bigStyle;
            float prog = Mathf.Clamp01(p.StateTicks / 300f), dead = 1 - prog, pulse = .5f + Mathf.Sin(Time.unscaledTime * 8f * .5f) * .5f;
            int sec = Mathf.CeilToInt(Mathf.Max(0, p.StateTicks) / 60f);
            Fill(new Rect(0, 0, 1920, 1080), new Color(.067f, 0, 0, .25f + dead * .35f));
            { var old = GUI.color; GUI.color = new Color(.5f, 0, 0, Mathf.Clamp01(.4f + dead * .45f + pulse * .08f)); GUI.DrawTexture(new Rect(0, 0, 1920, 1080), Vignette(), ScaleMode.StretchToFill); GUI.color = old; } // radial vignette, edges darker red
            Fill(new Rect(0, 0, 1920, 1080), new Color(.67f, 0, 0, (.04f + dead * .1f) * pulse));
            float cx = 960, cy = 1080 * .42f; var panel = new Rect(cx - 140, cy - 52, 280, 88);
            Fill(panel, new Color(0, 0, 0, .78f));
            Fill(new Rect(panel.x, panel.y, panel.width, 2), new Color(.7f, .12f, .12f, .8f)); Fill(new Rect(panel.x, panel.yMax - 2, panel.width, 2), new Color(.7f, .12f, .12f, .8f));
            Fill(new Rect(panel.x, panel.y, 2, panel.height), new Color(.7f, .12f, .12f, .8f)); Fill(new Rect(panel.xMax - 2, panel.y, 2, panel.height), new Color(.7f, .12f, .12f, .8f));
            label.alignment = TextAnchor.MiddleCenter; big.alignment = TextAnchor.MiddleCenter;
            label.fontSize = 22; label.normal.textColor = new Color(1f, .8f, .67f, .9f);
            string power = p.FallenCanRevive ? (English ? "Revive Power " : "부활력 ") + Fmt(p.FallenReviveChance) + "%" : (English ? "Cannot Revive" : "부활 불가");
            GUI.Label(new Rect(cx - 140, cy - 46, 280, 30), power, label);
            big.fontSize = 56; big.normal.textColor = sec <= 1 ? new Color(1, .2f, .2f) : sec <= 2 ? new Color(1, .47f, .27f) : new Color(1, .8f, .27f);
            GUI.Label(new Rect(cx - 140, cy - 20, 280, 64), sec + "s", big);
            label.fontSize = 18; label.normal.textColor = new Color(.8f, .53f, .4f, .5f + pulse * .2f);
            GUI.Label(new Rect(cx - 140, cy + 14, 280, 22), English ? "Fallen..." : "쓰러짐...", label);
            float bw = 480, bx = cx - bw / 2, by = 1080 * .85f;
            Fill(new Rect(bx, by, bw, 8), new Color(.13f, 0, 0, .7f));
            Fill(new Rect(bx, by, bw * prog, 8), sec <= 1 ? new Color(1, .13f, .13f, .85f) : new Color(1, .4f, .27f, .85f));
        }
        static string Fmt(double v) { return v.ToString("R", System.Globalization.CultureInfo.InvariantCulture); }
    }
}
