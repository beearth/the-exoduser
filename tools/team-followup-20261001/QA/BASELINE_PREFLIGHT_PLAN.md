# QA-B01-BASELINE-PREFLIGHT — 첫 처치·밀집 전투 유효 기준점 측정 계획

> 담당 QA / 터미널 1. 작성 2026-10-01. 기준 HEAD `30a204a7aa348a88b90bdc922862c610a7da938f`.
> 상위 문서: [QA_PERFORMANCE_TEAM_MASTER.md](../../../docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md) §7.3 M2 계획, §4 병목표, 총괄 §18.14~18.19.
> **이 문서는 측정 "계획"과 raw 유효성 "검증기" 정의다. 새 실측 결과가 아니다.**
> 신규 실측 게이트: 이 디스패치 폴더 `QA-game-release.json`에 `released=true`인 총괄 인계가 있을 때만 실행.
> 현재 해당 파일 없음 → **신규 실화면 측정 금지, production(game.html) 변경 금지.**

## 0. 목적과 산출물

기존 first-kill/combat-timeline 도구와 최근 자연전투 raw를 대조해, "유효한 기준점"으로 쓸 수 있는
raw가 갖춰야 할 조건을 **5개 축**(조건 고정·첫 처치/밀집 기준·포화/회수·생존·실제 drawHz / 품질 자동변화)으로
정의하고, 이를 자동 판정하는 검증기를 구현한다.

| 산출물 | 경로 | 상태 |
|---|---|---|
| 측정 계획 (이 문서) | `tools/team-followup-20261001/QA/BASELINE_PREFLIGHT_PLAN.md` | 완료 |
| raw 유효성 검증기 | `tools/team-followup-20261001/QA/baseline_raw_validator.mjs` | 완료·검증됨 |
| reject-fixture 하니스 | `tools/team-followup-20261001/QA/make_reject_fixtures.mjs` | 완료·12/12 reject |
| 생성 fixture | `tools/team-followup-20261001/QA/fixtures/*.json` | 생성됨(파생물) |

## 1. 기존 도구·증거 대조 (읽기만, 복사·보강)

| 자산 | 역할 | 비고 |
|---|---|---|
| `tools/qa_first_kill_cpu_probe.js` | 첫 처치 CPU 프로브(2D/GL/가공 함수 래핑, 링버퍼 LIMIT=20000) | `firstDeathCandidateAt`는 kill 증거 아님(주석). `droppedCount`/`truncated`로 포화 노출 |
| `tools/qa_frame_probe.mjs` | 프레임/구간 측정 프로브(M2 옵션: `--seed/--maxload/--expectsha/--variant/--trace/--gl`) | QA 소유 |
| `combat-timeline-evidence/summary.json` | **밀집·생존 기준 실제 raw** (자연사 17.2초, loop600/draw600, rateDraw 34.85) | 검증기 VALID |
| `normal-first-kill-evidence/summary.json` | **첫 처치 기준 실제 raw** (수동 입력→첫 kill +1500ms, firstKill 3.13초) | 검증기 VALID |
| `drop-prewarm-evidence/normal*-summary.json` | 추가 자연전투 raw | 검증기로 추가 대조 가능 |

검증기는 두 스키마를 자동 감지한다: `window.loops`+`metrics.loopStartIntervals`→combat-timeline,
`window.firstKill`+`probeMeta`→normal-first-kill.

## 2. 조건 고정 (fixed conditions) — 검증기 A축

기준점끼리 비교 가능하려면 raw가 조건을 **기록**해야 한다. 검증기는 값을 강제하지 않고(실행 환경별 DPR 등
차이 허용) 기록 유무와 비교 핵심 불변량만 required로 본다.

| 항목 | 고정/기록 방법 | 검증기 check |
|---|---|---|
| 렌더 경로 | URL `?webgpu=0` (정규 GL). docs 전반 관례와 일치 | A1 (required) |
| 해상도·DPR | `environment.canvas/viewport/dpr` 기록 | A2 (required) |
| 게임 옵션 | `quality/resScale/ssaa/fpsCap/parts/diff/atmos` 기록 | A3 (required) |
| 프레임 상한 | `fpsCap=0` (무제한 → draw 간격=프레임 간격, [PERF_MAC_CHROME_AUDIT] 관례) | A4 (required) |
| 포커스/가시성 | 표본 지점 `focus=true & hidden!=true` | A5 (required) |
| 환경 UA | `environment.ua` | A6 (warn) |

M2 정식 실측 시 추가 고정(계획): `--expectsha`(served==disk SHA), `--seed=20261001`(스폰 위치),
`--maxload=60`(시작 전 시스템 CPU), 시나리오 순서 `MOVE,COMBAT,COMBAT2,PANELS` (§7.3). 전후는
`--variant` 스냅샷 교차로 타 팀 도중 수정과 분리. **이 고정값들은 M2 실행 시점 적용이며 본 계획에서 미실행.**

## 3. 첫 처치 / 밀집 기준 (baseline identity) — 검증기 B축

