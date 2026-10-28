using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // M1 region HUD (1-1 four-region rule, R-A follow-up). Web: game.html [REGION-BANNER] _regionBannerShow 61009 + CSS #regionBanner 349-361 + markup 2689,
 // [REGION-ARROW] _regionArrowTarget 61064 / _drawRegionArrow 61138, gate portal label 52269-52271. All values are read-only views of Simulation.Regions / Stage.
 // Drawn in the 1920x1080 design space (same matrix as NativeAreaTitle). CSS blur()/drop-shadow() are approximated with offset copies (recorded difference).
 public sealed class NativeRegionHud
 {
  public const float T = 40f;                       // field tile in pixels (Core StageFlow.T)
  static readonly string[] KoNames = { "북서 · 어둠", "북동 · 번개", "남서 · 물", "남동 · 불" };      // _REG_CH1_KO
  static readonly string[] EnNames = { "Northwest · Dark", "Northeast · Lightning", "Southwest · Water", "Southeast · Fire" };
  static readonly string[] ElKo = { "어둠", "번개", "물", "불" }, ElEn = { "Dark", "Lightning", "Water", "Fire" };   // _REG_EL_KO/EN
  static readonly string[] ElColor = { "#9933cc", "#ffee00", "#3388ff", "#ff5522" };   // ELC[_FB_ELS[fb]] per region idx (fb 2,3,0,1 -> D,L,I,F)
  static readonly double[,] FbSites = { { 52, 42 }, { 148, 42 }, { 58, 158 }, { 148, 150 } };   // _FB_SITES by region idx (angler spawn site; used until the angler exists)

  public bool English;
  // ---- banner state (web G._regCurIdx / G._regBannerCd + the DOM element)
  RegionState[] seen; bool[] prevCleared = new bool[4]; int curIdx = -1, bannerCd;
  bool bannerOn, bannerPurge; float bannerStart; string bKr, bEn, bSub; Color bGem;
  public float? ForcedBannerAge;
  public int CurIdx { get { return curIdx; } }   // G._regCurIdx (the objective panel's "지역 처치" row reads the current region through it)
  public bool BannerActive { get { return bannerOn; } }
  public string BannerKr { get { return bKr; } }
  public string BannerEn { get { return bEn; } }
  public string BannerSub { get { return bSub; } }

  // ---- arrow state (web _raT / _raHas / _raX ...)
  int raT; bool raHas; float raX, raY; Color raCol = new Color(1, .76f, .3f); string raLabel = "";
  readonly double[] raSums = new double[12];
  public bool ArrowShown { get; private set; }
  public Vector2 ArrowPos { get; private set; }
  public string ArrowLabel { get { return raLabel; } }

  Font nanum, cinzelDeco, cinzel, notoSans; Texture2D arrowTex, lineTex, flareTex; bool ready;
  readonly Dictionary<string, GUIStyle> styles = new Dictionary<string, GUIStyle>();
  readonly Dictionary<Color32, Texture2D> glowCache = new Dictionary<Color32, Texture2D>();

  string L(string ko, string en) { return English ? en : ko; }
  static Color Hex(string h) { Color c; ColorUtility.TryParseHtmlString(h, out c); return c; }
  static Color C(int r, int g, int b, float a = 1f) { return new Color(r / 255f, g / 255f, b / 255f, a); }
  // _raDesat: 60 % of the colour + 40 % of the bone grey (154,143,128)
  static Color Desat(Color c) { return new Color(c.r * .6f + 154f / 255 * .4f, c.g * .6f + 143f / 255 * .4f, c.b * .6f + 128f / 255 * .4f, 1f); }

  // harness: take the current cleared flags as already announced (no purge banner for a state the capture set up by hand)
  public void Sync(Simulation sim) { if (sim.Regions == null) return; seen = sim.Regions; for (int i = 0; i < 4; i++) prevCleared[i] = sim.Regions[i].Cleared; }

  public void Reset() { seen = null; curIdx = -1; bannerCd = 0; bannerOn = false; raT = 0; raHas = false; ArrowShown = false; for (int i = 0; i < 4; i++) prevCleared[i] = false; }

  // ---------------- simulation side: _regionTick (every 15th frame outside the arena) ----------------
  public void OnTick(Simulation sim)
  {
   var R = sim.Regions;
   if (R == null) { seen = null; return; }
   var flow = sim.Stage; var P = sim.Player;
   if (!ReferenceEquals(seen, R))   // _regionInit: new region set -> G._regCurIdx = the region the player stands in, cooldown 0
   {
    seen = R; bannerCd = 0; bannerOn = false; curIdx = sim.RegionIdxAt(P.X, P.Y);
    for (int i = 0; i < 4; i++) prevCleared[i] = R[i].Cleared;
   }
   if (!flow.Enabled || flow.InArena || flow.LoadPhase > 0) return;
   if (sim.TickCount % 15 != 0) return;
   if (bannerCd > 0) bannerCd -= 15;
   // _regionCheckClears already ran inside the Core tick: a region that just cleared gets the purge banner (4/4 hands over to the gate-open flow)
   for (int i = 0; i < 4; i++)
   {
    if (R[i].Cleared && !prevCleared[i]) { prevCleared[i] = true; if (sim.RegionClearedCount() < 4) ShowBanner(sim, i, true); }
   }
   // entry banner with hysteresis: the player must be 1.5 tiles past the centre lines
   double tx = P.X / T, ty = P.Y / T, dz = 1.5;
   if (Math.Abs(tx - sim.RegMidX) < dz || Math.Abs(ty - sim.RegMidY) < dz) return;
   int idx = (ty < sim.RegMidY ? 0 : 2) + (tx < sim.RegMidX ? 0 : 1);
   if (idx == curIdx) return;
   curIdx = idx;
   if (bannerCd > 0) return;
   bannerCd = 300;
   ShowBanner(sim, idx, false);
  }

  // _regionBannerShow(idx, purge)
  public void ShowBanner(Simulation sim, int idx, bool purge)
  {
   var R = sim.Regions; if (R == null || idx < 0 || idx > 3) return;
   var r = R[idx]; bool ch1 = sim.Config.StageIndex == 0;
   string nameKo = ch1 ? KoNames[idx] : new[] { "북서", "북동", "남서", "남동" }[idx], nameEn = ch1 ? EnNames[idx] : new[] { "Northwest", "Northeast", "Southwest", "Southeast" }[idx];
   bGem = purge ? Hex("#d8b778") : (r.FbIdx >= 0 ? Desat(Hex(ElColor[idx])) : Hex("#8d7c65"));
   if (purge) { bKr = L(nameKo, nameEn) + " — " + L("정화", "Purged"); bEn = "REGION PURGED · " + sim.RegionClearedCount() + " / 4"; bSub = ""; }
   else
   {
    bKr = L(nameKo, nameEn); bEn = nameEn;
    if (r.Cleared) bSub = L("정화", "Purged");
    else
    {
     bSub = L("처치", "Kills") + " " + Math.Min(r.Kills, r.Total) + " / " + r.Total;
     if (sim.RegionFbAlive(r)) bSub += " · " + L("앵글러 생존", "Angler alive");
    }
   }
   bannerPurge = purge; bannerOn = true; bannerStart = Time.unscaledTime;
  }

  // ---------------- drawing ----------------
  void Init()
  {
   if (ready) return; ready = true;
   nanum = Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular"); cinzelDeco = Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold"); cinzel = Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght") ?? cinzelDeco;
   notoSans = Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Bold") ?? nanum;   // web: Noto Sans KR bold (gate label)
   arrowTex = Resources.Load<Texture2D>("Art/ui/region_arrow");
   lineTex = new Texture2D(32, 1, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
   for (int i = 0; i < 32; i++) lineTex.SetPixel(i, 0, new Color(164 / 255f, 147 / 255f, 115 / 255f, .54f * i / 31f)); lineTex.Apply(false, true);
   // #regionBannerFlare: radial-gradient(ellipse, rgba(255,138,58,.22), rgba(216,183,120,.1) 55%, transparent 75%) in 340x56
   const int fw = 170, fh = 28; flareTex = new Texture2D(fw, fh, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
   for (int y = 0; y < fh; y++) for (int x = 0; x < fw; x++)
   {
    float dx = (x + .5f - fw / 2f) / (fw / 2f), dy = (y + .5f - fh / 2f) / (fh / 2f); float d = Mathf.Sqrt(dx * dx + dy * dy) / 1.4142f * 1.4142f;   // farthest-corner ellipse
    d = Mathf.Sqrt(dx * dx + dy * dy) / 1.4142f;
    Color c; if (d <= .55f) c = Color.Lerp(C(255, 138, 58, .22f), C(216, 183, 120, .1f), d / .55f); else if (d <= .75f) c = Color.Lerp(C(216, 183, 120, .1f), C(216, 183, 120, 0f), (d - .55f) / .2f); else c = C(216, 183, 120, 0f);
    flareTex.SetPixel(x, fh - 1 - y, c);
   }
   flareTex.Apply(false, true);
  }
  GUIStyle St(Font f, int size, TextAnchor a, FontStyle fs = FontStyle.Normal)
  {
   string k = f.name + "|" + size + "|" + a + "|" + fs; GUIStyle s;
   if (!styles.TryGetValue(k, out s))
   {
    s = new GUIStyle(GUI.skin.label) { font = f, fontSize = size, alignment = a, fontStyle = fs, wordWrap = false, clipping = TextClipping.Overflow, padding = new RectOffset(), margin = new RectOffset() };
    styles[k] = s;
   }
   return s;
  }
  static bool Latin(char ch) { return ch < 0x250 || ch == 0x00B7 || ch == 0x2014; }
  // text with CSS letter-spacing (ls in px added after every glyph, the trailing one included as the browser does); Latin runs use Cinzel Decorative, Hangul Nanum Myeongjo.
  float SpacedWidth(string s, int size, float ls, Font latin)
  {
   float w = 0; foreach (char ch in s) w += CharW(ch, size, latin) + ls; return w;
  }
  FontStyle latinFs = FontStyle.Normal;   // weight of the Latin glyphs (web Cinzel 500 for the English line: Bold is the closest face IMGUI can pick)
  float CharW(char ch, int size, Font latin)
  {
   bool lt = latin != null && Latin(ch); var f = lt ? latin : nanum; var st = St(f, size, TextAnchor.MiddleLeft, lt ? latinFs : FontStyle.Normal);
   return st.CalcSize(new GUIContent(ch.ToString())).x;
  }
  void SpacedLine(string s, float cx, float cy, int size, float ls, Color col, Font latin, Vector2 off)
  {
   float w = SpacedWidth(s, size, ls, latin); float x = cx - w / 2f + off.x;
   foreach (char ch in s)
   {
    bool lt = latin != null && Latin(ch); var f = lt ? latin : nanum; var st = St(f, size, TextAnchor.MiddleLeft, lt ? latinFs : FontStyle.Normal); st.normal.textColor = col;
    GUI.Label(new Rect(x, cy + off.y - size, 80, size * 2), ch.ToString(), st);
    x += CharW(ch, size, latin) + ls;
   }
  }
  // soft shadow / blur approximation: ring of offset copies with the total alpha preserved
  void Ring(string s, float cx, float cy, int size, float ls, Font lc, Color col, float radius, float dy)
  {
   for (int i = 0; i < 8; i++) { float a = i * Mathf.PI / 4; SpacedLine(s, cx, cy, size, ls, new Color(col.r, col.g, col.b, col.a * .07f), lc, new Vector2(Mathf.Cos(a) * radius, dy + Mathf.Sin(a) * radius)); }
  }
  static float Ease(float x)   // cubic-bezier(.42,0,.58,1) by bisection
  {
   x = Mathf.Clamp01(x); float lo = 0, hi = 1, t = x;
   for (int i = 0; i < 24; i++) { t = (lo + hi) / 2; float bx = 3 * (1 - t) * (1 - t) * t * .42f + 3 * (1 - t) * t * t * .58f + t * t * t; if (bx < x) lo = t; else hi = t; }
   return 3 * (1 - t) * t * t + t * t * t;
  }
  // keyframes regionBanner 2.7s ease-in-out both: 0 {op0 ty-12 blur4} 12-72 {op1 ty0 blur0} 100 {op0 ty6 blur2}
  public static void SampleBanner(float age, out float op, out float ty, out float blur)
  {
   float p = Mathf.Clamp01(age / 2.7f);
   if (p <= .12f) { float e = Ease(p / .12f); op = Mathf.Lerp(0, 1, e); ty = Mathf.Lerp(-12, 0, e); blur = Mathf.Lerp(4, 0, e); }
   else if (p <= .72f) { op = 1; ty = 0; blur = 0; }
   else { float e = Ease((p - .72f) / .28f); op = Mathf.Lerp(1, 0, e); ty = Mathf.Lerp(0, 6, e); blur = Mathf.Lerp(0, 2, e); }
  }
  // keyframes regionFlare 1.4s ease-out: 0 {op0 sx.5} 22 {op1 sx1} 100 {op0 sx1.25}
  static void SampleFlare(float age, out float op, out float sx)
  {
   float p = Mathf.Clamp01(age / 1.4f);
   if (p <= .22f) { float e = Ease(p / .22f); op = e; sx = Mathf.Lerp(.5f, 1, e); }
   else { float e = Ease((p - .22f) / .78f); op = 1 - e; sx = Mathf.Lerp(1, 1.25f, e); }
  }

  // banner geometry (computed rects of the live web at 1920x1080, see docs): top 28 % = 302.4, width 620
  public const float BannerTop = 302.4f, BannerW = 620f;
  public const float KrCy = 14f, EnCy = 39f, SubCy = 61.5f, LineY = 12.48f;   // offsets from the banner top: row centres measured on the live web DOM at 1920x1080 (kr 28px, en 14px at +32, sub 19px at +52)
  const int KrSize = 21, EnSize = 11, SubSize = 15;
  const float KrLs = .16f * 20.8f, EnLs = .32f * 10.56f, SubLs = .18f * 15f;

  // Bold English line with the web's width: target = Normal glyphs at EnSize + EnLs per glyph (the web DOM width); spacing = what is left after the heavier glyphs, size steps down if the spacing would go under 0.6 px.
  void FitBoldLine(string en, out int size, out float ls)
  {
   latinFs = FontStyle.Normal; float target = SpacedWidth(en, EnSize, EnLs, cinzel);
   latinFs = FontStyle.Bold; size = EnSize; ls = EnLs;
   for (int sz = EnSize; sz >= 8; sz--)
   {
    float glyphs = SpacedWidth(en, sz, 0f, cinzel); float l = en.Length > 0 ? (target - glyphs) / en.Length : EnLs;
    size = sz; ls = Mathf.Max(0f, l); if (l >= 0.6f) break;
   }
   latinFs = FontStyle.Normal;
  }
  void DrawBanner()
  {
   if (!bannerOn) return;
   float age = ForcedBannerAge.HasValue ? ForcedBannerAge.Value : Time.unscaledTime - bannerStart;
   if (!ForcedBannerAge.HasValue && age > 2.7f) { bannerOn = false; return; }
   float op, ty, blur; SampleBanner(age, out op, out ty, out blur); if (op <= .002f) return;
   float cx = 960, top = BannerTop + ty, left = 960 - BannerW / 2f;
   var old = GUI.color;
   // ::before / ::after: top .78em, 21 % wide, 1px gradient, opacity .8 (right one mirrored)
   GUI.color = new Color(1, 1, 1, .8f * op);
   GUI.DrawTexture(new Rect(left, top + LineY, BannerW * .21f, 1), lineTex);
   GUI.DrawTextureWithTexCoords(new Rect(left + BannerW - BannerW * .21f, top + LineY, BannerW * .21f, 1), lineTex, new Rect(1, 0, -1, 1));
   // purge flare (340x56, centred, top .5em)
   if (bannerPurge)
   {
    float fop, fsx; SampleFlare(age, out fop, out fsx);
    if (fop > .002f) { GUI.color = new Color(1, 1, 1, fop * op); float fw = 340 * fsx; GUI.DrawTexture(new Rect(cx - fw / 2f, top + 8f, fw, 56f), flareTex); }
   }
   GUI.color = old;
   // row 1: gem  KR  gem
   float kw = SpacedWidth(bKr, KrSize, KrLs, cinzelDeco);
   Color krCol = bannerPurge ? C(233, 216, 180, .96f * op) : C(223, 214, 194, .92f * op);
   Ring(bKr, cx, top + KrCy, KrSize, KrLs, cinzelDeco, new Color(0, 0, 0, .9f * op), 5f, 4f);                       // filter: drop-shadow(0 4px 10px rgba(0,0,0,.9))
   SpacedLine(bKr, cx, top + KrCy, KrSize, KrLs, new Color(0, 0, 0, .55f * op), cinzelDeco, new Vector2(0, 2));      // text-shadow 0 2px 6px #000
   if (blur > .6f) { Ring(bKr, cx, top + KrCy, KrSize, KrLs, cinzelDeco, new Color(krCol.r, krCol.g, krCol.b, krCol.a * 2.2f), blur * .5f, 0); SpacedLine(bKr, cx, top + KrCy, KrSize, KrLs, new Color(krCol.r, krCol.g, krCol.b, krCol.a * .3f), cinzelDeco, Vector2.zero); }
   else SpacedLine(bKr, cx, top + KrCy, KrSize, KrLs, krCol, cinzelDeco, Vector2.zero);
   float gemHalf = 3f, gemGap = 12f + 3f;   // 6px diamond, margin 0 12px
   DrawGem(cx - kw / 2f - gemGap, top + KrCy, bGem, op); DrawGem(cx + kw / 2f + gemGap, top + KrCy, bGem, op);
   // row 2: English line, uppercase Cinzel .32em
   // HUD condition of the map lead (4ceb18b51 verdict): the English line must read as heavy and bright as the web's (Cinzel 500). IMGUI only has Normal / Bold of the variable font,
   // so the line is drawn Bold and the width the web measures (Normal glyphs + .32em spacing) is kept by shrinking the letter-spacing and, when needed, the size.
   string en = bEn.ToUpperInvariant(); int enSize; float enLs; FitBoldLine(en, out enSize, out enLs);
   latinFs = FontStyle.Bold;
   Ring(en, cx, top + EnCy, enSize, enLs, cinzel, new Color(0, 0, 0, .9f * op), 5f, 4f);
   SpacedLine(en, cx, top + EnCy, enSize, enLs, C(168, 153, 127, .72f * op), cinzel, Vector2.zero); latinFs = FontStyle.Normal;
   // row 3: sub line
   if (!string.IsNullOrEmpty(bSub))
   {
    Ring(bSub, cx, top + SubCy, SubSize, SubLs, null, new Color(0, 0, 0, .9f * op), 5f, 4f);
    SpacedLine(bSub, cx, top + SubCy, SubSize, SubLs, new Color(0, 0, 0, .95f * op), null, new Vector2(0, 1));
    SpacedLine(bSub, cx, top + SubCy, SubSize, SubLs, C(219, 208, 190, .92f * op), null, Vector2.zero);
   }
   GUI.color = old;
  }
  // .rb-gem: 6x6 rotated 45deg, 1px rgba(16,11,8,.9) border, box-shadow 0 0 5px rgba(0,0,0,.6) (purge: gold glow)
  void DrawGem(float cx, float cy, Color col, float op)
  {
   var m = GUI.matrix; var oc = GUI.color;
   RotateLocal(new Vector2(cx, cy), 45);
   float glow = bannerPurge ? 9f : 5f; Color gc = bannerPurge ? C(216, 183, 120, .7f * op) : new Color(0, 0, 0, .6f * op);
   GUI.color = new Color(gc.r, gc.g, gc.b, gc.a * .14f); GUI.DrawTexture(new Rect(cx - 3 - glow * .25f, cy - 3 - glow * .25f, 6 + glow * .5f, 6 + glow * .5f), Texture2D.whiteTexture);
   GUI.color = new Color(16 / 255f, 11 / 255f, 8 / 255f, .9f * op); GUI.DrawTexture(new Rect(cx - 3, cy - 3, 6, 6), Texture2D.whiteTexture);   // 6px border-box with a 1px border
   GUI.color = new Color(col.r, col.g, col.b, op); GUI.DrawTexture(new Rect(cx - 2, cy - 2, 4, 4), Texture2D.whiteTexture);
   GUI.matrix = m; GUI.color = oc;
  }
  static void RotateLocal(Vector2 pivot, float deg) { GUI.matrix = GUI.matrix * Matrix4x4.TRS(pivot, Quaternion.Euler(0, 0, deg), Vector3.one) * Matrix4x4.TRS(-pivot, Quaternion.identity, Vector3.one); }

  // ---------------- arrow ----------------
  // _regionArrowTarget: gate once it opens, else the nearest uncleared region (angler > living-mob centroid > region centre)
  void ArrowTarget(Simulation sim)
  {
   raHas = false; var R = sim.Regions; if (R == null) return;
   var flow = sim.Stage;
   if (flow.BossUnlocked)
   {
    if (flow.HasFieldGate) { raX = (flow.FieldGateCx + .5f) * T; raY = (flow.FieldGateY + 2.5f) * T; raCol = Desat(Hex("#66ccff")); raLabel = L("지옥문", "Hell Gate"); raHas = true; }
    return;
   }
   Array.Clear(raSums, 0, raSums.Length);
   foreach (var e in sim.Enemies)
   {
    if (e == null || !e.Alive || e.IsBoss) continue;
    int ri = e.HasHome ? sim.RegionIdxAt(e.HomeX, e.HomeY) : sim.RegionIdxAt(e.X, e.Y);
    if (ri < 0 || R[ri].Cleared) continue;
    raSums[ri * 3] += e.X; raSums[ri * 3 + 1] += e.Y; raSums[ri * 3 + 2]++;
   }
   double bd = double.MaxValue, bx = 0, by = 0; int bIdx = -1; bool bFb = false, found = false; var P = sim.Player;
   for (int ri = 0; ri < 4; ri++)
   {
    var r = R[ri]; if (r.Cleared) continue;
    double tx, ty; bool isFb = false;
    var fb = (r.FbIdx >= 0 && sim.FieldBosses != null && r.FbIdx < sim.FieldBosses.Length) ? sim.FieldBosses[r.FbIdx] : null;
    bool fbLive = fb != null && fb.Hp > 0;
    if (fbLive && sim.RegionRatio(r, ri) >= Simulation.RegionClearRatio - 1e-9) { tx = fb.X; ty = fb.Y; isFb = true; }   // kills done, only the angler is left: straight to it
    else if (raSums[ri * 3 + 2] > 0) { tx = raSums[ri * 3] / raSums[ri * 3 + 2]; ty = raSums[ri * 3 + 1] / raSums[ri * 3 + 2]; }   // living-mob centroid
    else if (fbLive) { tx = fb.X; ty = fb.Y; isFb = true; }
    else if (r.FbIdx >= 0 && !sim.FieldBossSpawned && !sim.Stage.FieldBossDone) { tx = (FbSites[ri, 0] + .5) * T; ty = (FbSites[ri, 1] + .5) * T; isFb = true; }   // angler not spawned yet: its site
    else { double x0 = (ri & 1) != 0 ? sim.RegMidX : 0, x1 = (ri & 1) != 0 ? sim.MapTilesWide : sim.RegMidX, y0 = (ri >> 1) != 0 ? sim.RegMidY : 0, y1 = (ri >> 1) != 0 ? sim.MapTilesHigh : sim.RegMidY; tx = (x0 + x1) / 2 * T; ty = (y0 + y1) / 2 * T; }
    double d = (tx - P.X) * (tx - P.X) + (ty - P.Y) * (ty - P.Y);
    if (d < bd) { bd = d; bx = tx; by = ty; bIdx = ri; bFb = isFb; found = true; }
   }
   if (!found) return;
   raX = (float)bx; raY = (float)by; raHas = true;
   if (bFb) { raCol = Desat(Hex(ElColor[bIdx])); raLabel = L("앵글러", "Angler") + " · " + L(ElKo[bIdx], ElEn[bIdx]); }
   else { raCol = Hex("#d8b778"); raLabel = L(KoNames[bIdx], EnNames[bIdx]); }
  }

  // blurred, colour-filled silhouette behind the arrow (web _raGlow: blur(9px) then source-in colour), pad 18
  Texture2D Glow(Color col)
  {
   var key = (Color32)col; Texture2D g; if (glowCache.TryGetValue(key, out g)) return g;
   if (arrowTex == null) return null;
   const int pad = 18; int w = arrowTex.width + pad * 2, h = arrowTex.height + pad * 2;
   var src = arrowTex.GetPixels32(); float[] a = new float[w * h], tmp = new float[w * h];
   for (int y = 0; y < arrowTex.height; y++) for (int x = 0; x < arrowTex.width; x++) a[(y + pad) * w + x + pad] = src[y * arrowTex.width + x].a / 255f;
   int rad = 27; float sigma = 9f; var k = new float[rad * 2 + 1]; float sum = 0;
   for (int i = -rad; i <= rad; i++) { k[i + rad] = Mathf.Exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + rad]; }
   for (int i = 0; i < k.Length; i++) k[i] /= sum;
   for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) { float s = 0; for (int i = -rad; i <= rad; i++) { int xx = x + i; if (xx >= 0 && xx < w) s += a[y * w + xx] * k[i + rad]; } tmp[y * w + x] = s; }
   for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) { float s = 0; for (int i = -rad; i <= rad; i++) { int yy = y + i; if (yy >= 0 && yy < h) s += tmp[yy * w + x] * k[i + rad]; } a[y * w + x] = s; }
   var px = new Color32[w * h]; var c32 = (Color32)col;
   for (int i = 0; i < px.Length; i++) px[i] = new Color32(c32.r, c32.g, c32.b, (byte)Mathf.Clamp(Mathf.RoundToInt(a[i] * 255f), 0, 255));
   g = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
   g.SetPixels32(px); g.Apply(false, true); glowCache[key] = g; return g;
  }

  public struct Safe { public Rect clock; public float bottomTop; public Rect[] blocks; }
  public Func<float, float, Vector2> ToGUI;   // world px -> 1920x1080 design space
  public Func<Safe> SafeZone;

  void DrawArrow(Simulation sim, bool suppress)
  {
   ArrowShown = false;
   if (suppress || sim.Regions == null || arrowTex == null) return;
   var flow = sim.Stage; if (flow.InArena || flow.LoadPhase > 0 || flow.StageCleared) return;
   if (--raT <= 0) { raT = 20; ArrowTarget(sim); }
   if (!raHas) return;
   const float VW = 1920, VH = 1080, mIn = 52;
   Vector2 sp = ToGUI(raX, raY); float sx = sp.x, sy = sp.y;
   if (sx > mIn && sx < VW - mIn && sy > mIn && sy < VH - mIn) return;   // target on screen: hidden
   var sz = SafeZone != null ? SafeZone() : new Safe { clock = new Rect(0, 0, 0, 0), bottomTop = VH, blocks = new Rect[0] };
   const float M = 24, pad = 12;
   float x0 = M, y0 = M, x1 = VW - M, y1 = VH - M;
   if (sz.clock.width > 0) y0 = Mathf.Max(y0, sz.clock.yMax + pad);
   if (sz.bottomTop < VH) y1 = Mathf.Min(y1, sz.bottomTop - pad);
   float sx0 = x0, sy0 = Mathf.Min(y0, VH * .4f), sx1 = Mathf.Max(x1, x0 + 40), sy1 = Mathf.Max(y1, VH * .55f);
   float cx = VW / 2, cy = VH / 2, dx = sx - cx, dy = sy - cy;
   float t = Mathf.Min((VW / 2 - mIn) / (Mathf.Abs(dx) > 1e-6f ? Mathf.Abs(dx) : 1e-6f), (VH / 2 - mIn) / (Mathf.Abs(dy) > 1e-6f ? Mathf.Abs(dy) : 1e-6f));
   float ax = cx + dx * t, ay = cy + dy * t; float ang = Mathf.Atan2(dy, dx);
   ax = Mathf.Clamp(ax, sx0, sx1); ay = Mathf.Clamp(ay, sy0, sy1);
   foreach (var rc0 in sz.blocks)
   {
    var rc = new Rect(rc0.x - pad, rc0.y - pad, rc0.width + pad * 2, rc0.height + pad * 2);
    if (ax > rc.x && ax < rc.xMax && ay > rc.y && ay < rc.yMax)
    {
     float dl = ax - rc.x, dr = rc.xMax - ax, dt = ay - rc.y, db = rc.yMax - ay, mv = Mathf.Min(Mathf.Min(dl, dr), Mathf.Min(dt, db));
     if (mv == dl) ax = rc.x; else if (mv == dr) ax = rc.xMax; else if (mv == dt) ay = rc.y; else ay = rc.yMax;
    }
   }
   ax = Mathf.Clamp(ax, sx0, sx1); ay = Mathf.Clamp(ay, sy0, sy1);
   ArrowShown = true; ArrowPos = new Vector2(ax, ay);
   float pulse = .72f + .16f * Mathf.Sin(sim.TickCount * .09f);
   var oldM = GUI.matrix; var oldC = GUI.color;
   RotateLocal(new Vector2(ax, ay), ang * Mathf.Rad2Deg);   // translate(ax,ay) rotate(ang)
   float W = 96, H = W * arrowTex.height / arrowTex.width, ox = ax + 40 - W;
   var gl = Glow(raCol);
   if (gl != null)
   {
    float k = W / arrowTex.width; GUI.color = new Color(1, 1, 1, Mathf.Min(1, pulse * 1.25f));
    var gr = new Rect(ox - 18 * k, ay - H / 2 - 18 * k, gl.width * k, gl.height * k); GUI.DrawTexture(gr, gl); GUI.DrawTexture(gr, gl);
   }
   GUI.color = new Color(1, 1, 1, Mathf.Min(1, pulse + .2f)); GUI.DrawTexture(new Rect(ox, ay - H / 2, W, H), arrowTex);
   GUI.matrix = oldM; GUI.color = oldC;
   // label: Nanum Myeongjo 700 14px bone, Cinzel 12px distance, 8-direction black offsets
   float dm = Mathf.Floor(Mathf.Sqrt((raX - sim.Player.X) * (raX - sim.Player.X) + (raY - sim.Player.Y) * (raY - sim.Player.Y)) / 64f);
   float lx = ax - Mathf.Cos(ang) * 68, ly = ay - Mathf.Sin(ang) * 68;
   if (!string.IsNullOrEmpty(raLabel)) OutlinedCenter(raLabel, lx, ly, nanum, 14, FontStyle.Bold, C(228, 214, 185, .96f), 1.5f);
   OutlinedCenter(dm + "m", lx, ly + 16, cinzel, 12, FontStyle.Bold, C(201, 184, 145, .92f), 1.4f);
  }
  void OutlinedCenter(string s, float x, float y, Font f, int size, FontStyle fs, Color col, float o)
  {
   var st = St(f, size, TextAnchor.MiddleCenter, fs); var keep = st.normal.textColor;
   st.normal.textColor = new Color(0, 0, 0, .9f);
   for (int i = 0; i < 8; i++) { float a = i * Mathf.PI / 4; GUI.Label(new Rect(x - 300 + Mathf.Cos(a) * o, y - 20 + Mathf.Sin(a) * o, 600, 40), s, st); }
   st.normal.textColor = col; GUI.Label(new Rect(x - 300, y - 20, 600, 40), s, st); st.normal.textColor = keep;
  }

  // ---------------- gate label (web 52263-52271) ----------------
  // "▼ 지옥문 봉인 (지역 N/4) ▼" over the exit portal once the player is within 5 tiles; blue "보스방" after the gate opened.
  public bool GateLabelShown { get; private set; }
  public string GateLabelText { get; private set; }
  void DrawGateLabel(Simulation sim)
  {
   GateLabelShown = false; var flow = sim.Stage;
   // the web draws the boss-gate tree + 250px portal after this label (52284-52300), which covers it on every map that has a boss gate (1-1 included): the label only shows without one
   if (!flow.BossAlive || flow.InArena || flow.StageCleared || flow.Exits.Count == 0 || flow.HasFieldGate || ToGUI == null) return;
   double sx = 0, sy = 0; foreach (var ex in flow.Exits) { sx += ex.X; sy += ex.Y; } sx /= flow.Exits.Count; sy /= flow.Exits.Count;   // _cacheExitCenter
   float pcx = (float)(sx + .5) * T, pcy = (float)(sy + .5) * T; var P = sim.Player;
   float now = Time.unscaledTime * 1000f, dg = Mathf.Sqrt((P.X - pcx) * (P.X - pcx) + (P.Y - pcy) * (P.Y - pcy));
   if (dg >= T * 5) return;
   float psz = T * 3 + Mathf.Sin(now / 400f) * T * .3f; bool unlocked = flow.BossUnlocked;
   float alpha = Mathf.Min(.9f, (1 - dg / (T * 5)) * .7f + Mathf.Sin(now / 300f) * .15f); if (alpha <= 0) return;
   string text = "▼ " + (unlocked ? L("보스방", "Boss Room") : (sim.Regions != null ? L("지옥문 봉인 (지역 ", "Gate Sealed (Regions ") + sim.RegionClearedCount() + "/4)" : L("지옥문 봉인 (80% 처치)", "Gate Sealed (80% kills)"))) + " ▼";
   GateLabelText = text; GateLabelShown = true;
   Vector2 pt = ToGUI(pcx, pcy - psz * .45f);
   var st = St(notoSans, 13, TextAnchor.LowerCenter, FontStyle.Normal); var keep = st.normal.textColor;   // web: bold 13px "Noto Sans KR" (Bold face)
   Color col = unlocked ? Hex("#66ccff") : Hex("#ff6644"); col.a = alpha;
   st.normal.textColor = col; GUI.Label(new Rect(pt.x - 300, pt.y - 40, 600, 40), text, st); st.normal.textColor = keep;
  }

  // ---------------- entry ----------------
  public void Draw(Simulation sim, bool suppressArrow)
  {
   if (sim == null) return; Init();
   DrawArrow(sim, suppressArrow);
   DrawBanner();
  }
  public void DrawWorld(Simulation sim) { if (sim == null) return; Init(); DrawGateLabel(sim); }
 }
}
