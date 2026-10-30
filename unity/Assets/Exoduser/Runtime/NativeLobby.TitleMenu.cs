using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Title screen of the web index.html (phase 2, 4709~4810 and the #splashTitle* CSS 494~511, design lead pick 2026-10-27 / user-approved [승인-디자인-5]): the silent title
    // movie loops under a dark veil, the logo stands at (96, 96) 520 px wide and a menu of black-iron rows at (116, 436) replaces the old "press any key" line.
    // Rows (what the web builds, _buildTitleMenu): start game, replay intro, [demo] Steam wishlist, [native player] quit. Up / Down / W / S (and the pad) move, Enter / Space / A run
    // the selected row at once, the mouse hovers and clicks rows; every other key and a click elsewhere do nothing. Everything below is in the 1920 x 1080 stage of NativeLobby.Draw.
    public sealed partial class NativeLobby
    {
        sealed class TitleRow { public string Label; public Action Act; public float Sel; }
        readonly List<TitleRow> titleRows = new List<TitleRow>();
        int titleSel, titleRowsBuiltFor = -1; float titleStart = -1;
        Texture2D titleVeil; Texture titleLogo, titleBg; bool titleArtLoaded;
        Font titleMenuFont, titleBuildFont; float padStickPrev;
        const string SteamWishlistUrl = "https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/";
        public const string TitleMovie = "title_motion_20261028.mp4";
        /// <summary>Test hook (headless smoke): the selected row and the row labels, and a way to read what ran.</summary>
        public int TitleSelected { get { return titleSel; } }
        public IList<string> TitleLabels { get { var l = new List<string>(); foreach (var r in titleRows) l.Add(r.Label); return l; } }
        public int TitleActivations { get; private set; }

        void BuildTitleRows()
        {
            titleRows.Clear();
            titleRows.Add(new TitleRow { Label = K("게임 시작", "START GAME"), Act = () => { PlayStartupEnter(); AdvanceSplash(); } });           // playEnterSFX(); skip()
            titleRows.Add(new TitleRow { Label = K("인트로 다시 보기", "REPLAY INTRO"), Act = () => ReplayIntro() });                                   // skip(); _goCinematic()
            var kind = BuildFlavor.Current.Id;
            if (kind == BuildFlavor.Kind.Demo || kind == BuildFlavor.Kind.Bic) titleRows.Add(new TitleRow { Label = K("STEAM 위시리스트 추가", "ADD TO STEAM WISHLIST"), Act = () => Application.OpenURL(SteamWishlistUrl) });
#if !UNITY_WEBGL
            titleRows.Add(new TitleRow { Label = K("게임 종료", "QUIT GAME"), Act = QuitFromTitle });                                                    // only when the player can quit (NW.js / Electron in the web)
#endif
            titleSel = 0; for (int i = 0; i < titleRows.Count; i++) titleRows[i].Sel = i == 0 ? 1 : 0;
        }

        void QuitFromTitle()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        void SelectTitleRow(int i) { if (titleRows.Count == 0) return; titleSel = (i % titleRows.Count + titleRows.Count) % titleRows.Count; }
        void ActivateTitleRow(int i) { if (splash != 2 || i < 0 || i >= titleRows.Count) return; SelectTitleRow(i); TitleActivations++; var act = titleRows[i].Act; act(); }

        // Update, splash == 2: only the menu keys count (Up / Down / W / S, Enter / Space / A); a key that is not one of them does nothing, as in the web's splashKey.
        void UpdateTitleMenu(float dt)
        {
            if (titleRowsBuiltFor != splash || titleRows.Count == 0) { BuildTitleRows(); titleRowsBuiltFor = splash; titleStart = Time.unscaledTime; }
            for (int i = 0; i < titleRows.Count; i++) titleRows[i].Sel = Mathf.MoveTowards(titleRows[i].Sel, i == titleSel ? 1 : 0, dt / (i == titleSel ? .25f : .18f));   // background .25 s, colour .18 s
            if (AutomatedInput) return;
            if (Time.frameCount == inputFence) return;
            float stick = ExoInput.VerticalRaw();
            bool keyUp = LobbyKeys.Down(KeyCode.UpArrow) || LobbyKeys.Down(KeyCode.W), keyDown = LobbyKeys.Down(KeyCode.DownArrow) || LobbyKeys.Down(KeyCode.S);
            bool keyboardHeld = LobbyKeys.Held(KeyCode.UpArrow) || LobbyKeys.Held(KeyCode.DownArrow) || LobbyKeys.Held(KeyCode.W) || LobbyKeys.Held(KeyCode.S);
            bool padUp = !keyboardHeld && stick > .5f && padStickPrev <= .5f, padDown = !keyboardHeld && stick < -.5f && padStickPrev >= -.5f;   // the legacy Vertical axis is + up
            padStickPrev = keyboardHeld ? 0 : stick;
            if (keyUp || padUp) SelectTitleRow(titleSel - 1);
            else if (keyDown || padDown) SelectTitleRow(titleSel + 1);
            bool padConfirm = false; try { padConfirm = ReadFrontendPadFrame().ConfirmDown; } catch (Exception) { }
            if (LobbyKeys.Down(KeyCode.Return) || LobbyKeys.Down(KeyCode.KeypadEnter) || LobbyKeys.Down(KeyCode.Space) || padConfirm) ActivateTitleRow(titleSel);
        }

        void EnsureTitleArt()
        {
            if (titleArtLoaded) return; titleArtLoaded = true;
            titleLogo = Resources.Load<Texture2D>("Art/lobby/logo_exoduser"); titleBg = Resources.Load<Texture2D>("Art/lobby/title_bg_20261028");
            titleMenuFont = NativeSilverHellUi.Font() ?? Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular"); titleBuildFont = Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght");
            titleVeil = BakeTitleVeil();
        }

        // #splashTitleUI background: four layers, the first listed is on top. Baked at 192 x 108 and stretched (smooth gradients).
        static Texture2D BakeTitleVeil()
        {
            const int w = 192, h = 108; var px = new Color32[w * h];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                float fx = (x + .5f) / w, fy = (y + .5f) / h;   // fy 0 = top of the stage
                float pr = 0, pg = 0, pb = 0, pa = 0;
                Action<float, float, float, float> over = (r, g, b, a) => { pr = r * a + pr * (1 - a); pg = g * a + pg * (1 - a); pb = b * a + pb * (1 - a); pa = a + pa * (1 - a); };
                // 4: radial ellipse 120% 100% at 50% 50%: transparent 62% -> rgba(0,0,0,.55) 100%
                float t4 = Mathf.Sqrt(Sq((fx - .5f) / 1.2f) + Sq((fy - .5f) / 1.0f)); over(0, 0, 0, Ramp(t4, .62f, 0, 1f, .55f));
                // 3: linear 0deg (to top): rgba(2,5,5,.7) 0% -> 0 at 26%
                over(2f / 255, 5f / 255, 5f / 255, Ramp(1 - fy, 0, .7f, .26f, 0));
                // 2: linear 90deg: .55 at 0% -> .18 at 38% -> 0 at 55%
                float a2 = fx < .38f ? Ramp(fx, 0, .55f, .38f, .18f) : Ramp(fx, .38f, .18f, .55f, 0); over(2f / 255, 5f / 255, 5f / 255, a2);
                // 1: radial ellipse 46% 78% at 24% 56%: .62 at 0% -> .38 at 55% -> 0 at 100%
                float t1 = Mathf.Sqrt(Sq((fx - .24f) / .46f) + Sq((fy - .56f) / .78f)); float a1 = t1 < .55f ? Ramp(t1, 0, .62f, .55f, .38f) : Ramp(t1, .55f, .38f, 1, 0); over(2f / 255, 5f / 255, 5f / 255, a1);
                float inv = pa > 0 ? 1 / pa : 0;
                px[(h - 1 - y) * w + x] = new Color32((byte)Mathf.Clamp(pr * inv * 255, 0, 255), (byte)Mathf.Clamp(pg * inv * 255, 0, 255), (byte)Mathf.Clamp(pb * inv * 255, 0, 255), (byte)Mathf.Clamp(pa * 255, 0, 255));
            }
            var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp }; tex.SetPixels32(px); tex.Apply(false, true); return tex;
        }
        static float Sq(float v) { return v * v; }
        static float Ramp(float t, float t0, float v0, float t1, float v1) { if (t <= t0) return v0; if (t >= t1) return v1; return v0 + (v1 - v0) * (t - t0) / (t1 - t0); }

        // text with CSS letter-spacing: the font's own advances plus `spacing` px after every glyph
        static float SpacedWidth(Font font, int size, string text, float spacing)
        {
            font = NativeSilverHellUi.TextFont(font,text);
            if (font == null) return 0; font.RequestCharactersInTexture(text, size); float w = 0;
            foreach (char ch in text) { CharacterInfo info; if (font.GetCharacterInfo(ch, out info, size)) w += info.advance + spacing; }
            return w;
        }

        void DrawSpaced(float x, float y, float height, string text, Font font, int size, float spacing, Color color, bool shadow)
        {
            font = NativeSilverHellUi.TextFont(font,text);
            if (font == null) return;
            var st = new GUIStyle(GUI.skin.label) { font = font, fontSize = size, alignment = TextAnchor.MiddleLeft, wordWrap = false, clipping = TextClipping.Overflow, padding = new RectOffset(0, 0, 0, 0) };
            font.RequestCharactersInTexture(text, size); var prev = GUI.color; float cx = x;
            foreach (char ch in text)
            {
                CharacterInfo info; if (!font.GetCharacterInfo(ch, out info, size)) continue; string s = ch.ToString();
                if (ch != ' ')
                {
                    if (shadow) { st.normal.textColor = new Color(0, 0, 0, .9f * color.a); NativeUiAudit.Label(new Rect(cx, y + 1, 80, height), s, st); st.normal.textColor = new Color(0, 0, 0, .3f * color.a); NativeUiAudit.Label(new Rect(cx + .5f, y + 3, 80, height), s, st); NativeUiAudit.Label(new Rect(cx - .5f, y + 3, 80, height), s, st); }
                    st.normal.textColor = NativeSilverHellUi.TextColor(color); NativeUiAudit.Label(new Rect(cx, y, 80, height), s, st);
                }
                cx += info.advance + spacing;
            }
            GUI.color = prev;
        }

        // 1920 x 1080 stage; the movie is drawn "cover" like titleLoop: k = max(w / tw, h / th), dx = min(0, max(w - dw, (w - dw) * .62)), centred vertically
        void DrawTitleSplash()
        {
            EnsureTitleArt();
            Texture src = movie.Error.Length == 0 && movie.Prepared && movie.Frame >= 0 ? (Texture)movie.Texture : titleBg;   // a failed movie falls back to the still art (_titleArt)
            if (src == null) return;
            float tw = src.width, th = src.height, k = Mathf.Max(1920f / tw, 1080f / th), dw = tw * k, dh = th * k, dx = Mathf.Min(0, Mathf.Max(1920 - dw, (1920 - dw) * .62f)), dy = (1080 - dh) / 2;
            NativeUiAudit.DrawTexture(new Rect(dx, dy, dw, dh), src, ScaleMode.StretchToFill, false); OriginalArtDrawn = true;
            if (titleRowsBuiltFor != splash || titleRows.Count == 0) return;   // the menu is built by the first Update of this splash
            float fade = Mathf.Clamp01((Time.unscaledTime - titleStart) / 1f); var prev = GUI.color;
            GUI.color = new Color(1, 1, 1, fade); NativeUiAudit.DrawTexture(new Rect(0, 0, 1920, 1080), titleVeil, ScaleMode.StretchToFill, true);
            if (titleLogo != null) { float lw = 520, lh = lw * titleLogo.height / titleLogo.width; GUI.color = new Color(0, 0, 0, .5f * fade); NativeUiAudit.DrawTexture(new Rect(96, 106, lw, lh), titleLogo, ScaleMode.StretchToFill, true); GUI.color = new Color(1, 1, 1, fade); NativeUiAudit.DrawTexture(new Rect(96, 96, lw, lh), titleLogo, ScaleMode.StretchToFill, true); }
            const float left = 116, top = 436, width = 400;
            var e = Event.current;
            for (int i = 0; i < titleRows.Count; i++)
            {
                float rowH=i==0?68:48;
                var rect = new Rect(left, i==0?top:top+84+(i-1)*62, i==0?width:width-32, rowH);
                if (e.type == EventType.MouseMove || e.type == EventType.Repaint) { if (rect.Contains(e.mousePosition) && e.type == EventType.MouseMove && !AutomatedInput && i != titleSel) SelectTitleRow(i); }
                if (e.type == EventType.MouseDown && e.button == 0 && rect.Contains(e.mousePosition) && !AutomatedInput) { ActivateTitleRow(i); e.Use(); return; }
                var row = titleRows[i]; float s = row.Sel;
                GUI.color=new Color(1,1,1,fade);
                NativeSilverHellUi.ActionPlate(rect,i==0,s,!AutomatedInput&&rect.Contains(e.mousePosition)&&ExoInput.Mouse(0));
                Color txt = Color.Lerp(new Color(201f / 255, 199f / 255, 195f / 255), new Color(242f / 255, 240f / 255, 236f / 255), s); txt.a = fade;
                int size=i==0?22:18;float spacing=size*.14f;
                float labelWidth=SpacedWidth(titleMenuFont,size,row.Label,spacing)-spacing;
                GUI.color = Color.white; DrawSpaced(rect.center.x-labelWidth/2, rect.y, rowH, row.Label, titleMenuFont, size, spacing, txt, true);
            }
            // #splashTitleBuild: right 36, bottom 26, Cinzel 600 11 px / 1.7, letter-spacing .28em, rgba(230,227,221,.6), two lines right aligned
            string l1 = BuildFlavor.Current.Label + (string.IsNullOrEmpty(BuildFlavor.ReleaseVersion) ? "" : " · v" + BuildFlavor.ReleaseVersion), l2 = "FOR DEAR GAMERS"; float sp = 11 * .28f, lh2 = 11 * 1.7f;
            GUI.color = Color.white; var bc = new Color(230f / 255, 227f / 255, 221f / 255, .6f * fade);
            DrawSpaced(1920 - 36 - SpacedWidth(titleBuildFont, 11, l1, sp) + sp, 1080 - 26 - lh2 * 2, lh2, l1, titleBuildFont, 11, sp, bc, true);
            DrawSpaced(1920 - 36 - SpacedWidth(titleBuildFont, 11, l2, sp) + sp, 1080 - 26 - lh2, lh2, l2, titleBuildFont, 11, sp, bc, true);
            GUI.color = prev;
        }
    }
}
