# MAP-020-M5-PREFLIGHT 결과 — M5 보행 경계 검수 후보 안전화

- 팀: Mac MAP / 터미널 3 / 작성 2026-10-01
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 담당 문서: `docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`
- 상태: **담당 산출물·수행 가능한 작은 검증 완료.** 실화면 보행 검수는 **미완료(QA 종료 인계 전 보류)**.

## 1. 수행 범위와 소유 파일(쓰기)
본인 폴더만 작성했다. 공용 `game.html`·마스터/상태판·타 팀 WIP·세이브·`docs_backup…` 미변경. Git·서버(3333/3340)·이미지/유료/인코딩/빌드 미실행.

| 경로 | 내용 |
|---|---|
| `tools/team-followup-20261001/MAP/m5-walk-harness.safe.js` | **안전화된 독립 하니스 사본**(산출 본체). sha256 `a8a0a6ce…` |
| `tools/team-followup-20261001/MAP/mock-harness-check.cjs` | mock 정적/행위 검사(32항목). sha256 `23c8bf65…` |
| `tools/team-followup-20261001/MAP/mock-check-output.txt` | mock 실행 전체 로그(32 PASS/0 FAIL) |
| `tools/team-followup-20261001/MAP/_source-candidate-MAP.js` | 원본 후보 읽기용 사본. sha256 `ee72db6d…`(원본 zip과 동일) |
| `tools/team-followup-20261001/MAP/_source-검증결과.md` | R-input 정적 검증 결과 읽기용 사본 |
| `…/vscode-dispatch/MAP-receipt.json`, `MAP-result.md` | 수신/착수/완료 기록 |

원본 `candidates/MAP.js`·`검증결과.md`·`teams/MAP.md`는 저장소에 평문으로 없고 `r-input-evidence/evidence.zip` 내부에 있어 스크래치패드로 추출해 읽었다.

## 2. 선행 읽기 근거(인수 완료)
- 거버넌스: `AGENTS.md`, `PROJECT_MANAGEMENT_MASTER.md`(§18 등), `MAP-task.md`.
- 맵: 담당 가이드라인 전문, `_MAP_SSOT_INDEX.md`, MAP-020 증거(`map020-evidence/` + `MAP-읽기근거.json`), R-input(`candidates/MAP.js`, `검증결과.md`, `teams/MAP.md`, `before-map-collision.json`).

## 3. 좌표 계약 대조(런타임 coordAudit로 재확인, 읽기 전용)
`before-map-collision.json.coordinateCheck` 및 SSOT(T=40, world 8000², bake→world ×1000/1024)와 하니스 `coordAudit` 출력이 **완전 일치**:

| 해석 | world | tile(tx,ty) | 벽? |
|---|---|---|---|
| 문서 M5 `7000,6900`(월드) | 7000,6900 | 175,172 | **벽** |
| 문서 `7000,6900`(bake→world) | 6835.94,6738.28 | 170,168 | **벽** |
| 검증 접근점 `6660,6140` | 6660,6140 | 166,153 | 비벽 |

**판정**: 문서 M5 `7000,6900`은 월드·베이크 어느 해석으로도 벽 타일이라 보행 진입 좌표로 **오기**. 보행 검수 접근 기준은 검증된 `6660,6140`(비벽)로 인수. SSOT 이력 "M5문서7000,6900은 현재벽이며 주머니 보행 승인보류"와 일치.

## 4. `검증결과.md`(MAP.js) 게이트 → 안전화 반영
| 게이트(원본 결함) | 반영 |
|---|---|
| G1 "읽기 전용 아님": `K[]`직접쓰기·합성키(`:28`), `P`좌표 순간배치(`:52`) | 해당 줄을 `[STATE-CHANGE]/[KEY-INPUT]/[COORD-WRITE]`로 **명시 분류**. SETUP 좌표배치는 "검수 PASS 아님"으로 표기, `approach`가 비벽일 때만 1회 수행(`setupApplied` 기록). |
| G2 외부 취소·finally·오류 시 키 해제 없음 | 모든 leg를 **단일 종료 경로 + try/finally**로 감싸 키 해제+interval 정리 보장. 전역 `window._m5fixAbort`(AbortController)로 외부 취소 지원, 취소 시 남은 leg 미실행. 틱 내부 오류도 정리 후 reject. |
| G3 flatline은 기록만 하고 중단 안 함(`:42`,`:44`) | flatline(Δ<0.5px×5표본) 감지 시 **즉시 leg 종료(STOP)**하도록 구현 정정. 문구도 "기록+중단"으로 일치. |
| (추가) 전제만 있던 포커스/바인드/생존 | **착수 전 게이트로 승격**: stage0·비일시정지·포커스(`hasFocus`/`hidden`)·생존(`hp>0`/`dead`) 미충족 시 `throw`로 착수 거부(상태 변경 전 중단). 커스텀 `BINDS`는 읽어서 방향→코드 치환(바인드 미변경), 없으면 WASD 폴백. leg 도중에도 매 틱 재검사. |

