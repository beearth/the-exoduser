# MAP-M5-EVIDENCE-GATE 결과 — M5/MAP-020 불완전 표본 판정 보강

- 팀: Mac MAP / 터미널 3 / 세션 d447a49d / 작성 2026-10-01
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 선행: MAP-020-M5-PREFLIGHT 완료(안전화 하니스 + mock 32 PASS). **중복대기 아님 — 다음 한 건으로 진행.**
- 상태: **검증기·회귀 구현 완료(승인 범위 내). 실게임 8뷰 촬영·실화면 검수는 미완료(QA 종료 인계 전 보류).**

## 1. 산출물(소유 경로만 작성)
`game.html`/easy/test 공용경로·총괄MD·타 팀 파일·`map020-evidence`(원자료)·Git 미변경. 게임/서버/브라우저/이미지/인코딩/대형빌드/새세션 미실행.

| 경로 | 내용 |
|---|---|
| `tools/team-followup-20261001/MAP/m5-evidence-gate.cjs` | **증거 게이트 판정기**(순수 함수, Read-only). sha256 `865fd51e…` |
| `tools/team-followup-20261001/MAP/m5-evidence-gate.test.cjs` | 회귀(실측 원자료 + 합성 26항목). sha256 `71acfe4b…` |
| `tools/team-followup-20261001/MAP/gate-test-output.txt` | 회귀 실행 로그(26 PASS/0 FAIL) |
| `tools/team-followup-20261001/MAP/real-evidence-verdict.json` | 실측 원자료 판정 결과(전체 판정표) |

## 2. 판정 등급 규약(불완전 표본 보수화)
| 등급 | 조건 |
|---|---|
| **PASS** | 방문(held 전구간) + 전방벽/좌표 계약 증거 확인 + 예상좌표 일치 |
| **FAIL** | 증거가 기대와 모순: 맵/충돌 변경, 전방벽 통과, SSOT 벽판정 불일치, 개구 기대인데 막힘 |
| **UNKNOWN** | 미방문(leg/표본 0) 또는 좌표불명(벽판정 증거 자체 없음) |
| **INCONCLUSIVE** | 정지했으나 충돌 근거 불명(전방벽 프로브 없음/전방 비벽), 미도달/타임아웃, 입력불명(held=false), 예상좌표 불일치 |

**8뷰 게이트(핵심)**: 가이드 §15 CAMERA QA 8뷰(START/EARLY/MAIN ARENA/SIDE LEFT/SIDE RIGHT/PRIMARY LANDMARK/LATE/EXIT·BOSS)가 **전부 실제 증거로 존재하지 않으면 전체 verdict는 PASS 금지**(RETOUCH로 강등). → "실제 8뷰 없는 PASS 금지" 강제.

## 3. 실측 원자료 판정표 (`walk-input-raw.json` + `south-shots.json`)
**종합 verdict = RETOUCH · 뷰 2/8 · PASS 금지.**
차단사유: `8뷰 미완(미방문: EARLY, MAIN ARENA, SIDE LEFT, PRIMARY LANDMARK, LATE, EXIT/BOSS)`, `INCONCLUSIVE 항목 존재`.

### 경계(보행 leg)
| 경계 | 실측 종점 | 등급 | 근거 |
|---|---|---|---|
| A_enter_south (S) | (6660, 6304.369) | **INCONCLUSIVE** | 정지(held, Δy≈0)했으나 전방벽 프로브 없음 → 충돌불명. 실측 raw는 플레이어-중심 isW(=false)만 기록, 전방 벽 확인 불가 |
| B_inside_north (N) | (6660, 6137.214) | **PASS** | 북상 복귀, 기대 종점 일치(개구/통행) |
| C_entry_east (E) | (6746.363, 6137.214) | **PASS** | 동측 개구, 기대 종점 일치 |
| D_block_south2 (S) | (6746.363, 6223.577) | **INCONCLUSIVE** | 정지했으나 전방벽 프로브 없음 → 충돌불명 |

