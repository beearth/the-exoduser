// boss-revive-kill-tail.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CLAUDE8-PROD-BOSS-20261006-0220 / BOSS = UUID 72ba2963-…
// 주제(택1): **보스 countdown/kill-tail 반복효과** (scene-retry 생명주기 아님).
//
// 성격: 순수 함수 패치 생성기. 입력=game.html source **문자열**, 출력=패치 ops/문자열.
// 이 모듈은 game.html을 **편집하지 않는다**(shared game 편집 0). root가 핀된 SHA에
// 대해 apply() 결과를 검토·적용한다. 생산 채택 아님(후보).
//
// 고치는 결함(source 추적, confirmed production bug/adopted 주장 아님):
//   보스 2차 폴백부활은 arming 시 e.alive=false + _reviveTimer=180 설정 후 공유 kill
//   tail을 return 없이 통과(1차 즉시부활은 41258 return으로 전부 skip). 그래서 부활
//   예정 사망마다 on-kill 어픽스·killcount·combo + 재료/물약/장비drop/EXP가 반복 지급.
//   본 패치는 arming 시 "이 사망이 부활로 resolve될지"를 선계산 roll로 예측해
//   (_bossWillRevive) 반복 보상/카운트를 skip하고, 최종 사망 사이클(willRevive=false)
//   에만 1회 지급되게 한다(최종1회 손실 없음).
//
// 보존: 일반몹·문지기(_isGateGuard, !e.ib)·corpse·deathFX·gore·gate·EXP/drop/재료의
//   **최종1회**·2_3 값. _bossWillRevive는 e.ib에서만 true → 비보스 전부 불변.
// ─────────────────────────────────────────────────────────────────────────────

// 대조 source 핀 (apply는 이 SHA의 game.html에 맞춰 설계). 라인은 참고용(유동).
export const SOURCE = Object.freeze({
  file: 'game.html',
  sha256: '4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd',
  capturedAt: '2026-10-06',
  subject: 'boss-revive-kill-tail-repeat',
});

// resolve(33270) 판정식 — _bossWillRevive가 거울로 삼는 source 핀. apply 전 존재 확인.
export const RESOLVE_PIN = '(e._bossRevRoll??1)<(e._bossRevChance||0)';

// [0324] 전체 game.html SHA256 핀 보완. apply/verify에 {sourceSha}를 넘기면 이 값과 대조해
// 핀 불일치 source(다른 HEAD/편집본)에 패치 적용을 거부한다. 해시 계산은 호출자(아래 CLI).
export const EXPECTED_SHA = SOURCE.sha256;
export function checkSha(sourceSha) {
  const got = typeof sourceSha === 'string' ? sourceSha.trim().toLowerCase() : null;
  return { ok: got === EXPECTED_SHA, expected: EXPECTED_SHA, got };
}

// ── 패치 ops (순수 데이터) ──
// 각 op: 단일 라인 앵커(정확 들여쓰기 포함) 기준. type:
//   insertAfter / insertBefore / replaceLine.  anchor는 source에 정확히 1회 존재해야 함.
export function buildOps() {
  const GUARD_OPEN = '    if(!_bossWillRevive){ // [BOSS-REV-FIX] 부활 예정 사망: 반복 보상/카운트 skip';
  const GUARD_CLOSE = '    } // [BOSS-REV-FIX] end guard';
  return [
    // A. _bossWillRevive 선언 — 2차 블록(roll/chance 선계산) 직후
    {
      id: 'A-declare', type: 'insertAfter',
      anchor: '      e._bossRevived=true; // 타이머 활성 (실제 부활 여부는 resolve에서)',
      text: '    const _bossWillRevive=e.ib&&(e._reviveTimer||0)>0&&(e._bossRevRoll??1)<(e._bossRevChance||0); // [BOSS-REV-FIX] resolve(33270)와 동일식 — 최종 사망 사이클에만 false',
    },
    // B. on-kill 어픽스 + 유니크 폭발(_uMaceExplode) 묶음을 가드로 감쌈
    {
      id: 'B-onkill-open', type: 'insertBefore',
      anchor: "    // ═══ 어픽스: killSlayer (처치보너스) — 처치 시 3초간 뎀업 ═══",
      text: GUARD_OPEN,
    },
    {
      id: 'B-onkill-close', type: 'insertAfter',
      anchor: "    if(_uEq('_uMaceExplode')>0){const _exD=~~(e.mhp*_uEq('_uMaceExplode'));const _exQ=shQuery(e.x,e.y,150);for(let _ei=0;_ei<_exQ.length;_ei++){if(_exQ[_ei].alive&&_exQ[_ei]!==e)hurtE(_exQ[_ei],_exD,Math.atan2(_exQ[_ei].y-e.y,_exQ[_ei].x-e.x),true,{dot:true})}addTxt(e.x,e.y-20,_T('💥유니크 폭발!'),'#ff4466',40)}",
      text: GUARD_CLOSE,
    },
    // D. killcount/stageKills/펫 — e.alive=false·atkTicketRelease·_regKill은 항상 유지
    {
      id: 'D-killcount', type: 'replaceLine',
      anchor: '    atkTicketRelease(e);e.alive=false;G.kills++;G._stageKills=(G._stageKills||0)+1;_regKill(e);_petOnKill(e);',
      text: '    atkTicketRelease(e);e.alive=false;if(!_bossWillRevive){G.kills++;G._stageKills=(G._stageKills||0)+1;_petOnKill(e);}_regKill(e); // [BOSS-REV-FIX] 킬수/펫 최종1회(부활 예정 skip); e.alive=false·_regKill(보스 제외)은 항상',
    },
    // E. 콤보 — 일반몹 else는 _bossWillRevive=false라 항상 실행
    {
      id: 'E-combo-open', type: 'insertBefore',
      anchor: '    G.combo++;',
      text: '    if(!_bossWillRevive){ // [BOSS-REV-FIX] 콤보 최종1회(부활 예정 skip)',
    },
    {
      id: 'E-combo-close', type: 'insertAfter',
      anchor: '    else{G.comboTimer=Math.min(1200,G.comboTimer+60)} // 일반: +1초, 최대 20초',
      text: GUARD_CLOSE,
    },
    // F. 재료/물약/장비drop/EXP/자동저장 등 연출 아래 전부 — 부활 예정이면 return
    //    (연출: deathFX/corpse/gore/"부활 판정 중"은 위에서 이미 수행. finally의 _shBufI--는 return에도 실행)
    {
      id: 'F-reward-return', type: 'insertBefore',
      anchor: '    // ═══ 지옥의 잔해 드롭 ═══',
      text: '    if(_bossWillRevive)return; // [BOSS-REV-FIX] 부활 예정: 아래 debris/etype효과/재료/물약/장비drop/EXP/자동저장 생략 — 1차 return과 대칭. 비보스는 통과(_bossWillRevive=false)',
    },
  ];
}

