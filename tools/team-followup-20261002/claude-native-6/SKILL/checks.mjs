// SKILL (claude-native-6) — mortar 입력 수명 경계 하니스
// 목적: claude-provider의 "입력 수명 후속검토"(논리 반례) 인수 → 실제 소스 함수로
//       결함 경계 "한 건"(MM-B1 blur 즉시 유령발사)을 Node runtime에서 재현/판정.
// 범위: 기존 142 비용검사 재실행 아님. MP수치/합체/RNG/취소·자원 정책 변경 0.
//       실제 game.html 소스 슬라이스만 verbatim 복사(아래 SRC_* 참조). 전체 게임 사본 X.
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 소스 출처(실제 Read한 행, game.html == game-easy-test.html 동일 확인):
//  - _clearHeldInput : game.html 12877-12885 / game-easy-test.html 12273-12281 (byte-identical)
//  - blur/visibility : game.html 12886-12887 / game-easy-test.html 12282-12283
//  - mortar 조준 블록: game.html 35217-35228 / game-easy-test.html 34022-34033 (byte-identical)
//  - mortar 진입/취소: game.html 12456-12457

import crypto from 'node:crypto';

// ── 최소 fixture (실제 게임 전역의 축소판) ─────────────────────────────
// 실제 전역 그릇 모양만 복제. 값/정책은 건드리지 않음.
let K, KH, MB, MBjust;
let _dashHold, _dashHoldF, _dashTier, _cutSkipHolding, _cutSkipHold;
let P;
const sp = 1;            // 프레임 속도 스칼라(update 인자). 수치 정책 아님, 1프레임 기준.
let fireCalls = [];      // fireMaliceMortar 도달성 프로브(비용 재검사 아님 — 호출 여부만 기록)

function resetWorld(){
  K = Object.create(null);
  KH = Object.create(null);
  MB = [false,false,false];
  MBjust = [false,false,false];
  _dashHold = false; _dashHoldF = 0; _dashTier = 0;
  _cutSkipHolding = false; _cutSkipHold = 0;
  P = { x:0, y:0, facing:0, _mmAiming:false, _mmAimKey:null, _mmDist:150, _mmCharging:false };
  fireCalls = [];
}

// fireMaliceMortar: 도달성 프로브. 실제 함수는 즉시 useMp('mortar')/G._mmBomb 생성(비용은
// 기존 142검사 소관). 여기서는 "발사 분기 도달" 사실만 기록(정책/수치 미변경).
function fireMaliceMortar(wx, wy){ fireCalls.push({ wx, wy }); }

// ── 실제 소스 슬라이스 (verbatim) ────────────────────────────────────
// SRC_CLEAR: game.html 12877-12885 본문 그대로.
function _clearHeldInput(){
  for(const k in K)K[k]=false;
  for(const k in KH)KH[k]=false;
  for(const b in MB)MB[b]=false;
  for(const b in MBjust)MBjust[b]=false;
  _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
  if(typeof P!=='undefined'&&P)P._beamHold=false;
  _cutSkipHolding=false;_cutSkipHold=0;
}

// SRC_AIM: game.html 35217-35228 조준 블록 그대로(한 update 프레임 분).
function mortarAimFrame(){
  if(P._mmAiming){
    const _mmK=P._mmAimKey;
    if(_mmK&&KH[_mmK]){P._mmCharging=true;P._mmDist=Math.min((P._mmDist||150)+24*sp,1000)}
    const _mmRel=P._mmCharging&&_mmK&&!KH[_mmK];
    if(MBjust[2]||K['Escape']){P._mmAiming=false;P._mmCharging=false;MBjust[2]=false;K['Escape']=false}
    else if(MBjust[0]||_mmRel){
      MBjust[0]=false;
      const _mmwx=P.x+Math.cos(P.facing)*(P._mmDist||150);
      const _mmwy=P.y+Math.sin(P.facing)*(P._mmDist||150);
      fireMaliceMortar(_mmwx,_mmwy);
      P._mmCharging=false;
    }
  }
}

// SRC_ENTER: game.html 12457 — 조준 진입(키 홀드 시작). 수치(150) 그대로.
function enterAim(keyCode){ P._mmAiming=true; P._mmAimKey=keyCode; P._mmDist=150; P._mmCharging=false; KH[keyCode]=true; }

// 슬라이스 무결성 해시(이 파일에 박힌 소스가 변형되지 않았음을 자기검증)
const SRC_CLEAR = _clearHeldInput.toString();
const SRC_AIM = mortarAimFrame.toString();
function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }

