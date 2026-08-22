// tools/map-audit.js — 맵 감사기 (런타임 해결 그리드 기준). 읽기 전용 리포트.
// 입력: maps/resolved-maps.json (dump-snippet.js 콘솔 실행 산출물)
// 보조: maps_data.js (objs 필드 확인용)
// package.json "type":"module" → ESM.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DUMP = path.join(ROOT, 'maps', 'resolved-maps.json');
const MAPS_DATA = path.join(ROOT, 'maps_data.js');
const OUT = path.join(ROOT, 'maps', 'audit-report.md');

// ── 임계값 (상단 상수) ──
const MIN_CORRIDOR = 3;   // 통로 최소폭(타일)
const MIN_ARENA = 120;    // 전투/보스방 최소 바닥 타일 수
const CHAIN_MAX = 12;     // 사슬 앵커: 방중심에서 벽까지 최대 허용거리(타일)
const CLUTTER_PCT = 0.08; // 전투방 고립벽 비율 상한
const T = 40;             // 타일 픽셀 크기 (game.html const T=40)
const SAMPLE = 20;        // 좌표 출력 최대 개수

// ── 입력 로드 ──
if (!fs.existsSync(DUMP)) {
  console.error('❌ maps/resolved-maps.json 없음.\n' +
    '   1) game.html 콘솔(F12)에서 tools/dump-snippet.js 전체를 붙여넣어 실행\n' +
    '   2) 다운로드된 resolved-maps.json 을 maps/resolved-maps.json 로 저장\n' +
    '   3) 다시 node tools/map-audit.js 실행');
  process.exit(1);
}
const dump = JSON.parse(fs.readFileSync(DUMP, 'utf8'));
const TT = dump.T || T;

