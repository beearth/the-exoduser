// 실제 server.cjs 화면 검수. 테스트 브라우저/API는 사용자 세이브와 분리한다.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)];
}));
const require = createRequire(args['--modules'] ? path.resolve(args['--modules'], 'package.json') : import.meta.url);
const { chromium } = require('playwright');
const out = path.resolve(args['--out'] || 'tmp/stat-window-review');
const base = args['--url'] || 'http://127.0.0.1:3333';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
const errors = [], cases = [];
try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/api/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: r.request().url().includes('/slots') ? '[]' : '{}' }));
  await page.goto(base + '/game.html?test=1&demo&bosstest=3', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction('typeof G!=="undefined"&&G._bossArena', null, { timeout: 60000 });
  console.log('실제 게임 초기화 확인');
  // 부트/컷씬을 종료한 강제 검수 상태. 자연 플레이 증거로 사용하지 않는다.
  await page.evaluate(() => {
    for (const id of ['stageTransition', 'stLoad', 'introDiff', 'introKeys']) {
      const e = document.getElementById(id); if (e) e.style.display = 'none';
    }
    G.paused = true; _bossCine.active = false; OPT.lang = 'ko'; P.ap = 50; P.sp = 20;
    window._statReviewSaves = 0; dbSaveNow = () => window._statReviewSaves++;
  });
  await page.addStyleTag({ content: '#_btPanel{display:none!important}' });
  await page.evaluate(() => document.fonts.load('300 22px Hahmlet').then(() => true));
  console.log('한글 제목 글꼴 확인');
  const sigil = await page.request.get(base + '/img/ui/silver_hell/gate_sigil_20261028.jpg');
  assert.equal(sigil.status(), 200, '승인 인장 로딩');
  for (const width of [1920, 3840]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const id of ['settings', 'invPanel', 'forge', 'skillPanel', 'statPanel']) {
      await page.evaluate(id => openPanel(id), id);
      console.log(`${width} ${id} 확인`);
      await page.locator('#' + id + ' .ptitle').waitFor({ state: 'visible' });
      if (id === 'statPanel') {
        // CSS 배경도 디코드되어야 갑옷 인체도를 본 최종 화면으로 취급한다.
        await page.evaluate(async () => {
          const bg = getComputedStyle(document.getElementById('growthTreeViewport'), '::before').backgroundImage;
          const urls = [...bg.matchAll(/url\("([^"]+)"\)/g)].map(m => m[1]);
          if (!urls.length) throw new Error('성장 트리 원화 연결 없음');
          await Promise.race([
            Promise.all(urls.map(src => { const image = new Image(); image.src = src; return image.decode(); })),
            new Promise((_, reject) => setTimeout(() => reject(new Error('성장 트리 원화 디코드 시간 초과')), 30000))
          ]);
        });
      }
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const geo = await page.evaluate(id => {
        const p = document.getElementById(id), shell = p.querySelector('.pbox'), title = p.querySelector('.ptitle');
        const rect = e => e?.getBoundingClientRect().toJSON();
        const overlap = (a, b) => a && b && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
        const titleBox = rect(title), nav = rect(p.querySelector('.panel-nav')), body = rect(p.querySelector('.growth-body'));
        const wallet = rect(p.querySelector('.growth-wallets')), header = rect(p.querySelector('.growth-header'));
        const viewport = rect(p.querySelector('#growthTreeViewport'));
        const escapedNodes = viewport ? [...p.querySelectorAll('[data-body-node]')].filter(e => {
          if (!e.checkVisibility()) return false;
          const r = rect(e); return r.left < viewport.left - 1 || r.right > viewport.right + 1 || r.top < viewport.top - 1 || r.bottom > viewport.bottom + 1;
        }).map(e => e.dataset.bodyNode) : [];
        const range = document.createRange(); range.selectNodeContents(title);
        const text = range.getBoundingClientRect();
        return { id, width: innerWidth, title: titleBox, nav, body, header, viewport, shell: rect(shell),
          overflow: shell.scrollWidth > shell.clientWidth + 2,
          collisions: [overlap(titleBox, nav) && '제목/탭', overlap(header, body) && '머리/본문', overlap(titleBox, wallet) && '제목/AP'].filter(Boolean),
          textClipped: text.left < titleBox.left - 1 || text.right > titleBox.right + 1 || text.height > titleBox.height + 1,
          escapedNodes, background: getComputedStyle(shell).backgroundImage };
      }, id);
      assert.equal(geo.title.height, 44, `${width} ${id}: 제목 44px`);
      assert.equal(geo.overflow, false, `${width} ${id}: 가로 넘침`);
      assert.deepEqual(geo.collisions, [], `${width} ${id}: 제목 겹침`);
      assert.equal(geo.textClipped, false, `${width} ${id}: 제목 잘림`);
      assert.deepEqual(geo.escapedNodes, [], `${width} ${id}: 트리 노드 이탈`);
      if (id === 'statPanel') {
        assert.equal(geo.header.height, 44);
        assert.ok(geo.body.height >= 850, '반환된 세로 공간');
        assert.match(geo.background, /gate_sigil_20261028/);
        assert.doesNotMatch(geo.background, /eye_crest_20261028/);
      }
      cases.push(geo);
      await page.mouse.move(1, 1);
      await page.screenshot({ path: path.join(out, `after_${width}_${id}.png`) });
    }
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.locator('[data-body-node="pMagic"]').hover();
  await page.locator('#growthNodePreview').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => window._statReviewSaves), 0, '미리보기 저장 없음');
  await page.locator('[data-body-node="pMagic"]').click();
  await page.locator('#growthSearch').fill('no_such_node_123');
  assert.equal(await page.locator('.growth-empty').count(), 1);
  await page.locator('#growthSearch').fill('');
  await page.locator('#smToggleBtn').click();
  await page.locator('#growthSummaryDrawer').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.locator('#growthSummaryDrawer').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#statPanel').evaluate(e => e.classList.contains('on')), true);
  await page.locator('#statClose').click();
  await page.keyboard.press('j');
  await page.locator('#growthTreeViewport').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => window._statReviewSaves), 0, '검수 중 세이브 변경 없음');
  assert.deepEqual(errors, [], '브라우저 예외');
  await fs.writeFile(path.join(out, 'geometry.json'), JSON.stringify({ base, cases, errors, interactions: 'PASS', saveWrites: 0 }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', cases: cases.length, errors, saveWrites: 0 }));
} finally {
  await browser.close();
}
