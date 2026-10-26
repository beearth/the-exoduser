// PC-A16: bakes the few symbols the key list uses that the Unity Noto Sans KR files do not contain, from the web render (same fonts / sizes as the web CSS):
//   tab labels  "⌨" / "🎮"  (14px 600, colour emoji), gamepad title "🎮" (17.6px), guide title "🎮" (12.8px 700),
//   waiting text "⟨" "⟩" (14px 700, white -> tinted in Unity), alternate delete "✕" (16px 400, white -> tinted).
// usage: NODE_PATH=<playwright> node bake_keybind_glyphs.cjs <tmp-dir> <web-commit>   -> <tmp>/cells/*.png + <tmp>/manifest.json (build_keybind_glyphs.py packs them)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const [tmp, commit] = process.argv.slice(2);
const FONT = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap');";
const GLYPHS = [
  { id: 'kbd14', text: '⌨', css: "font:600 14px 'Noto Sans KR',sans-serif;letter-spacing:.28px;color:#fff", color: true },   // U+2328 renders as a text glyph (tab text colour), not a colour emoji
  { id: 'pad14', text: '🎮', css: "font:600 14px 'Noto Sans KR',sans-serif;letter-spacing:.28px", color: false },
  { id: 'pad17', text: '🎮', css: "font:400 17.6px 'Noto Sans KR',sans-serif;letter-spacing:1.76px", color: false },
  { id: 'pad12', text: '🎮', css: "font:700 12.8px 'Noto Sans KR',sans-serif;letter-spacing:1.024px", color: false },
  { id: 'lang', text: '⟨', css: "font:700 14px 'Noto Sans KR',sans-serif;letter-spacing:.28px;color:#fff", color: true },
  { id: 'rang', text: '⟩', css: "font:700 14px 'Noto Sans KR',sans-serif;letter-spacing:.28px;color:#fff", color: true },
  { id: 'cross', text: '✕', css: "font:400 16px 'Noto Sans KR',sans-serif;letter-spacing:.32px;color:#fff", color: true },
];
(async () => {
  fs.mkdirSync(path.join(tmp, 'cells'), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 200, height: 120 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage();
  await page.setContent(`<style>${FONT}html,body{margin:0;background:transparent}#g{position:absolute;left:16px;top:16px;white-space:pre;line-height:normal}</style><div id="g"></div>`);
  await page.evaluate(() => document.fonts.load("600 14px 'Noto Sans KR'", '⌨🎮⟨⟩✕')); await page.evaluate(() => document.fonts.ready);
  const manifest = { source: { webCommit: commit, extractedAt: new Date().toISOString(), tool: 'bake_keybind_glyphs.cjs' }, glyphs: [] };
  for (const g of GLYPHS) {
    const info = await page.evaluate(([t, css]) => { const e = document.getElementById('g'); e.style.cssText = css; e.textContent = t; const b = e.getBoundingClientRect(); return { w: b.width, h: b.height }; }, [g.text, g.css]);
    const cw = Math.ceil(info.w) + 32, ch = Math.ceil(info.h) + 32; const file = `${g.id}.png`;
    await page.setViewportSize({ width: cw, height: ch });
    await page.screenshot({ path: path.join(tmp, 'cells', file), omitBackground: true, clip: { x: 0, y: 0, width: cw, height: ch } });
    manifest.glyphs.push({ id: g.id, text: g.text, file, adv: info.w, h: info.h, cellW: cw, cellH: ch, tint: g.color });
  }
  await browser.close();
  fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify(manifest));
  console.log(JSON.stringify(manifest.glyphs.map(g => [g.id, +g.adv.toFixed(2), +g.h.toFixed(2)])));
})();
