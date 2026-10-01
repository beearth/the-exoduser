#!/usr/bin/env node
/*
 * flash-transition-source-regression.mjs — _hitFlash 수명/사망·부활 전이 소스 회귀 (게임 실행 없이)
 * 소유: ANIMVFX / 터미널 8. 과제 ANIMVFX-20261002-FLASH-TRANSITION.
 *
 * 목적: 실제 생산 game.html의 spawn/update/render에서 e._hitFlash가
 *       죽음·부활·pool재사용·GL↔2D전환에 남는지를 소스 추출로 확인(새 관측기/보고 반복 아님).
 *       게임/브라우저 실행 0, 읽기만. game.html 미수정(원파일 before=flash-transition-before.md).
 *
 * e._hitFlash 생애(소스 확정):
 *   - 세팅:  hurtE 내 e._hitFlash=6(일반)/=4(회전참)       [game.html ~40963/40981]
 *   - 감쇠:  update() 'if(e.alive){ ... if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp) }'  [~33149]  ← alive 전용
 *   - 소거:  draw() 2D 루프 사망분기 'if(!e.alive){ if(e._hitFlash)e._hitFlash=0; ... }'           [~50888]  ← 렌더 경로 전용
 *   - 스폰:  mkEn _e={...} 리터럴에 _hitFlash 없음(undefined≈0, 신규객체 안전). _spawnGhoul/_spawnMatSlime도 신규객체.
 *
 * 확인된 결함(ONE): 동일객체 부활 전이 3곳이 eShield/stunned/reviveIframes 등 과도 상태는 리셋하면서
 *   e._hitFlash만 리셋하지 않는다 → "부활 시 플래시 없음" 불변식이 상태전이가 아니라 렌더경로(50888)에만 의존.
 *   현재는 죽은 몹이 ens에 ≥1프레임 남고 draw가 매 프레임 50888을 돌려 가려져 있으나(라이브 재현 아님),
 *   GC 타이밍/비렌더 부활/ens 밖 객체 부활 어느 하나라도 바뀌면 부활 첫 프레임 잔상(pop)으로 회귀한다.
 *   부활 전이는 권위 있는 소유 지점이므로 거기서 소거해야 한다(형제 상태들과 동일). → flash-transition.patch
 *
 * 사용: node flash-transition-source-regression.mjs [game.html경로]
 * exit 0 = 결함(부활전이 _hitFlash 소거 누락)이 소스에서 확인됨, 1 = 패턴 불일치(소스 드리프트 → 수동 확인).
 */
import fs from 'node:fs';

const PATH = process.argv[2] || 'game.html';
const src = fs.readFileSync(PATH, 'utf8');
const lines = src.split('\n');
const findLine = (sub) => { const i = lines.findIndex(l => l.includes(sub)); return i < 0 ? null : i + 1; };
const has = (sub) => src.includes(sub);

let fail = 0;
const ok = (b, msg) => { console.log(`[${b ? 'OK ' : 'XX '}] ${msg}`); if (!b) fail++; return b; };

console.log(`flash-transition 소스 회귀 — ${PATH}\n`);

// ── 1) 생애 경로 존재 확인 ────────────────────────────────────────────────
console.log('── _hitFlash 생애 경로 ──');
const decay = 'if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp)';
const deathReset = 'if(e._hitFlash)e._hitFlash=0';
ok(has(decay), `update 감쇠(alive 전용) 존재  [L${findLine(decay)}]`);
ok(has(deathReset), `draw 사망분기 소거(렌더 전용) 존재  [L${findLine(deathReset)}]`);
// 감쇠가 alive 가드 안인지(죽은 몹은 update에서 감쇠 안 함 → 렌더 소거에 의존) 확인
const decayLine = findLine(decay);
const aliveGuardBefore = decayLine ? lines.slice(Math.max(0, decayLine - 40), decayLine).some(l => l.trim() === 'if(e.alive){') : false;
ok(aliveGuardBefore, `감쇠는 'if(e.alive){' 블록 안 → 죽은 몹 감쇠는 렌더 소거(50888)에만 의존 (단일 경로)`);