// ── 순수 헬퍼: 라인 경계(앞 '\n'/시작, 뒤 '\n'/'\r'/끝)로 둘러싸인 앵커 위치 전부 ──
function lineOccurrences(src, line) {
  const out = [];
  let from = 0;
  for (;;) {
    const i = src.indexOf(line, from);
    if (i < 0) break;
    const before = i === 0 || src[i - 1] === '\n';
    const end = i + line.length;
    const after = end >= src.length || src[end] === '\n' || src[end] === '\r';
    if (before && after) out.push(i);
    from = i + Math.max(1, line.length);
  }
  return out;
}

// ── 순수 검증: 각 앵커가 정확히 1회 존재 + resolve 핀 존재 ──
export function verify(source, opts = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (source.length === 0) throw new RangeError('source is empty');
  const ops = buildOps();
  const checks = ops.map((op) => {
    const n = lineOccurrences(source, op.anchor).length;
    return { id: op.id, type: op.type, count: n, ok: n === 1 };
  });
  const resolvePin = source.includes(RESOLVE_PIN);
  // [0324] 전체 SHA 핀(옵션): {sourceSha} 주어지면 EXPECTED_SHA와 대조. 미지정=null(미검, ok 영향 없음).
  const sha = (opts.sourceSha != null) ? checkSha(opts.sourceSha) : null;
  const shaOk = sha == null ? true : sha.ok;
  const ok = checks.every((c) => c.ok) && resolvePin && shaOk;
  return { ok, resolvePin, sha, checks };
}

// ── 순수 적용: 패치된 source **문자열** 반환(원본 불변). 앵커 비유일 시 throw ──
export function apply(source, opts = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (source.length === 0) throw new RangeError('source is empty');
  // [0324] 전체 SHA 핀 거부: {sourceSha} 주어지고 불일치면 적용 거부(다른 HEAD/편집본).
  if (opts.sourceSha != null) {
    const sha = checkSha(opts.sourceSha);
    if (!sha.ok) throw new Error('SHA pin mismatch — expected ' + sha.expected + ' got ' + sha.got + ' (적용 거부)');
  }
  if (!source.includes(RESOLVE_PIN)) {
    throw new Error('resolve pin not found — source가 핀 SHA와 다름: ' + RESOLVE_PIN);
  }
  const ops = buildOps();
  // index 해석 후 뒤에서 앞으로 적용(인덱스 안정)
  const resolved = ops.map((op) => {
    const occ = lineOccurrences(source, op.anchor);
    if (occ.length !== 1) {
      throw new Error(`anchor not unique (${occ.length}) for ${op.id}: ${op.anchor.slice(0, 48)}…`);
    }
    return { op, index: occ[0] };
  }).sort((a, b) => b.index - a.index);

  let out = source;
  for (const { op, index } of resolved) {
    const end = index + op.anchor.length;
    if (op.type === 'replaceLine') {
      out = out.slice(0, index) + op.text + out.slice(end);
    } else if (op.type === 'insertAfter') {
      out = out.slice(0, end) + '\n' + op.text + out.slice(end);
    } else if (op.type === 'insertBefore') {
      out = out.slice(0, index) + op.text + '\n' + out.slice(index);
    } else {
      throw new Error('unknown op type: ' + op.type);
    }
  }
  return out;
}

