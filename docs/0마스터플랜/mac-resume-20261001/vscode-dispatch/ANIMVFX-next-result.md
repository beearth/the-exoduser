# ANIM-HIGHHZ-LIFETIME-GATE — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-478c-43aa-8c6f-766a02270432`의 다음 한 건. 작성 2026-10-01.
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`.
- 수신→첫 Read→명령 착수→완료 구분: `ANIMVFX-next-receipt.json`.
- **성격: 고주사율(≥90Hz)·무표본·수명종료 계약을 raw로 판정하는 독립 게이트 완성 + 부정회귀 자가검사. 게임/브라우저 실행 0, 실제 고주사율 미실측.**
- 중복 확인: `ANIMVFX-next-result.md`/receipt 부재 확인 후 신규 착수(진행중 중복 없음).

## 1. 산출물 (ANIMVFX 소유 경로)

| 산출물 | 경로 | 역할 |
|---|---|---|
| **고주사율·수명종료 게이트** | `tools/team-followup-20261001/ANIMVFX/animvfx_highhz_lifetime_gate.mjs` | 플래시 에피소드 추출 + 8계약 판정 + 부정회귀 fixture 11종 |
| (선행) 관측 프로브 | `tools/team-followup-20261001/ANIMVFX/animvfx_gl_probe.js` | install/dispose·`_ensGLMode===1`·게이트 |
| (선행) 4상태 분류기 | `tools/team-followup-20261001/ANIMVFX/animvfx_gl_validator.mjs` | GL없음/contextLost/표본0/SAMPLED |

## 2. 계약(8종) + 판정 어휘
판정 어휘는 **PASS / FAIL / REJECT / UNKNOWN**. 핵심 규칙: **근거 부족(표본0·고주사율 미실측)은 절대 PASS로 승격하지 않고 UNKNOWN**, 입력 부적격(시계손상·정지오염·배경)은 **REJECT**, 회귀는 **FAIL**.

| # | 계약 | 내용 | 부족 시 |
|---|---|---|---|
| C1 | 표본수 | peak→0 사이 ≥3표본·≥1감소 | UNKNOWN |
| C2 | 시계무결 | now/updates/draws 결측·역행 금지 | REJECT |
| C3 | 일시정지 | paused/runtimeGate=false 중 감쇠 금지, 전구간 정지 | REJECT / UNKNOWN |
| C4 | 배경 | hidden/비가시 구간은 벽시계 수명 무효 | REJECT(벽시계), updateTick만 유효 |
| C5 | 감쇠모델 | **update-tick 구동(주사율 독립)** vs **draw-frame 구동(회귀)** | 구분불가 UNKNOWN |
| C6 | 수명종료 | hf가 0 도달·유지(자연감쇠/사망리셋) | 미종료 FAIL |
| C7 | 고주사율 | 에피소드 drawHz≥90에서만 실수명 인증 | **UNKNOWN(실제 고주사율 미실측)** |
| C8 | 부활/구울 | 동일객체 부활 첫 draw hf0 / 새 구울 분리 | 잔상 FAIL |

감쇠모델 판별 원리: 감소 횟수가 **update 틱수와 일치**하면 주사율 독립(PASS), **draw 프레임수와 일치**하면 주사율 의존 회귀(FAIL). 저주사율(draw<update)·고주사율(draw>update) 어느 쪽이든 "일치하는 카운터"로 구동원을 특정한다.

## 3. 부정회귀 자가검사 — 11/11 (exit 0)
`node animvfx_highhz_lifetime_gate.mjs`

| fixture | 기대 | 결과 |
|---|---|---|
| update-tick 구동, 저주사율 30Hz | 감쇠 PASS·고주사율 UNKNOWN | ✅ |
| update-tick 구동, 고주사율 240Hz | 감쇠 PASS·고주사율 **PASS** | ✅ |
| **draw-frame 구동, 240Hz(회귀)** | FAIL | ✅ |
| 무표본(flash-start만) | UNKNOWN | ✅ |
| 시계역행(updates 감소) | REJECT | ✅ |
| 시계결측(now null) | REJECT | ✅ |
| 정지 중 감쇠(paused=true) | REJECT | ✅ |
| 배경(hidden=true) 포함 | REJECT | ✅ |
| 미종료(hf≠0 지속) | FAIL | ✅ |
| 부활 잔상(first-draw hf≠0) | revive FAIL | ✅ |
| 새 구울(동일객체 아님) | 분리(부활 NO_VERDICT, 구울 집계) | ✅ |

## 4. 실제 R raw 판정표 (게임 실행 없이 — 읽기만)
`node animvfx_highhz_lifetime_gate.mjs gl-revive-valid.json gl-revive-60.json gl-revive-raw.json`

| raw | 에피소드 | 감쇠모델 | 수명종료 | 고주사율 | 부활/구울 | 전체 |
|---|---|---|---|---|---|---|
| gl-revive-valid(무제한) | 8 (비치명 4 + 사망리셋 4) | 비치명 4건 **PASS(update-tick 구동: 6감소=6틱, draw 3프레임)** / 사망리셋 UNKNOWN(1스텝) | PASS(natural-decay/death-reset) | **UNKNOWN**(drawHz≈37.9<90) | PASS(동일객체 3·구울 1) | **UNKNOWN(고주사율 미실측)** |
| gl-revive-60(60fps) | 8 | 비치명 4건 PASS / 사망리셋 UNKNOWN | PASS | UNKNOWN(natural-decay drawHz≈36.3<90) | PASS(동일객체 2·구울 2) | UNKNOWN |
| gl-revive-raw(무효표본) | 0 | — | — | — | NO_VERDICT | UNKNOWN(에피소드 없음) |

### 핵심 발견 (실제 근거)
1. **비치명 플래시 감쇠는 update-tick 구동(주사율 독립)임을 저주사율 raw로 확인**: 비치명 에피소드가 hf 6→0을 **6 update 틱**에 소비하는데 같은 구간 **draw는 3프레임뿐**이다. draw 구동이었다면 3감소에 그쳐야 한다. 즉 §11 수정(감쇠를 고정스텝 update로 이동)이 실제 raw에서 동작한다.
2. **그러나 실제 ≥90Hz 수명은 미실측**: 모든 자연감쇠 에피소드의 draw는 ~36–38Hz다. 고주사율 디스플레이에서 수명이 100ms로 유지되는지는 raw가 없어 **PASS로 승격하지 않고 UNKNOWN**으로 남긴다.
3. **사망리셋 에피소드는 1스텝(hf 6→0)이라 감쇠모델 구분 불가**(UNKNOWN). 256Hz로 찍힌 사망리셋도 수명 PASS로 승격하지 않는다(단일 스텝은 수명 측정이 아님).
4. **부활/구울 분리 유지**: 동일객체 부활(revive-observed/first-draw-after-revive, 첫 draw hf0) PASS, 새 구울(ghoul) 별도 집계·판정 제외.

## 5. 경계·불변 (과대해석 금지)
- **실제 고주사율(≥90Hz) GL 플래시 수명은 이번에도 미실측**(명시). 저주사율 raw로 감쇠모델만 확인.
- game.html·easy·총괄MD·test 공용경로·타팀 파일 **미접촉**. game.html 해시 변동은 타팀 워킹트리 WIP이며 내 변경 아님.
- 게임/서버/브라우저/청취/이미지생성/인코딩/대형빌드/새세션/PC/Git 조작 0. `node --check`·fixture·raw 분류의 작은 검사만.
- 본 게이트는 raw 판정기일 뿐 생산 코드 변경이 아니다. hurtE·death/alive·보상·시체·쿨다운 불변.

## 6. 남은 잔여 게이트 (인계)
- **고주사율(≥90Hz) 실화면 raw 확보**: QA/총괄이 정규 GL 풀부팅 + 120/240Hz 디스플레이에서 `animvfx_gl_probe.js`를 install→피격/사망/부활→dispose로 돌려 raw를 남기면, 본 게이트가 자동으로 C7 고주사율 수명 PASS/FAIL을 판정한다(현재는 UNKNOWN).
- **자연 조우·사용자 공격 입력** 기반 수명(현 raw는 fixture hurtE).
- **부활 잔상 0의 정규 GL 실화면 캡처**(raw상 hf0 확인했으나 실화면 아님), 가독성(가림) 판정은 §11 발견 A/B 후속.
- docs 반영 후보(공용 문서라 직접 편집 금지 — 총괄 통합용): `ANIMATION_VFX_TEAM_MASTER.md` §11 아래
  > "ANIM-HIGHHZ-LIFETIME-GATE: 수명종료·감쇠모델(update-tick vs draw-frame)·고주사율(≥90Hz)·무표본·시계/정지/배경·부활/구울 계약 게이트(`tools/team-followup-20261001/ANIMVFX/animvfx_highhz_lifetime_gate.mjs`). 부정회귀 11/11. 실 raw 3건: 비치명 감쇠 update-tick 구동 PASS, 고주사율 수명은 미실측 UNKNOWN."

## 7. 소유권 밖 다음 작업
실행하지 않고 인계: 고주사율 실화면 raw 캡처(QA 단독), 공용 팀 문서 통합·원격 체크포인트(총괄).
