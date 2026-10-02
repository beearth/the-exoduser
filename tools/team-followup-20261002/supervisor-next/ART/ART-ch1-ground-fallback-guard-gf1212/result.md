# ART — CH1-1 길 가독성: 지면 fallback 가드 후보 (gf1212)

**목표:** MILESTONE-CH1-1-PLAYABLE-20261002 **3행(ART)** — "실제 카메라 비교에서 길/적/전조가 읽히는 근거; 임의 geometry·LOCK 변경0".
**한 건:** CH1-1 환경 에셋(지면 타일) consumer 한 경계에서 **길 가독성을 막는 missing/fallback**을 좁혀, 적용 가능한 **최소 source patch 후보**를 제출.
`checks.mjs`로 source 앵커 + 메모리 대조 실행(**8 PASS / exit 0**). game.html 미수정(production=root 소유), 에셋/geometry/LOCK/캐릭터 변경 **0**.

> **문서 무결성:** MILESTONE 전체 Read 완료. 현재 `713aa80c`는 최초 `889fb16f`에서 "회복점검 주체 총괄→작업감독" 한 문구만 변경, **ART 역할 계약 동일**. 동일 hash 오류 재시도 안 함.

---

## 1. 결함 경계 (길 가독성 차단 fallback)

`buildMapCache`의 CH1-1 지면 소비자. CH1-1(stage 0)은 `_GT_STAGE_MAP[0]={tiles:['gt_03'],spacingPx:'native'}`로 `gt_03`(`assets/map/ch1/ground_tile_03.png`, 1024², **실존**)을 깐다.

| 경계 | game.html 앵커(현행) | 문제 |
|---|---|---|
| **Pass 0.4 지면 타일** | `const allReady=...naturalWidth>0` (L25727) + `spPx = native ? src.naturalWidth` (L25730) | `gt_03` 404 → 로더(L25356/25365)가 **`_FB64`(1×1 투명, L25353)** 로 교체. `naturalWidth>0` 가드가 **1×1을 통과** → `spPx=1` → ① **투명 지면 = 길 가독성 상실** ② native-tiling step 1px → **drawImage O(맵픽셀²) 폭주** |
| **Pass 0.5 맵텍스처** | `if(_mapTexImgs[G.stage]&&...complete...)` (L25773) — **size 가드 없음** | 동일 `_FB64` 경로. 현재 `_MAP_TEX_FILES={}`(L25229) 비어 **비활성(dormant)**, 텍스처 추가 시 재활성 |
| **선례(올바름)** | `_gtFloorImg`: `if(im&&im.complete&&im.naturalWidth>1)return im` (L25264) | 이미 **`>1`로 `_FB64`를 올바로 거른다** → 수정은 기존 코드와의 **임계 일관화** |

*(라인번호는 현행 game.html SHA `391155f3…` 기준 — root WIP로 이동 가능, checks.mjs는 내용 앵커로 추적)*

---

## 2. 메모리 대조 실증 (checks.mjs, 8 PASS / exit 0)

대표 CH1-1 맵 120×120 타일(T=40):

| 입력 | 현재 가드(>0) 통과 | 제안 가드(>1) 통과 | spPx | **현재 drawImage 호출** | 제안(skip→소일) |
|---|---|---|---|---|---|
| healthy `gt_03` nw=1024 | ✔ | ✔ | 1024 | 25 | 25 (**no-op**) |
| 404→`_FB64` nw=1 | ✔ (결함) | ✖ (차단) | 1 | **23,040,000** | 0 |

→ 현재 가드는 `_FB64`를 통과시켜 **2,300만 회 drawImage(빌드 행) + 투명 지면**. 제안 `>1`은 healthy 무영향, 결함 시 Pass skip → `_gtFloorImg` 소일+절차적 지면 폴백.

**현재 활성 여부:** `gt_03` 실존 → **잠재(latent)**. 404·에셋 드롭·DEMO/EA 부분동기화 시 활성. Pass 0.5는 `_MAP_TEX_FILES={}`라 현재 비활성.

