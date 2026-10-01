# QA-B01-BASELINE-PREFLIGHT — 첫 처치·밀집 전투 유효 기준점 측정 계획

> 담당 QA / 터미널 1. 작성 2026-10-01. 기준 HEAD `30a204a7…`(생산 소스), 후속 시점 HEAD `94b47f87`(배정 문서 추가, 생산 동일).
> 상위 문서: [QA_PERFORMANCE_TEAM_MASTER.md](../../../docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md) §7.3 M2 계획, §4 병목표, 총괄 §18.14~18.19.
> **이 문서는 측정 "계획"과 raw "분류기" 정의다. 새 실측 결과가 아니다.**
> 신규 실측 게이트: 이 디스패치 폴더 `QA-game-release.json`에 `released=true`인 총괄 인계가 있을 때만 실행.
> 현재 해당 파일 없음 → **신규 실화면 측정 금지, production(game.html) 변경 금지.**

## 0.5 진단 유효성 ↔ 비교 적격 분리 (2026-10-01 후속 핵심)

총괄 검수 지적: 구조 검사 성공(`VALID`/exit0)과 "고정 조건 비교 자격"을 혼합하면 안 된다. 분류기는 두 축을
**분리**해서 출력한다.

| 축 | 의미 | 값 |
|---|---|---|
| `diagnosticValid` | 진단 자료로서 구조가 유효한가(조건 **기록**·버퍼·회수·지표 존재). **구조 검사 성공일 뿐.** | true/false |
| `comparisonEligible` | 같은 고정 조건 A/B 비교의 한 축으로 쓸 수 있는가. | **true / false / unknown** |

- `valid` 키는 `diagnosticValid`의 **하위호환 별칭**이며 "진단 전용, 비교 적격 아님"으로 표시한다.
- **미입증은 PASS가 아니다**: 품질 자동변화·최종 옵션 부재·계측 조건(프로파일러/오버헤드) 미기록/불일치·
  대조 입력 미확인은 `comparisonEligible=true`가 될 수 없다(각각 false 또는 unknown + 구체 사유).
- **옵션 양끝 동일(install==final)만으로 "측정 내내 고정"이라고 주장하지 않는다** — 단일 raw의 CMP4는 항상 unknown.

### 비교 적격 게이트 (CMP)

| 게이트 | 통과(true) 조건 | false | unknown |
|---|---|---|---|
| CMP0 선행 | diagnosticValid=true | 구조 무효 | — |
| CMP1 품질 불변 | 설치==최종 옵션(품질 키 변화 0) | 자동변화 탐지 | 최종 옵션 없어 미입증 |
| CMP2 최종 옵션 | 최종 스냅샷 존재 | — | 부재 |
| CMP3 계측 조건 | boolean profiler=false, profile 블록·오타입 없음 | profiler=true 또는 profile 블록(상충 포함) | 누락·null·문자열·숫자 등 오타입 |
| CMP4 대조 검증 | 이 CLI에서는 true 판정 없음 | — | 항상: 메타 4/4여도 실제 대응 쌍·연속 조건 미검증 |

종합: false 하나라도 → false; 아니면 unknown 하나라도 → unknown; 전부 true → true.

### 경계(문구로 유지)

- `trusted` 입력 = 브라우저 신뢰 이벤트. **사람의 물리 입력/막타 피해원 증명이 아니다.**
- `fpsCap=0` = 캡 없음. **GPU 완료·표시 FPS·매 루프 draw를 증명하지 않는다.** drawHz는 관측된 draw 시작 간격 값.
- 이 분류기는 **PC329ms·과거 ring97ms 등 성능 '해결'을 주장하지 않는다.** 새 측정 release 없음.

### 실제 raw 분류 결과

| raw | diagnosticValid | comparisonEligible | 사유 |
|---|---|---|---|
| combat-timeline | true | **unknown** | CMP4 대조 메타 0/4 — 양끝 동일만으로 내내 고정 미입증 |
| normal-first-kill | true | **false** | CMP1 atmos 1→2 자동변화 + CMP3 프로파일러 오버헤드(profile 블록) |

## 0. 목적과 산출물

