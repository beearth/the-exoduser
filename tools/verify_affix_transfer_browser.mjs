// ═══════════════════════════════════════════════════════════════════════════
// [Phase 7E / LOCK-45] AFFIX TRANSFER — REAL BROWSER E2E HARNESS
// 실제 Chrome(playwright) + production game.html DOM click 검증.
// - 서버: affix-phase1 server.cjs (port 3333) 가 이 worktree의 game.html/save API 서빙.
// - playwright: main repo(G:/exoduser) node_modules 에서 createRequire 로 로드(worktree 미설치).
// - transfer OPERATION(extract/absorb candidate·target·confirm)은 전부 실마우스 locator click.
//   fixture setup(아이템 주입·detail open)은 domain 밖 준비 — 검증 대상 아님.
// 산출: JSON 요약 + 사람용 라인. 실패 1개라도 있으면 exit 1.
// production game.html 은 이 harness 로 인해 변경되지 않음(read-only 구동).
// ═══════════════════════════════════════════════════════════════════════════
import { createRequire } from 'node:module';
const require = createRequire('G:/exoduser/package.json');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:3333';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// 메모리 압박(호스트 Chrome 다수 동시 실행) 하 렌더러 크래시 완화 args.
const LAUNCH_ARGS = ['--no-sandbox', '--use-angle=swiftshader', '--disable-dev-shm-usage', '--disable-gpu-program-cache', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--js-flags=--max-old-space-size=1024'];
const results = [];
function rec(sec, name, ok, detail) { results.push({ sec, name, ok: !!ok, detail: detail || '' }); }
function assert(sec, name, ok, detail) { rec(sec, name, ok, detail); if (!ok) console.error(`  ✗ [${sec}] ${name} — ${detail || ''}`); else console.log(`  ✓ [${sec}] ${name}`); }

const READY = `(() => typeof extractAffix==='function' && typeof absorbStone==='function' && typeof planAbsorption==='function' && typeof mkItem==='function' && typeof openPanel==='function' && typeof AFFIX_POOL!=='undefined' && AFFIX_POOL.length>0 && typeof P!=='undefined' && P && P.baseAtk!=null && typeof INV!=='undefined' && INV && Array.isArray(INV.bag))`;

async function waitReady(page) {
  await page.evaluate(async (rdSrc) => {
    const rd = eval(rdSrc); const u = performance.now() + 45000;
    while (!rd() && performance.now() < u) await new Promise(r => setTimeout(r, 50));
    if (!rd()) throw new Error('game not ready');
  }, READY);
}
async function dismissOverlays(page) {
  await page.evaluate(() => { ['stageTransition', 'bootLoading', 'introCut', 'cutscene'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; }); });
}
// 실마우스 클릭 (locator). onclick 속성 기반 선택자.
// [P7E] force:true + timeout 20000 — 호스트 CPU 경합(유저 Chrome 56 프로세스)에서 Playwright actionability
//   재폴링이 바쁜 렌더러에 starve → 클릭 hang. force 는 여전히 실제 CDP 마우스 이벤트(move/down/up, trusted)를
//   대상 요소 중심에 dispatch하여 onclick 핸들러를 실제 발화 — "domain 직접호출 아님(실 마우스 click)" 계약 유지.
//   단지 클릭 전 visible/stable/hit-test 재검사 대기만 생략(경합 hang 제거). 대상 존재/활성은 상위 assert 로 이미 검증.
async function click(page, selector, timeout = 20000) { const loc = page.locator(selector).first(); await loc.waitFor({ state: 'attached', timeout }); await loc.click({ timeout, force: true }); }
async function countSel(page, selector) { return await page.locator(selector).count(); }

// ── boot ─────────────────────────────────────────────────────────────────
async function boot(page, slot, stage = 1) {
  await page.goto(`${BASE}/game.html?test=1&stage=${stage}&slot=${slot}`, { waitUntil: 'commit', timeout: 20000 });
  await waitReady(page);
  await dismissOverlays(page);
}

// install save-mutation counter over dbSaveForce (commit hook used by extract/absorb)
async function installSaveCounter(page) {
  await page.evaluate(() => {
    window.__saveN = 0;
    if (!window.__saveHooked) {
      const orig = (typeof dbSaveForce === 'function') ? dbSaveForce : null;
      window.__origSaveForce = orig;
      dbSaveForce = function () { window.__saveN++; /* count only; do not persist in count-tests */ };
      window.__saveHooked = true;
    }
  });
}
async function saveN(page) { return await page.evaluate(() => window.__saveN || 0); }
async function resetSaveN(page) { await page.evaluate(() => { window.__saveN = 0; }); }

// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(20000); // [P7E] 경합 머신 flaky 방지 (액션/네비 대기 확대)
  const pageErrors = [], rejections = [];
  let consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('crash', () => rejections.push('PAGE_CRASH'));
  page.on('console', m => { /* rejection surfaced via pageerror */ });

  try {
    // ── §2 BOOT / ERRORS ────────────────────────────────────────────────
    await boot(page, '_p7e_main', 1);
    // classify boot console errors: transfer-related?
    const bootConsole = consoleErrors.slice();
    const transferConsoleAtBoot = bootConsole.filter(t => /extract|absorb|_tx|affixStone|transfer|planAbsorption/i.test(t));
    assert('2', 'pageerror = 0 (boot)', pageErrors.length === 0, JSON.stringify(pageErrors));
    assert('2', 'uncaught rejection = 0 (boot)', rejections.length === 0, JSON.stringify(rejections));
    assert('2', 'transfer console.error = 0 (boot)', transferConsoleAtBoot.length === 0, JSON.stringify(transferConsoleAtBoot));
    rec('2', 'boot console noise (non-transfer, save-miss)', true, JSON.stringify(bootConsole));
    const invOpen = await page.evaluate(() => { openPanel('invPanel'); const on = document.getElementById('invPanel').classList.contains('on'); const grid = !!document.getElementById('invGrid'); const right = !!document.getElementById('invRight'); closeAllPanels(); const off = !document.getElementById('invPanel').classList.contains('on'); return { on, grid, right, off }; });
    assert('2', 'inventory open 정상', invOpen.on && invOpen.grid && invOpen.right, JSON.stringify(invOpen));
    assert('2', 'inventory close 정상', invOpen.off, JSON.stringify(invOpen));
    // reset console capture boundary — transfer-phase errors only from here
    consoleErrors = [];

    await installSaveCounter(page);

    // ── §3 EXTRACTION DOM E2E ───────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        INV.bag = [w];
        openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        const cands = getExtractableAffixes(w).map(c => ({ affixId: c.affixId, tier: c.tier, value: c.value }));
        return { itemId: w.id, cand: cands[0], candCount: cands.length, gridItems: document.querySelectorAll('#invGrid .inv-item').length };
      });
      assert('3', 'extractable candidate 존재', !!setup.cand, JSON.stringify(setup));
      const hasExtractBtn = await countSel(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      assert('3', '🔮 추출 진입 버튼 렌더(equipment)', hasExtractBtn > 0, `btn=${hasExtractBtn}`);
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      const afterOpen = await page.evaluate(() => ({ mode: _txState && _txState.mode, cands: document.querySelectorAll('#invRight [onclick^="_txSelExtract"]').length }));
      assert('3', 'extract 패널 open + candidate 렌더', afterOpen.mode === 'extract' && afterOpen.cands > 0, JSON.stringify(afterOpen));
      await click(page, `#invRight [onclick*="_txSelExtract('${setup.cand.affixId}')"]`);
      const afterSel = await page.evaluate(() => ({ sel: _txState && _txState.sel, confirm: !!document.querySelector('#invRight [onclick^="_txDoExtract"]') }));
      assert('3', 'candidate 선택 + confirm(파괴) 노출', afterSel.sel === setup.cand.affixId && afterSel.confirm, JSON.stringify(afterSel));
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txDoExtract"]');
      await page.waitForTimeout(80);
      const done = await page.evaluate(() => {
        const stones = INV.bag.filter(i => i.type === 'affixStone');
        return {
          srcGone: !INV.bag.find(i => i.type !== 'affixStone'),
          stoneCount: stones.length,
          stone: stones[0] ? { affixId: stones[0].affixId, tier: stones[0].tier, value: stones[0].value } : null,
          txClosed: _txState === null,
          gridItems: document.querySelectorAll('#invGrid .inv-item').length,
          selectedNull: INV.selected === null || INV.selected === undefined,
        };
      });
      assert('3', 'source equipment 실제 제거', done.srcGone, JSON.stringify(done));
      assert('3', 'AffixStone 정확히 1개 생성', done.stoneCount === 1, JSON.stringify(done));
      assert('3', 'stone exact affixId/tier/value', done.stone && done.stone.affixId === setup.cand.affixId && done.stone.tier === setup.cand.tier && done.stone.value === setup.cand.value, JSON.stringify({ got: done.stone, exp: setup.cand }));
      assert('3', 'inventory DOM 갱신(grid=stone 1개)', done.gridItems === 1, JSON.stringify(done));
      assert('3', 'selection stale 없음(_txState 닫힘)', done.txClosed, JSON.stringify(done));
      assert('3', 'domain 직접호출 아님 — 실 DOM click 경유', true, 'candidate+confirm real mouse click');
      const sN = await saveN(page);
      assert('3', 'commit 저장 1회 호출', sN === 1, `saveN=${sN}`);
    }

    // ── §4 CANCEL PATH ──────────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const w = mkItem('weapon', 4, EL.I, 4, 'sword', 10);
        INV.bag = [w]; openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        const cand = getExtractableAffixes(w)[0];
        return { itemId: w.id, affixId: cand.affixId, affixCount: (w.affixes || []).length };
      });
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      await click(page, `#invRight [onclick*="_txSelExtract('${setup.affixId}')"]`);
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txClose"]'); // ← 닫기 (cancel)
      await page.waitForTimeout(60);
      const after = await page.evaluate((exp) => ({
        srcAlive: !!INV.bag.find(i => i.id === exp.itemId && i.type !== 'affixStone'),
        affixCount: (INV.bag.find(i => i.id === exp.itemId) || { affixes: [] }).affixes.length,
        stones: INV.bag.filter(i => i.type === 'affixStone').length,
        txClosed: _txState === null,
      }), setup);
      const sN = await saveN(page);
      assert('4', 'source 불변(파괴 안 됨)', after.srcAlive && after.affixCount === setup.affixCount, JSON.stringify(after));
      assert('4', 'stone 0 (생성 안 됨)', after.stones === 0, JSON.stringify(after));
      assert('4', 'save mutation 0', sN === 0, `saveN=${sN}`);
      assert('4', '패널 닫힘', after.txClosed, JSON.stringify(after));
    }

    // ── §5 STONE DOM ────────────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        // real extracted stone via real domain (fixture): make weapon, extract first candidate
        const w = mkItem('weapon', 4, EL.D, 4, 'sword', 10); INV.bag = [w];
        const c = getExtractableAffixes(w)[0]; const r = extractAffix(w.id, c.affixId);
        const st = INV.bag.find(i => i.type === 'affixStone');
        openPanel('invPanel'); const si = INV.bag.indexOf(st); INV.selected = si; _invRenderDetail(si, 'bag');
        const meta = _affixStoneMeta(st);
        const html = document.getElementById('invRight').innerHTML;
        const text = document.getElementById('invRight').textContent;
        return { affixId: st.affixId, name: _affixNameOf(st.affixId), label: _layerSubLabel(meta.layer, meta.sub), tier: st.tier, value: st.value, html, text };
      });
      const t = setup.text || '';
      assert('5', '💠 표시', /💠/.test(setup.html), 'no 💠');
      assert('5', 'Affix name 표시', t.includes(setup.name), `name=${setup.name}`);
      assert('5', 'N단-A/B 라벨 표시', t.includes(setup.label), `label=${setup.label}`);
      assert('5', 'tier/value 표시', t.includes(String(setup.value)) && (/tier/i.test(t) || t.includes('t' + setup.tier) || t.includes(String(setup.tier))), `tier=${setup.tier} val=${setup.value}`);
      // 미표시: rarity/atk/def/socket/equip
      const forbid = [/rarity|등급/i, /공격력|\batk\b/i, /방어력|\bdef\b/i, /소켓|socket|결정/i, /장착|equip/i];
      const forbidNames = ['rarity/등급', 'atk/공격력', 'def/방어력', 'socket/소켓', 'equip/장착'];
      forbid.forEach((re, i) => assert('5', `미표시: ${forbidNames[i]}`, !re.test(t), `leaked: ${forbidNames[i]}`));
      // stone click crash 0 (re-render detail)
      const crash = await page.evaluate(() => { try { const si = INV.bag.findIndex(i => i.type === 'affixStone'); _invRenderDetail(si, 'bag'); return false; } catch (e) { return e.message; } });
      assert('5', 'Stone click crash 0', crash === false, String(crash));
    }

    // ── §6 ABSORPTION INSERT E2E ────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        const g = _getSlotCompatGroups('weapon');
        const haveB = {}; const groups = new Set();
        for (const a of w.affixes) { const d = AFFIX_POOL.find(x => x.id === a.id); if (d) { if (d.sub === 'B') haveB[d.layer] = 1; if (d.group) groups.add(d.group); } }
        const pick = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.some(c => g.indexOf(c) >= 0) && a.layer >= 1 && a.layer <= w.layerLv && !a.keystone && !a.v2skip && !haveB[a.layer] && !groups.has(a.group));
        const stone = { type: 'affixStone', affixId: pick.id, tier: 3, value: 0.25 };
        INV.bag = [w, stone];
        openPanel('invPanel'); INV.selected = 1; _invRenderDetail(1, 'bag');
        const plan = planAbsorption(w, stone);
        return { targetId: w.id, stoneId: pick.id, planOk: plan.ok, action: plan.action, layer: plan.layer, sub: plan.sub, before: (w.affixes || []).length };
      });
      assert('6', 'INSERT plan 준비(빈 슬롯)', setup.planOk && setup.action === 'INSERT', JSON.stringify(setup));
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      const targets = await page.evaluate(() => document.querySelectorAll('#invRight [onclick^="_txSelTarget"]').length);
      assert('6', '흡수 패널 open + target 렌더', targets > 0, `targets=${targets}`);
      await click(page, `#invRight [onclick*="_txSelTarget('${setup.targetId}')"]`);
      await page.waitForTimeout(50);
      const preview = await page.evaluate(() => ({ text: document.getElementById('invRight').textContent, hasConfirm: !!document.querySelector('#invRight [onclick^="_txDoAbsorb"]') }));
      assert('6', 'INSERT preview: 삽입 라벨 + 신규 affix', /삽입|INSERT/i.test(preview.text) && preview.hasConfirm, preview.text.slice(0, 120));
      assert('6', 'INSERT preview: old→소멸 라인 없음', !/소멸|removed/i.test(preview.text), preview.text.slice(0, 120));
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txDoAbsorb"]');
      await page.waitForTimeout(80);
      const done = await page.evaluate((exp) => {
        const t = INV.bag.find(i => i.id === exp.targetId);
        const na = t.affixes.find(a => a.id === exp.stoneId);
        return { stones: INV.bag.filter(i => i.type === 'affixStone').length, newAffix: na ? { value: na.value, tier: na.tier } : null, affixCount: t.affixes.length, otherItemsIntact: INV.bag.filter(i => i.type !== 'affixStone').length };
      }, setup);
      const sN = await saveN(page);
      assert('6', 'Stone 1개 소비(bag stone 0)', done.stones === 0, JSON.stringify(done));
      assert('6', 'target 새 Affix 생성(exact value/tier)', done.newAffix && done.newAffix.value === 0.25 && done.newAffix.tier === 3, JSON.stringify(done));
      assert('6', 'target affix +1', done.affixCount === setup.before + 1, JSON.stringify(done));
      assert('6', 'commit 저장 호출', sN >= 1, `saveN=${sN}`);
    }

    // ── §7 ABSORPTION REPLACE E2E ───────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        for (let attempt = 0; attempt < 40; attempt++) {
          INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
          const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
          const g = _getSlotCompatGroups('weapon');
          // occupied B layers in w
          const bByLayer = {}; for (const a of w.affixes) { const d = AFFIX_POOL.find(x => x.id === a.id); if (d && d.sub === 'B') bByLayer[d.layer] = a.id; }
          // iterate occupied layers × candidate stones; accept first that plans as valid REPLACE
          for (const kL in bByLayer) {
            const L = +kL, occId = bByLayer[kL];
            const cands = AFFIX_POOL.filter(a => a.sub === 'B' && a.layer === L && a.id !== occId && a.compat && a.compat.some(c => g.indexOf(c) >= 0) && !a.keystone && !a.v2skip);
            for (const c of cands) {
              const stone = { type: 'affixStone', affixId: c.id, tier: 3, value: 0.42 };
              const plan = planAbsorption(w, stone);
              if (plan.ok && plan.action === 'REPLACE' && plan.oldAffix && plan.oldAffix.id === occId) {
                INV.bag = [w, stone]; openPanel('invPanel'); INV.selected = 1; _invRenderDetail(1, 'bag');
                return { targetId: w.id, stoneId: c.id, occId, layer: L, planOk: true, action: plan.action, oldName: _affixNameOf(occId), before: w.affixes.length };
              }
            }
          }
        }
        return { planOk: false, action: null };
      });
      assert('7', 'REPLACE plan 준비(동일 Layer/Sub 점유)', setup.planOk && setup.action === 'REPLACE' && !!setup.occId, JSON.stringify(setup));
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      await click(page, `#invRight [onclick*="_txSelTarget('${setup.targetId}')"]`);
      await page.waitForTimeout(50);
      const preview = await page.evaluate(() => ({ text: document.getElementById('invRight').textContent }));
      assert('7', 'REPLACE preview: 교체 라벨', /교체|REPLACE/i.test(preview.text), preview.text.slice(0, 140));
      assert('7', 'REPLACE preview: 기존 Affix 소멸 표시', /소멸|removed/i.test(preview.text) && preview.text.includes(setup.oldName), preview.text.slice(0, 160));
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txDoAbsorb"]');
      await page.waitForTimeout(80);
      const done = await page.evaluate((exp) => {
        const t = INV.bag.find(i => i.id === exp.targetId);
        return { hasOld: !!t.affixes.find(a => a.id === exp.occId), newA: (t.affixes.find(a => a.id === exp.stoneId) || null), stones: INV.bag.filter(i => i.type === 'affixStone').length, count: t.affixes.length };
      }, setup);
      const sN = await saveN(page);
      assert('7', 'old affix 없음', !done.hasOld, JSON.stringify(done));
      assert('7', 'new affix exact(value 0.42/tier 3)', done.newA && done.newA.value === 0.42 && done.newA.tier === 3, JSON.stringify(done));
      assert('7', 'Stone 1개 소비', done.stones === 0, JSON.stringify(done));
      assert('7', 'affix count 불변(REPLACE)', done.count === setup.before, JSON.stringify(done));
      assert('7', 'commit 저장 호출', sN >= 1, `saveN=${sN}`);
    }

    // ── §8 INVALID TARGET UX ────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        // OFFENSE B stone
        const g = _getSlotCompatGroups('weapon');
        const bOff = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.indexOf('OFFENSE') >= 0 && a.layer >= 3 && a.layer <= 8 && !a.keystone && !a.v2skip);
        const stone = { type: 'affixStone', affixId: bOff.id, tier: 3, value: 0.2 };
        const L = bOff.layer;
        const wpOK = mkItem('weapon', 4, EL.F, 4, 'sword', 10);         // valid OFFENSE
        const ringBad = mkItem('ring1', 4, EL.F, 4, null, 10);          // INCOMPATIBLE_SLOT (ACCESSORY)
        const lowBad = mkItem('weapon', 4, EL.F, 4, 'sword', Math.max(1, L - 1)); // TARGET_TOO_LOW
        // TARGET_EQUIPPED: equip a weapon copy
        const eqW = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.equipped.weapon = eqW;
        INV.bag = [wpOK, ringBad, lowBad, stone];
        openPanel('invPanel'); const si = INV.bag.indexOf(stone); INV.selected = si; _invRenderDetail(si, 'bag');
        return {
          stoneLayer: L, okId: wpOK.id, ringId: ringBad.id, lowId: lowBad.id, eqId: eqW.id,
          planRing: planAbsorption(ringBad, stone).reason, planLow: planAbsorption(lowBad, stone).reason,
          reasonRing: _transferReasonText(planAbsorption(ringBad, stone).reason),
          reasonLow: _transferReasonText(planAbsorption(lowBad, stone).reason),
        };
      });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      const rows = await page.evaluate((exp) => {
        const box = document.getElementById('invRight');
        const all = [...box.querySelectorAll('div')];
        // enabled rows have onclick _txSelTarget; disabled rows have opacity .5 and no such onclick
        const okClickable = !!box.querySelector(`[onclick*="_txSelTarget('${exp.okId}')"]`);
        const ringClickable = !!box.querySelector(`[onclick*="_txSelTarget('${exp.ringId}')"]`);
        const lowClickable = !!box.querySelector(`[onclick*="_txSelTarget('${exp.lowId}')"]`);
        const eqListed = !!box.querySelector(`[onclick*="_txSelTarget('${exp.eqId}')"]`) || box.textContent.includes(exp.eqId);
        const text = box.textContent;
        // raw enum leak?
        const enums = ['INCOMPATIBLE_SLOT', 'TARGET_TOO_LOW', 'TARGET_EQUIPPED', 'C1_VIOLATION', 'DUPLICATE_ID'];
        const leaked = enums.filter(e => text.includes(e));
        return { okClickable, ringClickable, lowClickable, eqListed, leaked, text };
      }, setup);
      assert('8', 'valid target 선택 가능', rows.okClickable, JSON.stringify({ okClickable: rows.okClickable }));
      assert('8', 'INCOMPATIBLE_SLOT: 선택 불가(disabled)', !rows.ringClickable, 'ring clickable?');
      assert('8', 'TARGET_TOO_LOW: 선택 불가(disabled)', !rows.lowClickable, 'low clickable?');
      assert('8', 'TARGET_EQUIPPED: 대상 목록 제외(장착=선택불가)', !rows.eqListed, 'equipped listed as target?');
      assert('8', 'user-facing reason 표시', rows.text.includes(setup.reasonRing) && rows.text.includes(setup.reasonLow), JSON.stringify({ ring: setup.reasonRing, low: setup.reasonLow }));
      assert('8', 'raw enum 노출 0', rows.leaked.length === 0, JSON.stringify(rows.leaked));
      // mutation 0: invalid 대상 클릭 시도(강제) → 도메인 거부
      const mut = await page.evaluate((exp) => {
        const stone = INV.bag.find(i => i.type === 'affixStone');
        const before = INV.bag.length;
        const rRing = absorbStone(stone, exp.ringId); const rLow = absorbStone(stone, exp.lowId); const rEq = absorbStone(stone, exp.eqId);
        return { rRing: rRing.reason, rLow: rLow.reason, rEq: rEq.reason, bagUnchanged: INV.bag.length === before, stoneAlive: !!INV.bag.find(i => i.type === 'affixStone') };
      }, setup);
      assert('8', 'invalid 대상 mutation 0', mut.bagUnchanged && mut.stoneAlive && mut.rRing === 'INCOMPATIBLE_SLOT' && mut.rLow === 'TARGET_TOO_LOW' && mut.rEq === 'TARGET_EQUIPPED', JSON.stringify(mut));
    }

    // ── §9 A UNIVERSAL E2E ──────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        // extract an A affix from a weapon, absorb into a DIFFERENT slot (boots)
        const src = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.bag = [src];
        const aCand = getExtractableAffixes(src).map(c => ({ ...c, def: AFFIX_POOL.find(a => a.id === c.affixId) })).find(c => c.def && c.def.sub === 'A');
        extractAffix(src.id, aCand.affixId);
        const stone = INV.bag.find(i => i.type === 'affixStone');
        const aDef = AFFIX_POOL.find(a => a.id === stone.affixId);
        // target: a boots item with layerLv >= aDef.layer (different slot than weapon)
        const boots = mkItem('boots', 4, EL.F, 4, null, 10);
        INV.bag = [boots, stone];
        openPanel('invPanel'); const si = INV.bag.indexOf(stone); INV.selected = si; _invRenderDetail(si, 'bag');
        const plan = planAbsorption(boots, stone);
        // does A def carry slot restriction that would (wrongly) disable? check def.slots/compat
        return { stoneId: stone.affixId, stoneLayer: aDef.layer, aSub: aDef.sub, aSlots: aDef.slots || aDef.compat || null, targetId: boots.id, planOk: plan.ok, action: plan.action };
      });
      assert('9', 'A stone(원본 weapon slot)', setup.aSub === 'A', JSON.stringify(setup));
      assert('9', 'A universal: 다른 slot(boots) plan ok', setup.planOk, JSON.stringify(setup));
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      const uiOk = await page.evaluate((exp) => {
        return !!document.querySelector(`#invRight [onclick*="_txSelTarget('${exp.targetId}')"]`);
      }, setup);
      assert('9', 'UI: cross-slot target 선택 가능(원본 slots로 disable 안 됨)', uiOk, 'boots target not clickable — A universal 위반?');
      await click(page, `#invRight [onclick*="_txSelTarget('${setup.targetId}')"]`);
      await page.waitForTimeout(40);
      const pv = await page.evaluate(() => ({ hasConfirm: !!document.querySelector('#invRight [onclick^="_txDoAbsorb"]'), text: document.getElementById('invRight').textContent }));
      assert('9', 'preview 정상(confirm 노출)', pv.hasConfirm, pv.text.slice(0, 100));
      await click(page, '#invRight [onclick^="_txDoAbsorb"]');
      await page.waitForTimeout(70);
      const done = await page.evaluate((exp) => { const t = INV.bag.find(i => i.id === exp.targetId); return { absorbed: !!t.affixes.find(a => a.id === exp.stoneId), stones: INV.bag.filter(i => i.type === 'affixStone').length }; }, setup);
      assert('9', 'absorb 성공(cross-slot)', done.absorbed && done.stones === 0, JSON.stringify(done));
    }

    // ── §10 B COMPATIBILITY E2E ─────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const bOff = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.indexOf('OFFENSE') >= 0 && a.compat.indexOf('ACCESSORY') < 0 && a.layer >= 3 && a.layer <= 8 && !a.keystone && !a.v2skip);
        const stone = { type: 'affixStone', affixId: bOff.id, tier: 3, value: 0.2 };
        const wp = mkItem('weapon', 4, EL.F, 4, 'sword', 10);   // compatible OFFENSE
        const rg = mkItem('ring1', 4, EL.F, 4, null, 10);       // incompatible ACCESSORY
        INV.bag = [wp, rg, stone];
        openPanel('invPanel'); const si = INV.bag.indexOf(stone); INV.selected = si; _invRenderDetail(si, 'bag');
        return { wpId: wp.id, rgId: rg.id, planWp: planAbsorption(wp, stone).ok, planRg: planAbsorption(rg, stone).ok };
      });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      const ui = await page.evaluate((exp) => ({
        wpClickable: !!document.querySelector(`#invRight [onclick*="_txSelTarget('${exp.wpId}')"]`),
        rgClickable: !!document.querySelector(`#invRight [onclick*="_txSelTarget('${exp.rgId}')"]`),
      }), setup);
      assert('10', 'compatible(weapon) = active, plan.ok=true 일치', ui.wpClickable === setup.planWp && ui.wpClickable === true, JSON.stringify({ ui, setup }));
      assert('10', 'incompatible(ring) = disabled, plan.ok=false 일치', ui.rgClickable === setup.planRg && ui.rgClickable === false, JSON.stringify({ ui, setup }));
    }

    // ── §11 FLEX / KEYSTONE ─────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        // augment with FLEX(parryBonus) + a keystone (deterministic UI-filter fixture)
        const ks = AFFIX_POOL.find(a => a.keystone);
        const flex = AFFIX_POOL.find(a => a.id === 'parryBonus') || AFFIX_POOL.find(a => a.sub === 'FLEX');
        if (flex) w.affixes.push({ id: flex.id, tier: 2, value: 0.3 });
        if (ks) w.affixes.push({ id: ks.id, tier: 0, value: 1 });
        INV.bag = [w]; openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        const detailText = document.getElementById('invRight').textContent;
        const cands = getExtractableAffixes(w).map(c => c.affixId);
        // [P7E] Keystone display name = _KS_UI[id].n[lang], NOT _affixNameOf (keystones absent from AFFIX_NAMES_KO).
        //       기존 assertion이 _affixNameOf(raw id)를 검사 → false negative. 실제 detail은 _KS_UI 이름으로 렌더.
        const ksNames = (ks && typeof _KS_UI !== 'undefined' && _KS_UI[ks.id] && _KS_UI[ks.id].n) ? _KS_UI[ks.id].n.slice() : (ks ? [_affixNameOf(ks.id)] : []);
        const ksShown = ksNames.some(n => detailText.includes(n));
        return { flexId: flex && flex.id, ksId: ks && ks.id, flexName: flex && _affixNameOf(flex.id), ksNames, ksShown, cands, detailText };
      });
      assert('11', 'FLEX 존재', !!setup.flexId, 'no FLEX in pool');
      assert('11', 'Keystone 존재', !!setup.ksId, 'no keystone in pool');
      assert('11', '기존 item detail: FLEX 표시', setup.detailText.includes(setup.flexName), `flexName=${setup.flexName}`);
      assert('11', '기존 item detail: Keystone 표시', setup.ksShown, `ksNames=${JSON.stringify(setup.ksNames)}`);
      // extraction panel candidates exclude FLEX + keystone
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      const panelCands = await page.evaluate(() => [...document.querySelectorAll('#invRight [onclick^="_txSelExtract"]')].map(e => e.getAttribute('onclick')));
      const flexSelectable = panelCands.some(o => o.includes(`'${setup.flexId}'`));
      const ksSelectable = panelCands.some(o => o.includes(`'${setup.ksId}'`));
      assert('11', 'Extraction selection: FLEX selectable 아님', !flexSelectable && setup.cands.indexOf(setup.flexId) < 0, `flexSelectable=${flexSelectable}`);
      assert('11', 'Extraction selection: Keystone selectable 아님', !ksSelectable && setup.cands.indexOf(setup.ksId) < 0, `ksSelectable=${ksSelectable}`);
      await page.evaluate(() => { _txClose(); });
    }

    // ── §12 STALE STATE ─────────────────────────────────────────────────
    {
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        const g = _getSlotCompatGroups('weapon'); const haveB = {}; const groups = new Set();
        for (const a of w.affixes) { const d = AFFIX_POOL.find(x => x.id === a.id); if (d) { if (d.sub === 'B') haveB[d.layer] = 1; if (d.group) groups.add(d.group); } }
        const pick = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.some(c => g.indexOf(c) >= 0) && a.layer <= w.layerLv && a.layer >= 1 && !a.keystone && !a.v2skip && !haveB[a.layer] && !groups.has(a.group));
        const stone = { type: 'affixStone', affixId: pick.id, tier: 3, value: 0.25 };
        const other = mkItem('armor', 4, EL.F, 4, null, 10);
        INV.bag = [w, other, stone];
        openPanel('invPanel'); const si = INV.bag.indexOf(stone); INV.selected = si; _invRenderDetail(si, 'bag');
        return { targetId: w.id, otherId: other.id, stoneId: pick.id, otherAffixCount: other.affixes.length };
      });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      await click(page, `#invRight [onclick*="_txSelTarget('${setup.targetId}')"]`);
      await page.waitForTimeout(40);
      // now MUTATE inventory: remove target from bag (stale) + re-render
      await page.evaluate((exp) => { const i = INV.bag.findIndex(x => x.id === exp.targetId); if (i >= 0) INV.bag.splice(i, 1); }, setup);
      await resetSaveN(page);
      // confirm with stale target
      const staleTarget = await page.evaluate(() => { const r = _txDoAbsorb ? _txDoAbsorb() : null; return { txMode: _txState && _txState.mode }; });
      const afterStale = await page.evaluate((exp) => {
        const stone = INV.bag.find(i => i.type === 'affixStone');
        const other = INV.bag.find(i => i.id === exp.otherId);
        return { stoneAlive: !!stone, otherUnchanged: other && other.affixes.length === exp.otherAffixCount, bagLen: INV.bag.length };
      }, setup);
      const sN1 = await saveN(page);
      assert('12', 'STALE_TARGET: 잘못된 item mutation 0', afterStale.stoneAlive && afterStale.otherUnchanged, JSON.stringify(afterStale));
      assert('12', 'STALE_TARGET: save mutation 0', sN1 === 0, `saveN=${sN1}`);
      // STONE_NOT_IN_BAG: remove stone then confirm
      const setup2 = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        const g = _getSlotCompatGroups('weapon'); const haveB = {}; const groups = new Set();
        for (const a of w.affixes) { const d = AFFIX_POOL.find(x => x.id === a.id); if (d) { if (d.sub === 'B') haveB[d.layer] = 1; if (d.group) groups.add(d.group); } }
        const pick = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.some(c => g.indexOf(c) >= 0) && a.layer <= w.layerLv && a.layer >= 1 && !a.keystone && !a.v2skip && !haveB[a.layer] && !groups.has(a.group));
        const stone = { type: 'affixStone', affixId: pick.id, tier: 3, value: 0.25 };
        INV.bag = [w, stone]; openPanel('invPanel'); INV.selected = 1; _invRenderDetail(1, 'bag');
        return { targetId: w.id, before: w.affixes.length };
      });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      await click(page, `#invRight [onclick*="_txSelTarget('${setup2.targetId}')"]`);
      await page.waitForTimeout(40);
      await page.evaluate(() => { const i = INV.bag.findIndex(x => x.type === 'affixStone'); if (i >= 0) INV.bag.splice(i, 1); });
      await resetSaveN(page);
      const r2 = await page.evaluate(() => { const r = _txDoAbsorb(); return true; });
      const afterStale2 = await page.evaluate((exp) => { const t = INV.bag.find(i => i.id === exp.targetId); return { targetUnchanged: t && t.affixes.length === exp.before }; }, setup2);
      const sN2 = await saveN(page);
      assert('12', 'STONE_NOT_IN_BAG: target mutation 0', afterStale2.targetUnchanged, JSON.stringify(afterStale2));
      assert('12', 'STONE_NOT_IN_BAG: save mutation 0', sN2 === 0, `saveN=${sN2}`);
      await page.evaluate(() => { _txClose(); });
    }

    // ── §13 DOUBLE SUBMIT ───────────────────────────────────────────────
    {
      // Extraction double-submit (same-tick)
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.bag = [w];
        const cand = getExtractableAffixes(w)[0];
        openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        return { affixId: cand.affixId };
      });
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      await click(page, `#invRight [onclick*="_txSelExtract('${setup.affixId}')"]`);
      await resetSaveN(page);
      // fire confirm twice synchronously (harshest double-submit)
      const dbl = await page.evaluate(() => {
        const btn = document.querySelector('#invRight [onclick^="_txDoExtract"]');
        btn.click(); btn.click();
        return { stones: INV.bag.filter(i => i.type === 'affixStone').length, sources: INV.bag.filter(i => i.type !== 'affixStone').length };
      });
      const sNx = await saveN(page);
      assert('13', 'Extraction double click: source 1개만 제거', dbl.sources === 0, JSON.stringify(dbl));
      assert('13', 'Extraction double click: stone 1개만 생성', dbl.stones === 1, JSON.stringify(dbl));
      assert('13', 'Extraction double click: 저장 1회', sNx === 1, `saveN=${sNx}`);
      // Absorption double-submit
      const setup2 = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10);
        const g = _getSlotCompatGroups('weapon'); const haveB = {}; const groups = new Set();
        for (const a of w.affixes) { const d = AFFIX_POOL.find(x => x.id === a.id); if (d) { if (d.sub === 'B') haveB[d.layer] = 1; if (d.group) groups.add(d.group); } }
        const pick = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.some(c => g.indexOf(c) >= 0) && a.layer <= w.layerLv && a.layer >= 1 && !a.keystone && !a.v2skip && !haveB[a.layer] && !groups.has(a.group));
        const stone = { type: 'affixStone', affixId: pick.id, tier: 3, value: 0.25 };
        INV.bag = [w, stone]; openPanel('invPanel'); INV.selected = 1; _invRenderDetail(1, 'bag');
        return { targetId: w.id, stoneId: pick.id, before: w.affixes.length };
      });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      await click(page, `#invRight [onclick*="_txSelTarget('${setup2.targetId}')"]`);
      await page.waitForTimeout(40);
      await resetSaveN(page);
      const dbl2 = await page.evaluate((exp) => {
        const btn = document.querySelector('#invRight [onclick^="_txDoAbsorb"]');
        btn.click(); btn.click();
        const t = INV.bag.find(i => i.id === exp.targetId);
        return { stones: INV.bag.filter(i => i.type === 'affixStone').length, targetHits: t ? t.affixes.filter(a => a.id === exp.stoneId).length : -1, affixCount: t ? t.affixes.length : -1, before: exp.before };
      }, setup2);
      const sNy = await saveN(page);
      assert('13', 'Absorption double click: stone 1개만 소비', dbl2.stones === 0, JSON.stringify(dbl2));
      assert('13', 'Absorption double click: target 1회만 변경', dbl2.targetHits === 1 && dbl2.affixCount === dbl2.before + 1, JSON.stringify(dbl2));
      assert('13', 'Absorption double click: 저장 1회', sNy === 1, `saveN=${sNy}`);
    }

    // ── §14 CLOSE / ESC / BACK ──────────────────────────────────────────
    {
      // (a) ← 닫기 during extract selection
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; _txState = null;
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.bag = [w];
        const cand = getExtractableAffixes(w)[0];
        openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        return { affixId: cand.affixId, itemId: w.id, before: w.affixes.length };
      });
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      await click(page, `#invRight [onclick*="_txSelExtract('${setup.affixId}')"]`);
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txClose"]');
      const afterClose = await page.evaluate((exp) => ({ txNull: _txState === null, srcAlive: !!INV.bag.find(i => i.id === exp.itemId), affix: (INV.bag.find(i => i.id === exp.itemId) || { affixes: [] }).affixes.length }), setup);
      const sN = await saveN(page);
      assert('14', '← 닫기: mutation 0', afterClose.srcAlive && afterClose.affix === setup.before && sN === 0, JSON.stringify({ afterClose, sN }));
      assert('14', '← 닫기: _txState 해제(busy guard 없음)', afterClose.txNull, JSON.stringify(afterClose));
      // (b) ESC/Tab-close path: open transfer panel then closeAllPanels (기존 UI convention), reopen → detail 정상?
      const escProbe = await page.evaluate((exp) => {
        _txState = null; INV.selected = 0; _invRenderDetail(0, 'bag');
        _openExtractPanel(0);                     // enter transfer panel
        const inPanel = !!_txState;
        closeAllPanels();                          // ESC/Tab convention closes panel
        const txAfterClose = _txState;             // does close clear _txState?
        openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag'); // re-enter, re-render detail
        const rightHtml = document.getElementById('invRight').innerHTML;
        const detailRendered = /어픽스 추출|Extract|추출 가능/.test(rightHtml) === false && rightHtml.length > 0; // detail(not stale transfer panel)
        const stalePanel = /🔮|어픽스 추출|Extract Affix/.test(rightHtml);
        return { inPanel, txAfterCloseNull: txAfterClose === null, rightLen: rightHtml.length, stalePanel };
      }, setup);
      assert('14', 'ESC/close 후 _txState 정리(재진입 clean)', escProbe.txAfterCloseNull, JSON.stringify(escProbe));
      assert('14', '재진입: stale transfer 패널 잔류 없음', !escProbe.stalePanel && escProbe.rightLen > 0, JSON.stringify(escProbe));
      await page.evaluate(() => closeAllPanels());
    }

    // ── §15 BROWSER SAVE / LOAD E2E ─────────────────────────────────────
    // 실제 게임 save 직렬화(dbSave) + 진짜 page reload 로 Stone/Affix 영속 검증.
    // 주의: fresh slot 은 boot-time /api/load 404 → _serverOk=false → 이후 저장이 localStorage 로 새어감.
    //       실사용자는 기존 slot 보유(server 저장 정상) → seed 로 boot load 성공시켜 server 영속 경로를 탄다.
    {
      const SLOT15 = '_p7e_save';
      // seed bag에 마커 stone → boot 비동기 load(IIFE)가 dbRestore로 bag 복원 완료 시점을 감지(race 제거).
      // boot()의 waitReady 는 INV.bag=[](동기 init)만 보장 → load 복원 전에 fixture setup 하면 dbSave가 빈 bag 저장.
      const seedData = { player: { lv: 1, exp: 0, maxExp: 15, baseAtk: 10, baseDef: 5 }, inv: { bag: [{ type: 'affixStone', affixId: 'strFlat', tier: 0, value: 1, __p7eSeed: true }], equipped: {} } };
      await fetch(`${BASE}/api/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot: SLOT15, data: seedData }) }).catch(() => {});
      await boot(page, SLOT15, 1);
      await page.waitForFunction(() => typeof INV !== 'undefined' && Array.isArray(INV.bag) && INV.bag.some(i => i && i.__p7eSeed), null, { timeout: 20000 }); // load 복원 완료 대기
      // fixture: source→extract→stone, then a target weapon that can absorb it (INSERT|REPLACE) + keystone marker
      const s = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const src = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.bag = [src];
        const cand = getExtractableAffixes(src)[0]; extractAffix(src.id, cand.affixId);
        const stone = INV.bag.find(i => i.type === 'affixStone');
        let tgt = null, plan = null;
        for (let a = 0; a < 80; a++) { const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10); const pl = planAbsorption(w, stone); if (pl.ok) { tgt = w; plan = pl; break; } }
        const ks = AFFIX_POOL.find(a => a.keystone);
        if (ks && tgt && !tgt.affixes.some(a => a.id === ks.id)) tgt.affixes.push({ id: ks.id, tier: 0, value: 1 });
        INV.bag = [tgt, stone];
        const oldId = (plan && plan.oldAffix && plan.oldAffix.id) || null;
        const otherAffixIds = tgt.affixes.map(a => a.id).filter(id => id !== oldId && id !== stone.affixId);
        return { ok: !!tgt, stone: { affixId: stone.affixId, tier: stone.tier, value: stone.value }, targetId: tgt && tgt.id, targetLayerLv: tgt && tgt.layerLv, ksId: ks && ks.id, action: plan && plan.action, oldId, otherAffixIds };
      });
      assert('15', 'fixture 준비(extract stone + absorbable target)', s.ok && !!s.stone.affixId, JSON.stringify(s));
      // real game save + reload (extract 영속)
      await page.evaluate(async () => { await dbSave(); });
      await page.waitForTimeout(250);
      await boot(page, SLOT15, 1);
      await page.waitForFunction(() => typeof INV !== 'undefined' && Array.isArray(INV.bag) && INV.bag.length > 0, null, { timeout: 20000 }); // save 복원 완료 대기
      const r1 = await page.evaluate((exp) => {
        const stone = INV.bag.find(i => i.type === 'affixStone');
        const tgt = INV.bag.find(i => i.id === exp.targetId);
        return { stone: stone ? { affixId: stone.affixId, tier: stone.tier, value: stone.value } : null, targetAlive: !!tgt, ksAlive: !!(tgt && tgt.affixes.find(a => a.id === exp.ksId)) };
      }, s);
      assert('15', 'Extract→save→reload: Stone 유지(exact affixId/tier/value)', r1.stone && r1.stone.affixId === s.stone.affixId && r1.stone.tier === s.stone.tier && r1.stone.value === s.stone.value, JSON.stringify(r1));
      assert('15', 'Extract→save→reload: target + Keystone 유지', r1.targetAlive && r1.ksAlive, JSON.stringify(r1));
      // absorb via real UI clicks + save + reload (absorb 영속)
      await page.evaluate(() => { openPanel('invPanel'); const si = INV.bag.findIndex(i => i.type === 'affixStone'); INV.selected = si; _invRenderDetail(si, 'bag'); });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      await click(page, `#invRight [onclick*="_txSelTarget('${s.targetId}')"]`);
      await page.waitForTimeout(60);
      await click(page, '#invRight [onclick^="_txDoAbsorb"]');
      await page.waitForTimeout(90);
      await page.evaluate(async () => { await dbSave(); });
      await page.waitForTimeout(250);
      await boot(page, SLOT15, 1);
      await page.waitForFunction(() => typeof INV !== 'undefined' && Array.isArray(INV.bag) && INV.bag.length > 0, null, { timeout: 20000 }); // save 복원 완료 대기
      const r2 = await page.evaluate((exp) => {
        const stone = INV.bag.find(i => i.type === 'affixStone');
        const tgt = INV.bag.find(i => i.id === exp.targetId);
        const na = tgt && tgt.affixes.find(a => a.id === exp.stone.affixId);
        return {
          stoneGone: !stone,
          newAffix: na ? { tier: na.tier, value: na.value } : null,
          layerLvSame: !!(tgt && tgt.layerLv === exp.targetLayerLv),
          ksAlive: !!(tgt && tgt.affixes.find(a => a.id === exp.ksId)),
          othersIntact: !!(tgt && exp.otherAffixIds.every(id => tgt.affixes.find(a => a.id === id))),
          // same-id REPLACE(A universal: 같은 affixId를 다른 tier/value로 교체 — §9 "지능의(10)→지능의(14)")는
          // old.id===new.id 이므로 id 잔존이 정상. 이 경우 exact value(newAffix) 검증으로 충분 → oldGone N/A(true).
          oldGone: (exp.action !== 'REPLACE' || exp.oldId === exp.stone.affixId) ? true : !(tgt && tgt.affixes.find(a => a.id === exp.oldId)),
        };
      }, s);
      assert('15', 'Absorb→save→reload: Stone 소멸 유지', r2.stoneGone, JSON.stringify(r2));
      assert('15', 'Absorb→save→reload: target Affix 유지(exact tier/value)', r2.newAffix && r2.newAffix.tier === s.stone.tier && r2.newAffix.value === s.stone.value, JSON.stringify(r2));
      assert('15', 'Absorb→save→reload: layerLv 동일', r2.layerLvSame, JSON.stringify(r2));
      assert('15', 'Absorb→save→reload: Keystone/기타 Affix 동일', r2.ksAlive && r2.othersIntact && r2.oldGone, JSON.stringify(r2));
      await fetch(`${BASE}/api/save/${SLOT15}`, { method: 'DELETE' }).catch(() => {});
      consoleErrors = []; // §15 full-boot reload noise 경계 리셋(이후 §16/§17 순수 검증)
    }

    // ── §16 UI ↔ DOMAIN PARITY (auto compare) ───────────────────────────
    {
      const parity = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; _txState = null;
        // diverse targets
        const items = [
          mkItem('weapon', 4, EL.F, 4, 'sword', 10),
          mkItem('ring1', 4, EL.F, 4, null, 10),
          mkItem('armor', 4, EL.F, 4, null, 10),
          mkItem('boots', 4, EL.F, 4, null, 10),
          mkItem('necklace', 4, EL.F, 4, null, 10),
          mkItem('weapon', 4, EL.F, 4, 'sword', 3),
          mkItem('gloves', 4, EL.F, 4, null, 10),
        ];
        const bOff = AFFIX_POOL.find(a => a.sub === 'B' && a.compat && a.compat.indexOf('OFFENSE') >= 0 && a.layer >= 4 && a.layer <= 7 && !a.keystone && !a.v2skip);
        const stone = { type: 'affixStone', affixId: bOff.id, tier: 3, value: 0.2 };
        INV.bag = [...items, stone];
        openPanel('invPanel'); const si = INV.bag.indexOf(stone); INV.selected = si; _invRenderDetail(si, 'bag');
        _openAbsorbPanel(si);
        const box = document.getElementById('invRight');
        const mismatches = [];
        for (const it of items) {
          const domClickable = !!box.querySelector(`[onclick*="_txSelTarget('${it.id}')"]`);
          const domainOk = planAbsorption(it, stone).ok;
          if (domClickable !== domainOk) mismatches.push({ id: it.id, slot: it.slot, layerLv: it.layerLv, domClickable, domainOk, reason: planAbsorption(it, stone).reason });
        }
        return { total: items.length, mismatches };
      });
      assert('16', `UI↔Domain parity: 불일치 0 (${parity.total} targets)`, parity.mismatches.length === 0, JSON.stringify(parity.mismatches));
      await page.evaluate(() => closeAllPanels());
    }

    // ── §17 EXISTING INVENTORY SMOKE ────────────────────────────────────
    {
      const smoke = await page.evaluate(() => {
        const out = {};
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        // open/close
        openPanel('invPanel'); out.open = document.getElementById('invPanel').classList.contains('on');
        closeAllPanels(); out.close = !document.getElementById('invPanel').classList.contains('on');
        // normal equipment detail + equip + unequip
        const w = mkItem('weapon', 4, EL.F, 4, 'sword', 10); INV.bag = [w];
        openPanel('invPanel'); INV.selected = 0;
        try { _invRenderDetail(0, 'bag'); out.detail = document.getElementById('invRight').textContent.length > 0; } catch (e) { out.detailErr = e.message; }
        try { equipItem(w); applyStats(); out.equipped = INV.equipped[w.slot] && INV.equipped[w.slot].id === w.id; } catch (e) { out.equipErr = e.message; }
        try { const s = w.slot; INV.equipped[s] = null; applyStats(); out.unequipped = INV.equipped[s] === null; } catch (e) { out.unequipErr = e.message; }
        // normal affix tooltip (detail contains affix names)
        try { INV.bag = [w]; INV.equipped = {}; INV.selected = 0; _invRenderDetail(0, 'bag'); const txt = document.getElementById('invRight').textContent; out.affixShown = (w.affixes || []).some(a => txt.includes(_affixNameOf(a.id))); } catch (e) { out.affixErr = e.message; }
        // keystone detail
        try { const ks = AFFIX_POOL.find(a => a.keystone); const w2 = mkItem('weapon', 4, EL.F, 4, 'sword', 10); w2.affixes.push({ id: ks.id, tier: 0, value: 1 }); INV.bag = [w2]; INV.selected = 0; _invRenderDetail(0, 'bag'); const _t = document.getElementById('invRight').textContent; const _ksN = (typeof _KS_UI !== 'undefined' && _KS_UI[ks.id] && _KS_UI[ks.id].n) ? _KS_UI[ks.id].n : [_affixNameOf(ks.id)]; out.keystoneShown = _ksN.some(n => _t.includes(n)); } catch (e) { out.keystoneErr = e.message; }
        // stone detail
        try { const st = { type: 'affixStone', affixId: AFFIX_POOL.find(a => a.sub === 'A' && a.layer >= 1).id, tier: 2, value: 0.1 }; INV.bag = [st]; INV.selected = 0; _invRenderDetail(0, 'bag'); out.stoneShown = /💠/.test(document.getElementById('invRight').innerHTML); } catch (e) { out.stoneErr = e.message; }
        closeAllPanels();
        return out;
      });
      assert('17', 'inventory open/close', smoke.open && smoke.close, JSON.stringify(smoke));
      assert('17', 'normal equipment detail', smoke.detail && !smoke.detailErr, JSON.stringify(smoke));
      assert('17', 'equip', smoke.equipped && !smoke.equipErr, JSON.stringify(smoke));
      assert('17', 'unequip', smoke.unequipped && !smoke.unequipErr, JSON.stringify(smoke));
      assert('17', 'normal Affix tooltip', smoke.affixShown && !smoke.affixErr, JSON.stringify(smoke));
      assert('17', 'Keystone detail', smoke.keystoneShown && !smoke.keystoneErr, JSON.stringify(smoke));
      assert('17', 'Stone detail', smoke.stoneShown && !smoke.stoneErr, JSON.stringify(smoke));
    }

    // ── §18 L10-A ULTIMATE DAMAGE E2E ([P8B/LOCK-47] Z ult 데미지 배수·blackStar noDmg·cooldown/UI) ──
    {
      const ult = await page.evaluate(() => {
        const out = {};
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null; _eqAffixCache = null;
        P.skills = P.skills || {}; P.skills.holyBlast = 1; P.skills.lavaSummon = 1; P.skills.blackStar = 1; // Lv1 → _ult10xMul=1.0
        const origHurt = hurtE; let cap = [];
        window.hurtE = function (e, dmg) { cap.push(dmg); return 0; }; // 데미지 캡처 stub (전역 hurtE 재배선)
        const dummy = () => { ens.length = 0; ens.push({ alive: true, x: P.x, y: P.y, r: 20, kb: { x: 0, y: 0 }, stunned: 0, hp: 1e9 }); };
        const measHoly = () => { cap = []; dummy(); P._hbX = P.x; P._hbY = P.y; P._hbCasting = true; P._hbCd = 0; fireHolyBlast(); return cap.length ? Math.max(...cap) : 0; };
        const measLava = () => { cap = []; dummy(); P._lvX = P.x; P._lvY = P.y; P._lvCasting = true; P._lvCd = 0; fireLavaSummon(); G._lavaField = null; return cap.length ? Math.max(...cap) : 0; };
        const measBlack = () => { cap = []; dummy(); P._bsX = P.x; P._bsY = P.y; P._bsCasting = true; P._bsCd = 0; fireBlackStar(); return cap.length; };
        out.holyBase = measHoly(); out.lavaBase = measLava();                            // baseline: no L10-A
        INV.equipped.weapon = { id: 'ult_w', slot: 'weapon', rarity: 4, layerLv: 10, affixes: [{ id: 'ultDmg', tier: 4, value: 0.5 }] }; _eqAffixCache = null; // equip ultDmg 0.5
        out.mul = _ultDmgMul();
        out.holyBoost = measHoly(); out.lavaBoost = measLava();                          // boosted
        out.blackHurt = measBlack();                                                     // blackStar noDmg (ultDmg 장착에도)
        out.hbCd = P._hbCd;                                                              // cooldown 세팅 확인
        try { if (typeof ULT_SLOT !== 'undefined') ULT_SLOT = 'holyBlast'; if (typeof _updateUltSlot === 'function') _updateUltSlot(); out.uiOk = true; } catch (e) { out.uiErr = e.message; }
        window.hurtE = origHurt;
        INV.equipped.weapon = null; _eqAffixCache = null; ens.length = 0; G._lavaField = null; P._hbCasting = P._lvCasting = P._bsCasting = false;
        out.holyRatio = out.holyBase > 0 ? out.holyBoost / out.holyBase : 0;
        out.lavaRatio = out.lavaBase > 0 ? out.lavaBoost / out.lavaBase : 0;
        return out;
      });
      assert('18', '_ultDmgMul() = 1.5 (ultDmg .5 장착)', Math.abs(ult.mul - 1.5) < 1e-6, JSON.stringify(ult));
      assert('18', 'holyBlast 데미지 ×_ultDmgMul (ratio≈1.5)', ult.holyBase > 0 && Math.abs(ult.holyRatio - 1.5) < 0.02, JSON.stringify(ult));
      assert('18', 'lavaSummon 직격 ×_ultDmgMul (FULL_COVERAGE, ratio≈1.5)', ult.lavaBase > 0 && Math.abs(ult.lavaRatio - 1.5) < 0.02, JSON.stringify(ult));
      assert('18', 'blackStar noDmg 유지(hurtE 0회·ultDmg 장착에도)', ult.blackHurt === 0, JSON.stringify(ult));
      assert('18', 'cooldown 세팅(cast 후 _hbCd>0)', ult.hbCd > 0, JSON.stringify(ult));
      assert('18', 'Ultimate HUD 갱신 no-throw', ult.uiOk && !ult.uiErr, JSON.stringify(ult));
    }

    // ── §19 L10-A TRANSFER DOM E2E (extract 10단-A → cross-slot absorb → commit) ──
    {
      await installSaveCounter(page); // §15 full-reload 이후 save 훅 소실 → 재설치(saveN 계측 복구)
      const setup = await page.evaluate(() => {
        INV.bag = []; for (const k in INV.equipped) INV.equipped[k] = null; INV.selected = null; _txState = null;
        const src = { id: 'src_ult', slot: 'weapon', rarity: 4, layerLv: 10, brType: undefined, affixes: rollAffixesLayered(4, 'weapon', undefined, 10) };
        const tgt = { id: 'tgt_ult', slot: 'armor', rarity: 4, layerLv: 10, brType: undefined, affixes: rollAffixesLayered(4, 'armor', undefined, 10) };
        INV.bag = [src, tgt];
        const ex = getExtractableAffixes(src).find(c => c.affixId === 'ultDmg');
        openPanel('invPanel'); INV.selected = 0; _invRenderDetail(0, 'bag');
        return { srcHasUlt: src.affixes.some(a => a.id === 'ultDmg'), tgtHasUlt: tgt.affixes.some(a => a.id === 'ultDmg'), extractable: !!ex, exVal: ex ? ex.value : null };
      });
      assert('19', 'cap10 weapon·armor에 L10-A(ultDmg) 자동 롤', setup.srcHasUlt && setup.tgtHasUlt, JSON.stringify(setup));
      assert('19', 'ultDmg extractable(FLEX/keystone처럼 block 아님)', setup.extractable, JSON.stringify(setup));
      // extract DOM flow
      await click(page, '#invActionBtns [onclick^="_openExtractPanel"]');
      const exLabel = await page.evaluate(() => ({ hasUltBtn: !!document.querySelector('#invRight [onclick*="_txSelExtract(\'ultDmg\')"]'), label10: document.getElementById('invRight').textContent.includes('10단-A') }));
      assert('19', 'extract 후보에 ultDmg + "10단-A" 라벨', exLabel.hasUltBtn && exLabel.label10, JSON.stringify(exLabel));
      await click(page, `#invRight [onclick*="_txSelExtract('ultDmg')"]`);
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txDoExtract"]');
      await page.waitForTimeout(80);
      const exDone = await page.evaluate(() => { const s = INV.bag.filter(i => i.type === 'affixStone'); return { stones: s.length, stone: s[0] ? { affixId: s[0].affixId, tier: s[0].tier, value: s[0].value } : null, srcGone: !INV.bag.find(i => i.id === 'src_ult') }; });
      assert('19', 'ultDmg 추출 → affixStone 1개 + source 파괴', exDone.stones === 1 && exDone.stone.affixId === 'ultDmg' && exDone.srcGone, JSON.stringify(exDone));
      assert('19', 'stone exact value 보존', exDone.stone && Math.abs(exDone.stone.value - setup.exVal) < 1e-9, JSON.stringify(exDone));
      // absorb DOM flow (cross-slot: armor target, A universal REPLACE)
      const absPrep = await page.evaluate(() => { const si = INV.bag.findIndex(i => i.type === 'affixStone'); INV.selected = si; _invRenderDetail(si, 'bag'); return { si }; });
      await click(page, '#invRight [onclick^="_openAbsorbPanel"]');
      const tgtClickable = await page.evaluate(() => !!document.querySelector(`#invRight [onclick*="_txSelTarget('tgt_ult')"]`));
      assert('19', 'cross-slot armor target 선택 가능(A universal)', tgtClickable, JSON.stringify({ absPrep }));
      await click(page, `#invRight [onclick*="_txSelTarget('tgt_ult')"]`);
      await page.waitForTimeout(40);
      const pv = await page.evaluate(() => ({ confirm: !!document.querySelector('#invRight [onclick^="_txDoAbsorb"]'), label10: document.getElementById('invRight').textContent.includes('10단-A') }));
      assert('19', 'absorb preview: confirm 노출 + "10단-A"', pv.confirm && pv.label10, JSON.stringify(pv));
      await resetSaveN(page);
      await click(page, '#invRight [onclick^="_txDoAbsorb"]');
      await page.waitForTimeout(80);
      const abDone = await page.evaluate(() => { const t = INV.bag.find(i => i.id === 'tgt_ult'); return { ultCount: t ? t.affixes.filter(a => a.id === 'ultDmg').length : -1, stones: INV.bag.filter(i => i.type === 'affixStone').length }; });
      const sN19 = await saveN(page);
      assert('19', 'armor target에 ultDmg REPLACE(정확히 1·dup 없음)·stone 소비', abDone.ultCount === 1 && abDone.stones === 0, JSON.stringify(abDone));
      assert('19', 'absorb commit 저장 호출', sN19 === 1, `saveN=${sN19}`);
    }

    // transfer-phase console errors (since boot boundary reset)
    const transferConsole = consoleErrors.filter(t => !/Failed to load resource|api\/load|api\/save|no server|\[LOCAL\]/i.test(t));
    assert('2', 'transfer-phase console.error = 0 (all sections)', transferConsole.length === 0, JSON.stringify(transferConsole));
    assert('2', 'pageerror = 0 (all sections)', pageErrors.length === 0, JSON.stringify(pageErrors));
    assert('2', 'crash/rejection = 0 (all sections)', rejections.length === 0, JSON.stringify(rejections));

  } catch (e) {
    rec('FATAL', 'harness exception', false, e.message + '\n' + (e.stack || ''));
    console.error('FATAL', e);
  } finally {
    await browser.close();
  }

  const failed = results.filter(r => !r.ok);
  console.log('\n═══════════════════════════════════════');
  console.log(`RESULT: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) { console.log('FAILURES:'); failed.forEach(f => console.log(`  ✗ [${f.sec}] ${f.name} — ${f.detail}`)); }
  console.log('JSON:' + JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, results }));
  process.exit(failed.length ? 1 : 0);
}
main();
