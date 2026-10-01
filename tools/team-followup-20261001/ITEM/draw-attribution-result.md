# DRAW-LONG-FRAME-ATTRIBUTION — ITEM 결과

완료: 2026-10-01 14:53:00 UTC. 기존 ITEM 지원 완료 뒤 공식 수신 한 건만 분석했다. 소유 `draw-attribution-*` 외 쓰기와 생산 적용은 없다.

## 결론: 전리품 귀속 미확정, 별도 두 경로의 실제 샘플 확보

| 새 표본 | loop before→after 처치 / items | 주 sampled stack | 경계 clip 추정 |
|---|---|---|---:|
| loop210 draw 55887.400→56001.600ms, 114.200ms | 5→5 / 2→2 | draw → drawP → _physicalImpactSheet → _tintHolyDome → native getImageData | 74표본, 111.029ms |
| loop686 draw 71976→72075ms, 99ms | 9→9 / 5→5 | draw → ch1-living-detail draw → atlas → paint → membrane → native getImageData | 61표본, 91.387ms |

두 구간 모두 `_worldItemSkin`/`_maskWorldDropBlack`/`_itemSkinSrc` 표본 0, rand/RNG 이름 표본 0이다. **실제 호출이 없었다는 증명은 아니다**. 전리품 이미지 생성·decode·마스크 또는 드롭 RNG가 이 두 긴 구간을 유발했다는 근거는 확보되지 않았다. 대신 위 getImageData 하위의 실행 중 샘플이 직접 존재한다. native 함수 표본 시간은 읽기백 대기·네이티브 계산·스케줄링·GPU 동기화 등을 완전 분해하지 않는다. GPU 완료시간/개선율로 해석하지 않는다.

처치/items 전이는 loop169 종료54256.400ms에서 2→4 / 0→1, loop179 종료54647.600ms에서 4→5 / 1→2, loop544 종료67758.400ms에서 8→9 / 4→5였다. 즉 두 장시간 draw 모두 처치/전리품 증가 관측 이후지만 같은 loop에서 증가하지 않았다. items는 관측된 worldItems 개수이며 타입·개별 아이템·이미지 객체·src는 원자료로 식별되지 않는다. 전체 profile에는 `_worldItemSkin` 실행 표본4개가 별도 시각54361.017/67756.698/68327.385/69029.469ms에 있다. 해당 함수의 whole-profile positionTicks 3개와 sample4개를 혼동하지 않았다.

## 시간축·출처

`performance.now ms = (CPU timestamp us − NavigationStart seconds × 1e6) / 1000`.

- NavigationStart=816904.114954s; anchor Timestamp 정렬=34665.821ms. Runtime.evaluate 전후 bracket [34659.600,34670.200]ms 안에 있으며 폭10.600ms다. 이 폭은 명령 bracket이며 정밀도 보장값이 아니다.
- profile start=47677.764ms; profileBefore/After [47673.400,47908.300]ms 안이다. end=75108.919ms, stopMetrics=75151.183ms, NavigationStart 전후 동일. 마지막 sample=75108.425ms, 미표본 tail0.494ms.
- 각 sample의 preceding timeDelta 구간에 endpoint stack을 배정하고 draw 경계에 clip했다. 이는 샘플 추정이지 연속 trace가 아니다. endpoint-only 대안도 JSON에 보존: 첫 getImageData111.243ms / 둘째91.387ms. 둘째 경계에는 `_glFlush` 같은 다음 스택이 일부 포함될 수 있어 정확한 호출별 비용으로 사용하지 않는다.
- URL은 `http://qa-draw-attribution-20261001.localhost:3340/game.html?webgpu=0`, 외부 스크립트는 같은 origin의 `ch1-living-detail.js?v=20260929-87`이다. 함수 시작줄은 0-based→1-based 변환하여 기록: game draw49862, drawP53533, _physicalImpactSheet8539, _tintHolyDome8737, _worldItemSkin26576; 외부 draw331, atlas312, paint173, membrane120. 네이티브/동적 wrapper는 실제 디스크 소스·줄 귀속을 만들어내지 않았다.
- game SHA256=`8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9`: root preflight와 현재 디스크 일치. 외부 현재 소스 SHA256=`e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640`; root 원자료에는 당시 외부 스크립트 hash가 없어 **historical byte 일치 UNKNOWN**이다. source 코드 설명은 현재 소스 기준이다.
- 원자료 4개 SHA256·모든 frame URL/원줄/변환줄·stack node ID·loop 전체 before/after·환경은 `draw-attribution-result.json`에 보존했다. 실제 source hash도 포함한다.