| 기준 유형 | 식별 조건 | 검증기 check |
|---|---|---|
| 첫 처치(first-kill) | `window.firstKill > window.start`, `firstKill.kills≥1 & finalKillCount≥1`, 처치 시점 `gl=true`, 신뢰 입력(`inputProof[].trusted`) ≥1 | B1·B2·B3·B5 (required), B4 창 정의(warn) |
| 밀집·생존(combat) | 종료 사유(`window.reason`), 처치 수(initial→end), 전투 적 수(밀집 판정), kills/items 이벤트 타임라인 | B1·B2·B3 (required), B4 events(warn) |

밀집도는 `end.enemies`(실제 raw=43)·처치 수·`aggregatesNestedDoNotSum`의 호출 수로 판정한다.
첫 처치는 "자동공격 선처치"를 배제한 수동 입력 창을 요구한다([Mac-정상-WebGL-첫처치-관측] 관례).

## 4. 포화 / 회수 (saturation / recovery) — 검증기 C축

프로브 버퍼가 포화되면(첫 처치 전에 2D 호출 2만개로 링버퍼가 돌아가면) 기준이 오염된다.
계측 후 원본 함수를 회수(복구)하지 않으면 이후 플레이·다음 실행이 오염된다.

| 항목 | 조건 | 검증기 check |
|---|---|---|
| 버퍼 미포화 | `dropped=0 & truncated!=true` (first-kill은 `probeMeta.droppedCount/truncated`) | C1 (required) |
| 함수 회수 | combat: `restored.{loop,update,draw}` 전부 true / first-kill: `probeMeta.stopped=true & endedAt` 기록 | C2 (required) |
| wrap 누락 | `probeMeta.missing`(일부 라벨 미포착, 예 `_worldDropSkin`) | C3 (warn) |

## 5. 생존 / 실제 drawHz (survival / actual drawHz) — 검증기 D축

| 항목 | 조건 | 검증기 check |
|---|---|---|
| 측정 창 지속 | `window.duration`/`durationMs` > 0 | D1 (required) |
| draw 간격 꼬리 | `draw 간격`의 `p95/p99/max` 기록 (평균만으로 긴 프레임 숨기지 않음) | D2 (required) |
| 실제 drawHz | combat: `window.rateDraw` / first-kill: `draw_dt.n / (duration/1000)`, 표본 `n≥30` | D3 (required) |

실제 raw의 drawHz는 combat 34.9Hz, first-kill 31.1Hz로 **고주사율 미충족**이 그대로 드러난다.
이는 기준점의 사실이며, 개선/완료 주장이 아니다([Mac-정상-WebGL-첫처치-관측] 약31Hz 한계와 일치).

## 6. 품질 자동변화 판정 (quality auto-change) — 검증기 E축

게임은 런타임에 품질을 자동 조정한다([1전체그래픽세팅_MASTER §23], VFX_구현가이드 §672 `_atmUserSet`
자동승격 차단·부스 안전 자동강등). atmos 등 품질 키가 측정 **도중** 바뀌면 전/후 조건이 달라져 단독 A/B
비교가 무효가 된다.

| 상황 | 판정 | 검증기 check |
|---|---|---|
| 설치=최종(변화 없음) | 통과 | E1-stable (warn) |
| 품질 키 변화 탐지(atmos/quality/resScale/ssaa/parts/bloom/lighting/postfx/fog/grain/torch/fpsCap) | 변화가 **문서화**(first-kill `optionCaveat` 또는 combat `finalOptions` 존재)돼야 유효 | E1-documented (required) |
| 〃 | 비교 주의 플래그 — 같은 조건 A/B에 단독 사용 금지 | E2 (warn) |

실제 first-kill raw: `atmos 1→2` 탐지, `optionCaveat` 문서화됨 → 유효(단 비교 주의 플래그 ON).
combat raw: `options===finalOptions`, atmos 1 유지 → 변화 없음.

## 7. 검증기 사용·종료 코드

```
node tools/team-followup-20261001/QA/baseline_raw_validator.mjs [raw.json ...] [--json]
# 인수 없으면 기존 실제 raw 2건 검증. 전부 유효=exit 0, required 실패=1, 입력/파싱 오류=2
node tools/team-followup-20261001/QA/make_reject_fixtures.mjs
# 의도적 누락/오염 fixture 생성 + reject 확인(12/12) + 실제 raw VALID 회귀 대조
```

## 8. 검증 결과 (이번 수행, 새 실측 아님)

- 기존 실제 raw **2건 모두 VALID** (combat required 13/13, first-kill required 15/15). exit 0.
- 의도적 누락/오염 fixture **12건 전부 INVALID로 reject**, 각 겨냥 required check가 실제 FAIL. exit 0.
- first-kill raw의 품질 자동변화(atmos 1→2)를 탐지하고 문서화 여부로 통과, 비교 주의 플래그 ON.

## 9. 미실행·남은 게이트 (완료로 쓰지 않음)

- **신규 실측 0건.** `QA-game-release.json`(released=true) 인계 없음 → 새 baseline 측정 미수행.
- M2 정식 실측(§7.3의 전후 variant 교차·`--enemy`·`--trace`·`--gl`·패키지/5120×1440)은 게이트 대기.
- 품질 자동변화를 "측정 중 고정"하는 방법(예: `_atmUserSet` 상태를 raw에 기록)은 M2에서 프로브 보강 후보.
- QA 단독 실행 규칙: MAP/ART/UIUX/ANIMVFX 게임 실행은 QA 종료 인계 전 보류.
