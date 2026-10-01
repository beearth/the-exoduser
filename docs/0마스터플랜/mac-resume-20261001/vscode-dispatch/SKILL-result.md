# Mac SKILL — SKILL-03-OBSERVER-FIX 결과

작업 ID: `SKILL-03-OBSERVER-FIX` · 제목: iceStorm 설치·취소 관측 후보 보강
HEAD `30a204a7aa348a88b90bdc922862c610a7da938f` · 2026-10-01 · 터미널 6 / claude-code / claude-opus-4-8

## 상태와 소유 범위

원본 후보(`candidates/SKILL.js`)와 `검증결과.md`·`validation-manifest.json(SKILL)`의 실행 전 게이트를 반영한 **안전화 관측기 독립 사본**과 **mock 자가검사**를 작성·실행 완료했다. 구문 검사 PASS, 자가검사 **38/38 PASS**(exit0). 자원 공식·전투·생산 코드는 수정하지 않았다(game.html 무변경). 실브라우저 입력·게임 실행·덤프 수집은 QA 종료 인계 전 보류 — 이 부분은 **미완료**로 구분한다.

쓰기는 SKILL 소유 경로(`tools/team-followup-20261001/SKILL/`, 본 `SKILL-result.md`·`SKILL-receipt.json`)에만 했다. 새 팀/세션·Git add/commit/push·checkout/reset·게임/브라우저/서버 실행·이미지/유료 서비스·빌드·SOUND 변경은 **0**. 읽은 문서: `AGENTS.md`, `CLAUDE.md`, `TEAM_CONTINUATION_POLICY_20261001.md`, `SKILL03_설치확정_자원검수_20261001.md`, `teams/SKILL.md`, `검증결과.md`, `validation-manifest.json(SKILL)`, `game.html` 입력/확정 라우트.

## 산출물

| 경로 | 내용 |
|---|---|
| `tools/team-followup-20261001/SKILL/ice-cancel-probe.safe.js` | 안전화 관측기(브라우저 콘솔 붙여넣기 + node 로드 양용). `IceCancelProbe.install/createProbe` 제공 |
| `tools/team-followup-20261001/SKILL/ice-cancel-probe.selftest.mjs` | mock 자가검사 7묶음(T1~T7), 총 38 assertion |
| `tools/team-followup-20261001/SKILL/_source-candidate-SKILL.js` | 원본 후보 읽기 전용 사본(sha256 `aeded941…` 일치) |
| `tools/team-followup-20261001/SKILL/_source-검증결과.md` | 원본 검증결과 읽기 전용 사본 |

원본은 `docs/0마스터플랜/mac-resume-20261001/r-input-evidence/evidence.zip` 내부라 스크래치패드로 추출해 대조했고, 추출 후보 sha256이 manifest의 `candidate_sha256`과 일치함을 확인했다.

## 반영한 게이트 → 구현 매핑

| 게이트(검증결과.md / manifest static_review) | 본 사본의 반영 | 검사 |
|---|---|---|
| G1 중복 설치 시 이전 핸들 손실(원본 IIFE 즉시 재대입 `:1`, dispose `:53`) | `install()`이 기존 `win.__iceCancelProbe.dispose('reinstall')` 선행 호출. dispose가 rAF·리스너3개 해제 + 네임스페이스 비움 | T1, T2 |
| G2 flags 빈 배열 ≠ 정상 PASS(무관측/미장착/미설치도 공백) | `verdict()`에 **양성대조**(정상 설치 1회 실제 포착) 필수화. 미포착이면 `UNDETERMINED` | T3, T4 |
| G3 유효 표본수 게이트화 / snap 실패 null 무시 | 구간(mark)별 `validSamples`/`nullSamples` 집계. 표본0 구간은 `UNDETERMINED`(PASS 금지) | T3 |
| G4 전체 `P.mp` 감소는 다른 MP 소비도 포착 | 설치 확정 서명 = (신규 iceStorm 존) ∧ (`dStk===-1`) ∧ (`dMp===-40`). 설치 없는 MP 감소는 `OTHER_MP_SPEND`로 분리 | T4, T5 |
| G5 존 개수 차이(net)는 만료·신규가 상쇄 | 존 **객체 식별**(Set/WeakSet)로 신규 설치와 만료를 각각 집계. 순증만 보지 않음 | T6 |
| G6 `aimTransitions`가 aim 필드 있는 모든 표본 반환 | 직전 대비 aim이 **실제로 바뀐** 프레임만 반환 | (코드), T4 |
| (추가) iceStorm 고유 자원(스택) 설치 없이 감소 = 누수 | `RESIDUAL_STK_SPEND?` flag → `verdict SUSPECT` | T7 |

