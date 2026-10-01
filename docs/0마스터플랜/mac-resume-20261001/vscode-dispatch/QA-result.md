# 최신: 총괄 재검토2 인수 완료

기존 QA idle와 입력 대상 검증 실패를 확인해 Mac root가 최소 수정 범위를 인수했다. review2 세션 전송0, 중복0. 아래 최초 보고와 보강1의 VALID·합성 비교 PASS·23/23은 **교정 전 이력**이며 현재 판정으로 쓰지 않는다.

| 항목 | 현재 결과 |
|---|---|
| 실제 대조 부재 | 메타2개/4개 모두 CMP4 unknown, comparison exit1 |
| CPU profiler | 명시 boolean false만 off 기록; 누락/오타입은 unknown, on/프로필블록·상충은 false |
| 회귀 | make_reject_fixtures.mjs 34/34, exit0 |
| 기존 raw2건 | diagnostic exit0, comparison exit1 |
| 모드 오타 | exit2 |
| 게임 | 신규 실측0, 생산 수정0; 도구 회귀만 인수 |

합성 입력을 실제 A/B 입증으로 사용하지 않는다. 단일 관측의 진단 자료 수집은 가능하다.

---

# 이하 교정 전 보고 이력

# QA-B01-BASELINE-PREFLIGHT — 결과 (한국어)

