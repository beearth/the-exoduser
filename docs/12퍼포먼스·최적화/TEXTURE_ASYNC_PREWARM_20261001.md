# 텍스처 비동기 프리워밍 — 첫 사용 디코드·업로드 끊김 (PM-001, 2026-10-01)

QA·성능팀 첫 수정. 운영 현황·전체 측정표는 [QA_PERFORMANCE_TEAM_MASTER.md](QA_PERFORMANCE_TEAM_MASTER.md), 기존 목록형 워밍업은 [12퍼포먼스·최적화.md §아틀라스 텍스처 워밍업](12퍼포먼스·최적화.md)과 [COMBAT_TEXTURE_WARMUP_20260929.md](COMBAT_TEXTURE_WARMUP_20260929.md)를 따른다. 이 문서는 그 위에 얹은 **URL 공유 텍스처 + 학습형 비동기 프리워밍**의 계약이다.

## 1. 확인된 문제 (직접 측정)

| 항목 | 측정 |
|---|---|
| 증상 | 스킬·드롭·몬스터 VFX를 **그 세션에서 처음 그리는 프레임**에 게임 전체가 멈춤 |
| 위치 | `_getTex(src)` 캐시 미스 → `GL.texImage2D(..., HTMLImageElement)` |
| 원인 | Chrome은 `texImage2D(Image)` 안에서 PNG/WebP **디코드까지 메인 스레드에서 동기 수행**. 같은 Image를 다시 올려도 다시 디코드(디코드 캐시 없음) |
| 단일 호출 비용 | 2304×2304 PNG 38~79ms / 1536×1024 WebP 27~65ms / 1254×1254 PNG 11~30ms / 1026×1026 PNG 9~18ms (부하에 따라 변동) |
| 전투 첫 20초 합계 | Image 동기 업로드 27~35장, **462 / 518 / 605ms** (수정 전 3회, 1920×1080, 데모 테스트 캐릭터) |
| 같은 프레임 중첩 | 여러 장이 한 프레임에 겹치면 그 프레임 JS가 100~289ms (수정 전 최악 228.7ms, 같은 프레임에 업로드 다수 + `getImageData`) |
| 기존 워밍업이 못 막은 이유 | `_queueCombatTextureWarmup()`은 **열거한 목록**만 올린다. 스킬 VFX Image는 코드 전역에 흩어져 있고(전역 상수, draw 안 지연 생성 `G._vortexImg`, `window._scImgs` 등) 같은 URL을 다른 Image 객체가 또 로드하기도 한다. 텍스처 캐시가 **Image 객체 키(WeakMap)** 라서 부트 프리로드가 만든 객체와 실제 그리는 객체가 다르면 캐시가 맞지 않는다 |

측정에서 기각한 대안:

| 시도 | 결과 |
|---|---|
| `img.decode()` 후 업로드 | 효과 없음 (2304² 44.3ms vs 직접 51.4ms) |
| `createImageBitmap(HTMLImageElement, {premultiplyAlpha:'none'})` | 호출 자체가 메인 스레드를 23~32ms 막음 (동기 디코드) |
| `createImageBitmap(HTMLImageElement)` 기본 옵션 | 메인 스레드 차단 + 픽셀 불일치(프리멀티플라이, 2304² 시트에서 271만 바이트 차이) |
| **`fetch→Blob→createImageBitmap(blob,{premultiplyAlpha:'none'})`** | **메인 스레드 최대 공백 5ms(타이머 하한), 업로드 1.2~6.3ms, HTMLImageElement 업로드와 픽셀 차이 0 바이트** → 채택 |

근거: `tmp/qa-perf-20261001/exp-bitmap.mjs` (5개 에셋 × 업로드 후 `readPixels` 전수 비교).

## 2. 구현 (game.html)

