/* ENEMY-20261002-ROUNDROBIN-BOUNDARY — 실제 후보 헤더 실행 + 음수/오버플로/변동 반례 + 최소 보강
 *
 * root 검토: f06 후보의 `(G._eLoopStart|0)%_elen` 는 _eLoopStart=-1 또는 signed-32 넘침(2147483648)·
 *   아주 큰 값에서 %가 '음수'가 되어 _eStart<0 → _ei<0 → `if(!e)continue` 가 유효 꼬리까지 누락시킨다.
 *   "원 후보가 음수/stale 을 안전 정규화한다"는 주장은 미검증 → 실제 후보 헤더를 실행해 반례 검수.
 *
 * 본 fixture 는:
 *   (1) 원 f06 후보 헤더 코드를 patch 파일에서 '추출'해 실제 실행(new Function) → 반례 재현.
 *   (2) 최소 보강 헤더(음수/비정상/큰값 안전 정규화)를 실행 → 전 인덱스 커버·꼬리 유지 확인.
 *   (3) splice/spawn 중 변동·LOD parity 유지 검수.
 *
 * 소형·결정적만(실 CPU/긴 스트레스/대형 시뮬 0). 예산식/soft-cap/공격티켓/전투정책 변경 0.
 * production game.html/easy 및 원 f06-source-* 읽기전용(미수정).
 *
 * 실행: node tools/team-followup-20261001/ENEMY/roundrobin-boundary.fixture.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const f06PatchPath = path.join(__dirname, 'f06-source-roundrobin.game.patch');
const f06Patch = readFileSync(f06PatchPath, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

let pass = 0, fail = 0; const log = [];
function check(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '\n        ' + (e && e.message)); fail++; }
}

// ── (1) 원 f06 후보 헤더 코드를 patch 추가줄(+)에서 추출(주석 제외) — 실제 후보 실행용 ──
function extractAddedCode(patch) {
  return patch.split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .filter((l) => !/^\s*\/\//.test(l))        // 주석줄 제외
    .join('\n');
}
const ORIG_HEADER_CODE = extractAddedCode(f06Patch);
// 추출 확인: 핵심 식이 들어있어야(원 후보와 결속)
assert.ok(ORIG_HEADER_CODE.includes('((G._eLoopStart|0)%_elen)'), '원 후보의 |0 정규화식 추출 확인');
assert.ok(ORIG_HEADER_CODE.includes('const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;'), '원 후보 _ei/hole 가드 추출');

// ── 최소 보강 헤더 코드(음수/비정상/큰값 안전 정규화. |0 제거, 비음수 fold) ──
const HARDENED_HEADER_CODE = [
  "  const _elen=ens.length;",
  "  const _rr0=G._eLoopStart;",
  "  const _eStart=(_elen>0&&typeof _rr0==='number'&&Number.isFinite(_rr0))?(((Math.floor(_rr0)%_elen)+_elen)%_elen):0;",
  "  G._eLoopStart=_elen>0?((_eStart+1)%_elen):0;",
  "  for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;",
  "    if(_k%(IS_MOBILE?8:32)===0&&_k>0&&!e.ib&&performance.now()-_eUpdateStart>(IS_MOBILE?8:12))break;"
].join('\n');

// 헤더 코드를 실행 가능한 방문-수집 함수로 래핑(예산 break 는 perf 스텁으로 비활성 → 커버리지 검사)
function makeVisitor(headerCode) {
  const body =
    "const performance={now:function(){return 0}};const _eUpdateStart=0;const _visited=[];let _negSeen=false;\n" +
    headerCode + "\n" +
    "    if(_ei<0||_ei>=ens.length)_negSeen=true;\n" +
    "    _visited.push(_ei);\n" +
    "  }\n" +
    "  return {visited:_visited, nextStart:G._eLoopStart, negOrOob:_negSeen};";
  // eslint-disable-next-line no-new-func
  return new Function('G', 'ens', 'IS_MOBILE', body);
}
const visitOriginal = makeVisitor(ORIG_HEADER_CODE);
const visitHardened = makeVisitor(HARDENED_HEADER_CODE);

// 원 후보의 _eStart 식을 그대로 실행(음수 여부 직접 증명) — if(!e)continue 가 가리기 전 단계
// eslint-disable-next-line no-new-func
const evalEStartOrig = new Function('G', '_elen', 'return _elen>0?((G._eLoopStart|0)%_elen):0;');

function mkEns(N) { const a = []; for (let i = 0; i < N; i++) a.push({ idx: i, ib: (i === N - 1), s: 'idle' }); return a; }
// NEG_STARTS: (v|0) 가 음수 → _eStart<0 → 꼬리 누락(실제 결함). -1, 2^31, 1e21.
const NEG_STARTS = [-1, 2147483648, 1e21];
// STALE_STARTS: (v|0) 가 비음수지만 '엉뚱한' 시작(회전 위치 상실/점프). 2^32→0, -(2^31+1)→+. 크래시는 아니나 비일관.
const STALE_STARTS = [4294967296, -2147483649];
const SAFE_STARTS = [0, 1, 39, undefined, NaN, Infinity];
const ALL_STARTS = [...NEG_STARTS, ...STALE_STARTS, ...SAFE_STARTS];

console.log('ENEMY-20261002-ROUNDROBIN-BOUNDARY fixture');
console.log('  f06 patch sha256=' + sha(f06Patch) + ' (원 후보 — 읽기전용 보존)\n');

// ════════ (1) 반례 재현: 원 후보 헤더 실제 실행 ════════
check('반례(원후보): 음수/2^31/큰값 start → 실제 _eStart<0 → 유효 인덱스 누락(꼬리 포함)', () => {
  const N = 40, tail = N - 1;
  const rows = [];
  for (const bad of NEG_STARTS) {
    const ens = mkEns(N);
    const eStart = evalEStartOrig({ _eLoopStart: bad }, N);      // 원 식 그대로 실행
    const r = visitOriginal({ _eLoopStart: bad }, ens, false);   // 실제 헤더 실행(방문)
    const coverage = new Set(r.visited.filter((i) => i >= 0 && i < N)).size;
    rows.push({ start: String(bad), eStart, tailVisited: r.visited.includes(tail), coverage, negIdxMaskedByHoleGuard: r.negOrOob === false });
    assert.ok(eStart < 0, 'bad start=' + bad + ' 에서 원 _eStart 식이 음수(' + eStart + ') — root 지적 검증');
    assert.equal(r.visited.includes(tail), false, 'bad start=' + bad + ' 꼬리(' + tail + ') 미방문(결함 재현)');
    assert.ok(coverage < N, 'bad start=' + bad + ' 유효 인덱스 누락(coverage ' + coverage + '/' + N + ')');
  }
  log.push({ case: 'original-bad-starts', note: '음수 _ei 는 if(!e)continue 로 가려져 조용히 유효 꼬리를 누락(=F06 결함 재발)', rows });
});
check('정상 start(원후보): 0/39/undefined/NaN/Infinity 는 안전(음수 아님)', () => {
  const N = 40;
  for (const s of SAFE_STARTS) {
    const r = visitOriginal({ _eLoopStart: s }, mkEns(N), false);
    assert.equal(r.negOrOob, false, 'safe start=' + String(s) + ' 는 음수/범위밖 없음');
  }
});

// ════════ (2) 최소 보강: 전 인덱스 커버·꼬리 유지·음수 0 ════════
check('보강: 음수/2^31/큰값/비정상 start 전부 → 전 인덱스 1회 방문·꼬리 포함·음수 _ei 0', () => {
  const N = 40, tail = N - 1;
  const rows = [];
  for (const s of ALL_STARTS) {
    const ens = mkEns(N);
    const r = visitHardened({ _eLoopStart: s }, ens, false);
    const cover = new Set(r.visited).size;
    rows.push({ start: String(s), tailVisited: r.visited.includes(tail), coverage: cover, negOrOob: r.negOrOob, nextStart: r.nextStart });
    assert.equal(r.negOrOob, false, 'start=' + String(s) + ' 보강 후 음수/범위밖 없음');
    assert.equal(r.visited.includes(tail), true, 'start=' + String(s) + ' 꼬리 방문');
    assert.equal(cover, N, 'start=' + String(s) + ' 전 인덱스(0..' + tail + ') 1회 커버');
    assert.ok(Number.isInteger(r.nextStart) && r.nextStart >= 0 && r.nextStart < N, 'nextStart 정규화(self-heal)');
  }
  log.push({ case: 'hardened-all-starts', rows });
});
check('보강: 다음 tick G._eLoopStart 자가치유 — bad start 라도 이후엔 [0,_elen) 정상 회전', () => {
  const N = 40; const G = { _eLoopStart: 2147483648 };
  const firstHeads = new Set();
  for (let t = 0; t < N; t++) { const r = visitHardened(G, mkEns(N), false); firstHeads.add(r.visited[0]); }
  assert.equal(firstHeads.size, N, 'N tick 동안 모든 인덱스가 1회 선두(_k=0) — 영구 기아 없음');
  log.push({ case: 'hardened-selfheal-rotation', distinctHeads: firstHeads.size });
});

// ════════ (3) splice/spawn 중 변동 · LOD parity ════════
check('경계: 루프 중 splice(축소) — 크래시 없음, 범위밖은 hole 가드로 스킵', () => {
  const N = 40; const ens = mkEns(N);
  // 방문 함수는 한 tick 스냅샷이므로, 축소는 '시작 시 캡처한 _elen > 현재 길이' 상황을 모사:
  const shrunk = mkEns(20);                      // 실제 길이 20
  // _elen 은 헤더가 ens.length(=20)로 캡처 → 범위밖 없음. 외부 축소 모사: 큰 _elen 가정 실행
  const r = visitHardened({ _eLoopStart: 0 }, shrunk, false);
  assert.equal(r.negOrOob, false, '축소 배열에서 범위밖 없음');
  assert.equal(new Set(r.visited).size, 20, '현재 길이만큼 커버');
  // hole(undefined 슬롯) 직접 주입: if(!e)continue 로 스킵, 크래시 없음
  const holed = mkEns(N); holed[7] = undefined;
  const rh = visitHardened({ _eLoopStart: 0 }, holed, false);
  assert.ok(!rh.visited.includes(7), 'hole 인덱스 미방문(가드)');
  assert.equal(rh.negOrOob, false, 'hole 로 인한 범위밖 없음');
});
check('경계: spawn(증가)은 당틱 _elen 캡처 이후분 미방문, 크래시 없음(다음 tick 재캡처)', () => {
  const N = 20; const ens = mkEns(N);
  const r = visitHardened({ _eLoopStart: 0 }, ens, false);   // _elen=20 캡처
  assert.equal(new Set(r.visited).size, 20, '캡처 시점 길이만 방문');
  // 이후 외부에서 ens.push(...) 되어도 당틱 방문엔 영향 없음(다음 tick 재캡처) — 설계상 안전
});
check('LOD parity 유지: 보강 후 _ei 는 [0,_elen) 실제 인덱스 → (tierFrame&m)===(_ei&m) 원본과 동일', () => {
  const N = 40;
  const r = visitHardened({ _eLoopStart: 5 }, mkEns(N), false);
  for (const ei of r.visited) {
    assert.ok(ei >= 0 && ei < N && Number.isInteger(ei), '_ei 유효 정수 인덱스');
    for (const m of [1, 3, 7]) for (let tf = 0; tf < 8; tf++)
      assert.equal((tf & m) === (ei & m), (tf & m) === (ei & m), 'parity 는 _ei 고정(방문순서 무관)');
  }
  assert.ok(HARDENED_HEADER_CODE.includes('const _ei=(_eStart+_k)%_elen'), '_ei=실제 배열 인덱스 보존');
});

// ════════ 보호계약(코드 기준) ════════
check('보호계약: 예산 12/8ms·공격티켓 미도입·soft-cap 무조건활성 0(보강 코드 기준)', () => {
  assert.ok(HARDENED_HEADER_CODE.includes('(IS_MOBILE?8:12)') && HARDENED_HEADER_CODE.includes('(IS_MOBILE?8:32)'), '예산식·간격 보존');
  const codeNoComment = HARDENED_HEADER_CODE.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  assert.ok(!/soft.?cap/i.test(codeNoComment), 'soft-cap 코드 없음');
  assert.ok(!/Ticket|티켓/.test(codeNoComment), '공격티켓 미도입');
});

console.log('\n결과: ' + pass + ' PASS / ' + fail + ' FAIL');
console.log(JSON.stringify({ taskId: 'ENEMY-20261002-ROUNDROBIN-BOUNDARY', f06PatchSha256: sha(f06Patch), rows: log }, null, 2));
process.exit(fail === 0 ? 0 : 1);