// maps_data.js 보조 로드 (objs 필드 리포트용)
let FIXED = null;
try {
  const ctx = { console: { log() {}, warn() {}, error() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(MAPS_DATA, 'utf8') + ';globalThis.__F=(typeof FIXED_MAPS!=="undefined")?FIXED_MAPS:null;', ctx, { timeout: 5000 });
  FIXED = ctx.__F;
} catch (e) { FIXED = null; }
// objs 필드명 수집 (V7 N/A 근거)
const objsFields = new Set();
if (FIXED) for (const m of FIXED) if (m && m.objs) for (const o of m.objs) Object.keys(o).forEach(k => objsFields.add(k));

// ── RLE 문자열 → 그리드 디코드 ──
function decode(rle, mw, mh) {
  const g = new Uint8Array(mw * mh); let p = 0;
  const runs = rle.split(';');
  for (const r of runs) {
    if (!r) continue;
    const ci = r.indexOf(':'); const v = +r.slice(0, ci), c = +r.slice(ci + 1);
    for (let i = 0; i < c && p < g.length; i++) g[p++] = v;
  }
  return { g, mw, mh };
}
const at = (G, x, y) => (x < 0 || y < 0 || x >= G.mw || y >= G.mh) ? 1 : G.g[y * G.mw + x];
const isFloor = (G, x, y) => { const v = at(G, x, y); return v === 0 || v === 4; };
const isWall = (G, x, y) => at(G, x, y) === 1;

// ── 태그 분류 (데이터 기반) ──
function tagOf(st, G) {
  const rn = (st.rooms || []).length;
  if (rn >= 25) return 'GRID_MAZE';
  let fl = 0; for (let i = 0; i < G.g.length; i++) if (G.g[i] === 0 || G.g[i] === 4) fl++;
  const ratio = fl / G.g.length;
  if (rn === 0) return 'ZONES';
  if (ratio > 0.98) return 'BASE_CARVE';
  return 'NORMAL';
}

// ── 검증 ──
function auditStage(st) {
  const R = { si: st.si, tag: '-', V: {}, fail: [], warn: [] };
  if (st.error) { R.tag = 'ERROR'; for (let i = 1; i <= 8; i++) R.V['V' + i] = 'FAIL'; R.fail.push('덤프 시 예외: ' + st.error); return R; }
  const G = decode(st.rle, st.mw, st.mh);
  R.tag = tagOf(st, G);
  const rooms = st.rooms || [];
  const start = rooms.find(r => r.type === 'start') || rooms[0];

  // 전체 바닥 집합 + 도달 집합 (V1)
  let totalFloor = 0; for (let i = 0; i < G.g.length; i++) if (G.g[i] === 0 || G.g[i] === 4) totalFloor++;
  const reach = new Uint8Array(G.mw * G.mh);
  let reached = 0;
  if (start && isFloor(G, start.cx, start.cy)) {
    const stk = [[start.cx, start.cy]]; reach[start.cy * G.mw + start.cx] = 1; reached = 1;
    while (stk.length) {
      const [x, y] = stk.pop();
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of nb) {
        if (nx < 0 || ny < 0 || nx >= G.mw || ny >= G.mh) continue;
        const k = ny * G.mw + nx;
        if (!reach[k] && isFloor(G, nx, ny)) { reach[k] = 1; reached++; stk.push([nx, ny]); }
      }
    }
  }
  // V1 도달성
  {
    const iso = totalFloor - reached;
    if (!start) { R.V.V1 = 'FAIL'; R.fail.push('V1: start room 없음'); }
    else if (!isFloor(G, start.cx, start.cy)) { R.V.V1 = 'FAIL'; R.fail.push('V1: start 중심(' + start.cx + ',' + start.cy + ')이 바닥 아님'); }
    else if (iso > 0) {
      R.V.V1 = 'FAIL';
      const coords = [];
      for (let y = 0; y < G.mh && coords.length < SAMPLE; y++)
        for (let x = 0; x < G.mw && coords.length < SAMPLE; x++)
          if (isFloor(G, x, y) && !reach[y * G.mw + x]) coords.push(x + ',' + y);
      R.fail.push('V1: 고립 바닥 ' + iso + '칸 (도달' + reached + '/' + totalFloor + '). 좌표(최대' + SAMPLE + '): ' + coords.join(' '));
      // 방 중심 개별 도달 확인
      const unreachRooms = rooms.filter(r => isFloor(G, r.cx, r.cy) && !reach[r.cy * G.mw + r.cx]).map(r => (r.id || r.type) + '(' + r.cx + ',' + r.cy + ')');
      if (unreachRooms.length) R.fail.push('V1: 미도달 방 = ' + unreachRooms.join(' '));
    } else R.V.V1 = 'PASS';
  }

  // V2 통로 최소폭
  {
    let narrow = 0; const coords = [];
    for (let y = 0; y < G.mh; y++) for (let x = 0; x < G.mw; x++) {
      if (!isFloor(G, x, y)) continue;
      let hl = 0, hr = 0, vu = 0, vd = 0;
      while (isFloor(G, x - hl - 1, y)) hl++;
      while (isFloor(G, x + hr + 1, y)) hr++;
      while (isFloor(G, x, y - vu - 1)) vu++;
      while (isFloor(G, x, y + vd + 1)) vd++;
      const w = Math.min(hl + hr + 1, vu + vd + 1);
      if (w < MIN_CORRIDOR) { narrow++; if (coords.length < SAMPLE) coords.push(x + ',' + y); }
    }
    if (narrow > 0) { R.V.V2 = 'WARN'; R.warn.push('V2: 폭<' + MIN_CORRIDOR + ' 바닥칸 ' + narrow + '개. 좌표: ' + coords.join(' ')); }
    else R.V.V2 = 'PASS';
  }

  // V3 방 면적
  {
    const small = [];
    for (const r of rooms) {
      if (r.type !== 'combat' && r.type !== 'boss') continue;
      let area = 0;
      const x0 = r.x | 0, y0 = r.y | 0, x1 = (r.x + r.w) | 0, y1 = (r.y + r.h) | 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isFloor(G, x, y)) area++;
      if (area < MIN_ARENA) small.push((r.id || r.type) + '(' + r.cx + ',' + r.cy + ')=' + area);
    }
    if (small.length) { R.V.V3 = 'WARN'; R.warn.push('V3: 면적<' + MIN_ARENA + ' 전투/보스방: ' + small.join(' ')); }
    else R.V.V3 = (rooms.some(r => r.type === 'combat' || r.type === 'boss')) ? 'PASS' : 'NA';
  }

  // V4 사슬 앵커
  {
    const bad = [];
    for (const r of rooms) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      let anyWall = false;
      for (const [dx, dy] of dirs) {
        for (let d = 1; d <= CHAIN_MAX; d++) { if (isWall(G, r.cx + dx * d, r.cy + dy * d)) { anyWall = true; break; } }
        if (anyWall) break;
      }
      if (!anyWall) bad.push((r.id || r.type) + '(' + r.cx + ',' + r.cy + ')');
    }
    if (bad.length) { R.V.V4 = 'FAIL'; R.fail.push('V4: 사슬앵커 불가(반경' + CHAIN_MAX + '내 벽 없음) 방: ' + bad.join(' ')); }
    else R.V.V4 = rooms.length ? 'PASS' : 'NA';
  }

  // V5 룸 그래프
  {
    const types = {}; rooms.forEach(r => types[r.type] = (types[r.type] || 0) + 1);
    const startCount = types.start || 0;
    const boss = rooms.find(r => r.type === 'boss');
    const forge = rooms.find(r => r.type === 'forge');
    let ok = true; const msg = [];
    msg.push('types=' + JSON.stringify(types));
    if (startCount !== 1) { msg.push('start=' + startCount + '(≠1)'); if (startCount === 0) ok = false; }
    if (forge) msg.push('forge@(' + forge.cx + ',' + forge.cy + ')');
    if (boss) {
      const bReach = isFloor(G, boss.cx, boss.cy) && reach[boss.cy * G.mw + boss.cx];
      msg.push('boss@(' + boss.cx + ',' + boss.cy + ') ' + (bReach ? '도달O' : '도달X'));
      if (!bReach) { ok = false; R.fail.push('V5: boss 방(' + boss.cx + ',' + boss.cy + ') 미도달'); }
    } else msg.push('boss=없음');
    R.V.V5 = ok ? 'PASS' : 'FAIL';
    R.warn.push('V5(info): ' + msg.join(' '));
  }

  // V6 스폰홀
  {
    const holes = st.spawnHoles || [];
    if (!holes.length) R.V.V6 = 'NA';
    else {
      const onWall = [];
      for (const h of holes) {
        const tx = ~~(h.x / TT), ty = ~~(h.y / TT);
        if (isWall(G, tx, ty)) onWall.push('(' + tx + ',' + ty + ')');
      }
      if (onWall.length) { R.V.V6 = 'FAIL'; R.fail.push('V6: 벽 위 spawnHole ' + onWall.length + '개: ' + onWall.slice(0, SAMPLE).join(' ')); }
      else R.V.V6 = 'PASS';
    }
  }

  // V7 오브젝트 스케일 → 데이터에 크기필드 없음 → NA
  R.V.V7 = 'NA';

  // V8 시야 차단 (전투방 고립벽 비율)
  {
    const overs = [];
    for (const r of rooms) {
      if (r.type !== 'combat') continue;
      const x0 = r.x | 0, y0 = r.y | 0, x1 = (r.x + r.w) | 0, y1 = (r.y + r.h) | 0;
      let floor = 0, island = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (isFloor(G, x, y)) floor++;
        else if (isWall(G, x, y) && isFloor(G, x + 1, y) && isFloor(G, x - 1, y) && isFloor(G, x, y + 1) && isFloor(G, x, y - 1)) island++;
      }
      if (floor > 0 && island / floor > CLUTTER_PCT) overs.push((r.id || r.type) + '=' + (island / floor * 100).toFixed(1) + '%');
    }
    if (overs.length) { R.V.V8 = 'WARN'; R.warn.push('V8: 고립벽>' + (CLUTTER_PCT * 100) + '% 전투방: ' + overs.join(' ')); }
    else R.V.V8 = rooms.some(r => r.type === 'combat') ? 'PASS' : 'NA';
  }

  return R;
}

