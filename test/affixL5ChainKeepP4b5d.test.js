import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 4B-5D / LOCK-25] L5 ATTACK-STYLE FINAL CLOSURE — chainDmgKeep ═══
// 의미: ltnChaser 체인 hop decay(0.2)를 X% 감소 → retention = 1-0.2*(1-val) = min(1, 0.8+0.2*val). 전 tier distinct.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
const TIERS=[.10,.18,.28,.40,.55];

// ── 소스 체인 decay 로직 그대로: main hit 전량 + hop당 ~~(_clDmg*_clKeep) ──
function retention(val){ return Math.min(1,0.8+0.2*val); }   // 소스 공식과 동일
function chainDamages(D, keepAffix){
  const _clKeep=retention(keepAffix);
  const hits=[D];                                     // 소스 28004: hurtE(e,p.dmg) — 첫 target 전량(불변)
  let _clDmg=D;                                       // 28005: _clDmg=p.dmg
  for(let hop=0;hop<2;hop++){ _clDmg=~~(_clDmg*_clKeep); hits.push(_clDmg); } // hop당 decay 후 hurtE
  return hits;
}

// ══════════════════════════════════════════════════════════════
test('§1 배선 — chainDmgKeep consumer(소스 앵커) + 기존 0.8 대체', () => {
  assert.match(gameHtml,/const _clKeep=Math\.min\(1,0\.8\+0\.2\*_eqAffix\('chainDmgKeep'\)\);/,'retention=min(1,0.8+0.2*val)');
  assert.match(gameHtml,/_clDmg=~~\(_clDmg\*_clKeep\);/,'decay가 _clKeep 사용(기존 0.8 대체)');
  assert.ok(!/_clDmg=~~\(_clDmg\*0\.8\)/.test(gameHtml),'하드코딩 0.8 제거');
  assert.match(gameHtml,/hurtE\(e,p\.dmg,_lcAng2/,'첫 target = p.dmg 전량(불변)');
});

test('§2 tier collapse 해소 — T1~T5 retention strict monotonic + distinct', () => {
  const R=[0.8,...TIERS.map(retention)];  // BASE + T1..T5
  // 기대: .800 .820 .836 .856 .880 .910
  assert.deepEqual(R.map(x=>+x.toFixed(3)),[0.800,0.820,0.836,0.856,0.880,0.910],'retention 값');
  for(let i=1;i<R.length;i++) assert.ok(R[i]>R[i-1],`strict monotonic R${i}>R${i-1}`);
  assert.equal(new Set(R.map(x=>x.toFixed(6))).size,R.length,'전부 distinct(붕괴 없음)');
  assert.ok(R.every(x=>x<=1),'단일 tier는 cap 미도달(≤1)');
});

test('§3 3-hop E2E — BASE(affix0): 1000→800→640', () => {
  assert.deepEqual(chainDamages(1000,0),[1000,800,640]);
});

test('§4 3-hop E2E — 각 tier 실제 정수 결과 (T3≠T4≠T5)', () => {
  assert.deepEqual(chainDamages(1000,.10),[1000,820,672],'T1 R=.82');
  assert.deepEqual(chainDamages(1000,.18),[1000,836,698],'T2 R=.836');
  assert.deepEqual(chainDamages(1000,.28),[1000,856,732],'T3 R=.856');
  assert.deepEqual(chainDamages(1000,.40),[1000,880,774],'T4 R=.88');
  assert.deepEqual(chainDamages(1000,.55),[1000,910,828],'T5 R=.91');
  // 첫 hit 전량 불변
  for(const t of TIERS) assert.equal(chainDamages(1000,t)[0],1000,'첫 target 불변');
});

test('§5 고티어 가치 — T3/T4/T5 실제 3-hop damage 서로 다름 (metadata-only 아님)', () => {
  const h3=[.28,.40,.55].map(t=>chainDamages(1000,t)[2]); // hit3
  assert.deepEqual(h3,[732,774,828],'T3<T4<T5 hit3 distinct');
  assert.equal(new Set(h3).size,3,'세 tier 결과 모두 다름');
});

test('§6 cap 1.0 — 스택 시만 도달, 증폭(hit>D) 없음', () => {
  // 단일 T5=.55 → .91 (미도달). 스택(bonus 합 ≥1.0) → cap 1.0
  assert.ok(retention(.55)<1,'단일 T5 cap 미도달(.91)');
  assert.equal(retention(1.0),1.0,'bonus 1.0 → retention 1.0');
  assert.equal(retention(1.5),1.0,'bonus 1.5(스택) → min cap 1.0(증폭 없음)');
  assert.deepEqual(chainDamages(1000,1.5),[1000,1000,1000],'cap: 전량 보존, hit>D 없음');
});

test('§7 affix0 parity — 기존 0.8 decay와 byte/effect identical, RNG 미추가', () => {
  const a=chainDamages(1234,0), b=[1234,~~(1234*0.8),~~(~~(1234*0.8)*0.8)];
  assert.deepEqual(a,b,'affix0 = 순수 0.8 decay 결과 동일');
  const line=gameHtml.match(/const _clKeep=Math\.min\(1,0\.8\+0\.2\*_eqAffix\('chainDmgKeep'\)\);/)[0];
  assert.ok(!/random/.test(line),'chainDmgKeep 경로에 Math.random 미추가');
});

test('§8 narrow scope + family + 기존 affix', () => {
  assert.equal([...gameHtml.matchAll(/_clDmg\*_clKeep/g)].length,1,'배선 1곳(ltnChaser)만');
  assert.match(gameHtml,/hurtE\(ce,~~\(dmg\*\.3\)/,'chainTarget 고정 0.3 불변(별개)');
  const a=by('chainDmgKeep');
  assert.equal(a.unit,'pct');assert.deepEqual(a.family,['PROJECTILE']);assert.ok(!('v2only'in a),'legacy-rollable 유지(신규 ID 아님)');
  assert.deepEqual(a.tiers,TIERS,'tier 데이터 무변경');
  assert.equal(POOL.length,417);assert.equal(POOL.filter(x=>x.sub==='B').length,164);
});

test('§9 Batch1/2 working L5-B 보호', () => {
  for(const anchor of [
    /p\._pcBonus=_eqAffix\('pierceCount'\);/,/1\+_eqAffix\('splashRadius'\)/,/1\+_eqAffix\('splashDmg'\)/,
    /_eqAffix\('projSpeedPct'\)/,/p\._pbBonus=_eqAffix\('projBounce'\);/,/28\*\(1\+_eqAffix\('beamWidth'\)\)/,
    /_eqAffix\('shieldBypass'\)/,/const _ctN=~~\(_eqAffix\('chainTarget'\)\)/,/_eqAffix\('staggerExplosion'\)>0/,
    /p\._pierceRate=50\+_eqAffix\('pierceFlat'\);/,
  ]) assert.match(gameHtml,anchor);
});
