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
| `/map/field` | CH1-1 hell-field rebuild 실험 경로(`/mapqa=1&fieldrebuild=1`)로 302; production layout은 보존 |
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
| 미리보기 | 동일 출처 iframe; logical viewport는 허브 창 innerWidth×innerHeight와 동일 |
| 표시 배율 | FIT 기본, 100%, 75%, 50%; min(availableWidth/innerWidth, availableHeight/innerHeight) uniform scale |
| 리사이즈 | 브라우저 resize 시 iframe logical 크기도 같은 창 크기로 갱신; iframe URL/맵은 재로딩하지 않음 |
| 렌더 해상도 | 일반 게임과 QA 모두 _ssaa=1. 창 크기×OPT.resScale를 짝수 픽셀로 정렬; DPR 추가 배율 없음. DPR2/창1920×1080/100%이면 logical=backing=1920×1080 |
| 입력 좌표 | iframe transform의 브라우저 역매핑으로 표시 중앙 클릭이 logical (innerWidth/2,innerHeight/2)에 도달 |
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

현행 자동검증은 URL/범위/기본 관람 계약과 일반·QA 렌더 일치를 확인한다. 2026-09-24부터 고정1920×1080/QA DPR2x 계약은 폐기했다. tools/qa_map_resolution.py는 일반/QA 창1280×720 DPR1 및 1920×1080 DPR2에서 100%/75% 해상도 비교, 허브1280×720·1920×1080·2560×900 resize와 URL 무재로딩을 검사한다. 과거 tmp/verify_map_test_hidpi.py와 captures/map_test_hidpi_20260830/는 변경 전 이력이다.