// ── 실행 ──
const results = (dump.stages || []).map(auditStage);
let failN = 0, warnN = 0; const tagDist = {};
for (const r of results) {
  tagDist[r.tag] = (tagDist[r.tag] || 0) + 1;
  for (const k in r.V) { if (r.V[k] === 'FAIL') failN++; if (r.V[k] === 'WARN') warnN++; }
}

// ── 리포트 ──
let md = '# 맵 감사 리포트 (런타임 해결 그리드 기준)\n\n';
md += '> 입력: maps/resolved-maps.json · 바닥판정 v===0||v===4 · T=' + TT + '\n';
md += '> 임계값: MIN_CORRIDOR=' + MIN_CORRIDOR + ' MIN_ARENA=' + MIN_ARENA + ' CHAIN_MAX=' + CHAIN_MAX + ' CLUTTER_PCT=' + CLUTTER_PCT + '\n\n';
md += '## 요약\n\n';
md += '| 항목 | 값 |\n|---|---|\n';
md += '| 스테이지 | ' + results.length + ' |\n';
md += '| FAIL 총계 | ' + failN + ' |\n';
md += '| WARN 총계 | ' + warnN + ' |\n';
md += '| 태그 분포 | ' + Object.entries(tagDist).map(([k, v]) => k + ':' + v).join(', ') + ' |\n';
md += '\n### V7 참고 (N/A 근거)\n\n';
md += 'objs[] 필드 = `' + ([...objsFields].join(', ') || '(maps_data 로드 실패)') + '` — 크기/스케일 필드 없음. ';
md += '런타임 MAP_OBJS 필드 = `type,x,y,hell,...` (개별 크기 없음, 크기는 game.html `_OBJ_META` 상수). ';
md += 'door/torch/chest/rock/tree 타입 부재 → **V7 = N/A**.\n\n';
md += '## 스테이지별 결과\n\n';
md += '| si | 태그 | V1 | V2 | V3 | V4 | V5 | V6 | V7 | V8 |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const r of results) {
  md += '| ' + r.si + ' | ' + r.tag + ' | ' + [1, 2, 3, 4, 5, 6, 7, 8].map(i => r.V['V' + i] || '-').join(' | ') + ' |\n';
}
md += '\n## FAIL 상세 (좌표·사유)\n\n';
const anyFail = results.some(r => r.fail.length);
if (!anyFail) md += '_FAIL 없음_\n';
else for (const r of results) if (r.fail.length) { md += '### si ' + r.si + ' [' + r.tag + ']\n'; for (const f of r.fail) md += '- ' + f + '\n'; md += '\n'; }
md += '\n## WARN / info 상세\n\n';
for (const r of results) if (r.warn.length) { md += '### si ' + r.si + ' [' + r.tag + ']\n'; for (const w of r.warn) md += '- ' + w + '\n'; md += '\n'; }

fs.mkdirSync(path.join(ROOT, 'maps'), { recursive: true });
fs.writeFileSync(OUT, md);
console.log('맵 감사 완료: ' + results.length + ' stages, FAIL=' + failN + ' WARN=' + warnN);
console.log('태그: ' + Object.entries(tagDist).map(([k, v]) => k + ':' + v).join(', '));
console.log('리포트: maps/audit-report.md');
process.exit(failN > 0 ? 1 : 0);
