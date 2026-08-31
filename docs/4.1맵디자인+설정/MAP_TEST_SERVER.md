# 맵 테스트 서버 SSOT

> 루트: `G:\exoduser`
> 목적: 본 게임 서버(3333)와 분리된 35개 맵 전용 QA 허브

## 실행 계약

```powershell
cd G:\exoduser
npm run serve:map
```

| 항목 | 값 | 적용 위치 |
|---|---|---|
| 기본 주소 | `http://127.0.0.1:3334/` | `tools/map-test-server.mjs` |
| 바인딩 | `127.0.0.1` | `MAP_HOST`, 기본 외부 비공개 |
| 실행 Node | `C:\nvm4w\nodejs\node.exe` | `package.json`의 `serve:map` |
| 허브 UI | `map-test.html` | 루트 요청 시 302 |
| 정적/API 코어 | `tools/local-static-server.mjs` | `mapTestMode:true` |
| 캐시 | 서버 `no-store`, iframe `nocache=<timestamp>` | 정적 서버/허브 |
| 맵 범위 | `si 0~34`, 총 35개 | 범위 밖 HTTP 404 |

## 장/스테이지 테이블

| 장 | 이름 | `si` | 구역 수 |
|---:|---|---:|---:|
| 1 | 썩은 숲 | 0~3 | 4 |
| 2 | 벌레굴 | 4~9 | 6 |
| 3 | 지옥의 겨울 | 10~13 | 4 |
| 4 | 고통의 화염지대 | 14~20 | 7 |
| 5 | 지옥의 군단 | 21~25 | 5 |
| 6 | 사도의 마굴 | 26~31 | 6 |
| 7 | 지옥성 | 32~34 | 3 |

## URL 계약

| 입력 | 결과 |
|---|---|
| `/` | `/map-test.html`로 302 |
| `/map-test` | `/map-test.html`로 302 |
| `/map/{si}` | 아래 본편 테스트 URL로 302. 단, si4는 `combatqa=1` 추가 |
| `/map/35` 이상 | HTTP 404 |
| `/map-test.html?stage=3` | 허브에서 1-4 선택 시작 |

```text
/game.html?test=1&testchar=1&stage={si}&classic=1&mapqa=1
/game.html?test=1&testchar=1&stage=4&classic=1&mapqa=1&combatqa=1
```

`classic=1`은 필수다. 특히 `si 0`에서 이를 빼면 1-1 본편 200×200 `_MAP_COMPOSE[0]` 대신 QA 통그림 경로가 열린다. 기본 `mapqa=1`은 맵 관람 전용으로 초기 적·문지기·소환굴·1-1 필드보스를 제거하고 플레이어 무적 프레임을 999999로 두며 스킬 슬롯 발동과 펫 대사를 차단한다. 시작 화톳불 배리어는 모든 map QA에서 제거한다. 이동과 카메라 시뮬레이션은 계속 실행한다.

CH2-1(si4)만 `combatqa=1`을 함께 주면 `_MAP_QA_COMBAT`이 활성화되어 production의 소환굴 11개와 출구 수비대를 유지한다. 플레이어 무적·스킬/펫 대사 차단·시작 배리어 제거는 그대로라서 맵 구조를 안전하게 보면서 몬스터 배치도 확인할 수 있다. 다른 stage에서는 `combatqa=1`을 주어도 무시한다.

## 허브 기능

| 기능 | 정확한 동작 |
|---|---|
| 맵 선택 | 7장 35개 버튼 |
| 미리보기 | 동일 출처 iframe, CSS logical viewport **1920×1080 고정** |
| 표시 배율 | **FIT 기본**, 100%, 75%, 50%; `min(availableWidth/1920, availableHeight/1080)` 단일 uniform scale |
| 리사이즈 | sidebar/브라우저 크기는 바깥 표시 배율만 변경, iframe `innerWidth/innerHeight=1920×1080` 불변 |
| HiDPI 백킹 | `mapqa=1`에서 `ssaa=clamp(devicePixelRatio,1,2)`; DPR 2는 `VW/VH=1920×1080`, `C.width/height=3840×2160`, CSS `1920×1080` | 논리 시야·카메라·오브젝트 크기는 유지하고 물리 픽셀만 2배로 렌더한다. 일반 게임은 1x 유지 |
| 입력 좌표 | iframe transform의 브라우저 역매핑으로 표시 중앙 클릭이 logical `(960,540)`에 도달 |
| 이전/다음 | 버튼 또는 `[` / `]` |
| 재로딩 | 버튼 또는 `R` |
| 몬스터 | CH2-1에서 기본 `몬스터 ON`; 버튼으로 ON/OFF. 다른 stage에서는 비활성 `2-1 전용` |
| 새 창 | 현재 본편 테스트 URL |
| 에디터 | `editor=1&editorStage={si}&test=1` |
| DOM 안전 | 목록은 `createElement` + `replaceChildren`; 부모 `innerHTML` 교체 금지 |

## 포트 변경

```powershell
$env:MAP_PORT=3335
npm run serve:map
```

## 검증

```powershell
& "C:\nvm4w\nodejs\node.exe" --test test\mapTestServer.test.js test\localStaticServerSaveApi.test.js
```

테스트는 루트/직접 경로 리다이렉트, `si 0/4/34`, 범위 밖 404, 35스테이지 데이터, `classic=1&mapqa=1`, 기본 무전투 관람 계약, CH2-1 `combatqa=1`, iframe, DOM 안전, 기존 저장 API를 검증한다. Playwright viewport 검증은 1280×720, 1920×1080, 2560×900 host에서 iframe 1920×1080 불변, X/Y scale 동일, resize 무재로딩, FIT/100/75/50, 중앙 클릭 `(960,540)`을 확인한다. DPR 2 실브라우저 검증은 CH2-1에서 logical `1920×1080`, backing `3840×2160`, CSS `1920×1080`, pageerror/404 0을 확인하며 `tmp/verify_map_test_hidpi.py`와 `captures/map_test_hidpi_20260830/`에 증거를 남긴다. CH2-1 몬스터 미리보기 증거는 `tmp/probe_ch2_monster_runtime.py`와 `captures/ch2_monster_preview_20260830/`다.