| id | 위치 | 내용 |
|---|---|---|
| `_TEXHOT_KEY` | 전역 상수 | `'hell_texhot_v1'` — localStorage 학습 목록 키 |
| `_TEXHOT_MAX` | 〃 | `96` — 학습 목록 최대 항목(최근 사용순) |
| `_TEXHOT_MIN_PX` | 〃 | `250000` — 이보다 작은 이미지는 기록·공유 등록하지 않음 |
| `_TEXHOT_BUDGET_PX` | 〃 | `64e6` — 프리워밍 총 픽셀 상한(RGBA 약 256MB) |
| `_TEXHOT_INFLIGHT` | 〃 | `2` — 동시 fetch+디코드 수 |
| `_TEXHOT_QMAX` | 〃 | `4` — 업로드 대기 비트맵 상한(디코드 역압) |
| `_TEXHOT_SEED` | 〃 | 기본 시드 22개: `/img/ui/item-cutouts/{armor,axe,belt,boots,bracelet,cape,crossbow,earring,gloves,helmet,necklace,pants,shield,sword}_phys_cutout.png`(1254²) 14개, `/sprites/spike_trap/spike_thorn.png`, `/sprites/spike_trap/vortex.png`, `/assets/vfx/inferno_slam_impact_sheet.png`, `/assets/vfx/giant_slam_impact_sheet.png`, `/img/proj_firedevil_orb.png`, `/img/fieldboss_firedevil_walk_1.png`, `/assets/vfx/lightning_burst_sheet.png`, `/assets/vfx/ground_crack_sheet.png` |
| `_texBySrc` | `_initWebGL` | `Map<절대 URL,{tex,w,h}>`. 컨텍스트마다 새로 생성, context lost에서 `null` |
| `_texAdoptBitmap(abs,bmp)` | `_initWebGL` | ImageBitmap을 LINEAR/CLAMP 텍스처로 업로드 후 `_texBySrc` 등록, `_curTex` 바인딩 복원 |
| `_getTex` 채택 | 캐시 미스 직후 | `!_nearestHint` + `HTMLImageElement` + URL 길이<600 + **크기 일치**일 때 `_texBySrc`의 텍스처를 그 Image의 캐시 항목으로 채택 |
| `_getTex` 동기 업로드 뒤 | 기존 업로드 직후 | 큰 Image(`≥_TEXHOT_MIN_PX`)면 `_texBySrc` 등록(같은 URL의 다른 Image 객체가 **다시 업로드하지 않음**) + `_texHotNote()` |
| `_texHotNote(abs,w,h)` | 전역 | 학습 목록 기록. `http(s)` 아님·작은 이미지·**`/assets/map/` 경로는 제외**(청크가 목록·예산을 잠식) |
| `_texHotLoad/_texHotSave` | 전역 | localStorage 읽기(손상 값은 빈 목록)·쓰기(최근 사용순 96개) |
| `_texPrewarmSrc(rel,px)` / `_texPrePump()` | 전역 | 예산 검사 → `fetch→blob→createImageBitmap(blob,{premultiplyAlpha:'none'})` → `_texPreQ` |
| `_texPrewarmHot()` | `_warmupEnsAtlas()` 첫 줄 | 세션(또는 컨텍스트 복구)마다 1회 학습 목록(최근순) → 시드 순으로 프리워밍. 이후 호출(180프레임 재검사)은 학습 목록 저장만 |
| `_texPreDrain()` | `loop()`의 `_perfFrameTick()` 다음 | 프레임당 1장 업로드. 그 사이 동기 경로가 같은 URL을 올렸으면 비트맵만 닫음 |

### 보장하는 것

1. **무손실** — 프리워밍 텍스처는 Image 업로드와 픽셀 동일(diff 0), 필터·랩 동일. 프리워밍이 아직 안 끝난 이미지는 기존 동기 경로로 즉시 그린다. 화면·판정·수치·몹 수·화질 옵션 변화 없음.
2. **범위** — WebGL2(`_useGL`) 경로 전용. WebGPU opt-in·Canvas2D 폴백·`file://`(fetch 실패 시 조용히 건너뜀)은 기존 동작 그대로.
3. **메모리** — 프리워밍 상한 64MP. 대기 비트맵은 최대 4장, 업로드 즉시 `close()`. 같은 URL 중복 텍스처가 없어져 기존보다 VRAM이 줄어드는 경우도 있다(`_IO_VFX_IMG`와 `_VFX_SHEETS.ice_orb`가 같은 2304² PNG를 각각 올리던 것 등).
4. **세이브 무관** — `hell_texhot_v1`은 성능 힌트 전용. 캐릭터 세이브·설정 키를 읽거나 쓰지 않는다. 지워도 기능 영향 없음(첫 세션 동작으로 돌아감).

### 알려진 한계

- **첫 세션**에는 학습 목록이 없어 시드 22개만 미리 올린다. 시드에 없는 스킬 VFX는 첫 사용 때 한 번 끊기고, 그 URL이 기록돼 다음 세션부터 사라진다.
- 부트 직후 몇 초 안에 쓰는 이미지는 프리워밍이 끝나기 전에 그려질 수 있다(그 경우 기존과 동일).
- 맵 청크(1026², 이동 중 9~18ms씩)와 맵 오브젝트는 이 수정의 대상이 아니다 → 백로그 QA-B02.
- `game-easy-test.html`에는 아직 이식하지 않았다 → 통합팀 전달 사항.

## 3. 검증

| 구분 | 결과 |
|---|---|
| 기계적 효과(직접 측정) | 전투 첫 20초 Image 동기 업로드 합계: 수정 전 **462 / 518 / 605ms** → 수정 후 첫 세션(시드만) **161 / 404ms** → 학습 후 세션 **70 / 55ms**(남은 것은 제외 대상인 맵 청크·바닥). 이어지는 교전(COMBAT2)은 전후 모두 0~68ms |
| 회귀 테스트 | `test/texAsyncPrewarm.test.js` 7건 신규 + 텍스처·워밍업 관련 기존 테스트 포함 **39 PASS / 0 FAIL**. `tools/guard.js` PASS |
| 기존 테스트 보완 | `lightingTextureFreshness`·`lightingCameraCoverage`의 vm 샌드박스에 새 전역 4개 공급(검증 내용 불변). `webglDynamicTexReuse`가 고정한 원문 `_texCache.set(...);return t}`는 그대로 유지 |
| 실화면 | 수정 전후 1920×1080 전투 스크린샷에서 스킬 VFX·드롭·데미지 숫자 정상 표시. pageerror 0, console error 0 |
| 프레임 지표 | p95/p99와 50ms·100ms 초과 빈도는 **실행 간 변동이 커서 개선율을 확정하지 않는다** — 팀 MD §5 표 참조 |