## 발견과 최소수정 후보의 분리

발견: 현재 game은 `_physicalImpactSheet` WeakMap miss일 때 `_tintHolyDome(img,255,255,255)`를 호출하며 이미지 전체 draw/read/alpha변환을 수행한다. 이번 샘플에서 그 하위 native read가 관측됐다. holyDome 스킬 자체를 썼다는 의미는 아니다. 실제 이미지 ID/크기·decode 완료·GPU 대기 원인은 미확정이다.

제안(미구현): 원 VFX 소유자가 **그 동일 이미지 한 장만**, 준비된 로드 이후 렌더 진입 전에 기존 가공함수로 협력적 준비하는 최소 후보를 검토할 수 있다. 실패/취소 시 원 lazy 폴백, 원화·alpha식·WeakMap 계약 유지가 필요하다. 픽셀 동등성·메모리·부트 지연·정상전투 재검수 전 채택하지 않는다. 전스킨 준비, 전역 willReadFrequently, 품질 저하 또는 ITEM ring 수리 반복은 제안하지 않는다.

외부 현재 source에서는 membrane 캐시 miss의 dry 분기에320² getImageData/alpha feather가 있고 atlas가 draw 중 lazy 생성된다. 샘플상 atlas→paint→membrane 호출은 확인됐지만 variant/캐시 키는 기록되지 않았다. local seeded rand가 코드에 있으나 RNG 비용은 별도 샘플로 귀속되지 않으며 인라인 가능성도 있다. 제안(미구현): MAP 소유자가 필요한 동일 variant의 membrane/atlas만 협력적 선행준비하는 후보를 독립 검토하되 실제 variant·source digest·픽셀/메모리 검증이 먼저다. ITEM은 MAP 정책·생산 코드를 수정하지 않았다.

## 재실행·검사·남은 게이트

작업 루트에서 `node tools/team-followup-20261001/ITEM/draw-attribution-analyze.mjs`는 원자료를 읽어 JSON을 stdout에 출력한다(쓰기 없음). `node tools/team-followup-20261001/ITEM/draw-attribution-check.mjs`는 분석2회 및 저장 결과 동일성, clock bracket, source preflight 일치, 표본 트리/개수/범위/clip 예산, 2긴구간·9처치·주스택을 검증했다. PASS, 원자료 hash 동일. 초기 도구 출력의 JSON 크기 제한으로 파싱1회 실패한 뒤 stack을 node ID+frame catalog로 정규화하여 재실행 성공했다. 분석 자체 실패·원자료 손상이 아니며 새 측정은 없었다.

관련 docs 전체 키워드 검색을 `draw-attribution-docs-related.txt`로 저장했다. 총괄18.40·정상자료·아이템 SSOT 및 관련 VFX/QA/MAP source 계약을 대조했다. 공유 SSOT는 쓰기금지로 보존; root 인수 시 이 별도 profile 관측과 남은 한계를 연결하면 된다.

이번은 profiler1ms 요청·loop/update/draw3wrapper·PerformanceObserver가 있는 별도9처치 표본이다. 기존 support/normal-combat 15처치/129.8ms 사건을 대체하거나 같은 사건으로 단정하지 않는다. 오버헤드 미측정, 기존 Chrome profile, cache UNKNOWN; raw warm=true는 cache warm 증명이 아니다. 동기 draw는 wrapper 경과시간으로 GPU완료시간이 아니다. CPU계산/네이티브 대기를 완전 분리하지 못한다.

남은 게이트: root 원자료/분석 독립검수, 외부 당시 source 해시 인수, 각 실제 이미지/variant 식별, 원 담당 최소후보 승인·동등성 검증·별도 성능 재측정. 게임/브라우저/서버/빌드/이미지생성/Git/권한변경/outbound queue/새세션/에이전트 실행0. 생산수정0, 원자료수정0.
