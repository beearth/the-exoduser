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