> 남측 "막힘" 2건이 INCONCLUSIVE인 이유: 실측 하니스는 전방 벽 프로브(wallAhead/gameIsW)를 남기지 않아 "정지=벽 충돌"을 증거로 확정할 수 없다. 안전화 하니스(`m5-walk-harness.safe.js`)는 `wallAhead`/`gameWallAhead`를 기록하므로, QA가 그것을 실행해 출력을 본 게이트에 넣으면 전방벽 확인 시 PASS 승격이 가능하다(§6 합성 PASS 케이스로 검증).

### 좌표 계약
| 항목 | world | 기대 | 등급 |
|---|---|---|---|
| doc_M5_world | 7000,6900 | 벽 | **PASS**(wallTile=true 일치) |
| doc_M5_bake | 6835.94,6738.28 | 벽 | **PASS** |
| approach | 6660,6140 | 비벽 | **PASS**(wallTile=false 일치) |

### 8뷰
present=2(START, SIDE RIGHT) / wanted=8. missing 6뷰.

## 4. 회귀 결과 (26 PASS / 0 FAIL, exit 0)
`node tools/team-followup-20261001/MAP/m5-evidence-gate.test.cjs`
- [1] 실측 원자료: verdict≠PASS, 8뷰 미완 차단, 남측 INCONCLUSIVE, 복귀/개구 PASS, 좌표 PASS, 2/8뷰.
- [2] 완전 증거(8뷰+전방벽+좌표일치) → **PASS**.
- [3] 뷰 1개 제거 → RETOUCH(8뷰 미완, EXIT/BOSS 미방문 보고).
- [4] 등급별 단위 9종: 미방문=UNKNOWN, 표본0=UNKNOWN, held=false=INCONCLUSIVE, 정지+전방벽없음=INCONCLUSIVE(충돌불명), 정지+전방비벽=INCONCLUSIVE, 전방벽 통과=FAIL, 맵변경=FAIL, 좌표불일치=INCONCLUSIVE, 개구막힘=FAIL.
- [5] 좌표 계약 6종: 비벽/벽 일치=PASS, 불일치=FAIL, 증거없음=UNKNOWN.

## 5. 수행한 작은 검증
- Node `--check` 구문: `m5-evidence-gate.cjs`, `m5-evidence-gate.test.cjs` PASS(v24.15.0).
- 회귀 26/26 PASS. 실측 원자료는 Read-only로만 읽음(해시 불변).

## 6. 두 하니스 연결
`m5-evidence-gate.cjs`의 `normLeg`는 **실측 raw 포맷**과 **안전화 하니스 legs 포맷**을 모두 수용한다. QA 종료 후 안전화 하니스를 실게임에서 실행 → 출력 JSON(`window._m5fix.legs` + coordAudit) + 8뷰 캡처 메타를 `judge()`에 투입하면 자동 판정표가 나온다.

## 7. 미완료·인계 (잔여 게이트)
1. **실제 8뷰 촬영**(EARLY/MAIN ARENA/SIDE LEFT/PRIMARY LANDMARK/LATE/EXIT·BOSS 6뷰 미방문) — QA 종료 인계 후.
2. **남측 막힘 전방벽 확정**: 안전화 하니스 실행으로 wallAhead/gameIsW 수집 → INCONCLUSIVE→PASS 승격 판정.
3. **M5 주머니 안→입구 전체 경로**는 여전히 미성립(접근 가능한 경계만 다룸). MAP-020 전체 RETOUCH 유지.
4. SSOT M5 `7000,6900` 좌표 정정은 생산수정 소유자 몫(총괄 소유 문서에 이미 "벽/승인보류" 반영 — 미편집).

## 8. docs 키워드 검색
`CAMERA QA`/`8뷰`/`INCONCLUSIVE`/`충돌불명` rg 검색: M5 전용 수치/스펙 변경 없음(게이트는 신규 검증 도구). 실측 판정(RETOUCH·M5 보류)이 기존 docs 상태와 일치 → 추가 정정 불필요, 총괄/타팀 문서 미편집.