---

## 3. 최소 적용 후보 (patch — root 반영용. 본 세션 game.html 미수정)

```diff
# game.html  Pass 0.4 지면 타일 준비 가드 (현행 ~L25727)
- const allReady=tiles.every(tid=>_GROUND_TILES[tid]&&_GROUND_TILES[tid].complete&&_GROUND_TILES[tid].naturalWidth>0);
+ const allReady=tiles.every(tid=>_GROUND_TILES[tid]&&_GROUND_TILES[tid].complete&&_GROUND_TILES[tid].naturalWidth>1);

# game.html  Pass 0.5 맵텍스처 오버레이 가드 (현행 ~L25773)  — 방어적(현재 dormant)
- if(_mapTexImgs[G.stage]&&_mapTexImgs[G.stage].complete&&!_useSoftFloorEdge()){
+ if(_mapTexImgs[G.stage]&&_mapTexImgs[G.stage].complete&&_mapTexImgs[G.stage].naturalWidth>1&&!_useSoftFloorEdge()){
```

- **효과:** healthy=no-op / 404→`_FB64`(nw=1)=가드 실패 → Pass 0.4·0.5 skip → `_gtFloorImg(hell)` 소일 + `_paintHellFloorBaseTone`/`_paintHellFloorMarks` 절차적 지면 = **읽히는 설계 지면 유지 + 빌드 행 방지.**
- **범위 준수:** 기존 에셋/절차 폴백만 사용. **geometry·LOCK·팔레트·에셋·캐릭터 변경 0.** 기존 `_gtFloorImg` 임계와 일관.
- 적용은 **공용 source=root 소유** — 본 세션은 후보만 인계(game.html 미수정).

---

## 4. Gate / 경계 (혼동 금지)

| Gate | 상태 |
|---|---|
| source 앵커 + 메모리 대조 (이번) | **PASS** — 결함 재현·수정 대조 8/8, 실근거(§2) |
| 실제 카메라 길/적/전조 가독성 | **미수행(0)** — header/파일 존재·메모리 대조를 **visual PASS로 계산 안 함**. QA 실화면 + MAP route 인계 |
| gt_03 교체/재생성/업스케일 | **안 함** — 기존 에셋 유지, 신규 이미지 0 |

`productionApplied=false`, `runtimeAccepted=false`. 실게임/빌드/대형 에셋 실행은 root 단일 슬롯 대기.

---

## 5. 인계 / 의존성
- **root:** §3 patch를 공용 `game.html`(+`game-easy-test.html` 동일 구조 확인) 순차 반영. docs 동기화·Git은 root.
- **QA:** gt_03를 일시 404 처리한 격리 후보에서 CH1-1 지면이 (수정 전=투명/행 ↔ 수정 후=소일 폴백) 실제 카메라로 길 가독성 확인. MILESTONE 6단계 1~2.
- **MAP:** route/camera 가림과 함께 §23 VISUAL VERDICT.
- **docs:** `docs/4.1맵디자인+설정/` 지면 타일/폴백 계약에 "_FB64(1×1) 거부 임계 `naturalWidth>1` 통일" 기록 권고(root 반영).

---

## 6. 영수증
- Node v24.15.0 / 실행 UTC 2026-10-02T12:15Z / exit 0 / 8 PASS.
- `game.html` SHA256 `391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2` (이 시점값, HEAD 주장 아님; root WIP 진행 중).
- `checks.mjs` SHA256 `bb0664ff2f4dd17da0417478b2d562460168539c32531abf054014b07f62a780`.
- epoch `capacity-after-6a39b828-1212`, root checkpoint `6a39b828dda2332e482888609a81a05dfa2c1458`(원격 제공값, Git 독립조회 0). 역할 예산 1반복·2파일 — 이 저장으로 소진.
- MILESTONE SHA `713aa80c994688820d2eb18ca43377018312ea975f9134968faaefbe77eee7ee`(전체 Read 완료). 이전 cutscene/CHAR_VISUALS 검사 반복 0.