// ── 시나리오 ────────────────────────────────────────────────────────
const results = [];
function rec(id, name, input, expected, observed, verdict){
  results.push({ id, name, input, expected, observed, verdict });
}

// C0 대조(정상 릴리즈): 충전 후 사용자가 직접 keyup → 발사 1회(정상). 하니스 로직 진위 확인.
(function C0(){
  resetWorld();
  enterAim('KeyR');       // 조준 진입 + 키 홀드
  mortarAimFrame();       // 1프레임 홀드 → _mmCharging=true
  const charged = P._mmCharging===true;
  KH['KeyR']=false;       // 사용자 정상 keyup
  mortarAimFrame();       // release 프레임 → 발사
  rec('C0','정상 릴리즈(대조)',
    '조준+홀드1F 후 사용자 keyup',
    '발사 1회(정상 release)',
    `_mmCharging(홀드후)=${charged}, fireCalls=${fireCalls.length}, _mmAiming(after)=${P._mmAiming}`,
    (charged && fireCalls.length===1) ? 'PASS(대조 정상)' : 'FAIL(대조 비정상)');
})();

// MM-B1 (결함 경계 재현): 충전 중 창 blur → _clearHeldInput(KH만 비움, _mmCharging 잔존)
//   → 다음 프레임 _mmRel=true → fireMaliceMortar 호출(유령 발사). loop는 hidden 아님(계속).
(function MM_B1(){
  resetWorld();
  enterAim('KeyR');       // 조준 진입 + 키 홀드
  mortarAimFrame();       // 1프레임 홀드 → _mmCharging=true
  const chargedBefore = P._mmCharging===true;
  const khBefore = KH['KeyR']===true;
  // --- 창 blur 발생: 등록 핸들러 addEventListener('blur',_clearHeldInput) 그대로 호출 ---
  _clearHeldInput();
  const khAfterClear = KH['KeyR']===true;           // false 기대(KH 비움)
  const chargingAfterClear = P._mmCharging===true;  // true 잔존이 결함의 핵심
  const aimingAfterClear = P._mmAiming===true;      // true 잔존
  // --- blur 직후 첫 update 프레임(탭 visible → 루프 계속) ---
  mortarAimFrame();
  const fired = fireCalls.length;
  rec('MM-B1','blur 중 충전 → 복귀 프레임 유령발사',
    '충전(_mmCharging=true,KH키=true) 상태에서 window blur→_clearHeldInput→다음 프레임',
    '기대: blur 시 조준/충전 해제·무발사 (fireCalls=0)',
    `chargedBefore=${chargedBefore}, khBefore=${khBefore}, `+
    `KH[키]after=${khAfterClear}, _mmCharging after=${chargingAfterClear}, _mmAiming after=${aimingAfterClear}, `+
    `fireCalls=${fired}`,
    // 결함 재현 = blur로 KH는 비었는데 _mmCharging 잔존 → 유령발사 발생
    (chargedBefore && !khAfterClear && chargingAfterClear && fired===1)
      ? 'FAIL(결함 재현: 유령발사 도달)'
      : 'UNKNOWN(재현 실패)');
})();

// MM-B1b (취소 무력화 확인): blur 직후엔 Escape/RMB 취소도 _clearHeldInput가 K/MBjust를
//   비워 사라지므로, 취소 입력이 유령발사를 막지 못함(같은 결함의 파생 — 정보용).
(function MM_B1b(){
  resetWorld();
  enterAim('KeyR');
  mortarAimFrame();                 // _mmCharging=true
  K['Escape']=true; MBjust[2]=true; // 유저가 취소 의도 입력
  _clearHeldInput();                // blur가 K/MBjust까지 비움 → 취소 소실
  const escAfter = K['Escape']===true, rmbAfter = MBjust[2]===true;
  mortarAimFrame();                 // 취소 사라져 발사 분기로
  rec('MM-B1b','취소입력이 blur로 소실 → 취소가 발사 못 막음',
    '충전 중 Escape/RMB 취소 입력 + 동시 blur',
    '기대: 취소가 발사를 차단(fireCalls=0)',
    `Escape after clear=${escAfter}, MBjust[2] after=${rmbAfter}, fireCalls=${fireCalls.length}`,
    (!escAfter && !rmbAfter && fireCalls.length===1)
      ? 'FAIL(취소 무력화 확인)'
      : 'UNKNOWN');
})();

// ── 출력 ────────────────────────────────────────────────────────────
const summary = {
  node: process.version,
  srcHashes: { SRC_CLEAR_sha256: sha(SRC_CLEAR), SRC_AIM_sha256: sha(SRC_AIM) },
  results
};
console.log(JSON.stringify(summary, null, 2));
