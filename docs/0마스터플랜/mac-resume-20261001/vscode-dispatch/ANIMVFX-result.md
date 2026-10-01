# ANIMVFX-GL-PROBE-FIX — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 작성 2026-10-01.
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f` (배정과 일치 확인).
- 수신·착수 기록: `ANIMVFX-receipt.json`.
- **성격: R-input 후보(`candidates/ANIMVFX.js`)의 지적 사항을 반영한 독립 GL 프로브 사본 구현 + raw 정적/mock 분류 검증기. 새 실화면 측정 아님.**
- 소유 쓰기 경로: `tools/team-followup-20261001/ANIMVFX/`, 본 `ANIMVFX-result.md`, `ANIMVFX-receipt.json`만. 공용/타 팀 파일 미편집.

## 0. 원자료 소재 메모
배정의 `r-input-20261001/candidates/ANIMVFX.js 및 검증결과.md`는 저장소에 평문 경로로 없고, `docs/0마스터플랜/mac-resume-20261001/r-input-evidence/evidence.zip` 안에 `candidates/ANIMVFX.js`·`candidates/검증결과.md`·`gl-revive-raw.json`·`gl-revive-valid.json`·`gl-revive-60.json`·`gl-gate.json`으로 들어 있다. zip은 읽기만 하고 scratchpad에 추출해 대조했다(저장소 파일 변경 0). 최신 R/GL 서술은 `R-입력과-GL-후속검수.md`를 함께 읽었다.

## 1. 반영한 지적 (검증결과.md ANIMVFX 게이트)
원본 후보의 지적은 세 가지였다. 전부 독립 사본에 반영했다.

| 지적 | 원본 후보 | 수정본(`animvfx_gl_probe.js`) |
|---|---|---|
| 임시 WebGL2 컨텍스트 생성·참조 폐기(`:20`), 정리 없음 | `glAvailable=!!document.createElement('canvas').getContext('webgl2')` | **삭제.** 일회용 GL 미생성. GL 존재는 게임 실제 백엔드(`GL`/`_useGL`/`_useGPU`)로만 판정. capability 캔버스 자체를 없애 정리 문제를 원천 제거 |
| `flashPathReady`에 실제 플래시 모드·게임 진행/일시정지 미반영 | 파이프라인 초기화·가시성만 봄 | per-mob **`e._ensGLMode===1`** 집계(`enemyGLSample`) 추가 + **실행/일시정지 게이트** `G.on===true && G.paused===false`(`gates.runGate`)를 `flashPathReady`에 포함 |
| GL null 구분(contextLost=null) | 타당 | 유지. GL 미존재 시 `contextLost:null`(가짜 true 금지), `contextLostSource`로 측정불가 사유 명시 |

추가로 배정 요구인 **정리/재설치**(`install`/`dispose`, 중복설치 시 기존 dispose 선행·원본 draw/update 복원·`window[NS]` 가드)와, **GL없음·contextLost·표본0·동일 객체 부활/새 구울 구분** 기록 스키마를 구현했다.

## 2. 산출물 (ANIMVFX 소유 경로)

| 산출물 | 경로 | 역할 |
|---|---|---|
| 독립 GL 프로브 | `tools/team-followup-20261001/ANIMVFX/animvfx_gl_probe.js` | 브라우저 read-gate(스냅샷) + install/dispose 관측기. 임시 GL 생성 제거·`_ensGLMode===1`·실행/일시정지 게이트·정리/재설치. **브라우저 실행은 QA 인계 후** |
| raw 분류 검증기 | `tools/team-followup-20261001/ANIMVFX/animvfx_gl_validator.mjs` | 4상태(GL_ABSENT/CONTEXT_LOST/ZERO_SAMPLE/SAMPLED) 분류, 동일 객체 부활 vs 새 구울 구분, 고주사율 PASS 거부. Node 실행 |
| 검증 매니페스트 | `tools/team-followup-20261001/ANIMVFX/validation-manifest.json` | 명령/exit/해시/미실행 항목 |

## 3. 실행 명령 / exit (게임 실행 없이)

| 명령 | 결과 | exit |
|---|---|---|
| `node --check animvfx_gl_probe.js` | 구문 PASS | 0 |
| `node --check animvfx_gl_validator.mjs` | 구문 PASS | 0 |
| `node animvfx_gl_validator.mjs` (내장 mock 9종 자가검사) | 9/9 기대 분류 일치 | 0 |
| `node animvfx_gl_validator.mjs gl-revive-raw.json` | ZERO_SAMPLE · drawHz≈34(low) · 부활 NO_VERDICT | 0 |
| `node animvfx_gl_validator.mjs gl-revive-valid.json` | SAMPLED · 동일객체 부활 3/새 구울 1 · hf0·mode1 PASS · 고주사율 REJECT | 0 |
| `node animvfx_gl_validator.mjs gl-revive-60.json` | SAMPLED · 동일객체 부활 2/새 구울 2 · hf0·mode1 PASS · 고주사율 REJECT | 0 |
| Node | v24.15.0 |  |

## 4. 검증기가 거르는 4상태 (정적/mock)

1. **GL_ABSENT** — `useGL≠true`/백엔드≠webgl2. 이때 `contextLost`는 반드시 `null`(측정불가). **GL 없음인데 `contextLost=true`로 적힌 가짜 레코드는 모순으로 reject**(exit 1 유발). mock: webgpu+null=통과, +가짜 true=비일관 거부.
2. **CONTEXT_LOST** — GL 존재·`contextLost=true`. 수명/부활 판정 안 함.
3. **ZERO_SAMPLE** — after-draw 0 또는 `e._ensGLMode===1` 표본 0 → 부활/수명 **판정 불가(NO_VERDICT)**. 실제 `gl-revive-raw.json`(R 무효 표본: install+after-update만, after-draw 없음)이 여기로 분류됨 — "부활 PASS"로 승격되지 않음.
4. **SAMPLED** — GL 플래시 표본 존재 → 세부 판정.
   - **동일 객체 부활 vs 새 구울**: ① 프로브 event-stream(`same-object-revive` / `new-object-ghoul-candidate`), ② R-input 요약 스키마(`killed[]`/`revived[]`의 `ghoul` 플래그)를 모두 읽는다. `ghoul=false`&`alive:true`&`hf0`&`mode1`만 동일 객체 부활 PASS. **새 구울(신규 객체)은 동일 객체 부활 판정에서 제외**(별도 시각 인수).
   - **부활 잔상**: 동일 객체 부활 첫 after-draw `hf≠0`이면 FAIL(발견 2 미해소 신호).

## 5. 실제 R raw 대조 (검증기 ↔ R 문서 수치 일치)
검증기가 R-input 문서(`R-입력과-GL-후속검수.md` §39~49)의 수작업 표를 **독립 재현**했다.

| raw | 검증기 판정 | R 문서 서술 | 일치 |
|---|---|---|---|
| `gl-revive-raw.json` | ZERO_SAMPLE · drawHz≈34 | "무효 표본"(플레이어 사망 on=false, 타이머 뒤 적중) | ✅ 무효/불충분 |
| `gl-revive-valid.json`(무제한) | 동일객체 부활 3 / 새 구울 1 / 3건 hf0·mode1 | 같은 객체 부활 3·새 구울 1·첫 after-draw hf0·GL 3/3 | ✅ |
| `gl-revive-60.json`(60fps) | 동일객체 부활 2 / 새 구울 2 / 2건 hf0·mode1 | 같은 객체 부활 2·새 구울 2·2/2 | ✅ |

## 6. 30Hz 자료를 고주사율 PASS로 쓰지 않음 (배정 명시 준수)
검증기는 실제 `drawHz`를 레코드 `now` 타임라인과 draw 수로 계산하고, `HIGH_REFRESH_MIN_HZ=90` 미만이면 **고주사율 수명 PASS를 명시적으로 거부(REJECT)**한다. 유효 raw 둘 다 drawHz ≈ 38.8/42.7Hz(세그먼트 창 기준; R 문서의 draw 29.5~31.2Hz와 동일한 "저주사율" 영역)로 **REJECT** 처리됐다 — 비치명 hf 수명 6틱≈100ms가 주사율 독립인지는 고정스텝 update 기준 기대값으로 설명만 하고, 실제 고주사율 적분 PASS는 **고주사율 표본 확보 후로 유보**.

## 7. docs 대조 (rg) 및 정정 필요 여부
- 본 작업은 **게임 코드(game.html) 변경 0** — 읽기전용 프로브 + Node 검증기만 추가. 따라서 수치/공식 정정 의무 없음.
- `rg "_ensGLMode"` → `VFX_구현가이드.md`, `ANIMATION_VFX_TEAM_MASTER.md`, `QA_PERFORMANCE_TEAM_MASTER.md` 등에서 per-mob GL 플래시 게이트로 사용 — 프로브의 `e._ensGLMode===1` 집계와 일치. 전역 `_ensGLMode`(렌더러 레벨 bool)와 per-mob `e._ensGLMode`(0/1)를 프로브가 구분(`glDrawCounters.ensGLModeGlobal` vs `enemyGL.glFlashModeMobs`).
- `ANIMATION_VFX_TEAM_MASTER.md` §9/§11은 "GL 실화면·부활 첫 프레임 재검수 대기"를 이미 명시 — 본 산출물과 모순 없음. **정정 불필요.**
- **docs 보강 후보(총괄 통합 시 반영 — 공용 문서라 본 세션 미편집)**: `ANIMATION_VFX_TEAM_MASTER.md` §11 QA 재캡처 요청 아래에 한 줄 인덱스 추가 후보 —
  > "ANIMVFX-GL-PROBE-FIX: 독립 GL 프로브(임시 GL 생성 제거·`_ensGLMode===1`·실행/일시정지 게이트·정리/재설치)와 raw 분류 검증기(`tools/team-followup-20261001/ANIMVFX/`). R raw 3건 대조로 무효/유효·동일객체 부활(3,2)·새 구울(1,2)·고주사율 REJECT를 재현. 고주사율·자연전투·새 구울 시각 PASS는 여전히 미완료."
  동시 세션 commit ownership 규칙상 공용 문서 직접 편집 대신 후보로만 남긴다.

## 8. 실행하지 않은 항목 / 남은 게이트
- **게임/브라우저/서버 실행 0.** `animvfx_gl_probe.js`의 브라우저 실행(install/dispose·정규 GL 부팅 `?webgpu=0`·사망/부활 첫 after-draw 캡처)은 **QA 종료 인계 전 보류**(ANIMVFX 보류 규칙). 본 세션은 `node --check`·mock·raw 분류의 작은 정적 검사만.
- **고주사율(≥90Hz) GL 수명 PASS 미완료** — 현존 raw는 전부 저주사율. 고주사율 표본 확보가 선행.
- **자연 조우/사용자 공격 입력, 새 구울 객체 시각 인수 미완료**(§11 발견 A/B 가독성 포함).
- **동일 객체 부활 잔상=0의 실제 실화면 검수 미완료** — 검증기는 raw 상 hf0·mode1를 확인했을 뿐, 정규 GL 실화면 캡처가 아니다.
- production(game.html)·easy·패키지·세이브·PC/3333 변경 0. Git add/commit/push 0. 이미지/유료 서비스/인코딩/빌드/SOUND 병합 0.
- 소유권 밖(공용 팀 문서 편집, 게임 실행, 체크포인트)은 실행하지 않고 **총괄에 인계**한다.

## 9. 다음 (소유권 밖 — 인계)
- QA/총괄: 정규 GL 풀부팅 + **고주사율 디스플레이**에서 `animvfx_gl_probe.js`를 install→사망/부활 유도→dispose로 돌려 raw를 남기면, 본 검증기로 ① 고주사율 수명 ≈100ms 수렴, ② 동일 객체 부활 첫 after-draw hf0·잔상0, ③ 새 구울 분리를 자동 판정 가능.
- 총괄: §7 docs 한 줄 인덱스 통합 검토, 본 산출물 원격 체크포인트.
