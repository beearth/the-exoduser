# ART — CH1-1 지면 fallback 가드: 원문 실행 확정 + 최소 patch (exec-3b548b06)

**목표:** MILESTONE-CH1-1-PLAYABLE 3행(ART) 길/적/전조 가독성. CH1-1 환경 지면 에셋 consumer의 missing/fallback 가독성 차단을 좁혀 **적용 가능한 최소 source patch** 확정.
**이번 저장:** epoch `rolling-after-3b548b06-1300`(allowNewOwnedFiles=true, ART 크레딧 2, changes 63)에서 **완료·검증된 작업을 영속화**. 검사 재실행 없음 — 원본 stdout 보존. 소유 2파일: `ground-fallback-guard.patch` + `result.md`.

> 공용 game.html/easy 적용·docs·Git은 **root 소유**(본 세션 미적용, productionApplied=false). §15/§16/§23 CAMERA-FIRST 실게임 가독성 VISUAL VERDICT는 **MAP/QA 미인수**. source/대역 실행을 visual·native·GPU PASS로 계산하지 않음.

---

## 1. 선행 Read (필수 맵 가이드/SSOT)
- `_MAP_SSOT_INDEX.md`(360줄) **전체 Read**: CH1-1=si0/stage0, 지면=베이크 청크 production_finish + `gt_03` 미러 타일링 Pass 0.4 레이어. `_FB64`/naturalWidth 지면-fallback 계약 **없음**.
- `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 핵심 절 Read: §13 baked/runtime 분리(floor contamination=baked), §14 baked chunk, §15 CAMERA-FIRST(“ground가 너무 복잡하지 않은가·가독성 유지”), §16 전투 가독성, **§17 TECH≠VISUAL(loading/404 자동검증 PASS≠visual PASS)**. 지면-fallback 계약 없음 재확인.
- 결론: 본 건은 **§17 TECH 계층(loading/404 가드)** 수정이며, 실게임 길/적/전조 가독성 PASS는 §15/§16/§23 CAMERA-FIRST(MAP/QA) 소유로 **미인수 유지**.

## 2. 결함 경계
`buildMapCache` Pass 0.4 (CH1-1 `gt_03` 미러 타일링) + Pass 0.5(맵텍스처). `gt_03` 404 → 로더가 `_FB64`(1×1 투명)로 교체. 가드 `naturalWidth>0`이 1×1을 통과 → `spacingPx:'native'`로 step=`naturalWidth=1` → ① 투명 지면(길 가독성 상실) ② drawImage O(맵픽셀²) 폭주(빌드 행). `_gtFloorImg`는 이미 `naturalWidth>1`로 올바로 거름(선례).
- gt_03(`assets/map/ch1/ground_tile_03.png`, 1024², 실존) → 현재 **잠재(latent)**. 404/에셋 드롭/DEMO·EA 부분동기화 시 활성. Pass 0.5는 `_MAP_TEX_FILES={}`라 dormant(방어적 수정 대상).

## 3. 원문 실행 대조 (하드-formula 아님 — 실제 Pass 0.4 블록 바이트 구동)
- 하니스: repo 밖 scratchpad에서 game.html/game-easy-test.html의 Pass 0.4 블록을 **brace-match로 추출해 그대로 `new Function` 실행**. 대역(stub)=canvas ctx(save/beginPath/rect/clip/drawImage/restore)·map(10×10 all-floor)·T=40·G.stage=0·`_useSoftFloorEdge()=false`·`_GROUND_TILES`/`_GT_STAGE_MAP`. `_FB64` 오류콜백은 결과(naturalWidth=1)로 재현.
- 양쪽 파일 블록 **byte-identical**: blockSha `85b7d6c35547d9a2`.

| 파일 | 조건 | 가드 | 실제 drawImage | 분기 |
|---|---|---|---|---|
| main/easy | healthy nw=1024 | `>0` 현행 | **1** | allReady=true(정상) |
| main/easy | 404→_FB64 nw=1 | `>0` 현행 | **160,000** | allReady=true → spPx=1 폭주 |
| main/easy | 404→_FB64 nw=1 | `>1` 제안 | **0** | allReady=false → Pass skip→소일 폴백 |

- 400×400px(10×10타일)에서 16만 회 → 실제 CH1-1 200×200타일=8000×8000px에서 **약 64,000,000회 = 맵 캐시 빌드 하드 프리즈**. 제안 가드는 healthy 무영향(여전히 1회), 404 시 0회(안전 폴백).

### 보존된 원본 stdout (이전 iteration gf1212, 재실행 안 함)
- `ART-ch1-ground-fallback-guard-gf1212/checks.mjs` 실행: **8 PASS / exit 0** (defect-current-guard-accepts-FB64, defect-current-FB64-draw-explosion(>10M), fix-proposed-guard-rejects-FB64, fix-proposed-skips-explosion, fix-healthy-noop, precedent-gtFloorImg-uses->1, gt03-exists-so-latent, pass05-dormant-maptex-empty).
- 본 iteration scratchpad 원문 실행: 위 표(draws 1 / 160000 / 0), blockSha `85b7d6c35547d9a2`.

## 4. 최소 patch (확정) — `ground-fallback-guard.patch`
2앵커 유니크-문자열 치환(양쪽 파일 공통):
- Pass 0.4: `_GROUND_TILES[tid].naturalWidth>0` → **`>1`**
- Pass 0.5: `..._mapTexImgs[G.stage].complete&&!_useSoftFloorEdge()` → `...&&_mapTexImgs[G.stage].naturalWidth>1&&...`

효과: healthy=no-op / 404→_FB64=가드 실패→Pass skip→`_gtFloorImg` 소일+절차 지면 폴백(§13 baked-ground 일치). **geometry·asset 생성/교체·LOCK 변경 0.**

## 5. 영수증 / 경계
- Node v24.15.0 / 저장 UTC 2026-10-02T13:00Z.
- `game.html` SHA256 `391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2`(이 시점값, root WIP 진행 중). easy 블록 동일성 확인(blockSha 공유).
- `ground-fallback-guard.patch` SHA256 `91f639453301f821de6034b0fe0fc61cf21df2a9bc381e700b4f9059bdd364cf`.
- epoch `rolling-after-3b548b06-1300`, root checkpoint `3b548b06661ed42a483cba9e1c61af5bfa9352bd`(원격 제공, Git 독립조회 0). ART 크레딧 2 사용(이번 2파일). aggregate 한도/root10 예약/Changes80·100 규칙 준수(저장 후 ~65<80).
- MILESTONE SHA `713aa80c…`(전체 Read). `productionApplied=false`, `runtimeAccepted=false`.

## 6. 인계 / 의존성
- **root:** `ground-fallback-guard.patch` 2앵커를 game.html+game-easy-test.html에 순차 반영(공용 source·Git·docs).
- **QA/MAP:** gt_03 일시 404 격리 후보에서 수정 전(투명/행) ↔ 후(소일 폴백) 실제 카메라 길 가독성 §15/§16/§23 VISUAL VERDICT. MILESTONE 6단계 1~2.
- **docs(root):** `docs/4.1맵디자인+설정/` 지면 타일 fallback 계약에 "`_FB64`(1×1) 거부 임계 `naturalWidth>1` 통일" 기록.
