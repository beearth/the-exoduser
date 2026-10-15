# FDG 일반 맵 실행과 실패 이미지 재시도

2026-10-11. `engine/fdg/runtime.js`의 일반 map 제작 이동과 공통 이미지 수명을 보완한다. 일반 맵의 실제 이동 API를 Studio가 사용할 수 있게 하는 작업이며, 본편 production 장면 인수를 뜻하지 않는다. 기존 sourcePreview/World/terrain/sourceScene/rigScene 소비자·v0.17 완료검사·원 PNG는 재검사하지 않았다.

선행 정본: [런타임 계약](FDG_RUNTIME.md), [엔진 제작 계획](FDG_GAME_DEVELOPMENT_PLAN.md). 맵 가이드와 SSOT 읽기 순서는 앞선 작업에서 읽은 [공통 제작 가이드](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체 및 [_MAP_SSOT_INDEX](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md)를 따른다. 이번 변경은 geometry/원천 nav/START/EXIT/맵 이미지/본편 save/Q/E를 수정하지 않는다.

## 공개 이동 API

| API / 조건 | 값 / 결과 | 실행 위치 |
|---|---|---|
| `setMoveInput(direction)` | 기존 `west/north/south/east` 또는 `null`; boolean | 구현을 유지했다. 방향은 `inputEnabled && running`에서만 수락, `null`은 `clearInput()` |
| 연속 입력의 실제 이동 | 기존 `_update(1/60)`의 `speed×dt` | setter는 현재 actor 위치를 즉시 변경하지 않는다. 기존 keyboard와 같은 원형 발·축별 이동 분할·카메라·owner clock을 소비 |
| `walkMap(direction,{distance=10}={})` | boolean; 실제 이동하면 `true`, 거부/충돌은 `false` | 새로운 공개 일반 map 한걸음 제작 이동 |
| 방향 | `west/north/south/east` 4개 문자열 | 대각·임의 XY·route 입력은 받지 않음 |
| 거리 | 월드 픽셀, 유한 숫자 **0 < distance <= 10** | 기본 **10px**, 한 호출 한걸음. `NaN/Infinity/문자열/0/음수/10초과`는 false |
| 상태 | **`state==='paused'`만** | ready/running/stopped/disposed는 false |
| 소비자 범위 | `_sourcePreview`, `_sourceScene`, `_terrainScene`, `_rigScene` 모두 없음 | 하나라도 존재하면 false. 각 장면의 별도 이동 계약을 호출하지 않음 |
| 출발 / 목표 | 실제 현재 actor에서 `x+dx×distance, y+dy×distance` | 저장된 START를 다시 배치하거나 좌표 설정/teleport/자동route를 호출하지 않음 |
| 발 충돌 | 출발점과 도착점 모두 기존 `isWalkableCircle(map,x,y,radius)` | **1=floor**, **0/2/3=blocked**, 월드 경계 및 원형 발 반경 적용. 일반 map `objects`는 기존 시각 전용 계약 |
| 성공 상태 | actor X/Y와 방향 갱신 | 방향은 요청한 4방향. animation/animationTime·forced animation·입력 상태는 유지 |
| 성공 카메라 | follow=true이면 actor X/Y 추적 후 기존 `_clampCamera()` | follow=false인 수동 카메라는 그대로 유지 |
| 충돌 / 거부 | actor·카메라·clock·자원 변경 없음 | false이면 render/step도 호출하지 않음 |
| 성공 렌더 | 기존 `renderOnce()` 1회 | 시뮬레이션 time/updateSteps/frame/누적시간·skill 비용/쿨다운·resource/입자 age를 증가시키지 않음. render 진단/`onStats`는 기존대로 갱신 |
| 실행 소유 | 기존 runtime | 새 RAF/timer/listener/이미지/Canvas/GPU consumer 없음 |

연속 입력과 한걸음 API는 서로 다른 허용 상태를 갖는다. Play 중에는 `setMoveInput`, 일시정지 일반 map 제작 중에는 `walkMap`을 사용한다. 스킬·자원·입자 시간을 진행해야 하는 기존 `step(seconds)`를 제작 한걸음에 호출하지 않는다.

## 이미지 실패 캐시 계약

| 경로 / 상태 | 실제 동작 |
|---|---|
| `_loadAsset(src)`의 동일 src | 기존 Promise를 공유. ready/loading/error 기록을 바로 반환하며 재시도 루프 없음 |
| `load()` 재호출 | 같은 failed Promise를 반환. 새 Image 자동 생성 없음 |
| **`setProject(project)`** | 기존 `_applyProject`→`pause`→`load`. 프로젝트의 actor/선택/자원/시간 초기화와 paused 상태는 기존 계약 |
| active **error** 기록 | `_applyProject`의 `_retireAssets`에서 제거 후, 이번 `load()`가 **새 Image 1개**를 생성. 동일 src 프로젝트에도 적용 |
| active **ready** 기록 | 이미지/Promise 캐시 공유 유지. 새 Image 요청 없음 |
| active **loading** 기록 | 진행 중인 Image/Promise·타이머 공유 유지. 새 요청/취소 없음 |
| retired src | 기존 삭제/이미지 참조 해제·pending cancel 유지 |
| 다시 실패한 경우 | 그 기록을 유지. 다음 명시 `setProject` 전까지 다시 요청하지 않음 |
| 오류 처리 | 기존 `onError`, src/message 중복 억제, 미준비 이미지 대체 표시 유지 |
| timeout | 기존 **ASSET_TIMEOUT_MS=8000ms** 유지 |
| stale 완료 / cancellation | 기존 settled guard·record identity/activeSources guard·loadVersion/disposed guard 유지 |
| dispose | RAF·리스너·ResizeObserver·pending 타이머/핸들러·이미지 src/cache 정리. 반복 dispose와 이전 callback의 재호출은 새 상태를 복구하지 않음 |

원천 이미지나 실패 URL을 수정하는 기능이 아니다. 요청 실패가 해소된 다음 프로젝트 로드에서 다시 소비할 수 있도록 runtime의 실패 캐시 수명만 조정했다. 이미 정상 디코드된 같은 src의 바이트 갱신/강제 cache bust는 이 변경의 범위가 아니다.

## 새 한정 검사와 소유권

실행: `node --test test/fdgProductionRuntime.test.mjs`. **최초 5/5 PASS, 실패0**. 새로운 synthetic **200×200/T40**, speed156/radius12 캐릭터, fake Image/Canvas/rAF를 사용했다. 원천 장면·원 PNG·본편·완료 v0.17 검사나 기존 전체 suite를 실행하지 않았다.

| 새 검사 | 확인한 실제 runtime 결과 |
|---|---|
| 일반 map 연속 입력 | setter 직후 위치 불변, 실제 6 owner틱/.1초에서 동쪽7.8px 이동 후 원형 발 벽 차단, 시간 .1/업데이트6, 카메라 추적·null 해제·inputDisabled 거부 |
| paused 한걸음 | 현재 actor에서 북10px·서5px, follow 카메라/수동 카메라, 비용·쿨다운·자원·입자·animationTime·owner time/틱/frame/누적시간 보존 |
| 충돌 / 허용 범위 | 0/2/3 벽이 12px 발을 차단. 8px 이동으로 접선까지 허용 후1px 차단. 거리/방향/상태 거부, 장면4종 guard 거부 |
| 실패 재시도 | 첫 Image 오류→동일 src `load()` 추가요청0→동일 src `setProject()`의 새 Image 성공→오류0/paused→다음 setProject의 ready 공유 |
| loading / dispose | 동일 src 프로젝트 교체 중 Image1/Promise 공유, 정상 완료. 별도 pending dispose에서 RAF/listener/observer/assets/타이머/handler 정리 및 이전 성공·오류 callback 무시 |

장면4종 제외 검사는 일반 map 인스턴스에 내부 consumer 존재 sentinel만 주입하여 새 guard를 확인했다. 기존 source/terrain/rig 소비자의 실행·시각·원천 품질 재검사로 표시하지 않는다. fake Image 실패/성공은 새 캐시 분기의 재현 조건이며 실제 HTTP/브라우저 디코드 검수와 구분한다.

| 파일 / 작업 | 소유 범위 |
|---|---|
| 백업 | `tmp/fdg-production-runtime-20261011/runtime.js.before` — 수정 전 runtime 복사, 기존 백업 덮어쓰기 없음 |
| 코드 | `engine/fdg/runtime.js` — walkMap 추가, `_retireAssets` active error 조건만 변경 |
| 새 검사 | `test/fdgProductionRuntime.test.mjs` |
| 정본 | `docs/engine/FDG_PRODUCTION_RUNTIME.md` |
| 병렬 소유 | root의 Studio UI/index/CSS 및 관련 문서 동기화. 이 작업이 해당 파일을 변경하지 않음 |
| Git | stage/commit/push/deploy0, root가 소유 변경을 보존 |

코드 변경 뒤 docs 전체 `rg -l 'walkMap|setMoveInput|isWalkableCircle|asset.*cache|로딩 캐시|실패.*재시도' docs`, literal `grep -r -l 'setMoveInput' docs`, `grep -r -l '로딩 캐시' docs`를 실행했다. 새 API·실패 캐시 수치는 위 표가 정본이다. 기존 FDG_RUNTIME의 API 표에 있던 setProject 상태 유지 문구는 실제 코드의 paused 계약과 충돌하므로 root 문서 동기화에 인계했다. 본편/기존 장면의 값과 과거 검수 결과는 이번 새 검사로 합산하지 않는다.

## MAP PRODUCTION REPORT · 가이드 §23

| 필드 | 이번 작업 |
|---|---|
| STAGE | FDG 일반 map runtime의 한걸음 API·이미지 수명. 새 synthetic200×200 fixture |
| MASTER — silhouette / regions / main route / side spaces | 신규 stage geometry 제작 없음. 기존 production route/공간 인수 미수행 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 변경/새 시각 검사 없음 |
| LARGE — source assets / composites / overlap / repeated silhouette | 원천 PNG/배치 변경0. fake Image로 새 캐시 분기만 확인 |
| MEDIUM — connections / remaining holes | 변경/새 시각 검사 없음 |
| GROUND — shadow / contamination / structure integration | 변경/새 시각 검사 없음 |
| PLAYABLE — main arenas / travel space / breathing space / threat space / combat readability | synthetic floor·원형 발0/2/3벽 차단과 실제 owner tick·paused 한걸음 확인. production 공간/전투 가독성 미검수 |
| LANDMARK — primary / secondary / tertiary | 변경/새 시각 검사 없음 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 실제 stage 카메라 시각 미검수. synthetic follow/수동 카메라의 값만 확인 |
| TECH QA — route | 자동route/BFS 추가0, production START→EXIT 종주0 |
| TECH QA — collision | 새 일반 map 원형 발 차단/접선 검사 PASS. source object/cliff/height 인수0 |
| TECH QA — pageerror / 404 / seam | 브라우저/원천 장면 미실행: NOT_RUN |
| TECH QA — loading | 새 failed/ready/loading/cancel/dispose 분기 PASS; 실제 PNG 재디코드0 |
| TECH QA — performance | 새 owner RAF/timer/listener0. FPS/peak/GPU/실기기 성능 미측정 |
| FILES — stage-owned / concurrent touched / unrelated touched | 위 소유3파일 / root UI 작업 공유 / 본 작업의 타인파일 변경0 |
| GIT — staged / commit / push / deploy | 0 / 0 / 0 / 0; root 보존 |
| VISUAL VERDICT | **RETOUCH — 이번 일반 map 공개 UI의 실제 화면은 아직 미검수**. Node PASS를 visual PASS로 대체하지 않음 |
| NEXT PASS | root가 일반 map 공개 이동 버튼을 새 API에 연결하고 현재 화면에서 한걸음·차단·Play 입력·오류 해소 후 재로드를 검수 |

## Root 공개 UI 후속 인수

위 표의 공개 UI 미관측은 Node 검사 당시 이력이다. 이후 새 v0.18 작업창에서 일반 map 한걸음·실제 Play 해제/pause·한틱·R10 START→restQA→EXIT·조합 저장/재열기를 확인했다. 상세 수치와 VISUAL RETOUCH/production 미인수 경계는 [작업창 정본](FDG_PRODUCTION_WORKSPACE_20261011.md)의 최종 표를 따른다. 실패 cache 재시도는 새 synthetic 검사 범위이며 실제 브라우저 fault injection의 추가 PASS로 승격하지 않는다.
