# MAP OWNER_NEXT 20261002 결과 — 수동입력 관측기(manual-input, 상태쓰기0)

- 팀: Mac MAP / 터미널 3 / 세션 d447a49d / 과제일 2026-10-02
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 선행: MAP-020-M5-PREFLIGHT(안전화 하니스), MAP-M5-EVIDENCE-GATE(증거 게이트) 완료.
- 상태: **구현·소형 fixture 검수 완료(승인 범위 내). 실게임/화면/8뷰 검수는 root 단독 후속 — 이번 시각 PASS 없음.**

## 1. 과제
`m5-walk-harness.safe.js`는 `K[]` 직접쓰기·합성 KeyboardEvent·`P` 좌표 순간배치를 쓴다(SETUP). 이번 후보는 그것들을 **전혀 하지 않고 실제 사용자 입력을 관측만** 하여 현재좌표·전방벽 원식·실이동 표본·취소/정리·포커스손실 경계를 수집해 기존 evidence gate에 전달한다. 원 하니스는 보존, 신규 `manual-input-*`에 구현.

## 2. 산출물(소유 경로만)
`game.html`/easy/index/server/다른 팀/생산/공유문서/`map020-evidence` 원자료·Git 미변경(확인됨). 게임/브라우저/서버/빌드/이미지/청취/권한/새세션/타팀메시지 0.

| 경로 | 내용 | sha256 |
|---|---|---|
| `tools/team-followup-20261001/MAP/manual-input-observer.js` | **수동입력 관측기**(브라우저 클래식 스크립트, 읽기전용) | `83ce70db…` |
| `tools/team-followup-20261001/MAP/manual-input-fixture.cjs` | mock fixture(27항목) | `5528c1ea…` |
| `tools/team-followup-20261001/MAP/manual-input-fixture-output.txt` | fixture 실행 로그(27 PASS/0 FAIL) | — |

## 3. 관측기 안전 계약(원 하니스 대비 변경점)
| 항목 | 원 하니스(safe) | manual-input 관측기 |
|---|---|---|
| 입력 | `K[]=on`+합성 KeyboardEvent 주입 | **주입 없음.** `K[code]`를 읽어 사용자가 실제 누른 상태만 관측 |
| 좌표 | SETUP으로 `P.x/P.y` 1회 배치 | **배치 없음.** `P.x/P.y` 현재좌표를 읽기만 |
| 전방벽 | 타일 분류기 + isW 참고 | **네이티브 원식 `isW(px,py,true)` 호출(읽기)** `gameWallAhead`, 타일은 백업 |
| 리스너 | 없음(주입형) | `keydown/keyup/blur/visibilitychange` **passive:true·비캡처 관측 전용**, preventDefault·`_clearHeldInput` 없음 |
| 정리 | leg finally 키해제+interval | stop()/abort()/오류 finally에서 **리스너 removeEventListener + interval clear** |
| 포커스손실 | 매 틱 게이트 | **blur/hidden에서 현재 leg를 focus-lost로 종료**, 샘플 분절 |
| 상태쓰기 | SETUP(좌표) 있음 | **K/KH/P/G.map/충돌/적/카메라 쓰기 0** |

표본 포맷은 evidence gate와 동일(`{t,x,y,held,wall,wallAhead,gameWallAhead,mapSame}`) → `toGateBundle()`로 바로 투입.

## 4. 소형 fixture 검수 (27 PASS / 0 FAIL, exit 0)
`node tools/team-followup-20261001/MAP/manual-input-fixture.cjs`
| 그룹 | 검증 | 결과 |
|---|---|---|
| F1 | 상태쓰기0: 관측 중 P·K·G.map 미변경, mapUnchanged 보고, 표본 수집 | PASS×5 |
| F2 | stop 후 document/window 리스너 0 + interval 정리 | PASS×3 |
| F3 | 모든 관측 리스너 passive:true·비캡처 | PASS×3 |
| F4 | blur → leg focus-lost 종료 + focusEvents 기록 | PASS×2 |
| F5 | 전방벽 원식: `gameWallAhead`가 네이티브 isW와 정확히 일치, 실이동·held 관측 | PASS×4 |
| F6 | `_abort.abort()` → 관측 중단 + 리스너/interval 정리 + stopReason=external-abort | PASS×4 |
| F7 | evidence gate 연결: 미매핑·미방문8뷰 → PASS 금지(4경계 UNKNOWN), 좌표계약(네이티브 isW) 평가, 매핑 시 등급 산출되나 8뷰 없어 여전히 PASS 금지 | PASS×6 |

### 수행/미수행 구분
- **수행(실행함)**: Node `--check` 구문(2파일 PASS), fixture 27/27 PASS. 전부 가짜 게임 전역을 Node에서 구동한 오프라인 검수.
- **미수행(이번 금지)**: 실게임·브라우저·서버 기동, 실제 사용자 손 입력 관측, 8뷰 촬영, 시각 PASS 판정.

## 5. evidence gate 연결 방법(QA/root용)
1. 실게임 콘솔에서 `const ctl = window._m5manualStart({sampleMs:50})` → 사용자가 직접 보행.
2. 종료 시 `const res = ctl.stop()` (또는 `window._m5manualCtl.stop()`), 필요시 `ctl._abort.abort()`.
3. `const bundle = window._m5manualApi.toGateBundle(res, { boundaryMap:{obs1_S:'A_enter_south',…}, views:[{view:'START',…},…], walkCoverage:['SIDE RIGHT'] })`
4. `judge(bundle)`(m5-evidence-gate.cjs) → 판정표. **미방문 8뷰는 UNKNOWN, 전방벽 원식 미확인은 INCONCLUSIVE** 로 자동 보수화.

## 6. 미완료·인계 (잔여, root 단독 후속)
1. 실제 사용자 손 입력 관측 세션 + 실제 8뷰 촬영(현재 6뷰 미방문) — QA 종료 인계 후 root.
2. 관측 leg를 SSOT 경계(A/B/C/D)에 매핑하는 기준(좌표/방향 자동매핑) 확정 — 현재는 수동 `boundaryMap`.
3. M5 주머니 안→입구 전체 경로는 미성립 유지, MAP-020 전체 RETOUCH 유지.
4. SSOT M5 `7000,6900` 좌표 정정은 생산수정 소유자 몫(총괄 소유 문서에 "벽/보류" 기반영, 미편집).

## 7. docs 키워드 검색
`manual input`/`passive`/`isW`/`CAMERA QA` 등은 신규 도구 영역. M5 수치/스펙 변경 없음 → docs 정정 불필요. 실측·설계 상태(RETOUCH·보류)와 일치. 총괄/타팀 문서 미편집.