- 담당: QA / 터미널 1. 작성 2026-10-01.
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f` (배정과 일치 확인).
- 수신·착수 기록: `QA-receipt.json`.
- **성격: 측정 "계획" + raw "유효성 검증기" 구현·검증. 새 실화면 측정 아님.**

## 1. 확인된 결과

1. 기존 first-kill/combat-timeline 도구와 최근 자연전투 raw를 대조해, 유효 기준점이 갖춰야 할 5개 축
   (조건 고정 · 첫 처치/밀집 기준 · 포화/회수 · 생존/실제 drawHz · 품질 자동변화 판정)을 정의하고
   자동 판정 검증기를 구현했다.
2. **기존 실제 raw 4건 모두 VALID**로 통과 (요구 최소 1건 초과 달성):
   - `combat-timeline-evidence/summary.json` (밀집·생존) — required 13/13
   - `normal-first-kill-evidence/summary.json` (첫 처치) — required 15/15, atmos 1→2 자동변화 탐지·문서화 확인
   - `drop-prewarm-evidence/normal-summary.json`, `normal3-summary.json` — 각 required 13/13
3. **의도적 누락/오염 fixture 12건 전부 INVALID로 reject**, 각 겨냥 required check가 실제 FAIL함을 자동 확인.
   동시에 실제 raw 2건은 VALID 유지(회귀 대조).

## 2. 산출물 (QA 소유 경로)

| 산출물 | 경로 |
|---|---|
| 측정 계획 | `tools/team-followup-20261001/QA/BASELINE_PREFLIGHT_PLAN.md` |
| raw 유효성 검증기 | `tools/team-followup-20261001/QA/baseline_raw_validator.mjs` |
| reject-fixture 하니스 | `tools/team-followup-20261001/QA/make_reject_fixtures.mjs` |
| 생성 fixture 12종 | `tools/team-followup-20261001/QA/fixtures/*.json` |

## 3. 실행 명령 / exit

| 명령 | 결과 |
|---|---|
| `node tools/team-followup-20261001/QA/baseline_raw_validator.mjs` | 실제 raw 2건 VALID, **exit 0** |
| `node .../baseline_raw_validator.mjs <drop-prewarm 2건>` | 2건 VALID, **exit 0** |
| `node tools/team-followup-20261001/QA/make_reject_fixtures.mjs` | 12/12 reject + 실제 raw VALID 유지, **exit 0** |
| `node --check` (검증기·하니스) | 구문 통과 |
| Node | v24.15.0 |

## 4. 원자료 (대조 대상, 읽기만)

- `docs/0마스터플랜/mac-resume-20261001/combat-timeline-evidence/summary.json`
- `docs/0마스터플랜/mac-resume-20261001/normal-first-kill-evidence/summary.json`
- `docs/0마스터플랜/mac-resume-20261001/drop-prewarm-evidence/normal-summary.json`, `normal3-summary.json`
- 도구: `tools/qa_first_kill_cpu_probe.js`, `tools/qa_frame_probe.mjs` (읽기·규약 참조)

## 5. docs 대조 (rg) 및 필요한 정정

코드(game.html) 변경이 없어 수치 정정 의무는 없으나, 검증기 가정의 docs 정합을 rg로 확인했다.

| 키워드 | 결과 |
|---|---|
| `webgpu=0` | QA/VFX/퍼포먼스 docs 다수에서 정규 GL 경로 관례로 사용 — 검증기 A1과 일치 |
| `fpsCap=0 무제한` | `QA_PERFORMANCE_TEAM_MASTER §2`, `PERF_MAC_CHROME_AUDIT` — A4와 일치 |
| 품질 자동변화(atmos) | `1전체그래픽세팅_MASTER §23`, `VFX_구현가이드 §672`(`_atmUserSet` 자동승격 차단·자동강등) — E축 설계 근거와 일치 |
| `rateDraw/drawHz` | combat raw·`Mac-정상-WebGL-첫처치-관측`(약31Hz) — D축과 일치 |

- **정정 불필요.** 단, 관찰 1건 기록: `QA_PERFORMANCE_TEAM_MASTER §2` M1 환경표의 `atmos 2, parts 100, diff 10`은
  **PC M1 세션 값**이고, Mac raw는 `atmos 1(초기)/parts 80/diff 5`다. 서로 다른 측정 환경이라 불일치가 아니며
  문서 오류로 보지 않는다(기록만).
- 신규 추가 정보(5개 축 판정 기준·검증기 규약)는 본 결과·계획 문서에 기록했다. 상위 팀 문서(`QA_PERFORMANCE_TEAM_MASTER`)에
  "QA-B01 preflight 검증기" 한 줄 인덱스 추가는 **총괄 통합 시 반영** — 해당 파일은 총괄/타 팀과 공유되는 공용 문서라
  이번에 직접 편집하지 않고 후보로만 남긴다(동시 세션 commit ownership 규칙).

## 6. 실행하지 않은 항목 / 남은 게이트

- **신규 실화면 측정 0건.** 이 폴더 `QA-game-release.json`(released=true) 총괄 인계가 없어 새 baseline 측정 미수행.
  → "신규 baseline 완료"로 쓰지 않음(배정 규칙 준수).
- production(game.html)·easy·패키지·세이브·PC/3333 변경 0. 게임/서버/브라우저 실행 0. Git add/commit/push 0.
- M2 정식 실측(전후 variant 교차, `--enemy/--trace/--gl`, 패키지/5120×1440)은 게이트 대기.
- 품질 자동변화를 측정 중 고정·기록(`_atmUserSet` 상태 raw 기록)은 M2 프로브 보강 후보.
- MAP/ART/UIUX/ANIMVFX 게임 실행은 QA 종료 인계 전 보류(배정 규칙).

## 7. 다음 (소유권 밖 — 인계)

- 총괄: `QA-game-release.json`에 `released=true`를 인계하면 M2 정식 실측을 본 계획·검증기로 수행 가능.
- 통합 시 `QA_PERFORMANCE_TEAM_MASTER`에 본 검증기 인덱스 한 줄 반영 검토.

---

# 후속 1 — 진단 유효성과 비교 기준점 분리 (2026-10-01)

지시: [QA-classification-followup.md](QA-classification-followup.md). 같은 QA T1 세션에서 이어감.
기준 HEAD `94b47f87`(배정 문서만 추가, 생산 소스는 `30a204a7`와 동일). 쓰기 소유권·게임 금지·원자료 보존·Git 금지 유지.

## F1. 무엇을 고쳤나

총괄 검수: 분류기가 품질 변화를 "경고"로만 알리고 최상위 `valid:true`/`VALID`/exit0/"유효한 기준점" 문구가
**진단 유효성**과 **고정 조건 비교 자격**을 혼합했다. 이를 분리했다.

1. **출력 분리** — JSON·콘솔·계획·result 모두에서 `diagnosticValid`(구조)와 `comparisonEligible`(비교 적격,
   **true/false/unknown**)를 따로 낸다. 미입증은 PASS가 아니라 false/unknown + 구체 사유로 표기한다.
   `valid` 키는 `diagnosticValid`의 하위호환 별칭이며 "진단 전용, 비교 적격 아님"을 `validAliasNote`로 명시한다.
2. **비교 게이트 CMP1~4** — 품질 불변(설치==최종)·최종 옵션 존재·계측 조건(프로파일러 off 기록)·대조 메타
   (seed/maxload/expectsha/variant) 기록. 하나라도 false면 false, 아니면 unknown 하나라도 있으면 unknown.
   **옵션 양끝 동일만으로 "측정 내내 고정"이라 하지 않는다**(CMP4 미기록 시 unknown).
3. **CLI 모드 분리** — 기본 `--mode=diagnostic`(구조 성공=exit0)과 `--mode=comparison`(전부
   `comparisonEligible==='true'`일 때만 exit0, false/unknown은 exit1)을 제공하고 양 계약을 테스트한다.
4. **경계 문구** — `trusted`=브라우저 신뢰 이벤트이지 사람 물리입력/막타 피해원 증명 아님,
   `fpsCap=0`=캡 없음이지 GPU 완료·표시 FPS·매 루프 draw 증명 아님을 check 라벨·`boundaries`에 반영.
   **PC329ms·ring97ms 해결 주장 금지, 새 측정 release 없음**을 명시.

## F2. 실제 raw 분류 결과 (원자료 보존, 수정 없음)

| raw | diagnosticValid | comparisonEligible | 사유 |
|---|---|---|---|
| combat-timeline/summary.json | true | **unknown** | CMP4 대조 메타 0/4 — 양끝 동일만으로 내내 고정 미입증 |
| normal-first-kill/summary.json | true | **false** | CMP1 atmos 1→2 자동변화 + CMP3 프로파일러(profile 블록) 오버헤드 |

→ 두 자료 모두 **진단 보존 가능**하나 **고정 조건 비교 기준점으로는 부적격/미입증**이다.

## F3. fixture (실제 raw와 분리, `_fixtureMeta` 합성 표식 부착)

| 그룹 | 수 | 기대 |
|---|---|---|
| 그룹1 구조 reject | 11 | diagnosticValid=false & 겨냥 구조검사 FAIL & comparisonEligible=false |
| 그룹2 비교 부적격(구조 유효) | 5 | diagnosticValid=true & comparisonEligible=false/unknown & 겨냥 CMP 게이트 state 일치 |
| 그룹3 비교 적격(합성 양성) | 1 | comparisonEligible=true (comparison 모드 PASS 계약) |

그룹2 내역: 품질 자동변화(false)·최종옵션 부재(unknown)·프로파일러 on(false)·대조메타 미기록(unknown)·
first-kill atmos 변화(caveat 유무 무관 false). **fixture 입력은 실제 원자료처럼 꾸미지 않고** 모두
`_fixtureMeta.note="테스트용 합성 입력 — 실제 측정 raw 아님", release:"none"` 를 담는다.

## F4. 실행 명령 / 결과

| 명령 | 결과 |
|---|---|
| `node .../baseline_raw_validator.mjs` (diagnostic) | 실제 raw 2건 diagnosticValid=true, **exit 0** |
| `node .../baseline_raw_validator.mjs --mode=comparison` | 2건 모두 ≠true(unknown·false), **exit 1** |
| `node .../make_reject_fixtures.mjs` | **23/23 계약 통과**, exit 0 |
| `node --check` (분류기·하니스) | 구문 통과 |

## F5. 미실행 / 경계

- 신규 실측 0건, production/easy/패키지/세이브/PC·3333 변경 0, 게임/서버/브라우저 실행 0, Git 0.
- 타 팀·공용 문서(`QA_PERFORMANCE_TEAM_MASTER` 등) 미수정 — 통합 후보로만 남김.
- comparisonEligible=true 는 M2 정식 실측에서 CMP3(프로파일러 off)·CMP4(대조 메타 기록)를 raw 에 남겨야 가능.
  현재는 `QA-game-release.json`(released=true) 부재로 신규 실측 금지.
- PC329ms·ring97ms 해결 주장 없음.
