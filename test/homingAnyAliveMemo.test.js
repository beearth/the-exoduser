import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// ═══ [perf §6.12] pProjs homing _anyAlive memoize — byte-identical 검증 ═══
// plagueHoming/mhBlade 관통 homing 타겟 재획득 시, 이미-때린 후보마다 반복하던
// _anyAlive 내부 재스캔(O(k²))을 프레임당 1회로 축약. bestE 선택·_hitSet.clear
// 타이밍이 원본과 완전 동일함을(=byte-identical) 랜덤 fuzz로 실증.

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── 1) 소스 앵커: 최적화가 실제 코드에 반영돼 있는지 (회귀 가드) ──
test('homing _anyAlive 재스캔이 _aaChk 플래그로 프레임당 1회로 memoize됨', () => {
  assert.match(game, /let _aaChk=false;/);
  assert.match(game, /if\(\(p\.plagueHoming\|\|p\.mhBlade\)&&!_aaChk\)\{_aaChk=true;let _anyAlive=false;/);
  // 이전(무memo) 형태가 남아있지 않은지
  assert.doesNotMatch(game, /if\(p\.plagueHoming\|\|p\.mhBlade\)\{let _anyAlive=false;/);
});

// ── 2) 동등성 fuzz: OLD vs NEW 내부 타겟팅 로직을 충실히 재현 후 대조 ──
// dst는 결정적 유클리드; 여기선 순위만 필요하므로 좌표 그대로 사용.
function dst(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

// OLD: 원본 (이미-때린 plague/mh 후보마다 _anyAlive 재스캔)
function targetOld(p, neH, bestD0) {
  const hit = new Set(p._hitSet); // 파괴적 clear 격리
  let bestE = null, bestD = bestD0, cleared = false;
  for (let h = 0; h < neH.length; h++) {
    const e = neH[h]; if (!e.alive) continue;
    if (hit.has(e) && !p.venomBlade) {
      if (p.plagueHoming || p.mhBlade) {
        let anyAlive = false;
        for (let pi = 0; pi < neH.length; pi++) { if (neH[pi].alive && !hit.has(neH[pi])) { anyAlive = true; break; } }
        if (!anyAlive) { hit.clear(); cleared = true; }
      }
      continue;
    }
    const d = dst(p.x, p.y, e.x, e.y); if (d < bestD) { bestD = d; bestE = e; }
  }
  return { bestE, bestD, cleared };
}

// NEW: memoized (_aaChk로 프레임당 1회)
function targetNew(p, neH, bestD0) {
  const hit = new Set(p._hitSet);
  let bestE = null, bestD = bestD0, cleared = false, aaChk = false;
  for (let h = 0; h < neH.length; h++) {
    const e = neH[h]; if (!e.alive) continue;
    if (hit.has(e) && !p.venomBlade) {
      if ((p.plagueHoming || p.mhBlade) && !aaChk) {
        aaChk = true;
        let anyAlive = false;
        for (let pi = 0; pi < neH.length; pi++) { if (neH[pi].alive && !hit.has(neH[pi])) { anyAlive = true; break; } }
        if (!anyAlive) { hit.clear(); cleared = true; }
      }
      continue;
    }
    const d = dst(p.x, p.y, e.x, e.y); if (d < bestD) { bestD = d; bestE = e; }
  }
  return { bestE, bestD, cleared };
}

// 결정적 LCG (seed 고정) — Math.random 회피
function makeRng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

test('OLD vs NEW: bestE 선택 + hitSet clear 여부가 모든 fuzz 시나리오에서 동일', () => {
  const rng = makeRng(42);
  const kinds = [
    { plagueHoming: true }, { mhBlade: true }, { venomBlade: true }, {}, // 일반 magic
  ];
  let cases = 0, bestMatch = 0, clearMatch = 0;
  for (let iter = 0; iter < 20000; iter++) {
    const kind = kinds[(rng() * kinds.length) | 0];
    const n = 1 + ((rng() * 8) | 0);
    const neH = [];
    for (let i = 0; i < n; i++) neH.push({ id: i, x: (rng() * 400) | 0, y: (rng() * 400) | 0, alive: rng() < 0.75 });
    // _hitSet: 일부 적을 이미 때린 것으로 (같은 e 객체 참조)
    const hitSet = new Set();
    for (let i = 0; i < n; i++) if (rng() < 0.5) hitSet.add(neH[i]);
    const p = { x: (rng() * 400) | 0, y: (rng() * 400) | 0, _hitSet: hitSet, ...kind };
    const bestD0 = 200 + ((rng() * 800) | 0);
    const a = targetOld(p, neH, bestD0);
    const b = targetNew(p, neH, bestD0);
    cases++;
    // bestE는 객체 참조 → id로 비교
    const aid = a.bestE ? a.bestE.id : -1, bid = b.bestE ? b.bestE.id : -1;
    assert.equal(bid, aid, `bestE mismatch iter=${iter} kind=${JSON.stringify(kind)}`);
    assert.equal(b.cleared, a.cleared, `clear mismatch iter=${iter} kind=${JSON.stringify(kind)}`);
    assert.equal(b.bestD, a.bestD, `bestD mismatch iter=${iter}`);
    if (bid === aid) bestMatch++;
    if (b.cleared === a.cleared) clearMatch++;
  }
  assert.equal(bestMatch, cases);
  assert.equal(clearMatch, cases);
});

// ── 3) memo가 실제로 재스캔을 줄이는지: anyAlive=TRUE + 이미-때린 생존적 다수 ──
// (전부-때림+안때린0 케이스는 OLD도 첫 후보에서 clear→재진입 없음이라 이득 없음.
//  실제 이득 = 안 때린 생존적이 있어 clear가 안 일어나는 mhBlade mid-pierce 상황)
test('anyAlive=TRUE + 이미-때린 생존적 다수일 때 NEW는 내부 스캔을 1회로 제한 (OLD는 매번)', () => {
  const neH = [];
  neH.push({ id: 0, x: 5, y: 0, alive: true }); // 안 때린 생존적 (anyAlive=true 유지 → clear 안 됨)
  for (let i = 1; i < 5; i++) neH.push({ id: i, x: i * 10, y: 0, alive: true }); // 이미-때린 생존적 4
  const hitSet = new Set(neH.slice(1)); // id 1~4만 때림
  const p = { x: 0, y: 0, _hitSet: hitSet, plagueHoming: true };

  let oldScans = 0, newScans = 0;
  // OLD 재현 (스캔 카운트)
  { const hit = new Set(p._hitSet);
    for (let h = 0; h < neH.length; h++) { const e = neH[h]; if (!e.alive) continue;
      if (hit.has(e) && !p.venomBlade) { if (p.plagueHoming || p.mhBlade) { oldScans++; let any=false; for(let pi=0;pi<neH.length;pi++){if(neH[pi].alive&&!hit.has(neH[pi])){any=true;break}} if(!any)hit.clear(); } continue; } } }
  // NEW 재현 (스캔 카운트)
  { const hit = new Set(p._hitSet); let aa=false;
    for (let h = 0; h < neH.length; h++) { const e = neH[h]; if (!e.alive) continue;
      if (hit.has(e) && !p.venomBlade) { if ((p.plagueHoming || p.mhBlade)&&!aa) { aa=true; newScans++; let any=false; for(let pi=0;pi<neH.length;pi++){if(neH[pi].alive&&!hit.has(neH[pi])){any=true;break}} if(!any)hit.clear(); } continue; } } }

  assert.equal(oldScans, 4, 'OLD는 이미-때린 생존적마다 재스캔 (4회)');
  assert.equal(newScans, 1, 'NEW는 프레임당 1회로 축약');
});