기존 first-kill/combat-timeline 도구와 최근 자연전투 raw를 대조해, "유효한 기준점"으로 쓸 수 있는
raw가 갖춰야 할 조건을 **5개 축**(조건 고정·첫 처치/밀집 기준·포화/회수·생존·실제 drawHz / 품질 자동변화)으로
정의하고, 이를 자동 판정하는 검증기를 구현한다.

| 산출물 | 경로 | 상태 |
|---|---|---|
| 측정 계획 (이 문서) | `tools/team-followup-20261001/QA/BASELINE_PREFLIGHT_PLAN.md` | 완료 |
| raw 유효성 검증기 | `tools/team-followup-20261001/QA/baseline_raw_validator.mjs` | 완료·검증됨 |
| reject-fixture 하니스 | `tools/team-followup-20261001/QA/make_reject_fixtures.mjs` | 재검토2: 34/34 분류·CLI 계약 통과 |
| 생성 fixture | `tools/team-followup-20261001/QA/fixtures/*.json` | 생성됨(파생물) |

## 1. 기존 도구·증거 대조 (읽기만, 복사·보강)

| 자산 | 역할 | 비고 |
|---|---|---|
| `tools/qa_first_kill_cpu_probe.js` | 첫 처치 CPU 프로브(2D/GL/가공 함수 래핑, 링버퍼 LIMIT=20000) | `firstDeathCandidateAt`는 kill 증거 아님(주석). `droppedCount`/`truncated`로 포화 노출 |
| `tools/qa_frame_probe.mjs` | 프레임/구간 측정 프로브(M2 옵션: `--seed/--maxload/--expectsha/--variant/--trace/--gl`) | QA 소유 |
| `combat-timeline-evidence/summary.json` | **밀집·생존 기준 실제 raw** (자연사 17.2초, loop600/draw600, rateDraw 34.85) | diagnosticValid=true(과거 VALID는 비교 적격 아님) |
| `normal-first-kill-evidence/summary.json` | **첫 처치 기준 실제 raw** (수동 입력→첫 kill +1500ms, firstKill 3.13초) | diagnosticValid=true(과거 VALID는 비교 적격 아님) |
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
| 프레임 상한 | `fpsCap=0` (캡 없음. 실제 draw 빈도는 별도 관측, [PERF_MAC_CHROME_AUDIT] 관례) | A4 (required) |
| 포커스/가시성 | 표본 지점 `focus=true & hidden!=true` | A5 (required) |
| 환경 UA | `environment.ua` | A6 (warn) |

M2 정식 실측 시 추가 고정(계획): `--expectsha`(served==disk SHA), `--seed=20261001`(스폰 위치),
`--maxload=60`(시작 전 시스템 CPU), 시나리오 순서 `MOVE,COMBAT,COMBAT2,PANELS` (§7.3). 전후는
`--variant` 스냅샷 교차로 타 팀 도중 수정과 분리. **이 고정값들은 M2 실행 시점 적용이며 본 계획에서 미실행.**

> 축 명칭: A~D는 구조(diagnostic) 검사, 품질(옛 E축)은 비교 적격 게이트 CMP1~2로 이동했다(§0.5).

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

## 6. 품질 자동변화 판정 (quality auto-change) — 비교 게이트 CMP1·CMP2

게임은 런타임에 품질을 자동 조정한다([1전체그래픽세팅_MASTER §23], VFX_구현가이드 §672 `_atmUserSet`
자동승격 차단·부스 안전 자동강등). atmos 등 품질 키가 측정 **도중** 바뀌면 전/후 조건이 달라진다.

- **분류 기준(후속 교정)**: 품질 자동변화는 `comparisonEligible`에만 영향을 준다. 진단 자료로는 보존(diagnosticValid 유지)하되,
  변화가 탐지되면 **문서화 여부와 무관하게** `comparisonEligible=false`다(CMP1). `optionCaveat`가 있어도 비교 적격이 되지 않는다 —
  caveat는 "보존·설명"일 뿐 "조건 고정"이 아니기 때문이다.
- 최종 옵션 스냅샷이 없으면 변화 여부 자체를 입증할 수 없어 `unknown`이다(CMP2). **양끝 동일만으로 내내 고정이라 하지 않는다**(CMP4로 별도 확인).

