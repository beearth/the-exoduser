// PC-A23: bakes the web boss-bar name glyphs (Black Han Sans, faux-bold 900 at 25.6px, text-shadow glow) and the 6 status glyphs, and writes the definition
// table. The caller (Unity) passes the boss name; its glyphs are looked up here, so every character of every web boss name is in the atlas.
// usage: NODE_PATH=<playwright> node bake_boss_assets.cjs <game.html> <tmp-dir> <web-commit>   -> <tmp-dir>/cells/*.png + <tmp-dir>/manifest.json (compose_atlas.py builds the atlases)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');
const [htmlPath, tmp, commit] = process.argv.slice(2);
const src = fs.readFileSync(htmlPath, 'utf8');
function literal(open, close, name) {
  const head = 'const ' + name + '='; let i = src.indexOf(head); if (i < 0) throw new Error('missing ' + name); i += head.length;
  let depth = 0, j = i; for (; j < src.length; j++) { const ch = src[j]; if (ch === open) depth++; else if (ch === close) { depth--; if (depth === 0) break; } }
  return vm.runInNewContext('(' + src.slice(i, j + 1) + ')');
}
const HELL_BOSSES = literal('[', ']', 'HELL_BOSSES'), CHAPTER_STAGES = literal('[', ']', 'CHAPTER_STAGES'), HELL_NAMES = literal('[', ']', 'HELL_NAMES');
const ICONV = literal('{', '}', 'ICONV');
const EXTRA = ' ·/0123456789마지막저항차부활';   // " · 마지막 저항", " · n/3" (druid finale suffixes) and revive count text
const chars = [...new Set([...HELL_BOSSES.flat().join('') + EXTRA])];
const GLYPHS = { burst: '#ff8800', shield: '#8888ff', droplet: '#ff4444', venom: '#44dd44', flame: '#ff8833', bolt: '#44ddff' };
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');";
const HTML = `<style>${FONT_CSS}html,body{margin:0;background:transparent}
.bn{position:absolute;left:36px;top:36px;white-space:pre;font-family:'Black Han Sans','Noto Sans KR',sans-serif;font-size:25.6px;font-weight:900;color:#ffd3a2;line-height:normal;
 text-shadow:0 0 16px rgba(255,118,72,.34),0 2px 4px rgba(0,0,0,.9)}
.gl{position:absolute;left:8px;top:8px;line-height:0}</style><div id="root"></div>`;
(async () => {
  fs.mkdirSync(path.join(tmp, 'cells'), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio'] });
  const manifest = { source: { webCommit: commit, extractedAt: new Date().toISOString(), file: 'game.html', tables: ['HELL_BOSSES', 'CHAPTER_STAGES', 'HELL_NAMES', 'ICONV', 'CSS #bossBar .bn / .bst-i'] }, hellBosses: HELL_BOSSES, chapterStages: CHAPTER_STAGES.map(c => ({ hell: c.hell, name: c.name, stages: c.stages, startSi: c.startSi })), hellNames: HELL_NAMES, glyphs: [], sharp: [], blur: [], cell: { w: 100, h: 104, ox: 36, oy: 36 }, glyphCell: { w: 29, h: 29, ox: 8, oy: 8 } };
  for (const [variant, dsf, filter] of [['sharp', 2, 'none'], ['blur', 1, 'blur(8px)']]) {
    const ctx = await browser.newContext({ viewport: { width: 200, height: 200 }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.setContent(HTML); await page.evaluate(() => document.fonts.ready);
    // Google serves Black Han Sans as unicode-range slices: load the slices of every glyph we bake (loading with the default text only fetches the latin slice)
    await page.evaluate(t => document.fonts.load('900 25.6px "Black Han Sans"', t), chars.join('')); await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(() => document.fonts.check('25.6px "Black Han Sans"')); if (!ok) throw new Error('Black Han Sans did not load');
    for (const c of chars) {
      const info = await page.evaluate(([ch, f]) => { const r = document.getElementById('root'); r.innerHTML = ''; const e = document.createElement('div'); e.className = 'bn'; e.textContent = ch; e.style.filter = f; r.appendChild(e);
        const b = e.getBoundingClientRect(); return { adv: b.width, h: b.height }; }, [c, filter]);
      const file = `${variant}_${c.codePointAt(0).toString(16)}.png`;
      await page.screenshot({ path: path.join(tmp, 'cells', file), omitBackground: true, clip: { x: 0, y: 0, width: 100, height: 104 } });
      manifest[variant].push({ c, file, adv: info.adv, h: info.h });
    }
    await ctx.close();
  }
  // status glyphs: inline svg exactly as _glyph(id,col,13): stroke 1.6 round, drop-shadow 0 0 5px col+'77'
  const ctx = await browser.newContext({ viewport: { width: 60, height: 60 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage(); await page.setContent(HTML);
  for (const [id, col] of Object.entries(GLYPHS)) {
    await page.evaluate(([id, col, g]) => { const r = document.getElementById('root'); r.innerHTML = `<div class="gl"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:${col};vertical-align:middle;filter:drop-shadow(0 0 5px ${col}77)">${g}</svg></div>`; }, [id, col, ICONV[id]]);
    const file = `glyph_${id}.png`; await page.screenshot({ path: path.join(tmp, 'cells', file), omitBackground: true, clip: { x: 0, y: 0, width: 29, height: 29 } });
    manifest.glyphs.push({ id, file, color: col });
  }
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify(manifest));
  console.log(JSON.stringify({ chars: chars.length, sharp: manifest.sharp.length, blur: manifest.blur.length, glyphs: manifest.glyphs.length }));
})();
