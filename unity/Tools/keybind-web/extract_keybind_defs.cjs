// PC-A16: extracts the web key-binding definitions from game.html (definitions only) into one JSON:
//   BINDS / BINDS2 (6188-6207), BIND_NAMES / BIND_NAMES_EN (6256-6278), keyName() map (6279~), the key reset of renderSettings (48703~),
//   _GP_KEY_DEFAULT (13494), gamepad row/guide texts (48775~), and the English strings (_EN) the list uses.
// usage: node extract_keybind_defs.cjs <game.html> <out.json> <web-commit>
const fs = require('fs');
const vm = require('vm');
const [htmlPath, outPath, commit, uiOutPath] = process.argv.slice(2);   // uiOutPath (optional): the Unity-facing arrays-of-objects form (JsonUtility cannot read dictionaries)
const src = fs.readFileSync(htmlPath, 'utf8');
function matchEnd(i, open, close) {
  let d = 0, inStr = null, esc = false, j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === open) d++; else if (c === close) { d--; if (d === 0) return j; }
  }
  throw new Error('unbalanced');
}
function literalAt(i, open, close) { const j = matchEnd(i, open, close); return vm.runInNewContext('(' + src.slice(i, j + 1) + ')'); }
function literal(head, open, close) { const i = src.indexOf(head); if (i < 0) throw new Error('missing ' + head); return literalAt(i + head.length, open, close); }
const BINDS = literal('let BINDS=', '{', '}'), BINDS2 = literal('let BINDS2=', '{', '}');
const names = literal('const BIND_NAMES=', '{', '}'), namesEn = literal('const BIND_NAMES_EN=', '{', '}');
// keyName(): the plain-keyboard map `m`
const kn = src.indexOf('function keyName(code,forceKbm){');
const mi = src.indexOf('const m={', kn); const keyMap = literalAt(mi + 'const m='.length, '{', '}');
// reset literals inside window._resetBinds
const rb = src.indexOf('window._resetBinds=()=>{');
const resetBinds = literalAt(src.indexOf('BINDS={', rb) + 'BINDS='.length, '{', '}');
const resetBinds2 = literalAt(src.indexOf('BINDS2={', rb) + 'BINDS2='.length, '{', '}');
const gpKey = literal('const _GP_KEY_DEFAULT=', '{', '}');
const EN = literal('const _EN=', '{', '}');
// gamepad texts (renderSettings): button names, action names, fixed set, guide rows
const gpBtn = literalAt(src.indexOf('const _gpBtnNames=', rb) + 'const _gpBtnNames='.length, '{', '}');
const actI = src.indexOf('const _gpActNames=', rb) + 'const _gpActNames='.length;
const actSrc = src.slice(actI, matchEnd(actI, '{', '}') + 1);
const actNames = {}; for (const m of actSrc.matchAll(/(\d+):_T\('([^']*)'\)/g)) actNames[m[1]] = m[2];
const fixed = literalAt(src.indexOf('const _gpFixed=new Set(', rb) + 'const _gpFixed=new Set('.length, '[', ']');
const gI = src.indexOf("'<div style=\"color:#ccaa77;font-weight:700;margin-bottom:6px;font-size:.8rem;letter-spacing:.08em\">'", rb);
const guideEnd = src.indexOf("'</div>';", gI);
const guide = [...src.slice(gI, guideEnd).matchAll(/_gR\('([^']*)','([^']*)'\)/g)].map(m => [m[1], m[2]]);
const ui = {
  tabs: [['kbm', '⌨ 키보드·마우스', '⌨ Keyboard & Mouse'], ['pad', '🎮 게임패드', '🎮 Gamepad']],
  alt: '보조', listenMain: '⟨ 입력 대기... ⟩', listenAlt: '⟨ 대기 ⟩', hint: '아무 키 또는 마우스 버튼을 누르세요 (ESC = 취소)', reset: '키 설정 초기화 (또는 F5 키)', resetDone: '키 설정 초기화 완료',
  fixed: '고정', padTitle: '🎮 게임패드 버튼 설정', padReset: '패드 키 초기화', padGuide: '🎮 전체 조작 가이드', chainConflict: '사슬 이동과 공격에는 서로 다른 키를 지정하세요.',
  none: ['없음', 'None'], mouse: { mouse0: ['좌클릭', 'LMB'], mouse1: ['휠클릭', 'MMB'], mouse2: ['우클릭', 'RMB'], mouse3: ['마우스4', 'Mouse4'], mouse4: ['마우스5', 'Mouse5'] },
  listenPad: '⟨ 키 입력... ⟩',
};
const enKeys = new Set([ui.alt, ui.listenMain, ui.listenAlt, ui.hint, ui.reset, ui.resetDone, ui.fixed, ui.padTitle, ui.padReset, ui.padGuide, ui.chainConflict, ui.listenPad, ...Object.values(actNames), ...guide.map(g => g[1]), ...Object.values(names)]);
const en = {}; for (const k of enKeys) if (EN[k] !== undefined) en[k] = EN[k];
// scenarios: the REAL web functions (_chainAttackBindingConflict, _setInputBinding, window._resetBinds body) replayed in a sandbox; the .NET check replays the same ops
const fnStart = src.indexOf('function _chainAttackBindingConflict(action,key){');
const fnEnd = src.indexOf('const BIND_NAMES={', fnStart);
const resetBody = src.slice(rb, matchEnd(src.indexOf('{', rb), '{', '}') + 1);   // window._resetBinds=()=>{...}
const ctx = vm.createContext({ rejected: [], showPH(t) { ctx.rejected.push(t); }, _L(ko, en) { return ko; }, _resetInteractInput() { ctx.interactResets++; }, interactResets: 0, listeningBind: null, _listenAlt: false, saveSettings() {}, renderSettings() {}, notify() {}, _T(s) { return s; }, window: {}, console });
vm.runInContext('let BINDS=' + src.slice(src.indexOf('let BINDS={') + 'let BINDS='.length, matchEnd(src.indexOf('let BINDS={') + 'let BINDS='.length, '{', '}') + 1) + ';let BINDS2=' + src.slice(src.indexOf('let BINDS2={') + 'let BINDS2='.length, matchEnd(src.indexOf('let BINDS2={') + 'let BINDS2='.length, '{', '}') + 1) + ';', ctx);
vm.runInContext(src.slice(fnStart, fnEnd), ctx);
vm.runInContext(resetBody, ctx);
const snap = () => JSON.parse(vm.runInContext('JSON.stringify({binds:BINDS,binds2:BINDS2,listed:Object.keys(BINDS)})', ctx));
const ops = [['set', 'weapon', 'KeyF', true], ['set', 'charge', 'KeyF', false], ['set', 'charge', 'KeyE', true], ['set', 'shield', 'ShiftLeft', false], ['set', 'shield', 'KeyZ', false], ['set', 'charge', 'mouse0', false],
  ['set', 'charge', 'KeyE', false], ['set', 'weapon', 'KeyE', false], ['set', 'weapon', 'KeyE', true], ['clear', 'weapon'], ['set', 'weapon', 'KeyE', false], ['set', 'charge', null, false], ['set', 'interact', 'KeyF', false], ['set', 'interact', 'mouse3', true],
  ['set', 'forge', 'KeyG', true], ['set', 'inventory', 'Escape', false], ['clear', 'interact'], ['reset'], ['set', 'shield', 'ShiftLeft', false], ['set', 'irisToggle', 'KeyP', false], ['reset'], ['set', 'roll', 'mouse0', false], ['set', 'roll', 'KeyV', false], ['set', 'roll', 'KeyE', true], ['set', 'charge', 'KeyV', false], ['reset']];
const scenarios = [];
for (const op of ops) {
  const before = ctx.interactResets; let ok = null;
  if (op[0] === 'set') ok = vm.runInContext(`_setInputBinding(${JSON.stringify(op[1])},${JSON.stringify(op[2])},${op[3]})`, ctx);
  else if (op[0] === 'clear') { vm.runInContext(`BINDS2[${JSON.stringify(op[1])}]=null;if(${JSON.stringify(op[1])}==='interact')_resetInteractInput()`, ctx); ok = true; }
  else { vm.runInContext('window._resetBinds()', ctx); ok = true; }
  scenarios.push({ op, ok, interactReset: ctx.interactResets - before, state: snap() });
}
const out = {
  scenarios,
  source: { webCommit: commit, extractedAt: new Date().toISOString(), file: 'game.html', lines: 'BINDS 6188-6207, BIND_NAMES 6256-6278, keyName 6279, _GP_KEY_DEFAULT 13494, renderSettings 48703-48880', note: 'definitions only; absent English key = the web shows the Korean text (_T returns s)' },
  actions: Object.keys(BINDS), binds: BINDS, binds2: BINDS2, binds2Order: Object.keys(BINDS2), resetBinds, resetBinds2,
  names, namesEn, keyMap, ui, en,
  pad: { defaults: gpKey, btnNames: gpBtn, actNames, fixed: [...fixed], guide },
};
fs.writeFileSync(outPath, JSON.stringify(out));
if (uiOutPath) {
  const padRows = Object.keys(gpKey).map(Number).sort((x, y) => x - y).map(i => ({ id: i, btn: gpBtn[i] || ('B' + i), act: actNames[i] || '', fixed: fixed.includes(i), code: gpKey[i] }));
  const ui2 = {
    source: out.source,
    tabs: ui.tabs.map(t => ({ id: t[0], ko: t[1], en: t[2] })),
    texts: { alt: ui.alt, listenMain: ui.listenMain, listenAlt: ui.listenAlt, hint: ui.hint, reset: ui.reset, resetDone: ui.resetDone, fixed: ui.fixed, padTitle: ui.padTitle, padReset: ui.padReset, padGuide: ui.padGuide, chainConflictEn: 'Use separate keys for chain movement and attacks.' },
    en: Object.keys(en).map(k => ({ ko: k, en: en[k] })),
    padRows, guide: guide.map(g => ({ btn: g[0], act: g[1] })),
  };
  fs.writeFileSync(uiOutPath, JSON.stringify(ui2));
}
console.log(JSON.stringify({ actions: out.actions.length, binds2: out.binds2Order.length, reset: Object.keys(resetBinds).length, reset2: Object.keys(resetBinds2).length, keyMap: Object.keys(keyMap).length, en: Object.keys(en).length, gp: Object.keys(gpKey).length, guide: guide.length, fixed: out.pad.fixed }));