실제 first-kill raw: `atmos 1→2` 탐지 → CMP1 false → comparisonEligible=false(+CMP3 프로파일러). 진단 자료로는 보존.
combat raw: `options===finalOptions`(atmos 1 유지) → CMP1 true이나 CMP4(대조 메타) 미기록 → comparisonEligible=unknown.

## 7. 분류기 사용·종료 코드

```
node tools/team-followup-20261001/QA/baseline_raw_validator.mjs [raw.json ...] [--mode=diagnostic|comparison] [--json]
#   --mode=diagnostic(기본): 전부 diagnosticValid 이면 exit 0, 구조 실패 1, 입력/파싱 오류 2
#   --mode=comparison       : 전부 comparisonEligible==='true' 이면 exit 0, 아니면(false/unknown) 1, 오류 2
node tools/team-followup-20261001/QA/make_reject_fixtures.mjs
#   구조 reject + 비교 부적격 + 메타 완비(합성)도 미입증 + 재검토2 회귀 및 CLI 계약 확인
```

- 모든 생성 fixture 에는 `_fixtureMeta`(합성 표식·목적·target·`release:"none"`)가 들어가 실제 원자료와 분리된다.

## 8. 검증 결과 (이번 수행, 새 실측 아님)

- 기존 실제 raw **2건 모두 diagnosticValid=true**. comparisonEligible: combat=**unknown**(CMP4), first-kill=**false**(CMP1+CMP3).
  diagnostic 모드 exit 0, comparison 모드 exit 1.
- fixture **34/34 계약 통과**:
  - 그룹1 구조 reject 11건 → diagnosticValid=false & 겨냥 구조검사 FAIL & comparisonEligible=false.
  - 그룹2 비교 부적격 5건 → diagnosticValid=true & comparisonEligible=기대값(false/unknown) & 겨냥 CMP 게이트=기대 state.
  - 그룹3 메타 완비(합성) 1건 → comparisonEligible=unknown, comparison exit1.
  - 재검토2 회귀10건 + CLI 계약5건(모드 오타 포함) + 실제 raw 회귀2건.

## 9. 미실행·남은 게이트 (완료로 쓰지 않음)

- **신규 실측 0건.** `QA-game-release.json`(released=true) 인계 없음 → 새 baseline 측정 미수행. 새 측정 release 없음.
- M2 정식 실측(§7.3의 전후 variant 교차·`--enemy`·`--trace`·`--gl`·패키지/5120×1440)은 게이트 대기.
  M2는 실제 대응 쌍·환경·계측·연속 옵션 이력을 별도 검수해야 한다. 이 단일 raw CLI는 비교 true를 판정하지 않는다.
- 품질 자동변화를 "측정 중 고정"하는 방법(예: `_atmUserSet` 상태를 raw 에 기록)은 M2 프로브 보강 후보.
- QA 단독 실행 규칙: MAP/ART/UIUX/ANIMVFX 게임 실행은 QA 종료 인계 전 보류.

## 총괄 재검토2 인수 (2026-10-01)

기존 QA idle/화면 입력 확인 실패 후 Mac root가 이 도구 범위를 인수했다. seed·variant·profiler=false 기록만으로 비교 PASS하는 경로와 gpuTiming=false만으로 CPU off 판정하는 경로를 제거했다. 메타 4/4 합성 입력도 비교 unknown/exit1이다. 명시적 profiler=false는 기록 계약일 뿐 실제 실행 이력 입증은 별도다. 다수 파일도 각각의 구조 검사이며 A/B 대응 관계를 검증하지 않는다. 합성 fixture는 측정 증거가 아니다.

34/34 검사: 구조 reject11, 기존 비교부적격5, 완전한 메타 미입증1, 재검토2 회귀10, CLI계약5, 실제 raw회귀2. 잘못된 모드는 diagnostic으로 내려가지 않고 exit2. 실제 raw2건은 diagnostic exit0, comparison exit1. 새 실측0·생산 변경0.

남은 구조 검증 한계: A5의 on 대체·hidden 미기록 허용, C1의 dropped 미기록 허용, D2의 rAF 대체 경로는 실제 focus/버퍼/draw 증명으로 사용하지 않는다. 새 관측은 명시적인 해당 값을 원자료에 보존하고 별도 확인한다.