// ── 2) 스폰 안전(신규객체 _hitFlash 미세팅 = undefined≈0) ─────────────────
console.log('\n── 스폰/pool ──');
const mkEnObj = src.slice(src.indexOf('const _e={x,y,r,hp:_hp'), src.indexOf('const _e={x,y,r,hp:_hp') + 2500);
ok(!/_hitFlash/.test(mkEnObj), 'mkEn _e 리터럴에 _hitFlash 없음 → 신규 몹 undefined(≈0) 안전(초기 잔상 없음)');
ok(has('function _spawnGhoul(x,y,origE)') && /const e=\{x,y,r:gd\.r/.test(src), '_spawnGhoul은 신규 객체 리터럴(origE 복사 아님) → 구울 stale hf 없음');

// ── 3) 동일객체 부활 전이 3곳: eShield/stunned/reviveIframes 리셋하나 _hitFlash 누락(결함) ──
console.log('\n── 동일객체 부활 전이(결함 확인) ──');
const reviveSites = [
  { name: '보스 부활', anchor: "e.alive=true;e.x=e._reviveX;e.y=e._reviveY;", tail: 'e.reviveIframes=90;e._bossRevJudged=false;' },
  { name: '드루이드 피날레 부활', anchor: "e.alive=true;e.hp=Math.max(1,Math.floor(e.mhp*.35));e.eShield=0;e.eShieldMax=0;", tail: null },
  { name: '주술사 시체 부활(etype9)', anchor: "corpse.alive=true;corpse.hp=~~(corpse.mhp*.5);corpse.eShield=0;corpse.eShieldMax=0;corpse.s='recover';corpse.st2=60;corpse.stunned=0;corpse.poise=corpse.maxPoise;corpse.reviveIframes=0;", tail: null }
];
for (const s of reviveSites) {
  const ln = findLine(s.anchor);
  if (!ln) { ok(false, `${s.name}: 전이 라인 미발견(소스 드리프트) — 수동 확인 필요`); continue; }
  // 전이 '문장군'(부활 블록: 해당 라인 + 다음 몇 줄)에서 리셋 필드 검사
  const grp = lines.slice(ln - 1, ln + 5).join(' ');
  const resetsEShield = /eShield\s*=\s*0/.test(grp);
  const resetsStun = /stunned\s*=\s*0/.test(grp);
  const resetsIframe = /reviveIframes\s*=/.test(grp);
  const resetsHitFlash = /_hitFlash\s*=\s*0/.test(grp);
  const sibling = resetsEShield && resetsStun && resetsIframe;
  console.log(`   ${s.name}  [L${ln}]  eShield=${resetsEShield} stunned=${resetsStun} reviveIframes=${resetsIframe} _hitFlash=${resetsHitFlash}`);
  ok(sibling && !resetsHitFlash, `${s.name}: 형제 상태(eShield/stunned/reviveIframes) 리셋하나 _hitFlash 소거 누락 = 결함`);
}

// ── 4) GL↔2D 전환: 감쇠는 update 단일지점(렌더 아님) → 전환 이중감소/누락 없음(여기선 결함 아님) ──
console.log('\n── GL↔2D 전환 ──');
const glRenderDraws = has("e._ensGLMode!==1)continue;") || has("e._ensGLMode===1");
const twoDFlash = has("e._hitFlash > 0 && !_ensGLQueued");
const glDecrementsInRender = /_ensGLMode[\s\S]{0,400}?_hitFlash\s*--/.test(src) || /_ensGLMode[\s\S]{0,400}?_hitFlash\s*-=\s*1/.test(src);
ok(glRenderDraws && twoDFlash, 'GL 경로/2D 경로 플래시 렌더 상호배타(_ensGLMode / !_ensGLQueued) 존재');
ok(!glDecrementsInRender, '렌더(GL/2D)는 감소 안 함(감쇠=update 33149 단일지점) → GL↔2D 전환 이중감소 없음');

// ── 5) 제어흐름 모델: 현재 불변식은 렌더경로 소거에만 의존(결함의 영향 범위) ──
console.log('\n── 제어흐름 모델(렌더경로 의존 — 결함 영향) ──');
// 모델: 죽은 몹은 ens에 남고(즉시 splice 없음), GC 20프레임(_gcT>20)에서만 reviveTimer 없는 사망 제거.
const noImmediateSplice = !/e\.alive=false;[^\n]*ens\.splice/.test(src);
const gcEvery20 = has('if(G._gcT>20)');
ok(noImmediateSplice, '사망 시 ens 즉시 splice 없음 → 죽은 몹 ≥1프레임 ens 잔류(draw가 소거할 기회)');
ok(gcEvery20, 'GC는 20프레임 주기(_gcT>20) → 그 사이 draw의 50888이 _hitFlash 소거(현재 가림막)');
// 결론: 소거가 렌더에만 있으므로, 렌더 소거가 안 도는 부활(ens밖/비렌더/타이밍변경)이면 잔상.
console.log('   → 결론: 현재 라이브 잔상은 가려져 있으나(렌더 소거 의존), 부활 전이에 _hitFlash 소거가 없어 구조적 단일경로 취약. 최소 패치=전이에서 소거.');

console.log(`\n${fail === 0 ? 'CONFIRMED (결함: 부활 전이 _hitFlash 소거 누락, 소스에서 확인)' : fail + ' 패턴 불일치'} (exit ${fail === 0 ? 0 : 1})`);
process.exit(fail === 0 ? 0 : 1);