추가 안전화: 원본은 로드 즉시 자동 실행(IIFE)이었으나, 사본은 **자동 실행 제거** — `window._m5fixRun()` 명시 호출 전까지 상태 변경 없음.

## 5. 수행한 작은 검증(실게임 없이)
- **Node `--check` 구문**: `m5-walk-harness.safe.js`, `mock-harness-check.cjs` 모두 PASS(Node v24.15.0, R-input 검증과 동일 버전).
- **mock 행위 검사 32/32 PASS**(명령 `node tools/team-followup-20261001/MAP/mock-harness-check.cjs`, exit 0). 로그: `mock-check-output.txt`.
  - T1 바인드 해석(커스텀 읽기+미변경, WASD 폴백)
  - T2 착수 게이트 5종(일시정지/포커스상실/탭숨김/HP0/stage≠0) → 거부 + 좌표 미변경 + 키 미오염
  - T3 flatline **즉시 STOP** + `blockedAt` 기록(기록만 아님) — G3 정정 검증
  - T4 정상 완료: 6 leg resolve, SETUP 적용, 전 키 해제, **하니스 interval 전부 정리**, 맵 시그니처 불변
  - T5 외부 Abort → `external-abort` STOP + 키 해제 + 남은 leg 미실행 — G2 검증
  - T6 leg 도중 HP0 → `player-dead` STOP + 키 해제 — 생존 게이트
  - T7 leg 도중 blur → `focus-lost` STOP + 키 해제

## 6. 시각 인수 목록(QA 종료 인계 후 실화면에서 판정 — 이번엔 미실행)
MAP-020 전체 **RETOUCH** 상태 유지. 실화면에서 확인할 항목:
1. **원거리 반복 무늬**(뿌리/숲 asset 반복 노출, 동일 asset 즉시 반복) — 가이드 §15·§27 기준.
2. **원거리 shade 사각 절단**(VW/2+80 고정 범위) 해소 여부 — 재검수 이력의 FAIL 항목.
3. **M5 보행 경계**: 접근(`6660,6140`)→남진 차단(~y6304)→입구 북상(~y6137)→동측 개구(~x6746)→곡선 남측벽(~y6223)→이탈. flatline 막힘점이 시각 벽선과 일치하는가.
4. 전투 가독성(§16): 플레이어 실루엣/적/투사체/루팅 가독성 유지.

## 7. 미완료·남은 게이트
- **실화면 보행 검수 미완료**: 하니스는 "실행 준비 완료"가 아니라 "게이트 반영 안전화 후보". 실게임 기동은 **QA 종료 인계 전 보류**(MAP/ART/UIUX/ANIMVFX 공통 규칙).
- 실행 전 확인 필요: 실게임의 `isW`/`P._anim`/`VW/VH` 심볼 노출 여부, 실제 BINDS가 커스텀인지(커스텀이면 하니스가 자동 치환하나 해석 실패 시 WASD 폴백 경고).
- **SSOT M5 좌표 `7000,6900` 정정**은 생산수정 소유 몫. 이번엔 런타임 판정만 제공(해당 오기는 이미 `PROJECT_MANAGEMENT_MASTER.md`·mac-resume 검수 문서에 "벽/승인보류"로 반영돼 있어 추가 정정 불필요, 총괄 소유 문서 미편집).

## 8. docs 키워드 검색 결과
- `7000,6900`·`6660` rg 검색: 좌표 오기 관련 기술은 **총괄 소유 문서**(PROJECT_MANAGEMENT_MASTER §, mac-resume 검수 docs)에 이미 정확히 기재 → 정정 불필요, 미편집.
- 담당 가이드라인에는 M5 수치 좌표가 없음(일반 "side pocket" 서술만) → 수치 정정 대상 없음.

## 9. 인계
다음 작업(실화면 보행/시각 인수)은 소유권 밖(QA 선행)이라 실행하지 않고 인계한다. 총괄이 통합·검수·원격 체크포인트한다.