## 검증 (명령·exit·원자료)

```
node --check tools/team-followup-20261001/SKILL/ice-cancel-probe.safe.js   → SYNTAX OK (exit0)
node tools/team-followup-20261001/SKILL/ice-cancel-probe.selftest.mjs      → 38 PASS / 0 FAIL (exit0)
shasum -a 256 _source-candidate-SKILL.js → aeded94120a1186da3983a4975efd06ed7c610644bab2ba0c3a11f0a4f756b1f (manifest 일치)
node --version → v24.15.0
```

mock 자가검사 커버리지: T1 리스너·rAF 설치/정리 대칭, T2 재설치 시 이전 dispose(리스너 6 누수 없이 3 유지·add2/remove1), T3 유효표본0→UNDETERMINED, T4 양성대조 포착+정상 설치 PASS, T5 설치 없는 MP 감소=OTHER_MP_SPEND 분리, T6 만료↔신규 상쇄(net0)에서 신규 설치 식별, T7 잔류 스택 소모→SUSPECT.

## 소스 결선·SSOT 대조

- 입력 라우트: `MBjust` def `game.html:12298`, 프레임 flush `:12765`(엣지 1프레임만 유효), mousedown set `:12798`, `weapon:'mouse0'` `:6061`(취소 후 LMB는 무기공격 라우트).
- iceStorm 조준/취소/설치: `game.html:34987–35014`. 취소 `MBjust[2]||K['Escape']`(`:34993`), 설치 `MBjust[0]`(`:34994`) → 중복존/스택0/MP<40 검사 후 `P.mp-=40`(`:35006`), `G._fireZones.push({…type:'iceStorm',maxT:600})`(`:35007`), `P._isStk--`(`:35014`).
- SSOT 대조: `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:407` iceStorm **MP40 / 2스택(Lv10→3) / 1500f 충전 / 10초(600f) 지속**. 관측기 상수(`ICE_MP=40`, `ICE_STK=1`/설치, 존 `maxT=600`)와 디스크 코드가 일치 → **docs 수치 정정 불필요**. game.html 무변경이므로 추가 docs 동기화 의무 없음.

## 실행하지 않은 항목 / 남은 게이트 (미완료)

- **실브라우저 입력·게임 실행·덤프 수집**: 수행 안 함. QA 실측 종료 인계 전 새 게임 인스턴스 미실행(AGENTS/정책 준수).
- **무기공격 라우트 발동 확정**: 관측기 1차 신호 아님 — 취소 후 LMB가 공격으로만 소비됐는지 공격 상태 필드로 **2차 확인 필요**.
- **rAF↔시뮬레이션 tick 주기 차이**: 같은 프레임 RMB·LMB 경합은 추가 tick 근거 필요(관측기 `limitations`에 명시).
- **패드 경로·합체 holyIce 자동 존·본편 카메라 실플레이**: 범위 밖.
- 구문/정적/mock PASS를 게임 기능 PASS로 확대하지 않는다.

## 다음 인계

QA 종료 인계 후, 총괄/QA가 실게임 콘솔에서 `IceCancelProbe.install()` → `산출2` 입력 순서 명세(A 베이스라인·B 정상 설치 양성대조·C~F 취소 경계)대로 `mark()` 진행 후 `dump()`/`verdict()`로 수집. 양성대조가 포착돼야 취소 구간 "누수 없음"을 신뢰할 수 있다. 소유권 밖(game.html 수정·실측)은 실행하지 않고 인계한다.
