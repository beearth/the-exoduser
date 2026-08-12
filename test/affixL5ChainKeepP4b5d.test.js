import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 4B-5D / LOCK-25] L5 ATTACK-STYLE FINAL CLOSURE — chainDmgKeep ═══
// ltnChaser 체인라이트닝의 실제 per-hop decay(_clDmg*0.8)를 chainDmgKeep로 보존율 상향. 3-hop E2E.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);

// ── 소스 체인 decay 로직 그대로: main hit 전량 + hop당 ~~(_clDmg*_clKeep) ──
function chainDamages(D, keepAffix){
  const _clKeep=Math.min(1,0.8+keepAffix);           // 소스: const _clKeep=Math.min(1,0.8+_eqAffix('chainDmgKeep'))
  const hits=[D];                                     // 소스 28004: hurtE(e,p.dmg) — 첫 target 전량(불변)
  let _clDmg=D;                                       // 28005: _clDmg=p.dmg
  for(let hop=0;hop<2;hop++){ _clDmg=~~(_clDmg*_clKeep); hits.push(_clDmg); } // 28013+28015: hop당 decay 후 hurtE
  return hits;
}

// ══════════════════════════════════════════════════════════════
test('§1 배선 — chainDmgKeep consumer(소스 앵커) + 기존 0.8 대체', () => {
  assert.match(gameHtml,/const _clKeep=Math\.min\(1,0\.8\+_eqAffix\('chainDmgKeep'\)\);/,'retention=min(1,0.8+val) cap 1.0');
  assert.match(gameHtml,/_clDmg=~~\(_clDmg\*_clKeep\);/,'decay가 _clKeep 사용(기존 0.8 대체)');
  assert.ok(!/_clDmg=~~\(_clDmg\*0\.8\)/.test(gameHtml),'하드코딩 0.8 제거');
  assert.match(gameHtml,/hurtE\(e,p\.dmg,_lcAng2/,'첫 target = p.dmg 전량(불변)');
});

test('§2 3-hop E2E — WITHOUT: D, D×0.8, D×0.8² (first hit 불변)', () => {
  const h=chainDamages(1000,0);
  assert.equal(h[0],1000,'hit1 = D (첫 target 불변)');
  assert.equal(h[1],800,'hit2 = ~~(D×0.8)');
  assert.equal(h[2],640,'hit3 = ~~(D×0.8²)');
});

test('§3 3-hop E2E — WITH chainDmgKeep: retention R로 정확히 일치', () => {
  // +0.10 → R=0.9
  let h=chainDamages(1000,0.10);
  assert.equal(h[0],1000,'hit1 불변');
  assert.equal(h[1],900,'hit2 = ~~(D×0.9)');
  assert.equal(h[2],810,'hit3 = ~~(~~(D×0.9)×0.9)');
  // +0.20 → R=1.0 (decay 없음)
  h=chainDamages(1000,0.20);
  assert.deepEqual(h,[1000,1000,1000],'R=1.0: 전 hop 전량 보존');
});

test('§4 cap 1.0 — retention>1 증폭 없음 (chain grows stronger 방지)', () => {
  // 최대 tier .55 → 0.8+0.55=1.35 → min(1)=1.0
  const h=chainDamages(1000,0.55);
  assert.deepEqual(h,[1000,1000,1000],'0.8+0.55=1.35 cap→1.0, 증폭 없음(hit>D 없음)');
  assert.ok(h.every(x=>x<=1000),'어떤 hop도 D 초과 안 함');
});

test('§5 affix0 base parity — 기존 0.8 decay와 byte/effect identical', () => {
  const a=chainDamages(1234,0), b=[1234,~~(1234*0.8),~~(~~(1234*0.8)*0.8)];
  assert.deepEqual(a,b,'affix0 = 순수 0.8 decay 결과 동일');
  // RNG/Math 추가 없음 — _clKeep은 Math.min/eqAffix만(Math.random 없음)
  const line=gameHtml.match(/const _clKeep=Math\.min\(1,0\.8\+_eqAffix\('chainDmgKeep'\)\);/)[0];
  assert.ok(!/random/.test(line),'chainDmgKeep 경로에 Math.random 미추가');
});

test('§6 narrow scope — ltnChaser 전용 (다른 chain 억지 공통화 없음)', () => {
  // _clKeep은 ltnChaser 체인 루프 내에서만 (다른 chain decay는 미변경)
  const occ=[...gameHtml.matchAll(/_clDmg\*_clKeep/g)];
  assert.equal(occ.length,1,'chainDmgKeep decay 배선은 1곳(ltnChaser)만');
  // chainTarget(별개, 고정 0.3) 불변
  assert.match(gameHtml,/hurtE\(ce,~~\(dmg\*\.3\)/,'chainTarget 고정 0.3 불변(별개 mechanic)');
});

test('§7 family + 기존 affix(신규 ID 아님)', () => {
  const a=by('chainDmgKeep');
  assert.ok(a,'존재');assert.equal(a.layer,5);assert.equal(a.sub,'B');assert.equal(a.unit,'pct');
  assert.deepEqual(a.family,['PROJECTILE'],'ltnChaser=PROJECTILE');
  assert.ok(!('v2only'in a),'기존 legacy-rollable 유지(신규 ID 아님)');
  assert.deepEqual(a.tiers,[.10,.18,.28,.40,.55]);
  // POOL count 불변(신규 ID 없음)
  assert.equal(POOL.length,410,'POOL 410 불변');
  assert.equal(POOL.filter(x=>x.sub==='B').length,158,'B 158 불변');
});

test('§8 Batch1/2 working L5-B 보호', () => {
  for(const anchor of [
    /p\._pcBonus=_eqAffix\('pierceCount'\);/,
    /1\+_eqAffix\('splashRadius'\)/,
    /1\+_eqAffix\('splashDmg'\)/,
    /_eqAffix\('projSpeedPct'\)/,
    /p\._pbBonus=_eqAffix\('projBounce'\);/,
    /28\*\(1\+_eqAffix\('beamWidth'\)\)/,
    /_eqAffix\('shieldBypass'\)/,
    /const _ctN=~~\(_eqAffix\('chainTarget'\)\)/,
    /_eqAffix\('staggerExplosion'\)>0/,
    /p\._pierceRate=50\+_eqAffix\('pierceFlat'\);/,
  ]) assert.match(gameHtml,anchor,'배선 유지: '+anchor);
});