// ── 순수 요약(연출/보존 대상은 패치 밖임을 명시) ──
export const CONTRACT = Object.freeze({
  guarded: ['on-kill affixes(killSlayer/onKillHeal/Mana/Stam/shieldOnKill/onKillSpeed)',
            '_uMaceExplode', 'G.kills', 'G._stageKills', '_petOnKill', 'G.combo/comboTimer',
            '재료(G.mats)·물약·rollDrop(장비)·addExp(EXP)·dbSaveNow(F return 아래 전부)'],
  alwaysRun: ['atkTicketRelease', 'e.alive=false', '_regKill(보스 early-return)', 'deathFX',
              'corpse(_addCorpse)', 'gore', '_addDeathImpact', '"부활 판정 중" 텍스트',
              '문지기(_isGateGuard,!e.ib)', 'checkRooms(매 프레임 재실행)'],
  preserved: ['일반몹(전부: _bossWillRevive=false)', 'EXP/drop/재료 최종1회', '2_3 값 무변'],
  // [0324] EXP/drop/save/revive/retry 보존 조건 명시
  timingPreserved: [
    'EXP(addExp 41713-14)·drop(rollDrop 41710)·재료(G.mats 41682/41703/41707): 최종 사망 사이클 1회 지급 — 부활 미발생(=기존 단일처치) 시 기존과 동일, 부활 예정 사이클만 F-return으로 skip.',
    'revive: 1차 즉시부활(41258 return)·2차 countdown(_reviveTimer=180 arm)·resolve(33270 roll<chance) 공식/타이밍/포인트 소모 전부 무변. 본 패치는 "보상 지급 여부"만 분기, 부활 판정 자체 불변.',
    'retry: retryBtn 분기(_retryDruidFinale / _preArenaBackup / field-retry)와 _capture/_restoreBossFieldState 필드 진행 보존은 hurtE 밖 — 본 패치 미접촉.',
    'save: dbSaveNow(G.kills%10===0, 41716)는 F-return 아래 — 부활 예정 사이클만 skip, 최종/비보스는 기존대로. 세이브 스키마 변경 0.',
    'corpse/deathFX/gate/문지기: 가드 위(또는 !e.ib)라 매 사망 유지.',
  ],
  hold: '의미가 다른 변경은 root 결정 전 HOLD — 지급 시점을 완전사망 resolve(33295)로 이전, 보상 타이밍 재설계, native 보스/본편 game.html patch. 본 후보는 "반복 skip + 최종1회 유지"만 구현하며 새 보상 타이밍 채택 0.',
});

// 직접 실행(IO는 여기서만): node boss-revive-kill-tail.candidate.mjs <game.html경로>
// → verify 결과 + 패치본 byte/sha 출력. 파일 생성 없음.
const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const path = process.argv[2];
  if (!path) { console.error('usage: node boss-revive-kill-tail.candidate.mjs <game.html>'); process.exitCode = 2; }
  else {
    const fs = await import('node:fs');
    const crypto = await import('node:crypto');
    const src = fs.readFileSync(path, 'utf8');
    const srcSha = crypto.createHash('sha256').update(src, 'utf8').digest('hex');
    const v = verify(src, { sourceSha: srcSha });
    console.log('subject:', SOURCE.subject, '| resolvePin:', v.resolvePin);
    console.log('fullSHA:', v.sha ? (v.sha.ok ? 'MATCH' : 'MISMATCH ' + v.sha.got) : 'n/a', '(expected ' + EXPECTED_SHA.slice(0, 16) + '…)');
    for (const c of v.checks) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.id} [${c.type}] x${c.count}`);
    if (v.ok) {
      const patched = apply(src, { sourceSha: srcSha });
      const bytes = Buffer.byteLength(patched, 'utf8');
      const sha = crypto.createHash('sha256').update(patched, 'utf8').digest('hex');
      console.log(`verify: PASS | patched bytes=${bytes} sha256=${sha}`);
      console.log(`delta bytes=${bytes - Buffer.byteLength(src, 'utf8')} (삽입/치환만)`);
    } else {
      console.log('verify: FAIL — 앵커/SHA/핀 불일치, apply 보류');
      process.exitCode = 1;
    }
    // [0324] 실패 입력/핀 거부 검증 (파일 생성 없음, stdout만)
    const probe = (name, fn) => { let rej = false, msg = ''; try { fn(); } catch (e) { rej = true; msg = e.message.slice(0, 40); } console.log(`  ${rej ? 'REJECT-OK' : 'NOT-REJECTED'} ${name}${msg ? ' :: ' + msg : ''}`); };
    console.log('failure-input probes:');
    probe('wrong-sha', () => apply(src, { sourceSha: '0'.repeat(64) }));
    probe('empty-source', () => apply(''));
    probe('non-string', () => apply(12345));
    probe('missing-resolve-pin', () => apply(src.split(RESOLVE_PIN).join('(x)')));
    probe('truncated(anchor-gone)', () => apply(src.slice(0, 1000)));
  }
}

export default { SOURCE, RESOLVE_PIN, buildOps, verify, apply, CONTRACT };
